# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

---

## Textformatierung

**Fett**, *Kursiv*, ***Fett & Kursiv***, ~~Durchgestrichen~~, `Inline-Code`

Hochgestellt: X<sup>2</sup> · Tiefgestellt: H<sub>2</sub>O

> Blockzitat
>
> > Verschachteltes Blockzitat

## Listen

### Ungeordnet
- Punkt 1
  - Unterpunkt A
    - Unter-Unterpunkt
- Punkt 2
* Alternativ mit Stern
+ Oder mit Plus

### Geordnet
1. Erster Punkt
2. Zweiter Punkt
   1. Unterpunkt
   2. Unterpunkt
3. Dritter Punkt

### Aufgabenliste
- [x] Erledigt
- [ ] Offen
- [ ] Noch zu tun

## Links & Bilder

[Inline-Link](https://example.com "Tooltip")

[Referenz-Link][ref1]

[ref1]: https://example.com "Referenz"

Automatischer Link: <https://example.com>

![Alt-Text](https://via.placeholder.com/150 "Bildtitel")

[![Bild als Link](https://via.placeholder.com/80)](https://example.com)

## Code

Inline: `console.log("hello")`

Fenced Code Block mit Syntax-Highlighting:

```rust
fn main() {
    let msg = "Hallo Welt!";
    println!("{}", msg);
}
```

```python
def greet(name: str) -> str:
    return f"Hallo {name}!"
```

Eingerückter Code-Block (4 Spaces):

    fn foo() {
        bar();
    }

## Tabellen

| Links | Zentriert | Rechts |
|:------|:---------:|-------:|
| A1    |    B1     |     C1 |
| A2    |    B2     |     C2 |
| A3    |    B3     |     C3 |

## Horizontale Linien

---
***
___

## Fußnoten

Hier ist ein Satz mit Fußnote[^1] und noch eine[^note].

[^1]: Das ist die erste Fußnote.
[^note]: Das ist eine benannte Fußnote.

## Definitionen (manche Parser)

Begriff
: Definition des Begriffs

Anderer Begriff
: Andere Definition

## Abkürzungen (manche Parser)

*[HTML]: Hyper Text Markup Language
*[CSS]: Cascading Style Sheets

HTML und CSS sind Web-Technologien.

## Mathematik (LaTeX, z.B. GitHub/KaTeX)

Inline: $E = mc^2$

Block:

$$
\sum_{i=1}^{n} x_i = \frac{n(n+1)}{2}
$$

## Emojis

:rocket: :white_check_mark: :warning: :x: :bulb:

## Escaping

\*Nicht kursiv\* · \`Kein Code\` · \# Kein Heading

## Zusammenklappbar (HTML in Markdown)

<details>
<summary>Klick mich auf</summary>

Versteckter Inhalt mit **Markdown** drin!

- Punkt 1
- Punkt 2

```js
console.log("überraschung!");
```

</details>

## Tastenkürzel

Drücke <kbd>Ctrl</kbd> + <kbd>C</kbd> zum Kopieren.

## Alerts / Admonitions (GitHub)

> [!NOTE]
> Nützliche Information.

> [!TIP]
> Hilfreicher Tipp.

> [!WARNING]
> Achtung!

> [!CAUTION]
> Gefahr!

## Rohes HTML

<div align="center">
  <strong>Zentrierter Text</strong><br>
  <em>mit HTML</em>
</div>

## Kommentare (unsichtbar)

<!-- Das ist ein Kommentar, der nicht gerendert wird -->

## Zeilenumbruch

Zeile eins  
Zeile zwei (zwei Leerzeichen am Ende = `<br>`)
