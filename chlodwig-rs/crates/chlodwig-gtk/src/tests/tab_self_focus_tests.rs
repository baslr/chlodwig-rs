//! Regression tests for "newly created AI tab gets focus":
//!   1. The tab becomes the selected page in its `TabView` (so the user
//!      sees it immediately, not the previous tab).
//!   2. The input view inside the new tab grabs keyboard focus (so the
//!      user can start typing without an extra click).
//!
//! Self-focus rule (per user directive 2026-04-22): the focusing logic
//! lives on `AiConversationTab` itself (`focus()`), called from
//! `attach_inner` — NOT in the menu action or any caller. The tab owns
//! its own `TabView` reference (stored as a field at construction time),
//! so callers don't need to pass it back in. Every creation path
//! (Cmd+T menu action, startup initial tab, `attach_with_session` from
//! the Sessions browser) gets identical focus behavior with no per-call
//! boilerplate.

const TAB_AI_RS: &str = include_str!("../tab/ai_conversation.rs");

#[test]
fn test_ai_conversation_tab_has_focus_method() {
    // The self-focus method must exist on AiConversationTab and take
    // ONLY &self — the tab owns its TabView, no parameter needed.
    assert!(
        TAB_AI_RS.contains("pub fn focus(&self)"),
        "AiConversationTab must expose `pub fn focus(&self)` \
         (parameter-less; the tab owns its TabView reference)."
    );
}

#[test]
fn test_ai_conversation_tab_owns_tab_view() {
    // The tab must hold a reference to its TabView so it can self-select
    // without callers having to pass it back in.
    assert!(
        TAB_AI_RS.contains("pub tab_view: libadwaita::TabView")
            || TAB_AI_RS.contains("tab_view: libadwaita::TabView"),
        "AiConversationTab struct must carry a `tab_view: libadwaita::TabView` \
         field — the tab owns its view (GObject ref-count, cheap clone)."
    );
}

#[test]
fn test_focus_selects_page_and_focuses_input() {
    // The body of focus() must do both:
    //   - `self.tab_view.set_selected_page(&self.page)`
    //   - `self.widgets.input_view.grab_focus()` (or call `self.focus_input()`)
    let body = extract_method_body(TAB_AI_RS, "pub fn focus(&self)")
        .expect("focus() body must be findable");
    assert!(
        body.contains("set_selected_page"),
        "focus() must call set_selected_page on self.tab_view so the new tab becomes visible"
    );
    assert!(
        body.contains("grab_focus") || body.contains("focus_input"),
        "focus() must grab_focus on the input view (or call self.focus_input())"
    );
    assert!(
        body.contains("self.tab_view"),
        "focus() must use `self.tab_view` (the owned field), not a parameter"
    );
}

#[test]
fn test_attach_inner_calls_focus() {
    // attach_inner is the SSoT for all AI-tab creation paths. Calling
    // focus() there means Cmd+T, initial tab AND attach_with_session
    // all behave identically.
    let body = extract_function_body(TAB_AI_RS, "fn attach_inner")
        .expect("attach_inner body must be findable");
    assert!(
        body.contains("tab.focus()"),
        "attach_inner must call tab.focus() so every tab-creation path gets focus"
    );
}

#[test]
fn test_attach_inner_no_longer_inlines_set_selected_page_for_snapshot() {
    // The previous snapshot-only `ctx.tab_view.set_selected_page(&page)`
    // call must be gone — focus() handles it for ALL paths now,
    // not just the snapshot path. Otherwise we'd select the page twice
    // for restored sessions.
    let body = extract_function_body(TAB_AI_RS, "fn attach_inner")
        .expect("attach_inner body must be findable");
    let inline_count = body.matches("ctx.tab_view.set_selected_page").count();
    assert_eq!(
        inline_count, 0,
        "attach_inner must NOT inline `ctx.tab_view.set_selected_page` — \
         that responsibility moved into `AiConversationTab::focus` \
         (called once unconditionally). Found {inline_count} inline call(s)."
    );
}

#[test]
fn test_menu_new_tab_action_does_not_focus_inline() {
    // The menu action must NOT do its own focus dance — that's tab's job.
    // It just calls AiConversationTab::attach_new(...) and lets the tab
    // focus itself.
    let menu = include_str!("../menu.rs");
    // Find the new-tab action block and assert it doesn't reach into
    // tab internals to focus.
    let action_pos = menu.find("\"new-tab\"").expect("new-tab action must exist");
    // Take ~600 chars of context (action body fits comfortably).
    let end = (action_pos + 800).min(menu.len());
    let block = &menu[action_pos..end];
    assert!(
        !block.contains("grab_focus"),
        "menu.rs new-tab action must NOT call grab_focus — \
         AiConversationTab focuses itself in attach_inner"
    );
    assert!(
        !block.contains("set_selected_page"),
        "menu.rs new-tab action must NOT call set_selected_page — \
         AiConversationTab focuses itself in attach_inner"
    );
}

// ── helpers ────────────────────────────────────────────────────────────

/// Extract the body (between the first `{` after `signature` and the
/// matching `}`). Brace-balanced, ignoring comments/strings is good enough
/// for our well-formed source.
fn extract_function_body<'a>(src: &'a str, signature: &str) -> Option<&'a str> {
    let start = src.find(signature)?;
    let body_start = src[start..].find('{').map(|i| start + i)?;
    let mut depth = 0;
    for (i, ch) in src[body_start..].char_indices() {
        match ch {
            '{' => depth += 1,
            '}' => {
                depth -= 1;
                if depth == 0 {
                    return Some(&src[body_start..body_start + i + 1]);
                }
            }
            _ => {}
        }
    }
    None
}

fn extract_method_body<'a>(src: &'a str, signature: &str) -> Option<&'a str> {
    extract_function_body(src, signature)
}
