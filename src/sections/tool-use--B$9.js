    x8();
    cw();
    m$9();
    (Gl1 = pH(() => h.strictObject({}))),
      (Rl1 = pH(() =>
        h.object({
          tasks: h.array(
            h.object({
              id: h.string(),
              subject: h.string(),
              status: qAH(),
              owner: h.string().optional(),
              blockedBy: h.array(h.string()),
            }),
          ),
        }),
      )),
      (p$9 = {
        name: CqH,
        searchHint: "list all tasks",
        maxResultSizeChars: 1e5,
        async description() {
          return u$9;
        },
        async prompt() {
          return x$9();
        },
        get inputSchema() {
          return Gl1();
        },
        get outputSchema() {
          return Rl1();
        },
        userFacingName() {
          return "TaskList";
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
        toAutoClassifierInput() {
          return "";
        },
        async checkPermissions(H) {
          return { behavior: "allow", updatedInput: H };
        },
        renderToolUseMessage() {
          return null;
        },
        async call() {
          let H = dG(),
            _ = (await MP(H)).filter((K) => !K.metadata?._internal),
            q = new Set(_.filter((K) => K.status === "completed").map((K) => K.id));
          return {
            data: {
              tasks: _.map((K) => ({
                id: K.id,
                subject: K.subject,
                status: K.status,
                owner: K.owner,
                blockedBy: K.blockedBy.filter((O) => !q.has(O)),
              })),
            },
          };
        },
        mapToolResultToToolResultBlockParam(H, _) {
          let { tasks: q } = H;
          if (q.length === 0) return { tool_use_id: _, type: "tool_result", content: "No tasks found" };
          let $ = q.map((K) => {
            let O = K.owner ? ` (${K.owner})` : "",
              T = K.blockedBy.length > 0 ? ` [blocked by ${K.blockedBy.map((z) => `#${z}`).join(", ")}]` : "";
            return `#${K.id} [${K.status}] ${K.subject}${O}${T}`;
          });
          return {
            tool_use_id: _,
            type: "tool_result",
            content: $.join(`
`),
          };
        },
      });
