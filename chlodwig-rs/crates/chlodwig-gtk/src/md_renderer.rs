//! Markdown rendering adapter for GTK.
//!
//! Converts `chlodwig_core::StyledLine` (backend-agnostic) into
//! GTK `TextBuffer` content with `TextTag`-based styling.

use chlodwig_core::markdown::{MdColor, MdStyle, StyledLine};

// ── Color conversion (GTK-independent, testable) ────────────────────

/// Convert an MdColor to a CSS/Pango hex color string.
/// Returns None for MdColor::Default (use widget default).
pub fn md_color_to_hex(c: MdColor) -> Option<&'static str> {
    match c {
        MdColor::Default => None,
        MdColor::White => Some("#ffffff"),
        MdColor::Gray => Some("#a0a0a0"),
        MdColor::DarkGray => Some("#7f848e"),
        MdColor::Cyan => Some("#56b6c2"),
        MdColor::Blue => Some("#61afef"),
        MdColor::Yellow => Some("#e5c07b"),
        MdColor::Green => Some("#98c379"),
        MdColor::Red => Some("#e06c75"),
        MdColor::Magenta => Some("#c678dd"),
        MdColor::Rgb(r, g, b) => {
            // For RGB we need a dynamic string — use a small set of
            // known values from the code-block background.
            if r == 45 && g == 45 && b == 45 {
                Some("#2d2d2d")
            } else if r == 40 && g == 40 && b == 40 {
                Some("#282828")
            } else {
                // Fallback: can't return &'static str for arbitrary RGB.
                // In practice, core only uses a few known RGB values.
                None
            }
        }
    }
}

/// Convert an MdColor to an owned hex color string.
/// Handles arbitrary RGB values.
pub fn md_color_to_hex_owned(c: MdColor) -> Option<String> {
    match c {
        MdColor::Rgb(r, g, b) => Some(format!("#{:02x}{:02x}{:02x}", r, g, b)),
        other => md_color_to_hex(other).map(|s| s.to_string()),
    }
}

/// Build a unique tag name for a given MdStyle so identical styles share the same tag.
pub fn style_tag_name(style: &MdStyle) -> String {
    format!(
        "md_fg{:?}_bg{:?}_b{}_i{}_u{}_m{}_h{}",
        style.fg, style.bg, style.bold as u8, style.italic as u8,
        style.underline as u8, style.monospace as u8,
        style.heading_level.unwrap_or(0),
    )
}

/// Returns the Pango `scale` factor for a heading level (1–6).
/// H1 = 2.0×, H2 = 1.6×, H3 = 1.35×, H4 = 1.15×, H5 = 1.05×, H6 = 1.0×.
/// Level 0 or > 6 returns 1.0 as a safe fallback.
pub fn heading_scale(level: u8) -> f64 {
    match level {
        1 => 2.0,
        2 => 1.6,
        3 => 1.35,
        4 => 1.15,
        5 => 1.05,
        6 => 1.0,
        _ => 1.0,
    }
}

// ── Syntax highlighting for code blocks (GTK-independent) ──────────

use chlodwig_core::highlight::HighlightSpan;

/// Check whether a `StyledLine` is a code block content line that should
/// receive syntax highlighting. True when `code_info` is set and the line
/// has at least 2 spans (border + code text).
pub fn should_highlight_code_line(line: &StyledLine) -> bool {
    line.code_info.is_some() && line.spans.len() >= 2
}

/// Highlight a single line of code using the shared syntect highlighter.
/// Returns `None` if the language is not recognized.
pub fn highlight_code_line(lang: &str, code: &str) -> Option<Vec<HighlightSpan>> {
    chlodwig_core::highlight::highlight_line(lang, code)
}

/// Generate a unique tag name for a syntax highlight span.
/// Used by both the GTK code-block highlighter and `render_highlighted_line`
/// in `main.rs`.
pub fn highlight_tag_name_for(fg: Option<(u8, u8, u8)>, bold: bool, italic: bool) -> String {
    let color_part = match fg {
        Some((r, g, b)) => format!("{r}_{g}_{b}"),
        None => "def".into(),
    };
    let style_part = match (bold, italic) {
        (true, true) => "_bi",
        (true, false) => "_b",
        (false, true) => "_i",
        (false, false) => "",
    };
    format!("hl_{color_part}{style_part}")
}

// ── GTK-dependent rendering ─────────────────────────────────────────

#[cfg(feature = "gtk-ui")]
mod gtk_impl {
    use super::*;
    use gtk4::prelude::*;
    use crate::emoji;

    /// Ensure a TextTag for the given MdStyle exists in the tag table.
    /// Returns the tag name.
    pub fn ensure_tag(buffer: &gtk4::TextBuffer, style: &MdStyle) -> String {
        let name = style_tag_name(style);
        let tag_table = buffer.tag_table();

        if tag_table.lookup(&name).is_some() {
            return name;
        }

        let mut builder = gtk4::TextTag::builder().name(&name);

        if let Some(fg) = md_color_to_hex_owned(style.fg) {
            builder = builder.foreground(&fg);
        }
        if let Some(bg) = md_color_to_hex_owned(style.bg) {
            builder = builder.background(&bg);
        }
        if style.bold {
            builder = builder.weight(700);
        }
        if style.italic {
            builder = builder.style(gtk4::pango::Style::Italic);
        }
        if style.underline {
            builder = builder.underline(gtk4::pango::Underline::Single);
        }
        if style.monospace {
            builder = builder.family("monospace");
        }
        if let Some(level) = style.heading_level {
            let scale = heading_scale(level);
            builder = builder.scale(scale);
        }

        let tag = builder.build();
        tag_table.add(&tag);
        name
    }

    /// Render a slice of `StyledLine`s into a GTK TextBuffer at the end.
    /// Each span gets its own TextTag based on its MdStyle.
    /// Emoji characters are rendered as CoreText bitmaps and inserted as paintables.
    ///
    /// Lines with `code_info` set (fenced code block content) get syntect-based
    /// syntax highlighting: the border span is kept as-is, the code spans are
    /// replaced with per-token colored tags.
    pub fn append_styled_lines(buffer: &gtk4::TextBuffer, lines: &[StyledLine]) {
        for (line_idx, line) in lines.iter().enumerate() {
            if line_idx > 0 {
                let mut end = buffer.end_iter();
                buffer.insert(&mut end, "\n");
            }

            if should_highlight_code_line(line) {
                let lang = line.code_info.as_deref().unwrap_or("");
                // spans[0] is the border ("  │ "), spans[1..] is the code text
                let border_span = &line.spans[0];
                let border_tag = ensure_tag(buffer, &border_span.style);
                insert_text_with_emoji_and_tag(
                    buffer,
                    &border_span.text,
                    &border_tag,
                    border_span.style.monospace,
                );

                // Concatenate all code spans
                let code_text: String =
                    line.spans[1..].iter().map(|s| s.text.as_str()).collect();

                // Try syntax highlighting
                match highlight_code_line(lang, &code_text) {
                    Some(spans) if !spans.is_empty() => {
                        insert_highlighted_spans(buffer, &spans);
                    }
                    _ => {
                        // Fallback: render as plain monospace code
                        for span in &line.spans[1..] {
                            let tag_name = ensure_tag(buffer, &span.style);
                            insert_text_with_emoji_and_tag(
                                buffer,
                                &span.text,
                                &tag_name,
                                span.style.monospace,
                            );
                        }
                    }
                }
            } else {
                for span in &line.spans {
                    let tag_name = ensure_tag(buffer, &span.style);
                    insert_text_with_emoji_and_tag(
                        buffer,
                        &span.text,
                        &tag_name,
                        span.style.monospace,
                    );
                }
            }
        }
    }

    /// Insert syntax-highlighted spans into the buffer.
    /// Each span gets a dynamically created monospace tag with the appropriate
    /// foreground color, bold, and italic attributes.
    fn insert_highlighted_spans(
        buffer: &gtk4::TextBuffer,
        spans: &[HighlightSpan],
    ) {
        let tag_table = buffer.tag_table();
        for span in spans {
            if span.text.is_empty() {
                continue;
            }
            let tag_name = highlight_tag_name_for(span.fg, span.bold, span.italic);
            if tag_table.lookup(&tag_name).is_none() {
                let mut builder = gtk4::TextTag::builder()
                    .name(&tag_name)
                    .family("monospace");
                if let Some((r, g, b)) = span.fg {
                    builder =
                        builder.foreground(&format!("#{r:02x}{g:02x}{b:02x}"));
                }
                if span.bold {
                    builder = builder.weight(700);
                }
                if span.italic {
                    builder = builder.style(gtk4::pango::Style::Italic);
                }
                tag_table.add(&builder.build());
            }
            // Insert text with emoji support (code can contain emoji in strings)
            insert_text_with_emoji_and_tag(buffer, &span.text, &tag_name, true);
        }
    }

    /// Render Markdown text into a GTK TextBuffer at the end.
    /// Parses the text via core, then inserts styled spans.
    pub fn append_markdown(buffer: &gtk4::TextBuffer, text: &str) {
        let lines = chlodwig_core::render_markdown(text);
        append_styled_lines(buffer, &lines);
    }

    /// Render Markdown text with viewport width constraint.
    pub fn append_markdown_with_width(buffer: &gtk4::TextBuffer, text: &str, width: usize) {
        let lines = chlodwig_core::render_markdown_with_width(text, width);
        append_styled_lines(buffer, &lines);
    }

    /// Delete a range of text from the buffer (by char offsets) and insert
    /// Markdown-rendered text in its place.
    pub fn replace_range_with_markdown(
        buffer: &gtk4::TextBuffer,
        start_offset: i32,
        end_offset: i32,
        text: &str,
    ) {
        let mut start = buffer.iter_at_offset(start_offset);
        let mut end = buffer.iter_at_offset(end_offset);
        buffer.delete(&mut start, &mut end);

        let lines = chlodwig_core::render_markdown(text);

        // Insert at the position where we deleted
        for (line_idx, line) in lines.iter().enumerate() {
            if line_idx > 0 {
                let mut iter = buffer.end_iter();
                buffer.insert(&mut iter, "\n");
            }

            for span in &line.spans {
                let tag_name = ensure_tag(buffer, &span.style);
                insert_text_with_emoji_and_tag(buffer, &span.text, &tag_name, span.style.monospace);
            }
        }
    }

    /// Insert text at the end of the buffer with emoji-as-paintable support.
    ///
    /// Plain text segments get the specified tag applied.
    /// Emoji segments are rendered via CoreText and drawn as overlays
    /// over 2-space placeholders. The tag is applied to the placeholder
    /// spaces so they inherit the correct font (e.g. monospace for tables).
    pub fn insert_text_with_emoji_and_tag(
        buffer: &gtk4::TextBuffer,
        text: &str,
        tag_name: &str,
        monospace: bool,
    ) {
        let segments = emoji::split_emoji_segments(text);
        for seg in &segments {
            match seg {
                emoji::TextSegment::Plain(s) => {
                    let mut end = buffer.end_iter();
                    let start_offset = end.offset();
                    buffer.insert(&mut end, s);
                    let start_iter = buffer.iter_at_offset(start_offset);
                    let end_iter = buffer.end_iter();
                    buffer.apply_tag_by_name(tag_name, &start_iter, &end_iter);
                }
                emoji::TextSegment::Emoji(e) => {
                    crate::window::insert_emoji_as_overlay(buffer, e, &[tag_name], monospace);
                }
            }
        }
    }
}

#[cfg(feature = "gtk-ui")]
pub use gtk_impl::*;

// ── Tests (GTK-independent) ─────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

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
}
