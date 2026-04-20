//! Source-grep regression tests for the scroll-position strategy in
//! `event_dispatch.rs` and `window.rs`.
//!
//! Pure-focus scroll model:
//!   - Spacer height is fixed (no dynamic resize).
//!   - Each tick captures `value_before` and `was_at_content_bottom`.
//!   - After layout settles (glib::idle_add_local_once), if the user
//!     was at content_bottom we snap to the new content_bottom; otherwise
//!     we restore `value_before` exactly.
//!   - The `auto_scroll` state machine is NOT consulted in event_dispatch.

#[test]
fn test_event_dispatch_uses_was_at_content_bottom_strategy() {
    let src = include_str!("../event_dispatch.rs");
    assert!(
        src.contains("let value_before = "),
        "event_dispatch.rs must capture value_before at the start of each tick"
    );
    assert!(
        src.contains("was_at_content_bottom"),
        "event_dispatch.rs must capture `was_at_content_bottom` at tick start \
         (computed from value_before + page_size vs. final_h + stream_h)"
    );
    assert!(
        src.contains("idle_add_local_once"),
        "the restore must be deferred via glib::idle_add_local_once \
         so GTK's layout pass has settled before we set_value"
    );
    assert!(
        src.contains("content_bottom"),
        "the auto-snap target must be `content_bottom - page_size` \
         (final_height + streaming_height), not `upper - page_size` \
         which would scroll into the empty bottom spacer"
    );
}

#[test]
fn test_event_dispatch_does_not_dynamically_resize_spacer() {
    let src = include_str!("../event_dispatch.rs");
    assert!(
        !src.contains("bottom_spacer.set_height_request")
            && !src.contains("set_height_request(needed_spacer_height"),
        "event_dispatch.rs must NOT dynamically resize the bottom spacer. \
         The spacer is set once in window.rs to a fixed, generous height."
    );
}

#[test]
fn test_event_dispatch_does_not_use_pin_to_content_bottom_combiner() {
    let src = include_str!("../event_dispatch.rs");
    assert!(
        !src.contains("pin_to_content_bottom"),
        "the old `pin_to_content_bottom = auto_active_before || …` heuristic \
         was unreliable (auto_scroll state could be flipped by GTK auto-clamps). \
         Use `was_at_content_bottom` computed from raw adjustment values instead."
    );
    assert!(
        !src.contains("user_was_in_streaming_before"),
        "drop the user_was_in_streaming_before heuristic — was_at_content_bottom \
         (single check at tick start) covers all cases without depending on \
         streaming_view visibility before the mutations."
    );
}

#[test]
fn test_event_dispatch_does_not_consult_auto_scroll_for_scroll_commands() {
    let src = include_str!("../event_dispatch.rs");
    // `auto_scroll.scroll_to_bottom_if_auto()` is allowed (state bookkeeping
    // only — no GTK side effects), but we must not use auto_scroll as a
    // gate for the actual idle-restore branch.
    assert!(
        !src.contains("auto_active_before"),
        "auto_active_before snapshot is gone — replaced by was_at_content_bottom \
         which is computed directly from adjustment values (no dependency on \
         the auto_scroll state machine)."
    );
}

#[test]
fn test_window_bottom_spacer_has_fixed_height() {
    let src = include_str!("../window.rs");
    assert!(
        src.contains("output_bottom_spacer"),
        "window.rs must define output_bottom_spacer in the output_inner_box"
    );
    assert!(
        src.contains("pub output_bottom_spacer: GtkBox"),
        "UiWidgets must export output_bottom_spacer"
    );
    // Generous fixed height (>= max practical viewport). 4000 px covers
    // 4K-tall windows with room to spare.
    assert!(
        src.contains("height_request(4000)"),
        "output_bottom_spacer must have a fixed height_request of 4000 — \
         no dynamic resize, no expand, just a static reservation that keeps \
         GtkAdjustment from clamping value when streaming_view shrinks"
    );
    // The spacer block (`let output_bottom_spacer = GtkBox::builder()…`)
    // must not contain `vexpand` between its `let` and the closing `.build()`.
    let needle = "let output_bottom_spacer = GtkBox::builder()";
    let start = src.find(needle).expect("spacer definition must exist");
    let after = &src[start..];
    let end_rel = after.find(".build()").expect("spacer .build() missing");
    let block = &after[..end_rel];
    assert!(
        !block.contains("vexpand"),
        "output_bottom_spacer must not vexpand — it must be a fixed-size box"
    );
}

#[test]
fn test_main_uses_content_bottom_for_at_bottom_check() {
    // Stage B: per-tab value-changed handler lives in tab.rs.
    let src = include_str!("../tab.rs");
    assert!(
        src.contains("content_bottom"),
        "tab.rs's per-tab value-changed handler must compute at_bottom against \
         content_bottom (final_height + streaming_height), not upper, \
         because upper is inflated by the bottom spacer"
    );
}

#[test]
fn test_restore_pins_value_before_on_streaming_finalize() {
    // Bug: while following the stream, the viewport jumped UP on every
    // TextComplete (= when the streaming buffer becomes a final block).
    //
    // Root cause: at TextComplete, three things happen in this order:
    //   (a) streaming_view.set_visible(false)  → stream_h becomes 0
    //   (b) final_view buffer gets appended    → final_h NOT YET grown
    //   (c) GTK schedules a layout pass         → final_h grows next frame
    //
    // The tick-callback fires after frame 2 (post-layout), so by then
    // (c) is done and final_h IS correct. BUT — and this is the trap —
    // `was_at_content_bottom` was captured at tick START, when stream_h
    // was non-zero. The user IS at the bottom of the OLD content stack.
    // We then snap to `final_h_now + stream_h_now (=0) - page_size`,
    // which equals `final_h_after_growth - page_size`. If final_h_after
    // ≈ final_h_before + stream_h_before (i.e. the block migrated 1:1
    // from streaming to final), the target is correct.
    //
    // BUT in practice the stream is RE-RENDERED into the final_view
    // with a different word-wrap, list spacing, code-block padding etc.
    // The new final_h can be SHORTER than expected. → snap target lands
    // ABOVE the actual content bottom → on the next tick we capture
    // value_before at that wrong-position-pinned spot, which is no
    // longer "at content bottom" → freeze at the wrong spot.
    //
    // Fix: when `streaming_just_finalized`, the SIMPLEST correct rule
    // is "pin value_before exactly". The pixel position the user was
    // looking at (in absolute coords of output_inner_box) is the same
    // pixel position they should still be looking at after the visual
    // re-arrangement (which is meant to be invisible to the user).
    // No measurement, no math, no race.
    let src = include_str!("../event_dispatch.rs");
    let marker = "Scroll anchor enforcement";
    let idx = src.find(marker).expect("scroll anchor section marker missing");
    let tail = &src[idx..];
    let end = tail
        .find("ControlFlow::Continue\n    });")
        .unwrap_or(tail.len().min(3500));
    let section = &tail[..end];
    assert!(
        section.contains("streaming_just_finalized"),
        "tick-restore must consult streaming_just_finalized to bypass \
         the content_bottom snap on TextComplete (the streaming→final \
         re-render produces inconsistent heights). Section:\n{section}"
    );
}

#[test]
fn test_event_dispatch_restore_uses_tick_callback_not_idle() {
    // Bug: tick-restore in event_dispatch.rs used glib::idle_add_local_once.
    // Same root cause as the Cmd+Enter bug: GTK4 layout runs on the frame
    // clock, not the GLib main loop. An idle can fire BEFORE the next
    // frame's layout pass completes — allocated_height() returns the
    // PRE-mutation value → content_bottom target is short → the snap
    // lands above the new content, then the next tick "corrects" by
    // pinning that wrong position. Symptom: while following the stream,
    // the viewport jumps back to the top.
    //
    // Fix: use Widget::add_tick_callback in the post-mutation restore,
    // same pattern as scroll_to_content_bottom in window.rs. Skip the
    // first frame (layout-invalidate), measure on the second frame.
    let src = include_str!("../event_dispatch.rs");
    // Find the restore section.
    let marker = "Scroll anchor enforcement";
    let idx = src.find(marker).expect("scroll anchor section marker missing");
    let tail = &src[idx..];
    let end = tail
        .find("ControlFlow::Continue\n    });")
        .unwrap_or(tail.len().min(3500));
    let section = &tail[..end];
    assert!(
        section.contains("add_tick_callback"),
        "tick-restore must use add_tick_callback for the same reason \
         scroll_to_content_bottom does (frame-clock-driven layout, see \
         Gotcha #48). Section:\n{section}"
    );
    assert!(
        !section.contains("glib::idle_add_local_once("),
        "tick-restore must NOT call glib::idle_add_local_once — idles fire \
         BEFORE the next frame's layout pass completes, allocated_height() \
         returns stale values, snap lands above new content. Section:\n{section}"
    );
}

#[test]
fn test_bottom_follow_zone_is_20_px() {
    // The "at bottom" classifier must use a 20 px tolerance band, not
    // a 1 px epsilon. UX rationale: the user's finger lifts off the
    // trackpad slightly before reaching pixel-perfect bottom; without
    // a tolerance, a 2 px overshoot disables follow-mode and the
    // viewport freezes. 20 px is wide enough to be forgiving but
    // narrow enough that a deliberate scroll-up of one line (~20 px)
    // already exits the zone.
    //
    // Two places must agree:
    //   - event_dispatch.rs: was_at_content_bottom snapshot at tick start
    //   - tab.rs (Stage B; was main.rs in Stage A): at_bottom check in
    //     value-changed handler
    let ed = include_str!("../event_dispatch.rs");
    let mn = include_str!("../tab.rs");
    // Use the LET-binding line as marker (avoids matching the variable
    // name in comments which can land near non-ASCII chars and cause
    // char-boundary panics in str slicing — see Gotcha #16).
    let ed_marker = "let was_at_content_bottom =";
    let ed_idx = ed.find(ed_marker).expect("was_at_content_bottom binding");
    // Look at the next ~400 chars (the binding spans 2-3 lines).
    let hi = (ed_idx + 400).min(ed.len());
    // Walk back to a char boundary if hi lands inside a multi-byte char.
    let mut hi = hi;
    while hi < ed.len() && !ed.is_char_boundary(hi) {
        hi += 1;
    }
    let snippet = &ed[ed_idx..hi];
    assert!(
        snippet.contains("20.0"),
        "event_dispatch.rs was_at_content_bottom must use a 20.0 px \
         tolerance band, not 1.0. Snippet:\n{snippet}"
    );
    let mn_marker = "let at_bottom =";
    let mn_idx = mn.find(mn_marker).expect("at_bottom binding");
    let hi = (mn_idx + 200).min(mn.len());
    let mut hi = hi;
    while hi < mn.len() && !mn.is_char_boundary(hi) {
        hi += 1;
    }
    let snippet = &mn[mn_idx..hi];
    assert!(
        snippet.contains("20.0"),
        "tab.rs at_bottom check must use a 20.0 px tolerance band, \
         not 1.0. Snippet:\n{snippet}"
    );
}

#[test]
fn test_scroll_to_content_bottom_uses_tick_callback() {
    // Bug: even with idle_add_local_once (priority 200, after RESIZE
    // priority -90), GTK4 layout runs on the FRAME CLOCK, not the main
    // loop. Idles can fire before the next frame's layout completes,
    // so allocated_height() reads stale values. Visible symptom:
    // Cmd+Enter inserts the user message but viewport stops short of it.
    //
    // Fix: add_tick_callback runs in sync with the frame clock, AFTER
    // the layout pass — allocated_height() is guaranteed current.
    let src = include_str!("../window.rs");
    let needle = "pub fn scroll_to_content_bottom(";
    let start = src.find(needle).expect("scroll_to_content_bottom must exist");
    let after_sig = &src[start..];
    let body_start = after_sig.find('{').expect("function body opening brace");
    let body_end_rel = after_sig[body_start..]
        .find("\n}\n")
        .expect("function body closing brace");
    let body = &after_sig[body_start..body_start + body_end_rel];
    assert!(
        body.contains("add_tick_callback"),
        "scroll_to_content_bottom must use Widget::add_tick_callback to \
         defer the measure+set_value until the frame-clock-driven layout \
         pass has completed. idle_add_local_once is NOT sufficient — it \
         can fire before the next frame's layout, leaving allocated_height \
         stale. Function body:\n{body}"
    );
}

#[test]
fn test_pin_tick_only_fires_on_streaming_just_finalized() {
    // Bug: while auto_scroll=false (user has scrolled away from bottom),
    // the user tried to scroll freely but got yanked back on every
    // mutation tick. Root cause: the pin/snap tick callback ran on
    // EVERY `mutated` and had a fall-through branch that restored
    // `value_before` unconditionally. If the user scrolled WHILE a
    // TextDelta was being processed, the tick (2 frames later) would
    // reset adj.value() to value_before → cancel the user's scroll.
    //
    // Fix: the pin/snap tick has ONE job: on streaming_just_finalized,
    // pin value_before to preserve the pixel position through the
    // streaming→final block migration. Nothing else.
    let src = include_str!("../event_dispatch.rs");
    // Locate the pin tick by its section header.
    let marker = "── Pin (frame-clock";
    let idx = src.find(marker).expect("pin tick section marker missing");
    let end = (idx + 1500).min(src.len());
    let mut safe_end = end;
    while safe_end > idx && !src.is_char_boundary(safe_end) {
        safe_end -= 1;
    }
    let section = &src[idx..safe_end];
    assert!(
        section.contains("if streaming_just_finalized"),
        "the pin tick must be scheduled ONLY when \
         streaming_just_finalized is true — else it fights the user's \
         manual scrolling. Section:\n{section}"
    );
    assert!(
        !section.contains("else if was_at_content_bottom"),
        "the pin tick must no longer branch on was_at_content_bottom — \
         auto-scroll follow is handled by the separate y_bottom tick. \
         Section:\n{section}"
    );
}

#[test]
fn test_auto_scroll_tick_snaps_to_content_bottom() {
    // The auto-scroll tick (runs every `mutated` frame when
    // auto_scroll.is_active()) must snap to the bottom of the REAL
    // content = final_h + stream_h - page_size. This mirrors the
    // explicit scroll_to_content_bottom() from submit.rs and is the
    // bewährtes Verhalten from commit c9b36ff.
    //
    // The earlier y_bottom-only approach (streaming_view bottom only)
    // didn't cover the Cmd+Enter case: the user message is written
    // DIRECTLY to final_view without ever going through streaming_view,
    // so y_bottom of streaming_view was unrelated to the new prompt
    // position.
    let src = include_str!("../event_dispatch.rs");
    // The tick must measure final_view AND streaming_view.
    assert!(
        src.contains("final_view_clone") || src.contains("final_view\n"),
        "auto-scroll tick must measure final_view allocation"
    );
    assert!(
        src.contains("streaming_view_clone") || src.contains("streaming_view.allocation"),
        "auto-scroll tick must measure streaming_view allocation"
    );
    assert!(
        src.contains("final_h + stream_h") || src.contains("final_h_tick + stream_h_tick"),
        "auto-scroll tick must compute content_bottom = final_h + stream_h"
    );
}

#[test]
fn test_auto_scroll_tick_has_monotonic_down_guard() {
    // Monotonic-down guard: never scroll UP, only DOWN. A height
    // fluctuation (re-render, wrap delta) would otherwise cause
    // jitter as the viewport bounces up-down-up between ticks.
    let src = include_str!("../event_dispatch.rs");
    let marker = "final_h + stream_h";
    let idx = src
        .find(marker)
        .or_else(|| src.find("final_h_tick + stream_h_tick"))
        .expect("content_bottom computation missing");
    let end = (idx + 500).min(src.len());
    let mut safe_end = end;
    while safe_end > idx && !src.is_char_boundary(safe_end) {
        safe_end -= 1;
    }
    let block = &src[idx..safe_end];
    let has_guard = block.contains("target > current")
        || block.contains("target > value")
        || block.contains("new_value > value")
        || block.contains("new_value > current");
    assert!(
        has_guard,
        "auto-scroll tick must enforce monotonic-down. Block:\n{block}"
    );
}

#[test]
fn test_auto_scroll_tick_respects_auto_scroll_flag() {
    // The auto-scroll tick must consult state.auto_scroll.is_active()
    // before calling set_value. Otherwise the user can never escape
    // follow mode by scrolling up while the stream runs.
    let src = include_str!("../event_dispatch.rs");
    // Look in the auto-scroll tick block. Locate by its marker.
    let marker = "Auto-scroll";
    let idx = src
        .find(marker)
        .or_else(|| src.find("auto-scroll (content_bottom"))
        .or_else(|| src.find("final_h + stream_h"))
        .expect("auto-scroll tick marker missing");
    let start = idx.saturating_sub(200);
    let mut safe_start = start;
    while safe_start < idx && !src.is_char_boundary(safe_start) {
        safe_start += 1;
    }
    let end = (idx + 1500).min(src.len());
    let mut safe_end = end;
    while safe_end > idx && !src.is_char_boundary(safe_end) {
        safe_end -= 1;
    }
    let block = &src[safe_start..safe_end];
    assert!(
        block.contains("auto_scroll.is_active()")
            || block.contains("auto_scroll().is_active()"),
        "auto-scroll tick must check auto_scroll.is_active() before \
         set_value. Block:\n{block}"
    );
}


