# claude-unpacked

> **[Legal Disclaimer & Fair Use Notice](DISCLAIMER.md)** -- This project is not affiliated with or endorsed by Anthropic.

Reverse-Engineering-Toolkit und Rust-Reimplementierung von Anthropics **Claude Code CLI** (`@anthropic-ai/claude-code`).

Dieses Projekt extrahiert, formatiert, zerlegt und annotiert den proprietaeren, minifizierten JavaScript-Bundle von Claude Code (v2.1.87 / v2.1.88) und macht die interne Architektur sichtbar. Zusaetzlich enthaelt es **claude-rs** -- eine von Grund auf neu geschriebene Rust-CLI, die den Kern von Claude Code (Conversation-Loop, Tool-Execution, TUI, API-Streaming) reimplementiert.

---

## Inhaltsverzeichnis

- [Features](#features)
- [Projektstruktur](#projektstruktur)
- [Voraussetzungen](#voraussetzungen)
- [Installation](#installation)
- [Reverse-Engineering Pipeline](#reverse-engineering-pipeline)
- [Pipeline-Schritte im Detail](#pipeline-schritte-im-detail)
- [Generierte Artefakte](#generierte-artefakte)
- [Architektur des Original-Bundles](#architektur-des-original-bundles)
- [claude-rs -- Rust-Reimplementierung](#claude-rs----rust-reimplementierung)
- [Tests](#tests)
- [Scripts & Launcher](#scripts--launcher)
- [Konfiguration](#konfiguration)
- [Versionsdiffs (2.1.88 vs 2.1.87)](#versionsdiffs-2188-vs-2187)
- [Native Binaries](#native-binaries)
- [Umgebungsvariablen](#umgebungsvariablen)
- [Technologie-Stack](#technologie-stack)

---

## Features

### Reverse-Engineering Toolkit (JavaScript/Bun)

- **Bundle-Extraktion** -- Extrahiert den minifizierten JS-Bundle (~12 MB, ~16.600 Zeilen) aus der kompilierten Binary
- **Formatierung** -- Expandiert den Code von ~16K auf ~523K lesbare Zeilen via Biome/Prettier
- **Modul-Splitting** -- Zerlegt den monolithischen Bundle in **920+ einzelne Moduldateien** (vendor/, sections/, chunks/, core/)
- **Symbol-Mapping** -- Mappt **6.800+ obfuskierte Identifier** (z.B. `I38`, `M$`, `gy4`) auf lesbare Namen (z.B. `REPL`, `CursorModel`, `useInput`)
- **Dependency-Graph** -- Baut einen Abhaengigkeitsgraphen mit **3.273 Knoten** und **13.158 Kanten**
- **Call-Graph** -- Funktions-Level Analyse mit **14.025 Funktionen** und **27.593 Call-Edges**
- **React-Inventar** -- Identifiziert und labelt **874 React-Komponenten**
- **Interaktive Visualisierungen** -- HTML-Dateien mit navigierbaren Dependency- und Call-Graphen
- **Zonen-Kartierung** -- Unterteilt den Code in 8 thematische Architektur-Zonen
- **Versions-Vergleich** -- Detaillierter Diff zwischen v2.1.87 und v2.1.88
- **14-Schritt-Pipeline** -- Vollautomatisierte Transformation via `pipeline.sh`

### claude-rs (Rust-Reimplementierung)

- **Anthropic API Client** -- SSE-Streaming via reqwest mit Retry-Logik (429/529)
- **7 Tool-Implementierungen** -- Bash, Read, Write, Edit, Glob, Grep, ListDir
- **Terminal UI** -- Ratatui-basierte TUI mit Markdown-Rendering und Syntax-Highlighting
- **Conversation-Loop** -- Vollstaendige Agentic-Loop mit Tool-Execution und Compaction
- **Permission-System** -- Allow / Deny / AllowAlways mit Auto-Approve-Modus
- **Striktes TDD** -- Jede Funktion hat Tests, 11 dokumentierte Known Gotchas

---

## Projektstruktur

```
claude-unpacked/
|
|-- cli_bundle.js                    # Original minifizierter Bundle (12 MB, v2.1.87)
|-- pipeline.sh                      # 14-Schritt Reverse-Engineering Pipeline
|-- claude-unpacked.sh               # Launcher -> src/run.js (gepatchte Version)
|-- claude-split.sh                  # Launcher -> src/run_split.js (gesplittete Version)
|
|-- package.json                     # Dev-Dependencies (Biome, Bun, Vitest)
|-- tsconfig.json                    # TypeScript-Config (ESNext, strict)
|-- biome.json                       # Formatter-Config (2 Spaces, 120 Breite)
|-- vitest.config.ts                 # Test-Config (globals, 15s Timeout)
|
|-- src/
|   |-- cli_bundle.js                # Roh-Extrakt aus der Binary (12 MB)
|   |-- cli_patched.js               # Fuer Bun-Kompatibilitaet gepatcht
|   |-- cli_clean.js                 # Bereinigte Version
|   |-- cli_formatted.js             # Biome-formatiert (17 MB, 523K Zeilen)
|   |-- cli_split.js                 # Gesplittet mit eval()-Referenzen (10 MB)
|   |
|   |-- run.js                       # Loader fuer cli_patched.js
|   |-- run_formatted.js             # Loader fuer cli_formatted.js
|   |-- run_split.js                 # Loader fuer cli_split.js
|   |
|   |-- zone-map.json                # 8 Architektur-Zonen
|   |-- name-map.json                # 6.800+ Hash->Name Mappings
|   |-- dep-graph.json               # 3.273 Knoten, 13.158 Kanten
|   |-- dep-graph.html               # Interaktive Dependency-Visualisierung
|   |-- call-graph.json              # 14.025 Funktionen, 27.593 Edges
|   |-- call-graph.html              # Interaktive Call-Graph-Visualisierung
|   |-- react-components.json        # 874 React-Komponenten
|   |
|   |-- vendor/                      # 425 extrahierte Vendor-Module (36 Kategorien)
|   |   |-- ajv/                     # JSON-Schema-Validierung
|   |   |-- aws/                     # AWS SDK Module
|   |   |-- react/                   # React/Ink Framework
|   |   |-- proto/                   # Protobuf
|   |   |-- hljs/                    # highlight.js
|   |   |-- grpc/                    # gRPC
|   |   |-- yaml/                    # YAML Parser
|   |   +-- ...                      # 29 weitere Kategorien
|   |
|   |-- sections/                    # 473 extrahierte G()-Modul-Bodies
|   |-- chunks/                      # 20 extrahierte Chunk-Dateien
|   |-- core/                        # 2 Core-Module (extension.js, sandbox.js)
|   +-- readable/                    # Annotierte, menschenlesbare Version
|
|-- 2.1.88/                          # Claude Code v2.1.88
|   |-- cli.js                       # Minifizierter Bundle (12 MB)
|   |-- cli.js.map                   # Source Map (57 MB)
|   +-- cli_formatted.js             # Formatierte Version (17 MB, 552K Zeilen)
|
|-- scripts/                         # 12 Analyse- und Transformations-Skripte
|   |-- extract-chunks.js            # d()-Module + G()-Bodies extrahieren
|   |-- zone-index.js                # 8 Zonen kartieren
|   |-- name-map.js                  # J_()-Export-Namen extrahieren
|   |-- dep-graph.js                 # G()-Abhaengigkeitsgraph bauen
|   |-- rename-modules.js            # Hash-Dateien -> lesbare Namen
|   |-- auto-label.js                # Heuristische G()-Block-Benennung
|   |-- react-components.js          # React-Komponenten identifizieren
|   |-- label-components.js          # React-Komponenten labeln
|   |-- gen-dep-viz.js               # Dep-Graph HTML generieren
|   |-- call-graph.js                # Funktions-Level Call-Graph
|   |-- gen-call-viz.js              # Call-Graph HTML generieren
|   +-- rename-symbols.js            # Symbol-Umbenennung
|
|-- tests/
|   +-- bundle.test.ts               # Umfassende Testsuite (337 Zeilen, 8 Describe-Bloecke)
|
|-- docs/
|   +-- repl-input-architecture.md   # REPL-Input-Pipeline Dokumentation
|
|-- native-binaries/                 # Native .node Addons aus Claude Code
|   |-- audio-capture.node           # Audio-Aufnahme (451 KB)
|   |-- computer-use-input.node      # Computer Use Input (857 KB)
|   |-- computer-use-swift.node      # Computer Use macOS Swift (439 KB)
|   +-- image-processor.node         # Bildverarbeitung (1.4 MB)
|
|-- native-modules/                  # JS-Wrapper fuer native Binaries
|
+-- claude-rs/                       # Rust-Reimplementierung (PoC)
    |-- CLAUDE.md                    # Entwicklungsleitfaden (TDD, Gotchas)
    |-- Cargo.toml                   # Workspace-Definition (5 Crates)
    +-- crates/
        |-- claude-core/             # Shared Types, Conversation-Loop, SSE
        |-- claude-api/              # Anthropic API Client (SSE-Streaming)
        |-- claude-tools/            # 7 Tool-Implementierungen
        |-- claude-tui/              # Terminal UI (ratatui)
        +-- claude-cli/              # Binary Entry Point
```

---

## Voraussetzungen

### Reverse-Engineering Toolkit

| Tool | Version | Zweck |
|------|---------|-------|
| [Bun](https://bun.sh) | >= 1.0 | Primaere Runtime fuer alle Skripte |
| [Node.js](https://nodejs.org) | >= 18 | Fallback, wird von einigen Pipeline-Schritten genutzt |
| [Biome](https://biomejs.dev) | ^2.4.9 | Code-Formatierung (via `devDependencies`) |
| [Vitest](https://vitest.dev) | ^4.1.2 | Test-Framework (via `devDependencies`) |
| TypeScript | ^5 | Typisierung fuer Test-Dateien (via `peerDependencies`) |

### claude-rs (Rust)

| Tool | Version | Zweck |
|------|---------|-------|
| [Rust](https://www.rust-lang.org/tools/install) | Edition 2021 | Compiler + Cargo |
| `ANTHROPIC_API_KEY` | -- | Anthropic API-Key (Umgebungsvariable) |

---

## Installation

```bash
# Repository klonen
git clone <repo-url>
cd claude-unpacked

# JavaScript-Abhaengigkeiten installieren
bun install

# (Optional) Rust-Reimplementierung bauen
cd claude-rs
cargo build --release
cd ..
```

---

## Reverse-Engineering Pipeline

Die vollstaendige Pipeline wird mit einem Befehl ausgefuehrt:

```bash
./pipeline.sh
```

**Voraussetzung:** `src/cli_formatted.js` muss vorhanden sein (aus der Binary extrahiert und mit Biome formatiert).

**Ergebnis:** `src/cli_split.js` + alle Metadaten-JSONs + extrahierte Moduldateien.

### Pipeline-Ablauf

```
cli_bundle.js (12 MB, minifiziert)
    |
    v  [Biome formatieren]
cli_formatted.js (17 MB, 523K Zeilen)
    |
    v  [14-Schritt Pipeline]
    |
    |-- cli_split.js          Gesplitteter Bundle mit eval()-Referenzen
    |-- vendor/               425 Vendor-Module in 36 Kategorien
    |-- sections/             473 G()-Modul-Bodies
    |-- chunks/               20 Chunk-Dateien (cron, repl, slash-command, ...)
    |-- core/                 2 Core-Module
    |-- zone-map.json         8 Architektur-Zonen
    |-- name-map.json         6.800+ Symbol-Mappings
    |-- dep-graph.json        Abhaengigkeitsgraph
    |-- dep-graph.html        Interaktive Visualisierung
    |-- call-graph.json       Funktions-Level Call-Graph
    |-- call-graph.html       Interaktive Visualisierung
    +-- react-components.json 874 identifizierte Komponenten
```

---

## Pipeline-Schritte im Detail

| # | Schritt | Skript | Beschreibung |
|---|---------|--------|-------------|
| 1 | **Clean** | -- | Generierte Dateien entfernen |
| 2 | **Extract** | `extract-chunks.js` | `d()`-Module (Vendor-Libs) und `G()`-Bodies (App-Module) aus dem monolithischen Bundle extrahieren. Erzeugt `cli_split.js` mit `eval(require("fs").readFileSync(...))` Referenzen |
| 3 | **Zone Index** | `zone-index.js` | Code in 8 thematische Zonen kartieren -> `zone-map.json` |
| 4 | **Name Map (1. Pass)** | `name-map.js` | `J_()`-Export-Namen parsen -> `name-map.json` mit Hash->Name Mappings |
| 5 | **Dep Graph (1. Pass)** | `dep-graph.js` | `G()`-Inter-Modul-Abhaengigkeiten analysieren -> `dep-graph.json` |
| 6 | **Rename** | `rename-modules.js` | Hash-Dateinamen durch lesbare Namen ersetzen |
| 7 | **Regenerate (2. Pass)** | zone-index + name-map + dep-graph | Metadaten mit den neuen lesbaren Namen aktualisieren |
| 8 | **Auto-Label** | `auto-label.js` | G()-Bloecke mit Heuristiken benennen (Pattern-Matching auf Exports, Imports, Funktionsnamen) |
| 9 | **React Components** | `react-components.js` | React-Komponenten identifizieren durch Analyse von JSX, Hooks, Props -> `react-components.json` |
| 10 | **Label Components** | `label-components.js` | React-Komponenten mit lesbaren Namen versehen |
| 11 | **Dep-Graph Viz** | `gen-dep-viz.js` | Interaktive HTML-Visualisierung des Dependency-Graphen |
| 12 | **Call-Graph** | `call-graph.js` | Funktions-Level Call-Graph bauen (14K Funktionen, 27K Edges) |
| 13 | **Call-Graph Viz** | `gen-call-viz.js` | Interaktive HTML-Visualisierung des Call-Graphen |
| 14 | **Verify** | -- | Runtime-Verifikation (`--version`, `--help`, `agents`) + `bun test` |

### Verifikation

Die Pipeline verifiziert, dass der gesplittete Bundle **identische Ausgabe** wie das Original produziert:

```bash
bun src/run_split.js --version   # => "2.1.87 (Claude Code)"
bun src/run_split.js --help      # => identisch mit Original
bun src/run_split.js agents      # => identisch mit Original
```

---

## Generierte Artefakte

### zone-map.json

Unterteilt die 523K Zeilen in 8 lueckenlose Zonen:

| Zone | Name | Inhalt |
|------|------|--------|
| 1 | **RUNTIME & SDK** | Core-Runtime, ESModule-System, SDK-Primitives |
| 2 | **VALIDATION & CONFIG** | Zod-Schemas, Konfiguration, Settings |
| 3 | **CLOUD PROVIDERS & AUTH** | AWS SDK, Google Auth, XAA Auth, OAuth |
| 4 | **UI FRAMEWORK & RENDERING** | React/Ink Framework, Terminal-Rendering, ANSI |
| 5 | **TOOLS & PERMISSIONS** | Alle Built-in Tools (Bash, Read, Write, Edit, Glob, Grep, ...), Permission-System |
| 6 | **CONVERSATION & COMMANDS** | Conversation-Management, Message-Handling, Commands |
| 7 | **SYSTEM PROMPT, SESSION & APP** | System-Prompt-Assembly, Session-Management, App-State |
| 8 | **REPL, SKILLS & CLI ENTRY** | REPL-Loop (2.331 Zeilen), Skills/Slash-Commands, CLI-Entry |

### name-map.json

**6.800+ Eintraege** mit Mappings von obfuskierten Hashes zu lesbaren Namen:

```json
{
  "I38": "REPL",
  "M$": "CursorModel",
  "gy4": "useInput",
  "B4": "TextInput",
  "tG_": "InternalApp"
}
```

Label-Typen:
- `init(...)` -- Initialisierungs-Bloecke
- `deps(...)` -- Abhaengigkeits-Gruppen
- `block(...)` -- Benannte Code-Bloecke
- `refs(...)` -- Referenz-Gruppen
- `component(...)` -- React-Komponenten
- `telemetry(...)` -- Telemetrie-Module

### dep-graph.json

- **3.273 Knoten** (Module)
- **13.158 Kanten** (Abhaengigkeiten)
- Zonen-Zusammenfassung fuer alle 8 Zonen
- Cross-Zone-Edges fuer Architektur-Analyse

### call-graph.json

- **14.025 Funktionen**
- **27.593 Call-Edges**
- Hot-Path-Analyse, Dead-Code-Erkennung, Zyklen-Detektion

### react-components.json

- **874 identifizierte React-Komponenten**
- **70%+ mit lesbaren Labels** versehen
- Bekannte Komponenten: `App`, `DiffDialog`, `Doctor`, `REPL`, etc.

---

## Architektur des Original-Bundles

### Modul-System

Claude Code verwendet ein eigenes Modul-System innerhalb des monolithischen Bundles:

- **`d(id, factory)`** -- Definiert ein Modul (hauptsaechlich Vendor-Libraries wie AWS SDK, React, Protobuf)
- **`G(id, deps, factory)`** -- Lazy-initialisiertes Applikationsmodul mit Abhaengigkeitsinjektion
- **`J_(id, exports)`** -- Exportiert benannte Symbole aus einem Modul

### REPL-Input-Pipeline

Die Texteingabe durchlaeuft eine 7-stufige Pipeline (dokumentiert in `docs/repl-input-architecture.md`):

```
process.stdin (Raw TTY)
  -> tG_ (InternalApp) handleReadable
    -> Zdq() Keypress-Parser (Tokenizer + State Machine)
      -> qh4() Event-Dispatcher
        -> InputEvent aus Raw-Keypress
          -> internal_eventEmitter.emit("input", InputEvent)
            -> useInput Hook (gy4)
              -> TextInput Handler-Chain -> M$ Cursor-Modell
```

### Cursor-Modell (M$ Klasse)

Immutables Cursor-Modell -- jede Operation gibt eine neue Instanz zurueck:

- **Graphem-aware Navigation** via `Intl.Segmenter`
- **Emacs-Keybindings**: Ctrl+A/B/D/E/F/H/K/N/P/U/W/Y, Meta+B/D/F/Y
- **Vim-Mode**: Vollstaendiger Command State Machine mit Motions (`h/j/k/l/w/W/e/E/b/B/0/$`), Operators (`d/c/y`), Text Objects (`iw/aw/i"/a"/i(/a(`)
- **Kill Ring**: Emacs-Style Clipboard mit Rotation (max 10 Eintraege)
- **Bracketed Paste Mode** mit Bild-Erkennung (macOS Clipboard + Screenshots)

### Vendor-Libraries (36 Kategorien)

```
ajv, aws, color, commander, crypto, dom, electron, emoji, encoding,
entities, es, events, fs, gauth, glob, grpc, hljs, http, ignore,
libc, log, lru, lsp, otel, parse5, proto, qr, react, retry,
semver, sharp, tslib, uri, xml, xmlbuilder, xss, yaml
```

### Telemetrie

- `tengu_*` Events via OpenTelemetry
- A/B-Test Experiments (Codenames: `amber_stoat`, `dunwich_bell`, etc.)
- 15 neue Events in v2.1.88, 6 entfernt

---

## claude-rs -- Rust-Reimplementierung

Proof-of-Concept einer vollstaendigen Claude Code CLI in Rust.

### Architektur

```
claude-cli (Binary)
    |
    +-- claude-core     Shared Types, Conversation-Loop, SSE-Events, Compaction
    +-- claude-api      Anthropic API Client mit SSE-Streaming (reqwest)
    +-- claude-tools    7 Tool-Implementierungen
    +-- claude-tui      Terminal UI (ratatui + crossterm)
```

Die Crates `api`, `tools` und `tui` sind **voneinander unabhaengig** -- nur `cli` bindet alles zusammen.

### Crate-Details

#### claude-core

- **Messages** -- Serde-serialisierbare Nachrichtentypen (User, Assistant, Tool-Use, Tool-Result)
- **Conversation-Loop** -- Agentic-Loop: API-Call -> Tool-Use erkennen -> Tools ausfuehren -> Ergebnis zurueckfuettern -> wiederholen
- **SSE-Event-Handling** -- Parst `message_start`, `content_block_start/delta/stop`, `message_delta/stop`, `ping`, `error`
- **Compaction** -- Bei >160K Tokens wird die History ueber einen separaten API-Call zusammengefasst
- **Permissions** -- `PermissionPrompter` Trait mit Allow/Deny/AllowAlways

#### claude-api

- **POST `/v1/messages`** mit `stream: true`
- **SSE-Streaming** via reqwest mit Chunked-Response-Parsing
- **Retry-Logik** -- HTTP 429 (Rate Limited) und 529 (Overloaded) mit exponentiellem Backoff (max 3 Retries)
- **Konfigurierbarer Base-URL** -- `ANTHROPIC_BASE_URL` fuer Proxies (z.B. GitHub Models)
- **Index-basierte Block-Akkumulation** -- `HashMap<u32, BlockAcc>` fuer korrekte Handhabung interleaved SSE-Blocks

#### claude-tools

| Tool | Beschreibung |
|------|-------------|
| `Bash` | Shell-Kommando-Ausfuehrung mit Timeout |
| `Read` | Datei lesen (mit optionalem Offset/Limit) |
| `Write` | Datei schreiben |
| `Edit` | Exakter String-Replace in Dateien |
| `Glob` | Datei-Pattern-Matching |
| `Grep` | Regex-Suche in Dateien |
| `ListDir` | Verzeichnis-Listing |

Tools mit `is_concurrent() = true` werden parallel via `futures::join_all` ausgefuehrt.

#### claude-tui

- **Ratatui + Crossterm** basierte Terminal-UI
- **Markdown-Rendering** mit `pulldown-cmark`
- **Syntax-Highlighting** mit `syntect`
- **Unicode-korrekte Darstellung** via `unicode-width` (CJK, Emojis = 2 Spalten)
- **Scroll-Anchoring** -- Bei manuellem Scroll wird die Position fixiert
- **Lazy Redraw** -- Nur bei `needs_redraw`, nie im Idle
- **Trackpad-Event-Drain** -- Innere Drain-Loop verhindert CPU-Busy-Loop bei Scroll-Gesten

### Benutzung

```bash
cd claude-rs

# Alle Tests ausfuehren
cargo test --workspace

# Release Build
cargo build --release

# TUI starten
ANTHROPIC_API_KEY=sk-... cargo run --release

# Headless-Modus (einzelne Anfrage)
ANTHROPIC_API_KEY=sk-... cargo run --release -- --print "Erklaere Rust Ownership"

# Permissions ueberspringen (gefaehrlich)
cargo run --release -- --dangerously-skip-permissions
```

### Known Gotchas

Das Projekt dokumentiert 11 Gotchas, die aus echten Bugs gelernt wurden (siehe `claude-rs/CLAUDE.md`):

1. **UTF-8 Input** -- `String::insert()`/`remove()` brauchen Byte-Indices, nicht Char-Indices
2. **Interleaved SSE Blocks** -- GitHub API sendet mehrere `ContentBlockStart` vor `ContentBlockStop`
3. **`[DONE]` Terminator** -- Muss vor JSON-Parse gefiltert werden
4. **Mouse-Move Events** -- Duerfen keinen Redraw triggern (sonst 100% CPU)
5. **Scroll-Anchoring** -- Bei Verlassen von Auto-Scroll muss die aktuelle Position fixiert werden
6. **Leere Tool-Namen** -- Interleaved Blocks koennen leere Eintraege erzeugen
7. **Tracing Crate-Namen** -- Rust nutzt Underscores (`claude_core`), nicht Hyphens
8. **Trackpad-Event-Flooding** -- Hunderte Events pro Geste, innere Drain-Loop noetig
9. **Ghost-Artefakte** -- `terminal.clear()` vor jedem `terminal.draw()` als Fix
10. **`continue` in Drain-Loop** -- Ueberspringt die `poll(0ms)` Break-Pruefung
11. **`chars().count()` != Display-Width** -- CJK/Emojis brauchen `unicode-width`

---

## Tests

### JavaScript (Vitest)

```bash
bun test
```

Die Testsuite (`tests/bundle.test.ts`, 337 Zeilen) prueft in 8 Describe-Bloecken:

| Describe-Block | Prueft |
|---------------|--------|
| `formatted bundle` | Version, Help, Agents -- identisch mit Original |
| `split bundle` | Version, Help, Agents -- identisch mit Original |
| `formatted bundle file integrity` | Dateigroesse >10 MB, Zeilenanzahl, Tool-Definitionen (Read, Bash, Edit, Write, Glob, Grep, Agent, WebFetch, WebSearch), native Module, Build-Metadaten |
| `split bundle file integrity` | Kleiner als Formatted, Vendor-Extraktion, eval()-Referenzen, Sections |
| `zone markers` | Alle 8 Zonen vorhanden und in korrekter Reihenfolge |
| `zone-map.json` | 8 Zonen, lueckenlose Abdeckung, Exports/Functions/Classes pro Zone |
| `name-map.json` | 5.000+ Symbole, Schluessel-Symbole (REPL, authLogin, main, scanForSecrets), 3.000+ Auto-Labels |
| `dep-graph.json` | 3.000+ Knoten, 10.000+ Kanten, 8 Zonen, Cross-Zone-Edges |
| `react-components.json` | 500+ Komponenten, bekannte UI-Komponenten, 70%+ Labeling-Quote |

### Rust (cargo test)

```bash
cd claude-rs
cargo test --workspace
```

| Crate | Testfokus |
|-------|-----------|
| `claude-core` | Conversation-Loop (20+ Tests): Simple Text, Tool-Use-Loops, Permission Denied, Interleaved Blocks, Parallel Tools, Split JSON Deltas, Thinking Blocks, Usage Events, Compaction, Retry |
| `claude-core/messages` | Serde-Roundtrip fuer alle Message-Typen |
| `claude-api` | SSE-Parser, `[DONE]` Handling |
| `claude-tools` | Tool-Verhalten, Edge Cases (leere Dateien, Permissions, UTF-8) |
| `claude-tui` | 12 Test-Dateien: Clear, Ghost-Artefakte, History, Input-UTF-8, Requests, Scroll, Scrollbar, Spinner, Stream-Chunks, Tabs/Focus, Timestamps, Wrap/Unicode |

Test-Infrastruktur: `wiremock` (API-Mocking), `tempfile` (Filesystem), `pretty_assertions` (Diff-Output).

---

## Scripts & Launcher

### Shell-Launcher

| Script | Beschreibung |
|--------|-------------|
| `pipeline.sh` | Vollstaendige 14-Schritt RE-Pipeline |
| `claude-unpacked.sh` | Startet den gepatchten Original-Bundle via Bun |
| `claude-split.sh` | Startet den gesplitteten Bundle via Bun |

### Einzelne Analyse-Skripte

Jedes Skript kann einzeln ausgefuehrt werden:

```bash
bun scripts/extract-chunks.js     # Module extrahieren
bun scripts/zone-index.js         # Zonen kartieren
bun scripts/name-map.js           # Namen extrahieren
bun scripts/dep-graph.js          # Abhaengigkeitsgraph bauen
bun scripts/rename-modules.js     # Dateien umbenennen
bun scripts/auto-label.js         # Heuristische Labels
bun scripts/react-components.js   # React-Komponenten finden
bun scripts/label-components.js   # Komponenten labeln
bun scripts/gen-dep-viz.js        # Dep-Graph HTML
bun scripts/call-graph.js         # Call-Graph bauen
bun scripts/gen-call-viz.js       # Call-Graph HTML
bun scripts/rename-symbols.js     # Symbole umbenennen
```

### Run-Varianten

```bash
bun src/run.js --version           # Gepatchter Original-Bundle
bun src/run_formatted.js --version # Formatierte Version
bun src/run_split.js --version     # Gesplittete Version
```

---

## Konfiguration

### package.json

```json
{
  "name": "claude-unpacked",
  "private": true,
  "devDependencies": {
    "@biomejs/biome": "^2.4.9",
    "@types/bun": "latest",
    "vitest": "^4.1.2"
  },
  "peerDependencies": {
    "typescript": "^5"
  }
}
```

### biome.json

- **Indent:** 2 Spaces
- **Zeilenbreite:** 120 Zeichen
- **Quotes:** Double Quotes
- **Semicolons:** Always
- **Max File Size:** 16 MB (noetig fuer den 17 MB Bundle)

### tsconfig.json

- **Target/Module:** ESNext
- **Module Resolution:** Bundler
- **Strict Mode:** Aktiviert
- **JSX:** react-jsx

### vitest.config.ts

- **Globals:** Aktiviert (kein Import von `describe`/`it`/`expect` noetig)
- **Test Timeout:** 15 Sekunden (Bundle-Starts brauchen Zeit)

---

## Versionsdiffs (2.1.88 vs 2.1.87)

Detaillierte Vergleichsdokumente:

- `changelog_2.1.88_vs_2.1.87.md` -- Zusammenfassung der Aenderungen
- `diff_2.1.88_vs_2.1.87_full.md` -- Vollstaendiger Diff-Report

### Neue Features in 2.1.88

- **CA-Zertifikate** -- `CURL_CA_BUNDLE`, `NODE_EXTRA_CA_CERTS`, `SSL_CERT_FILE`, `REQUESTS_CA_BUNDLE`
- **Permissions** -- `PermissionDenied`, `permission_retry` (robustere Fehlerbehandlung)
- **Vim-Mode** -- Neue Scroll-Befehle (`fullPageUp/Down`, `halfPageUp/Down`, `lineUp/Down`)
- **Terminal-Sidebar** -- `showStatusInTerminalTab`, `tabStatus`, `statusColor`
- **PR-Automation** -- `autofix-pr`, `background-pr`, `cherry-pick`
- **Memory Survey** -- Neues Feature fuer CLAUDE.md-System
- **Token-Management** -- `max_output_tokens_escalate` (dynamisches Output-Limit)
- **Tmux** -- `selection-copy`, `tmux-buffer`, `tmux-mouse-hint`
- **Auth** -- `claude auth login` (umbenannt von `claude login`)

### Telemetrie-Aenderungen

- **15 neue Events** hinzugefuegt (u.a. `tengu_remote_agent`, `tengu_terminal_sidebar`, `tengu_memory_survey_event`)
- **6 Experiments entfernt** (u.a. `tengu_borax_j4w`, `tengu_quiet_hollow`)

---

## Native Binaries

Aus dem Claude Code Bundle extrahierte native `.node` Addons:

| Binary | Groesse | Funktion |
|--------|---------|----------|
| `audio-capture.node` | 451 KB | Audio-/Spracheingabe |
| `computer-use-input.node` | 857 KB | Computer Use (Input-Simulation) |
| `computer-use-swift.node` | 439 KB | Computer Use (macOS native, Swift) |
| `image-processor.node` | 1.4 MB | Bildverarbeitung / Screenshots |

JS-Wrapper befinden sich in `native-modules/`.

---

## Umgebungsvariablen

### claude-rs

| Variable | Pflicht | Beschreibung |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Ja | Anthropic API-Key (alternativ: `--api-key` Flag) |
| `ANTHROPIC_BASE_URL` | Nein | Base-URL Override (z.B. fuer GitHub Models Proxy) |
| `NO_COLOR` | Nein | Farbausgabe deaktivieren |

### Original Claude Code (via RE entdeckt)

| Variable | Beschreibung |
|----------|-------------|
| `ANTHROPIC_API_KEY` | API-Key |
| `CURL_CA_BUNDLE` | Custom CA-Zertifikate (neu in 2.1.88) |
| `NODE_EXTRA_CA_CERTS` | Node.js Extra-CA-Zertifikate |
| `SSL_CERT_FILE` | SSL-Zertifikatsdatei |
| `REQUESTS_CA_BUNDLE` | Requests CA-Bundle |

---

## Technologie-Stack

### Reverse-Engineering Toolkit

| Technologie | Version | Zweck |
|-------------|---------|-------|
| Bun | >= 1.0 | Primaere JavaScript-Runtime |
| Biome | 2.4.9 | Code-Formatierung (bis 16 MB Dateien) |
| Prettier | 3.8.1 | Formatierung fuer noch groessere Dateien |
| Vitest | 4.1.2 | Test-Framework |
| TypeScript | 5.x | Typisierung fuer Tests |

### claude-rs (Rust)

| Technologie | Version | Zweck |
|-------------|---------|-------|
| Tokio | 1.x | Async Runtime (full features) |
| Reqwest | 0.12 | HTTP Client (streaming, JSON) |
| Ratatui | 0.29 | Terminal UI Framework |
| Crossterm | 0.28 | Terminal-Backend |
| Clap | 4.x | CLI-Argument-Parsing (derive) |
| Serde / Serde JSON | 1.x | Serialisierung |
| pulldown-cmark | 0.13 | Markdown-Rendering |
| Syntect | 5.3 | Syntax-Highlighting |
| unicode-width | 0.2 | Unicode-Breitenberechnung |
| Wiremock | 0.6 | API-Mocking (Tests) |
| Thiserror | 2.x | Error-Typen |
| Anyhow | 1.x | Error-Handling |
| Tracing | 0.1 | Logging/Tracing |
| Futures | 0.3 | Async-Utilities |

### Analysiertes Original (Claude Code)

| Technologie | Zweck |
|-------------|-------|
| React / Ink | Terminal UI Framework |
| Zod | Schema-Validierung |
| AWS SDK | Cloud-Services |
| gRPC / Protobuf | Service-Kommunikation |
| highlight.js | Syntax-Highlighting |
| OpenTelemetry | Observability / Telemetrie |
| Undici | HTTP Client (eingebettet ab 2.1.88) |

---

## Architektur-Muster

### AST-freies Parsing

Alle Analyse-Skripte arbeiten mit **Regex auf formatiertem Source** statt mit einem AST-Parser. Dieser pragmatische Ansatz wurde gewaehlt, weil:

- Die Datei 523K Zeilen hat (AST-Parser waeren extrem langsam)
- Der Code bereits von Biome sauber formatiert ist
- Zeilenbasierte Muster zuverlaessig genug fuer die Extraktion sind

### Multi-Pass Enrichment

Die Pipeline nutzt mehrere Durchlaeufe:

1. **Extraktion** -- Roh-Module aus dem Bundle
2. **Benennung** -- Hash -> lesbare Namen
3. **Re-Generierung** -- Metadaten mit neuen Namen aktualisieren
4. **Anreicherung** -- Heuristische Labels, React-Erkennung, Graphen

### Channel-basierte UI-Entkopplung (Rust)

```
Conversation-Loop  --[mpsc::UnboundedSender<ConversationEvent>]--> TUI
```

Die Conversation-Loop und die UI sind vollstaendig entkoppelt. Events (Text-Deltas, Tool-Calls, Errors) werden ueber einen Tokio-Channel gesendet. Die TUI rendert nur bei `needs_redraw`.

### Trait-basierte Abstraktion (Rust)

```rust
trait ApiClient    // -> MockApiClient (Tests), AnthropicClient (Produktion)
trait Tool         // -> BashTool, ReadTool, WriteTool, ...
trait PermissionPrompter  // -> TuiPrompter (Produktion), AutoApprove (Tests)
```

Alle externen Abhaengigkeiten sind hinter Traits abstrahiert und in Tests mockbar.

---

> **[Legal Disclaimer & Fair Use Notice](DISCLAIMER.md)** -- This project is not affiliated with or endorsed by Anthropic.

