//! Tests for Cmd+Q quit shortcut in the GTK app.

/// Verify that main.rs registers a "quit" action on the application.
#[test]
fn test_main_rs_has_quit_action() {
    let src = include_str!("../main.rs");
    assert!(
        src.contains("add_action") && src.contains("quit"),
        "main.rs must register a 'quit' action on the application"
    );
}

/// Verify that main.rs sets the Cmd+Q accelerator for the quit action.
#[test]
fn test_main_rs_has_cmd_q_accelerator() {
    let src = include_str!("../main.rs");
    assert!(
        src.contains("set_accels_for_action") && src.contains("<Meta>q"),
        "main.rs must bind <Meta>q (Cmd+Q) to the quit action"
    );
}
