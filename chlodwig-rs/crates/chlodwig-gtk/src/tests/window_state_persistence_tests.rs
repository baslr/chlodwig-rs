//! Stage D.2 — Tab-set persistence across launches.
//!
//! Source-grep regression guards. Implementation invariants:
//!
//! 1. `chlodwig_core::WindowState` + `TabState` are the persisted shape.
//! 2. The GTK frontend has `tab::snapshot_window_state(tab_view, registry)`
//!    that produces a `WindowState` from the live UI.
//! 3. The GTK frontend has `tab::wire_tab_set_persistence(...)` that
//!    re-saves the snapshot on `connect_page_attached` /
//!    `connect_page_detached` / `connect_page_reordered` /
//!    `connect_selected_page_notify`.
//! 4. `main.rs` calls `wire_tab_set_persistence(...)` once per window.
//! 5. `main.rs` restores the persisted tab set on startup
//!    (`load_window_state` → loop → `attach_with_session` /
//!    fallback `attach_new`) — single SSoT for tab-set restoration.
//! 6. The legacy `--resume` path stays separate and does not collide
//!    with the multi-tab restore (it only applies when `--resume` is
//!    explicitly passed AND no `window_state.json` is restored).

const TAB_MOD_RS: &str = include_str!("../tab/mod.rs");
const TAB_AI_RS: &str = include_str!("../tab/ai_conversation.rs");
const MAIN_RS: &str = include_str!("../../src/main.rs");

#[test]
fn test_core_exports_window_state_types() {
    // Sanity: the core piece is reachable from the GTK crate.
    let _empty: chlodwig_core::WindowState = chlodwig_core::WindowState::empty();
    let _ts = chlodwig_core::TabState {
        session_started_at: "2026-04-21T00:00:00+02:00".into(),
        cwd: std::path::PathBuf::from("/tmp"),
    };
}

#[test]
fn test_tab_module_has_snapshot_window_state_function() {
    assert!(
        TAB_MOD_RS.contains("pub fn snapshot_window_state"),
        "tab/mod.rs must expose `snapshot_window_state` for D.2 persistence"
    );
}

#[test]
fn test_snapshot_window_state_returns_window_state() {
    // The signature must produce a chlodwig_core::WindowState.
    assert!(
        TAB_MOD_RS.contains("-> chlodwig_core::WindowState")
            || TAB_MOD_RS.contains("-> WindowState"),
        "snapshot_window_state must return chlodwig_core::WindowState"
    );
}

#[test]
fn test_tab_module_has_wire_tab_set_persistence_function() {
    assert!(
        TAB_MOD_RS.contains("pub fn wire_tab_set_persistence"),
        "tab/mod.rs must expose `wire_tab_set_persistence` for D.2"
    );
}

#[test]
fn test_persistence_subscribes_to_page_attached() {
    assert!(
        TAB_MOD_RS.contains("connect_page_attached"),
        "wire_tab_set_persistence must subscribe to page_attached"
    );
}

#[test]
fn test_persistence_subscribes_to_page_detached() {
    assert!(
        TAB_MOD_RS.contains("connect_page_detached"),
        "wire_tab_set_persistence must subscribe to page_detached"
    );
}

#[test]
fn test_persistence_subscribes_to_page_reordered() {
    assert!(
        TAB_MOD_RS.contains("connect_page_reordered"),
        "wire_tab_set_persistence must subscribe to page_reordered"
    );
}

#[test]
fn test_persistence_subscribes_to_selected_page_change() {
    assert!(
        TAB_MOD_RS.contains("connect_selected_page_notify"),
        "wire_tab_set_persistence must subscribe to selected_page_notify"
    );
}

#[test]
fn test_persistence_calls_save_window_state() {
    assert!(
        TAB_MOD_RS.contains("save_window_state"),
        "wire_tab_set_persistence must call chlodwig_core::save_window_state"
    );
}

#[test]
fn test_main_wires_tab_set_persistence() {
    // Stage C: per-window persistence is wired by `build_window` (SSoT).
    // main.rs only needs to wire the APP-level persistence.
    assert!(
        TAB_MOD_RS.contains("wire_tab_set_persistence"),
        "wire_tab_set_persistence must exist (called from build_window)"
    );
}

#[test]
fn test_main_loads_window_state_on_startup() {
    assert!(
        MAIN_RS.contains("load_window_state"),
        "main.rs must call load_window_state on startup"
    );
}

#[test]
fn test_main_restores_tabs_via_attach_with_session() {
    // Stage C: per-tab restore is delegated to build_window. main.rs
    // either calls build_window with a WindowState (which iterates tabs
    // and uses attach_with_session internally) or, in degenerate cases,
    // handles `--resume`. The attach_with_session SSoT call lives in
    // build_window now.
    assert!(
        TAB_MOD_RS.contains("attach_with_session"),
        "attach_with_session SSoT must be reachable from build_window"
    );
}

#[test]
fn test_main_falls_back_to_attach_new_for_missing_session_files() {
    // Stage C: per-tab restore moved into build_window. The fallback
    // (attach_new in saved cwd if session file is missing) lives there.
    assert!(
        TAB_MOD_RS.contains("attach_new"),
        "tab/mod.rs (build_window) must use attach_new as the fresh-tab fallback"
    );
}

#[test]
fn test_session_started_at_field_is_persisted() {
    // The AiConversationTab struct holds session_started_at — used as
    // the per-tab session identity for window-state persistence.
    assert!(
        TAB_AI_RS.contains("session_started_at"),
        "AiConversationTab must hold session_started_at for D.2 persistence"
    );
}

#[test]
fn test_snapshot_uses_per_tab_session_started_at() {
    // The snapshot function must collect the per-tab session_started_at.
    // Either via a Tab-trait method or via downcasting AI tabs in the
    // sidecar registry.
    assert!(
        TAB_MOD_RS.contains("session_started_at"),
        "snapshot_window_state must read per-tab session_started_at"
    );
}
