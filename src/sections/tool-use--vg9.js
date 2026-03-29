    x8();
    Rr6();
    (fZK = pH(() => h.unknown())),
      (wZK = pH(() =>
        h
          .object({
            matcher: h.string().optional(),
            hookCallbackIds: h.array(h.string()),
            timeout: h.number().optional(),
          })
          .describe("Configuration for matching and routing hook callbacks."),
      )),
      (YZK = pH(() =>
        h
          .object({
            subtype: h.literal("initialize"),
            hooks: h.record(Vo7(), h.array(wZK())).optional(),
            sdkMcpServers: h.array(h.string()).optional(),
            jsonSchema: h.record(h.string(), h.unknown()).optional(),
            systemPrompt: h.string().optional(),
            appendSystemPrompt: h.string().optional(),
            agents: h.record(h.string(), bo7()).optional(),
            promptSuggestions: h.boolean().optional(),
            agentProgressSummaries: h.boolean().optional(),
          })
          .describe("Initializes the SDK session with hooks, MCP servers, and agent configuration."),
      )),
      (zYA = pH(() =>
        h
          .object({
            commands: h.array(Pr6()),
            agents: h.array(Xr6()),
            output_style: h.string(),
            available_output_styles: h.array(h.string()),
            models: h.array(Eo7()),
            account: Co7(),
            pid: h.number().optional().describe("@internal CLI process PID for tmux socket isolation"),
            fast_mode_state: QtH().optional(),
          })
          .describe("Response from session initialization with available commands, models, and account info."),
      )),
      (DZK = pH(() =>
        h.object({ subtype: h.literal("interrupt") }).describe("Interrupts the currently running conversation turn."),
      )),
      (jZK = pH(() =>
        h
          .object({
            subtype: h.literal("can_use_tool"),
            tool_name: h.string(),
            input: h.record(h.string(), h.unknown()),
            permission_suggestions: h.array(UtH()).optional(),
            blocked_path: h.string().optional(),
            decision_reason: h.string().optional(),
            title: h.string().optional(),
            display_name: h.string().optional(),
            tool_use_id: h.string(),
            agent_id: h.string().optional(),
            description: h.string().optional(),
          })
          .describe("Requests permission to use a tool with the given input."),
      )),
      (MZK = pH(() =>
        h
          .object({
            subtype: h.literal("set_permission_mode"),
            mode: I7H(),
            ultraplan: h.boolean().optional().describe("@internal CCR ultraplan session marker."),
          })
          .describe("Sets the permission mode for tool execution handling."),
      )),
      (JZK = pH(() =>
        h
          .object({ subtype: h.literal("set_model"), model: h.string().optional() })
          .describe("Sets the model to use for subsequent conversation turns."),
      )),
      (PZK = pH(() =>
        h
          .object({ subtype: h.literal("set_max_thinking_tokens"), max_thinking_tokens: h.number().nullable() })
          .describe("Sets the maximum number of thinking tokens for extended thinking."),
      )),
      (XZK = pH(() =>
        h
          .object({ subtype: h.literal("mcp_status") })
          .describe("Requests the current status of all MCP server connections."),
      )),
      (AYA = pH(() =>
        h
          .object({ mcpServers: h.array(Jr6()) })
          .describe("Response containing the current status of all MCP server connections."),
      )),
      (WZK = pH(() =>
        h
          .object({ subtype: h.literal("get_context_usage") })
          .describe("Requests a breakdown of current context window usage by category."),
      )),
      (GZK = pH(() =>
        h.object({ name: h.string(), tokens: h.number(), color: h.string(), isDeferred: h.boolean().optional() }),
      )),
      (RZK = pH(() =>
        h.object({
          color: h.string(),
          isFilled: h.boolean(),
          categoryName: h.string(),
          tokens: h.number(),
          percentage: h.number(),
          squareFullness: h.number(),
        }),
      )),
      (fYA = pH(() =>
        h
          .object({
            categories: h.array(GZK()),
            totalTokens: h.number(),
            maxTokens: h.number(),
            rawMaxTokens: h.number(),
            percentage: h.number(),
            gridRows: h.array(h.array(RZK())),
            model: h.string(),
            memoryFiles: h.array(h.object({ path: h.string(), type: h.string(), tokens: h.number() })),
            mcpTools: h.array(
              h.object({
                name: h.string(),
                serverName: h.string(),
                tokens: h.number(),
                isLoaded: h.boolean().optional(),
              }),
            ),
            deferredBuiltinTools: h
              .array(h.object({ name: h.string(), tokens: h.number(), isLoaded: h.boolean() }))
              .optional(),
            systemTools: h.array(h.object({ name: h.string(), tokens: h.number() })).optional(),
            systemPromptSections: h.array(h.object({ name: h.string(), tokens: h.number() })).optional(),
            agents: h.array(h.object({ agentType: h.string(), source: h.string(), tokens: h.number() })),
            slashCommands: h
              .object({ totalCommands: h.number(), includedCommands: h.number(), tokens: h.number() })
              .optional(),
            skills: h
              .object({
                totalSkills: h.number(),
                includedSkills: h.number(),
                tokens: h.number(),
                skillFrontmatter: h.array(h.object({ name: h.string(), source: h.string(), tokens: h.number() })),
              })
              .optional(),
            autoCompactThreshold: h.number().optional(),
            isAutoCompactEnabled: h.boolean(),
            messageBreakdown: h
              .object({
                toolCallTokens: h.number(),
                toolResultTokens: h.number(),
                attachmentTokens: h.number(),
                assistantMessageTokens: h.number(),
                userMessageTokens: h.number(),
                toolCallsByType: h.array(
                  h.object({ name: h.string(), callTokens: h.number(), resultTokens: h.number() }),
                ),
                attachmentsByType: h.array(h.object({ name: h.string(), tokens: h.number() })),
              })
              .optional(),
            apiUsage: h
              .object({
                input_tokens: h.number(),
                output_tokens: h.number(),
                cache_creation_input_tokens: h.number(),
                cache_read_input_tokens: h.number(),
              })
              .nullable(),
          })
          .describe("Breakdown of current context window usage by category (system prompt, tools, messages, etc.)."),
      )),
      (ZZK = pH(() =>
        h
          .object({ subtype: h.literal("rewind_files"), user_message_id: h.string(), dry_run: h.boolean().optional() })
          .describe("Rewinds file changes made since a specific user message."),
      )),
      (wYA = pH(() =>
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
      (LZK = pH(() =>
        h
          .object({ subtype: h.literal("cancel_async_message"), message_uuid: h.string() })
          .describe(
            "Drops a pending async user message from the command queue by uuid. No-op if already dequeued for execution.",
          ),
      )),
      (YYA = pH(() =>
        h
          .object({ cancelled: h.boolean() })
          .describe(
            "Result of a cancel_async_message operation. cancelled=false means the message was not in the queue (already dequeued or never enqueued).",
          ),
      )),
      (kZK = pH(() =>
        h
          .object({ subtype: h.literal("seed_read_state"), path: h.string(), mtime: h.number() })
          .describe(
            "Seeds the readFileState cache with a path+mtime entry. Use when a prior Read was removed from context (e.g. by snip) so Edit validation would fail despite the client having observed the Read. The mtime lets the CLI detect if the file changed since the seeded Read \u2014 same staleness check as the normal path.",
          ),
      )),
      (vZK = pH(() =>
        h
          .object({
            subtype: h.literal("hook_callback"),
            callback_id: h.string(),
            input: So7(),
            tool_use_id: h.string().optional(),
          })
          .describe("Delivers a hook callback with its input data."),
      )),
      (NZK = pH(() =>
        h
          .object({ subtype: h.literal("mcp_message"), server_name: h.string(), message: fZK() })
          .describe("Sends a JSON-RPC message to a specific MCP server."),
      )),
      (hZK = pH(() =>
        h
          .object({ subtype: h.literal("mcp_set_servers"), servers: h.record(h.string(), ip_()) })
          .describe("Replaces the set of dynamically managed MCP servers."),
      )),
      (DYA = pH(() =>
        h
          .object({
            added: h.array(h.string()),
            removed: h.array(h.string()),
            errors: h.record(h.string(), h.string()),
          })
          .describe("Result of replacing the set of dynamically managed MCP servers."),
      )),
      (yZK = pH(() =>
        h
          .object({ subtype: h.literal("reload_plugins") })
          .describe("Reloads plugins from disk and returns the refreshed session components."),
      )),
      (jYA = pH(() =>
        h
          .object({
            commands: h.array(Pr6()),
            agents: h.array(Xr6()),
            plugins: h.array(h.object({ name: h.string(), path: h.string(), source: h.string().optional() })),
            mcpServers: h.array(Jr6()),
            error_count: h.number(),
          })
          .describe("Refreshed commands, agents, plugins, and MCP server status after reload."),
      )),
      (VZK = pH(() =>
        h
          .object({ subtype: h.literal("mcp_reconnect"), serverName: h.string() })
          .describe("Reconnects a disconnected or failed MCP server."),
      )),
      (SZK = pH(() =>
        h
          .object({ subtype: h.literal("mcp_toggle"), serverName: h.string(), enabled: h.boolean() })
          .describe("Enables or disables an MCP server."),
      )),
      (EZK = pH(() =>
        h.object({ subtype: h.literal("stop_task"), task_id: h.string() }).describe("Stops a running task."),
      )),
      (CZK = pH(() =>
        h
          .object({ subtype: h.literal("apply_flag_settings"), settings: h.record(h.string(), h.unknown()) })
          .describe("Merges the provided settings into the flag settings layer, updating the active configuration."),
      )),
      (bZK = pH(() =>
        h
          .object({ subtype: h.literal("get_settings") })
          .describe("Returns the effective merged settings and the raw per-source settings."),
      )),
      (MYA = pH(() =>
        h
          .object({
            effective: h.record(h.string(), h.unknown()),
            sources: h
              .array(
                h.object({
                  source: h.enum([
                    "userSettings",
                    "projectSettings",
                    "localSettings",
                    "flagSettings",
                    "policySettings",
                  ]),
                  settings: h.record(h.string(), h.unknown()),
                }),
              )
              .describe("Ordered low-to-high priority \u2014 later entries override earlier ones."),
            applied: h
              .object({ model: h.string(), effort: h.enum(["low", "medium", "high", "max"]).nullable() })
              .optional()
              .describe(
                "Runtime-resolved values after env overrides, session state, and model-specific defaults are applied. Unlike `effective` (disk merge), these reflect what will actually be sent to the API.",
              ),
          })
          .describe("Effective merged settings plus raw per-source settings in merge order."),
      )),
      (IZK = pH(() =>
        h
          .object({
            subtype: h.literal("elicitation"),
            mcp_server_name: h.string(),
            message: h.string(),
            mode: h.enum(["form", "url"]).optional(),
            url: h.string().optional(),
            elicitation_id: h.string().optional(),
            requested_schema: h.record(h.string(), h.unknown()).optional(),
          })
          .describe("Requests the SDK consumer to handle an MCP elicitation (user input request)."),
      )),
      (Zg9 = pH(() =>
        h
          .object({
            action: h.enum(["accept", "decline", "cancel"]),
            content: h.record(h.string(), h.unknown()).optional(),
          })
          .describe("Response from the SDK consumer for an elicitation request."),
      )),
      (uZK = pH(() =>
        h.union([
          DZK(),
          jZK(),
          YZK(),
          MZK(),
          JZK(),
          PZK(),
          XZK(),
          WZK(),
          vZK(),
          NZK(),
          ZZK(),
          LZK(),
          kZK(),
          hZK(),
          yZK(),
          VZK(),
          SZK(),
          EZK(),
          CZK(),
          bZK(),
          IZK(),
        ]),
      )),
      (D38 = pH(() => h.object({ type: h.literal("control_request"), request_id: h.string(), request: uZK() }))),
      (xZK = pH(() =>
        h.object({
          subtype: h.literal("success"),
          request_id: h.string(),
          response: h.record(h.string(), h.unknown()).optional(),
        }),
      )),
      (mZK = pH(() =>
        h.object({
          subtype: h.literal("error"),
          request_id: h.string(),
          error: h.string(),
          pending_permission_requests: h.array(h.lazy(() => D38())).optional(),
        }),
      )),
      (Lg9 = pH(() => h.object({ type: h.literal("control_response"), response: h.union([xZK(), mZK()]) }))),
      (pZK = pH(() =>
        h
          .object({ type: h.literal("control_cancel_request"), request_id: h.string() })
          .describe("Cancels a currently open control request."),
      )),
      (kg9 = pH(() =>
        h.object({ type: h.literal("keep_alive") }).describe("Keep-alive message to maintain WebSocket connection."),
      )),
      (BZK = pH(() =>
        h
          .object({ type: h.literal("update_environment_variables"), variables: h.record(h.string(), h.string()) })
          .describe("Updates environment variables at runtime."),
      )),
      (JYA = pH(() => h.union([go7(), xo7(), mo7(), Bo7(), Lg9(), D38(), pZK(), kg9()]))),
      (PYA = pH(() => h.union([Gr6(), D38(), Lg9(), kg9(), BZK()])));
