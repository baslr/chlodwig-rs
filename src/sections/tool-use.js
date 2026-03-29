    x8();
    k_();
    SyH();
    L_();
    R2();
    j9();
    qzH();
    BD();
    jv();
    e7();
    uW();
    K$9();
    (rQ1 = pH(() =>
      h.strictObject({
        action: h
          .enum(["keep", "remove"])
          .describe('"keep" leaves the worktree and branch on disk; "remove" deletes both.'),
        discard_changes: h
          .boolean()
          .optional()
          .describe(
            'Required true when action is "remove" and the worktree has uncommitted files or unmerged commits. The tool will refuse and list them otherwise.',
          ),
      }),
    )),
      (oQ1 = pH(() =>
        h.object({
          action: h.enum(["keep", "remove"]),
          originalCwd: h.string(),
          worktreePath: h.string(),
          worktreeBranch: h.string().optional(),
          tmuxSessionName: h.string().optional(),
          discardedFiles: h.number().optional(),
          discardedCommits: h.number().optional(),
          message: h.string(),
        }),
      ));
    z$9 = {
      name: FC_,
      searchHint: "exit a worktree session and return to the original directory",
      maxResultSizeChars: 1e5,
      async description() {
        return "Exits a worktree session created by EnterWorktree and restores the original working directory";
      },
      async prompt() {
        return _$9();
      },
      get inputSchema() {
        return rQ1();
      },
      get outputSchema() {
        return oQ1();
      },
      userFacingName() {
        return "Exiting worktree";
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
      isDestructive(H) {
        return H.action === "remove";
      },
      toAutoClassifierInput(H) {
        return H.action;
      },
      async checkPermissions(H) {
        return { behavior: "allow", updatedInput: H };
      },
      async validateInput(H) {
        let _ = of();
        if (!_)
          return {
            result: !1,
            message:
              "No-op: there is no active EnterWorktree session to exit. This tool only operates on worktrees created by EnterWorktree in the current session \u2014 it will not touch worktrees created manually or in a previous session. No filesystem changes were made.",
            errorCode: 1,
          };
        if (H.action === "remove" && !H.discard_changes) {
          let q = await O$9(_.worktreePath, _.originalHeadCommit);
          if (q === null)
            return {
              result: !1,
              message: `Could not verify worktree state at ${_.worktreePath}. Refusing to remove without explicit confirmation. Re-invoke with discard_changes: true to proceed \u2014 or use action: "keep" to preserve the worktree.`,
              errorCode: 3,
            };
          let { changedFiles: $, commits: K } = q;
          if ($ > 0 || K > 0) {
            let O = [];
            if ($ > 0) O.push(`${$} uncommitted ${$ === 1 ? "file" : "files"}`);
            if (K > 0) O.push(`${K} ${K === 1 ? "commit" : "commits"} on ${_.worktreeBranch ?? "the worktree branch"}`);
            return {
              result: !1,
              message: `Worktree has ${O.join(" and ")}. Removing will discard this work permanently. Confirm with the user, then re-invoke with discard_changes: true \u2014 or use action: "keep" to preserve the worktree.`,
              errorCode: 2,
            };
          }
        }
        return { result: !0 };
      },
      renderToolUseMessage: q$9,
      renderToolResultMessage: $$9,
      async call(H) {
        let _ = of();
        if (!_) throw Error("Not in a worktree session");
        let { originalCwd: q, worktreePath: $, worktreeBranch: K, tmuxSessionName: O, originalHeadCommit: T } = _,
          z = v5() === s6(),
          { changedFiles: A, commits: f } = (await O$9($, T)) ?? { changedFiles: 0, commits: 0 };
        if (H.action === "keep") {
          await byH(), T$9(q, z), Q("tengu_worktree_kept", { mid_session: !0, commits: f, changed_files: A });
          let D = O ? ` Tmux session ${O} is still running; reattach with: tmux attach -t ${O}` : "";
          return {
            data: {
              action: "keep",
              originalCwd: q,
              worktreePath: $,
              worktreeBranch: K,
              tmuxSessionName: O,
              message: `Exited worktree. Your work is preserved at ${$}${K ? ` on branch ${K}` : ""}. Session is now back in ${q}.${D}`,
            },
          };
        }
        if (O) await CyH(O);
        await IyH(), T$9(q, z), Q("tengu_worktree_removed", { mid_session: !0, commits: f, changed_files: A });
        let w = [];
        if (f > 0) w.push(`${f} ${f === 1 ? "commit" : "commits"}`);
        if (A > 0) w.push(`${A} uncommitted ${A === 1 ? "file" : "files"}`);
        let Y = w.length > 0 ? ` Discarded ${w.join(" and ")}.` : "";
        return {
          data: {
            action: "remove",
            originalCwd: q,
            worktreePath: $,
            worktreeBranch: K,
            discardedFiles: A,
            discardedCommits: f,
            message: `Exited and removed worktree at ${$}.${Y} Session is now back in ${q}.`,
          },
        };
      },
      mapToolResultToToolResultBlockParam({ message: H }, _) {
        return { type: "tool_result", content: H, tool_use_id: _ };
      },
    };
