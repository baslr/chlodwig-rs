//! Tests for `chlodwig_gtk::emoji_overlay::aspect_fit_in_slot`.
//!
//! Extracted from inline `#[cfg(test)] mod tests` in `emoji_overlay.rs`.

use crate::emoji_overlay::aspect_fit_in_slot;

#[test]
fn test_aspect_fit_square_emoji_in_wide_slot() {
    // Monospace: slot ~14×17, emoji 80×80 (square)
    // Should scale to 14×14, centered vertically with 1.5px offset
    let (x, y, w, h) = aspect_fit_in_slot(14.0, 17.0, 80.0, 80.0);
    assert!((w - 14.0).abs() < 0.01, "w={w}");
    assert!((h - 14.0).abs() < 0.01, "h={h}");
    assert!((x - 0.0).abs() < 0.01, "x={x}");
    assert!((y - 1.5).abs() < 0.01, "y={y}");
}

#[test]
fn test_aspect_fit_square_emoji_in_narrow_slot() {
    // Proportional font: slot ~7×17, emoji 80×80 (square)
    // Should scale to 7×7, centered vertically with 5px offset
    let (x, y, w, h) = aspect_fit_in_slot(7.0, 17.0, 80.0, 80.0);
    assert!((w - 7.0).abs() < 0.01, "w={w}");
    assert!((h - 7.0).abs() < 0.01, "h={h}");
    assert!((x - 0.0).abs() < 0.01, "x={x}");
    assert!((y - 5.0).abs() < 0.01, "y={y}");
}

#[test]
fn test_aspect_fit_square_emoji_in_square_slot() {
    // Perfect square slot
    let (x, y, w, h) = aspect_fit_in_slot(20.0, 20.0, 80.0, 80.0);
    assert!((w - 20.0).abs() < 0.01, "w={w}");
    assert!((h - 20.0).abs() < 0.01, "h={h}");
    assert!((x - 0.0).abs() < 0.01, "x={x}");
    assert!((y - 0.0).abs() < 0.01, "y={y}");
}

#[test]
fn test_aspect_fit_wide_texture_in_tall_slot() {
    // Wide texture (e.g. flag emoji 2:1) in tall slot
    let (x, y, w, h) = aspect_fit_in_slot(14.0, 17.0, 100.0, 50.0);
    // Limited by width: draw_w=14, draw_h=7
    assert!((w - 14.0).abs() < 0.01, "w={w}");
    assert!((h - 7.0).abs() < 0.01, "h={h}");
    assert!((x - 0.0).abs() < 0.01, "x={x}");
    assert!((y - 5.0).abs() < 0.01, "y={y}");
}

#[test]
fn test_aspect_fit_preserves_ratio() {
    // Generic test: output aspect ratio should match input aspect ratio
    let (_, _, w, h) = aspect_fit_in_slot(10.0, 20.0, 80.0, 60.0);
    let input_ratio = 80.0_f32 / 60.0;
    let output_ratio = w / h;
    assert!(
        (input_ratio - output_ratio).abs() < 0.01,
        "input ratio {input_ratio} != output ratio {output_ratio}"
    );
}

#[test]
fn test_aspect_fit_zero_dimensions() {
    let (x, y, w, h) = aspect_fit_in_slot(0.0, 17.0, 80.0, 80.0);
    assert!((x - 0.0).abs() < 0.01);
    assert!((y - 0.0).abs() < 0.01);
    assert!((w - 0.0).abs() < 0.01);
    assert!((h - 17.0).abs() < 0.01);
}

#[test]
fn test_aspect_fit_centering_symmetry() {
    // The offset should be symmetric: x_off = (slot_w - draw_w) / 2
    let (x, y, w, h) = aspect_fit_in_slot(20.0, 30.0, 50.0, 50.0);
    // Square emoji in 20×30 slot: draw 20×20, centered at y=5
    assert!((w - 20.0).abs() < 0.01, "w={w}");
    assert!((h - 20.0).abs() < 0.01, "h={h}");
    assert!((x - 0.0).abs() < 0.01, "x={x}");
    assert!((y - 5.0).abs() < 0.01, "y={y}");
}
