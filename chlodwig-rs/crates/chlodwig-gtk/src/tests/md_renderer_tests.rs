//! Tests for `chlodwig_gtk::md_renderer` (GTK-independent layer).
//!
//! Extracted from inline `#[cfg(test)] mod tests` in `md_renderer.rs`.
//! Only top-level pub helpers are tested here — the `gtk_impl` module
//! requires a live GTK display server and is exercised via the
//! md_render_unification_tests instead.

use crate::md_renderer::*;
use chlodwig_core::markdown::{MdColor, MdStyle};


#[test]
fn test_md_color_to_hex_default_is_none() {
    assert_eq!(md_color_to_hex(MdColor::Default), None);
}

#[test]
fn test_md_color_to_hex_white() {
    assert_eq!(md_color_to_hex(MdColor::White), Some("#ffffff"));
}

#[test]
fn test_md_color_to_hex_red() {
    assert_eq!(md_color_to_hex(MdColor::Red), Some("#e06c75"));
}

#[test]
fn test_md_color_to_hex_green() {
    assert_eq!(md_color_to_hex(MdColor::Green), Some("#98c379"));
}

#[test]
fn test_md_color_to_hex_blue() {
    assert_eq!(md_color_to_hex(MdColor::Blue), Some("#61afef"));
}

#[test]
fn test_md_color_to_hex_code_bg() {
    assert_eq!(md_color_to_hex(MdColor::Rgb(45, 45, 45)), Some("#2d2d2d"));
}

#[test]
fn test_md_color_to_hex_owned_arbitrary_rgb() {
    assert_eq!(
        md_color_to_hex_owned(MdColor::Rgb(255, 128, 0)),
        Some("#ff8000".to_string())
    );
}

#[test]
fn test_md_color_to_hex_owned_named() {
    assert_eq!(
        md_color_to_hex_owned(MdColor::Cyan),
        Some("#56b6c2".to_string())
    );
}

#[test]
fn test_md_color_to_hex_owned_default() {
    assert_eq!(md_color_to_hex_owned(MdColor::Default), None);
}

#[test]
fn test_style_tag_name_unique() {
    let s1 = MdStyle::default().bold().fg(MdColor::Red);
    let s2 = MdStyle::default().italic().fg(MdColor::Blue);
    assert_ne!(style_tag_name(&s1), style_tag_name(&s2));
}

#[test]
fn test_style_tag_name_same_style_same_name() {
    let s1 = MdStyle::default().bold().fg(MdColor::Red);
    let s2 = MdStyle::default().bold().fg(MdColor::Red);
    assert_eq!(style_tag_name(&s1), style_tag_name(&s2));
}

#[test]
fn test_style_tag_name_monospace_differs() {
    let s1 = MdStyle::default();
    let s2 = MdStyle::default().monospace();
    assert_ne!(style_tag_name(&s1), style_tag_name(&s2));
}

#[test]
fn test_style_tag_name_heading_level_differs() {
    let s1 = MdStyle::default().bold();
    let s2 = MdStyle::default().bold().heading(1);
    assert_ne!(style_tag_name(&s1), style_tag_name(&s2));
}

#[test]
fn test_style_tag_name_heading_levels_differ() {
    let s1 = MdStyle::default().heading(1);
    let s2 = MdStyle::default().heading(2);
    assert_ne!(style_tag_name(&s1), style_tag_name(&s2));
}

#[test]
fn test_heading_scale_values() {
    // H1 should be largest, H6 smallest, all > 1.0
    let scales = [
        heading_scale(1),
        heading_scale(2),
        heading_scale(3),
        heading_scale(4),
        heading_scale(5),
        heading_scale(6),
    ];
    // Each level should be smaller than the previous
    for i in 1..scales.len() {
        assert!(
            scales[i - 1] > scales[i],
            "H{} scale ({}) should be > H{} scale ({})",
            i,
            scales[i - 1],
            i + 1,
            scales[i],
        );
    }
    // All should be above 1.0 (larger than normal text)
    for (i, &s) in scales.iter().enumerate() {
        assert!(
            s >= 1.0,
            "H{} scale ({}) should be >= 1.0",
            i + 1,
            s,
        );
    }
}

#[test]
fn test_heading_scale_none_for_non_heading() {
    // heading_scale should not be called for non-headings, but level 0 should
    // not crash — just return 1.0 as a safe fallback
    let scale = heading_scale(0);
    assert!((scale - 1.0).abs() < f64::EPSILON, "Level 0 should be 1.0");
}

#[test]
fn test_md_color_to_hex_all_named() {
    // Ensure all named colors map to something
    assert!(md_color_to_hex(MdColor::Gray).is_some());
    assert!(md_color_to_hex(MdColor::DarkGray).is_some());
    assert!(md_color_to_hex(MdColor::Yellow).is_some());
    assert!(md_color_to_hex(MdColor::Magenta).is_some());
}

// ── Syntax highlighting in code blocks ───────────────────────────

#[test]
fn test_highlight_code_line_returns_spans_for_known_lang() {
    let spans = highlight_code_line("rust", "let x = 42;");
    assert!(spans.is_some(), "rust should produce highlighted spans");
    let spans = spans.unwrap();
    assert!(!spans.is_empty());
    // At least one span should have a foreground color
    assert!(
        spans.iter().any(|s| s.fg.is_some()),
        "should have colored spans"
    );
}

#[test]
fn test_highlight_code_line_returns_none_for_unknown_lang() {
    let spans = highlight_code_line("nonexistent_xyz_lang", "hello world");
    assert!(spans.is_none());
}

#[test]
fn test_highlight_code_line_returns_none_for_empty_lang() {
    let spans = highlight_code_line("", "hello");
    assert!(spans.is_none());
}

#[test]
fn test_highlight_code_line_python_def() {
    let spans = highlight_code_line("python", "def foo():");
    assert!(spans.is_some());
    let spans = spans.unwrap();
    // "def" keyword should be present in the text
    let full_text: String = spans.iter().map(|s| s.text.as_str()).collect();
    assert!(full_text.contains("def"), "should contain 'def': {full_text}");
}

#[test]
fn test_highlight_code_line_preserves_text_content() {
    let input = "fn main() { println!(\"hello\"); }";
    let spans = highlight_code_line("rust", input);
    assert!(spans.is_some());
    let full_text: String = spans.unwrap().iter().map(|s| s.text.as_str()).collect();
    assert_eq!(full_text, input, "highlighted text must match input exactly");
}

#[test]
fn test_should_highlight_code_line_true_for_code_info() {
    use chlodwig_core::markdown::{StyledSpan, StyledLine};
    let line = StyledLine {
        spans: vec![
            StyledSpan { text: "  │ ".into(), style: MdStyle::default() },
            StyledSpan { text: "let x = 42;".into(), style: MdStyle::default().monospace() },
        ],
        wrap_prefix: None,
        code_info: Some("rust".into()),
    };
    assert!(should_highlight_code_line(&line));
}

#[test]
fn test_should_highlight_code_line_false_without_code_info() {
    use chlodwig_core::markdown::StyledLine;
    let line = StyledLine::plain("hello");
    assert!(!should_highlight_code_line(&line));
}

#[test]
fn test_should_highlight_code_line_false_with_single_span() {
    use chlodwig_core::markdown::{StyledSpan, StyledLine};
    // code_info set but only 1 span (header/footer) → don't highlight
    let line = StyledLine {
        spans: vec![
            StyledSpan { text: "  ┌─ rust ─".into(), style: MdStyle::default() },
        ],
        wrap_prefix: None,
        code_info: Some("rust".into()),
    };
    assert!(!should_highlight_code_line(&line));
}

#[test]
fn test_highlight_tag_name_format() {
    let name = highlight_tag_name_for(Some((255, 128, 0)), true, false);
    assert!(name.starts_with("hl_"), "should start with hl_: {name}");
    assert!(name.contains("255"), "should contain red: {name}");
    assert!(name.contains("128"), "should contain green: {name}");
    assert!(name.contains("_b"), "should contain bold marker: {name}");
}

#[test]
fn test_highlight_tag_name_no_color() {
    let name = highlight_tag_name_for(None, false, false);
    assert!(name.contains("def"), "should contain 'def' for default: {name}");
}

#[test]
fn test_highlight_tag_name_italic() {
    let name = highlight_tag_name_for(Some((0, 0, 0)), false, true);
    assert!(name.contains("_i"), "should contain italic marker: {name}");
}

#[test]
fn test_highlight_tag_name_bold_italic() {
    let name = highlight_tag_name_for(Some((0, 0, 0)), true, true);
    assert!(name.contains("_bi"), "should contain bold+italic marker: {name}");
}
