//! Tests for issue #26 — the text input must grow with its content but
//! never take more than 50% of the frame height. When the content
//! exceeds the cap, the input becomes internally scrollable while the
//! output area keeps at least the other half of the screen.
//!
//! These tests target a new `App::input_visual_line_count_for_frame`
//! that takes the available frame height into account, instead of the
//! old static `input_max_visual_lines = 10` cap.

use super::*;

/// Tall frame (40 rows) → cap = 20 visual lines (40/2). 5 short logical
/// lines fit easily and should NOT be capped.
#[test]
fn test_input_lines_not_capped_when_far_below_half_frame() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("a\nb\nc\nd\ne");
    let lines = app.input_visual_line_count_for_frame(80, 40);
    assert_eq!(lines, 5, "5 logical lines must render as 5 visual lines (cap=20)");
}

/// Tall frame, but a 30-line input must be capped to 20 (= 40/2).
#[test]
fn test_input_lines_capped_at_half_frame_height() {
    let mut app = App::new("test".into());
    let many = (0..30).map(|i| i.to_string()).collect::<Vec<_>>().join("\n");
    app.input = chlodwig_core::InputState::with_text(many);
    let lines = app.input_visual_line_count_for_frame(80, 40);
    assert_eq!(lines, 20, "30 lines must be capped at frame_height/2 = 20");
}

/// Cap scales with frame height: a 10-row frame caps at 5.
#[test]
fn test_input_cap_scales_with_smaller_frame() {
    let mut app = App::new("test".into());
    let many = (0..30).map(|i| i.to_string()).collect::<Vec<_>>().join("\n");
    app.input = chlodwig_core::InputState::with_text(many);
    let lines = app.input_visual_line_count_for_frame(80, 10);
    assert_eq!(lines, 5, "frame_height=10 → cap = 5");
}

/// The function must always return at least 1 line, even on tiny frames.
#[test]
fn test_input_min_one_line_even_on_tiny_frame() {
    let app = App::new("test".into());
    let lines = app.input_visual_line_count_for_frame(80, 0);
    assert_eq!(lines, 1);
    let lines = app.input_visual_line_count_for_frame(80, 1);
    assert_eq!(lines, 1);
    let lines = app.input_visual_line_count_for_frame(80, 2);
    assert_eq!(lines, 1, "frame_height=2 → cap = 1 (half)");
}

/// Empty input on a tall frame still renders as exactly 1 visual line.
#[test]
fn test_empty_input_on_tall_frame_is_one_line() {
    let app = App::new("test".into());
    let lines = app.input_visual_line_count_for_frame(80, 100);
    assert_eq!(lines, 1);
}

/// Soft-wrapping at narrow width interacts with the cap: 5-char text on
/// a width-3 viewport wraps to multiple lines but is capped by the
/// frame-height/2 rule, not the static 10.
#[test]
fn test_input_soft_wrap_capped_by_frame_height() {
    let mut app = App::new("test".into());
    let long = "a".repeat(60);
    app.input = chlodwig_core::InputState::with_text(long);
    // width=3 → naive wrap = 20 lines, frame=8 → cap=4
    let lines = app.input_visual_line_count_for_frame(3, 8);
    assert_eq!(lines, 4, "soft-wrap must respect the half-frame cap");
}

/// The renderer (render::ui) must call the frame-aware variant, not the
/// old static-cap variant. Source-level guard so we catch a regression
/// where someone reverts to `input_visual_line_count(width)` ignoring
/// the frame height.
#[test]
fn test_render_uses_frame_aware_input_line_count() {
    let src = include_str!("../render.rs");
    assert!(
        src.contains("input_visual_line_count_for_frame"),
        "render.rs must call input_visual_line_count_for_frame so the \
         input is capped at half the frame height (issue #26)"
    );
}
