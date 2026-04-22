//! Regression tests for the "Hide Tools" / "Show Tools" toggle button
//! that lives in the per-tab input row.
//!
//! The button is created in `window.rs` (`UiWidgets::toggle_tool_button`)
//! and packed into the input row, but during the Stage 3/4 refactor of
//! `main.rs` (see `docs/gtk-main-refactoring.md`, Block 7 "Wire up
//! Toggle Tool Usage button") its `connect_clicked` handler was dropped.
//!
//! Result: clicking the button did nothing — `show_tool_usage` stayed
//! at its default `true`, the label never changed, and the output view
//! was never re-rendered.
//!
//! These source-grep tests guard that the wiring lives in `submit.rs`
//! (which already owns the widget bundle, app_state, viewport tracker
//! and final view — natural home; no extra context plumbing needed).

#[test]
fn test_submit_wires_toggle_tool_button_click() {
    let src = include_str!("../submit.rs");
    assert!(
        src.contains("toggle_tool_button") && src.contains("connect_clicked"),
        "submit.rs must wire the toggle_tool_button click handler \
         (regression: lost during main.rs refactor stage 3/4)"
    );
}

#[test]
fn test_toggle_tool_button_handler_flips_show_tool_usage() {
    let src = include_str!("../submit.rs");
    assert!(
        src.contains("show_tool_usage = !"),
        "toggle_tool_button click handler must flip state.show_tool_usage"
    );
}

#[test]
fn test_toggle_tool_button_handler_updates_label() {
    let src = include_str!("../submit.rs");
    // Both labels must appear so the button text reflects current state.
    assert!(
        src.contains("\"Hide Tools\"") && src.contains("\"Show Tools\""),
        "toggle_tool_button click handler must set the button label \
         to either 'Hide Tools' or 'Show Tools' depending on state"
    );
}

#[test]
fn test_toggle_tool_button_handler_rerenders_blocks() {
    let src = include_str!("../submit.rs");
    // After flipping show_tool_usage we must re-render the whole view
    // so already-displayed ToolUseStart / ToolResult blocks appear or
    // disappear immediately (without waiting for the next event).
    assert!(
        src.contains("render_all_blocks_into"),
        "toggle_tool_button click handler must call \
         render::render_all_blocks_into to refresh the view"
    );
}
