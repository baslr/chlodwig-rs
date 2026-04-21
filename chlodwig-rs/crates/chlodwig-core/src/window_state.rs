//! Tab-set persistence: which sessions a window has open across restarts.
//!
//! Stage D.2 + Stage C of MULTIWINDOW_TABS.md.
//!
//! At process start the GTK frontend reads `window_state.json` and re-opens
//! one tab per `TabState` entry per window, restoring each tab's session via
//! the same [`crate::load_session_from`] / [`crate::session_path_for`]
//! machinery the Sessions browser already uses (single source of truth).
//!
//! After every "shape change" (tab opened, tab closed, tab reordered, active
//! tab changed, **window opened, window closed**) the GTK frontend rewrites
//! the snapshot. The write is atomic — temp file + rename — same pattern as
//! [`crate::save_session`].
//!
//! Per-tab message data is **not** stored here. Each tab's full conversation
//! lives in its own session file under `~/.chlodwig-rs/sessions/`. This file
//! holds only the **set** of windows, their tabs (by session id), and which
//! tab in each window was active.
//!
//! ## File format (v2 — multi-window)
//!
//! `~/.chlodwig-rs/window_state.json`:
//!
//! ```json
//! {
//!   "version": 2,
//!   "windows": [
//!     {
//!       "tabs": [
//!         { "session_started_at": "2026-04-20T18:30:15+02:00", "cwd": "/Users/me/proj" },
//!         { "session_started_at": "2026-04-20T19:05:00+02:00", "cwd": "/Users/me/other" }
//!       ],
//!       "active_index": 1
//!     },
//!     {
//!       "tabs": [
//!         { "session_started_at": "2026-04-21T08:00:00+02:00", "cwd": "/tmp" }
//!       ],
//!       "active_index": 0
//!     }
//!   ]
//! }
//! ```
//!
//! ## v1 → v2 migration
//!
//! v1 stored a single window inline at the top level
//! (`{version:1, tabs:[...], active_index:N}`). On load, we detect the old
//! shape (presence of top-level `tabs` field, or `version != 2`) and wrap it
//! as a single-element `windows` list. Migration is read-only — the next
//! save writes v2.

use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

/// One open tab in a window. The full conversation is in the session file
/// identified by `session_started_at`; this struct records only its identity
/// and its cwd.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct TabState {
    /// RFC-3339 timestamp matching [`crate::SessionSnapshot::started_at`].
    /// Used to locate the session file via [`crate::session_path_for`].
    pub session_started_at: String,
    /// Tab's working directory (from `AppState.cwd`). Stored so a missing
    /// session file doesn't lose the tab's project context.
    pub cwd: PathBuf,
}

/// Per-window persisted shape: the list of open tabs and which one was
/// active. `active_index` is clamped to the valid range on load.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct WindowState {
    /// Tabs in display order (left-to-right).
    pub tabs: Vec<TabState>,
    /// Index into `tabs` of the currently-selected page. Saturating-clamped
    /// to `tabs.len() - 1` on load.
    pub active_index: usize,
}

/// Whole-app persisted shape (Stage C — multi-window).
///
/// One file at `~/.chlodwig-rs/window_state.json` holds every window the
/// user had open, in display order. The first element is conventionally
/// the "primary" window (the one created at startup); on load the GTK
/// frontend builds windows in that order.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct AppWindowSet {
    /// Schema version. v2 = multi-window (this struct); v1 was a single
    /// inline window. v1 files are migrated transparently on load.
    #[serde(default = "default_version")]
    pub version: u32,
    /// Windows in creation/display order. Empty list means "no windows
    /// to restore" — caller falls back to opening one fresh window.
    pub windows: Vec<WindowState>,
}

fn default_version() -> u32 {
    2
}

impl WindowState {
    /// Construct an empty (no tabs) per-window snapshot.
    pub fn empty() -> Self {
        Self {
            tabs: Vec::new(),
            active_index: 0,
        }
    }
}

impl AppWindowSet {
    /// Construct an empty (no windows) app-level snapshot at version 2.
    pub fn empty() -> Self {
        Self {
            version: 2,
            windows: Vec::new(),
        }
    }
}

/// Path of the window-state file: `~/.chlodwig-rs/window_state.json`.
pub fn window_state_path() -> PathBuf {
    crate::log_dir().join("window_state.json")
}

/// Save the app-level window set atomically. Writes to `<path>.tmp`,
/// then renames. Mirrors [`crate::save_session`]'s atomic-rename pattern.
pub fn save_window_state(state: &AppWindowSet) -> std::io::Result<()> {
    save_window_state_to(state, &window_state_path())
}

/// Save to an arbitrary path (test hook).
pub fn save_window_state_to(state: &AppWindowSet, path: &Path) -> std::io::Result<()> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let json = serde_json::to_string_pretty(state)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;
    let tmp = path.with_extension("json.tmp");
    std::fs::write(&tmp, json.as_bytes())?;
    std::fs::rename(&tmp, path)?;
    let total_tabs: usize = state.windows.iter().map(|w| w.tabs.len()).sum();
    tracing::debug!(
        path = %path.display(),
        windows = state.windows.len(),
        total_tabs,
        "window_state saved"
    );
    Ok(())
}

/// Load the app-level window set from disk. Returns `Ok(None)` when the
/// file does not exist (first launch / user deleted it). Returns `Err` on
/// I/O or parse errors. Each window's `active_index` is clamped to a valid
/// range. v1 files (single-window) are migrated transparently into a
/// one-element `windows` list.
pub fn load_window_state() -> std::io::Result<Option<AppWindowSet>> {
    load_window_state_from(&window_state_path())
}

/// Load from an arbitrary path (test hook).
pub fn load_window_state_from(path: &Path) -> std::io::Result<Option<AppWindowSet>> {
    if !path.exists() {
        return Ok(None);
    }
    let json = std::fs::read_to_string(path)?;
    let mut set = parse_window_state(&json)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?;
    // Clamp active_index per window: an out-of-range index would crash
    // the GTK frontend when it tries to `set_selected_page`.
    for w in set.windows.iter_mut() {
        if w.tabs.is_empty() {
            w.active_index = 0;
        } else if w.active_index >= w.tabs.len() {
            w.active_index = w.tabs.len() - 1;
        }
    }
    Ok(Some(set))
}

/// Parse the on-disk JSON into an `AppWindowSet`, transparently migrating
/// v1 (single-window: top-level `tabs`/`active_index` fields) into v2
/// (multi-window: top-level `windows` array).
///
/// Detection logic:
///   - If the JSON object has a top-level `windows` field → v2, parse directly.
///   - Else if it has a top-level `tabs` field → v1, wrap as one-element list.
///   - Else → invalid.
pub fn parse_window_state(json: &str) -> Result<AppWindowSet, serde_json::Error> {
    // Try v2 first. If successful and `windows` is non-default-shaped, accept.
    let value: serde_json::Value = serde_json::from_str(json)?;

    // Multi-window v2: object with a `windows` array.
    if value.get("windows").is_some() {
        let set: AppWindowSet = serde_json::from_value(value)?;
        return Ok(set);
    }

    // Single-window v1: object with `tabs` (and `active_index`).
    if value.get("tabs").is_some() {
        let single: WindowState = serde_json::from_value(value)?;
        return Ok(AppWindowSet {
            version: 2,
            windows: vec![single],
        });
    }

    // Neither shape — let serde produce a helpful error by attempting v2 again.
    let set: AppWindowSet = serde_json::from_str(json)?;
    Ok(set)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_window() -> WindowState {
        WindowState {
            tabs: vec![
                TabState {
                    session_started_at: "2026-04-20T18:30:15+02:00".into(),
                    cwd: PathBuf::from("/Users/me/proj"),
                },
                TabState {
                    session_started_at: "2026-04-20T19:05:00+02:00".into(),
                    cwd: PathBuf::from("/Users/me/other"),
                },
            ],
            active_index: 1,
        }
    }

    fn sample_set() -> AppWindowSet {
        AppWindowSet {
            version: 2,
            windows: vec![
                sample_window(),
                WindowState {
                    tabs: vec![TabState {
                        session_started_at: "2026-04-21T08:00:00+02:00".into(),
                        cwd: PathBuf::from("/tmp"),
                    }],
                    active_index: 0,
                },
            ],
        }
    }

    #[test]
    fn test_empty_window_state_has_no_tabs() {
        let s = WindowState::empty();
        assert!(s.tabs.is_empty());
        assert_eq!(s.active_index, 0);
    }

    #[test]
    fn test_empty_app_window_set_has_no_windows() {
        let s = AppWindowSet::empty();
        assert!(s.windows.is_empty());
        assert_eq!(s.version, 2);
    }

    #[test]
    fn test_round_trip_serde_preserves_set() {
        let s = sample_set();
        let json = serde_json::to_string(&s).unwrap();
        let back: AppWindowSet = serde_json::from_str(&json).unwrap();
        assert_eq!(s, back);
    }

    #[test]
    fn test_save_and_load_round_trip_multi_window() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("window_state.json");
        let s = sample_set();
        save_window_state_to(&s, &path).unwrap();
        let back = load_window_state_from(&path).unwrap().unwrap();
        assert_eq!(s, back);
    }

    #[test]
    fn test_load_missing_file_returns_none() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("does_not_exist.json");
        let res = load_window_state_from(&path).unwrap();
        assert!(res.is_none());
    }

    #[test]
    fn test_save_atomic_no_tmp_file_left_behind() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("window_state.json");
        save_window_state_to(&sample_set(), &path).unwrap();
        let tmp_path = path.with_extension("json.tmp");
        assert!(!tmp_path.exists(), "atomic save must remove .tmp on success");
    }

    #[test]
    fn test_load_clamps_active_index_per_window() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("window_state.json");
        let mut s = sample_set();
        s.windows[0].active_index = 99;
        save_window_state_to(&s, &path).unwrap();
        let back = load_window_state_from(&path).unwrap().unwrap();
        assert_eq!(back.windows[0].active_index, back.windows[0].tabs.len() - 1);
    }

    #[test]
    fn test_load_clamps_active_index_on_empty_tabs() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("window_state.json");
        let s = AppWindowSet {
            version: 2,
            windows: vec![WindowState {
                tabs: Vec::new(),
                active_index: 5,
            }],
        };
        save_window_state_to(&s, &path).unwrap();
        let back = load_window_state_from(&path).unwrap().unwrap();
        assert_eq!(back.windows[0].active_index, 0);
    }

    #[test]
    fn test_save_overwrites_existing_file() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("window_state.json");
        save_window_state_to(&sample_set(), &path).unwrap();
        let s2 = AppWindowSet {
            version: 2,
            windows: vec![WindowState {
                tabs: vec![TabState {
                    session_started_at: "2026-04-21T08:00:00+02:00".into(),
                    cwd: PathBuf::from("/tmp"),
                }],
                active_index: 0,
            }],
        };
        save_window_state_to(&s2, &path).unwrap();
        let back = load_window_state_from(&path).unwrap().unwrap();
        assert_eq!(back, s2);
    }

    #[test]
    fn test_window_state_path_under_chlodwig_rs() {
        let p = window_state_path();
        let s = p.to_string_lossy();
        assert!(
            s.contains(".chlodwig-rs"),
            "window_state path should be under .chlodwig-rs: {s}"
        );
        assert!(
            s.ends_with("window_state.json"),
            "filename should be window_state.json: {s}"
        );
    }

    #[test]
    fn test_v1_single_window_file_migrates_to_v2() {
        // The v1 schema had top-level `tabs` + `active_index` and no
        // `windows` array. Loading it must produce a v2 set with a
        // one-element `windows` list.
        let v1_json = r#"{
            "version": 1,
            "tabs": [
                { "session_started_at": "2026-04-20T18:30:15+02:00", "cwd": "/x" },
                { "session_started_at": "2026-04-20T19:05:00+02:00", "cwd": "/y" }
            ],
            "active_index": 1
        }"#;
        let set = parse_window_state(v1_json).unwrap();
        assert_eq!(set.windows.len(), 1, "v1 must wrap into one window");
        assert_eq!(set.windows[0].tabs.len(), 2);
        assert_eq!(set.windows[0].active_index, 1);
    }

    #[test]
    fn test_v1_file_loaded_via_load_window_state_from() {
        // Same as above but exercising the disk-load path.
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("window_state.json");
        std::fs::write(
            &path,
            r#"{"version":1,"tabs":[{"session_started_at":"a","cwd":"/p"}],"active_index":0}"#,
        )
        .unwrap();
        let set = load_window_state_from(&path).unwrap().unwrap();
        assert_eq!(set.windows.len(), 1);
        assert_eq!(set.windows[0].tabs[0].session_started_at, "a");
    }

    #[test]
    fn test_v2_file_loads_directly() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("window_state.json");
        save_window_state_to(&sample_set(), &path).unwrap();
        let set = load_window_state_from(&path).unwrap().unwrap();
        assert_eq!(set.version, 2);
        assert_eq!(set.windows.len(), 2);
    }

    #[test]
    fn test_version_default_when_missing_in_v2_json() {
        // A v2-shaped object without a `version` field defaults to 2.
        let json = r#"{ "windows": [] }"#;
        let set = parse_window_state(json).unwrap();
        assert_eq!(set.version, 2);
        assert!(set.windows.is_empty());
    }

    #[test]
    fn test_corrupt_json_returns_invalid_data_error() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("window_state.json");
        std::fs::write(&path, "not json at all").unwrap();
        let err = load_window_state_from(&path).unwrap_err();
        assert_eq!(err.kind(), std::io::ErrorKind::InvalidData);
    }

    #[test]
    fn test_tab_state_has_cwd_field() {
        let t = TabState {
            session_started_at: "x".into(),
            cwd: PathBuf::from("/a/b"),
        };
        assert_eq!(t.cwd, PathBuf::from("/a/b"));
    }

    #[test]
    fn test_v1_with_empty_tabs_migrates_cleanly() {
        let v1 = r#"{"version":1,"tabs":[],"active_index":0}"#;
        let set = parse_window_state(v1).unwrap();
        assert_eq!(set.windows.len(), 1);
        assert!(set.windows[0].tabs.is_empty());
    }

    #[test]
    fn test_save_then_load_preserves_window_order() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("window_state.json");
        let s = sample_set();
        save_window_state_to(&s, &path).unwrap();
        let back = load_window_state_from(&path).unwrap().unwrap();
        assert_eq!(
            back.windows[0].tabs[0].session_started_at,
            "2026-04-20T18:30:15+02:00"
        );
        assert_eq!(
            back.windows[1].tabs[0].session_started_at,
            "2026-04-21T08:00:00+02:00"
        );
    }
}
