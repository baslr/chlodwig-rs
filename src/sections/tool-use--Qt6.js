    x8();
    k_();
    uY();
    Nj();
    z9H();
    F99();
    i99();
    (QQ1 = pH(() => h.strictObject({}))),
      (lQ1 = pH(() => h.object({ message: h.string().describe("Confirmation that plan mode was entered") }))),
      (kH_ = {
        name: SqH,
        searchHint: "switch to plan mode to design an approach before coding",
        maxResultSizeChars: 1e5,
        async description() {
          return "Requests permission to enter plan mode for complex tasks requiring exploration and design";
        },
        async prompt() {
          return c99();
        },
        get inputSchema() {
          return QQ1();
        },
        get outputSchema() {
          return lQ1();
        },
        userFacingName() {
          return "";
        },
        shouldDefer: !0,
        isEnabled() {
          if (OD().length > 0) return !1;
          return !0;
        },
        isConcurrencySafe() {
          return !0;
        },
        isReadOnly() {
          return !0;
        },
        toAutoClassifierInput() {
          return "";
        },
        async checkPermissions(H) {
          return { behavior: "allow", updatedInput: H };
        },
        renderToolUseMessage: U99,
        renderToolResultMessage: Q99,
        renderToolUseRejectedMessage: l99,
        async call(H, _) {
          if (_.agentId) throw Error("EnterPlanMode tool cannot be used in agent contexts");
          let q = _.getAppState();
          return (
            lU(q.toolPermissionContext.mode, "plan"),
            _.setAppState(($) => ({
              ...$,
              toolPermissionContext: JO(VyH($.toolPermissionContext), {
                type: "setMode",
                mode: "plan",
                destination: "session",
              }),
            })),
            {
              data: {
                message:
                  "Entered plan mode. You should now focus on exploring the codebase and designing an implementation approach.",
              },
            }
          );
        },
        mapToolResultToToolResultBlockParam({ message: H }, _) {
          return {
            type: "tool_result",
            content: rf()
              ? `${H}

DO NOT write or edit any files except the plan file. Detailed workflow instructions will follow.`
              : `${H}

In plan mode, you should:
1. Thoroughly explore the codebase to understand existing patterns
2. Identify similar features and architectural approaches
3. Consider multiple approaches and their trade-offs
4. Use AskUserQuestion if you need to clarify the approach
5. Design a concrete implementation strategy
6. When ready, use ExitPlanMode to present your plan for approval

Remember: DO NOT write or edit any files yet. This is a read-only exploration and planning phase.`,
            tool_use_id: _,
          };
        },
      });
