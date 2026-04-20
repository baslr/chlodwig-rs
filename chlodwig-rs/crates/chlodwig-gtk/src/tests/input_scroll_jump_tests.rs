//! Regression tests for issue #30 — Cmd+Backspace in the multi-line
//! input field caused the input ScrolledWindow to jump to the first
//! line.
//!
//! ## Root cause
//!
//! `setup_macos_input_shortcuts` in `window.rs` handled Cmd+Backspace
//! (delete-to-line-start) and Option+Backspace (delete-word-back) by
//! computing the new text and calling `buf.set_text(&new_text)` —
//! `set_text` REPLACES the entire buffer contents. As a side effect
//! GTK resets the `insert` text mark and any cached scroll position
//! inside the input's `ScrolledWindow` snaps back to offset 0 → the
//! viewport jumps to the very first line of the input.
//!
//! ## Fix
//!
//! Use a local edit (`buf.delete(&start_iter, &end_iter)`) instead of
//! `set_text`. A local delete preserves marks and the scroll position;
//! the cursor naturally lands at the start of the deleted range.
//!
//! GTK widgets cannot be instantiated in unit tests (no display
//! server), so we guard the fix at the source level.

const SRC: &str = include_str!("../window.rs");

fn extract_setup_macos_input_shortcuts() -> &'static str {
    let needle = "pub fn setup_macos_input_shortcuts(";
    let start = SRC.find(needle).expect("setup_macos_input_shortcuts must exist");
    // Find a reasonable end: the next `pub fn` or `fn` after the start.
    let after = &SRC[start + needle.len()..];
    let end_rel = after
        .find("\npub fn ")
        .or_else(|| after.find("\nfn "))
        .unwrap_or(after.len());
    &SRC[start..start + needle.len() + end_rel]
}

#[test]
fn test_cmd_backspace_does_not_use_set_text_in_input() {
    // `buf.set_text(...)` replaces the whole buffer and snaps the input
    // ScrolledWindow to the top (issue #30). The fix uses local edits.
    let block = extract_setup_macos_input_shortcuts();
    // Strip comment lines so the assertion only catches actual code.
    let code_only: String = block
        .lines()
        .filter(|l| !l.trim_start().starts_with("//"))
        .collect::<Vec<_>>()
        .join("\n");
    assert!(
        !code_only.contains("buf.set_text"),
        "setup_macos_input_shortcuts must NOT call buf.set_text(...) — \
         it resets the insert mark and scrolls the input ScrolledWindow \
         to the first line (issue #30). Use buf.delete(&start, &end) \
         instead, which is a local edit that preserves scroll position. \
         Block:\n{block}"
    );
}

#[test]
fn test_cmd_backspace_preserves_input_scroll_position() {
    // Even with `buf.delete(...)` (local edit), the input ScrolledWindow
    // still jumps to the first line because:
    //   (a) GtkAdjustment auto-clamps `value` to `[0, upper - page_size]`
    //       when `upper` shrinks after the delete, and
    //   (b) GtkTextView calls `scroll_mark_onscreen(insert_mark)` after
    //       the cursor moves to a position outside the current viewport
    //       (e.g. start of a line far above the bottom).
    //
    // The robust fix snapshots the parent ScrolledWindow's vadjustment
    // BEFORE the edit and restores it AFTER (clamped to the new range).
    let block = extract_setup_macos_input_shortcuts();
    assert!(
        block.contains("vadjustment"),
        "setup_macos_input_shortcuts must snapshot+restore the parent \
         ScrolledWindow's vadjustment around the Cmd+Backspace and \
         Option+Backspace edits, so the input scroll position does not \
         jump to the first line. Block:\n{block}"
    );
}

#[test]
fn test_cmd_backspace_uses_buffer_delete_local_edit() {
    // The fix must use buf.delete(&start, &end) for local edits.
    let block = extract_setup_macos_input_shortcuts();
    assert!(
        block.contains("buf.delete("),
        "setup_macos_input_shortcuts must use buf.delete(&start, &end) \
         for Cmd+Backspace and Option+Backspace edits, so the input \
         ScrolledWindow does not jump to the first line (issue #30)."
    );
}
