    (kA$ = [
      {
        matches: (H) => H.path === "permissions.defaultMode" && H.code === "invalid_value",
        tip: {
          suggestion:
            'Valid modes: "acceptEdits" (ask before file changes), "plan" (analysis only), "bypassPermissions" (auto-accept all), or "default" (standard behavior)',
          docLink: "https://code.claude.com/docs/en/iam#permission-modes",
        },
      },
      {
        matches: (H) => H.path === "apiKeyHelper" && H.code === "invalid_type",
        tip: {
          suggestion:
            'Provide a shell command that outputs your API key to stdout. The script should output only the API key. Example: "/bin/generate_temp_api_key.sh"',
        },
      },
      {
        matches: (H) => H.path === "cleanupPeriodDays" && H.code === "too_small" && H.expected === "0",
        tip: {
          suggestion:
            "Must be 0 or greater. Set a positive number for days to retain transcripts (default is 30). Setting 0 disables session persistence entirely: no transcripts are written and existing transcripts are deleted at startup.",
        },
      },
      {
        matches: (H) => H.path.startsWith("env.") && H.code === "invalid_type",
        tip: {
          suggestion:
            'Environment variables must be strings. Wrap numbers and booleans in quotes. Example: "DEBUG": "true", "PORT": "3000"',
          docLink: "https://code.claude.com/docs/en/settings#environment-variables",
        },
      },
      {
        matches: (H) =>
          (H.path === "permissions.allow" || H.path === "permissions.deny") &&
          H.code === "invalid_type" &&
          H.expected === "array",
        tip: {
          suggestion:
            'Permission rules must be in an array. Format: ["Tool(specifier)"]. Examples: ["Bash(npm run build)", "Edit(docs/**)", "Read(~/.zshrc)"]. Use * for wildcards.',
        },
      },
      {
        matches: (H) => H.path.includes("hooks") && H.code === "invalid_type",
        tip: {
          suggestion:
            'Hooks use a matcher + hooks array. The matcher is a string: a tool name ("Bash"), pipe-separated list ("Edit|Write"), or empty to match all. Example: {"PostToolUse": [{"matcher": "Edit|Write", "hooks": [{"type": "command", "command": "echo Done"}]}]}',
        },
      },
      {
        matches: (H) => H.code === "invalid_type" && H.expected === "boolean",
        tip: { suggestion: 'Use true or false without quotes. Example: "includeCoAuthoredBy": true' },
      },
      {
        matches: (H) => H.code === "unrecognized_keys",
        tip: {
          suggestion: "Check for typos or refer to the documentation for valid fields",
          docLink: "https://code.claude.com/docs/en/settings",
        },
      },
      { matches: (H) => H.code === "invalid_value" && H.enumValues !== void 0, tip: { suggestion: void 0 } },
      {
        matches: (H) => H.code === "invalid_type" && H.expected === "object" && H.received === null && H.path === "",
        tip: {
          suggestion:
            "Check for missing commas, unmatched brackets, or trailing commas. Use a JSON validator to identify the exact syntax error.",
        },
      },
      {
        matches: (H) => H.path === "permissions.additionalDirectories" && H.code === "invalid_type",
        tip: {
          suggestion:
            'Must be an array of directory paths. Example: ["~/projects", "/tmp/workspace"]. You can also use --add-dir flag or /add-dir command',
          docLink: "https://code.claude.com/docs/en/iam#working-directories",
        },
      },
    ]),
      (vA$ = {
        permissions: "https://code.claude.com/docs/en/iam#configuring-permissions",
        env: "https://code.claude.com/docs/en/settings#environment-variables",
        hooks: "https://code.claude.com/docs/en/hooks",
      });
