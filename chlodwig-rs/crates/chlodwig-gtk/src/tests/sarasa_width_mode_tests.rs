//! Regression: GTK render path must use Sarasa-font width mode for tables,
//! not the spec-default `unicode_width` measurement. See Gotcha #54 follow-up.

#[test]
fn test_lib_exports_sarasa_metrics_function() {
    let src = std::fs::read_to_string("src/lib.rs")
        .expect("lib.rs must be readable");
    assert!(
        src.contains("pub fn sarasa_metrics()"),
        "lib.rs must expose `sarasa_metrics()` as the SSoT for FontMetrics"
    );
}

#[test]
fn test_lib_exports_sarasa_width_mode_function() {
    let src = std::fs::read_to_string("src/lib.rs")
        .expect("lib.rs must be readable");
    assert!(
        src.contains("pub fn sarasa_width_mode()"),
        "lib.rs must expose `sarasa_width_mode()` returning WidthMode::Font(...)"
    );
}

#[test]
fn test_render_uses_sarasa_width_mode_for_assistant_text() {
    // The AssistantText render branch in render.rs must call the
    // font-aware renderer, not render_markdown_with_table_overrides
    // (which defaults to WidthMode::Default and breaks → in tables).
    let src = std::fs::read_to_string("src/render.rs")
        .expect("render.rs must be readable");
    assert!(
        src.contains("render_markdown_with_options"),
        "render.rs must call `render_markdown_with_options` (font-aware path)"
    );
    assert!(
        src.contains("sarasa_width_mode()"),
        "render.rs must pass `sarasa_width_mode()` to the renderer"
    );
}

#[test]
fn test_render_does_not_call_legacy_width_only_renderer_for_assistant() {
    // The pre-fix code paths (`render_markdown_with_width` /
    // `render_markdown_with_table_overrides` without options) used the
    // spec-default WidthMode → → broke table borders. The AssistantText
    // and streaming paths must NOT use those bare functions anymore.
    let src = std::fs::read_to_string("src/render.rs")
        .expect("render.rs must be readable");
    // The old call form `render_markdown_with_table_overrides(text, w, &overrides)`
    // (3-arg) is forbidden — must go through render_markdown_with_options.
    assert!(
        !src.contains("render_markdown_with_table_overrides("),
        "render.rs must not use the legacy 3-arg renderer; use render_markdown_with_options"
    );
}

#[test]
fn test_sarasa_metrics_is_singleton_via_oncelock() {
    // The metrics struct is expensive to build (~5ms ttf-parse) — it must
    // be cached as a process-wide singleton via OnceLock, not rebuilt
    // on every render call.
    let src = std::fs::read_to_string("src/lib.rs")
        .expect("lib.rs must be readable");
    assert!(
        src.contains("OnceLock") && src.contains("SARASA_METRICS"),
        "lib.rs must cache sarasa_metrics() in a OnceLock singleton"
    );
}

// ── Guard: GTK md_renderer must not regress to spec-default render API ──
//
// The TUI legitimately uses `render_markdown` / `render_markdown_with_width`
// because it has no FontMetrics. The GTK frontend MUST always go through
// `render_markdown_with_options(..., sarasa_width_mode())`. Any new
// callsite using the old API in the GTK crate will silently break table
// alignment for codepoints the manifest fixes (✈ ✉ ✏ ⛈ etc.).

#[test]
fn test_md_renderer_does_not_call_legacy_render_markdown() {
    let src = std::fs::read_to_string("src/md_renderer.rs")
        .expect("md_renderer.rs must be readable");
    // Guard against `chlodwig_core::render_markdown(` and
    // `chlodwig_core::render_markdown_with_width(` — both bypass FontMetrics.
    // `render_markdown_with_options` is allowed (the canonical entry).
    let bad1 = src.contains("chlodwig_core::render_markdown(");
    let bad2 = src.contains("chlodwig_core::render_markdown_with_width(");
    assert!(
        !bad1 && !bad2,
        "md_renderer.rs must use render_markdown_with_options(..., sarasa_width_mode()), \
         not the spec-default render_markdown / render_markdown_with_width — those bypass \
         the pipeline manifest width overrides and break table alignment for ✈ ✉ ⛈ etc."
    );
}

#[test]
fn test_md_renderer_dead_wrappers_are_removed() {
    // These wrappers (`append_markdown`, `append_markdown_with_width`,
    // `replace_range_with_markdown`) were never called outside the file
    // itself. They used the spec-default API and would silently break
    // table alignment if anyone resurrected them. Keep them deleted.
    let src = std::fs::read_to_string("src/md_renderer.rs")
        .expect("md_renderer.rs must be readable");
    for dead in &[
        "pub fn append_markdown(",
        "pub fn append_markdown_with_width(",
        "pub fn replace_range_with_markdown(",
    ] {
        assert!(
            !src.contains(dead),
            "{dead} must stay deleted — it bypassed the pipeline manifest. \
             If you need a render helper, use render_markdown_with_options(text, w, &[], \
             chlodwig_gtk::sarasa_width_mode()) directly."
        );
    }
}
