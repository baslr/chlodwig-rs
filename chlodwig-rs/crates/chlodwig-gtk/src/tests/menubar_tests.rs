//! Tests for macOS native menu bar integration.
//!
//! After the menu was extracted from `main.rs` into `menu.rs`, these tests
//! check the new module instead. The `setup_menu()` function is the public
//! entry point — `main.rs` only calls it.

/// The menu bar definition lives in `menu.rs`, not `main.rs`.
#[test]
fn test_menu_module_exists() {
    let src = include_str!("../menu.rs");
    assert!(
        src.contains("pub fn setup_menu"),
        "menu.rs must export a setup_menu() function"
    );
}

/// `main.rs` must call `menu::setup_menu(...)` — not build the menu inline.
#[test]
fn test_main_rs_calls_setup_menu() {
    let src = include_str!("../main.rs");
    assert!(
        src.contains("menu::setup_menu") || src.contains("crate::menu::setup_menu"),
        "main.rs must delegate menu construction to menu::setup_menu"
    );
}

/// `main.rs` must NOT build the menu inline anymore.
#[test]
fn test_main_rs_no_inline_menu_construction() {
    let src = include_str!("../main.rs");
    assert!(
        !src.contains("set_menubar(Some(&menubar))"),
        "main.rs must not call set_menubar inline — moved to menu.rs"
    );
}

/// Verify that menu.rs builds a menu bar with a "File" section.
#[test]
fn test_menu_has_file_menu() {
    let src = include_str!("../menu.rs");
    assert!(
        src.contains("\"File\"") || src.contains("\"_File\""),
        "menu.rs must have a File menu section"
    );
}

/// Verify that menu.rs has a "Conversation" menu section.
#[test]
fn test_menu_has_conversation_menu() {
    let src = include_str!("../menu.rs");
    assert!(
        src.contains("\"Conversation\""),
        "menu.rs must have a Conversation menu section"
    );
}

/// Verify that menu.rs sets the menubar on the application.
#[test]
fn test_menu_sets_menubar() {
    let src = include_str!("../menu.rs");
    assert!(
        src.contains("set_menubar"),
        "menu.rs must call set_menubar to install the native menu"
    );
}

/// Verify that "New Conversation" action is registered in menu.rs.
#[test]
fn test_menu_has_new_conversation_action() {
    let src = include_str!("../menu.rs");
    assert!(
        src.contains("new-conversation") || src.contains("new_conversation"),
        "menu.rs must register a new-conversation action"
    );
}

/// Verify that "Compact" action is registered in menu.rs.
#[test]
fn test_menu_has_compact_action() {
    let src = include_str!("../menu.rs");
    assert!(
        src.contains("compact"),
        "menu.rs must register a compact action"
    );
}

/// Verify Cmd+N accelerator for new conversation lives in menu.rs.
#[test]
fn test_menu_has_cmd_n_accelerator() {
    let src = include_str!("../menu.rs");
    assert!(
        src.contains("<Meta>n"),
        "menu.rs must bind Cmd+N to new-conversation"
    );
}

/// Verify the Window menu (Cmd+M minimize, Cmd+H hide, Shift+Cmd+H show)
/// lives in menu.rs.
#[test]
fn test_menu_has_window_menu_actions() {
    let src = include_str!("../menu.rs");
    assert!(src.contains("\"Window\""), "menu.rs must have a Window menu");
    assert!(src.contains("<Meta>m"), "menu.rs must bind Cmd+M to minimize");
    assert!(src.contains("<Meta>h"), "menu.rs must bind Cmd+H to hide");
    assert!(src.contains("<Shift><Meta>h"), "menu.rs must bind Shift+Cmd+H to show");
}

/// Verify the Sessions browser action lives in menu.rs.
#[test]
fn test_menu_has_sessions_browser_action() {
    let src = include_str!("../menu.rs");
    assert!(
        src.contains("sessions-browser"),
        "menu.rs must register a sessions-browser action"
    );
}

/// Verify the Resume action lives in menu.rs.
#[test]
fn test_menu_has_resume_action() {
    let src = include_str!("../menu.rs");
    assert!(
        src.contains("\"resume\"") || src.contains("Resume"),
        "menu.rs must register a resume action"
    );
}
