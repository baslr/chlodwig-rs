//! System prompt construction — shared by TUI and GTK.
//!
//! Every function takes an explicit `cwd: &Path`. The core library never
//! reads `std::env::current_dir()`; that is the caller's job (done once at
//! startup in CLI `main` and in GTK `setup::resolve_initial_cwd()`).
//!
//! This makes per-tab system prompts trivial — each tab passes its own
//! `AppState.cwd` and nothing leaks between tabs.

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
/// Includes `cwd`, current date, and tool descriptions. The `ui` parameter
/// controls whether it says "CLI tool" or "GUI application".
pub fn default_system_prompt(ui: UiContext, cwd: &std::path::Path) -> String {
    let cwd_str = cwd.display().to_string();
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

Current working directory: {cwd_str}
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
/// 2. Project root: `{cwd}/CLAUDE.md`
/// 3. Project config: `{cwd}/.claude/CLAUDE.md`
///
/// Returns `None` if none of the files exist or are non-empty.
pub fn load_claude_md(cwd: &std::path::Path) -> Option<String> {
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

    // 2 + 3. Project files in the supplied directory.
    let local = cwd.join("CLAUDE.md");
    if let Ok(content) = std::fs::read_to_string(&local) {
        if !content.trim().is_empty() {
            parts.push(format!(
                "# Project CLAUDE.md ({})\n{content}",
                local.display()
            ));
        }
    }

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

    if parts.is_empty() {
        None
    } else {
        Some(parts.join("\n\n"))
    }
}

/// Collect git context for `cwd`: branch, status, recent commits.
///
/// Returns `None` if `cwd` is not inside a git repository.
pub fn git_context(cwd: &std::path::Path) -> Option<String> {
    use std::process::Command;

    // Check if we're in a git repo
    let branch_output = Command::new("git")
        .args(["rev-parse", "--abbrev-ref", "HEAD"])
        .current_dir(cwd)
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
        .current_dir(cwd)
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
        .current_dir(cwd)
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
/// - `cwd`: Working directory used for the CWD line, CLAUDE.md lookup, and git context.
///
/// Block layout:
/// 1. Base system prompt (cached)
/// 2. CLAUDE.md contents (cached — rarely changes during a session)
/// 3. Git context (NOT cached — changes between turns)
pub fn build_system_prompt(
    custom: Option<&str>,
    ui: UiContext,
    cwd: &std::path::Path,
) -> Vec<SystemBlock> {
    if let Some(custom) = custom {
        return vec![SystemBlock::text(custom)];
    }

    let mut blocks = Vec::new();

    // Block 1: Static system prompt (cached — rarely changes)
    blocks.push(SystemBlock::cached(default_system_prompt(ui, cwd)));

    // Block 2: CLAUDE.md contents (cached — rarely changes during session)
    if let Some(claude_md) = load_claude_md(cwd) {
        blocks.push(SystemBlock::cached(claude_md));
    }

    // Block 3: Git context (NOT cached — changes between turns)
    if let Some(git_ctx) = git_context(cwd) {
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

    fn any_cwd() -> std::path::PathBuf {
        std::path::PathBuf::from("/tmp/test-cwd")
    }

    #[test]
    fn test_default_system_prompt_contains_cli_context() {
        let prompt = default_system_prompt(UiContext::Cli, &any_cwd());
        assert!(prompt.contains("via a CLI tool"));
        assert!(!prompt.contains("GUI application"));
    }

    #[test]
    fn test_default_system_prompt_contains_gui_context() {
        let prompt = default_system_prompt(UiContext::Gui, &any_cwd());
        assert!(prompt.contains("via a GUI application"));
        assert!(!prompt.contains("CLI tool"));
    }

    #[test]
    fn test_default_system_prompt_contains_cwd() {
        let prompt = default_system_prompt(UiContext::Cli, &any_cwd());
        assert!(prompt.contains("Current working directory: /tmp/test-cwd"));
    }

    #[test]
    fn test_default_system_prompt_contains_date() {
        let prompt = default_system_prompt(UiContext::Cli, &any_cwd());
        let today = chrono::Local::now().format("%Y-%m-%d").to_string();
        assert!(prompt.contains(&today));
    }

    #[test]
    fn test_default_system_prompt_contains_tool_list() {
        let prompt = default_system_prompt(UiContext::Cli, &any_cwd());
        assert!(prompt.contains("- Bash:"));
        assert!(prompt.contains("- Read:"));
        assert!(prompt.contains("- Write:"));
        assert!(prompt.contains("- Edit:"));
        assert!(prompt.contains("- Glob:"));
        assert!(prompt.contains("- Grep:"));
        assert!(prompt.contains("- ListDir:"));
    }

    #[test]
    fn test_default_system_prompt_uses_explicit_path() {
        let cwd = std::path::PathBuf::from("/tmp/explicit/per-tab");
        let prompt = default_system_prompt(UiContext::Cli, &cwd);
        assert!(prompt.contains("Current working directory: /tmp/explicit/per-tab"));
    }

    /// Two CWDs → two distinct prompts. Proves the explicit cwd is honored.
    #[test]
    fn test_default_system_prompt_distinguishes_tabs() {
        let a = default_system_prompt(UiContext::Cli, std::path::Path::new("/tab/a"));
        let b = default_system_prompt(UiContext::Cli, std::path::Path::new("/tab/b"));
        assert_ne!(a, b);
        assert!(a.contains("/tab/a"));
        assert!(b.contains("/tab/b"));
    }

    // ── build_system_prompt ──

    #[test]
    fn test_build_system_prompt_custom_overrides_everything() {
        let blocks = build_system_prompt(
            Some("Custom prompt"),
            UiContext::Cli,
            std::path::Path::new("/anywhere"),
        );
        assert_eq!(blocks.len(), 1);
        assert_eq!(blocks[0].text, "Custom prompt");
        assert!(blocks[0].cache_control.is_none());
    }

    #[test]
    fn test_build_system_prompt_default_has_cached_base() {
        let tmp = tempfile::tempdir().unwrap();
        let blocks = build_system_prompt(None, UiContext::Cli, tmp.path());
        assert!(!blocks.is_empty());
        assert!(blocks[0].cache_control.is_some());
        assert!(blocks[0].text.contains("via a CLI tool"));
    }

    #[test]
    fn test_build_system_prompt_gui_uses_gui_context() {
        let tmp = tempfile::tempdir().unwrap();
        let blocks = build_system_prompt(None, UiContext::Gui, tmp.path());
        assert!(blocks[0].text.contains("via a GUI application"));
    }

    #[test]
    fn test_build_system_prompt_at_least_one_block() {
        let tmp = tempfile::tempdir().unwrap();
        let blocks = build_system_prompt(None, UiContext::Cli, tmp.path());
        assert!(!blocks.is_empty());
    }

    #[test]
    fn test_build_system_prompt_embeds_explicit_cwd() {
        let cwd = tempfile::tempdir().unwrap();
        let blocks = build_system_prompt(None, UiContext::Gui, cwd.path());
        assert!(!blocks.is_empty());
        let cwd_str = cwd.path().display().to_string();
        assert!(blocks[0].text.contains(&cwd_str));
    }

    /// Two tabs with different CWDs build independent system prompts —
    /// the foundation for per-tab system prompts in multi-tab GTK.
    #[test]
    fn test_build_system_prompt_independent_per_tab() {
        let tab_a = tempfile::tempdir().unwrap();
        let tab_b = tempfile::tempdir().unwrap();
        std::fs::write(tab_a.path().join("CLAUDE.md"), "marker-AAA tab content").unwrap();
        std::fs::write(tab_b.path().join("CLAUDE.md"), "marker-BBB tab content").unwrap();

        let blocks_a = build_system_prompt(None, UiContext::Cli, tab_a.path());
        let blocks_b = build_system_prompt(None, UiContext::Cli, tab_b.path());

        let text_a: String = blocks_a.iter().map(|b| b.text.as_str()).collect::<Vec<_>>().join("\n");
        let text_b: String = blocks_b.iter().map(|b| b.text.as_str()).collect::<Vec<_>>().join("\n");

        assert!(text_a.contains("marker-AAA"));
        assert!(!text_a.contains("marker-BBB"));
        assert!(text_b.contains("marker-BBB"));
        assert!(!text_b.contains("marker-AAA"));
    }

    // ── git_context ──

    #[test]
    fn test_git_context_uses_explicit_cwd_in_repo() {
        // The chlodwig-rs workspace itself is a git repo.
        let workspace_root = std::env::current_dir()
            .unwrap()
            .ancestors()
            .find(|p| p.join(".git").exists())
            .unwrap()
            .to_path_buf();
        let ctx = git_context(&workspace_root);
        assert!(ctx.is_some(), "Expected git context for workspace");
        let text = ctx.unwrap();
        assert!(text.contains("Git branch:"));
        assert!(text.contains("Recent commits:"));
    }

    #[test]
    fn test_git_context_returns_none_for_non_repo() {
        let tmp = tempfile::tempdir().unwrap();
        assert!(git_context(tmp.path()).is_none());
    }

    // ── load_claude_md ──

    #[test]
    fn test_load_claude_md_finds_file_in_explicit_dir() {
        let tmp = tempfile::tempdir().unwrap();
        std::fs::write(tmp.path().join("CLAUDE.md"), "# Tab-local\nrules-XYZ-123").unwrap();

        let process_cwd_before = std::env::current_dir().unwrap();
        let result = load_claude_md(tmp.path());
        let process_cwd_after = std::env::current_dir().unwrap();

        // load_claude_md must not mutate the process CWD.
        assert_eq!(process_cwd_before, process_cwd_after);

        let text = result.expect("CLAUDE.md should be found");
        assert!(text.contains("rules-XYZ-123"));
        assert!(text.contains("Project CLAUDE.md"));
    }

    #[test]
    fn test_load_claude_md_returns_none_for_empty_dir() {
        let tmp = tempfile::tempdir().unwrap();
        let result = load_claude_md(tmp.path());
        // Global ~/.claude/CLAUDE.md may exist and is allowed in the output,
        // but nothing from the tempdir itself.
        if let Some(text) = result {
            let tmp_path = tmp.path().display().to_string();
            assert!(!text.contains(&tmp_path));
        }
    }

    #[test]
    fn test_load_claude_md_finds_dot_claude_subdir() {
        let tmp = tempfile::tempdir().unwrap();
        let dot = tmp.path().join(".claude");
        std::fs::create_dir_all(&dot).unwrap();
        std::fs::write(dot.join("CLAUDE.md"), "# DotConfig\nplus-MARKER-456").unwrap();

        let text = load_claude_md(tmp.path()).expect("dot-claude should be found");
        assert!(text.contains("plus-MARKER-456"));
    }

    /// Two different CWDs → independent CLAUDE.md content.
    #[test]
    fn test_load_claude_md_independent_per_tab() {
        let tab_a = tempfile::tempdir().unwrap();
        let tab_b = tempfile::tempdir().unwrap();
        std::fs::write(tab_a.path().join("CLAUDE.md"), "AAA-tag tab a").unwrap();
        std::fs::write(tab_b.path().join("CLAUDE.md"), "BBB-tag tab b").unwrap();

        let a = load_claude_md(tab_a.path()).unwrap();
        let b = load_claude_md(tab_b.path()).unwrap();

        assert!(a.contains("AAA-tag tab a"));
        assert!(!a.contains("BBB-tag"));
        assert!(b.contains("BBB-tag tab b"));
        assert!(!b.contains("AAA-tag"));
    }
}
