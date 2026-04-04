use super::*;

#[test]
fn test_long_line_wraps_into_multiple_rendered_lines() {
    let mut app = App::new("test".into());
    app.wrap_width = 20;
    app.display_blocks.push(DisplayBlock::AssistantText(
        "a".repeat(50),
    ));
    app.mark_dirty();
    app.rebuild_lines();

    let non_blank = app.rendered_lines.iter()
        .filter(|l| !l.spans.is_empty() && l.spans[0].0 != "")
        .count();
    assert!(
        non_blank >= 3,
        "50-char line at width 20 should produce >=3 lines, got {non_blank} (total {})",
        app.rendered_lines.len()
    );
}

#[test]
fn test_short_line_no_wrap() {
    let mut app = App::new("test".into());
    app.wrap_width = 80;
    app.display_blocks.push(DisplayBlock::AssistantText(
        "short".into(),
    ));
    app.mark_dirty();
    app.rebuild_lines();

    assert!(
        app.rendered_lines.len() >= 2,
        "Should have at least 2 lines, got {}",
        app.rendered_lines.len()
    );
    let first_text: String = app.rendered_lines[0]
        .spans.iter().map(|(t, _)| t.as_str()).collect();
    assert!(first_text.contains("short"), "First line should contain 'short', got: {first_text}");
}

#[test]
fn test_wrap_width_zero_no_panic() {
    let mut app = App::new("test".into());
    app.wrap_width = 0;
    app.display_blocks.push(DisplayBlock::AssistantText(
        "hello world".into(),
    ));
    app.mark_dirty();
    app.rebuild_lines();
    assert!(!app.rendered_lines.is_empty());
}

#[test]
fn test_display_width_uses_unicode_width() {
    let line = RenderedLine {
        spans: vec![("日本語".into(), Style::default())],
        wrap_prefix: None,
    };
    assert_eq!(line.display_width(), 6);
}

#[test]
fn test_wrap_respects_unicode_display_width() {
    let line = RenderedLine {
        spans: vec![("日本語中文".into(), Style::default())],
        wrap_prefix: None,
    };
    let wrapped = line.wrap(6);
    assert_eq!(
        wrapped.len(), 2,
        "5 CJK chars (10 cols) at width 6 should produce 2 lines, got {}",
        wrapped.len()
    );
    assert_eq!(wrapped[0].display_width(), 6);
    assert_eq!(wrapped[1].display_width(), 4);
}

#[test]
fn test_display_width_flag_emoji() {
    let line = RenderedLine {
        spans: vec![("🇩🇪".into(), Style::default())],
        wrap_prefix: None,
    };
    assert_eq!(line.display_width(), 2, "🇩🇪 should be 2 columns");
}

#[test]
fn test_wrap_flag_emoji_consistent_with_display_width() {
    let line = RenderedLine {
        spans: vec![("Hi 🇩🇪!".into(), Style::default())],
        wrap_prefix: None,
    };
    let dw = line.display_width();
    assert_eq!(dw, 6, "\"Hi 🇩🇪!\" should be 6 columns, got {}", dw);

    let wrapped = line.wrap(80);
    assert_eq!(wrapped.len(), 1, "Should fit in 80 cols without wrapping");
    assert_eq!(wrapped[0].display_width(), dw, "Wrapped width must equal display_width");
}

#[test]
fn test_wrap_zwj_emoji_not_split() {
    let line = RenderedLine {
        spans: vec![("A🏳️‍🌈B".into(), Style::default())],
        wrap_prefix: None,
    };
    let dw = line.display_width();
    let wrapped = line.wrap(dw);
    assert_eq!(wrapped.len(), 1, "Should not wrap at exact display_width");
    assert_eq!(wrapped[0].display_width(), dw);
}

#[test]
fn test_wrap_combining_characters_consistent() {
    let line = RenderedLine {
        spans: vec![("Gru\u{0308}\u{00DF}e".into(), Style::default())],
        wrap_prefix: None,
    };
    let dw = line.display_width();
    assert_eq!(dw, 5, "Grüße (decomposed ü) should be 5 columns");
    let wrapped = line.wrap(80);
    assert_eq!(wrapped.len(), 1);
    assert_eq!(wrapped[0].display_width(), dw);
}

#[test]
fn test_wrap_does_not_split_grapheme_cluster() {
    let text = "aaau\u{0308}bbb";
    let line = RenderedLine {
        spans: vec![(text.into(), Style::default())],
        wrap_prefix: None,
    };
    assert_eq!(line.display_width(), 7);
    let wrapped = line.wrap(4);
    assert_eq!(wrapped.len(), 2, "Should wrap into 2 lines");
    assert_eq!(wrapped[0].display_width(), 4);
    assert_eq!(wrapped[1].display_width(), 3);
    let first_text: String = wrapped[0].spans.iter().map(|(t, _)| t.as_str()).collect();
    assert!(first_text.contains("\u{0308}"), "Combining diaeresis must stay with 'u'");
}
