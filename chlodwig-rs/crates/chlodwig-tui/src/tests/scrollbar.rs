use super::*;

#[test]
fn test_scrollbar_position_at_top() {
    let app = app_with_lines(100);
    let total = app.rendered_lines.len();
    let view_height = 20;
    let (position, content_length, viewport_length) =
        compute_scrollbar_state(0, total, view_height);
    assert_eq!(position, 0);
    assert_eq!(content_length, total);
    assert_eq!(viewport_length, view_height);
}

#[test]
fn test_scrollbar_position_at_bottom() {
    let app = app_with_lines(100);
    let total = app.rendered_lines.len();
    let view_height = 20;
    let scroll_pos = total.saturating_sub(view_height);
    let (position, content_length, viewport_length) =
        compute_scrollbar_state(scroll_pos, total, view_height);
    assert_eq!(position, scroll_pos);
    assert_eq!(content_length, total);
    assert_eq!(viewport_length, view_height);
}

#[test]
fn test_scrollbar_position_middle() {
    let app = app_with_lines(100);
    let total = app.rendered_lines.len();
    let view_height = 20;
    let scroll_pos = total / 2;
    let (position, content_length, viewport_length) =
        compute_scrollbar_state(scroll_pos, total, view_height);
    assert_eq!(position, scroll_pos);
    assert_eq!(content_length, total);
    assert_eq!(viewport_length, view_height);
}

#[test]
fn test_scrollbar_not_needed_when_content_fits() {
    let app = app_with_lines(3);
    let total = app.rendered_lines.len();
    let view_height = 40;
    let (position, content_length, viewport_length) =
        compute_scrollbar_state(0, total, view_height);
    assert_eq!(position, 0);
    assert_eq!(content_length, total);
    assert!(
        viewport_length >= content_length,
        "viewport covers all content — scrollbar thumb should fill track"
    );
}
