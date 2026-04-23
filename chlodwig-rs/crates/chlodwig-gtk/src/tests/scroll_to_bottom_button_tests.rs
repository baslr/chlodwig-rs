//! Tests for the floating "↓ jump to bottom" button (issue #28).
//!
//! ── Single source of truth ─────────────────────────────────────────────
//!
//! The button is a per-tab widget — one button per `UiWidgets`. It lives
//! in the same place every per-tab widget lives: created in
//! `window::build_tab_content`, exposed on `UiWidgets` so that
//! `submit.rs` (click handler + keyboard shortcut) and
//! `tab/ai_conversation.rs` (visibility flip in the existing
//! `connect_value_changed` handler) can wire it without duplicating
//! the "where does the button live?" question.
//!
//! There is NO separate "scroll button visibility" handler — visibility
//! piggy-backs on the SAME `connect_value_changed` callback that already
//! drives `auto_scroll.user_reached_bottom()` /
//! `auto_scroll.user_scrolled_away()`. Same `at_bottom` boolean, same
//! 20-px tolerance, single classification of "is the user at the
//! bottom?" — see Gotcha #57 for the SSoT principle.

#[test]
fn test_ui_widgets_has_scroll_to_bottom_button_field() {
    let src = include_str!("../window.rs");
    assert!(
        src.contains("pub scroll_to_bottom_button: Button"),
        "window.rs `UiWidgets` must expose a `pub scroll_to_bottom_button: Button` \
         field (issue #28). Per-tab widget like every other entry in `UiWidgets`."
    );
}

#[test]
fn test_build_tab_content_constructs_scroll_to_bottom_button() {
    let src = include_str!("../window.rs");
    assert!(
        src.contains("scroll_to_bottom_button"),
        "build_tab_content must construct the scroll_to_bottom_button — \
         per-tab widgets are constructed exactly once, in this function \
         (Gotchas #37/#39/#40/#43)."
    );
    assert!(
        src.contains("\"scroll-to-bottom-btn\""),
        "the button must carry the `scroll-to-bottom-btn` CSS class so \
         `APP_CSS` can style it (circular, semi-transparent)."
    );
}

#[test]
fn test_button_is_initially_hidden() {
    // The user starts at the bottom (auto-scroll active) — button must
    // not be visible until they actually scroll up.
    let src = include_str!("../window.rs");
    // Look for "scroll_to_bottom_button" + ".set_visible(false)" close
    // together. Crude but robust enough for a source-grep guard.
    let idx = src.find("scroll_to_bottom_button = Button").unwrap_or_else(|| {
        src.find("let scroll_to_bottom_button").expect(
            "build_tab_content must have a `let scroll_to_bottom_button = ...` line",
        )
    });
    let window = &src[idx..(idx + 1500).min(src.len())];
    assert!(
        window.contains("set_visible(false)"),
        "the freshly-created scroll_to_bottom_button must be hidden by \
         default (set_visible(false) within ~1500 chars of its declaration); \
         it appears only when the user scrolls away from the bottom."
    );
}

#[test]
fn test_output_area_uses_overlay_so_button_floats_over_scroll() {
    let src = include_str!("../window.rs");
    assert!(
        src.contains("gtk4::Overlay::new()"),
        "build_tab_content must use a gtk4::Overlay so the \
         scroll_to_bottom_button can float above the ScrolledWindow \
         in the bottom-right corner (issue #28 UX requirement)."
    );
    assert!(
        src.contains("add_overlay"),
        "the button must be added via Overlay::add_overlay so it sits \
         on top of the ScrolledWindow rather than next to it."
    );
}

#[test]
fn test_button_anchored_bottom_right() {
    let src = include_str!("../window.rs");
    let idx = src.find("let scroll_to_bottom_button").expect("button decl");
    let window = &src[idx..(idx + 1500).min(src.len())];
    assert!(
        window.contains("Align::End"),
        "scroll_to_bottom_button must be anchored to the bottom-right \
         (halign=End, valign=End) per issue #28."
    );
}

#[test]
fn test_value_changed_handler_toggles_button_visibility() {
    let src = include_str!("../tab/ai_conversation.rs");
    assert!(
        src.contains("scroll_to_bottom_button"),
        "tab/ai_conversation.rs must drive the button's visibility from \
         the SAME connect_value_changed handler that already classifies \
         at_bottom. No second visibility handler — single source of truth."
    );
    // Visibility must flip with at_bottom: hidden when at bottom,
    // visible when scrolled away.
    assert!(
        src.contains("scroll_to_bottom_button.set_visible(!at_bottom)")
            || src.contains("set_visible(!at_bottom)"),
        "the existing connect_value_changed handler must call \
         `set_visible(!at_bottom)` on the button so visibility is \
         driven by the SAME at_bottom classification used for \
         auto_scroll (no duplicated logic)."
    );
}

#[test]
fn test_submit_wires_scroll_to_bottom_button_click() {
    // Per Gotcha #57: every UiWidgets button needs an explicit
    // source-grep regression test that submit.rs (the per-tab wirer)
    // attaches its connect_clicked handler. Without this guard, a
    // future refactor can drop the wiring and the button silently
    // becomes inert.
    let src = include_str!("../submit.rs");
    assert!(
        src.contains("scroll_to_bottom_button"),
        "submit.rs must reference scroll_to_bottom_button to wire its \
         click handler (issue #28). See Gotcha #57."
    );
    // Allow the call to be split across lines (`.scroll_to_bottom_button\n
    // ...    .connect_clicked`) by collapsing whitespace before the
    // contains check.
    let collapsed: String = src.split_whitespace().collect::<Vec<_>>().join(" ");
    assert!(
        collapsed.contains("scroll_to_bottom_button .connect_clicked")
            || collapsed.contains("scroll_to_bottom_button.connect_clicked"),
        "submit.rs must call `connect_clicked` on the \
         scroll_to_bottom_button (Gotcha #57)."
    );
}

#[test]
fn test_button_click_handler_forces_auto_scroll_on() {
    // Click must (1) force auto_scroll back on (so subsequent streaming
    // re-pins to bottom) and (2) actually scroll to the content bottom.
    // Both are necessary: just calling scroll_to_content_bottom without
    // flipping auto_scroll would scroll once and then immediately
    // freeze again on the next streaming event.
    let src = include_str!("../submit.rs");
    // Find the jump-to-bottom block by its anchor comment.
    let idx = src
        .find("Floating \"↓ jump to bottom\" button")
        .expect("submit.rs must have the jump-to-bottom block (anchor comment)");
    let window = &src[idx..(idx + 4000).min(src.len())];
    assert!(
        window.contains("auto_scroll.scroll_to_bottom()"),
        "click handler must call auto_scroll.scroll_to_bottom() so the \
         user's explicit jump re-enables auto-follow (issue #28: \
         \"Re-enable auto-follow\")."
    );
    assert!(
        window.contains("scroll_to_content_bottom"),
        "click handler must call window::scroll_to_content_bottom to \
         actually move the viewport (the auto_scroll flag alone does \
         not move pixels)."
    );
    // The jump-to-bottom block must wire connect_clicked. (Click is
    // the only trigger after M2; no shared keyboard closure anymore.)
    assert!(
        window.contains("connect_clicked"),
        "the jump-to-bottom block must wire connect_clicked here (Gotcha #57)."
    );
}

#[test]
fn test_no_keyboard_shortcut_for_jump_to_bottom() {
    // Issue #28 lists `End` and `Cmd+↓` as keyboard-shortcut SUGGESTIONS,
    // not requirements. Every plausible choice collides with TextView /
    // macOS text-editing defaults that fire while the cursor is in the
    // input field (which is the only place a key-controller on
    // `input_view` would receive events anyway):
    //
    //   - bare ↓             : cursor down within multiline input
    //   - bare End           : TextView "cursor to end-of-line"
    //   - Cmd+↓ (macOS)      : "cursor to end-of-document"
    //   - Cmd+↑ (macOS)      : "cursor to start-of-document"
    //   - Shift+↓            : extend SELECTION by one line (TextView)
    //   - Cmd+Shift+↓ (macOS): extend selection to end-of-document
    //   - Ctrl+Shift+↓ (macOS): extend selection to end-of-paragraph
    //
    // The button (with mouse) is the SSoT trigger. No shortcut wins
    // here — anything we bind would steal a sacred text-editing
    // gesture from the user's input area. (Code review iteration 2,
    // finding M2.)
    let src = include_str!("../submit.rs");
    let idx = src
        .find("Floating \"↓ jump to bottom\" button")
        .expect("submit.rs must have the jump-to-bottom block (anchor comment)");
    let end = src[idx..].find("// Cmd+Enter").unwrap_or(src.len() - idx);
    let block = &src[idx..idx + end];
    assert!(
        !block.contains("EventControllerKey"),
        "the jump-to-bottom block must NOT install an EventControllerKey \
         — every plausible shortcut collides with macOS / GTK4 TextView \
         text-editing defaults in the input field. Click is the only \
         trigger. (Code review iteration 2, finding M2.)"
    );
    assert!(
        !block.contains("Key::Down") && !block.contains("Key::End"),
        "no keyboard binding for Down or End in the jump-to-bottom block."
    );
}

#[test]
fn test_jump_to_bottom_hides_button_explicitly() {
    // The auto-scroll tick in event_dispatch.rs only runs the
    // visibility-flip when value-changed is classified as a USER
    // scroll (is_user_scroll). A click on the ↓ button calls
    // `scroll_to_content_bottom`, which triggers value-changed but
    // is NOT a user scroll — so the existing handler bails out and
    // the button would stay VISIBLE even after the user explicitly
    // jumped to the bottom.
    //
    // Fix: the jump_to_bottom closure itself hides the button via the
    // `btn_for_jump` clone. We grep for the EXACT call so a future
    // refactor that removes the explicit hide (or replaces it with a
    // different widget's set_visible) can't pass.
    let src = include_str!("../submit.rs");
    let idx = src
        .find("Floating \"↓ jump to bottom\" button")
        .expect("submit.rs must have the jump-to-bottom block (anchor comment)");
    let window = &src[idx..(idx + 4000).min(src.len())];
    let collapsed: String = window.split_whitespace().collect::<Vec<_>>().join(" ");
    assert!(
        collapsed.contains("btn_for_jump.set_visible(false)")
            || collapsed.contains("btn_for_jump .set_visible(false)"),
        "the jump_to_bottom closure must call EXACTLY \
         `btn_for_jump.set_visible(false)` — the value-changed handler \
         skips non-user scrolls so the button would otherwise stay \
         visible. (Code review fix #5, refined #K4.)"
    );
}

#[test]
fn test_jump_closure_does_not_bind_borrow_mut_to_local() {
    // Anti-regression for Gotcha #45 (RefCell borrow held across a GTK
    // setter that synchronously dispatches a signal handler that
    // re-borrows → BorrowMutError → abort across FFI). The
    // jump_to_bottom closure must use the borrow as an
    // expression-temporary (`state.borrow_mut().auto_scroll.scroll_to_bottom();`)
    // so it drops at the `;`. A `let mut state = state.borrow_mut();`
    // binding would keep it alive until the end of the closure scope —
    // crashing on the subsequent `set_visible` and
    // `scroll_to_content_bottom` calls. (Code review iteration 2,
    // finding B1.)
    let src = include_str!("../submit.rs");
    let idx = src
        .find("let jump_to_bottom")
        .expect("jump_to_bottom closure declaration");
    // The closure body sits between this `let` and the matching
    // `connect_clicked(...)` call that consumes it. 1500 bytes of
    // slack covers the closure even with verbose comments inside.
    let body = &src[idx..(idx + 1500).min(src.len())];
    let end_off = body
        .find("connect_clicked")
        .expect("closure must be wired via connect_clicked");
    let body = &body[..end_off];
    assert!(
        !body.contains("let mut state ="),
        "do NOT bind a `let mut state = state_for_jump.borrow_mut()` \
         in the jump_to_bottom closure. Use the borrow as an expression \
         temporary so it drops at the `;` BEFORE any GTK setter runs \
         (Gotcha #45)."
    );
    assert!(
        !body.contains("let state ="),
        "same as above for an immutable bind — no `let state = …borrow…` \
         in the closure (Gotcha #45)."
    );
}

#[test]
fn test_app_css_no_duplicate_min_width_in_scroll_to_bottom_rules() {
    // Code review iteration 2, finding M4: the previous CSS had the
    // `min-width`/`min-height`/`padding` declared in BOTH the
    // `.scroll-to-bottom-btn` rule AND the qualified
    // `button.scroll-to-bottom-btn` rule — the first one was dead
    // code (the qualified rule always overrode it). Properties that
    // libadwaita's `button.circular` does not touch
    // (`opacity`, plus :hover) belong on the unqualified selector.
    // Properties that DO collide need the qualified selector.
    //
    // Concretely: `min-width` MUST appear at most ONCE in the combined
    // scroll-to-bottom CSS — in the qualified rule.
    let src = include_str!("../lib.rs");
    // Find the CSS region anchored at the comment.
    let idx = src
        .find("Floating jump-to-bottom button (issue #28)")
        .expect("CSS anchor comment");
    let region = &src[idx..(idx + 3000).min(src.len())];
    let count = region.matches("min-width:").count();
    assert_eq!(
        count, 1,
        "`min-width:` must appear exactly once in the scroll-to-bottom \
         CSS region (only in `button.scroll-to-bottom-btn`). Found {count}. \
         The unqualified `.scroll-to-bottom-btn` rule must not duplicate \
         layout properties that need the qualified selector to win the \
         specificity war with `button.circular`. (Code review fix M4.)"
    );
}

#[test]
fn test_app_css_no_font_weight_bold_on_arrow() {
    // Code review iteration 2, finding K2: `font-weight: bold` on a
    // single arrow glyph "↓" is visually a no-op for Sarasa Mono J
    // (and produces ugly stroke-synthesis on macOS for fonts without
    // a real bold). Strip it.
    let src = include_str!("../lib.rs");
    let idx = src
        .find("Floating jump-to-bottom button (issue #28)")
        .expect("CSS anchor comment");
    let region = &src[idx..(idx + 3000).min(src.len())];
    assert!(
        !region.contains("font-weight: bold"),
        "remove `font-weight: bold` from the scroll-to-bottom CSS — \
         it has no visible effect on the arrow glyph and triggers \
         pseudo-bold stroke synthesis on macOS. (Code review fix K2.)"
    );
}

#[test]
fn test_button_tooltip_is_platform_neutral() {
    // Code review fix #7 + iteration 2 update: with the keyboard
    // shortcut removed (M2), the tooltip should NOT advertise a
    // shortcut at all. Click-only.
    let src = include_str!("../window.rs");
    let idx = src.find("let scroll_to_bottom_button").expect("button decl");
    let window = &src[idx..(idx + 1500).min(src.len())];
    assert!(
        !window.contains("⌘"),
        "tooltip must not contain the macOS-only ⌘ glyph (code review \
         fix #7)."
    );
    // Find the tooltip_text("...") and assert it does not mention a
    // shortcut name (since there is none).
    let tip_idx = window.find("tooltip_text(\"").expect("tooltip_text call");
    let tip_end = window[tip_idx + 14..].find("\")").expect("tooltip end");
    let tip = &window[tip_idx + 14..tip_idx + 14 + tip_end];
    assert!(
        !tip.contains("Shift") && !tip.contains("End") && !tip.contains("Ctrl"),
        "with the shortcut removed (M2), the tooltip text must not \
         advertise any keyboard shortcut. Got: {tip:?}"
    );
}

#[test]
fn test_app_css_styles_scroll_to_bottom_button() {
    let src = include_str!("../lib.rs");
    assert!(
        src.contains(".scroll-to-bottom-btn"),
        "APP_CSS must contain a `.scroll-to-bottom-btn` rule so the \
         floating button has its circular/semi-transparent look \
         (issue #28 UX requirement)."
    );
    // Code review fix #8: libadwaita's `button.circular` rule has CSS
    // specificity (0,1,1) — type + class. A bare `.scroll-to-bottom-btn`
    // selector is only (0,1,0) and loses the cascade for any property
    // both rules touch (e.g. min-width, padding). Use the qualified
    // form `button.scroll-to-bottom-btn` (0,1,1) so we win on equal
    // specificity (later rule in the same stylesheet).
    assert!(
        src.contains("button.scroll-to-bottom-btn"),
        "APP_CSS must use the qualified selector `button.scroll-to-bottom-btn` \
         so it matches libadwaita's `button.circular` specificity and the \
         cascade order resolves in our favor (code review fix #8)."
    );
}

#[test]
fn test_button_tooltip_no_macos_only_glyph() {
    // Code review fix #7: don't ship `⌘` (macOS-only glyph) in a
    // tooltip that Linux users also see.
    let src = include_str!("../window.rs");
    let idx = src.find("let scroll_to_bottom_button").expect("button decl");
    let window = &src[idx..(idx + 1500).min(src.len())];
    assert!(
        !window.contains("⌘"),
        "tooltip must not contain the macOS-only ⌘ glyph (code review \
         fix #7)."
    );
}

#[test]
fn test_button_margin_clears_linux_scrollbar() {
    // Code review fix #6: the scrollbar on Linux/X11 takes ~13-15 px.
    // A 16 px margin barely clears it and the button can occlude the
    // scrollbar thumb. 20 px gives a comfortable gap on every backend
    // (macOS overlay scrollbars are 0 px wide so we lose nothing).
    let src = include_str!("../window.rs");
    let idx = src.find("let scroll_to_bottom_button").expect("button decl");
    let window = &src[idx..(idx + 1500).min(src.len())];
    assert!(
        window.contains("margin_end(20)"),
        "scroll_to_bottom_button must use `margin_end(20)` to clear the \
         Linux scrollbar (code review fix #6)."
    );
}
