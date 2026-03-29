    x8();
    xO();
    cw();
    l5();
    k$9();
    (jl1 = pH(() =>
      h.strictObject({
        subject: h.string().describe("A brief title for the task"),
        description: h.string().describe("What needs to be done"),
        activeForm: h
          .string()
          .optional()
          .describe('Present continuous form shown in spinner when in_progress (e.g., "Running tests")'),
        metadata: h.record(h.string(), h.unknown()).optional().describe("Arbitrary metadata to attach to the task"),
      }),
    )),
      (Ml1 = pH(() => h.object({ task: h.object({ id: h.string(), subject: h.string() }) }))),
      (v$9 = {
        name: yv,
        searchHint: "create a task in the task list",
        maxResultSizeChars: 1e5,
        async description() {
          return Z$9;
        },
        async prompt() {
          return L$9();
        },
        get inputSchema() {
          return jl1();
        },
        get outputSchema() {
          return Ml1();
        },
        userFacingName() {
          return "TaskCreate";
        },
        shouldDefer: !0,
        isEnabled() {
          return FY();
        },
        isConcurrencySafe() {
          return !0;
        },
        isReadOnly() {
          return !1;
        },
        toAutoClassifierInput(H) {
          return H.subject;
        },
        async checkPermissions(H) {
          return { behavior: "allow", updatedInput: H };
        },
        renderToolUseMessage() {
          return null;
        },
        async call({ subject: H, description: _, activeForm: q, metadata: $ }, K) {
          let O = await uE7(dG(), {
              subject: H,
              description: _,
              activeForm: q,
              status: "pending",
              owner: void 0,
              blocks: [],
              blockedBy: [],
              metadata: $,
            }),
            T = [],
            z = ot6(O, H, _, _K(), n4(), void 0, K?.abortController?.signal, void 0, K);
          for await (let A of z) if (A.blockingError) T.push(rt6(A.blockingError));
          if (T.length > 0)
            throw (
              (await bC_(dG(), O),
              Error(
                T.join(`
`),
              ))
            );
          return (
            K.setAppState((A) => {
              if (A.expandedView === "tasks") return A;
              return { ...A, expandedView: "tasks" };
            }),
            { data: { task: { id: O, subject: H } } }
          );
        },
        mapToolResultToToolResultBlockParam(H, _) {
          let { task: q } = H;
          return { tool_use_id: _, type: "tool_result", content: `Task #${q.id} created successfully: ${q.subject}` };
        },
      });
