    x8();
    bqH();
    a0();
    yr();
    Ud_();
    (vl1 = pH(() => h.strictObject({ id: h.string().describe("Job ID returned by CronCreate.") }))),
      (Nl1 = pH(() => h.object({ id: h.string() }))),
      (hl1 = {
        name: hr,
        searchHint: "cancel a scheduled cron job",
        maxResultSizeChars: 1e5,
        shouldDefer: !0,
        get inputSchema() {
          return vl1();
        },
        get outputSchema() {
          return Nl1();
        },
        userFacingName() {
          return hr;
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
          return H.id;
        },
        async checkPermissions(H) {
          return { behavior: "allow", updatedInput: H };
        },
        async description() {
          return ac6;
        },
        async prompt() {
          return sc6(Nr());
        },
        getPath() {
          return vr();
        },
        async validateInput(H) {
          let q = (await XvH()).find((K) => K.id === H.id);
          if (!q) return { result: !1, message: `No scheduled job with id '${H.id}'`, errorCode: 1 };
          let $ = IM();
          if ($ && q.agentId !== $.agentId)
            return { result: !1, message: `Cannot delete cron job '${H.id}': owned by another agent`, errorCode: 2 };
          return { result: !0 };
        },
        async call({ id: H }) {
          return await KAH([H]), { data: { id: H } };
        },
        mapToolResultToToolResultBlockParam(H, _) {
          return { tool_use_id: _, type: "tool_result", content: `Cancelled job ${H.id}.` };
        },
        renderToolUseMessage: F$9,
        renderToolResultMessage: U$9,
      });
