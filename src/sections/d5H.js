    NJ();
    u7();
    k_();
    W8();
    y6();
    I8();
    jK();
    g_();
    TWH = $6((H) => {
      let _ = zS(),
        q = z_(),
        $,
        K,
        O;
      if (H) {
        if ((($ = y9() ?? void 0), (K = aB() ?? void 0), $ && q.claudeCodeFirstTokenDate)) {
          let f = new Date(q.claudeCodeFirstTokenDate).getTime();
          if (!isNaN(f)) O = f;
        }
      }
      let T = VK(),
        z = T?.organizationUuid,
        A = T?.accountUuid;
      return {
        deviceId: _,
        sessionId: v_(),
        email: eT4(),
        appVersion: {
          ISSUES_EXPLAINER: "report the issue at https://github.com/anthropics/claude-code/issues",
          PACKAGE_URL: "@anthropic-ai/claude-code",
          README_URL: "https://code.claude.com/docs/en/overview",
          VERSION: "2.1.87",
          FEEDBACK_CHANNEL: "https://github.com/anthropics/claude-code/issues",
          BUILD_TIME: "2026-03-29T01:39:46Z",
        }.VERSION,
        platform: LMH(),
        organizationUuid: z,
        accountUuid: A,
        userType: "external",
        subscriptionType: $,
        rateLimitTier: K,
        firstTokenTime: O,
        ...(lH(process.env.GITHUB_ACTIONS) && {
          githubActionsMetadata: {
            actor: process.env.GITHUB_ACTOR,
            actorId: process.env.GITHUB_ACTOR_ID,
            repository: process.env.GITHUB_REPOSITORY,
            repositoryId: process.env.GITHUB_REPOSITORY_ID,
            repositoryOwner: process.env.GITHUB_REPOSITORY_OWNER,
            repositoryOwnerId: process.env.GITHUB_REPOSITORY_OWNER_ID,
          },
        }),
      };
    });
    oJ_ = $6(async () => {
      let H = await p1("git config --get user.email", { shell: !0, reject: !1, cwd: X_() });
      return H.exitCode === 0 && H.stdout ? H.stdout.trim() : void 0;
    });
