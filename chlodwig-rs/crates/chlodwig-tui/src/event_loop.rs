//! Main TUI event loop.

use chlodwig_core::{
    ApiClient, ConversationEvent, ConversationState, PermissionDecision, PermissionPrompter,
    SessionSnapshot, ToolResultContent,
};
use crossterm::{
    event::{self, Event, KeyCode, KeyEventKind, KeyModifiers},
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::{backend::CrosstermBackend, Terminal};
use std::sync::{Arc, Mutex, OnceLock};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::Duration;
use tokio::sync::mpsc;

use crate::app::App;
use crate::permissions::{PermissionRequest, TuiPermissionPrompter};
use crate::render::ui;
use crate::types::*;

/// Global storage for the latest App crash dump.
/// Updated on every redraw so the panic hook can access it.
static CRASH_STATE: OnceLock<Mutex<String>> = OnceLock::new();

pub(crate) fn crash_state() -> &'static Mutex<String> {
    CRASH_STATE.get_or_init(|| Mutex::new(String::new()))
}

// ---------------------------------------------------------------------------
// Static 10 MiB crash buffer — pre-allocated so signal handlers can write
// without touching the heap allocator (which may be corrupted on SIGSEGV).
// ---------------------------------------------------------------------------

/// Size of the static crash buffer: 10 MiB.
pub(crate) const STATIC_CRASH_BUF_SIZE: usize = 10 * 1024 * 1024;

/// The buffer itself. Zero-initialized at program start, lives in BSS.
static mut CRASH_BUF: [u8; STATIC_CRASH_BUF_SIZE] = [0u8; STATIC_CRASH_BUF_SIZE];

/// How many bytes are currently used in CRASH_BUF.
static CRASH_BUF_LEN: AtomicUsize = AtomicUsize::new(0);

/// Append bytes to the static crash buffer (no heap allocation).
/// Returns the number of bytes actually written (may be less if buffer is full).
fn crash_buf_write(data: &[u8]) -> usize {
    let current = CRASH_BUF_LEN.load(Ordering::Relaxed);
    let avail = STATIC_CRASH_BUF_SIZE.saturating_sub(current);
    let n = data.len().min(avail);
    if n > 0 {
        // SAFETY: We are the only writer (signal handler runs single-threaded
        // after a fatal signal; tests are #[serial] or use unique sections).
        // Use ptr::addr_of_mut! to avoid creating a mutable reference to the static.
        unsafe {
            let base = std::ptr::addr_of_mut!(CRASH_BUF) as *mut u8;
            std::ptr::copy_nonoverlapping(data.as_ptr(), base.add(current), n);
        }
        CRASH_BUF_LEN.store(current + n, Ordering::Relaxed);
    }
    n
}

/// Reset the static crash buffer (for testing).
fn crash_buf_reset() {
    CRASH_BUF_LEN.store(0, Ordering::Relaxed);
}

/// Write a crash report into the static buffer. Includes:
/// - Header with signal name and timestamp
/// - Best-effort backtrace (via libc backtrace() — no heap needed)
/// - Last known App state from CRASH_STATE
///
/// This is the core function called from the signal handler.
pub(crate) fn write_crash_to_static_buf(signal_name: &str) {
    crash_buf_reset();

    // --- Header ---
    crash_buf_write(b"chlodwig-rs SIGNAL CRASH REPORT\n");
    crash_buf_write(b"==============================\n");

    // Timestamp: we use chrono which may allocate, but the process is dying anyway.
    let ts = chrono::Local::now().format("%Y-%m-%d %H:%M:%S%.3f").to_string();
    crash_buf_write(b"Time:   ");
    crash_buf_write(ts.as_bytes());
    crash_buf_write(b"\nSignal: ");
    crash_buf_write(signal_name.as_bytes());
    crash_buf_write(b"\n\n");

    // --- Backtrace (best-effort via libc) ---
    crash_buf_write(b"Backtrace (raw frames):\n");
    #[cfg(unix)]
    {
        let mut addrs: [*mut libc::c_void; 128] = [std::ptr::null_mut(); 128];
        let n_frames = unsafe { libc::backtrace(addrs.as_mut_ptr(), 128) } as usize;
        for i in 0..n_frames {
            // Format: "  [N] 0xADDRESS\n"
            let addr = addrs[i] as usize;
            let mut num_buf = [0u8; 32];
            let hex = format_hex(addr, &mut num_buf);

            // Index as ASCII digits (0..128 max, so max 3 digits)
            let mut idx_buf = [0u8; 4];
            let idx_len;
            if i < 10 {
                idx_buf[0] = b'0' + i as u8;
                idx_len = 1;
            } else if i < 100 {
                idx_buf[0] = b'0' + (i / 10) as u8;
                idx_buf[1] = b'0' + (i % 10) as u8;
                idx_len = 2;
            } else {
                idx_buf[0] = b'0' + (i / 100) as u8;
                idx_buf[1] = b'0' + ((i / 10) % 10) as u8;
                idx_buf[2] = b'0' + (i % 10) as u8;
                idx_len = 3;
            }

            crash_buf_write(b"  [");
            crash_buf_write(&idx_buf[..idx_len]);
            crash_buf_write(b"] 0x");
            crash_buf_write(hex);
            crash_buf_write(b"\n");
        }

        // Also try backtrace_symbols for symbol names (this MAY allocate, but we're dying)
        if n_frames > 0 {
            crash_buf_write(b"\nBacktrace (symbolicated, best-effort):\n");
            let symbols = unsafe { libc::backtrace_symbols(addrs.as_ptr(), n_frames as i32) };
            if !symbols.is_null() {
                for i in 0..n_frames {
                    let sym_ptr = unsafe { *symbols.add(i) };
                    if !sym_ptr.is_null() {
                        let sym = unsafe { std::ffi::CStr::from_ptr(sym_ptr) };
                        crash_buf_write(b"  ");
                        crash_buf_write(sym.to_bytes());
                        crash_buf_write(b"\n");
                    }
                }
                unsafe { libc::free(symbols as *mut libc::c_void); }
            }
        }
    }
    #[cfg(not(unix))]
    {
        crash_buf_write(b"  (backtrace not available on this platform)\n");
    }
    crash_buf_write(b"\n");

    // --- App state from CRASH_STATE ---
    let app_state = crash_state()
        .lock()
        .map(|s| s.clone())
        .unwrap_or_else(|_| "(lock poisoned)".into());
    crash_buf_write(app_state.as_bytes());
    crash_buf_write(b"\n");
}

/// Read the contents of the static crash buffer as a &str.
/// Returns empty string if nothing has been written.
pub(crate) fn static_crash_buf_as_str() -> &'static str {
    let len = CRASH_BUF_LEN.load(Ordering::Relaxed);
    if len == 0 {
        return "";
    }
    // SAFETY: crash_buf_write only writes valid UTF-8 (from &str / format!).
    // Use addr_of! to avoid creating a reference to the mutable static.
    unsafe {
        let base = std::ptr::addr_of!(CRASH_BUF) as *const u8;
        let slice = std::slice::from_raw_parts(base, len);
        std::str::from_utf8_unchecked(slice)
    }
}

/// Format a usize as hexadecimal into a stack buffer. Returns the slice of hex digits.
fn format_hex(val: usize, buf: &mut [u8; 32]) -> &[u8] {
    if val == 0 {
        buf[0] = b'0';
        return &buf[..1];
    }
    let mut v = val;
    let mut pos = 32;
    while v > 0 && pos > 0 {
        pos -= 1;
        let digit = (v % 16) as u8;
        buf[pos] = if digit < 10 { b'0' + digit } else { b'a' + digit - 10 };
        v /= 16;
    }
    &buf[pos..32]
}

/// Install a panic hook that:
/// 1. Restores the terminal to a usable state
/// 2. Writes a crash report with backtrace + App state to ~/.chlodwig-rs/crash.log
/// 3. Prints the crash info to stderr
fn install_panic_hook() {
    let prev_hook = std::panic::take_hook();
    std::panic::set_hook(Box::new(move |info| {
        // 1. Restore terminal — must happen first so output is visible
        let _ = disable_raw_mode();
        let _ = crossterm::execute!(
            std::io::stdout(),
            LeaveAlternateScreen,
            crossterm::event::DisableMouseCapture
        );

        // 2. Capture backtrace
        let bt = std::backtrace::Backtrace::force_capture();

        // 3. Read last known App state
        let app_state = crash_state()
            .lock()
            .map(|s| s.clone())
            .unwrap_or_else(|_| "(lock poisoned)".into());

        // 4. Build crash report
        let report = format!(
            "chlodwig-rs CRASH REPORT\n\
             =======================\n\
             Time: {}\n\n\
             {info}\n\n\
             Backtrace:\n{bt}\n\n\
             {app_state}",
            chrono::Local::now().format("%Y-%m-%d %H:%M:%S%.3f"),
        );

        // 5. Write to file
        let log_path = chlodwig_core::timestamped_log_path("crash");
        let _ = std::fs::write(&log_path, &report);

        // 6. Print to stderr
        eprintln!("\n{report}");
        eprintln!("\nCrash report written to: {}", log_path.display());

        // Call previous hook (for any chained handlers)
        prev_hook(info);
    }));
}

/// Write a crash report to a file.
/// First writes to static buffer (no heap), then flushes buffer to disk.
pub(crate) fn write_crash_report_sync(signal_name: &str, log_path: &std::path::Path) {
    write_crash_to_static_buf(signal_name);

    if let Some(parent) = log_path.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    let contents = static_crash_buf_as_str();
    let _ = std::fs::write(log_path, contents);
}

/// Install signal handlers for fatal signals (SIGSEGV, SIGBUS, SIGABRT, SIGFPE, SIGHUP)
/// and SIGINT (Ctrl+C) for terminal cleanup.
/// Fatal signals write a crash report. SIGINT only restores the terminal.
///
/// # Safety
/// Signal handlers are inherently unsafe. We accept the risk of calling
/// async-signal-unsafe functions (Mutex::lock, file I/O, terminal control)
/// because the process is already in a fatal state and about to terminate.
/// The 10 MiB static buffer avoids heap allocation for the report itself.
pub(crate) fn install_signal_handlers() {
    #[cfg(unix)]
    {
        use std::sync::atomic::AtomicBool;
        static HANDLER_INSTALLED: AtomicBool = AtomicBool::new(false);

        // Only install once (idempotent)
        if HANDLER_INSTALLED.swap(true, Ordering::SeqCst) {
            return;
        }

        unsafe {
            // Fatal signals: full crash report + terminal restore
            for &sig in &[
                libc::SIGSEGV, libc::SIGBUS, libc::SIGABRT, libc::SIGFPE, libc::SIGHUP,
            ] {
                libc::signal(sig, signal_handler as *const () as libc::sighandler_t);
            }
            // SIGINT: terminal restore only (no crash report)
            libc::signal(libc::SIGINT, sigint_handler as *const () as libc::sighandler_t);
        }
    }
}

#[cfg(unix)]
extern "C" fn signal_handler(sig: libc::c_int) {
    // 1. Restore terminal — use raw write() syscall for safety
    let _ = disable_raw_mode();
    let _ = crossterm::execute!(
        std::io::stdout(),
        LeaveAlternateScreen,
        crossterm::event::DisableMouseCapture
    );

    // 2. Map signal number to name
    let sig_name = match sig {
        libc::SIGSEGV => "SIGSEGV (Segmentation fault)",
        libc::SIGBUS  => "SIGBUS (Bus error)",
        libc::SIGABRT => "SIGABRT (Abort)",
        libc::SIGFPE  => "SIGFPE (Floating point exception)",
        libc::SIGHUP  => "SIGHUP (Hangup)",
        _ => "Unknown signal",
    };

    // 3. Write crash report to file
    let log_path = chlodwig_core::timestamped_log_path("crash");

    write_crash_report_sync(sig_name, &log_path);

    // 4. Print the full static buffer content to stderr
    let buf_contents = static_crash_buf_as_str();
    unsafe {
        libc::write(2, b"\n" as *const u8 as *const libc::c_void, 1);
        libc::write(2, buf_contents.as_ptr() as *const libc::c_void, buf_contents.len());
    }

    // 5. Print log path info
    let msg = format!("\nCrash report written to: {}\n", log_path.display());
    unsafe {
        libc::write(2, msg.as_ptr() as *const libc::c_void, msg.len());
    }

    // 5. Re-raise with default handler so the OS gets the right exit code / core dump
    unsafe {
        libc::signal(sig, libc::SIG_DFL);
        libc::raise(sig);
    }
}

/// SIGINT handler: restore terminal only, no crash report.
/// When the app hangs (e.g. during resize), Ctrl+C should give the user
/// a clean terminal back with the correct exit code (130).
#[cfg(unix)]
extern "C" fn sigint_handler(_sig: libc::c_int) {
    let _ = disable_raw_mode();
    let _ = crossterm::execute!(
        std::io::stdout(),
        LeaveAlternateScreen,
        crossterm::event::DisableMouseCapture
    );

    // Re-raise with default handler → exit code 130 (128 + SIGINT=2)
    unsafe {
        libc::signal(libc::SIGINT, libc::SIG_DFL);
        libc::raise(libc::SIGINT);
    }
}

/// Trigger an asynchronous session save.
///
/// Clones the current messages + system prompt from `ConversationState`,
/// builds a `SessionSnapshot`, and writes it to disk in a blocking task
/// (so the event loop is never stalled by I/O).
fn trigger_session_save(
    state: &std::sync::Arc<tokio::sync::Mutex<ConversationState>>,
    model: &str,
    constants: chlodwig_core::ConstantsSnapshot,
) {
    let state_clone = state.clone();
    let model = model.to_string();
    tokio::spawn(async move {
        let guard = state_clone.lock().await;
        let snapshot = SessionSnapshot {
            saved_at: chrono::Local::now().to_rfc3339(),
            model,
            messages: guard.messages.clone(),
            system_prompt: guard.system_prompt.clone(),
            constants: Some(constants),
        };
        drop(guard); // release lock before blocking I/O

        // Write to disk on the blocking thread pool so we never block the
        // async runtime (session.json can be several MB after long sessions).
        let _ = tokio::task::spawn_blocking(move || {
            if let Err(e) = chlodwig_core::save_session(&snapshot) {
                tracing::warn!("Failed to auto-save session: {e}");
            }
        })
        .await;
    });
}

/// Trigger an asynchronous save of the standalone constants file.
///
/// Called when the user edits a constant value or resets to defaults.
/// Writes to `~/.chlodwig-rs/constants.json` (atomic rename).
fn trigger_constants_save(constants: chlodwig_core::ConstantsSnapshot) {
    tokio::spawn(async move {
        let _ = tokio::task::spawn_blocking(move || {
            if let Err(e) = chlodwig_core::save_constants(&constants) {
                tracing::warn!("Failed to save constants: {e}");
            }
        })
        .await;
    });
}

pub async fn run_tui(
    initial_state: ConversationState,
    api_client: Arc<dyn ApiClient>,
) -> anyhow::Result<()> {
    run_tui_with_permissions(initial_state, api_client, false, None).await
}

pub async fn run_tui_with_permissions(
    initial_state: ConversationState,
    api_client: Arc<dyn ApiClient>,
    bypass_permissions: bool,
    initial_constants: Option<chlodwig_core::ConstantsSnapshot>,
) -> anyhow::Result<()> {
    // Install panic hook before entering raw mode — ensures terminal is
    // restored and crash report is written on any panic.
    install_panic_hook();

    // Install signal handlers for fatal signals (SIGSEGV, SIGBUS, SIGABRT, SIGFPE)
    // — catches crashes that bypass the panic hook.
    install_signal_handlers();

    enable_raw_mode()?;
    crossterm::execute!(
        std::io::stdout(),
        EnterAlternateScreen,
        crossterm::event::EnableMouseCapture
    )?;

    // TerminalGuard ensures cleanup happens even if `?` bails out of the loop.
    // Without this, any `terminal.draw()?` or `event::read()?` error would
    // skip disable_raw_mode() and leave the terminal in a broken state.
    struct TerminalGuard;
    impl Drop for TerminalGuard {
        fn drop(&mut self) {
            let _ = disable_raw_mode();
            let _ = crossterm::execute!(
                std::io::stdout(),
                LeaveAlternateScreen,
                crossterm::event::DisableMouseCapture
            );
        }
    }
    let _terminal_guard = TerminalGuard;

    let backend = CrosstermBackend::new(std::io::stdout());
    let mut terminal = Terminal::new(backend)?;

    let model_name = initial_state.model.clone();
    let system_prompt_blocks = initial_state.system_prompt.clone();
    let initial_messages = initial_state.messages.clone();
    let mut app = App::new(model_name);

    // Store system prompt blocks for the Sys-Prompt tab
    app.system_prompt_blocks = system_prompt_blocks;
    app.rebuild_sys_prompt_lines();

    // If initial_state contains messages (e.g. from --resume), restore them
    // as display blocks so the user can scroll back through the conversation.
    if !initial_messages.is_empty() {
        let msg_count = initial_messages.len();
        app.restore_messages_to_display(&initial_messages);
        app.display_blocks.push(DisplayBlock::SystemMessage(
            format!("✓ Resumed session ({msg_count} messages)"),
        ));
        app.mark_dirty();
    }

    // Restore constants from snapshot if provided (e.g. from --resume).
    // Otherwise, try loading from the standalone constants.json file.
    if let Some(ref constants_snap) = initial_constants {
        app.constants.from_snapshot(constants_snap);
    } else if let Ok(Some(constants_snap)) = chlodwig_core::load_constants() {
        app.constants.from_snapshot(&constants_snap);
        tracing::info!("Loaded constants from constants.json");
    }

    // Channels
    let (event_tx, mut event_rx) = mpsc::unbounded_channel::<ConversationEvent>();
    let (perm_tx, mut perm_rx) = mpsc::unbounded_channel::<PermissionRequest>();

    // Shared state in Arc for the background task
    let state = std::sync::Arc::new(tokio::sync::Mutex::new(initial_state));
    let permission_prompter: std::sync::Arc<dyn PermissionPrompter> = if bypass_permissions {
        std::sync::Arc::new(chlodwig_core::AutoApprovePrompter)
    } else {
        std::sync::Arc::new(TuiPermissionPrompter::new(perm_tx))
    };

    let mut needs_redraw = true;
    let mut redraw_count: u64 = 0;
    let mut last_resize = std::time::Instant::now();
    let mut conversation_handle: Option<tokio::task::JoinHandle<()>> = None;

    tracing::info!(
        model = app.model.as_str(),
        wrap_width = app.wrap_width,
        "entering main event loop"
    );

    loop {
        if needs_redraw {
            redraw_count += 1;
            // Update wrap width from terminal size (output pane width minus borders)
            let new_wrap_width = terminal.size()
                .map(|s| s.width.saturating_sub(2) as usize) // 2 for left+right border
                .unwrap_or(120);
            if new_wrap_width != app.wrap_width {
                app.wrap_width = new_wrap_width;
                app.mark_dirty(); // re-wrap all lines
            }
            app.rebuild_lines();
            // Lazy rebuild of requests lines — only when the tab is visible.
            // This avoids O(n²) CPU burn from re-rendering all SSE chunks
            // (JSON pretty-print + syntect highlighting) on every incoming event.
            if app.requests_dirty && app.active_tab == 2 {
                app.rebuild_requests_lines();
            }
            // Rebuild constants lines when the tab is visible.
            if app.active_tab == 3 {
                app.rebuild_constants_lines();
            }
            // Update crash state snapshot (for panic hook)
            if let Ok(mut guard) = crash_state().lock() {
                *guard = app.crash_dump();
            }
            tracing::debug!(
                redraw = redraw_count,
                rendered_lines = app.rendered_lines.len(),
                is_loading = app.is_loading,
                streaming_buf = app.streaming_buffer.len(),
                "pre-draw"
            );
            if let Err(e) = terminal.draw(|f| ui(f, &app)) {
                tracing::error!("terminal.draw() failed: {e}");
                let log_path = chlodwig_core::timestamped_log_path("crash");
                write_crash_report_sync(&format!("terminal.draw() error: {e}"), &log_path);
                eprintln!("\nchlodwig-rs: terminal.draw() error: {e}");
                eprintln!("Crash report written to: {}", log_path.display());
                return Err(e.into());
            }
            tracing::debug!(redraw = redraw_count, "post-draw");
            app.mark_redrawn();
            needs_redraw = false;
        }

        if app.should_quit {
            break;
        }

        // Poll terminal events — block up to 100ms (idle-friendly)
        tracing::trace!("loop: poll start");
        let poll_result = event::poll(Duration::from_millis(100));
        tracing::trace!(?poll_result, "loop: poll returned");
        match poll_result {
            Err(e) => {
                tracing::error!("event::poll() failed: {e}");
                let log_path = chlodwig_core::timestamped_log_path("crash");
                write_crash_report_sync(&format!("event::poll() error: {e}"), &log_path);
                eprintln!("\nchlodwig-rs: event::poll() error: {e}");
                eprintln!("Crash report written to: {}", log_path.display());
                return Err(e.into());
            }
            Ok(false) => {} // timeout, no events
            Ok(true) => {
            // Drain ALL pending terminal events in one go to prevent
            // mouse move/drag events from causing a busy-loop.
            // Trackpad gestures can queue hundreds of events.
            loop {
                tracing::trace!("loop: read start");
                let ev = match event::read() {
                    Ok(ev) => ev,
                    Err(e) => {
                        tracing::error!("event::read() failed: {e}");
                        let log_path = chlodwig_core::timestamped_log_path("crash");
                        write_crash_report_sync(&format!("event::read() error: {e}"), &log_path);
                        eprintln!("\nchlodwig-rs: event::read() error: {e}");
                        eprintln!("Crash report written to: {}", log_path.display());
                        return Err(e.into());
                    }
                };
                tracing::trace!("loop: read returned");
                match ev {
                Event::Mouse(mouse) => {
                    match mouse.kind {
                        crossterm::event::MouseEventKind::ScrollUp => {
                            app.tab_scroll_up(3);
                            needs_redraw = true;
                        }
                        crossterm::event::MouseEventKind::ScrollDown => {
                            let vh = terminal.size().map(|s| s.height as usize).unwrap_or(40);
                            app.tab_scroll_down(3, vh);
                            needs_redraw = true;
                        }
                        _ => {
                            // Ignore mouse move/click/drag — don't redraw
                        }
                    }
                }
                Event::Key(key) if key.kind == KeyEventKind::Press => {
                    needs_redraw = true;
                    match key.code {
                    // Quit
                    KeyCode::Char('c') if key.modifiers.contains(KeyModifiers::CONTROL) => {
                        app.should_quit = true;
                    }

                    // Submit input
                    KeyCode::Enter
                        if !app.is_loading
                            && !app.input.is_empty()
                            && app.pending_permission.is_none() =>
                    {
                        let prompt: String = app.input.drain(..).collect();
                        app.cursor = 0;

                        // Reset history navigation
                        app.history_index = None;
                        app.saved_input.clear();

                        // Exit commands
                        let trimmed = prompt.trim().to_lowercase();
                        if trimmed == "exit" || trimmed == "quit" || trimmed == "/exit" || trimmed == "/quit" {
                            app.should_quit = true;
                            break; // exit inner drain loop immediately
                        }

                        // /clear command (aliases: /reset, /new)
                        if trimmed == "/clear" || trimmed == "/reset" || trimmed == "/new" {
                            app.clear_conversation();
                            // Also clear ConversationState messages so the API starts fresh
                            let state_clone = state.clone();
                            tokio::spawn(async move {
                                let mut guard = state_clone.lock().await;
                                guard.messages.clear();
                            });
                            // Do NOT auto-save here — keeps the previous session
                            // intact so the user can /resume to get it back.
                            break; // exit inner drain loop
                        }

                        // /resume command — load the last saved session
                        if trimmed == "/resume" {
                            match chlodwig_core::load_session() {
                                Ok(Some(snapshot)) => {
                                    let msg_count = snapshot.messages.len();
                                    // Restore display blocks so the user can scroll back
                                    app.clear_conversation();
                                    app.restore_messages_to_display(&snapshot.messages);
                                    // Restore constants if present in the snapshot
                                    if let Some(ref constants_snap) = snapshot.constants {
                                        app.constants.from_snapshot(constants_snap);
                                    } else if let Ok(Some(constants_snap)) = chlodwig_core::load_constants() {
                                        // Fallback: old session without constants → load from constants.json
                                        app.constants.from_snapshot(&constants_snap);
                                    }
                                    app.display_blocks.push(DisplayBlock::SystemMessage(
                                        format!(
                                            "✓ Resumed session ({msg_count} messages, saved at {})",
                                            snapshot.saved_at
                                        ),
                                    ));
                                    // Restore messages into ConversationState
                                    let state_clone = state.clone();
                                    tokio::spawn(async move {
                                        let mut guard = state_clone.lock().await;
                                        guard.messages = snapshot.messages;
                                    });
                                }
                                Ok(None) => {
                                    app.display_blocks.push(DisplayBlock::SystemMessage(
                                        "No saved session found.".into(),
                                    ));
                                }
                                Err(e) => {
                                    app.display_blocks.push(DisplayBlock::Error(
                                        format!("Failed to load session: {e}"),
                                    ));
                                }
                            }
                            app.mark_dirty();
                            app.scroll_to_bottom();
                            break; // exit inner drain loop
                        }

                        // /save command — manually persist the current session
                        if trimmed == "/save" {
                            trigger_session_save(&state, &app.model, app.constants.to_snapshot());
                            app.display_blocks.push(DisplayBlock::SystemMessage(
                                "✓ Session saved.".into(),
                            ));
                            app.mark_dirty();
                            app.scroll_to_bottom();
                            break; // exit inner drain loop
                        }

                        // /compact command
                        if trimmed == "/compact" || trimmed.starts_with("/compact ") {
                            let custom_instructions = if trimmed.len() > 8 {
                                Some(prompt.trim()[8..].trim().to_string())
                            } else {
                                None
                            };

                            app.is_loading = true;
                            app.scroll_to_bottom();
                            app.mark_dirty();

                            let state_clone = state.clone();
                            let api_clone = api_client.clone();
                            let tx = event_tx.clone();

                            tokio::spawn(async move {
                                let mut state_guard = state_clone.lock().await;
                                if let Err(e) = chlodwig_core::compact_conversation(
                                    &mut state_guard,
                                    api_clone.as_ref(),
                                    &tx,
                                    custom_instructions.as_deref(),
                                )
                                .await
                                {
                                    let _ = tx.send(ConversationEvent::Error(
                                        format!("Compaction failed: {e}"),
                                    ));
                                }
                                let _ = tx.send(ConversationEvent::TurnComplete);
                            });
                            break; // exit inner drain loop
                        }

                        // ! shell command — execute bash and show output
                        if trimmed.starts_with("! ") {
                            let cmd = prompt.trim()[2..].trim();
                            if !cmd.is_empty() {
                                app.prompt_history.push(prompt.clone());
                                let now = chrono::Local::now()
                                    .format("%d.%m.%Y  %H:%M:%S")
                                    .to_string();
                                app.display_blocks
                                    .push(DisplayBlock::Timestamp(now));

                                // Wrap in `script` to provide a PTY so
                                // programs emit ANSI color codes.
                                let mut command = std::process::Command::new("script");
                                if cfg!(target_os = "macos") {
                                    command
                                        .arg("-q")
                                        .arg("/dev/null")
                                        .arg("bash")
                                        .arg("-c")
                                        .arg(cmd);
                                } else {
                                    command
                                        .arg("-q")
                                        .arg("-c")
                                        .arg(format!(
                                            "bash -c '{}'",
                                            cmd.replace('\'', "'\\''")
                                        ))
                                        .arg("/dev/null");
                                }
                                command.env("GIT_PAGER", "cat");
                                let output = command.output();

                                let raw_output = match output {
                                    Ok(out) => {
                                        // With PTY, stderr is merged into stdout
                                        let stdout =
                                            String::from_utf8_lossy(&out.stdout);
                                        if stdout.is_empty() {
                                            let stderr =
                                                String::from_utf8_lossy(&out.stderr);
                                            if stderr.is_empty() {
                                                format!(
                                                    "(exit code: {})",
                                                    out.status.code().unwrap_or(-1)
                                                )
                                            } else {
                                                stderr.into_owned()
                                            }
                                        } else {
                                            stdout.into_owned()
                                        }
                                    }
                                    Err(e) => format!("Error: {e}"),
                                };

                                app.display_blocks.push(DisplayBlock::BashOutput {
                                    command: cmd.to_string(),
                                    raw_output,
                                });
                                app.mark_dirty();
                                app.scroll_to_bottom();
                            }
                            break; // exit inner drain loop
                        }

                        // Save prompt to history (not for commands)
                        app.prompt_history.push(prompt.clone());

                        let now = chrono::Local::now().format("%d.%m.%Y  %H:%M:%S").to_string();
                        app.display_blocks.push(DisplayBlock::Timestamp(now));
                        app.display_blocks
                            .push(DisplayBlock::UserMessage(prompt.clone()));
                        app.is_loading = true;
                        app.scroll_to_bottom(); // auto-scroll
                        app.mark_dirty();
                        app.turn_count += 1;
                        app.turn_input_tokens = 0;
                        app.turn_output_tokens = 0;
                        app.stream_chunks = 0;

                        // Check if auto-compact is needed before the turn
                        let needs_compact = app.total_input_tokens > chlodwig_core::AUTO_COMPACT_THRESHOLD;

                        // Spawn conversation turn
                        let state_clone = state.clone();
                        let api_clone = api_client.clone();
                        let perm_clone = permission_prompter.clone();
                        let tx = event_tx.clone();

                        let handle = tokio::spawn(async move {
                            let mut state_guard = state_clone.lock().await;

                            // Auto-compact if context is too large
                            if needs_compact {
                                tracing::info!(
                                    "Auto-compacting: context tokens exceed threshold"
                                );
                                if let Err(e) = chlodwig_core::compact_conversation(
                                    &mut state_guard,
                                    api_clone.as_ref(),
                                    &tx,
                                    None,
                                )
                                .await
                                {
                                    tracing::warn!("Auto-compaction failed: {e}");
                                    // Continue anyway — the turn might still work
                                }
                            }

                            state_guard.messages.push(chlodwig_core::Message {
                                role: chlodwig_core::Role::User,
                                content: vec![chlodwig_core::ContentBlock::Text { text: prompt }],
                            });
                            if let Err(e) = chlodwig_core::run_turn(
                                &mut state_guard,
                                api_clone.as_ref(),
                                perm_clone.as_ref(),
                                &tx,
                            )
                            .await
                            {
                                tracing::error!("Conversation turn failed: {e}");
                                let _ = tx.send(ConversationEvent::Error(e.to_string()));
                            }
                            let _ = tx.send(ConversationEvent::TurnComplete);
                        });
                        conversation_handle = Some(handle);
                    }

                    // Permission dialog keys
                    KeyCode::Char('y') if app.pending_permission.is_some() => {
                        let perm = app.pending_permission.take().unwrap();
                        let _ = perm.respond.send(PermissionDecision::Allow);
                    }
                    KeyCode::Char('n') if app.pending_permission.is_some() => {
                        let perm = app.pending_permission.take().unwrap();
                        let _ = perm.respond.send(PermissionDecision::Deny);
                    }
                    KeyCode::Char('a') if app.pending_permission.is_some() => {
                        let perm = app.pending_permission.take().unwrap();
                        let _ = perm.respond.send(PermissionDecision::AllowAlways);
                    }

                    // ── Constants tab: inline editing ─────────────────────
                    // When editing a constant value, all input goes to the edit buffer.
                    KeyCode::Char(c) if app.active_tab == 3 && app.constants.is_editing => {
                        app.constants.edit_buffer.push(c);
                    }
                    KeyCode::Backspace if app.active_tab == 3 && app.constants.is_editing => {
                        app.constants.edit_buffer.pop();
                    }
                    KeyCode::Enter if app.active_tab == 3 && app.constants.is_editing => {
                        if app.constants.apply_edit() {
                            // Value changed — persist to constants.json
                            trigger_constants_save(app.constants.to_snapshot());
                        }
                    }
                    KeyCode::Esc if app.active_tab == 3 && app.constants.is_editing => {
                        app.constants.cancel_edit();
                    }
                    // Constants tab: field navigation (when not editing)
                    KeyCode::Up if app.active_tab == 3 && !app.constants.is_editing
                        && app.pending_permission.is_none() =>
                    {
                        app.constants.select_prev();
                    }
                    KeyCode::Down if app.active_tab == 3 && !app.constants.is_editing
                        && app.pending_permission.is_none() =>
                    {
                        app.constants.select_next();
                    }
                    KeyCode::Enter if app.active_tab == 3 && !app.constants.is_editing
                        && !app.is_loading && app.pending_permission.is_none() =>
                    {
                        if app.constants.is_reset_button_selected() {
                            app.constants.reset_to_defaults();
                            // Persist reset values to constants.json
                            trigger_constants_save(app.constants.to_snapshot());
                        } else {
                            app.constants.start_editing();
                        }
                    }
                    KeyCode::Esc if app.active_tab == 3 && !app.constants.is_editing => {
                        // Esc while not editing: go back to prompt tab
                        app.active_tab = 0;
                        app.focus = Focus::Input;
                    }

                    // Word-jump: Alt+Left / Option+Left
                    KeyCode::Left
                        if matches!(app.focus, Focus::Input)
                            && key.modifiers.contains(KeyModifiers::ALT) =>
                    {
                        app.move_cursor_word_left();
                    }
                    // Word-jump: Alt+Right / Option+Right
                    KeyCode::Right
                        if matches!(app.focus, Focus::Input)
                            && key.modifiers.contains(KeyModifiers::ALT) =>
                    {
                        app.move_cursor_word_right();
                    }
                    // Word-jump: Alt+b (macOS Terminal sends ESC b for Option+Left)
                    KeyCode::Char('b')
                        if matches!(app.focus, Focus::Input)
                            && key.modifiers.contains(KeyModifiers::ALT) =>
                    {
                        app.move_cursor_word_left();
                    }
                    // Word-jump: Alt+f (macOS Terminal sends ESC f for Option+Right)
                    KeyCode::Char('f')
                        if matches!(app.focus, Focus::Input)
                            && key.modifiers.contains(KeyModifiers::ALT) =>
                    {
                        app.move_cursor_word_right();
                    }
                    // Delete word backwards: Alt+Backspace / Option+Backspace
                    KeyCode::Backspace
                        if !app.is_loading
                            && app.pending_permission.is_none()
                            && key.modifiers.contains(KeyModifiers::ALT) =>
                    {
                        app.delete_word_back();
                    }
                    // Delete word forwards: Alt+Delete / fn+Option+Backspace on macOS
                    KeyCode::Delete
                        if !app.is_loading
                            && app.pending_permission.is_none()
                            && key.modifiers.contains(KeyModifiers::ALT) =>
                    {
                        app.delete_word_forward();
                    }
                    // Delete word forwards: Alt+d (Emacs binding, macOS Terminal sends ESC d)
                    KeyCode::Char('d')
                        if !app.is_loading
                            && app.pending_permission.is_none()
                            && key.modifiers.contains(KeyModifiers::ALT) =>
                    {
                        app.delete_word_forward();
                    }

                    // Text input
                    KeyCode::Char(c)
                        if !app.is_loading && app.pending_permission.is_none() =>
                    {
                        let byte_pos = app.cursor_byte_pos();
                        app.input.insert(byte_pos, c);
                        app.cursor += 1;
                    }
                    KeyCode::Backspace
                        if !app.is_loading
                            && app.pending_permission.is_none()
                            && app.cursor > 0 =>
                    {
                        app.cursor -= 1;
                        let byte_pos = app.cursor_byte_pos();
                        app.input.remove(byte_pos);
                    }
                    KeyCode::Left if matches!(app.focus, Focus::Input) && app.cursor > 0 => {
                        app.cursor -= 1;
                    }
                    KeyCode::Right if matches!(app.focus, Focus::Input) && app.cursor < app.input_char_count() => {
                        app.cursor += 1;
                    }
                    KeyCode::Home => {
                        app.cursor = 0;
                    }
                    KeyCode::End => {
                        app.cursor = app.input_char_count();
                    }

                    // Scroll
                    KeyCode::PageUp => {
                        app.tab_scroll_up(20);
                    }
                    KeyCode::PageDown => {
                        let vh = terminal.size().map(|s| s.height as usize).unwrap_or(40);
                        app.tab_scroll_down(20, vh);
                    }
                    KeyCode::Up if key.modifiers.contains(KeyModifiers::SHIFT) => {
                        app.tab_scroll_up(1);
                    }
                    KeyCode::Down if key.modifiers.contains(KeyModifiers::SHIFT) => {
                        let vh = terminal.size().map(|s| s.height as usize).unwrap_or(40);
                        app.tab_scroll_down(1, vh);
                    }

                    // Prompt history navigation (plain Up/Down) — focus-dependent
                    KeyCode::Up
                        if !app.is_loading && app.pending_permission.is_none() =>
                    {
                        match app.focus {
                            Focus::TabBar => {
                                app.handle_tab_bar_up();
                            }
                            Focus::Input => {
                                if !app.prompt_history.is_empty() {
                                    match app.history_index {
                                        None => {
                                            app.saved_input = app.input.clone();
                                            app.history_index = Some(0);
                                            app.input = app.prompt_history[app.prompt_history.len() - 1].clone();
                                        }
                                        Some(idx) if idx + 1 < app.prompt_history.len() => {
                                            app.history_index = Some(idx + 1);
                                            app.input = app.prompt_history[app.prompt_history.len() - 1 - idx - 1].clone();
                                        }
                                        _ => {}
                                    }
                                    app.cursor = app.input_char_count();
                                    app.mark_dirty();
                                }
                            }
                        }
                    }
                    KeyCode::Down
                        if !app.is_loading && app.pending_permission.is_none() =>
                    {
                        match app.focus {
                            Focus::Input => {
                                // If navigating history, go through history
                                match app.history_index {
                                    Some(0) => {
                                        app.history_index = None;
                                        app.input = std::mem::take(&mut app.saved_input);
                                        app.cursor = app.input_char_count();
                                        app.mark_dirty();
                                    }
                                    Some(idx) => {
                                        app.history_index = Some(idx - 1);
                                        app.input = app.prompt_history[app.prompt_history.len() - idx].clone();
                                        app.cursor = app.input_char_count();
                                        app.mark_dirty();
                                    }
                                    None => {
                                        // Not in history → go to tab bar
                                        app.handle_down_key();
                                    }
                                }
                            }
                            Focus::TabBar => {
                                // Down in TabBar does nothing
                            }
                        }
                    }

                    // Tab bar Left/Right navigation
                    KeyCode::Left
                        if matches!(app.focus, Focus::TabBar) =>
                    {
                        app.handle_tab_bar_left();
                    }
                    KeyCode::Right
                        if matches!(app.focus, Focus::TabBar) =>
                    {
                        app.handle_tab_bar_right();
                    }

                    _ => {}
                } // match key.code
            } // Event::Key
            Event::Resize(_, _) => {
                // Don't set needs_redraw here — just record that a resize happened.
                // The redraw will happen after the drain loop finishes, so we only
                // render once for the final size (not for every intermediate size
                // while dragging the window edge).
                last_resize = std::time::Instant::now();
            }
            _ => {} // Focus, Paste — don't redraw
            }

                // Break if no more events are pending
                tracing::trace!("loop: drain-poll start");
                match event::poll(Duration::from_millis(0)) {
                    Ok(true) => {
                        tracing::trace!("loop: drain-poll more events");
                    }
                    Ok(false) => {
                        tracing::trace!("loop: drain-poll done, breaking");
                        break;
                    }
                    Err(e) => {
                        tracing::error!("event::poll(0) failed: {e}");
                        break; // don't crash on drain poll error, just exit loop
                    }
                }
            } // end inner drain loop

            // Deferred resize: if a Resize event occurred during the drain, trigger
            // a single redraw for the final terminal size. This avoids rendering for
            // every intermediate size while dragging the window edge.
            if last_resize.elapsed() < Duration::from_millis(200) {
                needs_redraw = true;
            }
        } // end Ok(true) => poll had events
        } // end match poll_result

        // Drain conversation events
        tracing::trace!("loop: channel-drain start");
        while let Ok(ev) = event_rx.try_recv() {
            match ev {
                ConversationEvent::TextDelta(text) => {
                    tracing::debug!(
                        delta_len = text.len(),
                        buf_len = app.streaming_buffer.len(),
                        chunks = app.stream_chunks,
                        "TextDelta received"
                    );
                    app.streaming_buffer.push_str(&text);
                    app.stream_chunks += 1;
                    app.scroll_to_bottom_if_auto();
                }
                ConversationEvent::TextComplete(text) => {
                    tracing::debug!(
                        text_len = text.len(),
                        text_lines = text.lines().count(),
                        stream_chunks = app.stream_chunks,
                        "TextComplete received"
                    );
                    app.streaming_buffer.clear();
                    let now = chrono::Local::now().format("%d.%m.%Y  %H:%M:%S").to_string();
                    app.display_blocks.push(DisplayBlock::Timestamp(now));
                    app.display_blocks.push(DisplayBlock::AssistantText(text));
                }
                ConversationEvent::ToolUseStart { name, input, .. } => {
                    if !input.is_null() {
                        app.display_blocks.push(DisplayBlock::ToolCall {
                            name,
                            input_preview: serde_json::to_string_pretty(&input)
                                .unwrap_or_default(),
                        });
                        app.scroll_to_bottom_if_auto();
                    }
                }
                ConversationEvent::ToolResult {
                    output, is_error, ..
                } => {
                    let preview = match &output {
                        ToolResultContent::Text(t) => {
                            if t.len() > 500 {
                                // Find last char boundary at or before 500 bytes.
                                // Direct byte slicing (&t[..500]) panics on multi-byte
                                // UTF-8 chars like '├' (3 bytes) or '🎉' (4 bytes).
                                let mut end = 500;
                                while end > 0 && !t.is_char_boundary(end) {
                                    end -= 1;
                                }
                                format!("{}...", &t[..end])
                            } else {
                                t.clone()
                            }
                        }
                        ToolResultContent::Blocks(_) => "(content blocks)".into(),
                    };
                    app.display_blocks
                        .push(DisplayBlock::ToolResult { is_error, preview });
                    app.scroll_to_bottom_if_auto();
                }
                ConversationEvent::ThinkingComplete(text) => {
                    app.display_blocks.push(DisplayBlock::Thinking(text));
                }
                ConversationEvent::TurnComplete => {
                    app.is_loading = false;
                    app.streaming_buffer.clear();
                    // Auto-save session after every completed turn
                    trigger_session_save(&state, &app.model, app.constants.to_snapshot());
                }
                ConversationEvent::Error(e) => {
                    app.display_blocks.push(DisplayBlock::Error(e));
                    app.is_loading = false;
                    app.streaming_buffer.clear();
                }
                ConversationEvent::Usage {
                    input_tokens,
                    output_tokens,
                } => {
                    app.total_input_tokens += input_tokens as u64;
                    app.total_output_tokens += output_tokens as u64;
                    app.turn_input_tokens += input_tokens as u64;
                    app.turn_output_tokens += output_tokens as u64;
                }
                ConversationEvent::ApiRequestMade => {
                    app.api_request_count += 1;
                }
                ConversationEvent::HttpRequestSent {
                    body_json,
                    timestamp,
                } => {
                    app.requests_log.push_back(RequestLogEntry {
                        timestamp,
                        request_body: body_json,
                        response_model: String::new(),
                        response_input_tokens: 0,
                        response_output_tokens: 0,
                        duration_ms: None,
                        response_chunks: Vec::new(),
                    });
                    while app.requests_log.len() > MAX_REQUEST_LOG {
                        app.requests_log.pop_front();
                    }
                    app.requests_dirty = true;
                }
                ConversationEvent::HttpResponseMeta {
                    model,
                    input_tokens,
                    output_tokens,
                } => {
                    if let Some(last) = app.requests_log.back_mut() {
                        last.response_model = model;
                        last.response_input_tokens = input_tokens;
                        last.response_output_tokens = output_tokens;
                    }
                    app.requests_dirty = true;
                }
                ConversationEvent::HttpResponseComplete { duration_ms } => {
                    if let Some(last) = app.requests_log.back_mut() {
                        last.duration_ms = Some(duration_ms);
                    }
                    app.requests_dirty = true;
                }
                ConversationEvent::SseRawChunk(raw) => {
                    if let Some(last) = app.requests_log.back_mut() {
                        last.response_chunks.push(raw);
                    }
                    app.requests_dirty = true;
                    // Don't rebuild on every chunk — too expensive.
                    // Rebuild happens on HttpResponseComplete.
                }
                ConversationEvent::CompactionStarted => {
                    app.display_blocks
                        .push(DisplayBlock::SystemMessage("Compacting conversation...".into()));
                    app.streaming_buffer.clear();
                    app.scroll_to_bottom_if_auto();
                }
                ConversationEvent::CompactionComplete {
                    old_messages,
                    summary_tokens,
                } => {
                    app.on_compaction_complete(old_messages, summary_tokens);
                    // Auto-save session after compaction (messages were replaced)
                    trigger_session_save(&state, &app.model, app.constants.to_snapshot());
                }
                _ => {}
            }
            app.mark_dirty();
            needs_redraw = true;
        }

        // Drain permission requests
        while let Ok(req) = perm_rx.try_recv() {
            app.pending_permission = Some(PendingPermission {
                tool_name: req.tool_name,
                input: req.input,
                respond: req.respond,
            });
            needs_redraw = true;
        }

        tracing::trace!("loop: channel-drain done");

        // Check if the conversation task panicked (JoinHandle monitoring).
        // If the spawned task panicked, the JoinHandle resolves to Err(JoinError).
        // Without this check, a panic in tokio::spawn is completely silent
        // (alternate screen hides stderr, and the event loop never learns the task died).
        if let Some(ref handle) = conversation_handle {
            if handle.is_finished() {
                // Take ownership so we can inspect it
                let handle = conversation_handle.take().unwrap();
                match handle.await {
                    Ok(()) => {
                        // Normal completion — task already sent TurnComplete
                    }
                    Err(join_error) => {
                        let msg = if join_error.is_panic() {
                            let panic_info = join_error.into_panic();
                            let panic_msg = if let Some(s) = panic_info.downcast_ref::<String>() {
                                s.clone()
                            } else if let Some(s) = panic_info.downcast_ref::<&str>() {
                                (*s).to_string()
                            } else {
                                "unknown panic payload".to_string()
                            };
                            tracing::error!("Conversation task panicked: {panic_msg}");
                            format!("Internal error: conversation task panicked: {panic_msg}")
                        } else {
                            tracing::error!("Conversation task cancelled");
                            "Internal error: conversation task was cancelled".to_string()
                        };
                        app.display_blocks.push(DisplayBlock::Error(msg));
                        app.is_loading = false;
                        app.streaming_buffer.clear();
                        needs_redraw = true;
                    }
                }
            }
        }

        // Tick spinner animation while loading (every 100ms poll cycle)
        if app.is_loading {
            app.tick_spinner();
            // Only patch the spinner line — do NOT mark_dirty() which would
            // trigger a full rebuild_lines() (re-parse all markdown, re-wrap
            // all lines). With 700+ rendered lines that takes >100ms and
            // causes the UI to freeze.
            app.update_spinner_line();
            needs_redraw = true;
        }

        // Periodic timer refresh: redraw every ~60s so title-bar timers stay current
        if app.needs_timer_redraw() {
            needs_redraw = true;
        }
        tracing::trace!(needs_redraw, "loop: iteration end");
    }

    tracing::info!(
        redraws = redraw_count,
        turns = app.turn_count,
        reason = if app.should_quit { "should_quit" } else { "unknown" },
        "exited main event loop"
    );

    // TerminalGuard handles cleanup via Drop — no manual disable_raw_mode needed.
    Ok(())
}
