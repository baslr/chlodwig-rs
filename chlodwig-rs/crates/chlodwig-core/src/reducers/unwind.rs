//! `/unwind [N]` — roll back the last N text-bearing messages.
//!
//! Semantics (decided 2026-04-21):
//! - A "text block" = one [`Message`] containing at least one
//!   [`ContentBlock::Text`]. Both User-prompt messages and Assistant-response
//!   messages count.
//! - Pure tool messages (User-message containing only `tool_result` blocks,
//!   or Assistant-message containing only `tool_use` blocks) do NOT count
//!   toward N — but they ARE removed when peeling from the end.
//! - After peeling, the trailing tail must remain API-valid: every
//!   `tool_use` block in an assistant message must be followed by a user
//!   message containing the matching `tool_result` block. If peeling
//!   leaves an orphan assistant `tool_use` at the tail, that message is
//!   removed too (cleanup beyond the requested count, NOT counted).
//!
//! The function is **pure** and operates only on `Vec<Message>` — no I/O,
//! no UI state. It returns the number of text-bearing messages that were
//! actually removed (may be less than `count` if the history is shorter).

use crate::messages::{ContentBlock, Message, Role};

/// Returns `true` if the message contains at least one `Text` content block.
fn message_has_text(msg: &Message) -> bool {
    msg.content
        .iter()
        .any(|b| matches!(b, ContentBlock::Text { .. }))
}

/// Returns `true` if the message contains at least one `ToolUse` content block.
fn message_has_tool_use(msg: &Message) -> bool {
    msg.content
        .iter()
        .any(|b| matches!(b, ContentBlock::ToolUse { .. }))
}

/// Roll back the last `count` text-bearing messages from `messages`.
///
/// Returns the number of text messages actually removed.
///
/// See module docs for the full semantics.
pub fn unwind_messages(messages: &mut Vec<Message>, count: usize) -> usize {
    if count == 0 {
        return 0;
    }
    let mut removed_text = 0;
    while removed_text < count {
        let Some(last) = messages.pop() else {
            break;
        };
        if message_has_text(&last) {
            removed_text += 1;
        }
    }
    // Cleanup: trailing assistant `tool_use` without matching user
    // `tool_result` is invalid for the next API call. Strip such orphans.
    while let Some(last) = messages.last() {
        if last.role == Role::Assistant && message_has_tool_use(last) {
            messages.pop();
        } else {
            break;
        }
    }
    removed_text
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::messages::{ContentBlock, Message, Role, ToolResultContent};
    use serde_json::json;

    fn user_text(t: &str) -> Message {
        Message {
            role: Role::User,
            content: vec![ContentBlock::Text { text: t.into() }],
        }
    }
    fn assistant_text(t: &str) -> Message {
        Message {
            role: Role::Assistant,
            content: vec![ContentBlock::Text { text: t.into() }],
        }
    }
    fn assistant_text_and_tool(text: &str, tool_id: &str, tool_name: &str) -> Message {
        Message {
            role: Role::Assistant,
            content: vec![
                ContentBlock::Text { text: text.into() },
                ContentBlock::ToolUse {
                    id: tool_id.into(),
                    name: tool_name.into(),
                    input: json!({}),
                },
            ],
        }
    }
    fn assistant_tool_only(tool_id: &str, tool_name: &str) -> Message {
        Message {
            role: Role::Assistant,
            content: vec![ContentBlock::ToolUse {
                id: tool_id.into(),
                name: tool_name.into(),
                input: json!({}),
            }],
        }
    }
    fn user_tool_result(tool_id: &str, output: &str) -> Message {
        Message {
            role: Role::User,
            content: vec![ContentBlock::ToolResult {
                tool_use_id: tool_id.into(),
                content: ToolResultContent::Text(output.into()),
                is_error: None,
            }],
        }
    }

    #[test]
    fn test_unwind_zero_is_noop() {
        let mut msgs = vec![user_text("a"), assistant_text("b")];
        let removed = unwind_messages(&mut msgs, 0);
        assert_eq!(removed, 0);
        assert_eq!(msgs.len(), 2);
    }

    #[test]
    fn test_unwind_empty_returns_zero() {
        let mut msgs: Vec<Message> = vec![];
        let removed = unwind_messages(&mut msgs, 3);
        assert_eq!(removed, 0);
        assert!(msgs.is_empty());
    }

    #[test]
    fn test_unwind_one_text_message() {
        // Plain U/A pair, /unwind 1 removes the assistant reply only.
        let mut msgs = vec![user_text("hello"), assistant_text("hi back")];
        let removed = unwind_messages(&mut msgs, 1);
        assert_eq!(removed, 1);
        assert_eq!(msgs.len(), 1);
        assert_eq!(msgs[0].role, Role::User);
    }

    #[test]
    fn test_unwind_two_text_messages() {
        // Removes assistant reply + user prompt.
        let mut msgs = vec![user_text("hello"), assistant_text("hi back")];
        let removed = unwind_messages(&mut msgs, 2);
        assert_eq!(removed, 2);
        assert!(msgs.is_empty());
    }

    #[test]
    fn test_unwind_more_than_available() {
        let mut msgs = vec![user_text("hello"), assistant_text("hi")];
        let removed = unwind_messages(&mut msgs, 99);
        assert_eq!(removed, 2);
        assert!(msgs.is_empty());
    }

    #[test]
    fn test_unwind_skips_pure_tool_result_messages_in_count() {
        // U-prompt, A-text+tool, U-tool_result, A-final-text
        // /unwind 1 → remove A-final-text only (1 text). The remaining
        // tail [U, A-text+tool, U-tool_result] is still API-valid.
        let mut msgs = vec![
            user_text("question"),
            assistant_text_and_tool("calling tool…", "t1", "Bash"),
            user_tool_result("t1", "output"),
            assistant_text("final answer"),
        ];
        let removed = unwind_messages(&mut msgs, 1);
        assert_eq!(removed, 1);
        assert_eq!(msgs.len(), 3);
        // Last is now the tool_result, which is valid as it pairs with the
        // assistant tool_use right before it.
        assert!(matches!(
            &msgs[2].content[0],
            ContentBlock::ToolResult { .. }
        ));
    }

    #[test]
    fn test_unwind_drops_paired_tool_messages_when_assistant_text_is_removed() {
        // /unwind 2 → remove A-final-text (count=1), then U-tool_result
        // (no count, but its assistant tool_use becomes orphaned), then
        // A-text+tool counts as text (count=2). The user prompt stays.
        // With cleanup, no orphan tool_use at the tail.
        let mut msgs = vec![
            user_text("question"),
            assistant_text_and_tool("calling tool…", "t1", "Bash"),
            user_tool_result("t1", "output"),
            assistant_text("final answer"),
        ];
        let removed = unwind_messages(&mut msgs, 2);
        assert_eq!(removed, 2);
        assert_eq!(msgs.len(), 1);
        assert_eq!(msgs[0].role, Role::User);
        assert!(matches!(&msgs[0].content[0], ContentBlock::Text { .. }));
    }

    #[test]
    fn test_unwind_cleans_up_orphan_assistant_tool_use_at_tail() {
        // Test the cleanup pass in isolation: build a history that, after
        // peeling the requested count of text-bearing messages, leaves an
        // orphan assistant `tool_use` at the tail. The cleanup must
        // remove it so the next API call doesn't 400.
        //
        // Build: U-prompt, A-tool_only("t1"), U-tool_result("t1"), A-final-text
        // /unwind 1 → peel A-final-text (count=1, text++=1) → tail is
        // [U, A-tool_only, U-tool_result] → still valid (last is the
        // matching tool_result) → no cleanup.
        let mut msgs = vec![
            user_text("question"),
            assistant_tool_only("t1", "Bash"),
            user_tool_result("t1", "output"),
            assistant_text("final answer"),
        ];
        let removed = unwind_messages(&mut msgs, 1);
        assert_eq!(removed, 1);
        assert_eq!(msgs.len(), 3);
        assert!(matches!(&msgs[2].content[0], ContentBlock::ToolResult { .. }));
    }

    #[test]
    fn test_unwind_cleanup_strips_orphan_tool_use_after_user_unwind() {
        // Build: U-prompt, A-tool_only("t1") → invalid history per se,
        // but constructable. /unwind 1 has no text to remove, but the
        // cleanup pass must still strip the orphan A-tool_only because
        // there's no matching U-tool_result after it.
        let mut msgs = vec![
            user_text("question"),
            assistant_tool_only("t1", "Bash"),
        ];
        let removed = unwind_messages(&mut msgs, 1);
        // No text-bearing message at the tail, so removed == 0.
        // But the orphan tool_use must still be cleaned up.
        // Actually: pop A-tool_only (no text) → continue → pop U-prompt (text++=1)
        // → done with count. No orphan left. removed=1, msgs empty.
        assert_eq!(removed, 1);
        assert!(msgs.is_empty());
    }

    #[test]
    fn test_unwind_cleanup_removes_orphan_after_target_reached() {
        // Build a case where after reaching the unwind count the tail
        // ends in a bare assistant tool_use that needs cleanup.
        //
        // History:
        //   [0] U-prompt1
        //   [1] A-tool_only("t1")            (no text)
        //   [2] U-tool_result("t1")          (no text)
        //   [3] A-text "intermediate"
        //   [4] A-tool_only("t2")            (no text, orphan if 5+ peeled)
        //   [5] U-tool_result("t2")          (no text)
        //   [6] A-text "final"
        //
        // /unwind 1 → pop [6] (text++=1) → done. Tail ends at [5] which
        // is a U-tool_result matching A-tool_only [4] → valid, no cleanup.
        let mut msgs = vec![
            user_text("prompt1"),
            assistant_tool_only("t1", "Bash"),
            user_tool_result("t1", "out1"),
            assistant_text("intermediate"),
            assistant_tool_only("t2", "Read"),
            user_tool_result("t2", "out2"),
            assistant_text("final"),
        ];
        let removed = unwind_messages(&mut msgs, 1);
        assert_eq!(removed, 1);
        assert_eq!(msgs.len(), 6);
        assert!(matches!(&msgs[5].content[0], ContentBlock::ToolResult { .. }));

        // /unwind 2 → pop [6] (text++=1), pop [5] (no text), pop [4] (no
        // text), pop [3] (text++=2) → done. Tail ends at [2] U-tool_result
        // matching A-tool_only [1] → valid.
        let mut msgs = vec![
            user_text("prompt1"),
            assistant_tool_only("t1", "Bash"),
            user_tool_result("t1", "out1"),
            assistant_text("intermediate"),
            assistant_tool_only("t2", "Read"),
            user_tool_result("t2", "out2"),
            assistant_text("final"),
        ];
        let removed = unwind_messages(&mut msgs, 2);
        assert_eq!(removed, 2);
        assert_eq!(msgs.len(), 3);
        assert!(matches!(&msgs[2].content[0], ContentBlock::ToolResult { .. }));
    }


    #[test]
    fn test_unwind_handles_multiple_tool_roundtrips_in_one_turn() {
        // Multi-step agent turn:
        // U, A-text+tool(t1), U-result(t1), A-text+tool(t2), U-result(t2), A-final
        // /unwind 1 → remove A-final only.
        let mut msgs = vec![
            user_text("question"),
            assistant_text_and_tool("step 1", "t1", "Read"),
            user_tool_result("t1", "file contents"),
            assistant_text_and_tool("step 2", "t2", "Bash"),
            user_tool_result("t2", "shell output"),
            assistant_text("done"),
        ];
        let removed = unwind_messages(&mut msgs, 1);
        assert_eq!(removed, 1);
        assert_eq!(msgs.len(), 5);
        // Tail must still be API-valid: ends with U-tool_result for t2,
        // matching the assistant tool_use just before it.
        assert!(matches!(&msgs[4].content[0], ContentBlock::ToolResult { .. }));
    }

    #[test]
    fn test_unwind_returns_actual_count_not_requested() {
        let mut msgs = vec![user_text("a"), assistant_text("b")];
        let removed = unwind_messages(&mut msgs, 5);
        assert_eq!(removed, 2, "actual text messages removed");
    }

    #[test]
    fn test_unwind_does_not_break_history_before_target() {
        // Earlier turns must remain untouched.
        let mut msgs = vec![
            user_text("turn1"),
            assistant_text("reply1"),
            user_text("turn2"),
            assistant_text("reply2"),
            user_text("turn3"),
            assistant_text("reply3"),
        ];
        let removed = unwind_messages(&mut msgs, 2);
        assert_eq!(removed, 2);
        assert_eq!(msgs.len(), 4);
        // turn1, reply1, turn2, reply2 must remain identical
        match &msgs[0].content[0] {
            ContentBlock::Text { text } => assert_eq!(text, "turn1"),
            _ => panic!(),
        }
        match &msgs[3].content[0] {
            ContentBlock::Text { text } => assert_eq!(text, "reply2"),
            _ => panic!(),
        }
    }
}
