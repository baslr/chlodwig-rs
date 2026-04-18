Sehr berechtigte Beobachtung – und tatsächlich differenziert zu beantworten. Lass mich erst diagnostizieren, **wo** das C-Gefühl herkommt, und dann zeigen welche Architektur bei einer AI-Agent-Chat-App wirklich Sinn ergibt.

---

## Diagnose: Woher kommt das „fühlt sich wie C an"-Gefühl?

Lass mich kurz in die verdächtigsten Stellen reingucken:

```bash
cd . && wc -l crates/*/src/*.rs | sort -rn | head -20
```

```
   31227 total
    2707 crates/chlodwig-tui/src/app.rs
    2613 crates/chlodwig-core/src/conversation.rs
    1957 crates/chlodwig-tui/src/event_loop.rs
    1937 crates/chlodwig-core/src/markdown.rs
    1747 crates/chlodwig-core/src/session.rs
    1298 crates/chlodwig-gtk/src/main.rs
    1243 crates/chlodwig-gtk/src/emoji.rs
    1206 crates/chlodwig-gtk/src/window.rs
    1086 crates/chlodwig-tools/src/websearch.rs
     898 crates/chlodwig-core/src/input_state.rs
     891 crates/chlodwig-core/src/subagent.rs
     813 crates/chlodwig-core/src/config.rs
     776 crates/chlodwig-gtk/src/render.rs
     767 crates/chlodwig-core/src/restore.rs
     741 crates/chlodwig-tools/src/grep.rs
     714 crates/chlodwig-tui/src/render.rs
     650 crates/chlodwig-gtk/src/app_state.rs
     576 crates/chlodwig-gtk/src/md_renderer.rs
     534 crates/chlodwig-tui/src/markdown.rs
```

```bash
cd . && sed -n '1,80p' crates/chlodwig-gtk/src/main.rs
```

```rust
//! Chlodwig GTK — native GUI entry point.
//!
//! This binary provides the same functionality as `chlodwig-rs` (terminal TUI)
//! but rendered in a native GTK4/Adwaita window instead of a terminal emulator.

use gtk4::prelude::*;
use gtk4::glib;
use std::cell::{Cell, RefCell};
use std::rc::Rc;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::mpsc;

use chlodwig_core::{
    ConversationEvent, ConversationState, ContentBlock, Message, Role, ToolContext,
};
use chlodwig_gtk::app_state::AppState;
use chlodwig_gtk::window;

/// Commands sent from the GTK main loop to the background conversation task.
enum BackgroundCommand {
    /// Submit a user prompt to the API.
    Prompt { text: String, pre_turn_usage: chlodwig_core::TurnUsage },
    /// Clear the conversation (reset `ConversationState.messages`).
    ClearMessages,
    /// Save the current session to disk.
    SaveSession { started_at: String, table_sorts: Vec<chlodwig_core::TableSortState>, name: Option<String> },
    /// Restore messages from a loaded session into ConversationState.
    RestoreMessages { messages: Vec<Message> },
    /// Compact the conversation history.
    Compact { instructions: Option<String> },
}

fn main() -> glib::ExitCode {
    // Extend PATH with well-known directories (MacPorts, Homebrew, Cargo, etc.)
    // so child processes (git, rg, cargo, ...) can be found in restricted
    // environments (e.g. macOS GUI launch, minimal login shells).
    chlodwig_core::enrich_path();

    // Force the Cairo GSK renderer on macOS. The default GskNglRenderer has a
    // texture-loading bug ("GLD_TEXTURE_INDEX_2D is unloadable") that makes
    // glyphs invisible. The Cairo renderer bypasses OpenGL and renders text
    // correctly via PangoCairo directly.
    chlodwig_gtk::ensure_cairo_renderer();

    // Force the CoreText backend on macOS. Pango 1.55+ with MacPorts defaults
    // to fontconfig/FreeType which maps geometric symbols (▶, →, ■) to Noto
    // Color Emoji — a color font that Cairo cannot render, making them invisible.
    // CoreText maps these symbols to system fonts (Lucida Grande, .AppleSystemUIFont)
    // that render correctly through Cairo.
    //
    // Note: Color emojis (🌻, 🔥, etc.) are not renderable with Pango 1.x +
    // PangoCairo regardless of backend — PangoCairo uses cairo_show_glyphs()
    // which has no color font support. Color emoji rendering requires Pango 2.x
    // (PangoHbFont path) or a GtkTextBuffer paintable-based approach.
    chlodwig_gtk::ensure_coretext_backend();

    // Initialize tracing
    let debug_log_path = chlodwig_core::timestamped_log_path("debug_gtk");
    if let Ok(log_file) = std::fs::File::create(&debug_log_path) {
        tracing_subscriber::fmt()
            .with_env_filter(
                tracing_subscriber::EnvFilter::from_default_env()
                    .add_directive("chlodwig_core=debug".parse().unwrap())
                    .add_directive("chlodwig_api=debug".parse().unwrap())
                    .add_directive("chlodwig_tools=debug".parse().unwrap())
                    .add_directive("chlodwig_gtk=debug".parse().unwrap())
                    .add_directive("hyper=warn".parse().unwrap())
                    .add_directive("reqwest=warn".parse().unwrap()),
            )
            .with_target(true)
            .with_ansi(false)
            .with_writer(std::sync::Mutex::new(log_file))
            .init();
    }

    tracing::info!("chlodwig-gtk starting");

    // Check for --resume flag before GTK init
    let resume_flag = std::env::args().any(|a| a == "--resume" || a == "-r");
```

```bash
cd . && grep -n "let .* = .*\.clone();" crates/chlodwig-gtk/src/main.rs | head -30
```

```
117:    let app_for_quit = app.clone();
176:        let prompt_tx_new = prompt_tx.clone();
177:        let state_new = app_state.clone();
178:        let output_buf_new = widgets.output_buffer.clone();
179:        let status_left_new = widgets.status_left_label.clone();
180:        let status_right_new = widgets.status_right_label.clone();
200:        let prompt_tx_compact = prompt_tx.clone();
208:        let prompt_tx_resume = prompt_tx.clone();
220:        let prompt_tx_sessions = prompt_tx.clone();
221:        let state_sessions = app_state.clone();
222:        let output_buf_sessions = widgets.output_buffer.clone();
223:        let output_view_sessions = widgets.output_view.clone();
224:        let output_scroll_sessions = widgets.output_scroll.clone();
225:        let viewport_cols_sessions = viewport_cols.clone();
226:        let status_left_sessions = widgets.status_left_label.clone();
227:        let status_right_sessions = widgets.status_right_label.clone();
228:        let window_for_sessions = window.clone();
229:        let session_started_at_for_sessions = session_started_at.clone();
231:            let prompt_tx = prompt_tx_sessions.clone();
232:            let state = state_sessions.clone();
233:            let output_buf = output_buf_sessions.clone();
234:            let output_view = output_view_sessions.clone();
235:            let output_scroll = output_scroll_sessions.clone();
236:            let viewport_cols = viewport_cols_sessions.clone();
237:            let status_left = status_left_sessions.clone();
238:            let status_right = status_right_sessions.clone();
239:            let window_for_minimize = window.clone();
295:        let window_for_hide = window.clone();
304:        let window_for_show = window.clone();
```

**Genau hier ist das C-Gefühl** — diese Wand aus `let x = x.clone();` vor jedem Closure. Über 100 Stück allein in dieser einen Datei. Das ist nicht die Architektur, das sind die GTK-Bindings.

```bash
cd . && grep -c "\.clone()" crates/chlodwig-gtk/src/main.rs crates/chlodwig-tui/src/event_loop.rs crates/chlodwig-core/src/conversation.rs
```

```
crates/chlodwig-gtk/src/main.rs:102
crates/chlodwig-tui/src/event_loop.rs:39
crates/chlodwig-core/src/conversation.rs:25
```

Bestätigt: das C-Gefühl konzentriert sich in **GTK**. Core und TUI sind sauberer.

---

## Was eine AI-Agent-Chat-App architektonisch braucht

Eine Agent-Chat-App ist im Grunde ein **streaming, stateful, multi-IO Loop**:

```
        ┌─────────────────────────────────────────────────────┐
        │  Domain: Conversation State + Agent Loop            │
        │  - Messages, Tools, Permissions, Compaction         │
        └─────────────────────────────────────────────────────┘
              ▲                ▲                ▲
              │                │                │
    ┌─────────┴────┐  ┌────────┴─────┐  ┌──────┴────────┐
    │  API (LLM)   │  │  Tools (FS,  │  │  UI (TUI/GTK/ │
    │  Streaming   │  │  Bash, Web)  │  │  Web/CLI)     │
    └──────────────┘  └──────────────┘  └───────────────┘
        Adapter           Adapter           Adapter
```

Daraus folgen genau **vier Architektur-Prinzipien**:

### 1. **Hexagonal / Ports & Adapters** ✅ (habt ihr)

Domain in der Mitte, alles I/O-Spezifische sind austauschbare Adapter via Traits.

```rust
// Port (in core)
pub trait ApiClient: Send + Sync { … }
pub trait Tool: Send + Sync { … }
pub trait PermissionPrompter: Send + Sync { … }

// Adapter (in api/tools/tui/gtk)
impl ApiClient for GitHubClient { … }
impl PermissionPrompter for TuiPrompter { … }
impl PermissionPrompter for GtkPrompter { … }
```

→ **Genau das macht euren Code testbar** und erlaubt euch GTK + TUI parallel.

### 2. **Event-Sourced Streaming via Channels** ✅ (habt ihr)

Domain pusht Events (`ConversationEvent`), UI konsumiert. Keine direkten Calls von Domain zu UI.

```rust
tx.send(ConversationEvent::TextDelta(s)).ok();
// UI weiß nichts von der Domain, Domain weiß nichts von der UI
```

→ Das ist **das wichtigste Pattern** für Streaming-LLM-Apps. Ohne das wird's grauenhaft.

### 3. **MVU (Model-View-Update) für die UI** ❌ (fehlt euch)

**Das ist das Pattern, das euer C-Gefühl wegmacht.**
Aus Elm / Redux / The Composable Architecture (Swift):

```rust
struct Model { … }                     // Pure data
enum Msg { Submit, KeyPress(Key), … }  // Alles was passieren kann
fn update(m: &mut Model, msg: Msg) -> Vec<Cmd> { … }  // Pure function
fn view(m: &Model) -> Vec<Widget> { … }               // Pure function
```

Statt `Rc<RefCell<State>>.clone()` × 100 hast du **eine** `update`-Funktion, die ALLE State-Änderungen macht. Die GTK-Closures werden trivial:

```rust
// VORHER (heutiger Code):
button.connect_clicked({
    let state = state.clone();
    let buf = output_buf.clone();
    let label = status_label.clone();
    let tx = prompt_tx.clone();
    move |_| {
        let mut s = state.borrow_mut();
        s.input.clear();
        buf.set_text("");
        label.set_text("Sending...");
        tx.send(/* … */).ok();
    }
});

// NACHHER (MVU):
button.connect_clicked(send_msg(Msg::Submit));
```

→ Hauptgewinn: **`main.rs` schrumpft von 1300 auf ~400 Zeilen**, alles testbar ohne GTK.

### 4. **Tool Registry mit Auto-Discovery** ⚠️ (halb)

Statt:
```rust
fn builtin_tools() -> Vec<Box<dyn Tool>> {
    vec![Box::new(BashTool), Box::new(ReadTool), Box::new(GrepTool), …]
    // Manuelle Liste, leicht zu vergessen
}
```

Mit `inventory` crate:
```rust
#[register_tool]
impl Tool for BashTool { … }
// → automatisch in der Liste, kein Eintrag nötig
```

→ Skaliert besser bei vielen Tools, weniger Reibung beim Hinzufügen.

---

## Vergleich: Heutiger Stand vs. Production Patterns

| Pattern | Status | Wo sichtbar |
|---|---|---|
| Domain-Purity (`core` ohne UI/IO) | ✅ stark | `chlodwig-core/` |
| Ports & Adapters (Traits) | ✅ stark | `ApiClient`, `Tool`, `PermissionPrompter` |
| Event-Channels (Domain → UI) | ✅ stark | `ConversationEvent` + `mpsc` |
| Snapshot-Persistence | ✅ stark | `SessionSnapshot`, save/restore |
| Strukturiertes Logging | ✅ stark | `tracing` überall |
| Tool Registry / Discovery | ⚠️ manuell | `builtin_tools()` |
| **MVU/Reducer für UI-State** | ❌ **fehlt** | GTK + TUI mutieren direkt |
| **Cmd/Effect Pattern** | ❌ fehlt | Side effects inline in Closures |
| Composite Templates (XML UI) | ❌ fehlt | UI komplett in Code |
| Widget-Bundle-Structs | ⚠️ teilweise | Manche `…Widgets` Structs schon, viele lose `Label`s |

---

## Das ist die Architektur, die ich konkret empfehle

```
┌──────────────────────────────────────────────────────────────────┐
│                   chlodwig-core (Domain)                         │
│  ─────────────────────────────────────────────────────────────   │
│  • Pure data: Message, ConversationState, Session                │
│  • Ports: trait ApiClient, trait Tool, trait Prompter            │
│  • Agent loop: conversation_loop() → emits ConversationEvent     │
│  • NEW: Reducer modules (per UI-Concern)                         │
│      mod input_reducer  { Model, Msg, update, view_data }        │
│      mod output_reducer { … }                                    │
│      mod modal_reducer  { … }                                    │
└──────────────────────────────────────────────────────────────────┘
       ▲                ▲                ▲                ▲
       │ implements     │ implements     │ uses           │ uses
       │                │                │                │
┌──────┴────┐    ┌──────┴────┐    ┌─────┴─────┐    ┌────┴────┐
│chlodwig-  │    │chlodwig-  │    │chlodwig-  │    │chlodwig-│
│  api      │    │  tools    │    │   tui     │    │   gtk   │
│           │    │           │    │           │    │         │
│GitHub     │    │Bash,Read, │    │ratatui    │    │GTK4     │
│Client     │    │WebFetch…  │    │view of    │    │view of  │
│           │    │           │    │reducer    │    │reducer  │
└───────────┘    └───────────┘    └───────────┘    └─────────┘
   Adapter          Adapter         Thin Shell      Thin Shell
```

**Schlüsseländerung gegenüber heute:** Reducer-Module **in core**, die TUI und GTK **gemeinsam** nutzen. Heute haben beide UIs separate State-Mutation-Logik (`app.rs` 2700 Zeilen + `app_state.rs` 650 Zeilen + `event_loop.rs` 1957 Zeilen + `main.rs` 1298 Zeilen). Mit MVU-Reducern in core: **eine** Reducer-Implementierung, die TUI-View **und** GTK-View teilen.

---

## Konkreter Migrationspfad (inkrementell, nicht Big Bang)

Ihr **müsst nicht alles umschreiben**. Vorschlag in 5 Stufen:

1. **Stufe 1 (1-2 Tage):** Eine Reducer-PoC für `UserQuestion`-Modal (klein, abgeschlossen). Beweis dass das Pattern in eurem Code funktioniert.
2. **Stufe 2 (3-5 Tage):** `InputState` in core wird voll-MVU (heute schon halb dort). TUI + GTK switchen auf den gemeinsamen Reducer.
3. **Stufe 3 (1 Woche):** Widget-Bundle-Refactor in GTK. `Rc<RefCell<…>>`-Cloning kapseln in `OutputArea`, `InputArea`, `StatusBar` Structs.
4. **Stufe 4 (1 Woche):** Output-Reducer (`DisplayBlock`-Liste). Damit verschwindet die meiste Streaming-Logik aus `event_loop.rs`/`main.rs`.
5. **Stufe 5 (optional):** GTK Composite Templates → Layout in XML, nur noch Logik im Code.

**Nach Stufe 1+2+3** hättet ihr schon ~50% des C-Gefühls weg, ohne viel Risiko.

---

**Mein Vorschlag also unverändert vom letzten Mal**: Lass mich Stufe 1 als kleinen, ausführbaren PoC bauen — den **`UserQuestion`-Modal-Reducer**.

Konkret: ich würde
- `chlodwig-core/src/reducers/user_question.rs` neu anlegen mit `Model`, `Msg`, `update`, Tests
- Den heutigen TUI-Code in `app.rs` (für `pending_user_question`) auf den Reducer umstellen
- Beweisen dass **TUI-Tests den Reducer ohne ratatui** aufrufen können
- `cargo test --workspace` muss grün bleiben

Das wären ~200 Zeilen neuer Code + ~50 Zeilen ersetzter Code, voll TDD. Soll ich loslegen?
