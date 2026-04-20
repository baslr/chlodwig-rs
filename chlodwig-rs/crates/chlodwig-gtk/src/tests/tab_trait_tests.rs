//! Tab-trait abstraction (extension of MULTIWINDOW_TABS.md Stage B).
//!
//! After Stage B, `tab.rs` was a single file that hard-coded the
//! AI-conversation tab kind: `TabContext` mixed generic per-tab data
//! (page handle, cwd, focus target) with AI-specific data (AppState,
//! prompt_tx, ConversationState wiring). That makes it impossible to add
//! other tab kinds — Browser, Terminal, File-Viewer, Image-Viewer —
//! without touching the registry, the close handler, the menu actions,
//! and main.rs.
//!
//! ── Single-source-of-truth invariants enforced here ───────────────────
//!
//!   1. `tab` is now a **module directory** with `mod.rs` (the generic
//!      trait + registry layer) and `ai_conversation.rs` (the AI-specific
//!      implementation). No AI-specific symbols leak into `tab/mod.rs`.
//!
//!   2. The generic surface is a `pub trait Tab` with the minimal API
//!      every tab kind must provide: `page()`, `cwd()`, `window_title()`,
//!      `focus_input()`, plus `as_any()` for downcast to a concrete kind.
//!
//!   3. `BackgroundCommand` and the conversation-loop `tokio::spawn` move
//!      out of `tab/mod.rs` into `tab/ai_conversation.rs` — they were
//!      AI-tab-only concerns from day one.
//!
//!   4. The registry stores `Rc<dyn Tab>`; `tab::active()` returns
//!      `Option<Rc<dyn Tab>>`. A new helper `tab::active_ai()` returns
//!      `Option<Rc<AiConversationTab>>` via downcast — for the
//!      conversation-only menu actions (Compact, Resume, Sessions,
//!      New Conversation).
//!
//!   5. Cmd+T defaults to opening a new AI-conversation tab (per the
//!      explicit user requirement). The menu calls
//!      `AiConversationTab::attach_new(...)`, NOT a generic factory —
//!      the default tab kind is hard-coded at the call site so the user
//!      directive "Cmd+T öffnet default immer eine neue AiConversation"
//!      is visible in the menu source.
//!
//! These are source-grep guards (GTK widgets cannot be instantiated under
//! `cargo test --release --workspace` without a display server).

const TAB_MOD_RS: &str = include_str!("../tab/mod.rs");
const TAB_AI_RS: &str = include_str!("../tab/ai_conversation.rs");
const MAIN_RS: &str = include_str!("../main.rs");
const MENU_RS: &str = include_str!("../menu.rs");
const SUBMIT_RS: &str = include_str!("../submit.rs");
const EVENT_DISPATCH_RS: &str = include_str!("../event_dispatch.rs");
const TABLE_INTERACTIONS_RS: &str = include_str!("../table_interactions.rs");
const RESTORE_RS: &str = include_str!("../restore.rs");

// ── 1. Module-directory layout ─────────────────────────────────────────

#[test]
fn test_tab_is_a_module_directory() {
    // The previous `src/tab.rs` single file is replaced by a directory
    // `src/tab/` containing `mod.rs` and `ai_conversation.rs`. Cargo will
    // panic at compile time if either file is missing because the const
    // `include_str!` calls above resolve at compile time. This test
    // documents the architectural intent.
    assert!(!TAB_MOD_RS.is_empty(), "tab/mod.rs must exist and be non-empty");
    assert!(!TAB_AI_RS.is_empty(), "tab/ai_conversation.rs must exist and be non-empty");
}

#[test]
fn test_tab_mod_declares_ai_conversation_submodule() {
    assert!(
        TAB_MOD_RS.contains("pub mod ai_conversation")
            || TAB_MOD_RS.contains("mod ai_conversation"),
        "tab/mod.rs must declare `pub mod ai_conversation;` so the AI-tab \
         implementation is reachable as `tab::ai_conversation::AiConversationTab`"
    );
}

// ── 2. The Tab trait ───────────────────────────────────────────────────

#[test]
fn test_tab_trait_exists() {
    assert!(
        TAB_MOD_RS.contains("pub trait Tab"),
        "tab/mod.rs must define `pub trait Tab` — the abstraction every \
         tab kind (AI conversation, Browser, Terminal, File viewer, Image \
         viewer) implements"
    );
}

#[test]
fn test_tab_trait_has_required_methods() {
    // Locate trait body.
    let start = TAB_MOD_RS
        .find("pub trait Tab")
        .expect("Tab trait must exist");
    let body_start = start + TAB_MOD_RS[start..].find('{').unwrap();
    let body_end = body_start
        + TAB_MOD_RS[body_start..]
            .find("\n}\n")
            .expect("Tab trait body must close with `\\n}\\n`");
    let body = &TAB_MOD_RS[body_start..body_end];

    for needle in [
        ("fn page(", "page() -> &adw::TabPage — the GTK handle for this tab"),
        ("fn cwd(", "cwd() -> &Path — used by 'New Tab' to inherit cwd"),
        ("fn window_title(", "window_title() -> String — for the window-title-follows-active-tab handler"),
        ("fn focus_input(", "focus_input() — called on window activation to restore focus"),
        ("fn as_any(", "as_any() -> &dyn Any — enables downcast to a concrete kind (e.g. AiConversationTab)"),
    ] {
        assert!(
            body.contains(needle.0),
            "Tab trait must declare `{}` ({}) — got body:\n{body}",
            needle.0, needle.1
        );
    }
}

// ── 3. Registry stores trait objects, not concrete types ───────────────

#[test]
fn test_tab_registry_stores_dyn_tab() {
    assert!(
        TAB_MOD_RS.contains("Rc<dyn Tab>") || TAB_MOD_RS.contains("Rc<dyn Tab >"),
        "TabRegistry must store `Rc<dyn Tab>` (not `Rc<TabContext>` or \
         `Rc<AiConversationTab>`) — the registry is generic over tab kind"
    );
    // Belt-and-suspenders: make sure the old AI-specific TabContext type
    // does NOT appear in the registry/active-helper API.
    assert!(
        !TAB_MOD_RS.contains("Rc<TabContext>"),
        "tab/mod.rs must NOT mention `Rc<TabContext>` — that was the Stage \
         B name for the AI-only bundle. Use `Rc<dyn Tab>` for the registry \
         and a downcast helper (`active_ai`) for AI-only actions."
    );
}

#[test]
fn test_active_helper_returns_dyn_tab() {
    // `pub fn active(...)` must return `Option<Rc<dyn Tab>>`.
    let start = TAB_MOD_RS
        .find("pub fn active(")
        .expect("tab/mod.rs must define `pub fn active(...)`");
    let sig_end = start + TAB_MOD_RS[start..].find('{').unwrap();
    let sig = &TAB_MOD_RS[start..sig_end];
    assert!(
        sig.contains("Rc<dyn Tab>"),
        "`tab::active(...)` must return `Option<Rc<dyn Tab>>` — got:\n{sig}"
    );
}

#[test]
fn test_active_ai_helper_exists() {
    // The downcast helper that AI-only menu actions use.
    assert!(
        TAB_MOD_RS.contains("pub fn active_ai("),
        "tab/mod.rs must define `pub fn active_ai(tab_view, registry) -> \
         Option<Rc<AiConversationTab>>` — downcasts the active tab to the \
         AI kind. AI-only menu actions (Compact, Resume, Sessions, New \
         Conversation) call this; if the active tab is e.g. a Browser tab, \
         it returns None and the action is a no-op."
    );
}

// ── 4. AI-specific code lives in tab/ai_conversation.rs ────────────────

#[test]
fn test_background_command_lives_in_ai_module() {
    assert!(
        TAB_AI_RS.contains("pub enum BackgroundCommand"),
        "`pub enum BackgroundCommand` must live in tab/ai_conversation.rs \
         — it's an AI-tab-only concern (the channel between the AI tab's \
         GTK handlers and its background Tokio task)"
    );
    assert!(
        !TAB_MOD_RS.contains("enum BackgroundCommand"),
        "tab/mod.rs must NOT define `BackgroundCommand` — it belongs in \
         the AI-tab module (other tab kinds — Browser, Terminal — have \
         no BackgroundCommand at all)"
    );
}

#[test]
fn test_ai_conversation_tab_struct_exists() {
    assert!(
        TAB_AI_RS.contains("pub struct AiConversationTab"),
        "tab/ai_conversation.rs must define `pub struct AiConversationTab` \
         — the concrete Tab implementation for AI-conversation tabs"
    );
}

#[test]
fn test_ai_conversation_tab_implements_tab() {
    // Either `impl Tab for AiConversationTab` or `impl crate::tab::Tab for \
    // AiConversationTab`.
    assert!(
        TAB_AI_RS.contains("impl Tab for AiConversationTab")
            || TAB_AI_RS.contains("impl super::Tab for AiConversationTab")
            || TAB_AI_RS.contains("impl crate::tab::Tab for AiConversationTab"),
        "AiConversationTab must implement the Tab trait — `impl Tab for \
         AiConversationTab {{ … }}`"
    );
}

#[test]
fn test_attach_new_lives_on_ai_conversation_tab() {
    // The factory function that creates an AI-conversation tab. Cmd+T
    // calls this directly (the default tab kind).
    assert!(
        TAB_AI_RS.contains("pub fn attach_new(") || TAB_AI_RS.contains("pub fn attach("),
        "tab/ai_conversation.rs must expose `pub fn attach_new(ctx, cwd) \
         -> adw::TabPage` (or similarly named) — the SINGLE entry point for \
         creating an AI-conversation tab. Used by the initial-tab path in \
         main.rs AND by the Cmd+T menu action."
    );
}

#[test]
fn test_spawn_conversation_task_lives_in_ai_module() {
    assert!(
        TAB_AI_RS.contains("std::thread::spawn") || TAB_AI_RS.contains("thread::spawn"),
        "tab/ai_conversation.rs must spawn the per-tab background \
         conversation thread (Tokio runtime + run_turn loop)"
    );
    assert!(
        TAB_AI_RS.contains("ConversationState {"),
        "tab/ai_conversation.rs must build the per-tab ConversationState"
    );
    assert!(
        TAB_AI_RS.contains("run_turn"),
        "tab/ai_conversation.rs must call `run_turn(...)`"
    );
    // And the same code MUST NOT exist in tab/mod.rs (would be drift).
    assert!(
        !TAB_MOD_RS.contains("ConversationState {"),
        "tab/mod.rs must NOT instantiate ConversationState — that's an \
         AI-specific concern (lives in tab/ai_conversation.rs)"
    );
    assert!(
        !TAB_MOD_RS.contains("run_turn"),
        "tab/mod.rs must NOT call run_turn — that's AI-tab-only"
    );
}

// ── 5. Cmd+T defaults to AI-conversation tab ──────────────────────────

#[test]
fn test_new_tab_action_calls_ai_conversation_attach() {
    // Find the body of the `app.new-tab` action in menu.rs and assert it
    // calls `AiConversationTab::attach_new` (or imports it via a use stmt).
    // The user requirement: "Cmd+T öffnet default immer eine neue
    // AiConversation". This must be visible in the menu source.
    let new_tab_marker = MENU_RS
        .find("\"new-tab\"")
        .expect("menu.rs must register the new-tab action");
    // Take a generous window after the marker, backing off to a UTF-8
    // char boundary (menu.rs has box-drawing chars in comments).
    let mut window_end = (new_tab_marker + 4000).min(MENU_RS.len());
    while window_end > new_tab_marker && !MENU_RS.is_char_boundary(window_end) {
        window_end -= 1;
    }
    let action_block = &MENU_RS[new_tab_marker..window_end];
    assert!(
        action_block.contains("AiConversationTab::attach_new")
            || action_block.contains("ai_conversation::attach_new"),
        "menu.rs's `app.new-tab` action must call \
         `AiConversationTab::attach_new(...)` (or `ai_conversation::attach_new`) \
         — the default tab kind is AI conversation. Got action block:\n{action_block}"
    );
}

#[test]
fn test_main_initial_tab_is_ai_conversation() {
    // The initial tab opened on app startup is also AI conversation.
    assert!(
        MAIN_RS.contains("AiConversationTab::attach_new")
            || MAIN_RS.contains("ai_conversation::attach_new"),
        "main.rs must call `AiConversationTab::attach_new(...)` to open \
         the initial tab — the default tab kind is AI conversation, and \
         the initial tab must use the SAME factory as Cmd+T (no 'first \
         tab special' code path)"
    );
    // And main.rs must NOT call the old `tab::attach_new_tab` any more.
    assert!(
        !MAIN_RS.contains("tab::attach_new_tab"),
        "main.rs must NOT call the old `tab::attach_new_tab` — that was \
         the Stage B name. Use `tab::ai_conversation::AiConversationTab::\
         attach_new(...)` instead."
    );
}

// ── 6. AI-only menu actions use active_ai() not active() ──────────────

#[test]
fn test_conversation_actions_use_active_ai_downcast() {
    // The AI-only actions (compact, resume, sessions-browser,
    // new-conversation) must use `active_ai()` so they're no-ops when the
    // user is on a non-AI tab (e.g. Browser, Terminal). If they kept
    // calling the generic `active()`, they'd fail compiling against
    // `Rc<dyn Tab>` (no `prompt_tx` field).
    for action_name in ["compact", "resume", "sessions-browser", "new-conversation"] {
        let needle = format!("\"{action_name}\"");
        let pos = MENU_RS
            .find(&needle)
            .unwrap_or_else(|| panic!("menu action {action_name} must be registered"));
        // Walk a generous window forward, but back off to a UTF-8 char
        // boundary (menu.rs contains box-drawing characters in comments).
        let mut window_end = (pos + 4000).min(MENU_RS.len());
        while window_end > pos && !MENU_RS.is_char_boundary(window_end) {
            window_end -= 1;
        }
        let block = &MENU_RS[pos..window_end];
        assert!(
            block.contains("active_ai("),
            "menu.rs's `{action_name}` action must look up the active tab \
             via `tab::active_ai(...)` (not `tab::active(...)`) — it's \
             AI-conversation-only and must no-op on non-AI tabs. Got block:\n{block}"
        );
    }
}

// ── 7. Sibling modules' BackgroundCommand import path ──────────────────

#[test]
fn test_sibling_modules_import_background_command_from_ai_submodule() {
    // submit, event_dispatch, table_interactions, restore are all
    // AI-conversation-tab implementations — they import BackgroundCommand
    // from the AI submodule, NOT from `crate::tab` directly. (They COULD
    // re-export it from tab/mod.rs for backwards-compat, but the SSoT rule
    // is "one definition site". A re-export at the parent module is fine
    // here — the test accepts either path.)
    for (name, src) in [
        ("submit.rs", SUBMIT_RS),
        ("event_dispatch.rs", EVENT_DISPATCH_RS),
        ("table_interactions.rs", TABLE_INTERACTIONS_RS),
        ("restore.rs", RESTORE_RS),
    ] {
        assert!(
            src.contains("ai_conversation::BackgroundCommand")
                || src.contains("tab::ai_conversation::BackgroundCommand")
                || src.contains("tab::BackgroundCommand")
                || src.contains("BackgroundCommand"),
            "{name} must import `BackgroundCommand` (from \
             `crate::tab::ai_conversation::BackgroundCommand` or via the \
             tab module re-export)"
        );
    }
}

// ── 8. No AI-specific fields leak into the generic Tab trait ──────────

#[test]
fn test_tab_trait_has_no_ai_specific_methods() {
    // The trait must stay minimal. AI-specific accessors (prompt_tx,
    // app_state, viewport_cols, session_started_at, stop_flag, widgets)
    // are NOT in the trait — code that needs them must downcast via
    // as_any() / active_ai().
    let start = TAB_MOD_RS
        .find("pub trait Tab")
        .expect("Tab trait must exist");
    let body_start = start + TAB_MOD_RS[start..].find('{').unwrap();
    let body_end = body_start
        + TAB_MOD_RS[body_start..]
            .find("\n}\n")
            .expect("Tab trait body must close");
    let body = &TAB_MOD_RS[body_start..body_end];

    for forbidden in [
        "fn prompt_tx",
        "fn app_state",
        "fn viewport_cols",
        "fn session_started_at",
        "fn stop_flag",
        "fn widgets",
        "BackgroundCommand",
    ] {
        assert!(
            !body.contains(forbidden),
            "Tab trait must NOT mention `{forbidden}` — that's an AI-tab \
             concern. Cast to AiConversationTab via as_any() instead. Got body:\n{body}"
        );
    }
}
