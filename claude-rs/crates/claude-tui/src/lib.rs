//! Claude TUI — ratatui-based terminal interface.

pub(crate) mod app;
mod event_loop;
mod markdown;
mod permissions;
pub(crate) mod render;
pub(crate) mod rendered_line;
pub(crate) mod types;

#[cfg(test)]
mod tests;

pub use event_loop::{run_tui, run_tui_with_permissions};
