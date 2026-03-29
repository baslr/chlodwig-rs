    x8();
    k_();
    eoH();
    bqH();
    m8H();
    a0();
    yr();
    Ud_();
    (Zl1 = pH(() =>
      h.strictObject({
        cron: h
          .string()
          .describe(
            'Standard 5-field cron expression in local time: "M H DoM Mon DoW" (e.g. "*/5 * * * *" = every 5 minutes, "30 14 28 2 *" = Feb 28 at 2:30pm local once).',
          ),
        prompt: h.string().describe("The prompt to enqueue at each fire time."),
        recurring: xj(h.boolean().optional()).describe(
          `true (default) = fire on every cron match until deleted or auto-expired after ${IqH} days. false = fire once at the next match, then auto-delete. Use false for "remind me at X" one-shot requests with pinned minute/hour/dom/month.`,
        ),
        durable: xj(h.boolean().optional()).describe(
          "true = persist to .claude/scheduled_tasks.json and survive restarts. false (default) = in-memory only, dies when this Claude session ends. Use true only when the user asks the task to survive across sessions.",
        ),
      }),
    )),
      (Ll1 = pH(() =>
        h.object({
          id: h.string(),
          humanSchedule: h.string(),
          recurring: h.boolean(),
          durable: h.boolean().optional(),
        }),
      )),
      (kl1 = {
        name: Vv,
        searchHint: "schedule a recurring or one-shot prompt",
        maxResultSizeChars: 1e5,
        shouldDefer: !0,
        get inputSchema() {
          return Zl1();
        },
        get outputSchema() {
          return Ll1();
        },
        userFacingName() {
          return Vv;
        },
        isEnabled() {
          return Sv();
        },
        isConcurrencySafe() {
          return !1;
        },
        isReadOnly() {
          return !1;
        },
        toAutoClassifierInput(H) {
          return `${H.cron}: ${H.prompt}`;
        },
        async checkPermissions(H) {
          return { behavior: "allow", updatedInput: H };
        },
        async description() {
          return rc6(Nr());
        },
        async prompt() {
          return oc6(Nr());
        },
        getPath() {
          return vr();
        },
        async validateInput(H) {
          if (!toH(H.cron))
            return {
              result: !1,
              message: `Invalid cron expression '${H.cron}'. Expected 5 fields: M H DoM Mon DoW.`,
              errorCode: 1,
            };
          if (JvH(H.cron, Date.now()) === null)
            return {
              result: !1,
              message: `Cron expression '${H.cron}' does not match any calendar date in the next year.`,
              errorCode: 2,
            };
          if ((await XvH()).length >= i$9)
            return { result: !1, message: `Too many scheduled jobs (max ${i$9}). Cancel one first.`, errorCode: 3 };
          if (H.durable && IM())
            return {
              result: !1,
              message: "durable crons are not supported for teammates (teammates do not persist across sessions)",
              errorCode: 4,
            };
          return { result: !0 };
        },
        async call({ cron: H, prompt: _, recurring: q = !0, durable: $ = !1 }) {
          let K = $ && Nr(),
            O = await JC7(H, _, q, K, IM()?.agentId);
          return aCH(!0), { data: { id: O, humanSchedule: MvH(H), recurring: q, durable: K } };
        },
        mapToolResultToToolResultBlockParam(H, _) {
          let q = H.durable
            ? "Persisted to .claude/scheduled_tasks.json"
            : "Session-only (not written to disk, dies when Claude exits)";
          return {
            tool_use_id: _,
            type: "tool_result",
            content: H.recurring
              ? `Scheduled recurring job ${H.id} (${H.humanSchedule}). ${q}. Auto-expires after ${IqH} days. Use CronDelete to cancel sooner.`
              : `Scheduled one-shot task ${H.id} (${H.humanSchedule}). ${q}. It will fire once then auto-delete.`,
          };
        },
        renderToolUseMessage: d$9,
        renderToolResultMessage: c$9,
      });
