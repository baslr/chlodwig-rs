//! Markdown rendering for the TUI output — converts Markdown text to styled `RenderedLine`s.
//!
//! Uses `pulldown-cmark` for Markdown parsing and `syntect` for syntax highlighting
//! in fenced code blocks.

use pulldown_cmark::{Alignment, CodeBlockKind, Event, Options, Parser, Tag, TagEnd};
use ratatui::style::{Color, Modifier, Style};
use std::sync::OnceLock;
use syntect::easy::HighlightLines;
use syntect::highlighting::{FontStyle, ThemeSet};
use syntect::parsing::SyntaxSet;
use unicode_width::UnicodeWidthStr;

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

// ── Code highlighting ────────────────────────────────────────────────

/// Background style for code blocks.
const CODE_BG: Color = Color::Rgb(45, 45, 45);

/// Map common language aliases to tokens that syntect's default bundle knows.
fn resolve_lang_alias(lang: &str) -> &str {
    match lang {
        "typescript" | "ts" | "tsx" | "jsx" => "javascript",
        "shell" | "zsh" | "fish" => "bash",
        "yml" => "yaml",
        "dockerfile" => "bash",
        "toml" => "yaml",       // close enough fallback
        "jsonc" => "json",
        "cxx" | "cpp" | "cc" | "c++" | "hpp" => "c++",
        "cs" | "csharp" => "c#",
        "kt" | "kotlin" => "java", // close enough
        "swift" => "objective-c",  // close enough
        other => other,
    }
}

/// Highlight a code block with syntect. Falls back to plain styling for unknown languages.
pub(crate) fn highlight_code(lang: &str, code: &str) -> Vec<RenderedLine> {
    let ss = syntax_set();
    let th = theme();

    // Resolve aliases, then try to find syntax by language token
    let resolved = if lang.is_empty() { "" } else { resolve_lang_alias(lang) };
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

            // Empty code block → at least one blank line
            if lines.is_empty() {
                lines.push(RenderedLine::styled("", Style::default().bg(CODE_BG)));
            }

            lines
        }
        None => {
            // Unknown language fallback — plain white on dark bg
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

// ── Markdown rendering ───────────────────────────────────────────────

/// Apply U+0336 (Combining Long Stroke Overlay) after each character to produce
/// a visible strikethrough that works on every terminal — no SGR 9 needed.
fn apply_combining_stroke(text: &str) -> String {
    let mut out = String::with_capacity(text.len() * 2);
    for ch in text.chars() {
        out.push(ch);
        out.push('\u{0336}');
    }
    out
}

/// Merge modifier flags from a style stack into a single Style.
fn merge_styles(stack: &[Style]) -> Style {
    let mut merged = Style::default();
    for s in stack {
        if let Some(fg) = s.fg {
            merged = merged.fg(fg);
        }
        if let Some(bg) = s.bg {
            merged = merged.bg(bg);
        }
        merged.add_modifier = merged.add_modifier | s.add_modifier;
    }
    merged
}

/// Render Markdown text to styled RenderedLines.
///
/// Handles: bold, italic, inline code, headings, lists, blockquotes,
/// horizontal rules, and fenced code blocks with syntax highlighting.
pub fn render_markdown(text: &str) -> Vec<RenderedLine> {
    let options = Options::ENABLE_STRIKETHROUGH
        | Options::ENABLE_TABLES
        | Options::ENABLE_FOOTNOTES;
    let parser = Parser::new_ext(text, options);

    let mut result: Vec<RenderedLine> = Vec::new();
    let mut style_stack: Vec<Style> = Vec::new();
    let mut current_spans: Vec<(String, Style)> = Vec::new();

    // Code block accumulator
    let mut in_code_block = false;
    let mut code_lang = String::new();
    let mut code_buffer = String::new();

    // List tracking
    let mut list_stack: Vec<Option<u64>> = Vec::new(); // None = unordered, Some(n) = ordered
    let mut at_item_start = false;

    // Blockquote depth
    let mut blockquote_depth: usize = 0;

    // Heading prefix
    let mut heading_prefix: Option<String> = None;

    // Link URL accumulator
    let mut link_url: Option<String> = None;

    // Strikethrough flag — when true, text gets U+0336 combining strokes
    let mut in_strikethrough = false;

    // Table accumulator
    let mut in_table = false;
    let mut table_alignments: Vec<Alignment> = Vec::new();
    let mut table_head: Vec<String> = Vec::new();     // header cells
    let mut table_rows: Vec<Vec<String>> = Vec::new(); // body rows
    let mut table_current_row: Vec<String> = Vec::new();
    let mut table_cell_buf = String::new();
    let mut in_table_head = false;

    for event in parser {
        if in_code_block {
            match event {
                Event::Text(t) => {
                    code_buffer.push_str(&t);
                }
                Event::End(TagEnd::CodeBlock) => {
                    // Emit the code block header line
                    let lang_display = if code_lang.is_empty() {
                        "".to_string()
                    } else {
                        code_lang.clone()
                    };
                    result.push(RenderedLine::styled(
                        &format!("  ┌─ {lang_display} ─"),
                        Style::default().fg(Color::DarkGray),
                    ));

                    // Highlight and emit code lines with indent
                    let code = code_buffer.trim_end_matches('\n');
                    let highlighted = highlight_code(&code_lang, code);
                    for rl in highlighted {
                        // Prepend "  │ " indent
                        let mut spans = vec![
                            ("  │ ".to_string(), Style::default().fg(Color::DarkGray)),
                        ];
                        spans.extend(rl.spans);
                        result.push(RenderedLine { spans, wrap_prefix: None });
                    }

                    result.push(RenderedLine::styled(
                        "  └─",
                        Style::default().fg(Color::DarkGray),
                    ));

                    in_code_block = false;
                    code_lang.clear();
                    code_buffer.clear();
                }
                _ => {}
            }
            continue;
        }

        match event {
            Event::Start(Tag::CodeBlock(kind)) => {
                // Flush current line
                flush_line(&mut current_spans, &mut result, blockquote_depth);
                in_code_block = true;
                code_lang = match kind {
                    CodeBlockKind::Fenced(lang) => lang.to_string(),
                    CodeBlockKind::Indented => String::new(),
                };
            }

            Event::Start(Tag::Strong) => {
                style_stack.push(Style::default().add_modifier(Modifier::BOLD));
            }
            Event::End(TagEnd::Strong) => {
                style_stack.pop();
            }

            Event::Start(Tag::Emphasis) => {
                style_stack.push(Style::default().add_modifier(Modifier::ITALIC));
            }
            Event::End(TagEnd::Emphasis) => {
                style_stack.pop();
            }

            Event::Start(Tag::Strikethrough) => {
                let style = Style::default().fg(Color::DarkGray);
                style_stack.push(style);
                in_strikethrough = true;
            }
            Event::End(TagEnd::Strikethrough) => {
                style_stack.pop();
                in_strikethrough = false;
            }

            Event::Start(Tag::Link { dest_url, .. }) => {
                // Push underlined blue style for link text
                link_url = Some(dest_url.to_string());
                style_stack.push(
                    Style::default()
                        .fg(Color::Blue)
                        .add_modifier(Modifier::UNDERLINED),
                );
            }
            Event::End(TagEnd::Link) => {
                style_stack.pop();
                // Append URL in gray after the link text
                if let Some(url) = link_url.take() {
                    current_spans.push((
                        format!(" ({})", url),
                        Style::default().fg(Color::DarkGray),
                    ));
                }
            }

            Event::Start(Tag::Heading { level, .. }) => {
                flush_line(&mut current_spans, &mut result, blockquote_depth);
                let lvl = level as usize;
                let prefix = "#".repeat(lvl);
                heading_prefix = Some(format!("{prefix} "));

                let style = match lvl {
                    1 => Style::default()
                        .add_modifier(Modifier::BOLD)
                        .add_modifier(Modifier::UNDERLINED)
                        .fg(Color::White),
                    2 => Style::default()
                        .add_modifier(Modifier::BOLD)
                        .fg(Color::White),
                    _ => Style::default()
                        .add_modifier(Modifier::BOLD)
                        .fg(Color::Cyan),
                };
                style_stack.push(style);
            }
            Event::End(TagEnd::Heading(_)) => {
                flush_line(&mut current_spans, &mut result, blockquote_depth);
                style_stack.pop();
                heading_prefix = None;
            }

            Event::Start(Tag::BlockQuote(_)) => {
                flush_line(&mut current_spans, &mut result, blockquote_depth);
                blockquote_depth += 1;
            }
            Event::End(TagEnd::BlockQuote(_)) => {
                flush_line(&mut current_spans, &mut result, blockquote_depth);
                blockquote_depth = blockquote_depth.saturating_sub(1);
            }

            Event::Start(Tag::List(start)) => {
                flush_line(&mut current_spans, &mut result, blockquote_depth);
                list_stack.push(start);
            }
            Event::End(TagEnd::List(_)) => {
                list_stack.pop();
            }

            Event::Start(Tag::Item) => {
                flush_line(&mut current_spans, &mut result, blockquote_depth);
                at_item_start = true;
            }
            Event::End(TagEnd::Item) => {
                flush_line(&mut current_spans, &mut result, blockquote_depth);
            }

            Event::Start(Tag::Paragraph) => {
                // Nothing special needed — text will flow into current_spans
            }
            Event::End(TagEnd::Paragraph) => {
                flush_line(&mut current_spans, &mut result, blockquote_depth);
                // Add blank line after paragraph (unless in a list item)
                if list_stack.is_empty() {
                    result.push(RenderedLine::plain(""));
                }
            }

            Event::Code(code) if !in_table => {
                // Inject list marker before inline code if this is the first
                // content in a list item (same logic as Event::Text below).
                if at_item_start {
                    let indent = "  ".repeat(list_stack.len().saturating_sub(1));
                    let marker = match list_stack.last() {
                        Some(Some(n)) => {
                            let num = *n;
                            if let Some(last) = list_stack.last_mut() {
                                *last = Some(num + 1);
                            }
                            format!("{indent}{num}. ")
                        }
                        _ => format!("{indent}• "),
                    };
                    current_spans.push((
                        marker,
                        Style::default().fg(Color::DarkGray),
                    ));
                    at_item_start = false;
                }

                let style = Style::default()
                    .fg(Color::Yellow)
                    .bg(Color::Rgb(40, 40, 40));
                current_spans.push((code.to_string(), style));
            }

            Event::Text(t) if !in_table => {
                // Inject heading prefix at the start of heading text
                if let Some(prefix) = heading_prefix.take() {
                    let style = merge_styles(&style_stack);
                    current_spans.push((prefix, style));
                }

                // Inject list marker at the start of item text
                if at_item_start {
                    let indent = "  ".repeat(list_stack.len().saturating_sub(1));
                    let marker = match list_stack.last() {
                        Some(Some(n)) => {
                            // Ordered list: increment counter
                            let num = *n;
                            if let Some(last) = list_stack.last_mut() {
                                *last = Some(num + 1);
                            }
                            format!("{indent}{num}. ")
                        }
                        _ => format!("{indent}• "),
                    };
                    current_spans.push((
                        marker,
                        Style::default().fg(Color::DarkGray),
                    ));
                    at_item_start = false;
                }

                let style = merge_styles(&style_stack);
                let text_out = if in_strikethrough {
                    // Insert U+0336 (Combining Long Stroke Overlay) after each char
                    apply_combining_stroke(&t)
                } else {
                    t.to_string()
                };
                current_spans.push((text_out, style));
            }

            Event::SoftBreak => {
                current_spans.push((" ".to_string(), Style::default()));
            }
            Event::HardBreak => {
                flush_line(&mut current_spans, &mut result, blockquote_depth);
            }

            Event::Rule => {
                flush_line(&mut current_spans, &mut result, blockquote_depth);
                result.push(RenderedLine::styled(
                    "────────────────────────────────────────",
                    Style::default().fg(Color::DarkGray),
                ));
                result.push(RenderedLine::plain(""));
            }

            // ── Table events ─────────────────────────────────────

            Event::Start(Tag::Table(alignments)) => {
                flush_line(&mut current_spans, &mut result, blockquote_depth);
                in_table = true;
                table_alignments = alignments;
                table_head.clear();
                table_rows.clear();
            }
            Event::End(TagEnd::Table) => {
                // Render the accumulated table
                render_table(
                    &table_head,
                    &table_rows,
                    &table_alignments,
                    &mut result,
                );
                in_table = false;
                table_head.clear();
                table_rows.clear();
                table_alignments.clear();
                result.push(RenderedLine::plain(""));
            }

            Event::Start(Tag::TableHead) => {
                in_table_head = true;
                table_current_row.clear();
            }
            Event::End(TagEnd::TableHead) => {
                table_head = std::mem::take(&mut table_current_row);
                in_table_head = false;
            }

            Event::Start(Tag::TableRow) => {
                table_current_row.clear();
            }
            Event::End(TagEnd::TableRow) => {
                if !in_table_head {
                    table_rows.push(std::mem::take(&mut table_current_row));
                }
            }

            Event::Start(Tag::TableCell) => {
                table_cell_buf.clear();
            }
            Event::End(TagEnd::TableCell) => {
                table_current_row.push(std::mem::take(&mut table_cell_buf));
            }

            Event::Text(t) if in_table => {
                table_cell_buf.push_str(&t);
            }
            Event::Code(c) if in_table => {
                table_cell_buf.push_str(&c);
            }

            _ => {
                // Footnotes, etc — silently skip
            }
        }
    }

    // Flush any remaining spans
    flush_line(&mut current_spans, &mut result, blockquote_depth);

    result
}

/// Render a Markdown table to styled RenderedLines with box-drawing characters.
fn render_table(
    head: &[String],
    rows: &[Vec<String>],
    _alignments: &[Alignment],
    result: &mut Vec<RenderedLine>,
) {
    // Calculate column count and widths
    let col_count = head.len().max(rows.iter().map(|r| r.len()).max().unwrap_or(0));
    if col_count == 0 {
        return;
    }

    // Calculate max display width for each column (unicode-width, not byte length!)
    let mut col_widths: Vec<usize> = vec![0; col_count];
    for (i, cell) in head.iter().enumerate() {
        col_widths[i] = col_widths[i].max(cell.width());
    }
    for row in rows {
        for (i, cell) in row.iter().enumerate() {
            if i < col_count {
                col_widths[i] = col_widths[i].max(cell.width());
            }
        }
    }
    // Minimum column width of 3
    for w in col_widths.iter_mut() {
        *w = (*w).max(3);
    }

    /// Pad `text` with spaces on the right to fill `target_width` display columns.
    /// Uses unicode-width to compute the actual display width, NOT char count.
    fn pad_to_width(text: &str, target_width: usize) -> String {
        let display_w = text.width();
        if display_w >= target_width {
            text.to_string()
        } else {
            format!("{}{}", text, " ".repeat(target_width - display_w))
        }
    }

    let border_style = Style::default().fg(Color::DarkGray);
    let header_style = Style::default().fg(Color::White).add_modifier(Modifier::BOLD);
    let cell_style = Style::default().fg(Color::White);

    // ┌─────┬─────┐
    let top_border = format!(
        "┌{}┐",
        col_widths.iter()
            .map(|w| "─".repeat(w + 2))
            .collect::<Vec<_>>()
            .join("┬")
    );
    result.push(RenderedLine::styled(&top_border, border_style));

    // │ Head1 │ Head2 │
    {
        let mut spans = Vec::new();
        spans.push(("│".to_string(), border_style));
        for (i, w) in col_widths.iter().enumerate() {
            let text = head.get(i).map(|s| s.as_str()).unwrap_or("");
            spans.push((format!(" {} ", pad_to_width(text, *w)), header_style));
            spans.push(("│".to_string(), border_style));
        }
        result.push(RenderedLine { spans, wrap_prefix: None });
    }

    // ├─────┼─────┤
    let mid_border = format!(
        "├{}┤",
        col_widths.iter()
            .map(|w| "─".repeat(w + 2))
            .collect::<Vec<_>>()
            .join("┼")
    );
    result.push(RenderedLine::styled(&mid_border, border_style));

    // Body rows
    for row in rows {
        let mut spans = Vec::new();
        spans.push(("│".to_string(), border_style));
        for (i, w) in col_widths.iter().enumerate() {
            let text = row.get(i).map(|s| s.as_str()).unwrap_or("");
            spans.push((format!(" {} ", pad_to_width(text, *w)), cell_style));
            spans.push(("│".to_string(), border_style));
        }
        result.push(RenderedLine { spans, wrap_prefix: None });
    }

    // └─────┴─────┘
    let bottom_border = format!(
        "└{}┘",
        col_widths.iter()
            .map(|w| "─".repeat(w + 2))
            .collect::<Vec<_>>()
            .join("┴")
    );
    result.push(RenderedLine::styled(&bottom_border, border_style));
}

/// Flush accumulated spans into a RenderedLine. Prepends blockquote prefix if needed.
fn flush_line(
    spans: &mut Vec<(String, Style)>,
    result: &mut Vec<RenderedLine>,
    blockquote_depth: usize,
) {
    if spans.is_empty() {
        return;
    }

    let mut final_spans = Vec::new();

    // Blockquote prefix
    let wrap_prefix = if blockquote_depth > 0 {
        let prefix = "│ ".repeat(blockquote_depth);
        let style = Style::default().fg(Color::Gray);
        final_spans.push((prefix.clone(), style));
        Some((prefix, style))
    } else {
        None
    };

    final_spans.extend(std::mem::take(spans));
    result.push(RenderedLine { spans: final_spans, wrap_prefix });
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

    // ── syntect_to_ratatui ───────────────────────────────────────────

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

    // ── highlight_code ───────────────────────────────────────────────

    #[test]
    fn test_highlight_code_produces_colored_spans() {
        let lines = highlight_code("rust", "let x = 42;");
        assert!(!lines.is_empty());
        // Should have at least one span with a non-default Rgb color
        let has_rgb = lines.iter().any(|rl| {
            rl.spans.iter().any(|(_, s)| matches!(s.fg, Some(Color::Rgb(_, _, _))))
        });
        assert!(has_rgb, "Rust code should produce Rgb-colored spans");
    }

    #[test]
    fn test_highlight_code_unknown_lang_no_crash() {
        let lines = highlight_code("zzzzunknownlang", "some code here");
        assert!(!lines.is_empty());
        // All lines should have fallback style (White on CODE_BG)
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
        assert!(!lines.is_empty(), "Empty code block should produce at least one line");
    }

    #[test]
    fn test_highlight_code_no_lang() {
        let lines = highlight_code("", "plain code");
        assert!(!lines.is_empty());
        // No language → fallback
        for rl in &lines {
            for (_, style) in &rl.spans {
                assert_eq!(style.fg, Some(Color::White));
            }
        }
    }

    // ── render_markdown ──────────────────────────────────────────────

    #[test]
    fn test_md_plain_text() {
        let lines = render_markdown("hello");
        let text = text_of(&lines);
        assert!(text.contains("hello"), "Should contain 'hello', got: {text}");
    }

    #[test]
    fn test_md_bold() {
        let lines = render_markdown("**bold**");
        let spans = find_line_spans(&lines, "bold").expect("Should have line with 'bold'");
        assert!(
            has_modifier(spans, Modifier::BOLD),
            "Bold text should have BOLD modifier, spans: {spans:?}"
        );
    }

    #[test]
    fn test_md_italic() {
        let lines = render_markdown("*italic*");
        let spans = find_line_spans(&lines, "italic").expect("Should have line with 'italic'");
        assert!(
            has_modifier(spans, Modifier::ITALIC),
            "Italic text should have ITALIC modifier, spans: {spans:?}"
        );
    }

    #[test]
    fn test_md_bold_italic_nested() {
        let lines = render_markdown("***bold italic***");
        let spans = find_line_spans(&lines, "bold italic")
            .expect("Should have line with 'bold italic'");
        assert!(has_modifier(spans, Modifier::BOLD), "Should be bold");
        assert!(has_modifier(spans, Modifier::ITALIC), "Should be italic");
    }

    #[test]
    fn test_md_inline_code() {
        let lines = render_markdown("`foo`");
        let spans = find_line_spans(&lines, "foo").expect("Should have line with 'foo'");
        assert!(
            has_fg(spans, Color::Yellow),
            "Inline code should be Yellow, spans: {spans:?}"
        );
    }

    #[test]
    fn test_md_code_block_rust() {
        let md = "```rust\nlet x = 42;\nfn main() {}\n```";
        let lines = render_markdown(md);
        let text = text_of(&lines);
        assert!(text.contains("let x = 42"), "Should contain code: {text}");
        // Should have code block framing
        assert!(text.contains("┌─"), "Should have code block top border");
        assert!(text.contains("└─"), "Should have code block bottom border");
        assert!(text.contains("│"), "Should have code block left border");
    }

    #[test]
    fn test_md_code_block_unknown_lang() {
        let md = "```zzzunknown\nsome code\n```";
        let lines = render_markdown(md);
        let text = text_of(&lines);
        assert!(text.contains("some code"), "Should render unknown lang code: {text}");
    }

    #[test]
    fn test_md_code_block_empty() {
        let md = "```\n```";
        let lines = render_markdown(md);
        // Should not panic, should produce at least the framing
        assert!(!lines.is_empty());
    }

    #[test]
    fn test_md_heading_h1() {
        let lines = render_markdown("# Title");
        let spans = find_line_spans(&lines, "Title").expect("Should have heading line");
        assert!(has_modifier(spans, Modifier::BOLD), "H1 should be bold");
        assert!(has_modifier(spans, Modifier::UNDERLINED), "H1 should be underlined");
        // Should have "# " prefix
        let text: String = spans.iter().map(|(t, _)| t.as_str()).collect();
        assert!(text.starts_with("# "), "H1 should start with '# ', got: {text}");
    }

    #[test]
    fn test_md_heading_h2() {
        let lines = render_markdown("## Subtitle");
        let spans = find_line_spans(&lines, "Subtitle").expect("Should have heading line");
        assert!(has_modifier(spans, Modifier::BOLD), "H2 should be bold");
        let text: String = spans.iter().map(|(t, _)| t.as_str()).collect();
        assert!(text.starts_with("## "), "H2 should start with '## ', got: {text}");
    }

    #[test]
    fn test_md_heading_h3_cyan() {
        let lines = render_markdown("### Section");
        let spans = find_line_spans(&lines, "Section").expect("Should have heading line");
        assert!(has_modifier(spans, Modifier::BOLD), "H3 should be bold");
        assert!(has_fg(spans, Color::Cyan), "H3 should be Cyan");
    }

    #[test]
    fn test_md_bullet_list() {
        let lines = render_markdown("- alpha\n- beta");
        let text = text_of(&lines);
        assert!(text.contains("• alpha"), "Should have bullet prefix, got: {text}");
        assert!(text.contains("• beta"), "Should have bullet prefix, got: {text}");
    }

    #[test]
    fn test_md_numbered_list() {
        let lines = render_markdown("1. first\n2. second");
        let text = text_of(&lines);
        assert!(text.contains("1. first"), "Should have '1. ' prefix, got: {text}");
        assert!(text.contains("2. second"), "Should have '2. ' prefix, got: {text}");
    }

    #[test]
    fn test_md_blockquote() {
        let lines = render_markdown("> quoted text");
        let text = text_of(&lines);
        assert!(text.contains("│"), "Blockquote should have '│' prefix, got: {text}");
        assert!(text.contains("quoted text"), "Should contain text, got: {text}");
    }

    #[test]
    fn test_md_multi_paragraph() {
        let lines = render_markdown("first paragraph\n\nsecond paragraph");
        let text = text_of(&lines);
        assert!(text.contains("first paragraph"), "Should have first para: {text}");
        assert!(text.contains("second paragraph"), "Should have second para: {text}");
        // Should have a blank line between paragraphs
        let line_texts: Vec<String> = lines.iter().map(|rl| {
            rl.spans.iter().map(|(t, _): &(String, Style)| t.as_str()).collect::<String>()
        }).collect();
        let blank_count = line_texts.iter().filter(|l: &&String| l.is_empty()).count();
        assert!(blank_count >= 1, "Should have at least one blank line between paragraphs");
    }

    #[test]
    fn test_md_horizontal_rule() {
        let lines = render_markdown("above\n\n---\n\nbelow");
        let text = text_of(&lines);
        assert!(text.contains("────"), "Should have horizontal rule, got: {text}");
    }

    #[test]
    fn test_md_mixed_content() {
        let md = "# Hello\n\nSome **bold** and *italic* text.\n\n```rust\nlet x = 1;\n```\n\n- item one\n- item two";
        let lines = render_markdown(md);
        let text = text_of(&lines);
        assert!(text.contains("# Hello"));
        assert!(text.contains("bold"));
        assert!(text.contains("italic"));
        assert!(text.contains("let x = 1"));
        assert!(text.contains("• item one"));
        assert!(text.contains("• item two"));
    }

    // ── Table rendering ─────────────────────────────────────────────

    #[test]
    fn test_md_table_basic() {
        let md = "| Name | Age |\n|------|-----|\n| Alice | 30 |\n| Bob | 25 |";
        let lines = render_markdown(md);
        let text = text_of(&lines);
        assert!(text.contains("Name"), "Should contain header 'Name', got:\n{text}");
        assert!(text.contains("Age"), "Should contain header 'Age', got:\n{text}");
        assert!(text.contains("Alice"), "Should contain row data 'Alice', got:\n{text}");
        assert!(text.contains("30"), "Should contain row data '30', got:\n{text}");
        assert!(text.contains("Bob"), "Should contain row data 'Bob', got:\n{text}");
        assert!(text.contains("25"), "Should contain row data '25', got:\n{text}");
    }

    #[test]
    fn test_md_table_has_separators() {
        let md = "| Col1 | Col2 |\n|------|------|\n| a | b |";
        let lines = render_markdown(md);
        let text = text_of(&lines);
        // Table should have some visual separator between header and body
        assert!(text.contains("─") || text.contains("│") || text.contains("|"),
            "Table should have separators, got:\n{text}");
    }

    #[test]
    fn test_md_table_header_styled() {
        let md = "| Key | Value |\n|-----|-------|\n| a | 1 |";
        let lines = render_markdown(md);
        // The header row should have bold modifier
        let header_line = lines.iter().find(|rl| {
            let t: String = rl.spans.iter().map(|(t, _): &(String, Style)| t.as_str()).collect();
            t.contains("Key") && t.contains("Value")
        });
        assert!(header_line.is_some(), "Should have a header line with Key and Value");
        let spans = &header_line.unwrap().spans;
        assert!(has_modifier(spans, Modifier::BOLD), "Table header should be bold");
    }

    #[test]
    fn test_md_table_three_columns() {
        let md = "| A | B | C |\n|---|---|---|\n| 1 | 2 | 3 |\n| x | y | z |";
        let lines = render_markdown(md);
        let text = text_of(&lines);
        assert!(text.contains("A"), "got:\n{text}");
        assert!(text.contains("B"), "got:\n{text}");
        assert!(text.contains("C"), "got:\n{text}");
        assert!(text.contains("1"), "got:\n{text}");
        assert!(text.contains("z"), "got:\n{text}");
    }

    #[test]
    fn test_md_table_emoji_column_alignment() {
        // Emojis like ✅ are 2 display columns wide.
        // All rows of the same column must have equal display width.
        let md = "| Status | Name |\n|---|---|\n| ✅ | Done |\n| ❌ | Fail |";
        let lines = render_markdown(md);
        // Collect all line display widths (border lines + content lines)
        // Every line should have the SAME display width.
        let widths: Vec<usize> = lines.iter()
            .map(|rl| rl.display_width())
            .filter(|&w| w > 0)
            .collect();
        assert!(!widths.is_empty(), "Should have rendered lines");
        let first = widths[0];
        for (i, w) in widths.iter().enumerate() {
            assert_eq!(*w, first,
                "Line {} has display_width {} but expected {} (same as line 0). Lines:\n{}",
                i, w, first,
                lines.iter().map(|rl| {
                    rl.spans.iter().map(|(t, _): &(String, Style)| t.as_str()).collect::<String>()
                }).collect::<Vec<_>>().join("\n")
            );
        }
    }

    // ── Code block language aliases ─────────────────────────────────

    #[test]
    fn test_highlight_code_typescript_alias() {
        // typescript should be mapped to JavaScript syntax, not fall back to plain
        let lines = highlight_code("typescript", "const x: number = 42;");
        // Should have Rgb colors (syntax highlighting), not just plain White
        let has_rgb = lines.iter().any(|rl| {
            rl.spans.iter().any(|(_, s)| matches!(s.fg, Some(Color::Rgb(_, _, _))))
        });
        assert!(has_rgb, "typescript should be syntax-highlighted, not plain fallback. Spans: {:?}",
            lines.iter().flat_map(|rl| rl.spans.iter().map(|(_, s)| s.fg)).collect::<Vec<_>>());
    }

    #[test]
    fn test_highlight_code_ts_alias() {
        let lines = highlight_code("ts", "let x = 1;");
        let has_rgb = lines.iter().any(|rl| {
            rl.spans.iter().any(|(_, s)| matches!(s.fg, Some(Color::Rgb(_, _, _))))
        });
        assert!(has_rgb, "ts should be syntax-highlighted via JavaScript");
    }

    #[test]
    fn test_highlight_code_tsx_alias() {
        let lines = highlight_code("tsx", "const App = () => <div/>;");
        let has_rgb = lines.iter().any(|rl| {
            rl.spans.iter().any(|(_, s)| matches!(s.fg, Some(Color::Rgb(_, _, _))))
        });
        assert!(has_rgb, "tsx should be syntax-highlighted via JavaScript");
    }

    #[test]
    fn test_highlight_code_jsx_alias() {
        let lines = highlight_code("jsx", "const x = <div/>;");
        let has_rgb = lines.iter().any(|rl| {
            rl.spans.iter().any(|(_, s)| matches!(s.fg, Some(Color::Rgb(_, _, _))))
        });
        assert!(has_rgb, "jsx should be syntax-highlighted via JavaScript");
    }

    #[test]
    fn test_highlight_code_bash_alias() {
        // "bash" → syntect knows "sh" and "bash" via Bourne Again Shell
        let lines = highlight_code("bash", "echo hello");
        let has_rgb = lines.iter().any(|rl| {
            rl.spans.iter().any(|(_, s)| matches!(s.fg, Some(Color::Rgb(_, _, _))))
        });
        assert!(has_rgb, "bash should be syntax-highlighted");
    }

    #[test]
    fn test_highlight_code_shell_alias() {
        let lines = highlight_code("shell", "echo hello");
        let has_rgb = lines.iter().any(|rl| {
            rl.spans.iter().any(|(_, s)| matches!(s.fg, Some(Color::Rgb(_, _, _))))
        });
        assert!(has_rgb, "shell should be syntax-highlighted via bash");
    }

    // ── Link rendering ──────────────────────────────────────────────

    #[test]
    fn test_md_link_text_shown() {
        let lines = render_markdown("[click here](https://example.com)");
        let text = text_of(&lines);
        assert!(text.contains("click here"), "Link text should be shown, got:\n{text}");
    }

    #[test]
    fn test_md_link_url_shown() {
        let lines = render_markdown("[docs](https://docs.rs)");
        let text = text_of(&lines);
        assert!(text.contains("https://docs.rs"), "Link URL should be shown, got:\n{text}");
    }

    #[test]
    fn test_md_link_text_underlined() {
        let lines = render_markdown("[click](https://example.com)");
        let spans = find_line_spans(&lines, "click").expect("Should have line with 'click'");
        assert!(has_modifier(spans, Modifier::UNDERLINED),
            "Link text should be underlined, spans: {spans:?}");
    }

    #[test]
    fn test_md_link_url_dimmed() {
        let lines = render_markdown("[click](https://example.com)");
        // URL part should be DarkGray
        let url_line = lines.iter().find(|rl| {
            rl.spans.iter().any(|(t, _): &(String, Style)| t.contains("https://example.com"))
        });
        assert!(url_line.is_some(), "Should have a span containing the URL");
        let url_span = url_line.unwrap().spans.iter()
            .find(|(t, _): &&(String, Style)| t.contains("https://example.com"))
            .unwrap();
        assert_eq!(url_span.1.fg, Some(Color::DarkGray),
            "URL should be DarkGray, got: {:?}", url_span.1);
    }

    #[test]
    fn test_md_link_inline_with_text() {
        let lines = render_markdown("See [the docs](https://docs.rs) for details.");
        let text = text_of(&lines);
        assert!(text.contains("the docs"), "got:\n{text}");
        assert!(text.contains("https://docs.rs"), "got:\n{text}");
        assert!(text.contains("for details"), "got:\n{text}");
    }

    #[test]
    fn test_md_autolink() {
        // Bare URL in angle brackets: <https://example.com>
        let lines = render_markdown("<https://example.com>");
        let text = text_of(&lines);
        assert!(text.contains("https://example.com"), "Autolink should show URL, got:\n{text}");
    }

    // ── Blockquote wrap tests ────────────────────────────────────────

    #[test]
    fn test_md_blockquote_wrap_preserves_prefix() {
        // A long blockquote line that wraps should have │ prefix on EVERY
        // wrapped line, not just the first one.
        let long_text = format!("> {}", "word ".repeat(30)); // ~150 chars
        let lines = render_markdown(&long_text);

        // Simulate wrapping at width 40 (like a narrow terminal)
        let mut wrapped: Vec<RenderedLine> = Vec::new();
        for line in &lines {
            wrapped.extend(line.wrap(40));
        }

        // Every non-empty wrapped line that came from the blockquote
        // should start with the │ prefix
        let blockquote_lines: Vec<String> = wrapped.iter()
            .map(|rl| rl.spans.iter().map(|(t, _): &(String, Style)| t.as_str()).collect::<String>())
            .filter(|t| !t.is_empty())
            .collect();

        assert!(blockquote_lines.len() >= 2,
            "Long blockquote should wrap into multiple lines at width 40, got {} lines:\n{}",
            blockquote_lines.len(), blockquote_lines.join("\n"));

        for (i, line_text) in blockquote_lines.iter().enumerate() {
            assert!(line_text.starts_with("│ "),
                "Wrapped blockquote line {i} should start with '│ ', got: {:?}",
                line_text);
        }
    }

    // ── Strikethrough rendering ─────────────────────────────────────

    #[test]
    fn test_md_strikethrough() {
        let lines = render_markdown("~~deleted~~");
        let text = text_of(&lines);
        // With U+0336 combining strokes, plain "deleted" won't match —
        // check that the base characters are present (with strokes).
        assert!(text.contains("d\u{0336}e\u{0336}l\u{0336}e\u{0336}t\u{0336}e\u{0336}d\u{0336}"),
            "Strikethrough text should be shown with combining strokes, got:\n{text}");
    }

    #[test]
    fn test_md_strikethrough_uses_combining_stroke() {
        // U+0336 (Combining Long Stroke Overlay) works on every terminal,
        // unlike SGR 9 which many terminals ignore.
        let lines = render_markdown("~~ab~~");
        let text = text_of(&lines);
        // Each char should be followed by U+0336
        assert!(text.contains("a\u{0336}b\u{0336}"),
            "Strikethrough should use U+0336 combining overlay, got:\n{text}");
    }

    #[test]
    fn test_md_strikethrough_no_tildes() {
        // No ~~ markers needed — U+0336 is the visual indicator.
        let lines = render_markdown("~~removed~~");
        let text = text_of(&lines);
        assert!(!text.contains('~'),
            "Strikethrough should NOT have tilde markers, got:\n{text}");
    }

    #[test]
    fn test_md_strikethrough_styled() {
        let lines = render_markdown("~~removed~~");
        let spans = find_line_spans(&lines, "r\u{0336}").expect("Should have line with stroked text");
        // DarkGray color for de-emphasis
        let has_gray = spans.iter().any(|(_, s)| s.fg == Some(Color::DarkGray));
        assert!(has_gray, "Strikethrough should be DarkGray, spans: {spans:?}");
    }

    #[test]
    fn test_md_strikethrough_with_other_text() {
        let lines = render_markdown("keep ~~remove~~ keep");
        let text = text_of(&lines);
        assert!(text.contains("keep"), "got:\n{text}");
        assert!(text.contains("r\u{0336}e\u{0336}m\u{0336}o\u{0336}v\u{0336}e\u{0336}"),
            "Strikethrough text should have combining strokes, got:\n{text}");
    }

    #[test]
    fn test_md_strikethrough_unicode_input() {
        // U+0336 must be inserted after each char, including multi-byte ones.
        let lines = render_markdown("~~ä~~");
        let text = text_of(&lines);
        assert!(text.contains("ä\u{0336}"),
            "Strikethrough should work with multi-byte chars, got:\n{text}");
    }

    // ── Ordered list with inline code at start ──────────────────────

    #[test]
    fn test_md_ordered_list_inline_code_first() {
        // Bug: When a list item starts with inline code (backticks) inside bold,
        // the list marker "10. " was injected AFTER the code span instead of before.
        // e.g. "> 10. **`continue` inside**" rendered as "`continue`10. **inside**"
        let md = "10. **`continue` inside drain loop**";
        let lines = render_markdown(md);
        let text = text_of(&lines);
        // The number marker must come BEFORE the inline code
        assert!(
            text.contains("10. "),
            "Should have '10. ' marker, got:\n{text}"
        );
        let marker_pos = text.find("10. ").unwrap();
        let code_pos = text.find("continue").unwrap();
        assert!(
            marker_pos < code_pos,
            "Marker '10. ' (pos {marker_pos}) must come before 'continue' (pos {code_pos}), got:\n{text}"
        );
    }

    #[test]
    fn test_md_ordered_list_double_digit_numbers() {
        // Ensure double-digit list numbers (10, 11) render correctly
        let md = "10. item ten\n11. item eleven";
        let lines = render_markdown(md);
        let text = text_of(&lines);
        assert!(text.contains("10. item ten"), "Should have '10. item ten', got:\n{text}");
        assert!(text.contains("11. item eleven"), "Should have '11. item eleven', got:\n{text}");
    }

    #[test]
    fn test_md_blockquote_ordered_list_inline_code_first() {
        // The exact scenario from the bug report:
        // "> 10. **`continue` inside drain loop blocks**"
        let md = "> 10. **`continue` inside drain loop blocks**";
        let lines = render_markdown(md);
        let text = text_of(&lines);
        // Marker must come before inline code
        let marker_pos = text.find("10. ");
        let code_pos = text.find("continue");
        assert!(marker_pos.is_some(), "Should have '10. ' marker, got:\n{text}");
        assert!(code_pos.is_some(), "Should have 'continue', got:\n{text}");
        assert!(
            marker_pos.unwrap() < code_pos.unwrap(),
            "Marker must come before code. got:\n{text}"
        );
    }
}
