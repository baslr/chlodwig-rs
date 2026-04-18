//! Application state and logic.

use ratatui::style::{Color, Modifier, Style};
use std::collections::VecDeque;
use std::time::{Duration, Instant};

use ansi_to_tui::IntoText;
use chlodwig_core::{InputState, Message, SystemBlock};
use unicode_width::UnicodeWidthChar;

use crate::markdown;
use crate::rendered_line::RenderedLine;
use crate::types::*;

// ── Editable constants: helpers ─────────────────────────────────

/// Format a u64 with underscore thousand separators (e.g. `1_048_576`).
pub(crate) fn format_with_underscores(n: u64) -> String {
    let s = n.to_string();
    if s.len() <= 3 {
        return s;
    }
    let mut result = String::with_capacity(s.len() + s.len() / 3);
    for (i, ch) in s.chars().enumerate() {
        if i > 0 && (s.len() - i) % 3 == 0 {
            result.push('_');
        }
        result.push(ch);
    }
    result
}

/// Parse a string that may contain a numeric value with an optional byte-size
/// unit suffix (B, KB, KiB, MB, MiB, GB, GiB, TB, TiB).
///
/// Supports:
/// - Plain integers: `"42"`, `"1000"`
/// - Underscore/comma separators: `"1_000"`, `"1,000"`
/// - Fractional values with units: `"1.5 MiB"`, `"0.5 KB"`
/// - Case-insensitive units: `"1 mib"`, `"100 kb"`
/// - Optional space between number and unit: `"1MiB"`, `"1 MiB"`
///
/// Returns `None` if the string cannot be parsed.
pub(crate) fn parse_value_with_units(input: &str) -> Option<u64> {
    let s = input.trim().replace('_', "").replace(',', "");
    if s.is_empty() {
        return None;
    }

    // Find where the numeric part ends and the unit begins.
    // Numeric part: digits and '.'
    let num_end = s
        .find(|c: char| !c.is_ascii_digit() && c != '.')
        .unwrap_or(s.len());

    let num_str = s[..num_end].trim();
    let unit_str = s[num_end..].trim();

    if num_str.is_empty() {
        return None;
    }

    let multiplier: u64 = match unit_str.to_lowercase().as_str() {
        "" => 0, // sentinel: plain number, no multiplier
        "b" => 1,
        "k" => 1_000,
        "kb" => 1_000,
        "kib" => 1_024,
        "m" => 1_000_000,
        "mb" => 1_000_000,
        "mib" => 1_048_576,
        "g" => 1_000_000_000,
        "gb" => 1_000_000_000,
        "gib" => 1_073_741_824,
        "t" => 1_000_000_000_000,
        "tb" => 1_000_000_000_000,
        "tib" => 1_099_511_627_776,
        _ => return None,
    };

    if multiplier == 0 {
        // Plain number — try integer first, then float truncated
        if let Ok(v) = num_str.parse::<u64>() {
            return Some(v);
        }
        // Might be float like "1.5" without unit — just truncate
        if let Ok(v) = num_str.parse::<f64>() {
            return Some(v as u64);
        }
        return None;
    }

    // Has a unit — parse as f64 to support fractional values like "1.5 MiB"
    if let Ok(v) = num_str.parse::<f64>() {
        Some((v * multiplier as f64) as u64)
    } else {
        None
    }
}

// ── Editable constants configuration ─────────────────────────────

/// Holds all editable constants with their current values.
/// Each field mirrors a `const` from the various crates.
/// The user can edit these in the Constants tab at runtime.
#[derive(Debug, Clone)]
pub(crate) struct ConstantsConfig {
    // chlodwig-core / conversation
    pub(crate) auto_compact_threshold: u64,
    pub(crate) max_retries: u32,
    // chlodwig-core / subagent
    pub(crate) subagent_max_turns: u32,
    pub(crate) subagent_max_tokens: u32,
    // chlodwig-tools / websearch
    pub(crate) default_max_results: usize,
    pub(crate) absolute_max_results: usize,
    pub(crate) search_timeout_secs: u64,
    // chlodwig-tools / webfetch
    pub(crate) default_max_size: usize,
    pub(crate) absolute_max_size: usize,
    // chlodwig-tools / glob
    pub(crate) max_glob_results: usize,
    // chlodwig-tools / grep
    pub(crate) default_head_limit: usize,
    // chlodwig-tui / app
    pub(crate) input_max_visual_lines: usize,
    // UI state for the Constants tab editor
    pub(crate) selected_field: usize,
    pub(crate) is_editing: bool,
    pub(crate) edit_buffer: String,
}

impl Default for ConstantsConfig {
    fn default() -> Self {
        Self {
            auto_compact_threshold: 160_000,
            max_retries: 3,
            subagent_max_turns: 1000,
            subagent_max_tokens: 16_384,
            default_max_results: 10,
            absolute_max_results: 20,
            search_timeout_secs: 15,
            default_max_size: 100_000,
            absolute_max_size: 1_000_000,
            max_glob_results: 100,
            default_head_limit: 250,
            input_max_visual_lines: 10,
            selected_field: 0,
            is_editing: false,
            edit_buffer: String::new(),
        }
    }
}

/// Metadata for a single editable constant field.
pub(crate) struct ConstantFieldMeta {
    pub(crate) name: &'static str,
    pub(crate) description: &'static str,
    pub(crate) crate_name: &'static str,
}

impl ConstantsConfig {
    /// Total number of selectable items: fields + reset button.
    pub(crate) fn field_count(&self) -> usize {
        Self::FIELD_METAS.len() + 1 // +1 for reset button
    }

    /// Whether the reset button is currently selected.
    pub(crate) fn is_reset_button_selected(&self) -> bool {
        self.selected_field == Self::FIELD_METAS.len()
    }

    /// Move selection to next field.
    pub(crate) fn select_next(&mut self) {
        let max = self.field_count() - 1;
        if self.selected_field < max {
            self.selected_field += 1;
        }
    }

    /// Move selection to previous field.
    pub(crate) fn select_prev(&mut self) {
        if self.selected_field > 0 {
            self.selected_field -= 1;
        }
    }

    /// Start editing the currently selected field.
    /// Populates the edit buffer with the current value.
    pub(crate) fn start_editing(&mut self) {
        if self.is_reset_button_selected() {
            return;
        }
        self.is_editing = true;
        self.edit_buffer = self.get_field_value_string(self.selected_field);
    }

    /// Cancel editing without applying changes.
    pub(crate) fn cancel_edit(&mut self) {
        self.is_editing = false;
        self.edit_buffer.clear();
    }

    /// Apply the current edit buffer to the selected field.
    /// Returns `true` if the value was valid and applied.
    ///
    /// Supports plain numbers, underscore/comma separators, and byte-size
    /// unit suffixes (KB, KiB, MB, MiB, GB, GiB, TB, TiB, B).
    pub(crate) fn apply_edit(&mut self) -> bool {
        let idx = self.selected_field;
        if idx >= Self::FIELD_METAS.len() {
            self.is_editing = false;
            return false;
        }
        // Try unit-aware parsing first, fall back to plain number
        let ok = if let Some(v) = parse_value_with_units(&self.edit_buffer) {
            self.set_field_from_string(idx, &v.to_string())
        } else {
            false
        };
        if ok {
            self.is_editing = false;
            self.edit_buffer.clear();
        }
        ok
    }

    /// Reset all values to their compile-time defaults.
    pub(crate) fn reset_to_defaults(&mut self) {
        let defaults = Self::default();
        self.auto_compact_threshold = defaults.auto_compact_threshold;
        self.max_retries = defaults.max_retries;
        self.subagent_max_turns = defaults.subagent_max_turns;
        self.subagent_max_tokens = defaults.subagent_max_tokens;
        self.default_max_results = defaults.default_max_results;
        self.absolute_max_results = defaults.absolute_max_results;
        self.search_timeout_secs = defaults.search_timeout_secs;
        self.default_max_size = defaults.default_max_size;
        self.absolute_max_size = defaults.absolute_max_size;
        self.max_glob_results = defaults.max_glob_results;
        self.default_head_limit = defaults.default_head_limit;
        self.input_max_visual_lines = defaults.input_max_visual_lines;
    }

    /// Create a serialisable snapshot of the current constant values.
    pub(crate) fn to_snapshot(&self) -> chlodwig_core::ConstantsSnapshot {
        chlodwig_core::ConstantsSnapshot {
            auto_compact_threshold: self.auto_compact_threshold,
            max_retries: self.max_retries,
            subagent_max_turns: self.subagent_max_turns,
            subagent_max_tokens: self.subagent_max_tokens,
            default_max_results: self.default_max_results,
            absolute_max_results: self.absolute_max_results,
            search_timeout_secs: self.search_timeout_secs,
            default_max_size: self.default_max_size,
            absolute_max_size: self.absolute_max_size,
            max_glob_results: self.max_glob_results,
            default_head_limit: self.default_head_limit,
            input_max_visual_lines: self.input_max_visual_lines,
        }
    }

    /// Restore constant values from a snapshot.
    /// UI state (selected_field, is_editing, edit_buffer) is NOT touched.
    pub(crate) fn from_snapshot(&mut self, snap: &chlodwig_core::ConstantsSnapshot) {
        self.auto_compact_threshold = snap.auto_compact_threshold;
        self.max_retries = snap.max_retries;
        self.subagent_max_turns = snap.subagent_max_turns;
        self.subagent_max_tokens = snap.subagent_max_tokens;
        self.default_max_results = snap.default_max_results;
        self.absolute_max_results = snap.absolute_max_results;
        self.search_timeout_secs = snap.search_timeout_secs;
        self.default_max_size = snap.default_max_size;
        self.absolute_max_size = snap.absolute_max_size;
        self.max_glob_results = snap.max_glob_results;
        self.default_head_limit = snap.default_head_limit;
        self.input_max_visual_lines = snap.input_max_visual_lines;
    }

    /// Metadata for all editable fields (order matters — matches field indices).
    pub(crate) const FIELD_METAS: &'static [ConstantFieldMeta] = &[
        ConstantFieldMeta {
            name: "auto_compact_threshold",
            description: "Token threshold for auto-compaction",
            crate_name: "chlodwig-core",
        },
        ConstantFieldMeta {
            name: "max_retries",
            description: "Max API retry attempts",
            crate_name: "chlodwig-core",
        },
        ConstantFieldMeta {
            name: "subagent_max_turns",
            description: "Max turns for subagent",
            crate_name: "chlodwig-core",
        },
        ConstantFieldMeta {
            name: "subagent_max_tokens",
            description: "Max tokens per subagent response",
            crate_name: "chlodwig-core",
        },
        ConstantFieldMeta {
            name: "default_max_results",
            description: "Default max web search results",
            crate_name: "chlodwig-tools",
        },
        ConstantFieldMeta {
            name: "absolute_max_results",
            description: "Absolute max web search results",
            crate_name: "chlodwig-tools",
        },
        ConstantFieldMeta {
            name: "search_timeout_secs",
            description: "Web search timeout (seconds)",
            crate_name: "chlodwig-tools",
        },
        ConstantFieldMeta {
            name: "default_max_size",
            description: "Default max fetch size (bytes)",
            crate_name: "chlodwig-tools",
        },
        ConstantFieldMeta {
            name: "absolute_max_size",
            description: "Absolute max fetch size (bytes)",
            crate_name: "chlodwig-tools",
        },
        ConstantFieldMeta {
            name: "max_glob_results",
            description: "Max glob results",
            crate_name: "chlodwig-tools",
        },
        ConstantFieldMeta {
            name: "default_head_limit",
            description: "Default grep head limit (lines)",
            crate_name: "chlodwig-tools",
        },
        ConstantFieldMeta {
            name: "input_max_visual_lines",
            description: "Max visual lines in input area",
            crate_name: "chlodwig-tui",
        },
    ];

    /// Get the current value of field at `idx` as a string (raw, no formatting).
    /// Used for populating the edit buffer.
    fn get_field_value_string(&self, idx: usize) -> String {
        match idx {
            0 => self.auto_compact_threshold.to_string(),
            1 => self.max_retries.to_string(),
            2 => self.subagent_max_turns.to_string(),
            3 => self.subagent_max_tokens.to_string(),
            4 => self.default_max_results.to_string(),
            5 => self.absolute_max_results.to_string(),
            6 => self.search_timeout_secs.to_string(),
            7 => self.default_max_size.to_string(),
            8 => self.absolute_max_size.to_string(),
            9 => self.max_glob_results.to_string(),
            10 => self.default_head_limit.to_string(),
            11 => self.input_max_visual_lines.to_string(),
            _ => String::new(),
        }
    }

    /// Get the current value of field at `idx` formatted with underscore separators.
    /// Used for display in the Constants tab.
    pub(crate) fn get_field_display_string(&self, idx: usize) -> String {
        match idx {
            0 => format_with_underscores(self.auto_compact_threshold),
            1 => format_with_underscores(self.max_retries as u64),
            2 => format_with_underscores(self.subagent_max_turns as u64),
            3 => format_with_underscores(self.subagent_max_tokens as u64),
            4 => format_with_underscores(self.default_max_results as u64),
            5 => format_with_underscores(self.absolute_max_results as u64),
            6 => format_with_underscores(self.search_timeout_secs),
            7 => format_with_underscores(self.default_max_size as u64),
            8 => format_with_underscores(self.absolute_max_size as u64),
            9 => format_with_underscores(self.max_glob_results as u64),
            10 => format_with_underscores(self.default_head_limit as u64),
            11 => format_with_underscores(self.input_max_visual_lines as u64),
            _ => String::new(),
        }
    }

    /// Set the value of field at `idx` from a string. Returns true on success.
    fn set_field_from_string(&mut self, idx: usize, s: &str) -> bool {
        match idx {
            0 => s.parse::<u64>().map(|v| self.auto_compact_threshold = v).is_ok(),
            1 => s.parse::<u32>().map(|v| self.max_retries = v).is_ok(),
            2 => s.parse::<u32>().map(|v| self.subagent_max_turns = v).is_ok(),
            3 => s.parse::<u32>().map(|v| self.subagent_max_tokens = v).is_ok(),
            4 => s.parse::<usize>().map(|v| self.default_max_results = v).is_ok(),
            5 => s.parse::<usize>().map(|v| self.absolute_max_results = v).is_ok(),
            6 => s.parse::<u64>().map(|v| self.search_timeout_secs = v).is_ok(),
            7 => s.parse::<usize>().map(|v| self.default_max_size = v).is_ok(),
            8 => s.parse::<usize>().map(|v| self.absolute_max_size = v).is_ok(),
            9 => s.parse::<usize>().map(|v| self.max_glob_results = v).is_ok(),
            10 => s.parse::<usize>().map(|v| self.default_head_limit = v).is_ok(),
            11 => s.parse::<usize>().map(|v| self.input_max_visual_lines = v).is_ok(),
            _ => false,
        }
    }

    /// Get the default value string for field at `idx` (raw, no formatting).
    pub(crate) fn get_default_value_string(idx: usize) -> String {
        let d = Self::default();
        d.get_field_value_string(idx)
    }

    /// Get the default value string for field at `idx` formatted with underscores.
    pub(crate) fn get_default_display_string(idx: usize) -> String {
        let d = Self::default();
        d.get_field_display_string(idx)
    }
}

pub(crate) struct App {
    pub(crate) display_blocks: Vec<DisplayBlock>,
    pub(crate) input: InputState,
    pub(crate) scroll: usize,
    pub(crate) auto_scroll: chlodwig_core::AutoScroll,
    pub(crate) is_loading: bool,
    pub(crate) streaming_buffer: String,
    /// Timestamp shown above the streaming text, set on first TextDelta.
    /// Prevents the text from "jumping" down when finalize inserts the
    /// permanent Timestamp DisplayBlock.
    pub(crate) streaming_timestamp: Option<String>,
    pub(crate) pending_permission: Option<PendingPermission>,
    pub(crate) pending_user_question: Option<PendingUserQuestion>,
    pub(crate) should_quit: bool,
    // Token usage tracking
    pub(crate) total_input_tokens: u64,
    pub(crate) total_output_tokens: u64,
    pub(crate) turn_usage: chlodwig_core::TurnUsage,
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
    // Constants tab
    pub(crate) constants: ConstantsConfig,               // Editable constants
    pub(crate) constants_lines: Vec<RenderedLine>,       // Pre-rendered constants tab lines
    pub(crate) constants_scroll: usize,                  // Scroll position in constants tab
    // Git tab
    pub(crate) git_branch: String,                       // Current git branch name (empty if not in a repo)
    pub(crate) git_status_output: String,                // Raw `git status` output
    pub(crate) git_lines: Vec<RenderedLine>,             // Pre-rendered git tab lines
    pub(crate) git_scroll: usize,                        // Scroll position in git tab
    /// Optional human-readable session name set via `/name`.
    pub(crate) session_name: Option<String>,
}

impl App {
    pub(crate) fn new(model: String) -> Self {
        let mut app = Self {
            display_blocks: Vec::new(),
            input: InputState::new(),
            scroll: 0,
            auto_scroll: chlodwig_core::AutoScroll::new(),
            is_loading: false,
            streaming_buffer: String::new(),
            streaming_timestamp: None,
            pending_permission: None,
            pending_user_question: None,
            should_quit: false,
            total_input_tokens: 0,
            total_output_tokens: 0,
            turn_usage: chlodwig_core::TurnUsage::default(),
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
            constants: ConstantsConfig::default(),
            constants_lines: Vec::new(),
            constants_scroll: 0,
            git_branch: String::new(),
            git_status_output: String::new(),
            git_lines: Vec::new(),
            git_scroll: 0,
            session_name: None,
        };
        app.refresh_git_branch();
        app
    }

    /// Generate startup display blocks that show the current working directory.
    /// Returns a `SystemMessage` with the project path label, followed by a
    /// `BashOutput` with an actual `pwd` execution so the user sees the full
    /// resolved path (symlinks, etc.).
    pub(crate) fn startup_project_dir_blocks() -> Vec<DisplayBlock> {
        let cwd = std::env::current_dir()
            .map(|p| p.display().to_string())
            .unwrap_or_else(|_| "unknown".to_string());

        let mut blocks = Vec::new();

        // 1. System message with directory label
        blocks.push(DisplayBlock::SystemMessage(format!("cwd: {cwd}")));

        // 2. Execute `pwd` and show as BashOutput
        let pwd_output = std::process::Command::new("pwd")
            .output()
            .map(|out| String::from_utf8_lossy(&out.stdout).into_owned())
            .unwrap_or_else(|e| format!("Error: {e}"));

        blocks.push(DisplayBlock::BashOutput {
            command: "pwd".to_string(),
            raw_output: pwd_output,
        });

        blocks
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
        self.turn_usage.context_window_size()
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
        self.streaming_timestamp = None;
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
        self.turn_usage.reset();
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
        let w = if self.wrap_width > 0 { self.wrap_width } else { usize::MAX };

        for block in &self.display_blocks {
            match block {
                DisplayBlock::Timestamp(ts) => {
                    logical_lines.push(RenderedLine::styled(
                        ts,
                        Style::default().fg(Color::DarkGray),
                    ));
                }
                DisplayBlock::UserMessage(text) => {
                    let prefix_style = Style::default()
                        .fg(Color::Green)
                        .add_modifier(Modifier::BOLD);
                    let text_style = Style::default();
                    // "You: " is 5 chars — indent continuation lines to align
                    let indent = "     ";
                    let mut first = true;
                    for line in text.split('\n') {
                        if first {
                            logical_lines.push(RenderedLine::multi(vec![
                                ("You: ", prefix_style),
                                (line, text_style),
                            ]));
                            first = false;
                        } else {
                            logical_lines.push(RenderedLine::multi(vec![
                                (indent, prefix_style),
                                (line, text_style),
                            ]));
                        }
                    }
                    logical_lines.push(RenderedLine::plain(""));
                }
                DisplayBlock::AssistantText(text) => {
                    tracing::debug!(
                        text_len = text.len(),
                        text_lines = text.lines().count(),
                        "rebuild_lines: rendering AssistantText as markdown"
                    );
                    logical_lines.extend(markdown::render_markdown_with_width(text, w));
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
                    let style = Style::default()
                        .fg(Color::Cyan)
                        .add_modifier(Modifier::ITALIC);
                    for (i, line) in text.lines().enumerate() {
                        if i == 0 {
                            logical_lines.push(RenderedLine::styled(
                                &format!("⟫ {line}"),
                                style,
                            ));
                        } else {
                            logical_lines.push(RenderedLine::styled(
                                &format!("  {line}"),
                                style,
                            ));
                        }
                    }
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
                DisplayBlock::EditDiff { file_path, diff_lines, lang } => {
                    // Header with file path
                    logical_lines.push(RenderedLine::styled(
                        &format!("── Edit: {file_path} ──"),
                        Style::default().fg(Color::Yellow),
                    ));

                    // Max line number width for alignment
                    let max_line_num = diff_lines.iter()
                        .map(|dl| dl.line_num)
                        .max()
                        .unwrap_or(0);
                    let num_width = if max_line_num == 0 { 1 } else {
                        (max_line_num as f64).log10().floor() as usize + 1
                    };

                    for dl in diff_lines {
                        let (marker, marker_color) = match dl.kind {
                            DiffKind::Removal  => ("-", Color::Red),
                            DiffKind::Addition => ("+", Color::Green),
                            DiffKind::Context  => (" ", Color::DarkGray),
                        };

                        // Build the gutter: " {line_num} │{marker} "
                        let gutter = format!(
                            " {:>width$} │{marker} ",
                            dl.line_num,
                            width = num_width,
                        );

                        // Syntax-highlight the code portion
                        let highlighted = markdown::highlight_code(lang, &dl.text);
                        // highlight_code returns at least one RenderedLine
                        let code_spans = if let Some(rl) = highlighted.first() {
                            rl.spans.clone()
                        } else {
                            vec![(dl.text.clone(), Style::default())]
                        };

                        // Combine gutter + code spans into one RenderedLine
                        let mut spans = Vec::with_capacity(1 + code_spans.len());
                        spans.push((gutter, Style::default().fg(marker_color)));
                        // For removal/addition, tint the code background
                        let bg_tint = match dl.kind {
                            DiffKind::Removal  => Some(Color::Rgb(60, 20, 20)),
                            DiffKind::Addition => Some(Color::Rgb(20, 50, 20)),
                            DiffKind::Context  => None,
                        };
                        for (text, mut style) in code_spans {
                            // Remove CODE_BG from syntax-highlighting; diff uses
                            // its own tint (or no bg for context lines).
                            style.bg = None;
                            if let Some(bg) = bg_tint {
                                style = style.bg(bg);
                            }
                            spans.push((text, style));
                        }

                        logical_lines.push(RenderedLine { spans, wrap_prefix: None });
                    }
                    logical_lines.push(RenderedLine::plain(""));
                }
                DisplayBlock::ReadOutput { file_path, content } => {
                    // Header line with file path
                    logical_lines.push(RenderedLine::styled(
                        &format!("── Read: {file_path} ──"),
                        Style::default().fg(Color::Green),
                    ));

                    // Determine language from file extension for syntax highlighting
                    let lang = markdown::lang_from_path(file_path);

                    // Use the shared format_numbered_lines() for aligned gutters,
                    // then syntax-highlight the code portion.
                    let formatted = chlodwig_core::format_numbered_lines(content);
                    for (gutter, code_text) in &formatted {
                        if !gutter.is_empty() {
                            // Syntax-highlight the code portion
                            let highlighted = markdown::highlight_code(lang, code_text);
                            let code_spans = if let Some(rl) = highlighted.first() {
                                rl.spans.clone()
                            } else {
                                vec![(code_text.to_string(), Style::default())]
                            };

                            let mut spans = Vec::with_capacity(1 + code_spans.len());
                            spans.push((gutter.clone(), Style::default().fg(Color::DarkGray)));
                            for (text, mut style) in code_spans {
                                // Remove CODE_BG — we use the terminal default bg
                                style.bg = None;
                                spans.push((text, style));
                            }
                            logical_lines.push(RenderedLine { spans, wrap_prefix: None });
                        } else {
                            // Lines without tab (e.g. "(empty file)", "(no lines in range)")
                            logical_lines.push(RenderedLine::styled(
                                &format!("  {code_text}"),
                                Style::default().fg(Color::DarkGray),
                            ));
                        }
                    }
                    logical_lines.push(RenderedLine::plain(""));
                }
                DisplayBlock::WriteOutput { file_path, content, summary } => {
                    // Header line with file path
                    logical_lines.push(RenderedLine::styled(
                        &format!("── Write: {file_path} ──"),
                        Style::default().fg(Color::Magenta),
                    ));

                    // Summary line (e.g. "Wrote 13 lines (298 bytes) to ...")
                    logical_lines.push(RenderedLine::styled(
                        &format!("  {summary}"),
                        Style::default().fg(Color::DarkGray),
                    ));

                    // Determine language from file extension for syntax highlighting
                    let lang = markdown::lang_from_path(file_path);

                    // Render each line with line numbers + syntax highlighting
                    let line_count = content.lines().count();
                    let num_width = if line_count == 0 { 1 } else {
                        (line_count as f64).log10().floor() as usize + 1
                    };

                    for (i, code_line) in content.lines().enumerate() {
                        let line_num = i + 1;

                        // Syntax-highlight the code portion
                        let highlighted = markdown::highlight_code(lang, code_line);
                        let code_spans = if let Some(rl) = highlighted.first() {
                            rl.spans.clone()
                        } else {
                            vec![(code_line.to_string(), Style::default())]
                        };

                        // Build: " {num} │ {highlighted_code}"
                        let gutter = format!(
                            " {:>width$} │ ",
                            line_num,
                            width = num_width,
                        );
                        let mut spans = Vec::with_capacity(1 + code_spans.len());
                        spans.push((gutter, Style::default().fg(Color::DarkGray)));
                        for (text, mut style) in code_spans {
                            // Remove CODE_BG — we use the terminal default bg
                            style.bg = None;
                            spans.push((text, style));
                        }
                        logical_lines.push(RenderedLine { spans, wrap_prefix: None });
                    }
                    logical_lines.push(RenderedLine::plain(""));
                }
                DisplayBlock::GrepOutput { content, output_mode } => {
                    // Header
                    logical_lines.push(RenderedLine::styled(
                        "── Grep ──",
                        Style::default().fg(Color::Blue),
                    ));

                    if output_mode == "content" {
                        // Content mode: lines are "file:line:code" or "file-line-context"
                        for line in content.lines() {
                            // Separator between context groups
                            if line == "--" {
                                logical_lines.push(RenderedLine::styled(
                                    "  ──",
                                    Style::default().fg(Color::DarkGray),
                                ));
                                continue;
                            }

                            // Try to parse "file:line:code" (match) or "file-line-code" (context)
                            if let Some((file, line_num, code, is_match)) = parse_grep_content_line(line) {
                                let lang = markdown::lang_from_path(file);

                                // Syntax-highlight the code portion
                                let highlighted = markdown::highlight_code(lang, code);
                                let code_spans = if let Some(rl) = highlighted.first() {
                                    rl.spans.clone()
                                } else {
                                    vec![(code.to_string(), Style::default())]
                                };

                                // Build: " file:line │ code" or " file-line │ code"
                                let sep = if is_match { ':' } else { '-' };
                                let gutter = format!("  {file}{sep}{line_num} │ ");
                                let gutter_style = if is_match {
                                    Style::default().fg(Color::Green)
                                } else {
                                    Style::default().fg(Color::DarkGray)
                                };
                                let mut spans = Vec::with_capacity(1 + code_spans.len());
                                spans.push((gutter, gutter_style));
                                for (text, mut style) in code_spans {
                                    style.bg = None;
                                    if !is_match {
                                        // Dim context lines
                                        style = Style::default().fg(Color::DarkGray);
                                    }
                                    spans.push((text, style));
                                }
                                logical_lines.push(RenderedLine { spans, wrap_prefix: None });
                            } else {
                                // Not parseable as grep output — render as-is
                                logical_lines.push(RenderedLine::styled(
                                    &format!("  {line}"),
                                    Style::default().fg(Color::White),
                                ));
                            }
                        }
                    } else {
                        // files_with_matches or count mode — render as plain colored lines
                        for line in content.lines() {
                            logical_lines.push(RenderedLine::styled(
                                &format!("  {line}"),
                                Style::default().fg(Color::Cyan),
                            ));
                        }
                    }
                    logical_lines.push(RenderedLine::plain(""));
                }
            }
        }

        // Streaming timestamp — show immediately above streaming text
        if let Some(ref ts) = self.streaming_timestamp {
            logical_lines.push(RenderedLine::styled(
                ts,
                Style::default().fg(Color::DarkGray),
            ));
        }

        // Streaming buffer — render as markdown for live preview
        if !self.streaming_buffer.is_empty() {
            tracing::debug!(
                buf_len = self.streaming_buffer.len(),
                buf_lines = self.streaming_buffer.lines().count(),
                "rebuild_lines: rendering streaming buffer as markdown"
            );
            logical_lines.extend(markdown::render_markdown_with_width(&self.streaming_buffer, w));
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
        self.auto_scroll.scroll_to_bottom();
    }

    /// Scroll to bottom only if auto_scroll is already active.
    /// Use for incoming content (streaming, tool results, etc.) so that
    /// a user who has manually scrolled up is not yanked back to the bottom.
    pub(crate) fn scroll_to_bottom_if_auto(&mut self) {
        self.auto_scroll.scroll_to_bottom_if_auto();
    }

    // ── Streaming text (typewriter happens in conversation.rs, not here) ──

    /// Append text to the streaming buffer. Called when a TextDelta arrives.
    /// The typewriter char-by-char timing is handled in the streaming thread
    /// (conversation.rs), so by the time this method is called, the text is
    /// already paced correctly — just push it to the buffer and redraw.
    pub(crate) fn append_streaming_text(&mut self, text: &str) {
        if text.is_empty() {
            return;
        }
        // Set timestamp on first streaming text so it's visible immediately
        if self.streaming_timestamp.is_none() {
            self.streaming_timestamp = Some(
                chrono::Local::now().format("%d.%m.%Y  %H:%M:%S").to_string(),
            );
        }
        self.streaming_buffer.push_str(text);
        self.lines_dirty = true;
    }

    /// Finalize a TextComplete event: clear the streaming buffer and
    /// push a permanent DisplayBlock with the full assistant text.
    pub(crate) fn finalize_text_complete(&mut self, text: String) {
        self.streaming_buffer.clear();
        self.streaming_timestamp = None;
        let now = chrono::Local::now().format("%d.%m.%Y  %H:%M:%S").to_string();
        self.display_blocks.push(DisplayBlock::Timestamp(now));
        self.display_blocks.push(DisplayBlock::AssistantText(text));
        self.lines_dirty = true;
    }

    // ── Word-wise cursor movement (Option+Arrow / Alt+Arrow) ───────

    /// Move cursor one word to the left (Option+Left / Alt+Left).
    /// Behavior matches macOS text editors:
    /// 1. Skip any whitespace immediately before the cursor
    /// 2. Then skip all characters of the same category (word or punctuation)
    pub(crate) fn move_cursor_word_left(&mut self) {
        self.input.move_cursor_word_left();
    }

    /// Move cursor one word to the right (Option+Right / Alt+Right).
    /// Behavior matches macOS text editors:
    /// 1. Skip all characters of the same category (word or punctuation) forward
    /// 2. Then skip any whitespace
    pub(crate) fn move_cursor_word_right(&mut self) {
        self.input.move_cursor_word_right();
    }

    /// Delete the word before the cursor (Alt+Backspace / Option+Backspace).
    pub(crate) fn delete_word_back(&mut self) {
        self.input.delete_word_back();
    }

    /// Delete the single character right of the cursor (Delete key / fn+Backspace on macOS).
    /// No-op if the cursor is at the end of the input. Cursor position stays unchanged.
    pub(crate) fn delete_char_forward(&mut self) {
        self.input.delete_forward();
    }

    /// Delete the word after the cursor (Alt+Delete / fn+Option+Backspace on macOS).
    pub(crate) fn delete_word_forward(&mut self) {
        self.input.delete_word_forward();
    }

    /// Convert char-based cursor position to byte index in the input text.
    pub(crate) fn cursor_byte_pos(&self) -> usize {
        self.input.cursor_byte_pos()
    }

    /// Insert a newline character at the current cursor position (Shift+Enter).
    pub(crate) fn insert_newline(&mut self) {
        self.input.insert_newline();
    }

    /// Insert pasted text at the current cursor position.
    ///
    /// Newlines in the pasted text are preserved as `\n` (not treated as submit).
    /// Windows-style `\r\n` is normalized to `\n`.
    /// This is the handler for `Event::Paste` (bracketed paste mode).
    pub(crate) fn insert_paste(&mut self, text: &str) {
        self.input.insert_paste(text);
    }

    /// Number of chars in the input string.
    pub(crate) fn input_char_count(&self) -> usize {
        self.input.char_count()
    }

    /// Count the number of visual lines the input text occupies when rendered
    /// at the given `width` (in terminal columns). Accounts for both explicit
    /// newlines (`\n`) and soft-wrapping of long lines using ratatui-compatible
    /// word-wrapping (matching `Wrap { trim: false }`). Returns at least 1,
    /// capped at the editable `input_max_visual_lines` constant.
    pub(crate) fn input_visual_line_count(&self, width: usize) -> usize {
        if self.input.text.is_empty() || width == 0 {
            return 1;
        }
        let mut total_visual = 0usize;
        for logical_line in self.input.text.split('\n') {
            total_visual += Self::word_wrap_line_count(logical_line, width);
        }
        total_visual.max(1).min(self.constants.input_max_visual_lines)
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
        Self::word_wrap_cursor_pos(&self.input.text, self.input.cursor, width)
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

    // ── Vertical cursor movement (Up/Down in multiline input) ───────

    /// Move the cursor one visual line up, keeping the same display column
    /// where possible (clamps to end of line if target line is shorter).
    /// Returns `true` if the cursor actually moved, `false` if it was already
    /// on the first visual line (caller should fall through to history/scroll).
    pub(crate) fn move_cursor_up(&mut self, width: usize) -> bool {
        if width == 0 || self.input.text.is_empty() {
            return false;
        }
        let (cur_row, cur_col) = Self::word_wrap_cursor_pos(&self.input.text, self.input.cursor, width);
        if cur_row == 0 {
            return false; // already on first visual line
        }
        let target_row = cur_row - 1;
        self.input.cursor = Self::char_index_at_visual_pos(&self.input.text, target_row, cur_col, width);
        true
    }

    /// Move the cursor one visual line down, keeping the same display column
    /// where possible (clamps to end of line if target line is shorter).
    /// Returns `true` if the cursor actually moved, `false` if it was already
    /// on the last visual line (caller should fall through to history/tab bar).
    pub(crate) fn move_cursor_down(&mut self, width: usize) -> bool {
        if width == 0 || self.input.text.is_empty() {
            return false;
        }
        let (cur_row, cur_col) = Self::word_wrap_cursor_pos(&self.input.text, self.input.cursor, width);
        let total_visual_lines = self.input_total_visual_lines(width);
        if cur_row + 1 >= total_visual_lines {
            return false; // already on last visual line
        }
        let target_row = cur_row + 1;
        self.input.cursor = Self::char_index_at_visual_pos(&self.input.text, target_row, cur_col, width);
        true
    }

    /// Total number of visual lines in the input (uncapped — unlike
    /// `input_visual_line_count` which caps at `input_max_visual_lines`).
    fn input_total_visual_lines(&self, width: usize) -> usize {
        if self.input.text.is_empty() || width == 0 {
            return 1;
        }
        let mut total = 0usize;
        for logical_line in self.input.text.split('\n') {
            total += Self::word_wrap_line_count(logical_line, width);
        }
        total.max(1)
    }

    /// Find the char index in `input` that corresponds to the given visual
    /// `target_row` and `target_col` (display width). If `target_col` exceeds
    /// the width of the target row, clamps to the end of that row.
    ///
    /// This is the inverse of `word_wrap_cursor_pos`.
    fn char_index_at_visual_pos(
        input: &str,
        target_row: usize,
        target_col: usize,
        width: usize,
    ) -> usize {
        let mut global_row = 0usize;
        let mut char_offset = 0usize; // char index at start of current logical line

        for logical_line in input.split('\n') {
            let chars_in_line = logical_line.chars().count();
            let (visual_lines, _, _, _) =
                Self::word_wrap_line_with_cursor(logical_line, width, usize::MAX);

            if target_row < global_row + visual_lines {
                // Target row is within this logical line
                let local_row = target_row - global_row;
                let local_char = Self::char_index_in_wrapped_line(
                    logical_line, local_row, target_col, width,
                );
                return char_offset + local_char;
            }

            global_row += visual_lines;
            char_offset += chars_in_line + 1; // +1 for the '\n'
        }

        // Fallback: end of input
        input.chars().count()
    }

    /// Within a single logical line (no `\n`), find the char index that
    /// corresponds to visual `target_row` and `target_col` (display width)
    /// after word-wrapping at `width`.
    fn char_index_in_wrapped_line(
        line: &str,
        target_row: usize,
        target_col: usize,
        width: usize,
    ) -> usize {
        if line.is_empty() {
            return 0;
        }

        // Re-run the word-wrap algorithm to build wrapped lines,
        // then scan the target row for the char at the target column.
        let chars_vec: Vec<char> = line.chars().collect();
        let chars_with_width: Vec<(usize, usize)> = chars_vec
            .iter()
            .enumerate()
            .map(|(i, c)| (i, c.width().unwrap_or(0)))
            .collect();

        // Build wrapped lines using the same algorithm as word_wrap_line_with_cursor
        let mut wrapped_lines: Vec<Vec<(usize, usize)>> = Vec::new();
        let mut pending_line: Vec<(usize, usize)> = Vec::new();
        let mut pending_ws: Vec<(usize, usize)> = Vec::new();
        let mut pending_word: Vec<(usize, usize)> = Vec::new();
        let mut line_w: usize = 0;
        let mut ws_w: usize = 0;
        let mut word_w: usize = 0;
        let mut prev_non_ws = false;

        for &(ci, cw) in &chars_with_width {
            let ch = chars_vec[ci];
            let is_ws = ch.is_whitespace();

            let word_found = prev_non_ws && is_ws;
            let untrimmed_overflow =
                pending_line.is_empty() && (word_w + ws_w + cw) > width;

            if word_found || untrimmed_overflow {
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
                wrapped_lines.push(std::mem::take(&mut pending_line));
                let remaining = width.saturating_sub(line_w);
                line_w = 0;

                let mut rem = remaining;
                while let Some(&(_, ww)) = pending_ws.first() {
                    if ww > rem {
                        break;
                    }
                    ws_w -= ww;
                    rem -= ww;
                    pending_ws.remove(0);
                }

                if is_ws && pending_ws.is_empty() && pending_word.is_empty() {
                    prev_non_ws = false;
                    continue;
                }
            }

            if is_ws {
                ws_w += cw;
                pending_ws.push((ci, cw));
            } else {
                word_w += cw;
                pending_word.push((ci, cw));
            }

            prev_non_ws = !is_ws;
        }

        // Flush remaining
        pending_line.extend(pending_ws.drain(..));
        pending_line.extend(pending_word.drain(..));
        if !pending_line.is_empty() {
            wrapped_lines.push(pending_line);
        }
        if wrapped_lines.is_empty() {
            wrapped_lines.push(Vec::new());
        }

        // Now look up the target_row
        if target_row >= wrapped_lines.len() {
            // Past last line → end of this logical line
            return chars_vec.len();
        }

        let wline = &wrapped_lines[target_row];
        if wline.is_empty() {
            // Empty wrapped line — return char index of first char on this row
            // (or end of previous row)
            if target_row > 0 {
                // Char after the last char of the previous row
                if let Some(&(last_ci, _)) = wrapped_lines[target_row - 1].last() {
                    return (last_ci + 1).min(chars_vec.len());
                }
            }
            return 0;
        }

        // Walk the wrapped line accumulating display width to find target_col
        let mut col = 0usize;
        for &(ci, cw) in wline {
            if col + cw > target_col {
                // This char straddles or passes the target column
                return ci;
            }
            col += cw;
        }

        // target_col is past the end of this wrapped line — clamp to end
        // Return the char index AFTER the last char on this line
        if let Some(&(last_ci, _)) = wline.last() {
            (last_ci + 1).min(chars_vec.len())
        } else {
            chars_vec.len()
        }
    }

    /// Scroll up by `n` lines. Leaves auto_scroll mode, anchors from current position.
    pub(crate) fn scroll_up(&mut self, n: usize) {
        if self.auto_scroll.is_active() {
            let total = self.rendered_lines.len();
            self.scroll = total;
            self.auto_scroll.user_scrolled_away();
        }
        self.scroll = self.scroll.saturating_sub(n);
    }

    /// Scroll down by `n` lines. Snaps back to auto_scroll if near bottom.
    pub(crate) fn scroll_down(&mut self, n: usize, view_height: usize) {
        if self.auto_scroll.is_active() {
            return;
        }
        self.scroll += n;
        let total = self.rendered_lines.len();
        let max_scroll = total.saturating_sub(view_height);
        if self.scroll >= max_scroll {
            self.scroll = max_scroll;
            self.auto_scroll.user_reached_bottom();
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
            3 => {
                self.constants_scroll = self.constants_scroll.saturating_sub(n);
            }
            4 => {
                self.git_scroll = self.git_scroll.saturating_sub(n);
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
            3 => {
                let max = self.constants_lines.len().saturating_sub(view_height);
                self.constants_scroll = (self.constants_scroll + n).min(max);
            }
            4 => {
                let max = self.git_lines.len().saturating_sub(view_height);
                self.git_scroll = (self.git_scroll + n).min(max);
            }
            _ => {}
        }
    }

    /// Mark lines as needing rebuild.
    pub(crate) fn mark_dirty(&mut self) {
        self.lines_dirty = true;
    }

    /// Returns true if any modal dialog is open (permission or user question).
    /// When a modal is open, normal input handling (text entry, submit, etc.)
    /// must be suppressed.
    pub(crate) fn has_modal(&self) -> bool {
        self.pending_permission.is_some() || self.pending_user_question.is_some()
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

    /// Handle Right key when focus is on TabBar: switch to next tab (wraps around).
    pub(crate) fn handle_tab_bar_right(&mut self) {
        self.active_tab = (self.active_tab + 1) % 5;
    }

    /// Handle Left key when focus is on TabBar: switch to previous tab (wraps around).
    pub(crate) fn handle_tab_bar_left(&mut self) {
        self.active_tab = (self.active_tab + 4) % 5;
    }

    /// Clear the entire conversation — reset display, tokens, scroll, streaming.
    /// Equivalent to `/clear`, `/reset`, `/new`.
    pub(crate) fn clear_conversation(&mut self) {
        self.display_blocks.clear();
        self.streaming_buffer.clear();
        self.streaming_timestamp = None;
        self.is_loading = false;
        self.scroll = 0;
        self.auto_scroll.scroll_to_bottom();        self.total_input_tokens = 0;
        self.total_output_tokens = 0;
        self.turn_usage.reset();
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
        self.session_name = None;

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
    /// Uses `chlodwig_core::restore_messages()` to convert `Message` → `RestoredBlock`,
    /// then maps each `RestoredBlock` to the TUI-specific `DisplayBlock`.
    pub(crate) fn restore_messages_to_display(&mut self, messages: &[Message]) {
        use chlodwig_core::RestoredBlock;

        for rb in chlodwig_core::restore_messages(messages) {
            match rb {
                RestoredBlock::UserMessage(text) => {
                    self.display_blocks.push(DisplayBlock::UserMessage(text));
                }
                RestoredBlock::AssistantText(text) => {
                    self.display_blocks.push(DisplayBlock::AssistantText(text));
                }
                RestoredBlock::Thinking(text) => {
                    self.display_blocks.push(DisplayBlock::Thinking(text));
                }
                RestoredBlock::ToolCall { name, input } => {
                    let input_preview = chlodwig_core::truncate_preview(
                        &serde_json::to_string(&input).unwrap_or_default(),
                        200,
                    );
                    self.display_blocks.push(DisplayBlock::ToolCall {
                        name,
                        input_preview,
                    });
                }
                RestoredBlock::EditDiff {
                    file_path,
                    old_string,
                    new_string,
                } => {
                    // Try to build a contextual diff from the file on disk;
                    // fall back to plain ToolCall if the file is gone.
                    let input = serde_json::json!({
                        "file_path": file_path,
                        "old_string": old_string,
                        "new_string": new_string,
                    });
                    if let Some(diff_block) = crate::event_loop::build_edit_diff(&input) {
                        self.display_blocks.push(diff_block);
                    } else {
                        let input_preview = chlodwig_core::truncate_preview(
                            &serde_json::to_string(&input).unwrap_or_default(),
                            200,
                        );
                        self.display_blocks.push(DisplayBlock::ToolCall {
                            name: "Edit".into(),
                            input_preview,
                        });
                    }
                }
                RestoredBlock::BashOutput { command, output } => {
                    self.display_blocks.push(DisplayBlock::BashOutput {
                        command,
                        raw_output: output,
                    });
                }
                RestoredBlock::ReadOutput { file_path, content } => {
                    self.display_blocks.push(DisplayBlock::ReadOutput {
                        file_path,
                        content,
                    });
                }
                RestoredBlock::WriteOutput {
                    file_path,
                    content,
                    summary,
                } => {
                    self.display_blocks.push(DisplayBlock::WriteOutput {
                        file_path,
                        content,
                        summary,
                    });
                }
                RestoredBlock::GrepOutput {
                    content,
                    output_mode,
                } => {
                    self.display_blocks.push(DisplayBlock::GrepOutput {
                        content,
                        output_mode,
                    });
                }
                RestoredBlock::ToolResult { is_error, output } => {
                    let preview = chlodwig_core::truncate_preview(&output, 500);
                    self.display_blocks.push(DisplayBlock::ToolResult {
                        is_error,
                        preview,
                    });
                }
                RestoredBlock::SystemMessage(text) => {
                    self.display_blocks.push(DisplayBlock::SystemMessage(text));
                }
                RestoredBlock::CompactionSummary(text) => {
                    // Render the compaction summary as markdown (it contains
                    // headings, lists, code blocks). Stored as a User message
                    // in the API history but visually it's a model-generated
                    // summary. AssistantText already gets full markdown
                    // rendering, so reuse it.
                    self.display_blocks.push(DisplayBlock::AssistantText(text));
                }
            }
        }
        self.mark_dirty();
    }

    /// Truncate a string at a safe UTF-8 char boundary.
    /// Gotcha #16: never slice at a hardcoded byte offset — always use `is_char_boundary()`.
    fn truncate_preview(s: &str, max_bytes: usize) -> String {
        chlodwig_core::truncate_preview(s, max_bytes)
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

    /// Build rendered lines for the constants editor tab.
    pub(crate) fn rebuild_constants_lines(&mut self) {
        let mut logical_lines: Vec<RenderedLine> = Vec::new();

        logical_lines.push(RenderedLine::styled(
            "── Editable Constants ──",
            Style::default()
                .fg(Color::Cyan)
                .add_modifier(Modifier::BOLD),
        ));
        logical_lines.push(RenderedLine::styled(
            "  ↑/↓ navigate │ Enter edit │ Esc cancel │ Enter apply",
            Style::default().fg(Color::DarkGray),
        ));
        logical_lines.push(RenderedLine::plain(""));

        let metas = ConstantsConfig::FIELD_METAS;
        let mut current_crate = "";

        for (idx, meta) in metas.iter().enumerate() {
            // Show crate section header when the crate changes
            if meta.crate_name != current_crate {
                current_crate = meta.crate_name;
                logical_lines.push(RenderedLine::styled(
                    &format!("  [{}]", current_crate),
                    Style::default()
                        .fg(Color::Yellow)
                        .add_modifier(Modifier::BOLD),
                ));
            }

            let is_selected = idx == self.constants.selected_field;
            let is_editing = is_selected && self.constants.is_editing;

            // Raw values for comparison (modified detection)
            let raw_default = ConstantsConfig::get_default_value_string(idx);
            let raw_current = self.constants.get_field_value_string(idx);
            let modified = raw_current != raw_default && !is_editing;

            // Formatted values for display
            let default_display = ConstantsConfig::get_default_display_string(idx);
            let current_display = if is_editing {
                self.constants.edit_buffer.clone()
            } else {
                self.constants.get_field_display_string(idx)
            };

            let marker = if is_selected { "▸ " } else { "  " };
            let mod_tag = if modified { " ✎" } else { "" };

            if is_editing {
                // Editing: show name and editable value with cursor-style highlight
                logical_lines.push(RenderedLine::multi(vec![
                    (
                        &format!("  {} ", marker),
                        Style::default().fg(Color::Cyan),
                    ),
                    (
                        meta.name,
                        Style::default()
                            .fg(Color::White)
                            .add_modifier(Modifier::BOLD),
                    ),
                    (
                        " = ",
                        Style::default().fg(Color::DarkGray),
                    ),
                    (
                        &current_display,
                        Style::default()
                            .fg(Color::Black)
                            .bg(Color::White),
                    ),
                    (
                        &format!("  (default: {})", default_display),
                        Style::default().fg(Color::DarkGray),
                    ),
                ]));
            } else if is_selected {
                // Selected but not editing
                logical_lines.push(RenderedLine::multi(vec![
                    (
                        &format!("  {} ", marker),
                        Style::default().fg(Color::Cyan),
                    ),
                    (
                        meta.name,
                        Style::default()
                            .fg(Color::Cyan)
                            .add_modifier(Modifier::BOLD),
                    ),
                    (
                        " = ",
                        Style::default().fg(Color::DarkGray),
                    ),
                    (
                        &current_display,
                        Style::default().fg(Color::White),
                    ),
                    (
                        &format!("{mod_tag}  ({})", meta.description),
                        Style::default().fg(Color::DarkGray),
                    ),
                ]));
            } else {
                // Not selected
                logical_lines.push(RenderedLine::multi(vec![
                    (
                        &format!("  {} ", marker),
                        Style::default().fg(Color::DarkGray),
                    ),
                    (
                        meta.name,
                        Style::default().fg(Color::White),
                    ),
                    (
                        " = ",
                        Style::default().fg(Color::DarkGray),
                    ),
                    (
                        &current_display,
                        if modified {
                            Style::default().fg(Color::Yellow)
                        } else {
                            Style::default().fg(Color::White)
                        },
                    ),
                    (
                        mod_tag,
                        Style::default().fg(Color::Yellow),
                    ),
                ]));
            }
        }

        // Reset Defaults button
        logical_lines.push(RenderedLine::plain(""));
        let is_reset_selected = self.constants.is_reset_button_selected();
        if is_reset_selected {
            logical_lines.push(RenderedLine::styled(
                "  ▸ [ Reset Defaults ]",
                Style::default()
                    .fg(Color::Black)
                    .bg(Color::Cyan)
                    .add_modifier(Modifier::BOLD),
            ));
        } else {
            logical_lines.push(RenderedLine::styled(
                "    [ Reset Defaults ]",
                Style::default().fg(Color::DarkGray),
            ));
        }

        logical_lines.push(RenderedLine::plain(""));

        let w = if self.wrap_width > 0 { self.wrap_width } else { usize::MAX };
        self.constants_lines.clear();
        for logical in &logical_lines {
            for wrapped in logical.wrap(w) {
                self.constants_lines.push(wrapped);
            }
        }
    }

    /// Generate the label for the Git tab.
    /// Shows "git ⎇ {branch}" when on a branch, or just "git" otherwise.
    pub(crate) fn git_tab_label(&self) -> String {
        if self.git_branch.is_empty() {
            "git".to_string()
        } else {
            format!("git ⎇ {}", self.git_branch)
        }
    }

    /// Refresh only the git branch name (cheap: single git command).
    /// Called at startup so the tab label shows the branch immediately.
    pub(crate) fn refresh_git_branch(&mut self) {
        self.git_branch = std::process::Command::new("git")
            .args(["rev-parse", "--abbrev-ref", "HEAD"])
            .output()
            .ok()
            .and_then(|o| {
                if o.status.success() {
                    Some(String::from_utf8_lossy(&o.stdout).trim().to_string())
                } else {
                    None
                }
            })
            .unwrap_or_default();
    }

    /// Refresh git branch and status by running git commands.
    /// This is synchronous and should only be called when the Git tab is
    /// about to be displayed.
    pub(crate) fn refresh_git_info(&mut self) {
        // Refresh branch name
        self.refresh_git_branch();

        // Get status output
        self.git_status_output = std::process::Command::new("git")
            .args(["status"])
            .output()
            .ok()
            .and_then(|o| {
                if o.status.success() {
                    Some(String::from_utf8_lossy(&o.stdout).to_string())
                } else {
                    Some(String::from_utf8_lossy(&o.stderr).to_string())
                }
            })
            .unwrap_or_else(|| "git is not available".to_string());

        self.rebuild_git_lines();
    }

    /// Build rendered lines for the Git tab from stored status output.
    pub(crate) fn rebuild_git_lines(&mut self) {
        let mut logical_lines: Vec<RenderedLine> = Vec::new();

        // Header
        let header = if self.git_branch.is_empty() {
            "── Git ──".to_string()
        } else {
            format!("── Git ⎇ {} ──", self.git_branch)
        };
        logical_lines.push(RenderedLine::styled(
            &header,
            Style::default()
                .fg(Color::Cyan)
                .add_modifier(Modifier::BOLD),
        ));
        logical_lines.push(RenderedLine::plain(""));

        if self.git_status_output.is_empty() && self.git_branch.is_empty() {
            logical_lines.push(RenderedLine::styled(
                "(not a git repo or git not available)",
                Style::default().fg(Color::DarkGray),
            ));
        } else if self.git_status_output.is_empty() {
            logical_lines.push(RenderedLine::styled(
                "(no changes — working tree clean)",
                Style::default().fg(Color::DarkGray),
            ));
        } else {
            // Parse git status output with color coding
            for line in self.git_status_output.lines() {
                let style = if line.starts_with("On branch")
                    || line.starts_with("Your branch")
                {
                    Style::default().fg(Color::Cyan)
                } else if line.starts_with("Changes to be committed")
                    || line.starts_with("Changes not staged")
                    || line.starts_with("Untracked files")
                    || line.starts_with("Unmerged paths")
                {
                    Style::default()
                        .fg(Color::Yellow)
                        .add_modifier(Modifier::BOLD)
                } else if line.starts_with("\tnew file:")
                    || line.starts_with("\tadded:")
                {
                    Style::default().fg(Color::Green)
                } else if line.starts_with("\tmodified:") {
                    Style::default().fg(Color::Yellow)
                } else if line.starts_with("\tdeleted:") {
                    Style::default().fg(Color::Red)
                } else if line.starts_with("\trenamed:") {
                    Style::default().fg(Color::Magenta)
                } else if line.starts_with('\t') {
                    // Untracked files are just tab-indented filenames
                    Style::default().fg(Color::Red)
                } else if line.starts_with("nothing to commit")
                    || line.starts_with("no changes added")
                {
                    Style::default().fg(Color::Green)
                } else {
                    Style::default().fg(Color::White)
                };
                logical_lines.push(RenderedLine::styled(line, style));
            }
        }

        let w = if self.wrap_width > 0 { self.wrap_width } else { usize::MAX };
        self.git_lines.clear();
        for logical in &logical_lines {
            for wrapped in logical.wrap(w) {
                self.git_lines.push(wrapped);
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
        let _ = writeln!(out, "input.len():                 {} bytes", self.input.text.len());
        let _ = writeln!(out, "prompt_history.len():        {}", self.prompt_history.len());
        let _ = writeln!(out, "requests_log.len():          {}", self.requests_log.len());
        if let Some(last) = self.requests_log.back() {
            let _ = writeln!(out, "  last.response_chunks.len(): {}", last.response_chunks.len());
        }
        let _ = writeln!(out, "sys_prompt_lines.len():      {}", self.sys_prompt_lines.len());
        let _ = writeln!(out, "sys_prompt_blocks.len():     {}", self.system_prompt_blocks.len());
        let _ = writeln!(out, "requests_lines.len():        {}", self.requests_lines.len());
        let _ = writeln!(out, "constants_lines.len():       {}", self.constants_lines.len());
        let _ = writeln!(out, "git_lines.len():             {}", self.git_lines.len());
        let _ = writeln!(out, "git_branch:                  {}", self.git_branch);

        let _ = writeln!(out);
        let _ = writeln!(out, "=== Counters ===");
        let _ = writeln!(out, "turn_count:          {}", self.turn_count);
        let _ = writeln!(out, "api_request_count:   {}", self.api_request_count);
        let _ = writeln!(out, "stream_chunks:       {}", self.stream_chunks);
        let _ = writeln!(out, "total_input_tokens:  {}", self.total_input_tokens);
        let _ = writeln!(out, "total_output_tokens: {}", self.total_output_tokens);
        let _ = writeln!(out, "turn_input_tokens:   {}", self.turn_usage.input_tokens);
        let _ = writeln!(out, "turn_output_tokens:  {}", self.turn_usage.output_tokens);
        let _ = writeln!(out, "turn_cache_tokens:   {}", self.turn_usage.cache_tokens);

        let _ = writeln!(out);
        let _ = writeln!(out, "=== Flags ===");
        let _ = writeln!(out, "is_loading:          {}", self.is_loading);
        let _ = writeln!(out, "auto_scroll:         {}", self.auto_scroll.is_active());
        let _ = writeln!(out, "lines_dirty:         {}", self.lines_dirty);
        let _ = writeln!(out, "requests_dirty:      {}", self.requests_dirty);
        let _ = writeln!(out, "should_quit:         {}", self.should_quit);
        let _ = writeln!(out, "scroll:              {}", self.scroll);
        let _ = writeln!(out, "wrap_width:           {}", self.wrap_width);
        let _ = writeln!(out, "active_tab:          {}", self.active_tab);
        let _ = writeln!(out, "focus:               {:?}", self.focus);
        let _ = writeln!(out, "cursor:              {}", self.input.cursor);
        let _ = writeln!(out, "history_index:       {:?}", self.history_index);
        let _ = writeln!(out, "spinner_frame:       {}", self.spinner_frame);
        let _ = writeln!(out, "pending_permission:  {}", self.pending_permission.is_some());
        let _ = writeln!(out, "pending_user_question: {}", self.pending_user_question.is_some());
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
                    let tail = if t.len() > 200 {
                        let mut start = t.len() - 200;
                        while start < t.len() && !t.is_char_boundary(start) {
                            start += 1;
                        }
                        &t[start..]
                    } else {
                        t
                    };
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
                DisplayBlock::EditDiff { .. } => "EditDiff",
                DisplayBlock::Error(_) => "Error",
                DisplayBlock::SystemMessage(_) => "SystemMessage",
                DisplayBlock::BashOutput { .. } => "BashOutput",
                DisplayBlock::ReadOutput { .. } => "ReadOutput",
                DisplayBlock::WriteOutput { .. } => "WriteOutput",
                DisplayBlock::GrepOutput { .. } => "GrepOutput",
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

/// Parse a ripgrep content-mode line into (file_path, line_number, code, is_match).
///
/// Match lines:   `file.rs:42:code here`  → is_match = true
/// Context lines: `file.rs-42-code here`  → is_match = false
///
/// Returns `None` if the line doesn't match the expected pattern.
pub(crate) fn parse_grep_content_line(line: &str) -> Option<(&str, &str, &str, bool)> {
    // Strategy: find the LAST occurrence of `:number:` or `-number-` pattern.
    // This handles file paths that contain colons (e.g. on Windows) or hyphens.
    // ripgrep format: everything before the line-number separator is the file path.

    // Try match lines first (`:number:`)
    if let Some(result) = try_parse_grep_line(line, ':') {
        return Some(result);
    }
    // Try context lines (`-number-`)
    if let Some(result) = try_parse_grep_line(line, '-') {
        return Some(result);
    }
    None
}

/// Try to parse a grep line with the given separator character.
/// Looks for the pattern `path<sep>digits<sep>rest`.
pub(crate) fn try_parse_grep_line(line: &str, sep: char) -> Option<(&str, &str, &str, bool)> {
    let is_match = sep == ':';
    let bytes = line.as_bytes();
    let sep_byte = sep as u8;

    // Find first separator followed by digits followed by another separator.
    // We scan forward to find the first valid "path<sep>digits<sep>" pattern.
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == sep_byte {
            // Found first separator at i — now check for digits
            let digit_start = i + 1;
            let mut j = digit_start;
            while j < bytes.len() && bytes[j].is_ascii_digit() {
                j += 1;
            }
            // Need at least one digit, and the next char must be the same separator
            if j > digit_start && j < bytes.len() && bytes[j] == sep_byte {
                let file = &line[..i];
                let line_num = &line[digit_start..j];
                let code = &line[j + 1..];
                return Some((file, line_num, code, is_match));
            }
        }
        i += 1;
    }
    None
}
