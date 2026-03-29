    u78();
    (e1K = {
      type: "prompt",
      name: "review",
      description: "Review a pull request",
      progressMessage: "reviewing pull request",
      contentLength: 0,
      source: "builtin",
      async getPromptForCommand(H) {
        return [{ type: "text", text: t1K(H) }];
      },
    }),
      (lX9 = {
        type: "local-jsx",
        name: "ultrareview",
        description: `~10\u201320 min \xB7 Finds and verifies bugs in your branch. Runs in Claude Code on the web. See ${s1K}`,
        isEnabled: () => i6_(),
        load: () => Promise.resolve().then(() => (QX9(), UX9)),
      }),
      (fl_ = e1K);
