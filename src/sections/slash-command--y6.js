    u7();
    k_();
    ww();
    L_();
    I8();
    s1();
    H_();
    SO();
    jK();
    g_();
    h_();
    T7();
    n8();
    l$();
    Hz();
    N_();
    h5();
    fI();
    F_();
    F_();
    b46();
    (WL8 = require("crypto")),
      (a5_ = require("fs")),
      (mz = require("path")),
      (g2$ = (Rh(), Rq(SQ))),
      (MxH = {
        allowedTools: [],
        mcpContextUris: [],
        mcpServers: {},
        enabledMcpjsonServers: [],
        disabledMcpjsonServers: [],
        hasTrustDialogAccepted: !1,
        projectOnboardingSeenCount: 0,
        hasClaudeMdExternalIncludesApproved: !1,
        hasClaudeMdExternalIncludesWarningShown: !1,
      }),
      (TS = {
        numStartups: 0,
        installMethod: void 0,
        autoUpdates: void 0,
        theme: "dark",
        preferredNotifChannel: "auto",
        verbose: !1,
        editorMode: "normal",
        autoCompactEnabled: !0,
        showTurnDuration: !0,
        hasSeenTasksHint: !1,
        hasUsedStash: !1,
        hasUsedBackgroundTask: !1,
        queuedCommandUpHintCount: 0,
        diffTool: "auto",
        customApiKeyResponses: { approved: [], rejected: [] },
        env: {},
        tipsHistory: {},
        memoryUsageCount: 0,
        promptQueueUseCount: 0,
        btwUseCount: 0,
        todoFeatureEnabled: !0,
        showExpandedTodos: !1,
        messageIdleNotifThresholdMs: 60000,
        autoConnectIde: !1,
        autoInstallIdeExtension: !0,
        fileCheckpointingEnabled: !0,
        terminalProgressBarEnabled: !0,
        cachedStatsigGates: {},
        cachedDynamicConfigs: {},
        cachedGrowthBookFeatures: {},
        respectGitignore: !0,
        copyFullResponse: !1,
      }),
      (GL8 = [
        "apiKeyHelper",
        "installMethod",
        "autoUpdates",
        "autoUpdatesProtectedForNative",
        "theme",
        "verbose",
        "preferredNotifChannel",
        "shiftEnterKeyBindingInstalled",
        "editorMode",
        "hasUsedBackslashReturn",
        "autoCompactEnabled",
        "showTurnDuration",
        "diffTool",
        "env",
        "tipsHistory",
        "todoFeatureEnabled",
        "showExpandedTodos",
        "messageIdleNotifThresholdMs",
        "autoConnectIde",
        "autoInstallIdeExtension",
        "fileCheckpointingEnabled",
        "terminalProgressBarEnabled",
        "taskCompleteNotifEnabled",
        "inputNeededNotifEnabled",
        "agentPushNotifEnabled",
        "respectGitignore",
        "claudeInChromeDefaultEnabled",
        "hasCompletedClaudeInChromeOnboarding",
        "lspRecommendationDisabled",
        "lspRecommendationNeverPlugins",
        "lspRecommendationIgnoredCount",
        "copyFullResponse",
        "copyOnSelect",
        "permissionExplainerEnabled",
        "prStatusFooterEnabled",
        "remoteControlAtStartup",
        "remoteDialogSeen",
      ]);
    RL8 = ["allowedTools", "hasTrustDialogAccepted", "hasCompletedProjectOnboarding"];
    (u_5 = { ...TS, autoUpdates: !1 }), (x_5 = { ...MxH });
    qB = { config: null, mtime: 0 };
    pq(async () => {
      n2$();
    });
    t5_ = $6(() => {
      let H = s6(),
        _ = _j(H);
      if (_) return Q4H(_);
      return Q4H(mz.resolve(H));
    });
    (a2$ = v1H), (s2$ = s5_);
