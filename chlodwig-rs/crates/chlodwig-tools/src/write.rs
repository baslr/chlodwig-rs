//! Write tool — write entire file contents.

use async_trait::async_trait;
use chlodwig_core::{Tool, ToolContext, ToolDefinition, ToolError, ToolOutput, ToolResultContent};
use serde::Deserialize;

pub struct WriteTool;

#[derive(Deserialize)]
struct WriteInput {
    file_path: String,
    content: String,
}

#[async_trait]
impl Tool for WriteTool {
    fn definition(&self) -> ToolDefinition {
        ToolDefinition {
            name: "Write".into(),
            description: "Write content to a file (creates parent directories).".into(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "Absolute path to write to"
                    },
                    "content": {
                        "type": "string",
                        "description": "The full file content"
                    }
                },
                "required": ["file_path", "content"]
            }),
        }
    }

    async fn call(
        &self,
        input: serde_json::Value,
        ctx: &ToolContext,
    ) -> Result<ToolOutput, ToolError> {
        let input: WriteInput =
            serde_json::from_value(input).map_err(|e| ToolError::InvalidInput(e.to_string()))?;

        let path = crate::util::resolve_path(ctx, &input.file_path);
        if let Some(parent) = path.parent() {
            tokio::fs::create_dir_all(parent).await?;
        }

        tokio::fs::write(&path, &input.content).await?;

        let line_count = input.content.lines().count();
        let byte_count = input.content.len();

        Ok(ToolOutput {
            content: ToolResultContent::Text(format!(
                "Wrote {} lines ({} bytes) to {}",
                line_count, byte_count, input.file_path
            )),
            is_error: false,
        })
    }

    fn is_concurrent(&self) -> bool {
        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn test_ctx() -> ToolContext {
        ToolContext::default()
    }

    #[tokio::test]
    async fn test_write_and_verify() {
        let dir = TempDir::new().unwrap();
        let path = dir.path().join("test.txt");

        let tool = WriteTool;
        let output = tool
            .call(
                serde_json::json!({
                    "file_path": path.to_str().unwrap(),
                    "content": "hello\nworld\n"
                }),
                &test_ctx(),
            )
            .await
            .unwrap();

        assert!(!output.is_error);
        match &output.content {
            ToolResultContent::Text(t) => {
                assert!(t.contains("2 lines"));
                assert!(t.contains("12 bytes"));
            }
            _ => panic!("Expected text"),
        }

        let content = std::fs::read_to_string(&path).unwrap();
        assert_eq!(content, "hello\nworld\n");
    }

    #[tokio::test]
    async fn test_write_creates_dirs() {
        let dir = TempDir::new().unwrap();
        let path = dir.path().join("a/b/c/deep.txt");

        let tool = WriteTool;
        let output = tool
            .call(
                serde_json::json!({
                    "file_path": path.to_str().unwrap(),
                    "content": "deep content"
                }),
                &test_ctx(),
            )
            .await
            .unwrap();

        assert!(!output.is_error);
        assert!(path.exists());
        assert_eq!(std::fs::read_to_string(&path).unwrap(), "deep content");
    }

    #[tokio::test]
    async fn test_write_overwrites() {
        let dir = TempDir::new().unwrap();
        let path = dir.path().join("overwrite.txt");
        std::fs::write(&path, "old content").unwrap();

        let tool = WriteTool;
        tool.call(
            serde_json::json!({
                "file_path": path.to_str().unwrap(),
                "content": "new content"
            }),
            &test_ctx(),
        )
        .await
        .unwrap();

        assert_eq!(std::fs::read_to_string(&path).unwrap(), "new content");
    }

    /// Relative file_path must resolve against `ctx.working_directory`
    /// (per-tab CWD isolation, see MULTIWINDOW_TABS.md).
    #[tokio::test]
    async fn test_write_relative_path_uses_ctx_working_directory() {
        use std::time::Duration;

        let dir = TempDir::new().unwrap();
        let ctx = ToolContext {
            working_directory: dir.path().to_path_buf(),
            timeout: Duration::from_secs(10),
        };

        let tool = WriteTool;
        tool.call(
            serde_json::json!({
                "file_path": "subdir/out.txt",
                "content": "isolated"
            }),
            &ctx,
        )
        .await
        .unwrap();

        let expected = dir.path().join("subdir/out.txt");
        assert!(expected.exists(), "file should be in ctx cwd");
        assert_eq!(std::fs::read_to_string(&expected).unwrap(), "isolated");
    }

    /// Absolute file_path is unaffected by `ctx.working_directory`.
    #[tokio::test]
    async fn test_write_absolute_path_ignores_ctx_working_directory() {
        use std::time::Duration;

        let real_dir = TempDir::new().unwrap();
        let bogus_dir = TempDir::new().unwrap();
        let path = real_dir.path().join("absolute.txt");

        let ctx = ToolContext {
            working_directory: bogus_dir.path().to_path_buf(),
            timeout: Duration::from_secs(10),
        };

        let tool = WriteTool;
        tool.call(
            serde_json::json!({
                "file_path": path.to_str().unwrap(),
                "content": "absolute"
            }),
            &ctx,
        )
        .await
        .unwrap();

        assert!(path.exists());
        assert!(!bogus_dir.path().join("absolute.txt").exists());
    }
}
