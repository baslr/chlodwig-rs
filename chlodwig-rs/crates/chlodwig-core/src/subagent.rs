//! SubAgent tool — spawns an independent conversation loop as a tool call.
//!
//! The main agent can invoke one or more SubAgents in parallel. Each SubAgent
//! gets its own ConversationState, runs up to MAX_TURNS API calls, and returns
//! its final text output as a ToolResult to the calling agent.

use crate::{
    ApiClient, ContentBlock, ConversationEvent, ConversationState, Message,
    PermissionPrompter, Role, SystemBlock, Tool, ToolContext, ToolDefinition, ToolError,
    ToolOutput, ToolResultContent,
};
use std::sync::Arc;
use tokio::sync::mpsc;

/// Maximum number of API round-trips a single SubAgent may perform.
pub const SUBAGENT_MAX_TURNS: u32 = 1000;

/// Maximum output tokens for a SubAgent (full context window).
pub const SUBAGENT_MAX_TOKENS: u32 = 16_384;

/// The SubAgent tool. Constructed with shared references to the API client,
/// model name, and base tools. The SubAgent will NOT have access to itself
/// (no recursion).
pub struct SubAgentTool {
    api_client: Arc<dyn ApiClient>,
    model: String,
    /// Tools the sub-agent is allowed to use. Must NOT contain SubAgentTool.
    inner_tools: Vec<Arc<dyn Tool>>,
    /// Permission prompter shared with the main agent.
    permission: Arc<dyn PermissionPrompter>,
    /// Optional parent event_tx to forward SubAgent events to the UI.
    parent_event_tx: Option<mpsc::UnboundedSender<ConversationEvent>>,
}

impl SubAgentTool {
    pub fn new(
        api_client: Arc<dyn ApiClient>,
        model: String,
        inner_tools: Vec<Arc<dyn Tool>>,
        permission: Arc<dyn PermissionPrompter>,
    ) -> Self {
        Self {
            api_client,
            model,
            inner_tools,
            permission,
            parent_event_tx: None,
        }
    }

    /// Set a parent event channel to forward SubAgent progress events.
    pub fn with_parent_event_tx(
        mut self,
        tx: mpsc::UnboundedSender<ConversationEvent>,
    ) -> Self {
        self.parent_event_tx = Some(tx);
        self
    }
}

impl std::fmt::Debug for SubAgentTool {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("SubAgentTool")
            .field("model", &self.model)
            .field("inner_tools_count", &self.inner_tools.len())
            .finish()
    }
}

/// Wrapper to make `Arc<dyn Tool>` usable as `Box<dyn Tool>` inside ConversationState.
struct ArcToolWrapper(Arc<dyn Tool>);

#[async_trait::async_trait]
impl Tool for ArcToolWrapper {
    fn definition(&self) -> ToolDefinition {
        self.0.definition()
    }

    async fn call(
        &self,
        input: serde_json::Value,
        ctx: &ToolContext,
    ) -> Result<ToolOutput, ToolError> {
        self.0.call(input, ctx).await
    }

    fn is_concurrent(&self) -> bool {
        self.0.is_concurrent()
    }
}

#[async_trait::async_trait]
impl Tool for SubAgentTool {
    fn definition(&self) -> ToolDefinition {
        ToolDefinition {
            name: "SubAgent".into(),
            description: "Spawn an independent AI sub-agent to perform a task. The sub-agent \
                gets its own conversation context and can use tools independently. Use this \
                for research, analysis, or any task that requires many tool calls without \
                polluting the main conversation context. Multiple sub-agents can run in parallel."
                .into(),
            input_schema: serde_json::json!({
                "type": "object",
                "properties": {
                    "task": {
                        "type": "string",
                        "description": "The task for the sub-agent to perform. Be specific and detailed."
                    },
                    "system_prompt": {
                        "type": "string",
                        "description": "Optional specialized system prompt for the sub-agent. If not provided, a default research-focused prompt is used."
                    }
                },
                "required": ["task"]
            }),
        }
    }

    async fn call(
        &self,
        input: serde_json::Value,
        ctx: &ToolContext,
    ) -> Result<ToolOutput, ToolError> {
        let task = input
            .get("task")
            .and_then(|v| v.as_str())
            .ok_or_else(|| ToolError::InvalidInput("Missing 'task' field".into()))?
            .to_string();

        let system_prompt = input
            .get("system_prompt")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .unwrap_or_else(|| default_subagent_system_prompt());

        // Generate a unique ID for this sub-agent
        let agent_id = format!("subagent_{}", uuid_v4_simple());

        // Notify parent UI that a sub-agent is starting
        if let Some(ref tx) = self.parent_event_tx {
            let _ = tx.send(ConversationEvent::SubAgentStarted {
                id: agent_id.clone(),
                task: task.clone(),
            });
        }

        // Build the sub-agent's own ConversationState
        let tools: Vec<Box<dyn Tool>> = self
            .inner_tools
            .iter()
            .map(|t| Box::new(ArcToolWrapper(t.clone())) as Box<dyn Tool>)
            .collect();

        let mut state = ConversationState {
            messages: vec![Message {
                role: Role::User,
                content: vec![ContentBlock::Text { text: task.clone() }],
            }],
            model: self.model.clone(),
            system_prompt: vec![SystemBlock::text(system_prompt)],
            max_tokens: SUBAGENT_MAX_TOKENS,
            tools,
            tool_context: ctx.clone(),
            stop_requested: crate::new_stop_flag(),
        };

        // Create event channel for the sub-agent
        let (sub_tx, mut sub_rx) = mpsc::unbounded_channel::<ConversationEvent>();

        // Forward sub-agent events to parent (if connected)
        let parent_tx = self.parent_event_tx.clone();
        let agent_id_clone = agent_id.clone();
        let forward_handle = tokio::spawn(async move {
            let mut final_text = String::new();
            while let Some(event) = sub_rx.recv().await {
                match &event {
                    ConversationEvent::TextDelta(text) => {
                        if let Some(ref ptx) = parent_tx {
                            let _ = ptx.send(ConversationEvent::SubAgentProgress {
                                id: agent_id_clone.clone(),
                                text: text.clone(),
                            });
                        }
                    }
                    ConversationEvent::TextComplete(text) => {
                        final_text = text.clone();
                    }
                    ConversationEvent::ToolUseStart { name, .. } => {
                        if let Some(ref ptx) = parent_tx {
                            let _ = ptx.send(ConversationEvent::SubAgentProgress {
                                id: agent_id_clone.clone(),
                                text: format!("[Tool: {name}]"),
                            });
                        }
                    }
                    _ => {}
                }
            }
            final_text
        });

        // Run the sub-agent turn loop (up to MAX_TURNS API round-trips).
        // run_turn() loops internally until end_turn, handling multiple tool calls.
        // We call it once — it returns when the assistant is done.
        let last_error: Option<String> = match crate::run_turn(
            &mut state,
            self.api_client.as_ref(),
            self.permission.as_ref(),
            &sub_tx,
        )
        .await
        {
            Ok(()) => None,
            Err(e) => Some(e.to_string()),
        };

        // Drop the sender so the forwarder finishes
        drop(sub_tx);
        let final_text = forward_handle.await.unwrap_or_default();

        // Notify parent UI that the sub-agent completed
        if let Some(ref tx) = self.parent_event_tx {
            let _ = tx.send(ConversationEvent::SubAgentComplete {
                id: agent_id.clone(),
                result: if final_text.len() > 200 {
                    // Walk backwards from byte 200 to find a valid char boundary.
                    // Never use &str[..N] with a hardcoded byte offset — it panics
                    // when N lands inside a multi-byte UTF-8 character.
                    let mut end = 200;
                    while !final_text.is_char_boundary(end) {
                        end -= 1;
                    }
                    format!("{}...", &final_text[..end])
                } else {
                    final_text.clone()
                },
            });
        }

        // Build the result
        let result_text = if let Some(err) = last_error {
            if final_text.is_empty() {
                format!("SubAgent error: {err}")
            } else {
                format!("{final_text}\n\n[SubAgent stopped: {err}]")
            }
        } else if final_text.is_empty() {
            // Collect all assistant text from messages
            let all_text: String = state
                .messages
                .iter()
                .filter(|m| m.role == Role::Assistant)
                .map(|m| m.text())
                .collect::<Vec<_>>()
                .join("\n\n");
            if all_text.is_empty() {
                "SubAgent completed without producing output.".into()
            } else {
                all_text
            }
        } else {
            final_text
        };

        Ok(ToolOutput {
            content: ToolResultContent::Text(result_text),
            is_error: false,
        })
    }

    fn is_concurrent(&self) -> bool {
        // SubAgents CAN run concurrently — this is a key feature
        true
    }
}

fn default_subagent_system_prompt() -> String {
    "You are a focused research and analysis sub-agent. You have access to tools \
     to read files, search code, and execute commands. Complete your assigned task \
     thoroughly and return a comprehensive result. Be thorough but concise in your \
     final answer."
        .into()
}

/// Simple pseudo-UUID for sub-agent IDs (no external crate needed).
fn uuid_v4_simple() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    // Mix with a thread-local counter for uniqueness in parallel spawns
    use std::sync::atomic::{AtomicU64, Ordering};
    static COUNTER: AtomicU64 = AtomicU64::new(0);
    let count = COUNTER.fetch_add(1, Ordering::Relaxed);
    format!("{:x}_{:x}", nanos, count)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::conversation::{
        ContentBlockStartInfo, Delta, MessageDeltaInfo, MessageStartInfo, SseEvent, SseStream,
        ApiError,
    };
    use crate::AutoApprovePrompter;

    /// Mock API client that returns canned SSE event sequences.
    struct MockApiClient {
        responses: std::sync::Mutex<Vec<Vec<SseEvent>>>,
    }

    #[async_trait::async_trait]
    impl ApiClient for MockApiClient {
        async fn stream_message(
            &self,
            _request: crate::ApiRequest,
        ) -> Result<SseStream, ApiError> {
            let events = self.responses.lock().unwrap().remove(0);
            let stream = futures::stream::iter(events.into_iter().map(|e| {
                let raw = format!("{:?}", e);
                Ok((raw, e))
            }));
            Ok(Box::pin(stream))
        }
    }

    /// Simple echo tool for testing sub-agent tool execution.
    struct EchoTool;

    #[async_trait::async_trait]
    impl Tool for EchoTool {
        fn definition(&self) -> ToolDefinition {
            ToolDefinition {
                name: "Echo".into(),
                description: "Echoes input".into(),
                input_schema: serde_json::json!({
                    "type": "object",
                    "properties": {"text": {"type": "string"}},
                    "required": ["text"]
                }),
            }
        }

        async fn call(
            &self,
            input: serde_json::Value,
            _ctx: &ToolContext,
        ) -> Result<ToolOutput, ToolError> {
            let text = input["text"].as_str().unwrap_or("").to_string();
            Ok(ToolOutput {
                content: ToolResultContent::Text(format!("Echo: {text}")),
                is_error: false,
            })
        }

        fn is_concurrent(&self) -> bool {
            true
        }
    }

    fn text_response(id: &str, text: &str) -> Vec<SseEvent> {
        vec![
            SseEvent::MessageStart {
                message: MessageStartInfo {
                    id: id.into(),
                    model: "test".into(),
                    usage: None,
                },
            },
            SseEvent::ContentBlockStart {
                index: 0,
                content_block: ContentBlockStartInfo::Text { text: None },
            },
            SseEvent::ContentBlockDelta {
                index: 0,
                delta: Delta::TextDelta {
                    text: text.into(),
                },
            },
            SseEvent::ContentBlockStop { index: 0 },
            SseEvent::MessageDelta {
                delta: MessageDeltaInfo {
                    stop_reason: Some("end_turn".into()),
                },
                usage: None,
            },
            SseEvent::MessageStop,
        ]
    }

    fn tool_use_response(id: &str, tool_id: &str, tool_name: &str, json_input: &str) -> Vec<SseEvent> {
        vec![
            SseEvent::MessageStart {
                message: MessageStartInfo {
                    id: id.into(),
                    model: "test".into(),
                    usage: None,
                },
            },
            SseEvent::ContentBlockStart {
                index: 0,
                content_block: ContentBlockStartInfo::ToolUse {
                    id: tool_id.into(),
                    name: tool_name.into(),
                },
            },
            SseEvent::ContentBlockDelta {
                index: 0,
                delta: Delta::InputJsonDelta {
                    partial_json: json_input.into(),
                },
            },
            SseEvent::ContentBlockStop { index: 0 },
            SseEvent::MessageDelta {
                delta: MessageDeltaInfo {
                    stop_reason: Some("tool_use".into()),
                },
                usage: None,
            },
            SseEvent::MessageStop,
        ]
    }

    // ── TEST: SubAgent executes tools and returns final text ──────────

    #[tokio::test]
    async fn test_subagent_executes_tools_and_returns_result() {
        // SubAgent will: call Echo tool → get result → produce final text
        let mock = Arc::new(MockApiClient {
            responses: std::sync::Mutex::new(vec![
                // Turn 1: model calls Echo
                tool_use_response("msg_1", "toolu_1", "Echo", r#"{"text":"world"}"#),
                // Turn 2: model produces final answer
                text_response("msg_2", "The echo said: world"),
            ]),
        });

        let echo_tool: Arc<dyn Tool> = Arc::new(EchoTool);
        let tool = SubAgentTool::new(
            mock.clone(),
            "test-model".into(),
            vec![echo_tool],
            Arc::new(AutoApprovePrompter),
        );

        let ctx = ToolContext::default();
        let result = tool
            .call(
                serde_json::json!({"task": "Echo the word 'world' for me"}),
                &ctx,
            )
            .await
            .unwrap();

        match &result.content {
            ToolResultContent::Text(t) => {
                assert!(
                    t.contains("The echo said: world"),
                    "SubAgent should return final text, got: {t}"
                );
            }
            _ => panic!("Expected text result"),
        }
        assert!(!result.is_error);
    }

    // ── TEST: SubAgent without tools returns plain text ───────────────

    #[tokio::test]
    async fn test_subagent_text_only_no_tools() {
        let mock = Arc::new(MockApiClient {
            responses: std::sync::Mutex::new(vec![
                text_response("msg_1", "The answer is 42."),
            ]),
        });

        let tool = SubAgentTool::new(
            mock,
            "test-model".into(),
            vec![], // no tools
            Arc::new(AutoApprovePrompter),
        );

        let ctx = ToolContext::default();
        let result = tool
            .call(
                serde_json::json!({"task": "What is the meaning of life?"}),
                &ctx,
            )
            .await
            .unwrap();

        match &result.content {
            ToolResultContent::Text(t) => {
                assert!(
                    t.contains("The answer is 42"),
                    "Should return the model's text, got: {t}"
                );
            }
            _ => panic!("Expected text result"),
        }
    }

    // ── TEST: SubAgent forwards events to parent ─────────────────────

    #[tokio::test]
    async fn test_subagent_events_forwarded_to_parent() {
        let mock = Arc::new(MockApiClient {
            responses: std::sync::Mutex::new(vec![
                tool_use_response("msg_1", "toolu_1", "Echo", r#"{"text":"ping"}"#),
                text_response("msg_2", "Done with ping."),
            ]),
        });

        let (parent_tx, mut parent_rx) = mpsc::unbounded_channel::<ConversationEvent>();

        let echo_tool: Arc<dyn Tool> = Arc::new(EchoTool);
        let tool = SubAgentTool::new(
            mock,
            "test-model".into(),
            vec![echo_tool],
            Arc::new(AutoApprovePrompter),
        )
        .with_parent_event_tx(parent_tx);

        let ctx = ToolContext::default();
        let _ = tool
            .call(serde_json::json!({"task": "Ping test"}), &ctx)
            .await
            .unwrap();

        let events: Vec<_> = std::iter::from_fn(|| parent_rx.try_recv().ok()).collect();

        // Should have SubAgentStarted
        assert!(
            events.iter().any(|e| matches!(
                e,
                ConversationEvent::SubAgentStarted { task, .. } if task == "Ping test"
            )),
            "Should emit SubAgentStarted, got: {:?}",
            events
        );

        // Should have SubAgentProgress with tool name
        assert!(
            events.iter().any(|e| matches!(
                e,
                ConversationEvent::SubAgentProgress { text, .. } if text.contains("Echo")
            )),
            "Should emit SubAgentProgress for tool use, got: {:?}",
            events
        );

        // Should have SubAgentComplete
        assert!(
            events.iter().any(|e| matches!(
                e,
                ConversationEvent::SubAgentComplete { .. }
            )),
            "Should emit SubAgentComplete, got: {:?}",
            events
        );
    }

    // ── TEST: Multiple SubAgents can run in parallel ─────────────────

    #[tokio::test]
    async fn test_multiple_subagents_parallel() {
        // Two SubAgents running concurrently, each does Echo → text
        let mock1 = Arc::new(MockApiClient {
            responses: std::sync::Mutex::new(vec![
                tool_use_response("msg_a1", "toolu_a1", "Echo", r#"{"text":"alpha"}"#),
                text_response("msg_a2", "Result: alpha"),
            ]),
        });

        let mock2 = Arc::new(MockApiClient {
            responses: std::sync::Mutex::new(vec![
                tool_use_response("msg_b1", "toolu_b1", "Echo", r#"{"text":"beta"}"#),
                text_response("msg_b2", "Result: beta"),
            ]),
        });

        let echo_tool: Arc<dyn Tool> = Arc::new(EchoTool);

        let agent1 = SubAgentTool::new(
            mock1,
            "test-model".into(),
            vec![echo_tool.clone()],
            Arc::new(AutoApprovePrompter),
        );
        let agent2 = SubAgentTool::new(
            mock2,
            "test-model".into(),
            vec![echo_tool],
            Arc::new(AutoApprovePrompter),
        );

        let ctx = ToolContext::default();

        // Run both in parallel
        let (r1, r2) = tokio::join!(
            agent1.call(serde_json::json!({"task": "Echo alpha"}), &ctx),
            agent2.call(serde_json::json!({"task": "Echo beta"}), &ctx),
        );

        let r1 = r1.unwrap();
        let r2 = r2.unwrap();

        match (&r1.content, &r2.content) {
            (ToolResultContent::Text(t1), ToolResultContent::Text(t2)) => {
                assert!(t1.contains("alpha"), "Agent 1 result: {t1}");
                assert!(t2.contains("beta"), "Agent 2 result: {t2}");
            }
            _ => panic!("Expected text results"),
        }
    }

    // ── TEST: SubAgent has no access to SubAgent tool (no recursion) ─

    #[tokio::test]
    async fn test_subagent_no_recursion() {
        // The inner_tools should NOT contain SubAgentTool itself.
        // We verify by checking tool definitions available to the sub-agent.
        let mock = Arc::new(MockApiClient {
            responses: std::sync::Mutex::new(vec![
                text_response("msg_1", "I only have Echo."),
            ]),
        });

        let echo_tool: Arc<dyn Tool> = Arc::new(EchoTool);
        let tool = SubAgentTool::new(
            mock,
            "test-model".into(),
            vec![echo_tool],
            Arc::new(AutoApprovePrompter),
        );

        // Verify: the tool's definition name is "SubAgent"
        assert_eq!(tool.definition().name, "SubAgent");

        // Verify: is_concurrent is true (so multiple can run in parallel)
        assert!(tool.is_concurrent());

        // Verify: inner_tools don't contain "SubAgent"
        let inner_names: Vec<_> = tool.inner_tools.iter().map(|t| t.definition().name).collect();
        assert!(
            !inner_names.contains(&"SubAgent".to_string()),
            "SubAgent must not have access to itself: {:?}",
            inner_names
        );
    }

    // ── TEST: SubAgent with custom system prompt ─────────────────────

    #[tokio::test]
    async fn test_subagent_custom_system_prompt() {
        // We can't directly observe the system prompt in the mock, but we verify
        // the call succeeds with a custom prompt provided.
        let mock = Arc::new(MockApiClient {
            responses: std::sync::Mutex::new(vec![
                text_response("msg_1", "Custom prompt works."),
            ]),
        });

        let tool = SubAgentTool::new(
            mock,
            "test-model".into(),
            vec![],
            Arc::new(AutoApprovePrompter),
        );

        let ctx = ToolContext::default();
        let result = tool
            .call(
                serde_json::json!({
                    "task": "Test with custom prompt",
                    "system_prompt": "You are a specialized code reviewer."
                }),
                &ctx,
            )
            .await
            .unwrap();

        match &result.content {
            ToolResultContent::Text(t) => {
                assert!(t.contains("Custom prompt works"), "Got: {t}");
            }
            _ => panic!("Expected text result"),
        }
    }

    // ── TEST: SubAgent missing task field returns error ───────────────

    #[tokio::test]
    async fn test_subagent_missing_task_returns_error() {
        let mock = Arc::new(MockApiClient {
            responses: std::sync::Mutex::new(vec![]),
        });

        let tool = SubAgentTool::new(
            mock,
            "test-model".into(),
            vec![],
            Arc::new(AutoApprovePrompter),
        );

        let ctx = ToolContext::default();
        let result = tool
            .call(serde_json::json!({"not_task": "oops"}), &ctx)
            .await;

        assert!(
            matches!(result, Err(ToolError::InvalidInput(_))),
            "Should return InvalidInput error, got: {:?}",
            result
        );
    }

    // ── TEST: SubAgent API error is handled gracefully ───────────────

    #[tokio::test]
    async fn test_subagent_api_error_handled() {
        struct FailingApiClient;

        #[async_trait::async_trait]
        impl ApiClient for FailingApiClient {
            async fn stream_message(
                &self,
                _request: crate::ApiRequest,
            ) -> Result<SseStream, ApiError> {
                Err(ApiError::Connection("test connection error".into()))
            }
        }

        let tool = SubAgentTool::new(
            Arc::new(FailingApiClient),
            "test-model".into(),
            vec![],
            Arc::new(AutoApprovePrompter),
        );

        let ctx = ToolContext::default();
        let result = tool
            .call(serde_json::json!({"task": "This will fail"}), &ctx)
            .await
            .unwrap(); // Should NOT panic — error is in the result text

        match &result.content {
            ToolResultContent::Text(t) => {
                assert!(
                    t.contains("error") || t.contains("Error"),
                    "Should contain error info, got: {t}"
                );
            }
            _ => panic!("Expected text result"),
        }
    }

    // ── TEST: SubAgent multi-turn tool loop ──────────────────────────

    #[tokio::test]
    async fn test_subagent_multi_turn_tool_loop() {
        // SubAgent does 3 tool calls before final answer
        let mock = Arc::new(MockApiClient {
            responses: std::sync::Mutex::new(vec![
                tool_use_response("msg_1", "t1", "Echo", r#"{"text":"step1"}"#),
                tool_use_response("msg_2", "t2", "Echo", r#"{"text":"step2"}"#),
                tool_use_response("msg_3", "t3", "Echo", r#"{"text":"step3"}"#),
                text_response("msg_4", "All 3 steps complete."),
            ]),
        });

        let echo_tool: Arc<dyn Tool> = Arc::new(EchoTool);
        let tool = SubAgentTool::new(
            mock,
            "test-model".into(),
            vec![echo_tool],
            Arc::new(AutoApprovePrompter),
        );

        let ctx = ToolContext::default();
        let result = tool
            .call(serde_json::json!({"task": "Do 3 echoes"}), &ctx)
            .await
            .unwrap();

        match &result.content {
            ToolResultContent::Text(t) => {
                assert!(
                    t.contains("All 3 steps complete"),
                    "Should complete multi-turn loop, got: {t}"
                );
            }
            _ => panic!("Expected text result"),
        }
    }

    // ── TEST: UTF-8 multi-byte chars in long output don't panic ─────
    // Regression: &final_text[..200] panics when byte 200 is inside
    // a multi-byte char (emoji = 4 bytes, CJK = 3, umlaut = 2).

    #[tokio::test]
    async fn test_subagent_preview_truncation_utf8_no_panic() {
        // Build a string where byte 200 lands inside a multi-byte char.
        // "ä" is 2 bytes (0xC3 0xA4). 99 × "ä" = 198 bytes, + "a" = 199 bytes.
        // The next "ä" spans bytes 199..201 — so byte 200 is mid-char.
        // This is exactly what triggers the panic in &final_text[..200].
        let long_text = "ä".repeat(99).to_string() + "a" + &"ä".repeat(60); // 199 + 120 = 319 bytes

        let mock = Arc::new(MockApiClient {
            responses: std::sync::Mutex::new(vec![
                text_response("msg_1", &long_text),
            ]),
        });

        let (parent_tx, mut parent_rx) = mpsc::unbounded_channel::<ConversationEvent>();

        let tool = SubAgentTool::new(
            mock,
            "test-model".into(),
            vec![],
            Arc::new(AutoApprovePrompter),
        )
        .with_parent_event_tx(parent_tx);

        let ctx = ToolContext::default();
        // This must NOT panic
        let result = tool
            .call(serde_json::json!({"task": "Give me umlauts"}), &ctx)
            .await
            .unwrap();

        // Verify the full result is intact (not truncated)
        match &result.content {
            ToolResultContent::Text(t) => {
                assert!(t.contains("ä"), "Result should contain umlauts, got: {t}");
            }
            _ => panic!("Expected text result"),
        }

        // Verify the SubAgentComplete preview was truncated safely
        let events: Vec<_> = std::iter::from_fn(|| parent_rx.try_recv().ok()).collect();
        let complete_event = events.iter().find(|e| matches!(e, ConversationEvent::SubAgentComplete { .. }));
        assert!(complete_event.is_some(), "Should have SubAgentComplete event");
        if let ConversationEvent::SubAgentComplete { result, .. } = complete_event.unwrap() {
            assert!(result.ends_with("..."), "Truncated preview should end with '...', got: {result}");
            // Verify it's valid UTF-8 (implicitly: it's a String, so it is)
            assert!(result.len() <= 210, "Preview should be roughly 200 bytes + '...', got {} bytes", result.len());
        }
    }

    #[tokio::test]
    async fn test_subagent_preview_truncation_emoji_boundary() {
        // "🦀" is 4 bytes (F0 9F A6 80). 49 × "🦀" = 196 bytes.
        // + "abcd" = 200 bytes exactly (boundary). + "🦀" starts at 200 — byte 201 is mid-emoji.
        // But we need byte 200 mid-char: 49 × "🦀" + "abc" = 199 bytes, next "🦀" spans 199..203.
        let long_text = "🦀".repeat(49).to_string() + "abc" + &"🦀".repeat(20); // 199 + 80 = 279 bytes

        let mock = Arc::new(MockApiClient {
            responses: std::sync::Mutex::new(vec![
                text_response("msg_1", &long_text),
            ]),
        });

        let (parent_tx, mut parent_rx) = mpsc::unbounded_channel::<ConversationEvent>();

        let tool = SubAgentTool::new(
            mock,
            "test-model".into(),
            vec![],
            Arc::new(AutoApprovePrompter),
        )
        .with_parent_event_tx(parent_tx);

        let ctx = ToolContext::default();
        // This must NOT panic
        let result = tool
            .call(serde_json::json!({"task": "Give me crabs"}), &ctx)
            .await
            .unwrap();

        assert!(!result.is_error);

        let events: Vec<_> = std::iter::from_fn(|| parent_rx.try_recv().ok()).collect();
        let complete_event = events.iter().find(|e| matches!(e, ConversationEvent::SubAgentComplete { .. }));
        assert!(complete_event.is_some(), "Should have SubAgentComplete event");
        if let ConversationEvent::SubAgentComplete { result, .. } = complete_event.unwrap() {
            assert!(result.ends_with("..."), "Should be truncated with '...'");
        }
    }
}