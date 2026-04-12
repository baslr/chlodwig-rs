//! Bash tool — execute shell commands.

use async_trait::async_trait;
use chlodwig_core::{Tool, ToolContext, ToolDefinition, ToolError, ToolOutput, ToolResultContent};
use serde::Deserialize;
use std::time::Duration;

pub struct BashTool;

#[derive(Deserialize)]
struct BashInput {
    command: String,
    timeout: Option<u64>,
}

#[async_trait]
impl Tool for BashTool {
    fn definition(&self) -> ToolDefinition {
        ToolDefinition {
            name: "Bash".into(),
            description: "Execute a bash command and return stdout/stderr.".into(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "command": {
                        "type": "string",
                        "description": "The bash command to execute"
                    },
                    "timeout": {
                        "type": "integer",
                        "description": "Timeout in milliseconds (max 600000)"
                    }
                },
                "required": ["command"]
            }),
        }
    }

    async fn call(
        &self,
        input: serde_json::Value,
        ctx: &ToolContext,
    ) -> Result<ToolOutput, ToolError> {
        let input: BashInput =
            serde_json::from_value(input).map_err(|e| ToolError::InvalidInput(e.to_string()))?;

        let timeout = Duration::from_millis(input.timeout.unwrap_or(120_000).min(600_000));

        // Wrap in `script` to provide a PTY so programs emit ANSI colors.
        // `script` allocates a pseudo-terminal, making isatty(stdout) return true
        // for the child process. This causes git, ls, grep etc. to output colors.
        //
        // macOS syntax: script -q /dev/null <command...>
        // Linux syntax: script -qc '<command>' /dev/null
        let mut cmd = tokio::process::Command::new("script");
        if cfg!(target_os = "macos") {
            cmd.arg("-q")
                .arg("/dev/null")
                .arg("bash")
                .arg("-c")
                .arg(&input.command);
        } else {
            // Linux: script -qc 'bash -c "..."' /dev/null
            // Use bash -c with the raw command; script -c takes a single string
            cmd.arg("-q")
                .arg("-c")
                .arg(format!("bash -c '{}'", input.command.replace('\'', "'\\''")))
                .arg("/dev/null");
        }
        cmd.current_dir(&ctx.working_directory)
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped());

        let result = tokio::time::timeout(timeout, cmd.output()).await;

        match result {
            Ok(Ok(output)) => {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let stderr = String::from_utf8_lossy(&output.stderr);
                let exit_code = output.status.code().unwrap_or(-1);

                let mut text = String::new();
                if !stdout.is_empty() {
                    text.push_str(&stdout);
                }
                if !stderr.is_empty() {
                    if !text.is_empty() {
                        text.push('\n');
                    }
                    text.push_str("STDERR:\n");
                    text.push_str(&stderr);
                }
                if text.is_empty() {
                    text = format!("(exit code: {exit_code})");
                }

                // Truncate very long output (safe for multi-byte UTF-8)
                crate::util::safe_truncate(&mut text, 100_000, "\n... (output truncated)");

                Ok(ToolOutput {
                    content: ToolResultContent::Text(text),
                    is_error: !output.status.success(),
                })
            }
            Ok(Err(e)) => Err(ToolError::ExecutionFailed(e.to_string())),
            Err(_) => Err(ToolError::Timeout(timeout)),
        }
    }

    fn is_concurrent(&self) -> bool {
        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_ctx() -> ToolContext {
        ToolContext {
            working_directory: std::env::temp_dir(),
            timeout: Duration::from_secs(30),
        }
    }

    #[tokio::test]
    async fn test_echo() {
        let tool = BashTool;
        let output = tool
            .call(
                serde_json::json!({"command": "echo hello world"}),
                &test_ctx(),
            )
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => assert!(t.contains("hello world")),
            _ => panic!("Expected text"),
        }
        assert!(!output.is_error);
    }

    #[tokio::test]
    async fn test_exit_code() {
        let tool = BashTool;
        let output = tool
            .call(
                serde_json::json!({"command": "exit 1"}),
                &test_ctx(),
            )
            .await
            .unwrap();
        assert!(output.is_error);
    }

    #[tokio::test]
    async fn test_stderr() {
        let tool = BashTool;
        let output = tool
            .call(
                serde_json::json!({"command": "echo error >&2"}),
                &test_ctx(),
            )
            .await
            .unwrap();

        // With PTY via `script`, stderr is merged into stdout through the
        // pseudo-terminal. The text still appears in the output.
        match &output.content {
            ToolResultContent::Text(t) => assert!(
                t.contains("error"),
                "Output should contain stderr text 'error', got: {t:?}"
            ),
            _ => panic!("Expected text"),
        }
    }

    #[tokio::test]
    async fn test_timeout() {
        let tool = BashTool;
        let result = tool
            .call(
                serde_json::json!({"command": "sleep 10", "timeout": 100}),
                &test_ctx(),
            )
            .await;

        assert!(matches!(result, Err(ToolError::Timeout(_))));
    }

    #[tokio::test]
    async fn test_pty_provides_isatty() {
        // Verify that our execution environment makes isatty(stdout) return true.
        // Programs use isatty() to decide whether to output ANSI colors.
        // We wrap execution in `script` to provide a PTY, so this should pass.
        let tool = BashTool;
        let output = tool
            .call(
                serde_json::json!({"command": "test -t 1 && echo TTY_YES || echo TTY_NO"}),
                &test_ctx(),
            )
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => {
                assert!(
                    t.contains("TTY_YES"),
                    "stdout should be a TTY (isatty=true), got: {:?}",
                    t.trim()
                );
            }
            _ => panic!("Expected text"),
        }
    }

    #[tokio::test]
    async fn test_working_directory() {
        let tool = BashTool;
        let ctx = ToolContext {
            working_directory: std::env::temp_dir(),
            timeout: Duration::from_secs(30),
        };
        let output = tool
            .call(serde_json::json!({"command": "pwd"}), &ctx)
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => {
                // On macOS /tmp is a symlink to /private/tmp
                let expected = std::env::temp_dir()
                    .canonicalize()
                    .unwrap()
                    .display()
                    .to_string();
                assert!(t.trim().contains(&expected) || expected.contains(t.trim()));
            }
            _ => panic!("Expected text"),
        }
    }
}
