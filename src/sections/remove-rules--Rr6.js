    x8();
    (yo7 = pH(() =>
      h.object({
        inputTokens: h.number(),
        outputTokens: h.number(),
        cacheReadInputTokens: h.number(),
        cacheCreationInputTokens: h.number(),
        webSearchRequests: h.number(),
        costUSD: h.number(),
        contextWindow: h.number(),
        maxOutputTokens: h.number(),
      }),
    )),
      (Su1 = pH(() => h.literal("json_schema"))),
      (vnO = pH(() => h.object({ type: Su1() }))),
      (Eu1 = pH(() => h.object({ type: h.literal("json_schema"), schema: h.record(h.string(), h.unknown()) }))),
      (NnO = pH(() => Eu1())),
      (Cu1 = pH(() => h.enum(["user", "project", "org", "temporary", "oauth"]))),
      (hnO = pH(() => h.enum(["local", "user", "project"]).describe("Config scope for settings."))),
      (ynO = pH(() => h.literal("context-1m-2025-08-07"))),
      (bu1 = pH(() =>
        h.object({ type: h.literal("adaptive") }).describe("Claude decides when and how much to think (Opus 4.6+)."),
      )),
      (Iu1 = pH(() =>
        h
          .object({ type: h.literal("enabled"), budgetTokens: h.number().optional() })
          .describe("Fixed thinking token budget (older models)"),
      )),
      (uu1 = pH(() => h.object({ type: h.literal("disabled") }).describe("No extended thinking"))),
      (VnO = pH(() =>
        h
          .union([bu1(), Iu1(), uu1()])
          .describe(
            "Controls Claude's thinking/reasoning behavior. When set, takes precedence over the deprecated maxThinkingTokens.",
          ),
      )),
      (xu1 = pH(() =>
        h.object({
          type: h.literal("stdio").optional(),
          command: h.string(),
          args: h.array(h.string()).optional(),
          env: h.record(h.string(), h.string()).optional(),
        }),
      )),
      (mu1 = pH(() =>
        h.object({ type: h.literal("sse"), url: h.string(), headers: h.record(h.string(), h.string()).optional() }),
      )),
      (pu1 = pH(() =>
        h.object({ type: h.literal("http"), url: h.string(), headers: h.record(h.string(), h.string()).optional() }),
      )),
      (Bu1 = pH(() => h.object({ type: h.literal("sdk"), name: h.string() }))),
      (ip_ = pH(() => h.union([xu1(), mu1(), pu1(), Bu1()]))),
      (gu1 = pH(() => h.object({ type: h.literal("claudeai-proxy"), url: h.string(), id: h.string() }))),
      (du1 = pH(() => h.union([ip_(), gu1()]))),
      (Jr6 = pH(() =>
        h
          .object({
            name: h.string().describe("Server name as configured"),
            status: h
              .enum(["connected", "failed", "needs-auth", "pending", "disabled"])
              .describe("Current connection status"),
            serverInfo: h
              .object({ name: h.string(), version: h.string() })
              .optional()
              .describe("Server information (available when connected)"),
            error: h.string().optional().describe("Error message (available when status is 'failed')"),
            config: du1().optional().describe("Server configuration (includes URL for HTTP/SSE servers)"),
            scope: h
              .string()
              .optional()
              .describe("Configuration scope (e.g., project, user, local, claudeai, managed)"),
            tools: h
              .array(
                h.object({
                  name: h.string(),
                  description: h.string().optional(),
                  annotations: h
                    .object({
                      readOnly: h.boolean().optional(),
                      destructive: h.boolean().optional(),
                      openWorld: h.boolean().optional(),
                    })
                    .optional(),
                }),
              )
              .optional()
              .describe("Tools provided by this server (available when connected)"),
            capabilities: h
              .object({ experimental: h.record(h.string(), h.unknown()).optional() })
              .optional()
              .describe(
                "@internal Server capabilities (available when connected). experimental['claude/channel'] is only present if the server's plugin is on the approved channels allowlist \u2014 use its presence to decide whether to show an Enable-channel prompt.",
              ),
          })
          .describe("Status information for an MCP server connection."),
      )),
      (SnO = pH(() =>
        h
          .object({
            added: h.array(h.string()).describe("Names of servers that were added"),
            removed: h.array(h.string()).describe("Names of servers that were removed"),
            errors: h
              .record(h.string(), h.string())
              .describe("Map of server names to error messages for servers that failed to connect"),
          })
          .describe("Result of a setMcpServers operation."),
      )),
      (XhH = pH(() => h.enum(["userSettings", "projectSettings", "localSettings", "session", "cliArg"]))),
      (lp_ = pH(() => h.enum(["allow", "deny", "ask"]))),
      (Mr6 = pH(() => h.object({ toolName: h.string(), ruleContent: h.string().optional() }))),
      (UtH = pH(() =>
        h.discriminatedUnion("type", [
          h.object({ type: h.literal("addRules"), rules: h.array(Mr6()), behavior: lp_(), destination: XhH() }),
          h.object({ type: h.literal("replaceRules"), rules: h.array(Mr6()), behavior: lp_(), destination: XhH() }),
          h.object({ type: h.literal("removeRules"), rules: h.array(Mr6()), behavior: lp_(), destination: XhH() }),
          h.object({ type: h.literal("setMode"), mode: h.lazy(() => I7H()), destination: XhH() }),
          h.object({ type: h.literal("addDirectories"), directories: h.array(h.string()), destination: XhH() }),
          h.object({ type: h.literal("removeDirectories"), directories: h.array(h.string()), destination: XhH() }),
        ]),
      )),
      (ho7 = pH(() =>
        h
          .enum(["user_temporary", "user_permanent", "user_reject"])
          .describe(
            "Classification of this permission decision for telemetry. SDK hosts that prompt users (desktop apps, IDEs) should set this to reflect what actually happened: user_temporary for allow-once, user_permanent for always-allow (both the click and later cache hits), user_reject for deny. If unset, the CLI infers conservatively (temporary for allow, reject for deny). The vocabulary matches tool_decision OTel events (monitoring-usage docs).",
          ),
      )),
      (EnO = pH(() =>
        h.union([
          h.object({
            behavior: h.literal("allow"),
            updatedInput: h.record(h.string(), h.unknown()).optional(),
            updatedPermissions: h.array(UtH()).optional(),
            toolUseID: h.string().optional(),
            decisionClassification: ho7().optional(),
          }),
          h.object({
            behavior: h.literal("deny"),
            message: h.string(),
            interrupt: h.boolean().optional(),
            toolUseID: h.string().optional(),
            decisionClassification: ho7().optional(),
          }),
        ]),
      )),
      (I7H = pH(() =>
        h
          .enum(["default", "acceptEdits", "bypassPermissions", "plan", "dontAsk"])
          .describe(
            "Permission mode for controlling how tool executions are handled. 'default' - Standard behavior, prompts for dangerous operations. 'acceptEdits' - Auto-accept file edit operations. 'bypassPermissions' - Bypass all permission checks (requires allowDangerouslySkipPermissions). 'plan' - Planning mode, no actual tool execution. 'dontAsk' - Don't prompt for permissions, deny if not pre-approved.",
          ),
      )),
      (cu1 = [
        "PreToolUse",
        "PostToolUse",
        "PostToolUseFailure",
        "Notification",
        "UserPromptSubmit",
        "SessionStart",
        "SessionEnd",
        "Stop",
        "StopFailure",
        "SubagentStart",
        "SubagentStop",
        "PreCompact",
        "PostCompact",
        "PermissionRequest",
        "Setup",
        "TeammateIdle",
        "TaskCreated",
        "TaskCompleted",
        "Elicitation",
        "ElicitationResult",
        "ConfigChange",
        "WorktreeCreate",
        "WorktreeRemove",
        "InstructionsLoaded",
        "CwdChanged",
        "FileChanged",
      ]),
      (Vo7 = pH(() => h.enum(cu1))),
      (Kf = pH(() =>
        h.object({
          session_id: h.string(),
          transcript_path: h.string(),
          cwd: h.string(),
          permission_mode: h.string().optional(),
          agent_id: h
            .string()
            .optional()
            .describe(
              "Subagent identifier. Present only when the hook fires from within a subagent (e.g., a tool called by an AgentTool worker). Absent for the main thread, even in --agent sessions. Use this field (not agent_type) to distinguish subagent calls from main-thread calls.",
            ),
          agent_type: h
            .string()
            .optional()
            .describe(
              'Agent type name (e.g., "general-purpose", "code-reviewer"). Present when the hook fires from within a subagent (alongside agent_id), or on the main thread of a session started with --agent (without agent_id).',
            ),
        }),
      )),
      (Fu1 = pH(() =>
        Kf().and(
          h.object({
            hook_event_name: h.literal("PreToolUse"),
            tool_name: h.string(),
            tool_input: h.unknown(),
            tool_use_id: h.string(),
          }),
        ),
      )),
      (Uu1 = pH(() =>
        Kf().and(
          h.object({
            hook_event_name: h.literal("PermissionRequest"),
            tool_name: h.string(),
            tool_input: h.unknown(),
            permission_suggestions: h.array(UtH()).optional(),
          }),
        ),
      )),
      (Qu1 = pH(() =>
        Kf().and(
          h.object({
            hook_event_name: h.literal("PostToolUse"),
            tool_name: h.string(),
            tool_input: h.unknown(),
            tool_response: h.unknown(),
            tool_use_id: h.string(),
          }),
        ),
      )),
      (lu1 = pH(() =>
        Kf().and(
          h.object({
            hook_event_name: h.literal("PostToolUseFailure"),
            tool_name: h.string(),
            tool_input: h.unknown(),
            tool_use_id: h.string(),
            error: h.string(),
            is_interrupt: h.boolean().optional(),
          }),
        ),
      )),
      (iu1 = pH(() =>
        Kf().and(
          h.object({
            hook_event_name: h.literal("Notification"),
            message: h.string(),
            title: h.string().optional(),
            notification_type: h.string(),
          }),
        ),
      )),
      (nu1 = pH(() => Kf().and(h.object({ hook_event_name: h.literal("UserPromptSubmit"), prompt: h.string() })))),
      (ru1 = pH(() =>
        Kf().and(
          h.object({
            hook_event_name: h.literal("SessionStart"),
            source: h.enum(["startup", "resume", "clear", "compact"]),
            agent_type: h.string().optional(),
            model: h.string().optional(),
          }),
        ),
      )),
      (ou1 = pH(() =>
        Kf().and(h.object({ hook_event_name: h.literal("Setup"), trigger: h.enum(["init", "maintenance"]) })),
      )),
      (au1 = pH(() =>
        Kf().and(
          h.object({
            hook_event_name: h.literal("Stop"),
            stop_hook_active: h.boolean(),
            last_assistant_message: h
              .string()
              .optional()
              .describe(
                "Text content of the last assistant message before stopping. Avoids the need to read and parse the transcript file.",
              ),
          }),
        ),
      )),
      (su1 = pH(() =>
        Kf().and(
          h.object({
            hook_event_name: h.literal("StopFailure"),
            error: Wr6(),
            error_details: h.string().optional(),
            last_assistant_message: h.string().optional(),
          }),
        ),
      )),
      (tu1 = pH(() =>
        Kf().and(
          h.object({ hook_event_name: h.literal("SubagentStart"), agent_id: h.string(), agent_type: h.string() }),
        ),
      )),
      (eu1 = pH(() =>
        Kf().and(
          h.object({
            hook_event_name: h.literal("SubagentStop"),
            stop_hook_active: h.boolean(),
            agent_id: h.string(),
            agent_transcript_path: h.string(),
            agent_type: h.string(),
            last_assistant_message: h
              .string()
              .optional()
              .describe(
                "Text content of the last assistant message before stopping. Avoids the need to read and parse the transcript file.",
              ),
          }),
        ),
      )),
      (Hx1 = pH(() =>
        Kf().and(
          h.object({
            hook_event_name: h.literal("PreCompact"),
            trigger: h.enum(["manual", "auto"]),
            custom_instructions: h.string().nullable(),
          }),
        ),
      )),
      (_x1 = pH(() =>
        Kf().and(
          h.object({
            hook_event_name: h.literal("PostCompact"),
            trigger: h.enum(["manual", "auto"]),
            compact_summary: h.string().describe("The conversation summary produced by compaction"),
          }),
        ),
      )),
      (qx1 = pH(() =>
        Kf().and(
          h.object({ hook_event_name: h.literal("TeammateIdle"), teammate_name: h.string(), team_name: h.string() }),
        ),
      )),
      ($x1 = pH(() =>
        Kf().and(
          h.object({
            hook_event_name: h.literal("TaskCreated"),
            task_id: h.string(),
            task_subject: h.string(),
            task_description: h.string().optional(),
            teammate_name: h.string().optional(),
            team_name: h.string().optional(),
          }),
        ),
      )),
      (Kx1 = pH(() =>
        Kf().and(
          h.object({
            hook_event_name: h.literal("TaskCompleted"),
            task_id: h.string(),
            task_subject: h.string(),
            task_description: h.string().optional(),
            teammate_name: h.string().optional(),
            team_name: h.string().optional(),
          }),
        ),
      )),
      (Ox1 = pH(() =>
        Kf()
          .and(
            h.object({
              hook_event_name: h.literal("Elicitation"),
              mcp_server_name: h.string(),
              message: h.string(),
              mode: h.enum(["form", "url"]).optional(),
              url: h.string().optional(),
              elicitation_id: h.string().optional(),
              requested_schema: h.record(h.string(), h.unknown()).optional(),
            }),
          )
          .describe(
            "Hook input for the Elicitation event. Fired when an MCP server requests user input. Hooks can auto-respond (accept/decline) instead of showing the dialog.",
          ),
      )),
      (Tx1 = pH(() =>
        Kf()
          .and(
            h.object({
              hook_event_name: h.literal("ElicitationResult"),
              mcp_server_name: h.string(),
              elicitation_id: h.string().optional(),
              mode: h.enum(["form", "url"]).optional(),
              action: h.enum(["accept", "decline", "cancel"]),
              content: h.record(h.string(), h.unknown()).optional(),
            }),
          )
          .describe(
            "Hook input for the ElicitationResult event. Fired after the user responds to an MCP elicitation. Hooks can observe or override the response before it is sent to the server.",
          ),
      )),
      (zx1 = ["user_settings", "project_settings", "local_settings", "policy_settings", "skills"]),
      (Ax1 = pH(() =>
        Kf().and(
          h.object({
            hook_event_name: h.literal("ConfigChange"),
            source: h.enum(zx1),
            file_path: h.string().optional(),
          }),
        ),
      )),
      (fx1 = ["session_start", "nested_traversal", "path_glob_match", "include", "compact"]),
      (wx1 = ["User", "Project", "Local", "Managed"]),
      (Yx1 = pH(() =>
        Kf().and(
          h.object({
            hook_event_name: h.literal("InstructionsLoaded"),
            file_path: h.string(),
            memory_type: h.enum(wx1),
            load_reason: h.enum(fx1),
            globs: h.array(h.string()).optional(),
            trigger_file_path: h.string().optional(),
            parent_file_path: h.string().optional(),
          }),
        ),
      )),
      (Dx1 = pH(() => Kf().and(h.object({ hook_event_name: h.literal("WorktreeCreate"), name: h.string() })))),
      (jx1 = pH(() => Kf().and(h.object({ hook_event_name: h.literal("WorktreeRemove"), worktree_path: h.string() })))),
      (Mx1 = pH(() =>
        Kf().and(h.object({ hook_event_name: h.literal("CwdChanged"), old_cwd: h.string(), new_cwd: h.string() })),
      )),
      (Jx1 = pH(() =>
        Kf().and(
          h.object({
            hook_event_name: h.literal("FileChanged"),
            file_path: h.string(),
            event: h.enum(["change", "add", "unlink"]),
          }),
        ),
      )),
      (Px1 = ["clear", "resume", "logout", "prompt_input_exit", "other", "bypass_permissions_disabled"]),
      (Xx1 = pH(() => h.enum(Px1))),
      (Wx1 = pH(() => Kf().and(h.object({ hook_event_name: h.literal("SessionEnd"), reason: Xx1() })))),
      (So7 = pH(() =>
        h.union([
          Fu1(),
          Qu1(),
          lu1(),
          iu1(),
          nu1(),
          ru1(),
          Wx1(),
          au1(),
          su1(),
          tu1(),
          eu1(),
          Hx1(),
          _x1(),
          Uu1(),
          ou1(),
          qx1(),
          $x1(),
          Kx1(),
          Ox1(),
          Tx1(),
          Ax1(),
          Yx1(),
          Dx1(),
          jx1(),
          Mx1(),
          Jx1(),
        ]),
      )),
      (Gx1 = pH(() => h.object({ async: h.literal(!0), asyncTimeout: h.number().optional() }))),
      (Rx1 = pH(() =>
        h.object({
          hookEventName: h.literal("PreToolUse"),
          permissionDecision: lp_().optional(),
          permissionDecisionReason: h.string().optional(),
          updatedInput: h.record(h.string(), h.unknown()).optional(),
          additionalContext: h.string().optional(),
        }),
      )),
      (Zx1 = pH(() =>
        h.object({ hookEventName: h.literal("UserPromptSubmit"), additionalContext: h.string().optional() }),
      )),
      (Lx1 = pH(() =>
        h.object({
          hookEventName: h.literal("SessionStart"),
          additionalContext: h.string().optional(),
          initialUserMessage: h.string().optional(),
          watchPaths: h.array(h.string()).optional(),
        }),
      )),
      (kx1 = pH(() => h.object({ hookEventName: h.literal("Setup"), additionalContext: h.string().optional() }))),
      (vx1 = pH(() =>
        h.object({ hookEventName: h.literal("SubagentStart"), additionalContext: h.string().optional() }),
      )),
      (Nx1 = pH(() =>
        h.object({
          hookEventName: h.literal("PostToolUse"),
          additionalContext: h.string().optional(),
          updatedMCPToolOutput: h.unknown().optional(),
        }),
      )),
      (hx1 = pH(() =>
        h.object({ hookEventName: h.literal("PostToolUseFailure"), additionalContext: h.string().optional() }),
      )),
      (yx1 = pH(() =>
        h.object({ hookEventName: h.literal("Notification"), additionalContext: h.string().optional() }),
      )),
      (Vx1 = pH(() =>
        h.object({
          hookEventName: h.literal("PermissionRequest"),
          decision: h.union([
            h.object({
              behavior: h.literal("allow"),
              updatedInput: h.record(h.string(), h.unknown()).optional(),
              updatedPermissions: h.array(UtH()).optional(),
            }),
            h.object({
              behavior: h.literal("deny"),
              message: h.string().optional(),
              interrupt: h.boolean().optional(),
            }),
          ]),
        }),
      )),
      (Sx1 = pH(() =>
        h.object({ hookEventName: h.literal("CwdChanged"), watchPaths: h.array(h.string()).optional() }),
      )),
      (Ex1 = pH(() =>
        h.object({ hookEventName: h.literal("FileChanged"), watchPaths: h.array(h.string()).optional() }),
      )),
      (Cx1 = pH(() =>
        h.object({
          continue: h.boolean().optional(),
          suppressOutput: h.boolean().optional(),
          stopReason: h.string().optional(),
          decision: h.enum(["approve", "block"]).optional(),
          systemMessage: h.string().optional(),
          reason: h.string().optional(),
          hookSpecificOutput: h
            .union([Rx1(), Zx1(), Lx1(), kx1(), vx1(), Nx1(), hx1(), yx1(), Vx1(), bx1(), Ix1(), Sx1(), Ex1(), ux1()])
            .optional(),
        }),
      )),
      (bx1 = pH(() =>
        h
          .object({
            hookEventName: h.literal("Elicitation"),
            action: h.enum(["accept", "decline", "cancel"]).optional(),
            content: h.record(h.string(), h.unknown()).optional(),
          })
          .describe(
            "Hook-specific output for the Elicitation event. Return this to programmatically accept or decline an MCP elicitation request.",
          ),
      )),
      (Ix1 = pH(() =>
        h
          .object({
            hookEventName: h.literal("ElicitationResult"),
            action: h.enum(["accept", "decline", "cancel"]).optional(),
            content: h.record(h.string(), h.unknown()).optional(),
          })
          .describe(
            "Hook-specific output for the ElicitationResult event. Return this to override the action or content before the response is sent to the MCP server.",
          ),
      )),
      (ux1 = pH(() =>
        h
          .object({ hookEventName: h.literal("WorktreeCreate"), worktreePath: h.string() })
          .describe(
            "Hook-specific output for the WorktreeCreate event. Provides the absolute path to the created worktree directory. Command hooks print the path on stdout instead.",
          ),
      )),
      (CnO = pH(() => h.union([Gx1(), Cx1()]))),
      (xx1 = pH(() =>
        h.object({
          key: h.string().describe("Unique key for this option, returned in the response"),
          label: h.string().describe("Display text for this option"),
          description: h.string().optional().describe("Optional description shown below the label"),
        }),
      )),
      (bnO = pH(() =>
        h.object({
          prompt: h.string().describe("Request ID. Presence of this key marks the line as a prompt request."),
          message: h.string().describe("The prompt message to display to the user"),
          options: h.array(xx1()).describe("Available options for the user to choose from"),
        }),
      )),
      (InO = pH(() =>
        h.object({
          prompt_response: h.string().describe("The request ID from the corresponding prompt request"),
          selected: h.string().describe("The key of the selected option"),
        }),
      )),
      (Pr6 = pH(() =>
        h
          .object({
            name: h.string().describe("Skill name (without the leading slash)"),
            description: h.string().describe("Description of what the skill does"),
            argumentHint: h.string().describe('Hint for skill arguments (e.g., "<file>")'),
          })
          .describe("Information about an available skill (invoked via /command syntax)."),
      )),
      (Xr6 = pH(() =>
        h
          .object({
            name: h.string().describe('Agent type identifier (e.g., "Explore")'),
            description: h.string().describe("Description of when to use this agent"),
            model: h
              .string()
              .optional()
              .describe("Model alias this agent uses. If omitted, inherits the parent's model"),
          })
          .describe("Information about an available subagent that can be invoked via the Task tool."),
      )),
      (Eo7 = pH(() =>
        h
          .object({
            value: h.string().describe("Model identifier to use in API calls"),
            displayName: h.string().describe("Human-readable display name"),
            description: h.string().describe("Description of the model's capabilities"),
            supportsEffort: h.boolean().optional().describe("Whether this model supports effort levels"),
            supportedEffortLevels: h
              .array(h.enum(["low", "medium", "high", "max"]))
              .optional()
              .describe("Available effort levels for this model"),
            supportsAdaptiveThinking: h
              .boolean()
              .optional()
              .describe("Whether this model supports adaptive thinking (Claude decides when and how much to think)"),
            supportsFastMode: h.boolean().optional().describe("Whether this model supports fast mode"),
            supportsAutoMode: h.boolean().optional().describe("Whether this model supports auto mode"),
          })
          .describe("Information about an available model."),
      )),
      (Co7 = pH(() =>
        h
          .object({
            email: h.string().optional(),
            organization: h.string().optional(),
            subscriptionType: h.string().optional(),
            tokenSource: h.string().optional(),
            apiKeySource: h.string().optional(),
            apiProvider: h
              .enum(["firstParty", "bedrock", "vertex", "foundry"])
              .optional()
              .describe(
                'Active API backend. Anthropic OAuth login only applies when "firstParty"; for 3P providers the other fields are absent and auth is external (AWS creds, gcloud ADC, etc.).',
              ),
          })
          .describe("Information about the logged in user's account."),
      )),
      (mx1 = pH(() => h.union([h.string(), h.record(h.string(), ip_())]))),
      (bo7 = pH(() =>
        h
          .object({
            description: h.string().describe("Natural language description of when to use this agent"),
            tools: h
              .array(h.string())
              .optional()
              .describe("Array of allowed tool names. If omitted, inherits all tools from parent"),
            disallowedTools: h
              .array(h.string())
              .optional()
              .describe("Array of tool names to explicitly disallow for this agent"),
            prompt: h.string().describe("The agent's system prompt"),
            model: h
              .string()
              .optional()
              .describe(
                "Model alias (e.g. 'sonnet', 'opus', 'haiku') or full model ID (e.g. 'claude-opus-4-5'). If omitted or 'inherit', uses the main model",
              ),
            mcpServers: h.array(mx1()).optional(),
            criticalSystemReminder_EXPERIMENTAL: h
              .string()
              .optional()
              .describe("Experimental: Critical reminder added to system prompt"),
            skills: h.array(h.string()).optional().describe("Array of skill names to preload into the agent context"),
            initialPrompt: h
              .string()
              .optional()
              .describe(
                "Auto-submitted as the first user turn when this agent is the main thread agent. Slash commands are processed. Prepended to any user-provided prompt.",
              ),
            maxTurns: h
              .number()
              .int()
              .positive()
              .optional()
              .describe("Maximum number of agentic turns (API round-trips) before stopping"),
          })
          .describe("Definition for a custom subagent that can be invoked via the Agent tool."),
      )),
      (unO = pH(() =>
        h
          .enum(["user", "project", "local"])
          .describe(
            "Source for loading filesystem-based settings. 'user' - Global user settings (~/.claude/settings.json). 'project' - Project settings (.claude/settings.json). 'local' - Local settings (.claude/settings.local.json).",
          ),
      )),
      (xnO = pH(() =>
        h
          .object({
            type: h.literal("local").describe("Plugin type. Currently only 'local' is supported"),
            path: h.string().describe("Absolute or relative path to the plugin directory"),
          })
          .describe("Configuration for loading a plugin."),
      )),
      (mnO = pH(() =>
        h
          .object({
            canRewind: h.boolean(),
            error: h.string().optional(),
            filesChanged: h.array(h.string()).optional(),
            insertions: h.number().optional(),
            deletions: h.number().optional(),
          })
          .describe("Result of a rewindFiles operation."),
      )),
      (px1 = pH(() => h.unknown())),
      (Bx1 = pH(() => h.unknown())),
      (gx1 = pH(() => h.unknown())),
      (FO = pH(() => h.string())),
      (Io7 = pH(() => h.unknown())),
      (Wr6 = pH(() =>
        h.enum([
          "authentication_failed",
          "billing_error",
          "rate_limit",
          "invalid_request",
          "server_error",
          "unknown",
          "max_output_tokens",
        ]),
      )),
      (dx1 = pH(() => h.union([h.literal("compacting"), h.null()]))),
      (uo7 = pH(() =>
        h.object({
          type: h.literal("user"),
          message: px1(),
          parent_tool_use_id: h.string().nullable(),
          isSynthetic: h.boolean().optional(),
          tool_use_result: h.unknown().optional(),
          priority: h.enum(["now", "next", "later"]).optional(),
          timestamp: h
            .string()
            .optional()
            .describe(
              "ISO timestamp when the message was created on the originating process. Older emitters omit it; consumers should fall back to receive time.",
            ),
        }),
      )),
      (Gr6 = pH(() => uo7().extend({ uuid: FO().optional(), session_id: h.string().optional() }))),
      (cx1 = pH(() => uo7().extend({ uuid: FO(), session_id: h.string(), isReplay: h.literal(!0) }))),
      (Fx1 = pH(() =>
        h
          .object({
            status: h.enum(["allowed", "allowed_warning", "rejected"]),
            resetsAt: h.number().optional(),
            rateLimitType: h
              .enum(["five_hour", "seven_day", "seven_day_opus", "seven_day_sonnet", "overage"])
              .optional(),
            utilization: h.number().optional(),
            overageStatus: h.enum(["allowed", "allowed_warning", "rejected"]).optional(),
            overageResetsAt: h.number().optional(),
            overageDisabledReason: h
              .enum([
                "overage_not_provisioned",
                "org_level_disabled",
                "org_level_disabled_until",
                "out_of_credits",
                "seat_tier_level_disabled",
                "member_level_disabled",
                "seat_tier_zero_credit_limit",
                "group_zero_credit_limit",
                "member_zero_credit_limit",
                "org_service_level_disabled",
                "org_service_zero_credit_limit",
                "no_limits_configured",
                "unknown",
              ])
              .optional(),
            isUsingOverage: h.boolean().optional(),
            surpassedThreshold: h.number().optional(),
          })
          .describe("Rate limit information for claude.ai subscription users."),
      )),
      (Ux1 = pH(() =>
        h.object({
          type: h.literal("assistant"),
          message: Bx1(),
          parent_tool_use_id: h.string().nullable(),
          error: Wr6().optional(),
          uuid: FO(),
          session_id: h.string(),
        }),
      )),
      (Qx1 = pH(() =>
        h
          .object({ type: h.literal("rate_limit_event"), rate_limit_info: Fx1(), uuid: FO(), session_id: h.string() })
          .describe("Rate limit event emitted when rate limit info changes."),
      )),
      (xo7 = pH(() =>
        h
          .object({
            type: h.literal("streamlined_text"),
            text: h.string().describe("Text content preserved from the assistant message"),
            session_id: h.string(),
            uuid: FO(),
          })
          .describe(
            "@internal Streamlined text message - replaces SDKAssistantMessage in streamlined output. Text content preserved, thinking and tool_use blocks removed.",
          ),
      )),
      (mo7 = pH(() =>
        h
          .object({
            type: h.literal("streamlined_tool_use_summary"),
            tool_summary: h.string().describe('Summary of tool calls (e.g., "Read 2 files, wrote 1 file")'),
            session_id: h.string(),
            uuid: FO(),
          })
          .describe(
            "@internal Streamlined tool use summary - replaces tool_use blocks in streamlined output with a cumulative summary string.",
          ),
      )),
      (po7 = pH(() =>
        h.object({ tool_name: h.string(), tool_use_id: h.string(), tool_input: h.record(h.string(), h.unknown()) }),
      )),
      (lx1 = pH(() =>
        h.object({
          type: h.literal("result"),
          subtype: h.literal("success"),
          duration_ms: h.number(),
          duration_api_ms: h.number(),
          is_error: h.boolean(),
          num_turns: h.number(),
          result: h.string(),
          stop_reason: h.string().nullable(),
          total_cost_usd: h.number(),
          usage: Io7(),
          modelUsage: h.record(h.string(), yo7()),
          permission_denials: h.array(po7()),
          structured_output: h.unknown().optional(),
          fast_mode_state: QtH().optional(),
          uuid: FO(),
          session_id: h.string(),
        }),
      )),
      (ix1 = pH(() =>
        h.object({
          type: h.literal("result"),
          subtype: h.enum([
            "error_during_execution",
            "error_max_turns",
            "error_max_budget_usd",
            "error_max_structured_output_retries",
          ]),
          duration_ms: h.number(),
          duration_api_ms: h.number(),
          is_error: h.boolean(),
          num_turns: h.number(),
          stop_reason: h.string().nullable(),
          total_cost_usd: h.number(),
          usage: Io7(),
          modelUsage: h.record(h.string(), yo7()),
          permission_denials: h.array(po7()),
          errors: h.array(h.string()),
          fast_mode_state: QtH().optional(),
          uuid: FO(),
          session_id: h.string(),
        }),
      )),
      (nx1 = pH(() => h.union([lx1(), ix1()]))),
      (rx1 = pH(() =>
        h.object({
          type: h.literal("system"),
          subtype: h.literal("init"),
          agents: h.array(h.string()).optional(),
          apiKeySource: Cu1(),
          betas: h.array(h.string()).optional(),
          claude_code_version: h.string(),
          cwd: h.string(),
          tools: h.array(h.string()),
          mcp_servers: h.array(h.object({ name: h.string(), status: h.string() })),
          model: h.string(),
          permissionMode: I7H(),
          slash_commands: h.array(h.string()),
          output_style: h.string(),
          skills: h.array(h.string()),
          plugins: h.array(
            h.object({
              name: h.string(),
              path: h.string(),
              source: h
                .string()
                .optional()
                .describe(
                  '@internal Plugin source identifier in "name\\@marketplace" format. Sentinels: "name\\@inline" for --plugin-dir, "name\\@builtin" for built-in plugins.',
                ),
            }),
          ),
          fast_mode_state: QtH().optional(),
          uuid: FO(),
          session_id: h.string(),
        }),
      )),
      (ox1 = pH(() =>
        h.object({
          type: h.literal("stream_event"),
          event: gx1(),
          parent_tool_use_id: h.string().nullable(),
          uuid: FO(),
          session_id: h.string(),
        }),
      )),
      (ax1 = pH(() =>
        h.object({
          type: h.literal("system"),
          subtype: h.literal("compact_boundary"),
          compact_metadata: h.object({
            trigger: h.enum(["manual", "auto"]),
            pre_tokens: h.number(),
            preserved_segment: h
              .object({ head_uuid: FO(), anchor_uuid: FO(), tail_uuid: FO() })
              .optional()
              .describe(
                "Relink info for messagesToKeep. Loaders splice the preserved segment at anchor_uuid (summary for suffix-preserving, boundary for prefix-preserving partial compact) so resume includes preserved content. Unset when compaction summarizes everything (no messagesToKeep).",
              ),
          }),
          uuid: FO(),
          session_id: h.string(),
        }),
      )),
      (sx1 = pH(() =>
        h.object({
          type: h.literal("system"),
          subtype: h.literal("status"),
          status: dx1(),
          permissionMode: I7H().optional(),
          uuid: FO(),
          session_id: h.string(),
        }),
      )),
      (Bo7 = pH(() =>
        h
          .object({
            type: h.literal("system"),
            subtype: h.literal("post_turn_summary"),
            summarizes_uuid: h.string(),
            status_category: h.enum(["need_input", "waiting", "completed", "review_ready", "failed"]),
            status_detail: h.string(),
            is_noteworthy: h.boolean(),
            title: h.string(),
            description: h.string(),
            recent_action: h.string(),
            needs_action: h.string(),
            artifact_urls: h.array(h.string()),
            uuid: FO(),
            session_id: h.string(),
          })
          .describe(
            "@internal Background post-turn summary emitted after each assistant turn. summarizes_uuid points to the assistant message this summarizes.",
          ),
      )),
      (tx1 = pH(() =>
        h
          .object({
            type: h.literal("system"),
            subtype: h.literal("api_retry"),
            attempt: h.number(),
            max_retries: h.number(),
            retry_delay_ms: h.number(),
            error_status: h.number().nullable(),
            error: Wr6(),
            uuid: FO(),
            session_id: h.string(),
          })
          .describe(
            "Emitted when an API request fails with a retryable error and will be retried after a delay. error_status is null for connection errors (e.g. timeouts) that had no HTTP response.",
          ),
      )),
      (ex1 = pH(() =>
        h
          .object({
            type: h.literal("system"),
            subtype: h.literal("local_command_output"),
            content: h.string(),
            uuid: FO(),
            session_id: h.string(),
          })
          .describe(
            "Output from a local slash command (e.g. /voice, /cost). Displayed as assistant-style text in the transcript.",
          ),
      )),
      (Hm1 = pH(() =>
        h.object({
          type: h.literal("system"),
          subtype: h.literal("hook_started"),
          hook_id: h.string(),
          hook_name: h.string(),
          hook_event: h.string(),
          uuid: FO(),
          session_id: h.string(),
        }),
      )),
      (_m1 = pH(() =>
        h.object({
          type: h.literal("system"),
          subtype: h.literal("hook_progress"),
          hook_id: h.string(),
          hook_name: h.string(),
          hook_event: h.string(),
          stdout: h.string(),
          stderr: h.string(),
          output: h.string(),
          uuid: FO(),
          session_id: h.string(),
        }),
      )),
      (qm1 = pH(() =>
        h.object({
          type: h.literal("system"),
          subtype: h.literal("hook_response"),
          hook_id: h.string(),
          hook_name: h.string(),
          hook_event: h.string(),
          output: h.string(),
          stdout: h.string(),
          stderr: h.string(),
          exit_code: h.number().optional(),
          outcome: h.enum(["success", "error", "cancelled"]),
          uuid: FO(),
          session_id: h.string(),
        }),
      )),
      ($m1 = pH(() =>
        h.object({
          type: h.literal("tool_progress"),
          tool_use_id: h.string(),
          tool_name: h.string(),
          parent_tool_use_id: h.string().nullable(),
          elapsed_time_seconds: h.number(),
          task_id: h.string().optional(),
          uuid: FO(),
          session_id: h.string(),
        }),
      )),
      (Km1 = pH(() =>
        h.object({
          type: h.literal("auth_status"),
          isAuthenticating: h.boolean(),
          output: h.array(h.string()),
          error: h.string().optional(),
          uuid: FO(),
          session_id: h.string(),
        }),
      )),
      (Om1 = pH(() =>
        h.object({
          type: h.literal("system"),
          subtype: h.literal("files_persisted"),
          files: h.array(h.object({ filename: h.string(), file_id: h.string() })),
          failed: h.array(h.object({ filename: h.string(), error: h.string() })),
          processed_at: h.string(),
          uuid: FO(),
          session_id: h.string(),
        }),
      )),
      (Tm1 = pH(() =>
        h.object({
          type: h.literal("system"),
          subtype: h.literal("task_notification"),
          task_id: h.string(),
          tool_use_id: h.string().optional(),
          status: h.enum(["completed", "failed", "stopped"]),
          output_file: h.string(),
          summary: h.string(),
          usage: h.object({ total_tokens: h.number(), tool_uses: h.number(), duration_ms: h.number() }).optional(),
          uuid: FO(),
          session_id: h.string(),
        }),
      )),
      (zm1 = pH(() =>
        h.object({
          type: h.literal("system"),
          subtype: h.literal("task_started"),
          task_id: h.string(),
          tool_use_id: h.string().optional(),
          description: h.string(),
          task_type: h.string().optional(),
          workflow_name: h
            .string()
            .optional()
            .describe("meta.name from the workflow script (e.g. 'spec'). Only set when task_type is 'local_workflow'."),
          prompt: h.string().optional(),
          uuid: FO(),
          session_id: h.string(),
        }),
      )),
      (Am1 = pH(() =>
        h
          .object({
            type: h.literal("system"),
            subtype: h.literal("session_state_changed"),
            state: h.enum(["idle", "running", "requires_action"]),
            uuid: FO(),
            session_id: h.string(),
          })
          .describe(
            "Mirrors notifySessionStateChanged. 'idle' fires after heldBackResult flushes and the bg-agent do-while exits \u2014 authoritative turn-over signal.",
          ),
      )),
      (fm1 = pH(() =>
        h.object({
          type: h.literal("system"),
          subtype: h.literal("task_progress"),
          task_id: h.string(),
          tool_use_id: h.string().optional(),
          description: h.string(),
          usage: h.object({ total_tokens: h.number(), tool_uses: h.number(), duration_ms: h.number() }),
          last_tool_name: h.string().optional(),
          summary: h.string().optional(),
          uuid: FO(),
          session_id: h.string(),
        }),
      )),
      (wm1 = pH(() =>
        h.object({
          type: h.literal("tool_use_summary"),
          summary: h.string(),
          preceding_tool_use_ids: h.array(h.string()),
          uuid: FO(),
          session_id: h.string(),
        }),
      )),
      (Ym1 = pH(() =>
        h
          .object({
            type: h.literal("system"),
            subtype: h.literal("elicitation_complete"),
            mcp_server_name: h.string(),
            elicitation_id: h.string(),
            uuid: FO(),
            session_id: h.string(),
          })
          .describe("Emitted when an MCP server confirms that a URL-mode elicitation is complete."),
      )),
      (Dm1 = pH(() =>
        h
          .object({ type: h.literal("prompt_suggestion"), suggestion: h.string(), uuid: FO(), session_id: h.string() })
          .describe("Predicted next user prompt, emitted after each turn when promptSuggestions is enabled."),
      )),
      (pnO = pH(() =>
        h
          .object({
            sessionId: h.string().describe("Unique session identifier (UUID)."),
            summary: h
              .string()
              .describe("Display title for the session: custom title, auto-generated summary, or first prompt."),
            lastModified: h.number().describe("Last modified time in milliseconds since epoch."),
            fileSize: h.number().optional().describe("File size in bytes. Only populated for local JSONL storage."),
            customTitle: h.string().optional().describe("User-set session title via /rename."),
            firstPrompt: h.string().optional().describe("First meaningful user prompt in the session."),
            gitBranch: h.string().optional().describe("Git branch at the end of the session."),
            cwd: h.string().optional().describe("Working directory for the session."),
            tag: h.string().optional().describe("User-set session tag."),
            createdAt: h
              .number()
              .optional()
              .describe("Creation time in milliseconds since epoch, extracted from the first entry's timestamp."),
          })
          .describe("Session metadata returned by listSessions and getSessionInfo."),
      )),
      (go7 = pH(() =>
        h.union([
          Ux1(),
          Gr6(),
          cx1(),
          nx1(),
          rx1(),
          ox1(),
          ax1(),
          sx1(),
          tx1(),
          ex1(),
          Hm1(),
          _m1(),
          qm1(),
          $m1(),
          Km1(),
          Tm1(),
          zm1(),
          fm1(),
          Am1(),
          Om1(),
          wm1(),
          Qx1(),
          Ym1(),
          Dm1(),
        ]),
      )),
      (QtH = pH(() =>
        h
          .enum(["off", "cooldown", "on"])
          .describe("Fast mode state: off, in cooldown after rate limit, or actively enabled."),
      ));
