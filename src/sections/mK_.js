    UjH();
    x8();
    uK_();
    xK_ = pH(() =>
      h
        .string()
        .optional()
        .describe(
          'Permission rule syntax to filter when this hook runs (e.g., "Bash(git *)"). Only runs if the tool call matches the pattern. Avoids spawning hooks for non-matching commands.',
        ),
    );
    (kX8 = pH(() => {
      let { BashCommandHookSchema: H, PromptHookSchema: _, AgentHookSchema: q, HttpHookSchema: $ } = Iz$();
      return h.discriminatedUnion("type", [H, _, q, $]);
    })),
      (vX8 = pH(() =>
        h.object({
          matcher: h.string().optional().describe('String pattern to match (e.g. tool names like "Write")'),
          hooks: h.array(kX8()).describe("List of hooks to execute when the matcher matches"),
        }),
      )),
      (eV = pH(() => h.partialRecord(h.enum(sp), h.array(vX8()))));
