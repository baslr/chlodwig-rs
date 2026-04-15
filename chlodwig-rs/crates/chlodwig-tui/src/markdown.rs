//! Markdown rendering adapter for the TUI.
//!
//! The actual Markdown parsing lives in `chlodwig_core::markdown` (backend-agnostic).
//! This module:
//! - Re-exports `render_markdown` / `render_markdown_with_width` as functions
//!   that return `Vec<RenderedLine>` (the TUI's native type)
//! - Provides `highlight_code()` with syntect-based syntax highlighting
//! - Provides `lang_from_path()` for deriving a language from a file extension
//! - Converts `MdStyle → ratatui::style::Style`

use chlodwig_core::markdown::{MdColor, MdStyle, StyledLine};
use ratatui::style::{Color, Modifier, Style};
use std::sync::OnceLock;
use syntect::easy::HighlightLines;
use syntect::highlighting::{FontStyle, ThemeSet};
use syntect::parsing::SyntaxSet;

use crate::rendered_line::RenderedLine;

// ── Global resources (loaded once) ───────────────────────────────────

fn syntax_set() -> &'static SyntaxSet {
    static SS: OnceLock<SyntaxSet> = OnceLock::new();
    SS.get_or_init(SyntaxSet::load_defaults_newlines)
}

fn theme() -> &'static syntect::highlighting::Theme {
    static T: OnceLock<syntect::highlighting::Theme> = OnceLock::new();
    T.get_or_init(|| {
        let ts = ThemeSet::load_defaults();
        ts.themes["base16-eighties.dark"].clone()
    })
}

// ── Style conversion ─────────────────────────────────────────────────

/// Background color for code blocks (must match the core constant).
const CODE_BG: Color = Color::Rgb(45, 45, 45);

/// Convert a backend-agnostic MdColor to a ratatui Color.
fn md_color_to_ratatui(c: MdColor) -> Option<Color> {
    match c {
        MdColor::Default => None,
        MdColor::White => Some(Color::White),
        MdColor::Gray => Some(Color::Gray),
        MdColor::DarkGray => Some(Color::DarkGray),
        MdColor::Cyan => Some(Color::Cyan),
        MdColor::Blue => Some(Color::Blue),
        MdColor::Yellow => Some(Color::Yellow),
        MdColor::Green => Some(Color::Green),
        MdColor::Red => Some(Color::Red),
        MdColor::Magenta => Some(Color::Magenta),
        MdColor::Rgb(r, g, b) => Some(Color::Rgb(r, g, b)),
    }
}

/// Convert a backend-agnostic MdStyle to a ratatui Style.
fn md_style_to_ratatui(s: MdStyle) -> Style {
    let mut style = Style::default();
    if let Some(fg) = md_color_to_ratatui(s.fg) {
        style = style.fg(fg);
    }
    if let Some(bg) = md_color_to_ratatui(s.bg) {
        style = style.bg(bg);
    }
    if s.bold {
        style = style.add_modifier(Modifier::BOLD);
    }
    if s.italic {
        style = style.add_modifier(Modifier::ITALIC);
    }
    if s.underline {
        style = style.add_modifier(Modifier::UNDERLINED);
    }
    style
}

/// Convert a syntect style to a ratatui style.
pub(crate) fn syntect_to_ratatui(style: syntect::highlighting::Style) -> Style {
    let fg = style.foreground;
    let mut rat_style = Style::default().fg(Color::Rgb(fg.r, fg.g, fg.b));

    if style.font_style.contains(FontStyle::BOLD) {
        rat_style = rat_style.add_modifier(Modifier::BOLD);
    }
    if style.font_style.contains(FontStyle::ITALIC) {
        rat_style = rat_style.add_modifier(Modifier::ITALIC);
    }

    rat_style
}

/// Convert a `StyledLine` (core) to a `RenderedLine` (TUI).
fn styled_line_to_rendered(line: &StyledLine) -> RenderedLine {
    let spans: Vec<(String, Style)> = line
        .spans
        .iter()
        .map(|s| (s.text.clone(), md_style_to_ratatui(s.style)))
        .collect();

    let wrap_prefix = line.wrap_prefix.as_ref().map(|wp| {
        (wp.text.clone(), md_style_to_ratatui(wp.style))
    });

    RenderedLine { spans, wrap_prefix }
}

// ── Code highlighting ────────────────────────────────────────────────

// Language alias resolution and path-based language detection are shared
// with the GTK backend via chlodwig_core::highlight.
pub(crate) use chlodwig_core::highlight::lang_from_path;

/// Highlight a code block with syntect. Falls back to plain styling for unknown languages.
pub(crate) fn highlight_code(lang: &str, code: &str) -> Vec<RenderedLine> {
    let ss = syntax_set();
    let th = theme();

    let resolved = if lang.is_empty() { "" } else { chlodwig_core::highlight::resolve_lang_alias(lang) };
    let syntax = if resolved.is_empty() {
        None
    } else {
        ss.find_syntax_by_token(resolved)
    };

    match syntax {
        Some(syn) => {
            let mut h = HighlightLines::new(syn, th);
            let mut lines = Vec::new();

            for line in code.lines() {
                match h.highlight_line(line, ss) {
                    Ok(ranges) => {
                        let spans: Vec<(String, Style)> = ranges
                            .iter()
                            .map(|(style, text)| {
                                let mut s = syntect_to_ratatui(*style);
                                s = s.bg(CODE_BG);
                                (text.to_string(), s)
                            })
                            .collect();

                        if spans.is_empty() {
                            lines.push(RenderedLine::styled(
                                "",
                                Style::default().bg(CODE_BG),
                            ));
                        } else {
                            lines.push(RenderedLine { spans, wrap_prefix: None });
                        }
                    }
                    Err(_) => {
                        lines.push(RenderedLine::styled(
                            line,
                            Style::default().fg(Color::White).bg(CODE_BG),
                        ));
                    }
                }
            }

            if lines.is_empty() {
                lines.push(RenderedLine::styled("", Style::default().bg(CODE_BG)));
            }

            lines
        }
        None => {
            let fallback_style = Style::default().fg(Color::White).bg(CODE_BG);
            let mut lines: Vec<RenderedLine> = code
                .lines()
                .map(|line| RenderedLine::styled(line, fallback_style))
                .collect();

            if lines.is_empty() {
                lines.push(RenderedLine::styled("", fallback_style));
            }

            lines
        }
    }
}

// ── Public markdown rendering (core parsing + TUI conversion) ───────

/// Render Markdown text to `RenderedLine`s with syntect-highlighted code blocks.
pub(crate) fn render_markdown(text: &str) -> Vec<RenderedLine> {
    render_markdown_with_width(text, usize::MAX)
}

/// Render Markdown text to `RenderedLine`s, wrapping table columns to fit
/// within `viewport_width`. Code blocks get syntect syntax highlighting.
pub(crate) fn render_markdown_with_width(text: &str, viewport_width: usize) -> Vec<RenderedLine> {
    let core_lines = chlodwig_core::markdown::render_markdown_with_width(text, viewport_width);
    let mut result = Vec::with_capacity(core_lines.len());

    for line in &core_lines {
        if let Some(ref lang) = line.code_info {
            // This is a code block line — replace the plain code span with
            // syntect-highlighted spans (if a known language).
            // The line has spans: [border "  │ ", code_text]
            // We keep the border span and replace the code span.
            if line.spans.len() >= 2 {
                let border_span = &line.spans[0];
                // Concatenate all code spans (everything after the border)
                let code_text: String = line.spans[1..]
                    .iter()
                    .map(|s| s.text.as_str())
                    .collect();

                let highlighted = highlight_code(lang, &code_text);
                if let Some(hl_line) = highlighted.into_iter().next() {
                    let mut spans = vec![(
                        border_span.text.clone(),
                        md_style_to_ratatui(border_span.style),
                    )];
                    spans.extend(hl_line.spans);
                    result.push(RenderedLine { spans, wrap_prefix: None });
                } else {
                    result.push(styled_line_to_rendered(line));
                }
            } else {
                result.push(styled_line_to_rendered(line));
            }
        } else {
            result.push(styled_line_to_rendered(line));
        }
    }

    result
}

// ── Tests ────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    /// Helper: collect all text from rendered lines
    fn text_of(lines: &[RenderedLine]) -> String {
        lines
            .iter()
            .map(|rl| {
                rl.spans
                    .iter()
                    .map(|(t, _): &(String, Style)| t.as_str())
                    .collect::<String>()
            })
            .collect::<Vec<_>>()
            .join("\n")
    }

    /// Helper: find first line containing `needle` and return its spans
    fn find_line_spans<'a>(lines: &'a [RenderedLine], needle: &str) -> Option<&'a [(String, Style)]> {
        lines.iter().find(|rl| {
            let t: String = rl.spans.iter().map(|(t, _): &(String, Style)| t.as_str()).collect();
            t.contains(needle)
        }).map(|rl| rl.spans.as_slice())
    }

    /// Helper: check if any span in the line has a certain modifier
    fn has_modifier(spans: &[(String, Style)], modifier: Modifier) -> bool {
        spans.iter().any(|(_, s)| s.add_modifier.contains(modifier))
    }

    /// Helper: check if any span has a specific fg color
    fn has_fg(spans: &[(String, Style)], color: Color) -> bool {
        spans.iter().any(|(_, s)| s.fg == Some(color))
    }

    // ── md_color_to_ratatui ─────────────────────────────────────────

    #[test]
    fn test_md_color_default_maps_to_none() {
        assert_eq!(md_color_to_ratatui(MdColor::Default), None);
    }

    #[test]
    fn test_md_color_rgb_maps_correctly() {
        assert_eq!(
            md_color_to_ratatui(MdColor::Rgb(255, 128, 0)),
            Some(Color::Rgb(255, 128, 0))
        );
    }

    #[test]
    fn test_md_color_named_colors() {
        assert_eq!(md_color_to_ratatui(MdColor::White), Some(Color::White));
        assert_eq!(md_color_to_ratatui(MdColor::Red), Some(Color::Red));
        assert_eq!(md_color_to_ratatui(MdColor::Cyan), Some(Color::Cyan));
    }

    // ── md_style_to_ratatui ─────────────────────────────────────────

    #[test]
    fn test_md_style_to_ratatui_bold_italic() {
        let md = MdStyle::default().bold().italic().fg(MdColor::Red);
        let rat = md_style_to_ratatui(md);
        assert_eq!(rat.fg, Some(Color::Red));
        assert!(rat.add_modifier.contains(Modifier::BOLD));
        assert!(rat.add_modifier.contains(Modifier::ITALIC));
    }

    #[test]
    fn test_md_style_to_ratatui_underline() {
        let md = MdStyle::default().underline();
        let rat = md_style_to_ratatui(md);
        assert!(rat.add_modifier.contains(Modifier::UNDERLINED));
    }

    #[test]
    fn test_md_style_to_ratatui_default() {
        let md = MdStyle::default();
        let rat = md_style_to_ratatui(md);
        assert_eq!(rat.fg, None);
        assert_eq!(rat.bg, None);
        assert!(rat.add_modifier.is_empty());
    }

    // ── syntect_to_ratatui ──────────────────────────────────────────

    #[test]
    fn test_syntect_to_ratatui_rgb() {
        let syn_style = syntect::highlighting::Style {
            foreground: syntect::highlighting::Color { r: 255, g: 128, b: 0, a: 255 },
            background: syntect::highlighting::Color { r: 0, g: 0, b: 0, a: 255 },
            font_style: FontStyle::BOLD | FontStyle::ITALIC,
        };
        let rat = syntect_to_ratatui(syn_style);
        assert_eq!(rat.fg, Some(Color::Rgb(255, 128, 0)));
        assert!(rat.add_modifier.contains(Modifier::BOLD));
        assert!(rat.add_modifier.contains(Modifier::ITALIC));
    }

    #[test]
    fn test_syntect_to_ratatui_no_modifiers() {
        let syn_style = syntect::highlighting::Style {
            foreground: syntect::highlighting::Color { r: 100, g: 200, b: 50, a: 255 },
            background: syntect::highlighting::Color { r: 0, g: 0, b: 0, a: 255 },
            font_style: FontStyle::empty(),
        };
        let rat = syntect_to_ratatui(syn_style);
        assert_eq!(rat.fg, Some(Color::Rgb(100, 200, 50)));
        assert!(rat.add_modifier.is_empty());
    }

    // ── render_markdown (integration: core parsing + TUI conversion) ─

    #[test]
    fn test_md_plain_text() {
        let lines = render_markdown("hello");
        let text = text_of(&lines);
        assert!(text.contains("hello"), "got: {text}");
    }

    #[test]
    fn test_md_bold() {
        let lines = render_markdown("**bold**");
        let spans = find_line_spans(&lines, "bold").expect("should have 'bold'");
        assert!(has_modifier(spans, Modifier::BOLD));
    }

    #[test]
    fn test_md_italic() {
        let lines = render_markdown("*italic*");
        let spans = find_line_spans(&lines, "italic").expect("should have 'italic'");
        assert!(has_modifier(spans, Modifier::ITALIC));
    }

    #[test]
    fn test_md_heading_h1() {
        let lines = render_markdown("# Title");
        let spans = find_line_spans(&lines, "Title").expect("should have heading");
        assert!(has_modifier(spans, Modifier::BOLD));
        assert!(has_modifier(spans, Modifier::UNDERLINED));
    }

    #[test]
    fn test_md_inline_code() {
        let lines = render_markdown("`foo`");
        let spans = find_line_spans(&lines, "foo").expect("should have 'foo'");
        assert!(has_fg(spans, Color::Yellow));
    }

    #[test]
    fn test_md_code_block_syntax_highlighted() {
        let md = "```rust\nlet x = 42;\n```";
        let lines = render_markdown(md);
        let text = text_of(&lines);
        assert!(text.contains("let x = 42"), "got: {text}");
        // Syntect should produce RGB colors (not plain White)
        let code_line = lines.iter().find(|rl| {
            let t: String = rl.spans.iter().map(|(t, _)| t.as_str()).collect();
            t.contains("let")
        });
        assert!(code_line.is_some(), "Should have a line with 'let'");
        let has_rgb = code_line.unwrap().spans.iter().any(|(_, s)| {
            matches!(s.fg, Some(Color::Rgb(_, _, _)))
        });
        assert!(has_rgb, "Rust code should have syntect RGB colors");
    }

    #[test]
    fn test_md_code_block_unknown_lang_fallback() {
        let md = "```unknownlang\nsome code\n```";
        let lines = render_markdown(md);
        let text = text_of(&lines);
        assert!(text.contains("some code"), "got: {text}");
    }

    #[test]
    fn test_md_table_basic() {
        let md = "| A | B |\n|---|---|\n| 1 | 2 |";
        let lines = render_markdown(md);
        let text = text_of(&lines);
        assert!(text.contains("A"), "got: {text}");
        assert!(text.contains("1"), "got: {text}");
    }

    #[test]
    fn test_md_bullet_list() {
        let lines = render_markdown("- alpha\n- beta");
        let text = text_of(&lines);
        assert!(text.contains("• alpha"), "got: {text}");
    }

    #[test]
    fn test_md_blockquote() {
        let lines = render_markdown("> quoted");
        let text = text_of(&lines);
        assert!(text.contains("│"), "got: {text}");
        assert!(text.contains("quoted"), "got: {text}");
    }

    #[test]
    fn test_md_link() {
        let lines = render_markdown("[click](https://example.com)");
        let text = text_of(&lines);
        assert!(text.contains("click"), "got: {text}");
        assert!(text.contains("https://example.com"), "got: {text}");
    }

    #[test]
    fn test_md_strikethrough() {
        let lines = render_markdown("~~del~~");
        let text = text_of(&lines);
        assert!(text.contains("d\u{0336}e\u{0336}l\u{0336}"), "got: {text}");
    }

    // ── highlight_code ──────────────────────────────────────────────

    #[test]
    fn test_highlight_code_produces_colored_spans() {
        let lines = highlight_code("rust", "let x = 42;");
        assert!(!lines.is_empty());
        let has_rgb = lines.iter().any(|rl| {
            rl.spans.iter().any(|(_, s)| matches!(s.fg, Some(Color::Rgb(_, _, _))))
        });
        assert!(has_rgb, "Rust code should produce Rgb-colored spans");
    }

    #[test]
    fn test_highlight_code_unknown_lang_no_crash() {
        let lines = highlight_code("zzzzunknownlang", "some code here");
        assert!(!lines.is_empty());
        for rl in &lines {
            for (_, style) in &rl.spans {
                assert_eq!(style.fg, Some(Color::White));
                assert_eq!(style.bg, Some(CODE_BG));
            }
        }
    }

    #[test]
    fn test_highlight_code_empty() {
        let lines = highlight_code("rust", "");
        assert!(!lines.is_empty());
    }

    #[test]
    fn test_highlight_code_typescript_alias() {
        let lines = highlight_code("typescript", "const x: number = 42;");
        let has_rgb = lines.iter().any(|rl| {
            rl.spans.iter().any(|(_, s)| matches!(s.fg, Some(Color::Rgb(_, _, _))))
        });
        assert!(has_rgb, "typescript should be syntax-highlighted");
    }

    // ── lang_from_path ──────────────────────────────────────────────

    #[test]
    fn test_lang_from_path_rust() {
        assert_eq!(lang_from_path("/tmp/test.rs"), "rust");
    }

    #[test]
    fn test_lang_from_path_python() {
        assert_eq!(lang_from_path("/tmp/test.py"), "python");
    }

    #[test]
    fn test_lang_from_path_typescript() {
        let lang = lang_from_path("/tmp/test.ts");
        assert_eq!(lang, "javascript");
    }

    #[test]
    fn test_lang_from_path_unknown() {
        assert_eq!(lang_from_path("/tmp/data.zzz"), "");
    }

    // ── blockquote wrap prefix ──────────────────────────────────────

    #[test]
    fn test_md_blockquote_wrap_preserves_prefix() {
        let long_text = format!("> {}", "word ".repeat(30));
        let lines = render_markdown(&long_text);

        let mut wrapped: Vec<RenderedLine> = Vec::new();
        for line in &lines {
            wrapped.extend(line.wrap(40));
        }

        let blockquote_lines: Vec<String> = wrapped.iter()
            .map(|rl| rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>())
            .filter(|t| !t.is_empty())
            .collect();

        assert!(blockquote_lines.len() >= 2);
        for (i, line_text) in blockquote_lines.iter().enumerate() {
            assert!(line_text.starts_with("│ "),
                "Wrapped blockquote line {i} should start with '│ ', got: {:?}", line_text);
        }
    }
}
