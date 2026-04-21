//! MVU reducers shared between TUI and GTK frontends.
//!
//! Each submodule defines a self-contained `(Model, Msg, update)` triple
//! that owns one concern of the UI state. The reducer is **pure**: it never
//! touches I/O, the terminal, GTK widgets, or async runtimes. UIs translate
//! their native events (crossterm `KeyEvent`, GTK signals) into `Msg` values,
//! pass them to `update`, and react to the returned `Outcome`.
//!
//! This separation enables:
//! - Headless unit tests of UI behavior (no ratatui, no GTK)
//! - Code sharing between TUI and GTK (one reducer, two views)
//! - Clear boundary between state mutation and side effects

pub mod user_question;
pub mod unwind;

pub use unwind::unwind_messages;
