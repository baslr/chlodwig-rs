use super::*;

// ── move_cursor_up: move cursor one visual line up ──────────────

/// Basic: cursor on line 2 of "hello\nworld", pressing up moves to line 1.
#[test]
fn test_cursor_up_simple_newline() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("hello\nworld");
    app.input.cursor = 9; // 'l' in "world" (char 9: h-e-l-l-o-\n-w-o-r-l)
    // Visual at width 80: row 0 = "hello", row 1 = "world"
    // Cursor at char 9 → row 1, col 3 ("worl")
    app.move_cursor_up(80);
    // Should move to row 0, col 3 → char 3 ('l' in "hello")
    assert_eq!(app.input.cursor, 3, "cursor should move up to same column on previous line");
}

/// Cursor on line 1 (first line) — up should be a no-op (returns false).
#[test]
fn test_cursor_up_already_on_first_line() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("hello\nworld");
    app.input.cursor = 3; // 'l' in "hello", row 0
    let moved = app.move_cursor_up(80);
    assert!(!moved, "should return false when already on first visual line");
    assert_eq!(app.input.cursor, 3, "cursor should not change");
}

/// Cursor up where target line is shorter — clamp to end of that line.
#[test]
fn test_cursor_up_clamps_to_shorter_line() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("hi\nhello world");
    app.input.cursor = 10; // char 10: h-i-\n-h-e-l-l-o-' '-w → 'w'
    // Row 0 = "hi" (2 chars), row 1 = "hello world"
    // Cursor at row 1, col 7 (past end of "hi")
    app.move_cursor_up(80);
    // Should clamp to end of "hi" → char 2
    assert_eq!(app.input.cursor, 2, "cursor should clamp to end of shorter line");
}

/// Cursor up on a soft-wrapped line (no newlines, just overflow).
#[test]
fn test_cursor_up_soft_wrap() {
    let mut app = App::new("test".into());
    // 20 'a' chars at width 10: visual line 0 = "aaaaaaaaaa", line 1 = "aaaaaaaaaa"
    app.input = chlodwig_core::InputState::with_text("a".repeat(20));

    app.input.cursor = 13; // char 13 → row 1, col 3
    app.move_cursor_up(10);
    // Should move to row 0, col 3 → char 3
    assert_eq!(app.input.cursor, 3, "cursor should move up on soft-wrapped line");
}

/// Empty input — up should be a no-op.
#[test]
fn test_cursor_up_empty_input() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::new();
    app.input.cursor = 0;
    let moved = app.move_cursor_up(80);
    assert!(!moved);
    assert_eq!(app.input.cursor, 0);
}

/// Single line — up should be a no-op.
#[test]
fn test_cursor_up_single_line() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("hello world");
    app.input.cursor = 5;
    let moved = app.move_cursor_up(80);
    assert!(!moved);
    assert_eq!(app.input.cursor, 5);
}

// ── move_cursor_down: move cursor one visual line down ──────────

/// Basic: cursor on line 1 of "hello\nworld", pressing down moves to line 2.
#[test]
fn test_cursor_down_simple_newline() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("hello\nworld");
    app.input.cursor = 3; // 'l' in "hello" (row 0, col 3)
    app.move_cursor_down(80);
    // Should move to row 1, col 3 → char 9 ('l' in "world": \n is char 5, w=6,o=7,r=8,l=9)
    assert_eq!(app.input.cursor, 9, "cursor should move down to same column on next line");
}

/// Cursor on the last line — down should be a no-op (returns false).
#[test]
fn test_cursor_down_already_on_last_line() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("hello\nworld");
    app.input.cursor = 9; // row 1 (last line)
    let moved = app.move_cursor_down(80);
    assert!(!moved, "should return false when already on last visual line");
    assert_eq!(app.input.cursor, 9, "cursor should not change");
}

/// Cursor down where target line is shorter — clamp to end of that line.
#[test]
fn test_cursor_down_clamps_to_shorter_line() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("hello world\nhi");
    app.input.cursor = 7; // 'o' in "world" → row 0, col 7
    app.move_cursor_down(80);
    // Row 1 = "hi" (2 chars), col 7 is past end → clamp to end of "hi"
    // "hello world\nhi" — \n is char 11, h=12, i=13, end=14
    assert_eq!(app.input.cursor, 14, "cursor should clamp to end of shorter line");
}

/// Cursor down on a soft-wrapped line.
#[test]
fn test_cursor_down_soft_wrap() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("a".repeat(20));

    app.input.cursor = 3; // row 0, col 3
    app.move_cursor_down(10);
    // Should move to row 1, col 3 → char 13
    assert_eq!(app.input.cursor, 13, "cursor should move down on soft-wrapped line");
}

/// Empty input — down should be a no-op.
#[test]
fn test_cursor_down_empty_input() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::new();
    app.input.cursor = 0;
    let moved = app.move_cursor_down(80);
    assert!(!moved);
    assert_eq!(app.input.cursor, 0);
}

/// Single line — down should be a no-op.
#[test]
fn test_cursor_down_single_line() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("hello world");
    app.input.cursor = 5;
    let moved = app.move_cursor_down(80);
    assert!(!moved);
    assert_eq!(app.input.cursor, 5);
}

// ── Multi-line with mixed wrapping ──────────────────────────────

/// Three explicit lines: move up and down through all of them.
#[test]
fn test_cursor_up_down_three_lines() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("abc\ndef\nghi");
    // Chars: a=0 b=1 c=2 \n=3 d=4 e=5 f=6 \n=7 g=8 h=9 i=10
    app.input.cursor = 9; // 'h' on line 3, col 1
    app.move_cursor_up(80);
    assert_eq!(app.input.cursor, 5, "should move from line 3 to line 2, col 1 → 'e'");
    app.move_cursor_up(80);
    assert_eq!(app.input.cursor, 1, "should move from line 2 to line 1, col 1 → 'b'");
    app.move_cursor_down(80);
    assert_eq!(app.input.cursor, 5, "should move back to line 2, col 1 → 'e'");
    app.move_cursor_down(80);
    assert_eq!(app.input.cursor, 9, "should move back to line 3, col 1 → 'h'");
}

/// Cursor at end of a long line, moving up to a short line, then down again.
/// Clamp-to-end behavior without sticky column.
#[test]
fn test_cursor_up_down_restores_clamped() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("hello world!!!\nhi\nabcdefghijk");
    // Line 0: "hello world!!!" (14 chars), line 1: "hi" (2 chars), line 2: "abcdefghijk" (11 chars)
    // Chars: h=0..!=13 \n=14 h=15 i=16 \n=17 a=18..k=28
    app.input.cursor = 25; // 'h' in "abcdefghijk" → row 2, col 7
    app.move_cursor_up(80); // → row 1, col clamped to end of "hi" → char 17 (end of "hi" line)
    assert_eq!(app.input.cursor, 17, "should clamp to end of short line");
    // Moving down goes to col 2 on line 2 (cursor was clamped to col 2 = display width of "hi")
    app.move_cursor_down(80); // → row 2, col 2 → char 20 ('c')
    assert_eq!(app.input.cursor, 20, "should move to col 2 on line 2 (no sticky column)");
}

// ── CJK/emoji: display width vs char index ──────────────────────

/// CJK characters occupy 2 display columns — moving up/down should account
/// for display width, not char count.
#[test]
fn test_cursor_up_cjk_display_width() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("abcdef\n日本語");
    // Line 0: "abcdef" (6 chars, 6 cols)
    // Line 1: "日本語" (3 chars, 6 cols)
    // Chars: a=0..f=5 \n=6 日=7 本=8 語=9
    app.input.cursor = 8; // '本' on line 1, display col 2
    app.move_cursor_up(80);
    // Display col 2 on line 0 → char 2 ('c')
    assert_eq!(app.input.cursor, 2, "should land on char at display col 2");
}

// ── Event loop integration: Up/Down dispatching ─────────────────

/// When input has multiple visual lines, Up arrow should move cursor up
/// instead of browsing history.
#[test]
fn test_event_loop_has_cursor_up_for_multiline() {
    let src = include_str!("../event_loop.rs");
    assert!(
        src.contains("move_cursor_up"),
        "event_loop.rs must call move_cursor_up() for vertical cursor movement"
    );
}

/// When input has multiple visual lines, Down arrow should move cursor down
/// instead of navigating to tab bar.
#[test]
fn test_event_loop_has_cursor_down_for_multiline() {
    let src = include_str!("../event_loop.rs");
    assert!(
        src.contains("move_cursor_down"),
        "event_loop.rs must call move_cursor_down() for vertical cursor movement"
    );
}
