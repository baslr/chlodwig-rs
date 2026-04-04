# Formatierung von cli.js (2.1.88)

## Kommando

```bash
npx prettier --tab-width 2 --print-width 120 --parser babel 2.1.88/cli.js > 2.1.88/cli_formatted.js
```

## Details

- **Tool:** Prettier 3.8.1 (via npx)
- **Parser:** babel
- **Einrückung:** 2 Spaces
- **Zeilenbreite:** 120 Zeichen
- **Biome** (2.4.9) wurde zuerst versucht, hat aber bei der 13 MB minifizierten Datei nicht funktioniert (Timeout/OOM, keine Ausgabe)

## Ergebnis

| | cli.js (minifiziert) | cli_formatted.js |
|---|---|---|
| **Zeilen** | 16.667 | 552.086 |
| **Größe** | 12,4 MB | 17,4 MB |
