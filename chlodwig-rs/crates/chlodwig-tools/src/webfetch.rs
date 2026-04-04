//! WebFetch tool — fetch a URL and return its content as text.

use async_trait::async_trait;
use chlodwig_core::{Tool, ToolContext, ToolDefinition, ToolError, ToolOutput, ToolResultContent};
use serde::Deserialize;

pub struct WebFetchTool;

#[derive(Deserialize)]
struct WebFetchInput {
    url: String,
    /// Max response body size in bytes (default 100_000)
    max_size: Option<usize>,
    /// If true, return raw HTML instead of converting to text (default false)
    raw: Option<bool>,
}

const DEFAULT_MAX_SIZE: usize = 100_000;
const ABSOLUTE_MAX_SIZE: usize = 1_000_000;

fn build_client() -> Result<reqwest::Client, ToolError> {
    reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .redirect(reqwest::redirect::Policy::limited(10))
        .user_agent("chlodwig-rs/0.1 (WebFetch tool)")
        .build()
        .map_err(|e| ToolError::ExecutionFailed(format!("Failed to build HTTP client: {e}")))
}

fn html_to_text(html: &str) -> String {
    html2text::from_read(html.as_bytes(), 120)
        .unwrap_or_else(|_| String::from("(failed to convert HTML to text)"))
}

fn truncate_with_notice(mut text: String, max: usize) -> String {
    if text.len() > max {
        text.truncate(max);
        text.push_str("\n\n... (truncated)");
    }
    text
}

#[async_trait]
impl Tool for WebFetchTool {
    fn definition(&self) -> ToolDefinition {
        ToolDefinition {
            name: "WebFetch".into(),
            description: concat!(
                "Fetch a URL and return the content as text.\n\n",
                "- For HTML pages, content is automatically converted to readable text\n",
                "- For non-HTML (JSON, plain text, etc.), content is returned as-is\n",
                "- Set `raw: true` to get raw HTML without conversion\n",
                "- Large responses are truncated to `max_size` bytes (default 100KB, max 1MB)\n",
                "- Follows up to 10 redirects\n",
                "- Timeout: 30 seconds"
            ).into(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "The URL to fetch (must start with http:// or https://)"
                    },
                    "max_size": {
                        "type": "integer",
                        "description": "Max response body size in bytes (default 100000, max 1000000)"
                    },
                    "raw": {
                        "type": "boolean",
                        "description": "If true, return raw HTML without text conversion (default false)"
                    }
                },
                "required": ["url"]
            }),
        }
    }

    async fn call(
        &self,
        input: serde_json::Value,
        _ctx: &ToolContext,
    ) -> Result<ToolOutput, ToolError> {
        let input: WebFetchInput =
            serde_json::from_value(input).map_err(|e| ToolError::InvalidInput(e.to_string()))?;

        // Validate URL
        let parsed = url::Url::parse(&input.url)
            .map_err(|e| ToolError::InvalidInput(format!("Invalid URL: {e}")))?;

        match parsed.scheme() {
            "http" | "https" => {}
            other => {
                return Err(ToolError::InvalidInput(format!(
                    "Unsupported scheme '{other}'. Only http:// and https:// are supported."
                )));
            }
        }

        let max_size = input
            .max_size
            .unwrap_or(DEFAULT_MAX_SIZE)
            .min(ABSOLUTE_MAX_SIZE);
        let raw = input.raw.unwrap_or(false);

        let client = build_client()?;

        let response = client
            .get(input.url.clone())
            .send()
            .await
            .map_err(|e| ToolError::ExecutionFailed(format!("HTTP request failed: {e}")))?;

        let status = response.status();
        let content_type = response
            .headers()
            .get("content-type")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("")
            .to_string();

        let body = response
            .text()
            .await
            .map_err(|e| ToolError::ExecutionFailed(format!("Failed to read response body: {e}")))?;

        if !status.is_success() {
            let preview = truncate_with_notice(body, 2000);
            return Ok(ToolOutput {
                content: ToolResultContent::Text(format!(
                    "HTTP {status} for {}\n\n{preview}",
                    input.url
                )),
                is_error: true,
            });
        }

        let is_html = content_type.contains("text/html");

        let text = if is_html && !raw {
            html_to_text(&body)
        } else {
            body
        };

        let text = truncate_with_notice(text, max_size);

        Ok(ToolOutput {
            content: ToolResultContent::Text(text),
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

    fn test_ctx() -> ToolContext {
        ToolContext::default()
    }

    // ── Unit tests (no network) ────────────────────────────────────

    #[test]
    fn test_html_to_text_basic() {
        let html = "<html><body><h1>Hello</h1><p>World</p></body></html>";
        let text = html_to_text(html);
        assert!(text.contains("Hello"), "Should contain heading text, got: {text}");
        assert!(text.contains("World"), "Should contain paragraph text, got: {text}");
        // Should NOT contain HTML tags
        assert!(!text.contains("<h1>"), "Should not contain raw HTML tags");
        assert!(!text.contains("<p>"), "Should not contain raw HTML tags");
    }

    #[test]
    fn test_html_to_text_with_links() {
        let html = r#"<a href="https://example.com">Click here</a>"#;
        let text = html_to_text(html);
        assert!(text.contains("Click here"), "Should contain link text, got: {text}");
    }

    #[test]
    fn test_html_to_text_strips_script_and_style() {
        let html = r#"<html><head><style>body{color:red}</style></head>
            <body><script>alert('xss')</script><p>Content</p></body></html>"#;
        let text = html_to_text(html);
        assert!(text.contains("Content"), "Should contain visible text");
        assert!(!text.contains("alert"), "Should strip script tags, got: {text}");
        assert!(!text.contains("color:red"), "Should strip style tags, got: {text}");
    }

    #[test]
    fn test_truncate_with_notice_short() {
        let text = "hello".to_string();
        let result = truncate_with_notice(text, 100);
        assert_eq!(result, "hello");
    }

    #[test]
    fn test_truncate_with_notice_long() {
        let text = "a".repeat(200);
        let result = truncate_with_notice(text, 100);
        assert!(result.len() < 200);
        assert!(result.ends_with("... (truncated)"));
        // The first 100 chars should be 'a's
        assert!(result.starts_with(&"a".repeat(100)));
    }

    #[test]
    fn test_definition_name() {
        let tool = WebFetchTool;
        let def = tool.definition();
        assert_eq!(def.name, "WebFetch");
    }

    #[test]
    fn test_is_concurrent() {
        let tool = WebFetchTool;
        assert!(tool.is_concurrent());
    }

    #[tokio::test]
    async fn test_invalid_url() {
        let tool = WebFetchTool;
        let result = tool
            .call(serde_json::json!({"url": "not a url"}), &test_ctx())
            .await;
        assert!(result.is_err());
        let err = result.unwrap_err().to_string();
        assert!(err.contains("Invalid URL"), "Error should mention invalid URL: {err}");
    }

    #[tokio::test]
    async fn test_unsupported_scheme_ftp() {
        let tool = WebFetchTool;
        let result = tool
            .call(serde_json::json!({"url": "ftp://example.com/file"}), &test_ctx())
            .await;
        assert!(result.is_err());
        let err = result.unwrap_err().to_string();
        assert!(err.contains("ftp"), "Error should mention ftp: {err}");
    }

    #[tokio::test]
    async fn test_unsupported_scheme_file() {
        let tool = WebFetchTool;
        let result = tool
            .call(serde_json::json!({"url": "file:///etc/passwd"}), &test_ctx())
            .await;
        assert!(result.is_err());
        let err = result.unwrap_err().to_string();
        assert!(err.contains("file"), "Error should mention file: {err}");
    }

    #[tokio::test]
    async fn test_missing_url_field() {
        let tool = WebFetchTool;
        let result = tool
            .call(serde_json::json!({}), &test_ctx())
            .await;
        assert!(result.is_err());
        let err = result.unwrap_err().to_string();
        assert!(err.to_lowercase().contains("url") || err.contains("missing"),
            "Error should mention missing url: {err}");
    }

    // ── Integration tests (require network) ─────────────────────────

    #[tokio::test]
    async fn test_fetch_httpbin_json() {
        // httpbin.org returns JSON — should come back as-is (not HTML-converted)
        let tool = WebFetchTool;
        let result = tool
            .call(
                serde_json::json!({"url": "https://httpbin.org/get"}),
                &test_ctx(),
            )
            .await;

        match result {
            Ok(output) => {
                assert!(!output.is_error);
                match &output.content {
                    ToolResultContent::Text(t) => {
                        assert!(t.contains("headers") || t.contains("origin"),
                            "Should contain JSON fields from httpbin, got: {}",
                            &t[..t.len().min(200)]);
                    }
                    _ => panic!("Expected text"),
                }
            }
            Err(e) => {
                // Network may be unavailable in CI — skip gracefully
                eprintln!("Skipping network test (fetch failed): {e}");
            }
        }
    }

    #[tokio::test]
    async fn test_fetch_html_page_converts_to_text() {
        let tool = WebFetchTool;
        let result = tool
            .call(
                serde_json::json!({"url": "https://example.com"}),
                &test_ctx(),
            )
            .await;

        match result {
            Ok(output) => {
                assert!(!output.is_error);
                match &output.content {
                    ToolResultContent::Text(t) => {
                        // example.com has a simple HTML page with "Example Domain"
                        assert!(t.contains("Example Domain"),
                            "Should contain page title, got: {}",
                            &t[..t.len().min(500)]);
                        // Should NOT have raw HTML tags
                        assert!(!t.contains("<html"), "Should not have raw HTML");
                    }
                    _ => panic!("Expected text"),
                }
            }
            Err(e) => {
                eprintln!("Skipping network test (fetch failed): {e}");
            }
        }
    }

    #[tokio::test]
    async fn test_fetch_html_raw_mode() {
        let tool = WebFetchTool;
        let result = tool
            .call(
                serde_json::json!({"url": "https://example.com", "raw": true}),
                &test_ctx(),
            )
            .await;

        match result {
            Ok(output) => {
                assert!(!output.is_error);
                match &output.content {
                    ToolResultContent::Text(t) => {
                        // Raw mode should preserve HTML tags
                        assert!(t.contains("<") && t.contains(">"),
                            "Raw mode should contain HTML tags, got: {}",
                            &t[..t.len().min(500)]);
                    }
                    _ => panic!("Expected text"),
                }
            }
            Err(e) => {
                eprintln!("Skipping network test (fetch failed): {e}");
            }
        }
    }

    #[tokio::test]
    async fn test_fetch_with_max_size() {
        let tool = WebFetchTool;
        let result = tool
            .call(
                serde_json::json!({"url": "https://example.com", "max_size": 50}),
                &test_ctx(),
            )
            .await;

        match result {
            Ok(output) => {
                assert!(!output.is_error);
                match &output.content {
                    ToolResultContent::Text(t) => {
                        // With max_size=50, output should be truncated
                        assert!(t.len() < 200,
                            "Should be truncated, got {} bytes", t.len());
                        assert!(t.contains("truncated"),
                            "Should have truncation notice, got: {t}");
                    }
                    _ => panic!("Expected text"),
                }
            }
            Err(e) => {
                eprintln!("Skipping network test (fetch failed): {e}");
            }
        }
    }

    #[tokio::test]
    async fn test_fetch_404_returns_error() {
        let tool = WebFetchTool;
        let result = tool
            .call(
                serde_json::json!({"url": "https://httpbin.org/status/404"}),
                &test_ctx(),
            )
            .await;

        match result {
            Ok(output) => {
                assert!(output.is_error, "404 should be flagged as error");
                match &output.content {
                    ToolResultContent::Text(t) => {
                        assert!(t.contains("404"), "Should mention 404, got: {t}");
                    }
                    _ => panic!("Expected text"),
                }
            }
            Err(e) => {
                eprintln!("Skipping network test (fetch failed): {e}");
            }
        }
    }

    #[tokio::test]
    async fn test_fetch_unreachable_host() {
        let tool = WebFetchTool;
        let result = tool
            .call(
                serde_json::json!({"url": "https://this-host-does-not-exist-12345.example.com"}),
                &test_ctx(),
            )
            .await;

        // Should return an error (DNS resolution failure or connection refused)
        assert!(result.is_err(), "Unreachable host should produce error");
    }
}
