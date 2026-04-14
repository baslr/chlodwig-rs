//! WebSearch tool — search the web via Startpage (primary) with DuckDuckGo fallback.
//!
//! Startpage proxies Google results without tracking. DuckDuckGo's HTML endpoint
//! increasingly returns CAPTCHAs based on TLS fingerprinting and IP rate-limiting,
//! so we use it only as a fallback.

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
#[derive(Debug, Clone, PartialEq, Eq)]
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

// ── Startpage parser ────────────────────────────────────────────────

/// Parse Startpage search results from HTML.
///
/// Startpage returns Google results in a structure like:
/// ```html
/// <a ... href="URL" ... data-testid="gl-title-link">
///   <h2 class="wgl-title ...">Title</h2>
/// </a>
/// <p class="description ...">Snippet with <b>bold</b> terms.</p>
/// ```
///
/// Inline `<style>` blocks are scattered throughout the HTML (Emotion CSS-in-JS)
/// and must be stripped before parsing.
fn parse_startpage_results(html: &str, max: usize) -> Vec<SearchResult> {
    // Strip all inline <style> blocks — Startpage injects Emotion CSS everywhere
    let clean = strip_style_blocks(html);
    let mut results = Vec::new();
    let marker = "data-testid=\"gl-title-link\"";
    let mut search_from = 0;

    while results.len() < max {
        let marker_pos = match clean[search_from..].find(marker) {
            Some(pos) => search_from + pos,
            None => break,
        };
        search_from = marker_pos + marker.len();

        // Look backwards from marker_pos for href="..."
        let before = &clean[..marker_pos];
        let url = match before.rfind("href=\"") {
            Some(href_start) => {
                let rest = &before[href_start + 6..];
                match rest.find('"') {
                    Some(end) => rest[..end].to_string(),
                    None => continue,
                }
            }
            None => continue,
        };

        if url.is_empty() {
            continue;
        }

        // After the marker comes: ><h2 ...>TITLE</h2></a><p class="description ...">SNIPPET</p>
        let after = &clean[search_from..];

        // Extract title from <h2 ...>TITLE</h2>
        let title = match extract_between(after, "<h2", "</h2>") {
            Some(h2_content) => {
                // h2_content includes the tag attributes, find the >
                match h2_content.find('>') {
                    Some(gt) => strip_tags(&h2_content[gt + 1..]).trim().to_string(),
                    None => continue,
                }
            }
            None => continue,
        };

        if title.is_empty() {
            continue;
        }

        // Extract snippet from <p class="description ...">SNIPPET</p>
        let snippet = match extract_between(after, "<p class=\"description", "</p>") {
            Some(p_content) => {
                match p_content.find('>') {
                    Some(gt) => strip_tags(&p_content[gt + 1..]).trim().to_string(),
                    None => String::new(),
                }
            }
            None => String::new(),
        };

        results.push(SearchResult {
            title: html_entities_decode(&title),
            url,
            snippet: html_entities_decode(&snippet),
        });
    }

    results
}

/// Returns true if the Startpage response looks like a CAPTCHA or error page
/// (no search results found in the HTML).
fn is_startpage_blocked(html: &str) -> bool {
    !html.contains("data-testid=\"gl-title-link\"")
}

/// Strip all `<style ...>...</style>` blocks from HTML.
fn strip_style_blocks(html: &str) -> String {
    let mut result = String::with_capacity(html.len());
    let mut pos = 0;
    while let Some(start) = html[pos..].find("<style") {
        let abs_start = pos + start;
        result.push_str(&html[pos..abs_start]);
        // Find closing </style>
        if let Some(end) = html[abs_start..].find("</style>") {
            pos = abs_start + end + 8; // skip past </style>
        } else {
            // Unclosed style tag — skip to end
            break;
        }
    }
    result.push_str(&html[pos..]);
    result
}

/// Extract content between `start_tag` (partial) and `end_tag`.
/// Returns the content INCLUDING the rest of the start tag (caller strips attributes).
fn extract_between<'a>(s: &'a str, start_tag: &str, end_tag: &str) -> Option<&'a str> {
    let start = s.find(start_tag)?;
    let content_start = start + start_tag.len();
    let end = s[content_start..].find(end_tag)?;
    Some(&s[content_start..content_start + end])
}

// ── DuckDuckGo parser (fallback) ────────────────────────────────────

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

/// Returns true if DuckDuckGo returned a CAPTCHA page instead of results.
fn is_ddg_captcha(html: &str) -> bool {
    html.contains("anomaly") || html.contains("Please complete the following challenge")
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

// ── Shared helpers ──────────────────────────────────────────────────

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

fn format_results(results: &[SearchResult], source: &str) -> String {
    if results.is_empty() {
        return "No results found.".to_string();
    }

    let mut out = String::new();
    use std::fmt::Write;
    writeln!(out, "[Source: {source}]\n").unwrap();
    for (i, r) in results.iter().enumerate() {
        writeln!(out, "{}. {}", i + 1, r.title).unwrap();
        writeln!(out, "   {}", r.url).unwrap();
        if !r.snippet.is_empty() {
            writeln!(out, "   {}", r.snippet).unwrap();
        }
        writeln!(out).unwrap();
    }
    out
}

// ── Search backends ─────────────────────────────────────────────────

/// Try Startpage first. Returns Ok(results) on success, Err(reason) if blocked/failed.
async fn search_startpage(
    client: &reqwest::Client,
    query: &str,
    max: usize,
) -> Result<Vec<SearchResult>, String> {
    let response = client
        .get("https://www.startpage.com/do/search")
        .query(&[("query", query)])
        .send()
        .await
        .map_err(|e| format!("Startpage request failed: {e}"))?;

    let status = response.status();
    if !status.is_success() {
        return Err(format!("Startpage HTTP {status}"));
    }

    let html = response
        .text()
        .await
        .map_err(|e| format!("Startpage body read failed: {e}"))?;

    if is_startpage_blocked(&html) {
        return Err("Startpage returned no results (possible block)".into());
    }

    let results = parse_startpage_results(&html, max);
    if results.is_empty() {
        return Err("Startpage returned 0 parseable results".into());
    }

    Ok(results)
}

/// Fallback to DuckDuckGo. Returns Ok(results) on success, Err(reason) if CAPTCHA/failed.
async fn search_ddg(
    client: &reqwest::Client,
    query: &str,
    max: usize,
) -> Result<Vec<SearchResult>, String> {
    let response = client
        .get("https://html.duckduckgo.com/html/")
        .query(&[("q", query)])
        .send()
        .await
        .map_err(|e| format!("DuckDuckGo request failed: {e}"))?;

    let status = response.status();
    if !status.is_success() {
        return Err(format!("DuckDuckGo HTTP {status}"));
    }

    let html = response
        .text()
        .await
        .map_err(|e| format!("DuckDuckGo body read failed: {e}"))?;

    if is_ddg_captcha(&html) {
        return Err("DuckDuckGo returned a CAPTCHA page".into());
    }

    let results = parse_ddg_results(&html, max);
    if results.is_empty() {
        return Err("DuckDuckGo returned 0 parseable results".into());
    }

    Ok(results)
}

#[async_trait]
impl Tool for WebSearchTool {
    fn definition(&self) -> ToolDefinition {
        ToolDefinition {
            name: "WebSearch".into(),
            description: concat!(
                "Search the web and return results.\n\n",
                "- Returns titles, URLs, and snippets for each result\n",
                "- Default: 10 results, max 20\n",
                "- Uses Startpage (Google proxy) with DuckDuckGo fallback\n",
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

        // Try Startpage first (Google results, less bot detection)
        match search_startpage(&client, &input.query, max_results).await {
            Ok(results) => {
                let text = format_results(&results, "Startpage");
                return Ok(ToolOutput {
                    content: ToolResultContent::Text(text),
                    is_error: false,
                });
            }
            Err(reason) => {
                tracing::warn!("Startpage failed, falling back to DuckDuckGo: {reason}");
            }
        }

        // Fallback to DuckDuckGo
        match search_ddg(&client, &input.query, max_results).await {
            Ok(results) => {
                let text = format_results(&results, "DuckDuckGo");
                Ok(ToolOutput {
                    content: ToolResultContent::Text(text),
                    is_error: false,
                })
            }
            Err(reason) => {
                Ok(ToolOutput {
                    content: ToolResultContent::Text(format!(
                        "Search failed. Startpage and DuckDuckGo both unavailable.\n\
                         Last error: {reason}"
                    )),
                    is_error: true,
                })
            }
        }
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

    // ── Shared helper tests ─────────────────────────────────────────

    #[test]
    fn test_definition_name() {
        let tool = WebSearchTool;
        let def = tool.definition();
        assert_eq!(def.name, "WebSearch");
    }

    #[test]
    fn test_definition_description_mentions_startpage() {
        let tool = WebSearchTool;
        let def = tool.definition();
        assert!(
            def.description.contains("Startpage"),
            "Description should mention Startpage: {}",
            def.description
        );
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
    fn test_format_results_empty() {
        let results: Vec<SearchResult> = vec![];
        assert_eq!(format_results(&results, "Test"), "No results found.");
    }

    #[test]
    fn test_format_results_includes_source() {
        let results = vec![SearchResult {
            title: "Example".into(),
            url: "https://example.com".into(),
            snippet: "An example.".into(),
        }];
        let text = format_results(&results, "Startpage");
        assert!(text.contains("[Source: Startpage]"), "Should include source: {text}");
    }

    #[test]
    fn test_format_results_single() {
        let results = vec![SearchResult {
            title: "Example".into(),
            url: "https://example.com".into(),
            snippet: "An example site.".into(),
        }];
        let text = format_results(&results, "Test");
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
        let text = format_results(&results, "Test");
        assert!(text.contains("1. First"));
        assert!(text.contains("2. Second"));
    }

    // ── Startpage parser tests ──────────────────────────────────────

    #[test]
    fn test_strip_style_blocks() {
        let html = r#"before<style data-emotion="css abc">.foo{color:red;}</style>after"#;
        assert_eq!(strip_style_blocks(html), "beforeafter");
    }

    #[test]
    fn test_strip_style_blocks_multiple() {
        let html = "a<style>.x{}</style>b<style>.y{}</style>c";
        assert_eq!(strip_style_blocks(html), "abc");
    }

    #[test]
    fn test_strip_style_blocks_none() {
        let html = "no styles here";
        assert_eq!(strip_style_blocks(html), "no styles here");
    }

    #[test]
    fn test_strip_style_blocks_empty() {
        assert_eq!(strip_style_blocks(""), "");
    }

    #[test]
    fn test_extract_between() {
        let s = r#"<h2 class="title">Hello</h2>"#;
        let result = extract_between(s, "<h2", "</h2>");
        assert_eq!(result, Some(" class=\"title\">Hello"));
    }

    #[test]
    fn test_extract_between_not_found() {
        assert_eq!(extract_between("no match", "<h2", "</h2>"), None);
    }

    #[test]
    fn test_parse_startpage_results_synthetic() {
        // Minimal Startpage-style HTML
        let html = r#"
        <a class="result-title result-link" href="https://example.com" data-testid="gl-title-link">
            <h2 class="wgl-title">Example Domain</h2>
        </a>
        <p class="description css-abc">This is an example website.</p>

        <a class="result-title" href="https://rust-lang.org" data-testid="gl-title-link">
            <h2 class="wgl-title">Rust Language</h2>
        </a>
        <p class="description css-xyz">A systems programming language.</p>
        "#;

        let results = parse_startpage_results(html, 10);
        assert_eq!(results.len(), 2, "Should parse 2 results, got: {results:?}");
        assert_eq!(results[0].title, "Example Domain");
        assert_eq!(results[0].url, "https://example.com");
        assert_eq!(results[0].snippet, "This is an example website.");
        assert_eq!(results[1].title, "Rust Language");
        assert_eq!(results[1].url, "https://rust-lang.org");
        assert_eq!(results[1].snippet, "A systems programming language.");
    }

    #[test]
    fn test_parse_startpage_results_with_inline_styles() {
        // Startpage injects <style> blocks between elements — this is the real-world case
        let html = r#"
        <a href="https://example.com" data-testid="gl-title-link">
            <style data-emotion="css i3irj7">.css-i3irj7{line-height:18px;}</style>
            <h2 class="wgl-title css-i3irj7">Example With Styles</h2>
        </a>
        <style data-emotion="css desc">.css-desc{color:#1e222d;}</style>
        <p class="description css-desc">Snippet after style blocks.</p>
        "#;

        let results = parse_startpage_results(html, 10);
        assert_eq!(results.len(), 1, "Should parse through inline styles: {results:?}");
        assert_eq!(results[0].title, "Example With Styles");
        assert_eq!(results[0].url, "https://example.com");
        assert_eq!(results[0].snippet, "Snippet after style blocks.");
    }

    #[test]
    fn test_parse_startpage_results_with_bold_in_snippet() {
        let html = r#"
        <a href="https://example.com" data-testid="gl-title-link">
            <h2 class="wgl-title">Bold Test</h2>
        </a>
        <p class="description css-x"><b>Rust</b> is a <b>programming language</b>.</p>
        "#;

        let results = parse_startpage_results(html, 10);
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].snippet, "Rust is a programming language.");
    }

    #[test]
    fn test_parse_startpage_results_with_html_entities() {
        let html = r#"
        <a href="https://example.com" data-testid="gl-title-link">
            <h2 class="wgl-title">Tom &amp; Jerry</h2>
        </a>
        <p class="description css-x">It&#39;s a &lt;classic&gt; show.</p>
        "#;

        let results = parse_startpage_results(html, 10);
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].title, "Tom & Jerry");
        assert_eq!(results[0].snippet, "It's a <classic> show.");
    }

    #[test]
    fn test_parse_startpage_results_respects_max() {
        let html = r#"
        <a href="https://a.com" data-testid="gl-title-link"><h2 class="wgl-title">A</h2></a>
        <p class="description css-x">snip a</p>
        <a href="https://b.com" data-testid="gl-title-link"><h2 class="wgl-title">B</h2></a>
        <p class="description css-x">snip b</p>
        <a href="https://c.com" data-testid="gl-title-link"><h2 class="wgl-title">C</h2></a>
        <p class="description css-x">snip c</p>
        "#;

        let results = parse_startpage_results(html, 2);
        assert_eq!(results.len(), 2, "Should respect max_results=2");
        assert_eq!(results[0].title, "A");
        assert_eq!(results[1].title, "B");
    }

    #[test]
    fn test_parse_startpage_results_empty_html() {
        let results = parse_startpage_results("", 10);
        assert!(results.is_empty());
    }

    #[test]
    fn test_parse_startpage_results_no_results_page() {
        let html = "<html><body>No search results here</body></html>";
        let results = parse_startpage_results(html, 10);
        assert!(results.is_empty());
    }

    #[test]
    fn test_parse_startpage_results_missing_snippet() {
        // Some results may not have a description paragraph
        let html = r#"
        <a href="https://example.com" data-testid="gl-title-link">
            <h2 class="wgl-title">No Snippet Result</h2>
        </a>
        <div class="other-stuff">not a description</div>
        "#;

        let results = parse_startpage_results(html, 10);
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].title, "No Snippet Result");
        assert_eq!(results[0].snippet, "");
    }

    #[test]
    fn test_parse_startpage_results_utf8() {
        let html = r#"
        <a href="https://example.de" data-testid="gl-title-link">
            <h2 class="wgl-title">Ünïcödé Tëst</h2>
        </a>
        <p class="description css-x">Ärger mit Ümlauten: schön!</p>
        "#;

        let results = parse_startpage_results(html, 10);
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].title, "Ünïcödé Tëst");
        assert_eq!(results[0].snippet, "Ärger mit Ümlauten: schön!");
    }

    // ── Startpage blocking detection ────────────────────────────────

    #[test]
    fn test_is_startpage_blocked_normal_page() {
        let html = r#"<a data-testid="gl-title-link"><h2>Result</h2></a>"#;
        assert!(!is_startpage_blocked(html));
    }

    #[test]
    fn test_is_startpage_blocked_no_results() {
        let html = "<html><body>Some error page</body></html>";
        assert!(is_startpage_blocked(html));
    }

    // ── DuckDuckGo parser tests (kept for fallback) ─────────────────

    #[test]
    fn test_parse_ddg_results_synthetic() {
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

    // ── DuckDuckGo CAPTCHA detection ────────────────────────────────

    #[test]
    fn test_is_ddg_captcha_with_anomaly() {
        let html = r#"<div class="anomaly-modal__title">Unfortunately, bots use DuckDuckGo too.</div>"#;
        assert!(is_ddg_captcha(html));
    }

    #[test]
    fn test_is_ddg_captcha_with_challenge() {
        let html = "Please complete the following challenge to confirm this search was made by a human.";
        assert!(is_ddg_captcha(html));
    }

    #[test]
    fn test_is_ddg_captcha_normal_page() {
        let html = r#"<a class="result__a" href="https://example.com">Example</a>"#;
        assert!(!is_ddg_captcha(html));
    }

    // ── DuckDuckGo URL helpers ──────────────────────────────────────

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
    fn test_extract_attr() {
        assert_eq!(extract_attr(r#"href="https://x.com""#, "href=\""), "https://x.com");
        assert_eq!(extract_attr("no match", "href=\""), "");
    }

    // ── Tool input validation ───────────────────────────────────────

    #[tokio::test]
    async fn test_empty_query() {
        let tool = WebSearchTool;
        let result = tool
            .call(serde_json::json!({"query": ""}), &test_ctx())
            .await;
        assert!(result.is_err());
        let err = result.unwrap_err().to_string();
        assert!(
            err.contains("empty") || err.contains("Query"),
            "Should reject empty query: {err}"
        );
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
        let result = tool.call(serde_json::json!({}), &test_ctx()).await;
        assert!(result.is_err());
    }

    // ── Integration tests (require network) ─────────────────────────

    #[tokio::test]
    async fn test_search_returns_results() {
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
                        assert!(
                            t.contains("1."),
                            "Should have at least one result, got: {}",
                            &t[..t.len().min(500)]
                        );
                        assert!(
                            t.contains("http"),
                            "Should contain URLs, got: {}",
                            &t[..t.len().min(500)]
                        );
                        // Should mention the source
                        assert!(
                            t.contains("[Source:"),
                            "Should mention source, got: {}",
                            &t[..t.len().min(500)]
                        );
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
                        let count = t
                            .lines()
                            .filter(|l| {
                                l.starts_with(|c: char| c.is_ascii_digit()) && l.contains(". ")
                            })
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

    #[tokio::test]
    async fn test_startpage_parser_on_live_html() {
        // Fetch real Startpage HTML and verify parser works
        let client = match build_search_client() {
            Ok(c) => c,
            Err(e) => {
                eprintln!("Skipping: {e}");
                return;
            }
        };

        let response = match client
            .get("https://www.startpage.com/do/search")
            .query(&[("query", "rust programming language")])
            .send()
            .await
        {
            Ok(r) => r,
            Err(e) => {
                eprintln!("Skipping network test: {e}");
                return;
            }
        };

        let html = match response.text().await {
            Ok(h) => h,
            Err(e) => {
                eprintln!("Skipping: {e}");
                return;
            }
        };

        if is_startpage_blocked(&html) {
            eprintln!("Skipping: Startpage blocked from this IP");
            return;
        }

        let results = parse_startpage_results(&html, 10);
        assert!(
            !results.is_empty(),
            "Should parse results from live Startpage HTML"
        );
        // Verify structure: every result should have title and URL
        for r in &results {
            assert!(!r.title.is_empty(), "Title should not be empty: {r:?}");
            assert!(
                r.url.starts_with("http"),
                "URL should start with http: {r:?}"
            );
        }
    }
}
