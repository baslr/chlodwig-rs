    x8();
    DW();
    h_();
    N_();
    F_();
    wzH();
    tR7();
    (Dz1 = pH(() =>
      h.object({ server: h.string().optional().describe("Optional server name to filter resources by") }),
    )),
      (jz1 = pH(() =>
        h.array(
          h.object({
            uri: h.string().describe("Resource URI"),
            name: h.string().describe("Resource name"),
            mimeType: h.string().optional().describe("MIME type of the resource"),
            description: h.string().optional().describe("Resource description"),
            server: h.string().describe("Server that provides this resource"),
          }),
        ),
      )),
      (Hr = {
        isEnabled() {
          return !0;
        },
        isConcurrencySafe() {
          return !0;
        },
        isReadOnly() {
          return !0;
        },
        toAutoClassifierInput(H) {
          return H.server ?? "";
        },
        shouldDefer: !0,
        name: VrH,
        searchHint: "list resources from connected MCP servers",
        maxResultSizeChars: 1e5,
        async description() {
          return rR7;
        },
        async prompt() {
          return oR7;
        },
        get inputSchema() {
          return Dz1();
        },
        get outputSchema() {
          return jz1();
        },
        async call(H, { options: { mcpClients: _ } }) {
          let { server: q } = H,
            $ = q ? _.filter((O) => O.name === q) : _;
          if (q && $.length === 0)
            throw Error(`Server "${q}" not found. Available servers: ${_.map((O) => O.name).join(", ")}`);
          return {
            data: (
              await Promise.all(
                $.map(async (O) => {
                  if (O.type !== "connected") return [];
                  try {
                    let T = await FLH(O);
                    return await _r(T);
                  } catch (T) {
                    return f3(O.name, QH(T)), [];
                  }
                }),
              )
            ).flat(),
          };
        },
        async checkPermissions(H) {
          return { behavior: "allow", updatedInput: H };
        },
        renderToolUseMessage: aR7,
        userFacingName: () => "listMcpResources",
        renderToolResultMessage: sR7,
        isResultTruncated(H) {
          return wC(gH(H));
        },
        mapToolResultToToolResultBlockParam(H, _) {
          if (!H || H.length === 0)
            return {
              tool_use_id: _,
              type: "tool_result",
              content: "No resources found. MCP servers may still provide tools even if they have no resources.",
            };
          return { tool_use_id: _, type: "tool_result", content: gH(H) };
        },
      });
