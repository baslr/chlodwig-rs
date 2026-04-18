//! Tests for the unified Markdown render path.
//!
//! Background: there used to be TWO functions rendering `&[StyledLine]` into a
//! `gtk4::TextBuffer`:
//!   - `md_renderer::append_styled_lines()` — handled fenced code blocks via
//!     syntect, but knew nothing about table-header sort tags.
//!   - `render::append_styled_lines_with_table_headers()` — handled table-header
//!     sort tags but **ignored** `code_info` on `StyledLine`, so fenced code
//!     blocks in AssistantText were rendered without syntax highlighting.
//!
//! Symptom: a "```rust\n…```" code block streamed in colored, then on
//! `TextComplete` the GTK buffer was wiped and re-rendered through the
//! table-aware function, which produced uncolored monospace text.
//!
//! Fix: collapse to a single function in `md_renderer.rs` that handles both
//! concerns. The table-header detection logic is a pure state machine over
//! `&[StyledLine]` and lives in `md_renderer::detect_table_header_rows()`,
//! which is unit-testable without a GTK display server.

use chlodwig_core::markdown::{MdColor, MdStyle, StyledLine, StyledSpan};

// ── Source-grep tests: enforce single render function ────────────────

#[test]
fn test_no_separate_with_table_headers_function() {
    // The old `append_styled_lines_with_table_headers` must be gone — its
    // behavior is folded into `append_styled_lines`.
    let render_src = include_str!("../render.rs");
    assert!(
        !render_src.contains("fn append_styled_lines_with_table_headers"),
        "render.rs must no longer define append_styled_lines_with_table_headers; \
         the table-header rendering logic belongs in md_renderer.rs alongside the \
         code-block highlighting logic"
    );
}

#[test]
fn test_unified_render_lives_in_md_renderer() {
    let md_src = include_str!("../md_renderer.rs");
    assert!(
        md_src.contains("fn append_styled_lines"),
        "md_renderer.rs must contain the unified append_styled_lines function"
    );
}

#[test]
fn test_unified_render_handles_table_headers() {
    // The unified function in md_renderer.rs must accept table-overrides
    // information so it can emit `table_sort:N:M` tags on header cells.
    let md_src = include_str!("../md_renderer.rs");
    assert!(
        md_src.contains("table_sort:"),
        "md_renderer.rs must emit table_sort:N:M tags on table-header cells"
    );
}

#[test]
fn test_unified_render_handles_code_highlighting() {
    // The unified function must call should_highlight_code_line so fenced
    // code blocks get syntax highlighting in all render paths.
    let md_src = include_str!("../md_renderer.rs");
    assert!(
        md_src.contains("should_highlight_code_line"),
        "md_renderer.rs must invoke should_highlight_code_line for code blocks"
    );
}

#[test]
fn test_render_rs_no_duplicate_render_function() {
    // render.rs must NOT contain its own append_styled_lines copy.
    let render_src = include_str!("../render.rs");
    assert!(
        !render_src.contains("pub fn append_styled_lines"),
        "render.rs must not define its own append_styled_lines"
    );
}

#[test]
fn test_callers_use_unified_function() {
    // All callers that previously called append_styled_lines_with_table_headers
    // now must call md_renderer::append_styled_lines (with the table args).
    // The old name may still appear in comments/explanations — we only check
    // that no one *calls* it (i.e. with `(`).
    let render_src = include_str!("../render.rs");
    let main_src = include_str!("../main.rs");
    assert!(
        !render_src.contains("append_styled_lines_with_table_headers("),
        "render.rs must not call the old function name"
    );
    assert!(
        !main_src.contains("append_styled_lines_with_table_headers("),
        "main.rs must not call the old function name"
    );
}

// ── Pure logic test: table-header row detection ──────────────────────

/// Build a fake "table border" line (starts with the given border char).
fn border_line(c: char) -> StyledLine {
    StyledLine {
        spans: vec![StyledSpan {
            text: format!("{c}─────────"),
            style: MdStyle::default(),
        }],
        wrap_prefix: None,
        code_info: None,
    }
}

/// Build a fake header row (one bold+monospace span, then plain ones).
fn header_row(cells: &[&str]) -> StyledLine {
    let bold_mono = MdStyle::default().bold().monospace().fg(MdColor::White);
    let plain = MdStyle::default();
    let mut spans = Vec::new();
    for (i, cell) in cells.iter().enumerate() {
        if i > 0 {
            spans.push(StyledSpan {
                text: " │ ".into(),
                style: plain,
            });
        }
        spans.push(StyledSpan {
            text: (*cell).into(),
            style: bold_mono,
        });
    }
    StyledLine {
        spans,
        wrap_prefix: None,
        code_info: None,
    }
}

/// Build a fake data row (no bold spans).
fn data_row(text: &str) -> StyledLine {
    StyledLine {
        spans: vec![StyledSpan {
            text: text.into(),
            style: MdStyle::default().monospace(),
        }],
        wrap_prefix: None,
        code_info: None,
    }
}

#[test]
fn test_detect_table_header_rows_simple() {
    use crate::md_renderer::detect_table_header_rows;
    let lines = vec![
        border_line('┌'),
        header_row(&["Name", "Score"]),
        border_line('├'),
        data_row("│ Alice │  42 │"),
        border_line('└'),
    ];
    let result = detect_table_header_rows(&lines);
    // line 0: border (not header)
    // line 1: header → table_within_block = 0
    // line 2: ├ separator (not header)
    // line 3: data row (not header)
    // line 4: └ closing (not header)
    assert_eq!(result.len(), lines.len());
    assert_eq!(result[0], None);
    assert_eq!(result[1], Some(0), "line 1 must be header of table 0");
    assert_eq!(result[2], None);
    assert_eq!(result[3], None);
    assert_eq!(result[4], None);
}

#[test]
fn test_detect_table_header_rows_two_tables() {
    use crate::md_renderer::detect_table_header_rows;
    let lines = vec![
        border_line('┌'),
        header_row(&["A"]),
        border_line('└'),
        border_line('┌'),
        header_row(&["B"]),
        border_line('└'),
    ];
    let result = detect_table_header_rows(&lines);
    assert_eq!(result[1], Some(0), "first table is index 0");
    assert_eq!(result[4], Some(1), "second table is index 1");
}

#[test]
fn test_detect_table_header_rows_no_tables() {
    use crate::md_renderer::detect_table_header_rows;
    let lines = vec![
        StyledLine::plain("plain text"),
        StyledLine::plain("more text"),
    ];
    let result = detect_table_header_rows(&lines);
    assert!(result.iter().all(|x: &Option<usize>| x.is_none()));
}

#[test]
fn test_detect_table_header_only_first_row_after_top_border() {
    // After the second ├ separator inside the same table, no further rows
    // are headers.
    use crate::md_renderer::detect_table_header_rows;
    let lines = vec![
        border_line('┌'),
        header_row(&["X"]),
        border_line('├'),
        header_row(&["NotAHeader"]), // would otherwise look like a header
        border_line('└'),
    ];
    let result = detect_table_header_rows(&lines);
    assert_eq!(result[1], Some(0), "real header detected");
    assert_eq!(result[3], None, "post-separator row must not be a header");
}
