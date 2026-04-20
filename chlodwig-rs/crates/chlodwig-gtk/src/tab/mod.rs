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
    fn cwd(&self) -> &Path;

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
