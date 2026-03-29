    x8();
    k_();
    t6();
    L_();
    g_();
    p79();
    MI();
    c79();
    (HQ1 = pH(() =>
      h.strictObject({
        message: h.string().describe("The message for the user. Supports markdown formatting."),
        attachments: h
          .array(h.string())
          .optional()
          .describe(
            "Optional file paths (absolute or relative to cwd) to attach. Use for photos, screenshots, diffs, logs, or any file the user should see alongside your message.",
          ),
        status: h
          .enum(["normal", "proactive"])
          .describe(
            "Use 'proactive' when you're surfacing something the user hasn't asked for and needs to see now \u2014 task completion while they're away, a blocker you hit, an unsolicited status update. Use 'normal' when replying to something the user just said.",
          ),
      }),
    )),
      (_Q1 = pH(() =>
        h.object({
          message: h.string().describe("The message"),
          attachments: h
            .array(
              h.object({ path: h.string(), size: h.number(), isImage: h.boolean(), file_uuid: h.string().optional() }),
            )
            .optional()
            .describe("Resolved attachment metadata"),
          sentAt: h
            .string()
            .optional()
            .describe(
              "ISO timestamp captured at tool execution on the emitting process. Optional \u2014 resumed sessions replay pre-sentAt outputs verbatim.",
            ),
        }),
      ));
    Nt6 = {
      name: ojH,
      aliases: [h96],
      searchHint: "send a message to the user \u2014 your primary visible output channel",
      maxResultSizeChars: 1e5,
      userFacingName() {
        return "";
      },
      get inputSchema() {
        return HQ1();
      },
      get outputSchema() {
        return _Q1();
      },
      isEnabled() {
        return F79();
      },
      isConcurrencySafe() {
        return !0;
      },
      isReadOnly() {
        return !0;
      },
      toAutoClassifierInput(H) {
        return H.message;
      },
      async validateInput({ attachments: H }, _) {
        if (!H || H.length === 0) return { result: !0 };
        return x79(H);
      },
      async checkPermissions(H) {
        return { behavior: "allow", updatedInput: H };
      },
      async description() {
        return y96;
      },
      async prompt() {
        return V96;
      },
      mapToolResultToToolResultBlockParam(H, _) {
        let q = H.attachments?.length ?? 0,
          $ = q === 0 ? "" : ` (${q} ${D8(q, "attachment")} included)`;
        return { tool_use_id: _, type: "tool_result", content: `Message delivered to user.${$}` };
      },
      renderToolUseMessage: g79,
      renderToolResultMessage: d79,
      async call({ message: H, attachments: _, status: q }, $) {
        let K = new Date().toISOString();
        if (
          (Q("tengu_brief_send", { proactive: q === "proactive", attachment_count: _?.length ?? 0 }),
          !_ || _.length === 0)
        )
          return { data: { message: H, sentAt: K } };
        let O = $.getAppState(),
          T = await m79(_, { replBridgeEnabled: O.replBridgeEnabled, signal: $.abortController.signal });
        return { data: { message: H, attachments: T, sentAt: K } };
      },
    };
