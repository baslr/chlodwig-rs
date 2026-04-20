//! Tests for the stop/interrupt feature in the GTK UI.
//!
//! Core logic is tested in `chlodwig-core/src/conversation.rs`
//! (`test_stop_requested_cancels_pending_tools_and_injects_interrupt_message`
//! et al.). These source-level tests verify the GTK wiring.

#[test]
fn test_submit_handles_command_stop() {
    let src = include_str!("../submit.rs");
    assert!(
        src.contains("Command::Stop"),
        "submit.rs must have a match arm for Command::Stop"
    );
    assert!(
        src.contains("stop_flag_for_submit"),
        "submit.rs must capture stop_flag_for_submit to trigger a stop"
    );
    assert!(
        src.contains(".store(true"),
        "submit.rs must set the stop_flag via .store(true, ...) on Command::Stop"
    );
}

#[test]
fn test_submit_context_has_stop_flag_field() {
    let src = include_str!("../submit.rs");
    assert!(
        src.contains("pub stop_flag:"),
        "SubmitContext must have a pub stop_flag field"
    );
}

#[test]
fn test_submit_wires_double_esc() {
    let src = include_str!("../submit.rs");
    assert!(
        src.contains("DOUBLE_ESC_WINDOW"),
        "submit.rs must define DOUBLE_ESC_WINDOW for double-Escape stop"
    );
    assert!(
        src.contains("gtk4::gdk::Key::Escape"),
        "submit.rs must attach an EventControllerKey that watches Escape"
    );
}

#[test]
fn test_main_rs_shares_stop_flag_with_background() {
    // Stage B: stop_flag is created PER TAB in `tab::attach_new_tab` and
    // shared between the per-tab background task and the per-tab
    // SubmitContext. The same SSoT invariant holds; only the location
    // changed from main.rs to tab.rs.
    let src = include_str!("../tab/ai_conversation.rs");
    assert!(
        src.contains("let stop_flag") && src.contains("new_stop_flag()"),
        "tab.rs must create a per-tab stop_flag via chlodwig_core::new_stop_flag()"
    );
    assert!(
        src.contains("stop_requested: stop_flag.clone()"),
        "conv_state.stop_requested must be the shared per-tab flag (not a fresh one)"
    );
    assert!(
        src.contains("stop_flag: stop_flag.clone()"),
        "SubmitContext must receive the shared per-tab flag"
    );
}

#[test]
fn test_command_stop_is_known_to_core() {
    use chlodwig_core::Command;
    assert_eq!(Command::parse("/stop"), Some(Command::Stop));
    assert_eq!(Command::parse("stop"), Some(Command::Stop));
    assert_eq!(Command::parse("STOP"), Some(Command::Stop));
}
