//! Application state and logic.

use ratatui::style::{Color, Modifier, Style};
use std::collections::VecDeque;
use std::time::{Duration, Instant};

use ansi_to_tui::IntoText;
use chlodwig_core::SystemBlock;

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
