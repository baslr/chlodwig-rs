//! Tests for ANSI escape code parser — GTK-independent.

use crate::ansi::{parse_ansi, AnsiColor};

#[test]
fn test_plain_text_no_escapes() {
    let segments = parse_ansi("hello world");
    assert_eq!(segments.len(), 1);
    assert_eq!(segments[0].text, "hello world");
    assert_eq!(segments[0].fg, None);
    assert!(!segments[0].bold);
}

#[test]
fn test_empty_string() {
    let segments = parse_ansi("");
    assert!(segments.is_empty());
}

#[test]
fn test_red_text() {
    // \x1b[31m = set foreground red, \x1b[0m = reset
    let segments = parse_ansi("\x1b[31mred text\x1b[0m");
    assert_eq!(segments.len(), 1);
    assert_eq!(segments[0].text, "red text");
    assert_eq!(segments[0].fg, Some(AnsiColor::Red));
}

#[test]
fn test_red_then_plain() {
    let segments = parse_ansi("\x1b[31mred\x1b[0m plain");
    assert_eq!(segments.len(), 2);
    assert_eq!(segments[0].text, "red");
    assert_eq!(segments[0].fg, Some(AnsiColor::Red));
    assert_eq!(segments[1].text, " plain");
    assert_eq!(segments[1].fg, None);
}

#[test]
fn test_bold_text() {
    let segments = parse_ansi("\x1b[1mbold\x1b[0m");
    assert_eq!(segments.len(), 1);
    assert_eq!(segments[0].text, "bold");
    assert!(segments[0].bold);
}

#[test]
fn test_bold_green() {
    // \x1b[1;32m = bold + green
    let segments = parse_ansi("\x1b[1;32mbold green\x1b[0m");
    assert_eq!(segments.len(), 1);
    assert_eq!(segments[0].text, "bold green");
    assert!(segments[0].bold);
    assert_eq!(segments[0].fg, Some(AnsiColor::Green));
}

#[test]
fn test_multiple_colors() {
    let input = "\x1b[31mred\x1b[32mgreen\x1b[34mblue\x1b[0m";
    let segments = parse_ansi(input);
    assert_eq!(segments.len(), 3);
    assert_eq!(segments[0].text, "red");
    assert_eq!(segments[0].fg, Some(AnsiColor::Red));
    assert_eq!(segments[1].text, "green");
    assert_eq!(segments[1].fg, Some(AnsiColor::Green));
    assert_eq!(segments[2].text, "blue");
    assert_eq!(segments[2].fg, Some(AnsiColor::Blue));
}

#[test]
fn test_bright_colors() {
    // \x1b[91m = bright red
    let segments = parse_ansi("\x1b[91mbright red\x1b[0m");
    assert_eq!(segments.len(), 1);
    assert_eq!(segments[0].text, "bright red");
    assert_eq!(segments[0].fg, Some(AnsiColor::BrightRed));
}

#[test]
fn test_256_color() {
    // \x1b[38;5;208m = 256-color orange (index 208)
    let segments = parse_ansi("\x1b[38;5;208morange\x1b[0m");
    assert_eq!(segments.len(), 1);
    assert_eq!(segments[0].text, "orange");
    assert_eq!(segments[0].fg, Some(AnsiColor::Indexed(208)));
}

#[test]
fn test_rgb_color() {
    // \x1b[38;2;255;128;0m = RGB orange
    let segments = parse_ansi("\x1b[38;2;255;128;0mrgb orange\x1b[0m");
    assert_eq!(segments.len(), 1);
    assert_eq!(segments[0].text, "rgb orange");
    assert_eq!(segments[0].fg, Some(AnsiColor::Rgb(255, 128, 0)));
}

#[test]
fn test_text_before_escape() {
    let segments = parse_ansi("before\x1b[31mred\x1b[0m");
    assert_eq!(segments.len(), 2);
    assert_eq!(segments[0].text, "before");
    assert_eq!(segments[0].fg, None);
    assert_eq!(segments[1].text, "red");
    assert_eq!(segments[1].fg, Some(AnsiColor::Red));
}

#[test]
fn test_trailing_text_after_reset() {
    let segments = parse_ansi("\x1b[31mred\x1b[0m after");
    assert_eq!(segments.len(), 2);
    assert_eq!(segments[0].text, "red");
    assert_eq!(segments[1].text, " after");
    assert_eq!(segments[1].fg, None);
}

#[test]
fn test_newlines_preserved() {
    let segments = parse_ansi("\x1b[31mline1\nline2\x1b[0m");
    assert_eq!(segments.len(), 1);
    assert_eq!(segments[0].text, "line1\nline2");
}

#[test]
fn test_utf8_content() {
    let segments = parse_ansi("\x1b[33müber äöü\x1b[0m");
    assert_eq!(segments.len(), 1);
    assert_eq!(segments[0].text, "über äöü");
    assert_eq!(segments[0].fg, Some(AnsiColor::Yellow));
}

#[test]
fn test_reset_without_prior_style() {
    // Reset when no style is active — should not produce empty segments
    let segments = parse_ansi("\x1b[0mhello");
    assert_eq!(segments.len(), 1);
    assert_eq!(segments[0].text, "hello");
    assert_eq!(segments[0].fg, None);
}

#[test]
fn test_only_escape_no_text() {
    let segments = parse_ansi("\x1b[31m\x1b[0m");
    assert!(segments.is_empty());
}

#[test]
fn test_all_basic_colors() {
    let colors = [
        (30, AnsiColor::Black),
        (31, AnsiColor::Red),
        (32, AnsiColor::Green),
        (33, AnsiColor::Yellow),
        (34, AnsiColor::Blue),
        (35, AnsiColor::Magenta),
        (36, AnsiColor::Cyan),
        (37, AnsiColor::White),
    ];
    for (code, expected) in colors {
        let input = format!("\x1b[{code}mx\x1b[0m");
        let segments = parse_ansi(&input);
        assert_eq!(segments[0].fg, Some(expected), "code {code}");
    }
}

#[test]
fn test_background_color_ignored_but_parsed() {
    // Background colors (40-47) should be parsed without crashing.
    // We only track foreground for now.
    let segments = parse_ansi("\x1b[41mred bg\x1b[0m");
    assert_eq!(segments.len(), 1);
    assert_eq!(segments[0].text, "red bg");
    // fg is None because 41 is background, not foreground
    assert_eq!(segments[0].fg, None);
}

#[test]
fn test_underline_parsed_without_crash() {
    // \x1b[4m = underline — we don't render it but shouldn't crash
    let segments = parse_ansi("\x1b[4munderlined\x1b[0m");
    assert_eq!(segments.len(), 1);
    assert_eq!(segments[0].text, "underlined");
}

#[test]
fn test_decckm_pager_sequences_stripped() {
    // Git with a PTY pager emits \x1b[?1h at start and \x1b[?1l at end.
    // These are DECCKM (DEC Cursor Key Mode) sequences, not SGR.
    // They must be stripped, not rendered as tofu.
    let input = "\x1b[?1h\x1b[33mhello\x1b[0m\x1b[?1l";
    let segments = parse_ansi(input);
    assert_eq!(segments.len(), 1);
    assert_eq!(segments[0].text, "hello");
    assert_eq!(segments[0].fg, Some(AnsiColor::Yellow));
}

#[test]
fn test_erase_line_stripped() {
    // \x1b[K = erase to end of line — common in colored output
    let input = "\x1b[31mred\x1b[K\x1b[0m";
    let segments = parse_ansi(input);
    assert_eq!(segments.len(), 1);
    assert_eq!(segments[0].text, "red");
}

#[test]
fn test_cursor_movement_stripped() {
    // \x1b[2A = move cursor up 2 lines
    let input = "before\x1b[2Aafter";
    let segments = parse_ansi(input);
    assert_eq!(segments.len(), 1);
    assert_eq!(segments[0].text, "beforeafter");
}

#[test]
fn test_decckm_with_trailing_chars() {
    // \x1b[?1h= and \x1b[?1l> — the '=' and '>' after the sequence
    // are literal characters that should appear in the output... but
    // actually `less` sends \x1b[?1h (no trailing char). The '=' is
    // the DECCKM "application" response. Let's handle both cases.
    // In practice, `git log` output starts with \x1b[?1h= and ends with \x1b[?1l>
    // The = and > are part of separate escape sequences.
    // \x1b[?1h is the full sequence, = is the next char.
    let input = "\x1b[?1h=\x1b[33mhello\x1b[0m\x1b[K\x1b[?1l>";
    let segments = parse_ansi(input);
    // "=" and ">" are literal chars between sequences, "hello" is the colored text
    assert!(segments.iter().any(|s| s.text.contains("hello")));
    // No tofu (0x1B) should appear in any segment text
    for seg in &segments {
        assert!(
            !seg.text.contains('\x1b'),
            "Segment contains raw ESC: {:?}",
            seg.text,
        );
    }
}

#[test]
fn test_git_log_realistic_output() {
    // Realistic git log --oneline output with PTY pager sequences
    let input = "\x1b[?1h=\x1b[33m16975bf\x1b[m docs: mark ANSI\n\x1b[33m466e142\x1b[m gtk: add ANSI\n\x1b[K\x1b[?1l>";
    let segments = parse_ansi(input);
    // Should contain the commit hashes and messages, no tofu
    let full_text: String = segments.iter().map(|s| &s.text[..]).collect();
    assert!(full_text.contains("16975bf"), "missing hash: {full_text}");
    assert!(full_text.contains("docs: mark ANSI"), "missing msg: {full_text}");
    assert!(!full_text.contains('\x1b'), "raw ESC in output: {full_text}");
}
