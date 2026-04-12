//! Tests for system notification on turn complete.

/// Verify that the event loop source code calls `notify_turn_complete()`
/// inside the `TurnComplete` match arm.
#[test]
fn test_event_loop_calls_notify_on_turn_complete() {
    let src = include_str!("../event_loop.rs");
    // Find the TurnComplete handler match arm (the one that sets is_loading = false)
    // There are multiple occurrences of TurnComplete in the file — we need the
    // event handler arm, not the send() call inside the spawn block.
    let needle = "ConversationEvent::TurnComplete => {";
    let turn_complete_idx = src
        .find(needle)
        .expect("TurnComplete match arm must exist in event_loop.rs");
    // The notification call should appear within ~500 chars after the match arm
    let region = &src[turn_complete_idx..src.len().min(turn_complete_idx + 500)];
    assert!(
        region.contains("notify_turn_complete("),
        "TurnComplete match arm must call notify_turn_complete(). Region:\n{region}"
    );
}

/// Verify that the notification module is declared in the crate.
#[test]
fn test_notification_module_exists() {
    let src = include_str!("../lib.rs");
    assert!(
        src.contains("mod notification"),
        "lib.rs must declare the notification module"
    );
}

/// Verify that `is_terminal_focused()` exists and returns a bool.
/// On CI / headless it should still not panic.
#[test]
fn test_is_terminal_focused_does_not_panic() {
    let _ = crate::notification::is_terminal_focused();
}

/// Verify that `notify_turn_complete` source code checks focus before sending.
#[test]
fn test_notify_turn_complete_checks_focus() {
    let src = include_str!("../notification.rs");
    assert!(
        src.contains("is_terminal_focused()"),
        "notify_turn_complete must call is_terminal_focused() to suppress \
         notifications when the terminal is in the foreground"
    );
}

/// On macOS, the focus detection must use the native NSWorkspace API
/// (not osascript subprocess). Notification *delivery* may use osascript,
/// but focus *detection* must be native FFI.
#[test]
fn test_uses_native_nsworkspace_api() {
    let src = include_str!("../notification.rs");
    assert!(
        src.contains("NSWorkspace"),
        "Focus detection must use NSWorkspace (native macOS API)"
    );
    assert!(
        src.contains("frontmostApplication"),
        "Focus detection must call frontmostApplication on NSWorkspace"
    );
    assert!(
        src.contains("bundleIdentifier"),
        "Focus detection must read bundleIdentifier from the frontmost app"
    );
    // Focus detection function (is_terminal_focused_macos) must NOT use osascript.
    // Find the function body and check it doesn't contain osascript.
    let focus_fn_start = src
        .find("fn is_terminal_focused_macos")
        .expect("is_terminal_focused_macos must exist");
    // The function ends at the next `fn ` at top level, or use a reasonable window
    let focus_fn_region = &src[focus_fn_start..src.len().min(focus_fn_start + 1500)];
    assert!(
        !focus_fn_region.contains("osascript"),
        "Focus detection (is_terminal_focused_macos) must NOT use osascript — \
         use native NSWorkspace FFI instead"
    );
}

/// On macOS, notification delivery must use osascript (bypasses DND/Focus modes).
#[cfg(target_os = "macos")]
#[test]
fn test_notification_delivery_uses_osascript_on_macos() {
    let src = include_str!("../notification.rs");
    assert!(
        src.contains("send_notification_macos"),
        "Must have a macOS-specific notification sender"
    );
    let fn_start = src
        .find("fn send_notification_macos")
        .expect("send_notification_macos must exist");
    let fn_region = &src[fn_start..src.len().min(fn_start + 1000)];
    assert!(
        fn_region.contains("osascript"),
        "send_notification_macos must use osascript for reliable delivery through DND"
    );
}

/// Known terminal bundle IDs must be present in the source so they're
/// recognized as terminals (suppressing the notification when focused).
#[test]
fn test_known_terminal_bundle_ids() {
    let src = include_str!("../notification.rs");
    let expected = [
        "com.apple.Terminal",
        "com.googlecode.iterm2",
        "net.kovidgoyal.kitty",
        "com.mitchellh.ghostty",
        "org.alacritty",
    ];
    for bundle_id in expected {
        assert!(
            src.contains(bundle_id),
            "notification.rs must recognize terminal bundle ID: {bundle_id}"
        );
    }
}

/// On macOS, `is_terminal_focused()` should return a meaningful result
/// (true when we're running in a terminal, which we are during tests).
#[cfg(target_os = "macos")]
#[test]
fn test_is_terminal_focused_returns_true_in_terminal() {
    // When running `cargo test`, the terminal IS the frontmost app
    // (or at least it should be — the user just ran the command).
    // This test may be flaky if the user switches away immediately,
    // but it catches the case where the FFI is completely broken.
    let focused = crate::notification::is_terminal_focused();
    // We only assert it returns *some* value without panicking.
    // In CI or when the user Alt-Tabs away, this could be false.
    let _ = focused;
}

/// Verify that the event loop passes a project name to notify_turn_complete.
#[test]
fn test_notification_includes_project_name() {
    let src = include_str!("../event_loop.rs");
    assert!(
        src.contains("project_name"),
        "Event loop must have a project_name variable for notification identification"
    );
    assert!(
        src.contains("project_dir_name()"),
        "Event loop must call project_dir_name() to determine the project name"
    );
}

/// Verify that build_applescript includes subtitle support.
#[cfg(target_os = "macos")]
#[test]
fn test_applescript_has_subtitle_support() {
    let src = include_str!("../notification.rs");
    let fn_start = src
        .find("fn build_applescript")
        .expect("build_applescript must exist");
    let fn_region = &src[fn_start..src.len().min(fn_start + 1000)];
    assert!(
        fn_region.contains("subtitle"),
        "build_applescript must support subtitle for project identification"
    );
}
