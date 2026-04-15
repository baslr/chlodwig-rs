//! Chlodwig GTK — native GUI entry point.
//!
//! This binary provides the same functionality as `chlodwig-rs` (terminal TUI)
//! but rendered in a native GTK4/Adwaita window instead of a terminal emulator.

use gtk4::prelude::*;
use gtk4::glib;
use std::cell::RefCell;
use std::rc::Rc;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::mpsc;

use chlodwig_core::{
    ConversationEvent, ConversationState, ContentBlock, Message, Role, SystemBlock, ToolContext,
};
use chlodwig_gtk::app_state::AppState;
use chlodwig_gtk::window;

fn main() -> glib::ExitCode {
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

    // Initialize Adwaita application
    let app = libadwaita::Application::builder()
        .application_id("rs.chlodwig.gtk")
        .build();

    app.connect_activate(move |app| {
        activate(app);
    });

    app.run()
}

fn activate(app: &libadwaita::Application) {
    let (window, widgets) = window::build_window(app);

    // --- Shared state ---
    let app_state = Rc::new(RefCell::new(AppState::new(
        std::env::var("CHLODWIG_MODEL")
            .unwrap_or_else(|_| "github/claude-opus-4.6".into()),
    )));

    // Channel: conversation events from background task → GTK main loop
    let (event_tx, event_rx) = mpsc::unbounded_channel::<ConversationEvent>();
    let event_rx = Rc::new(RefCell::new(Some(event_rx)));

    // Channel: submit prompt from GTK → background task
    let (prompt_tx, mut prompt_rx) = mpsc::unbounded_channel::<String>();

    // Set initial status
    window::update_status(&widgets.status_left_label, &widgets.status_right_label, &app_state.borrow());

    // --- Wire up Send button ---
    let input_buf = widgets.input_buffer.clone();
    let prompt_tx_clone = prompt_tx.clone();
    let state_for_submit = app_state.clone();
    let output_buf_for_submit = widgets.output_buffer.clone();
    let scroll_for_submit = widgets.output_scroll.clone();
    let status_left_for_submit = widgets.status_left_label.clone();
    let status_right_for_submit = widgets.status_right_label.clone();

    let submit = move || {
        let start = input_buf.start_iter();
        let end = input_buf.end_iter();
        let text = input_buf.text(&start, &end, false).to_string();
        let text = text.trim().to_string();
        if text.is_empty() {
            return;
        }
        input_buf.set_text("");

        // Update AppState
        state_for_submit.borrow_mut().submit_prompt(text.clone());

        // Render user message in output
        window::append_styled(&output_buf_for_submit, &format!("\n▶ {text}\n"), "user");
        window::scroll_to_bottom(&scroll_for_submit);
        window::update_status(&status_left_for_submit, &status_right_for_submit, &state_for_submit.borrow());

        // Send to background conversation loop
        let _ = prompt_tx_clone.send(text);
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
    //
    // Cmd+V/C/X/A (macOS): GTK4's GtkTextView binds paste/copy/cut/select-all
    // to <Control>v/c/x/a. On macOS, users press Cmd (META_MASK) not Ctrl.
    // GTK4 has an internal Cmd→Ctrl remapping, but it doesn't work reliably
    // with MacPorts builds (GTK 4.14.x). We explicitly handle Cmd+V/C/X/A
    // by emitting the corresponding clipboard signals.
    let submit_for_key = submit.clone();
    let input_view_for_key = widgets.input_view.clone();
    let input_view_key_ctrl = gtk4::EventControllerKey::new();
    input_view_key_ctrl.connect_key_pressed(move |_, key, _keycode, modifiers| {
        let is_cmd = modifiers.contains(gtk4::gdk::ModifierType::META_MASK)
            || modifiers.contains(gtk4::gdk::ModifierType::CONTROL_MASK);

        if key == gtk4::gdk::Key::Return && is_cmd {
            submit_for_key();
            return glib::Propagation::Stop;
        }

        // Cmd+V → paste, Cmd+C → copy, Cmd+X → cut, Cmd+A → select all
        // Cmd+Backspace → delete from cursor to line start
        if is_cmd {
            match key {
                k if k == gtk4::gdk::Key::v || k == gtk4::gdk::Key::V => {
                    input_view_for_key.emit_paste_clipboard();
                    return glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::c || k == gtk4::gdk::Key::C => {
                    input_view_for_key.emit_copy_clipboard();
                    return glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::x || k == gtk4::gdk::Key::X => {
                    input_view_for_key.emit_cut_clipboard();
                    return glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::a || k == gtk4::gdk::Key::A => {
                    let buf = input_view_for_key.buffer();
                    buf.select_range(&buf.start_iter(), &buf.end_iter());
                    return glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::BackSpace => {
                    let buf = input_view_for_key.buffer();
                    let text = buf.text(&buf.start_iter(), &buf.end_iter(), false).to_string();
                    let cursor = buf.cursor_position() as usize;
                    let (new_text, new_cursor) = chlodwig_gtk::app_state::delete_to_line_start(&text, cursor);
                    buf.set_text(&new_text);
                    let iter = buf.iter_at_offset(new_cursor as i32);
                    buf.place_cursor(&iter);
                    return glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::Left => {
                    let buf = input_view_for_key.buffer();
                    let text = buf.text(&buf.start_iter(), &buf.end_iter(), false).to_string();
                    let cursor = buf.cursor_position() as usize;
                    let new_pos = chlodwig_gtk::app_state::line_start_pos(&text, cursor);
                    let iter = buf.iter_at_offset(new_pos as i32);
                    buf.place_cursor(&iter);
                    return glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::Right => {
                    let buf = input_view_for_key.buffer();
                    let text = buf.text(&buf.start_iter(), &buf.end_iter(), false).to_string();
                    let cursor = buf.cursor_position() as usize;
                    let new_pos = chlodwig_gtk::app_state::line_end_pos(&text, cursor);
                    let iter = buf.iter_at_offset(new_pos as i32);
                    buf.place_cursor(&iter);
                    return glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::Up => {
                    let buf = input_view_for_key.buffer();
                    buf.place_cursor(&buf.start_iter());
                    return glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::Down => {
                    let buf = input_view_for_key.buffer();
                    buf.place_cursor(&buf.end_iter());
                    return glib::Propagation::Stop;
                }
                _ => {}
            }
        }

        // Option+Left → word left, Option+Right → word right, Option+Backspace → delete word back
        let is_alt = modifiers.contains(gtk4::gdk::ModifierType::ALT_MASK);
        if is_alt {
            match key {
                k if k == gtk4::gdk::Key::Left => {
                    let buf = input_view_for_key.buffer();
                    let text = buf.text(&buf.start_iter(), &buf.end_iter(), false).to_string();
                    let cursor = buf.cursor_position() as usize;
                    let new_pos = chlodwig_gtk::app_state::word_left_pos(&text, cursor);
                    let iter = buf.iter_at_offset(new_pos as i32);
                    buf.place_cursor(&iter);
                    return glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::Right => {
                    let buf = input_view_for_key.buffer();
                    let text = buf.text(&buf.start_iter(), &buf.end_iter(), false).to_string();
                    let cursor = buf.cursor_position() as usize;
                    let new_pos = chlodwig_gtk::app_state::word_right_pos(&text, cursor);
                    let iter = buf.iter_at_offset(new_pos as i32);
                    buf.place_cursor(&iter);
                    return glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::BackSpace => {
                    let buf = input_view_for_key.buffer();
                    let text = buf.text(&buf.start_iter(), &buf.end_iter(), false).to_string();
                    let cursor = buf.cursor_position() as usize;
                    let (new_text, new_cursor) = chlodwig_gtk::app_state::delete_word_back(&text, cursor);
                    buf.set_text(&new_text);
                    let iter = buf.iter_at_offset(new_cursor as i32);
                    buf.place_cursor(&iter);
                    return glib::Propagation::Stop;
                }
                _ => {}
            }
        }

        glib::Propagation::Proceed
    });
    widgets.input_view.add_controller(input_view_key_ctrl);

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

    // --- Poll conversation events on GTK main loop ---
    let state_for_events = app_state.clone();
    let output_buf = widgets.output_buffer.clone();
    let scroll = widgets.output_scroll.clone();
    let status_left_label = widgets.status_left_label.clone();
    let status_right_label = widgets.status_right_label.clone();

    // Use glib::timeout_add_local to periodically check for events
    // This bridges the async Tokio world with the GTK main loop.
    let event_rx_cell = event_rx.clone();
    // Track tool_use_id → (tool_name, input) so ToolResult can identify Read/Bash/Write/Grep
    let mut tool_id_to_info: std::collections::HashMap<String, (String, serde_json::Value)> =
        std::collections::HashMap::new();
    // Char offset in the TextBuffer where the current streaming Markdown starts.
    // -1 means "no streaming in progress".
    let mut streaming_start_offset: i32 = -1;
    // Snapshot of the streaming buffer text for Markdown rendering.
    // Filled from AppState on each tick; used for the per-tick re-render.
    let mut last_streaming_snapshot = String::new();
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
                    _ => {}
                }

                // Render non-streaming events into the TextBuffer
                render_event_to_buffer(
                    &output_buf,
                    &event,
                    &mut tool_id_to_info,
                );
                state.handle_event(event)
            };
            if should_update {
                needs_scroll = true;
            }
        }

        // --- Streaming Markdown rendering (once per tick) ---
        //
        // Three cases:
        // 1. Streaming is ongoing (dirty) → re-render streaming_buffer as Markdown
        // 2. Streaming was finalized this tick (TextComplete/ToolUseStart) → render final text
        // 3. Neither → nothing to do
        {
            let mut state = state_for_events.borrow_mut();

            // Case 1: ongoing streaming with new deltas
            if state.streaming_dirty && !streaming_finalized {
                // First delta in this streaming run: record start offset
                if streaming_start_offset < 0 {
                    if output_buf.end_iter().offset() > 0 {
                        window::append_to_output(&output_buf, "\n");
                    }
                    streaming_start_offset = output_buf.end_iter().offset();
                }

                rerender_streaming_markdown(
                    &output_buf,
                    streaming_start_offset,
                    &state.streaming_buffer,
                );
                last_streaming_snapshot = state.streaming_buffer.clone();
                state.acknowledge_streaming_render();
                needs_scroll = true;
            }

            // Case 2: streaming was finalized this tick
            if streaming_finalized {
                if streaming_start_offset < 0 {
                    // Edge case: TextComplete arrived in the same tick as the first delta
                    if output_buf.end_iter().offset() > 0 {
                        window::append_to_output(&output_buf, "\n");
                    }
                    streaming_start_offset = output_buf.end_iter().offset();
                }

                let final_text = finalized_text.as_deref().unwrap_or("");
                rerender_streaming_markdown(&output_buf, streaming_start_offset, final_text);
                window::append_to_output(&output_buf, "\n");

                streaming_start_offset = -1;
                last_streaming_snapshot.clear();
                state.acknowledge_streaming_render();
                needs_scroll = true;
            }
        }

        if needs_scroll {
            window::update_status(&status_left_label, &status_right_label, &state_for_events.borrow());
            // Schedule scroll after rendering settles
            let scroll_clone = scroll.clone();
            glib::idle_add_local_once(move || {
                window::scroll_to_bottom(&scroll_clone);
            });
        } else if state_for_events.borrow().is_streaming {
            // No new events this tick, but still streaming — update status bar
            // so the spinner animation keeps rotating (~every 16ms tick).
            window::update_status(&status_left_label, &status_right_label, &state_for_events.borrow());
        }

        glib::ControlFlow::Continue
    });

    // --- Start background conversation loop ---
    let event_tx_bg = event_tx.clone();

    // Spawn the background task that runs the conversation loop.
    // The Tokio runtime is created inside the thread (not shared with GTK).
    std::thread::spawn(move || {
        let rt = tokio::runtime::Runtime::new().expect("Failed to create Tokio runtime");
        rt.block_on(async move {
            let api_key = match chlodwig_core::resolve_api_key(None) {
                Ok(key) => key,
                Err(msg) => {
                    let _ = event_tx_bg.send(ConversationEvent::Error(msg));
                    return;
                }
            };
            let model = std::env::var("CHLODWIG_MODEL")
                .unwrap_or_else(|_| "github/claude-opus-4.6".into());
            let base_url = std::env::var("ANTHROPIC_BASE_URL").ok();

            let mut client = chlodwig_api::AnthropicClient::new(api_key);
            if let Some(url) = base_url {
                client = client.with_base_url(url);
            }
            let api_client: Arc<dyn chlodwig_core::ApiClient> = Arc::new(client);

            let system_prompt = build_system_prompt();
            let tools = chlodwig_tools::builtin_tools();

            let mut conv_state = ConversationState {
                messages: Vec::new(),
                model,
                system_prompt,
                max_tokens: 16384,
                tools,
                tool_context: ToolContext {
                    working_directory: std::env::current_dir().unwrap_or_default(),
                    timeout: Duration::from_secs(120),
                },
            };

            let permission = chlodwig_core::AutoApprovePrompter;

            while let Some(prompt) = prompt_rx.recv().await {
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
            }
        });
    });

    window.present();
}

/// Delete the Markdown-rendered streaming range and re-render with new text.
///
/// Called once per tick to update the live-streaming Markdown view.
/// `start_offset` is the char offset where streaming started in the TextBuffer.
fn rerender_streaming_markdown(
    buffer: &gtk4::TextBuffer,
    start_offset: i32,
    markdown_text: &str,
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
    let lines = chlodwig_core::render_markdown(markdown_text);
    chlodwig_gtk::md_renderer::append_styled_lines(buffer, &lines);
}

/// Render a single ConversationEvent into the GTK TextBuffer.
///
/// This handles all non-streaming events: tool calls, tool results, errors, etc.
/// **TextDelta and TextComplete are handled by the per-tick streaming re-render
/// in the main event loop** — they are no-ops here.
fn render_event_to_buffer(
    buffer: &gtk4::TextBuffer,
    event: &ConversationEvent,
    tool_id_to_info: &mut std::collections::HashMap<String, (String, serde_json::Value)>,
) {
    match event {
        // Streaming events are handled by the per-tick Markdown re-render.
        ConversationEvent::TextDelta(_) | ConversationEvent::TextComplete(_) => {}
        ConversationEvent::ToolUseStart { id, name, input } => {
            // Track tool id → (name, input) for ToolResult matching
            tool_id_to_info.insert(id.clone(), (name.clone(), input.clone()));

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

fn build_system_prompt() -> Vec<SystemBlock> {
    let cwd = std::env::current_dir()
        .map(|p| p.display().to_string())
        .unwrap_or_else(|_| "unknown".into());
    let date = chrono::Local::now().format("%Y-%m-%d");

    let base = format!(
        r#"You are Claude, an AI assistant made by Anthropic. You are helping a user via a GUI application.

You have access to tools that let you interact with the user's computer:
- Bash: Execute shell commands
- Read: Read file contents with line numbers
- Write: Write files (creates parent directories)
- Edit: Find and replace in files
- Glob: Find files by pattern
- Grep: Search file contents with regex
- ListDir: List directory contents

Current working directory: {cwd}
Current date: {date}

When using tools:
- Use absolute paths for file operations
- Be careful with destructive operations
- Explain what you're doing before using tools

Be concise and helpful. When asked to make changes, use tools directly rather than just showing code."#
    );

    let mut blocks = vec![SystemBlock::cached(base)];

    // Load CLAUDE.md
    if let Some(claude_md) = load_claude_md() {
        blocks.push(SystemBlock::cached(claude_md));
    }

    blocks
}

fn load_claude_md() -> Option<String> {
    let mut parts = Vec::new();

    if let Some(home) = dirs::home_dir() {
        let global = home.join(".claude").join("CLAUDE.md");
        if let Ok(content) = std::fs::read_to_string(&global) {
            if !content.trim().is_empty() {
                parts.push(format!("# Global CLAUDE.md\n{content}"));
            }
        }
    }

    if let Ok(cwd) = std::env::current_dir() {
        let local = cwd.join("CLAUDE.md");
        if let Ok(content) = std::fs::read_to_string(&local) {
            if !content.trim().is_empty() {
                parts.push(format!("# Project CLAUDE.md ({})\n{content}", local.display()));
            }
        }
    }

    if parts.is_empty() { None } else { Some(parts.join("\n\n")) }
}

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
