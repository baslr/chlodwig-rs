//! Chlodwig GTK — native GUI entry point.
//!
//! This binary provides the same functionality as `chlodwig-rs` (terminal TUI)
//! but rendered in a native GTK4/Adwaita window instead of a terminal emulator.

use gtk4::prelude::*;
use gtk4::glib;
use std::cell::{Cell, RefCell};
use std::rc::Rc;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::mpsc;

use chlodwig_core::{
    ConversationEvent, ConversationState, ContentBlock, Message, Role, ToolContext,
};
use chlodwig_gtk::app_state::AppState;
use chlodwig_gtk::window;

/// Commands sent from the GTK main loop to the background conversation task.
enum BackgroundCommand {
    /// Submit a user prompt to the API.
    Prompt { text: String, pre_turn_usage: chlodwig_core::TurnUsage },
    /// Clear the conversation (reset `ConversationState.messages`).
    ClearMessages,
    /// Save the current session to disk.
    SaveSession { started_at: String, table_sorts: Vec<chlodwig_core::TableSortState>, name: Option<String>, stats: chlodwig_core::SessionStats },
    /// Restore messages from a loaded session into ConversationState.
    RestoreMessages { messages: Vec<Message> },
    /// Compact the conversation history.
    Compact { instructions: Option<String> },
}

fn main() -> glib::ExitCode {
    // Extend PATH with well-known directories (MacPorts, Homebrew, Cargo, etc.)
    // so child processes (git, rg, cargo, ...) can be found in restricted
    // environments (e.g. macOS GUI launch, minimal login shells).
    chlodwig_core::enrich_path();

    // Force the Cairo GSK renderer on macOS. The default GskNglRenderer has a
    // texture-loading bug ("GLD_TEXTURE_INDEX_2D is unloadable") that makes
    // glyphs invisible. The Cairo renderer bypasses OpenGL and renders text
    // correctly via PangoCairo directly.
    chlodwig_gtk::ensure_cairo_renderer();

    // Force the CoreText backend on macOS. Pango 1.55+ with MacPorts defaults
    // to fontconfig/FreeType which maps geometric symbols (▶, →, ■) to Noto
    // Color Emoji — a color font that Cairo cannot render, making them invisible.
    // CoreText maps these symbols to system fonts (Lucida Grande, .AppleSystemUIFont)
    // that render correctly through Cairo.
    //
    // Note: Color emojis (🌻, 🔥, etc.) are not renderable with Pango 1.x +
    // PangoCairo regardless of backend — PangoCairo uses cairo_show_glyphs()
    // which has no color font support. Color emoji rendering requires Pango 2.x
    // (PangoHbFont path) or a GtkTextBuffer paintable-based approach.
    chlodwig_gtk::ensure_coretext_backend();

    // Initialize tracing FIRST so any subsequent setup error (CJK font
    // install, notification permission, etc.) lands in the debug log.
    let debug_log_path = chlodwig_core::timestamped_log_path("debug_gtk");
    if let Ok(log_file) = std::fs::File::create(&debug_log_path) {
        tracing_subscriber::fmt()
            .with_env_filter(
                tracing_subscriber::EnvFilter::from_default_env()
                    .add_directive("chlodwig_core=debug".parse().unwrap())
                    .add_directive("chlodwig_api=debug".parse().unwrap())
                    .add_directive("chlodwig_tools=debug".parse().unwrap())
                    .add_directive("chlodwig_gtk=debug".parse().unwrap())
                    .add_directive("hyper=warn".parse().unwrap())
                    .add_directive("reqwest=warn".parse().unwrap()),
            )
            .with_target(true)
            .with_ansi(false)
            .with_writer(std::sync::Mutex::new(log_file))
            .init();
    }

    tracing::info!("chlodwig-gtk starting");

    // Install the bundled Sarasa Mono J font into the user's standard
    // font directory (~/Library/Fonts on macOS, ~/.local/share/fonts on
    // Linux). Without this, CJK characters and box-drawing chars in
    // markdown tables render with mismatched advance widths, breaking
    // column alignment (`│` shifts because Latin/box-drawing must be
    // exactly half of CJK at the pixel level).
    //
    // The font is also bundled inside the .app at Contents/Resources/Fonts/
    // and auto-loaded by CoreText via Info.plist's ATSApplicationFontsPath
    // — this call is the Linux/dev-build path and a belt-and-suspenders
    // installer on macOS. Idempotent.
    match chlodwig_gtk::install_bundled_cjk_font() {
        Some(Ok(p)) => tracing::info!("CJK font installed: {}", p.display()),
        Some(Err(e)) => tracing::warn!(
            "CJK font install failed: {} (CJK in tables may misalign)", e
        ),
        None => tracing::info!("CJK font install skipped (no user font dir on this platform)"),
    }

    // Check for --resume flag before GTK init
    let resume_flag = std::env::args().any(|a| a == "--resume" || a == "-r");

    // Resolve the initial working directory for the (single, for now) tab.
    // Priority: Finder pasteboard > CHLODWIG_PROJECT_DIR > CLI args > process CWD.
    // No longer calls set_current_dir(): per Stage 0.3 of MULTIWINDOW_TABS.md
    // each tab carries its own cwd in AppState. The process CWD stays as-is
    // so future tabs/windows can have independent working directories.
    let initial_cwd = chlodwig_gtk::setup::resolve_initial_cwd();
    tracing::info!("Initial tab cwd: {}", initial_cwd.display());

    // Initialize Adwaita application
    let app = libadwaita::Application::builder()
        .application_id("rs.chlodwig.gtk")
        .build();

    app.connect_activate(move |app| {
        activate(app, resume_flag, initial_cwd.clone());
    });

    app.run()
}

fn activate(app: &libadwaita::Application, resume_flag: bool, initial_cwd: std::path::PathBuf) {
    let (window, tab) = window::build_window(app, &initial_cwd);
    let widgets = tab.widgets;

    // --- Viewport width tracking for Markdown table rendering ---
    // Tables use monospace font, so we need to know how many monospace
    // columns fit in the output view. Computed lazily from the widget's
    // current allocation. All render functions read this shared cell,
    // which is updated before each render pass.
    let viewport_cols: Rc<Cell<usize>> = Rc::new(Cell::new(120)); // sensible default

    // Generate a unique session start timestamp — used as the filename
    // for the per-session save file (YYYY_MM_DD_HH_MM_SS.json).
    let session_started_at = chrono::Local::now().to_rfc3339();

    // Cmd+Q → quit application
    let quit_action = gtk4::gio::SimpleAction::new("quit", None);
    let app_for_quit = app.clone();
    quit_action.connect_activate(move |_, _| {
        app_for_quit.quit();
    });
    app.add_action(&quit_action);
    app.set_accels_for_action("app.quit", &["<Meta>q"]);

    // Request notification permission on macOS (shows system dialog on first launch).
    #[cfg(target_os = "macos")]
    chlodwig_gtk::notification::request_notification_permission();

    // --- Resolve configuration (config.json → env vars → no CLI args for GTK) ---
    let resolved_config = match chlodwig_core::resolve_config(chlodwig_core::ConfigOverrides::default()) {
        Ok(cfg) => cfg,
        Err(msg) => {
            eprintln!("Configuration error: {msg}");
            // Show error in a dialog? For now, just fail.
            return;
        }
    };

    // --- Shared state ---
    let app_state = Rc::new(RefCell::new(AppState::with_cwd(
        resolved_config.model.clone(),
        initial_cwd.clone(),
    )));

    // Channel: conversation events from background task → GTK main loop
    let (event_tx, event_rx) = mpsc::unbounded_channel::<ConversationEvent>();
    let event_rx = Rc::new(RefCell::new(Some(event_rx)));

    // Channel: UserQuestion tool → GTK dialog
    let (uq_tx, uq_rx) = mpsc::unbounded_channel::<chlodwig_tools::UserQuestionRequest>();
    let uq_rx = Rc::new(RefCell::new(Some(uq_rx)));

    // Channel: commands from GTK → background task
    let (prompt_tx, mut prompt_rx) = mpsc::unbounded_channel::<BackgroundCommand>();

    // Shared cooperative stop flag. UI code sets this via `/stop`, bare `stop`,
    // or double-Escape; `run_turn` in the background task observes it after the
    // current SSE message_stop and cancels pending tool_uses.
    let stop_flag: Arc<std::sync::atomic::AtomicBool> = chlodwig_core::new_stop_flag();

    // --- Native macOS menu bar ---
    menu::setup_menu(menu::MenuContext {
        app: app.clone(),
        window: window.clone(),
        widgets: widgets.clone(),
        app_state: app_state.clone(),
        prompt_tx: prompt_tx.clone(),
        viewport_cols: viewport_cols.clone(),
        session_started_at: session_started_at.clone(),
    });

    // Set initial status
    window::update_status(&widgets.status_left_label, &widgets.status_right_label, &app_state.borrow());

    // Show current working directory in the output area at startup
    {
        let cwd_msg = app_state.borrow().startup_cwd_message();
        window::append_styled(&widgets.final_view, &format!("{cwd_msg}\n"), "system");
    }

    // --- Resume session if --resume flag was passed ---
    if resume_flag {
        match chlodwig_core::load_latest_session() {
            Ok(Some(snapshot)) => {
                tracing::info!("Resuming session with {} messages", snapshot.messages.len());
                let cwd_name: Option<String> = {
                    let s = app_state.borrow();
                    let n = s.project_dir_name();
                    if n.is_empty() { None } else { Some(n) }
                };
                let ctx = restore::RestoreContext {
                    state: &app_state,
                    output_view: &widgets.final_view,
                    streaming_view: &widgets.streaming_view,
                    output_scroll: &widgets.output_scroll,
                    window: &window,
                    viewport_cols: &viewport_cols,
                    status_left: &widgets.status_left_label,
                    status_right: &widgets.status_right_label,
                    prompt_tx: &prompt_tx,
                    cwd_name: cwd_name.as_deref(),
                };
                restore::apply_restored_session_to_ui(snapshot, &ctx);
            }
            Ok(None) => {
                window::append_styled(
                    &widgets.final_view,
                    "No saved session found — starting fresh.\n",
                    "system",
                );
            }
            Err(e) => {
                window::append_styled(
                    &widgets.final_view,
                    &format!("Failed to load session: {e}\n"),
                    "error",
                );
            }
        }
    }

    // --- Wire up Send button + Cmd/Ctrl+Return shortcut ---
    submit::wire(submit::SubmitContext {
        widgets: widgets.clone(),
        app_state: app_state.clone(),
        prompt_tx: prompt_tx.clone(),
        viewport_cols: viewport_cols.clone(),
        window: window.clone(),
        session_started_at: session_started_at.clone(),
        stop_flag: stop_flag.clone(),
    });

    // --- Wire up Toggle Tool Usage button ---
    let state_for_toggle = app_state.clone();
    let final_view_for_toggle = widgets.final_view.clone();
    let viewport_cols_for_toggle = viewport_cols.clone();
    let final_view_for_viewport = widgets.final_view.clone();
    widgets.toggle_tool_button.connect_clicked(move |btn| {
        let mut state = state_for_toggle.borrow_mut();
        state.show_tool_usage = !state.show_tool_usage;
        btn.set_label(if state.show_tool_usage { "Hide Tools" } else { "Show Tools" });

        // Re-render entire output from blocks (no scroll — user wants to keep reading).
        viewport_cols_for_toggle.set(
            chlodwig_gtk::viewport::viewport_columns(
                final_view_for_viewport.upcast_ref::<gtk4::TextView>(),
            ),
        );
        render::render_all_blocks_into(
            &final_view_for_toggle,
            &state,
            viewport_cols_for_toggle.get(),
            true,
        );
    });

    // macOS Cmd/Option shortcuts (shared with UserQuestion dialog)
    chlodwig_gtk::window::setup_macos_input_shortcuts(&widgets.input_view);

    // Header click → sort table; mouse hover → highlight data row.
    table_interactions::wire(
        &widgets,
        &app_state,
        &viewport_cols,
        &prompt_tx,
        &session_started_at,
    );

    // --- Copy feedback: show "✓ Copied!" in status bar when text is copied ---
    let state_for_copy = app_state.clone();
    let status_left_for_copy = widgets.status_left_label.clone();
    let status_right_for_copy = widgets.status_right_label.clone();
    widgets.final_view.connect_copy_clipboard(move |_view| {
        state_for_copy.borrow_mut().set_copy_feedback("✓ Copied!");
        // Show feedback immediately
        status_left_for_copy.set_label("✓ Copied!");
        // Clear feedback after 2 seconds
        let state_for_clear = state_for_copy.clone();
        let left_for_clear = status_left_for_copy.clone();
        let right_for_clear = status_right_for_copy.clone();
        glib::timeout_add_local_once(std::time::Duration::from_secs(2), move || {
            let mut state = state_for_clear.borrow_mut();
            state.copy_feedback = None;
            window::update_status(&left_for_clear, &right_for_clear, &state);
        });
    });

    // --- Detect user scroll to manage auto-scroll state ---
    // When the user scrolls the output view manually (e.g. trackpad, scrollbar),
    // we disable auto-scroll so new content doesn't yank them back to bottom.
    // When they scroll back to the bottom, re-enable auto-scroll.
    //
    // CRITICAL: `value-changed` also fires when GTK itself clamps `value`
    // after `upper` or `page_size` changed (e.g. streaming_view hidden on
    // TextComplete → content shrinks → clamp → signal). Those are NOT
    // user scrolls and must not alter auto_scroll state, otherwise a
    // stream finishing snaps the viewport to the bottom even though the
    // user had scrolled up. See `value_changed::is_user_scroll` and the
    // regression tests in `tests/value_changed_classification_tests.rs`.
    {
        let adj = widgets.output_scroll.vadjustment();
        let state_for_scroll = app_state.clone();
        let final_view_for_scroll = widgets.final_view.clone();
        let streaming_view_for_scroll = widgets.streaming_view.clone();
        let prev_snap = std::rc::Rc::new(std::cell::Cell::new(
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
                // Layout-induced clamp (content or viewport resized).
                // Do NOT touch auto_scroll — keep whatever the user set.
                return;
            }
            // "at_bottom" means at the bottom of the actual content
            // (final + streaming), NOT at upper — upper is inflated by
            // the bottom spacer to keep value un-clamped during the
            // streaming→final transition. See window.rs / event_dispatch.rs.
            use gtk4::prelude::*;
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
            // 20 px tolerance band — see event_dispatch.rs for rationale.
            // Both call sites must agree; tested by
            // test_bottom_follow_zone_is_20_px.
            let at_bottom = (curr.value + curr.page_size) >= content_bottom - 20.0;
            let mut state = state_for_scroll.borrow_mut();
            if at_bottom {
                state.auto_scroll.user_reached_bottom();
            } else {
                state.auto_scroll.user_scrolled_away();
            }
        });
    }

    // NOTE: auto-scroll-to-bottom is performed inside the 16ms event
    // dispatch tick (see event_dispatch.rs). Reacting to notify::upper /
    // notify::page-size races with GTK's layout cycle (the two
    // properties settle in separate passes), and idle-scheduled
    // scroll_to_bottom reads stale values. The 16ms tick converges in
    // at most one frame because each tick re-pins to the current values.

    // --- 16ms GTK timeout that drives the UI from background events ---
    event_dispatch::wire(event_dispatch::EventDispatchContext {
        widgets: widgets.clone(),
        app_state: app_state.clone(),
        event_rx: event_rx.clone(),
        uq_rx: uq_rx.clone(),
        prompt_tx: prompt_tx.clone(),
        viewport_cols: viewport_cols.clone(),
        window: window.clone(),
        session_started_at: session_started_at.clone(),
    });

    // --- Start background conversation loop ---
    let event_tx_bg = event_tx.clone();
    let bg_config = resolved_config; // move into background thread
    let stop_flag_bg = stop_flag.clone();

    // Spawn the background task that runs the conversation loop.
    // The Tokio runtime is created inside the thread (not shared with GTK).
    std::thread::spawn(move || {
        let rt = tokio::runtime::Runtime::new().expect("Failed to create Tokio runtime");
        rt.block_on(async move {
            let mut client = chlodwig_api::AnthropicClient::new(bg_config.api_key);
            if let Some(url) = bg_config.base_url {
                client = client.with_base_url(url);
            }
            let api_client: Arc<dyn chlodwig_core::ApiClient> = Arc::new(client);

            let system_prompt = chlodwig_core::build_system_prompt(
                None,
                chlodwig_core::UiContext::Gui,
                &initial_cwd,
            );
            let mut tools = chlodwig_tools::builtin_tools();
            // Inject UserQuestion tool — uq_tx was created in GTK scope,
            // the receiver (uq_rx) is polled in the GTK event loop.
            tools.push(Box::new(chlodwig_tools::UserQuestionTool::new(uq_tx)));

            let mut conv_state = ConversationState {
                messages: Vec::new(),
                model: bg_config.model,
                system_prompt,
                max_tokens: bg_config.max_tokens,
                tools,
                tool_context: ToolContext {
                    working_directory: initial_cwd.clone(),
                    timeout: Duration::from_secs(120),
                },
                stop_requested: stop_flag_bg.clone(),
            };

            let permission = chlodwig_core::AutoApprovePrompter;

            // Resume restoration is now handled uniformly via
            // `BackgroundCommand::RestoreMessages` (sent by
            // `restore::apply_restored_session_to_ui`), so there is no
            // separate initial_messages path here.

            while let Some(bg_cmd) = prompt_rx.recv().await {
                match bg_cmd {
                    BackgroundCommand::ClearMessages => {
                        conv_state.messages.clear();
                        continue;
                    }
                    BackgroundCommand::SaveSession { started_at, table_sorts, name, stats } => {
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
                        continue;
                    }
                    BackgroundCommand::RestoreMessages { messages } => {
                        conv_state.messages = messages;
                        tracing::info!(
                            "Restored {} messages into ConversationState",
                            conv_state.messages.len()
                        );
                        continue;
                    }
                    BackgroundCommand::Compact { instructions } => {
                        let _ = event_tx_bg.send(ConversationEvent::CompactionStarted);
                        if let Err(e) = chlodwig_core::compact_conversation(
                            &mut conv_state,
                            api_client.as_ref(),
                            &event_tx_bg,
                            instructions.as_deref(),
                        )
                        .await
                        {
                            tracing::error!("Compaction error: {e}");
                            let _ = event_tx_bg.send(ConversationEvent::Error(
                                format!("Compaction failed: {e}"),
                            ));
                        }
                        continue;
                    }
                    BackgroundCommand::Prompt { text: prompt, pre_turn_usage } => {
                // Auto-compact if context is too large
                chlodwig_core::auto_compact_if_needed(
                    &pre_turn_usage,
                    &mut conv_state,
                    api_client.as_ref(),
                    &event_tx_bg,
                ).await;

                // Add user message
                conv_state.messages.push(Message {
                    role: Role::User,
                    content: vec![ContentBlock::Text { text: prompt }],
                });

                // Run one conversation turn
                let result = chlodwig_core::run_turn(
                    &mut conv_state,
                    api_client.as_ref(),
                    &permission,
                    &event_tx_bg,
                )
                .await;

                match result {
                    Ok(()) => {
                        let _ = event_tx_bg.send(ConversationEvent::TurnComplete);
                    }
                    Err(e) => {
                        tracing::error!("Conversation error: {e}");
                        let _ = event_tx_bg.send(ConversationEvent::Error(e.to_string()));
                    }
                }
                    } // BackgroundCommand::Prompt
                } // match bg_cmd
            }
        });
    });

    // --- Re-focus prompt input when the window becomes active ---
    //
    // When the user Cmd+Tabs back to Chlodwig (or clicks the dock icon), GTK
    // sets the window's `is-active` property to `true`. We listen for that
    // transition and call `grab_focus()` on the input view so the cursor
    // lands in the prompt without an extra click. Also fired once on initial
    // present, which is what we want.
    {
        let input_view_for_focus = widgets.input_view.clone();
        window.connect_is_active_notify(move |w| {
            if w.is_active() {
                input_view_for_focus.grab_focus();
            }
        });
    }

    window.present();
}

/// Re-render all display blocks from AppState into the TextBuffer.
///
/// Called when the user toggles "Hide/Show Tools" to rebuild the entire output.
/// Clears the buffer (including emoji overlays) and re-renders each block,
/// skipping `ToolUseStart` and `ToolResult` when `state.show_tool_usage` is false.
// Rendering functions are in render.rs
mod render;
// Session-restore glue (shared by all 3 resume entry points).
mod restore;
// Native macOS menu bar setup.
mod menu;
// Header-click table sort + row hover highlight.
mod table_interactions;

mod submit;

mod event_dispatch;
