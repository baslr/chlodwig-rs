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
    // Read result → ToolResult with tool_name="Read" and the raw content
    // (the "Read: /tmp/test.rs" header is now produced by render_block at
    // render time, NOT pre-baked into the output string).
    match &state.blocks[1] {
        DisplayBlock::ToolResult {
            output,
            is_error,
            tool_name,
            tool_input,
        } => {
            assert!(!is_error);
            assert_eq!(tool_name, "Read");
            assert_eq!(tool_input["file_path"], "/tmp/test.rs");
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
        DisplayBlock::ToolResult {
            output,
            is_error,
            tool_name,
            tool_input,
        } => {
            assert!(!is_error);
            assert_eq!(tool_name, "Bash");
            assert_eq!(tool_input["command"], "echo hi");
            assert!(output.contains("hi"), "Should contain raw output, got: {output}");
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
        DisplayBlock::ToolResult { output, is_error, .. } => {
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

// ── apply_session_snapshot tests ──────────────────────────────────────
//
// These cover the unified restore-from-snapshot helper that all three
// resume paths (--resume, /resume, sessions browser) now share.

fn build_test_snapshot(
    messages: Vec<Message>,
    name: Option<String>,
    table_sorts: Vec<chlodwig_core::TableSortState>,
) -> chlodwig_core::SessionSnapshot {
    chlodwig_core::SessionSnapshot {
        saved_at: "2026-04-18T10:00:00+02:00".into(),
        started_at: "2026-04-18T09:00:00+02:00".into(),
        model: "test-model".into(),
        messages,
        system_prompt: vec![],
        constants: None,
        table_sorts,
        name,
        stats: None,
    }
}

#[test]
fn test_apply_snapshot_clears_previous_state_then_restores() {
    let mut state = AppState::new("old-model".into());
    // Pre-populate state with garbage that must be wiped.
    state.blocks.push(DisplayBlock::UserMessage("OLD".into()));
    state.session_name = Some("old-name".into());
    state.turn_count = 7;
    state.input_tokens = 42;

    let snap = build_test_snapshot(
        vec![user_msg("new"), assistant_msg("hi")],
        Some("fresh-name".into()),
        vec![],
    );
    state.apply_session_snapshot(&snap);

    // Old blocks gone, new blocks in.
    assert_eq!(state.blocks.len(), 2);
    assert!(matches!(&state.blocks[0], DisplayBlock::UserMessage(t) if t == "new"));
    assert!(matches!(&state.blocks[1], DisplayBlock::AssistantText(t) if t == "hi"));
    // Counters reset by clear().
    assert_eq!(state.turn_count, 0);
    assert_eq!(state.input_tokens, 0);
    // Name set from snapshot.
    assert_eq!(state.session_name.as_deref(), Some("fresh-name"));
}

#[test]
fn test_apply_snapshot_with_no_name_clears_previous_name() {
    let mut state = AppState::new("m".into());
    state.session_name = Some("leftover".into());

    let snap = build_test_snapshot(vec![user_msg("x")], None, vec![]);
    state.apply_session_snapshot(&snap);

    assert!(state.session_name.is_none(), "name must be cleared when snapshot has no name");
}

#[test]
fn test_apply_snapshot_applies_table_sorts() {
    use chlodwig_core::TableSortState;
    let mut state = AppState::new("m".into());

    // Snapshot with one assistant message containing a markdown table,
    // plus a sort state for column 1 descending.
    let table_md = "| Name | Age |\n|------|-----|\n| Bob  | 30  |\n| Ann  | 25  |\n";
    let snap = build_test_snapshot(
        vec![assistant_msg(table_md)],
        None,
        vec![TableSortState {
            block_index: 0,
            table_index: 0,
            sort_column: 1,
            sort_descending: true,
        }],
    );
    state.apply_session_snapshot(&snap);

    // The table must be extracted and the sort state applied.
    assert_eq!(state.tables.len(), 1, "one table should be extracted");
    let (_bi, _ti, td) = &state.tables[0];
    assert_eq!(td.sort_column, Some(1));
    assert!(td.sort_descending);
}

/// End-to-end regression: real on-disk session JSON with a name set must,
/// after `load_session_from()` + `apply_session_snapshot()`, leave
/// `state.session_name` equal to the name in the file.
///
/// This is the exact path used by:
/// - GTK menu → Sessions Window → click "Resume" (`menu.rs:160`)
/// - GTK `/resume <prefix>` (`submit.rs:188`)
/// - GTK `--resume` flag (`main.rs:222`)
///
/// All three call `restore::apply_restored_session_to_ui()`, which calls
/// `state.apply_session_snapshot(&snapshot)`. So this single test covers
/// the central name-propagation invariant for ALL GTK resume paths.
#[test]
fn test_load_session_from_disk_then_apply_preserves_name() {
    use chlodwig_core::SessionSnapshot;
    let tmp = tempfile::tempdir().unwrap();
    let path = tmp.path().join("session.json");

    let snap = SessionSnapshot {
        saved_at: "2026-04-20T03:00:00+02:00".into(),
        started_at: "2026-04-18T22:49:33+02:00".into(),
        model: "test".into(),
        messages: vec![user_msg("hi")],
        system_prompt: vec![],
        name: Some("work on chlodwig".into()),
        table_sorts: vec![],
        constants: None,
        stats: None,
    };
    let json = serde_json::to_string_pretty(&snap).unwrap();
    std::fs::write(&path, json).unwrap();

    // The exact same call the menu / submit / main resume paths make:
    let loaded = chlodwig_core::load_session_from(&path).unwrap();
    let mut state = AppState::new("other-model".into());
    state.apply_session_snapshot(&loaded);

    assert_eq!(
        state.session_name.as_deref(),
        Some("work on chlodwig"),
        "session_name must be propagated from disk → loaded snapshot → AppState"
    );
}

#[test]
fn test_apply_snapshot_empty_messages() {
    let mut state = AppState::new("m".into());
    state.blocks.push(DisplayBlock::UserMessage("OLD".into()));

    let snap = build_test_snapshot(vec![], None, vec![]);
    state.apply_session_snapshot(&snap);

    assert!(state.blocks.is_empty());
    assert!(state.session_name.is_none());
}
