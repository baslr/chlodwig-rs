    x8();
    mK_();
    H1H();
    (YI = new Set([
      "claude-code-marketplace",
      "claude-code-plugins",
      "claude-plugins-official",
      "anthropic-marketplace",
      "anthropic-plugins",
      "agent-skills",
      "life-sciences",
      "knowledge-work-plugins",
    ])),
      (Fz$ = new Set(["knowledge-work-plugins"]));
    (Uz$ =
      /(?:official[^a-z0-9]*(anthropic|claude)|(?:anthropic|claude)[^a-z0-9]*official|^(?:anthropic|claude)[^a-z0-9]*(marketplace|plugins|official))/i),
      (Qz$ = /[^\u0020-\u007E]/);
    (GQ = pH(() => h.string().startsWith("./"))),
      (ljH = pH(() => GQ().endsWith(".json"))),
      (yX8 = pH(() =>
        h.union([
          GQ()
            .refine((H) => H.endsWith(".mcpb") || H.endsWith(".dxt"), {
              message: "MCPB file path must end with .mcpb or .dxt",
            })
            .describe("Path to MCPB file relative to plugin root"),
          h
            .string()
            .url()
            .refine((H) => H.endsWith(".mcpb") || H.endsWith(".dxt"), {
              message: "MCPB URL must end with .mcpb or .dxt",
            })
            .describe("URL to MCPB file"),
        ]),
      )),
      (Z96 = pH(() => GQ().endsWith(".md"))),
      (L96 = pH(() => h.union([Z96(), GQ()]))),
      (EX8 = pH(() =>
        h
          .string()
          .min(1, "Marketplace must have a name")
          .refine((H) => !H.includes(" "), {
            message: 'Marketplace name cannot contain spaces. Use kebab-case (e.g., "my-marketplace")',
          })
          .refine((H) => !H.includes("/") && !H.includes("\\") && !H.includes("..") && H !== ".", {
            message: 'Marketplace name cannot contain path separators (/ or \\), ".." sequences, or be "."',
          })
          .refine((H) => !lz$(H), { message: "Marketplace name impersonates an official Anthropic/Claude marketplace" })
          .refine((H) => H.toLowerCase() !== "inline", {
            message: 'Marketplace name "inline" is reserved for --plugin-dir session plugins',
          })
          .refine((H) => H.toLowerCase() !== "builtin", {
            message: 'Marketplace name "builtin" is reserved for built-in plugins',
          }),
      )),
      (k96 = pH(() =>
        h.object({
          name: h
            .string()
            .min(1, "Author name cannot be empty")
            .describe("Display name of the plugin author or organization"),
          email: h.string().optional().describe("Contact email for support or feedback"),
          url: h.string().optional().describe("Website, GitHub profile, or organization URL"),
        }),
      )),
      (iz$ = pH(() =>
        h.object({
          name: h
            .string()
            .min(1, "Plugin name cannot be empty")
            .refine((H) => !H.includes(" "), {
              message: 'Plugin name cannot contain spaces. Use kebab-case (e.g., "my-plugin")',
            })
            .describe("Unique identifier for the plugin, used for namespacing (prefer kebab-case)"),
          version: h.string().optional().describe("Semantic version (e.g., 1.2.3) following semver.org specification"),
          description: h.string().optional().describe("Brief, user-facing explanation of what the plugin provides"),
          author: k96().optional().describe("Information about the plugin creator or maintainer"),
          homepage: h.string().url().optional().describe("Plugin homepage or documentation URL"),
          repository: h.string().optional().describe("Source code repository URL"),
          license: h.string().optional().describe("SPDX license identifier (e.g., MIT, Apache-2.0)"),
          keywords: h.array(h.string()).optional().describe("Tags for plugin discovery and categorization"),
          dependencies: h
            .array(zA$())
            .optional()
            .describe(
              `Plugins that must be enabled for this plugin to function. Bare names (no "@marketplace") are resolved against the declaring plugin's own marketplace.`,
            ),
        }),
      )),
      (BK_ = pH(() =>
        h.object({
          description: h.string().optional().describe("Brief, user-facing explanation of what these hooks provide"),
          hooks: h
            .lazy(() => eV())
            .describe("The hooks provided by the plugin, in the same format as the one used for settings"),
        }),
      )),
      (nz$ = pH(() =>
        h.object({
          hooks: h.union([
            ljH().describe(
              "Path to file with additional hooks (in addition to those in hooks/hooks.json, if it exists), relative to the plugin root",
            ),
            h.lazy(() => eV()).describe("Additional hooks (in addition to those in hooks/hooks.json, if it exists)"),
            h.array(
              h.union([
                ljH().describe(
                  "Path to file with additional hooks (in addition to those in hooks/hooks.json, if it exists), relative to the plugin root",
                ),
                h
                  .lazy(() => eV())
                  .describe("Additional hooks (in addition to those in hooks/hooks.json, if it exists)"),
              ]),
            ),
          ]),
        }),
      )),
      (rz$ = pH(() =>
        h
          .object({
            source: L96().optional().describe("Path to command markdown file, relative to plugin root"),
            content: h.string().optional().describe("Inline markdown content for the command"),
            description: h.string().optional().describe("Command description override"),
            argumentHint: h.string().optional().describe('Hint for command arguments (e.g., "[file]")'),
            model: h.string().optional().describe("Default model for this command"),
            allowedTools: h.array(h.string()).optional().describe("Tools allowed when command runs"),
          })
          .refine((H) => (H.source && !H.content) || (!H.source && H.content), {
            message: 'Command must have either "source" (file path) or "content" (inline markdown), but not both',
          }),
      )),
      (oz$ = pH(() =>
        h.object({
          commands: h.union([
            L96().describe(
              "Path to additional command file or skill directory (in addition to those in the commands/ directory, if it exists), relative to the plugin root",
            ),
            h
              .array(
                L96().describe(
                  "Path to additional command file or skill directory (in addition to those in the commands/ directory, if it exists), relative to the plugin root",
                ),
              )
              .describe("List of paths to additional command files or skill directories"),
            h
              .record(h.string(), rz$())
              .describe(
                'Object mapping of command names to their metadata and source files. Command name becomes the slash command name (e.g., "about" \u2192 "/plugin:about")',
              ),
          ]),
        }),
      )),
      (az$ = pH(() =>
        h.object({
          agents: h.union([
            Z96().describe(
              "Path to additional agent file (in addition to those in the agents/ directory, if it exists), relative to the plugin root",
            ),
            h
              .array(
                Z96().describe(
                  "Path to additional agent file (in addition to those in the agents/ directory, if it exists), relative to the plugin root",
                ),
              )
              .describe("List of paths to additional agent files"),
          ]),
        }),
      )),
      (sz$ = pH(() =>
        h.object({
          skills: h.union([
            GQ().describe(
              "Path to additional skill directory (in addition to those in the skills/ directory, if it exists), relative to the plugin root",
            ),
            h
              .array(
                GQ().describe(
                  "Path to additional skill directory (in addition to those in the skills/ directory, if it exists), relative to the plugin root",
                ),
              )
              .describe("List of paths to additional skill directories"),
          ]),
        }),
      )),
      (tz$ = pH(() =>
        h.object({
          outputStyles: h.union([
            GQ().describe(
              "Path to additional output styles directory or file (in addition to those in the output-styles/ directory, if it exists), relative to the plugin root",
            ),
            h
              .array(
                GQ().describe(
                  "Path to additional output styles directory or file (in addition to those in the output-styles/ directory, if it exists), relative to the plugin root",
                ),
              )
              .describe("List of paths to additional output styles directories or files"),
          ]),
        }),
      )),
      (VX8 = pH(() => h.string().min(1))),
      (ez$ = pH(() =>
        h
          .string()
          .min(2)
          .refine((H) => H.startsWith("."), { message: 'File extensions must start with dot (e.g., ".ts", not "ts")' }),
      )),
      (HA$ = pH(() =>
        h.object({
          mcpServers: h.union([
            ljH().describe(
              "MCP servers to include in the plugin (in addition to those in the .mcp.json file, if it exists)",
            ),
            yX8().describe("Path or URL to MCPB file containing MCP server configuration"),
            h.record(h.string(), tp()).describe("MCP server configurations keyed by server name"),
            h
              .array(
                h.union([
                  ljH().describe("Path to MCP servers configuration file"),
                  yX8().describe("Path or URL to MCPB file"),
                  h.record(h.string(), tp()).describe("Inline MCP server configurations"),
                ]),
              )
              .describe("Array of MCP server configurations (paths, MCPB files, or inline definitions)"),
          ]),
        }),
      )),
      (CX8 = pH(() =>
        h
          .object({
            type: h
              .enum(["string", "number", "boolean", "directory", "file"])
              .describe("Type of the configuration value"),
            title: h.string().describe("Human-readable label shown in the config dialog"),
            description: h.string().describe("Help text shown beneath the field in the config dialog"),
            required: h.boolean().optional().describe("If true, validation fails when this field is empty"),
            default: h
              .union([h.string(), h.number(), h.boolean(), h.array(h.string())])
              .optional()
              .describe("Default value used when the user provides nothing"),
            multiple: h.boolean().optional().describe("For string type: allow an array of strings"),
            sensitive: h
              .boolean()
              .optional()
              .describe(
                "If true, masks dialog input and stores value in secure storage (keychain/credentials file) instead of settings.json",
              ),
            min: h.number().optional().describe("Minimum value (number type only)"),
            max: h.number().optional().describe("Maximum value (number type only)"),
          })
          .strict(),
      )),
      (_A$ = pH(() =>
        h.object({
          userConfig: h
            .record(
              h
                .string()
                .regex(
                  /^[A-Za-z_]\w*$/,
                  "Option keys must be valid identifiers (letters, digits, underscore; no leading digit) \u2014 they become CLAUDE_PLUGIN_OPTION_<KEY> env vars in hooks",
                ),
              CX8(),
            )
            .optional()
            .describe(
              "User-configurable values this plugin needs. Prompted at enable time. Non-sensitive values saved to settings.json; sensitive values to secure storage (macOS keychain or .credentials.json). Available as ${user_config.KEY} in MCP/LSP server config, hook commands, and (non-sensitive only) skill/agent content. " +
                "Note: sensitive values share a single keychain entry with OAuth tokens \u2014 keep " +
                "secret counts small to stay under the ~2KB stdin-safe limit (see INC-3028).",
            ),
        }),
      )),
      (qA$ = pH(() =>
        h.object({
          channels: h
            .array(
              h
                .object({
                  server: h
                    .string()
                    .min(1)
                    .describe(
                      "Name of the MCP server this channel binds to. Must match a key in this plugin's mcpServers.",
                    ),
                  displayName: h
                    .string()
                    .optional()
                    .describe(
                      'Human-readable name shown in the config dialog title (e.g., "Telegram"). Defaults to the server name.',
                    ),
                  userConfig: h
                    .record(h.string(), CX8())
                    .optional()
                    .describe(
                      "Fields to prompt the user for when enabling this plugin in assistant mode. Saved values are substituted into ${user_config.KEY} references in the mcpServers env.",
                    ),
                })
                .strict(),
            )
            .describe(
              "Channels this plugin provides. Each entry declares an MCP server as a message channel and optionally specifies user configuration to prompt for at enable time.",
            ),
        }),
      )),
      (ijH = pH(() =>
        h.strictObject({
          command: h
            .string()
            .min(1)
            .refine(
              (H) => {
                if (H.includes(" ") && !H.startsWith("/")) return !1;
                return !0;
              },
              { message: "Command should not contain spaces. Use args array for arguments." },
            )
            .describe('Command to execute the LSP server (e.g., "typescript-language-server")'),
          args: h.array(VX8()).optional().describe("Command-line arguments to pass to the server"),
          extensionToLanguage: h
            .record(ez$(), VX8())
            .refine((H) => Object.keys(H).length > 0, { message: "extensionToLanguage must have at least one mapping" })
            .describe(
              "Mapping from file extension to LSP language ID. File extensions and languages are derived from this mapping.",
            ),
          transport: h.enum(["stdio", "socket"]).default("stdio").describe("Communication transport mechanism"),
          env: h
            .record(h.string(), h.string())
            .optional()
            .describe("Environment variables to set when starting the server"),
          initializationOptions: h
            .unknown()
            .optional()
            .describe("Initialization options passed to the server during initialization"),
          settings: h
            .unknown()
            .optional()
            .describe("Settings passed to the server via workspace/didChangeConfiguration"),
          workspaceFolder: h.string().optional().describe("Workspace folder path to use for the server"),
          startupTimeout: h
            .number()
            .int()
            .positive()
            .optional()
            .describe("Maximum time to wait for server startup (milliseconds)"),
          shutdownTimeout: h
            .number()
            .int()
            .positive()
            .optional()
            .describe("Maximum time to wait for graceful shutdown (milliseconds)"),
          restartOnCrash: h.boolean().optional().describe("Whether to restart the server if it crashes"),
          maxRestarts: h
            .number()
            .int()
            .nonnegative()
            .optional()
            .describe("Maximum number of restart attempts before giving up"),
        }),
      )),
      ($A$ = pH(() =>
        h.object({
          lspServers: h.union([
            ljH().describe("Path to .lsp.json configuration file relative to plugin root"),
            h.record(h.string(), ijH()).describe("LSP server configurations keyed by server name"),
            h
              .array(
                h.union([
                  ljH().describe("Path to LSP configuration file"),
                  h.record(h.string(), ijH()).describe("Inline LSP server configurations"),
                ]),
              )
              .describe("Array of LSP server configurations (paths or inline definitions)"),
          ]),
        }),
      )),
      (bX8 = pH(() =>
        h
          .string()
          .refine((H) => !H.includes("..") && !H.includes("//"), "Package name cannot contain path traversal patterns")
          .refine((H) => {
            let _ = /^@[a-z0-9][a-z0-9-._]*\/[a-z0-9][a-z0-9-._]*$/,
              q = /^[a-z0-9][a-z0-9-._]*$/;
            return _.test(H) || q.test(H);
          }, "Invalid npm package name format"),
      )),
      (KA$ = pH(() =>
        h.object({
          settings: h
            .record(h.string(), h.unknown())
            .optional()
            .describe("Settings to merge when plugin is enabled. Only allowlisted keys are kept (currently: agent)"),
        }),
      )),
      (_1H = pH(() =>
        h.object({
          ...iz$().shape,
          ...nz$().partial().shape,
          ...oz$().partial().shape,
          ...az$().partial().shape,
          ...sz$().partial().shape,
          ...tz$().partial().shape,
          ...qA$().partial().shape,
          ...HA$().partial().shape,
          ...$A$().partial().shape,
          ...KA$().partial().shape,
          ..._A$().partial().shape,
        }),
      )),
      (huH = pH(() =>
        h.discriminatedUnion("source", [
          h.object({
            source: h.literal("url"),
            url: h.string().url().describe("Direct URL to marketplace.json file"),
            headers: h
              .record(h.string(), h.string())
              .optional()
              .describe("Custom HTTP headers (e.g., for authentication)"),
          }),
          h.object({
            source: h.literal("github"),
            repo: h.string().describe("GitHub repository in owner/repo format"),
            ref: h
              .string()
              .optional()
              .describe('Git branch or tag to use (e.g., "main", "v1.0.0"). Defaults to repository default branch.'),
            path: h
              .string()
              .optional()
              .describe("Path to marketplace.json within repo (defaults to .claude-plugin/marketplace.json)"),
            sparsePaths: h
              .array(h.string())
              .optional()
              .describe(
                'Directories to include via git sparse-checkout (cone mode). Use for monorepos where the marketplace lives in a subdirectory. Example: [".claude-plugin", "plugins"]. If omitted, the full repository is cloned.',
              ),
          }),
          h.object({
            source: h.literal("git"),
            url: h.string().describe("Full git repository URL"),
            ref: h
              .string()
              .optional()
              .describe('Git branch or tag to use (e.g., "main", "v1.0.0"). Defaults to repository default branch.'),
            path: h
              .string()
              .optional()
              .describe("Path to marketplace.json within repo (defaults to .claude-plugin/marketplace.json)"),
            sparsePaths: h
              .array(h.string())
              .optional()
              .describe(
                'Directories to include via git sparse-checkout (cone mode). Use for monorepos where the marketplace lives in a subdirectory. Example: [".claude-plugin", "plugins"]. If omitted, the full repository is cloned.',
              ),
          }),
          h.object({ source: h.literal("npm"), package: bX8().describe("NPM package containing marketplace.json") }),
          h.object({ source: h.literal("file"), path: h.string().describe("Local file path to marketplace.json") }),
          h.object({
            source: h.literal("directory"),
            path: h.string().describe("Local directory containing .claude-plugin/marketplace.json"),
          }),
          h.object({
            source: h.literal("hostPattern"),
            hostPattern: h
              .string()
              .describe(
                'Regex pattern to match the host/domain extracted from any marketplace source type. For github sources, matches against "github.com". For git sources (SSH or HTTPS), extracts the hostname from the URL. Use in strictKnownMarketplaces to allow all marketplaces from a specific host (e.g., "^github\\.mycompany\\.com$").',
              ),
          }),
          h.object({
            source: h.literal("pathPattern"),
            pathPattern: h
              .string()
              .describe(
                'Regex pattern matched against the .path field of file and directory sources. Use in strictKnownMarketplaces to allow filesystem-based marketplaces alongside hostPattern restrictions for network sources. Use ".*" to allow all filesystem paths, or a narrower pattern (e.g., "^/opt/approved/") to restrict to specific directories.',
              ),
          }),
          h
            .object({
              source: h.literal("settings"),
              name: EX8()
                .refine((H) => !YI.has(H.toLowerCase()), {
                  message:
                    "Reserved official marketplace names cannot be used with settings sources. validateOfficialNameSource only accepts github/git sources from anthropics/* for these names; a settings source would be rejected after loadAndCacheMarketplace has already written to disk with cleanupNeeded=false.",
                })
                .describe(
                  "Marketplace name. Must match the extraKnownMarketplaces key (enforced); the synthetic manifest is written under this name. Same validation " +
                    "as PluginMarketplaceSchema plus reserved-name rejection \u2014 " +
                    "validateOfficialNameSource runs after the disk write, too late to clean up.",
                ),
              plugins: h.array(OA$()).describe("Plugin entries declared inline in settings.json"),
              owner: k96().optional(),
            })
            .describe(
              "Inline marketplace manifest defined directly in settings.json. The reconciler writes a synthetic marketplace.json to the cache; diffMarketplaces detects edits via isEqual on the stored source (the plugins array is inside this object, so edits surface as sourceChanged).",
            ),
        ]),
      )),
      (R96 = pH(() =>
        h
          .string()
          .length(40)
          .regex(/^[a-f0-9]{40}$/, "Must be a full 40-character lowercase git commit SHA"),
      )),
      (IX8 = pH(() =>
        h.union([
          GQ().describe(
            "Path to the plugin root, relative to the marketplace root (the directory containing .claude-plugin/, not .claude-plugin/ itself)",
          ),
          h
            .object({
              source: h.literal("npm"),
              package: bX8()
                .or(h.string())
                .describe(
                  "Package name (or url, or local path, or anything else that can be passed to `npm` as a package)",
                ),
              version: h.string().optional().describe("Specific version or version range (e.g., ^1.0.0, ~2.1.0)"),
              registry: h
                .string()
                .url()
                .optional()
                .describe("Custom NPM registry URL (defaults to using system default, likely npmjs.org)"),
            })
            .describe("NPM package as plugin source"),
          h
            .object({
              source: h.literal("pip"),
              package: h.string().describe("Python package name as it appears on PyPI"),
              version: h.string().optional().describe("Version specifier (e.g., ==1.0.0, >=2.0.0, <3.0.0)"),
              registry: h
                .string()
                .url()
                .optional()
                .describe("Custom PyPI registry URL (defaults to using system default, likely pypi.org)"),
            })
            .describe("Python package as plugin source"),
          h.object({
            source: h.literal("url"),
            url: h.string().describe("Full git repository URL (https:// or git@)"),
            ref: h
              .string()
              .optional()
              .describe('Git branch or tag to use (e.g., "main", "v1.0.0"). Defaults to repository default branch.'),
            sha: R96().optional().describe("Specific commit SHA to use"),
          }),
          h.object({
            source: h.literal("github"),
            repo: h.string().describe("GitHub repository in owner/repo format"),
            ref: h
              .string()
              .optional()
              .describe('Git branch or tag to use (e.g., "main", "v1.0.0"). Defaults to repository default branch.'),
            sha: R96().optional().describe("Specific commit SHA to use"),
          }),
          h
            .object({
              source: h.literal("git-subdir"),
              url: h.string().describe("Git repository: GitHub owner/repo shorthand, https://, or git@ URL"),
              path: h
                .string()
                .min(1)
                .describe(
                  'Subdirectory within the repo containing the plugin (e.g., "tools/claude-plugin"). Cloned sparsely using partial clone (--filter=tree:0) to minimize bandwidth for monorepos.',
                ),
              ref: h
                .string()
                .optional()
                .describe('Git branch or tag to use (e.g., "main", "v1.0.0"). Defaults to repository default branch.'),
              sha: R96().optional().describe("Specific commit SHA to use"),
            })
            .describe(
              "Plugin located in a subdirectory of a larger repository (monorepo). Only the specified subdirectory is materialized; the rest of the repo is not downloaded.",
            ),
        ]),
      )),
      (OA$ = pH(() =>
        h
          .object({
            name: h
              .string()
              .min(1, "Plugin name cannot be empty")
              .refine((H) => !H.includes(" "), {
                message: 'Plugin name cannot contain spaces. Use kebab-case (e.g., "my-plugin")',
              })
              .describe("Plugin name as it appears in the target repository"),
            source: IX8().describe(
              "Where to fetch the plugin from. Must be a remote source \u2014 relative " +
                "paths have no marketplace repository to resolve against.",
            ),
            description: h.string().optional(),
            version: h.string().optional(),
            strict: h.boolean().optional(),
          })
          .refine((H) => typeof H.source !== "string", {
            message:
              'Plugins in a settings-sourced marketplace must use remote sources (github, git-subdir, npm, url, pip). Relative-path sources like "./foo" have no marketplace repository to resolve against.',
          }),
      ));
    (v96 = pH(() =>
      _1H()
        .partial()
        .extend({
          name: h
            .string()
            .min(1, "Plugin name cannot be empty")
            .refine((H) => !H.includes(" "), {
              message: 'Plugin name cannot contain spaces. Use kebab-case (e.g., "my-plugin")',
            })
            .describe("Unique identifier matching the plugin name"),
          source: IX8().describe("Where to fetch the plugin from"),
          category: h
            .string()
            .optional()
            .describe('Category for organizing plugins (e.g., "productivity", "development")'),
          tags: h.array(h.string()).optional().describe("Tags for searchability and discovery"),
          strict: h
            .boolean()
            .optional()
            .default(!0)
            .describe(
              "Require the plugin manifest to be present in the plugin folder. If false, the marketplace entry provides the manifest.",
            ),
        }),
    )),
      (Lt = pH(() =>
        h.object({
          name: EX8(),
          owner: k96().describe("Marketplace maintainer or curator information"),
          plugins: h.array(v96()).describe("Collection of available plugins in this marketplace"),
          forceRemoveDeletedPlugins: h
            .boolean()
            .optional()
            .describe(
              "When true, plugins removed from this marketplace will be automatically uninstalled and flagged for users",
            ),
          metadata: h
            .object({
              pluginRoot: h.string().optional().describe("Base path for relative plugin sources"),
              version: h.string().optional().describe("Marketplace version"),
              description: h.string().optional().describe("Marketplace description"),
            })
            .optional()
            .describe("Optional marketplace metadata"),
          allowCrossMarketplaceDependenciesOn: h
            .array(h.string())
            .optional()
            .describe(
              "Marketplace names whose plugins may be auto-installed as dependencies. Only the root marketplace's allowlist applies \u2014 no transitive trust.",
            ),
        }),
      )),
      (njH = pH(() =>
        h
          .string()
          .regex(/^[a-z0-9][-a-z0-9._]*@[a-z0-9][-a-z0-9._]*$/i, "Plugin ID must be in format: plugin@marketplace"),
      )),
      (TA$ = /^[a-z0-9][-a-z0-9._]*(@[a-z0-9][-a-z0-9._]*)?(@\^[^@]*)?$/i),
      (zA$ = pH(() =>
        h.union([
          h
            .string()
            .regex(TA$, "Dependency must be a plugin name, optionally qualified with @marketplace")
            .transform((H) => H.replace(/@\^[^@]*$/, "")),
          h
            .object({
              name: h
                .string()
                .min(1)
                .regex(/^[a-z0-9][-a-z0-9._]*$/i),
              marketplace: h
                .string()
                .min(1)
                .regex(/^[a-z0-9][-a-z0-9._]*$/i)
                .optional(),
            })
            .loose()
            .transform((H) => (H.marketplace ? `${H.name}@${H.marketplace}` : H.name)),
        ]),
      )),
      (wrK = pH(() =>
        h.union([
          njH(),
          h.object({
            id: njH().describe('Plugin identifier (e.g., "formatter@tools")'),
            version: h.string().optional().describe('Version constraint (e.g., "^2.0.0")'),
            required: h.boolean().optional().describe("If true, cannot be disabled"),
            config: h.record(h.string(), h.unknown()).optional().describe("Plugin-specific configuration"),
          }),
        ]),
      )),
      (AA$ = pH(() =>
        h.object({
          version: h.string().describe("Currently installed version"),
          installedAt: h.string().describe("ISO 8601 timestamp of installation"),
          lastUpdated: h.string().optional().describe("ISO 8601 timestamp of last update"),
          installPath: h.string().describe("Absolute path to the installed plugin directory"),
          gitCommitSha: h.string().optional().describe("Git commit SHA for git-based plugins (for version tracking)"),
        }),
      )),
      (VuH = pH(() =>
        h.object({
          version: h.literal(1).describe("Schema version 1"),
          plugins: h.record(njH(), AA$()).describe("Map of plugin IDs to their installation metadata"),
        }),
      )),
      (fA$ = pH(() => h.enum(["managed", "user", "project", "local"]))),
      (wA$ = pH(() =>
        h.object({
          scope: fA$().describe("Installation scope"),
          projectPath: h.string().optional().describe("Project path (required for project/local scopes)"),
          installPath: h.string().describe("Absolute path to the versioned plugin directory"),
          version: h.string().optional().describe("Currently installed version"),
          installedAt: h.string().optional().describe("ISO 8601 timestamp of installation"),
          lastUpdated: h.string().optional().describe("ISO 8601 timestamp of last update"),
          gitCommitSha: h.string().optional().describe("Git commit SHA for git-based plugins"),
        }),
      )),
      (SuH = pH(() =>
        h.object({
          version: h.literal(2).describe("Schema version 2"),
          plugins: h.record(njH(), h.array(wA$())).describe("Map of plugin IDs to arrays of installation entries"),
        }),
      )),
      (YrK = pH(() => h.union([VuH(), SuH()]))),
      (YA$ = pH(() =>
        h.object({
          source: huH().describe("Where to fetch the marketplace from"),
          installLocation: h.string().describe("Local cache path where marketplace manifest is stored"),
          lastUpdated: h.string().describe("ISO 8601 timestamp of last marketplace refresh"),
          autoUpdate: h
            .boolean()
            .optional()
            .describe("Whether to automatically update this marketplace and its installed plugins on startup"),
        }),
      )),
      (rjH = pH(() => h.record(h.string(), YA$())));
