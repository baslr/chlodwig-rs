//! Shared types, enums, and constants for the TUI.

use chlodwig_core::PermissionDecision;
use chlodwig_core::reducers::user_question as uq;
use tokio::sync::oneshot;

// ── Display model ──────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub(crate) enum DisplayBlock {
    Timestamp(String),
    UserMessage(String),
    AssistantText(String),
    Thinking(String),
    ToolCall {
        name: String,
        input_preview: String,
    },
    ToolResult {
        is_error: bool,
        preview: String,
    },
    /// Farbige Diff-Anzeige für Edit-ToolCalls.
    EditDiff {
        file_path: String,
        diff_lines: Vec<DiffLine>,
        /// Language token for syntax highlighting (e.g. "rust", "python").
        lang: String,
    },
    Error(String),
    SystemMessage(String),
    BashOutput {
        command: String,
        raw_output: String,
    },
    /// Read tool output with syntax highlighting based on file extension.
    ReadOutput {
        file_path: String,
        content: String,
    },
    /// Write tool output with syntax highlighting based on file extension.
    /// `content` is the raw file content (no line numbers), `summary` is the
    /// status line (e.g. "Wrote 13 lines (298 bytes) to Demo.java").
    WriteOutput {
        file_path: String,
        content: String,
        summary: String,
    },
    /// Grep tool output with optional syntax highlighting.
    /// In "content" mode, lines are `file:line:code` — highlighted per file extension.
    /// In "files_with_matches" / "count" mode, displayed as plain text.
    GrepOutput {
        content: String,
        output_mode: String,
    },
}

/// A single line in an Edit diff display.
#[derive(Debug, Clone)]
pub(crate) struct DiffLine {
    pub(crate) line_num: usize,
    pub(crate) kind: DiffKind,
    pub(crate) text: String,
}

/// Kind of diff line: removed, added, or unchanged context.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum DiffKind {
    /// Removed line (red, prefix "-")
    Removal,
    /// Added line (green, prefix "+")
    Addition,
    /// Unchanged context line (gray, prefix " ")
    Context,
}

pub(crate) struct PendingPermission {
    pub(crate) tool_name: String,
    pub(crate) input: serde_json::Value,
    pub(crate) respond: oneshot::Sender<PermissionDecision>,
}

/// A pending user question dialog — the LLM asked a question and is waiting
/// for the user's answer.
///
/// The pure state lives in [`uq::Model`] (in `chlodwig-core::reducers`).
/// This wrapper just adds the `oneshot::Sender<String>` that the reducer
/// cannot own (because reducers are pure / `Clone`-able).
pub(crate) struct PendingUserQuestion {
    pub(crate) model: uq::Model,
    pub(crate) respond: oneshot::Sender<String>,
}

impl PendingUserQuestion {
    /// Convenience constructor used by the conversation event handler when
    /// a `UserQuestionRequest` arrives from the tool.
    pub(crate) fn new(
        question: String,
        options: Vec<String>,
        respond: oneshot::Sender<String>,
    ) -> Self {
        Self {
            model: uq::Model::new(question, options),
            respond,
        }
    }

    /// Apply a reducer message. If the dialog wants to close (user pressed
    /// Enter / Esc / number key), this method consumes `self`, sends the
    /// answer, and returns `None`. Otherwise it returns `Some(self)` so the
    /// caller can re-store the still-open dialog.
    ///
    /// Typical usage in the event loop:
    /// ```ignore
    /// if let Some(q) = app.pending_user_question.take() {
    ///     app.pending_user_question = q.apply(uq::Msg::NavDown);
    /// }
    /// ```
    pub(crate) fn apply(self, msg: uq::Msg) -> Option<Self> {
        let mut model = self.model;
        match model.update(msg) {
            uq::Outcome::None => Some(Self { model, respond: self.respond }),
            uq::Outcome::Submit(answer) => {
                let _ = self.respond.send(answer);
                None
            }
        }
    }
}

/// Which area of the UI has keyboard focus.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum Focus {
    Input,
    TabBar,
}

/// A single API request/response log entry for the Requests tab.
pub(crate) struct RequestLogEntry {
    pub(crate) timestamp: String,
    pub(crate) request_body: String,
    pub(crate) response_model: String,
    pub(crate) response_input_tokens: u32,
    pub(crate) response_output_tokens: u32,
    pub(crate) duration_ms: Option<u64>,
    pub(crate) response_chunks: Vec<String>,
}

pub(crate) const MAX_REQUEST_LOG: usize = 1000;

pub(crate) const SPINNER_FRAMES: &[char] = &['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

/// Max scrollback lines to keep (500k ≈ ~50MB worst case for long lines).
pub(crate) const MAX_SCROLLBACK_LINES: usize = 500_000;
