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
    SaveSession { started_at: String, table_sorts: Vec<chlodwig_core::TableSortState>, name: Option<String> },
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

    // --- Native macOS menu bar ---
    {
        use gtk4::gio;
        let menubar = gio::Menu::new();

        // File menu
        let file_menu = gio::Menu::new();
        file_menu.append(Some("New Conversation"), Some("app.new-conversation"));
        file_menu.append(Some("Quit"), Some("app.quit"));
        menubar.append_submenu(Some("File"), &file_menu);

        // Conversation menu
        let conv_menu = gio::Menu::new();
        conv_menu.append(Some("Compact History"), Some("app.compact"));
        conv_menu.append(Some("Resume Last Session"), Some("app.resume"));
        conv_menu.append(Some("Sessions…"), Some("app.sessions-browser"));
        menubar.append_submenu(Some("Conversation"), &conv_menu);

        app.set_menubar(Some(&menubar));

        // "New Conversation" action (Cmd+N)
        let new_conv_action = gio::SimpleAction::new("new-conversation", None);
        let prompt_tx_new = prompt_tx.clone();
        let state_new = app_state.clone();
        let output_buf_new = widgets.output_buffer.clone();
        let status_left_new = widgets.status_left_label.clone();
        let status_right_new = widgets.status_right_label.clone();
        new_conv_action.connect_activate(move |_, _| {
            {
                let mut state = state_new.borrow_mut();
                state.clear();
            }
            let mut s = output_buf_new.start_iter();
            let mut e = output_buf_new.end_iter();
            chlodwig_gtk::emoji_overlay::clear_overlays_from(&output_buf_new, 0);
            output_buf_new.delete(&mut s, &mut e);
            let cwd_msg = chlodwig_gtk::app_state::startup_cwd_message();
            window::append_styled(&output_buf_new, &format!("{cwd_msg}\n"), "system");
            let _ = prompt_tx_new.send(BackgroundCommand::ClearMessages);
            window::update_status(&status_left_new, &status_right_new, &state_new.borrow());
        });
        app.add_action(&new_conv_action);
        app.set_accels_for_action("app.new-conversation", &["<Meta>n"]);

        // "Compact" action
        let compact_action = gio::SimpleAction::new("compact", None);
        let prompt_tx_compact = prompt_tx.clone();
        compact_action.connect_activate(move |_, _| {
            let _ = prompt_tx_compact.send(BackgroundCommand::Compact { instructions: None });
        });
        app.add_action(&compact_action);

        // "Resume" action
        let resume_action = gio::SimpleAction::new("resume", None);
        let prompt_tx_resume = prompt_tx.clone();
        resume_action.connect_activate(move |_, _| {
            if let Ok(Some(snapshot)) = chlodwig_core::load_latest_session() {
                let _ = prompt_tx_resume.send(BackgroundCommand::RestoreMessages {
                    messages: snapshot.messages,
                });
            }
        });
        app.add_action(&resume_action);

        // "Sessions…" action — opens the sessions browser window
        let sessions_action = gtk4::gio::SimpleAction::new("sessions-browser", None);
        let prompt_tx_sessions = prompt_tx.clone();
        let state_sessions = app_state.clone();
        let output_buf_sessions = widgets.output_buffer.clone();
        let output_view_sessions = widgets.output_view.clone();
        let viewport_cols_sessions = viewport_cols.clone();
        let status_left_sessions = widgets.status_left_label.clone();
        let status_right_sessions = widgets.status_right_label.clone();
        let window_for_sessions = window.clone();
        let session_started_at_for_sessions = session_started_at.clone();
        sessions_action.connect_activate(move |_, _| {
            let prompt_tx = prompt_tx_sessions.clone();
            let state = state_sessions.clone();
            let output_buf = output_buf_sessions.clone();
            let output_view = output_view_sessions.clone();
            let viewport_cols = viewport_cols_sessions.clone();
            let status_left = status_left_sessions.clone();
            let status_right = status_right_sessions.clone();
            let window_for_resume = window_for_sessions.clone();
            let current_file = Some(chlodwig_core::session_filename_for(&session_started_at_for_sessions));
            chlodwig_gtk::sessions_window::show_sessions_window(
                &window_for_sessions,
                current_file,
                Box::new(move |path| {
                    match chlodwig_core::load_session_from(&path) {
                        Ok(snapshot) => {
                            let msg_count = snapshot.messages.len();
                            // Clear current display
                            {
                                let mut s = state.borrow_mut();
                                s.clear();
                            }
                            let mut si = output_buf.start_iter();
                            let mut ei = output_buf.end_iter();
                            chlodwig_gtk::emoji_overlay::clear_overlays_from(&output_buf, 0);
                            output_buf.delete(&mut si, &mut ei);

                            // Restore display blocks
                            {
                                let mut s = state.borrow_mut();
                                s.restore_messages(&snapshot.messages);
                                s.apply_table_sort_states(&snapshot.table_sorts);
                                s.session_name = snapshot.name.clone();
                            }
                            // Update window title with restored name
                            let cwd_name: Option<String> = std::env::current_dir()
                                .ok()
                                .and_then(|p| p.file_name().map(|n| n.to_string_lossy().into_owned()));
                            let restored_title = chlodwig_gtk::window::format_window_title(
                                cwd_name.as_deref(),
                                snapshot.name.as_deref(),
                            );
                            window_for_resume.set_title(Some(&restored_title));
                            viewport_cols.set(
                                chlodwig_gtk::viewport::viewport_columns(
                                    output_view.upcast_ref::<gtk4::TextView>(),
                                ),
                            );
                            render::render_restored_blocks(
                                &output_buf,
                                &state.borrow(),
                                viewport_cols.get(),
                            );
                            window::append_styled(
                                &output_buf,
                                &format!(
                                    "✓ Resumed session ({msg_count} messages, saved at {})\n",
                                    snapshot.saved_at,
                                ),
                                "system",
                            );

                            // Restore messages in background thread
                            let _ = prompt_tx.send(BackgroundCommand::RestoreMessages {
                                messages: snapshot.messages,
                            });

                            window::update_status(&status_left, &status_right, &state.borrow());
                        }
                        Err(e) => {
                            window::append_styled(
                                &output_buf,
                                &format!("\n✗ Failed to load session: {e}\n"),
                                "error",
                            );
                        }
                    }
                }),
            );
        });
        app.add_action(&sessions_action);

        // Window menu (macOS standard)
        let window_menu = gio::Menu::new();
        window_menu.append(Some("Minimize"), Some("app.minimize"));
        window_menu.append(Some("Hide Chlodwig"), Some("app.hide"));
        window_menu.append(Some("Show Chlodwig"), Some("app.show"));
        menubar.append_submenu(Some("Window"), &window_menu);

        // "Minimize" action (Cmd+M) — minimize the main window
        let minimize_action = gio::SimpleAction::new("minimize", None);
        let window_for_minimize = window.clone();
        minimize_action.connect_activate(move |_, _| {
            window_for_minimize.minimize();
        });
        app.add_action(&minimize_action);
        app.set_accels_for_action("app.minimize", &["<Meta>m"]);

        // "Hide" action (Cmd+H) — hide the main window (macOS "Hide App")
        let hide_action = gio::SimpleAction::new("hide", None);
        let window_for_hide = window.clone();
        hide_action.connect_activate(move |_, _| {
            window_for_hide.set_visible(false);
        });
        app.add_action(&hide_action);
        app.set_accels_for_action("app.hide", &["<Meta>h"]);

        // "Show" action (Shift+Cmd+H) — show the window again after hide
        let show_action = gio::SimpleAction::new("show", None);
        let window_for_show = window.clone();
        show_action.connect_activate(move |_, _| {
            window_for_show.set_visible(true);
            window_for_show.present();
        });
        app.add_action(&show_action);
        app.set_accels_for_action("app.show", &["<Shift><Meta>h"]);
    }

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
                    state.apply_table_sort_states(&snapshot.table_sorts);
                    state.session_name = snapshot.name.clone();
                }
                // Update window title with restored name
                {
                    let cwd_name: Option<String> = std::env::current_dir()
                        .ok()
                        .and_then(|p| p.file_name().map(|n| n.to_string_lossy().into_owned()));
                    let restored_title = chlodwig_gtk::window::format_window_title(
                        cwd_name.as_deref(),
                        snapshot.name.as_deref(),
                    );
                    window.set_title(Some(&restored_title));
                }

                // Render restored blocks into the output buffer
                render::render_restored_blocks(
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
    let window_for_submit = window.clone();
    let cwd_name_for_submit: Option<String> = std::env::current_dir()
        .ok()
        .and_then(|p| p.file_name().map(|n| n.to_string_lossy().into_owned()));

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
                    let help_md = format!(
                        "{}\n\n{}",
                        chlodwig_core::help_markdown_commands(),
                        chlodwig_core::help_markdown_keys_gtk(),
                    );
                    {
                        let mut state = state_for_submit.borrow_mut();
                        state.blocks.push(chlodwig_gtk::app_state::DisplayBlock::AssistantText(help_md));
                    }
                    let state = state_for_submit.borrow();
                    render::rerender_all_blocks(&output_buf_for_submit, &state, viewport_cols_for_submit.get());
                    window::scroll_to_bottom(&scroll_for_submit);
                    return;
                }
                Command::Shell(cmd_str) => {
                    // Show the command
                    window::append_styled(&output_buf_for_submit, &format!("\n$ {cmd_str}\n"), "user");

                    // Execute synchronously (blocking — fine for simple commands)
                    let (output, _is_error) = chlodwig_gtk::app_state::execute_shell_pty(&cmd_str);

                    // Render output with ANSI colors
                    render::render_ansi_output(&output_buf_for_submit, &output);

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
                                let name_part = info.name.as_deref()
                                    .map(|n| format!(" [{n}]"))
                                    .unwrap_or_default();
                                let line = format!(
                                    "  {}{} — {} ({} messages, {})\n",
                                    info.filename.trim_end_matches(".json"),
                                    name_part,
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
                        Some(p) => {
                            // Try exact-name match first (preserves spaces),
                            // then fall back to filename-prefix match.
                            match chlodwig_core::load_session_by_name(p) {
                                Ok(Some(snap)) => Ok(Some(snap)),
                                Ok(None) => chlodwig_core::load_session_by_prefix(p),
                                Err(e) => Err(e),
                            }
                        }
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
                                state.apply_table_sort_states(&snapshot.table_sorts);
                                state.session_name = snapshot.name.clone();
                            }
                            // Update window title with restored name
                            let restored_title = chlodwig_gtk::window::format_window_title(
                                cwd_name_for_submit.as_deref(),
                                snapshot.name.as_deref(),
                            );
                            window_for_submit.set_title(Some(&restored_title));
                            viewport_cols_for_submit.set(
                                chlodwig_gtk::viewport::viewport_columns(
                                    output_view_for_submit.upcast_ref::<gtk4::TextView>(),
                                ),
                            );
                            render::render_restored_blocks(&output_buf_for_submit, &state_for_submit.borrow(), viewport_cols_for_submit.get());
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
                Command::Name(new_name) => {
                    // Duplicate check: another session must not already have this name.
                    if let Some(ref n) = new_name {
                        let my_path = chlodwig_core::session_path_for(&session_started_at_for_submit);
                        match chlodwig_core::session_name_exists(n, Some(&my_path)) {
                            Ok(true) => {
                                window::append_styled(
                                    &output_buf_for_submit,
                                    &format!("\n✗ A session with the name \"{n}\" already exists. Choose a different name.\n"),
                                    "error",
                                );
                                window::scroll_to_bottom(&scroll_for_submit);
                                return;
                            }
                            Err(e) => {
                                window::append_styled(
                                    &output_buf_for_submit,
                                    &format!("\n✗ Could not check session names: {e}\n"),
                                    "error",
                                );
                                window::scroll_to_bottom(&scroll_for_submit);
                                return;
                            }
                            Ok(false) => {} // unique → proceed
                        }
                    }
                    {
                        let mut state = state_for_submit.borrow_mut();
                        state.session_name = new_name.clone();
                    }
                    // Update window title.
                    let new_title = chlodwig_gtk::window::format_window_title(
                        cwd_name_for_submit.as_deref(),
                        new_name.as_deref(),
                    );
                    window_for_submit.set_title(Some(&new_title));
                    // Persist immediately.
                    let _ = prompt_tx_clone.send(BackgroundCommand::SaveSession {
                        started_at: session_started_at_for_submit.clone(),
                        table_sorts: state_for_submit.borrow().table_sort_states(),
                        name: new_name.clone(),
                    });
                    let msg = match &new_name {
                        Some(n) => format!("\n✓ Session named: {n}\n"),
                        None => "\n✓ Session name cleared.\n".to_string(),
                    };
                    window::append_styled(&output_buf_for_submit, &msg, "system");
                    window::scroll_to_bottom(&scroll_for_submit);
                    return;
                }
                Command::Save => {
                    let _ = prompt_tx_clone.send(BackgroundCommand::SaveSession {
                        started_at: session_started_at_for_submit.clone(),
                        table_sorts: state_for_submit.borrow().table_sort_states(),
                        name: state_for_submit.borrow().session_name.clone(),
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
        render::rerender_all_blocks(&output_buf_for_toggle, &state, viewport_cols_for_toggle.get());
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

    // --- Table header click: sort table by clicked column ---
    {
        let state_for_sort = app_state.clone();
        let output_buf_for_sort = widgets.output_buffer.clone();
        let output_view_for_sort = widgets.output_view.clone();
        let viewport_cols_for_sort = viewport_cols.clone();
        let scroll_for_sort = widgets.output_scroll.clone();
        let prompt_tx_for_sort = prompt_tx.clone();
        let session_started_at_for_sort = session_started_at.clone();
        let gesture = gtk4::GestureClick::new();
        gesture.set_button(1); // left click only
        gesture.connect_released(move |_gesture, _n_press, x, y| {
            // Convert widget coordinates to buffer coordinates
            let (bx, by) = output_view_for_sort.window_to_buffer_coords(
                gtk4::TextWindowType::Widget,
                x as i32,
                y as i32,
            );
            if let Some(iter) = output_view_for_sort.iter_at_location(bx, by) {
                // Check all tags at this position for table_sort:G:C
                for tag in iter.tags() {
                    if let Some(name) = tag.name() {
                        if let Some(rest) = name.strip_prefix("table_sort:") {
                            let parts: Vec<&str> = rest.split(':').collect();
                            if parts.len() == 2 {
                                if let (Ok(global_idx), Ok(col_idx)) =
                                    (parts[0].parse::<usize>(), parts[1].parse::<usize>())
                                {
                                    let mut state = state_for_sort.borrow_mut();
                                    if state.sort_table(global_idx, col_idx) {
                                        let vw = viewport_cols_for_sort.get();
                                        render::rerender_table_in_place(&output_buf_for_sort, &state, global_idx, vw);
                                        // Save sort state immediately
                                        let _ = prompt_tx_for_sort.send(BackgroundCommand::SaveSession {
                                            started_at: session_started_at_for_sort.clone(),
                                            table_sorts: state.table_sort_states(),
                                            name: state.session_name.clone(),
                                        });
                                        if state.auto_scroll.is_active() {
                                            let sc = scroll_for_sort.clone();
                                            glib::idle_add_local_once(move || {
                                                window::scroll_to_bottom(&sc);
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        widgets.output_view.add_controller(gesture);
    }

    // --- Table row highlight on hover ---
    {
        // Create the highlight tag once
        let highlight_tag = gtk4::TextTag::builder()
            .name("table_row_highlight")
            .background("rgba(255,255,255,0.08)")
            .build();
        widgets.output_buffer.tag_table().add(&highlight_tag);

        let output_view_for_motion = widgets.output_view.clone();
        let output_buf_for_motion = widgets.output_buffer.clone();
        let prev_highlight_line = std::rc::Rc::new(std::cell::Cell::new(-1i32));

        let motion = gtk4::EventControllerMotion::new();
        let prev_line_for_motion = prev_highlight_line.clone();
        motion.connect_motion(move |_ctrl, x, y| {
            let (bx, by) = output_view_for_motion.window_to_buffer_coords(
                gtk4::TextWindowType::Widget,
                x as i32,
                y as i32,
            );
            let buf = &output_buf_for_motion;

            // Remove previous highlight
            let prev = prev_line_for_motion.get();
            if prev >= 0 {
                if let Some(tag) = buf.tag_table().lookup("table_row_highlight") {
                    let start = buf.iter_at_line(prev).unwrap_or_else(|| buf.start_iter());
                    let mut end = start;
                    end.forward_to_line_end();
                    buf.remove_tag(&tag, &start, &end);
                }
            }

            // Check if cursor is on a table data row (contains │ but not ┌┐└┘├┤)
            if let Some(iter) = output_view_for_motion.iter_at_location(bx, by) {
                let line = iter.line();
                let line_start = buf.iter_at_line(line).unwrap_or_else(|| buf.start_iter());
                let mut line_end = line_start;
                line_end.forward_to_line_end();
                let text = buf.text(&line_start, &line_end, false);

                let is_data_row = text.contains('│')
                    && !text.starts_with('┌')
                    && !text.starts_with('└')
                    && !text.starts_with('├');

                if is_data_row {
                    if let Some(tag) = buf.tag_table().lookup("table_row_highlight") {
                        let start = buf.iter_at_line(line).unwrap_or_else(|| buf.start_iter());
                        let mut end = start;
                        end.forward_to_line_end();
                        buf.apply_tag(&tag, &start, &end);
                    }
                    prev_line_for_motion.set(line);
                } else {
                    prev_line_for_motion.set(-1);
                }
            } else {
                prev_line_for_motion.set(-1);
            }
        });

        // Clear highlight when mouse leaves the view
        let output_buf_for_leave = widgets.output_buffer.clone();
        let prev_line_for_leave = prev_highlight_line.clone();
        motion.connect_leave(move |_ctrl| {
            let prev = prev_line_for_leave.get();
            if prev >= 0 {
                if let Some(tag) = output_buf_for_leave.tag_table().lookup("table_row_highlight") {
                    let start = output_buf_for_leave.iter_at_line(prev).unwrap_or_else(|| output_buf_for_leave.start_iter());
                    let mut end = start;
                    end.forward_to_line_end();
                    output_buf_for_leave.remove_tag(&tag, &start, &end);
                }
                prev_line_for_leave.set(-1);
            }
        });

        widgets.output_view.add_controller(motion);
    }

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
                render::render_event_to_buffer(
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
                table_sorts: state_for_events.borrow().table_sort_states(),
                name: state_for_events.borrow().session_name.clone(),
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

                render::rerender_streaming_markdown(
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
                let vp = viewport_cols_for_events.get();

                // Build table overrides if the finalized block has tables
                let block_idx = state.blocks.len().saturating_sub(1);
                let table_overrides: Vec<(usize, &chlodwig_core::TableData)> = state
                    .tables
                    .iter()
                    .filter(|(bi, _, _)| *bi == block_idx)
                    .map(|(_, ti, td)| (*ti, td))
                    .collect();
                let lines = if table_overrides.is_empty() {
                    chlodwig_core::render_markdown_with_width(final_text, vp)
                } else {
                    chlodwig_core::render_markdown_with_table_overrides(final_text, vp, &table_overrides)
                };

                // Delete previous streaming render
                chlodwig_gtk::emoji_overlay::clear_overlays_from(&output_buf, streaming_start_offset.get());
                let end_off = output_buf.end_iter().offset();
                if end_off > streaming_start_offset.get() {
                    let mut start = output_buf.iter_at_offset(streaming_start_offset.get());
                    let mut end = output_buf.iter_at_offset(end_off);
                    output_buf.delete(&mut start, &mut end);
                }

                // Re-render with table header tags
                render::append_styled_lines_with_table_headers(&output_buf, &lines, &state.tables, block_idx);
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
                render::send_turn_complete_notification(&window_for_notify, &project_name);
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
                        render::rerender_all_blocks(&output_buf, &state, current_cols);
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
                    BackgroundCommand::SaveSession { started_at, table_sorts, name } => {
                        let snapshot = chlodwig_core::SessionSnapshot {
                            saved_at: chrono::Local::now().to_rfc3339(),
                            started_at,
                            model: conv_state.model.clone(),
                            messages: conv_state.messages.clone(),
                            system_prompt: conv_state.system_prompt.clone(),
                            constants: None,
                            table_sorts,
                            name,
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
// Rendering functions are in render.rs
mod render;
