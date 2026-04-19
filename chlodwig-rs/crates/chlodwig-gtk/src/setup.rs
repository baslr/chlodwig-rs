//! First-launch setup for Chlodwig.app on macOS.
//!
//! - Resolves the working directory from `CHLODWIG_PROJECT_DIR` env var
//!   (passed by `gtk_release.sh` via `open --env`).
//! - Resolves the working directory from CLI arguments (macOS "Open With"
//!   passes the folder path as argument).
//! - Resolves the working directory from the FinderSync custom pasteboard.
//!
//! ## Stage 0.2 of MULTIWINDOW_TABS.md
//!
//! Two flavours of API exist:
//!
//! 1. **`resolve_*`** — *pure* resolvers that compute and return a `PathBuf`
//!    **without** touching the process CWD. These are the foundation for
//!    per-tab CWD: each tab can be constructed with its own working
//!    directory without changing global state.
//!
//! 2. **`apply_*`** — legacy wrappers that call the matching `resolve_*`
//!    and additionally call `std::env::set_current_dir()`. Kept for
//!    backwards compatibility with the current single-window callers in
//!    `main.rs`. Will be removed once all consumers migrate to per-tab
//!    `AppState.cwd` (Stage 0.3).

// ── Pure resolvers (no side effects) ──────────────────────────────

/// Resolve the project directory from `CHLODWIG_PROJECT_DIR`.
///
/// Returns `Some(path)` if the env var is set and points to an existing
/// directory; `None` otherwise. Does **not** modify the process CWD.
pub fn resolve_project_dir() -> Option<std::path::PathBuf> {
    let dir = std::env::var("CHLODWIG_PROJECT_DIR").ok()?;
    let path = std::path::PathBuf::from(&dir);
    if path.is_dir() {
        Some(path)
    } else {
        tracing::warn!(
            "CHLODWIG_PROJECT_DIR={} does not exist or is not a directory",
            path.display()
        );
        None
    }
}

/// Resolve the project directory from the FinderSync custom pasteboard.
///
/// Reads (and clears) the named pasteboard `rs.chlodwig.finder-open`.
/// Returns `Some(path)` on a valid existing directory; `None` otherwise.
/// Does **not** modify the process CWD.
pub fn resolve_project_dir_from_finder() -> Option<std::path::PathBuf> {
    let dir_str = read_and_clear_finder_pasteboard()?;
    let dir = dir_str.trim();
    if dir.is_empty() {
        tracing::warn!("Finder pasteboard was empty");
        return None;
    }
    let path = std::path::PathBuf::from(dir);
    if path.is_dir() {
        Some(path)
    } else {
        tracing::warn!(
            "Finder pasteboard path {} does not exist or is not a directory",
            path.display()
        );
        None
    }
}

/// Resolve the project directory from CLI arguments.
///
/// macOS "Open With" passes the folder path as a CLI argument.
/// Returns the first existing-directory argument found, or `None`.
/// Does **not** modify the process CWD.
pub fn resolve_project_dir_from_args() -> Option<std::path::PathBuf> {
    let args: Vec<String> = std::env::args().collect();
    for arg in args.iter().skip(1) {
        if arg.starts_with('-') {
            continue;
        }
        let path = std::path::PathBuf::from(arg);
        if path.is_dir() {
            return Some(path);
        }
    }
    None
}

/// Resolve the initial CWD for a freshly-opened window/tab.
///
/// Priority: Finder pasteboard > `CHLODWIG_PROJECT_DIR` > CLI args >
/// `std::env::current_dir()` > `/`.
///
/// This is the **single entry point** new code should use to build the
/// initial `AppState.cwd`. It performs **no** side effects on the process
/// CWD, so it is safe to call once per tab.
pub fn resolve_initial_cwd() -> std::path::PathBuf {
    resolve_project_dir_from_finder()
        .or_else(resolve_project_dir)
        .or_else(resolve_project_dir_from_args)
        .or_else(|| std::env::current_dir().ok())
        .unwrap_or_else(|| std::path::PathBuf::from("/"))
}

// ── Legacy apply_* wrappers (call set_current_dir) ────────────────

/// Set the process working directory to `CHLODWIG_PROJECT_DIR` if set.
///
/// Legacy wrapper around `resolve_project_dir()` that additionally calls
/// `std::env::set_current_dir()`. Will be removed in Stage 0.3 once all
/// callers route through per-tab `AppState.cwd`.
pub fn apply_project_dir() -> Option<std::path::PathBuf> {
    let path = resolve_project_dir()?;
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

/// Set the process working directory from the FinderSync custom pasteboard.
///
/// Legacy wrapper around `resolve_project_dir_from_finder()` that
/// additionally calls `std::env::set_current_dir()`.
pub fn apply_project_dir_from_finder() -> Option<std::path::PathBuf> {
    let path = resolve_project_dir_from_finder()?;
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
/// Legacy wrapper around `resolve_project_dir_from_args()` that additionally
/// calls `std::env::set_current_dir()`.
pub fn apply_project_dir_from_args() -> Option<std::path::PathBuf> {
    let path = resolve_project_dir_from_args()?;
    match std::env::set_current_dir(&path) {
        Ok(()) => {
            tracing::info!("Set working directory from arg: {}", path.display());
            Some(path)
        }
        Err(e) => {
            tracing::warn!("Failed to chdir to {}: {e}", path.display());
            None
        }
    }
}
