//! Timestamped log file path helpers.
//!
//! Generates log file paths like `debug_2026-04-04_14-30-15.log` and
//! `crash_2026-04-04_14-30-15.log` so that multiple sessions don't overwrite
//! each other.

use std::path::PathBuf;

/// Returns the log directory (`~/.claude-rs/`), creating it if necessary.
pub fn log_dir() -> PathBuf {
    let dir = dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("/tmp"))
        .join(".claude-rs");
    std::fs::create_dir_all(&dir).ok();
    dir
}

/// Returns a timestamped log file path, e.g. `~/.claude-rs/debug_2026-04-04_14-30-15.log`.
///
/// The `prefix` is the base name (e.g. `"debug"` or `"crash"`).
pub fn timestamped_log_path(prefix: &str) -> PathBuf {
    let timestamp = chrono::Local::now().format("%Y-%m-%d_%H-%M-%S");
    let filename = format!("{prefix}_{timestamp}.log");
    log_dir().join(filename)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_timestamped_log_path_contains_prefix_and_date() {
        let path = timestamped_log_path("debug");
        let filename = path.file_name().unwrap().to_str().unwrap();

        assert!(filename.starts_with("debug_"), "Should start with prefix: {filename}");
        assert!(filename.ends_with(".log"), "Should end with .log: {filename}");
        // Must contain a date-like pattern: YYYY-MM-DD
        assert!(
            filename.len() > "debug_YYYY-MM-DD_HH-MM-SS.log".len() - 1,
            "Filename too short: {filename}"
        );
        // Verify the date portion matches today
        let today = chrono::Local::now().format("%Y-%m-%d").to_string();
        assert!(filename.contains(&today), "Should contain today's date {today}: {filename}");
    }

    #[test]
    fn test_timestamped_log_path_crash_prefix() {
        let path = timestamped_log_path("crash");
        let filename = path.file_name().unwrap().to_str().unwrap();

        assert!(filename.starts_with("crash_"), "Should start with 'crash_': {filename}");
        assert!(filename.ends_with(".log"), "Should end with .log: {filename}");
    }

    #[test]
    fn test_timestamped_log_path_is_in_claude_rs_dir() {
        let path = timestamped_log_path("debug");
        let parent = path.parent().unwrap();
        assert!(
            parent.ends_with(".claude-rs"),
            "Should be in .claude-rs dir: {}",
            parent.display()
        );
    }

    #[test]
    fn test_two_calls_produce_different_or_equal_paths() {
        // Two calls within the same second produce the same path (same timestamp),
        // but two calls across seconds produce different paths.
        // We just verify both are valid.
        let p1 = timestamped_log_path("debug");
        let p2 = timestamped_log_path("debug");
        // Both should have the same structure
        assert_eq!(
            p1.parent().unwrap(),
            p2.parent().unwrap(),
            "Same directory"
        );
        let f1 = p1.file_name().unwrap().to_str().unwrap();
        let f2 = p2.file_name().unwrap().to_str().unwrap();
        assert!(f1.starts_with("debug_"));
        assert!(f2.starts_with("debug_"));
    }

    #[test]
    fn test_log_dir_ends_with_claude_rs() {
        let dir = log_dir();
        assert!(
            dir.ends_with(".claude-rs"),
            "log_dir should end with .claude-rs: {}",
            dir.display()
        );
    }
}
