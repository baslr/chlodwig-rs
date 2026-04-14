//! Tests for live Markdown streaming behavior.
//!
//! When TextDelta events arrive, the GUI should incrementally re-render
//! the streaming buffer as Markdown — NOT wait until TextComplete.
//! The re-render happens once per tick (16ms), not per delta.

use crate::app_state::{AppState, DisplayBlock};
use chlodwig_core::ConversationEvent;

#[test]
fn test_streaming_buffer_accumulates_deltas() {
    let mut state = AppState::new("m".into());
    state.handle_event(ConversationEvent::TextDelta("Hello ".into()));
    state.handle_event(ConversationEvent::TextDelta("**world**".into()));
    // streaming_buffer holds the full accumulated text
    assert_eq!(state.streaming_buffer, "Hello **world**");
    // No completed block yet
    assert!(state.blocks.is_empty());
}

#[test]
fn test_streaming_dirty_flag_set_by_delta() {
    let mut state = AppState::new("m".into());
    assert!(!state.streaming_dirty);
    state.handle_event(ConversationEvent::TextDelta("x".into()));
    assert!(state.streaming_dirty);
}

#[test]
fn test_streaming_dirty_cleared_after_acknowledge() {
    let mut state = AppState::new("m".into());
    state.handle_event(ConversationEvent::TextDelta("x".into()));
    assert!(state.streaming_dirty);
    state.acknowledge_streaming_render();
    assert!(!state.streaming_dirty);
    // Buffer is still there (not cleared — that only happens on TextComplete)
    assert_eq!(state.streaming_buffer, "x");
}

#[test]
fn test_text_complete_clears_dirty_and_buffer() {
    let mut state = AppState::new("m".into());
    state.handle_event(ConversationEvent::TextDelta("partial".into()));
    assert!(state.streaming_dirty);
    state.handle_event(ConversationEvent::TextComplete("full".into()));
    assert!(!state.streaming_dirty);
    assert!(state.streaming_buffer.is_empty());
    // Block was created
    assert_eq!(state.blocks.len(), 1);
    assert!(matches!(&state.blocks[0], DisplayBlock::AssistantText(t) if t == "full"));
}

#[test]
fn test_multiple_deltas_single_dirty() {
    // Multiple deltas in one tick → dirty is set, but only needs one re-render
    let mut state = AppState::new("m".into());
    state.handle_event(ConversationEvent::TextDelta("a".into()));
    state.handle_event(ConversationEvent::TextDelta("b".into()));
    state.handle_event(ConversationEvent::TextDelta("c".into()));
    assert!(state.streaming_dirty);
    assert_eq!(state.streaming_buffer, "abc");
    // Acknowledge once
    state.acknowledge_streaming_render();
    assert!(!state.streaming_dirty);
}

#[test]
fn test_clear_resets_streaming_dirty() {
    let mut state = AppState::new("m".into());
    state.handle_event(ConversationEvent::TextDelta("x".into()));
    assert!(state.streaming_dirty);
    state.clear();
    assert!(!state.streaming_dirty);
}
