//! Read tool — read file contents with line numbers.

use async_trait::async_trait;
use claude_core::{Tool, ToolContext, ToolDefinition, ToolError, ToolOutput, ToolResultContent};
use serde::Deserialize;

pub struct ReadTool;

#[derive(Deserialize)]
struct ReadInput {
    file_path: String,
    offset: Option<usize>,
    limit: Option<usize>,
}

#[async_trait]
impl Tool for ReadTool {
    fn definition(&self) -> ToolDefinition {
        ToolDefinition {
            name: "Read".into(),
            description: "Read file contents with line numbers (cat -n style).".into(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "Absolute path to the file"
                    },
                    "offset": {
                        "type": "integer",
                        "description": "Line number to start from (0-based)"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Max number of lines to read (default 2000)"
                    }
                },
                "required": ["file_path"]
            }),
        }
    }

    async fn call(
        &self,
        input: serde_json::Value,
        _ctx: &ToolContext,
    ) -> Result<ToolOutput, ToolError> {
        let input: ReadInput =
            serde_json::from_value(input).map_err(|e| ToolError::InvalidInput(e.to_string()))?;

        let content = tokio::fs::read_to_string(&input.file_path).await?;
        let lines: Vec<&str> = content.lines().collect();

        let offset = input.offset.unwrap_or(0);
        let limit = input.limit.unwrap_or(2000);
        let total_lines = lines.len();

        let mut output = String::new();
        for (i, line) in lines.iter().enumerate().skip(offset).take(limit) {
            use std::fmt::Write;
            writeln!(output, "{:>6}\t{}", i + 1, line).unwrap();
        }

        if output.is_empty() {
            if total_lines == 0 {
                output = "(empty file)".into();
            } else {
                output = format!(
                    "(no lines in range: file has {} lines, requested offset {})",
                    total_lines, offset
                );
            }
        }

        Ok(ToolOutput {
            content: ToolResultContent::Text(output),
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
    use std::io::Write;
    use tempfile::NamedTempFile;

    fn test_ctx() -> ToolContext {
        ToolContext::default()
    }

    #[tokio::test]
    async fn test_read_with_line_numbers() {
        let mut file = NamedTempFile::new().unwrap();
        writeln!(file, "line one").unwrap();
        writeln!(file, "line two").unwrap();
        writeln!(file, "line three").unwrap();

        let tool = ReadTool;
        let output = tool
            .call(
                serde_json::json!({"file_path": file.path().to_str().unwrap()}),
                &test_ctx(),
            )
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => {
                assert!(t.contains("1\tline one"));
                assert!(t.contains("2\tline two"));
                assert!(t.contains("3\tline three"));
            }
            _ => panic!("Expected text"),
        }
        assert!(!output.is_error);
    }

    #[tokio::test]
    async fn test_read_with_offset_and_limit() {
        let mut file = NamedTempFile::new().unwrap();
        for i in 1..=10 {
            writeln!(file, "line {i}").unwrap();
        }

        let tool = ReadTool;
        let output = tool
            .call(
                serde_json::json!({
                    "file_path": file.path().to_str().unwrap(),
                    "offset": 2,
                    "limit": 3
                }),
                &test_ctx(),
            )
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => {
                assert!(t.contains("3\tline 3"));
                assert!(t.contains("4\tline 4"));
                assert!(t.contains("5\tline 5"));
                assert!(!t.contains("2\tline 2"));
                assert!(!t.contains("6\tline 6"));
            }
            _ => panic!("Expected text"),
        }
    }

    #[tokio::test]
    async fn test_read_nonexistent_file() {
        let tool = ReadTool;
        let result = tool
            .call(
                serde_json::json!({"file_path": "/nonexistent/file.txt"}),
                &test_ctx(),
            )
            .await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_read_empty_file() {
        let file = NamedTempFile::new().unwrap();

        let tool = ReadTool;
        let output = tool
            .call(
                serde_json::json!({"file_path": file.path().to_str().unwrap()}),
                &test_ctx(),
            )
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => assert!(t.contains("empty file")),
            _ => panic!("Expected text"),
        }
    }
}
