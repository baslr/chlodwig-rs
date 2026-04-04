use super::*;

#[test]
fn test_history_up_loads_last_prompt() {
    let mut app = App::new("test".into());
    app.prompt_history = vec!["first".into(), "second".into(), "third".into()];

    history_up(&mut app);
    assert_eq!(app.input, "third");
    assert_eq!(app.history_index, Some(0));
}

#[test]
fn test_history_up_down_navigation() {
    let mut app = App::new("test".into());
    app.prompt_history = vec!["first".into(), "second".into(), "third".into()];

    history_up(&mut app);
    history_up(&mut app);
    assert_eq!(app.input, "second");
    assert_eq!(app.history_index, Some(1));

    history_down(&mut app);
    assert_eq!(app.input, "third");
    assert_eq!(app.history_index, Some(0));
}

#[test]
fn test_history_restores_saved_input() {
    let mut app = App::new("test".into());
    app.prompt_history = vec!["old prompt".into()];
    app.input = "I was typing this".into();
    app.cursor = app.input_char_count();

    history_up(&mut app);
    assert_eq!(app.input, "old prompt");
    assert_eq!(app.saved_input, "I was typing this");

    history_down(&mut app);
    assert_eq!(app.input, "I was typing this");
    assert_eq!(app.history_index, None);
    assert!(app.saved_input.is_empty());
}

#[test]
fn test_history_up_at_start_stays() {
    let mut app = App::new("test".into());
    app.prompt_history = vec!["only".into()];

    history_up(&mut app);
    history_up(&mut app);
    assert_eq!(app.input, "only");
    assert_eq!(app.history_index, Some(0));
}

#[test]
fn test_history_down_at_current_stays() {
    let mut app = App::new("test".into());
    app.input = "current".into();

    history_down(&mut app);
    assert_eq!(app.input, "current");
    assert_eq!(app.history_index, None);
}

#[test]
fn test_history_empty_noop() {
    let mut app = App::new("test".into());
    app.input = "something".into();

    history_up(&mut app);
    assert_eq!(app.input, "something");
    assert_eq!(app.history_index, None);
}

#[test]
fn test_input_height_multiline() {
    let mut app = App::new("test".into());
    app.input = "line one\nline two\nline three".to_string();
    // 3 logical lines, each short enough to not wrap at width 80
    let input_lines = app.input_visual_line_count(80);
    let input_height = (input_lines as u16) + 2;
    assert_eq!(input_height, 5); // 3 lines + 2 border
}

#[test]
fn test_history_cursor_at_end() {
    let mut app = App::new("test".into());
    app.prompt_history = vec!["hello world".into()];

    history_up(&mut app);
    assert_eq!(app.cursor, 11);
}

#[test]
fn test_history_down_stays_in_input() {
    let mut app = App::new("test".into());
    app.prompt_history = vec!["old".into()];
    history_up(&mut app);
    assert_eq!(app.history_index, Some(0));

    history_down(&mut app);
    assert_eq!(app.history_index, None);
    assert!(matches!(app.focus, Focus::Input), "Should stay in Input when navigating history");
}
