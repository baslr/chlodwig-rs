//! WebSearch tool — search the web using DuckDuckGo HTML.

use async_trait::async_trait;
use chlodwig_core::{Tool, ToolContext, ToolDefinition, ToolError, ToolOutput, ToolResultContent};
use serde::Deserialize;

pub struct WebSearchTool;

#[derive(Deserialize)]
struct WebSearchInput {
    query: String,
    /// Max number of results to return (default 10, max 20)
    max_results: Option<usize>,
}

const DEFAULT_MAX_RESULTS: usize = 10;
const ABSOLUTE_MAX_RESULTS: usize = 20;
const SEARCH_TIMEOUT_SECS: u64 = 15;

/// A single search result extracted from the HTML.
#[derive(Debug, Clone)]
struct SearchResult {
    title: String,
    url: String,
    snippet: String,
}

fn build_search_client() -> Result<reqwest::Client, ToolError> {
    reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(SEARCH_TIMEOUT_SECS))
        .redirect(reqwest::redirect::Policy::limited(5))
        .user_agent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
        .build()
        .map_err(|e| ToolError::ExecutionFailed(format!("Failed to build HTTP client: {e}")))
}

/// Parse DuckDuckGo HTML search results.
///
/// DuckDuckGo's HTML-only endpoint (`html.duckduckgo.com/html/`) returns a page
/// with results in a structure like:
/// ```html
/// <div class="result results_links results_links_deep web-result">
///   <h2 class="result__title">
///     <a class="result__a" href="https://...">Title</a>
///   </h2>
///   <a class="result__snippet">Snippet text...</a>
/// </div>
/// ```
///
/// We parse this with simple string matching (no full HTML parser needed).
fn parse_ddg_results(html: &str, max: usize) -> Vec<SearchResult> {
    let mut results = Vec::new();

    // Split by result blocks
    for chunk in html.split("class=\"result__a\"") {
        if results.len() >= max {
            break;
        }
        if chunk.len() < 10 {
            continue;
        }

        // Extract URL from href="..."
        let url = extract_attr(chunk, "href=\"");
        if url.is_empty() {
            continue;
        }

        // Decode DuckDuckGo redirect URL if needed
        let url = decode_ddg_url(&url);

        // Extract title (text between > and </a>)
        let title = extract_tag_text(chunk);

        // Extract snippet
        let snippet = extract_snippet(chunk);

        if !url.is_empty() && !title.is_empty() {
            results.push(SearchResult {
                title: html_entities_decode(&title),
                url,
                snippet: html_entities_decode(&snippet),
            });
        }
    }

    results
}

/// Extract attribute value after the given prefix (e.g., `href="` -> URL).
fn extract_attr(s: &str, prefix: &str) -> String {
    if let Some(start) = s.find(prefix) {
        let rest = &s[start + prefix.len()..];
        if let Some(end) = rest.find('"') {
            return rest[..end].to_string();
        }
    }
    String::new()
}

/// Extract text content from the first `>...</a>` or `>...</` after the cursor.
fn extract_tag_text(s: &str) -> String {
    // Look for the first `>` after the href
    if let Some(start) = s.find('>') {
        let rest = &s[start + 1..];
        if let Some(end) = rest.find("</") {
            let raw = &rest[..end];
            return strip_tags(raw).trim().to_string();
        }
    }
    String::new()
}

/// Extract snippet text from result__snippet span.
fn extract_snippet(s: &str) -> String {
    if let Some(idx) = s.find("result__snippet") {
        let rest = &s[idx..];
        // Find the opening >
        if let Some(start) = rest.find('>') {
            let rest = &rest[start + 1..];
            // Find the closing tag
            if let Some(end) = rest.find("</") {
                let raw = &rest[..end];
                return strip_tags(raw).trim().to_string();
            }
        }
    }
    String::new()
}

/// Strip HTML tags from a string.
fn strip_tags(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut in_tag = false;
    for ch in s.chars() {
        match ch {
            '<' => in_tag = true,
            '>' => in_tag = false,
            _ if !in_tag => out.push(ch),
            _ => {}
        }
    }
    out
}

/// Decode basic HTML entities.
fn html_entities_decode(s: &str) -> String {
    s.replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&#39;", "'")
        .replace("&#x27;", "'")
        .replace("&apos;", "'")
        .replace("&#x2F;", "/")
        .replace("&nbsp;", " ")
}

/// Decode DuckDuckGo redirect URLs.
/// DDG wraps results in `//duckduckgo.com/l/?uddg=<encoded_url>&...`
fn decode_ddg_url(url: &str) -> String {
    if url.contains("duckduckgo.com/l/?") {
        if let Some(start) = url.find("uddg=") {
            let rest = &url[start + 5..];
            let encoded = if let Some(end) = rest.find('&') {
                &rest[..end]
            } else {
                rest
            };
            // URL-decode
            return url_decode(encoded);
        }
    }
    url.to_string()
}

/// Simple percent-decoding for URLs.
fn url_decode(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    let mut chars = s.chars();
    while let Some(ch) = chars.next() {
        if ch == '%' {
            let hex: String = chars.by_ref().take(2).collect();
            if hex.len() == 2 {
                if let Ok(byte) = u8::from_str_radix(&hex, 16) {
                    result.push(byte as char);
                } else {
                    result.push('%');
                    result.push_str(&hex);
                }
            } else {
                result.push('%');
                result.push_str(&hex);
            }
        } else if ch == '+' {
            result.push(' ');
        } else {
            result.push(ch);
        }
    }
    result
}

fn format_results(results: &[SearchResult]) -> String {
    if results.is_empty() {
        return "No results found.".to_string();
    }

    let mut out = String::new();
    for (i, r) in results.iter().enumerate() {
        use std::fmt::Write;
        writeln!(out, "{}. {}", i + 1, r.title).unwrap();
        writeln!(out, "   {}", r.url).unwrap();
        if !r.snippet.is_empty() {
            writeln!(out, "   {}", r.snippet).unwrap();
        }
        writeln!(out).unwrap();
    }
    out
}

#[async_trait]
impl Tool for WebSearchTool {
    fn definition(&self) -> ToolDefinition {
        ToolDefinition {
            name: "WebSearch".into(),
            description: concat!(
                "Search the web using DuckDuckGo and return results.\n\n",
                "- Returns titles, URLs, and snippets for each result\n",
                "- Default: 10 results, max 20\n",
                "- Use WebFetch to read the full content of a specific URL\n",
                "- No API key required"
            )
            .into(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query"
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Maximum number of results (default 10, max 20)"
                    }
                },
                "required": ["query"]
            }),
        }
    }

    async fn call(
        &self,
        input: serde_json::Value,
        _ctx: &ToolContext,
    ) -> Result<ToolOutput, ToolError> {
        let input: WebSearchInput =
            serde_json::from_value(input).map_err(|e| ToolError::InvalidInput(e.to_string()))?;

        if input.query.trim().is_empty() {
            return Err(ToolError::InvalidInput("Query must not be empty".into()));
        }

        let max_results = input
            .max_results
            .unwrap_or(DEFAULT_MAX_RESULTS)
            .min(ABSOLUTE_MAX_RESULTS);

        let client = build_search_client()?;

        // Use DuckDuckGo's HTML-only endpoint
        let response = client
            .get("https://html.duckduckgo.com/html/")
            .query(&[("q", &input.query)])
            .send()
            .await
            .map_err(|e| ToolError::ExecutionFailed(format!("Search request failed: {e}")))?;

        let status = response.status();
        if !status.is_success() {
            return Ok(ToolOutput {
                content: ToolResultContent::Text(format!(
                    "Search failed with HTTP {status}"
                )),
                is_error: true,
            });
        }

        let html = response
            .text()
            .await
            .map_err(|e| ToolError::ExecutionFailed(format!("Failed to read search results: {e}")))?;

        let results = parse_ddg_results(&html, max_results);
        let text = format_results(&results);

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

    // ── Unit tests (no network) ─────────────────────────────────────

    #[test]
    fn test_definition_name() {
        let tool = WebSearchTool;
        let def = tool.definition();
        assert_eq!(def.name, "WebSearch");
    }

    #[test]
    fn test_is_concurrent() {
        let tool = WebSearchTool;
        assert!(tool.is_concurrent());
    }

    #[test]
    fn test_strip_tags() {
        assert_eq!(strip_tags("<b>bold</b>"), "bold");
        assert_eq!(strip_tags("no tags"), "no tags");
        assert_eq!(strip_tags("<a href=\"x\">link</a> text"), "link text");
        assert_eq!(strip_tags(""), "");
    }

    #[test]
    fn test_html_entities_decode() {
        assert_eq!(html_entities_decode("a &amp; b"), "a & b");
        assert_eq!(html_entities_decode("&lt;div&gt;"), "<div>");
        assert_eq!(html_entities_decode("he said &quot;hi&quot;"), "he said \"hi\"");
        assert_eq!(html_entities_decode("it&#39;s"), "it's");
    }

    #[test]
    fn test_url_decode() {
        assert_eq!(url_decode("hello%20world"), "hello world");
        assert_eq!(url_decode("a%2Fb"), "a/b");
        assert_eq!(url_decode("no+encoding"), "no encoding");
        assert_eq!(url_decode("plain"), "plain");
    }

    #[test]
    fn test_decode_ddg_url_passthrough() {
        let url = "https://example.com/page";
        assert_eq!(decode_ddg_url(url), url);
    }

    #[test]
    fn test_decode_ddg_url_redirect() {
        let url = "//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2Fpage&rut=abc";
        assert_eq!(decode_ddg_url(url), "https://example.com/page");
    }

    #[test]
    fn test_format_results_empty() {
        let results: Vec<SearchResult> = vec![];
        assert_eq!(format_results(&results), "No results found.");
    }

    #[test]
    fn test_format_results_single() {
        let results = vec![SearchResult {
            title: "Example".into(),
            url: "https://example.com".into(),
            snippet: "An example site.".into(),
        }];
        let text = format_results(&results);
        assert!(text.contains("1. Example"));
        assert!(text.contains("https://example.com"));
        assert!(text.contains("An example site."));
    }

    #[test]
    fn test_format_results_multiple() {
        let results = vec![
            SearchResult {
                title: "First".into(),
                url: "https://first.com".into(),
                snippet: "First result".into(),
            },
            SearchResult {
                title: "Second".into(),
                url: "https://second.com".into(),
                snippet: "Second result".into(),
            },
        ];
        let text = format_results(&results);
        assert!(text.contains("1. First"));
        assert!(text.contains("2. Second"));
    }

    #[test]
    fn test_parse_ddg_results_synthetic() {
        // Synthetic DuckDuckGo-style HTML
        let html = r#"
        <div class="result results_links">
          <h2 class="result__title">
            <a class="result__a" href="https://example.com">Example Domain</a>
          </h2>
          <a class="result__snippet">This is an example website.</a>
        </div>
        <div class="result results_links">
          <h2 class="result__title">
            <a class="result__a" href="https://rust-lang.org">Rust Language</a>
          </h2>
          <a class="result__snippet">A systems programming language.</a>
        </div>
        "#;

        let results = parse_ddg_results(html, 10);
        assert_eq!(results.len(), 2, "Should parse 2 results, got: {results:?}");
        assert_eq!(results[0].title, "Example Domain");
        assert_eq!(results[0].url, "https://example.com");
        assert_eq!(results[0].snippet, "This is an example website.");
        assert_eq!(results[1].title, "Rust Language");
        assert_eq!(results[1].url, "https://rust-lang.org");
    }

    #[test]
    fn test_parse_ddg_results_with_redirect_url() {
        let html = r#"
        <a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2Fpage&rut=abc">My Title</a>
        <a class="result__snippet">Some snippet text.</a>
        "#;

        let results = parse_ddg_results(html, 10);
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].url, "https://example.com/page");
        assert_eq!(results[0].title, "My Title");
    }

    #[test]
    fn test_parse_ddg_results_respects_max() {
        let html = r#"
        <a class="result__a" href="https://a.com">A</a><a class="result__snippet">snip a</a>
        <a class="result__a" href="https://b.com">B</a><a class="result__snippet">snip b</a>
        <a class="result__a" href="https://c.com">C</a><a class="result__snippet">snip c</a>
        "#;

        let results = parse_ddg_results(html, 2);
        assert_eq!(results.len(), 2, "Should respect max_results=2");
    }

    #[test]
    fn test_parse_ddg_results_empty_html() {
        let results = parse_ddg_results("", 10);
        assert!(results.is_empty());
    }

    #[test]
    fn test_parse_ddg_results_no_results_page() {
        let html = "<html><body><div class='no-results'>No results</div></body></html>";
        let results = parse_ddg_results(html, 10);
        assert!(results.is_empty());
    }

    #[test]
    fn test_parse_ddg_results_with_html_entities() {
        let html = r#"
        <a class="result__a" href="https://example.com">Tom &amp; Jerry</a>
        <a class="result__snippet">It&#39;s a &lt;classic&gt; show.</a>
        "#;

        let results = parse_ddg_results(html, 10);
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].title, "Tom & Jerry");
        assert_eq!(results[0].snippet, "It's a <classic> show.");
    }

    #[test]
    fn test_extract_attr() {
        assert_eq!(extract_attr(r#"href="https://x.com""#, "href=\""), "https://x.com");
        assert_eq!(extract_attr("no match", "href=\""), "");
    }

    #[tokio::test]
    async fn test_empty_query() {
        let tool = WebSearchTool;
        let result = tool
            .call(serde_json::json!({"query": ""}), &test_ctx())
            .await;
        assert!(result.is_err());
        let err = result.unwrap_err().to_string();
        assert!(err.contains("empty") || err.contains("Query"),
            "Should reject empty query: {err}");
    }

    #[tokio::test]
    async fn test_whitespace_only_query() {
        let tool = WebSearchTool;
        let result = tool
            .call(serde_json::json!({"query": "   "}), &test_ctx())
            .await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_missing_query_field() {
        let tool = WebSearchTool;
        let result = tool
            .call(serde_json::json!({}), &test_ctx())
            .await;
        assert!(result.is_err());
    }

    // ── Integration tests (require network) ─────────────────────────

    #[tokio::test]
    async fn test_search_rust_programming() {
        let tool = WebSearchTool;
        let result = tool
            .call(
                serde_json::json!({"query": "rust programming language", "max_results": 5}),
                &test_ctx(),
            )
            .await;

        match result {
            Ok(output) => {
                assert!(!output.is_error, "Search should succeed");
                match &output.content {
                    ToolResultContent::Text(t) => {
                        // Should have numbered results
                        assert!(t.contains("1."),
                            "Should have at least one result, got: {}",
                            &t[..t.len().min(500)]);
                        // Should contain URLs
                        assert!(t.contains("http"),
                            "Should contain URLs, got: {}",
                            &t[..t.len().min(500)]);
                    }
                    _ => panic!("Expected text"),
                }
            }
            Err(e) => {
                eprintln!("Skipping network test (search failed): {e}");
            }
        }
    }

    #[tokio::test]
    async fn test_search_with_max_results() {
        let tool = WebSearchTool;
        let result = tool
            .call(
                serde_json::json!({"query": "tokio async runtime", "max_results": 3}),
                &test_ctx(),
            )
            .await;

        match result {
            Ok(output) => {
                assert!(!output.is_error);
                match &output.content {
                    ToolResultContent::Text(t) => {
                        // Count numbered results
                        let count = t.lines()
                            .filter(|l| l.starts_with(|c: char| c.is_ascii_digit()) && l.contains(". "))
                            .count();
                        assert!(count <= 3, "Should have at most 3 results, got {count}");
                    }
                    _ => panic!("Expected text"),
                }
            }
            Err(e) => {
                eprintln!("Skipping network test (search failed): {e}");
            }
        }
    }
}
