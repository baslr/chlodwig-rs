    y__();
    g_();
    (j8K = {
      type: "prompt",
      name: "init",
      get description() {
        return lH(process.env.CLAUDE_CODE_NEW_INIT)
          ? "Initialize new CLAUDE.md file(s) and optional skills/hooks with codebase documentation"
          : "Initialize a new CLAUDE.md file with codebase documentation";
      },
      contentLength: 0,
      progressMessage: "analyzing your codebase",
      source: "builtin",
      async getPromptForCommand() {
        return GVH(), [{ type: "text", text: lH(process.env.CLAUDE_CODE_NEW_INIT) ? D8K : Y8K }];
      },
    }),
      (lw9 = j8K);
