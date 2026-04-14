//! ANSI escape code parser — extracts styled text segments.
//!
//! Parses SGR (Select Graphic Rendition) sequences: `\x1b[...m`.
//! Supports: basic colors (30-37, 90-97), 256-color (38;5;N),
//! RGB (38;2;R;G;B), bold (1), reset (0).
//!
//! This module is GTK-independent and fully unit-tested.

/// A color extracted from an ANSI escape sequence.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AnsiColor {
    Black,
    Red,
    Green,
    Yellow,
    Blue,
    Magenta,
    Cyan,
    White,
    BrightBlack,
    BrightRed,
    BrightGreen,
    BrightYellow,
    BrightBlue,
    BrightMagenta,
    BrightCyan,
    BrightWhite,
    /// 256-color palette index (0-255).
    Indexed(u8),
    /// 24-bit RGB color.
    Rgb(u8, u8, u8),
}

impl AnsiColor {
    /// Convert to a CSS hex color string for use in GtkTextTags.
    pub fn to_hex(&self) -> String {
        match self {
            AnsiColor::Black => "#000000".into(),
            AnsiColor::Red => "#cc0000".into(),
            AnsiColor::Green => "#4e9a06".into(),
            AnsiColor::Yellow => "#c4a000".into(),
            AnsiColor::Blue => "#3465a4".into(),
            AnsiColor::Magenta => "#75507b".into(),
            AnsiColor::Cyan => "#06989a".into(),
            AnsiColor::White => "#d3d7cf".into(),
            AnsiColor::BrightBlack => "#555753".into(),
            AnsiColor::BrightRed => "#ef2929".into(),
            AnsiColor::BrightGreen => "#8ae234".into(),
            AnsiColor::BrightYellow => "#fce94f".into(),
            AnsiColor::BrightBlue => "#729fcf".into(),
            AnsiColor::BrightMagenta => "#ad7fa8".into(),
            AnsiColor::BrightCyan => "#34e2e2".into(),
            AnsiColor::BrightWhite => "#eeeeec".into(),
            AnsiColor::Indexed(idx) => index_to_hex(*idx),
            AnsiColor::Rgb(r, g, b) => format!("#{r:02x}{g:02x}{b:02x}"),
        }
    }
}

/// A segment of text with optional ANSI styling.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AnsiSegment {
    pub text: String,
    pub fg: Option<AnsiColor>,
    pub bold: bool,
}

/// Parse a string containing ANSI escape codes into styled segments.
///
/// Only SGR sequences (`\x1b[...m`) are parsed. Other escape sequences
/// (cursor movement, etc.) are silently stripped.
pub fn parse_ansi(input: &str) -> Vec<AnsiSegment> {
    let mut segments = Vec::new();
    let mut current_text = String::new();
    let mut current_fg: Option<AnsiColor> = None;
    let mut current_bold = false;

    let bytes = input.as_bytes();
    let len = bytes.len();
    let mut i = 0;

    while i < len {
        if bytes[i] == 0x1b && i + 1 < len && bytes[i + 1] == b'[' {
            // Found ESC[  — parse the SGR sequence
            i += 2; // skip ESC[
            let seq_start = i;
            // Find the terminating letter
            while i < len && bytes[i] != b'm' && !(bytes[i] >= b'A' && bytes[i] <= b'Z' && bytes[i] != b'M') {
                // SGR ends with 'm', but other CSI sequences end with other letters.
                // We scan until we find any letter.
                if bytes[i].is_ascii_alphabetic() {
                    break;
                }
                i += 1;
            }
            if i < len && bytes[i] == b'm' {
                // SGR sequence — parse the parameters
                let params = &input[seq_start..i];
                // Flush current text before style change
                if !current_text.is_empty() {
                    segments.push(AnsiSegment {
                        text: std::mem::take(&mut current_text),
                        fg: current_fg,
                        bold: current_bold,
                    });
                }
                apply_sgr(params, &mut current_fg, &mut current_bold);
                i += 1; // skip 'm'
            } else if i < len {
                // Non-SGR CSI sequence — skip it
                i += 1;
            }
        } else {
            // Regular character — accumulate into current segment
            // Handle multi-byte UTF-8 properly
            let ch_start = i;
            i += 1;
            while i < len && (bytes[i] & 0xC0) == 0x80 {
                i += 1; // skip continuation bytes
            }
            current_text.push_str(&input[ch_start..i]);
        }
    }

    // Flush remaining text
    if !current_text.is_empty() {
        segments.push(AnsiSegment {
            text: current_text,
            fg: current_fg,
            bold: current_bold,
        });
    }

    segments
}

/// Apply SGR (Select Graphic Rendition) parameters to the current state.
fn apply_sgr(params: &str, fg: &mut Option<AnsiColor>, bold: &mut bool) {
    if params.is_empty() {
        // ESC[m = reset
        *fg = None;
        *bold = false;
        return;
    }

    let codes: Vec<u8> = params
        .split(';')
        .filter_map(|s| s.parse::<u8>().ok())
        .collect();

    let mut j = 0;
    while j < codes.len() {
        match codes[j] {
            0 => {
                *fg = None;
                *bold = false;
            }
            1 => *bold = true,
            22 => *bold = false,
            // Basic foreground colors (30-37)
            30 => *fg = Some(AnsiColor::Black),
            31 => *fg = Some(AnsiColor::Red),
            32 => *fg = Some(AnsiColor::Green),
            33 => *fg = Some(AnsiColor::Yellow),
            34 => *fg = Some(AnsiColor::Blue),
            35 => *fg = Some(AnsiColor::Magenta),
            36 => *fg = Some(AnsiColor::Cyan),
            37 => *fg = Some(AnsiColor::White),
            39 => *fg = None, // default foreground
            // Bright foreground colors (90-97)
            90 => *fg = Some(AnsiColor::BrightBlack),
            91 => *fg = Some(AnsiColor::BrightRed),
            92 => *fg = Some(AnsiColor::BrightGreen),
            93 => *fg = Some(AnsiColor::BrightYellow),
            94 => *fg = Some(AnsiColor::BrightBlue),
            95 => *fg = Some(AnsiColor::BrightMagenta),
            96 => *fg = Some(AnsiColor::BrightCyan),
            97 => *fg = Some(AnsiColor::BrightWhite),
            // Extended foreground: 38;5;N (256-color) or 38;2;R;G;B (RGB)
            38 => {
                if j + 1 < codes.len() {
                    match codes[j + 1] {
                        5 if j + 2 < codes.len() => {
                            *fg = Some(AnsiColor::Indexed(codes[j + 2]));
                            j += 2;
                        }
                        2 if j + 4 < codes.len() => {
                            *fg = Some(AnsiColor::Rgb(codes[j + 2], codes[j + 3], codes[j + 4]));
                            j += 4;
                        }
                        _ => {}
                    }
                }
            }
            // Background colors (40-47, 100-107, 48;5;N, 48;2;R;G;B)
            // We parse but don't render background — skip sub-params for 48
            48 => {
                if j + 1 < codes.len() {
                    match codes[j + 1] {
                        5 if j + 2 < codes.len() => j += 2,
                        2 if j + 4 < codes.len() => j += 4,
                        _ => {}
                    }
                }
            }
            // Everything else (underline, italic, etc.) — ignore
            _ => {}
        }
        j += 1;
    }
}

/// Convert a 256-color palette index to a hex color string.
fn index_to_hex(idx: u8) -> String {
    match idx {
        // Standard colors (0-7)
        0 => "#000000".into(),
        1 => "#cc0000".into(),
        2 => "#4e9a06".into(),
        3 => "#c4a000".into(),
        4 => "#3465a4".into(),
        5 => "#75507b".into(),
        6 => "#06989a".into(),
        7 => "#d3d7cf".into(),
        // Bright colors (8-15)
        8 => "#555753".into(),
        9 => "#ef2929".into(),
        10 => "#8ae234".into(),
        11 => "#fce94f".into(),
        12 => "#729fcf".into(),
        13 => "#ad7fa8".into(),
        14 => "#34e2e2".into(),
        15 => "#eeeeec".into(),
        // 216 color cube (16-231): 6x6x6
        16..=231 => {
            let idx = idx - 16;
            let r = (idx / 36) % 6;
            let g = (idx / 6) % 6;
            let b = idx % 6;
            let to_val = |c: u8| if c == 0 { 0u8 } else { 55 + 40 * c };
            format!("#{:02x}{:02x}{:02x}", to_val(r), to_val(g), to_val(b))
        }
        // Grayscale (232-255): 24 shades
        232..=255 => {
            let v = 8 + 10 * (idx - 232);
            format!("#{v:02x}{v:02x}{v:02x}")
        }
    }
}
