    x8();
    Pv();
    TaH();
    x9();
    iH();
    mj();
    h_();
    q8();
    m8H();
    F_();
    xw();
    wP();
    Vt6();
    Og_();
    lE_();
    (Q79 = u(aH(), 1)),
      (BK = u(PH(), 1)),
      (KQ1 = pH(() =>
        h.strictObject({
          task_id: h.string().describe("The task ID to get output from"),
          block: xj(h.boolean().default(!0)).describe("Whether to wait for completion"),
          timeout: h.number().min(0).max(600000).default(30000).describe("Max wait time in ms"),
        }),
      ));
    Id_ = {
      name: nL,
      searchHint: "read output/logs from a background task",
      maxResultSizeChars: 1e5,
      shouldDefer: !0,
      aliases: ["AgentOutputTool", "BashOutputTool"],
      userFacingName() {
        return "Task Output";
      },
      get inputSchema() {
        return KQ1();
      },
      async description() {
        return "[Deprecated] \u2014 prefer Read on the task output file path";
      },
      isConcurrencySafe(H) {
        return this.isReadOnly(H);
      },
      isEnabled() {
        return !0;
      },
      isReadOnly(H) {
        return !0;
      },
      toAutoClassifierInput(H) {
        return H.task_id;
      },
      async checkPermissions(H, _) {
        return { behavior: "allow", updatedInput: H };
      },
      async prompt() {
        return `DEPRECATED: Prefer using the Read tool on the task's output file path instead. Background tasks return their output file path in the tool result, and you receive a <task-notification> with the same path when the task completes \u2014 Read that file directly.

- Retrieves output from a running or completed task (background shell, agent, or remote session)
- Takes a task_id parameter identifying the task
- Returns the task output along with status information
- Use block=true (default) to wait for task completion
- Use block=false for non-blocking check of current status
- Task IDs can be found using the /tasks command
- Works with all task types: background shells, async agents, and remote sessions`;
      },
      async validateInput({ task_id: H }, { getAppState: _ }) {
        if (!H) return { result: !1, message: "Task ID is required", errorCode: 1 };
        if (!_().tasks?.[H]) return { result: !1, message: `No task found with ID: ${H}`, errorCode: 2 };
        return { result: !0 };
      },
      async call(H, _, q, $, K) {
        let { task_id: O, block: T, timeout: z } = H,
          f = _.getAppState().tasks?.[O];
        if (!f) throw Error(`No task found with ID: ${O}`);
        if (!T) {
          if (f.status !== "running" && f.status !== "pending")
            return (
              Z4(O, _.setAppState, (Y) => ({ ...Y, notified: !0 })),
              { data: { retrieval_status: "success", task: await bd_(f) } }
            );
          return { data: { retrieval_status: "not_ready", task: await bd_(f) } };
        }
        if (K)
          K({
            toolUseID: `task-output-waiting-${Date.now()}`,
            data: { type: "waiting_for_task", taskDescription: f.description, taskType: f.type },
          });
        let w = await OQ1(O, _.getAppState, z, _.abortController);
        if (!w) return { data: { retrieval_status: "timeout", task: null } };
        if (w.status === "running" || w.status === "pending")
          return { data: { retrieval_status: "timeout", task: await bd_(w) } };
        return (
          Z4(O, _.setAppState, (Y) => ({ ...Y, notified: !0 })),
          { data: { retrieval_status: "success", task: await bd_(w) } }
        );
      },
      mapToolResultToToolResultBlockParam(H, _) {
        let q = [];
        if ((q.push(`<retrieval_status>${H.retrieval_status}</retrieval_status>`), H.task)) {
          if (
            (q.push(`<task_id>${H.task.task_id}</task_id>`),
            q.push(`<task_type>${H.task.task_type}</task_type>`),
            q.push(`<status>${H.task.status}</status>`),
            H.task.exitCode !== void 0 && H.task.exitCode !== null)
          )
            q.push(`<exit_code>${H.task.exitCode}</exit_code>`);
          if (H.task.output?.trim()) {
            let { content: $ } = U79(H.task.output, H.task.task_id);
            q.push(`<output>
${$.trimEnd()}
</output>`);
          }
          if (H.task.error) q.push(`<error>${H.task.error}</error>`);
        }
        return {
          tool_use_id: _,
          type: "tool_result",
          content: q.join(`

`),
        };
      },
      renderToolUseMessage(H) {
        let { block: _ = !0 } = H;
        if (!_) return "non-blocking";
        return "";
      },
      renderToolUseTag(H) {
        if (!H.task_id) return null;
        return BK.default.createElement(L, { dimColor: !0 }, " ", H.task_id);
      },
      renderToolUseProgressMessage(H) {
        let q = H[H.length - 1]?.data;
        return BK.default.createElement(
          m,
          { flexDirection: "column" },
          q?.taskDescription && BK.default.createElement(L, null, "\xA0\xA0", q.taskDescription),
          BK.default.createElement(
            L,
            null,
            "\xA0\xA0\xA0\xA0\xA0Waiting for task",
            " ",
            BK.default.createElement(L, { dimColor: !0 }, "(esc to give additional instructions)"),
          ),
        );
      },
      renderToolResultMessage(H, _, { verbose: q, theme: $ }) {
        return BK.default.createElement(TQ1, { content: H, verbose: q, theme: $ });
      },
      renderToolUseRejectedMessage() {
        return BK.default.createElement(Pc, null);
      },
      renderToolUseErrorMessage(H, { verbose: _ }) {
        return BK.default.createElement(sA, { result: H, verbose: _ });
      },
    };
