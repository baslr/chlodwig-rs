    Z9();
    x8();
    s$();
    t6();
    gJ();
    LW();
    W8();
    F_();
    $49();
    (El1 = pH(() =>
      h.strictObject({
        action: h.enum(["list", "get", "create", "update", "run"]),
        trigger_id: h
          .string()
          .regex(/^[\w-]+$/)
          .optional()
          .describe("Required for get, update, and run"),
        body: h.record(h.string(), h.unknown()).optional().describe("JSON body for create and update"),
      }),
    )),
      (Cl1 = pH(() => h.object({ status: h.number(), json: h.string() }))),
      (Il1 = {
        name: A9H,
        searchHint: "manage scheduled remote agent triggers",
        maxResultSizeChars: 1e5,
        shouldDefer: !0,
        get inputSchema() {
          return El1();
        },
        get outputSchema() {
          return Cl1();
        },
        userFacingName() {
          return A9H;
        },
        isEnabled() {
          return B_("tengu_surreal_dali", !1) && YA("allow_remote_sessions");
        },
        isConcurrencySafe() {
          return !0;
        },
        isReadOnly(H) {
          return H.action === "list" || H.action === "get";
        },
        toAutoClassifierInput(H) {
          return `RemoteTrigger ${H.action}${H.trigger_id ? ` ${H.trigger_id}` : ""}`;
        },
        async checkPermissions(H) {
          return { behavior: "allow", updatedInput: H };
        },
        async description() {
          return e$9;
        },
        async prompt() {
          return H49;
        },
        async call(H, _) {
          await jO();
          let q = t8()?.accessToken;
          if (!q) throw Error("Not authenticated with a claude.ai account. Run /login and try again.");
          let $ = await BJ();
          if (!$) throw Error("Unable to resolve organization UUID.");
          let K = `${m8().BASE_API_URL}/v1/code/triggers`,
            O = {
              Authorization: `Bearer ${q}`,
              "Content-Type": "application/json",
              "anthropic-version": "2023-06-01",
              "anthropic-beta": bl1,
              "x-organization-uuid": $,
            },
            { action: T, trigger_id: z, body: A } = H,
            f,
            w,
            Y;
          switch (T) {
            case "list":
              (f = "GET"), (w = K);
              break;
            case "get":
              if (!z) throw Error("get requires trigger_id");
              (f = "GET"), (w = `${K}/${z}`);
              break;
            case "create":
              if (!A) throw Error("create requires body");
              (f = "POST"), (w = K), (Y = A);
              break;
            case "update":
              if (!z) throw Error("update requires trigger_id");
              if (!A) throw Error("update requires body");
              (f = "POST"), (w = `${K}/${z}`), (Y = A);
              break;
            case "run":
              if (!z) throw Error("run requires trigger_id");
              (f = "POST"), (w = `${K}/${z}/run`), (Y = {});
              break;
          }
          let D = await T6.request({
            method: f,
            url: w,
            headers: O,
            data: Y,
            timeout: 20000,
            signal: _.abortController.signal,
            validateStatus: () => !0,
          });
          return { data: { status: D.status, json: gH(D.data) } };
        },
        mapToolResultToToolResultBlockParam(H, _) {
          return {
            tool_use_id: _,
            type: "tool_result",
            content: `HTTP ${H.status}
${H.json}`,
          };
        },
        renderToolUseMessage: _49,
        renderToolResultMessage: q49,
      });
