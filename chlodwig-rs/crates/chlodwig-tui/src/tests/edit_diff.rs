//! Tests for the Edit-Diff display feature.
//!
//! When the LLM calls the Edit tool, the TUI should show a colored diff
//! with syntax highlighting, line numbers, and +/- markers instead of
//! the raw JSON input.

use super::*;
use crate::types::{DiffKind, DiffLine, DisplayBlock};

// ── DiffLine / DiffKind struct tests ──

#[test]
fn test_diff_kind_removal_is_removal() {
    let dl = DiffLine {
        line_num: 1,
        kind: DiffKind::Removal,
        text: "old line".into(),
    };
    assert_eq!(dl.kind, DiffKind::Removal);
    assert_eq!(dl.line_num, 1);
    assert_eq!(dl.text, "old line");
}

#[test]
fn test_diff_kind_addition_is_addition() {
    let dl = DiffLine {
        line_num: 1,
        kind: DiffKind::Addition,
        text: "new line".into(),
    };
    assert_eq!(dl.kind, DiffKind::Addition);
}

#[test]
fn test_diff_kind_context_is_context() {
    let dl = DiffLine {
        line_num: 5,
        kind: DiffKind::Context,
        text: "unchanged".into(),
    };
    assert_eq!(dl.kind, DiffKind::Context);
}

// ── build_edit_diff tests ──

#[test]
fn test_build_edit_diff_single_line_change() {
    let tmp = tempfile::NamedTempFile::new().unwrap();
    std::fs::write(tmp.path(), "line1\nlet x = 1;\nline3\n").unwrap();

    let input = serde_json::json!({
        "file_path": tmp.path().to_str().unwrap(),
        "old_string": "let x = 1;",
        "new_string": "let x = 42;"
    });

    let block = crate::event_loop::build_edit_diff(&input).unwrap();
    match block {
        DisplayBlock::EditDiff { file_path, diff_lines, .. } => {
            assert!(file_path.contains(tmp.path().to_str().unwrap()));
            // Should have at least 1 removal + 1 addition
            let removals: Vec<_> = diff_lines.iter().filter(|d| d.kind == DiffKind::Removal).collect();
            let additions: Vec<_> = diff_lines.iter().filter(|d| d.kind == DiffKind::Addition).collect();
            assert_eq!(removals.len(), 1);
            assert_eq!(additions.len(), 1);
            assert_eq!(removals[0].text, "let x = 1;");
            assert_eq!(additions[0].text, "let x = 42;");
            // Line number should be 2 (1-based, "let x = 1;" is on line 2)
            assert_eq!(removals[0].line_num, 2);
        }
        other => panic!("Expected EditDiff, got {:?}", other),
    }
}

#[test]
fn test_build_edit_diff_multiline_change() {
    let tmp = tempfile::NamedTempFile::new().unwrap();
    std::fs::write(tmp.path(), "a\nb\nc\nd\ne\n").unwrap();

    let input = serde_json::json!({
        "file_path": tmp.path().to_str().unwrap(),
        "old_string": "b\nc",
        "new_string": "B\nC\nC2"
    });

    let block = crate::event_loop::build_edit_diff(&input).unwrap();
    match block {
        DisplayBlock::EditDiff { diff_lines, .. } => {
            let removals: Vec<_> = diff_lines.iter().filter(|d| d.kind == DiffKind::Removal).collect();
            let additions: Vec<_> = diff_lines.iter().filter(|d| d.kind == DiffKind::Addition).collect();
            assert_eq!(removals.len(), 2, "old_string has 2 lines");
            assert_eq!(additions.len(), 3, "new_string has 3 lines");
            assert_eq!(removals[0].line_num, 2);
            assert_eq!(removals[1].line_num, 3);
        }
        other => panic!("Expected EditDiff, got {:?}", other),
    }
}

#[test]
fn test_build_edit_diff_line_number_detection() {
    let tmp = tempfile::NamedTempFile::new().unwrap();
    std::fs::write(tmp.path(), "1\n2\n3\n4\ntarget\n6\n").unwrap();

    let input = serde_json::json!({
        "file_path": tmp.path().to_str().unwrap(),
        "old_string": "target",
        "new_string": "replaced"
    });

    let block = crate::event_loop::build_edit_diff(&input).unwrap();
    match block {
        DisplayBlock::EditDiff { diff_lines, .. } => {
            let removals: Vec<_> = diff_lines.iter().filter(|d| d.kind == DiffKind::Removal).collect();
            assert_eq!(removals[0].line_num, 5, "target is on line 5");
        }
        other => panic!("Expected EditDiff, got {:?}", other),
    }
}

#[test]
fn test_build_edit_diff_file_not_readable() {
    let input = serde_json::json!({
        "file_path": "/nonexistent/path/to/file.rs",
        "old_string": "old",
        "new_string": "new"
    });

    let block = crate::event_loop::build_edit_diff(&input).unwrap();
    match block {
        DisplayBlock::EditDiff { diff_lines, .. } => {
            // Fallback: line number 1
            let removals: Vec<_> = diff_lines.iter().filter(|d| d.kind == DiffKind::Removal).collect();
            assert_eq!(removals[0].line_num, 1);
        }
        other => panic!("Expected EditDiff, got {:?}", other),
    }
}

#[test]
fn test_build_edit_diff_returns_none_for_missing_fields() {
    // Missing old_string
    let input = serde_json::json!({
        "file_path": "/tmp/test.rs",
        "new_string": "new"
    });
    assert!(crate::event_loop::build_edit_diff(&input).is_none());

    // Missing new_string
    let input = serde_json::json!({
        "file_path": "/tmp/test.rs",
        "old_string": "old"
    });
    assert!(crate::event_loop::build_edit_diff(&input).is_none());

    // Missing file_path
    let input = serde_json::json!({
        "old_string": "old",
        "new_string": "new"
    });
    assert!(crate::event_loop::build_edit_diff(&input).is_none());
}

#[test]
fn test_build_edit_diff_utf8_in_diff() {
    let tmp = tempfile::NamedTempFile::new().unwrap();
    std::fs::write(tmp.path(), "first\nÜmlauts: äöü\nlast\n").unwrap();

    let input = serde_json::json!({
        "file_path": tmp.path().to_str().unwrap(),
        "old_string": "Ümlauts: äöü",
        "new_string": "Ümlauts: ÄÖÜ 🎉"
    });

    let block = crate::event_loop::build_edit_diff(&input).unwrap();
    match block {
        DisplayBlock::EditDiff { diff_lines, .. } => {
            let removals: Vec<_> = diff_lines.iter().filter(|d| d.kind == DiffKind::Removal).collect();
            let additions: Vec<_> = diff_lines.iter().filter(|d| d.kind == DiffKind::Addition).collect();
            assert_eq!(removals[0].text, "Ümlauts: äöü");
            assert_eq!(additions[0].text, "Ümlauts: ÄÖÜ 🎉");
        }
        other => panic!("Expected EditDiff, got {:?}", other),
    }
}

#[test]
fn test_build_edit_diff_has_context_lines() {
    let tmp = tempfile::NamedTempFile::new().unwrap();
    std::fs::write(tmp.path(), "a\nb\nc\ntarget\ne\nf\ng\n").unwrap();

    let input = serde_json::json!({
        "file_path": tmp.path().to_str().unwrap(),
        "old_string": "target",
        "new_string": "replaced"
    });

    let block = crate::event_loop::build_edit_diff(&input).unwrap();
    match block {
        DisplayBlock::EditDiff { diff_lines, .. } => {
            let context: Vec<_> = diff_lines.iter().filter(|d| d.kind == DiffKind::Context).collect();
            // Should have context lines before and after the change
            assert!(context.len() >= 2, "Should have at least 2 context lines, got {}", context.len());
        }
        other => panic!("Expected EditDiff, got {:?}", other),
    }
}

// ── Language detection from file extension ──

#[test]
fn test_lang_from_extension_rs() {
    assert_eq!(crate::event_loop::lang_from_path("/foo/bar.rs"), "rust");
}

#[test]
fn test_lang_from_extension_py() {
    assert_eq!(crate::event_loop::lang_from_path("/foo/bar.py"), "python");
}

#[test]
fn test_lang_from_extension_js() {
    assert_eq!(crate::event_loop::lang_from_path("/foo/bar.js"), "javascript");
}

#[test]
fn test_lang_from_extension_ts() {
    assert_eq!(crate::event_loop::lang_from_path("/foo/bar.ts"), "typescript");
}

#[test]
fn test_lang_from_extension_unknown() {
    assert_eq!(crate::event_loop::lang_from_path("/foo/bar.xyz"), "");
}

#[test]
fn test_lang_from_extension_no_extension() {
    assert_eq!(crate::event_loop::lang_from_path("/foo/Makefile"), "");
}

#[test]
fn test_lang_from_extension_toml() {
    assert_eq!(crate::event_loop::lang_from_path("/foo/Cargo.toml"), "toml");
}

// ── Rendering tests ──

#[test]
fn test_edit_diff_rendered_has_line_numbers() {
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::EditDiff {
        file_path: "src/main.rs".into(),
        diff_lines: vec![
            DiffLine { line_num: 17, kind: DiffKind::Removal, text: "let x = 1;".into() },
            DiffLine { line_num: 17, kind: DiffKind::Addition, text: "let x = 42;".into() },
        ],
        lang: "rust".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let all_text: String = app.rendered_lines.iter()
        .map(|rl| rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>())
        .collect::<Vec<_>>()
        .join("\n");

    assert!(all_text.contains("17"), "Should contain line number 17, got:\n{all_text}");
}

#[test]
fn test_edit_diff_rendered_has_plus_minus_markers() {
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::EditDiff {
        file_path: "test.rs".into(),
        diff_lines: vec![
            DiffLine { line_num: 1, kind: DiffKind::Removal, text: "old".into() },
            DiffLine { line_num: 1, kind: DiffKind::Addition, text: "new".into() },
        ],
        lang: "rust".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let all_text: String = app.rendered_lines.iter()
        .map(|rl| rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>())
        .collect::<Vec<_>>()
        .join("\n");

    assert!(all_text.contains("-"), "Should contain '-' marker for removal, got:\n{all_text}");
    assert!(all_text.contains("+"), "Should contain '+' marker for addition, got:\n{all_text}");
}

#[test]
fn test_edit_diff_rendered_has_header_with_filename() {
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::EditDiff {
        file_path: "src/main.rs".into(),
        diff_lines: vec![
            DiffLine { line_num: 1, kind: DiffKind::Removal, text: "x".into() },
            DiffLine { line_num: 1, kind: DiffKind::Addition, text: "y".into() },
        ],
        lang: "rust".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let all_text: String = app.rendered_lines.iter()
        .map(|rl| rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>())
        .collect::<Vec<_>>()
        .join("\n");

    assert!(all_text.contains("src/main.rs"), "Should contain file path in header, got:\n{all_text}");
}

#[test]
fn test_edit_diff_rust_syntax_highlighted() {
    // Rust code should get syntax highlighting (Rgb colors), not plain white
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::EditDiff {
        file_path: "test.rs".into(),
        diff_lines: vec![
            DiffLine { line_num: 1, kind: DiffKind::Addition, text: "let x: u32 = 42;".into() },
        ],
        lang: "rust".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    // Check that at least one span has Rgb colors (syntax highlighting)
    let has_rgb = app.rendered_lines.iter().any(|rl| {
        rl.spans.iter().any(|(_, s)| matches!(s.fg, Some(Color::Rgb(_, _, _))))
    });
    assert!(has_rgb, "Rust code in EditDiff should be syntax-highlighted with Rgb colors");
}

#[test]
fn test_non_edit_tool_uses_generic_display() {
    // ToolUseStart with name != "Edit" should still use DisplayBlock::ToolCall
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::ToolCall {
        name: "Bash".into(),
        input_preview: r#"{"command": "ls"}"#.into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let all_text: String = app.rendered_lines.iter()
        .map(|rl| rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>())
        .collect::<Vec<_>>()
        .join("\n");

    assert!(all_text.contains("Tool: Bash"), "Non-Edit tools should still use generic display, got:\n{all_text}");
}

#[test]
fn test_edit_diff_context_lines_are_present_in_rendering() {
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::EditDiff {
        file_path: "test.rs".into(),
        diff_lines: vec![
            DiffLine { line_num: 3, kind: DiffKind::Context, text: "// context before".into() },
            DiffLine { line_num: 4, kind: DiffKind::Removal, text: "let old = 1;".into() },
            DiffLine { line_num: 4, kind: DiffKind::Addition, text: "let new = 2;".into() },
            DiffLine { line_num: 5, kind: DiffKind::Context, text: "// context after".into() },
        ],
        lang: "rust".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let all_text: String = app.rendered_lines.iter()
        .map(|rl| rl.spans.iter().map(|(t, _)| t.as_str()).collect::<String>())
        .collect::<Vec<_>>()
        .join("\n");

    assert!(all_text.contains("context before"), "Should contain context before, got:\n{all_text}");
    assert!(all_text.contains("context after"), "Should contain context after, got:\n{all_text}");
}

// ── No CODE_BG in diff spans ──

#[test]
fn test_edit_diff_context_lines_have_no_code_bg() {
    // Context lines in EditDiff should NOT have the CODE_BG background
    // that highlight_code normally applies for markdown code blocks.
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::EditDiff {
        file_path: "test.rs".into(),
        diff_lines: vec![
            DiffLine { line_num: 3, kind: DiffKind::Context, text: "let ctx = true;".into() },
        ],
        lang: "rust".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let code_bg = Color::Rgb(45, 45, 45);
    // Skip the header line ("── Edit: ..."), check actual diff lines
    for rl in &app.rendered_lines {
        let full_text: String = rl.spans.iter().map(|(t, _)| t.as_str()).collect();
        if full_text.contains("let ctx") {
            for (text, style) in &rl.spans {
                // The gutter span won't have CODE_BG, only check code spans
                if text.contains("let") || text.contains("ctx") || text.contains("true") {
                    assert_ne!(
                        style.bg, Some(code_bg),
                        "Context code span '{text}' should NOT have CODE_BG background"
                    );
                }
            }
        }
    }
}

#[test]
fn test_edit_diff_removal_lines_have_red_tint_not_code_bg() {
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::EditDiff {
        file_path: "test.rs".into(),
        diff_lines: vec![
            DiffLine { line_num: 1, kind: DiffKind::Removal, text: "let old = 1;".into() },
        ],
        lang: "rust".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let code_bg = Color::Rgb(45, 45, 45);
    let removal_bg = Color::Rgb(60, 20, 20);
    for rl in &app.rendered_lines {
        let full_text: String = rl.spans.iter().map(|(t, _)| t.as_str()).collect();
        if full_text.contains("let old") {
            for (text, style) in &rl.spans {
                if text.contains("let") || text.contains("old") {
                    assert_ne!(
                        style.bg, Some(code_bg),
                        "Removal code span '{text}' should NOT have CODE_BG"
                    );
                    assert_eq!(
                        style.bg, Some(removal_bg),
                        "Removal code span '{text}' should have red tint bg"
                    );
                }
            }
        }
    }
}

#[test]
fn test_edit_diff_addition_lines_have_green_tint_not_code_bg() {
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::EditDiff {
        file_path: "test.rs".into(),
        diff_lines: vec![
            DiffLine { line_num: 1, kind: DiffKind::Addition, text: "let new = 2;".into() },
        ],
        lang: "rust".into(),
    });
    app.mark_dirty();
    app.rebuild_lines();

    let code_bg = Color::Rgb(45, 45, 45);
    let addition_bg = Color::Rgb(20, 50, 20);
    for rl in &app.rendered_lines {
        let full_text: String = rl.spans.iter().map(|(t, _)| t.as_str()).collect();
        if full_text.contains("let new") {
            for (text, style) in &rl.spans {
                if text.contains("let") || text.contains("new") {
                    assert_ne!(
                        style.bg, Some(code_bg),
                        "Addition code span '{text}' should NOT have CODE_BG"
                    );
                    assert_eq!(
                        style.bg, Some(addition_bg),
                        "Addition code span '{text}' should have green tint bg"
                    );
                }
            }
        }
    }
}
