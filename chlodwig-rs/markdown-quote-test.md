> ## Known Gotchas (Learned from Bugs)
> 
> These were discovered during development. **Never regress on these:**
> 
> 1. **UTF-8 input handling**: `String::insert()`/`remove()` take byte indices, not char indices. Always convert via `cursor_byte_pos()`. Tested by `test_insert_umlaut_then_ascii`, `test_insert_emoji_then_ascii`, etc.
> 
> 2. **Interleaved SSE blocks**: GitHub API sends multiple `ContentBlockStart` events before any `ContentBlockStop`. Must use per-index `HashMap<u32, BlockAcc>`, not a single accumulator. Tested by `test_interleaved_tool_blocks`.
> 
> 3. **`[DONE]` SSE terminator**: GitHub API sends `data: [DONE]` as stream terminator. Must filter before JSON parse. Handled in `chlodwig-api` SSE parser.
> 
> 4. **Mouse move events**: `EnableMouseCapture` sends `MouseEventKind::Moved` on every mouse movement. These MUST NOT trigger redraw, or CPU goes to 100%.
> 
> 5. **Scroll anchoring**: When leaving auto-scroll, anchor `scroll` at the current bottom position first, not at 0. Otherwise scroll jumps to top.
> 
> 6. **Empty tool names**: Filter `tool_uses.retain(|t| !t.name.is_empty())` before executing tools. Interleaved blocks can produce empty-name entries.
> 
> 7. **Tracing crate names**: Rust crate names use underscores (`chlodwig_core`), not hyphens (`chlodwig-core`). Filter expressions must match.
> 
> 8. **Trackpad event flooding**: Trackpad scroll gestures generate hundreds of `MouseEventKind::Moved`/`Drag` events per gesture. If you read only ONE event per `poll()` call, the event queue never drains, `poll()` returns immediately → busy-loop at 100% CPU. **Fix**: inner drain loop that reads ALL pending events before continuing: `loop { read(); if !poll(0ms) { break; } }`. Only `ScrollUp`/`ScrollDown`/`Key`/`Resize` set `needs_redraw`; all other mouse events are silently discarded.
> 
> 9. **Ghost artifacts when scrolling**: ratatui's diff-based rendering compares the current buffer against the previous frame and only sends changed cells to the terminal. Padding lines with spaces (`Span::raw`) seemed correct in unit tests (TestBackend) but failed on real terminals — `Style::default()` has `fg: None/bg: None` which doesn't reset existing cell styles, and crossterm may skip cells it considers unchanged. **Fix**: Call `terminal.clear()` before every `terminal.draw()`. This resets the back-buffer so `flush()` sends ALL cells to the terminal (full redraw). Performance impact is negligible since we only draw on `needs_redraw`. The space-padding is kept as defense-in-depth but `clear()` is the real fix.
> 
> 10. **`continue` inside inner drain loop blocks**: The inner event drain loop (`loop { read(); if !poll(0ms) { break; } }`) must never use `continue` — it skips the `poll(0ms)` break-check and `read()` blocks indefinitely waiting for the next event. Always use `break` to exit the inner loop.
> 
> 11. **`chars().count()` ≠ terminal display width**: Never use `chars().count()` for terminal column calculations. CJK characters, emojis, etc. occupy 2 terminal columns but are 1 char. Use `unicode_width::UnicodeWidthStr::width()` or ratatui's `Line::width()`. The `RenderedLine::display_width()` method and `wrap()` both use unicode-width. Tested by `test_display_width_uses_unicode_width`, `test_wrap_respects_unicode_display_width`.
