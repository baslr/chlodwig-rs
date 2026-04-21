//! Tests for the bundled Sarasa Mono J font.
//!
//! Background: see Gotcha (CJK column alignment) — without an explicitly
//! double-width CJK monospace font, Pango falls back to system proportional
//! fonts for CJK glyphs, breaking table alignment (the `│` separators
//! shift left because `日` renders narrower than 2 monospace columns).
//!
//! We bundle `SarasaMonoJ-Regular.ttf` (Iosevka Latin + Source Han Sans CJK,
//! pre-merged) so that:
//!   1. Latin / box-drawing glyphs are halfwidth (1 col, 6px @ 12pt)
//!   2. CJK glyphs are exactly fullwidth (2 cols, 12px @ 12pt)
//!   3. ALL glyphs come from the SAME font → metric-compatible by design
//!   4. Box-drawing chars (`│ ─ ┌ ┐ └ ┘ ┬ ┴ ├ ┤ ┼`) are HALFWIDTH (unlike
//!      Noto Sans Mono CJK JP, where they are erroneously fullwidth and
//!      break border-row vs content-row alignment)
//!   5. Compact line-height (15px @ 12pt vs 17.4px for Noto Mono CJK JP)
//!      → no vertical gaps between table rows
//!   6. We do not depend on the user having any CJK font installed
//!
//! Registration strategy (Gotcha #B):
//!   - On macOS: install into `~/Library/Fonts/` so CoreText picks it up
//!     at process start (process-scope CTFontManager registration was
//!     unreliable — Pango's font cache was built before our registration
//!     took effect).
//!   - On Linux/Windows: install into the user's font directory.

use crate::APP_CSS;

#[test]
fn test_bundled_cjk_font_bytes_not_empty() {
    assert!(
        !crate::SARASA_MONO_J_BYTES.is_empty(),
        "Bundled Sarasa Mono J font must not be empty"
    );
}

#[test]
fn test_bundled_cjk_font_size_is_about_26mb() {
    // SarasaMonoJ-Regular.ttf v1.0.37 is ~26 MB. Guard against accidental
    // truncation or replacement with a stub.
    let len = crate::SARASA_MONO_J_BYTES.len();
    assert!(
        len > 15_000_000 && len < 40_000_000,
        "Bundled Sarasa font size suspicious: {} bytes (expected ~26 MB)",
        len
    );
}

#[test]
fn test_bundled_cjk_font_starts_with_truetype_magic() {
    // TrueType-outline fonts start with 0x00010000. OpenType/CFF would
    // start with "OTTO". Sarasa Mono J is TrueType-outline.
    let bytes = crate::SARASA_MONO_J_BYTES;
    assert!(bytes.len() > 4, "Font file too small to inspect magic");
    assert_eq!(
        &bytes[..4],
        &[0x00, 0x01, 0x00, 0x00],
        "SarasaMonoJ-Regular.ttf must start with TrueType magic 0x00010000"
    );
}

#[test]
fn test_bundled_cjk_font_has_cmap_table() {
    // Every functional font has a cmap table mapping codepoints to glyph IDs.
    // Walk the table directory and look for "cmap".
    let bytes = crate::SARASA_MONO_J_BYTES;
    assert!(bytes.len() > 12, "Font too small for table directory");
    let num_tables = u16::from_be_bytes([bytes[4], bytes[5]]) as usize;

    let mut found_cmap = false;
    for i in 0..num_tables {
        let offset = 12 + i * 16;
        if offset + 4 > bytes.len() {
            break;
        }
        let tag = &bytes[offset..offset + 4];
        if tag == b"cmap" {
            found_cmap = true;
            break;
        }
    }
    assert!(found_cmap, "Sarasa font must contain a cmap table");
}

#[test]
fn test_extract_cjk_font_creates_file() {
    let dir = tempfile::tempdir().unwrap();
    let path = crate::extract_bundled_cjk_font_to(dir.path());
    assert!(path.exists(), "Extracted font file must exist at {:?}", path);
    let meta = std::fs::metadata(&path).unwrap();
    assert_eq!(
        meta.len(),
        crate::SARASA_MONO_J_BYTES.len() as u64,
        "Extracted font file size must match embedded bytes"
    );
}

#[test]
fn test_extract_cjk_font_is_idempotent() {
    let dir = tempfile::tempdir().unwrap();
    let path1 = crate::extract_bundled_cjk_font_to(dir.path());
    let path2 = crate::extract_bundled_cjk_font_to(dir.path());
    assert_eq!(path1, path2);
    assert!(path2.exists());
}

#[test]
fn test_extract_cjk_font_filename() {
    // The filename matters — both for fontconfig caching and for CoreText
    // registration debugging. Pin it.
    let dir = tempfile::tempdir().unwrap();
    let path = crate::extract_bundled_cjk_font_to(dir.path());
    assert_eq!(
        path.file_name().and_then(|s| s.to_str()),
        Some("SarasaMonoJ-Regular.ttf"),
        "Bundled mono font must be extracted as SarasaMonoJ-Regular.ttf"
    );
}

// ── CSS fallback chain ────────────────────────────────────────────

#[test]
fn test_app_css_monospace_includes_sarasa_font_family() {
    // For Pango to actually USE the bundled font, the .monospace CSS class
    // must list "Sarasa Mono J" in its font-family chain.
    assert!(
        APP_CSS.contains("Sarasa Mono J"),
        "APP_CSS .monospace must include 'Sarasa Mono J' in the font-family list"
    );
}

// NOTE: the historic `test_app_css_sarasa_font_listed_before_generic_monospace`
// test was removed when APP_CSS migrated to single-family rules
// (no generic `monospace` keyword). The presence of "Sarasa Mono J"
// in the CSS is asserted by `test_app_css_monospace_includes_sarasa_font_family`
// above, and SSoT/global-rule structure is asserted by
// `tests/global_ui_font_tests.rs`.

// ── User font directory installation ──────────────────────────────

#[test]
fn test_user_font_dir_macos() {
    if cfg!(target_os = "macos") {
        let p = crate::user_font_dir().expect("user_font_dir must succeed on macOS");
        let s = p.to_string_lossy();
        assert!(
            s.ends_with("Library/Fonts"),
            "On macOS, user_font_dir() must end with 'Library/Fonts', got {:?}",
            p
        );
    }
}

#[test]
fn test_user_font_dir_linux() {
    if cfg!(target_os = "linux") {
        let p = crate::user_font_dir().expect("user_font_dir must succeed on Linux");
        let s = p.to_string_lossy();
        assert!(
            s.ends_with(".local/share/fonts"),
            "On Linux, user_font_dir() must end with '.local/share/fonts', got {:?}",
            p
        );
    }
}

#[test]
fn test_install_cjk_font_to_creates_file_in_target_dir() {
    let dir = tempfile::tempdir().unwrap();
    let path = crate::install_bundled_cjk_font_to(dir.path())
        .expect("install must succeed in tempdir");
    assert_eq!(path.parent(), Some(dir.path()));
    assert_eq!(
        path.file_name().and_then(|s| s.to_str()),
        Some("SarasaMonoJ-Regular.ttf")
    );
    let meta = std::fs::metadata(&path).unwrap();
    assert_eq!(meta.len(), crate::SARASA_MONO_J_BYTES.len() as u64);
}

#[test]
fn test_install_cjk_font_to_is_idempotent() {
    let dir = tempfile::tempdir().unwrap();
    let p1 = crate::install_bundled_cjk_font_to(dir.path()).unwrap();
    let p2 = crate::install_bundled_cjk_font_to(dir.path()).unwrap();
    assert_eq!(p1, p2);
}

#[test]
fn test_install_cjk_font_to_skips_when_correct_file_exists() {
    let dir = tempfile::tempdir().unwrap();
    let target = dir.path().join("SarasaMonoJ-Regular.ttf");
    std::fs::write(&target, crate::SARASA_MONO_J_BYTES).unwrap();
    let mtime_before = std::fs::metadata(&target).unwrap().modified().unwrap();
    std::thread::sleep(std::time::Duration::from_millis(20));
    let _ = crate::install_bundled_cjk_font_to(dir.path()).unwrap();
    let mtime_after = std::fs::metadata(&target).unwrap().modified().unwrap();
    assert_eq!(
        mtime_before, mtime_after,
        "must NOT rewrite when correct file already exists (idempotency)"
    );
}

#[test]
fn test_install_cjk_font_to_overwrites_when_size_differs() {
    let dir = tempfile::tempdir().unwrap();
    let target = dir.path().join("SarasaMonoJ-Regular.ttf");
    std::fs::write(&target, b"stub bytes").unwrap();
    let _ = crate::install_bundled_cjk_font_to(dir.path()).unwrap();
    let meta = std::fs::metadata(&target).unwrap();
    assert_eq!(
        meta.len(),
        crate::SARASA_MONO_J_BYTES.len() as u64,
        "must overwrite stale/incorrect file"
    );
}

#[test]
fn test_main_rs_calls_install_bundled_cjk_font() {
    // Regression guard: main.rs must call the install function (which
    // copies the font to ~/Library/Fonts on macOS) — NOT the old
    // process-scope registration.
    let main_src = include_str!("../main.rs");
    assert!(
        main_src.contains("install_bundled_cjk_font"),
        "main.rs must call install_bundled_cjk_font* to copy the font \
         into the user font directory"
    );
}

#[test]
fn test_main_rs_initializes_tracing_before_cjk_install() {
    // The font install can fail (disk full, permission denied, etc.).
    // We want those errors to land in the debug log, so tracing must
    // be initialized BEFORE we call install_bundled_cjk_font.
    let main_src = include_str!("../main.rs");
    let tracing_init_pos = main_src
        .find("tracing_subscriber::fmt()")
        .expect("main.rs must initialize tracing");
    let install_pos = main_src
        .find("install_bundled_cjk_font")
        .expect("main.rs must call install_bundled_cjk_font*");
    assert!(
        tracing_init_pos < install_pos,
        "tracing_subscriber::fmt() must appear BEFORE install_bundled_cjk_font \
         in main.rs so install errors are logged (tracing_init@{}, install@{})",
        tracing_init_pos,
        install_pos
    );
}

// ── Mono font-family constant ─────────────────────────────────────
//
// Pango's `pango_font_description_set_family()` is used directly by
// md_renderer / render / window when building monospace TextTags
// (CSS `.monospace` class only applies via CssProvider — which doesn't
// reach TextTag.family). So we need a single constant referenced by all
// call sites.
//
// With Sarasa Mono J we use a SINGLE family name (no fallback list) —
// the font is self-contained for Latin + CJK + Box-Drawing, and adding
// fallbacks would risk Pango itemizing across mismatched-metric fonts.

#[test]
fn test_mono_font_family_const_exists() {
    let s: &str = crate::MONO_FONT_FAMILY;
    assert!(!s.is_empty(), "MONO_FONT_FAMILY must not be empty");
}

#[test]
fn test_mono_font_family_is_sarasa_mono_j() {
    let s = crate::MONO_FONT_FAMILY;
    assert!(
        s.contains("Sarasa Mono J"),
        "MONO_FONT_FAMILY must reference 'Sarasa Mono J' (was: {:?})",
        s
    );
}

#[test]
fn test_no_call_site_uses_bare_monospace_string() {
    // Regression guard: every place that builds a monospace TextTag
    // must use crate::MONO_FONT_FAMILY, not the bare literal "monospace".
    // Otherwise Pango ignores our bundled font and tables misalign.
    let files = [
        "src/md_renderer.rs",
        "src/render.rs",
        "src/window.rs",
    ];
    let crate_dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"));
    for f in &files {
        let path = crate_dir.join(f);
        let src = std::fs::read_to_string(&path).expect(&format!("read {:?}", path));
        assert!(
            !src.contains(r#".family("monospace")"#),
            "{}: must not use `.family(\"monospace\")` directly — use MONO_FONT_FAMILY",
            f
        );
        assert!(
            !src.contains(r#"set_family("monospace")"#),
            "{}: must not use `set_family(\"monospace\")` directly — use MONO_FONT_FAMILY",
            f
        );
    }
}
