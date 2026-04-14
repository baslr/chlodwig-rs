//! Minimal GTK4 example to debug text rendering.
//!
//! Tests: ▶ triangle, emojis, normal text, CJK, box-drawing.
//! Emojis are rendered via CoreText bitmaps inserted as GdkPaintable.
//!
//! Usage:
//!   cargo run --example minimal -p chlodwig-gtk
//!
//! Compare with raw PangoCairo (no emoji bitmaps):
//!   cargo run --example minimal -p chlodwig-gtk -- --no-emoji-bitmaps
//!
//! Try different GSK renderers:
//!   GSK_RENDERER=cairo cargo run --example minimal -p chlodwig-gtk
//!   GSK_RENDERER=ngl   cargo run --example minimal -p chlodwig-gtk

use gtk4::prelude::*;
use gtk4::glib;
use chlodwig_gtk::emoji;

fn main() -> glib::ExitCode {
    // Default: Cairo renderer + CoreText backend
    if std::env::var("GSK_RENDERER").is_err() {
        unsafe { std::env::set_var("GSK_RENDERER", "cairo"); }
    }
    if std::env::var("PANGOCAIRO_BACKEND").is_err() {
        unsafe { std::env::set_var("PANGOCAIRO_BACKEND", "coretext"); }
    }

    let use_emoji_bitmaps = !std::env::args().any(|a| a == "--no-emoji-bitmaps");

    let backend = std::env::var("PANGOCAIRO_BACKEND").unwrap_or_default();
    let renderer = std::env::var("GSK_RENDERER").unwrap_or_else(|_| "(default)".into());
    eprintln!("PANGOCAIRO_BACKEND = {backend}");
    eprintln!("GSK_RENDERER       = {renderer}");
    eprintln!("Emoji bitmaps      = {use_emoji_bitmaps}");

    let app = gtk4::Application::builder()
        .application_id("rs.chlodwig.minimal")
        .build();

    app.connect_activate(move |app| {
        let backend = std::env::var("PANGOCAIRO_BACKEND").unwrap_or_default();
        let renderer = std::env::var("GSK_RENDERER").unwrap_or_else(|_| "(default)".into());

        let window = gtk4::ApplicationWindow::builder()
            .application(app)
            .title(&format!(
                "Text Test — {backend}/{renderer} — emoji_bitmaps={}",
                use_emoji_bitmaps
            ))
            .default_width(800)
            .default_height(700)
            .build();

        let tests: Vec<(&str, &str)> = vec![
            ("ASCII",         "Hello World 1234567890"),
            ("German",        "Ärger über Öffnung für Übung"),
            ("Triangle ▶",    "▶ User prompt with triangle"),
            ("Arrows",        "→ ← ↑ ↓ ↔ ⇒ ⇐"),
            ("Box drawing",   "├── src/ │ main.rs └── end"),
            ("Geometric",     "■ □ ● ○ ◆ ◇ ▲ ▼ ◀ ▶"),
            ("Checkmarks",    "✓ ✗ ✔ ✘ ✅ ❌"),
            ("Hourglass",     "⏳ Loading..."),
            ("Emoji basic",   "🌻 🔥 💡 🎉 🚀"),
            ("Emoji faces",   "😀 😂 🤔 😍 😎"),
            ("Emoji hands",   "👍 👎 👋 🤝 💪"),
            ("Emoji objects", "📁 🔑 💻 📱"),
            ("Emoji flags",   "🇩🇪 🇺🇸 🇯🇵"),
            ("CJK",           "漢字テスト 中文测试"),
            ("Mixed",         "▶ Hello 🌻 → 漢字 ✅"),
        ];

        let vbox = gtk4::Box::new(gtk4::Orientation::Vertical, 4);
        vbox.set_margin_top(12);
        vbox.set_margin_bottom(12);
        vbox.set_margin_start(12);
        vbox.set_margin_end(12);

        // --- GtkTextView with emoji-as-paintable ---
        let header = gtk4::Label::new(Some(&format!(
            "GtkTextView — emoji_bitmaps={use_emoji_bitmaps}"
        )));
        header.set_halign(gtk4::Align::Start);
        header.add_css_class("heading");
        vbox.append(&header);

        let buffer = gtk4::TextBuffer::new(None::<&gtk4::TextTagTable>);

        if use_emoji_bitmaps {
            // Use emoji-as-paintable rendering
            let mut cache = emoji::EmojiCache::new();

            for (label, content) in &tests {
                // Insert label
                let mut end = buffer.end_iter();
                buffer.insert(&mut end, &format!("{label}: "));

                // Insert content with emoji detection
                let segments = emoji::split_emoji_segments(content);
                for seg in &segments {
                    match seg {
                        emoji::TextSegment::Plain(s) => {
                            let mut end = buffer.end_iter();
                            buffer.insert(&mut end, s);
                        }
                        emoji::TextSegment::Emoji(e) => {
                            let font_size = 13.0; // Match GTK default body text
                            let scale = 2; // Retina: render at 2x
                            if let Some(bmp) = cache.get_or_render(e, font_size, scale) {
                                let bytes = glib::Bytes::from(&bmp.data);
                                let tex = gtk4::gdk::MemoryTexture::new(
                                    bmp.width,
                                    bmp.height,
                                    gtk4::gdk::MemoryFormat::R8g8b8a8Premultiplied,
                                    &bytes,
                                    (bmp.width as usize) * 4,
                                );
                                // Wrap in ScaledPaintable to report logical (1x) size
                                let paintable = chlodwig_gtk::ScaledPaintable::new(
                                    tex.upcast(),
                                    bmp.logical_width(),
                                    bmp.logical_height(),
                                );
                                let mut end = buffer.end_iter();
                                buffer.insert_paintable(&mut end, &paintable);
                            } else {
                                let mut end = buffer.end_iter();
                                buffer.insert(&mut end, e);
                            }
                        }
                    }
                }

                let mut end = buffer.end_iter();
                buffer.insert(&mut end, "\n");
            }
        } else {
            // Raw PangoCairo rendering (no emoji bitmaps)
            let mut text = String::new();
            for (label, content) in &tests {
                text.push_str(&format!("{label}: {content}\n"));
            }
            buffer.set_text(&text);
        }

        let textview = gtk4::TextView::builder()
            .buffer(&buffer)
            .editable(false)
            .cursor_visible(false)
            .wrap_mode(gtk4::WrapMode::WordChar)
            .top_margin(8)
            .bottom_margin(8)
            .left_margin(12)
            .right_margin(12)
            .vexpand(true)
            .build();

        let scroll = gtk4::ScrolledWindow::builder()
            .vexpand(true)
            .child(&textview)
            .build();

        vbox.append(&scroll);

        // Print renderer info
        let window_weak = window.downgrade();
        glib::idle_add_local_once(move || {
            if let Some(win) = window_weak.upgrade() {
                if let Some(native) = win.native() {
                    if let Some(renderer) = native.renderer() {
                        eprintln!("Renderer: {}", renderer.type_().name());
                    }
                }
            }
        });

        window.set_child(Some(&vbox));
        window.present();
    });

    app.run()
}
