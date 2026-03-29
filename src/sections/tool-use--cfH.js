    u7();
    k_();
    H_();
    ri();
    Q6();
    F_();
    Ew();
    DF = $6(async () => {
      let { enabled: H } = await CD(),
        _ = {
          PreToolUse: [],
          PostToolUse: [],
          PostToolUseFailure: [],
          Notification: [],
          UserPromptSubmit: [],
          SessionStart: [],
          SessionEnd: [],
          Stop: [],
          StopFailure: [],
          SubagentStart: [],
          SubagentStop: [],
          PreCompact: [],
          PostCompact: [],
          PermissionRequest: [],
          Setup: [],
          TeammateIdle: [],
          TaskCreated: [],
          TaskCompleted: [],
          Elicitation: [],
          ElicitationResult: [],
          ConfigChange: [],
          WorktreeCreate: [],
          WorktreeRemove: [],
          InstructionsLoaded: [],
          CwdChanged: [],
          FileChanged: [],
        };
      for (let $ of H) {
        if (!$.hooksConfig) continue;
        N(`Loading hooks from plugin: ${$.name}`);
        let K = $g1($);
        for (let O of Object.keys(K)) _[O].push(...K[O]);
      }
      A$_(), ds(_);
      let q = Object.values(_).reduce(($, K) => $ + K.reduce((O, T) => O + T.hooks.length, 0), 0);
      N(`Registered ${q} hooks from ${H.length} plugins`);
    });
