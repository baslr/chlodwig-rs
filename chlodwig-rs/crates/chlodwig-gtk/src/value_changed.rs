//! Classify `GtkAdjustment::value-changed` signals as either user-driven
//! or layout-induced.
//!
//! ## Why
//!
//! `value-changed` fires both when the user moves the scrollbar AND when
//! GTK itself clamps `value` to `[lower, upper - page_size]` after
//! `upper` or `page_size` changed (e.g. content added/removed, window
//! resized).
//!
//! The chlodwig-gtk auto-scroll state machine only cares about the first
//! kind: user intent. Treating layout-induced value changes as user
//! scrolls produces visible bugs, notably:
//!
//!   * User scrolls up while streaming. Stream finishes. `streaming_view`
//!     is hidden → `upper` shrinks → GTK clamps `value` downward →
//!     `value-changed` fires with the new (now close-to-bottom) position.
//!     If that is interpreted as "user reached bottom", auto-scroll is
//!     re-armed and the next tick pins the viewport at the bottom —
//!     yanking the user away from what they were reading.
//!
//! ## Classifier
//!
//! The classifier compares a snapshot of `(value, upper, page_size)`
//! before vs after the signal. If `upper` or `page_size` changed
//! meaningfully, it's a layout event and auto-scroll state MUST NOT be
//! touched. Only when both `upper` and `page_size` are unchanged do we
//! treat the delta in `value` as real user input.
//!
//! A small tolerance (0.5 px) on `upper` absorbs sub-pixel font-hinting
//! noise that occasionally produces spurious `value-changed` with a
//! micro-drift in `upper` during normal trackpad scrolling.
//!
//! This module is pure (no GTK dependency) so it can be unit-tested
//! without a display server.

/// Snapshot of the three `GtkAdjustment` properties that determine
/// viewport position and content geometry.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct AdjSnapshot {
    pub value: f64,
    pub upper: f64,
    pub page_size: f64,
}

/// Sub-pixel tolerance: `upper`/`page_size` deltas below this are
/// considered noise (font-hinting drift, etc.) and not a real layout
/// event. Keeping it at 0.5 px matches the pinning tolerance used in
/// `event_dispatch.rs` so the two stay symmetric.
const LAYOUT_EPSILON: f64 = 0.5;

/// Return `true` when the transition from `prev` to `curr` represents a
/// user-driven scroll (scrollbar drag, trackpad, arrow keys) rather than
/// a GTK-internal clamp caused by content or viewport resize.
///
/// Rules:
///   * `upper` changed by more than `LAYOUT_EPSILON` → layout event.
///   * `page_size` changed by more than `LAYOUT_EPSILON` → layout event.
///   * Otherwise: the adjustment's geometry is stable and any movement
///     in `value` is the user's doing.
///
/// Note: when nothing changed at all (`prev == curr`) we return `false`
/// — there's nothing to classify, and the caller should not update
/// auto-scroll state.
pub fn is_user_scroll(prev: AdjSnapshot, curr: AdjSnapshot) -> bool {
    if (curr.upper - prev.upper).abs() > LAYOUT_EPSILON {
        return false;
    }
    if (curr.page_size - prev.page_size).abs() > LAYOUT_EPSILON {
        return false;
    }
    // Geometry unchanged. If value also didn't move, nothing happened.
    (curr.value - prev.value).abs() > f64::EPSILON
}
