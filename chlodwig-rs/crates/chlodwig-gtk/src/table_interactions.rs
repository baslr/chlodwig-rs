//! Table-related interaction wiring (header click → sort, row hover → highlight).
//!
//! Stage 2 of the GTK main.rs refactor (see `docs/gtk-main-refactoring.md`).
//! Both interactions attach EventControllers to the output `EmojiTextView`.
//! `main.rs` only calls `wire(...)` once during `activate()`.
//!
//! Two independent behaviors:
//! 1. **Header click sort**: clicking on a `table_sort:G:C` tag region
//!    cycles the sort state for global table index `G`, column `C`. The
//!    table is re-rendered in place and the new sort state is persisted
//!    via `BackgroundCommand::SaveSession`.
//! 2. **Row hover highlight**: as the cursor moves over a data row of a
//!    Markdown table (line contains `│` but is not a border line), a
//!    semi-transparent background tag is applied. Cleared on row change
//!    and on mouse leave.
//!
//! Like `menu.rs` and `restore.rs`, this module lives in the binary so it
//! can refer to `crate::BackgroundCommand` and the local `render` module.

use std::cell::{Cell, RefCell};
use std::rc::Rc;

use gtk4::glib;
use gtk4::prelude::*;

use chlodwig_gtk::app_state::AppState;
use chlodwig_gtk::window;

use crate::{render, BackgroundCommand};

/// Wire both table interactions onto the output view.
///
/// Captures are bundled as positional args (vs. a Context struct) because
/// the signature is short enough — the previous menu refactor showed that
/// 7+ args benefit from struct bundling, but 6 here is still readable.
pub fn wire(
    widgets: &window::UiWidgets,
    app_state: &Rc<RefCell<AppState>>,
    viewport_cols: &Rc<Cell<usize>>,
    prompt_tx: &tokio::sync::mpsc::UnboundedSender<BackgroundCommand>,
    session_started_at: &str,
) {
    wire_header_click_sort(widgets, app_state, viewport_cols, prompt_tx, session_started_at);
    wire_row_hover_highlight(widgets);
}

/// Header click → cycle sort state on the clicked column.
fn wire_header_click_sort(
    widgets: &window::UiWidgets,
    app_state: &Rc<RefCell<AppState>>,
    viewport_cols: &Rc<Cell<usize>>,
    prompt_tx: &tokio::sync::mpsc::UnboundedSender<BackgroundCommand>,
    session_started_at: &str,
) {
    let state_for_sort = app_state.clone();
    let final_view_for_sort = widgets.final_view.clone();
    let streaming_view_for_sort = widgets.streaming_view.clone();
    let viewport_cols_for_sort = viewport_cols.clone();
    let scroll_for_sort = widgets.output_scroll.clone();
    let prompt_tx_for_sort = prompt_tx.clone();
    let session_started_at_for_sort = session_started_at.to_string();
    let gesture = gtk4::GestureClick::new();
    gesture.set_button(1); // left click only
    gesture.connect_released(move |_gesture, _n_press, x, y| {
        // Convert widget coordinates to buffer coordinates
        let (bx, by) = final_view_for_sort.window_to_buffer_coords(
            gtk4::TextWindowType::Widget,
            x as i32,
            y as i32,
        );
        let Some(iter) = final_view_for_sort.iter_at_location(bx, by) else {
            return;
        };
        // Check all tags at this position for table_sort:G:C
        for tag in iter.tags() {
            let Some(name) = tag.name() else { continue };
            let Some(rest) = name.strip_prefix("table_sort:") else { continue };
            let parts: Vec<&str> = rest.split(':').collect();
            if parts.len() != 2 {
                continue;
            }
            let (Ok(global_idx), Ok(col_idx)) =
                (parts[0].parse::<usize>(), parts[1].parse::<usize>())
            else {
                continue;
            };
            let mut state = state_for_sort.borrow_mut();
            if state.sort_table(global_idx, col_idx) {
                let vw = viewport_cols_for_sort.get();
                render::rerender_table_in_place(
                    &final_view_for_sort,
                    &state,
                    global_idx,
                    vw,
                );
                // Save sort state immediately
                let _ = prompt_tx_for_sort.send(BackgroundCommand::SaveSession {
                    started_at: session_started_at_for_sort.clone(),
                    table_sorts: state.table_sort_states(),
                    name: state.session_name.clone(),
                    stats: state.session_stats(),
                });
                if state.auto_scroll.is_active() {
                    let sc = scroll_for_sort.clone();
                    let fv = final_view_for_sort.clone();
                    let sv = streaming_view_for_sort.clone();
                    glib::idle_add_local_once(move || {
                        window::scroll_to_content_bottom(&sc, &fv, &sv);
                    });
                }
            }
        }
    });
    widgets.final_view.add_controller(gesture);
}

/// Mouse motion over the output view → highlight the table data row under the cursor.
fn wire_row_hover_highlight(widgets: &window::UiWidgets) {
    // Create the highlight tag once
    let highlight_tag = gtk4::TextTag::builder()
        .name("table_row_highlight")
        .background("rgba(255,255,255,0.08)")
        .build();
    widgets.final_buffer.tag_table().add(&highlight_tag);

    let final_view_for_motion = widgets.final_view.clone();
    let final_buf_for_motion = widgets.final_buffer.clone();
    let prev_highlight_line = Rc::new(Cell::new(-1i32));

    let motion = gtk4::EventControllerMotion::new();
    let prev_line_for_motion = prev_highlight_line.clone();
    motion.connect_motion(move |_ctrl, x, y| {
        let (bx, by) = final_view_for_motion.window_to_buffer_coords(
            gtk4::TextWindowType::Widget,
            x as i32,
            y as i32,
        );
        let buf = &final_buf_for_motion;

        // Remove previous highlight
        let prev = prev_line_for_motion.get();
        if prev >= 0 {
            if let Some(tag) = buf.tag_table().lookup("table_row_highlight") {
                let start = buf.iter_at_line(prev).unwrap_or_else(|| buf.start_iter());
                let mut end = start;
                end.forward_to_line_end();
                buf.remove_tag(&tag, &start, &end);
            }
        }

        // Check if cursor is on a table data row (contains │ but not ┌┐└┘├┤)
        if let Some(iter) = final_view_for_motion.iter_at_location(bx, by) {
            let line = iter.line();
            let line_start = buf.iter_at_line(line).unwrap_or_else(|| buf.start_iter());
            let mut line_end = line_start;
            line_end.forward_to_line_end();
            let text = buf.text(&line_start, &line_end, false);

            let is_data_row = text.contains('│')
                && !text.starts_with('┌')
                && !text.starts_with('└')
                && !text.starts_with('├');

            if is_data_row {
                if let Some(tag) = buf.tag_table().lookup("table_row_highlight") {
                    let start = buf.iter_at_line(line).unwrap_or_else(|| buf.start_iter());
                    let mut end = start;
                    end.forward_to_line_end();
                    buf.apply_tag(&tag, &start, &end);
                }
                prev_line_for_motion.set(line);
            } else {
                prev_line_for_motion.set(-1);
            }
        } else {
            prev_line_for_motion.set(-1);
        }
    });

    // Clear highlight when mouse leaves the view
    let final_buf_for_leave = widgets.final_buffer.clone();
    let prev_line_for_leave = prev_highlight_line.clone();
    motion.connect_leave(move |_ctrl| {
        let prev = prev_line_for_leave.get();
        if prev >= 0 {
            if let Some(tag) = final_buf_for_leave.tag_table().lookup("table_row_highlight") {
                let start = final_buf_for_leave
                    .iter_at_line(prev)
                    .unwrap_or_else(|| final_buf_for_leave.start_iter());
                let mut end = start;
                end.forward_to_line_end();
                final_buf_for_leave.remove_tag(&tag, &start, &end);
            }
            prev_line_for_leave.set(-1);
        }
    });

    widgets.final_view.add_controller(motion);
}
