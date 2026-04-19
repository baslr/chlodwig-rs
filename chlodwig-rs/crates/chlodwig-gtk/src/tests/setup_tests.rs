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

// ── Pure resolver tests (Stage 0.2 of MULTIWINDOW_TABS.md) ────────────
// New resolve_* functions return the resolved path WITHOUT calling
// set_current_dir(). This is the foundation for per-tab CWD.

#[test]
fn test_resolve_project_dir_with_valid_dir_does_not_change_cwd() {
    let _lock = serial_lock();
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path().canonicalize().unwrap();
    let original_cwd = std::env::current_dir().unwrap();

    std::env::set_var("CHLODWIG_PROJECT_DIR", dir.to_str().unwrap());
    let result = resolve_project_dir();
    std::env::remove_var("CHLODWIG_PROJECT_DIR");

    assert_eq!(result, Some(dir));
    // Process CWD must be untouched.
    assert_eq!(std::env::current_dir().unwrap(), original_cwd);
}

#[test]
fn test_resolve_project_dir_nonexistent_returns_none() {
    let _lock = serial_lock();
    let original = std::env::current_dir().unwrap();

    std::env::set_var("CHLODWIG_PROJECT_DIR", "/nonexistent/path/abc123");
    let result = resolve_project_dir();
    std::env::remove_var("CHLODWIG_PROJECT_DIR");

    assert!(result.is_none());
    assert_eq!(std::env::current_dir().unwrap(), original);
}

#[test]
fn test_resolve_project_dir_not_set_returns_none() {
    let _lock = serial_lock();
    std::env::remove_var("CHLODWIG_PROJECT_DIR");
    let result = resolve_project_dir();
    assert!(result.is_none());
}

#[test]
fn test_resolve_project_dir_from_args_no_dirs() {
    // When running tests, args don't contain directories.
    let result = resolve_project_dir_from_args();
    let _ = result;
}

#[test]
#[cfg(target_os = "macos")]
fn test_resolve_project_dir_from_finder_does_not_change_cwd() {
    let _lock = serial_lock();
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path().canonicalize().unwrap();
    let original_cwd = std::env::current_dir().unwrap();

    write_finder_pasteboard(dir.to_str().unwrap());

    let result = resolve_project_dir_from_finder();
    assert_eq!(result, Some(dir));
    // CWD must be unchanged.
    assert_eq!(std::env::current_dir().unwrap(), original_cwd);
}

#[test]
#[cfg(target_os = "macos")]
fn test_resolve_project_dir_from_finder_empty_pasteboard() {
    let _lock = serial_lock();
    let original = std::env::current_dir().unwrap();
    clear_finder_pasteboard();

    let result = resolve_project_dir_from_finder();
    assert!(result.is_none());
    assert_eq!(std::env::current_dir().unwrap(), original);
}

#[test]
#[cfg(target_os = "macos")]
fn test_resolve_project_dir_from_finder_nonexistent_returns_none() {
    let _lock = serial_lock();
    let original = std::env::current_dir().unwrap();
    write_finder_pasteboard("/nonexistent/path/xyz789");

    let result = resolve_project_dir_from_finder();
    assert!(result.is_none());
    assert_eq!(std::env::current_dir().unwrap(), original);
}

#[test]
#[cfg(target_os = "macos")]
fn test_resolve_project_dir_from_finder_trims_whitespace() {
    let _lock = serial_lock();
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path().canonicalize().unwrap();

    write_finder_pasteboard(&format!("{}\n", dir.display()));

    let result = resolve_project_dir_from_finder();
    assert_eq!(result, Some(dir));
}

// ── resolve_initial_cwd: priority + fallback ──────────────────────────

/// Priority: Finder pasteboard > CHLODWIG_PROJECT_DIR > CLI args > process CWD.
/// All resolvers must run without side effects on the process CWD.
#[test]
fn test_resolve_initial_cwd_prefers_env_over_process_cwd() {
    let _lock = serial_lock();
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path().canonicalize().unwrap();
    let original_cwd = std::env::current_dir().unwrap();

    // Make sure no Finder pasteboard interferes.
    #[cfg(target_os = "macos")]
    clear_finder_pasteboard();

    std::env::set_var("CHLODWIG_PROJECT_DIR", dir.to_str().unwrap());
    let result = resolve_initial_cwd();
    std::env::remove_var("CHLODWIG_PROJECT_DIR");

    assert_eq!(result, dir);
    assert_eq!(std::env::current_dir().unwrap(), original_cwd);
}

#[test]
fn test_resolve_initial_cwd_falls_back_to_process_cwd() {
    let _lock = serial_lock();
    std::env::remove_var("CHLODWIG_PROJECT_DIR");
    #[cfg(target_os = "macos")]
    clear_finder_pasteboard();

    let original = std::env::current_dir().unwrap();
    let result = resolve_initial_cwd();
    // Either the test process CWD or a directory found in CLI args.
    // At minimum: result must be a real directory, and CWD must be unchanged.
    assert!(result.is_dir(), "result {:?} should be a directory", result);
    assert_eq!(std::env::current_dir().unwrap(), original);
}

