use super::*;

// ── Git tab existence and defaults ──────────────────────────────

#[test]
fn test_git_tab_index_is_4() {
    // Git tab should be the 5th tab (index 4)
    let app = App::new("test".into());
    // Tab 4 should be reachable via tab_bar_right from tab 3
    let mut a = app;
    a.focus = Focus::TabBar;
    a.active_tab = 3;
    a.handle_tab_bar_right();
    assert_eq!(a.active_tab, 4, "Tab after Constants (3) should be Git (4)");
}

#[test]
fn test_git_tab_wraps_to_first() {
    let mut app = App::new("test".into());
    app.focus = Focus::TabBar;
    app.active_tab = 4;
    app.handle_tab_bar_right();
    assert_eq!(app.active_tab, 0, "Right from Git (4) should wrap to Prompt (0)");
}

#[test]
fn test_git_tab_left_from_prompt_wraps_to_git() {
    let mut app = App::new("test".into());
    app.focus = Focus::TabBar;
    app.active_tab = 0;
    app.handle_tab_bar_left();
    assert_eq!(app.active_tab, 4, "Left from Prompt (0) should wrap to Git (4)");
}

#[test]
fn test_git_tab_full_cycle_right() {
    let mut app = App::new("test".into());
    app.focus = Focus::TabBar;
    app.active_tab = 0;
    // Cycle through all 5 tabs and back to start
    app.handle_tab_bar_right(); // 0 -> 1
    app.handle_tab_bar_right(); // 1 -> 2
    app.handle_tab_bar_right(); // 2 -> 3
    app.handle_tab_bar_right(); // 3 -> 4
    app.handle_tab_bar_right(); // 4 -> 0
    assert_eq!(app.active_tab, 0, "Full right cycle through 5 tabs should return to Prompt");
}

#[test]
fn test_git_tab_full_cycle_left() {
    let mut app = App::new("test".into());
    app.focus = Focus::TabBar;
    app.active_tab = 0;
    // Cycle backwards through all 5 tabs
    app.handle_tab_bar_left(); // 0 -> 4
    app.handle_tab_bar_left(); // 4 -> 3
    app.handle_tab_bar_left(); // 3 -> 2
    app.handle_tab_bar_left(); // 2 -> 1
    app.handle_tab_bar_left(); // 1 -> 0
    assert_eq!(app.active_tab, 0, "Full left cycle through 5 tabs should return to Prompt");
}

// ── Git branch detection ────────────────────────────────────────

#[test]
fn test_git_branch_loaded_at_startup() {
    // When running inside a git repo, App::new() should already have the branch name set.
    // The test suite runs inside the chlodwig-rs repo, so there must be a branch.
    let app = App::new("test".into());
    assert!(
        !app.git_branch.is_empty(),
        "git_branch should be populated immediately after App::new() (we're in a git repo)"
    );
}

#[test]
fn test_git_tab_label_populated_at_startup() {
    // The tab label must show the branch name right away, not just "git"
    let app = App::new("test".into());
    let label = app.git_tab_label();
    assert!(
        label.contains("⎇"),
        "Tab label should contain ⎇ with branch name at startup, got: {label}"
    );
}

#[test]
fn test_git_tab_label_with_branch() {
    let mut app = App::new("test".into());
    app.git_branch = "main".to_string();
    let label = app.git_tab_label();
    assert_eq!(label, "git ⎇ main");
}

#[test]
fn test_git_tab_label_without_branch() {
    let mut app = App::new("test".into());
    app.git_branch = String::new(); // simulate not being in a git repo
    let label = app.git_tab_label();
    assert_eq!(label, "git");
}

#[test]
fn test_git_tab_label_with_feature_branch() {
    let mut app = App::new("test".into());
    app.git_branch = "feature/add-git-tab".to_string();
    let label = app.git_tab_label();
    assert_eq!(label, "git ⎇ feature/add-git-tab");
}

// ── Git status lines ────────────────────────────────────────────

#[test]
fn test_rebuild_git_lines_empty_status() {
    let mut app = App::new("test".into());
    app.git_status_output = String::new();
    app.rebuild_git_lines();
    // Should have at least a header or placeholder
    assert!(!app.git_lines.is_empty(), "Should have at least a placeholder line");
    let all_text: String = app.git_lines.iter()
        .flat_map(|rl| rl.spans.iter().map(|(t, _)| t.clone()))
        .collect::<Vec<_>>()
        .join("");
    assert!(
        all_text.contains("no changes") || all_text.contains("not a git repo") || all_text.contains("git"),
        "Empty status should show a meaningful message, got: {all_text}"
    );
}

#[test]
fn test_rebuild_git_lines_with_status() {
    let mut app = App::new("test".into());
    app.git_status_output = "M  src/main.rs\n?? new_file.txt\n".to_string();
    app.git_branch = "main".to_string();
    app.rebuild_git_lines();
    let all_text: String = app.git_lines.iter()
        .flat_map(|rl| rl.spans.iter().map(|(t, _)| t.clone()))
        .collect::<Vec<_>>()
        .join("\n");
    assert!(all_text.contains("main.rs"), "Should contain file names from status output");
    assert!(all_text.contains("new_file.txt"), "Should contain untracked files");
}

// ── Git tab scroll ──────────────────────────────────────────────

#[test]
fn test_git_tab_scroll_up() {
    let mut app = App::new("test".into());
    app.active_tab = 4;
    app.git_scroll = 10;
    app.tab_scroll_up(3);
    assert_eq!(app.git_scroll, 7);
}

#[test]
fn test_git_tab_scroll_down() {
    let mut app = App::new("test".into());
    app.active_tab = 4;
    app.git_status_output = "line\n".repeat(200);
    app.rebuild_git_lines();
    app.git_scroll = 0;
    app.tab_scroll_down(5, 40);
    assert_eq!(app.git_scroll, 5);
}

#[test]
fn test_git_tab_scroll_up_clamps_at_zero() {
    let mut app = App::new("test".into());
    app.active_tab = 4;
    app.git_scroll = 2;
    app.tab_scroll_up(10);
    assert_eq!(app.git_scroll, 0, "Should clamp at 0");
}

#[test]
fn test_git_tab_scroll_down_clamps_at_max() {
    let mut app = App::new("test".into());
    app.active_tab = 4;
    app.git_status_output = "short".to_string();
    app.rebuild_git_lines();
    let total = app.git_lines.len();
    app.tab_scroll_down(1000, 40);
    let expected_max = total.saturating_sub(40);
    assert_eq!(app.git_scroll, expected_max, "Should clamp at max");
}

// ── Crash dump includes git state ───────────────────────────────

#[test]
fn test_crash_dump_includes_git_lines() {
    let mut app = App::new("test".into());
    app.git_branch = "main".to_string();
    let dump = app.crash_dump();
    assert!(dump.contains("git_lines"), "Crash dump should include git_lines.len()");
}
