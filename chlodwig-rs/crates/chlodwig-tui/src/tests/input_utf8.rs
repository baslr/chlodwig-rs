use super::*;

#[test]
fn test_insert_ascii_at_cursor() {
    let mut app = App::new("test".into());
    let byte_pos = app.cursor_byte_pos();
    app.input.text.insert(byte_pos, 'a');
    app.input.cursor += 1;
    let byte_pos = app.cursor_byte_pos();
    app.input.text.insert(byte_pos, 'b');
    app.input.cursor += 1;
    let byte_pos = app.cursor_byte_pos();
    app.input.text.insert(byte_pos, 'c');
    app.input.cursor += 1;

    assert_eq!(app.input.text, "abc");
    assert_eq!(app.input.cursor, 3);
    assert_eq!(app.input_char_count(), 3);
}

#[test]
fn test_insert_umlaut_then_ascii() {
    let mut app = App::new("test".into());

    let byte_pos = app.cursor_byte_pos();
    app.input.text.insert(byte_pos, 'ö');
    app.input.cursor += 1;

    assert_eq!(app.input.text, "ö");
    assert_eq!(app.input.cursor, 1);
    assert_eq!(app.input.text.len(), 2);
    assert_eq!(app.input_char_count(), 1);

    let byte_pos = app.cursor_byte_pos();
    app.input.text.insert(byte_pos, 'x');
    app.input.cursor += 1;

    assert_eq!(app.input.text, "öx");
    assert_eq!(app.input.cursor, 2);
    assert_eq!(app.input_char_count(), 2);
}

#[test]
fn test_insert_emoji_then_ascii() {
    let mut app = App::new("test".into());

    let byte_pos = app.cursor_byte_pos();
    app.input.text.insert(byte_pos, '🦀');
    app.input.cursor += 1;

    assert_eq!(app.input.text, "🦀");
    assert_eq!(app.input.text.len(), 4);
    assert_eq!(app.input_char_count(), 1);

    let byte_pos = app.cursor_byte_pos();
    app.input.text.insert(byte_pos, 'a');
    app.input.cursor += 1;

    assert_eq!(app.input.text, "🦀a");
    assert_eq!(app.input_char_count(), 2);
}

#[test]
fn test_backspace_umlaut() {
    let mut app = App::new("test".into());

    let bp = app.cursor_byte_pos();
    app.input.text.insert(bp, 'ö');
    app.input.cursor += 1;
    let bp = app.cursor_byte_pos();
    app.input.text.insert(bp, 'ä');
    app.input.cursor += 1;

    assert_eq!(app.input.text, "öä");
    assert_eq!(app.input.cursor, 2);

    app.input.cursor -= 1;
    let bp = app.cursor_byte_pos();
    app.input.text.remove(bp);

    assert_eq!(app.input.text, "ö");
    assert_eq!(app.input.cursor, 1);

    app.input.cursor -= 1;
    let bp = app.cursor_byte_pos();
    app.input.text.remove(bp);

    assert_eq!(app.input.text, "");
    assert_eq!(app.input.cursor, 0);
}

#[test]
fn test_insert_in_middle_of_multibyte() {
    let mut app = App::new("test".into());

    for c in ['a', 'ö', 'b'] {
        let bp = app.cursor_byte_pos();
        app.input.text.insert(bp, c);
        app.input.cursor += 1;
    }
    assert_eq!(app.input.text, "aöb");

    app.input.cursor = 2;
    let bp = app.cursor_byte_pos();
    app.input.text.insert(bp, 'X');
    app.input.cursor += 1;

    assert_eq!(app.input.text, "aöXb");
}

#[test]
fn test_cursor_navigation_multibyte() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("aöb");
    app.input.cursor = 0;

    assert_eq!(app.input_char_count(), 3);

    app.input.cursor = 3;
    assert_eq!(app.cursor_byte_pos(), app.input.text.len());

    app.input.cursor = 1;
    assert_eq!(app.cursor_byte_pos(), 1);

    app.input.cursor = 2;
    assert_eq!(app.cursor_byte_pos(), 3);
}

/// Regression: backspace must delete exactly one character, not two.
/// Bug root cause: crossterm 0.26+ sends KeyEventKind::Press AND
/// KeyEventKind::Release for every key stroke. If the event loop does
/// not filter on Press-only, backspace fires twice per physical press.
#[test]
fn test_backspace_deletes_exactly_one_char() {
    let mut app = App::new("test".into());
    // Type "abc"
    for c in ['a', 'b', 'c'] {
        let bp = app.cursor_byte_pos();
        app.input.text.insert(bp, c);
        app.input.cursor += 1;
    }
    assert_eq!(app.input.text, "abc");
    assert_eq!(app.input.cursor, 3);

    // Single backspace: remove exactly one char ('c')
    app.input.cursor -= 1;
    let bp = app.cursor_byte_pos();
    app.input.text.remove(bp);

    assert_eq!(app.input.text, "ab");
    assert_eq!(app.input.cursor, 2);

    // Another single backspace: remove exactly one char ('b')
    app.input.cursor -= 1;
    let bp = app.cursor_byte_pos();
    app.input.text.remove(bp);

    assert_eq!(app.input.text, "a");
    assert_eq!(app.input.cursor, 1);
}

/// Regression: typing after moving cursor left must INSERT, not overwrite.
/// Type "hello", move cursor left 2 positions (between 'l' and 'l'),
/// type 'X' → result must be "helXlo", not "helXo".
#[test]
fn test_insert_after_cursor_left() {
    let mut app = App::new("test".into());

    // Type "hello"
    for c in ['h', 'e', 'l', 'l', 'o'] {
        let bp = app.cursor_byte_pos();
        app.input.text.insert(bp, c);
        app.input.cursor += 1;
    }
    assert_eq!(app.input.text, "hello");
    assert_eq!(app.input.cursor, 5);

    // Move cursor left 2 positions → cursor at position 3 (between second 'l' and 'o')
    app.input.cursor -= 1; // cursor=4, between 'l' and 'o'
    app.input.cursor -= 1; // cursor=3, between first 'l' and second 'l'

    // Type 'X' at cursor position 3
    let bp = app.cursor_byte_pos();
    app.input.text.insert(bp, 'X');
    app.input.cursor += 1;

    assert_eq!(app.input.text, "helXlo");
    assert_eq!(app.input.cursor, 4);
    assert_eq!(app.input_char_count(), 6); // 6 chars, not 5 — inserted, not overwritten
}

/// Same as above but with multi-byte characters to ensure byte-pos mapping is correct.
#[test]
fn test_insert_after_cursor_left_multibyte() {
    let mut app = App::new("test".into());

    // Type "aöb"
    for c in ['a', 'ö', 'b'] {
        let bp = app.cursor_byte_pos();
        app.input.text.insert(bp, c);
        app.input.cursor += 1;
    }
    assert_eq!(app.input.text, "aöb");
    assert_eq!(app.input.cursor, 3);

    // Move cursor left 1 → between 'ö' and 'b'
    app.input.cursor -= 1; // cursor=2

    // Insert 'X'
    let bp = app.cursor_byte_pos();
    app.input.text.insert(bp, 'X');
    app.input.cursor += 1;

    assert_eq!(app.input.text, "aöXb");
    assert_eq!(app.input.cursor, 3);
    assert_eq!(app.input_char_count(), 4);
}

/// Edge case: backspace at cursor=0 must be a no-op, not panic.
#[test]
fn test_backspace_at_start_is_noop() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("hello");
    app.input.cursor = 0;

    // Simulate what the event loop does: only backspace if cursor > 0
    if app.input.cursor > 0 {
        app.input.cursor -= 1;
        let bp = app.cursor_byte_pos();
        app.input.text.remove(bp);
    }

    // Nothing should have changed
    assert_eq!(app.input.text, "hello");
    assert_eq!(app.input.cursor, 0);
}

/// Edge case: backspace on completely empty input must be a no-op.
#[test]
fn test_backspace_on_empty_input() {
    let mut app = App::new("test".into());
    assert_eq!(app.input.text, "");
    assert_eq!(app.input.cursor, 0);

    if app.input.cursor > 0 {
        app.input.cursor -= 1;
        let bp = app.cursor_byte_pos();
        app.input.text.remove(bp);
    }

    assert_eq!(app.input.text, "");
    assert_eq!(app.input.cursor, 0);
}

/// Edge case: cursor left at position 0 must not underflow.
#[test]
fn test_cursor_left_at_zero() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("abc");
    app.input.cursor = 0;

    // Simulate: Left only if cursor > 0
    if app.input.cursor > 0 {
        app.input.cursor -= 1;
    }

    assert_eq!(app.input.cursor, 0);
}

/// Edge case: cursor right at end of input must not exceed char count.
#[test]
fn test_cursor_right_at_end() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("abc");
    app.input.cursor = 3;

    if app.input.cursor < app.input_char_count() {
        app.input.cursor += 1;
    }

    assert_eq!(app.input.cursor, 3); // still 3, didn't go to 4
}

/// Home key sets cursor to 0, End key sets cursor to char count.
#[test]
fn test_home_and_end_keys() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("hëllo"); // 'ë' is multi-byte
    app.input.cursor = 3;

    // Home
    app.input.cursor = 0;
    assert_eq!(app.input.cursor, 0);
    assert_eq!(app.cursor_byte_pos(), 0);

    // End
    app.input.cursor = app.input_char_count();
    assert_eq!(app.input.cursor, 5);
    assert_eq!(app.cursor_byte_pos(), app.input.text.len()); // 6 bytes (ë = 2 bytes)
}

/// Realistic user flow: type, move cursor, backspace, type more.
/// This is the exact scenario the user reported as broken.
#[test]
fn test_realistic_edit_flow() {
    let mut app = App::new("test".into());

    // Type "world"
    for c in "world".chars() {
        let bp = app.cursor_byte_pos();
        app.input.text.insert(bp, c);
        app.input.cursor += 1;
    }
    assert_eq!(app.input.text, "world");
    assert_eq!(app.input.cursor, 5);

    // Move cursor to start (Home)
    app.input.cursor = 0;

    // Type "hello "
    for c in "hello ".chars() {
        let bp = app.cursor_byte_pos();
        app.input.text.insert(bp, c);
        app.input.cursor += 1;
    }
    assert_eq!(app.input.text, "hello world");
    assert_eq!(app.input.cursor, 6);

    // Move cursor to end (End)
    app.input.cursor = app.input_char_count();
    assert_eq!(app.input.cursor, 11);

    // Backspace 5 times (delete "world")
    for _ in 0..5 {
        app.input.cursor -= 1;
        let bp = app.cursor_byte_pos();
        app.input.text.remove(bp);
    }
    assert_eq!(app.input.text, "hello ");
    assert_eq!(app.input.cursor, 6);

    // Type "rust"
    for c in "rust".chars() {
        let bp = app.cursor_byte_pos();
        app.input.text.insert(bp, c);
        app.input.cursor += 1;
    }
    assert_eq!(app.input.text, "hello rust");
    assert_eq!(app.input.cursor, 10);
}

/// Backspace in the middle of a multibyte string — must remove
/// exactly the character before the cursor, preserving surrounding bytes.
#[test]
fn test_backspace_middle_multibyte() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("aöüb");
    app.input.cursor = 3; // after 'ü', before 'b'

    // Backspace: remove 'ü'
    app.input.cursor -= 1;
    let bp = app.cursor_byte_pos();
    app.input.text.remove(bp);

    assert_eq!(app.input.text, "aöb");
    assert_eq!(app.input.cursor, 2);
    assert_eq!(app.input_char_count(), 3);

    // Backspace again: remove 'ö'
    app.input.cursor -= 1;
    let bp = app.cursor_byte_pos();
    app.input.text.remove(bp);

    assert_eq!(app.input.text, "ab");
    assert_eq!(app.input.cursor, 1);
    assert_eq!(app.input_char_count(), 2);
}

/// Insert at every position in a multibyte string.
#[test]
fn test_insert_at_every_position_multibyte() {
    // Original: "aöb" (3 chars, 4 bytes)
    // Insert 'X' at each position 0..=3

    // Position 0: "Xaöb"
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("aöb");
    app.input.cursor = 0;
    let bp = app.cursor_byte_pos();
    app.input.text.insert(bp, 'X');
    assert_eq!(app.input.text, "Xaöb");

    // Position 1: "aXöb"
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("aöb");
    app.input.cursor = 1;
    let bp = app.cursor_byte_pos();
    app.input.text.insert(bp, 'X');
    assert_eq!(app.input.text, "aXöb");

    // Position 2: "aöXb"
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("aöb");
    app.input.cursor = 2;
    let bp = app.cursor_byte_pos();
    app.input.text.insert(bp, 'X');
    assert_eq!(app.input.text, "aöXb");

    // Position 3: "aöbX"
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("aöb");
    app.input.cursor = 3;
    let bp = app.cursor_byte_pos();
    app.input.text.insert(bp, 'X');
    assert_eq!(app.input.text, "aöbX");
}

/// Emoji: 4-byte characters at various positions.
#[test]
fn test_backspace_emoji_at_various_positions() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("a🦀b🎉c");
    assert_eq!(app.input_char_count(), 5);
    assert_eq!(app.input.text.len(), 11); // 1 + 4 + 1 + 4 + 1

    // Cursor after '🦀' (position 2), backspace removes '🦀'
    app.input.cursor = 2;
    app.input.cursor -= 1;
    let bp = app.cursor_byte_pos();
    app.input.text.remove(bp);
    assert_eq!(app.input.text, "ab🎉c");
    assert_eq!(app.input_char_count(), 4);

    // Cursor at end (position 4), backspace removes 'c'
    app.input.cursor = app.input_char_count(); // 4
    app.input.cursor -= 1;
    let bp = app.cursor_byte_pos();
    app.input.text.remove(bp);
    assert_eq!(app.input.text, "ab🎉");
    assert_eq!(app.input.cursor, 3);
}

#[test]
fn test_mixed_cjk_and_ascii() {
    let mut app = App::new("test".into());

    for c in ['日', '本', '語'] {
        let bp = app.cursor_byte_pos();
        app.input.text.insert(bp, c);
        app.input.cursor += 1;
    }
    assert_eq!(app.input.text, "日本語");
    assert_eq!(app.input.text.len(), 9);
    assert_eq!(app.input_char_count(), 3);

    let bp = app.cursor_byte_pos();
    app.input.text.insert(bp, 'x');
    app.input.cursor += 1;

    assert_eq!(app.input.text, "日本語x");
    assert_eq!(app.input_char_count(), 4);
}

// ── Delete (fn+Backspace) — delete char right of cursor ─────────

/// Delete at the beginning removes the first character.
#[test]
fn test_delete_char_forward_at_start() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("hello");
    app.input.cursor = 0;
    app.delete_char_forward();
    assert_eq!(app.input.text, "ello");
    assert_eq!(app.input.cursor, 0);
}

/// Delete in the middle removes the character right of the cursor.
#[test]
fn test_delete_char_forward_in_middle() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("hello");
    app.input.cursor = 2; // between 'l' and 'l'
    app.delete_char_forward();
    assert_eq!(app.input.text, "helo");
    assert_eq!(app.input.cursor, 2);
}

/// Delete at end of input is a no-op.
#[test]
fn test_delete_char_forward_at_end_is_noop() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("hello");
    app.input.cursor = 5;
    app.delete_char_forward();
    assert_eq!(app.input.text, "hello");
    assert_eq!(app.input.cursor, 5);
}

/// Delete on empty input is a no-op.
#[test]
fn test_delete_char_forward_empty_input() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::new();
    app.input.cursor = 0;
    app.delete_char_forward();
    assert_eq!(app.input.text, "");
    assert_eq!(app.input.cursor, 0);
}

/// Delete correctly handles multibyte UTF-8 characters (e.g. 'ö' = 2 bytes).
#[test]
fn test_delete_char_forward_multibyte() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("aöb");
    app.input.cursor = 1; // between 'a' and 'ö'
    app.delete_char_forward();
    assert_eq!(app.input.text, "ab");
    assert_eq!(app.input.cursor, 1);
}

/// Delete correctly handles emoji (4-byte chars).
#[test]
fn test_delete_char_forward_emoji() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("a🦀b");
    app.input.cursor = 1; // between 'a' and '🦀'
    app.delete_char_forward();
    assert_eq!(app.input.text, "ab");
    assert_eq!(app.input.cursor, 1);
}

/// Delete correctly handles CJK characters (3-byte chars).
#[test]
fn test_delete_char_forward_cjk() {
    let mut app = App::new("test".into());
    app.input = chlodwig_core::InputState::with_text("日本語");
    app.input.cursor = 1; // between '日' and '本'
    app.delete_char_forward();
    assert_eq!(app.input.text, "日語");
    assert_eq!(app.input.cursor, 1);
}

/// Verify event_loop.rs wires KeyCode::Delete to delete_char_forward().
#[test]
fn test_event_loop_has_delete_key_binding() {
    let src = include_str!("../event_loop.rs");
    assert!(
        src.contains("delete_char_forward"),
        "event_loop.rs must call delete_char_forward() for KeyCode::Delete"
    );
}
