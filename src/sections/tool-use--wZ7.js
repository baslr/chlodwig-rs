    x8();
    wzH();
    KB6();
    (hz1 = pH(() => h.object({}).passthrough())),
      (yz1 = pH(() => h.string().describe("MCP tool execution result"))),
      (fZ7 = {
        isMcp: !0,
        isEnabled() {
          return !0;
        },
        isConcurrencySafe() {
          return !1;
        },
        isReadOnly() {
          return !1;
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
        name: "mcp",
        maxResultSizeChars: 1e5,
        async description() {
          return HZ7;
        },
        async prompt() {
          return eR7;
        },
        get inputSchema() {
          return hz1();
        },
        get outputSchema() {
          return yz1();
        },
        async call() {
          return { data: "" };
        },
        async checkPermissions() {
          return { behavior: "passthrough", message: "MCPTool requires permission." };
        },
        renderToolUseMessage: zZ7,
        userFacingName: () => "mcp",
        renderToolUseProgressMessage: AZ7,
        renderToolResultMessage: sV_,
        isResultTruncated(H) {
          return wC(H);
        },
        mapToolResultToToolResultBlockParam(H, _) {
          return { tool_use_id: _, type: "tool_result", content: H };
        },
      });
