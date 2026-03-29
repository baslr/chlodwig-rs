    x8();
    jX8();
    g_();
    yJ();
    UR();
    _z();
    I96();
    mK_();
    mK_();
    (WA$ = pH(() => h.record(h.string(), h.coerce.string()))),
      (GA$ = pH(() =>
        h
          .object({
            allow: h.array(FK_()).optional().describe("List of permission rules for allowed operations"),
            deny: h.array(FK_()).optional().describe("List of permission rules for denied operations"),
            ask: h
              .array(FK_())
              .optional()
              .describe("List of permission rules that should always prompt for confirmation"),
            defaultMode: h.enum(h0).optional().describe("Default permission mode when Claude Code needs access"),
            disableBypassPermissionsMode: h
              .enum(["disable"])
              .optional()
              .describe("Disable the ability to bypass permission prompts"),
            ...{ disableAutoMode: h.enum(["disable"]).optional().describe("Disable auto mode") },
            additionalDirectories: h
              .array(h.string())
              .optional()
              .describe("Additional directories to include in the permission scope"),
          })
          .passthrough(),
      )),
      (RA$ = pH(() =>
        h.object({
          source: huH().describe("Where to fetch the marketplace from"),
          installLocation: h
            .string()
            .optional()
            .describe("Local cache path where marketplace manifest is stored (auto-generated if not provided)"),
          autoUpdate: h
            .boolean()
            .optional()
            .describe("Whether to automatically update this marketplace and its installed plugins on startup"),
        }),
      )),
      (ZA$ = pH(() =>
        h
          .object({
            serverName: h
              .string()
              .regex(/^[a-zA-Z0-9_-]+$/, "Server name can only contain letters, numbers, hyphens, and underscores")
              .optional()
              .describe("Name of the MCP server that users are allowed to configure"),
            serverCommand: h
              .array(h.string())
              .min(1, "Server command must have at least one element (the command)")
              .optional()
              .describe("Command array [command, ...args] to match exactly for allowed stdio servers"),
            serverUrl: h
              .string()
              .optional()
              .describe(
                'URL pattern with wildcard support (e.g., "https://*.example.com/*") for allowed remote MCP servers',
              ),
          })
          .refine(
            (H) => {
              return $8([H.serverName !== void 0, H.serverCommand !== void 0, H.serverUrl !== void 0], Boolean) === 1;
            },
            { message: 'Entry must have exactly one of "serverName", "serverCommand", or "serverUrl"' },
          ),
      )),
      (LA$ = pH(() =>
        h
          .object({
            serverName: h
              .string()
              .regex(/^[a-zA-Z0-9_-]+$/, "Server name can only contain letters, numbers, hyphens, and underscores")
              .optional()
              .describe("Name of the MCP server that is explicitly blocked"),
            serverCommand: h
              .array(h.string())
              .min(1, "Server command must have at least one element (the command)")
              .optional()
              .describe("Command array [command, ...args] to match exactly for blocked stdio servers"),
            serverUrl: h
              .string()
              .optional()
              .describe(
                'URL pattern with wildcard support (e.g., "https://*.example.com/*") for blocked remote MCP servers',
              ),
          })
          .refine(
            (H) => {
              return $8([H.serverName !== void 0, H.serverCommand !== void 0, H.serverUrl !== void 0], Boolean) === 1;
            },
            { message: 'Entry must have exactly one of "serverName", "serverCommand", or "serverUrl"' },
          ),
      )),
      (ajH = ["skills", "agents", "hooks", "mcp"]),
      (VJ = pH(() =>
        h
          .object({
            $schema: h.literal(AX8).optional().describe("JSON Schema reference for Claude Code settings"),
            apiKeyHelper: h.string().optional().describe("Path to a script that outputs authentication values"),
            awsCredentialExport: h.string().optional().describe("Path to a script that exports AWS credentials"),
            awsAuthRefresh: h.string().optional().describe("Path to a script that refreshes AWS authentication"),
            gcpAuthRefresh: h
              .string()
              .optional()
              .describe("Command to refresh GCP authentication (e.g., gcloud auth application-default login)"),
            ...(lH(process.env.CLAUDE_CODE_ENABLE_XAA)
              ? {
                  xaaIdp: h
                    .object({
                      issuer: h.string().url().describe("IdP issuer URL for OIDC discovery"),
                      clientId: h.string().describe("Claude Code's client_id registered at the IdP"),
                      callbackPort: h
                        .number()
                        .int()
                        .positive()
                        .optional()
                        .describe(
                          "Fixed loopback callback port for the IdP OIDC login. Only needed if the IdP does not honor RFC 8252 port-any matching.",
                        ),
                    })
                    .optional()
                    .describe("XAA (SEP-990) IdP connection. Configure once; all XAA-enabled MCP servers reuse this."),
                }
              : {}),
            fileSuggestion: h
              .object({ type: h.literal("command"), command: h.string() })
              .optional()
              .describe("Custom file suggestion configuration for @ mentions"),
            respectGitignore: h
              .boolean()
              .optional()
              .describe(
                "Whether file picker should respect .gitignore files (default: true). Note: .ignore files are always respected.",
              ),
            cleanupPeriodDays: h
              .number()
              .nonnegative()
              .int()
              .optional()
              .describe(
                "Number of days to retain chat transcripts (default: 30). Setting to 0 disables session persistence entirely: no transcripts are written and existing transcripts are deleted at startup.",
              ),
            env: WA$().optional().describe("Environment variables to set for Claude Code sessions"),
            attribution: h
              .object({
                commit: h
                  .string()
                  .optional()
                  .describe(
                    "Attribution text for git commits, including any trailers. Empty string hides attribution.",
                  ),
                pr: h
                  .string()
                  .optional()
                  .describe("Attribution text for pull request descriptions. Empty string hides attribution."),
              })
              .optional()
              .describe(
                "Customize attribution text for commits and PRs. Each field defaults to the standard Claude Code attribution if not set.",
              ),
            includeCoAuthoredBy: h
              .boolean()
              .optional()
              .describe(
                "Deprecated: Use attribution instead. Whether to include Claude's co-authored by attribution in commits and PRs (defaults to true)",
              ),
            includeGitInstructions: h
              .boolean()
              .optional()
              .describe(
                "Include built-in commit and PR workflow instructions in Claude's system prompt (default: true)",
              ),
            permissions: GA$().optional().describe("Tool usage permissions configuration"),
            model: h.string().optional().describe("Override the default model used by Claude Code"),
            availableModels: h
              .array(h.string())
              .optional()
              .describe(
                'Allowlist of models that users can select. Accepts family aliases ("opus" allows any opus version), version prefixes ("opus-4-5" allows only that version), and full model IDs. If undefined, all models are available. If empty array, only the default model is available. Typically set in managed settings by enterprise administrators.',
              ),
            modelOverrides: h
              .record(h.string(), h.string())
              .optional()
              .describe(
                'Override mapping from Anthropic model ID (e.g. "claude-opus-4-6") to provider-specific model ID (e.g. a Bedrock inference profile ARN). Typically set in managed settings by enterprise administrators.',
              ),
            enableAllProjectMcpServers: h
              .boolean()
              .optional()
              .describe("Whether to automatically approve all MCP servers in the project"),
            enabledMcpjsonServers: h
              .array(h.string())
              .optional()
              .describe("List of approved MCP servers from .mcp.json"),
            disabledMcpjsonServers: h
              .array(h.string())
              .optional()
              .describe("List of rejected MCP servers from .mcp.json"),
            allowedMcpServers: h
              .array(ZA$())
              .optional()
              .describe(
                "Enterprise allowlist of MCP servers that can be used. Applies to all scopes including enterprise servers from managed-mcp.json. If undefined, all servers are allowed. If empty array, no servers are allowed. Denylist takes precedence - if a server is on both lists, it is denied.",
              ),
            deniedMcpServers: h
              .array(LA$())
              .optional()
              .describe(
                "Enterprise denylist of MCP servers that are explicitly blocked. If a server is on the denylist, it will be blocked across all scopes including enterprise. Denylist takes precedence over allowlist - if a server is on both lists, it is denied.",
              ),
            hooks: eV().optional().describe("Custom commands to run before/after tool executions"),
            worktree: h
              .object({
                symlinkDirectories: h
                  .array(h.string())
                  .optional()
                  .describe(
                    'Directories to symlink from main repository to worktrees to avoid disk bloat. Must be explicitly configured - no directories are symlinked by default. Common examples: "node_modules", ".cache", ".bin"',
                  ),
                sparsePaths: h
                  .array(h.string())
                  .optional()
                  .describe(
                    "Directories to include when creating worktrees, via git sparse-checkout (cone mode). " +
                      "Dramatically faster in large monorepos \u2014 only the listed paths are written to disk.",
                  ),
              })
              .optional()
              .describe("Git worktree configuration for --worktree flag."),
            disableAllHooks: h.boolean().optional().describe("Disable all hooks and statusLine execution"),
            defaultShell: h
              .enum(["bash", "powershell"])
              .optional()
              .describe(
                "Default shell for input-box ! commands. Defaults to 'bash' on all platforms (no Windows auto-flip).",
              ),
            allowManagedHooksOnly: h
              .boolean()
              .optional()
              .describe(
                "When true (and set in managed settings), only hooks from managed settings run. User, project, and local hooks are ignored.",
              ),
            allowedHttpHookUrls: h
              .array(h.string())
              .optional()
              .describe(
                'Allowlist of URL patterns that HTTP hooks may target. Supports * as a wildcard (e.g. "https://hooks.example.com/*"). When set, HTTP hooks with non-matching URLs are blocked. If undefined, all URLs are allowed. If empty array, no HTTP hooks are allowed. Arrays merge across settings sources (same semantics as allowedMcpServers).',
              ),
            httpHookAllowedEnvVars: h
              .array(h.string())
              .optional()
              .describe(
                "Allowlist of environment variable names HTTP hooks may interpolate into headers. When set, each hook's effective allowedEnvVars is the intersection with this list. If undefined, no restriction is applied. Arrays merge across settings sources (same semantics as allowedMcpServers).",
              ),
            allowManagedPermissionRulesOnly: h
              .boolean()
              .optional()
              .describe(
                "When true (and set in managed settings), only permission rules (allow/deny/ask) from managed settings are respected. User, project, local, and CLI argument permission rules are ignored.",
              ),
            allowManagedMcpServersOnly: h
              .boolean()
              .optional()
              .describe(
                "When true (and set in managed settings), allowedMcpServers is only read from managed settings. deniedMcpServers still merges from all sources, so users can deny servers for themselves. Users can still add their own MCP servers, but only the admin-defined allowlist applies.",
              ),
            strictPluginOnlyCustomization: h
              .preprocess(
                (H) => (Array.isArray(H) ? H.filter((_) => ajH.includes(_)) : H),
                h.union([h.boolean(), h.array(h.enum(ajH))]),
              )
              .optional()
              .catch(void 0)
              .describe(
                'When set in managed settings, blocks non-plugin customization sources for the listed surfaces. Array form locks specific surfaces (e.g. ["skills", "hooks"]); `true` locks all four; `false` is an explicit no-op. Blocked: ~/.claude/{surface}/, .claude/{surface}/ (project), settings.json hooks, .mcp.json. NOT blocked: managed (policySettings) sources, plugin-provided customizations. ' +
                  "Composes with strictKnownMarketplaces for end-to-end admin control \u2014 plugins gated by " +
                  "marketplace allowlist, everything else blocked here.",
              ),
            statusLine: h
              .object({ type: h.literal("command"), command: h.string(), padding: h.number().optional() })
              .optional()
              .describe("Custom status line display configuration"),
            enabledPlugins: h
              .record(h.string(), h.union([h.array(h.string()), h.boolean(), h.undefined()]))
              .optional()
              .describe(
                'Enabled plugins using plugin-id@marketplace-id format. Example: { "formatter@anthropic-tools": true }. Also supports extended format with version constraints.',
              ),
            extraKnownMarketplaces: h
              .record(h.string(), RA$())
              .check((H) => {
                for (let [_, q] of Object.entries(H.value))
                  if (q.source.source === "settings" && q.source.name !== _)
                    H.issues.push({
                      code: "custom",
                      input: q.source.name,
                      path: [_, "source", "name"],
                      message: `Settings-sourced marketplace name must match its extraKnownMarketplaces key (got key "${_}" but source.name "${q.source.name}")`,
                    });
              })
              .optional()
              .describe(
                "Additional marketplaces to make available for this repository. Typically used in repository .claude/settings.json to ensure team members have required plugin sources.",
              ),
            strictKnownMarketplaces: h
              .array(huH())
              .optional()
              .describe(
                "Enterprise strict list of allowed marketplace sources. When set in managed settings, ONLY these exact sources can be added as marketplaces. The check happens BEFORE downloading, so blocked sources never touch the filesystem. " +
                  "Note: this is a policy gate only \u2014 it does NOT register marketplaces. " +
                  "To pre-register allowed marketplaces for users, also set extraKnownMarketplaces.",
              ),
            blockedMarketplaces: h
              .array(huH())
              .optional()
              .describe(
                "Enterprise blocklist of marketplace sources. When set in managed settings, these exact sources are blocked from being added as marketplaces. The check happens BEFORE downloading, so blocked sources never touch the filesystem.",
              ),
            forceLoginMethod: h
              .enum(["claudeai", "console"])
              .optional()
              .describe('Force a specific login method: "claudeai" for Claude Pro/Max, "console" for Console billing'),
            forceLoginOrgUUID: h.string().optional().describe("Organization UUID to use for OAuth login"),
            otelHeadersHelper: h.string().optional().describe("Path to a script that outputs OpenTelemetry headers"),
            outputStyle: h.string().optional().describe("Controls the output style for assistant responses"),
            language: h
              .string()
              .optional()
              .describe('Preferred language for Claude responses and voice dictation (e.g., "japanese", "spanish")'),
            skipWebFetchPreflight: h
              .boolean()
              .optional()
              .describe(
                "Skip the WebFetch blocklist check for enterprise environments with restrictive security policies",
              ),
            sandbox: DX8().optional(),
            feedbackSurveyRate: h
              .number()
              .min(0)
              .max(1)
              .optional()
              .describe(
                "Probability (0\u20131) that the session quality survey appears when eligible. 0.05 is a reasonable starting point.",
              ),
            spinnerTipsEnabled: h.boolean().optional().describe("Whether to show tips in the spinner"),
            spinnerVerbs: h
              .object({ mode: h.enum(["append", "replace"]), verbs: h.array(h.string()) })
              .optional()
              .describe(
                'Customize spinner verbs. mode: "append" adds verbs to defaults, "replace" uses only your verbs.',
              ),
            spinnerTipsOverride: h
              .object({ excludeDefault: h.boolean().optional(), tips: h.array(h.string()) })
              .optional()
              .describe(
                "Override spinner tips. tips: array of tip strings. excludeDefault: if true, only show custom tips (default: false).",
              ),
            syntaxHighlightingDisabled: h
              .boolean()
              .optional()
              .describe("Whether to disable syntax highlighting in diffs"),
            terminalTitleFromRename: h
              .boolean()
              .optional()
              .describe(
                "Whether /rename updates the terminal tab title (defaults to true). Set to false to keep auto-generated topic titles.",
              ),
            alwaysThinkingEnabled: h
              .boolean()
              .optional()
              .describe(
                "When false, thinking is disabled. When absent or true, thinking is enabled automatically for supported models.",
              ),
            effortLevel: h
              .enum(["low", "medium", "high"])
              .optional()
              .catch(void 0)
              .describe("Persisted effort level for supported models."),
            advisorModel: h.string().optional().describe("Advisor model for the server-side advisor tool."),
            fastMode: h
              .boolean()
              .optional()
              .describe("When true, fast mode is enabled. When absent or false, fast mode is off."),
            fastModePerSessionOptIn: h
              .boolean()
              .optional()
              .describe(
                "When true, fast mode does not persist across sessions. Each session starts with fast mode off.",
              ),
            promptSuggestionEnabled: h
              .boolean()
              .optional()
              .describe(
                "When false, prompt suggestions are disabled. When absent or true, prompt suggestions are enabled.",
              ),
            showClearContextOnPlanAccept: h
              .boolean()
              .optional()
              .describe('When true, the plan-approval dialog offers a "clear context" option. Defaults to false.'),
            agent: h
              .string()
              .optional()
              .describe(
                "Name of an agent (built-in or custom) to use for the main thread. Applies the agent's system prompt, tool restrictions, and model.",
              ),
            companyAnnouncements: h
              .array(h.string())
              .optional()
              .describe(
                "Company announcements to display at startup (one will be randomly selected if multiple are provided)",
              ),
            pluginConfigs: h
              .record(
                h.string(),
                h.object({
                  mcpServers: h
                    .record(
                      h.string(),
                      h.record(h.string(), h.union([h.string(), h.number(), h.boolean(), h.array(h.string())])),
                    )
                    .optional()
                    .describe("User configuration values for MCP servers keyed by server name"),
                  options: h
                    .record(h.string(), h.union([h.string(), h.number(), h.boolean(), h.array(h.string())]))
                    .optional()
                    .describe(
                      "Non-sensitive option values from plugin manifest userConfig, keyed by option name. Sensitive values go to secure storage instead.",
                    ),
                }),
              )
              .optional()
              .describe(
                "Per-plugin configuration including MCP server user configs, keyed by plugin ID (plugin@marketplace format)",
              ),
            remote: h
              .object({
                defaultEnvironmentId: h
                  .string()
                  .optional()
                  .describe("Default environment ID to use for remote sessions"),
              })
              .optional()
              .describe("Remote session configuration"),
            autoUpdatesChannel: h
              .enum(["latest", "stable"])
              .optional()
              .describe("Release channel for auto-updates (latest or stable)"),
            ...{
              disableDeepLinkRegistration: h
                .enum(["disable"])
                .optional()
                .describe("Prevent claude-cli:// protocol handler registration with the OS"),
            },
            minimumVersion: h
              .string()
              .optional()
              .describe("Minimum version to stay on - prevents downgrades when switching to stable channel"),
            plansDirectory: h
              .string()
              .optional()
              .describe(
                "Custom directory for plan files, relative to project root. If not set, defaults to ~/.claude/plans/",
              ),
            ...{},
            ...{},
            ...{ voiceEnabled: h.boolean().optional().describe("Enable voice mode (hold-to-talk dictation)") },
            ...{},
            channelsEnabled: h
              .boolean()
              .optional()
              .describe(
                "Teams/Enterprise opt-in for channel notifications (MCP servers with the claude/channel capability pushing inbound messages). Default off. Set true to allow; users then select servers via --channels.",
              ),
            allowedChannelPlugins: h
              .array(h.object({ marketplace: h.string(), plugin: h.string() }))
              .optional()
              .describe(
                "Teams/Enterprise allowlist of channel plugins. When set, " +
                  "replaces the default Anthropic allowlist \u2014 admins decide which " +
                  "plugins may push inbound messages. Undefined falls back to the default. Requires channelsEnabled: true.",
              ),
            ...{
              defaultView: h
                .enum(["chat", "transcript"])
                .optional()
                .describe("Default transcript view: chat (SendUserMessage checkpoints only) or transcript (full)"),
            },
            prefersReducedMotion: h
              .boolean()
              .optional()
              .describe("Reduce or disable animations for accessibility (spinner shimmer, flash effects, etc.)"),
            autoMemoryEnabled: h
              .boolean()
              .optional()
              .describe(
                "Enable auto-memory for this project. When false, Claude will not read from or write to the auto-memory directory.",
              ),
            autoMemoryDirectory: h
              .string()
              .optional()
              .describe(
                "Custom directory path for auto-memory storage. Supports ~/ prefix for home directory expansion. Ignored if set in projectSettings (checked-in .claude/settings.json) for security. When unset, defaults to ~/.claude/projects/<sanitized-cwd>/memory/.",
              ),
            autoDreamEnabled: h
              .boolean()
              .optional()
              .describe(
                "Enable background memory consolidation (auto-dream). When set, overrides the server-side default.",
              ),
            showThinkingSummaries: h
              .boolean()
              .optional()
              .describe("Show thinking summaries in the transcript view (ctrl+o). Default: false."),
            skipDangerousModePermissionPrompt: h
              .boolean()
              .optional()
              .describe("Whether the user has accepted the bypass permissions mode dialog"),
            ...{
              skipAutoPermissionPrompt: h
                .boolean()
                .optional()
                .describe("Whether the user has accepted the auto mode opt-in dialog"),
              useAutoModeDuringPlan: h
                .boolean()
                .optional()
                .describe("Whether plan mode uses auto mode semantics when auto mode is available (default: true)"),
              autoMode: h
                .object({
                  allow: h.array(h.string()).optional().describe("Rules for the auto mode classifier allow section"),
                  soft_deny: h.array(h.string()).optional().describe("Rules for the auto mode classifier deny section"),
                  ...{},
                  environment: h
                    .array(h.string())
                    .optional()
                    .describe("Entries for the auto mode classifier environment section"),
                })
                .optional()
                .describe("Auto mode classifier prompt customization"),
            },
            disableAutoMode: h.enum(["disable"]).optional().describe("Disable auto mode"),
            sshConfigs: h
              .array(
                h.object({
                  id: h
                    .string()
                    .describe("Unique identifier for this SSH config. Used to match configs across settings sources."),
                  name: h.string().describe("Display name for the SSH connection"),
                  sshHost: h
                    .string()
                    .describe('SSH host in format "user@hostname" or "hostname", or a host alias from ~/.ssh/config'),
                  sshPort: h.number().int().optional().describe("SSH port (default: 22)"),
                  sshIdentityFile: h.string().optional().describe("Path to SSH identity file (private key)"),
                  startDirectory: h
                    .string()
                    .optional()
                    .describe(
                      "Default working directory on the remote host. Supports tilde expansion (e.g. ~/projects). If not specified, defaults to the remote user home directory. Can be overridden by the [dir] positional argument in `claude ssh <config> [dir]`.",
                    ),
                }),
              )
              .optional()
              .describe(
                "SSH connection configurations for remote environments. Typically set in managed settings by enterprise administrators to pre-configure SSH connections for team members.",
              ),
            claudeMdExcludes: h
              .array(h.string())
              .optional()
              .describe(
                'Glob patterns or absolute paths of CLAUDE.md files to exclude from loading. Patterns are matched against absolute file paths using picomatch. Only applies to User, Project, and Local memory types (Managed/policy files cannot be excluded). Examples: "/home/user/monorepo/CLAUDE.md", "**/code/CLAUDE.md", "**/some-dir/.claude/rules/**"',
              ),
            pluginTrustMessage: h
              .string()
              .optional()
              .describe(
                'Custom message to append to the plugin trust warning shown before installation. Only read from policy settings (managed-settings.json / MDM). Useful for enterprise administrators to add organization-specific context (e.g., "All plugins from our internal marketplace are vetted and approved.").',
              ),
          })
          .passthrough(),
      ));
