//! Tests for the GTK event-dispatch / poll-loop wiring.
//!
//! Stage 4 of the GTK main.rs refactor (see `docs/gtk-main-refactoring.md`).
//! The ~290-line `glib::timeout_add_local` poll loop that drains
//! `ConversationEvent`s, renders streaming Markdown, manages the
//! UserQuestion-dialog queue, fires desktop notifications, and debounces
//! viewport-resize re-renders lives in `event_dispatch.rs`. `main.rs` only
//! calls `event_dispatch::wire(EventDispatchContext { ... })`.

#[test]
fn test_event_dispatch_module_exists() {
    let src = include_str!("../event_dispatch.rs");
    assert!(
        src.contains("pub fn wire"),
        "event_dispatch.rs must export a wire() function"
    );
}

#[test]
fn test_event_dispatch_defines_context_struct() {
    let src = include_str!("../event_dispatch.rs");
    assert!(
        src.contains("pub struct EventDispatchContext"),
        "event_dispatch.rs must define an EventDispatchContext struct (10+ captures need bundling)"
    );
}

#[test]
fn test_main_rs_calls_event_dispatch_wire() {
    // Stage B: per-tab wiring moved from main.rs to tab.rs (called from
    // tab::attach_new_tab so every tab gets its own 16ms event loop).
    let src = include_str!("../tab.rs");
    assert!(
        src.contains("event_dispatch::wire"),
        "tab.rs (per-tab wiring SSoT) must delegate to event_dispatch::wire"
    );
}

#[test]
fn test_main_rs_declares_event_dispatch_module() {
    let src = include_str!("../main.rs");
    assert!(
        src.contains("mod event_dispatch;"),
        "main.rs must declare `mod event_dispatch;`"
    );
}

#[test]
fn test_main_rs_no_inline_poll_loop_comment() {
    let src = include_str!("../main.rs");
    assert!(
        !src.contains("// --- Poll conversation events on GTK main loop ---"),
        "main.rs must not contain the inline 'Poll conversation events' comment block — moved to event_dispatch.rs"
    );
}

#[test]
fn test_main_rs_no_inline_timeout_add_local_for_events() {
    // The poll-loop timeout (16ms) was the only timeout_add_local in main.rs.
    // After Stage 4 it should have moved to event_dispatch.rs.
    let src = include_str!("../main.rs");
    assert!(
        !src.contains("glib::timeout_add_local(Duration::from_millis(16)"),
        "main.rs must not contain the 16ms event-dispatch timeout — moved to event_dispatch.rs"
    );
}

#[test]
fn test_event_dispatch_uses_16ms_tick() {
    let src = include_str!("../event_dispatch.rs");
    assert!(
        src.contains("Duration::from_millis(16)"),
        "event_dispatch.rs must keep the 16ms (~60Hz) GTK tick rate"
    );
}

#[test]
fn test_event_dispatch_handles_text_complete_and_tool_use_start() {
    let src = include_str!("../event_dispatch.rs");
    assert!(
        src.contains("ConversationEvent::TextComplete"),
        "event_dispatch.rs must finalize streaming on TextComplete"
    );
    assert!(
        src.contains("ConversationEvent::ToolUseStart"),
        "event_dispatch.rs must finalize streaming on ToolUseStart"
    );
}

#[test]
fn test_event_dispatch_auto_saves_session_on_turn_complete() {
    let src = include_str!("../event_dispatch.rs");
    assert!(
        src.contains("ConversationEvent::TurnComplete")
            && src.contains("ConversationEvent::CompactionComplete")
            && src.contains("BackgroundCommand::SaveSession"),
        "event_dispatch.rs must auto-save the session after TurnComplete or CompactionComplete"
    );
}

#[test]
fn test_event_dispatch_drives_user_question_dialog_queue() {
    let src = include_str!("../event_dispatch.rs");
    assert!(
        src.contains("uq_queue") && src.contains("show_user_question_dialog"),
        "event_dispatch.rs must drain the UserQuestion queue and show dialogs sequentially"
    );
}

#[test]
fn test_event_dispatch_respects_auto_scroll() {
    let src = include_str!("../event_dispatch.rs");
    assert!(
        src.contains("scroll_to_bottom_if_auto") && src.contains("auto_scroll.is_active()"),
        "event_dispatch.rs must use scroll_to_bottom_if_auto and gate scrolling on auto_scroll.is_active()"
    );
}

#[test]
fn test_event_dispatch_debounces_viewport_resize() {
    let src = include_str!("../event_dispatch.rs");
    assert!(
        src.contains("resize_stable_ticks") && src.contains("resize_pending_cols"),
        "event_dispatch.rs must debounce viewport-resize re-renders"
    );
}

#[test]
fn test_event_dispatch_sends_turn_complete_notification() {
    let src = include_str!("../event_dispatch.rs");
    assert!(
        src.contains("send_turn_complete_notification"),
        "event_dispatch.rs must send a desktop notification when a turn completes"
    );
}
