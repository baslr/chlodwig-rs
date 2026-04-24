//! OpenAI-compatible API client.
//!
//! Translates between the internal Anthropic-shaped types (`ApiRequest`,
//! `SseEvent`) and the OpenAI `/v1/chat/completions` wire format.
//! This enables connecting to any OpenAI-compatible backend (OpenAI,
//! Azure, 9router, ollama, etc.) while the rest of the codebase keeps
//! speaking Anthropic types.

use async_stream::stream;
use bytes::Bytes;
use chlodwig_core::{
    ApiClient, ApiError, ApiRequest, ContentBlock, ContentBlockStartInfo, Delta, Message,
    MessageDeltaInfo, MessageStartInfo, Role, SseEvent, SseStream, SystemBlock, ToolDefinition,
    ToolResultContent, UsageInfo,
};
use futures::{Stream, StreamExt};
use serde::{Deserialize, Serialize};

/// Concrete OpenAI-compatible API client.
pub struct OpenAiClient {
    http: reqwest::Client,
    api_key: String,
    base_url: String,
}

impl OpenAiClient {
    pub fn new(api_key: String) -> Self {
        Self {
            http: reqwest::Client::new(),
            api_key,
            base_url: "https://api.openai.com".into(),
        }
    }

    pub fn with_base_url(mut self, url: String) -> Self {
        self.base_url = url;
        self
    }
}

// ── OpenAI wire format types (request) ──────────────────────────────

#[derive(Debug, Serialize)]
struct OaiRequest {
    model: String,
    messages: Vec<OaiMessage>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    tools: Vec<OaiTool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    max_tokens: Option<u32>,
    stream: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    stream_options: Option<StreamOptions>,
}

#[derive(Debug, Serialize)]
struct StreamOptions {
    include_usage: bool,
}

#[derive(Debug, Serialize)]
struct OaiMessage {
    role: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    content: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    tool_calls: Option<Vec<OaiToolCall>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    tool_call_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct OaiToolCall {
    id: String,
    #[serde(rename = "type")]
    call_type: String,
    function: OaiFunction,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct OaiFunction {
    name: String,
    arguments: String,
}

#[derive(Debug, Serialize)]
struct OaiTool {
    #[serde(rename = "type")]
    tool_type: String,
    function: OaiToolDef,
}

#[derive(Debug, Serialize)]
struct OaiToolDef {
    name: String,
    description: String,
    parameters: serde_json::Value,
}

// ── OpenAI wire format types (response SSE) ─────────────────────────

#[derive(Debug, Deserialize)]
struct OaiChunk {
    #[serde(default)]
    id: Option<String>,
    #[serde(default)]
    model: Option<String>,
    #[serde(default)]
    choices: Vec<OaiChoice>,
    #[serde(default)]
    usage: Option<OaiUsage>,
}

#[derive(Debug, Deserialize)]
struct OaiChoice {
    #[serde(default)]
    delta: Option<OaiDelta>,
    #[serde(default)]
    finish_reason: Option<String>,
    #[serde(default)]
    index: u32,
}

#[derive(Debug, Deserialize)]
struct OaiDelta {
    #[serde(default)]
    role: Option<String>,
    #[serde(default)]
    content: Option<String>,
    #[serde(default)]
    tool_calls: Option<Vec<OaiToolCallDelta>>,
}

#[derive(Debug, Deserialize)]
struct OaiToolCallDelta {
    #[serde(default)]
    index: u32,
    #[serde(default)]
    id: Option<String>,
    #[serde(default)]
    function: Option<OaiToolCallFnDelta>,
}

#[derive(Debug, Deserialize)]
struct OaiToolCallFnDelta {
    #[serde(default)]
    name: Option<String>,
    #[serde(default)]
    arguments: Option<String>,
}

#[derive(Debug, Deserialize)]
struct OaiUsage {
    #[serde(default)]
    prompt_tokens: u32,
    #[serde(default)]
    completion_tokens: u32,
    /// OpenAI and 9router report cached prompt tokens here.
    #[serde(default)]
    cached_tokens: u32,
}

// ── Helpers ─────────────────────────────────────────────────────────

/// Return the largest byte offset `<= max` that is a valid UTF-8 char
/// boundary in `s`. Gotcha #16: never slice a `&str` at a hardcoded
/// byte offset without checking `is_char_boundary()`.
pub(crate) fn safe_prefix(s: &str, max: usize) -> &str {
    if max >= s.len() {
        return s;
    }
    let mut end = max;
    while end > 0 && !s.is_char_boundary(end) {
        end -= 1;
    }
    &s[..end]
}

// ── Format conversion: Anthropic → OpenAI request ───────────────────

fn convert_request(request: &ApiRequest) -> OaiRequest {
    let mut messages = Vec::new();

    // System prompt → single system message
    let system_text: String = request
        .system
        .iter()
        .map(|s| s.text.as_str())
        .collect::<Vec<_>>()
        .join("\n\n");
    if !system_text.is_empty() {
        messages.push(OaiMessage {
            role: "system".into(),
            content: Some(serde_json::Value::String(system_text)),
            tool_calls: None,
            tool_call_id: None,
        });
    }

    // Convert each Anthropic message
    for msg in &request.messages {
        convert_message(msg, &mut messages);
    }

    let tools: Vec<OaiTool> = request.tools.iter().map(convert_tool).collect();

    OaiRequest {
        model: request.model.clone(),
        messages,
        tools,
        max_tokens: Some(request.max_tokens),
        stream: request.stream,
        stream_options: if request.stream {
            Some(StreamOptions { include_usage: true })
        } else {
            None
        },
    }
}

fn convert_message(msg: &Message, out: &mut Vec<OaiMessage>) {
    match msg.role {
        Role::User => {
            // Separate tool_results from text/image blocks.
            // Each tool_result becomes its own "tool" role message.
            // Remaining text blocks become a single "user" message.
            let mut text_parts = Vec::new();
            for block in &msg.content {
                match block {
                    ContentBlock::Text { text } => {
                        text_parts.push(text.clone());
                    }
                    ContentBlock::ToolResult {
                        tool_use_id,
                        content,
                        is_error,
                    } => {
                        let text = match content {
                            ToolResultContent::Text(t) => t.clone(),
                            ToolResultContent::Blocks(blocks) => blocks
                                .iter()
                                .filter_map(|b| match b {
                                    chlodwig_core::ToolResultBlock::Text { text } => {
                                        Some(text.as_str())
                                    }
                                    _ => None,
                                })
                                .collect::<Vec<_>>()
                                .join("\n"),
                        };
                        let content_str = if is_error == &Some(true) {
                            format!("[ERROR] {text}")
                        } else {
                            text
                        };
                        out.push(OaiMessage {
                            role: "tool".into(),
                            content: Some(serde_json::Value::String(content_str)),
                            tool_calls: None,
                            tool_call_id: Some(tool_use_id.clone()),
                        });
                    }
                    ContentBlock::Image { .. } => {
                        text_parts.push("[image]".into());
                    }
                    ContentBlock::ToolUse { .. } => {
                        // User messages shouldn't have tool_use, but be defensive
                    }
                    ContentBlock::Thinking { .. } => {}
                }
            }
            if !text_parts.is_empty() {
                let combined = text_parts.join("\n");
                out.push(OaiMessage {
                    role: "user".into(),
                    content: Some(serde_json::Value::String(combined)),
                    tool_calls: None,
                    tool_call_id: None,
                });
            }
        }
        Role::Assistant => {
            let mut text_parts = Vec::new();
            let mut tool_calls = Vec::new();
            for block in &msg.content {
                match block {
                    ContentBlock::Text { text } => {
                        text_parts.push(text.clone());
                    }
                    ContentBlock::ToolUse { id, name, input } => {
                        tool_calls.push(OaiToolCall {
                            id: id.clone(),
                            call_type: "function".into(),
                            function: OaiFunction {
                                name: name.clone(),
                                arguments: serde_json::to_string(input).unwrap_or_default(),
                            },
                        });
                    }
                    ContentBlock::Thinking { .. } => {}
                    _ => {}
                }
            }
            let content = if text_parts.is_empty() {
                None
            } else {
                Some(serde_json::Value::String(text_parts.join("\n")))
            };
            out.push(OaiMessage {
                role: "assistant".into(),
                content,
                tool_calls: if tool_calls.is_empty() {
                    None
                } else {
                    Some(tool_calls)
                },
                tool_call_id: None,
            });
        }
    }
}

fn convert_tool(tool: &ToolDefinition) -> OaiTool {
    OaiTool {
        tool_type: "function".into(),
        function: OaiToolDef {
            name: tool.name.clone(),
            description: tool.description.clone(),
            parameters: tool.input_schema.clone(),
        },
    }
}

// ── SSE stream parser: OpenAI → Anthropic SseEvent ──────────────────

/// Parse an OpenAI-format SSE byte stream into Anthropic-shaped `SseEvent`s.
///
/// We synthesize the full Anthropic event lifecycle:
/// `MessageStart` → `ContentBlockStart` → `ContentBlockDelta`* →
/// `ContentBlockStop` → `MessageDelta` → `MessageStop`
fn parse_openai_sse_stream(
    byte_stream: impl Stream<Item = Result<Bytes, reqwest::Error>> + Send + 'static,
) -> impl Stream<Item = Result<(String, SseEvent), ApiError>> + Send {
    stream! {
        let mut buffer = String::new();
        let mut sent_message_start = false;
        let mut text_block_started = false;
        let mut text_block_index: u32 = 0;
        let mut tool_block_indices: std::collections::HashMap<u32, u32> = std::collections::HashMap::new();
        let mut next_block_index: u32 = 0;
        let mut tool_ids: std::collections::HashMap<u32, String> = std::collections::HashMap::new();
        let mut tool_names: std::collections::HashMap<u32, String> = std::collections::HashMap::new();
        let mut tool_blocks_started: std::collections::HashSet<u32> = std::collections::HashSet::new();

        let mut model_name = String::new();
        let mut last_usage: Option<OaiUsage> = None;
        let mut finished = false;

        tokio::pin!(byte_stream);

        while let Some(chunk) = byte_stream.next().await {
            let chunk = match chunk {
                Ok(c) => c,
                Err(e) => {
                    yield Err(ApiError::Connection(e.to_string()));
                    return;
                }
            };
            buffer.push_str(&String::from_utf8_lossy(&chunk));

            while let Some(pos) = buffer.find("\n\n") {
                let message = buffer[..pos].to_string();
                buffer = buffer[pos + 2..].to_string();

                for line in message.lines() {
                    let Some(data) = line.strip_prefix("data: ") else { continue };
                    let data = data.trim();
                    if data.is_empty() || data == "[DONE]" {
                        continue;
                    }

                    let raw = data.to_string();
                    let chunk: OaiChunk = match serde_json::from_str(data) {
                        Ok(c) => c,
                        Err(e) => {
                            let preview = safe_prefix(data, 200);
                            tracing::warn!("OpenAI SSE parse error: {e} for: {preview}");
                            yield Err(ApiError::SseParseError(
                                format!("{e}: {preview}")
                            ));
                            continue;
                        }
                    };

                    if let Some(ref m) = chunk.model {
                        if !m.is_empty() {
                            model_name = m.clone();
                        }
                    }

                    if let Some(usage) = chunk.usage {
                        last_usage = Some(usage);
                    }

                    if !sent_message_start {
                        sent_message_start = true;
                        yield Ok((raw.clone(), SseEvent::MessageStart {
                            message: MessageStartInfo {
                                id: chunk.id.clone().unwrap_or_default(),
                                model: model_name.clone(),
                                usage: None,
                            },
                        }));
                    }

                    let choice = match chunk.choices.first() {
                        Some(c) => c,
                        None => continue,
                    };

                    let delta = match &choice.delta {
                        Some(d) => d,
                        None => continue,
                    };

                    // Handle text content
                    if let Some(ref text) = delta.content {
                        if !text.is_empty() {
                            if !text_block_started {
                                text_block_started = true;
                                text_block_index = next_block_index;
                                next_block_index += 1;
                                yield Ok((raw.clone(), SseEvent::ContentBlockStart {
                                    index: text_block_index,
                                    content_block: ContentBlockStartInfo::Text { text: None },
                                }));
                            }
                            yield Ok((raw.clone(), SseEvent::ContentBlockDelta {
                                index: text_block_index,
                                delta: Delta::TextDelta { text: text.clone() },
                            }));
                        }
                    }

                    // Handle tool calls
                    if let Some(ref tcs) = delta.tool_calls {
                        for tc in tcs {
                            let oai_idx = tc.index;

                            // Per OpenAI spec the name arrives complete in the first
                            // delta — use insert (not push_str) so a redundantly
                            // re-sent name doesn't double up.
                            if let Some(ref id) = tc.id {
                                tool_ids.insert(oai_idx, id.clone());
                            }
                            if let Some(ref f) = tc.function {
                                if let Some(ref name) = f.name {
                                    tool_names.insert(oai_idx, name.clone());
                                }
                            }

                            // Emit ContentBlockStart once we have both id and name
                            if !tool_blocks_started.contains(&oai_idx) {
                                if let (Some(id), Some(name)) = (tool_ids.get(&oai_idx), tool_names.get(&oai_idx)) {
                                    if text_block_started {
                                        text_block_started = false;
                                        yield Ok((raw.clone(), SseEvent::ContentBlockStop {
                                            index: text_block_index,
                                        }));
                                    }

                                    let block_idx = next_block_index;
                                    next_block_index += 1;
                                    tool_block_indices.insert(oai_idx, block_idx);
                                    tool_blocks_started.insert(oai_idx);

                                    yield Ok((raw.clone(), SseEvent::ContentBlockStart {
                                        index: block_idx,
                                        content_block: ContentBlockStartInfo::ToolUse {
                                            id: id.clone(),
                                            name: name.clone(),
                                        },
                                    }));
                                }
                            }

                            // Emit argument deltas
                            if let Some(ref f) = tc.function {
                                if let Some(ref args) = f.arguments {
                                    if !args.is_empty() {
                                        if let Some(&block_idx) = tool_block_indices.get(&oai_idx) {
                                            yield Ok((raw.clone(), SseEvent::ContentBlockDelta {
                                                index: block_idx,
                                                delta: Delta::InputJsonDelta {
                                                    partial_json: args.clone(),
                                                },
                                            }));
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Handle finish_reason
                    if let Some(ref reason) = choice.finish_reason {
                        finished = true;

                        if text_block_started {
                            text_block_started = false;
                            yield Ok((raw.clone(), SseEvent::ContentBlockStop {
                                index: text_block_index,
                            }));
                        }

                        for (&_oai_idx, &block_idx) in &tool_block_indices {
                            yield Ok((raw.clone(), SseEvent::ContentBlockStop {
                                index: block_idx,
                            }));
                        }
                        tool_block_indices.clear();
                        tool_blocks_started.clear();

                        let usage_info = last_usage.as_ref().map(|u| UsageInfo {
                            input_tokens: u.prompt_tokens,
                            output_tokens: u.completion_tokens,
                            cache_creation_input_tokens: None,
                            cache_read_input_tokens: Some(u.cached_tokens),
                        });

                        let stop_reason = match reason.as_str() {
                            "stop" => Some("end_turn".to_string()),
                            "tool_calls" => Some("tool_use".to_string()),
                            other => Some(other.to_string()),
                        };

                        yield Ok((raw.clone(), SseEvent::MessageDelta {
                            delta: MessageDeltaInfo { stop_reason },
                            usage: usage_info,
                        }));

                        yield Ok((raw, SseEvent::MessageStop));
                    }
                }
            }
        }

        // Fallback: stream ended without finish_reason.
        // Skip if finish_reason was already processed — avoids
        // duplicate ContentBlockStop events.
        if sent_message_start && !finished {
            if text_block_started {
                yield Ok((String::new(), SseEvent::ContentBlockStop {
                    index: text_block_index,
                }));
            }
            for (&oai_idx, &block_idx) in &tool_block_indices {
                if tool_blocks_started.contains(&oai_idx) {
                    yield Ok((String::new(), SseEvent::ContentBlockStop {
                        index: block_idx,
                    }));
                }
            }

            if let Some(ref usage) = last_usage {
                yield Ok((String::new(), SseEvent::MessageDelta {
                    delta: MessageDeltaInfo { stop_reason: Some("end_turn".into()) },
                    usage: Some(UsageInfo {
                        input_tokens: usage.prompt_tokens,
                        output_tokens: usage.completion_tokens,
                        cache_creation_input_tokens: None,
                        cache_read_input_tokens: Some(usage.cached_tokens),
                    }),
                }));
            }

            yield Ok((String::new(), SseEvent::MessageStop));
        }
    }
}

// ── ApiClient implementation ────────────────────────────────────────

#[async_trait::async_trait]
impl ApiClient for OpenAiClient {
    async fn stream_message(&self, request: ApiRequest) -> Result<SseStream, ApiError> {
        let oai_request = convert_request(&request);

        let response = self
            .http
            .post(format!("{}/v1/chat/completions", self.base_url))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("content-type", "application/json")
            .json(&oai_request)
            .send()
            .await
            .map_err(|e| ApiError::Connection(e.to_string()))?;

        let status = response.status().as_u16();

        if status == 429 {
            let retry_after = response
                .headers()
                .get("retry-after")
                .and_then(|v| v.to_str().ok())
                .and_then(|v| v.parse::<u64>().ok())
                .unwrap_or(1);
            return Err(ApiError::RateLimited {
                retry_after_ms: retry_after * 1000,
            });
        }

        if status == 529 {
            return Err(ApiError::Overloaded("API overloaded".into()));
        }

        if status >= 400 {
            let body = response.text().await.unwrap_or_default();
            return Err(ApiError::HttpError { status, body });
        }

        let byte_stream = response.bytes_stream();
        let sse_stream = parse_openai_sse_stream(byte_stream);
        Ok(Box::pin(sse_stream))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chlodwig_core::*;
    use futures::StreamExt;

    // ── safe_prefix tests ───────────────────────────────────────────

    #[test]
    fn test_safe_prefix_ascii() {
        assert_eq!(safe_prefix("Hello, world!", 5), "Hello");
    }

    #[test]
    fn test_safe_prefix_at_utf8_boundary() {
        let s = "├── hello"; // '├' = 3 bytes
        assert_eq!(safe_prefix(s, 1), "");
        assert_eq!(safe_prefix(s, 2), "");
        assert_eq!(safe_prefix(s, 3), "├");
    }

    #[test]
    fn test_safe_prefix_beyond_len() {
        assert_eq!(safe_prefix("short", 1000), "short");
    }

    #[test]
    fn test_safe_prefix_emoji_boundary() {
        let s = "a🎉b"; // 🎉 = 4 bytes
        assert_eq!(safe_prefix(s, 1), "a");
        assert_eq!(safe_prefix(s, 2), "a");
        assert_eq!(safe_prefix(s, 3), "a");
        assert_eq!(safe_prefix(s, 4), "a");
        assert_eq!(safe_prefix(s, 5), "a🎉");
    }

    // ── Format conversion tests ─────────────────────────────────────

    #[test]
    fn test_convert_tool_definition() {
        let tool = ToolDefinition {
            name: "read_file".into(),
            description: "Read a file".into(),
            input_schema: serde_json::json!({"type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"]}),
        };
        let oai = convert_tool(&tool);
        assert_eq!(oai.tool_type, "function");
        assert_eq!(oai.function.name, "read_file");
        assert_eq!(oai.function.parameters, tool.input_schema);
    }

    #[test]
    fn test_convert_system_prompt() {
        let request = ApiRequest {
            model: "gpt-5-mini".into(),
            messages: vec![Message { role: Role::User, content: vec![ContentBlock::Text { text: "Hi".into() }] }],
            system: vec![SystemBlock::text("You are helpful."), SystemBlock::text("Be concise.")],
            tools: vec![], max_tokens: 1024, stream: true,
        };
        let oai = convert_request(&request);
        assert_eq!(oai.messages[0].role, "system");
        assert_eq!(oai.messages[0].content, Some(serde_json::Value::String("You are helpful.\n\nBe concise.".into())));
        assert_eq!(oai.messages[1].role, "user");
    }

    #[test]
    fn test_convert_user_message_with_text() {
        let msg = Message { role: Role::User, content: vec![ContentBlock::Text { text: "Hello".into() }] };
        let mut out = Vec::new();
        convert_message(&msg, &mut out);
        assert_eq!(out.len(), 1);
        assert_eq!(out[0].role, "user");
        assert_eq!(out[0].content, Some(serde_json::Value::String("Hello".into())));
    }

    #[test]
    fn test_convert_user_message_with_tool_result() {
        let msg = Message { role: Role::User, content: vec![
            ContentBlock::ToolResult { tool_use_id: "call_123".into(), content: ToolResultContent::Text("file contents".into()), is_error: None },
            ContentBlock::Text { text: "Next question".into() },
        ]};
        let mut out = Vec::new();
        convert_message(&msg, &mut out);
        assert_eq!(out.len(), 2);
        assert_eq!(out[0].role, "tool");
        assert_eq!(out[0].tool_call_id, Some("call_123".into()));
        assert_eq!(out[1].role, "user");
    }

    #[test]
    fn test_convert_user_message_tool_result_error() {
        let msg = Message { role: Role::User, content: vec![ContentBlock::ToolResult {
            tool_use_id: "call_err".into(), content: ToolResultContent::Text("file not found".into()), is_error: Some(true),
        }]};
        let mut out = Vec::new();
        convert_message(&msg, &mut out);
        assert_eq!(out[0].content, Some(serde_json::Value::String("[ERROR] file not found".into())));
    }

    #[test]
    fn test_convert_assistant_message_with_tool_use() {
        let msg = Message { role: Role::Assistant, content: vec![
            ContentBlock::Text { text: "Let me read that file.".into() },
            ContentBlock::ToolUse { id: "call_456".into(), name: "read_file".into(), input: serde_json::json!({"path": "/tmp/test.txt"}) },
        ]};
        let mut out = Vec::new();
        convert_message(&msg, &mut out);
        assert_eq!(out.len(), 1);
        let tcs = out[0].tool_calls.as_ref().unwrap();
        assert_eq!(tcs[0].function.name, "read_file");
    }

    #[test]
    fn test_convert_assistant_message_tool_only_no_text() {
        let msg = Message { role: Role::Assistant, content: vec![ContentBlock::ToolUse {
            id: "call_789".into(), name: "bash".into(), input: serde_json::json!({"command": "ls"}),
        }]};
        let mut out = Vec::new();
        convert_message(&msg, &mut out);
        assert!(out[0].content.is_none());
        assert!(out[0].tool_calls.is_some());
    }

    #[test]
    fn test_convert_request_stream_options() {
        let oai = convert_request(&ApiRequest { model: "t".into(), messages: vec![], system: vec![], tools: vec![], max_tokens: 1024, stream: true });
        assert!(oai.stream_options.unwrap().include_usage);
    }

    #[test]
    fn test_convert_request_no_stream_options_when_not_streaming() {
        let oai = convert_request(&ApiRequest { model: "t".into(), messages: vec![], system: vec![], tools: vec![], max_tokens: 1024, stream: false });
        assert!(oai.stream_options.is_none());
    }

    #[test]
    fn test_convert_request_no_system_prompt() {
        let oai = convert_request(&ApiRequest { model: "t".into(), messages: vec![Message { role: Role::User, content: vec![ContentBlock::Text { text: "Hi".into() }] }], system: vec![], tools: vec![], max_tokens: 1024, stream: true });
        assert_eq!(oai.messages.len(), 1);
        assert_eq!(oai.messages[0].role, "user");
    }

    #[test]
    fn test_convert_multiple_tool_results_ordering() {
        let msg = Message { role: Role::User, content: vec![
            ContentBlock::ToolResult { tool_use_id: "call_1".into(), content: ToolResultContent::Text("r1".into()), is_error: None },
            ContentBlock::ToolResult { tool_use_id: "call_2".into(), content: ToolResultContent::Text("r2".into()), is_error: None },
            ContentBlock::Text { text: "What next?".into() },
        ]};
        let mut out = Vec::new();
        convert_message(&msg, &mut out);
        assert_eq!(out.len(), 3);
        assert_eq!(out[0].role, "tool");
        assert_eq!(out[1].role, "tool");
        assert_eq!(out[2].role, "user");
    }

    #[test]
    fn test_convert_user_message_mixed_content_interleaved() {
        let msg = Message { role: Role::User, content: vec![
            ContentBlock::ToolResult { tool_use_id: "a".into(), content: ToolResultContent::Text("ra".into()), is_error: None },
            ContentBlock::Text { text: "first".into() },
            ContentBlock::ToolResult { tool_use_id: "b".into(), content: ToolResultContent::Text("rb".into()), is_error: None },
            ContentBlock::Text { text: "second".into() },
        ]};
        let mut out = Vec::new();
        convert_message(&msg, &mut out);
        assert_eq!(out.len(), 3);
        assert_eq!(out[2].content, Some(serde_json::Value::String("first\nsecond".into())));
    }

    #[test]
    fn test_convert_request_serializes_to_valid_json() {
        let oai = convert_request(&ApiRequest {
            model: "gpt-5-mini".into(),
            messages: vec![Message { role: Role::User, content: vec![ContentBlock::Text { text: "Hello".into() }] }],
            system: vec![SystemBlock::text("Be helpful")],
            tools: vec![ToolDefinition { name: "bash".into(), description: "Run".into(), input_schema: serde_json::json!({"type": "object"}) }],
            max_tokens: 4096, stream: true,
        });
        let parsed: serde_json::Value = serde_json::from_str(&serde_json::to_string(&oai).unwrap()).unwrap();
        assert_eq!(parsed["model"], "gpt-5-mini");
        assert_eq!(parsed["tools"][0]["type"], "function");
    }

    // ── ApiFormat serde roundtrip ───────────────────────────────────

    #[test]
    fn test_api_format_serde_roundtrip_openai() {
        let json = serde_json::to_string(&chlodwig_core::ApiFormat::Openai).unwrap();
        assert_eq!(json, "\"openai\"");
        assert_eq!(serde_json::from_str::<chlodwig_core::ApiFormat>(&json).unwrap(), chlodwig_core::ApiFormat::Openai);
    }

    #[test]
    fn test_api_format_serde_roundtrip_anthropic() {
        let json = serde_json::to_string(&chlodwig_core::ApiFormat::Anthropic).unwrap();
        assert_eq!(json, "\"anthropic\"");
    }

    #[test]
    fn test_api_format_default_is_anthropic() {
        assert_eq!(chlodwig_core::ApiFormat::default(), chlodwig_core::ApiFormat::Anthropic);
    }

    #[test]
    fn test_api_format_absent_in_config_json_defaults_to_none() {
        let cfg: chlodwig_core::AppConfig = serde_json::from_str(r#"{"api_key":"k"}"#).unwrap();
        assert!(cfg.api_format.is_none());
    }

    #[test]
    fn test_api_format_present_in_config_json() {
        let cfg: chlodwig_core::AppConfig = serde_json::from_str(r#"{"api_key":"k","api_format":"openai"}"#).unwrap();
        assert_eq!(cfg.api_format, Some(chlodwig_core::ApiFormat::Openai));
    }

    // ── create_client factory ───────────────────────────────────────

    #[test]
    fn test_create_client_anthropic() {
        let _c = crate::create_client(&chlodwig_core::ResolvedConfig {
            api_key: "k".into(), model: "m".into(), base_url: None, max_tokens: 1024, api_format: chlodwig_core::ApiFormat::Anthropic,
        });
    }

    #[test]
    fn test_create_client_openai() {
        let _c = crate::create_client(&chlodwig_core::ResolvedConfig {
            api_key: "k".into(), model: "m".into(), base_url: Some("http://localhost".into()), max_tokens: 1024, api_format: chlodwig_core::ApiFormat::Openai,
        });
    }

    // ── SSE parser tests ────────────────────────────────────────────

    #[tokio::test]
    async fn test_parse_openai_text_delta() {
        let raw = concat!(
            "data: {\"id\":\"c\",\"model\":\"m\",\"choices\":[{\"index\":0,\"delta\":{\"role\":\"assistant\",\"content\":\"\"}}]}\n\n",
            "data: {\"id\":\"c\",\"model\":\"m\",\"choices\":[{\"index\":0,\"delta\":{\"content\":\"Hello\"}}]}\n\n",
            "data: {\"id\":\"c\",\"model\":\"m\",\"choices\":[{\"index\":0,\"delta\":{\"content\":\" world\"}}]}\n\n",
            "data: {\"id\":\"c\",\"choices\":[{\"index\":0,\"delta\":{},\"finish_reason\":\"stop\"}],\"usage\":{\"prompt_tokens\":10,\"completion_tokens\":2}}\n\n",
            "data: [DONE]\n\n",
        );
        let events: Vec<_> = parse_openai_sse_stream(futures::stream::once(async move { Ok::<_, reqwest::Error>(Bytes::from(raw)) }))
            .collect::<Vec<_>>().await.into_iter().filter_map(|r| r.ok()).collect();

        assert!(matches!(events[0], (_, SseEvent::MessageStart { .. })));
        assert!(matches!(events[1], (_, SseEvent::ContentBlockStart { .. })));
        match &events[2] { (_, SseEvent::ContentBlockDelta { delta: Delta::TextDelta { text }, .. }) => assert_eq!(text, "Hello"), o => panic!("{o:?}") }
        match &events[3] { (_, SseEvent::ContentBlockDelta { delta: Delta::TextDelta { text }, .. }) => assert_eq!(text, " world"), o => panic!("{o:?}") }
        assert!(matches!(events[4], (_, SseEvent::ContentBlockStop { index: 0 })));
        match &events[5] { (_, SseEvent::MessageDelta { delta, usage }) => { assert_eq!(delta.stop_reason.as_deref(), Some("end_turn")); assert_eq!(usage.as_ref().unwrap().input_tokens, 10); }, o => panic!("{o:?}") }
        assert!(matches!(events[6], (_, SseEvent::MessageStop)));
    }

    #[tokio::test]
    async fn test_parse_openai_tool_call_fragmented() {
        let raw = concat!(
            "data: {\"id\":\"c\",\"model\":\"m\",\"choices\":[{\"index\":0,\"delta\":{\"role\":\"assistant\",\"tool_calls\":[{\"index\":0,\"id\":\"call_abc\",\"type\":\"function\",\"function\":{\"name\":\"read_file\",\"arguments\":\"\"}}]}}]}\n\n",
            "data: {\"id\":\"c\",\"choices\":[{\"index\":0,\"delta\":{\"tool_calls\":[{\"index\":0,\"function\":{\"arguments\":\"{\\\"path\"}}]}}]}\n\n",
            "data: {\"id\":\"c\",\"choices\":[{\"index\":0,\"delta\":{\"tool_calls\":[{\"index\":0,\"function\":{\"arguments\":\"\\\":\\\"/tmp/x\\\"}\"}}]}}]}\n\n",
            "data: {\"id\":\"c\",\"choices\":[{\"index\":0,\"delta\":{},\"finish_reason\":\"tool_calls\"}],\"usage\":{\"prompt_tokens\":20,\"completion_tokens\":5}}\n\n",
            "data: [DONE]\n\n",
        );
        let events: Vec<_> = parse_openai_sse_stream(futures::stream::once(async move { Ok::<_, reqwest::Error>(Bytes::from(raw)) }))
            .collect::<Vec<_>>().await.into_iter().filter_map(|r| r.ok()).collect();

        match &events[1] { (_, SseEvent::ContentBlockStart { content_block: ContentBlockStartInfo::ToolUse { id, name }, .. }) => { assert_eq!(id, "call_abc"); assert_eq!(name, "read_file"); }, o => panic!("{o:?}") }
        match &events[5] { (_, SseEvent::MessageDelta { delta, .. }) => assert_eq!(delta.stop_reason.as_deref(), Some("tool_use")), o => panic!("{o:?}") }
    }

    #[tokio::test]
    async fn test_parse_openai_split_chunks() {
        let chunk1 = "data: {\"id\":\"c\",\"model\":\"m\",\"choices\":[{\"inde";
        let chunk2 = "x\":0,\"delta\":{\"content\":\"Hi\"}}]}\n\ndata: {\"id\":\"c\",\"choices\":[{\"index\":0,\"delta\":{},\"finish_reason\":\"stop\"}],\"usage\":{\"prompt_tokens\":1,\"completion_tokens\":1}}\n\ndata: [DONE]\n\n";
        let events: Vec<_> = parse_openai_sse_stream(futures::stream::iter(vec![Ok(Bytes::from(chunk1)), Ok(Bytes::from(chunk2))]))
            .collect::<Vec<_>>().await.into_iter().filter_map(|r| r.ok()).collect();
        assert!(events.iter().any(|(_, e)| matches!(e, SseEvent::ContentBlockDelta { delta: Delta::TextDelta { text }, .. } if text == "Hi")));
    }

    #[tokio::test]
    async fn test_parse_openai_empty_content_not_emitted() {
        let raw = concat!(
            "data: {\"id\":\"c\",\"model\":\"m\",\"choices\":[{\"index\":0,\"delta\":{\"role\":\"assistant\",\"content\":\"\"}}]}\n\n",
            "data: {\"id\":\"c\",\"choices\":[{\"index\":0,\"delta\":{\"content\":\"Hi\"}}]}\n\n",
            "data: {\"id\":\"c\",\"choices\":[{\"index\":0,\"delta\":{},\"finish_reason\":\"stop\"}],\"usage\":{\"prompt_tokens\":1,\"completion_tokens\":1}}\n\n",
            "data: [DONE]\n\n",
        );
        let events: Vec<_> = parse_openai_sse_stream(futures::stream::once(async move { Ok::<_, reqwest::Error>(Bytes::from(raw)) }))
            .collect::<Vec<_>>().await.into_iter().filter_map(|r| r.ok()).collect();
        let starts = events.iter().filter(|(_, e)| matches!(e, SseEvent::ContentBlockStart { .. })).count();
        assert_eq!(starts, 1);
    }

    #[tokio::test]
    async fn test_parse_openai_malformed_yields_error() {
        let raw = concat!("data: {INVALID}\n\n", "data: {\"id\":\"c\",\"model\":\"m\",\"choices\":[{\"index\":0,\"delta\":{\"content\":\"ok\"}}]}\n\n", "data: {\"id\":\"c\",\"choices\":[{\"index\":0,\"delta\":{},\"finish_reason\":\"stop\"}],\"usage\":{\"prompt_tokens\":1,\"completion_tokens\":1}}\n\ndata: [DONE]\n\n");
        let events: Vec<_> = parse_openai_sse_stream(futures::stream::once(async move { Ok::<_, reqwest::Error>(Bytes::from(raw)) })).collect().await;
        assert!(matches!(&events[0], Err(ApiError::SseParseError(_))));
        assert!(events.iter().filter(|e| e.is_ok()).count() >= 4);
    }

    #[tokio::test]
    async fn test_parse_openai_empty_stream() {
        let events: Vec<_> = parse_openai_sse_stream(futures::stream::empty::<Result<Bytes, reqwest::Error>>()).collect().await;
        assert!(events.is_empty());
    }

    #[tokio::test]
    async fn test_parse_openai_no_duplicate_content_block_stop_after_finish() {
        let raw = concat!(
            "data: {\"id\":\"c\",\"model\":\"m\",\"choices\":[{\"index\":0,\"delta\":{\"content\":\"Hi\"}}]}\n\n",
            "data: {\"id\":\"c\",\"choices\":[{\"index\":0,\"delta\":{},\"finish_reason\":\"stop\"}],\"usage\":{\"prompt_tokens\":1,\"completion_tokens\":1}}\n\n",
            "data: [DONE]\n\n",
        );
        let events: Vec<_> = parse_openai_sse_stream(futures::stream::once(async move { Ok::<_, reqwest::Error>(Bytes::from(raw)) }))
            .collect::<Vec<_>>().await.into_iter().filter_map(|r| r.ok()).collect();
        assert_eq!(events.iter().filter(|(_, e)| matches!(e, SseEvent::ContentBlockStop { .. })).count(), 1);
        assert_eq!(events.iter().filter(|(_, e)| matches!(e, SseEvent::MessageStop)).count(), 1);
    }

    #[tokio::test]
    async fn test_parse_openai_no_duplicate_stop_with_tool_blocks() {
        let raw = concat!(
            "data: {\"id\":\"c\",\"model\":\"m\",\"choices\":[{\"index\":0,\"delta\":{\"tool_calls\":[{\"index\":0,\"id\":\"c1\",\"type\":\"function\",\"function\":{\"name\":\"bash\",\"arguments\":\"\"}}]}}]}\n\n",
            "data: {\"id\":\"c\",\"choices\":[{\"index\":0,\"delta\":{\"tool_calls\":[{\"index\":0,\"function\":{\"arguments\":\"{\\\"cmd\\\":\\\"ls\\\"}\"}}]}}]}\n\n",
            "data: {\"id\":\"c\",\"choices\":[{\"index\":0,\"delta\":{},\"finish_reason\":\"tool_calls\"}],\"usage\":{\"prompt_tokens\":5,\"completion_tokens\":3}}\n\n",
            "data: [DONE]\n\n",
        );
        let events: Vec<_> = parse_openai_sse_stream(futures::stream::once(async move { Ok::<_, reqwest::Error>(Bytes::from(raw)) }))
            .collect::<Vec<_>>().await.into_iter().filter_map(|r| r.ok()).collect();
        assert_eq!(events.iter().filter(|(_, e)| matches!(e, SseEvent::ContentBlockStop { .. })).count(), 1);
        assert_eq!(events.iter().filter(|(_, e)| matches!(e, SseEvent::MessageStop)).count(), 1);
    }

    #[tokio::test]
    async fn test_parse_openai_stream_ends_without_finish_reason() {
        let raw = "data: {\"id\":\"c\",\"model\":\"m\",\"choices\":[{\"index\":0,\"delta\":{\"content\":\"Hello\"}}]}\n\n";
        let events: Vec<_> = parse_openai_sse_stream(futures::stream::once(async move { Ok::<_, reqwest::Error>(Bytes::from(raw)) }))
            .collect::<Vec<_>>().await.into_iter().filter_map(|r| r.ok()).collect();
        assert_eq!(events.iter().filter(|(_, e)| matches!(e, SseEvent::ContentBlockStop { .. })).count(), 1);
        assert_eq!(events.iter().filter(|(_, e)| matches!(e, SseEvent::MessageStop)).count(), 1);
    }

    #[tokio::test]
    async fn test_parse_openai_cached_tokens_mapped() {
        let raw = concat!(
            "data: {\"id\":\"c\",\"model\":\"m\",\"choices\":[{\"index\":0,\"delta\":{\"content\":\"Hi\"}}]}\n\n",
            "data: {\"id\":\"c\",\"choices\":[{\"index\":0,\"delta\":{},\"finish_reason\":\"stop\"}],\"usage\":{\"prompt_tokens\":100,\"completion_tokens\":10,\"cached_tokens\":50}}\n\n",
            "data: [DONE]\n\n",
        );
        let events: Vec<_> = parse_openai_sse_stream(futures::stream::once(async move { Ok::<_, reqwest::Error>(Bytes::from(raw)) }))
            .collect::<Vec<_>>().await.into_iter().filter_map(|r| r.ok()).collect();
        match events.iter().find(|(_, e)| matches!(e, SseEvent::MessageDelta { .. })) {
            Some((_, SseEvent::MessageDelta { usage: Some(u), .. })) => {
                assert_eq!(u.input_tokens, 100);
                assert_eq!(u.cache_read_input_tokens, Some(50));
            }
            o => panic!("{o:?}"),
        }
    }

    #[tokio::test]
    async fn test_parse_openai_tool_name_not_duplicated_on_redundant_send() {
        let raw = concat!(
            "data: {\"id\":\"c\",\"model\":\"m\",\"choices\":[{\"index\":0,\"delta\":{\"tool_calls\":[{\"index\":0,\"id\":\"c1\",\"function\":{\"name\":\"bash\"}}]}}]}\n\n",
            "data: {\"id\":\"c\",\"choices\":[{\"index\":0,\"delta\":{\"tool_calls\":[{\"index\":0,\"function\":{\"name\":\"bash\",\"arguments\":\"{\\\"cmd\\\":\\\"ls\\\"}\"}}]}}]}\n\n",
            "data: {\"id\":\"c\",\"choices\":[{\"index\":0,\"delta\":{},\"finish_reason\":\"tool_calls\"}],\"usage\":{\"prompt_tokens\":1,\"completion_tokens\":1}}\n\n",
            "data: [DONE]\n\n",
        );
        let events: Vec<_> = parse_openai_sse_stream(futures::stream::once(async move { Ok::<_, reqwest::Error>(Bytes::from(raw)) }))
            .collect::<Vec<_>>().await.into_iter().filter_map(|r| r.ok()).collect();
        match events.iter().find(|(_, e)| matches!(e, SseEvent::ContentBlockStart { content_block: ContentBlockStartInfo::ToolUse { .. }, .. })) {
            Some((_, SseEvent::ContentBlockStart { content_block: ContentBlockStartInfo::ToolUse { name, .. }, .. })) => {
                assert_eq!(name, "bash", "Name should not be duplicated, got '{name}'");
            }
            o => panic!("{o:?}"),
        }
    }
}
