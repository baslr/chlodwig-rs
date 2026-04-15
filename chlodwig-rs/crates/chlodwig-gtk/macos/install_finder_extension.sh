#!/bin/bash
set -euo pipefail

# Install the Chlodwig FinderSync extension.
#
# This adds a "Chlodwig" entry directly in the Finder right-click context menu
# (not under "Open With", not under "Services" — a direct top-level entry).
# Works on folders AND on empty space in Finder windows.
#
# Prerequisites:
#   - Chlodwig.app must be installed in ~/Applications/
#   - Xcode Command Line Tools (for swiftc)
#
# What this script does:
#   1. Creates a self-signed code signing certificate (if not present)
#   2. Compiles the FinderSync extension (Swift → .appex bundle)
#   3. Signs the extension with sandbox entitlements
#   4. Embeds the extension in Chlodwig.app
#   5. Signs the host app
#   6. Registers the extension with macOS
#   7. Restarts Finder to activate

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$HOME/Applications/Chlodwig.app"
BUNDLE_ID="rs.chlodwig.gtk"
EXT_BUNDLE_ID="${BUNDLE_ID}.FinderSync"
CERT_NAME="Chlodwig CodeSign"
BUILD_DIR="/tmp/chlodwig-finder-build"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}==> $1${NC}"; }
warn()  { echo -e "${YELLOW}==> $1${NC}"; }
error() { echo -e "${RED}==> ERROR: $1${NC}" >&2; exit 1; }

# --- Preflight checks ---

if [ ! -d "$APP_DIR" ]; then
    error "Chlodwig.app not found at $APP_DIR\n    Run build_app.sh first, then copy to ~/Applications/"
fi

if ! command -v swiftc &>/dev/null; then
    error "swiftc not found. Install Xcode Command Line Tools:\n    xcode-select --install"
fi

# --- Clean build directory ---

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# --- Step 1: Code signing certificate ---

info "Checking code signing certificate..."

if security find-identity -v -p codesigning 2>/dev/null | grep -q "$CERT_NAME"; then
    info "Certificate '$CERT_NAME' already exists."
else
    info "Creating self-signed code signing certificate..."

    openssl req -x509 -newkey rsa:2048 \
        -keyout "$BUILD_DIR/codesign.key" \
        -out "$BUILD_DIR/codesign.crt" \
        -days 365 -nodes \
        -subj "/CN=$CERT_NAME" \
        -addext "extendedKeyUsage=codeSigning" \
        -addext "keyUsage=digitalSignature" \
        2>/dev/null

    # -legacy flag is required for macOS Keychain to accept the PKCS12
    openssl pkcs12 -export -legacy \
        -in "$BUILD_DIR/codesign.crt" \
        -inkey "$BUILD_DIR/codesign.key" \
        -out "$BUILD_DIR/codesign.p12" \
        -passout pass:temp123 \
        2>/dev/null

    security import "$BUILD_DIR/codesign.p12" \
        -k ~/Library/Keychains/login.keychain-db \
        -P "temp123" \
        -T /usr/bin/codesign \
        -T /usr/bin/security \
        2>/dev/null

    security add-trusted-cert -r trustRoot \
        -k ~/Library/Keychains/login.keychain-db \
        "$BUILD_DIR/codesign.crt" \
        2>/dev/null

    # Verify
    if ! security find-identity -v -p codesigning 2>/dev/null | grep -q "$CERT_NAME"; then
        error "Certificate creation failed. Check Keychain Access."
    fi

    info "Certificate created and trusted."
fi

# --- Step 2: Write Swift source ---

info "Writing FinderSync extension source..."

cat > "$BUILD_DIR/FinderSync.swift" << 'SWIFT'
import Cocoa
import FinderSync
import os.log

private let logger = OSLog(subsystem: "rs.chlodwig.gtk.FinderSync", category: "extension")

// @objc name MUST match NSExtensionPrincipalClass in Info.plist.
// Without @objc, Swift mangles the name and the extension runtime can't find the class.
@objc(ChlodwigFinderSync)
class ChlodwigFinderSync: FIFinderSync {

    override init() {
        super.init()
        // Monitor all volumes — context menu appears everywhere
        FIFinderSyncController.default().directoryURLs = [URL(fileURLWithPath: "/")]
        os_log("init — monitoring /", log: logger, type: .error)
    }

    // MARK: - Context Menu

    override func menu(for menuKind: FIMenuKind) -> NSMenu? {
        os_log("menu(for:) called with kind=%d", log: logger, type: .error, menuKind.rawValue)

        let menu = NSMenu(title: "Chlodwig")
        let item = NSMenuItem(
            title: "Open in Chlodwig",
            action: #selector(openChlodwig(_:)),
            keyEquivalent: ""
        )
        item.image = NSImage(named: NSImage.Name("NSActionTemplate"))
        menu.addItem(item)
        return menu
    }

    @objc func openChlodwig(_ sender: Any?) {
        os_log("openChlodwig called", log: logger, type: .error)

        var targetURL: URL?

        let items = FIFinderSyncController.default().selectedItemURLs() ?? []
        let targetPath = FIFinderSyncController.default().targetedURL()?.path ?? "nil"
        os_log("selectedItems=%d, target=%{public}@", log: logger, type: .error, items.count, targetPath as NSString)

        for item in items {
            var isDir: ObjCBool = false
            if FileManager.default.fileExists(atPath: item.path, isDirectory: &isDir) {
                if isDir.boolValue {
                    targetURL = item
                } else {
                    targetURL = item.deletingLastPathComponent()
                }
                break
            }
        }

        if targetURL == nil {
            targetURL = FIFinderSyncController.default().targetedURL()
        }

        guard let dir = targetURL else {
            os_log("no target directory — aborting", log: logger, type: .error)
            return
        }

        os_log("opening Chlodwig with dir=%{public}@", log: logger, type: .error, dir.path as NSString)

        // Pass directory to host app via a custom NSPasteboard.
        //
        // WHY this approach (and not the alternatives):
        // 1. NSWorkspace.OpenConfiguration.environment → env vars don't arrive from sandbox
        // 2. Marker file at /tmp via FileManager → sandbox blocks /tmp writes (SIGTERM)
        // 3. Custom URL scheme (chlodwig://) → GTK removes Apple Event GURL handler
        // 4. /usr/bin/open --args → args via Apple Events, GTK rejects unknown flags
        // 5. Direct Process() binary launch → sandbox blocks exec
        // 6. /usr/bin/open --env → sandbox strips --env flags
        // 7. Marker file in extension container → TCC dialog every launch (ad-hoc signed)
        // 8. /bin/sh subprocess to write /tmp → child inherits sandbox restrictions
        // 9. App Group UserDefaults → requires Apple Developer Team ID
        // 10. DistributedNotificationCenter → timing issue (app not running yet)
        //
        // 11. Custom NSPasteboard → WORKS!
        //     NSPasteboard(name:) creates a named pasteboard that is:
        //     - Cross-process (any app can read it by name)
        //     - NOT the general pasteboard (doesn't clobber clipboard)
        //     - Accessible from sandboxed extensions (NSPasteboard is IPC, not file I/O)
        //     - No TCC dialog (not a protected resource)
        //     - Survives until the pasteboard server clears it or system reboot
        //
        let pboard = NSPasteboard(name: NSPasteboard.Name("rs.chlodwig.finder-open"))
        pboard.clearContents()
        pboard.setString(dir.path, forType: .string)
        os_log("wrote dir to pasteboard rs.chlodwig.finder-open", log: logger, type: .error)

        // Find the app path — prefer ~/Applications over LaunchServices (which may
        // find build artifacts in target/).
        let realHome = String(cString: getpwuid(getuid())!.pointee.pw_dir)
        let userAppsPath = "\(realHome)/Applications/Chlodwig.app"
        let systemAppsPath = "/Applications/Chlodwig.app"

        let appBundlePath: String
        if FileManager.default.fileExists(atPath: userAppsPath) {
            appBundlePath = userAppsPath
        } else if FileManager.default.fileExists(atPath: systemAppsPath) {
            appBundlePath = systemAppsPath
        } else {
            os_log("could not find Chlodwig.app", log: logger, type: .error)
            return
        }

        os_log("launching %{public}@", log: logger, type: .error, appBundlePath as NSString)

        let task = Process()
        task.executableURL = URL(fileURLWithPath: "/usr/bin/open")
        task.arguments = ["-n", "-a", appBundlePath]

        do {
            try task.run()
            os_log("launched successfully", log: logger, type: .error)
        } catch {
            os_log("failed to launch: %{public}@", log: logger, type: .error, error.localizedDescription as NSString)
        }
    }
}
SWIFT

# ObjC entry point — NSExtensionMain is the correct entry for appex extensions
# (NSApplicationMain is for full apps, not for XPC-based extensions)
cat > "$BUILD_DIR/main.m" << 'OBJC'
#import <Foundation/Foundation.h>

extern int NSExtensionMain(int argc, const char *argv[]);

int main(int argc, const char *argv[]) {
    return NSExtensionMain(argc, argv);
}
OBJC

# --- Step 3: Build .appex bundle structure ---

info "Building .appex bundle..."

APPEX_DIR="$BUILD_DIR/ChlodwigFinderSync.appex"
APPEX_CONTENTS="$APPEX_DIR/Contents"
APPEX_MACOS="$APPEX_CONTENTS/MacOS"

mkdir -p "$APPEX_MACOS"

# Compile Swift code as a library (no entry point — main.m provides it)
swiftc \
    -parse-as-library \
    -emit-object \
    -module-name ChlodwigFinderSync \
    -o "$BUILD_DIR/FinderSync.o" \
    -target arm64-apple-macos14.0 \
    -framework Cocoa \
    -framework FinderSync \
    "$BUILD_DIR/FinderSync.swift"

# Compile ObjC entry point (calls NSExtensionMain — the proper extension entry)
clang -c \
    -o "$BUILD_DIR/main.o" \
    -target arm64-apple-macos14.0 \
    "$BUILD_DIR/main.m"

# Link everything into a single executable
clang \
    -o "$APPEX_MACOS/ChlodwigFinderSync" \
    -target arm64-apple-macos14.0 \
    -L "$(xcrun --show-sdk-path)/usr/lib/swift" \
    -L "$(xcrun --show-sdk-path)/usr/lib" \
    -rpath /usr/lib/swift \
    -framework Cocoa \
    -framework FinderSync \
    -framework Foundation \
    -lswiftCore \
    "$BUILD_DIR/FinderSync.o" \
    "$BUILD_DIR/main.o"

# Verify it's an executable (not dylib)
FILE_TYPE="$(file "$APPEX_MACOS/ChlodwigFinderSync")"
if [[ "$FILE_TYPE" != *"executable"* ]]; then
    error "Binary is not an executable: $FILE_TYPE\n    codesign won't embed entitlements in a dylib."
fi

# Info.plist
cat > "$APPEX_CONTENTS/Info.plist" << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>Chlodwig Finder Integration</string>
    <key>CFBundleExecutable</key>
    <string>ChlodwigFinderSync</string>
    <key>CFBundleIdentifier</key>
    <string>${EXT_BUNDLE_ID}</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>ChlodwigFinderSync</string>
    <key>CFBundlePackageType</key>
    <string>XPC!</string>
    <key>CFBundleShortVersionString</key>
    <string>0.1.0</string>
    <key>CFBundleVersion</key>
    <string>0.1.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>14.0</string>
    <key>LSUIElement</key>
    <true/>
    <key>NSExtension</key>
    <dict>
        <key>NSExtensionAttributes</key>
        <dict/>
        <key>NSExtensionPointIdentifier</key>
        <string>com.apple.FinderSync</string>
        <key>NSExtensionPrincipalClass</key>
        <string>ChlodwigFinderSync</string>
    </dict>
    <key>NSPrincipalClass</key>
    <string>NSApplication</string>
</dict>
</plist>
PLIST

# --- Step 4: Sign the extension with sandbox entitlements ---

info "Signing extension with sandbox entitlements..."

cat > "$BUILD_DIR/FinderSync.entitlements" << 'ENT'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-only</key>
    <true/>
    <key>com.apple.security.files.home-relative-path.read-only</key>
    <array>
        <string>/Applications/</string>
    </array>
    <key>com.apple.security.temporary-exception.files.absolute-path.read-only</key>
    <array>
        <string>/Applications/</string>
    </array>
</dict>
</plist>
ENT

codesign --force --sign "$CERT_NAME" \
    --entitlements "$BUILD_DIR/FinderSync.entitlements" \
    "$APPEX_DIR"

# Verify entitlements are embedded
if ! codesign -d --entitlements - "$APPEX_DIR" 2>&1 | grep -q "app-sandbox"; then
    error "Entitlements not embedded! Check certificate and binary type."
fi

info "Extension signed. Sandbox entitlements verified."

# --- Step 5: Embed in Chlodwig.app ---

info "Embedding extension in Chlodwig.app..."

mkdir -p "$APP_DIR/Contents/PlugIns"
rm -rf "$APP_DIR/Contents/PlugIns/ChlodwigFinderSync.appex"
cp -R "$APPEX_DIR" "$APP_DIR/Contents/PlugIns/"

# --- Step 6: Sign host app ---

info "Signing host app..."

# Sign the host app WITHOUT sandbox entitlements.
# Only the FinderSync extension needs sandbox (Apple requirement).
# The host app must remain unsandboxed so it can:
#   - chdir to any directory (CHLODWIG_PROJECT_DIR)
#   - read/write files anywhere on the filesystem
#   - run subprocesses (Bash tool, cargo, git, etc.)
#
# If the host app is sandboxed, macOS forces CWD to
# ~/Library/Containers/<bundle-id>/Data and CHLODWIG_PROJECT_DIR is ignored.

# Sign WITHOUT entitlements (no sandbox, no restrictions)
codesign --force --sign "$CERT_NAME" \
    "$APP_DIR"

# Verify the host app was NOT signed with sandbox
if codesign -d --entitlements - "$APP_DIR" 2>&1 | grep -q "app-sandbox"; then
    error "Host app has sandbox entitlements! This breaks CHLODWIG_PROJECT_DIR."
fi

# Verify extension signature survived host signing
if ! codesign -d --entitlements - "$APP_DIR/Contents/PlugIns/ChlodwigFinderSync.appex" 2>&1 | grep -q "app-sandbox"; then
    error "Extension entitlements lost after host signing!"
fi

# --- Step 7: Register extension and restart Finder ---

info "Registering extension with macOS..."

# Deregister old version (ignore errors)
pluginkit -r "$APP_DIR/Contents/PlugIns/ChlodwigFinderSync.appex" 2>/dev/null || true

# Register
pluginkit -a "$APP_DIR/Contents/PlugIns/ChlodwigFinderSync.appex"

# Enable
pluginkit -e use -i "$EXT_BUNDLE_ID"

# Verify registration
if ! pluginkit -m -i "$EXT_BUNDLE_ID" 2>/dev/null | grep -q "$EXT_BUNDLE_ID"; then
    error "Extension not registered with pluginkit!"
fi

info "Restarting Finder..."
killall Finder
sleep 3

# --- Step 8: Verify ---

info "Verifying..."

# Check process is running
if ps aux | grep -v grep | grep -q "ChlodwigFinderSync"; then
    info "FinderSync extension process is running."
else
    warn "FinderSync extension process not found. Checking logs..."
fi

# Check for errors in system log
ERRORS=$(log show --predicate 'eventMessage contains "rs.chlodwig.gtk.FinderSync"' \
    --last 10s --style compact 2>&1 \
    | grep -iE "reject|mis-config|sandbox.*fail|must be sandboxed" || true)

if [ -n "$ERRORS" ]; then
    warn "Potential issues found in system log:"
    echo "$ERRORS"
else
    info "No errors in system log."
fi

echo ""
info "Done! Right-click in Finder to see the 'Chlodwig' menu entry."
echo ""
echo "  Troubleshooting:"
echo "    - Open System Settings → Privacy & Security → Extensions → Added Extensions"
echo "    - Make sure 'Chlodwig Finder Integration' is enabled"
echo "    - Run: pluginkit -m -p com.apple.FinderSync"
echo "    - Run: log show --predicate 'eventMessage contains \"ChlodwigFinderSync\"' --last 1m"
echo ""

# --- Cleanup ---
rm -rf "$BUILD_DIR"
