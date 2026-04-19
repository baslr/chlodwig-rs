//! Chlodwig CLI — binary entry point.

use anyhow::Result;
use clap::Parser;
use chlodwig_api::AnthropicClient;
use chlodwig_core::{
    AutoApprovePrompter, ContentBlock, ConversationEvent, ConversationState, Message,
    PermissionDecision, PermissionPrompter, Role, ToolContext,
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

    /// Model to use (defaults to env CHLODWIG_MODEL, config.json, or github/claude-opus-4.6)
    #[arg(long)]
    model: Option<String>,

    /// Max tokens for response
    #[arg(long)]
    max_tokens: Option<u32>,

    /// System prompt override
    #[arg(long)]
    system_prompt: Option<String>,

    /// API key (defaults to ANTHROPIC_API_KEY env var or config.json)
    #[arg(long, hide_env_values = true)]
    api_key: Option<String>,

    /// Skip tool permission prompts (auto-approve all)
    #[arg(long, default_value_t = true)]
    dangerously_skip_permissions: bool,

    /// Resume the last saved session
    #[arg(long, short = 'r')]
    resume: bool,

    /// API base URL override
    #[arg(long)]
    base_url: Option<String>,
}

// System prompt, CLAUDE.md loading, and git context are in chlodwig_core::system_prompt.

#[tokio::main]
async fn main() -> Result<()> {
    // Ensure full backtraces on panic (unless user explicitly overrides)
    if std::env::var("RUST_BACKTRACE").is_err() {
        unsafe { std::env::set_var("RUST_BACKTRACE", "full") };
    }

    // Extend PATH with well-known directories (MacPorts, Homebrew, Cargo, etc.)
    // so child processes (git, rg, cargo, ...) can be found in restricted
    // environments (e.g. macOS GUI launch, minimal login shells).
    chlodwig_core::enrich_path();

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

    // Resolve configuration: config.json → env vars → CLI args
    let config = chlodwig_core::resolve_config(chlodwig_core::ConfigOverrides {
        api_key: cli.api_key.clone(),
        model: cli.model.clone(),
        base_url: cli.base_url.clone(),
        max_tokens: cli.max_tokens,
    })
    .unwrap_or_else(|msg| {
        eprintln!("{msg}");
        std::process::exit(1);
    });

    let mut client = AnthropicClient::new(config.api_key);
    if let Some(ref base_url) = config.base_url {
        client = client.with_base_url(base_url.clone());
    }

    let tools = chlodwig_tools::builtin_tools();

    // Resolve the working directory once at startup. The CLI has no concept
    // of multiple tabs, but routing both system_prompt and ToolContext through
    // an explicit cwd keeps the core library free of process-CWD reads
    // (Stage 0.4 of MULTIWINDOW_TABS.md).
    let cwd = std::env::current_dir()?;

    let system_prompt = chlodwig_core::build_system_prompt_with_cwd(
        cli.system_prompt.as_deref(),
        chlodwig_core::UiContext::Cli,
        &cwd,
    );

    tracing::info!(
        "System prompt: {} blocks, {} total chars",
        system_prompt.len(),
        system_prompt.iter().map(|b| b.text.len()).sum::<usize>()
    );

    let state = ConversationState {
        messages: Vec::new(),
        model: config.model,
        system_prompt,
        max_tokens: config.max_tokens,
        tools,
        tool_context: ToolContext {
            working_directory: cwd,
            timeout: Duration::from_secs(120),
        },
        stop_requested: chlodwig_core::new_stop_flag(),
    };

    // Resume previous session if --resume flag is set
    let (state, initial_constants, initial_stats) = if cli.resume {
        match chlodwig_core::load_latest_session() {
            Ok(Some(snapshot)) => {
                let msg_count = snapshot.messages.len();
                tracing::info!("Resuming session with {msg_count} messages");
                eprintln!(
                    "\x1b[32m✓ Resumed session ({msg_count} messages, saved at {})\x1b[0m",
                    snapshot.saved_at
                );
                let constants = snapshot.constants.clone();
                let stats = snapshot.stats.clone();
                let state = ConversationState {
                    messages: snapshot.messages,
                    // Use current CLI settings (model, tools, etc.) not the saved ones,
                    // because tools/system prompt may have changed between sessions.
                    ..state
                };
                (state, constants, stats)
            }
            Ok(None) => {
                eprintln!("\x1b[33mNo saved session found — starting fresh.\x1b[0m");
                (state, None, None)
            }
            Err(e) => {
                eprintln!("\x1b[31mFailed to load session: {e} — starting fresh.\x1b[0m");
                (state, None, None)
            }
        }
    } else {
        (state, None, None)
    };

    if let Some(ref prompt) = cli.print_mode {
        run_headless(state, &client, &cli, prompt).await
    } else {
        chlodwig_tui::run_tui_with_permissions(state, std::sync::Arc::new(client), cli.dangerously_skip_permissions, initial_constants, initial_stats).await
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
    let snapshot = chlodwig_core::build_snapshot(&state, started_at, vec![], None, None, None);
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
