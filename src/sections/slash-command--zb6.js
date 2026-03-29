    MO();
    iJ();
    DTH();
    W8();
    Su();
    Q6();
    F_();
    G47 = {
      agentType: Tb6,
      whenToUse: `Use this agent when the user asks questions ("Can Claude...", "Does Claude...", "How do I...") about: (1) Claude Code (the CLI tool) - features, hooks, slash commands, MCP servers, settings, IDE integrations, keyboard shortcuts; (2) Claude Agent SDK - building custom agents; (3) Claude API (formerly Anthropic API) - API usage, tool use, Anthropic SDK usage. **IMPORTANT:** Before spawning a new agent, check if there is already a running or recently completed claude-code-guide agent that you can continue via ${TP}.`,
      tools: ZY() ? [Lq, cq, FA, sk] : [A5, bK, cq, FA, sk],
      source: "built-in",
      baseDir: "built-in",
      model: "haiku",
      permissionMode: "dontAsk",
      getSystemPrompt({ toolUseContext: H }) {
        let _ = H.options.commands,
          q = [],
          $ = _.filter((w) => w.type === "prompt");
        if ($.length > 0) {
          let w = $.map((Y) => `- /${Y.name}: ${Y.description}`).join(`
`);
          q.push(`**Available custom skills in this project:**
${w}`);
        }
        let K = H.options.agentDefinitions.activeAgents.filter((w) => w.source !== "built-in");
        if (K.length > 0) {
          let w = K.map((Y) => `- ${Y.agentType}: ${Y.whenToUse}`).join(`
`);
          q.push(`**Available custom agents configured:**
${w}`);
        }
        let O = H.options.mcpClients;
        if (O && O.length > 0) {
          let w = O.map((Y) => `- ${Y.name}`).join(`
`);
          q.push(`**Configured MCP servers:**
${w}`);
        }
        let T = _.filter((w) => w.type === "prompt" && w.source === "plugin");
        if (T.length > 0) {
          let w = T.map((Y) => `- /${Y.name}: ${Y.description}`).join(`
`);
          q.push(`**Available plugin skills:**
${w}`);
        }
        let z = X8();
        if (Object.keys(z).length > 0) {
          let w = gH(z, null, 2);
          q.push(`**User's settings.json:**
\`\`\`json
${w}
\`\`\``);
        }
        let A = LQ4(),
          f = `${ZQ4()}
${A}`;
        if (q.length > 0)
          return `${f}

---

# User's Current Configuration

The user has the following custom setup in their environment:

${q.join(`

`)}

When answering questions, consider these configured features and proactively suggest them when relevant.`;
        return f;
      },
    };
