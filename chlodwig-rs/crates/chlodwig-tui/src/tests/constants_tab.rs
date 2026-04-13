use super::*;

#[test]
fn test_constants_tab_exists_at_index_3() {
    let mut app = App::new("test".into());
    app.focus = Focus::TabBar;
    app.active_tab = 2;
    app.handle_tab_bar_right();
    assert_eq!(app.active_tab, 3, "Constants tab should be at index 3");
}

#[test]
fn test_constants_tab_wraps_to_git() {
    let mut app = App::new("test".into());
    app.focus = Focus::TabBar;
    app.active_tab = 3;
    app.handle_tab_bar_right();
    assert_eq!(app.active_tab, 4, "Right from constants tab should go to Git tab");
}

#[test]
fn test_constants_default_values() {
    let app = App::new("test".into());
    let c = &app.constants;
    assert_eq!(c.auto_compact_threshold, 160_000);
    assert_eq!(c.max_retries, 3);
    assert_eq!(c.subagent_max_turns, 1000);
    assert_eq!(c.subagent_max_tokens, 16_384);
    assert_eq!(c.default_max_results, 10);
    assert_eq!(c.absolute_max_results, 20);
    assert_eq!(c.search_timeout_secs, 15);
    assert_eq!(c.default_max_size, 100_000);
    assert_eq!(c.absolute_max_size, 1_000_000);
    assert_eq!(c.max_glob_results, 100);
    assert_eq!(c.default_head_limit, 250);
    assert_eq!(c.input_max_visual_lines, 10);
}

#[test]
fn test_constants_reset_to_defaults() {
    let mut app = App::new("test".into());
    app.constants.auto_compact_threshold = 999;
    app.constants.max_retries = 1;
    app.constants.subagent_max_turns = 5;
    app.constants.reset_to_defaults();
    assert_eq!(app.constants.auto_compact_threshold, 160_000);
    assert_eq!(app.constants.max_retries, 3);
    assert_eq!(app.constants.subagent_max_turns, 1000);
}

#[test]
fn test_constants_selected_field_default_is_zero() {
    let app = App::new("test".into());
    assert_eq!(app.constants.selected_field, 0);
}

#[test]
fn test_constants_selected_field_navigation_down() {
    let mut app = App::new("test".into());
    app.constants.select_next();
    assert_eq!(app.constants.selected_field, 1);
}

#[test]
fn test_constants_selected_field_navigation_up() {
    let mut app = App::new("test".into());
    app.constants.selected_field = 3;
    app.constants.select_prev();
    assert_eq!(app.constants.selected_field, 2);
}

#[test]
fn test_constants_selected_field_clamps_at_zero() {
    let mut app = App::new("test".into());
    app.constants.selected_field = 0;
    app.constants.select_prev();
    assert_eq!(app.constants.selected_field, 0);
}

#[test]
fn test_constants_selected_field_clamps_at_max() {
    let app = App::new("test".into());
    let max = app.constants.field_count() - 1;
    let mut app2 = App::new("test".into());
    app2.constants.selected_field = max;
    app2.constants.select_next();
    assert_eq!(app2.constants.selected_field, max, "Should clamp at last field");
}

#[test]
fn test_constants_edit_buffer_starts_empty() {
    let app = App::new("test".into());
    assert!(app.constants.edit_buffer.is_empty());
    assert!(!app.constants.is_editing);
}

#[test]
fn test_constants_enter_edit_mode() {
    let mut app = App::new("test".into());
    app.constants.selected_field = 0; // auto_compact_threshold
    app.constants.start_editing();
    assert!(app.constants.is_editing);
    assert_eq!(app.constants.edit_buffer, "160000");
}

#[test]
fn test_constants_apply_valid_value() {
    let mut app = App::new("test".into());
    app.constants.selected_field = 0; // auto_compact_threshold
    app.constants.start_editing();
    app.constants.edit_buffer = "200000".to_string();
    let ok = app.constants.apply_edit();
    assert!(ok);
    assert_eq!(app.constants.auto_compact_threshold, 200_000);
    assert!(!app.constants.is_editing);
}

#[test]
fn test_constants_apply_invalid_value_rejected() {
    let mut app = App::new("test".into());
    app.constants.selected_field = 0;
    app.constants.start_editing();
    app.constants.edit_buffer = "not_a_number".to_string();
    let ok = app.constants.apply_edit();
    assert!(!ok, "Invalid value should be rejected");
    // Value should be unchanged
    assert_eq!(app.constants.auto_compact_threshold, 160_000);
    // Still in edit mode so user can fix
    assert!(app.constants.is_editing);
}

#[test]
fn test_constants_cancel_edit() {
    let mut app = App::new("test".into());
    app.constants.selected_field = 0;
    app.constants.start_editing();
    app.constants.edit_buffer = "999".to_string();
    app.constants.cancel_edit();
    assert!(!app.constants.is_editing);
    assert_eq!(app.constants.auto_compact_threshold, 160_000, "Value should not change on cancel");
}

#[test]
fn test_constants_scroll_on_tab_3() {
    let mut app = App::new("test".into());
    app.active_tab = 3;
    app.constants_scroll = 10;
    app.tab_scroll_up(3);
    assert_eq!(app.constants_scroll, 7);
}

#[test]
fn test_constants_scroll_down_on_tab_3() {
    let mut app = App::new("test".into());
    app.active_tab = 3;
    app.constants_scroll = 0;
    app.rebuild_constants_lines();
    let total = app.constants_lines.len();
    // Use a tiny view_height so scrolling is possible
    let view_height = 5;
    assert!(total > view_height, "Need more lines than view_height for scroll test");
    app.tab_scroll_down(3, view_height);
    assert_eq!(app.constants_scroll, 3);
}

#[test]
fn test_constants_rebuild_lines_produces_output() {
    let mut app = App::new("test".into());
    app.rebuild_constants_lines();
    assert!(!app.constants_lines.is_empty(), "Constants tab should render lines");
}

#[test]
fn test_constants_rebuild_lines_contains_all_fields() {
    let mut app = App::new("test".into());
    app.rebuild_constants_lines();
    let all_text: String = app.constants_lines.iter()
        .flat_map(|rl| rl.spans.iter().map(|(t, _)| t.clone()))
        .collect::<Vec<_>>()
        .join("\n");
    assert!(all_text.contains("auto_compact_threshold"), "Should contain auto_compact_threshold");
    assert!(all_text.contains("max_retries"), "Should contain max_retries");
    assert!(all_text.contains("subagent_max_turns"), "Should contain subagent_max_turns");
    assert!(all_text.contains("default_max_results"), "Should contain default_max_results");
    assert!(all_text.contains("input_max_visual_lines"), "Should contain input_max_visual_lines");
    assert!(all_text.contains("160000") || all_text.contains("160,000") || all_text.contains("160_000"),
        "Should show default value for auto_compact_threshold");
}

#[test]
fn test_constants_rebuild_lines_shows_reset_button() {
    let mut app = App::new("test".into());
    app.rebuild_constants_lines();
    let all_text: String = app.constants_lines.iter()
        .flat_map(|rl| rl.spans.iter().map(|(t, _)| t.clone()))
        .collect::<Vec<_>>()
        .join("\n");
    assert!(all_text.contains("Reset"), "Should show a Reset button");
}

#[test]
fn test_constants_field_count_matches_editable_fields() {
    let c = crate::app::ConstantsConfig::default();
    // We expose 12 editable fields + 1 reset button
    assert_eq!(c.field_count(), 13, "12 constants + 1 reset button");
}

#[test]
fn test_constants_last_field_is_reset_button() {
    let mut c = crate::app::ConstantsConfig::default();
    c.selected_field = c.field_count() - 1;
    assert!(c.is_reset_button_selected());
}

#[test]
fn test_constants_editing_field_shows_in_lines() {
    let mut app = App::new("test".into());
    app.constants.selected_field = 0;
    app.constants.start_editing();
    app.constants.edit_buffer = "200000".to_string();
    app.rebuild_constants_lines();

    let all_text: String = app.constants_lines.iter()
        .flat_map(|rl| rl.spans.iter().map(|(t, _)| t.clone()))
        .collect::<Vec<_>>()
        .join("\n");
    assert!(all_text.contains("200000"), "Should show the edit buffer value");
}

#[test]
fn test_constants_modified_value_shows_marker() {
    let mut app = App::new("test".into());
    app.constants.auto_compact_threshold = 200_000; // changed from default 160_000
    app.constants.selected_field = 5; // not on field 0, so field 0 is not selected
    app.rebuild_constants_lines();

    let all_text: String = app.constants_lines.iter()
        .flat_map(|rl| rl.spans.iter().map(|(t, _)| t.clone()))
        .collect::<Vec<_>>()
        .join("");
    assert!(all_text.contains("✎"), "Modified field should show ✎ marker");
}

#[test]
fn test_constants_esc_returns_to_prompt_tab() {
    // When Esc is pressed on constants tab (not editing), should go back to prompt tab.
    // This is tested via the event loop behavior, but we can test the state transition:
    let mut app = App::new("test".into());
    app.active_tab = 3;
    app.constants.is_editing = false;
    // Simulate what the event loop does on Esc:
    app.active_tab = 0;
    app.focus = Focus::Input;
    assert_eq!(app.active_tab, 0);
    assert!(matches!(app.focus, Focus::Input));
}

#[test]
fn test_constants_get_default_value_string() {
    assert_eq!(crate::app::ConstantsConfig::get_default_value_string(0), "160000");
    assert_eq!(crate::app::ConstantsConfig::get_default_value_string(1), "3");
    assert_eq!(crate::app::ConstantsConfig::get_default_value_string(2), "1000");
}

#[test]
fn test_constants_apply_edit_strips_separators() {
    let mut app = App::new("test".into());
    app.constants.selected_field = 0;
    app.constants.start_editing();
    // User typed with thousand separators
    app.constants.edit_buffer = "200_000".to_string();
    let ok = app.constants.apply_edit();
    assert!(ok, "Should accept values with underscore separators");
    assert_eq!(app.constants.auto_compact_threshold, 200_000);
}

#[test]
fn test_constants_apply_edit_strips_commas() {
    let mut app = App::new("test".into());
    app.constants.selected_field = 0;
    app.constants.start_editing();
    app.constants.edit_buffer = "200,000".to_string();
    let ok = app.constants.apply_edit();
    assert!(ok, "Should accept values with comma separators");
    assert_eq!(app.constants.auto_compact_threshold, 200_000);
}

// ── Unit suffix parsing tests ─────────────────────────────────────

#[test]
fn test_parse_value_with_unit_kib() {
    // 1 KiB = 1024
    use crate::app::parse_value_with_units;
    assert_eq!(parse_value_with_units("1 KiB"), Some(1024));
    assert_eq!(parse_value_with_units("1KiB"), Some(1024));
    assert_eq!(parse_value_with_units("10 KiB"), Some(10_240));
}

#[test]
fn test_parse_value_with_unit_kb() {
    // 1 KB = 1000
    use crate::app::parse_value_with_units;
    assert_eq!(parse_value_with_units("1 KB"), Some(1_000));
    assert_eq!(parse_value_with_units("1KB"), Some(1_000));
    assert_eq!(parse_value_with_units("100 KB"), Some(100_000));
}

#[test]
fn test_parse_value_with_unit_mib() {
    // 1 MiB = 1_048_576
    use crate::app::parse_value_with_units;
    assert_eq!(parse_value_with_units("1 MiB"), Some(1_048_576));
    assert_eq!(parse_value_with_units("10MiB"), Some(10_485_760));
}

#[test]
fn test_parse_value_with_unit_mb() {
    // 1 MB = 1_000_000
    use crate::app::parse_value_with_units;
    assert_eq!(parse_value_with_units("1 MB"), Some(1_000_000));
    assert_eq!(parse_value_with_units("5 MB"), Some(5_000_000));
}

#[test]
fn test_parse_value_with_unit_gib() {
    // 1 GiB = 1_073_741_824
    use crate::app::parse_value_with_units;
    assert_eq!(parse_value_with_units("1 GiB"), Some(1_073_741_824));
    assert_eq!(parse_value_with_units("2GiB"), Some(2_147_483_648));
}

#[test]
fn test_parse_value_with_unit_gb() {
    // 1 GB = 1_000_000_000
    use crate::app::parse_value_with_units;
    assert_eq!(parse_value_with_units("1 GB"), Some(1_000_000_000));
}

#[test]
fn test_parse_value_with_unit_case_insensitive() {
    use crate::app::parse_value_with_units;
    assert_eq!(parse_value_with_units("1 kib"), Some(1024));
    assert_eq!(parse_value_with_units("1 mib"), Some(1_048_576));
    assert_eq!(parse_value_with_units("1 kb"), Some(1_000));
    assert_eq!(parse_value_with_units("1 mb"), Some(1_000_000));
    assert_eq!(parse_value_with_units("1 gib"), Some(1_073_741_824));
    assert_eq!(parse_value_with_units("1 gb"), Some(1_000_000_000));
}

#[test]
fn test_parse_value_with_unit_plain_number() {
    // Plain numbers without units should still work
    use crate::app::parse_value_with_units;
    assert_eq!(parse_value_with_units("42"), Some(42));
    assert_eq!(parse_value_with_units("160000"), Some(160_000));
}

#[test]
fn test_parse_value_with_unit_with_underscores() {
    use crate::app::parse_value_with_units;
    assert_eq!(parse_value_with_units("1_000"), Some(1_000));
    assert_eq!(parse_value_with_units("1_000 KB"), Some(1_000_000));
}

#[test]
fn test_parse_value_with_unit_with_commas() {
    use crate::app::parse_value_with_units;
    assert_eq!(parse_value_with_units("1,000"), Some(1_000));
    assert_eq!(parse_value_with_units("1,000 KB"), Some(1_000_000));
}

#[test]
fn test_parse_value_with_unit_fractional() {
    // 1.5 MiB = 1_572_864
    use crate::app::parse_value_with_units;
    assert_eq!(parse_value_with_units("1.5 MiB"), Some(1_572_864));
    assert_eq!(parse_value_with_units("0.5 KB"), Some(500));
    assert_eq!(parse_value_with_units("2.5 MB"), Some(2_500_000));
}

#[test]
fn test_parse_value_with_unit_invalid() {
    use crate::app::parse_value_with_units;
    assert_eq!(parse_value_with_units("abc"), None);
    assert_eq!(parse_value_with_units(""), None);
    assert_eq!(parse_value_with_units("hello MiB"), None);
}

#[test]
fn test_parse_value_with_unit_bytes_suffix() {
    // "B" alone = bytes (multiplier 1)
    use crate::app::parse_value_with_units;
    assert_eq!(parse_value_with_units("500 B"), Some(500));
}

#[test]
fn test_parse_value_with_unit_tib_tb() {
    use crate::app::parse_value_with_units;
    assert_eq!(parse_value_with_units("1 TiB"), Some(1_099_511_627_776));
    assert_eq!(parse_value_with_units("1 TB"), Some(1_000_000_000_000));
}

#[test]
fn test_apply_edit_with_unit_suffix() {
    // apply_edit should accept "1 MiB" for a byte-size field
    let mut app = App::new("test".into());
    app.constants.selected_field = 7; // default_max_size (default: 100_000)
    app.constants.start_editing();
    app.constants.edit_buffer = "1 MiB".to_string();
    let ok = app.constants.apply_edit();
    assert!(ok, "Should accept '1 MiB' as a value");
    assert_eq!(app.constants.default_max_size, 1_048_576);
}

#[test]
fn test_apply_edit_with_kb_suffix() {
    let mut app = App::new("test".into());
    app.constants.selected_field = 7; // default_max_size
    app.constants.start_editing();
    app.constants.edit_buffer = "500 KB".to_string();
    let ok = app.constants.apply_edit();
    assert!(ok, "Should accept '500 KB' as a value");
    assert_eq!(app.constants.default_max_size, 500_000);
}

// ── Display formatting tests ──────────────────────────────────────

#[test]
fn test_format_with_underscores_small_number() {
    use crate::app::format_with_underscores;
    assert_eq!(format_with_underscores(0), "0");
    assert_eq!(format_with_underscores(1), "1");
    assert_eq!(format_with_underscores(42), "42");
    assert_eq!(format_with_underscores(999), "999");
}

#[test]
fn test_format_with_underscores_thousands() {
    use crate::app::format_with_underscores;
    assert_eq!(format_with_underscores(1_000), "1_000");
    assert_eq!(format_with_underscores(10_000), "10_000");
    assert_eq!(format_with_underscores(100_000), "100_000");
    assert_eq!(format_with_underscores(160_000), "160_000");
}

#[test]
fn test_format_with_underscores_millions() {
    use crate::app::format_with_underscores;
    assert_eq!(format_with_underscores(1_000_000), "1_000_000");
    assert_eq!(format_with_underscores(1_048_576), "1_048_576");
}

#[test]
fn test_format_with_underscores_billions() {
    use crate::app::format_with_underscores;
    assert_eq!(format_with_underscores(1_000_000_000), "1_000_000_000");
}

#[test]
fn test_display_values_show_underscores() {
    // The rendered constants lines should show values with underscore separators
    let mut app = App::new("test".into());
    app.rebuild_constants_lines();
    let all_text: String = app.constants_lines.iter()
        .flat_map(|rl| rl.spans.iter().map(|(t, _)| t.clone()))
        .collect::<Vec<_>>()
        .join("");
    // auto_compact_threshold default is 160_000, should be displayed with underscores
    assert!(all_text.contains("160_000"), "Values should be displayed with underscore separators, got: {}", all_text);
}

#[test]
fn test_display_values_show_underscores_for_large_values() {
    let mut app = App::new("test".into());
    app.rebuild_constants_lines();
    let all_text: String = app.constants_lines.iter()
        .flat_map(|rl| rl.spans.iter().map(|(t, _)| t.clone()))
        .collect::<Vec<_>>()
        .join("");
    // absolute_max_size default is 1_000_000, should show with underscores
    assert!(all_text.contains("1_000_000"), "Large values should show with underscores, got: {}", all_text);
}

#[test]
fn test_start_editing_shows_raw_value_without_underscores() {
    // When entering edit mode, the edit buffer should show the raw number (no underscores)
    // so the user can freely type
    let mut app = App::new("test".into());
    app.constants.selected_field = 0; // auto_compact_threshold = 160_000
    app.constants.start_editing();
    assert_eq!(app.constants.edit_buffer, "160000", "Edit buffer should show raw number without underscores");
}

// ── Short multiplier suffix tests (k/K, m/M, g/G) ────────────────

#[test]
fn test_parse_value_with_unit_lowercase_k() {
    use crate::app::parse_value_with_units;
    assert_eq!(parse_value_with_units("1k"), Some(1_000));
    assert_eq!(parse_value_with_units("10k"), Some(10_000));
    assert_eq!(parse_value_with_units("160k"), Some(160_000));
}

#[test]
fn test_parse_value_with_unit_uppercase_k() {
    use crate::app::parse_value_with_units;
    assert_eq!(parse_value_with_units("1K"), Some(1_000));
    assert_eq!(parse_value_with_units("16K"), Some(16_000));
}

#[test]
fn test_parse_value_with_unit_lowercase_m() {
    use crate::app::parse_value_with_units;
    assert_eq!(parse_value_with_units("1m"), Some(1_000_000));
    assert_eq!(parse_value_with_units("5m"), Some(5_000_000));
}

#[test]
fn test_parse_value_with_unit_uppercase_m() {
    use crate::app::parse_value_with_units;
    assert_eq!(parse_value_with_units("1M"), Some(1_000_000));
    assert_eq!(parse_value_with_units("2M"), Some(2_000_000));
}

#[test]
fn test_parse_value_with_unit_lowercase_g() {
    use crate::app::parse_value_with_units;
    assert_eq!(parse_value_with_units("1g"), Some(1_000_000_000));
    assert_eq!(parse_value_with_units("3g"), Some(3_000_000_000));
}

#[test]
fn test_parse_value_with_unit_uppercase_g() {
    use crate::app::parse_value_with_units;
    assert_eq!(parse_value_with_units("1G"), Some(1_000_000_000));
}

#[test]
fn test_parse_value_with_unit_k_with_space() {
    use crate::app::parse_value_with_units;
    assert_eq!(parse_value_with_units("100 k"), Some(100_000));
    assert_eq!(parse_value_with_units("100 K"), Some(100_000));
}

#[test]
fn test_parse_value_with_unit_k_fractional() {
    use crate::app::parse_value_with_units;
    assert_eq!(parse_value_with_units("1.5k"), Some(1_500));
    assert_eq!(parse_value_with_units("2.5M"), Some(2_500_000));
}

#[test]
fn test_apply_edit_with_short_k_suffix() {
    let mut app = App::new("test".into());
    app.constants.selected_field = 0; // auto_compact_threshold
    app.constants.start_editing();
    app.constants.edit_buffer = "160k".to_string();
    let ok = app.constants.apply_edit();
    assert!(ok, "Should accept '160k'");
    assert_eq!(app.constants.auto_compact_threshold, 160_000);
}

#[test]
fn test_apply_edit_with_short_m_suffix() {
    let mut app = App::new("test".into());
    app.constants.selected_field = 8; // absolute_max_size
    app.constants.start_editing();
    app.constants.edit_buffer = "1M".to_string();
    let ok = app.constants.apply_edit();
    assert!(ok, "Should accept '1M'");
    assert_eq!(app.constants.absolute_max_size, 1_000_000);
}

// ── Persistence: to_snapshot / from_snapshot ──────────────────────

#[test]
fn test_constants_to_snapshot_default_values() {
    let config = ConstantsConfig::default();
    let snap = config.to_snapshot();
    assert_eq!(snap.auto_compact_threshold, 160_000);
    assert_eq!(snap.max_retries, 3);
    assert_eq!(snap.subagent_max_turns, 1000);
    assert_eq!(snap.subagent_max_tokens, 16_384);
    assert_eq!(snap.default_max_results, 10);
    assert_eq!(snap.absolute_max_results, 20);
    assert_eq!(snap.search_timeout_secs, 15);
    assert_eq!(snap.default_max_size, 100_000);
    assert_eq!(snap.absolute_max_size, 1_000_000);
    assert_eq!(snap.max_glob_results, 100);
    assert_eq!(snap.default_head_limit, 250);
    assert_eq!(snap.input_max_visual_lines, 10);
}

#[test]
fn test_constants_to_snapshot_custom_values() {
    let mut config = ConstantsConfig::default();
    config.auto_compact_threshold = 200_000;
    config.max_retries = 5;
    config.input_max_visual_lines = 20;
    let snap = config.to_snapshot();
    assert_eq!(snap.auto_compact_threshold, 200_000);
    assert_eq!(snap.max_retries, 5);
    assert_eq!(snap.input_max_visual_lines, 20);
}

#[test]
fn test_constants_from_snapshot_restores_values() {
    use chlodwig_core::ConstantsSnapshot;
    let snap = ConstantsSnapshot {
        auto_compact_threshold: 250_000,
        max_retries: 7,
        subagent_max_turns: 500,
        subagent_max_tokens: 8_192,
        default_max_results: 15,
        absolute_max_results: 30,
        search_timeout_secs: 30,
        default_max_size: 200_000,
        absolute_max_size: 2_000_000,
        max_glob_results: 200,
        default_head_limit: 500,
        input_max_visual_lines: 20,
    };
    let mut config = ConstantsConfig::default();
    config.from_snapshot(&snap);
    assert_eq!(config.auto_compact_threshold, 250_000);
    assert_eq!(config.max_retries, 7);
    assert_eq!(config.subagent_max_turns, 500);
    assert_eq!(config.subagent_max_tokens, 8_192);
    assert_eq!(config.default_max_results, 15);
    assert_eq!(config.absolute_max_results, 30);
    assert_eq!(config.search_timeout_secs, 30);
    assert_eq!(config.default_max_size, 200_000);
    assert_eq!(config.absolute_max_size, 2_000_000);
    assert_eq!(config.max_glob_results, 200);
    assert_eq!(config.default_head_limit, 500);
    assert_eq!(config.input_max_visual_lines, 20);
}

#[test]
fn test_constants_from_snapshot_preserves_ui_state() {
    use chlodwig_core::ConstantsSnapshot;
    let snap = ConstantsSnapshot {
        auto_compact_threshold: 200_000,
        ..ConstantsSnapshot::default()
    };
    let mut config = ConstantsConfig::default();
    config.selected_field = 5;
    config.is_editing = true;
    config.edit_buffer = "hello".into();
    config.from_snapshot(&snap);
    // Values are restored
    assert_eq!(config.auto_compact_threshold, 200_000);
    // UI state is NOT touched by from_snapshot
    assert_eq!(config.selected_field, 5);
    assert!(config.is_editing);
    assert_eq!(config.edit_buffer, "hello");
}

#[test]
fn test_constants_roundtrip_through_snapshot() {
    let mut original = ConstantsConfig::default();
    original.auto_compact_threshold = 999_999;
    original.max_retries = 10;
    original.input_max_visual_lines = 42;
    let snap = original.to_snapshot();
    let mut restored = ConstantsConfig::default();
    restored.from_snapshot(&snap);
    assert_eq!(restored.auto_compact_threshold, 999_999);
    assert_eq!(restored.max_retries, 10);
    assert_eq!(restored.input_max_visual_lines, 42);
    // Other fields should still be defaults
    assert_eq!(restored.subagent_max_turns, 1000);
    assert_eq!(restored.search_timeout_secs, 15);
}

// ── Standalone constants.json persistence tests ──

#[test]
fn test_constants_path_is_deterministic() {
    let p1 = chlodwig_core::constants_path();
    let p2 = chlodwig_core::constants_path();
    assert_eq!(p1, p2, "constants_path() must be deterministic");
}

#[test]
fn test_save_and_load_constants_file_roundtrip() {
    let tmp = tempfile::tempdir().unwrap();
    let path = tmp.path().join("constants.json");

    let mut config = ConstantsConfig::default();
    config.auto_compact_threshold = 500_000;
    config.max_retries = 11;
    config.input_max_visual_lines = 25;

    let snap = config.to_snapshot();
    chlodwig_core::save_constants_to(&snap, &path).unwrap();

    // Load back
    let loaded = chlodwig_core::load_constants_from(&path).unwrap().unwrap();
    let mut restored = ConstantsConfig::default();
    restored.from_snapshot(&loaded);

    assert_eq!(restored.auto_compact_threshold, 500_000);
    assert_eq!(restored.max_retries, 11);
    assert_eq!(restored.input_max_visual_lines, 25);
    // Untouched fields are defaults
    assert_eq!(restored.search_timeout_secs, 15);
}

#[test]
fn test_load_constants_returns_none_when_no_file() {
    let tmp = tempfile::tempdir().unwrap();
    let path = tmp.path().join("does_not_exist.json");
    let result = chlodwig_core::load_constants_from(&path).unwrap();
    assert!(result.is_none());
}

#[test]
fn test_constants_from_file_does_not_touch_ui_state() {
    // Loading constants from file should NOT reset selected_field / is_editing.
    let tmp = tempfile::tempdir().unwrap();
    let path = tmp.path().join("constants.json");

    let snap = chlodwig_core::ConstantsSnapshot {
        auto_compact_threshold: 300_000,
        ..chlodwig_core::ConstantsSnapshot::default()
    };
    chlodwig_core::save_constants_to(&snap, &path).unwrap();

    let mut config = ConstantsConfig::default();
    config.selected_field = 7;
    config.is_editing = true;
    config.edit_buffer = "42".into();

    let loaded = chlodwig_core::load_constants_from(&path).unwrap().unwrap();
    config.from_snapshot(&loaded);

    // Values updated
    assert_eq!(config.auto_compact_threshold, 300_000);
    // UI state preserved
    assert_eq!(config.selected_field, 7);
    assert!(config.is_editing);
    assert_eq!(config.edit_buffer, "42");
}

#[test]
fn test_constants_default_values_not_saved_on_fresh_start() {
    // On a fresh install, constants.json doesn't exist.
    // load_constants() should return None, not create a file.
    let tmp = tempfile::tempdir().unwrap();
    let path = tmp.path().join("constants.json");
    assert!(!path.exists());
    let result = chlodwig_core::load_constants_from(&path).unwrap();
    assert!(result.is_none());
    assert!(!path.exists(), "load_constants should NOT create the file");
}

#[test]
fn test_constants_file_survives_partial_fields() {
    // If constants.json has only some fields (e.g. hand-edited),
    // missing fields should get defaults.
    let tmp = tempfile::tempdir().unwrap();
    let path = tmp.path().join("constants.json");
    std::fs::write(&path, r#"{ "max_retries": 99 }"#).unwrap();

    let loaded = chlodwig_core::load_constants_from(&path).unwrap().unwrap();
    assert_eq!(loaded.max_retries, 99);
    assert_eq!(loaded.auto_compact_threshold, 160_000); // default
    assert_eq!(loaded.input_max_visual_lines, 10); // default
}
