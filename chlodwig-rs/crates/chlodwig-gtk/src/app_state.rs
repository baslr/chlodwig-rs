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
    pub turn_usage: chlodwig_core::TurnUsage,
    /// Number of SSE chunks in current stream.
    pub stream_chunks: u64,
    /// Number of completed conversation turns.
    pub turn_count: u32,
    /// Number of API requests made.
    pub request_count: u32,
    /// Model name.
    pub model: String,
    /// Current working directory.
    pub cwd: String,
    /// Transient copy-feedback message (e.g. "Copied!"), shown briefly in status bar.
    pub copy_feedback: Option<String>,
    /// Set to `true` when a turn completes and the UI should consider sending
    /// a system notification. Cleared by `take_should_notify()`.
    pub should_notify: bool,
    /// Auto-scroll state: follow new content unless user has scrolled up.
    /// Shared logic with the TUI via `chlodwig_core::AutoScroll`.
    pub auto_scroll: chlodwig_core::AutoScroll,
    /// Whether tool usage blocks (ToolUseStart, ToolResult) are visible in the output.
    /// UI preference — survives `clear()`.
    pub show_tool_usage: bool,
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
            turn_usage: chlodwig_core::TurnUsage::default(),
            stream_chunks: 0,
            turn_count: 0,
            request_count: 0,
            model,
            cwd: std::env::current_dir()
                .map(|p| p.display().to_string())
                .unwrap_or_default(),
            copy_feedback: None,
            should_notify: false,
            auto_scroll: chlodwig_core::AutoScroll::new(),
            show_tool_usage: true,
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
                self.should_notify = false; // new turn started
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
                self.should_notify = true;
                true
            }
            ConversationEvent::Error(msg) => {
                self.flush_streaming();
                self.is_streaming = false;
                self.blocks.push(DisplayBlock::Error(msg));
                true
            }
            ConversationEvent::Usage { input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens } => {
                self.input_tokens += input_tokens as u64;
                self.output_tokens += output_tokens as u64;
                self.turn_usage.update(input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens);
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

    /// Total context window size (input + output + cache tokens from the last API response).
    pub fn context_window_size(&self) -> u64 {
        self.turn_usage.context_window_size()
    }

    /// Clear the conversation.
    pub fn clear(&mut self) {
        self.blocks.clear();
        self.streaming_buffer.clear();
        self.streaming_dirty = false;
        self.is_streaming = false;
        self.input_tokens = 0;
        self.output_tokens = 0;
        self.turn_usage.reset();
        self.stream_chunks = 0;
        self.turn_count = 0;
        self.request_count = 0;
        self.copy_feedback = None;
        self.should_notify = false;
        self.auto_scroll.scroll_to_bottom();
    }

    /// Restore saved messages into display blocks.
    ///
    /// Uses `chlodwig_core::restore_messages()` to convert `Message` → `RestoredBlock`,
    /// then maps each to the GTK `DisplayBlock`. This is the GTK counterpart of
    /// the TUI's `restore_messages_to_display()` — both use the same core logic.
    pub fn restore_messages(&mut self, messages: &[chlodwig_core::Message]) {
        use chlodwig_core::RestoredBlock;

        for rb in chlodwig_core::restore_messages(messages) {
            match rb {
                RestoredBlock::UserMessage(text) => {
                    self.blocks.push(DisplayBlock::UserMessage(text));
                }
                RestoredBlock::AssistantText(text) => {
                    self.blocks.push(DisplayBlock::AssistantText(text));
                }
                RestoredBlock::Thinking(_) => {
                    // GTK doesn't display thinking blocks (yet)
                }
                RestoredBlock::ToolCall { name, input } => {
                    self.blocks.push(DisplayBlock::ToolUseStart { name, input });
                }
                RestoredBlock::EditDiff {
                    file_path,
                    old_string,
                    new_string,
                } => {
                    // Represent as a ToolUseStart with the Edit input
                    self.blocks.push(DisplayBlock::ToolUseStart {
                        name: "Edit".into(),
                        input: serde_json::json!({
                            "file_path": file_path,
                            "old_string": old_string,
                            "new_string": new_string,
                        }),
                    });
                }
                RestoredBlock::BashOutput { command, output } => {
                    // Represent as a ToolResult (the GTK render_event_to_buffer
                    // handles Bash rendering separately during live streaming,
                    // but for restore we store the output directly)
                    self.blocks.push(DisplayBlock::ToolResult {
                        output: format!("$ {command}\n{output}"),
                        is_error: false,
                    });
                }
                RestoredBlock::ReadOutput { file_path, content } => {
                    self.blocks.push(DisplayBlock::ToolResult {
                        output: format!("── Read: {file_path} ──\n{content}"),
                        is_error: false,
                    });
                }
                RestoredBlock::WriteOutput {
                    file_path,
                    content: _,
                    summary,
                } => {
                    self.blocks.push(DisplayBlock::ToolResult {
                        output: format!("── Write: {file_path} ──\n{summary}"),
                        is_error: false,
                    });
                }
                RestoredBlock::GrepOutput { content, .. } => {
                    self.blocks.push(DisplayBlock::ToolResult {
                        output: content,
                        is_error: false,
                    });
                }
                RestoredBlock::ToolResult { is_error, output } => {
                    self.blocks.push(DisplayBlock::ToolResult {
                        output,
                        is_error,
                    });
                }
                RestoredBlock::SystemMessage(text) => {
                    self.blocks.push(DisplayBlock::SystemMessage(text));
                }
            }
        }
    }

    /// Set a transient copy-feedback message (e.g. "Copied!").
    pub fn set_copy_feedback(&mut self, msg: &str) {
        self.copy_feedback = Some(msg.to_string());
    }

    /// Take (and clear) the copy-feedback message.
    pub fn take_copy_feedback(&mut self) -> Option<String> {
        self.copy_feedback.take()
    }

    /// Take (and clear) the should_notify flag.
    /// Returns `true` if a system notification should be sent.
    pub fn take_should_notify(&mut self) -> bool {
        let val = self.should_notify;
        self.should_notify = false;
        val
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

// ── Input editing helpers (GTK-independent, testable) ──────────────

/// Delete text from cursor position back to the start of the current line.
///
/// macOS behavior for Cmd+Backspace: deletes everything between the cursor
/// and the beginning of the line the cursor is on. If the cursor is already
/// at the start of a line, nothing happens.
///
/// `text`: the full input text.
/// `cursor`: cursor position as a **char index** (not byte index).
///
/// Returns `(new_text, new_cursor)` where `new_cursor` is the char index
/// after deletion (i.e. the position of the line start).
pub fn delete_to_line_start(text: &str, cursor: usize) -> (String, usize) {
    if cursor == 0 || text.is_empty() {
        return (text.to_string(), cursor);
    }

    // Clamp cursor to text length
    let char_count = text.chars().count();
    let cursor = cursor.min(char_count);

    // Find the start of the current line by scanning backwards from cursor
    // for a '\n'. The line start is the char right after the '\n', or 0.
    let chars: Vec<char> = text.chars().collect();
    let mut line_start = 0;
    for i in (0..cursor).rev() {
        if chars[i] == '\n' {
            line_start = i + 1;
            break;
        }
    }

    if line_start == cursor {
        // Cursor is already at the start of the line — nothing to delete.
        return (text.to_string(), cursor);
    }

    // Delete chars[line_start..cursor]
    let new_text: String = chars[..line_start]
        .iter()
        .chain(chars[cursor..].iter())
        .collect();

    (new_text, line_start)
}

/// Return the char index of the start of the line the cursor is on.
///
/// Scans backwards from `cursor` for a `\n`. The line start is the char
/// right after the `\n`, or 0 if no newline is found.
///
/// `cursor` is a char index (not byte index), clamped to text length.
pub fn line_start_pos(text: &str, cursor: usize) -> usize {
    if text.is_empty() {
        return 0;
    }
    let char_count = text.chars().count();
    let cursor = cursor.min(char_count);
    if cursor == 0 {
        return 0;
    }

    let chars: Vec<char> = text.chars().collect();
    for i in (0..cursor).rev() {
        if chars[i] == '\n' {
            return i + 1;
        }
    }
    0
}

/// Return the char index of the end of the line the cursor is on.
///
/// Scans forward from `cursor` for a `\n`. The line end is the index of
/// the `\n`, or `chars.count()` if no newline is found (end of text).
///
/// `cursor` is a char index (not byte index), clamped to text length.
pub fn line_end_pos(text: &str, cursor: usize) -> usize {
    if text.is_empty() {
        return 0;
    }
    let char_count = text.chars().count();
    let cursor = cursor.min(char_count);

    for (i, ch) in text.chars().enumerate().skip(cursor) {
        if ch == '\n' {
            return i;
        }
    }
    char_count
}

/// Move cursor one word to the left (Option+Left / Alt+Left).
///
/// Algorithm (matches macOS behavior):
/// 1. From cursor, skip non-alphanumeric chars backwards (spaces, punctuation).
/// 2. Then skip alphanumeric chars backwards (the word body).
/// 3. Return the position where we stopped.
///
/// `cursor` is a char index (not byte index), clamped to text length.
pub fn word_left_pos(text: &str, cursor: usize) -> usize {
    if text.is_empty() || cursor == 0 {
        return 0;
    }
    let chars: Vec<char> = text.chars().collect();
    let mut pos = cursor.min(chars.len());

    // Step 1: skip non-alphanumeric backwards
    while pos > 0 && !chars[pos - 1].is_alphanumeric() {
        pos -= 1;
    }
    // Step 2: skip alphanumeric backwards (the word)
    while pos > 0 && chars[pos - 1].is_alphanumeric() {
        pos -= 1;
    }
    pos
}

/// Move cursor one word to the right (Option+Right / Alt+Right).
///
/// Algorithm (matches macOS behavior):
/// - If cursor is on an alphanumeric char: skip forward past the word → stop.
/// - If cursor is on a non-alphanumeric char: skip non-alnum, then skip the
///   next word → stop.
///
/// This places the cursor right after the end of the current/next word.
///
/// `cursor` is a char index (not byte index), clamped to text length.
pub fn word_right_pos(text: &str, cursor: usize) -> usize {
    let chars: Vec<char> = text.chars().collect();
    let len = chars.len();
    if text.is_empty() || cursor >= len {
        return len;
    }
    let mut pos = cursor;

    if !chars[pos].is_alphanumeric() {
        // Cursor on space/punctuation: skip non-alnum first
        while pos < len && !chars[pos].is_alphanumeric() {
            pos += 1;
        }
    }
    // Skip alphanumeric (the word body)
    while pos < len && chars[pos].is_alphanumeric() {
        pos += 1;
    }
    pos
}

/// Delete the word before the cursor (Option+Backspace).
///
/// Uses `word_left_pos` to find where the previous word starts, then
/// deletes chars between that position and the cursor.
///
/// Returns `(new_text, new_cursor)`.
pub fn delete_word_back(text: &str, cursor: usize) -> (String, usize) {
    if text.is_empty() || cursor == 0 {
        return (text.to_string(), cursor);
    }
    let char_count = text.chars().count();
    let cursor = cursor.min(char_count);
    let word_start = word_left_pos(text, cursor);

    if word_start == cursor {
        return (text.to_string(), cursor);
    }

    let chars: Vec<char> = text.chars().collect();
    let new_text: String = chars[..word_start]
        .iter()
        .chain(chars[cursor..].iter())
        .collect();

    (new_text, word_start)
}

/// Determine the project directory name from the current working directory.
/// Returns the last path component (e.g. "chlodwig-rs" for "/Users/me/projects/chlodwig-rs").
/// Returns an empty string if CWD is `/` (launched via double-click without project dir)
/// or can't be determined.
pub fn project_dir_name() -> String {
    std::env::current_dir()
        .ok()
        .and_then(|p| {
            // Root directory "/" has no file_name — return empty
            p.file_name().map(|n| n.to_string_lossy().into_owned())
        })
        .unwrap_or_default()
}

/// Build the startup message that shows the current working directory.
///
/// Displayed as a `SystemMessage` in the output area when the GTK app
/// launches, so the user immediately sees which project directory is active.
pub fn startup_cwd_message() -> String {
    let cwd = std::env::current_dir()
        .map(|p| p.display().to_string())
        .unwrap_or_else(|_| "unknown".to_string());
    format!("cwd: {cwd}")
}

// ── Command parser ────────────────────────────────────────────────
// Re-exported from chlodwig-core to avoid duplication with the TUI.
pub use chlodwig_core::{Command, COMMANDS_HELP, execute_shell_pty};

/// GTK-specific help text: shared command list + GTK keybindings.
pub fn help_text() -> String {
    format!(
        "{COMMANDS_HELP}

⌨ Key Bindings:
  Cmd+Enter             Submit input
  Enter                 Insert newline
  Cmd+Backspace         Delete to start of line
  Option+Backspace      Delete word backward
  Cmd+←/→               Move cursor to line start/end
  Cmd+↑/↓               Move cursor to document start/end
  Option+←/→            Move cursor word left/right
  Cmd+V/C/X/A           Paste/Copy/Cut/Select All
  Cmd+Q                 Quit"
    )
}
