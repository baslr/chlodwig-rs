#!/bin/bash
# =============================================================================
# Claude Code 2.1.87 — Vollständige Reverse-Engineering Pipeline
#
# Wandelt cli_formatted.js (18 MB, 523K Zeilen, minified → formatiert) in eine
# strukturierte, annotierte Codebasis um:
#   - 920+ extrahierte Module (vendor/, sections/, chunks/, core/)
#   - 8 thematische Zonen
#   - 6.400+ Name-Mappings (Hash → lesbarer Name)
#   - 3.273-Knoten Dependency-Graph
#   - 874 identifizierte React-Komponenten
#
# Voraussetzung: bun installiert, src/cli_formatted.js vorhanden
# Ergebnis:      src/cli_split.js + alle Metadaten-JSONs + extrahierte Dateien
# =============================================================================

set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

step=0
total=13

run_step() {
  step=$((step + 1))
  echo ""
  echo -e "${BLUE}${BOLD}[$step/$total] $1${NC}"
  echo "─────────────────────────────────────────────────"
}

time_start=$(date +%s)

echo -e "${BOLD}═══════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  Claude Code 2.1.87 — Reverse-Engineering Pipeline${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════${NC}"

# --- Voraussetzungen prüfen ---
if ! command -v bun &> /dev/null; then
  echo -e "${RED}ERROR: bun nicht gefunden. Installiere bun: https://bun.sh${NC}"
  exit 1
fi

if [ ! -f src/cli_formatted.js ]; then
  echo -e "${RED}ERROR: src/cli_formatted.js nicht gefunden.${NC}"
  echo "  Diese Datei wird aus der Binary extrahiert und mit biome formatiert."
  exit 1
fi

# --- Clean ---
run_step "Clean: Generierte Dateien entfernen"
rm -rf src/vendor src/chunks src/core src/sections \
       src/cli_split.js src/zone-map.json src/name-map.json \
       src/dep-graph.json src/react-components.json
echo "  ✓ Alles bereinigt"

# --- Schritt 1: Extract ---
run_step "Extract: d()-Module + G()-Bodies extrahieren → cli_split.js"
bun scripts/extract-chunks.js 2>&1 | tail -8
echo ""
echo -e "  ${GREEN}✓ cli_split.js + vendor/ + sections/ + chunks/ + core/${NC}"

# --- Schritt 2: Zone Index ---
run_step "Zone Index: 8 Zonen kartieren → zone-map.json"
bun scripts/zone-index.js 2>&1 | head -3
echo -e "  ${GREEN}✓ zone-map.json${NC}"

# --- Schritt 3: Name Map (1. Pass) ---
run_step "Name Map: J_()-Exports parsen → name-map.json"
bun scripts/name-map.js 2>&1 | grep -E 'name-map|Coverage|Total'
echo -e "  ${GREEN}✓ name-map.json${NC}"

# --- Schritt 4: Dep Graph (1. Pass) ---
run_step "Dep Graph: G()-Abhängigkeiten analysieren → dep-graph.json"
bun scripts/dep-graph.js 2>&1 | head -3
echo -e "  ${GREEN}✓ dep-graph.json${NC}"

# --- Schritt 5: Rename ---
run_step "Rename: Hash-Dateien → lesbare Namen"
bun scripts/rename-modules.js 2>&1 | grep -E 'Found|renamed|readable'
echo -e "  ${GREEN}✓ Dateien umbenannt${NC}"

# --- Schritt 6: Regenerate (2. Pass mit neuen Namen) ---
run_step "Regenerate: Metadaten mit neuen Namen aktualisieren"
bun scripts/zone-index.js  2>&1 | head -1
bun scripts/name-map.js    2>&1 | grep 'name-map'
bun scripts/dep-graph.js   2>&1 | head -1
echo -e "  ${GREEN}✓ zone-map + name-map + dep-graph aktualisiert${NC}"

# --- Schritt 7: Auto-Label ---
run_step "Auto-Label: G()-Blöcke mit Heuristiken benennen"
bun scripts/auto-label.js 2>&1 | grep -E 'TOTAL|Coverage|Grand|name-map'
echo -e "  ${GREEN}✓ name-map.json angereichert${NC}"

# --- Schritt 8: React Components ---
run_step "React: Komponenten identifizieren → react-components.json"
bun scripts/react-components.js 2>&1 | grep -E 'Found|labeled|components'
echo -e "  ${GREEN}✓ react-components.json${NC}"

# --- Schritt 9: Label Components ---
run_step "Label: React-Komponenten benennen"
bun scripts/label-components.js 2>&1 | grep -E 'labeled|coverage|name-map|Total'
echo -e "  ${GREEN}✓ Komponenten-Labels in name-map${NC}"

# --- Schritt 10: Dep-Graph Visualisierung ---
run_step "Viz: Dependency-Graph HTML generieren"
bun scripts/gen-dep-viz.js 2>&1 | tail -2
echo -e "  ${GREEN}✓ dep-graph.html${NC}"

# --- Schritt 11: Call-Graph ---
run_step "Call-Graph: Funktions-Level Abhängigkeiten analysieren"
bun scripts/call-graph.js 2>&1 | grep -E 'Found|function nodes|hot paths|dead|cycles|Call-Graph|Functions:|Call edges:|Output:'
echo -e "  ${GREEN}✓ call-graph.json${NC}"

# --- Schritt 12: Verify ---
run_step "Verify: Runtime + Tests"

version=$(bun src/run_split.js --version 2>&1)
help_ok=$(bun src/run_split.js --help 2>&1 | head -1)
agents_ok=$(bun src/run_split.js agents 2>&1 | head -1)

if [ "$version" = "2.1.87 (Claude Code)" ]; then
  echo -e "  ${GREEN}✓ --version: $version${NC}"
else
  echo -e "  ${RED}✗ --version: $version${NC}"
fi

if echo "$help_ok" | grep -q "Usage: claude"; then
  echo -e "  ${GREEN}✓ --help: OK${NC}"
else
  echo -e "  ${RED}✗ --help: FAILED${NC}"
fi

if echo "$agents_ok" | grep -q "active agents"; then
  echo -e "  ${GREEN}✓ agents: OK${NC}"
else
  echo -e "  ${RED}✗ agents: FAILED${NC}"
fi

echo ""
test_result=$(bun test 2>&1)
test_pass=$(echo "$test_result" | grep -o '[0-9]* pass' | head -1)
test_fail=$(echo "$test_result" | grep -o '[0-9]* fail' | head -1)
echo -e "  ${GREEN}✓ Tests: $test_pass, $test_fail${NC}"

# --- Summary ---
time_end=$(date +%s)
elapsed=$((time_end - time_start))

echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  Pipeline abgeschlossen in ${elapsed}s${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════${NC}"
echo ""

# Sammle Statistiken
split_lines=$(wc -l < src/cli_split.js | tr -d ' ')
split_mb=$(du -m src/cli_split.js | cut -f1)
sections=$(ls src/sections/ 2>/dev/null | wc -l | tr -d ' ')
vendor=$(find src/vendor -name '*.js' 2>/dev/null | wc -l | tr -d ' ')
chunks=$(ls src/chunks/ 2>/dev/null | wc -l | tr -d ' ')
core=$(ls src/core/ 2>/dev/null | wc -l | tr -d ' ')
total_files=$((sections + vendor + chunks + core))
nm_entries=$(node -e "console.log(Object.keys(JSON.parse(require('fs').readFileSync('src/name-map.json','utf8'))).length)")
dg_nodes=$(node -e "console.log(JSON.parse(require('fs').readFileSync('src/dep-graph.json','utf8')).totalNodes)")
dg_edges=$(node -e "console.log(JSON.parse(require('fs').readFileSync('src/dep-graph.json','utf8')).totalEdges)")
rc_total=$(node -e "console.log(JSON.parse(require('fs').readFileSync('src/react-components.json','utf8')).totalComponents)")
cg_funcs=$(node -e "console.log(JSON.parse(require('fs').readFileSync('src/call-graph.json','utf8')).totalFunctions)")
cg_edges=$(node -e "console.log(JSON.parse(require('fs').readFileSync('src/call-graph.json','utf8')).totalCallEdges)")

echo "  Artefakte:"
echo "  ─────────────────────────────────────────────"
echo "  cli_split.js          ${split_lines} Zeilen / ${split_mb} MB"
echo "  Extrahierte Dateien   ${total_files} (${sections} sections, ${vendor} vendor, ${chunks} chunks, ${core} core)"
echo "  name-map.json         ${nm_entries} Einträge"
echo "  dep-graph.json        ${dg_nodes} Knoten / ${dg_edges} Kanten"
echo "  call-graph.json       ${cg_funcs} Funktionen / ${cg_edges} Call-Edges"
echo "  react-components.json ${rc_total} Komponenten"
echo "  zone-map.json         8 Zonen"
echo ""
echo "  Launcher:  bun src/run_split.js [--version|--help|agents]"
echo "  Shell:     ./claude-split.sh [args]"
echo ""
