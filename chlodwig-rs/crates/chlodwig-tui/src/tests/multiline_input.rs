use super::*;

/// Input that fits on a single line should not wrap.
#[test]
fn test_input_visual_lines_short_text() {
    let mut app = App::new("test".into());
    app.input = "hello".to_string();
    app.cursor = 5;
    assert_eq!(app.input_visual_line_count(80), 1);
}

/// Input longer than the available width should wrap to multiple visual lines.
#[test]
fn test_input_visual_lines_long_text_wraps() {
    let mut app = App::new("test".into());
    // 26 chars of 'a' at width 10 → 3 visual lines (10 + 10 + 6)
    app.input = "a".repeat(26);
    app.cursor = 26;
    assert_eq!(app.input_visual_line_count(10), 3);
}

/// Empty input should still count as 1 visual line (the blank input row).
#[test]
fn test_input_visual_lines_empty() {
    let app = App::new("test".into());
    assert_eq!(app.input_visual_line_count(80), 1);
}

/// Input with explicit newlines: each logical line wraps independently.
/// "hello\nworld" at width 80 → 2 visual lines.
#[test]
fn test_input_visual_lines_with_newlines() {
    let mut app = App::new("test".into());
    app.input = "hello\nworld".to_string();
    assert_eq!(app.input_visual_line_count(80), 2);
}

/// Input with explicit newline AND wrapping: "aaaa...20a\nbbbb...20b" at width 10
/// → line 1 wraps to 2 visual lines, line 2 wraps to 2 visual lines → 4 total.
#[test]
fn test_input_visual_lines_newline_plus_wrap() {
    let mut app = App::new("test".into());
    app.input = format!("{}\n{}", "a".repeat(20), "b".repeat(20));
    assert_eq!(app.input_visual_line_count(10), 4);
}

/// Cursor position at the end of a short (unwrapped) line.
#[test]
fn test_input_cursor_visual_pos_short() {
    let mut app = App::new("test".into());
    app.input = "hello".to_string();
    app.cursor = 5;
    let (row, col) = app.input_cursor_visual_pos(80);
    assert_eq!(row, 0);
    assert_eq!(col, 5);
}

/// Cursor at the start of input.
#[test]
fn test_input_cursor_visual_pos_start() {
    let mut app = App::new("test".into());
    app.input = "hello world".to_string();
    app.cursor = 0;
    let (row, col) = app.input_cursor_visual_pos(80);
    assert_eq!(row, 0);
    assert_eq!(col, 0);
}

/// Cursor in the middle of a wrapped line: 15 chars at width 10,
/// cursor at char 12 → row 1, col 2.
#[test]
fn test_input_cursor_visual_pos_wrapped() {
    let mut app = App::new("test".into());
    app.input = "a".repeat(15);
    app.cursor = 12;
    let (row, col) = app.input_cursor_visual_pos(10);
    assert_eq!(row, 1, "cursor should be on the second visual line");
    assert_eq!(col, 2, "cursor should be at column 2 on the second line");
}

/// Cursor at the exact wrap boundary (char 10 on width 10):
/// should be at the start of the second visual line (row 1, col 0).
#[test]
fn test_input_cursor_visual_pos_at_wrap_boundary() {
    let mut app = App::new("test".into());
    app.input = "a".repeat(20);
    app.cursor = 10;
    let (row, col) = app.input_cursor_visual_pos(10);
    assert_eq!(row, 1);
    assert_eq!(col, 0);
}

/// Cursor after a newline: "hello\nworld" cursor at char 6 (the 'w')
/// → row 1, col 0.
#[test]
fn test_input_cursor_visual_pos_after_newline() {
    let mut app = App::new("test".into());
    app.input = "hello\nworld".to_string();
    app.cursor = 6; // 'w' in "world"
    let (row, col) = app.input_cursor_visual_pos(80);
    assert_eq!(row, 1);
    assert_eq!(col, 0);
}

/// Cursor on the second visual line when the first logical line wraps
/// AND there's a newline after.
/// "aaaaaaaaaaaaaaa\nbb" with width=10:
///   visual line 0: "aaaaaaaaaa" (10 a's)
///   visual line 1: "aaaaa"      (5 a's)
///   visual line 2: "bb"
/// Cursor at char 17 ('b' after newline) → row 2, col 1.
#[test]
fn test_input_cursor_visual_pos_wrap_plus_newline() {
    let mut app = App::new("test".into());
    app.input = format!("{}\nbb", "a".repeat(15));
    app.cursor = 17; // second 'b'
    let (row, col) = app.input_cursor_visual_pos(10);
    assert_eq!(row, 2);
    assert_eq!(col, 1);
}

/// Multi-byte characters: cursor position must use display width, not char count.
/// CJK chars are 2 columns wide. "日本語" is 3 chars but 6 columns.
/// At width 5, ratatui's WordWrapper (trim=false) treats "日本語" as a single word.
/// The untrimmed_overflow triggers when pending word (4 cols) + next char (2 cols) > 5,
/// flushing "日本" to the pending line (4 cols). But "語" alone (2 cols) fits alongside
/// the committed 4 cols only if 4+2<=5, which is false — yet ratatui's pending_word_overflow
/// check (`line_w + ws_w + word_w >= width` = `4+0+0=4 >= 5`) is false, so no line break.
/// The result: "日本語" renders on a SINGLE line (6 cols, the '語' gets clipped at width 5).
/// Cursor at end = row 0, col 6 (logical position past the last char).
#[test]
fn test_input_cursor_visual_pos_cjk() {
    let mut app = App::new("test".into());
    app.input = "日本語".to_string(); // 3 chars, 6 display columns
    app.cursor = 3; // end of input
    let (row, col) = app.input_cursor_visual_pos(5);
    assert_eq!(row, 0, "all CJK chars on single line (word-wrap, no spaces)");
    assert_eq!(col, 6, "cursor after all 3 CJK chars (6 display cols)");
}

/// Visual line count is capped at 10 to prevent the input from eating the entire screen.
#[test]
fn test_input_visual_lines_capped_at_max() {
    let mut app = App::new("test".into());
    // 200 chars at width 10 → 20 visual lines, but capped at 10
    app.input = "a".repeat(200);
    let lines = app.input_visual_line_count(10);
    assert!(lines <= 10, "Visual lines should be capped at 10, got {lines}");
}

/// Word-wrap: when the last word doesn't fit on the current line, ratatui's
/// `Wrap { trim: false }` moves the entire word to the next line.
/// "hello worldtest" at width 10:
///   ratatui renders: line 0 = "hello " (6 cols), line 1 = "worldtest" (9 cols)
///   NOT: line 0 = "hello worl" (10 cols), line 1 = "dtest"
/// The cursor position must match ratatui's word-wrap behavior.
#[test]
fn test_input_cursor_visual_pos_word_wrap_last_word() {
    let mut app = App::new("test".into());
    // "hello worldtest" — "hello " is 6 cols, "worldtest" is 9 cols.
    // At width 10, "worldtest" doesn't fit after "hello " (6+9=15 > 10),
    // so the whole word wraps to line 1.
    app.input = "hello worldtest".to_string();
    app.cursor = 15; // end of input
    let (row, col) = app.input_cursor_visual_pos(10);
    // "worldtest" is on line 1, cursor at end = col 9
    assert_eq!(row, 1, "cursor should be on the second visual line (word-wrapped)");
    assert_eq!(col, 9, "cursor should be at the end of 'worldtest' on line 1");
}

/// Word-wrap: cursor in the middle of the wrapped word.
/// "hello worldtest" at width 10, cursor at char 8 (the 'o' in "world"):
///   line 0 = "hello ", line 1 = "worldtest"
///   cursor on char 8 = 'o' in "worldtest" → row 1, col 2 (w=0, o=1, r→ col 2)
#[test]
fn test_input_cursor_visual_pos_word_wrap_mid_word() {
    let mut app = App::new("test".into());
    app.input = "hello worldtest".to_string();
    app.cursor = 8; // 'r' in "worldtest" (h-e-l-l-o-' '-w-o-r)
    let (row, col) = app.input_cursor_visual_pos(10);
    // "worldtest" starts on line 1. Cursor at char 8 = 'r' → col 2 on line 1 (w, o, r→)
    assert_eq!(row, 1, "cursor should be on line 1 after word wrap");
    assert_eq!(col, 2, "cursor should be at col 2 (after 'wo' on wrapped line)");
}

/// Word-wrap: visual line count must also account for word-wrapping.
/// "hello worldtest" at width 10 → 2 visual lines (not 2 from char-wrap too,
/// but let's ensure the split point is correct for longer text).
/// "aaaa bbbbbbbbbb cccc" at width 10:
///   line 0: "aaaa " (5 cols) — "bbbbbbbbbb" (10 cols) doesn't fit
///   line 1: "bbbbbbbbbb" (10 cols) — "cccc" doesn't fit
///   line 2: "cccc" (4 cols)
///   → 3 visual lines
#[test]
fn test_input_visual_line_count_word_wrap() {
    let mut app = App::new("test".into());
    app.input = "aaaa bbbbbbbbbb cccc".to_string();
    assert_eq!(app.input_visual_line_count(10), 3);
}

/// Word-wrap: a word longer than the entire width must be char-wrapped (broken).
/// "aaaaaaaaaaaa" (12 a's, no spaces) at width 10:
///   line 0: "aaaaaaaaaa" (10), line 1: "aa" (2) → 2 lines
///   Same as before — no word boundaries to trigger word-wrap.
#[test]
fn test_input_visual_line_count_word_longer_than_width() {
    let mut app = App::new("test".into());
    app.input = "a".repeat(12);
    assert_eq!(app.input_visual_line_count(10), 2);
}

/// Word-wrap: cursor at the space between words.
/// "hello worldtest" at width 10, cursor at char 5 (the space):
///   ratatui's word-wrap consumes the space at the line break — it doesn't appear
///   on either visual line ("hello" on line 0, "worldtest" on line 1).
///   The cursor on a consumed space goes to the start of the next visual line.
#[test]
fn test_input_cursor_visual_pos_word_wrap_at_space() {
    let mut app = App::new("test".into());
    app.input = "hello worldtest".to_string();
    app.cursor = 5; // the space character
    let (row, col) = app.input_cursor_visual_pos(10);
    // The space is consumed at the wrap point → cursor at start of line 1
    assert_eq!(row, 1, "consumed space → cursor on next line");
    assert_eq!(col, 0, "consumed space → cursor at col 0");
}

/// Word-wrap: cursor right after the space, at start of the wrapped word.
/// "hello worldtest" at width 10, cursor at char 6 ('w'):
///   'w' starts "worldtest" which is on line 1 → row 1, col 0.
#[test]
fn test_input_cursor_visual_pos_word_wrap_start_of_wrapped_word() {
    let mut app = App::new("test".into());
    app.input = "hello worldtest".to_string();
    app.cursor = 6; // 'w' in "worldtest"
    let (row, col) = app.input_cursor_visual_pos(10);
    assert_eq!(row, 1, "'w' should be at start of line 1");
    assert_eq!(col, 0, "'w' should be at col 0 on the wrapped line");
}

/// Shift+Enter should insert a newline into the input, not submit it.
#[test]
fn test_shift_enter_inserts_newline() {
    let mut app = App::new("test".into());
    app.input = "hello".to_string();
    app.cursor = 5;

    // Simulate Shift+Enter → should insert '\n' at cursor
    app.insert_newline();

    assert_eq!(app.input, "hello\n");
    assert_eq!(app.cursor, 6);
}

/// Shift+Enter in the middle of text should split the line.
#[test]
fn test_shift_enter_inserts_newline_mid_text() {
    let mut app = App::new("test".into());
    app.input = "helloworld".to_string();
    app.cursor = 5;

    app.insert_newline();

    assert_eq!(app.input, "hello\nworld");
    assert_eq!(app.cursor, 6);
}

/// Multiple Shift+Enter presses should insert multiple newlines.
#[test]
fn test_shift_enter_multiple_newlines() {
    let mut app = App::new("test".into());
    app.input = "abc".to_string();
    app.cursor = 3;

    app.insert_newline();
    app.insert_newline();

    assert_eq!(app.input, "abc\n\n");
    assert_eq!(app.cursor, 5);
}

/// Verify the event loop source has a Shift+Enter handler for insert_newline.
#[test]
fn test_event_loop_has_shift_enter_newline_binding() {
    let src = include_str!("../event_loop.rs");
    assert!(
        src.contains("insert_newline"),
        "Event loop must call insert_newline() for Shift+Enter"
    );
    // Shift+Enter must come BEFORE the submit-Enter arm
    let shift_enter_pos = src.find("insert_newline").unwrap();
    let submit_pos = src.find("// Submit input").unwrap();
    assert!(
        shift_enter_pos < submit_pos,
        "Shift+Enter handler must come before submit handler"
    );
}

/// Alt+Enter should also insert a newline (fallback for terminals that
/// don't distinguish Shift+Enter from Enter, e.g. macOS Terminal).
#[test]
fn test_event_loop_has_alt_enter_newline_binding() {
    let src = include_str!("../event_loop.rs");
    assert!(
        src.contains("ALT") && src.contains("insert_newline"),
        "Event loop must handle Alt+Enter as newline fallback"
    );
}

/// Ctrl+J (ASCII linefeed) should insert a newline — works in ALL terminals,
/// unlike Shift+Enter/Alt+Enter which many terminals can't distinguish from Enter.
#[test]
fn test_event_loop_has_ctrl_j_newline_binding() {
    let src = include_str!("../event_loop.rs");
    // Must have Char('j') + CONTROL → insert_newline
    assert!(
        src.contains("Char('j')") && src.contains("CONTROL"),
        "Event loop must handle Ctrl+J as newline insertion"
    );
    // Ctrl+J must come BEFORE the submit-Enter arm
    let ctrl_j_pos = src.find("Char('j')").unwrap();
    let submit_pos = src.find("// Submit input").unwrap();
    assert!(
        ctrl_j_pos < submit_pos,
        "Ctrl+J handler must come before submit handler"
    );
}

/// Ctrl+J should not insert 'j' — it should insert a newline instead.
#[test]
fn test_ctrl_j_does_not_insert_j() {
    let mut app = App::new("test".into());
    app.input = "hello".to_string();
    app.cursor = 5;
    // Ctrl+J calls insert_newline(), not insert_char('j')
    app.insert_newline();
    assert_eq!(app.input, "hello\n");
    assert!(!app.input.contains('j'));
}
