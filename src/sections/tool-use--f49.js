    x8();
    k_();
    L_();
    uO();
    I8();
    H7();
    F_();
    rC();
    NP();
    OeH();
    cw();
    JV_();
    ul1 = pH(() =>
      h.strictObject({
        team_name: h.string().describe("Name for the new team to create."),
        description: h.string().optional().describe("Team description/purpose."),
        agent_type: h
          .string()
          .optional()
          .describe(
            'Type/role of the team lead (e.g., "researcher", "test-runner"). Used for team file and inter-agent coordination.',
          ),
      }),
    );
    ml1 = {
      name: Qx,
      searchHint: "create a multi-agent swarm team",
      maxResultSizeChars: 1e5,
      shouldDefer: !0,
      userFacingName() {
        return "";
      },
      get inputSchema() {
        return ul1();
      },
      isEnabled() {
        return dq();
      },
      isConcurrencySafe(H) {
        return !1;
      },
      isReadOnly(H) {
        return !1;
      },
      toAutoClassifierInput(H) {
        return H.team_name;
      },
      async checkPermissions(H, _) {
        return { behavior: "allow", updatedInput: H };
      },
      async validateInput(H, _) {
        if (!H.team_name || H.team_name.trim().length === 0)
          return { result: !1, message: "team_name is required for TeamCreate", errorCode: 9 };
        return { result: !0 };
      },
      async description() {
        return "Create a new team for coordinating multiple agents";
      },
      async prompt() {
        return T49();
      },
      mapToolResultToToolResultBlockParam(H, _) {
        return { tool_use_id: _, type: "tool_result", content: [{ type: "text", text: gH(H) }] };
      },
      async call(H, _) {
        let { setAppState: q, getAppState: $ } = _,
          { team_name: K, description: O, agent_type: T } = H,
          z = $(),
          A = z.teamContext?.teamName;
        if (A)
          throw Error(
            `Already leading team "${A}". A leader can only manage one team at a time. Use TeamDelete to end the current team before creating a new one.`,
          );
        let f = xl1(K),
          w = ty(x5, f),
          Y = T || x5,
          D = s9(z.mainLoopModelForSession ?? z.mainLoopModel ?? LX()),
          j = OF(f),
          M = {
            name: f,
            description: O,
            createdAt: Date.now(),
            leadAgentId: w,
            leadSessionId: v_(),
            members: [
              {
                agentId: w,
                name: x5,
                agentType: Y,
                model: D,
                joinedAt: Date.now(),
                tmuxPaneId: "",
                cwd: X_(),
                subscriptions: [],
              },
            ],
          };
        await B7H(f, M), fo6(f);
        let J = p7H(f);
        return (
          await EC_(J),
          await CC_(J),
          VE7(p7H(f)),
          q((P) => ({
            ...P,
            teamContext: {
              teamName: f,
              teamFilePath: j,
              leadAgentId: w,
              teammates: {
                [w]: {
                  name: x5,
                  agentType: Y,
                  color: Po(w),
                  tmuxSessionName: "",
                  tmuxPaneId: "",
                  cwd: X_(),
                  spawnedAt: Date.now(),
                },
              },
            },
          })),
          Q("tengu_team_created", { team_name: f, teammate_count: 1, lead_agent_type: Y, teammate_mode: qo6() }),
          { data: { team_name: f, team_file_path: j, lead_agent_id: w } }
        );
      },
      renderToolUseMessage: z49,
    };
