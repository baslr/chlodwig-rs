#!/bin/bash
set -euo pipefail

# Build a macOS .app bundle for chlodwig-gtk.
#
# Usage:
#   ./crates/chlodwig-gtk/macos/build_app.sh                    # Build only
#   ./crates/chlodwig-gtk/macos/build_app.sh --install           # Build + copy to ~/Applications/
#   ./crates/chlodwig-gtk/macos/build_app.sh --run               # Build and launch
#   ./crates/chlodwig-gtk/macos/build_app.sh --skip-build        # Bundle only (binary already compiled)
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
INSTALL=false

for arg in "$@"; do
    case "$arg" in
        --skip-build) SKIP_BUILD=true ;;
        --run)        RUN_AFTER=true ;;
        --install)    INSTALL=true ;;
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

# Preserve FinderSync extension from installed app (if present).
# build_app.sh doesn't know how to build the extension (install_finder_extension.sh does),
# so we save it before overwriting and restore it after.
INSTALL_DIR="$HOME/Applications"
INSTALLED_APP="$INSTALL_DIR/${APP_NAME}.app"
SAVED_APPEX=""
if [ -d "$INSTALLED_APP/Contents/PlugIns/ChlodwigFinderSync.appex" ]; then
    SAVED_APPEX="/tmp/chlodwig-saved-appex"
    rm -rf "$SAVED_APPEX"
    cp -R "$INSTALLED_APP/Contents/PlugIns/ChlodwigFinderSync.appex" "$SAVED_APPEX"
    echo "==> Saved existing FinderSync extension for re-embedding."
fi

# Ad-hoc code sign (required for UNUserNotificationCenter on modern macOS)
echo "==> Code signing (ad-hoc)..."
codesign --force --sign - "$APP_DIR"

echo "==> Done: $APP_DIR"

# Install to ~/Applications/
if [ "$INSTALL" = true ]; then
    mkdir -p "$INSTALL_DIR"
    echo "==> Installing to $INSTALL_DIR/${APP_NAME}.app..."
    rm -rf "$INSTALL_DIR/${APP_NAME}.app"
    cp -R "$APP_DIR" "$INSTALL_DIR/${APP_NAME}.app"

    # Restore FinderSync extension if we saved one
    if [ -n "$SAVED_APPEX" ] && [ -d "$SAVED_APPEX" ]; then
        echo "==> Re-embedding FinderSync extension..."
        mkdir -p "$INSTALLED_APP/Contents/PlugIns"
        cp -R "$SAVED_APPEX" "$INSTALLED_APP/Contents/PlugIns/ChlodwigFinderSync.appex"
        rm -rf "$SAVED_APPEX"

        # Re-sign with the Chlodwig CodeSign cert if available, else ad-hoc
        CERT_NAME="Chlodwig CodeSign"
        if security find-identity -v -p codesigning 2>/dev/null | grep -q "$CERT_NAME"; then
            codesign --force --sign "$CERT_NAME" "$INSTALLED_APP"
        else
            codesign --force --sign - "$INSTALLED_APP"
        fi
        echo "==> FinderSync extension restored."
    fi

    echo "==> Installed."
fi

# Optionally run
if [ "$RUN_AFTER" = true ]; then
    echo "==> Launching ${APP_NAME}.app..."
    open "$APP_DIR"
fi
