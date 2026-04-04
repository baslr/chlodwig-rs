use super::*;

/// Verify that after rendering, EVERY cell in the content area is touched by the Paragraph.
#[test]
fn test_every_cell_overwritten_after_scroll() {
    use ratatui::backend::TestBackend;

    let width = 50u16;
    let height = 10u16;
    let inner_width = (width - 2) as usize;
    let view_height = (height - 2) as usize;

    let mut app = App::new("test".into());
    app.wrap_width = inner_width;

    for i in 0..30 {
        if i < 10 {
            app.display_blocks.push(DisplayBlock::AssistantText(
                format!("LLLL-{i}-{}", "Z".repeat(40)),
            ));
        } else {
            app.display_blocks.push(DisplayBlock::AssistantText(
                format!("s{i}"),
            ));
        }
    }
    app.mark_dirty();
    app.rebuild_lines();
    app.auto_scroll = false;

    let backend = TestBackend::new(width, height);
    let mut terminal = Terminal::new(backend).unwrap();

    // Frame 1: scroll = 0, shows long "LLLL" lines
    app.scroll = 0;
    terminal.draw(|f| {
        render_output(f, &app, Rect::new(0, 0, width, height));
    }).unwrap();

    {
        let buf = terminal.backend().buffer();
        let mut found_l = false;
        for col in 1..(width - 1) {
            if buf[(col, 1)].symbol() == "L" {
                found_l = true;
                break;
            }
        }
        assert!(found_l, "Frame 1 should contain 'L' characters");
    }

    // Frame 2: scroll past the long lines to short "sNN" lines
    app.scroll = 40;
    terminal.draw(|f| {
        render_output(f, &app, Rect::new(0, 0, width, height));
    }).unwrap();

    let buf = terminal.backend().buffer();
    for row in 0..view_height {
        let buf_y = 1 + row as u16;
        for col in 1..(width - 1) {
            let cell = &buf[(col, buf_y)];
            let sym = cell.symbol();
            assert!(
                sym != "L" && sym != "Z",
                "Ghost artifact! Cell ({col}, {buf_y}) still contains '{}' from frame 1.",
                sym,
            );
        }
    }
}

#[test]
fn test_no_ghost_artifacts_after_scroll() {
    use ratatui::backend::TestBackend;

    let width = 40u16;
    let height = 12u16;

    let mut app = App::new("test".into());
    app.wrap_width = (width - 2) as usize;
    for i in 0..30 {
        if i % 3 == 0 {
            app.display_blocks.push(DisplayBlock::AssistantText(
                format!("LONG-LINE-{i}: {}", "X".repeat(30)),
            ));
        } else {
            app.display_blocks.push(DisplayBlock::AssistantText(
                format!("s{i}"),
            ));
        }
    }
    app.mark_dirty();
    app.rebuild_lines();

    app.auto_scroll = false;
    let total = app.rendered_lines.len();

    app.scroll = 0;
    let backend1 = TestBackend::new(width, height);
    let mut terminal1 = Terminal::new(backend1).unwrap();
    terminal1.draw(|f| {
        render_output(f, &app, Rect::new(0, 0, width, height));
    }).unwrap();

    app.scroll = 10;
    terminal1.draw(|f| {
        render_output(f, &app, Rect::new(0, 0, width, height));
    }).unwrap();

    let buf = terminal1.backend().buffer();
    let inner_left = 1u16;
    let inner_right = width - 2;
    let inner_top = 1u16;
    let inner_bottom = height - 1;
    let inner_width = (inner_right - inner_left + 1) as usize;

    let view_height = (height - 2) as usize;
    let scroll_pos = app.scroll.min(total.saturating_sub(view_height));
    let visible_start = scroll_pos;
    let visible_end = (scroll_pos + view_height).min(total);

    for row_idx in 0..view_height {
        let buf_y = inner_top + row_idx as u16;
        if buf_y >= inner_bottom {
            break;
        }

        let expected = if visible_start + row_idx < visible_end {
            let rl = &app.rendered_lines[visible_start + row_idx];
            rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>()
        } else {
            String::new()
        };

        let mut actual = String::new();
        for col in inner_left..=inner_right {
            let cell = &buf[(col, buf_y)];
            actual.push_str(cell.symbol());
        }

        let actual_trimmed = actual.trim_end();
        let expected_trimmed = expected.trim_end();

        assert!(
            actual_trimmed == expected_trimmed
                || actual.starts_with(&expected),
            "Ghost artifact at row {row_idx} (scroll={})!\n  Expected: {:?}\n  Actual:   {:?}",
            app.scroll, expected_trimmed, actual_trimmed,
        );

        if expected.len() < inner_width {
            let after_text = &actual[expected.len()..];
            assert!(
                after_text.trim().is_empty(),
                "Ghost characters after text at row {row_idx} (scroll={})!\n  Expected text: {:?}\n  Trailing chars: {:?}",
                app.scroll, expected_trimmed, after_text.trim(),
            );
        }
    }
}

/// Test ghost artifacts specifically with tool output (styled text with DarkGray/Yellow).
#[test]
fn test_no_ghost_artifacts_with_tool_output() {
    use ratatui::backend::TestBackend;

    let width = 60u16;
    let height = 14u16;

    let mut app = App::new("test".into());
    app.wrap_width = (width - 2) as usize;

    app.display_blocks.push(DisplayBlock::ToolCall {
        name: "Read".into(),
        input_preview: "file_path: /some/very/long/path/to/a/deeply/nested/file.rs\noffset: 0\nlimit: 100".into(),
    });
    app.display_blocks.push(DisplayBlock::ToolResult {
        is_error: false,
        preview: "fn main() {\n    println!(\"hello\");\n}".into(),
    });
    app.display_blocks.push(DisplayBlock::AssistantText(
        "Short.".into(),
    ));
    for i in 0..20 {
        app.display_blocks.push(DisplayBlock::AssistantText(
            format!("Filler line {i}"),
        ));
    }

    app.mark_dirty();
    app.rebuild_lines();
    app.auto_scroll = false;

    let total = app.rendered_lines.len();
    let view_height = (height - 2) as usize;
    let inner_width = (width - 2) as usize;

    let backend = TestBackend::new(width, height);
    let mut terminal = Terminal::new(backend).unwrap();

    app.scroll = 0;
    terminal.draw(|f| {
        render_output(f, &app, Rect::new(0, 0, width, height));
    }).unwrap();

    app.scroll = 15;
    terminal.draw(|f| {
        render_output(f, &app, Rect::new(0, 0, width, height));
    }).unwrap();

    let buf = terminal.backend().buffer();
    let inner_top = 1u16;
    let inner_bottom = height - 1;
    let inner_left = 1u16;
    let inner_right = width - 2;

    let scroll_pos = app.scroll.min(total.saturating_sub(view_height));
    let visible_start = scroll_pos;
    let visible_end = (scroll_pos + view_height).min(total);

    for row_idx in 0..view_height {
        let buf_y = inner_top + row_idx as u16;
        if buf_y >= inner_bottom {
            break;
        }

        let expected = if visible_start + row_idx < visible_end {
            let rl = &app.rendered_lines[visible_start + row_idx];
            rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>()
        } else {
            String::new()
        };

        let mut actual = String::new();
        for col in inner_left..=inner_right {
            let cell = &buf[(col, buf_y)];
            actual.push_str(cell.symbol());
        }

        let actual_trimmed = actual.trim_end();
        let expected_trimmed = expected.trim_end();

        assert!(
            actual_trimmed == expected_trimmed
                || actual.starts_with(&expected),
            "Ghost artifact (tool output) at row {row_idx} (scroll={})!\n  Expected: {:?}\n  Actual:   {:?}",
            app.scroll, expected_trimmed, actual_trimmed,
        );

        if expected.len() < inner_width {
            let after_text = &actual[expected.len()..];
            assert!(
                after_text.trim().is_empty(),
                "Ghost chars (tool output) at row {row_idx} (scroll={})!\n  Text: {:?}\n  Trailing: {:?}",
                app.scroll, expected_trimmed, after_text.trim(),
            );
        }
    }
}

/// Verify that EVERY padded line has exactly inner_width display columns.
#[test]
fn test_padded_line_widths_exact() {
    let width = 60u16;
    let inner_width = (width - 2) as usize;

    let mut app = App::new("test".into());
    app.wrap_width = inner_width;

    app.display_blocks.push(DisplayBlock::ToolCall {
        name: "Read".into(),
        input_preview: "file_path: /some/path\noffset: 0".into(),
    });
    app.display_blocks.push(DisplayBlock::ToolResult {
        is_error: false,
        preview: "fn main() {}\nlet x = 42;".into(),
    });
    app.display_blocks.push(DisplayBlock::AssistantText("Short.".into()));
    app.display_blocks.push(DisplayBlock::AssistantText(
        format!("Long: {}", "A".repeat(100)),
    ));
    app.display_blocks.push(DisplayBlock::UserMessage("Question?".into()));
    app.display_blocks.push(DisplayBlock::Error("Oops".into()));

    app.mark_dirty();
    app.rebuild_lines();

    let total = app.rendered_lines.len();
    let visible_end = 30usize.min(total);

    for i in 0..visible_end {
        let rl = &app.rendered_lines[i];
        let mut line = rl.to_line();

        let text_width = line.width();
        if text_width < inner_width {
            line.spans.push(Span::raw(" ".repeat(inner_width - text_width)));
        }

        let padded_width = line.width();
        assert_eq!(
            padded_width, inner_width,
            "Line {i} has padded width {padded_width}, expected {inner_width}.\n  \
             Original width: {text_width}\n  \
             Content: {:?}",
            rl.spans.iter().map(|(t, _)| t.as_str()).collect::<Vec<_>>(),
        );
    }
}
