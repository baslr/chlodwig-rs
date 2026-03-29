    u7();
    x8();
    L_();
    H_();
    oE();
    Ad();
    (QK7 = pH(() =>
      h.object({
        query: h
          .string()
          .describe(
            'Query to find deferred tools. Use "select:<tool_name>" for direct selection, or keywords to search.',
          ),
        max_results: h.number().optional().default(5).describe("Maximum number of results to return (default: 5)"),
      }),
    )),
      (lK7 = pH(() =>
        h.object({
          matches: h.array(h.string()),
          query: h.string(),
          total_deferred_tools: h.number(),
          pending_mcp_servers: h.array(h.string()).optional(),
        }),
      ));
    mv_ = $6(
      async (H, _) => {
        let q = B$(_, H);
        if (!q) return "";
        return q.prompt({
          getToolPermissionContext: async () => ({
            mode: "default",
            additionalWorkingDirectories: new Map(),
            alwaysAllowRules: {},
            alwaysDenyRules: {},
            alwaysAskRules: {},
            isBypassPermissionsModeAvailable: !1,
          }),
          tools: _,
          agents: [],
        });
      },
      (H) => H,
    );
    kiH = {
      isEnabled() {
        return Wy();
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
      name: Sj,
      maxResultSizeChars: 1e5,
      async description() {
        return Jv_();
      },
      async prompt() {
        return Jv_();
      },
      get inputSchema() {
        return QK7();
      },
      get outputSchema() {
        return lK7();
      },
      async call(H, { options: { tools: _ }, getAppState: q }) {
        let { query: $, max_results: K = 5 } = H,
          O = _.filter(sX);
        bi4(O);
        async function T() {
          let Y = q().mcp.clients.filter((D) => D.type === "pending");
          return Y.length > 0 ? Y.map((D) => D.name) : void 0;
        }
        function z(w, Y) {
          Q("tengu_tool_search_outcome", {
            query: $,
            queryType: Y,
            matchCount: w.length,
            totalDeferredTools: O.length,
            maxResults: K,
            hasMatches: w.length > 0,
          });
        }
        let A = $.match(/^select:(.+)$/i);
        if (A) {
          let w = A[1]
              .split(",")
              .map((j) => j.trim())
              .filter(Boolean),
            Y = [],
            D = [];
          for (let j of w) {
            let M = B$(O, j) ?? B$(_, j);
            if (M) {
              if (!Y.includes(M.name)) Y.push(M.name);
            } else D.push(j);
          }
          if (Y.length === 0) {
            N(`ToolSearchTool: select failed \u2014 none found: ${D.join(", ")}`), z([], "select");
            let j = await T();
            return xv_([], $, O.length, j);
          }
          if (D.length > 0) N(`ToolSearchTool: partial select \u2014 found: ${Y.join(", ")}, missing: ${D.join(", ")}`);
          else N(`ToolSearchTool: selected ${Y.join(", ")}`);
          return z(Y, "select"), xv_(Y, $, O.length);
        }
        let f = await xi4($, O, _, K);
        if (
          (N(`ToolSearchTool: keyword search for "${$}", found ${f.length} matches`), z(f, "keyword"), f.length === 0)
        ) {
          let w = await T();
          return xv_(f, $, O.length, w);
        }
        return xv_(f, $, O.length);
      },
      async checkPermissions(H) {
        return { behavior: "allow", updatedInput: H };
      },
      renderToolUseMessage() {
        return null;
      },
      userFacingName: () => "",
      mapToolResultToToolResultBlockParam(H, _) {
        if (H.matches.length === 0) {
          let q = "No matching deferred tools found";
          if (H.pending_mcp_servers && H.pending_mcp_servers.length > 0)
            q += `. Some MCP servers are still connecting: ${H.pending_mcp_servers.join(", ")}. Their tools will become available shortly \u2014 try searching again.`;
          return { type: "tool_result", tool_use_id: _, content: q };
        }
        return {
          type: "tool_result",
          tool_use_id: _,
          content: H.matches.map((q) => ({ type: "tool_reference", tool_name: q })),
        };
      },
    };
