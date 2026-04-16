//! Backend-agnostic Markdown rendering.
//!
//! Parses Markdown via `pulldown-cmark` and produces `StyledLine`s with
//! backend-neutral `MdStyle` annotations. Both the TUI (ratatui) and the
//! GTK (TextBuffer + TextTags) backends convert these into their native
//! types — the parsing logic is shared.
//!
//! Syntax highlighting for fenced code blocks is **not** done here.
//! The core emits code blocks as plain white-on-dark spans tagged with
//! `code_info: Some(lang)`. The TUI backend replaces those spans with
//! syntect-highlighted ones; the GTK backend can use GtkSourceView later.

use pulldown_cmark::{Alignment, CodeBlockKind, Event, Options, Parser, Tag, TagEnd};
use unicode_width::UnicodeWidthStr;

// ── Style types ─────────────────────────────────────────────────────

/// Backend-agnostic foreground/background color.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MdColor {
    /// Default terminal/widget foreground.
    Default,
    White,
    Gray,
    DarkGray,
    Cyan,
    Blue,
    Yellow,
    Green,
    Red,
    Magenta,
    /// Arbitrary RGB color (e.g. from syntax highlighting).
    Rgb(u8, u8, u8),
}

/// Backend-agnostic text style.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct MdStyle {
    pub fg: MdColor,
    pub bg: MdColor,
    pub bold: bool,
    pub italic: bool,
    pub underline: bool,
    /// If true, the text should be rendered in a monospace/code font.
    pub monospace: bool,
    /// If set, this span belongs to a heading of the given level (1–6).
    /// GUI renderers can use this for font-size scaling.
    /// TUI renderers typically ignore this (they can't change font size).
    pub heading_level: Option<u8>,
}

impl Default for MdStyle {
    fn default() -> Self {
        Self {
            fg: MdColor::Default,
            bg: MdColor::Default,
            bold: false,
            italic: false,
            underline: false,
            monospace: false,
            heading_level: None,
        }
    }
}

impl MdStyle {
    pub fn fg(mut self, c: MdColor) -> Self {
        self.fg = c;
        self
    }
    pub fn bg(mut self, c: MdColor) -> Self {
        self.bg = c;
        self
    }
    pub fn bold(mut self) -> Self {
        self.bold = true;
        self
    }
    pub fn italic(mut self) -> Self {
        self.italic = true;
        self
    }
    pub fn underline(mut self) -> Self {
        self.underline = true;
        self
    }
    pub fn monospace(mut self) -> Self {
        self.monospace = true;
        self
    }
    pub fn heading(mut self, level: u8) -> Self {
        self.heading_level = Some(level);
        self
    }
}

/// A single span of text with a style.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct StyledSpan {
    pub text: String,
    pub style: MdStyle,
}

/// A rendered line consisting of styled spans.
///
/// Optionally carries `code_info` — when set, this line belongs to a fenced
/// code block with the given language tag. Backends can use this to apply
/// syntax highlighting or monospace styling.
#[derive(Debug, Clone)]
pub struct StyledLine {
    pub spans: Vec<StyledSpan>,
    /// Prefix to repeat on continuation lines when wrapping (e.g. blockquote `│ `).
    pub wrap_prefix: Option<StyledSpan>,
    /// If this line is part of a fenced code block, the language tag (may be empty).
    pub code_info: Option<String>,
}

impl StyledLine {
    /// Create a line with a single plain-text span.
    pub fn plain(text: &str) -> Self {
        Self {
            spans: vec![StyledSpan {
                text: text.to_string(),
                style: MdStyle::default(),
            }],
            wrap_prefix: None,
            code_info: None,
        }
    }

    /// Create a line with a single styled span.
    pub fn styled(text: &str, style: MdStyle) -> Self {
        Self {
            spans: vec![StyledSpan {
                text: text.to_string(),
                style,
            }],
            wrap_prefix: None,
            code_info: None,
        }
    }

    /// Total display width in terminal columns (unicode-width).
    pub fn display_width(&self) -> usize {
        self.spans.iter().map(|s| s.text.width()).sum()
    }

    /// Collect all span texts into a single string.
    pub fn text(&self) -> String {
        self.spans.iter().map(|s| s.text.as_str()).collect()
    }
}

// ── Background for code blocks ──────────────────────────────────────

const CODE_BG: MdColor = MdColor::Rgb(45, 45, 45);

// ── Markdown rendering ──────────────────────────────────────────────

/// Render Markdown text to styled lines (unlimited viewport width).
pub fn render_markdown(text: &str) -> Vec<StyledLine> {
    render_markdown_with_width(text, usize::MAX)
}

/// Render Markdown text to styled lines, wrapping table columns to fit
/// within `viewport_width` terminal columns.
pub fn render_markdown_with_width(text: &str, viewport_width: usize) -> Vec<StyledLine> {
    render_markdown_with_table_overrides(text, viewport_width, &[])
}

/// Render Markdown text to styled lines, with optional sorted table overrides.
///
/// `table_overrides` maps table index (0-based, in order of appearance) to
/// a `TableData` whose sorted rows replace the original table's rows.
/// Tables without an override are rendered from the Markdown source as usual.
pub fn render_markdown_with_table_overrides(
    text: &str,
    viewport_width: usize,
    table_overrides: &[(usize, &TableData)],
) -> Vec<StyledLine> {
    let options = Options::ENABLE_STRIKETHROUGH
        | Options::ENABLE_TABLES
        | Options::ENABLE_FOOTNOTES;
    let parser = Parser::new_ext(text, options);

    let mut result: Vec<StyledLine> = Vec::new();
    let mut style_stack: Vec<MdStyle> = Vec::new();
    let mut current_spans: Vec<StyledSpan> = Vec::new();

    // Code block accumulator
    let mut in_code_block = false;
    let mut code_lang = String::new();
    let mut code_buffer = String::new();

    // List tracking
    let mut list_stack: Vec<Option<u64>> = Vec::new();
    let mut at_item_start = false;

    // Blockquote depth
    let mut blockquote_depth: usize = 0;

    // Heading prefix
    let mut heading_prefix: Option<String> = None;

    // Link URL accumulator
    let mut link_url: Option<String> = None;

    // Strikethrough flag
    let mut in_strikethrough = false;

    // Table accumulator
    let mut in_table = false;
    let mut table_alignments: Vec<Alignment> = Vec::new();
    let mut table_head: Vec<String> = Vec::new();
    let mut table_rows: Vec<Vec<String>> = Vec::new();
    let mut table_current_row: Vec<String> = Vec::new();
    let mut table_cell_buf = String::new();
    let mut in_table_head = false;
    let mut table_counter: usize = 0; // counts tables for override lookup

    for event in parser {
        if in_code_block {
            match event {
                Event::Text(t) => {
                    code_buffer.push_str(&t);
                }
                Event::End(TagEnd::CodeBlock) => {
                    // Emit code block header
                    let lang_display = if code_lang.is_empty() {
                        "".to_string()
                    } else {
                        code_lang.clone()
                    };
                    result.push(StyledLine::styled(
                        &format!("  ┌─ {lang_display} ─"),
                        MdStyle::default().fg(MdColor::DarkGray),
                    ));

                    // Emit code lines with indent — plain styling, tagged with code_info
                    let code = code_buffer.trim_end_matches('\n');
                    let code_style = MdStyle::default()
                        .fg(MdColor::White)
                        .bg(CODE_BG)
                        .monospace();
                    let border_style = MdStyle::default().fg(MdColor::DarkGray);

                    if code.is_empty() {
                        let mut line = StyledLine {
                            spans: vec![
                                StyledSpan {
                                    text: "  │ ".to_string(),
                                    style: border_style,
                                },
                                StyledSpan {
                                    text: String::new(),
                                    style: code_style,
                                },
                            ],
                            wrap_prefix: None,
                            code_info: Some(code_lang.clone()),
                        };
                        let _ = &mut line; // suppress warning
                        result.push(line);
                    } else {
                        for code_line in code.lines() {
                            result.push(StyledLine {
                                spans: vec![
                                    StyledSpan {
                                        text: "  │ ".to_string(),
                                        style: border_style,
                                    },
                                    StyledSpan {
                                        text: code_line.to_string(),
                                        style: code_style,
                                    },
                                ],
                                wrap_prefix: None,
                                code_info: Some(code_lang.clone()),
                            });
                        }
                    }

                    result.push(StyledLine::styled(
                        "  └─",
                        MdStyle::default().fg(MdColor::DarkGray),
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
                flush_line(&mut current_spans, &mut result, blockquote_depth);
                in_code_block = true;
                code_lang = match kind {
                    CodeBlockKind::Fenced(lang) => lang.to_string(),
                    CodeBlockKind::Indented => String::new(),
                };
            }

            Event::Start(Tag::Strong) => {
                style_stack.push(MdStyle::default().bold());
            }
            Event::End(TagEnd::Strong) => {
                style_stack.pop();
            }

            Event::Start(Tag::Emphasis) => {
                style_stack.push(MdStyle::default().italic());
            }
            Event::End(TagEnd::Emphasis) => {
                style_stack.pop();
            }

            Event::Start(Tag::Strikethrough) => {
                style_stack.push(MdStyle::default().fg(MdColor::DarkGray));
                in_strikethrough = true;
            }
            Event::End(TagEnd::Strikethrough) => {
                style_stack.pop();
                in_strikethrough = false;
            }

            Event::Start(Tag::Link { dest_url, .. }) => {
                link_url = Some(dest_url.to_string());
                style_stack.push(MdStyle::default().fg(MdColor::Blue).underline());
            }
            Event::End(TagEnd::Link) => {
                style_stack.pop();
                if let Some(url) = link_url.take() {
                    current_spans.push(StyledSpan {
                        text: format!(" ({})", url),
                        style: MdStyle::default().fg(MdColor::DarkGray),
                    });
                }
            }

            Event::Start(Tag::Heading { level, .. }) => {
                flush_line(&mut current_spans, &mut result, blockquote_depth);
                let lvl = level as usize;
                let prefix = "#".repeat(lvl);
                heading_prefix = Some(format!("{prefix} "));

                let style = match lvl {
                    1 => MdStyle::default().bold().underline().fg(MdColor::White).heading(lvl as u8),
                    2 => MdStyle::default().bold().fg(MdColor::White).heading(lvl as u8),
                    _ => MdStyle::default().bold().fg(MdColor::Cyan).heading(lvl as u8),
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

            Event::Start(Tag::Paragraph) => {}
            Event::End(TagEnd::Paragraph) => {
                flush_line(&mut current_spans, &mut result, blockquote_depth);
                if list_stack.is_empty() {
                    result.push(StyledLine::plain(""));
                }
            }

            Event::Code(code) if !in_table => {
                if at_item_start {
                    inject_list_marker(&mut current_spans, &mut list_stack);
                    at_item_start = false;
                }
                current_spans.push(StyledSpan {
                    text: code.to_string(),
                    style: MdStyle::default()
                        .fg(MdColor::Yellow)
                        .bg(MdColor::Rgb(40, 40, 40))
                        .monospace(),
                });
            }

            Event::Text(t) if !in_table => {
                if let Some(prefix) = heading_prefix.take() {
                    let style = merge_styles(&style_stack);
                    current_spans.push(StyledSpan {
                        text: prefix,
                        style,
                    });
                }

                if at_item_start {
                    inject_list_marker(&mut current_spans, &mut list_stack);
                    at_item_start = false;
                }

                let style = merge_styles(&style_stack);
                let text_out = if in_strikethrough {
                    apply_combining_stroke(&t)
                } else {
                    t.to_string()
                };
                current_spans.push(StyledSpan {
                    text: text_out,
                    style,
                });
            }

            Event::SoftBreak => {
                current_spans.push(StyledSpan {
                    text: " ".to_string(),
                    style: MdStyle::default(),
                });
            }
            Event::HardBreak => {
                flush_line(&mut current_spans, &mut result, blockquote_depth);
            }

            Event::Rule => {
                flush_line(&mut current_spans, &mut result, blockquote_depth);
                result.push(StyledLine::styled(
                    "────────────────────────────────────────",
                    MdStyle::default().fg(MdColor::DarkGray),
                ));
                result.push(StyledLine::plain(""));
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
                // Check for a sorted table override
                if let Some((_idx, td)) = table_overrides.iter().find(|(idx, _)| *idx == table_counter) {
                    let lines = td.render(viewport_width);
                    result.extend(lines);
                } else {
                    render_table(
                        &table_head,
                        &table_rows,
                        &table_alignments,
                        viewport_width,
                        &mut result,
                    );
                }
                table_counter += 1;
                in_table = false;
                table_head.clear();
                table_rows.clear();
                table_alignments.clear();
                result.push(StyledLine::plain(""));
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

            _ => {}
        }
    }

    flush_line(&mut current_spans, &mut result, blockquote_depth);
    result
}

// ── Helpers ─────────────────────────────────────────────────────────

/// Apply U+0336 (Combining Long Stroke Overlay) after each character for strikethrough.
fn apply_combining_stroke(text: &str) -> String {
    let mut out = String::with_capacity(text.len() * 2);
    for ch in text.chars() {
        out.push(ch);
        out.push('\u{0336}');
    }
    out
}

/// Merge modifier flags from a style stack into a single MdStyle.
fn merge_styles(stack: &[MdStyle]) -> MdStyle {
    let mut merged = MdStyle::default();
    for s in stack {
        if s.fg != MdColor::Default {
            merged.fg = s.fg;
        }
        if s.bg != MdColor::Default {
            merged.bg = s.bg;
        }
        merged.bold = merged.bold || s.bold;
        merged.italic = merged.italic || s.italic;
        merged.underline = merged.underline || s.underline;
        merged.monospace = merged.monospace || s.monospace;
        if s.heading_level.is_some() {
            merged.heading_level = s.heading_level;
        }
    }
    merged
}

/// Inject a list marker (bullet or number) into the current spans.
fn inject_list_marker(spans: &mut Vec<StyledSpan>, list_stack: &mut [Option<u64>]) {
    let depth = list_stack.len();
    let indent = "  ".repeat(depth.saturating_sub(1));
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
    spans.push(StyledSpan {
        text: marker,
        style: MdStyle::default().fg(MdColor::DarkGray),
    });
}

/// Flush accumulated spans into a StyledLine. Prepends blockquote prefix if needed.
fn flush_line(
    spans: &mut Vec<StyledSpan>,
    result: &mut Vec<StyledLine>,
    blockquote_depth: usize,
) {
    if spans.is_empty() {
        return;
    }

    let mut final_spans = Vec::new();
    let wrap_prefix = if blockquote_depth > 0 {
        let prefix = "│ ".repeat(blockquote_depth);
        let style = MdStyle::default().fg(MdColor::Gray);
        final_spans.push(StyledSpan {
            text: prefix.clone(),
            style,
        });
        Some(StyledSpan {
            text: prefix,
            style,
        })
    } else {
        None
    };

    final_spans.extend(std::mem::take(spans));
    result.push(StyledLine {
        spans: final_spans,
        wrap_prefix,
        code_info: None,
    });
}

// ── TableData: sortable table structure ─────────────────────────────

/// Parsed table data that can be sorted by any column and re-rendered.
///
/// Extracted from Markdown by `extract_tables()`. The GTK frontend uses this
/// to implement clickable-header sorting: click a column header → sort rows
/// by that column → re-render the table region in the TextBuffer.
#[derive(Debug, Clone)]
pub struct TableData {
    /// Header cells.
    pub head: Vec<String>,
    /// Body rows — each row is a Vec of cell strings.
    pub rows: Vec<Vec<String>>,
    /// Column alignments from Markdown.
    pub alignments: Vec<Alignment>,
    /// Which column is currently sorted (None = original order).
    pub sort_column: Option<usize>,
    /// Sort direction: false = ascending, true = descending.
    pub sort_descending: bool,
}

impl TableData {
    pub fn new(head: Vec<String>, rows: Vec<Vec<String>>, alignments: Vec<Alignment>) -> Self {
        Self {
            head,
            rows,
            alignments,
            sort_column: None,
            sort_descending: false,
        }
    }

    /// Return a new `TableData` with rows sorted by `col_index`.
    /// If `descending` is true, sort in reverse order.
    /// Heuristic: if ALL non-empty cells in the column parse as `f64`, sort numerically.
    /// Otherwise sort alphabetically (case-insensitive).
    pub fn sorted_by_column(&self, col_index: usize, descending: bool) -> Self {
        let mut sorted = self.clone();
        sorted.sort_column = Some(col_index);
        sorted.sort_descending = descending;

        let get_cell = |row: &Vec<String>| -> String {
            row.get(col_index).cloned().unwrap_or_default()
        };

        /// Parse a number that may use comma or dot as decimal separator.
        /// "10,5" → 10.5, "3.14" → 3.14, "1.000,5" → 1000.5 (thousand-sep dot)
        fn parse_number(s: &str) -> Option<f64> {
            let s = s.trim();
            if s.is_empty() { return None; }

            // Helper: check if all dots in s are thousand separators
            // (each dot is followed by exactly 3 digits, then end-of-string or another dot)
            fn dots_are_thousands(s: &str) -> bool {
                let parts: Vec<&str> = s.split('.').collect();
                if parts.len() < 2 { return false; }
                // First part can be 1-3 digits, all subsequent must be exactly 3
                if parts[0].is_empty() || !parts[0].chars().all(|c| c.is_ascii_digit()) {
                    return false;
                }
                parts[1..].iter().all(|p| p.len() == 3 && p.chars().all(|c| c.is_ascii_digit()))
            }

            fn commas_are_thousands(s: &str) -> bool {
                let parts: Vec<&str> = s.split(',').collect();
                if parts.len() < 2 { return false; }
                if parts[0].is_empty() || !parts[0].chars().all(|c| c.is_ascii_digit()) {
                    return false;
                }
                parts[1..].iter().all(|p| p.len() == 3 && p.chars().all(|c| c.is_ascii_digit()))
            }

            let has_dot = s.contains('.');
            let has_comma = s.contains(',');

            let normalized = if has_comma && has_dot {
                // Both present: the last one is the decimal separator
                let last_dot = s.rfind('.').unwrap();
                let last_comma = s.rfind(',').unwrap();
                if last_comma > last_dot {
                    s.replace('.', "").replace(',', ".")
                } else {
                    s.replace(',', "")
                }
            } else if has_dot && dots_are_thousands(s) {
                // "312.696" "1.234.567" → thousand separators, remove dots
                s.replace('.', "")
            } else if has_comma && commas_are_thousands(s) {
                // "1,000" "1,234,567" → thousand separators, remove commas
                s.replace(',', "")
            } else if has_comma && !has_dot {
                // "10,5" → decimal comma
                s.replace(',', ".")
            } else {
                // "3.14" or plain number
                s.to_string()
            };
            normalized.parse::<f64>().ok()
        }

        // Check if all non-empty values are numeric
        let all_numeric = sorted.rows.iter().all(|row| {
            let cell = get_cell(row);
            cell.trim().is_empty() || parse_number(&cell).is_some()
        });

        sorted.rows.sort_by(|a, b| {
            let va = get_cell(a);
            let vb = get_cell(b);
            let cmp = if all_numeric {
                let na = parse_number(&va).unwrap_or(f64::NEG_INFINITY);
                let nb = parse_number(&vb).unwrap_or(f64::NEG_INFINITY);
                na.partial_cmp(&nb).unwrap_or(std::cmp::Ordering::Equal)
            } else {
                va.to_lowercase().cmp(&vb.to_lowercase())
            };
            if descending { cmp.reverse() } else { cmp }
        });

        sorted
    }

    /// Render this table to styled lines, fitting within `viewport_width`.
    /// Adds a sort indicator (▲/▼) to the sorted column header.
    pub fn render(&self, viewport_width: usize) -> Vec<StyledLine> {
        // Build header with sort indicator
        let head_with_indicator: Vec<String> = self.head.iter().enumerate().map(|(i, h)| {
            if self.sort_column == Some(i) {
                let arrow = if self.sort_descending { "▼" } else { "▲" };
                format!("{h} {arrow}")
            } else {
                h.clone()
            }
        }).collect();

        let mut result = Vec::new();
        render_table(
            &head_with_indicator,
            &self.rows,
            &self.alignments,
            viewport_width,
            &mut result,
        );
        result
    }
}

/// Extract all tables from a Markdown string as `TableData` structs.
/// The returned tables preserve the original row order.
pub fn extract_tables(markdown: &str) -> Vec<TableData> {
    let options = Options::ENABLE_STRIKETHROUGH
        | Options::ENABLE_TABLES
        | Options::ENABLE_FOOTNOTES;
    let parser = Parser::new_ext(markdown, options);

    let mut tables = Vec::new();
    let mut in_table = false;
    let mut in_head = false;
    let mut table_head: Vec<String> = Vec::new();
    let mut table_rows: Vec<Vec<String>> = Vec::new();
    let mut table_alignments: Vec<Alignment> = Vec::new();
    let mut current_row: Vec<String> = Vec::new();
    let mut current_cell = String::new();

    for event in parser {
        match event {
            Event::Start(Tag::Table(alignments)) => {
                in_table = true;
                table_alignments = alignments;
                table_head.clear();
                table_rows.clear();
            }
            Event::End(TagEnd::Table) => {
                tables.push(TableData::new(
                    std::mem::take(&mut table_head),
                    std::mem::take(&mut table_rows),
                    std::mem::take(&mut table_alignments),
                ));
                in_table = false;
            }
            Event::Start(Tag::TableHead) => { in_head = true; }
            Event::End(TagEnd::TableHead) => {
                table_head = std::mem::take(&mut current_row);
                in_head = false;
            }
            Event::Start(Tag::TableRow) => {}
            Event::End(TagEnd::TableRow) => {
                if !in_head {
                    table_rows.push(std::mem::take(&mut current_row));
                }
            }
            Event::Start(Tag::TableCell) => { current_cell.clear(); }
            Event::End(TagEnd::TableCell) => {
                current_row.push(std::mem::take(&mut current_cell));
            }
            Event::Text(text) if in_table => {
                current_cell.push_str(&text);
            }
            Event::Code(code) if in_table => {
                current_cell.push_str(&code);
            }
            _ => {}
        }
    }

    tables
}

// ── Table rendering ─────────────────────────────────────────────────

fn render_table(
    head: &[String],
    rows: &[Vec<String>],
    _alignments: &[Alignment],
    viewport_width: usize,
    result: &mut Vec<StyledLine>,
) {
    let col_count = head.len().max(rows.iter().map(|r| r.len()).max().unwrap_or(0));
    if col_count == 0 {
        return;
    }

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
    for w in col_widths.iter_mut() {
        *w = (*w).max(3);
    }

    let border_overhead = 3 * col_count + 1;
    let total_natural: usize = col_widths.iter().sum::<usize>() + border_overhead;

    if viewport_width < usize::MAX
        && total_natural > viewport_width
        && viewport_width > border_overhead
    {
        let available = viewport_width - border_overhead;
        shrink_columns(&mut col_widths, available);
    }

    let border_style = MdStyle::default().fg(MdColor::DarkGray).monospace();
    let header_style = MdStyle::default().fg(MdColor::White).bold().monospace();
    let cell_style = MdStyle::default().fg(MdColor::White).monospace();

    // ┌─────┬─────┐
    result.push(emit_border(&col_widths, "┌", "┬", "┐", "─", border_style));

    // Header row
    emit_row(head, &col_widths, col_count, border_style, header_style, result);

    // ├─────┼─────┤
    result.push(emit_border(&col_widths, "├", "┼", "┤", "─", border_style));

    // Body rows
    for row in rows {
        emit_row(row, &col_widths, col_count, border_style, cell_style, result);
    }

    // └─────┴─────┘
    result.push(emit_border(&col_widths, "└", "┴", "┘", "─", border_style));
}

fn pad_to_width(text: &str, target_width: usize) -> String {
    let display_w = text.width();
    if display_w >= target_width {
        text.to_string()
    } else {
        format!("{}{}", text, " ".repeat(target_width - display_w))
    }
}

fn wrap_cell(text: &str, col_w: usize) -> Vec<String> {
    if text.width() <= col_w {
        return vec![text.to_string()];
    }
    let mut lines = Vec::new();
    let mut current = String::new();
    let mut current_w: usize = 0;

    for word in text.split_inclusive(' ') {
        let word_w = word.width();
        if current_w + word_w <= col_w || current.is_empty() {
            current.push_str(word);
            current_w += word_w;
        } else {
            lines.push(current);
            current = word.to_string();
            current_w = word_w;
        }
    }
    if !current.is_empty() {
        lines.push(current);
    }

    // Force-break lines wider than col_w
    let mut final_lines = Vec::new();
    for line in lines {
        if line.width() <= col_w {
            final_lines.push(line);
        } else {
            let mut buf = String::new();
            let mut buf_w: usize = 0;
            for ch in line.chars() {
                let ch_w = unicode_width::UnicodeWidthChar::width(ch).unwrap_or(0);
                if buf_w + ch_w > col_w && !buf.is_empty() {
                    final_lines.push(buf);
                    buf = String::new();
                    buf_w = 0;
                }
                buf.push(ch);
                buf_w += ch_w;
            }
            if !buf.is_empty() {
                final_lines.push(buf);
            }
        }
    }

    if final_lines.is_empty() {
        final_lines.push(String::new());
    }
    final_lines
}

fn emit_border(
    col_widths: &[usize],
    left: &str,
    mid: &str,
    right: &str,
    fill: &str,
    border_style: MdStyle,
) -> StyledLine {
    let inner = col_widths
        .iter()
        .map(|w| fill.repeat(w + 2))
        .collect::<Vec<_>>()
        .join(mid);
    StyledLine::styled(&format!("{left}{inner}{right}"), border_style)
}

fn emit_row(
    cells: &[String],
    col_widths: &[usize],
    col_count: usize,
    border_style: MdStyle,
    content_style: MdStyle,
    result: &mut Vec<StyledLine>,
) {
    let wrapped_cells: Vec<Vec<String>> = (0..col_count)
        .map(|i| {
            let text = cells.get(i).map(|s| s.as_str()).unwrap_or("");
            wrap_cell(text, col_widths[i])
        })
        .collect();
    let max_lines = wrapped_cells.iter().map(|c| c.len()).max().unwrap_or(1);

    for line_idx in 0..max_lines {
        let mut spans = Vec::new();
        spans.push(StyledSpan {
            text: "│".to_string(),
            style: border_style,
        });
        for (col_idx, w) in col_widths.iter().enumerate() {
            let cell_text = wrapped_cells[col_idx]
                .get(line_idx)
                .map(|s| s.as_str())
                .unwrap_or("");
            spans.push(StyledSpan {
                text: format!(" {} ", pad_to_width(cell_text, *w)),
                style: content_style,
            });
            spans.push(StyledSpan {
                text: "│".to_string(),
                style: border_style,
            });
        }
        result.push(StyledLine {
            spans,
            wrap_prefix: None,
            code_info: None,
        });
    }
}

/// Shrink column widths proportionally to fit within `available` total width.
fn shrink_columns(col_widths: &mut [usize], available: usize) {
    let total: usize = col_widths.iter().sum();
    if total <= available {
        return;
    }
    let col_count = col_widths.len();
    let min_width = 3usize;

    let fair_min = (available / (col_count + 1)).max(min_width);

    let mut new_widths: Vec<usize> = col_widths
        .iter()
        .map(|&w| {
            let proportional = (w as f64 * available as f64 / total as f64).floor() as usize;
            proportional.max(fair_min)
        })
        .collect();

    let new_total: usize = new_widths.iter().sum();
    if new_total < available {
        let mut remaining = available - new_total;
        let mut indices: Vec<usize> = (0..new_widths.len()).collect();
        indices.sort_by(|&a, &b| col_widths[b].cmp(&col_widths[a]));
        for &i in &indices {
            if remaining == 0 {
                break;
            }
            new_widths[i] += 1;
            remaining -= 1;
        }
    } else if new_total > available {
        let mut excess = new_total - available;
        let mut indices: Vec<usize> = (0..new_widths.len()).collect();
        indices.sort_by(|&a, &b| new_widths[b].cmp(&new_widths[a]));
        for &i in &indices {
            if excess == 0 {
                break;
            }
            let can_shrink = new_widths[i].saturating_sub(min_width);
            let shrink = can_shrink.min(excess);
            new_widths[i] -= shrink;
            excess -= shrink;
        }
    }

    col_widths.copy_from_slice(&new_widths);
}

// ── Tests ───────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    /// Helper: collect all text from styled lines.
    fn text_of(lines: &[StyledLine]) -> String {
        lines.iter().map(|l| l.text()).collect::<Vec<_>>().join("\n")
    }

    /// Helper: find first line containing `needle`.
    fn find_line<'a>(lines: &'a [StyledLine], needle: &str) -> Option<&'a StyledLine> {
        lines.iter().find(|l| l.text().contains(needle))
    }

    /// Helper: check if any span in the line has bold.
    fn has_bold(line: &StyledLine) -> bool {
        line.spans.iter().any(|s| s.style.bold)
    }

    /// Helper: check if any span has italic.
    fn has_italic(line: &StyledLine) -> bool {
        line.spans.iter().any(|s| s.style.italic)
    }

    /// Helper: check if any span has underline.
    fn has_underline(line: &StyledLine) -> bool {
        line.spans.iter().any(|s| s.style.underline)
    }

    /// Helper: check if any span has a specific fg color.
    fn has_fg(line: &StyledLine, color: MdColor) -> bool {
        line.spans.iter().any(|s| s.style.fg == color)
    }

    // ── MdStyle type tests ──────────────────────────────────────────

    #[test]
    fn test_md_style_default() {
        let s = MdStyle::default();
        assert_eq!(s.fg, MdColor::Default);
        assert_eq!(s.bg, MdColor::Default);
        assert!(!s.bold);
        assert!(!s.italic);
        assert!(!s.underline);
        assert!(!s.monospace);
    }

    #[test]
    fn test_md_style_builder() {
        let s = MdStyle::default().fg(MdColor::Red).bold().italic().monospace();
        assert_eq!(s.fg, MdColor::Red);
        assert!(s.bold);
        assert!(s.italic);
        assert!(s.monospace);
        assert!(!s.underline);
    }

    #[test]
    fn test_styled_line_plain() {
        let l = StyledLine::plain("hello");
        assert_eq!(l.text(), "hello");
        assert_eq!(l.display_width(), 5);
        assert!(l.code_info.is_none());
    }

    #[test]
    fn test_styled_line_display_width_cjk() {
        let l = StyledLine::plain("日本語");
        // CJK characters are 2 columns each
        assert_eq!(l.display_width(), 6);
    }

    // ── Plain text ──────────────────────────────────────────────────

    #[test]
    fn test_md_plain_text() {
        let lines = render_markdown("hello");
        let text = text_of(&lines);
        assert!(text.contains("hello"), "got: {text}");
    }

    // ── Bold ────────────────────────────────────────────────────────

    #[test]
    fn test_md_bold() {
        let lines = render_markdown("**bold**");
        let line = find_line(&lines, "bold").expect("should have 'bold'");
        assert!(has_bold(line), "Bold text should be bold, spans: {:?}", line.spans);
    }

    // ── Italic ──────────────────────────────────────────────────────

    #[test]
    fn test_md_italic() {
        let lines = render_markdown("*italic*");
        let line = find_line(&lines, "italic").expect("should have 'italic'");
        assert!(has_italic(line), "Italic text should be italic");
    }

    // ── Bold + Italic ───────────────────────────────────────────────

    #[test]
    fn test_md_bold_italic_nested() {
        let lines = render_markdown("***both***");
        let line = find_line(&lines, "both").expect("should have 'both'");
        assert!(has_bold(line), "Should be bold");
        assert!(has_italic(line), "Should be italic");
    }

    // ── Inline code ─────────────────────────────────────────────────

    #[test]
    fn test_md_inline_code() {
        let lines = render_markdown("`foo`");
        let line = find_line(&lines, "foo").expect("should have 'foo'");
        assert!(has_fg(line, MdColor::Yellow), "Inline code should be Yellow");
        // Should be monospace
        assert!(
            line.spans.iter().any(|s| s.text.contains("foo") && s.style.monospace),
            "Inline code should be monospace"
        );
    }

    // ── Headings ────────────────────────────────────────────────────

    #[test]
    fn test_md_heading_h1() {
        let lines = render_markdown("# Title");
        let line = find_line(&lines, "Title").expect("should have heading");
        assert!(has_bold(line), "H1 should be bold");
        assert!(has_underline(line), "H1 should be underlined");
        assert!(line.text().starts_with("# "), "H1 should start with '# '");
    }

    #[test]
    fn test_md_heading_h2() {
        let lines = render_markdown("## Subtitle");
        let line = find_line(&lines, "Subtitle").expect("should have heading");
        assert!(has_bold(line), "H2 should be bold");
        assert!(line.text().starts_with("## "), "H2 should start with '## '");
    }

    #[test]
    fn test_md_heading_h3_cyan() {
        let lines = render_markdown("### Section");
        let line = find_line(&lines, "Section").expect("should have heading");
        assert!(has_bold(line), "H3 should be bold");
        assert!(has_fg(line, MdColor::Cyan), "H3 should be Cyan");
    }

    #[test]
    fn test_md_heading_h1_has_heading_level() {
        let lines = render_markdown("# Title");
        let line = find_line(&lines, "Title").expect("should have heading");
        assert!(
            line.spans.iter().any(|s| s.style.heading_level == Some(1)),
            "H1 spans should carry heading_level=1"
        );
    }

    #[test]
    fn test_md_heading_h2_has_heading_level() {
        let lines = render_markdown("## Subtitle");
        let line = find_line(&lines, "Subtitle").expect("should have heading");
        assert!(
            line.spans.iter().any(|s| s.style.heading_level == Some(2)),
            "H2 spans should carry heading_level=2"
        );
    }

    #[test]
    fn test_md_heading_h3_has_heading_level() {
        let lines = render_markdown("### Section");
        let line = find_line(&lines, "Section").expect("should have heading");
        assert!(
            line.spans.iter().any(|s| s.style.heading_level == Some(3)),
            "H3 spans should carry heading_level=3"
        );
    }

    #[test]
    fn test_md_heading_h4_has_heading_level() {
        let lines = render_markdown("#### Sub-section");
        let line = find_line(&lines, "Sub-section").expect("should have heading");
        assert!(
            line.spans.iter().any(|s| s.style.heading_level == Some(4)),
            "H4 spans should carry heading_level=4"
        );
    }

    #[test]
    fn test_md_heading_h5_has_heading_level() {
        let lines = render_markdown("##### Minor");
        let line = find_line(&lines, "Minor").expect("should have heading");
        assert!(
            line.spans.iter().any(|s| s.style.heading_level == Some(5)),
            "H5 spans should carry heading_level=5"
        );
    }

    #[test]
    fn test_md_heading_h6_has_heading_level() {
        let lines = render_markdown("###### Tiny");
        let line = find_line(&lines, "Tiny").expect("should have heading");
        assert!(
            line.spans.iter().any(|s| s.style.heading_level == Some(6)),
            "H6 spans should carry heading_level=6"
        );
    }

    #[test]
    fn test_md_normal_text_has_no_heading_level() {
        let lines = render_markdown("Just normal text");
        let line = find_line(&lines, "normal").expect("should have text");
        assert!(
            line.spans.iter().all(|s| s.style.heading_level.is_none()),
            "Normal text should have no heading_level"
        );
    }

    // ── Lists ───────────────────────────────────────────────────────

    #[test]
    fn test_md_bullet_list() {
        let lines = render_markdown("- alpha\n- beta");
        let text = text_of(&lines);
        assert!(text.contains("• alpha"), "got: {text}");
        assert!(text.contains("• beta"), "got: {text}");
    }

    #[test]
    fn test_md_numbered_list() {
        let lines = render_markdown("1. first\n2. second");
        let text = text_of(&lines);
        assert!(text.contains("1. first"), "got: {text}");
        assert!(text.contains("2. second"), "got: {text}");
    }

    // ── Blockquote ──────────────────────────────────────────────────

    #[test]
    fn test_md_blockquote() {
        let lines = render_markdown("> quoted text");
        let text = text_of(&lines);
        assert!(text.contains("│"), "Blockquote should have '│' prefix");
        assert!(text.contains("quoted text"), "got: {text}");
    }

    // ── Horizontal rule ─────────────────────────────────────────────

    #[test]
    fn test_md_horizontal_rule() {
        let lines = render_markdown("above\n\n---\n\nbelow");
        let text = text_of(&lines);
        assert!(text.contains("────"), "Should have horizontal rule");
    }

    // ── Code block ──────────────────────────────────────────────────

    #[test]
    fn test_md_code_block_rust() {
        let md = "```rust\nlet x = 42;\n```";
        let lines = render_markdown(md);
        let text = text_of(&lines);
        assert!(text.contains("let x = 42"), "Should contain code: {text}");
        assert!(text.contains("┌─"), "Should have top border");
        assert!(text.contains("└─"), "Should have bottom border");
        assert!(text.contains("│"), "Should have left border");
    }

    #[test]
    fn test_md_code_block_has_code_info() {
        let md = "```rust\nlet x = 42;\n```";
        let lines = render_markdown(md);
        // Code lines should have code_info = Some("rust")
        let code_lines: Vec<_> = lines.iter().filter(|l| l.code_info.is_some()).collect();
        assert!(!code_lines.is_empty(), "Should have lines with code_info");
        assert_eq!(code_lines[0].code_info.as_deref(), Some("rust"));
    }

    #[test]
    fn test_md_code_block_monospace_style() {
        let md = "```\nhello\n```";
        let lines = render_markdown(md);
        let code_line = lines.iter().find(|l| l.text().contains("hello")).unwrap();
        // Code span should be monospace
        let code_span = code_line.spans.iter().find(|s| s.text.contains("hello")).unwrap();
        assert!(code_span.style.monospace, "Code should be monospace");
        assert_eq!(code_span.style.bg, CODE_BG, "Code should have dark background");
    }

    #[test]
    fn test_md_code_block_empty() {
        let md = "```\n```";
        let lines = render_markdown(md);
        assert!(!lines.is_empty());
    }

    // ── Links ───────────────────────────────────────────────────────

    #[test]
    fn test_md_link_text_shown() {
        let lines = render_markdown("[click here](https://example.com)");
        let text = text_of(&lines);
        assert!(text.contains("click here"), "got: {text}");
    }

    #[test]
    fn test_md_link_url_shown() {
        let lines = render_markdown("[docs](https://docs.rs)");
        let text = text_of(&lines);
        assert!(text.contains("https://docs.rs"), "got: {text}");
    }

    #[test]
    fn test_md_link_text_underlined() {
        let lines = render_markdown("[click](https://example.com)");
        let line = find_line(&lines, "click").expect("should have 'click'");
        assert!(has_underline(line), "Link should be underlined");
    }

    #[test]
    fn test_md_link_url_dim() {
        let lines = render_markdown("[click](https://example.com)");
        let line = find_line(&lines, "https://example.com").unwrap();
        let url_span = line.spans.iter().find(|s| s.text.contains("https://example.com")).unwrap();
        assert_eq!(url_span.style.fg, MdColor::DarkGray, "URL should be DarkGray");
    }

    // ── Strikethrough ───────────────────────────────────────────────

    #[test]
    fn test_md_strikethrough() {
        let lines = render_markdown("~~deleted~~");
        let text = text_of(&lines);
        assert!(
            text.contains("d\u{0336}e\u{0336}l\u{0336}e\u{0336}t\u{0336}e\u{0336}d\u{0336}"),
            "got: {text}"
        );
    }

    #[test]
    fn test_md_strikethrough_styled() {
        let lines = render_markdown("~~removed~~");
        let line = find_line(&lines, "r\u{0336}").expect("should have stroked text");
        assert!(has_fg(line, MdColor::DarkGray), "Strikethrough should be DarkGray");
    }

    // ── Table ───────────────────────────────────────────────────────

    #[test]
    fn test_md_table_basic() {
        let md = "| Name | Age |\n|------|-----|\n| Alice | 30 |";
        let lines = render_markdown(md);
        let text = text_of(&lines);
        assert!(text.contains("Name"), "got: {text}");
        assert!(text.contains("Alice"), "got: {text}");
        assert!(text.contains("30"), "got: {text}");
    }

    #[test]
    fn test_md_table_header_bold() {
        let md = "| Key | Value |\n|-----|-------|\n| a | 1 |";
        let lines = render_markdown(md);
        let header_line = lines.iter().find(|l| l.text().contains("Key")).unwrap();
        assert!(has_bold(header_line), "Table header should be bold");
    }

    #[test]
    fn test_md_table_wraps_within_viewport() {
        let md = "| Key | Description |\n|-----|---|\n| a | This is a very long description that should be wrapped within the table cell to fit the viewport width |";
        let lines = render_markdown_with_width(md, 50);
        for (i, l) in lines.iter().enumerate() {
            let dw = l.display_width();
            assert!(dw <= 50, "Line {i} has width {dw} > 50");
        }
    }

    #[test]
    fn test_md_table_all_lines_same_width() {
        let md = "| Name | Value |\n|------|-------|\n| short | A long value that wraps |\n| x | y |";
        let lines = render_markdown_with_width(md, 40);
        let widths: Vec<usize> = lines.iter().map(|l| l.display_width()).filter(|&w| w > 0).collect();
        assert!(!widths.is_empty());
        let first = widths[0];
        for (i, w) in widths.iter().enumerate() {
            assert_eq!(*w, first, "Line {i} has width {w} != {first}");
        }
    }

    // ── Ordered list with inline code ───────────────────────────────

    #[test]
    fn test_md_ordered_list_inline_code_first() {
        let md = "10. **`continue` inside drain loop**";
        let lines = render_markdown(md);
        let text = text_of(&lines);
        assert!(text.contains("10. "), "got: {text}");
        let marker_pos = text.find("10. ").unwrap();
        let code_pos = text.find("continue").unwrap();
        assert!(marker_pos < code_pos, "Marker must come before code");
    }

    // ── Multi paragraph ─────────────────────────────────────────────

    #[test]
    fn test_md_multi_paragraph() {
        let lines = render_markdown("first paragraph\n\nsecond paragraph");
        let text = text_of(&lines);
        assert!(text.contains("first paragraph"), "got: {text}");
        assert!(text.contains("second paragraph"), "got: {text}");
        // Blank line between paragraphs
        let blank_count = lines.iter().filter(|l| l.text().is_empty()).count();
        assert!(blank_count >= 1, "Should have blank line between paragraphs");
    }

    // ── Mixed content ───────────────────────────────────────────────

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

    // ── Fair column width ───────────────────────────────────────────

    #[test]
    fn test_md_table_min_column_width_one_third() {
        let md = "| K | Description |\n|---|---|\n| a | This is an extremely long description text that fills up the entire second column |\n| b | short |";
        let lines = render_markdown_with_width(md, 60);
        let text = lines.iter().map(|l| l.text())
            .find(|t| t.starts_with('│') && !t.contains('─'))
            .expect("should have data row");
        let parts: Vec<&str> = text.split('│').collect();
        let first_col_width = parts[1].width();
        let border_overhead = 3 * 2 + 1;
        let available = 60 - border_overhead;
        let min_expected = available / 3;
        assert!(
            first_col_width >= min_expected,
            "First column width {} should be >= {}",
            first_col_width,
            min_expected,
        );
    }

    #[test]
    fn test_md_table_min_width_not_inflated_when_fits() {
        let md = "| K | Desc |\n|---|---|\n| a | hello |";
        let lines = render_markdown_with_width(md, 120);
        let text = lines.iter().map(|l| l.text())
            .find(|t| t.starts_with('│') && !t.contains('─'))
            .expect("should have data row");
        let parts: Vec<&str> = text.split('│').collect();
        let first_col_width = parts[1].width();
        assert!(first_col_width <= 5, "got {first_col_width}");
    }

    #[test]
    fn test_md_table_border_spans_are_monospace() {
        let md = "| A | B |\n|---|---|\n| x | y |";
        let lines = render_markdown(md);
        for line in &lines {
            for span in &line.spans {
                if span.text.contains('│') || span.text.contains('─')
                    || span.text.contains('┌') || span.text.contains('┐')
                    || span.text.contains('└') || span.text.contains('┘')
                    || span.text.contains('├') || span.text.contains('┤')
                    || span.text.contains('┬') || span.text.contains('┴')
                    || span.text.contains('┼')
                {
                    assert!(
                        span.style.monospace,
                        "Border span '{}' should be monospace",
                        span.text,
                    );
                }
            }
        }
    }

    #[test]
    fn test_md_table_cell_spans_are_monospace() {
        let md = "| Name | Value |\n|------|-------|\n| foo  | bar   |";
        let lines = render_markdown(md);
        for line in &lines {
            for span in &line.spans {
                // Cell content spans are between borders
                if !span.text.trim().is_empty() {
                    assert!(
                        span.style.monospace,
                        "Cell span '{}' should be monospace",
                        span.text,
                    );
                }
            }
        }
    }

    #[test]
    fn test_md_table_emoji_span_details() {
        // Diagnostic: show exactly what spans are produced for emoji table cells
        let md = "| Emoji | Name |\n|---|---|\n| 😀 | Grinning |\n| ⭐ | Star |\n| 🔥 | Fire |";
        let lines = render_markdown(md);
        for (i, line) in lines.iter().enumerate() {
            eprint!("L{:2}: ", i);
            for span in &line.spans {
                eprint!("[m={} w={} {:?}] ", span.style.monospace as u8,
                    unicode_width::UnicodeWidthStr::width(span.text.as_str()),
                    &span.text);
            }
            eprintln!();
        }
    }

    #[test]
    fn test_unicode_width_emoji_with_vs16() {
        use unicode_width::{UnicodeWidthChar, UnicodeWidthStr};

        // VS16 (U+FE0F) = Variation Selector 16, requests emoji presentation
        let vs16_width = UnicodeWidthChar::width('\u{FE0F}');
        eprintln!("VS16 char width: {:?}", vs16_width);

        // Teacup: U+2615
        let teacup = "☕";
        let teacup_w = teacup.width();
        eprintln!("☕ (U+2615) str.width() = {}", teacup_w);
        eprintln!("☕ char.width() = {:?}", UnicodeWidthChar::width('☕'));

        // Teacup + VS16: U+2615 U+FE0F
        let teacup_vs16 = "☕\u{FE0F}";
        let teacup_vs16_w = teacup_vs16.width();
        eprintln!("☕️ (U+2615 U+FE0F) str.width() = {}", teacup_vs16_w);
        for ch in teacup_vs16.chars() {
            eprintln!("  char {:?} (U+{:04X}) char.width() = {:?}", ch, ch as u32, UnicodeWidthChar::width(ch));
        }

        // Check mark: U+2714
        let check = "✔";
        eprintln!("✔ (U+2714) str.width() = {}", check.width());
        let check_vs16 = "✔\u{FE0F}";
        eprintln!("✔️ (U+2714 U+FE0F) str.width() = {}", check_vs16.width());

        // Star: U+2B50
        let star = "⭐";
        eprintln!("⭐ (U+2B50) str.width() = {}", star.width());

        // Heart: U+2764
        let heart = "❤";
        eprintln!("❤ (U+2764) str.width() = {}", heart.width());
        let heart_vs16 = "❤\u{FE0F}";
        eprintln!("❤️ (U+2764 U+FE0F) str.width() = {}", heart_vs16.width());

        // Full-width emojis (Supplementary Multilingual Plane)
        let grinning = "😀";
        eprintln!("😀 (U+1F600) str.width() = {}", grinning.width());
        let fire = "🔥";
        eprintln!("🔥 (U+1F525) str.width() = {}", fire.width());
        let sunflower = "🌻";
        eprintln!("🌻 (U+1F33B) str.width() = {}", sunflower.width());

        // The key question: does VS16 add width?
        // In terminals, VS16 should NOT add width — the emoji is still 2 columns.
        // But if unicode_width counts VS16 as width=1, that's a bug in our usage.

        // Table test with teacup+VS16
        let md = "| Icon | Name |\n|---|---|\n| ☕\u{FE0F} | Tea |\n| 😀 | Grin |";
        let lines = render_markdown(md);
        eprintln!("\nTable with teacup+VS16:");
        for (i, line) in lines.iter().enumerate() {
            let mut total_w = 0;
            eprint!("L{:2}: ", i);
            for span in &line.spans {
                let w = span.text.as_str().width();
                total_w += w;
                eprint!("[w={} {:?}] ", w, &span.text);
            }
            eprintln!("  (total_w={})", total_w);
        }
    }

    #[test]
    fn test_str_width_emoji_sequences() {
        use unicode_width::UnicodeWidthStr;

        // ZWJ sequence: swimmer + male sign → 2 cols (single grapheme cluster)
        let swimmer_male = "🏊\u{200D}♂\u{FE0F}";
        assert_eq!(swimmer_male.width(), 2);

        // VS16 emoji presentation sequence: narrow base + VS16 → 2 cols
        let sun_vs16 = "☀\u{FE0F}";
        assert_eq!(sun_vs16.width(), 2);

        // Arrow with VS16: narrow base + VS16 → 2 cols
        let arrow_vs16 = "➡\u{FE0F}";
        assert_eq!(arrow_vs16.width(), 2);

        // Three weather emojis with VS16: 3 × 2 = 6 cols
        let weather = "🌧\u{FE0F}🌩\u{FE0F}⛈\u{FE0F}";
        assert_eq!(weather.width(), 6);

        // Concatenated ZWJ sequences: 3 × 2 + 1 × 2 = 8
        let multi_zwj = "🏊\u{200D}♂\u{FE0F}🚴\u{200D}♀\u{FE0F}🏃\u{200D}♂\u{FE0F}🥇";
        assert_eq!(multi_zwj.width(), 8);
    }

    // ── TableData sort tests ────────────────────────────────────────

    #[test]
    fn test_table_data_sort_by_column_alphabetic() {
        let td = TableData::new(
            vec!["Name".into(), "City".into()],
            vec![
                vec!["Zara".into(), "Wien".into()],
                vec!["Alice".into(), "Bern".into()],
                vec!["Maria".into(), "Graz".into()],
            ],
            vec![],
        );
        let sorted = td.sorted_by_column(0, false);
        assert_eq!(sorted.rows[0][0], "Alice");
        assert_eq!(sorted.rows[1][0], "Maria");
        assert_eq!(sorted.rows[2][0], "Zara");
        // Rows stay intact
        assert_eq!(sorted.rows[0][1], "Bern");
        assert_eq!(sorted.rows[2][1], "Wien");
    }

    #[test]
    fn test_table_data_sort_by_column_descending() {
        let td = TableData::new(
            vec!["Name".into(), "City".into()],
            vec![
                vec!["Alice".into(), "Bern".into()],
                vec!["Zara".into(), "Wien".into()],
            ],
            vec![],
        );
        let sorted = td.sorted_by_column(0, true);
        assert_eq!(sorted.rows[0][0], "Zara");
        assert_eq!(sorted.rows[1][0], "Alice");
    }

    #[test]
    fn test_table_data_sort_numeric() {
        let td = TableData::new(
            vec!["Name".into(), "Age".into()],
            vec![
                vec!["Zara".into(), "42".into()],
                vec!["Bob".into(), "3".into()],
                vec!["Maria".into(), "31".into()],
            ],
            vec![],
        );
        let sorted = td.sorted_by_column(1, false);
        // Numeric sort: 3, 31, 42
        assert_eq!(sorted.rows[0][1], "3");
        assert_eq!(sorted.rows[1][1], "31");
        assert_eq!(sorted.rows[2][1], "42");
    }

    #[test]
    fn test_table_data_sort_numeric_comma_decimal() {
        // German-style decimal comma: 0,66  5,1  10,5  84,4  9,1
        let td = TableData::new(
            vec!["Val".into()],
            vec![
                vec!["0,66".into()],
                vec!["10,5".into()],
                vec!["5,1".into()],
                vec!["84,4".into()],
                vec!["9,1".into()],
            ],
            vec![],
        );
        let sorted = td.sorted_by_column(0, false);
        assert_eq!(sorted.rows[0][0], "0,66");
        assert_eq!(sorted.rows[1][0], "5,1");
        assert_eq!(sorted.rows[2][0], "9,1");
        assert_eq!(sorted.rows[3][0], "10,5");
        assert_eq!(sorted.rows[4][0], "84,4");
    }

    #[test]
    fn test_table_data_sort_numeric_mixed_dot_and_comma() {
        // Mix of 3.14 and 2,71 — both should be recognized as numeric
        let td = TableData::new(
            vec!["Val".into()],
            vec![
                vec!["3.14".into()],
                vec!["2,71".into()],
                vec!["1.0".into()],
            ],
            vec![],
        );
        let sorted = td.sorted_by_column(0, false);
        assert_eq!(sorted.rows[0][0], "1.0");
        assert_eq!(sorted.rows[1][0], "2,71");
        assert_eq!(sorted.rows[2][0], "3.14");
    }

    #[test]
    fn test_table_data_sort_preserves_header() {
        let td = TableData::new(
            vec!["Name".into(), "Age".into()],
            vec![
                vec!["Zara".into(), "42".into()],
                vec!["Alice".into(), "23".into()],
            ],
            vec![],
        );
        let sorted = td.sorted_by_column(0, false);
        assert_eq!(sorted.head, vec!["Name", "Age"]);
    }

    #[test]
    fn test_table_data_sort_out_of_bounds_column() {
        let td = TableData::new(
            vec!["A".into()],
            vec![vec!["x".into()], vec!["y".into()]],
            vec![],
        );
        // Column index 5 is out of bounds — should not panic, treat as empty
        let sorted = td.sorted_by_column(5, false);
        assert_eq!(sorted.rows.len(), 2);
    }

    #[test]
    fn test_table_data_sort_mixed_numeric_alpha() {
        // Some cells parse as numbers, some don't → fall back to string sort
        let td = TableData::new(
            vec!["Val".into()],
            vec![
                vec!["42".into()],
                vec!["banana".into()],
                vec!["3".into()],
            ],
            vec![],
        );
        let sorted = td.sorted_by_column(0, false);
        // String sort: "3" < "42" < "banana"
        assert_eq!(sorted.rows[0][0], "3");
        assert_eq!(sorted.rows[1][0], "42");
        assert_eq!(sorted.rows[2][0], "banana");
    }

    #[test]
    fn test_table_data_sort_toggle_direction() {
        let td = TableData::new(
            vec!["N".into()],
            vec![vec!["b".into()], vec!["a".into()], vec!["c".into()]],
            vec![],
        );
        assert_eq!(td.sort_column, None);
        let s1 = td.sorted_by_column(0, false);
        assert_eq!(s1.rows[0][0], "a");
        assert_eq!(s1.sort_column, Some(0));
        assert_eq!(s1.sort_descending, false);
        let s2 = s1.sorted_by_column(0, true);
        assert_eq!(s2.rows[0][0], "c");
        assert_eq!(s2.sort_descending, true);
    }

    #[test]
    fn test_table_data_render_produces_styled_lines() {
        let td = TableData::new(
            vec!["A".into(), "B".into()],
            vec![vec!["1".into(), "2".into()]],
            vec![],
        );
        let lines = td.render(usize::MAX);
        assert!(!lines.is_empty());
        // Should contain header row and data row
        let text: String = lines.iter().map(|l| l.text()).collect::<Vec<_>>().join("\n");
        assert!(text.contains("A"), "Header A missing: {text}");
        assert!(text.contains("1"), "Cell 1 missing: {text}");
    }

    #[test]
    fn test_table_data_sort_indicator_in_header() {
        let td = TableData::new(
            vec!["Name".into(), "Age".into()],
            vec![vec!["A".into(), "1".into()]],
            vec![],
        );
        let sorted = td.sorted_by_column(0, false);
        let lines = sorted.render(usize::MAX);
        let header_text: String = lines.iter().map(|l| l.text()).collect::<Vec<_>>().join("");
        // Should show ▲ or ▼ indicator on sorted column
        assert!(
            header_text.contains("▲") || header_text.contains("▼"),
            "Sort indicator missing: {header_text}"
        );
    }

    #[test]
    fn test_extract_tables_from_markdown() {
        let md = "Some text\n\n| A | B |\n|---|---|\n| 1 | 2 |\n| 3 | 4 |\n\nMore text";
        let tables = extract_tables(md);
        assert_eq!(tables.len(), 1);
        assert_eq!(tables[0].head, vec!["A", "B"]);
        assert_eq!(tables[0].rows.len(), 2);
        assert_eq!(tables[0].rows[0], vec!["1", "2"]);
    }

    #[test]
    fn test_extract_tables_multiple() {
        let md = "| X |\n|---|\n| 1 |\n\nText\n\n| Y | Z |\n|---|---|\n| a | b |";
        let tables = extract_tables(md);
        assert_eq!(tables.len(), 2);
        assert_eq!(tables[0].head, vec!["X"]);
        assert_eq!(tables[1].head, vec!["Y", "Z"]);
    }

    #[test]
    fn test_extract_tables_none() {
        let md = "Just some text\n\nNo tables here";
        let tables = extract_tables(md);
        assert!(tables.is_empty());
    }
}

    #[test]
    fn test_table_data_sort_dot_thousands_separator() {
        // 312.696 and 357.592 use dots as thousand separators (German style)
        // They should sort as 312696 and 357592, not as 312.696 and 357.592
        let td = TableData::new(
            vec!["Value".into()],
            vec![
                vec!["312.696".into()],
                vec!["316".into()],
                vec!["357.592".into()],
            ],
            vec![Alignment::None],
        );
        let sorted = td.sorted_by_column(0, false);
        assert_eq!(sorted.rows[0][0], "316");
        assert_eq!(sorted.rows[1][0], "312.696");
        assert_eq!(sorted.rows[2][0], "357.592");
    }

    #[test]
    fn test_table_data_sort_dot_decimal_not_thousands() {
        // 3.14 and 2.71 are actual decimals (not 3 digits after dot)
        let td = TableData::new(
            vec!["Value".into()],
            vec![
                vec!["3.14".into()],
                vec!["2.71".into()],
                vec!["10.5".into()],
            ],
            vec![Alignment::None],
        );
        let sorted = td.sorted_by_column(0, false);
        assert_eq!(sorted.rows[0][0], "2.71");
        assert_eq!(sorted.rows[1][0], "3.14");
        assert_eq!(sorted.rows[2][0], "10.5");
    }

    #[test]
    fn test_table_data_sort_multiple_dot_thousands() {
        // 1.234.567 = 1234567
        let td = TableData::new(
            vec!["Value".into()],
            vec![
                vec!["1.234.567".into()],
                vec!["500.000".into()],
                vec!["2.000".into()],
            ],
            vec![Alignment::None],
        );
        let sorted = td.sorted_by_column(0, false);
        assert_eq!(sorted.rows[0][0], "2.000");
        assert_eq!(sorted.rows[1][0], "500.000");
        assert_eq!(sorted.rows[2][0], "1.234.567");
    }
