    x8();
    k_();
    L_();
    QZH();
    E8H();
    kG();
    pnH();
    fm6();
    g_();
    h_();
    T7();
    Dv();
    K7();
    n8();
    h5();
    Wy_();
    jv();
    c3();
    m8H();
    enH();
    xw();
    fLH();
    wzH();
    VG();
    Wp6();
    ynH();
    fv();
    PR7();
    dE7();
    cx6();
    CoH();
    ikH();
    iE_();
    tE_();
    (VqH = require("fs/promises")),
      (Bc6 = u(PH(), 1)),
      (lJ1 = new Set(["find", "grep", "rg", "ag", "ack", "locate", "which", "whereis"])),
      (iJ1 = new Set([
        "cat",
        "head",
        "tail",
        "less",
        "more",
        "wc",
        "stat",
        "file",
        "strings",
        "ls",
        "tree",
        "du",
        "jq",
        "awk",
        "cut",
        "sort",
        "uniq",
        "tr",
      ])),
      (lE7 = new Set(["echo", "printf", "true", "false", ":"])),
      (nJ1 = new Set([
        "mv",
        "cp",
        "rm",
        "mkdir",
        "rmdir",
        "chmod",
        "chown",
        "chgrp",
        "touch",
        "ln",
        "cd",
        "export",
        "unset",
        "wait",
      ]));
    (aJ1 = ["sleep"]),
      (xC_ = lH(process.env.CLAUDE_CODE_DISABLE_BACKGROUND_TASKS)),
      (UE7 = pH(() =>
        h.strictObject({
          command: h.string().describe("The command to execute"),
          timeout: Mv(h.number().optional()).describe(`Optional timeout in milliseconds (max ${uC_()})`),
          description: h
            .string()
            .optional()
            .describe(`Clear, concise description of what this command does in active voice. Never use words like "complex" or "risk" in the description - just describe what it does.

For simple commands (git, npm, standard CLI tools), keep it brief (5-10 words):
- ls \u2192 "List files in current directory"
- git status \u2192 "Show working tree status"
- npm install \u2192 "Install package dependencies"

For commands that are harder to parse at a glance (piped commands, obscure flags, etc.), add enough context to clarify what it does:
- find . -name "*.tmp" -exec rm {} \\; \u2192 "Find and delete all .tmp files recursively"
- git reset --hard origin/main \u2192 "Discard all local changes and match remote main"
- curl -s url | jq '.data[]' \u2192 "Fetch JSON from URL and extract data array elements"`),
          run_in_background: xj(h.boolean().optional()).describe(
            "Set to true to run this command in the background. Use Read to read the output later.",
          ),
          dangerouslyDisableSandbox: xj(h.boolean().optional()).describe(
            "Set this to true to dangerously override sandbox mode and run commands without sandboxing.",
          ),
          _simulatedSedEdit: h
            .object({ filePath: h.string(), newContent: h.string() })
            .optional()
            .describe("Internal: pre-computed sed edit result from preview"),
        }),
      )),
      (QE7 = pH(() =>
        xC_ ? UE7().omit({ run_in_background: !0, _simulatedSedEdit: !0 }) : UE7().omit({ _simulatedSedEdit: !0 }),
      )),
      (sJ1 = [
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
        "wget",
        "build",
        "test",
        "serve",
        "watch",
        "dev",
      ]);
    tJ1 = pH(() =>
      h.object({
        stdout: h.string().describe("The standard output of the command"),
        stderr: h.string().describe("The standard error output of the command"),
        rawOutputPath: h.string().optional().describe("Path to raw output file for large MCP tool outputs"),
        interrupted: h.boolean().describe("Whether the command was interrupted"),
        isImage: h.boolean().optional().describe("Flag to indicate if stdout contains image data"),
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
          .describe("True if assistant-mode auto-backgrounded a long-running blocking command"),
        dangerouslyDisableSandbox: h.boolean().optional().describe("Flag to indicate if sandbox mode was overridden"),
        returnCodeInterpretation: h
          .string()
          .optional()
          .describe("Semantic interpretation for non-error exit codes with special meaning"),
        noOutputExpected: h
          .boolean()
          .optional()
          .describe("Whether the command is expected to produce no output on success"),
        structuredContent: h.array(h.any()).optional().describe("Structured content blocks"),
        persistedOutputPath: h
          .string()
          .optional()
          .describe("Path to the persisted full output in tool-results dir (set when output is too large for inline)"),
        persistedOutputSize: h
          .number()
          .optional()
          .describe("Total size of the output in bytes (set when output is too large for inline)"),
      }),
    );
    y7 = {
      name: Lq,
      searchHint: "execute shell commands",
      maxResultSizeChars: 30000,
      strict: !0,
      async description({ description: H }) {
        return H || "Run shell command";
      },
      async prompt() {
        return gE7();
      },
      isConcurrencySafe(H) {
        return this.isReadOnly(H);
      },
      isReadOnly(H) {
        let _ = vnH(H.command);
        return Ch_(H, _).behavior === "allow";
      },
      toAutoClassifierInput(H) {
        return H.command;
      },
      matchesPermissionPattern(H, { command: _ }) {
        let q = iE7(H);
        if (q !== null) return _ === q || _.startsWith(`${q} `);
        return ioH(H, _);
      },
      isSearchOrReadCommand(H) {
        let _ = QE7().safeParse(H);
        if (!_.success) return { isSearch: !1, isRead: !1 };
        return rJ1(_.data.command);
      },
      get inputSchema() {
        return QE7();
      },
      get outputSchema() {
        return tJ1();
      },
      userFacingName(H) {
        if (!H) return "Bash";
        if (H.command) {
          let _ = mkH(H.command);
          if (_) return vV_({ file_path: _.filePath, old_string: "x" });
        }
        return lH(process.env.CLAUDE_CODE_BASH_SANDBOX_SHOW_INDICATOR) && vC(H) ? "SandboxedBash" : "Bash";
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
        return { result: !0 };
      },
      async checkPermissions(H, _) {
        return await gc6(H, _);
      },
      renderToolUseMessage: ZV7,
      renderToolUseProgressMessage: LV7,
      renderToolUseQueuedMessage: kV7,
      renderToolResultMessage: vV7,
      extractSearchText({ stdout: H, stderr: _ }) {
        return _
          ? `${H}
${_}`
          : H;
      },
      mapToolResultToToolResultBlockParam(
        {
          interrupted: H,
          stdout: _,
          stderr: q,
          isImage: $,
          backgroundTaskId: K,
          backgroundedByUser: O,
          assistantAutoBackgrounded: T,
          structuredContent: z,
          persistedOutputPath: A,
          persistedOutputSize: f,
        },
        w,
      ) {
        if (z && z.length > 0) return { tool_use_id: w, type: "tool_result", content: z };
        if ($) {
          let M = rE_(_, w);
          if (M) return M;
        }
        let Y = _;
        if (_) (Y = _.replace(/^(\s*\n)+/, "")), (Y = Y.trimEnd());
        if (A) {
          let M = ArH(Y, GLH);
          Y = RLH({ filepath: A, originalSize: f ?? 0, isJson: !1, preview: M.preview, hasMore: M.hasMore });
        }
        let D = q.trim();
        if (H) {
          if (q) D += cE7;
          D += "<error>Command was aborted before completion</error>";
        }
        let j = "";
        if (K) {
          let M = I5(K);
          if (T)
            j = `Command exceeded the assistant-mode blocking budget (${QJ1 / 1000}s) and was moved to the background with ID: ${K}. It is still running \u2014 you will be notified when it completes. Output is being written to: ${M}. In assistant mode, delegate long-running work to a subagent or use run_in_background to keep this conversation responsive.`;
          else if (O) j = `Command was manually backgrounded by user with ID: ${K}. Output is being written to: ${M}`;
          else j = `Command running in background with ID: ${K}. Output is being written to: ${M}`;
        }
        return {
          tool_use_id: w,
          type: "tool_result",
          content: [Y, D, j].filter(Boolean).join(`
`),
          is_error: H,
        };
      },
      async call(H, _, q, $, K) {
        if (H._simulatedSedEdit) return await HP1(H._simulatedSedEdit, _, $);
        let { abortController: O, getAppState: T, setAppState: z, setToolJSX: A } = _,
          f = new CuH(),
          w = "",
          Y,
          D = 0,
          j = !1,
          M,
          J = !_.agentId,
          P = !J;
        try {
          let B = _P1({
              input: H,
              abortController: O,
              setAppState: _.setAppStateForTasks ?? z,
              setToolJSX: A,
              preventCwdChanges: P,
              isMainThread: J,
              toolUseId: _.toolUseId,
              agentId: _.agentId,
            }),
            p;
          do
            if (((p = await B.next()), !p.done && K)) {
              let c = p.value;
              K({
                toolUseID: `bash-progress-${D++}`,
                data: {
                  type: "bash_progress",
                  output: c.output,
                  fullOutput: c.fullOutput,
                  elapsedTimeSeconds: c.elapsedTimeSeconds,
                  totalLines: c.totalLines,
                  totalBytes: c.totalBytes,
                  taskId: c.taskId,
                  timeoutMs: c.timeoutMs,
                },
              });
            }
          while (!p.done);
          (M = p.value), Uh_(H.command, M.code, M.stdout);
          let C = M.interrupted && O.signal.reason === "interrupt";
          if (
            (f.append((M.stdout || "").trimEnd() + cE7),
            (Y = JR7(H.command, M.code, M.stdout || "", "")),
            M.stdout && M.stdout.includes(".git/index.lock': File exists"))
          )
            Q("tengu_git_index_lock_error", {});
          if (Y.isError && !C) {
            if (M.code !== 0) f.append(`Exit code ${M.code}`);
          }
          if (!P) {
            let c = T();
            if (sE_(c.toolPermissionContext)) w = aE_("");
          }
          let g = j8.annotateStderrWithSandboxFailures(H.command, M.stdout || "");
          if (M.preSpawnError) throw Error(M.preSpawnError);
          if (Y.isError && !C) throw new zh("", g, M.code, M.interrupted);
          j = M.interrupted;
        } finally {
          if (A) A(null);
        }
        let X = f.toString(),
          R = 67108864,
          W,
          Z;
        if (M.outputFilePath && M.outputTaskId)
          try {
            let B = await VqH.stat(M.outputFilePath);
            (Z = B.size), await YzH();
            let p = zrH(M.outputTaskId, !1);
            if (B.size > R) await VqH.truncate(M.outputFilePath, R);
            try {
              await VqH.link(M.outputFilePath, p);
            } catch {
              await VqH.copyFile(M.outputFilePath, p);
            }
            W = p;
          } catch {}
        let k = H.command.split(" ")[0];
        Q("tengu_bash_tool_command_executed", {
          command_type: k,
          stdout_length: X.length,
          stderr_length: 0,
          exit_code: M.code,
          interrupted: j,
        });
        let v = zW7(H.command);
        if (v) Q("tengu_code_indexing_tool_used", { tool: v, source: "cli", success: M.code === 0 });
        let y = nE_(X),
          E = mnH(y, H.command);
        if (((y = E.stripped), J && E.hints.length > 0)) for (let B of E.hints) cnH(B);
        let S = boH(y),
          x = y;
        if (S) {
          let B = await oE_(y, M.outputFilePath);
          if (B) x = B;
        }
        return {
          data: {
            stdout: x,
            stderr: w,
            interrupted: j,
            isImage: S,
            returnCodeInterpretation: Y?.message,
            noOutputExpected: oJ1(H.command),
            backgroundTaskId: M.backgroundTaskId,
            backgroundedByUser: M.backgroundedByUser,
            assistantAutoBackgrounded: M.assistantAutoBackgrounded,
            dangerouslyDisableSandbox: "dangerouslyDisableSandbox" in H ? H.dangerouslyDisableSandbox : void 0,
            persistedOutputPath: W,
            persistedOutputSize: Z,
          },
        };
      },
      renderToolUseErrorMessage: NV7,
      isResultTruncated(H) {
        return wC(H.stdout) || wC(H.stderr);
      },
    };
