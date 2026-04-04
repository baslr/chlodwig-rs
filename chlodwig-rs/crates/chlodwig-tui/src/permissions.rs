//! TUI permission prompter — bridges tool permission requests to the TUI.

use chlodwig_core::{PermissionDecision, PermissionPrompter};
use tokio::sync::{mpsc, oneshot};

pub(crate) struct PermissionRequest {
    pub(crate) tool_name: String,
    pub(crate) input: serde_json::Value,
    pub(crate) respond: oneshot::Sender<PermissionDecision>,
}

pub(crate) struct TuiPermissionPrompter {
    tx: mpsc::UnboundedSender<PermissionRequest>,
    always_allowed: std::sync::Mutex<std::collections::HashSet<String>>,
}

impl TuiPermissionPrompter {
    pub(crate) fn new(tx: mpsc::UnboundedSender<PermissionRequest>) -> Self {
        Self {
            tx,
            always_allowed: std::sync::Mutex::new(std::collections::HashSet::new()),
        }
    }
}

#[async_trait::async_trait]
impl PermissionPrompter for TuiPermissionPrompter {
    async fn request_permission(
        &self,
        tool_name: &str,
        input: &serde_json::Value,
    ) -> PermissionDecision {
        if self
            .always_allowed
            .lock()
            .unwrap()
            .contains(tool_name)
        {
            return PermissionDecision::Allow;
        }

        let (respond_tx, respond_rx) = oneshot::channel();
        let _ = self.tx.send(PermissionRequest {
            tool_name: tool_name.to_string(),
            input: input.clone(),
            respond: respond_tx,
        });

        match respond_rx.await {
            Ok(PermissionDecision::AllowAlways) => {
                self.always_allowed
                    .lock()
                    .unwrap()
                    .insert(tool_name.to_string());
                PermissionDecision::Allow
            }
            Ok(decision) => decision,
            Err(_) => PermissionDecision::Deny,
        }
    }
}
