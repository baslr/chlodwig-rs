    CO();
    (wzK = {
      type: "prompt",
      description: "Set up Claude Code's status line UI",
      contentLength: 0,
      aliases: [],
      name: "statusline",
      progressMessage: "setting up statusLine",
      allowedTools: [M7, "Read(~/**)", "Edit(~/.claude/settings.json)"],
      source: "builtin",
      disableNonInteractive: !0,
      async getPromptForCommand(H) {
        let _ = H.trim() || "Configure my statusLine from my shell PS1 configuration";
        return [{ type: "text", text: `Create an ${M7} with subagent_type "statusline-setup" and the prompt "${_}"` }];
      },
    }),
      (j$8 = wzK);
