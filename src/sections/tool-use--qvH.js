    x8();
    I8();
    h_();
    T7();
    n8();
    h5();
    q5();
    goH();
    kE();
    m8H();
    enH();
    iJ();
    tS7();
    (_J1 = pH(() =>
      h.strictObject({
        pattern: h.string().describe("The regular expression pattern to search for in file contents"),
        path: h
          .string()
          .optional()
          .describe("File or directory to search in (rg PATH). Defaults to current working directory."),
        glob: h
          .string()
          .optional()
          .describe('Glob pattern to filter files (e.g. "*.js", "*.{ts,tsx}") - maps to rg --glob'),
        output_mode: h
          .enum(["content", "files_with_matches", "count"])
          .optional()
          .describe(
            'Output mode: "content" shows matching lines (supports -A/-B/-C context, -n line numbers, head_limit), "files_with_matches" shows file paths (supports head_limit), "count" shows match counts (supports head_limit). Defaults to "files_with_matches".',
          ),
        "-B": Mv(h.number().optional()).describe(
          'Number of lines to show before each match (rg -B). Requires output_mode: "content", ignored otherwise.',
        ),
        "-A": Mv(h.number().optional()).describe(
          'Number of lines to show after each match (rg -A). Requires output_mode: "content", ignored otherwise.',
        ),
        "-C": Mv(h.number().optional()).describe("Alias for context."),
        context: Mv(h.number().optional()).describe(
          'Number of lines to show before and after each match (rg -C). Requires output_mode: "content", ignored otherwise.',
        ),
        "-n": xj(h.boolean().optional()).describe(
          'Show line numbers in output (rg -n). Requires output_mode: "content", ignored otherwise. Defaults to true.',
        ),
        "-i": xj(h.boolean().optional()).describe("Case insensitive search (rg -i)"),
        type: h
          .string()
          .optional()
          .describe(
            "File type to search (rg --type). Common types: js, py, rust, go, java, etc. More efficient than include for standard file types.",
          ),
        head_limit: Mv(h.number().optional()).describe(
          'Limit output to first N lines/entries, equivalent to "| head -N". Works across all output modes: content (limits output lines), files_with_matches (limits file paths), count (limits count entries). Defaults to 250 when unspecified. Pass 0 for unlimited (use sparingly \u2014 large result sets waste context).',
        ),
        offset: Mv(h.number().optional()).describe(
          'Skip first N lines/entries before applying head_limit, equivalent to "| tail -n +N | head -N". Works across all output modes. Defaults to 0.',
        ),
        multiline: xj(h.boolean().optional()).describe(
          "Enable multiline mode where . matches newlines and patterns can span lines (rg -U --multiline-dotall). Default: false.",
        ),
      }),
    )),
      (qJ1 = [".git", ".svn", ".hg", ".bzr", ".jj", ".sl"]);
    (KJ1 = pH(() =>
      h.object({
        mode: h.enum(["content", "files_with_matches", "count"]).optional(),
        numFiles: h.number(),
        filenames: h.array(h.string()),
        content: h.string().optional(),
        numLines: h.number().optional(),
        numMatches: h.number().optional(),
        appliedLimit: h.number().optional(),
        appliedOffset: h.number().optional(),
      }),
    )),
      (Bx = {
        name: bK,
        searchHint: "search file contents with regex (ripgrep)",
        maxResultSizeChars: 20000,
        strict: !0,
        async description() {
          return nL6();
        },
        userFacingName() {
          return "Search";
        },
        getToolUseSummary: Jc6,
        getActivityDescription(H) {
          let _ = Jc6(H);
          return _ ? `Searching for ${_}` : "Searching";
        },
        isEnabled() {
          return !0;
        },
        get inputSchema() {
          return _J1();
        },
        get outputSchema() {
          return KJ1();
        },
        isConcurrencySafe() {
          return !0;
        },
        isReadOnly() {
          return !0;
        },
        toAutoClassifierInput(H) {
          return H.path ? `${H.pattern} in ${H.path}` : H.pattern;
        },
        isSearchOrReadCommand() {
          return { isSearch: !0, isRead: !1 };
        },
        getPath({ path: H }) {
          return H || X_();
        },
        matchesPermissionPattern(H, { pattern: _ }) {
          return nZ(H, _);
        },
        async validateInput({ path: H }) {
          if (H) {
            let _ = f_(),
              q = sq(H);
            if (q.startsWith("\\\\") || q.startsWith("//")) return { result: !0 };
            try {
              await _.stat(q);
            } catch ($) {
              if (k8($)) {
                let K = await T_H(q),
                  O = `Path does not exist: ${H}. ${e0} ${X_()}.`;
                if (K) O += ` Did you mean ${K}?`;
                return { result: !1, message: O, errorCode: 1 };
              }
              throw $;
            }
          }
          return { result: !0 };
        },
        async checkPermissions(H, _) {
          let q = _.getAppState();
          return kqH(Bx, H, q.toolPermissionContext);
        },
        async prompt() {
          return nL6();
        },
        renderToolUseMessage: oS7,
        renderToolUseErrorMessage: aS7,
        renderToolResultMessage: sS7,
        extractSearchText({ mode: H, content: _, filenames: q }) {
          if (H === "content" && _) return _;
          return q.join(`
`);
        },
        mapToolResultToToolResultBlockParam(
          {
            mode: H = "files_with_matches",
            numFiles: _,
            filenames: q,
            content: $,
            numLines: K,
            numMatches: O,
            appliedLimit: T,
            appliedOffset: z,
          },
          A,
        ) {
          if (H === "content") {
            let Y = Xc6(T, z),
              D = $ || "No matches found",
              j = Y
                ? `${D}

[Showing results with pagination = ${Y}]`
                : D;
            return { tool_use_id: A, type: "tool_result", content: j };
          }
          if (H === "count") {
            let Y = Xc6(T, z),
              D = $ || "No matches found",
              j = O ?? 0,
              M = _ ?? 0,
              J = `

Found ${j} total ${j === 1 ? "occurrence" : "occurrences"} across ${M} ${M === 1 ? "file" : "files"}.${Y ? ` with pagination = ${Y}` : ""}`;
            return { tool_use_id: A, type: "tool_result", content: D + J };
          }
          let f = Xc6(T, z);
          if (_ === 0) return { tool_use_id: A, type: "tool_result", content: "No files found" };
          let w = `Found ${_} ${D8(_, "file")}${f ? ` ${f}` : ""}
${q.join(`
`)}`;
          return { tool_use_id: A, type: "tool_result", content: w };
        },
        async call(
          {
            pattern: H,
            path: _,
            glob: q,
            type: $,
            output_mode: K = "files_with_matches",
            "-B": O,
            "-A": T,
            "-C": z,
            context: A,
            "-n": f = !0,
            "-i": w = !1,
            head_limit: Y,
            offset: D = 0,
            multiline: j = !1,
          },
          { abortController: M, getAppState: J },
        ) {
          let P = _ ? sq(_) : X_(),
            X = ["--hidden"];
          for (let I of qJ1) X.push("--glob", `!${I}`);
          if ((X.push("--max-columns", "500"), j)) X.push("-U", "--multiline-dotall");
          if (w) X.push("-i");
          if (K === "files_with_matches") X.push("-l");
          else if (K === "count") X.push("-c");
          if (f && K === "content") X.push("-n");
          if (K === "content")
            if (A !== void 0) X.push("-C", A.toString());
            else if (z !== void 0) X.push("-C", z.toString());
            else {
              if (O !== void 0) X.push("-B", O.toString());
              if (T !== void 0) X.push("-A", T.toString());
            }
          if (H.startsWith("-")) X.push("-e", H);
          else X.push(H);
          if ($) X.push("--type", $);
          if (q) {
            let I = [],
              B = q.split(/\s+/);
            for (let p of B)
              if (p.includes("{") && p.includes("}")) I.push(p);
              else I.push(...p.split(",").filter(Boolean));
            for (let p of I.filter(Boolean)) X.push("--glob", p);
          }
          let R = J(),
            W = HvH(_vH(R.toolPermissionContext), X_());
          for (let I of W) {
            let B = I.startsWith("/") ? `!${I}` : `!**/${I}`;
            X.push("--glob", B);
          }
          for (let I of await ezH(P)) X.push("--glob", I);
          let Z = await Bg(X, P, M.signal);
          if (K === "content") {
            let { items: I, appliedLimit: B } = Pc6(Z, Y, D),
              p = I.map((g) => {
                let c = g.indexOf(":");
                if (c > 0) {
                  let U = g.substring(0, c),
                    i = g.substring(c);
                  return ZjH(U) + i;
                }
                return g;
              });
            return {
              data: {
                mode: "content",
                numFiles: 0,
                filenames: [],
                content: p.join(`
`),
                numLines: p.length,
                ...(B !== void 0 && { appliedLimit: B }),
                ...(D > 0 && { appliedOffset: D }),
              },
            };
          }
          if (K === "count") {
            let { items: I, appliedLimit: B } = Pc6(Z, Y, D),
              p = I.map((U) => {
                let i = U.lastIndexOf(":");
                if (i > 0) {
                  let _H = U.substring(0, i),
                    HH = U.substring(i);
                  return ZjH(_H) + HH;
                }
                return U;
              }),
              C = 0,
              g = 0;
            for (let U of p) {
              let i = U.lastIndexOf(":");
              if (i > 0) {
                let _H = U.substring(i + 1),
                  HH = parseInt(_H, 10);
                if (!isNaN(HH)) (C += HH), (g += 1);
              }
            }
            return {
              data: {
                mode: "count",
                numFiles: g,
                filenames: [],
                content: p.join(`
`),
                numMatches: C,
                ...(B !== void 0 && { appliedLimit: B }),
                ...(D > 0 && { appliedOffset: D }),
              },
            };
          }
          let k = await Promise.allSettled(Z.map((I) => f_().stat(I))),
            v = Z.map((I, B) => {
              let p = k[B];
              return [I, p.status === "fulfilled" ? (p.value.mtimeMs ?? 0) : 0];
            })
              .sort((I, B) => {
                let p = B[1] - I[1];
                if (p === 0) return I[0].localeCompare(B[0]);
                return p;
              })
              .map((I) => I[0]),
            { items: y, appliedLimit: E } = Pc6(v, Y, D),
            S = y.map(ZjH);
          return {
            data: {
              mode: "files_with_matches",
              filenames: S,
              numFiles: S.length,
              ...(E !== void 0 && { appliedLimit: E }),
              ...(D > 0 && { appliedOffset: D }),
            },
          };
        },
      });
