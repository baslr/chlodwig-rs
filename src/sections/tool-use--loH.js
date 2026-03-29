    x8();
    k_();
    t6();
    cw();
    mc6();
    CO();
    pE7();
    (BJ1 = pH(() => h.strictObject({ todos: wvH().describe("The updated todo list") }))),
      (gJ1 = pH(() =>
        h.object({
          oldTodos: wvH().describe("The todo list before the update"),
          newTodos: wvH().describe("The todo list after the update"),
          verificationNudgeNeeded: h.boolean().optional(),
        }),
      )),
      (Fx = {
        name: yC,
        searchHint: "manage the session task checklist",
        maxResultSizeChars: 1e5,
        strict: !0,
        async description() {
          return mE7;
        },
        async prompt() {
          return xE7;
        },
        get inputSchema() {
          return BJ1();
        },
        get outputSchema() {
          return gJ1();
        },
        userFacingName() {
          return "";
        },
        shouldDefer: !0,
        isEnabled() {
          return !FY();
        },
        isConcurrencySafe() {
          return !1;
        },
        isReadOnly() {
          return !1;
        },
        toAutoClassifierInput(H) {
          return `${H.todos.length} items`;
        },
        async checkPermissions(H) {
          return { behavior: "allow", updatedInput: H };
        },
        renderToolUseMessage() {
          return null;
        },
        async call({ todos: H }, _) {
          let q = _.getAppState(),
            $ = _.agentId ?? v_(),
            K = q.todos[$] ?? [],
            T = H.every((A) => A.status === "completed") ? [] : H,
            z = !1;
          return (
            _.setAppState((A) => ({ ...A, todos: { ...A.todos, [$]: T } })),
            { data: { oldTodos: K, newTodos: H, verificationNudgeNeeded: z } }
          );
        },
        mapToolResultToToolResultBlockParam({ verificationNudgeNeeded: H }, _) {
          let $ = H
            ? `

NOTE: You just closed out 3+ tasks and none of them was a verification step. Before writing your final summary, spawn the verification agent (subagent_type="${cK_}"). You cannot self-assign PARTIAL by listing caveats in your summary \u2014 only the verifier issues a verdict.`
            : "";
          return {
            tool_use_id: _,
            type: "tool_result",
            content:
              "Todos have been modified successfully. Ensure that you continue to use the todo list to track your progress. Please proceed with the current tasks if applicable" +
              $,
          };
        },
      });
