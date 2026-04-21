//! Bridge between GTK4 and the macOS system pasteboard (`NSPasteboard`).
//!
//! GTK4 on macOS uses its own `GdkClipboard`, which is **not** synchronized
//! with the system `NSPasteboard`. Without this bridge:
//!
//! * Cmd+V in Chlodwig only sees text copied within the same GTK app
//!   (text from Safari / TextEdit / Terminal is invisible).
//! * Cmd+C in Chlodwig is invisible to native macOS apps.
//!
//! This module is the **single source of truth** for "talk to the macOS
//! general pasteboard". UI modules (`window.rs`, the Cmd+C/V/X handlers,
//! the right-click "Copy" action) call [`read_string`] / [`write_string`]
//! and never reach for `NSPasteboard` directly. A unit test in
//! `tests/macos_clipboard_tests.rs` enforces this invariant.
//!
//! On non-macOS targets both functions are no-ops (`read_string` → `None`,
//! `write_string` → `false`) so callers can invoke them unconditionally
//! and fall through to `GdkClipboard` on Linux.

#[cfg(target_os = "macos")]
use objc2::rc::Retained;
#[cfg(target_os = "macos")]
use objc2::runtime::AnyObject;
#[cfg(target_os = "macos")]
use objc2::{class, msg_send};
#[cfg(target_os = "macos")]
use objc2_foundation::NSString;

/// Read the current string contents of the macOS system clipboard.
///
/// Returns `None` if the pasteboard is empty, contains a non-string type
/// (image, file URL, …), or on non-macOS targets.
#[cfg(target_os = "macos")]
pub fn read_string() -> Option<String> {
    crate::setup::ensure_appkit();
    unsafe {
        let pboard: Option<Retained<AnyObject>> =
            msg_send![class!(NSPasteboard), generalPasteboard];
        let pboard = pboard?;
        let utf8_type = NSString::from_str("public.utf8-plain-text");
        let content: Option<Retained<NSString>> =
            msg_send![&*pboard, stringForType: &*utf8_type];
        content.map(|s| s.to_string())
    }
}

/// Write `text` as plain UTF-8 onto the macOS system clipboard, replacing
/// any previous contents. Returns `true` on success.
///
/// Empty strings are a legitimate clipboard payload and round-trip
/// unchanged.
#[cfg(target_os = "macos")]
pub fn write_string(text: &str) -> bool {
    crate::setup::ensure_appkit();
    unsafe {
        let pboard: Option<Retained<AnyObject>> =
            msg_send![class!(NSPasteboard), generalPasteboard];
        let Some(pboard) = pboard else { return false };
        // [pboard clearContents] returns the new change-count.
        let _: i64 = msg_send![&*pboard, clearContents];
        let utf8_type = NSString::from_str("public.utf8-plain-text");
        let payload = NSString::from_str(text);
        // [pboard setString:text forType:NSPasteboardTypeString]
        let ok: bool = msg_send![&*pboard, setString: &*payload, forType: &*utf8_type];
        ok
    }
}

#[cfg(not(target_os = "macos"))]
pub fn read_string() -> Option<String> {
    None
}

#[cfg(not(target_os = "macos"))]
pub fn write_string(_text: &str) -> bool {
    false
}
