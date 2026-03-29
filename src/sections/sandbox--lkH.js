    x8();
    k_();
    L_();
    E8H();
    pnH();
    g_();
    h_();
    K7();
    N_();
    M9();
    Wy_();
    jv();
    c3();
    m8H();
    enH();
    tnH();
    xw();
    fLH();
    wzH();
    VG();
    ikH();
    iE_();
    tE_();
    ynH();
    EV7();
    fS7();
    YS7();
    dkH();
    WS7();
    (GqH = require("fs/promises")),
      (_c6 = u(PH(), 1)),
      (zM1 = new Set(["select-string", "get-childitem", "findstr", "where.exe"])),
      (AM1 = new Set([
        "get-content",
        "get-item",
        "test-path",
        "resolve-path",
        "get-process",
        "get-service",
        "get-childitem",
        "get-location",
        "get-filehash",
        "get-acl",
        "format-hex",
      ])),
      (fM1 = new Set(["write-output", "write-host"]));
    jM1 = ["start-sleep", "sleep"];
    (BoH = lH(process.env.CLAUDE_CODE_DISABLE_BACKGROUND_TASKS)),
      (kS7 = pH(() =>
        h.strictObject({
          command: h.string().describe("The PowerShell command to execute"),
          timeout: Mv(h.number().optional()).describe(`Optional timeout in milliseconds (max ${poH()})`),
          description: h
            .string()
            .optional()
            .describe("Clear, concise description of what this command does in active voice."),
          run_in_background: xj(h.boolean().optional()).describe(
            "Set to true to run this command in the background. Use Read to read the output later.",
          ),
          dangerouslyDisableSandbox: xj(h.boolean().optional()).describe(
            "Set this to true to dangerously override sandbox mode and run commands without sandboxing.",
          ),
        }),
      )),
      (PM1 = pH(() => (BoH ? kS7().omit({ run_in_background: !0 }) : kS7()))),
      (XM1 = pH(() =>
        h.object({
          stdout: h.string().describe("The standard output of the command"),
          stderr: h.string().describe("The standard error output of the command"),
          interrupted: h.boolean().describe("Whether the command was interrupted"),
          returnCodeInterpretation: h
            .string()
            .optional()
            .describe("Semantic interpretation for non-error exit codes with special meaning"),
          isImage: h.boolean().optional().describe("Flag to indicate if stdout contains image data"),
          persistedOutputPath: h
            .string()
            .optional()
            .describe("Path to persisted full output when too large for inline"),
          persistedOutputSize: h.number().optional().describe("Total output size in bytes when persisted"),
          backgroundTaskId: h
            .string()
            .optional()
            .describe("ID of the background task if command is running in background"),
          backgroundedByUser: h
            .boolean()
            .optional()
            .describe("True if the user manually backgrounded the command with Ctrl+B"),
          assistantAutoBackgrounded: h
            .boolean()
            .optional()
            .describe("True if the command was auto-backgrounded by the assistant-mode blocking budget"),
        }),
      )),
      (WM1 = [
        "npm",
        "yarn",
        "pnpm",
        "node",
        "python",
        "python3",
        "go",
        "cargo",
        "make",
        "docker",
        "terraform",
        "webpack",
        "vite",
        "jest",
        "pytest",
        "curl",
        "Invoke-WebRequest",
        "build",
        "test",
        "serve",
        "watch",
        "dev",
      ]);
    ozH = {
      name: U1,
      searchHint: "execute Windows PowerShell commands",
      maxResultSizeChars: 30000,
      strict: !0,
      async description({ description: H }) {
        return H || "Run PowerShell command";
      },
      async prompt() {
        return wS7();
      },
      isConcurrencySafe(H) {
        return this.isReadOnly(H);
      },
      isSearchOrReadCommand(H) {
        if (!H.command) return { isSearch: !1, isRead: !1 };
        return wM1(H.command);
      },
      isReadOnly(H) {
        if (FV7(H.command)) return !1;
        return $C_(H.command);
      },
      toAutoClassifierInput(H) {
        return H.command;
      },
      get inputSchema() {
        return PM1();
      },
      get outputSchema() {
        return XM1();
      },
      userFacingName() {
        return "PowerShell";
      },
      getToolUseSummary(H) {
        if (!H?.command) return null;
        let { command: _, description: q } = H;
        if (q) return q;
        return m4(_, zv);
      },
      getActivityDescription(H) {
        if (!H?.command) return "Running command";
        return `Running ${H.description ?? m4(H.command, zv)}`;
      },
      isEnabled() {
        return !0;
      },
      async validateInput(H) {
        if (LS7()) return { result: !1, message: ZS7, errorCode: 11 };
        return { result: !0 };
      },
      async checkPermissions(H, _) {
        return await AS7(H, _);
      },
      renderToolUseMessage: jS7,
      renderToolUseProgressMessage: MS7,
      renderToolUseQueuedMessage: JS7,
      renderToolResultMessage: PS7,
      renderToolUseErrorMessage: XS7,
      mapToolResultToToolResultBlockParam(
        {
          interrupted: H,
          stdout: _,
          stderr: q,
          isImage: $,
          persistedOutputPath: K,
          persistedOutputSize: O,
          backgroundTaskId: T,
          backgroundedByUser: z,
          assistantAutoBackgrounded: A,
        },
        f,
      ) {
        if ($) {
          let j = rE_(_, f);
          if (j) return j;
        }
        let w = _;
        if (K) {
          let j = _ ? _.replace(/^(\s*\n)+/, "").trimEnd() : "",
            M = ArH(j, GLH);
          w = RLH({ filepath: K, originalSize: O ?? 0, isJson: !1, preview: M.preview, hasMore: M.hasMore });
        } else if (_) (w = _.replace(/^(\s*\n)+/, "")), (w = w.trimEnd());
        let Y = q.trim();
        if (H) {
          if (q) Y += GS7;
          Y += "<error>Command was aborted before completion</error>";
        }
        let D = "";
        if (T) {
          let j = I5(T);
          if (A)
            D = `Command exceeded the assistant-mode blocking budget (${DM1 / 1000}s) and was moved to the background with ID: ${T}. It is still running \u2014 you will be notified when it completes. Output is being written to: ${j}. In assistant mode, delegate long-running work to a subagent or use run_in_background to keep this conversation responsive.`;
          else if (z) D = `Command was manually backgrounded by user with ID: ${T}. Output is being written to: ${j}`;
          else D = `Command running in background with ID: ${T}. Output is being written to: ${j}`;
        }
        return {
          tool_use_id: f,
          type: "tool_result",
          content: [w, Y, D].filter(Boolean).join(`
`),
          is_error: H,
        };
      },
      async call(H, _, q, $, K) {
        if (LS7()) throw Error(ZS7);
        let { abortController: O, setAppState: T, setToolJSX: z } = _,
          A = !_.agentId,
          f = 0;
        try {
          let w = GM1({
              input: H,
              abortController: O,
              setAppState: _.setAppStateForTasks ?? T,
              setToolJSX: z,
              preventCwdChanges: !A,
              isMainThread: A,
              toolUseId: _.toolUseId,
              agentId: _.agentId,
            }),
            Y;
          do
            if (((Y = await w.next()), !Y.done && K)) {
              let I = Y.value;
              K({
                toolUseID: `ps-progress-${f++}`,
                data: {
                  type: "powershell_progress",
                  output: I.output,
                  fullOutput: I.fullOutput,
                  elapsedTimeSeconds: I.elapsedTimeSeconds,
                  totalLines: I.totalLines,
                  totalBytes: I.totalBytes,
                  timeoutMs: I.timeoutMs,
                  taskId: I.taskId,
                },
              });
            }
          while (!Y.done);
          let D = Y.value;
          if (!(D.code === 0 && !D.stdout && D.stderr && !D.backgroundTaskId)) Uh_(H.command, D.code, D.stdout);
          let M = D.interrupted && O.signal.reason === "interrupt",
            J = "";
          if (A) {
            let I = _.getAppState();
            if (sE_(I.toolPermissionContext)) J = aE_("");
          }
          if (D.backgroundTaskId) {
            let I = mnH(D.stdout || "", H.command);
            if (A && I.hints.length > 0) for (let B of I.hints) cnH(B);
            return {
              data: {
                stdout: I.stripped,
                stderr: [D.stderr || "", J].filter(Boolean).join(`
`),
                interrupted: !1,
                backgroundTaskId: D.backgroundTaskId,
                backgroundedByUser: D.backgroundedByUser,
                assistantAutoBackgrounded: D.assistantAutoBackgrounded,
              },
            };
          }
          let P = new CuH(),
            X = (D.stdout || "").trimEnd();
          P.append(X + GS7);
          let R = SV7(H.command, D.code, X, D.stderr || ""),
            W = nE_(P.toString()),
            Z = mnH(W, H.command);
          if (((W = Z.stripped), A && Z.hints.length > 0)) for (let I of Z.hints) cnH(I);
          if (D.preSpawnError) throw Error(D.preSpawnError);
          if (R.isError && !M) throw new zh(W, D.stderr || "", D.code, D.interrupted);
          let k = 67108864,
            v,
            y;
          if (D.outputFilePath && D.outputTaskId)
            try {
              let I = await GqH.stat(D.outputFilePath);
              (y = I.size), await YzH();
              let B = zrH(D.outputTaskId, !1);
              if (I.size > k) await GqH.truncate(D.outputFilePath, k);
              try {
                await GqH.link(D.outputFilePath, B);
              } catch {
                await GqH.copyFile(D.outputFilePath, B);
              }
              v = B;
            } catch {}
          let E = boH(W),
            S = W;
          if (E) {
            let I = await oE_(W, D.outputFilePath);
            if (I) S = I;
            else E = !1;
          }
          let x = [D.stderr || "", J].filter(Boolean).join(`
`);
          return (
            Q("tengu_powershell_tool_command_executed", {
              command_type: YC_(H.command),
              stdout_length: S.length,
              stderr_length: x.length,
              exit_code: D.code,
              interrupted: D.interrupted,
            }),
            {
              data: {
                stdout: S,
                stderr: x,
                interrupted: D.interrupted,
                returnCodeInterpretation: R.message,
                isImage: E,
                persistedOutputPath: v,
                persistedOutputSize: y,
              },
            }
          );
        } finally {
          if (z) z(null);
        }
      },
      isResultTruncated(H) {
        return wC(H.stdout) || wC(H.stderr);
      },
    };
