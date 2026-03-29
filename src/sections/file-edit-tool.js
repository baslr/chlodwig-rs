    L_();
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
    Z_9();
    k_9();
    VV_();
    Wp6();
    XzH();
    (s7H = require("path")),
      (CP = {
        name: P7,
        searchHint: "modify file contents in place",
        maxResultSizeChars: 1e5,
        strict: !0,
        async description() {
          return "A tool for editing files";
        },
        async prompt() {
          return L_9();
        },
        userFacingName: vV_,
        getToolUseSummary: Xp6,
        getActivityDescription(H) {
          let _ = Xp6(H);
          return _ ? `Editing ${_}` : "Editing file";
        },
        isEnabled() {
          return !0;
        },
        get inputSchema() {
          return yV_();
        },
        get outputSchema() {
          return WR7();
        },
        isConcurrencySafe() {
          return !1;
        },
        isReadOnly() {
          return !1;
        },
        toAutoClassifierInput(H) {
          return `${H.file_path}: ${H.new_string}`;
        },
        getPath(H) {
          return H.file_path;
        },
        matchesPermissionPattern(H, { file_path: _ }) {
          return nZ(H, _);
        },
        async checkPermissions(H, _) {
          let q = _.getAppState();
          return szH(CP, H, q.toolPermissionContext);
        },
        renderToolUseMessage: YR7,
        renderToolResultMessage: DR7,
        renderToolUseRejectedMessage: jR7,
        renderToolUseErrorMessage: MR7,
        async validateInput(H, _) {
          let { file_path: q, old_string: $, new_string: K, replace_all: O = !1 } = H,
            T = sq(q),
            z = dE_(T, K);
          if (z) return { result: !1, message: z, errorCode: 0 };
          if ($ === K)
            return {
              result: !1,
              behavior: "ask",
              message: "No changes to make: old_string and new_string are exactly the same.",
              errorCode: 1,
            };
          let A = _.getAppState();
          if (VY(T, A.toolPermissionContext, "edit", "deny") !== null)
            return {
              result: !1,
              behavior: "ask",
              message: "File is in a directory that is denied by your permission settings.",
              errorCode: 2,
            };
          if (T.startsWith("\\\\") || T.startsWith("//")) return { result: !0 };
          let w = f_(),
            Y;
          try {
            let X = await w.readFileBytes(T),
              R = X.length >= 2 && X[0] === 255 && X[1] === 254 ? "utf16le" : "utf8";
            Y = X.toString(R).replaceAll(
              `\r
`,
              `
`,
            );
          } catch (X) {
            if (k8(X)) Y = null;
            else throw X;
          }
          if (Y === null) {
            if ($ === "") return { result: !0 };
            let X = rX_(T),
              R = await T_H(T),
              W = `File does not exist. ${e0} ${X_()}.`;
            if (R) W += ` Did you mean ${R}?`;
            else if (X) W += ` Did you mean ${X}?`;
            return { result: !1, behavior: "ask", message: W, errorCode: 4 };
          }
          if ($ === "") {
            if (Y.trim() !== "")
              return {
                result: !1,
                behavior: "ask",
                message: "Cannot create new file - file already exists.",
                errorCode: 3,
              };
            return { result: !0 };
          }
          if (T.endsWith(".ipynb"))
            return {
              result: !1,
              behavior: "ask",
              message: `File is a Jupyter Notebook. Use the ${XG} to edit this file.`,
              errorCode: 5,
            };
          let D = _.readFileState.get(T);
          if (!D || D.isPartialView)
            return {
              result: !1,
              behavior: "ask",
              message: "File has not been read yet. Read it first before writing to it.",
              meta: { isFilePathAbsolute: String(s7H.isAbsolute(q)) },
              errorCode: 6,
            };
          if (D) {
            if (Qh(T) > D.timestamp)
              if (D.offset === void 0 && D.limit === void 0 && Y === D.content);
              else
                return {
                  result: !1,
                  behavior: "ask",
                  message:
                    "File has been modified since read, either by the user or by a linter. Read it again before attempting to write it.",
                  errorCode: 7,
                };
          }
          let j = Y,
            M = PzH(j, $);
          if (!M)
            return {
              result: !1,
              behavior: "ask",
              message: `String to replace not found in file.
String: ${$}`,
              meta: { isFilePathAbsolute: String(s7H.isAbsolute(q)) },
              errorCode: 8,
            };
          let J = j.split(M).length - 1;
          if (J > 1 && !O)
            return {
              result: !1,
              behavior: "ask",
              message: `Found ${J} matches of the string to replace, but replace_all is false. To replace all occurrences, set replace_all to true. To replace only one occurrence, please provide more context to uniquely identify the instance.
String: ${$}`,
              meta: { isFilePathAbsolute: String(s7H.isAbsolute(q)), actualOldString: M },
              errorCode: 9,
            };
          let P = R_9(T, j, () => {
            return O ? j.replaceAll(M, K) : j.replace(M, K);
          });
          if (P !== null) return P;
          return { result: !0, meta: { actualOldString: M } };
        },
        inputsEquivalent(H, _) {
          return wR7(
            {
              file_path: H.file_path,
              edits: [{ old_string: H.old_string, new_string: H.new_string, replace_all: H.replace_all ?? !1 }],
            },
            {
              file_path: _.file_path,
              edits: [{ old_string: _.old_string, new_string: _.new_string, replace_all: _.replace_all ?? !1 }],
            },
          );
        },
        async call(
          H,
          { readFileState: _, userModified: q, updateFileHistoryState: $, dynamicSkillDirTriggers: K },
          O,
          T,
        ) {
          let { file_path: z, old_string: A, new_string: f, replace_all: w = !1 } = H,
            Y = f_(),
            D = sq(z),
            j = X_();
          if (!lH(process.env.CLAUDE_CODE_SIMPLE)) {
            let S = await akH([D], j);
            if (S.length > 0) {
              for (let x of S) K?.add(x);
              skH(S).catch(() => {});
            }
            tkH([D], j);
          }
          if ((await Mr.beforeFileEdited(D), await Y.mkdir(s7H.dirname(D)), BO())) await C8H($, D, T.uuid);
          let { content: M, fileExists: J, encoding: P, lineEndings: X } = zd1(D);
          if (J) {
            let S = Qh(D),
              x = _.get(D);
            if (!x || S > x.timestamp) {
              if (!(x && x.offset === void 0 && x.limit === void 0 && M === x.content)) throw Error(sZ_);
            }
          }
          let R = PzH(M, A) || A,
            W = yLH(A, R, f),
            { patch: Z, updatedFile: k } = WrH({
              filePath: D,
              fileContents: M,
              oldString: R,
              newString: W,
              replaceAll: w,
            });
          O_H(D, k, P, X);
          let v = Wr();
          if (v)
            RE_(`file://${D}`),
              v.changeFile(D, k).catch((S) => {
                N(`LSP: Failed to notify server of file change for ${D}: ${S.message}`), AH(S);
              }),
              v.saveFile(D).catch((S) => {
                N(`LSP: Failed to notify server of file save for ${D}: ${S.message}`), AH(S);
              });
          if (
            (G8H(D, M, k),
            _.set(D, { content: k, timestamp: Qh(D), offset: void 0, limit: void 0 }),
            D.endsWith(`${s7H.sep}CLAUDE.md`))
          )
            Q("tengu_write_claudemd", {});
          MrH(Z), px({ operation: "edit", tool: "FileEditTool", filePath: D });
          let y;
          if (lH(process.env.CLAUDE_CODE_REMOTE) && B_("tengu_quartz_lantern", !1)) {
            let S = Date.now(),
              x = await GC_(D);
            if (x) y = x;
            Q("tengu_tool_use_diff_computed", { isEditTool: !0, durationMs: Date.now() - S, hasDiff: !!x });
          }
          return {
            data: {
              filePath: z,
              oldString: R,
              newString: f,
              originalFile: M,
              structuredPatch: Z,
              userModified: q ?? !1,
              replaceAll: w,
              ...(y && { gitDiff: y }),
            },
          };
        },
        mapToolResultToToolResultBlockParam(H, _) {
          let { filePath: q, userModified: $, replaceAll: K } = H,
            O = $ ? ".  The user modified your proposed changes before accepting them. " : "";
          if (K)
            return {
              tool_use_id: _,
              type: "tool_result",
              content: `The file ${q} has been updated${O}. All occurrences were successfully replaced.`,
            };
          return { tool_use_id: _, type: "tool_result", content: `The file ${q} has been updated successfully${O}.` };
        },
      });
