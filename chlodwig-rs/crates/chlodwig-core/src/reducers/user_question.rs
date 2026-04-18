//! UserQuestion modal reducer.
//!
//! When the LLM calls the `UserQuestion` tool, the UI displays a modal dialog
//! with a question, an optional list of pre-defined options, and a free-text
//! input field. The user can:
//!
//! - Navigate options with `↑`/`↓` (Up at top stays; Down past last → text input)
//! - Toggle option-list ↔ text input with `Tab`
//! - Type into the text input (when `selected == None`)
//! - Quick-select an option with `1`..`9` (only valid while an option is selected)
//! - Submit with `Enter` (sends selected option text or typed text)
//! - Cancel with `Esc` (sends empty string)
//!
//! This module owns the **pure state machine** for that dialog. UIs translate
//! their native events into [`Msg`] values, call [`Model::update`], and react
//! to the returned [`Outcome`]. The actual `oneshot::Sender<String>` lives in
//! the UI layer (it cannot be in core because reducers must be `Clone`-able
//! and side-effect-free).
//!
//! ## Example
//!
//! ```
//! use chlodwig_core::reducers::user_question::{Model, Msg, Outcome};
//!
//! let mut m = Model::new("Pick a color".into(), vec!["Red".into(), "Blue".into()]);
//! assert_eq!(m.selected, Some(0));
//!
//! assert_eq!(m.update(Msg::NavDown), Outcome::None);
//! assert_eq!(m.selected, Some(1));
//!
//! match m.update(Msg::Submit) {
//!     Outcome::Submit(answer) => assert_eq!(answer, "Blue"),
//!     _ => panic!(),
//! }
//! ```

use crate::input_state::InputState;

/// The pure state of the dialog. Owned by the UI inside its `PendingUserQuestion`
/// wrapper (which adds the `oneshot::Sender<String>` for the response).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Model {
    pub question: String,
    pub options: Vec<String>,
    /// Currently selected option index, or `None` when free-text input is focused.
    pub selected: Option<usize>,
    pub input: InputState,
}

impl Model {
    /// Create a new dialog model.
    ///
    /// If `options` is non-empty the first option is pre-selected; otherwise
    /// the dialog starts in text-input mode.
    pub fn new(question: String, options: Vec<String>) -> Self {
        let selected = if options.is_empty() { None } else { Some(0) };
        Self {
            question,
            options,
            selected,
            input: InputState::new(),
        }
    }

    /// True when the user is currently typing into the free-text input
    /// (no option is selected). Editing keys (Char, Backspace, …) only apply
    /// in this mode.
    pub fn is_text_mode(&self) -> bool {
        self.selected.is_none()
    }

    /// Apply an event to the model and return what the UI should do next.
    ///
    /// Style note: each arm is written as a single `match` with guards. Every
    /// case lists its own precondition; the arm has exactly one return point.
    pub fn update(&mut self, msg: Msg) -> Outcome {
        match msg {
            Msg::NavUp => {
                match self.selected {
                    _ if self.options.is_empty() => {} // no options at all
                    Some(0) => {}                      // already at top
                    Some(i) => self.selected = Some(i - 1),
                    None => self.selected = Some(self.options.len() - 1),
                }
                Outcome::None
            }
            Msg::NavDown => {
                match self.selected {
                    _ if self.options.is_empty() => {} // no options at all
                    Some(i) if i + 1 < self.options.len() => self.selected = Some(i + 1),
                    Some(_) => self.selected = None,   // past last → text input
                    None => {}                          // already in text input
                }
                Outcome::None
            }
            Msg::ToggleFocus => {
                self.selected = match self.selected {
                    _ if self.options.is_empty() => self.selected, // no toggle possible
                    Some(_) => None,
                    None => Some(0),
                };
                Outcome::None
            }
            Msg::Submit => Outcome::Submit(self.current_answer()),
            Msg::Cancel => Outcome::Submit(String::new()),

            Msg::QuickSelect(n) => match self.option_at_number(n) {
                Some(answer) => Outcome::Submit(answer),
                None => Outcome::None,
            },

            // ── Text-mode-only editing keys ────────────────────────────
            Msg::InsertChar(c) => {
                if self.is_text_mode() {
                    self.input.insert_char(c);
                }
                Outcome::None
            }
            Msg::InsertNewline => {
                if self.is_text_mode() {
                    self.input.insert_newline();
                }
                Outcome::None
            }
            Msg::InsertPaste(text) => {
                if self.is_text_mode() {
                    self.input.insert_paste(&text);
                }
                Outcome::None
            }
            Msg::SetText(text) => {
                // Even in option-selection mode the GTK text widget might fire
                // a `changed` signal (e.g. placeholder reset) — accept it
                // unconditionally and place cursor at end.
                self.input = InputState::with_text(text);
                Outcome::None
            }
            Msg::DeleteBack => {
                if self.is_text_mode() && self.input.cursor > 0 {
                    self.input.delete_back();
                }
                Outcome::None
            }
            Msg::DeleteForward => {
                if self.is_text_mode() {
                    self.input.delete_forward();
                }
                Outcome::None
            }
            Msg::DeleteWordBack => {
                if self.is_text_mode() {
                    self.input.delete_word_back();
                }
                Outcome::None
            }
            Msg::DeleteWordForward => {
                if self.is_text_mode() {
                    self.input.delete_word_forward();
                }
                Outcome::None
            }
            Msg::CursorLeft => {
                if self.is_text_mode() && self.input.cursor > 0 {
                    self.input.move_left();
                }
                Outcome::None
            }
            Msg::CursorRight => {
                if self.is_text_mode() && self.input.cursor < self.input.char_count() {
                    self.input.move_right();
                }
                Outcome::None
            }
            Msg::CursorWordLeft => {
                if self.is_text_mode() {
                    self.input.move_cursor_word_left();
                }
                Outcome::None
            }
            Msg::CursorWordRight => {
                if self.is_text_mode() {
                    self.input.move_cursor_word_right();
                }
                Outcome::None
            }
            Msg::CursorHome => {
                if self.is_text_mode() {
                    self.input.move_home();
                }
                Outcome::None
            }
            Msg::CursorEnd => {
                if self.is_text_mode() {
                    self.input.move_end();
                }
                Outcome::None
            }
        }
    }

    /// What `Submit` would currently send: either the selected option's
    /// text, or the typed text.
    fn current_answer(&self) -> String {
        match self.selected {
            Some(idx) => self.options[idx].clone(),
            None => self.input.text.clone(),
        }
    }

    /// Resolve a number-key press (`1`..`9`) to the option it would submit.
    ///
    /// Returns `None` when:
    /// - the dialog has no options, or
    /// - the user is in free-text mode (number keys type digits instead), or
    /// - the digit is out of `1..=9`, or
    /// - the digit points past the end of the options list.
    fn option_at_number(&self, n: u8) -> Option<String> {
        let idx = (n as usize).checked_sub(1)?;
        self.selected?;                       // text-mode → no quick-select
        self.options.get(idx).cloned()
    }
}

/// All events the dialog can receive. UIs map their native key events
/// (crossterm `KeyEvent`, GTK signals, …) onto these variants.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Msg {
    NavUp,
    NavDown,
    ToggleFocus,
    Submit,
    Cancel,
    /// Number key 1..9 — submits the corresponding option iff currently in
    /// option-selection mode and the index is in range.
    QuickSelect(u8),

    InsertChar(char),
    InsertNewline,
    InsertPaste(String),
    /// Replace the entire input buffer with the given text and place the
    /// cursor at the end. Used by GTK frontends that own their own text
    /// widget (`gtk4::TextBuffer`) — on every buffer change they sync the
    /// full content into the model in one shot, instead of translating
    /// individual key events to `InsertChar`/`DeleteBack`/etc.
    SetText(String),
    DeleteBack,
    DeleteForward,
    DeleteWordBack,
    DeleteWordForward,
    CursorLeft,
    CursorRight,
    CursorWordLeft,
    CursorWordRight,
    CursorHome,
    CursorEnd,
}

/// What the UI should do after `update` returns.
///
/// `None` means: keep the dialog open, just redraw.
/// `Submit(s)` means: send `s` to the LLM via the `oneshot::Sender` and close
/// the dialog.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Outcome {
    None,
    Submit(String),
}

#[cfg(test)]
mod tests {
    use super::*;

    fn with_options(q: &str, opts: &[&str]) -> Model {
        Model::new(q.into(), opts.iter().map(|s| s.to_string()).collect())
    }

    fn text_only(q: &str) -> Model {
        Model::new(q.into(), Vec::new())
    }

    // ── Initial state ─────────────────────────────────────────────────

    #[test]
    fn test_new_with_options_starts_on_first_option() {
        let m = with_options("Pick", &["A", "B"]);
        assert_eq!(m.selected, Some(0));
        assert!(m.input.is_empty());
        assert!(!m.is_text_mode());
    }

    #[test]
    fn test_new_without_options_starts_in_text_mode() {
        let m = text_only("?");
        assert_eq!(m.selected, None);
        assert!(m.is_text_mode());
    }

    // ── Navigation ────────────────────────────────────────────────────

    #[test]
    fn test_nav_down_through_options() {
        let mut m = with_options("Pick", &["A", "B", "C"]);
        assert_eq!(m.update(Msg::NavDown), Outcome::None);
        assert_eq!(m.selected, Some(1));
        m.update(Msg::NavDown);
        assert_eq!(m.selected, Some(2));
        // Past last → text input
        m.update(Msg::NavDown);
        assert_eq!(m.selected, None);
        // Stays None
        m.update(Msg::NavDown);
        assert_eq!(m.selected, None);
    }

    #[test]
    fn test_nav_up_from_text_to_last_option() {
        let mut m = with_options("Pick", &["A", "B", "C"]);
        m.selected = None;
        m.update(Msg::NavUp);
        assert_eq!(m.selected, Some(2));
    }

    #[test]
    fn test_nav_up_at_first_option_stays() {
        let mut m = with_options("Pick", &["A", "B"]);
        m.update(Msg::NavUp);
        assert_eq!(m.selected, Some(0));
    }

    #[test]
    fn test_nav_no_op_when_no_options() {
        let mut m = text_only("?");
        m.update(Msg::NavUp);
        assert_eq!(m.selected, None);
        m.update(Msg::NavDown);
        assert_eq!(m.selected, None);
    }

    // ── Tab toggle ────────────────────────────────────────────────────

    #[test]
    fn test_toggle_focus_options_to_text() {
        let mut m = with_options("Pick", &["A"]);
        m.update(Msg::ToggleFocus);
        assert_eq!(m.selected, None);
    }

    #[test]
    fn test_toggle_focus_text_to_first_option() {
        let mut m = with_options("Pick", &["A", "B"]);
        m.selected = None;
        m.update(Msg::ToggleFocus);
        assert_eq!(m.selected, Some(0));
    }

    #[test]
    fn test_toggle_focus_no_op_without_options() {
        let mut m = text_only("?");
        m.update(Msg::ToggleFocus);
        assert_eq!(m.selected, None);
    }

    // ── Submit / Cancel ───────────────────────────────────────────────

    #[test]
    fn test_submit_selected_option() {
        let mut m = with_options("Pick", &["Alpha", "Beta"]);
        assert_eq!(m.update(Msg::Submit), Outcome::Submit("Alpha".into()));
    }

    #[test]
    fn test_submit_second_option() {
        let mut m = with_options("Pick", &["A", "B", "C"]);
        m.update(Msg::NavDown);
        assert_eq!(m.update(Msg::Submit), Outcome::Submit("B".into()));
    }

    #[test]
    fn test_submit_typed_text_in_text_mode() {
        let mut m = text_only("?");
        m.update(Msg::InsertChar('h'));
        m.update(Msg::InsertChar('i'));
        assert_eq!(m.update(Msg::Submit), Outcome::Submit("hi".into()));
    }

    #[test]
    fn test_submit_freetext_overrides_options_when_in_text_mode() {
        let mut m = with_options("Pick color", &["Red", "Blue"]);
        m.selected = None;
        m.input = InputState::with_text("Green");
        assert_eq!(m.update(Msg::Submit), Outcome::Submit("Green".into()));
    }

    #[test]
    fn test_cancel_returns_empty_string() {
        let mut m = with_options("Pick", &["A"]);
        assert_eq!(m.update(Msg::Cancel), Outcome::Submit(String::new()));
    }

    // ── Quick-select ──────────────────────────────────────────────────

    #[test]
    fn test_quick_select_picks_option_by_number() {
        let mut m = with_options("Pick", &["A", "B", "C"]);
        assert_eq!(m.update(Msg::QuickSelect(2)), Outcome::Submit("B".into()));
    }

    #[test]
    fn test_quick_select_first_option() {
        let mut m = with_options("Pick", &["A", "B"]);
        assert_eq!(m.update(Msg::QuickSelect(1)), Outcome::Submit("A".into()));
    }

    #[test]
    fn test_quick_select_out_of_range_no_op() {
        let mut m = with_options("Pick", &["A", "B"]);
        assert_eq!(m.update(Msg::QuickSelect(3)), Outcome::None);
        // Model unchanged
        assert_eq!(m.selected, Some(0));
    }

    #[test]
    fn test_quick_select_ignored_in_text_mode() {
        let mut m = with_options("Pick", &["A", "B"]);
        m.selected = None;
        // In text mode, '2' is just a character, NOT a quick-select.
        // The reducer's Msg::QuickSelect arm should refuse.
        assert_eq!(m.update(Msg::QuickSelect(2)), Outcome::None);
        assert_eq!(m.selected, None);
    }

    #[test]
    fn test_quick_select_ignored_when_no_options() {
        let mut m = text_only("?");
        assert_eq!(m.update(Msg::QuickSelect(1)), Outcome::None);
    }

    #[test]
    fn test_quick_select_zero_is_no_op() {
        // n=0 has no meaningful option (we count from 1). The reducer must
        // not panic on `checked_sub(1)` and must not select anything.
        let mut m = with_options("Pick", &["A", "B"]);
        assert_eq!(m.update(Msg::QuickSelect(0)), Outcome::None);
        assert_eq!(m.selected, Some(0));
    }

    // ── Editing keys are gated to text mode ───────────────────────────

    #[test]
    fn test_insert_char_only_in_text_mode() {
        let mut m = with_options("Pick", &["A"]);
        // selected == Some(0) → ignored
        m.update(Msg::InsertChar('x'));
        assert!(m.input.is_empty());
        // Switch to text → now it inserts
        m.update(Msg::ToggleFocus);
        m.update(Msg::InsertChar('x'));
        assert_eq!(m.input.text, "x");
    }

    #[test]
    fn test_delete_back_only_in_text_mode() {
        let mut m = with_options("Pick", &["A"]);
        m.input = InputState::with_text("hi");
        m.update(Msg::DeleteBack);
        assert_eq!(m.input.text, "hi"); // unchanged in option mode
        m.update(Msg::ToggleFocus);
        m.update(Msg::DeleteBack);
        assert_eq!(m.input.text, "h");
    }

    #[test]
    fn test_delete_back_no_op_at_cursor_zero() {
        let mut m = text_only("?");
        m.update(Msg::DeleteBack);
        assert_eq!(m.input.text, "");
    }

    // ── Editing key behaviors ─────────────────────────────────────────

    #[test]
    fn test_insert_char_appends_at_cursor() {
        let mut m = text_only("?");
        m.update(Msg::InsertChar('a'));
        m.update(Msg::InsertChar('b'));
        assert_eq!(m.input.text, "ab");
        assert_eq!(m.input.cursor, 2);
    }

    #[test]
    fn test_insert_newline() {
        let mut m = text_only("?");
        m.update(Msg::InsertChar('a'));
        m.update(Msg::InsertNewline);
        m.update(Msg::InsertChar('b'));
        assert_eq!(m.input.text, "a\nb");
    }

    #[test]
    fn test_insert_paste_normalizes_crlf() {
        let mut m = text_only("?");
        m.update(Msg::InsertPaste("a\r\nb".into()));
        assert_eq!(m.input.text, "a\nb");
    }

    #[test]
    fn test_delete_word_back() {
        let mut m = text_only("?");
        m.input = InputState::with_text("hello world");
        m.update(Msg::DeleteWordBack);
        assert_eq!(m.input.text, "hello ");
    }

    #[test]
    fn test_delete_word_forward() {
        let mut m = text_only("?");
        m.input = InputState::with_text("hello world");
        m.input.cursor = 0;
        m.update(Msg::DeleteWordForward);
        assert_eq!(m.input.text, " world");
    }

    #[test]
    fn test_cursor_left_right() {
        let mut m = text_only("?");
        m.input = InputState::with_text("ab");
        // cursor at end (=2)
        m.update(Msg::CursorLeft);
        assert_eq!(m.input.cursor, 1);
        m.update(Msg::CursorLeft);
        assert_eq!(m.input.cursor, 0);
        m.update(Msg::CursorLeft);
        assert_eq!(m.input.cursor, 0); // clamps
        m.update(Msg::CursorRight);
        assert_eq!(m.input.cursor, 1);
        m.update(Msg::CursorRight);
        assert_eq!(m.input.cursor, 2);
        m.update(Msg::CursorRight);
        assert_eq!(m.input.cursor, 2); // clamps
    }

    #[test]
    fn test_cursor_word_movement() {
        let mut m = text_only("?");
        m.input = InputState::with_text("hello world");
        m.update(Msg::CursorWordLeft);
        assert_eq!(m.input.cursor, 6);
        m.update(Msg::CursorWordRight);
        assert_eq!(m.input.cursor, 11);
    }

    #[test]
    fn test_cursor_home_end() {
        let mut m = text_only("?");
        m.input = InputState::with_text("hello");
        m.update(Msg::CursorHome);
        assert_eq!(m.input.cursor, 0);
        m.update(Msg::CursorEnd);
        assert_eq!(m.input.cursor, 5);
    }

    #[test]
    fn test_delete_forward() {
        let mut m = text_only("?");
        m.input = InputState::with_text("abc");
        m.input.cursor = 1;
        m.update(Msg::DeleteForward);
        assert_eq!(m.input.text, "ac");
        assert_eq!(m.input.cursor, 1);
    }

    // ── UTF-8 ─────────────────────────────────────────────────────────

    #[test]
    fn test_utf8_question_and_answer() {
        let mut m = Model::new(
            "Frage über Größe?".into(),
            vec!["Groß".into(), "Klein".into()],
        );
        assert_eq!(m.question, "Frage über Größe?");
        assert_eq!(m.update(Msg::Submit), Outcome::Submit("Groß".into()));
    }

    #[test]
    fn test_utf8_text_input_backspace() {
        let mut m = text_only("?");
        m.input = InputState::with_text("Ärger");
        m.update(Msg::DeleteBack);
        assert_eq!(m.input.text, "Ärge");
    }

    #[test]
    fn test_utf8_emoji_paste() {
        let mut m = text_only("?");
        m.update(Msg::InsertPaste("Hi 🎉 du".into()));
        assert_eq!(m.input.text, "Hi 🎉 du");
    }

    // ── Full interaction flow ─────────────────────────────────────────

    #[test]
    fn test_full_flow_navigate_then_submit() {
        let mut m = with_options("Wähle Farbe", &["Rot", "Grün", "Blau"]);
        assert_eq!(m.update(Msg::NavDown), Outcome::None);
        assert_eq!(m.update(Msg::NavDown), Outcome::None);
        assert_eq!(m.update(Msg::Submit), Outcome::Submit("Blau".into()));
    }

    #[test]
    fn test_full_flow_tab_to_text_then_type_then_submit() {
        let mut m = with_options("Wähle Farbe", &["Rot", "Blau"]);
        m.update(Msg::ToggleFocus);
        m.update(Msg::InsertChar('G'));
        m.update(Msg::InsertChar('e'));
        m.update(Msg::InsertChar('l'));
        m.update(Msg::InsertChar('b'));
        assert_eq!(m.update(Msg::Submit), Outcome::Submit("Gelb".into()));
    }

    // ── SetText (used by GTK frontend that owns its own text widget) ──

    #[test]
    fn test_set_text_replaces_input_and_places_cursor_at_end() {
        let mut m = text_only("?");
        m.update(Msg::InsertChar('a'));
        m.update(Msg::InsertChar('b'));
        // cursor at 2

        assert_eq!(m.update(Msg::SetText("hello".into())), Outcome::None);
        assert_eq!(m.input.text, "hello");
        assert_eq!(m.input.cursor, 5);
    }

    #[test]
    fn test_set_text_to_empty_string() {
        let mut m = text_only("?");
        m.update(Msg::SetText("xxx".into()));
        m.update(Msg::SetText(String::new()));
        assert_eq!(m.input.text, "");
        assert_eq!(m.input.cursor, 0);
    }

    #[test]
    fn test_set_text_utf8_cursor_at_char_count_not_byte_count() {
        let mut m = text_only("?");
        // "héllo" = 5 chars, 6 bytes (é is 2 bytes)
        m.update(Msg::SetText("héllo".into()));
        assert_eq!(m.input.cursor, 5, "cursor must be in chars, not bytes");
    }

    #[test]
    fn test_set_text_works_in_option_mode_too() {
        // GTK fires `changed` independent of which widget has focus; the
        // reducer must accept SetText regardless of `selected`.
        let mut m = with_options("Pick", &["A", "B"]);
        assert!(!m.is_text_mode());
        m.update(Msg::SetText("typed while option was highlighted".into()));
        assert_eq!(m.input.text, "typed while option was highlighted");
        // selection is untouched
        assert_eq!(m.selected, Some(0));
    }

    #[test]
    fn test_set_text_then_submit_in_text_mode() {
        // Realistic GTK flow: user clicks into text, types via TextBuffer,
        // GTK syncs full content via SetText, then user clicks Submit.
        let mut m = text_only("?");
        m.update(Msg::SetText("Hallo Welt".into()));
        assert_eq!(m.update(Msg::Submit), Outcome::Submit("Hallo Welt".into()));
    }

    #[test]
    fn test_set_text_then_submit_in_option_mode_returns_option_not_text() {
        // Selected option wins over typed text — `current_answer()` invariant.
        let mut m = with_options("Pick", &["A", "B"]);
        m.update(Msg::SetText("ignored".into()));
        assert_eq!(m.update(Msg::Submit), Outcome::Submit("A".into()));
    }
}
