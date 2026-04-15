//! Viewport width estimation for Markdown table rendering.
//!
//! GTK TextViews use proportional fonts for normal text but Markdown
//! tables are rendered with monospace spans. To correctly size table
//! columns, we need to know how many monospace characters fit in the
//! visible width of the output view.
//!
//! The pure function `estimate_monospace_columns()` converts pixel
//! measurements to a column count, making it testable without a GTK
//! runtime.

/// Minimum column count returned even for very narrow viewports.
/// Prevents tables from collapsing to unusable widths.
const MIN_COLUMNS: usize = 20;

/// Estimate how many monospace characters fit in the given pixel width,
/// after subtracting left and right margins.
///
/// Returns at least `MIN_COLUMNS` (20) to prevent degenerate table layouts.
///
/// # Arguments
/// * `pixel_width` — total widget width in pixels (e.g. from `allocation().width()`)
/// * `left_margin` — left margin/padding in pixels
/// * `right_margin` — right margin/padding in pixels
/// * `char_width_px` — width of a single monospace character in pixels
pub fn estimate_monospace_columns(
    pixel_width: i32,
    left_margin: i32,
    right_margin: i32,
    char_width_px: f64,
) -> usize {
    if char_width_px <= 0.0 {
        return MIN_COLUMNS;
    }
    let usable = pixel_width.saturating_sub(left_margin).saturating_sub(right_margin);
    if usable <= 0 {
        return MIN_COLUMNS;
    }
    let cols = (usable as f64 / char_width_px).floor() as usize;
    cols.max(MIN_COLUMNS)
}

// ── GTK-dependent: get viewport columns from a live widget ─────────

#[cfg(feature = "gtk-ui")]
mod gtk_impl {
    use super::*;

    /// Get the current viewport width in monospace columns from a GTK TextView.
    ///
    /// Uses the widget's allocated width and margins, and measures the
    /// monospace character width via PangoLayout with "M" in the monospace
    /// font family.
    ///
    /// Returns `MIN_COLUMNS` if the widget hasn't been allocated yet
    /// (width = 0 before first layout pass).
    pub fn viewport_columns(view: &gtk4::TextView) -> usize {
        use gtk4::prelude::*;

        let alloc_width = view.allocation().width();
        let left = view.left_margin();
        let right = view.right_margin();

        // Measure monospace char width via PangoLayout
        let char_w = monospace_char_width(view);

        estimate_monospace_columns(alloc_width, left, right, char_w)
    }

    /// Measure the pixel width of a single monospace character ("M")
    /// using the view's PangoContext with the monospace font family.
    fn monospace_char_width(view: &gtk4::TextView) -> f64 {
        use gtk4::prelude::*;
        use gtk4::pango;

        let context = view.pango_context();

        // Create a font description for monospace
        let mut font_desc = context.font_description().unwrap_or_else(pango::FontDescription::new);
        font_desc.set_family("monospace");

        let layout = pango::Layout::new(&context);
        layout.set_font_description(Some(&font_desc));
        layout.set_text("M");

        let (width_pango, _height) = layout.pixel_size();
        if width_pango > 0 {
            width_pango as f64
        } else {
            // Fallback: typical monospace char width
            8.0
        }
    }
}

#[cfg(feature = "gtk-ui")]
pub use gtk_impl::viewport_columns;
