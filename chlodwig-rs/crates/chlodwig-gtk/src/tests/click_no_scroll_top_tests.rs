//! Regression tests for issue #27:
//! "clicking in output -> fastscroll -> back at first line".
//!
//! Root cause: `disable_text_view_drag` installs a capture-phase
//! `GestureDrag::connect_drag_begin` handler that called
//! `buf.select_range(&iter_at_offset(cursor_position), ...)` on EVERY
//! drag-begin (= every left-click). Because the read-only output view's
//! cursor lives at offset 0 by default (it's never moved — `editable=false`,
//! `cursor_visible=false`), each click moved the insert mark to offset 0,
//! and GTK's TextView then auto-scrolled the insert mark on-screen → the
//! view snapped to the first line.
//!
//! Fix: only clear the selection if `buf.has_selection()` is actually true.
//! When there is no selection, GTK's internal `gtk_text_view_drag_gesture_*`
//! handler will not initiate DND anyway, so the work is unnecessary.
//! Importantly, when no selection exists, do NOT touch the insert mark.
//!
//! These tests are source-grep tests because constructing a `TextView` in a
//! unit test requires a GDK display, which is not available in CI.

#[test]
fn test_disable_text_view_drag_guards_select_range_with_has_selection() {
    let src = include_str!("../window.rs");
    let start = src
        .find("fn disable_text_view_drag(")
        .expect("disable_text_view_drag must exist");
    let after = &src[start..];
    // function body ends at the first "\n}\n" after the signature
    let body_end = after.find("\n}\n").expect("function body must end");
    let body = &after[..body_end];

    assert!(
        body.contains("has_selection"),
        "disable_text_view_drag must guard select_range() behind \
         buf.has_selection() — otherwise every click moves the insert mark \
         to offset 0 and GTK auto-scrolls to the top (issue #27).\n\n\
         function body:\n{body}"
    );
}

#[test]
fn test_disable_text_view_drag_does_not_call_select_range_unconditionally() {
    // The drag-begin closure must NOT call select_range without a
    // has_selection() guard somewhere before it.
    let src = include_str!("../window.rs");
    let start = src
        .find("fn disable_text_view_drag(")
        .expect("disable_text_view_drag must exist");
    let after = &src[start..];
    let body_end = after.find("\n}\n").expect("function body must end");
    let body = &after[..body_end];

    if body.contains("select_range") {
        // If select_range is still called, it MUST be inside an `if`/guard
        // that checks has_selection() first.
        let select_pos = body.find("select_range").unwrap();
        let preceding = &body[..select_pos];
        assert!(
            preceding.contains("has_selection"),
            "select_range() call must be preceded by a has_selection() check \
             so clicks on a read-only view without an existing selection do \
             NOT move the insert mark (issue #27).\n\nbody:\n{body}"
        );
    }
}
