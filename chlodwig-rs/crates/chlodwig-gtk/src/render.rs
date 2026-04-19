//! GTK TextBuffer rendering — single source of truth.
//!
//! After Variant B refactor, there is ONE function per concern:
//!
//!   - [`render_block`] — renders a single `DisplayBlock` into a view.
//!     Used by both the live-append path and the full re-render path.
//!     This is THE place where tool-specific rendering (Bash ANSI, Read
//!     line numbers, Edit diff, Write summary, Grep) lives.
//!
//!   - [`append_block`] — thin wrapper that calls `render_block`. Used by
//!     the live event loop when a new `DisplayBlock` is added.
//!
//!   - [`render_all_blocks_into`] — clears the view and renders every
//!     block from `state.blocks`. Used for resize, restore, theme/toggle.
//!
//!   - [`render_streaming_into`] — renders the live streaming text into
//!     the streaming view. Called every tick while content is being streamed.
//!
//! All renderers operate on `&EmojiTextView` (per-instance overlay registry,
//! Gotcha #44). The buffer is extracted internally where needed.

use gtk4::prelude::*;
use chlodwig_gtk::app_state::{AppState, DisplayBlock};
use chlodwig_gtk::emoji_overlay::EmojiTextView;
use chlodwig_gtk::window;

/// Context passed to `render_block` so it can resolve table data, viewport
/// width, and the show-tool-usage preference. Carries borrowed references
/// only — cheap to construct on every render.
pub struct RenderCtx<'a> {
    pub viewport_width: usize,
    pub show_tool_usage: bool,
    /// All extracted tables, indexed by `(block_index, table_index_within_block, data)`.
    pub tables: &'a [(usize, usize, chlodwig_core::TableData)],
    /// Index of the block currently being rendered.
    pub block_index: usize,
}

impl<'a> RenderCtx<'a> {
    pub fn for_block(state: &'a AppState, viewport_width: usize, block_index: usize) -> Self {
        Self {
            viewport_width,
            show_tool_usage: state.show_tool_usage,
            tables: &state.tables,
            block_index,
        }
    }
}

/// Render a single `DisplayBlock` into the view, appending at the end.
pub fn render_block(view: &EmojiTextView, block: &DisplayBlock, ctx: &RenderCtx) {
    match block {
        DisplayBlock::UserMessage(text) => {
            window::append_styled(view, &format!("\n▶ {text}\n"), "user");
        }
        DisplayBlock::AssistantText(text) => {
            window::append_to_output(view, "\n");
            let overrides: Vec<(usize, &chlodwig_core::TableData)> = ctx
                .tables
                .iter()
                .filter(|(bi, _, _)| *bi == ctx.block_index)
                .map(|(_, ti, td)| (*ti, td))
                .collect();
            let lines = if overrides.is_empty() {
                chlodwig_core::render_markdown_with_width(text, ctx.viewport_width)
            } else {
                chlodwig_core::render_markdown_with_table_overrides(
                    text,
                    ctx.viewport_width,
                    &overrides,
                )
            };
            chlodwig_gtk::md_renderer::append_styled_lines(
                view,
                &lines,
                ctx.tables,
                ctx.block_index,
            );
            window::append_to_output(view, "\n");
        }
        DisplayBlock::ToolUseStart { name, input } => {
            if !ctx.show_tool_usage {
                return;
            }
            if name == "Edit" {
                render_edit_tool_use(view, input);
            } else {
                window::append_styled(view, &format!("── Tool: {name} ──\n"), "tool");
                if let Ok(pretty) = serde_json::to_string_pretty(input) {
                    for line in pretty.lines().take(5) {
                        window::append_styled(view, &format!("  {line}\n"), "result");
                    }
                }
            }
        }
        DisplayBlock::ToolResult {
            output,
            is_error,
            tool_name,
            tool_input,
        } => {
            if !ctx.show_tool_usage {
                return;
            }
            render_tool_result(view, output, *is_error, tool_name, tool_input);
        }
        DisplayBlock::SystemMessage(msg) => {
            window::append_styled(view, &format!("{msg}\n"), "system");
        }
        DisplayBlock::Error(msg) => {
            window::append_styled(view, &format!("\n✗ Error: {msg}\n"), "error");
        }
    }
}

/// Append a single block to the view. Thin wrapper around `render_block`.
pub fn append_block(view: &EmojiTextView, block: &DisplayBlock, ctx: &RenderCtx) {
    render_block(view, block, ctx);
}

/// Clear the view and render every block from `state.blocks`.
pub fn render_all_blocks_into(
    view: &EmojiTextView,
    state: &AppState,
    viewport_width: usize,
    include_cwd_header: bool,
) {
    view.clear_overlays_from(0);
    let buffer = view.buffer();
    let mut start = buffer.start_iter();
    let mut end = buffer.end_iter();
    buffer.delete(&mut start, &mut end);
    drop(buffer);

    if include_cwd_header {
        let cwd_msg = state.startup_cwd_message();
        window::append_styled(view, &format!("{cwd_msg}\n"), "system");
    }

    for (block_idx, block) in state.blocks.iter().enumerate() {
        let ctx = RenderCtx::for_block(state, viewport_width, block_idx);
        render_block(view, block, &ctx);
    }
}

/// Render the live streaming text into the streaming view.
///
/// Returns `true` if the streaming view should be made visible (text is
/// non-empty), `false` if it should be hidden.
pub fn render_streaming_into(
    view: &EmojiTextView,
    text: &str,
    viewport_width: usize,
) -> bool {
    view.clear_overlays_from(0);
    let buffer = view.buffer();
    let mut start = buffer.start_iter();
    let mut end = buffer.end_iter();
    buffer.delete(&mut start, &mut end);
    drop(buffer);

    if text.is_empty() {
        return false;
    }

    let lines = chlodwig_core::render_markdown_with_width(text, viewport_width);
    chlodwig_gtk::md_renderer::append_styled_lines(view, &lines, &[], 0);
    true
}

/// Internal helper: render a `DisplayBlock::ToolResult` body.
fn render_tool_result(
    view: &EmojiTextView,
    output: &str,
    is_error: bool,
    tool_name: &str,
    tool_input: &serde_json::Value,
) {
    // Bash → $ command + ANSI-colored output
    if tool_name == "Bash" {
        let command = tool_input["command"].as_str().unwrap_or("(unknown)");
        window::append_multi_styled(
            view,
            &format!("$ {command}\n"),
            &["bash_header", "code"],
        );
        render_ansi_output(view, output);
        window::append_to_output(view, "\n");
        return;
    }
    // Read → ── Read: path ── + numbered, syntax-highlighted lines
    if tool_name == "Read" && !is_error {
        let file_path = tool_input["file_path"].as_str().unwrap_or("(unknown)");
        let lang = chlodwig_core::highlight::lang_from_path(file_path);
        window::append_styled(view, &format!("── Read: {file_path} ──\n"), "read_header");
        let formatted = chlodwig_gtk::format_numbered_lines(output);
        for (gutter, code) in &formatted {
            if !gutter.is_empty() {
                window::append_styled(view, gutter, "line_number");
                render_highlighted_line(view, lang, code, "code");
                window::append_to_output(view, "\n");
            } else {
                window::append_styled(view, &format!("  {code}\n"), "result");
            }
        }
        window::append_to_output(view, "\n");
        return;
    }
    // Write → ── Write: path ── + summary + content with line numbers
    if tool_name == "Write" && !is_error {
        let file_path = tool_input["file_path"].as_str().unwrap_or("(unknown)");
        let lang = chlodwig_core::highlight::lang_from_path(file_path);
        let content = tool_input["content"].as_str().unwrap_or("");
        window::append_styled(
            view,
            &format!("── Write: {file_path} ──\n"),
            "write_header",
        );
        window::append_styled(view, &format!("  {output}\n"), "result");
        let line_count = content.lines().count();
        let num_width = if line_count == 0 {
            1
        } else {
            (line_count as f64).log10().floor() as usize + 1
        };
        for (i, code_line) in content.lines().enumerate() {
            let line_num = i + 1;
            window::append_styled(
                view,
                &format!(" {:>width$} │ ", line_num, width = num_width),
                "line_number",
            );
            render_highlighted_line(view, lang, code_line, "code");
            window::append_to_output(view, "\n");
        }
        window::append_to_output(view, "\n");
        return;
    }
    // Grep → ── Grep ── + results
    if tool_name == "Grep" && !is_error {
        window::append_styled(view, "── Grep ──\n", "grep_header");
        for line in output.lines() {
            window::append_styled(view, &format!("  {line}\n"), "result");
        }
        window::append_to_output(view, "\n");
        return;
    }
    // Fallback: generic ── [OK] / [ERROR] ── + truncated preview
    let (prefix, tag) = if is_error {
        ("ERROR", "error")
    } else {
        ("OK", "result_ok")
    };
    window::append_styled(view, &format!("── [{prefix}] ──\n"), tag);
    let preview = if output.len() > 500 {
        let mut end = 500;
        while end > 0 && !output.is_char_boundary(end) {
            end -= 1;
        }
        format!("{}...", &output[..end])
    } else {
        output.to_string()
    };
    for line in preview.lines().take(10) {
        window::append_styled(view, &format!("  {line}\n"), "result");
    }
    window::append_to_output(view, "\n");
}

/// Re-render a single table in-place in the view's buffer after sorting.
pub fn rerender_table_in_place(
    view: &EmojiTextView,
    state: &AppState,
    global_table_idx: usize,
    viewport_width: usize,
) {
    let buffer = view.buffer();
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

    let table_start_offset = table_start.offset();
    view.clear_overlays_from(table_start_offset);
    buffer.delete(&mut table_start, &mut table_end);
    drop(buffer);
    chlodwig_gtk::md_renderer::append_styled_lines(view, &table_lines, &state.tables, block_idx);
}

/// Render an Edit-tool tool_use block as a syntax-highlighted diff.
pub fn render_edit_tool_use(view: &EmojiTextView, input: &serde_json::Value) {
    let file_path = input["file_path"].as_str().unwrap_or("(unknown)");
    let lang = chlodwig_core::highlight::lang_from_path(file_path);
    window::append_styled(
        view,
        &format!("── Edit: {file_path} ──\n"),
        "tool",
    );
    if let Some(old) = input["old_string"].as_str() {
        for line in old.lines() {
            window::append_styled(view, "- ", "diff_remove");
            render_highlighted_line(view, lang, line, "diff_remove");
            window::append_to_output(view, "\n");
        }
    }
    if let Some(new) = input["new_string"].as_str() {
        for line in new.lines() {
            window::append_styled(view, "+ ", "diff_add");
            render_highlighted_line(view, lang, line, "diff_add");
            window::append_to_output(view, "\n");
        }
    }
}

/// Render a single line with syntax highlighting into the view's buffer.
pub fn render_highlighted_line(
    view: &EmojiTextView,
    lang: &str,
    line: &str,
    fallback_tag: &str,
) {
    let buffer = view.buffer();
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
                        .family(chlodwig_gtk::MONO_FONT_FAMILY);
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
            window::append_styled(view, line, fallback_tag);
        }
    }
}

/// Render ANSI-colored text into the view's buffer.
pub fn render_ansi_output(view: &EmojiTextView, text: &str) {
    let buffer = view.buffer();
    let segments = chlodwig_gtk::ansi::parse_ansi(text);
    let tag_table = buffer.tag_table();

    for seg in &segments {
        if seg.text.is_empty() {
            continue;
        }

        match (seg.fg, seg.bold) {
            (None, false) => {
                window::append_styled(view, &seg.text, "code");
            }
            (fg, bold) => {
                let tag_name = ansi_tag_name(fg, bold);

                if tag_table.lookup(&tag_name).is_none() {
                    let mut builder = gtk4::TextTag::builder()
                        .name(&tag_name)
                        .family(chlodwig_gtk::MONO_FONT_FAMILY);
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
