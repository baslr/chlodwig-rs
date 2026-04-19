//! Tests for the stop/interrupt feature (`/stop`, bare `stop`, double-Esc).
//!
//! The underlying `ConversationState.stop_requested` mechanism is tested in
//! `chlodwig-core/src/conversation.rs`. These source-level tests just verify
//! that the TUI event loop wires up the user-facing triggers.

#[test]
fn test_event_loop_handles_command_stop() {
    let src = include_str!("../event_loop.rs");
    assert!(
        src.contains("Command::Stop"),
        "event_loop.rs must have a match arm for Command::Stop"
    );
    assert!(
        src.contains("stop_flag.store(true"),
        "event_loop.rs must set the stop_flag on Command::Stop"
    );
}

#[test]
fn test_event_loop_has_double_esc_stop_trigger() {
    let src = include_str!("../event_loop.rs");
    assert!(
        src.contains("DOUBLE_ESC_WINDOW"),
        "event_loop.rs must define a DOUBLE_ESC_WINDOW duration for double-Escape detection"
    );
    assert!(
        src.contains("last_esc_at"),
        "event_loop.rs must track last_esc_at for double-Escape detection"
    );
}

#[test]
fn test_event_loop_stop_flag_is_shared_with_conversation_state() {
    let src = include_str!("../event_loop.rs");
    // The stop_flag must be derived from initial_state.stop_requested so
    // setting it actually affects the run_turn loop (which reads
    // state.stop_requested).
    assert!(
        src.contains("initial_state.stop_requested.clone()"),
        "stop_flag must be cloned from initial_state.stop_requested to stay in sync with the background task"
    );
}

#[test]
fn test_command_stop_parses_all_forms() {
    use chlodwig_core::Command;
    assert_eq!(Command::parse("/stop"), Some(Command::Stop));
    assert_eq!(Command::parse("stop"), Some(Command::Stop));
    assert_eq!(Command::parse("STOP"), Some(Command::Stop));
    assert_eq!(Command::parse("Stop"), Some(Command::Stop));
    // Not a command:
    assert_eq!(Command::parse("stop that"), None);
}

#[test]
fn test_interrupt_message_matches_spec() {
    // The user asked for exactly this message text; pin it.
    assert_eq!(
        chlodwig_core::INTERRUPT_MESSAGE,
        "User intentionally interrupted the turn loop."
    );
}
