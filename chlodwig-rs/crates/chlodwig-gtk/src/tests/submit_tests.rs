//! Tests for the submit handler wiring.
//!
//! Stage 3 of the GTK main.rs refactor (see docs/gtk-main-refactoring.md).
//! The ~286-line submit closure (input parsing, command dispatch, prompt
//! send), the Send-button click handler, and the Cmd/Ctrl+Return key
//! shortcut all live in `submit.rs`. `main.rs` only calls
//! `submit::wire(SubmitContext { ... })`.

#[test]
fn test_submit_module_exists() {
    let src = include_str!("../submit.rs");
    assert!(
        src.contains("pub fn wire"),
        "submit.rs must export a wire() function"
    );
}

#[test]
fn test_submit_module_defines_context_struct() {
    let src = include_str!("../submit.rs");
    assert!(
        src.contains("pub struct SubmitContext"),
        "submit.rs must define a SubmitContext struct (8+ captures need bundling)"
    );
}

#[test]
fn test_main_rs_calls_submit_wire() {
    // Stage B: per-tab wiring moved from main.rs to tab.rs (called from
    // tab::attach_new_tab so every tab gets its own send button).
    let src = include_str!("../tab.rs");
    assert!(
        src.contains("submit::wire"),
        "tab.rs (per-tab wiring SSoT) must delegate to submit::wire"
    );
}

#[test]
fn test_main_rs_declares_submit_module() {
    let src = include_str!("../main.rs");
    assert!(
        src.contains("mod submit;"),
        "main.rs must declare `mod submit;`"
    );
}

#[test]
fn test_main_rs_no_inline_submit_closure() {
    let src = include_str!("../main.rs");
    assert!(
        !src.contains("// --- Wire up Send button ---"),
        "main.rs must not contain the inline 'Wire up Send button' comment — moved to submit.rs"
    );
    // The submit closure pattern: `let submit = move || {`
    assert!(
        !src.contains("let submit = move ||"),
        "main.rs must not define the submit closure inline — moved to submit.rs"
    );
}

#[test]
fn test_submit_handles_all_commands() {
    let src = include_str!("../submit.rs");
    // Each command branch must be present in submit.rs
    for cmd in &[
        "Command::Clear",
        "Command::Help",
        "Command::Shell",
        "Command::Quit",
        "Command::Compact",
        "Command::Sessions",
        "Command::Resume",
        "Command::Name",
        "Command::Save",
    ] {
        assert!(
            src.contains(cmd),
            "submit.rs must handle {cmd}"
        );
    }
}

#[test]
fn test_submit_wires_send_button_click() {
    let src = include_str!("../submit.rs");
    assert!(
        src.contains("send_button") && src.contains("connect_clicked"),
        "submit.rs must wire the Send button click handler"
    );
}

#[test]
fn test_submit_wires_cmd_return_shortcut() {
    let src = include_str!("../submit.rs");
    assert!(
        src.contains("META_MASK") && src.contains("Return"),
        "submit.rs must wire the Cmd/Ctrl+Return shortcut for the input view"
    );
}

#[test]
fn test_submit_sends_prompt_via_background_command() {
    let src = include_str!("../submit.rs");
    assert!(
        src.contains("BackgroundCommand::Prompt"),
        "submit.rs must send BackgroundCommand::Prompt for non-command input"
    );
}

#[test]
fn test_submit_forces_auto_scroll_on_user_action() {
    let src = include_str!("../submit.rs");
    assert!(
        src.contains("auto_scroll.scroll_to_bottom()"),
        "submit.rs must force auto-scroll on (explicit user action) when sending a prompt"
    );
}
