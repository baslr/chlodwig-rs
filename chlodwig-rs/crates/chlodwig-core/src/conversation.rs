//! Conversation loop — the core agentic engine.
//!
//! Drives the cycle: stream API response → collect tool_use blocks →
//! execute tools → feed results back → repeat until end_turn.

use crate::{
    ContentBlock, Message, PermissionDecision, PermissionPrompter, Role, SystemBlock, Tool,
    ToolContext, ToolDefinition, ToolResultContent,
};
use futures::StreamExt;
use std::collections::HashMap;
use std::pin::Pin;
use tokio::sync::mpsc;

// ── SSE Event types (mirroring the Anthropic streaming API) ────────────

use serde::{Deserialize, Serialize};

/// Raw SSE events from the Anthropic streaming API.
#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum SseEvent {
    MessageStart {
        message: MessageStartInfo,
    },
    ContentBlockStart {
        index: u32,
        content_block: ContentBlockStartInfo,
    },
    ContentBlockDelta {
        index: u32,
        delta: Delta,
    },
    ContentBlockStop {
        index: u32,
    },
    MessageDelta {
        delta: MessageDeltaInfo,
        #[serde(default)]
        usage: Option<UsageInfo>,
    },
    MessageStop,
    Ping,
    Error {
        error: ApiErrorInfo,
    },
}

#[derive(Debug, Clone, Deserialize)]
pub struct MessageStartInfo {
    pub id: String,
    pub model: String,
    #[serde(default)]
    pub usage: Option<UsageInfo>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UsageInfo {
    #[serde(default)]
    pub input_tokens: u32,
    #[serde(default)]
    pub output_tokens: u32,
    #[serde(default)]
    pub cache_creation_input_tokens: Option<u32>,
    #[serde(default)]
    pub cache_read_input_tokens: Option<u32>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ContentBlockStartInfo {
    Text {
        #[serde(default)]
        text: Option<String>,
    },
    ToolUse {
        #[serde(default)]
        id: String,
        #[serde(default)]
        name: String,
    },
    Thinking {
        #[serde(default)]
        thinking: Option<String>,
    },
}

#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum Delta {
    TextDelta { text: String },
    InputJsonDelta { partial_json: String },
    ThinkingDelta { thinking: String },
}

#[derive(Debug, Clone, Deserialize)]
pub struct MessageDeltaInfo {
    #[serde(default)]
    pub stop_reason: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ApiErrorInfo {
    #[serde(default)]
    pub message: String,
    #[serde(rename = "type", default)]
    pub error_type: String,
}

// ── API Request ────────────────────────────────────────────────────────

/// Request body for the Anthropic Messages API.
#[derive(Debug, Clone, Serialize)]
pub struct ApiRequest {
    pub model: String,
    pub messages: Vec<Message>,
    pub system: Vec<SystemBlock>,
    pub tools: Vec<ToolDefinition>,
    pub max_tokens: u32,
    pub stream: bool,
}

// ── API Client Trait ───────────────────────────────────────────────────

pub type SseStream = Pin<Box<dyn futures::Stream<Item = Result<(String, SseEvent), ApiError>> + Send>>;

/// Abstract API client — implemented by AnthropicClient, mockable in tests.
#[async_trait::async_trait]
pub trait ApiClient: Send + Sync {
    async fn stream_message(&self, request: ApiRequest) -> Result<SseStream, ApiError>;
}

#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error("HTTP {status}: {body}")]
    HttpError { status: u16, body: String },

    #[error("Rate limited, retry after {retry_after_ms}ms")]
    RateLimited { retry_after_ms: u64 },

    #[error("SSE parse error: {0}")]
    SseParseError(String),

    #[error("Connection error: {0}")]
    Connection(String),

    #[error("Overloaded: {0}")]
    Overloaded(String),
}

// ── Conversation Events (emitted to UI) ────────────────────────────────

/// Events emitted by the conversation loop for the UI layer.
#[derive(Debug, Clone)]
pub enum ConversationEvent {
    /// Incremental text from the assistant.
    TextDelta(String),
    /// A complete text block finished.
    TextComplete(String),
    /// The model wants to use a tool.
    ToolUseStart {
        id: String,
        name: String,
        input: serde_json::Value,
    },
    /// Tool execution completed.
    ToolResult {
        id: String,
        output: ToolResultContent,
        is_error: bool,
    },
    /// Thinking block delta.
    ThinkingDelta(String),
    /// Thinking block complete.
    ThinkingComplete(String),
    /// The assistant turn is fully done (no more tool calls).
    TurnComplete,
    /// An error occurred.
    Error(String),
    /// Usage information from the API.
    Usage {
        input_tokens: u32,
        output_tokens: u32,
    },
    /// An HTTP API request was made.
    ApiRequestMade,
    /// Raw HTTP request body was sent to the API.
    HttpRequestSent {
        body_json: String,
        timestamp: String,
    },
    /// HTTP response metadata from MessageStart.
    HttpResponseMeta {
        model: String,
        input_tokens: u32,
        output_tokens: u32,
    },
    /// HTTP response stream completed.
    HttpResponseComplete {
        duration_ms: u64,
    },
    /// Raw SSE data line from the API response.
    SseRawChunk(String),
    /// Compaction has started.
    CompactionStarted,
    /// Compaction completed successfully.
    CompactionComplete {
        old_messages: usize,
        summary_tokens: u32,
    },
    /// A sub-agent was spawned.
    SubAgentStarted {
        id: String,
        task: String,
    },
    /// Progress update from a running sub-agent.
    SubAgentProgress {
        id: String,
        text: String,
    },
    /// A sub-agent completed its task.
    SubAgentComplete {
        id: String,
        result: String,
    },
}

// ── Conversation State ─────────────────────────────────────────────────

pub struct ConversationState {
    pub messages: Vec<Message>,
    pub model: String,
    pub system_prompt: Vec<SystemBlock>,
    pub max_tokens: u32,
    pub tools: Vec<Box<dyn Tool>>,
    pub tool_context: ToolContext,
}

// ── Conversation Loop Error ────────────────────────────────────────────

#[derive(Debug, thiserror::Error)]
pub enum ConversationLoopError {
    #[error("API error: {0}")]
    Api(#[from] ApiError),

    #[error("Unknown tool: {0}")]
    UnknownTool(String),

    #[error("Event channel closed")]
    ChannelClosed,
}

// ── Internal helpers ───────────────────────────────────────────────────

struct PendingToolUse {
    id: String,
    name: String,
    input: serde_json::Value,
}

/// Build an API request from the current conversation state.
pub fn build_request(state: &ConversationState) -> ApiRequest {
    ApiRequest {
        model: state.model.clone(),
        messages: state.messages.clone(),
        system: state.system_prompt.clone(),
        tools: state.tools.iter().map(|t| t.definition()).collect(),
        max_tokens: state.max_tokens,
        stream: true,
    }
}

// ── The Core Conversation Loop ─────────────────────────────────────────

/// The compaction system prompt (from the original Claude Code JS implementation).
const COMPACT_SYSTEM_PROMPT: &str = "You are a helpful AI assistant tasked with summarizing conversations.";

/// The compaction user prompt (adapted from the original Claude Code JS implementation).
const COMPACT_USER_PROMPT: &str = r#"CRITICAL: Respond with TEXT ONLY. Do NOT call any tools.

- Do NOT use Read, Bash, Grep, Glob, Edit, Write, or ANY other tool.
- You already have all the context you need in the conversation above.
- Tool calls will be REJECTED and will waste your only turn — you will fail the task.
- Your entire response must be plain text: an <analysis> block followed by a <summary> block.

Your task is to create a detailed summary of the conversation so far, paying close attention to the user's explicit requests and your previous actions.
This summary should be thorough in capturing technical details, code patterns, and architectural decisions that would be essential for continuing development work without losing context.

Before providing your final summary, wrap your analysis in <analysis> tags to organize your thoughts and ensure you've covered all necessary points. In your analysis process:

1. Chronologically analyze each message and section of the conversation. For each section thoroughly identify:
   - The user's explicit requests and intents
   - Your approach to addressing the user's requests
   - Key decisions, technical concepts and code patterns
   - Specific details like:
     - file names
     - full code snippets
     - function signatures
     - file edits
   - Errors that you ran into and how you fixed them
   - Pay special attention to specific user feedback that you received, especially if the user told you to do something differently.
2. Double-check for technical accuracy and completeness, addressing each required element thoroughly.

Your summary should include the following sections:

1. Primary Request and Intent: Capture all of the user's explicit requests and intents in detail
2. Key Technical Concepts: List all important technical concepts, technologies, and frameworks discussed.
3. Files and Code Sections: Enumerate specific files and code sections examined, modified, or created. Pay special attention to the most recent messages and include full code snippets where applicable and include a summary of why this file read or edit is important.
4. Errors and fixes: List all errors that you ran into, and how you fixed them. Pay special attention to specific user feedback that you received, especially if the user told you to do something differently.
5. Problem Solving: Document problems solved and any ongoing troubleshooting efforts.
6. All user messages: List ALL user messages that are not tool results. These are critical for understanding the users' feedback and changing intent.
7. Pending Tasks: Outline any pending tasks that you have explicitly been asked to work on.
8. Current Work: Describe in detail precisely what was being worked on immediately before this summary request, paying special attention to the most recent messages from both user and assistant. Include file names and code snippets where applicable.
9. Optional Next Step: List the next step that you will take that is related to the most recent work you were doing. IMPORTANT: ensure that this step is DIRECTLY in line with the user's most recent explicit requests, and the task you were working on immediately before this summary request. If your last task was concluded, then only list next steps if they are explicitly in line with the users request. Do not start on tangential requests or really old requests that were already completed without confirming with the user first.

Please provide your summary based on the conversation so far, following this structure and ensuring precision and thoroughness in your response.

REMINDER: Do NOT call any tools. Respond with plain text only — an <analysis> block followed by a <summary> block. Tool calls will be rejected and you will fail the task."#;

/// The auto-compact threshold in input tokens.
/// Original JS: effectiveWindow(200k) - maxOutputTokens(20k) - buffer(13k) = 167k
pub const AUTO_COMPACT_THRESHOLD: u64 = 160_000;

/// Strip `<analysis>` tags and unwrap `<summary>` tags from the compaction response.
fn format_summary(text: &str) -> String {
    // Remove <analysis>...</analysis>
    let re_analysis = regex::Regex::new(r"(?s)<analysis>.*?</analysis>").unwrap();
    let result = re_analysis.replace(text, "").to_string();

    // Unwrap <summary>...</summary> → "Summary:\n{content}"
    let re_summary = regex::Regex::new(r"(?s)<summary>(.*?)</summary>").unwrap();
    let result = if let Some(caps) = re_summary.captures(&result) {
        let content = caps.get(1).map_or("", |m| m.as_str()).trim();
        re_summary.replace(&result, &format!("Summary:\n{content}")).to_string()
    } else {
        result
    };

    // Collapse multiple blank lines
    let re_blanks = regex::Regex::new(r"\n\n+").unwrap();
    re_blanks.replace_all(result.trim(), "\n\n").to_string()
}

/// Compact the conversation history by summarizing it via the API.
///
/// Replaces `state.messages` with a summary user message + acknowledgement.
/// Emits `CompactionStarted` and `CompactionComplete` events.
pub async fn compact_conversation(
    state: &mut ConversationState,
    api_client: &dyn ApiClient,
    event_tx: &mpsc::UnboundedSender<ConversationEvent>,
    custom_instructions: Option<&str>,
) -> Result<(), ConversationLoopError> {
    let old_message_count = state.messages.len();
    if old_message_count < 2 {
        let _ = event_tx.send(ConversationEvent::Error(
            "Not enough messages to compact.".into(),
        ));
        return Ok(());
    }

    let _ = event_tx.send(ConversationEvent::CompactionStarted);

    // Build the compaction prompt
    let mut compaction_prompt = COMPACT_USER_PROMPT.to_string();
    if let Some(instructions) = custom_instructions {
        compaction_prompt.push_str(&format!(
            "\n\nAdditional Instructions:\n{instructions}"
        ));
        compaction_prompt.push_str(
            "\n\nREMINDER: Do NOT call any tools. Respond with plain text only — an <analysis> block followed by a <summary> block. Tool calls will be rejected and you will fail the task."
        );
    }

    // Build the messages for the compaction call:
    // All current messages + a user prompt asking for summary
    let mut compaction_messages = state.messages.clone();

    // Strip image content blocks (replace with placeholders) like the JS does
    for msg in &mut compaction_messages {
        for block in &mut msg.content {
            if let ContentBlock::Image { .. } = block {
                *block = ContentBlock::Text {
                    text: "[image]".into(),
                };
            }
        }
    }

    compaction_messages.push(Message {
        role: Role::User,
        content: vec![ContentBlock::Text {
            text: compaction_prompt,
        }],
    });

    // Build a special API request: no tools, small max_tokens, compaction system prompt
    let request = ApiRequest {
        model: state.model.clone(),
        messages: compaction_messages,
        system: vec![SystemBlock::text(COMPACT_SYSTEM_PROMPT)],
        tools: Vec::new(),
        max_tokens: 8192,
        stream: true,
    };

    // Stream the compaction response (with retry for transient errors)
    let mut stream = retry_stream(api_client, request, event_tx).await?;
    let _ = event_tx.send(ConversationEvent::ApiRequestMade);
    let mut summary_text = String::new();
    let mut summary_tokens: u32 = 0;

    while let Some(result) = stream.next().await {
        let (_raw, event) = result?;
        match event {
            SseEvent::ContentBlockDelta {
                delta: Delta::TextDelta { text },
                ..
            } => {
                summary_text.push_str(&text);
                let _ = event_tx.send(ConversationEvent::TextDelta(text));
            }
            SseEvent::MessageStart { message } => {
                if let Some(usage) = message.usage {
                    summary_tokens = usage.input_tokens;
                }
            }
            SseEvent::MessageDelta { usage, .. } => {
                if let Some(usage) = usage {
                    summary_tokens += usage.output_tokens;
                }
            }
            _ => {}
        }
    }

    // Format the summary (strip <analysis>, unwrap <summary>)
    let formatted_summary = format_summary(&summary_text);

    // Build the continuation message (matching JS UH_ function)
    let summary_message = format!(
        "This session is being continued from a previous conversation that ran out of context. \
         The summary below covers the earlier portion of the conversation.\n\n\
         {formatted_summary}\n\n\
         Continue the conversation from where it left off without asking the user any further questions. \
         Resume directly — do not acknowledge the summary, do not recap what was happening, \
         do not preface with \"I'll continue\" or similar. Pick up the last task as if the break never happened."
    );

    // Replace messages with compacted version
    state.messages = vec![
        Message {
            role: Role::User,
            content: vec![ContentBlock::Text {
                text: summary_message,
            }],
        },
        Message {
            role: Role::Assistant,
            content: vec![ContentBlock::Text {
                text: "I have the full context from our conversation. Let me continue where we left off.".into(),
            }],
        },
    ];

    let _ = event_tx.send(ConversationEvent::TextComplete(
        format!("[Compacted {} messages into summary]", old_message_count),
    ));

    let _ = event_tx.send(ConversationEvent::CompactionComplete {
        old_messages: old_message_count,
        summary_tokens,
    });

    Ok(())
}

/// Maximum number of retries for transient API errors.
const MAX_RETRIES: u32 = 3;

/// Retry wrapper for API stream calls. Handles 429 (rate limited) and 529 (overloaded).
async fn retry_stream(
    api_client: &dyn ApiClient,
    request: ApiRequest,
    event_tx: &mpsc::UnboundedSender<ConversationEvent>,
) -> Result<SseStream, ConversationLoopError> {
    let mut attempt = 0;
    loop {
        match api_client.stream_message(request.clone()).await {
            Ok(stream) => return Ok(stream),
            Err(ApiError::RateLimited { retry_after_ms }) if attempt < MAX_RETRIES => {
                let _ = event_tx.send(ConversationEvent::Error(format!(
                    "Rate limited, retrying in {}s... (attempt {}/{})",
                    retry_after_ms / 1000,
                    attempt + 1,
                    MAX_RETRIES,
                )));
                tokio::time::sleep(std::time::Duration::from_millis(retry_after_ms)).await;
                attempt += 1;
            }
            Err(ApiError::Overloaded(_)) if attempt < MAX_RETRIES => {
                let backoff = std::time::Duration::from_secs(2u64.pow(attempt));
                let _ = event_tx.send(ConversationEvent::Error(format!(
                    "API overloaded, retrying in {}s... (attempt {}/{})",
                    backoff.as_secs(),
                    attempt + 1,
                    MAX_RETRIES,
                )));
                tokio::time::sleep(backoff).await;
                attempt += 1;
            }
            Err(e) => return Err(e.into()),
        }
    }
}

/// Drives a single assistant "turn" which may involve multiple API calls
/// if the model uses tools. Emits events via `event_tx` for the UI.
pub async fn run_turn(
    state: &mut ConversationState,
    api_client: &dyn ApiClient,
    permission: &dyn PermissionPrompter,
    event_tx: &mpsc::UnboundedSender<ConversationEvent>,
) -> Result<(), ConversationLoopError> {
    loop {
        // 1. Build request from current state
        let request = build_request(state);

        // Emit raw request for the Requests tab
        let request_json = serde_json::to_string_pretty(&request).unwrap_or_default();
        let timestamp = chrono::Local::now().format("%Y-%m-%d %H:%M:%S%.3f").to_string();
        let _ = event_tx.send(ConversationEvent::HttpRequestSent {
            body_json: request_json,
            timestamp,
        });
        let request_start = std::time::Instant::now();

        // 2. Stream the response (with retry for transient errors)
        let mut stream = retry_stream(api_client, request, event_tx).await?;
        let _ = event_tx.send(ConversationEvent::ApiRequestMade);

        let mut assistant_blocks: Vec<ContentBlock> = Vec::new();
        let mut tool_uses: Vec<PendingToolUse> = Vec::new();

        // Per-index accumulators so interleaved blocks work correctly
        enum BlockAcc {
            Text(String),
            ToolUse { id: String, name: String, json: String },
            Thinking(String),
        }
        let mut blocks: HashMap<u32, BlockAcc> = HashMap::new();

        // ── Typewriter: char buffer + adaptive ticker ──────────────────
        // Instead of blocking stream.next() with sleep loops, we use
        // tokio::select! to concurrently read SSE events AND tick chars
        // out of a buffer. This decouples network jitter from display rate.
        let mut char_buffer: std::collections::VecDeque<char> = std::collections::VecDeque::new();
        /// Maximum per-char sleep: 50ms (prevents painfully slow trickle)
        const MAX_CHAR_INTERVAL: std::time::Duration = std::time::Duration::from_millis(50);
        // Average chars-per-second from SSE stream (smoothed)
        let mut avg_chars_per_sec: f64 = 0.0;
        let mut total_chars_received: u64 = 0;
        let mut first_char_at: Option<std::time::Instant> = None;
        let mut stream_done = false;

        loop {
            // Compute tick interval based on buffer fill and stream rate.
            // Goal: drain the buffer at roughly the rate chars arrive,
            // so the buffer stays small but never empty (smooth output).
            let tick_interval = if char_buffer.is_empty() {
                // Nothing to send — wait a long time (select! will wake us on SSE)
                std::time::Duration::from_millis(500)
            } else if avg_chars_per_sec > 0.0 {
                // We know the stream rate. Target: drain at stream rate,
                // but speed up if buffer is growing (>20 chars buffered).
                let buf_len = char_buffer.len() as f64;
                // Base interval from stream rate
                let base = 1.0 / avg_chars_per_sec;
                // Speed up when buffer is large: for every 10 chars over 10,
                // halve the interval. This prevents backlog accumulation.
                let speedup = if buf_len > 10.0 {
                    (1.0_f64).max(buf_len / 10.0)
                } else {
                    1.0
                };
                let secs = (base / speedup).min(MAX_CHAR_INTERVAL.as_secs_f64());
                std::time::Duration::from_secs_f64(secs.max(0.0001)) // floor at 0.1ms
            } else {
                // No rate estimate yet — tick fast to avoid visible stall
                std::time::Duration::from_millis(5)
            };

            if stream_done && char_buffer.is_empty() {
                break;
            }

            tokio::select! {
                // Branch 1: read next SSE event (only if stream not done)
                result = stream.next(), if !stream_done => {
                    let Some(result) = result else {
                        // Stream ended — flush remaining chars
                        stream_done = true;
                        continue;
                    };
                    let (raw_data, event) = match result {
                        Ok(pair) => pair,
                        Err(ApiError::SseParseError(msg)) => {
                            tracing::warn!("Skipping malformed SSE event: {msg}");
                            continue;
                        }
                        Err(e) => return Err(ConversationLoopError::Api(e)),
                    };
                    let _ = event_tx.send(ConversationEvent::SseRawChunk(raw_data));
                    match event {
                        SseEvent::MessageStart { message } => {
                            let _ = event_tx.send(ConversationEvent::HttpResponseMeta {
                                model: message.model.clone(),
                                input_tokens: message.usage.as_ref().map(|u| u.input_tokens).unwrap_or(0),
                                output_tokens: message.usage.as_ref().map(|u| u.output_tokens).unwrap_or(0),
                            });
                            if let Some(usage) = message.usage {
                                let _ = event_tx.send(ConversationEvent::Usage {
                                    input_tokens: usage.input_tokens,
                                    output_tokens: usage.output_tokens,
                                });
                            }
                        }

                        SseEvent::ContentBlockStart { index, content_block } => {
                            tracing::debug!("ContentBlockStart[{}]: {:?}", index, content_block);
                            match content_block {
                                ContentBlockStartInfo::Text { .. } => {
                                    blocks.insert(index, BlockAcc::Text(String::new()));
                                }
                                ContentBlockStartInfo::ToolUse { id, name } => {
                                    // Don't send ToolUseStart here — the JSON input hasn't
                                    // arrived yet (comes via InputJsonDelta events).
                                    // The complete ToolUseStart is sent at ContentBlockStop
                                    // once the full input has been accumulated.
                                    blocks.insert(index, BlockAcc::ToolUse { id, name, json: String::new() });
                                }
                                ContentBlockStartInfo::Thinking { .. } => {
                                    blocks.insert(index, BlockAcc::Thinking(String::new()));
                                }
                            }
                        }

                        SseEvent::ContentBlockDelta { index, delta } => {
                            match delta {
                                Delta::TextDelta { text } => {
                                    if let Some(BlockAcc::Text(buf)) = blocks.get_mut(&index) {
                                        buf.push_str(&text);
                                    }

                                    // Push chars into the buffer for the ticker to drain
                                    let now = std::time::Instant::now();
                                    let n = text.chars().count() as u64;
                                    if n > 0 {
                                        for ch in text.chars() {
                                            char_buffer.push_back(ch);
                                        }
                                        total_chars_received += n;
                                        if first_char_at.is_none() {
                                            first_char_at = Some(now);
                                        }
                                        // Update running average: total chars / total time
                                        if let Some(first) = first_char_at {
                                            let elapsed = now.duration_since(first).as_secs_f64();
                                            if elapsed > 0.01 {
                                                avg_chars_per_sec = total_chars_received as f64 / elapsed;
                                            }
                                        }
                                    }
                                }
                                Delta::InputJsonDelta { partial_json } => {
                                    if let Some(BlockAcc::ToolUse { json, .. }) = blocks.get_mut(&index) {
                                        json.push_str(&partial_json);
                                    }
                                }
                                Delta::ThinkingDelta { thinking } => {
                                    if let Some(BlockAcc::Thinking(buf)) = blocks.get_mut(&index) {
                                        buf.push_str(&thinking);
                                    }
                                    let _ = event_tx.send(ConversationEvent::ThinkingDelta(thinking));
                                }
                            }
                        }

                        SseEvent::ContentBlockStop { index } => {
                            if let Some(acc) = blocks.remove(&index) {
                                match acc {
                                    BlockAcc::Text(text) => {
                                        // Flush remaining chars from this block immediately
                                        // before sending TextComplete
                                        while let Some(ch) = char_buffer.pop_front() {
                                            let mut s = String::with_capacity(ch.len_utf8());
                                            s.push(ch);
                                            let _ = event_tx.send(ConversationEvent::TextDelta(s));
                                        }
                                        let _ = event_tx.send(ConversationEvent::TextComplete(text.clone()));
                                        assistant_blocks.push(ContentBlock::Text { text });
                                    }
                                    BlockAcc::ToolUse { id, name, json } => {
                                        let input: serde_json::Value =
                                            serde_json::from_str(&json).unwrap_or_default();

                                        tracing::debug!("ToolUse complete[{}]: id={}, name={}, input={}", index, id, name, input);

                                        if !name.is_empty() {
                                            let _ = event_tx.send(ConversationEvent::ToolUseStart {
                                                id: id.clone(),
                                                name: name.clone(),
                                                input: input.clone(),
                                            });
                                        }

                                        assistant_blocks.push(ContentBlock::ToolUse {
                                            id: id.clone(),
                                            name: name.clone(),
                                            input: input.clone(),
                                        });
                                        tool_uses.push(PendingToolUse { id, name, input });
                                    }
                                    BlockAcc::Thinking(thinking) => {
                                        let _ = event_tx.send(ConversationEvent::ThinkingComplete(thinking.clone()));
                                        assistant_blocks.push(ContentBlock::Thinking { thinking });
                                    }
                                }
                            }
                        }

                        SseEvent::MessageDelta { delta, usage } => {
                            if let Some(usage) = usage {
                                let _ = event_tx.send(ConversationEvent::Usage {
                                    input_tokens: usage.input_tokens,
                                    output_tokens: usage.output_tokens,
                                });
                            }
                            let _ = delta; // stop_reason is implicit from tool_uses
                        }

                        SseEvent::MessageStop => {
                            let _ = event_tx.send(ConversationEvent::HttpResponseComplete {
                                duration_ms: request_start.elapsed().as_millis() as u64,
                            });
                            stream_done = true;
                        }
                        SseEvent::Ping => {}

                        SseEvent::Error { error } => {
                            let _ = event_tx.send(ConversationEvent::Error(format!(
                                "{}: {}",
                                error.error_type, error.message
                            )));
                            return Err(ConversationLoopError::Api(ApiError::HttpError {
                                status: 0,
                                body: error.message,
                            }));
                        }
                    }
                }

                // Branch 2: tick a char out of the buffer
                _ = tokio::time::sleep(tick_interval), if !char_buffer.is_empty() => {
                    if let Some(ch) = char_buffer.pop_front() {
                        let mut s = String::with_capacity(ch.len_utf8());
                        s.push(ch);
                        let _ = event_tx.send(ConversationEvent::TextDelta(s));
                    }
                }
            }
        }

        // 3. Push the assistant message to conversation history
        state.messages.push(Message {
            role: Role::Assistant,
            content: assistant_blocks,
        });

        // 4. If no tool uses → turn is done
        // Filter out any tool uses with empty names (can happen with interleaved streams)
        tool_uses.retain(|t| !t.name.is_empty());
        if tool_uses.is_empty() {
            let _ = event_tx.send(ConversationEvent::TurnComplete);
            return Ok(());
        }

        // 5. Execute tools
        let mut tool_results: Vec<ContentBlock> = Vec::new();

        // Partition into concurrent and sequential
        let (concurrent, sequential): (Vec<_>, Vec<_>) =
            tool_uses.into_iter().partition(|pending| {
                state
                    .tools
                    .iter()
                    .find(|t| t.definition().name == pending.name)
                    .map(|t| t.is_concurrent())
                    .unwrap_or(false)
            });

        // Run concurrent tools in parallel
        if !concurrent.is_empty() {
            let results = futures::future::join_all(concurrent.into_iter().map(|pending| {
                execute_tool_with_permission(pending, &state.tools, &state.tool_context, permission, event_tx)
            }))
            .await;

            for result in results {
                tool_results.push(result?);
            }
        }

        // Run sequential tools one by one
        for pending in sequential {
            let result = execute_tool_with_permission(
                pending,
                &state.tools,
                &state.tool_context,
                permission,
                event_tx,
            )
            .await?;
            tool_results.push(result);
        }

        // 6. Push user message with tool results → loop back
        state.messages.push(Message {
            role: Role::User,
            content: tool_results,
        });
    }
}

/// Translate a hallucinated/unknown tool name into an equivalent shell command.
/// Returns `Some(command_string)` if a known mapping exists, `None` otherwise.
fn translate_unknown_tool(tool_name: &str, input: &serde_json::Value) -> Option<String> {
    match tool_name {
        // Models sometimes hallucinate alternative names for ListDir
        // (the real ListDir tool handles "ListDir" itself, but these variants slip through)
        "list_dir" | "list_directory" | "ListDirectory" => {
            let path = input
                .get("path")
                .and_then(|v| v.as_str())
                .unwrap_or(".");
            Some(format!("ls -la {}", shell_escape(path)))
        }
        _ => None,
    }
}

/// Minimal shell escaping: wrap in single quotes, escape existing single quotes.
fn shell_escape(s: &str) -> String {
    if s.chars().all(|c| c.is_alphanumeric() || c == '/' || c == '.' || c == '_' || c == '-') {
        s.to_string()
    } else {
        format!("'{}'", s.replace('\'', "'\\''"))
    }
}

/// Execute a single tool with permission check.
async fn execute_tool_with_permission(
    pending: PendingToolUse,
    tools: &[Box<dyn Tool>],
    tool_context: &ToolContext,
    permission: &dyn PermissionPrompter,
    event_tx: &mpsc::UnboundedSender<ConversationEvent>,
) -> Result<ContentBlock, ConversationLoopError> {
    // Permission check
    let decision = permission
        .request_permission(&pending.name, &pending.input)
        .await;

    if decision == PermissionDecision::Deny {
        let output = ToolResultContent::Text("Permission denied by user".into());
        let _ = event_tx.send(ConversationEvent::ToolResult {
            id: pending.id.clone(),
            output: output.clone(),
            is_error: true,
        });
        return Ok(ContentBlock::ToolResult {
            tool_use_id: pending.id,
            content: output,
            is_error: Some(true),
        });
    }

    // Find the tool
    let tool = match tools.iter().find(|t| t.definition().name == pending.name) {
        Some(t) => t,
        None => {
            // Check for known tool aliases that can be translated to existing tools.
            // The model sometimes hallucinate tool names like "ListDir" — instead of
            // returning an error (which wastes an API roundtrip), we translate them
            // to equivalent Bash commands.
            if let Some(fallback) = translate_unknown_tool(&pending.name, &pending.input) {
                if let Some(bash_tool) = tools.iter().find(|t| t.definition().name == "Bash") {
                    let bash_input = serde_json::json!({ "command": fallback });
                    let result = bash_tool.call(bash_input, tool_context).await;
                    let (output, is_error) = match result {
                        Ok(tool_output) => (tool_output.content, tool_output.is_error),
                        Err(e) => (ToolResultContent::Text(e.to_string()), true),
                    };
                    let _ = event_tx.send(ConversationEvent::ToolResult {
                        id: pending.id.clone(),
                        output: output.clone(),
                        is_error,
                    });
                    return Ok(ContentBlock::ToolResult {
                        tool_use_id: pending.id,
                        content: output,
                        is_error: if is_error { Some(true) } else { None },
                    });
                }
            }

            // Truly unknown tool with no fallback — return error
            let msg = format!(
                "Unknown tool: '{}'. Available tools: {}",
                pending.name,
                tools.iter().map(|t| t.definition().name).collect::<Vec<_>>().join(", "),
            );
            let output = ToolResultContent::Text(msg);
            let _ = event_tx.send(ConversationEvent::ToolResult {
                id: pending.id.clone(),
                output: output.clone(),
                is_error: true,
            });
            return Ok(ContentBlock::ToolResult {
                tool_use_id: pending.id,
                content: output,
                is_error: Some(true),
            });
        }
    };

    // Execute
    let result = tool.call(pending.input, tool_context).await;

    let (content, is_error) = match result {
        Ok(output) => (output.content, output.is_error),
        Err(e) => (ToolResultContent::Text(e.to_string()), true),
    };

    let _ = event_tx.send(ConversationEvent::ToolResult {
        id: pending.id.clone(),
        output: content.clone(),
        is_error,
    });

    Ok(ContentBlock::ToolResult {
        tool_use_id: pending.id,
        content,
        is_error: if is_error { Some(true) } else { None },
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{AutoApprovePrompter, SystemBlock, ToolError, ToolOutput};

    /// Mock API client that returns canned SSE event sequences.
    struct MockApiClient {
        responses: std::sync::Mutex<Vec<Vec<SseEvent>>>,
    }

    #[async_trait::async_trait]
    impl ApiClient for MockApiClient {
        async fn stream_message(&self, _request: ApiRequest) -> Result<SseStream, ApiError> {
            let events = self.responses.lock().unwrap().remove(0);
            let stream = futures::stream::iter(events.into_iter().map(|e| {
                // Provide a mock raw string for each event
                let raw = format!("{:?}", e);
                Ok((raw, e))
            }));
            Ok(Box::pin(stream))
        }
    }

    /// Dummy tool for testing.
    struct EchoTool;

    #[async_trait::async_trait]
    impl Tool for EchoTool {
        fn definition(&self) -> ToolDefinition {
            ToolDefinition {
                name: "Echo".into(),
                description: "Echoes input".into(),
                input_schema: serde_json::json!({"type": "object", "properties": {"text": {"type": "string"}}}),
            }
        }

        async fn call(
            &self,
            input: serde_json::Value,
            _ctx: &ToolContext,
        ) -> Result<ToolOutput, ToolError> {
            let text = input["text"].as_str().unwrap_or("").to_string();
            Ok(ToolOutput {
                content: ToolResultContent::Text(format!("Echo: {text}")),
                is_error: false,
            })
        }

        fn is_concurrent(&self) -> bool {
            true
        }
    }

    fn make_test_state(prompt: &str) -> ConversationState {
        ConversationState {
            messages: vec![Message {
                role: Role::User,
                content: vec![ContentBlock::Text {
                    text: prompt.into(),
                }],
            }],
            model: "test-model".into(),
            system_prompt: vec![SystemBlock::text("You are a test assistant.")],
            max_tokens: 1024,
            tools: vec![Box::new(EchoTool)],
            tool_context: ToolContext::default(),
        }
    }

    #[tokio::test]
    async fn test_simple_text_response() {
        let mock = MockApiClient {
            responses: std::sync::Mutex::new(vec![vec![
                SseEvent::MessageStart {
                    message: MessageStartInfo {
                        id: "msg_1".into(),
                        model: "test".into(),
                        usage: None,
                    },
                },
                SseEvent::ContentBlockStart {
                    index: 0,
                    content_block: ContentBlockStartInfo::Text { text: None },
                },
                SseEvent::ContentBlockDelta {
                    index: 0,
                    delta: Delta::TextDelta {
                        text: "Hello!".into(),
                    },
                },
                SseEvent::ContentBlockStop { index: 0 },
                SseEvent::MessageDelta {
                    delta: MessageDeltaInfo {
                        stop_reason: Some("end_turn".into()),
                    },
                    usage: None,
                },
                SseEvent::MessageStop,
            ]]),
        };

        let mut state = make_test_state("Hi");
        let (tx, mut rx) = mpsc::unbounded_channel();

        run_turn(&mut state, &mock, &AutoApprovePrompter, &tx)
            .await
            .unwrap();

        let events: Vec<_> = std::iter::from_fn(|| rx.try_recv().ok()).collect();

        // Should have TextDelta chars that together form "Hello!", TextComplete, TurnComplete
        let text_deltas: String = events
            .iter()
            .filter_map(|e| match e {
                ConversationEvent::TextDelta(t) => Some(t.as_str()),
                _ => None,
            })
            .collect();
        assert_eq!(text_deltas, "Hello!", "TextDelta chars should form 'Hello!'");
        assert!(events
            .iter()
            .any(|e| matches!(e, ConversationEvent::TextComplete(t) if t == "Hello!")));
        assert!(events
            .iter()
            .any(|e| matches!(e, ConversationEvent::TurnComplete)));

        // State should have user + assistant messages
        assert_eq!(state.messages.len(), 2);
        assert_eq!(state.messages[1].role, Role::Assistant);
        assert_eq!(state.messages[1].text(), "Hello!");
    }

    #[tokio::test]
    async fn test_tool_use_loop() {
        let mock = MockApiClient {
            responses: std::sync::Mutex::new(vec![
                // First API call → model wants Echo tool
                vec![
                    SseEvent::MessageStart {
                        message: MessageStartInfo {
                            id: "msg_1".into(),
                            model: "test".into(),
                            usage: None,
                        },
                    },
                    SseEvent::ContentBlockStart {
                        index: 0,
                        content_block: ContentBlockStartInfo::ToolUse {
                            id: "toolu_1".into(),
                            name: "Echo".into(),
                        },
                    },
                    SseEvent::ContentBlockDelta {
                        index: 0,
                        delta: Delta::InputJsonDelta {
                            partial_json: r#"{"text":"hello"}"#.into(),
                        },
                    },
                    SseEvent::ContentBlockStop { index: 0 },
                    SseEvent::MessageDelta {
                        delta: MessageDeltaInfo {
                            stop_reason: Some("tool_use".into()),
                        },
                        usage: None,
                    },
                    SseEvent::MessageStop,
                ],
                // Second API call → final text answer
                vec![
                    SseEvent::MessageStart {
                        message: MessageStartInfo {
                            id: "msg_2".into(),
                            model: "test".into(),
                            usage: None,
                        },
                    },
                    SseEvent::ContentBlockStart {
                        index: 0,
                        content_block: ContentBlockStartInfo::Text { text: None },
                    },
                    SseEvent::ContentBlockDelta {
                        index: 0,
                        delta: Delta::TextDelta {
                            text: "The echo said: hello".into(),
                        },
                    },
                    SseEvent::ContentBlockStop { index: 0 },
                    SseEvent::MessageDelta {
                        delta: MessageDeltaInfo {
                            stop_reason: Some("end_turn".into()),
                        },
                        usage: None,
                    },
                    SseEvent::MessageStop,
                ],
            ]),
        };

        let mut state = make_test_state("Echo hello for me");
        let (tx, mut rx) = mpsc::unbounded_channel();

        run_turn(&mut state, &mock, &AutoApprovePrompter, &tx)
            .await
            .unwrap();

        let events: Vec<_> = std::iter::from_fn(|| rx.try_recv().ok()).collect();

        // Should have tool events
        assert!(events.iter().any(
            |e| matches!(e, ConversationEvent::ToolUseStart { name, .. } if name == "Echo")
        ));
        assert!(events
            .iter()
            .any(|e| matches!(e, ConversationEvent::ToolResult { is_error: false, .. })));
        assert!(events
            .iter()
            .any(|e| matches!(e, ConversationEvent::TurnComplete)));

        // Message history: user, assistant(tool_use), user(tool_result), assistant(text)
        assert_eq!(state.messages.len(), 4);
        assert_eq!(state.messages[0].role, Role::User);
        assert_eq!(state.messages[1].role, Role::Assistant);
        assert_eq!(state.messages[2].role, Role::User);
        assert_eq!(state.messages[3].role, Role::Assistant);
        assert_eq!(state.messages[3].text(), "The echo said: hello");
    }

    #[tokio::test]
    async fn test_permission_denied() {
        struct DenyAll;
        #[async_trait::async_trait]
        impl PermissionPrompter for DenyAll {
            async fn request_permission(
                &self,
                _: &str,
                _: &serde_json::Value,
            ) -> PermissionDecision {
                PermissionDecision::Deny
            }
        }

        let mock = MockApiClient {
            responses: std::sync::Mutex::new(vec![
                // First call → tool_use
                vec![
                    SseEvent::MessageStart {
                        message: MessageStartInfo {
                            id: "msg_1".into(),
                            model: "test".into(),
                            usage: None,
                        },
                    },
                    SseEvent::ContentBlockStart {
                        index: 0,
                        content_block: ContentBlockStartInfo::ToolUse {
                            id: "toolu_1".into(),
                            name: "Echo".into(),
                        },
                    },
                    SseEvent::ContentBlockDelta {
                        index: 0,
                        delta: Delta::InputJsonDelta {
                            partial_json: r#"{"text":"hi"}"#.into(),
                        },
                    },
                    SseEvent::ContentBlockStop { index: 0 },
                    SseEvent::MessageDelta {
                        delta: MessageDeltaInfo {
                            stop_reason: Some("tool_use".into()),
                        },
                        usage: None,
                    },
                    SseEvent::MessageStop,
                ],
                // Second call → text after denied tool
                vec![
                    SseEvent::MessageStart {
                        message: MessageStartInfo {
                            id: "msg_2".into(),
                            model: "test".into(),
                            usage: None,
                        },
                    },
                    SseEvent::ContentBlockStart {
                        index: 0,
                        content_block: ContentBlockStartInfo::Text { text: None },
                    },
                    SseEvent::ContentBlockDelta {
                        index: 0,
                        delta: Delta::TextDelta {
                            text: "Permission was denied.".into(),
                        },
                    },
                    SseEvent::ContentBlockStop { index: 0 },
                    SseEvent::MessageDelta {
                        delta: MessageDeltaInfo {
                            stop_reason: Some("end_turn".into()),
                        },
                        usage: None,
                    },
                    SseEvent::MessageStop,
                ],
            ]),
        };

        let mut state = make_test_state("Echo something");
        let (tx, mut rx) = mpsc::unbounded_channel();

        run_turn(&mut state, &mock, &DenyAll, &tx).await.unwrap();

        let events: Vec<_> = std::iter::from_fn(|| rx.try_recv().ok()).collect();

        // Tool result should be an error
        assert!(events
            .iter()
            .any(|e| matches!(e, ConversationEvent::ToolResult { is_error: true, .. })));
    }

    #[tokio::test]
    async fn test_interleaved_tool_blocks() {
        // Reproduces the real bug: GitHub API sends multiple ContentBlockStart
        // events before any ContentBlockStop. The old single-accumulator approach
        // would lose the first tool's name when the second block started.
        //
        // Stream order (from real log):
        //   ContentBlockStart[0]: Text
        //   ContentBlockStart[1]: ToolUse(id=A, name=Echo)
        //   ContentBlockStart[2]: ToolUse(id=B, name=Echo)
        //   ContentBlockStop[2]  ← second tool finishes first
        //   ContentBlockStop[1]  ← first tool finishes second
        //   ContentBlockStop[0]  ← text finishes last
        let mock = MockApiClient {
            responses: std::sync::Mutex::new(vec![
                // First API call → text + two interleaved tool uses
                vec![
                    SseEvent::MessageStart {
                        message: MessageStartInfo {
                            id: "msg_1".into(),
                            model: "test".into(),
                            usage: None,
                        },
                    },
                    // Block 0: Text
                    SseEvent::ContentBlockStart {
                        index: 0,
                        content_block: ContentBlockStartInfo::Text { text: None },
                    },
                    SseEvent::ContentBlockDelta {
                        index: 0,
                        delta: Delta::TextDelta {
                            text: "Let me run two commands.".into(),
                        },
                    },
                    // Block 1: First tool (starts before block 0 stops!)
                    SseEvent::ContentBlockStart {
                        index: 1,
                        content_block: ContentBlockStartInfo::ToolUse {
                            id: "toolu_A".into(),
                            name: "Echo".into(),
                        },
                    },
                    // Block 2: Second tool (starts before block 1 stops!)
                    SseEvent::ContentBlockStart {
                        index: 2,
                        content_block: ContentBlockStartInfo::ToolUse {
                            id: "toolu_B".into(),
                            name: "Echo".into(),
                        },
                    },
                    // Deltas for both tools interleaved
                    SseEvent::ContentBlockDelta {
                        index: 1,
                        delta: Delta::InputJsonDelta {
                            partial_json: r#"{"text":"first"}"#.into(),
                        },
                    },
                    SseEvent::ContentBlockDelta {
                        index: 2,
                        delta: Delta::InputJsonDelta {
                            partial_json: r#"{"text":"second"}"#.into(),
                        },
                    },
                    // Stops in reverse order (2 before 1 before 0)
                    SseEvent::ContentBlockStop { index: 2 },
                    SseEvent::ContentBlockStop { index: 1 },
                    SseEvent::ContentBlockStop { index: 0 },
                    SseEvent::MessageDelta {
                        delta: MessageDeltaInfo {
                            stop_reason: Some("tool_use".into()),
                        },
                        usage: None,
                    },
                    SseEvent::MessageStop,
                ],
                // Second API call → final text
                vec![
                    SseEvent::MessageStart {
                        message: MessageStartInfo {
                            id: "msg_2".into(),
                            model: "test".into(),
                            usage: None,
                        },
                    },
                    SseEvent::ContentBlockStart {
                        index: 0,
                        content_block: ContentBlockStartInfo::Text { text: None },
                    },
                    SseEvent::ContentBlockDelta {
                        index: 0,
                        delta: Delta::TextDelta {
                            text: "Both done.".into(),
                        },
                    },
                    SseEvent::ContentBlockStop { index: 0 },
                    SseEvent::MessageDelta {
                        delta: MessageDeltaInfo {
                            stop_reason: Some("end_turn".into()),
                        },
                        usage: None,
                    },
                    SseEvent::MessageStop,
                ],
            ]),
        };

        let mut state = make_test_state("Run two echos");
        let (tx, mut rx) = mpsc::unbounded_channel();

        run_turn(&mut state, &mock, &AutoApprovePrompter, &tx)
            .await
            .unwrap();

        let events: Vec<_> = std::iter::from_fn(|| rx.try_recv().ok()).collect();

        // Both tools should have been called with correct names (not empty)
        let tool_starts: Vec<_> = events
            .iter()
            .filter_map(|e| match e {
                ConversationEvent::ToolUseStart { name, .. } => Some(name.as_str()),
                _ => None,
            })
            .collect();
        assert_eq!(tool_starts.len(), 2, "Expected 2 tool completions, got: {:?}", tool_starts);
        assert!(tool_starts.iter().all(|n| *n == "Echo"), "All tool names should be 'Echo': {:?}", tool_starts);

        // Both tools should have produced results
        let tool_results: Vec<_> = events
            .iter()
            .filter(|e| matches!(e, ConversationEvent::ToolResult { is_error: false, .. }))
            .collect();
        assert_eq!(tool_results.len(), 2, "Expected 2 tool results");

        // Message history: user, assistant(text+2 tools), user(2 results), assistant(text)
        assert_eq!(state.messages.len(), 4);
        // The assistant message should have 3 blocks: text + 2 tool_use
        assert_eq!(state.messages[1].content.len(), 3);
        // The user message should have 2 blocks: 2 tool_results
        assert_eq!(state.messages[2].content.len(), 2);
        assert_eq!(state.messages[3].text(), "Both done.");
    }

    #[tokio::test]
    async fn test_parallel_tools_with_split_json_deltas() {
        // Tests that JSON input split across multiple deltas is correctly
        // accumulated per-index, not mixed between blocks.
        let mock = MockApiClient {
            responses: std::sync::Mutex::new(vec![
                vec![
                    SseEvent::MessageStart {
                        message: MessageStartInfo {
                            id: "msg_1".into(),
                            model: "test".into(),
                            usage: None,
                        },
                    },
                    SseEvent::ContentBlockStart {
                        index: 0,
                        content_block: ContentBlockStartInfo::ToolUse {
                            id: "toolu_X".into(),
                            name: "Echo".into(),
                        },
                    },
                    SseEvent::ContentBlockStart {
                        index: 1,
                        content_block: ContentBlockStartInfo::ToolUse {
                            id: "toolu_Y".into(),
                            name: "Echo".into(),
                        },
                    },
                    // Split JSON for block 0: {"tex  +  t":"aaa"}
                    SseEvent::ContentBlockDelta {
                        index: 0,
                        delta: Delta::InputJsonDelta {
                            partial_json: r#"{"tex"#.into(),
                        },
                    },
                    // Delta for block 1 in between
                    SseEvent::ContentBlockDelta {
                        index: 1,
                        delta: Delta::InputJsonDelta {
                            partial_json: r#"{"text":"bbb"}"#.into(),
                        },
                    },
                    // Rest of block 0's JSON
                    SseEvent::ContentBlockDelta {
                        index: 0,
                        delta: Delta::InputJsonDelta {
                            partial_json: r#"t":"aaa"}"#.into(),
                        },
                    },
                    SseEvent::ContentBlockStop { index: 0 },
                    SseEvent::ContentBlockStop { index: 1 },
                    SseEvent::MessageDelta {
                        delta: MessageDeltaInfo {
                            stop_reason: Some("tool_use".into()),
                        },
                        usage: None,
                    },
                    SseEvent::MessageStop,
                ],
                // Final answer
                vec![
                    SseEvent::MessageStart {
                        message: MessageStartInfo {
                            id: "msg_2".into(),
                            model: "test".into(),
                            usage: None,
                        },
                    },
                    SseEvent::ContentBlockStart {
                        index: 0,
                        content_block: ContentBlockStartInfo::Text { text: None },
                    },
                    SseEvent::ContentBlockDelta {
                        index: 0,
                        delta: Delta::TextDelta {
                            text: "Done".into(),
                        },
                    },
                    SseEvent::ContentBlockStop { index: 0 },
                    SseEvent::MessageDelta {
                        delta: MessageDeltaInfo {
                            stop_reason: Some("end_turn".into()),
                        },
                        usage: None,
                    },
                    SseEvent::MessageStop,
                ],
            ]),
        };

        let mut state = make_test_state("Split test");
        let (tx, mut rx) = mpsc::unbounded_channel();

        run_turn(&mut state, &mock, &AutoApprovePrompter, &tx)
            .await
            .unwrap();

        let events: Vec<_> = std::iter::from_fn(|| rx.try_recv().ok()).collect();

        // Both tool results should contain correctly assembled text
        let results: Vec<_> = events
            .iter()
            .filter_map(|e| match e {
                ConversationEvent::ToolResult {
                    output: ToolResultContent::Text(t),
                    ..
                } => Some(t.clone()),
                _ => None,
            })
            .collect();

        assert_eq!(results.len(), 2);
        assert!(results.iter().any(|r| r.contains("Echo: aaa")), "Should have 'Echo: aaa', got: {:?}", results);
        assert!(results.iter().any(|r| r.contains("Echo: bbb")), "Should have 'Echo: bbb', got: {:?}", results);
    }

    #[tokio::test]
    async fn test_many_parallel_tools() {
        // Simulates the real-world scenario: 5 parallel Read calls (indices 1-5)
        // with a text block at index 0, matching the log pattern we observed.
        let mut events = vec![SseEvent::MessageStart {
            message: MessageStartInfo {
                id: "msg_1".into(),
                model: "test".into(),
                usage: None,
            },
        }];

        // Text block at index 0
        events.push(SseEvent::ContentBlockStart {
            index: 0,
            content_block: ContentBlockStartInfo::Text { text: Some("".into()) },
        });
        events.push(SseEvent::ContentBlockDelta {
            index: 0,
            delta: Delta::TextDelta {
                text: "Reading files...".into(),
            },
        });

        // 5 tool blocks at indices 1-5
        for i in 1..=5u32 {
            events.push(SseEvent::ContentBlockStart {
                index: i,
                content_block: ContentBlockStartInfo::ToolUse {
                    id: format!("toolu_{i}"),
                    name: "Echo".into(),
                },
            });
        }

        // Deltas for all 5
        for i in 1..=5u32 {
            events.push(SseEvent::ContentBlockDelta {
                index: i,
                delta: Delta::InputJsonDelta {
                    partial_json: format!(r#"{{"text":"item_{i}"}}"#),
                },
            });
        }

        // Stop all in order: 1,2,3,4,5,0
        for i in 1..=5u32 {
            events.push(SseEvent::ContentBlockStop { index: i });
        }
        events.push(SseEvent::ContentBlockStop { index: 0 });

        events.push(SseEvent::MessageDelta {
            delta: MessageDeltaInfo {
                stop_reason: Some("tool_use".into()),
            },
            usage: None,
        });
        events.push(SseEvent::MessageStop);

        // Second call: final text
        let final_events = vec![
            SseEvent::MessageStart {
                message: MessageStartInfo {
                    id: "msg_2".into(),
                    model: "test".into(),
                    usage: None,
                },
            },
            SseEvent::ContentBlockStart {
                index: 0,
                content_block: ContentBlockStartInfo::Text { text: None },
            },
            SseEvent::ContentBlockDelta {
                index: 0,
                delta: Delta::TextDelta {
                    text: "All 5 done.".into(),
                },
            },
            SseEvent::ContentBlockStop { index: 0 },
            SseEvent::MessageDelta {
                delta: MessageDeltaInfo {
                    stop_reason: Some("end_turn".into()),
                },
                usage: None,
            },
            SseEvent::MessageStop,
        ];

        let mock = MockApiClient {
            responses: std::sync::Mutex::new(vec![events, final_events]),
        };

        let mut state = make_test_state("Read 5 files");
        let (tx, mut rx) = mpsc::unbounded_channel();

        run_turn(&mut state, &mock, &AutoApprovePrompter, &tx)
            .await
            .unwrap();

        let all_events: Vec<_> = std::iter::from_fn(|| rx.try_recv().ok()).collect();

        // 5 tool results, all successful
        let results: Vec<_> = all_events
            .iter()
            .filter(|e| matches!(e, ConversationEvent::ToolResult { is_error: false, .. }))
            .collect();
        assert_eq!(results.len(), 5, "Expected 5 tool results, got {}", results.len());

        // All tool starts should have name "Echo" (none empty)
        let empty_names: Vec<_> = all_events
            .iter()
            .filter(|e| matches!(e, ConversationEvent::ToolUseStart { name, .. } if name.is_empty()))
            .collect();
        assert!(empty_names.is_empty(), "No tool starts should have empty names");

        // Final message
        assert_eq!(state.messages.last().unwrap().text(), "All 5 done.");
    }

    #[tokio::test]
    async fn test_thinking_block_interleaved() {
        // Thinking block followed by tool use — both should be tracked independently
        let mock = MockApiClient {
            responses: std::sync::Mutex::new(vec![
                vec![
                    SseEvent::MessageStart {
                        message: MessageStartInfo {
                            id: "msg_1".into(),
                            model: "test".into(),
                            usage: None,
                        },
                    },
                    SseEvent::ContentBlockStart {
                        index: 0,
                        content_block: ContentBlockStartInfo::Thinking { thinking: None },
                    },
                    SseEvent::ContentBlockStart {
                        index: 1,
                        content_block: ContentBlockStartInfo::ToolUse {
                            id: "toolu_1".into(),
                            name: "Echo".into(),
                        },
                    },
                    SseEvent::ContentBlockDelta {
                        index: 0,
                        delta: Delta::ThinkingDelta {
                            thinking: "I should echo something.".into(),
                        },
                    },
                    SseEvent::ContentBlockDelta {
                        index: 1,
                        delta: Delta::InputJsonDelta {
                            partial_json: r#"{"text":"thought"}"#.into(),
                        },
                    },
                    SseEvent::ContentBlockStop { index: 0 },
                    SseEvent::ContentBlockStop { index: 1 },
                    SseEvent::MessageDelta {
                        delta: MessageDeltaInfo {
                            stop_reason: Some("tool_use".into()),
                        },
                        usage: None,
                    },
                    SseEvent::MessageStop,
                ],
                // Final answer
                vec![
                    SseEvent::MessageStart {
                        message: MessageStartInfo {
                            id: "msg_2".into(),
                            model: "test".into(),
                            usage: None,
                        },
                    },
                    SseEvent::ContentBlockStart {
                        index: 0,
                        content_block: ContentBlockStartInfo::Text { text: None },
                    },
                    SseEvent::ContentBlockDelta {
                        index: 0,
                        delta: Delta::TextDelta {
                            text: "Thought and done.".into(),
                        },
                    },
                    SseEvent::ContentBlockStop { index: 0 },
                    SseEvent::MessageDelta {
                        delta: MessageDeltaInfo {
                            stop_reason: Some("end_turn".into()),
                        },
                        usage: None,
                    },
                    SseEvent::MessageStop,
                ],
            ]),
        };

        let mut state = make_test_state("Think and echo");
        let (tx, mut rx) = mpsc::unbounded_channel();

        run_turn(&mut state, &mock, &AutoApprovePrompter, &tx)
            .await
            .unwrap();

        let events: Vec<_> = std::iter::from_fn(|| rx.try_recv().ok()).collect();

        // Should have thinking events
        assert!(events.iter().any(
            |e| matches!(e, ConversationEvent::ThinkingComplete(t) if t.contains("echo something"))
        ));

        // Should have tool result
        assert!(events
            .iter()
            .any(|e| matches!(e, ConversationEvent::ToolResult { is_error: false, .. })));

        // Assistant message should have thinking + tool_use blocks
        let assistant_msg = &state.messages[1];
        assert_eq!(assistant_msg.content.len(), 2);
        assert!(matches!(assistant_msg.content[0], ContentBlock::Thinking { .. }));
        assert!(matches!(assistant_msg.content[1], ContentBlock::ToolUse { .. }));
    }

    #[tokio::test]
    async fn test_usage_events_emitted() {
        let mock = MockApiClient {
            responses: std::sync::Mutex::new(vec![vec![
                SseEvent::MessageStart {
                    message: MessageStartInfo {
                        id: "msg_1".into(),
                        model: "test".into(),
                        usage: Some(UsageInfo {
                            input_tokens: 100,
                            output_tokens: 0,
                            cache_creation_input_tokens: None,
                            cache_read_input_tokens: None,
                        }),
                    },
                },
                SseEvent::ContentBlockStart {
                    index: 0,
                    content_block: ContentBlockStartInfo::Text { text: None },
                },
                SseEvent::ContentBlockDelta {
                    index: 0,
                    delta: Delta::TextDelta { text: "Hi".into() },
                },
                SseEvent::ContentBlockStop { index: 0 },
                SseEvent::MessageDelta {
                    delta: MessageDeltaInfo {
                        stop_reason: Some("end_turn".into()),
                    },
                    usage: Some(UsageInfo {
                        input_tokens: 0,
                        output_tokens: 5,
                        cache_creation_input_tokens: None,
                        cache_read_input_tokens: None,
                    }),
                },
                SseEvent::MessageStop,
            ]]),
        };

        let mut state = make_test_state("Hi");
        let (tx, mut rx) = mpsc::unbounded_channel();

        run_turn(&mut state, &mock, &AutoApprovePrompter, &tx)
            .await
            .unwrap();

        let events: Vec<_> = std::iter::from_fn(|| rx.try_recv().ok()).collect();

        let usage_events: Vec<_> = events
            .iter()
            .filter(|e| matches!(e, ConversationEvent::Usage { .. }))
            .collect();
        assert!(usage_events.len() >= 1, "Should have at least one usage event");
    }

    #[tokio::test]
    async fn test_compact_conversation() {
        // Mock that returns a summary response
        let client = MockApiClient {
            responses: std::sync::Mutex::new(vec![vec![
                SseEvent::MessageStart {
                    message: MessageStartInfo {
                        id: "msg_c".into(),
                        model: "test".into(),
                        usage: Some(UsageInfo {
                            input_tokens: 500,
                            output_tokens: 0,
                            cache_creation_input_tokens: None,
                            cache_read_input_tokens: None,
                        }),
                    },
                },
                SseEvent::ContentBlockStart {
                    index: 0,
                    content_block: ContentBlockStartInfo::Text { text: None },
                },
                SseEvent::ContentBlockDelta {
                    index: 0,
                    delta: Delta::TextDelta {
                        text: "<analysis>\nThe user asked about Rust.\n</analysis>\n\n<summary>\nThe conversation covered Rust programming basics.\n</summary>".into(),
                    },
                },
                SseEvent::ContentBlockStop { index: 0 },
                SseEvent::MessageDelta {
                    delta: MessageDeltaInfo {
                        stop_reason: Some("end_turn".into()),
                    },
                    usage: Some(UsageInfo {
                        input_tokens: 0,
                        output_tokens: 50,
                        cache_creation_input_tokens: None,
                        cache_read_input_tokens: None,
                    }),
                },
                SseEvent::MessageStop,
            ]]),
        };

        let (tx, mut rx) = mpsc::unbounded_channel();

        let mut state = ConversationState {
            messages: vec![
                Message {
                    role: Role::User,
                    content: vec![ContentBlock::Text {
                        text: "Tell me about Rust".into(),
                    }],
                },
                Message {
                    role: Role::Assistant,
                    content: vec![ContentBlock::Text {
                        text: "Rust is a systems programming language...".into(),
                    }],
                },
                Message {
                    role: Role::User,
                    content: vec![ContentBlock::Text {
                        text: "What about async?".into(),
                    }],
                },
                Message {
                    role: Role::Assistant,
                    content: vec![ContentBlock::Text {
                        text: "Async in Rust uses tokio...".into(),
                    }],
                },
            ],
            model: "test-model".into(),
            system_prompt: vec![SystemBlock::text("You are helpful.")],
            max_tokens: 4096,
            tools: vec![],
            tool_context: ToolContext {
                working_directory: std::path::PathBuf::from("/tmp"),
                timeout: std::time::Duration::from_secs(30),
            },
        };

        compact_conversation(&mut state, &client, &tx, None)
            .await
            .unwrap();

        // State should now have exactly 2 messages (summary + ack)
        assert_eq!(state.messages.len(), 2);
        assert_eq!(state.messages[0].role, Role::User);
        assert_eq!(state.messages[1].role, Role::Assistant);

        // Summary message should contain the formatted summary (without <analysis>)
        let summary_text = state.messages[0].text();
        assert!(
            summary_text.contains("Rust programming basics"),
            "Summary should contain the key content"
        );
        assert!(
            !summary_text.contains("<analysis>"),
            "Analysis tags should be stripped"
        );
        assert!(
            summary_text.contains("continued from a previous conversation"),
            "Should have the continuation prefix"
        );

        // Check events
        let events: Vec<_> = std::iter::from_fn(|| rx.try_recv().ok()).collect();
        assert!(events.iter().any(|e| matches!(e, ConversationEvent::CompactionStarted)));
        assert!(events.iter().any(|e| matches!(
            e,
            ConversationEvent::CompactionComplete { old_messages: 4, .. }
        )));
    }

    #[tokio::test]
    async fn test_compact_too_few_messages() {
        let client = MockApiClient {
            responses: std::sync::Mutex::new(vec![]),
        };

        let (tx, mut rx) = mpsc::unbounded_channel();

        let mut state = ConversationState {
            messages: vec![Message {
                role: Role::User,
                content: vec![ContentBlock::Text {
                    text: "Hello".into(),
                }],
            }],
            model: "test-model".into(),
            system_prompt: vec![SystemBlock::text("test")],
            max_tokens: 4096,
            tools: vec![],
            tool_context: ToolContext {
                working_directory: std::path::PathBuf::from("/tmp"),
                timeout: std::time::Duration::from_secs(30),
            },
        };

        compact_conversation(&mut state, &client, &tx, None)
            .await
            .unwrap();

        // Messages should be unchanged (too few to compact)
        assert_eq!(state.messages.len(), 1);

        let events: Vec<_> = std::iter::from_fn(|| rx.try_recv().ok()).collect();
        assert!(events.iter().any(|e| matches!(
            e,
            ConversationEvent::Error(msg) if msg.contains("Not enough messages")
        )));
    }

    #[test]
    fn test_format_summary() {
        let input = "<analysis>\nSome analysis here.\n</analysis>\n\n<summary>\nThis is the summary.\n</summary>";
        let result = format_summary(input);
        assert!(!result.contains("<analysis>"), "analysis tags should be removed");
        assert!(!result.contains("</analysis>"), "analysis tags should be removed");
        assert!(result.contains("Summary:"), "should have Summary: prefix");
        assert!(result.contains("This is the summary."), "summary content preserved");
    }

    #[tokio::test]
    async fn test_compact_with_custom_instructions() {
        let client = MockApiClient {
            responses: std::sync::Mutex::new(vec![vec![
                SseEvent::MessageStart {
                    message: MessageStartInfo {
                        id: "msg_c".into(),
                        model: "test".into(),
                        usage: Some(UsageInfo {
                            input_tokens: 300,
                            output_tokens: 0,
                            cache_creation_input_tokens: None,
                            cache_read_input_tokens: None,
                        }),
                    },
                },
                SseEvent::ContentBlockStart {
                    index: 0,
                    content_block: ContentBlockStartInfo::Text { text: None },
                },
                SseEvent::ContentBlockDelta {
                    index: 0,
                    delta: Delta::TextDelta {
                        text: "<summary>\nFocused on TypeScript changes.\n</summary>".into(),
                    },
                },
                SseEvent::ContentBlockStop { index: 0 },
                SseEvent::MessageDelta {
                    delta: MessageDeltaInfo {
                        stop_reason: Some("end_turn".into()),
                    },
                    usage: None,
                },
                SseEvent::MessageStop,
            ]]),
        };

        let (tx, _rx) = mpsc::unbounded_channel();

        let mut state = ConversationState {
            messages: vec![
                Message {
                    role: Role::User,
                    content: vec![ContentBlock::Text { text: "Do something".into() }],
                },
                Message {
                    role: Role::Assistant,
                    content: vec![ContentBlock::Text { text: "Done.".into() }],
                },
            ],
            model: "test-model".into(),
            system_prompt: vec![SystemBlock::text("test")],
            max_tokens: 4096,
            tools: vec![],
            tool_context: ToolContext {
                working_directory: std::path::PathBuf::from("/tmp"),
                timeout: std::time::Duration::from_secs(30),
            },
        };

        compact_conversation(
            &mut state,
            &client,
            &tx,
            Some("Focus on TypeScript code changes"),
        )
        .await
        .unwrap();

        assert_eq!(state.messages.len(), 2);
        let summary = state.messages[0].text();
        assert!(summary.contains("TypeScript changes"));
    }

    #[tokio::test]
    async fn test_unknown_tool_returns_error_not_crash() {
        // When the model requests an unknown tool and no Bash tool is available,
        // return an error ToolResult so the model can self-correct.
        use crate::{AutoApprovePrompter, ToolContext, ToolResultContent};

        let tools: Vec<Box<dyn crate::Tool>> = vec![];
        let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel();
        let pending = PendingToolUse {
            id: "toolu_123".into(),
            name: "SomeRandomTool".into(),
            input: serde_json::json!({"foo": "bar"}),
        };

        let result = execute_tool_with_permission(
            pending,
            &tools,
            &ToolContext {
                working_directory: std::path::PathBuf::from("/tmp"),
                timeout: std::time::Duration::from_secs(30),
            },
            &AutoApprovePrompter,
            &tx,
        )
        .await
        .unwrap();

        match &result {
            ContentBlock::ToolResult {
                tool_use_id,
                content,
                is_error,
            } => {
                assert_eq!(tool_use_id, "toolu_123");
                assert_eq!(*is_error, Some(true));
                match content {
                    ToolResultContent::Text(t) => {
                        assert!(
                            t.contains("Unknown tool: 'SomeRandomTool'"),
                            "Error message should mention the unknown tool name, got: {t}"
                        );
                    }
                    _ => panic!("Expected text content"),
                }
            }
            other => panic!("Expected ToolResult, got: {other:?}"),
        }

        let event = rx.try_recv().unwrap();
        match event {
            ConversationEvent::ToolResult {
                id, is_error, ..
            } => {
                assert_eq!(id, "toolu_123");
                assert!(is_error);
            }
            other => panic!("Expected ToolResult event, got: {other:?}"),
        }
    }

    #[tokio::test]
    async fn test_list_directory_alias_falls_back_to_ls() {
        // When the model requests "list_directory" (a hallucinated alias),
        // the fallback should run "ls -la <path>" via Bash.
        use crate::{AutoApprovePrompter, ToolContext, ToolResultContent};

        let bash_tool = MockBashTool;
        let tools: Vec<Box<dyn crate::Tool>> = vec![Box::new(bash_tool)];
        let (tx, _rx) = tokio::sync::mpsc::unbounded_channel();

        let dir = tempfile::tempdir().unwrap();
        std::fs::write(dir.path().join("hello.txt"), "world").unwrap();
        std::fs::write(dir.path().join("test.rs"), "fn main() {}").unwrap();

        let pending = PendingToolUse {
            id: "toolu_456".into(),
            name: "list_directory".into(),
            input: serde_json::json!({"path": dir.path().to_str().unwrap()}),
        };

        let result = execute_tool_with_permission(
            pending,
            &tools,
            &ToolContext {
                working_directory: dir.path().to_path_buf(),
                timeout: std::time::Duration::from_secs(30),
            },
            &AutoApprovePrompter,
            &tx,
        )
        .await
        .unwrap();

        match &result {
            ContentBlock::ToolResult {
                tool_use_id,
                content,
                is_error,
            } => {
                assert_eq!(tool_use_id, "toolu_456");
                assert_ne!(*is_error, Some(true), "list_directory fallback should succeed");
                match content {
                    ToolResultContent::Text(t) => {
                        assert!(
                            t.contains("hello.txt"),
                            "ls output should list hello.txt, got: {t}"
                        );
                        assert!(
                            t.contains("test.rs"),
                            "ls output should list test.rs, got: {t}"
                        );
                    }
                    _ => panic!("Expected text content"),
                }
            }
            other => panic!("Expected ToolResult, got: {other:?}"),
        }
    }

    #[tokio::test]
    async fn test_list_dir_alias_uses_working_dir_when_no_path() {
        // "list_dir" (alias) without a "path" field should ls the working directory.
        use crate::{AutoApprovePrompter, ToolContext, ToolResultContent};

        let bash_tool = MockBashTool;
        let tools: Vec<Box<dyn crate::Tool>> = vec![Box::new(bash_tool)];
        let (tx, _rx) = tokio::sync::mpsc::unbounded_channel();

        let dir = tempfile::tempdir().unwrap();
        std::fs::write(dir.path().join("marker_file.txt"), "found me").unwrap();

        let pending = PendingToolUse {
            id: "toolu_789".into(),
            name: "list_dir".into(),
            input: serde_json::json!({}),
        };

        let result = execute_tool_with_permission(
            pending,
            &tools,
            &ToolContext {
                working_directory: dir.path().to_path_buf(),
                timeout: std::time::Duration::from_secs(30),
            },
            &AutoApprovePrompter,
            &tx,
        )
        .await
        .unwrap();

        match &result {
            ContentBlock::ToolResult {
                content,
                is_error,
                ..
            } => {
                assert_ne!(*is_error, Some(true));
                match content {
                    ToolResultContent::Text(t) => {
                        assert!(
                            t.contains("marker_file.txt"),
                            "ls should find marker_file.txt in working dir, got: {t}"
                        );
                    }
                    _ => panic!("Expected text content"),
                }
            }
            other => panic!("Expected ToolResult, got: {other:?}"),
        }
    }

    /// A real Bash tool for integration tests (executes actual shell commands).
    struct MockBashTool;

    #[async_trait::async_trait]
    impl crate::Tool for MockBashTool {
        fn definition(&self) -> crate::ToolDefinition {
            crate::ToolDefinition {
                name: "Bash".into(),
                description: "Execute a bash command".into(),
                input_schema: serde_json::json!({}),
            }
        }

        async fn call(
            &self,
            input: serde_json::Value,
            ctx: &crate::ToolContext,
        ) -> Result<crate::ToolOutput, crate::ToolError> {
            let command = input["command"].as_str().unwrap_or("echo no command");
            let output = tokio::process::Command::new("bash")
                .arg("-c")
                .arg(command)
                .current_dir(&ctx.working_directory)
                .stdout(std::process::Stdio::piped())
                .stderr(std::process::Stdio::piped())
                .output()
                .await
                .map_err(|e| crate::ToolError::ExecutionFailed(e.to_string()))?;

            let stdout = String::from_utf8_lossy(&output.stdout);
            Ok(crate::ToolOutput {
                content: crate::ToolResultContent::Text(stdout.to_string()),
                is_error: false,
            })
        }
    }

    /// Mock API client that fails N times with a given error, then succeeds.
    struct RetryMockClient {
        failures: std::sync::Mutex<Vec<ApiError>>,
        success_events: Vec<SseEvent>,
    }

    #[async_trait::async_trait]
    impl ApiClient for RetryMockClient {
        async fn stream_message(&self, _request: ApiRequest) -> Result<SseStream, ApiError> {
            let mut failures = self.failures.lock().unwrap();
            if let Some(err) = failures.pop() {
                return Err(err);
            }
            let events = self.success_events.clone();
            Ok(Box::pin(futures::stream::iter(
                events.into_iter().map(|e| {
                    let raw = format!("{:?}", e);
                    Ok((raw, e))
                }),
            )))
        }
    }

    #[tokio::test]
    async fn test_retry_on_rate_limit() {
        // First call returns 429, second succeeds
        let client = RetryMockClient {
            failures: std::sync::Mutex::new(vec![ApiError::RateLimited {
                retry_after_ms: 10, // very short for test
            }]),
            success_events: vec![
                SseEvent::ContentBlockStart {
                    index: 0,
                    content_block: ContentBlockStartInfo::Text { text: None },
                },
                SseEvent::ContentBlockDelta {
                    index: 0,
                    delta: Delta::TextDelta {
                        text: "OK".into(),
                    },
                },
                SseEvent::ContentBlockStop { index: 0 },
                SseEvent::MessageDelta {
                    delta: MessageDeltaInfo {
                        stop_reason: Some("end_turn".into()),
                    },
                    usage: None,
                },
            ],
        };

        let (tx, _rx) = tokio::sync::mpsc::unbounded_channel();
        let request = ApiRequest {
            model: "test".into(),
            messages: vec![],
            system: vec![SystemBlock::text("test")],
            tools: vec![],
            max_tokens: 100,
            stream: true,
        };

        let stream = retry_stream(&client, request, &tx).await;
        assert!(stream.is_ok(), "Should succeed after retry");
    }

    #[tokio::test]
    async fn test_retry_on_overloaded() {
        // First call returns 529, second succeeds
        let client = RetryMockClient {
            failures: std::sync::Mutex::new(vec![ApiError::Overloaded(
                "overloaded".into(),
            )]),
            success_events: vec![
                SseEvent::ContentBlockStart {
                    index: 0,
                    content_block: ContentBlockStartInfo::Text { text: None },
                },
                SseEvent::ContentBlockStop { index: 0 },
                SseEvent::MessageDelta {
                    delta: MessageDeltaInfo {
                        stop_reason: Some("end_turn".into()),
                    },
                    usage: None,
                },
            ],
        };

        let (tx, _rx) = tokio::sync::mpsc::unbounded_channel();
        let request = ApiRequest {
            model: "test".into(),
            messages: vec![],
            system: vec![SystemBlock::text("test")],
            tools: vec![],
            max_tokens: 100,
            stream: true,
        };

        let stream = retry_stream(&client, request, &tx).await;
        assert!(stream.is_ok(), "Should succeed after retry");
    }

    #[tokio::test]
    async fn test_retry_max_exceeded() {
        // All calls fail with 429 — should give up after MAX_RETRIES
        let mut failures = Vec::new();
        for _ in 0..=MAX_RETRIES {
            failures.push(ApiError::RateLimited { retry_after_ms: 10 });
        }
        let client = RetryMockClient {
            failures: std::sync::Mutex::new(failures),
            success_events: vec![],
        };

        let (tx, _rx) = tokio::sync::mpsc::unbounded_channel();
        let request = ApiRequest {
            model: "test".into(),
            messages: vec![],
            system: vec![SystemBlock::text("test")],
            tools: vec![],
            max_tokens: 100,
            stream: true,
        };

        let result = retry_stream(&client, request, &tx).await;
        assert!(result.is_err(), "Should fail after max retries");
        match result {
            Err(ConversationLoopError::Api(ApiError::RateLimited { .. })) => {}
            Err(other) => panic!("Expected RateLimited error, got: {other:?}"),
            Ok(_) => panic!("Expected error, got Ok"),
        }
    }

    #[tokio::test]
    async fn test_http_request_sent_event_emitted() {
        // A simple text response mock — we check that HttpRequestSent is emitted
        let mock = MockApiClient {
            responses: std::sync::Mutex::new(vec![vec![
                SseEvent::MessageStart {
                    message: MessageStartInfo {
                        id: "msg_1".into(),
                        model: "test-model".into(),
                        usage: Some(UsageInfo {
                            input_tokens: 100,
                            output_tokens: 0,
                            cache_creation_input_tokens: None,
                            cache_read_input_tokens: None,
                        }),
                    },
                },
                SseEvent::ContentBlockStart {
                    index: 0,
                    content_block: ContentBlockStartInfo::Text { text: None },
                },
                SseEvent::ContentBlockDelta {
                    index: 0,
                    delta: Delta::TextDelta { text: "Hi".into() },
                },
                SseEvent::ContentBlockStop { index: 0 },
                SseEvent::MessageDelta {
                    delta: MessageDeltaInfo {
                        stop_reason: Some("end_turn".into()),
                    },
                    usage: None,
                },
                SseEvent::MessageStop,
            ]]),
        };

        let mut state = make_test_state("Hello");
        let (tx, mut rx) = mpsc::unbounded_channel();

        run_turn(&mut state, &mock, &AutoApprovePrompter, &tx)
            .await
            .unwrap();

        let events: Vec<_> = std::iter::from_fn(|| rx.try_recv().ok()).collect();

        // HttpRequestSent should be emitted with the request body JSON
        let sent = events.iter().find(|e| matches!(e, ConversationEvent::HttpRequestSent { .. }));
        assert!(sent.is_some(), "HttpRequestSent event should be emitted");
        if let ConversationEvent::HttpRequestSent { body_json, timestamp } = sent.unwrap() {
            assert!(body_json.contains("\"model\""), "body_json should contain model field");
            assert!(body_json.contains("\"messages\""), "body_json should contain messages field");
            assert!(!timestamp.is_empty(), "timestamp should not be empty");
        }
    }

    #[tokio::test]
    async fn test_http_response_events_emitted() {
        let mock = MockApiClient {
            responses: std::sync::Mutex::new(vec![vec![
                SseEvent::MessageStart {
                    message: MessageStartInfo {
                        id: "msg_1".into(),
                        model: "test-model".into(),
                        usage: Some(UsageInfo {
                            input_tokens: 200,
                            output_tokens: 5,
                            cache_creation_input_tokens: None,
                            cache_read_input_tokens: None,
                        }),
                    },
                },
                SseEvent::ContentBlockStart {
                    index: 0,
                    content_block: ContentBlockStartInfo::Text { text: None },
                },
                SseEvent::ContentBlockDelta {
                    index: 0,
                    delta: Delta::TextDelta { text: "OK".into() },
                },
                SseEvent::ContentBlockStop { index: 0 },
                SseEvent::MessageDelta {
                    delta: MessageDeltaInfo {
                        stop_reason: Some("end_turn".into()),
                    },
                    usage: None,
                },
                SseEvent::MessageStop,
            ]]),
        };

        let mut state = make_test_state("Test");
        let (tx, mut rx) = mpsc::unbounded_channel();

        run_turn(&mut state, &mock, &AutoApprovePrompter, &tx)
            .await
            .unwrap();

        let events: Vec<_> = std::iter::from_fn(|| rx.try_recv().ok()).collect();

        // HttpResponseMeta should be emitted with model and token info
        let meta = events.iter().find(|e| matches!(e, ConversationEvent::HttpResponseMeta { .. }));
        assert!(meta.is_some(), "HttpResponseMeta event should be emitted");
        if let ConversationEvent::HttpResponseMeta { model, input_tokens, output_tokens } = meta.unwrap() {
            assert_eq!(model, "test-model");
            assert_eq!(*input_tokens, 200);
            assert_eq!(*output_tokens, 5);
        }

        // HttpResponseComplete should be emitted with a duration
        let complete = events.iter().find(|e| matches!(e, ConversationEvent::HttpResponseComplete { .. }));
        assert!(complete.is_some(), "HttpResponseComplete event should be emitted");
        if let ConversationEvent::HttpResponseComplete { duration_ms } = complete.unwrap() {
            // Duration should be very small in a mock (sub-millisecond), but non-negative
            assert!(*duration_ms < 5000, "Duration should be reasonable, got: {duration_ms}ms");
        }
    }
}
