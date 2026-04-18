use super::*;

/// Pasting multiline text via `insert_paste()` inserts ALL lines
/// (with '\n' preserved) without triggering a submit.
#[test]
fn test_insert_paste_multiline() {
    let mut app = App::new("test".into());
    app.insert_paste("hello\nworld\nfoo");
    assert_eq!(app.input.text, "hello\nworld\nfoo");
    assert_eq!(app.input.cursor, app.input_char_count());
}

/// Pasting into an existing input inserts at the cursor position.
#[test]
fn test_insert_paste_at_cursor() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("abcdef");
    app.input.cursor = 3; // between 'c' and 'd'
    app.insert_paste("XY\nZ");
    assert_eq!(app.input.text, "abcXY\nZdef");
    assert_eq!(app.input.cursor, 3 + 4); // 4 chars inserted: X, Y, \n, Z
}

/// Pasting empty string is a no-op.
#[test]
fn test_insert_paste_empty() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("hello");
    app.input.cursor = 5;
    app.insert_paste("");
    assert_eq!(app.input.text, "hello");
    assert_eq!(app.input.cursor, 5);
}

/// Pasting a single line (no newlines) works like normal typing.
#[test]
fn test_insert_paste_single_line() {
    let mut app = App::new("test".into());
    app.insert_paste("hello world");
    assert_eq!(app.input.text, "hello world");
    assert_eq!(app.input.cursor, 11);
}

/// Pasting text with trailing newline preserves it.
#[test]
fn test_insert_paste_trailing_newline() {
    let mut app = App::new("test".into());
    app.insert_paste("line1\nline2\n");
    assert_eq!(app.input.text, "line1\nline2\n");
    assert_eq!(app.input.cursor, app.input_char_count());
}

/// Pasting text with UTF-8 characters (umlauts, emoji) works correctly.
#[test]
fn test_insert_paste_utf8() {
    let mut app = App::new("test".into());
    app.insert_paste("Ölpreis: 80€\n🎉 Fertig!");
    assert_eq!(app.input.text, "Ölpreis: 80€\n🎉 Fertig!");
    assert_eq!(app.input.cursor, app.input_char_count());
}

/// Pasting text with \r\n (Windows line endings) normalizes to \n.
#[test]
fn test_insert_paste_crlf_normalized() {
    let mut app = App::new("test".into());
    app.insert_paste("line1\r\nline2\r\nline3");
    assert_eq!(app.input.text, "line1\nline2\nline3");
    assert_eq!(app.input.cursor, app.input_char_count());
}

/// Pasting into the middle of existing multiline input.
#[test]
fn test_insert_paste_into_multiline_input() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("abc\ndef");
    app.input.cursor = 4; // right after '\n', at 'd'
    app.insert_paste("X\nY");
    assert_eq!(app.input.text, "abc\nX\nYdef");
}

/// Verify that the event loop source matches `Event::Paste` — this is a
/// compile-time / grep test to ensure the event loop handles Paste events.
#[test]
fn test_event_loop_has_paste_handler() {
    let source = include_str!("../event_loop.rs");
    assert!(
        source.contains("Event::Paste"),
        "Event loop must handle Event::Paste for bracketed paste support"
    );
}

/// Verify that EnableBracketedPaste is activated at terminal setup.
#[test]
fn test_event_loop_enables_bracketed_paste() {
    let source = include_str!("../event_loop.rs");
    assert!(
        source.contains("EnableBracketedPaste"),
        "Terminal setup must enable bracketed paste mode"
    );
}

/// Verify that DisableBracketedPaste is in the cleanup path.
#[test]
fn test_event_loop_disables_bracketed_paste() {
    let source = include_str!("../event_loop.rs");
    assert!(
        source.contains("DisableBracketedPaste"),
        "Terminal cleanup must disable bracketed paste mode"
    );
}
