//! User command parsing — shared between TUI and GTK.
//!
//! Intercepts user input before sending it to the API.
//! Commands start with `/`, `!`, or are bare keywords like `exit`.

/// A parsed user command.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Command {
    /// `/clear`, `/reset`, `/new` — clear conversation.
    Clear,
    /// `/help`, `/?`, `/h`, `help` — show help text.
    Help,
    /// `! <cmd>` — execute shell command.
    Shell(String),
    /// `exit`, `quit`, `/exit`, `/quit` — quit the application.
    Quit,
    /// `/compact` or `/compact <instructions>` — compact conversation.
    Compact(Option<String>),
    /// `/sessions` — list saved sessions.
    Sessions,
    /// `/resume` or `/resume <prefix>` — resume a saved session.
    Resume(Option<String>),
    /// `/save` — manually save the current session.
    Save,
}

impl Command {
    /// Parse user input into a command, or `None` if it's a regular prompt.
    ///
    /// Case-insensitive for command names. Shell commands (`! <cmd>`)
    /// preserve the original case of the command string.
    pub fn parse(input: &str) -> Option<Command> {
        let trimmed = input.trim();
        if trimmed.is_empty() {
            return None;
        }

        // Shell command: "! <cmd>" or "!<cmd>"
        if trimmed.starts_with('!') {
            let cmd = trimmed[1..].trim();
            if cmd.is_empty() {
                return None; // bare "!" is not a command
            }
            return Some(Command::Shell(cmd.to_string()));
        }

        let lower = trimmed.to_lowercase();

        // /compact with optional instructions
        if lower == "/compact" {
            return Some(Command::Compact(None));
        }
        if lower.starts_with("/compact ") {
            let instructions = trimmed["/compact ".len()..].trim().to_string();
            if instructions.is_empty() {
                return Some(Command::Compact(None));
            }
            return Some(Command::Compact(Some(instructions)));
        }

        // /resume with optional prefix
        if lower == "/resume" {
            return Some(Command::Resume(None));
        }
        if lower.starts_with("/resume ") {
            let prefix = trimmed["/resume ".len()..].trim().to_string();
            if prefix.is_empty() {
                return Some(Command::Resume(None));
            }
            return Some(Command::Resume(Some(prefix)));
        }

        match lower.as_str() {
            "/clear" | "/reset" | "/new" => Some(Command::Clear),
            "/help" | "/h" | "/?" | "help" => Some(Command::Help),
            "exit" | "quit" | "/exit" | "/quit" => Some(Command::Quit),
            "/sessions" => Some(Command::Sessions),
            "/save" => Some(Command::Save),
            _ => None,
        }
    }
}

/// Help text: the commands section (UI-independent).
///
/// Each UI appends its own keybinding section.
pub const COMMANDS_HELP: &str = "\
📖 Commands:
  /help, /?             Show this help
  /sessions             List all saved sessions
  /resume               Load the most recent session
  /resume <prefix>      Load session by timestamp prefix (e.g. 2026_04_13)
  /save                 Manually save the current session
  /compact [instr]      Compact conversation history
  /clear, /reset, /new  Clear conversation, start fresh
  ! <cmd>               Execute shell command
  exit, quit            Exit";

/// Execute a shell command in a PTY and return `(output, is_error)`.
///
/// Wraps the command in `script` to allocate a pseudo-terminal so programs
/// emit ANSI color codes (see CLAUDE.md Gotcha #12). Sets `PAGER=cat` and
/// `GIT_PAGER=cat` to prevent pager-related issues.
///
/// This is the **synchronous** version for `! <cmd>` in the TUI/GTK event
/// loop. The async `BashTool` in `chlodwig-tools` uses `tokio::process`
/// but the same PTY wrapping.
pub fn execute_shell_pty(cmd: &str) -> (String, bool) {
    let mut command = std::process::Command::new("script");
    if cfg!(target_os = "macos") {
        command
            .arg("-q")
            .arg("/dev/null")
            .arg("bash")
            .arg("-c")
            .arg(cmd);
    } else {
        command
            .arg("-q")
            .arg("-c")
            .arg(format!("bash -c '{}'", cmd.replace('\'', "'\\''")))
            .arg("/dev/null");
    }
    command.env("GIT_PAGER", "cat");
    command.env("PAGER", "cat");

    match command.output() {
        Ok(out) => {
            // With PTY, stderr is merged into stdout
            let stdout = String::from_utf8_lossy(&out.stdout);
            let output = if stdout.is_empty() {
                let stderr = String::from_utf8_lossy(&out.stderr);
                if stderr.is_empty() {
                    format!("(exit code: {})", out.status.code().unwrap_or(-1))
                } else {
                    stderr.into_owned()
                }
            } else {
                stdout.into_owned()
            };
            let is_error = !out.status.success();
            (output, is_error)
        }
        Err(e) => (format!("Error: {e}"), true),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── Command::parse tests ──────────────────────────────────────

    #[test]
    fn test_parse_clear() {
        assert_eq!(Command::parse("/clear"), Some(Command::Clear));
        assert_eq!(Command::parse("/reset"), Some(Command::Clear));
        assert_eq!(Command::parse("/new"), Some(Command::Clear));
        assert_eq!(Command::parse("  /clear  "), Some(Command::Clear));
    }

    #[test]
    fn test_parse_help() {
        assert_eq!(Command::parse("/help"), Some(Command::Help));
        assert_eq!(Command::parse("/h"), Some(Command::Help));
        assert_eq!(Command::parse("/?"), Some(Command::Help));
        assert_eq!(Command::parse("help"), Some(Command::Help));
    }

    #[test]
    fn test_parse_shell() {
        assert_eq!(Command::parse("! ls -la"), Some(Command::Shell("ls -la".into())));
        assert_eq!(Command::parse("!ls"), Some(Command::Shell("ls".into())));
        assert_eq!(Command::parse("  ! echo hello  "), Some(Command::Shell("echo hello".into())));
    }

    #[test]
    fn test_parse_shell_empty() {
        assert_eq!(Command::parse("!"), None);
        assert_eq!(Command::parse("!  "), None);
    }

    #[test]
    fn test_parse_quit() {
        assert_eq!(Command::parse("exit"), Some(Command::Quit));
        assert_eq!(Command::parse("quit"), Some(Command::Quit));
        assert_eq!(Command::parse("/exit"), Some(Command::Quit));
        assert_eq!(Command::parse("/quit"), Some(Command::Quit));
    }

    #[test]
    fn test_parse_compact() {
        assert_eq!(Command::parse("/compact"), Some(Command::Compact(None)));
        assert_eq!(
            Command::parse("/compact focus on errors"),
            Some(Command::Compact(Some("focus on errors".into())))
        );
        assert_eq!(Command::parse("/compact   "), Some(Command::Compact(None)));
    }

    #[test]
    fn test_parse_sessions() {
        assert_eq!(Command::parse("/sessions"), Some(Command::Sessions));
    }

    #[test]
    fn test_parse_resume() {
        assert_eq!(Command::parse("/resume"), Some(Command::Resume(None)));
        assert_eq!(
            Command::parse("/resume 2026_04_13"),
            Some(Command::Resume(Some("2026_04_13".into())))
        );
    }

    #[test]
    fn test_parse_save() {
        assert_eq!(Command::parse("/save"), Some(Command::Save));
    }

    #[test]
    fn test_parse_none_for_regular_text() {
        assert_eq!(Command::parse("hello world"), None);
        assert_eq!(Command::parse("what is rust?"), None);
        assert_eq!(Command::parse(""), None);
        assert_eq!(Command::parse("   "), None);
    }

    #[test]
    fn test_parse_case_insensitive() {
        assert_eq!(Command::parse("/CLEAR"), Some(Command::Clear));
        assert_eq!(Command::parse("/Help"), Some(Command::Help));
        assert_eq!(Command::parse("QUIT"), Some(Command::Quit));
        assert_eq!(Command::parse("/COMPACT"), Some(Command::Compact(None)));
    }

    #[test]
    fn test_parse_shell_preserves_case() {
        assert_eq!(Command::parse("! Echo Hello"), Some(Command::Shell("Echo Hello".into())));
    }

    #[test]
    fn test_parse_compact_preserves_instruction_case() {
        assert_eq!(
            Command::parse("/compact Focus On Errors"),
            Some(Command::Compact(Some("Focus On Errors".into())))
        );
    }

    // ── COMMANDS_HELP tests ───────────────────────────────────────

    #[test]
    fn test_commands_help_contains_all_commands() {
        assert!(COMMANDS_HELP.contains("/clear"), "must mention /clear");
        assert!(COMMANDS_HELP.contains("/help"), "must mention /help");
        assert!(COMMANDS_HELP.contains("! <cmd>"), "must mention shell");
        assert!(COMMANDS_HELP.contains("exit"), "must mention exit");
        assert!(COMMANDS_HELP.contains("/compact"), "must mention /compact");
        assert!(COMMANDS_HELP.contains("/sessions"), "must mention /sessions");
        assert!(COMMANDS_HELP.contains("/resume"), "must mention /resume");
        assert!(COMMANDS_HELP.contains("/save"), "must mention /save");
    }

    // ── execute_shell_pty tests ───────────────────────────────────

    #[test]
    fn test_execute_shell_echo() {
        let (output, is_error) = execute_shell_pty("echo hello");
        assert!(!is_error);
        assert!(output.contains("hello"), "output should contain 'hello', got: {output}");
    }

    #[test]
    fn test_execute_shell_failing() {
        let (_output, _is_error) = execute_shell_pty("false");
        // just verify no panic
    }

    #[test]
    fn test_execute_shell_nonexistent() {
        let (output, _is_error) = execute_shell_pty("nonexistent_command_xyz_12345");
        assert!(!output.is_empty(), "error output should not be empty");
    }
}
