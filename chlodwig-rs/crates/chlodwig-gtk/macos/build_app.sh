#!/bin/bash
set -euo pipefail

# Build a macOS .app bundle for chlodwig-gtk.
#
# Usage:
#   ./crates/chlodwig-gtk/macos/build_app.sh           # Build only
#   ./crates/chlodwig-gtk/macos/build_app.sh --run      # Build and launch
#   ./crates/chlodwig-gtk/macos/build_app.sh --skip-build  # Bundle only (binary already compiled)
#
# Creates: target/Chlodwig.app/
#   Contents/
#     Info.plist
#     MacOS/
#       chlodwig-gtk   (release binary)
#     Resources/
#       (reserved for icons, assets)
#
# Why a .app bundle?
#   UNUserNotificationCenter (macOS native notifications) requires a bundle
#   with a CFBundleIdentifier. Without it, currentNotificationCenter crashes
#   with NSInternalInconsistencyException: bundleProxyForCurrentProcess is nil.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
APP_NAME="Chlodwig"
APP_DIR="$PROJECT_ROOT/target/${APP_NAME}.app"
CONTENTS_DIR="$APP_DIR/Contents"
MACOS_DIR="$CONTENTS_DIR/MacOS"
RESOURCES_DIR="$CONTENTS_DIR/Resources"
BINARY="$PROJECT_ROOT/target/release/chlodwig-gtk"

SKIP_BUILD=false
RUN_AFTER=false

for arg in "$@"; do
    case "$arg" in
        --skip-build) SKIP_BUILD=true ;;
        --run)        RUN_AFTER=true ;;
        *)            echo "Unknown arg: $arg"; exit 1 ;;
    esac
done

# Build release binary
if [ "$SKIP_BUILD" = false ]; then
    echo "==> Building release binary..."
    cargo build --release -p chlodwig-gtk
fi

if [ ! -f "$BINARY" ]; then
    echo "ERROR: Binary not found at $BINARY"
    echo "       Run without --skip-build first."
    exit 1
fi

echo "==> Creating ${APP_NAME}.app bundle..."
mkdir -p "$MACOS_DIR"
mkdir -p "$RESOURCES_DIR"

# Copy Info.plist
cp "$SCRIPT_DIR/Info.plist" "$CONTENTS_DIR/Info.plist"

# Copy binary
cp "$BINARY" "$MACOS_DIR/chlodwig-gtk"

# Copy icon if present
if [ -f "$SCRIPT_DIR/AppIcon.icns" ]; then
    cp "$SCRIPT_DIR/AppIcon.icns" "$RESOURCES_DIR/AppIcon.icns"
fi

# Ad-hoc code sign (required for UNUserNotificationCenter on modern macOS)
echo "==> Code signing (ad-hoc)..."
codesign --force --sign - "$APP_DIR"

echo "==> Done: $APP_DIR"

# Optionally run
if [ "$RUN_AFTER" = true ]; then
    echo "==> Launching ${APP_NAME}.app..."
    open "$APP_DIR"
fi
