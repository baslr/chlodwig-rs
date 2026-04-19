# Stage 0 — CWD Refactor: Roadmap

Roadmap für den Rest von **Stage 0** (CWD-Refactor), in TDD-fähigen Mini-Stufen.

Vorarbeit (bereits erledigt in Commit `d237127`): Stage 0.1 — `AppState.cwd` Feld + `with_cwd()` Konstruktor; Read/Write/Edit Tools nutzen `ctx.working_directory` für relative Pfade; neuer `util::resolve_path()` Helper.

---

### Stage 0.2 — `setup.rs` entgiften (nächster Schritt)

**Heute:** `setup.rs` ruft an 3 Stellen `std::env::set_current_dir(&path)` auf (Launch via Finder, dropped folder, etc.). Das ist der größte Show-Stopper für Multi-Tab — ein Tab könnte den Prozess-CWD ändern und alle anderen Tabs würden mit-driften.

**Ziel:** `setup.rs` ermittelt den initialen CWD und **gibt ihn als `PathBuf` zurück**, statt ihn zu setzen.

- Signatur ändern: `pub fn run_setup(...) -> PathBuf` (oder `Result<PathBuf, _>`).
- Tests: `test_setup_does_not_call_set_current_dir` (Negativ-Test: Prozess-CWD vor/nach Setup identisch). Die existierenden 6 Tests in `setup_tests.rs` passen schon — die müssen nur das neue Return-Value statt `env::current_dir()` prüfen.
- Aufrufer (`main.rs`) speichert den Rückgabewert und füttert ihn in `AppState::with_cwd(model, cwd)`.

**Aufwand:** ~30 min, sehr abgegrenzt.

---

### Stage 0.3 — GTK-Konsumenten auf `state.cwd` umstellen

Alle Stellen, die heute `std::env::current_dir()` lesen, lesen ab jetzt `state.cwd`:

| Datei | Zeile | Was |
|---|---|---|
| `submit.rs` | 68 | CWD für Submit-Header |
| `main.rs` | 184 | CWD für Header-Setup |
| `main.rs` | 346 | `ToolContext.working_directory` |
| `window.rs` | 343 | Header-Title |
| `menu.rs` | 167 | Menü-Aktion |
| `app_state.rs` | 691, 705 | `project_dir_name()` / `startup_cwd_message()` werden zu **Methoden** auf `&self` |

**Tests:**
- `test_project_dir_name_uses_state_cwd` (statt env)
- `test_startup_cwd_message_uses_state_cwd`
- `test_tool_context_built_from_state_cwd`

**Aufwand:** ~45 min.

---

### Stage 0.4 — `system_prompt` im Core entgiften

`chlodwig-core/src/system_prompt.rs` ruft 3× `env::current_dir()` direkt → das ist Library-Code, sollte stateless sein.

**Ziel:** `build_system_prompt(cwd: &Path, ...)` als expliziten Parameter, kein `env::current_dir()` mehr außer in Tests.

**Tests:**
- `test_system_prompt_uses_explicit_cwd`
- Negativ-Test: `system_prompt.rs` enthält kein `env::current_dir` mehr (außer Tests).

Aufrufer (`cli/main.rs:132`, GTK `main.rs`, TUI `app.rs`) übergeben den jeweiligen CWD.

**Aufwand:** ~30 min.

---

### Stage 0.5 — Negativ-Test im Workspace

Ein Test der greppt, dass im Production-Code (außerhalb von `setup.rs` der einmaligen Initial-Auflösung und außerhalb von `#[cfg(test)]`) **kein** `set_current_dir` mehr vorkommt. Also „Schienenfahrwerk" gegen Regressionen.

```rust
#[test]
fn test_no_set_current_dir_in_production_code() {
    // walkdir über crates/, grep nach "set_current_dir", whitelist
}
```

**Aufwand:** ~20 min.

---

### Stage 0.6 — `chlodwig-tui` Entscheidung

Zwei TUI-Stellen lesen `env::current_dir()` (`app.rs:535`, `notification.rs:138`). Die TUI ist bewusst single-tab — funktional kein Problem. Trotzdem: für saubere Architektur die gleiche Behandlung wie GTK (`App.cwd: PathBuf`).

**Frage an dich:** TUI mitziehen oder „TUI ist single-tab, lassen wir"? Empfehlung: **mitziehen**, kostet ~15 min und macht die Codebasis konsistent.

---

### Reihenfolge-Vorschlag

Wenn dich nichts daran stört, würde ich jetzt einfach **0.2 → 0.3 → 0.4 → 0.5 → 0.6** durchgehen, jeweils mit eigenem Commit nach grünem `cargo test --workspace`.
