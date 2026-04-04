use std::process::Command;

fn main() {
    // Emit BUILD_TIME as compile-time env variable.
    // Format: "YYYY-MM-DD HH:MM" in local time.
    let output = Command::new("date")
        .arg("+%Y-%m-%d %H:%M")
        .output()
        .expect("failed to run `date`");
    let build_time = String::from_utf8_lossy(&output.stdout).trim().to_string();
    println!("cargo:rustc-env=BUILD_TIME={build_time}");

    // Always re-run so BUILD_TIME reflects the actual build time.
    println!("cargo:rerun-if-changed=FORCE_ALWAYS");
}
