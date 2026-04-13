use super::*;

// ── DisplayBlock::GrepOutput variant ─────────────────────────────

#[test]
fn test_grep_output_variant_exists() {
    // GrepOutput variant should exist and hold output_mode + content
    let block = DisplayBlock::GrepOutput {
        content: "app.rs:42:let x = 1;".to_string(),
        output_mode: "content".to_string(),
    };
    match block {
        DisplayBlock::GrepOutput { content, output_mode } => {
            assert_eq!(content, "app.rs:42:let x = 1;");
            assert_eq!(output_mode, "content");
        }
        _ => panic!("Expected GrepOutput variant"),
    }
}

// ── Rendering: content mode with syntax highlighting ─────────────

#[test]
fn test_grep_output_content_mode_renders_highlighted() {
    // In content mode, grep output lines like "file.rs:42:let x = 1;"
    // should have syntax highlighting based on file extension.
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::GrepOutput {
        content: "src/main.rs:1:fn main() {\nsrc/main.rs:2:    println!(\"hello\");\nsrc/main.rs:3:}".to_string(),
        output_mode: "content".to_string(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    // Should produce rendered lines
    assert!(!app.rendered_lines.is_empty(), "Should render grep output lines");

    // Check that file:line prefix is present
    let all_text: String = app.rendered_lines.iter()
        .map(|rl| rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>())
        .collect::<Vec<_>>()
        .join("\n");
    assert!(all_text.contains("main.rs"), "Should contain file name");
    assert!(all_text.contains("fn"), "Should contain code content");
}

#[test]
fn test_grep_output_content_mode_has_colored_spans() {
    // Rust code should get syntax highlighting — spans should have non-default styles
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::GrepOutput {
        content: "test.rs:1:let x: u32 = 42;".to_string(),
        output_mode: "content".to_string(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    // At least some spans should have color (syntax highlighting)
    let has_colored = app.rendered_lines.iter().any(|rl| {
        rl.spans.iter().any(|(_, style)| style.fg.is_some())
    });
    assert!(has_colored, "Content-mode grep output should have colored spans from syntax highlighting");
}

#[test]
fn test_grep_output_files_with_matches_mode_renders() {
    // In files_with_matches mode, output is just file paths — no syntax highlighting needed
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::GrepOutput {
        content: "src/main.rs\nsrc/lib.rs\ntests/test.rs".to_string(),
        output_mode: "files_with_matches".to_string(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let all_text: String = app.rendered_lines.iter()
        .map(|rl| rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>())
        .collect::<Vec<_>>()
        .join("\n");
    assert!(all_text.contains("src/main.rs"), "Should show file paths");
    assert!(all_text.contains("src/lib.rs"), "Should show file paths");
}

#[test]
fn test_grep_output_content_mode_separator_lines() {
    // rg uses "--" as separator between context groups — should render cleanly
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::GrepOutput {
        content: "foo.rs:1:first match\n--\nfoo.rs:10:second match".to_string(),
        output_mode: "content".to_string(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    // Collect text per line (join spans within each line, then join lines with \n)
    let all_text: String = app.rendered_lines.iter()
        .map(|rl| rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>())
        .collect::<Vec<_>>()
        .join("\n");
    assert!(all_text.contains("first match"), "Should show first match, got: {all_text}");
    assert!(all_text.contains("second match"), "Should show second match, got: {all_text}");
}

#[test]
fn test_grep_output_content_mode_python_highlighting() {
    // Python files should get python syntax highlighting
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::GrepOutput {
        content: "test.py:1:def hello():\ntest.py:2:    print(\"world\")".to_string(),
        output_mode: "content".to_string(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let has_colored = app.rendered_lines.iter().any(|rl| {
        rl.spans.iter().any(|(_, style)| style.fg.is_some())
    });
    assert!(has_colored, "Python grep output should have colored spans");
}

#[test]
fn test_grep_output_content_mode_context_lines() {
    // Context lines use "-" separator: "file.rs-5-context line"
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::GrepOutput {
        content: "app.rs-1-// context\napp.rs:2:let x = 1;\napp.rs-3-// context".to_string(),
        output_mode: "content".to_string(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let all_text: String = app.rendered_lines.iter()
        .map(|rl| rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>())
        .collect::<Vec<_>>()
        .join("\n");
    assert!(all_text.contains("context"), "Should render context lines");
    assert!(all_text.contains("let x"), "Should render match lines");
}

#[test]
fn test_grep_output_mixed_extensions() {
    // Output with files of different extensions should highlight each appropriately
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::GrepOutput {
        content: "main.rs:1:fn main() {}\n--\napp.py:1:def main():".to_string(),
        output_mode: "content".to_string(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    assert!(!app.rendered_lines.is_empty(), "Should render mixed-extension grep output");
}

#[test]
fn test_grep_output_count_mode_renders() {
    // Count mode: "file.rs:5" — just file and count, no code highlighting
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::GrepOutput {
        content: "src/main.rs:3\nsrc/lib.rs:7".to_string(),
        output_mode: "count".to_string(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let all_text: String = app.rendered_lines.iter()
        .map(|rl| rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>())
        .collect::<Vec<_>>()
        .join("\n");
    assert!(all_text.contains("main.rs"), "Should show file names in count mode");
}

#[test]
fn test_grep_output_empty_content() {
    // Empty grep output (e.g. "No matches found")
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::GrepOutput {
        content: "No matches found".to_string(),
        output_mode: "content".to_string(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let all_text: String = app.rendered_lines.iter()
        .map(|rl| rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>())
        .collect::<Vec<_>>()
        .join("\n");
    assert!(all_text.contains("No matches found"), "Should render non-grep-format lines as-is");
}

// ── Event loop: Grep tool creates GrepOutput ─────────────────────

#[test]
fn test_grep_output_in_event_loop_dispatch() {
    // Verify the GrepOutput variant can be constructed as the event loop would do
    let mut app = App::new("test".into());
    let tool_name = "Grep";
    let tool_input = serde_json::json!({
        "pattern": "test",
        "path": "src/",
        "output_mode": "content"
    });
    let output_text = "src/main.rs:1:fn test() {}";

    // Simulate what the event loop should do for Grep results
    if tool_name == "Grep" {
        let output_mode = tool_input["output_mode"]
            .as_str()
            .unwrap_or("files_with_matches")
            .to_string();
        app.display_blocks.push(DisplayBlock::GrepOutput {
            content: output_text.to_string(),
            output_mode,
        });
    }

    match &app.display_blocks[0] {
        DisplayBlock::GrepOutput { content, output_mode } => {
            assert_eq!(content, "src/main.rs:1:fn test() {}");
            assert_eq!(output_mode, "content");
        }
        other => panic!("Expected GrepOutput, got: {:?}", other),
    }
}

// ── Crash dump includes GrepOutput ───────────────────────────────

#[test]
fn test_crash_dump_includes_grep_output() {
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::GrepOutput {
        content: "test.rs:1:hello".to_string(),
        output_mode: "content".to_string(),
    });
    let dump = app.crash_dump();
    assert!(dump.contains("GrepOutput"), "Crash dump should mention GrepOutput block type");
}

#[test]
fn test_parse_grep_content_line_match() {
    let result = crate::app::parse_grep_content_line("foo.rs:1:first match");
    assert!(result.is_some(), "Should parse 'foo.rs:1:first match'");
    let (file, line_num, code, is_match) = result.unwrap();
    assert_eq!(file, "foo.rs");
    assert_eq!(line_num, "1");
    assert_eq!(code, "first match");
    assert!(is_match);
}

#[test]
fn test_parse_grep_content_line_context() {
    let result = crate::app::parse_grep_content_line("app.rs-42-some context");
    assert!(result.is_some(), "Should parse context line");
    let (file, line_num, code, is_match) = result.unwrap();
    assert_eq!(file, "app.rs");
    assert_eq!(line_num, "42");
    assert_eq!(code, "some context");
    assert!(!is_match);
}

#[test]
fn test_parse_grep_content_line_no_match() {
    // Lines that don't match the pattern should return None
    assert!(crate::app::parse_grep_content_line("--").is_none());
    assert!(crate::app::parse_grep_content_line("No matches found").is_none());
    assert!(crate::app::parse_grep_content_line("").is_none());
}

#[test]
fn test_parse_grep_content_line_path_with_dirs() {
    let result = crate::app::parse_grep_content_line("src/utils/helper.rs:10:fn helper()");
    assert!(result.is_some());
    let (file, line_num, code, _) = result.unwrap();
    assert_eq!(file, "src/utils/helper.rs");
    assert_eq!(line_num, "10");
    assert_eq!(code, "fn helper()");
}

#[test]
fn test_parse_grep_content_line_code_with_colons() {
    // Code portion can contain colons (e.g. "let x: u32 = 1;")
    let result = crate::app::parse_grep_content_line("main.rs:5:let x: u32 = 1;");
    assert!(result.is_some());
    let (file, _, code, _) = result.unwrap();
    assert_eq!(file, "main.rs");
    assert_eq!(code, "let x: u32 = 1;");
}
