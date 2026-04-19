//! Tests for the Edit-tool render unification.
//!
//! After Variant B refactor: there is ONE block-renderer (`render_block`)
//! that delegates Edit rendering to `render_edit_tool_use`. Both the live
//! append path (`append_block`) and the full re-render path
//! (`render_all_blocks_into`) call `render_block`, so they automatically
//! share the same Edit rendering. This test file enforces that
//! `render_edit_tool_use` exists and is referenced exactly once from the
//! single `render_block` dispatcher.

#[test]
fn test_render_edit_tool_use_helper_exists() {
    let render_src = include_str!("../render.rs");
    assert!(
        render_src.contains("fn render_edit_tool_use"),
        "render.rs must define a `render_edit_tool_use` helper that the \
         single `render_block` dispatcher calls for ToolUseStart with \
         name == \"Edit\"."
    );
}

#[test]
fn test_render_block_uses_edit_helper() {
    // The unified render_block dispatcher must call render_edit_tool_use
    // for the Edit branch. Since render_block is the sole entry point for
    // block rendering, this single check is enough — the live and
    // re-render paths can no longer drift.
    let src = include_str!("../render.rs");
    let body_start = src
        .find("fn render_block")
        .expect("render_block must exist");
    let body_end = src[body_start + 1..]
        .find("\npub fn ")
        .map(|i| body_start + 1 + i)
        .unwrap_or(src.len());
    let body = &src[body_start..body_end];
    assert!(
        body.contains("render_edit_tool_use"),
        "render_block must call render_edit_tool_use for the Edit branch."
    );
}

#[test]
fn test_no_inline_diff_for_edit_anywhere() {
    // Regression guard: nowhere in render.rs may we have inline
    // `format!("- {line}\n")` / `format!("+ {line}\n")` Edit diff loops
    // — those bypass syntax highlighting. All Edit rendering goes
    // through render_edit_tool_use.
    let src = include_str!("../render.rs");
    assert!(
        !src.contains("\"- {line}\\n\"") && !src.contains("\"+ {line}\\n\""),
        "render.rs must NOT contain inline `format!(\"- {{line}}\\n\")` / \
         `format!(\"+ {{line}}\\n\")` for Edit diffs — use the \
         render_edit_tool_use helper exclusively."
    );
}

