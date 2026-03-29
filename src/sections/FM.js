    u7();
    x8();
    ww();
    L_();
    H1H();
    H_();
    lX();
    g_();
    Bk();
    N_();
    ti();
    yJ();
    zv_();
    HS();
    F_();
    MO();
    Vw();
    aX();
    wx();
    J47();
    N47();
    (h47 = require("path")),
      (y47 = pH(() => h.union([h.string(), h.record(h.string(), tp())]))),
      (V47 = pH(() =>
        h.object({
          description: h.string().min(1, "Description cannot be empty"),
          tools: h.array(h.string()).optional(),
          disallowedTools: h.array(h.string()).optional(),
          prompt: h.string().min(1, "Prompt cannot be empty"),
          model: h
            .string()
            .trim()
            .min(1, "Model cannot be empty")
            .transform((H) => (H.toLowerCase() === "inherit" ? "inherit" : H))
            .optional(),
          effort: h.union([h.enum(Ay), h.number().int()]).optional(),
          permissionMode: h.enum(h0).optional(),
          mcpServers: h.array(y47()).optional(),
          hooks: eV().optional(),
          maxTurns: h.number().int().positive().optional(),
          skills: h.array(h.string()).optional(),
          initialPrompt: h.string().optional(),
          memory: h.enum(["user", "project", "local"]).optional(),
          background: h.boolean().optional(),
          isolation: h.enum(["worktree"]).optional(),
        }),
      )),
      (yQ4 = pH(() => h.record(h.string(), V47())));
    lE = $6(async (H) => {
      if (lH(process.env.CLAUDE_CODE_SIMPLE)) {
        let _ = wv_();
        return { activeAgents: _, allAgents: _ };
      }
      try {
        let _ = await si("agents", H),
          q = [],
          $ = _.map(({ filePath: f, baseDir: w, frontmatter: Y, content: D, source: j }) => {
            let M = E47(f, w, Y, D, j);
            if (!M) {
              if (!Y.name) return null;
              let J = VQ4(Y);
              return (
                q.push({ path: f, error: J }),
                N(`Failed to parse agent from ${f}: ${J}`),
                Q("tengu_agent_parse_error", { error: J, location: j }),
                null
              );
            }
            return M;
          }).filter((f) => f !== null),
          O = await ilH(),
          z = [...wv_(), ...O, ...$],
          A = tk(z);
        for (let f of A) if (f.color) YTH(f.agentType, f.color);
        return { activeAgents: A, allAgents: z, failedFiles: q.length > 0 ? q : void 0 };
      } catch (_) {
        let q = _ instanceof Error ? _.message : String(_);
        N(`Error loading agent definitions: ${q}`), AH(_);
        let $ = wv_();
        return { activeAgents: $, allAgents: $, failedFiles: [{ path: "unknown", error: q }] };
      }
    });
