//! Tests for line-number formatting in tool output (Read, Write).
//!
//! The Read tool returns `cat -n`-style output where each line is
//! `  <number>\t<code>`.  We need to right-align the numbers so that
//! the `│` separator stays visually aligned when the number width grows
//! (e.g. single-digit vs. triple-digit lines).

use crate::format_numbered_lines;

#[test]
fn test_line_numbers_single_digit_padded() {
    let input = "     1\tpub fn main() {\n     2\t    println!(\"hi\");\n     3\t}\n";
    let lines = format_numbered_lines(input);
    // All gutter widths must be equal — digit 1 should be right-aligned to match width of "3"
    assert_eq!(lines.len(), 3);
    assert_eq!(lines[0].0, " 1 │ ");
    assert_eq!(lines[0].1, "pub fn main() {");
    assert_eq!(lines[1].0, " 2 │ ");
    assert_eq!(lines[1].1, "    println!(\"hi\");");
    assert_eq!(lines[2].0, " 3 │ ");
    assert_eq!(lines[2].1, "}");
}

#[test]
fn test_line_numbers_double_digit_aligned() {
    // 9 lines + 10th — ensures single-digit lines get padded to 2-char width
    let mut input = String::new();
    for i in 1..=12 {
        input.push_str(&format!("     {i}\tline {i}\n"));
    }
    let lines = format_numbered_lines(&input);
    assert_eq!(lines.len(), 12);
    // Single-digit numbers right-aligned to width 2
    assert_eq!(lines[0].0, "  1 │ ");
    assert_eq!(lines[8].0, "  9 │ ");
    // Double-digit numbers use full width
    assert_eq!(lines[9].0, " 10 │ ");
    assert_eq!(lines[11].0, " 12 │ ");
}

#[test]
fn test_line_numbers_triple_digit_aligned() {
    let mut input = String::new();
    for i in 98..=102 {
        input.push_str(&format!("     {i}\tline {i}\n"));
    }
    let lines = format_numbered_lines(&input);
    assert_eq!(lines.len(), 5);
    // Two-digit numbers padded to width 3
    assert_eq!(lines[0].0, "  98 │ ");
    assert_eq!(lines[1].0, "  99 │ ");
    // Three-digit numbers use full width
    assert_eq!(lines[2].0, " 100 │ ");
    assert_eq!(lines[4].0, " 102 │ ");
}

#[test]
fn test_line_numbers_without_tab_passthrough() {
    // Lines without a tab separator should be returned as-is (no gutter)
    let input = "no tab here\n";
    let lines = format_numbered_lines(input);
    assert_eq!(lines.len(), 1);
    assert_eq!(lines[0].0, ""); // no gutter
    assert_eq!(lines[0].1, "no tab here");
}

#[test]
fn test_line_numbers_empty_input() {
    let lines = format_numbered_lines("");
    assert!(lines.is_empty());
}

#[test]
fn test_line_numbers_empty_code_part() {
    // A blank line in source code: number + tab, but nothing after
    let input = "     1\tcode\n     2\t\n     3\tmore\n";
    let lines = format_numbered_lines(input);
    assert_eq!(lines.len(), 3);
    assert_eq!(lines[1].0, " 2 │ ");
    assert_eq!(lines[1].1, ""); // empty code part
}

#[test]
fn test_line_numbers_utf8_code() {
    let input = "     1\tfn grüße() { // 🎉\n     2\t    let ä = 42;\n";
    let lines = format_numbered_lines(input);
    assert_eq!(lines.len(), 2);
    assert_eq!(lines[0].1, "fn grüße() { // 🎉");
    assert_eq!(lines[1].1, "    let ä = 42;");
}
