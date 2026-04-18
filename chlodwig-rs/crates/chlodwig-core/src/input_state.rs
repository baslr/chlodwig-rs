//! Reusable text input state with cursor management, word-wrapping,
//! and all editing operations. Used by both the main TUI prompt and
//! the UserQuestion dialog.

use unicode_width::UnicodeWidthChar;

/// A self-contained text input with cursor, supporting insert, delete,
/// word-movement, paste, and visual cursor position calculation
/// (matching ratatui's `Wrap { trim: false }` word-wrapper).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct InputState {
    pub text: String,
    /// Cursor position as a **char index** (not byte index).
    pub cursor: usize,
}

impl Default for InputState {
    fn default() -> Self {
        Self::new()
    }
}

impl InputState {
    pub fn new() -> Self {
        Self {
            text: String::new(),
            cursor: 0,
        }
    }

    /// Create an InputState with initial text and cursor at the end.
    pub fn with_text(text: impl Into<String>) -> Self {
        let text = text.into();
        let cursor = text.chars().count();
        Self { text, cursor }
    }

    /// Number of chars in the input.
    pub fn char_count(&self) -> usize {
        self.text.chars().count()
    }

    /// Convert the char-based cursor to a byte index.
    pub fn cursor_byte_pos(&self) -> usize {
        self.text
            .char_indices()
            .nth(self.cursor)
            .map(|(i, _)| i)
            .unwrap_or(self.text.len())
    }

    /// Insert a single character at the cursor position.
    pub fn insert_char(&mut self, c: char) {
        let byte_pos = self.cursor_byte_pos();
        self.text.insert(byte_pos, c);
        self.cursor += 1;
    }

    /// Insert a newline at the cursor position.
    pub fn insert_newline(&mut self) {
        self.insert_char('\n');
    }

    /// Delete the character before the cursor (Backspace).
    pub fn delete_back(&mut self) {
        if self.cursor == 0 {
            return;
        }
        self.cursor -= 1;
        let byte_pos = self.cursor_byte_pos();
        self.text.remove(byte_pos);
    }

    /// Delete the character after the cursor (Delete key).
    pub fn delete_forward(&mut self) {
        if self.cursor >= self.char_count() {
            return;
        }
        let byte_pos = self.cursor_byte_pos();
        self.text.remove(byte_pos);
    }

    /// Move cursor one position left.
    pub fn move_left(&mut self) {
        if self.cursor > 0 {
            self.cursor -= 1;
        }
    }

    /// Move cursor one position right.
    pub fn move_right(&mut self) {
        if self.cursor < self.char_count() {
            self.cursor += 1;
        }
    }

    /// Move cursor to the beginning.
    pub fn move_home(&mut self) {
        self.cursor = 0;
    }

    /// Move cursor to the end.
    pub fn move_end(&mut self) {
        self.cursor = self.char_count();
    }

    // ── Word-wise movement ───────────────────────────────────────────

    /// Classify a character into a word-boundary category.
    fn char_category(c: char) -> u8 {
        if c.is_whitespace() {
            0
        } else if c.is_alphanumeric() || c == '_' {
            1
        } else {
            2
        }
    }

    /// Move cursor one word left (Alt+Left / Option+Left).
    pub fn move_cursor_word_left(&mut self) {
        if self.cursor == 0 {
            return;
        }
        let chars: Vec<char> = self.text.chars().collect();
        let mut pos = self.cursor;

        // Skip whitespace backwards
        while pos > 0 && chars[pos - 1].is_whitespace() {
            pos -= 1;
        }
        // Skip same-category chars backwards
        if pos > 0 {
            let cat = Self::char_category(chars[pos - 1]);
            while pos > 0 && Self::char_category(chars[pos - 1]) == cat {
                pos -= 1;
            }
        }
        self.cursor = pos;
    }

    /// Move cursor one word right (Alt+Right / Option+Right).
    pub fn move_cursor_word_right(&mut self) {
        let chars: Vec<char> = self.text.chars().collect();
        let len = chars.len();
        if self.cursor >= len {
            return;
        }
        let mut pos = self.cursor;

        if chars[pos].is_whitespace() {
            while pos < len && chars[pos].is_whitespace() {
                pos += 1;
            }
            if pos < len {
                let cat = Self::char_category(chars[pos]);
                while pos < len && Self::char_category(chars[pos]) == cat {
                    pos += 1;
                }
            }
        } else {
            let cat = Self::char_category(chars[pos]);
            while pos < len && Self::char_category(chars[pos]) == cat {
                pos += 1;
            }
        }
        self.cursor = pos;
    }

    /// Delete the word before the cursor (Alt+Backspace).
    pub fn delete_word_back(&mut self) {
        if self.cursor == 0 {
            return;
        }
        let old_cursor = self.cursor;
        self.move_cursor_word_left();
        let new_cursor = self.cursor;

        let start_byte = self.text
            .char_indices()
            .nth(new_cursor)
            .map(|(i, _)| i)
            .unwrap_or(self.text.len());
        let end_byte = self.text
            .char_indices()
            .nth(old_cursor)
            .map(|(i, _)| i)
            .unwrap_or(self.text.len());

        self.text.drain(start_byte..end_byte);
    }

    /// Delete the word after the cursor (Alt+Delete / Alt+d).
    pub fn delete_word_forward(&mut self) {
        let len = self.char_count();
        if self.cursor >= len {
            return;
        }
        let old_cursor = self.cursor;
        self.move_cursor_word_right();
        let end_cursor = self.cursor;

        let start_byte = self.text
            .char_indices()
            .nth(old_cursor)
            .map(|(i, _)| i)
            .unwrap_or(self.text.len());
        let end_byte = self.text
            .char_indices()
            .nth(end_cursor)
            .map(|(i, _)| i)
            .unwrap_or(self.text.len());

        self.text.drain(start_byte..end_byte);
        self.cursor = old_cursor;
    }

    /// Insert pasted text at cursor. Normalizes \r\n → \n.
    pub fn insert_paste(&mut self, text: &str) {
        let normalized = text.replace("\r\n", "\n").replace('\r', "\n");
        let byte_pos = self.cursor_byte_pos();
        self.text.insert_str(byte_pos, &normalized);
        self.cursor += normalized.chars().count();
    }

    /// Clear all text and reset cursor.
    pub fn clear(&mut self) {
        self.text.clear();
        self.cursor = 0;
    }

    /// Take the text out, resetting to empty. Returns the text.
    pub fn take(&mut self) -> String {
        self.cursor = 0;
        std::mem::take(&mut self.text)
    }

    /// Check if text is empty.
    pub fn is_empty(&self) -> bool {
        self.text.is_empty()
    }

    // ── Visual line / cursor position (ratatui word-wrap compatible) ──

    /// Count the number of visual lines the input occupies at the given
    /// `width` (terminal columns). Accounts for `\n` and soft-wrapping.
    /// Returns at least 1, capped at `max_lines`.
    pub fn visual_line_count(&self, width: usize, max_lines: usize) -> usize {
        if self.text.is_empty() || width == 0 {
            return 1;
        }
        let mut total = 0usize;
        for logical_line in self.text.split('\n') {
            total += Self::word_wrap_line_count(logical_line, width);
        }
        total.max(1).min(max_lines)
    }

    /// Total visual lines (uncapped).
    pub fn total_visual_lines(&self, width: usize) -> usize {
        if self.text.is_empty() || width == 0 {
            return 1;
        }
        let mut total = 0usize;
        for logical_line in self.text.split('\n') {
            total += Self::word_wrap_line_count(logical_line, width);
        }
        total.max(1)
    }

    /// Compute the visual (row, col) cursor position accounting for word-wrap.
    pub fn cursor_visual_pos(&self, width: usize) -> (usize, usize) {
        if width == 0 {
            return (0, 0);
        }
        Self::word_wrap_cursor_pos(&self.text, self.cursor, width)
    }

    /// Move cursor one visual line up. Returns true if moved.
    pub fn move_cursor_up(&mut self, width: usize) -> bool {
        if width == 0 || self.text.is_empty() {
            return false;
        }
        let (cur_row, cur_col) = Self::word_wrap_cursor_pos(&self.text, self.cursor, width);
        if cur_row == 0 {
            return false;
        }
        self.cursor = Self::char_index_at_visual_pos(&self.text, cur_row - 1, cur_col, width);
        true
    }

    /// Move cursor one visual line down. Returns true if moved.
    pub fn move_cursor_down(&mut self, width: usize) -> bool {
        if width == 0 || self.text.is_empty() {
            return false;
        }
        let (cur_row, cur_col) = Self::word_wrap_cursor_pos(&self.text, self.cursor, width);
        let total = self.total_visual_lines(width);
        if cur_row + 1 >= total {
            return false;
        }
        self.cursor = Self::char_index_at_visual_pos(&self.text, cur_row + 1, cur_col, width);
        true
    }

    // ── Internal word-wrap algorithms ────────────────────────────────

    fn word_wrap_line_count(line: &str, width: usize) -> usize {
        if line.is_empty() {
            return 1;
        }
        let (total_lines, _, _, _) = Self::word_wrap_line_with_cursor(line, width, usize::MAX);
        total_lines
    }

    fn word_wrap_cursor_pos(input: &str, cursor: usize, width: usize) -> (usize, usize) {
        let mut global_row = 0usize;
        let mut char_idx = 0usize;

        for logical_line in input.split('\n') {
            let chars_in_line = logical_line.chars().count();
            let cursor_in_line = cursor.saturating_sub(char_idx);

            if char_idx + chars_in_line >= cursor && char_idx <= cursor {
                let (_, cursor_row, cursor_col, _) =
                    Self::word_wrap_line_with_cursor(logical_line, width, cursor_in_line);
                return (global_row + cursor_row, cursor_col);
            }

            let (lines, _, _, _) =
                Self::word_wrap_line_with_cursor(logical_line, width, usize::MAX);
            global_row += lines;
            char_idx += chars_in_line + 1;
        }

        (global_row, 0)
    }

    /// Word-wrap a single logical line and compute cursor position.
    /// Returns: (total_visual_lines, cursor_row, cursor_col, chars_in_line)
    fn word_wrap_line_with_cursor(
        line: &str,
        width: usize,
        cursor_in_line: usize,
    ) -> (usize, usize, usize, usize) {
        let char_count = line.chars().count();
        if char_count == 0 {
            return (1, 0, 0, 0);
        }

        let chars_vec: Vec<char> = line.chars().collect();
        let chars_with_width: Vec<(usize, usize)> = chars_vec
            .iter()
            .enumerate()
            .map(|(i, c)| (i, c.width().unwrap_or(0)))
            .collect();

        let mut wrapped_lines: Vec<Vec<(usize, usize)>> = Vec::new();
        let mut consumed_chars: Vec<(usize, usize)> = Vec::new();

        let mut pending_line: Vec<(usize, usize)> = Vec::new();
        let mut pending_ws: Vec<(usize, usize)> = Vec::new();
        let mut pending_word: Vec<(usize, usize)> = Vec::new();
        let mut line_w: usize = 0;
        let mut ws_w: usize = 0;
        let mut word_w: usize = 0;
        let mut prev_non_ws = false;
        let mut current_visual_row: usize = 0;

        for &(ci, cw) in &chars_with_width {
            let ch = chars_vec[ci];
            let is_ws = ch.is_whitespace();

            let word_found = prev_non_ws && is_ws;
            let untrimmed_overflow =
                pending_line.is_empty() && (word_w + ws_w + cw) > width;

            if word_found || untrimmed_overflow {
                pending_line.extend(pending_ws.drain(..));
                line_w += ws_w;
                pending_line.extend(pending_word.drain(..));
                line_w += word_w;
                ws_w = 0;
                word_w = 0;
            }

            let line_full = line_w >= width;
            let pending_word_overflow = cw > 0 && (line_w + ws_w + word_w) >= width;

            if line_full || pending_word_overflow {
                wrapped_lines.push(std::mem::take(&mut pending_line));
                let remaining = width.saturating_sub(line_w);
                line_w = 0;
                current_visual_row += 1;

                let mut rem = remaining;
                while let Some(&(ws_ci, ww)) = pending_ws.first() {
                    if ww > rem {
                        break;
                    }
                    ws_w -= ww;
                    rem -= ww;
                    consumed_chars.push((ws_ci, current_visual_row));
                    pending_ws.remove(0);
                }

                if is_ws && pending_ws.is_empty() && pending_word.is_empty() {
                    consumed_chars.push((ci, current_visual_row));
                    prev_non_ws = false;
                    continue;
                }
            }

            if is_ws {
                ws_w += cw;
                pending_ws.push((ci, cw));
            } else {
                word_w += cw;
                pending_word.push((ci, cw));
            }

            prev_non_ws = !is_ws;
        }

        pending_line.extend(pending_ws.drain(..));
        pending_line.extend(pending_word.drain(..));
        if !pending_line.is_empty() {
            wrapped_lines.push(pending_line);
        }
        if wrapped_lines.is_empty() {
            wrapped_lines.push(Vec::new());
        }

        let total_lines = wrapped_lines.len();

        let (cursor_row, cursor_col) = if cursor_in_line < char_count {
            let consumed = consumed_chars.iter().find(|&&(ci, _)| ci == cursor_in_line);
            if let Some(&(_, row_after)) = consumed {
                (row_after, 0)
            } else {
                let mut found = (0usize, 0usize);
                'outer: for (row, wline) in wrapped_lines.iter().enumerate() {
                    let mut col = 0usize;
                    for &(ci, cw) in wline {
                        if ci == cursor_in_line {
                            found = (row, col);
                            break 'outer;
                        }
                        col += cw;
                    }
                }
                found
            }
        } else {
            let last_row = total_lines - 1;
            let last_line_w: usize = wrapped_lines[last_row].iter().map(|(_, w)| w).sum();
            if last_line_w == width {
                (total_lines, 0)
            } else {
                (last_row, last_line_w)
            }
        };

        (total_lines, cursor_row, cursor_col, char_count)
    }

    fn char_index_at_visual_pos(
        input: &str,
        target_row: usize,
        target_col: usize,
        width: usize,
    ) -> usize {
        let mut global_row = 0usize;
        let mut char_offset = 0usize;

        for logical_line in input.split('\n') {
            let chars_in_line = logical_line.chars().count();
            let (visual_lines, _, _, _) =
                Self::word_wrap_line_with_cursor(logical_line, width, usize::MAX);

            if target_row < global_row + visual_lines {
                let local_row = target_row - global_row;
                let local_char = Self::char_index_in_wrapped_line(
                    logical_line, local_row, target_col, width,
                );
                return char_offset + local_char;
            }

            global_row += visual_lines;
            char_offset += chars_in_line + 1;
        }

        input.chars().count()
    }

    fn char_index_in_wrapped_line(
        line: &str,
        target_row: usize,
        target_col: usize,
        width: usize,
    ) -> usize {
        if line.is_empty() {
            return 0;
        }

        let chars_vec: Vec<char> = line.chars().collect();
        let chars_with_width: Vec<(usize, usize)> = chars_vec
            .iter()
            .enumerate()
            .map(|(i, c)| (i, c.width().unwrap_or(0)))
            .collect();

        let mut wrapped_lines: Vec<Vec<(usize, usize)>> = Vec::new();
        let mut pending_line: Vec<(usize, usize)> = Vec::new();
        let mut pending_ws: Vec<(usize, usize)> = Vec::new();
        let mut pending_word: Vec<(usize, usize)> = Vec::new();
        let mut line_w: usize = 0;
        let mut ws_w: usize = 0;
        let mut word_w: usize = 0;
        let mut prev_non_ws = false;

        for &(ci, cw) in &chars_with_width {
            let ch = chars_vec[ci];
            let is_ws = ch.is_whitespace();

            let word_found = prev_non_ws && is_ws;
            let untrimmed_overflow =
                pending_line.is_empty() && (word_w + ws_w + cw) > width;

            if word_found || untrimmed_overflow {
                pending_line.extend(pending_ws.drain(..));
                line_w += ws_w;
                pending_line.extend(pending_word.drain(..));
                line_w += word_w;
                ws_w = 0;
                word_w = 0;
            }

            let line_full = line_w >= width;
            let pending_word_overflow = cw > 0 && (line_w + ws_w + word_w) >= width;

            if line_full || pending_word_overflow {
                wrapped_lines.push(std::mem::take(&mut pending_line));
                let remaining = width.saturating_sub(line_w);
                line_w = 0;

                let mut rem = remaining;
                while let Some(&(_, ww)) = pending_ws.first() {
                    if ww > rem {
                        break;
                    }
                    ws_w -= ww;
                    rem -= ww;
                    pending_ws.remove(0);
                }

                if is_ws && pending_ws.is_empty() && pending_word.is_empty() {
                    prev_non_ws = false;
                    continue;
                }
            }

            if is_ws {
                ws_w += cw;
                pending_ws.push((ci, cw));
            } else {
                word_w += cw;
                pending_word.push((ci, cw));
            }

            prev_non_ws = !is_ws;
        }

        pending_line.extend(pending_ws.drain(..));
        pending_line.extend(pending_word.drain(..));
        if !pending_line.is_empty() {
            wrapped_lines.push(pending_line);
        }
        if wrapped_lines.is_empty() {
            wrapped_lines.push(Vec::new());
        }

        if target_row >= wrapped_lines.len() {
            return chars_vec.len();
        }

        let wline = &wrapped_lines[target_row];
        if wline.is_empty() {
            if target_row > 0 {
                if let Some(&(last_ci, _)) = wrapped_lines[target_row - 1].last() {
                    return (last_ci + 1).min(chars_vec.len());
                }
            }
            return 0;
        }

        let mut col = 0usize;
        for &(ci, cw) in wline {
            if col + cw > target_col {
                return ci;
            }
            col += cw;
        }

        if let Some(&(last_ci, _)) = wline.last() {
            (last_ci + 1).min(chars_vec.len())
        } else {
            chars_vec.len()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── Basic editing ────────────────────────────────────────────────

    #[test]
    fn test_new_is_empty() {
        let s = InputState::new();
        assert!(s.is_empty());
        assert_eq!(s.cursor, 0);
    }

    #[test]
    fn test_with_text_cursor_at_end() {
        let s = InputState::with_text("hello");
        assert_eq!(s.cursor, 5);
        assert_eq!(s.text, "hello");
    }

    #[test]
    fn test_insert_char() {
        let mut s = InputState::new();
        s.insert_char('a');
        s.insert_char('b');
        assert_eq!(s.text, "ab");
        assert_eq!(s.cursor, 2);
    }

    #[test]
    fn test_insert_char_mid_text() {
        let mut s = InputState::with_text("ac");
        s.cursor = 1;
        s.insert_char('b');
        assert_eq!(s.text, "abc");
        assert_eq!(s.cursor, 2);
    }

    #[test]
    fn test_insert_umlaut_then_ascii() {
        let mut s = InputState::new();
        s.insert_char('ä');
        s.insert_char('x');
        assert_eq!(s.text, "äx");
        assert_eq!(s.cursor, 2);
    }

    #[test]
    fn test_insert_emoji_then_ascii() {
        let mut s = InputState::new();
        s.insert_char('🎉');
        s.insert_char('x');
        assert_eq!(s.text, "🎉x");
        assert_eq!(s.cursor, 2);
    }

    #[test]
    fn test_delete_back() {
        let mut s = InputState::with_text("abc");
        s.delete_back();
        assert_eq!(s.text, "ab");
        assert_eq!(s.cursor, 2);
    }

    #[test]
    fn test_delete_back_at_start_is_noop() {
        let mut s = InputState::with_text("abc");
        s.cursor = 0;
        s.delete_back();
        assert_eq!(s.text, "abc");
        assert_eq!(s.cursor, 0);
    }

    #[test]
    fn test_delete_forward() {
        let mut s = InputState::with_text("abc");
        s.cursor = 1;
        s.delete_forward();
        assert_eq!(s.text, "ac");
        assert_eq!(s.cursor, 1);
    }

    #[test]
    fn test_delete_forward_at_end_is_noop() {
        let mut s = InputState::with_text("abc");
        s.delete_forward();
        assert_eq!(s.text, "abc");
    }

    #[test]
    fn test_insert_newline() {
        let mut s = InputState::with_text("ab");
        s.cursor = 1;
        s.insert_newline();
        assert_eq!(s.text, "a\nb");
        assert_eq!(s.cursor, 2);
    }

    #[test]
    fn test_insert_paste_multiline() {
        let mut s = InputState::new();
        s.insert_paste("hello\nworld");
        assert_eq!(s.text, "hello\nworld");
        assert_eq!(s.cursor, 11);
    }

    #[test]
    fn test_insert_paste_crlf_normalized() {
        let mut s = InputState::new();
        s.insert_paste("a\r\nb");
        assert_eq!(s.text, "a\nb");
    }

    #[test]
    fn test_clear() {
        let mut s = InputState::with_text("hello");
        s.clear();
        assert!(s.is_empty());
        assert_eq!(s.cursor, 0);
    }

    #[test]
    fn test_take() {
        let mut s = InputState::with_text("hello");
        let t = s.take();
        assert_eq!(t, "hello");
        assert!(s.is_empty());
        assert_eq!(s.cursor, 0);
    }

    // ── Movement ─────────────────────────────────────────────────────

    #[test]
    fn test_move_left_right() {
        let mut s = InputState::with_text("abc");
        s.move_left();
        assert_eq!(s.cursor, 2);
        s.move_left();
        assert_eq!(s.cursor, 1);
        s.move_right();
        assert_eq!(s.cursor, 2);
    }

    #[test]
    fn test_move_left_at_zero() {
        let mut s = InputState::new();
        s.move_left();
        assert_eq!(s.cursor, 0);
    }

    #[test]
    fn test_move_right_at_end() {
        let mut s = InputState::with_text("x");
        s.move_right();
        assert_eq!(s.cursor, 1);
    }

    #[test]
    fn test_move_home_end() {
        let mut s = InputState::with_text("hello");
        s.move_home();
        assert_eq!(s.cursor, 0);
        s.move_end();
        assert_eq!(s.cursor, 5);
    }

    // ── Word movement ────────────────────────────────────────────────

    #[test]
    fn test_move_word_left() {
        let mut s = InputState::with_text("hello world");
        s.move_cursor_word_left();
        assert_eq!(s.cursor, 6); // before "world"
    }

    #[test]
    fn test_move_word_right() {
        let mut s = InputState::with_text("hello world");
        s.cursor = 0;
        s.move_cursor_word_right();
        assert_eq!(s.cursor, 5); // after "hello"
    }

    #[test]
    fn test_delete_word_back() {
        let mut s = InputState::with_text("hello world");
        s.delete_word_back();
        assert_eq!(s.text, "hello ");
        assert_eq!(s.cursor, 6);
    }

    #[test]
    fn test_delete_word_forward() {
        let mut s = InputState::with_text("hello world");
        s.cursor = 0;
        s.delete_word_forward();
        assert_eq!(s.text, " world");
        assert_eq!(s.cursor, 0);
    }

    // ── Visual line count ────────────────────────────────────────────

    #[test]
    fn test_visual_line_count_single_line() {
        let s = InputState::with_text("hello");
        assert_eq!(s.visual_line_count(80, 10), 1);
    }

    #[test]
    fn test_visual_line_count_wraps() {
        let s = InputState::with_text("a".repeat(25).as_str());
        assert_eq!(s.visual_line_count(10, 10), 3);
    }

    #[test]
    fn test_visual_line_count_newline() {
        let s = InputState::with_text("a\nb");
        assert_eq!(s.visual_line_count(80, 10), 2);
    }

    #[test]
    fn test_visual_line_count_capped() {
        let s = InputState::with_text("a\nb\nc\nd\ne");
        assert_eq!(s.visual_line_count(80, 3), 3);
    }

    // ── Cursor visual position ───────────────────────────────────────

    #[test]
    fn test_cursor_visual_pos_simple() {
        let mut s = InputState::with_text("hello");
        s.cursor = 3;
        assert_eq!(s.cursor_visual_pos(80), (0, 3));
    }

    #[test]
    fn test_cursor_visual_pos_wrapped() {
        let mut s = InputState::with_text("a".repeat(15).as_str());
        s.cursor = 12;
        let (row, col) = s.cursor_visual_pos(10);
        assert_eq!(row, 1);
        assert_eq!(col, 2);
    }

    // ── Vertical movement ────────────────────────────────────────────

    #[test]
    fn test_cursor_up_simple_newline() {
        let mut s = InputState::with_text("abc\ndef");
        s.cursor = 5; // 'd', 'e' → char 5 = 'e' on second line
        assert!(s.move_cursor_up(80));
        // Should be on first line, col 1 → char 1 = 'b'
        assert_eq!(s.cursor, 1);
    }

    #[test]
    fn test_cursor_down_simple_newline() {
        let mut s = InputState::with_text("abc\ndef");
        s.cursor = 1; // 'b' on first line
        assert!(s.move_cursor_down(80));
        assert_eq!(s.cursor, 5); // 'e' on second line
    }

    #[test]
    fn test_cursor_up_at_top_returns_false() {
        let mut s = InputState::with_text("abc\ndef");
        s.cursor = 1;
        assert!(!s.move_cursor_up(80));
    }

    #[test]
    fn test_cursor_down_at_bottom_returns_false() {
        let mut s = InputState::with_text("abc\ndef");
        s.cursor = 5;
        assert!(!s.move_cursor_down(80));
    }

    #[test]
    fn test_cursor_up_clamps_to_shorter_line() {
        let mut s = InputState::with_text("ab\ndefgh");
        s.cursor = 7; // 'g' on second line, col 4
        assert!(s.move_cursor_up(80));
        // First line only has 2 chars, so clamp to end → cursor=2
        assert_eq!(s.cursor, 2);
    }
}
