//! Tests for `chlodwig_gtk::window::format_window_title`.
//!
//! Extracted from inline `#[cfg(test)] mod tests` in `window.rs` so the
//! production file stays focused on widget plumbing.

use crate::window::format_window_title;

#[test]
fn test_title_chlodwig_only() {
    assert_eq!(format_window_title(None, None), "Chlodwig");
}

#[test]
fn test_title_with_cwd() {
    assert_eq!(
        format_window_title(Some("chlodwig-rs"), None),
        "chlodwig-rs \u{30FB} Chlodwig"
    );
}

#[test]
fn test_title_with_name_and_cwd() {
    assert_eq!(
        format_window_title(Some("chlodwig-rs"), Some("refactor sessions")),
        "refactor sessions \u{30FB} chlodwig-rs \u{30FB} Chlodwig"
    );
}

#[test]
fn test_title_with_name_only() {
    assert_eq!(
        format_window_title(None, Some("refactor")),
        "refactor \u{30FB} Chlodwig"
    );
}

#[test]
fn test_title_uses_katakana_middle_dot() {
    let title = format_window_title(Some("foo"), Some("bar"));
    assert!(title.contains('\u{30FB}'), "must use U+30FB Katakana middle dot");
    assert!(!title.contains(" - "), "must not use ASCII hyphen");
}

#[test]
fn test_title_empty_name_omitted() {
    assert_eq!(
        format_window_title(Some("cwd"), Some("")),
        "cwd \u{30FB} Chlodwig"
    );
}

#[test]
fn test_title_utf8_name() {
    assert_eq!(
        format_window_title(Some("dir"), Some("häuser & 漢字")),
        "häuser & 漢字 \u{30FB} dir \u{30FB} Chlodwig"
    );
}
