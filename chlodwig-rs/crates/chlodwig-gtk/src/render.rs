//! GTK TextBuffer rendering — single source of truth.
//!
//! After Variant B refactor, there is ONE function per concern:
//!
//!   - [`render_block`] — renders a single `DisplayBlock` into a buffer.
//!     Used by both the live-append path and the full re-render path.
//!     This is THE place where tool-specific rendering (Bash ANSI, Read
//!     line numbers, Edit diff, Write summary, Grep) lives.
//!
//!   - [`append_block`] — thin wrapper that calls `render_block`. Used by
//!     the live event loop when a new `DisplayBlock` is added.
//!
//!   - [`render_all_blocks_into`] — clears the buffer and renders every
//!     block from `state.blocks`. Used for resize, restore, theme/toggle.
//!     Replaces the old `rerender_all_blocks` AND `render_restored_blocks`.
//!
//!   - [`render_streaming_into`] — renders the live streaming text into
//!     a SEPARATE TextBuffer (the `streaming_view`'s buffer). Called every
//!     tick while content is being streamed.
//!
//! There is intentionally NO `render_event_to_buffer` anymore. Live events
//! flow through `AppState::handle_event` → produces a `DisplayBlock` →
//! `append_block` renders it. One render path. No drift.

use gtk4::prelude::*;
use chlodwig_gtk::app_state::{AppState, DisplayBlock};
use chlodwig_gtk::window;

/// Context passed to `render_block` so it can resolve table data, viewport
/// width, and the show-tool-usage preference. Carries borrowed references
/// only — cheap to construct on every render.
pub struct RenderCtx<'a> {
    pub viewport_width: usize,
    pub show_tool_usage: bool,
    /// All extracted tables, indexed by `(block_index, table_index_within_block, data)`.
    pub tables: &'a [(usize, usize, chlodwig_core::TableData)],
    /// Index of the block currently being rendered (used to filter `tables`
    /// for `AssistantText` blocks). For `append_block` this is the position
    /// the new block will occupy after push.
    pub block_index: usize,
}

impl<'a> RenderCtx<'a> {
    /// Construct a RenderCtx from the AppState for a specific block index.
    pub fn for_block(state: &'a AppState, viewport_width: usize, block_index: usize) -> Self {
        Self {
            viewport_width,
            show_tool_usage: state.show_tool_usage,
            tables: &state.tables,
            block_index,
        }
    }
}

/// Render a single `DisplayBlock` into the buffer, appending at the end.
///
/// This is the SINGLE source of truth for "how a block looks in the GTK
/// output". `append_block` and `render_all_blocks_into` both delegate here.
pub fn render_block(buffer: &gtk4::TextBuffer, block: &DisplayBlock, ctx: &RenderCtx) {
    match block {
        DisplayBlock::UserMessage(text) => {
            window::append_styled(buffer, &format!("\n▶ {text}\n"), "user");
        }
        DisplayBlock::AssistantText(text) => {
            window::append_to_output(buffer, "\n");
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
                buffer,
                &lines,
                ctx.tables,
                ctx.block_index,
            );
            window::append_to_output(buffer, "\n");
        }
        DisplayBlock::ToolUseStart { name, input } => {
            if !ctx.show_tool_usage {
                return;
            }
            if name == "Edit" {
                render_edit_tool_use(buffer, input);
            } else {
                window::append_styled(buffer, &format!("── Tool: {name} ──\n"), "tool");
                if let Ok(pretty) = serde_json::to_string_pretty(input) {
                    for line in pretty.lines().take(5) {
                        window::append_styled(buffer, &format!("  {line}\n"), "result");
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
            render_tool_result(buffer, output, *is_error, tool_name, tool_input);
        }
        DisplayBlock::SystemMessage(msg) => {
            window::append_styled(buffer, &format!("{msg}\n"), "system");
        }
        DisplayBlock::Error(msg) => {
            window::append_styled(buffer, &format!("\n✗ Error: {msg}\n"), "error");
        }
    }
}

/// Append a single block to the buffer. Thin wrapper around `render_block`
/// for the live-event path — kept as its own name purely for call-site
/// readability ("append a new block" vs. "render every block").
pub fn append_block(buffer: &gtk4::TextBuffer, block: &DisplayBlock, ctx: &RenderCtx) {
    render_block(buffer, block, ctx);
}

/// Clear the buffer and render every block from `state.blocks`.
///
/// Used for: window resize, session restore, theme toggle, show-tools toggle,
/// and any other operation that needs a full repaint.
///
/// Replaces the old `rerender_all_blocks` AND `render_restored_blocks` —
/// both were doing the same thing minus the "clear at the top" step. That
/// difference is now expressed by passing `include_cwd_header: true|false`.
pub fn render_all_blocks_into(
    buffer: &gtk4::TextBuffer,
    state: &AppState,
    viewport_width: usize,
    include_cwd_header: bool,
) {
    chlodwig_gtk::emoji_overlay::clear_overlays_from(buffer, 0);
    let mut start = buffer.start_iter();
    let mut end = buffer.end_iter();
    buffer.delete(&mut start, &mut end);

    if include_cwd_header {
        let cwd_msg = chlodwig_gtk::app_state::startup_cwd_message();
        window::append_styled(buffer, &format!("{cwd_msg}\n"), "system");
    }

    for (block_idx, block) in state.blocks.iter().enumerate() {
        let ctx = RenderCtx::for_block(state, viewport_width, block_idx);
        render_block(buffer, block, &ctx);
    }
}

/// Render the live streaming text into the streaming view's buffer.
///
/// This buffer is SEPARATE from the final history buffer — that's the whole
/// point of Variant B. We can simply set_text + re-render as Markdown without
/// touching the history.
///
/// Returns `true` if the streaming buffer should be made visible (text is
/// non-empty), `false` if it should be hidden.
pub fn render_streaming_into(
    buffer: &gtk4::TextBuffer,
    text: &str,
    viewport_width: usize,
) -> bool {
    chlodwig_gtk::emoji_overlay::clear_overlays_from(buffer, 0);
    let mut start = buffer.start_iter();
    let mut end = buffer.end_iter();
    buffer.delete(&mut start, &mut end);

    if text.is_empty() {
        return false;
    }

    let lines = chlodwig_core::render_markdown_with_width(text, viewport_width);
    chlodwig_gtk::md_renderer::append_styled_lines(buffer, &lines, &[], 0);
    true
}

/// Internal helper: render the body of a `DisplayBlock::ToolResult` based
/// on the tool name (Bash/Read/Write/Grep/Edit get rich rendering; everything
/// else falls back to the generic `── [OK] ──` preview).
fn render_tool_result(
    buffer: &gtk4::TextBuffer,
    output: &str,
    is_error: bool,
    tool_name: &str,
    tool_input: &serde_json::Value,
) {
    // Bash → $ command + ANSI-colored output
    if tool_name == "Bash" {
        let command = tool_input["command"].as_str().unwrap_or("(unknown)");
        window::append_multi_styled(
            buffer,
            &format!("$ {command}\n"),
            &["bash_header", "code"],
        );
        render_ansi_output(buffer, output);
        window::append_to_output(buffer, "\n");
        return;
    }
    // Read → ── Read: path ── + numbered, syntax-highlighted lines
    if tool_name == "Read" && !is_error {
        let file_path = tool_input["file_path"].as_str().unwrap_or("(unknown)");
        let lang = chlodwig_core::highlight::lang_from_path(file_path);
        window::append_styled(buffer, &format!("── Read: {file_path} ──\n"), "read_header");
        let formatted = chlodwig_gtk::format_numbered_lines(output);
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
    // Write → ── Write: path ── + summary + content with line numbers
    if tool_name == "Write" && !is_error {
        let file_path = tool_input["file_path"].as_str().unwrap_or("(unknown)");
        let lang = chlodwig_core::highlight::lang_from_path(file_path);
        let content = tool_input["content"].as_str().unwrap_or("");
        window::append_styled(
            buffer,
            &format!("── Write: {file_path} ──\n"),
            "write_header",
        );
        window::append_styled(buffer, &format!("  {output}\n"), "result");
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
        for line in output.lines() {
            window::append_styled(buffer, &format!("  {line}\n"), "result");
        }
        window::append_to_output(buffer, "\n");
        return;
    }
    // Fallback: generic ── [OK] / [ERROR] ── + truncated preview
    let (prefix, tag) = if is_error {
        ("ERROR", "error")
    } else {
        ("OK", "result_ok")
    };
    window::append_styled(buffer, &format!("── [{prefix}] ──\n"), tag);
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
        window::append_styled(buffer, &format!("  {line}\n"), "result");
    }
    window::append_to_output(buffer, "\n");
}

// `append_styled_lines_with_table_headers` was removed — its functionality
// is now part of the unified `chlodwig_gtk::md_renderer::append_styled_lines`,
// which handles fenced code-block highlighting AND table-header sort tags
// in one place. Call sites pass `&state.tables` and `block_idx` directly.

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
    chlodwig_gtk::md_renderer::append_styled_lines(buffer, &table_lines, &state.tables, block_idx);
}

/// Render an Edit-tool tool_use block as a syntax-highlighted diff.
///
/// Single source of truth for "how an Edit tool_use looks in the GTK
/// output". Called from `render_block` for `DisplayBlock::ToolUseStart`
/// when `name == "Edit"`.
///
/// `input` is the raw `serde_json::Value` from `ContentBlock::ToolUse.input`,
/// expected to contain `file_path`, `old_string`, and `new_string` keys
/// (missing keys are tolerated and rendered as empty).
pub fn render_edit_tool_use(buffer: &gtk4::TextBuffer, input: &serde_json::Value) {
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
