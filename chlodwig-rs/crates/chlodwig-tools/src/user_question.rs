//! UserQuestion tool — allows the LLM to ask the user a question.
//!
//! The model calls this tool with a `question` string and optional `options`
//! (list of choices). The TUI displays a dialog; the user can either pick
//! an option or type free-form text. The answer is returned as the tool result.
//!
//! Architecture: The tool holds an `mpsc::UnboundedSender<UserQuestionRequest>`.
//! When `call()` is invoked it sends the question to the TUI and `await`s
//! the answer on a oneshot channel — exactly like `TuiPermissionPrompter`.

use async_trait::async_trait;
use chlodwig_core::{Tool, ToolContext, ToolDefinition, ToolError, ToolOutput, ToolResultContent};
use serde::Deserialize;
use tokio::sync::{mpsc, oneshot};

/// A pending question sent from the tool to the TUI.
#[derive(Debug)]
pub struct UserQuestionRequest {
    pub question: String,
    pub options: Vec<String>,
    pub respond: oneshot::Sender<String>,
}

#[derive(Deserialize)]
struct UserQuestionInput {
    question: String,
    #[serde(default)]
    options: Vec<String>,
}

pub struct UserQuestionTool {
    tx: mpsc::UnboundedSender<UserQuestionRequest>,
}

impl UserQuestionTool {
    pub fn new(tx: mpsc::UnboundedSender<UserQuestionRequest>) -> Self {
        Self { tx }
    }
}

#[async_trait]
impl Tool for UserQuestionTool {
    fn definition(&self) -> ToolDefinition {
        ToolDefinition {
            name: "UserQuestion".into(),
            description: concat!(
                "Ask the user a question and wait for their answer. ",
                "Use this when you need clarification, want to confirm an approach, ",
                "or need the user to choose between options. ",
                "You can provide optional choices for the user to pick from, ",
                "but they can always type a free-form answer instead."
            )
            .into(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "question": {
                        "type": "string",
                        "description": "The question to ask the user"
                    },
                    "options": {
                        "type": "array",
                        "items": { "type": "string" },
                        "description": "Optional list of choices for the user to pick from"
                    }
                },
                "required": ["question"]
            }),
        }
    }

    async fn call(
        &self,
        input: serde_json::Value,
        _ctx: &ToolContext,
    ) -> Result<ToolOutput, ToolError> {
        let input: UserQuestionInput =
            serde_json::from_value(input).map_err(|e| ToolError::InvalidInput(e.to_string()))?;

        let (respond_tx, respond_rx) = oneshot::channel();

        self.tx
            .send(UserQuestionRequest {
                question: input.question,
                options: input.options,
                respond: respond_tx,
            })
            .map_err(|_| ToolError::ExecutionFailed("UI channel closed".into()))?;

        let answer = respond_rx
            .await
            .map_err(|_| ToolError::ExecutionFailed("User question was cancelled".into()))?;

        Ok(ToolOutput {
            content: ToolResultContent::Text(answer),
            is_error: false,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chlodwig_core::ToolContext;

    #[test]
    fn test_definition_name_is_user_question() {
        let (tx, _rx) = mpsc::unbounded_channel();
        let tool = UserQuestionTool::new(tx);
        assert_eq!(tool.definition().name, "UserQuestion");
    }

    #[test]
    fn test_definition_has_question_in_required() {
        let (tx, _rx) = mpsc::unbounded_channel();
        let tool = UserQuestionTool::new(tx);
        let schema = tool.definition().input_schema;
        let required = schema["required"].as_array().unwrap();
        assert!(required.iter().any(|v| v.as_str() == Some("question")));
    }

    #[test]
    fn test_definition_options_is_optional() {
        let (tx, _rx) = mpsc::unbounded_channel();
        let tool = UserQuestionTool::new(tx);
        let schema = tool.definition().input_schema;
        let required = schema["required"].as_array().unwrap();
        // options must NOT be in required
        assert!(!required.iter().any(|v| v.as_str() == Some("options")));
    }

    #[tokio::test]
    async fn test_call_sends_question_and_returns_answer() {
        let (tx, mut rx) = mpsc::unbounded_channel();
        let tool = UserQuestionTool::new(tx);

        let input = serde_json::json!({
            "question": "Which approach do you prefer?",
            "options": ["A", "B", "C"]
        });

        let handle = tokio::spawn(async move {
            tool.call(input, &ToolContext::default()).await
        });

        // Simulate user answering
        let req = rx.recv().await.unwrap();
        assert_eq!(req.question, "Which approach do you prefer?");
        assert_eq!(req.options, vec!["A", "B", "C"]);
        req.respond.send("B".to_string()).unwrap();

        let result = handle.await.unwrap().unwrap();
        assert!(!result.is_error);
        match result.content {
            ToolResultContent::Text(text) => assert_eq!(text, "B"),
            _ => panic!("Expected text content"),
        }
    }

    #[tokio::test]
    async fn test_call_with_no_options() {
        let (tx, mut rx) = mpsc::unbounded_channel();
        let tool = UserQuestionTool::new(tx);

        let input = serde_json::json!({
            "question": "What should the filename be?"
        });

        let handle = tokio::spawn(async move {
            tool.call(input, &ToolContext::default()).await
        });

        let req = rx.recv().await.unwrap();
        assert_eq!(req.question, "What should the filename be?");
        assert!(req.options.is_empty());
        req.respond.send("output.txt".to_string()).unwrap();

        let result = handle.await.unwrap().unwrap();
        match result.content {
            ToolResultContent::Text(text) => assert_eq!(text, "output.txt"),
            _ => panic!("Expected text content"),
        }
    }

    #[tokio::test]
    async fn test_call_freetext_answer_with_options() {
        // User ignores the options and types free text
        let (tx, mut rx) = mpsc::unbounded_channel();
        let tool = UserQuestionTool::new(tx);

        let input = serde_json::json!({
            "question": "Pick a color",
            "options": ["Red", "Blue"]
        });

        let handle = tokio::spawn(async move {
            tool.call(input, &ToolContext::default()).await
        });

        let req = rx.recv().await.unwrap();
        req.respond.send("Actually, I want green".to_string()).unwrap();

        let result = handle.await.unwrap().unwrap();
        match result.content {
            ToolResultContent::Text(text) => assert_eq!(text, "Actually, I want green"),
            _ => panic!("Expected text content"),
        }
    }

    #[tokio::test]
    async fn test_call_fails_when_channel_dropped() {
        let (tx, mut rx) = mpsc::unbounded_channel();
        let tool = UserQuestionTool::new(tx);

        let input = serde_json::json!({
            "question": "Test?"
        });

        let handle = tokio::spawn(async move {
            tool.call(input, &ToolContext::default()).await
        });

        // Receive the request but drop the respond channel
        let req = rx.recv().await.unwrap();
        drop(req.respond);

        let result = handle.await.unwrap();
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_call_fails_when_ui_channel_closed() {
        let (tx, rx) = mpsc::unbounded_channel::<UserQuestionRequest>();
        let tool = UserQuestionTool::new(tx);

        // Close the receiver before calling
        drop(rx);

        let input = serde_json::json!({
            "question": "Test?"
        });

        let result = tool.call(input, &ToolContext::default()).await;
        assert!(result.is_err());
    }

    #[test]
    fn test_invalid_input_missing_question() {
        let (tx, _rx) = mpsc::unbounded_channel();
        let tool = UserQuestionTool::new(tx);

        let input = serde_json::json!({
            "options": ["A", "B"]
        });

        let rt = tokio::runtime::Runtime::new().unwrap();
        let result = rt.block_on(tool.call(input, &ToolContext::default()));
        assert!(result.is_err());
        match result.unwrap_err() {
            ToolError::InvalidInput(_) => {}
            other => panic!("Expected InvalidInput, got: {other:?}"),
        }
    }

    #[tokio::test]
    async fn test_call_with_utf8_question_and_answer() {
        let (tx, mut rx) = mpsc::unbounded_channel();
        let tool = UserQuestionTool::new(tx);

        let input = serde_json::json!({
            "question": "Wie heißt die Datei? 📁",
            "options": ["Ärger.txt", "Übung.rs", "日本語.md"]
        });

        let handle = tokio::spawn(async move {
            tool.call(input, &ToolContext::default()).await
        });

        let req = rx.recv().await.unwrap();
        assert_eq!(req.question, "Wie heißt die Datei? 📁");
        assert_eq!(req.options.len(), 3);
        req.respond.send("Übung.rs".to_string()).unwrap();

        let result = handle.await.unwrap().unwrap();
        match result.content {
            ToolResultContent::Text(text) => assert_eq!(text, "Übung.rs"),
            _ => panic!("Expected text content"),
        }
    }

    #[tokio::test]
    async fn test_call_with_empty_answer() {
        let (tx, mut rx) = mpsc::unbounded_channel();
        let tool = UserQuestionTool::new(tx);

        let input = serde_json::json!({
            "question": "Any comments?"
        });

        let handle = tokio::spawn(async move {
            tool.call(input, &ToolContext::default()).await
        });

        let req = rx.recv().await.unwrap();
        req.respond.send(String::new()).unwrap();

        let result = handle.await.unwrap().unwrap();
        match result.content {
            ToolResultContent::Text(text) => assert_eq!(text, ""),
            _ => panic!("Expected text content"),
        }
    }
}
