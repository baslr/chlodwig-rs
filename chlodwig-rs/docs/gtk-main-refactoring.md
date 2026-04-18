# GTK `main.rs` — Refactoring-Findings

Stand: 2026-04-18, `main` @ `3d3f7e5`.

## Ausgangslage

`crates/chlodwig-gtk/src/main.rs` hat **1298 Zeilen** mit nur **2 Funktionen**:

| Funktion | Zeilen | Verantwortung |
|---|---|---|
| `fn main() -> glib::ExitCode` | 34–100 (~67) | PATH/ENV-Setup, Tracing-Init, GTK-App-Erzeugung |
| `fn activate(app, resume_flag)` | 101–1298 (~1198) | **alles andere** — UI-Wiring, Menü, Submit, Poll-Loop, Background-Task |

Das Verhältnis 67 / 1198 ist das Problem: `activate()` ist eine Endlos-Funktion, die alle UI-Closures captured und keinerlei Modulgrenzen kennt.

## Strukturanalyse von `activate()`

`activate()` zerfällt natürlicherweise in 13 sektion-kommentierte Blöcke. Reihenfolge wie im Code:

| # | Sektion | Zeilen | LoC | Was |
|---|---|---|---|---|
| 1 | Viewport width tracking | 104–127 | 24 | `Rc<Cell<usize>>` für aktuelle Spaltenzahl, Resize-Handler |
| 2 | Resolve configuration | 128–137 | 10 | `chlodwig_core::Config::resolve()` |
| 3 | Shared state | 138–153 | 16 | `app_state`, `event_tx/rx`, `uq_tx/rx`, `prompt_tx/rx` |
| 4 | **Native macOS menu bar** | 154–321 | **168** | File/Conversation/Window-Menü + 7 Actions |
| 5 | Resume session (if flag) | 322–360 | 39 | beim Start `--resume` ausführen |
| 6 | **Wire up Send button** | 361–646 | **286** | Submit-Handler, Cmd+Enter, Befehlsparsing, Cmd+V/C/X/A |
| 7 | Wire up Toggle Tool Usage button | 647–696 | 50 | Tool-Output ein-/ausblenden |
| 8 | Table header click → sort | 697–751 | 55 | Markdown-Tabellen-Spaltensortierung |
| 9 | Table row hover highlight | 752–833 | 82 | Mouse-Over-Effekt |
| 10 | Copy feedback | 834–852 | 19 | „✓ Copied!" in Statusbar |
| 11 | Auto-scroll detection | 853–870 | 18 | `vadjustment.connect_value_changed` → AutoScroll-State |
| 12 | **Poll conversation events** | 871–1160 | **290** | `glib::timeout_add_local` mit `match`-Loop über `ConversationEvent` |
| 13 | Start background conversation loop | 1161–end | ~138 | `std::thread::spawn` mit Tokio-Runtime |

Die drei fett markierten Blöcke (4, 6, 12) sind ~744 Zeilen — über die Hälfte der Datei.

## Auslagerungs-Kandidaten

Bewertet nach **Aufwand × Wert × Risiko**:

### Tier 1 — Sofort, niedriges Risiko

| Block | LoC | Vorgeschlagene Datei | Begründung |
|---|---|---|---|
| **Menü (4)** | 168 | `menu.rs` | Klar abgegrenzt, eigene Domäne, alle Captures explizit. Funktion `setup_menu(app, window, widgets, app_state, prompt_tx, viewport_cols, session_started_at)`. Kein Performance-kritischer Pfad. |
| **Tabellen-Interaktionen (8+9)** | 137 | `table_interactions.rs` | Beides über `output_view`-EventController. Saubere Funktion `wire_table_interactions(&output_view, &output_buffer)`. |
| **Auto-Scroll-Tracking (11)** | 18 | bestehende `setup.rs` oder `app_state.rs` | Trivial, gehört konzeptionell zur AutoScroll-Logik. |
| **Copy-Feedback (10)** | 19 | bestehende `setup.rs` | Trivial. |

**Subtotal**: ~342 Zeilen raus, sehr geringes Bug-Risiko.

### Tier 2 — Hoher Wert, mittlerer Aufwand

| Block | LoC | Vorgeschlagene Datei | Begründung |
|---|---|---|---|
| **Send-Button + Submit (6)** | 286 | `submit.rs` | Größter monolithischer Block. Enthält die ganze Befehls-Pipeline (`/clear`, `/compact`, `/resume`, `/sessions`, `/name`, `! shell`, normales Submit). Sollte parallel zur TUI-`event_loop`-Logik organisierbar werden. **Vorsicht**: viele `Rc::clone()` im jetzigen Code — beim Auslagern brauchen wir entweder ein `SubmitContext`-Struct oder Builder-Pattern, sonst werden 15 Funktionsparameter daraus. |
| **Poll-Loop (12)** | 290 | `event_dispatch.rs` mit pro-Variant-Funktionen | Der Brocken. Ein riesiger `match`-Block über `ConversationEvent`-Varianten. Jede Variant-Logik (TextDelta, ToolUseStart, ToolResult, …) sollte eine eigene Funktion `handle_text_delta(&mut state, &widgets, ...)` werden. **Sorgfalt nötig**: hier laufen Streaming-Updates pro 10ms — falsche Borrows brechen die UI. |

**Subtotal**: ~576 Zeilen raus.

### Tier 3 — Klein, optional

| Block | LoC | Bemerkung |
|---|---|---|
| Viewport tracking (1) | 24 | Könnte in `setup.rs` oder bleibt. Wenig Gewinn beim Auslagern. |
| Config resolve (2) | 10 | Eine Zeile in eigentlicher Logik, kein Aufwand wert. |
| Shared state (3) | 16 | Channel-Erzeugung. Bleibt sinnvoll am Anfang von `activate()`. |
| Resume-Bootstrap (5) | 39 | Könnte zu `restore.rs`, aber ist Start-up-Code — bleibt vermutlich besser sichtbar in `activate()`. |
| Background-Task-Spawn (13) | 138 | Schon recht eigenständig. Könnte zu `background_task.rs`, aber das ist Zusammenspiel TUI/GTK/`chlodwig_core::run_conversation_loop` — Auslagerung müsste TUI-`event_loop.rs` mitmeinen, sonst Code-Duplikation. |

## Empfohlene Reihenfolge

1. **`menu.rs`** — größter Tier-1-Brocken, einziger logisch geschlossener Block. Smoke-Test: Menü-Items klickbar, Cmd+N/M/H funktionieren.
2. **`table_interactions.rs`** — geschlossen, niedriges Risiko, Tests evtl. nur visuell.
3. **`submit.rs`** — Submit-Handler. Hier wird's interessant: braucht `SubmitContext`-Struct.
4. **`event_dispatch.rs`** — Poll-Loop in pro-Variant-Funktionen aufteilen. Größter Aufwand, größter Lesbarkeits-Gewinn.

Nach Schritt 4 sollte `main.rs` bei **~400 Zeilen** liegen (Setup + Viewport + State + Wiring-Aufrufe).

## Risiken & Stolperfallen

1. **Closure-Captures**: GTK-Closures müssen `'static` sein, also alles per `Rc::clone()` rein. Beim Auslagern: entweder
   - Funktion bekommt alle benötigten `Rc`s als Parameter (wird schnell unhandlich → 10+ Args), **oder**
   - Ein `Context`-Struct bündelt die `Rc<RefCell<…>>`-Felder (klare Schnittstelle, leicht erweiterbar).
2. **Re-entrancy bei `RefCell`**: Mehrere Closures borrowen `app_state` und `output_buffer` gleichzeitig. Die jetzige Reihenfolge im Code vermeidet Konflikte zufällig — ein Refactor muss diese Reihenfolge bewusst beibehalten oder explizit dokumentieren.
3. **Keine Test-Abdeckung für UI-Wiring**: `chlodwig-gtk` hat heute fast keine Tests für die Closure-Verdrahtung. Refactor stützt sich auf manuelle Smoke-Tests + Compile-Sicherheit. Vor Tier 2/3 wären Reducer-Tests wertvoll (siehe MVU-Stage 1.5/2 für UserQuestion).
4. **Build-Zeit**: GTK-Crate braucht ~30s pro Compile. Iterative Refactors zwischen Tests sind teuer — kompletten Plan vor Beginn.

## Was diese Datei NICHT vorschlägt

- **Keine MVU-Migration der Submit-Logik** (das wäre Stage 3/4 im MVU-Plan, separates Thema).
- **Keine Konsolidierung GTK ↔ TUI** der Submit-/Event-Pfade — beide Frontends bleiben unabhängig, mit `chlodwig_core` als gemeinsamer Basis.
- **Keine Performance-Optimierung** der Poll-Loop (10ms-Tick ist schon ok).
- **Kein Umzug von `setup.rs`/`window.rs`-Inhalten** — die sind außerhalb von `main.rs` und nicht Teil dieses Findings.
