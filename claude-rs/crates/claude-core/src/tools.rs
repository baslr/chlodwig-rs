//! Tool trait and related types.

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::time::Duration;

/// Schema sent to the API so the model knows how to call a tool.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolDefinition {
    pub name: String,
    pub description: String,
    pub input_schema: serde_json::Value,
}

/// Result of executing a tool.
#[derive(Debug, Clone)]
pub struct ToolOutput {
    pub content: crate::ToolResultContent,
    pub is_error: bool,
}

/// Context passed to every tool invocation.
#[derive(Debug, Clone)]
pub struct ToolContext {
    pub working_directory: PathBuf,
    pub timeout: Duration,
}

impl Default for ToolContext {
    fn default() -> Self {
        Self {
            working_directory: std::env::current_dir().unwrap_or_else(|_| PathBuf::from("/")),
            timeout: Duration::from_secs(120),
        }
    }
}

/// The core tool trait. Implement this for each built-in or MCP tool.
#[async_trait]
pub trait Tool: Send + Sync {
    /// The definition sent to the API (name, description, input schema).
    fn definition(&self) -> ToolDefinition;

    /// Execute the tool with the given JSON input.
    async fn call(
        &self,
        input: serde_json::Value,
        ctx: &ToolContext,
    ) -> Result<ToolOutput, ToolError>;

    /// Whether this tool can safely run concurrently with other tools.
    fn is_concurrent(&self) -> bool {
        false
    }
}

/// Errors that can occur during tool execution.
#[derive(Debug, thiserror::Error)]
pub enum ToolError {
    #[error("Execution failed: {0}")]
    ExecutionFailed(String),

    #[error("Invalid input: {0}")]
    InvalidInput(String),

    #[error("Timeout after {0:?}")]
    Timeout(Duration),

    #[error("Permission denied")]
    PermissionDenied,

    #[error(transparent)]
    Io(#[from] std::io::Error),
}
