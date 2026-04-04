//! Message types matching the Anthropic Messages API.

use serde::{Deserialize, Serialize};

/// Conversation role.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Role {
    User,
    Assistant,
}

/// A single message in the conversation history.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub role: Role,
    pub content: Vec<ContentBlock>,
}

/// A content block within a message.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ContentBlock {
    Text {
        text: String,
    },
    #[serde(rename = "tool_use")]
    ToolUse {
        id: String,
        name: String,
        input: serde_json::Value,
    },
    #[serde(rename = "tool_result")]
    ToolResult {
        tool_use_id: String,
        content: ToolResultContent,
        #[serde(skip_serializing_if = "Option::is_none")]
        is_error: Option<bool>,
    },
    Thinking {
        thinking: String,
    },
    Image {
        source: ImageSource,
    },
}

/// Content of a tool result — either plain text or structured blocks.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum ToolResultContent {
    Text(String),
    Blocks(Vec<ToolResultBlock>),
}

/// A block within a tool result.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ToolResultBlock {
    Text { text: String },
    Image { source: ImageSource },
}

/// Image source for base64-encoded images.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageSource {
    #[serde(rename = "type")]
    pub source_type: String,
    pub media_type: String,
    pub data: String,
}

/// A block within the system prompt. Supports prompt caching.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemBlock {
    #[serde(rename = "type")]
    pub block_type: String,
    pub text: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cache_control: Option<CacheControl>,
}

/// Cache control directive for prompt caching.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheControl {
    #[serde(rename = "type")]
    pub control_type: String,
}

impl SystemBlock {
    /// Create a plain text system block (no caching).
    pub fn text(s: impl Into<String>) -> Self {
        Self {
            block_type: "text".into(),
            text: s.into(),
            cache_control: None,
        }
    }

    /// Create a cached text system block (ephemeral caching).
    pub fn cached(s: impl Into<String>) -> Self {
        Self {
            block_type: "text".into(),
            text: s.into(),
            cache_control: Some(CacheControl {
                control_type: "ephemeral".into(),
            }),
        }
    }
}

/// Extract plain text from a message's content blocks.
impl Message {
    pub fn text(&self) -> String {
        self.content
            .iter()
            .filter_map(|block| match block {
                ContentBlock::Text { text } => Some(text.as_str()),
                _ => None,
            })
            .collect::<Vec<_>>()
            .join("")
    }

    /// Collect all tool_use blocks from an assistant message.
    pub fn tool_uses(&self) -> Vec<(&str, &str, &serde_json::Value)> {
        self.content
            .iter()
            .filter_map(|block| match block {
                ContentBlock::ToolUse { id, name, input } => {
                    Some((id.as_str(), name.as_str(), input))
                }
                _ => None,
            })
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use pretty_assertions::assert_eq;

    #[test]
    fn test_text_message_roundtrip() {
        let msg = Message {
            role: Role::User,
            content: vec![ContentBlock::Text {
                text: "Hello, Claude!".into(),
            }],
        };
        let json = serde_json::to_string(&msg).unwrap();
        let parsed: Message = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed.role, Role::User);
        assert_eq!(parsed.text(), "Hello, Claude!");
    }

    #[test]
    fn test_assistant_with_tool_use_roundtrip() {
        let msg = Message {
            role: Role::Assistant,
            content: vec![
                ContentBlock::Text {
                    text: "Let me check.".into(),
                },
                ContentBlock::ToolUse {
                    id: "toolu_01".into(),
                    name: "Bash".into(),
                    input: serde_json::json!({"command": "ls -la"}),
                },
            ],
        };
        let json = serde_json::to_string(&msg).unwrap();
        let parsed: Message = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed.role, Role::Assistant);
        assert_eq!(parsed.text(), "Let me check.");
        let uses = parsed.tool_uses();
        assert_eq!(uses.len(), 1);
        assert_eq!(uses[0].0, "toolu_01");
        assert_eq!(uses[0].1, "Bash");
    }

    #[test]
    fn test_tool_result_text_roundtrip() {
        let msg = Message {
            role: Role::User,
            content: vec![ContentBlock::ToolResult {
                tool_use_id: "toolu_01".into(),
                content: ToolResultContent::Text("file1.rs\nfile2.rs".into()),
                is_error: None,
            }],
        };
        let json = serde_json::to_string(&msg).unwrap();
        let parsed: Message = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed.role, Role::User);

        // Verify is_error is not present in JSON when None
        let value: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert!(value["content"][0].get("is_error").is_none());
    }

    #[test]
    fn test_tool_result_blocks_roundtrip() {
        let msg = Message {
            role: Role::User,
            content: vec![ContentBlock::ToolResult {
                tool_use_id: "toolu_02".into(),
                content: ToolResultContent::Blocks(vec![
                    ToolResultBlock::Text {
                        text: "some output".into(),
                    },
                    ToolResultBlock::Image {
                        source: ImageSource {
                            source_type: "base64".into(),
                            media_type: "image/png".into(),
                            data: "iVBOR...".into(),
                        },
                    },
                ]),
                is_error: Some(false),
            }],
        };
        let json = serde_json::to_string(&msg).unwrap();
        let parsed: Message = serde_json::from_str(&json).unwrap();
        match &parsed.content[0] {
            ContentBlock::ToolResult {
                content, is_error, ..
            } => {
                assert_eq!(*is_error, Some(false));
                match content {
                    ToolResultContent::Blocks(blocks) => assert_eq!(blocks.len(), 2),
                    _ => panic!("Expected Blocks variant"),
                }
            }
            _ => panic!("Expected ToolResult"),
        }
    }

    #[test]
    fn test_thinking_block_roundtrip() {
        let msg = Message {
            role: Role::Assistant,
            content: vec![ContentBlock::Thinking {
                thinking: "Let me think about this...".into(),
            }],
        };
        let json = serde_json::to_string(&msg).unwrap();
        assert!(json.contains("\"type\":\"thinking\""));
        let parsed: Message = serde_json::from_str(&json).unwrap();
        match &parsed.content[0] {
            ContentBlock::Thinking { thinking } => {
                assert_eq!(thinking, "Let me think about this...");
            }
            _ => panic!("Expected Thinking"),
        }
    }

    #[test]
    fn test_deserialize_api_response() {
        // Simulate what the API actually sends back
        let api_json = r#"{
            "role": "assistant",
            "content": [
                {"type": "text", "text": "Here's the result:"},
                {"type": "tool_use", "id": "toolu_abc", "name": "Read", "input": {"file_path": "/tmp/test.txt"}}
            ]
        }"#;
        let msg: Message = serde_json::from_str(api_json).unwrap();
        assert_eq!(msg.role, Role::Assistant);
        assert_eq!(msg.content.len(), 2);
        assert_eq!(msg.text(), "Here's the result:");
        assert_eq!(msg.tool_uses().len(), 1);
    }

    #[test]
    fn test_system_block_serialize_with_cache() {
        let block = SystemBlock::cached("You are Claude.");
        let json = serde_json::to_value(&block).unwrap();
        assert_eq!(json["type"], "text");
        assert_eq!(json["text"], "You are Claude.");
        assert_eq!(json["cache_control"]["type"], "ephemeral");
    }

    #[test]
    fn test_system_block_serialize_without_cache() {
        let block = SystemBlock::text("Git branch: main");
        let json = serde_json::to_value(&block).unwrap();
        assert_eq!(json["type"], "text");
        assert_eq!(json["text"], "Git branch: main");
        // cache_control must NOT be present
        assert!(json.get("cache_control").is_none(), "cache_control should be absent");
    }

    #[test]
    fn test_system_blocks_as_array() {
        let blocks = vec![
            SystemBlock::cached("System prompt"),
            SystemBlock::text("Dynamic context"),
        ];
        let json = serde_json::to_value(&blocks).unwrap();
        assert!(json.is_array());
        assert_eq!(json.as_array().unwrap().len(), 2);
        assert!(json[0].get("cache_control").is_some());
        assert!(json[1].get("cache_control").is_none());
    }
}
