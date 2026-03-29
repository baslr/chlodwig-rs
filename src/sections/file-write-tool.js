    L_();
    x8();
    t6();
    dzH();
    RkH();
    $c();
    QZH();
    Lr();
    I8();
    H_();
    Qd();
    g_();
    h_();
    T7();
    Dv();
    PC_();
    jh();
    n8();
    RC_();
    N_();
    h5();
    q5();
    VV_();
    Vw();
    US7();
    (LC_ = require("path")),
      (aM1 = pH(() =>
        h.strictObject({
          file_path: h.string().describe("The absolute path to the file to write (must be absolute, not relative)"),
          content: h.string().describe("The content to write to the file"),
        }),
      )),
      (sM1 = pH(() =>
        h.object({
          type: h.enum(["create", "update"]).describe("Whether a new file was created or an existing file was updated"),
          filePath: h.string().describe("The path to the file that was written"),
          content: h.string().describe("The content that was written to the file"),
          structuredPatch: h.array(kp6()).describe("Diff patch showing the changes"),
          originalFile: h
            .string()
            .nullable()
            .describe("The original file content before the write (null for new files)"),
          gitDiff: vp6().optional(),
        }),
      )),
      (jP = {
        name: z$,
        searchHint: "create or overwrite files",
        maxResultSizeChars: 1e5,
        strict: !0,
        async description() {
          return "Write a file to the local filesystem.";
        },
        userFacingName: pS7,
        getToolUseSummary: jc6,
        getActivityDescription(H) {
          let _ = jc6(H);
          return _ ? `Writing ${_}` : "Writing file";
        },
        async prompt() {
          return atq();
        },
        isEnabled() {
          return !0;
        },
        renderToolUseMessage: gS7,
        isResultTruncated: BS7,
        get inputSchema() {
          return aM1();
        },
        get outputSchema() {
          return sM1();
        },
        isConcurrencySafe() {
          return !1;
        },
        isReadOnly() {
          return !1;
        },
        toAutoClassifierInput(H) {
          return `${H.file_path}: ${H.content}`;
        },
        getPath(H) {
          return H.file_path;
        },
        matchesPermissionPattern(H, { file_path: _ }) {
          return nZ(H, _);
        },
        async checkPermissions(H, _) {
          let q = _.getAppState();
          return szH(jP, H, q.toolPermissionContext);
        },
        renderToolUseRejectedMessage: dS7,
        renderToolUseErrorMessage: cS7,
        renderToolResultMessage: FS7,
        extractSearchText() {
          return "";
        },
        async validateInput({ file_path: H, content: _ }, q) {
          let $ = sq(H),
            K = dE_($, _);
          if (K) return { result: !1, message: K, errorCode: 0 };
          let O = q.getAppState();
          if (VY($, O.toolPermissionContext, "edit", "deny") !== null)
            return {
              result: !1,
              message: "File is in a directory that is denied by your permission settings.",
              errorCode: 1,
            };
          if ($.startsWith("\\\\") || $.startsWith("//")) return { result: !0 };
          let z = f_(),
            A;
          try {
            A = (await z.stat($)).mtimeMs;
          } catch (Y) {
            if (k8(Y)) return { result: !0 };
            throw Y;
          }
          let f = q.readFileState.get($);
          if (!f || f.isPartialView)
            return {
              result: !1,
              message: "File has not been read yet. Read it first before writing to it.",
              errorCode: 2,
            };
          if (Math.floor(A) > f.timestamp)
            return {
              result: !1,
              message:
                "File has been modified since read, either by the user or by a linter. Read it again before attempting to write it.",
              errorCode: 3,
            };
          return { result: !0 };
        },
        async call(
          { file_path: H, content: _ },
          { readFileState: q, updateFileHistoryState: $, dynamicSkillDirTriggers: K },
          O,
          T,
        ) {
          let z = sq(H),
            A = LC_.dirname(z),
            f = X_(),
            w = await akH([z], f);
          if (w.length > 0) {
            for (let X of w) K?.add(X);
            skH(w).catch(() => {});
          }
          tkH([z], f), await Mr.beforeFileEdited(z), await f_().mkdir(A);
          let Y;
          try {
            Y = np(z);
          } catch (X) {
            if (k8(X)) Y = null;
            else throw X;
          }
          if (Y !== null) {
            let X = Qh(z),
              R = q.get(z);
            if (!R || X > R.timestamp) {
              if (!(R && R.offset === void 0 && R.limit === void 0) || Y.content !== R.content) throw Error(sZ_);
            }
          }
          let D = Y?.encoding ?? "utf8",
            j = Y?.content ?? null;
          if (BO()) await C8H($, z, T.uuid);
          O_H(z, _, D, "LF");
          let M = Wr();
          if (M)
            RE_(`file://${z}`),
              M.changeFile(z, _).catch((X) => {
                N(`LSP: Failed to notify server of file change for ${z}: ${X.message}`), AH(X);
              }),
              M.saveFile(z).catch((X) => {
                N(`LSP: Failed to notify server of file save for ${z}: ${X.message}`), AH(X);
              });
          if (
            (G8H(z, j, _),
            q.set(z, { content: _, timestamp: Qh(z), offset: void 0, limit: void 0 }),
            z.endsWith(`${LC_.sep}CLAUDE.md`))
          )
            Q("tengu_write_claudemd", {});
          let J;
          if (lH(process.env.CLAUDE_CODE_REMOTE) && B_("tengu_quartz_lantern", !1)) {
            let X = Date.now(),
              R = await GC_(z);
            if (R) J = R;
            Q("tengu_tool_use_diff_computed", { isWriteTool: !0, durationMs: Date.now() - X, hasDiff: !!R });
          }
          if (j) {
            let X = Xv({ filePath: H, fileContents: j, edits: [{ old_string: j, new_string: _, replace_all: !1 }] }),
              R = {
                type: "update",
                filePath: H,
                content: _,
                structuredPatch: X,
                originalFile: j,
                ...(J && { gitDiff: J }),
              };
            return MrH(X), px({ operation: "write", tool: "FileWriteTool", filePath: z, type: "update" }), { data: R };
          }
          let P = {
            type: "create",
            filePath: H,
            content: _,
            structuredPatch: [],
            originalFile: null,
            ...(J && { gitDiff: J }),
          };
          return (
            MrH([], _), px({ operation: "write", tool: "FileWriteTool", filePath: z, type: "create" }), { data: P }
          );
        },
        mapToolResultToToolResultBlockParam({ filePath: H, type: _ }, q) {
          switch (_) {
            case "create":
              return { tool_use_id: q, type: "tool_result", content: `File created successfully at: ${H}` };
            case "update":
              return { tool_use_id: q, type: "tool_result", content: `The file ${H} has been updated successfully.` };
          }
        },
      });
