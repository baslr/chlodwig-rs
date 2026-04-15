//! Tests for the startup CWD display in the GTK app.

use crate::app_state::startup_cwd_message;

#[test]
fn test_startup_cwd_message_contains_cwd() {
    let msg = startup_cwd_message();
    let cwd = std::env::current_dir()
        .map(|p| p.display().to_string())
        .unwrap_or_default();
    assert!(
        msg.contains(&cwd),
        "startup_cwd_message() should contain CWD '{cwd}', got: {msg}"
    );
}

#[test]
fn test_startup_cwd_message_has_label() {
    let msg = startup_cwd_message();
    assert!(
        msg.contains("cwd"),
        "startup_cwd_message() should contain 'cwd' label, got: {msg}"
    );
}

#[test]
fn test_startup_cwd_message_is_not_empty() {
    let msg = startup_cwd_message();
    assert!(!msg.is_empty(), "startup_cwd_message() must not be empty");
}

/// Verify that the GTK main.rs calls startup_cwd_message() at startup.
#[test]
fn test_main_rs_calls_startup_cwd_message() {
    let src = include_str!("../main.rs");
    assert!(
        src.contains("startup_cwd_message"),
        "main.rs must call startup_cwd_message() at startup to show the project directory"
    );
}
