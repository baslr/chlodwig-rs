//! Tests for table rendering within GTK viewport constraints.
//!
//! The core `render_markdown_with_width()` already handles table column
//! shrinking and cell wrapping. These tests verify:
//! 1. The pure `estimate_monospace_columns()` function correctly converts
//!    pixel width to monospace column count.
//! 2. The GTK code paths pass viewport width to `render_markdown_with_width()`
//!    instead of calling `render_markdown()` (which uses usize::MAX).

use crate::viewport;

// ── estimate_monospace_columns tests ────────────────────────────────

#[test]
fn test_estimate_columns_basic() {
    // 800px widget, 12px left+right margin, 8px char width
    // usable = 800 - 12 - 12 = 776, columns = 776 / 8 = 97
    let cols = viewport::estimate_monospace_columns(800, 12, 12, 8.0);
    assert_eq!(cols, 97);
}

#[test]
fn test_estimate_columns_narrow_widget() {
    // 200px widget, 12px margins, 8px char
    // usable = 200 - 24 = 176, columns = 176 / 8 = 22
    let cols = viewport::estimate_monospace_columns(200, 12, 12, 8.0);
    assert_eq!(cols, 22);
}

#[test]
fn test_estimate_columns_zero_margin() {
    // 400px widget, no margins, 10px char
    let cols = viewport::estimate_monospace_columns(400, 0, 0, 10.0);
    assert_eq!(cols, 40);
}

#[test]
fn test_estimate_columns_minimum_is_20() {
    // Very narrow widget: 50px, 12px margins → usable = 26, 26/8 = 3
    // But we clamp to 20 minimum for usability
    let cols = viewport::estimate_monospace_columns(50, 12, 12, 8.0);
    assert_eq!(cols, 20);
}

#[test]
fn test_estimate_columns_zero_width_returns_minimum() {
    let cols = viewport::estimate_monospace_columns(0, 12, 12, 8.0);
    assert_eq!(cols, 20);
}

#[test]
fn test_estimate_columns_margins_exceed_width_returns_minimum() {
    // margins (30+30=60) > width (40)
    let cols = viewport::estimate_monospace_columns(40, 30, 30, 8.0);
    assert_eq!(cols, 20);
}

#[test]
fn test_estimate_columns_fractional_char_width() {
    // 800px, 12+12 margins, 7.5px char width
    // usable = 776, columns = floor(776 / 7.5) = floor(103.46) = 103
    let cols = viewport::estimate_monospace_columns(800, 12, 12, 7.5);
    assert_eq!(cols, 103);
}

#[test]
fn test_estimate_columns_large_monitor() {
    // 2560px wide widget, 12+12 margins, 8px char
    // usable = 2536, columns = 317
    let cols = viewport::estimate_monospace_columns(2560, 12, 12, 8.0);
    assert_eq!(cols, 317);
}

#[test]
fn test_estimate_columns_zero_char_width_returns_minimum() {
    // Degenerate: 0.0 char width → would be division by zero, return minimum
    let cols = viewport::estimate_monospace_columns(800, 12, 12, 0.0);
    assert_eq!(cols, 20);
}

#[test]
fn test_estimate_columns_negative_char_width_returns_minimum() {
    let cols = viewport::estimate_monospace_columns(800, 12, 12, -5.0);
    assert_eq!(cols, 20);
}

// ── Integration: core render_markdown_with_width works with GTK-sized columns ──

#[test]
fn test_core_table_with_gtk_sized_viewport() {
    // Simulate: 800px widget → ~97 columns
    // A table with long cells should fit within that
    let cols = viewport::estimate_monospace_columns(800, 12, 12, 8.0);
    let md = "| Command | Description |\n|---------|---|\n| `/help` | Show all available commands and keybindings for the application |\n| `/compact` | Compact the conversation history to reduce token usage |";
    let lines = chlodwig_core::render_markdown_with_width(md, cols);
    for (i, line) in lines.iter().enumerate() {
        assert!(
            line.display_width() <= cols,
            "Line {} has width {} > viewport {} columns: {:?}",
            i,
            line.display_width(),
            cols,
            line.text()
        );
    }
}

#[test]
fn test_core_table_narrow_gtk_viewport() {
    // Simulate: 400px widget → ~47 columns
    let cols = viewport::estimate_monospace_columns(400, 12, 12, 8.0);
    let md = "| Key | A very long description that definitely exceeds forty-seven columns when rendered |\n|-----|---|\n| x | y |";
    let lines = chlodwig_core::render_markdown_with_width(md, cols);
    for (i, line) in lines.iter().enumerate() {
        assert!(
            line.display_width() <= cols,
            "Line {} has width {} > viewport {} columns: {:?}",
            i,
            line.display_width(),
            cols,
            line.text()
        );
    }
}
