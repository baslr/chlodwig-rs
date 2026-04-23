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

use crate::tab::BackgroundCommand;
use crate::{render, restore};

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
    /// The `adw::TabPage` this submit handler is bound to. Used to look
    /// up the owning `AiConversationTab` for tab-title refreshes after
    /// `/name` / `/clear` (single SSoT — `AiConversationTab::refresh_tab_title`).
    pub page: libadwaita::TabPage,
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
        page,
        stop_flag,
    } = ctx;

    let input_buf = widgets.input_buffer.clone();
    let prompt_tx_clone = prompt_tx.clone();
    let state_for_submit = app_state.clone();
    let scroll_for_submit = widgets.output_scroll.clone();
    let status_left_for_submit = widgets.status_left_label.clone();
    let status_right_for_submit = widgets.status_right_label.clone();
    let session_started_at_for_submit = session_started_at.clone();
    let viewport_cols_for_submit = viewport_cols.clone();
    let final_view_for_submit = widgets.final_view.clone();
    let streaming_view_for_submit = widgets.streaming_view.clone();
    let window_for_submit = window.clone();
    let stop_flag_for_submit = stop_flag.clone();
    let page_for_submit = page.clone();
    let cwd_name_for_submit: Option<String> = {
        let n = app_state.borrow().project_dir_name();
        if n.is_empty() { None } else { Some(n) }
    };

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
                    // Clear the output view
                    final_view_for_submit.clear();
                    // Show CWD again
                    let cwd_msg = state_for_submit.borrow().startup_cwd_message();
                    window::append_styled(&final_view_for_submit, &format!("{cwd_msg}\n"), "system");
                    // Tell background task to clear ConversationState.messages
                    let _ = prompt_tx_clone.send(BackgroundCommand::ClearMessages);
                    window::update_status(&status_left_for_submit, &status_right_for_submit, &state_for_submit.borrow());
                    // Refresh tab title — clearing also clears session_name.
                    if let Some(t) = crate::tab::ai_conversation::lookup_by_page(&page_for_submit) {
                        t.refresh_tab_title();
                    }
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
                    render::render_all_blocks_into(&final_view_for_submit, &state, viewport_cols_for_submit.get(), true);
                    window::scroll_to_content_bottom(&scroll_for_submit, &final_view_for_submit, &streaming_view_for_submit);
                    return;
                }
                Command::Shell(cmd_str) => {
                    // Show the command
                    window::append_styled(&final_view_for_submit, &format!("\n$ {cmd_str}\n"), "user");

                    // Execute synchronously in this tab's cwd. Process cwd
                    // is NOT mutated between tabs (Stage 0.x cwd refactor),
                    // so we must pass the tab cwd explicitly — otherwise
                    // commands like `git status` run in the wrong dir.
                    let tab_cwd = state_for_submit.borrow().cwd.clone();
                    let (output, _is_error) = chlodwig_core::execute_shell_pty(&cmd_str, &tab_cwd);

                    // Render output with ANSI colors
                    render::render_ansi_output(&final_view_for_submit, &output);

                    window::scroll_to_content_bottom(&scroll_for_submit, &final_view_for_submit, &streaming_view_for_submit);
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
                        &final_view_for_submit,
                        "\n⏳ Compacting conversation…\n",
                        "system",
                    );
                    window::scroll_to_content_bottom(&scroll_for_submit, &final_view_for_submit, &streaming_view_for_submit);
                    return;
                }
                Command::Sessions => {
                    match chlodwig_core::list_sessions() {
                        Ok(sessions) if sessions.is_empty() => {
                            window::append_styled(
                                &final_view_for_submit,
                                "\nNo saved sessions found.\n",
                                "system",
                            );
                        }
                        Ok(sessions) => {
                            window::append_styled(
                                &final_view_for_submit,
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
                                window::append_styled(&final_view_for_submit, &line, "result");
                            }
                        }
                        Err(e) => {
                            window::append_styled(
                                &final_view_for_submit,
                                &format!("\n✗ Error listing sessions: {e}\n"),
                                "error",
                            );
                        }
                    }
                    window::scroll_to_content_bottom(&scroll_for_submit, &final_view_for_submit, &streaming_view_for_submit);
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
                                output_view: &final_view_for_submit,
                                streaming_view: &streaming_view_for_submit,
                                output_scroll: &scroll_for_submit,
                                window: &window_for_submit,
                                viewport_cols: &viewport_cols_for_submit,
                                status_left: &status_left_for_submit,
                                status_right: &status_right_for_submit,
                                prompt_tx: &prompt_tx_clone,
                                cwd_name: cwd_name_for_submit.as_deref(),
                            };
                            restore::apply_restored_session_to_ui(snapshot, &ctx);
                            // Refresh tab title — restore may have set a session_name.
                            if let Some(t) = crate::tab::ai_conversation::lookup_by_page(&page_for_submit) {
                                t.refresh_tab_title();
                            }
                        }
                        Ok(None) => {
                            let msg = match &prefix {
                                None => "No saved session found.".to_string(),
                                Some(p) => format!(
                                    "No session matching prefix '{p}' found. Use /sessions to list available sessions."
                                ),
                            };
                            window::append_styled(
                                &final_view_for_submit,
                                &format!("\n{msg}\n"),
                                "system",
                            );
                            window::scroll_to_content_bottom(&scroll_for_submit, &final_view_for_submit, &streaming_view_for_submit);
                        }
                        Err(e) => {
                            window::append_styled(
                                &final_view_for_submit,
                                &format!("\n✗ Failed to load session: {e}\n"),
                                "error",
                            );
                            window::scroll_to_content_bottom(&scroll_for_submit, &final_view_for_submit, &streaming_view_for_submit);
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
                                    &final_view_for_submit,
                                    &format!("\n✗ A session with the name \"{n}\" already exists. Choose a different name.\n"),
                                    "error",
                                );
                                window::scroll_to_content_bottom(&scroll_for_submit, &final_view_for_submit, &streaming_view_for_submit);
                                return;
                            }
                            Err(e) => {
                                window::append_styled(
                                    &final_view_for_submit,
                                    &format!("\n✗ Could not check session names: {e}\n"),
                                    "error",
                                );
                                window::scroll_to_content_bottom(&scroll_for_submit, &final_view_for_submit, &streaming_view_for_submit);
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
                    // Refresh the tab tab title (single SSoT —
                    // AiConversationTab::refresh_tab_title).
                    if let Some(t) = crate::tab::ai_conversation::lookup_by_page(&page_for_submit) {
                        t.refresh_tab_title();
                    }
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
                    window::append_styled(&final_view_for_submit, &msg, "system");
                    window::scroll_to_content_bottom(&scroll_for_submit, &final_view_for_submit, &streaming_view_for_submit);
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
                        &final_view_for_submit,
                        "\n✓ Session saved.\n",
                        "system",
                    );
                    window::scroll_to_content_bottom(&scroll_for_submit, &final_view_for_submit, &streaming_view_for_submit);
                    return;
                }
                Command::Stop => {
                    // Cooperative interrupt: the flag is observed by run_turn
                    // in the background task after the current SSE message_stop.
                    stop_flag_for_submit
                        .store(true, std::sync::atomic::Ordering::SeqCst);
                    window::append_styled(
                        &final_view_for_submit,
                        "\n⏸ Stop requested — will interrupt after the current message.\n",
                        "system",
                    );
                    window::scroll_to_content_bottom(&scroll_for_submit, &final_view_for_submit, &streaming_view_for_submit);
                    return;
                }
                Command::Unwind(count) => {
                    // /unwind round-trips through the background task because
                    // the background owns ConversationState.messages.
                    //
                    // IMPORTANT: this is NOT /clear. Session counters,
                    // session_name, and tab title all stay. Only `blocks`,
                    // `tables`, `tool_id_to_info`, and the streaming buffer
                    // get rebuilt from the new tail.
                    let (ack_tx, ack_rx) = tokio::sync::oneshot::channel();
                    if prompt_tx_clone
                        .send(BackgroundCommand::Unwind { count, ack: ack_tx })
                        .is_err()
                    {
                        window::append_styled(
                            &final_view_for_submit,
                            "\n✗ Background task is gone — cannot unwind.\n",
                            "error",
                        );
                        window::scroll_to_content_bottom(
                            &scroll_for_submit,
                            &final_view_for_submit,
                            &streaming_view_for_submit,
                        );
                        return;
                    }
                    let state_for_unwind = state_for_submit.clone();
                    let final_view_for_unwind = final_view_for_submit.clone();
                    let streaming_view_for_unwind = streaming_view_for_submit.clone();
                    let scroll_for_unwind = scroll_for_submit.clone();
                    let viewport_cols_for_unwind = viewport_cols_for_submit.clone();
                    let status_left_for_unwind = status_left_for_submit.clone();
                    let status_right_for_unwind = status_right_for_submit.clone();

                    glib::spawn_future_local(async move {
                        let Ok((removed, remaining_msgs)) = ack_rx.await else {
                            window::append_styled(
                                &final_view_for_unwind,
                                "\n✗ Unwind acknowledgement lost.\n",
                                "error",
                            );
                            return;
                        };
                        // Pure mutation: rebuild blocks from the new tail
                        // without touching counters / session_name.
                        state_for_unwind
                            .borrow_mut()
                            .unwind_to_messages(&remaining_msgs);
                        // render_all_blocks_into wipes the view entirely
                        // before re-rendering, so we must re-emit the CWD
                        // header to match the original startup layout.
                        render::render_all_blocks_into(
                            &final_view_for_unwind,
                            &state_for_unwind.borrow(),
                            viewport_cols_for_unwind.get(),
                            true,
                        );
                        let confirm = if removed == 0 {
                            "\nNothing to unwind — no messages in history.\n".to_string()
                        } else {
                            format!(
                                "\n↩ Unwound {removed} message{} ({} remaining).\n",
                                if removed == 1 { "" } else { "s" },
                                remaining_msgs.len(),
                            )
                        };
                        window::append_styled(&final_view_for_unwind, &confirm, "system");
                        window::update_status(
                            &status_left_for_unwind,
                            &status_right_for_unwind,
                            &state_for_unwind.borrow(),
                        );
                        window::scroll_to_content_bottom(
                            &scroll_for_unwind,
                            &final_view_for_unwind,
                            &streaming_view_for_unwind,
                        );
                    });
                    return;
                }
                Command::Cwd(arg) => {
                    match arg {
                        None => {
                            // Show current cwd
                            let cwd_display = state_for_submit.borrow().cwd.display().to_string();
                            window::append_styled(
                                &final_view_for_submit,
                                &format!("\n📂 Current directory: {cwd_display}\n"),
                                "system",
                            );
                        }
                        Some(path_arg) => {
                            let current_cwd = state_for_submit.borrow().cwd.clone();
                            match chlodwig_core::command::resolve_cwd_arg(&path_arg, &current_cwd) {
                                Ok(new_cwd) => {
                                    state_for_submit.borrow_mut().cwd = new_cwd.clone();
                                    let _ = prompt_tx_clone.send(BackgroundCommand::SetCwd { new_cwd: new_cwd.clone() });
                                    window::append_styled(
                                        &final_view_for_submit,
                                        &format!("\n📂 Changed directory to: {}\n", new_cwd.display()),
                                        "system",
                                    );
                                    // Refresh tab title to show new directory name.
                                    if let Some(t) = crate::tab::ai_conversation::lookup_by_page(&page_for_submit) {
                                        t.refresh_tab_title();
                                    }
                                }
                                Err(e) => {
                                    window::append_styled(
                                        &final_view_for_submit,
                                        &format!("\n✗ {e}\n"),
                                        "error",
                                    );
                                }
                            }
                        }
                    }
                    window::scroll_to_content_bottom(&scroll_for_submit, &final_view_for_submit, &streaming_view_for_submit);
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
        window::append_styled(&final_view_for_submit, &format!("\n▶ {text}\n"), "user");
        window::scroll_to_content_bottom(&scroll_for_submit, &final_view_for_submit, &streaming_view_for_submit);
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

    // Toggle Tool Usage button (label "Hide Tools" / "Show Tools").
    //
    // Flips `state.show_tool_usage`, updates the button label, and
    // re-renders the whole final view so already-displayed
    // ToolUseStart / ToolResult blocks appear or disappear immediately
    // (without waiting for the next streaming event).
    //
    // Borrow discipline (Gotcha #46): we read out everything we need
    // from the borrow into locals BEFORE calling any GTK setter that
    // could synchronously fire signals (`set_label`, the buffer
    // mutations inside `render_all_blocks_into`).
    {
        let state_for_toggle = app_state.clone();
        let final_view_for_toggle = widgets.final_view.clone();
        let viewport_cols_for_toggle = viewport_cols.clone();
        widgets.toggle_tool_button.connect_clicked(move |btn| {
            let new_show = {
                let mut state = state_for_toggle.borrow_mut();
                state.show_tool_usage = !state.show_tool_usage;
                state.show_tool_usage
            };
            btn.set_label(if new_show { "Hide Tools" } else { "Show Tools" });
            // Re-render entire output from blocks — read state immutably here.
            let state = state_for_toggle.borrow();
            render::render_all_blocks_into(
                &final_view_for_toggle,
                &state,
                viewport_cols_for_toggle.get(),
                true,
            );
        });
    }


    // ── Floating "↓ jump to bottom" button (issue #28) ──────────────
    //
    // Click-only trigger. Issue #28 listed `End` and `Cmd+↓` as
    // keyboard-shortcut SUGGESTIONS, but every plausible binding
    // collides with TextView / macOS text-editing defaults that fire
    // while the cursor is in the input field (the only place a
    // key-controller on `input_view` would receive events anyway):
    //   - bare ↓             : cursor down within multiline input
    //   - bare End           : TextView "cursor to end-of-line"
    //   - Cmd+↓ / Cmd+↑      : macOS "cursor to start/end-of-document"
    //   - Shift+↓            : extend SELECTION by one line
    //   - Cmd+Shift+↓        : extend selection to end-of-document
    //   - Ctrl+Shift+↓       : extend selection to end-of-paragraph
    // The mouse click on the button is the SSoT. (Code review M2.)
    //
    // The closure does THREE things, in this order:
    //   1. flip `auto_scroll` ON → subsequent streaming re-pins to
    //      bottom (issue #28: "Re-enable auto-follow").
    //   2. hide the button explicitly. The visibility flip in
    //      `tab/ai_conversation.rs::connect_value_changed` only fires
    //      on USER scrolls (`is_user_scroll(prev, curr)`); a
    //      programmatic `set_value(target)` is NOT a user scroll, so
    //      the button would otherwise stay stuck on screen even
    //      though the viewport snapped to bottom. (Code review fix #5.)
    //   3. actually move the viewport. The `auto_scroll` flag alone
    //      doesn't move pixels — `scroll_to_content_bottom` does.
    //
    // Borrow discipline (Gotcha #45): the `borrow_mut()` is used as a
    // STATEMENT-TEMPORARY, never bound to a `let`. The `RefMut` drops
    // at the `;` BEFORE `set_visible` / `scroll_to_content_bottom`
    // synchronously dispatch into value-changed handlers that
    // re-borrow the same RefCell. Test `test_jump_closure_does_not_
    // bind_borrow_mut_to_local` guards this invariant.
    {
        let state_for_jump = app_state.clone();
        let scroll_for_jump = widgets.output_scroll.clone();
        let final_view_for_jump = widgets.final_view.clone();
        let streaming_view_for_jump = widgets.streaming_view.clone();
        let btn_for_jump = widgets.scroll_to_bottom_button.clone();
        let jump_to_bottom = move || {
            // (1) statement-temporary borrow_mut — drops at the `;`.
            state_for_jump.borrow_mut().auto_scroll.scroll_to_bottom();
            // (2) hide the button (value-changed filter would skip the
            // programmatic scroll below).
            btn_for_jump.set_visible(false);
            // (3) actually move the viewport.
            window::scroll_to_content_bottom(
                &scroll_for_jump,
                &final_view_for_jump,
                &streaming_view_for_jump,
            );
        };
        widgets
            .scroll_to_bottom_button
            .connect_clicked(move |_| jump_to_bottom());
    }
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
    // Stage B: attached to the per-tab `input_view` (NOT the window) so
    // every tab gets its own independent Esc-Esc detector. Attaching to
    // the window would multiply the handler per tab and fire them all at
    // once. Esc in the prompt input is the natural place anyway: the
    // user presses Esc-Esc to interrupt while their cursor is in the
    // input field.
    {
        const DOUBLE_ESC_WINDOW: std::time::Duration = std::time::Duration::from_millis(500);
        let last_esc: Rc<Cell<Option<std::time::Instant>>> = Rc::new(Cell::new(None));
        let stop_flag_for_esc = stop_flag.clone();
        let final_view_for_esc = widgets.final_view.clone();
        let streaming_view_for_esc = widgets.streaming_view.clone();
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
                    &final_view_for_esc,
                    "\n⏸ Stop requested (Esc Esc) — will interrupt after the current message.\n",
                    "system",
                );
                window::scroll_to_content_bottom(&scroll_for_esc, &final_view_for_esc, &streaming_view_for_esc);
                last_esc.set(None);
            } else {
                last_esc.set(Some(now));
            }
            glib::Propagation::Proceed
        });
        widgets.input_view.add_controller(esc_ctrl);
        let _ = window; // window kept in SubmitContext for future use (e.g. transient dialogs)
    }
}
