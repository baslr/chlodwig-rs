    Zj();
    x8();
    DW();
    eV_();
    F_();
    wzH();
    ZZ7();
    (Sz1 = pH(() =>
      h.object({
        server: h.string().describe("The MCP server name"),
        uri: h.string().describe("The resource URI to read"),
      }),
    )),
      (Ez1 = pH(() =>
        h.object({
          contents: h.array(
            h.object({
              uri: h.string().describe("Resource URI"),
              mimeType: h.string().optional().describe("MIME type of the content"),
              text: h.string().optional().describe("Text content of the resource"),
              blobSavedTo: h.string().optional().describe("Path where binary blob content was saved"),
            }),
          ),
        }),
      )),
      ($r = {
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
          return `${H.server} ${H.uri}`;
        },
        shouldDefer: !0,
        name: "ReadMcpResourceTool",
        searchHint: "read a specific MCP resource by URI",
        maxResultSizeChars: 1e5,
        async description() {
          return PZ7;
        },
        async prompt() {
          return XZ7;
        },
        get inputSchema() {
          return Sz1();
        },
        get outputSchema() {
          return Ez1();
        },
        async call(H, { options: { mcpClients: _ } }) {
          let { server: q, uri: $ } = H,
            K = _.find((A) => A.name === q);
          if (!K) throw Error(`Server "${q}" not found. Available servers: ${_.map((A) => A.name).join(", ")}`);
          if (K.type !== "connected") throw Error(`Server "${q}" is not connected`);
          if (!K.capabilities?.resources) throw Error(`Server "${q}" does not support resources`);
          let T = await (await FLH(K)).client.request({ method: "resources/read", params: { uri: $ } }, lcH);
          return {
            data: {
              contents: await Promise.all(
                T.contents.map(async (A, f) => {
                  if ("text" in A) return { uri: A.uri, mimeType: A.mimeType, text: A.text };
                  if (!("blob" in A) || typeof A.blob !== "string") return { uri: A.uri, mimeType: A.mimeType };
                  let w = `mcp-resource-${Date.now()}-${f}-${Math.random().toString(36).slice(2, 8)}`,
                    Y = await ULH(Buffer.from(A.blob, "base64"), A.mimeType, w);
                  if ("error" in Y)
                    return {
                      uri: A.uri,
                      mimeType: A.mimeType,
                      text: `Binary content could not be saved to disk: ${Y.error}`,
                    };
                  return {
                    uri: A.uri,
                    mimeType: A.mimeType,
                    blobSavedTo: Y.filepath,
                    text: tV_(Y.filepath, A.mimeType, Y.size, `[Resource from ${q} at ${A.uri}] `),
                  };
                }),
              ),
            },
          };
        },
        async checkPermissions(H) {
          return { behavior: "allow", updatedInput: H };
        },
        renderToolUseMessage: WZ7,
        userFacingName: GZ7,
        renderToolResultMessage: RZ7,
        isResultTruncated(H) {
          return wC(gH(H));
        },
        mapToolResultToToolResultBlockParam(H, _) {
          return { tool_use_id: _, type: "tool_result", content: gH(H) };
        },
      });
