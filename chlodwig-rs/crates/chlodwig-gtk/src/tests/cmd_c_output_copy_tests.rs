//! Tests for Cmd+C copying text from the output views.
//!
//! ## Why this exists
//!
//! Both output views (`final_view` and `streaming_view`) have
//! `set_can_focus(false)` (Gotcha #45) — they cannot receive keyboard
//! focus, so when the user presses Cmd+C the only key handler that
//! ever fires belongs to the input view. The original
//! `setup_macos_input_shortcuts()` always copied from the input view's
//! buffer, ignoring any selection the user had made in the output.
//!
//! ## Single-source-of-truth design
//!
//! There is exactly ONE Cmd+C/Cmd+X code path:
//! `setup_macos_input_shortcuts(view, copy_priority)`.
//! `copy_priority` is the ordered list of *additional* views to consult
//! BEFORE falling back to `view`. The AI conversation tab passes
//! `[final_view, streaming_view]`; the user-question dialog passes `&[]`.
//!
//! There is exactly ONE selection-mirror path: `write_selection_to_macos_clipboard`.
//! Both Cmd+C and `connect_copy_clipboard` go through it.
//!
//! Source-grep guards below ensure no parallel implementation appears.

#[test]
fn test_setup_macos_input_shortcuts_takes_copy_priority_slice() {
    // The signature must accept a priority list of TextViews so callers
    // can promote output-view selections above the focused input.
    let src = include_str!("../window.rs");
    assert!(
        src.contains("pub fn setup_macos_input_shortcuts(")
            && src.contains("copy_priority"),
        "window.rs: setup_macos_input_shortcuts must accept a copy_priority \
         parameter (the ordered list of TextViews to check for selection \
         before falling back to the input view)"
    );
}

#[test]
fn test_cmd_c_handler_walks_priority_list_first() {
    // The Cmd+C arm must search copy_priority FIRST, then the input view
    // last — picking the first view with a non-empty selection.
    let src = include_str!("../window.rs");
    // Locate the Cmd+C arm
    let cmd_c_idx = src
        .find("k if k == gtk4::gdk::Key::c || k == gtk4::gdk::Key::C =>")
        .expect("Cmd+C arm must exist in window.rs");
    // The arm body must consult copy_priority before falling back
    let arm_tail = &src[cmd_c_idx..cmd_c_idx + 1500];
    assert!(
        arm_tail.contains("copy_priority"),
        "Cmd+C arm must consult `copy_priority` to find the source view \
         (output views before input)"
    );
    assert!(
        arm_tail.contains("write_selection_to_macos_clipboard"),
        "Cmd+C arm must mirror the selection to NSPasteboard via the \
         single bridge `write_selection_to_macos_clipboard`"
    );
}

#[test]
fn test_ai_conversation_passes_output_views_as_copy_priority() {
    // AI conversation tabs must wire final_view + streaming_view as the
    // copy priority, so user selections in the output take precedence
    // over the (typically empty) input selection.
    let src = include_str!("../tab/ai_conversation.rs");
    let setup_idx = src
        .find("setup_macos_input_shortcuts(")
        .expect("ai_conversation.rs must call setup_macos_input_shortcuts");
    let call = &src[setup_idx..setup_idx + 400];
    assert!(
        call.contains("final_view") && call.contains("streaming_view"),
        "ai_conversation.rs: setup_macos_input_shortcuts(...) must pass \
         BOTH final_view and streaming_view in the copy priority — Cmd+C \
         must work on either output view"
    );
}

#[test]
fn test_user_question_dialog_passes_empty_copy_priority() {
    // The user-question dialog has no separate output view — its single
    // TextView IS the input. Pass an empty priority list.
    let src = include_str!("../window.rs");
    // Find the user-question setup_macos_input_shortcuts call (the one
    // inside show_user_question_dialog, not the helper itself).
    let dialog_section_start = src
        .find("show_user_question_dialog")
        .expect("window.rs must define show_user_question_dialog");
    let dialog_section = &src[dialog_section_start..];
    let setup_idx = dialog_section
        .find("setup_macos_input_shortcuts(")
        .expect("user-question dialog must call setup_macos_input_shortcuts");
    let call = &dialog_section[setup_idx..setup_idx + 200];
    assert!(
        call.contains("&[]"),
        "show_user_question_dialog: setup_macos_input_shortcuts must be \
         called with `&[]` as the copy_priority — the dialog has no \
         output view to consult.\nGot: {}",
        call.lines().next().unwrap_or("")
    );
}

#[test]
fn test_no_parallel_cmd_c_handler_in_ai_conversation() {
    // Cmd+C MUST be handled in exactly one place
    // (`setup_macos_input_shortcuts`). If `ai_conversation.rs` grows its
    // own EventControllerKey for Cmd+C, the SSoT is broken.
    let src = include_str!("../tab/ai_conversation.rs");
    assert!(
        !src.contains("gtk4::gdk::Key::c") && !src.contains("gdk::Key::c"),
        "ai_conversation.rs must NOT contain a Cmd+C key handler — \
         the single handler lives in window::setup_macos_input_shortcuts"
    );
}

#[test]
fn test_only_one_call_to_emit_copy_clipboard_in_window_rs() {
    // After deleting the dead `copy_output_selection()` helper, the
    // ONLY actual call to `source.emit_copy_clipboard()` lives in the
    // unified Cmd+C arm of `setup_macos_input_shortcuts`. Count only
    // real call sites (skip lines whose first non-whitespace is `//`).
    let src = include_str!("../window.rs");
    let count = src
        .lines()
        .filter(|l| !l.trim_start().starts_with("//"))
        .filter(|l| l.contains(".emit_copy_clipboard()"))
        .count();
    assert_eq!(
        count, 1,
        "window.rs: emit_copy_clipboard() must be called from EXACTLY \
         one place (the unified Cmd+C arm). Got {count} call sites."
    );
}
