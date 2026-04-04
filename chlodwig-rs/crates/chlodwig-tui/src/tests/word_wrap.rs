use super::*;

#[test]
fn test_wrap_breaks_at_word_boundary() {
    // "Hello world foo" at width 10 should break at the space:
    // Line 1: "Hello " (6 cols) — or "Hello" (5 cols) depending on trailing-space handling
    // Line 2: "world foo" (9 cols)
    // NOT: "Hello worl" / "d foo" (mid-word break)
    let line = RenderedLine {
        spans: vec![("Hello world foo".into(), Style::default())],
        wrap_prefix: None,
    };
    let wrapped = line.wrap(10);
    assert_eq!(wrapped.len(), 2, "Should wrap into 2 lines, got {}", wrapped.len());

    let line1: String = wrapped[0].spans.iter().map(|(t, _)| t.as_str()).collect();
    let line2: String = wrapped[1].spans.iter().map(|(t, _)| t.as_str()).collect();

    // Line 1 should NOT contain "worl" (mid-word break)
    assert!(
        !line1.contains("worl") || line1.contains("world"),
        "Should not break mid-word 'world'. Line1: '{line1}', Line2: '{line2}'"
    );
    // Line 2 should start with "world"
    assert!(
        line2.trim_start().starts_with("world"),
        "Second line should start with 'world', got: '{line2}'"
    );
}

#[test]
fn test_wrap_falls_back_to_char_break_without_spaces() {
    // No spaces → must fall back to character-level break
    let line = RenderedLine {
        spans: vec![("abcdefghijklmno".into(), Style::default())],
        wrap_prefix: None,
    };
    let wrapped = line.wrap(10);
    assert_eq!(wrapped.len(), 2, "15 chars at width 10 should produce 2 lines");
    assert_eq!(wrapped[0].display_width(), 10);
    assert_eq!(wrapped[1].display_width(), 5);
}

#[test]
fn test_wrap_word_boundary_multiple_lines() {
    // "aaa bbb ccc ddd" at width 8:
    // "aaa bbb " (8) or "aaa bbb" (7)
    // "ccc ddd" (7)
    let line = RenderedLine {
        spans: vec![("aaa bbb ccc ddd".into(), Style::default())],
        wrap_prefix: None,
    };
    let wrapped = line.wrap(8);
    assert_eq!(wrapped.len(), 2, "Should wrap into 2 lines, got {}", wrapped.len());

    let line2: String = wrapped[1].spans.iter().map(|(t, _)| t.as_str()).collect();
    assert!(
        line2.trim_start().starts_with("ccc"),
        "Second line should start with 'ccc', got: '{line2}'"
    );
}

#[test]
fn test_wrap_single_long_word_exceeds_width() {
    // One word longer than width — must break mid-word (no choice)
    let line = RenderedLine {
        spans: vec![("abcdefghijklmnop".into(), Style::default())],
        wrap_prefix: None,
    };
    let wrapped = line.wrap(10);
    assert_eq!(wrapped.len(), 2);
    assert_eq!(wrapped[0].display_width(), 10);
    assert_eq!(wrapped[1].display_width(), 6);
}

#[test]
fn test_wrap_breaks_at_hyphen() {
    // "foo-bar baz" at width 5 should break after the hyphen:
    // Line 1: "foo-" (4 cols)
    // Line 2: "bar " or "bar"
    // Line 3: "baz"
    // NOT: "foo-b" / "ar ba" / "z" (mid-word break)
    let line = RenderedLine {
        spans: vec![("foo-bar baz".into(), Style::default())],
        wrap_prefix: None,
    };
    let wrapped = line.wrap(5);

    let line1: String = wrapped[0].spans.iter().map(|(t, _)| t.as_str()).collect();
    assert!(
        line1.ends_with('-'),
        "First line should end with '-' (break after hyphen), got: '{line1}'"
    );
    let line2: String = wrapped[1].spans.iter().map(|(t, _)| t.as_str()).collect();
    assert!(
        line2.starts_with("bar"),
        "Second line should start with 'bar', got: '{line2}'"
    );
}
