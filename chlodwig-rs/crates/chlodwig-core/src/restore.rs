//! Shared session restore logic — converts `Message` history to displayable blocks.
//!
//! Both TUI and GTK use this to restore a saved session into their UI.
//! The `RestoredBlock` enum is the shared intermediate representation;
//! each UI maps it to their own `DisplayBlock` variant.

use crate::{ContentBlock, Message, Role, ToolResultContent};

/// A UI-independent block produced by restoring saved messages.
///
/// Both the TUI and GTK map these to their own `DisplayBlock` enums.
/// This centralises the `Message` → display conversion logic so it's
/// not duplicated across frontends.
#[derive(Debug, Clone)]
pub enum RestoredBlock {
    /// User-submitted text.
    UserMessage(String),
    /// Assistant Markdown text.
    AssistantText(String),
    /// Extended thinking text from the assistant.
    Thinking(String),
    /// A tool call: name + full JSON input.
    ToolCall {
        name: String,
        input: serde_json::Value,
    },
    /// An Edit tool call with diff information.
    EditDiff {
        file_path: String,
        old_string: String,
        new_string: String,
    },
    /// Bash tool result with command and raw output.
    BashOutput {
        command: String,
        output: String,
    },
    /// Read tool result with file path and content.
    ReadOutput {
        file_path: String,
        content: String,
    },
    /// Write tool result with file path, written content, and summary.
    WriteOutput {
        file_path: String,
        content: String,
        summary: String,
    },
    /// Grep tool result with content and output mode.
    GrepOutput {
        content: String,
        output_mode: String,
    },
    /// Generic tool result (fallback).
    ToolResult {
        is_error: bool,
        output: String,
    },
    /// System message (e.g. "Resumed session").
    SystemMessage(String),
}

/// Truncate a string for preview, respecting UTF-8 char boundaries.
///
/// Walks backwards from `max_bytes` to find the last valid char boundary.
/// Appends "…" if truncated.
pub fn truncate_preview(text: &str, max_bytes: usize) -> String {
    if text.len() <= max_bytes {
        return text.to_string();
    }
    let mut end = max_bytes;
    while end > 0 && !text.is_char_boundary(end) {
        end -= 1;
    }
    format!("{}…", &text[..end])
}

/// Convert a slice of saved `Message`s into displayable blocks.
///
/// Builds a tool_id → (name, input) map from assistant ToolUse blocks,
/// then walks all messages producing the appropriate `RestoredBlock`.
///
/// This is the single source of truth for session restore display logic,
/// used by both TUI and GTK.
pub fn restore_messages(messages: &[Message]) -> Vec<RestoredBlock> {
    // Build a map of tool_use_id → (tool_name, input) from assistant messages
    // so ToolResult blocks can identify Read/Write/Grep/Bash results.
    let mut tool_id_map: std::collections::HashMap<&str, (&str, &serde_json::Value)> =
        std::collections::HashMap::new();
    for msg in messages {
        if msg.role == Role::Assistant {
            for block in &msg.content {
                if let ContentBlock::ToolUse { id, name, input } = block {
                    tool_id_map.insert(id.as_str(), (name.as_str(), input));
                }
            }
        }
    }

    let mut blocks = Vec::new();

    for msg in messages {
        match msg.role {
            Role::User => {
                for block in &msg.content {
                    match block {
                        ContentBlock::Text { text } => {
                            blocks.push(RestoredBlock::UserMessage(text.clone()));
                        }
                        ContentBlock::ToolResult {
                            tool_use_id,
                            content,
                            is_error,
                        } => {
                            let info = tool_id_map.get(tool_use_id.as_str()).copied();
                            let tool_name = info.map(|(name, _)| name);
                            let tool_input = info.map(|(_, input)| input);
                            let err = is_error.unwrap_or(false);

                            blocks.push(restore_tool_result(
                                tool_name, tool_input, content, err,
                            ));
                        }
                        // Image blocks in user messages are not displayed on restore
                        _ => {}
                    }
                }
            }
            Role::Assistant => {
                for block in &msg.content {
                    match block {
                        ContentBlock::Text { text } => {
                            blocks.push(RestoredBlock::AssistantText(text.clone()));
                        }
                        ContentBlock::ToolUse { name, input, .. } => {
                            blocks.push(restore_tool_call(name, input));
                        }
                        ContentBlock::Thinking { thinking } => {
                            blocks.push(RestoredBlock::Thinking(thinking.clone()));
                        }
                        _ => {}
                    }
                }
            }
        }
    }

    blocks
}

/// Convert a ToolUse block into the appropriate RestoredBlock.
fn restore_tool_call(name: &str, input: &serde_json::Value) -> RestoredBlock {
    if name == "Edit" {
        let file_path = input["file_path"]
            .as_str()
            .unwrap_or("(unknown)")
            .to_string();
        let old_string = input["old_string"]
            .as_str()
            .unwrap_or("")
            .to_string();
        let new_string = input["new_string"]
            .as_str()
            .unwrap_or("")
            .to_string();
        RestoredBlock::EditDiff {
            file_path,
            old_string,
            new_string,
        }
    } else {
        RestoredBlock::ToolCall {
            name: name.to_string(),
            input: input.clone(),
        }
    }
}

/// Convert a ToolResult into the appropriate RestoredBlock,
/// using the tool name/input from the matching ToolUse block.
fn restore_tool_result(
    tool_name: Option<&str>,
    tool_input: Option<&serde_json::Value>,
    content: &ToolResultContent,
    is_error: bool,
) -> RestoredBlock {
    let text = extract_tool_result_text(content);

    // Specialized rendering for known tools (only when not an error)
    if !is_error {
        if let Some(name) = tool_name {
            match name {
                "Read" => {
                    let file_path = tool_input
                        .and_then(|i| i["file_path"].as_str())
                        .unwrap_or("(unknown)")
                        .to_string();
                    return RestoredBlock::ReadOutput {
                        file_path,
                        content: text,
                    };
                }
                "Write" => {
                    let file_path = tool_input
                        .and_then(|i| i["file_path"].as_str())
                        .unwrap_or("(unknown)")
                        .to_string();
                    let file_content = tool_input
                        .and_then(|i| i["content"].as_str())
                        .unwrap_or("")
                        .to_string();
                    return RestoredBlock::WriteOutput {
                        file_path,
                        content: file_content,
                        summary: text,
                    };
                }
                "Grep" => {
                    let output_mode = tool_input
                        .and_then(|i| i["output_mode"].as_str())
                        .unwrap_or("files_with_matches")
                        .to_string();
                    return RestoredBlock::GrepOutput {
                        content: text,
                        output_mode,
                    };
                }
                "Bash" => {
                    let command = tool_input
                        .and_then(|i| i["command"].as_str())
                        .unwrap_or("(unknown)")
                        .to_string();
                    return RestoredBlock::BashOutput {
                        command,
                        output: text,
                    };
                }
                _ => {}
            }
        }
    }

    // Fallback: generic tool result
    RestoredBlock::ToolResult {
        is_error,
        output: text,
    }
}

/// Extract text from a ToolResultContent.
fn extract_tool_result_text(content: &ToolResultContent) -> String {
    match content {
        ToolResultContent::Text(t) => t.clone(),
        ToolResultContent::Blocks(blocks) => blocks
            .iter()
            .filter_map(|b| match b {
                crate::ToolResultBlock::Text { text } => Some(text.as_str()),
                _ => None,
            })
            .collect::<Vec<_>>()
            .join("\n"),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{ContentBlock, Message, Role, ToolResultContent};

    #[test]
    fn test_restore_empty_messages() {
        let blocks = restore_messages(&[]);
        assert!(blocks.is_empty());
    }

    #[test]
    fn test_restore_user_text() {
        let messages = vec![Message {
            role: Role::User,
            content: vec![ContentBlock::Text {
                text: "Hello".into(),
            }],
        }];
        let blocks = restore_messages(&messages);
        assert_eq!(blocks.len(), 1);
        assert!(matches!(&blocks[0], RestoredBlock::UserMessage(t) if t == "Hello"));
    }

    #[test]
    fn test_restore_assistant_text() {
        let messages = vec![Message {
            role: Role::Assistant,
            content: vec![ContentBlock::Text {
                text: "Hi there!".into(),
            }],
        }];
        let blocks = restore_messages(&messages);
        assert_eq!(blocks.len(), 1);
        assert!(matches!(&blocks[0], RestoredBlock::AssistantText(t) if t == "Hi there!"));
    }

    #[test]
    fn test_restore_thinking() {
        let messages = vec![Message {
            role: Role::Assistant,
            content: vec![ContentBlock::Thinking {
                thinking: "Let me think...".into(),
            }],
        }];
        let blocks = restore_messages(&messages);
        assert_eq!(blocks.len(), 1);
        assert!(matches!(&blocks[0], RestoredBlock::Thinking(t) if t == "Let me think..."));
    }

    #[test]
    fn test_restore_tool_call_generic() {
        let messages = vec![Message {
            role: Role::Assistant,
            content: vec![ContentBlock::ToolUse {
                id: "tool_1".into(),
                name: "Glob".into(),
                input: serde_json::json!({"pattern": "*.rs"}),
            }],
        }];
        let blocks = restore_messages(&messages);
        assert_eq!(blocks.len(), 1);
        match &blocks[0] {
            RestoredBlock::ToolCall { name, input } => {
                assert_eq!(name, "Glob");
                assert_eq!(input["pattern"], "*.rs");
            }
            other => panic!("Expected ToolCall, got {:?}", other),
        }
    }

    #[test]
    fn test_restore_edit_diff() {
        let messages = vec![Message {
            role: Role::Assistant,
            content: vec![ContentBlock::ToolUse {
                id: "tool_1".into(),
                name: "Edit".into(),
                input: serde_json::json!({
                    "file_path": "/tmp/test.rs",
                    "old_string": "fn old() {}",
                    "new_string": "fn new() {}"
                }),
            }],
        }];
        let blocks = restore_messages(&messages);
        assert_eq!(blocks.len(), 1);
        match &blocks[0] {
            RestoredBlock::EditDiff {
                file_path,
                old_string,
                new_string,
            } => {
                assert_eq!(file_path, "/tmp/test.rs");
                assert_eq!(old_string, "fn old() {}");
                assert_eq!(new_string, "fn new() {}");
            }
            other => panic!("Expected EditDiff, got {:?}", other),
        }
    }

    #[test]
    fn test_restore_read_output() {
        let messages = vec![
            Message {
                role: Role::Assistant,
                content: vec![ContentBlock::ToolUse {
                    id: "tool_1".into(),
                    name: "Read".into(),
                    input: serde_json::json!({"file_path": "/tmp/test.rs"}),
                }],
            },
            Message {
                role: Role::User,
                content: vec![ContentBlock::ToolResult {
                    tool_use_id: "tool_1".into(),
                    content: ToolResultContent::Text("fn main() {}".into()),
                    is_error: None,
                }],
            },
        ];
        let blocks = restore_messages(&messages);
        assert_eq!(blocks.len(), 2); // ToolCall(Read) + ReadOutput
        match &blocks[1] {
            RestoredBlock::ReadOutput {
                file_path,
                content,
            } => {
                assert_eq!(file_path, "/tmp/test.rs");
                assert_eq!(content, "fn main() {}");
            }
            other => panic!("Expected ReadOutput, got {:?}", other),
        }
    }

    #[test]
    fn test_restore_write_output() {
        let messages = vec![
            Message {
                role: Role::Assistant,
                content: vec![ContentBlock::ToolUse {
                    id: "tool_1".into(),
                    name: "Write".into(),
                    input: serde_json::json!({
                        "file_path": "/tmp/out.rs",
                        "content": "fn main() {}"
                    }),
                }],
            },
            Message {
                role: Role::User,
                content: vec![ContentBlock::ToolResult {
                    tool_use_id: "tool_1".into(),
                    content: ToolResultContent::Text("Wrote 1 line".into()),
                    is_error: None,
                }],
            },
        ];
        let blocks = restore_messages(&messages);
        assert_eq!(blocks.len(), 2);
        match &blocks[1] {
            RestoredBlock::WriteOutput {
                file_path,
                content,
                summary,
            } => {
                assert_eq!(file_path, "/tmp/out.rs");
                assert_eq!(content, "fn main() {}");
                assert_eq!(summary, "Wrote 1 line");
            }
            other => panic!("Expected WriteOutput, got {:?}", other),
        }
    }

    #[test]
    fn test_restore_grep_output() {
        let messages = vec![
            Message {
                role: Role::Assistant,
                content: vec![ContentBlock::ToolUse {
                    id: "tool_1".into(),
                    name: "Grep".into(),
                    input: serde_json::json!({
                        "pattern": "fn main",
                        "output_mode": "content"
                    }),
                }],
            },
            Message {
                role: Role::User,
                content: vec![ContentBlock::ToolResult {
                    tool_use_id: "tool_1".into(),
                    content: ToolResultContent::Text("src/main.rs:1:fn main() {}".into()),
                    is_error: None,
                }],
            },
        ];
        let blocks = restore_messages(&messages);
        assert_eq!(blocks.len(), 2);
        match &blocks[1] {
            RestoredBlock::GrepOutput {
                content,
                output_mode,
            } => {
                assert_eq!(content, "src/main.rs:1:fn main() {}");
                assert_eq!(output_mode, "content");
            }
            other => panic!("Expected GrepOutput, got {:?}", other),
        }
    }

    #[test]
    fn test_restore_bash_output() {
        let messages = vec![
            Message {
                role: Role::Assistant,
                content: vec![ContentBlock::ToolUse {
                    id: "tool_1".into(),
                    name: "Bash".into(),
                    input: serde_json::json!({"command": "echo hello"}),
                }],
            },
            Message {
                role: Role::User,
                content: vec![ContentBlock::ToolResult {
                    tool_use_id: "tool_1".into(),
                    content: ToolResultContent::Text("hello\n".into()),
                    is_error: None,
                }],
            },
        ];
        let blocks = restore_messages(&messages);
        assert_eq!(blocks.len(), 2);
        match &blocks[1] {
            RestoredBlock::BashOutput { command, output } => {
                assert_eq!(command, "echo hello");
                assert_eq!(output, "hello\n");
            }
            other => panic!("Expected BashOutput, got {:?}", other),
        }
    }

    #[test]
    fn test_restore_tool_result_error_is_generic() {
        // When is_error=true, even known tools get generic ToolResult
        let messages = vec![
            Message {
                role: Role::Assistant,
                content: vec![ContentBlock::ToolUse {
                    id: "tool_1".into(),
                    name: "Read".into(),
                    input: serde_json::json!({"file_path": "/nonexistent"}),
                }],
            },
            Message {
                role: Role::User,
                content: vec![ContentBlock::ToolResult {
                    tool_use_id: "tool_1".into(),
                    content: ToolResultContent::Text("No such file".into()),
                    is_error: Some(true),
                }],
            },
        ];
        let blocks = restore_messages(&messages);
        assert_eq!(blocks.len(), 2);
        match &blocks[1] {
            RestoredBlock::ToolResult { is_error, output } => {
                assert!(is_error);
                assert_eq!(output, "No such file");
            }
            other => panic!("Expected ToolResult (error), got {:?}", other),
        }
    }

    #[test]
    fn test_restore_unknown_tool_result_is_generic() {
        // ToolResult without matching ToolUse → generic fallback
        let messages = vec![Message {
            role: Role::User,
            content: vec![ContentBlock::ToolResult {
                tool_use_id: "orphan_tool".into(),
                content: ToolResultContent::Text("some output".into()),
                is_error: None,
            }],
        }];
        let blocks = restore_messages(&messages);
        assert_eq!(blocks.len(), 1);
        match &blocks[0] {
            RestoredBlock::ToolResult { is_error, output } => {
                assert!(!is_error);
                assert_eq!(output, "some output");
            }
            other => panic!("Expected ToolResult (generic), got {:?}", other),
        }
    }

    #[test]
    fn test_restore_full_conversation() {
        // A realistic conversation: user asks, assistant calls Read, result, assistant responds
        let messages = vec![
            Message {
                role: Role::User,
                content: vec![ContentBlock::Text {
                    text: "Show me main.rs".into(),
                }],
            },
            Message {
                role: Role::Assistant,
                content: vec![ContentBlock::ToolUse {
                    id: "t1".into(),
                    name: "Read".into(),
                    input: serde_json::json!({"file_path": "src/main.rs"}),
                }],
            },
            Message {
                role: Role::User,
                content: vec![ContentBlock::ToolResult {
                    tool_use_id: "t1".into(),
                    content: ToolResultContent::Text("fn main() {}".into()),
                    is_error: None,
                }],
            },
            Message {
                role: Role::Assistant,
                content: vec![ContentBlock::Text {
                    text: "Here's the file content.".into(),
                }],
            },
        ];
        let blocks = restore_messages(&messages);
        assert_eq!(blocks.len(), 4);
        assert!(matches!(&blocks[0], RestoredBlock::UserMessage(_)));
        assert!(matches!(&blocks[1], RestoredBlock::ToolCall { name, .. } if name == "Read"));
        assert!(matches!(&blocks[2], RestoredBlock::ReadOutput { .. }));
        assert!(matches!(&blocks[3], RestoredBlock::AssistantText(_)));
    }

    #[test]
    fn test_restore_blocks_content() {
        // ToolResult with Blocks content
        let messages = vec![
            Message {
                role: Role::Assistant,
                content: vec![ContentBlock::ToolUse {
                    id: "t1".into(),
                    name: "SomeTool".into(),
                    input: serde_json::json!({}),
                }],
            },
            Message {
                role: Role::User,
                content: vec![ContentBlock::ToolResult {
                    tool_use_id: "t1".into(),
                    content: ToolResultContent::Blocks(vec![
                        crate::ToolResultBlock::Text { text: "part 1".into() },
                        crate::ToolResultBlock::Text { text: "part 2".into() },
                    ]),
                    is_error: None,
                }],
            },
        ];
        let blocks = restore_messages(&messages);
        match &blocks[1] {
            RestoredBlock::ToolResult { is_error, output } => {
                assert!(!is_error);
                assert_eq!(output, "part 1\npart 2");
            }
            other => panic!("Expected ToolResult, got {:?}", other),
        }
    }

    #[test]
    fn test_restore_utf8() {
        let messages = vec![Message {
            role: Role::User,
            content: vec![ContentBlock::Text {
                text: "Ünïcödé: 日本語 🎉 ├──".into(),
            }],
        }];
        let blocks = restore_messages(&messages);
        assert!(
            matches!(&blocks[0], RestoredBlock::UserMessage(t) if t == "Ünïcödé: 日本語 🎉 ├──")
        );
    }

    #[test]
    fn test_truncate_preview_short() {
        assert_eq!(truncate_preview("hello", 10), "hello");
    }

    #[test]
    fn test_truncate_preview_exact() {
        assert_eq!(truncate_preview("hello", 5), "hello");
    }

    #[test]
    fn test_truncate_preview_truncates() {
        let result = truncate_preview("hello world", 5);
        assert_eq!(result, "hello…");
    }

    #[test]
    fn test_truncate_preview_utf8_boundary() {
        // "├" is 3 bytes (E2 94 9C). Cutting at byte 1 or 2 would panic.
        let text = "├──";
        let result = truncate_preview(text, 1);
        // Should walk back to byte 0 (empty prefix) + "…"
        assert_eq!(result, "…");
    }

    #[test]
    fn test_truncate_preview_emoji_boundary() {
        let text = "hello🎉world";
        // '🎉' is 4 bytes. "hello" is 5 bytes. Cutting at 6, 7, 8 lands inside the emoji.
        let result = truncate_preview(text, 7);
        assert_eq!(result, "hello…"); // walks back past the emoji to byte 5
    }

    #[test]
    fn test_restore_grep_default_output_mode() {
        // Grep without explicit output_mode → defaults to "files_with_matches"
        let messages = vec![
            Message {
                role: Role::Assistant,
                content: vec![ContentBlock::ToolUse {
                    id: "t1".into(),
                    name: "Grep".into(),
                    input: serde_json::json!({"pattern": "main"}),
                }],
            },
            Message {
                role: Role::User,
                content: vec![ContentBlock::ToolResult {
                    tool_use_id: "t1".into(),
                    content: ToolResultContent::Text("src/main.rs".into()),
                    is_error: None,
                }],
            },
        ];
        let blocks = restore_messages(&messages);
        match &blocks[1] {
            RestoredBlock::GrepOutput { output_mode, .. } => {
                assert_eq!(output_mode, "files_with_matches");
            }
            other => panic!("Expected GrepOutput, got {:?}", other),
        }
    }
}
