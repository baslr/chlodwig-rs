//! Tests for the codepoint pipeline manifest in `chlodwig_gtk::emoji`.
//!
//! The manifest is a small explicit table that fixes width/render-pipeline
//! mismatches for codepoints that exist in the system fallback font (or in
//! Apple Color Emoji) but not in our bundled Sarasa Mono J. See Gotcha #56
//! in `CLAUDE.md` for the full background.
//!
//! Each entry maps a source `char` to a target UTF-8 string, which may
//! be: (a) a different codepoint (`✆ → 📞`), (b) the same codepoint
//! plus VS16 (`✉ → ✉️`), or (c) a different codepoint plus VS16
//! (`✒ → 🖊️`). Two queries: `pipeline_remap` and `is_pipeline_source`.

use crate::emoji::*;

// ── Manifest queries ──────────────────────────────────────────────

#[test]
fn test_remap_telephone_location_sign_to_phone_emoji() {
    // ✆ U+2706 is in NO bundled Sarasa variant and NOT in Apple Color
    // Emoji. The system falls back to Menlo / Apple Symbols → blass and
    // wrong width. Mapping to 📞 routes through the emoji bitmap pipeline.
    assert_eq!(pipeline_remap('\u{2706}'), Some("\u{1F4DE}"));
}

#[test]
fn test_remap_envelope_to_envelope_with_vs16() {
    // ✉ U+2709 IS in Apple Color Emoji, but bare codepoint is text-default.
    // We append VS16 so Apple Emoji selects emoji-presentation (2-cell color).
    assert_eq!(pipeline_remap('\u{2709}'), Some("\u{2709}\u{FE0F}"));
}

#[test]
fn test_remap_pencil_to_pencil_with_vs16() {
    assert_eq!(pipeline_remap('\u{270F}'), Some("\u{270F}\u{FE0F}"));
}

#[test]
fn test_remap_airplane_to_airplane_with_vs16() {
    // ✈ U+2708 — primary user-reported case. Bare ✈ via Sarasa → cmap-miss
    // → width_cjk=1 → bug. Manifest forces width=2 AND splitter appends VS16.
    assert_eq!(pipeline_remap('\u{2708}'), Some("\u{2708}\u{FE0F}"));
}

#[test]
fn test_remap_pen_to_pen_with_vs16() {
    // ✒ stays ✒ (BLACK NIB) — Apple Color Emoji has it. Just append VS16.
    assert_eq!(pipeline_remap('\u{2712}'), Some("\u{2712}\u{FE0F}"));
}

#[test]
fn test_remap_decorative_stars() {
    assert_eq!(pipeline_remap('\u{272A}'), Some("\u{1F31F}")); // ✪ → 🌟
    assert_eq!(pipeline_remap('\u{2730}'), Some("\u{1F4AB}")); // ✰ → 💫
}

#[test]
fn test_remap_decorative_hearts_and_flowers() {
    assert_eq!(pipeline_remap('\u{2765}'), Some("\u{1F496}")); // ❥ → 💖
    assert_eq!(pipeline_remap('\u{2766}'), Some("\u{1F338}")); // ❦ → 🌸
}

#[test]
fn test_remap_religious_political() {
    // ☘ stays ☘ (shamrock, 3-leaf) — we just append VS16 for color
    // presentation. Mapping it to 🍀 (4-leaf clover) was wrong.
    assert_eq!(pipeline_remap('\u{2618}'), Some("\u{2618}\u{FE0F}"));
    assert_eq!(pipeline_remap('\u{262E}'), Some("\u{262E}\u{FE0F}")); // ☮ → ☮️
}

#[test]
fn test_remap_chess_weapons_scales() {
    assert_eq!(pipeline_remap('\u{2655}'), Some("\u{1F451}")); // ♕ → 👑
    assert_eq!(pipeline_remap('\u{2694}'), Some("\u{2694}\u{FE0F}")); // ⚔ → ⚔️
    assert_eq!(pipeline_remap('\u{2696}'), Some("\u{2696}\u{FE0F}")); // ⚖ → ⚖️
}

#[test]
fn test_remap_weather_thunder_cloud() {
    assert_eq!(pipeline_remap('\u{26C8}'), Some("\u{26C8}\u{FE0F}")); // ⛈ → ⛈️
}

#[test]
fn test_remap_returns_none_for_normal_chars() {
    for c in ['A', '中', '→', '─', '│', ' ', '☕', '🚀'] {
        assert_eq!(
            pipeline_remap(c),
            None,
            "non-manifest char {c:?} must return None"
        );
    }
}

#[test]
fn test_is_pipeline_source_true_for_all_manifest_entries() {
    for c in ['\u{2706}', '\u{2708}', '\u{2709}', '\u{270F}', '\u{2712}',
              '\u{272A}', '\u{2730}', '\u{2765}', '\u{2766}', '\u{2618}',
              '\u{262E}', '\u{2655}', '\u{2694}', '\u{2696}', '\u{26C8}'] {
        assert!(is_pipeline_source(c), "manifest char {c:?} must be source");
    }
}

#[test]
fn test_is_pipeline_source_false_for_normal_chars() {
    for c in ['A', '中', '→', '─', '│', ' ', '☕', '🚀'] {
        assert!(
            !is_pipeline_source(c),
            "non-manifest char {c:?} must NOT be source"
        );
    }
}

#[test]
fn test_pipeline_overrides_iter_yields_all_manifest_codepoints() {
    let pairs: Vec<(char, u8)> = pipeline_width_overrides().collect();
    let codepoints: std::collections::HashSet<char> =
        pairs.iter().map(|(c, _)| *c).collect();
    for c in ['\u{2706}', '\u{2708}', '\u{2709}', '\u{270F}', '\u{2712}',
              '\u{272A}', '\u{2730}', '\u{2765}', '\u{2766}', '\u{2618}',
              '\u{262E}', '\u{2655}', '\u{2694}', '\u{2696}', '\u{26C8}'] {
        assert!(codepoints.contains(&c), "U+{:04X} missing from overrides", c as u32);
    }
    for (c, w) in &pairs {
        assert_eq!(*w, 2, "manifest entry {c:?} must override to width 2");
    }
}

// ── Splitter integration ──────────────────────────────────────────

#[test]
fn test_split_envelope_routes_to_emoji_segment_with_vs16() {
    // Bare ✉ (no VS16) must end up in an Emoji segment with VS16 appended.
    let segs = split_emoji_segments("✉");
    assert_eq!(segs, vec![TextSegment::Emoji("✉\u{FE0F}".into())]);
}

#[test]
fn test_split_pencil_routes_to_emoji_segment_with_vs16() {
    let segs = split_emoji_segments("✏");
    assert_eq!(segs, vec![TextSegment::Emoji("✏\u{FE0F}".into())]);
}

#[test]
fn test_split_airplane_routes_to_emoji_segment_with_vs16() {
    let segs = split_emoji_segments("✈");
    assert_eq!(segs, vec![TextSegment::Emoji("✈\u{FE0F}".into())]);
}

#[test]
fn test_split_telephone_location_remapped_to_phone_emoji() {
    // ✆ U+2706 → 📞 U+1F4DE (no VS16, default-emoji target).
    let segs = split_emoji_segments("✆");
    assert_eq!(segs, vec![TextSegment::Emoji("\u{1F4DE}".into())]);
}

#[test]
fn test_split_pen_keeps_pen_with_vs16() {
    // ✒ → ✒️ (same codepoint + VS16, no codepoint substitution)
    let segs = split_emoji_segments("✒");
    assert_eq!(segs, vec![TextSegment::Emoji("✒\u{FE0F}".into())]);
}

#[test]
fn test_split_chess_queen_to_crown() {
    let segs = split_emoji_segments("♕");
    assert_eq!(segs, vec![TextSegment::Emoji("\u{1F451}".into())]);
}

#[test]
fn test_split_thunder_cloud_to_thunder_cloud_vs16() {
    let segs = split_emoji_segments("⛈");
    assert_eq!(segs, vec![TextSegment::Emoji("⛈\u{FE0F}".into())]);
}

#[test]
fn test_split_envelope_in_table_cell_does_not_break_borders() {
    // Realistic mini-table cell: a leading bullet, the envelope, trailing
    // text. The whole thing should split cleanly with the emoji isolated.
    let segs = split_emoji_segments("• ✉ mail");
    assert_eq!(
        segs,
        vec![
            TextSegment::Plain("• ".into()),
            TextSegment::Emoji("✉\u{FE0F}".into()),
            TextSegment::Plain(" mail".into()),
        ]
    );
}

#[test]
fn test_split_telephone_location_in_table_cell() {
    let segs = split_emoji_segments("call ✆ now");
    assert_eq!(
        segs,
        vec![
            TextSegment::Plain("call ".into()),
            TextSegment::Emoji("\u{1F4DE}".into()),
            TextSegment::Plain(" now".into()),
        ]
    );
}

#[test]
fn test_split_input_already_has_vs16_no_double_vs16() {
    // User types ✉️ (with explicit VS16). Manifest target is also "✉\u{FE0F}".
    // The splitter must NOT produce "✉\u{FE0F}\u{FE0F}".
    let segs = split_emoji_segments("✉\u{FE0F}");
    assert_eq!(segs, vec![TextSegment::Emoji("✉\u{FE0F}".into())]);
}

#[test]
fn test_split_airplane_with_vs16_no_double_vs16() {
    let segs = split_emoji_segments("✈\u{FE0F}");
    assert_eq!(segs, vec![TextSegment::Emoji("✈\u{FE0F}".into())]);
}

#[test]
fn test_split_pencil_with_vs16_no_double_vs16() {
    let segs = split_emoji_segments("✏\u{FE0F}");
    assert_eq!(segs, vec![TextSegment::Emoji("✏\u{FE0F}".into())]);
}

#[test]
fn test_split_thunder_cloud_with_vs16_no_double_vs16() {
    let segs = split_emoji_segments("⛈\u{FE0F}");
    assert_eq!(segs, vec![TextSegment::Emoji("⛈\u{FE0F}".into())]);
}

#[test]
fn test_split_phone_remap_target_no_input_vs16_to_consume() {
    // ✆ followed by VS16 in the input → target is "📞" (no VS16) → input's
    // VS16 should NOT be consumed because the target doesn't end in VS16.
    // It will instead be eaten as an emoji modifier of 📞 (which is fine
    // — 📞 + VS16 is still 📞 in Apple Emoji).
    let segs = split_emoji_segments("✆\u{FE0F}");
    // 📞 + VS16 (consumed as modifier in the inner loop)
    assert_eq!(segs, vec![TextSegment::Emoji("\u{1F4DE}\u{FE0F}".into())]);
}

#[test]
fn test_split_normal_text_default_picto_without_force_still_plain() {
    // ☀ U+2600 is NOT in the pipeline manifest (Sarasa renders it 1-wide
    // just fine). Bare ☀ must stay Plain (Gotcha #54 invariant).
    let segs = split_emoji_segments("☀");
    assert_eq!(segs, vec![TextSegment::Plain("☀".into())]);
}

#[test]
fn test_split_full_weather_table_row() {
    // A weather table row with multiple manifest entries. None of them
    // should leak into Plain.
    let segs = split_emoji_segments("✈ ⚖ ⛈");
    assert_eq!(
        segs,
        vec![
            TextSegment::Emoji("✈\u{FE0F}".into()),
            TextSegment::Plain(" ".into()),
            TextSegment::Emoji("⚖\u{FE0F}".into()),
            TextSegment::Plain(" ".into()),
            TextSegment::Emoji("⛈\u{FE0F}".into()),
        ]
    );
}

// ── Width override propagation through FontMetrics ─────────────────

#[test]
fn test_sarasa_metrics_envelope_width_is_2() {
    let m = crate::sarasa_metrics();
    assert_eq!(m.char_width('\u{2709}'), 2);
}

#[test]
fn test_sarasa_metrics_pencil_width_is_2() {
    let m = crate::sarasa_metrics();
    assert_eq!(m.char_width('\u{270F}'), 2);
}

#[test]
fn test_sarasa_metrics_telephone_location_width_is_2() {
    let m = crate::sarasa_metrics();
    assert_eq!(m.char_width('\u{2706}'), 2);
}

#[test]
fn test_sarasa_metrics_airplane_width_is_2() {
    // The user-reported bug: ✈ FE0F was counted as 1. Override fixes the
    // base codepoint width, and unicode_width::width('\u{FE0F}') = 0, so
    // ✈ + VS16 sums to 2.
    let m = crate::sarasa_metrics();
    assert_eq!(m.char_width('\u{2708}'), 2);
}

#[test]
fn test_sarasa_metrics_all_new_manifest_sources_width_is_2() {
    let m = crate::sarasa_metrics();
    for c in ['\u{2712}', '\u{272A}', '\u{2730}', '\u{2765}', '\u{2766}',
              '\u{2618}', '\u{262E}', '\u{2655}', '\u{2694}', '\u{2696}',
              '\u{26C8}'] {
        assert_eq!(m.char_width(c), 2,
                   "manifest source U+{:04X} must have width 2", c as u32);
    }
}

#[test]
fn test_sarasa_metrics_normal_char_unchanged() {
    let m = crate::sarasa_metrics();
    assert_eq!(m.char_width('M'), 1);
}

#[test]
fn test_sarasa_metrics_box_drawing_unchanged() {
    let m = crate::sarasa_metrics();
    assert_eq!(m.char_width('│'), 1);
    assert_eq!(m.char_width('─'), 1);
    assert_eq!(m.char_width('├'), 1);
}

// ── Full coverage: 170 Apple-Color-Emoji fallback codepoints ──────
//
// Generated via scripts/regen_pipeline_manifest.py. The script enumerates
// every codepoint that
//   (a) is missing from SarasaMonoJ-Regular.ttf cmap,
//   (b) is present in Apple Color Emoji (so PangoCairo will fall back
//       to a 2-cell color bitmap),
//   (c) has unicode_width::width_cjk = 1 (so default declared width is wrong).
//
// The MANIFEST must contain an entry for every such codepoint, with the
// width override set to 2. These spot tests assert representative samples
// from each Unicode block — full enumeration is below.

#[test]
fn test_manifest_covers_skull_and_crossbones() {
    assert_eq!(pipeline_remap('\u{2620}'), Some("\u{2620}\u{FE0F}"));
    assert!(is_pipeline_source('\u{2620}'));
    assert_eq!(crate::sarasa_metrics().char_width('\u{2620}'), 2);
}

#[test]
fn test_manifest_covers_radioactive_and_biohazard() {
    for cp in ['\u{2622}', '\u{2623}'] {
        let target: String = format!("{}\u{FE0F}", cp);
        assert_eq!(pipeline_remap(cp), Some(target.as_str()),
                   "U+{:04X} must remap to itself+VS16", cp as u32);
        assert!(is_pipeline_source(cp));
        assert_eq!(crate::sarasa_metrics().char_width(cp), 2);
    }
}

#[test]
fn test_manifest_covers_thermometer_and_weather_smp() {
    // 🌡 🌤 🌥 🌦 🌧 🌨 🌩 🌪 🌫 🌬 — all currently render at width=1
    // without a manifest entry. After the fix, all must report width 2.
    for cp in ['\u{1F321}', '\u{1F324}', '\u{1F325}', '\u{1F326}', '\u{1F327}',
               '\u{1F328}', '\u{1F329}', '\u{1F32A}', '\u{1F32B}', '\u{1F32C}'] {
        assert!(is_pipeline_source(cp),
                "U+{:05X} must be a pipeline source", cp as u32);
        assert_eq!(crate::sarasa_metrics().char_width(cp), 2,
                   "U+{:05X} must have width 2 after manifest fix", cp as u32);
    }
}

#[test]
fn test_manifest_covers_pen_family_smp() {
    // 🖊 🖋 🖌 🖍 — the pen family
    for cp in ['\u{1F58A}', '\u{1F58B}', '\u{1F58C}', '\u{1F58D}'] {
        assert!(is_pipeline_source(cp),
                "U+{:05X} must be in manifest", cp as u32);
        assert_eq!(crate::sarasa_metrics().char_width(cp), 2,
                   "U+{:05X} must have width 2", cp as u32);
    }
}

#[test]
fn test_manifest_covers_office_smp() {
    // 🖥 🖨 🗂 🗑 🗒 🗺 — office / computer pictographs
    for cp in ['\u{1F5A5}', '\u{1F5A8}', '\u{1F5C2}', '\u{1F5D1}',
               '\u{1F5D2}', '\u{1F5FA}'] {
        assert!(is_pipeline_source(cp),
                "U+{:05X} must be in manifest", cp as u32);
        assert_eq!(crate::sarasa_metrics().char_width(cp), 2,
                   "U+{:05X} must have width 2", cp as u32);
    }
}

#[test]
fn test_manifest_covers_dingbats_victory_writing() {
    // ✌ ✍ — bare dingbat hands
    for cp in ['\u{270C}', '\u{270D}'] {
        assert!(is_pipeline_source(cp));
        assert_eq!(crate::sarasa_metrics().char_width(cp), 2);
    }
}

#[test]
fn test_manifest_covers_misc_symbols_extended() {
    // ⚒ ⚕ ⚗ ⚜ ⚧ ⚰ ⚱ — Misc Symbols Extended
    for cp in ['\u{2692}', '\u{2695}', '\u{2697}', '\u{269C}',
               '\u{26A7}', '\u{26B0}', '\u{26B1}'] {
        assert!(is_pipeline_source(cp));
        assert_eq!(crate::sarasa_metrics().char_width(cp), 2);
    }
}

#[test]
fn test_manifest_covers_chess_pawn() {
    assert!(is_pipeline_source('\u{265F}'));
    assert_eq!(crate::sarasa_metrics().char_width('\u{265F}'), 2);
}

#[test]
fn test_manifest_size_at_least_120_entries() {
    // After expansion: 15 original manual + 114 generated = 129. Allow some
    // slack but guard against accidental shrinkage / massive blowup.
    let count = pipeline_width_overrides().count();
    assert!(count >= 120, "manifest shrunk below 120 entries: {}", count);
    assert!(count <= 200, "manifest grew above 200 entries: {}", count);
}

/// The exhaustive guard: every codepoint that PangoCairo would route
/// through Apple Color Emoji at a width that disagrees with our declared
/// width MUST have a manifest entry. We hard-code the list (matching the
/// generator script's output). If a future Sarasa upgrade adds glyphs for
/// some of these, the corresponding entry can be removed manually.
const EXPECTED_PIPELINE_SOURCES: &[char] = &[
    // BMP — Misc Symbols & Dingbats
    '\u{2604}', '\u{2620}', '\u{2622}', '\u{2623}', '\u{262A}',
    '\u{2638}', '\u{265F}', '\u{2692}', '\u{2695}', '\u{2697}',
    '\u{269C}', '\u{26A7}', '\u{26B0}', '\u{26B1}', '\u{270C}',
    '\u{270D}', '\u{2763}',
    // SMP — Misc Symbols and Pictographs
    '\u{1F321}', '\u{1F324}', '\u{1F325}', '\u{1F326}', '\u{1F327}',
    '\u{1F328}', '\u{1F329}', '\u{1F32A}', '\u{1F32B}', '\u{1F32C}',
    '\u{1F336}', '\u{1F37D}', '\u{1F396}', '\u{1F397}', '\u{1F399}',
    '\u{1F39A}', '\u{1F39B}', '\u{1F39E}', '\u{1F39F}', '\u{1F3CB}',
    '\u{1F3CC}', '\u{1F3CD}', '\u{1F3CE}', '\u{1F3D4}', '\u{1F3D5}',
    '\u{1F3D6}', '\u{1F3D7}', '\u{1F3D8}', '\u{1F3D9}', '\u{1F3DA}',
    '\u{1F3DB}', '\u{1F3DC}', '\u{1F3DD}', '\u{1F3DE}', '\u{1F3DF}',
    '\u{1F3F3}', '\u{1F3F5}', '\u{1F3F7}', '\u{1F43F}', '\u{1F441}',
    '\u{1F4FD}', '\u{1F549}', '\u{1F54A}', '\u{1F56F}', '\u{1F570}',
    '\u{1F573}', '\u{1F574}', '\u{1F575}', '\u{1F576}', '\u{1F577}',
    '\u{1F578}', '\u{1F579}', '\u{1F587}', '\u{1F58A}', '\u{1F58B}',
    '\u{1F58C}', '\u{1F58D}', '\u{1F590}', '\u{1F5A5}', '\u{1F5A8}',
    '\u{1F5B1}', '\u{1F5B2}', '\u{1F5BC}', '\u{1F5C2}', '\u{1F5C3}',
    '\u{1F5C4}', '\u{1F5D1}', '\u{1F5D2}', '\u{1F5D3}', '\u{1F5DC}',
    '\u{1F5DD}', '\u{1F5DE}', '\u{1F5E1}', '\u{1F5E3}', '\u{1F5E8}',
    '\u{1F5EF}', '\u{1F5F3}', '\u{1F5FA}', '\u{1F6CB}', '\u{1F6CD}',
    '\u{1F6CE}', '\u{1F6CF}', '\u{1F6E0}', '\u{1F6E1}', '\u{1F6E2}',
    '\u{1F6E3}', '\u{1F6E4}', '\u{1F6E5}', '\u{1F6E9}', '\u{1F6F0}',
    '\u{1F6F3}',
];

#[test]
fn test_every_apple_emoji_fallback_codepoint_has_manifest_entry() {
    let m = crate::sarasa_metrics();
    for &c in EXPECTED_PIPELINE_SOURCES {
        assert!(is_pipeline_source(c),
                "U+{:05X} must be in pipeline manifest", c as u32);
        assert_eq!(m.char_width(c), 2,
                   "U+{:05X} declared width must be 2", c as u32);
        // Target must be a non-empty string — either same codepoint+VS16
        // or substituted codepoint.
        let target = pipeline_remap(c).expect("manifest hit");
        assert!(!target.is_empty(),
                "U+{:05X} has empty remap target", c as u32);
    }
}

// ── EmojiSpec.to_color_emoji semantics ─────────────────────────────
//
// Each manifest entry is an `EmojiSpec { emit, to_color_emoji }`:
//   - to_color_emoji = false → unconditional: codepoint always becomes
//     emoji segment (used for codepoints missing from Sarasa, where bare
//     Pango fallback would mis-render).
//   - to_color_emoji = true → conditional: codepoint becomes emoji ONLY
//     if the next char is VS16. Otherwise it stays Plain (for codepoints
//     present in Sarasa where bare = perfect s/w glyph, but user can
//     opt in to color via VS16).

#[test]
fn test_emoji_spec_struct_exists() {
    let _spec = crate::emoji::EmojiSpec {
        emit: "x",
        to_color_emoji: false,
    };
}

#[test]
fn test_lookup_returns_spec_for_envelope() {
    let spec = crate::emoji::lookup('\u{2709}').expect("envelope must be in manifest");
    assert_eq!(spec.emit, "\u{2709}\u{FE0F}");
    assert_eq!(spec.to_color_emoji, false, "envelope is unconditional (Sarasa-miss)");
}

#[test]
fn test_lookup_returns_none_for_normal_char() {
    assert!(crate::emoji::lookup('A').is_none());
}

#[test]
fn test_pipeline_remap_still_works_for_back_compat() {
    // pipeline_remap is the legacy API — must still return the emit string.
    assert_eq!(pipeline_remap('\u{2709}'), Some("\u{2709}\u{FE0F}"));
}

// ── Splitter honors to_color_emoji flag ─────────────────────────────
//
// to_color_emoji = false → bare codepoint becomes Emoji segment.
// to_color_emoji = true  → bare codepoint stays Plain; only U+FE0F
//                          immediately after triggers the Emoji segment.

use crate::emoji::{split_emoji_segments, TextSegment};

#[test]
fn test_splitter_to_color_emoji_false_bare_becomes_emoji() {
    // U+2709 ✉ has to_color_emoji=false → bare must become Emoji segment.
    let segs = split_emoji_segments("\u{2709}");
    assert!(matches!(segs.as_slice(), [TextSegment::Emoji(s)] if s == "\u{2709}\u{FE0F}"),
            "bare U+2709 with to_color_emoji=false must be Emoji, got {segs:?}");
}

#[test]
fn test_splitter_to_color_emoji_true_bare_stays_plain() {
    // Synthetic check: pick a manifest entry with to_color_emoji=true
    // (none currently exists in MANIFEST, so this is a future-proof guard).
    // Find first entry, if any, with the flag set.
    let opt_in_entry: Option<char> = (0u32..0x110000)
        .filter_map(char::from_u32)
        .find(|&c| crate::emoji::lookup(c).map_or(false, |s| s.to_color_emoji));
    if let Some(c) = opt_in_entry {
        let s: String = std::iter::once(c).collect();
        let segs = split_emoji_segments(&s);
        assert!(matches!(segs.as_slice(), [TextSegment::Plain(p)] if p == &s),
                "bare U+{:05X} with to_color_emoji=true must stay Plain, got {segs:?}",
                c as u32);
    }
}

#[test]
fn test_splitter_to_color_emoji_true_with_vs16_becomes_emoji() {
    let opt_in_entry: Option<char> = (0u32..0x110000)
        .filter_map(char::from_u32)
        .find(|&c| crate::emoji::lookup(c).map_or(false, |s| s.to_color_emoji));
    if let Some(c) = opt_in_entry {
        let mut s = String::new();
        s.push(c);
        s.push('\u{FE0F}');
        let segs = split_emoji_segments(&s);
        assert!(matches!(segs.as_slice(), [TextSegment::Emoji(_)]),
                "U+{:05X} + VS16 with to_color_emoji=true must be Emoji, got {segs:?}",
                c as u32);
    }
}
