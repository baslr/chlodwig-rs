/// Tests for restoring saved session messages into DisplayBlocks,
/// so the user can scroll back through the conversation after /resume.

use chlodwig_core::{ContentBlock, Message, Role, ToolResultContent};
use crate::app::App;
use crate::types::DisplayBlock;

/// Helper: create a minimal message list for testing.
fn user_msg(text: &str) -> Message {
    Message {
        role: Role::User,
        content: vec![ContentBlock::Text { text: text.into() }],
    }
}

fn assistant_msg(text: &str) -> Message {
    Message {
        role: Role::Assistant,
        content: vec![ContentBlock::Text { text: text.into() }],
    }
}

fn assistant_tool_use(name: &str, id: &str, input: serde_json::Value) -> Message {
    Message {
        role: Role::Assistant,
        content: vec![ContentBlock::ToolUse {
            id: id.into(),
            name: name.into(),
            input,
        }],
    }
}

fn tool_result(tool_use_id: &str, output: &str, is_error: bool) -> Message {
    Message {
        role: Role::User,
        content: vec![ContentBlock::ToolResult {
            tool_use_id: tool_use_id.into(),
            content: ToolResultContent::Text(output.into()),
            is_error: if is_error { Some(true) } else { None },
        }],
    }
}

#[test]
fn test_restore_empty_messages_produces_no_display_blocks() {
    let mut app = App::new("test-model".into());
    app.restore_messages_to_display(&[]);
    // Only the "Resumed session" system message should be absent — no blocks at all
    assert!(app.display_blocks.is_empty(), "Empty messages should produce no display blocks");
}

#[test]
fn test_restore_simple_user_assistant_exchange() {
    let messages = vec![
        user_msg("Hello"),
        assistant_msg("Hi there!"),
    ];
    let mut app = App::new("test-model".into());
    app.restore_messages_to_display(&messages);

    // Should have UserMessage + AssistantText
    let user_blocks: Vec<_> = app.display_blocks.iter().filter(|b| matches!(b, DisplayBlock::UserMessage(_))).collect();
    let assistant_blocks: Vec<_> = app.display_blocks.iter().filter(|b| matches!(b, DisplayBlock::AssistantText(_))).collect();

    assert_eq!(user_blocks.len(), 1, "Should have 1 user block");
    assert_eq!(assistant_blocks.len(), 1, "Should have 1 assistant block");

    match &user_blocks[0] {
        DisplayBlock::UserMessage(t) => assert_eq!(t, "Hello"),
        _ => unreachable!(),
    }
    match &assistant_blocks[0] {
        DisplayBlock::AssistantText(t) => assert_eq!(t, "Hi there!"),
        _ => unreachable!(),
    }
}

#[test]
fn test_restore_multi_turn_conversation() {
    let messages = vec![
        user_msg("First question"),
        assistant_msg("First answer"),
        user_msg("Second question"),
        assistant_msg("Second answer"),
    ];
    let mut app = App::new("test-model".into());
    app.restore_messages_to_display(&messages);

    let user_blocks: Vec<_> = app.display_blocks.iter().filter(|b| matches!(b, DisplayBlock::UserMessage(_))).collect();
    let assistant_blocks: Vec<_> = app.display_blocks.iter().filter(|b| matches!(b, DisplayBlock::AssistantText(_))).collect();

    assert_eq!(user_blocks.len(), 2, "Should have 2 user blocks");
    assert_eq!(assistant_blocks.len(), 2, "Should have 2 assistant blocks");
}

#[test]
fn test_restore_tool_use_and_result() {
    let messages = vec![
        user_msg("Read my file"),
        assistant_tool_use("Read", "toolu_01", serde_json::json!({"file_path": "/tmp/test.txt"})),
        tool_result("toolu_01", "file contents here", false),
        assistant_msg("Here's what I found."),
    ];
    let mut app = App::new("test-model".into());
    app.restore_messages_to_display(&messages);

    let tool_calls: Vec<_> = app.display_blocks.iter().filter(|b| matches!(b, DisplayBlock::ToolCall { .. })).collect();
    let tool_results: Vec<_> = app.display_blocks.iter().filter(|b| matches!(b, DisplayBlock::ToolResult { .. })).collect();

    assert_eq!(tool_calls.len(), 1, "Should have 1 tool call block");
    assert_eq!(tool_results.len(), 1, "Should have 1 tool result block");

    match &tool_calls[0] {
        DisplayBlock::ToolCall { name, .. } => assert_eq!(name, "Read"),
        _ => unreachable!(),
    }
    match &tool_results[0] {
        DisplayBlock::ToolResult { is_error, preview } => {
            assert!(!is_error);
            assert!(preview.contains("file contents here"));
        }
        _ => unreachable!(),
    }
}

#[test]
fn test_restore_tool_result_error() {
    let messages = vec![
        user_msg("Do something"),
        assistant_tool_use("Bash", "toolu_02", serde_json::json!({"command": "bad_cmd"})),
        tool_result("toolu_02", "command not found", true),
    ];
    let mut app = App::new("test-model".into());
    app.restore_messages_to_display(&messages);

    let tool_results: Vec<_> = app.display_blocks.iter().filter(|b| matches!(b, DisplayBlock::ToolResult { .. })).collect();
    assert_eq!(tool_results.len(), 1);
    match &tool_results[0] {
        DisplayBlock::ToolResult { is_error, preview } => {
            assert!(is_error, "Should be marked as error");
            assert!(preview.contains("command not found"));
        }
        _ => unreachable!(),
    }
}

#[test]
fn test_restore_thinking_block() {
    let messages = vec![
        user_msg("Complex question"),
        Message {
            role: Role::Assistant,
            content: vec![
                ContentBlock::Thinking { thinking: "Let me think...".into() },
                ContentBlock::Text { text: "Here's my answer.".into() },
            ],
        },
    ];
    let mut app = App::new("test-model".into());
    app.restore_messages_to_display(&messages);

    let thinking: Vec<_> = app.display_blocks.iter().filter(|b| matches!(b, DisplayBlock::Thinking(_))).collect();
    assert_eq!(thinking.len(), 1, "Should have 1 thinking block");
    match &thinking[0] {
        DisplayBlock::Thinking(t) => assert_eq!(t, "Let me think..."),
        _ => unreachable!(),
    }
}

#[test]
fn test_restore_tool_result_truncated_at_utf8_boundary() {
    // Gotcha #16: tool result preview must truncate safely at UTF-8 boundaries
    let mut long_text = "x".repeat(498);
    long_text.push('├'); // 3 bytes, bytes 498..501
    long_text.push_str(&"y".repeat(100));

    let messages = vec![
        user_msg("Read big file"),
        assistant_tool_use("Read", "toolu_03", serde_json::json!({"file_path": "/big"})),
        tool_result("toolu_03", &long_text, false),
    ];
    let mut app = App::new("test-model".into());
    // This must NOT panic
    app.restore_messages_to_display(&messages);

    let results: Vec<_> = app.display_blocks.iter().filter(|b| matches!(b, DisplayBlock::ToolResult { .. })).collect();
    assert_eq!(results.len(), 1);
    match &results[0] {
        DisplayBlock::ToolResult { preview, .. } => {
            assert!(preview.ends_with("..."), "Long result should be truncated");
            assert!(preview.len() <= 503, "Truncated preview should be max ~503 bytes");
        }
        _ => unreachable!(),
    }
}

#[test]
fn test_restore_marks_lines_dirty() {
    let messages = vec![
        user_msg("Hello"),
        assistant_msg("Hi"),
    ];
    let mut app = App::new("test-model".into());
    app.lines_dirty = false;
    app.restore_messages_to_display(&messages);
    assert!(app.lines_dirty, "Should mark lines as dirty after restore");
}

#[test]
fn test_restore_mixed_content_in_single_assistant_message() {
    // Assistant message with both text and tool_use
    let messages = vec![
        user_msg("Help me"),
        Message {
            role: Role::Assistant,
            content: vec![
                ContentBlock::Text { text: "Let me check.".into() },
                ContentBlock::ToolUse {
                    id: "toolu_04".into(),
                    name: "Bash".into(),
                    input: serde_json::json!({"command": "ls"}),
                },
            ],
        },
        tool_result("toolu_04", "file1.rs\nfile2.rs", false),
    ];
    let mut app = App::new("test-model".into());
    app.restore_messages_to_display(&messages);

    let texts: Vec<_> = app.display_blocks.iter().filter(|b| matches!(b, DisplayBlock::AssistantText(_))).collect();
    let calls: Vec<_> = app.display_blocks.iter().filter(|b| matches!(b, DisplayBlock::ToolCall { .. })).collect();
    let results: Vec<_> = app.display_blocks.iter().filter(|b| matches!(b, DisplayBlock::ToolResult { .. })).collect();

    assert_eq!(texts.len(), 1, "Should have the text part");
    assert_eq!(calls.len(), 1, "Should have the tool call");
    assert_eq!(results.len(), 1, "Should have the tool result");
}

#[test]
fn test_restore_skips_tool_result_only_user_messages() {
    // User messages that only contain ToolResult should produce ToolResult blocks,
    // NOT UserMessage blocks (they are tool results, not user prompts).
    let messages = vec![
        user_msg("Read file"),
        assistant_tool_use("Read", "toolu_05", serde_json::json!({"file_path": "/test"})),
        tool_result("toolu_05", "contents", false),
    ];
    let mut app = App::new("test-model".into());
    app.restore_messages_to_display(&messages);

    let user_blocks: Vec<_> = app.display_blocks.iter().filter(|b| matches!(b, DisplayBlock::UserMessage(_))).collect();
    assert_eq!(user_blocks.len(), 1, "Only the actual user prompt should be a UserMessage, not the tool result");
}
