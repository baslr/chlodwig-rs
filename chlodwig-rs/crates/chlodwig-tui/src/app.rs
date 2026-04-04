//! Application state and logic.

use ratatui::style::{Color, Modifier, Style};
use std::collections::VecDeque;
use std::time::{Duration, Instant};

use ansi_to_tui::IntoText;
use chlodwig_core::{ContentBlock, Message, Role, SystemBlock, ToolResultContent};
use unicode_width::UnicodeWidthChar;

use crate::markdown;
use crate::rendered_line::RenderedLine;
use crate::types::*;

pub(crate) struct App {
    pub(crate) display_blocks: Vec<DisplayBlock>,
    pub(crate) input: String,
    pub(crate) cursor: usize,
    pub(crate) scroll: usize,
    pub(crate) auto_scroll: bool,
    pub(crate) is_loading: bool,
    pub(crate) streaming_buffer: String,
    pub(crate) pending_permission: Option<PendingPermission>,
    pub(crate) should_quit: bool,
    // Token usage tracking
    pub(crate) total_input_tokens: u64,
    pub(crate) total_output_tokens: u64,
    pub(crate) turn_input_tokens: u64,
    pub(crate) turn_output_tokens: u64,
    pub(crate) stream_chunks: u64,
    pub(crate) turn_count: u32,
    pub(crate) api_request_count: u32,
    pub(crate) model: String,
    // Cached rendered lines for scrollback
    pub(crate) rendered_lines: Vec<RenderedLine>,
    pub(crate) lines_dirty: bool,
    // Current viewport width for word wrapping (chars, excluding borders)
    pub(crate) wrap_width: usize,
    // Prompt history (oldest first)
    pub(crate) prompt_history: Vec<String>,
    pub(crate) history_index: Option<usize>, // None = current input, Some(0) = newest, Some(n) = n-th from end
    pub(crate) saved_input: String,          // saved current input when browsing history
    // Tab bar
    pub(crate) active_tab: usize,            // 0 = Prompt, 1 = Sys-Prompt, 2 = Requests
    pub(crate) focus: Focus,                 // Which area has keyboard focus
    pub(crate) system_prompt_blocks: Vec<SystemBlock>, // System prompt blocks for display
    pub(crate) sys_prompt_scroll: usize,     // Scroll position in sys-prompt tab
    pub(crate) sys_prompt_lines: Vec<RenderedLine>,    // Pre-rendered sys-prompt lines
    // Requests tab
    pub(crate) requests_log: VecDeque<RequestLogEntry>, // Ring buffer of API requests
    pub(crate) requests_lines: Vec<RenderedLine>,       // Pre-rendered request log lines
    pub(crate) requests_scroll: usize,                  // Scroll position in requests tab
    pub(crate) requests_dirty: bool,                    // Needs rebuild_requests_lines()
    pub(crate) spinner_frame: usize,                    // Animated spinner index (cycles on poll tick)
    // Session / context timers and compaction counter
    pub(crate) session_start: Instant,                   // When the TUI session started (never resets)
    pub(crate) context_start: Instant,                   // When the current context started (resets on compaction/clear)
    pub(crate) compaction_count: u32,                    // How many compactions have occurred
    pub(crate) last_redraw: Instant,                     // When the last redraw happened (for periodic timer refresh)
}

impl App {
    pub(crate) fn new(model: String) -> Self {
        Self {
            display_blocks: Vec::new(),
            input: String::new(),
            cursor: 0,
            scroll: 0,
            auto_scroll: true,
            is_loading: false,
            streaming_buffer: String::new(),
            pending_permission: None,
            should_quit: false,
            total_input_tokens: 0,
            total_output_tokens: 0,
            turn_input_tokens: 0,
            turn_output_tokens: 0,
            stream_chunks: 0,
            turn_count: 0,
            api_request_count: 0,
            model,
            rendered_lines: Vec::new(),
            lines_dirty: true,
            wrap_width: 120, // sensible default, updated on first draw
            prompt_history: Vec::new(),
            history_index: None,
            saved_input: String::new(),
            active_tab: 0,
            focus: Focus::Input,
            system_prompt_blocks: Vec::new(),
            sys_prompt_scroll: 0,
            sys_prompt_lines: Vec::new(),
            requests_log: VecDeque::new(),
            requests_lines: Vec::new(),
            requests_scroll: 0,
            requests_dirty: false,
            spinner_frame: 0,
            session_start: Instant::now(),
            context_start: Instant::now(),
            compaction_count: 0,
            last_redraw: Instant::now(),
        }
    }

    /// Advance the spinner frame (called on each poll tick while loading).
    pub(crate) fn tick_spinner(&mut self) {
        self.spinner_frame = (self.spinner_frame + 1) % SPINNER_FRAMES.len();
    }

    /// Returns true if ≥60 seconds have passed since the last redraw,
    /// meaning the title-bar timers are stale and should be refreshed.
    pub(crate) fn needs_timer_redraw(&self) -> bool {
        self.last_redraw.elapsed() >= Duration::from_secs(60)
    }

    /// Record that a redraw just happened (resets the timer-redraw clock).
    pub(crate) fn mark_redrawn(&mut self) {
        self.last_redraw = Instant::now();
    }

    /// Current spinner character.
    pub(crate) fn spinner_char(&self) -> char {
        SPINNER_FRAMES[self.spinner_frame % SPINNER_FRAMES.len()]
    }

    pub(crate) fn context_window_size(&self) -> u64 {
        self.total_input_tokens + self.total_output_tokens
    }

    /// Format a Duration as a human-readable timer string.
    /// - Under 1 hour: "M:SS" (e.g. "0:05", "12:34")
    /// - 1 hour or more: "H:MM:SS" (e.g. "1:00:00", "23:59:59")
    pub(crate) fn format_duration(d: Duration) -> String {
        let total_secs = d.as_secs();
        let hours = total_secs / 3600;
        let mins = (total_secs % 3600) / 60;
        let secs = total_secs % 60;
        if hours > 0 {
            format!("{}:{:02}:{:02}", hours, mins, secs)
        } else {
            format!("{}:{:02}", mins, secs)
        }
    }

    /// Handle a compaction-complete event: increment counter, reset context timer.
    pub(crate) fn on_compaction_complete(&mut self, old_messages: usize, summary_tokens: u32) {
        self.compaction_count += 1;
        self.context_start = Instant::now();

        // Update display (same logic as before, moved here for encapsulation)
        self.streaming_buffer.clear();
        self.display_blocks.clear();
        self.display_blocks.push(DisplayBlock::SystemMessage(
            format!(
                "Compacted {} messages. Context reduced to ~{} tokens.",
                old_messages, summary_tokens,
            ),
        ));
        // Reset token counters to post-compaction state
        self.total_input_tokens = summary_tokens as u64;
        self.total_output_tokens = 0;
        self.turn_input_tokens = 0;
        self.turn_output_tokens = 0;
        self.scroll_to_bottom_if_auto();
    }

    /// Build the title string for the output pane.
    /// Parameters: scroll_pos, total lines, view_height, pct (scroll percentage).
    /// Includes context timer, session timer, compaction count, and optional scroll info.
    pub(crate) fn build_title_info(
        &self,
        scroll_pos: usize,
        total: usize,
        view_height: usize,
        pct: usize,
    ) -> String {
        let ctx_elapsed = Self::format_duration(self.context_start.elapsed());
        let session_elapsed = Self::format_duration(self.session_start.elapsed());
        let timer_info = format!(
            "ctx ⏲ {} | ⏲ {} | Compactions: {}",
            ctx_elapsed, session_elapsed, self.compaction_count,
        );
        if total > view_height {
            format!(
                " Chlodwig (Rust PoC) — {} [{}/{} lines · {}%] ",
                timer_info,
                scroll_pos + view_height,
                total,
                pct,
            )
        } else {
            format!(" Chlodwig (Rust PoC) — {} ", timer_info)
        }
    }

    /// Rebuild the rendered line cache from display_blocks + streaming_buffer.
    /// Lines are wrapped to `self.wrap_width` characters.
    pub(crate) fn rebuild_lines(&mut self) {
        if !self.lines_dirty {
            return;
        }

        tracing::debug!(
            blocks = self.display_blocks.len(),
            streaming_buf_len = self.streaming_buffer.len(),
            wrap_width = self.wrap_width,
            "rebuild_lines: start"
        );

        // First, collect logical lines (unwrapped)
        let mut logical_lines: Vec<RenderedLine> = Vec::new();

        for block in &self.display_blocks {
            match block {
                DisplayBlock::Timestamp(ts) => {
                    logical_lines.push(RenderedLine::styled(
                        ts,
                        Style::default().fg(Color::DarkGray),
                    ));
                }
                DisplayBlock::UserMessage(text) => {
                    logical_lines.push(RenderedLine::multi(vec![
                        (
                            "You: ",
                            Style::default()
                                .fg(Color::Green)
                                .add_modifier(Modifier::BOLD),
                        ),
                        (text, Style::default()),
                    ]));
                    logical_lines.push(RenderedLine::plain(""));
                }
                DisplayBlock::AssistantText(text) => {
                    tracing::debug!(
                        text_len = text.len(),
                        text_lines = text.lines().count(),
                        "rebuild_lines: rendering AssistantText as markdown"
                    );
                    logical_lines.extend(markdown::render_markdown(text));
                    logical_lines.push(RenderedLine::plain(""));
                }
                DisplayBlock::ToolCall {
                    name,
                    input_preview,
                } => {
                    logical_lines.push(RenderedLine::styled(
                        &format!("── Tool: {name} ──"),
                        Style::default().fg(Color::Yellow),
                    ));
                    for line in input_preview.lines().take(5) {
                        logical_lines.push(RenderedLine::styled(
                            &format!("  {line}"),
                            Style::default().fg(Color::DarkGray),
                        ));
                    }
                }
                DisplayBlock::ToolResult { is_error, preview } => {
                    let (prefix, color) = if *is_error {
                        ("ERROR", Color::Red)
                    } else {
                        ("OK", Color::Green)
                    };
                    logical_lines.push(RenderedLine::styled(
                        &format!("── [{prefix}] ──"),
                        Style::default().fg(color),
                    ));
                    for line in preview.lines().take(10) {
                        logical_lines.push(RenderedLine::styled(
                            &format!("  {line}"),
                            Style::default().fg(Color::DarkGray),
                        ));
                    }
                    logical_lines.push(RenderedLine::plain(""));
                }
                DisplayBlock::Thinking(_text) => {
                    logical_lines.push(RenderedLine::styled(
                        "thinking...",
                        Style::default()
                            .fg(Color::Magenta)
                            .add_modifier(Modifier::ITALIC),
                    ));
                }
                DisplayBlock::Error(e) => {
                    logical_lines.push(RenderedLine::styled(
                        &format!("Error: {e}"),
                        Style::default().fg(Color::Red),
                    ));
                }
                DisplayBlock::SystemMessage(text) => {
                    logical_lines.push(RenderedLine::styled(
                        &format!("⟫ {text}"),
                        Style::default()
                            .fg(Color::Cyan)
                            .add_modifier(Modifier::ITALIC),
                    ));
                    logical_lines.push(RenderedLine::plain(""));
                }
                DisplayBlock::BashOutput { command, raw_output } => {
                    tracing::debug!(
                        cmd = command.as_str(),
                        output_len = raw_output.len(),
                        "rebuild_lines: rendering BashOutput"
                    );
                    // Header: $ command
                    logical_lines.push(RenderedLine::styled(
                        &format!("$ {command}"),
                        Style::default()
                            .fg(Color::Yellow)
                            .add_modifier(Modifier::BOLD),
                    ));
                    // Parse ANSI escape codes → ratatui styled spans
                    match raw_output.as_bytes().into_text() {
                        Ok(text) => {
                            for line in text.lines {
                                let spans: Vec<(String, Style)> = line
                                    .spans
                                    .iter()
                                    .map(|s| (s.content.to_string(), s.style))
                                    .collect();
                                logical_lines.push(RenderedLine {
                                    spans,
                                    wrap_prefix: None,
                                });
                            }
                        }
                        Err(_) => {
                            // Fallback: plain text without ANSI parsing
                            for line in raw_output.lines() {
                                logical_lines.push(RenderedLine::plain(line));
                            }
                        }
                    }
                    logical_lines.push(RenderedLine::plain(""));
                }
            }
        }

        // Streaming buffer — render as markdown for live preview
        if !self.streaming_buffer.is_empty() {
            tracing::debug!(
                buf_len = self.streaming_buffer.len(),
                buf_lines = self.streaming_buffer.lines().count(),
                "rebuild_lines: rendering streaming buffer as markdown"
            );
            logical_lines.extend(markdown::render_markdown(&self.streaming_buffer));
            tracing::debug!(
                logical_lines = logical_lines.len(),
                "rebuild_lines: streaming markdown done"
            );
        }

        if self.is_loading && self.streaming_buffer.is_empty() {
            logical_lines.push(RenderedLine::styled(
                &format!("{} Thinking...", self.spinner_char()),
                Style::default().fg(Color::Yellow),
            ));
        }

        // Wrap logical lines to viewport width and collect into rendered_lines
        let w = if self.wrap_width > 0 { self.wrap_width } else { usize::MAX };
        self.rendered_lines.clear();
        tracing::debug!(
            logical_lines = logical_lines.len(),
            wrap_width = w,
            "rebuild_lines: wrapping start"
        );
        for (i, logical) in logical_lines.iter().enumerate() {
            let dw = logical.display_width();
            // Log lines that will actually be wrapped (wider than viewport)
            if dw > w {
                tracing::debug!(
                    line_idx = i,
                    display_width = dw,
                    spans = logical.spans.len(),
                    first_span_len = logical.spans.first().map(|(t, _)| t.len()).unwrap_or(0),
                    "rebuild_lines: wrapping wide line"
                );
            }
            for wrapped in logical.wrap(w) {
                self.rendered_lines.push(wrapped);
            }
        }
        tracing::debug!(
            rendered_lines = self.rendered_lines.len(),
            "rebuild_lines: done"
        );

        // Trim scrollback if over limit
        if self.rendered_lines.len() > MAX_SCROLLBACK_LINES {
            let excess = self.rendered_lines.len() - MAX_SCROLLBACK_LINES;
            self.rendered_lines.drain(..excess);
            self.scroll = self.scroll.saturating_sub(excess);
        }

        self.lines_dirty = false;
    }

    /// Update only the spinner line in rendered_lines (O(1) instead of full rebuild).
    /// Called on spinner tick when is_loading && streaming_buffer is empty.
    /// The spinner line is always the last rendered_line if it exists.
    pub(crate) fn update_spinner_line(&mut self) {
        if !self.is_loading || !self.streaming_buffer.is_empty() {
            return;
        }
        let spinner_line = RenderedLine::styled(
            &format!("{} Thinking...", self.spinner_char()),
            Style::default().fg(Color::Yellow),
        );
        // The spinner line is the last line added by rebuild_lines()
        if let Some(last) = self.rendered_lines.last_mut() {
            // Only replace if it looks like a spinner line (starts with a braille char)
            if let Some((text, _)) = last.spans.first() {
                if text.contains("Thinking...") {
                    *last = spinner_line;
                }
            }
        }
    }

    /// Scroll to bottom (unconditional — forces auto_scroll on).
    /// Use only for explicit user actions (e.g. submitting a prompt).
    pub(crate) fn scroll_to_bottom(&mut self) {
        self.auto_scroll = true;
    }

    /// Scroll to bottom only if auto_scroll is already active.
    /// Use for incoming content (streaming, tool results, etc.) so that
    /// a user who has manually scrolled up is not yanked back to the bottom.
    pub(crate) fn scroll_to_bottom_if_auto(&mut self) {
        // If auto_scroll is already on, it stays on — render will follow.
        // If user has scrolled up (auto_scroll=false), do nothing.
    }

    // ── Word-wise cursor movement (Option+Arrow / Alt+Arrow) ───────

    /// Classify a character into a word-boundary category.
    /// Three categories: whitespace, alphanumeric (includes '_'), punctuation/symbol.
    /// Word boundaries occur between different categories.
    fn char_category(c: char) -> u8 {
        if c.is_whitespace() {
            0
        } else if c.is_alphanumeric() || c == '_' {
            1
        } else {
            2 // punctuation / symbols
        }
    }

    /// Move cursor one word to the left (Option+Left / Alt+Left).
    /// Behavior matches macOS text editors:
    /// 1. Skip any whitespace immediately before the cursor
    /// 2. Then skip all characters of the same category (word or punctuation)
    pub(crate) fn move_cursor_word_left(&mut self) {
        if self.cursor == 0 {
            return;
        }
        let chars: Vec<char> = self.input.chars().collect();
        let mut pos = self.cursor;

        // Phase 1: skip whitespace backwards
        while pos > 0 && chars[pos - 1].is_whitespace() {
            pos -= 1;
        }

        // Phase 2: skip same-category characters backwards
        if pos > 0 {
            let cat = Self::char_category(chars[pos - 1]);
            while pos > 0 && Self::char_category(chars[pos - 1]) == cat {
                pos -= 1;
            }
        }

        self.cursor = pos;
    }

    /// Move cursor one word to the right (Option+Right / Alt+Right).
    /// Behavior matches macOS text editors:
    /// 1. Skip all characters of the same category (word or punctuation) forward
    /// 2. Then skip any whitespace
    pub(crate) fn move_cursor_word_right(&mut self) {
        let chars: Vec<char> = self.input.chars().collect();
        let len = chars.len();
        if self.cursor >= len {
            return;
        }
        let mut pos = self.cursor;

        // If currently on whitespace, skip it first
        if chars[pos].is_whitespace() {
            while pos < len && chars[pos].is_whitespace() {
                pos += 1;
            }
            // Then skip the next word/punctuation group
            if pos < len {
                let cat = Self::char_category(chars[pos]);
                while pos < len && Self::char_category(chars[pos]) == cat {
                    pos += 1;
                }
            }
        } else {
            // On a word/punctuation char: skip to end of current group
            let cat = Self::char_category(chars[pos]);
            while pos < len && Self::char_category(chars[pos]) == cat {
                pos += 1;
            }
        }

        self.cursor = pos;
    }

    /// Delete the word before the cursor (Alt+Backspace / Option+Backspace).
    /// Uses the same boundary logic as `move_cursor_word_left()`.
    pub(crate) fn delete_word_back(&mut self) {
        if self.cursor == 0 {
            return;
        }
        let old_cursor = self.cursor;
        self.move_cursor_word_left();
        let new_cursor = self.cursor;

        // Delete chars between new_cursor and old_cursor (as byte range)
        let start_byte = self.input
            .char_indices()
            .nth(new_cursor)
            .map(|(i, _)| i)
            .unwrap_or(self.input.len());
        let end_byte = self.input
            .char_indices()
            .nth(old_cursor)
            .map(|(i, _)| i)
            .unwrap_or(self.input.len());

        self.input.drain(start_byte..end_byte);
        // cursor is already at new_cursor from move_cursor_word_left()
    }

    /// Delete the word after the cursor (Alt+Delete / fn+Option+Backspace on macOS).
    /// Uses the same boundary logic as `move_cursor_word_right()`.
    pub(crate) fn delete_word_forward(&mut self) {
        let len = self.input_char_count();
        if self.cursor >= len {
            return;
        }
        let old_cursor = self.cursor;

        // Temporarily move cursor right to find the word boundary
        self.move_cursor_word_right();
        let end_cursor = self.cursor;

        // Delete chars between old_cursor and end_cursor (as byte range)
        let start_byte = self.input
            .char_indices()
            .nth(old_cursor)
            .map(|(i, _)| i)
            .unwrap_or(self.input.len());
        let end_byte = self.input
            .char_indices()
            .nth(end_cursor)
            .map(|(i, _)| i)
            .unwrap_or(self.input.len());

        self.input.drain(start_byte..end_byte);
        // Restore cursor to original position (everything after was deleted/shifted)
        self.cursor = old_cursor;
    }

    /// Convert char-based cursor position to byte index in `self.input`.
    pub(crate) fn cursor_byte_pos(&self) -> usize {
        self.input
            .char_indices()
            .nth(self.cursor)
            .map(|(i, _)| i)
            .unwrap_or(self.input.len())
    }

    /// Number of chars in the input string.
    pub(crate) fn input_char_count(&self) -> usize {
        self.input.chars().count()
    }

    /// Maximum number of visual lines the input area can grow to.
    const INPUT_MAX_VISUAL_LINES: usize = 10;

    /// Count the number of visual lines the input text occupies when rendered
    /// at the given `width` (in terminal columns). Accounts for both explicit
    /// newlines (`\n`) and soft-wrapping of long lines using ratatui-compatible
    /// word-wrapping (matching `Wrap { trim: false }`). Returns at least 1,
    /// capped at `INPUT_MAX_VISUAL_LINES`.
    pub(crate) fn input_visual_line_count(&self, width: usize) -> usize {
        if self.input.is_empty() || width == 0 {
            return 1;
        }
        let mut total_visual = 0usize;
        for logical_line in self.input.split('\n') {
            total_visual += Self::word_wrap_line_count(logical_line, width);
        }
        total_visual.max(1).min(Self::INPUT_MAX_VISUAL_LINES)
    }

    /// Compute the visual (row, col) position of the cursor in the input text,
    /// accounting for soft-wrapping at the given `width` (terminal columns).
    /// Uses ratatui-compatible word-wrapping (matching `Wrap { trim: false }`).
    /// Row 0 is the first visual line of the input area.
    /// Col is measured in terminal columns (display width), not char indices.
    pub(crate) fn input_cursor_visual_pos(&self, width: usize) -> (usize, usize) {
        if width == 0 {
            return (0, 0);
        }
        Self::word_wrap_cursor_pos(&self.input, self.cursor, width)
    }

    /// Count the visual lines for a single logical line (no `\n`) using
    /// ratatui-compatible word-wrapping (`trim: false`).
    fn word_wrap_line_count(line: &str, width: usize) -> usize {
        if line.is_empty() {
            return 1;
        }
        let (total_lines, _, _, _) =
            Self::word_wrap_line_with_cursor(line, width, usize::MAX);
        total_lines
    }

    /// Compute the cursor's visual (row, col) position, accounting for
    /// ratatui-compatible word-wrapping across the full input text.
    /// `cursor` is the char index, `width` is the terminal column width.
    fn word_wrap_cursor_pos(input: &str, cursor: usize, width: usize) -> (usize, usize) {
        let mut global_row = 0usize;
        let mut char_idx = 0usize;

        for logical_line in input.split('\n') {
            let chars_in_line = logical_line.chars().count();
            let cursor_in_line = cursor.saturating_sub(char_idx);

            if char_idx + chars_in_line >= cursor && char_idx <= cursor {
                // Cursor is on this logical line
                let (_, cursor_row, cursor_col, _) =
                    Self::word_wrap_line_with_cursor(logical_line, width, cursor_in_line);
                return (global_row + cursor_row, cursor_col);
            }

            let (lines, _, _, _) =
                Self::word_wrap_line_with_cursor(logical_line, width, usize::MAX);
            global_row += lines;
            char_idx += chars_in_line + 1; // +1 for the '\n'
        }

        // Fallback: cursor at end
        (global_row, 0)
    }

    /// Word-wrap a single logical line and compute where a given char offset
    /// (relative to the start of this line) would appear visually.
    ///
    /// Returns: (total_visual_lines, cursor_row, cursor_col, chars_in_line)
    ///
    /// Two-pass approach:
    /// 1. Build wrapped lines using ratatui's WordWrapper algorithm (trim=false).
    ///    Each wrapped line is a Vec of (char_index, display_width) pairs.
    ///    Also tracks consumed/skipped chars (whitespace eaten at line breaks).
    /// 2. Look up the cursor's char index in the wrapped lines to find (row, col).
    fn word_wrap_line_with_cursor(
        line: &str,
        width: usize,
        cursor_in_line: usize,
    ) -> (usize, usize, usize, usize) {
        let char_count = line.chars().count();
        if char_count == 0 {
            return (1, 0, 0, 0);
        }

        // Phase 1: Build wrapped lines faithfully reproducing ratatui's WordWrapper (trim=false).

        let chars_vec: Vec<char> = line.chars().collect();
        let chars_with_width: Vec<(usize, usize)> = chars_vec
            .iter()
            .enumerate()
            .map(|(i, c)| (i, c.width().unwrap_or(0)))
            .collect();

        // Each wrapped line: list of (char_index, display_width)
        let mut wrapped_lines: Vec<Vec<(usize, usize)>> = Vec::new();

        // Chars consumed at line breaks: char_index → (visual_row_after_break, 0)
        // These are whitespace chars drained or skipped during wrapping.
        let mut consumed_chars: Vec<(usize, usize)> = Vec::new(); // (char_idx, row_after)

        let mut pending_line: Vec<(usize, usize)> = Vec::new();
        let mut pending_ws: Vec<(usize, usize)> = Vec::new();
        let mut pending_word: Vec<(usize, usize)> = Vec::new();
        let mut line_w: usize = 0;
        let mut ws_w: usize = 0;
        let mut word_w: usize = 0;
        let mut prev_non_ws = false;
        let mut current_visual_row: usize = 0;

        for &(ci, cw) in &chars_with_width {
            let ch = chars_vec[ci];
            let is_ws = ch.is_whitespace();

            let word_found = prev_non_ws && is_ws;
            let untrimmed_overflow =
                pending_line.is_empty() && (word_w + ws_w + cw) > width;

            // Flush pending ws+word to committed line
            if word_found || untrimmed_overflow {
                // trim=false: always append whitespace
                pending_line.extend(pending_ws.drain(..));
                line_w += ws_w;
                pending_line.extend(pending_word.drain(..));
                line_w += word_w;
                ws_w = 0;
                word_w = 0;
            }

            let line_full = line_w >= width;
            let pending_word_overflow =
                cw > 0 && (line_w + ws_w + word_w) >= width;

            if line_full || pending_word_overflow {
                // Push current committed line
                wrapped_lines.push(std::mem::take(&mut pending_line));
                let remaining = width.saturating_sub(line_w);
                line_w = 0;
                current_visual_row += 1;

                // Drain whitespace that fits in remaining space
                let mut rem = remaining;
                while let Some(&(ws_ci, ww)) = pending_ws.first() {
                    if ww > rem {
                        break;
                    }
                    ws_w -= ww;
                    rem -= ww;
                    // This whitespace char was consumed at the line break
                    consumed_chars.push((ws_ci, current_visual_row));
                    pending_ws.remove(0);
                }

                // Skip first whitespace at line break
                if is_ws && pending_ws.is_empty() && pending_word.is_empty() {
                    consumed_chars.push((ci, current_visual_row));
                    prev_non_ws = false;
                    continue;
                }
            }

            // Accumulate
            if is_ws {
                ws_w += cw;
                pending_ws.push((ci, cw));
            } else {
                word_w += cw;
                pending_word.push((ci, cw));
            }

            prev_non_ws = !is_ws;
        }

        // Flush remaining content
        // trim=false: always append whitespace
        pending_line.extend(pending_ws.drain(..));
        pending_line.extend(pending_word.drain(..));
        if !pending_line.is_empty() {
            wrapped_lines.push(pending_line);
        }
        if wrapped_lines.is_empty() {
            wrapped_lines.push(Vec::new());
        }

        let total_lines = wrapped_lines.len();

        // Phase 2: Look up cursor position in wrapped lines.
        let (cursor_row, cursor_col) = if cursor_in_line < char_count {
            // First check if cursor is on a consumed char
            let consumed = consumed_chars.iter().find(|&&(ci, _)| ci == cursor_in_line);
            if let Some(&(_, row_after)) = consumed {
                (row_after, 0)
            } else {
                // Find in wrapped lines
                let mut found = (0usize, 0usize);
                'outer: for (row, wline) in wrapped_lines.iter().enumerate() {
                    let mut col = 0usize;
                    for &(ci, cw) in wline {
                        if ci == cursor_in_line {
                            found = (row, col);
                            break 'outer;
                        }
                        col += cw;
                    }
                }
                found
            }
        } else {
            // Cursor at end of line
            let last_row = total_lines - 1;
            let last_line_w: usize = wrapped_lines[last_row].iter().map(|(_, w)| w).sum();
            if last_line_w == width {
                // Last line exactly fills → cursor wraps to virtual next line
                (total_lines, 0)
            } else {
                // last_line_w < width: cursor at end of content
                // last_line_w > width: content overflowed (CJK char didn't fit,
                //   but word-wrap couldn't break it) → cursor at end, past visible area
                (last_row, last_line_w)
            }
        };

        (total_lines, cursor_row, cursor_col, char_count)
    }

    /// Scroll up by `n` lines. Leaves auto_scroll mode, anchors from current position.
    pub(crate) fn scroll_up(&mut self, n: usize) {
        if self.auto_scroll {
            let total = self.rendered_lines.len();
            self.scroll = total;
            self.auto_scroll = false;
        }
        self.scroll = self.scroll.saturating_sub(n);
    }

    /// Scroll down by `n` lines. Snaps back to auto_scroll if near bottom.
    pub(crate) fn scroll_down(&mut self, n: usize, view_height: usize) {
        if self.auto_scroll {
            return;
        }
        self.scroll += n;
        let total = self.rendered_lines.len();
        let max_scroll = total.saturating_sub(view_height);
        if self.scroll >= max_scroll {
            self.scroll = max_scroll;
            self.auto_scroll = true;
        }
    }

    /// Tab-aware scroll up: dispatches to the correct scroll position.
    pub(crate) fn tab_scroll_up(&mut self, n: usize) {
        match self.active_tab {
            0 => self.scroll_up(n),
            1 => {
                self.sys_prompt_scroll = self.sys_prompt_scroll.saturating_sub(n);
            }
            2 => {
                self.requests_scroll = self.requests_scroll.saturating_sub(n);
            }
            _ => {}
        }
    }

    /// Tab-aware scroll down: dispatches to the correct scroll position.
    pub(crate) fn tab_scroll_down(&mut self, n: usize, view_height: usize) {
        match self.active_tab {
            0 => self.scroll_down(n, view_height),
            1 => {
                let max = self.sys_prompt_lines.len().saturating_sub(view_height);
                self.sys_prompt_scroll = (self.sys_prompt_scroll + n).min(max);
            }
            2 => {
                let max = self.requests_lines.len().saturating_sub(view_height);
                self.requests_scroll = (self.requests_scroll + n).min(max);
            }
            _ => {}
        }
    }

    /// Mark lines as needing rebuild.
    pub(crate) fn mark_dirty(&mut self) {
        self.lines_dirty = true;
    }

    // ── Tab bar navigation ───────────────────────────────────────────

    /// Handle Down key from Input: if not navigating history, move focus to TabBar.
    pub(crate) fn handle_down_key(&mut self) {
        if self.history_index.is_none() {
            self.focus = Focus::TabBar;
        }
    }

    /// Handle Up key when focus is on TabBar: move back to Input.
    pub(crate) fn handle_tab_bar_up(&mut self) {
        self.focus = Focus::Input;
    }

    /// Handle Right key when focus is on TabBar: switch to next tab.
    pub(crate) fn handle_tab_bar_right(&mut self) {
        if self.active_tab < 2 {
            self.active_tab += 1;
        }
    }

    /// Handle Left key when focus is on TabBar: switch to previous tab.
    pub(crate) fn handle_tab_bar_left(&mut self) {
        if self.active_tab > 0 {
            self.active_tab -= 1;
        }
    }

    /// Clear the entire conversation — reset display, tokens, scroll, streaming.
    /// Equivalent to `/clear`, `/reset`, `/new`.
    pub(crate) fn clear_conversation(&mut self) {
        self.display_blocks.clear();
        self.streaming_buffer.clear();
        self.is_loading = false;
        self.scroll = 0;
        self.auto_scroll = true;
        self.total_input_tokens = 0;
        self.total_output_tokens = 0;
        self.turn_input_tokens = 0;
        self.turn_output_tokens = 0;
        self.stream_chunks = 0;
        self.turn_count = 0;
        self.api_request_count = 0;
        self.rendered_lines.clear();
        self.lines_dirty = false;

        // Clear requests log
        self.requests_log.clear();
        self.requests_lines.clear();
        self.requests_scroll = 0;
        self.requests_dirty = false;

        // Reset context timer and compaction count (session timer stays!)
        self.context_start = Instant::now();
        self.compaction_count = 0;

        // Show a confirmation message
        self.display_blocks.push(DisplayBlock::SystemMessage(
            "Conversation cleared.".into(),
        ));
        self.mark_dirty();
        self.rebuild_lines();
    }

    /// Restore saved messages into `display_blocks` so the user can scroll
    /// back through the conversation after `/resume` or `--resume`.
    ///
    /// Converts each `Message` + `ContentBlock` into the appropriate
    /// `DisplayBlock` variant, matching what the event loop produces during
    /// live streaming.
    pub(crate) fn restore_messages_to_display(&mut self, messages: &[Message]) {
        for msg in messages {
            match msg.role {
                Role::User => {
                    for block in &msg.content {
                        match block {
                            ContentBlock::Text { text } => {
                                self.display_blocks
                                    .push(DisplayBlock::UserMessage(text.clone()));
                            }
                            ContentBlock::ToolResult {
                                content, is_error, ..
                            } => {
                                let preview = match content {
                                    ToolResultContent::Text(t) => {
                                        Self::truncate_preview(t, 500)
                                    }
                                    ToolResultContent::Blocks(blocks) => {
                                        let text: String = blocks
                                            .iter()
                                            .filter_map(|b| match b {
                                                chlodwig_core::ToolResultBlock::Text { text } => {
                                                    Some(text.as_str())
                                                }
                                                _ => None,
                                            })
                                            .collect::<Vec<_>>()
                                            .join("\n");
                                        Self::truncate_preview(&text, 500)
                                    }
                                };
                                self.display_blocks.push(DisplayBlock::ToolResult {
                                    is_error: is_error.unwrap_or(false),
                                    preview,
                                });
                            }
                            // Image blocks in user messages are not displayed in restore
                            _ => {}
                        }
                    }
                }
                Role::Assistant => {
                    for block in &msg.content {
                        match block {
                            ContentBlock::Text { text } => {
                                self.display_blocks
                                    .push(DisplayBlock::AssistantText(text.clone()));
                            }
                            ContentBlock::ToolUse { name, input, .. } => {
                                let input_preview = Self::truncate_preview(
                                    &serde_json::to_string(input).unwrap_or_default(),
                                    200,
                                );
                                self.display_blocks.push(DisplayBlock::ToolCall {
                                    name: name.clone(),
                                    input_preview,
                                });
                            }
                            ContentBlock::Thinking { thinking } => {
                                self.display_blocks
                                    .push(DisplayBlock::Thinking(thinking.clone()));
                            }
                            _ => {}
                        }
                    }
                }
            }
        }
        self.mark_dirty();
    }

    /// Truncate a string at a safe UTF-8 char boundary.
    /// Gotcha #16: never slice at a hardcoded byte offset — always use `is_char_boundary()`.
    fn truncate_preview(s: &str, max_bytes: usize) -> String {
        if s.len() <= max_bytes {
            return s.to_string();
        }
        let mut end = max_bytes;
        while end > 0 && !s.is_char_boundary(end) {
            end -= 1;
        }
        format!("{}...", &s[..end])
    }

    /// Build rendered lines for the system prompt view from stored blocks.
    pub(crate) fn rebuild_sys_prompt_lines(&mut self) {
        let mut logical_lines: Vec<RenderedLine> = Vec::new();

        for (i, block) in self.system_prompt_blocks.iter().enumerate() {
            let cached = block.cache_control.is_some();
            let cache_tag = if cached { " [cached]" } else { "" };
            logical_lines.push(RenderedLine::styled(
                &format!("── Block {} ──{}", i + 1, cache_tag),
                Style::default()
                    .fg(Color::Cyan)
                    .add_modifier(Modifier::BOLD),
            ));
            logical_lines.push(RenderedLine::plain(""));

            for line in block.text.lines() {
                logical_lines.push(RenderedLine::styled(
                    line,
                    Style::default().fg(Color::White),
                ));
            }
            logical_lines.push(RenderedLine::plain(""));
        }

        if self.system_prompt_blocks.is_empty() {
            logical_lines.push(RenderedLine::styled(
                "(no system prompt blocks)",
                Style::default().fg(Color::DarkGray),
            ));
        }

        let w = if self.wrap_width > 0 { self.wrap_width } else { usize::MAX };
        self.sys_prompt_lines.clear();
        for logical in &logical_lines {
            for wrapped in logical.wrap(w) {
                self.sys_prompt_lines.push(wrapped);
            }
        }
    }

    /// Build rendered lines for the requests log view.
    pub(crate) fn rebuild_requests_lines(&mut self) {
        if !self.requests_dirty {
            return;
        }
        self.requests_dirty = false;

        let mut logical_lines: Vec<RenderedLine> = Vec::new();

        if self.requests_log.is_empty() {
            logical_lines.push(RenderedLine::styled(
                "(no API requests yet)",
                Style::default().fg(Color::DarkGray),
            ));
        } else {
            for (i, entry) in self.requests_log.iter().enumerate().rev() {
                let num = i + 1;
                let duration_str = match entry.duration_ms {
                    Some(ms) => format!("{}ms", ms),
                    None => "streaming…".to_string(),
                };

                logical_lines.push(RenderedLine::styled(
                    &format!(
                        "── Request #{} ── {} ── {} ──",
                        num, entry.timestamp, duration_str
                    ),
                    Style::default()
                        .fg(Color::Cyan)
                        .add_modifier(Modifier::BOLD),
                ));

                logical_lines.push(RenderedLine::styled(
                    "POST /v1/messages",
                    Style::default().fg(Color::White),
                ));
                if !entry.response_model.is_empty() {
                    logical_lines.push(RenderedLine::styled(
                        &format!("Model: {}", entry.response_model),
                        Style::default().fg(Color::White),
                    ));
                }
                logical_lines.push(RenderedLine::styled(
                    &format!(
                        "Tokens: {} in → {} out",
                        entry.response_input_tokens, entry.response_output_tokens
                    ),
                    Style::default().fg(Color::Yellow),
                ));
                logical_lines.push(RenderedLine::plain(""));

                let md_code = format!("```json\n{}\n```", entry.request_body);
                logical_lines.extend(markdown::render_markdown(&md_code));
                logical_lines.push(RenderedLine::plain(""));

                let chunk_count = entry.response_chunks.len();
                logical_lines.push(RenderedLine::styled(
                    &format!("── Response ({} SSE events) ──", chunk_count),
                    Style::default()
                        .fg(Color::Green)
                        .add_modifier(Modifier::BOLD),
                ));
                logical_lines.push(RenderedLine::styled(
                    "HTTP 200 (SSE streaming)",
                    Style::default().fg(Color::Green),
                ));
                if !entry.response_model.is_empty() {
                    logical_lines.push(RenderedLine::styled(
                        &format!(
                            "Input tokens: {}, Output tokens: {}",
                            entry.response_input_tokens, entry.response_output_tokens
                        ),
                        Style::default().fg(Color::White),
                    ));
                }
                logical_lines.push(RenderedLine::styled(
                    &format!("Duration: {}", duration_str),
                    Style::default().fg(Color::White),
                ));
                logical_lines.push(RenderedLine::plain(""));

                for chunk in &entry.response_chunks {
                    if let Ok(val) = serde_json::from_str::<serde_json::Value>(chunk) {
                        let event_type = val
                            .get("type")
                            .and_then(|t| t.as_str())
                            .unwrap_or("unknown");
                        logical_lines.push(RenderedLine::styled(
                            &format!("▸ {}", event_type),
                            Style::default()
                                .fg(Color::Cyan)
                                .add_modifier(Modifier::BOLD),
                        ));
                        let pretty = serde_json::to_string_pretty(&val).unwrap_or_default();
                        let md_code = format!("```json\n{}\n```", pretty);
                        logical_lines.extend(markdown::render_markdown(&md_code));
                    } else {
                        logical_lines.push(RenderedLine::styled(
                            "▸ (raw)",
                            Style::default()
                                .fg(Color::Yellow)
                                .add_modifier(Modifier::BOLD),
                        ));
                        for line in chunk.lines() {
                            logical_lines.push(RenderedLine::styled(
                                line,
                                Style::default().fg(Color::White),
                            ));
                        }
                    }
                    logical_lines.push(RenderedLine::plain(""));
                }

                logical_lines.push(RenderedLine::styled(
                    "────────────────────────────────────────────────────────────",
                    Style::default().fg(Color::DarkGray),
                ));
                logical_lines.push(RenderedLine::plain(""));
            }
        }

        let w = if self.wrap_width > 0 {
            self.wrap_width
        } else {
            usize::MAX
        };
        self.requests_lines.clear();
        for logical in &logical_lines {
            for wrapped in logical.wrap(w) {
                self.requests_lines.push(wrapped);
            }
        }
    }

    /// Generate a crash dump string with all relevant App state.
    /// Used by the panic hook to write a human-readable state snapshot.
    pub(crate) fn crash_dump(&self) -> String {
        use std::fmt::Write;
        let mut out = String::new();

        let _ = writeln!(out, "=== App State (Sizes) ===");
        let _ = writeln!(out, "display_blocks.len():        {}", self.display_blocks.len());
        let _ = writeln!(out, "rendered_lines.len():        {}", self.rendered_lines.len());
        let _ = writeln!(out, "streaming_buffer.len():      {} bytes", self.streaming_buffer.len());
        let _ = writeln!(out, "streaming_buffer.lines():    {}", self.streaming_buffer.lines().count());
        let _ = writeln!(out, "input.len():                 {} bytes", self.input.len());
        let _ = writeln!(out, "prompt_history.len():        {}", self.prompt_history.len());
        let _ = writeln!(out, "requests_log.len():          {}", self.requests_log.len());
        if let Some(last) = self.requests_log.back() {
            let _ = writeln!(out, "  last.response_chunks.len(): {}", last.response_chunks.len());
        }
        let _ = writeln!(out, "sys_prompt_lines.len():      {}", self.sys_prompt_lines.len());
        let _ = writeln!(out, "sys_prompt_blocks.len():     {}", self.system_prompt_blocks.len());
        let _ = writeln!(out, "requests_lines.len():        {}", self.requests_lines.len());

        let _ = writeln!(out);
        let _ = writeln!(out, "=== Counters ===");
        let _ = writeln!(out, "turn_count:          {}", self.turn_count);
        let _ = writeln!(out, "api_request_count:   {}", self.api_request_count);
        let _ = writeln!(out, "stream_chunks:       {}", self.stream_chunks);
        let _ = writeln!(out, "total_input_tokens:  {}", self.total_input_tokens);
        let _ = writeln!(out, "total_output_tokens: {}", self.total_output_tokens);
        let _ = writeln!(out, "turn_input_tokens:   {}", self.turn_input_tokens);
        let _ = writeln!(out, "turn_output_tokens:  {}", self.turn_output_tokens);

        let _ = writeln!(out);
        let _ = writeln!(out, "=== Flags ===");
        let _ = writeln!(out, "is_loading:          {}", self.is_loading);
        let _ = writeln!(out, "auto_scroll:         {}", self.auto_scroll);
        let _ = writeln!(out, "lines_dirty:         {}", self.lines_dirty);
        let _ = writeln!(out, "requests_dirty:      {}", self.requests_dirty);
        let _ = writeln!(out, "should_quit:         {}", self.should_quit);
        let _ = writeln!(out, "scroll:              {}", self.scroll);
        let _ = writeln!(out, "wrap_width:           {}", self.wrap_width);
        let _ = writeln!(out, "active_tab:          {}", self.active_tab);
        let _ = writeln!(out, "focus:               {:?}", self.focus);
        let _ = writeln!(out, "cursor:              {}", self.cursor);
        let _ = writeln!(out, "history_index:       {:?}", self.history_index);
        let _ = writeln!(out, "spinner_frame:       {}", self.spinner_frame);
        let _ = writeln!(out, "pending_permission:  {}", self.pending_permission.is_some());
        let _ = writeln!(out, "model:               {}", self.model);

        let _ = writeln!(out);
        let _ = writeln!(out, "=== Last Content ===");

        // Streaming buffer (last 500 bytes)
        if !self.streaming_buffer.is_empty() {
            let buf = &self.streaming_buffer;
            let tail = if buf.len() > 500 {
                // Find char boundary at or after (len - 500) to avoid slicing
                // inside a multi-byte UTF-8 character.
                let mut start = buf.len() - 500;
                while start < buf.len() && !buf.is_char_boundary(start) {
                    start += 1;
                }
                &buf[start..]
            } else {
                buf
            };
            let _ = writeln!(out, "streaming_buffer (last {} bytes):", tail.len());
            let _ = writeln!(out, "---");
            let _ = writeln!(out, "{tail}");
            let _ = writeln!(out, "---");
        } else {
            let _ = writeln!(out, "streaming_buffer: (empty)");
        }

        // Last display block
        if let Some(last) = self.display_blocks.last() {
            let _ = writeln!(out, "last display_block: {:?}", std::mem::discriminant(last));
            match last {
                DisplayBlock::AssistantText(t) => {
                    let _ = writeln!(out, "  len={}", t.len());
                    let tail = if t.len() > 200 { &t[t.len()-200..] } else { t };
                    let _ = writeln!(out, "  tail: {tail}");
                }
                DisplayBlock::UserMessage(t) => {
                    let _ = writeln!(out, "  text: {t}");
                }
                DisplayBlock::Error(e) => {
                    let _ = writeln!(out, "  error: {e}");
                }
                DisplayBlock::BashOutput { command, raw_output } => {
                    let _ = writeln!(out, "  command: {command}");
                    let _ = writeln!(out, "  output.len: {} bytes", raw_output.len());
                }
                _ => {
                    let _ = writeln!(out, "  {:?}", last);
                }
            }
        }

        // Display block type histogram
        let _ = writeln!(out);
        let _ = writeln!(out, "=== Display Block Histogram ===");
        let mut counts = std::collections::HashMap::<&str, usize>::new();
        for block in &self.display_blocks {
            let name = match block {
                DisplayBlock::Timestamp(_) => "Timestamp",
                DisplayBlock::UserMessage(_) => "UserMessage",
                DisplayBlock::AssistantText(_) => "AssistantText",
                DisplayBlock::Thinking(_) => "Thinking",
                DisplayBlock::ToolCall { .. } => "ToolCall",
                DisplayBlock::ToolResult { .. } => "ToolResult",
                DisplayBlock::Error(_) => "Error",
                DisplayBlock::SystemMessage(_) => "SystemMessage",
                DisplayBlock::BashOutput { .. } => "BashOutput",
            };
            *counts.entry(name).or_insert(0) += 1;
        }
        let mut sorted: Vec<_> = counts.into_iter().collect();
        sorted.sort_by(|a, b| b.1.cmp(&a.1));
        for (name, count) in sorted {
            let _ = writeln!(out, "  {name}: {count}");
        }

        out
    }
}
