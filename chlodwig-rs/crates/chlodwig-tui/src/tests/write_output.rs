//! Tests for Write tool output with syntax highlighting.

use ratatui::style::{Color, Style};
use super::*;

// ── DisplayBlock::WriteOutput variant ──────────────────────────────

#[test]
fn test_write_output_display_block_exists() {
    // WriteOutput variant should exist and hold file_path, content, and summary
    let block = DisplayBlock::WriteOutput {
        file_path: "/tmp/test.java".into(),
        content: "public class Test {}".into(),
        summary: "Wrote 1 lines (20 bytes) to /tmp/test.java".into(),
    };
    match block {
        DisplayBlock::WriteOutput { file_path, content, summary } => {
            assert_eq!(file_path, "/tmp/test.java");
            assert_eq!(content, "public class Test {}");
            assert!(summary.contains("1 lines"));
        }
        _ => panic!("Expected WriteOutput variant"),
    }
}

// ── Rendering with syntax highlighting ─────────────────────────────

#[test]
fn test_write_output_renders_with_syntax_highlighting() {
    // A .rs file should get Rust syntax highlighting (Rgb colors)
    let mut app = App::new("test-model".into());
    app.display_blocks.push(DisplayBlock::WriteOutput {
        file_path: "/tmp/test.rs".into(),
        content: "let x = 42;\nfn main() {}".into(),
        summary: "Wrote 2 lines (23 bytes) to /tmp/test.rs".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let all_text: String = app.rendered_lines.iter().map(|rl| {
        rl.spans.iter().map(|(t, _): &(String, Style)| t.as_str()).collect::<String>()
    }).collect::<Vec<_>>().join("\n");

    assert!(all_text.contains("let x = 42"), "Should contain code, got:\n{all_text}");
    assert!(all_text.contains("fn main()"), "Should contain code, got:\n{all_text}");

    // Should have Rgb colors from syntax highlighting (not just DarkGray)
    let has_rgb = app.rendered_lines.iter().any(|rl| {
        rl.spans.iter().any(|(_, s): &(String, Style)| matches!(s.fg, Some(Color::Rgb(_, _, _))))
    });
    assert!(has_rgb, "Write .rs output should have syntax highlighting with Rgb colors");
}

#[test]
fn test_write_output_renders_header_with_file_path() {
    let mut app = App::new("test-model".into());
    app.display_blocks.push(DisplayBlock::WriteOutput {
        file_path: "/home/user/project/Main.java".into(),
        content: "public class Main {}".into(),
        summary: "Wrote 1 lines (20 bytes) to /home/user/project/Main.java".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let all_text: String = app.rendered_lines.iter().map(|rl| {
        rl.spans.iter().map(|(t, _): &(String, Style)| t.as_str()).collect::<String>()
    }).collect::<Vec<_>>().join("\n");

    assert!(all_text.contains("Write:"), "Header should contain 'Write:', got:\n{all_text}");
    assert!(all_text.contains("Main.java"), "Header should contain file name, got:\n{all_text}");
}

#[test]
fn test_write_output_shows_summary_line() {
    // The summary (e.g. "Wrote 5 lines (120 bytes)") should appear in the output
    let mut app = App::new("test-model".into());
    app.display_blocks.push(DisplayBlock::WriteOutput {
        file_path: "/tmp/test.txt".into(),
        content: "hello\nworld".into(),
        summary: "Wrote 2 lines (11 bytes) to /tmp/test.txt".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let all_text: String = app.rendered_lines.iter().map(|rl| {
        rl.spans.iter().map(|(t, _): &(String, Style)| t.as_str()).collect::<String>()
    }).collect::<Vec<_>>().join("\n");

    assert!(all_text.contains("Wrote 2 lines"), "Should show summary, got:\n{all_text}");
}

#[test]
fn test_write_output_shows_line_numbers() {
    let mut app = App::new("test-model".into());
    app.display_blocks.push(DisplayBlock::WriteOutput {
        file_path: "/tmp/test.py".into(),
        content: "print('a')\nprint('b')\nprint('c')".into(),
        summary: "Wrote 3 lines".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let all_text: String = app.rendered_lines.iter().map(|rl| {
        rl.spans.iter().map(|(t, _): &(String, Style)| t.as_str()).collect::<String>()
    }).collect::<Vec<_>>().join("\n");

    assert!(all_text.contains("1"), "Should show line number 1, got:\n{all_text}");
    assert!(all_text.contains("2"), "Should show line number 2, got:\n{all_text}");
    assert!(all_text.contains("3"), "Should show line number 3, got:\n{all_text}");
    assert!(all_text.contains("print('a')"), "Should show content, got:\n{all_text}");
    assert!(all_text.contains("print('c')"), "Should show content, got:\n{all_text}");
}

#[test]
fn test_write_output_unknown_extension_falls_back() {
    // Unknown extensions should still render (white text), not crash
    let mut app = App::new("test-model".into());
    app.display_blocks.push(DisplayBlock::WriteOutput {
        file_path: "/tmp/data.zzz".into(),
        content: "some content".into(),
        summary: "Wrote 1 lines".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let all_text: String = app.rendered_lines.iter().map(|rl| {
        rl.spans.iter().map(|(t, _): &(String, Style)| t.as_str()).collect::<String>()
    }).collect::<Vec<_>>().join("\n");

    assert!(all_text.contains("some content"), "Unknown ext should still render, got:\n{all_text}");
}

#[test]
fn test_write_output_empty_content() {
    // Empty content should render without crash
    let mut app = App::new("test-model".into());
    app.display_blocks.push(DisplayBlock::WriteOutput {
        file_path: "/tmp/empty.rs".into(),
        content: "".into(),
        summary: "Wrote 0 lines (0 bytes)".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let all_text: String = app.rendered_lines.iter().map(|rl| {
        rl.spans.iter().map(|(t, _): &(String, Style)| t.as_str()).collect::<String>()
    }).collect::<Vec<_>>().join("\n");

    assert!(all_text.contains("Write:"), "Should show header even for empty content, got:\n{all_text}");
    assert!(all_text.contains("Wrote 0 lines"), "Should show summary, got:\n{all_text}");
}

#[test]
fn test_write_output_java_syntax_highlighting() {
    // Java-specific highlighting
    let mut app = App::new("test-model".into());
    app.display_blocks.push(DisplayBlock::WriteOutput {
        file_path: "/tmp/Demo.java".into(),
        content: "public class Demo {\n    public static void main(String[] args) {\n        System.out.println(\"Hello\");\n    }\n}".into(),
        summary: "Wrote 5 lines".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let all_text: String = app.rendered_lines.iter().map(|rl| {
        rl.spans.iter().map(|(t, _): &(String, Style)| t.as_str()).collect::<String>()
    }).collect::<Vec<_>>().join("\n");

    assert!(all_text.contains("public class Demo"), "Should contain Java code, got:\n{all_text}");
    assert!(all_text.contains("System.out.println"), "Should contain method call, got:\n{all_text}");

    // Java keywords should get syntax highlighting
    let has_rgb = app.rendered_lines.iter().any(|rl| {
        rl.spans.iter().any(|(_, s): &(String, Style)| matches!(s.fg, Some(Color::Rgb(_, _, _))))
    });
    assert!(has_rgb, "Java output should have syntax highlighting with Rgb colors");
}

// ── Crash dump histogram ──────────────────────────────────────────

#[test]
fn test_write_output_in_crash_dump_histogram() {
    let mut app = App::new("test-model".into());
    app.display_blocks.push(DisplayBlock::WriteOutput {
        file_path: "/tmp/test.txt".into(),
        content: "hello".into(),
        summary: "Wrote 1 lines".into(),
    });

    let dump = app.crash_dump();
    assert!(dump.contains("WriteOutput"), "Crash dump histogram should include WriteOutput, got:\n{dump}");
}
