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

// ── Table-header detection (GTK-independent, pure) ──────────────────

/// Walk over a slice of `StyledLine`s and identify which lines are
/// table-header rows. Returns a vector of the same length as `lines`,
/// where `Some(i)` means "this line is the header row of the i-th table
/// in the slice (0-based)". `None` means it's not a table-header row.
///
/// A line counts as a header row when:
///   1. We are inside a table (the most recent border line started with `┌`
///      and we have not yet seen the post-header `├` separator), AND
///   2. At least one of its spans has `bold && monospace` styling
///      (which `chlodwig_core::markdown` only sets on table-header cells).
///
/// This is a pure function so it can be unit-tested without a GTK display
/// server. The actual GTK rendering uses this to know where to attach
/// `table_sort:N:M` tags.
pub fn detect_table_header_rows(lines: &[StyledLine]) -> Vec<Option<usize>> {
    let mut result = Vec::with_capacity(lines.len());
    let mut table_index: usize = 0;
    let mut in_table = false;
    let mut header_next = false;

    for line in lines {
        let line_text = line.text();

        // State transitions on border characters
        let starts_top = line_text.starts_with('┌');
        let starts_mid = line_text.starts_with('├');
        let starts_bot = line_text.starts_with('└');

        if starts_top {
            in_table = true;
            header_next = true;
            result.push(None);
            continue;
        }
        if starts_mid {
            header_next = false;
            result.push(None);
            continue;
        }
        if starts_bot {
            in_table = false;
            result.push(None);
            table_index += 1;
            continue;
        }

        let is_header = in_table
            && header_next
            && line.spans.iter().any(|s| s.style.bold && s.style.monospace);

        if is_header {
            result.push(Some(table_index));
        } else {
            result.push(None);
        }
    }

    result
}



// ── GTK-dependent rendering ─────────────────────────────────────────

#[cfg(feature = "gtk-ui")]
mod gtk_impl {
    use super::*;
    use gtk4::prelude::*;
    use crate::emoji;
    use crate::emoji_overlay::EmojiTextView;

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
            builder = builder.family(crate::MONO_FONT_FAMILY);
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
    ///
    /// This is the **single** Markdown→TextBuffer render entry point. It
    /// handles three cases per line, in priority order:
    ///   1. **Fenced code-block content** (line has `code_info`) → syntect
    ///      syntax highlighting via `insert_highlighted_spans`.
    ///   2. **Table-header row** (detected by `detect_table_header_rows`) →
    ///      each bold+monospace span gets a `table_sort:{global_idx}:{col}`
    ///      tag in addition to its normal style tag, so the click handler
    ///      can identify the column to sort.
    ///   3. **Anything else** → plain span loop with emoji-as-overlay.
    ///
    /// `all_tables` is the full list of tables tracked by `AppState`
    /// (`(block_idx, table_idx_within_block, TableData)`), and `block_idx`
    /// is the AssistantText block currently being rendered. Pass `&[]` and
    /// any `block_idx` if the caller doesn't need clickable headers
    /// (e.g. live streaming render where tables aren't tracked yet).
    pub fn append_styled_lines(
        view: &EmojiTextView,
        lines: &[StyledLine],
        all_tables: &[(usize, usize, chlodwig_core::TableData)],
        block_idx: usize,
    ) {
        let buffer = view.buffer();
        let buffer = &buffer;
        // Map "i-th table within this slice" → "global table index in
        // AppState.tables". When `all_tables` is empty, the lookup
        // always returns None and no table_sort tags are emitted.
        let block_tables: Vec<usize> = all_tables
            .iter()
            .enumerate()
            .filter(|(_, (bi, _, _))| *bi == block_idx)
            .map(|(global_idx, _)| global_idx)
            .collect();

        // Pre-compute which line indices are table headers (and which table
        // they belong to, within this slice).
        let header_map = detect_table_header_rows(lines);

        for (line_idx, line) in lines.iter().enumerate() {
            if line_idx > 0 {
                let mut end = buffer.end_iter();
                buffer.insert(&mut end, "\n");
            }

            // Case 1: fenced code block → syntect highlighting
            if should_highlight_code_line(line) {
                let lang = line.code_info.as_deref().unwrap_or("");
                let border_span = &line.spans[0];
                let border_tag = ensure_tag(buffer, &border_span.style);
                insert_text_with_emoji_and_tag(
                    view,
                    &border_span.text,
                    &border_tag,
                    border_span.style.monospace,
                );

                let code_text: String =
                    line.spans[1..].iter().map(|s| s.text.as_str()).collect();

                match highlight_code_line(lang, &code_text) {
                    Some(spans) if !spans.is_empty() => {
                        insert_highlighted_spans(view, &spans);
                    }
                    _ => {
                        for span in &line.spans[1..] {
                            let tag_name = ensure_tag(buffer, &span.style);
                            insert_text_with_emoji_and_tag(
                                view,
                                &span.text,
                                &tag_name,
                                span.style.monospace,
                            );
                        }
                    }
                }
                continue;
            }

            // Case 2: table-header row → emit table_sort:N:M tags on cells
            if let Some(local_table_idx) = header_map[line_idx] {
                let global_table_idx = block_tables
                    .get(local_table_idx)
                    .copied()
                    .unwrap_or(usize::MAX);
                let mut col_idx: usize = 0;
                for span in &line.spans {
                    let tag_name = ensure_tag(buffer, &span.style);

                    if span.style.bold
                        && span.style.monospace
                        && global_table_idx != usize::MAX
                    {
                        let sort_tag_name =
                            format!("table_sort:{global_table_idx}:{col_idx}");
                        let tag_table = buffer.tag_table();
                        if tag_table.lookup(&sort_tag_name).is_none() {
                            let sort_tag = gtk4::TextTag::builder()
                                .name(&sort_tag_name)
                                .build();
                            tag_table.add(&sort_tag);
                        }

                        let mut end = buffer.end_iter();
                        let start_offset = end.offset();
                        buffer.insert(&mut end, &span.text);
                        let start_iter = buffer.iter_at_offset(start_offset);
                        let end_iter = buffer.end_iter();
                        buffer.apply_tag_by_name(&tag_name, &start_iter, &end_iter);
                        buffer.apply_tag_by_name(&sort_tag_name, &start_iter, &end_iter);
                        col_idx += 1;
                    } else {
                        insert_text_with_emoji_and_tag(
                            view,
                            &span.text,
                            &tag_name,
                            span.style.monospace,
                        );
                    }
                }
                continue;
            }

            // Case 3: plain row
            for span in &line.spans {
                let tag_name = ensure_tag(buffer, &span.style);
                insert_text_with_emoji_and_tag(
                    view,
                    &span.text,
                    &tag_name,
                    span.style.monospace,
                );
            }
        }
    }

    /// Insert syntax-highlighted spans into the buffer.
    /// Each span gets a dynamically created monospace tag with the appropriate
    /// foreground color, bold, and italic attributes.
    fn insert_highlighted_spans(
        view: &EmojiTextView,
        spans: &[HighlightSpan],
    ) {
        let buffer = view.buffer();
        let tag_table = buffer.tag_table();
        for span in spans {
            if span.text.is_empty() {
                continue;
            }
            let tag_name = highlight_tag_name_for(span.fg, span.bold, span.italic);
            if tag_table.lookup(&tag_name).is_none() {
                let mut builder = gtk4::TextTag::builder()
                    .name(&tag_name)
                    .family(crate::MONO_FONT_FAMILY);
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
            insert_text_with_emoji_and_tag(view, &span.text, &tag_name, true);
        }
    }

    /// Render Markdown text into a GTK TextBuffer at the end.
    /// Parses the text via core, then inserts styled spans.
    /// Convenience wrapper for callers without table-sort support.
    pub fn append_markdown(view: &EmojiTextView, text: &str) {
        let lines = chlodwig_core::render_markdown(text);
        append_styled_lines(view, &lines, &[], 0);
    }

    /// Render Markdown text with viewport width constraint.
    /// Convenience wrapper for callers without table-sort support.
    pub fn append_markdown_with_width(view: &EmojiTextView, text: &str, width: usize) {
        let lines = chlodwig_core::render_markdown_with_width(text, width);
        append_styled_lines(view, &lines, &[], 0);
    }

    /// Delete a range of text from the buffer (by char offsets) and insert
    /// Markdown-rendered text in its place.
    pub fn replace_range_with_markdown(
        view: &EmojiTextView,
        start_offset: i32,
        end_offset: i32,
        text: &str,
    ) {
        let buffer = view.buffer();
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
                let tag_name = ensure_tag(&buffer, &span.style);
                insert_text_with_emoji_and_tag(view, &span.text, &tag_name, span.style.monospace);
            }
        }
    }

    /// Insert text at the end of the view's buffer with emoji-as-overlay support.
    ///
    /// Plain text segments get the specified tag applied.
    /// Emoji segments are rendered via CoreText and drawn as overlays
    /// over placeholder spaces. The tag is applied to the placeholder
    /// spaces so they inherit the correct font (e.g. monospace for tables).
    pub fn insert_text_with_emoji_and_tag(
        view: &EmojiTextView,
        text: &str,
        tag_name: &str,
        monospace: bool,
    ) {
        let buffer = view.buffer();
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
                    crate::window::insert_emoji_as_overlay(view, e, &[tag_name], monospace);
                }
            }
        }
    }
}

#[cfg(feature = "gtk-ui")]
pub use gtk_impl::*;
