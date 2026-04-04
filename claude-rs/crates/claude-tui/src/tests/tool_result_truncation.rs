/// Regression test: ToolResult preview truncation must not panic on UTF-8 boundaries.
/// Bug: `&t[..500]` panics when byte 500 is inside a multi-byte UTF-8 char (e.g. '├').
/// Fix: use `is_char_boundary()` to find the last char boundary at or before 500 bytes.

#[test]
fn test_tool_result_preview_truncation_at_utf8_boundary() {
    // Build a string where byte 500 falls inside a multi-byte character.
    // '├' is U+251C, encoded as 3 bytes: E2 94 9C.
    // Fill 498 bytes of ASCII, then put '├' at bytes 498..501.
    let mut text = "x".repeat(498);
    text.push('├'); // bytes 498..501
    text.push_str("remaining stuff");

    assert!(text.len() > 500);
    assert!(!text.is_char_boundary(500), "byte 500 should be inside '├'");

    // Simulate the truncation logic used in event_loop for ToolResult preview.
    // This must NOT panic.
    let preview = truncate_to_char_boundary(&text, 500);

    assert!(preview.len() <= 503, "truncated preview must be reasonable (max ~500 + ...)");
    assert!(preview.ends_with("..."), "should end with ellipsis");
    // Should contain the ASCII part but stop before or at the '├'
    assert!(preview.contains("xxx"), "should contain ASCII prefix");
}

#[test]
fn test_tool_result_preview_ascii_only() {
    let text = "a".repeat(600);
    let preview = truncate_to_char_boundary(&text, 500);
    assert_eq!(preview.len(), 503); // 500 chars + "..."
    assert!(preview.ends_with("..."));
}

#[test]
fn test_tool_result_preview_short_string_not_truncated() {
    let text = "hello world".to_string();
    let preview = truncate_to_char_boundary(&text, 500);
    assert_eq!(preview, "hello world");
}

#[test]
fn test_tool_result_preview_emoji_boundary() {
    // 🎉 is 4 bytes. Put it so byte 500 falls inside.
    let mut text = "a".repeat(499);
    text.push('🎉'); // bytes 499..503
    text.push_str("more text");

    assert!(!text.is_char_boundary(500));

    let preview = truncate_to_char_boundary(&text, 500);
    assert!(preview.len() <= 503); // 499 + "..." = 502 or less
    assert!(preview.ends_with("..."));
}

/// Helper matching the fix in event_loop: truncate at char boundary.
fn truncate_to_char_boundary(s: &str, max_bytes: usize) -> String {
    if s.len() <= max_bytes {
        return s.to_string();
    }
    // Find last char boundary at or before max_bytes
    let mut end = max_bytes;
    while end > 0 && !s.is_char_boundary(end) {
        end -= 1;
    }
    format!("{}...", &s[..end])
}
