//! Tests for AppState — all GTK-independent, no display server needed.

use crate::app_state::{AppState, DisplayBlock, SPINNER_FRAMES};
use chlodwig_core::ConversationEvent;

#[test]
fn test_new_state_is_empty() {
    let state = AppState::new("test-model".into());
    assert!(state.blocks.is_empty());
    assert!(state.streaming_buffer.is_empty());
    assert!(!state.is_streaming);
    assert_eq!(state.input_tokens, 0);
    assert_eq!(state.output_tokens, 0);
    assert_eq!(state.request_count, 0);
    assert_eq!(state.model, "test-model");
}

// ── Per-tab CWD (Stage 0 of MULTIWINDOW_TABS.md) ──────────────────

/// `AppState` must own its working directory as a field, not read it from
/// the process-global `std::env::current_dir()`. This is the foundation
/// for per-tab CWD isolation.
#[test]
fn test_app_state_has_cwd_field() {
    let cwd = std::path::PathBuf::from("/tmp/some/tab/cwd");
    let state = AppState::with_cwd("m".into(), cwd.clone());
    assert_eq!(state.cwd, cwd);
}

/// The legacy `new(model)` constructor must still work — it falls back to
/// the current process CWD as a default. Callers that care about per-tab
/// isolation should use `with_cwd`.
#[test]
fn test_app_state_new_defaults_cwd_to_process_cwd() {
    let state = AppState::new("m".into());
    let expected = std::env::current_dir().unwrap_or_default();
    assert_eq!(state.cwd, expected);
}

/// Two `AppState` instances must be able to hold independent CWDs without
/// affecting each other or the process CWD.
#[test]
fn test_two_app_states_have_independent_cwds() {
    let process_cwd_before = std::env::current_dir().unwrap();

    let a = AppState::with_cwd("m".into(), std::path::PathBuf::from("/tab/a"));
    let b = AppState::with_cwd("m".into(), std::path::PathBuf::from("/tab/b"));

    assert_eq!(a.cwd, std::path::PathBuf::from("/tab/a"));
    assert_eq!(b.cwd, std::path::PathBuf::from("/tab/b"));
    assert_ne!(a.cwd, b.cwd);

    // Crucially: creating per-tab AppStates must not touch the process CWD.
    assert_eq!(std::env::current_dir().unwrap(), process_cwd_before);
}

// ── Methods derived from state.cwd (Stage 0.3) ──────────────────────

#[test]
fn test_project_dir_name_method_uses_state_cwd() {
    let state = AppState::with_cwd(
        "m".into(),
        std::path::PathBuf::from("/Users/me/projects/my-cool-app"),
    );
    assert_eq!(state.project_dir_name(), "my-cool-app");
}

#[test]
fn test_project_dir_name_method_root_returns_empty() {
    let state = AppState::with_cwd("m".into(), std::path::PathBuf::from("/"));
    assert_eq!(state.project_dir_name(), "");
}

#[test]
fn test_startup_cwd_message_method_uses_state_cwd() {
    let state = AppState::with_cwd(
        "m".into(),
        std::path::PathBuf::from("/tmp/per-tab/here"),
    );
    let msg = state.startup_cwd_message();
    assert!(msg.contains("/tmp/per-tab/here"), "got: {msg}");
    assert!(msg.contains("cwd"), "label missing in: {msg}");
}

/// Two AppStates with different CWDs must produce different startup
/// messages — proves the method is reading state.cwd, not the process CWD.
#[test]
fn test_startup_cwd_message_method_distinguishes_two_states() {
    let a = AppState::with_cwd("m".into(), std::path::PathBuf::from("/tab/a"));
    let b = AppState::with_cwd("m".into(), std::path::PathBuf::from("/tab/b"));
    assert_ne!(a.startup_cwd_message(), b.startup_cwd_message());
    assert!(a.startup_cwd_message().contains("/tab/a"));
    assert!(b.startup_cwd_message().contains("/tab/b"));
}

#[test]
fn test_text_delta_accumulates_in_streaming_buffer() {
    let mut state = AppState::new("m".into());
    let changed = state.handle_event(ConversationEvent::TextDelta("Hello".into()));
    assert!(changed);
    assert_eq!(state.streaming_buffer, "Hello");

    state.handle_event(ConversationEvent::TextDelta(" world".into()));
    assert_eq!(state.streaming_buffer, "Hello world");
    // No display block yet — still streaming
    assert!(state.blocks.is_empty());
}

#[test]
fn test_text_complete_creates_block_and_clears_buffer() {
    let mut state = AppState::new("m".into());
    state.handle_event(ConversationEvent::TextDelta("partial".into()));
    state.handle_event(ConversationEvent::TextComplete("full text".into()));

    // streaming_buffer should be cleared
    assert!(state.streaming_buffer.is_empty());

    // Should have 1 block (TextComplete replaces streaming, not TextDelta flush)
    assert_eq!(state.blocks.len(), 1);
    match &state.blocks[0] {
        DisplayBlock::AssistantText(t) => assert_eq!(t, "full text"),
        other => panic!("expected AssistantText, got {:?}", other),
    }
}

#[test]
fn test_tool_use_start_flushes_streaming_first() {
    let mut state = AppState::new("m".into());
    state.handle_event(ConversationEvent::TextDelta("before tool".into()));
    state.handle_event(ConversationEvent::ToolUseStart {
        id: "t1".into(),
        name: "Bash".into(),
        input: serde_json::json!({"command": "ls"}),
    });

    // Should have 2 blocks: flushed text + tool start
    assert_eq!(state.blocks.len(), 2);
    match &state.blocks[0] {
        DisplayBlock::AssistantText(t) => assert_eq!(t, "before tool"),
        other => panic!("expected AssistantText, got {:?}", other),
    }
    match &state.blocks[1] {
        DisplayBlock::ToolUseStart { name, .. } => assert_eq!(name, "Bash"),
        other => panic!("expected ToolUseStart, got {:?}", other),
    }
}

#[test]
fn test_tool_result_creates_block() {
    let mut state = AppState::new("m".into());
    let changed = state.handle_event(ConversationEvent::ToolResult {
        id: "t1".into(),
        output: chlodwig_core::ToolResultContent::Text("file.txt\n".into()),
        is_error: false,
    });

    assert!(changed);
    assert_eq!(state.blocks.len(), 1);
    match &state.blocks[0] {
        DisplayBlock::ToolResult { output, is_error, .. } => {
            assert_eq!(output, "file.txt\n");
            assert!(!is_error);
        }
        other => panic!("expected ToolResult, got {:?}", other),
    }
}

#[test]
fn test_tool_result_error_flag() {
    let mut state = AppState::new("m".into());
    state.handle_event(ConversationEvent::ToolResult {
        id: "t2".into(),
        output: chlodwig_core::ToolResultContent::Text("permission denied".into()),
        is_error: true,
    });

    match &state.blocks[0] {
        DisplayBlock::ToolResult { is_error, .. } => assert!(is_error),
        other => panic!("expected ToolResult, got {:?}", other),
    }
}

#[test]
fn test_turn_complete_flushes_and_stops_streaming() {
    let mut state = AppState::new("m".into());
    state.is_streaming = true;
    state.handle_event(ConversationEvent::TextDelta("tail".into()));
    state.handle_event(ConversationEvent::TurnComplete);

    assert!(!state.is_streaming);
    assert!(state.streaming_buffer.is_empty());
    assert_eq!(state.blocks.len(), 1);
    match &state.blocks[0] {
        DisplayBlock::AssistantText(t) => assert_eq!(t, "tail"),
        other => panic!("expected AssistantText, got {:?}", other),
    }
}

#[test]
fn test_error_event_flushes_and_stops_streaming() {
    let mut state = AppState::new("m".into());
    state.is_streaming = true;
    state.handle_event(ConversationEvent::TextDelta("partial".into()));
    state.handle_event(ConversationEvent::Error("rate limited".into()));

    assert!(!state.is_streaming);
    assert_eq!(state.blocks.len(), 2);
    match &state.blocks[0] {
        DisplayBlock::AssistantText(t) => assert_eq!(t, "partial"),
        other => panic!("expected AssistantText, got {:?}", other),
    }
    match &state.blocks[1] {
        DisplayBlock::Error(msg) => assert_eq!(msg, "rate limited"),
        other => panic!("expected Error, got {:?}", other),
    }
}

#[test]
fn test_usage_accumulates() {
    let mut state = AppState::new("m".into());
    state.handle_event(ConversationEvent::Usage {
        input_tokens: 100,
        output_tokens: 50,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
    });
    state.handle_event(ConversationEvent::Usage {
        input_tokens: 200,
        output_tokens: 75,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
    });
    assert_eq!(state.input_tokens, 300);
    assert_eq!(state.output_tokens, 125);
}

#[test]
fn test_usage_sets_cache_tokens() {
    let mut state = AppState::new("m".into());
    // MessageStart: input=0, output=0, no cache
    state.handle_event(ConversationEvent::Usage {
        input_tokens: 0,
        output_tokens: 0,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
    });
    assert_eq!(state.turn_usage.input_tokens, 0);
    assert_eq!(state.turn_usage.output_tokens, 0);
    assert_eq!(state.turn_usage.cache_tokens, 0);

    // MessageDelta: all values arrive at once
    state.handle_event(ConversationEvent::Usage {
        input_tokens: 4783,
        output_tokens: 1028,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 22350,
    });
    assert_eq!(state.turn_usage.input_tokens, 4783);
    assert_eq!(state.turn_usage.output_tokens, 1028);
    assert_eq!(state.turn_usage.cache_tokens, 22350);
}

#[test]
fn test_usage_does_not_overwrite_with_zero() {
    let mut state = AppState::new("m".into());
    // MessageDelta with all values
    state.handle_event(ConversationEvent::Usage {
        input_tokens: 5000,
        output_tokens: 200,
        cache_creation_input_tokens: 1000,
        cache_read_input_tokens: 20000,
    });
    assert_eq!(state.turn_usage.input_tokens, 5000);
    assert_eq!(state.turn_usage.output_tokens, 200);
    assert_eq!(state.turn_usage.cache_tokens, 21000);

    // Next MessageStart sends zeros — should NOT overwrite
    state.handle_event(ConversationEvent::Usage {
        input_tokens: 0,
        output_tokens: 0,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
    });
    assert_eq!(state.turn_usage.input_tokens, 5000);
    assert_eq!(state.turn_usage.output_tokens, 200);
    assert_eq!(state.turn_usage.cache_tokens, 21000);
}

#[test]
fn test_usage_cache_creation_plus_read() {
    let mut state = AppState::new("m".into());
    state.handle_event(ConversationEvent::Usage {
        input_tokens: 3000,
        output_tokens: 500,
        cache_creation_input_tokens: 8000,
        cache_read_input_tokens: 12000,
    });
    // cache = creation + read
    assert_eq!(state.turn_usage.cache_tokens, 20000);
}

#[test]
fn test_api_request_made_increments_count() {
    let mut state = AppState::new("m".into());
    let changed = state.handle_event(ConversationEvent::ApiRequestMade);
    assert!(!changed); // no UI refresh for this
    assert_eq!(state.request_count, 1);
}

#[test]
fn test_submit_prompt_adds_block_and_starts_streaming() {
    let mut state = AppState::new("m".into());
    state.submit_prompt("How are you?".into());

    assert!(state.is_streaming);
    assert_eq!(state.blocks.len(), 1);
    match &state.blocks[0] {
        DisplayBlock::UserMessage(t) => assert_eq!(t, "How are you?"),
        other => panic!("expected UserMessage, got {:?}", other),
    }
}

#[test]
fn test_clear_resets_everything() {
    let mut state = AppState::new("m".into());
    state.submit_prompt("hello".into());
    state.handle_event(ConversationEvent::TextDelta("hi".into()));
    state.handle_event(ConversationEvent::Usage {
        input_tokens: 100,
        output_tokens: 50,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
    });
    state.request_count = 5;

    state.clear();

    assert!(state.blocks.is_empty());
    assert!(state.streaming_buffer.is_empty());
    assert!(!state.is_streaming);
    assert_eq!(state.input_tokens, 0);
    assert_eq!(state.output_tokens, 0);
    assert_eq!(state.request_count, 0);
    // model is preserved
    assert_eq!(state.model, "m");
}

#[test]
fn test_compaction_events_create_system_messages() {
    let mut state = AppState::new("m".into());
    state.handle_event(ConversationEvent::CompactionStarted);
    state.handle_event(ConversationEvent::CompactionComplete {
        old_messages: 20,
        summary_tokens: 500,
    });

    assert_eq!(state.blocks.len(), 2);
    match &state.blocks[0] {
        DisplayBlock::SystemMessage(msg) => assert!(msg.contains("Compacting")),
        other => panic!("expected SystemMessage, got {:?}", other),
    }
    match &state.blocks[1] {
        DisplayBlock::SystemMessage(msg) => {
            assert!(msg.contains("20"));
            assert!(msg.contains("500"));
        }
        other => panic!("expected SystemMessage, got {:?}", other),
    }
}

#[test]
fn test_thinking_events_return_false() {
    let mut state = AppState::new("m".into());
    let changed1 = state.handle_event(ConversationEvent::ThinkingDelta("hmm".into()));
    let changed2 = state.handle_event(ConversationEvent::ThinkingComplete("thought".into()));
    assert!(!changed1);
    assert!(!changed2);
    assert!(state.blocks.is_empty());
}

#[test]
fn test_full_conversation_flow() {
    let mut state = AppState::new("claude-3".into());

    // User submits
    state.submit_prompt("List files".into());
    assert!(state.is_streaming);

    // Assistant starts responding
    state.handle_event(ConversationEvent::TextDelta("I'll list ".into()));
    state.handle_event(ConversationEvent::TextDelta("the files.".into()));
    assert_eq!(state.streaming_buffer, "I'll list the files.");

    // Tool call
    state.handle_event(ConversationEvent::ToolUseStart {
        id: "t1".into(),
        name: "Bash".into(),
        input: serde_json::json!({"command": "ls"}),
    });
    // streaming buffer was flushed
    assert!(state.streaming_buffer.is_empty());

    // Tool result
    state.handle_event(ConversationEvent::ToolResult {
        id: "t1".into(),
        output: chlodwig_core::ToolResultContent::Text("file1.rs\nfile2.rs\n".into()),
        is_error: false,
    });

    // Assistant continues
    state.handle_event(ConversationEvent::TextDelta("Here are ".into()));
    state.handle_event(ConversationEvent::TextComplete("Here are the files.".into()));

    // Usage
    state.handle_event(ConversationEvent::Usage {
        input_tokens: 500,
        output_tokens: 100,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
    });

    // Turn complete
    state.handle_event(ConversationEvent::TurnComplete);

    assert!(!state.is_streaming);
    assert_eq!(state.input_tokens, 500);
    assert_eq!(state.output_tokens, 100);

    // Blocks: UserMessage, AssistantText (flushed), ToolUseStart, ToolResult, AssistantText (complete)
    assert_eq!(state.blocks.len(), 5);
    assert!(matches!(&state.blocks[0], DisplayBlock::UserMessage(t) if t == "List files"));
    assert!(matches!(&state.blocks[1], DisplayBlock::AssistantText(t) if t == "I'll list the files."));
    assert!(matches!(&state.blocks[2], DisplayBlock::ToolUseStart { name, .. } if name == "Bash"));
    assert!(matches!(&state.blocks[3], DisplayBlock::ToolResult { is_error: false, .. }));
    assert!(matches!(&state.blocks[4], DisplayBlock::AssistantText(t) if t == "Here are the files."));
}

// --- Spinner tests ---

#[test]
fn test_spinner_char_returns_valid_frame() {
    let state = AppState::new("m".into());
    let ch = state.spinner_char();
    assert!(
        SPINNER_FRAMES.contains(&ch),
        "spinner_char() returned '{ch}' which is not in SPINNER_FRAMES",
    );
}

#[test]
fn test_spinner_char_changes_over_time() {
    // spinner_char() is time-based (100ms per frame, 10 frames = 1s cycle).
    // Sampling over 250ms should hit at least 2 different frames.
    let state = AppState::new("m".into());
    let mut seen = std::collections::HashSet::new();
    let start = std::time::Instant::now();
    while start.elapsed() < std::time::Duration::from_millis(250) {
        seen.insert(state.spinner_char());
        std::thread::sleep(std::time::Duration::from_millis(30));
    }
    assert!(
        seen.len() >= 2,
        "Expected at least 2 different spinner chars over 250ms, got {}: {:?}",
        seen.len(),
        seen,
    );
}

#[test]
fn test_spinner_frames_has_ten_entries() {
    assert_eq!(SPINNER_FRAMES.len(), 10);
}

#[test]
fn test_spinner_char_is_deterministic_within_same_100ms() {
    // Two calls within the same millisecond should return the same char.
    let state = AppState::new("m".into());
    let a = state.spinner_char();
    let b = state.spinner_char();
    assert_eq!(a, b, "Two immediate calls should return the same spinner char");
}

// --- delete_to_line_start tests ---

use crate::app_state::delete_to_line_start;

#[test]
fn test_delete_to_line_start_mid_line() {
    // "123456789" with cursor between '6' and '7' (char index 6)
    let (text, cursor) = delete_to_line_start("123456789", 6);
    assert_eq!(text, "789");
    assert_eq!(cursor, 0);
}

#[test]
fn test_delete_to_line_start_at_end() {
    // Cursor at end of line → deletes entire line content
    let (text, cursor) = delete_to_line_start("hello", 5);
    assert_eq!(text, "");
    assert_eq!(cursor, 0);
}

#[test]
fn test_delete_to_line_start_at_beginning() {
    // Cursor at start of line → nothing to delete
    let (text, cursor) = delete_to_line_start("hello", 0);
    assert_eq!(text, "hello");
    assert_eq!(cursor, 0);
}

#[test]
fn test_delete_to_line_start_empty_input() {
    let (text, cursor) = delete_to_line_start("", 0);
    assert_eq!(text, "");
    assert_eq!(cursor, 0);
}

#[test]
fn test_delete_to_line_start_multiline_second_line() {
    // "line1\nline2\nline3"
    // chars: l(0) i(1) n(2) e(3) 1(4) \n(5) l(6) i(7) n(8) e(9) 2(10) \n(11) ...
    // cursor at index 8 = after 'n', deletes "li" (indices 6,7)
    let (text, cursor) = delete_to_line_start("line1\nline2\nline3", 8);
    assert_eq!(text, "line1\nne2\nline3");
    assert_eq!(cursor, 6); // at start of second line
}

#[test]
fn test_delete_to_line_start_multiline_end_of_second_line() {
    // Cursor at end of "line2" (char index 11, right before '\n')
    let (text, cursor) = delete_to_line_start("line1\nline2\nline3", 11);
    assert_eq!(text, "line1\n\nline3");
    assert_eq!(cursor, 6);
}

#[test]
fn test_delete_to_line_start_at_newline_boundary() {
    // Cursor right after '\n' = start of next line → nothing to delete
    let (text, cursor) = delete_to_line_start("line1\nline2", 6);
    assert_eq!(text, "line1\nline2");
    assert_eq!(cursor, 6);
}

#[test]
fn test_delete_to_line_start_utf8() {
    // "Ümläute" with cursor at char index 4 (between 'ä' and 'u')
    let (text, cursor) = delete_to_line_start("Ümläute", 4);
    assert_eq!(text, "ute");
    assert_eq!(cursor, 0);
}

#[test]
fn test_delete_to_line_start_emoji() {
    // "🌻hello" — emoji is 1 char, cursor at char index 1 (after emoji)
    let (text, cursor) = delete_to_line_start("🌻hello", 1);
    assert_eq!(text, "hello");
    assert_eq!(cursor, 0);
}

#[test]
fn test_delete_to_line_start_cursor_past_end() {
    // Cursor beyond text length → clamped to end
    let (text, cursor) = delete_to_line_start("abc", 100);
    assert_eq!(text, "");
    assert_eq!(cursor, 0);
}

#[test]
fn test_delete_to_line_start_third_line() {
    // Three lines, cursor in the middle of the third
    let (text, cursor) = delete_to_line_start("aa\nbb\nccdd", 8);
    assert_eq!(text, "aa\nbb\ndd");
    assert_eq!(cursor, 6);
}

// --- line_start_pos / line_end_pos tests ---

use crate::app_state::{line_start_pos, line_end_pos};

#[test]
fn test_line_start_pos_single_line_mid() {
    assert_eq!(line_start_pos("hello", 3), 0);
}

#[test]
fn test_line_start_pos_single_line_start() {
    assert_eq!(line_start_pos("hello", 0), 0);
}

#[test]
fn test_line_start_pos_single_line_end() {
    assert_eq!(line_start_pos("hello", 5), 0);
}

#[test]
fn test_line_start_pos_multiline_second_line() {
    // "abc\ndefgh" — cursor at 'd' (index 4) → line start = 4
    assert_eq!(line_start_pos("abc\ndefgh", 4), 4);
    // cursor at 'f' (index 6) → line start = 4
    assert_eq!(line_start_pos("abc\ndefgh", 6), 4);
}

#[test]
fn test_line_start_pos_multiline_third_line() {
    // "a\nb\ncde" — cursor at 'c' (index 4) → line start = 4
    assert_eq!(line_start_pos("a\nb\ncde", 4), 4);
    // cursor at 'e' (index 6) → line start = 4
    assert_eq!(line_start_pos("a\nb\ncde", 6), 4);
}

#[test]
fn test_line_start_pos_at_newline() {
    // cursor on '\n' itself (index 3 in "abc\ndef")
    assert_eq!(line_start_pos("abc\ndef", 3), 0);
}

#[test]
fn test_line_start_pos_empty() {
    assert_eq!(line_start_pos("", 0), 0);
}

#[test]
fn test_line_start_pos_utf8() {
    // "Ü\näöü" — cursor at 'ö' (char index 3) → line start = 2
    assert_eq!(line_start_pos("Ü\näöü", 3), 2);
}

#[test]
fn test_line_end_pos_single_line_mid() {
    assert_eq!(line_end_pos("hello", 2), 5);
}

#[test]
fn test_line_end_pos_single_line_end() {
    assert_eq!(line_end_pos("hello", 5), 5);
}

#[test]
fn test_line_end_pos_single_line_start() {
    assert_eq!(line_end_pos("hello", 0), 5);
}

#[test]
fn test_line_end_pos_multiline_first_line() {
    // "abc\ndef" — cursor at 'b' (index 1) → line end = 3 (the '\n')
    assert_eq!(line_end_pos("abc\ndef", 1), 3);
}

#[test]
fn test_line_end_pos_multiline_second_line() {
    // "abc\ndef" — cursor at 'd' (index 4) → line end = 7
    assert_eq!(line_end_pos("abc\ndef", 4), 7);
}

#[test]
fn test_line_end_pos_multiline_mid_second_line() {
    // "abc\ndefgh" — cursor at 'f' (index 6) → line end = 9
    assert_eq!(line_end_pos("abc\ndefgh", 6), 9);
}

#[test]
fn test_line_end_pos_at_newline() {
    // cursor on '\n' (index 3 in "abc\ndef") → line end = 3 (stay at \n)
    assert_eq!(line_end_pos("abc\ndef", 3), 3);
}

#[test]
fn test_line_end_pos_empty() {
    assert_eq!(line_end_pos("", 0), 0);
}

#[test]
fn test_line_end_pos_utf8() {
    // "Ü\näöü" — cursor at 'ä' (char index 2) → line end = 5
    assert_eq!(line_end_pos("Ü\näöü", 2), 5);
}

#[test]
fn test_line_end_pos_cursor_past_end() {
    assert_eq!(line_end_pos("abc", 100), 3);
}

#[test]
fn test_line_start_pos_cursor_past_end() {
    assert_eq!(line_start_pos("abc", 100), 0);
}

// --- word_left_pos / word_right_pos tests ---

use crate::app_state::{word_left_pos, word_right_pos};

#[test]
fn test_word_left_from_end() {
    // "hello world" cursor at 11 (end) → before 'w' = 6
    assert_eq!(word_left_pos("hello world", 11), 6);
}

#[test]
fn test_word_left_from_mid_word() {
    // "hello world" cursor at 8 (between 'r' and 'l') → before 'w' = 6
    assert_eq!(word_left_pos("hello world", 8), 6);
}

#[test]
fn test_word_left_from_word_start() {
    // "hello world" cursor at 6 (at 'w') → before 'h' = 0
    assert_eq!(word_left_pos("hello world", 6), 0);
}

#[test]
fn test_word_left_from_space() {
    // "hello world" cursor at 5 (at space) → before 'h' = 0
    assert_eq!(word_left_pos("hello world", 5), 0);
}

#[test]
fn test_word_left_at_start() {
    assert_eq!(word_left_pos("hello", 0), 0);
}

#[test]
fn test_word_left_multiple_spaces() {
    // "aaa   bbb" cursor at 9 (end) → before 'b' = 6
    assert_eq!(word_left_pos("aaa   bbb", 9), 6);
}

#[test]
fn test_word_left_three_words() {
    // "one two three" cursor at 8 (at 't' of three) → before 't' of two = 4
    // Wait: cursor at 8 = 'h' of "three". word_left skips back to start of "three" = no,
    // cursor is inside "three" so it goes to start of "three"? No — macOS word-left
    // skips whitespace first, then skips the word. Let me think:
    // cursor=8: chars before cursor = "one two " — skip non-alnum backwards...
    // Actually the standard algorithm: skip whitespace left, then skip word chars left.
    // From 8: char[7]='t' (not space) → skip word chars: t(7) o(6) w(5)? No wait...
    // "one two three"
    //  0123456789...
    //  o=0 n=1 e=2 ' '=3 t=4 w=5 o=6 ' '=7 t=8 h=9 r=10 e=11 e=12
    // cursor=8: char[7]=' ' → skip spaces: ' '(7) → then skip word: o(6) w(5) t(4) → stop at 4
    assert_eq!(word_left_pos("one two three", 8), 4);
}

#[test]
fn test_word_left_empty() {
    assert_eq!(word_left_pos("", 0), 0);
}

#[test]
fn test_word_left_utf8() {
    // "über cool" cursor at 9 (end) → before 'c' = 5
    assert_eq!(word_left_pos("über cool", 9), 5);
}

#[test]
fn test_word_left_punctuation() {
    // "hello, world" cursor at 7 (at 'w') — skip no space, skip word 'w'?
    // Actually cursor=7: char[6]=' ' → skip space → char[5]=',' skip punct → char[4]='o'
    // Hmm, depends on whether punct is treated as word or space.
    // macOS treats punctuation as a word boundary. Let's define:
    // skip non-alphanumeric, then skip alphanumeric.
    // cursor=7: char[6]=' ' (non-alnum) → skip: ' '(6) ','(5) → then skip alnum: o(4) l(3) l(2) e(1) h(0) → 0
    assert_eq!(word_left_pos("hello, world", 7), 0);
}

#[test]
fn test_word_right_from_start() {
    // "hello world" cursor at 0 → after 'o' = 5
    assert_eq!(word_right_pos("hello world", 0), 5);
}

#[test]
fn test_word_right_from_mid_word() {
    // "hello world" cursor at 2 → after 'o' = 5
    assert_eq!(word_right_pos("hello world", 2), 5);
}

#[test]
fn test_word_right_from_space() {
    // "hello world" cursor at 5 (at space) → after 'd' = 11
    assert_eq!(word_right_pos("hello world", 5), 11);
}

#[test]
fn test_word_right_from_word_end() {
    // "hello world" cursor at 5 → after 'd' = 11
    assert_eq!(word_right_pos("hello world", 5), 11);
}

#[test]
fn test_word_right_at_end() {
    assert_eq!(word_right_pos("hello", 5), 5);
}

#[test]
fn test_word_right_multiple_spaces() {
    // "aaa   bbb" cursor at 0 → after last 'a' = 3
    assert_eq!(word_right_pos("aaa   bbb", 0), 3);
}

#[test]
fn test_word_right_three_words() {
    // "one two three" cursor at 4 (at 't' of two) → after 'o' of two = 7
    assert_eq!(word_right_pos("one two three", 4), 7);
}

#[test]
fn test_word_right_empty() {
    assert_eq!(word_right_pos("", 0), 0);
}

#[test]
fn test_word_right_utf8() {
    // "über cool" cursor at 0 → after 'r' = 4
    assert_eq!(word_right_pos("über cool", 0), 4);
}

#[test]
fn test_word_right_punctuation() {
    // "hello, world" cursor at 0 → after 'o' of hello = 5
    assert_eq!(word_right_pos("hello, world", 0), 5);
}

#[test]
fn test_word_left_cursor_past_end() {
    assert_eq!(word_left_pos("abc def", 100), 4);
}

#[test]
fn test_word_right_cursor_past_end() {
    assert_eq!(word_right_pos("abc def", 100), 7);
}

// --- delete_word_back tests ---

use crate::app_state::delete_word_back;

#[test]
fn test_delete_word_back_from_end() {
    // "hello world" cursor=11 → delete "world" → "hello "
    let (text, cursor) = delete_word_back("hello world", 11);
    assert_eq!(text, "hello ");
    assert_eq!(cursor, 6);
}

#[test]
fn test_delete_word_back_from_space() {
    // "hello world" cursor=6 (at space after 'o') → skip space, delete "hello" → " world"
    // Wait: word_left_pos("hello world", 6) = 0 (skip space, then skip "hello")
    // So delete chars 0..6 → "world"
    let (text, cursor) = delete_word_back("hello world", 6);
    assert_eq!(text, "world");
    assert_eq!(cursor, 0);
}

#[test]
fn test_delete_word_back_mid_word() {
    // "hello world" cursor=8 → word_left=6 → delete "wo" → "hello rld"
    let (text, cursor) = delete_word_back("hello world", 8);
    assert_eq!(text, "hello rld");
    assert_eq!(cursor, 6);
}

#[test]
fn test_delete_word_back_at_start() {
    let (text, cursor) = delete_word_back("hello", 0);
    assert_eq!(text, "hello");
    assert_eq!(cursor, 0);
}

#[test]
fn test_delete_word_back_empty() {
    let (text, cursor) = delete_word_back("", 0);
    assert_eq!(text, "");
    assert_eq!(cursor, 0);
}

#[test]
fn test_delete_word_back_single_word() {
    let (text, cursor) = delete_word_back("hello", 5);
    assert_eq!(text, "");
    assert_eq!(cursor, 0);
}

#[test]
fn test_delete_word_back_multiple_spaces() {
    // "aaa   bbb" cursor=9 → word_left=6 → delete "bbb" → "aaa   "
    let (text, cursor) = delete_word_back("aaa   bbb", 9);
    assert_eq!(text, "aaa   ");
    assert_eq!(cursor, 6);
}

#[test]
fn test_delete_word_back_utf8() {
    // "über cool" cursor=9 → word_left=5 → delete "cool" → "über "
    let (text, cursor) = delete_word_back("über cool", 9);
    assert_eq!(text, "über ");
    assert_eq!(cursor, 5);
}

#[test]
fn test_delete_word_back_punctuation() {
    // "hello, world" cursor=7 → word_left=0 → delete "hello, " → "world"
    let (text, cursor) = delete_word_back("hello, world", 7);
    assert_eq!(text, "world");
    assert_eq!(cursor, 0);
}

#[test]
fn test_delete_word_back_three_words() {
    // "one two three" cursor=13 → word_left=8 → delete "three" → "one two "
    let (text, cursor) = delete_word_back("one two three", 13);
    assert_eq!(text, "one two ");
    assert_eq!(cursor, 8);
}

// --- auto_scroll integration tests ---

#[test]
fn test_new_state_auto_scroll_is_active() {
    let state = AppState::new("m".into());
    assert!(state.auto_scroll.is_active(), "auto_scroll should be active by default");
}

#[test]
fn test_clear_resets_auto_scroll_to_active() {
    let mut state = AppState::new("m".into());
    state.auto_scroll.user_scrolled_away();
    assert!(!state.auto_scroll.is_active());

    state.clear();
    assert!(state.auto_scroll.is_active(), "clear should re-enable auto_scroll");
}

#[test]
fn test_submit_prompt_does_not_change_auto_scroll_by_itself() {
    // submit_prompt() only updates state — the GTK event handler calls
    // auto_scroll.scroll_to_bottom() separately. This tests that submit_prompt
    // does NOT accidentally disable it.
    let mut state = AppState::new("m".into());
    state.submit_prompt("hello".into());
    assert!(state.auto_scroll.is_active());
}

#[test]
fn test_auto_scroll_scroll_to_bottom_if_auto_noop_when_user_scrolled_away() {
    let mut state = AppState::new("m".into());
    state.auto_scroll.user_scrolled_away();
    assert!(!state.auto_scroll.is_active());

    // Simulate incoming content event
    state.auto_scroll.scroll_to_bottom_if_auto();
    assert!(!state.auto_scroll.is_active(), "should remain inactive when user scrolled up");
}

#[test]
fn test_auto_scroll_incoming_content_follows_when_active() {
    let mut state = AppState::new("m".into());
    assert!(state.auto_scroll.is_active());

    state.auto_scroll.scroll_to_bottom_if_auto();
    assert!(state.auto_scroll.is_active(), "should stay active");
}

#[test]
fn test_auto_scroll_user_scrolls_up_then_back() {
    let mut state = AppState::new("m".into());
    assert!(state.auto_scroll.is_active());

    state.auto_scroll.user_scrolled_away();
    assert!(!state.auto_scroll.is_active());

    // Incoming content should NOT re-enable
    state.auto_scroll.scroll_to_bottom_if_auto();
    assert!(!state.auto_scroll.is_active());

    // User scrolls back to bottom
    state.auto_scroll.user_reached_bottom();
    assert!(state.auto_scroll.is_active());
}

// --- show_tool_usage toggle tests ---

#[test]
fn test_show_tool_usage_default_true() {
    let state = AppState::new("m".into());
    assert!(state.show_tool_usage, "show_tool_usage should default to true");
}

#[test]
fn test_toggle_tool_usage() {
    let mut state = AppState::new("m".into());
    assert!(state.show_tool_usage);

    state.show_tool_usage = false;
    assert!(!state.show_tool_usage);

    state.show_tool_usage = true;
    assert!(state.show_tool_usage);
}

#[test]
fn test_clear_preserves_show_tool_usage() {
    let mut state = AppState::new("m".into());
    state.show_tool_usage = false;
    state.clear();
    // show_tool_usage is a UI preference, not conversation state — should survive clear
    assert!(!state.show_tool_usage, "clear should preserve show_tool_usage preference");
}

#[test]
fn test_tool_use_start_block_persists_for_rerender() {
    // Simulate: model calls a tool → ToolUseStart + ToolResult both in blocks
    // Then toggle show_tool_usage off and back on — both blocks must be present.
    let mut state = AppState::new("m".into());
    state.submit_prompt("find files".into());
    state.handle_event(ConversationEvent::TextDelta("Looking...".into()));
    state.handle_event(ConversationEvent::ToolUseStart {
        id: "t1".into(),
        name: "Glob".into(),
        input: serde_json::json!({"pattern": "*.rs"}),
    });
    state.handle_event(ConversationEvent::ToolResult {
        id: "t1".into(),
        output: chlodwig_core::ToolResultContent::Text("No files found".into()),
        is_error: false,
    });
    state.handle_event(ConversationEvent::TextComplete("Done.".into()));
    state.handle_event(ConversationEvent::TurnComplete);

    // Both ToolUseStart and ToolResult must be in blocks
    let tool_start_count = state.blocks.iter().filter(|b| matches!(b, DisplayBlock::ToolUseStart { .. })).count();
    let tool_result_count = state.blocks.iter().filter(|b| matches!(b, DisplayBlock::ToolResult { .. })).count();
    assert_eq!(tool_start_count, 1, "ToolUseStart must be in blocks");
    assert_eq!(tool_result_count, 1, "ToolResult must be in blocks");

    // Toggle off and back on — blocks unchanged
    state.show_tool_usage = false;
    state.show_tool_usage = true;
    let tool_start_count = state.blocks.iter().filter(|b| matches!(b, DisplayBlock::ToolUseStart { .. })).count();
    assert_eq!(tool_start_count, 1, "ToolUseStart must survive toggle");
}

// ── Command parser tests ──────────────────────────────────────────

use crate::app_state::Command;

#[test]
fn test_parse_command_clear() {
    assert_eq!(Command::parse("/clear"), Some(Command::Clear));
    assert_eq!(Command::parse("/reset"), Some(Command::Clear));
    assert_eq!(Command::parse("/new"), Some(Command::Clear));
    assert_eq!(Command::parse("  /clear  "), Some(Command::Clear));
}

#[test]
fn test_parse_command_help() {
    assert_eq!(Command::parse("/help"), Some(Command::Help));
    assert_eq!(Command::parse("/h"), Some(Command::Help));
    assert_eq!(Command::parse("/?"), Some(Command::Help));
    assert_eq!(Command::parse("help"), Some(Command::Help));
    assert_eq!(Command::parse("  /help  "), Some(Command::Help));
}

#[test]
fn test_parse_command_shell() {
    assert_eq!(Command::parse("! ls -la"), Some(Command::Shell("ls -la".into())));
    assert_eq!(Command::parse("!ls"), Some(Command::Shell("ls".into())));
    assert_eq!(Command::parse("  ! echo hello  "), Some(Command::Shell("echo hello".into())));
}

#[test]
fn test_parse_command_shell_empty() {
    // "!" alone without a command is not a valid shell command
    assert_eq!(Command::parse("!"), None);
    assert_eq!(Command::parse("!  "), None);
}

#[test]
fn test_parse_command_quit() {
    assert_eq!(Command::parse("exit"), Some(Command::Quit));
    assert_eq!(Command::parse("quit"), Some(Command::Quit));
    assert_eq!(Command::parse("/exit"), Some(Command::Quit));
    assert_eq!(Command::parse("/quit"), Some(Command::Quit));
    assert_eq!(Command::parse("  exit  "), Some(Command::Quit));
    assert_eq!(Command::parse("EXIT"), Some(Command::Quit));
}

#[test]
fn test_parse_command_none_for_regular_text() {
    assert_eq!(Command::parse("hello world"), None);
    assert_eq!(Command::parse("what is rust?"), None);
    assert_eq!(Command::parse(""), None);
    assert_eq!(Command::parse("   "), None);
}

#[test]
fn test_parse_command_case_insensitive() {
    assert_eq!(Command::parse("/CLEAR"), Some(Command::Clear));
    assert_eq!(Command::parse("/Help"), Some(Command::Help));
    assert_eq!(Command::parse("QUIT"), Some(Command::Quit));
}

#[test]
fn test_parse_command_shell_preserves_case() {
    // Shell commands should preserve original case
    assert_eq!(Command::parse("! Echo Hello"), Some(Command::Shell("Echo Hello".into())));
}

#[test]
fn test_help_markdown_contains_commands_and_keys() {
    let cmds = chlodwig_core::help_markdown_commands();
    let keys = chlodwig_core::help_markdown_keys_gtk();
    assert!(cmds.contains("`/help`"), "must mention /help in backticks");
    assert!(cmds.contains("`/clear`"), "must mention /clear");
    assert!(cmds.contains("`! <cmd>`"), "must mention shell");
    assert!(keys.contains("`Cmd+Enter`"), "must mention Cmd+Enter");
    assert!(keys.contains("`Cmd+Q`"), "must mention Cmd+Q");
}

#[test]
fn test_execute_shell_command_ls() {
    let cwd = std::env::current_dir().unwrap();
    let (output, is_error) = crate::app_state::execute_shell_pty("echo hello", &cwd);
    assert!(!is_error);
    assert!(output.contains("hello"), "output should contain 'hello', got: {output}");
}

#[test]
fn test_execute_shell_command_failing() {
    let cwd = std::env::current_dir().unwrap();
    let (output, is_error) = crate::app_state::execute_shell_pty("false", &cwd);
    // `false` exits with 1 — not an execution error, but exit code != 0
    // The output should contain the exit code
    let _ = (output, is_error); // just verify no panic
}

#[test]
fn test_execute_shell_command_nonexistent() {
    let cwd = std::env::current_dir().unwrap();
    let (output, is_error) = crate::app_state::execute_shell_pty("nonexistent_command_xyz_12345", &cwd);
    // Should not panic, should return some error output
    assert!(!output.is_empty(), "error output should not be empty");
    let _ = is_error;
}

#[test]
fn test_clear_resets_state() {
    let mut state = AppState::new("m".into());
    state.handle_event(ConversationEvent::TextComplete("hello".into()));
    state.input_tokens = 100;
    state.output_tokens = 200;
    state.turn_count = 5;
    assert!(!state.blocks.is_empty());

    state.clear();
    assert!(state.blocks.is_empty());
    assert_eq!(state.input_tokens, 0);
    assert_eq!(state.output_tokens, 0);
    assert_eq!(state.turn_count, 0);
}

// ── Table sorting tests ─────────────────────────────────────────────

#[test]
fn test_text_complete_extracts_tables() {
    let mut state = AppState::new("test".into());
    let md = "| Name | Age |\n|------|-----|\n| Alice | 30 |\n| Bob | 25 |".to_string();
    state.handle_event(ConversationEvent::TextComplete(md));
    assert_eq!(state.tables.len(), 1);
    assert_eq!(state.tables[0].2.head, vec!["Name", "Age"]);
    assert_eq!(state.tables[0].2.rows.len(), 2);
}

#[test]
fn test_text_complete_no_tables() {
    let mut state = AppState::new("test".into());
    state.handle_event(ConversationEvent::TextComplete("Hello world".into()));
    assert!(state.tables.is_empty());
}

#[test]
fn test_sort_table_ascending() {
    let mut state = AppState::new("test".into());
    let md = "| Name | Age |\n|------|-----|\n| Zara | 42 |\n| Alice | 23 |".to_string();
    state.handle_event(ConversationEvent::TextComplete(md));
    assert!(state.sort_table(0, 0)); // sort by Name ascending
    assert_eq!(state.tables[0].2.rows[0][0], "Alice");
    assert_eq!(state.tables[0].2.rows[1][0], "Zara");
}

#[test]
fn test_sort_table_toggle_descending() {
    let mut state = AppState::new("test".into());
    let md = "| Name |\n|------|\n| B |\n| A |\n| C |".to_string();
    state.handle_event(ConversationEvent::TextComplete(md));
    state.sort_table(0, 0); // ascending: A, B, C
    assert_eq!(state.tables[0].2.rows[0][0], "A");
    state.sort_table(0, 0); // toggle: descending: C, B, A
    assert_eq!(state.tables[0].2.rows[0][0], "C");
}

#[test]
fn test_sort_table_numeric() {
    let mut state = AppState::new("test".into());
    let md = "| X | Val |\n|---|-----|\n| a | 100 |\n| b | 3 |\n| c | 42 |".to_string();
    state.handle_event(ConversationEvent::TextComplete(md));
    state.sort_table(0, 1); // sort by Val (numeric)
    assert_eq!(state.tables[0].2.rows[0][1], "3");
    assert_eq!(state.tables[0].2.rows[1][1], "42");
    assert_eq!(state.tables[0].2.rows[2][1], "100");
}

#[test]
fn test_sort_table_preserves_rows() {
    let mut state = AppState::new("test".into());
    let md = "| Name | City |\n|------|------|\n| Zara | Wien |\n| Alice | Bern |".to_string();
    state.handle_event(ConversationEvent::TextComplete(md));
    state.sort_table(0, 0); // sort by Name
    assert_eq!(state.tables[0].2.rows[0], vec!["Alice", "Bern"]);
    assert_eq!(state.tables[0].2.rows[1], vec!["Zara", "Wien"]);
}

#[test]
fn test_sort_table_invalid_index() {
    let mut state = AppState::new("test".into());
    let md = "| A |\n|---|\n| 1 |".to_string();
    state.handle_event(ConversationEvent::TextComplete(md));
    assert!(!state.sort_table(99, 0)); // invalid table index
}

#[test]
fn test_clear_resets_tables() {
    let mut state = AppState::new("test".into());
    let md = "| A |\n|---|\n| 1 |".to_string();
    state.handle_event(ConversationEvent::TextComplete(md));
    assert_eq!(state.tables.len(), 1);
    state.clear();
    assert!(state.tables.is_empty());
}

#[test]
fn test_multiple_tables_in_one_block() {
    let mut state = AppState::new("test".into());
    let md = "| A |\n|---|\n| 1 |\n\nText\n\n| B | C |\n|---|---|\n| x | y |".to_string();
    state.handle_event(ConversationEvent::TextComplete(md));
    assert_eq!(state.tables.len(), 2);
    assert_eq!(state.tables[0].2.head, vec!["A"]);
    assert_eq!(state.tables[1].2.head, vec!["B", "C"]);
    // Both belong to block 0
    assert_eq!(state.tables[0].0, 0);
    assert_eq!(state.tables[1].0, 0);
}

#[test]
fn test_sort_table_has_sort_indicator() {
    let mut state = AppState::new("test".into());
    let md = "| Name |\n|------|\n| B |\n| A |".to_string();
    state.handle_event(ConversationEvent::TextComplete(md));
    state.sort_table(0, 0);
    let lines = state.tables[0].2.render(usize::MAX);
    let text: String = lines.iter().map(|l| l.text()).collect::<Vec<_>>().join("");
    assert!(text.contains("▲"), "Missing sort indicator: {text}");
}

#[test]
fn test_event_loop_has_table_sort_click_handler() {
    let source = include_str!("../table_interactions.rs");
    assert!(
        source.contains("table_sort:") && source.contains("sort_table"),
        "table_interactions.rs must contain table sort click handler"
    );
}


#[test]
fn test_finalized_streaming_render_uses_table_headers() {
    // The finalized streaming render (Case 2: TextComplete) must use the
    // unified `md_renderer::append_styled_lines(..., &state.tables, block_idx)`
    // call so that table sort tags are present immediately — not only after
    // a resize. After Variant B refactor: the live block path uses
    // `append_block` which calls `render_block` which calls
    // `append_styled_lines` with `ctx.tables`. We grep for the renderer's
    // ctx-based table access pattern.
    let render_src = include_str!("../render.rs");
    assert!(
        render_src.contains("append_styled_lines") && render_src.contains("ctx.tables"),
        "render.rs::render_block must pass ctx.tables to append_styled_lines \
         so table sort tags are present immediately on the live append path \
         (not only after a resize-triggered full re-render)"
    );
}

#[test]
fn test_table_sort_states_extraction() {
    let mut state = AppState::new("test".into());
    let md = "| Name | Score |\n|------|-------|\n| Bob | 42 |\n| Alice | 7 |\n";
    state.handle_event(ConversationEvent::TextComplete(md.to_string()));

    // No sorts yet
    let sorts = state.table_sort_states();
    assert!(sorts.is_empty());

    // Sort the table
    state.sort_table(0, 0);
    let sorts = state.table_sort_states();
    assert_eq!(sorts.len(), 1);
    assert_eq!(sorts[0].block_index, 0);
    assert_eq!(sorts[0].table_index, 0);
    assert_eq!(sorts[0].sort_column, 0);
    assert!(!sorts[0].sort_descending);
}

#[test]
fn test_apply_table_sort_states_restores_sort() {
    let md = "| Name | Score |\n|------|-------|\n| Bob | 42 |\n| Alice | 7 |\n";

    let mut state1 = AppState::new("test".into());
    state1.handle_event(ConversationEvent::TextComplete(md.to_string()));
    state1.sort_table(0, 0);
    let sorts = state1.table_sort_states();

    let mut state2 = AppState::new("test".into());
    state2.handle_event(ConversationEvent::TextComplete(md.to_string()));
    state2.apply_table_sort_states(&sorts);

    let sorts2 = state2.table_sort_states();
    assert_eq!(sorts2.len(), 1);
    assert_eq!(sorts2[0].sort_column, 0);
    assert!(!sorts2[0].sort_descending);

    let (_, _, td) = &state2.tables[0];
    assert_eq!(td.rows[0][0], "Alice");
    assert_eq!(td.rows[1][0], "Bob");
}

#[test]
fn test_session_save_includes_table_sorts() {
    // After Stage 3/4 refactor, SaveSession is sent from both submit.rs
    // (manual /save and /name commands) and event_dispatch.rs (auto-save
    // on TurnComplete/CompactionComplete). Either source proves the chain.
    let submit_src = include_str!("../submit.rs");
    let dispatch_src = include_str!("../event_dispatch.rs");
    let combined = format!("{submit_src}{dispatch_src}");
    assert!(
        combined.contains("table_sort_states()") && combined.contains("table_sorts"),
        "SaveSession must include table_sort_states from AppState"
    );
}

#[test]
fn test_session_restore_applies_table_sorts() {
    // The previous resume paths in main.rs called `apply_table_sort_states`
    // inline. After the restore-glue refactor (commit refactor(gtk):
    // unify session-restore flow), all three paths go through
    // `restore::apply_restored_session_to_ui` which delegates to
    // `AppState::apply_session_snapshot`, which in turn calls
    // `apply_table_sort_states`. Verify the chain is intact:
    let main_source = include_str!("../main.rs");
    let restore_source = include_str!("../restore.rs");
    let app_state_source = include_str!("../app_state.rs");

    assert!(
        main_source.contains("apply_restored_session_to_ui")
            || main_source.contains("apply_table_sort_states"),
        "main.rs must use restore helper or call apply_table_sort_states directly"
    );
    assert!(
        restore_source.contains("apply_session_snapshot"),
        "restore.rs must delegate to AppState::apply_session_snapshot"
    );
    assert!(
        app_state_source.contains("apply_table_sort_states"),
        "AppState::apply_session_snapshot must call apply_table_sort_states"
    );
}

#[test]
fn test_sort_table_does_not_rerender_all_blocks() {
    // Sorting a table must NOT call rerender_all_blocks — it must only
    // re-render the affected table in-place for performance.
    let source = include_str!("../table_interactions.rs");
    // Find the sort_table click handler block and verify it doesn't call rerender_all_blocks
    let sort_handler_start = source.find("sort_table(global_idx").expect("sort handler must exist");
    let sort_handler_section = &source[sort_handler_start..sort_handler_start + 500.min(source.len() - sort_handler_start)];
    assert!(
        !sort_handler_section.contains("rerender_all_blocks"),
        "sort_table click handler must not call rerender_all_blocks — use in-place table re-render instead"
    );
}

#[test]
fn test_event_loop_has_table_row_highlight() {
    let source = include_str!("../table_interactions.rs");
    assert!(
        source.contains("table_row_highlight") && source.contains("connect_motion"),
        "table_interactions.rs must highlight table rows on hover"
    );
}
