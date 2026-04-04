use std::process::Command;

fn main() {
    // --- BUILD_TIME ---
    // Emit BUILD_TIME as compile-time env variable.
    // Format: "YYYY-MM-DD HH:MM" in local time.
    let output = Command::new("date")
        .arg("+%Y-%m-%d %H:%M")
        .output()
        .expect("failed to run `date`");
    let build_time = String::from_utf8_lossy(&output.stdout).trim().to_string();
    println!("cargo:rustc-env=BUILD_TIME={build_time}");

    // --- BUILD_ID ---
    // Use the git commit count as a monotonically increasing build ID.
    // No file needed — derived from git history.
    let build_id = Command::new("git")
        .args(["rev-list", "--count", "HEAD"])
        .output()
        .ok()
        .and_then(|o| {
            if o.status.success() {
                Some(String::from_utf8_lossy(&o.stdout).trim().to_string())
            } else {
                None
            }
        })
        .unwrap_or_else(|| "0".to_string());
    println!("cargo:rustc-env=BUILD_ID={build_id}");

    // Always re-run so BUILD_TIME reflects the actual build time.
    println!("cargo:rerun-if-changed=FORCE_ALWAYS");
}
