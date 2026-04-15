#!/bin/bash
set -euo pipefail

# Build and launch Chlodwig.app (macOS .app bundle).
#
# This is the standard way to run chlodwig-gtk on macOS.
# The .app bundle is required for native notifications
# (UNUserNotificationCenter needs a CFBundleIdentifier).
#
# Environment variables are passed through to the app via `open --env`.
# API key can also be configured in ~/.chlodwig-rs/config.json

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_SCRIPT="$SCRIPT_DIR/crates/chlodwig-gtk/macos/build_app.sh"
APP="$SCRIPT_DIR/target/Chlodwig.app"

# Build the bundle (compiles + assembles + code-signs)
"$BUILD_SCRIPT"

echo "==> Launching Chlodwig.app..."

# Pass RUST_LOG through for debug tracing
RUST_LOG="${RUST_LOG:-chlodwig_gtk=debug,chlodwig_core=debug}"

# Build open command with --env flags
OPEN_ARGS=("$APP" --env RUST_LOG="$RUST_LOG")

# Pass through API key if set in shell environment
if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
    OPEN_ARGS+=(--env ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY")
fi
if [[ -n "${ANTHROPIC_AUTH_TOKEN:-}" ]]; then
    OPEN_ARGS+=(--env ANTHROPIC_AUTH_TOKEN="$ANTHROPIC_AUTH_TOKEN")
fi

# Pass through model override if set
if [[ -n "${CHLODWIG_MODEL:-}" ]]; then
    OPEN_ARGS+=(--env CHLODWIG_MODEL="$CHLODWIG_MODEL")
fi

# Pass through base URL if set
if [[ -n "${ANTHROPIC_BASE_URL:-}" ]]; then
    OPEN_ARGS+=(--env ANTHROPIC_BASE_URL="$ANTHROPIC_BASE_URL")
fi

open "${OPEN_ARGS[@]}"
