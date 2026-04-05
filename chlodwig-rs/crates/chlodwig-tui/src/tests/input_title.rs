//! Tests for the input title bar showing character and byte counts.

use crate::render::input_title;

#[test]
fn test_input_title_empty() {
    let title = input_title("");
    assert!(title.contains("0 chars"), "Expected '0 chars' in: {title}");
    assert!(title.contains("0 bytes"), "Expected '0 bytes' in: {title}");
}

#[test]
fn test_input_title_ascii() {
    let title = input_title("hello");
    assert!(title.contains("5 chars"), "Expected '5 chars' in: {title}");
    assert!(title.contains("5 bytes"), "Expected '5 bytes' in: {title}");
}

#[test]
fn test_input_title_multibyte_utf8() {
    // "ä" is 2 bytes, "€" is 3 bytes → "ä€" = 2 chars, 5 bytes
    let title = input_title("ä€");
    assert!(title.contains("2 chars"), "Expected '2 chars' in: {title}");
    assert!(title.contains("5 bytes"), "Expected '5 bytes' in: {title}");
}

#[test]
fn test_input_title_emoji() {
    // "🦀" is 4 bytes, 1 char
    let title = input_title("🦀");
    assert!(title.contains("1 char"), "Expected '1 char' (singular) in: {title}");
    assert!(title.contains("4 bytes"), "Expected '4 bytes' in: {title}");
}

#[test]
fn test_input_title_contains_enter_hint() {
    let title = input_title("hi");
    assert!(title.contains("Enter"), "Title should mention Enter to send");
}

#[test]
fn test_input_title_singular_one_char() {
    let title = input_title("x");
    assert!(title.contains("1 char"), "Expected '1 char' in: {title}");
    assert!(!title.contains("1 chars"), "Should be singular '1 char', not '1 chars': {title}");
}

#[test]
fn test_input_title_singular_one_byte() {
    let title = input_title("x");
    assert!(title.contains("1 byte"), "Expected '1 byte' in: {title}");
    assert!(!title.contains("1 bytes"), "Should be singular '1 byte', not '1 bytes': {title}");
}

#[test]
fn test_input_title_multiline() {
    // Newlines count as chars and bytes
    let title = input_title("a\nb");
    assert!(title.contains("3 chars"), "Expected '3 chars' in: {title}");
    assert!(title.contains("3 bytes"), "Expected '3 bytes' in: {title}");
}
