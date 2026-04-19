//! Tests for the Final + Streaming TextView architecture (Variant B).
//!
//! Background: previously the GTK output area was a SINGLE `TextBuffer`
//! containing both completed conversation history (UserMessage, AssistantText,
//! ToolUseStart, ToolResult, …) AND the in-flight streaming text. This
//! required:
//!   - tracking `streaming_start_offset: i32` to know where the streaming
//!     region begins (so it can be replaced on each TextDelta)
//!   - re-rendering the streaming region on every tick (flicker risk)
//!   - mixing live event rendering with state-block rendering, leading to
//!     three drifted render functions (render_event_to_buffer,
//!     render_restored_blocks, rerender_all_blocks).
//!
//! New architecture (Variant B): TWO TextViews stacked vertically inside a
//! single ScrolledWindow:
//!   ├── final_view    — append-only history of completed DisplayBlocks
//!   └── streaming_view — live streaming buffer, hidden when empty
//!
//! Lifecycle:
//!   - TextDelta            → append to streaming_buffer; re-render streaming_view
//!   - TextComplete         → push AssistantText block; clear+hide streaming_view;
//!                            append the new block to final_view
//!   - ToolUseStart/Result  → push block; flush streaming if active;
//!                            append the new block to final_view
//!   - Resize               → clear+rerender final_view from state.blocks
//!   - Restore              → clear+rerender final_view from state.blocks (same code)
//!
//! Result: ONE render_block function. No streaming_start_offset. No three-way
//! drift. Streaming is flicker-free because it lives in its own buffer.

// ── Source-grep tests: enforce the new architecture ────────────────────

#[test]
fn test_ui_widgets_has_final_and_streaming_views() {
    // window.rs::UiWidgets must expose BOTH final_view and streaming_view
    // (and their buffers). The old single `output_view`/`output_buffer` is
    // renamed/removed.
    let src = include_str!("../window.rs");
    assert!(
        src.contains("pub final_view") || src.contains("final_view:"),
        "UiWidgets must contain `final_view` (the append-only history view)"
    );
    assert!(
        src.contains("pub streaming_view") || src.contains("streaming_view:"),
        "UiWidgets must contain `streaming_view` (the live-streaming view)"
    );
    assert!(
        src.contains("pub final_buffer") || src.contains("final_buffer:"),
        "UiWidgets must contain `final_buffer` (the TextBuffer of final_view)"
    );
    assert!(
        src.contains("pub streaming_buffer_widget")
            || src.contains("streaming_buffer_widget:"),
        "UiWidgets must contain `streaming_buffer_widget` (the TextBuffer of \
         streaming_view; named with `_widget` suffix to distinguish from \
         AppState.streaming_buffer which is the source-of-truth String)"
    );
}

#[test]
fn test_window_builds_two_text_views_in_vertical_box() {
    // build_window must construct two EmojiTextView/TextView instances and
    // pack them into a vertical GtkBox inside the ScrolledWindow.
    let src = include_str!("../window.rs");
    // The two views are EmojiTextView::with_buffer(...) calls — must appear twice.
    let count = src.matches("EmojiTextView::with_buffer").count();
    assert!(
        count >= 2,
        "build_window must construct at least two EmojiTextView instances \
         (one for final_view, one for streaming_view); found {count}"
    );
}

#[test]
fn test_streaming_start_offset_is_gone() {
    // The old `streaming_start_offset: Cell<i32>` plumbing is no longer
    // needed — the streaming_view's buffer IS the streaming offset.
    let event_dispatch = include_str!("../event_dispatch.rs");
    let main = include_str!("../main.rs");
    let setup = include_str!("../setup.rs");
    assert!(
        !event_dispatch.contains("streaming_start_offset"),
        "event_dispatch.rs must no longer reference streaming_start_offset \
         — the streaming TextView replaces this offset tracking"
    );
    assert!(
        !main.contains("streaming_start_offset"),
        "main.rs must no longer reference streaming_start_offset"
    );
    assert!(
        !setup.contains("streaming_start_offset"),
        "setup.rs must no longer reference streaming_start_offset"
    );
}

#[test]
fn test_render_event_to_buffer_is_gone() {
    // The live-event-rendering function is gone; events go through
    // state.handle_event() to produce DisplayBlocks, which are then rendered
    // via append_block (live append) or render_all_blocks_into (full re-render).
    let render = include_str!("../render.rs");
    assert!(
        !render.contains("pub fn render_event_to_buffer"),
        "render.rs must no longer define render_event_to_buffer; live events \
         flow through state.handle_event → append_block instead"
    );
}

#[test]
fn test_render_has_single_block_renderer() {
    // There must be ONE render_block function that renders a single
    // DisplayBlock. Both the live-append path and the full-rerender path
    // must call it.
    let src = include_str!("../render.rs");
    assert!(
        src.contains("pub fn render_block"),
        "render.rs must define a single `render_block(buffer, block, ctx)` \
         function as the single source of truth for block rendering"
    );
}

#[test]
fn test_render_has_append_block_for_live_events() {
    // append_block(buffer, block, ctx) — appends a single block to the
    // final_view buffer. Used by event_dispatch when a new block arrives.
    let src = include_str!("../render.rs");
    assert!(
        src.contains("pub fn append_block"),
        "render.rs must define `append_block(buffer, block, ctx)` for the \
         live-event path"
    );
}

#[test]
fn test_render_has_render_all_blocks_for_resize_and_restore() {
    // render_all_blocks_into(buffer, &[Block], ctx) — wipes the buffer and
    // renders every block. Used for resize, restore, theme/toggle.
    let src = include_str!("../render.rs");
    assert!(
        src.contains("pub fn render_all_blocks_into"),
        "render.rs must define `render_all_blocks_into(buffer, blocks, ctx)` \
         for the resize/restore/toggle path. THIS REPLACES the old \
         rerender_all_blocks AND render_restored_blocks (single function now)."
    );
}

#[test]
fn test_render_restored_blocks_is_gone() {
    // Folded into render_all_blocks_into.
    let src = include_str!("../render.rs");
    assert!(
        !src.contains("pub fn render_restored_blocks"),
        "render_restored_blocks must be folded into render_all_blocks_into"
    );
}

#[test]
fn test_rerender_all_blocks_is_gone() {
    // Folded into render_all_blocks_into.
    let src = include_str!("../render.rs");
    assert!(
        !src.contains("pub fn rerender_all_blocks"),
        "rerender_all_blocks must be folded into render_all_blocks_into"
    );
}

#[test]
fn test_event_dispatch_uses_append_block_for_live_events() {
    let src = include_str!("../event_dispatch.rs");
    assert!(
        src.contains("append_block"),
        "event_dispatch.rs must call render::append_block when a new \
         DisplayBlock is added during the live event loop"
    );
}

#[test]
fn test_event_dispatch_renders_streaming_into_streaming_view() {
    let src = include_str!("../event_dispatch.rs");
    assert!(
        src.contains("streaming_buffer_widget") || src.contains("streaming_view"),
        "event_dispatch.rs must render the streaming buffer into the \
         streaming_view's TextBuffer (not the final_view buffer)"
    );
}

#[test]
fn test_display_block_tool_result_has_tool_metadata() {
    // DisplayBlock::ToolResult must carry `tool_name` and `tool_input` so
    // the renderer can produce the rich Bash-ANSI / Read-line-numbers /
    // Write-summary output even when restoring from a saved session.
    let src = include_str!("../app_state.rs");
    // The struct definition must mention tool_name AND tool_input.
    let after_tool_result = src
        .find("ToolResult {")
        .expect("DisplayBlock::ToolResult must exist");
    let next_500 = &src[after_tool_result..(after_tool_result + 500).min(src.len())];
    assert!(
        next_500.contains("tool_name") && next_500.contains("tool_input"),
        "DisplayBlock::ToolResult must carry `tool_name: String` and \
         `tool_input: serde_json::Value` so the renderer can reconstruct \
         rich tool-specific rendering on session restore"
    );
}

#[test]
fn test_session_compatibility_serde_default_on_tool_metadata() {
    // Old sessions don't have tool_name/tool_input — the new fields must
    // be #[serde(default)] so loading old session.json doesn't fail.
    // (If the DisplayBlock isn't directly serialized — it's not, only
    // chlodwig-core Messages are — this test must verify whatever IS
    // serialized has the same property. Check that loading a session
    // with old-style ToolResult still works.)
    //
    // Concrete check: app_state.rs::restore_messages must continue to
    // populate tool_name/tool_input even from RestoredBlock variants
    // that lack them (BashOutput, ReadOutput, WriteOutput, GrepOutput,
    // ToolResult fallback).
    let src = include_str!("../app_state.rs");
    let restore_start = src
        .find("pub fn restore_messages")
        .expect("restore_messages must exist");
    let restore_body = &src[restore_start..];
    // Each RestoredBlock arm that produces a ToolResult must populate tool_name.
    assert!(
        restore_body.contains("tool_name:") || restore_body.contains("tool_name :"),
        "restore_messages must populate tool_name on every ToolResult \
         DisplayBlock it pushes (so restored sessions render the rich tool \
         output, e.g. Bash with ANSI colors)"
    );
}
