//! Unread indicator (●) on inactive tabs when turn completes (issue #33).
//!
//! When an AI tab finishes its turn loop (`TurnComplete`) and the tab is NOT
//! the currently selected tab, the tab title is prefixed with `●  ` (U+25CF
//! followed by two spaces). The prefix is removed when the tab gains focus.
//!
//! ── Architecture ───────────────────────────────────────────────────────────
//!
//!   - `AiConversationTab` has an `unread: Cell<bool>` field.
//!   - `refresh_tab_title()` is the SSoT for the tab title. It reads
//!     `self.unread.get()` and prepends `●  ` when true.
//!   - `event_dispatch` sets `unread = true` on `TurnComplete` when the
//!     tab's page is NOT the selected page.
//!   - `build_window`'s `connect_selected_page_notify` clears `unread`
//!     and refreshes the title when a tab gains focus.
//!
//! ── Why `Cell<bool>` on the tab, not prefix-stripping ──────────────────────
//!
//!   `refresh_tab_title()` is called from many places (tab creation,
//!   `/name`, `/clear`, session restore, `/cwd`). If the unread state were
//!   encoded only as a title prefix, every `refresh_tab_title()` call would
//!   need to either strip-then-re-add or pass a flag. A `Cell<bool>` makes
//!   the state explicit and `refresh_tab_title()` the single place that
//!   decides the final title string — idempotent by construction.
//!
//! Source-grep guards (no display server needed).

const TAB_AI_RS: &str = include_str!("../tab/ai_conversation.rs");
const TAB_MOD_RS: &str = include_str!("../tab/mod.rs");
const EVENT_DISPATCH_RS: &str = include_str!("../event_dispatch.rs");

/// The unread indicator prefix. Defined here so tests and implementation
/// agree on the exact string.
const UNREAD_PREFIX: &str = "●  ";

// ── 1. AiConversationTab has the `unread` field ─────────────────────────

#[test]
fn test_ai_conversation_tab_has_unread_cell_bool() {
    assert!(
        TAB_AI_RS.contains("unread:") && TAB_AI_RS.contains("Cell<bool>"),
        "AiConversationTab must have an `unread: Cell<bool>` field to track \
         whether the tab has unseen completed output"
    );
}

// ── 2. refresh_tab_title reads unread and prepends the indicator ────────

#[test]
fn test_refresh_tab_title_reads_unread_flag() {
    // refresh_tab_title must consult self.unread to decide whether to
    // prepend the indicator.
    assert!(
        TAB_AI_RS.contains("self.unread.get()"),
        "refresh_tab_title() must read `self.unread.get()` to decide whether \
         to prepend the ● indicator"
    );
}

#[test]
fn test_refresh_tab_title_prepends_unread_prefix() {
    // The exact prefix U+25CF + two spaces must appear in the title
    // construction path.
    assert!(
        TAB_AI_RS.contains(UNREAD_PREFIX) || TAB_AI_RS.contains("●  "),
        "refresh_tab_title() must prepend '●  ' (U+25CF + 2 spaces) when \
         unread is true"
    );
}

// ── 3. event_dispatch sets unread on TurnComplete for inactive tabs ─────

#[test]
fn test_event_dispatch_context_has_page_field() {
    assert!(
        EVENT_DISPATCH_RS.contains("page:") && EVENT_DISPATCH_RS.contains("TabPage"),
        "EventDispatchContext must carry a `page: libadwaita::TabPage` field \
         so event_dispatch can check whether this tab is the selected page"
    );
}

#[test]
fn test_event_dispatch_context_has_tab_view_field() {
    assert!(
        EVENT_DISPATCH_RS.contains("tab_view:") && EVENT_DISPATCH_RS.contains("TabView"),
        "EventDispatchContext must carry a `tab_view: libadwaita::TabView` \
         field so event_dispatch can call selected_page()"
    );
}

#[test]
fn test_event_dispatch_sets_unread_on_turn_complete() {
    // The event loop must set unread=true when TurnComplete fires and the
    // tab is not selected.
    assert!(
        EVENT_DISPATCH_RS.contains("unread.set(true)"),
        "event_dispatch must call `unread.set(true)` on TurnComplete for \
         inactive tabs"
    );
}

#[test]
fn test_event_dispatch_sets_unread_on_error_too() {
    // An Error event also means the turn is over and the user can prompt
    // again — the tab should be marked unread just like TurnComplete.
    assert!(
        EVENT_DISPATCH_RS.contains("ConversationEvent::Error"),
        "event_dispatch must also mark the tab unread on Error events \
         (the turn is over, user can prompt again)"
    );
}

#[test]
fn test_event_dispatch_checks_selected_page_for_unread() {
    // Must compare this tab's page against the selected page to decide
    // whether to mark as unread.
    assert!(
        EVENT_DISPATCH_RS.contains("selected_page()"),
        "event_dispatch must call `tab_view.selected_page()` to determine \
         whether the tab is currently active before marking unread"
    );
}

#[test]
fn test_event_dispatch_checks_window_active_for_unread() {
    // Even the selected tab should be marked unread when the window is
    // not in focus — the user is not looking at it.
    assert!(
        EVENT_DISPATCH_RS.contains("is_active()"),
        "event_dispatch must check `window.is_active()` to mark the \
         selected tab as unread when the window is in the background"
    );
}

// ── 4. build_window clears unread on tab focus ──────────────────────────

#[test]
fn test_build_window_clears_unread_on_tab_selection() {
    // The connect_selected_page_notify handler in build_window must clear
    // the unread flag when a tab gains focus.
    assert!(
        TAB_MOD_RS.contains("unread.set(false)"),
        "build_window's selected_page_notify handler must clear the unread \
         flag when a tab gains focus"
    );
}

#[test]
fn test_build_window_clears_unread_on_window_activation() {
    // When the window regains focus, the currently selected tab's unread
    // indicator must be cleared — the user is now looking at it.
    let is_active_section = TAB_MOD_RS
        .find("connect_is_active_notify")
        .expect("must have connect_is_active_notify");
    let after = &TAB_MOD_RS[is_active_section..];
    assert!(
        after.contains("unread.set(false)"),
        "build_window's is_active_notify handler must clear unread on the \
         selected tab when the window regains focus"
    );
}

#[test]
fn test_build_window_selected_page_notify_calls_refresh_tab_title() {
    // After clearing unread, the title must be refreshed to remove the
    // prefix. refresh_tab_title is the SSoT.
    assert!(
        TAB_MOD_RS.contains("refresh_tab_title"),
        "build_window's selected_page_notify handler must call \
         refresh_tab_title() after clearing unread so the ● prefix is removed"
    );
}

#[test]
fn test_build_window_drops_registry_borrow_before_gtk_calls() {
    // The registry borrow must be scoped so it's dropped BEFORE
    // set_title / refresh_tab_title (which can fire signals that
    // borrow_mut the same registry — Gotcha #46).
    // The safe pattern: compute window_title() inside a block, drop
    // the borrow, then call set_title.
    let handler_section = TAB_MOD_RS
        .find("connect_selected_page_notify")
        .expect("must have connect_selected_page_notify");
    let after_handler = &TAB_MOD_RS[handler_section..];
    // The borrow must NOT span across set_title — check that
    // window_title() is computed inside a scoped block.
    assert!(
        after_handler.contains("let title = {"),
        "The registry borrow in selected_page_notify must be scoped \
         (e.g. `let title = {{ ... }}`) so it's dropped before GTK calls \
         like set_title / refresh_tab_title (Gotcha #46)"
    );
}

// ── 5. Idempotency: multiple TurnCompletes don't stack ──────────────────

#[test]
fn test_unread_is_cell_bool_not_counter() {
    // Cell<bool> is inherently idempotent: set(true) twice is the same as
    // set(true) once. A counter (Cell<u32>) would require dedup logic.
    // This test ensures we don't regress to a counter.
    assert!(
        TAB_AI_RS.contains("Cell<bool>")
            && !TAB_AI_RS.contains("unread: Cell<u"),
        "unread must be Cell<bool>, not a counter — idempotent by construction"
    );
}
