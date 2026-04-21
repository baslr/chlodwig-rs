//! Global UI font: Sarasa UI J for everything except monospace regions.
//!
//! User requirement: ONE proportional font everywhere in the chrome —
//! input view, buttons, popovers, headerbar, TabBar, status bar, the
//! lot. Monospace regions in the Output (code blocks, tables, code
//! spans) keep `Sarasa Mono J`. Emojis go through Apple Color Emoji
//! (and platform fallbacks) at the end of the font-family chain.
//!
//! Why Sarasa UI J specifically: it is the UI-optimized variant of the
//! Sarasa family — same Iosevka Latin + Source Han Sans CJK glyph set
//! as Sarasa Mono J, but proportional and with a tighter line-height
//! suitable for buttons/labels/tabs (Sarasa Gothic J's line-height is
//! tuned for body text and would make GTK chrome visibly taller).
//! Bundled as `SarasaUiJ-Regular.ttf` (~24 MB).

use crate::APP_CSS;

#[test]
fn test_sarasa_ui_j_bytes_constant_exists_and_is_valid_truetype() {
    let bytes: &[u8] = crate::SARASA_UI_J_BYTES;
    assert!(!bytes.is_empty(), "SARASA_UI_J_BYTES must not be empty");
    // Reasonable size guard: ~24 MB. Bail if someone replaces the
    // bundle with a stub or accidentally truncates it.
    assert!(
        bytes.len() > 15_000_000 && bytes.len() < 40_000_000,
        "SARASA_UI_J_BYTES size suspicious: {} bytes (expected ~24 MB)",
        bytes.len()
    );
    // TrueType outline magic: 0x00010000.
    assert_eq!(
        &bytes[..4],
        &[0x00, 0x01, 0x00, 0x00],
        "SarasaUiJ-Regular.ttf must start with TrueType magic 0x00010000"
    );
}

#[test]
fn test_ui_font_family_constant_is_sarasa_ui_j() {
    let family: &str = crate::UI_FONT_FAMILY;
    assert_eq!(
        family, "Sarasa UI J",
        "UI_FONT_FAMILY must be exactly \"Sarasa UI J\" (the Pango family \
         name installed from the bundled SarasaUiJ-Regular.ttf)"
    );
}

#[test]
fn test_ui_font_family_is_single_family_no_chain() {
    // Same reasoning as `MONO_FONT_FAMILY`: when a `family()` call goes
    // straight on a TextTag / FontDescription (bypassing CSS), Pango
    // accepts only ONE family name. Comma-separated chains here would
    // be silently treated as a literal family name including the comma
    // and never resolve. Keep it a bare family name.
    assert!(
        !crate::UI_FONT_FAMILY.contains(','),
        "UI_FONT_FAMILY must be a single family name (no comma chain). \
         Was: {:?}", crate::UI_FONT_FAMILY
    );
}

#[test]
fn test_install_bundled_ui_font_to_creates_file() {
    let dir = tempfile::tempdir().unwrap();
    let path = crate::install_bundled_ui_font_to(dir.path())
        .expect("install must succeed in tempdir");
    assert_eq!(path.parent(), Some(dir.path()));
    assert_eq!(
        path.file_name().and_then(|s| s.to_str()),
        Some("SarasaUiJ-Regular.ttf"),
        "Bundled UI font must be installed as SarasaUiJ-Regular.ttf"
    );
    let meta = std::fs::metadata(&path).unwrap();
    assert_eq!(
        meta.len(),
        crate::SARASA_UI_J_BYTES.len() as u64,
        "Installed file size must match embedded bytes"
    );
}

#[test]
fn test_install_bundled_ui_font_to_is_idempotent() {
    let dir = tempfile::tempdir().unwrap();
    let p1 = crate::install_bundled_ui_font_to(dir.path()).unwrap();
    let p2 = crate::install_bundled_ui_font_to(dir.path()).unwrap();
    assert_eq!(p1, p2);
}

#[test]
fn test_install_bundled_ui_font_to_skips_when_correct_file_exists() {
    let dir = tempfile::tempdir().unwrap();
    let target = dir.path().join("SarasaUiJ-Regular.ttf");
    std::fs::write(&target, crate::SARASA_UI_J_BYTES).unwrap();
    let mtime_before = std::fs::metadata(&target).unwrap().modified().unwrap();
    std::thread::sleep(std::time::Duration::from_millis(20));
    let _ = crate::install_bundled_ui_font_to(dir.path()).unwrap();
    let mtime_after = std::fs::metadata(&target).unwrap().modified().unwrap();
    assert_eq!(
        mtime_before, mtime_after,
        "must NOT rewrite when correct file already exists (idempotency)"
    );
}

#[test]
fn test_install_bundled_ui_font_to_overwrites_when_size_differs() {
    let dir = tempfile::tempdir().unwrap();
    let target = dir.path().join("SarasaUiJ-Regular.ttf");
    std::fs::write(&target, b"stub bytes").unwrap();
    let _ = crate::install_bundled_ui_font_to(dir.path()).unwrap();
    let meta = std::fs::metadata(&target).unwrap();
    assert_eq!(
        meta.len(),
        crate::SARASA_UI_J_BYTES.len() as u64,
        "must overwrite stale/incorrect file"
    );
}

#[test]
fn test_app_css_global_rule_uses_ui_font() {
    // ONE global `*` rule that paints every widget with Sarasa UI J +
    // emoji fallback. `!important` is required so libadwaita's
    // per-widget rules (e.g. `button { font-family: -gtk-system-font; }`,
    // specificity 0,0,1) don't beat our universal selector (0,0,0).
    assert!(
        APP_CSS.contains("* {") || APP_CSS.contains("*{"),
        "APP_CSS must contain a universal `*` rule.\nWas:\n{}",
        APP_CSS.as_str()
    );
    let star_idx = APP_CSS
        .find("* {")
        .or_else(|| APP_CSS.find("*{"))
        .unwrap();
    let close = star_idx
        + APP_CSS[star_idx..]
            .find('}')
            .expect("`*` rule must have a closing brace");
    let body = &APP_CSS[star_idx..=close];
    assert!(
        body.contains("Sarasa UI J"),
        "Global `*` rule must list \"Sarasa UI J\".\nWas:\n{body}"
    );
    assert!(
        body.contains("Apple Color Emoji")
            || body.contains("Noto Color Emoji")
            || body.contains("Segoe UI Emoji"),
        "Global `*` rule must include an emoji font fallback.\nWas:\n{body}"
    );
    assert!(
        body.contains("!important"),
        "Global `*` rule must use `!important` so it beats libadwaita's \
         per-widget font-family rules.\nWas:\n{body}"
    );
    let ui_pos = body.find("Sarasa UI J").unwrap();
    let emoji_pos = body
        .find("Apple Color Emoji")
        .or_else(|| body.find("Noto Color Emoji"))
        .unwrap();
    assert!(
        ui_pos < emoji_pos,
        "Sarasa UI J must come BEFORE the emoji font (Pango walks the \
         chain left-to-right and picks the first font that has the glyph)"
    );
}

#[test]
fn test_app_css_keeps_monospace_for_mono_regions() {
    // The user explicitly said: "Im Output halt dort wo mono ist
    // bleibt mono". Code blocks and tables in the Output are rendered
    // via TextTags with `.family(MONO_FONT_FAMILY)` — those TextTag
    // values override CSS, so the mono family is enforced regardless
    // of CSS. But the `.monospace` CSS rule still exists for any GTK
    // widget that adds the `.monospace` style class itself.
    //
    // We assert that "Sarasa Mono J" still appears somewhere in the
    // CSS (whether in `.monospace` or anywhere else) so monospace
    // regions are NOT silently switched to Sarasa UI J via CSS
    // overrides.
    assert!(
        APP_CSS.contains("Sarasa Mono J"),
        "APP_CSS must still reference Sarasa Mono J for monospace \
         regions.\nWas:\n{}",
        APP_CSS.as_str()
    );
}

#[test]
fn test_main_rs_installs_ui_font_at_startup() {
    // Symmetric to `install_bundled_cjk_font`: main.rs must call the
    // UI install at startup so the font is available to CoreText /
    // fontconfig before any window opens. Tracing must already be
    // initialized so install errors land in the debug log.
    let main_src = include_str!("../main.rs");
    let install_pos = main_src
        .find("install_bundled_ui_font")
        .expect(
            "main.rs must call install_bundled_ui_font* to copy the \
             bundled Sarasa UI J font into the user font directory",
        );
    let tracing_init_pos = main_src
        .find("tracing_subscriber::fmt()")
        .expect("main.rs must initialize tracing");
    assert!(
        tracing_init_pos < install_pos,
        "tracing must be initialized BEFORE the UI font install so install \
         errors are visible in the log."
    );
}

#[test]
fn test_app_css_built_from_constants_no_hardcoded_family_names() {
    // SSoT: every font family that appears in APP_CSS must also have a
    // dedicated constant (`UI_FONT_FAMILY` or `MONO_FONT_FAMILY`),
    // and the family literal must appear EXACTLY ONCE in lib.rs (the
    // constant definition). If APP_CSS hard-codes a second copy of
    // either name, this test fails.
    let lib_src = include_str!("../lib.rs");
    let ui_count = lib_src.matches(r#""Sarasa UI J""#).count();
    let mono_count = lib_src.matches(r#""Sarasa Mono J""#).count();
    assert_eq!(
        ui_count, 1,
        "`\"Sarasa UI J\"` must appear EXACTLY ONCE in lib.rs (the \
         UI_FONT_FAMILY constant). Found {ui_count} occurrences."
    );
    assert_eq!(
        mono_count, 1,
        "`\"Sarasa Mono J\"` must appear EXACTLY ONCE in lib.rs (the \
         MONO_FONT_FAMILY constant). Found {mono_count} occurrences."
    );
}

// ── libadwaita TabBar font override ─────────────────────────────────
//
// Regression for: GTK Inspector showed `font-family: .AppleSystemUIFont`
// on tab-title labels even though APP_CSS declares
// `* { font-family: "Sarasa UI J" !important; }`. Result: U+30FB
// (KATAKANA MIDDLE DOT) in the tab title rendered as tofu, because
// .AppleSystemUIFont has no glyph for it.
//
// Root cause: libadwaita ships its own per-widget rule for the TabBar
// node tree (something like `tabbar tab { font-family: -gtk-system-font;
// }`, specificity 0,0,2). When BOTH our rule AND libadwaita's rule
// carry `!important`, CSS specificity decides the winner. Specificity
// 0,0,2 > 0,0,0 → libadwaita wins → SystemUIFont → tofu.
//
// Fix: an explicit selector chain matching the libadwaita TabBar
// nodes, with our `!important`. Same family list as the global rule.
// This restores commit 4b195e2's behavior, which was lost in 8c03ce9
// (the migration to a single `*` rule).

#[test]
fn test_app_css_has_explicit_tabbar_rule_to_beat_libadwaita() {
    // The selector must target the libadwaita TabBar node tree so it
    // has equal-or-higher specificity than libadwaita's own per-widget
    // rule (which would otherwise win the !important duel).
    assert!(
        APP_CSS.contains("tabbar"),
        "APP_CSS must contain an explicit `tabbar` selector to override \
         libadwaita's per-widget TabBar font rule (otherwise tab titles \
         render with .AppleSystemUIFont and U+30FB tofus).\nWas:\n{}",
        APP_CSS.as_str()
    );
}

#[test]
fn test_app_css_tabbar_rule_uses_ui_font_with_important() {
    // Find the rule containing `tabbar` and verify it lists
    // "Sarasa UI J" + `!important`.
    let tabbar_idx = APP_CSS
        .find("tabbar")
        .expect("APP_CSS must contain a `tabbar` selector");
    // Walk back to the start of the selector list (after the previous
    // `}` or start of file).
    let rule_start = APP_CSS[..tabbar_idx]
        .rfind('}')
        .map(|i| i + 1)
        .unwrap_or(0);
    let rule_end = tabbar_idx
        + APP_CSS[tabbar_idx..]
            .find('}')
            .expect("`tabbar` rule must have a closing brace");
    let rule = &APP_CSS[rule_start..=rule_end];
    assert!(
        rule.contains("Sarasa UI J"),
        "`tabbar` rule must list Sarasa UI J.\nWas:\n{rule}"
    );
    assert!(
        rule.contains("!important"),
        "`tabbar` rule must use !important to beat libadwaita's per-widget \
         rule (which is also !important and has higher specificity than \
         our `*` selector).\nWas:\n{rule}"
    );
}

// ── GtkSettings:gtk-font-name override ──────────────────────────────
//
// Regression for: even with `* !important` AND an explicit
// `tabbar tab .title !important` rule, the GTK Inspector still showed
// `font-family: .AppleSystemUIFont` on tab titles → U+30FB tofu.
//
// Verified via Inspector live-CSS: replacing the family with
// "Comic Sans MS" via the same selectors did NOT change the tab
// title rendering. Conclusion: libadwaita renders TabBar labels via
// a code path that is not reachable by our CSS selectors (probably
// internal Pango FontDescription on a custom widget).
//
// Robust fix: set `GtkSettings:gtk-font-name` to the bundled
// Sarasa UI J family. This is the canonical GTK4 way to set the
// global default UI font; it propagates to widgets that use the
// system font directly (incl. libadwaita's TabBar internals) and
// is not subject to CSS specificity duels.
//
// Implementation in `lib.rs::ensure_ui_font_setting`.

#[test]
fn test_lib_has_ensure_ui_font_setting_function() {
    let lib_src = include_str!("../lib.rs");
    assert!(
        lib_src.contains("pub fn ensure_ui_font_setting"),
        "lib.rs must expose `ensure_ui_font_setting()` to set \
         GtkSettings:gtk-font-name to the bundled Sarasa UI J. \
         CSS-only override does not reach libadwaita's TabBar."
    );
}

#[test]
fn test_ensure_ui_font_setting_uses_settings_default() {
    let lib_src = include_str!("../lib.rs");
    let fn_idx = lib_src
        .find("pub fn ensure_ui_font_setting")
        .expect("function must exist");
    let fn_end = fn_idx
        + lib_src[fn_idx..]
            .find("\n}\n")
            .expect("function must end with `\\n}\\n`");
    let body = &lib_src[fn_idx..=fn_end];
    assert!(
        body.contains("Settings::default") || body.contains("settings_default"),
        "ensure_ui_font_setting must obtain the default Settings. \
         Body was:\n{body}"
    );
    assert!(
        body.contains("set_gtk_font_name") || body.contains("gtk-font-name"),
        "ensure_ui_font_setting must set `gtk-font-name` on the Settings. \
         Body was:\n{body}"
    );
    assert!(
        body.contains("UI_FONT_FAMILY"),
        "ensure_ui_font_setting must use the UI_FONT_FAMILY constant \
         (SSoT). Body was:\n{body}"
    );
}

#[test]
fn test_main_calls_ensure_ui_font_setting_after_install_and_after_gtk_init() {
    // Order matters: GtkSettings::default() requires GTK to be
    // initialized (an Application's connect_startup or first window
    // build is OK; before app.run() is too early on some paths).
    // We assert the call site exists; ordering relative to `app.run()`
    // is enforced by the lookup landing inside `activate(...)` (not
    // in `main()` itself).
    let main_src = include_str!("../main.rs");
    assert!(
        main_src.contains("ensure_ui_font_setting"),
        "main.rs must call ensure_ui_font_setting() so the GTK default \
         UI font is set to Sarasa UI J before any TabBar is rendered."
    );
}

// ── gtk-font-name must include a size token ─────────────────────────
//
// Regression for: setting `gtk-font-name` to just "Sarasa UI J" (no
// size) made GTK fall back to its hardcoded 10pt default for
// `font-size`, shrinking everything in the Output to mini.
// Pango font descriptions are "Family [Style] Size"; without a
// numeric size token Pango leaves size unspecified.
//
// Fix: ensure_ui_font_setting must read the existing size from the
// platform default and pass `"Sarasa UI J <size>"` so we ONLY override
// the family.

#[test]
fn test_ensure_ui_font_setting_preserves_size_token() {
    let lib_src = include_str!("../lib.rs");
    let fn_idx = lib_src
        .find("pub fn ensure_ui_font_setting")
        .expect("function must exist");
    let fn_end = fn_idx
        + lib_src[fn_idx..]
            .find("\n}\n")
            .expect("function must end with `\\n}\\n`");
    let body = &lib_src[fn_idx..=fn_end];
    // Must read the previous gtk_font_name (or parse FontDescription)
    // to recover the platform default size.
    assert!(
        body.contains("gtk_font_name") && body.contains("FontDescription"),
        "ensure_ui_font_setting must read the previous gtk_font_name \
         and parse it as a Pango FontDescription to recover the \
         platform default size. Body was:\n{body}"
    );
    // Must build a "Family <size>" string, not just the family.
    assert!(
        body.contains("format!"),
        "ensure_ui_font_setting must format `\"<family> <size>\"` so \
         GTK does NOT fall back to its hardcoded 10pt default for \
         font-size. Body was:\n{body}"
    );
}

// ── Sarasa UI J Bold bundle ─────────────────────────────────────────
//
// Regression for: setting `gtk-font-name = "Sarasa UI J <size>"` made
// the user-message bold tag fall back to Regular because the bundled
// Sarasa UI J only contained the Regular weight. CoreText could not
// resolve "Sarasa UI J Bold" → no bold rendering for the User-prompt
// label in the Output.
//
// Fix: bundle SarasaUiJ-Bold.ttf alongside the Regular file and
// install it into the user font directory at startup so CoreText /
// fontconfig know about the bold weight before the first window opens.

#[test]
fn test_sarasa_ui_j_bold_bytes_constant_exists_and_is_valid_truetype() {
    let bytes: &[u8] = crate::SARASA_UI_J_BOLD_BYTES;
    assert!(!bytes.is_empty(), "SARASA_UI_J_BOLD_BYTES must not be empty");
    assert!(
        bytes.len() > 15_000_000 && bytes.len() < 40_000_000,
        "SARASA_UI_J_BOLD_BYTES size suspicious: {} bytes (expected ~24 MB)",
        bytes.len()
    );
    assert_eq!(
        &bytes[..4],
        &[0x00, 0x01, 0x00, 0x00],
        "SarasaUiJ-Bold.ttf must start with TrueType magic 0x00010000"
    );
}

#[test]
fn test_install_bundled_ui_bold_font_to_creates_file() {
    let dir = tempfile::tempdir().unwrap();
    let path = crate::install_bundled_ui_bold_font_to(dir.path())
        .expect("install must succeed in tempdir");
    assert_eq!(
        path.file_name().and_then(|s| s.to_str()),
        Some("SarasaUiJ-Bold.ttf"),
        "Bundled UI Bold font must be installed as SarasaUiJ-Bold.ttf"
    );
    let meta = std::fs::metadata(&path).unwrap();
    assert_eq!(
        meta.len(),
        crate::SARASA_UI_J_BOLD_BYTES.len() as u64,
        "Installed file size must match embedded bytes"
    );
}

#[test]
fn test_install_bundled_ui_bold_font_to_is_idempotent() {
    let dir = tempfile::tempdir().unwrap();
    let p1 = crate::install_bundled_ui_bold_font_to(dir.path()).unwrap();
    let p2 = crate::install_bundled_ui_bold_font_to(dir.path()).unwrap();
    assert_eq!(p1, p2);
    let target = dir.path().join("SarasaUiJ-Bold.ttf");
    let mtime_before = std::fs::metadata(&target).unwrap().modified().unwrap();
    std::thread::sleep(std::time::Duration::from_millis(20));
    let _ = crate::install_bundled_ui_bold_font_to(dir.path()).unwrap();
    let mtime_after = std::fs::metadata(&target).unwrap().modified().unwrap();
    assert_eq!(mtime_before, mtime_after, "must NOT rewrite when correct file exists");
}

#[test]
fn test_main_rs_installs_ui_bold_font_at_startup() {
    let main_src = include_str!("../main.rs");
    assert!(
        main_src.contains("install_bundled_ui_bold_font"),
        "main.rs must call install_bundled_ui_bold_font* so the bold \
         weight is on disk before the first TabBar/Output renders. \
         Without this, the user-message bold tag falls back to Regular."
    );
}
