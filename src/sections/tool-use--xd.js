    x8();
    F_();
    (vX7 = u(w0_(), 1)),
      (H51 = pH(() => h.object({}).passthrough())),
      (_51 = pH(() => h.string().describe("Structured output tool result")));
    (ox6 = {
      isMcp: !1,
      isEnabled() {
        return !0;
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
      isDestructive() {
        return !1;
      },
      isOpenWorld() {
        return !1;
      },
      name: iM,
      searchHint: "return the final response as structured JSON",
      maxResultSizeChars: 1e5,
      async description() {
        return "Return structured output in the requested format";
      },
      async prompt() {
        return "Use this tool to return your final response in the requested structured format. You MUST call this tool exactly once at the end of your response to provide the structured output.";
      },
      get inputSchema() {
        return H51();
      },
      get outputSchema() {
        return _51();
      },
      async call(H) {
        return { data: "Structured output provided successfully", structured_output: H };
      },
      async checkPermissions(H) {
        return { behavior: "allow", updatedInput: H };
      },
      renderToolUseMessage(H) {
        let _ = Object.keys(H);
        if (_.length === 0) return null;
        if (_.length <= 3) return _.map((q) => `${q}: ${gH(H[q])}`).join(", ");
        return `${_.length} fields: ${_.slice(0, 3).join(", ")}\u2026`;
      },
      userFacingName: () => iM,
      renderToolUseRejectedMessage() {
        return "Structured output rejected";
      },
      renderToolUseErrorMessage() {
        return "Structured output error";
      },
      renderToolUseProgressMessage() {
        return null;
      },
      renderToolResultMessage(H) {
        return H;
      },
      mapToolResultToToolResultBlockParam(H, _) {
        return { tool_use_id: _, type: "tool_result", content: H };
      },
    }),
      (kX7 = new WeakMap());
