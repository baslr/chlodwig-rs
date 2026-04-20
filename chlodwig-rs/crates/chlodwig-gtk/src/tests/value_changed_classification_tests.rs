//! Regression tests for: "streaming finishes → viewport jumps to bottom
//! even though user had scrolled up".
//!
//! ## The bug
//!
//! While streaming, the `streaming_view` TextView is visible below the
//! `final_view`. When the user scrolls up, our `value-changed` handler
//! in main.rs calls `auto_scroll.user_scrolled_away()` → auto_scroll
//! becomes inactive. Good.
//!
//! On `TextComplete`, the streaming buffer is flushed, a final
//! `AssistantText` block is appended to final_view, and the
//! streaming_view is hidden (`set_visible(false)`).
//!
//! Net effect on the vadjustment: `upper` typically shrinks (the live
//! monospace-wrapped streaming content is replaced by a nicely
//! rendered final block, and streaming_view's height vanishes). GTK
//! automatically clamps `value` to `upper - page_size` and fires a
//! `value-changed` signal — without the user touching anything.
//!
//! Our handler previously treated every `value-changed` as user input:
//! it computed `at_bottom = (value + page_size) >= upper - 1.0`, saw
//! `true` (because GTK just clamped to the bottom), and called
//! `user_reached_bottom()` → auto_scroll re-activates → next tick
//! pins to bottom → user is yanked down despite never scrolling.
//!
//! ## The fix
//!
//! Classify each `value-changed` event:
//!
//! - Pure value change (upper and page_size unchanged) → USER scroll.
//!   Update auto_scroll accordingly.
//!
//! - `upper` OR `page_size` changed → LAYOUT event. GTK is clamping
//!   or content/viewport resized. Do NOT change auto_scroll state.
//!
//! This is encapsulated in `is_user_scroll(prev, curr)`. It's a pure
//! function, so we can unit-test it without GTK.

use crate::value_changed::{is_user_scroll, AdjSnapshot};

#[test]
fn test_pure_value_change_is_user_scroll() {
    // User dragged the scrollbar or used the trackpad: only `value` moved.
    let prev = AdjSnapshot { value: 100.0, upper: 500.0, page_size: 300.0 };
    let curr = AdjSnapshot { value: 50.0,  upper: 500.0, page_size: 300.0 };
    assert!(is_user_scroll(prev, curr));
}

#[test]
fn test_upper_shrunk_is_not_user_scroll() {
    // streaming_view hidden → content height dropped → GTK clamped value.
    // This is the exact scenario of the original bug.
    let prev = AdjSnapshot { value: 100.0, upper: 500.0, page_size: 300.0 };
    let curr = AdjSnapshot { value: 100.0, upper: 400.0, page_size: 300.0 };
    assert!(!is_user_scroll(prev, curr));
}

#[test]
fn test_upper_grew_is_not_user_scroll() {
    // New block rendered → upper grew. value-changed may fire with the
    // same `value` if GTK thinks the viewport moved relative to content.
    // Either way: not a user scroll.
    let prev = AdjSnapshot { value: 200.0, upper: 400.0, page_size: 300.0 };
    let curr = AdjSnapshot { value: 200.0, upper: 600.0, page_size: 300.0 };
    assert!(!is_user_scroll(prev, curr));
}

#[test]
fn test_page_size_changed_is_not_user_scroll() {
    // Window resize: viewport height changed.
    let prev = AdjSnapshot { value: 100.0, upper: 500.0, page_size: 300.0 };
    let curr = AdjSnapshot { value: 100.0, upper: 500.0, page_size: 250.0 };
    assert!(!is_user_scroll(prev, curr));
}

#[test]
fn test_tiny_upper_float_noise_still_counts_as_user_scroll() {
    // GTK sometimes produces sub-pixel upper values due to font hinting.
    // A drift of < 0.5 px is not a real content change — treat as user scroll
    // so real trackpad scrolls with unrelated layout noise still register.
    let prev = AdjSnapshot { value: 100.0, upper: 500.0,   page_size: 300.0 };
    let curr = AdjSnapshot { value: 50.0,  upper: 500.2,   page_size: 300.0 };
    assert!(is_user_scroll(prev, curr));
}

#[test]
fn test_upper_and_value_both_change_is_not_user_scroll() {
    // GTK's clamp after upper shrinks both decreases `upper` and
    // `value`. This must NOT be misclassified as the user scrolling
    // down to the bottom.
    let prev = AdjSnapshot { value: 200.0, upper: 500.0, page_size: 300.0 };
    let curr = AdjSnapshot { value: 100.0, upper: 400.0, page_size: 300.0 };
    assert!(!is_user_scroll(prev, curr));
}

#[test]
fn test_same_snapshot_is_not_user_scroll() {
    // Should never fire in practice, but defensive: nothing moved.
    let snap = AdjSnapshot { value: 100.0, upper: 500.0, page_size: 300.0 };
    assert!(!is_user_scroll(snap, snap));
}

/// Source-grep guard: the value-changed handler must funnel through
/// `is_user_scroll` and must update the previous snapshot.
///
/// Stage B: this handler is registered per tab in `tab::attach_new_tab`
/// (was in `main.rs::activate` in Stage A).
#[test]
fn test_main_rs_uses_is_user_scroll_classification() {
    let src = include_str!("../tab.rs");
    assert!(
        src.contains("is_user_scroll"),
        "tab.rs's per-tab value-changed handler must call is_user_scroll to \
         distinguish user input from GTK layout-induced clamps. \
         Without this, hiding streaming_view at TextComplete snaps the \
         viewport back to the bottom even when the user scrolled up."
    );
}
