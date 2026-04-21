//! GTK4 window setup and widget construction.
//!
//! This module builds the main application window with:
//! - A scrollable chat output (EmojiTextView, read-only, selectable)
//! - A text input area (GtkTextView, editable)
//! - A send button
//! - A status bar showing model, tokens, request count

use gtk4::prelude::*;
use gtk4::{
    ApplicationWindow, Box as GtkBox, Button, Label, Orientation, PolicyType,
    ScrolledWindow, Separator, TextView, WrapMode,
};
use gtk4::gio;

use crate::app_state::AppState;
use crate::emoji;
use crate::emoji_overlay::EmojiTextView;

const BUILD_TIME: &str = env!("BUILD_TIME");

/// Set up macOS-standard keyboard shortcuts on a `TextView`:
/// Cmd+C/V/X/A, Cmd+Backspace (delete to line start), Cmd+Left/Right (line start/end),
/// Cmd+Up/Down (document start/end), Option+Left/Right (word left/right),
/// Option+Backspace (delete word back).
///
/// `copy_priority` is the ordered list of *additional* `TextView`s to
/// consult for an active selection BEFORE falling back to `view` for
/// Cmd+C / Cmd+X. The first view in the list with `has_selection() == true`
/// wins. This is the workaround for Gotcha #45: the read-only output
/// views set `can_focus(false)` (so they cannot receive key events), but
/// the user still expects Cmd+C to copy a selection they made there.
/// The AI conversation tab passes `[final_view, streaming_view]`; the
/// user-question dialog (which has no separate output view) passes `&[]`.
///
/// This is the **single** Cmd+C / Cmd+X / Cmd+V handler — no parallel
/// implementation may live elsewhere.
///
/// This is used for both the main prompt input and the UserQuestion dialog input.
pub fn setup_macos_input_shortcuts(view: &TextView, copy_priority: &[TextView]) {
    let view_for_key = view.clone();
    let copy_priority: Vec<TextView> = copy_priority.to_vec();
    let key_ctrl = gtk4::EventControllerKey::new();
    key_ctrl.connect_key_pressed(move |_, key, _keycode, modifiers| {
        // Helper: snapshot the parent ScrolledWindow's vadjustment value
        // BEFORE an edit, then restore it AFTER (clamped to the new
        // [0, upper - page_size] range). Without this, two GTK behaviors
        // conspire to snap the input viewport to its first line:
        //   (1) `buf.delete(...)` may shrink `upper`, causing
        //       GtkAdjustment to auto-clamp `value` downward.
        //   (2) GtkTextView calls `scroll_mark_onscreen(insert_mark)`
        //       when the cursor moves; if the new cursor sits far above
        //       the previous viewport (e.g. word-back delete jumps to
        //       the start of a long line), the input scrolls up.
        // We snapshot before, then re-pin via an idle (after layout) so
        // GTK's post-edit scroll-to-cursor cannot win the race.
        fn parent_scroll(view: &TextView) -> Option<ScrolledWindow> {
            let mut node: Option<gtk4::Widget> = view.parent();
            while let Some(w) = node {
                if let Ok(sw) = w.clone().downcast::<ScrolledWindow>() {
                    return Some(sw);
                }
                node = w.parent();
            }
            None
        }
        fn snapshot_and_restore_input_scroll<F: FnOnce()>(view: &TextView, edit: F) {
            let sw = parent_scroll(view);
            let saved = sw.as_ref().map(|s| s.vadjustment().value());
            edit();
            if let (Some(sw), Some(saved)) = (sw, saved) {
                let sw_idle = sw.clone();
                gtk4::glib::idle_add_local_once(move || {
                    let adj = sw_idle.vadjustment();
                    let max = (adj.upper() - adj.page_size()).max(0.0);
                    let target = saved.clamp(0.0, max);
                    if (adj.value() - target).abs() > 0.5 {
                        adj.set_value(target);
                    }
                });
            }
        }
        let is_cmd = modifiers.contains(gtk4::gdk::ModifierType::META_MASK)
            || modifiers.contains(gtk4::gdk::ModifierType::CONTROL_MASK);

        if is_cmd {
            match key {
                k if k == gtk4::gdk::Key::v || k == gtk4::gdk::Key::V => {
                    // Bridge: GTK4 on macOS uses GdkClipboard which is NOT
                    // synced with NSPasteboard. Read the system clipboard
                    // first; on macOS this catches text copied from native
                    // apps (Safari, TextEdit, …). On Linux read_string()
                    // is a no-op and we fall through to GdkClipboard.
                    if let Some(text) = crate::macos_clipboard::read_string() {
                        let buf = view_for_key.buffer();
                        if buf.has_selection() {
                            if let Some((mut s, mut e)) = buf.selection_bounds() {
                                buf.delete(&mut s, &mut e);
                            }
                        }
                        buf.insert_at_cursor(&text);
                    } else {
                        view_for_key.emit_paste_clipboard();
                    }
                    return gtk4::glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::c || k == gtk4::gdk::Key::C => {
                    // Pick the first view in `copy_priority` that has a
                    // selection (output views, in user-visible top-down
                    // order); fall back to the focused input view. This
                    // makes Cmd+C work on the read-only output views
                    // even though they are non-focusable (Gotcha #45).
                    //
                    // ORDER MATTERS: emit GTK's copy-clipboard signal
                    // FIRST so its default handler (GdkMacosClipboard)
                    // writes its provider-backed item to NSPasteboard,
                    // THEN overwrite with our clean plain-text entry
                    // via the single bridge `write_selection_to_macos_clipboard`.
                    // Reversing this order lets GTK's default handler
                    // wipe our entry and external apps (Spotlight,
                    // TextEdit, Safari) paste nothing. See Gotcha #53.
                    let source = copy_priority
                        .iter()
                        .find(|v| v.buffer().has_selection())
                        .cloned()
                        .unwrap_or_else(|| view_for_key.clone());
                    source.emit_copy_clipboard();
                    write_selection_to_macos_clipboard(&source);
                    return gtk4::glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::x || k == gtk4::gdk::Key::X => {
                    // Same priority + ordering logic as Cmd+C. Cut on a
                    // read-only output view degrades to Copy (emit_cut
                    // on a non-editable buffer is a copy).
                    let source = copy_priority
                        .iter()
                        .find(|v| v.buffer().has_selection())
                        .cloned()
                        .unwrap_or_else(|| view_for_key.clone());
                    source.emit_cut_clipboard();
                    write_selection_to_macos_clipboard(&source);
                    return gtk4::glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::a || k == gtk4::gdk::Key::A => {
                    let buf = view_for_key.buffer();
                    buf.select_range(&buf.start_iter(), &buf.end_iter());
                    return gtk4::glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::BackSpace => {
                    // Local edit (not buf.set_text!) so the input
                    // ScrolledWindow does not jump to the first line
                    // (issue #30). set_text replaces the whole buffer
                    // and resets the insert mark + viewport offset.
                    let buf = view_for_key.buffer();
                    let text = buf.text(&buf.start_iter(), &buf.end_iter(), false).to_string();
                    let cursor = buf.cursor_position() as usize;
                    let line_start = crate::app_state::line_start_pos(&text, cursor);
                    if line_start < cursor {
                        snapshot_and_restore_input_scroll(&view_for_key, || {
                            let mut start_iter = buf.iter_at_offset(line_start as i32);
                            let mut end_iter = buf.iter_at_offset(cursor as i32);
                            buf.delete(&mut start_iter, &mut end_iter);
                        });
                    }
                    return gtk4::glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::Left => {
                    let buf = view_for_key.buffer();
                    let text = buf.text(&buf.start_iter(), &buf.end_iter(), false).to_string();
                    let cursor = buf.cursor_position() as usize;
                    let new_pos = crate::app_state::line_start_pos(&text, cursor);
                    let iter = buf.iter_at_offset(new_pos as i32);
                    buf.place_cursor(&iter);
                    return gtk4::glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::Right => {
                    let buf = view_for_key.buffer();
                    let text = buf.text(&buf.start_iter(), &buf.end_iter(), false).to_string();
                    let cursor = buf.cursor_position() as usize;
                    let new_pos = crate::app_state::line_end_pos(&text, cursor);
                    let iter = buf.iter_at_offset(new_pos as i32);
                    buf.place_cursor(&iter);
                    return gtk4::glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::Up => {
                    let buf = view_for_key.buffer();
                    buf.place_cursor(&buf.start_iter());
                    return gtk4::glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::Down => {
                    let buf = view_for_key.buffer();
                    buf.place_cursor(&buf.end_iter());
                    return gtk4::glib::Propagation::Stop;
                }
                _ => {}
            }
        }

        let is_alt = modifiers.contains(gtk4::gdk::ModifierType::ALT_MASK);
        if is_alt {
            match key {
                k if k == gtk4::gdk::Key::Left => {
                    let buf = view_for_key.buffer();
                    let text = buf.text(&buf.start_iter(), &buf.end_iter(), false).to_string();
                    let cursor = buf.cursor_position() as usize;
                    let new_pos = crate::app_state::word_left_pos(&text, cursor);
                    let iter = buf.iter_at_offset(new_pos as i32);
                    buf.place_cursor(&iter);
                    return gtk4::glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::Right => {
                    let buf = view_for_key.buffer();
                    let text = buf.text(&buf.start_iter(), &buf.end_iter(), false).to_string();
                    let cursor = buf.cursor_position() as usize;
                    let new_pos = crate::app_state::word_right_pos(&text, cursor);
                    let iter = buf.iter_at_offset(new_pos as i32);
                    buf.place_cursor(&iter);
                    return gtk4::glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::BackSpace => {
                    // Local edit (not buf.set_text!) so the input
                    // ScrolledWindow does not jump to the first line
                    // (issue #30). Same fix as Cmd+Backspace above.
                    let buf = view_for_key.buffer();
                    let text = buf.text(&buf.start_iter(), &buf.end_iter(), false).to_string();
                    let cursor = buf.cursor_position() as usize;
                    let word_start = crate::app_state::word_left_pos(&text, cursor);
                    if word_start < cursor {
                        snapshot_and_restore_input_scroll(&view_for_key, || {
                            let mut start_iter = buf.iter_at_offset(word_start as i32);
                            let mut end_iter = buf.iter_at_offset(cursor as i32);
                            buf.delete(&mut start_iter, &mut end_iter);
                        });
                    }
                    return gtk4::glib::Propagation::Stop;
                }
                _ => {}
            }
        }

        gtk4::glib::Propagation::Proceed
    });
    view.add_controller(key_ctrl);
}
const BUILD_ID: &str = env!("BUILD_ID");

// Thread-local emoji cache for CoreText-rendered emoji bitmaps.
// Shared across all insert calls within the GTK main loop.
thread_local! {
    static EMOJI_CACHE: std::cell::RefCell<emoji::EmojiCache> =
        std::cell::RefCell::new(emoji::EmojiCache::new());
    /// Font size (in points) used for rendering emoji bitmaps.
    /// Set once from the output TextView's Pango font description.
    /// Default 13.0 matches GTK4/Adwaita default body text size.
    static EMOJI_FONT_SIZE: std::cell::Cell<f64> = const { std::cell::Cell::new(13.0) };
}

/// Holds references to all important widgets so we can update them.
#[derive(Clone)]
pub struct UiWidgets {
    /// Append-only history view: every completed `DisplayBlock` is rendered
    /// here. Resize/restore/toggle re-renders this from `state.blocks`.
    pub final_view: EmojiTextView,
    pub final_buffer: gtk4::TextBuffer,
    /// Live-streaming view: shows `state.streaming_buffer` while the
    /// assistant is responding. Hidden when empty. On `TextComplete` the
    /// streaming text becomes a final block (appended to `final_view`),
    /// then this view is cleared and hidden.
    pub streaming_view: EmojiTextView,
    pub streaming_buffer_widget: gtk4::TextBuffer,
    /// The single `ScrolledWindow` containing the vertical box that stacks
    /// `final_view` above `streaming_view`. Scroll-to-bottom drives this.
    pub output_scroll: ScrolledWindow,
    /// Bottom spacer: empty Box below final_view + streaming_view that
    /// keeps `upper >= page_size + content_height` so GtkAdjustment
    /// never clamps `value` during the streaming→final transition.
    /// Height is updated dynamically on viewport resize.
    pub output_bottom_spacer: GtkBox,
    pub input_view: TextView,
    pub input_buffer: gtk4::TextBuffer,
    /// `ScrolledWindow` wrapping `input_view`. Lifted out of `build_tab_content`
    /// (where the widget is constructed) so the **window-level** input-height
    /// cap (issue #26: cap = window_height / 2) can be wired by `build_window`
    /// without a bespoke accessor — the cap is per-window state, not per-tab.
    pub input_scroll: ScrolledWindow,
    pub send_button: Button,
    pub toggle_tool_button: Button,
    pub status_left_label: Label,
    pub status_right_label: Label,
}

/// One tab's worth of widgets — the per-tab unit that Stage B
/// (`adw::TabView`) will multiplex inside a single window.
///
/// Holds the vertical `GtkBox` (`root`) that stacks output, input, and
/// status bar; the per-tab `UiWidgets` references; and the tab's working
/// directory. Created by [`build_tab_content`]. Today (Stage A) exactly
/// one `TabContent` is placed directly inside an `ApplicationWindow`;
/// from Stage B onwards, multiple tabs will live in a `TabView`.
pub struct TabContent {
    /// Top-level widget for this tab (vertical box). Goes either directly
    /// into `ApplicationWindow.set_child` (Stage A) or into a tab page
    /// inside `adw::TabView` (Stage B+).
    pub root: GtkBox,
    pub widgets: UiWidgets,
    pub cwd: std::path::PathBuf,
}

/// Format the window title.
///
/// Layout: `<name> ・ <cwd> ・ Chlodwig` (specific → generic, macOS convention).
/// Uses the Katakana middle dot `・` (U+30FB) as separator.
/// If `name` is `None`, omits the leading segment.
/// If `cwd` is `None`, omits that segment.
pub fn format_window_title(cwd: Option<&str>, name: Option<&str>) -> String {
    let mut parts: Vec<&str> = Vec::with_capacity(3);
    if let Some(n) = name {
        if !n.is_empty() {
            parts.push(n);
        }
    }
    if let Some(c) = cwd {
        if !c.is_empty() {
            parts.push(c);
        }
    }
    parts.push("Chlodwig");
    parts.join(" \u{30FB} ")
}

/// Format the `adw::TabPage` title for an AI-conversation tab.
///
/// Layout:
///   - With session name:  `🤖 {session_name} ・ {cwd_basename}`
///   - Without name:       `🤖 {cwd_basename}`
///   - Without cwd:        `🤖 {session_name}`
///   - Neither:            `🤖`
///
/// The robot emoji is the visual marker for the AI tab kind. Future tab
/// kinds (Browser, Terminal, File-viewer, Image-viewer) get their own
/// emoji prefix from their own format helper. Empty strings are treated
/// as `None` so callers don't need to filter.
///
/// Uses the same `・` (U+30FB) separator as `format_window_title`.
pub fn format_tab_title(session_name: Option<&str>, cwd_basename: Option<&str>) -> String {
    let name = session_name.filter(|s| !s.is_empty());
    let cwd = cwd_basename.filter(|s| !s.is_empty());
    match (name, cwd) {
        (Some(n), Some(c)) => format!("🤖 {n} \u{30FB} {c}"),
        (Some(n), None) => format!("🤖 {n}"),
        (None, Some(c)) => format!("🤖 {c}"),
        (None, None) => "🤖".to_string(),
    }
}

/// Build the empty window shell with its `adw::TabView` host
/// (Stage B of MULTIWINDOW_TABS.md).
///
/// Creates a fresh `ApplicationWindow` with the given title, loads the
/// application CSS, and assembles the multi-tab host:
///
/// ```text
///   ApplicationWindow
///   └── GtkBox (vertical)
///       ├── adw::TabBar     (set_view = the TabView below)
///       └── adw::TabView    (empty, returned for tabs to .append() into)
/// ```
///
/// Returns `(window, tab_view)`. Per-tab widget construction belongs to
/// [`build_tab_content`] (Gotchas #37/#39/#40/#43 — single-source-of-truth).
/// Per-tab wiring (submit handler, event-dispatch tick, table interactions,
/// background conversation task) belongs to `tab::attach_new_tab` in the
/// binary, which appends each `tab.root` as a new `adw::TabPage` into the
/// returned `TabView`.
///
/// `load_app_css` registers a `CssProvider` with the default `Display`,
/// which is process-global and idempotent — calling this once per window
/// is harmless because GTK deduplicates the provider registration.
pub fn build_window_shell(
    app: &libadwaita::Application,
    title: &str,
) -> (ApplicationWindow, libadwaita::TabView) {
    load_app_css();

    let window = ApplicationWindow::builder()
        .application(app)
        .title(title)
        .default_width(900)
        .default_height(700)
        .build();

    let tab_view = libadwaita::TabView::new();
    let tab_bar = libadwaita::TabBar::new();
    tab_bar.set_view(Some(&tab_view));
    // Always show the tab bar even with one tab — predictable affordance
    // for "click here to open another tab", and avoids the layout shift
    // that would otherwise happen when the second tab is opened.
    tab_bar.set_autohide(false);
    tab_bar.set_expand_tabs(true);

    let host = GtkBox::builder().orientation(Orientation::Vertical).build();
    host.append(&tab_bar);
    host.append(&tab_view);
    window.set_child(Some(&host));

    (window, tab_view)
}

/// Build the per-tab widget tree (Stage A of MULTIWINDOW_TABS.md).
///
/// Returns a [`TabContent`] containing:
/// - `root`: vertical `GtkBox` (output ScrolledWindow / Separator / input row /
///   Separator / status bar) ready to be placed inside an `ApplicationWindow`
///   (Stage A) or an `adw::TabPage` (Stage B+).
/// - `widgets`: handles to every interactive child (output views, input view,
///   send button, status labels, …) for use by `submit`, `event_dispatch`,
///   `menu`, `table_interactions`.
/// - `cwd`: the tab's working directory (used today for the window title;
///   from Stage 0 onwards each tab carries its own cwd, no process-global
///   `current_dir` reads).
///
/// **Single source of truth** (Gotchas #37/#39/#40/#43): every per-tab
/// widget is constructed exactly here. `build_window` is a composer that
/// glues a shell + a tab together; `build_window_shell` only creates the
/// `ApplicationWindow`. Tests in `tests/multiwindow_stage_a_tests.rs`
/// enforce this statically (e.g. the EmojiTextView constructor call must
/// appear exactly twice in `window.rs`, both inside `build_tab_content`).
pub fn build_tab_content(cwd: &std::path::Path) -> TabContent {
    // --- Output: TWO read-only TextViews stacked in a vertical Box ---
    //
    // `final_view`     — append-only history of completed DisplayBlocks.
    // `streaming_view` — live streaming text, hidden when empty.
    //
    // Both live in the SAME ScrolledWindow → they scroll together as one
    // continuous output region. This way the user can scroll past the
    // streaming area into earlier history; auto-scroll keeps both pinned
    // at the bottom while content is flowing in.
    let final_buffer = gtk4::TextBuffer::new(None::<&gtk4::TextTagTable>);
    let final_view = EmojiTextView::with_buffer(&final_buffer);
    final_view.set_editable(false);
    final_view.set_cursor_visible(false);
    // CRITICAL (issue #27): the read-only output views must NOT be
    // focusable. GtkTextView's internal click handler places the cursor
    // at the click position and calls scroll_mark_onscreen(insert_mark)
    // — on a read-only view this snaps the viewport away from where the
    // user is reading. set_focus_on_click(false) is not enough; the
    // click handler still runs. set_can_focus(false) blocks focus
    // entirely. Selection via click-and-drag still works (GestureDrag
    // does not require focus); right-click "Copy" still works.
    final_view.set_can_focus(false);
    final_view.set_wrap_mode(WrapMode::WordChar);
    final_view.set_top_margin(8);
    final_view.set_bottom_margin(0); // streaming_view follows below
    final_view.set_left_margin(12);
    final_view.set_right_margin(12);
    final_view.set_hexpand(true);
    disable_text_view_drag(final_view.upcast_ref::<TextView>());
    setup_output_context_menu(final_view.upcast_ref::<TextView>());

    let streaming_buffer_widget = gtk4::TextBuffer::new(None::<&gtk4::TextTagTable>);
    let streaming_view = EmojiTextView::with_buffer(&streaming_buffer_widget);
    streaming_view.set_editable(false);
    streaming_view.set_cursor_visible(false);
    // Same can_focus guard as final_view (issue #27).
    streaming_view.set_can_focus(false);
    streaming_view.set_wrap_mode(WrapMode::WordChar);
    streaming_view.set_top_margin(0);
    streaming_view.set_bottom_margin(8);
    streaming_view.set_left_margin(12);
    streaming_view.set_right_margin(12);
    streaming_view.set_hexpand(true);
    streaming_view.set_visible(false); // hidden until first TextDelta
    disable_text_view_drag(streaming_view.upcast_ref::<TextView>());
    setup_output_context_menu(streaming_view.upcast_ref::<TextView>());

    let output_inner_box = GtkBox::builder()
        .orientation(Orientation::Vertical)
        .spacing(0)
        .hexpand(true)
        .build();
    output_inner_box.append(&final_view);
    output_inner_box.append(&streaming_view);

    // Bottom spacer: an empty Box that always sits below final_view +
    // streaming_view. FIXED height (4000 px). No dynamic resize, no
    // vexpand. Purpose: keep `upper` so generously inflated that
    // GtkAdjustment never clamps `value` downward when streaming_view
    // shrinks to 0 on finalize. 4000 px covers any reasonable viewport
    // (4K-tall window with room to spare).
    //
    // Trade-off: the scrollbar daumen reflects the spacer too, so the
    // user can scroll a bit past the actual content into empty space.
    // This is the explicit cost we pay for a stable, non-clamping
    // adjustment — see Gotcha #46 (TBD).
    let output_bottom_spacer = GtkBox::builder()
        .orientation(Orientation::Vertical)
        .height_request(4000)
        .build();
    output_inner_box.append(&output_bottom_spacer);

    let output_scroll = ScrolledWindow::builder()
        .vexpand(true)
        .hexpand(true)
        .hscrollbar_policy(PolicyType::Never)
        .vscrollbar_policy(PolicyType::Automatic)
        .child(&output_inner_box)
        .build();

    // --- Input: editable text view + send button ---
    let input_buffer = gtk4::TextBuffer::new(None::<&gtk4::TextTagTable>);
    let input_view = TextView::builder()
        .buffer(&input_buffer)
        .editable(true)
        .wrap_mode(WrapMode::Word)
        .top_margin(4)
        .bottom_margin(4)
        .left_margin(8)
        .right_margin(8)
        .build();

    // Input ScrolledWindow with dynamic max-content-height: capped at
    // half the window height (issue #26). The cap is set initially
    // from the default-height (700 → 350), then updated whenever the
    // window's `default-height` property changes (resize events). That
    // wiring lives in `build_window` because it spans the per-tab and
    // per-window layers; we expose `input_scroll` through `UiWidgets`
    // so `build_window` can grab the handle without a bespoke accessor.
    // When the input content exceeds the cap the internal vertical
    // scrollbar appears (PolicyType::Automatic).
    let input_scroll = ScrolledWindow::builder()
        .hexpand(true)
        .max_content_height(350)
        .propagate_natural_height(true)
        .hscrollbar_policy(PolicyType::Never)
        .vscrollbar_policy(PolicyType::Automatic)
        .child(&input_view)
        .build();

    let send_button = Button::builder()
        .label("Send")
        .css_classes(["suggested-action"])
        .width_request(90)
        .build();

    let toggle_tool_button = Button::builder()
        .label("Hide Tools")
        .width_request(90)
        .build();

    // Stack toggle button above send button in a vertical box
    let button_box = GtkBox::builder()
        .orientation(Orientation::Vertical)
        .spacing(4)
        .valign(gtk4::Align::End)
        .build();
    button_box.append(&toggle_tool_button);
    button_box.append(&send_button);

    let input_row = GtkBox::builder()
        .orientation(Orientation::Horizontal)
        .spacing(8)
        .margin_start(8)
        .margin_end(8)
        .margin_top(4)
        .margin_bottom(8)
        .build();
    input_row.append(&input_scroll);
    input_row.append(&button_box);

    // --- Status bar ---
    let status_left_label = Label::builder()
        .label("")
        .halign(gtk4::Align::Start)
        .hexpand(true)
        .xalign(0.0)
        .margin_start(12)
        .margin_top(2)
        .margin_bottom(2)
        .css_classes(["dim-label"])
        .build();

    let status_right_label = Label::builder()
        .label("")
        .halign(gtk4::Align::End)
        .xalign(1.0)
        .margin_end(12)
        .margin_top(2)
        .margin_bottom(2)
        .css_classes(["dim-label"])
        .build();

    let status_bar = GtkBox::builder()
        .orientation(Orientation::Horizontal)
        .hexpand(true)
        .build();
    status_bar.append(&status_left_label);
    status_bar.append(&status_right_label);

    // --- Per-tab root: stack output / input / status bar vertically ---
    let root = GtkBox::builder()
        .orientation(Orientation::Vertical)
        .build();
    root.append(&output_scroll);
    root.append(&Separator::new(Orientation::Horizontal));
    root.append(&input_row);
    root.append(&Separator::new(Orientation::Horizontal));
    root.append(&status_bar);

    let widgets = UiWidgets {
        final_view,
        final_buffer,
        streaming_view,
        streaming_buffer_widget,
        output_scroll,
        output_bottom_spacer,
        input_view,
        input_buffer,
        input_scroll,
        send_button,
        toggle_tool_button,
        status_left_label,
        status_right_label,
    };

    // Read the actual text font size from the output TextView's Pango context
    // so emoji bitmaps match the surrounding text height. Per-tab because the
    // font size is stored in a thread-local; the value is the same for every
    // tab on the same display, so re-initialising on each tab is a no-op.
    init_emoji_font_size(&widgets.final_view);

    TabContent {
        root,
        widgets,
        cwd: cwd.to_path_buf(),
    }
}

// NOTE: the Stage A `build_window(app, cwd) -> (ApplicationWindow,
// TabContent)` composer is gone. Stage B (MULTIWINDOW_TABS.md) replaces it
// with explicit composition by the caller — `build_window_shell` (returns
// window + empty TabView) followed by `tab::attach_new_tab` (builds the
// per-tab tree, wires it, appends a TabPage). The same call path serves
// both "open initial tab at startup" and "Cmd+T new tab", so there is NO
// "first tab special" code path that could drift from "Nth tab" wiring.
//
// The window-level input-height cap (issue #26: cap = window_height / 2)
// previously lived in `build_window`; in Stage B it lives in
// `tab::attach_new_tab` because the cap is per-tab (each tab has its own
// `input_scroll`) but parameterised by the window the tab belongs to.

/// Append `text` to the end of `view`'s buffer, optionally applying one or
/// more named tags to every inserted character.
///
/// This is the **single source of truth** for appending text to an
/// `EmojiTextView` (Gotcha #43). Emoji segments are routed through
/// `insert_emoji_as_overlay` so they land in the view's per-instance overlay
/// registry (Gotcha #44). Plain segments get the tags applied via
/// `apply_tag_by_name` after insertion.
///
/// Pass `&[]` to insert untagged text. The wrappers `append_to_output`,
/// `append_styled`, and `append_multi_styled` exist purely for call-site
/// readability (Rust has no function overloading).
pub fn append(view: &EmojiTextView, text: &str, tag_names: &[&str]) {
    let buffer = view.buffer();
    if !tag_names.is_empty() {
        let tag_table = buffer.tag_table();
        if tag_names.iter().any(|t| tag_table.lookup(t).is_none()) {
            create_default_tags(&buffer);
        }
    }

    let segments = emoji::split_emoji_segments(text);
    for seg in &segments {
        match seg {
            emoji::TextSegment::Plain(s) => {
                let mut end_iter = buffer.end_iter();
                let start_offset = end_iter.offset();
                buffer.insert(&mut end_iter, s);
                if !tag_names.is_empty() {
                    let start_iter = buffer.iter_at_offset(start_offset);
                    let end_iter = buffer.end_iter();
                    for tag_name in tag_names {
                        buffer.apply_tag_by_name(tag_name, &start_iter, &end_iter);
                    }
                }
            }
            emoji::TextSegment::Emoji(e) => {
                insert_emoji_as_overlay(view, e, tag_names, false);
            }
        }
    }
}

/// Append untagged text. Thin wrapper over [`append`] for call-site clarity.
#[inline]
pub fn append_to_output(view: &EmojiTextView, text: &str) {
    append(view, text, &[])
}

/// Append text with a single named tag. Thin wrapper over [`append`].
#[inline]
pub fn append_styled(view: &EmojiTextView, text: &str, tag_name: &str) {
    append(view, text, &[tag_name])
}

/// Append text with multiple named tags. Thin wrapper over [`append`].
#[inline]
pub fn append_multi_styled(view: &EmojiTextView, text: &str, tag_names: &[&str]) {
    append(view, text, tag_names)
}

/// Read the font size from a TextView's Pango context and store it
/// for emoji rendering. Called once at startup.
fn init_emoji_font_size(text_view: &EmojiTextView) {
    let pango_ctx = text_view.pango_context();
    let font_desc = pango_ctx.font_description().unwrap_or_else(|| {
        gtk4::pango::FontDescription::from_string("sans 13")
    });
    let size_pango = font_desc.size();
    let size_pt = size_pango as f64 / gtk4::pango::SCALE as f64;
    let size = size_pt.clamp(8.0, 48.0);
    EMOJI_FONT_SIZE.with(|cell| cell.set(size));

    tracing::debug!("emoji font size: {size}pt (overlay mode — spaces carry width)");
}

/// Render an emoji string via CoreText and insert as an overlay.
///
/// Inserts placeholder space characters (Pango-native width, zero
/// cumulative error) and registers the emoji texture for overlay rendering
/// in `EmojiTextView::snapshot()`. The spaces carry the layout width;
/// the emoji bitmap is drawn on top during rendering.
///
/// Falls back to inserting the raw text if rendering fails (e.g. on
/// non-macOS platforms or if the emoji font is missing).
///
/// Renders at 2x pixel resolution for crisp display on Retina/HiDPI screens.
///
/// **Placeholder count**: For monospace fonts, 2 spaces ≈ line height
/// (roughly square slot → emoji fills naturally). For proportional fonts,
/// 2 spaces are much narrower than the line height → the emoji would be
/// squished horizontally. We use 3 spaces for proportional fonts, which
/// provides enough width for a nearly-square slot.
///
/// `tag_names`: tags to apply to the placeholder spaces (e.g. monospace tag
/// for table alignment). Empty slice means no special tags.
///
/// `monospace`: whether the emoji is in a monospace context (code block,
/// table cell). Determines the number of placeholder spaces.
pub(crate) fn insert_emoji_as_overlay(
    view: &EmojiTextView,
    emoji_str: &str,
    tag_names: &[&str],
    monospace: bool,
) {
    match render_emoji_texture(emoji_str, monospace) {
        Some((texture, scale, placeholder_len)) => {
            view.insert_emoji(
                texture.upcast(),
                scale,
                placeholder_len,
                tag_names,
            );
        }
        None => {
            // Fallback: insert raw emoji text into the view's buffer.
            let buffer = view.buffer();
            let mut end_iter = buffer.end_iter();
            buffer.insert(&mut end_iter, emoji_str);
        }
    }
}

/// Render the emoji bitmap and return `(texture, scale, placeholder_len)`.
///
/// Single source of truth for emoji rendering parameters. Returns `None` if
/// the platform doesn't support bitmap emoji rendering (callers should
/// fall back to inserting the raw text).
fn render_emoji_texture(
    emoji_str: &str,
    monospace: bool,
) -> Option<(gtk4::gdk::MemoryTexture, i32, i32)> {
    // Render emoji at a large fixed font size for maximum bitmap quality.
    // Apple Color Emoji (SBIX) has discrete bitmap strikes — larger size
    // selects a higher-resolution strike. At 40pt with scale=2, CoreText
    // produces ~80×80 pixel bitmaps. These are downscaled to the ~28×34
    // device-pixel slot via trilinear filtering in snapshot(), yielding
    // crisp results. Using the text font size (13pt) produces only ~24×25
    // pixel bitmaps that must be upscaled → blurry on Retina.
    let font_size = 40.0;
    let scale = 2; // Retina: render at 2x resolution

    // Monospace: 2 spaces ≈ 1 em width ≈ line height → roughly square slot.
    // Proportional: 2 spaces ≈ 0.5 em → much narrower than tall. Use 3 spaces
    // for a wider slot that keeps the emoji roughly square.
    let placeholder_len: i32 = if monospace { 2 } else { 3 };

    EMOJI_CACHE.with(|cache| {
        let mut cache = cache.borrow_mut();
        cache.get_or_render(emoji_str, font_size, scale).map(|bmp| {
            let bytes = gtk4::glib::Bytes::from(&bmp.data);
            let texture = gtk4::gdk::MemoryTexture::new(
                bmp.width,
                bmp.height,
                gtk4::gdk::MemoryFormat::R8g8b8a8Premultiplied,
                &bytes,
                (bmp.width as usize) * 4,
            );
            (texture, scale, placeholder_len)
        })
    })
}

/// A GdkPaintable wrapper that reports a custom intrinsic size.
///
/// This is used for HiDPI emoji rendering: the inner texture has 2x pixels,
/// but the paintable reports 1x logical size. GtkTextView uses the intrinsic
/// size for layout, while `snapshot()` draws the full-resolution texture
/// scaled down into the logical rect — resulting in crisp rendering.
pub mod scaled_paintable {
    use gtk4::gdk;
    use gtk4::glib;
    use gtk4::prelude::*;
    use gtk4::subclass::prelude::*;

    mod imp {
        use super::*;
        use std::cell::{Cell, OnceCell};

        #[derive(Default)]
        pub struct ScaledPaintable {
            pub(super) inner: OnceCell<gdk::Paintable>,
            pub(super) logical_width: Cell<i32>,
            pub(super) logical_height: Cell<i32>,
            /// Natural width of the inner texture (logical pixels).
            /// When this is smaller than logical_width, the emoji is centered
            /// horizontally within the wider slot (used for monospace alignment).
            pub(super) natural_width: Cell<i32>,
        }

        #[glib::object_subclass]
        impl ObjectSubclass for ScaledPaintable {
            const NAME: &'static str = "ChlodwigScaledPaintable";
            type Type = super::ScaledPaintable;
            type Interfaces = (gdk::Paintable,);
        }

        impl ObjectImpl for ScaledPaintable {}

        impl PaintableImpl for ScaledPaintable {
            fn intrinsic_width(&self) -> i32 {
                self.logical_width.get()
            }
            fn intrinsic_height(&self) -> i32 {
                self.logical_height.get()
            }
            fn snapshot(&self, snapshot: &gdk::Snapshot, width: f64, height: f64) {
                if let Some(inner) = self.inner.get() {
                    let natural_w = self.natural_width.get() as f64;
                    let logical_w = self.logical_width.get() as f64;

                    tracing::debug!(
                        "ScaledPaintable::snapshot() called: width={width:.1}, height={height:.1}, \
                         logical_w={logical_w:.0}, natural_w={natural_w:.0}"
                    );

                    if natural_w > 0.0 && (logical_w - natural_w).abs() > 0.5 {
                        // Monospace slot differs from natural bitmap width.
                        // Draw the emoji at its natural aspect ratio and center
                        // horizontally within the (possibly wider or narrower) slot.
                        let draw_w = width * (natural_w / logical_w);
                        let x_offset = (width - draw_w) / 2.0;

                        let gtk_snapshot = snapshot.downcast_ref::<gtk4::Snapshot>().unwrap();
                        gtk_snapshot.save();
                        gtk_snapshot.translate(&gtk4::graphene::Point::new(x_offset as f32, 0.0));
                        inner.snapshot(snapshot, draw_w, height);
                        gtk_snapshot.restore();
                    } else {
                        inner.snapshot(snapshot, width, height);
                    }
                }
            }
        }
    }

    glib::wrapper! {
        pub struct ScaledPaintable(ObjectSubclass<imp::ScaledPaintable>)
            @implements gdk::Paintable;
    }

    impl ScaledPaintable {
        pub fn new(inner: gdk::Paintable, logical_width: i32, logical_height: i32) -> Self {
            // When natural_width == logical_width, no centering is needed.
            Self::new_with_natural(inner, logical_width, logical_height, logical_width)
        }

        /// Create with an explicit natural width for the inner texture.
        ///
        /// When `natural_width != logical_width`, the emoji is drawn at its
        /// natural aspect ratio and centered horizontally within the
        /// logical slot. This is used for monospace table alignment where
        /// the slot is exactly `2 × mono_char_width` regardless of the
        /// emoji's actual bitmap width.
        pub fn new_with_natural(
            inner: gdk::Paintable,
            logical_width: i32,
            logical_height: i32,
            natural_width: i32,
        ) -> Self {
            let obj: Self = glib::Object::builder().build();
            let imp = obj.imp();
            let _ = imp.inner.set(inner);
            imp.logical_width.set(logical_width);
            imp.logical_height.set(logical_height);
            imp.natural_width.set(natural_width);
            obj
        }
    }
}

/// Create text tags for styling (called once).
fn create_default_tags(buffer: &gtk4::TextBuffer) {
    let tag_table = buffer.tag_table();

    // User message: bold
    let user_tag = gtk4::TextTag::builder()
        .name("user")
        .weight(700) // bold
        .build();
    tag_table.add(&user_tag);

    // Assistant text: normal
    let assistant_tag = gtk4::TextTag::builder()
        .name("assistant")
        .build();
    tag_table.add(&assistant_tag);

    // Tool name: colored
    let tool_tag = gtk4::TextTag::builder()
        .name("tool")
        .foreground("#e5c07b") // yellow-ish
        .weight(700)
        .build();
    tag_table.add(&tool_tag);

    // Tool result: monospace, dimmed
    let result_tag = gtk4::TextTag::builder()
        .name("result")
        .foreground("#7f848e") // grey
        .family(crate::MONO_FONT_FAMILY)
        .build();
    tag_table.add(&result_tag);

    // Error: red
    let error_tag = gtk4::TextTag::builder()
        .name("error")
        .foreground("#e06c75") // red
        .weight(700)
        .build();
    tag_table.add(&error_tag);

    // System message: italic, dimmed
    let system_tag = gtk4::TextTag::builder()
        .name("system")
        .foreground("#7f848e")
        .style(gtk4::pango::Style::Italic)
        .build();
    tag_table.add(&system_tag);

    // Streaming: normal, will be replaced when complete
    let streaming_tag = gtk4::TextTag::builder()
        .name("streaming")
        .build();
    tag_table.add(&streaming_tag);

    // Read header: green (matches TUI Color::Green)
    let read_header_tag = gtk4::TextTag::builder()
        .name("read_header")
        .foreground("#98c379") // green
        .weight(700)
        .build();
    tag_table.add(&read_header_tag);

    // Write header: magenta (matches TUI Color::Magenta)
    let write_header_tag = gtk4::TextTag::builder()
        .name("write_header")
        .foreground("#c678dd") // magenta
        .weight(700)
        .build();
    tag_table.add(&write_header_tag);

    // Bash header: yellow bold (matches TUI `$ command` style)
    let bash_header_tag = gtk4::TextTag::builder()
        .name("bash_header")
        .foreground("#e5c07b") // yellow
        .weight(700)
        .build();
    tag_table.add(&bash_header_tag);

    // Grep header: blue (matches TUI Color::Blue)
    let grep_header_tag = gtk4::TextTag::builder()
        .name("grep_header")
        .foreground("#61afef") // blue
        .weight(700)
        .build();
    tag_table.add(&grep_header_tag);

    // Line numbers: dark gray, monospace (matches TUI gutter style)
    let line_number_tag = gtk4::TextTag::builder()
        .name("line_number")
        .foreground("#7f848e") // grey
        .family(crate::MONO_FONT_FAMILY)
        .build();
    tag_table.add(&line_number_tag);

    // Diff removal: red, monospace
    let diff_remove_tag = gtk4::TextTag::builder()
        .name("diff_remove")
        .foreground("#e06c75") // red
        .family(crate::MONO_FONT_FAMILY)
        .build();
    tag_table.add(&diff_remove_tag);

    // Diff addition: green, monospace
    let diff_add_tag = gtk4::TextTag::builder()
        .name("diff_add")
        .foreground("#98c379") // green
        .family(crate::MONO_FONT_FAMILY)
        .build();
    tag_table.add(&diff_add_tag);

    // ToolResult OK header: green (matches TUI "── [OK] ──")
    let result_ok_tag = gtk4::TextTag::builder()
        .name("result_ok")
        .foreground("#98c379") // green
        .build();
    tag_table.add(&result_ok_tag);

    // Code: monospace font for source code, tool output, etc.
    let code_tag = gtk4::TextTag::builder()
        .name("code")
        .family(crate::MONO_FONT_FAMILY)
        .build();
    tag_table.add(&code_tag);
}

/// Update the status bar labels — left-aligned and right-aligned, matching TUI layout.
pub fn update_status(left_label: &Label, right_label: &Label, state: &AppState) {
    let spinner_str = state.spinner_char().to_string();
    let d = chlodwig_core::StatusLineData {
        model: &state.model,
        turn_count: state.turn_count,
        request_count: state.request_count,
        total_input_tokens: state.input_tokens,
        total_output_tokens: state.output_tokens,
        turn_usage: &state.turn_usage,
        stream_chunks: state.stream_chunks,
        is_streaming: state.is_streaming,
        spinner: &spinner_str,
        build_id: BUILD_ID,
        build_time: BUILD_TIME,
    };

    left_label.set_label(&chlodwig_core::format_status_left(&d));
    right_label.set_label(&chlodwig_core::format_status_right(&d));
}

/// Scroll to the bottom of the content (NOT the bottom of `upper`).
///
/// `upper` is inflated by the bottom spacer (see `output_bottom_spacer`)
/// to prevent GtkAdjustment from clamping `value` when streaming_view
/// shrinks. Scrolling to `upper - page_size` would land in the empty
/// spacer area below the actual content. Compute the real content
/// bottom from `final_view.allocated_height + streaming_view.allocated_height`.
///
/// **Deferred via `Widget::add_tick_callback`**: callers typically
/// invoke this immediately after mutating the buffer (e.g. Cmd+Enter
/// inserts the user message, then asks to scroll to the new bottom).
/// At that synchronous moment, GTK has not yet run a layout pass, so
/// `final_view.allocated_height()` still returns the PRE-mutation
/// height — the scroll target is too short and the new content is
/// not visible.
///
/// `idle_add_local_once` is NOT sufficient: GTK4 layout runs on the
/// frame clock, not the GLib main loop, so an idle callback can fire
/// before the next frame's layout completes. `add_tick_callback`
/// runs in sync with the frame clock AFTER the layout pass — at that
/// point `allocated_height()` is guaranteed current. We schedule TWO
/// tick callbacks to handle the case where the first frame after the
/// buffer mutation only invalidates the layout, and the actual
/// measure happens on the second frame.
pub fn scroll_to_content_bottom(
    scroll: &ScrolledWindow,
    final_view: &EmojiTextView,
    streaming_view: &EmojiTextView,
) {
    use gtk4::glib::ControlFlow;
    let scroll_clone = scroll.clone();
    let final_view_clone = final_view.clone();
    let streaming_view_clone = streaming_view.clone();
    // Track frames: skip the first (layout-invalidate frame), measure
    // and scroll on the second (layout-complete frame), then unregister.
    let frames_left = std::rc::Rc::new(std::cell::Cell::new(2u8));
    final_view.add_tick_callback(move |_widget, _clock| {
        let n = frames_left.get();
        if n > 1 {
            frames_left.set(n - 1);
            return ControlFlow::Continue;
        }
        let adj = scroll_clone.vadjustment();
        let final_h = final_view_clone
            .upcast_ref::<TextView>()
            .allocated_height() as f64;
        let stream_h = if streaming_view_clone.is_visible() {
            streaming_view_clone
                .upcast_ref::<TextView>()
                .allocated_height() as f64
        } else {
            0.0
        };
        let content_bottom = final_h + stream_h;
        let max = (adj.upper() - adj.page_size()).max(0.0);
        // +10 px overscroll for breathing room under the last line.
        // Must match the auto-scroll tick in event_dispatch.rs.
        let target = (content_bottom - adj.page_size() + 10.0).max(0.0).min(max);
        adj.set_value(target);
        ControlFlow::Break
    });
}

/// DEPRECATED: scrolls to `upper - page_size`, which now lands in the
/// bottom spacer (empty area). Use `scroll_to_content_bottom` instead.
/// Kept temporarily for callers that still need migration.
pub fn scroll_to_bottom(scroll: &ScrolledWindow) {
    let adj = scroll.vadjustment();
    adj.set_value(adj.upper() - adj.page_size());
}

/// Disable drag-and-drop on a TextView.
///
/// GTK4's `GtkTextView` has an internal `GtkGestureDrag` handler
/// (`gtk_text_view_drag_gesture_update`) that initiates text DND when the
/// user drags over an existing selection. On macOS this crashes with
/// `NSInvalidArgumentException` (`-[GdkMacosPasteboardItem localObject]:
/// unrecognized selector`) because the GDK macOS backend doesn't properly
/// implement pasteboard items for text drags.
///
/// We cannot remove the `GestureDrag` controller — it also handles
/// click-and-drag text selection. Instead we:
///
/// 1. Remove any `DragSource` controllers (content provider for DND).
/// 2. Install a `GestureDrag` in the **CAPTURE** phase that, on drag-begin,
///    clears the current selection. This ensures GTK's internal handler
///    never sees a drag-start on selected text (the condition that triggers
///    DND). The user can still select text normally — the capture handler
///    clears the old selection, then GTK's internal handler starts a fresh
///    selection from the new click position.
fn disable_text_view_drag(view: &TextView) {
    // 1. Remove DragSource controllers
    let controllers = view.observe_controllers();
    let n = controllers.n_items();
    let mut to_remove = Vec::new();
    for i in 0..n {
        if let Some(obj) = controllers.item(i) {
            if obj.downcast_ref::<gtk4::DragSource>().is_some() {
                to_remove.push(i);
            }
        }
    }
    for &idx in to_remove.iter().rev() {
        if let Some(obj) = controllers.item(idx) {
            if let Ok(ctrl) = obj.downcast::<gtk4::EventController>() {
                view.remove_controller(&ctrl);
            }
        }
    }

    // 2. Install capture-phase GestureDrag that clears selection before GTK's
    //    internal handler can see it (prevents DND trigger).
    let buf = view.buffer();
    let gesture = gtk4::GestureDrag::new();
    gesture.set_propagation_phase(gtk4::PropagationPhase::Capture);
    gesture.connect_drag_begin(move |_gesture, _x, _y| {
        // Clear selection so GTK's internal handler won't trigger DND.
        // It will start a fresh selection from the click position instead.
        //
        // CRITICAL (issue #27): only touch the selection when one actually
        // exists. Moving the insert mark unconditionally (via select_-
        // range with collapsed iter) sends it to offset 0 on a read-only
        // output view whose cursor was never moved. GTK's TextView then
        // auto-scrolls the insert mark on-screen → snap to the first line
        // on every click. Guarding on `has_selection()` means: if there is
        // no selection, GTK's internal handler can't trigger DND anyway,
        // so we do nothing.
        if buf.has_selection() {
            let cursor = buf.cursor_position();
            let iter = buf.iter_at_offset(cursor);
            buf.select_range(&iter, &iter);
        }
    });
    view.add_controller(gesture);
}

/// Set up a right-click context menu on the output view with "Copy".
///
/// GTK4 `TextView` has a built-in context menu, but when `editable` is false
/// and `cursor_visible` is false, it may not include Copy or may be empty.
/// We install our own GMenu to guarantee a "Copy" action is always available.
fn setup_output_context_menu(view: &TextView) {
    // Build menu model
    let menu = gio::Menu::new();
    menu.append(Some("Copy"), Some("text.copy-clipboard"));

    // Create popover menu from the model
    let popover = gtk4::PopoverMenu::from_model(Some(&menu));
    popover.set_parent(view);
    popover.set_has_arrow(false);

    // Right-click gesture
    let gesture = gtk4::GestureClick::new();
    gesture.set_button(3); // right mouse button

    let popover_for_gesture = popover.clone();
    let view_for_gesture = view.clone();
    gesture.connect_pressed(move |gesture, _n_press, x, y| {
        gesture.set_state(gtk4::EventSequenceState::Claimed);
        // Position the popover at the click location
        popover_for_gesture.set_pointing_to(Some(&gtk4::gdk::Rectangle::new(
            x as i32,
            y as i32,
            1,
            1,
        )));
        // Only show Copy when there is a selection
        if view_for_gesture.buffer().has_selection() {
            popover_for_gesture.popup();
        }
    });
    view.add_controller(gesture);
}

/// Mirror the current TextView selection to the macOS system pasteboard.
///
/// This is the **single bridge** between GTK's selection state and
/// `NSPasteboard`. Every Cmd+C / Cmd+X / right-click-Copy code path
/// goes through here so native macOS apps see Chlodwig's copies.
///
/// On non-macOS targets `macos_clipboard::write_string` is a no-op,
/// so callers can invoke this unconditionally.
pub fn write_selection_to_macos_clipboard(view: &TextView) {
    let buf = view.buffer();
    if let Some((start, end)) = buf.selection_bounds() {
        let text = buf.text(&start, &end, false).to_string();
        let _ = crate::macos_clipboard::write_string(&text);
    }
}

/// Load the application CSS (emoji font fallback, etc.) into the default display.
///
/// This ensures Pango finds emoji fonts (Apple Color Emoji on macOS,
/// Noto Color Emoji on Linux) as fallback for all TextViews.
/// Without this, emoji characters render as empty boxes on macOS because
/// fontconfig's "sans" fallback chain doesn't include the system emoji font.
fn load_app_css() {
    let provider = gtk4::CssProvider::new();
    provider.load_from_data(crate::APP_CSS);

    if let Some(display) = gtk4::gdk::Display::default() {
        gtk4::style_context_add_provider_for_display(
            &display,
            &provider,
            gtk4::STYLE_PROVIDER_PRIORITY_APPLICATION,
        );
    }

    // CJK font installation: see main.rs — the bundled font is copied
    // to the user's standard font directory (~/Library/Fonts on macOS,
    // ~/.local/share/fonts on Linux) BEFORE GTK init, so CoreText and
    // fontconfig pick it up automatically with no further hooks needed
    // here.
}

// NOTE: load_bundled_emoji_font() was removed. In Pango 1.x, fonts loaded
// via pango_font_map_add_font_file() are still PangoCairoFcFont, NOT
// PangoHbFont. PangoCairoFcFont uses cairo_show_glyphs() which has no
// color font support — color glyphs render as blank. The PangoHbFont
// color rendering path only exists in Pango 2.x (PangoFontMap2).
// The bundled Noto-COLRv1.ttf and extraction code remain in lib.rs
// for future use when Pango 2.x becomes available.


/// Show a UserQuestion dialog for the LLM's question.
///
/// Displays the question with optional selectable options and a free-text entry.
/// When the user responds (or cancels), the `respond` oneshot sender is used to
/// return the answer to the waiting tool. The `on_close` callback is invoked
/// when the dialog closes (regardless of how — submit, cancel, or window close)
/// so the caller can show the next queued dialog.
///
/// **Architecture**: All decision logic ("what's the answer?", "is this a
/// submit or a cancel?", "is the input empty?") lives in
/// [`chlodwig_core::reducers::user_question::Model`]. This function is a thin
/// adapter that:
///   1. Owns the model in `Rc<RefCell<_>>` (single-threaded GTK closures)
///   2. Translates GTK events (button clicks, key presses, buffer changes)
///      into reducer `Msg`s
///   3. Reacts to the returned `Outcome`: `None` → keep dialog open,
///      `Submit(answer)` → send via oneshot and close
///
/// The same reducer is used by the TUI frontend, so a fix in core applies
/// to both.
pub fn show_user_question_dialog(
    parent: &ApplicationWindow,
    question: &str,
    options: &[String],
    respond: tokio::sync::oneshot::Sender<String>,
    on_close: Box<dyn Fn() + 'static>,
) {
    use chlodwig_core::reducers::user_question as uq;
    use std::cell::{Cell, RefCell};
    use std::rc::Rc;

    // ── Shared state ─────────────────────────────────────────────────
    let model = Rc::new(RefCell::new(uq::Model::new(
        question.to_string(),
        options.to_vec(),
    )));
    let respond = Rc::new(RefCell::new(Some(respond)));
    let on_close = Rc::new(on_close);
    // Re-entrancy guard: when the model changes and we write into the
    // TextBuffer, the buffer fires `changed` again → we'd loop forever.
    let suppress_buffer_sync = Rc::new(Cell::new(false));

    // ── Build widgets ────────────────────────────────────────────────
    let content = GtkBox::new(Orientation::Vertical, 8);
    content.set_margin_start(16);
    content.set_margin_end(16);
    content.set_margin_top(16);
    content.set_margin_bottom(16);

    let question_label = Label::new(Some(question));
    question_label.set_wrap(true);
    question_label.set_xalign(0.0);
    question_label.add_css_class("title-3");
    content.append(&question_label);

    // Free-text input (multiline TextView — same widget as the main prompt input,
    // so all macOS Cmd-shortcuts work: Cmd+A, Cmd+Left/Right, Option+Left/Right,
    // Cmd+Backspace, Cmd+C/V/X, etc.)
    let text_buffer = gtk4::TextBuffer::new(None::<&gtk4::TextTagTable>);
    let text_view = TextView::builder()
        .buffer(&text_buffer)
        .editable(true)
        .wrap_mode(WrapMode::Word)
        .vexpand(true)
        .top_margin(4)
        .bottom_margin(4)
        .left_margin(8)
        .right_margin(8)
        .build();
    setup_macos_input_shortcuts(&text_view, &[]);

    let text_scroll = ScrolledWindow::builder()
        .hexpand(true)
        .vexpand(true)
        .min_content_height(40)
        .hscrollbar_policy(PolicyType::Never)
        .vscrollbar_policy(PolicyType::Automatic)
        .child(&text_view)
        .build();

    let placeholder_text = if options.is_empty() {
        "Type your answer…"
    } else {
        "Or type a free-text answer…"
    };
    let placeholder_label = Label::new(Some(placeholder_text));
    placeholder_label.set_xalign(0.0);
    placeholder_label.set_opacity(0.5);
    placeholder_label.set_margin_start(12);
    placeholder_label.set_margin_top(8);
    placeholder_label.set_can_target(false);

    let text_overlay = gtk4::Overlay::new();
    text_overlay.set_child(Some(&text_scroll));
    text_overlay.add_overlay(&placeholder_label);

    let dialog = Rc::new(
        gtk4::Window::builder()
            .title("Question from Assistant")
            .transient_for(parent)
            .modal(true)
            .default_width(450)
            .default_height(300)
            .build(),
    );

    // ── The single dispatch helper ───────────────────────────────────
    // Apply a reducer message; on `Submit(answer)` send the answer,
    // close the dialog and notify the queue. Returns true iff dialog closed.
    let dispatch = {
        let model = model.clone();
        let respond = respond.clone();
        let dialog = dialog.clone();
        let on_close = on_close.clone();
        Rc::new(move |msg: uq::Msg| -> bool {
            let outcome = model.borrow_mut().update(msg);
            match outcome {
                uq::Outcome::None => false,
                uq::Outcome::Submit(answer) => {
                    if let Some(tx) = respond.borrow_mut().take() {
                        let _ = tx.send(answer);
                    }
                    dialog.close();
                    on_close();
                    true
                }
            }
        })
    };

    // ── TextBuffer → model.input.text (via Msg::SetText) ─────────────
    // Buffer is the source of truth for keystrokes (GTK handles editing
    // internally); after every change we sync the full content into the model.
    {
        let dispatch = dispatch.clone();
        let suppress = suppress_buffer_sync.clone();
        let placeholder = placeholder_label.clone();
        text_buffer.connect_changed(move |buf| {
            // Update placeholder visibility regardless of suppress state.
            placeholder.set_visible(buf.char_count() == 0);
            if suppress.get() {
                return;
            }
            let (start, end) = buf.bounds();
            let text = buf.text(&start, &end, false).to_string();
            // Dispatch returns true iff dialog closed; buffer is irrelevant after.
            let _ = dispatch(uq::Msg::SetText(text));
        });
    }

    // ── Option buttons → Msg::QuickSelect(i+1) ───────────────────────
    if !options.is_empty() {
        let opts_box = GtkBox::new(Orientation::Vertical, 4);
        for (i, opt) in options.iter().enumerate() {
            let btn = Button::with_label(&format!("{}. {}", i + 1, opt));
            btn.set_halign(gtk4::Align::Fill);
            if let Some(child) = btn.child() {
                if let Some(label) = child.downcast_ref::<Label>() {
                    label.set_xalign(0.0);
                }
            }
            btn.add_css_class("flat");
            let dispatch = dispatch.clone();
            let n = (i + 1) as u8;
            btn.connect_clicked(move |_| {
                let _ = dispatch(uq::Msg::QuickSelect(n));
            });
            opts_box.append(&btn);
        }
        content.append(&opts_box);
        content.append(&Separator::new(Orientation::Horizontal));
    }
    content.append(&text_overlay);

    // ── Button bar ───────────────────────────────────────────────────
    let button_bar = GtkBox::new(Orientation::Horizontal, 8);
    button_bar.set_margin_top(8);
    button_bar.set_halign(gtk4::Align::End);
    let cancel_btn = Button::with_label("Cancel");
    let submit_btn = Button::with_label("Submit");
    submit_btn.add_css_class("suggested-action");
    button_bar.append(&cancel_btn);
    button_bar.append(&submit_btn);
    content.append(&button_bar);

    // For Submit-without-selection: when no option is selected the model is
    // already in text-mode (selected = None when options.is_empty(), and we
    // never set selected via clicks in this Minimal-Port). When options exist
    // and the user clicks Submit, we deliberately move the model to text-mode
    // first so `Msg::Submit` returns the typed text, not the (still-selected)
    // first option. This matches the user's intent: clicking Submit means
    // "use what I typed".
    {
        let dispatch = dispatch.clone();
        let model = model.clone();
        submit_btn.connect_clicked(move |_| {
            // Drop any option-selection; in Minimal-Port we treat Submit
            // as "use the text field's content".
            model.borrow_mut().selected = None;
            let _ = dispatch(uq::Msg::Submit);
        });
    }

    {
        let dispatch = dispatch.clone();
        cancel_btn.connect_clicked(move |_| {
            let _ = dispatch(uq::Msg::Cancel);
        });
    }

    // Cmd+Enter → submit (Enter alone inserts newline)
    {
        let dispatch = dispatch.clone();
        let model = model.clone();
        let key_ctrl = gtk4::EventControllerKey::new();
        key_ctrl.connect_key_pressed(move |_, key, _, modifiers| {
            let is_cmd = modifiers.contains(gtk4::gdk::ModifierType::META_MASK)
                || modifiers.contains(gtk4::gdk::ModifierType::CONTROL_MASK);
            if key == gtk4::gdk::Key::Return && is_cmd {
                model.borrow_mut().selected = None;
                let _ = dispatch(uq::Msg::Submit);
                return gtk4::glib::Propagation::Stop;
            }
            gtk4::glib::Propagation::Proceed
        });
        text_view.add_controller(key_ctrl);
    }

    // Esc → cancel
    {
        let dispatch = dispatch.clone();
        let key_ctrl = gtk4::EventControllerKey::new();
        key_ctrl.connect_key_pressed(move |_, key, _, _| {
            if key == gtk4::gdk::Key::Escape {
                let _ = dispatch(uq::Msg::Cancel);
                return gtk4::glib::Propagation::Stop;
            }
            gtk4::glib::Propagation::Proceed
        });
        dialog.add_controller(key_ctrl);
    }

    // Window close (X button) → cancel, but only if not already responded.
    // dispatch() already handles double-respond safely (oneshot is consumed
    // on first send), so we just call it; no-op if the answer is already gone.
    {
        let dispatch = dispatch.clone();
        let respond_check = respond.clone();
        dialog.connect_close_request(move |_| {
            // Only dispatch Cancel if no answer was sent yet — otherwise
            // we'd call on_close() twice.
            if respond_check.borrow().is_some() {
                let _ = dispatch(uq::Msg::Cancel);
            }
            gtk4::glib::Propagation::Proceed
        });
    }

    dialog.set_child(Some(&content));
    dialog.present();

    if options.is_empty() {
        text_view.grab_focus();
    }

    // Currently unused (no path writes back to the buffer), but kept for B.2:
    // when the reducer drives the buffer, the writer must set
    // `suppress_buffer_sync` before mutating, then unset.
    let _ = suppress_buffer_sync;
}
