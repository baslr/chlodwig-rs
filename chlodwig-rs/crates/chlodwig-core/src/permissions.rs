//! Permission system for tool execution.

use async_trait::async_trait;

/// Decision from the permission system.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PermissionDecision {
    /// Allow this one invocation.
    Allow,
    /// Deny this invocation.
    Deny,
    /// Allow all future invocations of this tool for the session.
    AllowAlways,
}

/// Abstraction for asking the user (or policy) whether a tool call is permitted.
/// The conversation loop calls this before executing any tool.
#[async_trait]
pub trait PermissionPrompter: Send + Sync {
    async fn request_permission(
        &self,
        tool_name: &str,
        input: &serde_json::Value,
    ) -> PermissionDecision;
}

/// A prompter that auto-approves everything (for --dangerously-skip-permissions).
pub struct AutoApprovePrompter;

#[async_trait]
impl PermissionPrompter for AutoApprovePrompter {
    async fn request_permission(
        &self,
        _tool_name: &str,
        _input: &serde_json::Value,
    ) -> PermissionDecision {
        PermissionDecision::Allow
    }
}
