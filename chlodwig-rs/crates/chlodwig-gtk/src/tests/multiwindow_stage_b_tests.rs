//! Stage B of MULTIWINDOW_TABS.md — `adw::TabView` + `adw::TabBar`,
//! multi-tab per window. Each tab is a self-contained unit (own AppState,
//! ConversationState, channels, background task, status bar, scroll
//! handler, viewport, session timestamp, stop flag, cwd).
//!
//! These are source-grep guards (GTK widgets cannot be instantiated under
//! `cargo test --release --workspace` without a display server, and the
//! per-tab background task spans Tokio + GLib so a real integration test
//! would require a full X/Wayland session).
//!
//! ── Single-source-of-truth invariants enforced here ───────────────────
//!
//!   1. `BackgroundCommand` is defined exactly once → in `tab.rs`.
//!   2. The conversation-loop `tokio::spawn` block exists exactly once →
//!      in `tab.rs::attach_new_tab`. (Was in `main.rs` before; would
//!      multiply per tab if it stayed there.)
//!   3. Per-tab wiring (`submit::wire`, `event_dispatch::wire`,
//!      `table_interactions::wire`, copy-feedback handler, scroll
//!      value-changed handler) is called exactly once per tab → all calls
//!      live inside `attach_new_tab`. `main.rs` does NOT call any of
//!      these directly.
//!   4. `build_window` (the Stage A composer that bundled "1 shell + 1
//!      tab in 1 call") is gone — Stage B replaces it with explicit
//!      `build_window_shell` followed by `attach_new_tab`, so the same
//!      call path serves both "open initial tab" and "Cmd+T new tab".

//! ── Note (post-Stage-B "Tab trait" refactor) ───────────────────────────
//! After Stage B, `tab.rs` was split into a module directory:
//!   - `tab/mod.rs` — generic trait (`Tab`), registry, close handler.
//!   - `tab/ai_conversation.rs` — concrete AI-conversation tab kind.
//! The old free function `tab::attach_new_tab` became
//! `tab::AiConversationTab::attach_new`; the old `pub struct TabContext`
//! became `pub struct AiConversationTab`. The Stage-B grep guards below
//! were updated accordingly. Newer architectural invariants live in
//! `tab_trait_tests.rs`.

const TAB_RS: &str = include_str!("../tab/ai_conversation.rs");
const TAB_MOD_RS: &str = include_str!("../tab/mod.rs");
const MAIN_RS: &str = include_str!("../main.rs");
const SUBMIT_RS: &str = include_str!("../submit.rs");
const EVENT_DISPATCH_RS: &str = include_str!("../event_dispatch.rs");
const MENU_RS: &str = include_str!("../menu.rs");
const WINDOW_RS: &str = include_str!("../window.rs");

// ── tab.rs module shape ─────────────────────────────────────────────────

#[test]
fn test_tab_module_exists() {
    // Cargo will panic at compile time if this file does not exist —
    // but we also assert it's mounted from main.rs.
    assert!(
        MAIN_RS.contains("mod tab"),
        "main.rs must declare `mod tab;`"
    );
}

#[test]
fn test_tab_module_defines_attach_new_tab() {
    assert!(
        TAB_RS.contains("pub fn attach_new("),
        "tab/ai_conversation.rs must expose `pub fn attach_new(...)` (was \
         `attach_new_tab` in Stage B; renamed when the module was split \
         into the Tab trait + AI submodule). The SINGLE entry point for \
         creating an AI tab — used both for the initial tab at startup \
         and for Cmd+T new-tab actions."
    );
}

#[test]
fn test_tab_module_defines_active_helper() {
    assert!(
        TAB_MOD_RS.contains("pub fn active("),
        "tab/mod.rs must expose `pub fn active(tab_view, registry) -> Option<Rc<dyn Tab>>` \
         — the single accessor for 'the tab the user is currently looking at' \
         (used by menu actions: Compact, Resume, Sessions, New Conversation, …)"
    );
}

#[test]
fn test_tab_context_struct_exists() {
    assert!(
        TAB_RS.contains("pub struct AiConversationTab"),
        "tab/ai_conversation.rs must define `pub struct AiConversationTab` \
         (was `TabContext` in Stage B; renamed when the AI tab kind became \
         one concrete impl among potentially many). Bundles per-AI-tab \
         state (widgets, app_state, viewport_cols, session_started_at, \
         prompt_tx, stop_flag, cwd) into one unit."
    );
}

#[test]
fn test_tab_registry_type_alias_exists() {
    // Need a way to look up the Tab for any TabPage — registry is the
    // canonical structure.
    assert!(
        TAB_MOD_RS.contains("pub type TabRegistry") || TAB_MOD_RS.contains("pub struct TabRegistry"),
        "tab/mod.rs must define `pub type TabRegistry = ...` (or a struct) — the \
         shared map from `adw::TabPage` to its `Rc<dyn Tab>`"
    );
}

// ── BackgroundCommand SSoT: defined in tab.rs, NOT main.rs ─────────────

#[test]
fn test_background_command_defined_in_tab_module_only() {
    assert!(
        TAB_RS.contains("pub enum BackgroundCommand"),
        "tab.rs must own `pub enum BackgroundCommand` (was in main.rs in Stage A; \
         moves to tab.rs because each tab spawns its own background task)"
    );
    assert!(
        !MAIN_RS.contains("enum BackgroundCommand"),
        "main.rs must NOT define `BackgroundCommand` any more — it lives in \
         tab.rs as the single source of truth"
    );
}

#[test]
fn test_submit_event_dispatch_table_interactions_use_tab_module_command() {
    // Sibling modules import BackgroundCommand from tab module, not from
    // crate root, after the move.
    for (name, src) in [
        ("submit.rs", SUBMIT_RS),
        ("event_dispatch.rs", EVENT_DISPATCH_RS),
        ("menu.rs", MENU_RS),
    ] {
        assert!(
            src.contains("crate::tab::BackgroundCommand")
                || src.contains("use crate::tab::")
                || src.contains("crate::tab::{")
                || src.contains("tab::BackgroundCommand"),
            "{name} must import `BackgroundCommand` from the `tab` module \
             (single source of truth)"
        );
    }
}

// ── Background conversation task lives in tab.rs, not main.rs ──────────

#[test]
fn test_main_does_not_spawn_conversation_task() {
    // The `std::thread::spawn(move || { … rt.block_on(async move { … \
    // while let Some(bg_cmd) = prompt_rx.recv().await … }) })` block must
    // not exist in main.rs any more. Each tab spawns its own.
    assert!(
        !MAIN_RS.contains("ConversationState {"),
        "main.rs must not construct a `ConversationState {{ … }}` literal — \
         each tab does this in `tab::attach_new_tab` so it can have its own \
         tools, tool_context.cwd, system_prompt, stop_requested flag"
    );
    assert!(
        !MAIN_RS.contains("AnthropicClient::new"),
        "main.rs must not instantiate `AnthropicClient` — that's per-tab \
         setup (`tab::attach_new_tab` builds it from resolved_config)"
    );
}

#[test]
fn test_tab_attach_spawns_background_task() {
    assert!(
        TAB_RS.contains("std::thread::spawn") || TAB_RS.contains("thread::spawn"),
        "tab::attach_new_tab must spawn the per-tab background conversation \
         thread (Tokio runtime + run_turn loop)"
    );
    assert!(
        TAB_RS.contains("ConversationState {"),
        "tab::attach_new_tab must build the per-tab ConversationState"
    );
    assert!(
        TAB_RS.contains("run_turn"),
        "tab::attach_new_tab must run the per-tab run_turn loop"
    );
}

// ── Per-tab wiring SSoT: only attach_new_tab calls these ──────────────

#[test]
fn test_main_does_not_wire_submit_event_dispatch_or_table_interactions() {
    // These would fan out per-tab if main.rs called them at startup; the
    // SSoT rule says: only attach_new_tab wires per-tab handlers.
    for (call_pattern, msg) in [
        ("submit::wire", "submit::wire must be called from tab::attach_new_tab, not main.rs"),
        ("event_dispatch::wire", "event_dispatch::wire must be called from tab::attach_new_tab, not main.rs"),
        ("table_interactions::wire", "table_interactions::wire must be called from tab::attach_new_tab, not main.rs"),
    ] {
        assert!(
            !MAIN_RS.contains(call_pattern),
            "main.rs still calls `{call_pattern}` — {msg}"
        );
    }
}

#[test]
fn test_attach_new_tab_calls_all_per_tab_wirings() {
    // The per-tab unit MUST call all per-tab wirings; no implicit "the
    // first tab gets it from main, subsequent tabs get it from tab.rs"
    // bifurcation.
    for call in ["submit::wire", "event_dispatch::wire", "table_interactions::wire"] {
        assert!(
            TAB_RS.contains(call),
            "tab.rs must call `{call}` (per-tab wiring SSoT — every tab \
             gets its own send button, its own 16ms event loop, its own \
             header-click sort handler)"
        );
    }
}

// ── Window shell exposes a TabView (replaces single-tab set_child) ────

#[test]
fn test_build_window_shell_returns_tab_view() {
    // After Stage B, the shell creates the ApplicationWindow AND mounts an
    // empty `adw::TabView` (with `adw::TabBar` in the headerbar). It
    // returns BOTH the window and the TabView so attach_new_tab can append
    // pages without main.rs needing to know window internals.
    let sig_start = WINDOW_RS
        .find("pub fn build_window_shell(")
        .expect("build_window_shell must still exist");
    let sig_end = WINDOW_RS[sig_start..]
        .find('{')
        .expect("function signature must end with `{`");
    let sig = &WINDOW_RS[sig_start..sig_start + sig_end];
    assert!(
        sig.contains("TabView"),
        "build_window_shell must return a tuple containing `adw::TabView` so \
         tab::attach_new_tab can append pages to it — got signature:\n{sig}"
    );
}

#[test]
fn test_build_window_shell_constructs_tab_view_and_tab_bar() {
    let body_start = WINDOW_RS
        .find("pub fn build_window_shell(")
        .map(|i| i + WINDOW_RS[i..].find('{').unwrap())
        .expect("build_window_shell must exist");
    let body_end = body_start
        + WINDOW_RS[body_start..]
            .find("\n}\n")
            .expect("build_window_shell body must close");
    let body = &WINDOW_RS[body_start..body_end];
    assert!(
        body.contains("TabView::new") || body.contains("adw::TabView::new"),
        "build_window_shell must call `adw::TabView::new()` — got body:\n{body}"
    );
    assert!(
        body.contains("TabBar::new") || body.contains("adw::TabBar::new"),
        "build_window_shell must call `adw::TabBar::new()` — got body:\n{body}"
    );
}

#[test]
fn test_build_window_function_is_gone() {
    // The Stage A composer bundled "1 shell + 1 tab + window-level cap"
    // into one call. Stage B replaces it with explicit composition in
    // main.rs (build_window_shell then attach_new_tab). Keeping
    // build_window would create a "first tab special" code path that
    // diverges from "Nth tab" wiring → drift.
    assert!(
        !WINDOW_RS.contains("pub fn build_window("),
        "Stage A's `pub fn build_window` must be removed — Stage B composes \
         build_window_shell + tab::attach_new_tab explicitly so the same \
         path creates the initial tab AND every subsequent Cmd+T tab"
    );
}

// ── Menu actions: New Tab + Close Tab ──────────────────────────────────

#[test]
fn test_menu_has_new_tab_action() {
    assert!(
        MENU_RS.contains("\"new-tab\"") || MENU_RS.contains("app.new-tab"),
        "menu.rs must register `app.new-tab` (Cmd+T) — opens a new tab in \
         the current window"
    );
    assert!(
        MENU_RS.contains("<Meta>t") || MENU_RS.contains("<Meta>T"),
        "menu.rs must bind `<Meta>t` to `app.new-tab`"
    );
}

#[test]
fn test_menu_has_close_tab_action() {
    assert!(
        MENU_RS.contains("\"close-tab\"") || MENU_RS.contains("app.close-tab"),
        "menu.rs must register `app.close-tab` (Cmd+W) — closes the active tab"
    );
    assert!(
        MENU_RS.contains("<Meta>w") || MENU_RS.contains("<Meta>W"),
        "menu.rs must bind `<Meta>w` to `app.close-tab`"
    );
}

// ── Menu uses tab::active() instead of captured single-tab refs ───────

#[test]
fn test_menu_context_drops_per_tab_captures() {
    // MenuContext used to bundle widgets+app_state+prompt_tx+viewport_cols+
    // session_started_at — all per-tab data. After Stage B those are
    // resolved per-action via tab::active(), so MenuContext must NOT
    // contain them as fields.
    let ctx_start = MENU_RS
        .find("pub struct MenuContext")
        .expect("MenuContext must exist");
    let ctx_end = MENU_RS[ctx_start..]
        .find("\n}\n")
        .expect("MenuContext body must close");
    let ctx_body = &MENU_RS[ctx_start..ctx_start + ctx_end];
    for forbidden in [
        "widgets:",
        "app_state:",
        "prompt_tx:",
        "viewport_cols:",
        "session_started_at:",
    ] {
        assert!(
            !ctx_body.contains(forbidden),
            "MenuContext must NOT capture per-tab field `{forbidden}` — \
             actions must resolve the active tab via `tab::active(...)` \
             at activation time. Got MenuContext body:\n{ctx_body}"
        );
    }
}

#[test]
fn test_menu_context_has_tab_view_and_registry() {
    // Stage C update: per-window references in MenuContext are gone.
    // The menu is wired ONCE per app and dispatches via `active_entry`
    // which resolves the active window's tab_view + registry at action
    // time. MenuContext now carries the app-level `app_registry` instead.
    let ctx_start = MENU_RS
        .find("pub struct MenuContext")
        .expect("MenuContext must exist");
    let ctx_end = MENU_RS[ctx_start..]
        .find("\n}\n")
        .expect("MenuContext body must close");
    let ctx_body = &MENU_RS[ctx_start..ctx_start + ctx_end];
    assert!(
        ctx_body.contains("app_registry") || ctx_body.contains("AppWindowRegistry"),
        "MenuContext (Stage C) must carry `app_registry: AppWindowRegistry` \
         so actions can find the active window's WindowEntry. Got:\n{ctx_body}"
    );
}

// ── Empty-window cleanup: closing last tab closes the window ──────────

#[test]
fn test_close_last_tab_closes_window() {
    // adw::TabView fires connect_close_page when a tab close is requested.
    // After close_page_finish(true), if n_pages() == 0 the window must
    // close itself. Otherwise the user has an empty headerbar window.
    assert!(
        TAB_MOD_RS.contains("connect_close_page") || MAIN_RS.contains("connect_close_page"),
        "either tab/mod.rs or main.rs must subscribe to `connect_close_page` to \
         finalize close + auto-close-when-empty"
    );
    let needle = "n_pages";
    assert!(
        TAB_MOD_RS.contains(needle) || MAIN_RS.contains(needle),
        "must check `tab_view.n_pages() == 0` to decide whether to close \
         the window after a tab close"
    );
}
