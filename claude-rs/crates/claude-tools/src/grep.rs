//! Grep tool — search file contents using ripgrep.

use async_trait::async_trait;
use claude_core::{Tool, ToolContext, ToolDefinition, ToolError, ToolOutput, ToolResultContent};
use serde::Deserialize;
use std::path::Path;

use crate::glob::{run_rg, RG_TIMEOUT};

/// Default max results when head_limit is not specified.
const DEFAULT_HEAD_LIMIT: usize = 250;

/// VCS directories to exclude from search.
const VCS_DIRS: &[&str] = &[".git", ".svn", ".hg", ".bzr", ".jj", ".sl"];

pub struct GrepTool;

#[derive(Deserialize)]
struct GrepInput {
    pattern: String,
    path: Option<String>,
    glob: Option<String>,
    output_mode: Option<String>,
    #[serde(rename = "-B")]
    before_context: Option<usize>,
    #[serde(rename = "-A")]
    after_context: Option<usize>,
    #[serde(rename = "-C")]
    context_alias: Option<usize>,
    context: Option<usize>,
    #[serde(rename = "-n")]
    line_numbers: Option<bool>,
    #[serde(rename = "-i")]
    case_insensitive: Option<bool>,
    #[serde(rename = "type")]
    file_type: Option<String>,
    head_limit: Option<usize>,
    offset: Option<usize>,
    multiline: Option<bool>,
}

#[async_trait]
impl Tool for GrepTool {
    fn definition(&self) -> ToolDefinition {
        ToolDefinition {
            name: "Grep".into(),
            description: concat!(
                "A powerful search tool built on ripgrep\n\n",
                "  Usage:\n",
                "  - ALWAYS use Grep for search tasks. NEVER invoke `grep` or `rg` as a Bash command.\n",
                "  - Supports full regex syntax (e.g., \"log.*Error\", \"function\\s+\\w+\")\n",
                "  - Filter files with glob parameter (e.g., \"*.js\", \"**/*.tsx\") or type parameter (e.g., \"js\", \"py\", \"rust\")\n",
                "  - Output modes: \"content\" shows matching lines, \"files_with_matches\" shows only file paths (default), \"count\" shows match counts\n",
                "  - Use Agent tool for open-ended searches requiring multiple rounds\n",
                "  - Pattern syntax: Uses ripgrep (not grep) - literal braces need escaping\n",
                "  - Multiline matching: By default patterns match within single lines only. For cross-line patterns, use `multiline: true`\n",
            ).into(),
            input_schema: serde_json::json!({
                "type": "object",
                "required": ["pattern"],
                "properties": {
                    "pattern": {
                        "type": "string",
                        "description": "The regular expression pattern to search for in file contents"
                    },
                    "path": {
                        "type": "string",
                        "description": "File or directory to search in (rg PATH). Defaults to current working directory."
                    },
                    "glob": {
                        "type": "string",
                        "description": "Glob pattern to filter files (e.g. \"*.js\", \"*.{ts,tsx}\") - maps to rg --glob"
                    },
                    "output_mode": {
                        "type": "string",
                        "enum": ["content", "files_with_matches", "count"],
                        "description": "Output mode. Defaults to \"files_with_matches\"."
                    },
                    "-B": {
                        "type": "number",
                        "description": "Number of lines to show before each match (rg -B). Requires output_mode: \"content\"."
                    },
                    "-A": {
                        "type": "number",
                        "description": "Number of lines to show after each match (rg -A). Requires output_mode: \"content\"."
                    },
                    "-C": {
                        "type": "number",
                        "description": "Alias for context."
                    },
                    "context": {
                        "type": "number",
                        "description": "Number of lines to show before and after each match (rg -C). Requires output_mode: \"content\"."
                    },
                    "-n": {
                        "type": "boolean",
                        "description": "Show line numbers in output (rg -n). Requires output_mode: \"content\". Defaults to true."
                    },
                    "-i": {
                        "type": "boolean",
                        "description": "Case insensitive search (rg -i)"
                    },
                    "type": {
                        "type": "string",
                        "description": "File type to search (rg --type). Common types: js, py, rust, go, java, etc."
                    },
                    "head_limit": {
                        "type": "number",
                        "description": "Limit output to first N lines/entries. Defaults to 250. Pass 0 for unlimited."
                    },
                    "offset": {
                        "type": "number",
                        "description": "Skip first N lines/entries before applying head_limit. Defaults to 0."
                    },
                    "multiline": {
                        "type": "boolean",
                        "description": "Enable multiline mode where . matches newlines and patterns can span lines (rg -U --multiline-dotall). Default: false."
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
        let input: GrepInput =
            serde_json::from_value(input).map_err(|e| ToolError::InvalidInput(e.to_string()))?;

        let search_path = if let Some(ref p) = input.path {
            let path = Path::new(p);
            if path.is_absolute() {
                path.to_path_buf()
            } else {
                ctx.working_directory.join(path)
            }
        } else {
            ctx.working_directory.clone()
        };

        let output_mode = input.output_mode.as_deref().unwrap_or("files_with_matches");
        let head_limit = input.head_limit.unwrap_or(DEFAULT_HEAD_LIMIT);
        let offset = input.offset.unwrap_or(0);
        let line_numbers = input.line_numbers.unwrap_or(true);
        let case_insensitive = input.case_insensitive.unwrap_or(false);
        let multiline = input.multiline.unwrap_or(false);

        // Build rg args
        let mut args: Vec<String> = vec!["--hidden".into()];

        // Exclude VCS directories
        for dir in VCS_DIRS {
            args.push("--glob".into());
            args.push(format!("!{dir}"));
        }

        args.push("--max-columns".into());
        args.push("500".into());

        // Multiline
        if multiline {
            args.push("-U".into());
            args.push("--multiline-dotall".into());
        }

        // Case insensitive
        if case_insensitive {
            args.push("-i".into());
        }

        // Output mode flags
        match output_mode {
            "files_with_matches" => args.push("-l".into()),
            "count" => args.push("-c".into()),
            "content" => {
                // Line numbers
                if line_numbers {
                    args.push("-n".into());
                }
                // Context lines
                if let Some(c) = input.context {
                    args.push("-C".into());
                    args.push(c.to_string());
                } else if let Some(c) = input.context_alias {
                    args.push("-C".into());
                    args.push(c.to_string());
                } else {
                    if let Some(b) = input.before_context {
                        args.push("-B".into());
                        args.push(b.to_string());
                    }
                    if let Some(a) = input.after_context {
                        args.push("-A".into());
                        args.push(a.to_string());
                    }
                }
            }
            _ => args.push("-l".into()), // fallback
        }

        // Pattern (escape leading dash)
        if input.pattern.starts_with('-') {
            args.push("-e".into());
        }
        args.push(input.pattern.clone());

        // File type
        if let Some(ref ft) = input.file_type {
            args.push("--type".into());
            args.push(ft.clone());
        }

        // Glob filter (handle comma/space splitting like JS original)
        if let Some(ref glob_pattern) = input.glob {
            let patterns = parse_glob_patterns(glob_pattern);
            for p in patterns {
                args.push("--glob".into());
                args.push(p);
            }
        }

        // Search path — for files, pass as arg; for dirs, use as cwd
        let (rg_cwd, extra_path) = if search_path.is_file() {
            (
                search_path
                    .parent()
                    .unwrap_or(&ctx.working_directory)
                    .to_path_buf(),
                Some(
                    search_path
                        .file_name()
                        .unwrap_or_default()
                        .to_string_lossy()
                        .to_string(),
                ),
            )
        } else {
            (search_path.clone(), None)
        };

        if let Some(ref ep) = extra_path {
            args.push(ep.clone());
        }

        let lines = run_rg(&args, &rg_cwd, RG_TIMEOUT).await?;

        if lines.is_empty() {
            return Ok(ToolOutput {
                content: ToolResultContent::Text("No matches found".into()),
                is_error: false,
            });
        }

        // Apply offset + head_limit
        let paginated: Vec<&str> = if head_limit == 0 {
            // 0 = unlimited
            lines.iter().skip(offset).map(|s| s.as_str()).collect()
        } else {
            lines
                .iter()
                .skip(offset)
                .take(head_limit)
                .map(|s| s.as_str())
                .collect()
        };

        // Relativize paths in output
        let result: Vec<String> = paginated
            .iter()
            .map(|line| relativize_grep_line(line, &rg_cwd, output_mode))
            .collect();

        Ok(ToolOutput {
            content: ToolResultContent::Text(result.join("\n")),
            is_error: false,
        })
    }

    fn is_concurrent(&self) -> bool {
        true
    }
}

/// Parse glob patterns from a string that may contain commas, spaces, or braces.
fn parse_glob_patterns(input: &str) -> Vec<String> {
    let mut patterns = Vec::new();
    for part in input.split_whitespace() {
        if part.contains('{') && part.contains('}') {
            // Brace expansion — pass through as-is
            patterns.push(part.to_string());
        } else {
            // Split by comma
            for p in part.split(',') {
                let p = p.trim();
                if !p.is_empty() {
                    patterns.push(p.to_string());
                }
            }
        }
    }
    patterns
}

/// Relativize file paths in grep output lines.
fn relativize_grep_line(line: &str, base: &Path, mode: &str) -> String {
    match mode {
        "files_with_matches" => {
            let p = Path::new(line);
            if let Ok(rel) = p.strip_prefix(base) {
                rel.display().to_string()
            } else {
                line.to_string()
            }
        }
        "count" => {
            // Format: "path:count"
            if let Some(colon) = line.rfind(':') {
                let path_part = &line[..colon];
                let count_part = &line[colon..];
                let p = Path::new(path_part);
                if let Ok(rel) = p.strip_prefix(base) {
                    format!("{}{count_part}", rel.display())
                } else {
                    line.to_string()
                }
            } else {
                line.to_string()
            }
        }
        "content" => {
            // Format: "path:line_num:content" or "path-line_num-content" (context lines)
            if let Some(colon) = line.find(':') {
                let path_part = &line[..colon];
                let rest = &line[colon..];
                let p = Path::new(path_part);
                if let Ok(rel) = p.strip_prefix(base) {
                    format!("{}{rest}", rel.display())
                } else {
                    line.to_string()
                }
            } else {
                line.to_string()
            }
        }
        _ => line.to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::time::Duration;

    fn test_ctx_with_dir(dir: &Path) -> ToolContext {
        ToolContext {
            working_directory: dir.to_path_buf(),
            timeout: Duration::from_secs(30),
        }
    }

    #[tokio::test]
    async fn test_grep_find_pattern() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join("hello.rs"), "fn main() {\n    println!(\"hello\");\n}\n").unwrap();
        fs::write(dir.path().join("other.txt"), "no match here\n").unwrap();

        let tool = GrepTool;
        let output = tool
            .call(
                serde_json::json!({"pattern": "fn main"}),
                &test_ctx_with_dir(dir.path()),
            )
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => {
                assert!(t.contains("hello.rs"), "Should find hello.rs, got: {t}");
                assert!(!t.contains("other.txt"), "Should not find other.txt");
            }
            _ => panic!("Expected text"),
        }
        assert!(!output.is_error);
    }

    #[tokio::test]
    async fn test_grep_files_with_matches_mode() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join("a.txt"), "needle in a haystack\n").unwrap();
        fs::write(dir.path().join("b.txt"), "another needle\n").unwrap();
        fs::write(dir.path().join("c.txt"), "no match\n").unwrap();

        let tool = GrepTool;
        let output = tool
            .call(
                serde_json::json!({"pattern": "needle"}),
                &test_ctx_with_dir(dir.path()),
            )
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => {
                let lines: Vec<&str> = t.lines().collect();
                assert_eq!(lines.len(), 2, "Should find 2 files, got: {t}");
                assert!(t.contains("a.txt"));
                assert!(t.contains("b.txt"));
                assert!(!t.contains("c.txt"));
            }
            _ => panic!("Expected text"),
        }
    }

    #[tokio::test]
    async fn test_grep_content_mode() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(
            dir.path().join("code.rs"),
            "line1\nfn hello() {\nline3\n",
        )
        .unwrap();

        let tool = GrepTool;
        let output = tool
            .call(
                serde_json::json!({
                    "pattern": "fn hello",
                    "output_mode": "content"
                }),
                &test_ctx_with_dir(dir.path()),
            )
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => {
                assert!(
                    t.contains("fn hello"),
                    "Should show matching line, got: {t}"
                );
            }
            _ => panic!("Expected text"),
        }
    }

    #[tokio::test]
    async fn test_grep_content_with_line_numbers() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(
            dir.path().join("test.txt"),
            "line1\nfind_me\nline3\n",
        )
        .unwrap();

        let tool = GrepTool;
        let output = tool
            .call(
                serde_json::json!({
                    "pattern": "find_me",
                    "output_mode": "content",
                    "-n": true
                }),
                &test_ctx_with_dir(dir.path()),
            )
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => {
                // rg -n output format: "file:line_num:content"
                assert!(
                    t.contains(":2:"),
                    "Should show line number 2, got: {t}"
                );
                assert!(t.contains("find_me"));
            }
            _ => panic!("Expected text"),
        }
    }

    #[tokio::test]
    async fn test_grep_count_mode() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(
            dir.path().join("data.txt"),
            "apple\nbanana\napple pie\napple sauce\n",
        )
        .unwrap();

        let tool = GrepTool;
        let output = tool
            .call(
                serde_json::json!({
                    "pattern": "apple",
                    "output_mode": "count"
                }),
                &test_ctx_with_dir(dir.path()),
            )
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => {
                // Format: "file:count"
                assert!(t.contains(":3"), "Should find 3 matches, got: {t}");
            }
            _ => panic!("Expected text"),
        }
    }

    #[tokio::test]
    async fn test_grep_case_insensitive() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join("mixed.txt"), "Hello\nhello\nHELLO\n").unwrap();

        let tool = GrepTool;
        let output = tool
            .call(
                serde_json::json!({
                    "pattern": "hello",
                    "-i": true,
                    "output_mode": "count"
                }),
                &test_ctx_with_dir(dir.path()),
            )
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => {
                assert!(
                    t.contains(":3"),
                    "Case insensitive should find all 3, got: {t}"
                );
            }
            _ => panic!("Expected text"),
        }
    }

    #[tokio::test]
    async fn test_grep_with_glob_filter() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join("code.rs"), "fn main() {}\n").unwrap();
        fs::write(dir.path().join("code.py"), "def main():\n").unwrap();
        fs::write(dir.path().join("code.txt"), "fn main() {}\n").unwrap();

        let tool = GrepTool;
        let output = tool
            .call(
                serde_json::json!({
                    "pattern": "fn main",
                    "glob": "*.rs"
                }),
                &test_ctx_with_dir(dir.path()),
            )
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => {
                assert!(t.contains("code.rs"), "Should find code.rs, got: {t}");
                assert!(!t.contains("code.txt"), "Should not find code.txt");
                assert!(!t.contains("code.py"), "Should not find code.py");
            }
            _ => panic!("Expected text"),
        }
    }

    #[tokio::test]
    async fn test_grep_with_context() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(
            dir.path().join("ctx.txt"),
            "line1\nline2\nMATCH\nline4\nline5\n",
        )
        .unwrap();

        let tool = GrepTool;
        let output = tool
            .call(
                serde_json::json!({
                    "pattern": "MATCH",
                    "output_mode": "content",
                    "context": 1
                }),
                &test_ctx_with_dir(dir.path()),
            )
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => {
                assert!(t.contains("line2"), "Should show line before, got: {t}");
                assert!(t.contains("MATCH"), "Should show match, got: {t}");
                assert!(t.contains("line4"), "Should show line after, got: {t}");
            }
            _ => panic!("Expected text"),
        }
    }

    #[tokio::test]
    async fn test_grep_no_matches() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join("file.txt"), "nothing special here\n").unwrap();

        let tool = GrepTool;
        let output = tool
            .call(
                serde_json::json!({"pattern": "xyznonexistent"}),
                &test_ctx_with_dir(dir.path()),
            )
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => {
                assert_eq!(t, "No matches found");
            }
            _ => panic!("Expected text"),
        }
        assert!(!output.is_error);
    }

    #[tokio::test]
    async fn test_grep_head_limit() {
        let dir = tempfile::tempdir().unwrap();
        // Create many files with matches
        for i in 0..20 {
            fs::write(
                dir.path().join(format!("file_{i:02}.txt")),
                "needle\n",
            )
            .unwrap();
        }

        let tool = GrepTool;
        let output = tool
            .call(
                serde_json::json!({
                    "pattern": "needle",
                    "head_limit": 5
                }),
                &test_ctx_with_dir(dir.path()),
            )
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => {
                let lines: Vec<&str> = t.lines().collect();
                assert_eq!(lines.len(), 5, "Should limit to 5 results, got: {t}");
            }
            _ => panic!("Expected text"),
        }
    }

    #[tokio::test]
    async fn test_grep_with_file_type() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join("code.rs"), "fn main() {}\n").unwrap();
        fs::write(dir.path().join("code.py"), "def main():\n    pass\n").unwrap();

        let tool = GrepTool;
        let output = tool
            .call(
                serde_json::json!({
                    "pattern": "main",
                    "type": "rust"
                }),
                &test_ctx_with_dir(dir.path()),
            )
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => {
                assert!(t.contains("code.rs"), "Should find Rust file, got: {t}");
                assert!(!t.contains("code.py"), "Should not find Python file");
            }
            _ => panic!("Expected text"),
        }
    }

    #[tokio::test]
    async fn test_grep_pattern_starting_with_dash() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join("flags.txt"), "--verbose\n--debug\n--help\n").unwrap();

        let tool = GrepTool;
        let output = tool
            .call(
                serde_json::json!({
                    "pattern": "--verbose",
                    "output_mode": "content"
                }),
                &test_ctx_with_dir(dir.path()),
            )
            .await
            .unwrap();

        match &output.content {
            ToolResultContent::Text(t) => {
                assert!(
                    t.contains("--verbose"),
                    "Should find pattern starting with dash, got: {t}"
                );
            }
            _ => panic!("Expected text"),
        }
        assert!(!output.is_error);
    }

    #[test]
    fn test_parse_glob_patterns_simple() {
        assert_eq!(parse_glob_patterns("*.rs"), vec!["*.rs"]);
    }

    #[test]
    fn test_parse_glob_patterns_comma() {
        assert_eq!(parse_glob_patterns("*.rs,*.toml"), vec!["*.rs", "*.toml"]);
    }

    #[test]
    fn test_parse_glob_patterns_braces() {
        assert_eq!(
            parse_glob_patterns("*.{rs,toml}"),
            vec!["*.{rs,toml}"]
        );
    }

    #[test]
    fn test_parse_glob_patterns_space_separated() {
        assert_eq!(
            parse_glob_patterns("*.rs *.toml"),
            vec!["*.rs", "*.toml"]
        );
    }
}
