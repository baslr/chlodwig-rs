//! Source-grep regression tests for the `/cwd` command in GTK.
//!
//! Behavior is split across:
//! - `chlodwig-core::command` (parser + `resolve_cwd_arg`) — covered by
//!   that crate's unit tests.
//! - `chlodwig-gtk/src/submit.rs` — the UI-thread arm that mutates
//!   `AppState.cwd` and sends `BackgroundCommand::SetCwd`.
//! - `chlodwig-gtk/src/tab/ai_conversation.rs` — the background task
//!   that handles `SetCwd` by rebuilding `tool_context` and `system_prompt`.
//!
//! These guards ensure none of those wires gets accidentally cut by a
//! refactor (cf. CLAUDE.md gotcha #57: silent button drops).

const SUBMIT_SRC: &str = include_str!("../submit.rs");
const TAB_SRC: &str = include_str!("../tab/ai_conversation.rs");

#[test]
fn test_background_command_has_set_cwd_variant() {
    // SetCwd is the single sync point UI → background that propagates
    // a runtime cwd change to ToolContext and system_prompt.
    assert!(
        TAB_SRC.contains("SetCwd"),
        "BackgroundCommand enum in tab/ai_conversation.rs must define SetCwd"
    );
}

#[test]
fn test_background_set_cwd_rebuilds_tool_context() {
    assert!(
        TAB_SRC.contains("tool_context.working_directory"),
        "BackgroundCommand::SetCwd handler must update \
         conv_state.tool_context.working_directory"
    );
}

#[test]
fn test_background_set_cwd_rebuilds_system_prompt() {
    // After cwd changes, the next API call must include the new cwd
    // in the system prompt ("Current working directory: …").
    assert!(
        TAB_SRC.contains("BackgroundCommand::SetCwd")
            && TAB_SRC.contains("build_system_prompt"),
        "BackgroundCommand::SetCwd handler must rebuild system_prompt \
         via chlodwig_core::build_system_prompt"
    );
}

#[test]
fn test_submit_handles_command_cwd_show() {
    // The None arm displays the current cwd in a system message.
    assert!(
        SUBMIT_SRC.contains("Command::Cwd"),
        "submit.rs must have a Command::Cwd match arm"
    );
    assert!(
        SUBMIT_SRC.contains("Current directory")
            || SUBMIT_SRC.contains("cwd:"),
        "submit.rs Command::Cwd(None) arm must show the current cwd to the user"
    );
}

#[test]
fn test_submit_handles_command_cwd_change_calls_resolver() {
    assert!(
        SUBMIT_SRC.contains("resolve_cwd_arg"),
        "submit.rs Command::Cwd(Some(_)) arm must call \
         chlodwig_core::command::resolve_cwd_arg"
    );
}

#[test]
fn test_submit_cwd_change_mutates_app_state_cwd() {
    // After a successful resolve, AppState.cwd MUST be updated so the
    // next `! pwd` runs in the new dir (and so `/cwd` without arg
    // shows the new value).
    assert!(
        SUBMIT_SRC.contains(".cwd = new_cwd"),
        "submit.rs must assign the resolved path to state.cwd"
    );
}

#[test]
fn test_submit_cwd_change_sends_setcwd_to_background() {
    // The UI thread mutation alone is not enough: the background task
    // owns ConversationState.tool_context.working_directory, which
    // tools read for relative-path resolution. Without the SetCwd
    // message, the next tool call would still use the old cwd.
    assert!(
        SUBMIT_SRC.contains("BackgroundCommand::SetCwd"),
        "submit.rs must send BackgroundCommand::SetCwd {{ new_cwd }} \
         to the background task after mutating AppState.cwd"
    );
}

#[test]
fn test_submit_cwd_does_not_call_set_current_dir() {
    // Same hard rule as TUI: process cwd is never mutated, otherwise
    // sibling tabs in the same process get poisoned.
    assert!(
        !SUBMIT_SRC.contains("set_current_dir"),
        "submit.rs MUST NOT call std::env::set_current_dir — \
         /cwd only mutates per-tab state"
    );
}

#[test]
fn test_submit_cwd_change_refreshes_tab_title() {
    // After /cwd changes the directory, the tab title must update
    // to show the new directory name (same pattern as /name).
    assert!(
        SUBMIT_SRC.contains("refresh_tab_title"),
        "submit.rs Command::Cwd success arm must call refresh_tab_title \
         so the tab shows the new directory name"
    );
}

#[test]
fn test_ai_conversation_tab_cwd_reads_from_app_state() {
    // The AiConversationTab must NOT have its own `pub cwd: PathBuf`
    // field — cwd is read from AppState.cwd (single source of truth).
    // If the field existed, /cwd would need to update TWO places.
    assert!(
        !TAB_SRC.contains("pub cwd: std::path::PathBuf"),
        "AiConversationTab must NOT have a `pub cwd` field — \
         cwd is read from AppState.cwd (SSoT)"
    );
    // The cwd() method must delegate to app_state.
    assert!(
        TAB_SRC.contains("app_state.borrow().cwd"),
        "AiConversationTab::cwd() must read from app_state.borrow().cwd"
    );
}
