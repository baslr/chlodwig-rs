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
    let src = include_str!("../main.rs");
    assert!(
        src.contains("connect_is_active_notify")
            || src.contains("connect_notify_local(Some(\"is-active\")"),
        "main.rs must subscribe to window's is-active notification so the input \
         can be re-focused when the user Cmd+Tabs back to Chlodwig"
    );
}

#[test]
fn test_main_rs_grabs_focus_for_input_view_on_activation() {
    // After the Tab-trait refactor (tab_trait_tests.rs), main.rs no
    // longer touches `input_view` directly — it goes through the Tab
    // trait's `focus_input()` method, and the AI tab's impl calls
    // `input_view.grab_focus()`. Verify BOTH layers.
    let main_src = include_str!("../main.rs");
    assert!(
        main_src.contains(".focus_input()"),
        "main.rs's is-active handler must dispatch via the generic \
         `Tab::focus_input()` so non-AI tabs (Browser, Terminal, …) can \
         provide their own focus target"
    );
    let ai_src = include_str!("../tab/ai_conversation.rs");
    assert!(
        ai_src.contains("input_view.grab_focus()")
            || ai_src.contains("self.widgets.input_view.grab_focus()"),
        "AiConversationTab::focus_input must call grab_focus() on its \
         input_view so the cursor lands in the prompt after Cmd+Tab"
    );
}
