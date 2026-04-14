//! Emoji overlay rendering for GtkTextView.
//!
//! Instead of inserting emoji as `GdkPaintable` (which has intrinsic_width
//! quantization errors that accumulate and misalign table borders), we:
//!
//! 1. Insert **placeholder space characters** at the emoji position. Pango lays
//!    these out with sub-pixel precision — identical to any other character,
//!    zero cumulative error. Monospace: 2 spaces (≈ 1 em). Proportional: 3
//!    spaces (wider slot so the emoji isn't horizontally squished).
//! 2. Record the position (via `GtkTextMark`) and the pre-rendered emoji
//!    `GdkTexture` in a thread-local overlay registry.
//! 3. In `snapshot()`, after the parent `TextView` renders all text, we draw
//!    each emoji texture on top of its placeholder using
//!    `buffer_to_window_coords()` + `iter_location()` for pixel-perfect
//!    positioning. The texture is **aspect-fit** into the slot (preserving
//!    its natural aspect ratio) and centered.
//!
//! This completely decouples emoji rendering from Pango's text layout.
//! The spaces carry the width; the emoji bitmap is purely visual overlay.

use gtk4::gdk;
use gtk4::glib;
use gtk4::prelude::*;
use gtk4::subclass::prelude::*;

use std::cell::RefCell;

/// An emoji overlay entry: where to draw and what to draw.
struct EmojiEntry {
    /// Marks the start of the placeholder spaces in the buffer.
    mark: gtk4::TextMark,
    /// The pre-rendered emoji texture (rendered at `scale`× resolution for HiDPI).
    texture: gdk::Texture,
    /// The integer scale factor at which the texture was rendered (1 or 2).
    /// On Retina/HiDPI displays this is 2: the texture has 2× the pixels
    /// of the logical slot. Used in `snapshot()` to draw the texture in
    /// device-pixel space for crisp 1:1 pixel mapping.
    #[allow(dead_code)]  // read in snapshot() via thread-local
    scale: i32,
    /// Number of placeholder space characters inserted for this emoji.
    /// Monospace: 2 (standard double-width). Proportional: more (to make
    /// the slot wide enough for a roughly-square emoji).
    placeholder_len: i32,
}

// ── Thread-local overlay registry ──────────────────────────────────

thread_local! {
    /// All emoji overlay entries for the current output buffer.
    /// Shared between `insert_emoji()` (writes) and `EmojiTextView::snapshot()` (reads).
    static EMOJI_ENTRIES: RefCell<Vec<EmojiEntry>> = RefCell::new(Vec::new());
}

/// Register an emoji overlay at the current end of the buffer.
///
/// Inserts `placeholder_len` space characters as placeholder, then records
/// the position and texture for overlay rendering in `EmojiTextView::snapshot()`.
///
/// `placeholder_len`: number of space characters to insert (2 for monospace,
/// more for proportional fonts where 2 spaces are too narrow for a square emoji).
///
/// `scale` is the integer scale factor at which the texture was rendered
/// (1 = normal, 2 = Retina/HiDPI). Used in `snapshot()` to draw the
/// texture in device-pixel space for crisp rendering.
pub fn insert_emoji(
    buffer: &gtk4::TextBuffer,
    texture: gdk::Texture,
    scale: i32,
    placeholder_len: i32,
    tag_names: &[&str],
) {
    // Insert placeholder spaces.
    let mut end = buffer.end_iter();
    let start_offset = end.offset();

    let spaces: String = std::iter::repeat(' ').take(placeholder_len as usize).collect();
    buffer.insert(&mut end, &spaces);

    // Apply tags to the placeholder spaces.
    if !tag_names.is_empty() {
        let start_iter = buffer.iter_at_offset(start_offset);
        let end_iter = buffer.iter_at_offset(start_offset + placeholder_len);
        for tag_name in tag_names {
            buffer.apply_tag_by_name(tag_name, &start_iter, &end_iter);
        }
    }

    // Create a left-gravity mark at the start of the placeholder.
    let mark_iter = buffer.iter_at_offset(start_offset);
    let mark = buffer.create_mark(None, &mark_iter, true);

    EMOJI_ENTRIES.with(|entries| {
        entries.borrow_mut().push(EmojiEntry {
            mark,
            texture,
            scale,
            placeholder_len,
        });
    });
}

/// Clear all emoji overlay entries and delete their marks from the buffer.
///
/// Call this when the buffer content is being replaced (e.g. on `/clear`).
pub fn clear_overlays(buffer: &gtk4::TextBuffer) {
    EMOJI_ENTRIES.with(|entries| {
        for entry in entries.borrow_mut().drain(..) {
            if entry.mark.buffer().is_some() {
                buffer.delete_mark(&entry.mark);
            }
        }
    });
}

/// Remove emoji overlays whose mark falls at or after `from_offset` (char offset).
///
/// Used before streaming re-render: the streaming range is deleted and
/// re-inserted, so all overlays in that range must be removed first.
/// Overlays before `from_offset` (e.g. from previous completed turns)
/// are kept intact.
pub fn clear_overlays_from(buffer: &gtk4::TextBuffer, from_offset: i32) {
    EMOJI_ENTRIES.with(|entries| {
        let mut entries = entries.borrow_mut();
        // Partition: keep entries before from_offset, remove the rest.
        let mut i = 0;
        while i < entries.len() {
            let mark_buf = entries[i].mark.buffer();
            if mark_buf.is_none() {
                // Orphaned mark — remove.
                let entry = entries.swap_remove(i);
                // No need to delete_mark — it has no buffer.
                drop(entry);
                continue;
            }
            let iter = buffer.iter_at_mark(&entries[i].mark);
            if iter.offset() >= from_offset {
                let entry = entries.swap_remove(i);
                buffer.delete_mark(&entry.mark);
                // Don't increment i — swap_remove moved the last element here.
            } else {
                i += 1;
            }
        }
    });
}

/// Number of registered emoji overlays (for diagnostics).
pub fn overlay_count() -> usize {
    EMOJI_ENTRIES.with(|entries| entries.borrow().len())
}

// ── Subclassed TextView ────────────────────────────────────────────

mod imp {
    use super::*;

    #[derive(Default)]
    pub struct EmojiTextView {}

    #[glib::object_subclass]
    impl ObjectSubclass for EmojiTextView {
        const NAME: &'static str = "ChlodwigEmojiTextView";
        type Type = super::EmojiTextView;
        type ParentType = gtk4::TextView;
    }

    impl ObjectImpl for EmojiTextView {}

    impl WidgetImpl for EmojiTextView {
        fn snapshot(&self, snapshot: &gtk4::Snapshot) {
            // 1. Let the parent TextView render all text (including our spaces).
            self.parent_snapshot(snapshot);

            // 2. Draw emoji textures on top of the placeholder spaces.
            let widget = self.obj();
            let buffer = widget.buffer();
            // Widget scale factor: 2 on Retina/HiDPI, 1 on standard displays.
            let sf = widget.scale_factor() as f32;

            EMOJI_ENTRIES.with(|entries| {
                let entries = entries.borrow();
                for entry in entries.iter() {
                    // Check if the mark is still in a buffer.
                    if entry.mark.buffer().is_none() {
                        continue;
                    }

                    let iter = buffer.iter_at_mark(&entry.mark);

                    // Pixel rectangle of the character at this position
                    // (buffer coordinates, relative to text content).
                    let location = widget.iter_location(&iter);

                    // Convert buffer coords → widget coords (accounts for scroll).
                    let (wx, wy) = widget.buffer_to_window_coords(
                        gtk4::TextWindowType::Widget,
                        location.x(),
                        location.y(),
                    );

                    // Get the full slot width (placeholder spaces).
                    let mut end_iter = iter;
                    end_iter.forward_chars(entry.placeholder_len);
                    let end_location = widget.iter_location(&end_iter);
                    let slot_width = (end_location.x() - location.x()) as f32;
                    let slot_height = location.height() as f32;

                    if slot_width <= 0.0 || slot_height <= 0.0 {
                        continue;
                    }

                    // Skip if completely outside the visible area.
                    let widget_height = widget.height() as f32;
                    let wy_f = wy as f32;
                    if wy_f + slot_height < 0.0 || wy_f > widget_height {
                        continue;
                    }

                    // ── HiDPI-aware aspect-fit rendering ────────────────
                    //
                    // The emoji texture is roughly square (80×80 px at 40pt).
                    // In monospace fonts, 2 spaces ≈ line height → slot is
                    // roughly square → texture fits naturally.
                    //
                    // In proportional fonts, 2 spaces can be much narrower
                    // than the line height (e.g. 7×17 logical pixels). Naively
                    // stretching the square texture to fill this narrow slot
                    // squishes the emoji horizontally.
                    //
                    // Fix: Use aspect_fit_in_slot() to preserve the emoji's
                    // aspect ratio. The emoji is scaled uniformly to fit
                    // within the slot, centered vertically (and horizontally).
                    //
                    // All calculations happen in device-pixel space (after
                    // scaling by 1/sf) for crisp HiDPI rendering.
                    let inv_sf = 1.0 / sf;

                    // Compute aspect-fit in device-pixel space.
                    let dev_slot_w = slot_width * sf;
                    let dev_slot_h = slot_height * sf;
                    let tex_w = entry.texture.width() as f32;
                    let tex_h = entry.texture.height() as f32;

                    let (dx, dy, dw, dh) = aspect_fit_in_slot(
                        dev_slot_w, dev_slot_h, tex_w, tex_h,
                    );

                    snapshot.save();
                    snapshot.translate(&gtk4::graphene::Point::new(
                        wx as f32,
                        wy_f,
                    ));
                    // Switch to device-pixel coordinate space.
                    snapshot.scale(inv_sf, inv_sf);
                    // Draw texture with aspect-fit centering.
                    snapshot.append_scaled_texture(
                        &entry.texture,
                        gtk4::gsk::ScalingFilter::Trilinear,
                        &gtk4::graphene::Rect::new(dx, dy, dw, dh),
                    );
                    snapshot.restore();
                }
            });
        }
    }

    impl TextViewImpl for EmojiTextView {}
}

glib::wrapper! {
    pub struct EmojiTextView(ObjectSubclass<imp::EmojiTextView>)
        @extends gtk4::TextView, gtk4::Widget,
        @implements gtk4::Accessible, gtk4::Buildable, gtk4::ConstraintTarget, gtk4::Scrollable;
}

impl EmojiTextView {
    /// Create a new EmojiTextView with the given buffer.
    pub fn with_buffer(buffer: &gtk4::TextBuffer) -> Self {
        glib::Object::builder()
            .property("buffer", buffer)
            .build()
    }
}

impl Default for EmojiTextView {
    fn default() -> Self {
        glib::Object::builder().build()
    }
}

/// Compute the aspect-fit draw rectangle for an emoji texture within a slot.
///
/// The slot is the space occupied by the 2-space placeholder characters.
/// In **monospace** fonts, the slot width ≈ line height (roughly square).
/// In **proportional** fonts, 2 spaces can be much narrower → naively
/// stretching the (square) emoji texture to fill the slot squishes it
/// horizontally.
///
/// This function preserves the emoji's aspect ratio:
/// - Scale uniformly to fit within the slot (aspect-fit: limited by the
///   smaller dimension).
/// - Center horizontally and vertically in the slot.
///
/// All values are in the same coordinate space (logical or device — the
/// caller applies the appropriate transform).
///
/// Returns `(x_offset, y_offset, draw_width, draw_height)`.
pub fn aspect_fit_in_slot(
    slot_w: f32,
    slot_h: f32,
    tex_w: f32,
    tex_h: f32,
) -> (f32, f32, f32, f32) {
    if tex_w <= 0.0 || tex_h <= 0.0 || slot_w <= 0.0 || slot_h <= 0.0 {
        return (0.0, 0.0, slot_w, slot_h);
    }

    let tex_aspect = tex_w / tex_h;
    let slot_aspect = slot_w / slot_h;

    let (draw_w, draw_h) = if tex_aspect > slot_aspect {
        // Texture is wider relative to the slot → limited by width.
        let draw_w = slot_w;
        let draw_h = slot_w / tex_aspect;
        (draw_w, draw_h)
    } else {
        // Texture is taller relative to the slot → limited by height.
        let draw_h = slot_h;
        let draw_w = slot_h * tex_aspect;
        (draw_w, draw_h)
    };

    let x_off = (slot_w - draw_w) / 2.0;
    let y_off = (slot_h - draw_h) / 2.0;

    (x_off, y_off, draw_w, draw_h)
}

#[cfg(test)]
mod tests {
    use super::*;

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
}
