//! Regression tests for the `/cwd` command in the TUI event loop.
//!
//! These are source-grep guards: the actual end-to-end behavior (input
//! → command parse → cwd mutation → next `! pwd` runs in new cwd) is
//! covered by `chlodwig_core::command` tests for the parse + resolve
//! halves; here we only assert that the TUI event loop wires the
//! resolved cwd onto `app.cwd`.

const EVENT_LOOP_SRC: &str = include_str!("../event_loop.rs");

#[test]
fn test_event_loop_handles_command_cwd() {
    assert!(
        EVENT_LOOP_SRC.contains("Command::Cwd"),
        "event_loop.rs must have a match arm for Command::Cwd"
    );
}

#[test]
fn test_event_loop_cwd_show_arm_renders_app_cwd() {
    // The `None` arm must read `app.cwd` (not the process cwd) so
    // `/cwd` reports the per-app value.
    assert!(
        EVENT_LOOP_SRC.contains("app.cwd.display()"),
        "event_loop.rs `Command::Cwd(None)` arm must render app.cwd, not the process cwd"
    );
}

#[test]
fn test_event_loop_cwd_change_arm_calls_resolver() {
    assert!(
        EVENT_LOOP_SRC.contains("resolve_cwd_arg"),
        "event_loop.rs must call chlodwig_core::command::resolve_cwd_arg \
         to resolve the `/cwd <path>` argument"
    );
}

#[test]
fn test_event_loop_cwd_change_arm_mutates_app_cwd() {
    // The Ok branch of resolve_cwd_arg must assign the new value back.
    // We can't write a regex easily here; the substring `app.cwd =`
    // is unique enough since no other code in event_loop.rs reassigns
    // app.cwd at runtime.
    assert!(
        EVENT_LOOP_SRC.contains("app.cwd ="),
        "event_loop.rs must mutate app.cwd on successful /cwd change"
    );
}

#[test]
fn test_event_loop_cwd_change_syncs_tool_context() {
    assert!(
        EVENT_LOOP_SRC.contains("tool_context.working_directory"),
        "event_loop.rs must update ConversationState.tool_context.working_directory \
         so tools run in the new cwd"
    );
}

#[test]
fn test_event_loop_cwd_change_rebuilds_system_prompt() {
    assert!(
        EVENT_LOOP_SRC.contains("build_system_prompt"),
        "event_loop.rs must rebuild system_prompt so the LLM sees the new cwd"
    );
}

#[test]
fn test_event_loop_cwd_does_not_call_set_current_dir() {
    // Hard rule: never mutate the process cwd. Other tabs/apps would
    // be poisoned (multi-window architecture; see Stage-0 cwd refactor).
    // Search the entire event_loop.rs to be safe.
    assert!(
        !EVENT_LOOP_SRC.contains("set_current_dir"),
        "event_loop.rs MUST NOT call std::env::set_current_dir — \
         /cwd only mutates per-app state"
    );
}

#[test]
fn test_event_loop_resume_validates_cwd_with_resolve_snapshot_cwd() {
    assert!(
        EVENT_LOOP_SRC.contains("resolve_snapshot_cwd"),
        "event_loop.rs /resume must call resolve_snapshot_cwd to validate \
         the saved cwd still exists and show a warning if not"
    );
}

#[test]
fn test_event_loop_resume_shows_cwd_restore_feedback() {
    assert!(
        EVENT_LOOP_SRC.contains("Restored directory:"),
        "event_loop.rs /resume must show the restored directory to the user"
    );
}
