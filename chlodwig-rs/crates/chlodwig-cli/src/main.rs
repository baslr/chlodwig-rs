//! Chlodwig CLI — binary entry point.

use anyhow::Result;
use clap::Parser;
use chlodwig_api::AnthropicClient;
use chlodwig_core::{
    AutoApprovePrompter, ContentBlock, ConversationEvent, ConversationState, Message,
    PermissionDecision, PermissionPrompter, Role, SessionSnapshot, SystemBlock, ToolContext,
    ToolResultContent,
};
use std::io::Write;
use std::time::Duration;
use tokio::sync::mpsc;

#[derive(Parser, Debug)]
#[command(
    name = "chlodwig-rs",
    about = "Chlodwig Code CLI — Rust PoC",
    version,
    long_about = "A proof-of-concept Rust implementation of the Chlodwig Code CLI.\nStreams responses from the Anthropic Messages API with tool execution support."
)]
struct Cli {
    /// Run in non-interactive mode with a single prompt
    #[arg(long = "print", short = 'p')]
    print_mode: Option<String>,

    /// Model to use
    #[arg(long, default_value = "github/claude-opus-4.6")]
    model: String,

    /// Max tokens for response
    #[arg(long, default_value = "16384")]
    max_tokens: u32,

    /// System prompt override
    #[arg(long)]
    system_prompt: Option<String>,

    /// API key (defaults to ANTHROPIC_API_KEY env var)
    #[arg(long, env = "ANTHROPIC_API_KEY", hide_env_values = true)]
    api_key: String,

    /// Skip tool permission prompts (auto-approve all)
    #[arg(long, default_value_t = true)]
    dangerously_skip_permissions: bool,

    /// Resume the last saved session
    #[arg(long, short = 'r')]
    resume: bool,

    /// API base URL override
    #[arg(long, env = "ANTHROPIC_BASE_URL")]
    base_url: Option<String>,
}

fn default_system_prompt() -> String {
    let cwd = std::env::current_dir()
        .map(|p| p.display().to_string())
        .unwrap_or_else(|_| "unknown".into());
    let date = chrono::Local::now().format("%Y-%m-%d");

    format!(
        r#"You are Claude, an AI assistant made by Anthropic. You are helping a user via a CLI tool.

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

/// Load CLAUDE.md files from global (~/.claude/CLAUDE.md), local (./CLAUDE.md),
/// and project config (./.claude/CLAUDE.md). Returns None if none exist.
fn load_claude_md() -> Option<String> {
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
/// Returns None if not in a git repository.
fn git_context() -> Option<String> {
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

/// Build the system prompt as structured blocks with cache control.
fn build_system_prompt(custom: Option<&str>) -> Vec<SystemBlock> {
    if let Some(custom) = custom {
        return vec![SystemBlock::text(custom)];
    }

    let mut blocks = Vec::new();

    // Block 1: Static system prompt (cached — rarely changes)
    blocks.push(SystemBlock::cached(default_system_prompt()));

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

#[tokio::main]
async fn main() -> Result<()> {
    // Ensure full backtraces on panic (unless user explicitly overrides)
    if std::env::var("RUST_BACKTRACE").is_err() {
        unsafe { std::env::set_var("RUST_BACKTRACE", "full") };
    }

    // Initialize tracing
    // Log to ~/.chlodwig-rs/debug_YYYY-MM-DD_HH-MM-SS.log
    let debug_log_path = chlodwig_core::timestamped_log_path("debug");
    let log_file = std::fs::File::create(&debug_log_path)
        .expect("Failed to create log file");

    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive("chlodwig_core=debug".parse().unwrap())
                .add_directive("chlodwig_api=debug".parse().unwrap())
                .add_directive("chlodwig_tools=debug".parse().unwrap())
                .add_directive("chlodwig_tui=debug".parse().unwrap())
                .add_directive("hyper=warn".parse().unwrap())
                .add_directive("reqwest=warn".parse().unwrap()),
        )
        .with_target(true)
        .with_ansi(false)
        .with_writer(std::sync::Mutex::new(log_file))
        .init();

    tracing::info!("chlodwig-rs starting, log at {:?}", debug_log_path);

    let cli = Cli::parse();

    let mut client = AnthropicClient::new(cli.api_key.clone());
    if let Some(ref base_url) = cli.base_url {
        client = client.with_base_url(base_url.clone());
    }

    let tools = chlodwig_tools::builtin_tools();

    let system_prompt = build_system_prompt(cli.system_prompt.as_deref());

    tracing::info!(
        "System prompt: {} blocks, {} total chars",
        system_prompt.len(),
        system_prompt.iter().map(|b| b.text.len()).sum::<usize>()
    );

    let state = ConversationState {
        messages: Vec::new(),
        model: cli.model.clone(),
        system_prompt,
        max_tokens: cli.max_tokens,
        tools,
        tool_context: ToolContext {
            working_directory: std::env::current_dir()?,
            timeout: Duration::from_secs(120),
        },
    };

    // Resume previous session if --resume flag is set
    let (state, initial_constants) = if cli.resume {
        match chlodwig_core::load_latest_session() {
            Ok(Some(snapshot)) => {
                let msg_count = snapshot.messages.len();
                tracing::info!("Resuming session with {msg_count} messages");
                eprintln!(
                    "\x1b[32m✓ Resumed session ({msg_count} messages, saved at {})\x1b[0m",
                    snapshot.saved_at
                );
                let constants = snapshot.constants.clone();
                let state = ConversationState {
                    messages: snapshot.messages,
                    // Use current CLI settings (model, tools, etc.) not the saved ones,
                    // because tools/system prompt may have changed between sessions.
                    ..state
                };
                (state, constants)
            }
            Ok(None) => {
                eprintln!("\x1b[33mNo saved session found — starting fresh.\x1b[0m");
                (state, None)
            }
            Err(e) => {
                eprintln!("\x1b[31mFailed to load session: {e} — starting fresh.\x1b[0m");
                (state, None)
            }
        }
    } else {
        (state, None)
    };

    if let Some(ref prompt) = cli.print_mode {
        run_headless(state, &client, &cli, prompt).await
    } else {
        chlodwig_tui::run_tui_with_permissions(state, std::sync::Arc::new(client), cli.dangerously_skip_permissions, initial_constants).await
    }
}

async fn run_headless(
    mut state: ConversationState,
    api_client: &AnthropicClient,
    cli: &Cli,
    prompt: &str,
) -> Result<()> {
    // Add the user message
    state.messages.push(Message {
        role: Role::User,
        content: vec![ContentBlock::Text {
            text: prompt.to_string(),
        }],
    });

    let (event_tx, mut event_rx) = mpsc::unbounded_channel();

    let permission: Box<dyn PermissionPrompter> = if cli.dangerously_skip_permissions {
        Box::new(AutoApprovePrompter)
    } else {
        Box::new(StdioPermissionPrompter::new())
    };

    // Run conversation loop
    let loop_result = {
        let tx = event_tx.clone();
        let permission_ref = permission.as_ref();

        // Process events in a separate task
        let event_handle = tokio::spawn(async move {
            while let Some(event) = event_rx.recv().await {
                match event {
                    ConversationEvent::TextDelta(text) => {
                        print!("{text}");
                        std::io::stdout().flush().ok();
                    }
                    ConversationEvent::ToolUseStart { name, input, .. } => {
                        eprintln!("\n\x1b[33m── Tool: {name} ──\x1b[0m");
                        if let Ok(pretty) = serde_json::to_string_pretty(&input) {
                            for line in pretty.lines().take(10) {
                                eprintln!("  \x1b[90m{line}\x1b[0m");
                            }
                        }
                    }
                    ConversationEvent::ToolResult {
                        is_error, output, ..
                    } => {
                        let (prefix, color) = if is_error {
                            ("ERROR", "\x1b[31m")
                        } else {
                            ("OK", "\x1b[32m")
                        };
                        eprintln!("{color}── [{prefix}] ──\x1b[0m");
                        match &output {
                            ToolResultContent::Text(t) => {
                                for line in t.lines().take(5) {
                                    eprintln!("  \x1b[90m{line}\x1b[0m");
                                }
                                if t.lines().count() > 5 {
                                    eprintln!("  \x1b[90m... ({} more lines)\x1b[0m", t.lines().count() - 5);
                                }
                            }
                            _ => {}
                        }
                    }
                    ConversationEvent::ThinkingDelta(_) => {
                        // Silently consume thinking in headless mode
                    }
                    ConversationEvent::TurnComplete => break,
                    ConversationEvent::Error(e) => {
                        eprintln!("\n\x1b[31mError: {e}\x1b[0m");
                        break;
                    }
                    _ => {}
                }
            }
        });

        let result =
            chlodwig_core::run_turn(&mut state, api_client, permission_ref, &tx).await;

        drop(tx); // close the channel so the event handler finishes
        event_handle.await?;
        result
    };

    println!(); // final newline

    // Auto-save session after headless turn
    let started_at = chrono::Local::now().to_rfc3339();
    let snapshot = SessionSnapshot {
        saved_at: started_at.clone(),
        started_at,
        model: state.model.clone(),
        messages: state.messages.clone(),
        system_prompt: state.system_prompt.clone(),
        constants: None, // headless mode doesn't have editable constants
    };
    if let Err(e) = chlodwig_core::save_session(&snapshot) {
        eprintln!("\x1b[33mWarning: failed to save session: {e}\x1b[0m");
    }

    if let Err(e) = loop_result {
        eprintln!("\x1b[31mConversation error: {e}\x1b[0m");
        std::process::exit(1);
    }

    Ok(())
}

/// Headless permission prompter that reads y/n from stdin.
struct StdioPermissionPrompter {
    always_allowed: std::sync::Mutex<std::collections::HashSet<String>>,
}

impl StdioPermissionPrompter {
    fn new() -> Self {
        Self {
            always_allowed: std::sync::Mutex::new(std::collections::HashSet::new()),
        }
    }
}

#[async_trait::async_trait]
impl PermissionPrompter for StdioPermissionPrompter {
    async fn request_permission(
        &self,
        tool_name: &str,
        input: &serde_json::Value,
    ) -> PermissionDecision {
        if self.always_allowed.lock().unwrap().contains(tool_name) {
            return PermissionDecision::Allow;
        }

        let name = tool_name.to_string();
        let input_str = serde_json::to_string_pretty(input).unwrap_or_default();

        tokio::task::spawn_blocking(move || {
            eprintln!("\n\x1b[33m⚠ Tool call: {name}\x1b[0m");
            eprintln!("{input_str}");
            eprint!("\x1b[1mAllow? [y/n/a(lways)]: \x1b[0m");
            std::io::stderr().flush().ok();

            let mut buf = String::new();
            std::io::stdin().read_line(&mut buf).ok();
            match buf.trim().to_lowercase().as_str() {
                "y" | "yes" => PermissionDecision::Allow,
                "a" | "always" => PermissionDecision::AllowAlways,
                _ => PermissionDecision::Deny,
            }
        })
        .await
        .unwrap_or(PermissionDecision::Deny)
    }
}
