    x8();
    T7();
    dw();
    ma6();
    c_9();
    Jt6();
    (mU1 = pH(() =>
      h.strictObject({
        url: h.string().url().describe("The URL to fetch content from"),
        prompt: h.string().describe("The prompt to run on the fetched content"),
      }),
    )),
      (pU1 = pH(() =>
        h.object({
          bytes: h.number().describe("Size of the fetched content in bytes"),
          code: h.number().describe("HTTP response code"),
          codeText: h.string().describe("HTTP response code text"),
          result: h.string().describe("Processed result from applying the prompt to the content"),
          durationMs: h.number().describe("Time taken to fetch and process the content"),
          url: h.string().describe("The URL that was fetched"),
        }),
      ));
    uP = {
      name: FA,
      searchHint: "fetch and extract content from a URL",
      maxResultSizeChars: 1e5,
      shouldDefer: !0,
      async description(H) {
        let { url: _ } = H;
        try {
          return `Claude wants to fetch content from ${new URL(_).hostname}`;
        } catch {
          return "Claude wants to fetch content from this URL";
        }
      },
      userFacingName() {
        return "Fetch";
      },
      getToolUseSummary: pa6,
      getActivityDescription(H) {
        let _ = pa6(H);
        return _ ? `Fetching ${_}` : "Fetching web page";
      },
      isEnabled() {
        return !0;
      },
      get inputSchema() {
        return mU1();
      },
      get outputSchema() {
        return pU1();
      },
      isConcurrencySafe() {
        return !0;
      },
      isReadOnly() {
        return !0;
      },
      toAutoClassifierInput(H) {
        return H.prompt ? `${H.url}: ${H.prompt}` : H.url;
      },
      async checkPermissions(H, _) {
        let $ = _.getAppState().toolPermissionContext;
        try {
          let { url: A } = H,
            f = new URL(A);
          if (mg_(f.hostname, f.pathname))
            return {
              behavior: "allow",
              updatedInput: H,
              decisionReason: { type: "other", reason: "Preapproved host" },
            };
        } catch {}
        let K = BU1(H),
          O = Ux($, uP, "deny").get(K);
        if (O)
          return {
            behavior: "deny",
            message: `${uP.name} denied access to ${K}.`,
            decisionReason: { type: "rule", rule: O },
          };
        let T = Ux($, uP, "ask").get(K);
        if (T)
          return {
            behavior: "ask",
            message: `Claude requested permissions to use ${uP.name}, but you haven't granted it yet.`,
            decisionReason: { type: "rule", rule: T },
            suggestions: w79(K),
          };
        let z = Ux($, uP, "allow").get(K);
        if (z) return { behavior: "allow", updatedInput: H, decisionReason: { type: "rule", rule: z } };
        return {
          behavior: "ask",
          message: `Claude requested permissions to use ${uP.name}, but you haven't granted it yet.`,
          suggestions: w79(K),
        };
      },
      async prompt(H) {
        return `IMPORTANT: WebFetch WILL FAIL for authenticated or private URLs. Before using this tool, check if the URL points to an authenticated service (e.g. Google Docs, Confluence, Jira, GitHub). If so, look for a specialized MCP tool that provides authenticated access.
${btq}`;
      },
      async validateInput(H) {
        let { url: _ } = H;
        try {
          new URL(_);
        } catch {
          return {
            result: !1,
            message: `Error: Invalid URL "${_}". The URL provided could not be parsed.`,
            meta: { reason: "invalid_url" },
            errorCode: 1,
          };
        }
        return { result: !0 };
      },
      renderToolUseMessage: B_9,
      renderToolUseProgressMessage: g_9,
      renderToolResultMessage: d_9,
      async call({ url: H, prompt: _ }, { abortController: q, options: { isNonInteractiveSession: $ } }) {
        let K = Date.now(),
          O = await jt6(H, q);
        if ("type" in O && O.type === "redirect") {
          let P =
              O.statusCode === 301
                ? "Moved Permanently"
                : O.statusCode === 308
                  ? "Permanent Redirect"
                  : O.statusCode === 307
                    ? "Temporary Redirect"
                    : "Found",
            X = `REDIRECT DETECTED: The URL redirects to a different host.

Original URL: ${O.originalUrl}
Redirect URL: ${O.redirectUrl}
Status: ${O.statusCode} ${P}

To complete your request, I need to fetch content from the redirected URL. Please use WebFetch again with these parameters:
- url: "${O.redirectUrl}"
- prompt: "${_}"`;
          return {
            data: {
              bytes: Buffer.byteLength(X),
              code: O.statusCode,
              codeText: P,
              result: X,
              durationMs: Date.now() - K,
              url: H,
            },
          };
        }
        let { content: T, bytes: z, code: A, codeText: f, contentType: w, persistedPath: Y, persistedSize: D } = O,
          j = Yt6(H),
          M;
        if (j && w.includes("text/markdown") && T.length < XH_) M = T;
        else M = await Mt6(_, T, q.signal, $, j);
        if (Y)
          M += `

[Binary content (${w}, ${t7(D ?? z)}) also saved to ${Y}]`;
        return { data: { bytes: z, code: A, codeText: f, result: M, durationMs: Date.now() - K, url: H } };
      },
      mapToolResultToToolResultBlockParam({ result: H }, _) {
        return { tool_use_id: _, type: "tool_result", content: H };
      },
    };
