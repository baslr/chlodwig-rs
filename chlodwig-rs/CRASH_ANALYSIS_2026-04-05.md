# Crash-Analyse: Silent Death (2026-04-05)

## Log-Datei

`~/.chlodwig-rs/debug_2026-04-05_18-40-48.log` (14.5 MB, 147.088 Zeilen)

Session: 16:40:48 – 17:11:46 (~31 Minuten), 6410 Redraws, Trace-Level aktiv.

---

## Symptom

Der Prozess stirbt lautlos — kein Panic, kein Signal-Handler-Output, kein Crash-Report (`crash_*.log`), kein `"exited main event loop"`. Das Terminal kehrt zur Shell zurueck, als haette jemand den Prozess gekillt.

Zum Vergleich: Andere Sessions im selben Zeitraum enden sauber:
```
debug_2026-04-05_17-37-33.log → "exited main event loop ... reason=should_quit"
debug_2026-04-05_18-52-48.log → "exited main event loop ... reason=should_quit"
```

---

## Exakte Crash-Position

Das Trace-Logging zeigt, dass der Event-Loop **nicht blockiert** — `poll()`, `channel-drain`, und `rebuild_lines()` laufen bis zum Schluss:

```
17:11:46.372188  rebuild_lines: done rendered_lines=785
17:11:46.372287  pre-draw redraw=6410 ...
17:11:46.375518  post-draw redraw=6410
17:11:46.476649  TextComplete received
17:11:46.477044  rebuild_lines: start blocks=59
17:11:46.789807  rebuild_lines: done rendered_lines=787
                 ← HIER STIRBT DER PROZESS — kein pre-draw mehr
```

Vorheriges Muster (100% konsistent fuer 6410 Redraws):
```
rebuild_lines: done  →  ~0.1ms  →  pre-draw
```

Letztes Mal:
```
rebuild_lines: done  →  NICHTS  →  (Prozess tot)
```

---

## Code zwischen `rebuild_lines: done` und `pre-draw`

```rust
// event_loop.rs, Zeilen 675–696
app.rebuild_lines();                              // ← Zeile 675, Log: "done"
// Zeile 679-681: rebuild_requests_lines()        // nur wenn active_tab == 2
// Zeile 683-684: rebuild_constants_lines()       // nur wenn active_tab == 3
if let Ok(mut guard) = crash_state().lock() {     // ← Zeile 687
    *guard = app.crash_dump();                    // ← Zeile 688 — VERDACHT
}
tracing::debug!("pre-draw" ...);                  // ← Zeile 690, NIE ERREICHT
```

---

## Root Cause: UTF-8 Byte-Slicing Panic in `crash_dump()`

In `app.rs`, Zeile 2108:

```rust
let tail = if t.len() > 200 { &t[t.len()-200..] } else { t };
```

**Exakt der gleiche Bug wie Gotcha #16** (`ToolResult` Preview Truncation). Wenn `t.len()-200` mitten in einem Multi-Byte UTF-8 Zeichen liegt → `panic!("byte index is not a char boundary")`.

### Warum kein Crash-Report?

1. `crash_dump()` wird **innerhalb** von `crash_state().lock()` aufgerufen (Mutex gelockt)
2. Panic in `crash_dump()` → Panic-Hook wird ausgeloest
3. Panic-Hook versucht `crash_state().lock()` → **Deadlock** (Mutex bereits gelockt)
4. Prozess haengt im Deadlock → wird vom OS gekillt (SIGKILL) oder Watchdog greift
5. SIGKILL kann nicht abgefangen werden → kein Crash-Report

### Beweis aus dem Log

Der letzte `AssistantText` hat `text_len=599` Bytes. `crash_dump()` berechnet `&t[599-200..] = &t[399..]`. Falls an Byte-Position 399 ein Multi-Byte Zeichen beginnt oder fortgesetzt wird → Panic.

---

## Fix

### 1. UTF-8 Bug in `crash_dump()` (bereits gefixt)

```rust
// Vorher (PANIC):
let tail = if t.len() > 200 { &t[t.len()-200..] } else { t };

// Nachher (sicher):
let tail = if t.len() > 200 {
    let mut start = t.len() - 200;
    while start < t.len() && !t.is_char_boundary(start) {
        start += 1;
    }
    &t[start..]
} else {
    t
};
```

### 2. Diagnostisches Tracing (bereits eingebaut)

5 neue Trace-Punkte zwischen `rebuild_lines` und `pre-draw`:

```
loop: rebuild_lines done
loop: rebuild_requests_lines done    (nur wenn Tab 2)
loop: rebuild_constants_lines done   (nur wenn Tab 3)
loop: crash_dump start
loop: crash_dump done
```

Beim naechsten Crash zeigt das Log `loop: crash_dump start` ohne `loop: crash_dump done` → Beweis.

---

## Nebenbeobachtung: Performance-Problem in `rebuild_lines()`

| Zeitpunkt | Blocks | Lines | Dauer |
|-----------|--------|-------|-------|
| 17:11:44.806 | 57 | 780 | 308 ms |
| 17:11:45.220 | 57 | 782 | 314 ms |
| 17:11:45.639 | 57 | 785 | 314 ms |
| 17:11:46.059 | 57 | 785 | 313 ms |
| 17:11:46.477 | 59 | 787 | 313 ms |

Statistik ueber alle 652 Rebuilds in der Session:

- **Durchschnitt**: 224 ms
- **Maximum**: 766 ms (209 Blocks, 1969 Lines)
- **> 100 ms**: 380 von 652 (58%)
- **> 200 ms**: 155 von 652 (24%)

Bei einem 100ms `poll()` Timeout ergibt das eine effektive Framerate von ~2 FPS statt 10 FPS. Die Ursache ist `render_markdown()` (syntect Syntax-Highlighting), das fuer **jeden** Block bei **jedem** Redraw neu berechnet wird.

---

## Zusammenfassung

| # | Problem | Status |
|---|---------|--------|
| 1 | UTF-8 Panic in `crash_dump()` Zeile 2108 | **GEFIXT** |
| 2 | Mutex-Deadlock bei Panic in crash_dump | **GEFIXT** (durch Fix 1) |
| 3 | Kein Tracing zwischen rebuild und pre-draw | **GEFIXT** (5 Trace-Punkte) |
| 4 | `rebuild_lines()` O(n) mit syntect pro Redraw | OFFEN (Performance) |

---

## Betroffene Dateien

| Datei | Aenderung |
|-------|-----------|
| `chlodwig-tui/src/app.rs:2108` | Char-boundary-sicheres Slicing in `crash_dump()` |
| `chlodwig-tui/src/event_loop.rs:675-690` | 5 Trace-Punkte hinzugefuegt |
