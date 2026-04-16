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
    SaveSession { started_at: String },
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

    // Initialize tracing
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

    // Check for --resume flag before GTK init
    let resume_flag = std::env::args().any(|a| a == "--resume" || a == "-r");

    // Set working directory: Finder marker > env var > CLI args
    if chlodwig_gtk::setup::apply_project_dir_from_finder().is_none() {
        if chlodwig_gtk::setup::apply_project_dir().is_none() {
            chlodwig_gtk::setup::apply_project_dir_from_args();
        }
    }

    // Initialize Adwaita application
    let app = libadwaita::Application::builder()
        .application_id("rs.chlodwig.gtk")
        .build();

    app.connect_activate(move |app| {
        activate(app, resume_flag);
    });

    app.run()
}

fn activate(app: &libadwaita::Application, resume_flag: bool) {
    let (window, widgets) = window::build_window(app);

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
    let app_state = Rc::new(RefCell::new(AppState::new(
        resolved_config.model.clone(),
    )));

    // Channel: conversation events from background task → GTK main loop
    let (event_tx, event_rx) = mpsc::unbounded_channel::<ConversationEvent>();
    let event_rx = Rc::new(RefCell::new(Some(event_rx)));

    // Channel: UserQuestion tool → GTK dialog
    let (uq_tx, uq_rx) = mpsc::unbounded_channel::<chlodwig_tools::UserQuestionRequest>();
    let uq_rx = Rc::new(RefCell::new(Some(uq_rx)));

    // Channel: commands from GTK → background task
    let (prompt_tx, mut prompt_rx) = mpsc::unbounded_channel::<BackgroundCommand>();

    // Set initial status
    window::update_status(&widgets.status_left_label, &widgets.status_right_label, &app_state.borrow());

    // Show current working directory in the output area at startup
    {
        let cwd_msg = chlodwig_gtk::app_state::startup_cwd_message();
        window::append_styled(&widgets.output_buffer, &format!("{cwd_msg}\n"), "system");
    }

    // --- Resume session if --resume flag was passed ---
    let mut initial_messages: Vec<Message> = Vec::new();
    if resume_flag {
        match chlodwig_core::load_latest_session() {
            Ok(Some(snapshot)) => {
                let msg_count = snapshot.messages.len();
                tracing::info!("Resuming session with {msg_count} messages");

                // Restore display blocks into AppState
                {
                    let mut state = app_state.borrow_mut();
                    state.restore_messages(&snapshot.messages);
                }

                // Render restored blocks into the output buffer
                render_restored_blocks(
                    &widgets.output_buffer,
                    &app_state.borrow(),
                    viewport_cols.get(),
                );

                window::append_styled(
                    &widgets.output_buffer,
                    &format!("✓ Resumed session ({msg_count} messages, saved at {})\n", snapshot.saved_at),
                    "system",
                );

                // Remember messages to send to background thread
                initial_messages = snapshot.messages;

                window::scroll_to_bottom(&widgets.output_scroll);
                window::update_status(&widgets.status_left_label, &widgets.status_right_label, &app_state.borrow());
            }
            Ok(None) => {
                window::append_styled(
                    &widgets.output_buffer,
                    "No saved session found — starting fresh.\n",
                    "system",
                );
            }
            Err(e) => {
                window::append_styled(
                    &widgets.output_buffer,
                    &format!("Failed to load session: {e}\n"),
                    "error",
                );
            }
        }
    }

    // --- Wire up Send button ---
    let input_buf = widgets.input_buffer.clone();
    let prompt_tx_clone = prompt_tx.clone();
    let state_for_submit = app_state.clone();
    let output_buf_for_submit = widgets.output_buffer.clone();
    let scroll_for_submit = widgets.output_scroll.clone();
    let status_left_for_submit = widgets.status_left_label.clone();
    let status_right_for_submit = widgets.status_right_label.clone();
    let session_started_at_for_submit = session_started_at.clone();
    let viewport_cols_for_submit = viewport_cols.clone();
    let output_view_for_submit = widgets.output_view.clone();

    let submit = move || {
        let start = input_buf.start_iter();
        let end = input_buf.end_iter();
        let text = input_buf.text(&start, &end, false).to_string();
        let text = text.trim().to_string();
        if text.is_empty() {
            return;
        }
        input_buf.set_text("");

        // --- Command parsing (intercept before sending to API) ---
        if let Some(cmd) = chlodwig_gtk::app_state::Command::parse(&text) {
            use chlodwig_gtk::app_state::Command;
            match cmd {
                Command::Clear => {
                    // Clear UI state
                    {
                        let mut state = state_for_submit.borrow_mut();
                        state.clear();
                    }
                    // Clear the output buffer
                    let mut s = output_buf_for_submit.start_iter();
                    let mut e = output_buf_for_submit.end_iter();
                    chlodwig_gtk::emoji_overlay::clear_overlays_from(&output_buf_for_submit, 0);
                    output_buf_for_submit.delete(&mut s, &mut e);
                    // Show CWD again
                    let cwd_msg = chlodwig_gtk::app_state::startup_cwd_message();
                    window::append_styled(&output_buf_for_submit, &format!("{cwd_msg}\n"), "system");
                    // Tell background task to clear ConversationState.messages
                    let _ = prompt_tx_clone.send(BackgroundCommand::ClearMessages);
                    window::update_status(&status_left_for_submit, &status_right_for_submit, &state_for_submit.borrow());
                    return;
                }
                Command::Help => {
                    let help = chlodwig_gtk::app_state::help_text();
                    window::append_styled(&output_buf_for_submit, &format!("\n{help}\n"), "system");
                    window::scroll_to_bottom(&scroll_for_submit);
                    return;
                }
                Command::Shell(cmd_str) => {
                    // Show the command
                    window::append_styled(&output_buf_for_submit, &format!("\n$ {cmd_str}\n"), "user");

                    // Execute synchronously (blocking — fine for simple commands)
                    let (output, _is_error) = chlodwig_gtk::app_state::execute_shell_pty(&cmd_str);

                    // Render output with ANSI colors
                    render_ansi_output(&output_buf_for_submit, &output);

                    window::scroll_to_bottom(&scroll_for_submit);
                    return;
                }
                Command::Quit => {
                    if let Some(app) = gtk4::gio::Application::default() {
                        app.quit();
                    }
                    return;
                }
                Command::Compact(instructions) => {
                    // Tell background thread to compact
                    let _ = prompt_tx_clone.send(BackgroundCommand::Compact { instructions });
                    window::append_styled(
                        &output_buf_for_submit,
                        "\n⏳ Compacting conversation…\n",
                        "system",
                    );
                    window::scroll_to_bottom(&scroll_for_submit);
                    return;
                }
                Command::Sessions => {
                    match chlodwig_core::list_sessions() {
                        Ok(sessions) if sessions.is_empty() => {
                            window::append_styled(
                                &output_buf_for_submit,
                                "\nNo saved sessions found.\n",
                                "system",
                            );
                        }
                        Ok(sessions) => {
                            window::append_styled(
                                &output_buf_for_submit,
                                &format!("\n📋 {} saved session(s):\n", sessions.len()),
                                "system",
                            );
                            for info in &sessions {
                                let line = format!(
                                    "  {} — {} ({} messages, {})\n",
                                    info.filename.trim_end_matches(".json"),
                                    info.model,
                                    info.message_count,
                                    info.saved_at,
                                );
                                window::append_styled(&output_buf_for_submit, &line, "result");
                            }
                        }
                        Err(e) => {
                            window::append_styled(
                                &output_buf_for_submit,
                                &format!("\n✗ Error listing sessions: {e}\n"),
                                "error",
                            );
                        }
                    }
                    window::scroll_to_bottom(&scroll_for_submit);
                    return;
                }
                Command::Resume(prefix) => {
                    let load_result = match &prefix {
                        None => chlodwig_core::load_latest_session(),
                        Some(p) => chlodwig_core::load_session_by_prefix(p),
                    };
                    match load_result {
                        Ok(Some(snapshot)) => {
                            let msg_count = snapshot.messages.len();
                            // Clear current display
                            {
                                let mut state = state_for_submit.borrow_mut();
                                state.clear();
                            }
                            let mut s = output_buf_for_submit.start_iter();
                            let mut e = output_buf_for_submit.end_iter();
                            chlodwig_gtk::emoji_overlay::clear_overlays_from(&output_buf_for_submit, 0);
                            output_buf_for_submit.delete(&mut s, &mut e);

                            // Restore display blocks
                            {
                                let mut state = state_for_submit.borrow_mut();
                                state.restore_messages(&snapshot.messages);
                            }
                            viewport_cols_for_submit.set(
                                chlodwig_gtk::viewport::viewport_columns(
                                    output_view_for_submit.upcast_ref::<gtk4::TextView>(),
                                ),
                            );
                            render_restored_blocks(&output_buf_for_submit, &state_for_submit.borrow(), viewport_cols_for_submit.get());
                            window::append_styled(
                                &output_buf_for_submit,
                                &format!(
                                    "✓ Resumed session ({msg_count} messages, saved at {})\n",
                                    snapshot.saved_at
                                ),
                                "system",
                            );

                            // Restore messages in background thread
                            let _ = prompt_tx_clone.send(BackgroundCommand::RestoreMessages {
                                messages: snapshot.messages,
                            });
                        }
                        Ok(None) => {
                            let msg = match &prefix {
                                None => "No saved session found.".to_string(),
                                Some(p) => format!(
                                    "No session matching prefix '{p}' found. Use /sessions to list available sessions."
                                ),
                            };
                            window::append_styled(
                                &output_buf_for_submit,
                                &format!("\n{msg}\n"),
                                "system",
                            );
                        }
                        Err(e) => {
                            window::append_styled(
                                &output_buf_for_submit,
                                &format!("\n✗ Failed to load session: {e}\n"),
                                "error",
                            );
                        }
                    }
                    window::scroll_to_bottom(&scroll_for_submit);
                    window::update_status(&status_left_for_submit, &status_right_for_submit, &state_for_submit.borrow());
                    return;
                }
                Command::Save => {
                    let _ = prompt_tx_clone.send(BackgroundCommand::SaveSession {
                        started_at: session_started_at_for_submit.clone(),
                    });
                    window::append_styled(
                        &output_buf_for_submit,
                        "\n✓ Session saved.\n",
                        "system",
                    );
                    window::scroll_to_bottom(&scroll_for_submit);
                    return;
                }
            }
        }

        // --- Regular prompt (send to API) ---

        // Update AppState — force auto-scroll on (explicit user action)
        {
            let mut state = state_for_submit.borrow_mut();
            state.submit_prompt(text.clone());
            state.auto_scroll.scroll_to_bottom();
        }

        // Render user message in output
        window::append_styled(&output_buf_for_submit, &format!("\n▶ {text}\n"), "user");
        window::scroll_to_bottom(&scroll_for_submit);
        window::update_status(&status_left_for_submit, &status_right_for_submit, &state_for_submit.borrow());

        // Send to background conversation loop (include turn_usage for auto-compact check)
        let turn_usage = state_for_submit.borrow().turn_usage.clone();
        let _ = prompt_tx_clone.send(BackgroundCommand::Prompt { text, pre_turn_usage: turn_usage });
    };

    // Send button click
    let submit_clone = submit.clone();
    widgets.send_button.connect_clicked(move |_| {
        submit_clone();
    });

    // Char offset in the TextBuffer where the current streaming Markdown starts.
    // -1 means "no streaming in progress".
    // Shared with the toggle button handler so it can reset when re-rendering.
    let streaming_start_offset: Rc<Cell<i32>> = Rc::new(Cell::new(-1));

    // --- Wire up Toggle Tool Usage button ---
    let state_for_toggle = app_state.clone();
    let output_buf_for_toggle = widgets.output_buffer.clone();
    let streaming_offset_for_toggle = streaming_start_offset.clone();
    let viewport_cols_for_toggle = viewport_cols.clone();
    let output_view_for_toggle = widgets.output_view.clone();
    widgets.toggle_tool_button.connect_clicked(move |btn| {
        let mut state = state_for_toggle.borrow_mut();
        state.show_tool_usage = !state.show_tool_usage;
        btn.set_label(if state.show_tool_usage { "Hide Tools" } else { "Show Tools" });

        // Re-render entire output from blocks (no scroll — user wants to keep reading).
        // Reset streaming_start_offset so the event loop doesn't use a stale offset
        // after we cleared and re-built the buffer.
        viewport_cols_for_toggle.set(
            chlodwig_gtk::viewport::viewport_columns(
                output_view_for_toggle.upcast_ref::<gtk4::TextView>(),
            ),
        );
        rerender_all_blocks(&output_buf_for_toggle, &state, viewport_cols_for_toggle.get());
        streaming_offset_for_toggle.set(-1);
    });

    // Cmd+Enter (macOS) or Ctrl+Enter (Linux/Windows) to send.
    // Plain Enter inserts a newline (GTK default behavior).
    //
    // On macOS, Cmd maps to META_MASK in GTK4. We check both META (Cmd)
    // and CONTROL (Ctrl) so the shortcut works on all platforms.
    //
    // Cmd+V/C/X/A (macOS): GTK4's GtkTextView binds paste/copy/cut/select-all
    // to <Control>v/c/x/a. On macOS, users press Cmd (META_MASK) not Ctrl.
    // GTK4 has an internal Cmd→Ctrl remapping, but it doesn't work reliably
    // with MacPorts builds (GTK 4.14.x). We explicitly handle Cmd+V/C/X/A
    // Cmd+Return → submit (prompt-specific, before the shared shortcuts)
    let submit_for_key = submit.clone();
    let input_view_submit_ctrl = gtk4::EventControllerKey::new();
    input_view_submit_ctrl.connect_key_pressed(move |_, key, _keycode, modifiers| {
        let is_cmd = modifiers.contains(gtk4::gdk::ModifierType::META_MASK)
            || modifiers.contains(gtk4::gdk::ModifierType::CONTROL_MASK);
        if key == gtk4::gdk::Key::Return && is_cmd {
            submit_for_key();
            return glib::Propagation::Stop;
        }
        glib::Propagation::Proceed
    });
    widgets.input_view.add_controller(input_view_submit_ctrl);

    // macOS Cmd/Option shortcuts (shared with UserQuestion dialog)
    chlodwig_gtk::window::setup_macos_input_shortcuts(&widgets.input_view);

    // --- Copy feedback: show "✓ Copied!" in status bar when text is copied ---
    let state_for_copy = app_state.clone();
    let status_left_for_copy = widgets.status_left_label.clone();
    let status_right_for_copy = widgets.status_right_label.clone();
    widgets.output_view.connect_copy_clipboard(move |_view| {
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
    {
        let adj = widgets.output_scroll.vadjustment();
        let state_for_scroll = app_state.clone();
        adj.connect_value_changed(move |adj| {
            let at_bottom = (adj.value() + adj.page_size()) >= adj.upper() - 1.0;
            let mut state = state_for_scroll.borrow_mut();
            if at_bottom {
                state.auto_scroll.user_reached_bottom();
            } else {
                state.auto_scroll.user_scrolled_away();
            }
        });
    }

    // --- Poll conversation events on GTK main loop ---
    let state_for_events = app_state.clone();
    let output_buf = widgets.output_buffer.clone();
    let scroll = widgets.output_scroll.clone();
    let status_left_label = widgets.status_left_label.clone();
    let status_right_label = widgets.status_right_label.clone();
    let window_for_notify = window.clone();
    let window_for_uq = window.clone();
    // Sequential dialog queue: only one UserQuestion dialog at a time.
    // Incoming requests are pushed to uq_queue; when no dialog is open
    // (uq_dialog_open == false), the next request is popped and shown.
    let uq_queue: Rc<RefCell<std::collections::VecDeque<chlodwig_tools::UserQuestionRequest>>> =
        Rc::new(RefCell::new(std::collections::VecDeque::new()));
    let uq_dialog_open: Rc<Cell<bool>> = Rc::new(Cell::new(false));
    let project_name = chlodwig_gtk::app_state::project_dir_name();
    let prompt_tx_for_events = prompt_tx.clone();
    let session_started_at_for_events = session_started_at.clone();
    let viewport_cols_for_events = viewport_cols.clone();
    let output_view_for_events = widgets.output_view.clone();

    // Use glib::timeout_add_local to periodically check for events
    // This bridges the async Tokio world with the GTK main loop.
    let event_rx_cell = event_rx.clone();
    let uq_rx_cell = uq_rx.clone();
    // Track tool_use_id → (tool_name, input) so ToolResult can identify Read/Bash/Write/Grep
    let mut tool_id_to_info: std::collections::HashMap<String, (String, serde_json::Value)> =
        std::collections::HashMap::new();
    // Snapshot of the streaming buffer text for Markdown rendering.
    // Filled from AppState on each tick; used for the per-tick re-render.
    let mut last_streaming_snapshot = String::new();
    // Track last rendered viewport width (in monospace columns) to detect resize.
    // When the width changes and we're NOT streaming, re-render all blocks so
    // tables adapt to the new width.
    let mut last_rendered_cols: usize = 0;
    // Debounce resize: count consecutive ticks with a new (stable) width before
    // triggering re-render. At 16ms/tick, 10 ticks ≈ 160ms debounce.
    let mut resize_stable_ticks: u32 = 0;
    let mut resize_pending_cols: usize = 0;
    glib::timeout_add_local(Duration::from_millis(16), move || {
        let mut rx_opt = event_rx_cell.borrow_mut();
        let rx = match rx_opt.as_mut() {
            Some(rx) => rx,
            None => return glib::ControlFlow::Continue,
        };

        // Drain all pending events (non-blocking).
        // TextDelta is NOT rendered here — it only accumulates in
        // AppState.streaming_buffer. The Markdown re-render happens
        // once per tick, after all events are drained.
        let mut needs_scroll = false;
        let mut streaming_finalized = false; // TextComplete or ToolUseStart ended streaming
        let mut finalized_text: Option<String> = None; // TextComplete's full_text
        let mut should_save_session = false; // TurnComplete or CompactionComplete → auto-save
        while let Ok(event) = rx.try_recv() {
            let should_update = {
                let mut state = state_for_events.borrow_mut();

                // Detect TextComplete and ToolUseStart: snapshot the buffer
                // BEFORE handle_event clears it.
                match &event {
                    ConversationEvent::TextComplete(full_text) => {
                        streaming_finalized = true;
                        finalized_text = Some(full_text.clone());
                    }
                    ConversationEvent::ToolUseStart { .. } => {
                        if !state.streaming_buffer.is_empty() {
                            streaming_finalized = true;
                            finalized_text = Some(state.streaming_buffer.clone());
                        }
                    }
                    // Auto-save on turn complete and compaction complete
                    ConversationEvent::TurnComplete
                    | ConversationEvent::CompactionComplete { .. } => {
                        should_save_session = true;
                    }
                    _ => {}
                }

                // Render non-streaming events into the TextBuffer
                let show_tools = state.show_tool_usage;
                render_event_to_buffer(
                    &output_buf,
                    &event,
                    &mut tool_id_to_info,
                    show_tools,
                );
                state.handle_event(event)
            };
            if should_update {
                needs_scroll = true;
            }
        }

        // Auto-save session after TurnComplete or CompactionComplete
        if should_save_session {
            let _ = prompt_tx_for_events.send(BackgroundCommand::SaveSession {
                started_at: session_started_at_for_events.clone(),
            });
        }

        // Drain pending UserQuestion requests into the queue.
        {
            let mut uq_opt = uq_rx_cell.borrow_mut();
            if let Some(uq) = uq_opt.as_mut() {
                while let Ok(req) = uq.try_recv() {
                    uq_queue.borrow_mut().push_back(req);
                }
            }
        }

        // Show the next queued dialog if none is currently open.
        if !uq_dialog_open.get() {
            let next = uq_queue.borrow_mut().pop_front();
            if let Some(req) = next {
                uq_dialog_open.set(true);
                let uq_dialog_open_clone = uq_dialog_open.clone();
                let uq_queue_clone = uq_queue.clone();
                let window_clone = window_for_uq.clone();
                window::show_user_question_dialog(
                    &window_for_uq,
                    &req.question,
                    &req.options,
                    req.respond,
                    Box::new(move || {
                        // Called when the dialog closes — show next queued dialog if any.
                        uq_dialog_open_clone.set(false);
                        // Trigger next dialog on the next event loop tick
                        // (the timeout_add_local will pick it up).
                        let _ = &uq_queue_clone;
                        let _ = &window_clone;
                    }),
                );
            }
        }

        // --- Streaming Markdown rendering (once per tick) ---
        //
        // Three cases:
        // 1. Streaming is ongoing (dirty) → re-render streaming_buffer as Markdown
        // 2. Streaming was finalized this tick (TextComplete/ToolUseStart) → render final text
        // 3. Neither → nothing to do
        {
            // Update viewport columns from the current widget allocation
            viewport_cols_for_events.set(
                chlodwig_gtk::viewport::viewport_columns(
                    output_view_for_events.upcast_ref::<gtk4::TextView>(),
                ),
            );
            let mut state = state_for_events.borrow_mut();

            // Case 1: ongoing streaming with new deltas
            if state.streaming_dirty && !streaming_finalized {
                // First delta in this streaming run: record start offset
                if streaming_start_offset.get() < 0 {
                    if output_buf.end_iter().offset() > 0 {
                        window::append_to_output(&output_buf, "\n");
                    }
                    streaming_start_offset.set(output_buf.end_iter().offset());
                }

                rerender_streaming_markdown(
                    &output_buf,
                    streaming_start_offset.get(),
                    &state.streaming_buffer,
                    viewport_cols_for_events.get(),
                );
                last_streaming_snapshot = state.streaming_buffer.clone();
                state.acknowledge_streaming_render();
                needs_scroll = true;
            }

            // Case 2: streaming was finalized this tick
            if streaming_finalized {
                if streaming_start_offset.get() < 0 {
                    // Edge case: TextComplete arrived in the same tick as the first delta
                    if output_buf.end_iter().offset() > 0 {
                        window::append_to_output(&output_buf, "\n");
                    }
                    streaming_start_offset.set(output_buf.end_iter().offset());
                }

                let final_text = finalized_text.as_deref().unwrap_or("");
                rerender_streaming_markdown(&output_buf, streaming_start_offset.get(), final_text, viewport_cols_for_events.get());
                window::append_to_output(&output_buf, "\n");

                streaming_start_offset.set(-1);
                last_streaming_snapshot.clear();
                state.acknowledge_streaming_render();
                needs_scroll = true;
            }
        }

        if needs_scroll {
            // Update auto_scroll state — incoming content should not yank
            // the user back to bottom if they've scrolled up manually.
            state_for_events.borrow_mut().auto_scroll.scroll_to_bottom_if_auto();

            window::update_status(&status_left_label, &status_right_label, &state_for_events.borrow());

            // Only scroll if auto_scroll is still active
            if state_for_events.borrow().auto_scroll.is_active() {
                let scroll_clone = scroll.clone();
                glib::idle_add_local_once(move || {
                    window::scroll_to_bottom(&scroll_clone);
                });
            }
        } else if state_for_events.borrow().is_streaming {
            // No new events this tick, but still streaming — update status bar
            // so the spinner animation keeps rotating (~every 16ms tick).
            window::update_status(&status_left_label, &status_right_label, &state_for_events.borrow());
        }

        // --- System notification on turn complete ---
        // Send a desktop notification when a turn finishes and the window
        // is NOT focused (user switched to another app while waiting).
        {
            let mut state = state_for_events.borrow_mut();
            if state.take_should_notify() && !window_for_notify.is_active() {
                send_turn_complete_notification(&window_for_notify, &project_name);
            }
        }

        // --- Resize detection: re-render tables when viewport width changes ---
        // Check every tick if the viewport column count changed. Debounce by
        // waiting 10 consecutive ticks (~160ms) with the same new width before
        // triggering a full re-render. Skip during active streaming (the
        // streaming re-render already uses the current width).
        {
            let current_cols = chlodwig_gtk::viewport::viewport_columns(
                output_view_for_events.upcast_ref::<gtk4::TextView>(),
            );
            if current_cols != last_rendered_cols {
                if current_cols == resize_pending_cols {
                    resize_stable_ticks += 1;
                } else {
                    resize_pending_cols = current_cols;
                    resize_stable_ticks = 1;
                }
                if resize_stable_ticks >= 10 {
                    // Width has been stable for ~160ms — re-render
                    last_rendered_cols = current_cols;
                    viewport_cols_for_events.set(current_cols);
                    resize_stable_ticks = 0;
                    let state = state_for_events.borrow();
                    if !state.is_streaming {
                        rerender_all_blocks(&output_buf, &state, current_cols);
                        if state.auto_scroll.is_active() {
                            let scroll_clone = scroll.clone();
                            glib::idle_add_local_once(move || {
                                window::scroll_to_bottom(&scroll_clone);
                            });
                        }
                    }
                }
            } else {
                resize_stable_ticks = 0;
            }
        }

        glib::ControlFlow::Continue
    });

    // --- Start background conversation loop ---
    let event_tx_bg = event_tx.clone();
    let bg_config = resolved_config; // move into background thread

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
                    working_directory: std::env::current_dir().unwrap_or_default(),
                    timeout: Duration::from_secs(120),
                },
            };

            let permission = chlodwig_core::AutoApprovePrompter;

            // If there are initial messages from --resume, restore them
            if !initial_messages.is_empty() {
                conv_state.messages = initial_messages;
                tracing::info!("Background thread: restored {} messages", conv_state.messages.len());
            }

            while let Some(bg_cmd) = prompt_rx.recv().await {
                match bg_cmd {
                    BackgroundCommand::ClearMessages => {
                        conv_state.messages.clear();
                        continue;
                    }
                    BackgroundCommand::SaveSession { started_at } => {
                        let snapshot = chlodwig_core::SessionSnapshot {
                            saved_at: chrono::Local::now().to_rfc3339(),
                            started_at,
                            model: conv_state.model.clone(),
                            messages: conv_state.messages.clone(),
                            system_prompt: conv_state.system_prompt.clone(),
                            constants: None,
                        };
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

    window.present();
}

/// Re-render all display blocks from AppState into the TextBuffer.
///
/// Called when the user toggles "Hide/Show Tools" to rebuild the entire output.
/// Clears the buffer (including emoji overlays) and re-renders each block,
/// skipping `ToolUseStart` and `ToolResult` when `state.show_tool_usage` is false.
fn rerender_all_blocks(
    buffer: &gtk4::TextBuffer,
    state: &AppState,
    viewport_width: usize,
) {
    use chlodwig_gtk::app_state::DisplayBlock;

    // Clear the entire buffer including emoji overlays
    chlodwig_gtk::emoji_overlay::clear_overlays_from(buffer, 0);
    let mut start = buffer.start_iter();
    let mut end = buffer.end_iter();
    buffer.delete(&mut start, &mut end);

    // Show CWD at the top (same as startup)
    let cwd_msg = chlodwig_gtk::app_state::startup_cwd_message();
    window::append_styled(buffer, &format!("{cwd_msg}\n"), "system");

    for block in &state.blocks {
        match block {
            DisplayBlock::UserMessage(text) => {
                window::append_styled(buffer, &format!("\n▶ {text}\n"), "user");
            }
            DisplayBlock::AssistantText(text) => {
                window::append_to_output(buffer, "\n");
                let lines = chlodwig_core::render_markdown_with_width(text, viewport_width);
                chlodwig_gtk::md_renderer::append_styled_lines(buffer, &lines);
                window::append_to_output(buffer, "\n");
            }
            DisplayBlock::ToolUseStart { name, input } => {
                if !state.show_tool_usage {
                    continue;
                }
                window::append_styled(
                    buffer,
                    &format!("── Tool: {name} ──\n"),
                    "tool",
                );
                if let Ok(pretty) = serde_json::to_string_pretty(input) {
                    for line in pretty.lines().take(5) {
                        window::append_styled(buffer, &format!("  {line}\n"), "result");
                    }
                }
            }
            DisplayBlock::ToolResult { output, is_error } => {
                if !state.show_tool_usage {
                    continue;
                }
                let (prefix, tag) = if *is_error {
                    ("ERROR", "error")
                } else {
                    ("OK", "result_ok")
                };
                window::append_styled(
                    buffer,
                    &format!("── [{prefix}] ──\n"),
                    tag,
                );
                let preview = if output.len() > 500 {
                    let mut end = 500;
                    while end > 0 && !output.is_char_boundary(end) {
                        end -= 1;
                    }
                    format!("{}...", &output[..end])
                } else {
                    output.clone()
                };
                for line in preview.lines().take(10) {
                    window::append_styled(buffer, &format!("  {line}\n"), "result");
                }
            }
            DisplayBlock::SystemMessage(msg) => {
                window::append_styled(buffer, &format!("{msg}\n"), "system");
            }
            DisplayBlock::Error(msg) => {
                window::append_styled(buffer, &format!("\n✗ Error: {msg}\n"), "error");
            }
        }
    }

    // If there's streaming text in progress, render it too
    if !state.streaming_buffer.is_empty() {
        window::append_to_output(buffer, "\n");
        let lines = chlodwig_core::render_markdown_with_width(&state.streaming_buffer, viewport_width);
        chlodwig_gtk::md_renderer::append_styled_lines(buffer, &lines);
    }
}

/// Render all display blocks from AppState into the TextBuffer (append).
///
/// Used after session restore (--resume or /resume) to populate the output
/// area with the restored conversation. Unlike `rerender_all_blocks`, this
/// does NOT clear the buffer first — it appends to whatever is already there.
fn render_restored_blocks(
    buffer: &gtk4::TextBuffer,
    state: &AppState,
    viewport_width: usize,
) {
    use chlodwig_gtk::app_state::DisplayBlock;

    for block in &state.blocks {
        match block {
            DisplayBlock::UserMessage(text) => {
                window::append_styled(buffer, &format!("\n▶ {text}\n"), "user");
            }
            DisplayBlock::AssistantText(text) => {
                window::append_to_output(buffer, "\n");
                let lines = chlodwig_core::render_markdown_with_width(text, viewport_width);
                chlodwig_gtk::md_renderer::append_styled_lines(buffer, &lines);
                window::append_to_output(buffer, "\n");
            }
            DisplayBlock::ToolUseStart { name, input } => {
                if !state.show_tool_usage {
                    continue;
                }
                if name == "Edit" {
                    // Show diff-style display
                    let file_path = input["file_path"].as_str().unwrap_or("(unknown)");
                    window::append_styled(
                        buffer,
                        &format!("── Edit: {file_path} ──\n"),
                        "tool",
                    );
                    if let Some(old) = input["old_string"].as_str() {
                        for line in old.lines() {
                            window::append_styled(buffer, &format!("- {line}\n"), "diff_remove");
                        }
                    }
                    if let Some(new) = input["new_string"].as_str() {
                        for line in new.lines() {
                            window::append_styled(buffer, &format!("+ {line}\n"), "diff_add");
                        }
                    }
                } else {
                    window::append_styled(
                        buffer,
                        &format!("── Tool: {name} ──\n"),
                        "tool",
                    );
                    if let Ok(pretty) = serde_json::to_string_pretty(input) {
                        for line in pretty.lines().take(5) {
                            window::append_styled(buffer, &format!("  {line}\n"), "result");
                        }
                    }
                }
            }
            DisplayBlock::ToolResult { output, is_error } => {
                if !state.show_tool_usage {
                    continue;
                }
                let (prefix, tag) = if *is_error {
                    ("ERROR", "error")
                } else {
                    ("OK", "result_ok")
                };
                window::append_styled(
                    buffer,
                    &format!("── [{prefix}] ──\n"),
                    tag,
                );
                let preview = chlodwig_core::truncate_preview(output, 500);
                for line in preview.lines().take(10) {
                    window::append_styled(buffer, &format!("  {line}\n"), "result");
                }
            }
            DisplayBlock::SystemMessage(msg) => {
                window::append_styled(buffer, &format!("{msg}\n"), "system");
            }
            DisplayBlock::Error(msg) => {
                window::append_styled(buffer, &format!("\n✗ Error: {msg}\n"), "error");
            }
        }
    }
}

/// Delete the Markdown-rendered streaming range and re-render with new text.
///
/// Called once per tick to update the live-streaming Markdown view.
/// `start_offset` is the char offset where streaming started in the TextBuffer.
fn rerender_streaming_markdown(
    buffer: &gtk4::TextBuffer,
    start_offset: i32,
    markdown_text: &str,
    viewport_width: usize,
) {
    // Remove emoji overlays in the streaming range BEFORE deleting text.
    // Without this, old overlays accumulate — their marks collapse to the
    // deletion point, and snapshot() draws them at wrong positions.
    chlodwig_gtk::emoji_overlay::clear_overlays_from(buffer, start_offset);

    // Delete previous render
    let end_off = buffer.end_iter().offset();
    if end_off > start_offset {
        let mut start = buffer.iter_at_offset(start_offset);
        let mut end = buffer.iter_at_offset(end_off);
        buffer.delete(&mut start, &mut end);
    }

    // Re-render as Markdown. After deletion, buffer end == start_offset,
    // so append_styled_lines inserts exactly where we want.
    let lines = chlodwig_core::render_markdown_with_width(markdown_text, viewport_width);
    chlodwig_gtk::md_renderer::append_styled_lines(buffer, &lines);
}

/// Render a single ConversationEvent into the GTK TextBuffer.
///
/// This handles all non-streaming events: tool calls, tool results, errors, etc.
/// **TextDelta and TextComplete are handled by the per-tick streaming re-render
/// in the main event loop** — they are no-ops here.
///
/// When `show_tool_usage` is false, `ToolUseStart` and `ToolResult` events
/// are still tracked in `tool_id_to_info` but not rendered to the buffer.
fn render_event_to_buffer(
    buffer: &gtk4::TextBuffer,
    event: &ConversationEvent,
    tool_id_to_info: &mut std::collections::HashMap<String, (String, serde_json::Value)>,
    show_tool_usage: bool,
) {
    match event {
        // Streaming events are handled by the per-tick Markdown re-render.
        ConversationEvent::TextDelta(_) | ConversationEvent::TextComplete(_) => {}
        ConversationEvent::ToolUseStart { id, name, input } => {
            // Track tool id → (name, input) for ToolResult matching
            tool_id_to_info.insert(id.clone(), (name.clone(), input.clone()));

            if !show_tool_usage {
                return;
            }

            if name == "Edit" {
                // Special Edit rendering: show diff-style header with syntax highlighting
                let file_path = input["file_path"].as_str().unwrap_or("(unknown)");
                let lang = chlodwig_core::highlight::lang_from_path(file_path);
                window::append_styled(
                    buffer,
                    &format!("── Edit: {file_path} ──\n"),
                    "tool",
                );
                // Show old → new context with syntax highlighting
                if let Some(old) = input["old_string"].as_str() {
                    for line in old.lines() {
                        window::append_styled(buffer, "- ", "diff_remove");
                        render_highlighted_line(buffer, lang, line, "diff_remove");
                        window::append_to_output(buffer, "\n");
                    }
                }
                if let Some(new) = input["new_string"].as_str() {
                    for line in new.lines() {
                        window::append_styled(buffer, "+ ", "diff_add");
                        render_highlighted_line(buffer, lang, line, "diff_add");
                        window::append_to_output(buffer, "\n");
                    }
                }
            } else {
                // Generic tool call: header + JSON input preview (max 5 lines)
                window::append_styled(
                    buffer,
                    &format!("── Tool: {name} ──\n"),
                    "tool",
                );
                if let Ok(pretty) = serde_json::to_string_pretty(input) {
                    for line in pretty.lines().take(5) {
                        window::append_styled(buffer, &format!("  {line}\n"), "result");
                    }
                }
            }
        }
        ConversationEvent::ToolResult {
            id, output, is_error,
        } => {
            let tool_info = tool_id_to_info.remove(id);

            if !show_tool_usage {
                return;
            }

            let text = extract_tool_result_text(output);

            if let Some((ref tool_name, ref tool_input)) = tool_info {
                // Bash → $ command + output with ANSI color rendering
                if tool_name == "Bash" {
                    let command = tool_input["command"]
                        .as_str()
                        .unwrap_or("(unknown)");
                    window::append_multi_styled(
                        buffer,
                        &format!("$ {command}\n"),
                        &["bash_header", "code"],
                    );
                    // Parse ANSI escape codes and render with colored tags
                    render_ansi_output(buffer, &text);
                    window::append_to_output(buffer, "\n");
                    return;
                }
                // Read → ── Read: path ── + numbered lines with syntax highlighting
                if tool_name == "Read" && !is_error {
                    let file_path = tool_input["file_path"]
                        .as_str()
                        .unwrap_or("(unknown)");
                    let lang = chlodwig_core::highlight::lang_from_path(file_path);
                    window::append_styled(
                        buffer,
                        &format!("── Read: {file_path} ──\n"),
                        "read_header",
                    );
                    let formatted = chlodwig_gtk::format_numbered_lines(&text);
                    for (gutter, code) in &formatted {
                        if !gutter.is_empty() {
                            window::append_styled(buffer, gutter, "line_number");
                            render_highlighted_line(buffer, lang, code, "code");
                            window::append_to_output(buffer, "\n");
                        } else {
                            window::append_styled(buffer, &format!("  {code}\n"), "result");
                        }
                    }
                    window::append_to_output(buffer, "\n");
                    return;
                }
                // Write → ── Write: path ── + summary + numbered lines with syntax highlighting
                if tool_name == "Write" && !is_error {
                    let file_path = tool_input["file_path"]
                        .as_str()
                        .unwrap_or("(unknown)");
                    let lang = chlodwig_core::highlight::lang_from_path(file_path);
                    let content = tool_input["content"]
                        .as_str()
                        .unwrap_or("");
                    window::append_styled(
                        buffer,
                        &format!("── Write: {file_path} ──\n"),
                        "write_header",
                    );
                    window::append_styled(
                        buffer,
                        &format!("  {text}\n"),
                        "result",
                    );
                    // Show file content with line numbers + syntax highlighting
                    let line_count = content.lines().count();
                    let num_width = if line_count == 0 {
                        1
                    } else {
                        (line_count as f64).log10().floor() as usize + 1
                    };
                    for (i, code_line) in content.lines().enumerate() {
                        let line_num = i + 1;
                        window::append_styled(
                            buffer,
                            &format!(" {:>width$} │ ", line_num, width = num_width),
                            "line_number",
                        );
                        render_highlighted_line(buffer, lang, code_line, "code");
                        window::append_to_output(buffer, "\n");
                    }
                    window::append_to_output(buffer, "\n");
                    return;
                }
                // Grep → ── Grep ── + results
                if tool_name == "Grep" && !is_error {
                    window::append_styled(buffer, "── Grep ──\n", "grep_header");
                    for line in text.lines() {
                        window::append_styled(
                            buffer,
                            &format!("  {line}\n"),
                            "result",
                        );
                    }
                    window::append_to_output(buffer, "\n");
                    return;
                }
            }

            // Fallback: generic ToolResult display (same as TUI)
            let (prefix, tag) = if *is_error {
                ("ERROR", "error")
            } else {
                ("OK", "result_ok")
            };
            window::append_styled(
                buffer,
                &format!("── [{prefix}] ──\n"),
                tag,
            );
            // Preview: max 10 lines, max 500 bytes (same limits as TUI)
            let preview = if text.len() > 500 {
                let mut end = 500;
                while end > 0 && !text.is_char_boundary(end) {
                    end -= 1;
                }
                format!("{}...", &text[..end])
            } else {
                text
            };
            for line in preview.lines().take(10) {
                window::append_styled(
                    buffer,
                    &format!("  {line}\n"),
                    "result",
                );
            }
            window::append_to_output(buffer, "\n");
        }
        ConversationEvent::Error(msg) => {
            window::append_styled(buffer, &format!("\n✗ Error: {msg}\n"), "error");
        }
        ConversationEvent::CompactionStarted => {
            window::append_styled(buffer, "\n⏳ Compacting conversation…\n", "system");
        }
        ConversationEvent::CompactionComplete { old_messages, summary_tokens } => {
            window::append_styled(
                buffer,
                &format!("✓ Compacted: {old_messages} messages → summary ({summary_tokens} tokens)\n"),
                "system",
            );
        }
        _ => {} // Other events handled by AppState only
    }
}

/// Extract text from a ToolResultContent (text or blocks → joined text).
fn extract_tool_result_text(output: &chlodwig_core::ToolResultContent) -> String {
    match output {
        chlodwig_core::ToolResultContent::Text(t) => t.clone(),
        chlodwig_core::ToolResultContent::Blocks(blocks) => {
            blocks
                .iter()
                .map(|b| match b {
                    chlodwig_core::ToolResultBlock::Text { text } => text.as_str(),
                    chlodwig_core::ToolResultBlock::Image { .. } => "[image]",
                })
                .collect::<Vec<_>>()
                .join("\n")
        }
    }
}

// System prompt, CLAUDE.md loading, and git context are in chlodwig_core::system_prompt.

/// Render a single line with syntax highlighting into a GtkTextBuffer.
///
/// If the language is recognized by syntect, each token gets a dynamically
/// created GtkTextTag with the appropriate foreground color. Falls back to
/// the `fallback_tag` (e.g. "code") for unrecognized languages.
///
/// `fallback_tag` is also applied as a base style (monospace, diff color, etc.)
/// when no syntax highlighting is available.
fn render_highlighted_line(
    buffer: &gtk4::TextBuffer,
    lang: &str,
    line: &str,
    fallback_tag: &str,
) {
    let spans = chlodwig_core::highlight::highlight_line(lang, line);
    match spans {
        Some(spans) if !spans.is_empty() => {
            let tag_table = buffer.tag_table();
            for span in &spans {
                if span.text.is_empty() {
                    continue;
                }
                let tag_name = chlodwig_gtk::md_renderer::highlight_tag_name_for(
                    span.fg, span.bold, span.italic,
                );
                if tag_table.lookup(&tag_name).is_none() {
                    let mut builder = gtk4::TextTag::builder()
                        .name(&tag_name)
                        .family("monospace");
                    if let Some((r, g, b)) = span.fg {
                        builder = builder.foreground(&format!("#{r:02x}{g:02x}{b:02x}"));
                    }
                    if span.bold {
                        builder = builder.weight(700);
                    }
                    if span.italic {
                        builder = builder.style(gtk4::pango::Style::Italic);
                    }
                    tag_table.add(&builder.build());
                }
                let mut end_iter = buffer.end_iter();
                let start_offset = end_iter.offset();
                buffer.insert(&mut end_iter, &span.text);
                let start_iter = buffer.iter_at_offset(start_offset);
                let end_iter = buffer.end_iter();
                buffer.apply_tag_by_name(&tag_name, &start_iter, &end_iter);
            }
        }
        _ => {
            // Fallback: no highlighting, use the base tag
            window::append_styled(buffer, line, fallback_tag);
        }
    }
}

/// Render ANSI-colored text into a GtkTextBuffer.
///
/// Parses ANSI escape codes from shell output and applies colored
/// GtkTextTags. Each unique (fg_color, bold) combination gets a
/// dynamically created tag. All segments also get the "code" tag
/// for monospace rendering.
fn render_ansi_output(buffer: &gtk4::TextBuffer, text: &str) {
    let segments = chlodwig_gtk::ansi::parse_ansi(text);
    let tag_table = buffer.tag_table();

    for seg in &segments {
        if seg.text.is_empty() {
            continue;
        }

        match (seg.fg, seg.bold) {
            (None, false) => {
                // Plain monospace — use the existing "code" tag
                window::append_styled(buffer, &seg.text, "code");
            }
            (fg, bold) => {
                // Build a unique tag name for this (fg, bold) combination
                let tag_name = ansi_tag_name(fg, bold);

                // Create the tag if it doesn't exist yet
                if tag_table.lookup(&tag_name).is_none() {
                    let mut builder = gtk4::TextTag::builder()
                        .name(&tag_name)
                        .family("monospace");
                    if let Some(color) = fg {
                        builder = builder.foreground(&color.to_hex());
                    }
                    if bold {
                        builder = builder.weight(700);
                    }
                    let tag = builder.build();
                    tag_table.add(&tag);
                }

                // Insert text with the ANSI color tag
                let mut end_iter = buffer.end_iter();
                let start_offset = end_iter.offset();
                buffer.insert(&mut end_iter, &seg.text);
                let start_iter = buffer.iter_at_offset(start_offset);
                let end_iter = buffer.end_iter();
                buffer.apply_tag_by_name(&tag_name, &start_iter, &end_iter);
            }
        }
    }
}

/// Generate a unique tag name for an ANSI color + bold combination.
fn ansi_tag_name(fg: Option<chlodwig_gtk::ansi::AnsiColor>, bold: bool) -> String {
    use chlodwig_gtk::ansi::AnsiColor;
    let color_part = match fg {
        None => "default".into(),
        Some(AnsiColor::Black) => "black".into(),
        Some(AnsiColor::Red) => "red".into(),
        Some(AnsiColor::Green) => "green".into(),
        Some(AnsiColor::Yellow) => "yellow".into(),
        Some(AnsiColor::Blue) => "blue".into(),
        Some(AnsiColor::Magenta) => "magenta".into(),
        Some(AnsiColor::Cyan) => "cyan".into(),
        Some(AnsiColor::White) => "white".into(),
        Some(AnsiColor::BrightBlack) => "br_black".into(),
        Some(AnsiColor::BrightRed) => "br_red".into(),
        Some(AnsiColor::BrightGreen) => "br_green".into(),
        Some(AnsiColor::BrightYellow) => "br_yellow".into(),
        Some(AnsiColor::BrightBlue) => "br_blue".into(),
        Some(AnsiColor::BrightMagenta) => "br_magenta".into(),
        Some(AnsiColor::BrightCyan) => "br_cyan".into(),
        Some(AnsiColor::BrightWhite) => "br_white".into(),
        Some(AnsiColor::Indexed(n)) => format!("idx{n}"),
        Some(AnsiColor::Rgb(r, g, b)) => format!("rgb{r}_{g}_{b}"),
    };
    let bold_part = if bold { "_b" } else { "" };
    format!("ansi_{color_part}{bold_part}")
}

/// Send a system notification that a conversation turn has completed.
///
/// - **macOS**: Uses `UNUserNotificationCenter` (Apple's modern
///   UserNotifications framework, macOS 10.14+). Native pop-up in
///   Notification Center with sound. Requires one-time permission grant.
///
/// - **Linux**: Uses `gio::Notification` → D-Bus → desktop notification
///   daemon (GNOME Shell, KDE, etc.). Requires a `.desktop` file named
///   after the application ID (`rs.chlodwig.gtk.desktop`) for GNOME Shell.
///
/// The notification is only sent when the window is NOT focused (checked
/// by the caller via `window.is_active()`). This avoids spamming the user
/// while they are actively watching the output.
fn send_turn_complete_notification(
    window: &gtk4::ApplicationWindow,
    project: &str,
) {
    #[cfg(target_os = "macos")]
    {
        let _ = window; // not needed on macOS — UNUserNotificationCenter is standalone
        chlodwig_gtk::notification::send_native_notification(
            "Chlodwig",
            "Turn complete ✓",
            project,
        );
    }
    #[cfg(not(target_os = "macos"))]
    {
        send_notification_gnotification(window, project);
    }
}

/// Linux/other: GNotification via D-Bus.
#[cfg(not(target_os = "macos"))]
fn send_notification_gnotification(
    window: &gtk4::ApplicationWindow,
    project: &str,
) {
    use gtk4::gio;

    let notification = gio::Notification::new("Chlodwig");
    notification.set_body(Some(&format!("Turn complete ✓ — {project}")));

    if let Some(app) = window.application() {
        app.send_notification(Some("turn-complete"), &notification);
        tracing::debug!("GNotification sent for project {project:?}");
    } else {
        tracing::debug!("No application found on window — skipping notification");
    }
}
