//! AI-conversation tab kind.
//!
//! This is the concrete [`Tab`](crate::tab::Tab) implementation for tabs
//! that host a conversation with the LLM. All AI-specific state lives
//! here; the parent `tab` module knows nothing about
//! `ConversationState`, `BackgroundCommand`, channels, or
//! `ApiClient`.
//!
//! ── Single source of truth ─────────────────────────────────────────────
//!
//! Everything per-AI-tab lives **here**. There is exactly one path to
//! "create an AI tab and wire it up": [`AiConversationTab::attach_new`].
//! Both the initial tab created at startup and every Cmd+T tab go through
//! the same call.
//!
//! ── Lifetime model ────────────────────────────────────────────────────
//!
//! - The `Rc<AiConversationTab>` is held by:
//!   1. The shared [`TabRegistry`](crate::tab::TabRegistry) (as
//!      `Rc<dyn Tab>`).
//!   2. The AI-tab sidecar registry [`AI_REGISTRY`] (as
//!      `Rc<AiConversationTab>`) — used by [`crate::tab::active_ai`]
//!      to recover the concrete type for AI-only menu actions.
//!   3. Every per-tab event handler closure (via `Rc` clone).
//! - On tab close (`adw::TabView::connect_close_page` →
//!   [`crate::tab::wire_tab_view_close_handler`]):
//!   1. Both registries drop their `Rc`s.
//!   2. Once the last handler closure also drops its clone, the
//!      `prompt_tx` field goes with it.
//!   3. The background task's `prompt_rx.recv()` returns `None` and the
//!      Tokio task exits cleanly.

use std::any::Any;
use std::cell::{Cell, RefCell};
use std::rc::Rc;
use std::sync::Arc;
use std::sync::atomic::AtomicBool;
use std::time::Duration;

use gtk4::prelude::*;
use gtk4::{glib, ApplicationWindow};
use tokio::sync::mpsc::{self, UnboundedSender};

use chlodwig_core::{
    ConversationEvent, ConversationState, ContentBlock, Message, Role, ToolContext,
};
use chlodwig_gtk::app_state::AppState;
use chlodwig_gtk::window::{self, TabContent, UiWidgets};

use crate::{event_dispatch, submit, table_interactions};

/// Commands sent from the GTK main loop to the per-AI-tab background task.
///
/// One `BackgroundCommand` channel per AI tab — see
/// [`AiConversationTab::attach_new`].
pub enum BackgroundCommand {
    /// Submit a user prompt to the API.
    Prompt {
        text: String,
        pre_turn_usage: chlodwig_core::TurnUsage,
    },
    /// Clear the conversation (reset `ConversationState.messages`).
    ClearMessages,
    /// Save the current session to disk.
    SaveSession {
        started_at: String,
        table_sorts: Vec<chlodwig_core::TableSortState>,
        name: Option<String>,
        stats: chlodwig_core::SessionStats,
    },
    /// Restore messages from a loaded session into ConversationState.
    RestoreMessages { messages: Vec<Message> },
    /// Compact the conversation history.
    Compact { instructions: Option<String> },
    /// Roll back the last `count` text-bearing messages from
    /// `ConversationState.messages`. Replies on `ack` with the new
    /// (removed_count, remaining_messages) so the UI can rebuild its
    /// display from a consistent snapshot.
    Unwind {
        count: usize,
        ack: tokio::sync::oneshot::Sender<(usize, Vec<Message>)>,
    },
    /// Update `tool_context.working_directory` AND rebuild
    /// `system_prompt` for the new cwd.
    SetCwd { new_cwd: std::path::PathBuf },
}

/// Per-AI-tab state bundle.
///
/// Every field is required by at least one menu action, status update,
/// or background interaction — no optional fields. Read by per-tab
/// handler closures via `Rc<AiConversationTab>` clones.
pub struct AiConversationTab {
    pub page: libadwaita::TabPage,
    /// The `TabView` this tab lives in. Owned (cloned `GObject` ref —
    /// cheap, ref-counted) so the tab can self-select via [`Self::focus`]
    /// without callers having to pass it back in.
    pub tab_view: libadwaita::TabView,
    pub widgets: UiWidgets,
    pub app_state: Rc<RefCell<AppState>>,
    pub viewport_cols: Rc<Cell<usize>>,
    pub session_started_at: String,
    pub prompt_tx: UnboundedSender<BackgroundCommand>,
    /// Cooperative stop flag, shared with the per-tab background task
    /// (`conv_state.stop_requested`) and with the per-tab `SubmitContext`
    /// (so `/stop`, `stop`, and Esc-Esc can flip it).
    #[allow(dead_code)]
    pub stop_flag: Arc<AtomicBool>,
    /// Unread indicator: `true` when the tab's turn loop completed while
    /// the tab was NOT the selected tab. `refresh_tab_title()` prepends
    /// `●  ` when this is set. Cleared when the tab gains focus (via
    /// `connect_selected_page_notify` in `build_window`).
    pub unread: Cell<bool>,
}

impl crate::tab::Tab for AiConversationTab {
    fn page(&self) -> &libadwaita::TabPage {
        &self.page
    }
    fn cwd(&self) -> std::path::PathBuf {
        self.app_state.borrow().cwd.clone()
    }
    fn window_title(&self) -> String {
        let state = self.app_state.borrow();
        let cwd_name = state.cwd
            .file_name()
            .map(|n| n.to_string_lossy().into_owned());
        let session_name = state.session_name.clone();
        chlodwig_gtk::window::format_window_title(
            cwd_name.as_deref(),
            session_name.as_deref(),
        )
    }
    fn focus_input(&self) {
        self.widgets.input_view.grab_focus();
    }
    fn as_any(&self) -> &dyn Any {
        self
    }
}

impl AiConversationTab {
    /// Re-apply the tab-page title from the current `session_name` + `cwd`.
    ///
    /// Single source of truth for "what the tab tab text is". Called:
    ///   - Once at tab creation (in `attach_new`).
    ///   - From `submit.rs` after the `/name` command sets a new session name.
    ///   - From `restore.rs` after a session-restore that brings in a
    ///     persisted `session_name`.
    ///   - From the `/clear` action which clears `session_name` to `None`.
    ///   - From `event_dispatch` on `TurnComplete` when the tab is inactive
    ///     (sets `unread = true` beforehand → title gets `●  ` prefix).
    ///   - From `build_window`'s `connect_selected_page_notify` when the tab
    ///     gains focus (clears `unread` beforehand → prefix removed).
    ///
    /// The full title (with `Chlodwig` suffix) is also updated as the
    /// tooltip so the user can hover for the long form.
    pub fn refresh_tab_title(&self) {
        let state = self.app_state.borrow();
        let cwd_name = state.cwd
            .file_name()
            .map(|n| n.to_string_lossy().into_owned());
        let session_name = state.session_name.clone();
        drop(state); // drop borrow before GTK calls (Gotcha #46)
        let base_title = chlodwig_gtk::window::format_tab_title(
            session_name.as_deref(),
            cwd_name.as_deref(),
        );
        let tab_title = if self.unread.get() {
            format!("●  {}", base_title)
        } else {
            base_title
        };
        self.page.set_title(&tab_title);
        let tooltip = chlodwig_gtk::window::format_window_title(
            cwd_name.as_deref(),
            session_name.as_deref(),
        );
        self.page.set_tooltip(&tooltip);
    }

    /// Make this tab the visible (selected) page in its `TabView` and
    /// put keyboard focus in its prompt input.
    ///
    /// Called once at the end of [`Self::attach_inner`] so EVERY tab-
    /// creation path — Cmd+T menu action, startup initial tab, Sessions
    /// browser → `attach_with_session` — gets identical behavior:
    /// the new tab is selected and the cursor lands in the input.
    ///
    /// Self-focus rule: callers (menu actions, main.rs, sessions browser)
    /// must NOT call `set_selected_page` / `grab_focus` themselves —
    /// `AiConversationTab` is responsible for its own focus. The
    /// `TabView` reference is stored on `self` (set at construction in
    /// `attach_inner`) so callers don't need to plumb it back in.
    pub fn focus(&self) {
        self.tab_view.set_selected_page(&self.page);
        self.widgets.input_view.grab_focus();
    }
}

/// Resolved configuration values needed to spawn an AI tab.
///
/// Cloned (not moved) into each tab so opening N tabs all use the same
/// `api_key` / `model` / `max_tokens` / `base_url` settings.
#[derive(Clone)]
pub struct TabConfig {
    pub api_key: String,
    pub base_url: Option<String>,
    pub model: String,
    pub max_tokens: u32,
    pub api_format: chlodwig_core::ApiFormat,
}

impl From<chlodwig_core::ResolvedConfig> for TabConfig {
    fn from(c: chlodwig_core::ResolvedConfig) -> Self {
        Self {
            api_key: c.api_key,
            base_url: c.base_url,
            model: c.model,
            max_tokens: c.max_tokens,
            api_format: c.api_format,
        }
    }
}

impl TabConfig {
    /// Convert back to [`ResolvedConfig`] for API client construction.
    pub fn to_resolved(&self) -> chlodwig_core::ResolvedConfig {
        chlodwig_core::ResolvedConfig {
            api_key: self.api_key.clone(),
            base_url: self.base_url.clone(),
            model: self.model.clone(),
            max_tokens: self.max_tokens,
            api_format: self.api_format,
        }
    }
}

/// Bundled environment shared across tabs in the same window.
pub struct TabAttachContext {
    pub window: ApplicationWindow,
    pub tab_view: libadwaita::TabView,
    pub registry: crate::tab::TabRegistry,
    pub config: TabConfig,
}

// AI-tab sidecar registry. Maps `adw::TabPage` → `Rc<AiConversationTab>`.
//
// This exists in addition to the generic `crate::tab::TabRegistry`
// (which stores `Rc<dyn Tab>`) so that [`crate::tab::active_ai`] can
// recover the concrete `Rc<AiConversationTab>` for AI-only menu actions
// without touching the generic trait. Other tab kinds will get their
// own sidecar registry if/when they need typed downcast.
//
// Cleared per-page by [`deregister`] (called from
// `wire_tab_view_close_handler`).
thread_local! {
    static AI_REGISTRY: RefCell<Vec<(libadwaita::TabPage, Rc<AiConversationTab>)>> =
        RefCell::new(Vec::new());
}

fn register(page: libadwaita::TabPage, tab: Rc<AiConversationTab>) {
    AI_REGISTRY.with(|r| r.borrow_mut().push((page, tab)));
}

/// Drop the AI-tab sidecar entry for `page`. No-op if the page is not
/// an AI tab. Called by the generic `wire_tab_view_close_handler`.
pub(crate) fn deregister(page: &libadwaita::TabPage) {
    AI_REGISTRY.with(|r| r.borrow_mut().retain(|(p, _)| p != page));
}

/// Look up the AI-tab sidecar entry for `page`. Used internally by
/// [`crate::tab::active_ai`], and publicly by `main.rs` for the initial
/// tab's `--resume` path.
pub fn lookup_by_page(page: &libadwaita::TabPage) -> Option<Rc<AiConversationTab>> {
    AI_REGISTRY.with(|r| {
        r.borrow()
            .iter()
            .find(|(p, _)| p == page)
            .map(|(_, t)| t.clone())
    })
}

pub(crate) fn lookup_active(
    _tab_view: &libadwaita::TabView,
    _registry: &crate::tab::TabRegistry,
    page: &libadwaita::TabPage,
) -> Option<Rc<AiConversationTab>> {
    lookup_by_page(page)
}

impl AiConversationTab {
    /// Create a new AI-conversation tab inside `ctx.tab_view`, wire it
    /// up, spawn its background conversation task, and register its
    /// `Rc<Self>` in both the generic [`crate::tab::TabRegistry`] and
    /// the AI sidecar registry.
    ///
    /// This is the **single source of truth** for "AI-tab creation".
    /// Both the startup-time call (initial tab) and the Cmd+T menu
    /// action call this same function.
    ///
    /// Returns the newly-created `adw::TabPage`.
    pub fn attach_new(
        ctx: &TabAttachContext,
        cwd: std::path::PathBuf,
    ) -> libadwaita::TabPage {
        Self::attach_inner(ctx, cwd, None)
    }

    /// Attach a new AI-conversation tab and immediately restore a saved
    /// session into it. Used by the Sessions browser (Stage D.1) so that
    /// picking a session opens it as a NEW tab beside the current one,
    /// rather than overwriting the active tab's conversation.
    ///
    /// Goes through the same single construction path
    /// ([`Self::attach_inner`]) as [`Self::attach_new`] — only difference
    /// is that the snapshot is restored before this function returns.
    ///
    /// Returns the newly-created `adw::TabPage`.
    pub fn attach_with_session(
        ctx: &TabAttachContext,
        cwd: std::path::PathBuf,
        snapshot: chlodwig_core::SessionSnapshot,
    ) -> libadwaita::TabPage {
        Self::attach_inner(ctx, cwd, Some(snapshot))
    }

    /// Single source of truth for AI-tab construction.
    ///
    /// Both [`Self::attach_new`] (fresh tab) and
    /// [`Self::attach_with_session`] (Sessions browser → new tab)
    /// delegate here. When `snapshot` is `Some`, the restored session is
    /// applied via [`crate::restore::apply_restored_session_to_ui`] —
    /// the same SSoT used by `--resume` and `/resume`.
    fn attach_inner(
        ctx: &TabAttachContext,
        cwd: std::path::PathBuf,
        snapshot: Option<chlodwig_core::SessionSnapshot>,
    ) -> libadwaita::TabPage {
        // ── 1. Build per-tab widgets ──────────────────────────────────
        let TabContent { root, widgets, cwd } = window::build_tab_content(&cwd);

        // ── 2. Per-tab state + channels + flags ───────────────────────
        let app_state = Rc::new(RefCell::new(AppState::with_cwd(
            ctx.config.model.clone(),
            cwd.clone(),
        )));
        let viewport_cols: Rc<Cell<usize>> = Rc::new(Cell::new(120));
        let session_started_at = chrono::Local::now().to_rfc3339();
        let (event_tx, event_rx) = mpsc::unbounded_channel::<ConversationEvent>();
        let event_rx = Rc::new(RefCell::new(Some(event_rx)));
        let (uq_tx, uq_rx) =
            mpsc::unbounded_channel::<chlodwig_tools::UserQuestionRequest>();
        let uq_rx = Rc::new(RefCell::new(Some(uq_rx)));
        let (prompt_tx, prompt_rx) = mpsc::unbounded_channel::<BackgroundCommand>();
        let stop_flag: Arc<AtomicBool> = chlodwig_core::new_stop_flag();

        // ── 3. Append page to TabView ─────────────────────────────────
        // Title + tooltip are applied via `refresh_tab_title()` after the
        // `AiConversationTab` value is constructed below — single source
        // of truth for the tab-title format.
        let page = ctx.tab_view.append(&root);

        // ── 4. Initial UI render: status bar + startup CWD banner ─────
        window::update_status(
            &widgets.status_left_label,
            &widgets.status_right_label,
            &app_state.borrow(),
        );
        {
            let cwd_msg = app_state.borrow().startup_cwd_message();
            window::append_styled(
                &widgets.final_view,
                &format!("{cwd_msg}\n"),
                "system",
            );
        }

        // ── 5. Per-tab handlers (input shortcuts, copy feedback, scroll)
        // Cmd+C/Cmd+X on the focused input view first consult the output
        // views for an active selection — see Gotcha #45 + window.rs docs
        // on `setup_macos_input_shortcuts`. The output views are non-
        // focusable, so without this priority list Cmd+C would silently
        // copy the (usually empty) input selection.
        chlodwig_gtk::window::setup_macos_input_shortcuts(
            &widgets.input_view,
            &[
                widgets.final_view.clone().upcast::<gtk4::TextView>(),
                widgets.streaming_view.clone().upcast::<gtk4::TextView>(),
            ],
        );

        {
            // Issue #26: per-window cap on input height (half the window's
            // default-height).
            let input_scroll_for_resize = widgets.input_scroll.clone();
            let apply_cap = move |height: i32| {
                let cap = (height / 2).max(40);
                input_scroll_for_resize.set_max_content_height(cap);
            };
            apply_cap(ctx.window.default_height());
            let apply_cap_clone = apply_cap.clone();
            ctx.window.connect_default_height_notify(move |w| {
                apply_cap_clone(w.default_height());
            });
        }

        // Copy feedback: show "✓ Copied!" in this tab's status bar +
        // mirror selection to NSPasteboard so native macOS apps see the
        // copied text. Wired to BOTH output views — every Cmd+C /
        // right-click-Copy on either view goes through here.
        {
            let state_for_copy = app_state.clone();
            let status_left_for_copy = widgets.status_left_label.clone();
            let status_right_for_copy = widgets.status_right_label.clone();
            let on_copy = std::rc::Rc::new(move |view: &gtk4::TextView| {
                // Defer the NSPasteboard write to the next idle tick so
                // it lands AFTER GTK's default copy-clipboard handler
                // (GdkMacosClipboard::set_content) has finished mutating
                // NSPasteboard. Writing synchronously here lets the
                // default handler wipe our plain-text entry a
                // microsecond later — Spotlight then sees nothing.
                // See Gotcha #53. The Cmd+C key handler in window.rs
                // does not need this because it calls
                // emit_copy_clipboard() itself and can order the writes.
                let view_for_idle = view.clone();
                glib::idle_add_local_once(move || {
                    window::write_selection_to_macos_clipboard(&view_for_idle);
                });
                state_for_copy.borrow_mut().set_copy_feedback("✓ Copied!");
                status_left_for_copy.set_label("✓ Copied!");
                let state_for_clear = state_for_copy.clone();
                let left_for_clear = status_left_for_copy.clone();
                let right_for_clear = status_right_for_copy.clone();
                glib::timeout_add_local_once(
                    std::time::Duration::from_secs(2),
                    move || {
                        let mut state = state_for_clear.borrow_mut();
                        state.copy_feedback = None;
                        window::update_status(&left_for_clear, &right_for_clear, &state);
                    },
                );
            });
            let on_copy_final = on_copy.clone();
            widgets
                .final_view
                .connect_copy_clipboard(move |view| on_copy_final(view.upcast_ref::<gtk4::TextView>()));
            let on_copy_streaming = on_copy.clone();
            widgets
                .streaming_view
                .connect_copy_clipboard(move |view| on_copy_streaming(view.upcast_ref::<gtk4::TextView>()));
        }

        // Per-tab user-scroll detection → drives auto_scroll state machine
        // AND the visibility of the floating ↓ jump-to-bottom button
        // (issue #28). Same `at_bottom` boolean drives both — single
        // source of truth, no second visibility handler.
        {
            let adj = widgets.output_scroll.vadjustment();
            let state_for_scroll = app_state.clone();
            let final_view_for_scroll = widgets.final_view.clone();
            let streaming_view_for_scroll = widgets.streaming_view.clone();
            let scroll_btn_for_scroll = widgets.scroll_to_bottom_button.clone();
            let prev_snap = Rc::new(Cell::new(
                chlodwig_gtk::value_changed::AdjSnapshot {
                    value: adj.value(),
                    upper: adj.upper(),
                    page_size: adj.page_size(),
                },
            ));
            adj.connect_value_changed(move |adj| {
                let curr = chlodwig_gtk::value_changed::AdjSnapshot {
                    value: adj.value(),
                    upper: adj.upper(),
                    page_size: adj.page_size(),
                };
                let prev = prev_snap.get();
                prev_snap.set(curr);
                if !chlodwig_gtk::value_changed::is_user_scroll(prev, curr) {
                    return;
                }
                let final_h = final_view_for_scroll
                    .upcast_ref::<gtk4::TextView>()
                    .allocated_height() as f64;
                let stream_h = if streaming_view_for_scroll.is_visible() {
                    streaming_view_for_scroll
                        .upcast_ref::<gtk4::TextView>()
                        .allocated_height() as f64
                } else {
                    0.0
                };
                let content_bottom = final_h + stream_h;
                let at_bottom = (curr.value + curr.page_size) >= content_bottom - 20.0;
                // Toggle the floating ↓ button BEFORE acquiring the
                // RefCell borrow. set_visible is synchronous and may
                // emit signals (Gotcha #46), so it must not be called
                // while we hold a borrow. The button itself does not
                // need any AppState — it's a pure visibility flip.
                scroll_btn_for_scroll.set_visible(!at_bottom);
                let mut state = state_for_scroll.borrow_mut();
                if at_bottom {
                    state.auto_scroll.user_reached_bottom();
                } else {
                    state.auto_scroll.user_scrolled_away();
                }
            });
        }

        // ── 6. Per-tab feature wirings ────────────────────────────────
        submit::wire(submit::SubmitContext {
            widgets: widgets.clone(),
            app_state: app_state.clone(),
            prompt_tx: prompt_tx.clone(),
            viewport_cols: viewport_cols.clone(),
            window: ctx.window.clone(),
            session_started_at: session_started_at.clone(),
            page: page.clone(),
            stop_flag: stop_flag.clone(),
        });
        table_interactions::wire(
            &widgets,
            &app_state,
            &viewport_cols,
            &prompt_tx,
            &session_started_at,
        );
        event_dispatch::wire(event_dispatch::EventDispatchContext {
            widgets: widgets.clone(),
            app_state: app_state.clone(),
            event_rx: event_rx.clone(),
            uq_rx: uq_rx.clone(),
            prompt_tx: prompt_tx.clone(),
            viewport_cols: viewport_cols.clone(),
            window: ctx.window.clone(),
            session_started_at: session_started_at.clone(),
            page: page.clone(),
            tab_view: ctx.tab_view.clone(),
        });

        // ── 7. Spawn per-tab background conversation task ─────────────
        spawn_conversation_task(SpawnArgs {
            config: ctx.config.clone(),
            cwd: cwd.clone(),
            event_tx: event_tx.clone(),
            uq_tx,
            prompt_rx,
            stop_flag: stop_flag.clone(),
        });

        // ── 8. Register in BOTH the generic trait registry AND the AI
        //       sidecar registry ──────────────────────────────────────
        let tab = Rc::new(AiConversationTab {
            page: page.clone(),
            tab_view: ctx.tab_view.clone(),
            widgets,
            app_state,
            viewport_cols,
            session_started_at,
            prompt_tx,
            stop_flag,
            unread: Cell::new(false),
        });
        ctx.registry
            .borrow_mut()
            .push((page.clone(), tab.clone() as Rc<dyn crate::tab::Tab>));
        register(page.clone(), tab.clone());

        // Apply the initial tab title now that the AiConversationTab value
        // exists (single SSoT — same path used after /name, /clear, restore).
        tab.refresh_tab_title();

        // ── 9. Optional session restore (Stage D.1) ───────────────────
        // When called via `attach_with_session`, replay the snapshot
        // through the SAME restore path as `--resume` and `/resume`.
        // SSoT: `crate::restore::apply_restored_session_to_ui`.
        if let Some(snap) = snapshot {
            let cwd_name: Option<String> = {
                let n = tab.app_state.borrow().project_dir_name();
                if n.is_empty() {
                    None
                } else {
                    Some(n)
                }
            };
            let restore_ctx = crate::restore::RestoreContext {
                state: &tab.app_state,
                output_view: &tab.widgets.final_view,
                streaming_view: &tab.widgets.streaming_view,
                output_scroll: &tab.widgets.output_scroll,
                window: &ctx.window,
                viewport_cols: &tab.viewport_cols,
                status_left: &tab.widgets.status_left_label,
                status_right: &tab.widgets.status_right_label,
                prompt_tx: &tab.prompt_tx,
                cwd_name: cwd_name.as_deref(),
            };
            crate::restore::apply_restored_session_to_ui(snap, &restore_ctx);
            // Restore may have set a session_name → reflect it in the
            // tab's title (already SSoT via refresh_tab_title()).
            tab.refresh_tab_title();
        }

        // ── 10. Self-focus: select the new page in its TabView and put
        //        keyboard focus into the prompt input. SSoT for "new tab
        //        gets focus" — same path for Cmd+T, initial tab, and
        //        Sessions browser → attach_with_session. Callers must
        //        not duplicate this dance.
        tab.focus();

        page
    }
}

/// Background-task arguments — bundled to keep `spawn_conversation_task`
/// callable cleanly from `attach_new` (8 args otherwise).
struct SpawnArgs {
    config: TabConfig,
    cwd: std::path::PathBuf,
    event_tx: tokio::sync::mpsc::UnboundedSender<ConversationEvent>,
    uq_tx: tokio::sync::mpsc::UnboundedSender<chlodwig_tools::UserQuestionRequest>,
    prompt_rx: tokio::sync::mpsc::UnboundedReceiver<BackgroundCommand>,
    stop_flag: Arc<AtomicBool>,
}

/// Spawn the per-tab Tokio runtime + conversation loop.
///
/// One thread per tab (each thread owns its own Tokio runtime). When the
/// matching `prompt_tx` is dropped (tab close), `prompt_rx.recv()` returns
/// `None` and the task exits cleanly.
fn spawn_conversation_task(args: SpawnArgs) {
    let SpawnArgs {
        config,
        cwd,
        event_tx,
        uq_tx,
        mut prompt_rx,
        stop_flag,
    } = args;

    std::thread::spawn(move || {
        let rt = tokio::runtime::Runtime::new()
            .expect("Failed to create Tokio runtime for tab");
        rt.block_on(async move {
            let api_client = chlodwig_api::create_client(&config.to_resolved());

            let system_prompt = chlodwig_core::build_system_prompt(
                None,
                chlodwig_core::UiContext::Gui,
                &cwd,
            );
            let mut tools = chlodwig_tools::builtin_tools();
            tools.push(Box::new(chlodwig_tools::UserQuestionTool::new(uq_tx)));

            let mut conv_state = ConversationState {
                messages: Vec::new(),
                model: config.model,
                system_prompt,
                max_tokens: config.max_tokens,
                tools,
                tool_context: ToolContext {
                    working_directory: cwd.clone(),
                    timeout: Duration::from_secs(120),
                },
                stop_requested: stop_flag.clone(),
            };

            let permission = chlodwig_core::AutoApprovePrompter;

            while let Some(bg_cmd) = prompt_rx.recv().await {
                match bg_cmd {
                    BackgroundCommand::ClearMessages => {
                        conv_state.messages.clear();
                    }
                    BackgroundCommand::Unwind { count, ack } => {
                        let removed = chlodwig_core::reducers::unwind_messages(
                            &mut conv_state.messages,
                            count,
                        );
                        let _ = ack.send((removed, conv_state.messages.clone()));
                    }
                    BackgroundCommand::SaveSession {
                        started_at,
                        table_sorts,
                        name,
                        stats,
                    } => {
                        let snapshot = chlodwig_core::build_snapshot(
                            &conv_state,
                            started_at,
                            table_sorts,
                            name,
                            None,
                            Some(stats),
                        );
                        if let Err(e) = chlodwig_core::save_session(&snapshot) {
                            tracing::warn!("Failed to auto-save session: {e}");
                        }
                    }
                    BackgroundCommand::RestoreMessages { messages } => {
                        conv_state.messages = messages;
                        tracing::info!(
                            "Restored {} messages into ConversationState",
                            conv_state.messages.len()
                        );
                    }
                    BackgroundCommand::SetCwd { new_cwd } => {
                        conv_state.tool_context.working_directory = new_cwd.clone();
                        conv_state.system_prompt = chlodwig_core::build_system_prompt(
                            None,
                            chlodwig_core::UiContext::Gui,
                            &new_cwd,
                        );
                        tracing::info!("Background: cwd changed to {}", new_cwd.display());
                    }
                    BackgroundCommand::Compact { instructions } => {
                        let _ = event_tx.send(ConversationEvent::CompactionStarted);
                        if let Err(e) = chlodwig_core::compact_conversation(
                            &mut conv_state,
                            api_client.as_ref(),
                            &event_tx,
                            instructions.as_deref(),
                        )
                        .await
                        {
                            tracing::error!("Compaction error: {e}");
                            let _ = event_tx
                                .send(ConversationEvent::Error(format!(
                                    "Compaction failed: {e}"
                                )));
                        }
                    }
                    BackgroundCommand::Prompt {
                        text: prompt,
                        pre_turn_usage,
                    } => {
                        chlodwig_core::auto_compact_if_needed(
                            &pre_turn_usage,
                            &mut conv_state,
                            api_client.as_ref(),
                            &event_tx,
                        )
                        .await;

                        conv_state.messages.push(Message {
                            role: Role::User,
                            content: vec![ContentBlock::Text { text: prompt }],
                        });

                        let result = chlodwig_core::run_turn(
                            &mut conv_state,
                            api_client.as_ref(),
                            &permission,
                            &event_tx,
                        )
                        .await;

                        match result {
                            Ok(()) => {
                                let _ = event_tx.send(ConversationEvent::TurnComplete);
                            }
                            Err(e) => {
                                tracing::error!("Conversation error: {e}");
                                let _ = event_tx
                                    .send(ConversationEvent::Error(e.to_string()));
                            }
                        }
                    }
                }
            }
            tracing::debug!("AI tab background task exiting (prompt channel closed)");
        });
    });
}
