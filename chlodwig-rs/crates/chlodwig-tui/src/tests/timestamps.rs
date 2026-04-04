use super::*;

#[test]
fn test_timestamp_rendered_before_user_message() {
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::Timestamp("02.04.2026  14:23:05".into()));
    app.display_blocks.push(DisplayBlock::UserMessage("Hello".into()));
    app.mark_dirty();
    app.rebuild_lines();

    let first = &app.rendered_lines[0];
    assert_eq!(first.spans.len(), 1);
    assert_eq!(first.spans[0].0, "02.04.2026  14:23:05");
    assert_eq!(first.spans[0].1.fg, Some(Color::DarkGray));

    let second = &app.rendered_lines[1];
    assert!(
        second.spans[0].0 == "You: ",
        "Expected 'You: ' after timestamp, got: {:?}",
        second.spans[0].0,
    );
}

#[test]
fn test_timestamp_rendered_before_assistant_text() {
    let mut app = App::new("test".into());
    app.display_blocks.push(DisplayBlock::Timestamp("02.04.2026  14:23:10".into()));
    app.display_blocks.push(DisplayBlock::AssistantText("Hi there".into()));
    app.mark_dirty();
    app.rebuild_lines();

    let first = &app.rendered_lines[0];
    assert_eq!(first.spans[0].0, "02.04.2026  14:23:10");
    assert_eq!(first.spans[0].1.fg, Some(Color::DarkGray));

    let second = &app.rendered_lines[1];
    assert_eq!(second.spans[0].0, "Hi there");
}

#[test]
fn test_timestamp_format_chrono() {
    let now = chrono::Local::now();
    let formatted = now.format("%d.%m.%Y  %H:%M:%S").to_string();
    assert_eq!(formatted.len(), 20, "Unexpected format length: {formatted}");
    assert_eq!(&formatted[2..3], ".");
    assert_eq!(&formatted[5..6], ".");
    assert_eq!(&formatted[10..12], "  ");
    assert_eq!(&formatted[14..15], ":");
    assert_eq!(&formatted[17..18], ":");
}
