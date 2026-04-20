//! Native macOS / Linux menu bar setup.
//!
//! Stage B (MULTIWINDOW_TABS.md): all per-tab actions resolve "the active
//! tab" via `tab::active(tab_view, registry)` at activation time, instead
//! of capturing per-tab widgets/state at menu-build time. This is what
//! makes a single menu bar correctly route Cmd+N / Cmd+T / Cmd+W /
//! Compact / Resume / Sessions to whatever tab the user is currently
//! looking at.
//!
//! `MenuContext` therefore carries only window-/app-/tab-view-level
//! references. The `widgets`/`app_state`/`prompt_tx`/`viewport_cols`/
//! `session_started_at` fields it had in Stage A are gone — those
//! become per-action lookups via the registry.
//!
//! New actions vs. Stage A:
//!   - `app.new-tab` (Cmd+T)
//!   - `app.close-tab` (Cmd+W)
//!
//! This module lives inside the **binary** (not the lib), so it can refer to
//! `crate::tab::BackgroundCommand` directly — same pattern as `restore.rs`.

use gtk4::prelude::*;
use gtk4::{gio, ApplicationWindow};

use chlodwig_gtk::{sessions_window, window};

use crate::restore;
use crate::tab::{
    self, ai_conversation::AiConversationTab, BackgroundCommand, TabAttachContext,
    TabConfig, TabRegistry,
};

/// Window-level references the menu actions need.
///
/// Per-tab data is NOT captured here (that would force one menu bar per
/// tab); actions look up the active tab on demand via `tab::active`.
pub struct MenuContext {
    pub app: libadwaita::Application,
    pub window: ApplicationWindow,
    pub tab_view: libadwaita::TabView,
    pub registry: TabRegistry,
    /// Resolved configuration cloned into every new tab spawned via
    /// `app.new-tab`. Mirrors `TabAttachContext.config`.
    pub config: TabConfig,
}

/// Build and install the native menu bar with all actions and accelerators.
pub fn setup_menu(ctx: MenuContext) {
    let MenuContext {
        app,
        window,
        tab_view,
        registry,
        config,
    } = ctx;

    let menubar = gio::Menu::new();

    // File menu
    let file_menu = gio::Menu::new();
    file_menu.append(Some("New Tab"), Some("app.new-tab"));
    file_menu.append(Some("New Conversation"), Some("app.new-conversation"));
    file_menu.append(Some("Close Tab"), Some("app.close-tab"));
    file_menu.append(Some("Quit"), Some("app.quit"));
    menubar.append_submenu(Some("File"), &file_menu);

    // Conversation menu
    let conv_menu = gio::Menu::new();
    conv_menu.append(Some("Compact History"), Some("app.compact"));
    conv_menu.append(Some("Resume Last Session"), Some("app.resume"));
    conv_menu.append(Some("Sessions…"), Some("app.sessions-browser"));
    menubar.append_submenu(Some("Conversation"), &conv_menu);

    // Window menu (macOS standard)
    let window_menu = gio::Menu::new();
    window_menu.append(Some("Minimize"), Some("app.minimize"));
    window_menu.append(Some("Hide Chlodwig"), Some("app.hide"));
    window_menu.append(Some("Show Chlodwig"), Some("app.show"));
    menubar.append_submenu(Some("Window"), &window_menu);

    app.set_menubar(Some(&menubar));

    // ── Tab actions ───────────────────────────────────────────────────

    // "New Tab" (Cmd+T) — opens a fresh tab in the current window with
    // the same cwd as the currently-active tab (or process cwd if none).
    {
        let action = gio::SimpleAction::new("new-tab", None);
        let window_for_new_tab = window.clone();
        let tab_view_for_new_tab = tab_view.clone();
        let registry_for_new_tab = registry.clone();
        let config_for_new_tab = config.clone();
        action.connect_activate(move |_, _| {
            // Cmd+T defaults to opening a new AI-conversation tab.
            // Inherit cwd from the active tab (any kind), or fall back to
            // the process cwd when there are no tabs.
            let new_cwd = tab::active(&tab_view_for_new_tab, &registry_for_new_tab)
                .map(|t| t.cwd().to_path_buf())
                .unwrap_or_else(|| {
                    std::env::current_dir().unwrap_or_else(|_| "/".into())
                });
            let attach_ctx = TabAttachContext {
                window: window_for_new_tab.clone(),
                tab_view: tab_view_for_new_tab.clone(),
                registry: registry_for_new_tab.clone(),
                config: config_for_new_tab.clone(),
            };
            AiConversationTab::attach_new(&attach_ctx, new_cwd);
        });
        app.add_action(&action);
        app.set_accels_for_action("app.new-tab", &["<Meta>t"]);
    }

    // "Close Tab" (Cmd+W) — sends a close request to the TabView; the
    // close handler installed by `tab::wire_tab_view_close_handler`
    // does the registry cleanup and window-empty check.
    {
        let action = gio::SimpleAction::new("close-tab", None);
        let tab_view_for_close = tab_view.clone();
        action.connect_activate(move |_, _| {
            if let Some(page) = tab_view_for_close.selected_page() {
                tab_view_for_close.close_page(&page);
            }
        });
        app.add_action(&action);
        app.set_accels_for_action("app.close-tab", &["<Meta>w"]);
    }

    // ── Conversation actions (resolve active tab on activation) ───────

    // "New Conversation" (Cmd+N) — clears the *active* tab.
    {
        let action = gio::SimpleAction::new("new-conversation", None);
        let tab_view_for_clear = tab_view.clone();
        let registry_for_clear = registry.clone();
        action.connect_activate(move |_, _| {
            let Some(t) = tab::active_ai(&tab_view_for_clear, &registry_for_clear) else {
                return;
            };
            t.app_state.borrow_mut().clear();
            t.widgets.final_view.clear();
            let cwd_msg = t.app_state.borrow().startup_cwd_message();
            window::append_styled(
                &t.widgets.final_view,
                &format!("{cwd_msg}\n"),
                "system",
            );
            let _ = t.prompt_tx.send(BackgroundCommand::ClearMessages);
            window::update_status(
                &t.widgets.status_left_label,
                &t.widgets.status_right_label,
                &t.app_state.borrow(),
            );
            // Refresh tab title — clear() reset session_name to None.
            t.refresh_tab_title();
        });
        app.add_action(&action);
        app.set_accels_for_action("app.new-conversation", &["<Meta>n"]);
    }

    // "Compact" — compacts the active tab.
    {
        let action = gio::SimpleAction::new("compact", None);
        let tab_view_for_compact = tab_view.clone();
        let registry_for_compact = registry.clone();
        action.connect_activate(move |_, _| {
            if let Some(t) = tab::active_ai(&tab_view_for_compact, &registry_for_compact)
            {
                let _ = t.prompt_tx.send(BackgroundCommand::Compact {
                    instructions: None,
                });
            }
        });
        app.add_action(&action);
    }

    // "Resume" — load latest saved session into the active tab.
    {
        let action = gio::SimpleAction::new("resume", None);
        let tab_view_for_resume = tab_view.clone();
        let registry_for_resume = registry.clone();
        action.connect_activate(move |_, _| {
            let Some(t) = tab::active_ai(&tab_view_for_resume, &registry_for_resume)
            else {
                return;
            };
            if let Ok(Some(snapshot)) = chlodwig_core::load_latest_session() {
                let _ = t.prompt_tx.send(BackgroundCommand::RestoreMessages {
                    messages: snapshot.messages,
                });
            }
        });
        app.add_action(&action);
    }

    // "Sessions…" — opens the sessions browser; on selection, restores
    // into the active tab.
    {
        let action = gio::SimpleAction::new("sessions-browser", None);
        let tab_view_for_sessions = tab_view.clone();
        let registry_for_sessions = registry.clone();
        let window_for_sessions = window.clone();
        action.connect_activate(move |_, _| {
            let Some(t) =
                tab::active_ai(&tab_view_for_sessions, &registry_for_sessions)
            else {
                return;
            };
            let current_file =
                Some(chlodwig_core::session_filename_for(&t.session_started_at));
            let t_for_browser = t.clone();
            let window_for_resume = window_for_sessions.clone();
            sessions_window::show_sessions_window(
                &window_for_sessions,
                current_file,
                Box::new(move |path| match chlodwig_core::load_session_from(&path) {
                    Ok(snapshot) => {
                        let cwd_name: Option<String> = {
                            let n = t_for_browser.app_state.borrow().project_dir_name();
                            if n.is_empty() {
                                None
                            } else {
                                Some(n)
                            }
                        };
                        let ctx = restore::RestoreContext {
                            state: &t_for_browser.app_state,
                            output_view: &t_for_browser.widgets.final_view,
                            streaming_view: &t_for_browser.widgets.streaming_view,
                            output_scroll: &t_for_browser.widgets.output_scroll,
                            window: &window_for_resume,
                            viewport_cols: &t_for_browser.viewport_cols,
                            status_left: &t_for_browser.widgets.status_left_label,
                            status_right: &t_for_browser.widgets.status_right_label,
                            prompt_tx: &t_for_browser.prompt_tx,
                            cwd_name: cwd_name.as_deref(),
                        };
                        restore::apply_restored_session_to_ui(snapshot, &ctx);
                        // Refresh tab title — restore may have set a
                        // session_name (or cleared it).
                        t_for_browser.refresh_tab_title();
                    }
                    Err(e) => {
                        window::append_styled(
                            &t_for_browser.widgets.final_view,
                            &format!("\n✗ Failed to load session: {e}\n"),
                            "error",
                        );
                    }
                }),
            );
        });
        app.add_action(&action);
    }

    // ── Window actions (macOS standard) ───────────────────────────────

    {
        let action = gio::SimpleAction::new("minimize", None);
        let window_for_minimize = window.clone();
        action.connect_activate(move |_, _| {
            window_for_minimize.minimize();
        });
        app.add_action(&action);
        app.set_accels_for_action("app.minimize", &["<Meta>m"]);
    }

    {
        let action = gio::SimpleAction::new("hide", None);
        let window_for_hide = window.clone();
        action.connect_activate(move |_, _| {
            window_for_hide.set_visible(false);
        });
        app.add_action(&action);
        app.set_accels_for_action("app.hide", &["<Meta>h"]);
    }

    {
        let action = gio::SimpleAction::new("show", None);
        let window_for_show = window.clone();
        action.connect_activate(move |_, _| {
            window_for_show.set_visible(true);
            window_for_show.present();
        });
        app.add_action(&action);
        app.set_accels_for_action("app.show", &["<Shift><Meta>h"]);
    }
}
