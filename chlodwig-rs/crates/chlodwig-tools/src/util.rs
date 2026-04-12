//! Shared utility functions for tool implementations.

/// Truncate `text` in-place to at most `max_bytes`, appending `suffix` if truncated.
///
/// Unlike `String::truncate(max)`, this never panics on multi-byte UTF-8
/// characters — it walks backwards from `max_bytes` to find the last valid
/// char boundary. See Gotcha #16 and #28 in CLAUDE.md.
pub(crate) fn safe_truncate(text: &mut String, max_bytes: usize, suffix: &str) {
    if text.len() > max_bytes {
        let mut end = max_bytes;
        while end > 0 && !text.is_char_boundary(end) {
            end -= 1;
        }
        text.truncate(end);
        text.push_str(suffix);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_safe_truncate_no_op_when_short() {
        let mut text = "hello".to_string();
        safe_truncate(&mut text, 100, "\n...");
        assert_eq!(text, "hello");
    }

    #[test]
    fn test_safe_truncate_ascii() {
        let mut text = "a".repeat(200);
        safe_truncate(&mut text, 100, "\n...");
        assert!(text.starts_with(&"a".repeat(100)));
        assert!(text.ends_with("\n..."));
    }

    /// Regression: byte 100 lands inside 3-byte '├' (E2 94 9C)
    #[test]
    fn test_safe_truncate_utf8_3byte_boundary() {
        let mut text = "a".repeat(99) + "├───" + &"b".repeat(100);
        assert!(!text.is_char_boundary(100)); // mid-char
        safe_truncate(&mut text, 100, " [cut]");
        assert!(text.ends_with(" [cut]"));
        // Truncated at byte 99, which is the last valid boundary before 100
        assert_eq!(&text[..99], &"a".repeat(99));
    }

    /// Regression: byte offset inside 4-byte emoji '🦀'
    #[test]
    fn test_safe_truncate_emoji_boundary() {
        let mut text = "a".repeat(98) + "🦀" + &"b".repeat(100);
        // 🦀 spans bytes 98..102
        for offset in [99, 100, 101] {
            assert!(!text.is_char_boundary(offset));
        }
        safe_truncate(&mut text, 100, " [cut]");
        assert!(text.ends_with(" [cut]"));
    }

    #[test]
    fn test_safe_truncate_exact_char_boundary() {
        let mut text = "a".repeat(100) + "ü" + &"b".repeat(100);
        assert!(text.is_char_boundary(100));
        safe_truncate(&mut text, 100, " [cut]");
        assert!(text.starts_with(&"a".repeat(100)));
        assert!(text.ends_with(" [cut]"));
    }

    #[test]
    fn test_safe_truncate_all_multibyte() {
        // All 2-byte chars: 'ü' = C3 BC. 50 chars = 100 bytes.
        let mut text = "ü".repeat(60); // 120 bytes
        safe_truncate(&mut text, 100, "…");
        // Should truncate at byte 100 which is a valid boundary (50 * 2)
        assert!(text.ends_with("…"));
        // 50 'ü' chars + "…"
        let without_suffix = &text[..text.len() - "…".len()];
        assert_eq!(without_suffix.chars().count(), 50);
    }

    #[test]
    fn test_safe_truncate_zero_max() {
        let mut text = "hello".to_string();
        safe_truncate(&mut text, 0, " [cut]");
        assert_eq!(text, " [cut]");
    }
}
