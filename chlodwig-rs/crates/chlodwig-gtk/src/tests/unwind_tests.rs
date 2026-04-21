//! Tests for `AppState::unwind_to_messages` and the `BackgroundCommand::Unwind`
//! channel wiring used by the `/unwind` slash-command in the GTK frontend.
//!
//! The pure reducer (`chlodwig_core::reducers::unwind_messages`) is tested
//! in core. These tests guard the GTK-side invariants that `/unwind` MUST
//! NOT regress to /clear semantics:
//!
//! - Session counters (input/output tokens, turn_count, request_count) stay.
//! - `session_name` stays.
//! - `blocks`, `tables`, `tool_id_to_info`, streaming buffer get rebuilt.

use crate::app_state::{AppState, DisplayBlock};
use chlodwig_core::{ContentBlock, Message, Role};

fn user_msg(t: &str) -> Message {
    Message {
        role: Role::User,
        content: vec![ContentBlock::Text { text: t.into() }],
    }
}
fn assistant_msg(t: &str) -> Message {
    Message {
        role: Role::Assistant,
        content: vec![ContentBlock::Text { text: t.into() }],
    }
}

fn state_mid_session() -> AppState {
    let mut state = AppState::new("test-model".into());
    state.input_tokens = 12_345;
    state.output_tokens = 6_789;
    state.turn_count = 7;
    state.request_count = 11;
    state.stream_chunks = 200;
    state.session_name = Some("my refactor".into());
    state.blocks.push(DisplayBlock::UserMessage("old".into()));
    state.blocks.push(DisplayBlock::AssistantText("old reply".into()));
    state.streaming_buffer = "partial token...".into();
    state.is_streaming = true;
    state.streaming_dirty = true;
    state
}

#[test]
fn test_unwind_preserves_token_counters() {
    let mut state = state_mid_session();
    state.unwind_to_messages(&[user_msg("kept")]);
    assert_eq!(state.input_tokens, 12_345);
    assert_eq!(state.output_tokens, 6_789);
}

#[test]
fn test_unwind_preserves_turn_and_request_counters() {
    let mut state = state_mid_session();
    state.unwind_to_messages(&[user_msg("kept")]);
    assert_eq!(state.turn_count, 7);
    assert_eq!(state.request_count, 11);
}

#[test]
fn test_unwind_preserves_session_name() {
    let mut state = state_mid_session();
    state.unwind_to_messages(&[user_msg("kept")]);
    assert_eq!(state.session_name.as_deref(), Some("my refactor"));
}

#[test]
fn test_unwind_preserves_stream_chunks_counter() {
    // stream_chunks is a session-wide counter, NOT a streaming-buffer
    // signal. /clear resets it; /unwind must not.
    let mut state = state_mid_session();
    state.unwind_to_messages(&[user_msg("kept")]);
    assert_eq!(state.stream_chunks, 200);
}

#[test]
fn test_unwind_clears_streaming_buffer_and_flag() {
    let mut state = state_mid_session();
    assert!(!state.streaming_buffer.is_empty(), "test setup");
    assert!(state.is_streaming, "test setup");

    state.unwind_to_messages(&[user_msg("kept")]);

    assert!(state.streaming_buffer.is_empty());
    assert!(!state.is_streaming);
    assert!(!state.streaming_dirty);
}

#[test]
fn test_unwind_rebuilds_blocks_from_remaining_messages() {
    let mut state = state_mid_session();
    let remaining = vec![user_msg("first kept"), assistant_msg("first reply")];

    state.unwind_to_messages(&remaining);

    assert_eq!(state.blocks.len(), 2);
    match &state.blocks[0] {
        DisplayBlock::UserMessage(t) => assert_eq!(t, "first kept"),
        other => panic!("expected UserMessage, got {other:?}"),
    }
    match &state.blocks[1] {
        DisplayBlock::AssistantText(t) => assert_eq!(t, "first reply"),
        other => panic!("expected AssistantText, got {other:?}"),
    }
}

#[test]
fn test_unwind_with_empty_remaining_clears_blocks_but_keeps_identity() {
    let mut state = state_mid_session();
    state.unwind_to_messages(&[]);
    assert!(state.blocks.is_empty());
    // Session identity preserved.
    assert_eq!(state.session_name.as_deref(), Some("my refactor"));
    assert_eq!(state.input_tokens, 12_345);
}

// ── Source-grep guards ─────────────────────────────────────────────

#[test]
fn test_submit_unwind_uses_unwind_to_messages_not_clear() {
    // Regression guard: /unwind MUST NOT call state.clear() — that would
    // wipe counters and session_name. There must be a dedicated
    // unwind_to_messages call instead.
    let src = include_str!("../submit.rs");
    let unwind_branch_start = src
        .find("Command::Unwind")
        .expect("Command::Unwind branch must exist in submit.rs");
    let after = &src[unwind_branch_start..];
    let next_arm = after[1..]
        .find("                Command::")
        .map(|p| p + 1)
        .unwrap_or(after.len());
    let branch = &after[..next_arm];

    assert!(
        !branch.contains("state.clear()"),
        "Unwind branch must NOT call state.clear() — it would wipe \
         counters/session_name. Use unwind_to_messages() instead.\n\
         Branch source:\n{branch}"
    );
    assert!(
        branch.contains("unwind_to_messages"),
        "Unwind branch must call AppState::unwind_to_messages"
    );
}

#[test]
fn test_submit_unwind_uses_oneshot_for_round_trip_to_background() {
    let src = include_str!("../submit.rs");
    assert!(
        src.contains("BackgroundCommand::Unwind"),
        "submit.rs must dispatch BackgroundCommand::Unwind"
    );
    assert!(
        src.contains("oneshot::channel"),
        "submit.rs must use oneshot for the Unwind ack — the background \
         task owns ConversationState.messages"
    );
}

#[test]
fn test_background_task_calls_core_reducer_for_unwind() {
    let src = include_str!("../tab/ai_conversation.rs");
    assert!(
        src.contains("BackgroundCommand::Unwind"),
        "ai_conversation.rs must handle BackgroundCommand::Unwind"
    );
    assert!(
        src.contains("reducers::unwind_messages"),
        "ai_conversation.rs must call chlodwig_core::reducers::unwind_messages \
         (single source of truth)"
    );
}

#[test]
fn test_submit_unwind_does_not_refresh_tab_title() {
    // /unwind MUST NOT touch the tab title — session_name is preserved,
    // so the title is already correct. Refreshing was a remnant of the
    // initial implementation that incorrectly called state.clear().
    let src = include_str!("../submit.rs");
    let unwind_branch_start = src
        .find("Command::Unwind")
        .expect("Command::Unwind branch must exist in submit.rs");
    let after = &src[unwind_branch_start..];
    let next_arm = after[1..]
        .find("                Command::")
        .map(|p| p + 1)
        .unwrap_or(after.len());
    let branch = &after[..next_arm];

    assert!(
        !branch.contains("refresh_tab_title"),
        "Unwind branch must NOT refresh the tab title — session_name \
         is preserved by unwind_to_messages, so the title is already correct"
    );
}
