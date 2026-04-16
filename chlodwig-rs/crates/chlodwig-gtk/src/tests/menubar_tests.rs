//! Tests for macOS native menu bar integration.

/// Verify that main.rs builds a menu bar with a "File" section.
#[test]
fn test_main_rs_has_file_menu() {
    let src = include_str!("../main.rs");
    assert!(
        src.contains("\"File\"") || src.contains("\"_File\""),
        "main.rs must have a File menu section"
    );
}

/// Verify that main.rs has a "Conversation" or "Edit" menu section.
#[test]
fn test_main_rs_has_conversation_menu() {
    let src = include_str!("../main.rs");
    assert!(
        src.contains("\"Conversation\""),
        "main.rs must have a Conversation menu section"
    );
}

/// Verify that main.rs sets the menubar on the application.
#[test]
fn test_main_rs_sets_menubar() {
    let src = include_str!("../main.rs");
    assert!(
        src.contains("set_menubar"),
        "main.rs must call set_menubar to install the native menu"
    );
}

/// Verify that "New Conversation" action is registered.
#[test]
fn test_main_rs_has_new_conversation_action() {
    let src = include_str!("../main.rs");
    assert!(
        src.contains("new-conversation") || src.contains("new_conversation"),
        "main.rs must register a new-conversation action"
    );
}

/// Verify that "Compact" action is registered.
#[test]
fn test_main_rs_has_compact_action() {
    let src = include_str!("../main.rs");
    assert!(
        src.contains("compact"),
        "main.rs must register a compact action"
    );
}

/// Verify Cmd+N accelerator for new conversation.
#[test]
fn test_main_rs_has_cmd_n_accelerator() {
    let src = include_str!("../main.rs");
    assert!(
        src.contains("<Meta>n"),
        "main.rs must bind Cmd+N to new-conversation"
    );
}
