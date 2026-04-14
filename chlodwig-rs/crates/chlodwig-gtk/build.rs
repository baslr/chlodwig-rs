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

    // Only re-run when git state changes
    if let Some(gd) = &git_dir {
        println!("cargo:rerun-if-changed={}", gd.join("HEAD").display());
        println!("cargo:rerun-if-changed={}", gd.join("refs").display());
    }
}
