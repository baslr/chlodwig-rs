    u7();
    jK();
    H_H();
    JZ();
    H7();
    k_();
    g_();
    hG6();
    W8();
    l$();
    M9();
    ju();
    F_();
    l5();
    NIq = require("path");
    HD4 = new Set([(_i(), Rq(VWH)).COMPUTER_USE_MCP_SERVER_NAME]);
    (OD4 = new Set([
      "rm",
      "mv",
      "cp",
      "touch",
      "mkdir",
      "chmod",
      "chown",
      "cat",
      "head",
      "tail",
      "sort",
      "stat",
      "diff",
      "wc",
      "grep",
      "rg",
      "sed",
    ])),
      (TD4 = /\s*(?:&&|\|\||[;|])\s*/),
      (zD4 = /\s+/);
    (fD4 = $6(() => {
      let H = {
        ISSUES_EXPLAINER: "report the issue at https://github.com/anthropics/claude-code/issues",
        PACKAGE_URL: "@anthropic-ai/claude-code",
        README_URL: "https://code.claude.com/docs/en/overview",
        VERSION: "2.1.87",
        FEEDBACK_CHANNEL: "https://github.com/anthropics/claude-code/issues",
        BUILD_TIME: "2026-03-29T01:39:46Z",
      }.VERSION.match(/^\d+\.\d+\.\d+(?:-[a-z]+)?/);
      return H ? H[0] : void 0;
    })),
      (wD4 = $6(async () => {
        let [H, _, q, $] = await Promise.all([a6.getPackageManagers(), a6.getRuntimes(), qM8(), $M8()]);
        return {
          platform: LMH(),
          platformRaw: process.env.CLAUDE_CODE_HOST_PLATFORM || "darwin",
          arch: a6.arch,
          nodeVersion: a6.nodeVersion,
          terminal: Lk.terminal,
          packageManagers: H.join(","),
          runtimes: _.join(","),
          isRunningWithBun: a6.isRunningWithBun(),
          isCi: lH(!1),
          isClaubbit: lH(process.env.CLAUBBIT),
          isClaudeCodeRemote: lH(process.env.CLAUDE_CODE_REMOTE),
          isLocalAgentMode: process.env.CLAUDE_CODE_ENTRYPOINT === "local-agent",
          isConductor: a6.isConductor(),
          ...(process.env.CLAUDE_CODE_REMOTE_ENVIRONMENT_TYPE && {
            remoteEnvironmentType: process.env.CLAUDE_CODE_REMOTE_ENVIRONMENT_TYPE,
          }),
          ...{},
          ...(process.env.CLAUDE_CODE_CONTAINER_ID && { claudeCodeContainerId: process.env.CLAUDE_CODE_CONTAINER_ID }),
          ...(process.env.CLAUDE_CODE_REMOTE_SESSION_ID && {
            claudeCodeRemoteSessionId: process.env.CLAUDE_CODE_REMOTE_SESSION_ID,
          }),
          ...(process.env.CLAUDE_CODE_TAGS && { tags: process.env.CLAUDE_CODE_TAGS }),
          isGithubAction: lH(process.env.GITHUB_ACTIONS),
          isClaudeCodeAction: lH(process.env.CLAUDE_CODE_ACTION),
          isClaudeAiAuth: U8(),
          version: {
            ISSUES_EXPLAINER: "report the issue at https://github.com/anthropics/claude-code/issues",
            PACKAGE_URL: "@anthropic-ai/claude-code",
            README_URL: "https://code.claude.com/docs/en/overview",
            VERSION: "2.1.87",
            FEEDBACK_CHANNEL: "https://github.com/anthropics/claude-code/issues",
            BUILD_TIME: "2026-03-29T01:39:46Z",
          }.VERSION,
          versionBase: fD4(),
          buildTime: {
            ISSUES_EXPLAINER: "report the issue at https://github.com/anthropics/claude-code/issues",
            PACKAGE_URL: "@anthropic-ai/claude-code",
            README_URL: "https://code.claude.com/docs/en/overview",
            VERSION: "2.1.87",
            FEEDBACK_CHANNEL: "https://github.com/anthropics/claude-code/issues",
            BUILD_TIME: "2026-03-29T01:39:46Z",
          }.BUILD_TIME,
          deploymentEnvironment: a6.detectDeploymentEnvironment(),
          ...(lH(process.env.GITHUB_ACTIONS) && {
            githubEventName: process.env.GITHUB_EVENT_NAME,
            githubActionsRunnerEnvironment: process.env.RUNNER_ENVIRONMENT,
            githubActionsRunnerOs: process.env.RUNNER_OS,
            githubActionRef: process.env.GITHUB_ACTION_PATH?.includes("claude-code-action/")
              ? process.env.GITHUB_ACTION_PATH.split("claude-code-action/")[1]
              : void 0,
          }),
          ...(c4H() && { wslVersion: c4H() }),
          ...(q ?? {}),
          ...($.length > 0 ? { vcs: $.join(",") } : {}),
        };
      }));
