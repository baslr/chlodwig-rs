use super::*;

#[test]
fn test_clear_resets_display_blocks() {
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::UserMessage("hello".into()));
    app.display_blocks.push(DisplayBlock::AssistantText("world".into()));
    app.mark_dirty();
    app.rebuild_lines();
    assert!(app.rendered_lines.len() > 2);

    app.clear_conversation();

    assert_eq!(app.display_blocks.len(), 1);
    assert!(
        app.rendered_lines.len() <= 3,
        "Should have very few lines after clear, got {}",
        app.rendered_lines.len()
    );
}

#[test]
fn test_clear_resets_scroll() {
    let mut app = app_with_lines(100);
    app.scroll_up(50);
    assert!(!app.auto_scroll.is_active());

    app.clear_conversation();

    assert_eq!(app.scroll, 0);
    assert!(app.auto_scroll.is_active());
}

#[test]
fn test_clear_resets_streaming() {
    let mut app = App::new("test".into());
    app.streaming_buffer = "partial output...".into();
    app.is_loading = true;

    app.clear_conversation();

    assert!(app.streaming_buffer.is_empty());
    assert!(!app.is_loading);
}

#[test]
fn test_clear_resets_tokens() {
    let mut app = App::new("test".into());
    app.total_input_tokens = 50000;
    app.total_output_tokens = 10000;
    app.turn_usage.input_tokens = 5000;
    app.turn_usage.output_tokens = 1000;
    app.turn_usage.cache_tokens = 20000;
    app.turn_count = 5;
    app.api_request_count = 10;

    app.clear_conversation();

    assert_eq!(app.total_input_tokens, 0);
    assert_eq!(app.total_output_tokens, 0);
    assert_eq!(app.turn_usage.input_tokens, 0);
    assert_eq!(app.turn_usage.output_tokens, 0);
    assert_eq!(app.turn_usage.cache_tokens, 0);
    assert_eq!(app.turn_count, 0);
    assert_eq!(app.api_request_count, 0);
}

#[test]
fn test_clear_shows_system_message() {
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::UserMessage("hello".into()));

    app.clear_conversation();

    assert_eq!(app.display_blocks.len(), 1);
    match &app.display_blocks[0] {
        DisplayBlock::SystemMessage(msg) => {
            assert!(msg.contains("cleared"), "Should mention 'cleared', got: {msg}");
        }
        other => panic!("Expected SystemMessage, got: {other:?}"),
    }
}

#[test]
fn test_clear_resets_requests() {
    let mut app = App::new("test".into());
    app.requests_log.push_back(RequestLogEntry {
        timestamp: "t1".into(),
        request_body: "{}".into(),
        response_model: String::new(),
        response_input_tokens: 0,
        response_output_tokens: 0,
        duration_ms: Some(100),
        response_chunks: Vec::new(),
    });
    app.requests_dirty = true;
    app.rebuild_requests_lines();
    app.requests_scroll = 5;

    app.clear_conversation();

    assert!(app.requests_log.is_empty(), "requests_log should be cleared");
    assert!(
        app.requests_lines.is_empty(),
        "requests_lines should be cleared"
    );
    assert_eq!(app.requests_scroll, 0, "requests_scroll should be 0");
    assert!(!app.requests_dirty, "requests_dirty should be false");
}

#[test]
fn test_system_message_multiline_renders_each_line_separately() {
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::SystemMessage(
        "Line one\nLine two\nLine three".into(),
    ));
    app.mark_dirty();
    app.rebuild_lines();

    // Find all rendered lines that contain our text
    let line_texts: Vec<String> = app
        .rendered_lines
        .iter()
        .map(|rl| rl.spans.iter().map(|(text, _style)| text.as_str()).collect::<String>())
        .collect();

    // Each line should appear as a separate RenderedLine
    let has_line_one = line_texts.iter().any(|l| l.contains("Line one"));
    let has_line_two = line_texts.iter().any(|l| l.contains("Line two"));
    let has_line_three = line_texts.iter().any(|l| l.contains("Line three"));

    assert!(has_line_one, "Should have 'Line one' as a separate line, got: {line_texts:?}");
    assert!(has_line_two, "Should have 'Line two' as a separate line, got: {line_texts:?}");
    assert!(has_line_three, "Should have 'Line three' as a separate line, got: {line_texts:?}");

    // They should NOT all be on the same RenderedLine
    let all_on_one = line_texts.iter().any(|l| {
        l.contains("Line one") && l.contains("Line two") && l.contains("Line three")
    });
    assert!(
        !all_on_one,
        "All three lines should NOT be on a single RenderedLine"
    );
}
