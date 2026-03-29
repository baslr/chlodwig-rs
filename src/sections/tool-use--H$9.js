    x8();
    k_();
    SyH();
    L_();
    R2();
    I8();
    l$();
    BD();
    jv();
    e7();
    uW();
    t99();
    (iQ1 = pH(() =>
      h.strictObject({
        name: h
          .string()
          .superRefine((H, _) => {
            try {
              EyH(H);
            } catch (q) {
              _.addIssue({ code: "custom", message: q.message });
            }
          })
          .optional()
          .describe(
            'Optional name for the worktree. Each "/"-separated segment may contain only letters, digits, dots, underscores, and dashes; max 64 chars total. A random name is generated if not provided.',
          ),
      }),
    )),
      (nQ1 = pH(() =>
        h.object({ worktreePath: h.string(), worktreeBranch: h.string().optional(), message: h.string() }),
      )),
      (e99 = {
        name: cC_,
        searchHint: "create an isolated git worktree and switch into it",
        maxResultSizeChars: 1e5,
        async description() {
          return "Creates an isolated worktree (via git or configured hooks) and switches the session into it";
        },
        async prompt() {
          return o99();
        },
        get inputSchema() {
          return iQ1();
        },
        get outputSchema() {
          return nQ1();
        },
        userFacingName() {
          return "Creating worktree";
        },
        shouldDefer: !0,
        isEnabled() {
          return !0;
        },
        isConcurrencySafe() {
          return !1;
        },
        isReadOnly() {
          return !1;
        },
        toAutoClassifierInput(H) {
          return H.name ?? "";
        },
        async checkPermissions(H) {
          return { behavior: "allow", updatedInput: H };
        },
        renderToolUseMessage: a99,
        renderToolResultMessage: s99,
        async call(H) {
          if (of()) throw Error("Already in a worktree session");
          let _ = _j(X_());
          if (_ && _ !== X_()) process.chdir(_), Pz(_);
          let q = H.name ?? ld(),
            $ = await vH_(v_(), q);
          process.chdir($.worktreePath),
            Pz($.worktreePath),
            QV(X_()),
            qN($),
            uo(),
            _v(),
            PT.cache.clear?.(),
            Q("tengu_worktree_created", { mid_session: !0 });
          let K = $.worktreeBranch ? ` on branch ${$.worktreeBranch}` : "";
          return {
            data: {
              worktreePath: $.worktreePath,
              worktreeBranch: $.worktreeBranch,
              message: `Created worktree at ${$.worktreePath}${K}. The session is now working in the worktree. Use ExitWorktree to leave mid-session, or exit the session to be prompted.`,
            },
          };
        },
        mapToolResultToToolResultBlockParam({ message: H }, _) {
          return { type: "tool_result", content: H, tool_use_id: _ };
        },
      });
