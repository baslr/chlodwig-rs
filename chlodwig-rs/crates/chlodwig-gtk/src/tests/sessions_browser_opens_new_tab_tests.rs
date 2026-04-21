//! Stage D.1 — Sessions browser opens selected session in a NEW tab,
//! NOT into the currently-active tab.
//!
//! Regression guards (source-grep) for the SSoT invariants:
//!   1. `AiConversationTab` exposes `attach_with_session(ctx, cwd, snapshot)`.
//!   2. `attach_new` and `attach_with_session` both delegate to a single
//!      private `attach_inner(ctx, cwd, Option<SessionSnapshot>)` — no
//!      duplicated tab-construction code.
//!   3. `attach_inner`, when called with `Some(snapshot)`, applies the
//!      restore through `crate::restore::apply_restored_session_to_ui`
//!      — the same SSoT used by `--resume` and `/resume`.
//!   4. The Sessions-Browser callback in `menu.rs` calls
//!      `attach_with_session(...)` and does NOT call
//!      `restore::apply_restored_session_to_ui` directly anymore (that
//!      was the old "overwrite the active tab" path).

const AI_RS: &str = include_str!("../tab/ai_conversation.rs");
const MENU_RS: &str = include_str!("../../src/menu.rs");

/// Walk backwards from `end` until it lies on a UTF-8 char boundary —
/// guards against Gotcha #16 (slicing inside a multi-byte char panics).
fn safe_slice(s: &str, start: usize, len: usize) -> &str {
    let mut end = (start + len).min(s.len());
    while end > start && !s.is_char_boundary(end) {
        end -= 1;
    }
    &s[start..end]
}

#[test]
fn test_attach_with_session_function_exists() {
    assert!(
        AI_RS.contains("pub fn attach_with_session("),
        "AiConversationTab must expose `attach_with_session(ctx, cwd, snapshot)` as the entry point for the Sessions-browser → new-tab path."
    );
}

#[test]
fn test_attach_with_session_takes_snapshot_argument() {
    // Find the function and verify it has a SessionSnapshot parameter.
    let pos = AI_RS
        .find("pub fn attach_with_session(")
        .expect("attach_with_session must exist");
    let window = safe_slice(AI_RS, pos, 600);
    assert!(
        window.contains("SessionSnapshot"),
        "attach_with_session must take a SessionSnapshot argument. Signature window: {window}"
    );
}

#[test]
fn test_attach_inner_is_the_single_construction_path() {
    // The whole point: attach_new and attach_with_session both delegate
    // to one private attach_inner — no duplicated tab-construction logic.
    assert!(
        AI_RS.contains("fn attach_inner("),
        "There must be a private `attach_inner` function that both `attach_new` and `attach_with_session` delegate to."
    );
}

#[test]
fn test_attach_inner_takes_optional_snapshot() {
    let pos = AI_RS.find("fn attach_inner(").expect("attach_inner must exist");
    let window = safe_slice(AI_RS, pos, 600);
    assert!(
        window.contains("Option<SessionSnapshot>") || window.contains("Option<chlodwig_core::SessionSnapshot>"),
        "attach_inner must take Option<SessionSnapshot> so it can handle both fresh tabs and snapshot-restoring tabs through one code path. Signature window: {window}"
    );
}

#[test]
fn test_attach_new_delegates_to_attach_inner() {
    // attach_new must be a thin wrapper — its body should call attach_inner.
    let pos = AI_RS
        .find("pub fn attach_new(")
        .expect("attach_new must exist");
    let window = safe_slice(AI_RS, pos, 800);
    assert!(
        window.contains("attach_inner("),
        "attach_new must delegate to attach_inner — single source of truth for tab construction. Body window: {window}"
    );
    // And it must pass None (or equivalent) for the snapshot.
    assert!(
        window.contains("None"),
        "attach_new must pass None for the snapshot argument to attach_inner. Body window: {window}"
    );
}

#[test]
fn test_attach_with_session_delegates_to_attach_inner() {
    let pos = AI_RS
        .find("pub fn attach_with_session(")
        .expect("attach_with_session must exist");
    let window = safe_slice(AI_RS, pos, 800);
    assert!(
        window.contains("attach_inner("),
        "attach_with_session must delegate to attach_inner — single source of truth. Body window: {window}"
    );
    assert!(
        window.contains("Some("),
        "attach_with_session must pass Some(snapshot) to attach_inner. Body window: {window}"
    );
}

#[test]
fn test_attach_inner_uses_apply_restored_session_to_ui() {
    // SSoT: when a snapshot is provided, attach_inner must use the same
    // restore flow as `--resume` and `/resume` — NOT a parallel
    // implementation.
    let pos = AI_RS
        .find("fn attach_inner(")
        .expect("attach_inner must exist");
    let window = safe_slice(AI_RS, pos, 20000);
    assert!(
        window.contains("apply_restored_session_to_ui")
            || window.contains("restore::apply_restored_session_to_ui"),
        "attach_inner must use crate::restore::apply_restored_session_to_ui for snapshot restore — SSoT with the existing /resume and --resume paths. Body window first 200 chars: {}",
        safe_slice(window, 0, 200)
    );
}

#[test]
fn test_menu_sessions_browser_calls_attach_with_session() {
    // The menu's sessions-browser action must open the chosen session
    // in a new tab, not overwrite the active tab.
    let pos = MENU_RS
        .find("\"sessions-browser\"")
        .expect("sessions-browser action must exist in menu.rs");
    let window = safe_slice(MENU_RS, pos, 4000);
    assert!(
        window.contains("attach_with_session"),
        "menu.rs sessions-browser action must call AiConversationTab::attach_with_session(...) so the chosen session opens in a NEW tab instead of overwriting the active tab."
    );
}

#[test]
fn test_menu_sessions_browser_does_not_inline_apply_restored_session() {
    // The OLD behaviour (overwrite active tab) called
    // restore::apply_restored_session_to_ui directly inside the
    // sessions-browser callback. After D.1 that direct call must be
    // gone — it now happens once, inside attach_inner.
    let pos = MENU_RS
        .find("\"sessions-browser\"")
        .expect("sessions-browser action must exist in menu.rs");
    let window = safe_slice(MENU_RS, pos, 4000);
    assert!(
        !window.contains("apply_restored_session_to_ui"),
        "menu.rs sessions-browser action must NOT call apply_restored_session_to_ui directly — the new-tab path (attach_with_session → attach_inner) handles it. Old code overwrote the active tab; we now open a new tab instead."
    );
}

#[test]
fn test_menu_sessions_browser_uses_load_session_from() {
    // Sanity: the callback still loads the session file (the snapshot
    // must be obtained somewhere before being passed to attach_with_session).
    let pos = MENU_RS
        .find("\"sessions-browser\"")
        .expect("sessions-browser action must exist in menu.rs");
    let window = safe_slice(MENU_RS, pos, 4000);
    assert!(
        window.contains("load_session_from"),
        "menu.rs sessions-browser action must load the session from disk (load_session_from) before passing it to attach_with_session."
    );
}
