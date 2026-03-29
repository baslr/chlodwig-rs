    Z9();
    u7();
    s$();
    L_();
    W8();
    y6();
    H_();
    g_();
    DW();
    hzH = $6(async () => {
      try {
        if (NK(process.env.ENABLE_CLAUDEAI_MCP_SERVERS))
          return (
            N("[claudeai-mcp] Disabled via env var"),
            Q("tengu_claudeai_mcp_eligibility", { state: "disabled_env_var" }),
            {}
          );
        let H = t8();
        if (!H?.accessToken)
          return (
            N("[claudeai-mcp] No access token"), Q("tengu_claudeai_mcp_eligibility", { state: "no_oauth_token" }), {}
          );
        if (!H.scopes?.includes("user:mcp_servers"))
          return (
            N(`[claudeai-mcp] Missing user:mcp_servers scope (scopes=${H.scopes?.join(",") || "none"})`),
            Q("tengu_claudeai_mcp_eligibility", { state: "missing_scope" }),
            {}
          );
        let q = `${m8().BASE_API_URL}/v1/mcp_servers?limit=1000`;
        N(`[claudeai-mcp] Fetching from ${q}`);
        let $ = await T6.get(q, {
            headers: {
              Authorization: `Bearer ${H.accessToken}`,
              "Content-Type": "application/json",
              "anthropic-beta": mA1,
              "anthropic-version": "2023-06-01",
            },
            timeout: xA1,
          }),
          K = {},
          O = new Set();
        for (let T of $.data.data) {
          let z = `claude.ai ${T.display_name}`,
            A = z,
            f = Mf(A),
            w = 1;
          while (O.has(f)) w++, (A = `${z} (${w})`), (f = Mf(A));
          O.add(f), (K[A] = { type: "claudeai-proxy", url: T.url, id: T.id, scope: "claudeai" });
        }
        return (
          N(`[claudeai-mcp] Fetched ${Object.keys(K).length} servers`),
          Q("tengu_claudeai_mcp_eligibility", { state: "eligible" }),
          K
        );
      } catch {
        return N("[claudeai-mcp] Fetch failed"), {};
      }
    });
