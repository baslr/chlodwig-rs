use super::*;

#[test]
fn test_spinner_cycles_through_frames() {
    let mut app = App::new("test".into());
    assert_eq!(app.spinner_char(), '⠋');
    app.tick_spinner();
    assert_eq!(app.spinner_char(), '⠙');
    for _ in 0..9 {
        app.tick_spinner();
    }
    assert_eq!(app.spinner_char(), '⠋');
}

#[test]
fn test_spinner_shown_in_thinking_text() {
    let mut app = App::new("test".into());
    app.is_loading = true;
    app.lines_dirty = true;
    app.rebuild_lines();

    let all_text: String = app.rendered_lines.iter()
        .map(|rl| rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>())
        .collect::<Vec<_>>()
        .join("\n");
    assert!(all_text.contains('⠋'), "Should show spinner char in thinking text, got:\n{all_text}");
}

// --- Regression tests for the spinner performance fix ---
// The bug: spinner tick called mark_dirty() → full rebuild_lines() on every
// 100ms tick → re-parsed all markdown, re-wrapped all lines → froze the UI
// when rendered_lines was large (700+).

#[test]
fn test_spinner_tick_does_not_set_lines_dirty() {
    // Setup: app with content, is_loading, lines already built
    let mut app = App::new("test".into());
    for i in 0..100 {
        app.display_blocks.push(DisplayBlock::AssistantText(format!("Line {i} with **bold** and `code`")));
    }
    app.is_loading = true;
    app.mark_dirty();
    app.rebuild_lines();

    // Precondition: lines_dirty is false after rebuild
    assert!(!app.lines_dirty, "lines_dirty should be false after rebuild");

    // Act: tick the spinner (simulates what the event loop does)
    app.tick_spinner();
    app.update_spinner_line();

    // Assert: lines_dirty must still be false — no full rebuild needed
    assert!(!app.lines_dirty, "spinner tick must NOT set lines_dirty");
}

#[test]
fn test_update_spinner_line_changes_spinner_char() {
    let mut app = App::new("test".into());
    app.is_loading = true;
    app.mark_dirty();
    app.rebuild_lines();

    // The last line should be "⠋ Thinking..."
    let last_text = app.rendered_lines.last()
        .map(|rl| rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>())
        .unwrap_or_default();
    assert!(last_text.contains('⠋'), "Initial spinner should be ⠋, got: {last_text}");

    // Tick spinner and update line (WITHOUT rebuild_lines)
    app.tick_spinner();
    app.update_spinner_line();

    let last_text = app.rendered_lines.last()
        .map(|rl| rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>())
        .unwrap_or_default();
    assert!(last_text.contains('⠙'), "After tick, spinner should be ⠙, got: {last_text}");
    assert!(last_text.contains("Thinking..."), "Should still contain Thinking...");
}

#[test]
fn test_update_spinner_line_is_noop_when_not_loading() {
    let mut app = App::new("test".into());
    app.is_loading = true;
    app.mark_dirty();
    app.rebuild_lines();
    let before = app.rendered_lines.len();

    // Stop loading
    app.is_loading = false;
    app.tick_spinner();
    app.update_spinner_line();

    // Should not change anything
    assert_eq!(app.rendered_lines.len(), before);
}

#[test]
fn test_update_spinner_line_is_noop_when_streaming() {
    let mut app = App::new("test".into());
    app.is_loading = true;
    app.streaming_buffer = "partial content".into();
    app.mark_dirty();
    app.rebuild_lines();

    let last_text = app.rendered_lines.last()
        .map(|rl| rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>())
        .unwrap_or_default();
    // Should NOT have Thinking... (streaming buffer is not empty)
    assert!(!last_text.contains("Thinking..."),
        "Should not show Thinking when streaming, got: {last_text}");

    // update_spinner_line should be a no-op
    app.tick_spinner();
    app.update_spinner_line();

    let last_text_after = app.rendered_lines.last()
        .map(|rl| rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>())
        .unwrap_or_default();
    assert_eq!(last_text, last_text_after, "Should not have changed");
}

#[test]
fn test_update_spinner_does_not_corrupt_non_spinner_lines() {
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::AssistantText("Hello world".into()));
    app.is_loading = false; // not loading — no spinner line
    app.mark_dirty();
    app.rebuild_lines();

    let last_text = app.rendered_lines.last()
        .map(|rl| rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>())
        .unwrap_or_default();

    // Turn on loading and try update_spinner_line — should NOT replace "Hello world"
    // because the last line doesn't contain "Thinking..."
    app.is_loading = true;
    app.tick_spinner();
    app.update_spinner_line();

    let last_text_after = app.rendered_lines.last()
        .map(|rl| rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>())
        .unwrap_or_default();
    assert_eq!(last_text, last_text_after,
        "update_spinner_line must not replace non-spinner lines");
}

#[test]
fn test_rebuild_lines_not_needed_for_spinner_animation() {
    // The full scenario: build lines, then simulate 10 spinner ticks.
    // rebuild_lines() should NOT be called (lines_dirty stays false).
    // The spinner char should still update in rendered_lines.
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::AssistantText("Some content".into()));
    app.is_loading = true;
    app.mark_dirty();
    app.rebuild_lines();

    assert!(!app.lines_dirty);
    let initial_len = app.rendered_lines.len();

    // Simulate 10 spinner ticks
    let mut seen_chars = std::collections::HashSet::new();
    for _ in 0..10 {
        app.tick_spinner();
        app.update_spinner_line();

        // lines_dirty must stay false
        assert!(!app.lines_dirty, "lines_dirty must not be set by spinner tick");
        // rendered_lines length must not change
        assert_eq!(app.rendered_lines.len(), initial_len);

        let last_text = app.rendered_lines.last()
            .map(|rl| rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>())
            .unwrap_or_default();
        assert!(last_text.contains("Thinking..."));
        // Collect the spinner char (first char of the line)
        if let Some(ch) = last_text.chars().next() {
            seen_chars.insert(ch);
        }
    }

    // Should have seen multiple different spinner chars
    assert!(seen_chars.len() > 1,
        "Spinner should animate through different chars, only saw: {seen_chars:?}");
}
