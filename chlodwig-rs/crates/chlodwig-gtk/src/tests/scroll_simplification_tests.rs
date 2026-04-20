//! Regression tests for "click → snap to top" and "after streaming the
//! viewport sits at the start of the new block instead of the bottom"
//! (issue #27, third pass — radical simplification).
//!
//! ### Diagnosis (after two failed attempts)
//!
//! Click bug: `set_focus_on_click(false)` was not enough. The internal
//! GTK click handler still places the cursor and calls
//! `scroll_mark_onscreen(insert_mark)`. The minimal robust fix is
//! `set_can_focus(false)` on both read-only output views — they cannot
//! receive focus, period. Mouse-drag selection still works (GestureDrag
//! does not need focus); right-click "Copy" still works (popover
//! dispatches the action regardless of focus).
//!
//! Scroll bug: the dual-handler `notify::upper` + `notify::page-size` +
//! the idle-scheduled `scroll_to_bottom` in `event_dispatch` form a
//! race-prone construction. The clean replacement is ONE mechanism:
//! the 16ms event-dispatch tick unconditionally pins
//! `adj.value = adj.upper() - adj.page_size()` whenever
//! `auto_scroll.is_active()`. That call may run before layout has
//! settled — the next tick (≤16ms later) re-runs it, so glitching is
//! bounded to a single frame and converges automatically.
//!
//! ### Things that MUST go away
//!
//! - The `notify::upper` and `notify::page-size` handlers in `main.rs`
//!   (they fire too early/late to be usable on their own).
//! - The `idle_add_local_once { window::scroll_to_bottom(...) }` in
//!   `event_dispatch.rs` (races with layout).
//! - The unconditional `select_range`/has_selection-guarded GestureDrag
//!   capture handler in `disable_text_view_drag` is moot now that the
//!   view cannot receive focus, but is kept for the explicit
//!   "clear selection so DND won't trigger" semantics on macOS.

#[test]
fn test_output_views_have_can_focus_false() {
    let src = include_str!("../window.rs");
    assert!(
        src.contains("final_view.set_can_focus(false)"),
        "window.rs: final_view must call set_can_focus(false) — \
         set_focus_on_click(false) is not enough; the internal click \
         handler still moves the insert mark and triggers \
         scroll_mark_onscreen → snap to first line (issue #27)."
    );
    assert!(
        src.contains("streaming_view.set_can_focus(false)"),
        "window.rs: streaming_view must call set_can_focus(false) for the \
         same reason as final_view (issue #27)."
    );
}

#[test]
fn test_main_no_longer_uses_notify_upper_or_page_size_handlers() {
    let src = include_str!("../main.rs");
    assert!(
        !src.contains("\"upper\"") && !src.contains("\"page-size\""),
        "main.rs must NOT install notify::upper / notify::page-size \
         handlers anymore — they race with layout. Auto-scroll happens \
         once per 16ms tick in event_dispatch instead."
    );
}

#[test]
fn test_event_dispatch_pins_value_to_bottom_when_auto_scroll_active() {
    let src = include_str!("../event_dispatch.rs");
    // The tick must compute upper - page_size and set the adjustment
    // value directly, gated by auto_scroll.is_active().
    assert!(
        src.contains("auto_scroll.is_active()"),
        "event_dispatch.rs must check auto_scroll.is_active() before \
         pinning the bottom."
    );
    assert!(
        src.contains("set_value") && src.contains("upper()") && src.contains("page_size()"),
        "event_dispatch.rs must pin value to upper() - page_size() each \
         tick when auto-scroll is active."
    );
}

#[test]
fn test_event_dispatch_schedules_post_layout_pin_after_content_changes() {
    // When `needs_scroll` is true (a new block was rendered or streaming
    // changed THIS tick), the immediate per-tick pin reads STALE
    // upper/page_size — GTK hasn't run the layout pass for the just-
    // applied buffer changes yet. We need ONE additional pin AFTER
    // layout completes, scheduled at default idle priority (200) so it
    // runs after GTK_PRIORITY_RESIZE (−90). Without this second pin,
    // the viewport sticks at the old bottom and the user sees a 16ms
    // delayed jump on the NEXT tick — that is the "ruckeln" the user
    // reports when streaming completes and content moves from the
    // streaming_view into the final_view.
    let src = include_str!("../event_dispatch.rs");
    assert!(
        src.contains("idle_add_local_once"),
        "event_dispatch.rs must schedule ONE post-layout pin via \
         idle_add_local_once after content-changing ticks. Without it, \
         the per-tick pin reads stale layout and the viewport jumps a \
         frame after streaming completes."
    );
}
