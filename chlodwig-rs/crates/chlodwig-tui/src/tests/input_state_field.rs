//! Regression tests: `App.input` must be of type `chlodwig_core::InputState`
//! (Stage 2 / B.0 of the MVU migration).
//!
//! These tests pin the type-shape so we don't accidentally regress to
//! `input: String, cursor: usize` after the refactor.

use chlodwig_core::InputState;

use crate::app::App;

#[test]
fn test_app_input_field_is_input_state() {
    // Compiles only if `app.input` is `InputState` (or a type with these methods/fields).
    let mut app = App::new("test-model".into());
    let _: &InputState = &app.input;
    let _: &mut InputState = &mut app.input;
}

#[test]
fn test_app_has_no_separate_cursor_field() {
    // The cursor lives inside InputState now. We verify by reading it through `input`.
    let app = App::new("test-model".into());
    assert_eq!(app.input.cursor, 0);
    assert!(app.input.text.is_empty());
}

#[test]
fn test_input_state_methods_available_via_app() {
    let mut app = App::new("test-model".into());
    app.input.insert_char('a');
    app.input.insert_char('b');
    assert_eq!(app.input.text, "ab");
    assert_eq!(app.input.cursor, 2);
    app.input.delete_back();
    assert_eq!(app.input.text, "a");
    assert_eq!(app.input.cursor, 1);
}

#[test]
fn test_input_state_utf8_via_app() {
    let mut app = App::new("test-model".into());
    app.input.insert_char('ä');
    app.input.insert_char('ö');
    assert_eq!(app.input.text, "äö");
    assert_eq!(app.input.cursor, 2); // chars, not bytes
    assert_eq!(app.input.cursor_byte_pos(), 4); // 2× 2-byte UTF-8
}
