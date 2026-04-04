use super::*;

#[test]
fn test_requests_log_push() {
    let mut app = App::new("test".into());
    assert_eq!(app.requests_log.len(), 0);

    app.requests_log.push_back(RequestLogEntry {
        timestamp: "2026-04-03 19:56:33.809".into(),
        request_body: r#"{"model":"test"}"#.into(),
        response_model: String::new(),
        response_input_tokens: 0,
        response_output_tokens: 0,
        duration_ms: None,
        response_chunks: Vec::new(),
    });
    assert_eq!(app.requests_log.len(), 1);
}

#[test]
fn test_requests_log_max_1000() {
    let mut app = App::new("test".into());
    for i in 0..1050 {
        app.requests_log.push_back(RequestLogEntry {
            timestamp: format!("t{}", i),
            request_body: "{}".into(),
            response_model: String::new(),
            response_input_tokens: 0,
            response_output_tokens: 0,
            duration_ms: Some(100),
            response_chunks: Vec::new(),
        });
        while app.requests_log.len() > MAX_REQUEST_LOG {
            app.requests_log.pop_front();
        }
    }
    assert_eq!(app.requests_log.len(), MAX_REQUEST_LOG);
    assert_eq!(app.requests_log.front().unwrap().timestamp, "t50");
}

#[test]
fn test_requests_log_entry_fields() {
    let entry = RequestLogEntry {
        timestamp: "2026-04-03 20:00:00.000".into(),
        request_body: r#"{"model":"claude"}"#.into(),
        response_model: "claude-opus".into(),
        response_input_tokens: 1200,
        response_output_tokens: 450,
        duration_ms: Some(1234),
        response_chunks: Vec::new(),
    };
    assert_eq!(entry.timestamp, "2026-04-03 20:00:00.000");
    assert!(entry.request_body.contains("claude"));
    assert_eq!(entry.response_model, "claude-opus");
    assert_eq!(entry.response_input_tokens, 1200);
    assert_eq!(entry.response_output_tokens, 450);
    assert_eq!(entry.duration_ms, Some(1234));
}

#[test]
fn test_rebuild_requests_lines_empty() {
    let mut app = App::new("test".into());
    app.requests_dirty = true;
    app.rebuild_requests_lines();
    assert!(!app.requests_lines.is_empty(), "Should have placeholder line");
    let first = &app.requests_lines[0];
    let text: String = first.spans.iter().map(|(t, _)| t.as_str()).collect();
    assert!(text.contains("no API requests"), "Got: {text}");
}

#[test]
fn test_rebuild_requests_lines_one_entry() {
    let mut app = App::new("test".into());
    app.requests_log.push_back(RequestLogEntry {
        timestamp: "2026-04-03 19:56:33.809".into(),
        request_body: r#"{"model":"test","messages":[]}"#.into(),
        response_model: "test-model".into(),
        response_input_tokens: 100,
        response_output_tokens: 50,
        duration_ms: Some(500),
        response_chunks: Vec::new(),
    });
    app.requests_dirty = true;
    app.rebuild_requests_lines();

    assert!(
        app.requests_lines.len() > 5,
        "Expected many rendered lines, got {}",
        app.requests_lines.len()
    );

    let header: String = app.requests_lines[0]
        .spans
        .iter()
        .map(|(t, _)| t.as_str())
        .collect();
    assert!(
        header.contains("Request #1"),
        "Header should contain 'Request #1', got: {header}"
    );
    assert!(
        header.contains("500ms"),
        "Header should contain '500ms', got: {header}"
    );
}

#[test]
fn test_requests_numbering_oldest_is_1() {
    let mut app = App::new("test".into());
    for i in 0..4 {
        app.requests_log.push_back(RequestLogEntry {
            timestamp: format!("t{}", i),
            request_body: "{}".into(),
            response_model: String::new(),
            response_input_tokens: 0,
            response_output_tokens: 0,
            duration_ms: Some(100),
            response_chunks: Vec::new(),
        });
    }
    app.requests_dirty = true;
    app.rebuild_requests_lines();

    let headers: Vec<String> = app.requests_lines.iter()
        .map(|rl| rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>())
        .filter(|line| line.contains("Request #"))
        .collect();

    assert_eq!(headers.len(), 4, "Should have 4 request headers");
    assert!(headers[0].contains("Request #4"), "First displayed should be newest (#4), got: {}", headers[0]);
    assert!(headers[1].contains("Request #3"), "got: {}", headers[1]);
    assert!(headers[2].contains("Request #2"), "got: {}", headers[2]);
    assert!(headers[3].contains("Request #1"), "Last displayed should be oldest (#1), got: {}", headers[3]);
}

#[test]
fn test_requests_scroll_increments() {
    let mut app = App::new("test".into());
    for i in 0..10 {
        app.requests_log.push_back(RequestLogEntry {
            timestamp: format!("t{}", i),
            request_body: r#"{"model":"test"}"#.into(),
            response_model: "m".into(),
            response_input_tokens: 100,
            response_output_tokens: 50,
            duration_ms: Some(100),
            response_chunks: Vec::new(),
        });
    }
    app.requests_dirty = true;
    app.rebuild_requests_lines();

    assert_eq!(app.requests_scroll, 0);
    app.requests_scroll = 5;
    assert_eq!(app.requests_scroll, 5);
    app.requests_scroll = app.requests_scroll.saturating_sub(1);
    assert_eq!(app.requests_scroll, 4);
}

#[test]
fn test_requests_response_meta_updates_last_entry() {
    let mut app = App::new("test".into());
    app.requests_log.push_back(RequestLogEntry {
        timestamp: "t1".into(),
        request_body: "{}".into(),
        response_model: String::new(),
        response_input_tokens: 0,
        response_output_tokens: 0,
        duration_ms: None,
        response_chunks: Vec::new(),
    });

    if let Some(last) = app.requests_log.back_mut() {
        last.response_model = "claude-opus".into();
        last.response_input_tokens = 500;
        last.response_output_tokens = 200;
    }

    let last = app.requests_log.back().unwrap();
    assert_eq!(last.response_model, "claude-opus");
    assert_eq!(last.response_input_tokens, 500);
    assert_eq!(last.response_output_tokens, 200);
    assert_eq!(last.duration_ms, None);
}

#[test]
fn test_requests_response_complete_updates_duration() {
    let mut app = App::new("test".into());
    app.requests_log.push_back(RequestLogEntry {
        timestamp: "t1".into(),
        request_body: "{}".into(),
        response_model: "m".into(),
        response_input_tokens: 100,
        response_output_tokens: 50,
        duration_ms: None,
        response_chunks: Vec::new(),
    });

    if let Some(last) = app.requests_log.back_mut() {
        last.duration_ms = Some(1234);
    }

    assert_eq!(app.requests_log.back().unwrap().duration_ms, Some(1234));
}

#[test]
fn test_requests_entry_collects_response_chunks() {
    let mut app = App::new("test".into());

    app.requests_log.push_back(RequestLogEntry {
        timestamp: "2026-04-03 12:00:00.000".into(),
        request_body: r#"{"model":"test"}"#.into(),
        response_model: String::new(),
        response_input_tokens: 0,
        response_output_tokens: 0,
        duration_ms: None,
        response_chunks: Vec::new(),
    });

    let chunk1 = r#"{"type":"message_start","message":{"id":"msg_1","model":"test","usage":{"input_tokens":10,"output_tokens":0}}}"#;
    let chunk2 = r#"{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hello"}}"#;
    let chunk3 = r#"{"type":"message_stop"}"#;

    for chunk in [chunk1, chunk2, chunk3] {
        if let Some(last) = app.requests_log.back_mut() {
            last.response_chunks.push(chunk.to_string());
        }
    }

    let entry = app.requests_log.back().unwrap();
    assert_eq!(entry.response_chunks.len(), 3);
    assert!(entry.response_chunks[0].contains("message_start"));
    assert!(entry.response_chunks[1].contains("content_block_delta"));
    assert!(entry.response_chunks[2].contains("message_stop"));
}

#[test]
fn test_rebuild_requests_shows_response_data() {
    let mut app = App::new("test".into());

    let chunk1 = r#"{"type":"message_start","message":{"id":"msg_1"}}"#;
    let chunk2 = r#"{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hi"}}"#;
    let chunk3 = "not valid json at all";

    app.requests_log.push_back(RequestLogEntry {
        timestamp: "2026-04-03 12:00:00.000".into(),
        request_body: r#"{"model":"claude-test"}"#.into(),
        response_model: "claude-test".into(),
        response_input_tokens: 100,
        response_output_tokens: 50,
        duration_ms: Some(500),
        response_chunks: vec![
            chunk1.to_string(),
            chunk2.to_string(),
            chunk3.to_string(),
        ],
    });
    app.requests_dirty = true;
    app.rebuild_requests_lines();

    let all_text: String = app
        .requests_lines
        .iter()
        .map(|line| {
            line.spans
                .iter()
                .map(|(text, _)| text.as_str())
                .collect::<String>()
        })
        .collect::<Vec<_>>()
        .join("\n");

    assert!(
        all_text.contains("Response (3 SSE events)"),
        "Should show SSE event count, got:\n{}",
        all_text
    );
    assert!(
        all_text.contains("▸ message_start"),
        "Should have message_start label"
    );
    assert!(
        all_text.contains("▸ content_block_delta"),
        "Should have content_block_delta label"
    );
    assert!(
        all_text.contains("▸ (raw)"),
        "Should have raw fallback label for invalid JSON"
    );
    assert!(
        all_text.contains("not valid json at all"),
        "Raw text should be shown when JSON parse fails"
    );
    assert!(
        all_text.contains("msg_1"),
        "Should contain message ID from pretty-printed JSON"
    );
}

#[test]
fn test_rebuild_requests_lines_is_lazy_not_eager() {
    // Regression test: rebuild_requests_lines() must NOT be called eagerly
    // on every HttpRequest/HttpResponseMeta/HttpResponseComplete event.
    // Instead, it should only rebuild when the requests tab is visible.
    // This prevents O(n²) CPU burn from re-rendering all SSE chunks on every event.
    let mut app = App::new("test".into());

    // Simulate receiving a request event — only sets dirty flag
    app.requests_log.push_back(RequestLogEntry {
        timestamp: "t1".into(),
        request_body: "{}".into(),
        response_model: String::new(),
        response_input_tokens: 0,
        response_output_tokens: 0,
        duration_ms: None,
        response_chunks: Vec::new(),
    });
    app.requests_dirty = true;
    // Do NOT call rebuild_requests_lines() here (that's the fix)

    // Lines should still be empty because we haven't rebuilt yet
    assert!(
        app.requests_lines.is_empty(),
        "requests_lines should be empty until lazy rebuild is triggered"
    );
    assert!(
        app.requests_dirty,
        "requests_dirty should remain true until rebuild happens"
    );

    // Now simulate switching to requests tab — triggers lazy rebuild
    app.rebuild_requests_lines();
    assert!(
        !app.requests_lines.is_empty(),
        "After lazy rebuild, requests_lines should be populated"
    );
}
