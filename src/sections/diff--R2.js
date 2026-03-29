    u7();
    YiH();
    L_();
    k_();
    t6H();
    ww();
    t6();
    y6();
    H_();
    SO();
    g_();
    h_();
    T7();
    WG();
    Bk();
    n8();
    l$();
    xO();
    h5();
    q5();
    _z();
    Q6();
    ($K7 = u(C3H(), 1)),
      (r5 = require("path")),
      (KK7 = u(e17(), 1)),
      (_K7 = (Rh(), Rq(SQ))),
      (Ki4 = new Set([
        ".md",
        ".txt",
        ".text",
        ".json",
        ".yaml",
        ".yml",
        ".toml",
        ".xml",
        ".csv",
        ".html",
        ".htm",
        ".css",
        ".scss",
        ".sass",
        ".less",
        ".js",
        ".ts",
        ".tsx",
        ".jsx",
        ".mjs",
        ".cjs",
        ".mts",
        ".cts",
        ".py",
        ".pyi",
        ".pyw",
        ".rb",
        ".erb",
        ".rake",
        ".go",
        ".rs",
        ".java",
        ".kt",
        ".kts",
        ".scala",
        ".c",
        ".cpp",
        ".cc",
        ".cxx",
        ".h",
        ".hpp",
        ".hxx",
        ".cs",
        ".swift",
        ".sh",
        ".bash",
        ".zsh",
        ".fish",
        ".ps1",
        ".bat",
        ".cmd",
        ".env",
        ".ini",
        ".cfg",
        ".conf",
        ".config",
        ".properties",
        ".sql",
        ".graphql",
        ".gql",
        ".proto",
        ".vue",
        ".svelte",
        ".astro",
        ".ejs",
        ".hbs",
        ".pug",
        ".jade",
        ".php",
        ".pl",
        ".pm",
        ".lua",
        ".r",
        ".R",
        ".dart",
        ".ex",
        ".exs",
        ".erl",
        ".hrl",
        ".clj",
        ".cljs",
        ".cljc",
        ".edn",
        ".hs",
        ".lhs",
        ".elm",
        ".ml",
        ".mli",
        ".f",
        ".f90",
        ".f95",
        ".for",
        ".cmake",
        ".make",
        ".makefile",
        ".gradle",
        ".sbt",
        ".rst",
        ".adoc",
        ".asciidoc",
        ".org",
        ".tex",
        ".latex",
        ".lock",
        ".log",
        ".diff",
        ".patch",
      ]));
    CY = $6(async (H = !1) => {
      let _ = Date.now();
      n_("info", "memory_files_started");
      let q = [],
        $ = new Set(),
        K = pz(),
        O = H || K.hasClaudeMdExternalIncludesApproved || !1,
        T = y1H("Managed");
      q.push(...(await Py(T, "Managed", $, O)));
      let z = e5_();
      if (
        (q.push(
          ...(await a6H({ rulesDir: z, type: "Managed", processedPaths: $, includeExternal: O, conditionalRule: !1 })),
        ),
        fD("userSettings"))
      ) {
        let P = y1H("User");
        q.push(...(await Py(P, "User", $, !0)));
        let X = H3_();
        q.push(
          ...(await a6H({ rulesDir: X, type: "User", processedPaths: $, includeExternal: !0, conditionalRule: !1 })),
        );
      }
      let A = [],
        f = s6(),
        w = f;
      while (w !== r5.parse(w).root) A.push(w), (w = r5.dirname(w));
      let Y = w3(f),
        D = _j(f),
        j = Y !== null && D !== null && kD(Y) !== kD(D) && uk(Y, D);
      for (let P of A.reverse()) {
        let X = j && uk(P, D) && !uk(P, Y);
        if (fD("projectSettings") && !X) {
          let R = r5.join(P, "CLAUDE.md");
          q.push(...(await Py(R, "Project", $, O)));
          let W = r5.join(P, ".claude", "CLAUDE.md");
          q.push(...(await Py(W, "Project", $, O)));
          let Z = r5.join(P, ".claude", "rules");
          q.push(
            ...(await a6H({
              rulesDir: Z,
              type: "Project",
              processedPaths: $,
              includeExternal: O,
              conditionalRule: !1,
            })),
          );
        }
        if (fD("localSettings")) {
          let R = r5.join(P, "CLAUDE.local.md");
          q.push(...(await Py(R, "Local", $, O)));
        }
      }
      if (lH(process.env.CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD)) {
        let P = X0();
        for (let X of P) {
          let R = r5.join(X, "CLAUDE.md");
          q.push(...(await Py(R, "Project", $, O)));
          let W = r5.join(X, ".claude", "CLAUDE.md");
          q.push(...(await Py(W, "Project", $, O)));
          let Z = r5.join(X, ".claude", "rules");
          q.push(
            ...(await a6H({
              rulesDir: Z,
              type: "Project",
              processedPaths: $,
              includeExternal: O,
              conditionalRule: !1,
            })),
          );
        }
      }
      if (T1()) {
        let { info: P } = await Ub6(tK_(), "AutoMem");
        if (P) {
          let X = kD(P.path);
          if (!$.has(X)) $.add(X), q.push(P);
        }
      }
      if (_K7.isTeamMemoryEnabled()) {
        let { info: P } = await Ub6(_K7.getTeamMemEntrypoint(), "TeamMem");
        if (P) {
          let X = kD(P.path);
          if (!$.has(X)) $.add(X), q.push(P);
        }
      }
      let M = q.reduce((P, X) => P + X.content.length, 0);
      n_("info", "memory_files_completed", {
        duration_ms: Date.now() - _,
        file_count: q.length,
        total_content_length: M,
      });
      let J = {};
      for (let P of q) J[P.type] = (J[P.type] ?? 0) + 1;
      if (!qK7)
        (qK7 = !0),
          Q("tengu_claudemd__initial_load", {
            file_count: q.length,
            total_content_length: M,
            user_count: J.User ?? 0,
            project_count: J.Project ?? 0,
            local_count: J.Local ?? 0,
            managed_count: J.Managed ?? 0,
            automem_count: J.AutoMem ?? 0,
            ...{ teammem_count: J.TeamMem ?? 0 },
            duration_ms: Date.now() - _,
          });
      if (!H) {
        let P = Mi4();
        if (P !== void 0 && GiH())
          for (let X of q) {
            if (!ji4(X.type)) continue;
            let R = X.parent ? "include" : P;
            RiH(X.path, X.type, R, { globs: X.globs, parentFilePath: X.parent });
          }
      }
      return q;
    });
