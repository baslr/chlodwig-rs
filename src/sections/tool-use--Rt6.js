    x8();
    Wt6();
    F_();
    S79();
    (lU1 = pH(() =>
      h.strictObject({
        task_id: h.string().optional().describe("The ID of the background task to stop"),
        shell_id: h.string().optional().describe("Deprecated: use task_id instead"),
      }),
    )),
      (iU1 = pH(() =>
        h.object({
          message: h.string().describe("Status message about the operation"),
          task_id: h.string().describe("The ID of the task that was stopped"),
          task_type: h.string().describe("The type of the task that was stopped"),
          command: h.string().optional().describe("The command or description of the stopped task"),
        }),
      )),
      (Sd_ = {
        name: jI,
        searchHint: "kill a running background task",
        aliases: ["KillShell"],
        maxResultSizeChars: 1e5,
        userFacingName: () => "Stop Task",
        get inputSchema() {
          return lU1();
        },
        get outputSchema() {
          return iU1();
        },
        shouldDefer: !0,
        isEnabled() {
          return !0;
        },
        isConcurrencySafe() {
          return !0;
        },
        isReadOnly() {
          return !1;
        },
        toAutoClassifierInput(H) {
          return H.task_id ?? H.shell_id ?? "";
        },
        async checkPermissions(H) {
          return { behavior: "allow", updatedInput: H };
        },
        async validateInput({ task_id: H, shell_id: _ }, { getAppState: q }) {
          let $ = H ?? _;
          if (!$) return { result: !1, message: "Missing required parameter: task_id", errorCode: 1 };
          let O = q().tasks?.[$];
          if (!O) return { result: !1, message: `No task found with ID: ${$}`, errorCode: 1 };
          if (O.status !== "running")
            return { result: !1, message: `Task ${$} is not running (status: ${O.status})`, errorCode: 3 };
          return { result: !0 };
        },
        async description() {
          return "Stop a running background task by ID";
        },
        async prompt() {
          return xX8;
        },
        mapToolResultToToolResultBlockParam(H, _) {
          return { tool_use_id: _, type: "tool_result", content: gH(H) };
        },
        renderToolUseMessage: y79,
        renderToolResultMessage: V79,
        async call({ task_id: H, shell_id: _ }, { getAppState: q, setAppState: $, abortController: K }) {
          let O = H ?? _;
          if (!O) throw Error("Missing required parameter: task_id");
          let T = await Vd_(O, { getAppState: q, setAppState: $ });
          return {
            data: {
              message: `Successfully stopped task: ${T.taskId} (${T.command})`,
              task_id: T.taskId,
              task_type: T.taskType,
              command: T.command,
            },
          };
        },
      });
