//! System prompt construction — shared by TUI and GTK.
//!
//! This module consolidates the duplicated `build_system_prompt()`,
//! `load_claude_md()`, `git_context()`, and `default_system_prompt()`
//! functions that previously lived separately in `chlodwig-cli/src/main.rs`
//! and `chlodwig-gtk/src/main.rs`.

use crate::SystemBlock;

/// The kind of UI frontend, used to customize the system prompt phrasing.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum UiContext {
    /// Terminal TUI or headless CLI.
    Cli,
    /// Native GTK GUI.
    Gui,
}

impl UiContext {
    fn description(self) -> &'static str {
        match self {
            UiContext::Cli => "a CLI tool",
            UiContext::Gui => "a GUI application",
        }
    }
}

/// Build the default (non-custom) base system prompt.
///
/// Includes CWD, current date, and tool descriptions.
/// The `context` parameter controls whether it says "CLI tool" or "GUI application".
pub fn default_system_prompt(ui: UiContext) -> String {
    let cwd = std::env::current_dir()
        .map(|p| p.display().to_string())
        .unwrap_or_else(|_| "unknown".into());
    let date = chrono::Local::now().format("%Y-%m-%d");
    let via = ui.description();

    format!(
        r#"You are Claude, an AI assistant made by Anthropic. You are helping a user via {via}.

You have access to tools that let you interact with the user's computer:
- Bash: Execute shell commands
- Read: Read file contents with line numbers
- Write: Write files (creates parent directories)
- Edit: Find and replace in files
- Glob: Find files by pattern
- Grep: Search file contents with regex
- ListDir: List directory contents

Current working directory: {cwd}
Current date: {date}

When using tools:
- Use absolute paths for file operations
- Be careful with destructive operations
- Explain what you're doing before using tools

Be concise and helpful. When asked to make changes, use tools directly rather than just showing code."#
    )
}

/// Load CLAUDE.md files from multiple locations:
///
/// 1. Global: `~/.claude/CLAUDE.md`
/// 2. Project root: `./CLAUDE.md`
/// 3. Project config: `./.claude/CLAUDE.md`
///
/// Returns `None` if none of the files exist or are non-empty.
pub fn load_claude_md() -> Option<String> {
    let mut parts = Vec::new();

    // 1. Global: ~/.claude/CLAUDE.md
    if let Some(home) = dirs::home_dir() {
        let global = home.join(".claude").join("CLAUDE.md");
        if let Ok(content) = std::fs::read_to_string(&global) {
            if !content.trim().is_empty() {
                parts.push(format!("# Global CLAUDE.md (~/.claude/CLAUDE.md)\n{content}"));
            }
        }
    }

    // 2. Project root: ./CLAUDE.md
    if let Ok(cwd) = std::env::current_dir() {
        let local = cwd.join("CLAUDE.md");
        if let Ok(content) = std::fs::read_to_string(&local) {
            if !content.trim().is_empty() {
                parts.push(format!(
                    "# Project CLAUDE.md ({})\n{content}",
                    local.display()
                ));
            }
        }

        // 3. Project config: ./.claude/CLAUDE.md
        let dot_claude = cwd.join(".claude").join("CLAUDE.md");
        if dot_claude.exists() && dot_claude != local {
            if let Ok(content) = std::fs::read_to_string(&dot_claude) {
                if !content.trim().is_empty() {
                    parts.push(format!(
                        "# Project .claude/CLAUDE.md ({})\n{content}",
                        dot_claude.display()
                    ));
                }
            }
        }
    }

    if parts.is_empty() {
        None
    } else {
        Some(parts.join("\n\n"))
    }
}

/// Collect git context: branch, status, recent commits.
///
/// Returns `None` if the current directory is not inside a git repository.
pub fn git_context() -> Option<String> {
    use std::process::Command;
    let cwd = std::env::current_dir().ok()?;

    // Check if we're in a git repo
    let branch_output = Command::new("git")
        .args(["rev-parse", "--abbrev-ref", "HEAD"])
        .current_dir(&cwd)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output()
        .ok()?;

    if !branch_output.status.success() {
        return None;
    }

    let branch = String::from_utf8_lossy(&branch_output.stdout)
        .trim()
        .to_string();

    let mut ctx = format!("Git branch: {branch}");

    // git status --short
    if let Ok(output) = Command::new("git")
        .args(["status", "--short"])
        .current_dir(&cwd)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output()
    {
        let status = String::from_utf8_lossy(&output.stdout)
            .trim()
            .to_string();
        if !status.is_empty() {
            ctx.push_str(&format!("\nGit status:\n{status}"));
        }
    }

    // git log --oneline -5
    if let Ok(output) = Command::new("git")
        .args(["log", "--oneline", "-5"])
        .current_dir(&cwd)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .output()
    {
        let log = String::from_utf8_lossy(&output.stdout)
            .trim()
            .to_string();
        if !log.is_empty() {
            ctx.push_str(&format!("\nRecent commits:\n{log}"));
        }
    }

    Some(ctx)
}

/// Build the full system prompt as structured blocks with cache control.
///
/// - `custom`: If `Some`, uses only that text as the system prompt (no CLAUDE.md, no git).
/// - `ui`: Controls whether the prompt says "CLI tool" or "GUI application".
///
/// Block layout:
/// 1. Base system prompt (cached)
/// 2. CLAUDE.md contents (cached — rarely changes during a session)
/// 3. Git context (NOT cached — changes between turns)
pub fn build_system_prompt(custom: Option<&str>, ui: UiContext) -> Vec<SystemBlock> {
    if let Some(custom) = custom {
        return vec![SystemBlock::text(custom)];
    }

    let mut blocks = Vec::new();

    // Block 1: Static system prompt (cached — rarely changes)
    blocks.push(SystemBlock::cached(default_system_prompt(ui)));

    // Block 2: CLAUDE.md contents (cached — rarely changes during session)
    if let Some(claude_md) = load_claude_md() {
        blocks.push(SystemBlock::cached(claude_md));
    }

    // Block 3: Git context (NOT cached — changes between turns)
    if let Some(git_ctx) = git_context() {
        blocks.push(SystemBlock::text(git_ctx));
    }

    blocks
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── UiContext ──

    #[test]
    fn test_ui_context_cli_description() {
        assert_eq!(UiContext::Cli.description(), "a CLI tool");
    }

    #[test]
    fn test_ui_context_gui_description() {
        assert_eq!(UiContext::Gui.description(), "a GUI application");
    }

    // ── default_system_prompt ──

    #[test]
    fn test_default_system_prompt_contains_cli_context() {
        let prompt = default_system_prompt(UiContext::Cli);
        assert!(
            prompt.contains("via a CLI tool"),
            "CLI prompt must say 'via a CLI tool'"
        );
        assert!(!prompt.contains("GUI application"));
    }

    #[test]
    fn test_default_system_prompt_contains_gui_context() {
        let prompt = default_system_prompt(UiContext::Gui);
        assert!(
            prompt.contains("via a GUI application"),
            "GUI prompt must say 'via a GUI application'"
        );
        assert!(!prompt.contains("CLI tool"));
    }

    #[test]
    fn test_default_system_prompt_contains_cwd() {
        let prompt = default_system_prompt(UiContext::Cli);
        assert!(prompt.contains("Current working directory:"));
    }

    #[test]
    fn test_default_system_prompt_contains_date() {
        let prompt = default_system_prompt(UiContext::Cli);
        let today = chrono::Local::now().format("%Y-%m-%d").to_string();
        assert!(prompt.contains(&today));
    }

    #[test]
    fn test_default_system_prompt_contains_tool_list() {
        let prompt = default_system_prompt(UiContext::Cli);
        assert!(prompt.contains("- Bash:"));
        assert!(prompt.contains("- Read:"));
        assert!(prompt.contains("- Write:"));
        assert!(prompt.contains("- Edit:"));
        assert!(prompt.contains("- Glob:"));
        assert!(prompt.contains("- Grep:"));
        assert!(prompt.contains("- ListDir:"));
    }

    // ── build_system_prompt ──

    #[test]
    fn test_build_system_prompt_custom_overrides_everything() {
        let blocks = build_system_prompt(Some("Custom prompt"), UiContext::Cli);
        assert_eq!(blocks.len(), 1);
        assert_eq!(blocks[0].text, "Custom prompt");
        // Custom prompt should NOT be cached (no cache_control)
        assert!(blocks[0].cache_control.is_none());
    }

    #[test]
    fn test_build_system_prompt_default_has_cached_base() {
        let blocks = build_system_prompt(None, UiContext::Cli);
        assert!(!blocks.is_empty());
        // First block must be cached
        assert!(
            blocks[0].cache_control.is_some(),
            "Base system prompt must be cached"
        );
        assert!(blocks[0].text.contains("via a CLI tool"));
    }

    #[test]
    fn test_build_system_prompt_gui_uses_gui_context() {
        let blocks = build_system_prompt(None, UiContext::Gui);
        assert!(blocks[0].text.contains("via a GUI application"));
    }

    #[test]
    fn test_build_system_prompt_at_least_one_block() {
        // Even without CLAUDE.md or git, at least the base prompt exists
        let blocks = build_system_prompt(None, UiContext::Cli);
        assert!(!blocks.is_empty());
    }

    // ── git_context ──

    #[test]
    fn test_git_context_returns_some_in_git_repo() {
        // This test runs inside the chlodwig-rs repo, so git context should exist
        let ctx = git_context();
        assert!(ctx.is_some(), "Expected git context in a git repo");
        let text = ctx.unwrap();
        assert!(
            text.contains("Git branch:"),
            "Git context must contain branch info"
        );
    }

    #[test]
    fn test_git_context_contains_recent_commits() {
        let ctx = git_context().expect("should be in a git repo");
        assert!(
            ctx.contains("Recent commits:"),
            "Git context must contain recent commits"
        );
    }

    // ── load_claude_md ──
    //
    // These tests change the CWD — must be serialized to avoid races.

    use std::sync::Mutex;
    static CWD_LOCK: Mutex<()> = Mutex::new(());

    #[test]
    fn test_load_claude_md_finds_file_when_present() {
        let _lock = CWD_LOCK.lock().unwrap();

        // Create a temporary directory with a CLAUDE.md and run from there.
        let tmp = tempfile::tempdir().unwrap();
        let claude_path = tmp.path().join("CLAUDE.md");
        std::fs::write(&claude_path, "# Test\nSome instructions").unwrap();

        let original_dir = std::env::current_dir().unwrap();
        std::env::set_current_dir(tmp.path()).unwrap();

        let result = load_claude_md();

        // Restore CWD before asserting (so panics don't leave CWD wrong).
        std::env::set_current_dir(&original_dir).unwrap();

        assert!(result.is_some(), "Expected CLAUDE.md to be found");
        let text = result.unwrap();
        assert!(text.contains("Project CLAUDE.md"));
        assert!(text.contains("Some instructions"));
    }

    #[test]
    fn test_load_claude_md_returns_none_when_no_file() {
        let _lock = CWD_LOCK.lock().unwrap();

        let tmp = tempfile::tempdir().unwrap();
        let original_dir = std::env::current_dir().unwrap();
        std::env::set_current_dir(tmp.path()).unwrap();

        let result = load_claude_md();

        std::env::set_current_dir(&original_dir).unwrap();

        // No ~/.claude/CLAUDE.md either in most CI environments,
        // but the project-level one definitely doesn't exist.
        // If global exists, result may be Some — just check it doesn't contain project.
        if let Some(text) = &result {
            assert!(
                !text.contains("Project CLAUDE.md"),
                "Should not find project CLAUDE.md in empty tmpdir"
            );
        }
    }

    #[test]
    fn test_load_claude_md_dot_claude_subdir() {
        let _lock = CWD_LOCK.lock().unwrap();

        let tmp = tempfile::tempdir().unwrap();
        let dot_claude = tmp.path().join(".claude");
        std::fs::create_dir_all(&dot_claude).unwrap();
        std::fs::write(dot_claude.join("CLAUDE.md"), "# Config\nExtra rules").unwrap();

        let original_dir = std::env::current_dir().unwrap();
        std::env::set_current_dir(tmp.path()).unwrap();

        let result = load_claude_md();

        std::env::set_current_dir(&original_dir).unwrap();

        assert!(result.is_some());
        let text = result.unwrap();
        assert!(text.contains(".claude/CLAUDE.md"));
        assert!(text.contains("Extra rules"));
    }
}
