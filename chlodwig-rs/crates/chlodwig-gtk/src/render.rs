//! GTK TextBuffer rendering functions.
//!
//! All functions that render conversation content (blocks, events, ANSI,
//! syntax-highlighted lines) into a `gtk4::TextBuffer` live here.
//! Extracted from `main.rs` to keep it manageable.

use gtk4::prelude::*;
use chlodwig_gtk::app_state::{AppState, DisplayBlock};
use chlodwig_gtk::window;
use chlodwig_core::ConversationEvent;

/// Re-render ALL display blocks from AppState into the TextBuffer.
///
/// Clears the buffer first, then renders each block. Used after `/clear`,
/// table sort, or any operation that needs a full refresh.
pub fn rerender_all_blocks(
    buffer: &gtk4::TextBuffer,
    state: &AppState,
    viewport_width: usize,
) {
    // Clear the entire buffer including emoji overlays
    chlodwig_gtk::emoji_overlay::clear_overlays_from(buffer, 0);
    let mut start = buffer.start_iter();
    let mut end = buffer.end_iter();
    buffer.delete(&mut start, &mut end);

    // Show CWD at the top (same as startup)
    let cwd_msg = chlodwig_gtk::app_state::startup_cwd_message();
    window::append_styled(buffer, &format!("{cwd_msg}\n"), "system");

    for (block_idx, block) in state.blocks.iter().enumerate() {
        match block {
            DisplayBlock::UserMessage(text) => {
                window::append_styled(buffer, &format!("\n▶ {text}\n"), "user");
            }
            DisplayBlock::AssistantText(text) => {
                window::append_to_output(buffer, "\n");
                let overrides: Vec<(usize, &chlodwig_core::TableData)> = state.tables.iter()
                    .filter(|(bi, _, _)| *bi == block_idx)
                    .map(|(_, ti, td)| (*ti, td))
                    .collect();
                let lines = if overrides.is_empty() {
                    chlodwig_core::render_markdown_with_width(text, viewport_width)
                } else {
                    chlodwig_core::render_markdown_with_table_overrides(text, viewport_width, &overrides)
                };
                append_styled_lines_with_table_headers(buffer, &lines, &state.tables, block_idx);
                window::append_to_output(buffer, "\n");
            }
            DisplayBlock::ToolUseStart { name, input } => {
                if !state.show_tool_usage {
                    continue;
                }
                window::append_styled(
                    buffer,
                    &format!("── Tool: {name} ──\n"),
                    "tool",
                );
                if let Ok(pretty) = serde_json::to_string_pretty(input) {
                    for line in pretty.lines().take(5) {
                        window::append_styled(buffer, &format!("  {line}\n"), "result");
                    }
                }
            }
            DisplayBlock::ToolResult { output, is_error } => {
                if !state.show_tool_usage {
                    continue;
                }
                let (prefix, tag) = if *is_error {
                    ("ERROR", "error")
                } else {
                    ("OK", "result_ok")
                };
                window::append_styled(
                    buffer,
                    &format!("── [{prefix}] ──\n"),
                    tag,
                );
                let preview = if output.len() > 500 {
                    let mut end = 500;
                    while end > 0 && !output.is_char_boundary(end) {
                        end -= 1;
                    }
                    format!("{}...", &output[..end])
                } else {
                    output.clone()
                };
                for line in preview.lines().take(10) {
                    window::append_styled(buffer, &format!("  {line}\n"), "result");
                }
            }
            DisplayBlock::SystemMessage(msg) => {
                window::append_styled(buffer, &format!("{msg}\n"), "system");
            }
            DisplayBlock::Error(msg) => {
                window::append_styled(buffer, &format!("\n✗ Error: {msg}\n"), "error");
            }
        }
    }

    // If there's streaming text in progress, render it too
    if !state.streaming_buffer.is_empty() {
        window::append_to_output(buffer, "\n");
        let lines = chlodwig_core::render_markdown_with_width(&state.streaming_buffer, viewport_width);
        chlodwig_gtk::md_renderer::append_styled_lines(buffer, &lines);
    }
}

/// Render all display blocks from AppState into the TextBuffer (append).
///
/// Used after session restore (--resume or /resume) to populate the output
/// area with the restored conversation. Unlike `rerender_all_blocks`, this
/// does NOT clear the buffer first — it appends to whatever is already there.
pub fn render_restored_blocks(
    buffer: &gtk4::TextBuffer,
    state: &AppState,
    viewport_width: usize,
) {
    for (block_idx, block) in state.blocks.iter().enumerate() {
        match block {
            DisplayBlock::UserMessage(text) => {
                window::append_styled(buffer, &format!("\n▶ {text}\n"), "user");
            }
            DisplayBlock::AssistantText(text) => {
                window::append_to_output(buffer, "\n");
                let overrides: Vec<(usize, &chlodwig_core::TableData)> = state.tables.iter()
                    .filter(|(bi, _, _)| *bi == block_idx)
                    .map(|(_, ti, td)| (*ti, td))
                    .collect();
                let lines = if overrides.is_empty() {
                    chlodwig_core::render_markdown_with_width(text, viewport_width)
                } else {
                    chlodwig_core::render_markdown_with_table_overrides(text, viewport_width, &overrides)
                };
                append_styled_lines_with_table_headers(buffer, &lines, &state.tables, block_idx);
                window::append_to_output(buffer, "\n");
            }
            DisplayBlock::ToolUseStart { name, input } => {
                if !state.show_tool_usage {
                    continue;
                }
                if name == "Edit" {
                    // Show diff-style display
                    let file_path = input["file_path"].as_str().unwrap_or("(unknown)");
                    window::append_styled(
                        buffer,
                        &format!("── Edit: {file_path} ──\n"),
                        "tool",
                    );
                    if let Some(old) = input["old_string"].as_str() {
                        for line in old.lines() {
                            window::append_styled(buffer, &format!("- {line}\n"), "diff_remove");
                        }
                    }
                    if let Some(new) = input["new_string"].as_str() {
                        for line in new.lines() {
                            window::append_styled(buffer, &format!("+ {line}\n"), "diff_add");
                        }
                    }
                } else {
                    window::append_styled(
                        buffer,
                        &format!("── Tool: {name} ──\n"),
                        "tool",
                    );
                    if let Ok(pretty) = serde_json::to_string_pretty(input) {
                        for line in pretty.lines().take(5) {
                            window::append_styled(buffer, &format!("  {line}\n"), "result");
                        }
                    }
                }
            }
            DisplayBlock::ToolResult { output, is_error } => {
                if !state.show_tool_usage {
                    continue;
                }
                let (prefix, tag) = if *is_error {
                    ("ERROR", "error")
                } else {
                    ("OK", "result_ok")
                };
                window::append_styled(
                    buffer,
                    &format!("── [{prefix}] ──\n"),
                    tag,
                );
                let preview = chlodwig_core::truncate_preview(output, 500);
                for line in preview.lines().take(10) {
                    window::append_styled(buffer, &format!("  {line}\n"), "result");
                }
            }
            DisplayBlock::SystemMessage(msg) => {
                window::append_styled(buffer, &format!("{msg}\n"), "system");
            }
            DisplayBlock::Error(msg) => {
                window::append_styled(buffer, &format!("\n✗ Error: {msg}\n"), "error");
            }
        }
    }
}

/// Called once per tick to update the live-streaming Markdown view.
/// `start_offset` is the char offset where streaming started in the TextBuffer.
pub fn rerender_streaming_markdown(
    buffer: &gtk4::TextBuffer,
    start_offset: i32,
    markdown_text: &str,
    viewport_width: usize,
) {
    // Remove emoji overlays in the streaming range BEFORE deleting text.
    chlodwig_gtk::emoji_overlay::clear_overlays_from(buffer, start_offset);

    // Delete previous render
    let end_off = buffer.end_iter().offset();
    if end_off > start_offset {
        let mut start = buffer.iter_at_offset(start_offset);
        let mut end = buffer.iter_at_offset(end_off);
        buffer.delete(&mut start, &mut end);
    }

    // Re-render as Markdown
    let lines = chlodwig_core::render_markdown_with_width(markdown_text, viewport_width);
    chlodwig_gtk::md_renderer::append_styled_lines(buffer, &lines);
}

/// Render a single ConversationEvent into the GTK TextBuffer.
///
/// Handles all non-streaming events: tool calls, tool results, errors, etc.
/// **TextDelta and TextComplete are handled by the per-tick streaming re-render
/// in the main event loop** — they are no-ops here.
pub fn render_event_to_buffer(
    buffer: &gtk4::TextBuffer,
    event: &ConversationEvent,
    tool_id_to_info: &mut std::collections::HashMap<String, (String, serde_json::Value)>,
    show_tool_usage: bool,
) {
    match event {
        // Streaming events are handled by the per-tick Markdown re-render.
        ConversationEvent::TextDelta(_) | ConversationEvent::TextComplete(_) => {}
        ConversationEvent::ToolUseStart { id, name, input } => {
            // Track tool id → (name, input) for ToolResult matching
            tool_id_to_info.insert(id.clone(), (name.clone(), input.clone()));

            if !show_tool_usage {
                return;
            }

            if name == "Edit" {
                let file_path = input["file_path"].as_str().unwrap_or("(unknown)");
                let lang = chlodwig_core::highlight::lang_from_path(file_path);
                window::append_styled(
                    buffer,
                    &format!("── Edit: {file_path} ──\n"),
                    "tool",
                );
                if let Some(old) = input["old_string"].as_str() {
                    for line in old.lines() {
                        window::append_styled(buffer, "- ", "diff_remove");
                        render_highlighted_line(buffer, lang, line, "diff_remove");
                        window::append_to_output(buffer, "\n");
                    }
                }
                if let Some(new) = input["new_string"].as_str() {
                    for line in new.lines() {
                        window::append_styled(buffer, "+ ", "diff_add");
                        render_highlighted_line(buffer, lang, line, "diff_add");
                        window::append_to_output(buffer, "\n");
                    }
                }
            } else {
                window::append_styled(
                    buffer,
                    &format!("── Tool: {name} ──\n"),
                    "tool",
                );
                if let Ok(pretty) = serde_json::to_string_pretty(input) {
                    for line in pretty.lines().take(5) {
                        window::append_styled(buffer, &format!("  {line}\n"), "result");
                    }
                }
            }
        }
        ConversationEvent::ToolResult {
            id, output, is_error,
        } => {
            let tool_info = tool_id_to_info.remove(id);

            if !show_tool_usage {
                return;
            }

            let text = extract_tool_result_text(output);

            if let Some((ref tool_name, ref tool_input)) = tool_info {
                // Bash → $ command + output with ANSI color rendering
                if tool_name == "Bash" {
                    let command = tool_input["command"]
                        .as_str()
                        .unwrap_or("(unknown)");
                    window::append_multi_styled(
                        buffer,
                        &format!("$ {command}\n"),
                        &["bash_header", "code"],
                    );
                    render_ansi_output(buffer, &text);
                    window::append_to_output(buffer, "\n");
                    return;
                }
                // Read → ── Read: path ── + numbered lines with syntax highlighting
                if tool_name == "Read" && !is_error {
                    let file_path = tool_input["file_path"]
                        .as_str()
                        .unwrap_or("(unknown)");
                    let lang = chlodwig_core::highlight::lang_from_path(file_path);
                    window::append_styled(
                        buffer,
                        &format!("── Read: {file_path} ──\n"),
                        "read_header",
                    );
                    let formatted = chlodwig_gtk::format_numbered_lines(&text);
                    for (gutter, code) in &formatted {
                        if !gutter.is_empty() {
                            window::append_styled(buffer, gutter, "line_number");
                            render_highlighted_line(buffer, lang, code, "code");
                            window::append_to_output(buffer, "\n");
                        } else {
                            window::append_styled(buffer, &format!("  {code}\n"), "result");
                        }
                    }
                    window::append_to_output(buffer, "\n");
                    return;
                }
                // Write → ── Write: path ── + summary + numbered lines with syntax highlighting
                if tool_name == "Write" && !is_error {
                    let file_path = tool_input["file_path"]
                        .as_str()
                        .unwrap_or("(unknown)");
                    let lang = chlodwig_core::highlight::lang_from_path(file_path);
                    let content = tool_input["content"]
                        .as_str()
                        .unwrap_or("");
                    window::append_styled(
                        buffer,
                        &format!("── Write: {file_path} ──\n"),
                        "write_header",
                    );
                    window::append_styled(
                        buffer,
                        &format!("  {text}\n"),
                        "result",
                    );
                    let line_count = content.lines().count();
                    let num_width = if line_count == 0 {
                        1
                    } else {
                        (line_count as f64).log10().floor() as usize + 1
                    };
                    for (i, code_line) in content.lines().enumerate() {
                        let line_num = i + 1;
                        window::append_styled(
                            buffer,
                            &format!(" {:>width$} │ ", line_num, width = num_width),
                            "line_number",
                        );
                        render_highlighted_line(buffer, lang, code_line, "code");
                        window::append_to_output(buffer, "\n");
                    }
                    window::append_to_output(buffer, "\n");
                    return;
                }
                // Grep → ── Grep ── + results
                if tool_name == "Grep" && !is_error {
                    window::append_styled(buffer, "── Grep ──\n", "grep_header");
                    for line in text.lines() {
                        window::append_styled(
                            buffer,
                            &format!("  {line}\n"),
                            "result",
                        );
                    }
                    window::append_to_output(buffer, "\n");
                    return;
                }
            }

            // Fallback: generic ToolResult display
            let (prefix, tag) = if *is_error {
                ("ERROR", "error")
            } else {
                ("OK", "result_ok")
            };
            window::append_styled(
                buffer,
                &format!("── [{prefix}] ──\n"),
                tag,
            );
            let preview = if text.len() > 500 {
                let mut end = 500;
                while end > 0 && !text.is_char_boundary(end) {
                    end -= 1;
                }
                format!("{}...", &text[..end])
            } else {
                text
            };
            for line in preview.lines().take(10) {
                window::append_styled(
                    buffer,
                    &format!("  {line}\n"),
                    "result",
                );
            }
            window::append_to_output(buffer, "\n");
        }
        ConversationEvent::Error(msg) => {
            window::append_styled(buffer, &format!("\n✗ Error: {msg}\n"), "error");
        }
        ConversationEvent::CompactionStarted => {
            window::append_styled(buffer, "\n⏳ Compacting conversation…\n", "system");
        }
        ConversationEvent::CompactionComplete { old_messages, summary_tokens } => {
            window::append_styled(
                buffer,
                &format!("✓ Compacted: {old_messages} messages → summary ({summary_tokens} tokens)\n"),
                "system",
            );
        }
        _ => {} // Other events handled by AppState only
    }
}

/// Append styled lines with clickable table sort tags on header cells.
pub fn append_styled_lines_with_table_headers(
    buffer: &gtk4::TextBuffer,
    lines: &[chlodwig_core::StyledLine],
    all_tables: &[(usize, usize, chlodwig_core::TableData)],
    block_idx: usize,
) {
    // Find global table indices for this block
    let block_tables: Vec<usize> = all_tables.iter().enumerate()
        .filter(|(_, (bi, _, _))| *bi == block_idx)
        .map(|(global_idx, _)| global_idx)
        .collect();

    // State machine: detect table regions by looking for border characters
    let mut table_within_block: usize = 0;
    let mut in_table = false;
    let mut header_next = false;

    for (line_idx, line) in lines.iter().enumerate() {
        if line_idx > 0 {
            let mut end = buffer.end_iter();
            buffer.insert(&mut end, "\n");
        }

        let line_text = line.text();

        if line_text.starts_with('┌') {
            in_table = true;
            header_next = true;
        } else if line_text.starts_with('└') {
            in_table = false;
            table_within_block += 1;
        } else if line_text.starts_with('├') {
            header_next = false;
        }

        let is_header_row = in_table && header_next
            && line.spans.iter().any(|s| s.style.bold && s.style.monospace);

        if is_header_row {
            let global_table_idx = if table_within_block < block_tables.len() {
                block_tables[table_within_block]
            } else {
                usize::MAX
            };

            let mut col_idx: usize = 0;
            for span in &line.spans {
                let tag_name = chlodwig_gtk::md_renderer::ensure_tag(buffer, &span.style);

                if span.style.bold && span.style.monospace && global_table_idx != usize::MAX {
                    let sort_tag_name = format!("table_sort:{global_table_idx}:{col_idx}");
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
                    chlodwig_gtk::md_renderer::insert_text_with_emoji_and_tag(
                        buffer,
                        &span.text,
                        &tag_name,
                        span.style.monospace,
                    );
                }
            }
        } else {
            for span in &line.spans {
                let tag_name = chlodwig_gtk::md_renderer::ensure_tag(buffer, &span.style);
                chlodwig_gtk::md_renderer::insert_text_with_emoji_and_tag(
                    buffer,
                    &span.text,
                    &tag_name,
                    span.style.monospace,
                );
            }
        }
    }
}

/// Re-render a single table in-place in the TextBuffer after sorting.
pub fn rerender_table_in_place(
    buffer: &gtk4::TextBuffer,
    state: &AppState,
    global_table_idx: usize,
    viewport_width: usize,
) {
    let tag_name = format!("table_sort:{global_table_idx}:0");
    let tag_table = buffer.tag_table();
    let tag = match tag_table.lookup(&tag_name) {
        Some(t) => t,
        None => return,
    };

    let mut iter = buffer.start_iter();
    if !iter.starts_tag(Some(&tag)) {
        if !iter.forward_to_tag_toggle(Some(&tag)) {
            return;
        }
    }

    // Walk backward to find ┌ (table top border)
    let mut table_start = iter;
    table_start.set_line(table_start.line());
    table_start.set_line_offset(0);
    loop {
        let line_start = buffer.iter_at_line(table_start.line());
        if let Some(ls) = line_start {
            let line_end = {
                let mut e = ls;
                e.forward_to_line_end();
                e
            };
            let line_text = buffer.text(&ls, &line_end, false);
            if line_text.starts_with('┌') {
                table_start = ls;
                break;
            }
        }
        if table_start.line() == 0 {
            break;
        }
        table_start = match buffer.iter_at_line(table_start.line() - 1) {
            Some(i) => i,
            None => break,
        };
    }

    // Walk forward to find └ (table bottom border)
    let mut table_end = iter;
    loop {
        let line_start = match buffer.iter_at_line(table_end.line()) {
            Some(i) => i,
            None => break,
        };
        let mut line_end = line_start;
        line_end.forward_to_line_end();
        let line_text = buffer.text(&line_start, &line_end, false);
        if line_text.starts_with('└') {
            table_end = line_end;
            if !table_end.is_end() {
                table_end.forward_char();
            }
            break;
        }
        if !table_end.forward_line() {
            break;
        }
    }

    let (block_idx, table_data) = match state.tables.get(global_table_idx) {
        Some((bi, _ti, td)) => (*bi, td),
        None => return,
    };

    let table_lines = table_data.render(viewport_width);

    chlodwig_gtk::emoji_overlay::clear_overlays_from(buffer, table_start.offset());
    buffer.delete(&mut table_start, &mut table_end);
    append_styled_lines_with_table_headers(buffer, &table_lines, &state.tables, block_idx);
}

/// Extract text from a ToolResultContent (text or blocks → joined text).
pub fn extract_tool_result_text(output: &chlodwig_core::ToolResultContent) -> String {
    match output {
        chlodwig_core::ToolResultContent::Text(t) => t.clone(),
        chlodwig_core::ToolResultContent::Blocks(blocks) => {
            blocks
                .iter()
                .map(|b| match b {
                    chlodwig_core::ToolResultBlock::Text { text } => text.as_str(),
                    chlodwig_core::ToolResultBlock::Image { .. } => "[image]",
                })
                .collect::<Vec<_>>()
                .join("\n")
        }
    }
}

/// Render a single line with syntax highlighting into a GtkTextBuffer.
pub fn render_highlighted_line(
    buffer: &gtk4::TextBuffer,
    lang: &str,
    line: &str,
    fallback_tag: &str,
) {
    let spans = chlodwig_core::highlight::highlight_line(lang, line);
    match spans {
        Some(spans) if !spans.is_empty() => {
            let tag_table = buffer.tag_table();
            for span in &spans {
                if span.text.is_empty() {
                    continue;
                }
                let tag_name = chlodwig_gtk::md_renderer::highlight_tag_name_for(
                    span.fg, span.bold, span.italic,
                );
                if tag_table.lookup(&tag_name).is_none() {
                    let mut builder = gtk4::TextTag::builder()
                        .name(&tag_name)
                        .family("monospace");
                    if let Some((r, g, b)) = span.fg {
                        builder = builder.foreground(&format!("#{r:02x}{g:02x}{b:02x}"));
                    }
                    if span.bold {
                        builder = builder.weight(700);
                    }
                    if span.italic {
                        builder = builder.style(gtk4::pango::Style::Italic);
                    }
                    tag_table.add(&builder.build());
                }
                let mut end_iter = buffer.end_iter();
                let start_offset = end_iter.offset();
                buffer.insert(&mut end_iter, &span.text);
                let start_iter = buffer.iter_at_offset(start_offset);
                let end_iter = buffer.end_iter();
                buffer.apply_tag_by_name(&tag_name, &start_iter, &end_iter);
            }
        }
        _ => {
            window::append_styled(buffer, line, fallback_tag);
        }
    }
}

/// Render ANSI-colored text into a GtkTextBuffer.
pub fn render_ansi_output(buffer: &gtk4::TextBuffer, text: &str) {
    let segments = chlodwig_gtk::ansi::parse_ansi(text);
    let tag_table = buffer.tag_table();

    for seg in &segments {
        if seg.text.is_empty() {
            continue;
        }

        match (seg.fg, seg.bold) {
            (None, false) => {
                window::append_styled(buffer, &seg.text, "code");
            }
            (fg, bold) => {
                let tag_name = ansi_tag_name(fg, bold);

                if tag_table.lookup(&tag_name).is_none() {
                    let mut builder = gtk4::TextTag::builder()
                        .name(&tag_name)
                        .family("monospace");
                    if let Some(color) = fg {
                        builder = builder.foreground(&color.to_hex());
                    }
                    if bold {
                        builder = builder.weight(700);
                    }
                    let tag = builder.build();
                    tag_table.add(&tag);
                }

                let mut end_iter = buffer.end_iter();
                let start_offset = end_iter.offset();
                buffer.insert(&mut end_iter, &seg.text);
                let start_iter = buffer.iter_at_offset(start_offset);
                let end_iter = buffer.end_iter();
                buffer.apply_tag_by_name(&tag_name, &start_iter, &end_iter);
            }
        }
    }
}

/// Generate a unique tag name for an ANSI color + bold combination.
pub fn ansi_tag_name(fg: Option<chlodwig_gtk::ansi::AnsiColor>, bold: bool) -> String {
    use chlodwig_gtk::ansi::AnsiColor;
    let color_part = match fg {
        None => "default".into(),
        Some(AnsiColor::Black) => "black".into(),
        Some(AnsiColor::Red) => "red".into(),
        Some(AnsiColor::Green) => "green".into(),
        Some(AnsiColor::Yellow) => "yellow".into(),
        Some(AnsiColor::Blue) => "blue".into(),
        Some(AnsiColor::Magenta) => "magenta".into(),
        Some(AnsiColor::Cyan) => "cyan".into(),
        Some(AnsiColor::White) => "white".into(),
        Some(AnsiColor::BrightBlack) => "br_black".into(),
        Some(AnsiColor::BrightRed) => "br_red".into(),
        Some(AnsiColor::BrightGreen) => "br_green".into(),
        Some(AnsiColor::BrightYellow) => "br_yellow".into(),
        Some(AnsiColor::BrightBlue) => "br_blue".into(),
        Some(AnsiColor::BrightMagenta) => "br_magenta".into(),
        Some(AnsiColor::BrightCyan) => "br_cyan".into(),
        Some(AnsiColor::BrightWhite) => "br_white".into(),
        Some(AnsiColor::Indexed(n)) => format!("idx{n}"),
        Some(AnsiColor::Rgb(r, g, b)) => format!("rgb{r}_{g}_{b}"),
    };
    let bold_part = if bold { "_b" } else { "" };
    format!("ansi_{color_part}{bold_part}")
}

/// Send a system notification that a conversation turn has completed.
pub fn send_turn_complete_notification(
    window: &gtk4::ApplicationWindow,
    project: &str,
) {
    #[cfg(target_os = "macos")]
    {
        let _ = window;
        chlodwig_gtk::notification::send_native_notification(
            "Chlodwig",
            "Turn complete ✓",
            project,
        );
    }
    #[cfg(not(target_os = "macos"))]
    {
        send_notification_gnotification(window, project);
    }
}

/// Linux/other: GNotification via D-Bus.
#[cfg(not(target_os = "macos"))]
fn send_notification_gnotification(
    window: &gtk4::ApplicationWindow,
    project: &str,
) {
    use gtk4::gio;

    let notification = gio::Notification::new("Chlodwig");
    notification.set_body(Some(&format!("Turn complete ✓ — {project}")));

    if let Some(app) = window.application() {
        app.send_notification(Some("turn-complete"), &notification);
        tracing::debug!("GNotification sent for project {project:?}");
    } else {
        tracing::debug!("No application found on window — skipping notification");
    }
}
