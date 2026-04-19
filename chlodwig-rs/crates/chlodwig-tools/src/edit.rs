//! Edit tool — find-and-replace in files.

use async_trait::async_trait;
use chlodwig_core::{Tool, ToolContext, ToolDefinition, ToolError, ToolOutput, ToolResultContent};
use serde::Deserialize;

pub struct EditTool;

#[derive(Deserialize)]
struct EditInput {
    file_path: String,
    old_string: String,
    new_string: String,
    #[serde(default)]
    replace_all: bool,
}

#[async_trait]
impl Tool for EditTool {
    fn definition(&self) -> ToolDefinition {
        ToolDefinition {
            name: "Edit".into(),
            description:
                "Replace a specific string in a file. The old_string must be unique unless replace_all is true."
                    .into(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "Absolute path to the file"
                    },
                    "old_string": {
                        "type": "string",
                        "description": "The exact string to find"
                    },
                    "new_string": {
                        "type": "string",
                        "description": "The replacement string"
                    },
                    "replace_all": {
                        "type": "boolean",
                        "description": "Replace all occurrences (default false)",
                        "default": false
                    }
                },
                "required": ["file_path", "old_string", "new_string"]
            }),
        }
    }

    async fn call(
        &self,
        input: serde_json::Value,
        ctx: &ToolContext,
    ) -> Result<ToolOutput, ToolError> {
        let input: EditInput =
            serde_json::from_value(input).map_err(|e| ToolError::InvalidInput(e.to_string()))?;

        let path = crate::util::resolve_path(ctx, &input.file_path);
        let content = tokio::fs::read_to_string(&path).await?;

        let matches: Vec<_> = content.match_indices(&input.old_string).collect();

        if matches.is_empty() {
            return Ok(ToolOutput {
                content: ToolResultContent::Text(
                    "Error: old_string not found in file. Make sure the string matches exactly, including whitespace and indentation.".into(),
                ),
                is_error: true,
            });
        }

        if matches.len() > 1 && !input.replace_all {
            return Ok(ToolOutput {
                content: ToolResultContent::Text(format!(
                    "Error: old_string found {} times — must be unique. Provide more surrounding context to make the match unique, or set replace_all to true.",
                    matches.len()
                )),
                is_error: true,
            });
        }

        let new_content = if input.replace_all {
            content.replace(&input.old_string, &input.new_string)
        } else {
            content.replacen(&input.old_string, &input.new_string, 1)
        };

        tokio::fs::write(&path, &new_content).await?;

        let replaced_count = if input.replace_all { matches.len() } else { 1 };

        Ok(ToolOutput {
            content: ToolResultContent::Text(format!(
                "Edited {}: replaced {} occurrence(s)",
                input.file_path, replaced_count
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
    use std::io::Write;
    use tempfile::NamedTempFile;

    fn test_ctx() -> ToolContext {
        ToolContext::default()
    }

    #[tokio::test]
    async fn test_edit_unique_match() {
        let mut file = NamedTempFile::new().unwrap();
        write!(file, "fn main() {{\n    println!(\"old\");\n}}").unwrap();

        let tool = EditTool;
        let output = tool
            .call(
                serde_json::json!({
                    "file_path": file.path().to_str().unwrap(),
                    "old_string": "println!(\"old\")",
                    "new_string": "println!(\"new\")"
                }),
                &test_ctx(),
            )
            .await
            .unwrap();

        assert!(!output.is_error);

        let content = std::fs::read_to_string(file.path()).unwrap();
        assert!(content.contains("println!(\"new\")"));
        assert!(!content.contains("println!(\"old\")"));
    }

    #[tokio::test]
    async fn test_edit_multiple_matches_error() {
        let mut file = NamedTempFile::new().unwrap();
        write!(file, "aaa\naaa\naaa").unwrap();

        let tool = EditTool;
        let output = tool
            .call(
                serde_json::json!({
                    "file_path": file.path().to_str().unwrap(),
                    "old_string": "aaa",
                    "new_string": "bbb"
                }),
                &test_ctx(),
            )
            .await
            .unwrap();

        assert!(output.is_error);
        match &output.content {
            ToolResultContent::Text(t) => assert!(t.contains("3 times")),
            _ => panic!("Expected text"),
        }

        // File should be unchanged
        let content = std::fs::read_to_string(file.path()).unwrap();
        assert_eq!(content, "aaa\naaa\naaa");
    }

    #[tokio::test]
    async fn test_edit_replace_all() {
        let mut file = NamedTempFile::new().unwrap();
        write!(file, "aaa\naaa\naaa").unwrap();

        let tool = EditTool;
        let output = tool
            .call(
                serde_json::json!({
                    "file_path": file.path().to_str().unwrap(),
                    "old_string": "aaa",
                    "new_string": "bbb",
                    "replace_all": true
                }),
                &test_ctx(),
            )
            .await
            .unwrap();

        assert!(!output.is_error);

        let content = std::fs::read_to_string(file.path()).unwrap();
        assert_eq!(content, "bbb\nbbb\nbbb");
    }

    #[tokio::test]
    async fn test_edit_not_found() {
        let mut file = NamedTempFile::new().unwrap();
        write!(file, "hello world").unwrap();

        let tool = EditTool;
        let output = tool
            .call(
                serde_json::json!({
                    "file_path": file.path().to_str().unwrap(),
                    "old_string": "nonexistent",
                    "new_string": "replacement"
                }),
                &test_ctx(),
            )
            .await
            .unwrap();

        assert!(output.is_error);
    }

    #[tokio::test]
    async fn test_edit_preserves_indentation() {
        let mut file = NamedTempFile::new().unwrap();
        write!(
            file,
            "fn main() {{\n    let x = 1;\n    let y = 2;\n}}"
        )
        .unwrap();

        let tool = EditTool;
        let output = tool
            .call(
                serde_json::json!({
                    "file_path": file.path().to_str().unwrap(),
                    "old_string": "    let x = 1;",
                    "new_string": "    let x = 42;"
                }),
                &test_ctx(),
            )
            .await
            .unwrap();

        assert!(!output.is_error);

        let content = std::fs::read_to_string(file.path()).unwrap();
        assert!(content.contains("    let x = 42;"));
        assert!(content.contains("    let y = 2;"));
    }

    /// Relative file_path must resolve against `ctx.working_directory`
    /// (per-tab CWD isolation, see MULTIWINDOW_TABS.md).
    #[tokio::test]
    async fn test_edit_relative_path_uses_ctx_working_directory() {
        use std::time::Duration;
        use tempfile::TempDir;

        let dir = TempDir::new().unwrap();
        let target = dir.path().join("rel.txt");
        std::fs::write(&target, "hello WORLD").unwrap();

        let ctx = ToolContext {
            working_directory: dir.path().to_path_buf(),
            timeout: Duration::from_secs(10),
        };

        let tool = EditTool;
        tool.call(
            serde_json::json!({
                "file_path": "rel.txt",
                "old_string": "WORLD",
                "new_string": "rust"
            }),
            &ctx,
        )
        .await
        .unwrap();

        assert_eq!(std::fs::read_to_string(&target).unwrap(), "hello rust");
    }

    /// Absolute file_path is unaffected by `ctx.working_directory`.
    #[tokio::test]
    async fn test_edit_absolute_path_ignores_ctx_working_directory() {
        use std::time::Duration;
        use tempfile::TempDir;

        let real_dir = TempDir::new().unwrap();
        let bogus_dir = TempDir::new().unwrap();
        let target = real_dir.path().join("abs.txt");
        std::fs::write(&target, "old").unwrap();

        let ctx = ToolContext {
            working_directory: bogus_dir.path().to_path_buf(),
            timeout: Duration::from_secs(10),
        };

        let tool = EditTool;
        tool.call(
            serde_json::json!({
                "file_path": target.to_str().unwrap(),
                "old_string": "old",
                "new_string": "new"
            }),
            &ctx,
        )
        .await
        .unwrap();

        assert_eq!(std::fs::read_to_string(&target).unwrap(), "new");
    }
}
