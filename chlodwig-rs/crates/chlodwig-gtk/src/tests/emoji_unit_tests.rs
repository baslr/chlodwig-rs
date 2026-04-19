//! Tests for `chlodwig_gtk::emoji`.
//!
//! Extracted from inline `#[cfg(test)] mod tests` in `emoji.rs`. The
//! macOS-only CoreText tests reach into `crate::emoji::platform::*`,
//! which is now `pub(crate)` so they can be addressed from this submodule.

use crate::emoji::*;
#[cfg(target_os = "macos")]
use crate::emoji::platform;


#[test]
fn test_is_emoji_char_sunflower() {
    assert!(is_emoji_char('🌻'));
}

#[test]
fn test_is_emoji_char_smile() {
    assert!(is_emoji_char('😀'));
}

#[test]
fn test_is_emoji_char_hourglass() {
    assert!(is_emoji_char('⏳'));
}

#[test]
fn test_is_not_emoji_ascii() {
    assert!(!is_emoji_char('A'));
    assert!(!is_emoji_char('1'));
    assert!(!is_emoji_char(' '));
}

#[test]
fn test_is_not_emoji_triangle() {
    // ▶ U+25B6 is in Geometric Shapes, NOT in our emoji ranges
    // It renders fine via Pango/CoreText as a normal glyph
    assert!(!is_emoji_char('▶'));
}

#[test]
fn test_is_not_emoji_arrow() {
    assert!(!is_emoji_char('→'));
}

#[test]
fn test_is_not_emoji_box_drawing() {
    assert!(!is_emoji_char('├'));
    assert!(!is_emoji_char('│'));
    assert!(!is_emoji_char('└'));
}

#[test]
fn test_is_not_emoji_checkmark() {
    // ✓ U+2713 is NOT in the Emoji_Presentation set
    // PangoCairo renders it correctly via Lucida Grande
    assert!(!is_emoji_char('✓'));
    // But ✅ U+2705 IS an emoji
    assert!(is_emoji_char('✅'));
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

#[test]
fn test_is_emoji_char_sun() {
    // ☀ U+2600: Extended_Pictographic, commonly used as ☀️ (with VS16).
    // Must be detected as emoji so CoreText renders the color bitmap.
    assert!(is_emoji_char('\u{2600}'), "☀ U+2600 must be emoji");
}

#[test]
fn test_is_emoji_char_thunder_cloud() {
    // ⛈ U+26C8: Extended_Pictographic, commonly used as ⛈️.
    assert!(is_emoji_char('\u{26C8}'), "⛈ U+26C8 must be emoji");
}

#[test]
fn test_is_emoji_char_male_female_signs() {
    // ♂ U+2642 and ♀ U+2640 are components of ZWJ sequences
    // (🏊‍♂️ = 🏊 + ZWJ + ♂ + VS16). Without these, ZWJ sequences
    // get split at the gender sign, breaking the combined emoji.
    assert!(is_emoji_char('\u{2642}'), "♂ U+2642 must be emoji");
    assert!(is_emoji_char('\u{2640}'), "♀ U+2640 must be emoji");
}

#[test]
fn test_is_emoji_char_misc_symbols_extended() {
    // Extended_Pictographic chars in Misc Symbols that were missing.
    assert!(is_emoji_char('\u{2601}'), "☁ U+2601 must be emoji");
    assert!(is_emoji_char('\u{2602}'), "☂ U+2602 must be emoji");
    assert!(is_emoji_char('\u{2603}'), "☃ U+2603 must be emoji");
    assert!(is_emoji_char('\u{2604}'), "☄ U+2604 must be emoji");
    assert!(is_emoji_char('\u{260E}'), "☎ U+260E must be emoji");
    assert!(is_emoji_char('\u{2611}'), "☑ U+2611 must be emoji");
    assert!(is_emoji_char('\u{2618}'), "☘ U+2618 must be emoji");
    assert!(is_emoji_char('\u{261D}'), "☝ U+261D must be emoji");
    assert!(is_emoji_char('\u{2620}'), "☠ U+2620 must be emoji");
    assert!(is_emoji_char('\u{2622}'), "☢ U+2622 must be emoji");
    assert!(is_emoji_char('\u{2623}'), "☣ U+2623 must be emoji");
}

#[test]
fn test_is_emoji_char_symbols_and_religion() {
    assert!(is_emoji_char('\u{2626}'), "☦ U+2626 must be emoji");
    assert!(is_emoji_char('\u{262A}'), "☪ U+262A must be emoji");
    assert!(is_emoji_char('\u{262E}'), "☮ U+262E must be emoji");
    assert!(is_emoji_char('\u{262F}'), "☯ U+262F must be emoji");
    assert!(is_emoji_char('\u{2638}'), "☸ U+2638 must be emoji");
    assert!(is_emoji_char('\u{2639}'), "☹ U+2639 must be emoji");
    assert!(is_emoji_char('\u{263A}'), "☺ U+263A must be emoji");
}

#[test]
fn test_is_emoji_char_card_suits() {
    assert!(is_emoji_char('\u{2660}'), "♠ U+2660 must be emoji");
    assert!(is_emoji_char('\u{2663}'), "♣ U+2663 must be emoji");
    assert!(is_emoji_char('\u{2665}'), "♥ U+2665 must be emoji");
    assert!(is_emoji_char('\u{2666}'), "♦ U+2666 must be emoji");
}

#[test]
fn test_is_emoji_char_misc_objects() {
    assert!(is_emoji_char('\u{2668}'), "♨ U+2668 must be emoji");
    assert!(is_emoji_char('\u{267B}'), "♻ U+267B must be emoji");
    assert!(is_emoji_char('\u{2692}'), "⚒ U+2692 must be emoji");
    assert!(is_emoji_char('\u{2694}'), "⚔ U+2694 must be emoji");
    assert!(is_emoji_char('\u{2695}'), "⚕ U+2695 must be emoji");
    assert!(is_emoji_char('\u{2696}'), "⚖ U+2696 must be emoji");
    assert!(is_emoji_char('\u{2697}'), "⚗ U+2697 must be emoji");
    assert!(is_emoji_char('\u{2699}'), "⚙ U+2699 must be emoji");
    assert!(is_emoji_char('\u{269B}'), "⚛ U+269B must be emoji");
    assert!(is_emoji_char('\u{269C}'), "⚜ U+269C must be emoji");
    assert!(is_emoji_char('\u{26A0}'), "⚠ U+26A0 must be emoji");
    assert!(is_emoji_char('\u{26A7}'), "⚧ U+26A7 must be emoji");
    assert!(is_emoji_char('\u{26B0}'), "⚰ U+26B0 must be emoji");
    assert!(is_emoji_char('\u{26B1}'), "⚱ U+26B1 must be emoji");
}

#[test]
fn test_is_emoji_char_misc_objects_2() {
    assert!(is_emoji_char('\u{26CF}'), "⛏ U+26CF must be emoji");
    assert!(is_emoji_char('\u{26D1}'), "⛑ U+26D1 must be emoji");
    assert!(is_emoji_char('\u{26D3}'), "⛓ U+26D3 must be emoji");
    assert!(is_emoji_char('\u{26E9}'), "⛩ U+26E9 must be emoji");
    assert!(is_emoji_char('\u{26F0}'), "⛰ U+26F0 must be emoji");
    assert!(is_emoji_char('\u{26F1}'), "⛱ U+26F1 must be emoji");
    assert!(is_emoji_char('\u{26F4}'), "⛴ U+26F4 must be emoji");
    assert!(is_emoji_char('\u{26F7}'), "⛷ U+26F7 must be emoji");
    assert!(is_emoji_char('\u{26F8}'), "⛸ U+26F8 must be emoji");
    assert!(is_emoji_char('\u{26F9}'), "⛹ U+26F9 must be emoji");
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
