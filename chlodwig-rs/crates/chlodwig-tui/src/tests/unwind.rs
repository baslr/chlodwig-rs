//! Tests for `App::unwind_to_messages` — the display-only mutation
//! invoked by the `/unwind` command after the core reducer has
//! shortened `ConversationState.messages`.
//!
//! The core reducer (`chlodwig_core::reducers::unwind_messages`) is unit-
//! tested in core. These tests guard the TUI-side invariants that
//! `/unwind` MUST NOT regress to /clear semantics:
//!
//! - Session counters (tx/rx tokens, turn_count, request_count) stay.
//! - `session_name` stays.
//! - `compaction_count` stays.
//! - `context_start` (timer) stays.
//! - `display_blocks` rebuilt from the new tail.
//! - `streaming_buffer`, `is_loading`, `scroll`, `auto_scroll` reset.

use super::*;
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

/// Build an App that looks like it has been running for a while:
/// counters bumped, session_name set, scrolled up, streaming a token.
fn app_mid_session() -> App {
    let mut app = App::new("test-model".into());
    app.total_input_tokens = 12_345;
    app.total_output_tokens = 6_789;
    app.turn_count = 7;
    app.api_request_count = 11;
    app.compaction_count = 2;
    app.session_name = Some("my refactor".into());
    app.display_blocks
        .push(DisplayBlock::UserMessage("old prompt".into()));
    app.display_blocks
        .push(DisplayBlock::AssistantText("old reply".into()));
    app.streaming_buffer = "partial token...".into();
    app.is_loading = true;
    app.mark_dirty();
    app.rebuild_lines();
    app
}

#[test]
fn test_unwind_preserves_total_token_counters() {
    let mut app = app_mid_session();
    let tx_before = app.total_input_tokens;
    let rx_before = app.total_output_tokens;

    app.unwind_to_messages(&[user_msg("kept prompt")]);

    assert_eq!(
        app.total_input_tokens, tx_before,
        "tx token counter must NOT reset on /unwind (session continues)"
    );
    assert_eq!(
        app.total_output_tokens, rx_before,
        "rx token counter must NOT reset on /unwind (session continues)"
    );
}

#[test]
fn test_unwind_preserves_turn_and_request_counters() {
    let mut app = app_mid_session();
    let turns_before = app.turn_count;
    let reqs_before = app.api_request_count;

    app.unwind_to_messages(&[user_msg("kept")]);

    assert_eq!(app.turn_count, turns_before);
    assert_eq!(app.api_request_count, reqs_before);
}

#[test]
fn test_unwind_preserves_session_name() {
    let mut app = app_mid_session();
    app.unwind_to_messages(&[user_msg("kept")]);
    assert_eq!(app.session_name.as_deref(), Some("my refactor"));
}

#[test]
fn test_unwind_preserves_compaction_count() {
    let mut app = app_mid_session();
    app.unwind_to_messages(&[user_msg("kept")]);
    assert_eq!(app.compaction_count, 2);
}

#[test]
fn test_unwind_rebuilds_display_blocks_from_remaining_messages() {
    let mut app = app_mid_session();
    let remaining = vec![
        user_msg("first kept"),
        assistant_msg("first reply"),
    ];

    app.unwind_to_messages(&remaining);

    // Old "old prompt"/"old reply" blocks are gone; new blocks reflect
    // the supplied tail.
    assert_eq!(app.display_blocks.len(), 2);
    match &app.display_blocks[0] {
        DisplayBlock::UserMessage(t) => assert_eq!(t, "first kept"),
        other => panic!("expected UserMessage, got {other:?}"),
    }
    match &app.display_blocks[1] {
        DisplayBlock::AssistantText(t) => assert_eq!(t, "first reply"),
        other => panic!("expected AssistantText, got {other:?}"),
    }
}

#[test]
fn test_unwind_clears_streaming_buffer_and_loading_state() {
    let mut app = app_mid_session();
    assert!(!app.streaming_buffer.is_empty(), "test setup");
    assert!(app.is_loading, "test setup");

    app.unwind_to_messages(&[user_msg("kept")]);

    assert!(app.streaming_buffer.is_empty());
    assert!(!app.is_loading);
}

#[test]
fn test_unwind_resets_scroll_and_re_enables_auto_scroll() {
    let mut app = app_with_lines(100);
    app.scroll_up(50);
    assert!(!app.auto_scroll.is_active(), "test setup");

    app.unwind_to_messages(&[user_msg("kept")]);

    assert_eq!(app.scroll, 0);
    assert!(app.auto_scroll.is_active());
}

#[test]
fn test_unwind_does_not_push_a_clear_confirmation_block() {
    // /clear pushes "Conversation cleared." — /unwind must NOT.
    // The event_loop is in charge of pushing the unwind confirmation,
    // so unwind_to_messages itself must not inject anything.
    let mut app = app_mid_session();
    app.unwind_to_messages(&[user_msg("kept")]);

    let has_clear_msg = app.display_blocks.iter().any(|b| {
        matches!(b, DisplayBlock::SystemMessage(s) if s.contains("cleared"))
    });
    assert!(!has_clear_msg, "unwind must not push a /clear-style banner");
}

#[test]
fn test_unwind_with_empty_remaining_yields_empty_display() {
    let mut app = app_mid_session();
    app.unwind_to_messages(&[]);
    assert!(app.display_blocks.is_empty());
    // But session identity stays.
    assert_eq!(app.session_name.as_deref(), Some("my refactor"));
}

#[test]
fn test_unwind_rebuilds_rendered_lines_eagerly() {
    // After unwind, rendered_lines must reflect the new content
    // immediately (event_loop relies on this for the next render).
    let mut app = app_mid_session();
    app.unwind_to_messages(&[user_msg("a single short message")]);
    assert!(!app.lines_dirty, "unwind_to_messages must rebuild lines");
    assert!(
        !app.rendered_lines.is_empty(),
        "rendered lines must be present after rebuild"
    );
}

// ── Source-grep guards (event-loop wiring) ──────────────────────────

#[test]
fn test_event_loop_handles_unwind_command() {
    let src = include_str!("../event_loop.rs");
    assert!(
        src.contains("Command::Unwind"),
        "event_loop.rs must handle Command::Unwind"
    );
}

#[test]
fn test_event_loop_unwind_uses_core_reducer() {
    let src = include_str!("../event_loop.rs");
    assert!(
        src.contains("reducers::unwind_messages"),
        "event_loop.rs must call chlodwig_core::reducers::unwind_messages \
         (single source of truth — never inline the unwind logic)"
    );
}

#[test]
fn test_event_loop_unwind_does_not_call_clear_conversation() {
    // Regression guard: /unwind MUST NOT use /clear's helper, which
    // would wipe session counters, session_name, and timers. There must
    // be a dedicated `unwind_to_messages` call instead.
    let src = include_str!("../event_loop.rs");
    let unwind_branch_start = src
        .find("Command::Unwind")
        .expect("Command::Unwind branch must exist");
    // Find the next Command:: arm (or end of match) to bound the branch.
    let after = &src[unwind_branch_start..];
    let next_arm = after[1..]
        .find("                                Command::")
        .map(|p| p + 1)
        .unwrap_or(after.len());
    let branch = &after[..next_arm];

    assert!(
        !branch.contains("clear_conversation()"),
        "Unwind branch must NOT call clear_conversation() — it would \
         wipe session counters. Use unwind_to_messages() instead.\n\
         Branch source:\n{branch}"
    );
    assert!(
        branch.contains("unwind_to_messages"),
        "Unwind branch must call app.unwind_to_messages(&remaining)"
    );
}
