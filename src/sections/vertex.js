    lK();
    x8();
    t6();
    pf();
    N_();
    q8();
    H7();
    F_();
    DTH();
    r79();
    (AQ1 = pH(() =>
      h.strictObject({
        query: h.string().min(2).describe("The search query to use"),
        allowed_domains: h.array(h.string()).optional().describe("Only include search results from these domains"),
        blocked_domains: h.array(h.string()).optional().describe("Never include search results from these domains"),
      }),
    )),
      (fQ1 = pH(() => {
        let H = h.object({
          title: h.string().describe("The title of the search result"),
          url: h.string().describe("The URL of the search result"),
        });
        return h.object({
          tool_use_id: h.string().describe("ID of the tool use"),
          content: h.array(H).describe("Array of search hits"),
        });
      })),
      (wQ1 = pH(() =>
        h.object({
          query: h.string().describe("The search query that was executed"),
          results: h
            .array(h.union([fQ1(), h.string()]))
            .describe("Search results and/or text commentary from the model"),
          durationSeconds: h.number().describe("Time taken to complete the search operation"),
        }),
      ));
    ud_ = {
      name: sk,
      searchHint: "search the web for current information",
      maxResultSizeChars: 1e5,
      shouldDefer: !0,
      async description(H) {
        return `Claude wants to search the web for: ${H.query}`;
      },
      userFacingName() {
        return "Web Search";
      },
      getToolUseSummary: Ct6,
      getActivityDescription(H) {
        let _ = Ct6(H);
        return _ ? `Searching for ${_}` : "Searching the web";
      },
      isEnabled() {
        let H = N8(),
          _ = X$();
        if (H === "firstParty") return !0;
        if (H === "vertex")
          return _.includes("claude-opus-4") || _.includes("claude-sonnet-4") || _.includes("claude-haiku-4");
        if (H === "foundry") return !0;
        return !1;
      },
      get inputSchema() {
        return AQ1();
      },
      get outputSchema() {
        return wQ1();
      },
      isConcurrencySafe() {
        return !0;
      },
      isReadOnly() {
        return !0;
      },
      toAutoClassifierInput(H) {
        return H.query;
      },
      async checkPermissions(H) {
        return {
          behavior: "passthrough",
          message: "WebSearchTool requires permission.",
          suggestions: [
            { type: "addRules", rules: [{ toolName: sk }], behavior: "allow", destination: "localSettings" },
          ],
        };
      },
      async prompt() {
        return X47();
      },
      renderToolUseMessage: l79,
      renderToolUseProgressMessage: i79,
      renderToolResultMessage: n79,
      extractSearchText() {
        return "";
      },
      async validateInput(H) {
        let { query: _, allowed_domains: q, blocked_domains: $ } = H;
        if (!_.length) return { result: !1, message: "Error: Missing query", errorCode: 1 };
        if (q?.length && $?.length)
          return {
            result: !1,
            message: "Error: Cannot specify both allowed_domains and blocked_domains in the same request",
            errorCode: 2,
          };
        return { result: !0 };
      },
      async call(H, _, q, $, K) {
        let O = performance.now(),
          { query: T } = H,
          z = d_({ content: "Perform a web search for the query: " + T }),
          A = YQ1(H),
          f = B_("tengu_plum_vx3", !1),
          w = _.getAppState(),
          Y = vyH({
            messages: [z],
            systemPrompt: w$(["You are an assistant for performing a web search tool use"]),
            thinkingConfig: f ? { type: "disabled" } : _.options.thinkingConfig,
            tools: [],
            signal: _.abortController.signal,
            options: {
              getToolPermissionContext: async () => w.toolPermissionContext,
              model: f ? XD() : _.options.mainLoopModel,
              toolChoice: f ? { type: "tool", name: "web_search" } : void 0,
              isNonInteractiveSession: _.options.isNonInteractiveSession,
              hasAppendSystemPrompt: !!_.options.appendSystemPrompt,
              extraToolSchemas: [A],
              querySource: "web_search_tool",
              agents: _.options.agentDefinitions.activeAgents,
              mcpTools: [],
              agentId: _.agentId,
              effortValue: w.effortValue,
            },
          }),
          D = [],
          j = null,
          M = "",
          J = 0,
          P = new Map();
        for await (let Z of Y) {
          if (Z.type === "assistant") {
            D.push(...Z.message.content);
            continue;
          }
          if (Z.type === "stream_event" && Z.event?.type === "content_block_start") {
            let k = Z.event.content_block;
            if (k && k.type === "server_tool_use") {
              (j = k.id), (M = "");
              continue;
            }
          }
          if (j && Z.type === "stream_event" && Z.event?.type === "content_block_delta") {
            let k = Z.event.delta;
            if (k?.type === "input_json_delta" && k.partial_json) {
              M += k.partial_json;
              try {
                let v = M.match(/"query"\s*:\s*"((?:[^"\\]|\\.)*)"/);
                if (v && v[1]) {
                  let y = i_('"' + v[1] + '"');
                  if (!P.has(j) || P.get(j) !== y) {
                    if ((P.set(j, y), J++, K))
                      K({ toolUseID: `search-progress-${J}`, data: { type: "query_update", query: y } });
                  }
                }
              } catch {}
            }
          }
          if (Z.type === "stream_event" && Z.event?.type === "content_block_start") {
            let k = Z.event.content_block;
            if (k && k.type === "web_search_tool_result") {
              let v = k.tool_use_id,
                y = P.get(v) || T,
                E = k.content;
              if ((J++, K))
                K({
                  toolUseID: v || `search-progress-${J}`,
                  data: { type: "search_results_received", resultCount: Array.isArray(E) ? E.length : 0, query: y },
                });
            }
          }
        }
        let R = (performance.now() - O) / 1000;
        return { data: DQ1(D, T, R) };
      },
      mapToolResultToToolResultBlockParam(H, _) {
        let { query: q, results: $ } = H,
          K = `Web search results for query: "${q}"

`;
        return (
          ($ ?? []).forEach((O) => {
            if (O == null) return;
            if (typeof O === "string")
              K +=
                O +
                `

`;
            else if (O.content?.length > 0)
              K += `Links: ${gH(O.content)}

`;
            else
              K += `No links found.

`;
          }),
          (K += `
REMINDER: You MUST include the sources above in your response to the user using markdown hyperlinks.`),
          { tool_use_id: _, type: "tool_result", content: K.trim() }
        );
      },
    };
