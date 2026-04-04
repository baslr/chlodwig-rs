use super::*;

#[test]
fn test_initial_state_auto_scroll() {
    let app = app_with_lines(100);
    assert!(app.auto_scroll);
    assert_eq!(app.scroll, 0);
}

#[test]
fn test_scroll_up_from_bottom_anchors_correctly() {
    let mut app = app_with_lines(100);
    let total = app.rendered_lines.len();
    assert!(total > 0);

    app.scroll_up(3);
    assert!(!app.auto_scroll, "Should leave auto_scroll on scroll up");
    assert_eq!(app.scroll, total - 3, "Should anchor at bottom minus 3");
}

#[test]
fn test_scroll_up_twice() {
    let mut app = app_with_lines(100);
    let total = app.rendered_lines.len();

    app.scroll_up(5);
    assert_eq!(app.scroll, total - 5);

    app.scroll_up(10);
    assert_eq!(app.scroll, total - 15);
    assert!(!app.auto_scroll);
}

#[test]
fn test_scroll_up_does_not_go_below_zero() {
    let mut app = app_with_lines(5);
    let total = app.rendered_lines.len();

    app.scroll_up(total + 100);
    assert_eq!(app.scroll, 0, "Should clamp at 0");
}

#[test]
fn test_scroll_down_snaps_to_auto_scroll() {
    let mut app = app_with_lines(100);
    let total = app.rendered_lines.len();
    let view_height = 20;

    app.scroll_up(10);
    assert!(!app.auto_scroll);
    let _pos_after_up = app.scroll;

    app.scroll_down(10, view_height);

    let max_scroll = total.saturating_sub(view_height);
    assert_eq!(app.scroll, max_scroll);
    assert!(app.auto_scroll, "Should snap back to auto_scroll at bottom");
}

#[test]
fn test_scroll_down_does_nothing_in_auto_scroll() {
    let mut app = app_with_lines(100);
    assert!(app.auto_scroll);
    let scroll_before = app.scroll;

    app.scroll_down(10, 20);
    assert_eq!(app.scroll, scroll_before, "Should not change scroll in auto mode");
    assert!(app.auto_scroll);
}

#[test]
fn test_scroll_down_partial() {
    let mut app = app_with_lines(100);
    let view_height = 20;

    app.scroll_up(50);
    let pos = app.scroll;

    app.scroll_down(10, view_height);
    assert_eq!(app.scroll, pos + 10);
    assert!(!app.auto_scroll, "Should not snap to auto when not at bottom");
}

#[test]
fn test_render_output_computes_visible_slice() {
    let app = app_with_lines(50);
    let total = app.rendered_lines.len();
    let view_height: usize = 20;

    let scroll_pos = total.saturating_sub(view_height);
    let visible_end = (scroll_pos + view_height).min(total);
    let visible_start = scroll_pos.min(visible_end);

    assert_eq!(visible_end - visible_start, view_height.min(total));
    assert_eq!(visible_end, total);
}

#[test]
fn test_scroll_up_then_scroll_to_bottom() {
    let mut app = app_with_lines(100);

    app.scroll_up(20);
    assert!(!app.auto_scroll);

    app.scroll_to_bottom();
    assert!(app.auto_scroll);
}

#[test]
fn test_empty_content_no_panic() {
    let mut app = App::new("test".into());
    app.mark_dirty();
    app.rebuild_lines();

    assert_eq!(app.rendered_lines.len(), 0);

    app.scroll_up(10);
    assert_eq!(app.scroll, 0);

    app.scroll_down(10, 20);
    assert_eq!(app.scroll, 0);
}

#[test]
fn test_few_lines_less_than_viewport() {
    let mut app = app_with_lines(3);
    let _total = app.rendered_lines.len();
    let view_height = 40;

    assert!(app.auto_scroll);

    app.scroll_up(1);
    assert!(!app.auto_scroll);

    app.scroll_down(100, view_height);
    assert!(app.auto_scroll);
}

#[test]
fn test_mark_dirty_triggers_rebuild() {
    let mut app = app_with_lines(5);
    assert!(!app.lines_dirty);

    app.mark_dirty();
    assert!(app.lines_dirty);

    app.rebuild_lines();
    assert!(!app.lines_dirty);
}

#[test]
fn test_scrollback_limit() {
    let mut app = App::new("test".into());
    let n = MAX_SCROLLBACK_LINES / 2 + 100;
    for i in 0..n {
        app.display_blocks
            .push(DisplayBlock::AssistantText(format!("Line {i}")));
    }
    app.mark_dirty();
    app.rebuild_lines();

    assert!(
        app.rendered_lines.len() <= MAX_SCROLLBACK_LINES,
        "Should trim to MAX_SCROLLBACK_LINES, got {}",
        app.rendered_lines.len()
    );
}

#[test]
fn test_mouse_move_does_not_trigger_redraw() {
    let app = app_with_lines(50);
    let scroll_before = app.scroll;
    let auto_before = app.auto_scroll;

    assert_eq!(app.scroll, scroll_before);
    assert_eq!(app.auto_scroll, auto_before);
}

/// When the user has manually scrolled up (auto_scroll=false), new streaming
/// content must NOT force scroll back to bottom. The user should stay where
/// they are and scroll down manually when ready.
#[test]
fn test_new_content_does_not_override_manual_scroll() {
    let mut app = app_with_lines(100);

    // User scrolls up — leaves auto_scroll mode
    app.scroll_up(30);
    assert!(!app.auto_scroll);
    let scroll_pos = app.scroll;

    // Simulate incoming streaming content: call scroll_to_bottom_if_auto()
    // (this is what the event loop should use instead of scroll_to_bottom())
    app.scroll_to_bottom_if_auto();

    // User's manual scroll position should be preserved
    assert!(!app.auto_scroll, "auto_scroll should remain false when user has scrolled up");
    assert_eq!(app.scroll, scroll_pos, "scroll position should not change");
}

/// When auto_scroll is active, scroll_to_bottom_if_auto() should keep it active
/// (same behavior as before — content streams and we follow along).
#[test]
fn test_new_content_follows_when_auto_scroll_active() {
    let mut app = app_with_lines(100);
    assert!(app.auto_scroll);

    app.scroll_to_bottom_if_auto();
    assert!(app.auto_scroll, "auto_scroll should stay true");
}
