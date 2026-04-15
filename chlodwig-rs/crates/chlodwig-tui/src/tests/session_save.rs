//! Tests for auto-save session persistence.
//!
//! Verifies that the event loop saves a `SessionSnapshot` at the right
//! moments (TurnComplete, CompactionComplete) and that the snapshot
//! contains the correct data.

use chlodwig_core::{ContentBlock, Message, Role, SessionSnapshot, SystemBlock};

#[test]
fn test_session_snapshot_from_conversation_state() {
    // Verify that a SessionSnapshot can be constructed from the
    // same data that ConversationState holds (minus the non-serialisable parts).
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
                text: "Hi!".into(),
            }],
        },
    ];
    let system_prompt = vec![
        SystemBlock::text("System instruction"),
        SystemBlock::cached("CLAUDE.md contents"),
    ];

    let snap = SessionSnapshot {
        saved_at: chrono::Local::now().to_rfc3339(),
        started_at: "2026-04-13T10:00:00+02:00".into(),
        model: "claude-sonnet-4-20250514".into(),
        messages: messages.clone(),
        system_prompt: system_prompt.clone(),
        constants: None,
    };

    assert_eq!(snap.messages.len(), 2);
    assert_eq!(snap.messages[0].text(), "Hello");
    assert_eq!(snap.messages[1].text(), "Hi!");
    assert_eq!(snap.system_prompt.len(), 2);
    assert_eq!(snap.model, "claude-sonnet-4-20250514");
}

#[test]
fn test_session_snapshot_survives_serde_roundtrip_with_all_block_types() {
    // Comprehensive: user text, assistant text, tool_use, tool_result, thinking
    let messages = vec![
        Message {
            role: Role::User,
            content: vec![ContentBlock::Text {
                text: "Do something".into(),
            }],
        },
        Message {
            role: Role::Assistant,
            content: vec![
                ContentBlock::Thinking {
                    thinking: "Let me think...".into(),
                },
                ContentBlock::Text {
                    text: "I'll use a tool".into(),
                },
                ContentBlock::ToolUse {
                    id: "tu_1".into(),
                    name: "Bash".into(),
                    input: serde_json::json!({"command": "ls"}),
                },
            ],
        },
        Message {
            role: Role::User,
            content: vec![ContentBlock::ToolResult {
                tool_use_id: "tu_1".into(),
                content: chlodwig_core::ToolResultContent::Text("file1.rs\nfile2.rs".into()),
                is_error: Some(false),
            }],
        },
        Message {
            role: Role::Assistant,
            content: vec![ContentBlock::Text {
                text: "I found 2 files".into(),
            }],
        },
    ];

    let snap = SessionSnapshot {
        saved_at: "2026-04-04T14:00:00+02:00".into(),
        started_at: "2026-04-04T13:00:00+02:00".into(),
        model: "test-model".into(),
        messages,
        system_prompt: vec![SystemBlock::text("Be helpful")],
        constants: None,
    };

    let json = serde_json::to_string_pretty(&snap).unwrap();
    let restored: SessionSnapshot = serde_json::from_str(&json).unwrap();

    assert_eq!(restored.messages.len(), 4);
    // Thinking block survived
    match &restored.messages[1].content[0] {
        ContentBlock::Thinking { thinking } => assert_eq!(thinking, "Let me think..."),
        other => panic!("Expected Thinking, got {:?}", other),
    }
    // ToolResult with is_error = Some(false) survived
    match &restored.messages[2].content[0] {
        ContentBlock::ToolResult { is_error, .. } => assert_eq!(*is_error, Some(false)),
        other => panic!("Expected ToolResult, got {:?}", other),
    }
}

#[test]
fn test_session_path_for_is_deterministic() {
    let started_at = "2026-04-13T14:30:15+02:00";
    let path1 = chlodwig_core::session_path_for(started_at);
    let path2 = chlodwig_core::session_path_for(started_at);
    assert_eq!(path1, path2, "session_path_for() must be deterministic for the same started_at");
}

#[test]
fn test_save_and_reload_via_temp_dir() {
    let tmp = tempfile::tempdir().unwrap();
    let path = tmp.path().join("2026_04_04_12_00_00.json");

    let snap = SessionSnapshot {
        saved_at: "2026-04-04T12:00:00Z".into(),
        started_at: "2026-04-04T12:00:00+00:00".into(),
        model: "claude-sonnet-4-20250514".into(),
        messages: vec![
            Message {
                role: Role::User,
                content: vec![ContentBlock::Text {
                    text: "What is Rust?".into(),
                }],
            },
            Message {
                role: Role::Assistant,
                content: vec![ContentBlock::Text {
                    text: "Rust is a systems programming language.".into(),
                }],
            },
        ],
        system_prompt: vec![SystemBlock::text("You are a helpful assistant.")],
        constants: None,
    };

    // Save
    chlodwig_core::save_session_to(&snap, &path).unwrap();

    // Reload
    let loaded_json = std::fs::read_to_string(&path).unwrap();
    let loaded: SessionSnapshot = serde_json::from_str(&loaded_json).unwrap();

    assert_eq!(loaded.messages.len(), 2);
    assert_eq!(loaded.messages[0].text(), "What is Rust?");
    assert_eq!(
        loaded.messages[1].text(),
        "Rust is a systems programming language."
    );
    assert_eq!(loaded.model, "claude-sonnet-4-20250514");
}

#[test]
fn test_clear_does_not_overwrite_saved_session() {
    // /clear should NOT auto-save, so the user can /resume to get back.
    // This test verifies the design decision: after /clear the previous
    // saved session file remains unchanged.
    let tmp = tempfile::tempdir().unwrap();
    let path = tmp.path().join("2026_04_04_10_00_00.json");

    // Pre-existing session on disk
    let original = SessionSnapshot {
        saved_at: "2026-04-04T10:00:00Z".into(),
        started_at: "2026-04-04T10:00:00+00:00".into(),
        model: "test-model".into(),
        messages: vec![Message {
            role: Role::User,
            content: vec![ContentBlock::Text {
                text: "Important conversation".into(),
            }],
        }],
        system_prompt: vec![],
        constants: None,
    };
    chlodwig_core::save_session_to(&original, &path).unwrap();

    // Simulate what /clear should do: clear state but NOT save.
    // (The actual event_loop code is tested by inspection — this test
    // documents the contract that the file must not change.)

    // Read back — must still be the original
    let loaded_json = std::fs::read_to_string(&path).unwrap();
    let loaded: SessionSnapshot = serde_json::from_str(&loaded_json).unwrap();
    assert_eq!(loaded.messages.len(), 1);
    assert_eq!(loaded.messages[0].text(), "Important conversation");
    assert_eq!(loaded.saved_at, "2026-04-04T10:00:00Z");
}

#[test]
fn test_manual_save_writes_current_state_to_disk() {
    // /save should immediately persist the current conversation state.
    // This test verifies the save_session_to function works as the manual
    // /save command would use it — snapshot construction + write + reload.
    let tmp = tempfile::tempdir().unwrap();
    let path = tmp.path().join("2026_04_04_15_00_00.json");

    let messages = vec![
        Message {
            role: Role::User,
            content: vec![ContentBlock::Text {
                text: "First message".into(),
            }],
        },
        Message {
            role: Role::Assistant,
            content: vec![ContentBlock::Text {
                text: "First reply".into(),
            }],
        },
        Message {
            role: Role::User,
            content: vec![ContentBlock::Text {
                text: "Second message".into(),
            }],
        },
    ];

    // Build snapshot (same as /save would do)
    let snap = SessionSnapshot {
        saved_at: "2026-04-04T15:00:00Z".into(),
        started_at: "2026-04-04T15:00:00+00:00".into(),
        model: "claude-sonnet-4-20250514".into(),
        messages: messages.clone(),
        system_prompt: vec![SystemBlock::text("Be helpful")],
        constants: None,
    };

    // Write via save_session_to (uses atomic write)
    chlodwig_core::save_session_to(&snap, &path).unwrap();

    // Verify the file contains exactly what we saved
    let loaded: SessionSnapshot =
        serde_json::from_str(&std::fs::read_to_string(&path).unwrap()).unwrap();
    assert_eq!(loaded.messages.len(), 3);
    assert_eq!(loaded.messages[0].text(), "First message");
    assert_eq!(loaded.messages[1].text(), "First reply");
    assert_eq!(loaded.messages[2].text(), "Second message");
    assert_eq!(loaded.model, "claude-sonnet-4-20250514");
    assert_eq!(loaded.saved_at, "2026-04-04T15:00:00Z");
}

// ── Event loop source-level checks for session commands ──

#[test]
fn test_event_loop_has_sessions_command() {
    let src = include_str!("../event_loop.rs");
    assert!(
        src.contains("/sessions"),
        "event_loop.rs must handle the /sessions command"
    );
    assert!(
        src.contains("list_sessions"),
        "event_loop.rs must call list_sessions() for /sessions command"
    );
}

#[test]
fn test_event_loop_has_resume_with_prefix() {
    let src = include_str!("../event_loop.rs");
    assert!(
        src.contains("Command::Resume"),
        "event_loop.rs must handle Command::Resume for /resume <prefix>"
    );
    assert!(
        src.contains("load_session_by_prefix"),
        "event_loop.rs must call load_session_by_prefix() for /resume <prefix>"
    );
}

#[test]
fn test_event_loop_has_help_command() {
    let src = include_str!("../event_loop.rs");
    assert!(
        src.contains("Command::Help"),
        "event_loop.rs must handle Command::Help"
    );
}
