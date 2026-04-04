//! Rendering functions for the TUI.

/// Build timestamp set by `build.rs` at compile time (e.g. "2026-04-04 14:30").
const BUILD_TIME: &str = env!("BUILD_TIME");

/// Auto-incrementing build ID set by `build.rs` at compile time (e.g. "42").
const BUILD_ID: &str = env!("BUILD_ID");

use ratatui::{
    layout::{Constraint, Direction, Layout, Rect},
    style::{Color, Modifier, Style},
    text::{Line, Span, Text},
    widgets::{Block, Borders, Clear, Paragraph, Scrollbar, ScrollbarOrientation, ScrollbarState, Wrap},
    Frame,
};
use unicode_width::UnicodeWidthStr;

use crate::app::App;
use crate::types::{Focus, PendingPermission};

/// Compute scrollbar state from scroll position, total lines, and viewport height.
/// Returns (position, content_length, viewport_length) for ScrollbarState.
pub(crate) fn compute_scrollbar_state(
    scroll_pos: usize,
    total_lines: usize,
    view_height: usize,
) -> (usize, usize, usize) {
    (scroll_pos, total_lines, view_height)
}

pub(crate) fn ui(f: &mut Frame, app: &App) {
    // Dynamic input height: count lines in current input (min 1, max 10) + 2 for borders
    let input_lines = if app.input.is_empty() { 1 } else { app.input.lines().count().max(1).min(10) };
    let input_height = (input_lines as u16) + 2;

    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Min(3),                // [0] output (switches based on active tab)
            Constraint::Length(input_height),   // [1] input pane (dynamic)
            Constraint::Length(1),             // [2] tab bar
            Constraint::Length(1),             // [3] status line
        ])
        .split(f.area());

    match app.active_tab {
        0 => render_output(f, app, chunks[0]),
        1 => render_sys_prompt_view(f, app, chunks[0]),
        2 => render_requests_view(f, app, chunks[0]),
        _ => render_output(f, app, chunks[0]),
    }
    render_input(f, app, chunks[1]);
    render_tab_bar(f, app, chunks[2]);
    render_status_line(f, app, chunks[3]);

    if let Some(ref perm) = app.pending_permission {
        render_permission_dialog(f, perm);
    }
}

pub(crate) fn render_output(f: &mut Frame, app: &App, area: Rect) {
    let view_height = area.height.saturating_sub(2) as usize; // borders
    let total = app.rendered_lines.len();

    // Compute scroll position
    let scroll_pos = if app.auto_scroll {
        total.saturating_sub(view_height)
    } else {
        app.scroll.min(total.saturating_sub(view_height))
    };

    // Only render the visible slice
    let visible_end = (scroll_pos + view_height).min(total);
    let visible_start = scroll_pos.min(visible_end);

    let inner_width = area.width.saturating_sub(2) as usize; // borders left+right

    let mut lines: Vec<Line> = app.rendered_lines[visible_start..visible_end]
        .iter()
        .map(|rl| {
            let mut line = rl.to_line();
            // Pad each line with spaces to fill the full viewport width.
            // Without this, ratatui's diff rendering leaves old characters
            // visible beyond the end of shorter lines.
            // Use ratatui's Line::width() which computes Unicode display width
            // (via unicode-width crate). chars().count() is WRONG — it counts
            // codepoints, not terminal columns. CJK chars, emojis, etc. take
            // 2 columns but are only 1 char.
            let text_width = line.width();
            if text_width < inner_width {
                line.spans.push(Span::raw(" ".repeat(inner_width - text_width)));
            }
            line
        })
        .collect();

    // Pad with empty lines to fill the viewport vertically
    while lines.len() < view_height {
        lines.push(Line::from(" ".repeat(inner_width)));
    }

    // Scroll indicator in title
    let scroll_info = if total > view_height {
        let pct = if total <= view_height {
            100
        } else {
            ((scroll_pos as f64 / (total - view_height) as f64) * 100.0) as usize
        };
        app.build_title_info(scroll_pos, total, view_height, pct)
    } else {
        app.build_title_info(0, total, view_height, 0)
    };

    let paragraph = Paragraph::new(Text::from(lines))
        .block(
            Block::default()
                .borders(Borders::ALL)
                .title(scroll_info),
        );

    f.render_widget(paragraph, area);

    // Render scrollbar if content exceeds viewport
    if total > view_height {
        let (position, content_length, viewport_length) =
            compute_scrollbar_state(scroll_pos, total, view_height);

        let mut scrollbar_state = ScrollbarState::new(content_length)
            .position(position)
            .viewport_content_length(viewport_length);

        let scrollbar = Scrollbar::new(ScrollbarOrientation::VerticalRight)
            .begin_symbol(None)
            .end_symbol(None)
            .track_symbol(Some("│"))
            .thumb_symbol("█");

        // Render inside the block's border (1px inset)
        let scrollbar_area = Rect {
            x: area.x,
            y: area.y,
            width: area.width,
            height: area.height,
        };
        f.render_stateful_widget(scrollbar, scrollbar_area, &mut scrollbar_state);
    }
}

pub(crate) fn render_input(f: &mut Frame, app: &App, area: Rect) {
    let input = Paragraph::new(app.input.as_str()).block(
        Block::default()
            .borders(Borders::ALL)
            .title(" Input (Enter to send, Ctrl+C to quit) "),
    );

    f.render_widget(input, area);

    if !app.is_loading && app.pending_permission.is_none() {
        // Compute cursor position for multi-line input
        let byte_pos = app.cursor_byte_pos();
        let text_before = &app.input[..byte_pos];
        let (line_offset, col_offset) = if text_before.ends_with('\n') {
            // Cursor is at the start of a new line after a newline
            (text_before.lines().count(), 0)
        } else {
            let line_idx = text_before.lines().count().saturating_sub(1);
            let col = text_before.lines().last().map(|l| l.chars().count()).unwrap_or(0);
            (line_idx, col)
        };
        f.set_cursor_position((
            area.x + col_offset as u16 + 1,
            area.y + line_offset as u16 + 1,
        ));
    }
}

pub(crate) fn format_tokens(n: u64) -> String {
    if n >= 1_000_000 {
        format!("{:.1}M", n as f64 / 1_000_000.0)
    } else if n >= 1_000 {
        format!("{:.1}k", n as f64 / 1_000.0)
    } else {
        format!("{n}")
    }
}

pub(crate) fn render_tab_bar(f: &mut Frame, app: &App, area: Rect) {
    let tabs = ["Prompt", "Sys-Prompt", "Requests"];
    let mut spans: Vec<Span> = Vec::new();

    spans.push(Span::raw(" "));

    for (i, label) in tabs.iter().enumerate() {
        let is_active = i == app.active_tab;
        let is_focused = matches!(app.focus, Focus::TabBar);

        let style = if is_active && is_focused {
            // Active tab + focus on tab bar: bold inverted
            Style::default()
                .fg(Color::Black)
                .bg(Color::Cyan)
                .add_modifier(Modifier::BOLD)
        } else if is_active {
            // Active tab but focus elsewhere: bold white
            Style::default()
                .fg(Color::White)
                .add_modifier(Modifier::BOLD)
        } else {
            // Inactive tab
            Style::default().fg(Color::DarkGray)
        };

        spans.push(Span::styled(format!(" {label} "), style));
        if i < tabs.len() - 1 {
            spans.push(Span::styled(" │ ", Style::default().fg(Color::DarkGray)));
        }
    }

    // Pad rest of the line
    let used_width: usize = spans.iter().map(|s| s.content.width()).sum();
    let total_width = area.width as usize;
    if used_width < total_width {
        spans.push(Span::raw(" ".repeat(total_width - used_width)));
    }

    let line = Line::from(spans);
    let paragraph = Paragraph::new(line)
        .style(Style::default().bg(Color::Rgb(25, 25, 25)));

    f.render_widget(paragraph, area);
}

pub(crate) fn render_sys_prompt_view(f: &mut Frame, app: &App, area: Rect) {
    let view_height = area.height.saturating_sub(2) as usize; // borders
    let total = app.sys_prompt_lines.len();

    let scroll_pos = app.sys_prompt_scroll.min(total.saturating_sub(view_height));
    let visible_end = (scroll_pos + view_height).min(total);
    let visible_start = scroll_pos.min(visible_end);

    let inner_width = area.width.saturating_sub(2) as usize;

    let mut lines: Vec<Line> = app.sys_prompt_lines[visible_start..visible_end]
        .iter()
        .map(|rl| {
            let mut line = rl.to_line();
            let text_width = line.width();
            if text_width < inner_width {
                line.spans.push(Span::raw(" ".repeat(inner_width - text_width)));
            }
            line
        })
        .collect();

    // Pad with empty lines to fill viewport
    while lines.len() < view_height {
        lines.push(Line::from(" ".repeat(inner_width)));
    }

    // Scroll info in title
    let scroll_info = if total > view_height {
        let pct = if total <= view_height {
            100
        } else {
            ((scroll_pos as f64 / (total - view_height) as f64) * 100.0) as usize
        };
        format!(" System Prompt [{}/{} lines · {}%] ", scroll_pos + view_height, total, pct)
    } else {
        " System Prompt ".to_string()
    };

    let paragraph = Paragraph::new(Text::from(lines))
        .block(
            Block::default()
                .borders(Borders::ALL)
                .title(scroll_info)
                .border_style(Style::default().fg(Color::Cyan)),
        );

    f.render_widget(paragraph, area);

    // Scrollbar
    if total > view_height {
        let (position, content_length, viewport_length) =
            compute_scrollbar_state(scroll_pos, total, view_height);

        let mut scrollbar_state = ScrollbarState::new(content_length)
            .position(position)
            .viewport_content_length(viewport_length);

        let scrollbar = Scrollbar::new(ScrollbarOrientation::VerticalRight)
            .begin_symbol(None)
            .end_symbol(None)
            .track_symbol(Some("│"))
            .thumb_symbol("█");

        f.render_stateful_widget(scrollbar, area, &mut scrollbar_state);
    }
}

pub(crate) fn render_requests_view(f: &mut Frame, app: &App, area: Rect) {
    let view_height = area.height.saturating_sub(2) as usize; // borders
    let total = app.requests_lines.len();

    let scroll_pos = app.requests_scroll.min(total.saturating_sub(view_height));
    let visible_end = (scroll_pos + view_height).min(total);
    let visible_start = scroll_pos.min(visible_end);

    let inner_width = area.width.saturating_sub(2) as usize;

    let mut lines: Vec<Line> = app.requests_lines[visible_start..visible_end]
        .iter()
        .map(|rl| {
            let mut line = rl.to_line();
            let text_width = line.width();
            if text_width < inner_width {
                line.spans.push(Span::raw(" ".repeat(inner_width - text_width)));
            }
            line
        })
        .collect();

    // Pad with empty lines to fill viewport
    while lines.len() < view_height {
        lines.push(Line::from(" ".repeat(inner_width)));
    }

    // Scroll info in title
    let entry_count = app.requests_log.len();
    let scroll_info = if total > view_height {
        let pct = if total <= view_height {
            100
        } else {
            ((scroll_pos as f64 / (total - view_height) as f64) * 100.0) as usize
        };
        format!(
            " Requests [{} entries · {}/{} lines · {}%] ",
            entry_count,
            scroll_pos + view_height,
            total,
            pct
        )
    } else {
        format!(" Requests [{} entries] ", entry_count)
    };

    let paragraph = Paragraph::new(Text::from(lines)).block(
        Block::default()
            .borders(Borders::ALL)
            .title(scroll_info)
            .border_style(Style::default().fg(Color::Cyan)),
    );

    f.render_widget(paragraph, area);

    // Scrollbar
    if total > view_height {
        let (position, content_length, viewport_length) =
            compute_scrollbar_state(scroll_pos, total, view_height);

        let mut scrollbar_state = ScrollbarState::new(content_length)
            .position(position)
            .viewport_content_length(viewport_length);

        let scrollbar = Scrollbar::new(ScrollbarOrientation::VerticalRight)
            .begin_symbol(None)
            .end_symbol(None)
            .track_symbol(Some("│"))
            .thumb_symbol("█");

        f.render_stateful_widget(scrollbar, area, &mut scrollbar_state);
    }
}

pub(crate) fn render_status_line(f: &mut Frame, app: &App, area: Rect) {
    let context = app.context_window_size();
    let cost_indicator = if context > 180_000 {
        "▓▓▓▓" // danger
    } else if context > 120_000 {
        "▓▓▓░"
    } else if context > 60_000 {
        "▓▓░░"
    } else if context > 10_000 {
        "▓░░░"
    } else {
        "░░░░"
    };

    let now = chrono::Local::now().format("%H:%M").to_string();

    let status_left = format!(
        " {} │ turns: {} │ reqs: {} │ ctx: {} [{}] │ tx:{} rx:{}",
        app.model,
        app.turn_count,
        app.api_request_count,
        format_tokens(context),
        cost_indicator,
        format_tokens(app.total_input_tokens),
        format_tokens(app.total_output_tokens),
    );

    let turn_info = if app.is_loading {
        format!(
            "{} turn tx:{} rx:{} │ streaming({})… │ build #{} {} │ {}",
            app.spinner_char(),
            format_tokens(app.turn_input_tokens),
            format_tokens(app.turn_output_tokens),
            app.stream_chunks,
            BUILD_ID,
            BUILD_TIME,
            now,
        )
    } else if app.turn_count > 0 {
        format!(
            "last tx:{} rx:{} │ build #{} {} │ {}",
            format_tokens(app.turn_input_tokens),
            format_tokens(app.turn_output_tokens),
            BUILD_ID,
            BUILD_TIME,
            now,
        )
    } else {
        format!("build #{} {} │ {}", BUILD_ID, BUILD_TIME, now)
    };

    // Pad to fill the line (use display width, not byte length — UTF-8 chars like │ are multi-byte)
    let width = area.width as usize;
    let right_len = turn_info.width();
    let left_len = status_left.width();
    let padding = if width > left_len + right_len + 2 {
        width - left_len - right_len - 1
    } else {
        1
    };

    let line = Line::from(vec![
        Span::styled(
            status_left,
            Style::default().fg(Color::DarkGray),
        ),
        Span::raw(" ".repeat(padding)),
        Span::styled(
            turn_info,
            Style::default().fg(if app.is_loading {
                Color::Yellow
            } else {
                Color::DarkGray
            }),
        ),
    ]);

    let paragraph = Paragraph::new(line)
        .style(Style::default().bg(Color::Rgb(30, 30, 30)));

    f.render_widget(paragraph, area);
}

pub(crate) fn render_permission_dialog(f: &mut Frame, perm: &PendingPermission) {
    let area = centered_rect(70, 50, f.area());

    let input_str = serde_json::to_string_pretty(&perm.input)
        .unwrap_or_default()
        .chars()
        .take(500)
        .collect::<String>();

    let text = format!(
        "Tool: {}\n\n{}\n\n[y] Allow  [n] Deny  [a] Always allow",
        perm.tool_name, input_str
    );

    let block = Block::default()
        .title(format!(" Allow {}? ", perm.tool_name))
        .borders(Borders::ALL)
        .style(Style::default().bg(Color::DarkGray));

    let paragraph = Paragraph::new(text)
        .block(block)
        .wrap(Wrap { trim: true });

    f.render_widget(Clear, area);
    f.render_widget(paragraph, area);
}

pub(crate) fn centered_rect(percent_x: u16, percent_y: u16, area: Rect) -> Rect {
    let popup_layout = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Percentage((100 - percent_y) / 2),
            Constraint::Percentage(percent_y),
            Constraint::Percentage((100 - percent_y) / 2),
        ])
        .split(area);

    Layout::default()
        .direction(Direction::Horizontal)
        .constraints([
            Constraint::Percentage((100 - percent_x) / 2),
            Constraint::Percentage(percent_x),
            Constraint::Percentage((100 - percent_x) / 2),
        ])
        .split(popup_layout[1])[1]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_time_is_set() {
        // BUILD_TIME should be set by build.rs at compile time
        let bt = BUILD_TIME;
        assert!(!bt.is_empty(), "BUILD_TIME must not be empty");
        // Should look like "2026-04-04 14:30" (16 chars)
        assert!(bt.len() >= 16, "BUILD_TIME should be at least 'YYYY-MM-DD HH:MM', got: {bt}");
        assert!(bt.starts_with("20"), "BUILD_TIME should start with '20xx', got: {bt}");
    }

    #[test]
    fn test_build_id_is_set() {
        // BUILD_ID should be set by build.rs at compile time, must be a positive integer
        let bid = BUILD_ID;
        assert!(!bid.is_empty(), "BUILD_ID must not be empty");
        let n: u64 = bid.parse().expect("BUILD_ID must be a valid integer");
        assert!(n >= 1, "BUILD_ID must be >= 1, got: {n}");
    }
}
