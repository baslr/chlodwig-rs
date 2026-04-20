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
}

/// Per-AI-tab state bundle.
///
/// Every field is required by at least one menu action, status update,
/// or background interaction — no optional fields. Read by per-tab
/// handler closures via `Rc<AiConversationTab>` clones.
pub struct AiConversationTab {
    pub page: libadwaita::TabPage,
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
    pub cwd: std::path::PathBuf,
}

impl crate::tab::Tab for AiConversationTab {
    fn page(&self) -> &libadwaita::TabPage {
        &self.page
    }
    fn cwd(&self) -> &std::path::Path {
        &self.cwd
    }
    fn window_title(&self) -> String {
        let cwd_name = self.cwd
            .file_name()
            .map(|n| n.to_string_lossy().into_owned());
        let session_name = self.app_state.borrow().session_name.clone();
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
}

impl From<chlodwig_core::ResolvedConfig> for TabConfig {
    fn from(c: chlodwig_core::ResolvedConfig) -> Self {
        Self {
            api_key: c.api_key,
            base_url: c.base_url,
            model: c.model,
            max_tokens: c.max_tokens,
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
        let page = ctx.tab_view.append(&root);
        let tab_title = window::format_window_title(
            cwd.file_name()
                .map(|n| n.to_string_lossy().into_owned())
                .as_deref(),
            None,
        );
        let short_title = cwd
            .file_name()
            .map(|n| n.to_string_lossy().into_owned())
            .unwrap_or_else(|| "(no project)".to_string());
        page.set_title(&short_title);
        page.set_tooltip(&tab_title);

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
        chlodwig_gtk::window::setup_macos_input_shortcuts(&widgets.input_view);

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

        // Copy feedback: show "✓ Copied!" in this tab's status bar.
        {
            let state_for_copy = app_state.clone();
            let status_left_for_copy = widgets.status_left_label.clone();
            let status_right_for_copy = widgets.status_right_label.clone();
            widgets.final_view.connect_copy_clipboard(move |_view| {
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
        }

        // Per-tab user-scroll detection → drives auto_scroll state machine.
        {
            let adj = widgets.output_scroll.vadjustment();
            let state_for_scroll = app_state.clone();
            let final_view_for_scroll = widgets.final_view.clone();
            let streaming_view_for_scroll = widgets.streaming_view.clone();
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
            widgets,
            app_state,
            viewport_cols,
            session_started_at,
            prompt_tx,
            stop_flag,
            cwd,
        });
        ctx.registry
            .borrow_mut()
            .push((page.clone(), tab.clone() as Rc<dyn crate::tab::Tab>));
        register(page.clone(), tab);

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
            let mut client = chlodwig_api::AnthropicClient::new(config.api_key);
            if let Some(url) = config.base_url {
                client = client.with_base_url(url);
            }
            let api_client: Arc<dyn chlodwig_core::ApiClient> = Arc::new(client);

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
