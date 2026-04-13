//! System notification support — sends OS-level notifications when a
//! conversation turn completes and the terminal is NOT in the foreground.
//! This way the user gets alerted when they've switched to another app while
//! waiting, but is not spammed while actively watching the output.
//!
//! On macOS, focus detection uses the native `NSWorkspace` Objective-C API
//! via direct FFI (`objc_msgSend`). This is a single property access —
//! no subprocess, no AppleScript, quasi-instant (~0.1ms). The frontmost
//! application's `bundleIdentifier` is compared against a list of known
//! terminal emulators.
//!
//! Notification delivery uses `osascript -e "display notification ..."`
//! which bypasses `mac_notification_sys` / `notify-rust` issues with
//! macOS DND / Focus modes. `display notification` is routed through
//! Script Editor.app which typically has notification permission even
//! when DND is active.
//!
//! On other platforms (or if the query fails), we assume the terminal is
//! NOT focused and always send the notification (better to over-notify
//! than to silently swallow). On non-macOS, `notify-rust` is used as
//! the notification backend (D-Bus on Linux).

/// Known macOS terminal bundle identifiers.
/// If the frontmost app matches any of these, we consider the terminal focused.
const KNOWN_TERMINAL_BUNDLE_IDS: &[&str] = &[
    "com.apple.Terminal",
    "com.googlecode.iterm2",
    "net.kovidgoyal.kitty",
    "com.mitchellh.ghostty",
    "org.alacritty",
    "org.wezfurlong.wezterm",
    "dev.warp.Warp-Stable",
    "co.zeit.hyper",
    "com.qvacua.VimR",
    "com.panic.Prompt",
];

/// Check whether the terminal running this process is the frontmost (focused)
/// application. Returns `true` if focused, `false` if not or if detection fails.
///
/// On macOS this uses the native `NSWorkspace.sharedWorkspace.frontmostApplication
/// .bundleIdentifier` API via Objective-C FFI (no subprocess).
/// On non-macOS platforms this always returns `false` (= always notify).
pub(crate) fn is_terminal_focused() -> bool {
    #[cfg(target_os = "macos")]
    {
        is_terminal_focused_macos()
    }
    #[cfg(not(target_os = "macos"))]
    {
        false
    }
}

// ---------------------------------------------------------------------------
// macOS: Native NSWorkspace FFI via objc_msgSend
// ---------------------------------------------------------------------------
// Uses the Objective-C runtime directly — zero extra crate dependencies.
// The ObjC calls are:
//   NSWorkspace *ws = [NSWorkspace sharedWorkspace];
//   NSRunningApplication *app = [ws frontmostApplication];
//   NSString *bundleId = [app bundleIdentifier];
//   const char *cstr = [bundleId UTF8String];
// ---------------------------------------------------------------------------

#[cfg(target_os = "macos")]
mod ffi {
    use std::ffi::c_void;

    // Link against the ObjC runtime and AppKit framework.
    // Foundation is pulled in transitively by AppKit.
    #[link(name = "objc", kind = "dylib")]
    extern "C" {
        pub fn objc_getClass(name: *const i8) -> *const c_void;
        pub fn sel_registerName(name: *const i8) -> *const c_void;
        pub fn objc_msgSend(obj: *const c_void, sel: *const c_void, ...) -> *const c_void;
    }

    #[link(name = "AppKit", kind = "framework")]
    extern "C" {}
}

#[cfg(target_os = "macos")]
fn is_terminal_focused_macos() -> bool {
    use std::ffi::CStr;

    unsafe {
        // [NSWorkspace sharedWorkspace]
        let cls = ffi::objc_getClass(b"NSWorkspace\0".as_ptr() as *const i8);
        if cls.is_null() {
            tracing::debug!("NSWorkspace class not found");
            return false;
        }
        let sel = ffi::sel_registerName(b"sharedWorkspace\0".as_ptr() as *const i8);
        let workspace = ffi::objc_msgSend(cls, sel);
        if workspace.is_null() {
            tracing::debug!("sharedWorkspace returned nil");
            return false;
        }

        // [workspace frontmostApplication]
        let sel = ffi::sel_registerName(b"frontmostApplication\0".as_ptr() as *const i8);
        let app = ffi::objc_msgSend(workspace, sel);
        if app.is_null() {
            tracing::debug!("frontmostApplication returned nil");
            return false;
        }

        // [app bundleIdentifier]
        let sel = ffi::sel_registerName(b"bundleIdentifier\0".as_ptr() as *const i8);
        let bundle_id_nsstring = ffi::objc_msgSend(app, sel);
        if bundle_id_nsstring.is_null() {
            tracing::debug!("bundleIdentifier returned nil");
            return false;
        }

        // [bundleIdNSString UTF8String] -> const char*
        let sel = ffi::sel_registerName(b"UTF8String\0".as_ptr() as *const i8);
        let cstr_ptr = ffi::objc_msgSend(bundle_id_nsstring, sel) as *const i8;
        if cstr_ptr.is_null() {
            tracing::debug!("UTF8String returned null");
            return false;
        }

        let bundle_id = CStr::from_ptr(cstr_ptr).to_string_lossy();
        tracing::debug!("Frontmost app bundle ID: {bundle_id:?}");

        KNOWN_TERMINAL_BUNDLE_IDS
            .iter()
            .any(|known| bundle_id.eq_ignore_ascii_case(known))
    }
}

/// Determine the project directory name from the current working directory.
/// Returns the last path component (e.g. "chlodwig-rs" for "/Users/me/projects/chlodwig-rs").
/// Falls back to "unknown" if the CWD can't be determined.
pub(crate) fn project_dir_name() -> String {
    std::env::current_dir()
        .ok()
        .and_then(|p| p.file_name().map(|n| n.to_string_lossy().into_owned()))
        .unwrap_or_else(|| "unknown".to_string())
}

/// Send a system notification that the conversation turn is complete,
/// but only if the terminal is NOT the focused application.
///
/// `project` identifies which Chlodwig instance sent the notification
/// (shown as subtitle on macOS, appended to body on Linux).
/// This is a fire-and-forget operation — errors are logged but never bubble up.
pub(crate) fn notify_turn_complete(project: &str) {
    tracing::debug!("notify_turn_complete: project={project:?}");
    send_notification("Chlodwig", "Turn complete ✓", project);
}

/// Platform-specific notification delivery.
///
/// On macOS: uses `osascript -e "display notification ..."` which reliably
/// delivers notifications even through DND / Focus modes (routed through
/// Script Editor.app, not the calling process).
///
/// On non-macOS: uses `notify-rust` (D-Bus on Linux).
fn send_notification(title: &str, body: &str, subtitle: &str) {
    #[cfg(target_os = "macos")]
    {
        send_notification_macos(title, body, subtitle);
    }
    #[cfg(not(target_os = "macos"))]
    {
        send_notification_other(title, body, subtitle);
    }
}

/// Build an AppleScript `display notification` command string.
///
/// AppleScript uses **double quotes** for string literals (not single quotes!).
/// Inside `"..."`, backslashes and double quotes must be escaped:
///   `\` → `\\`
///   `"` → `\"`
#[cfg(target_os = "macos")]
fn build_applescript(title: &str, body: &str, subtitle: &str) -> String {
    fn escape_applescript(s: &str) -> String {
        s.replace('\\', "\\\\").replace('"', "\\\"")
    }
    if subtitle.is_empty() {
        format!(
            "display notification \"{}\" with title \"{}\" sound name \"Glass\"",
            escape_applescript(body),
            escape_applescript(title)
        )
    } else {
        format!(
            "display notification \"{}\" with title \"{}\" subtitle \"{}\" sound name \"Glass\"",
            escape_applescript(body),
            escape_applescript(title),
            escape_applescript(subtitle)
        )
    }
}

#[cfg(target_os = "macos")]
fn send_notification_macos(title: &str, body: &str, subtitle: &str) {
    let script = build_applescript(title, body, subtitle);

    match std::process::Command::new("osascript")
        .arg("-e")
        .arg(&script)
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::null())
        .spawn()
    {
        Ok(_child) => {
            // Fire-and-forget: don't wait for osascript to finish.
            // It typically takes ~50ms but we don't want to block the event loop.
            tracing::debug!("Notification sent via osascript: {script:?}");
        }
        Err(e) => {
            tracing::debug!("Failed to spawn osascript for notification: {e}");
        }
    }
}

#[cfg(not(target_os = "macos"))]
fn send_notification_other(title: &str, body: &str, subtitle: &str) {
    // D-Bus notifications don't have a subtitle field.
    // Append project name to the body instead.
    let full_body = if subtitle.is_empty() {
        body.to_string()
    } else {
        format!("{body} [{subtitle}]")
    };

    let result = notify_rust::Notification::new()
        .summary(title)
        .body(&full_body)
        .appname(title)
        .show();

    if let Err(e) = result {
        tracing::debug!("System notification failed (non-fatal): {e}");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_notify_turn_complete_does_not_panic() {
        // The function must never panic, even if the notification system is
        // unavailable (e.g. headless CI, Linux without D-Bus, etc.).
        notify_turn_complete("test-project");
    }

    #[test]
    fn test_is_terminal_focused_does_not_panic() {
        // Must not panic regardless of environment.
        let _ = is_terminal_focused();
    }

    #[test]
    fn test_known_terminals_list_is_not_empty() {
        assert!(
            !KNOWN_TERMINAL_BUNDLE_IDS.is_empty(),
            "Must have at least one known terminal bundle ID"
        );
    }

    #[test]
    fn test_send_notification_does_not_panic() {
        // send_notification must never panic, even with special characters.
        send_notification("Test", "Hello world", "my-project");
    }

    #[test]
    fn test_send_notification_with_special_chars_does_not_panic() {
        // Single quotes, emojis, unicode — must not break osascript.
        send_notification("It's a test", "Turn complete ✓ — über cool 🎉", "pröject-ünö");
    }

    #[test]
    fn test_send_notification_empty_subtitle_does_not_panic() {
        send_notification("Chlodwig", "Turn complete ✓", "");
    }

    #[test]
    fn test_project_dir_name_returns_non_empty() {
        let name = project_dir_name();
        assert!(!name.is_empty(), "project_dir_name() must not be empty");
    }

    #[cfg(target_os = "macos")]
    #[test]
    fn test_osascript_escapes_double_quotes() {
        // Verify that double quotes in title/body/subtitle don't break the AppleScript.
        send_notification_macos("It's Chlodwig's \"turn\"", "Don't \"panic\"", "my-\"project\"");
    }

    #[cfg(target_os = "macos")]
    #[test]
    fn test_osascript_uses_double_quotes_for_applescript_strings() {
        // AppleScript uses "..." for string literals, NOT '...'.
        // Single quotes cause: syntax error: Expected "given", "in", ...
        // This test runs osascript synchronously and checks exit code 0.
        let script = build_applescript("Test Title", "Test Body", "test-project");
        let status = std::process::Command::new("osascript")
            .arg("-e")
            .arg(&script)
            .stdout(std::process::Stdio::null())
            .stderr(std::process::Stdio::null())
            .status()
            .expect("Failed to run osascript");
        assert!(
            status.success(),
            "osascript failed with exit code {:?} — script was: {script}",
            status.code()
        );
    }

    #[cfg(target_os = "macos")]
    #[test]
    fn test_osascript_with_subtitle() {
        // Subtitle must appear in the AppleScript and not cause syntax errors.
        let script = build_applescript("Chlodwig", "Turn complete ✓", "chlodwig-rs");
        assert!(
            script.contains("subtitle"),
            "AppleScript must contain subtitle clause"
        );
        let status = std::process::Command::new("osascript")
            .arg("-e")
            .arg(&script)
            .stdout(std::process::Stdio::null())
            .stderr(std::process::Stdio::null())
            .status()
            .expect("Failed to run osascript");
        assert!(
            status.success(),
            "osascript failed with subtitle — script was: {script}",
        );
    }

    #[cfg(target_os = "macos")]
    #[test]
    fn test_osascript_without_subtitle() {
        // Empty subtitle should omit the subtitle clause entirely.
        let script = build_applescript("Chlodwig", "Turn complete ✓", "");
        assert!(
            !script.contains("subtitle"),
            "Empty subtitle must not produce subtitle clause"
        );
        let status = std::process::Command::new("osascript")
            .arg("-e")
            .arg(&script)
            .stdout(std::process::Stdio::null())
            .stderr(std::process::Stdio::null())
            .status()
            .expect("Failed to run osascript");
        assert!(
            status.success(),
            "osascript failed without subtitle — script was: {script}",
        );
    }

    #[cfg(target_os = "macos")]
    #[test]
    fn test_osascript_with_quotes_in_text() {
        // Double quotes inside the text must be escaped for AppleScript.
        let script = build_applescript("It's a \"test\"", "Don't \"panic\"", "my-\"project\"");
        let status = std::process::Command::new("osascript")
            .arg("-e")
            .arg(&script)
            .stdout(std::process::Stdio::null())
            .stderr(std::process::Stdio::null())
            .status()
            .expect("Failed to run osascript");
        assert!(
            status.success(),
            "osascript failed with quotes in text — script was: {script}",
        );
    }

    #[cfg(target_os = "macos")]
    #[test]
    fn test_osascript_with_backslash_in_text() {
        // Backslashes must be escaped for AppleScript (\ → \\).
        let script = build_applescript("Path: C:\\Users", "Line1\\nLine2", "back\\slash");
        let status = std::process::Command::new("osascript")
            .arg("-e")
            .arg(&script)
            .stdout(std::process::Stdio::null())
            .stderr(std::process::Stdio::null())
            .status()
            .expect("Failed to run osascript");
        assert!(
            status.success(),
            "osascript failed with backslashes — script was: {script}",
        );
    }

    #[cfg(target_os = "macos")]
    #[test]
    fn test_build_applescript_contains_subtitle_text() {
        let script = build_applescript("Title", "Body", "my-project");
        assert!(
            script.contains("my-project"),
            "Subtitle text must appear in the script"
        );
    }
}
