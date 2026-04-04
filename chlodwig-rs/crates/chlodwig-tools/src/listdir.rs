//! ListDir tool — list directory contents using `ls -la`.

use async_trait::async_trait;
use chlodwig_core::{Tool, ToolContext, ToolDefinition, ToolError, ToolOutput, ToolResultContent};
use serde::Deserialize;
use std::path::Path;
use std::time::Duration;

/// Timeout for ls execution.
const LS_TIMEOUT: Duration = Duration::from_secs(10);

pub struct ListDirTool;

#[derive(Deserialize)]
struct ListDirInput {
    path: Option<String>,
}

#[async_trait]
impl Tool for ListDirTool {
    fn definition(&self) -> ToolDefinition {
        ToolDefinition {
            name: "ListDir".into(),
            description: concat!(
                "List the contents of a directory.\n",
                "- Returns file names, sizes, permissions and modification times\n",
                "- If no path is given, lists the current working directory\n",
                "- For finding files by pattern, prefer the Glob tool instead",
            )
            .into(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "The directory to list. Defaults to the current working directory."
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
        let input: ListDirInput =
            serde_json::from_value(input).map_err(|e| ToolError::InvalidInput(e.to_string()))?;

        let target_dir = if let Some(ref p) = input.path {
            let path = Path::new(p);
            if path.is_absolute() {
                path.to_path_buf()
            } else {
                ctx.working_directory.join(path)
            }
        } else {
            ctx.working_directory.clone()
        };

        if !target_dir.exists() {
            return Ok(ToolOutput {
                content: ToolResultContent::Text(format!(
                    "Error: directory does not exist: {}",
                    target_dir.display()
                )),
                is_error: true,
            });
        }

        if !target_dir.is_dir() {
            return Ok(ToolOutput {
                content: ToolResultContent::Text(format!(
                    "Error: not a directory: {}",
                    target_dir.display()
                )),
                is_error: true,
            });
        }

        let result = tokio::time::timeout(
            LS_TIMEOUT,
            tokio::process::Command::new("ls")
                .arg("-la")
                .arg(&target_dir)
                .stdout(std::process::Stdio::piped())
                .stderr(std::process::Stdio::piped())
                .output(),
        )
        .await;

        match result {
            Ok(Ok(output)) => {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let stderr = String::from_utf8_lossy(&output.stderr);

                let mut text = stdout.to_string();
                if !stderr.is_empty() {
                    if !text.is_empty() {
                        text.push('\n');
                    }
                    text.push_str("STDERR:\n");
                    text.push_str(&stderr);
                }
                if text.is_empty() {
                    text = "(empty directory)".into();
                }

                // Truncate very long output
                if text.len() > 100_000 {
                    text.truncate(100_000);
                    text.push_str("\n... (output truncated)");
                }

                Ok(ToolOutput {
                    content: ToolResultContent::Text(text),
                    is_error: !output.status.success(),
                })
            }
            Ok(Err(e)) => Err(ToolError::ExecutionFailed(e.to_string())),
            Err(_) => Err(ToolError::Timeout(LS_TIMEOUT)),
        }
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
    async fn test_listdir_default_working_directory() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join("hello.txt"), "world").unwrap();
        fs::write(dir.path().join("test.rs"), "fn main() {}").unwrap();

        let tool = ListDirTool;
        let output = tool
            .call(serde_json::json!({}), &test_ctx_with_dir(dir.path()))
            .await
            .unwrap();

        assert!(!output.is_error);
        match &output.content {
            ToolResultContent::Text(t) => {
                assert!(t.contains("hello.txt"), "Should list hello.txt, got: {t}");
                assert!(t.contains("test.rs"), "Should list test.rs, got: {t}");
            }
            _ => panic!("Expected text"),
        }
    }

    #[tokio::test]
    async fn test_listdir_with_explicit_path() {
        let dir = tempfile::tempdir().unwrap();
        let sub = dir.path().join("subdir");
        fs::create_dir_all(&sub).unwrap();
        fs::write(sub.join("inner.rs"), "code").unwrap();
        fs::write(dir.path().join("outer.rs"), "code").unwrap();

        let tool = ListDirTool;
        let output = tool
            .call(
                serde_json::json!({"path": sub.display().to_string()}),
                &test_ctx_with_dir(dir.path()),
            )
            .await
            .unwrap();

        assert!(!output.is_error);
        match &output.content {
            ToolResultContent::Text(t) => {
                assert!(t.contains("inner.rs"), "Should list inner.rs, got: {t}");
                assert!(!t.contains("outer.rs"), "Should not list outer.rs, got: {t}");
            }
            _ => panic!("Expected text"),
        }
    }

    #[tokio::test]
    async fn test_listdir_relative_path() {
        let dir = tempfile::tempdir().unwrap();
        let sub = dir.path().join("mydir");
        fs::create_dir_all(&sub).unwrap();
        fs::write(sub.join("file.txt"), "data").unwrap();

        let tool = ListDirTool;
        let output = tool
            .call(
                serde_json::json!({"path": "mydir"}),
                &test_ctx_with_dir(dir.path()),
            )
            .await
            .unwrap();

        assert!(!output.is_error);
        match &output.content {
            ToolResultContent::Text(t) => {
                assert!(t.contains("file.txt"), "Should list file.txt, got: {t}");
            }
            _ => panic!("Expected text"),
        }
    }

    #[tokio::test]
    async fn test_listdir_nonexistent_directory() {
        let tool = ListDirTool;
        let output = tool
            .call(
                serde_json::json!({"path": "/nonexistent/path/that/does/not/exist"}),
                &ToolContext::default(),
            )
            .await
            .unwrap();

        assert!(output.is_error);
        match &output.content {
            ToolResultContent::Text(t) => {
                assert!(
                    t.contains("does not exist"),
                    "Should report dir not found, got: {t}"
                );
            }
            _ => panic!("Expected text"),
        }
    }

    #[tokio::test]
    async fn test_listdir_on_file_not_directory() {
        let dir = tempfile::tempdir().unwrap();
        let file = dir.path().join("not_a_dir.txt");
        fs::write(&file, "I am a file").unwrap();

        let tool = ListDirTool;
        let output = tool
            .call(
                serde_json::json!({"path": file.display().to_string()}),
                &test_ctx_with_dir(dir.path()),
            )
            .await
            .unwrap();

        assert!(output.is_error);
        match &output.content {
            ToolResultContent::Text(t) => {
                assert!(
                    t.contains("not a directory"),
                    "Should report not a directory, got: {t}"
                );
            }
            _ => panic!("Expected text"),
        }
    }

    #[tokio::test]
    async fn test_listdir_shows_hidden_files() {
        // ls -la shows hidden files (dotfiles)
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join(".hidden"), "secret").unwrap();
        fs::write(dir.path().join("visible.txt"), "hello").unwrap();

        let tool = ListDirTool;
        let output = tool
            .call(serde_json::json!({}), &test_ctx_with_dir(dir.path()))
            .await
            .unwrap();

        assert!(!output.is_error);
        match &output.content {
            ToolResultContent::Text(t) => {
                assert!(t.contains(".hidden"), "Should show hidden file, got: {t}");
                assert!(t.contains("visible.txt"), "Should show visible file, got: {t}");
            }
            _ => panic!("Expected text"),
        }
    }
}
