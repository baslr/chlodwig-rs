//! Glob tool — find files matching glob patterns using ripgrep.

use async_trait::async_trait;
use chlodwig_core::{Tool, ToolContext, ToolDefinition, ToolError, ToolOutput, ToolResultContent};
use serde::Deserialize;
use std::path::Path;
use std::time::Duration;

/// Max number of results before truncation (matches JS original).
const MAX_GLOB_RESULTS: usize = 100;

/// Timeout for ripgrep execution.
pub(crate) const RG_TIMEOUT: Duration = Duration::from_secs(20);

pub struct GlobTool;

#[derive(Deserialize)]
struct GlobInput {
    pattern: String,
    path: Option<String>,
}

/// Shared helper: spawn ripgrep with given args, return stdout lines.
///
/// - Exit 0 → stdout lines
/// - Exit 1 → empty vec (no matches, not an error)
/// - Exit 2+ → ToolError::ExecutionFailed with stderr
/// - ENOENT → ToolError::ExecutionFailed("ripgrep (rg) not found")
/// - Timeout → ToolError::Timeout
pub(crate) async fn run_rg(
    args: &[String],
    cwd: &Path,
    timeout: Duration,
) -> Result<Vec<String>, ToolError> {
    let rg_path = find_rg()?;

    let result = tokio::time::timeout(
        timeout,
        tokio::process::Command::new(&rg_path)
            .args(args)
            .current_dir(cwd)
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .output(),
    )
    .await;

    match result {
        Ok(Ok(output)) => {
            let code = output.status.code().unwrap_or(-1);
            if code == 0 || code == 1 {
                // code 1 = no matches (normal for rg)
                let stdout = String::from_utf8_lossy(&output.stdout);
                let lines: Vec<String> = stdout
                    .lines()
                    .filter(|l| !l.is_empty())
                    .map(|l| l.to_string())
                    .collect();
                Ok(lines)
            } else {
                let stderr = String::from_utf8_lossy(&output.stderr);
                Err(ToolError::ExecutionFailed(format!(
                    "ripgrep exited with code {code}: {stderr}"
                )))
            }
        }
        Ok(Err(e)) => {
            if e.kind() == std::io::ErrorKind::NotFound {
                Err(ToolError::ExecutionFailed(
                    "ripgrep (rg) is required but not found in PATH. Install it with: brew install ripgrep".into(),
                ))
            } else {
                Err(ToolError::ExecutionFailed(e.to_string()))
            }
        }
        Err(_) => Err(ToolError::Timeout(timeout)),
    }
}

/// Find the ripgrep binary. Checks RG_PATH env, PATH, then known locations.
fn find_rg() -> Result<String, ToolError> {
    use std::process::Command;

    // Allow override via environment variable
    if let Ok(rg_path) = std::env::var("RG_PATH") {
        if Path::new(&rg_path).exists() {
            return Ok(rg_path);
        }
    }

    // Try 'rg' in PATH first (works if user has it installed)
    if let Ok(output) = Command::new("rg").arg("--version").output() {
        if output.status.success() {
            return Ok("rg".into());
        }
    }

    // Known fallback locations
    let home = std::env::var("HOME").unwrap_or_default();
    let candidates = [
        // Homebrew (macOS arm64 / x86_64)
        "/opt/homebrew/bin/rg".to_string(),
        "/usr/local/bin/rg".to_string(),
        // Linux package managers
        "/usr/bin/rg".to_string(),
        // Cargo install
        format!("{home}/.cargo/bin/rg"),
        // Bundled with Claude Code
        format!("{home}/.local/share/claude/rg"),
        // OpenAI Codex bundled ripgrep (macOS arm64)
        "/usr/local/lib/node_modules/@openai/codex/node_modules/@openai/codex-darwin-arm64/vendor/aarch64-apple-darwin/path/rg".to_string(),
    ];

    for candidate in &candidates {
        if Path::new(candidate).exists() {
            return Ok(candidate.clone());
        }
    }

    Err(ToolError::ExecutionFailed(
        "ripgrep (rg) is required but not found. Install it with: brew install ripgrep (or set RG_PATH)".into(),
    ))
}

/// Relativize a path against a base directory.
fn relativize(path: &str, base: &Path) -> String {
    let p = Path::new(path);
    if let Ok(rel) = p.strip_prefix(base) {
        rel.display().to_string()
    } else {
        path.to_string()
    }
}

#[async_trait]
impl Tool for GlobTool {
    fn definition(&self) -> ToolDefinition {
        ToolDefinition {
            name: "Glob".into(),
            description: concat!(
                "- Fast file pattern matching tool that works with any codebase size\n",
                "- Supports glob patterns like \"**/*.js\" or \"src/**/*.ts\"\n",
                "- Returns matching file paths sorted by modification time\n",
                "- Use this tool when you need to find files by name patterns\n",
                "- When you are doing an open ended search that may require multiple rounds of globbing and grepping, use the Agent tool instead",
            ).into(),
            input_schema: serde_json::json!({
                "type": "object",
                "required": ["pattern"],
                "properties": {
                    "pattern": {
                        "type": "string",
                        "description": "The glob pattern to match files against"
                    },
                    "path": {
                        "type": "string",
                        "description": "The directory to search in. If not specified, the current working directory will be used."
                    }
                }
            }),
        }
    }

    async fn call(
        &self,
        input: serde_json::Value,
        ctx: &ToolContext,
    ) -> Result<ToolOutput, ToolError> {
        let input: GlobInput =
            serde_json::from_value(input).map_err(|e| ToolError::InvalidInput(e.to_string()))?;

        let search_dir = if let Some(ref p) = input.path {
            let path = Path::new(p);
            if path.is_absolute() {
                path.to_path_buf()
            } else {
                ctx.working_directory.join(path)
            }
        } else {
            ctx.working_directory.clone()
        };

        if !search_dir.exists() {
            return Ok(ToolOutput {
                content: ToolResultContent::Text(format!(
                    "Error: directory does not exist: {}",
                    search_dir.display()
                )),
                is_error: true,
            });
        }

        let args: Vec<String> = vec![
            "--files".into(),
            "--glob".into(),
            input.pattern.clone(),
            "--sort=modified".into(),
            "--no-ignore".into(),
            "--hidden".into(),
        ];

        let lines = run_rg(&args, &search_dir, RG_TIMEOUT).await?;

        // Relativize paths
        let files: Vec<String> = lines
            .iter()
            .map(|l| relativize(l, &search_dir))
            .collect();

        if files.is_empty() {
            return Ok(ToolOutput {
                content: ToolResultContent::Text("No files found".into()),
                is_error: false,
            });
        }

        let truncated = files.len() > MAX_GLOB_RESULTS;
        let mut result: Vec<&str> = files.iter().take(MAX_GLOB_RESULTS).map(|s| s.as_str()).collect();

        if truncated {
            result.push("(Results are truncated. Consider using a more specific path or pattern.)");
        }

        Ok(ToolOutput {
            content: ToolResultContent::Text(result.join("\n")),
            is_error: false,
        })
    }

    fn is_concurrent(&self) -> bool {
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    fn test_ctx_with_dir(dir: &Path) -> ToolContext {
        ToolContext {
            working_directory: dir.to_path_buf(),
            timeout: Duration::from_secs(30),
        }
    }

    #[tokio::test]
    async fn test_run_rg_basic() {
        // rg --files in a temp dir with a file
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join("hello.txt"), "world").unwrap();

        let args: Vec<String> = vec!["--files".into()];
        let lines = run_rg(&args, dir.path(), Duration::from_secs(5))
            .await
            .unwrap();

        assert_eq!(lines.len(), 1);
        assert!(lines[0].contains("hello.txt"));
    }

    #[tokio::test]
    async fn test_run_rg_no_matches() {
        let dir = tempfile::tempdir().unwrap();
        // Empty dir — rg --files returns nothing (exit 1)
        let args: Vec<String> = vec![
            "--files".into(),
            "--glob".into(),
            "*.nonexistent".into(),
        ];
        let lines = run_rg(&args, dir.path(), Duration::from_secs(5))
            .await
            .unwrap();

        assert!(lines.is_empty());
    }

    #[tokio::test]
    async fn test_glob_find_rs_files() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join("main.rs"), "fn main() {}").unwrap();
        fs::write(dir.path().join("lib.rs"), "pub fn lib() {}").unwrap();
        fs::write(dir.path().join("readme.txt"), "hello").unwrap();
        fs::write(dir.path().join("notes.md"), "# Notes").unwrap();

        let tool = GlobTool;
        let output = tool
            .call(
                serde_json::json!({"pattern": "*.rs"}),
                &test_ctx_with_dir(dir.path()),
            )
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => {
                assert!(t.contains("main.rs"), "Should find main.rs, got: {t}");
                assert!(t.contains("lib.rs"), "Should find lib.rs, got: {t}");
                assert!(!t.contains("readme.txt"), "Should not find .txt files");
                assert!(!t.contains("notes.md"), "Should not find .md files");
            }
            _ => panic!("Expected text"),
        }
        assert!(!output.is_error);
    }

    #[tokio::test]
    async fn test_glob_recursive_pattern() {
        let dir = tempfile::tempdir().unwrap();
        let sub = dir.path().join("sub").join("deep");
        fs::create_dir_all(&sub).unwrap();
        fs::write(dir.path().join("top.txt"), "top").unwrap();
        fs::write(sub.join("nested.txt"), "nested").unwrap();

        let tool = GlobTool;
        let output = tool
            .call(
                serde_json::json!({"pattern": "**/*.txt"}),
                &test_ctx_with_dir(dir.path()),
            )
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => {
                assert!(t.contains("top.txt"), "Should find top.txt, got: {t}");
                assert!(
                    t.contains("nested.txt"),
                    "Should find nested.txt, got: {t}"
                );
            }
            _ => panic!("Expected text"),
        }
    }

    #[tokio::test]
    async fn test_glob_no_matches() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join("file.txt"), "hello").unwrap();

        let tool = GlobTool;
        let output = tool
            .call(
                serde_json::json!({"pattern": "*.xyz"}),
                &test_ctx_with_dir(dir.path()),
            )
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => {
                assert_eq!(t, "No files found");
            }
            _ => panic!("Expected text"),
        }
        assert!(!output.is_error);
    }

    #[tokio::test]
    async fn test_glob_custom_path() {
        let dir = tempfile::tempdir().unwrap();
        let sub = dir.path().join("subdir");
        fs::create_dir_all(&sub).unwrap();
        fs::write(sub.join("inner.rs"), "code").unwrap();
        fs::write(dir.path().join("outer.rs"), "code").unwrap();

        let tool = GlobTool;
        let output = tool
            .call(
                serde_json::json!({
                    "pattern": "*.rs",
                    "path": sub.display().to_string()
                }),
                &test_ctx_with_dir(dir.path()),
            )
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => {
                assert!(t.contains("inner.rs"), "Should find inner.rs, got: {t}");
                assert!(!t.contains("outer.rs"), "Should not find outer.rs");
            }
            _ => panic!("Expected text"),
        }
    }

    #[tokio::test]
    async fn test_glob_results_truncated() {
        let dir = tempfile::tempdir().unwrap();
        // Create 110 files — more than MAX_GLOB_RESULTS
        for i in 0..110 {
            fs::write(dir.path().join(format!("file_{i:03}.txt")), "data").unwrap();
        }

        let tool = GlobTool;
        let output = tool
            .call(
                serde_json::json!({"pattern": "*.txt"}),
                &test_ctx_with_dir(dir.path()),
            )
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => {
                assert!(
                    t.contains("truncated"),
                    "Should contain truncation notice, got: {t}"
                );
                // Count actual file lines (exclude the truncation notice)
                let file_lines = t.lines().filter(|l| !l.starts_with('(')).count();
                assert_eq!(
                    file_lines, MAX_GLOB_RESULTS,
                    "Should have exactly {MAX_GLOB_RESULTS} files"
                );
            }
            _ => panic!("Expected text"),
        }
    }

    #[tokio::test]
    async fn test_glob_invalid_directory() {
        let tool = GlobTool;
        let output = tool
            .call(
                serde_json::json!({
                    "pattern": "*.rs",
                    "path": "/nonexistent/path/that/does/not/exist"
                }),
                &ToolContext::default(),
            )
            .await
            .unwrap();

        assert!(output.is_error);
        match &output.content {
            ToolResultContent::Text(t) => {
                assert!(
                    t.contains("does not exist"),
                    "Should report directory not found, got: {t}"
                );
            }
            _ => panic!("Expected text"),
        }
    }
}
