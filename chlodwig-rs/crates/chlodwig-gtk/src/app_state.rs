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
    ///
    /// `tool_name` and `tool_input` are populated so the renderer can
    /// reproduce rich tool-specific output (Bash with ANSI colors, Read
    /// with numbered lines, Write with file summary, Grep with results)
    /// even when the block is re-rendered after session restore or
    /// window resize. Old sessions without this metadata fall back to
    /// the generic `── [OK] ──` / `── [ERROR] ──` preview format.
    ToolResult {
        output: String,
        is_error: bool,
        tool_name: String,
        tool_input: serde_json::Value,
    },
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
    /// Extracted table data for sortable tables. Each entry is (block_index, table_index_within_block, TableData).
    /// Updated when AssistantText blocks are added. Used by the GTK click handler to sort tables.
    pub tables: Vec<(usize, usize, chlodwig_core::TableData)>,
    /// Optional human-readable name for this session (set via `/name`).
    pub session_name: Option<String>,
    /// Tracks tool_use_id → (tool_name, tool_input) so that the matching
    /// ToolResult event (which only carries `id`) can be turned into a
    /// fully-populated `DisplayBlock::ToolResult` with the tool metadata.
    /// This used to live as a HashMap inside `event_dispatch.rs`; pulling
    /// it into AppState lets the renderer be purely block-driven (no
    /// separate event-rendering path).
    tool_id_to_info: std::collections::HashMap<String, (String, serde_json::Value)>,
    /// Working directory for this tab/window.
    ///
    /// Stage 0 of the multi-window/tabs refactor (see `MULTIWINDOW_TABS.md`):
    /// each tab owns its own CWD so tools can resolve relative paths against
    /// the per-tab `working_directory` instead of the process-global
    /// `std::env::current_dir()`. This eliminates cross-talk between tabs.
    pub cwd: std::path::PathBuf,
}

impl AppState {
    /// Build an `AppState` with the process's current working directory.
    /// Equivalent to `with_cwd(model, env::current_dir().unwrap_or_default())`.
    /// Prefer `with_cwd` when the caller already knows the per-tab CWD.
    pub fn new(model: String) -> Self {
        let cwd = std::env::current_dir().unwrap_or_default();
        Self::with_cwd(model, cwd)
    }

    /// Build an `AppState` with an explicit working directory.
    /// Used by per-tab construction so each tab carries its own CWD.
    pub fn with_cwd(model: String, cwd: std::path::PathBuf) -> Self {
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
            copy_feedback: None,
            should_notify: false,
            auto_scroll: chlodwig_core::AutoScroll::new(),
            show_tool_usage: true,
            tables: Vec::new(),
            session_name: None,
            tool_id_to_info: std::collections::HashMap::new(),
            cwd,
        }
    }

    /// Project-directory name, derived from `self.cwd`.
    ///
    /// Returns the last path component (e.g. `"chlodwig-rs"` for
    /// `/Users/me/projects/chlodwig-rs`). Returns an empty string if
    /// `self.cwd` is `/` or has no file name.
    ///
    /// Stage 0.3 of MULTIWINDOW_TABS.md — replaces the free function
    /// `project_dir_name()` (which read the process CWD).
    pub fn project_dir_name(&self) -> String {
        self.cwd
            .file_name()
            .map(|n| n.to_string_lossy().into_owned())
            .unwrap_or_default()
    }

    /// Startup message that shows this tab's working directory, e.g.
    /// `"cwd: /Users/me/projects/chlodwig-rs"`.
    ///
    /// Displayed as a `SystemMessage` in the output area when a tab opens.
    pub fn startup_cwd_message(&self) -> String {
        format!("cwd: {}", self.cwd.display())
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
                self.push_assistant_text(text);
                true
            }
            ConversationEvent::ToolUseStart { id, name, input } => {
                // Flush any pending streaming text first
                self.flush_streaming();
                // Track tool_use_id → (name, input) so the matching ToolResult
                // event can recover the tool metadata for rich rendering.
                self.tool_id_to_info
                    .insert(id, (name.clone(), input.clone()));
                self.blocks.push(DisplayBlock::ToolUseStart { name, input });
                true
            }
            ConversationEvent::ToolResult { id, output, is_error, .. } => {
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
                let (tool_name, tool_input) = self
                    .tool_id_to_info
                    .remove(&id)
                    .unwrap_or_else(|| (String::new(), serde_json::Value::Null));
                self.blocks.push(DisplayBlock::ToolResult {
                    output: text,
                    is_error,
                    tool_name,
                    tool_input,
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
            self.push_assistant_text(text);
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

    /// Snapshot the cumulative session counters for persistence.
    ///
    /// Returns a [`chlodwig_core::SessionStats`] with the current `turn_count`,
    /// `request_count`, total tokens, and the most-recent `TurnUsage` so that
    /// on resume the bottom-left status counters and `ctx:` indicator restore
    /// to exactly where they were.
    pub fn session_stats(&self) -> chlodwig_core::SessionStats {
        chlodwig_core::SessionStats {
            turn_count: self.turn_count,
            request_count: self.request_count,
            total_input_tokens: self.input_tokens,
            total_output_tokens: self.output_tokens,
            last_input_tokens: self.turn_usage.input_tokens,
            last_output_tokens: self.turn_usage.output_tokens,
            last_cache_tokens: self.turn_usage.cache_tokens,
        }
    }

    /// Restore session counters from a persisted snapshot.
    ///
    /// Inverse of [`Self::session_stats`]. Called when resuming a session
    /// (via [`Self::apply_session_snapshot`]) so the status-line counters
    /// continue from where the previous run left off.
    pub fn apply_session_stats(&mut self, stats: &chlodwig_core::SessionStats) {
        self.turn_count = stats.turn_count;
        self.request_count = stats.request_count;
        self.input_tokens = stats.total_input_tokens;
        self.output_tokens = stats.total_output_tokens;
        self.turn_usage = chlodwig_core::TurnUsage {
            input_tokens: stats.last_input_tokens,
            output_tokens: stats.last_output_tokens,
            cache_tokens: stats.last_cache_tokens,
        };
    }

    /// Push an AssistantText block and extract any tables from it.
    fn push_assistant_text(&mut self, text: String) {
        let block_index = self.blocks.len();
        let extracted = chlodwig_core::extract_tables(&text);
        for (table_idx, table) in extracted.into_iter().enumerate() {
            self.tables.push((block_index, table_idx, table));
        }
        self.blocks.push(DisplayBlock::AssistantText(text));
    }

    /// Sort table `table_global_index` by `col_index`. Toggles direction if
    /// already sorted by the same column. Returns `true` if a table was found.
    pub fn sort_table(&mut self, table_global_index: usize, col_index: usize) -> bool {
        if let Some((_bi, _ti, table)) = self.tables.get_mut(table_global_index) {
            let descending = if table.sort_column == Some(col_index) {
                !table.sort_descending // toggle
            } else {
                false // new column → ascending
            };
            *table = table.sorted_by_column(col_index, descending);
            true
        } else {
            false
        }
    }

    /// Clear the conversation.
    pub fn clear(&mut self) {
        self.blocks.clear();
        self.tables.clear();
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
        self.session_name = None;
        self.tool_id_to_info.clear();
    }

    /// Extract table sort states for session persistence.
    pub fn table_sort_states(&self) -> Vec<chlodwig_core::TableSortState> {
        self.tables
            .iter()
            .filter_map(|(bi, ti, td)| {
                td.sort_column.map(|col| chlodwig_core::TableSortState {
                    block_index: *bi,
                    table_index: *ti,
                    sort_column: col,
                    sort_descending: td.sort_descending,
                })
            })
            .collect()
    }

    /// Apply saved sort states to the extracted tables.
    pub fn apply_table_sort_states(&mut self, sorts: &[chlodwig_core::TableSortState]) {
        for sort in sorts {
            if let Some((bi, ti, td)) = self.tables.iter_mut().find(|(bi, ti, _)| {
                *bi == sort.block_index && *ti == sort.table_index
            }) {
                let _ = (bi, ti); // suppress unused warnings
                *td = td.sorted_by_column(sort.sort_column, sort.sort_descending);
            }
        }
    }

    /// Apply a `SessionSnapshot` to this `AppState`, replacing all current
    /// in-memory state with the data from the snapshot.
    ///
    /// Performs (in this order):
    /// 1. `clear()` — wipes blocks, counters, tables, name, etc.
    /// 2. `restore_messages()` — converts `Message`s → `DisplayBlock`s.
    /// 3. `apply_table_sort_states()` — re-applies persisted column sorts.
    /// 4. Sets `session_name` from the snapshot.
    ///
    /// This is the GTK-pure (no widgets) part of the resume flow shared
    /// by all three resume entry points (`--resume`, `/resume`, sessions
    /// browser). The widget side (clear output buffer, set window title,
    /// re-render, etc.) is handled by `restore::apply_restored_session_to_ui`.
    pub fn apply_session_snapshot(&mut self, snapshot: &chlodwig_core::SessionSnapshot) {
        self.clear();
        self.restore_messages(&snapshot.messages);
        self.apply_table_sort_states(&snapshot.table_sorts);
        self.session_name = snapshot.name.clone();
        if let Some(stats) = &snapshot.stats {
            self.apply_session_stats(stats);
        }
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
                    self.push_assistant_text(text);
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
                    // Synthesize a Bash tool_input so the renderer can re-create
                    // the live `$ command\n<ANSI output>` rendering on restore.
                    self.blocks.push(DisplayBlock::ToolResult {
                        output,
                        is_error: false,
                        tool_name: "Bash".into(),
                        tool_input: serde_json::json!({ "command": command }),
                    });
                }
                RestoredBlock::ReadOutput { file_path, content } => {
                    self.blocks.push(DisplayBlock::ToolResult {
                        output: content,
                        is_error: false,
                        tool_name: "Read".into(),
                        tool_input: serde_json::json!({ "file_path": file_path }),
                    });
                }
                RestoredBlock::WriteOutput {
                    file_path,
                    content,
                    summary,
                } => {
                    self.blocks.push(DisplayBlock::ToolResult {
                        output: summary,
                        is_error: false,
                        tool_name: "Write".into(),
                        tool_input: serde_json::json!({
                            "file_path": file_path,
                            "content": content,
                        }),
                    });
                }
                RestoredBlock::GrepOutput { content, .. } => {
                    self.blocks.push(DisplayBlock::ToolResult {
                        output: content,
                        is_error: false,
                        tool_name: "Grep".into(),
                        tool_input: serde_json::Value::Null,
                    });
                }
                RestoredBlock::ToolResult { is_error, output } => {
                    self.blocks.push(DisplayBlock::ToolResult {
                        output,
                        is_error,
                        tool_name: String::new(),
                        tool_input: serde_json::Value::Null,
                    });
                }
                RestoredBlock::SystemMessage(text) => {
                    self.blocks.push(DisplayBlock::SystemMessage(text));
                }
                RestoredBlock::CompactionSummary(text) => {
                    // Compaction-continuation messages are stored as User
                    // messages in the API history but were generated by the
                    // model and contain markdown (headings, lists, code).
                    // Render via the same path as AssistantText.
                    self.blocks.push(DisplayBlock::AssistantText(text));
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
