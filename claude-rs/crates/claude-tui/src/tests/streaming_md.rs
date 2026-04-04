use super::*;
use ratatui::style::Modifier;

#[test]
fn test_streaming_buffer_renders_as_markdown() {
    let mut app = App::new("test-model".into());
    app.streaming_buffer = "Hello **bold** world".into();
    app.mark_dirty();
    app.rebuild_lines();

    // Find a span that has BOLD modifier and contains "bold"
    let has_bold = app.rendered_lines.iter().any(|rl| {
        rl.spans.iter().any(|(t, s)| {
            t.contains("bold") && s.add_modifier.contains(Modifier::BOLD)
        })
    });
    assert!(
        has_bold,
        "Streaming buffer should render markdown: **bold** should produce BOLD span. Lines: {:?}",
        app.rendered_lines
            .iter()
            .map(|rl| &rl.spans)
            .collect::<Vec<_>>()
    );
}

#[test]
fn test_streaming_buffer_renders_heading() {
    let mut app = App::new("test-model".into());
    app.streaming_buffer = "# Heading\nSome text".into();
    app.mark_dirty();
    app.rebuild_lines();

    // The heading line should have BOLD modifier
    let has_heading = app.rendered_lines.iter().any(|rl| {
        rl.spans.iter().any(|(t, s)| {
            t.contains("Heading") && s.add_modifier.contains(Modifier::BOLD)
        })
    });
    assert!(
        has_heading,
        "Streaming buffer should render '# Heading' as bold. Lines: {:?}",
        app.rendered_lines
            .iter()
            .map(|rl| &rl.spans)
            .collect::<Vec<_>>()
    );
}

#[test]
fn test_streaming_buffer_renders_code_block() {
    let mut app = App::new("test-model".into());
    app.streaming_buffer = "```rust\nlet x = 42;\n```\n".into();
    app.mark_dirty();
    app.rebuild_lines();

    // Code block lines should have a background color (Rgb) from syntect
    let has_styled_code = app.rendered_lines.iter().any(|rl| {
        rl.spans.iter().any(|(t, s)| {
            t.contains("42") && s.fg.is_some()
        })
    });
    assert!(
        has_styled_code,
        "Streaming buffer should syntax-highlight code blocks. Lines: {:?}",
        app.rendered_lines
            .iter()
            .map(|rl| &rl.spans)
            .collect::<Vec<_>>()
    );
}
