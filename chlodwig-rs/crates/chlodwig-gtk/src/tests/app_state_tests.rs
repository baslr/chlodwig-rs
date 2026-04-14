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
        DisplayBlock::ToolResult { output, is_error } => {
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
    });
    state.handle_event(ConversationEvent::Usage {
        input_tokens: 200,
        output_tokens: 75,
    });
    assert_eq!(state.input_tokens, 300);
    assert_eq!(state.output_tokens, 125);
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
