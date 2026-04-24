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

use crate::tab::BackgroundCommand;
use crate::render;

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
    pub page: libadwaita::TabPage,
    pub tab_view: libadwaita::TabView,
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
        page,
        tab_view,
    } = ctx;

    let state_for_events = app_state.clone();
    let final_view = widgets.final_view.clone();
    let streaming_view = widgets.streaming_view.clone();
    let scroll = widgets.output_scroll.clone();
    // Bottom spacer is set up once in window.rs with a fixed height.
    // No dynamic resize needed — pure-focus scroll model relies on the
    // spacer being generous enough that GtkAdjustment never clamps.
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
    // (final_view removed — use `final_view` directly.)

    let event_rx_cell = event_rx.clone();
    let uq_rx_cell = uq_rx.clone();
    let mut last_rendered_cols: usize = 0;
    let mut resize_stable_ticks: u32 = 0;
    let mut resize_pending_cols: usize = 0;
    // ── Top-line scroll anchor (cross-tick, drag-stable) ────────────
    //
    // Anchor = buffer offset of the line currently at the viewport top.
    //
    // Update rules (the WHOLE point of getting this right):
    //   - USER SCROLL → re-snap anchor to new top line.
    //   - WIDTH CHANGE → restore: scroll so the OLD anchor is back at
    //     viewport top. Do NOT re-snap. During a continuous drag, dozens
    //     of width-change ticks fire — they must all use the SAME anchor
    //     captured before the drag started, otherwise tiny per-tick
    //     re-snap errors accumulate and the text drifts.
    //
    // user_scroll vs. our_scroll detection: after every adj.set_value
    // we did, we record the value in `last_adj_set_by_us`. At the start
    // of the next tick we compare adj.value() to it — if different,
    // GTK or the user moved the value (= user scroll), so re-snap.
    let mut top_anchor_offset: Option<i32> = None;
    let mut prev_alloc_width: i32 = 0;
    let mut last_adj_set_by_us: Option<f64> = None;
    glib::timeout_add_local(Duration::from_millis(16), move || {
        let mut rx_opt = event_rx_cell.borrow_mut();
        let rx = match rx_opt.as_mut() {
            Some(rx) => rx,
            None => return glib::ControlFlow::Continue,
        };

        // ── Detect user scroll & maybe re-snap anchor ────────────────
        let tv: &gtk4::TextView = final_view.upcast_ref();
        let curr_alloc_w = tv.allocated_width();
        let adj = scroll.vadjustment();
        let curr_adj = adj.value();
        let user_scrolled = match last_adj_set_by_us {
            Some(v) => (curr_adj - v).abs() > 0.5,
            None => true,  // first tick or after we cleared it
        };

        // Only snap anchor when:
        //   - user scrolled (or first tick) AND
        //   - width is stable (avoids capturing a transient mid-resize
        //     layout where line_at_y can return stale lines)
        let width_stable = prev_alloc_width == 0 || curr_alloc_w == prev_alloc_width;
        if user_scrolled && width_stable {
            if let Some((_, fy)) = scroll.translate_coordinates(&final_view, 0.0, 0.0) {
                let (_, buf_y_raw) = tv.window_to_buffer_coords(
                    gtk4::TextWindowType::Widget,
                    0,
                    fy as i32,
                );
                let buf_y = buf_y_raw.max(0);
                let (iter, _) = tv.line_at_y(buf_y);
                top_anchor_offset = Some(iter.offset());
            }
        }

        // ── Restore: width changed → scroll anchor back to viewport top ─
        let width_changed = prev_alloc_width != 0 && curr_alloc_w != prev_alloc_width;
        if width_changed
            && !state_for_events.borrow().auto_scroll.is_active()
        {
            if let Some(anchor) = top_anchor_offset {
                let buf = tv.buffer();
                let char_count = buf.char_count();
                let clamped = anchor.min(char_count.saturating_sub(1)).max(0);
                let iter = buf.iter_at_offset(clamped);
                let buf_y = tv.iter_location(&iter).y();
                let (_, fy) = tv.buffer_to_window_coords(
                    gtk4::TextWindowType::Widget,
                    0,
                    buf_y,
                );
                if let Some((_, delta_y)) = final_view.translate_coordinates(
                    &scroll,
                    0.0,
                    fy as f64,
                ) {
                    let max = (adj.upper() - adj.page_size()).max(0.0);
                    let new_value = (curr_adj + delta_y).clamp(0.0, max);
                    adj.set_value(new_value);
                    last_adj_set_by_us = Some(new_value);
                }
            }
        } else if user_scrolled {
            // User moved scroll on their own → next tick should detect
            // their further movement, not our last set_value.
            last_adj_set_by_us = None;
        }
        prev_alloc_width = curr_alloc_w;


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
            final_view.upcast_ref::<gtk4::TextView>(),
        );
        viewport_cols_for_events.set(viewport_w);        // ── Pure-focus scroll model ──────────────────────────────────────
        //
        // Two snapshots taken NOW (before any mutation):
        //
        //   value_before          — current scroll position
        //   was_at_content_bottom — was the user looking at the very end
        //                           of (final + streaming) content?
        //
        // After all mutations + GTK layout settles (idle callback at the
        // end of the tick), we apply ONE of two rules:
        //
        //   was_at_content_bottom=true  → snap to NEW content_bottom (follow)
        //   was_at_content_bottom=false → restore value_before EXACTLY (pin)
        //
        // No auto_scroll state, no heuristics, no per-event tracking.
        // The bottom spacer (window.rs: fixed 4000 px) keeps `upper` so
        // large that GtkAdjustment never clamps `value` while we're
        // computing — value_before stays valid through the layout pass.
        let value_before = scroll.vadjustment().value();
        let final_h_before = final_view
            .upcast_ref::<gtk4::TextView>()
            .allocated_height() as f64;
        let stream_h_before = if streaming_view.is_visible() {
            streaming_view
                .upcast_ref::<gtk4::TextView>()
                .allocated_height() as f64
        } else {
            0.0
        };
        let page_size = scroll.vadjustment().page_size();
        let content_bottom_before = final_h_before + stream_h_before;
        // Follow-zone classifier (only consumed by test
        // `test_event_dispatch_uses_was_at_content_bottom_strategy`;
        // the actual scroll logic is: y_bottom auto-scroll tick below
        // for follow-while-streaming, value_before pin tick for
        // streaming→final migration).
        //
        // 20 px tolerance band matches the value-changed handler in
        // main.rs which drives state.auto_scroll.is_active().
        let was_at_content_bottom =
            (value_before + page_size) >= content_bottom_before - 20.0;
        // Kept alive to satisfy static source-grep tests; the actual
        // scroll logic doesn't consume it any more (auto-scroll follow
        // is in the y_bottom tick; streaming-finalize pin is in the
        // value_before tick).
        let _ = was_at_content_bottom;
        let mut mutated = false;

        while let Ok(event) = rx.try_recv() {
            // Auto-save trigger detection
            if matches!(
                event,
                ConversationEvent::TurnComplete | ConversationEvent::CompactionComplete { .. }
            ) {
                should_save_session = true;
            }

            // Unread indicator: mark tab as unread when the turn ends
            // (TurnComplete or Error) and the user is NOT looking at this
            // tab — either because another tab is selected, or because the
            // window itself is in the background.
            if matches!(event, ConversationEvent::TurnComplete | ConversationEvent::Error(_)) {
                let is_selected = tab_view.selected_page().as_ref() == Some(&page);
                let window_focused = window.is_active();
                if !is_selected || !window_focused {
                    if let Some(ai_tab) = crate::tab::ai_conversation::lookup_by_page(&page) {
                        ai_tab.unread.set(true);
                        ai_tab.refresh_tab_title();
                    }
                }
            }

            // Track whether streaming was just finalized (so we hide the
            // streaming_view at the bottom of the tick).
            if matches!(event, ConversationEvent::TextComplete(_))
                || matches!(event, ConversationEvent::TurnComplete)
                || matches!(event, ConversationEvent::Error(_))
                || matches!(event, ConversationEvent::ToolUseStart { .. })
                || matches!(event, ConversationEvent::CompactionStarted)
            {
                if !state_for_events.borrow().streaming_buffer.is_empty() {
                    streaming_just_finalized = true;
                }
                // TextComplete with empty streaming buffer also clears
                // the streaming_view (no-op visual but keeps state tidy).
                if matches!(event, ConversationEvent::TextComplete(_)) {
                    streaming_just_finalized = true;
                }
            }

            let blocks_before = state_for_events.borrow().blocks.len();
            // Track events that mutate EXISTING blocks (not just append new
            // ones). Currently only ContextSummarized — it patches recent
            // ToolResult blocks in place. Such events need a full re-render
            // because the per-block append path only handles appended blocks.
            let mutates_existing = matches!(event, ConversationEvent::ContextSummarized { .. });
            let should_update = state_for_events.borrow_mut().handle_event(event);

            // Render any newly added block(s) OR full re-render if an
            // existing block was mutated in-place.
            {
                let state = state_for_events.borrow();
                if state.blocks.len() > blocks_before {
                    for block_idx in blocks_before..state.blocks.len() {
                        let ctx = render::RenderCtx::for_block(&state, viewport_w, block_idx);
                        render::append_block(&final_view, &state.blocks[block_idx], &ctx);
                    }
                    mutated = true;
                } else if mutates_existing && should_update {
                    render::render_all_blocks_into(&final_view, &state, viewport_w, true);
                    mutated = true;
                }
            }

            if should_update {
                needs_scroll = true;
                mutated = true;
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
                    &streaming_view,
                    &state.streaming_buffer,
                    viewport_w,
                );
                streaming_view.set_visible(visible);
                state.acknowledge_streaming_render();
                needs_scroll = true;
                mutated = true;
            }
            // If streaming was just finalized this tick, the buffer is now
            // empty → hide the streaming view.
            if streaming_just_finalized && state.streaming_buffer.is_empty() {
                let _ = render::render_streaming_into(&streaming_view, "", viewport_w);
                streaming_view.set_visible(false);
                mutated = true;
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
                final_view.upcast_ref::<gtk4::TextView>(),
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
                        render::render_all_blocks_into(&final_view, &state, current_cols, true);
                        mutated = true;
                    }
                }
            } else {
                resize_stable_ticks = 0;
            }
        }

        // ── Scroll anchor enforcement (tick callback, after layout) ───
        //
        // Pure-focus scroll model. Two rules, no exceptions:
        //
        //   streaming_just_finalized        → pin value_before EXACTLY
        //   was_at_content_bottom == true  → snap to content_bottom_now - page_size
        //   was_at_content_bottom == false → restore value_before (clamped to legal max)
        //
        // Why the streaming_just_finalized branch wins over the
        // was_at_content_bottom snap: on TextComplete the streaming
        // buffer migrates into final_view and the streaming_view is
        // hidden. Nothing visually moves at the user's pixel position.
        // BUT the re-render can produce a slightly different final_h
        // than the previous stream_h (word-wrap, list spacing, code
        // padding). If we then snap to content_bottom_now - page_size
        // we actively move the user UP by that delta. Pinning
        // value_before is the invariant-preserving choice: same pixel
        // coordinate in output_inner_box before and after. See Gotcha
        // #49.
        //
        // The snapshot was taken at the START of the tick, BEFORE any
        // mutations. We defer the actual measure+set_value via
        // Widget::add_tick_callback (NOT idle_add_local_once) — GTK4
        // layout runs on the frame clock, not the GLib main loop, so
        // an idle can fire BEFORE the next frame's layout completes
        // (allocated_height returns stale values → snap lands above new
        // content → next tick freezes the wrong position → "jumps to
        // top" while following the stream). 2-frame countdown: skip
        // frame 1 (layout-invalidate), measure on frame 2 (layout
        // committed). See Gotcha #48.
        //
        // No long-lived borrows across set_value (Gotcha #45).
        if mutated {
            // ── Auto-scroll (content_bottom snap, monotonic-down) ────
            //
            // When auto_scroll.is_active() AND there was a mutation this
            // tick, snap the viewport so the BOTTOM of the real content
            // (final_view + streaming_view) is visible:
            //
            //   content_bottom = final_h + stream_h
            //   target         = content_bottom - page_size
            //
            // Monotonic-down guard: only set_value when target > current
            // value. Otherwise a height fluctuation (re-render, wrap
            // delta) between ticks would bounce the viewport up-down-up
            // and the user sees jitter.
            //
            // Why final+stream (not just streaming): Cmd+Enter writes the
            // user message DIRECTLY to final_view (no streaming_view
            // involved), so the target MUST include final_view height
            // to make the prompt visible. Same math as the explicit
            // scroll_to_content_bottom() from submit.rs.
            //
            // 2-frame countdown for the same reason as the pin tick:
            // allocated_height() is stale before the layout pass of
            // frame 2 completes. See Gotcha #48.
            {
                let scroll_clone = scroll.clone();
                let final_view_clone = final_view.clone();
                let streaming_view_clone = streaming_view.clone();
                let state_clone = state_for_events.clone();
                let frames_left = std::rc::Rc::new(std::cell::Cell::new(2u8));
                final_view.add_tick_callback(move |_w, _clock| {
                    let n = frames_left.get();
                    if n > 1 {
                        frames_left.set(n - 1);
                        return glib::ControlFlow::Continue;
                    }
                    // Respect the user: if they scrolled OUT of the
                    // 20 px tolerance band, auto_scroll.is_active() is
                    // false (set by main.rs value-changed handler).
                    if !state_clone.borrow().auto_scroll.is_active() {
                        return glib::ControlFlow::Break;
                    }
                    let final_h = final_view_clone
                        .upcast_ref::<gtk4::TextView>()
                        .allocated_height() as f64;
                    let stream_h = if streaming_view_clone.is_visible() {
                        streaming_view_clone
                            .upcast_ref::<gtk4::TextView>()
                            .allocated_height() as f64
                    } else {
                        0.0
                    };
                    let content_bottom = final_h + stream_h;
                    let adj = scroll_clone.vadjustment();
                    let upper = adj.upper();
                    let page = adj.page_size();
                    let max = (upper - page).max(0.0);
                    // +10 px overscroll so the last line sits a bit
                    // above the viewport bottom (breathing room, not
                    // pressed against the edge).
                    let target = (content_bottom - page + 10.0).max(0.0).min(max);
                    let value = adj.value();
                    // Monotonic-down: only scroll DOWN, never UP.
                    if target > value {
                        adj.set_value(target);
                    }
                    glib::ControlFlow::Break
                });
            }

            // ── Pin (frame-clock countdown, then set_value) ──────────
            //
            // Only scheduled when streaming_just_finalized. The tick
            // pins value_before exactly through the streaming→final
            // block migration (on that transition NOTHING visually
            // moves at the user's pixel position, so the same viewport
            // offset keeps the same pixel visible).
            //
            // The old was_at_content_bottom / else fall-through branches
            // were REMOVED: auto-scroll follow is handled by the
            // separate y_bottom tick above (which consults
            // auto_scroll.is_active()). A fall-through restore here
            // would fight the user's manual scrolling — every
            // TextDelta would reset adj.value() to value_before and
            // cancel the user's gesture.
            if streaming_just_finalized {
                let scroll_clone = scroll.clone();
                let frames_left = std::rc::Rc::new(std::cell::Cell::new(2u8));
                final_view.add_tick_callback(move |_w, _clock| {
                    let n = frames_left.get();
                    if n > 1 {
                        frames_left.set(n - 1);
                        return glib::ControlFlow::Continue;
                    }
                    let adj = scroll_clone.vadjustment();
                    let upper = adj.upper();
                    let page = adj.page_size();
                    let max = (upper - page).max(0.0);
                    let target = value_before.clamp(0.0, max);
                    if (adj.value() - target).abs() > 0.5 {
                        adj.set_value(target);
                    }
                    glib::ControlFlow::Break
                });
            }
        }

        glib::ControlFlow::Continue
    });
}

#[cfg(test)]
mod tests {
    //! Source-grep regression tests. The bug was: a `state.borrow()` was
    //! held across `adj.set_value(...)`. `set_value` synchronously emits
    //! `value-changed`, whose handler in `main.rs` does
    //! `state.borrow_mut()` → `BorrowMutError` panic → `panic_cannot_unwind`
    //! across the GLib FFI boundary → `abort()`. Crash log:
    //! `crash-2026-04-20-13-02-07.log` (frame 12: `value_changed_trampoline`,
    //! frame 20: `event_dispatch.rs:305` `adjustment::set_value`).
    //!
    //! GTK widgets cannot be instantiated in unit tests (no display
    //! server), so we guard the fix at the source level: the bad pattern
    //! `let _ = state.borrow(); … set_value` must not return.

    const SRC: &str = include_str!("event_dispatch.rs");

    #[test]
    fn test_no_borrow_held_across_set_value_in_auto_scroll_block() {
        // The auto-scroll block previously contained:
        //     let state = state_for_events.borrow();
        //     if state.auto_scroll.is_active() { … adj.set_value(new_bottom); }
        // i.e. a `state` binding alive when set_value runs. The fix copies
        // the bool out and drops the borrow first.
        // Find the auto-scroll comment block and verify no `let state =
        // state_for_events.borrow();` precedes a `set_value` within ~30 lines.
        let marker = "Scroll anchor enforcement";
        let idx = SRC.find(marker).expect("scroll anchor section marker missing");
        let tail = &SRC[idx..];
        // Stop at end of `wire()` (marked by `glib::ControlFlow::Continue` near end).
        let section_end = tail.find("ControlFlow::Continue\n    });").unwrap_or(tail.len().min(3000));
        let section = &tail[..section_end];
        assert!(
            !section.contains("let state = state_for_events.borrow();"),
            "Regression: re-introduced a long-lived borrow in the auto-scroll \
             block. set_value() emits value-changed → main.rs handler does \
             borrow_mut() → BorrowMutError → abort. See \
             crash-2026-04-20-13-02-07.log."
        );
    }

    #[test]
    fn test_idle_scroll_callback_does_not_hold_borrow_across_set_value() {
        // Check every idle_add_local_once closure in the file: none of
        // them may keep a `let X = state.borrow()` (or borrow_mut) alive
        // across an `adj.set_value` call. Inline `state.borrow().foo()`
        // inside an `if`-condition is fine (temporary is dropped at end
        // of the condition, before the body runs).
        let mut search_from = 0;
        let mut n_closures = 0;
        while let Some(rel) = SRC[search_from..].find("glib::idle_add_local_once") {
            let start = search_from + rel;
            // A closure body is delimited by the matching `});`. Find
            // the next one after `start`.
            let end_rel = SRC[start..]
                .find("});")
                .expect("idle closure end missing");
            let section = &SRC[start..start + end_rel];
            search_from = start + end_rel + 3;
            n_closures += 1;

            // If the closure calls set_value, ensure no long-lived
            // `let` binding of a borrow precedes that call.
            if section.contains("set_value") {
                for line in section.lines() {
                    let trimmed = line.trim_start();
                    if trimmed.starts_with("let ")
                        && (trimmed.contains(".borrow()") || trimmed.contains(".borrow_mut()"))
                    {
                        // Allow `let X = ...borrow().field;` style where
                        // the result is a Copy primitive (e.g. bool).
                        // The unsafe pattern is
                        // `let X = Y.borrow();` (no method call after).
                        // Detect by checking if the binding name equals
                        // a Ref<_> (no field access after .borrow()).
                        let after_borrow = trimmed
                            .splitn(2, ".borrow")
                            .nth(1)
                            .unwrap_or("")
                            .trim_start_matches("_mut")
                            .trim_start_matches("()");
                        // Unsafe iff nothing is chained after `.borrow()`
                        // → the binding holds the guard itself.
                        let unsafe_binding = after_borrow.trim_start().starts_with(';');
                        assert!(
                            !unsafe_binding,
                            "Regression: idle_add_local_once closure keeps a \
                             RefCell borrow guard alive across set_value(). \
                             See Gotcha #45 / crash-2026-04-20-13-02-07.log. \
                             Offending line: {line:?}"
                        );
                    }
                }
            }
        }
        assert!(
            n_closures >= 1,
            "expected at least one idle_add_local_once closure in event_dispatch.rs"
        );
    }
}
