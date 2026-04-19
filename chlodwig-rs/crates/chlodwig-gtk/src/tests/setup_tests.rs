//! Tests for `chlodwig_gtk::setup`.
//!
//! Extracted from inline `#[cfg(test)] mod tests` in `setup.rs`. The
//! private items (`FINDER_PASTEBOARD_NAME`, `ensure_appkit`, 
//! `read_and_clear_finder_pasteboard`) used by these tests were promoted
//! to `pub(crate)` so they can be reached from this submodule.

use crate::setup::*;

// Tests that touch CWD must be serialized because they share global state.
// Use `unwrap_or_else(|e| e.into_inner())` so a panic in one test doesn't
// poison the mutex and cascade-fail all subsequent tests.
static SERIAL: std::sync::Mutex<()> = std::sync::Mutex::new(());

fn serial_lock() -> std::sync::MutexGuard<'static, ()> {
    SERIAL.lock().unwrap_or_else(|e| e.into_inner())
}

#[test]
fn test_apply_project_dir_with_valid_dir() {
    let _lock = serial_lock();
    let tmp = tempfile::tempdir().unwrap();
    // canonicalize to resolve macOS /var → /private/var symlink
    let dir = tmp.path().canonicalize().unwrap();

    // Save original CWD
    let original = std::env::current_dir().unwrap();

    std::env::set_var("CHLODWIG_PROJECT_DIR", dir.to_str().unwrap());
    let result = apply_project_dir();
    assert!(result.is_some());
    assert_eq!(std::env::current_dir().unwrap(), dir);

    // Restore
    std::env::set_current_dir(original).unwrap();
    std::env::remove_var("CHLODWIG_PROJECT_DIR");
}

#[test]
fn test_apply_project_dir_nonexistent() {
    let _lock = serial_lock();
    let original = std::env::current_dir().unwrap();

    std::env::set_var("CHLODWIG_PROJECT_DIR", "/nonexistent/path/abc123");
    let result = apply_project_dir();
    assert!(result.is_none());
    // CWD unchanged
    assert_eq!(std::env::current_dir().unwrap(), original);

    std::env::remove_var("CHLODWIG_PROJECT_DIR");
}

#[test]
fn test_apply_project_dir_not_set() {
    let _lock = serial_lock();
    std::env::remove_var("CHLODWIG_PROJECT_DIR");
    let result = apply_project_dir();
    assert!(result.is_none());
}

#[test]
fn test_apply_project_dir_from_args_no_dirs() {
    // When running tests, args don't contain directories
    // This should return None without crashing
    let result = apply_project_dir_from_args();
    // Result depends on test runner args, just verify no crash
    let _ = result;
}

// --- FinderSync pasteboard tests (macOS only) ---

/// Write a string to the custom FinderSync pasteboard (test helper).
#[cfg(target_os = "macos")]
fn write_finder_pasteboard(value: &str) {
    ensure_appkit();
    use objc2::{class, msg_send};
    use objc2::rc::Retained;
    use objc2::runtime::AnyObject;
    use objc2_foundation::NSString;

    unsafe {
        let name = NSString::from_str(FINDER_PASTEBOARD_NAME);
        let pboard: Option<Retained<AnyObject>> =
            msg_send![class!(NSPasteboard), pasteboardWithName: &*name];
        let pboard = pboard.expect("failed to get pasteboard");

        let _: i64 = msg_send![&*pboard, clearContents];
        let ns_value = NSString::from_str(value);
        let nsstring_type = NSString::from_str("public.utf8-plain-text");
        let _: bool = msg_send![&*pboard, setString: &*ns_value, forType: &*nsstring_type];
    }
}

/// Clear the custom FinderSync pasteboard (test helper).
#[cfg(target_os = "macos")]
fn clear_finder_pasteboard() {
    ensure_appkit();
    use objc2::{class, msg_send};
    use objc2::rc::Retained;
    use objc2::runtime::AnyObject;
    use objc2_foundation::NSString;

    unsafe {
        let name = NSString::from_str(FINDER_PASTEBOARD_NAME);
        let pboard: Option<Retained<AnyObject>> =
            msg_send![class!(NSPasteboard), pasteboardWithName: &*name];
        if let Some(pboard) = pboard {
            let _: i64 = msg_send![&*pboard, clearContents];
        }
    }
}

#[test]
#[cfg(target_os = "macos")]
fn test_apply_project_dir_from_finder_with_valid_pasteboard() {
    let _lock = serial_lock();
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path().canonicalize().unwrap();
    let original = std::env::current_dir().unwrap();

    write_finder_pasteboard(dir.to_str().unwrap());

    let result = apply_project_dir_from_finder();
    assert!(result.is_some());
    assert_eq!(result.unwrap(), dir);
    assert_eq!(std::env::current_dir().unwrap(), dir);

    // Restore
    std::env::set_current_dir(original).unwrap();
}

#[test]
#[cfg(target_os = "macos")]
fn test_apply_project_dir_from_finder_empty_pasteboard() {
    let _lock = serial_lock();
    let original = std::env::current_dir().unwrap();

    clear_finder_pasteboard();

    let result = apply_project_dir_from_finder();
    assert!(result.is_none());

    // CWD unchanged
    assert_eq!(std::env::current_dir().unwrap(), original);
}

#[test]
#[cfg(target_os = "macos")]
fn test_apply_project_dir_from_finder_nonexistent_path() {
    let _lock = serial_lock();
    let original = std::env::current_dir().unwrap();

    write_finder_pasteboard("/nonexistent/path/xyz789");

    let result = apply_project_dir_from_finder();
    assert!(result.is_none());

    // CWD unchanged
    assert_eq!(std::env::current_dir().unwrap(), original);
}

#[test]
#[cfg(target_os = "macos")]
fn test_apply_project_dir_from_finder_trims_whitespace() {
    let _lock = serial_lock();
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path().canonicalize().unwrap();
    let original = std::env::current_dir().unwrap();

    // Write pasteboard with trailing newline
    write_finder_pasteboard(&format!("{}\n", dir.display()));

    let result = apply_project_dir_from_finder();
    assert!(result.is_some());
    assert_eq!(result.unwrap(), dir);

    // Restore
    std::env::set_current_dir(original).unwrap();
}

#[test]
#[cfg(target_os = "macos")]
fn test_read_and_clear_finder_pasteboard_clears_after_read() {
    let _lock = serial_lock();

    write_finder_pasteboard("/tmp");

    // First read should succeed
    let first = read_and_clear_finder_pasteboard();
    assert_eq!(first, Some("/tmp".to_string()));

    // Second read should return None (pasteboard was cleared)
    let second = read_and_clear_finder_pasteboard();
    assert!(second.is_none());
}
