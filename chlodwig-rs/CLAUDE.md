# Chlodwig RS — Development Guide

## TDD: Test-Driven Development (STRICT)

This project follows **strict TDD**. Every code change MUST follow this cycle:

1. **Write the test FIRST** — before writing any implementation code
2. **Run the test** — confirm it fails (red)
3. **Write the minimal implementation** to make the test pass (green)
4. **Refactor** — clean up while keeping tests green
5. **Run `cargo test --workspace`** — all tests must pass before committing

### Rules

- **Never skip tests.** Every new function, method, or behavior MUST have a corresponding test.
- **Never write implementation code without a failing test first.**
- **Bug fixes require a regression test** that reproduces the bug before writing the fix.
- **Edge cases are not optional.** UTF-8 boundaries, empty inputs, overflow, large data — test them.
- **Tests must be self-documenting.** Name them `test_<what_it_does>` and add a comment if the intent is not obvious.
- **Run `cargo test --workspace` after every change.** No exceptions.

### Test Locations

| Crate | Test Location | Focus |
|-------|--------------|-------|
| chlodwig-core | `auto_scroll.rs` mod tests | AutoScroll state machine (shared by TUI+GTK) |
| chlodwig-core | `conversation.rs` mod tests | Conversation loop, compaction, SSE events |
| chlodwig-core | `messages.rs` mod tests | Serde round-trips |
| chlodwig-api | `client.rs` mod tests | SSE parser |
| chlodwig-tools | Each tool file mod tests | Tool behavior, edge cases, network (WebFetch/WebSearch) |
| chlodwig-tui | `lib.rs` mod tests | Scroll logic, input handling, UTF-8 |

## Architecture

Cargo workspace with 5 crates:

```
chlodwig-cli → chlodwig-core
             → chlodwig-api  → chlodwig-core
             → chlodwig-tools → chlodwig-core
             → chlodwig-tui   → chlodwig-core
```

`api`, `tools`, and `tui` are independent of each other. Only `cli` ties everything together.

## Key Patterns

- **Channel-based UI decoupling**: `mpsc::UnboundedSender<ConversationEvent>` from conversation loop to UI
- **Trait-based abstraction**: `ApiClient`, `Tool`, `PermissionPrompter` — all mockable in tests
- **Index-based block accumulation**: `HashMap<u32, BlockAcc>` for interleaved SSE content blocks
- **Char vs Byte distinction**: `cursor` is a char index; always use `cursor_byte_pos()` for String operations
- **Lazy redraw**: Only redraw when `needs_redraw` is set — never redraw in idle

## Known Gotchas (Learned from Bugs)

These were discovered during development. **Never regress on these:**

1. **UTF-8 input handling**: `String::insert()`/`remove()` take byte indices, not char indices. Always convert via `cursor_byte_pos()`. Tested by `test_insert_umlaut_then_ascii`, `test_insert_emoji_then_ascii`, etc.

2. **Interleaved SSE blocks**: GitHub API sends multiple `ContentBlockStart` events before any `ContentBlockStop`. Must use per-index `HashMap<u32, BlockAcc>`, not a single accumulator. Tested by `test_interleaved_tool_blocks`.

3. **`[DONE]` SSE terminator**: GitHub API sends `data: [DONE]` as stream terminator. Must filter before JSON parse. Handled in `chlodwig-api` SSE parser.

4. **Mouse move events**: `EnableMouseCapture` sends `MouseEventKind::Moved` on every mouse movement. These MUST NOT trigger redraw, or CPU goes to 100%.

5. **Scroll anchoring**: When leaving auto-scroll, anchor `scroll` at the current bottom position first, not at 0. Otherwise scroll jumps to top.

6. **Empty tool names**: Filter `tool_uses.retain(|t| !t.name.is_empty())` before executing tools. Interleaved blocks can produce empty-name entries.

7. **Tracing crate names**: Rust crate names use underscores (`chlodwig_core`), not hyphens (`chlodwig-core`). Filter expressions must match.

8. **Trackpad event flooding**: Trackpad scroll gestures generate hundreds of `MouseEventKind::Moved`/`Drag` events per gesture. If you read only ONE event per `poll()` call, the event queue never drains, `poll()` returns immediately → busy-loop at 100% CPU. **Fix**: inner drain loop that reads ALL pending events before continuing: `loop { read(); if !poll(0ms) { break; } }`. Only `ScrollUp`/`ScrollDown`/`Key`/`Resize` set `needs_redraw`; all other mouse events are silently discarded.

9. **Ghost artifacts when scrolling**: ratatui's diff-based rendering compares the current buffer against the previous frame and only sends changed cells to the terminal. **Fix**: `render_output()` pads every line with spaces to fill the full viewport width (so every cell is overwritten), and vertically pads with empty lines to fill the view height. This ensures every cell gets a value on each frame, so ratatui's diff correctly updates the entire screen. **Do NOT call `terminal.swap_buffers()` before `terminal.draw()`** — `draw()` already calls `swap_buffers()` internally (ratatui 0.29). Calling it twice corrupts the double-buffer state and produces garbled output (the "previous" buffer that ratatui diffs against becomes a stale/reset buffer).

10. **`continue` inside inner drain loop blocks**: The inner event drain loop (`loop { read(); if !poll(0ms) { break; } }`) must never use `continue` — it skips the `poll(0ms)` break-check and `read()` blocks indefinitely waiting for the next event. Always use `break` to exit the inner loop.

11. **`chars().count()` ≠ terminal display width**: Never use `chars().count()` for terminal column calculations. CJK characters, emojis, etc. occupy 2 terminal columns but are 1 char. Use `unicode_width::UnicodeWidthStr::width()` or ratatui's `Line::width()`. The `RenderedLine::display_width()` method and `wrap()` both use unicode-width. Tested by `test_display_width_uses_unicode_width`, `test_wrap_respects_unicode_display_width`.

12. **Bash commands need PTY for color output**: `std::process::Command::output()` captures stdout/stderr via pipes. Programs detect `isatty(stdout) == false` and disable ANSI colors. **Fix**: Wrap execution in `script -q /dev/null bash -c '...'` (macOS) or `script -qc '...' /dev/null` (Linux) to allocate a pseudo-terminal. Side effect: stderr is merged into stdout through the PTY, so separate stderr capture is lost. The ANSI codes are parsed by ratatui's `into_text()` in the `BashOutput` display block renderer. Tested by `test_pty_provides_isatty`.

13. **crossterm Key Release events cause double-fire**: crossterm 0.26+ sends `KeyEventKind::Press`, `KeyEventKind::Release`, and `KeyEventKind::Repeat` events. If the event loop handles ALL key events without filtering, every keystroke fires twice (press + release). **Fix**: Match only `Event::Key(key) if key.kind == KeyEventKind::Press`. Without this filter, Backspace deletes 2 chars per press, Char input inserts 2 chars, etc. Tested by `test_backspace_deletes_exactly_one_char`.

14. **Incoming content must not override manual scroll**: When the user has scrolled up (`auto_scroll=false`), streaming `TextDelta`, `ToolUseStart`, `ToolResult`, `CompactionStarted`, `CompactionComplete` events must NOT call `scroll_to_bottom()` — that forces the viewport back to the bottom, yanking the user away from what they're reading. **Fix**: Use `scroll_to_bottom_if_auto()` for all incoming-content events; it's a no-op when the user has manually scrolled. Use `scroll_to_bottom()` only for explicit user actions (submit prompt, `/compact` command, `!` shell). Tested by `test_new_content_does_not_override_manual_scroll`, `test_new_content_follows_when_auto_scroll_active`.

15. **Crash diagnostics: static 10 MiB buffer + signal handlers**: The Rust panic hook only catches `panic!()` calls. Real crashes (SIGSEGV, SIGBUS, SIGABRT, SIGFPE) bypass it entirely. **Fix**: A 10 MiB static buffer (`CRASH_BUF`) is pre-allocated in BSS at startup. Signal handlers for fatal signals restore the terminal, write crash info (backtrace + App state) into the static buffer (no heap allocation needed), flush to `crash_*.log`, dump to stderr, then re-raise with default handler. **Do NOT handle SIGINT** — crossterm captures Ctrl+C as a KeyEvent for graceful shutdown; intercepting SIGINT breaks terminal restore. The `CRASH_STATE` mutex holds the latest `App::crash_dump()` snapshot, updated every redraw (~10Hz). A `TerminalGuard` (Drop) ensures `disable_raw_mode()`+`LeaveAlternateScreen` run even when `?` operators bail out of the event loop. Tests that touch the static buffer are serialized via `SERIAL_LOCK` to avoid race conditions. Tested by `test_static_crash_buffer_write_and_read`, `test_static_crash_buffer_contains_backtrace`, `test_static_buf_size_is_10mb`.

16. **ToolResult preview byte-slicing panic**: `&t[..500]` panics when byte 500 lands inside a multi-byte UTF-8 character (e.g. `├` is 3 bytes E2 94 9C). **This was the production crash bug** — `cargo tree` output contains box-drawing characters. **Fix**: Walk backwards from byte 500 with `is_char_boundary()` to find the last valid boundary. Same pattern for `crash_dump()` streaming_buffer tail. **Never use `&str[..N]` with a hardcoded byte offset.** Always use `is_char_boundary()`, `char_indices()`, or `.chars().take(N)`. Tested by `test_tool_result_preview_truncation_at_utf8_boundary`, `test_tool_result_preview_emoji_boundary`.

17. **SIGHUP causes silent death**: Without a SIGHUP handler, the process terminates silently with no crash log when the controlling terminal sends SIGHUP (e.g. SSH disconnect, terminal multiplexer detach, or macOS terminal session cleanup). The default handler just kills the process — no panic hook, no signal handler, no log. **Fix**: Register SIGHUP alongside the other fatal signals (SIGSEGV, SIGBUS, SIGABRT, SIGFPE) so it writes a full crash report before terminating. Tested by `test_sighup_is_in_signal_handler_list`, `test_sighup_crash_report_contains_signal_name`.

18. **Eager `rebuild_requests_lines()` causes 100% CPU**: The Requests tab renders every SSE chunk as pretty-printed JSON with syntect syntax highlighting (`render_markdown` → regex DFA). Calling `rebuild_requests_lines()` eagerly on every `HttpRequest`, `HttpResponseMeta`, and `HttpResponseComplete` event creates an O(n²) loop — each new event re-renders ALL previous chunks. With hundreds of SSE events per request, this pegs the CPU at 100%. **Fix**: Only set `requests_dirty = true` on incoming events. Defer the actual rebuild to just before `terminal.draw()`, and only when `active_tab == 2` (Requests tab is visible). When the user is on the Prompt tab, zero rendering work happens for request data. Tested by `test_rebuild_requests_lines_is_lazy_not_eager`.

19. **`tokio::spawn` silently swallows panics + `unsafe` lifetime UB**: The conversation turn was spawned via `tokio::spawn` with the `JoinHandle` immediately dropped. If the task panicked, the panic message went to stderr (invisible under alternate screen), and the event loop never learned the task died — the UI hung forever with a spinner. Additionally, `api_client` was passed via a raw pointer cast to `&'static dyn ApiClient` (`unsafe`), which is Undefined Behavior if the event loop exits before the spawned task. **Fix**: (1) Changed `api_client` from `Box<dyn ApiClient>` to `Arc<dyn ApiClient>` — eliminates the `unsafe` block entirely. (2) Store the `JoinHandle` and poll `is_finished()` each loop iteration; on panic, extract the panic message, log it via `tracing::error!`, and display it in the UI. (3) Always send `TurnComplete` after the task finishes (even after `Error`), consistent with the `/compact` handler. (4) Added `tracing::error!` before sending `ConversationEvent::Error` so conversation failures appear in the debug log. Tested by `test_api_client_is_arc_not_box`, `test_run_tui_is_arc_not_box`.

20. **macOS Terminal sends Alt+b/Alt+f instead of Alt+Left/Alt+Right**: macOS Terminal (and many others with default settings) sends `ESC b` / `ESC f` for Option+Left / Option+Right. crossterm decodes these as `KeyCode::Char('b')` / `KeyCode::Char('f')` with `KeyModifiers::ALT`. Without explicit handling, the general `Char(c)` arm inserts a literal 'b' or 'f' into the input. **Fix**: Added dedicated match arms for `Char('b')` + ALT → `move_cursor_word_left()`, `Char('f')` + ALT → `move_cursor_word_right()`, and `Char('d')` + ALT → `delete_word_forward()` (Emacs binding), all placed before the general `Char(c)` arm. Tested by `test_event_loop_has_alt_b_word_left_binding`, `test_event_loop_has_alt_f_word_right_binding`, `test_event_loop_has_alt_d_delete_word_forward_binding`, `test_alt_b_does_not_insert_b`, `test_alt_f_does_not_insert_f`.

21. **Input area must soft-wrap long lines**: The old input height was based on `input.lines().count()` which only counts explicit `\n` newlines. Long text without newlines rendered as a single visual line that overflowed past the right border, making the cursor invisible and text unreadable. **Fix**: `input_visual_line_count(width)` computes visual line count by iterating chars and their `UnicodeWidthChar::width()`, wrapping at the given terminal column width. `input_cursor_visual_pos(width)` computes the (row, col) position of the cursor accounting for soft-wrap. `render_input()` uses `Paragraph::wrap(Wrap { trim: false })` so ratatui wraps the text, and the input area height grows dynamically (capped at 10 visual lines). **Never use `lines().count()` for input height** — it misses soft-wrap lines. Tested by `test_input_visual_lines_long_text_wraps`, `test_input_cursor_visual_pos_wrapped`, `test_input_cursor_visual_pos_at_wrap_boundary`, `test_input_cursor_visual_pos_cjk`, `test_input_visual_lines_capped_at_max`.

22. **Cursor position must match ratatui's word-wrapping**: `Paragraph::wrap(Wrap { trim: false })` uses **word-level wrapping** — when a word doesn't fit on the current line, the entire word moves to the next line. The old `input_cursor_visual_pos` used character-level wrapping (break at any char), causing cursor misalignment when a long word gets bumped to the next line. **Fix**: Rewrote `input_cursor_visual_pos` and `input_visual_line_count` with a two-pass algorithm that faithfully replicates ratatui's `WordWrapper` (trim=false): Phase 1 builds wrapped lines using the same state machine (pending_line/pending_ws/pending_word, word boundary flush, untrimmed overflow for char-breaking long words, whitespace draining at line breaks). Phase 2 looks up the cursor's char index in the wrapped lines. Consumed whitespace at line breaks (drained or skipped) maps to `(next_row, 0)`. **Key subtlety**: ratatui's `untrimmed_overflow` flushes the pending word to the line when `pending_line.is_empty() && word_w + ws_w + char_w > width`, enabling character-level breaking for words wider than the viewport. Without this, pure non-whitespace text (e.g. `"a".repeat(20)`) never triggers a line break. **CJK gotcha**: CJK characters without spaces form a single "word" — if the word overflows but the pending_word_overflow check (`line_w + ws_w + word_w >= width`) is false after the untrimmed flush, ratatui keeps them on the same line (content gets clipped, not wrapped). Tested by `test_input_cursor_visual_pos_word_wrap_last_word`, `test_input_cursor_visual_pos_word_wrap_mid_word`, `test_input_cursor_visual_pos_word_wrap_at_space`, `test_input_cursor_visual_pos_word_wrap_start_of_wrapped_word`, `test_input_visual_line_count_word_wrap`, `test_input_visual_line_count_word_longer_than_width`.

23. **macOS German keyboard: Fn+Option+Backspace sends `Char('(')` + ALT**: On German macOS keyboard layout, `Fn+Option+Backspace` (intended as "delete word forward") does NOT send `KeyCode::Delete` + ALT. Instead, macOS merges `Fn` (remaps Backspace→Delete) with `Option` (dead-key layer) and the terminal receives the character `(` (from `Option+8` on German layout) with ALT modifier. crossterm decodes this as `Char('(')` + `KeyModifiers::ALT`. Without explicit handling, the general `Char(c)` arm inserts a literal `(` into the input. **Fix**: Added a dedicated match arm for `Char('(')` + ALT → `delete_word_forward()`, placed before the general `Char(c)` arm. Normal `(` input (via `Shift+8`) arrives as `Char('(')` + SHIFT (no ALT), so it's not affected. **Workaround if other layouts have similar issues**: `Alt+d` (Emacs binding) always works for delete-word-forward. Tested by `test_event_loop_has_fn_option_backspace_german_binding`, `test_fn_option_backspace_does_not_insert_paren`.

24. **Shift+Enter and Alt+Enter are indistinguishable from Enter in most terminals**: Most terminals (macOS Terminal, iTerm2, GNOME Terminal) send the same escape code (CR / `0x0d`) for Enter, Shift+Enter, and swallow Alt+Enter entirely. Only terminals supporting the **Kitty keyboard protocol** (Kitty, WezTerm, foot, Ghostty) send distinct codes for modified Enter. **Fix**: (1) **Ctrl+J** (ASCII linefeed `0x0a`) is the primary newline shortcut — it works in **every** terminal because it's a completely different character code. (2) Shift+Enter and Alt+Enter are kept as additional bindings for Kitty-protocol terminals. (3) Kitty keyboard protocol enabled via `PushKeyboardEnhancementFlags(REPORT_EVENT_TYPES | DISAMBIGUATE_ESCAPE_CODES)` at startup — terminals that don't support it silently ignore the sequence. (4) `TerminalGuard::drop()` sends `PopKeyboardEnhancementFlags` to restore the terminal. Tested by `test_shift_enter_inserts_newline`, `test_shift_enter_inserts_newline_mid_text`, `test_shift_enter_multiple_newlines`, `test_event_loop_has_shift_enter_newline_binding`, `test_event_loop_has_alt_enter_newline_binding`, `test_event_loop_has_ctrl_j_newline_binding`, `test_ctrl_j_does_not_insert_j`.

25. **Up/Down arrows must move cursor vertically in multiline input**: When the input contains `\n` newlines or is soft-wrapped across multiple visual lines, Up/Down should move the cursor one visual line up/down (preserving display column where possible, clamping to end-of-line if the target line is shorter). **Only when the cursor is already on the first/last visual line** should Up/Down fall through to prompt history browsing (Up) or tab-bar navigation (Down). If the user is already browsing history (`history_index.is_some()`), Up/Down continue navigating history without attempting vertical cursor movement. **Implementation**: `move_cursor_up(width)` / `move_cursor_down(width)` return `bool` (true = moved, false = first/last line, caller should fall through). Uses `char_index_at_visual_pos()` — the inverse of `word_wrap_cursor_pos()` — to find the char index at a given visual (row, col). The word-wrap algorithm is duplicated from `word_wrap_line_with_cursor` to build wrapped lines and scan for the target position. Tested by `test_cursor_up_simple_newline`, `test_cursor_down_simple_newline`, `test_cursor_up_soft_wrap`, `test_cursor_down_soft_wrap`, `test_cursor_up_clamps_to_shorter_line`, `test_cursor_down_clamps_to_shorter_line`, `test_cursor_up_cjk_display_width`, `test_cursor_up_down_three_lines`, `test_event_loop_has_cursor_up_for_multiline`, `test_event_loop_has_cursor_down_for_multiline`.

26. **Bracketed paste: multiline paste must not trigger submit**: Without bracketed paste mode, pasting multiline text via Cmd+V sends each character individually, and `\n` is treated as Enter (submit). This truncates the paste at the first newline. **Fix**: Enable `EnableBracketedPaste` at terminal startup. The terminal wraps pasted text in escape sequences (`\e[200~` ... `\e[201~`), and crossterm delivers the entire paste as a single `Event::Paste(String)`. The `insert_paste()` method inserts the full text at the cursor position, preserving `\n` as literal newlines. Windows-style `\r\n` is normalized to `\n`. `DisableBracketedPaste` is sent on cleanup (TerminalGuard, panic hook, signal handlers). Tested by `test_insert_paste_multiline`, `test_insert_paste_at_cursor`, `test_insert_paste_empty`, `test_insert_paste_single_line`, `test_insert_paste_trailing_newline`, `test_insert_paste_utf8`, `test_insert_paste_crlf_normalized`, `test_insert_paste_into_multiline_input`, `test_event_loop_has_paste_handler`, `test_event_loop_enables_bracketed_paste`, `test_event_loop_disables_bracketed_paste`.

27. **UserQuestion tool: LLM asks the user questions via a TUI dialog**: The model can call `UserQuestion` with a `question` string and optional `options` array. The tool sends a `UserQuestionRequest` through an `mpsc::UnboundedSender` to the TUI, which displays a modal dialog. The user can navigate options with ↑↓, switch to free-text input with Tab, quick-select with number keys 1-9, submit with Enter, or cancel with Esc. Architecture mirrors the `PermissionPrompter` pattern (oneshot channel for the response). `has_modal()` helper on `App` returns `true` when either `pending_permission` or `pending_user_question` is active — used as a guard to suppress normal input handling during any modal dialog. The tool is injected into `ConversationState.tools` at TUI startup, not in `builtin_tools()`, because it needs the channel sender. Tested by `test_definition_name_is_user_question`, `test_call_sends_question_and_returns_answer`, `test_call_with_no_options`, `test_call_freetext_answer_with_options`, `test_call_fails_when_channel_dropped`, `test_call_with_utf8_question_and_answer`, `test_has_modal_true_with_user_question`, `test_user_question_nav_down_through_options`, `test_user_question_tab_switches_to_text`, `test_user_question_submit_option`, `test_user_question_text_input_utf8`, `test_event_loop_has_user_question_tool`, `test_event_loop_blocks_input_during_user_question`, `test_render_has_user_question_dialog`.

28. **`truncate_with_notice()` UTF-8 byte-slicing panic**: `String::truncate(max)` panics when byte `max` lands inside a multi-byte UTF-8 character. This is the same class of bug as Gotcha #16 (`&str[..N]` panics at non-char-boundary). The production crash was triggered by `WebFetch` fetching an Apple Developer page — `html2text` output contained typographic quotes, em-dashes, etc. `truncate(30000)` landed inside a multi-byte char → `assertion failed: self.is_char_boundary(new_len)`. **Fix**: Walk backwards from `max` with `is_char_boundary()` to find the last valid boundary before truncating. **Rule**: Never call `String::truncate(N)` or `&str[..N]` with a byte offset without first checking `is_char_boundary()`. Tested by `test_truncate_with_notice_utf8_boundary`, `test_truncate_with_notice_emoji_boundary`, `test_truncate_with_notice_exact_boundary`.

29. **Adaptive typewriter effect: measure SSE interval, distribute chars evenly**: SSE `TextDelta` events arrive every ~10-50ms and contain multiple characters (tokens). Simply dumping the whole token into the buffer at once looks "bursty" — text appears in clumps. **Fix**: An adaptive typewriter queue (`VecDeque<char>`) buffers incoming chars. On each new delta, the interval since the previous delta is measured, and `char_interval = sse_interval / new_char_count` is computed (clamped to [0.5ms, 50ms]). The event loop drains one char at a time from the queue into `streaming_buffer` at this adaptive rate. Poll timeout drops to ~2ms while the queue is non-empty. `TextComplete` flushes the remaining queue immediately, then pushes the final `DisplayBlock`. **Key**: The interval is recalculated on every delta — if the API speeds up or slows down, the typewriter effect adapts. The minimum clamp prevents invisible-fast rendering; the maximum prevents painful slowness on network stalls. Tested by `test_enqueue_delta_pushes_chars_to_queue`, `test_enqueue_delta_calculates_char_interval`, `test_drain_typewriter_respects_timing`, `test_drain_typewriter_utf8_char_by_char`, `test_flush_typewriter_empties_queue_to_buffer`, `test_interval_minimum_clamp`, `test_interval_maximum_clamp`, `test_interval_adapts_to_sse_cadence`, `test_finalize_text_complete_flushes_then_creates_block`, `test_event_loop_has_drain_typewriter`, `test_event_loop_poll_short_during_typewriter`.

30. **Markdown table columns overflow viewport**: `render_table()` computed column widths from cell content without any viewport width limit. Tables with long cell text produced `RenderedLine`s wider than the terminal. The generic `wrap()` then broke lines mid-border, destroying the visual table structure (misaligned `│` separators, torn `─` borders). **Fix**: `render_markdown_with_width(text, viewport_width)` passes the viewport width into `render_table()`. Column widths are shrunk proportionally to fit `viewport_width`. Long cell contents are word-wrapped (with char-level fallback for words wider than the column) into multi-line rows — every visual row gets its own `│`-bordered `RenderedLine`. **Fair minimum column width**: Pure proportional shrinking gives almost no space to narrow columns when another column has vastly more text (e.g. a 3-char "Key" column vs. a 120-char "Description"). `shrink_columns()` enforces a minimum of `available / (col_count + 1)` per column — for 2 columns each gets at least ~1/3 of the space. This prevents the first column from collapsing to 3 chars. The minimum only applies when shrinking is needed; naturally-fitting tables are unaffected. `rebuild_lines()` in `app.rs` calls `render_markdown_with_width(text, w)` instead of `render_markdown(text)` for `AssistantText` and streaming buffer, so tables always fit the terminal. The old `render_markdown(text)` delegates to `render_markdown_with_width(text, usize::MAX)` for backward compatibility. Tested by `test_md_table_wraps_long_cell_within_viewport`, `test_md_table_all_lines_same_width`, `test_md_table_wrapped_row_preserves_borders`, `test_md_table_narrow_viewport_still_renders`, `test_md_table_without_width_uses_natural_width`, `test_md_table_utf8_cell_wrap`, `test_md_table_visual_output`, `test_md_table_min_column_width_one_third`, `test_md_table_min_column_width_does_not_apply_when_natural_fits`.

31. **DuckDuckGo CAPTCHA blocks WebSearch**: DuckDuckGo's HTML endpoint (`html.duckduckgo.com/html/`) returns CAPTCHA pages ("Select all squares containing a duck") based on TLS fingerprinting and IP rate-limiting. The `reqwest` + `rustls` TLS fingerprint happened to pass DDG's bot detection, but `curl` (OpenSSL), Python (`urllib`), and other clients get blocked from the same IP. This is fragile — DDG could block rustls at any time. **Fix**: Switched to **Startpage** (Google proxy) as the primary search backend, with DuckDuckGo as fallback. Startpage serves Google results without CAPTCHAs. The parser strips inline `<style>` blocks (Emotion CSS-in-JS), then extracts results via `data-testid="gl-title-link"` markers with `<h2>` titles and `<p class="description">` snippets. CAPTCHA detection: `is_ddg_captcha()` checks for `"anomaly"` / challenge text; `is_startpage_blocked()` checks for absence of `gl-title-link`. `format_results()` now includes `[Source: Startpage]` or `[Source: DuckDuckGo]` in the output. If both backends fail, returns an `is_error: true` ToolOutput with a clear message. Tested by `test_parse_startpage_results_synthetic`, `test_parse_startpage_results_with_inline_styles`, `test_parse_startpage_results_with_bold_in_snippet`, `test_parse_startpage_results_with_html_entities`, `test_parse_startpage_results_respects_max`, `test_parse_startpage_results_utf8`, `test_parse_startpage_results_missing_snippet`, `test_is_startpage_blocked_*`, `test_is_ddg_captcha_*`, `test_startpage_parser_on_live_html`, `test_format_results_includes_source`.

32. **GTK emoji `is_emoji_char()` table incomplete — breaks ZWJ sequences and VS16 emoji**: The hand-curated `is_emoji_char()` table in `chlodwig-gtk/src/emoji.rs` only included `Emoji_Presentation=Yes` characters (emoji by default), but missed ~50 `Extended_Pictographic` characters that become emoji with VS16 (U+FE0F) or appear as components of ZWJ sequences. **Three concrete bugs**: (1) ☀ (U+2600), ⛈ (U+26C8), and ~48 other BMP chars were not detected as emoji → rendered as plain text via Pango instead of CoreText bitmap → invisible in PangoCairo (no color font support). (2) ♂ (U+2642) and ♀ (U+2640) were missing → ZWJ sequences like 🏊‍♂️ (swimmer + ZWJ + ♂ + VS16) got split at ♂: `Emoji("🏊\u200D")` + `Plain("♂\uFE0F")` → incomplete CoreText bitmap + orphan Pango glyph → wrong width (3 cols instead of 2) → table borders misaligned. (3) ⛈️ in weather table cells produced `Plain("⛈")` + `Emoji("\uFE0F")` → broken rendering. **Fix**: Expanded `is_emoji_char()` ranges to include all Unicode 16.0 Extended_Pictographic BMP characters: weather (U+2600..U+2604), gender signs (U+2640, U+2642), card suits (U+2660..U+2666), tools/objects (U+2692..U+269C), misc symbols (U+26A0, U+26A7, U+26B0..U+26B1, U+26C8, U+26CF, U+26D1, U+26D3, U+26E9, U+26F0..U+26F9). Existing ranges were consolidated (e.g. `U+26F2..U+26F3` + `U+26F5` → `U+26F0..U+26F5`). Tested by `test_is_emoji_char_sun`, `test_is_emoji_char_thunder_cloud`, `test_is_emoji_char_male_female_signs`, `test_is_emoji_char_misc_symbols_extended`, `test_is_emoji_char_symbols_and_religion`, `test_is_emoji_char_card_suits`, `test_is_emoji_char_misc_objects`, `test_is_emoji_char_misc_objects_2`, `test_split_zwj_swimmer_male_not_broken`, `test_split_zwj_cyclist_female_not_broken`, `test_split_multiple_zwj_emojis_in_table_cell`, `test_split_sun_with_vs16`, `test_split_thunder_cloud_with_vs16`, `test_split_weather_emojis_from_table`, `test_split_table_cell_sun_padded`.

33. **`ctx:` showed cumulative token sum instead of actual context window**: `format_status_left()` computed `ctx:` as `total_input_tokens + total_output_tokens` — the sum of ALL Usage events across ALL turns. This grows monotonically and has no relation to the actual context window size. The API reports `input_tokens`, `output_tokens`, and `cache_tokens` in each Usage event. The **last** Usage event's values ARE the current context window. **Fix**: Changed `ctx:` to use `TurnUsage::context_window_size()` (`input_tokens + output_tokens + cache_tokens`). Replaced the three separate `turn_input_tokens`/`turn_output_tokens`/`turn_cache_tokens` fields in `StatusLineData` with a single `turn_usage: &TurnUsage` reference. The context calculation now lives in one place: `TurnUsage::context_window_size()` in `chlodwig-core`. Both `App::context_window_size()` (TUI) and `AppState::context_window_size()` (GTK) delegate to it. The auto-compact threshold check in `event_loop.rs` also uses `app.context_window_size()`. The `total_*` fields remain in `StatusLineData` for the cumulative `tx:`/`rx:` display on the left status bar. Tested by `test_ctx_shows_last_turn_context_not_cumulative_total`, `test_ctx_cost_indicator_uses_turn_context`.

34. **GTK auto-scroll unified with TUI via `chlodwig_core::AutoScroll`**: The GTK version unconditionally scrolled to bottom on every new content event, making it impossible to read earlier output while streaming. The TUI had proper auto-scroll logic (disable when user scrolls up, re-enable at bottom) but it was duplicated inline. **Fix**: Extracted `AutoScroll` struct into `chlodwig-core/src/auto_scroll.rs` — a simple state machine with `is_active()`, `scroll_to_bottom()` (force on, for explicit user actions), `scroll_to_bottom_if_auto()` (no-op when user scrolled away, for incoming content), `user_scrolled_away()`, and `user_reached_bottom()`. Both TUI `App` and GTK `AppState` embed an `AutoScroll` field. TUI's `scroll_to_bottom()`/`scroll_to_bottom_if_auto()`/`scroll_up()`/`scroll_down()` delegate to it. GTK uses `vadjustment.connect_value_changed` to detect user scroll position: `at_bottom = (value + page_size) >= upper - 1.0`. The 1px tolerance handles floating-point rounding. The event loop calls `scroll_to_bottom_if_auto()` for incoming events and only performs the actual GTK scroll if `is_active()`. Explicit user actions (submit prompt) call `scroll_to_bottom()` to force re-enable. Tested by `test_auto_scroll_default_is_active`, `test_scroll_to_bottom_forces_active`, `test_scroll_to_bottom_if_auto_noop_when_inactive`, `test_scroll_to_bottom_if_auto_stays_active_when_active`, `test_user_scrolled_away_disables`, `test_user_reached_bottom_re_enables`, `test_round_trip_scroll_away_and_back`, `test_new_state_auto_scroll_is_active`, `test_clear_resets_auto_scroll_to_active`, `test_auto_scroll_user_scrolls_up_then_back`.

## Compact Instructions

When summarizing the conversation, focus on:
- Code changes with full file paths and snippets
- Bug fixes: what broke, root cause, how it was fixed
- Test names and what they cover
- Architectural decisions and trade-offs
- User preferences and explicit requests

## Commands

```bash
cargo test --workspace          # Run all tests (ALWAYS do this)
cargo build --release           # Release build
cargo run --release             # Run TUI
cargo run --release -- --resume # Resume last saved session
cargo run --release -- --print "prompt"  # Headless mode
```

### TUI Commands

| Command | Effect |
|---------|--------|
| `/help`, `/?` | Show available commands and keybindings |
| `/clear`, `/reset`, `/new` | Clear conversation, start fresh |
| `/compact [instructions]` | Compact conversation history |
| `/sessions` | List all saved sessions |
| `/resume` | Load the most recent saved session |
| `/resume <prefix>` | Load session matching prefix (e.g. `2026_04_13`, `2026_04_13_14`) |
| `! <cmd>` | Execute shell command |
| `exit`, `quit`, `/exit`, `/quit` | Exit |

### TUI Key Bindings

| Key | Effect |
|-----|--------|
| `Enter` | Submit input |
| `Ctrl+J` | Insert newline (works in ALL terminals) |
| `Shift+Enter` or `Alt+Enter` | Insert newline (Kitty protocol terminals only) |
| `Alt+b` / `Alt+f` | Move cursor word left / right |
| `Alt+d` | Delete word forward |
| `Up` / `Down` | Move cursor vertically in multiline input (falls through to history/tab bar on first/last line) |
| `Ctrl+K` | Delete word backward (right-hand home row) |
| `Ctrl+L` | Delete word forward (right-hand home row) |
| `Ctrl+c` | Quit |

### UserQuestion Dialog Keys

| Key | Effect |
|-----|--------|
| `↑` / `↓` | Navigate options |
| `Tab` | Toggle between options and free-text input |
| `1`-`9` | Quick-select option by number |
| `Enter` | Submit selected option or typed text |
| `Esc` | Cancel (sends empty string) |

## Session Persistence

Sessions are automatically saved to `~/.chlodwig-rs/session.json` after:
- Every completed conversation turn (`TurnComplete`)
- Every completed compaction (`CompactionComplete`)
- Every `/clear` (saves empty session)

The save is **asynchronous** (via `tokio::spawn` + `spawn_blocking`) so it never blocks the event loop. Writes use atomic rename (write to `.tmp`, then rename) to prevent corruption on crash.

**Resume**: Use `--resume` CLI flag or `/resume` TUI command. When resuming, only messages are restored — model, tools, and system prompt use the current CLI settings (they may have changed between sessions). Use `/resume <prefix>` to load a specific session by timestamp prefix (e.g. `/resume 2026_04_13`). Use `/sessions` to list all available sessions.

**Implementation**: `chlodwig-core/src/session.rs` — `SessionSnapshot`, `save_session()`, `load_session()`, `session_path()`.

## Self-Improvement Protocol

After every session, if bugs were found or patterns emerged:
1. Add the finding to "Known Gotchas" above
2. Ensure a regression test exists
3. Update any affected architectural notes

## Documentation

- **Keep `README.md` up to date.** When adding features, changing the project structure, modifying the pipeline, or altering the tech stack, update the root `README.md` accordingly. It is the primary entry point for anyone looking at this project.

## Tool Limitations

- **WebSearch & WebFetch available** — WebSearch uses Startpage (Google proxy) as primary backend with DuckDuckGo HTML as fallback. No API key needed. WebFetch retrieves any URL with automatic HTML-to-text conversion.
