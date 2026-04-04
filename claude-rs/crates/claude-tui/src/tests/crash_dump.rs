use super::*;

#[test]
fn test_crash_dump_contains_sizes() {
    let mut app = App::new("test-model".into());
    app.display_blocks.push(DisplayBlock::UserMessage("hello".into()));
    app.display_blocks.push(DisplayBlock::AssistantText("world".into()));
    app.streaming_buffer = "partial".into();
    app.turn_count = 3;
    app.is_loading = true;

    let dump = app.crash_dump();

    assert!(dump.contains("display_blocks.len():"), "Should have display_blocks size");
    assert!(dump.contains("streaming_buffer.len():"), "Should have streaming_buffer size");
    assert!(dump.contains("turn_count:"), "Should have turn_count");
    assert!(dump.contains("is_loading:          true"), "Should show is_loading=true");
    assert!(dump.contains("model:               test-model"), "Should show model name");
    assert!(dump.contains("UserMessage:"), "Should have block histogram");
    assert!(dump.contains("AssistantText:"), "Should have block histogram");
}

#[test]
fn test_crash_dump_shows_streaming_buffer_tail() {
    let mut app = App::new("test-model".into());
    // Create a buffer longer than 500 bytes
    app.streaming_buffer = "x".repeat(800);

    let dump = app.crash_dump();

    assert!(dump.contains("last 500 bytes"), "Should show last 500 bytes");
    // Should NOT contain the full 800 bytes
    assert!(!dump.contains(&"x".repeat(800)), "Should truncate to tail");
}

#[test]
fn test_crash_dump_empty_app() {
    let app = App::new("test-model".into());
    let dump = app.crash_dump();

    assert!(dump.contains("display_blocks.len():        0"), "Empty app should have 0 blocks");
    assert!(dump.contains("streaming_buffer: (empty)"), "Empty buffer marker");
    assert!(dump.contains("is_loading:          false"));
}
