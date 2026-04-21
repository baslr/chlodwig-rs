//! Chlodwig GTK — native macOS/Linux GUI for Chlodwig.

pub mod ansi;
pub mod app_state;
pub mod emoji;
pub mod md_renderer;
pub mod value_changed;
pub mod viewport;

/// Native macOS notifications via UNUserNotificationCenter.
#[cfg(target_os = "macos")]
pub mod notification;

/// First-launch setup (Finder Quick Action, project directory).
pub mod setup;
pub mod macos_clipboard;

// The window module depends on GTK4 at link-time. Only compile it when
// building the binary (not during `cargo test --lib` on machines without
// GTK4 runtime libraries). Tests for app_state are GTK-independent.
#[cfg(feature = "gtk-ui")]
pub mod emoji_overlay;
#[cfg(feature = "gtk-ui")]
pub mod sessions_window;
#[cfg(feature = "gtk-ui")]
pub mod window;

#[cfg(test)]
mod tests;

// Re-export from core so existing `chlodwig_gtk::format_numbered_lines` call sites keep working.
pub use chlodwig_core::format_numbered_lines;

// Re-export ScaledPaintable for use in examples and external code.
#[cfg(feature = "gtk-ui")]
pub use window::scaled_paintable::ScaledPaintable;

// ── GSK renderer selection ─────────────────────────────────────────
//
// On macOS, GskNglRenderer (the default since GTK 4.14) has a known issue:
//
//   UNSUPPORTED (log once): POSSIBLE ISSUE: unit 1 GLD_TEXTURE_INDEX_2D
//   is unloadable and bound to sampler type (Float) - using zero texture
//   because texture unloadable
//
// This means the glyph atlas texture that NGL creates cannot be loaded by
// the macOS OpenGL driver. The driver substitutes a "zero texture" (all
// transparent) → glyphs render as blank. This affects ALL text, not just
// emojis — any glyph that lands in the problematic texture unit becomes
// invisible.
//
// The GskCairoRenderer does not use OpenGL at all — it renders directly
// to a Cairo surface, bypassing the texture atlas issue entirely.
//
// **Recommendation**: Use `GSK_RENDERER=cairo` on macOS for reliable text
// rendering. The visual quality is identical (both paths use PangoCairo
// for text); the only difference is compositing (Cairo vs OpenGL).

/// Ensure the GSK renderer is set to Cairo on macOS.
///
/// The default GskNglRenderer on macOS has a texture-loading bug that
/// makes glyphs invisible ("GLD_TEXTURE_INDEX_2D is unloadable").
/// The Cairo renderer bypasses OpenGL entirely and renders text correctly.
///
/// Does nothing if `GSK_RENDERER` is already explicitly set by the user.
/// Does nothing on non-macOS platforms.
/// Must be called BEFORE GTK is initialized.
pub fn ensure_cairo_renderer() {
    #[cfg(target_os = "macos")]
    {
        if std::env::var("GSK_RENDERER").is_err() {
            std::env::set_var("GSK_RENDERER", "cairo");
        }
    }
}

// ── Pango backend selection ────────────────────────────────────────
//
// On macOS with MacPorts/Homebrew-installed GTK, PangoCairo has two backends:
//
// 1. **CoreText** (`PangoCairoCoreTextFontMap`): Uses Apple's CoreText for
//    font resolution. Maps geometric symbols (▶, →, ■) to system fonts
//    like Lucida Grande and .AppleSystemUIFont that render correctly through
//    Cairo. This is the PREFERRED backend.
//
// 2. **fontconfig** (`PangoCairoFcFontMap`): Uses FreeType + fontconfig.
//    Maps symbols like ▶ to Noto Color Emoji (if installed), which is a
//    color font that Cairo CANNOT render — resulting in invisible symbols.
//
// **Neither backend can render color emojis** with Pango 1.x. PangoCairo
// uses `cairo_show_glyphs()` for all text rendering. Cairo has no color
// font support — neither SBIX (Apple Color Emoji), CBDT (Noto bitmap),
// nor COLRv1 (Noto vector). The PangoHbFont color rendering path (which
// uses HarfBuzz to decompose COLRv1 into vector paths) only exists in
// Pango 2.x (PangoFontMap2). `pango_font_map_add_font_file()` in Pango
// 1.55 adds fonts to fontconfig's index but they're still rendered as
// PangoCairoFcFont — no color support.
//
// **Recommendation**: Use CoreText backend for best symbol rendering.
// Color emojis require either Pango 2.x or a paintable-based approach
// (inserting emoji images into the GtkTextBuffer).

/// Ensure PangoCairo uses the CoreText backend on macOS.
///
/// CoreText maps geometric symbols (▶, →, ■) to system fonts that render
/// correctly through Cairo. Without this, Pango 1.55+ may auto-select the
/// fontconfig backend which maps these symbols to color emoji fonts that
/// Cairo cannot render (resulting in invisible characters).
///
/// Does nothing if `PANGOCAIRO_BACKEND` is already explicitly set by the user.
/// Does nothing on non-macOS platforms.
/// Must be called BEFORE GTK/Pango is initialized.
pub fn ensure_coretext_backend() {
    #[cfg(target_os = "macos")]
    {
        if std::env::var("PANGOCAIRO_BACKEND").is_err() {
            std::env::set_var("PANGOCAIRO_BACKEND", "coretext");
        }
    }
}

/// Ensure PangoCairo uses the fontconfig backend on macOS.
///
/// **WARNING**: This makes geometric symbols (▶, →, ■) invisible because
/// fontconfig maps them to color emoji fonts that Cairo cannot render.
/// Prefer `ensure_coretext_backend()` instead.
///
/// Only useful if `pango_font_map_add_font_file()` support is needed
/// (requires fontconfig backend), but note that in Pango 1.x, fonts
/// loaded via `add_font_file()` are still PangoCairoFcFont with no
/// color rendering support.
///
/// Does nothing if `PANGOCAIRO_BACKEND` is already explicitly set by the user.
/// Must be called BEFORE GTK/Pango is initialized.
pub fn ensure_fontconfig_backend() {
    #[cfg(target_os = "macos")]
    {
        if std::env::var("PANGOCAIRO_BACKEND").is_err() {
            std::env::set_var("PANGOCAIRO_BACKEND", "fontconfig");
        }
    }
}

// ── Bundled COLRv1 emoji font ─────────────────────────────────────
//
// PangoCairo on macOS with MacPorts/Homebrew-installed GTK uses FreeType
// for font rendering. FreeType + Cairo cannot render color bitmap emoji
// fonts (SBIX for Apple Color Emoji, CBDT for Noto Color Emoji).
//
// Pango 1.52+ has a separate PangoHbFont code path that uses HarfBuzz
// to render COLRv1 (vector color) fonts. This path is activated when
// fonts are loaded via `pango_font_map_add_font_file()` instead of
// fontconfig. COLRv1 is a vector format — Cairo can render it without
// any special support because HarfBuzz decomposes the color layers into
// regular filled paths.
//
// We bundle the Noto COLRv1 emoji font (≈5 MB, from Google's noto-emoji
// repository) directly in the binary. At startup, it is extracted to a
// temporary path and registered with Pango via `add_font_file()`.

/// Raw bytes of the bundled Noto Color Emoji font (COLRv1 format).
///
/// This font contains color emoji glyphs in the COLR/CPAL vector format
/// which Pango/HarfBuzz can render even when Cairo's FreeType path has
/// no native color font support.
pub const NOTO_COLRV1_BYTES: &[u8] =
    include_bytes!("../resources/Noto-COLRv1.ttf");

/// Extract the bundled emoji font to `dir/Noto-COLRv1.ttf` and return
/// the path. If the file already exists with the correct size, skip the
/// write (idempotent).
pub fn extract_bundled_emoji_font_to(dir: &std::path::Path) -> std::path::PathBuf {
    let path = dir.join("Noto-COLRv1.ttf");
    let needs_write = match std::fs::metadata(&path) {
        Ok(m) => m.len() != NOTO_COLRV1_BYTES.len() as u64,
        Err(_) => true,
    };
    if needs_write {
        let _ = std::fs::create_dir_all(dir);
        let _ = std::fs::write(&path, NOTO_COLRV1_BYTES);
    }
    path
}

/// Extract the bundled emoji font to `~/.chlodwig-rs/fonts/` and return the path.
pub fn extract_bundled_emoji_font() -> Option<std::path::PathBuf> {
    let dir = dirs::home_dir()?.join(".chlodwig-rs").join("fonts");
    Some(extract_bundled_emoji_font_to(&dir))
}

// ── Bundled Sarasa Mono J font ────────────────────────────────────
//
// `unicode-width` reports CJK characters as 2 columns wide and box-drawing
// as 1 column. The markdown table renderer reserves border geometry
// assuming each CJK glyph occupies exactly 2 monospace cells AND box-drawing
// glyphs (│ ─ ┌ ┐ └ ┘ ┬ ┴ ├ ┤ ┼) occupy exactly 1 cell. Both must hold
// at the rendered-pixel level for tables to align.
//
// Most system Latin monospace fonts (SF Mono, JetBrains Mono, etc.) have
// no CJK glyphs → Pango falls back to a proportional CJK font → CJK glyph
// advance ≠ 2× Latin advance → `│` separators wander.
//
// Noto Sans Mono CJK JP solves the CJK side BUT has fullwidth box-drawing
// glyphs (12 px instead of 6 px @ 12 pt), so border rows render twice as
// wide as content rows → also broken.
//
// We bundle `SarasaMonoJ-Regular.ttf` (~26 MB; Iosevka Latin + Source Han
// Sans Japanese, pre-merged with consistent metrics):
//   * Latin / ASCII / Box-Drawing: 6 px advance @ 12 pt (halfwidth, 1 col)
//   * CJK Han / Hiragana / Katakana / Hangul: 12 px advance (fullwidth, 2 cols)
//   * Compact line-height: 15 px @ 12 pt (no vertical gaps in tables)
//
// Registration strategy:
//   * **macOS**: install into `~/Library/Fonts/` (CoreText scans this
//     directory at process start). Process-scope `CTFontManagerRegister*`
//     turned out to be invisible to PangoCairo because the font cache is
//     built before our registration takes effect.
//   * **Linux**: install into `~/.local/share/fonts/` (fontconfig).
//   * **Windows**: not auto-installed yet.

/// Raw bytes of the bundled Sarasa Mono J font (TrueType).
///
/// Sarasa Mono J = Iosevka (Latin) + Source Han Sans (CJK), pre-merged
/// into ONE font with metric-compatible glyphs:
///   * Latin / ASCII / Box-Drawing: 6 px advance @ 12 pt (halfwidth)
///   * CJK Han / Hiragana / Katakana / Hangul: 12 px advance (fullwidth, exactly 2× halfwidth)
///   * Compact line-height: 15 px @ 12 pt (vs 17.4 px for Noto Mono CJK JP)
///
/// This is the ONLY font used for monospace rendering. Because all glyphs
/// (Latin AND CJK AND box-drawing) come from the same font with consistent
/// 1:2 metrics, table borders (`│ ─ ┌ ┐ └ ┘ ┬ ┴ ├ ┤ ┼`) align perfectly
/// regardless of cell content.
///
/// Replaced the previous Noto Sans Mono CJK JP, which had a critical bug
/// for our use case: its box-drawing glyphs are FULLWIDTH (12 px), causing
/// border lines to be twice as wide as content lines.
pub const SARASA_MONO_J_BYTES: &[u8] =
    include_bytes!("../resources/SarasaMonoJ-Regular.ttf");

/// Pango family name used for ALL monospace TextTags / FontDescriptions
/// in the GTK frontend.
///
/// Single font: Sarasa Mono J covers Latin, CJK, and Box-Drawing with
/// consistent metric-compatible halfwidth/fullwidth glyphs. No fallback
/// chain needed — keeping it single-family avoids any risk of Pango
/// itemizing runs across fonts with mismatched metrics (which would
/// re-introduce the column-alignment problems we had with mixed fonts).
pub const MONO_FONT_FAMILY: &str = "Sarasa Mono J";

/// Extract the bundled Sarasa Mono J font to `dir/SarasaMonoJ-Regular.ttf`
/// and return the path. Idempotent — skips writing if the file already
/// exists with the correct size.
pub fn extract_bundled_cjk_font_to(dir: &std::path::Path) -> std::path::PathBuf {
    let path = dir.join("SarasaMonoJ-Regular.ttf");
    let needs_write = match std::fs::metadata(&path) {
        Ok(m) => m.len() != SARASA_MONO_J_BYTES.len() as u64,
        Err(_) => true,
    };
    if needs_write {
        let _ = std::fs::create_dir_all(dir);
        let _ = std::fs::write(&path, SARASA_MONO_J_BYTES);
    }
    path
}

/// Extract the bundled Sarasa Mono J font to `~/.chlodwig-rs/fonts/`
/// and return the path.
pub fn extract_bundled_cjk_font() -> Option<std::path::PathBuf> {
    let dir = dirs::home_dir()?.join(".chlodwig-rs").join("fonts");
    Some(extract_bundled_cjk_font_to(&dir))
}

/// Return the user's standard font installation directory.
///
/// This is the directory where end-user fonts go so that CoreText
/// (macOS), fontconfig (Linux), and the Windows font subsystem pick
/// them up automatically at process start.
///
///   * macOS:  `~/Library/Fonts`
///   * Linux:  `~/.local/share/fonts`
///   * Other:  `None` (we don't auto-install on Windows yet)
pub fn user_font_dir() -> Option<std::path::PathBuf> {
    let home = dirs::home_dir()?;
    #[cfg(target_os = "macos")]
    {
        Some(home.join("Library").join("Fonts"))
    }
    #[cfg(target_os = "linux")]
    {
        Some(home.join(".local").join("share").join("fonts"))
    }
    #[cfg(not(any(target_os = "macos", target_os = "linux")))]
    {
        let _ = home;
        None
    }
}

/// Install the bundled CJK font into `dir` (typically the user's font
/// directory from [`user_font_dir`]). Returns the installed file path.
///
/// Idempotent: if the file already exists with the correct size, the
/// write is skipped (preserves mtime, no I/O).
///
/// **Why install instead of process-scope register**: CoreText's
/// `CTFontManagerRegisterFontsForURL(scope=Process)` adds the font to
/// the running process's CoreText font collection, but Pango's CoreText
/// backend builds its `PangoCairoCoreTextFontMap` *before* our
/// registration takes effect (or caches it without a refresh hook),
/// so process-scope registration was invisible to GTK in practice.
/// Installing the font into `~/Library/Fonts` makes it visible to
/// CoreText at process start — same path the system uses for normal
/// user-installed fonts.
pub fn install_bundled_cjk_font_to(
    dir: &std::path::Path,
) -> std::io::Result<std::path::PathBuf> {
    let path = dir.join("SarasaMonoJ-Regular.ttf");
    let needs_write = match std::fs::metadata(&path) {
        Ok(m) => m.len() != SARASA_MONO_J_BYTES.len() as u64,
        Err(_) => true,
    };
    if needs_write {
        std::fs::create_dir_all(dir)?;
        // Atomic write: write to .tmp, then rename — prevents a partially
        // written font from existing if we crash mid-write.
        let tmp = dir.join("SarasaMonoJ-Regular.ttf.tmp");
        std::fs::write(&tmp, SARASA_MONO_J_BYTES)?;
        std::fs::rename(&tmp, &path)?;
    }
    Ok(path)
}

/// Install the bundled CJK font into the user's standard font directory.
///
/// Returns `None` on platforms without a known user font directory
/// (currently anything besides macOS/Linux), or `Some(Err(…))` if the
/// install failed (disk full, permission denied, …).
pub fn install_bundled_cjk_font() -> Option<std::io::Result<std::path::PathBuf>> {
    let dir = user_font_dir()?;
    Some(install_bundled_cjk_font_to(&dir))
}

// ── Application CSS ────────────────────────────────────────────────
//
// GTK-independent constant so it can be tested without a display server.
// The `window` module loads this via `CssProvider` at startup.

/// Global CSS applied to the Chlodwig GTK application.
///
/// Key purpose: Add emoji font families to the font fallback chain.
/// Without this, Pango/fontconfig on macOS does **not** include
/// "Apple Color Emoji" in the default "sans" fallback list, so all
/// emoji characters render as empty boxes (tofu).
///
/// On Linux, "Noto Color Emoji" is the standard emoji font.
/// On Windows, "Segoe UI Emoji" is the standard.
pub const APP_CSS: &str = r#"
textview text {
    font-family: -apple-system, "Cantarell", "Noto Sans", "Segoe UI",
                 "Apple Color Emoji", "Noto Color Emoji", "Segoe UI Emoji",
                 sans-serif;
}

.monospace, textview text.monospace {
    font-family: "Sarasa Mono J", monospace,
                 "Apple Color Emoji", "Noto Color Emoji", "Segoe UI Emoji";
}
"#;
