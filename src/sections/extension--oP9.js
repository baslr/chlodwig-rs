    iH();
    R2();
    bq();
    I8();
    K7();
    W8();
    D88();
    lf();
    YB6();
    (h9 = u(PH(), 1)),
      (nP9 = require("path")),
      (q1K = {
        id: "large-memory-files",
        type: "warning",
        isActive: (H) => s6H(H.memoryFiles).length > 0,
        render: (H) => {
          let _ = s6H(H.memoryFiles);
          return h9.createElement(
            h9.Fragment,
            null,
            _.map((q) => {
              let $ = q.path.startsWith(X_()) ? nP9.relative(X_(), q.path) : q.path;
              return h9.createElement(
                m,
                { key: q.path, flexDirection: "row" },
                h9.createElement(L, { color: "warning" }, oH.warning),
                h9.createElement(
                  L,
                  { color: "warning" },
                  "Large ",
                  h9.createElement(L, { bold: !0 }, $),
                  " will impact performance (",
                  B9(q.content.length),
                  " chars >",
                  " ",
                  B9(jd),
                  ")",
                  h9.createElement(L, { dimColor: !0 }, " \u2022 /memory to edit"),
                ),
              );
            }),
          );
        },
      }),
      ($1K = {
        id: "claude-ai-external-token",
        type: "warning",
        isActive: () => {
          let H = hS();
          return U8() && (H.source === "ANTHROPIC_AUTH_TOKEN" || H.source === "apiKeyHelper");
        },
        render: () => {
          let H = hS();
          return h9.createElement(
            m,
            { flexDirection: "row", marginTop: 1 },
            h9.createElement(L, { color: "warning" }, oH.warning),
            h9.createElement(
              L,
              { color: "warning" },
              "Auth conflict: Using ",
              H.source,
              " instead of Claude account subscription token. Either unset ",
              H.source,
              ", or run `claude /logout`.",
            ),
          );
        },
      }),
      (K1K = {
        id: "api-key-conflict",
        type: "warning",
        isActive: () => {
          let { source: H } = qA({ skipRetrievingKeyFromApiKeyHelper: !0 });
          return !!HWH() && (H === "ANTHROPIC_API_KEY" || H === "apiKeyHelper");
        },
        render: () => {
          let { source: H } = qA({ skipRetrievingKeyFromApiKeyHelper: !0 });
          return h9.createElement(
            m,
            { flexDirection: "row", marginTop: 1 },
            h9.createElement(L, { color: "warning" }, oH.warning),
            h9.createElement(
              L,
              { color: "warning" },
              "Auth conflict: Using ",
              H,
              " instead of Anthropic Console key. Either unset ",
              H,
              ", or run `claude /logout`.",
            ),
          );
        },
      }),
      (O1K = {
        id: "both-auth-methods",
        type: "warning",
        isActive: () => {
          let { source: H } = qA({ skipRetrievingKeyFromApiKeyHelper: !0 }),
            _ = hS();
          return H !== "none" && _.source !== "none" && !(H === "apiKeyHelper" && _.source === "apiKeyHelper");
        },
        render: () => {
          let { source: H } = qA({ skipRetrievingKeyFromApiKeyHelper: !0 }),
            _ = hS();
          return h9.createElement(
            m,
            { flexDirection: "column", marginTop: 1 },
            h9.createElement(
              m,
              { flexDirection: "row" },
              h9.createElement(L, { color: "warning" }, oH.warning),
              h9.createElement(
                L,
                { color: "warning" },
                "Auth conflict: Both a token (",
                _.source,
                ") and an API key (",
                H,
                ") are set. This may lead to unexpected behavior.",
              ),
            ),
            h9.createElement(
              m,
              { flexDirection: "column", marginLeft: 3 },
              h9.createElement(
                L,
                { color: "warning" },
                "\u2022 Trying to use",
                " ",
                _.source === "claude.ai" ? "claude.ai" : _.source,
                "?",
                " ",
                H === "ANTHROPIC_API_KEY"
                  ? 'Unset the ANTHROPIC_API_KEY environment variable, or claude /logout then say "No" to the API key approval before login.'
                  : H === "apiKeyHelper"
                    ? "Unset the apiKeyHelper setting."
                    : "claude /logout",
              ),
              h9.createElement(
                L,
                { color: "warning" },
                "\u2022 Trying to use ",
                H,
                "?",
                " ",
                _.source === "claude.ai"
                  ? "claude /logout to sign out of claude.ai."
                  : `Unset the ${_.source} environment variable.`,
              ),
            ),
          );
        },
      }),
      (T1K = {
        id: "large-agent-descriptions",
        type: "warning",
        isActive: (H) => {
          return e__(H.agentDefinitions) > mwH;
        },
        render: (H) => {
          let _ = e__(H.agentDefinitions);
          return h9.createElement(
            m,
            { flexDirection: "row" },
            h9.createElement(L, { color: "warning" }, oH.warning),
            h9.createElement(
              L,
              { color: "warning" },
              "Large cumulative agent descriptions will impact performance (~",
              B9(_),
              " tokens >",
              " ",
              B9(mwH),
              ")",
              h9.createElement(L, { dimColor: !0 }, " \u2022 /agents to manage"),
            ),
          );
        },
      }),
      (z1K = {
        id: "jetbrains-plugin-install",
        type: "info",
        isActive: (H) => {
          if (!rLH()) return !1;
          if (!(H.config.autoInstallIdeExtension ?? !0)) return !1;
          let q = iLH();
          return q !== null && !FZ7(q);
        },
        render: () => {
          let H = iLH(),
            _ = Bw(H);
          return h9.createElement(
            m,
            { flexDirection: "row", gap: 1, marginLeft: 1 },
            h9.createElement(L, { color: "ide" }, oH.arrowUp),
            h9.createElement(
              L,
              null,
              "Install the ",
              h9.createElement(L, { color: "ide" }, _),
              " plugin from the JetBrains Marketplace:",
              " ",
              h9.createElement(L, { bold: !0 }, "https://docs.claude.com/s/claude-code-jetbrains"),
            ),
          );
        },
      }),
      (A1K = [q1K, T1K, $1K, K1K, O1K, z1K]);
