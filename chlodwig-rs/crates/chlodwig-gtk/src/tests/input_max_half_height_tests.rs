//! Tests for issue #26 — the input area must scale to at most half the
//! window height. When the content exceeds the cap, the input becomes
//! internally scrollable (vertical scrollbar inside the input).
//!
//! GTK widgets cannot be instantiated without a display server, so the
//! guards are at the source level: we assert the window code dynamically
//! resizes `max_content_height` of the input ScrolledWindow whenever the
//! window's default-height changes.

const SRC: &str = include_str!("../window.rs");

#[test]
fn test_input_scroll_does_not_use_static_max_content_height() {
    // The static `.max_content_height(120)` cap is too small for tall
    // windows and ignores the window size. Issue #26 requires a
    // dynamic cap = window_height / 2.
    //
    // The `120` literal must no longer appear next to `max_content_height`
    // in the builder chain.
    let needle = "max_content_height(120)";
    assert!(
        !SRC.contains(needle),
        "window.rs must not pin input ScrolledWindow's max_content_height \
         to a static `120` (issue #26). Use a dynamic cap = window \
         height / 2, updated on resize."
    );
}

#[test]
fn test_input_scroll_max_content_height_set_dynamically_from_window_height() {
    // The fix wires the window's default-height (or allocated height) to
    // the input ScrolledWindow's max_content_height. Look for the
    // canonical signal hookup pattern.
    assert!(
        SRC.contains("set_max_content_height"),
        "window.rs must call set_max_content_height on the input \
         ScrolledWindow at runtime (issue #26)."
    );
    assert!(
        SRC.contains("notify_default_height")
            || SRC.contains("connect_default_height_notify")
            || SRC.contains("\"notify::default-height\"")
            || SRC.contains("connect_notify_local"),
        "window.rs must react to the window's height changes (e.g. via \
         connect_default_height_notify) so the input cap stays at \
         half the window height (issue #26)."
    );
}

#[test]
fn test_input_scroll_keeps_internal_vscrollbar_policy_automatic() {
    // When content exceeds the cap the input must show a vertical
    // scrollbar — i.e. vscrollbar_policy stays Automatic (not Never).
    assert!(
        SRC.contains("vscrollbar_policy(PolicyType::Automatic)"),
        "input ScrolledWindow must keep PolicyType::Automatic for \
         vertical scrollbar so it becomes internally scrollable above \
         the half-window cap (issue #26)."
    );
}
