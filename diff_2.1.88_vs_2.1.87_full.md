# Claude Code 2.1.88 vs 2.1.87 — Vollständiger Diff-Bericht

**Dateien:**
- **2.1.88** (neu): 552.086 Zeilen, 17 MB
- **2.1.87** (alt): 523.267 Zeilen, 17 MB
- **Differenz:** +28.819 Zeilen

**Methode:** String-Literal-Extraktion (51.302 vs 49.725 unique Strings), `comm`-basierter Diff, manuelle Kategorisierung.

---

## 1. Größte strukturelle Änderung: Undici HTTP Client eingebettet

**Das ist der Hauptgrund für die ~29k Extra-Zeilen.**

In 2.1.87 wird `undici` nur per `require("undici")` als externe Node.js-Dependency referenziert (5 Referenzen). In 2.1.88 ist der **komplette Undici HTTP-Client** (~12.500 Zeilen) direkt in das Bundle eingebettet:

- **104 Referenzen** statt 5
- Vollständige Implementierung inkl. WebSocket-Client, HTTP/2, Connection Pooling, Proxy Support
- Neue Konstanten: `UND_ERR_*` (20+ Error-Codes), `WS_ERR_*` (10+ WebSocket-Errors)
- Neue Features: `EnvHttpProxyAgent`, `BalancedPool`, `RetryAgent`, `ProxyAgent`, `MockAgent`
- Eingebetteter **llhttp WASM-Parser** (Base64-encoded WebAssembly)
- `EventSource`-Implementierung (von 4 auf 13 Referenzen)
- `FileReader`, `FormData`, `URLSearchParams` — vollständige Web-API-Implementierung

**Bedeutung:** Claude Code wird unabhängiger von der Node.js-Version des Hosts.

---

## 2. Neue Features & Funktionalität

### 2.1 Terminal Tab Status
```
"Show status in terminal tab"
tengu_terminal_tab_status_setting_changed
tengu_terminal_sidebar
```
- Neue Setting: Status-Anzeige im Terminal-Tab (an/aus)

### 2.2 Permission System erweitert
```
"Recently denied"
"Commands recently denied by the auto mode classifier."
"No recent denials. Commands denied by the auto mode classifier will appear here."
"After auto mode classifier denies a tool call"
"The PermissionDenied hook indicated this command is now approved. You may retry it if you would like."
```
- Neues **"Recently denied"**-Panel — zeigt kürzlich vom Auto-Mode abgelehnte Commands
- Neuer `permission_retry`-Mechanismus — nach Hook-Approval kann ein Befehl erneut versucht werden
- `TestingPermission` Tool — neues internes Test-Tool

### 2.3 Config Tool
```
"Get or set Claude Code configuration settings."
"Config change rejected"
"Search settings…"
tengu_config_tool_changed
```
- Neues **Config-Tool** zum Lesen/Setzen von Claude Code Settings
- Durchsuchbare Settings-Oberfläche

### 2.4 Hook System erweitert
```
"hook_spawn_completed"
"hook_spawn_started"
"--include-hook-events"
"Include all hook lifecycle events in the output stream"
```
- Neue Hook-Events: `hook_spawn_started`, `hook_spawn_completed`
- Neuer CLI-Flag `--include-hook-events`

### 2.5 Duplicate Tool Use ID Detection
```
"duplicate_tool_use_id"
tengu_duplicate_tool_use_id
"`tool_use` ids must be unique"
```
- Erkennung und Handling von duplizierten Tool-Use-IDs

### 2.6 Voice/Audio erweitert
```
"Voice mode requires the native audio module (not loaded)"
"[voice] Focus silence timeout — tearing down session"
"[voice] Recording failed — no audio tool found"
"[voice] Windows native recording unavailable, no fallback"
"[voice_stream] unexpected-response fired with 101; ignoring"
"arecord: command not found"
```
- Von 221 auf 243 Referenzen ausgebaut
- Besseres Error-Handling: Windows-Fallback, `arecord`-Detection, Silence-Timeout

### 2.7 FileIndex Optimierung
```
"[FileIndex] skipped index rebuild — tracked paths unchanged"
"[FileIndex] skipped index rebuild — merged paths unchanged"
```
- File-Index-Rebuild wird übersprungen wenn sich Pfade nicht geändert haben

### 2.8 File Read Caching
```
"File unchanged since last read. The content from the earlier Read tool_result
 in this conversation is still current — refer to that instead of re-reading."
"Seeds the readFileState cache with a path+mtime entry."
```
- Neuer Cache-Mechanismus für gelesene Dateien — verhindert unnötige Re-Reads

---

## 3. Windows/PowerShell Support (stark erweitert)

Komplett neue PowerShell-Dokumentation und -Handling:

```
"PowerShell edition: PowerShell 7+ (pwsh) - Pipeline chain operators && and || ARE available..."
"PowerShell edition: Windows PowerShell 5.1 (powershell.exe) - Pipeline chain operators && and || are NOT available..."
"PowerShell edition: unknown — assume Windows PowerShell 5.1 for compatibility..."
```

- **3 verschiedene PowerShell-Profile** mit spezifischen Hinweisen (5.1, 7+, unbekannt)
- Detaillierte Guidance zu: `&&`/`||` Operatoren, Ternary, Null-Coalescing, `2>&1`-Redirect-Bug, Encoding
- Neue Sicherheitschecks:
  - `"Compound command changes working directory (Set-Location/Push-Location/Pop-Location/New-PSDrive)"`
  - `"Compound command creates a filesystem link (New-Item -ItemType SymbolicLink/Junction/HardLink)"`
  - `"Compound command contains a directory-changing command with a write operation"`
- `Start-Sleep` Avoidance-Guidance (analog zu Unix `sleep`)

---

## 4. Neue Telemetrie-Events (tengu_*)

### Hinzugekommen:

| Event | Bedeutung |
|---|---|
| `tengu_amber_json_tools` | JSON-Tools Experiment |
| `tengu_amber_stoat` | Unbekanntes Experiment (Codename) |
| `tengu_auto_mem_tool_denied` | Memory-Tool wurde vom Auto-Mode abgelehnt |
| `tengu_config_tool_changed` | Config-Tool wurde benutzt |
| `tengu_dunwich_bell` | Unbekanntes Experiment (Codename) |
| `tengu_duplicate_tool_use_id` | Duplicate Tool-Use-ID erkannt |
| `tengu_edit_string_lengths` | Edit-String-Längen-Tracking |
| `tengu_max_tokens_escalate` | max_tokens wurde eskaliert |
| `tengu_memory_survey_event` | Memory-Survey angezeigt |
| `tengu_terminal_sidebar` | Terminal-Sidebar benutzt |
| `tengu_terminal_tab_status_setting_changed` | Tab-Status-Setting geändert |
| `tengu_tool_input_json_parse_fail` | Tool-Input JSON-Parse fehlgeschlagen |
| `tengu_ultraplan_awaiting_input` | Ultraplan wartet auf User-Input |

### Entfernt:

| Event | Bedeutung |
|---|---|
| `tengu_borax_j4w` | Experiment abgeschlossen |
| `tengu_defer_all_bn4` | Experiment abgeschlossen |
| `tengu_defer_caveat_m9k` | Experiment abgeschlossen |
| `tengu_quiet_hollow` | Experiment abgeschlossen |
| `tengu_system_prompt_global_cache` | System-Prompt Cache Tracking entfernt |
| `tengu_tst_hint_m7r` | Experiment abgeschlossen |

---

## 5. System-Prompt / Guidance Änderungen

### Neue System-Prompt-Texte:
```
"Tools are executed in a user-selected permission mode. When you attempt to call a tool..."
"You are an agent for Claude Code, Anthropic's official CLI for Claude..."
"Don't create helpers, utilities, or abstractions for one-time operations..."
"When using `find -regex` with alternation, put the longest alternative first..."
"Pipe output through head, tail, or grep to reduce result size..."
"This is the git status at the start of the conversation..."
```

### Neue Memory-System Guidance:
- Erweiterte Memory-Kategorien mit `team feedback` vs `private feedback` Unterscheidung
- `session_guidance` — neue Kategorie für Session-spezifische Guidance

### Claude API Skill Dokumentation (eingebettet):
- Vollständige Referenz-Dokumentation für Claude API, Agent SDK, Tool Use, Streaming, Batches, Files API, Prompt Caching, Error Codes

---

## 6. Sonstige Änderungen

### XAA Auth System erweitert:
```
"XAA: missing clientId or clientSecret in config — skipping silent refresh"
```
- Neues Error-Handling: Silent refresh bei fehlenden Credentials

### Login-Command geändert:
```
# 2.1.87:
"Remote Control requires a claude.ai subscription. Run `claude login`..."
# 2.1.88:
"Remote Control requires a claude.ai subscription. Run `claude auth login`..."
```

### Entfernte Terminal-Erkennung:
- `ITERM_SESSION_ID`, `KONSOLE_VERSION`, `WT_SESSION` — Umgebungsvariablen-Checks entfernt

---

## 7. Entfernt / Gestrichen in 2.1.88

- 6 `tengu_*` Experiment-Events (siehe oben)
- Terminal-Typ-Erkennung über Umgebungsvariablen vereinfacht
- `claude login` → `claude auth login` umbenannt

---

## 8. Quantitative Zusammenfassung

| Metrik | 2.1.87 | 2.1.88 | Diff |
|---|---|---|---|
| Zeilen | 523.267 | 552.086 | **+28.819** |
| Unique Strings | 49.725 | 51.302 | **+1.577** |
| `undici` Refs | 5 | 104 | **+99** |
| `WebSocket` Refs | 84 | 156 | **+72** |
| `EventSource` Refs | 4 | 13 | **+9** |
| `voice/audio` Refs | 221 | 243 | **+22** |
| `tengu_*` Events | -6 entfernt | +13 hinzugefügt | **netto +7** |

---

*Quelle: Frischer String-Literal-basierter Diff von `2.1.88/cli_formatted.js` vs `src/cli_formatted.js`*
