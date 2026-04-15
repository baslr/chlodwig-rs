//! Native macOS notifications via `UNUserNotificationCenter`.
//!
//! Uses Apple's modern UserNotifications framework (macOS 10.14+).
//!
//! **Requires** a `.app` bundle with `Info.plist` containing a
//! `CFBundleIdentifier`. Build the bundle via:
//!   `./crates/chlodwig-gtk/macos/build_app.sh`
//!
//! Without a bundle, `has_app_bundle()` returns false and the notification
//! functions log a warning and return (no crash, no fallback).

use objc2_foundation::{NSBundle, NSString};

/// Check if the process is running inside a `.app` bundle.
///
/// `UNUserNotificationCenter` requires a bundle with a `CFBundleIdentifier`.
/// A bare binary from `cargo run` does NOT have one — calling
/// `currentNotificationCenter` without a bundle crashes with
/// `NSInternalInconsistencyException`.
pub fn has_app_bundle() -> bool {
    let bundle = NSBundle::mainBundle();
    bundle.bundleIdentifier().is_some()
}

/// Request notification permission from the user.
///
/// On first call, macOS shows a system dialog asking the user to allow
/// notifications. The result is cached by macOS — subsequent calls are
/// no-ops. This should be called once at app startup.
///
/// No-op when running without a `.app` bundle.
pub fn request_notification_permission() {
    if !has_app_bundle() {
        tracing::debug!("No .app bundle — notifications unavailable. Build with: ./crates/chlodwig-gtk/macos/build_app.sh");
        return;
    }

    use objc2::runtime::Bool;
    use objc2_foundation::NSError;
    use objc2_user_notifications::{UNAuthorizationOptions, UNUserNotificationCenter};

    let center = UNUserNotificationCenter::currentNotificationCenter();
    let options = UNAuthorizationOptions::Alert
        | UNAuthorizationOptions::Sound
        | UNAuthorizationOptions::Badge;

    let handler = block2::RcBlock::new(|granted: Bool, error: *mut NSError| {
        if !error.is_null() {
            tracing::debug!("Notification permission error: {error:?}");
        } else {
            tracing::debug!("Notification permission granted: {}", granted.as_bool());
        }
    });

    center.requestAuthorizationWithOptions_completionHandler(options, &handler);
}

/// Send a native macOS notification via `UNUserNotificationCenter`.
///
/// - `title`: The notification title (bold text, e.g. "Chlodwig")
/// - `body`: The notification body (e.g. "Turn complete ✓")
/// - `subtitle`: Shown below the title in smaller text (e.g. project name)
///
/// No-op when running without a `.app` bundle.
/// Fire-and-forget — errors are logged, never propagated.
pub fn send_native_notification(title: &str, body: &str, subtitle: &str) {
    if !has_app_bundle() {
        tracing::debug!("No .app bundle — skipping notification");
        return;
    }

    use objc2_foundation::NSError;
    use objc2_user_notifications::{
        UNMutableNotificationContent, UNNotificationRequest, UNNotificationSound,
        UNUserNotificationCenter,
    };

    let content = UNMutableNotificationContent::new();
    content.setTitle(&NSString::from_str(title));
    content.setBody(&NSString::from_str(body));
    content.setSubtitle(&NSString::from_str(subtitle));

    let sound = UNNotificationSound::defaultSound();
    content.setSound(Some(&sound));

    // Fixed ID so repeated notifications replace each other
    let request_id = NSString::from_str("chlodwig-turn-complete");
    let request = UNNotificationRequest::requestWithIdentifier_content_trigger(
        &request_id,
        &content,
        None, // nil trigger = deliver immediately
    );

    let handler = block2::RcBlock::new(|error: *mut NSError| {
        if !error.is_null() {
            tracing::debug!("Failed to send notification: {error:?}");
        } else {
            tracing::debug!("Native macOS notification sent");
        }
    });

    let center = UNUserNotificationCenter::currentNotificationCenter();
    center.addNotificationRequest_withCompletionHandler(&request, Some(&handler));
}
