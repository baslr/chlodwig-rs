# REPL Text Input & Cursor Control — Architektur-Dokumentation

## Überblick

Die Texteingabe in Claude Code folgt einer 7-stufigen Pipeline:

```
process.stdin (Raw TTY)
  → tG_ (InternalApp) handleReadable → liest stdin Chunks
    → Zdq() Keypress-Parser (Tokenizer + State Machine)
      → qh4() Event-Dispatcher
        → InputEvent aus Raw-Keypress
          → internal_eventEmitter.emit("input", InputEvent)
            → useInput Hook (gy4) Listener
              → TextInput Handler-Chain → M$ Cursor-Modell
```

---

## 1. Stdin-Lesen & Keypress-Parsing

### `tG_` — InternalApp (Class Component)
**Datei:** `src/sections/terminal-focus-event.js` Zeile 26–194
**Rolle:** Root React Component (extends PureComponent)

- Verwaltet Raw-Mode via `handleSetRawMode` (Z. 98–136)
- Liest stdin in `handleReadable` (Z. 153–167):
  ```js
  while ((_ = this.props.stdin.read()) !== null) this.processInput(_)
  ```
- `processInput` (Z. 142–151) ruft den Keypress-Parser auf
- Stellt `S_H` Context (InternalStdinContext) bereit

### `Zdq()` — Keypress-Parser
**Datei:** `src/readable/cli_split.js` Zeile 74882–74909

Stateful Parser der Raw-Input in strukturierte Events umwandelt:
- Tokenizer: `h0H({ x10Mouse: true })` — handhabt Escape-Sequenzen
- **Bracketed Paste Mode**: erkennt Paste-Start (`Adq`) und Paste-End (`fdq`)
- Produziert: `{ kind: "key" | "mouse" | "response", name, ctrl, meta, shift, ... }`
- Incomplete-Escape-Timeout: 50ms normal, 500ms bei Paste
- Rückgabe: `[parsedEvents, newState]`

### `Xdq()` — Single-Key Parser
**Datei:** `src/readable/cli_split.js` Zeile 74980+

Parst eine Escape-Sequenz in:
```js
{ kind: "key", name, fn, ctrl, meta, shift, option, super, sequence, raw, isPasted }
```

### `GZ4()` — InputEvent Key Mapper
**Datei:** `src/readable/cli_split.js` Zeile 75133–75177

Konvertiert Raw-Keypress in `{ key, input }` Format für `useInput`:
- Mappt Pfeiltasten, Modifier, Spezialtasten (Home, End, PageUp, etc.)
- Handhabt Kitty Keyboard Protocol (`[...u` und `[27;...~` Sequenzen)

### `InputEvent` Klasse
**Datei:** `src/readable/cli_split.js` Zeile 75181–75190

```js
class InputEvent extends oh {
  keypress; key; input;
  constructor(H) {
    super(); // oh = Basis-Event mit stopImmediatePropagation
    [this.key, this.input] = GZ4(H);
    this.keypress = H;
  }
}
```

---

## 2. Event-Dispatching

### `qh4()` — Event-Dispatcher
**Datei:** `src/readable/cli_split.js` Zeile 79686–79720

Wird aus React `discreteUpdates` aufgerufen. Für jedes Event:
1. Terminal-Query-Replies überspringen
2. Mouse-Events → `$h4()` (Maus/Selection-Handler)
3. Focus/Blur → `"terminalfocus"` / `"terminalblur"` emittieren
4. Ctrl+C Handling via `H.handleInput(sequence)`
5. `new InputEvent(keypress)` → `emitter.emit("input", event)`
6. Zusätzlich als DOM-ähnliches `KeyboardEvent` via `dispatchKeyboardEvent`

---

## 3. Event-Subscription: `useInput` und `useStdin`

### `useStdin` (Hash: `jR4`)
**Datei:** `src/readable/cli_split.js` Zeile 72778–72783

Liest `S_H` Context und liefert:
- `stdin`: Raw stdin Stream
- `setRawMode`: Raw-Mode Toggle
- `internal_eventEmitter`: EventEmitter für InputEvents
- `internal_exitOnCtrlC`: Flag
- `internal_querier`: Terminal-Querier

### `useInput` (Hash: `gy4`)
**Datei:** `src/readable/cli_split.js` Zeile 84274–84303

Der Ink-Level Keyboard-Hook:
```js
gy4 = (handler, options) => {
  const { setRawMode, internal_exitOnCtrlC, internal_eventEmitter } = useStdin();
  useLayoutEffect(() => {
    if (isActive !== false) { setRawMode(true); return () => setRawMode(false); }
  }, ...);
  useEffect(() => {
    emitter?.on("input", stableHandler);
    return () => emitter?.removeListener("input", stableHandler);
  }, ...);
};
```

---

## 4. TextInput Komponentenkette

### `B4` — TextInput Wrapper (Hauptkomponente)
**Datei:** `src/readable/cli_split.js` Zeile 204263–204345
**22+ Aufrufstellen** im Codebase

1. Holt Theme, Terminal-Focus, Voice-State
2. Setzt Cursor-Inversions-Funktion (Normal: `$_.inverse`, Voice: Regenbogen-Animation)
3. Ruft **`iF_`** (Core Input Hook) mit allen Props
4. Rendert `<TextInputComponent inputState={M} terminalFocus={q} ...>` → `nF_`

### `nF_` / `TextInputComponent`
**Datei:** `src/readable/cli_split.js` Zeile 204174–204253

Die Render-Komponente:
1. Destrukturiert `inputState` → `{ onInput, renderedValue, cursorLine, cursorColumn }`
2. Cursor-Position: `{ line: cursorLine, column: cursorColumn, active: focus && showCursor }`
3. **`AT9`** (Cursor-Position-Hook) → liefert Ref-Callback
4. **`KT9`** (Paste-Handler) → `{ wrappedOnInput, isPasting }`
5. **`useInput(wrappedOnInput, { isActive: focus })`** — hier werden Keyboard-Events verdrahtet
6. Rendert `<Box ref={cursorRef}><Text wrap="truncate-end">...</Text></Box>`

---

## 5. Core Input State Hook: `iF_`

**Datei:** `src/readable/cli_split.js` Zeile 203542–203804
**Hash:** Teil von `e_8`, Label: `component(TextInputHook)`

### Parameter
```
value, onChange, onSubmit, onExit, onExitMessage, onHistoryUp, onHistoryDown,
onHistoryReset, onClearInput, mask, multiline, cursorChar, invert, columns,
onImagePaste, disableCursorMovementForUpDownKeys, disableEscapeDoublePress,
maxVisibleLines, externalOffset, onOffsetChange, inputFilter, inlineGhostText, dim
```

### Core State
```js
S = M$.fromText(value, columns, externalOffset) // Immutables Cursor-Objekt
```

### Key-Bindings (Emacs-Style)

| Binding | Aktion |
|---------|--------|
| `Ctrl+A` | Zeilenanfang |
| `Ctrl+B` | Links |
| `Ctrl+D` | Zeichen löschen / Exit bei leerem Input |
| `Ctrl+E` | Zeilenende |
| `Ctrl+F` | Rechts |
| `Ctrl+H` | Token vor Cursor löschen / Backspace |
| `Ctrl+K` | Bis Zeilenende löschen (Kill) |
| `Ctrl+N` | Runter |
| `Ctrl+P` | Hoch |
| `Ctrl+U` | Bis Zeilenanfang löschen |
| `Ctrl+W` | Wort vor Cursor löschen |
| `Ctrl+Y` | Yank (aus Kill-Ring einfügen) |
| `Meta+B` | Vorheriges Wort |
| `Meta+F` | Nächstes Wort |
| `Meta+D` | Wort nach Cursor löschen |
| `Meta+Y` | Yank-Pop (Kill-Ring rotieren) |

### Key-Dispatch (`fH` Funktion, Z. 203694–203756)

| Taste | Aktion |
|-------|--------|
| Escape | Doppel-Press → Input leeren |
| Ctrl/Meta + Links/Rechts | Wort-Navigation |
| Backspace (+ meta/ctrl) | Wort/Token/Zeichen löschen |
| Delete (+ meta) | Kill bis Ende / Zeichen löschen |
| Home/End | Zeilenanfang/-ende |
| PageUp/PageDown | Zeilenanfang/-ende |
| Return | Newline (Shift/Meta) oder Submit |
| Hoch/Runter | Cursor oder History-Navigation |
| Links/Rechts | Cursor links/rechts |
| Sonstiges | Text einfügen |

### Rückgabewert
```js
{
  onInput,              // Handler den useInput aufruft
  renderedValue,        // String mit Cursor-Zeichen
  offset,               // Aktueller Offset
  cursorLine,           // Zeile im Viewport
  cursorColumn,         // Spalte
  viewportCharOffset,   // Scroll-Position
  viewportCharEnd,      // Viewport-Ende
}
```

---

## 6. Cursor-Modell: `M$` Klasse

**Datei:** `src/readable/cli_split.js` Zeile 202726–203175

**Immutables** Cursor-Modell. Jede Operation gibt neue `M$` Instanz zurück.

### Felder
- `measuredText: oO9` — Gewrapptes/gemessenes Text-Objekt
- `offset: number` — Cursor-Position im Raw-Text-String
- `selection: number` — Selection-Info

### Methoden

| Methode | Zeile | Beschreibung |
|---------|-------|-------------|
| `fromText(text, cols, offset)` | 202735 | Factory — Cursor aus Text erstellen |
| `left()` | 202809 | Links (Graphem-aware, überspringt Image-Refs) |
| `right()` | 202816 | Rechts |
| `up()` | 202841 | Gleiche Spalte auf gewrappter Zeile darüber |
| `down()` | 202854 | Gleiche Spalte auf gewrappter Zeile darunter |
| `startOfLine()` | 202871 | Zeilenanfang (oder vorige Zeile wenn schon am Anfang) |
| `endOfLine()` | 202883 | Zeilenende |
| `firstNonBlankInLine()` | 202876 | Erstes Nicht-Leerzeichen (Vim `^`) |
| `startOfLogicalLine()` | 202918 | Anfang der logischen (ungewrappten) Zeile |
| `endOfLogicalLine()` | 202915 | Ende der logischen Zeile |
| `upLogicalLine()` | 202927 | Logische Zeile hoch |
| `downLogicalLine()` | 202935 | Logische Zeile runter |
| `nextWord()` | 202943 | Nächste Wortgrenze |
| `prevWord()` | 202963 | Vorige Wortgrenze |
| `nextVimWord()` | 202977 | Vim `w` Motion |
| `prevVimWord()` | 203012 | Vim `b` Motion |
| `endOfVimWord()` | 202988 | Vim `e` Motion |
| `nextWORD()` | 203034 | Vim `W` Motion |
| `prevWORD()` | 203049 | Vim `B` Motion |
| `endOfWORD()` | 203040 | Vim `E` Motion |
| `insert(text)` | 203062 | Text an Cursor einfügen |
| `del()` | 203065 | Zeichen unter Cursor löschen |
| `backspace()` | 203069 | Zeichen vor Cursor löschen |
| `deleteToLineStart()` | 203073 | Bis Zeilenanfang löschen |
| `deleteToLineEnd()` | 203089 | Bis Zeilenende löschen |
| `deleteWordBefore()` | 203113 | Wort vor Cursor löschen |
| `deleteWordAfter()` | 203138 | Wort nach Cursor löschen |
| `deleteTokenBefore()` | 203120 | Smart-Delete (`[Image #N]`, `[Pasted text #N]`) |
| `render(cursorChar, mask, invert, ghostText, maxLines)` | 202762 | Text mit Cursor rendern |
| `findCharacter(char, type, count)` | — | Vim f/F/t/T Zeichensuche |
| `goToLine(n)` | 203170 | Zu Zeile N springen |

### Wortkategorisierung (Z. 203466–203468)
- `eo(char)` — Wort-Zeichen: `[\p{L}\p{N}\p{M}_]`
- `QF_(char)` — Whitespace: `\s`
- `v9H(char)` — Interpunktion: nicht Wort und nicht Whitespace

---

## 7. MeasuredText: `oO9` Klasse

**Datei:** `src/readable/cli_split.js` Zeile 203238–203456

Handhabt Text-Wrapping und -Messung:

| Methode | Beschreibung |
|---------|-------------|
| `measureWrappedText()` | Nutzt `B_H` (wrap-ansi) für Hard-Wrapping |
| `getGraphemeBoundaries()` | `Intl.Segmenter` für Unicode Graphem-Cluster |
| `getWordBoundaries()` | Wort-Segmentierung |
| `getPositionFromOffset(offset)` | String-Offset → `{ line, column }` |
| `getOffsetFromPosition({line, col})` | `{ line, column }` → String-Offset |
| `nextOffset(pos)` / `prevOffset(pos)` | Graphem-aware Navigation mit Caching |
| `snapToGraphemeBoundary(pos)` | Auf nächste Graphem-Grenze clampen |

---

## 8. Kill Ring (Emacs-Style)

**Datei:** `src/readable/cli_split.js` Zeile 202698–202725

- **`Db`** — Array (max 10 Einträge), der Kill-Ring
- **`Ha(text, mode)`** — Push in Kill-Ring (append/prepend für aufeinanderfolgende Kills)
- **`dF_()`** — Top des Kill-Ring (für Ctrl+Y)
- **`cF_(start, length)`** — Yank-Position merken
- **`FF_()`** — Kill-Ring rotieren (für Meta+Y Yank-Pop)
- **`S__()`** — Kill-Akkumulation stoppen
- **`E__()`** — Yank-Pop stoppen

---

## 9. Cursor-Rendering Pipeline

### `AT9` — Cursor Position Hook
**Datei:** `src/readable/cli_split.js` Zeile 203958–203977

Meldet Cursor-Position an Ink-Renderer via `aG_` Context:
```js
function AT9({ line, column, active }) {
  const setCursor = useContext(aG_);
  useLayoutEffect(() => {
    if (active && ref.current) {
      setCursor({ relativeX: column, relativeY: line, node: ref.current });
    } else if (wasActive.current) {
      setCursor(null);
    }
  });
  return refCallback; // <Box ref={refCallback}>
}
```

### `IUH` (Ink Instance) — Cursor → Terminal
**Datei:** `src/readable/cli_split.js` Zeile 82395–82424

Konvertiert Cursor-Deklarationen in ANSI-Sequenzen:
1. `cursorDeclaration` = `{ node, relativeX, relativeY }` von `AT9`
2. Lookup von `node` in `rJ` (Layout-Positionen) → absolute `{ x, y }`
3. Berechnet: `{ x: absoluteX + relativeX, y: absoluteY + relativeY }`
4. ANSI-Ausgabe:
   - Alt Screen: `Ek6(row, col)` → `\x1b[{row};{col}H` (absolute Positionierung)
   - Normal Mode: `v0H(dx, dy)` → relative Cursor-Bewegung

### ANSI Escape Funktionen
**Datei:** `src/readable/cli_split.js` Zeile 74697–74726

| Funktion | Sequenz | Beschreibung |
|----------|---------|-------------|
| `Ek6(row, col)` | `\x1b[{row};{col}H` | CUP — absolute Cursor-Position |
| `HZ4(n)` | `\x1b[{n}D` | CUB — Cursor rückwärts |
| `eR4(n)` | `\x1b[{n}C` | CUF — Cursor vorwärts |
| `Hdq(n)` | `\x1b[{n}A` | CUU — Cursor hoch |
| `tR4(n)` | `\x1b[{n}B` | CUD — Cursor runter |
| `v0H(dx, dy)` | Kombination | Relative Cursor-Bewegung |

---

## 10. Vim Mode

### `wx9` — Vim Mode Hook
**Datei:** `src/readable/cli_split.js` Zeile 288964–289114

Wraps `iF_` mit Vim-Logik:

**State:**
- `mode`: `"INSERT"` | `"NORMAL"` (React State)
- Internal Ref: `{ mode, command: { type: "idle"|"count"|"operator"|... } }`
- `registers`: Yank-Register, letzter Find, letzte Änderung (für `.` Repeat)

**Input-Routing:**
- Ctrl → delegiert an `iF_` (Emacs-Bindings funktionieren auch in Vim)
- Escape in INSERT → NORMAL Mode (Cursor zurück 1)
- Escape in NORMAL → Reset auf idle
- Return → delegiert an `iF_`
- INSERT Mode → Text tracken für `.` Repeat, delegiert an `iF_`
- NORMAL Mode mit Pfeiltasten → delegiert an `iF_`
- NORMAL Mode → **`Tx9`** (Vim Command Processor)

### `Tx9` — Vim Command State Machine
**Datei:** `src/readable/cli_split.js` Zeile 288791–288815

| State | Handler | Beschreibung |
|-------|---------|-------------|
| `idle` | `q0K` | Ausgangszustand, akzeptiert Motions/Operatoren/Counts |
| `count` | `$0K` | Sammelt Count-Ziffern |
| `operator` | `K0K` | Nach Operator (d/c/y), wartet auf Motion |
| `operatorCount` | `O0K` | Operator + Count |
| `operatorFind` | `T0K` | Operator + f/F/t/T, wartet auf Zeichen |
| `operatorTextObj` | `z0K` | Operator + i/a, wartet auf Objekt-Typ |
| `find` | `A0K` | f/F/t/T, wartet auf Zeichen |
| `g` | `f0K` | Nach `g`, wartet auf nächstes Zeichen |
| `operatorG` | `w0K` | Operator + g, wartet auf nächstes Zeichen |
| `replace` | `Y0K` | Nach `r`, wartet auf Ersetzungszeichen |
| `indent` | `D0K` | Nach `>` oder `<`, wartet auf zweites `>`/`<` |

### Unterstützte Vim-Befehle (aus `zx9`, Z. 288817–288860)
- **Motions:** `h, j, k, l, w, W, e, E, b, B, 0, $, ^, G, gg, f/F/t/T, ;, ,`
- **Operatoren:** `d, c, y` (mit Motions und Text Objects)
- **Aktionen:** `x, r, ~, J, p, P, D, C, Y, i, I, a, A, o, O, u, .`
- **Text Objects:** `iw, aw, i", a", i', a', i(, a(, i{, a}, i[, a]` etc.

### Vim-Mode Check
**Datei:** `src/readable/cli_split.js` Zeile 215204
```js
function Ta() { return getGlobalConfig().editorMode === "vim"; }
```

---

## 11. Paste-Handling

### `KT9` — Paste Handler Hook
**Datei:** `src/readable/cli_split.js` Zeile 203816–203937

1. Erkennt Paste via `keypress.isPasted` (Bracketed Paste Mode)
2. Akkumuliert Paste-Chunks mit 100ms Debounce
3. Filtert Dateipfade (`eS_()`) und Bilddateien (`lv7()`)
4. macOS: Clipboard-Bilder und Screenshot-Pastes erkennen
5. Routing: Bild → `onImagePaste`, Text → `onPaste`, Normal → `onInput`

---

## 12. REPL → TextInput Verbindung

### In der REPL-Funktion (`I38`)
**Datei:** `src/readable/cli_split.js` Zeile 291903–291959

Die REPL erstellt Props:
```js
{
  multiline: true,
  onSubmit, onChange, value,
  onHistoryUp, onHistoryDown, onHistoryReset,
  placeholder, onExit, onExitMessage, onImagePaste,
  columns, maxVisibleLines,
  disableCursorMovementForUpDownKeys: completions.length > 0 || isSearching,
  disableEscapeDoublePress: completions.length > 0,
  cursorOffset, onChangeCursorOffset,
  onPaste, onIsPastingChange,
  focus: !isLoading && !hasDialog && !isSearching,
  showCursor: !isSearching && !isLoading && !isQuerying,
  argumentHint, onUndo, highlights, inlineGhostText,
}
```

Und rendert bedingt:
```js
Ta()  // Vim-Mode aktiv?
  ? <ExitComponent$4 {...props} initialMode={vimInitialMode} onModeChange={setVimMode} />
  : <B4 {...props} />  // Normal-Mode
```

---

## 13. Zusammenfassung der Hash→Name Zuordnungen

| Hash | Readable Name | Rolle |
|------|--------------|-------|
| `I38` | REPL | Haupt-REPL Komponente (2331 Zeilen) |
| `B4` | TextInput | TextInput Wrapper (Hauptkomponente) |
| `nF_` | TextInputComponent | TextInput Render-Komponente |
| `iF_` | TextInputHook | Core Input State Hook |
| `M$` | (Cursor-Klasse) | Immutables Cursor-Modell |
| `oO9` | (MeasuredText) | Text-Wrapping & -Messung |
| `AT9` | TextInputHook | Cursor Position Hook |
| `KT9` | TextInputHook | Paste Handler Hook |
| `wx9` | (VimModeHook) | Vim Mode Wrapper |
| `Tx9` | (VimCommandSM) | Vim Command State Machine |
| `gy4` | useInput | Ink Keyboard Hook |
| `jR4` | useStdin | Ink Stdin Context Hook |
| `tG_` | InternalApp | Root Component (stdin lesen) |
| `Zdq` | (KeypressParser) | Keypress Tokenizer/Parser |
| `qh4` | (EventDispatcher) | Event-Dispatcher |
| `GZ4` | (KeyMapper) | InputEvent Key Mapper |
| `Ek6` | (CursorPosition) | ANSI CUP Escape |
| `v0H` | (CursorMove) | ANSI relative Cursor-Bewegung |
| `IUH` | (InkInstance) | Ink Renderer (Cursor → Terminal) |
| `Ta` | (isVimMode) | Vim-Mode Config-Check |
