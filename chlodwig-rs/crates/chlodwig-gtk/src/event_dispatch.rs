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
use std::collections::VecDeque;
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
        window,
        session_started_at,
    } = ctx;

    let state_for_events = app_state.clone();
    let final_buf = widgets.final_buffer.clone();
    let streaming_buf = widgets.streaming_buffer_widget.clone();
    let streaming_view = widgets.streaming_view.clone();
    let scroll = widgets.output_scroll.clone();
    let status_left_label = widgets.status_left_label.clone();
    let status_right_label = widgets.status_right_label.clone();
    let window_for_notify = window.clone();
    let window_for_uq = window.clone();
    // Sequential dialog queue: only one UserQuestion dialog at a time.
    let uq_queue: Rc<RefCell<VecDeque<chlodwig_tools::UserQuestionRequest>>> =
        Rc::new(RefCell::new(VecDeque::new()));
    let uq_dialog_open: Rc<Cell<bool>> = Rc::new(Cell::new(false));
    let project_name = app_state.borrow().project_dir_name();
    let prompt_tx_for_events = prompt_tx.clone();
    let session_started_at_for_events = session_started_at.clone();
    let viewport_cols_for_events = viewport_cols.clone();
    let final_view_for_events = widgets.final_view.clone();

    let event_rx_cell = event_rx.clone();
    let uq_rx_cell = uq_rx.clone();
    let mut last_rendered_cols: usize = 0;
    let mut resize_stable_ticks: u32 = 0;
    let mut resize_pending_cols: usize = 0;
    glib::timeout_add_local(Duration::from_millis(16), move || {
        let mut rx_opt = event_rx_cell.borrow_mut();
        let rx = match rx_opt.as_mut() {
            Some(rx) => rx,
            None => return glib::ControlFlow::Continue,
        };

        // ── Drain all pending events ──────────────────────────────────
        //
        // For each event:
        //   1. Determine whether it adds a new DisplayBlock.
        //      If yes, snapshot state.blocks.len() BEFORE handle_event so
        //      we know which block index will be the new one (for table
        //      lookup in the renderer).
        //   2. Call state.handle_event(event) — it may push a new block,
        //      append to streaming_buffer, etc.
        //   3. If a new block was pushed, render it via append_block into
        //      the final_buffer.
        //
        // TextDelta still just accumulates into state.streaming_buffer
        // (no immediate render). The streaming_view is updated AFTER the
        // event drain, once per tick.
        let mut needs_scroll = false;
        let mut should_save_session = false;
        let mut streaming_just_finalized = false;
        let viewport_w = chlodwig_gtk::viewport::viewport_columns(
            final_view_for_events.upcast_ref::<gtk4::TextView>(),
        );
        viewport_cols_for_events.set(viewport_w);

        while let Ok(event) = rx.try_recv() {
            // Auto-save trigger detection
            if matches!(
                event,
                ConversationEvent::TurnComplete | ConversationEvent::CompactionComplete { .. }
            ) {
                should_save_session = true;
            }

            // TextComplete also flushes streaming → it produces a new
            // AssistantText block and clears state.streaming_buffer.
            if matches!(event, ConversationEvent::TextComplete(_)) {
                streaming_just_finalized = true;
            }
            // ToolUseStart while streaming flushes streaming first too.
            if matches!(event, ConversationEvent::ToolUseStart { .. }) {
                let state = state_for_events.borrow();
                if !state.streaming_buffer.is_empty() {
                    streaming_just_finalized = true;
                }
            }

            let blocks_before = state_for_events.borrow().blocks.len();
            let should_update = state_for_events.borrow_mut().handle_event(event);
            let state = state_for_events.borrow();

            // Render any newly added block(s) — handle_event may add 1
            // or 2 blocks per event (e.g. ToolUseStart while streaming
            // flushes the streaming buffer as AssistantText AND adds the
            // ToolUseStart block).
            if state.blocks.len() > blocks_before {
                for block_idx in blocks_before..state.blocks.len() {
                    let ctx = render::RenderCtx::for_block(&state, viewport_w, block_idx);
                    render::append_block(&final_buf, &state.blocks[block_idx], &ctx);
                }
            }
            drop(state);

            if should_update {
                needs_scroll = true;
            }
        }

        // Auto-save session
        if should_save_session {
            let _ = prompt_tx_for_events.send(BackgroundCommand::SaveSession {
                started_at: session_started_at_for_events.clone(),
                table_sorts: state_for_events.borrow().table_sort_states(),
                name: state_for_events.borrow().session_name.clone(),
                stats: state_for_events.borrow().session_stats(),
            });
        }

        // ── UserQuestion dialog queue ─────────────────────────────────
        {
            let mut uq_opt = uq_rx_cell.borrow_mut();
            if let Some(uq) = uq_opt.as_mut() {
                while let Ok(req) = uq.try_recv() {
                    uq_queue.borrow_mut().push_back(req);
                }
            }
        }
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
                        uq_dialog_open_clone.set(false);
                        let _ = &uq_queue_clone;
                        let _ = &window_clone;
                    }),
                );
            }
        }

        // ── Streaming view update (once per tick) ─────────────────────
        //
        // Renders state.streaming_buffer into the SEPARATE streaming_view's
        // buffer. The streaming view's buffer is owned by the streaming
        // widget, not interleaved into the final history.
        {
            let mut state = state_for_events.borrow_mut();
            if state.streaming_dirty {
                let visible = render::render_streaming_into(
                    &streaming_buf,
                    &state.streaming_buffer,
                    viewport_w,
                );
                streaming_view.set_visible(visible);
                state.acknowledge_streaming_render();
                needs_scroll = true;
            }
            // If streaming was just finalized this tick, the buffer is now
            // empty → hide the streaming view.
            if streaming_just_finalized && state.streaming_buffer.is_empty() {
                let _ = render::render_streaming_into(&streaming_buf, "", viewport_w);
                streaming_view.set_visible(false);
            }
        }

        if needs_scroll {
            state_for_events
                .borrow_mut()
                .auto_scroll
                .scroll_to_bottom_if_auto();
            window::update_status(
                &status_left_label,
                &status_right_label,
                &state_for_events.borrow(),
            );
            if state_for_events.borrow().auto_scroll.is_active() {
                let scroll_clone = scroll.clone();
                glib::idle_add_local_once(move || {
                    window::scroll_to_bottom(&scroll_clone);
                });
            }
        } else if state_for_events.borrow().is_streaming {
            window::update_status(
                &status_left_label,
                &status_right_label,
                &state_for_events.borrow(),
            );
        }

        // ── System notification on turn complete ──────────────────────
        {
            let mut state = state_for_events.borrow_mut();
            if state.take_should_notify() && !window_for_notify.is_active() {
                render::send_turn_complete_notification(&window_for_notify, &project_name);
            }
        }

        // ── Resize detection: re-render final_view on width change ────
        {
            let current_cols = chlodwig_gtk::viewport::viewport_columns(
                final_view_for_events.upcast_ref::<gtk4::TextView>(),
            );
            if current_cols != last_rendered_cols {
                if current_cols == resize_pending_cols {
                    resize_stable_ticks += 1;
                } else {
                    resize_pending_cols = current_cols;
                    resize_stable_ticks = 1;
                }
                if resize_stable_ticks >= 10 {
                    last_rendered_cols = current_cols;
                    viewport_cols_for_events.set(current_cols);
                    resize_stable_ticks = 0;
                    let state = state_for_events.borrow();
                    if !state.is_streaming {
                        render::render_all_blocks_into(&final_buf, &state, current_cols, true);
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
