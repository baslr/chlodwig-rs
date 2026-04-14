//! Tests for multiline UserMessage display.
//! Bug: When the user submits multiline input (with \n), the "You: ..." output
//! renders everything on a single line. Newlines must be preserved.

use super::*;

#[test]
fn test_user_message_multiline_renders_multiple_lines() {
    let mut app = App::new("test-model".into());
    app.display_blocks
        .push(DisplayBlock::UserMessage("zeile 1\nzeile 2\nzeile 3".into()));
    app.mark_dirty();
    app.rebuild_lines();

    // The first line should have "You: zeile 1"
    // Subsequent lines should have "      zeile 2" and "      zeile 3" (indented)
    // Plus an empty separator line at the end.
    let lines = &app.rendered_lines;

    // We should have at least 4 lines: 3 content lines + 1 empty separator
    assert!(
        lines.len() >= 4,
        "Expected at least 4 lines for a 3-line user message, got {}",
        lines.len()
    );

    let line0 = lines[0].to_line().to_string();
    assert!(
        line0.contains("You: ") && line0.contains("zeile 1"),
        "First line should be 'You: zeile 1', got: {line0:?}"
    );

    let line1 = lines[1].to_line().to_string();
    assert!(
        line1.contains("zeile 2"),
        "Second line should contain 'zeile 2', got: {line1:?}"
    );
    // Should NOT contain "You:" prefix on continuation lines
    assert!(
        !line1.contains("You:"),
        "Continuation line should not have 'You:' prefix, got: {line1:?}"
    );

    let line2 = lines[2].to_line().to_string();
    assert!(
        line2.contains("zeile 3"),
        "Third line should contain 'zeile 3', got: {line2:?}"
    );
}

#[test]
fn test_user_message_single_line_unchanged() {
    // Single-line messages should still work as before
    let mut app = App::new("test-model".into());
    app.display_blocks
        .push(DisplayBlock::UserMessage("hello world".into()));
    app.mark_dirty();
    app.rebuild_lines();

    let lines = &app.rendered_lines;
    // Should be 2 lines: "You: hello world" + empty separator
    assert_eq!(lines.len(), 2, "Single-line message: 1 content + 1 separator");

    let line0 = lines[0].to_line().to_string();
    assert!(
        line0.contains("You: ") && line0.contains("hello world"),
        "Should be 'You: hello world', got: {line0:?}"
    );
}

#[test]
fn test_user_message_multiline_continuation_indented() {
    // Continuation lines should be indented to align with the text after "You: "
    let mut app = App::new("test-model".into());
    app.display_blocks
        .push(DisplayBlock::UserMessage("line1\nline2".into()));
    app.mark_dirty();
    app.rebuild_lines();

    let lines = &app.rendered_lines;

    // First line starts with "You: "
    let line0_spans: Vec<String> = lines[0]
        .spans
        .iter()
        .map(|(t, _s): &(String, Style)| t.clone())
        .collect();
    assert_eq!(line0_spans[0], "You: ");

    // Second line should start with exactly 5 spaces matching "You: " width
    let line1_spans: Vec<String> = lines[1]
        .spans
        .iter()
        .map(|(t, _s): &(String, Style)| t.clone())
        .collect();
    assert_eq!(
        line1_spans[0], "     ",
        "Continuation indent must be exactly 5 spaces to align with text after 'You: ', got spans: {line1_spans:?}"
    );
}

#[test]
fn test_user_message_multiline_utf8() {
    // UTF-8 multiline: Umlauts should not break anything
    let mut app = App::new("test-model".into());
    app.display_blocks
        .push(DisplayBlock::UserMessage("Ähre\nÖffentlich\nÜbel".into()));
    app.mark_dirty();
    app.rebuild_lines();

    let lines = &app.rendered_lines;
    assert!(lines.len() >= 4, "3 content lines + separator");

    let line0 = lines[0].to_line().to_string();
    assert!(line0.contains("Ähre"), "First line: {line0:?}");

    let line1 = lines[1].to_line().to_string();
    assert!(line1.contains("Öffentlich"), "Second line: {line1:?}");

    let line2 = lines[2].to_line().to_string();
    assert!(line2.contains("Übel"), "Third line: {line2:?}");
}

#[test]
fn test_user_message_empty_lines_preserved() {
    // Empty lines in the middle should be preserved
    let mut app = App::new("test-model".into());
    app.display_blocks
        .push(DisplayBlock::UserMessage("before\n\nafter".into()));
    app.mark_dirty();
    app.rebuild_lines();

    let lines = &app.rendered_lines;
    // Should have: "You: before", "      " (empty continuation), "      after", ""
    assert!(lines.len() >= 4, "Expected at least 4 lines, got {}", lines.len());

    let line0 = lines[0].to_line().to_string();
    assert!(line0.contains("before"), "First line: {line0:?}");

    // Line 1 should be the empty continuation (just indent)
    let line1 = lines[1].to_line().to_string();
    let line1_trimmed = line1.trim();
    assert!(
        line1_trimmed.is_empty(),
        "Middle empty line should be blank (just indent), got: {line1:?}"
    );

    let line2 = lines[2].to_line().to_string();
    assert!(line2.contains("after"), "Third line: {line2:?}");
}
