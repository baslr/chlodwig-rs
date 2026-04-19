//! First-launch setup for Chlodwig.app on macOS.
//!
//! - Sets the working directory from `CHLODWIG_PROJECT_DIR` env var
//!   (passed by `gtk_release.sh` via `open --env`).
//! - Sets the working directory from CLI arguments (macOS "Open With"
//!   passes the folder path as argument).

/// Set the process working directory to `CHLODWIG_PROJECT_DIR` if set.
///
/// The `gtk_release.sh` script passes this env var via
/// `open --env CHLODWIG_PROJECT_DIR=/path/to/project`. Without it,
/// macOS launches `.app` bundles with CWD `/`.
///
/// Returns the directory that was set, or `None` if the env var was absent
/// or the directory didn't exist.
pub fn apply_project_dir() -> Option<std::path::PathBuf> {
    let dir = std::env::var("CHLODWIG_PROJECT_DIR").ok()?;
    let path = std::path::PathBuf::from(&dir);
    if path.is_dir() {
        match std::env::set_current_dir(&path) {
            Ok(()) => {
                tracing::info!("Set working directory to {}", path.display());
                Some(path)
            }
            Err(e) => {
                tracing::warn!("Failed to chdir to {}: {e}", path.display());
                None
            }
        }
    } else {
        tracing::warn!(
            "CHLODWIG_PROJECT_DIR={} does not exist or is not a directory",
            path.display()
        );
        None
    }
}

/// Pasteboard name used by the FinderSync extension to pass the target
/// directory to the app. The extension writes the path to a custom
/// NSPasteboard before launching the app; the app reads and clears it on
/// startup.
///
/// NSPasteboard(name:) is cross-process IPC — not file I/O. It works from
/// sandboxed extensions without TCC dialogs, and the unsandboxed host app
/// can read it freely. The pasteboard name is unique to avoid collisions
/// with the system clipboard or other apps.
pub(crate) const FINDER_PASTEBOARD_NAME: &str = "rs.chlodwig.finder-open";

/// Ensure AppKit framework is loaded so NSPasteboard is available.
///
/// GTK loads AppKit automatically when the app starts, but in unit tests
/// or early startup the framework may not be loaded yet.  This uses
/// `dlopen` via `Once` so the cost is zero after the first call.
#[cfg(target_os = "macos")]
pub(crate) fn ensure_appkit() {
    use std::sync::Once;
    static LOAD: Once = Once::new();
    LOAD.call_once(|| unsafe {
        libc::dlopen(
            c"/System/Library/Frameworks/AppKit.framework/AppKit".as_ptr(),
            libc::RTLD_LAZY,
        );
    });
}

/// Read the project directory from the FinderSync custom pasteboard.
///
/// The FinderSync extension writes the target directory path to a custom
/// NSPasteboard named `rs.chlodwig.finder-open` before launching the app.
///
/// The pasteboard content is cleared after reading to avoid stale state
/// on subsequent launches.
///
/// Returns the directory that was set, or `None` if the pasteboard was empty
/// or pointed to a non-existent directory.
pub fn apply_project_dir_from_finder() -> Option<std::path::PathBuf> {
    let dir_str = read_and_clear_finder_pasteboard()?;
    let dir = dir_str.trim();
    if dir.is_empty() {
        tracing::warn!("Finder pasteboard was empty");
        return None;
    }

    let path = std::path::PathBuf::from(dir);
    if path.is_dir() {
        match std::env::set_current_dir(&path) {
            Ok(()) => {
                tracing::info!(
                    "Set working directory from Finder pasteboard: {}",
                    path.display()
                );
                Some(path)
            }
            Err(e) => {
                tracing::warn!(
                    "Failed to chdir to {} (from Finder pasteboard): {e}",
                    path.display()
                );
                None
            }
        }
    } else {
        tracing::warn!(
            "Finder pasteboard path {} does not exist or is not a directory",
            path.display()
        );
        None
    }
}

/// Read and clear the custom FinderSync pasteboard via NSPasteboard API.
///
/// Uses Objective-C runtime calls via `objc2` to:
/// 1. Open the named pasteboard `rs.chlodwig.finder-open`
/// 2. Read the string content
/// 3. Clear the pasteboard (to prevent stale reads on next launch)
///
/// Returns `None` if the pasteboard is empty or the read fails.
#[cfg(target_os = "macos")]
pub(crate) fn read_and_clear_finder_pasteboard() -> Option<String> {
    use objc2::rc::Retained;
    use objc2::runtime::AnyObject;
    use objc2::{class, msg_send};
    use objc2_foundation::NSString;

    // Ensure AppKit is loaded so `class!(NSPasteboard)` works.
    // In the full app GTK loads AppKit automatically, but in unit tests
    // or early startup the framework may not be loaded yet.
    ensure_appkit();

    unsafe {
        // NSPasteboard *pboard = [NSPasteboard pasteboardWithName:@"rs.chlodwig.finder-open"];
        let name = NSString::from_str(FINDER_PASTEBOARD_NAME);
        let pboard: Option<Retained<AnyObject>> =
            msg_send![class!(NSPasteboard), pasteboardWithName: &*name];
        let pboard = pboard?;

        // NSString *content = [pboard stringForType:NSPasteboardTypeString];
        let nsstring_type = NSString::from_str("public.utf8-plain-text");
        let content: Option<Retained<NSString>> =
            msg_send![&*pboard, stringForType: &*nsstring_type];

        // [pboard clearContents];
        let _: i64 = msg_send![&*pboard, clearContents];

        content.map(|s| s.to_string())
    }
}

#[cfg(not(target_os = "macos"))]
pub(crate) fn read_and_clear_finder_pasteboard() -> Option<String> {
    None
}

/// Set the process working directory from CLI arguments.
///
/// macOS "Open With" passes the folder path as a CLI argument.
/// This is called before GTK init, so we check `std::env::args()`.
///
/// Returns the directory that was set, or `None` if no valid folder arg found.
pub fn apply_project_dir_from_args() -> Option<std::path::PathBuf> {
    // Skip the first arg (binary path). Look for a directory path.
    let args: Vec<String> = std::env::args().collect();
    for arg in args.iter().skip(1) {
        if arg.starts_with('-') {
            continue;
        }
        let path = std::path::PathBuf::from(arg);
        if path.is_dir() {
            match std::env::set_current_dir(&path) {
                Ok(()) => {
                    tracing::info!("Set working directory from arg: {}", path.display());
                    return Some(path);
                }
                Err(e) => {
                    tracing::warn!("Failed to chdir to {}: {e}", path.display());
                }
            }
        }
    }
    None
}
