# Claude RS — Development Guide

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
| claude-core | `conversation.rs` mod tests | Conversation loop, compaction, SSE events |
| claude-core | `messages.rs` mod tests | Serde round-trips |
| claude-api | `client.rs` mod tests | SSE parser |
| claude-tools | Each tool file mod tests | Tool behavior, edge cases, network (WebFetch/WebSearch) |
| claude-tui | `lib.rs` mod tests | Scroll logic, input handling, UTF-8 |

## Architecture

Cargo workspace with 5 crates:

```
claude-cli → claude-core
           → claude-api  → claude-core
           → claude-tools → claude-core
           → claude-tui   → claude-core
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

3. **`[DONE]` SSE terminator**: GitHub API sends `data: [DONE]` as stream terminator. Must filter before JSON parse. Handled in `claude-api` SSE parser.

4. **Mouse move events**: `EnableMouseCapture` sends `MouseEventKind::Moved` on every mouse movement. These MUST NOT trigger redraw, or CPU goes to 100%.

5. **Scroll anchoring**: When leaving auto-scroll, anchor `scroll` at the current bottom position first, not at 0. Otherwise scroll jumps to top.

6. **Empty tool names**: Filter `tool_uses.retain(|t| !t.name.is_empty())` before executing tools. Interleaved blocks can produce empty-name entries.

7. **Tracing crate names**: Rust crate names use underscores (`claude_core`), not hyphens (`claude-core`). Filter expressions must match.

8. **Trackpad event flooding**: Trackpad scroll gestures generate hundreds of `MouseEventKind::Moved`/`Drag` events per gesture. If you read only ONE event per `poll()` call, the event queue never drains, `poll()` returns immediately → busy-loop at 100% CPU. **Fix**: inner drain loop that reads ALL pending events before continuing: `loop { read(); if !poll(0ms) { break; } }`. Only `ScrollUp`/`ScrollDown`/`Key`/`Resize` set `needs_redraw`; all other mouse events are silently discarded.

9. **Ghost artifacts when scrolling**: ratatui's diff-based rendering compares the current buffer against the previous frame and only sends changed cells to the terminal. **Fix**: `render_output()` pads every line with spaces to fill the full viewport width (so every cell is overwritten), and vertically pads with empty lines to fill the view height. This ensures every cell gets a value on each frame, so ratatui's diff correctly updates the entire screen. **Do NOT call `terminal.swap_buffers()` before `terminal.draw()`** — `draw()` already calls `swap_buffers()` internally (ratatui 0.29). Calling it twice corrupts the double-buffer state and produces garbled output (the "previous" buffer that ratatui diffs against becomes a stale/reset buffer).

10. **`continue` inside inner drain loop blocks**: The inner event drain loop (`loop { read(); if !poll(0ms) { break; } }`) must never use `continue` — it skips the `poll(0ms)` break-check and `read()` blocks indefinitely waiting for the next event. Always use `break` to exit the inner loop.

11. **`chars().count()` ≠ terminal display width**: Never use `chars().count()` for terminal column calculations. CJK characters, emojis, etc. occupy 2 terminal columns but are 1 char. Use `unicode_width::UnicodeWidthStr::width()` or ratatui's `Line::width()`. The `RenderedLine::display_width()` method and `wrap()` both use unicode-width. Tested by `test_display_width_uses_unicode_width`, `test_wrap_respects_unicode_display_width`.

12. **Bash commands need PTY for color output**: `std::process::Command::output()` captures stdout/stderr via pipes. Programs detect `isatty(stdout) == false` and disable ANSI colors. **Fix**: Wrap execution in `script -q /dev/null bash -c '...'` (macOS) or `script -qc '...' /dev/null` (Linux) to allocate a pseudo-terminal. Side effect: stderr is merged into stdout through the PTY, so separate stderr capture is lost. The ANSI codes are parsed by ratatui's `into_text()` in the `BashOutput` display block renderer. Tested by `test_pty_provides_isatty`.

13. **crossterm Key Release events cause double-fire**: crossterm 0.26+ sends `KeyEventKind::Press`, `KeyEventKind::Release`, and `KeyEventKind::Repeat` events. If the event loop handles ALL key events without filtering, every keystroke fires twice (press + release). **Fix**: Match only `Event::Key(key) if key.kind == KeyEventKind::Press`. Without this filter, Backspace deletes 2 chars per press, Char input inserts 2 chars, etc. Tested by `test_backspace_deletes_exactly_one_char`.

14. **Incoming content must not override manual scroll**: When the user has scrolled up (`auto_scroll=false`), streaming `TextDelta`, `ToolUseStart`, `ToolResult`, `CompactionStarted`, `CompactionComplete` events must NOT call `scroll_to_bottom()` — that forces the viewport back to the bottom, yanking the user away from what they're reading. **Fix**: Use `scroll_to_bottom_if_auto()` for all incoming-content events; it's a no-op when the user has manually scrolled. Use `scroll_to_bottom()` only for explicit user actions (submit prompt, `/compact` command, `!` shell). Tested by `test_new_content_does_not_override_manual_scroll`, `test_new_content_follows_when_auto_scroll_active`.

15. **Crash diagnostics: static 10 MiB buffer + signal handlers**: The Rust panic hook only catches `panic!()` calls. Real crashes (SIGSEGV, SIGBUS, SIGABRT, SIGFPE) bypass it entirely. **Fix**: A 10 MiB static buffer (`CRASH_BUF`) is pre-allocated in BSS at startup. Signal handlers for fatal signals restore the terminal, write crash info (backtrace + App state) into the static buffer (no heap allocation needed), flush to `crash_*.log`, dump to stderr, then re-raise with default handler. **Do NOT handle SIGINT** — crossterm captures Ctrl+C as a KeyEvent for graceful shutdown; intercepting SIGINT breaks terminal restore. The `CRASH_STATE` mutex holds the latest `App::crash_dump()` snapshot, updated every redraw (~10Hz). A `TerminalGuard` (Drop) ensures `disable_raw_mode()`+`LeaveAlternateScreen` run even when `?` operators bail out of the event loop. Tests that touch the static buffer are serialized via `SERIAL_LOCK` to avoid race conditions. Tested by `test_static_crash_buffer_write_and_read`, `test_static_crash_buffer_contains_backtrace`, `test_static_buf_size_is_10mb`.

16. **ToolResult preview byte-slicing panic**: `&t[..500]` panics when byte 500 lands inside a multi-byte UTF-8 character (e.g. `├` is 3 bytes E2 94 9C). **This was the production crash bug** — `cargo tree` output contains box-drawing characters. **Fix**: Walk backwards from byte 500 with `is_char_boundary()` to find the last valid boundary. Same pattern for `crash_dump()` streaming_buffer tail. **Never use `&str[..N]` with a hardcoded byte offset.** Always use `is_char_boundary()`, `char_indices()`, or `.chars().take(N)`. Tested by `test_tool_result_preview_truncation_at_utf8_boundary`, `test_tool_result_preview_emoji_boundary`.

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
cargo run --release -- --print "prompt"  # Headless mode
```

## Self-Improvement Protocol

After every session, if bugs were found or patterns emerged:
1. Add the finding to "Known Gotchas" above
2. Ensure a regression test exists
3. Update any affected architectural notes

## Documentation

- **Keep `README.md` up to date.** When adding features, changing the project structure, modifying the pipeline, or altering the tech stack, update the root `README.md` accordingly. It is the primary entry point for anyone looking at this project.

## Tool Limitations

- **WebSearch & WebFetch available** — WebSearch uses DuckDuckGo HTML (no API key needed). WebFetch retrieves any URL with automatic HTML-to-text conversion.
