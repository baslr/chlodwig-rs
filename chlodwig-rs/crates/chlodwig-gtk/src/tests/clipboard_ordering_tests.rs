//! Tests for Cmd+C producing a plain-text NSPasteboard entry that
//! native macOS apps (Spotlight, TextEdit, Safari) can paste.
//!
//! ## Symptom before fix
//!
//! Cmd+C worked *inside* Chlodwig (Cmd+V from input pasted the text)
//! but external apps pasted nothing. Reported by the user: "Spotlight
//! doesn't see the output I copied from the prompt output".
//!
//! ## Root cause
//!
//! We used to write NSPasteboard *before* calling
//! `emit_copy_clipboard()`. The default handler of that signal routes
//! through `GdkMacosClipboard::set_content()`, which calls
//! `[NSPasteboard clearContents]` and installs a provider/promise item.
//! External apps see the promise instead of our clean plain-text string
//! and paste nothing.
//!
//! ## Fix (single source of truth)
//!
//! Our NSPasteboard write must happen **after** GTK's default handler.
//! For the key handler that's a simple source-order swap
//! (`emit_copy_clipboard()` first, `write_selection_to_macos_clipboard`
//! second). For the right-click `connect_copy_clipboard` signal hook
//! — where we cannot call GTK's default handler ourselves because it
//! runs after our callback returns — we defer the NSPasteboard write
//! via `glib::idle_add_local_once` so it runs AFTER the default handler
//! finishes mutating the pasteboard.
//!
//! The source-grep tests below enforce the ordering invariant that
//! caused the bug so we never regress.

#[test]
fn test_cmd_c_arm_writes_nspasteboard_after_emit_copy_clipboard() {
    // GTK's default copy-clipboard handler (GdkMacosClipboard) CLEARS
    // NSPasteboard and installs a provider-backed item. Our plain-text
    // write must happen AFTER, not before — otherwise it gets wiped.
    let src = include_str!("../window.rs");
    let cmd_c_idx = src
        .find("k if k == gtk4::gdk::Key::c || k == gtk4::gdk::Key::C =>")
        .expect("Cmd+C arm must exist");
    let arm = &src[cmd_c_idx..cmd_c_idx + 1500];
    let emit_pos = arm
        .find(".emit_copy_clipboard()")
        .expect("Cmd+C arm must call emit_copy_clipboard()");
    let write_pos = arm
        .find("write_selection_to_macos_clipboard(")
        .expect("Cmd+C arm must call write_selection_to_macos_clipboard()");
    assert!(
        emit_pos < write_pos,
        "Cmd+C arm must call emit_copy_clipboard() BEFORE \
         write_selection_to_macos_clipboard(...) — otherwise GTK's \
         default handler overwrites our plain-text NSPasteboard entry \
         and external apps (Spotlight, TextEdit) paste nothing. \
         (emit at {emit_pos}, write at {write_pos})"
    );
}

#[test]
fn test_cmd_x_arm_writes_nspasteboard_after_emit_cut_clipboard() {
    // Same ordering constraint for Cmd+X.
    let src = include_str!("../window.rs");
    let cmd_x_idx = src
        .find("k if k == gtk4::gdk::Key::x || k == gtk4::gdk::Key::X =>")
        .expect("Cmd+X arm must exist");
    let arm = &src[cmd_x_idx..cmd_x_idx + 1500];
    let emit_pos = arm
        .find(".emit_cut_clipboard()")
        .expect("Cmd+X arm must call emit_cut_clipboard()");
    let write_pos = arm
        .find("write_selection_to_macos_clipboard(")
        .expect("Cmd+X arm must call write_selection_to_macos_clipboard()");
    assert!(
        emit_pos < write_pos,
        "Cmd+X arm must call emit_cut_clipboard() BEFORE \
         write_selection_to_macos_clipboard(...). Same reason as \
         Cmd+C — see test_cmd_c_arm_writes_nspasteboard_after_emit_copy_clipboard."
    );
}

#[test]
fn test_copy_clipboard_signal_handler_defers_nspasteboard_write() {
    // `connect_copy_clipboard` fires BEFORE GTK's default handler. If
    // we write NSPasteboard inside the callback synchronously, GTK's
    // default handler then overwrites it. Defer via idle_add_local_once
    // so our write lands AFTER the default handler returns.
    let src = include_str!("../tab/ai_conversation.rs");
    // Find the on_copy closure body that connect_copy_clipboard uses.
    let on_copy_idx = src
        .find("let on_copy =")
        .expect("ai_conversation.rs must define on_copy closure");
    let closure = &src[on_copy_idx..on_copy_idx + 1500];
    assert!(
        closure.contains("idle_add_local_once")
            && closure.contains("write_selection_to_macos_clipboard"),
        "on_copy closure must schedule write_selection_to_macos_clipboard \
         via glib::idle_add_local_once so it runs AFTER GTK's default \
         copy-clipboard handler (GdkMacosClipboard::set_content). \
         Running it synchronously lets the default handler wipe our \
         plain-text entry — Spotlight then sees nothing."
    );
}
