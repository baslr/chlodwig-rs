//! Application state — shared between GTK UI and conversation loop.
//!
//! This module is deliberately GTK-independent so it can be unit-tested
//! without a running display server.

use chlodwig_core::ConversationEvent;

/// Braille spinner frames — same sequence as the TUI spinner.
/// 10 frames at 100ms each = 1 full rotation per second.
pub const SPINNER_FRAMES: &[char] = &['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

/// A single block of content to display in the chat view.
#[derive(Debug, Clone)]
pub enum DisplayBlock {
    /// User prompt text.
    UserMessage(String),
    /// Assistant markdown text (complete).
    AssistantText(String),
    /// A tool invocation header: name + JSON input.
    ToolUseStart { name: String, input: serde_json::Value },
    /// Tool result: output text + error flag.
    ToolResult { output: String, is_error: bool },
    /// System info message (e.g. "Resumed session").
    SystemMessage(String),
    /// Error message.
    Error(String),
}

/// Conversation-level state that the UI observes.
pub struct AppState {
    /// Completed display blocks (chat history).
    pub blocks: Vec<DisplayBlock>,
    /// Text currently being streamed from the assistant (not yet complete).
    pub streaming_buffer: String,
    /// Whether the streaming buffer has new content since the last render.
    /// Set by `TextDelta`, cleared by `acknowledge_streaming_render()`.
    pub streaming_dirty: bool,
    /// Whether the assistant is currently responding.
    pub is_streaming: bool,
    /// Total input tokens used in this session.
    pub input_tokens: u64,
    /// Total output tokens used in this session.
    pub output_tokens: u64,
    /// Input tokens for the current/last turn.
    pub turn_input_tokens: u64,
    /// Output tokens for the current/last turn.
    pub turn_output_tokens: u64,
    /// Number of SSE chunks in current stream.
    pub stream_chunks: u64,
    /// Number of completed conversation turns.
    pub turn_count: u32,
    /// Number of API requests made.
    pub request_count: u32,
    /// Model name.
    pub model: String,
    /// Transient copy-feedback message (e.g. "Copied!"), shown briefly in status bar.
    pub copy_feedback: Option<String>,
}

impl AppState {
    pub fn new(model: String) -> Self {
        Self {
            blocks: Vec::new(),
            streaming_buffer: String::new(),
            streaming_dirty: false,
            is_streaming: false,
            input_tokens: 0,
            output_tokens: 0,
            turn_input_tokens: 0,
            turn_output_tokens: 0,
            stream_chunks: 0,
            turn_count: 0,
            request_count: 0,
            model,
            copy_feedback: None,
        }
    }

    /// Process a ConversationEvent and update state accordingly.
    /// Returns `true` if the UI should be refreshed.
    pub fn handle_event(&mut self, event: ConversationEvent) -> bool {
        match event {
            ConversationEvent::TextDelta(text) => {
                self.streaming_buffer.push_str(&text);
                self.streaming_dirty = true;
                self.stream_chunks += 1;
                true
            }
            ConversationEvent::TextComplete(text) => {
                self.streaming_buffer.clear();
                self.streaming_dirty = false;
                self.blocks.push(DisplayBlock::AssistantText(text));
                true
            }
            ConversationEvent::ToolUseStart { name, input, .. } => {
                // Flush any pending streaming text first
                self.flush_streaming();
                self.blocks.push(DisplayBlock::ToolUseStart { name, input });
                true
            }
            ConversationEvent::ToolResult { output, is_error, .. } => {
                let text = match &output {
                    chlodwig_core::ToolResultContent::Text(t) => t.clone(),
                    chlodwig_core::ToolResultContent::Blocks(blocks) => {
                        blocks
                            .iter()
                            .map(|b| match b {
                                chlodwig_core::ToolResultBlock::Text { text } => text.as_str(),
                                chlodwig_core::ToolResultBlock::Image { .. } => "[image]",
                            })
                            .collect::<Vec<_>>()
                            .join("\n")
                    }
                };
                self.blocks.push(DisplayBlock::ToolResult {
                    output: text,
                    is_error,
                });
                true
            }
            ConversationEvent::TurnComplete => {
                self.flush_streaming();
                self.is_streaming = false;
                self.turn_count += 1;
                self.stream_chunks = 0;
                true
            }
            ConversationEvent::Error(msg) => {
                self.flush_streaming();
                self.is_streaming = false;
                self.blocks.push(DisplayBlock::Error(msg));
                true
            }
            ConversationEvent::Usage { input_tokens, output_tokens } => {
                self.input_tokens += input_tokens as u64;
                self.output_tokens += output_tokens as u64;
                self.turn_input_tokens = input_tokens as u64;
                self.turn_output_tokens = output_tokens as u64;
                true
            }
            ConversationEvent::ApiRequestMade => {
                self.request_count += 1;
                false // status bar update only, no chat content change
            }
            ConversationEvent::CompactionStarted => {
                self.blocks.push(DisplayBlock::SystemMessage(
                    "Compacting conversation…".into(),
                ));
                true
            }
            ConversationEvent::CompactionComplete { old_messages, summary_tokens } => {
                self.blocks.push(DisplayBlock::SystemMessage(
                    format!(
                        "✓ Compacted: {old_messages} messages → summary ({summary_tokens} tokens)"
                    ),
                ));
                true
            }
            // Events we don't display (yet)
            ConversationEvent::ThinkingDelta(_)
            | ConversationEvent::ThinkingComplete(_)
            | ConversationEvent::HttpRequestSent { .. }
            | ConversationEvent::HttpResponseMeta { .. }
            | ConversationEvent::HttpResponseComplete { .. }
            | ConversationEvent::SseRawChunk(_)
            | ConversationEvent::SubAgentStarted { .. }
            | ConversationEvent::SubAgentProgress { .. }
            | ConversationEvent::SubAgentComplete { .. } => false,
        }
    }

    /// Submit a user prompt: adds it as a display block and marks streaming.
    pub fn submit_prompt(&mut self, text: String) {
        self.blocks.push(DisplayBlock::UserMessage(text));
        self.streaming_buffer.clear();
        self.is_streaming = true;
    }

    /// Flush any accumulated streaming text into a display block.
    fn flush_streaming(&mut self) {
        if !self.streaming_buffer.is_empty() {
            let text = std::mem::take(&mut self.streaming_buffer);
            self.blocks.push(DisplayBlock::AssistantText(text));
            self.streaming_dirty = false;
        }
    }

    /// Acknowledge that the streaming buffer has been rendered.
    /// Clears the dirty flag without touching the buffer itself.
    pub fn acknowledge_streaming_render(&mut self) {
        self.streaming_dirty = false;
    }

    /// Total context window size (input + output tokens).
    pub fn context_window_size(&self) -> u64 {
        self.input_tokens + self.output_tokens
    }

    /// Clear the conversation.
    pub fn clear(&mut self) {
        self.blocks.clear();
        self.streaming_buffer.clear();
        self.streaming_dirty = false;
        self.is_streaming = false;
        self.input_tokens = 0;
        self.output_tokens = 0;
        self.turn_input_tokens = 0;
        self.turn_output_tokens = 0;
        self.stream_chunks = 0;
        self.turn_count = 0;
        self.request_count = 0;
        self.copy_feedback = None;
    }

    /// Set a transient copy-feedback message (e.g. "Copied!").
    pub fn set_copy_feedback(&mut self, msg: &str) {
        self.copy_feedback = Some(msg.to_string());
    }

    /// Take (and clear) the copy-feedback message.
    pub fn take_copy_feedback(&mut self) -> Option<String> {
        self.copy_feedback.take()
    }

    /// Current spinner character, computed from system time.
    ///
    /// Returns a different braille frame every 100ms (10 frames = 1s cycle).
    /// No explicit tick/state needed — purely derived from the clock.
    pub fn spinner_char(&self) -> char {
        let millis = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis();
        let frame = (millis / 100) as usize % SPINNER_FRAMES.len();
        SPINNER_FRAMES[frame]
    }
}
