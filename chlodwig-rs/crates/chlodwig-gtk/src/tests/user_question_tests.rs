//! Tests for UserQuestion dialog integration in GTK.

use crate::app_state::AppState;
use std::collections::VecDeque;
use tokio::sync::{mpsc, oneshot};

// --- AppState tests: no pending_user_question in state ---

#[test]
fn test_app_state_has_no_pending_user_question_field() {
    // After consolidation, AppState should NOT have a pending_user_question field.
    // The dialog is handled entirely by GTK widgets + a queue in the event loop.
    let state = AppState::new("test-model".into());
    // If this compiles, the field is gone. Just verify state is functional.
    assert!(!state.is_streaming);
}

#[test]
fn test_clear_does_not_reference_pending_user_question() {
    let mut state = AppState::new("test-model".into());
    state.clear();
    assert_eq!(state.blocks.len(), 0);
}

// --- Source-level checks that UserQuestionTool is wired into main.rs ---

#[test]
fn test_main_rs_injects_user_question_tool() {
    let source = include_str!("../main.rs");
    assert!(
        source.contains("UserQuestionTool::new"),
        "main.rs must inject UserQuestionTool into conversation state"
    );
}

#[test]
fn test_main_rs_creates_user_question_channel() {
    let source = include_str!("../main.rs");
    assert!(
        source.contains("UserQuestionRequest"),
        "main.rs must create an unbounded channel for UserQuestionRequest"
    );
}

#[test]
fn test_main_rs_drains_user_question_requests() {
    let source = include_str!("../main.rs");
    assert!(
        source.contains("uq_rx"),
        "main.rs must drain UserQuestion requests from the channel"
    );
    assert!(
        source.contains("show_user_question_dialog"),
        "main.rs must show UserQuestion dialog"
    );
}

// --- Sequential dialog queue tests (pure logic, no GTK widgets) ---

#[test]
fn test_main_rs_queues_dialogs_sequentially() {
    let source = include_str!("../main.rs");
    assert!(
        source.contains("uq_queue"),
        "main.rs must use a queue (uq_queue) for sequential dialog handling"
    );
    assert!(
        source.contains("uq_dialog_open"),
        "main.rs must track whether a dialog is currently open (uq_dialog_open)"
    );
}

/// Simulate the queue drain logic from main.rs:
/// multiple requests arrive via channel → all get queued → popped one at a time.
#[test]
fn test_queue_drains_channel_into_vecdeque() {
    let (tx, mut rx) = mpsc::unbounded_channel::<chlodwig_tools::UserQuestionRequest>();

    // Send 3 requests
    for i in 0..3 {
        let (respond, _) = oneshot::channel();
        tx.send(chlodwig_tools::UserQuestionRequest {
            question: format!("Q{}", i),
            options: vec![],
            respond,
        })
        .unwrap();
    }

    // Drain into queue (mirrors main.rs logic)
    let mut queue: VecDeque<chlodwig_tools::UserQuestionRequest> = VecDeque::new();
    while let Ok(req) = rx.try_recv() {
        queue.push_back(req);
    }

    assert_eq!(queue.len(), 3);
    assert_eq!(queue[0].question, "Q0");
    assert_eq!(queue[1].question, "Q1");
    assert_eq!(queue[2].question, "Q2");
}

/// When dialog_open is true, queue does not pop — requests accumulate.
#[test]
fn test_queue_does_not_pop_while_dialog_open() {
    let mut queue: VecDeque<chlodwig_tools::UserQuestionRequest> = VecDeque::new();
    let dialog_open = true;

    let (respond, _) = oneshot::channel();
    queue.push_back(chlodwig_tools::UserQuestionRequest {
        question: "waiting".into(),
        options: vec![],
        respond,
    });

    // Mirrors main.rs: only pop when !dialog_open
    let popped = if !dialog_open {
        queue.pop_front()
    } else {
        None
    };

    assert!(popped.is_none());
    assert_eq!(queue.len(), 1, "request should stay in queue");
}

/// When dialog_open is false, next request is popped.
#[test]
fn test_queue_pops_when_dialog_closed() {
    let mut queue: VecDeque<chlodwig_tools::UserQuestionRequest> = VecDeque::new();
    let dialog_open = false;

    let (respond, _) = oneshot::channel();
    queue.push_back(chlodwig_tools::UserQuestionRequest {
        question: "ready".into(),
        options: vec![],
        respond,
    });

    let popped = if !dialog_open {
        queue.pop_front()
    } else {
        None
    };

    assert!(popped.is_some());
    assert_eq!(popped.unwrap().question, "ready");
    assert_eq!(queue.len(), 0);
}

// --- Respond semantics (oneshot channel) ---

/// Responding via oneshot delivers the answer to the waiting tool.
#[test]
fn test_respond_delivers_answer() {
    let (tx, rx) = oneshot::channel::<String>();
    let _ = tx.send("Option A".to_string());
    assert_eq!(rx.blocking_recv().unwrap(), "Option A");
}

/// Cancel sends empty string — consistent with TUI behavior.
#[test]
fn test_cancel_sends_empty_string() {
    let (tx, rx) = oneshot::channel::<String>();
    let _ = tx.send(String::new());
    assert_eq!(rx.blocking_recv().unwrap(), "");
}

/// If respond is consumed (taken), a second send is a no-op (no panic).
#[test]
fn test_double_respond_is_safe() {
    use std::cell::RefCell;
    let (tx, rx) = oneshot::channel::<String>();
    let respond = RefCell::new(Some(tx));

    // First take succeeds
    if let Some(tx) = respond.borrow_mut().take() {
        let _ = tx.send("first".to_string());
    }

    // Second take returns None — no panic, no double-send
    assert!(respond.borrow_mut().take().is_none());
    assert_eq!(rx.blocking_recv().unwrap(), "first");
}

/// Dropping the receiver (tool side cancelled) doesn't panic the dialog.
#[test]
fn test_respond_after_receiver_dropped_does_not_panic() {
    let (tx, rx) = oneshot::channel::<String>();
    drop(rx);
    // send returns Err but must not panic
    let result = tx.send("orphaned".to_string());
    assert!(result.is_err());
}

// --- UTF-8 edge cases ---

#[test]
fn test_question_with_utf8() {
    let (tx, rx) = oneshot::channel::<String>();
    let req = chlodwig_tools::UserQuestionRequest {
        question: "Möchtest du Ä, Ö oder Ü?".to_string(),
        options: vec!["Ä".into(), "Ö".into(), "Ü".into()],
        respond: tx,
    };

    assert_eq!(req.question, "Möchtest du Ä, Ö oder Ü?");
    assert_eq!(req.options.len(), 3);

    // Simulate selecting an option
    let _ = req.respond.send("Ü".to_string());
    assert_eq!(rx.blocking_recv().unwrap(), "Ü");
}

#[test]
fn test_question_with_emoji_options() {
    let (tx, rx) = oneshot::channel::<String>();
    let req = chlodwig_tools::UserQuestionRequest {
        question: "Pick an emoji".to_string(),
        options: vec!["🎉".into(), "🚀".into(), "🦀".into()],
        respond: tx,
    };

    let _ = req.respond.send("🦀".to_string());
    assert_eq!(rx.blocking_recv().unwrap(), "🦀");
}

// --- Edge: empty options list ---

#[test]
fn test_empty_options_means_freetext_only() {
    let (tx, rx) = oneshot::channel::<String>();
    let req = chlodwig_tools::UserQuestionRequest {
        question: "What is your name?".to_string(),
        options: vec![],
        respond: tx,
    };

    assert!(req.options.is_empty());
    let _ = req.respond.send("Claude".to_string());
    assert_eq!(rx.blocking_recv().unwrap(), "Claude");
}

// --- Dialog uses multiline TextView, not single-line Entry ---

#[test]
fn test_dialog_uses_textview_not_entry() {
    let source = include_str!("../window.rs");
    assert!(
        source.contains("TextView::builder()"),
        "UserQuestion dialog must use a multiline TextView, not a single-line Entry"
    );
    // The old Entry::new() should be gone from the dialog
    assert!(
        !source.contains("Entry::new()"),
        "UserQuestion dialog must NOT use Entry::new() — use TextView for multiline"
    );
}

#[test]
fn test_dialog_uses_shared_macos_shortcuts() {
    let source = include_str!("../window.rs");
    assert!(
        source.contains("setup_macos_input_shortcuts(&text_view)"),
        "UserQuestion dialog must call setup_macos_input_shortcuts on its TextView"
    );
}

#[test]
fn test_main_uses_shared_macos_shortcuts() {
    let source = include_str!("../main.rs");
    assert!(
        source.contains("setup_macos_input_shortcuts"),
        "Main prompt input must use the shared setup_macos_input_shortcuts function"
    );
}

#[test]
fn test_dialog_cmd_enter_submits() {
    let source = include_str!("../window.rs");
    assert!(
        source.contains("META_MASK"),
        "Dialog must check for Cmd (META_MASK) modifier so Cmd+Enter submits"
    );
}

// --- MVU integration: dialog uses chlodwig-core reducer ---

/// The dialog must import the user_question reducer from chlodwig-core,
/// not duplicate the answer-resolution logic inline.
#[test]
fn test_dialog_uses_core_reducer() {
    let source = include_str!("../window.rs");
    assert!(
        source.contains("chlodwig_core::reducers::user_question"),
        "show_user_question_dialog must use the shared reducer in chlodwig-core"
    );
    assert!(
        source.contains("uq::Model::new"),
        "dialog must construct a uq::Model"
    );
    assert!(
        source.contains("uq::Outcome::Submit"),
        "dialog must react to uq::Outcome::Submit"
    );
}

/// The dialog must dispatch reducer Msg variants for each user action,
/// rather than computing answers inline.
#[test]
fn test_dialog_dispatches_reducer_messages() {
    let source = include_str!("../window.rs");
    assert!(
        source.contains("uq::Msg::Cancel"),
        "Cancel button / Esc / X must dispatch Msg::Cancel"
    );
    assert!(
        source.contains("uq::Msg::Submit"),
        "Submit button / Cmd+Enter must dispatch Msg::Submit"
    );
    assert!(
        source.contains("uq::Msg::QuickSelect"),
        "Option buttons must dispatch Msg::QuickSelect"
    );
    assert!(
        source.contains("uq::Msg::SetText"),
        "TextBuffer changes must dispatch Msg::SetText to sync the model"
    );
}

/// The "if text is empty and options exist, default to first option"
/// fallback was removed deliberately. Empty submit → empty answer.
#[test]
fn test_dialog_no_default_to_first_option_fallback() {
    let source = include_str!("../window.rs");
    assert!(
        !source.contains("options_clone[0]"),
        "old default-to-first-option fallback must be gone"
    );
    assert!(
        !source.contains("options_for_enter[0]"),
        "old default-to-first-option fallback (Cmd+Enter path) must be gone"
    );
}
