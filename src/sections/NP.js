    x8();
    k_();
    H_();
    g_();
    h_();
    j9();
    l$();
    F_();
    cw();
    l5();
    (uhH = require("fs")),
      (Zm = require("fs/promises")),
      (IhH = require("path")),
      (Bm1 = pH(() =>
        h.strictObject({
          operation: h
            .enum(["spawnTeam", "cleanup"])
            .describe("Operation: spawnTeam to create a team, cleanup to remove team and task directories."),
          agent_type: h
            .string()
            .optional()
            .describe(
              'Type/role of the team lead (e.g., "researcher", "test-runner"). Used for team file and inter-agent coordination.',
            ),
          team_name: h.string().optional().describe("Name for the new team to create (required for spawnTeam)."),
          description: h.string().optional().describe("Team description/purpose (only used with spawnTeam)."),
        }),
      ));
