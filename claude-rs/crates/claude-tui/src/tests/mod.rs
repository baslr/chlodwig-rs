//! Tests for the TUI crate — split into focused modules.

use ratatui::layout::Rect;
use ratatui::style::{Color, Style};
use ratatui::text::Span;
use ratatui::Terminal;

use crate::app::App;
use crate::render::{compute_scrollbar_state, render_output};
use crate::rendered_line::RenderedLine;
use crate::types::*;

/// Helper: create an App with N lines of content.
fn app_with_lines(n: usize) -> App {
    let mut app = App::new("test-model".into());
    for i in 0..n {
        app.display_blocks
            .push(DisplayBlock::AssistantText(format!("Line {i}")));
    }
    app.mark_dirty();
    app.rebuild_lines();
    app
}

/// Helper: simulate pressing Up arrow in the input
fn history_up(app: &mut App) {
    if app.prompt_history.is_empty() {
        return;
    }
    match app.history_index {
        None => {
            app.saved_input = app.input.clone();
            app.history_index = Some(0);
            app.input = app.prompt_history[app.prompt_history.len() - 1].clone();
        }
        Some(idx) if idx + 1 < app.prompt_history.len() => {
            app.history_index = Some(idx + 1);
            app.input = app.prompt_history[app.prompt_history.len() - 1 - idx - 1].clone();
        }
        _ => {}
    }
    app.cursor = app.input_char_count();
}

/// Helper: simulate pressing Down arrow in the input
fn history_down(app: &mut App) {
    match app.history_index {
        Some(0) => {
            app.history_index = None;
            app.input = std::mem::take(&mut app.saved_input);
            app.cursor = app.input_char_count();
        }
        Some(idx) => {
            app.history_index = Some(idx - 1);
            app.input = app.prompt_history[app.prompt_history.len() - idx].clone();
            app.cursor = app.input_char_count();
        }
        None => {}
    }
}

mod scroll;
mod input_utf8;
mod scrollbar;
mod wrap_unicode;
mod ghost_artifacts;
mod timestamps;
mod history;
mod tabs_focus;
mod requests;
mod clear;
mod spinner;
mod stream_chunks;
mod bash_cmd;
mod crash_dump;
mod streaming_md;
mod word_wrap;
mod timer_compaction;
mod signal_handler;
mod tool_result_truncation;
