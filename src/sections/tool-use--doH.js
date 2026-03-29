    x8();
    I8();
    h_();
    T7();
    n8();
    nS7();
    h5();
    q5();
    $E7();
    (OJ1 = pH(() =>
      h.strictObject({
        pattern: h.string().describe("The glob pattern to match files against"),
        path: h
          .string()
          .optional()
          .describe(
            'The directory to search in. If not specified, the current working directory will be used. IMPORTANT: Omit this field to use the default directory. DO NOT enter "undefined" or "null" - simply omit it for the default behavior. Must be a valid directory path if provided.',
          ),
      }),
    )),
      (TJ1 = pH(() =>
        h.object({
          durationMs: h.number().describe("Time taken to execute the search in milliseconds"),
          numFiles: h.number().describe("Total number of files found"),
          filenames: h.array(h.string()).describe("Array of file paths that match the pattern"),
          truncated: h.boolean().describe("Whether results were truncated (limited to 100 files)"),
        }),
      )),
      (zc = {
        name: A5,
        searchHint: "find files by name pattern or wildcard",
        maxResultSizeChars: 1e5,
        async description() {
          return Ob6;
        },
        userFacingName: eS7,
        getToolUseSummary: Wc6,
        getActivityDescription(H) {
          let _ = Wc6(H);
          return _ ? `Finding ${_}` : "Finding files";
        },
        isEnabled() {
          return !0;
        },
        get inputSchema() {
          return OJ1();
        },
        get outputSchema() {
          return TJ1();
        },
        isConcurrencySafe() {
          return !0;
        },
        isReadOnly() {
          return !0;
        },
        toAutoClassifierInput(H) {
          return H.pattern;
        },
        isSearchOrReadCommand() {
          return { isSearch: !0, isRead: !1 };
        },
        getPath({ path: H }) {
          return H ? sq(H) : X_();
        },
        matchesPermissionPattern(H, { pattern: _ }) {
          return nZ(H, _);
        },
        async validateInput({ path: H }) {
          if (H) {
            let _ = f_(),
              q = sq(H);
            if (q.startsWith("\\\\") || q.startsWith("//")) return { result: !0 };
            let $;
            try {
              $ = await _.stat(q);
            } catch (K) {
              if (k8(K)) {
                let O = await T_H(q),
                  T = `Directory does not exist: ${H}. ${e0} ${X_()}.`;
                if (O) T += ` Did you mean ${O}?`;
                return { result: !1, message: T, errorCode: 1 };
              }
              throw K;
            }
            if (!$.isDirectory()) return { result: !1, message: `Path is not a directory: ${H}`, errorCode: 2 };
          }
          return { result: !0 };
        },
        async checkPermissions(H, _) {
          let q = _.getAppState();
          return kqH(zc, H, q.toolPermissionContext);
        },
        async prompt() {
          return Ob6;
        },
        renderToolUseMessage: HE7,
        renderToolUseErrorMessage: _E7,
        renderToolResultMessage: qE7,
        extractSearchText({ filenames: H }) {
          return H.join(`
`);
        },
        async call(H, { abortController: _, getAppState: q, globLimits: $ }) {
          let K = Date.now(),
            O = q(),
            T = $?.maxResults ?? 100,
            { files: z, truncated: A } = await iS7(
              H.pattern,
              zc.getPath(H),
              { limit: T, offset: 0 },
              _.signal,
              O.toolPermissionContext,
            ),
            f = z.map(ZjH);
          return { data: { filenames: f, durationMs: Date.now() - K, numFiles: f.length, truncated: A } };
        },
        mapToolResultToToolResultBlockParam(H, _) {
          if (H.filenames.length === 0) return { tool_use_id: _, type: "tool_result", content: "No files found" };
          return {
            tool_use_id: _,
            type: "tool_result",
            content: [
              ...H.filenames,
              ...(H.truncated ? ["(Results are truncated. Consider using a more specific path or pattern.)"] : []),
            ].join(`
`),
          };
        },
      });
