//! Tests for system notification logic.
//!
//! The actual GNotification sending requires GTK4 runtime, but we can test
//! the decision logic (when to notify) and the project name derivation
//! without any GTK dependency.

use crate::app_state::AppState;
use chlodwig_core::ConversationEvent;

#[test]
fn test_turn_complete_sets_should_notify_flag() {
    let mut state = AppState::new("test-model".into());
    // Simulate a streaming turn
    state.submit_prompt("hello".into());
    state.handle_event(ConversationEvent::TextDelta("hello".into()));
    assert!(state.is_streaming);
    assert!(!state.should_notify);

    state.handle_event(ConversationEvent::TurnComplete);
    assert!(!state.is_streaming);
    assert!(state.should_notify, "TurnComplete should set should_notify");
}

#[test]
fn test_should_notify_cleared_after_take() {
    let mut state = AppState::new("test-model".into());
    state.handle_event(ConversationEvent::TextDelta("hi".into()));
    state.handle_event(ConversationEvent::TurnComplete);
    assert!(state.should_notify);

    let taken = state.take_should_notify();
    assert!(taken, "take_should_notify should return true");
    assert!(
        !state.should_notify,
        "should_notify must be false after take"
    );
}

#[test]
fn test_should_notify_false_when_no_turn_complete() {
    let mut state = AppState::new("test-model".into());
    state.handle_event(ConversationEvent::TextDelta("hello".into()));
    assert!(!state.should_notify);
}

#[test]
fn test_should_notify_false_after_error() {
    let mut state = AppState::new("test-model".into());
    state.handle_event(ConversationEvent::TextDelta("hi".into()));
    state.handle_event(ConversationEvent::Error("boom".into()));
    assert!(
        !state.should_notify,
        "Error should not trigger notification"
    );
}

#[test]
fn test_should_notify_resets_on_new_turn() {
    let mut state = AppState::new("test-model".into());
    state.handle_event(ConversationEvent::TextDelta("hi".into()));
    state.handle_event(ConversationEvent::TurnComplete);
    assert!(state.should_notify);

    // Start a new turn — should_notify should be reset
    state.handle_event(ConversationEvent::TextDelta("new turn".into()));
    assert!(
        !state.should_notify,
        "new TextDelta should clear should_notify from previous turn"
    );
}

#[test]
fn test_clear_resets_should_notify() {
    let mut state = AppState::new("test-model".into());
    state.handle_event(ConversationEvent::TextDelta("hi".into()));
    state.handle_event(ConversationEvent::TurnComplete);
    assert!(state.should_notify);

    state.clear();
    assert!(
        !state.should_notify,
        "clear() should reset should_notify"
    );
}

#[test]
fn test_project_dir_name_returns_non_empty() {
    let name = crate::app_state::project_dir_name();
    assert!(!name.is_empty(), "project_dir_name() must not be empty");
}

#[test]
fn test_project_dir_name_no_slashes() {
    let name = crate::app_state::project_dir_name();
    assert!(
        !name.contains('/'),
        "project_dir_name() should be just the directory name, not a path: {name}"
    );
}

#[cfg(target_os = "macos")]
mod macos_native {
    #[test]
    fn test_native_notification_module_exists() {
        let _send: fn(&str, &str, &str) = crate::notification::send_native_notification;
        let _request: fn() = crate::notification::request_notification_permission;
        let _check: fn() -> bool = crate::notification::has_app_bundle;
    }

    #[test]
    fn test_has_app_bundle_false_in_cargo_test() {
        // cargo test runs as a bare binary, not a .app bundle.
        assert!(
            !crate::notification::has_app_bundle(),
            "cargo test should not have an app bundle"
        );
    }

    #[test]
    fn test_request_permission_without_bundle_is_noop() {
        // No bundle → early return, no crash.
        crate::notification::request_notification_permission();
    }

    #[test]
    fn test_send_notification_without_bundle_is_noop() {
        // No bundle → early return, no crash.
        crate::notification::send_native_notification("Test", "body", "sub");
    }
}
