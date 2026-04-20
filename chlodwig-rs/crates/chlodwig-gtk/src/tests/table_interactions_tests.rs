//! Tests for the table interaction wiring (header sort + row hover).
//!
//! Stage 2 of the GTK main.rs refactor (see docs/gtk-main-refactoring.md).
//! Header-click sort and row-hover highlight live in `table_interactions.rs`.
//! `main.rs` only calls `table_interactions::wire(...)`.

#[test]
fn test_table_interactions_module_exists() {
    let src = include_str!("../table_interactions.rs");
    assert!(
        src.contains("pub fn wire"),
        "table_interactions.rs must export a wire() function"
    );
}

#[test]
fn test_main_rs_calls_wire_table_interactions() {
    // Stage B: per-tab wiring lives in tab.rs.
    let src = include_str!("../tab/ai_conversation.rs");
    assert!(
        src.contains("table_interactions::wire"),
        "tab.rs (per-tab wiring SSoT) must delegate to table_interactions::wire"
    );
}

#[test]
fn test_main_rs_has_no_inline_table_sort_block() {
    let src = include_str!("../main.rs");
    assert!(
        !src.contains("// --- Table header click: sort table by clicked column ---"),
        "main.rs must not have the inline table-sort comment block — moved to table_interactions.rs"
    );
    assert!(
        !src.contains("// --- Table row highlight on hover ---"),
        "main.rs must not have the inline table-row-hover comment block — moved to table_interactions.rs"
    );
}

#[test]
fn test_table_interactions_handles_header_click_sort() {
    let src = include_str!("../table_interactions.rs");
    assert!(
        src.contains("table_sort:"),
        "table_interactions.rs must handle table_sort:G:C tag prefix"
    );
    assert!(
        src.contains("sort_table"),
        "table_interactions.rs must call AppState::sort_table on click"
    );
    assert!(
        src.contains("rerender_table_in_place"),
        "table_interactions.rs must re-render the sorted table in place"
    );
}

#[test]
fn test_table_interactions_handles_row_hover_highlight() {
    let src = include_str!("../table_interactions.rs");
    assert!(
        src.contains("table_row_highlight"),
        "table_interactions.rs must define and apply the table_row_highlight tag"
    );
    assert!(
        src.contains("EventControllerMotion"),
        "table_interactions.rs must use EventControllerMotion for hover detection"
    );
    assert!(
        src.contains('│'),
        "table_interactions.rs must check for the table border char │ when detecting data rows"
    );
}

#[test]
fn test_table_interactions_left_button_only() {
    let src = include_str!("../table_interactions.rs");
    assert!(
        src.contains("set_button(1)"),
        "table_interactions.rs must restrict header-click to left mouse button"
    );
}

#[test]
fn test_table_interactions_saves_session_after_sort() {
    let src = include_str!("../table_interactions.rs");
    assert!(
        src.contains("BackgroundCommand::SaveSession"),
        "table_interactions.rs must persist the new sort state via SaveSession"
    );
}
