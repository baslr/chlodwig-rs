//! Test: monospace text with emoji overlays.
//!
//! Verifies whether EmojiTextView overlay rendering works correctly
//! for multiple emojis in table cells.
//!
//! Usage:
//!   cargo run --example mono_emoji -p chlodwig-gtk
//!   RUST_LOG=debug cargo run --example mono_emoji -p chlodwig-gtk

use gtk4::prelude::*;
use gtk4::glib;
use chlodwig_gtk::emoji;
use chlodwig_gtk::emoji_overlay::{self, EmojiTextView};

fn main() -> glib::ExitCode {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    if std::env::var("GSK_RENDERER").is_err() {
        unsafe { std::env::set_var("GSK_RENDERER", "cairo"); }
    }
    if std::env::var("PANGOCAIRO_BACKEND").is_err() {
        unsafe { std::env::set_var("PANGOCAIRO_BACKEND", "coretext"); }
    }

    let app = gtk4::Application::builder()
        .application_id("rs.chlodwig.mono-emoji-test")
        .build();

    app.connect_activate(|app| {
        let window = gtk4::ApplicationWindow::builder()
            .application(app)
            .title("Emoji Overlay Test — Table Alignment")
            .default_width(900)
            .default_height(600)
            .build();

        let buffer = gtk4::TextBuffer::new(None::<&gtk4::TextTagTable>);

        // Create monospace tag
        let tag_table = buffer.tag_table();
        let mono_tag = gtk4::TextTag::builder()
            .name("mono")
            .family("monospace")
            .build();
        tag_table.add(&mono_tag);

        let textview = EmojiTextView::with_buffer(&buffer);
        textview.set_editable(false);
        textview.set_cursor_visible(false);
        textview.set_wrap_mode(gtk4::WrapMode::WordChar);
        textview.set_top_margin(8);
        textview.set_bottom_margin(8);
        textview.set_left_margin(12);
        textview.set_right_margin(12);
        textview.set_vexpand(true);

        // Measure font
        let pango_ctx = textview.pango_context();
        let font_desc = pango_ctx.font_description().unwrap_or_else(|| {
            gtk4::pango::FontDescription::from_string("sans 13")
        });
        let size_pango = font_desc.size();
        let font_size = (size_pango as f64 / gtk4::pango::SCALE as f64).clamp(8.0, 48.0);
        eprintln!("Font size: {font_size}pt");

        let mut cache = emoji::EmojiCache::new();
        let scale = 2; // Retina

        // Helper: insert monospace text with tag
        let insert_mono = |text: &str| {
            let start_offset = buffer.end_iter().offset();
            let mut end = buffer.end_iter();
            buffer.insert(&mut end, text);
            let start_iter = buffer.iter_at_offset(start_offset);
            let end_iter = buffer.end_iter();
            buffer.apply_tag_by_name("mono", &start_iter, &end_iter);
        };

        // Insert emoji using the overlay approach: 2 spaces + overlay texture
        let mut insert_emoji_overlay = |emoji_str: &str| {
            if let Some(bmp) = cache.get_or_render(emoji_str, font_size, scale) {
                let bytes = glib::Bytes::from(&bmp.data);
                let tex = gtk4::gdk::MemoryTexture::new(
                    bmp.width, bmp.height,
                    gtk4::gdk::MemoryFormat::R8g8b8a8Premultiplied,
                    &bytes, (bmp.width as usize) * 4,
                );
                let natural_w = bmp.logical_width();
                let natural_h = bmp.logical_height();
                eprintln!("  {emoji_str}: natural_w={natural_w}, natural_h={natural_h}");
                emoji_overlay::EmojiTextView::insert_emoji(
                    &textview,
                    tex.upcast(),
                    scale,
                    2,  // monospace: 2 placeholder spaces
                    &["mono"],
                );
            }
        };

        // === Test 1: Single emoji per cell ===
        insert_mono("TEST 1: Single emoji per cell\n");
        insert_mono("┌──────────┬──────────┐\n");
        insert_mono("│ ABCDEFGH │ 12345678 │\n");
        insert_mono("├──────────┼──────────┤\n");

        for e in ["😀", "⭐", "🔥", "☕"] {
            insert_mono("│ ");
            insert_emoji_overlay(e);
            insert_mono("       │ ");
            insert_emoji_overlay(e);
            insert_mono("       │\n");
        }

        insert_mono("│ ABCDEFGH │ 12345678 │\n");
        insert_mono("└──────────┴──────────┘\n\n");

        // === Test 2: Multiple emojis per cell ===
        insert_mono("TEST 2: Multiple emojis per cell (the bug)\n");
        insert_mono("┌──────────┬──────────┐\n");
        insert_mono("│ ABCDEFGH │ 12345678 │\n");
        insert_mono("├──────────┼──────────┤\n");

        // 2 emojis per cell (4 display cols + 4 spaces = 8 content chars)
        insert_mono("│ ");
        insert_emoji_overlay("😀");
        insert_emoji_overlay("⭐");
        insert_mono("     │ ");
        insert_emoji_overlay("🔥");
        insert_emoji_overlay("☕");
        insert_mono("     │\n");

        // 3 emojis per cell (6 display cols + 2 spaces = 8 content chars)
        insert_mono("│ ");
        insert_emoji_overlay("😀");
        insert_emoji_overlay("⭐");
        insert_emoji_overlay("🔥");
        insert_mono("   │ ");
        insert_emoji_overlay("☕");
        insert_emoji_overlay("✅");
        insert_emoji_overlay("🌻");
        insert_mono("   │\n");

        // 4 emojis per cell (8 display cols = 8 content chars)
        insert_mono("│ ");
        insert_emoji_overlay("😀");
        insert_emoji_overlay("⭐");
        insert_emoji_overlay("🔥");
        insert_emoji_overlay("☕");
        insert_mono(" │ ");
        insert_emoji_overlay("✅");
        insert_emoji_overlay("🌻");
        insert_emoji_overlay("🎉");
        insert_emoji_overlay("❤\u{FE0F}");
        insert_mono(" │\n");

        insert_mono("│ ABCDEFGH │ 12345678 │\n");
        insert_mono("└──────────┴──────────┘\n\n");

        // === Test 3: Side by side comparison ===
        insert_mono("TEST 3: Alignment — text vs emoji\n");
        insert_mono("Text: XX XX XX XX XX\n");
        insert_mono("Emoj: ");
        for (i, e) in ["😀", "⭐", "🔥", "☕", "✅"].iter().enumerate() {
            insert_emoji_overlay(e);
            if i < 4 { insert_mono(" "); }
        }
        insert_mono("\n\n");

        // === Test 4: Many emojis in sequence ===
        insert_mono("TEST 4: 8 emojis in sequence\n");
        insert_mono("0123456789012345\n");
        for e in ["😀", "⭐", "🔥", "☕", "✅", "🌻", "🎉", "❤\u{FE0F}"] {
            insert_emoji_overlay(e);
        }
        insert_mono("\n");

        eprintln!("Overlay count: {}", textview.overlay_count());

        let scroll = gtk4::ScrolledWindow::builder()
            .vexpand(true)
            .child(&textview)
            .build();

        window.set_child(Some(&scroll));
        window.present();
    });

    app.run()
}
