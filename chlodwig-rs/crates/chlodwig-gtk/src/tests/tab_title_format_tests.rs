//! Tab title format (issue: "Tab Name muss '🤖 {session name} ・ {cwd}' sein").
//!
//! Currently the `adw::TabPage` title shows just the cwd basename (e.g.
//! "chlodwig-rs"). The new format adds a robot emoji prefix (it's an AI
//! tab — visually distinguishes from future Browser/Terminal/File tabs)
//! and includes the session name when one is set.
//!
//! Format:
//!   - With session name:  `🤖 {session_name} ・ {cwd_basename}`
//!   - Without name:       `🤖 {cwd_basename}`
//!
//! Separator: U+30FB KATAKANA MIDDLE DOT (full-width middle dot — same as
//! the window-title separator in `format_window_title`).
//!
//! ── SSoT ───────────────────────────────────────────────────────────────
//!
//! - `format_tab_title(session_name, cwd_basename) -> String` lives in
//!   `window.rs` (alongside `format_window_title`). One pure function, no
//!   widget dependency, fully unit-testable here.
//! - `AiConversationTab::refresh_tab_title()` calls
//!   `page.set_title(&format_tab_title(...))`. Called from every site that
//!   mutates `session_name` or `cwd`.

use crate::window::format_tab_title;

#[test]
fn test_format_tab_title_with_session_name() {
    let s = format_tab_title(Some("my-session"), Some("chlodwig-rs"));
    assert_eq!(s, "🤖 my-session \u{30FB} chlodwig-rs");
}

#[test]
fn test_format_tab_title_without_session_name() {
    let s = format_tab_title(None, Some("chlodwig-rs"));
    assert_eq!(s, "🤖 chlodwig-rs");
}

#[test]
fn test_format_tab_title_empty_session_name_treated_as_none() {
    let s = format_tab_title(Some(""), Some("chlodwig-rs"));
    assert_eq!(
        s, "🤖 chlodwig-rs",
        "empty string session_name must be treated like None — no \
         leading separator, no trailing separator"
    );
}

#[test]
fn test_format_tab_title_no_cwd_basename() {
    let s = format_tab_title(Some("my-session"), None);
    assert_eq!(s, "🤖 my-session");
}

#[test]
fn test_format_tab_title_no_cwd_no_name() {
    let s = format_tab_title(None, None);
    assert_eq!(
        s, "🤖",
        "with neither session name nor cwd, the title is just the robot \
         emoji (better than '🤖 (no project)' which is verbose for a tab)"
    );
}

#[test]
fn test_format_tab_title_uses_katakana_middle_dot_not_ascii_dot() {
    let s = format_tab_title(Some("a"), Some("b"));
    assert!(
        s.contains('\u{30FB}'),
        "must use U+30FB KATAKANA MIDDLE DOT (full width), not ASCII '.', \
         '·', or '•' — got: {s:?}"
    );
    assert!(!s.contains(" . "), "must not use ASCII dot");
}

#[test]
fn test_format_tab_title_robot_emoji_first() {
    let s = format_tab_title(Some("name"), Some("cwd"));
    assert!(
        s.starts_with("🤖 "),
        "tab title must start with '🤖 ' so it's visually distinct from \
         future Browser / Terminal / File tabs (each kind gets its own \
         emoji prefix). Got: {s:?}"
    );
}

#[test]
fn test_format_tab_title_utf8_session_name() {
    let s = format_tab_title(Some("日本語"), Some("chlodwig-rs"));
    assert_eq!(s, "🤖 日本語 \u{30FB} chlodwig-rs");
}

// ── Wiring: AiConversationTab uses format_tab_title ───────────────────

#[test]
fn test_ai_conversation_tab_uses_format_tab_title() {
    // Source-grep guard: the AI tab must call `format_tab_title(...)` to
    // build the page title, NOT a hand-rolled inline format string.
    let src = include_str!("../tab/ai_conversation.rs");
    assert!(
        src.contains("format_tab_title("),
        "tab/ai_conversation.rs must call `window::format_tab_title(...)` \
         to build the `adw::TabPage` title — single source of truth for \
         the tab-title format"
    );
}

#[test]
fn test_ai_conversation_tab_has_refresh_tab_title_method() {
    // Source-grep guard: there must be a single method that re-applies
    // the format (called after session_name changes via submit.rs's
    // /name command, after restore, after /clear, etc.).
    let src = include_str!("../tab/ai_conversation.rs");
    assert!(
        src.contains("fn refresh_tab_title"),
        "AiConversationTab must expose `fn refresh_tab_title(&self)` — \
         the single point where `page.set_title(...)` happens. Sites that \
         mutate session_name or cwd call this to keep the tab tab in sync."
    );
}

#[test]
fn test_submit_refreshes_tab_title_after_name_change() {
    // The /name submit command sets `state.session_name`; after that it
    // must trigger a tab-title refresh, otherwise the tab keeps showing
    // the old (or empty) name until the next focus change.
    let src = include_str!("../submit.rs");
    assert!(
        src.contains("refresh_tab_title")
            || src.contains("AiConversationTab::format_tab_title")
            || src.contains("set_title"),
        "submit.rs must refresh the tab title after a session-name change \
         (call `refresh_tab_title()` on the AI tab, or set the page \
         title directly via the format_tab_title helper)"
    );
}
