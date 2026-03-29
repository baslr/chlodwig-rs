    x8();
    eoH();
    bqH();
    K7();
    a0();
    yr();
    Ud_();
    (yl1 = pH(() => h.strictObject({}))),
      (Vl1 = pH(() =>
        h.object({
          jobs: h.array(
            h.object({
              id: h.string(),
              cron: h.string(),
              humanSchedule: h.string(),
              prompt: h.string(),
              recurring: h.boolean().optional(),
              durable: h.boolean().optional(),
            }),
          ),
        }),
      )),
      (Sl1 = {
        name: WvH,
        searchHint: "list active cron jobs",
        maxResultSizeChars: 1e5,
        shouldDefer: !0,
        get inputSchema() {
          return yl1();
        },
        get outputSchema() {
          return Vl1();
        },
        userFacingName() {
          return WvH;
        },
        isEnabled() {
          return Sv();
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
        async description() {
          return tc6;
        },
        async prompt() {
          return ec6(Nr());
        },
        async call() {
          let H = await XvH(),
            _ = IM();
          return {
            data: {
              jobs: (_ ? H.filter((K) => K.agentId === _.agentId) : H).map((K) => ({
                id: K.id,
                cron: K.cron,
                humanSchedule: MvH(K.cron),
                prompt: K.prompt,
                ...(K.recurring ? { recurring: !0 } : {}),
                ...(K.durable === !1 ? { durable: !1 } : {}),
              })),
            },
          };
        },
        mapToolResultToToolResultBlockParam(H, _) {
          return {
            tool_use_id: _,
            type: "tool_result",
            content:
              H.jobs.length > 0
                ? H.jobs
                    .map(
                      (q) =>
                        `${q.id} \u2014 ${q.humanSchedule}${q.recurring ? " (recurring)" : " (one-shot)"}${q.durable === !1 ? " [session-only]" : ""}: ${m4(q.prompt, 80, !0)}`,
                    )
                    .join(`
`)
                : "No scheduled jobs.",
          };
        },
        renderToolUseMessage: Q$9,
        renderToolResultMessage: l$9,
      });
