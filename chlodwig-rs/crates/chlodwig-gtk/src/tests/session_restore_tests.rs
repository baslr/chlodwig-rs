//! Tests for session restore in the GTK app_state.
//!
//! Verifies that `AppState::restore_messages()` correctly converts
//! `Message` → GTK `DisplayBlock` using the shared `chlodwig_core::restore_messages()`.

use chlodwig_core::{ContentBlock, Message, Role, ToolResultContent};
use crate::app_state::{AppState, DisplayBlock};

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
fn test_gtk_restore_empty() {
    let mut state = AppState::new("test".into());
    state.restore_messages(&[]);
    assert!(state.blocks.is_empty());
}

#[test]
fn test_gtk_restore_user_assistant() {
    let messages = vec![user_msg("Hello"), assistant_msg("Hi!")];
    let mut state = AppState::new("test".into());
    state.restore_messages(&messages);

    assert_eq!(state.blocks.len(), 2);
    assert!(matches!(&state.blocks[0], DisplayBlock::UserMessage(t) if t == "Hello"));
    assert!(matches!(&state.blocks[1], DisplayBlock::AssistantText(t) if t == "Hi!"));
}

#[test]
fn test_gtk_restore_read_tool() {
    let messages = vec![
        assistant_tool_use("Read", "t1", serde_json::json!({"file_path": "/tmp/test.rs"})),
        tool_result("t1", "fn main() {}", false),
    ];
    let mut state = AppState::new("test".into());
    state.restore_messages(&messages);

    assert_eq!(state.blocks.len(), 2);
    // ToolUse → ToolUseStart
    assert!(matches!(&state.blocks[0], DisplayBlock::ToolUseStart { name, .. } if name == "Read"));
    // Read result → ToolResult with Read header
    match &state.blocks[1] {
        DisplayBlock::ToolResult { output, is_error } => {
            assert!(!is_error);
            assert!(output.contains("Read: /tmp/test.rs"), "Should contain Read header, got: {output}");
            assert!(output.contains("fn main() {}"));
        }
        other => panic!("Expected ToolResult, got {:?}", other),
    }
}

#[test]
fn test_gtk_restore_bash_tool() {
    let messages = vec![
        assistant_tool_use("Bash", "t1", serde_json::json!({"command": "echo hi"})),
        tool_result("t1", "hi\n", false),
    ];
    let mut state = AppState::new("test".into());
    state.restore_messages(&messages);

    assert_eq!(state.blocks.len(), 2);
    match &state.blocks[1] {
        DisplayBlock::ToolResult { output, is_error } => {
            assert!(!is_error);
            assert!(output.contains("$ echo hi"), "Should contain command, got: {output}");
            assert!(output.contains("hi\n"));
        }
        other => panic!("Expected ToolResult, got {:?}", other),
    }
}

#[test]
fn test_gtk_restore_edit_tool() {
    let messages = vec![assistant_tool_use(
        "Edit",
        "t1",
        serde_json::json!({
            "file_path": "/tmp/test.rs",
            "old_string": "old code",
            "new_string": "new code"
        }),
    )];
    let mut state = AppState::new("test".into());
    state.restore_messages(&messages);

    assert_eq!(state.blocks.len(), 1);
    match &state.blocks[0] {
        DisplayBlock::ToolUseStart { name, input } => {
            assert_eq!(name, "Edit");
            assert_eq!(input["file_path"], "/tmp/test.rs");
            assert_eq!(input["old_string"], "old code");
            assert_eq!(input["new_string"], "new code");
        }
        other => panic!("Expected ToolUseStart(Edit), got {:?}", other),
    }
}

#[test]
fn test_gtk_restore_error_tool_result() {
    let messages = vec![
        assistant_tool_use("Read", "t1", serde_json::json!({"file_path": "/nope"})),
        tool_result("t1", "No such file", true),
    ];
    let mut state = AppState::new("test".into());
    state.restore_messages(&messages);

    assert_eq!(state.blocks.len(), 2);
    match &state.blocks[1] {
        DisplayBlock::ToolResult { output, is_error } => {
            assert!(is_error);
            assert_eq!(output, "No such file");
        }
        other => panic!("Expected error ToolResult, got {:?}", other),
    }
}

#[test]
fn test_gtk_restore_full_conversation() {
    let messages = vec![
        user_msg("Show me main.rs"),
        assistant_tool_use("Read", "t1", serde_json::json!({"file_path": "src/main.rs"})),
        tool_result("t1", "fn main() {}", false),
        assistant_msg("Here's the file."),
    ];
    let mut state = AppState::new("test".into());
    state.restore_messages(&messages);

    assert_eq!(state.blocks.len(), 4);
    assert!(matches!(&state.blocks[0], DisplayBlock::UserMessage(_)));
    assert!(matches!(&state.blocks[1], DisplayBlock::ToolUseStart { .. }));
    assert!(matches!(&state.blocks[2], DisplayBlock::ToolResult { .. }));
    assert!(matches!(&state.blocks[3], DisplayBlock::AssistantText(_)));
}

#[test]
fn test_gtk_restore_utf8() {
    let messages = vec![user_msg("Ünïcödé: 日本語 🎉 ├──")];
    let mut state = AppState::new("test".into());
    state.restore_messages(&messages);

    assert!(matches!(&state.blocks[0], DisplayBlock::UserMessage(t) if t == "Ünïcödé: 日本語 🎉 ├──"));
}
