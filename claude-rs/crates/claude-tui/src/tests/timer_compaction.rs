//! Tests for session/context timer and compaction counter in the title bar.

use std::time::{Duration, Instant};

use super::*;

#[test]
fn test_initial_compaction_count_is_zero() {
    let app = App::new("test-model".into());
    assert_eq!(app.compaction_count, 0);
}

#[test]
fn test_session_start_is_set_on_creation() {
    let before = Instant::now();
    let app = App::new("test-model".into());
    let after = Instant::now();
    // session_start should be between before and after
    assert!(app.session_start >= before);
    assert!(app.session_start <= after);
}

#[test]
fn test_context_start_is_set_on_creation() {
    let before = Instant::now();
    let app = App::new("test-model".into());
    let after = Instant::now();
    assert!(app.context_start >= before);
    assert!(app.context_start <= after);
}

#[test]
fn test_context_start_resets_on_compaction() {
    let mut app = App::new("test-model".into());
    let original_context_start = app.context_start;
    // Simulate some time passing
    std::thread::sleep(Duration::from_millis(10));
    // Simulate compaction
    app.on_compaction_complete(4, 500);
    assert!(app.context_start > original_context_start);
    assert_eq!(app.compaction_count, 1);
}

#[test]
fn test_compaction_count_increments() {
    let mut app = App::new("test-model".into());
    assert_eq!(app.compaction_count, 0);
    app.on_compaction_complete(4, 500);
    assert_eq!(app.compaction_count, 1);
    app.on_compaction_complete(6, 300);
    assert_eq!(app.compaction_count, 2);
    app.on_compaction_complete(8, 200);
    assert_eq!(app.compaction_count, 3);
}

#[test]
fn test_clear_conversation_resets_context_start_and_compaction_count() {
    let mut app = App::new("test-model".into());
    app.on_compaction_complete(4, 500);
    app.on_compaction_complete(6, 300);
    assert_eq!(app.compaction_count, 2);

    let before_clear = Instant::now();
    app.clear_conversation();
    assert_eq!(app.compaction_count, 0);
    assert!(app.context_start >= before_clear);
}

#[test]
fn test_clear_conversation_does_not_reset_session_start() {
    let mut app = App::new("test-model".into());
    let session_start = app.session_start;
    std::thread::sleep(Duration::from_millis(10));
    app.clear_conversation();
    // session_start must NOT change — it tracks the entire session
    assert_eq!(app.session_start, session_start);
}

#[test]
fn test_format_duration_seconds() {
    assert_eq!(App::format_duration(Duration::from_secs(0)), "0:00");
    assert_eq!(App::format_duration(Duration::from_secs(5)), "0:05");
    assert_eq!(App::format_duration(Duration::from_secs(59)), "0:59");
}

#[test]
fn test_format_duration_minutes() {
    assert_eq!(App::format_duration(Duration::from_secs(60)), "1:00");
    assert_eq!(App::format_duration(Duration::from_secs(61)), "1:01");
    assert_eq!(App::format_duration(Duration::from_secs(90)), "1:30");
    assert_eq!(App::format_duration(Duration::from_secs(600)), "10:00");
    assert_eq!(App::format_duration(Duration::from_secs(3599)), "59:59");
}

#[test]
fn test_format_duration_hours() {
    assert_eq!(App::format_duration(Duration::from_secs(3600)), "1:00:00");
    assert_eq!(App::format_duration(Duration::from_secs(3661)), "1:01:01");
    assert_eq!(App::format_duration(Duration::from_secs(7200)), "2:00:00");
    assert_eq!(App::format_duration(Duration::from_secs(86399)), "23:59:59");
}

#[test]
fn test_title_contains_timer_and_compaction_info() {
    let app = App::new("test-model".into());
    let title = app.build_title_info(20, 100, 50, 10);
    // Title should contain the ctx timer, session timer, and "Compactions: 0"
    assert!(title.contains("ctx ⏲"), "title should contain 'ctx ⏲': {}", title);
    assert!(title.contains("Compactions: 0"), "title should contain 'Compactions: 0': {}", title);
}

#[test]
fn test_title_shows_compaction_count_after_compactions() {
    let mut app = App::new("test-model".into());
    app.on_compaction_complete(4, 500);
    app.on_compaction_complete(6, 300);
    let title = app.build_title_info(20, 100, 50, 10);
    assert!(title.contains("Compactions: 2"), "title should contain 'Compactions: 2': {}", title);
}

#[test]
fn test_title_with_scroll_info() {
    let app = App::new("test-model".into());
    // When total > view_height, title also includes scroll info
    let title = app.build_title_info(20, 100, 50, 10);
    assert!(title.contains("lines"), "title with scroll should contain 'lines': {}", title);
    assert!(title.contains("%"), "title with scroll should contain '%': {}", title);
}

#[test]
fn test_title_without_scroll_info() {
    let app = App::new("test-model".into());
    // When total <= view_height, no scroll info
    let title = app.build_title_info(0, 5, 10, 0);
    assert!(!title.contains("lines"), "title without scroll should not contain 'lines': {}", title);
}

#[test]
fn test_needs_timer_redraw_false_initially() {
    let app = App::new("test-model".into());
    // Just created — last_redraw is now, so no redraw needed yet
    assert!(!app.needs_timer_redraw());
}

#[test]
fn test_needs_timer_redraw_true_after_60s() {
    let mut app = App::new("test-model".into());
    // Pretend the last redraw happened 61 seconds ago
    app.last_redraw = Instant::now() - Duration::from_secs(61);
    assert!(app.needs_timer_redraw());
}

#[test]
fn test_needs_timer_redraw_false_before_60s() {
    let mut app = App::new("test-model".into());
    // Pretend the last redraw happened 30 seconds ago
    app.last_redraw = Instant::now() - Duration::from_secs(30);
    assert!(!app.needs_timer_redraw());
}

#[test]
fn test_mark_redraw_resets_last_redraw() {
    let mut app = App::new("test-model".into());
    app.last_redraw = Instant::now() - Duration::from_secs(120);
    assert!(app.needs_timer_redraw());
    app.mark_redrawn();
    assert!(!app.needs_timer_redraw());
}
