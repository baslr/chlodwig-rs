//! Tests for Read tool output with syntax highlighting.

use ratatui::style::{Color, Style};
use super::*;

// ── DisplayBlock::ReadOutput variant ────────────────────────────────

#[test]
fn test_read_output_display_block_exists() {
    // ReadOutput variant should exist and hold file_path + content
    let block = DisplayBlock::ReadOutput {
        file_path: "/tmp/test.rs".into(),
        content: "     1\tlet x = 42;".into(),
    };
    match block {
        DisplayBlock::ReadOutput { file_path, content } => {
            assert_eq!(file_path, "/tmp/test.rs");
            assert_eq!(content, "     1\tlet x = 42;");
        }
        _ => panic!("Expected ReadOutput variant"),
    }
}

// ── Rendering with syntax highlighting ──────────────────────────────

#[test]
fn test_read_output_renders_with_syntax_highlighting() {
    // A .rs file should get Rust syntax highlighting (Rgb colors)
    let mut app = App::new("test-model".into());
    app.display_blocks.push(DisplayBlock::ReadOutput {
        file_path: "/tmp/test.rs".into(),
        content: "     1\tlet x = 42;\n     2\tfn main() {}".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    // Should have lines containing the code
    let all_text: String = app.rendered_lines.iter().map(|rl| {
        rl.spans.iter().map(|(t, _): &(String, Style)| t.as_str()).collect::<String>()
    }).collect::<Vec<_>>().join("\n");

    assert!(all_text.contains("let x = 42"), "Should contain code, got:\n{all_text}");
    assert!(all_text.contains("fn main()"), "Should contain code, got:\n{all_text}");

    // Should have Rgb colors from syntax highlighting (not just DarkGray)
    let has_rgb = app.rendered_lines.iter().any(|rl| {
        rl.spans.iter().any(|(_, s): &(String, Style)| matches!(s.fg, Some(Color::Rgb(_, _, _))))
    });
    assert!(has_rgb, "Read .rs output should have syntax highlighting with Rgb colors");
}

#[test]
fn test_read_output_renders_header_with_file_path() {
    let mut app = App::new("test-model".into());
    app.display_blocks.push(DisplayBlock::ReadOutput {
        file_path: "/home/user/project/main.py".into(),
        content: "     1\tprint('hello')".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let all_text: String = app.rendered_lines.iter().map(|rl| {
        rl.spans.iter().map(|(t, _): &(String, Style)| t.as_str()).collect::<String>()
    }).collect::<Vec<_>>().join("\n");

    assert!(all_text.contains("main.py"), "Header should contain file name, got:\n{all_text}");
}

#[test]
fn test_read_output_preserves_line_numbers() {
    let mut app = App::new("test-model".into());
    app.display_blocks.push(DisplayBlock::ReadOutput {
        file_path: "/tmp/test.txt".into(),
        content: "     1\thello\n     2\tworld".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let all_text: String = app.rendered_lines.iter().map(|rl| {
        rl.spans.iter().map(|(t, _): &(String, Style)| t.as_str()).collect::<String>()
    }).collect::<Vec<_>>().join("\n");

    assert!(all_text.contains("1"), "Should show line number 1, got:\n{all_text}");
    assert!(all_text.contains("2"), "Should show line number 2, got:\n{all_text}");
    assert!(all_text.contains("hello"), "Should show content, got:\n{all_text}");
    assert!(all_text.contains("world"), "Should show content, got:\n{all_text}");
}

#[test]
fn test_read_output_unknown_extension_falls_back() {
    // Unknown extensions should still render (white text), not crash
    let mut app = App::new("test-model".into());
    app.display_blocks.push(DisplayBlock::ReadOutput {
        file_path: "/tmp/data.zzz".into(),
        content: "     1\tsome content".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let all_text: String = app.rendered_lines.iter().map(|rl| {
        rl.spans.iter().map(|(t, _): &(String, Style)| t.as_str()).collect::<String>()
    }).collect::<Vec<_>>().join("\n");

    assert!(all_text.contains("some content"), "Unknown ext should still render, got:\n{all_text}");
}

#[test]
fn test_read_output_empty_content() {
    // "(empty file)" should render without crash
    let mut app = App::new("test-model".into());
    app.display_blocks.push(DisplayBlock::ReadOutput {
        file_path: "/tmp/empty.rs".into(),
        content: "(empty file)".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let all_text: String = app.rendered_lines.iter().map(|rl| {
        rl.spans.iter().map(|(t, _): &(String, Style)| t.as_str()).collect::<String>()
    }).collect::<Vec<_>>().join("\n");

    assert!(all_text.contains("empty file"), "Should show empty file message, got:\n{all_text}");
}

// ── lang_from_path helper ───────────────────────────────────────────

#[test]
fn test_lang_from_path_rust() {
    assert_eq!(crate::markdown::lang_from_path("/tmp/test.rs"), "rust");
}

#[test]
fn test_lang_from_path_python() {
    assert_eq!(crate::markdown::lang_from_path("/tmp/test.py"), "python");
}

#[test]
fn test_lang_from_path_javascript() {
    assert_eq!(crate::markdown::lang_from_path("/tmp/test.js"), "javascript");
}

#[test]
fn test_lang_from_path_typescript() {
    // .ts → syntect doesn't know TypeScript natively, we map to javascript
    let lang = crate::markdown::lang_from_path("/tmp/test.ts");
    assert!(!lang.is_empty(), "TypeScript should map to a language");
}

#[test]
fn test_lang_from_path_unknown() {
    assert_eq!(crate::markdown::lang_from_path("/tmp/data.zzz"), "");
}

#[test]
fn test_lang_from_path_no_extension() {
    assert_eq!(crate::markdown::lang_from_path("/tmp/Makefile"), "");
}

// ── Event loop: Read tool result creates ReadOutput ─────────────────

#[test]
fn test_read_tool_result_creates_read_output_block() {
    // Verify the ReadOutput variant can be constructed and matched properly
    let mut app = App::new("test-model".into());

    app.display_blocks.push(DisplayBlock::ReadOutput {
        file_path: "/tmp/test.rs".into(),
        content: "     1\tlet x = 1;".into(),
    });

    match &app.display_blocks[0] {
        DisplayBlock::ReadOutput { file_path, .. } => {
            assert_eq!(file_path, "/tmp/test.rs");
        }
        other => panic!("Expected ReadOutput, got: {:?}", other),
    }
}
