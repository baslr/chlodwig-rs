use super::*;

#[test]
fn test_stream_chunks_counter_in_status_line() {
    let mut app = App::new("test-model".into());
    app.is_loading = true;
    app.stream_chunks = 42;

    // Render the status line into a test terminal
    let backend = ratatui::backend::TestBackend::new(120, 1);
    let mut terminal = Terminal::new(backend).unwrap();
    terminal.draw(|f| {
        crate::render::render_status_line(f, &app, f.area());
    }).unwrap();

    let buf = terminal.backend().buffer().clone();
    let text: String = (0..buf.area.width)
        .map(|x| buf[(x, 0)].symbol().to_string())
        .collect();

    assert!(
        text.contains("streaming(42)"),
        "Status line should contain 'streaming(42)…' while loading, got: {text}"
    );
}

#[test]
fn test_stream_chunks_reset_on_clear() {
    let mut app = App::new("test-model".into());
    app.stream_chunks = 100;

    app.clear_conversation();

    assert_eq!(app.stream_chunks, 0, "stream_chunks should reset on clear");
}
