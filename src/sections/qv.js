    u7();
    k_();
    FRH();
    R2();
    SO();
    g_();
    j9();
    l$();
    tb6();
    N_();
    (HI6 = $6(async () => {
      let H = Date.now();
      n_("info", "git_status_started");
      let _ = Date.now(),
        q = await AD();
      if ((n_("info", "git_is_git_check_completed", { duration_ms: Date.now() - _, is_git: q }), !q))
        return n_("info", "git_status_skipped_not_git", { duration_ms: Date.now() - H }), null;
      try {
        let $ = Date.now(),
          [K, O, T, z] = await Promise.all([
            qj(),
            mR(),
            t_(C8(), ["--no-optional-locks", "status", "--short"], { preserveOutputOnError: !1 }).then(
              ({ stdout: f }) => f.trim(),
            ),
            t_(C8(), ["--no-optional-locks", "log", "--oneline", "-n", "5"], { preserveOutputOnError: !1 }).then(
              ({ stdout: f }) => f.trim(),
            ),
          ]);
        n_("info", "git_commands_completed", { duration_ms: Date.now() - $, status_length: T.length });
        let A =
          T.length > eb6
            ? T.substring(0, eb6) +
              `
... (truncated because it exceeds 40k characters. If you need more information, run "git status" using BashTool)`
            : T;
        return (
          n_("info", "git_status_completed", { duration_ms: Date.now() - H, truncated: T.length > eb6 }),
          `This is the git status at the start of the conversation. Note that this status is a snapshot in time, and will not update during the conversation.
Current branch: ${K}

Main branch (you will usually use this for PRs): ${O}

Status:
${A || "(clean)"}

Recent commits:
${z}`
        );
      } catch ($) {
        return n_("error", "git_status_failed", { duration_ms: Date.now() - H }), AH($), null;
      }
    })),
      (iA = $6(async () => {
        let H = Date.now();
        n_("info", "system_context_started");
        let _ = lH(process.env.CLAUDE_CODE_REMOTE) || !Sv_() ? null : await HI6(),
          q = null;
        return (
          n_("info", "system_context_completed", {
            duration_ms: Date.now() - H,
            has_git_status: _ !== null,
            has_injection: q !== null,
          }),
          { ...(_ ? { gitStatus: _ } : {}), ...{} }
        );
      })),
      (Yz = $6(async () => {
        let H = Date.now();
        n_("info", "user_context_started");
        let _ = process.env.CLAUDE_CODE_DISABLE_CLAUDE_MDS || (K1() && X0().length === 0),
          q = _ ? null : ib6(WiH(await CY()));
        return (
          Tt_(q || null),
          n_("info", "user_context_completed", {
            duration_ms: Date.now() - H,
            claudemd_length: q?.length ?? 0,
            claudemd_disabled: Boolean(_),
          }),
          { ...(q ? { claudeMd: q } : {}), currentDate: `Today's date is ${nlH()}.` }
        );
      }));
