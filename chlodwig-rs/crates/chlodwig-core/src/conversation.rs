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
        cache_creation_input_tokens: u32,
        cache_read_input_tokens: u32,
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
    /// SummarizeContext meta-tool was applied.
    ///
    /// `summaries` is the raw list the model sent (one entry per tool_result
    /// in the most recent user message; empty strings mean "leave that one
    /// untouched"). `replaced` counts the actually-applied non-empty entries.
    /// UIs use `summaries` to patch the corresponding `ToolResult` blocks
    /// in their display so the user sees the same `[Summarized] …` text the
    /// API history now contains, instead of the original verbose output.
    ContextSummarized {
        replaced: usize,
        requested: usize,
        summaries: Vec<String>,
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
    /// Cooperative interrupt flag.
    ///
    /// When set to `true` during a `run_turn`, the loop will:
    /// 1. Let the current SSE stream finish naturally (no mid-stream abort).
    /// 2. Synthesize "Tool execution cancelled by user." results for any
    ///    tool_use blocks in the just-completed assistant message (required
    ///    by the API — every tool_use must have a matching tool_result).
    /// 3. Append a user text block with [`INTERRUPT_MESSAGE`].
    /// 4. Run ONE final API round (no new tools executed) so the model can
    ///    acknowledge the interruption, then return.
    ///
    /// UI code clones this `Arc` and calls `.store(true, Ordering::SeqCst)`
    /// to request a stop (e.g. `/stop` command or double-Escape in the TUI).
    /// The flag is automatically reset to `false` at the start of each
    /// `run_turn` invocation.
    pub stop_requested: std::sync::Arc<std::sync::atomic::AtomicBool>,
}

/// User-facing message appended to the conversation when a turn loop is
/// interrupted via [`ConversationState::stop_requested`].
pub const INTERRUPT_MESSAGE: &str = "User intentionally interrupted the turn loop.";

/// Construct a fresh stop flag (`Arc<AtomicBool>` initially `false`).
pub fn new_stop_flag() -> std::sync::Arc<std::sync::atomic::AtomicBool> {
    std::sync::Arc::new(std::sync::atomic::AtomicBool::new(false))
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

#[derive(Clone)]
struct PendingToolUse {
    id: String,
    name: String,
    input: serde_json::Value,
}

/// The SummarizeContext tool definition — a meta-tool that replaces
/// tool results in the conversation history with shorter summaries.
/// It never appears in the message history itself.
pub const SUMMARIZE_CONTEXT_TOOL_NAME: &str = "SummarizeContext";

fn summarize_context_definition() -> ToolDefinition {
    ToolDefinition {
        name: SUMMARIZE_CONTEXT_TOOL_NAME.into(),
        description: "Replace tool results from the IMMEDIATELY PRECEDING user message \
            with shorter summaries to reduce context size. Only the most recent round of \
            tool results (the ones in the user message right before your current turn) \
            can be summarized. Use this when a tool result (e.g. a large file read, a long \
            Bash output, a big WebFetch) turned out to be irrelevant or when only a small \
            part of it is needed going forward. The original tool_use/tool_result pairing \
            is preserved — only the tool_result content is replaced with '[Summarized] <your text>'. \
            This tool call itself is removed from the history (meta-tool).".into(),
        input_schema: serde_json::json!({
            "type": "object",
            "properties": {
                "summaries": {
                    "type": "array",
                    "description": "One entry per tool_result in the immediately preceding \
                        user message, in the EXACT order those tool_results appear there. \
                        Each non-empty string replaces that tool_result's content with \
                        '[Summarized] <text>'. Use an empty string \"\" to leave a \
                        tool_result untouched. Array length is silently clamped: providing \
                        fewer entries than there are tool_results leaves the extra ones \
                        unchanged; providing more than there are tool_results ignores the excess. \
                        Do NOT include any IDs — positional matching only.",
                    "items": { "type": "string" }
                }
            },
            "required": ["summaries"]
        }),
    }
}

/// Apply SummarizeContext: replace tool_result contents in the IMMEDIATELY
/// PRECEDING (most recent) user message that contains tool_results, positionally
/// matched against `summaries`. An empty summary string leaves the corresponding
/// tool_result untouched. Returns the number of tool_results actually replaced.
pub fn apply_summarize_context(
    messages: &mut [Message],
    summaries: &[String],
) -> usize {
    // Find the most recent User message containing at least one ToolResult.
    // If the last User message is plain text (echte User-Eingabe), there's
    // nothing to summarize and we return 0.
    let target_idx = messages.iter().rposition(|m| {
        matches!(m.role, Role::User)
            && m.content
                .iter()
                .any(|b| matches!(b, ContentBlock::ToolResult { .. }))
    });
    let Some(idx) = target_idx else { return 0; };

    let mut replaced = 0usize;
    let mut summary_iter = summaries.iter();
    for block in messages[idx].content.iter_mut() {
        if let ContentBlock::ToolResult { content, .. } = block {
            let Some(s) = summary_iter.next() else {
                // Fewer summaries than tool_results → leave rest untouched.
                break;
            };
            if !s.is_empty() {
                *content = ToolResultContent::Text(format!("[Summarized] {s}"));
                replaced += 1;
            }
        }
    }
    replaced
}

/// Build an API request from the current conversation state.
pub fn build_request(state: &ConversationState) -> ApiRequest {
    let mut tools: Vec<ToolDefinition> = state.tools.iter().map(|t| t.definition()).collect();
    // Inject the SummarizeContext meta-tool so the model can call it.
    // DISABLED on user request — tool not advertised to the model.
    // tools.push(summarize_context_definition());

    ApiRequest {
        model: state.model.clone(),
        messages: state.messages.clone(),
        system: state.system_prompt.clone(),
        tools,
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

/// Auto-compact the conversation if the context window exceeds `AUTO_COMPACT_THRESHOLD`.
///
/// Returns `true` if compaction was performed, `false` if skipped.
/// Errors from compaction are logged but not propagated — the caller
/// should continue with the turn anyway.
pub async fn auto_compact_if_needed(
    turn_usage: &crate::TurnUsage,
    state: &mut ConversationState,
    api_client: &dyn ApiClient,
    event_tx: &mpsc::UnboundedSender<ConversationEvent>,
) -> bool {
    if turn_usage.context_window_size() <= AUTO_COMPACT_THRESHOLD {
        return false;
    }
    tracing::info!("Auto-compacting: context {} tokens exceeds threshold {}",
        turn_usage.context_window_size(), AUTO_COMPACT_THRESHOLD);
    if let Err(e) = compact_conversation(state, api_client, event_tx, None).await {
        tracing::warn!("Auto-compaction failed: {e}");
    }
    true
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
    // Reset the stop flag at the start of every turn so a previous
    // interrupt doesn't silently cancel the next turn the user submits.
    state
        .stop_requested
        .store(false, std::sync::atomic::Ordering::SeqCst);

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
                                    cache_creation_input_tokens: usage.cache_creation_input_tokens.unwrap_or(0),
                                    cache_read_input_tokens: usage.cache_read_input_tokens.unwrap_or(0),
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
                                            serde_json::from_str(&json)
                                                .unwrap_or_else(|_| serde_json::json!({}));

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
                                    cache_creation_input_tokens: usage.cache_creation_input_tokens.unwrap_or(0),
                                    cache_read_input_tokens: usage.cache_read_input_tokens.unwrap_or(0),
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

        // 4a. Handle SummarizeContext meta-tool: mutate message history,
        // then erase the tool_use from the assistant message (it never existed).
        let summarize_uses: Vec<PendingToolUse> = tool_uses
            .iter()
            .filter(|t| t.name == SUMMARIZE_CONTEXT_TOOL_NAME)
            .cloned()
            .collect();
        if !summarize_uses.is_empty() {
            tool_uses.retain(|t| t.name != SUMMARIZE_CONTEXT_TOOL_NAME);

            for pending in &summarize_uses {
                let summaries: Vec<String> = pending
                    .input
                    .get("summaries")
                    .and_then(|v| v.as_array())
                    .map(|arr| {
                        arr.iter()
                            .map(|entry| entry.as_str().unwrap_or("").to_string())
                            .collect()
                    })
                    .unwrap_or_default();

                let replaced = apply_summarize_context(&mut state.messages, &summaries);
                tracing::info!(
                    replaced,
                    requested = summaries.len(),
                    "SummarizeContext applied"
                );

                let _ = event_tx.send(ConversationEvent::ContextSummarized {
                    replaced,
                    requested: summaries.len(),
                    summaries: summaries.clone(),
                });
            }

            // Remove the SummarizeContext tool_use blocks from the last
            // assistant message (which we just pushed in step 3).
            if let Some(last_assistant) = state.messages.last_mut() {
                let sc_ids: Vec<&str> = summarize_uses.iter().map(|p| p.id.as_str()).collect();
                last_assistant.content.retain(|block| {
                    !matches!(block, ContentBlock::ToolUse { id, .. } if sc_ids.contains(&id.as_str()))
                });
            }

            // SummarizeContext semantically means "clean up context and let
            // me continue working". So if there are no OTHER tool_uses to
            // execute, we must NOT end the turn — we must recurse for a
            // follow-up round, regardless of whether the assistant message
            // also contained text.
            //
            // Edge case: if the assistant message became empty (model called
            // ONLY SummarizeContext, no text), pop it first — an empty
            // assistant message would poison the next API call.
            //
            // To recurse, the API requires the conversation to end with a
            // USER message (otherwise: "must end with user message" 400).
            // So append a minimal "Continue." user message before recursing.
            // The model's preceding text (if any) stays in history so the
            // next turn has full context.
            let assistant_empty = state
                .messages
                .last()
                .map(|m| m.content.is_empty())
                .unwrap_or(false);
            if assistant_empty {
                state.messages.pop();
            }
            // DISABLED on user request — do NOT auto-inject a "Continue."
            // user message and recurse after SummarizeContext. Falls through
            // to normal turn-end handling below.
            // if tool_uses.is_empty() {
            //     // Append a minimal user message so the API call is valid.
            //     state.messages.push(Message {
            //         role: Role::User,
            //         content: vec![ContentBlock::Text {
            //             text: "Continue.".into(),
            //         }],
            //     });
            //     return Box::pin(run_turn(state, api_client, permission, event_tx)).await;
            // }
        }

        if tool_uses.is_empty() {
            let _ = event_tx.send(ConversationEvent::TurnComplete);
            return Ok(());
        }

        // 4b. Stop requested? Cancel pending tools, append interrupt message,
        // do ONE follow-up API round (no tools), then return.
        if state
            .stop_requested
            .load(std::sync::atomic::Ordering::SeqCst)
        {
            tracing::info!(
                pending_tools = tool_uses.len(),
                "stop requested — cancelling tool_uses and injecting interrupt message"
            );

            // Synthesize a cancelled ToolResult for every pending tool_use.
            // The API requires that every tool_use block have a matching
            // tool_result block in the next user message.
            let mut cancelled_results: Vec<ContentBlock> = Vec::with_capacity(tool_uses.len());
            for pending in &tool_uses {
                let output = ToolResultContent::Text(
                    "Tool execution cancelled by user.".to_string(),
                );
                let _ = event_tx.send(ConversationEvent::ToolResult {
                    id: pending.id.clone(),
                    output: output.clone(),
                    is_error: true,
                });
                cancelled_results.push(ContentBlock::ToolResult {
                    tool_use_id: pending.id.clone(),
                    content: output,
                    is_error: Some(true),
                });
            }

            // Combined user message: tool_results then an interrupt text block.
            cancelled_results.push(ContentBlock::Text {
                text: INTERRUPT_MESSAGE.to_string(),
            });
            state.messages.push(Message {
                role: Role::User,
                content: cancelled_results,
            });

            // Clear the flag so the follow-up turn proceeds normally.
            state
                .stop_requested
                .store(false, std::sync::atomic::Ordering::SeqCst);

            // Recurse for one final API round so the model can acknowledge.
            return Box::pin(run_turn(state, api_client, permission, event_tx)).await;
        }

        // 5. Execute tools
        // We check `stop_requested` BEFORE every individual tool execution
        // (sequential) and after each concurrent batch. As soon as the flag
        // is set, all remaining tool_uses get a synthetic cancelled
        // tool_result and we inject the interrupt message + recurse.
        let mut tool_results: Vec<ContentBlock> = Vec::new();
        let mut interrupted = false;

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

        // Concurrent tools: cannot be cancelled mid-batch, but if the flag was
        // set BEFORE the batch even started, skip the entire batch.
        let mut remaining_concurrent: Vec<PendingToolUse> = Vec::new();
        if !concurrent.is_empty() {
            if state
                .stop_requested
                .load(std::sync::atomic::Ordering::SeqCst)
            {
                remaining_concurrent = concurrent;
                interrupted = true;
            } else {
                let results = futures::future::join_all(concurrent.into_iter().map(|pending| {
                    execute_tool_with_permission(
                        pending,
                        &state.tools,
                        &state.tool_context,
                        permission,
                        event_tx,
                    )
                }))
                .await;
                for result in results {
                    tool_results.push(result?);
                }
            }
        }

        // Sequential tools: check flag before EACH execution. As soon as it's
        // set, the rest of the queue is moved into `remaining_sequential` and
        // never executed.
        let mut remaining_sequential: Vec<PendingToolUse> = Vec::new();
        let mut sequential_iter = sequential.into_iter();
        if !interrupted {
            for pending in sequential_iter.by_ref() {
                if state
                    .stop_requested
                    .load(std::sync::atomic::Ordering::SeqCst)
                {
                    // Push back and break — this tool and all following ones
                    // get cancelled.
                    remaining_sequential.push(pending);
                    interrupted = true;
                    break;
                }
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
        }
        // Drain the rest into remaining_sequential (after break, or if
        // concurrent batch already triggered interrupt).
        remaining_sequential.extend(sequential_iter);

        if interrupted {
            tracing::info!(
                executed = tool_results.len(),
                cancelled = remaining_concurrent.len() + remaining_sequential.len(),
                "stop requested during tool execution — cancelling remaining tools"
            );

            // Synthetic cancelled tool_results for every skipped tool_use.
            for pending in remaining_concurrent.iter().chain(remaining_sequential.iter()) {
                let output = ToolResultContent::Text(
                    "Tool execution cancelled by user.".to_string(),
                );
                let _ = event_tx.send(ConversationEvent::ToolResult {
                    id: pending.id.clone(),
                    output: output.clone(),
                    is_error: true,
                });
                tool_results.push(ContentBlock::ToolResult {
                    tool_use_id: pending.id.clone(),
                    content: output,
                    is_error: Some(true),
                });
            }

            // Append the interrupt text block so the model knows why it
            // was stopped.
            tool_results.push(ContentBlock::Text {
                text: INTERRUPT_MESSAGE.to_string(),
            });
            state.messages.push(Message {
                role: Role::User,
                content: tool_results,
            });

            // Clear the flag and recurse for one final acknowledgement turn.
            state
                .stop_requested
                .store(false, std::sync::atomic::Ordering::SeqCst);
            return Box::pin(run_turn(state, api_client, permission, event_tx)).await;
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
            stop_requested: new_stop_flag(),
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

    // ── Stop / interrupt tests ─────────────────────────────────────

    /// Tool that records how many times `call()` was invoked.
    /// Used to verify that stop_requested truly prevents tool execution.
    struct CountingTool {
        counter: std::sync::Arc<std::sync::atomic::AtomicU32>,
    }

    #[async_trait::async_trait]
    impl Tool for CountingTool {
        fn definition(&self) -> ToolDefinition {
            ToolDefinition {
                name: "Echo".into(),
                description: "counts calls".into(),
                input_schema: serde_json::json!({"type":"object"}),
            }
        }
        async fn call(
            &self,
            _input: serde_json::Value,
            _ctx: &ToolContext,
        ) -> Result<ToolOutput, ToolError> {
            self.counter
                .fetch_add(1, std::sync::atomic::Ordering::SeqCst);
            Ok(ToolOutput {
                content: ToolResultContent::Text("should not appear".into()),
                is_error: false,
            })
        }
        fn is_concurrent(&self) -> bool {
            false
        }
    }

    fn tool_use_round() -> Vec<SseEvent> {
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
        ]
    }

    fn text_round(text: &str) -> Vec<SseEvent> {
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
                    text: text.into(),
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
        ]
    }

    #[tokio::test]
    async fn test_stop_requested_cancels_pending_tools_and_injects_interrupt_message() {
        let mock = MockApiClient {
            responses: std::sync::Mutex::new(vec![
                tool_use_round(),
                text_round("Understood, I've stopped."),
            ]),
        };
        let counter = std::sync::Arc::new(std::sync::atomic::AtomicU32::new(0));
        let stop_flag = new_stop_flag();
        // Pre-set the stop flag: the very first check after stream end will fire.
        stop_flag.store(true, std::sync::atomic::Ordering::SeqCst);
        // But run_turn resets stop_requested at start — so we need to set it
        // DURING the run. We use a custom test: inject stop via a tool
        // inside the pre_turn flag. Instead, override run_turn's reset by
        // setting the flag AFTER entry. Simplest: use a custom stop_flag
        // that gets set by the mock API during streaming.
        // The MockApiClient yields events synchronously via futures::stream::iter,
        // so there's no await point for the test to set the flag mid-stream.
        // Workaround: use a wrapper MockApiClient that flips the flag on
        // the first stream_message() call.

        struct StopSettingClient {
            inner: MockApiClient,
            flag: std::sync::Arc<std::sync::atomic::AtomicBool>,
        }
        #[async_trait::async_trait]
        impl ApiClient for StopSettingClient {
            async fn stream_message(
                &self,
                request: ApiRequest,
            ) -> Result<SseStream, ApiError> {
                // After the first request returns its stream, set the flag so
                // run_turn's post-stream check sees it.
                let stream = self.inner.stream_message(request).await?;
                self.flag
                    .store(true, std::sync::atomic::Ordering::SeqCst);
                Ok(stream)
            }
        }

        let client = StopSettingClient {
            inner: mock,
            flag: stop_flag.clone(),
        };

        let mut state = ConversationState {
            messages: vec![Message {
                role: Role::User,
                content: vec![ContentBlock::Text {
                    text: "do a thing".into(),
                }],
            }],
            model: "test".into(),
            system_prompt: vec![SystemBlock::text("sys")],
            max_tokens: 1024,
            tools: vec![Box::new(CountingTool {
                counter: counter.clone(),
            })],
            tool_context: ToolContext::default(),
            stop_requested: stop_flag.clone(),
        };
        let (tx, mut rx) = mpsc::unbounded_channel();

        run_turn(&mut state, &client, &AutoApprovePrompter, &tx)
            .await
            .unwrap();

        // The tool must NEVER have been called.
        assert_eq!(
            counter.load(std::sync::atomic::Ordering::SeqCst),
            0,
            "CountingTool must not be invoked when stop was requested"
        );

        // The message history must contain the interrupt text.
        let all_text: String = state
            .messages
            .iter()
            .flat_map(|m| m.content.iter())
            .filter_map(|c| match c {
                ContentBlock::Text { text } => Some(text.clone()),
                _ => None,
            })
            .collect::<Vec<_>>()
            .join("\n");
        assert!(
            all_text.contains(INTERRUPT_MESSAGE),
            "INTERRUPT_MESSAGE must appear in the conversation history, got:\n{all_text}"
        );

        // A cancelled ToolResult event must have been emitted.
        let events: Vec<_> = std::iter::from_fn(|| rx.try_recv().ok()).collect();
        assert!(
            events.iter().any(|e| matches!(
                e,
                ConversationEvent::ToolResult { is_error: true, .. }
            )),
            "expected a cancelled ToolResult event with is_error=true"
        );

        // The follow-up text ("Understood...") must also appear.
        assert!(
            all_text.contains("Understood"),
            "follow-up assistant text missing"
        );
    }

    #[tokio::test]
    async fn test_stop_flag_reset_at_start_of_run_turn() {
        // If the flag was left set from a previous turn, run_turn should
        // clear it immediately so it doesn't spuriously interrupt the new turn.
        let mock = MockApiClient {
            responses: std::sync::Mutex::new(vec![text_round("done")]),
        };
        let stop_flag = new_stop_flag();
        stop_flag.store(true, std::sync::atomic::Ordering::SeqCst);

        let mut state = ConversationState {
            messages: vec![Message {
                role: Role::User,
                content: vec![ContentBlock::Text {
                    text: "hi".into(),
                }],
            }],
            model: "test".into(),
            system_prompt: vec![SystemBlock::text("sys")],
            max_tokens: 1024,
            tools: vec![],
            tool_context: ToolContext::default(),
            stop_requested: stop_flag.clone(),
        };
        let (tx, _rx) = mpsc::unbounded_channel();

        run_turn(&mut state, &mock, &AutoApprovePrompter, &tx)
            .await
            .unwrap();

        assert!(
            !stop_flag.load(std::sync::atomic::Ordering::SeqCst),
            "stop_requested must be reset to false at the start of run_turn"
        );
    }

    #[tokio::test]
    async fn test_stop_without_pending_tools_is_noop() {
        // If the stream ends with no tool_uses, the turn completes normally —
        // the stop flag has nothing to interrupt.
        let mock = MockApiClient {
            responses: std::sync::Mutex::new(vec![text_round("all done")]),
        };
        let stop_flag = new_stop_flag();

        struct FlagSetter {
            inner: MockApiClient,
            flag: std::sync::Arc<std::sync::atomic::AtomicBool>,
        }
        #[async_trait::async_trait]
        impl ApiClient for FlagSetter {
            async fn stream_message(
                &self,
                request: ApiRequest,
            ) -> Result<SseStream, ApiError> {
                let stream = self.inner.stream_message(request).await?;
                self.flag
                    .store(true, std::sync::atomic::Ordering::SeqCst);
                Ok(stream)
            }
        }

        let client = FlagSetter {
            inner: mock,
            flag: stop_flag.clone(),
        };

        let mut state = ConversationState {
            messages: vec![Message {
                role: Role::User,
                content: vec![ContentBlock::Text {
                    text: "hi".into(),
                }],
            }],
            model: "test".into(),
            system_prompt: vec![SystemBlock::text("sys")],
            max_tokens: 1024,
            tools: vec![],
            tool_context: ToolContext::default(),
            stop_requested: stop_flag.clone(),
        };
        let (tx, _rx) = mpsc::unbounded_channel();

        run_turn(&mut state, &client, &AutoApprovePrompter, &tx)
            .await
            .unwrap();

        // No INTERRUPT_MESSAGE — it's only injected when there are pending tool_uses.
        let all_text: String = state
            .messages
            .iter()
            .flat_map(|m| m.content.iter())
            .filter_map(|c| match c {
                ContentBlock::Text { text } => Some(text.clone()),
                _ => None,
            })
            .collect::<Vec<_>>()
            .join("\n");
        assert!(
            !all_text.contains(INTERRUPT_MESSAGE),
            "INTERRUPT_MESSAGE must NOT appear when there were no pending tool_uses"
        );
        assert!(all_text.contains("all done"));
    }

    #[tokio::test]
    async fn test_stop_preserves_tool_use_tool_result_pairing() {
        // The Anthropic API rejects conversations where a tool_use block
        // doesn't have a matching tool_result in the next user message.
        // Verify that interrupt synthesis produces the required pairing.
        let mock = MockApiClient {
            responses: std::sync::Mutex::new(vec![
                tool_use_round(),
                text_round("ok"),
            ]),
        };
        let stop_flag = new_stop_flag();

        struct FlagSetter {
            inner: MockApiClient,
            flag: std::sync::Arc<std::sync::atomic::AtomicBool>,
        }
        #[async_trait::async_trait]
        impl ApiClient for FlagSetter {
            async fn stream_message(
                &self,
                request: ApiRequest,
            ) -> Result<SseStream, ApiError> {
                let stream = self.inner.stream_message(request).await?;
                self.flag
                    .store(true, std::sync::atomic::Ordering::SeqCst);
                Ok(stream)
            }
        }
        let client = FlagSetter {
            inner: mock,
            flag: stop_flag.clone(),
        };

        let counter = std::sync::Arc::new(std::sync::atomic::AtomicU32::new(0));
        let mut state = ConversationState {
            messages: vec![Message {
                role: Role::User,
                content: vec![ContentBlock::Text {
                    text: "do it".into(),
                }],
            }],
            model: "test".into(),
            system_prompt: vec![SystemBlock::text("sys")],
            max_tokens: 1024,
            tools: vec![Box::new(CountingTool { counter })],
            tool_context: ToolContext::default(),
            stop_requested: stop_flag.clone(),
        };
        let (tx, _rx) = mpsc::unbounded_channel();

        run_turn(&mut state, &client, &AutoApprovePrompter, &tx)
            .await
            .unwrap();

        // Find the assistant message with the tool_use block.
        let tool_use_ids: Vec<String> = state
            .messages
            .iter()
            .flat_map(|m| m.content.iter())
            .filter_map(|c| match c {
                ContentBlock::ToolUse { id, .. } => Some(id.clone()),
                _ => None,
            })
            .collect();
        assert_eq!(tool_use_ids.len(), 1);

        // Every tool_use id must have a matching tool_result id in the history.
        let tool_result_ids: Vec<String> = state
            .messages
            .iter()
            .flat_map(|m| m.content.iter())
            .filter_map(|c| match c {
                ContentBlock::ToolResult { tool_use_id, .. } => Some(tool_use_id.clone()),
                _ => None,
            })
            .collect();
        for id in &tool_use_ids {
            assert!(
                tool_result_ids.contains(id),
                "tool_use id {id} must have a matching tool_result"
            );
        }
    }

    /// A tool that records every call AND sets the stop flag during the FIRST call.
    /// Models the real-world scenario: the user presses Esc-Esc while tool 1 of N
    /// is running. Tools 2..N must NOT execute.
    struct StopOnFirstCallTool {
        counter: std::sync::Arc<std::sync::atomic::AtomicU32>,
        flag: std::sync::Arc<std::sync::atomic::AtomicBool>,
    }

    #[async_trait::async_trait]
    impl Tool for StopOnFirstCallTool {
        fn definition(&self) -> ToolDefinition {
            ToolDefinition {
                name: "Echo".into(),
                description: "stops on first call".into(),
                input_schema: serde_json::json!({"type":"object"}),
            }
        }
        async fn call(
            &self,
            _input: serde_json::Value,
            _ctx: &ToolContext,
        ) -> Result<ToolOutput, ToolError> {
            let n = self
                .counter
                .fetch_add(1, std::sync::atomic::Ordering::SeqCst);
            if n == 0 {
                // Simulate: while tool 1 is running, user presses Esc-Esc.
                self.flag
                    .store(true, std::sync::atomic::Ordering::SeqCst);
            }
            Ok(ToolOutput {
                content: ToolResultContent::Text(format!("call #{n}")),
                is_error: false,
            })
        }
        fn is_concurrent(&self) -> bool {
            false
        }
    }

    fn three_tool_use_round() -> Vec<SseEvent> {
        let mut events = vec![SseEvent::MessageStart {
            message: MessageStartInfo {
                id: "msg_3tu".into(),
                model: "test".into(),
                usage: None,
            },
        }];
        for i in 0..3u32 {
            events.push(SseEvent::ContentBlockStart {
                index: i,
                content_block: ContentBlockStartInfo::ToolUse {
                    id: format!("toolu_{i}"),
                    name: "Echo".into(),
                },
            });
            events.push(SseEvent::ContentBlockDelta {
                index: i,
                delta: Delta::InputJsonDelta {
                    partial_json: format!(r#"{{"n":{i}}}"#),
                },
            });
            events.push(SseEvent::ContentBlockStop { index: i });
        }
        events.push(SseEvent::MessageDelta {
            delta: MessageDeltaInfo {
                stop_reason: Some("tool_use".into()),
            },
            usage: None,
        });
        events.push(SseEvent::MessageStop);
        events
    }

    #[tokio::test]
    async fn test_stop_during_first_sequential_tool_skips_remaining_tools() {
        // Scenario the user explicitly demanded:
        // 3 sequential tool_uses are pending. Tool 1 starts, user presses Esc-Esc
        // (modeled by tool 1 setting the stop_flag during its call). Tools 2 and 3
        // MUST NOT execute. The conversation history MUST still satisfy the
        // Anthropic API's 1:1 tool_use ↔ tool_result pairing requirement, and
        // the cancelled tools get synthetic "Tool execution cancelled by user."
        // tool_results.
        let mock = MockApiClient {
            responses: std::sync::Mutex::new(vec![
                three_tool_use_round(),
                text_round("Stopped as requested."),
            ]),
        };
        let counter = std::sync::Arc::new(std::sync::atomic::AtomicU32::new(0));
        let stop_flag = new_stop_flag();

        let mut state = ConversationState {
            messages: vec![Message {
                role: Role::User,
                content: vec![ContentBlock::Text {
                    text: "do three things".into(),
                }],
            }],
            model: "test".into(),
            system_prompt: vec![SystemBlock::text("sys")],
            max_tokens: 1024,
            tools: vec![Box::new(StopOnFirstCallTool {
                counter: counter.clone(),
                flag: stop_flag.clone(),
            })],
            tool_context: ToolContext::default(),
            stop_requested: stop_flag.clone(),
        };
        let (tx, mut rx) = mpsc::unbounded_channel();

        run_turn(&mut state, &mock, &AutoApprovePrompter, &tx)
            .await
            .unwrap();

        // EXACTLY one tool call — the second and third must have been skipped.
        assert_eq!(
            counter.load(std::sync::atomic::Ordering::SeqCst),
            1,
            "only the first sequential tool may run; remaining tools must be cancelled"
        );

        // All three tool_use IDs must still have matching tool_results
        // (1 real + 2 synthetic cancelled).
        let tool_use_ids: Vec<String> = state
            .messages
            .iter()
            .flat_map(|m| m.content.iter())
            .filter_map(|c| match c {
                ContentBlock::ToolUse { id, .. } => Some(id.clone()),
                _ => None,
            })
            .collect();
        assert_eq!(tool_use_ids.len(), 3, "expected 3 tool_use blocks");

        let tool_results: Vec<(&String, &ToolResultContent, Option<bool>)> = state
            .messages
            .iter()
            .flat_map(|m| m.content.iter())
            .filter_map(|c| match c {
                ContentBlock::ToolResult {
                    tool_use_id,
                    content,
                    is_error,
                } => Some((tool_use_id, content, *is_error)),
                _ => None,
            })
            .collect();
        assert_eq!(
            tool_results.len(),
            3,
            "expected 3 tool_result blocks (1:1 pairing)"
        );
        for id in &tool_use_ids {
            assert!(
                tool_results.iter().any(|(rid, _, _)| *rid == id),
                "tool_use id {id} must have a matching tool_result"
            );
        }

        // Exactly 2 of the 3 tool_results must be cancelled (is_error=true with
        // the cancellation message).
        let cancelled: Vec<_> = tool_results
            .iter()
            .filter(|(_, content, is_err)| {
                matches!(is_err, Some(true))
                    && matches!(
                        content,
                        ToolResultContent::Text(t) if t.contains("cancelled by user")
                    )
            })
            .collect();
        assert_eq!(
            cancelled.len(),
            2,
            "exactly 2 tool_results must be cancellation markers (the 2 skipped tools)"
        );

        // The interrupt message must appear in history.
        let all_text: String = state
            .messages
            .iter()
            .flat_map(|m| m.content.iter())
            .filter_map(|c| match c {
                ContentBlock::Text { text } => Some(text.clone()),
                _ => None,
            })
            .collect::<Vec<_>>()
            .join("\n");
        assert!(
            all_text.contains(INTERRUPT_MESSAGE),
            "INTERRUPT_MESSAGE must appear after a mid-batch stop"
        );
        assert!(
            all_text.contains("Stopped as requested."),
            "the follow-up assistant turn must run after the interrupt"
        );

        // Cancelled-ToolResult events must have been emitted on the channel
        // for the 2 skipped tools (so the UI can render them).
        let events: Vec<_> = std::iter::from_fn(|| rx.try_recv().ok()).collect();
        let cancelled_events = events
            .iter()
            .filter(|e| {
                matches!(
                    e,
                    ConversationEvent::ToolResult {
                        is_error: true,
                        output: ToolResultContent::Text(t),
                        ..
                    } if t.contains("cancelled by user")
                )
            })
            .count();
        assert_eq!(
            cancelled_events, 2,
            "expected 2 cancelled-ToolResult events for the 2 skipped tools"
        );
    }

    #[tokio::test]
    async fn test_stop_after_all_tools_completed_still_injects_interrupt_for_next_round() {
        // Edge case: the stop flag is set *after* the last sequential tool finishes
        // (e.g. user pressed Esc-Esc during the LAST tool). In that case all tools
        // have legitimately run; no synthetic cancellation is needed. The flag will
        // be picked up at the top of the NEXT loop iteration's tool_uses check
        // (existing behavior — covered by test_stop_requested_cancels_pending...).
        // This test just verifies that "stop after the only tool finished" doesn't
        // double-emit cancellations or corrupt history.
        let mock = MockApiClient {
            responses: std::sync::Mutex::new(vec![
                tool_use_round(),
                text_round("done"),
            ]),
        };
        let counter = std::sync::Arc::new(std::sync::atomic::AtomicU32::new(0));
        let stop_flag = new_stop_flag();

        let mut state = ConversationState {
            messages: vec![Message {
                role: Role::User,
                content: vec![ContentBlock::Text {
                    text: "one thing".into(),
                }],
            }],
            model: "test".into(),
            system_prompt: vec![SystemBlock::text("sys")],
            max_tokens: 1024,
            tools: vec![Box::new(StopOnFirstCallTool {
                counter: counter.clone(),
                flag: stop_flag.clone(),
            })],
            tool_context: ToolContext::default(),
            stop_requested: stop_flag.clone(),
        };
        let (tx, _rx) = mpsc::unbounded_channel();

        run_turn(&mut state, &mock, &AutoApprovePrompter, &tx)
            .await
            .unwrap();

        // The single tool ran exactly once.
        assert_eq!(counter.load(std::sync::atomic::Ordering::SeqCst), 1);

        // tool_use ↔ tool_result pairing is intact.
        let tool_use_ids: Vec<String> = state
            .messages
            .iter()
            .flat_map(|m| m.content.iter())
            .filter_map(|c| match c {
                ContentBlock::ToolUse { id, .. } => Some(id.clone()),
                _ => None,
            })
            .collect();
        let tool_result_ids: Vec<String> = state
            .messages
            .iter()
            .flat_map(|m| m.content.iter())
            .filter_map(|c| match c {
                ContentBlock::ToolResult { tool_use_id, .. } => Some(tool_use_id.clone()),
                _ => None,
            })
            .collect();
        for id in &tool_use_ids {
            assert!(tool_result_ids.contains(id));
        }
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
            stop_requested: new_stop_flag(),
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
            stop_requested: new_stop_flag(),
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
            stop_requested: new_stop_flag(),
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

    #[tokio::test]
    async fn test_auto_compact_if_needed_skips_when_below_threshold() {
        let turn_usage = crate::TurnUsage {
            input_tokens: 10_000,
            output_tokens: 1_000,
            cache_tokens: 0,
        };
        let mut state = ConversationState {
            messages: Vec::new(),
            model: "m".into(),
            system_prompt: vec![SystemBlock::text("s")],
            max_tokens: 1000,
            tools: Vec::new(),
            tool_context: crate::ToolContext {
                working_directory: std::path::PathBuf::new(),
                timeout: std::time::Duration::from_secs(1),
            },
            stop_requested: crate::new_stop_flag(),
        };
        let (tx, _rx) = mpsc::unbounded_channel();
        let mock = MockApiClient { responses: std::sync::Mutex::new(vec![]) };
        let compacted = auto_compact_if_needed(&turn_usage, &mut state, &mock, &tx).await;
        assert!(!compacted, "should not compact when below threshold");
    }

    #[tokio::test]
    async fn test_auto_compact_if_needed_triggers_when_above_threshold() {
        let turn_usage = crate::TurnUsage {
            input_tokens: AUTO_COMPACT_THRESHOLD + 1,
            output_tokens: 0,
            cache_tokens: 0,
        };
        // Need at least 2 messages for compaction to proceed
        let mut state = ConversationState {
            messages: vec![
                Message { role: Role::User, content: vec![ContentBlock::Text { text: "hello".into() }] },
                Message { role: Role::Assistant, content: vec![ContentBlock::Text { text: "hi".into() }] },
            ],
            model: "m".into(),
            system_prompt: vec![SystemBlock::text("s")],
            max_tokens: 1000,
            tools: Vec::new(),
            tool_context: crate::ToolContext {
                working_directory: std::path::PathBuf::new(),
                timeout: std::time::Duration::from_secs(1),
            },
            stop_requested: crate::new_stop_flag(),
        };
        let (tx, mut rx) = mpsc::unbounded_channel();
        // Mock returns a summary response for the compaction call
        let mock = MockApiClient {
            responses: std::sync::Mutex::new(vec![vec![
                SseEvent::MessageStart {
                    message: MessageStartInfo {
                        id: "msg1".into(),
                        model: "m".into(),
                        usage: Some(UsageInfo { input_tokens: 100, output_tokens: 50,
                            cache_creation_input_tokens: None, cache_read_input_tokens: None }),
                    },
                },
                SseEvent::ContentBlockStart { index: 0, content_block: ContentBlockStartInfo::Text { text: Some(String::new()) } },
                SseEvent::ContentBlockDelta { index: 0, delta: Delta::TextDelta { text: "Summary.".into() } },
                SseEvent::ContentBlockStop { index: 0 },
                SseEvent::MessageDelta { delta: MessageDeltaInfo { stop_reason: Some("end_turn".into()) },
                    usage: Some(UsageInfo { input_tokens: 100, output_tokens: 50,
                        cache_creation_input_tokens: None, cache_read_input_tokens: None }) },
                SseEvent::MessageStop,
            ]]),
        };
        let compacted = auto_compact_if_needed(&turn_usage, &mut state, &mock, &tx).await;
        assert!(compacted, "should compact when above threshold");

        // Should have emitted CompactionStarted and CompactionComplete
        let events: Vec<_> = std::iter::from_fn(|| rx.try_recv().ok()).collect();
        assert!(events.iter().any(|e| matches!(e, ConversationEvent::CompactionStarted)),
            "should emit CompactionStarted");
        assert!(events.iter().any(|e| matches!(e, ConversationEvent::CompactionComplete { .. })),
            "should emit CompactionComplete");
    }

    // ── SummarizeContext tests ────────────────────────────────────────────

    #[test]
    fn test_apply_summarize_context_replaces_tool_result() {
        let mut messages = vec![
            Message {
                role: Role::User,
                content: vec![ContentBlock::Text { text: "read foo".into() }],
            },
            Message {
                role: Role::Assistant,
                content: vec![ContentBlock::ToolUse {
                    id: "toolu_abc".into(),
                    name: "Read".into(),
                    input: serde_json::json!({"file_path": "foo.rs"}),
                }],
            },
            Message {
                role: Role::User,
                content: vec![ContentBlock::ToolResult {
                    tool_use_id: "toolu_abc".into(),
                    content: ToolResultContent::Text("fn main() { ... 2000 lines ... }".into()),
                    is_error: None,
                }],
            },
        ];

        let replaced = apply_summarize_context(
            &mut messages,
            &["Read foo.rs: 2000 lines, not relevant".into()],
        );

        assert_eq!(replaced, 1);
        match &messages[2].content[0] {
            ContentBlock::ToolResult { content, .. } => match content {
                ToolResultContent::Text(t) => {
                    assert!(t.contains("[Summarized]"));
                    assert!(t.contains("not relevant"));
                }
                _ => panic!("expected Text content"),
            },
            _ => panic!("expected ToolResult"),
        }
    }

    #[test]
    fn test_apply_summarize_context_no_tool_results_in_last_user_msg() {
        // Last user message is plain text → nothing to summarize.
        let mut messages = vec![
            Message {
                role: Role::User,
                content: vec![ContentBlock::Text { text: "hi".into() }],
            },
        ];

        let replaced = apply_summarize_context(&mut messages, &["summary".into()]);
        assert_eq!(replaced, 0);
    }

    #[test]
    fn test_apply_summarize_context_positional_multiple() {
        // Last user msg has three tool_results — all three summarized positionally.
        let mut messages = vec![
            Message {
                role: Role::User,
                content: vec![
                    ContentBlock::ToolResult {
                        tool_use_id: "toolu_1".into(),
                        content: ToolResultContent::Text("big output 1".into()),
                        is_error: None,
                    },
                    ContentBlock::ToolResult {
                        tool_use_id: "toolu_2".into(),
                        content: ToolResultContent::Text("big output 2".into()),
                        is_error: None,
                    },
                    ContentBlock::ToolResult {
                        tool_use_id: "toolu_3".into(),
                        content: ToolResultContent::Text("big output 3".into()),
                        is_error: None,
                    },
                ],
            },
        ];

        let replaced = apply_summarize_context(
            &mut messages,
            &["summary A".into(), "summary B".into(), "summary C".into()],
        );
        assert_eq!(replaced, 3);

        // Position 0 → "summary A", position 1 → "summary B", position 2 → "summary C"
        let contents: Vec<String> = messages[0]
            .content
            .iter()
            .filter_map(|b| match b {
                ContentBlock::ToolResult { content: ToolResultContent::Text(t), .. } => Some(t.clone()),
                _ => None,
            })
            .collect();
        assert_eq!(contents.len(), 3);
        assert!(contents[0].contains("summary A"), "pos 0: {}", contents[0]);
        assert!(contents[1].contains("summary B"), "pos 1: {}", contents[1]);
        assert!(contents[2].contains("summary C"), "pos 2: {}", contents[2]);
    }

    #[test]
    fn test_apply_summarize_context_empty_string_skips_position() {
        // ["", "x", ""] → only position 1 is replaced.
        let mut messages = vec![
            Message {
                role: Role::User,
                content: vec![
                    ContentBlock::ToolResult {
                        tool_use_id: "toolu_1".into(),
                        content: ToolResultContent::Text("original A".into()),
                        is_error: None,
                    },
                    ContentBlock::ToolResult {
                        tool_use_id: "toolu_2".into(),
                        content: ToolResultContent::Text("original B".into()),
                        is_error: None,
                    },
                    ContentBlock::ToolResult {
                        tool_use_id: "toolu_3".into(),
                        content: ToolResultContent::Text("original C".into()),
                        is_error: None,
                    },
                ],
            },
        ];

        let replaced = apply_summarize_context(
            &mut messages,
            &["".into(), "middle summary".into(), "".into()],
        );
        assert_eq!(replaced, 1);

        match &messages[0].content[0] {
            ContentBlock::ToolResult { content: ToolResultContent::Text(t), .. } => {
                assert_eq!(t, "original A", "pos 0 untouched");
            }
            _ => panic!(),
        }
        match &messages[0].content[1] {
            ContentBlock::ToolResult { content: ToolResultContent::Text(t), .. } => {
                assert!(t.contains("[Summarized]") && t.contains("middle summary"), "pos 1 replaced");
            }
            _ => panic!(),
        }
        match &messages[0].content[2] {
            ContentBlock::ToolResult { content: ToolResultContent::Text(t), .. } => {
                assert_eq!(t, "original C", "pos 2 untouched");
            }
            _ => panic!(),
        }
    }

    #[test]
    fn test_apply_summarize_context_fewer_summaries_than_results() {
        // 3 results, 1 summary → only first replaced, other two left.
        let mut messages = vec![
            Message {
                role: Role::User,
                content: vec![
                    ContentBlock::ToolResult {
                        tool_use_id: "t1".into(),
                        content: ToolResultContent::Text("A".into()),
                        is_error: None,
                    },
                    ContentBlock::ToolResult {
                        tool_use_id: "t2".into(),
                        content: ToolResultContent::Text("B".into()),
                        is_error: None,
                    },
                    ContentBlock::ToolResult {
                        tool_use_id: "t3".into(),
                        content: ToolResultContent::Text("C".into()),
                        is_error: None,
                    },
                ],
            },
        ];

        let replaced = apply_summarize_context(&mut messages, &["only first".into()]);
        assert_eq!(replaced, 1);

        match &messages[0].content[1] {
            ContentBlock::ToolResult { content: ToolResultContent::Text(t), .. } => assert_eq!(t, "B"),
            _ => panic!(),
        }
        match &messages[0].content[2] {
            ContentBlock::ToolResult { content: ToolResultContent::Text(t), .. } => assert_eq!(t, "C"),
            _ => panic!(),
        }
    }

    #[test]
    fn test_apply_summarize_context_more_summaries_than_results() {
        // 1 result, 3 summaries → only first applied, overflow silently ignored.
        let mut messages = vec![
            Message {
                role: Role::User,
                content: vec![ContentBlock::ToolResult {
                    tool_use_id: "t1".into(),
                    content: ToolResultContent::Text("A".into()),
                    is_error: None,
                }],
            },
        ];

        let replaced = apply_summarize_context(
            &mut messages,
            &["first".into(), "overflow 2".into(), "overflow 3".into()],
        );
        assert_eq!(replaced, 1);
        match &messages[0].content[0] {
            ContentBlock::ToolResult { content: ToolResultContent::Text(t), .. } => {
                assert!(t.contains("first"));
            }
            _ => panic!(),
        }
    }

    #[test]
    fn test_apply_summarize_context_only_touches_most_recent_round() {
        // Two rounds; older round must stay untouched.
        let mut messages = vec![
            Message {
                role: Role::User,
                content: vec![ContentBlock::ToolResult {
                    tool_use_id: "old".into(),
                    content: ToolResultContent::Text("OLD original".into()),
                    is_error: None,
                }],
            },
            Message {
                role: Role::Assistant,
                content: vec![ContentBlock::Text { text: "thinking".into() }],
            },
            Message {
                role: Role::User,
                content: vec![ContentBlock::ToolResult {
                    tool_use_id: "new".into(),
                    content: ToolResultContent::Text("NEW original".into()),
                    is_error: None,
                }],
            },
        ];

        let replaced = apply_summarize_context(&mut messages, &["replace newest".into()]);
        assert_eq!(replaced, 1);

        // Older round untouched
        match &messages[0].content[0] {
            ContentBlock::ToolResult { content: ToolResultContent::Text(t), .. } => {
                assert_eq!(t, "OLD original");
            }
            _ => panic!(),
        }
        // Newest round replaced
        match &messages[2].content[0] {
            ContentBlock::ToolResult { content: ToolResultContent::Text(t), .. } => {
                assert!(t.contains("replace newest"));
            }
            _ => panic!(),
        }
    }

    #[test]
    fn test_apply_summarize_context_preserves_pairing() {
        // After summarization, tool_use_id must still match.
        let mut messages = vec![
            Message {
                role: Role::Assistant,
                content: vec![ContentBlock::ToolUse {
                    id: "toolu_abc".into(),
                    name: "Bash".into(),
                    input: serde_json::json!({"command": "ls"}),
                }],
            },
            Message {
                role: Role::User,
                content: vec![ContentBlock::ToolResult {
                    tool_use_id: "toolu_abc".into(),
                    content: ToolResultContent::Text("file1\nfile2\n...5000 lines".into()),
                    is_error: None,
                }],
            },
        ];

        apply_summarize_context(
            &mut messages,
            &["ls output: 5000 files".into()],
        );

        // ToolUse still has id "toolu_abc"
        match &messages[0].content[0] {
            ContentBlock::ToolUse { id, .. } => assert_eq!(id, "toolu_abc"),
            _ => panic!("expected ToolUse"),
        }
        // ToolResult still has tool_use_id "toolu_abc"
        match &messages[1].content[0] {
            ContentBlock::ToolResult { tool_use_id, .. } => assert_eq!(tool_use_id, "toolu_abc"),
            _ => panic!("expected ToolResult"),
        }
    }

    #[test]
    fn test_summarize_context_definition_has_correct_schema() {
        let def = summarize_context_definition();
        assert_eq!(def.name, "SummarizeContext");
        assert!(def.description.contains("meta-tool"));
        let schema = &def.input_schema;
        assert_eq!(schema["required"][0], "summaries");
        let items = &schema["properties"]["summaries"]["items"];
        // New schema: items are plain strings, no IDs, no indices.
        assert_eq!(items["type"], "string", "summaries items must be strings, not objects");
    }

    #[test]
    #[ignore = "SummarizeContext tool injection disabled"]
    fn test_build_request_includes_summarize_context_tool() {
        let state = make_test_state("hello");
        let request = build_request(&state);
        assert!(
            request.tools.iter().any(|t| t.name == "SummarizeContext"),
            "SummarizeContext tool must be in every API request"
        );
    }

    #[tokio::test]
    async fn test_summarize_context_meta_tool_erased_from_history() {
        // Scenario: LLM calls SummarizeContext + Echo in same turn.
        // After processing:
        // - SummarizeContext tool_use is removed from assistant message
        // - No ToolResult for SummarizeContext in the history
        // - Echo still executes normally

        // Turn 1: assistant calls Echo, response comes back
        // Turn 2: assistant calls SummarizeContext on the Echo result + text "done"

        // Round 1: Echo tool call
        let round1 = vec![
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
                    id: "toolu_echo".into(),
                    name: "Echo".into(),
                },
            },
            SseEvent::ContentBlockDelta {
                index: 0,
                delta: Delta::InputJsonDelta {
                    partial_json: r#"{"text": "big output here"}"#.into(),
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
        ];

        // Round 2: SummarizeContext call (no other tools)
        let round2 = vec![
            SseEvent::MessageStart {
                message: MessageStartInfo {
                    id: "msg_2".into(),
                    model: "test".into(),
                    usage: None,
                },
            },
            SseEvent::ContentBlockStart {
                index: 0,
                content_block: ContentBlockStartInfo::ToolUse {
                    id: "toolu_sc".into(),
                    name: "SummarizeContext".into(),
                },
            },
            SseEvent::ContentBlockDelta {
                index: 0,
                delta: Delta::InputJsonDelta {
                    partial_json: r#"{"summaries":["Echo returned big output, not needed"]}"#.into(),
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
        ];

        // Round 3: final text response after the SC-only round popped the
        // empty assistant message and recursed. Model now produces real text.
        let round3 = vec![
            SseEvent::MessageStart {
                message: MessageStartInfo {
                    id: "msg_3".into(),
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
                    text: "done".into(),
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
            responses: std::sync::Mutex::new(vec![round1, round2, round3]),
        };

        let mut state = make_test_state("test summarize");
        let (tx, mut rx) = mpsc::unbounded_channel();

        run_turn(&mut state, &mock, &AutoApprovePrompter, &tx).await.unwrap();

        // Collect events
        let mut events = Vec::new();
        while let Ok(e) = rx.try_recv() {
            events.push(e);
        }

        // 1. ContextSummarized event was emitted
        assert!(
            events.iter().any(|e| matches!(e, ConversationEvent::ContextSummarized { replaced: 1, requested: 1, .. })),
            "expected ContextSummarized event"
        );

        // 2. The Echo tool_result was replaced with the summary
        let echo_result = state.messages.iter()
            .flat_map(|m| &m.content)
            .find(|b| matches!(b, ContentBlock::ToolResult { tool_use_id, .. } if tool_use_id == "toolu_echo"));
        match echo_result {
            Some(ContentBlock::ToolResult { content, .. }) => match content {
                ToolResultContent::Text(t) => {
                    assert!(t.contains("[Summarized]"), "tool result should be summarized, got: {t}");
                    assert!(t.contains("not needed"), "summary text should be preserved");
                }
                _ => panic!("expected Text content"),
            },
            _ => panic!("expected to find the echo tool result"),
        }

        // 3. No SummarizeContext tool_use or tool_result in history
        for msg in &state.messages {
            for block in &msg.content {
                match block {
                    ContentBlock::ToolUse { name, .. } => {
                        assert_ne!(name, "SummarizeContext", "SummarizeContext tool_use must not appear in history");
                    }
                    ContentBlock::ToolResult { tool_use_id, .. } => {
                        assert_ne!(tool_use_id, "toolu_sc", "SummarizeContext tool_result must not appear in history");
                    }
                    _ => {}
                }
            }
        }

        // 4. TurnComplete was emitted (after erasing SummarizeContext, no remaining tools)
        assert!(
            events.iter().any(|e| matches!(e, ConversationEvent::TurnComplete)),
            "expected TurnComplete"
        );
    }

    /// Regression for the production bug found in
    /// `~/.chlodwig-rs/sessions/2026_04_23_01_03_32.json`: when the model
    /// calls ONLY `SummarizeContext` in a turn (no text, no other tools),
    /// the previous code pushed an empty assistant message and emitted
    /// `TurnComplete`, leaving the user's prompt unanswered (and an empty
    /// assistant message poisoning the history). Fix: pop the empty
    /// message and recurse so the model gets a follow-up round.
    #[tokio::test]
    #[ignore = "SummarizeContext auto-recurse disabled"]
    async fn test_summarize_context_only_turn_pops_empty_msg_and_recurses() {
        // Round 1: SC-only call
        let round1 = vec![
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
                    id: "toolu_sc".into(),
                    name: "SummarizeContext".into(),
                },
            },
            SseEvent::ContentBlockDelta {
                index: 0,
                delta: Delta::InputJsonDelta {
                    partial_json: r#"{"summaries":[]}"#.into(),
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
        ];
        // Round 2: model produces real text after the cleanup
        let round2 = vec![
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
                    text: "answer after cleanup".into(),
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
            responses: std::sync::Mutex::new(vec![round1, round2]),
        };

        let mut state = make_test_state("hi");
        let (tx, mut rx) = mpsc::unbounded_channel();
        run_turn(&mut state, &mock, &AutoApprovePrompter, &tx).await.unwrap();

        // No empty assistant message in history.
        for (i, msg) in state.messages.iter().enumerate() {
            assert!(
                !(matches!(msg.role, Role::Assistant) && msg.content.is_empty()),
                "messages[{i}] is an empty assistant message — would poison the next API call"
            );
        }

        // Final assistant message contains the follow-up text.
        let last = state.messages.last().unwrap();
        assert!(matches!(last.role, Role::Assistant));
        let has_text = last.content.iter().any(|b| matches!(b, ContentBlock::Text { text } if text.contains("answer after cleanup")));
        assert!(has_text, "expected follow-up assistant text after SC-only turn, got: {:?}", last.content);

        // No SC tool_use leaked into history.
        for msg in &state.messages {
            for block in &msg.content {
                if let ContentBlock::ToolUse { name, .. } = block {
                    assert_ne!(name, "SummarizeContext");
                }
            }
        }

        // Exactly ONE TurnComplete (the final one), not two.
        let turn_complete_count = rx.try_iter_count(|e| matches!(e, ConversationEvent::TurnComplete));
        assert_eq!(turn_complete_count, 1, "expected exactly one TurnComplete event");
    }

    /// Regression for the production bug found in
    /// `~/.chlodwig-rs/sessions/2026_04_23_02_18_27.json`: when the model
    /// produces TEXT + only-SummarizeContext tool_uses in the same turn
    /// (no other "real" tool_uses), the previous fix only popped EMPTY
    /// assistant messages. With text present, the message wasn't popped,
    /// `tool_uses` was empty after SC erase, and the loop emitted
    /// `TurnComplete` — leaving the assistant text as a dead-end and the
    /// user having to type "weiter" to continue.
    /// SC must always trigger a recursive follow-up round when no other
    /// tools are queued, even when the assistant turn also had text.
    #[tokio::test]
    #[ignore = "SummarizeContext auto-recurse disabled"]
    async fn test_summarize_context_with_text_recurses_for_followup() {
        // Round 1: assistant produces TEXT and a SummarizeContext call.
        // Some real tool_use first (so there's a tool_result to summarize),
        // then in round 2 the model produces text + SC together.
        let round1 = vec![
            SseEvent::MessageStart { message: MessageStartInfo { id: "msg_1".into(), model: "test".into(), usage: None } },
            SseEvent::ContentBlockStart { index: 0, content_block: ContentBlockStartInfo::ToolUse { id: "toolu_echo".into(), name: "Echo".into() } },
            SseEvent::ContentBlockDelta { index: 0, delta: Delta::InputJsonDelta { partial_json: r#"{"text":"hello"}"#.into() } },
            SseEvent::ContentBlockStop { index: 0 },
            SseEvent::MessageDelta { delta: MessageDeltaInfo { stop_reason: Some("tool_use".into()) }, usage: None },
            SseEvent::MessageStop,
        ];

        // Round 2: assistant text + SC tool_use (no other tool_uses)
        let round2 = vec![
            SseEvent::MessageStart { message: MessageStartInfo { id: "msg_2".into(), model: "test".into(), usage: None } },
            SseEvent::ContentBlockStart { index: 0, content_block: ContentBlockStartInfo::Text { text: None } },
            SseEvent::ContentBlockDelta { index: 0, delta: Delta::TextDelta { text: "Now I'll continue.".into() } },
            SseEvent::ContentBlockStop { index: 0 },
            SseEvent::ContentBlockStart { index: 1, content_block: ContentBlockStartInfo::ToolUse { id: "toolu_sc".into(), name: "SummarizeContext".into() } },
            SseEvent::ContentBlockDelta { index: 1, delta: Delta::InputJsonDelta { partial_json: r#"{"summaries":["echo result"]}"#.into() } },
            SseEvent::ContentBlockStop { index: 1 },
            SseEvent::MessageDelta { delta: MessageDeltaInfo { stop_reason: Some("tool_use".into()) }, usage: None },
            SseEvent::MessageStop,
        ];

        // Round 3: model continues with another tool, then ends.
        let round3 = vec![
            SseEvent::MessageStart { message: MessageStartInfo { id: "msg_3".into(), model: "test".into(), usage: None } },
            SseEvent::ContentBlockStart { index: 0, content_block: ContentBlockStartInfo::Text { text: None } },
            SseEvent::ContentBlockDelta { index: 0, delta: Delta::TextDelta { text: "all done".into() } },
            SseEvent::ContentBlockStop { index: 0 },
            SseEvent::MessageDelta { delta: MessageDeltaInfo { stop_reason: Some("end_turn".into()) }, usage: None },
            SseEvent::MessageStop,
        ];

        let mock = MockApiClient {
            responses: std::sync::Mutex::new(vec![round1, round2, round3]),
        };

        let mut state = make_test_state("hi");
        let (tx, mut rx) = mpsc::unbounded_channel();
        run_turn(&mut state, &mock, &AutoApprovePrompter, &tx).await.unwrap();

        // Assistant message with the text "Now I'll continue." MUST still be
        // in history (text not erased even though SC tool_use was).
        let has_continue_text = state.messages.iter().any(|m| {
            matches!(m.role, Role::Assistant) && m.content.iter().any(|b| {
                matches!(b, ContentBlock::Text { text } if text.contains("Now I'll continue."))
            })
        });
        assert!(has_continue_text, "assistant text must survive SC erase");

        // The follow-up round MUST have happened: msg with "all done" present.
        let has_all_done = state.messages.iter().any(|m| {
            matches!(m.role, Role::Assistant) && m.content.iter().any(|b| {
                matches!(b, ContentBlock::Text { text } if text.contains("all done"))
            })
        });
        assert!(has_all_done, "follow-up round MUST have happened — model intended to continue after SC");

        // Echo tool_result must be summarized.
        let has_summary = state.messages.iter().flat_map(|m| &m.content).any(|b| {
            matches!(b, ContentBlock::ToolResult { content: ToolResultContent::Text(t), .. } if t.contains("[Summarized]") && t.contains("echo result"))
        });
        assert!(has_summary, "echo tool_result must be summarized");

        // No SC tool_use leaked into history.
        for msg in &state.messages {
            for block in &msg.content {
                if let ContentBlock::ToolUse { name, .. } = block {
                    assert_ne!(name, "SummarizeContext");
                }
            }
        }

        // Exactly ONE TurnComplete (the final one).
        let turn_complete_count = rx.try_iter_count(|e| matches!(e, ConversationEvent::TurnComplete));
        assert_eq!(turn_complete_count, 1, "expected exactly one TurnComplete");
    }

    /// Regression for the production crash:
    /// `HTTP 400: "The conversation must end with a user message."`
    /// Reproduce: assistant produces TEXT + only-SC. After SC erase, assistant
    /// message still has the text → not popped. `tool_uses` is empty → recurse
    /// → API request built from `state.messages` ending with assistant → API 400.
    /// Fix: before recursing on SC-only path, append a minimal "Continue."
    /// user message so the conversation ends with a User role.
    #[tokio::test]
    #[ignore = "SummarizeContext auto-recurse disabled"]
    async fn test_summarize_context_followup_appends_continue_user_msg() {
        let round1 = vec![
            SseEvent::MessageStart { message: MessageStartInfo { id: "m1".into(), model: "test".into(), usage: None } },
            SseEvent::ContentBlockStart { index: 0, content_block: ContentBlockStartInfo::ToolUse { id: "toolu_e".into(), name: "Echo".into() } },
            SseEvent::ContentBlockDelta { index: 0, delta: Delta::InputJsonDelta { partial_json: r#"{"text":"x"}"#.into() } },
            SseEvent::ContentBlockStop { index: 0 },
            SseEvent::MessageDelta { delta: MessageDeltaInfo { stop_reason: Some("tool_use".into()) }, usage: None },
            SseEvent::MessageStop,
        ];
        // Round 2: assistant TEXT + only SummarizeContext call
        let round2 = vec![
            SseEvent::MessageStart { message: MessageStartInfo { id: "m2".into(), model: "test".into(), usage: None } },
            SseEvent::ContentBlockStart { index: 0, content_block: ContentBlockStartInfo::Text { text: None } },
            SseEvent::ContentBlockDelta { index: 0, delta: Delta::TextDelta { text: "I'll continue.".into() } },
            SseEvent::ContentBlockStop { index: 0 },
            SseEvent::ContentBlockStart { index: 1, content_block: ContentBlockStartInfo::ToolUse { id: "toolu_sc".into(), name: "SummarizeContext".into() } },
            SseEvent::ContentBlockDelta { index: 1, delta: Delta::InputJsonDelta { partial_json: r#"{"summaries":["sum"]}"#.into() } },
            SseEvent::ContentBlockStop { index: 1 },
            SseEvent::MessageDelta { delta: MessageDeltaInfo { stop_reason: Some("tool_use".into()) }, usage: None },
            SseEvent::MessageStop,
        ];
        // Round 3 (after SC + Continue): final text
        let round3 = vec![
            SseEvent::MessageStart { message: MessageStartInfo { id: "m3".into(), model: "test".into(), usage: None } },
            SseEvent::ContentBlockStart { index: 0, content_block: ContentBlockStartInfo::Text { text: None } },
            SseEvent::ContentBlockDelta { index: 0, delta: Delta::TextDelta { text: "ok done".into() } },
            SseEvent::ContentBlockStop { index: 0 },
            SseEvent::MessageDelta { delta: MessageDeltaInfo { stop_reason: Some("end_turn".into()) }, usage: None },
            SseEvent::MessageStop,
        ];

        // The MockApiClient inspects the request — we want to assert that the
        // request leading into round3 ends with a USER message, not assistant.
        // Use a wrapper that captures every request.
        let captured: std::sync::Arc<std::sync::Mutex<Vec<ApiRequest>>> =
            std::sync::Arc::new(std::sync::Mutex::new(Vec::new()));
        struct Capturing {
            inner: MockApiClient,
            captured: std::sync::Arc<std::sync::Mutex<Vec<ApiRequest>>>,
        }
        #[async_trait::async_trait]
        impl ApiClient for Capturing {
            async fn stream_message(&self, request: ApiRequest) -> Result<SseStream, ApiError> {
                self.captured.lock().unwrap().push(request.clone());
                self.inner.stream_message(request).await
            }
        }
        let mock = Capturing {
            inner: MockApiClient { responses: std::sync::Mutex::new(vec![round1, round2, round3]) },
            captured: captured.clone(),
        };

        let mut state = make_test_state("hi");
        let (tx, _rx) = mpsc::unbounded_channel();
        run_turn(&mut state, &mock, &AutoApprovePrompter, &tx).await.unwrap();

        // 3 API requests: round1, round2, round3
        let reqs = captured.lock().unwrap();
        assert_eq!(reqs.len(), 3, "expected 3 API requests");

        // Round 3's request must end with a USER message (not assistant).
        let last_msg = reqs[2].messages.last().expect("round3 request must have messages");
        assert!(matches!(last_msg.role, Role::User),
            "round3 request must end with User role to satisfy API constraint, got {:?}", last_msg.role);

        // The "Continue." sentinel must be present.
        let has_continue = reqs[2].messages.iter().any(|m| {
            matches!(m.role, Role::User) && m.content.iter().any(|b| {
                matches!(b, ContentBlock::Text { text } if text == "Continue.")
            })
        });
        assert!(has_continue, "request must contain the auto-injected 'Continue.' user message");

        // Assistant text from round 2 must still be in history (not popped).
        let has_assistant_text = state.messages.iter().any(|m| {
            matches!(m.role, Role::Assistant) && m.content.iter().any(|b| {
                matches!(b, ContentBlock::Text { text } if text.contains("I'll continue."))
            })
        });
        assert!(has_assistant_text, "assistant text must survive the SC erase");
    }

    // Helper: count matching events drained from receiver.
    trait TryIterCount {
        fn try_iter_count<F: Fn(&ConversationEvent) -> bool>(&mut self, f: F) -> usize;
    }
    impl TryIterCount for mpsc::UnboundedReceiver<ConversationEvent> {
        fn try_iter_count<F: Fn(&ConversationEvent) -> bool>(&mut self, f: F) -> usize {
            let mut n = 0;
            while let Ok(e) = self.try_recv() {
                if f(&e) { n += 1; }
            }
            n
        }
    }

    /// Tool with no required params — call() receives whatever input is given.
    struct NoParamTool;

    #[async_trait::async_trait]
    impl Tool for NoParamTool {
        fn definition(&self) -> ToolDefinition {
            ToolDefinition {
                name: "ListDir".into(),
                description: "Lists a directory".into(),
                input_schema: serde_json::json!({"type": "object", "properties": {}}),
            }
        }

        async fn call(
            &self,
            input: serde_json::Value,
            _ctx: &ToolContext,
        ) -> Result<ToolOutput, ToolError> {
            // The input must be an object, never null
            assert!(input.is_object(), "input must be an object, got: {input}");
            Ok(ToolOutput {
                content: ToolResultContent::Text("ok".into()),
                is_error: false,
            })
        }

        fn is_concurrent(&self) -> bool {
            true
        }
    }

    #[tokio::test]
    async fn test_tool_use_null_input_normalized_to_empty_object() {
        // When the model sends a ToolUse with NO InputJsonDelta events
        // (empty JSON accumulator), the input must be {} not null.
        // This was the production bug: API rejects null with HTTP 400
        // "tool_use.input: Input should be a valid dictionary".
        let mock = MockApiClient {
            responses: std::sync::Mutex::new(vec![
                // First API call → tool use with NO InputJsonDelta
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
                            name: "ListDir".into(),
                        },
                    },
                    // No InputJsonDelta! The json accumulator stays empty.
                    SseEvent::ContentBlockStop { index: 0 },
                    SseEvent::MessageDelta {
                        delta: MessageDeltaInfo {
                            stop_reason: Some("tool_use".into()),
                        },
                        usage: None,
                    },
                    SseEvent::MessageStop,
                ],
                // Second API call → final text (tool result sent back)
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
                            text: "Done.".into(),
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

        let api_client = mock;
        let (event_tx, event_rx) = tokio::sync::mpsc::unbounded_channel();

        let mut state = ConversationState {
            messages: vec![Message {
                role: Role::User,
                content: vec![ContentBlock::Text {
                    text: "list the current directory".into(),
                }],
            }],
            model: "test-model".into(),
            system_prompt: vec![SystemBlock::text("You are a test assistant.")],
            max_tokens: 1024,
            tools: vec![Box::new(NoParamTool)],
            tool_context: ToolContext::default(),
            stop_requested: new_stop_flag(),
        };

        // Run the turn — if input were null, NoParamTool::call() would panic
        // on the assert!(input.is_object()) check.
        run_turn(&mut state, &api_client, &AutoApprovePrompter, &event_tx)
            .await
            .expect("run_turn should succeed");

        // Also verify the ContentBlock stored in history has {} not null
        let assistant_msg = state.messages.iter().find(|m| m.role == Role::Assistant).unwrap();
        for block in &assistant_msg.content {
            if let ContentBlock::ToolUse { input, .. } = block {
                assert!(
                    input.is_object(),
                    "ToolUse input in conversation history must be an object, got: {input}"
                );
            }
        }
    }
}
