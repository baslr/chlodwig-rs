#!/bin/bash
# Claude Code 2.1.87 - Entpackte Version
# Startet die aus der Binary extrahierte Version mit Bun

DIR="$(cd "$(dirname "$0")" && pwd)"
exec bun "$DIR/src/run.js" "$@"
