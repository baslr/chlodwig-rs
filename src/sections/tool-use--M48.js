    x8();
    UjH();
    Vr6();
    KB_();
    (vh9 = pH(() =>
      h.object({
        prompt: h.string(),
        message: h.string(),
        options: h.array(h.object({ key: h.string(), label: h.string(), description: h.string().optional() })),
      }),
    )),
      (YYK = pH(() =>
        h.object({
          continue: h.boolean().describe("Whether Claude should continue after hook (default: true)").optional(),
          suppressOutput: h.boolean().describe("Hide stdout from transcript (default: false)").optional(),
          stopReason: h.string().describe("Message shown when continue is false").optional(),
          decision: h.enum(["approve", "block"]).optional(),
          reason: h.string().describe("Explanation for the decision").optional(),
          systemMessage: h.string().describe("Warning message shown to the user").optional(),
          hookSpecificOutput: h
            .union([
              h.object({
                hookEventName: h.literal("PreToolUse"),
                permissionDecision: RhH().optional(),
                permissionDecisionReason: h.string().optional(),
                updatedInput: h.record(h.string(), h.unknown()).optional(),
                additionalContext: h.string().optional(),
              }),
              h.object({ hookEventName: h.literal("UserPromptSubmit"), additionalContext: h.string().optional() }),
              h.object({
                hookEventName: h.literal("SessionStart"),
                additionalContext: h.string().optional(),
                initialUserMessage: h.string().optional(),
                watchPaths: h.array(h.string()).describe("Absolute paths to watch for FileChanged hooks").optional(),
              }),
              h.object({ hookEventName: h.literal("Setup"), additionalContext: h.string().optional() }),
              h.object({ hookEventName: h.literal("SubagentStart"), additionalContext: h.string().optional() }),
              h.object({
                hookEventName: h.literal("PostToolUse"),
                additionalContext: h.string().optional(),
                updatedMCPToolOutput: h.unknown().describe("Updates the output for MCP tools").optional(),
              }),
              h.object({ hookEventName: h.literal("PostToolUseFailure"), additionalContext: h.string().optional() }),
              h.object({ hookEventName: h.literal("Notification"), additionalContext: h.string().optional() }),
              h.object({
                hookEventName: h.literal("PermissionRequest"),
                decision: h.union([
                  h.object({
                    behavior: h.literal("allow"),
                    updatedInput: h.record(h.string(), h.unknown()).optional(),
                    updatedPermissions: h.array(LhH()).optional(),
                  }),
                  h.object({
                    behavior: h.literal("deny"),
                    message: h.string().optional(),
                    interrupt: h.boolean().optional(),
                  }),
                ]),
              }),
              h.object({
                hookEventName: h.literal("Elicitation"),
                action: h.enum(["accept", "decline", "cancel"]).optional(),
                content: h.record(h.string(), h.unknown()).optional(),
              }),
              h.object({
                hookEventName: h.literal("ElicitationResult"),
                action: h.enum(["accept", "decline", "cancel"]).optional(),
                content: h.record(h.string(), h.unknown()).optional(),
              }),
              h.object({
                hookEventName: h.literal("CwdChanged"),
                watchPaths: h.array(h.string()).describe("Absolute paths to watch for FileChanged hooks").optional(),
              }),
              h.object({
                hookEventName: h.literal("FileChanged"),
                watchPaths: h.array(h.string()).describe("Absolute paths to watch for FileChanged hooks").optional(),
              }),
              h.object({ hookEventName: h.literal("WorktreeCreate"), worktreePath: h.string() }),
            ])
            .optional(),
        }),
      )),
      (QSH = pH(() => {
        let H = h.object({ async: h.literal(!0), asyncTimeout: h.number().optional() });
        return h.union([H, YYK()]);
      }));
