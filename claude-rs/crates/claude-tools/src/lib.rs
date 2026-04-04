//! Built-in tool implementations: Bash, Read, Write, Edit, Glob, Grep, ListDir, WebFetch, WebSearch.

mod bash;
mod edit;
mod glob;
mod grep;
mod listdir;
mod read;
mod webfetch;
mod websearch;
mod write;

pub use bash::BashTool;
pub use edit::EditTool;
pub use glob::GlobTool;
pub use grep::GrepTool;
pub use listdir::ListDirTool;
pub use read::ReadTool;
pub use webfetch::WebFetchTool;
pub use websearch::WebSearchTool;
pub use write::WriteTool;

/// Create a Vec of all built-in tools.
pub fn builtin_tools() -> Vec<Box<dyn claude_core::Tool>> {
    vec![
        Box::new(BashTool),
        Box::new(ReadTool),
        Box::new(WriteTool),
        Box::new(EditTool),
        Box::new(GlobTool),
        Box::new(GrepTool),
        Box::new(ListDirTool),
        Box::new(WebFetchTool),
        Box::new(WebSearchTool),
    ]
}
