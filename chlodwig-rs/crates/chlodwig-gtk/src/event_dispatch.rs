//! GTK main-loop event dispatcher: polls the conversation-event channel,
//! renders streaming Markdown, drives the UserQuestion dialog queue, fires
//! desktop notifications, and debounces viewport-resize re-renders.
//!
//! Stage 4 of the GTK main.rs refactor (see `docs/gtk-main-refactoring.md`).
//! This was the largest remaining block in `main.rs` (~290 lines): a
//! `glib::timeout_add_local` callback that runs every 16ms (~60Hz) on the
//! GTK main thread. It bridges the async Tokio world (background
//! conversation loop) with synchronous GTK UI updates.
//!
//! `main.rs` now calls [`wire`] once during `activate()`.
//!
//! This module lives inside the **binary** (not the lib), so it can refer to
//! `crate::BackgroundCommand` and `crate::render` directly — same pattern
//! as `restore.rs` / `menu.rs` / `table_interactions.rs` / `submit.rs`.

use std::cell::{Cell, RefCell};
use std::collections::{HashMap, VecDeque};
use std::rc::Rc;
use std::time::Duration;

use gtk4::prelude::*;
use gtk4::{glib, ApplicationWindow};
use tokio::sync::mpsc::{UnboundedReceiver, UnboundedSender};

use chlodwig_core::ConversationEvent;
use chlodwig_gtk::app_state::AppState;
use chlodwig_gtk::window;

use crate::{render, BackgroundCommand};

/// Bundles every value the 16ms poll-loop closure captures.
///
/// Built once in `main.rs::activate` and consumed by [`wire`]. With ~14
/// captures, a positional argument list would be unmaintainable.
pub struct EventDispatchContext {
    pub widgets: window::UiWidgets,
    pub app_state: Rc<RefCell<AppState>>,
    pub event_rx: Rc<RefCell<Option<UnboundedReceiver<ConversationEvent>>>>,
    pub uq_rx: Rc<RefCell<Option<UnboundedReceiver<chlodwig_tools::UserQuestionRequest>>>>,
    pub prompt_tx: UnboundedSender<BackgroundCommand>,
    pub viewport_cols: Rc<Cell<usize>>,
    pub streaming_start_offset: Rc<Cell<i32>>,
    pub window: ApplicationWindow,
    pub session_started_at: String,
}

/// Install the 16ms GTK timeout that drives the entire UI from
/// background conversation events.
pub fn wire(ctx: EventDispatchContext) {
    let EventDispatchContext {
        widgets,
        app_state,
        event_rx,
        uq_rx,
        prompt_tx,
        viewport_cols,
        streaming_start_offset,
        window,
        session_started_at,
    } = ctx;

    let state_for_events = app_state.clone();
    let output_buf = widgets.output_buffer.clone();
    let scroll = widgets.output_scroll.clone();
    let status_left_label = widgets.status_left_label.clone();
    let status_right_label = widgets.status_right_label.clone();
    let window_for_notify = window.clone();
    let window_for_uq = window.clone();
    // Sequential dialog queue: only one UserQuestion dialog at a time.
    // Incoming requests are pushed to uq_queue; when no dialog is open
    // (uq_dialog_open == false), the next request is popped and shown.
    let uq_queue: Rc<RefCell<VecDeque<chlodwig_tools::UserQuestionRequest>>> =
        Rc::new(RefCell::new(VecDeque::new()));
    let uq_dialog_open: Rc<Cell<bool>> = Rc::new(Cell::new(false));
    let project_name = chlodwig_gtk::app_state::project_dir_name();
    let prompt_tx_for_events = prompt_tx.clone();
    let session_started_at_for_events = session_started_at.clone();
    let viewport_cols_for_events = viewport_cols.clone();
    let output_view_for_events = widgets.output_view.clone();

    // Use glib::timeout_add_local to periodically check for events
    // This bridges the async Tokio world with the GTK main loop.
    let event_rx_cell = event_rx.clone();
    let uq_rx_cell = uq_rx.clone();
    // Track tool_use_id → (tool_name, input) so ToolResult can identify Read/Bash/Write/Grep
    let mut tool_id_to_info: HashMap<String, (String, serde_json::Value)> = HashMap::new();
    // Snapshot of the streaming buffer text for Markdown rendering.
    // Filled from AppState on each tick; used for the per-tick re-render.
    let mut last_streaming_snapshot = String::new();
    // Track last rendered viewport width (in monospace columns) to detect resize.
    // When the width changes and we're NOT streaming, re-render all blocks so
    // tables adapt to the new width.
    let mut last_rendered_cols: usize = 0;
    // Debounce resize: count consecutive ticks with a new (stable) width before
    // triggering re-render. At 16ms/tick, 10 ticks ≈ 160ms debounce.
    let mut resize_stable_ticks: u32 = 0;
    let mut resize_pending_cols: usize = 0;
    glib::timeout_add_local(Duration::from_millis(16), move || {
        let mut rx_opt = event_rx_cell.borrow_mut();
        let rx = match rx_opt.as_mut() {
            Some(rx) => rx,
            None => return glib::ControlFlow::Continue,
        };

        // Drain all pending events (non-blocking).
        // TextDelta is NOT rendered here — it only accumulates in
        // AppState.streaming_buffer. The Markdown re-render happens
        // once per tick, after all events are drained.
        let mut needs_scroll = false;
        let mut streaming_finalized = false; // TextComplete or ToolUseStart ended streaming
        let mut finalized_text: Option<String> = None; // TextComplete's full_text
        let mut should_save_session = false; // TurnComplete or CompactionComplete → auto-save
        while let Ok(event) = rx.try_recv() {
            let should_update = {
                let mut state = state_for_events.borrow_mut();

                // Detect TextComplete and ToolUseStart: snapshot the buffer
                // BEFORE handle_event clears it.
                match &event {
                    ConversationEvent::TextComplete(full_text) => {
                        streaming_finalized = true;
                        finalized_text = Some(full_text.clone());
                    }
                    ConversationEvent::ToolUseStart { .. } => {
                        if !state.streaming_buffer.is_empty() {
                            streaming_finalized = true;
                            finalized_text = Some(state.streaming_buffer.clone());
                        }
                    }
                    // Auto-save on turn complete and compaction complete
                    ConversationEvent::TurnComplete
                    | ConversationEvent::CompactionComplete { .. } => {
                        should_save_session = true;
                    }
                    _ => {}
                }

                // Render non-streaming events into the TextBuffer
                let show_tools = state.show_tool_usage;
                render::render_event_to_buffer(
                    &output_buf,
                    &event,
                    &mut tool_id_to_info,
                    show_tools,
                );
                state.handle_event(event)
            };
            if should_update {
                needs_scroll = true;
            }
        }

        // Auto-save session after TurnComplete or CompactionComplete
        if should_save_session {
            let _ = prompt_tx_for_events.send(BackgroundCommand::SaveSession {
                started_at: session_started_at_for_events.clone(),
                table_sorts: state_for_events.borrow().table_sort_states(),
                name: state_for_events.borrow().session_name.clone(),
                stats: state_for_events.borrow().session_stats(),
            });
        }

        // Drain pending UserQuestion requests into the queue.
        {
            let mut uq_opt = uq_rx_cell.borrow_mut();
            if let Some(uq) = uq_opt.as_mut() {
                while let Ok(req) = uq.try_recv() {
                    uq_queue.borrow_mut().push_back(req);
                }
            }
        }

        // Show the next queued dialog if none is currently open.
        if !uq_dialog_open.get() {
            let next = uq_queue.borrow_mut().pop_front();
            if let Some(req) = next {
                uq_dialog_open.set(true);
                let uq_dialog_open_clone = uq_dialog_open.clone();
                let uq_queue_clone = uq_queue.clone();
                let window_clone = window_for_uq.clone();
                window::show_user_question_dialog(
                    &window_for_uq,
                    &req.question,
                    &req.options,
                    req.respond,
                    Box::new(move || {
                        // Called when the dialog closes — show next queued dialog if any.
                        uq_dialog_open_clone.set(false);
                        // Trigger next dialog on the next event loop tick
                        // (the timeout_add_local will pick it up).
                        let _ = &uq_queue_clone;
                        let _ = &window_clone;
                    }),
                );
            }
        }

        // --- Streaming Markdown rendering (once per tick) ---
        //
        // Three cases:
        // 1. Streaming is ongoing (dirty) → re-render streaming_buffer as Markdown
        // 2. Streaming was finalized this tick (TextComplete/ToolUseStart) → render final text
        // 3. Neither → nothing to do
        {
            // Update viewport columns from the current widget allocation
            viewport_cols_for_events.set(
                chlodwig_gtk::viewport::viewport_columns(
                    output_view_for_events.upcast_ref::<gtk4::TextView>(),
                ),
            );
            let mut state = state_for_events.borrow_mut();

            // Case 1: ongoing streaming with new deltas
            if state.streaming_dirty && !streaming_finalized {
                // First delta in this streaming run: record start offset
                if streaming_start_offset.get() < 0 {
                    if output_buf.end_iter().offset() > 0 {
                        window::append_to_output(&output_buf, "\n");
                    }
                    streaming_start_offset.set(output_buf.end_iter().offset());
                }

                render::rerender_streaming_markdown(
                    &output_buf,
                    streaming_start_offset.get(),
                    &state.streaming_buffer,
                    viewport_cols_for_events.get(),
                );
                last_streaming_snapshot = state.streaming_buffer.clone();
                state.acknowledge_streaming_render();
                needs_scroll = true;
            }

            // Case 2: streaming was finalized this tick
            if streaming_finalized {
                if streaming_start_offset.get() < 0 {
                    // Edge case: TextComplete arrived in the same tick as the first delta
                    if output_buf.end_iter().offset() > 0 {
                        window::append_to_output(&output_buf, "\n");
                    }
                    streaming_start_offset.set(output_buf.end_iter().offset());
                }

                let final_text = finalized_text.as_deref().unwrap_or("");
                let vp = viewport_cols_for_events.get();

                // Build table overrides if the finalized block has tables
                let block_idx = state.blocks.len().saturating_sub(1);
                let table_overrides: Vec<(usize, &chlodwig_core::TableData)> = state
                    .tables
                    .iter()
                    .filter(|(bi, _, _)| *bi == block_idx)
                    .map(|(_, ti, td)| (*ti, td))
                    .collect();
                let lines = if table_overrides.is_empty() {
                    chlodwig_core::render_markdown_with_width(final_text, vp)
                } else {
                    chlodwig_core::render_markdown_with_table_overrides(final_text, vp, &table_overrides)
                };

                // Delete previous streaming render
                chlodwig_gtk::emoji_overlay::clear_overlays_from(&output_buf, streaming_start_offset.get());
                let end_off = output_buf.end_iter().offset();
                if end_off > streaming_start_offset.get() {
                    let mut start = output_buf.iter_at_offset(streaming_start_offset.get());
                    let mut end = output_buf.iter_at_offset(end_off);
                    output_buf.delete(&mut start, &mut end);
                }

                // Re-render with table header tags
                chlodwig_gtk::md_renderer::append_styled_lines(&output_buf, &lines, &state.tables, block_idx);
                window::append_to_output(&output_buf, "\n");

                streaming_start_offset.set(-1);
                last_streaming_snapshot.clear();
                state.acknowledge_streaming_render();
                needs_scroll = true;
            }
        }

        if needs_scroll {
            // Update auto_scroll state — incoming content should not yank
            // the user back to bottom if they've scrolled up manually.
            state_for_events.borrow_mut().auto_scroll.scroll_to_bottom_if_auto();

            window::update_status(&status_left_label, &status_right_label, &state_for_events.borrow());

            // Only scroll if auto_scroll is still active
            if state_for_events.borrow().auto_scroll.is_active() {
                let scroll_clone = scroll.clone();
                glib::idle_add_local_once(move || {
                    window::scroll_to_bottom(&scroll_clone);
                });
            }
        } else if state_for_events.borrow().is_streaming {
            // No new events this tick, but still streaming — update status bar
            // so the spinner animation keeps rotating (~every 16ms tick).
            window::update_status(&status_left_label, &status_right_label, &state_for_events.borrow());
        }

        // --- System notification on turn complete ---
        // Send a desktop notification when a turn finishes and the window
        // is NOT focused (user switched to another app while waiting).
        {
            let mut state = state_for_events.borrow_mut();
            if state.take_should_notify() && !window_for_notify.is_active() {
                render::send_turn_complete_notification(&window_for_notify, &project_name);
            }
        }

        // --- Resize detection: re-render tables when viewport width changes ---
        // Check every tick if the viewport column count changed. Debounce by
        // waiting 10 consecutive ticks (~160ms) with the same new width before
        // triggering a full re-render. Skip during active streaming (the
        // streaming re-render already uses the current width).
        {
            let current_cols = chlodwig_gtk::viewport::viewport_columns(
                output_view_for_events.upcast_ref::<gtk4::TextView>(),
            );
            if current_cols != last_rendered_cols {
                if current_cols == resize_pending_cols {
                    resize_stable_ticks += 1;
                } else {
                    resize_pending_cols = current_cols;
                    resize_stable_ticks = 1;
                }
                if resize_stable_ticks >= 10 {
                    // Width has been stable for ~160ms — re-render
                    last_rendered_cols = current_cols;
                    viewport_cols_for_events.set(current_cols);
                    resize_stable_ticks = 0;
                    let state = state_for_events.borrow();
                    if !state.is_streaming {
                        render::rerender_all_blocks(&output_buf, &state, current_cols);
                        if state.auto_scroll.is_active() {
                            let scroll_clone = scroll.clone();
                            glib::idle_add_local_once(move || {
                                window::scroll_to_bottom(&scroll_clone);
                            });
                        }
                    }
                }
            } else {
                resize_stable_ticks = 0;
            }
        }

        glib::ControlFlow::Continue
    });
}
