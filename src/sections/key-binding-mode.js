    y6();
    b46();
    hH_();
    Fd_();
    Cg();
    wl1 = {
      theme: { source: "global", type: "string", description: "Color theme for the UI", options: pN6 },
      editorMode: { source: "global", type: "string", description: "Key binding mode", options: i5_ },
      verbose: { source: "global", type: "boolean", description: "Show detailed debug output", appStateKey: "verbose" },
      preferredNotifChannel: {
        source: "global",
        type: "string",
        description: "Preferred notification channel",
        options: l5_,
      },
      autoCompactEnabled: { source: "global", type: "boolean", description: "Auto-compact when context is full" },
      autoMemoryEnabled: { source: "settings", type: "boolean", description: "Enable auto-memory" },
      autoDreamEnabled: { source: "settings", type: "boolean", description: "Enable background memory consolidation" },
      fileCheckpointingEnabled: {
        source: "global",
        type: "boolean",
        description: "Enable file checkpointing for code rewind",
      },
      showTurnDuration: {
        source: "global",
        type: "boolean",
        description: 'Show turn duration message after responses (e.g., "Cooked for 1m 6s")',
      },
      terminalProgressBarEnabled: {
        source: "global",
        type: "boolean",
        description: "Show OSC 9;4 progress indicator in supported terminals",
      },
      todoFeatureEnabled: { source: "global", type: "boolean", description: "Enable todo/task tracking" },
      model: {
        source: "settings",
        type: "string",
        description: "Override the default model",
        appStateKey: "mainLoopModel",
        getOptions: () => {
          try {
            return TwH()
              .filter((H) => H.value !== null)
              .map((H) => H.value);
          } catch {
            return ["sonnet", "opus", "haiku"];
          }
        },
        validateOnWrite: (H) => pyH(String(H)),
        formatOnRead: (H) => (H === null ? "default" : H),
      },
      alwaysThinkingEnabled: {
        source: "settings",
        type: "boolean",
        description: "Enable extended thinking (false to disable)",
        appStateKey: "thinkingEnabled",
      },
      "permissions.defaultMode": {
        source: "settings",
        type: "string",
        description: "Default permission mode for tool usage",
        options: ["default", "plan", "acceptEdits", "dontAsk", "auto"],
      },
      language: {
        source: "settings",
        type: "string",
        description: 'Preferred language for Claude responses and voice dictation (e.g., "japanese", "spanish")',
      },
      teammateMode: {
        source: "global",
        type: "string",
        description:
          'How to spawn teammates: "tmux" for traditional tmux, "in-process" for same process, "auto" to choose automatically',
        options: YL8,
      },
      ...{},
      ...{
        voiceEnabled: { source: "settings", type: "boolean", description: "Enable voice dictation (hold-to-talk)" },
      },
      ...{
        remoteControlAtStartup: {
          source: "global",
          type: "boolean",
          description: "Enable Remote Control for all sessions (true | false | default)",
          formatOnRead: () => ut(),
        },
      },
      ...{},
    };
