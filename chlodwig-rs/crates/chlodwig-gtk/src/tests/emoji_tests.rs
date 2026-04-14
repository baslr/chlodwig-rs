//! Tests for emoji font support in the GTK application.

use crate::APP_CSS;

#[test]
fn test_app_css_contains_emoji_font_family() {
    assert!(
        APP_CSS.contains("Apple Color Emoji"),
        "APP_CSS must include 'Apple Color Emoji' for macOS emoji rendering"
    );
    assert!(
        APP_CSS.contains("Noto Color Emoji"),
        "APP_CSS must include 'Noto Color Emoji' for Linux emoji rendering"
    );
}

#[test]
fn test_app_css_applies_to_textview() {
    assert!(
        APP_CSS.contains("textview text"),
        "APP_CSS must target 'textview text' selector for TextBuffer content"
    );
}

#[test]
fn test_app_css_contains_monospace_emoji_fallback() {
    assert!(
        APP_CSS.contains("monospace"),
        "APP_CSS should reference monospace for code font fallback"
    );
}

// ── CoreText backend tests ────────────────────────────────────────

#[test]
fn test_ensure_coretext_backend_sets_env_on_macos() {
    let original = std::env::var("PANGOCAIRO_BACKEND").ok();
    std::env::remove_var("PANGOCAIRO_BACKEND");

    crate::ensure_coretext_backend();

    if cfg!(target_os = "macos") {
        assert_eq!(
            std::env::var("PANGOCAIRO_BACKEND").ok().as_deref(),
            Some("coretext"),
            "On macOS, PANGOCAIRO_BACKEND must be set to 'coretext' for color emoji rendering"
        );
    }

    match original {
        Some(val) => std::env::set_var("PANGOCAIRO_BACKEND", val),
        None => std::env::remove_var("PANGOCAIRO_BACKEND"),
    }
}

#[test]
fn test_ensure_coretext_backend_does_not_override_explicit_setting() {
    let original = std::env::var("PANGOCAIRO_BACKEND").ok();

    std::env::set_var("PANGOCAIRO_BACKEND", "fontconfig");
    crate::ensure_coretext_backend();

    assert_eq!(
        std::env::var("PANGOCAIRO_BACKEND").ok().as_deref(),
        Some("fontconfig"),
        "Must not override an explicitly set PANGOCAIRO_BACKEND"
    );

    match original {
        Some(val) => std::env::set_var("PANGOCAIRO_BACKEND", val),
        None => std::env::remove_var("PANGOCAIRO_BACKEND"),
    }
}

// ── Fontconfig backend tests ─────────────────────────────────────

#[test]
fn test_ensure_fontconfig_backend_sets_env_on_macos() {
    let original = std::env::var("PANGOCAIRO_BACKEND").ok();
    std::env::remove_var("PANGOCAIRO_BACKEND");

    crate::ensure_fontconfig_backend();

    if cfg!(target_os = "macos") {
        assert_eq!(
            std::env::var("PANGOCAIRO_BACKEND").ok().as_deref(),
            Some("fontconfig"),
            "On macOS, must set PANGOCAIRO_BACKEND to 'fontconfig' for add_font_file() support"
        );
    }

    match original {
        Some(val) => std::env::set_var("PANGOCAIRO_BACKEND", val),
        None => std::env::remove_var("PANGOCAIRO_BACKEND"),
    }
}

#[test]
fn test_ensure_fontconfig_backend_does_not_override_explicit_setting() {
    let original = std::env::var("PANGOCAIRO_BACKEND").ok();

    std::env::set_var("PANGOCAIRO_BACKEND", "coretext");
    crate::ensure_fontconfig_backend();

    assert_eq!(
        std::env::var("PANGOCAIRO_BACKEND").ok().as_deref(),
        Some("coretext"),
        "Must not override an explicitly set PANGOCAIRO_BACKEND"
    );

    match original {
        Some(val) => std::env::set_var("PANGOCAIRO_BACKEND", val),
        None => std::env::remove_var("PANGOCAIRO_BACKEND"),
    }
}

// ── Bundled COLRv1 emoji font tests ──────────────────────────────

#[test]
fn test_bundled_emoji_font_bytes_not_empty() {
    // The Noto COLRv1 emoji font is embedded in the binary via include_bytes!.
    // It must not be empty.
    assert!(
        !crate::NOTO_COLRV1_BYTES.is_empty(),
        "Bundled Noto COLRv1 font must not be empty"
    );
}

#[test]
fn test_bundled_emoji_font_starts_with_ttf_magic() {
    // TrueType fonts start with 0x00 0x01 0x00 0x00 (TrueType outlines)
    // or 0x4F 0x54 0x54 0x4F ("OTTO" for CFF outlines).
    // Noto COLRv1 uses TrueType outlines (glyf table).
    let bytes = crate::NOTO_COLRV1_BYTES;
    assert!(
        bytes.len() > 4,
        "Font file too small to be valid"
    );
    let magic = &bytes[..4];
    assert!(
        magic == b"\x00\x01\x00\x00" || magic == b"OTTO",
        "Font file does not start with TrueType or OpenType magic bytes, got: {:?}",
        magic
    );
}

#[test]
fn test_bundled_emoji_font_has_colr_table() {
    // The font MUST contain a COLR table — that's the whole point.
    // COLR table tag = 0x434F4C52 = "COLR"
    let bytes = crate::NOTO_COLRV1_BYTES;
    // TrueType header: numTables at offset 4 (u16 big-endian)
    assert!(bytes.len() > 12, "Font too small for header");
    let num_tables = u16::from_be_bytes([bytes[4], bytes[5]]) as usize;

    // Table records start at offset 12, each record is 16 bytes
    let mut found_colr = false;
    for i in 0..num_tables {
        let offset = 12 + i * 16;
        if offset + 4 > bytes.len() {
            break;
        }
        let tag = &bytes[offset..offset + 4];
        if tag == b"COLR" {
            found_colr = true;
            break;
        }
    }
    assert!(
        found_colr,
        "Bundled emoji font must contain a COLR table for color emoji rendering"
    );
}

#[test]
fn test_extract_emoji_font_creates_file() {
    // extract_bundled_emoji_font() should write the font to a temporary location
    // and return the path.
    let dir = tempfile::tempdir().unwrap();
    let path = crate::extract_bundled_emoji_font_to(dir.path());
    assert!(path.exists(), "Extracted font file must exist at {:?}", path);
    let meta = std::fs::metadata(&path).unwrap();
    assert_eq!(
        meta.len(),
        crate::NOTO_COLRV1_BYTES.len() as u64,
        "Extracted font file size must match embedded bytes"
    );
}

#[test]
fn test_extract_emoji_font_is_idempotent() {
    // Calling extract twice should not fail and should produce the same file.
    let dir = tempfile::tempdir().unwrap();
    let path1 = crate::extract_bundled_emoji_font_to(dir.path());
    let path2 = crate::extract_bundled_emoji_font_to(dir.path());
    assert_eq!(path1, path2);
    assert!(path2.exists());
}
