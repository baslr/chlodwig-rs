# Emoji v2 — Plan für die Neufassung

Status: **noch nicht angefangen**. `crates/chlodwig-gtk/src/emoji.rs` bleibt
bis dahin wie es ist und wird nicht weiter geflickt. Diese Datei sammelt das
Wissen, damit der Neuanfang nicht bei Null beginnt.

## Warum überhaupt eine v2?

Das aktuelle `emoji.rs` benutzt **drei parallele Datenquellen** um zu
entscheiden, was mit einem Codepoint passieren soll. Sie sind nicht
synchronisiert und produzieren Inkonsistenzen.

### Die drei Quellen heute

1. **`is_default_emoji(c) -> bool`** (~100 Codepoints)
   Hartkodierte Ranges aller Unicode `Emoji_Presentation = Yes` Zeichen.
   Splitter-Regel: → immer `TextSegment::Emoji` → Apple Color Bitmap.

2. **`is_text_default_pictographic(c) -> bool`** (~50 Codepoints)
   Hartkodierte Ranges aller `Extended_Pictographic = Yes` mit
   `Emoji_Presentation = No`. Beispiel: ☀ U+2600.
   Splitter-Regel: → bare bleibt Plain (Sarasa rendert S/W-Glyph),
   nur mit folgendem VS16 wird es Emoji.

3. **`MANIFEST: &[(char, EmojiSpec)]`** (~123 Codepoints)
   Hartkodierte Liste mit `EmojiSpec { emit, to_color_emoji }`.
   Zwei Untertypen mischen sich:
   - **Remap**: Sarasas Glyph wäre da, sieht aber falsch/hässlich aus
     → wir leiten auf ein anderes Emoji um (z.B. ✆ U+2706 → 📞 U+1F4DE).
   - **VS16-Forcer für Sarasa-Misses**: Codepoint nicht in Sarasas cmap
     → wir hängen FE0F dran und schicken zu Apple Bitmap.

   Splitter-Regel: → MANIFEST-Hit = unconditional Apple Bitmap.

   Width-Regel: `pipeline_width_overrides()` mappt JEDEN MANIFEST-Eintrag
   auf Width=2 in `FontMetrics`. Andere Quellen tragen NICHTS zu den
   Width-Overrides bei.

   Der `to_color_emoji` Flag im Spec ist heute totes Holz: alle 123
   Einträge haben `false`, der `true`-Zweig wird nie betreten.

### Das konkrete Symptom (warum wir das gemerkt haben)

**U+26A1 ⚡** — Tabelle hat Vertikal-Border 1 Zelle zu weit rechts.

| Frage | Antwort | Quelle |
|---|---|---|
| Splitter-Klasse? | Emoji (→ Apple Bitmap, 2 cells gemalt) | `is_default_emoji` Range |
| MANIFEST-Eintrag? | nein | — |
| Width-Override? | nein (weil nicht im MANIFEST) | `pipeline_width_overrides()` |
| Sarasa hmtx? | hadv=500, units_per_em=1000 → **1 cell** | Sarasa cmap+hmtx |
| `FontMetrics::char_width('⚡')` | **1** | (kein Override → Sarasa hmtx) |
| Tabellen-Layouter berechnet | Spaltenbreite mit 1 | `markdown.rs:1074` |
| Renderer malt | Bitmap über 2 Zellen | Splitter-Klassifizierung |
| Resultat | Border verschoben um 1 | Mismatch |

Das ist KEIN Einzelbug — die gleiche Klasse trifft jeden Codepoint, der
in `is_default_emoji` ist UND in Sarasas cmap mit hmtx≠2.

### Warum ein Sofortfix für ⚡ keinen Sinn macht

Man könnte ⚡ ins MANIFEST aufnehmen — dann erbt es automatisch
Width=2. Aber das pflegt die Krankheit weiter: jeder neue Codepoint
müsste in MEHREREN Tabellen synchron eingetragen werden. Genau das wollen
wir loswerden.

## Designziele für v2

1. **EINE Tabelle als Quelle der Wahrheit.** Jeder Codepoint, der von
   "Pango rendert Sarasa-Glyph" abweicht, hat genau einen Eintrag.
   Codepoints ohne Eintrag = "ganz normaler Text, Sarasa kümmert sich".

2. **Lesbar für Menschen, nicht nur für KI.** Tabellen-Layout mit klarer
   Spaltenstruktur, Kommentare in voller Sprache, keine kryptischen
   Flag-Namen wie `to_color_emoji`.

3. **Splitter, Width-Override und Renderer ziehen aus DERSELBEN Tabelle.**
   Nicht "Splitter fragt A, Width fragt B" — beide rufen die GLEICHE
   Klassifikationsfunktion und reagieren auf das GLEICHE Verdikt.

4. **Splitter-Code in einer Funktion.** Nicht eine
   `starts_emoji_in_plain` Closure mit drei `if`-Zweigen plus extra
   ZWJ-Sonderfälle verstreut über 100 Zeilen.

5. **Tests gegen die Tabelle, nicht gegen die Predicate-Funktionen.**
   Heute prüfen ~30 Tests direkt `is_default_emoji(c) == true` — das
   zementiert die alte Struktur. v2-Tests prüfen Verhalten:
   "Codepoint X im Splitter-Output erzeugt Y und braucht Z Zellen Width".

## Skizze der Datenstruktur (Vorschlag, nicht in Stein)

```rust
enum Class {
    /// Geht durch Pango als Sarasa-Glyph. Width = was Sarasa hmtx sagt.
    /// (Default für jeden Codepoint OHNE Eintrag — Tabelle muss das
    /// nicht explizit listen.)
    Plain,

    /// Geht durch Apple Color Emoji als Bitmap. Width = 2.
    /// `emit` ist die Codepoint-Sequenz, die wir an CoreText geben
    /// (oft `c` oder `c + FE0F`, manchmal eine Remap-Sequenz).
    Bitmap { emit: &'static str },

    /// Bare bleibt Plain (Sarasa S/W-Glyph), aber c+FE0F wird Bitmap.
    /// Beispiel: ☀ U+2600. Width = 1 für bare, 2 für mit-VS16.
    BitmapIfVs16 { emit: &'static str },
}

const TABLE: &[(char, Class)] = &[
    ('\u{2600}', Class::BitmapIfVs16 { emit: "\u{2600}\u{FE0F}" }), // ☀
    ('\u{2706}', Class::Bitmap       { emit: "\u{1F4DE}"        }), // ✆ → 📞 (Remap)
    ('\u{2709}', Class::Bitmap       { emit: "\u{2709}\u{FE0F}" }), // ✉ (Sarasa-Miss)
    ('\u{26A1}', Class::Bitmap       { emit: "\u{26A1}\u{FE0F}" }), // ⚡ (war der Auslöser)
    // ... ~250 Einträge gesamt (alle Emoji_Presentation +
    //     alle Extended_Pictographic mit text default + Remaps)
];

fn classify(c: char) -> Class { /* binary search */ }
```

## Migrationsschritte (wenn wir es angehen)

1. **emoji_v2.rs** als neue Datei anlegen, leer.
2. Tabelle generieren: ein `build.rs` oder Skript, das aus den heutigen
   Quellen zusammenführt:
   - alle `is_default_emoji` Codepoints → `Bitmap { emit: c }` (oder
     `c+FE0F` falls `unicode_width::char_width(c) != 2`)
   - alle `is_text_default_pictographic` Codepoints → `BitmapIfVs16`
   - alle MANIFEST-Einträge → übernehmen wie sie sind (Remap-`emit`
     bleibt erhalten)
3. **Auf Konflikte prüfen**: ein Codepoint darf nur in einer der drei
   alten Quellen sein. Falls Überschneidung → menschliche Entscheidung.
4. Splitter neu schreiben — eine Funktion, ein `match classify(c)`.
5. Width-Override = `TABLE.iter().filter_map(|(c, cls)| match cls { …
   Bitmap → Some((c, 2)), BitmapIfVs16 → None /* Default ist 1, nur
   bei VS16 wird's 2, das fängt der Layouter über Sequenz-Detektion */ })`.
   Detail noch zu klären — siehe ⚡-Bug, das ist genau der Knackpunkt.
6. Tests komplett neu — nicht gegen Predicates, sondern Verhalten:
   `assert_eq!(split("⚡"), [Emoji("⚡\u{FE0F}", width=2)])`.
7. Alten Code löschen (`is_default_emoji`, `is_text_default_pictographic`,
   `MANIFEST`, `lookup`, `is_pipeline_source`, `pipeline_width_overrides`,
   alle Tests in `tests/emoji_unit_tests.rs` die direkt Predicates
   testen).
8. Externe Aufrufer umstellen:
   - `window.rs:680` (`split_emoji_segments`) — Signatur kann gleich
     bleiben, Implementierung delegiert auf v2.
   - `md_renderer.rs:405` (`split_emoji_segments`) — dito.
   - `lib.rs:282` (`pipeline_width_overrides`) — Signatur kann gleich
     bleiben, Implementierung iteriert die v2-Tabelle.

## Was NICHT in v2 gehört

- **ZWJ-Sequenz-Logik im Splitter selbst**. Der Splitter klassifiziert
  einzelne Base-Codepoints; ZWJ-Continuations sind eine separate
  Streifen-Phase die jede Emoji-Sequenz zu Ende liest. Das ist heute
  schon halbwegs sauber getrennt, einfach so übernehmen.
- **Font-Loading / Pango-Setup**. Bleibt in `lib.rs`.
- **Render-Pfad / TextChildAnchor / CoreText-Aufrufe**. Bleibt in
  `emoji_overlay.rs` / `window.rs`.

v2 ist ausschließlich: "gegeben ein Codepoint, was ist seine Klasse,
welchen String emittieren wir an den Renderer, welche Width hat er".

## Quellen / Referenzen

- Aktueller Code: `crates/chlodwig-gtk/src/emoji.rs`
- Width-Konsumenten: `crates/chlodwig-gtk/src/lib.rs:282`,
  `crates/chlodwig-core/src/markdown.rs:186` (`FontMetrics::char_width`)
- Splitter-Konsumenten: `crates/chlodwig-gtk/src/window.rs:680`,
  `crates/chlodwig-gtk/src/md_renderer.rs:405`
- Verwandte Gotchas in `CLAUDE.md`: #32 (emoji table missing entries),
  #44 (per-instance overlay registry), #54 (Splitter SSoT — heute nur
  teilweise erfüllt)
- Unicode-Quellen für die Tabellen-Generierung:
  - `https://www.unicode.org/Public/UCD/latest/ucd/emoji/emoji-data.txt`
    (Felder `Emoji_Presentation`, `Extended_Pictographic`)
