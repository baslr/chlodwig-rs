//! Chlodwig GTK — native GUI entry point.
//!
//! Stage B (MULTIWINDOW_TABS.md): main.rs is now a thin coordinator that
//! sets up the process (logging, fonts, GTK init, config), builds the
//! window shell with its `adw::TabView`, attaches the initial tab via
//! `tab::attach_new_tab`, wires the menu bar (which serves all tabs via
//! `tab::active`), the window-level Esc-Esc/focus/title-follows-active
//! handlers, and presents the window.
//!
//! Per-tab state, per-tab background tasks, per-tab handlers and the
//! `BackgroundCommand` enum all live in `tab.rs` — main.rs never touches
//! per-tab data directly. This keeps "open the first tab" and "Cmd+T new
//! tab" on a single code path (single-source-of-truth for tab creation).

use gtk4::prelude::*;
use gtk4::glib;
use std::cell::RefCell;
use std::rc::Rc;

mod render;
mod restore;
mod menu;
mod table_interactions;
mod submit;
mod event_dispatch;
mod tab;

fn main() -> glib::ExitCode {
    chlodwig_core::enrich_path();
    chlodwig_gtk::ensure_cairo_renderer();
    chlodwig_gtk::ensure_coretext_backend();

    // Initialize tracing FIRST so any subsequent setup error lands in the
    // debug log.
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

    match chlodwig_gtk::install_bundled_cjk_font() {
        Some(Ok(p)) => tracing::info!("CJK font installed: {}", p.display()),
        Some(Err(e)) => tracing::warn!(
            "CJK font install failed: {} (CJK in tables may misalign)", e
        ),
        None => tracing::info!("CJK font install skipped (no user font dir on this platform)"),
    }

    let resume_flag = std::env::args().any(|a| a == "--resume" || a == "-r");
    let initial_cwd = chlodwig_gtk::setup::resolve_initial_cwd();
    tracing::info!("Initial tab cwd: {}", initial_cwd.display());

    let app = libadwaita::Application::builder()
        .application_id("rs.chlodwig.gtk")
        .build();

    app.connect_activate(move |app| {
        activate(app, resume_flag, initial_cwd.clone());
    });

    app.run()
}

fn activate(
    app: &libadwaita::Application,
    resume_flag: bool,
    initial_cwd: std::path::PathBuf,
) {
    // Cmd+Q → quit application (window-independent so it works even with
    // zero tabs/windows open).
    let quit_action = gtk4::gio::SimpleAction::new("quit", None);
    let app_for_quit = app.clone();
    quit_action.connect_activate(move |_, _| {
        app_for_quit.quit();
    });
    app.add_action(&quit_action);
    app.set_accels_for_action("app.quit", &["<Meta>q"]);

    #[cfg(target_os = "macos")]
    chlodwig_gtk::notification::request_notification_permission();

    // Resolve config once; cloned into every new tab.
    let resolved_config = match chlodwig_core::resolve_config(
        chlodwig_core::ConfigOverrides::default(),
    ) {
        Ok(cfg) => cfg,
        Err(msg) => {
            eprintln!("Configuration error: {msg}");
            return;
        }
    };
    let tab_config = tab::TabConfig::from(resolved_config);

    // ── Window shell with adw::TabView host ───────────────────────────
    let initial_cwd_name = initial_cwd
        .file_name()
        .map(|n| n.to_string_lossy().into_owned());
    let initial_title = chlodwig_gtk::window::format_window_title(
        initial_cwd_name.as_deref(),
        None,
    );
    let (window, tab_view) = chlodwig_gtk::window::build_window_shell(app, &initial_title);

    // ── Tab registry: shared between menu actions, close handler,
    //    title-follow handler, and Esc-Esc handler ────────────────────
    let registry: tab::TabRegistry = Rc::new(RefCell::new(Vec::new()));

    // ── Menu bar (one per app, routes per-tab actions via registry) ──
    menu::setup_menu(menu::MenuContext {
        app: app.clone(),
        window: window.clone(),
        tab_view: tab_view.clone(),
        registry: registry.clone(),
        config: tab_config.clone(),
    });

    // ── Tab close handler: clean up registry, close window when empty ─
    tab::wire_tab_view_close_handler(&tab_view, &registry, &window);

    // ── Initial tab ──────────────────────────────────────────────────
    let attach_ctx = tab::TabAttachContext {
        window: window.clone(),
        tab_view: tab_view.clone(),
        registry: registry.clone(),
        config: tab_config,
    };
    let initial_page = tab::attach_new_tab(&attach_ctx, initial_cwd);

    // ── Resume into the initial tab if --resume was passed ────────────
    if resume_flag {
        let initial_tab = registry
            .borrow()
            .iter()
            .find(|(p, _)| p == &initial_page)
            .map(|(_, ctx)| ctx.clone())
            .expect("initial tab just attached → must be in registry");
        match chlodwig_core::load_latest_session() {
            Ok(Some(snapshot)) => {
                tracing::info!(
                    "Resuming session with {} messages",
                    snapshot.messages.len()
                );
                let cwd_name: Option<String> = {
                    let n = initial_tab.app_state.borrow().project_dir_name();
                    if n.is_empty() { None } else { Some(n) }
                };
                let ctx = restore::RestoreContext {
                    state: &initial_tab.app_state,
                    output_view: &initial_tab.widgets.final_view,
                    streaming_view: &initial_tab.widgets.streaming_view,
                    output_scroll: &initial_tab.widgets.output_scroll,
                    window: &window,
                    viewport_cols: &initial_tab.viewport_cols,
                    status_left: &initial_tab.widgets.status_left_label,
                    status_right: &initial_tab.widgets.status_right_label,
                    prompt_tx: &initial_tab.prompt_tx,
                    cwd_name: cwd_name.as_deref(),
                };
                restore::apply_restored_session_to_ui(snapshot, &ctx);
            }
            Ok(None) => {
                chlodwig_gtk::window::append_styled(
                    &initial_tab.widgets.final_view,
                    "No saved session found — starting fresh.\n",
                    "system",
                );
            }
            Err(e) => {
                chlodwig_gtk::window::append_styled(
                    &initial_tab.widgets.final_view,
                    &format!("Failed to load session: {e}\n"),
                    "error",
                );
            }
        }
    }

    // ── Window title follows the active tab ───────────────────────────
    {
        let registry_for_title = registry.clone();
        let window_for_title = window.clone();
        tab_view.connect_selected_page_notify(move |tv| {
            let Some(page) = tv.selected_page() else { return };
            let reg = registry_for_title.borrow();
            let Some((_, t)) = reg.iter().find(|(p, _)| p == &page) else { return };
            let cwd_name = t.cwd
                .file_name()
                .map(|n| n.to_string_lossy().into_owned());
            let session_name = t.app_state.borrow().session_name.clone();
            let title = chlodwig_gtk::window::format_window_title(
                cwd_name.as_deref(),
                session_name.as_deref(),
            );
            window_for_title.set_title(Some(&title));
        });
    }

    // ── Re-focus the active tab's input on window activation ──────────
    {
        let tab_view_for_focus = tab_view.clone();
        let registry_for_focus = registry.clone();
        window.connect_is_active_notify(move |w| {
            if !w.is_active() { return }
            if let Some(t) = tab::active(&tab_view_for_focus, &registry_for_focus) {
                t.widgets.input_view.grab_focus();
            }
        });
    }

    window.present();
}
