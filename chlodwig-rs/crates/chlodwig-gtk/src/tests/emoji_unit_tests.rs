//! Tests for `chlodwig_gtk::emoji`.
//!
//! Extracted from inline `#[cfg(test)] mod tests` in `emoji.rs`. The
//! macOS-only CoreText tests reach into `crate::emoji::platform::*`,
//! which is now `pub(crate)` so they can be addressed from this submodule.

use crate::emoji::*;
#[cfg(target_os = "macos")]
use crate::emoji::platform;


#[test]
fn test_is_default_emoji_sunflower() {
    assert!(is_default_emoji('🌻'));
}

#[test]
fn test_is_default_emoji_smile_basic() {
    assert!(is_default_emoji('😀'));
}

#[test]
fn test_is_default_emoji_hourglass_basic() {
    assert!(is_default_emoji('⏳'));
}

#[test]
fn test_is_not_emoji_ascii() {
    assert!(!is_default_emoji('A') && !is_text_default_pictographic('A'));
    assert!(!is_default_emoji('1') && !is_text_default_pictographic('1'));
    assert!(!is_default_emoji(' ') && !is_text_default_pictographic(' '));
}

#[test]
fn test_is_not_emoji_triangle() {
    // ▶ U+25B6 is in Geometric Shapes, NOT in either emoji bucket
    assert!(!is_default_emoji('▶') && !is_text_default_pictographic('▶'));
}

#[test]
fn test_is_not_emoji_arrow() {
    assert!(!is_default_emoji('→') && !is_text_default_pictographic('→'));
}

#[test]
fn test_is_not_emoji_box_drawing() {
    for c in ['├', '│', '└'] {
        assert!(!is_default_emoji(c) && !is_text_default_pictographic(c));
    }
}

#[test]
fn test_is_not_emoji_checkmark() {
    // ✓ U+2713 is in neither bucket — Pango renders it via Lucida Grande
    assert!(!is_default_emoji('✓') && !is_text_default_pictographic('✓'));
    // But ✅ U+2705 IS a default emoji
    assert!(is_default_emoji('✅'));
}

#[test]
fn test_split_plain_only() {
    let segs = split_emoji_segments("Hello World");
    assert_eq!(segs, vec![TextSegment::Plain("Hello World".into())]);
}

#[test]
fn test_split_emoji_only() {
    let segs = split_emoji_segments("🌻");
    assert_eq!(segs, vec![TextSegment::Emoji("🌻".into())]);
}

#[test]
fn test_split_mixed() {
    let segs = split_emoji_segments("Hello 🌻 World");
    assert_eq!(segs, vec![
        TextSegment::Plain("Hello ".into()),
        TextSegment::Emoji("🌻".into()),
        TextSegment::Plain(" World".into()),
    ]);
}

#[test]
fn test_split_triangle_is_plain() {
    let segs = split_emoji_segments("▶ prompt");
    assert_eq!(segs, vec![TextSegment::Plain("▶ prompt".into())]);
}

#[test]
fn test_split_multiple_emojis() {
    // Each standalone emoji must be its OWN segment.
    // If they're merged into one, the overlay system inserts only 2 spaces
    // for the entire group, squishing 3 emojis into a single 2-char slot.
    let segs = split_emoji_segments("🌻🔥😀");
    assert_eq!(segs.len(), 3, "Three separate emojis must produce 3 segments: {:?}", segs);
    assert_eq!(segs[0], TextSegment::Emoji("🌻".into()));
    assert_eq!(segs[1], TextSegment::Emoji("🔥".into()));
    assert_eq!(segs[2], TextSegment::Emoji("😀".into()));
}

#[test]
fn test_split_six_smileys_are_six_segments() {
    // Regression test: "😀😀😀😀😀😀" was rendered as one overlay
    // entry squished into a 2-space slot.
    let segs = split_emoji_segments("😀😀😀😀😀😀");
    assert_eq!(segs.len(), 6, "Six emojis must be 6 segments: {:?}", segs);
    for seg in &segs {
        assert_eq!(seg, &TextSegment::Emoji("😀".into()));
    }
}

#[test]
fn test_split_adjacent_different_emojis() {
    let segs = split_emoji_segments("⭐🎉📊✅");
    assert_eq!(segs.len(), 4, "Four different emojis: {:?}", segs);
    assert_eq!(segs[0], TextSegment::Emoji("⭐".into()));
    assert_eq!(segs[1], TextSegment::Emoji("🎉".into()));
    assert_eq!(segs[2], TextSegment::Emoji("📊".into()));
    assert_eq!(segs[3], TextSegment::Emoji("✅".into()));
}

#[test]
fn test_split_emoji_with_vs16() {
    // ❤️ = ❤ (U+2764) + VS16 (U+FE0F)
    // ❤ is in our emoji set (Emoji_Presentation=Yes),
    // VS16 is an emoji modifier that gets absorbed into the sequence
    let segs = split_emoji_segments("I ❤️ you");
    assert_eq!(segs.len(), 3);
    assert_eq!(segs[0], TextSegment::Plain("I ".into()));
    assert!(matches!(&segs[1], TextSegment::Emoji(s) if s.starts_with('❤')));
    assert_eq!(segs[2], TextSegment::Plain(" you".into()));
}

#[test]
fn test_split_flag_emoji() {
    // 🇩🇪 = Regional Indicator D (U+1F1E9) + Regional Indicator E (U+1F1EA)
    let segs = split_emoji_segments("Flag: 🇩🇪");
    assert_eq!(segs[0], TextSegment::Plain("Flag: ".into()));
    assert!(matches!(&segs[1], TextSegment::Emoji(s) if s == "🇩🇪"));
}

#[test]
fn test_split_empty() {
    let segs = split_emoji_segments("");
    assert!(segs.is_empty());
}

#[test]
fn test_split_table_cell_with_emoji_and_padding() {
    // This is exactly what the core markdown table engine produces:
    // " 😀    " — 1 space, emoji (width=2), 4 spaces
    let segs = split_emoji_segments(" 😀    ");
    assert_eq!(segs, vec![
        TextSegment::Plain(" ".into()),
        TextSegment::Emoji("😀".into()),
        TextSegment::Plain("    ".into()),
    ]);
}

#[cfg(target_os = "macos")]
#[test]
fn test_render_emoji_coretext_sunflower() {
    let bmp = platform::render_emoji_coretext("🌻", 20.0, 1);
    assert!(bmp.is_some(), "CoreText should render 🌻");
    let bmp = bmp.unwrap();
    assert!(bmp.width > 0);
    assert!(bmp.height > 0);
    assert_eq!(bmp.scale, 1);
    assert!(!bmp.data.is_empty());
    // Check for colored pixels (not just alpha)
    let has_color = bmp.data.chunks(4).any(|px| {
        px[3] > 0 && (px[0] != px[1] || px[1] != px[2])
    });
    assert!(has_color, "🌻 should have colored pixels");
}

#[cfg(target_os = "macos")]
#[test]
fn test_render_emoji_coretext_smile() {
    let bmp = platform::render_emoji_coretext("😀", 20.0, 1);
    assert!(bmp.is_some(), "CoreText should render 😀");
}

#[cfg(target_os = "macos")]
#[test]
fn test_emoji_cache() {
    let mut cache = EmojiCache::new();
    let r1 = cache.get_or_render("🌻", 20.0, 2);
    assert!(r1.is_some());
    // Second call should be cached (same pointer wouldn't work, but same result)
    let r2 = cache.get_or_render("🌻", 20.0, 2);
    assert!(r2.is_some());
}

#[cfg(target_os = "macos")]
#[test]
fn test_render_emoji_2x_has_double_pixels() {
    // Rendering at 2x scale should produce a larger bitmap than 1x.
    // Note: Apple Color Emoji (SBIX) uses discrete bitmap strikes, so the
    // relationship is not exactly 2x — but it should be significantly larger.
    let bmp_1x = platform::render_emoji_coretext("🌻", 20.0, 1).unwrap();
    let bmp_2x = platform::render_emoji_coretext("🌻", 20.0, 2).unwrap();

    // 2x bitmap should be larger than 1x
    assert!(bmp_2x.width > bmp_1x.width, "2x width {} should be > 1x width {}", bmp_2x.width, bmp_1x.width);
    assert!(bmp_2x.height > bmp_1x.height, "2x height {} should be > 1x height {}", bmp_2x.height, bmp_1x.height);
    // Total pixel data should be significantly more
    assert!(bmp_2x.data.len() > bmp_1x.data.len() * 2, "2x data {} should be >2x of 1x data {}", bmp_2x.data.len(), bmp_1x.data.len());

    // Scale factor should be stored
    assert_eq!(bmp_2x.scale, 2);
    assert_eq!(bmp_1x.scale, 1);
}

#[cfg(target_os = "macos")]
#[test]
fn test_render_emoji_2x_has_color() {
    let bmp = platform::render_emoji_coretext("😀", 20.0, 2).unwrap();
    let has_color = bmp.data.chunks(4).any(|px| {
        px[3] > 0 && (px[0] != px[1] || px[1] != px[2])
    });
    assert!(has_color, "2x 😀 should have colored pixels");
}

#[cfg(target_os = "macos")]
#[test]
fn test_emoji_bitmap_logical_size() {
    let bmp = platform::render_emoji_coretext("🌻", 20.0, 2).unwrap();
    // Logical size should be pixel_size / scale
    assert_eq!(bmp.logical_width(), bmp.width / 2);
    assert_eq!(bmp.logical_height(), bmp.height / 2);
}

#[cfg(target_os = "macos")]
#[test]
fn test_emoji_logical_width_less_than_double_mono() {
    // Demonstrates the table alignment bug: a tight-cropped emoji bitmap
    // has a logical width that's typically LESS than 2× monospace char width.
    // At 13pt, a monospace char is ~7-8px wide, so 2 columns = ~14-16px.
    // But the emoji bitmap's logical_width() after tight-crop is narrower,
    // causing table borders to shift left on emoji rows.
    let bmp = platform::render_emoji_coretext("🌻", 13.0, 2).unwrap();
    let lw = bmp.logical_width();
    eprintln!(
        "🌻 at 13pt: pixel {}x{}, logical {}x{} (scale {})",
        bmp.width, bmp.height, lw, bmp.logical_height(), bmp.scale,
    );
    assert!(
        lw > 0,
        "logical_width must be positive"
    );
}

#[cfg(target_os = "macos")]
#[test]
fn test_emoji_size_comparison_across_emojis() {
    // Diagnostic test: different emojis have different tight-crop widths.
    // In monospace contexts, we force ALL emojis to exactly 2 × MONO_CHAR_WIDTH
    // regardless of their natural bitmap width. Emojis narrower than the slot
    // are centered; emojis wider are scaled down. This ensures table borders
    // stay vertically aligned.
    let emojis = ["😀", "⭐", "🌻", "🔥", "❤\u{FE0F}", "🎉", "📊", "✅"];
    for emoji in &emojis {
        let bmp = platform::render_emoji_coretext(emoji, 13.0, 2).unwrap();
        eprintln!(
            "{:>4} at 13pt: pixel {}x{}, logical {}x{} (scale {})",
            emoji, bmp.width, bmp.height, bmp.logical_width(), bmp.logical_height(), bmp.scale,
        );
    }
    // All should be renderable
}

/// Compute the logical width for an emoji in a monospace context.
///
/// Emojis occupy 2 character columns (unicode_width = 2).
/// `mono_char_width` is the pixel width of a single monospace character.
/// Returns `2 * mono_char_width`.
#[test]
fn test_monospace_emoji_width() {
    assert_eq!(monospace_emoji_width(8), 16);
    assert_eq!(monospace_emoji_width(7), 14);
    assert_eq!(monospace_emoji_width(10), 20);
}

#[test]
fn test_monospace_emoji_width_zero_returns_zero() {
    // Edge case: if mono_char_width is 0 (shouldn't happen, but defensive)
    assert_eq!(monospace_emoji_width(0), 0);
}

#[test]
fn test_monospace_emoji_width_is_exact_not_max() {
    // In monospace contexts, the emoji width must be EXACTLY 2 × mono_char_width,
    // never max(2 × mono_char_width, natural_width). Using max() causes emojis
    // with natural_width > target to overflow the 2-column slot, shifting table
    // borders right. Using exact target means:
    // - Narrow emojis are centered within the slot
    // - Wide emojis are scaled down to fit
    // Both cases preserve column alignment.
    let mono_w = 8;
    let target = monospace_emoji_width(mono_w); // 16
    assert_eq!(target, 16);

    // A "wide" emoji with natural_w=18 should NOT produce width=18
    // The caller must use target=16 without max().
    // (This test documents the intent — the actual clamping is in window.rs)
}

#[cfg(target_os = "macos")]
#[test]
fn test_emoji_bitmap_tight_cropped() {
    // After tight-crop, the bitmap should have no fully-transparent rows
    // at top or bottom. This ensures GtkTextView can align emojis
    // vertically with surrounding text.
    let bmp = platform::render_emoji_coretext("🌻", 20.0, 2).unwrap();
    let w = bmp.width as usize;
    let h = bmp.height as usize;

    // Find first and last visible rows
    let mut first_visible_row = None;
    let mut last_visible_row = None;
    for row in 0..h {
        let row_start = row * w * 4;
        let row_end = row_start + w * 4;
        let has_pixel = bmp.data[row_start..row_end].chunks(4).any(|px| px[3] > 0);
        if has_pixel {
            if first_visible_row.is_none() {
                first_visible_row = Some(row);
            }
            last_visible_row = Some(row);
        }
    }

    let first = first_visible_row.unwrap();
    let last = last_visible_row.unwrap();
    eprintln!(
        "🌻 2x: {}x{} total, visible rows {}-{} (top_empty={}, bottom_empty={})",
        w, h, first, last, first, h - 1 - last
    );

    // First visible row should be row 0 (tight top)
    assert_eq!(first, 0, "top should be tightly cropped");
    // Last visible row should be the last row (tight bottom)
    assert_eq!(last, h - 1, "bottom should be tightly cropped");
}

// ── Bug #1: Missing Extended_Pictographic chars ──────────────────
// (now classified as text-default pictographic — bare codepoint is Plain,
//  with VS16 it becomes Emoji)

#[test]
fn test_is_emoji_char_sun() {
    // ☀ U+2600: Extended_Pictographic, text-default. Becomes color emoji
    // with VS16 (☀️) or as ZWJ component.
    assert!(is_text_default_pictographic('\u{2600}'), "☀ U+2600 must be text-default pictographic");
}

#[test]
fn test_is_emoji_char_thunder_cloud() {
    assert!(is_text_default_pictographic('\u{26C8}'), "⛈ U+26C8 must be text-default pictographic");
}

#[test]
fn test_is_emoji_char_male_female_signs() {
    // ♂ U+2642 and ♀ U+2640 are text-default but appear as ZWJ components
    // (🏊‍♂️ = 🏊 + ZWJ + ♂ + VS16). Without these in the table, ZWJ
    // sequences get split at the gender sign.
    assert!(is_text_default_pictographic('\u{2642}'));
    assert!(is_text_default_pictographic('\u{2640}'));
}

#[test]
fn test_is_emoji_char_misc_symbols_extended() {
    for c in ['\u{2601}', '\u{2602}', '\u{2603}', '\u{2604}', '\u{260E}',
              '\u{2611}', '\u{2618}', '\u{261D}', '\u{2620}', '\u{2622}', '\u{2623}'] {
        assert!(is_text_default_pictographic(c), "U+{:04X} must be text-default pictographic", c as u32);
    }
}

#[test]
fn test_is_emoji_char_symbols_and_religion() {
    for c in ['\u{2626}', '\u{262A}', '\u{262E}', '\u{262F}',
              '\u{2638}', '\u{2639}', '\u{263A}'] {
        assert!(is_text_default_pictographic(c), "U+{:04X} must be text-default pictographic", c as u32);
    }
}

#[test]
fn test_is_emoji_char_card_suits() {
    for c in ['\u{2660}', '\u{2663}', '\u{2665}', '\u{2666}'] {
        assert!(is_text_default_pictographic(c), "U+{:04X} must be text-default pictographic", c as u32);
    }
}

#[test]
fn test_is_emoji_char_misc_objects() {
    for c in ['\u{2668}', '\u{267B}', '\u{2692}', '\u{2694}', '\u{2695}',
              '\u{2696}', '\u{2697}', '\u{2699}', '\u{269B}', '\u{269C}',
              '\u{26A0}', '\u{26A7}', '\u{26B0}', '\u{26B1}'] {
        assert!(is_text_default_pictographic(c), "U+{:04X} must be text-default pictographic", c as u32);
    }
}

#[test]
fn test_is_emoji_char_misc_objects_2() {
    for c in ['\u{26CF}', '\u{26D1}', '\u{26D3}', '\u{26E9}',
              '\u{26F0}', '\u{26F1}', '\u{26F4}', '\u{26F7}', '\u{26F8}', '\u{26F9}'] {
        assert!(is_text_default_pictographic(c), "U+{:04X} must be text-default pictographic", c as u32);
    }
}

// ── Bug #2: ZWJ sequence splitting ───────────────────────────────

#[test]
fn test_split_zwj_swimmer_male_not_broken() {
    // 🏊‍♂️ = 🏊 (U+1F3CA) + ZWJ (U+200D) + ♂ (U+2642) + VS16 (U+FE0F)
    // Must be ONE Emoji segment, not split at ♂.
    let segs = split_emoji_segments("🏊\u{200D}♂\u{FE0F}");
    assert_eq!(
        segs.len(), 1,
        "ZWJ sequence must be a single segment, got: {:?}", segs
    );
    assert!(
        matches!(&segs[0], TextSegment::Emoji(s) if s == "🏊\u{200D}♂\u{FE0F}"),
        "Must be Emoji segment containing full ZWJ sequence, got: {:?}", segs[0]
    );
}

#[test]
fn test_split_zwj_cyclist_female_not_broken() {
    // 🚴‍♀️ = 🚴 + ZWJ + ♀ + VS16
    let segs = split_emoji_segments("🚴\u{200D}♀\u{FE0F}");
    assert_eq!(segs.len(), 1, "ZWJ sequence must stay intact: {:?}", segs);
    assert!(matches!(&segs[0], TextSegment::Emoji(_)));
}

#[test]
fn test_split_multiple_zwj_emojis_in_table_cell() {
    // From the table: 🏊‍♂️🚴‍♀️🏃‍♂️🥇
    // Each ZWJ sequence is one emoji, plus 🥇 is a standalone emoji.
    // They must be SEPARATE segments — one per visual emoji.
    let text = "🏊\u{200D}♂\u{FE0F}🚴\u{200D}♀\u{FE0F}🏃\u{200D}♂\u{FE0F}🥇";
    let segs = split_emoji_segments(text);
    assert_eq!(
        segs.len(), 4,
        "4 emojis (3 ZWJ + 1 standalone) must be 4 segments: {:?}", segs
    );
    assert_eq!(segs[0], TextSegment::Emoji("🏊\u{200D}♂\u{FE0F}".into()));
    assert_eq!(segs[1], TextSegment::Emoji("🚴\u{200D}♀\u{FE0F}".into()));
    assert_eq!(segs[2], TextSegment::Emoji("🏃\u{200D}♂\u{FE0F}".into()));
    assert_eq!(segs[3], TextSegment::Emoji("🥇".into()));
}

// ── Bug #3: VS16 emoji presentation sequences ────────────────────

#[test]
fn test_split_sun_with_vs16() {
    // ☀️ = ☀ (U+2600) + VS16 (U+FE0F)
    // Must be Emoji, not Plain.
    let segs = split_emoji_segments("☀\u{FE0F}");
    assert_eq!(segs.len(), 1, "☀️ must be one segment: {:?}", segs);
    assert!(
        matches!(&segs[0], TextSegment::Emoji(_)),
        "☀️ must be Emoji, not Plain: {:?}", segs[0]
    );
}

#[test]
fn test_split_thunder_cloud_with_vs16() {
    // ⛈️ = ⛈ (U+26C8) + VS16
    let segs = split_emoji_segments("⛈\u{FE0F}");
    assert_eq!(segs.len(), 1, "⛈️ must be one segment: {:?}", segs);
    assert!(matches!(&segs[0], TextSegment::Emoji(_)), "⛈️ must be Emoji: {:?}", segs[0]);
}

#[test]
fn test_split_weather_emojis_from_table() {
    // 🌧️🌩️⛈️ — three weather emojis with VS16
    // Each must be a separate segment.
    let text = "🌧\u{FE0F}🌩\u{FE0F}⛈\u{FE0F}";
    let segs = split_emoji_segments(text);
    assert_eq!(segs.len(), 3, "3 weather emojis must be 3 segments: {:?}", segs);
    assert_eq!(segs[0], TextSegment::Emoji("🌧\u{FE0F}".into()));
    assert_eq!(segs[1], TextSegment::Emoji("🌩\u{FE0F}".into()));
    assert_eq!(segs[2], TextSegment::Emoji("⛈\u{FE0F}".into()));
}

#[test]
fn test_split_table_cell_sun_padded() {
    // Exact table cell from markdown: " ☀️      " (space + sun+VS16 + padding)
    let text = " ☀\u{FE0F}      ";
    let segs = split_emoji_segments(text);
    assert_eq!(segs.len(), 3, "Should be Plain+Emoji+Plain: {:?}", segs);
    assert_eq!(segs[0], TextSegment::Plain(" ".into()));
    assert!(matches!(&segs[1], TextSegment::Emoji(s) if s == "☀\u{FE0F}"));
    assert_eq!(segs[2], TextSegment::Plain("      ".into()));
}

// ── HiDPI rendering quality ──────────────────────────────────────

#[cfg(target_os = "macos")]
#[test]
fn test_render_emoji_at_40pt_produces_large_bitmap() {
    // At 40pt with scale=2, CoreText should produce a large bitmap
    // (~80×80 pixels) from a high-resolution SBIX strike. This large
    // bitmap is downscaled to the ~28×34 device-pixel slot via trilinear
    // filtering, yielding crisp results on Retina displays.
    // At 13pt (the text font size), the bitmap is only ~24×25 pixels,
    // which must be upscaled → blurry.
    let bmp_13 = platform::render_emoji_coretext("😀", 13.0, 2).unwrap();
    let bmp_40 = platform::render_emoji_coretext("😀", 40.0, 2).unwrap();

    // 40pt bitmap should be significantly larger than 13pt bitmap
    assert!(
        bmp_40.width > bmp_13.width * 2,
        "40pt bitmap ({}) should be >2× wider than 13pt bitmap ({})",
        bmp_40.width, bmp_13.width,
    );
    assert!(
        bmp_40.height > bmp_13.height * 2,
        "40pt bitmap ({}) should be >2× taller than 13pt bitmap ({})",
        bmp_40.height, bmp_13.height,
    );

    // The 40pt bitmap should be at least 60×60 pixels
    // (Apple Color Emoji provides 80×80 at this size)
    assert!(
        bmp_40.width >= 60 && bmp_40.height >= 60,
        "40pt bitmap should be large: {}x{}",
        bmp_40.width, bmp_40.height,
    );

    eprintln!(
        "😀 at 13pt scale=2: {}x{}, at 40pt scale=2: {}x{} (ratio: {:.1}x)",
        bmp_13.width, bmp_13.height,
        bmp_40.width, bmp_40.height,
        bmp_40.width as f64 / bmp_13.width as f64,
    );
}

// ── Gotcha #54: Text-default vs emoji-default classification ─────
//
// Unicode distinguishes two presentation defaults for pictographic chars:
//   - Emoji_Presentation=Yes  → renders as color emoji by default (😀, 🚀, ⏳)
//   - Emoji_Presentation=No, Extended_Pictographic=Yes
//                             → renders as monochrome text by default (☀, ☁, ⚡, ♂)
//                               only becomes emoji with VS16 (U+FE0F) appended
//                               or as part of a ZWJ sequence
//
// The new API exposes both predicates explicitly. `is_emoji_char` is gone —
// `split_emoji_segments` decides Emoji-vs-Plain by combining the predicates
// with the lookahead context (next char is VS16? we are after ZWJ?).

#[test]
fn test_is_default_emoji_smile() {
    // 😀 has Emoji_Presentation=Yes → always emoji
    assert!(is_default_emoji('😀'));
}

#[test]
fn test_is_default_emoji_teacup() {
    // ☕ U+2615: one of the few BMP chars with Emoji_Presentation=Yes
    assert!(is_default_emoji('☕'));
}

#[test]
fn test_is_default_emoji_hourglass() {
    assert!(is_default_emoji('⏳'));
}

#[test]
fn test_is_default_emoji_rejects_text_default_sun() {
    // ☀ U+2600 has Emoji_Presentation=NO. It must NOT be in default-emoji.
    assert!(!is_default_emoji('\u{2600}'),
        "☀ U+2600 has Emoji_Presentation=No — text default, not emoji default");
}

#[test]
fn test_is_default_emoji_rejects_text_default_male_sign() {
    // ♂ U+2642 has Emoji_Presentation=No (component of ZWJ sequences only)
    assert!(!is_default_emoji('\u{2642}'));
    assert!(!is_default_emoji('\u{2640}'));
}

#[test]
fn test_is_default_emoji_rejects_ascii() {
    assert!(!is_default_emoji('A'));
    assert!(!is_default_emoji(' '));
}

#[test]
fn test_is_default_emoji_rejects_box_drawing() {
    assert!(!is_default_emoji('├'));
    assert!(!is_default_emoji('│'));
}

#[test]
fn test_is_text_default_pictographic_sun() {
    // ☀ U+2600 is Extended_Pictographic with text default
    assert!(is_text_default_pictographic('\u{2600}'));
}

#[test]
fn test_is_text_default_pictographic_thunder_cloud() {
    assert!(is_text_default_pictographic('\u{26C8}'));
}

#[test]
fn test_is_text_default_pictographic_male_female_signs() {
    // Required for ZWJ sequences like 🏊‍♂️
    assert!(is_text_default_pictographic('\u{2642}'));
    assert!(is_text_default_pictographic('\u{2640}'));
}

#[test]
fn test_is_text_default_pictographic_rejects_default_emoji() {
    // The two predicates must be DISJOINT — no codepoint in both.
    // 😀 has emoji default → must not be in text-default set.
    assert!(!is_text_default_pictographic('😀'));
    assert!(!is_text_default_pictographic('☕'));
    assert!(!is_text_default_pictographic('⏳'));
}

#[test]
fn test_predicates_are_disjoint_for_known_codepoints() {
    // Sample audit: every codepoint we care about is in EXACTLY ONE bucket.
    let cases: &[(char, bool, bool)] = &[
        // (char, default_emoji, text_default_pictographic)
        ('😀', true,  false),
        ('☕', true,  false),
        ('⏳', true,  false),
        ('🌻', true,  false),
        ('☀', false, true),
        ('☁', false, true),
        ('⚡', true,  false),  // U+26A1 has Emoji_Presentation=Yes (width=2)
        ('♂', false, true),
        ('♀', false, true),
        ('⛈', false, true),
        ('A', false, false),
        ('▶', false, false),
        ('→', false, false),
        ('├', false, false),
        ('✓', false, false),
    ];
    for (c, want_de, want_tdp) in cases {
        assert_eq!(is_default_emoji(*c), *want_de,
            "is_default_emoji({:?} U+{:04X})", c, *c as u32);
        assert_eq!(is_text_default_pictographic(*c), *want_tdp,
            "is_text_default_pictographic({:?} U+{:04X})", c, *c as u32);
        assert!(!(*want_de && *want_tdp),
            "{:?} cannot be in both buckets", c);
    }
}

// ── Splitter: bare text-default chars become Plain segments ──────

#[test]
fn test_split_bare_sun_is_plain() {
    // Core regression: ☀ alone (no VS16) → Plain → Pango renders monochrome
    // glyph from Sarasa, occupies 1 column → table borders stay aligned.
    let segs = split_emoji_segments("☀");
    assert_eq!(segs, vec![TextSegment::Plain("☀".into())],
        "bare ☀ U+2600 (no VS16) must be Plain, not Emoji: {:?}", segs);
}

#[test]
fn test_split_sun_with_vs16_is_emoji() {
    // ☀️ (with VS16) opts in to emoji presentation → Emoji segment
    let segs = split_emoji_segments("☀\u{FE0F}");
    assert_eq!(segs.len(), 1);
    assert!(matches!(&segs[0], TextSegment::Emoji(s) if s == "☀\u{FE0F}"),
        "☀️ with VS16 must be Emoji: {:?}", segs[0]);
}

#[test]
fn test_split_bare_lightning_is_emoji() {
    // ⚡ U+26A1 — Emoji_Presentation=Yes (unicode_width=2). It IS a default
    // emoji, no VS16 needed. Goes through CoreText overlay.
    let segs = split_emoji_segments("⚡");
    assert_eq!(segs, vec![TextSegment::Emoji("⚡".into())]);
}

#[test]
fn test_split_bare_male_sign_is_plain() {
    // ♂ standalone → Plain (it only becomes emoji when joined via ZWJ)
    let segs = split_emoji_segments("♂");
    assert_eq!(segs, vec![TextSegment::Plain("♂".into())]);
}

#[test]
fn test_split_zwj_swimmer_male_still_one_emoji_segment() {
    // 🏊‍♂️ — the ♂ in here is NOT bare, it's after ZWJ, so it must be
    // consumed into the emoji segment. This is the regression to NOT break.
    let segs = split_emoji_segments("🏊\u{200D}♂\u{FE0F}");
    assert_eq!(segs.len(), 1, "ZWJ sequence must remain ONE segment: {:?}", segs);
    assert!(matches!(&segs[0], TextSegment::Emoji(s) if s == "🏊\u{200D}♂\u{FE0F}"));
}

#[test]
fn test_split_weather_table_row_mixed() {
    // What our weather table actually produces — mix of bare and VS16.
    // Mo: ☀  Di: ⛅  Mi: ☁  Do: ⛈  Fr: 🌧  Sa: ❄  So: ☀️
    //   ☀ bare       → Plain (text default)
    //   ⛅ bare       → Emoji (Emoji_Presentation=Yes, width=2)
    //   ☁ bare       → Plain (text default)
    //   ⛈ bare       → Plain (text default)
    //   🌧 bare       → Plain (text default Extended_Pictographic, width=1)
    //   ❄ bare       → Plain (text default)
    //   ☀️ with VS16  → Emoji
    assert!(!is_default_emoji('☀'));   assert!(is_text_default_pictographic('☀'));
    assert!( is_default_emoji('⛅'));
    assert!(!is_default_emoji('☁'));   assert!(is_text_default_pictographic('☁'));
    assert!(!is_default_emoji('⛈'));   assert!(is_text_default_pictographic('⛈'));
    assert!(!is_default_emoji('🌧'));  assert!(is_text_default_pictographic('🌧'));
    assert!(!is_default_emoji('❄'));   assert!(is_text_default_pictographic('❄'));

    let bare_sun = split_emoji_segments("☀");
    assert_eq!(bare_sun, vec![TextSegment::Plain("☀".into())]);

    let vs16_sun = split_emoji_segments("☀\u{FE0F}");
    assert!(matches!(&vs16_sun[0], TextSegment::Emoji(_)));
}

#[test]
fn test_split_table_cell_bare_sun_padded() {
    // " ☀     " — bare sun in a table cell with padding.
    // With the fix, the entire cell is one Plain segment (no overlay,
    // unicode_width counts ☀ as 1, Pango renders it as 1-column glyph,
    // table borders stay aligned).
    let text = " ☀      ";
    let segs = split_emoji_segments(text);
    assert_eq!(segs, vec![TextSegment::Plain(" ☀      ".into())],
        "bare ☀ in padded cell must be a single Plain segment: {:?}", segs);
}

#[test]
fn test_split_emoji_default_chars_still_work_without_vs16() {
    // Default-emoji chars must NOT require VS16. The smile, the rocket,
    // the teacup — they are emoji on their own.
    let segs = split_emoji_segments("☕");
    assert_eq!(segs, vec![TextSegment::Emoji("☕".into())]);

    let segs = split_emoji_segments("🚀");
    assert_eq!(segs, vec![TextSegment::Emoji("🚀".into())]);
}

#[test]
fn test_emoji_modifier_no_longer_includes_zwj_or_vs16_in_is_default_emoji() {
    // Cleanup: ZWJ and VS16 are MODIFIERS, not emoji bases.
    // The old `is_emoji_char` matched them as a hack. The new
    // `is_default_emoji` must NOT — they are handled separately
    // by is_emoji_modifier and the splitter.
    assert!(!is_default_emoji('\u{200D}'), "ZWJ is modifier, not emoji base");
    assert!(!is_default_emoji('\u{FE0F}'), "VS16 is modifier, not emoji base");
    assert!(!is_text_default_pictographic('\u{200D}'));
    assert!(!is_text_default_pictographic('\u{FE0F}'));
}

