//! TUI-side tests for the UserQuestion dialog.
//!
//! The pure state-machine tests (navigation, submit, editing keys, UTF-8, …)
//! live in `chlodwig-core/src/reducers/user_question.rs` and run completely
//! without ratatui/crossterm. This file only covers the **TUI integration**:
//! `PendingUserQuestion` wrapper, `has_modal()`, the event-loop translation
//! layer (KeyEvent → Msg), and the render module wiring.

use super::*;
use chlodwig_core::reducers::user_question as uq;
use tokio::sync::oneshot;

/// Helper: build a `PendingUserQuestion` (TUI wrapper around `uq::Model`).
fn pending_with_options(
    question: &str,
    options: &[&str],
) -> (PendingUserQuestion, oneshot::Receiver<String>) {
    let (tx, rx) = oneshot::channel();
    let q = PendingUserQuestion::new(
        question.to_string(),
        options.iter().map(|s| s.to_string()).collect(),
        tx,
    );
    (q, rx)
}

fn pending_text_only(question: &str) -> (PendingUserQuestion, oneshot::Receiver<String>) {
    pending_with_options(question, &[])
}

// ── has_modal() integration ───────────────────────────────────────

#[test]
fn test_has_modal_false_by_default() {
    let app = App::new("test".into());
    assert!(!app.has_modal());
}

#[test]
fn test_has_modal_true_with_user_question() {
    let mut app = App::new("test".into());
    let (q, _rx) = pending_text_only("Test?");
    app.pending_user_question = Some(q);
    assert!(app.has_modal());
}

#[test]
fn test_has_modal_true_with_permission() {
    let mut app = App::new("test".into());
    let (tx, _rx) = oneshot::channel();
    app.pending_permission = Some(PendingPermission {
        tool_name: "Bash".into(),
        input: serde_json::json!({}),
        respond: tx,
    });
    assert!(app.has_modal());
}

// ── PendingUserQuestion::new + apply ──────────────────────────────

#[test]
fn test_pending_new_with_options_starts_on_first() {
    let (q, _rx) = pending_with_options("Pick", &["A", "B"]);
    assert_eq!(q.model.selected, Some(0));
}

#[test]
fn test_pending_new_text_only_starts_in_text_mode() {
    let (q, _rx) = pending_text_only("?");
    assert_eq!(q.model.selected, None);
}

#[test]
fn test_pending_apply_navigation_keeps_dialog_open() {
    let (q, _rx) = pending_with_options("Pick", &["A", "B", "C"]);
    let q = q.apply(uq::Msg::NavDown).expect("dialog should stay open on NavDown");
    assert_eq!(q.model.selected, Some(1));
}

#[test]
fn test_pending_apply_submit_closes_dialog_and_sends_answer() {
    let (q, rx) = pending_with_options("Pick", &["Alpha", "Beta"]);
    let result = q.apply(uq::Msg::Submit);
    assert!(result.is_none(), "Submit must close the dialog");
    assert_eq!(rx.blocking_recv().unwrap(), "Alpha");
}

#[test]
fn test_pending_apply_cancel_sends_empty_string() {
    let (q, rx) = pending_text_only("?");
    let result = q.apply(uq::Msg::Cancel);
    assert!(result.is_none());
    assert_eq!(rx.blocking_recv().unwrap(), "");
}

#[test]
fn test_pending_apply_quick_select_closes_with_chosen_option() {
    let (q, rx) = pending_with_options("Pick", &["A", "B", "C"]);
    let result = q.apply(uq::Msg::QuickSelect(2));
    assert!(result.is_none());
    assert_eq!(rx.blocking_recv().unwrap(), "B");
}

#[test]
fn test_pending_apply_text_then_submit() {
    let (q, rx) = pending_text_only("?");
    let q = q.apply(uq::Msg::InsertChar('h')).unwrap();
    let q = q.apply(uq::Msg::InsertChar('i')).unwrap();
    let result = q.apply(uq::Msg::Submit);
    assert!(result.is_none());
    assert_eq!(rx.blocking_recv().unwrap(), "hi");
}

// ── Event loop wiring (source-level checks) ───────────────────────
//
// We can't easily simulate crossterm KeyEvents in a unit test, so we
// verify by source inspection that the event loop has the expected
// MVU-style integration. This catches regressions if someone removes
// the reducer dispatch.

#[test]
fn test_event_loop_uses_user_question_reducer() {
    let source = include_str!("../event_loop.rs");
    assert!(
        source.contains("reducers::user_question"),
        "Event loop must dispatch to the UserQuestion reducer"
    );
}

#[test]
fn test_event_loop_translates_navigation_to_msg() {
    let source = include_str!("../event_loop.rs");
    assert!(source.contains("UqMsg::NavUp"), "must translate Up to NavUp");
    assert!(source.contains("UqMsg::NavDown"), "must translate Down to NavDown");
    assert!(source.contains("UqMsg::ToggleFocus"), "must translate Tab to ToggleFocus");
    assert!(source.contains("UqMsg::Submit"), "must translate Enter to Submit");
    assert!(source.contains("UqMsg::Cancel"), "must translate Esc to Cancel");
}

#[test]
fn test_event_loop_translates_editing_keys() {
    let source = include_str!("../event_loop.rs");
    assert!(source.contains("UqMsg::InsertChar"));
    assert!(source.contains("UqMsg::InsertNewline"));
    assert!(source.contains("UqMsg::DeleteBack"));
    assert!(source.contains("UqMsg::DeleteForward"));
    assert!(source.contains("UqMsg::DeleteWordBack"));
    assert!(source.contains("UqMsg::DeleteWordForward"));
    assert!(source.contains("UqMsg::CursorWordLeft"));
    assert!(source.contains("UqMsg::CursorWordRight"));
}

#[test]
fn test_event_loop_uses_apply_method() {
    let source = include_str!("../event_loop.rs");
    assert!(
        source.contains(".apply("),
        "Event loop must call PendingUserQuestion::apply()"
    );
}

#[test]
fn test_event_loop_blocks_input_during_user_question() {
    let source = include_str!("../event_loop.rs");
    assert!(
        source.contains("has_modal()"),
        "Event loop must use has_modal() to block input during modal dialogs"
    );
}

#[test]
fn test_event_loop_has_user_question_tool() {
    let source = include_str!("../event_loop.rs");
    assert!(
        source.contains("UserQuestionTool"),
        "Event loop must inject UserQuestionTool into conversation state"
    );
}

#[test]
fn test_event_loop_drains_user_question_channel() {
    let source = include_str!("../event_loop.rs");
    assert!(
        source.contains("uq_rx.try_recv()"),
        "Event loop must drain the user question channel"
    );
}

#[test]
fn test_render_has_user_question_dialog() {
    let source = include_str!("../render.rs");
    assert!(
        source.contains("render_user_question_dialog"),
        "Render must have user question dialog function"
    );
}

#[test]
fn test_render_uses_model_through_wrapper() {
    let source = include_str!("../render.rs");
    // After the MVU refactor, render reads through q.model (not q.question etc.)
    assert!(
        source.contains("&q.model") || source.contains("q.model."),
        "Render must access dialog state via q.model"
    );
}
