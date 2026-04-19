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
/// This is used for both the main prompt input and the UserQuestion dialog input.
pub fn setup_macos_input_shortcuts(view: &TextView) {
    let view_for_key = view.clone();
    let key_ctrl = gtk4::EventControllerKey::new();
    key_ctrl.connect_key_pressed(move |_, key, _keycode, modifiers| {
        let is_cmd = modifiers.contains(gtk4::gdk::ModifierType::META_MASK)
            || modifiers.contains(gtk4::gdk::ModifierType::CONTROL_MASK);

        if is_cmd {
            match key {
                k if k == gtk4::gdk::Key::v || k == gtk4::gdk::Key::V => {
                    view_for_key.emit_paste_clipboard();
                    return gtk4::glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::c || k == gtk4::gdk::Key::C => {
                    view_for_key.emit_copy_clipboard();
                    return gtk4::glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::x || k == gtk4::gdk::Key::X => {
                    view_for_key.emit_cut_clipboard();
                    return gtk4::glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::a || k == gtk4::gdk::Key::A => {
                    let buf = view_for_key.buffer();
                    buf.select_range(&buf.start_iter(), &buf.end_iter());
                    return gtk4::glib::Propagation::Stop;
                }
                k if k == gtk4::gdk::Key::BackSpace => {
                    let buf = view_for_key.buffer();
                    let text = buf.text(&buf.start_iter(), &buf.end_iter(), false).to_string();
                    let cursor = buf.cursor_position() as usize;
                    let (new_text, new_cursor) = crate::app_state::delete_to_line_start(&text, cursor);
                    buf.set_text(&new_text);
                    let iter = buf.iter_at_offset(new_cursor as i32);
                    buf.place_cursor(&iter);
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
                    let buf = view_for_key.buffer();
                    let text = buf.text(&buf.start_iter(), &buf.end_iter(), false).to_string();
                    let cursor = buf.cursor_position() as usize;
                    let (new_text, new_cursor) = crate::app_state::delete_word_back(&text, cursor);
                    buf.set_text(&new_text);
                    let iter = buf.iter_at_offset(new_cursor as i32);
                    buf.place_cursor(&iter);
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
    pub input_view: TextView,
    pub input_buffer: gtk4::TextBuffer,
    pub send_button: Button,
    pub toggle_tool_button: Button,
    pub status_left_label: Label,
    pub status_right_label: Label,
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

/// Build the main application window and return widget references.
///
/// `cwd` is the working directory of the (initial) tab; used to derive
/// the window title (`"chlodwig — <project-dir>"`). Per Stage 0.3 of
/// MULTIWINDOW_TABS.md the title no longer reads `env::current_dir()`.
pub fn build_window(
    app: &libadwaita::Application,
    cwd: &std::path::Path,
) -> (ApplicationWindow, UiWidgets) {
    // --- Load application CSS ---
    load_app_css();

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

    // Limit input height to ~5 lines but allow scrolling
    let input_scroll = ScrolledWindow::builder()
        .hexpand(true)
        .max_content_height(120)
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

    // --- Main layout ---
    let main_box = GtkBox::builder()
        .orientation(Orientation::Vertical)
        .build();
    main_box.append(&output_scroll);
    main_box.append(&Separator::new(Orientation::Horizontal));
    main_box.append(&input_row);
    main_box.append(&Separator::new(Orientation::Horizontal));
    main_box.append(&status_bar);

    let cwd_name = cwd
        .file_name()
        .map(|n| n.to_string_lossy().into_owned());
    let title = format_window_title(cwd_name.as_deref(), None);

    let window = ApplicationWindow::builder()
        .application(app)
        .title(&title)
        .default_width(900)
        .default_height(700)
        .build();
    window.set_child(Some(&main_box));

    let widgets = UiWidgets {
        final_view,
        final_buffer,
        streaming_view,
        streaming_buffer_widget,
        output_scroll,
        input_view,
        input_buffer,
        send_button,
        toggle_tool_button,
        status_left_label,
        status_right_label,
    };

    // Read the actual text font size from the output TextView's Pango context
    // so emoji bitmaps match the surrounding text height.
    init_emoji_font_size(&widgets.final_view);

    (window, widgets)
}

/// Append a text line to the output buffer (at the end).
///
/// Emoji characters are rendered as CoreText bitmaps and drawn as overlays
/// over 2-space placeholders. Non-emoji text is inserted normally via Pango.
pub fn append_to_output(buffer: &gtk4::TextBuffer, text: &str) {
    let segments = emoji::split_emoji_segments(text);
    for seg in &segments {
        match seg {
            emoji::TextSegment::Plain(s) => {
                let mut end_iter = buffer.end_iter();
                buffer.insert(&mut end_iter, s);
            }
            emoji::TextSegment::Emoji(e) => {
                insert_emoji_as_overlay(buffer, e, &[], false);
            }
        }
    }
}

/// Append a text line with a named tag for styling.
///
/// Emoji characters are rendered as CoreText bitmaps as overlays.
/// Tags are applied to both text segments and emoji placeholder spaces.
pub fn append_styled(buffer: &gtk4::TextBuffer, text: &str, tag_name: &str) {
    let tag_table = buffer.tag_table();
    if tag_table.lookup(tag_name).is_none() {
        // Create default tags on first use
        create_default_tags(buffer);
    }

    let segments = emoji::split_emoji_segments(text);
    for seg in &segments {
        match seg {
            emoji::TextSegment::Plain(s) => {
                let mut end_iter = buffer.end_iter();
                let start_offset = end_iter.offset();
                buffer.insert(&mut end_iter, s);
                let start_iter = buffer.iter_at_offset(start_offset);
                let end_iter = buffer.end_iter();
                buffer.apply_tag_by_name(tag_name, &start_iter, &end_iter);
            }
            emoji::TextSegment::Emoji(e) => {
                insert_emoji_as_overlay(buffer, e, &[tag_name], false);
            }
        }
    }
}

/// Append text with multiple tags applied simultaneously.
///
/// Emoji characters are rendered as CoreText bitmaps as overlays.
/// Tags are applied to both text segments and emoji placeholder spaces.
pub fn append_multi_styled(buffer: &gtk4::TextBuffer, text: &str, tag_names: &[&str]) {
    if tag_names.is_empty() {
        append_to_output(buffer, text);
        return;
    }
    let tag_table = buffer.tag_table();
    // Ensure tags exist
    if tag_names.iter().any(|t| tag_table.lookup(t).is_none()) {
        create_default_tags(buffer);
    }

    let segments = emoji::split_emoji_segments(text);
    for seg in &segments {
        match seg {
            emoji::TextSegment::Plain(s) => {
                let mut end_iter = buffer.end_iter();
                let start_offset = end_iter.offset();
                buffer.insert(&mut end_iter, s);
                let start_iter = buffer.iter_at_offset(start_offset);
                let end_iter = buffer.end_iter();
                for tag_name in tag_names {
                    buffer.apply_tag_by_name(tag_name, &start_iter, &end_iter);
                }
            }
            emoji::TextSegment::Emoji(e) => {
                insert_emoji_as_overlay(buffer, e, tag_names, false);
            }
        }
    }
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
    buffer: &gtk4::TextBuffer,
    emoji_str: &str,
    tag_names: &[&str],
    monospace: bool,
) {
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

    let result = EMOJI_CACHE.with(|cache| {
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
            texture
        })
    });

    match result {
        Some(texture) => {
            crate::emoji_overlay::insert_emoji(
                buffer,
                texture.upcast(),
                scale,
                placeholder_len,
                tag_names,
            );
        }
        None => {
            // Fallback: insert raw emoji text.
            let mut end_iter = buffer.end_iter();
            buffer.insert(&mut end_iter, emoji_str);
        }
    }
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
        .family("monospace")
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
        .family("monospace")
        .build();
    tag_table.add(&line_number_tag);

    // Diff removal: red, monospace
    let diff_remove_tag = gtk4::TextTag::builder()
        .name("diff_remove")
        .foreground("#e06c75") // red
        .family("monospace")
        .build();
    tag_table.add(&diff_remove_tag);

    // Diff addition: green, monospace
    let diff_add_tag = gtk4::TextTag::builder()
        .name("diff_add")
        .foreground("#98c379") // green
        .family("monospace")
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
        .family("monospace")
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

/// Scroll the output view to the bottom.
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
        let cursor = buf.cursor_position();
        let iter = buf.iter_at_offset(cursor);
        buf.select_range(&iter, &iter);
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

/// Copy the current selection from the output view to the system clipboard.
/// Returns `true` if text was copied, `false` if no selection.
pub fn copy_output_selection(view: &TextView) -> bool {
    let buffer = view.buffer();
    if !buffer.has_selection() {
        return false;
    }
    // GTK4 built-in: emit the copy-clipboard action
    view.emit_copy_clipboard();
    true
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
    setup_macos_input_shortcuts(&text_view);

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
