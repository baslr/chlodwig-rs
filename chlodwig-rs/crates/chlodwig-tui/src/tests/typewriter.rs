//! Tests for the adaptive typewriter effect.
//!
//! The typewriter happens in the streaming thread (conversation.rs), NOT in the TUI.
//! SSE TextDelta chars are pushed into a VecDeque<char> buffer. A `tokio::select!`
//! loop concurrently reads new SSE events AND ticks chars out of the buffer at a
//! smooth, adaptive rate. The tick interval adapts to the buffer fill level:
//! when the buffer is full, chars are sent faster; when nearly empty, slower.
//! This decouples SSE arrival jitter from the display rate → smooth typewriter.
//!
//! The TUI-side methods are simple:
//! - `append_streaming_text(&str)` — push text to streaming_buffer, set lines_dirty
//! - `finalize_text_complete(text)` — clear streaming_buffer, push DisplayBlock

use crate::app::App;
use crate::types::DisplayBlock;

// ── append_streaming_text ─────────────────────────────────────────

#[test]
fn test_append_streaming_text_pushes_to_buffer() {
    let mut app = App::new("test".into());
    app.append_streaming_text("hello");
    assert_eq!(app.streaming_buffer, "hello");
}

#[test]
fn test_append_streaming_text_accumulates() {
    let mut app = App::new("test".into());
    app.append_streaming_text("hel");
    app.append_streaming_text("lo");
    assert_eq!(app.streaming_buffer, "hello");
}

#[test]
fn test_append_streaming_text_utf8() {
    let mut app = App::new("test".into());
    app.append_streaming_text("ü");
    app.append_streaming_text("b");
    app.append_streaming_text("e");
    app.append_streaming_text("r");
    assert_eq!(app.streaming_buffer, "über");
}

#[test]
fn test_append_streaming_text_emoji() {
    let mut app = App::new("test".into());
    app.append_streaming_text("🎉");
    app.append_streaming_text("o");
    app.append_streaming_text("k");
    assert_eq!(app.streaming_buffer, "🎉ok");
}

#[test]
fn test_append_streaming_text_sets_lines_dirty() {
    let mut app = App::new("test".into());
    app.lines_dirty = false;
    app.append_streaming_text("a");
    assert!(app.lines_dirty, "append should mark lines dirty");
}

#[test]
fn test_append_streaming_text_empty_is_noop() {
    let mut app = App::new("test".into());
    app.lines_dirty = false;
    app.append_streaming_text("");
    assert!(!app.lines_dirty, "empty append should not mark dirty");
    assert!(app.streaming_buffer.is_empty());
}

// ── finalize_text_complete ────────────────────────────────────────

#[test]
fn test_finalize_text_complete_clears_buffer_creates_block() {
    let mut app = App::new("test".into());
    app.append_streaming_text("hello world");

    app.finalize_text_complete("hello world".to_string());

    assert!(app.streaming_buffer.is_empty());
    assert!(
        app.display_blocks.iter().any(|b| matches!(b, DisplayBlock::AssistantText(t) if t == "hello world")),
        "Should have an AssistantText block"
    );
}

#[test]
fn test_finalize_text_complete_pushes_timestamp() {
    let mut app = App::new("test".into());
    app.finalize_text_complete("test".to_string());
    assert!(app.display_blocks.len() >= 2);
    assert!(matches!(&app.display_blocks[app.display_blocks.len() - 2], DisplayBlock::Timestamp(_)));
    assert!(matches!(&app.display_blocks[app.display_blocks.len() - 1], DisplayBlock::AssistantText(_)));
}

#[test]
fn test_finalize_text_complete_marks_lines_dirty() {
    let mut app = App::new("test".into());
    app.lines_dirty = false;
    app.finalize_text_complete("done".to_string());
    assert!(app.lines_dirty);
}

// ── Streaming timestamp (shown immediately during streaming) ─────

#[test]
fn test_append_streaming_text_sets_timestamp_on_first_call() {
    // The first append_streaming_text must set streaming_timestamp so the
    // timestamp is visible from the very first character — no "ruckel" when
    // finalize_text_complete inserts the Timestamp block later.
    let mut app = App::new("test".into());
    assert!(app.streaming_timestamp.is_none());
    app.append_streaming_text("a");
    assert!(app.streaming_timestamp.is_some(), "streaming_timestamp must be set on first append");
}

#[test]
fn test_append_streaming_text_does_not_overwrite_timestamp() {
    // Subsequent appends must NOT change the timestamp — it stays at the
    // time of the first character.
    let mut app = App::new("test".into());
    app.append_streaming_text("a");
    let ts = app.streaming_timestamp.clone().unwrap();
    app.append_streaming_text("b");
    assert_eq!(app.streaming_timestamp.as_ref().unwrap(), &ts, "timestamp must not change on subsequent appends");
}

#[test]
fn test_finalize_clears_streaming_timestamp() {
    // After finalize, streaming_timestamp must be None so it's not
    // rendered twice (once as streaming, once as DisplayBlock).
    let mut app = App::new("test".into());
    app.append_streaming_text("hello");
    assert!(app.streaming_timestamp.is_some());
    app.finalize_text_complete("hello".to_string());
    assert!(app.streaming_timestamp.is_none(), "streaming_timestamp must be cleared after finalize");
}

#[test]
fn test_rebuild_lines_includes_streaming_timestamp() {
    // When streaming_buffer is non-empty and streaming_timestamp is set,
    // rebuild_lines must include the timestamp line BEFORE the streamed text.
    let mut app = App::new("test".into());
    app.wrap_width = 80;
    app.append_streaming_text("hello world");
    app.rebuild_lines();

    // The rendered lines must contain the timestamp text
    let ts = app.streaming_timestamp.clone().unwrap();
    let has_ts = app.rendered_lines.iter().any(|line| {
        line.spans.iter().any(|(text, _)| text.contains(&ts))
    });
    assert!(has_ts, "rendered lines must include streaming_timestamp before the streamed text");
}

#[test]
fn test_rebuild_lines_streaming_timestamp_before_content() {
    // The timestamp line must come BEFORE the streaming content, so that
    // when finalize converts to DisplayBlock::Timestamp + AssistantText,
    // the layout doesn't shift.
    let mut app = App::new("test".into());
    app.wrap_width = 80;
    app.append_streaming_text("hello");
    app.rebuild_lines();

    let ts = app.streaming_timestamp.clone().unwrap();
    let ts_line_idx = app.rendered_lines.iter().position(|line| {
        line.spans.iter().any(|(text, _)| text.contains(&ts))
    });
    let content_line_idx = app.rendered_lines.iter().position(|line| {
        line.spans.iter().any(|(text, _)| text.contains("hello"))
    });
    assert!(ts_line_idx.is_some(), "must have timestamp line");
    assert!(content_line_idx.is_some(), "must have content line");
    assert!(
        ts_line_idx.unwrap() < content_line_idx.unwrap(),
        "timestamp must appear before streaming content"
    );
}

// ── Event loop integration (source-scan) ─────────────────────────

#[test]
fn test_event_loop_text_delta_uses_append() {
    // TextDelta handler should call append_streaming_text, not enqueue
    let src = include_str!("../event_loop.rs");
    let delta_arm = src.find("ConversationEvent::TextDelta(text) =>").expect("TextDelta match arm");
    let next_arm = src[delta_arm + 30..].find("ConversationEvent::").map(|i| delta_arm + 30 + i).unwrap_or(src.len());
    let arm_body = &src[delta_arm..next_arm];
    assert!(
        arm_body.contains("append_streaming_text"),
        "TextDelta should call append_streaming_text. Got:\n{arm_body}"
    );
}

#[test]
fn test_event_loop_text_complete_uses_finalize() {
    // TextComplete handler must call finalize_text_complete
    let src = include_str!("../event_loop.rs");
    let tc_arm = src.find("ConversationEvent::TextComplete(text) =>").expect("TextComplete match arm");
    let next_arm = src[tc_arm + 30..].find("ConversationEvent::").map(|i| tc_arm + 30 + i).unwrap_or(src.len());
    let arm_body = &src[tc_arm..next_arm];
    assert!(
        arm_body.contains("finalize_text_complete"),
        "TextComplete should call finalize_text_complete. Got:\n{arm_body}"
    );
}

#[test]
fn test_event_loop_no_typewriter_queue() {
    // The event loop should NOT have any typewriter queue or drain logic
    let src = include_str!("../event_loop.rs");
    assert!(
        !src.contains("typewriter_queue"),
        "Event loop should not reference typewriter_queue — typewriter happens in streaming thread"
    );
    assert!(
        !src.contains("drain_typewriter"),
        "Event loop should not call drain_typewriter — typewriter happens in streaming thread"
    );
    assert!(
        !src.contains("has_typewriter_pending"),
        "Event loop should not check has_typewriter_pending"
    );
}

// ── Conversation-side typewriter (source-scan of conversation.rs) ─

#[test]
fn test_conversation_uses_char_buffer() {
    // The conversation loop should buffer chars in a VecDeque for smooth output.
    // Chars from SSE TextDelta events are pushed into the buffer, and a concurrent
    // ticker pops them out at a smooth rate.
    let src = include_str!("../../../chlodwig-core/src/conversation.rs");
    assert!(
        src.contains("char_buffer") || src.contains("char_buf"),
        "Conversation loop should use a char buffer (VecDeque) for typewriter effect"
    );
}

#[test]
fn test_conversation_uses_select_for_concurrent_read_and_tick() {
    // The conversation loop must use tokio::select! to concurrently:
    // 1. Read new SSE events from the stream
    // 2. Tick chars out of the buffer at a smooth rate
    // Without select!, the sleep blocks stream.next() → SSE events back up → jitter.
    let src = include_str!("../../../chlodwig-core/src/conversation.rs");
    assert!(
        src.contains("select!") || src.contains("tokio::select"),
        "Conversation loop must use tokio::select! to concurrently read SSE and tick chars"
    );
}

#[test]
fn test_conversation_adapts_tick_rate_to_buffer_fill() {
    // The tick rate should adapt based on how full the char buffer is.
    // Full buffer → faster ticks (drain backlog). Nearly empty → slower
    // ticks (stretch out the available chars for smooth appearance).
    let src = include_str!("../../../chlodwig-core/src/conversation.rs");
    assert!(
        src.contains("char_buffer.len()") || src.contains("char_buf.len()") || src.contains("buf_len"),
        "Tick rate must adapt based on buffer fill level"
    );
}

#[test]
fn test_conversation_no_blocking_sleep_in_char_loop() {
    // There must NOT be a `for c in text.chars() { sleep }` loop that
    // blocks stream.next(). That pattern causes SSE events to back up
    // and produces jerky output. The select! approach replaces it.
    // Note: `for ch in text.chars() { push_back }` is fine — it's the
    // sleep-inside-loop that's forbidden.
    let src = include_str!("../../../chlodwig-core/src/conversation.rs");
    // Find any `for c/ch in text.chars()` that contains `sleep` in the loop body
    let has_blocking_pattern = src.contains("for c in text.chars()") && {
        // Check if there's a sleep nearby (within ~200 chars after)
        if let Some(pos) = src.find("for c in text.chars()") {
            let after = &src[pos..std::cmp::min(pos + 300, src.len())];
            after.contains("sleep(") || after.contains("tokio::time::sleep")
        } else {
            false
        }
    };
    assert!(
        !has_blocking_pattern,
        "Must NOT have `for c in text.chars() {{ sleep }}` — it blocks stream.next(). \
         Use select! with a char buffer instead."
    );
}

#[test]
fn test_conversation_no_min_char_interval() {
    // There must be NO artificial minimum per-char interval.
    // When SSE events arrive fast, the typewriter must also be fast.
    // Zero artificial slowdown — speed tracks the real SSE arrival rate.
    let src = include_str!("../../../chlodwig-core/src/conversation.rs");
    assert!(
        !src.contains("MIN_CHAR_INTERVAL"),
        "There must be no MIN_CHAR_INTERVAL — no artificial slowdown. \
         Speed must track the real SSE arrival rate."
    );
}
