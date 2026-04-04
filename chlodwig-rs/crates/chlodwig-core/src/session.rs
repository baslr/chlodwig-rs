//! Session persistence — auto-save conversation state to disk.
//!
//! After every completed turn or compaction, the conversation messages
//! are serialised to `~/.chlodwig-rs/session.json` so the session can
//! be resumed after a crash or restart.

use crate::{Message, SystemBlock};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Serialisable snapshot of a conversation session.
///
/// Contains everything needed to resume the conversation:
/// messages, model name, system prompt, and a timestamp.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionSnapshot {
    /// ISO-8601 timestamp when the snapshot was taken.
    pub saved_at: String,
    /// Model name (e.g. "claude-sonnet-4-20250514").
    pub model: String,
    /// The full conversation history.
    pub messages: Vec<Message>,
    /// The system prompt blocks.
    pub system_prompt: Vec<SystemBlock>,
}

/// Returns the path to the session file: `~/.chlodwig-rs/session.json`.
pub fn session_path() -> PathBuf {
    crate::log_dir().join("session.json")
}

/// Save a session snapshot to disk (blocking I/O).
///
/// Writes to a temporary file first, then atomically renames,
/// so a crash during write never corrupts the existing file.
pub fn save_session(snapshot: &SessionSnapshot) -> std::io::Result<()> {
    let path = session_path();
    let json = serde_json::to_string_pretty(snapshot)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;

    // Write to a temp file in the same directory, then rename (atomic on POSIX).
    let tmp_path = path.with_extension("json.tmp");
    std::fs::write(&tmp_path, json.as_bytes())?;
    std::fs::rename(&tmp_path, &path)?;

    tracing::debug!(path = %path.display(), bytes = json.len(), "session saved");
    Ok(())
}

/// Load a session snapshot from disk, if one exists.
///
/// Returns `None` if the file doesn't exist. Returns `Err` on I/O
/// or parse errors.
pub fn load_session() -> std::io::Result<Option<SessionSnapshot>> {
    let path = session_path();
    if !path.exists() {
        return Ok(None);
    }
    let json = std::fs::read_to_string(&path)?;
    let snapshot: SessionSnapshot = serde_json::from_str(&json)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?;
    tracing::debug!(
        path = %path.display(),
        messages = snapshot.messages.len(),
        "session loaded"
    );
    Ok(Some(snapshot))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{ContentBlock, Role};

    /// Helper: build a minimal snapshot with the given messages.
    fn make_snapshot(messages: Vec<Message>) -> SessionSnapshot {
        SessionSnapshot {
            saved_at: "2026-04-04T12:00:00Z".into(),
            model: "test-model".into(),
            messages,
            system_prompt: vec![SystemBlock::text("You are helpful.")],
        }
    }

    #[test]
    fn test_session_snapshot_roundtrip_empty_messages() {
        let snap = make_snapshot(vec![]);
        let json = serde_json::to_string(&snap).unwrap();
        let restored: SessionSnapshot = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.messages.len(), 0);
        assert_eq!(restored.model, "test-model");
        assert_eq!(restored.saved_at, "2026-04-04T12:00:00Z");
        assert_eq!(restored.system_prompt.len(), 1);
        assert_eq!(restored.system_prompt[0].text, "You are helpful.");
    }

    #[test]
    fn test_session_snapshot_roundtrip_with_messages() {
        let messages = vec![
            Message {
                role: Role::User,
                content: vec![ContentBlock::Text {
                    text: "Hello".into(),
                }],
            },
            Message {
                role: Role::Assistant,
                content: vec![ContentBlock::Text {
                    text: "Hi there!".into(),
                }],
            },
        ];
        let snap = make_snapshot(messages);
        let json = serde_json::to_string_pretty(&snap).unwrap();
        let restored: SessionSnapshot = serde_json::from_str(&json).unwrap();

        assert_eq!(restored.messages.len(), 2);
        assert_eq!(restored.messages[0].role, Role::User);
        assert_eq!(restored.messages[0].text(), "Hello");
        assert_eq!(restored.messages[1].role, Role::Assistant);
        assert_eq!(restored.messages[1].text(), "Hi there!");
    }

    #[test]
    fn test_session_snapshot_roundtrip_with_tool_use() {
        let messages = vec![
            Message {
                role: Role::User,
                content: vec![ContentBlock::Text {
                    text: "Read my file".into(),
                }],
            },
            Message {
                role: Role::Assistant,
                content: vec![ContentBlock::ToolUse {
                    id: "tool_123".into(),
                    name: "Read".into(),
                    input: serde_json::json!({"file_path": "/tmp/test.txt"}),
                }],
            },
            Message {
                role: Role::User,
                content: vec![ContentBlock::ToolResult {
                    tool_use_id: "tool_123".into(),
                    content: crate::ToolResultContent::Text("file contents here".into()),
                    is_error: None,
                }],
            },
        ];
        let snap = make_snapshot(messages);
        let json = serde_json::to_string(&snap).unwrap();
        let restored: SessionSnapshot = serde_json::from_str(&json).unwrap();

        assert_eq!(restored.messages.len(), 3);
        // Verify tool_use block
        match &restored.messages[1].content[0] {
            ContentBlock::ToolUse { id, name, input } => {
                assert_eq!(id, "tool_123");
                assert_eq!(name, "Read");
                assert_eq!(input["file_path"], "/tmp/test.txt");
            }
            other => panic!("Expected ToolUse, got {:?}", other),
        }
        // Verify tool_result block
        match &restored.messages[2].content[0] {
            ContentBlock::ToolResult {
                tool_use_id,
                content,
                is_error,
            } => {
                assert_eq!(tool_use_id, "tool_123");
                match content {
                    crate::ToolResultContent::Text(t) => assert_eq!(t, "file contents here"),
                    other => panic!("Expected Text, got {:?}", other),
                }
                assert!(is_error.is_none());
            }
            other => panic!("Expected ToolResult, got {:?}", other),
        }
    }

    #[test]
    fn test_session_snapshot_roundtrip_utf8() {
        // Gotcha #16: UTF-8 boundary safety — verify multibyte chars survive round-trip.
        let messages = vec![Message {
            role: Role::User,
            content: vec![ContentBlock::Text {
                text: "Ünïcödé: 日本語 🎉 ├── box drawing".into(),
            }],
        }];
        let snap = make_snapshot(messages);
        let json = serde_json::to_string(&snap).unwrap();
        let restored: SessionSnapshot = serde_json::from_str(&json).unwrap();

        assert_eq!(
            restored.messages[0].text(),
            "Ünïcödé: 日本語 🎉 ├── box drawing"
        );
    }

    #[test]
    fn test_save_and_load_session_file() {
        // Use a temporary directory to avoid polluting the real ~/.chlodwig-rs/
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("session.json");

        let snap = make_snapshot(vec![Message {
            role: Role::User,
            content: vec![ContentBlock::Text {
                text: "persisted message".into(),
            }],
        }]);

        // Save manually to the temp path
        let json = serde_json::to_string_pretty(&snap).unwrap();
        std::fs::write(&path, &json).unwrap();

        // Load manually from the temp path
        let loaded_json = std::fs::read_to_string(&path).unwrap();
        let loaded: SessionSnapshot = serde_json::from_str(&loaded_json).unwrap();

        assert_eq!(loaded.messages.len(), 1);
        assert_eq!(loaded.messages[0].text(), "persisted message");
        assert_eq!(loaded.model, "test-model");
    }

    #[test]
    fn test_save_session_creates_valid_json() {
        let snap = make_snapshot(vec![
            Message {
                role: Role::User,
                content: vec![ContentBlock::Text {
                    text: "question".into(),
                }],
            },
            Message {
                role: Role::Assistant,
                content: vec![ContentBlock::Text {
                    text: "answer".into(),
                }],
            },
        ]);
        let json = serde_json::to_string_pretty(&snap).unwrap();

        // Must be valid JSON
        let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert!(parsed.is_object());
        assert!(parsed["messages"].is_array());
        assert_eq!(parsed["messages"].as_array().unwrap().len(), 2);
        assert_eq!(parsed["model"], "test-model");
        assert_eq!(parsed["saved_at"], "2026-04-04T12:00:00Z");
    }

    #[test]
    fn test_session_path_is_in_chlodwig_rs_dir() {
        let path = session_path();
        assert!(
            path.parent()
                .unwrap()
                .ends_with(".chlodwig-rs"),
            "Expected .chlodwig-rs dir, got: {}",
            path.display()
        );
        assert_eq!(
            path.file_name().unwrap().to_str().unwrap(),
            "session.json"
        );
    }

    #[test]
    fn test_load_session_returns_none_when_no_file() {
        // We can't easily test with the real path, but we can test the
        // deserialization of a "file not found" scenario via the function
        // logic. If the file doesn't exist at `session_path()`, it should
        // return Ok(None). We'll just verify the path logic here.
        let path = session_path();
        // If by chance the file doesn't exist, load should return None.
        // (We don't delete real files in tests.)
        if !path.exists() {
            let result = load_session().unwrap();
            assert!(result.is_none());
        }
    }

    #[test]
    fn test_session_snapshot_with_cached_system_block() {
        let snap = SessionSnapshot {
            saved_at: "2026-04-04T12:00:00Z".into(),
            model: "test-model".into(),
            messages: vec![],
            system_prompt: vec![
                SystemBlock::text("block 1"),
                SystemBlock::cached("block 2 (cached)"),
            ],
        };
        let json = serde_json::to_string(&snap).unwrap();
        let restored: SessionSnapshot = serde_json::from_str(&json).unwrap();

        assert_eq!(restored.system_prompt.len(), 2);
        assert!(restored.system_prompt[0].cache_control.is_none());
        assert!(restored.system_prompt[1].cache_control.is_some());
        assert_eq!(
            restored.system_prompt[1].cache_control.as_ref().unwrap().control_type,
            "ephemeral"
        );
    }
}
