//! Tab abstraction (multi-kind tabs in one window).
//!
//! A "tab" is the unit hosted by `adw::TabView`. The original design
//! (Stage B of MULTIWINDOW_TABS.md) hard-coded the AI-conversation kind:
//! `TabContext` mixed generic per-tab data (page, cwd) with AI-specific
//! data (prompt_tx, AppState, ConversationState wiring). Adding any other
//! kind of tab — Browser, Terminal, File Viewer, Image Viewer — would
//! have required touching the registry, the close handler, the menu,
//! and `main.rs`.
//!
//! This module decouples the layer: the [`Tab`] **trait** is the minimal
//! contract every tab kind must fulfil. The [`TabRegistry`] stores
//! `Rc<dyn Tab>`. AI-conversation–specific code lives in the sibling
//! [`ai_conversation`] submodule and implements `Tab` for
//! [`ai_conversation::AiConversationTab`].
//!
//! ── Single source of truth ─────────────────────────────────────────────
//!
//! - **Generic surface** (this file): trait, registry, `active()`,
//!   `active_ai()`, `wire_tab_view_close_handler`. NO AI-specific
//!   concepts (no `BackgroundCommand`, no `ConversationState`, no
//!   `prompt_tx`).
//!
//! - **AI-specific implementation** ([`ai_conversation`]):
//!   `AiConversationTab` struct, `BackgroundCommand` enum, the per-tab
//!   Tokio-runtime spawn, the conversation loop, the `attach_new(...)`
//!   factory called by both the initial-tab path in `main.rs` and by the
//!   Cmd+T menu action.
//!
//! ── Cmd+T default ──────────────────────────────────────────────────────
//!
//! Cmd+T always opens a new AI-conversation tab. The menu wires
//! `app.new-tab` → `AiConversationTab::attach_new(...)` directly (no
//! generic factory dispatch). When other tab kinds become user-creatable,
//! they'll get their own menu entries / actions; the AI-conversation
//! kind stays the single shortcut-bound default.

pub mod ai_conversation;

use std::any::Any;
use std::cell::RefCell;
use std::path::Path;
use std::rc::Rc;

use gtk4::prelude::*;
use gtk4::{glib, ApplicationWindow};

// Re-exports for ergonomic access from sibling modules (submit,
// event_dispatch, restore, table_interactions, menu). The DEFINITIONS
// live in `ai_conversation`; these are convenience aliases — single
// source of truth is the AI submodule.
pub use ai_conversation::{
    AiConversationTab, BackgroundCommand, TabAttachContext, TabConfig,
};

/// The minimal contract every tab kind must fulfil.
///
/// Methods are deliberately few — anything tab-kind-specific (e.g. the
/// AI tab's `prompt_tx`, an Image-Viewer tab's pixbuf, a Browser tab's
/// WebView) lives on the concrete struct and is reached via [`Tab::as_any`]
/// + downcast (or via a kind-specific helper such as [`active_ai`]).
pub trait Tab {
    /// The `adw::TabPage` this tab is attached to. Stable for the
    /// lifetime of the tab.
    fn page(&self) -> &libadwaita::TabPage;

    /// Working directory associated with this tab (used by "New Tab" to
    /// inherit cwd, by file-relative tools, etc.). Tabs that have no
    /// natural cwd return the process cwd.
    fn cwd(&self) -> std::path::PathBuf;

    /// Title to show in the window title bar when this tab is active.
    fn window_title(&self) -> String;

    /// Move keyboard focus to whatever this tab considers its primary
    /// input widget. Called when the window regains focus.
    fn focus_input(&self);

    /// Downcast hatch for kind-specific accessors. Implementors return
    /// `self`. Currently unused by the codebase (the AI tab uses a
    /// sidecar registry — see [`active_ai`]); kept on the trait so that
    /// future tab kinds without a dedicated sidecar can be reached via
    /// `tab.as_any().downcast_ref::<MyTab>()`.
    #[allow(dead_code)]
    fn as_any(&self) -> &dyn Any;
}

/// Map of `adw::TabPage` → `Rc<dyn Tab>`.
///
/// Lookup is by page identity (each `adw::TabPage` is a unique GObject).
pub type TabRegistry = Rc<RefCell<Vec<(libadwaita::TabPage, Rc<dyn Tab>)>>>;

/// Resolve "the tab the user is currently looking at" → its `Rc<dyn Tab>`.
///
/// Returns `None` when there are no tabs (window is empty just before
/// being closed). Use [`active_ai`] when the caller specifically needs
/// the AI-conversation kind.
pub fn active(
    tab_view: &libadwaita::TabView,
    registry: &TabRegistry,
) -> Option<Rc<dyn Tab>> {
    let page = tab_view.selected_page()?;
    let reg = registry.borrow();
    reg.iter()
        .find(|(p, _)| p == &page)
        .map(|(_, ctx)| ctx.clone())
}

/// Like [`active`], but downcasts to `AiConversationTab`. Returns `None`
/// when there is no active tab OR when the active tab is not an AI tab
/// (e.g. a future Browser or Terminal tab) — used by the AI-only menu
/// actions (Compact, Resume, Sessions, New Conversation) so they no-op
/// gracefully on non-AI tabs.
pub fn active_ai(
    tab_view: &libadwaita::TabView,
    registry: &TabRegistry,
) -> Option<Rc<AiConversationTab>> {
    let dyn_tab = active(tab_view, registry)?;
    // We can't downcast a `Rc<dyn Tab>` directly to `Rc<AiConversationTab>`
    // through `Any` (Any-downcast yields `&` references). Look up the
    // entry again in the registry by pointer identity to retrieve the
    // concrete `Rc` — works because `attach_new` registers the AI-tab via
    // a stored sidecar map. Simpler approach: walk the registry, attempt
    // an `Any::downcast_ref` per entry, and re-construct the concrete Rc
    // via a per-kind sidecar. To keep the trait minimal we instead store
    // a parallel registry of AI-tab Rcs (see `ai_conversation::register`).
    ai_conversation::lookup_active(tab_view, registry, dyn_tab.page())
}

/// Wire `adw::TabView::connect_close_page` → finalize the close, drop the
/// tab's entry from the registry (which drops the `Rc<dyn Tab>` and any
/// resources it owns — for AI tabs that means the channel sender, which
/// in turn lets the background task exit cleanly), and close the window
/// when the last tab is gone.
///
/// Wired ONCE per window, not per tab.
pub fn wire_tab_view_close_handler(
    tab_view: &libadwaita::TabView,
    registry: &TabRegistry,
    window: &ApplicationWindow,
) {
    let registry_for_close = registry.clone();
    let tab_view_for_close = tab_view.clone();
    let window_for_close = window.clone();
    tab_view.connect_close_page(move |tv, page| {
        // 1. Drop registry entry → drops Rc<dyn Tab> → drops kind-specific
        //    state (for AI tabs: the prompt_tx; the bg task then exits).
        registry_for_close
            .borrow_mut()
            .retain(|(p, _)| p != page);
        // Same cleanup for the AI-tab sidecar registry.
        ai_conversation::deregister(page);
        // 2. Confirm the close to the TabView.
        tv.close_page_finish(page, true);
        // 3. If no tabs remain, close the window. The libadwaita default
        //    is "app exits when last window closes".
        if tab_view_for_close.n_pages() == 0 {
            window_for_close.close();
        }
        glib::Propagation::Stop
    });
}

/// Snapshot the current tab set into a `chlodwig_core::WindowState`.
///
/// Walks `tab_view`'s pages in display order (left-to-right) and, for each,
/// looks up its tab in the registry. Only AI-conversation tabs contribute
/// entries — other tab kinds (none yet exist; reserved for future Browser /
/// Terminal / FileViewer kinds) are skipped silently because they have no
/// `session_started_at` to persist.
///
/// This is the single source of truth for "what's in this window right now"
/// and is called by [`snapshot_app_window_set`] for every window.
pub fn snapshot_window_state(
    tab_view: &libadwaita::TabView,
    _registry: &TabRegistry,
) -> chlodwig_core::WindowState {
    let mut tabs: Vec<chlodwig_core::TabState> = Vec::new();
    let mut active_index: usize = 0;
    let selected = tab_view.selected_page();

    for i in 0..tab_view.n_pages() {
        let page = tab_view.nth_page(i);
        let Some(ai) = ai_conversation::lookup_by_page(&page) else {
            continue;
        };
        if Some(&page) == selected.as_ref() {
            active_index = tabs.len();
        }
        tabs.push(chlodwig_core::TabState {
            session_started_at: ai.session_started_at.clone(),
            cwd: ai.app_state.borrow().cwd.clone(),
        });
    }

    chlodwig_core::WindowState {
        tabs,
        active_index,
    }
}

// ─────────────────────────────────────────────────────────────────────────
// App-level multi-window registry (Stage C).
// ─────────────────────────────────────────────────────────────────────────

/// One entry in the app-level [`AppWindowRegistry`]: the per-window
/// [`TabRegistry`], its `adw::TabView`, and the [`TabConfig`] every tab
/// in this window was/will be created with. Sufficient input for
/// [`snapshot_window_state`] **and** for menu actions that need to spawn
/// new tabs (Cmd+T, Sessions browser).
#[derive(Clone)]
pub struct WindowEntry {
    pub tab_view: libadwaita::TabView,
    pub registry: TabRegistry,
    pub config: TabConfig,
    pub window: ApplicationWindow,
}

/// All windows currently open in the app, in creation order. Cloned `Rc`s
/// passed into per-window handlers (close handler, persistence wiring,
/// `connect_create_window`) so any window can produce / mutate the
/// app-level snapshot.
pub type AppWindowRegistry = Rc<RefCell<Vec<WindowEntry>>>;

/// Snapshot every window in the app into a [`chlodwig_core::AppWindowSet`].
///
/// Called whenever a per-window shape change happens (tab attached/detached/
/// reordered/selected) AND whenever a window is added/removed from the app.
/// Single source of truth for "what is in the app right now".
pub fn snapshot_app_window_set(
    app_registry: &AppWindowRegistry,
) -> chlodwig_core::AppWindowSet {
    let mut windows = Vec::new();
    for entry in app_registry.borrow().iter() {
        windows.push(snapshot_window_state(&entry.tab_view, &entry.registry));
    }
    chlodwig_core::AppWindowSet {
        version: 2,
        windows,
    }
}

/// Persist the current app-level snapshot to `~/.chlodwig-rs/window_state.json`.
/// Called by [`wire_tab_set_persistence`] (per-window signal handlers) and
/// by [`build_window`] / window-close paths in the app.
///
/// Best-effort: I/O errors are logged via `tracing::warn!` but never
/// propagated — losing the snapshot is preferable to crashing.
pub fn save_app_window_state(app_registry: &AppWindowRegistry) {
    let set = snapshot_app_window_set(app_registry);
    if let Err(e) = chlodwig_core::save_window_state(&set) {
        tracing::warn!("Failed to save window_state: {e}");
    }
}

/// Subscribe to all `TabView` shape-change signals on `tab_view` and
/// re-save the **app-level** window state on each change.
///
/// Wired ONCE per window inside [`build_window`]. Signals covered:
///   - `connect_page_attached`     — new tab opened (Cmd+T, sessions browser)
///   - `connect_page_detached`     — tab closed
///   - `connect_page_reordered`    — drag to reorder
///   - `connect_selected_page_notify` — active tab changed
pub fn wire_tab_set_persistence(
    tab_view: &libadwaita::TabView,
    app_registry: &AppWindowRegistry,
) {
    {
        let app_for_attach = app_registry.clone();
        tab_view.connect_page_attached(move |_tv, _page, _pos| {
            save_app_window_state(&app_for_attach);
        });
    }
    {
        let app_for_detach = app_registry.clone();
        tab_view.connect_page_detached(move |_tv, _page, _pos| {
            save_app_window_state(&app_for_detach);
        });
    }
    {
        let app_for_reorder = app_registry.clone();
        tab_view.connect_page_reordered(move |_tv, _page, _pos| {
            save_app_window_state(&app_for_reorder);
        });
    }
    {
        let app_for_select = app_registry.clone();
        tab_view.connect_selected_page_notify(move |_tv| {
            save_app_window_state(&app_for_select);
        });
    }
}

/// Bundle of app-level shared state passed into [`build_window`].
///
/// Carries everything every window needs to wire its menus, registry,
/// persistence, and drag-out handler. Cloned (cheap — all `Rc` /
/// `Application` / `TabConfig`) into the new window.
pub struct BuildWindowContext {
    pub app: libadwaita::Application,
    pub config: TabConfig,
    pub app_registry: AppWindowRegistry,
}

/// **Single source of truth for "create one application window"**.
///
/// Called from three places — and ONLY from these three places:
///   1. `main.rs` startup: builds the initial window (and any restored
///      windows from `AppWindowSet`).
///   2. The `app.new-window` (Cmd+N) menu action: opens a fresh window.
///   3. `connect_create_window` callback: drag-out from any other window
///      lifts a tab into a fresh window.
///
/// What it does, in order:
///   1. Build the GTK shell (`ApplicationWindow` + `adw::TabView`).
///   2. Allocate the per-window `TabRegistry`.
///   3. Register this window in the app-level `AppWindowRegistry`.
///   4. Wire per-window handlers: tab close, app-level persistence on
///      shape change, window title following active tab, focus-on-active,
///      `connect_create_window` (so dragging a tab out of THIS window
///      opens yet another window).
///   5. Wire close-on-last-window: when this window is destroyed, remove
///      it from `AppWindowRegistry` and re-save the snapshot.
///   6. If `state` is `Some`, attach the listed tabs (using
///      [`AiConversationTab::attach_with_session`] for tabs whose
///      session file is readable, [`AiConversationTab::attach_new`]
///      otherwise). If `None`, attach a single fresh tab in `fallback_cwd`.
///   7. `present()` the window.
///
/// Returns the new `ApplicationWindow` so the caller can hold it (mostly
/// for tests; production callers ignore the return value because the
/// `AppWindowRegistry` already keeps it alive via the `tab_view` clone).
pub fn build_window(
    ctx: &BuildWindowContext,
    state: Option<chlodwig_core::WindowState>,
    fallback_cwd: std::path::PathBuf,
) -> ApplicationWindow {
    // ── 1. GTK shell ─────────────────────────────────────────────────
    let cwd_name_for_title = state
        .as_ref()
        .and_then(|ws| ws.tabs.first())
        .map(|t| t.cwd.clone())
        .unwrap_or_else(|| fallback_cwd.clone())
        .file_name()
        .map(|n| n.to_string_lossy().into_owned());
    let initial_title = chlodwig_gtk::window::format_window_title(
        cwd_name_for_title.as_deref(),
        None,
    );
    let (window, tab_view) =
        chlodwig_gtk::window::build_window_shell(&ctx.app, &initial_title);

    // ── 2. Per-window registry ───────────────────────────────────────
    let registry: TabRegistry = Rc::new(RefCell::new(Vec::new()));

    // ── 3. Register this window in the app-level registry ────────────
    ctx.app_registry.borrow_mut().push(WindowEntry {
        tab_view: tab_view.clone(),
        registry: registry.clone(),
        config: ctx.config.clone(),
        window: window.clone(),
    });

    // ── 4. Per-window handlers ───────────────────────────────────────

    // Tab close handler: clean up registry, close window when empty.
    wire_tab_view_close_handler(&tab_view, &registry, &window);

    // Persistence on per-window shape changes (saves the WHOLE app set).
    wire_tab_set_persistence(&tab_view, &ctx.app_registry);

    // Window title follows the active tab.
    {
        let registry_for_title = registry.clone();
        let window_for_title = window.clone();
        tab_view.connect_selected_page_notify(move |tv| {
            let Some(page) = tv.selected_page() else { return };
            let reg = registry_for_title.borrow();
            let Some((_, t)) = reg.iter().find(|(p, _)| p == &page) else { return };
            window_for_title.set_title(Some(&t.window_title()));
        });
    }

    // Re-focus the active tab's input on window activation.
    {
        let tab_view_for_focus = tab_view.clone();
        let registry_for_focus = registry.clone();
        window.connect_is_active_notify(move |w| {
            if !w.is_active() { return }
            if let Some(t) = active(&tab_view_for_focus, &registry_for_focus) {
                t.focus_input();
            }
        });
    }

    // Drag-out: dragging a tab out of THIS window's `TabView` creates a
    // new window via the same SSoT. Returns its `TabView` for libadwaita
    // to migrate the page into. We pass `Some(WindowState::empty())` so
    // build_window does NOT auto-attach a placeholder tab — libadwaita
    // will fill the new view with the dragged page.
    {
        let ctx_for_drag = BuildWindowContext {
            app: ctx.app.clone(),
            config: ctx.config.clone(),
            app_registry: ctx.app_registry.clone(),
        };
        let fallback_for_drag = fallback_cwd.clone();
        tab_view.connect_create_window(move |_src| {
            build_window(
                &ctx_for_drag,
                Some(chlodwig_core::WindowState::empty()),
                fallback_for_drag.clone(),
            );
            // Find the freshly-registered TabView (the last entry in the
            // app registry) and return it so libadwaita can migrate the
            // dragged page into it.
            ctx_for_drag
                .app_registry
                .borrow()
                .last()
                .map(|e| e.tab_view.clone())
        });
    }

    // When this window is closed (last tab gone or user clicks the close
    // button), remove it from the app-level registry and re-save.
    {
        let app_registry_for_close = ctx.app_registry.clone();
        let tab_view_for_close = tab_view.clone();
        window.connect_close_request(move |_w| {
            app_registry_for_close
                .borrow_mut()
                .retain(|e| e.tab_view != tab_view_for_close);
            save_app_window_state(&app_registry_for_close);
            glib::Propagation::Proceed
        });
    }

    // ── 5. Attach tabs ───────────────────────────────────────────────
    let attach_ctx = TabAttachContext {
        window: window.clone(),
        tab_view: tab_view.clone(),
        registry: registry.clone(),
        config: ctx.config.clone(),
    };

    if let Some(ws) = state {
        let mut active_page: Option<libadwaita::TabPage> = None;
        let active = ws.active_index;
        for (i, t) in ws.tabs.iter().enumerate() {
            let session_path = chlodwig_core::session_path_for(&t.session_started_at);
            let page = match chlodwig_core::load_session_from(&session_path) {
                Ok(snap) => AiConversationTab::attach_with_session(
                    &attach_ctx,
                    t.cwd.clone(),
                    snap,
                ),
                Err(e) => {
                    tracing::info!(
                        "window_state: session {} unreadable ({e}), opening fresh tab in {}",
                        t.session_started_at,
                        t.cwd.display()
                    );
                    AiConversationTab::attach_new(&attach_ctx, t.cwd.clone())
                }
            };
            if i == active {
                active_page = Some(page);
            }
        }
        if let Some(p) = active_page {
            tab_view.set_selected_page(&p);
        }
        // NOTE: empty `ws.tabs` intentionally does NOT auto-attach a tab.
        // This is the drag-out / placeholder path — libadwaita is about
        // to migrate a page into this view, and we must not race it with
        // a stray fresh AI tab. Callers that want "fresh window with one
        // tab" pass `None` instead of `Some(WindowState::empty())`.
    } else {
        // Fresh window — single AI tab in the fallback cwd.
        AiConversationTab::attach_new(&attach_ctx, fallback_cwd);
    }

    // ── 6. Present ───────────────────────────────────────────────────
    window.present();
    window
}
