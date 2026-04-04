# Feature: Farbige Edit-Diff-Anzeige mit Zeilennummern

## Motivation

Aktuell zeigt das TUI bei `Edit`-ToolCalls nur den rohen JSON-Input:

```
── Tool: Edit ──
  {
    "file_path": "/foo/bar.rs",
    "old_string": "let x = 1;",
    "new_string": "let x = 42;"
  }
── [OK] ──
  Edited /foo/bar.rs: replaced 1 occurrence(s)
```

Das ist schwer lesbar. Ziel: eine farbige Diff-Anzeige wie `git diff` oder `bat --diff`:

```
── Edit: src/main.rs ──
  17 │- let x = 1;
  17 │+ let x = 42;
── [OK] ──
```

Rote Zeilen = entfernt, grüne Zeilen = hinzugefügt, Zeilennummern links.

---

## Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| `chlodwig-tui/src/types.rs` | Neuer `DisplayBlock::EditDiff` Variant |
| `chlodwig-tui/src/event_loop.rs` | Edit-spezifische Logik bei `ToolUseStart` |
| `chlodwig-tui/src/app.rs` | Rendering des Diffs in `rebuild_lines()` |
| `chlodwig-tui/src/app.rs` | `crash_dump()` + `restore_display_blocks()` erweitern |
| `chlodwig-tui/src/tests/edit_diff.rs` | Neue Testdatei |
| `chlodwig-tui/src/tests/mod.rs` | `mod edit_diff;` eintragen |

---

## Design

### 1. Neuer `DisplayBlock` Variant

```rust
// types.rs
enum DisplayBlock {
    // ... bestehende Variants ...

    /// Farbige Diff-Anzeige für Edit-ToolCalls.
    EditDiff {
        file_path: String,
        /// Jede Zeile: (Zeilennummer, Art, Text)
        diff_lines: Vec<DiffLine>,
    },
}

#[derive(Debug, Clone)]
pub(crate) struct DiffLine {
    pub line_num: usize,
    pub kind: DiffKind,
    pub text: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum DiffKind {
    Removal,   // rot, Prefix "-"
    Addition,  // grün, Prefix "+"
    Context,   // grau, Prefix " " (unveränderte Umgebungszeilen)
}
```

### 2. Diff-Berechnung bei Event-Empfang

In `event_loop.rs` bei `ConversationEvent::ToolUseStart`:

```rust
ConversationEvent::ToolUseStart { name, input, .. } => {
    if name == "Edit" {
        if let Some(diff_block) = build_edit_diff(&input) {
            app.display_blocks.push(diff_block);
        }
    } else if !input.is_null() {
        // bestehende generische ToolCall-Logik
        app.display_blocks.push(DisplayBlock::ToolCall { ... });
    }
    app.scroll_to_bottom_if_auto();
}
```

Die Hilfsfunktion `build_edit_diff`:

```rust
fn build_edit_diff(input: &serde_json::Value) -> Option<DisplayBlock> {
    let file_path = input["file_path"].as_str()?;
    let old_string = input["old_string"].as_str()?;
    let new_string = input["new_string"].as_str()?;

    // Datei lesen um Zeilennummer des Matches zu finden.
    // Zu diesem Zeitpunkt ist das Edit noch NICHT ausgeführt —
    // der ToolUseStart kommt bevor der Tool-Call ausgeführt wird.
    let start_line = std::fs::read_to_string(file_path)
        .ok()
        .and_then(|content| {
            content.find(old_string).map(|byte_pos| {
                content[..byte_pos].lines().count() + 1  // 1-basiert
            })
        })
        .unwrap_or(1);

    let mut diff_lines = Vec::new();

    // Context: 2 Zeilen davor (falls vorhanden)
    // → erfordert Zugriff auf den Dateiinhalt, optional

    // Entfernte Zeilen (rot)
    for (i, line) in old_string.lines().enumerate() {
        diff_lines.push(DiffLine {
            line_num: start_line + i,
            kind: DiffKind::Removal,
            text: line.to_string(),
        });
    }

    // Hinzugefügte Zeilen (grün)
    for (i, line) in new_string.lines().enumerate() {
        diff_lines.push(DiffLine {
            line_num: start_line + i,
            kind: DiffKind::Addition,
            text: line.to_string(),
        });
    }

    Some(DisplayBlock::EditDiff {
        file_path: file_path.to_string(),
        diff_lines,
    })
}
```

### 3. Rendering in `rebuild_lines()`

In `app.rs`, neuer Match-Arm:

```rust
DisplayBlock::EditDiff { file_path, diff_lines } => {
    // Header mit Dateiname
    logical_lines.push(RenderedLine::styled(
        &format!("── Edit: {file_path} ──"),
        Style::default().fg(Color::Yellow),
    ));

    for dl in diff_lines {
        let (prefix, color) = match dl.kind {
            DiffKind::Removal  => ("-", Color::Red),
            DiffKind::Addition => ("+", Color::Green),
            DiffKind::Context  => (" ", Color::DarkGray),
        };
        logical_lines.push(RenderedLine::styled(
            &format!(" {:>4} │{prefix} {}", dl.line_num, dl.text),
            Style::default().fg(color),
        ));
    }
}
```

### 4. Kontext-Zeilen (optional, Deluxe)

Wie `git diff -U2` — 2 Zeilen vor und nach dem Edit als graue Context-Zeilen:

```rust
// Vor den Removals:
let all_lines: Vec<&str> = content.lines().collect();
let ctx_start = start_line.saturating_sub(3); // 2 Zeilen davor (0-basiert)
for i in ctx_start..start_line.saturating_sub(1) {
    diff_lines.push(DiffLine {
        line_num: i + 1,
        kind: DiffKind::Context,
        text: all_lines.get(i).unwrap_or(&"").to_string(),
    });
}
// ... dann Removals, dann Additions ...
// Danach 2 Context-Zeilen nach dem Edit
```

### 5. Syntax-Highlighting im Diff (Deluxe++)

Für farbiges Syntax-Highlighting **innerhalb** der Diff-Zeilen (wie VS Code Diff-View):

- Vordergrund: Syntax-Farben (via syntect/`render_markdown`)
- Hintergrund: Diff-Farbe (dunkelrot `Rgb(60,20,20)` / dunkelgrün `Rgb(20,60,20)`)

Das erfordert `RenderedLine` mit Multi-Span-Support + Background-Color, was aktuell nicht unterstützt wird. Deutlich mehr Aufwand.

---

## Tests

### Unit-Tests (`tests/edit_diff.rs`)

```rust
#[test]
fn test_edit_diff_single_line_change() {
    // old_string: "let x = 1;"
    // new_string: "let x = 42;"
    // → 1 rote Zeile + 1 grüne Zeile, korrekte Zeilennummer
}

#[test]
fn test_edit_diff_multiline_change() {
    // old_string: 3 Zeilen
    // new_string: 2 Zeilen
    // → 3 rote + 2 grüne Zeilen, Nummern fortlaufend
}

#[test]
fn test_edit_diff_line_number_detection() {
    // Datei mit bekanntem Inhalt, old_string auf Zeile 5
    // → Zeilennummer 5 im Diff
}

#[test]
fn test_edit_diff_file_not_readable() {
    // Datei existiert nicht → Fallback auf Zeilennummer 1
}

#[test]
fn test_edit_diff_utf8_in_diff() {
    // old/new mit Umlauten und Emoji → kein Panic, korrekte Anzeige
}

#[test]
fn test_edit_diff_rendered_colors() {
    // rebuild_lines() für EditDiff prüfen:
    // Header = Yellow, Removal = Red, Addition = Green
}

#[test]
fn test_non_edit_tool_still_uses_generic_display() {
    // ToolUseStart mit name="Bash" → weiterhin DisplayBlock::ToolCall
}
```

---

## Reihenfolge der Implementation (TDD)

1. Tests für `DiffLine`/`DiffKind` Struct + `build_edit_diff()` schreiben (Red)
2. `types.rs`: `DiffLine`, `DiffKind`, `DisplayBlock::EditDiff` hinzufügen (Green)
3. Tests für Rendering schreiben (Red)
4. `app.rs`: `rebuild_lines()` Match-Arm (Green)
5. Tests für Event-Loop-Integration schreiben (Red)
6. `event_loop.rs`: `ToolUseStart`-Handler erweitern (Green)
7. `crash_dump()` + `restore_display_blocks()` für neuen Variant erweitern
8. Context-Zeilen (optional)
9. `cargo test --workspace` — alles grün

---

## Nicht betroffen

- `chlodwig-tools/src/edit.rs` — das Tool selbst ändert sich nicht
- `chlodwig-core` — keine Änderungen nötig
- `ToolResult`-Anzeige — bleibt `[OK]`/`[ERROR]` wie bisher
- Andere Tools (Bash, Read, Grep, ...) — weiterhin generische Anzeige
