//! Input-submit handler: parses commands, dispatches to background, or sends a prompt.
//!
//! Stage 3 of the GTK main.rs refactor (see `docs/gtk-main-refactoring.md`).
//! This was the largest single block in `main.rs` (~286 lines): a closure that
//! reads the input buffer, intercepts `/` commands (clear, help, shell, quit,
//! compact, sessions, resume, name, save), and otherwise sends a
//! `BackgroundCommand::Prompt` to the conversation loop. It also wires the
//! Send button click and the Cmd/Ctrl+Return keyboard shortcut.
//!
//! `main.rs` now calls [`wire`] once during `activate()`.
//!
//! This module lives inside the **binary** (not the lib), so it can refer to
//! `crate::BackgroundCommand` directly — same pattern as `restore.rs` /
//! `menu.rs` / `table_interactions.rs`.

use std::cell::{Cell, RefCell};
use std::rc::Rc;

use gtk4::prelude::*;
use gtk4::{glib, ApplicationWindow};
use tokio::sync::mpsc::UnboundedSender;

use chlodwig_gtk::app_state::AppState;
use chlodwig_gtk::window;

use crate::{render, restore, BackgroundCommand};

/// Bundles every value the submit closure captures.
///
/// Built once in `main.rs::activate` and consumed by [`wire`]. Without this
/// struct the call site would need ~12 positional arguments.
pub struct SubmitContext {
    pub widgets: window::UiWidgets,
    pub app_state: Rc<RefCell<AppState>>,
    pub prompt_tx: UnboundedSender<BackgroundCommand>,
    pub viewport_cols: Rc<Cell<usize>>,
    pub window: ApplicationWindow,
    pub session_started_at: String,
    /// Cooperative stop flag shared with the background conversation task.
    pub stop_flag: std::sync::Arc<std::sync::atomic::AtomicBool>,
}

/// Build the submit closure, wire it to the Send button, and bind
/// Cmd/Ctrl+Return on the input view.
pub fn wire(ctx: SubmitContext) {
    let SubmitContext {
        widgets,
        app_state,
        prompt_tx,
        viewport_cols,
        window,
        session_started_at,
        stop_flag,
    } = ctx;

    let input_buf = widgets.input_buffer.clone();
    let prompt_tx_clone = prompt_tx.clone();
    let state_for_submit = app_state.clone();
    let final_buf_for_submit = widgets.final_buffer.clone();
    let scroll_for_submit = widgets.output_scroll.clone();
    let status_left_for_submit = widgets.status_left_label.clone();
    let status_right_for_submit = widgets.status_right_label.clone();
    let session_started_at_for_submit = session_started_at.clone();
    let viewport_cols_for_submit = viewport_cols.clone();
    let final_view_for_submit = widgets.final_view.clone();
    let window_for_submit = window.clone();
    let stop_flag_for_submit = stop_flag.clone();
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
                    let mut s = final_buf_for_submit.start_iter();
                    let mut e = final_buf_for_submit.end_iter();
                    chlodwig_gtk::emoji_overlay::clear_overlays_from(&final_buf_for_submit, 0);
                    final_buf_for_submit.delete(&mut s, &mut e);
                    // Show CWD again
                    let cwd_msg = chlodwig_gtk::app_state::startup_cwd_message();
                    window::append_styled(&final_buf_for_submit, &format!("{cwd_msg}\n"), "system");
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
                    render::render_all_blocks_into(&final_buf_for_submit, &state, viewport_cols_for_submit.get(), true);
                    window::scroll_to_bottom(&scroll_for_submit);
                    return;
                }
                Command::Shell(cmd_str) => {
                    // Show the command
                    window::append_styled(&final_buf_for_submit, &format!("\n$ {cmd_str}\n"), "user");

                    // Execute synchronously (blocking — fine for simple commands)
                    let (output, _is_error) = chlodwig_gtk::app_state::execute_shell_pty(&cmd_str);

                    // Render output with ANSI colors
                    render::render_ansi_output(&final_buf_for_submit, &output);

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
                        &final_buf_for_submit,
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
                                &final_buf_for_submit,
                                "\nNo saved sessions found.\n",
                                "system",
                            );
                        }
                        Ok(sessions) => {
                            window::append_styled(
                                &final_buf_for_submit,
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
                                window::append_styled(&final_buf_for_submit, &line, "result");
                            }
                        }
                        Err(e) => {
                            window::append_styled(
                                &final_buf_for_submit,
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
                            let ctx = restore::RestoreContext {
                                state: &state_for_submit,
                                output_buf: &final_buf_for_submit,
                                output_view: &final_view_for_submit,
                                output_scroll: &scroll_for_submit,
                                window: &window_for_submit,
                                viewport_cols: &viewport_cols_for_submit,
                                status_left: &status_left_for_submit,
                                status_right: &status_right_for_submit,
                                prompt_tx: &prompt_tx_clone,
                                cwd_name: cwd_name_for_submit.as_deref(),
                            };
                            restore::apply_restored_session_to_ui(snapshot, &ctx);
                        }
                        Ok(None) => {
                            let msg = match &prefix {
                                None => "No saved session found.".to_string(),
                                Some(p) => format!(
                                    "No session matching prefix '{p}' found. Use /sessions to list available sessions."
                                ),
                            };
                            window::append_styled(
                                &final_buf_for_submit,
                                &format!("\n{msg}\n"),
                                "system",
                            );
                            window::scroll_to_bottom(&scroll_for_submit);
                        }
                        Err(e) => {
                            window::append_styled(
                                &final_buf_for_submit,
                                &format!("\n✗ Failed to load session: {e}\n"),
                                "error",
                            );
                            window::scroll_to_bottom(&scroll_for_submit);
                        }
                    }
                    return;
                }
                Command::Name(new_name) => {
                    // Duplicate check: another session must not already have this name.
                    if let Some(ref n) = new_name {
                        let my_path = chlodwig_core::session_path_for(&session_started_at_for_submit);
                        match chlodwig_core::session_name_exists(n, Some(&my_path)) {
                            Ok(true) => {
                                window::append_styled(
                                    &final_buf_for_submit,
                                    &format!("\n✗ A session with the name \"{n}\" already exists. Choose a different name.\n"),
                                    "error",
                                );
                                window::scroll_to_bottom(&scroll_for_submit);
                                return;
                            }
                            Err(e) => {
                                window::append_styled(
                                    &final_buf_for_submit,
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
                        stats: state_for_submit.borrow().session_stats(),
                    });
                    let msg = match &new_name {
                        Some(n) => format!("\n✓ Session named: {n}\n"),
                        None => "\n✓ Session name cleared.\n".to_string(),
                    };
                    window::append_styled(&final_buf_for_submit, &msg, "system");
                    window::scroll_to_bottom(&scroll_for_submit);
                    return;
                }
                Command::Save => {
                    let _ = prompt_tx_clone.send(BackgroundCommand::SaveSession {
                        started_at: session_started_at_for_submit.clone(),
                        table_sorts: state_for_submit.borrow().table_sort_states(),
                        name: state_for_submit.borrow().session_name.clone(),
                        stats: state_for_submit.borrow().session_stats(),
                    });
                    window::append_styled(
                        &final_buf_for_submit,
                        "\n✓ Session saved.\n",
                        "system",
                    );
                    window::scroll_to_bottom(&scroll_for_submit);
                    return;
                }
                Command::Stop => {
                    // Cooperative interrupt: the flag is observed by run_turn
                    // in the background task after the current SSE message_stop.
                    stop_flag_for_submit
                        .store(true, std::sync::atomic::Ordering::SeqCst);
                    window::append_styled(
                        &final_buf_for_submit,
                        "\n⏸ Stop requested — will interrupt after the current message.\n",
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
        window::append_styled(&final_buf_for_submit, &format!("\n▶ {text}\n"), "user");
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

    // Cmd+Enter (macOS) or Ctrl+Enter (Linux/Windows) to send.
    // Plain Enter inserts a newline (GTK default behavior).
    //
    // On macOS, Cmd maps to META_MASK in GTK4. We check both META (Cmd)
    // and CONTROL (Ctrl) so the shortcut works on all platforms.
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

    // Double-Escape to request stop of the current turn loop.
    //
    // Esc is handled at the window level so it fires regardless of focus.
    // The first press records `Instant::now()`; a second press within
    // DOUBLE_ESC_WINDOW sets the cooperative stop flag (same effect as
    // typing `/stop`). A lone Esc is a no-op (doesn't cancel input, etc.).
    {
        const DOUBLE_ESC_WINDOW: std::time::Duration = std::time::Duration::from_millis(500);
        let last_esc: Rc<Cell<Option<std::time::Instant>>> = Rc::new(Cell::new(None));
        let stop_flag_for_esc = stop_flag.clone();
        let final_buf_for_esc = widgets.final_buffer.clone();
        let scroll_for_esc = widgets.output_scroll.clone();
        let esc_ctrl = gtk4::EventControllerKey::new();
        esc_ctrl.connect_key_pressed(move |_, key, _keycode, _modifiers| {
            if key != gtk4::gdk::Key::Escape {
                return glib::Propagation::Proceed;
            }
            let now = std::time::Instant::now();
            let is_double = last_esc
                .get()
                .map(|t| now.duration_since(t) <= DOUBLE_ESC_WINDOW)
                .unwrap_or(false);
            if is_double {
                stop_flag_for_esc.store(true, std::sync::atomic::Ordering::SeqCst);
                window::append_styled(
                    &final_buf_for_esc,
                    "\n⏸ Stop requested (Esc Esc) — will interrupt after the current message.\n",
                    "system",
                );
                window::scroll_to_bottom(&scroll_for_esc);
                last_esc.set(None);
            } else {
                last_esc.set(Some(now));
            }
            glib::Propagation::Proceed
        });
        window.add_controller(esc_ctrl);
    }
}
