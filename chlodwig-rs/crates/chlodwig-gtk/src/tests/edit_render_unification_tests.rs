//! Tests for the Edit-tool render unification.
//!
//! Background: there are THREE render paths in `crates/chlodwig-gtk/src/render.rs`:
//!   - `render_event_to_buffer()` — live SSE streaming. Renders Edit tool_use
//!     blocks with **syntax highlighting** via `render_highlighted_line()`.
//!   - `render_restored_blocks()` — append render after `--resume` / `/resume`.
//!     Used to render Edit tool_use blocks as **plain diff_remove/diff_add tags
//!     only — no syntax highlighting**.
//!   - `rerender_all_blocks()` — full re-render (e.g. after table interaction).
//!     Used to render Edit tool_use blocks as **a generic `── Tool: Edit ──`
//!     header followed by raw JSON** — completely losing the diff format.
//!
//! Symptom: after `/resume`-ing a session whose history contains Edit tool_uses,
//! the diff appears as raw monochrome text (or as raw JSON after table
//! interactions trigger `rerender_all_blocks`) instead of the colored,
//! syntax-highlighted diff the user saw during the original live session.
//!
//! Fix: extract the Edit rendering into a single helper function
//! `render::render_edit_tool_use(buffer, input)` that uses
//! `render_highlighted_line()` for both `old_string` and `new_string`. All
//! three render paths call this helper.

// ── Source-grep tests: enforce single Edit render path ──────────────

fn body_of(src: &str, fn_name: &str) -> String {
    let needle = format!("fn {fn_name}");
    let body_start = src
        .find(&needle)
        .unwrap_or_else(|| panic!("{fn_name} must exist in render.rs"));
    let body_end = src[body_start + 1..]
        .find("\npub fn ")
        .map(|i| body_start + 1 + i)
        .unwrap_or(src.len());
    src[body_start..body_end].to_string()
}

#[test]
fn test_render_edit_tool_use_helper_exists() {
    let render_src = include_str!("../render.rs");
    assert!(
        render_src.contains("fn render_edit_tool_use"),
        "render.rs must define a `render_edit_tool_use` helper that all three \
         render paths (render_event_to_buffer, render_restored_blocks, \
         rerender_all_blocks) call. This ensures Edit diffs look identical \
         whether they came in via SSE, were restored from a saved session, \
         or are re-rendered after a table interaction."
    );
}

#[test]
fn test_render_event_to_buffer_uses_edit_helper() {
    let src = include_str!("../render.rs");
    let body = body_of(src, "render_event_to_buffer");
    assert!(
        body.contains("render_edit_tool_use"),
        "render_event_to_buffer must call render_edit_tool_use for \
         ConversationEvent::ToolUseStart with name == \"Edit\"."
    );
}

#[test]
fn test_render_restored_blocks_uses_edit_helper() {
    let src = include_str!("../render.rs");
    let body = body_of(src, "render_restored_blocks");
    assert!(
        body.contains("render_edit_tool_use"),
        "render_restored_blocks must call render_edit_tool_use for \
         DisplayBlock::ToolUseStart with name == \"Edit\" — otherwise \
         restored sessions show Edit diffs WITHOUT syntax highlighting \
         (this was the production bug)."
    );
}

#[test]
fn test_rerender_all_blocks_uses_edit_helper() {
    let src = include_str!("../render.rs");
    let body = body_of(src, "rerender_all_blocks");
    assert!(
        body.contains("render_edit_tool_use"),
        "rerender_all_blocks must call render_edit_tool_use for \
         DisplayBlock::ToolUseStart with name == \"Edit\" — otherwise \
         a table interaction (which triggers a full re-render) replaces \
         the colored Edit diff with raw `── Tool: Edit ──` + JSON."
    );
}

#[test]
fn test_render_restored_blocks_does_not_inline_diff_for_edit() {
    // Guard against regression: the buggy version had its own inline loop
    // emitting `diff_remove` / `diff_add` tags WITHOUT calling
    // render_highlighted_line. After unification, those inline diff_remove/
    // diff_add `append_styled` calls inside the Edit branch must be gone.
    let src = include_str!("../render.rs");
    let body = body_of(src, "render_restored_blocks");
    assert!(
        !body.contains("\"- {line}\\n\"") && !body.contains("\"+ {line}\\n\""),
        "render_restored_blocks must NOT contain inline `format!(\"- {{line}}\\n\")` / \
         `format!(\"+ {{line}}\\n\")` for Edit diffs — that bypasses syntax highlighting. \
         Use the render_edit_tool_use helper instead."
    );
}

