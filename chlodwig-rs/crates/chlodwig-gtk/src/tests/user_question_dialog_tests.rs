//! Tests for UserQuestion dialog width cap (issue #49).

use std::fs;

// ── Pure-function tests for `dialog_max_width` ──────────────────────

#[test]
fn test_dialog_max_width_for_typical_window() {
    // 1200 / 1.618 ≈ 741.7 → 742
    assert_eq!(crate::dialog_max_width(1200), 742);
}

#[test]
fn test_dialog_max_width_for_wide_window() {
    // 3440 / 1.618 ≈ 2126.1 → 2126
    assert_eq!(crate::dialog_max_width(3440), 2126);
}

#[test]
fn test_dialog_max_width_very_large_window() {
    // 5120 (ultra-wide) / 1.618 ≈ 3164
    assert_eq!(crate::dialog_max_width(5120), 3164);
}

#[test]
fn test_dialog_max_width_golden_ratio_dominates_above_threshold() {
    // Above ~518, the golden ratio cap exceeds 320 and dominates.
    // 520 / 1.618 ≈ 321.4 → 321
    assert_eq!(crate::dialog_max_width(520), 321);
}

/// Built-in floor: all inputs ≤ 400 are floored to 400, cap ≈ 247, clamped to 320.
#[test]
fn test_dialog_max_width_has_builtin_floor() {
    for input in [-100, -1, 0, 50, 100, 200, 300, 352, 399, 400] {
        let w = crate::dialog_max_width(input);
        assert_eq!(
            w, 320,
            "dialog_max_width({input}) = {w}, expected 320 (floor → 400 → cap 247 → clamp 320)"
        );
    }
}

/// Return value is always ≥ MIN_CAP (320), including for large inputs.
#[test]
fn test_dialog_max_width_never_below_min_cap() {
    for input in [i32::MIN, -1000, 0, 1, 400, 1000, 5120] {
        assert!(
            crate::dialog_max_width(input) >= 320,
            "dialog_max_width({input}) must be >= 320"
        );
    }
}

// ── Source-grep guards ───────────────────────────────────────────────

/// Read only the body of `show_user_question_dialog`, not the rest of the file.
fn read_dialog_fn_body() -> String {
    let src = fs::read_to_string(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/src/window.rs"
    ))
    .unwrap();
    let start = src.find("pub fn show_user_question_dialog").unwrap();
    let body = &src[start..];
    let mut depth = 0u32;
    let mut end = 0;
    for (i, c) in body.char_indices() {
        match c {
            '{' => depth += 1,
            '}' => {
                depth -= 1;
                if depth == 0 {
                    end = i + 1;
                    break;
                }
            }
            _ => {}
        }
    }
    assert!(end > 0, "could not find end of show_user_question_dialog");
    body[..end].to_string()
}

#[test]
fn test_user_question_dialog_uses_dialog_max_width() {
    let s = read_dialog_fn_body();
    assert!(
        s.contains("dialog_max_width"),
        "show_user_question_dialog must call dialog_max_width"
    );
}

/// The dialog must set `.default_width(initial_w)` so it starts at the
/// golden-ratio size but content follows user resize naturally.
#[test]
fn test_user_question_dialog_sets_default_width_from_golden_ratio() {
    let s = read_dialog_fn_body();
    let builder_start = s.find("gtk4::Window::builder()").expect("builder must exist");
    let builder_end = s[builder_start..].find(".build()").expect(".build() must exist");
    let builder_chain = &s[builder_start..builder_start + builder_end];
    assert!(
        builder_chain.contains(".default_width("),
        "Window builder must set .default_width(...) for initial golden-ratio size"
    );
}

/// No Clamp — content fills the full dialog width and follows user resize.
#[test]
fn test_user_question_dialog_does_not_use_clamp() {
    let s = read_dialog_fn_body();
    assert!(
        !s.contains("Clamp::new()"),
        "dialog must NOT use Clamp — content should follow dialog width naturally"
    );
}

/// Question label must set_wrap(true) — checked via the variable name.
#[test]
fn test_user_question_dialog_question_label_wraps() {
    let s = read_dialog_fn_body();
    assert!(
        s.contains("question_label.set_wrap(true)"),
        "question_label must have set_wrap(true)"
    );
}

/// Option button labels must set_wrap(true) — inside the `for (i, opt)` loop.
#[test]
fn test_user_question_dialog_option_labels_wrap() {
    let s = read_dialog_fn_body();
    let loop_start = s.find("for (i, opt)").expect("option loop must exist");
    let loop_body = &s[loop_start..];
    let mut depth = 0u32;
    let mut end = 0;
    for (i, c) in loop_body.char_indices() {
        match c {
            '{' => depth += 1,
            '}' => {
                depth -= 1;
                if depth == 0 {
                    end = i + 1;
                    break;
                }
            }
            _ => {}
        }
    }
    let loop_section = &loop_body[..end];
    assert!(
        loop_section.contains("set_wrap(true)"),
        "option button labels inside the for-loop must have set_wrap(true)"
    );
}

/// dialog.set_child must use &content directly, not a Clamp wrapper.
#[test]
fn test_user_question_dialog_set_child_is_content_not_clamp() {
    let s = read_dialog_fn_body();
    assert!(
        s.contains("set_child(Some(&content))"),
        "dialog.set_child must use &content directly"
    );
    assert!(
        !s.contains("set_child(Some(&clamp))"),
        "dialog.set_child must NOT use &clamp"
    );
}
