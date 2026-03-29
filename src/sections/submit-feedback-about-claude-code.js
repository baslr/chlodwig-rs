    LW();
    g_();
    (ut1 = {
      aliases: ["bug"],
      type: "local-jsx",
      name: "feedback",
      description: "Submit feedback about Claude Code",
      argumentHint: "[report]",
      isEnabled: () =>
        !(
          lH(process.env.CLAUDE_CODE_USE_BEDROCK) ||
          lH(process.env.CLAUDE_CODE_USE_VERTEX) ||
          lH(process.env.CLAUDE_CODE_USE_FOUNDRY) ||
          lH(process.env.DISABLE_FEEDBACK_COMMAND) ||
          lH(process.env.DISABLE_BUG_COMMAND) ||
          IT() ||
          !1 ||
          !YA("allow_product_feedback")
        ),
      load: () => Promise.resolve().then(() => (tT9(), sT9)),
    }),
      (D68 = ut1);
