#!/bin/bash
# Chlodwig FinderSync Extension Watchdog
#
# This script is run by a LaunchAgent every 30 seconds.
# It checks if the FinderSync extension is still registered and alive.
# If not, it re-registers and restarts it.
#
# Why this is needed:
#   macOS AMFI (Apple Mobile File Integrity) periodically kills FinderSync
#   extensions signed with self-signed certificates. launchd usually respawns
#   them, but after too many kill/respawn cycles, macOS gives up and
#   deregisters the extension entirely. This watchdog catches that case.

BUNDLE_ID="rs.chlodwig.gtk.FinderSync"
APP_DIR="$HOME/Applications/Chlodwig.app"
APPEX_DIR="$APP_DIR/Contents/PlugIns/ChlodwigFinderSync.appex"
LOG_FILE="$HOME/.chlodwig-rs/finder-watchdog.log"

mkdir -p "$(dirname "$LOG_FILE")"

log_msg() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> "$LOG_FILE"
}

# Bail if .appex doesn't exist
if [ ! -d "$APPEX_DIR" ]; then
    exit 0
fi

# Check if extension is registered with pluginkit
if pluginkit -m -i "$BUNDLE_ID" 2>/dev/null | grep -q "$BUNDLE_ID"; then
    # Registered — check if process is alive
    if ps aux | grep -v grep | grep -q "ChlodwigFinderSync"; then
        # All good — nothing to do
        exit 0
    fi

    # Registered but not running — Finder will spawn it on demand.
    # Just make sure it's enabled.
    pluginkit -e use -i "$BUNDLE_ID" 2>/dev/null
    exit 0
fi

# Extension not registered — re-register it
log_msg "Extension not registered — re-registering"

pluginkit -a "$APPEX_DIR" 2>/dev/null
pluginkit -e use -i "$BUNDLE_ID" 2>/dev/null

# Verify
if pluginkit -m -i "$BUNDLE_ID" 2>/dev/null | grep -q "$BUNDLE_ID"; then
    log_msg "Re-registration successful"
    # Soft-restart Finder to pick up the extension
    killall Finder 2>/dev/null
else
    log_msg "Re-registration FAILED"
fi

# Trim log to last 100 lines
if [ -f "$LOG_FILE" ]; then
    tail -100 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
fi
