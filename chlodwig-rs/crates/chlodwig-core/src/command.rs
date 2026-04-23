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
    /// `/stop` or bare `stop` — interrupt the agentic turn loop.
    /// After the current SSE message_stop, sends a user message
    /// "User intentionally interrupted the turn loop." to the model.
    Stop,
    /// `/name <name>` — set a human-readable name for this session.
    /// Empty name (`/name` with no argument) clears the name.
    Name(Option<String>),
    /// `/unwind` or `/unwind <N>` — roll back the last N text-bearing
    /// messages (default 1). Pure tool-result/tool-use messages are
    /// stripped together with their text-bearing partners. See
    /// `chlodwig_core::reducers::unwind::unwind_messages` for full
    /// semantics.
    Unwind(usize),
    /// `/cwd` (show current) or `/cwd <path>` (change working directory).
    /// `<path>` may be absolute, relative, or start with `~`.
    /// Resolution happens in the UI handler via `resolve_cwd_arg`.
    Cwd(Option<String>),
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

        // /name with optional name (empty clears)
        if lower == "/name" {
            return Some(Command::Name(None));
        }
        if lower.starts_with("/name ") {
            // Take everything after "/name " from the original (case-preserving)
            // string. Trim leading/trailing whitespace but keep internal spaces
            // exactly as typed (collapse only runs of whitespace > 1).
            let raw = trimmed["/name ".len()..].trim();
            if raw.is_empty() {
                return Some(Command::Name(None));
            }
            // Collapse internal runs of whitespace into single spaces.
            let collapsed: String = raw
                .split_whitespace()
                .collect::<Vec<_>>()
                .join(" ");
            return Some(Command::Name(Some(collapsed)));
        }

        // /unwind with optional positive integer count (default 1)
        if lower == "/unwind" {
            return Some(Command::Unwind(1));
        }
        if lower.starts_with("/unwind ") {
            let arg = trimmed["/unwind ".len()..].trim();
            if arg.is_empty() {
                return Some(Command::Unwind(1));
            }
            // Parse positive integer; non-numeric or zero → fall back to 1.
            match arg.parse::<usize>() {
                Ok(0) => return Some(Command::Unwind(1)),
                Ok(n) => return Some(Command::Unwind(n)),
                Err(_) => return Some(Command::Unwind(1)),
            }
        }

        // /cwd with optional path
        if lower == "/cwd" {
            return Some(Command::Cwd(None));
        }
        if lower.starts_with("/cwd ") {
            let path = trimmed["/cwd ".len()..].trim().to_string();
            if path.is_empty() {
                return Some(Command::Cwd(None));
            }
            return Some(Command::Cwd(Some(path)));
        }

        match lower.as_str() {
            "/clear" | "/reset" | "/new" => Some(Command::Clear),
            "/help" | "/h" | "/?" | "help" => Some(Command::Help),
            "exit" | "quit" | "/exit" | "/quit" => Some(Command::Quit),
            "/sessions" => Some(Command::Sessions),
            "/save" => Some(Command::Save),
            "/stop" | "stop" => Some(Command::Stop),
            _ => None,
        }
    }
}

/// Resolve a user-supplied `/cwd` argument against `current` and return
/// the canonical absolute path. **No** side effects.
///
/// Rules:
/// - Tilde-prefix (`~` or `~/`) expands against `$HOME`.
/// - Absolute paths are taken as-is.
/// - Relative paths are joined onto `current`.
/// - The result is canonicalized (resolves `..`, symlinks, `/var` →
///   `/private/var` on macOS) so the stored path is unique.
/// - Returns `Err(String)` with a user-readable message if the path
///   does not exist or is not a directory.
pub fn resolve_cwd_arg(arg: &str, current: &std::path::Path) -> Result<std::path::PathBuf, String> {
    let arg = arg.trim();
    if arg.is_empty() {
        return Err("Path cannot be empty.".to_string());
    }

    let expanded = if arg == "~" {
        match std::env::var_os("HOME") {
            Some(home) => std::path::PathBuf::from(home),
            None => return Err("$HOME is not set.".to_string()),
        }
    } else if let Some(rest) = arg.strip_prefix("~/") {
        match std::env::var_os("HOME") {
            Some(home) => std::path::PathBuf::from(home).join(rest),
            None => return Err("$HOME is not set.".to_string()),
        }
    } else {
        let p = std::path::Path::new(arg);
        if p.is_absolute() {
            p.to_path_buf()
        } else {
            current.join(arg)
        }
    };

    let canonical = std::fs::canonicalize(&expanded).map_err(|e| {
        format!("Cannot resolve '{}': {}", expanded.display(), e)
    })?;

    if !canonical.is_dir() {
        return Err(format!("'{}' is not a directory.", canonical.display()));
    }

    Ok(canonical)
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
  /name <name>          Set a human-readable name for this session
  /cwd                  Show current working directory
  /cwd <path>           Change working directory (absolute, relative, or ~)
  /compact [instr]      Compact conversation history
  /clear, /reset, /new  Clear conversation, start fresh
  /unwind [N]           Roll back last N text messages (default 1)
  /stop, stop           Interrupt the agentic turn loop (or press Esc twice)
  ! <cmd>               Execute shell command
  exit, quit            Exit";

/// Commands section as a markdown table.
pub fn help_markdown_commands() -> String {
    "\
## 📖 Commands

| Command | Description |
|---------|-------------|
| `/help`, `/?` | Show this help |
| `/sessions` | List all saved sessions |
| `/resume` | Load the most recent session |
| `/resume <prefix>` | Load session by timestamp prefix |
| `/save` | Manually save the current session |
| `/name <name>` | Set a human-readable name for this session |
| `/cwd` | Show current working directory |
| `/cwd <path>` | Change working directory (absolute, relative, or ~) |
| `/compact [instr]` | Compact conversation history |
| `/clear`, `/reset`, `/new` | Clear conversation, start fresh |
| `/unwind [N]` | Roll back the last N text messages (default 1) |
| `/stop`, `stop` | Interrupt the agentic turn loop (or press Esc twice) |
| `! <cmd>` | Execute shell command |
| `exit`, `quit` | Exit |"
        .to_string()
}

/// TUI keybindings as a markdown table.
pub fn help_markdown_keys_tui() -> String {
    "\
## ⌨ Key Bindings

| Key | Action |
|-----|--------|
| `Enter` | Submit input |
| `Ctrl+J` | Insert newline (all terminals) |
| `Shift+Enter` | Insert newline (Kitty-protocol terminals) |
| `Up` / `Down` | Move cursor in multiline input; history on first/last line |
| `Alt+←` / `Alt+→` | Move cursor word left / right |
| `Alt+b` / `Alt+f` | Move cursor word left / right (Emacs) |
| `Alt+Backspace` | Delete word backward |
| `Alt+d` | Delete word forward |
| `Ctrl+K` | Delete word backward |
| `Ctrl+L` | Delete word forward |
| `Ctrl+C` | Quit |"
        .to_string()
}

/// GTK keybindings as a markdown table.
pub fn help_markdown_keys_gtk() -> String {
    "\
## ⌨ Key Bindings

| Key | Action |
|-----|--------|
| `Cmd+Enter` | Submit input |
| `Enter` | Insert newline |
| `Cmd+Backspace` | Delete to start of line |
| `Option+Backspace` | Delete word backward |
| `Cmd+←/→` | Move cursor to line start/end |
| `Cmd+↑/↓` | Move cursor to document start/end |
| `Option+←/→` | Move cursor word left/right |
| `Cmd+V/C/X/A` | Paste/Copy/Cut/Select All |
| `Cmd+Q` | Quit |"
        .to_string()
}

/// Execute a shell command in a PTY and return `(output, is_error)`.
///
/// Wraps the command in `script` to allocate a pseudo-terminal so programs
/// emit ANSI color codes (see CLAUDE.md Gotcha #12). Sets `PAGER=cat` and
/// `GIT_PAGER=cat` to prevent pager-related issues.
///
/// This is the **synchronous** version for `! <cmd>` in the TUI/GTK event
/// loop. The async `BashTool` in `chlodwig-tools` uses `tokio::process`
/// but the same PTY wrapping.
/// Run a shell command in `cwd` via a pseudo-TTY (PTY), so programs that
/// `isatty(stdout)` produce ANSI-colored output.
///
/// Callers must pass an explicit cwd: GTK tabs and the TUI track their own
/// working directory in `AppState.cwd` / `App.cwd` and never mutate the
/// process cwd. See gotcha #12 for the PTY rationale.
pub fn execute_shell_pty(cmd: &str, cwd: &std::path::Path) -> (String, bool) {
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
    command.current_dir(cwd);

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

    // ── /unwind tests ─────────────────────────────────────────────

    #[test]
    fn test_parse_unwind_no_arg_defaults_to_one() {
        assert_eq!(Command::parse("/unwind"), Some(Command::Unwind(1)));
        assert_eq!(Command::parse("  /unwind  "), Some(Command::Unwind(1)));
        assert_eq!(Command::parse("/unwind   "), Some(Command::Unwind(1)));
    }

    #[test]
    fn test_parse_unwind_with_count() {
        assert_eq!(Command::parse("/unwind 1"), Some(Command::Unwind(1)));
        assert_eq!(Command::parse("/unwind 2"), Some(Command::Unwind(2)));
        assert_eq!(Command::parse("/unwind 42"), Some(Command::Unwind(42)));
    }

    #[test]
    fn test_parse_unwind_zero_falls_back_to_one() {
        // /unwind 0 makes no sense — interpret as default.
        assert_eq!(Command::parse("/unwind 0"), Some(Command::Unwind(1)));
    }

    #[test]
    fn test_parse_unwind_non_numeric_falls_back_to_one() {
        // Garbage args don't error — we just default to 1.
        assert_eq!(Command::parse("/unwind abc"), Some(Command::Unwind(1)));
        assert_eq!(Command::parse("/unwind -3"), Some(Command::Unwind(1)));
    }

    #[test]
    fn test_parse_unwind_case_insensitive() {
        assert_eq!(Command::parse("/UNWIND"), Some(Command::Unwind(1)));
        assert_eq!(Command::parse("/Unwind 5"), Some(Command::Unwind(5)));
    }

    #[test]
    fn test_parse_stop_slash_form() {
        assert_eq!(Command::parse("/stop"), Some(Command::Stop));
        assert_eq!(Command::parse("  /stop  "), Some(Command::Stop));
    }

    #[test]
    fn test_parse_stop_bare_form() {
        assert_eq!(Command::parse("stop"), Some(Command::Stop));
        assert_eq!(Command::parse("Stop"), Some(Command::Stop));
        assert_eq!(Command::parse("STOP"), Some(Command::Stop));
        assert_eq!(Command::parse("  stop  "), Some(Command::Stop));
    }

    #[test]
    fn test_parse_stop_does_not_match_substrings() {
        // "stop the world" is a real prompt, not the /stop command.
        assert_eq!(Command::parse("stop the world"), None);
        assert_eq!(Command::parse("stopwatch"), None);
    }

    #[test]
    fn test_parse_name_with_argument() {
        assert_eq!(
            Command::parse("/name my session"),
            Some(Command::Name(Some("my session".into())))
        );
        assert_eq!(
            Command::parse("/name refactor"),
            Some(Command::Name(Some("refactor".into())))
        );
    }

    #[test]
    fn test_parse_name_without_argument_clears() {
        assert_eq!(Command::parse("/name"), Some(Command::Name(None)));
        assert_eq!(Command::parse("/name   "), Some(Command::Name(None)));
        assert_eq!(Command::parse("/name "), Some(Command::Name(None)));
    }

    #[test]
    fn test_parse_name_preserves_case() {
        assert_eq!(
            Command::parse("/name Refactor Sessions Window"),
            Some(Command::Name(Some("Refactor Sessions Window".into())))
        );
    }

    #[test]
    fn test_parse_name_utf8() {
        assert_eq!(
            Command::parse("/name häuser & 漢字 🚀"),
            Some(Command::Name(Some("häuser & 漢字 🚀".into())))
        );
    }

    #[test]
    fn test_parse_name_preserves_internal_spaces() {
        // Spaces inside the name MUST be preserved, NOT replaced with hyphens or removed.
        assert_eq!(
            Command::parse("/name ein test"),
            Some(Command::Name(Some("ein test".into())))
        );
        assert_eq!(
            Command::parse("/name foo bar baz"),
            Some(Command::Name(Some("foo bar baz".into())))
        );
    }

    #[test]
    fn test_parse_name_collapses_multiple_spaces() {
        // Runs of whitespace collapse to a single space (cosmetic cleanup).
        assert_eq!(
            Command::parse("/name foo    bar"),
            Some(Command::Name(Some("foo bar".into())))
        );
        assert_eq!(
            Command::parse("/name foo\tbar"),
            Some(Command::Name(Some("foo bar".into())))
        );
    }

    #[test]
    fn test_parse_none_for_regular_text() {
        assert_eq!(Command::parse("hello world"), None);
        assert_eq!(Command::parse("what is rust?"), None);
        assert_eq!(Command::parse(""), None);
        assert_eq!(Command::parse("   "), None);
    }

    // ── /cwd tests ────────────────────────────────────────────────

    #[test]
    fn test_parse_cwd_no_arg_shows_current() {
        assert_eq!(Command::parse("/cwd"), Some(Command::Cwd(None)));
    }

    #[test]
    fn test_parse_cwd_with_absolute_path() {
        assert_eq!(
            Command::parse("/cwd /tmp/foo"),
            Some(Command::Cwd(Some("/tmp/foo".into())))
        );
    }

    #[test]
    fn test_parse_cwd_with_relative_path() {
        assert_eq!(
            Command::parse("/cwd ../bar"),
            Some(Command::Cwd(Some("../bar".into())))
        );
        assert_eq!(
            Command::parse("/cwd src/lib.rs"),
            Some(Command::Cwd(Some("src/lib.rs".into())))
        );
    }

    #[test]
    fn test_parse_cwd_with_tilde() {
        assert_eq!(
            Command::parse("/cwd ~"),
            Some(Command::Cwd(Some("~".into())))
        );
        assert_eq!(
            Command::parse("/cwd ~/projects"),
            Some(Command::Cwd(Some("~/projects".into())))
        );
    }

    #[test]
    fn test_parse_cwd_trailing_whitespace_treated_as_no_arg() {
        assert_eq!(Command::parse("/cwd   "), Some(Command::Cwd(None)));
        assert_eq!(Command::parse("/cwd \t "), Some(Command::Cwd(None)));
    }

    #[test]
    fn test_parse_cwd_preserves_path_case() {
        assert_eq!(
            Command::parse("/cwd /Users/Foo/Bar"),
            Some(Command::Cwd(Some("/Users/Foo/Bar".into())))
        );
    }

    #[test]
    fn test_parse_cwd_case_insensitive_command_name() {
        assert_eq!(
            Command::parse("/CWD ./foo"),
            Some(Command::Cwd(Some("./foo".into())))
        );
        assert_eq!(
            Command::parse("/Cwd /tmp"),
            Some(Command::Cwd(Some("/tmp".into())))
        );
    }

    // ── resolve_cwd_arg tests ─────────────────────────────────────

    #[test]
    fn test_resolve_cwd_arg_absolute() {
        let tmp = tempfile::tempdir().unwrap();
        let canonical = std::fs::canonicalize(tmp.path()).unwrap();
        let result = resolve_cwd_arg(canonical.to_str().unwrap(), std::path::Path::new("/")).unwrap();
        assert_eq!(result, canonical);
    }

    #[test]
    fn test_resolve_cwd_arg_relative_to_current() {
        let tmp = tempfile::tempdir().unwrap();
        let canonical = std::fs::canonicalize(tmp.path()).unwrap();
        let subdir = canonical.join("sub");
        std::fs::create_dir(&subdir).unwrap();
        let result = resolve_cwd_arg("sub", &canonical).unwrap();
        assert_eq!(result, subdir);
    }

    #[test]
    fn test_resolve_cwd_arg_tilde_uses_home_env() {
        // Just test that ~ resolves to something (HOME is set in CI and dev)
        let result = resolve_cwd_arg("~", std::path::Path::new("/"));
        assert!(result.is_ok(), "~ should resolve, got: {:?}", result);
        assert!(result.unwrap().is_dir());
    }

    #[test]
    fn test_resolve_cwd_arg_strips_trailing_slash_via_canonicalize() {
        let tmp = tempfile::tempdir().unwrap();
        let canonical = std::fs::canonicalize(tmp.path()).unwrap();
        let with_slash = format!("{}/", canonical.display());
        let result = resolve_cwd_arg(&with_slash, std::path::Path::new("/")).unwrap();
        assert_eq!(result, canonical);
    }

    #[test]
    fn test_resolve_cwd_arg_rejects_nonexistent_path() {
        let result = resolve_cwd_arg("/nonexistent_xyz_12345", std::path::Path::new("/"));
        assert!(result.is_err());
    }

    #[test]
    fn test_resolve_cwd_arg_rejects_regular_file() {
        let tmp = tempfile::tempdir().unwrap();
        let file = tmp.path().join("file.txt");
        std::fs::write(&file, "hello").unwrap();
        let result = resolve_cwd_arg(file.to_str().unwrap(), std::path::Path::new("/"));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("not a directory"));
    }

    #[test]
    fn test_resolve_cwd_arg_empty_string_is_error() {
        let result = resolve_cwd_arg("", std::path::Path::new("/"));
        assert!(result.is_err());
    }

    #[test]
    fn test_resolve_cwd_arg_dotdot() {
        let tmp = tempfile::tempdir().unwrap();
        let canonical = std::fs::canonicalize(tmp.path()).unwrap();
        let subdir = canonical.join("a").join("b");
        std::fs::create_dir_all(&subdir).unwrap();
        // From a/b, ".." should resolve to a
        let result = resolve_cwd_arg("..", &subdir).unwrap();
        assert_eq!(result, canonical.join("a"));
    }

    // ── COMMANDS_HELP /cwd tests ──────────────────────────────────

    #[test]
    fn test_commands_help_mentions_cwd() {
        assert!(COMMANDS_HELP.contains("/cwd"), "COMMANDS_HELP must mention /cwd");
    }

    #[test]
    fn test_help_markdown_commands_mentions_cwd() {
        let md = help_markdown_commands();
        assert!(md.contains("/cwd"), "help_markdown_commands must mention /cwd");
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
        assert!(COMMANDS_HELP.contains("/name"), "must mention /name");
        assert!(COMMANDS_HELP.contains("/unwind"), "must mention /unwind");
        assert!(COMMANDS_HELP.contains("/cwd"), "must mention /cwd");
    }

    // ── help_markdown tests ─────────────────────────────────────

    #[test]
    fn test_help_markdown_commands_is_valid_table() {
        let md = help_markdown_commands();
        assert!(md.contains("| Command | Description |"), "must have header");
        assert!(md.contains("|---------|"), "must have separator");
        assert!(md.contains("`/help`"), "commands must be in backticks");
        assert!(md.contains("`/compact [instr]`"));
        assert!(md.contains("`! <cmd>`"));
        assert!(md.contains("`exit`"));
    }

    #[test]
    fn test_help_markdown_keys_tui_is_valid_table() {
        let md = help_markdown_keys_tui();
        assert!(md.contains("| Key | Action |"));
        assert!(md.contains("`Enter`"));
        assert!(md.contains("`Ctrl+J`"));
        assert!(md.contains("`Ctrl+C`"));
    }

    #[test]
    fn test_help_markdown_keys_gtk_is_valid_table() {
        let md = help_markdown_keys_gtk();
        assert!(md.contains("| Key | Action |"));
        assert!(md.contains("`Cmd+Enter`"));
        assert!(md.contains("`Cmd+Q`"));
    }

    #[test]
    fn test_help_markdown_commands_all_commands_present() {
        let md = help_markdown_commands();
        // Every parseable command must appear
        assert!(md.contains("/help"));
        assert!(md.contains("/sessions"));
        assert!(md.contains("/resume"));
        assert!(md.contains("/save"));
        assert!(md.contains("/compact"));
        assert!(md.contains("/clear"));
        assert!(md.contains("/unwind"));
        assert!(md.contains("! <cmd>"));
        assert!(md.contains("exit"));
    }

    // ── execute_shell_pty tests ───────────────────────────────────

    #[test]
    fn test_execute_shell_echo() {
        let cwd = std::env::current_dir().unwrap();
        let (output, is_error) = execute_shell_pty("echo hello", &cwd);
        assert!(!is_error);
        assert!(output.contains("hello"), "output should contain 'hello', got: {output}");
    }

    #[test]
    fn test_execute_shell_failing() {
        let cwd = std::env::current_dir().unwrap();
        let (_output, _is_error) = execute_shell_pty("false", &cwd);
        // just verify no panic
    }

    #[test]
    fn test_execute_shell_nonexistent() {
        let cwd = std::env::current_dir().unwrap();
        let (output, _is_error) = execute_shell_pty("nonexistent_command_xyz_12345", &cwd);
        assert!(!output.is_empty(), "error output should not be empty");
    }

    /// `! <cmd>` must run in the cwd the caller passed in (the GTK tab cwd
    /// or the TUI app cwd), not the process cwd. Regression for:
    /// "! git status" → "not a git repository" because GTK doesn't change
    /// process cwd between tabs (Stage 0.x cwd refactor).
    #[test]
    fn test_execute_shell_pty_runs_in_given_cwd() {
        let tmp = tempfile::tempdir().unwrap();
        // canonicalize so /var → /private/var on macOS doesn't trip the assert
        let cwd = std::fs::canonicalize(tmp.path()).unwrap();
        let (output, is_error) = execute_shell_pty("pwd", &cwd);
        assert!(!is_error, "pwd should succeed, got: {output}");
        assert!(
            output.contains(cwd.to_str().unwrap()),
            "pwd should print the given cwd ({}), got: {output}",
            cwd.display()
        );
    }
}
