    x8();
    L_();
    uO();
    F_();
    NP();
    OeH();
    cw();
    j49();
    (pl1 = pH(() => h.strictObject({}))),
      (Bl1 = {
        name: OAH,
        searchHint: "disband a swarm team and clean up",
        maxResultSizeChars: 1e5,
        shouldDefer: !0,
        userFacingName() {
          return "";
        },
        get inputSchema() {
          return pl1();
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
        toAutoClassifierInput() {
          return "";
        },
        async checkPermissions(H, _) {
          return { behavior: "allow", updatedInput: H };
        },
        async description() {
          return "Clean up team and task directories when the swarm is complete";
        },
        async prompt() {
          return w49();
        },
        mapToolResultToToolResultBlockParam(H, _) {
          return { tool_use_id: _, type: "tool_result", content: [{ type: "text", text: gH(H) }] };
        },
        async call(H, _) {
          let { setAppState: q, getAppState: $ } = _,
            O = $().teamContext?.teamName;
          if (O) {
            let T = Qw(O);
            if (T) {
              let A = T.members.filter((f) => f.name !== x5).filter((f) => f.isActive !== !1);
              if (A.length > 0) {
                let f = A.map((w) => w.name).join(", ");
                return {
                  data: {
                    success: !1,
                    message: `Cannot cleanup team with ${A.length} active member(s): ${f}. Use requestShutdown to gracefully terminate teammates first.`,
                    team_name: O,
                  },
                };
              }
            }
            await RB_(O), wo6(O), La7(), SE7(), Q("tengu_team_deleted", { team_name: O });
          }
          return (
            q((T) => ({ ...T, teamContext: void 0, inbox: { messages: [] } })),
            {
              data: {
                success: !0,
                message: O
                  ? `Cleaned up directories and worktrees for team "${O}"`
                  : "No team name found, nothing to clean up",
                team_name: O,
              },
            }
          );
        },
        renderToolUseMessage: Y49,
        renderToolResultMessage: D49,
      });
