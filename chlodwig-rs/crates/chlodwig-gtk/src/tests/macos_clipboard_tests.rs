//! Tests for the macOS NSPasteboard bridge (`crate::macos_clipboard`).
//!
//! Why this exists: GTK4 on macOS uses its own `GdkClipboard`, which is
//! NOT synchronized with the system `NSPasteboard`. Without this bridge,
//! Cmd+V in Chlodwig only sees text copied within the same GTK app, and
//! Cmd+C in Chlodwig is invisible to native macOS apps. This module is
//! the single source of truth for "talk to the macOS general pasteboard".
//!
//! Round-trip tests touch the actual system pasteboard — they trample
//! the user's clipboard, so they are `#[ignore]`d and only run on
//! demand. AppKit's NSPasteboard is not thread-safe under concurrent
//! load from cargo's parallel test harness, so use `--test-threads=1`:
//!
//!     cargo test -p chlodwig-gtk tests::macos_clipboard \
//!         -- --ignored --test-threads=1
//!
//! The non-ignored tests (source-grep guards + non-macOS fallback)
//! always run as part of `cargo t`.

use crate::macos_clipboard;

#[test]
#[ignore = "trampoline-writes the user's system clipboard; run with --ignored"]
#[cfg(target_os = "macos")]
fn test_write_then_read_round_trips_ascii() {
    let payload = "hello chlodwig";
    assert!(macos_clipboard::write_string(payload));
    let got = macos_clipboard::read_string();
    assert_eq!(got.as_deref(), Some(payload));
}

#[test]
#[ignore = "trampoline-writes the user's system clipboard; run with --ignored"]
#[cfg(target_os = "macos")]
fn test_write_then_read_round_trips_utf8() {
    let payload = "häuser & 漢字 🚀\nzweite zeile";
    assert!(macos_clipboard::write_string(payload));
    let got = macos_clipboard::read_string();
    assert_eq!(got.as_deref(), Some(payload));
}

#[test]
#[ignore = "trampoline-writes the user's system clipboard; run with --ignored"]
#[cfg(target_os = "macos")]
fn test_write_empty_string_round_trips() {
    let _ = macos_clipboard::write_string("non-empty seed");
    assert!(macos_clipboard::write_string(""));
    let got = macos_clipboard::read_string();
    // Empty string is a legitimate clipboard value; must round-trip
    // exactly (NOT collapse to None).
    assert_eq!(got.as_deref(), Some(""));
}

#[test]
#[cfg(not(target_os = "macos"))]
fn test_non_macos_returns_none_and_false() {
    // On Linux the bridge is a deliberate no-op so window.rs can call it
    // unconditionally and fall through to GdkClipboard.
    assert_eq!(macos_clipboard::read_string(), None);
    assert!(!macos_clipboard::write_string("anything"));
}

// ── Source-grep guards: single source of truth ─────────────────────

#[test]
fn test_module_exposes_only_two_public_functions() {
    // The module's entire surface is `read_string` and `write_string`.
    // Anyone needing NSPasteboard goes through these — never re-implement
    // NSPasteboard plumbing in a UI module. Both functions appear twice
    // in the file (one cfg(macos), one fallback), so we assert on the
    // distinct function NAMES, not the number of definitions.
    let src = include_str!("../macos_clipboard.rs");
    let names: std::collections::BTreeSet<&str> = src
        .lines()
        .filter_map(|l| {
            let l = l.trim_start();
            l.strip_prefix("pub fn ")
                .and_then(|rest| rest.split('(').next())
                .map(str::trim)
        })
        .collect();
    let expected: std::collections::BTreeSet<&str> =
        ["read_string", "write_string"].into_iter().collect();
    assert_eq!(
        names, expected,
        "macos_clipboard.rs must expose EXACTLY {{read_string, write_string}}"
    );
}

#[test]
fn test_window_rs_uses_macos_clipboard_for_cmd_v() {
    // Cmd+V handler in window.rs must consult NSPasteboard FIRST. On
    // macOS, GTK's `emit_paste_clipboard()` only sees GdkClipboard
    // (intra-app), missing text from native macOS apps.
    let src = include_str!("../window.rs");
    assert!(
        src.contains("macos_clipboard::read_string"),
        "window.rs Cmd+V handler must call macos_clipboard::read_string() \
         to bridge the system clipboard"
    );
}

#[test]
fn test_no_other_module_reimplements_nspasteboard_general() {
    // Only macos_clipboard.rs and setup.rs (custom finder pasteboard)
    // may touch NSPasteboard. Any other UI/event module that opens the
    // general NSPasteboard is duplicating SSoT.
    //
    // We enumerate the known clipboard-adjacent files explicitly rather
    // than walking the tree (no walkdir dep) — these are the only files
    // that have ever been tempted to reach for NSPasteboard.
    let suspects: &[(&str, &str)] = &[
        ("window.rs", include_str!("../window.rs")),
        ("submit.rs", include_str!("../submit.rs")),
        (
            "tab/ai_conversation.rs",
            include_str!("../tab/ai_conversation.rs"),
        ),
        ("menu.rs", include_str!("../menu.rs")),
        ("event_dispatch.rs", include_str!("../event_dispatch.rs")),
        ("table_interactions.rs", include_str!("../table_interactions.rs")),
        ("restore.rs", include_str!("../restore.rs")),
    ];
    let mut offenders = Vec::new();
    for (name, src) in suspects {
        if src.contains("generalPasteboard") || src.contains("NSPasteboardTypeString") {
            offenders.push(*name);
        }
    }
    assert!(
        offenders.is_empty(),
        "Only macos_clipboard.rs and setup.rs may touch NSPasteboard. \
         Offenders:\n{offenders:#?}"
    );
}
