/// Tests for signal handler infrastructure.
///
/// IMPORTANT: Tests that access the static crash buffer must be serialized
/// because they share a single global buffer. We use SERIAL_LOCK for this.

use std::sync::Mutex;

// Serialize tests that use the static crash buffer
static SERIAL_LOCK: Mutex<()> = Mutex::new(());

#[test]
fn test_static_crash_buffer_write_and_read() {
    let _guard = SERIAL_LOCK.lock().unwrap();
    use crate::event_loop::{crash_state, write_crash_to_static_buf, static_crash_buf_as_str};

    // Set up crash state
    {
        let mut guard = crash_state().lock().unwrap();
        *guard = "App State Snapshot\ntest data\nlines: 42".to_string();
    }

    write_crash_to_static_buf("SIGSEGV (Segmentation fault)");

    let contents = static_crash_buf_as_str();
    assert!(contents.contains("SIGNAL CRASH REPORT"), "Should contain SIGNAL header");
    assert!(contents.contains("SIGSEGV"), "Should contain signal name");
    assert!(contents.contains("App State Snapshot"), "Should contain app state");
    assert!(contents.contains("test data"), "Should contain app state data");
}

#[test]
fn test_static_crash_buffer_contains_backtrace() {
    let _guard = SERIAL_LOCK.lock().unwrap();
    use crate::event_loop::{write_crash_to_static_buf, static_crash_buf_as_str};

    write_crash_to_static_buf("SIGABRT (Abort)");

    let contents = static_crash_buf_as_str();
    // The backtrace should contain at least some frame info.
    // On debug builds it will have function names; on release just addresses.
    assert!(contents.contains("Backtrace"), "Should contain backtrace section");
}

#[test]
fn test_write_crash_report_sync_produces_file() {
    let _guard = SERIAL_LOCK.lock().unwrap();
    use crate::event_loop::{crash_state, write_crash_report_sync};

    // Set up crash state
    {
        let mut guard = crash_state().lock().unwrap();
        *guard = "App State Snapshot\ntest data\nlines: 42".to_string();
    }

    // Use a temp dir so we don't pollute ~/.chlodwig-rs/
    let tmp = std::env::temp_dir().join("chlodwig-rs-test-signal");
    let _ = std::fs::create_dir_all(&tmp);
    let log_path = tmp.join("crash.log");
    let _ = std::fs::remove_file(&log_path); // clean up from previous runs

    write_crash_report_sync("SIGSEGV", &log_path);

    let contents = std::fs::read_to_string(&log_path)
        .expect("crash.log should exist after write_crash_report_sync");

    assert!(contents.contains("SIGNAL CRASH REPORT"), "Should contain SIGNAL header");
    assert!(contents.contains("SIGSEGV"), "Should contain signal name");
    assert!(contents.contains("App State Snapshot"), "Should contain app state");
    assert!(contents.contains("test data"), "Should contain app state data");

    // Cleanup
    let _ = std::fs::remove_file(&log_path);
    let _ = std::fs::remove_dir(&tmp);
}

#[test]
fn test_install_signal_handlers_does_not_panic() {
    // Just verify it doesn't panic. It's idempotent (can be called multiple times).
    crate::event_loop::install_signal_handlers();
}

#[test]
fn test_static_buf_size_is_10mb() {
    use crate::event_loop::STATIC_CRASH_BUF_SIZE;
    assert_eq!(STATIC_CRASH_BUF_SIZE, 10 * 1024 * 1024, "Static buffer should be 10 MiB");
}

#[test]
fn test_sighup_crash_report_contains_signal_name() {
    let _guard = SERIAL_LOCK.lock().unwrap();
    use crate::event_loop::{crash_state, write_crash_to_static_buf, static_crash_buf_as_str};

    // Set up crash state
    {
        let mut guard = crash_state().lock().unwrap();
        *guard = "App State before SIGHUP".to_string();
    }

    // Simulate what the signal handler does for SIGHUP
    write_crash_to_static_buf("SIGHUP (Hangup)");

    let contents = static_crash_buf_as_str();
    assert!(contents.contains("SIGHUP"), "Crash report should contain SIGHUP signal name");
    assert!(contents.contains("Hangup"), "Crash report should contain Hangup description");
    assert!(contents.contains("App State before SIGHUP"), "Crash report should contain app state");
}

#[test]
fn test_sighup_is_in_signal_handler_list() {
    // SIGHUP must be registered alongside the other fatal signals.
    // install_signal_handlers() is idempotent, so calling it again is safe.
    // After this call, SIGHUP should be handled (not SIG_DFL).
    crate::event_loop::install_signal_handlers();

    // Verify SIGHUP handler was installed (not SIG_DFL or SIG_IGN)
    #[cfg(unix)]
    {
        let prev = unsafe { libc::signal(libc::SIGHUP, libc::SIG_DFL) };
        // If our handler was installed, prev should NOT be SIG_DFL (0) or SIG_IGN (1).
        // Restore our handler immediately.
        unsafe { libc::signal(libc::SIGHUP, prev); }
        assert!(
            prev != libc::SIG_DFL && prev != libc::SIG_IGN,
            "SIGHUP should have a custom handler installed, got: {prev}"
        );
    }
}
