# GTK Render-Architektur: Findings & Optionen

Diskussion vom 2026-04-19 über die drei Render-Pfade in `crates/chlodwig-gtk/src/render.rs` und mögliche Konsolidierung.

---

## Ausgangsproblem

Beim Laden einer Session (`/resume 2026_04_19_02_22_16.json`) wurde das Edit-Tool nicht schön formatiert, sondern nur der Raw-String ausgegeben.

## Root-Cause-Analyse

Drei Render-Pfade gefunden:

1. **`rerender_all_blocks`** — Edit-Tool wurde nur als generic Tool gerendert (kein Diff!)
2. **`render_restored_blocks`** — diff_remove/diff_add ohne Highlighting (das was der User sah)
3. **`render_event_to_buffer`** — schön mit Highlighting (live)

Sofort-Fix (Commit `70b7606`): Helper `render_edit_tool_use(buffer, input)` extrahiert; alle drei Pfade rufen ihn auf. Tests via Source-Grep.

## User-Frage: warum drei?

> warum gibt es für fertigen text nicht einfach ein einzigen rendering mechanismus. warum drei? das ist doch voll der code-smell.

---

## Was die drei Funktionen wirklich tun

| Funktion | Input | Clear buffer? | Tool-rendering |
|---|---|---|---|
| `render_event_to_buffer` | **`ConversationEvent`** (live) | nein, append | reich: Edit-Diff, Bash+ANSI, Read mit Zeilennummern, Write, Grep, generic fallback |
| `render_restored_blocks` | **`&[DisplayBlock]`** (aus Session) | nein, append | arm: Edit (jetzt unified), generic Tool-Header + JSON, generic ToolResult-Preview |
| `rerender_all_blocks` | **`&[DisplayBlock]`** (aus AppState) | **ja, clear+CWD-Header** | arm: Edit (jetzt unified), generic Tool-Header + JSON, generic ToolResult-Preview |

## Was der eigentliche Code-Smell ist

Es sind **nicht** drei zufällige Render-Funktionen — es sind **zwei verschiedene Probleme**, die als drei Funktionen verkleidet wurden:

### Problem A: `Event` vs `DisplayBlock` als Input-Typ
- Live-Events (`ConversationEvent`) haben *mehr Information* als das, was in `DisplayBlock` gespeichert wird. Konkret: bei `ToolResult` braucht der Renderer den zugehörigen `tool_name` + `tool_input`, um zu wissen "ist das ein Bash-Output → ANSI, ein Read-Output → Zeilennummern, …". Der Live-Pfad hat eine `tool_id_to_info: HashMap<String, (name, input)>`-Map, der Restore-Pfad nicht.
- **Folge**: Restore-Pfad **kann gar nicht** so reich rendern, weil ihm die Info fehlt. Restore degradiert zwangsläufig zu „generic ToolResult-Preview".
- **Echter Fix**: `DisplayBlock::ToolResult` muss `tool_name` + `tool_input` mitspeichern (oder `tool_use_id` + Lookup). Dann *können* alle drei Pfade dieselbe Render-Funktion verwenden.

### Problem B: `clear+CWD-Header vs append`
- `rerender_all_blocks` wischt den Buffer und schreibt CWD-Header neu, dann iteriert Blocks.
- `render_restored_blocks` iteriert nur Blocks (append).
- **Echter Fix**: das ist eine triviale `should_clear: bool`-Flag-Frage. Die innere Schleife ist **identisch**.

## Historische Erklärung (ehrliche Antwort)

Die drei Funktionen existieren aus **historischen Gründen, nicht aus Design-Gründen**:
- Erst gab es nur `render_event_to_buffer` (live).
- Dann kam Session-Restore dazu → jemand kopierte die Funktion und nannte sie `render_restored_blocks`.
- Dann kam Window-Resize / Theme-Toggle dazu → noch eine Kopie, `rerender_all_blocks`.

Bei jeder Kopie wurde "nur das Nötigste" angepasst, und Tool-Spezialfälle blieben in der Live-Variante hängen, weil sie in den anderen Pfaden „erstmal nicht so wichtig" waren.

---

## User-Frage: warum nicht einfach ein render?

> warum gibt es nicht _einen_ render. der eine liste von dingen rendert.
> 1. session laden -> liste von dingen -> rendern()
> 2. window resize -> liste von dingen -> rendern()
> 3. was habe ich vergessen?

### Was vergessen wurde: Live-Streaming

SSE liefert pro Sekunde ~20 `TextDelta`-Events. Wenn jedes Delta einen kompletten Re-Render von potenziell 500 Display-Blocks auslöst, ist das verschwenderisch.

**Aber:** das Problem ist *bereits gelöst* — mit einer separaten Mini-Optimierung (`rerender_streaming_markdown`), die nur den unteren Bereich (`streaming_buffer`) neu malt. Die Live-Tool-Events (`ToolUseStart`, `ToolResult`) sind selten genug (paar pro Sekunde), dass ein voller Re-Render trivial wäre.

### Die richtige Architektur

```rust
// EINER. Renderet State in Buffer. Vollständig.
fn render(buffer, state) {
    clear(buffer);
    cwd_header(buffer);
    for block in &state.blocks {
        render_block(buffer, block);   // inline, kein Wrapper
    }
    if !state.streaming_buffer.is_empty() {
        render_streaming(buffer, &state.streaming_buffer);
    }
}
```

Aufrufer:
```rust
// 1. Session laden:        state.blocks = restore(...); render(buf, &state);
// 2. Window resize:        render(buf, &state);
// 3. Theme/Toggle:         render(buf, &state);
// 4. Tool-Event (ToolUseStart/ToolResult/UserMessage):
//                          state.blocks.push(...); render(buf, &state);
// 5. TextDelta:            state.streaming_buffer.push_str(...);
//                          [nicht render — Tick-Timer macht's später]
// 6. TextComplete:         state.blocks.push(AssistantText(streaming));
//                          state.streaming_buffer.clear();
//                          render(buf, &state);
```

Das ist **eine** Funktion. Tool-Events werden zu Blocks umgewandelt (das passiert in `app_state` ohnehin schon), dann re-rendered. Kein `render_event_to_buffer` mehr nötig.

Voraussetzung: `DisplayBlock::ToolResult` muss `tool_name` + `tool_input` mitspeichern.

### Allgemeinere Kritik (stimmt auch sonst)

User hat recht mit dem allgemeineren Punkt. Beispiele aus diesem Repo:
- `event_dispatch.rs`, `submit.rs`, `menu.rs`, `table_interactions.rs` als „Stage 1-4 Refactor" aus den letzten Commits — das war vermutlich Over-Engineering. Eine Datei `main.rs` mit klar abgegrenzten Sektionen ist oft lesbarer als 5 Dateien mit gegenseitigen Imports.
- `helper`-Funktionen, die einmal aufgerufen werden, von einer Stelle, mit zwei Zeilen Body. Inline gehört.

---

## User-Frage: warum nicht in GTK-View rendern?

> naja aber warum kann der renderer nicht in ein gtk-view rendern? dann gibt man dem eine neue, rendert rein und ersetzt die alte.
>
> beim streamen gibt man dem den halb fertigen block -> rendert in neue gtk view die unten angehangen wird. ist der block fertig, wird der einfach hinten ran gehangen.
>
> bei resize muss dann eh alles neu regendert werden.

### Das Konzept

Statt **einem riesigen `TextBuffer`**, in dem alle Blocks linear leben, wird jeder Block ein **eigenes Widget** in einer `GtkBox` (oder `ListBox`):

```
GtkScrolledWindow
└── GtkBox (vertical)
    ├── BlockWidget #0  (UserMessage)
    ├── BlockWidget #1  (AssistantText)
    ├── BlockWidget #2  (ToolUse: Edit)
    ├── BlockWidget #3  (ToolResult: Bash+ANSI)
    ├── ...
    └── StreamingWidget (lebt nur, solange streaming_buffer non-empty)
```

Jeder `BlockWidget` ist eine eigene `TextView` mit eigenem `TextBuffer` — oder ein anderes Widget, was auch immer am besten passt (für eine Tabelle z.B. ein echtes `Grid`, für einen Bash-Output ein `TextView` mit fixed-width font).

### Was das löst

| Problem | Lösung |
|---|---|
| Drei Render-Pfade | Es gibt nur noch eine Funktion `block_to_widget(block) -> Widget`. Aufrufer machen `box.append(block_to_widget(b))`. |
| Streaming | Eigenes `StreamingWidget` unten dranhängen. Beim `TextComplete`: streaming-Widget *bleibt einfach stehen* — wir setzen nur seinen Status auf "fertig" (oder ersetzen es durch den finalen Block-Widget, was identisch ist). |
| Inkrementell hinzufügen | Neuer Block? `box.append(block_to_widget(b))`. Fertig. Kein Re-Render von vorhandenen Blocks. |
| Resize | Macht GTK selbst. Jedes Widget rewrappt seinen Text intern. Kein App-Code nötig. |
| Selection / Copy | Pro Widget — was eigentlich besser ist (Code-Block kopieren ohne den umgebenden Markdown-Müll mitzunehmen). Falls "Copy All" gewünscht: über alle Widgets iterieren. |
| Tabellen | Werden zu echten `GtkGrid`-Widgets statt zu Pseudo-`│`/`─`-ASCII-Art im TextBuffer. Klick-Sort wird trivial. |
| Emoji-Overlay | Pro Widget statt globaler Offset-Map über den ganzen Buffer. Vermutlich wegfallend, weil pro-TextView die Pango/CoreText-Frage nochmal getrennt entscheidbar wird. |

### Was es kostet (ehrlich)

1. **Großer Umbau.** Praktisch alles in `crates/chlodwig-gtk/src/render.rs`, `md_renderer.rs`, `emoji_overlay.rs`, `table_interactions.rs`, `event_dispatch.rs` wird neu geschrieben. Schätzung: ~1500-2500 Zeilen Diff, 1-2 Tage konzentrierte Arbeit mit TDD.

2. **Selection über Widget-Grenzen funktioniert nicht von Haus aus.** GTK selektiert pro `TextView`. Wenn der User Block 3 bis Block 7 markieren will, geht das nicht ohne Hacks (z.B. eigener `EventControllerMotion` der über Widgets hinweg trackt, dann auf "Copy" alle relevanten Texte sammelt). Pragmatischer Ausweg: "Copy All" / "Copy Block" / "Copy Selection within Block" — drei klare Modi.

3. **Scroll-Performance bei langen Konversationen.** GTK rendert nur sichtbare Widgets, aber Layout läuft auch über unsichtbare. Bei 500+ Blocks merkbar. Lösung: `GtkListView` mit Virtualisierung. Aber dann verlierst du dynamische Höhe einfacher Boxen — du brauchst ein `ListItemFactory` mit measure-callbacks. Das ist GTK4-Standard, aber komplexer als `Box::append`.

4. **Streaming-Update.** Beim `TextDelta` musst du den `streaming_buffer` im `StreamingWidget` aktualisieren. Naiv: `widget.buffer().set_text(&streaming_buffer)` pro Tick → flackert + verliert Cursor/Selection. Besser: nur das Diff anhängen. Wieder lösbar, aber nicht trivial.

5. **Such-Funktion (falls je geplant)** wird komplizierter. Aktuell: ein `TextBuffer` → eine Suche. Mit Widget-pro-Block: über alle Widgets iterieren.

### Mittelweg: pragmatisch in der Mitte

Falls der volle Umbau zu groß ist, gibt es eine **inkrementelle Variante**, die 80% des Schmerzes löst:

```
GtkScrolledWindow
└── GtkBox (vertical)
    ├── TextView_Final     (alle abgeschlossenen Blocks, append-only,
    │                       wird beim Resize einmal neu gerendert)
    └── TextView_Streaming (nur der live-Stream, wird pro Tick refreshed,
                            verschwindet bei TextComplete und sein Inhalt
                            wird an TextView_Final angehängt)
```

Das löst:
- ✅ Streaming-Flacker (eigener Buffer)
- ✅ Inkrementelles Append ohne Re-Render der Historie
- ✅ Klare Trennung "fertig" vs "im Fluss"

Aber:
- ❌ Ein Render-Pfad bleibt (`render_blocks(&[Block]) → TextBuffer` für TextView_Final)
- ❌ Tabellen bleiben ASCII-Art
- ❌ Selection über Streaming↔Final-Grenze geht nicht

---

## Drei Optionen — Vergleichstabelle

| Kriterium | **A: Render-Konsolidierung** | **B: Final + Streaming TextView** | **C: Widget-pro-Block** |
|---|---|---|---|
| **Aufwand** | 1-2 Std. | ~halber Tag | 1-2 Tage |
| **Diff-Größe** | ~200-400 Zeilen | ~600-1000 Zeilen | ~1500-2500 Zeilen |
| **Risiko** | gering — bestehende API bleibt | mittel — Streaming-Logik ändert sich | hoch — viele Subsysteme betroffen |
| **Löst „drei Render-Pfade"** | ✅ ja, eine Funktion | ✅ ja, eine Funktion für Final | ✅ ja, eine `block_to_widget` |
| **Restore = Live** | ✅ ja | ✅ ja | ✅ ja |
| **Streaming flackerfrei** | ❌ nein (Buffer wird neu gemalt) | ✅ ja (eigener Buffer) | ✅ ja (eigenes Widget) |
| **Inkrementelles Append** | ❌ nein (jeder neue Block = full render) | ✅ ja (nur `box.append`) | ✅ ja (nur `box.append`) |
| **Resize-Verhalten** | App rendert neu | App rendert Final neu | GTK macht's automatisch |
| **Tool-Spezifisches Rendering** | Code-basiert (Bash-ANSI, Read-Lines, Edit-Diff) im TextBuffer | wie A | echte Widgets möglich (Bash-Terminal-Widget, Read-CodeView, …) |
| **Tabellen** | bleiben ASCII (`│ ─ ┌`) | bleiben ASCII | können echte `GtkGrid` werden |
| **Selection über Blocks** | ✅ funktioniert (ein Buffer) | ⚠️ nicht über Final↔Streaming-Grenze | ❌ nicht von Haus aus (pro-Widget) |
| **Copy-All** | ✅ trivial | ✅ trivial (zwei Buffer concat) | ⚠️ über alle Widgets iterieren |
| **Suchen im Output** | ✅ ein Buffer | ⚠️ zwei Buffer | ❌ über alle Widgets |
| **Performance lang. Sessions** | gut (TextBuffer skaliert) | gut | ⚠️ braucht ListView-Virtualisierung |
| **Click-Sort auf Tabellen** | aktuelle Tag-basierte Lösung bleibt | wie A | ✅ nativ (`button-press` auf Header-Widget) |
| **Emoji-Overlay-Komplexität** | bleibt (globale Offset-Map) | bleibt | reduziert (pro Widget) |
| **Code-Block mit Copy-Button** | ❌ nicht ohne Hack | ❌ nicht ohne Hack | ✅ einfach (Button neben CodeView) |
| **Block-Faltung (collapse)** | ❌ nein | ❌ nein | ✅ trivial (`Expander`-Widget) |
| **Test-bar ohne GTK-Display** | ✅ Source-grep + pure functions | ✅ wie A | ⚠️ wenig — braucht echte Widgets |
| **Streaming-Tick-Logik** | bleibt (`rerender_streaming_markdown`) | wird einfacher | wird einfacher |
| **Migration alter Sessions** | unverändert | unverändert | unverändert |
| **Sichtbarer User-Mehrwert** | restore endlich schön | + flackerfreies Streaming | + alles aus B + langfristig viele Features |
| **Endgegner-Code-Smell weg** | teilweise (eine Funktion, aber TextBuffer-zentriert) | weitgehend | ja |
| **Dauert sich auszuwachsen?** | kann wieder driften (Pfade hinzufügen ist verlockend) | kaum (nur 2 klare Stellen) | kaum (Widget = atomare Einheit) |
| **Reversibilität** | ✅ leicht | ✅ leicht | ⚠️ schwer (Architektur-Entscheidung) |

### Kurz-Empfehlung pro Lebenslage

- „Will jetzt das Restore-Bug fixen, weiter coden" → **A**
- „Will die Architektur ehrlich aufräumen ohne Mega-Umbau" → **B**
- „Will die App langfristig zur Premium-Chat-UI ausbauen (Tables klickbar, Code-Blocks mit Copy/Run, faltbare Blöcke, …)" → **C**

---

## Status

- **Sofort-Fix Edit-Tool:** committet (`70b7606`)
- **Architektur-Entscheidung A/B/C:** offen
