//! Chlodwig GTK — native GUI entry point.
//!
//! Stage C (MULTIWINDOW_TABS.md): main.rs is now an even thinner coordinator.
//! All per-window wiring (TabView, registry, close handler, persistence,
//! drag-out, focus, title-follow, initial tab attach) is owned by
//! [`tab::build_window`]. The same SSoT runs for:
//!   - the initial window built at startup,
//!   - any window restored from `window_state.json`,
//!   - the `app.new-window` (Cmd+N) menu action,
//!   - the `connect_create_window` drag-out callback.
//!
//! main.rs only does: app construction, logging setup, config resolution,
//! and the multi-window restore loop (which is just a `for` over
//! `AppWindowSet.windows` calling `build_window`).

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
    tracing::info!("Initial cwd: {}", initial_cwd.display());

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
    // Cmd+Q → quit the application (works even when zero windows are open).
    let quit_action = gtk4::gio::SimpleAction::new("quit", None);
    let app_for_quit = app.clone();
    quit_action.connect_activate(move |_, _| {
        app_for_quit.quit();
    });
    app.add_action(&quit_action);
    app.set_accels_for_action("app.quit", &["<Meta>q"]);

    #[cfg(target_os = "macos")]
    chlodwig_gtk::notification::request_notification_permission();

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

    // App-level multi-window registry — one entry per open window. Cloned
    // (cheap Rc) into every `BuildWindowContext`, every per-window
    // persistence handler, and every drag-out create_window callback.
    let app_registry: tab::AppWindowRegistry = Rc::new(RefCell::new(Vec::new()));

    let build_ctx = tab::BuildWindowContext {
        app: app.clone(),
        config: tab_config,
        app_registry: app_registry.clone(),
    };

    // Set up the menu bar ONCE per app (libadwaita serves one menubar
    // for all windows). Menu actions resolve the active window via
    // `app.active_window()` at activation time.
    menu::setup_menu(menu::MenuContext {
        app: app.clone(),
        app_registry: app_registry.clone(),
        build_ctx_template: tab::BuildWindowContext {
            app: app.clone(),
            config: build_ctx.config.clone(),
            app_registry: app_registry.clone(),
        },
        fallback_cwd: initial_cwd.clone(),
    });

    // ── Restore the persisted window set (Stage C) ────────────────────
    // If `window_state.json` exists with at least one non-empty window,
    // re-open every non-empty window via `build_window`. Empty windows
    // (an unlikely state — would only happen if persistence raced a
    // last-tab-close) are skipped silently. Otherwise fall back to
    // opening exactly one fresh window.
    let restored_any = match chlodwig_core::load_window_state() {
        Ok(Some(set)) => {
            let mut any = false;
            for ws in set.windows.into_iter() {
                if ws.tabs.is_empty() {
                    continue;
                }
                tab::build_window(&build_ctx, Some(ws), initial_cwd.clone());
                any = true;
            }
            any
        }
        Ok(None) => false,
        Err(e) => {
            tracing::warn!("Failed to load window_state: {e}");
            false
        }
    };

    if !restored_any {
        // Either no persisted state OR a `--resume` request without state.
        // Build one fresh window with one fresh tab.
        let win = tab::build_window(&build_ctx, None, initial_cwd.clone());

        // Legacy `--resume` path: load the latest single session into the
        // freshly-attached initial tab. Suppressed when multi-window
        // restore already happened.
        if resume_flag {
            // Find the lone tab in the just-built window via the app
            // registry's most recent entry → its tab_view → first page.
            let entry = app_registry.borrow().last().cloned();
            if let Some(entry) = entry {
                if entry.tab_view.n_pages() > 0 {
                    let page = entry.tab_view.nth_page(0);
                    if let Some(initial_tab) =
                        tab::ai_conversation::lookup_by_page(&page)
                    {
                        match chlodwig_core::load_latest_session() {
                            Ok(Some(snapshot)) => {
                                tracing::info!(
                                    "Resuming session with {} messages",
                                    snapshot.messages.len()
                                );
                                let cwd_name: Option<String> = {
                                    let n = initial_tab
                                        .app_state
                                        .borrow()
                                        .project_dir_name();
                                    if n.is_empty() { None } else { Some(n) }
                                };
                                let ctx = restore::RestoreContext {
                                    state: &initial_tab.app_state,
                                    output_view: &initial_tab.widgets.final_view,
                                    streaming_view: &initial_tab.widgets.streaming_view,
                                    output_scroll: &initial_tab.widgets.output_scroll,
                                    window: &win,
                                    viewport_cols: &initial_tab.viewport_cols,
                                    status_left: &initial_tab.widgets.status_left_label,
                                    status_right: &initial_tab.widgets.status_right_label,
                                    prompt_tx: &initial_tab.prompt_tx,
                                    cwd_name: cwd_name.as_deref(),
                                };
                                restore::apply_restored_session_to_ui(snapshot, &ctx);
                                initial_tab.refresh_tab_title();
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
                }
            }
        }
    }
}
