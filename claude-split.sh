#!/bin/bash
# Claude Code 2.1.87 - Zerlegte Version (447 Module extrahiert)
# Startet die aus der Binary extrahierte und zerlegte Version mit Bun

DIR="$(cd "$(dirname "$0")" && pwd)"
exec bun "$DIR/src/run_split.js" "$@"
