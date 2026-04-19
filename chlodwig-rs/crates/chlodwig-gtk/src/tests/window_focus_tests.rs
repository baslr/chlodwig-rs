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
    let src = include_str!("../main.rs");
    // The handler installed above must call grab_focus on the input view.
    // We check that "input_view" and "grab_focus" co-occur inside the same
    // closure by requiring that grab_focus is called on something derived
    // from input_view in the file.
    assert!(
        src.contains("input_view.grab_focus()")
            || src.contains("input_view_for_focus.grab_focus()"),
        "main.rs must call grab_focus() on the input_view (or a clone of it) \
         so the cursor lands in the prompt after Cmd+Tab"
    );
}
