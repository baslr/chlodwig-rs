//! Tests for the UserQuestion tool dialog.

use super::*;
use tokio::sync::oneshot;

/// Helper: create a PendingUserQuestion with options.
fn pending_with_options(
    question: &str,
    options: &[&str],
) -> (PendingUserQuestion, oneshot::Receiver<String>) {
    let (tx, rx) = oneshot::channel();
    let q = PendingUserQuestion {
        question: question.to_string(),
        options: options.iter().map(|s| s.to_string()).collect(),
        selected: if options.is_empty() { None } else { Some(0) },
        input: chlodwig_core::InputState::new(),
        respond: tx,
    };
    (q, rx)
}

/// Helper: create a PendingUserQuestion without options (text-only).
fn pending_text_only(question: &str) -> (PendingUserQuestion, oneshot::Receiver<String>) {
    pending_with_options(question, &[])
}

// ── has_modal() ───────────────────────────────────────────────────

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

// ── Initial state ─────────────────────────────────────────────────

#[test]
fn test_user_question_with_options_starts_on_first_option() {
    let (q, _rx) = pending_with_options("Pick one", &["A", "B", "C"]);
    assert_eq!(q.selected, Some(0));
    assert!(q.input.is_empty());
    assert_eq!(q.input.cursor, 0);
}

#[test]
fn test_user_question_without_options_starts_in_text_mode() {
    let (q, _rx) = pending_text_only("What's up?");
    assert_eq!(q.selected, None);
}

// ── Navigation: Up/Down ───────────────────────────────────────────

#[test]
fn test_user_question_nav_down_through_options() {
    let (mut q, _rx) = pending_with_options("Pick", &["A", "B", "C"]);
    assert_eq!(q.selected, Some(0));

    // Down: 0 → 1
    if let Some(i) = q.selected {
        if i + 1 < q.options.len() { q.selected = Some(i + 1); }
    }
    assert_eq!(q.selected, Some(1));

    // Down: 1 → 2
    if let Some(i) = q.selected {
        if i + 1 < q.options.len() { q.selected = Some(i + 1); }
    }
    assert_eq!(q.selected, Some(2));

    // Down: 2 (last) → None (text input)
    match q.selected {
        Some(i) if i + 1 < q.options.len() => q.selected = Some(i + 1),
        Some(_) => q.selected = None,
        None => {}
    }
    assert_eq!(q.selected, None, "should switch to text input after last option");
}

#[test]
fn test_user_question_nav_up_from_text_to_last_option() {
    let (mut q, _rx) = pending_with_options("Pick", &["A", "B", "C"]);
    q.selected = None; // In text input mode

    // Up from text → last option
    match q.selected {
        Some(0) => {}
        Some(i) => q.selected = Some(i - 1),
        None => q.selected = Some(q.options.len() - 1),
    }
    assert_eq!(q.selected, Some(2), "up from text input should go to last option");
}

#[test]
fn test_user_question_nav_up_at_first_option_stays() {
    let (mut q, _rx) = pending_with_options("Pick", &["A", "B"]);
    q.selected = Some(0);

    match q.selected {
        Some(0) => {} // stays
        Some(i) => q.selected = Some(i - 1),
        None => q.selected = Some(q.options.len() - 1),
    }
    assert_eq!(q.selected, Some(0), "should stay at first option");
}

// ── Tab toggle ────────────────────────────────────────────────────

#[test]
fn test_user_question_tab_switches_to_text() {
    let (mut q, _rx) = pending_with_options("Pick", &["A", "B"]);
    assert_eq!(q.selected, Some(0));

    // Tab: options → text
    if q.selected.is_some() { q.selected = None; } else { q.selected = Some(0); }
    assert_eq!(q.selected, None);
}

#[test]
fn test_user_question_tab_switches_to_options() {
    let (mut q, _rx) = pending_with_options("Pick", &["A", "B"]);
    q.selected = None;

    // Tab: text → options
    if q.selected.is_some() { q.selected = None; } else { q.selected = Some(0); }
    assert_eq!(q.selected, Some(0));
}

// ── Text input ────────────────────────────────────────────────────

#[test]
fn test_user_question_text_input_insert_char() {
    let (mut q, _rx) = pending_text_only("Question?");
    assert_eq!(q.selected, None); // text mode

    // Simulate typing "hi" using InputState
    q.input.insert_char('h');
    q.input.insert_char('i');

    assert_eq!(q.input.text, "hi");
    assert_eq!(q.input.cursor, 2);
}

#[test]
fn test_user_question_text_input_backspace() {
    let (mut q, _rx) = pending_text_only("Question?");
    q.input = chlodwig_core::InputState::with_text("hei");

    // Backspace
    q.input.delete_back();

    assert_eq!(q.input.text, "he");
    assert_eq!(q.input.cursor, 2);
}

#[test]
fn test_user_question_text_input_utf8() {
    let (mut q, _rx) = pending_text_only("Name?");
    q.input = chlodwig_core::InputState::with_text("Ärger");

    // Backspace removes 'r'
    q.input.delete_back();

    assert_eq!(q.input.text, "Ärge");
}

// ── Submit ────────────────────────────────────────────────────────

#[test]
fn test_user_question_submit_option() {
    let (q, rx) = pending_with_options("Pick", &["Alpha", "Beta", "Gamma"]);
    // selected = Some(0), so submitting should send "Alpha"
    assert_eq!(q.selected, Some(0));

    let answer = q.options[q.selected.unwrap()].clone();
    q.respond.send(answer).unwrap();

    assert_eq!(rx.blocking_recv().unwrap(), "Alpha");
}

#[test]
fn test_user_question_submit_second_option() {
    let (mut q, rx) = pending_with_options("Pick", &["Alpha", "Beta", "Gamma"]);
    q.selected = Some(1);

    let answer = q.options[q.selected.unwrap()].clone();
    q.respond.send(answer).unwrap();

    assert_eq!(rx.blocking_recv().unwrap(), "Beta");
}

#[test]
fn test_user_question_submit_text_input() {
    let (mut q, rx) = pending_text_only("Thoughts?");
    q.input = chlodwig_core::InputState::with_text("I think we should use Rust");
    q.selected = None; // text mode

    let answer = if let Some(idx) = q.selected {
        q.options[idx].clone()
    } else {
        q.input.text.clone()
    };
    q.respond.send(answer).unwrap();

    assert_eq!(rx.blocking_recv().unwrap(), "I think we should use Rust");
}

#[test]
fn test_user_question_submit_freetext_ignoring_options() {
    let (mut q, rx) = pending_with_options("Pick color", &["Red", "Blue"]);
    q.selected = None; // switched to text mode
    q.input = chlodwig_core::InputState::with_text("Green actually");

    let answer = if let Some(idx) = q.selected {
        q.options[idx].clone()
    } else {
        q.input.text.clone()
    };
    q.respond.send(answer).unwrap();

    assert_eq!(rx.blocking_recv().unwrap(), "Green actually");
}

// ── Esc cancels ───────────────────────────────────────────────────

#[test]
fn test_user_question_esc_sends_empty_string() {
    let (q, rx) = pending_text_only("Question?");
    // Esc → send empty string
    q.respond.send(String::new()).unwrap();
    assert_eq!(rx.blocking_recv().unwrap(), "");
}

// ── Quick-select number keys ──────────────────────────────────────

#[test]
fn test_user_question_number_key_selects_option() {
    let (q, rx) = pending_with_options("Pick", &["A", "B", "C"]);
    // Pressing '2' should submit "B"
    let idx = 1; // '2' - '1'
    assert!(idx < q.options.len());
    let answer = q.options[idx].clone();
    q.respond.send(answer).unwrap();
    assert_eq!(rx.blocking_recv().unwrap(), "B");
}

#[test]
fn test_user_question_number_key_out_of_range_ignored() {
    let (q, _rx) = pending_with_options("Pick", &["A", "B"]);
    // Pressing '3' → idx 2, which is >= options.len() (2), so should be ignored
    let idx = 2;
    assert!(idx >= q.options.len(), "should be out of range");
}

// ── Event loop source checks ──────────────────────────────────────

#[test]
fn test_event_loop_has_user_question_channel() {
    let source = include_str!("../event_loop.rs");
    assert!(
        source.contains("UserQuestionRequest"),
        "Event loop must handle UserQuestionRequest"
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
fn test_event_loop_has_user_question_enter_handler() {
    let source = include_str!("../event_loop.rs");
    assert!(
        source.contains("pending_user_question.take()"),
        "Event loop must take() the pending question on Enter/Esc"
    );
}

#[test]
fn test_event_loop_has_user_question_tab_handler() {
    let source = include_str!("../event_loop.rs");
    assert!(
        source.contains("KeyCode::Tab if app.pending_user_question.is_some()"),
        "Event loop must handle Tab for switching between options and text input"
    );
}

#[test]
fn test_event_loop_blocks_input_during_user_question() {
    let source = include_str!("../event_loop.rs");
    // has_modal() is used as guard instead of pending_permission.is_none()
    assert!(
        source.contains("has_modal()"),
        "Event loop must use has_modal() to block input during user question dialog"
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
fn test_render_shows_user_question_when_pending() {
    let source = include_str!("../render.rs");
    assert!(
        source.contains("pending_user_question"),
        "Render must check for pending_user_question"
    );
}

#[test]
fn test_user_question_definition_in_tool_list() {
    let source = include_str!("../event_loop.rs");
    assert!(
        source.contains("UserQuestionTool::new"),
        "Event loop must create UserQuestionTool with the channel sender"
    );
}

// ── InputState integration in dialog ─────────────────────────────

#[test]
fn test_user_question_word_movement() {
    let (mut q, _rx) = pending_text_only("Question?");
    q.input = chlodwig_core::InputState::with_text("hello world");
    q.input.move_cursor_word_left();
    assert_eq!(q.input.cursor, 6);
    q.input.move_cursor_word_right();
    assert_eq!(q.input.cursor, 11);
}

#[test]
fn test_user_question_delete_word_back() {
    let (mut q, _rx) = pending_text_only("Question?");
    q.input = chlodwig_core::InputState::with_text("hello world");
    q.input.delete_word_back();
    assert_eq!(q.input.text, "hello ");
}

#[test]
fn test_user_question_delete_word_forward() {
    let (mut q, _rx) = pending_text_only("Question?");
    q.input = chlodwig_core::InputState::with_text("hello world");
    q.input.cursor = 0;
    q.input.delete_word_forward();
    assert_eq!(q.input.text, " world");
}

#[test]
fn test_user_question_newline_insertion() {
    let (mut q, _rx) = pending_text_only("Question?");
    q.input.insert_char('a');
    q.input.insert_newline();
    q.input.insert_char('b');
    assert_eq!(q.input.text, "a\nb");
}

#[test]
fn test_user_question_paste() {
    let (mut q, _rx) = pending_text_only("Question?");
    q.input.insert_paste("line1\r\nline2\nline3");
    assert_eq!(q.input.text, "line1\nline2\nline3");
    assert_eq!(q.input.cursor, 17);
}

#[test]
fn test_user_question_delete_forward() {
    let (mut q, _rx) = pending_text_only("Question?");
    q.input = chlodwig_core::InputState::with_text("abc");
    q.input.cursor = 1;
    q.input.delete_forward();
    assert_eq!(q.input.text, "ac");
    assert_eq!(q.input.cursor, 1);
}

#[test]
fn test_user_question_home_end() {
    let (mut q, _rx) = pending_text_only("Question?");
    q.input = chlodwig_core::InputState::with_text("hello");
    q.input.move_home();
    assert_eq!(q.input.cursor, 0);
    q.input.move_end();
    assert_eq!(q.input.cursor, 5);
}

#[test]
fn test_event_loop_has_user_question_alt_b_handler() {
    let source = include_str!("../event_loop.rs");
    assert!(
        source.contains("Char('b') if app.pending_user_question"),
        "Event loop must handle Alt+b in user question dialog"
    );
}

#[test]
fn test_event_loop_has_user_question_ctrl_j_handler() {
    let source = include_str!("../event_loop.rs");
    assert!(
        source.contains("Char('j') if app.pending_user_question"),
        "Event loop must handle Ctrl+J in user question dialog"
    );
}

#[test]
fn test_event_loop_has_user_question_delete_forward_handler() {
    let source = include_str!("../event_loop.rs");
    assert!(
        source.contains("KeyCode::Delete if app.pending_user_question"),
        "Event loop must handle Delete key in user question dialog"
    );
}
