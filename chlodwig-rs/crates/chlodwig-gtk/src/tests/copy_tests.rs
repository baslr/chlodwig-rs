//! Tests for clipboard / copy functionality — GTK-independent logic tests.

use crate::app_state::AppState;

// ── copy_feedback tests ──────────────────────────────────────────────

#[test]
fn test_copy_feedback_initially_none() {
    let state = AppState::new("m".into());
    assert!(state.copy_feedback.is_none());
}

#[test]
fn test_set_copy_feedback_stores_message() {
    let mut state = AppState::new("m".into());
    state.set_copy_feedback("Copied!");
    assert_eq!(state.copy_feedback.as_deref(), Some("Copied!"));
}

#[test]
fn test_copy_feedback_cleared_by_take() {
    let mut state = AppState::new("m".into());
    state.set_copy_feedback("Copied!");
    let msg = state.take_copy_feedback();
    assert_eq!(msg.as_deref(), Some("Copied!"));
    // After taking, it's gone
    assert!(state.copy_feedback.is_none());
}

#[test]
fn test_copy_feedback_take_returns_none_when_empty() {
    let mut state = AppState::new("m".into());
    assert!(state.take_copy_feedback().is_none());
}

#[test]
fn test_clear_resets_copy_feedback() {
    let mut state = AppState::new("m".into());
    state.set_copy_feedback("Copied!");
    state.clear();
    assert!(state.copy_feedback.is_none());
}
