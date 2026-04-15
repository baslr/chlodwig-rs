# Chlodwig GTK4 Port — Roadmap

> Status: **Functional prototype — basic conversation loop works.**
> The GTK crate compiles, ~50 unit tests pass, and the binary runs on macOS
> with MacPorts GTK4/libadwaita. Markdown streaming, emoji rendering (CoreText),
> copy/paste, and standard macOS keybindings are working.

---

## Current State

### What exists (`crates/chlodwig-gtk`)

| File | Lines | Content |
|------|------:|---------|
| `app_state.rs` | 414 | GTK-independent `AppState` + `DisplayBlock` enum, `handle_event()`, input editing helpers (`delete_to_line_start`, `line_start_pos`, `line_end_pos`, `word_left_pos`, `word_right_pos`, `delete_word_back`) |
| `window.rs` | 753 | Window layout, TextTags, `append_styled()`, `scroll_to_bottom()`, emoji overlay rendering, context menu, DND disable |
| `main.rs` | 780 | Entry point, Tokio↔GTK bridge, `render_event_to_buffer()`, `build_system_prompt()`, keyboard shortcuts (Cmd+V/C/X/A, Cmd+Enter, Cmd+Backspace, Cmd+←/→/↑/↓, Option+←/→/⌫) |
| `md_renderer.rs` | 355 | Markdown → GtkTextBuffer renderer (headings, bold, italic, code blocks, lists, tables) |
| `emoji.rs` | 1243 | Emoji detection, CoreText bitmap rendering, ZWJ sequence handling |
| `emoji_overlay.rs` | 417 | EmojiTextView subclass with overlay-based emoji rendering |
| `lib.rs` | 204 | GSK/Pango backend selection, bundled emoji font, CSS |
| `tests/app_state_tests.rs` | 763 | ~50 unit tests for AppState + input editing helpers |
| `tests/emoji_tests.rs` | 198 | Emoji detection and segmentation tests |
| `tests/copy_tests.rs` | 42 | Clipboard logic tests |
| `tests/line_number_tests.rs` | 90 | Line number formatting tests |
| `tests/streaming_tests.rs` | 74 | Streaming buffer tests |

### What the TUI has (feature comparison)

| Feature | TUI | GTK | Gap |
|---------|:---:|:---:|-----|
| Basic conversation loop | ✅ | ✅ | — |
| Streaming text (TextDelta → buffer) | ✅ | ✅ | — |
| Streaming Markdown re-rendering | ✅ | ✅ | Per-tick Markdown re-render with `rerender_streaming_markdown()` |
| Tool call display | ✅ | ✅ | GTK shows tool name + JSON preview, Edit shows red/green diff |
| Tool result display | ✅ | ✅ | Specialized rendering for Bash, Read, Write, Grep + generic fallback |
| Markdown rendering | ✅ pulldown-cmark + syntect | ✅ | `md_renderer.rs` — headings, bold, italic, code, lists, tables |
| Syntax highlighting (code blocks) | ✅ syntect → ratatui styles | ⚠️ | Shared `highlight.rs` in core; not yet wired into Markdown fenced code blocks |
| Syntax highlighting (Read output) | ✅ per-file extension | ✅ | Via `chlodwig_core::highlight::lang_from_path` + `render_highlighted_line` |
| Syntax highlighting (Write output) | ✅ per-file extension | ✅ | Via `chlodwig_core::highlight::lang_from_path` + `render_highlighted_line` |
| Syntax highlighting (Grep output) | ✅ content mode | ❌ | — |
| Edit diff display (red/green) | ✅ side-by-side diff | ✅ | Diff lines syntax-highlighted per file extension |
| Bash output (ANSI colors) | ✅ `ansi_to_tui` | ✅ | `ansi.rs` parser + dynamic GtkTextTags; PAGER=cat prevents pager tofu |
| Timestamps | ✅ per-message | ❌ | — |
| Adaptive typewriter effect | ✅ char-by-char queue | ❌ | Could skip — GTK TextBuffer updates are smooth enough |
| Permission dialog | ✅ modal overlay | ❌ | Need `GtkMessageDialog` or `AdwAlertDialog` |
| UserQuestion dialog | ✅ modal with options + free-text | ❌ | Need `AdwAlertDialog` or custom dialog |
| `/clear`, `/reset`, `/new` | ✅ | ❌ | — |
| `/compact` | ✅ | ❌ | — |
| `/help` | ✅ | ❌ | — |
| `/sessions`, `/resume` | ✅ | ❌ | — |
| `/save` | ✅ | ❌ | — |
| `!` shell command | ✅ PTY-wrapped | ❌ | — |
| Session persistence (auto-save) | ✅ atomic rename | ❌ | — |
| Session resume (`--resume`) | ✅ CLI flag + TUI command | ❌ | — |
| `--print` headless mode | ✅ | n/a | Not applicable for GUI |
| Tab bar (Prompt/Sys-Prompt/Requests/Constants/Git) | ✅ 5 tabs | ❌ | — |
| System prompt viewer | ✅ | ❌ | — |
| Requests log (SSE debug) | ✅ lazy rebuild | ❌ | — |
| Constants editor | ✅ inline editing + persistence | ❌ | — |
| Git tab (branch + status) | ✅ | ❌ | — |
| Prompt history (Up/Down) | ✅ | ❌ | — |
| Scroll anchoring (manual scroll) | ✅ Gotcha #5, #14 | ⚠️ | GTK ScrolledWindow handles this natively, but manual scroll suppression logic needed |
| Auto-scroll on new content | ✅ | ✅ | `scroll_to_bottom()` via `glib::idle_add_local_once` after content updates |
| Scrollbar | ✅ ratatui scrollbar | ✅ | Native GTK |
| Input soft-wrapping | ✅ word-wrap matching ratatui | ✅ | `WrapMode::Word` built-in |
| Multiline input (Ctrl+J / Shift+Enter) | ✅ | ✅ | Enter inserts newline (GTK default), Cmd+Enter submits |
| Word-jump (Option+←/→) | ✅ | ✅ | Custom `word_left_pos`/`word_right_pos` in EventControllerKey |
| Word-delete (Option+⌫) | ✅ | ✅ | Custom `delete_word_back` in EventControllerKey |
| Line-jump (Cmd+←/→) | ✅ | ✅ | Custom `line_start_pos`/`line_end_pos` in EventControllerKey |
| Document-jump (Cmd+↑/↓) | N/A | ✅ | Cmd+Up → start, Cmd+Down → end |
| Line-delete (Cmd+⌫) | ✅ | ✅ | Custom `delete_to_line_start` in EventControllerKey |
| Clipboard (Cmd+V/C/X/A) | N/A | ✅ | Explicit handling for macOS META_MASK |
| Cursor movement (Up/Down in multiline) | ✅ complex word-wrap | ✅ | GTK TextViews handle this natively |
| Bracketed paste | ✅ | ✅ | GTK handles paste natively |
| Copy feedback ("✓ Copied!") | ✅ | ✅ | Status bar shows feedback for 2s |
| UTF-8 safety (Gotcha #1, #16, #28) | ✅ | ✅ | GTK uses UTF-8 natively — no byte-slicing needed |
| Emoji rendering | ✅ terminal emoji | ✅ | CoreText bitmap rendering with overlay (EmojiTextView), ZWJ support |
| Crash diagnostics (static buffer + signals) | ✅ 10 MiB static buf | ❌ | Different approach needed for GUI |
| System notifications on turn complete | ✅ osascript/D-Bus | ❌ | — |
| Status bar (model, tokens, context, cost) | ✅ detailed | ✅ | Left/right status labels with model, turns, tokens, build info |
| Spinner animation | ✅ braille chars | ✅ | Braille spinner (same as TUI), time-based rotation |
| Context timer / session timer | ✅ title bar | ❌ | — |
| Build info (build ID, timestamp) | ✅ build.rs | ✅ | `build.rs` generates BUILD_TIME + BUILD_ID |

---

## Phase 0: Prerequisites

- [x] **P0.1** — Install GTK4 + libadwaita: `port install gtk4 libadwaita`
- [x] **P0.2** — First launch: `cargo run -p chlodwig-gtk` — window opens, conversation works
- [x] **P0.3** — Fix `main.rs:264` bug: `ToolResultContent::ImageBase64` → `ToolResultContent::Blocks`

---

## Phase 1: Core Functionality (must-have for usable app)

### 1.1 Fix ToolResultContent bug
- [x] **1.1.1** — Replace `ImageBase64` match arm in `render_event_to_buffer()` with `Blocks(Vec<ToolResultBlock>)` handling (matching `app_state.rs`)
- [x] **1.1.2** — Test: send a ToolResult with `Blocks` content, verify no crash

### 1.2 Permission Dialog
The TUI has a modal overlay (y/n/a). The GTK version currently uses `AutoApprovePrompter` — all tools run without asking.

- [ ] **1.2.1** — Create `GtkPermissionPrompter` implementing `PermissionPrompter` trait
- [ ] **1.2.2** — Use `AdwAlertDialog` (or `GtkMessageDialog`) with buttons: Allow / Deny / Always Allow
- [ ] **1.2.3** — Bridge async: `PermissionPrompter::request_permission()` sends via channel → GTK main loop shows dialog → oneshot response back
- [ ] **1.2.4** — Wire into `main.rs` replacing `AutoApprovePrompter`
- [ ] **1.2.5** — Add CLI flag `--skip-permissions` for backward compat

### 1.3 UserQuestion Dialog
The LLM can call the `UserQuestion` tool to ask the user a question with optional choices.

- [ ] **1.3.1** — Create `GtkUserQuestionDialog` using `AdwAlertDialog` + `GtkListBox` for options + `GtkEntry` for free-text
- [ ] **1.3.2** — Bridge via `mpsc::UnboundedSender<UserQuestionRequest>` (same pattern as TUI)
- [ ] **1.3.3** — Inject `UserQuestionTool` with the channel sender into `ConversationState.tools`
- [ ] **1.3.4** — Test: model calls `UserQuestion` → dialog appears → user responds → tool returns

### 1.4 Session Persistence
- [ ] **1.4.1** — Auto-save on `TurnComplete` and `CompactionComplete` (via `chlodwig_core::save_session()`)
- [ ] **1.4.2** — Generate `session_started_at` timestamp at startup
- [ ] **1.4.3** — `--resume` CLI flag for `chlodwig-gtk` binary
- [ ] **1.4.4** — Restore messages into display on resume (convert `Message` → `DisplayBlock`)
- [ ] **1.4.5** — `/resume` command (typed in input, or menu action)

### 1.5 Commands
- [ ] **1.5.1** — Command parser: detect `/clear`, `/compact`, `/help`, `/sessions`, `/resume`, `/save`, `! <cmd>`, `exit`/`quit` before sending to API
- [ ] **1.5.2** — `/clear` — clear conversation + `ConversationState.messages`
- [ ] **1.5.3** — `/compact [instructions]` — call `chlodwig_core::compact_conversation()`, display progress
- [ ] **1.5.4** — `/help` — show commands + keybindings (in output area or dialog)
- [ ] **1.5.5** — `/sessions` — list sessions in output area
- [ ] **1.5.6** — `/resume`, `/resume <prefix>` — load session
- [ ] **1.5.7** — `/save` — manual save
- [ ] **1.5.8** — `! <cmd>` — execute shell command, display output (ANSI → plain text for now)
- [ ] **1.5.9** — `exit` / `quit` / `/exit` / `/quit` — close window

### 1.6 Error Handling & Robustness
- [ ] **1.6.1** — Display spawned-task panics in the UI (don't silently hang — Gotcha #19)
- [ ] **1.6.2** — Monitor `JoinHandle` like TUI does (`is_finished()` + panic extraction)
- [ ] **1.6.3** — Show connection errors gracefully (API key missing, network failure)
- [ ] **1.6.4** — `TurnComplete` always sent after task finishes (even after error)

---

## Phase 2: Rich Text Rendering

### 2.1 Markdown → GtkTextBuffer
The TUI uses `pulldown-cmark` → `RenderedLine` → ratatui spans. The GTK version converts Markdown to styled `GtkTextTag` regions via `md_renderer.rs`.

- [x] **2.1.1** — **Option A**: Use `pulldown-cmark` → walk events → apply `GtkTextTag`s (bold, italic, headings, lists, code spans)
- [ ] **2.1.2** — **Option B**: Use `GtkSourceView` (syntax-aware widget) — better for code but more complex integration
- [x] **2.1.3** — Create text tags: `heading1` (large bold), `heading2` (bold), `bold`, `italic`, `code-inline` (mono bg), `code-block` (mono bg), `link` (blue underline), `list-bullet`
- [ ] **2.1.4** — Handle fenced code blocks with language annotation (syntax highlighting — see 2.2)
- [x] **2.1.5** — Handle markdown tables (render as monospace with alignment)
- [x] **2.1.6** — Test: send AssistantText with markdown, verify styled output

### 2.2 Syntax Highlighting
- [x] **2.2.1** — **Option A**: `syntect` via shared `chlodwig_core::highlight` module (same highlighter as TUI)
- [ ] **2.2.2** — **Option B**: `GtkSourceView` with `GtkSourceBuffer` — built-in language support
- [ ] **2.2.3** — Apply to fenced code blocks in assistant responses (Markdown renderer)
- [x] **2.2.4** — Apply to Read/Write tool output (per file extension)
- [ ] **2.2.5** — Apply to Grep content-mode output

### 2.3 Edit Diff Display
- [x] **2.3.1** — Render Edit tool calls as red/green diff (`-`/`+` lines with `diff_remove`/`diff_add` tags)
- [x] **2.3.2** — Use `GtkTextTag` for red/green coloring
- [ ] **2.3.3** — Include context lines and line numbers

### 2.4 Bash Output (ANSI Colors)
- [x] **2.4.1** — Parse ANSI escape sequences in shell output (`ansi.rs` — SGR parser)
- [x] **2.4.2** — Convert ANSI colors to GtkTextTags (dynamic tag creation per color/bold combo)
- [ ] **2.4.3** — **Option B**: Use VTE widget (embedded terminal emulator — full ANSI support but heavier)
- [x] **2.4.4** — PTY wrapping for `! <cmd>` (same `script -q /dev/null` trick as TUI — handled by `chlodwig-tools/bash.rs`)

### 2.5 Timestamps
- [ ] **2.5.1** — Add timestamp above each user message and assistant response
- [ ] **2.5.2** — Style with dim/gray tag

---

## Phase 3: UI Polish

### 3.1 Status Bar Enhancements
- [x] **3.1.1** — Add turn count, context size, cost indicator bar (`░▓`)
- [ ] **3.1.2** — Add context timer + session timer
- [x] **3.1.3** — Use braille spinner during streaming (same as TUI, time-based rotation)
- [x] **3.1.4** — Build info (build ID + timestamp via `build.rs`)

### 3.2 Scroll Behavior
- [x] **3.2.1** — Auto-scroll to bottom on new content (via `glib::idle_add_local_once`)
- [ ] **3.2.2** — Detect manual scroll: monitor `vadjustment.value` vs `upper - page_size`
- [ ] **3.2.3** — "Scroll to bottom" button (floating, shown when scrolled up)

### 3.3 Tabs / Sidebar
The TUI has 5 tabs. GTK can use different patterns:

- [ ] **3.3.1** — **Option A**: `AdwViewStack` + `AdwViewSwitcherBar` (Adwaita standard tab pattern)
- [ ] **3.3.2** — **Option B**: `GtkNotebook` (classic tabs)
- [ ] **3.3.3** — Tab: Prompt (main chat) — already exists
- [ ] **3.3.4** — Tab: System Prompt viewer
- [ ] **3.3.5** — Tab: Requests log (JSON prettified, SSE chunks)
- [ ] **3.3.6** — Tab: Constants editor (`GtkListBox` with inline editing)
- [ ] **3.3.7** — Tab: Git (branch + `git status` output)

### 3.4 Input Area
- [x] **3.4.1** — Dynamic height growth (up to ~5 lines, then scroll) — `ScrolledWindow` with `max_content_height(120)`
- [ ] **3.4.2** — Prompt history (Up/Down arrows)
- [ ] **3.4.3** — Character + byte count in a subtle label
- [ ] **3.4.4** — Keyboard shortcut hints in placeholder text

### 3.5 Keyboard Shortcuts
Most TUI keybindings are unnecessary in GTK (native text editing). Implemented so far:

- [x] **3.5.0** — `Cmd+Enter` — submit prompt (Ctrl+Enter on Linux)
- [x] **3.5.0b** — `Cmd+V/C/X/A` — paste/copy/cut/select-all (explicit META_MASK handling for macOS)
- [x] **3.5.0c** — `Cmd+Backspace` — delete from cursor to line start
- [x] **3.5.0d** — `Cmd+←/→` — move cursor to line start/end
- [x] **3.5.0e** — `Cmd+↑/↓` — move cursor to document start/end
- [x] **3.5.0f** — `Option+←/→` — move cursor word left/right
- [x] **3.5.0g** — `Option+Backspace` — delete word before cursor
- [ ] **3.5.1** — `Cmd+K` / `Ctrl+L` — clear conversation
- [ ] **3.5.2** — `Cmd+Q` — quit
- [ ] **3.5.3** — `Cmd+,` — open preferences/constants
- [ ] **3.5.4** — `Cmd+S` — manual save
- [ ] **3.5.5** — `Escape` — cancel streaming (stop current turn)
- [ ] **3.5.6** — Register shortcuts via `GtkShortcutController` or `app.set_accels_for_action()`

### 3.6 System Notifications
- [ ] **3.6.1** — Send notification on turn complete when window is not focused
- [ ] **3.6.2** — Use `GNotification` (GLib native) instead of osascript
- [ ] **3.6.3** — Check `gtk4::Window::is_active()` for focus detection (replaces NSWorkspace FFI)

### 3.7 Theming
- [ ] **3.7.1** — Follow system dark/light mode (Adwaita handles automatically)
- [ ] **3.7.2** — Adjust text tag colors for both themes
- [ ] **3.7.3** — Custom CSS for fine-tuning (`GtkCssProvider`)

---

## Phase 4: macOS App Bundle

### 4.1 `.app` Bundle
- [ ] **4.1.1** — Create `Info.plist` with `CFBundleIdentifier = rs.chlodwig.gtk`
- [ ] **4.1.2** — App icon (`.icns` file)
- [ ] **4.1.3** — Build script or Makefile: compile release binary → copy into `.app/Contents/MacOS/`
- [ ] **4.1.4** — Bundle GTK4/libadwaita dylibs inside the `.app` (or require Homebrew at runtime)
- [ ] **4.1.5** — **Option A**: `gtk-mac-bundler` for automatic dylib bundling
- [ ] **4.1.6** — **Option B**: Ship as Homebrew formula / cask (depends on system GTK4)
- [ ] **4.1.7** — DMG or zip distribution

### 4.2 macOS Integration
- [ ] **4.2.1** — Native menu bar (File, Edit, View, Help) via `GtkApplication` menu model
- [ ] **4.2.2** — Dock icon + badge (unread count while background)
- [ ] **4.2.3** — `Cmd+H` hide, `Cmd+M` minimize (GTK4 on macOS handles some of these)
- [ ] **4.2.4** — Retina/HiDPI support (GTK4 handles automatically)
- [ ] **4.2.5** — Drag-and-drop files onto window (attach as context)

---

## Phase 5: Advanced Features

### 5.1 Image Display
- [ ] **5.1.1** — Display images from `ToolResultBlock::Image` in the output (using `GtkPicture`)
- [ ] **5.1.2** — Clickable images (open in native viewer)

### 5.2 Clickable Links
- [ ] **5.2.1** — Detect URLs in assistant text
- [ ] **5.2.2** — Make them clickable (open in default browser)
- [ ] **5.2.3** — File paths: click to open in editor

### 5.3 Search
- [ ] **5.3.1** — `Cmd+F` search within conversation history
- [ ] **5.3.2** — Highlight matching text, scroll to results

### 5.4 Copy/Export
- [x] **5.4.1** — Right-click context menu: Copy (on output view with selection)
- [x] **5.4.1b** — Copy feedback: "✓ Copied!" shown in status bar for 2 seconds
- [ ] **5.4.2** — Export conversation as Markdown file
- [ ] **5.4.3** — Copy code blocks with one click (code block header button)

### 5.5 Multiple Conversations
- [ ] **5.5.1** — Sidebar with conversation list
- [ ] **5.5.2** — New conversation button
- [ ] **5.5.3** — Switch between conversations without losing state

### 5.6 Settings UI
- [ ] **5.6.1** — `AdwPreferencesWindow` for settings
- [ ] **5.6.2** — API key configuration (with secure storage via libsecret / macOS Keychain)
- [ ] **5.6.3** — Model selection dropdown
- [ ] **5.6.4** — Base URL configuration
- [ ] **5.6.5** — Font size / font family picker
- [ ] **5.6.6** — Constants editor (migrated from tab to preferences)

---

## TUI Gotchas That Don't Apply to GTK4

These 14 TUI gotchas from `CLAUDE.md` are **eliminated** by using GTK4:

| # | Gotcha | Why it doesn't apply |
|---|--------|---------------------|
| 1 | UTF-8 byte/char confusion | GTK uses UTF-8 strings natively — no manual byte indexing |
| 4 | Mouse move events → 100% CPU | GTK event loop handles this internally |
| 5 | Scroll anchoring | `GtkScrolledWindow` manages scroll state |
| 8 | Trackpad event flooding | GTK throttles events natively |
| 9 | Ghost artifacts when scrolling | No double-buffering issues — GTK renders via GPU |
| 10 | `continue` in drain loop | No drain loop — GTK has its own event loop |
| 11 | `chars().count()` ≠ display width | Pango handles text layout and measurement |
| 12 | PTY for color output | Not needed if using VTE; or parse ANSI separately |
| 13 | Key Release double-fire | GTK `key-pressed` signal fires once per press |
| 16 | Byte-slicing panic in preview | GTK TextBuffer uses character offsets |
| 20 | macOS Alt+b/Alt+f escapes | GTK handles Alt key combinations natively |
| 21 | Input soft-wrap calculation | `WrapMode::Word` built-in |
| 22 | Cursor ↔ ratatui word-wrap | `GtkTextView` handles cursor positioning |
| 23 | German keyboard Fn+Option | GTK input method handles dead keys |
| 24 | Shift+Enter terminal encoding | GTK receives actual key events, not escape codes |
| 25 | Up/Down in multiline input | `GtkTextView` handles this natively |
| 26 | Bracketed paste | GTK clipboard handles paste natively |
| 28 | `truncate_with_notice()` panic | GTK TextBuffer uses character offsets |

## TUI Gotchas That Still Apply

| # | Gotcha | Why it still applies |
|---|--------|---------------------|
| 2 | Interleaved SSE blocks | Core API parsing — UI-independent |
| 3 | `[DONE]` SSE terminator | Core API parsing — UI-independent |
| 6 | Empty tool names | Core conversation logic — UI-independent |
| 7 | Tracing crate names (underscores) | Build system — UI-independent |
| 14 | New content must not override manual scroll | Need to implement scroll suppression in GTK too |
| 15 | Crash diagnostics | Different approach needed for GUI (no terminal to restore) |
| 17 | SIGHUP silent death | Still applies to the GTK process |
| 18 | Eager rebuild → 100% CPU | Lazy rendering pattern still important for requests tab |
| 19 | `tokio::spawn` swallows panics | Same Tokio task management applies |
| 27 | UserQuestion tool architecture | Same channel-based pattern needed |
| 29 | Typewriter effect | Optional — GTK rendering is smooth enough without it |
| 30 | Markdown table column overflow | Still need viewport-aware table rendering |

---

## Recommended Build Order

1. **Phase 0** — Install GTK4, verify the window opens
2. **Phase 1.1** — Fix the `ImageBase64` bug (5 min)
3. **Phase 1.5** — Commands (most impactful for usability)
4. **Phase 1.2** — Permission dialog (security-critical)
5. **Phase 2.1** — Markdown rendering (visual quality)
6. **Phase 2.2** — Syntax highlighting (visual quality)
7. **Phase 1.4** — Session persistence (data safety)
8. **Phase 3.1–3.2** — Status bar + scroll behavior (polish)
9. **Phase 3.3** — Tabs (parity with TUI)
10. **Phase 1.3** — UserQuestion dialog (less common)
11. **Phase 4** — macOS app bundle (distribution)
12. **Phase 5** — Advanced features (nice-to-have)

---

## Test Strategy

### GTK-independent tests (run without GTK4 installed)
```bash
cargo test -p chlodwig-gtk --lib --no-default-features
```

Tests for `app_state.rs`, command parsing, display block conversion — anything that doesn't touch GTK widgets.

### GTK-dependent tests (require display server)
```bash
cargo test -p chlodwig-gtk --lib  # needs GTK4 + display
```

Tests that create `GtkTextBuffer`, `GtkTextTag`, etc. Gate with `#[cfg(feature = "gtk-ui")]`.

### Integration tests
```bash
cargo run -p chlodwig-gtk  # manual testing until automated GTK tests are feasible
```

### Workspace tests (must always pass)
```bash
cargo test --workspace --exclude chlodwig-gtk  # existing tests
cargo test -p chlodwig-gtk --lib --no-default-features  # ~50 GTK state tests
```

---

## Estimated Effort

| Phase | Effort | Priority |
|-------|--------|----------|
| Phase 0: Prerequisites | 30 min | **Blocker** |
| Phase 1: Core Functionality | 2–3 days | **P0** |
| Phase 2: Rich Text Rendering | 3–5 days | **P0** |
| Phase 3: UI Polish | 2–3 days | **P1** |
| Phase 4: macOS App Bundle | 1–2 days | **P1** |
| Phase 5: Advanced Features | 5+ days | **P2** |
| **Total to full parity** | **~2–3 weeks** | |

---

## Open Questions

1. **GtkSourceView vs. plain GtkTextView?** — GtkSourceView gives free syntax highlighting + line numbers + undo/redo but is another dependency (`gtksourceview5`). Plain GtkTextView with manual syntect highlighting is lighter.

2. **VTE widget for shell output?** — `vte4-rs` embeds a full terminal emulator. Great for `! <cmd>` output but heavy. Alternative: parse ANSI manually and convert to GtkTextTags.

3. **Bundling strategy for macOS?** — GTK4 on macOS requires Homebrew libraries. Either bundle dylibs inside `.app` (large, ~50MB) or require Homebrew (developer-only distribution). `gtk-mac-bundler` exists but is finicky.

4. **Should the GTK version support `--print` headless mode?** — Probably not — that's the CLI's job. The GTK binary is always interactive.

5. **Adaptive typewriter effect needed?** — GTK TextBuffer insertions are visually smooth without artificial char-by-char pacing. Could skip entirely and just dump full tokens. The TUI needed it because ratatui redraw is frame-based (full repaint), making token dumps look "bursty".
