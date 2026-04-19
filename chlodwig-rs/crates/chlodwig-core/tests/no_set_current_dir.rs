//! Stage 0.5 guardrail: production code must NOT call `set_current_dir()`.
//!
//! Per-tab CWD only works if no code path mutates the process-wide CWD.
//! This integration test walks every `.rs` file in `crates/`, finds every
//! occurrence of `set_current_dir`, and verifies it lives inside test code.
//!
//! Whitelisted (allowed to call `set_current_dir`):
//! - any file under a `tests/` directory
//! - any file ending in `_tests.rs`
//! - any line inside a `#[cfg(test)]` block (heuristic: line is preceded
//!   somewhere in the file by `#[cfg(test)]` and the file has no
//!   non-test usage)
//!
//! Production code path = anything else. Currently the only allowed
//! call site is `crates/chlodwig-gtk/src/tests/setup_tests.rs`.

use std::path::{Path, PathBuf};

fn workspace_root() -> PathBuf {
    // CARGO_MANIFEST_DIR points at crates/chlodwig-core. Workspace root is two up.
    let manifest = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    manifest.parent().unwrap().parent().unwrap().to_path_buf()
}

fn collect_rs_files(dir: &Path, out: &mut Vec<PathBuf>) {
    let Ok(entries) = std::fs::read_dir(dir) else { return };
    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            // Skip target/, .git/, node_modules/, vendor caches, etc.
            let name = path.file_name().and_then(|n| n.to_str()).unwrap_or("");
            if name == "target" || name.starts_with('.') || name == "node_modules" {
                continue;
            }
            collect_rs_files(&path, out);
        } else if path.extension().and_then(|e| e.to_str()) == Some("rs") {
            out.push(path);
        }
    }
}

/// Returns true if `path` is considered a test file (whole file is test code).
fn is_test_file(path: &Path) -> bool {
    let s = path.to_string_lossy();
    s.contains("/tests/")
        || s.ends_with("_tests.rs")
        || path
            .file_name()
            .and_then(|n| n.to_str())
            .map(|n| n == "tests.rs")
            .unwrap_or(false)
}

#[test]
fn test_no_set_current_dir_in_production_code() {
    let crates_dir = workspace_root().join("crates");
    assert!(
        crates_dir.is_dir(),
        "expected crates/ at {:?}",
        crates_dir
    );

    let mut files = Vec::new();
    collect_rs_files(&crates_dir, &mut files);
    assert!(!files.is_empty(), "no .rs files found under crates/");

    let mut violations: Vec<String> = Vec::new();

    for file in &files {
        if is_test_file(file) {
            continue;
        }
        let Ok(content) = std::fs::read_to_string(file) else { continue };
        if !content.contains("set_current_dir") {
            continue;
        }

        // Walk line by line. A match is allowed if the file contains a
        // `#[cfg(test)]` attribute BEFORE the matching line — meaning the
        // call lives inside an inline test module. Because tracking module
        // boundaries with regex is fragile, we use the strong rule that
        // production files are not allowed to mention `set_current_dir`
        // at all outside `#[cfg(test)]` regions.
        let mut in_test_region = false;
        for (lineno, line) in content.lines().enumerate() {
            let trimmed = line.trim_start();
            if trimmed.starts_with("#[cfg(test)]") || trimmed.starts_with("#[cfg(any(test") {
                in_test_region = true;
            }
            if line.contains("set_current_dir") && !in_test_region {
                // Allow comments / doc strings that merely mention the name.
                let pre_comment = line.split("//").next().unwrap_or(line);
                if pre_comment.contains("set_current_dir") {
                    violations.push(format!(
                        "{}:{}: production code calls set_current_dir(): {}",
                        file.strip_prefix(workspace_root())
                            .unwrap_or(file)
                            .display(),
                        lineno + 1,
                        line.trim()
                    ));
                }
            }
        }
    }

    assert!(
        violations.is_empty(),
        "Stage 0.5 guardrail violated — production code must not call set_current_dir().\n\
         Per-tab CWD requires zero process-CWD mutations.\n\n\
         Violations:\n{}",
        violations.join("\n")
    );
}
