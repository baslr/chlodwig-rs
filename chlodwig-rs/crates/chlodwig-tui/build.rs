use std::path::PathBuf;
use std::process::Command;

fn main() {
    // --- Locate .git directory ---
    let git_dir = Command::new("git")
        .args(["rev-parse", "--git-dir"])
        .output()
        .ok()
        .and_then(|o| {
            if o.status.success() {
                Some(PathBuf::from(
                    String::from_utf8_lossy(&o.stdout).trim().to_string(),
                ))
            } else {
                None
            }
        });

    // --- BUILD_TIME ---
    // Use the git commit timestamp so it only changes on new commits.
    let build_time = Command::new("git")
        .args(["log", "-1", "--format=%cd", "--date=format:%Y-%m-%d %H:%M"])
        .output()
        .ok()
        .and_then(|o| {
            if o.status.success() {
                Some(String::from_utf8_lossy(&o.stdout).trim().to_string())
            } else {
                None
            }
        })
        .unwrap_or_else(|| "unknown".to_string());
    println!("cargo:rustc-env=BUILD_TIME={build_time}");

    // --- BUILD_ID ---
    // Use the git commit count as a monotonically increasing build ID.
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

    // Only re-run when git state changes (new commit, checkout, rebase, etc.)
    // This avoids recompiling the crate on every `cargo build`.
    if let Some(gd) = &git_dir {
        // HEAD changes on commit, checkout, rebase
        println!("cargo:rerun-if-changed={}", gd.join("HEAD").display());
        // refs/ changes when branches/tags are created or updated
        println!("cargo:rerun-if-changed={}", gd.join("refs").display());
    }
}
