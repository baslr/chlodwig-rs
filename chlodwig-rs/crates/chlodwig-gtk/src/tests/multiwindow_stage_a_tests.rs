//! Stage A of MULTIWINDOW_TABS.md — extract `build_tab_content()` and
//! `build_window_shell()` from `build_window()`.
//!
//! Goal of Stage A: zero functional change (still 1 tab per window), but
//! the per-tab widget tree becomes a self-contained unit that can later be
//! placed inside an `adw::TabView` (Stage B). Every test in this module is
//! a source-grep guard — the GTK widgets cannot be instantiated from a
//! plain `cargo test --release --workspace` without a display server, so
//! we enforce the architectural shape statically.
//!
//! Single-source-of-truth rule (Gotchas #37, #39, #40, #43): widget
//! construction (`EmojiTextView::with_buffer`, `ScrolledWindow::builder`,
//! the input `TextView::builder`, status labels) lives in exactly ONE
//! place — `build_tab_content`. `build_window_shell` only creates the
//! `ApplicationWindow` shell + loads CSS. `build_window` is a thin
//! composer that calls the two.

const SRC: &str = include_str!("../window.rs");

// ── Shape of the public API ─────────────────────────────────────────────

#[test]
fn test_build_tab_content_function_exists() {
    assert!(
        SRC.contains("pub fn build_tab_content("),
        "window.rs must expose `pub fn build_tab_content(cwd: &Path) -> TabContent` \
         — the per-tab widget builder (Stage A of MULTIWINDOW_TABS.md)"
    );
}

#[test]
fn test_build_tab_content_takes_cwd_and_returns_tab_content() {
    // Locate signature line to assert parameter and return type.
    let sig_start = SRC
        .find("pub fn build_tab_content(")
        .expect("build_tab_content must exist (see test_build_tab_content_function_exists)");
    let sig_end = SRC[sig_start..]
        .find('{')
        .expect("function signature must end with `{`");
    let sig = &SRC[sig_start..sig_start + sig_end];
    assert!(
        sig.contains("cwd:") && sig.contains("Path"),
        "build_tab_content must take a `cwd: &Path`-style parameter — got:\n{sig}"
    );
    assert!(
        sig.contains("-> TabContent"),
        "build_tab_content must return `TabContent` — got:\n{sig}"
    );
}

#[test]
fn test_build_window_shell_function_exists() {
    assert!(
        SRC.contains("pub fn build_window_shell("),
        "window.rs must expose `pub fn build_window_shell(app, title) -> ApplicationWindow` \
         — the window-level shell builder (Stage A of MULTIWINDOW_TABS.md)"
    );
}

#[test]
fn test_build_window_shell_returns_application_window() {
    let sig_start = SRC
        .find("pub fn build_window_shell(")
        .expect("build_window_shell must exist");
    let sig_end = SRC[sig_start..]
        .find('{')
        .expect("function signature must end with `{`");
    let sig = &SRC[sig_start..sig_start + sig_end];
    assert!(
        sig.contains("-> ApplicationWindow"),
        "build_window_shell must return `ApplicationWindow` — got:\n{sig}"
    );
}

// ── TabContent struct shape ─────────────────────────────────────────────

#[test]
fn test_tab_content_struct_exists() {
    assert!(
        SRC.contains("pub struct TabContent"),
        "window.rs must define `pub struct TabContent` — the per-tab unit"
    );
}

#[test]
fn test_tab_content_has_root_widgets_cwd_fields() {
    let start = SRC
        .find("pub struct TabContent")
        .expect("TabContent must exist");
    let end = SRC[start..]
        .find('}')
        .expect("TabContent struct body must close");
    let body = &SRC[start..start + end];
    assert!(
        body.contains("pub root:"),
        "TabContent must expose `pub root: GtkBox` (the per-tab widget tree root) — got:\n{body}"
    );
    assert!(
        body.contains("pub widgets:") && body.contains("UiWidgets"),
        "TabContent must expose `pub widgets: UiWidgets` — got:\n{body}"
    );
    assert!(
        body.contains("pub cwd:") && body.contains("PathBuf"),
        "TabContent must expose `pub cwd: PathBuf` — got:\n{body}"
    );
}

// ── UiWidgets gains input_scroll (needed by window-level height cap) ───

#[test]
fn test_ui_widgets_exposes_input_scroll() {
    // The input ScrolledWindow used to be a function-local in build_window
    // captured only by the resize closure. Stage A lifts it into UiWidgets
    // so the window-level resize cap can be wired by `build_window` AFTER
    // `build_tab_content` has constructed the per-tab tree.
    let start = SRC
        .find("pub struct UiWidgets")
        .expect("UiWidgets must exist");
    let end = SRC[start..]
        .find("\n}\n")
        .expect("UiWidgets struct body must close");
    let body = &SRC[start..start + end];
    assert!(
        body.contains("pub input_scroll:") && body.contains("ScrolledWindow"),
        "UiWidgets must expose `pub input_scroll: ScrolledWindow` so build_window \
         can wire the per-window input-height cap — got:\n{body}"
    );
}

// ── Composition: build_window calls the two extracted functions ────────

#[test]
fn test_build_window_calls_build_tab_content() {
    let start = SRC.find("pub fn build_window(").expect("build_window must exist");
    // Body extends from the opening `{` of build_window to the next
    // top-level `\n}\n`. Conservatively scan a generous window.
    let body_start = start + SRC[start..].find('{').unwrap();
    let body_end = body_start
        + SRC[body_start..]
            .find("\n}\n")
            .expect("build_window body must close");
    let body = &SRC[body_start..body_end];
    assert!(
        body.contains("build_tab_content("),
        "build_window must compose via `build_tab_content(cwd)` — got body:\n{body}"
    );
    assert!(
        body.contains("build_window_shell("),
        "build_window must compose via `build_window_shell(app, …)` — got body:\n{body}"
    );
}

// ── Single-source-of-truth: widget construction lives only in build_tab_content

#[test]
fn test_emoji_text_views_constructed_only_in_build_tab_content() {
    // The two EmojiTextView::with_buffer calls (final_view + streaming_view)
    // must live in `build_tab_content`, not in `build_window` or
    // `build_window_shell`. This prevents Stage B from accidentally
    // duplicating widget creation when adding more tabs to a window.
    let count_total = SRC.matches("EmojiTextView::with_buffer").count();
    assert_eq!(
        count_total, 2,
        "Exactly two EmojiTextView::with_buffer calls must exist in window.rs \
         (final_view + streaming_view); found {count_total}"
    );

    // Both must be inside build_tab_content's body.
    let tab_start = SRC
        .find("pub fn build_tab_content(")
        .expect("build_tab_content must exist");
    let tab_body_start = tab_start + SRC[tab_start..].find('{').unwrap();
    let tab_body_end = tab_body_start
        + SRC[tab_body_start..]
            .find("\n}\n")
            .expect("build_tab_content body must close");
    let tab_body = &SRC[tab_body_start..tab_body_end];
    let count_in_tab = tab_body.matches("EmojiTextView::with_buffer").count();
    assert_eq!(
        count_in_tab, 2,
        "Both EmojiTextView::with_buffer calls must live inside build_tab_content; \
         found {count_in_tab} (the rest are leaking into build_window or shell)"
    );
}

#[test]
fn test_build_window_shell_does_not_construct_per_tab_widgets() {
    // The shell must NOT touch any per-tab widget — those are the tab's job.
    let shell_start = SRC
        .find("pub fn build_window_shell(")
        .expect("build_window_shell must exist");
    let shell_body_start = shell_start + SRC[shell_start..].find('{').unwrap();
    let shell_body_end = shell_body_start
        + SRC[shell_body_start..]
            .find("\n}\n")
            .expect("build_window_shell body must close");
    let shell = &SRC[shell_body_start..shell_body_end];
    for forbidden in [
        "EmojiTextView::with_buffer",
        "TextView::builder",
        "send_button",
        "status_left_label",
        "status_right_label",
    ] {
        assert!(
            !shell.contains(forbidden),
            "build_window_shell must not construct per-tab widgets; found `{forbidden}` in:\n{shell}"
        );
    }
}

// ── main.rs migration: callers consume tab.widgets ─────────────────────

#[test]
fn test_main_rs_consumes_tab_content_from_build_window() {
    let main_src = include_str!("../main.rs");
    // After Stage A, build_window returns (ApplicationWindow, TabContent).
    // main.rs must pull `widgets` out of the tab — either via destructure
    // or field access — to feed the existing context structs (MenuContext,
    // SubmitContext, EventDispatchContext) that still take UiWidgets.
    assert!(
        main_src.contains("tab.widgets") || main_src.contains("let TabContent"),
        "main.rs must extract `widgets` from the returned TabContent \
         (either `tab.widgets` field access or destructure `let TabContent {{ widgets, .. }}`)"
    );
}
