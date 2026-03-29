    g_();
    (EW8 = [mA$, A1H]),
      (eK_ = [A1H, _S, "user:sessions:claude_code", "user:mcp_servers", "user:file_upload"]),
      (a96 = Array.from(new Set([...EW8, ...eK_]))),
      (VW8 = {
        BASE_API_URL: "https://api.anthropic.com",
        CONSOLE_AUTHORIZE_URL: "https://platform.claude.com/oauth/authorize",
        CLAUDE_AI_AUTHORIZE_URL: "https://claude.com/cai/oauth/authorize",
        CLAUDE_AI_ORIGIN: "https://claude.ai",
        TOKEN_URL: "https://platform.claude.com/v1/oauth/token",
        API_KEY_URL: "https://api.anthropic.com/api/oauth/claude_cli/create_api_key",
        ROLES_URL: "https://api.anthropic.com/api/oauth/claude_cli/roles",
        CONSOLE_SUCCESS_URL:
          "https://platform.claude.com/buy_credits?returnUrl=/oauth/code/success%3Fapp%3Dclaude-code",
        CLAUDEAI_SUCCESS_URL: "https://platform.claude.com/oauth/code/success?app=claude-code",
        MANUAL_REDIRECT_URL: "https://platform.claude.com/oauth/code/callback",
        CLIENT_ID: "9d1c250a-e61b-44d9-88ed-5944d1962f5e",
        OAUTH_FILE_SUFFIX: "",
        MCP_PROXY_URL: "https://mcp-proxy.anthropic.com",
        MCP_PROXY_PATH: "/v1/mcp/{server_id}",
      });
    gA$ = [
      "https://beacon.claude-ai.staging.ant.dev",
      "https://claude.fedstart.com",
      "https://claude-staging.fedstart.com",
    ];
