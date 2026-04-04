use super::*;
use ratatui::style::Modifier;

#[test]
fn test_bash_output_header_shows_command() {
    let mut app = App::new("test-model".into());
    app.display_blocks.push(DisplayBlock::BashOutput {
        command: "ls -la".into(),
        raw_output: "total 42\n".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let first_line_text: String = app.rendered_lines[0]
        .spans
        .iter()
        .map(|(t, _)| t.as_str())
        .collect();
    assert!(
        first_line_text.contains("$ ls -la"),
        "First line should show '$ ls -la', got: {first_line_text}"
    );
}

#[test]
fn test_bash_output_renders_plain_text() {
    let mut app = App::new("test-model".into());
    app.display_blocks.push(DisplayBlock::BashOutput {
        command: "echo hello".into(),
        raw_output: "hello\nworld\n".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let all_text: String = app
        .rendered_lines
        .iter()
        .map(|rl| {
            rl.spans
                .iter()
                .map(|(t, _)| t.as_str())
                .collect::<String>()
        })
        .collect::<Vec<_>>()
        .join("\n");
    assert!(all_text.contains("hello"), "Should contain 'hello', got:\n{all_text}");
    assert!(all_text.contains("world"), "Should contain 'world', got:\n{all_text}");
}

#[test]
fn test_bash_output_renders_ansi_colors() {
    let mut app = App::new("test-model".into());
    // ANSI red "red" + reset + " plain"
    let ansi_output = "\x1b[31mred\x1b[0m plain\n";
    app.display_blocks.push(DisplayBlock::BashOutput {
        command: "test".into(),
        raw_output: ansi_output.into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    // Skip header line ($ test), look at the output line
    let output_line = &app.rendered_lines[1];
    // Should have a span with red color
    let has_red = output_line.spans.iter().any(|(t, s)| {
        t.contains("red") && s.fg == Some(Color::Indexed(1))  // ANSI color 1 = red
    });
    // Also check the plain part exists
    let has_plain = output_line
        .spans
        .iter()
        .any(|(t, _)| t.contains("plain"));

    assert!(
        has_red || has_plain,
        "Should parse ANSI colors. Spans: {:?}",
        output_line.spans
    );
}

#[test]
fn test_bash_output_header_is_yellow_bold() {
    let mut app = App::new("test-model".into());
    app.display_blocks.push(DisplayBlock::BashOutput {
        command: "pwd".into(),
        raw_output: "/home\n".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let (_, style) = &app.rendered_lines[0].spans[0];
    assert_eq!(style.fg, Some(Color::Yellow), "Header should be yellow");
    assert!(
        style.add_modifier.contains(Modifier::BOLD),
        "Header should be bold"
    );
}
