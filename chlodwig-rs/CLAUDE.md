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
| `/clear`, `/reset`, `/new` | Clear conversation, start fresh |
| `/compact [instructions]` | Compact conversation history |
| `/resume` | Load the last saved session from disk |
| `! <cmd>` | Execute shell command |
| `exit`, `quit`, `/exit`, `/quit` | Exit |

## Session Persistence

Sessions are automatically saved to `~/.chlodwig-rs/session.json` after:
- Every completed conversation turn (`TurnComplete`)
- Every completed compaction (`CompactionComplete`)
- Every `/clear` (saves empty session)

The save is **asynchronous** (via `tokio::spawn` + `spawn_blocking`) so it never blocks the event loop. Writes use atomic rename (write to `.tmp`, then rename) to prevent corruption on crash.

**Resume**: Use `--resume` CLI flag or `/resume` TUI command. When resuming, only messages are restored — model, tools, and system prompt use the current CLI settings (they may have changed between sessions).

**Implementation**: `chlodwig-core/src/session.rs` — `SessionSnapshot`, `save_session()`, `load_session()`, `session_path()`.

## Self-Improvement Protocol

After every session, if bugs were found or patterns emerged:
1. Add the finding to "Known Gotchas" above
2. Ensure a regression test exists
3. Update any affected architectural notes

## Documentation

- **Keep `README.md` up to date.** When adding features, changing the project structure, modifying the pipeline, or altering the tech stack, update the root `README.md` accordingly. It is the primary entry point for anyone looking at this project.

## Tool Limitations

- **WebSearch & WebFetch available** — WebSearch uses DuckDuckGo HTML (no API key needed). WebFetch retrieves any URL with automatic HTML-to-text conversion.
