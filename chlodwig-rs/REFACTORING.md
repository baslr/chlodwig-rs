# Refactoring-Analyse: chlodwig-rs

Reine Bestandsaufnahme — keine Änderungen, nur Befunde.

---

## Bugs (nebenbei gefunden)

| # | Datei | Zeile | Schwere | Problem |
|---|-------|-------|---------|---------|
| 1 | `subagent.rs` | 224 | **KRITISCH** | `&final_text[..200]` — Byte-Index, nicht Char-Index. **Panic bei UTF-8 Multi-Byte** (Emoji, CJK, Umlaute). Exakt der gleiche Bug-Typ wie Gotcha #16. |
| 2 | `main.rs` | 394+411 | **HOCH** | "Always Allow" ist kaputt — `always_allowed` HashSet wird geprüft aber **nie befüllt**. User wird jedes Mal erneut gefragt. |
| 3 | `client.rs` | 116–119 | MITTEL | Unparseable SSE-Events werden still verworfen. Wenn `MessageStop` malformed ist, hängt die Conversation-Loop. |

---

## Code-Duplikation (Top 10)

| # | Was | Wo | ~Doppelte Zeilen |
|---|-----|----|----------------:|
| 1 | **3x identische Scrolled-View-Render-Funktion** | `render.rs` L55–141, L227–293, L295–367 | ~150 |
| 2 | **4x ToolResult-Konstruktion** (emit + build) | `conversation.rs` L782–862 | ~40 |
| 3 | **3x Wrap-and-Collect-Pattern** | `app.rs` L358–381, L601–607, L731–741 | ~18 |
| 4 | **4x Terminal-Restore-Code** | `event_loop.rs` L199, L287, L333, L380 | ~12 |
| 5 | **3x Path-Resolution** (optional path -> absolut) | `grep.rs`, `glob.rs`, `listdir.rs` | ~30 |
| 6 | **3x Output-Truncation** (100k/verschied. Suffixe) | `bash.rs`, `listdir.rs`, `webfetch.rs` | ~15 |
| 7 | **2x List-Marker-Generation** (zeichengleich!) | `markdown.rs` L368–385 vs L401–419 | ~17 |
| 8 | **2x MockApiClient + EchoTool** in Tests | `conversation.rs` vs `subagent.rs` | ~50 |
| 9 | **2x HTTP-Client-Builder** | `websearch.rs` L28–35 vs `webfetch.rs` L21–28 | ~8 |
| 10 | **9x `test_ctx()` Helper** in Tool-Tests | alle Tool-Dateien | ~18 |

---

## Zu lange Funktionen (>50 LOC)

| Funktion | Datei | LOC | Problem |
|----------|-------|----:|---------|
| `run_tui_with_permissions` | `event_loop.rs` | **715** | Gott-Funktion: Terminal-Setup, Event-Loop, Key-Dispatch, Conversation-Events, Permission-Handling, Spinner, Cleanup |
| `render_markdown` | `markdown.rs` | **344** | 20 State-Variablen, riesiger `match event`-Baum |
| `run_turn` | `conversation.rs` | **221** | SSE-Stream-Consumption + Tool-Execution vermischt |
| `rebuild_lines` | `app.rs` | **198** | 13 Match-Arms + Wrapping + Scrollback-Trim |
| `GrepTool::call` | `grep.rs` | **155** | Arg-Building allein ~93 Zeilen |
| `rebuild_requests_lines` | `app.rs` | **132** | Tief verschachtelt |
| `compact_conversation` | `conversation.rs` | **128** | SSE-Loop teilweise dupliziert aus `run_turn` |
| `crash_dump` | `app.rs` | **122** | Mechanische `writeln!`-Bloecke |
| `execute_tool_with_permission` | `conversation.rs` | **94** | 4 Verschachtelungsebenen |
| `ListDirTool::call` | `listdir.rs` | **81** | Command-Execution dupliziert mit bash.rs |
| `BashTool::call` | `bash.rs` | **72** | PTY-Wrapping + Timeout + Output-Assembly |

---

## Falsch platzierte Verantwortlichkeiten

| Was | Ist in | Gehoert in |
|-----|--------|-----------|
| SSE-Wire-Types (`SseEvent`, `Delta`, `ApiErrorInfo`, ...) | `conversation.rs` L19–108 | eigenes `sse_types.rs` oder `api_types.rs` |
| `ApiRequest` struct | `conversation.rs` L113–121 | API-Crate |
| `ApiClient` trait + `ApiError` enum | `conversation.rs` L124–149 | API-Crate |
| `format_summary()` (Regex-XML-Stripping) | `conversation.rs` L325–342 | `text_utils.rs` |
| `translate_unknown_tool()` + `shell_escape()` | `conversation.rs` L744–766 | Tools-Crate |
| `StdioPermissionPrompter` | `main.rs` L375–418 | `chlodwig-core` |
| `default_system_prompt()` + `load_claude_md()` + `git_context()` | `main.rs` L51–187 | `prompt_builder.rs` |
| Shell-Command-Execution | `event_loop.rs` L587–651 | eigenes `shell.rs` |
| `run_rg()` + `find_rg()` | `glob.rs` L30–123 | eigenes `rg.rs` (grep importiert aus glob) |

---

## Toter Code

| Was | Datei | Zeile |
|-----|-------|-------|
| `stream_with_retry()` — **null Aufrufer** | `client.rs` | 129–152 |
| `SUBAGENT_MAX_TURNS` — definiert, nie benutzt | `subagent.rs` | 16 |
| `compute_scrollbar_state()` — gibt nur seine Argumente zurueck | `render.rs` | 17–23 |
| `scroll_to_bottom_if_auto()` — **leerer Body**, 5 Aufrufer | `app.rs` | 428–431 |
| `needs_redraw = true; needs_redraw = true;` — doppelt | `event_loop.rs` | 1049–1050 |
| Tote `total <= view_height`-Branches in `total > view_height`-Guards | `render.rs` | L98, L256, L325 |

---

## Magic Numbers (Auswahl)

| Wert | Datei | Zeile | Sollte sein |
|------|-------|-------|-------------|
| `8192` | conversation.rs | 403 | `COMPACTION_MAX_TOKENS` |
| `200` | subagent.rs | 224 | `SUBAGENT_PREVIEW_LENGTH` (+ Bug!) |
| `"2023-06-01"` | client.rs | 39 | `ANTHROPIC_API_VERSION` |
| `120_000` / `600_000` | bash.rs | 47 | `DEFAULT/MAX_BASH_TIMEOUT_MS` |
| `100_000` | bash.rs, listdir.rs | 97, 111 | `MAX_OUTPUT_BYTES` |
| `500` | grep.rs | 159 | `MAX_COLUMN_WIDTH` |
| `2000` | read.rs | 55 | `DEFAULT_READ_LIMIT` |
| `40` | event_loop.rs | 499, 768 | `DEFAULT_VIEWPORT_HEIGHT` |
| `120` | app.rs | 83 | `DEFAULT_WRAP_WIDTH` |
| `"base16-eighties.dark"` | markdown.rs | 27 | `THEME_NAME` |
| `Rgb(25,25,25)` / `Rgb(30,30,30)` / etc. | render.rs, markdown.rs | div. | Farb-Konstanten |

---

## Sonstige Smells

| Problem | Wo |
|---------|----|
| `format_summary()` kompiliert 3 Regexe bei **jedem Aufruf** | `conversation.rs` L326–342 |
| `unsafe &'static`-Cast fuer `api_client` — 2x dupliziert, potenziell unsound | `event_loop.rs` L565, L678 |
| Inkonsistente Error-Handling: File-not-found ist `Err(ToolError)` in edit/read, aber `Ok(is_error:true)` in glob/listdir | Tools-Crate |
| Edit/Read/Write validieren nicht, ob `file_path` absolut ist | edit.rs, read.rs, write.rs |
| `RenderedLine::clone()` fuer jede Zeile die passt (Common Case) — unnoetige Allokation | `rendered_line.rs` L62 |

---

## Empfohlene Prioritaeten

1. **Bugs fixen** — UTF-8-Panic in subagent.rs, Always-Allow kaputt in main.rs
2. **Gott-Funktion aufbrechen** — `run_tui_with_permissions` (715 LOC)
3. **render_scrolled_view extrahieren** — eliminiert ~150 duplizierte Zeilen
4. **Shared Utils** — `resolve_path`, `truncate_output`, `restore_terminal`, `test_ctx`
5. **Toter Code entfernen** — `stream_with_retry`, `compute_scrollbar_state`, `SUBAGENT_MAX_TURNS`
6. **SSE-Types raus aus conversation.rs** — in eigenes Modul
7. **Magic Numbers zu Konstanten**
8. **`rg.rs` extrahieren** — grep.rs importiert aus glob.rs
