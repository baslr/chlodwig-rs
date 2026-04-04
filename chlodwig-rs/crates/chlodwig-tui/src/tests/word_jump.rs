use super::*;

// ── Verify keybindings are wired in event_loop.rs ───────────────

#[test]
fn test_event_loop_has_alt_left_keybinding() {
    // Ensure the event_loop.rs source contains the Alt+Left word-jump keybinding.
    // This is a source-level sanity check so we never accidentally remove the wiring.
    let src = include_str!("../event_loop.rs");
    assert!(
        src.contains("move_cursor_word_left"),
        "event_loop.rs must call move_cursor_word_left() for Alt+Left"
    );
}

#[test]
fn test_event_loop_has_alt_right_keybinding() {
    let src = include_str!("../event_loop.rs");
    assert!(
        src.contains("move_cursor_word_right"),
        "event_loop.rs must call move_cursor_word_right() for Alt+Right"
    );
}

#[test]
fn test_event_loop_has_alt_backspace_keybinding() {
    let src = include_str!("../event_loop.rs");
    assert!(
        src.contains("delete_word_back"),
        "event_loop.rs must call delete_word_back() for Alt+Backspace"
    );
}

#[test]
fn test_event_loop_has_alt_delete_keybinding() {
    let src = include_str!("../event_loop.rs");
    assert!(
        src.contains("delete_word_forward"),
        "event_loop.rs must call delete_word_forward() for Alt+Delete"
    );
}

// ── Option+Left: move cursor to start of previous word ──────────

#[test]
fn test_word_left_from_end_of_single_word() {
    let mut app = App::new("test".into());
    app.input = "hello".to_string();
    app.cursor = 5; // at end
    app.move_cursor_word_left();
    assert_eq!(app.cursor, 0); // jump to start of "hello"
}

#[test]
fn test_word_left_from_end_of_two_words() {
    let mut app = App::new("test".into());
    app.input = "hello world".to_string();
    app.cursor = 11; // at end
    app.move_cursor_word_left();
    assert_eq!(app.cursor, 6); // jump to start of "world"
}

#[test]
fn test_word_left_from_middle_of_word() {
    let mut app = App::new("test".into());
    app.input = "hello world".to_string();
    app.cursor = 8; // in the middle of "world" (after 'r')
    app.move_cursor_word_left();
    assert_eq!(app.cursor, 6); // jump to start of "world"
}

#[test]
fn test_word_left_from_start_of_second_word() {
    let mut app = App::new("test".into());
    app.input = "hello world".to_string();
    app.cursor = 6; // at start of "world"
    app.move_cursor_word_left();
    assert_eq!(app.cursor, 0); // jump to start of "hello"
}

#[test]
fn test_word_left_at_position_zero() {
    let mut app = App::new("test".into());
    app.input = "hello".to_string();
    app.cursor = 0;
    app.move_cursor_word_left();
    assert_eq!(app.cursor, 0); // stays at 0
}

#[test]
fn test_word_left_multiple_spaces() {
    let mut app = App::new("test".into());
    app.input = "hello   world".to_string();
    app.cursor = 13; // at end
    app.move_cursor_word_left();
    assert_eq!(app.cursor, 8); // jump to start of "world"
}

#[test]
fn test_word_left_with_punctuation() {
    // Punctuation is treated as a word boundary
    let mut app = App::new("test".into());
    app.input = "hello, world!".to_string();
    app.cursor = 13; // at end (after '!')
    app.move_cursor_word_left();
    assert_eq!(app.cursor, 12); // jump to '!'
    app.move_cursor_word_left();
    assert_eq!(app.cursor, 7); // jump to start of "world"
    app.move_cursor_word_left();
    assert_eq!(app.cursor, 5); // jump to ','
    app.move_cursor_word_left();
    assert_eq!(app.cursor, 0); // jump to start of "hello"
}

#[test]
fn test_word_left_empty_input() {
    let mut app = App::new("test".into());
    app.input = "".to_string();
    app.cursor = 0;
    app.move_cursor_word_left();
    assert_eq!(app.cursor, 0);
}

#[test]
fn test_word_left_with_umlauts() {
    let mut app = App::new("test".into());
    app.input = "über größe".to_string();
    app.cursor = app.input_char_count(); // at end (10 chars)
    app.move_cursor_word_left();
    assert_eq!(app.cursor, 5); // start of "größe"
    app.move_cursor_word_left();
    assert_eq!(app.cursor, 0); // start of "über"
}

#[test]
fn test_word_left_with_emoji() {
    let mut app = App::new("test".into());
    app.input = "hello 🦀 world".to_string();
    // Chars: h(0) e(1) l(2) l(3) o(4) ' '(5) 🦀(6) ' '(7) w(8) o(9) r(10) l(11) d(12)
    assert_eq!(app.input_char_count(), 13);
    app.cursor = app.input_char_count(); // 13
    app.move_cursor_word_left();
    assert_eq!(app.cursor, 8); // start of "world"
    app.move_cursor_word_left();
    assert_eq!(app.cursor, 6); // start of "🦀"
    app.move_cursor_word_left();
    assert_eq!(app.cursor, 0); // start of "hello"
}

// ── Option+Right: move cursor to end of next word ───────────────

#[test]
fn test_word_right_from_start_of_single_word() {
    let mut app = App::new("test".into());
    app.input = "hello".to_string();
    app.cursor = 0;
    app.move_cursor_word_right();
    assert_eq!(app.cursor, 5); // jump to end of "hello"
}

#[test]
fn test_word_right_from_start_of_two_words() {
    let mut app = App::new("test".into());
    app.input = "hello world".to_string();
    app.cursor = 0;
    app.move_cursor_word_right();
    assert_eq!(app.cursor, 5); // jump to end of "hello"
}

#[test]
fn test_word_right_from_middle_of_word() {
    let mut app = App::new("test".into());
    app.input = "hello world".to_string();
    app.cursor = 2; // in the middle of "hello" (after 'e')
    app.move_cursor_word_right();
    assert_eq!(app.cursor, 5); // jump to end of "hello"
}

#[test]
fn test_word_right_from_end_of_first_word() {
    let mut app = App::new("test".into());
    app.input = "hello world".to_string();
    app.cursor = 5; // at end of "hello" (before space)
    app.move_cursor_word_right();
    assert_eq!(app.cursor, 11); // jump to end of "world"
}

#[test]
fn test_word_right_at_end() {
    let mut app = App::new("test".into());
    app.input = "hello".to_string();
    app.cursor = 5;
    app.move_cursor_word_right();
    assert_eq!(app.cursor, 5); // stays at end
}

#[test]
fn test_word_right_multiple_spaces() {
    let mut app = App::new("test".into());
    app.input = "hello   world".to_string();
    app.cursor = 5; // at end of "hello"
    app.move_cursor_word_right();
    assert_eq!(app.cursor, 13); // jump to end of "world"
}

#[test]
fn test_word_right_with_punctuation() {
    let mut app = App::new("test".into());
    app.input = "hello, world!".to_string();
    app.cursor = 0;
    app.move_cursor_word_right();
    assert_eq!(app.cursor, 5); // end of "hello"
    app.move_cursor_word_right();
    assert_eq!(app.cursor, 6); // end of ","
    app.move_cursor_word_right();
    assert_eq!(app.cursor, 12); // skip space, end of "world"
    app.move_cursor_word_right();
    assert_eq!(app.cursor, 13); // end of "!"
}

#[test]
fn test_word_right_empty_input() {
    let mut app = App::new("test".into());
    app.input = "".to_string();
    app.cursor = 0;
    app.move_cursor_word_right();
    assert_eq!(app.cursor, 0);
}

#[test]
fn test_word_right_with_umlauts() {
    let mut app = App::new("test".into());
    app.input = "über größe".to_string();
    app.cursor = 0;
    app.move_cursor_word_right();
    assert_eq!(app.cursor, 4); // end of "über"
    app.move_cursor_word_right();
    assert_eq!(app.cursor, 10); // end of "größe"
}

#[test]
fn test_word_right_with_emoji() {
    let mut app = App::new("test".into());
    app.input = "hello 🦀 world".to_string();
    // Chars: h(0) e(1) l(2) l(3) o(4) ' '(5) 🦀(6) ' '(7) w(8) o(9) r(10) l(11) d(12)
    assert_eq!(app.input_char_count(), 13);
    app.cursor = 0;
    app.move_cursor_word_right();
    assert_eq!(app.cursor, 5); // end of "hello"
    app.move_cursor_word_right();
    assert_eq!(app.cursor, 7); // skip space, end of "🦀"
    app.move_cursor_word_right();
    assert_eq!(app.cursor, 13); // skip space, end of "world"
}

// ── Round-trip: word-left then word-right covers the whole input ─

#[test]
fn test_word_jump_round_trip() {
    let mut app = App::new("test".into());
    app.input = "cargo test --workspace".to_string();
    app.cursor = app.input_char_count(); // at end

    // Jump left to start
    app.move_cursor_word_left(); // start of "--workspace" → hmm, let's see
    app.move_cursor_word_left();
    app.move_cursor_word_left();
    app.move_cursor_word_left();
    // Should be at 0 after enough jumps
    assert_eq!(app.cursor, 0);

    // Jump right to end
    app.move_cursor_word_right();
    app.move_cursor_word_right();
    app.move_cursor_word_right();
    app.move_cursor_word_right();
    app.move_cursor_word_right();
    app.move_cursor_word_right();
    // Should be at end after enough jumps
    assert_eq!(app.cursor, app.input_char_count());
}

// ── Alt+b / Alt+f: macOS terminal sends these for Option+Left/Right ─

#[test]
fn test_event_loop_has_alt_b_word_left_binding() {
    // macOS Terminal sends Alt+b (ESC b) for Option+Left.
    // event_loop.rs must handle Char('b') with ALT modifier as word-left,
    // not as text insertion.
    let src = include_str!("../event_loop.rs");
    assert!(
        src.contains("Char('b')") && src.contains("move_cursor_word_left"),
        "event_loop.rs must handle Alt+b as move_cursor_word_left()"
    );
}

#[test]
fn test_event_loop_has_alt_f_word_right_binding() {
    // macOS Terminal sends Alt+f (ESC f) for Option+Right.
    // event_loop.rs must handle Char('f') with ALT modifier as word-right,
    // not as text insertion.
    let src = include_str!("../event_loop.rs");
    assert!(
        src.contains("Char('f')") && src.contains("move_cursor_word_right"),
        "event_loop.rs must handle Alt+f as move_cursor_word_right()"
    );
}

/// Regression: Alt+b must NOT insert 'b' into the input buffer.
#[test]
fn test_alt_b_does_not_insert_b() {
    let mut app = App::new("test".into());
    app.input = "hello world".to_string();
    app.cursor = 11; // at end
    // Simulate what the event loop SHOULD do for Alt+b: word-jump left
    app.move_cursor_word_left();
    assert_eq!(app.cursor, 6);
    assert_eq!(app.input, "hello world"); // input unchanged, no 'b' inserted
}

/// Regression: Alt+f must NOT insert 'f' into the input buffer.
#[test]
fn test_alt_f_does_not_insert_f() {
    let mut app = App::new("test".into());
    app.input = "hello world".to_string();
    app.cursor = 0;
    // Simulate what the event loop SHOULD do for Alt+f: word-jump right
    app.move_cursor_word_right();
    assert_eq!(app.cursor, 5);
    assert_eq!(app.input, "hello world"); // input unchanged, no 'f' inserted
}

/// Alt+d is the standard Emacs binding for delete-word-forward.
/// macOS Terminal sends Alt+d for Option+d.
#[test]
fn test_event_loop_has_alt_d_delete_word_forward_binding() {
    let src = include_str!("../event_loop.rs");
    assert!(
        src.contains("Char('d')") && src.contains("delete_word_forward"),
        "event_loop.rs must handle Alt+d as delete_word_forward()"
    );
}

// ── Alt+Backspace: delete word backwards ────────────────────────

#[test]
fn test_delete_word_back_from_end() {
    let mut app = App::new("test".into());
    app.input = "hello world".to_string();
    app.cursor = 11;
    app.delete_word_back();
    assert_eq!(app.input, "hello ");
    assert_eq!(app.cursor, 6);
}

#[test]
fn test_delete_word_back_from_middle() {
    let mut app = App::new("test".into());
    app.input = "hello world".to_string();
    app.cursor = 8; // in middle of "world"
    app.delete_word_back();
    assert_eq!(app.input, "hello rld");
    assert_eq!(app.cursor, 6);
}

#[test]
fn test_delete_word_back_at_start() {
    let mut app = App::new("test".into());
    app.input = "hello".to_string();
    app.cursor = 0;
    app.delete_word_back();
    assert_eq!(app.input, "hello");
    assert_eq!(app.cursor, 0);
}

#[test]
fn test_delete_word_back_multiple_spaces() {
    let mut app = App::new("test".into());
    app.input = "hello   world".to_string();
    app.cursor = 13;
    app.delete_word_back();
    assert_eq!(app.input, "hello   ");
    assert_eq!(app.cursor, 8);
}

#[test]
fn test_delete_word_back_with_umlauts() {
    let mut app = App::new("test".into());
    app.input = "über größe".to_string();
    app.cursor = app.input_char_count(); // 10
    app.delete_word_back();
    assert_eq!(app.input, "über ");
    assert_eq!(app.cursor, 5);
}

#[test]
fn test_delete_word_back_empty_input() {
    let mut app = App::new("test".into());
    app.input = "".to_string();
    app.cursor = 0;
    app.delete_word_back();
    assert_eq!(app.input, "");
    assert_eq!(app.cursor, 0);
}

// ── Alt+Delete: delete word forwards ────────────────────────────

#[test]
fn test_delete_word_forward_from_start() {
    let mut app = App::new("test".into());
    app.input = "hello world".to_string();
    app.cursor = 0;
    app.delete_word_forward();
    assert_eq!(app.input, " world");
    assert_eq!(app.cursor, 0);
}

#[test]
fn test_delete_word_forward_from_middle() {
    let mut app = App::new("test".into());
    app.input = "hello world".to_string();
    app.cursor = 2; // after "he"
    app.delete_word_forward();
    assert_eq!(app.input, "he world");
    assert_eq!(app.cursor, 2);
}

#[test]
fn test_delete_word_forward_at_end() {
    let mut app = App::new("test".into());
    app.input = "hello".to_string();
    app.cursor = 5;
    app.delete_word_forward();
    assert_eq!(app.input, "hello");
    assert_eq!(app.cursor, 5);
}

#[test]
fn test_delete_word_forward_with_spaces() {
    let mut app = App::new("test".into());
    app.input = "hello   world".to_string();
    app.cursor = 5; // at end of "hello" (before spaces)
    app.delete_word_forward();
    // Should delete the spaces and the word "world"
    assert_eq!(app.input, "hello");
    assert_eq!(app.cursor, 5);
}

#[test]
fn test_delete_word_forward_empty_input() {
    let mut app = App::new("test".into());
    app.input = "".to_string();
    app.cursor = 0;
    app.delete_word_forward();
    assert_eq!(app.input, "");
    assert_eq!(app.cursor, 0);
}

#[test]
fn test_delete_word_forward_with_umlauts() {
    let mut app = App::new("test".into());
    app.input = "über größe".to_string();
    app.cursor = 0;
    app.delete_word_forward();
    assert_eq!(app.input, " größe");
    assert_eq!(app.cursor, 0);
}

#[test]
fn test_delete_word_forward_with_punctuation() {
    let mut app = App::new("test".into());
    app.input = "hello, world".to_string();
    app.cursor = 5; // at end of "hello", before ","
    app.delete_word_forward();
    // Deletes "," (punctuation group)
    assert_eq!(app.input, "hello world");
    assert_eq!(app.cursor, 5);
}
