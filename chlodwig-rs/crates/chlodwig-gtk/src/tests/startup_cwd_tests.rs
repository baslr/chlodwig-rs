//! Tests for the startup CWD display in the GTK app.

use crate::app_state::AppState;
use std::path::PathBuf;

#[test]
fn test_startup_cwd_message_contains_tab_cwd() {
    let state = AppState::with_cwd("m".into(), PathBuf::from("/tmp/some-tab-dir"));
    let msg = state.startup_cwd_message();
    assert!(
        msg.contains("/tmp/some-tab-dir"),
        "startup_cwd_message() should contain tab cwd, got: {msg}"
    );
}

#[test]
fn test_startup_cwd_message_contains_process_cwd() {
    let state = AppState::with_cwd("m".into(), PathBuf::from("/tmp/some-tab-dir"));
    let proc_cwd = std::env::current_dir().unwrap().display().to_string();
    let msg = state.startup_cwd_message();
    assert!(
        msg.contains(&proc_cwd),
        "startup_cwd_message() should contain process cwd '{proc_cwd}', got: {msg}"
    );
}

#[test]
fn test_startup_cwd_message_process_cwd_appears_before_tab_cwd() {
    // The user explicitly asked: "geb mal als allererstes immer prozess-cwd
    // aus. danach die cwd die aus der zwischenablage gelesen wurde."
    let state = AppState::with_cwd("m".into(), PathBuf::from("/tmp/zzz-tab-dir-zzz"));
    let msg = state.startup_cwd_message();
    let proc_idx = msg.find("process cwd").expect("'process cwd' label missing");
    let tab_idx = msg.find("tab cwd").expect("'tab cwd' label missing");
    assert!(
        proc_idx < tab_idx,
        "process cwd line must come before tab cwd line, got: {msg}"
    );
}

#[test]
fn test_startup_cwd_message_two_lines() {
    let state = AppState::with_cwd("m".into(), PathBuf::from("/tmp/a"));
    let msg = state.startup_cwd_message();
    assert_eq!(
        msg.lines().count(),
        2,
        "startup_cwd_message must produce exactly two lines (process + tab), got: {msg}"
    );
}

/// Verify that the per-tab attach path calls startup_cwd_message() so the
/// CWD banner appears in every newly-opened tab.
///
/// Stage B: per-tab startup banner moved from main.rs to tab.rs (so that
/// Cmd+T new tabs show their cwd, not just the initial one).
#[test]
fn test_main_rs_calls_startup_cwd_message() {
    let src = include_str!("../tab.rs");
    assert!(
        src.contains("startup_cwd_message"),
        "tab.rs must call startup_cwd_message() in attach_new_tab so every \
         tab (initial AND Cmd+T) shows its working directory"
    );
}
