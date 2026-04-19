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
//!    `GdkTexture` in a **per-view overlay registry** stored as a field on
//!    the `EmojiTextView` subclass.
//! 3. In `snapshot()`, after the parent `TextView` renders all text, we draw
//!    each emoji texture on top of its placeholder using
//!    `buffer_to_window_coords()` + `iter_location()` for pixel-perfect
//!    positioning. The texture is **aspect-fit** into the slot (preserving
//!    its natural aspect ratio) and centered.
//!
//! ## Per-instance registry (Gotcha #44 — crash 2026-04-19)
//!
//! Earlier versions used a `thread_local! static EMOJI_ENTRIES`. With two
//! views (`final_view` + `streaming_view`), each `snapshot()` iterated
//! entries from the OTHER view's buffer and called `iter_at_mark()` with a
//! foreign mark → garbage line pointer → SIGSEGV in
//! `_gtk_text_line_get_number`. The fix: every `EmojiTextView` instance owns
//! its own `RefCell<Vec<EmojiEntry>>`, and the public API is methods on the
//! subclass — no free functions, no global state, no cross-buffer mark
//! dereference possible.

use gtk4::gdk;
use gtk4::glib;
use gtk4::prelude::*;
use gtk4::subclass::prelude::*;

use std::cell::RefCell;

/// An emoji overlay entry: where to draw and what to draw.
pub struct EmojiEntry {
    /// Marks the start of the placeholder spaces in the buffer.
    mark: gtk4::TextMark,
    /// The pre-rendered emoji texture (rendered at `scale`× resolution for HiDPI).
    texture: gdk::Texture,
    /// The integer scale factor at which the texture was rendered (1 or 2).
    /// On Retina/HiDPI displays this is 2: the texture has 2× the pixels
    /// of the logical slot.
    #[allow(dead_code)]
    scale: i32,
    /// Number of placeholder space characters inserted for this emoji.
    /// Monospace: 2 (standard double-width). Proportional: more.
    placeholder_len: i32,
}

// ── Subclassed TextView ────────────────────────────────────────────

mod imp {
    use super::*;

    #[derive(Default)]
    pub struct EmojiTextView {
        /// Per-instance overlay registry. Each view owns its own list of
        /// entries — no cross-view sharing, no cross-buffer marks.
        pub entries: RefCell<Vec<EmojiEntry>>,
    }

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

            let entries = self.entries.borrow();
            for entry in entries.iter() {
                // Defensive: skip if mark was deleted.
                let mark_buf = entry.mark.buffer();
                if mark_buf.is_none() {
                    continue;
                }
                // Defensive: skip if mark belongs to a different buffer
                // than the one this view is currently rendering. With a
                // per-instance registry this should never happen, but keep
                // the guard so a future regression can't crash.
                if mark_buf.as_ref() != Some(&buffer) {
                    continue;
                }

                let iter = buffer.iter_at_mark(&entry.mark);
                let location = widget.iter_location(&iter);
                let (wx, wy) = widget.buffer_to_window_coords(
                    gtk4::TextWindowType::Widget,
                    location.x(),
                    location.y(),
                );

                let mut end_iter = iter;
                end_iter.forward_chars(entry.placeholder_len);
                let end_location = widget.iter_location(&end_iter);
                let slot_width = (end_location.x() - location.x()) as f32;
                let slot_height = location.height() as f32;

                if slot_width <= 0.0 || slot_height <= 0.0 {
                    continue;
                }

                let widget_height = widget.height() as f32;
                let wy_f = wy as f32;
                if wy_f + slot_height < 0.0 || wy_f > widget_height {
                    continue;
                }

                // ── HiDPI-aware aspect-fit rendering ────────────────
                let inv_sf = 1.0 / sf;
                let dev_slot_w = slot_width * sf;
                let dev_slot_h = slot_height * sf;
                let tex_w = entry.texture.width() as f32;
                let tex_h = entry.texture.height() as f32;

                let (dx, dy, dw, dh) =
                    aspect_fit_in_slot(dev_slot_w, dev_slot_h, tex_w, tex_h);

                snapshot.save();
                snapshot.translate(&gtk4::graphene::Point::new(wx as f32, wy_f));
                snapshot.scale(inv_sf, inv_sf);
                snapshot.append_scaled_texture(
                    &entry.texture,
                    gtk4::gsk::ScalingFilter::Trilinear,
                    &gtk4::graphene::Rect::new(dx, dy, dw, dh),
                );
                snapshot.restore();
            }
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

    /// Insert an emoji overlay at the end of this view's buffer.
    ///
    /// Inserts `placeholder_len` space characters at the buffer end (with
    /// the given tags applied), then registers the texture in **this view's**
    /// overlay registry for `snapshot()` to draw.
    pub fn insert_emoji(
        &self,
        texture: gdk::Texture,
        scale: i32,
        placeholder_len: i32,
        tag_names: &[&str],
    ) {
        let buffer = self.buffer();
        let mut end = buffer.end_iter();
        let start_offset = end.offset();

        let spaces: String = std::iter::repeat(' ')
            .take(placeholder_len as usize)
            .collect();
        buffer.insert(&mut end, &spaces);

        if !tag_names.is_empty() {
            let start_iter = buffer.iter_at_offset(start_offset);
            let end_iter = buffer.iter_at_offset(start_offset + placeholder_len);
            for tag_name in tag_names {
                buffer.apply_tag_by_name(tag_name, &start_iter, &end_iter);
            }
        }

        let mark_iter = buffer.iter_at_offset(start_offset);
        let mark = buffer.create_mark(None, &mark_iter, true);

        self.imp().entries.borrow_mut().push(EmojiEntry {
            mark,
            texture,
            scale,
            placeholder_len,
        });
    }

    /// Clear all emoji overlay entries from this view and delete their marks.
    ///
    /// Call when the view's buffer content is being replaced (e.g. `/clear`).
    pub fn clear_overlays(&self) {
        let buffer = self.buffer();
        for entry in self.imp().entries.borrow_mut().drain(..) {
            if entry.mark.buffer().is_some() {
                buffer.delete_mark(&entry.mark);
            }
        }
    }

    /// Remove emoji overlays whose mark falls at or after `from_offset`.
    ///
    /// Used before streaming re-render: the streaming range is deleted and
    /// re-inserted, so all overlays in that range must be removed first.
    pub fn clear_overlays_from(&self, from_offset: i32) {
        let buffer = self.buffer();
        let mut entries = self.imp().entries.borrow_mut();
        let mut i = 0;
        while i < entries.len() {
            let mark_buf = entries[i].mark.buffer();
            if mark_buf.is_none() {
                entries.swap_remove(i);
                continue;
            }
            let iter = buffer.iter_at_mark(&entries[i].mark);
            if iter.offset() >= from_offset {
                let entry = entries.swap_remove(i);
                buffer.delete_mark(&entry.mark);
            } else {
                i += 1;
            }
        }
    }

    /// Number of registered emoji overlays in this view (for diagnostics).
    pub fn overlay_count(&self) -> usize {
        self.imp().entries.borrow().len()
    }
}

impl Default for EmojiTextView {
    fn default() -> Self {
        glib::Object::builder().build()
    }
}

/// Compute the aspect-fit draw rectangle for an emoji texture within a slot.
///
/// The slot is the space occupied by the placeholder characters.
/// In **monospace** fonts, the slot width ≈ line height (roughly square).
/// In **proportional** fonts, 3 spaces ≈ slot height.
///
/// Preserves the texture's aspect ratio: scale uniformly to fit, center
/// horizontally and vertically.
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
        let draw_w = slot_w;
        let draw_h = slot_w / tex_aspect;
        (draw_w, draw_h)
    } else {
        let draw_h = slot_h;
        let draw_w = slot_h * tex_aspect;
        (draw_w, draw_h)
    };

    let x_off = (slot_w - draw_w) / 2.0;
    let y_off = (slot_h - draw_h) / 2.0;

    (x_off, y_off, draw_w, draw_h)
}
