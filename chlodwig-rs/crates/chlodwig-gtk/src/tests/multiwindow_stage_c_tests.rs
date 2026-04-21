//! Stage C — Multi-Window + Drag-Out + Multi-Window Persistence.
//!
//! Source-grep regression guards. Implementation invariants:
//!
//! 1. `chlodwig_core::AppWindowSet` exists with `version: 2` + `windows: Vec<WindowState>`.
//! 2. v1 (`{version:1, tabs:[...], active_index:N}`) files migrate transparently
//!    on load to a one-element `windows` list.
//! 3. The GTK frontend has a single `tab::build_window(app, ctx, optional_state)`
//!    SSoT that creates a window + tab_view + registry, wires close/persistence/
//!    title/focus/`connect_create_window` handlers, and attaches the requested
//!    tabs. Used by:
//!      - the initial-window startup path,
//!      - the `app.new-window` (Cmd+N) action,
//!      - drag-out via `connect_create_window`.
//! 4. An app-level `WindowRegistry` (Vec of per-window handles) is the snapshot
//!    source for `AppWindowSet`. `tab::snapshot_app_window_set(&app_registry)`
//!    reads it; `tab::wire_app_persistence(...)` saves on every change.
//! 5. `connect_create_window` is wired by `build_window` (so dragging a tab
//!    out of any window opens a fresh window in the same app — single SSoT).
//! 6. The `app.new-window` action exists and is bound to `<Meta>n`. The old
//!    `<Meta>n` binding for `new-conversation` is moved (no two actions on
//!    the same accelerator).

const TAB_MOD_RS: &str = include_str!("../tab/mod.rs");
const MAIN_RS: &str = include_str!("../../src/main.rs");
const MENU_RS: &str = include_str!("../menu.rs");

#[test]
fn test_app_window_set_struct_exists_in_core() {
    let s = chlodwig_core::AppWindowSet::empty();
    assert_eq!(s.version, 2);
    assert!(s.windows.is_empty());
}

#[test]
fn test_v1_window_state_file_migrates_to_v2() {
    let v1 = r#"{"version":1,"tabs":[{"session_started_at":"x","cwd":"/p"}],"active_index":0}"#;
    let set = chlodwig_core::parse_window_state(v1).unwrap();
    assert_eq!(set.windows.len(), 1, "v1 must wrap into one window");
    assert_eq!(set.windows[0].tabs[0].session_started_at, "x");
}

#[test]
fn test_save_window_state_takes_app_window_set() {
    // Type-check guard: confirm the public API signature.
    let _f: fn(&chlodwig_core::AppWindowSet) -> std::io::Result<()> =
        chlodwig_core::save_window_state;
}

#[test]
fn test_load_window_state_returns_app_window_set() {
    let _f: fn() -> std::io::Result<Option<chlodwig_core::AppWindowSet>> =
        chlodwig_core::load_window_state;
}

#[test]
fn test_tab_module_has_build_window_function() {
    assert!(
        TAB_MOD_RS.contains("pub fn build_window"),
        "tab/mod.rs must expose `build_window` as the SSoT for window creation"
    );
}

#[test]
fn test_tab_module_has_snapshot_app_window_set_function() {
    assert!(
        TAB_MOD_RS.contains("pub fn snapshot_app_window_set"),
        "tab/mod.rs must expose `snapshot_app_window_set` for multi-window persistence"
    );
}

#[test]
fn test_snapshot_app_window_set_returns_app_window_set() {
    assert!(
        TAB_MOD_RS.contains("-> chlodwig_core::AppWindowSet")
            || TAB_MOD_RS.contains("-> AppWindowSet"),
        "snapshot_app_window_set must return chlodwig_core::AppWindowSet"
    );
}

#[test]
fn test_tab_module_has_app_window_registry_type() {
    assert!(
        TAB_MOD_RS.contains("AppWindowRegistry") || TAB_MOD_RS.contains("WindowRegistry"),
        "tab/mod.rs must expose an app-level window registry type"
    );
}

#[test]
fn test_build_window_wires_create_window_for_drag_out() {
    assert!(
        TAB_MOD_RS.contains("connect_create_window"),
        "build_window must wire connect_create_window so dragging a tab out opens a new window"
    );
}

#[test]
fn test_build_window_wires_close_handler() {
    // Close handler still wired exactly once — but inside build_window now,
    // not main.rs.
    assert!(
        TAB_MOD_RS.contains("wire_tab_view_close_handler")
            || TAB_MOD_RS.contains("connect_close_page"),
        "build_window must wire the per-window tab close handler"
    );
}

#[test]
fn test_main_uses_build_window() {
    assert!(
        MAIN_RS.contains("build_window"),
        "main.rs must create the initial window via build_window (SSoT)"
    );
}

#[test]
fn test_menu_has_new_window_action() {
    assert!(
        MENU_RS.contains("new-window") || MENU_RS.contains("\"new_window\""),
        "menu.rs must register an `app.new-window` action for Cmd+N"
    );
}

#[test]
fn test_meta_n_bound_to_new_window_not_new_conversation() {
    // Confirm the accelerator was moved off `app.new-conversation`.
    assert!(
        MENU_RS.contains("<Meta>n") || MENU_RS.contains("<Meta>N"),
        "menu.rs must define a Cmd+N accelerator (now bound to new-window)"
    );
    // The new-conversation action no longer claims <Meta>n.
    let nc_meta_n = MENU_RS.contains(r#"set_accels_for_action("app.new-conversation", &["<Meta>n"#);
    assert!(
        !nc_meta_n,
        "<Meta>n must no longer be bound to new-conversation"
    );
}

#[test]
fn test_main_wires_app_persistence() {
    // Per-window persistence is wired inside build_window (every window
    // gets it for free). The save function snapshots the WHOLE app set
    // (snapshot_app_window_set), not just one window. Verify the SSoT
    // exists in tab/mod.rs and that build_window references it.
    assert!(
        TAB_MOD_RS.contains("save_app_window_state")
            || TAB_MOD_RS.contains("snapshot_app_window_set"),
        "tab/mod.rs must expose app-level save (called from build_window's \
         per-window persistence wiring) — snapshot covers all windows"
    );
}

#[test]
fn test_main_loads_app_window_set_on_startup() {
    // Multi-window restore: iterate AppWindowSet.windows and call
    // build_window for each.
    assert!(
        MAIN_RS.contains("load_window_state"),
        "main.rs must call load_window_state on startup"
    );
    assert!(
        MAIN_RS.contains(".windows"),
        "main.rs must iterate AppWindowSet.windows for multi-window restore"
    );
}

#[test]
fn test_build_window_takes_optional_window_state() {
    // The signature must accept an Option<WindowState> so the same SSoT
    // covers fresh windows AND restored windows.
    assert!(
        TAB_MOD_RS.contains("Option<chlodwig_core::WindowState>")
            || TAB_MOD_RS.contains("Option<WindowState>"),
        "build_window must take Option<WindowState> for unified fresh+restored path"
    );
}

#[test]
fn test_only_one_call_to_wire_tab_view_close_handler_in_main() {
    // Per-window close handler is wired by build_window now. main.rs
    // must NOT also call wire_tab_view_close_handler — otherwise the
    // handler runs twice per close event.
    let count = MAIN_RS.matches("wire_tab_view_close_handler").count();
    assert_eq!(
        count, 0,
        "main.rs must not call wire_tab_view_close_handler — build_window owns that wiring"
    );
}

#[test]
fn test_only_one_call_to_wire_tab_set_persistence_in_main() {
    // Same reasoning: per-window persistence wiring belongs inside
    // build_window so every window (initial, Cmd+N, drag-out) gets it.
    let count = MAIN_RS.matches("wire_tab_set_persistence").count();
    assert_eq!(
        count, 0,
        "main.rs must not call wire_tab_set_persistence — build_window owns it"
    );
}

#[test]
fn test_app_window_set_save_load_round_trip_two_windows() {
    let tmp = tempfile::tempdir().unwrap();
    let path = tmp.path().join("window_state.json");
    let s = chlodwig_core::AppWindowSet {
        version: 2,
        windows: vec![
            chlodwig_core::WindowState {
                tabs: vec![chlodwig_core::TabState {
                    session_started_at: "a".into(),
                    cwd: std::path::PathBuf::from("/x"),
                }],
                active_index: 0,
            },
            chlodwig_core::WindowState {
                tabs: vec![chlodwig_core::TabState {
                    session_started_at: "b".into(),
                    cwd: std::path::PathBuf::from("/y"),
                }],
                active_index: 0,
            },
        ],
    };
    chlodwig_core::save_window_state_to(&s, &path).unwrap();
    let back = chlodwig_core::load_window_state_from(&path).unwrap().unwrap();
    assert_eq!(back.windows.len(), 2);
    assert_eq!(back.windows[0].tabs[0].session_started_at, "a");
    assert_eq!(back.windows[1].tabs[0].session_started_at, "b");
}
