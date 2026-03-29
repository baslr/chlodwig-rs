    x8();
    cw();
    (Jl1 = pH(() => h.strictObject({ taskId: h.string().describe("The ID of the task to retrieve") }))),
      (Pl1 = pH(() =>
        h.object({
          task: h
            .object({
              id: h.string(),
              subject: h.string(),
              description: h.string(),
              status: qAH(),
              blocks: h.array(h.string()),
              blockedBy: h.array(h.string()),
            })
            .nullable(),
        }),
      )),
      (V$9 = {
        name: EqH,
        searchHint: "retrieve a task by ID",
        maxResultSizeChars: 1e5,
        async description() {
          return h$9;
        },
        async prompt() {
          return y$9;
        },
        get inputSchema() {
          return Jl1();
        },
        get outputSchema() {
          return Pl1();
        },
        userFacingName() {
          return "TaskGet";
        },
        shouldDefer: !0,
        isEnabled() {
          return FY();
        },
        isConcurrencySafe() {
          return !0;
        },
        isReadOnly() {
          return !0;
        },
        toAutoClassifierInput(H) {
          return H.taskId;
        },
        async checkPermissions(H) {
          return { behavior: "allow", updatedInput: H };
        },
        renderToolUseMessage() {
          return null;
        },
        async call({ taskId: H }) {
          let _ = dG(),
            q = await fc(_, H);
          if (!q) return { data: { task: null } };
          return {
            data: {
              task: {
                id: q.id,
                subject: q.subject,
                description: q.description,
                status: q.status,
                blocks: q.blocks,
                blockedBy: q.blockedBy,
              },
            },
          };
        },
        mapToolResultToToolResultBlockParam(H, _) {
          let { task: q } = H;
          if (!q) return { tool_use_id: _, type: "tool_result", content: "Task not found" };
          let $ = [`Task #${q.id}: ${q.subject}`, `Status: ${q.status}`, `Description: ${q.description}`];
          if (q.blockedBy.length > 0) $.push(`Blocked by: ${q.blockedBy.map((K) => `#${K}`).join(", ")}`);
          if (q.blocks.length > 0) $.push(`Blocks: ${q.blocks.map((K) => `#${K}`).join(", ")}`);
          return {
            tool_use_id: _,
            type: "tool_result",
            content: $.join(`
`),
          };
        },
      });
