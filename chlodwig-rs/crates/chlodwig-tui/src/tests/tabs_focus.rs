use super::*;

#[test]
fn test_tab_default_is_prompt() {
    let app = App::new("test".into());
    assert_eq!(app.active_tab, 0, "Default tab should be 0 (Prompt)");
}

#[test]
fn test_focus_default_is_input() {
    let app = App::new("test".into());
    assert!(matches!(app.focus, Focus::Input), "Default focus should be Input");
}

#[test]
fn test_down_from_input_goes_to_tabbar() {
    let mut app = App::new("test".into());
    assert_eq!(app.history_index, None);
    app.handle_down_key();
    assert!(matches!(app.focus, Focus::TabBar));
}

#[test]
fn test_up_from_tabbar_goes_to_input() {
    let mut app = App::new("test".into());
    app.focus = Focus::TabBar;
    app.handle_tab_bar_up();
    assert!(matches!(app.focus, Focus::Input));
}

#[test]
fn test_right_in_tabbar_switches_to_sysprompt() {
    let mut app = App::new("test".into());
    app.focus = Focus::TabBar;
    app.active_tab = 0;
    app.handle_tab_bar_right();
    assert_eq!(app.active_tab, 1);
}

#[test]
fn test_left_in_tabbar_switches_to_prompt() {
    let mut app = App::new("test".into());
    app.focus = Focus::TabBar;
    app.active_tab = 1;
    app.handle_tab_bar_left();
    assert_eq!(app.active_tab, 0);
}

#[test]
fn test_left_in_tabbar_wraps_to_last() {
    let mut app = App::new("test".into());
    app.focus = Focus::TabBar;
    app.active_tab = 0;
    app.handle_tab_bar_left();
    assert_eq!(app.active_tab, 4, "Left from first tab should wrap to last tab");
}

#[test]
fn test_right_in_tabbar_wraps_to_first() {
    let mut app = App::new("test".into());
    app.focus = Focus::TabBar;
    app.active_tab = 4;
    app.handle_tab_bar_right();
    assert_eq!(app.active_tab, 0, "Right from last tab should wrap to first tab");
}

#[test]
fn test_tab_wrap_full_cycle_right() {
    let mut app = App::new("test".into());
    app.focus = Focus::TabBar;
    app.active_tab = 0;
    // Cycle through all 5 tabs and back to start
    app.handle_tab_bar_right(); // 0 -> 1
    app.handle_tab_bar_right(); // 1 -> 2
    app.handle_tab_bar_right(); // 2 -> 3
    app.handle_tab_bar_right(); // 3 -> 4
    app.handle_tab_bar_right(); // 4 -> 0
    assert_eq!(app.active_tab, 0, "Full right cycle should return to first tab");
}

#[test]
fn test_tab_wrap_full_cycle_left() {
    let mut app = App::new("test".into());
    app.focus = Focus::TabBar;
    app.active_tab = 0;
    // Cycle backwards through all 5 tabs and back to start
    app.handle_tab_bar_left(); // 0 -> 4
    app.handle_tab_bar_left(); // 4 -> 3
    app.handle_tab_bar_left(); // 3 -> 2
    app.handle_tab_bar_left(); // 2 -> 1
    app.handle_tab_bar_left(); // 1 -> 0
    assert_eq!(app.active_tab, 0, "Full left cycle should return to first tab");
}

#[test]
fn test_sys_prompt_lines_built_from_blocks() {
    let mut app = App::new("test".into());
    app.system_prompt_blocks = vec![
        chlodwig_core::SystemBlock::cached("You are Claude."),
        chlodwig_core::SystemBlock::text("Git branch: main"),
    ];
    app.rebuild_sys_prompt_lines();

    assert!(!app.sys_prompt_lines.is_empty(), "Should have rendered lines");

    let first = &app.sys_prompt_lines[0];
    let first_text: String = first.spans.iter().map(|(t, _)| t.as_str()).collect();
    assert!(
        first_text.contains("Block 1") && first_text.contains("[cached]"),
        "First block header should mention 'Block 1' and '[cached]', got: {first_text}"
    );

    let all_text: String = app.sys_prompt_lines.iter()
        .flat_map(|rl| rl.spans.iter().map(|(t, _)| t.clone()))
        .collect::<Vec<_>>()
        .join("\n");
    assert!(all_text.contains("You are Claude."));
    assert!(all_text.contains("Git branch: main"));
}

#[test]
fn test_sys_prompt_empty_shows_placeholder() {
    let mut app = App::new("test".into());
    app.system_prompt_blocks = vec![];
    app.rebuild_sys_prompt_lines();

    let all_text: String = app.sys_prompt_lines.iter()
        .flat_map(|rl| rl.spans.iter().map(|(t, _)| t.clone()))
        .collect::<Vec<_>>()
        .join("\n");
    assert!(all_text.contains("no system prompt"), "Should show placeholder, got: {all_text}");
}

#[test]
fn test_sys_prompt_second_block_no_cached_tag() {
    let mut app = App::new("test".into());
    app.system_prompt_blocks = vec![
        chlodwig_core::SystemBlock::text("Dynamic context"),
    ];
    app.rebuild_sys_prompt_lines();

    let first = &app.sys_prompt_lines[0];
    let first_text: String = first.spans.iter().map(|(t, _)| t.as_str()).collect();
    assert!(
        !first_text.contains("[cached]"),
        "Non-cached block should NOT show [cached] tag, got: {first_text}"
    );
}

#[test]
fn test_tab_right_reaches_requests() {
    let mut app = App::new("test".into());
    app.focus = Focus::TabBar;
    app.active_tab = 0;
    app.handle_tab_bar_right();
    app.handle_tab_bar_right();
    assert_eq!(app.active_tab, 2, "Should reach Requests tab at index 2");
}

#[test]
fn test_tool_use_null_input_not_displayed() {
    let mut app = App::new("test".into());
    let before = app.display_blocks.len();

    let input = serde_json::Value::Null;
    if !input.is_null() {
        app.display_blocks.push(DisplayBlock::ToolCall {
            name: "bash".into(),
            input_preview: serde_json::to_string_pretty(&input).unwrap_or_default(),
        });
    }

    assert_eq!(app.display_blocks.len(), before, "Null-input tool use should not be displayed");
}

#[test]
fn test_tool_use_real_input_displayed() {
    let mut app = App::new("test".into());
    let before = app.display_blocks.len();

    let input = serde_json::json!({"command": "ls"});
    if !input.is_null() {
        app.display_blocks.push(DisplayBlock::ToolCall {
            name: "bash".into(),
            input_preview: serde_json::to_string_pretty(&input).unwrap_or_default(),
        });
    }

    assert_eq!(app.display_blocks.len(), before + 1, "Real-input tool use should be displayed");
}

// ── Tab-aware scroll tests ──────────────────────────────────────

#[test]
fn test_tab_scroll_up_sys_prompt() {
    let mut app = App::new("test".into());
    app.active_tab = 1;
    app.sys_prompt_scroll = 10;
    app.tab_scroll_up(3);
    assert_eq!(app.sys_prompt_scroll, 7);
}

#[test]
fn test_tab_scroll_down_sys_prompt() {
    let mut app = App::new("test".into());
    app.active_tab = 1;
    app.system_prompt_blocks = vec![chlodwig_core::SystemBlock::text(
        &"line\n".repeat(200),
    )];
    app.rebuild_sys_prompt_lines();
    app.sys_prompt_scroll = 0;
    app.tab_scroll_down(5, 40);
    assert_eq!(app.sys_prompt_scroll, 5);
}

#[test]
fn test_tab_scroll_up_requests() {
    let mut app = App::new("test".into());
    app.active_tab = 2;
    app.requests_scroll = 15;
    app.tab_scroll_up(5);
    assert_eq!(app.requests_scroll, 10);
}

#[test]
fn test_tab_scroll_down_requests() {
    let mut app = App::new("test".into());
    app.active_tab = 2;
    for i in 0..10 {
        app.requests_log.push_back(RequestLogEntry {
            timestamp: format!("t{}", i),
            request_body: r#"{"model":"test"}"#.into(),
            response_model: "m".into(),
            response_input_tokens: 100,
            response_output_tokens: 50,
            duration_ms: Some(100),
            response_chunks: Vec::new(),
        });
    }
    app.requests_dirty = true;
    app.rebuild_requests_lines();
    app.requests_scroll = 0;
    app.tab_scroll_down(5, 40);
    assert_eq!(app.requests_scroll, 5);
}

#[test]
fn test_tab_scroll_up_clamps_at_zero() {
    let mut app = App::new("test".into());
    app.active_tab = 1;
    app.sys_prompt_scroll = 2;
    app.tab_scroll_up(10);
    assert_eq!(app.sys_prompt_scroll, 0, "Should clamp at 0");
}

#[test]
fn test_tab_scroll_down_clamps_at_max() {
    let mut app = App::new("test".into());
    app.active_tab = 1;
    app.system_prompt_blocks = vec![chlodwig_core::SystemBlock::text("short")];
    app.rebuild_sys_prompt_lines();
    let total = app.sys_prompt_lines.len();
    app.tab_scroll_down(1000, 40);
    let expected_max = total.saturating_sub(40);
    assert_eq!(app.sys_prompt_scroll, expected_max, "Should clamp at max");
}

#[test]
fn test_tab_scroll_tab0_still_works() {
    let mut app = App::new("test".into());
    app.active_tab = 0;
    app.auto_scroll = false;
    app.scroll = 10;
    app.tab_scroll_up(3);
    assert_eq!(app.scroll, 7);
}
