//! Source-level guardrails for the per-view emoji-overlay registry.
//!
//! Crash root cause (Opus analysis from
//! ~/.chlodwig-rs/crash-2026-04-19-20-26-22.0403.log):
//!   `EMOJI_ENTRIES` was a `thread_local!` static — ONE global registry
//!   shared by all `EmojiTextView` instances. With two views (final_view +
//!   streaming_view), each `snapshot()` iterated entries from the OTHER
//!   view's buffer and called `buffer.iter_at_mark(&entry.mark)` on a
//!   foreign mark → garbage line pointer → SIGSEGV in
//!   `_gtk_text_line_get_number`.
//!
//! These tests pin the proper fix: the overlay registry lives **per
//! instance** as a field of `imp::EmojiTextView`, not as a thread-local
//! static.

use std::fs;

fn read(path: &str) -> String {
    fs::read_to_string(path).unwrap_or_else(|e| panic!("read {path}: {e}"))
}

#[test]
fn test_emoji_entries_is_not_thread_local_static() {
    let src = read("src/emoji_overlay.rs");
    // Strip comments before checking — doc comments legitimately mention
    // the historical name to explain WHY it was removed.
    let code: String = src
        .lines()
        .filter(|line| !line.trim_start().starts_with("//"))
        .collect::<Vec<_>>()
        .join("\n");
    assert!(
        !code.contains("static EMOJI_ENTRIES"),
        "EMOJI_ENTRIES must not be a thread-local/static — it must be a \
         per-instance field on imp::EmojiTextView. Sharing the registry \
         across views causes cross-buffer mark dereference → SIGSEGV in \
         gtk_text_line_get_number (see crash-2026-04-19-20-26-22.0403.log)."
    );
    assert!(
        !code.contains("thread_local!"),
        "emoji_overlay.rs must not use thread_local! for the overlay registry."
    );
}

#[test]
fn test_imp_emoji_text_view_has_entries_field() {
    let src = read("src/emoji_overlay.rs");

    // Locate `mod imp { ... }` block.
    let imp_start = src
        .find("mod imp {")
        .expect("emoji_overlay.rs must contain `mod imp {`");
    let after = &src[imp_start..];
    let mut depth = 0i32;
    let mut end = 0usize;
    for (i, ch) in after.char_indices() {
        match ch {
            '{' => depth += 1,
            '}' => {
                depth -= 1;
                if depth == 0 {
                    end = i + 1;
                    break;
                }
            }
            _ => {}
        }
    }
    assert!(end > 0, "could not find end of `mod imp` block");
    let body = &after[..end];

    assert!(
        body.contains("pub struct EmojiTextView {"),
        "imp must define `pub struct EmojiTextView {{ ... }}`"
    );
    assert!(
        body.contains("entries:") || body.contains("pub entries:"),
        "imp::EmojiTextView must have an `entries: RefCell<Vec<EmojiEntry>>` \
         field (per-instance overlay registry)."
    );
    assert!(
        body.contains("Vec<EmojiEntry>"),
        "imp::EmojiTextView must store its overlays as `Vec<EmojiEntry>`."
    );
}

#[test]
fn test_emoji_text_view_has_inherent_insert_emoji_method() {
    let src = read("src/emoji_overlay.rs");
    let impl_start = src
        .find("impl EmojiTextView {")
        .expect("emoji_overlay.rs must contain `impl EmojiTextView {`");
    let after = &src[impl_start..];
    let mut depth = 0i32;
    let mut end = 0usize;
    for (i, ch) in after.char_indices() {
        match ch {
            '{' => depth += 1,
            '}' => {
                depth -= 1;
                if depth == 0 {
                    end = i + 1;
                    break;
                }
            }
            _ => {}
        }
    }
    assert!(end > 0);
    let body = &after[..end];
    assert!(
        body.contains("fn insert_emoji"),
        "impl EmojiTextView must define inherent `insert_emoji` method."
    );
    assert!(
        body.contains("fn clear_overlays"),
        "impl EmojiTextView must define inherent `clear_overlays` method \
         (per-instance, replaces the free function)."
    );
    assert!(
        body.contains("fn clear_overlays_from"),
        "impl EmojiTextView must define inherent `clear_overlays_from` method."
    );
}

#[test]
fn test_no_free_emoji_overlay_functions() {
    // The free functions that take a `&TextBuffer` first arg must be gone —
    // every entry point goes through an `EmojiTextView` method so registry
    // access is always scoped to a specific view. We detect "free function"
    // by the `&gtk4::TextBuffer` first-parameter signature; the inherent
    // method on the subclass takes `&self` and won't match.
    let src = read("src/emoji_overlay.rs");
    assert!(
        !src.contains("pub fn insert_emoji(\n    buffer:")
            && !src.contains("pub fn insert_emoji(buffer:"),
        "emoji_overlay.rs must not expose a free `insert_emoji(buffer, …)` \
         function — use the `EmojiTextView::insert_emoji` method."
    );
    assert!(
        !src.contains("pub fn clear_overlays(buffer:")
            && !src.contains("pub fn clear_overlays(\n    buffer:"),
        "emoji_overlay.rs must not expose a free `clear_overlays(buffer)` \
         function — use the `EmojiTextView::clear_overlays` method."
    );
    assert!(
        !src.contains("pub fn clear_overlays_from(buffer:")
            && !src.contains("pub fn clear_overlays_from(\n    buffer:"),
        "emoji_overlay.rs must not expose a free `clear_overlays_from(buffer, …)` \
         function — use the `EmojiTextView::clear_overlays_from` method."
    );
}

#[test]
fn test_window_call_site_uses_view_method_form() {
    let src = read("src/window.rs");
    assert!(
        src.contains("view.insert_emoji("),
        "window.rs::insert_emoji_as_overlay must call \
         `view.insert_emoji(...)` (the per-view method)."
    );
}

#[test]
fn test_clear_overlays_callers_use_view_methods() {
    // Every `clear_overlays_from(...)` / `clear_overlays(...)` call site
    // must now be a method call on a view, not a free function call.
    for (path, _label) in &[
        ("src/render.rs", "render"),
        ("src/restore.rs", "restore"),
        ("src/menu.rs", "menu"),
        ("src/submit.rs", "submit"),
    ] {
        let src = read(path);
        assert!(
            !src.contains("emoji_overlay::clear_overlays_from(")
                && !src.contains("emoji_overlay::clear_overlays("),
            "{path} must not call free `emoji_overlay::clear_overlays*` \
             functions — they must be methods on the view."
        );
    }
}
