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

// ─── Append-API consolidation (Gotcha #43) ────────────────────────────────────
//
// `append_to_output`, `append_styled`, and `append_multi_styled` are three
// specializations of the same operation. They MUST share a single
// implementation `append(view, text, &[tag])` to prevent drift (lesson from
// Gotchas #37, #39, #40 — "single render entry point"). The three named
// functions remain as thin wrappers (Rust has no function overloading) for
// call-site readability.

#[test]
fn test_window_has_unified_append_function() {
    let src = include_str!("../window.rs");
    assert!(
        src.contains("pub fn append(")
            && src.contains("view: &EmojiTextView")
            && src.contains("tag_names: &[&str]"),
        "window.rs must define a unified `pub fn append(view: &EmojiTextView, \
         text: &str, tag_names: &[&str])`"
    );
}

#[test]
fn test_append_to_output_delegates_to_append() {
    let src = include_str!("../window.rs");
    // Find the body of append_to_output and assert it just calls `append`.
    let start = src
        .find("pub fn append_to_output(")
        .expect("append_to_output must exist");
    let after = &src[start..];
    let body_end = after.find("\n}\n").expect("function body must end");
    let body = &after[..body_end];
    assert!(
        body.contains("append(view, text, &[])"),
        "append_to_output must delegate to `append(view, text, &[])` — got:\n{body}"
    );
}

#[test]
fn test_append_styled_delegates_to_append() {
    let src = include_str!("../window.rs");
    let start = src
        .find("pub fn append_styled(")
        .expect("append_styled must exist");
    let after = &src[start..];
    let body_end = after.find("\n}\n").expect("function body must end");
    let body = &after[..body_end];
    assert!(
        body.contains("append(view, text, &[tag_name])"),
        "append_styled must delegate to `append(view, text, &[tag_name])` — got:\n{body}"
    );
}

#[test]
fn test_append_multi_styled_delegates_to_append() {
    let src = include_str!("../window.rs");
    let start = src
        .find("pub fn append_multi_styled(")
        .expect("append_multi_styled must exist");
    let after = &src[start..];
    let body_end = after.find("\n}\n").expect("function body must end");
    let body = &after[..body_end];
    assert!(
        body.contains("append(view, text, tag_names)"),
        "append_multi_styled must delegate to `append(view, text, tag_names)` — got:\n{body}"
    );
}

#[test]
fn test_only_unified_append_contains_emoji_split_logic() {
    // The three wrappers must NOT each contain their own copy of the
    // emoji segment loop — only the unified `append` may.
    let src = include_str!("../window.rs");

    // Count occurrences of the segment-split pattern. It should appear
    // exactly once in window.rs (inside `append`).
    let pattern = "split_emoji_segments(text)";
    let count = src.matches(pattern).count();
    assert_eq!(
        count, 1,
        "`split_emoji_segments(text)` must appear exactly once in window.rs \
         (inside the unified `append`); found {count} occurrences — wrappers \
         are duplicating logic."
    );
}

#[test]
fn test_title_utf8_name() {
    assert_eq!(
        format_window_title(Some("dir"), Some("häuser & 漢字")),
        "häuser & 漢字 \u{30FB} dir \u{30FB} Chlodwig"
    );
}
