//! Tests for "refocus prompt input on window activation".
//!
//! When the user switches back to Chlodwig via Cmd+Tab (or by clicking
//! the dock/tray icon), the cursor should land in the prompt input again
//! so they can immediately start typing without an extra click.
//!
//! GTK4 exposes the window's foreground state via the `is-active` property.
//! We listen for the `is-active` change and call `grab_focus()` on the
//! input view whenever it transitions to `true`.
//!
//! Implementation lives in `main.rs::activate` (alongside the other
//! window-level wiring). These tests are source-text checks because
//! exercising window-activation transitions requires a live compositor.

#[test]
fn test_main_rs_has_is_active_notify_handler() {
    // Stage C: per-window wiring moved into tab::build_window. The
    // is-active handler now lives in tab/mod.rs.
    let src = include_str!("../tab/mod.rs");
    assert!(
        src.contains("connect_is_active_notify")
            || src.contains("connect_notify_local(Some(\"is-active\")"),
        "tab/mod.rs (build_window) must subscribe to window's is-active notification \
         so the input can be re-focused when the user Cmd+Tabs back to Chlodwig"
    );
}

#[test]
fn test_main_rs_grabs_focus_for_input_view_on_activation() {
    // Stage C: the focus-on-active dispatch lives in build_window
    // (tab/mod.rs), not main.rs. The dispatch goes through Tab::focus_input()
    // so non-AI tabs (Browser, Terminal, …) can provide their own focus target.
    let build_src = include_str!("../tab/mod.rs");
    assert!(
        build_src.contains(".focus_input()"),
        "build_window's is-active handler must dispatch via the generic \
         `Tab::focus_input()` so non-AI tabs can provide their own focus target"
    );
    let ai_src = include_str!("../tab/ai_conversation.rs");
    assert!(
        ai_src.contains("input_view.grab_focus()")
            || ai_src.contains("self.widgets.input_view.grab_focus()"),
        "AiConversationTab::focus_input must call grab_focus() on its \
         input_view so the cursor lands in the prompt after Cmd+Tab"
    );
}
