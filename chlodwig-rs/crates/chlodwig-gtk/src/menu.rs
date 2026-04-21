//! Native macOS / Linux menu bar setup.
//!
//! Stage C (MULTIWINDOW_TABS.md): the menu is wired ONCE per app. Per-tab
//! and per-window actions resolve the active `WindowEntry` at activation
//! time via [`active_entry`]. Each `WindowEntry` carries the per-window
//! `tab_view`, `registry`, `config`, and `window` — sufficient input for
//! every menu action without any per-action capturing of widgets.
//!
//! Cmd+N is now bound to **New Window** (Stage C). The previous
//! "New Conversation" Cmd+N binding is removed; New Conversation is still
//! reachable from the File menu (and via `/clear` in the prompt).

use gtk4::prelude::*;
use gtk4::{gio, Window};

use chlodwig_gtk::{sessions_window, window};

use crate::tab::{
    self, ai_conversation::AiConversationTab, AppWindowRegistry, BackgroundCommand,
    BuildWindowContext, Tab, TabAttachContext, WindowEntry,
};

/// App-level references the menu actions need.
///
/// No per-window references are captured here — the menu is wired ONCE per
/// app and dispatches per action via [`active_entry`].
pub struct MenuContext {
    pub app: libadwaita::Application,
    pub app_registry: AppWindowRegistry,
    /// Template for `app.new-window`: cloned (cheap Rc) into the action
    /// closure so Cmd+N reproduces the same wiring as the initial window.
    pub build_ctx_template: BuildWindowContext,
    /// Default cwd for fresh windows when no active window is available.
    pub fallback_cwd: std::path::PathBuf,
}

/// Find the [`WindowEntry`] whose `window` matches the app's currently-active
/// `gtk4::Window`. Returns `None` when no window is active.
fn active_entry(
    app: &libadwaita::Application,
    app_registry: &AppWindowRegistry,
) -> Option<WindowEntry> {
    let active_window: Window = app.active_window()?;
    app_registry
        .borrow()
        .iter()
        .find(|e| e.window.clone().upcast::<Window>() == active_window)
        .cloned()
}

/// Build and install the native menu bar with all actions and accelerators.
pub fn setup_menu(ctx: MenuContext) {
    let MenuContext {
        app,
        app_registry,
        build_ctx_template,
        fallback_cwd,
    } = ctx;

    let menubar = gio::Menu::new();

    // File menu
    let file_menu = gio::Menu::new();
    file_menu.append(Some("New Window"), Some("app.new-window"));
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

    // ── Window actions ───────────────────────────────────────────────

    // "New Window" (Cmd+N) — build a fresh window via the SSoT.
    {
        let action = gio::SimpleAction::new("new-window", None);
        let app_for_new = app.clone();
        let app_registry_for_new = app_registry.clone();
        let template = build_ctx_template;
        let fallback_for_new = fallback_cwd.clone();
        action.connect_activate(move |_, _| {
            // Inherit cwd from the active tab when possible.
            let cwd = active_entry(&app_for_new, &app_registry_for_new)
                .and_then(|e| tab::active(&e.tab_view, &e.registry))
                .map(|t| t.cwd().to_path_buf())
                .unwrap_or_else(|| fallback_for_new.clone());
            tab::build_window(
                &BuildWindowContext {
                    app: template.app.clone(),
                    config: template.config.clone(),
                    app_registry: template.app_registry.clone(),
                },
                None,
                cwd,
            );
        });
        app.add_action(&action);
        app.set_accels_for_action("app.new-window", &["<Meta>n"]);
    }

    // ── Tab actions ───────────────────────────────────────────────────

    // "New Tab" (Cmd+T) — opens a fresh tab in the active window.
    {
        let action = gio::SimpleAction::new("new-tab", None);
        let app_for_new_tab = app.clone();
        let app_registry_for_new_tab = app_registry.clone();
        let fallback_for_new_tab = fallback_cwd.clone();
        action.connect_activate(move |_, _| {
            let Some(entry) = active_entry(&app_for_new_tab, &app_registry_for_new_tab)
            else {
                return;
            };
            let new_cwd = tab::active(&entry.tab_view, &entry.registry)
                .map(|t| t.cwd().to_path_buf())
                .unwrap_or_else(|| fallback_for_new_tab.clone());
            let attach_ctx = TabAttachContext {
                window: entry.window.clone(),
                tab_view: entry.tab_view.clone(),
                registry: entry.registry.clone(),
                config: entry.config.clone(),
            };
            AiConversationTab::attach_new(&attach_ctx, new_cwd);
        });
        app.add_action(&action);
        app.set_accels_for_action("app.new-tab", &["<Meta>t"]);
    }

    // "Close Tab" (Cmd+W) — closes the active tab in the active window.
    {
        let action = gio::SimpleAction::new("close-tab", None);
        let app_for_close = app.clone();
        let app_registry_for_close = app_registry.clone();
        action.connect_activate(move |_, _| {
            if let Some(entry) = active_entry(&app_for_close, &app_registry_for_close) {
                if let Some(page) = entry.tab_view.selected_page() {
                    entry.tab_view.close_page(&page);
                }
            }
        });
        app.add_action(&action);
        app.set_accels_for_action("app.close-tab", &["<Meta>w"]);
    }

    // ── Conversation actions (resolve active tab on activation) ───────

    // "New Conversation" — clears the active tab. No accelerator (Cmd+N
    // is now New Window).
    {
        let action = gio::SimpleAction::new("new-conversation", None);
        let app_for_clear = app.clone();
        let app_registry_for_clear = app_registry.clone();
        action.connect_activate(move |_, _| {
            let Some(entry) = active_entry(&app_for_clear, &app_registry_for_clear)
            else {
                return;
            };
            let Some(t) = tab::active_ai(&entry.tab_view, &entry.registry) else {
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
            t.refresh_tab_title();
        });
        app.add_action(&action);
    }

    // "Compact" — compacts the active tab.
    {
        let action = gio::SimpleAction::new("compact", None);
        let app_for_compact = app.clone();
        let app_registry_for_compact = app_registry.clone();
        action.connect_activate(move |_, _| {
            let Some(entry) =
                active_entry(&app_for_compact, &app_registry_for_compact)
            else {
                return;
            };
            if let Some(t) = tab::active_ai(&entry.tab_view, &entry.registry) {
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
        let app_for_resume = app.clone();
        let app_registry_for_resume = app_registry.clone();
        action.connect_activate(move |_, _| {
            let Some(entry) =
                active_entry(&app_for_resume, &app_registry_for_resume)
            else {
                return;
            };
            let Some(t) = tab::active_ai(&entry.tab_view, &entry.registry) else {
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

    // "Sessions…" — opens chosen session in a NEW tab in the active window.
    {
        let action = gio::SimpleAction::new("sessions-browser", None);
        let app_for_sessions = app.clone();
        let app_registry_for_sessions = app_registry.clone();
        let fallback_for_sessions = fallback_cwd.clone();
        action.connect_activate(move |_, _| {
            let Some(entry) =
                active_entry(&app_for_sessions, &app_registry_for_sessions)
            else {
                return;
            };

            let active = tab::active_ai(&entry.tab_view, &entry.registry);
            let current_file = active
                .as_ref()
                .map(|t| chlodwig_core::session_filename_for(&t.session_started_at));
            let new_tab_cwd = active
                .as_ref()
                .map(|t| t.cwd().to_path_buf())
                .unwrap_or_else(|| fallback_for_sessions.clone());

            let entry_for_resume = entry.clone();
            sessions_window::show_sessions_window(
                &entry.window,
                current_file,
                Box::new(move |path| match chlodwig_core::load_session_from(&path) {
                    Ok(snapshot) => {
                        let attach_ctx = TabAttachContext {
                            window: entry_for_resume.window.clone(),
                            tab_view: entry_for_resume.tab_view.clone(),
                            registry: entry_for_resume.registry.clone(),
                            config: entry_for_resume.config.clone(),
                        };
                        AiConversationTab::attach_with_session(
                            &attach_ctx,
                            new_tab_cwd.clone(),
                            snapshot,
                        );
                    }
                    Err(e) => {
                        if let Some(t) = tab::active_ai(
                            &entry_for_resume.tab_view,
                            &entry_for_resume.registry,
                        ) {
                            window::append_styled(
                                &t.widgets.final_view,
                                &format!("\n✗ Failed to load session: {e}\n"),
                                "error",
                            );
                        }
                    }
                }),
            );
        });
        app.add_action(&action);
    }

    // ── Window actions (macOS standard) ───────────────────────────────

    {
        let action = gio::SimpleAction::new("minimize", None);
        let app_for_minimize = app.clone();
        action.connect_activate(move |_, _| {
            if let Some(w) = app_for_minimize.active_window() {
                w.minimize();
            }
        });
        app.add_action(&action);
        app.set_accels_for_action("app.minimize", &["<Meta>m"]);
    }

    {
        let action = gio::SimpleAction::new("hide", None);
        let app_for_hide = app.clone();
        action.connect_activate(move |_, _| {
            if let Some(w) = app_for_hide.active_window() {
                w.set_visible(false);
            }
        });
        app.add_action(&action);
        app.set_accels_for_action("app.hide", &["<Meta>h"]);
    }

    {
        let action = gio::SimpleAction::new("show", None);
        let app_for_show = app.clone();
        action.connect_activate(move |_, _| {
            if let Some(w) = app_for_show.active_window() {
                w.set_visible(true);
                w.present();
            }
        });
        app.add_action(&action);
        app.set_accels_for_action("app.show", &["<Shift><Meta>h"]);
    }
}
