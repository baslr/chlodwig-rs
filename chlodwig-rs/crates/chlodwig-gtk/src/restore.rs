//! Shared "restore session into the live UI" flow.
//!
//! Three call sites in `main.rs` used to duplicate ~40 lines each:
//!   - `--resume` CLI flag at startup
//!   - `/resume` slash command
//!   - Resume button in the sessions browser
//!
//! All three go through `apply_restored_session_to_ui()`. The pure
//! AppState mutation lives in `AppState::apply_session_snapshot()` (in
//! `app_state.rs`) and is unit-tested. This module owns the GTK widget
//! plumbing (clear view, set title, render blocks, send to background
//! task, update status line, scroll).

use std::cell::{Cell, RefCell};
use std::rc::Rc;

use chlodwig_core::SessionSnapshot;
use chlodwig_gtk::app_state::AppState;
use chlodwig_gtk::emoji_overlay::EmojiTextView;
use chlodwig_gtk::window;
use gtk4::prelude::*;
use tokio::sync::mpsc::UnboundedSender;

use crate::{render, BackgroundCommand};

/// Bag of widgets and channels needed to restore a session into the live UI.
pub struct RestoreContext<'a> {
    pub state: &'a Rc<RefCell<AppState>>,
    pub output_view: &'a EmojiTextView,
    pub output_scroll: &'a gtk4::ScrolledWindow,
    pub window: &'a gtk4::ApplicationWindow,
    pub viewport_cols: &'a Rc<Cell<usize>>,
    pub status_left: &'a gtk4::Label,
    pub status_right: &'a gtk4::Label,
    pub prompt_tx: &'a UnboundedSender<BackgroundCommand>,
    /// Current working directory's basename, used in the window title.
    /// `None` if cwd lookup failed.
    pub cwd_name: Option<&'a str>,
}

/// Restore a `SessionSnapshot` into the live GTK UI.
pub fn apply_restored_session_to_ui(snapshot: SessionSnapshot, ctx: &RestoreContext<'_>) {
    let msg_count = snapshot.messages.len();
    let saved_at = snapshot.saved_at.clone();
    let restored_name = snapshot.name.clone();

    // 1. Clear view (incl. emoji overlays).
    clear_output_view(ctx.output_view);

    // 2. Apply snapshot to AppState.
    ctx.state.borrow_mut().apply_session_snapshot(&snapshot);

    // 3. Update window title.
    let restored_title = window::format_window_title(ctx.cwd_name, restored_name.as_deref());
    ctx.window.set_title(Some(&restored_title));

    // 4. Refresh viewport column count from the current widget allocation
    //    so the upcoming render uses the right table width.
    ctx.viewport_cols.set(chlodwig_gtk::viewport::viewport_columns(
        ctx.output_view.upcast_ref::<gtk4::TextView>(),
    ));

    // 5. Render the restored blocks.
    render::render_all_blocks_into(
        ctx.output_view,
        &ctx.state.borrow(),
        ctx.viewport_cols.get(),
        false,
    );

    // 6. Confirmation line.
    window::append_styled(
        ctx.output_view,
        &format!("✓ Resumed session ({msg_count} messages, saved at {saved_at})\n"),
        "system",
    );

    // 7. Push messages to the background ConversationState.
    let _ = ctx.prompt_tx.send(BackgroundCommand::RestoreMessages {
        messages: snapshot.messages,
    });

    // 8. Status + scroll.
    window::update_status(ctx.status_left, ctx.status_right, &ctx.state.borrow());
    window::scroll_to_bottom(ctx.output_scroll);
}

/// Wipe the view and any emoji-overlay entries registered on it.
pub fn clear_output_view(view: &EmojiTextView) {
    view.clear_overlays_from(0);
    let buf = view.buffer();
    let mut s = buf.start_iter();
    let mut e = buf.end_iter();
    buf.delete(&mut s, &mut e);
}
