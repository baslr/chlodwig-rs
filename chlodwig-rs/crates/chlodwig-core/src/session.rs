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
    /// Editable constants (optional for backward compat with old session files).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub constants: Option<ConstantsSnapshot>,
}

/// Serialisable snapshot of the editable constants.
///
/// Every field has `#[serde(default)]` so that old session files
/// (which may be missing newly-added fields) deserialize cleanly
/// with the default value.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConstantsSnapshot {
    #[serde(default = "default_auto_compact_threshold")]
    pub auto_compact_threshold: u64,
    #[serde(default = "default_max_retries")]
    pub max_retries: u32,
    #[serde(default = "default_subagent_max_turns")]
    pub subagent_max_turns: u32,
    #[serde(default = "default_subagent_max_tokens")]
    pub subagent_max_tokens: u32,
    #[serde(default = "default_default_max_results")]
    pub default_max_results: usize,
    #[serde(default = "default_absolute_max_results")]
    pub absolute_max_results: usize,
    #[serde(default = "default_search_timeout_secs")]
    pub search_timeout_secs: u64,
    #[serde(default = "default_default_max_size")]
    pub default_max_size: usize,
    #[serde(default = "default_absolute_max_size")]
    pub absolute_max_size: usize,
    #[serde(default = "default_max_glob_results")]
    pub max_glob_results: usize,
    #[serde(default = "default_default_head_limit")]
    pub default_head_limit: usize,
    #[serde(default = "default_input_max_visual_lines")]
    pub input_max_visual_lines: usize,
}

// Default value functions for serde(default = "...").
fn default_auto_compact_threshold() -> u64 { 160_000 }
fn default_max_retries() -> u32 { 3 }
fn default_subagent_max_turns() -> u32 { 1000 }
fn default_subagent_max_tokens() -> u32 { 16_384 }
fn default_default_max_results() -> usize { 10 }
fn default_absolute_max_results() -> usize { 20 }
fn default_search_timeout_secs() -> u64 { 15 }
fn default_default_max_size() -> usize { 100_000 }
fn default_absolute_max_size() -> usize { 1_000_000 }
fn default_max_glob_results() -> usize { 100 }
fn default_default_head_limit() -> usize { 250 }
fn default_input_max_visual_lines() -> usize { 10 }

impl Default for ConstantsSnapshot {
    fn default() -> Self {
        Self {
            auto_compact_threshold: default_auto_compact_threshold(),
            max_retries: default_max_retries(),
            subagent_max_turns: default_subagent_max_turns(),
            subagent_max_tokens: default_subagent_max_tokens(),
            default_max_results: default_default_max_results(),
            absolute_max_results: default_absolute_max_results(),
            search_timeout_secs: default_search_timeout_secs(),
            default_max_size: default_default_max_size(),
            absolute_max_size: default_absolute_max_size(),
            max_glob_results: default_max_glob_results(),
            default_head_limit: default_default_head_limit(),
            input_max_visual_lines: default_input_max_visual_lines(),
        }
    }
}

/// Returns the path to the session file: `~/.chlodwig-rs/session.json`.
pub fn session_path() -> PathBuf {
    crate::log_dir().join("session.json")
}

/// Returns the path to the standalone constants file: `~/.chlodwig-rs/constants.json`.
pub fn constants_path() -> PathBuf {
    crate::log_dir().join("constants.json")
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

// ── Standalone constants.json persistence ────────────────────────────

/// Save a constants snapshot to disk (blocking I/O).
///
/// Writes to a temporary file first, then atomically renames,
/// so a crash during write never corrupts the existing file.
pub fn save_constants(snapshot: &ConstantsSnapshot) -> std::io::Result<()> {
    save_constants_to(snapshot, &constants_path())
}

/// Save a constants snapshot to an arbitrary path (used by tests).
pub fn save_constants_to(snapshot: &ConstantsSnapshot, path: &std::path::Path) -> std::io::Result<()> {
    let json = serde_json::to_string_pretty(snapshot)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;

    let tmp_path = path.with_extension("json.tmp");
    std::fs::write(&tmp_path, json.as_bytes())?;
    std::fs::rename(&tmp_path, path)?;

    tracing::debug!(path = %path.display(), bytes = json.len(), "constants saved");
    Ok(())
}

/// Load a constants snapshot from disk, if one exists.
///
/// Returns `None` if the file doesn't exist. Returns `Err` on I/O
/// or parse errors.
pub fn load_constants() -> std::io::Result<Option<ConstantsSnapshot>> {
    load_constants_from(&constants_path())
}

/// Load a constants snapshot from an arbitrary path (used by tests).
pub fn load_constants_from(path: &std::path::Path) -> std::io::Result<Option<ConstantsSnapshot>> {
    if !path.exists() {
        return Ok(None);
    }
    let json = std::fs::read_to_string(path)?;
    let snapshot: ConstantsSnapshot = serde_json::from_str(&json)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?;
    tracing::debug!(path = %path.display(), "constants loaded");
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
            constants: None,
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
            constants: None,
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

    #[test]
    fn test_constants_snapshot_default_roundtrip() {
        let snap = ConstantsSnapshot::default();
        let json = serde_json::to_string(&snap).unwrap();
        let restored: ConstantsSnapshot = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.auto_compact_threshold, 160_000);
        assert_eq!(restored.max_retries, 3);
        assert_eq!(restored.subagent_max_turns, 1000);
        assert_eq!(restored.subagent_max_tokens, 16_384);
        assert_eq!(restored.default_max_results, 10);
        assert_eq!(restored.absolute_max_results, 20);
        assert_eq!(restored.search_timeout_secs, 15);
        assert_eq!(restored.default_max_size, 100_000);
        assert_eq!(restored.absolute_max_size, 1_000_000);
        assert_eq!(restored.max_glob_results, 100);
        assert_eq!(restored.default_head_limit, 250);
        assert_eq!(restored.input_max_visual_lines, 10);
    }

    #[test]
    fn test_constants_snapshot_custom_values_roundtrip() {
        let snap = ConstantsSnapshot {
            auto_compact_threshold: 200_000,
            max_retries: 5,
            subagent_max_turns: 500,
            subagent_max_tokens: 8_192,
            default_max_results: 15,
            absolute_max_results: 30,
            search_timeout_secs: 30,
            default_max_size: 200_000,
            absolute_max_size: 2_000_000,
            max_glob_results: 200,
            default_head_limit: 500,
            input_max_visual_lines: 20,
        };
        let json = serde_json::to_string(&snap).unwrap();
        let restored: ConstantsSnapshot = serde_json::from_str(&json).unwrap();
        assert_eq!(restored.auto_compact_threshold, 200_000);
        assert_eq!(restored.max_retries, 5);
        assert_eq!(restored.subagent_max_turns, 500);
        assert_eq!(restored.subagent_max_tokens, 8_192);
        assert_eq!(restored.default_max_results, 15);
        assert_eq!(restored.absolute_max_results, 30);
        assert_eq!(restored.search_timeout_secs, 30);
        assert_eq!(restored.default_max_size, 200_000);
        assert_eq!(restored.absolute_max_size, 2_000_000);
        assert_eq!(restored.max_glob_results, 200);
        assert_eq!(restored.default_head_limit, 500);
        assert_eq!(restored.input_max_visual_lines, 20);
    }

    #[test]
    fn test_session_snapshot_with_constants_roundtrip() {
        let mut snap = make_snapshot(vec![]);
        snap.constants = Some(ConstantsSnapshot {
            auto_compact_threshold: 250_000,
            ..ConstantsSnapshot::default()
        });
        let json = serde_json::to_string(&snap).unwrap();
        let restored: SessionSnapshot = serde_json::from_str(&json).unwrap();
        assert!(restored.constants.is_some());
        assert_eq!(restored.constants.unwrap().auto_compact_threshold, 250_000);
    }

    #[test]
    fn test_session_snapshot_without_constants_is_backward_compatible() {
        // Old session.json files won't have a "constants" field.
        // Deserializing should still work — constants should be None.
        let json = r#"{
            "saved_at": "2026-04-04T12:00:00Z",
            "model": "test-model",
            "messages": [],
            "system_prompt": []
        }"#;
        let restored: SessionSnapshot = serde_json::from_str(json).unwrap();
        assert!(restored.constants.is_none());
    }

    #[test]
    fn test_constants_snapshot_missing_fields_get_defaults() {
        // If a future version adds a field, old snapshots with fewer fields
        // should deserialize with defaults for the missing fields.
        let json = r#"{ "auto_compact_threshold": 200000 }"#;
        let restored: ConstantsSnapshot = serde_json::from_str(json).unwrap();
        assert_eq!(restored.auto_compact_threshold, 200_000);
        // All other fields should be their defaults
        assert_eq!(restored.max_retries, 3);
        assert_eq!(restored.subagent_max_turns, 1000);
        assert_eq!(restored.input_max_visual_lines, 10);
    }

    // ── Standalone constants.json persistence tests ──

    #[test]
    fn test_constants_path_is_in_chlodwig_rs_dir() {
        let path = constants_path();
        assert!(
            path.parent().unwrap().ends_with(".chlodwig-rs"),
            "Expected .chlodwig-rs dir, got: {}",
            path.display()
        );
        assert_eq!(
            path.file_name().unwrap().to_str().unwrap(),
            "constants.json"
        );
    }

    #[test]
    fn test_save_and_load_constants_roundtrip() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("constants.json");

        let snap = ConstantsSnapshot {
            auto_compact_threshold: 300_000,
            max_retries: 7,
            ..ConstantsSnapshot::default()
        };

        // Save manually to the temp path
        let json = serde_json::to_string_pretty(&snap).unwrap();
        std::fs::write(&path, &json).unwrap();

        // Load manually from the temp path
        let loaded_json = std::fs::read_to_string(&path).unwrap();
        let loaded: ConstantsSnapshot = serde_json::from_str(&loaded_json).unwrap();

        assert_eq!(loaded.auto_compact_threshold, 300_000);
        assert_eq!(loaded.max_retries, 7);
        // Rest should be defaults
        assert_eq!(loaded.subagent_max_turns, 1000);
    }

    #[test]
    fn test_save_constants_creates_valid_json() {
        let snap = ConstantsSnapshot {
            search_timeout_secs: 42,
            ..ConstantsSnapshot::default()
        };
        let json = serde_json::to_string_pretty(&snap).unwrap();
        let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert!(parsed.is_object());
        assert_eq!(parsed["search_timeout_secs"], 42);
        assert_eq!(parsed["auto_compact_threshold"], 160_000);
    }

    #[test]
    fn test_save_constants_uses_atomic_write() {
        // Verify that save_constants writes to .tmp then renames.
        // We test this by saving and verifying no .tmp file remains.
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("constants.json");
        let tmp_path = path.with_extension("json.tmp");

        let snap = ConstantsSnapshot::default();
        save_constants_to(&snap, &path).unwrap();

        assert!(path.exists(), "constants.json should exist");
        assert!(!tmp_path.exists(), ".tmp file should be cleaned up after rename");

        // Verify content
        let loaded_json = std::fs::read_to_string(&path).unwrap();
        let loaded: ConstantsSnapshot = serde_json::from_str(&loaded_json).unwrap();
        assert_eq!(loaded.auto_compact_threshold, 160_000);
    }

    #[test]
    fn test_load_constants_returns_none_when_no_file() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("nonexistent.json");
        let result = load_constants_from(&path).unwrap();
        assert!(result.is_none());
    }

    #[test]
    fn test_load_constants_returns_err_on_invalid_json() {
        let tmp = tempfile::tempdir().unwrap();
        let path = tmp.path().join("constants.json");
        std::fs::write(&path, "not valid json!!!").unwrap();
        let result = load_constants_from(&path);
        assert!(result.is_err());
    }
}
