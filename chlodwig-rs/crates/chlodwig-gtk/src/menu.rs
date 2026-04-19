//! Native macOS / Linux menu bar setup.
//!
//! Extracted from `main.rs` (Stage 1 of the GTK main.rs refactor; see
//! `docs/gtk-main-refactoring.md`). The menu builds the File / Conversation /
//! Window menus and registers all `app.<name>` actions plus their Cmd-key
//! accelerators.
//!
//! Public entry point: [`setup_menu`]. `main.rs` calls it once during
//! `activate()` and never touches menu construction directly.
//!
//! This module lives inside the **binary** (not the lib), so it can refer to
//! `crate::BackgroundCommand` directly — same pattern as `restore.rs`.

use std::cell::{Cell, RefCell};
use std::rc::Rc;

use gtk4::prelude::*;
use gtk4::{gio, ApplicationWindow};
use tokio::sync::mpsc::UnboundedSender;

use chlodwig_gtk::app_state::AppState;
use chlodwig_gtk::{sessions_window, window};

use crate::{restore, BackgroundCommand};

/// Bundles all the captures the menu actions need.
///
/// Built once in `main.rs::activate` and consumed by [`setup_menu`].
/// Using a struct (instead of 8+ positional arguments) keeps the call site
/// readable and makes adding more actions a one-liner.
pub struct MenuContext {
    pub app: libadwaita::Application,
    pub window: ApplicationWindow,
    pub widgets: window::UiWidgets,
    pub app_state: Rc<RefCell<AppState>>,
    pub prompt_tx: UnboundedSender<BackgroundCommand>,
    pub viewport_cols: Rc<Cell<usize>>,
    pub session_started_at: String,
}

/// Build and install the native menu bar with all actions and accelerators.
///
/// Menus installed:
/// - **File**: New Conversation (Cmd+N), Quit
/// - **Conversation**: Compact History, Resume Last Session, Sessions…
/// - **Window**: Minimize (Cmd+M), Hide Chlodwig (Cmd+H), Show Chlodwig (Shift+Cmd+H)
///
/// The Quit action itself is registered in `main.rs` (Cmd+Q) before this
/// function is called — only the menu *entry* lives here.
pub fn setup_menu(ctx: MenuContext) {
    let MenuContext {
        app,
        window,
        widgets,
        app_state,
        prompt_tx,
        viewport_cols,
        session_started_at,
    } = ctx;

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

    // Window menu (macOS standard)
    let window_menu = gio::Menu::new();
    window_menu.append(Some("Minimize"), Some("app.minimize"));
    window_menu.append(Some("Hide Chlodwig"), Some("app.hide"));
    window_menu.append(Some("Show Chlodwig"), Some("app.show"));
    menubar.append_submenu(Some("Window"), &window_menu);

    app.set_menubar(Some(&menubar));

    // ── Actions ────────────────────────────────────────────────────

    // "New Conversation" action (Cmd+N)
    {
        let action = gio::SimpleAction::new("new-conversation", None);
        let prompt_tx = prompt_tx.clone();
        let state = app_state.clone();
        let output_view = widgets.final_view.clone();
        let status_left = widgets.status_left_label.clone();
        let status_right = widgets.status_right_label.clone();
        action.connect_activate(move |_, _| {
            {
                let mut state = state.borrow_mut();
                state.clear();
            }
            output_view.clear();
            let cwd_msg = state.borrow().startup_cwd_message();
            window::append_styled(&output_view, &format!("{cwd_msg}\n"), "system");
            let _ = prompt_tx.send(BackgroundCommand::ClearMessages);
            window::update_status(&status_left, &status_right, &state.borrow());
        });
        app.add_action(&action);
        app.set_accels_for_action("app.new-conversation", &["<Meta>n"]);
    }

    // "Compact" action
    {
        let action = gio::SimpleAction::new("compact", None);
        let prompt_tx = prompt_tx.clone();
        action.connect_activate(move |_, _| {
            let _ = prompt_tx.send(BackgroundCommand::Compact { instructions: None });
        });
        app.add_action(&action);
    }

    // "Resume" action — load latest saved session
    {
        let action = gio::SimpleAction::new("resume", None);
        let prompt_tx = prompt_tx.clone();
        action.connect_activate(move |_, _| {
            if let Ok(Some(snapshot)) = chlodwig_core::load_latest_session() {
                let _ = prompt_tx.send(BackgroundCommand::RestoreMessages {
                    messages: snapshot.messages,
                });
            }
        });
        app.add_action(&action);
    }

    // "Sessions…" action — opens the sessions browser window
    {
        let action = gio::SimpleAction::new("sessions-browser", None);
        let prompt_tx = prompt_tx.clone();
        let state = app_state.clone();
        let output_view = widgets.final_view.clone();
        let output_scroll = widgets.output_scroll.clone();
        let viewport_cols = viewport_cols.clone();
        let status_left = widgets.status_left_label.clone();
        let status_right = widgets.status_right_label.clone();
        let window_for_sessions = window.clone();
        let session_started_at = session_started_at.clone();
        action.connect_activate(move |_, _| {
            let prompt_tx = prompt_tx.clone();
            let state = state.clone();
            let output_view = output_view.clone();
            let output_scroll = output_scroll.clone();
            let viewport_cols = viewport_cols.clone();
            let status_left = status_left.clone();
            let status_right = status_right.clone();
            let window_for_resume = window_for_sessions.clone();
            let current_file =
                Some(chlodwig_core::session_filename_for(&session_started_at));
            sessions_window::show_sessions_window(
                &window_for_sessions,
                current_file,
                Box::new(move |path| match chlodwig_core::load_session_from(&path) {
                    Ok(snapshot) => {
                        let cwd_name: Option<String> = {
                            let n = state.borrow().project_dir_name();
                            if n.is_empty() { None } else { Some(n) }
                        };
                        let ctx = restore::RestoreContext {
                            state: &state,
                            output_view: &output_view,
                            output_scroll: &output_scroll,
                            window: &window_for_resume,
                            viewport_cols: &viewport_cols,
                            status_left: &status_left,
                            status_right: &status_right,
                            prompt_tx: &prompt_tx,
                            cwd_name: cwd_name.as_deref(),
                        };
                        restore::apply_restored_session_to_ui(snapshot, &ctx);
                    }
                    Err(e) => {
                        window::append_styled(
                            &output_view,
                            &format!("\n✗ Failed to load session: {e}\n"),
                            "error",
                        );
                    }
                }),
            );
        });
        app.add_action(&action);
    }

    // "Minimize" action (Cmd+M)
    {
        let action = gio::SimpleAction::new("minimize", None);
        let window_for_minimize = window.clone();
        action.connect_activate(move |_, _| {
            window_for_minimize.minimize();
        });
        app.add_action(&action);
        app.set_accels_for_action("app.minimize", &["<Meta>m"]);
    }

    // "Hide" action (Cmd+H) — macOS "Hide App"
    {
        let action = gio::SimpleAction::new("hide", None);
        let window_for_hide = window.clone();
        action.connect_activate(move |_, _| {
            window_for_hide.set_visible(false);
        });
        app.add_action(&action);
        app.set_accels_for_action("app.hide", &["<Meta>h"]);
    }

    // "Show" action (Shift+Cmd+H) — show after Hide
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
