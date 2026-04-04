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
    // Read the current build ID from `build_id.txt`, increment it, write it back,
    // and emit it as a compile-time env variable.
    let id_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("build_id.txt");
    let current = std::fs::read_to_string(&id_path)
        .unwrap_or_else(|_| "0".to_string());
    let next: u64 = current.trim().parse().unwrap_or(0) + 1;
    std::fs::write(&id_path, format!("{next}\n"))
        .expect("failed to write build_id.txt");
    println!("cargo:rustc-env=BUILD_ID={next}");

    // Always re-run so BUILD_TIME and BUILD_ID update on every build.
    println!("cargo:rerun-if-changed=FORCE_ALWAYS");
}
