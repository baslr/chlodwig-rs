# Multi-Window + Tabs Umbau (GTK)

Planungsdokument für den Umbau der GTK-Variante auf:
1. **Mehrere Tabs pro Fenster** (jeder Tab = unabhängige Konversation)
2. **Mehrere Fenster** (jeweils mit eigenen Tabs, Tabs zwischen Fenstern verschiebbar)
3. **Pro Tab eigenes Working Directory** (kein Prozess-CWD-Crosstalk)

---

## Zielzustand

- Eine `libadwaita::Application` verwaltet N `ApplicationWindow`s.
- Jedes Fenster hat eine `adw::TabView` + `adw::TabBar`.
- Jeder Tab hostet eine eigene **TabContext**:
  - eigener `Rc<RefCell<AppState>>`
  - eigener `ConversationState`
  - eigener `mpsc::UnboundedSender<ConversationEvent>`
  - eigenes `cwd: PathBuf`
  - eigene UI-Widgets (ScrolledWindow, TextView, Input, Statusbar, …)
- Tabs lassen sich per Drag in ein neues Fenster reißen (`adw::TabView::connect_create_window`).
- Pinnen, Umsortieren, Close-Buttons → kommt durch `adw::TabView` „kostenlos".
- Menüpunkte: `tab.new` (Ctrl+T), `tab.close` (Ctrl+W), `window.new` (Ctrl+N), `tab.move-to-new-window`.
- Sessions: pro Tab eigene Session-Identität (Designentscheidung Stage D, siehe unten).

---

## Stage 0 — CWD-Refactor (Vorarbeit, **vor** Tabs!)

**Problem:** Heute wird überall der prozessglobale `std::env::current_dir()` benutzt. `setup.rs` ruft sogar `std::env::set_current_dir()` auf. Das macht Multi-Tab mit unterschiedlichen Working Directories unmöglich (Cross-Talk: ein Tab ändert CWD, alle anderen Tabs sind betroffen).

**Ziel:** Jeder Tab hat sein eigenes `cwd`. Kein Code im Hot-Path ruft mehr `env::current_dir()` oder `env::set_current_dir()`.

### Betroffene Stellen (Stand heute)

| Datei | Zeile | Was |
|---|---|---|
| `chlodwig-cli/src/main.rs` | 132 | setzt `working_directory` initial |
| `chlodwig-tui/src/notification.rs` | 138 | liest CWD |
| `chlodwig-tui/src/app.rs` | 535 | liest CWD |
| `chlodwig-core/src/tools.rs` | 33 | `ToolContext` Default = `env::current_dir()` |
| `chlodwig-core/src/system_prompt.rs` | 33, 84, 121 | liest CWD direkt |
| `chlodwig-gtk/src/setup.rs` | 20, 87, 171 | **`set_current_dir(&path)`** ⚠️ |
| `chlodwig-gtk/src/app_state.rs` | 691, 705 | `project_dir_name()`, `startup_cwd_message()` |
| `chlodwig-gtk/src/window.rs` | 343 | Header-Title aus CWD |
| `chlodwig-gtk/src/menu.rs` | 167 | CWD für Menü-Aktion |
| `chlodwig-gtk/src/main.rs` | 184, 346 | Header + `ToolContext` |
| `chlodwig-gtk/src/submit.rs` | 68 | CWD für Submit |

### Zielarchitektur

1. `AppState` bekommt Feld `pub cwd: PathBuf`.
2. `system_prompt::*` nehmen `cwd: &Path` als expliziten Parameter (kein `env::current_dir()` mehr im core).
3. `ToolContext::working_directory` wird vom Aufrufer **immer** gesetzt — Default-Fallback bleibt nur als letzte Notbremse.
4. **Alle Tools** im `chlodwig-tools`-Crate müssen relative Pfade gegen `ctx.working_directory` auflösen, **nicht** gegen den Prozess-CWD. → Audit nötig.
5. **Bash-Tool**: `Command::current_dir(&ctx.working_directory)` setzen.
6. `setup.rs` ruft **nicht mehr** `env::set_current_dir()` auf. Stattdessen liefert es den ermittelten Pfad als `PathBuf` zurück, der in `AppState.cwd` landet.
7. Statusbar/Header lesen `state.cwd` statt `env::current_dir()`.
8. Negativ-Test: Grep im Build sicherstellen, dass kein Tool-Code mehr `env::set_current_dir()` aufruft (außer in Tests).

### TDD-Reihenfolge

1. Test: `AppState::new` akzeptiert `cwd: PathBuf` und speichert es.
2. Test: `system_prompt::build(cwd)` nutzt den übergebenen Pfad, nicht `env::current_dir()`.
3. Test: Bash-Tool führt mit `ctx.working_directory != env::current_dir()` Befehle im richtigen Verzeichnis aus (Setup: `tempdir()`).
4. Audit + Tests für Read/Write/Edit/Glob/Grep/Ls (jeder muss `ctx.working_directory` honorieren).
5. Refactor `setup.rs`: gibt `PathBuf` zurück statt `set_current_dir`.
6. Test: zwei `AppState`-Instanzen mit unterschiedlichen `cwd` koexistieren (kein Prozess-CWD wird verändert).
7. GTK-Adapter: alle CWD-Lese-Stellen auf `state.cwd` umstellen.

---

## Stage A — `build_tab_content()` extrahieren

`build_window` zerlegen in:
- `build_window_shell()` → erstellt `ApplicationWindow` + leere Hülle (HeaderBar, optional schon `adw::TabBar`).
- `build_tab_content(cwd) -> TabContext` → liefert das, was bisher der Window-Inhalt war (Box mit ScrolledWindow, Input, Statusbar etc.) inkl. eigener `AppState`.

**Verhalten:** Window enthält genau 1 Tab. Funktional identisch zu heute. Alle Tests bleiben grün.

---

## Stage B — `adw::TabView` + `adw::TabBar` einziehen

- `adw::TabView` als Hauptcontainer, `adw::TabBar` in HeaderBar.
- „New Tab"-Button + `Ctrl+T` Action.
- „Close Tab" (Ctrl+W) + Close-Button am Tab.
- Jeder Tab = `TabContext` mit eigener `AppState`.
- Tab-Title = `state.cwd.file_name()` + ggf. „•" für unsaved changes.
- Aktiver Tab steuert Fenster-Title.

---

## Stage C — Multi-Window + Drag-Out

- Menüpunkt `window.new` → öffnet zweites `ApplicationWindow` mit eigenem leeren `adw::TabView`.
- `tab_view.connect_create_window` für Drag-Tab-aus-Fenster → erstellt neues Fenster, gibt dessen `TabView` zurück.
- Menüpunkt „Move Tab to New Window".
- Beim Schließen des letzten Fensters → App beendet sich (Standard-Verhalten, prüfen).

---

## Stage D — Session-Persistenz pro Tab

**Designfragen:**
- Soll jeder Tab seine eigene Session unter `~/.chlodwig-rs/<tab-id>.json` speichern?
- Oder eine globale Session pro Fenster mit allen Tabs als Array?
- `--resume` öffnet wie viele Tabs?

**Vorschlag:**
- Pro Tab eigene Session-Datei, benannt nach Working-Directory + Timestamp.
- Beim Start: kein Auto-Resume mehr — Sessions-Browser (`/sessions`) öffnet Sessions in neuem Tab.
- `--resume <prefix>` öffnet die jeweilige Session in einem neuen Tab.

---

## Offene Fragen

- **Status-Bar pro Tab oder pro Window?** Vorschlag: pro Tab (zeigt Token-Counts der jeweiligen Konversation).
- **Theme-Toggle, Settings:** Window-global oder App-global? → App-global via `Settings`-Singleton.
- **Notifications (`OSNotify` / `notify-send`):** Wenn ein Tab im Background eine Antwort fertig hat → Notification mit Tab-Title.
- **Crash-Recovery:** Pro Tab oder pro Window?

---

## Reihenfolge der Umsetzung

1. ✅ **Stage 0** — CWD-Refactor
2. ✅ **Stage A** — `build_tab_content()` extrahieren
3. ✅ **Stage B** — `adw::TabView` einziehen, Multi-Tab pro Fenster
4. Stage C — Multi-Window + Drag-Out
5. Stage D — Session-Persistenz pro Tab
