    u7();
    L_();
    H_();
    g_();
    j9();
    t96();
    N_();
    M9();
    (kQH = require("child_process")),
      (Uaq = require("os")),
      (WOH = u(require("path"))),
      (Qaq = require("url")),
      (XI4 = Qaq.fileURLToPath(
        "file:///home/runner/work/claude-cli-internal/claude-cli-internal/src/utils/ripgrep.ts",
      )),
      (WI4 = WOH.join(XI4, "../")),
      (SZ_ = $6(() => {
        if (NK(process.env.USE_BUILTIN_RIPGREP)) {
          let { cmd: $ } = H5_("rg", []);
          if ($ !== "rg") return { mode: "system", command: "rg", args: [] };
        }
        if (Yw()) return { mode: "embedded", command: process.execPath, args: ["--no-config"], argv0: "rg" };
        let _ = WOH.resolve(WI4, "vendor", "ripgrep");
        return { mode: "builtin", command: WOH.resolve(_, "arm64-darwin", "rg"), args: [] };
      }));
    laq = class laq extends Error {
      partialResults;
      constructor(H, _) {
        super(H);
        this.partialResults = _;
        this.name = "RipgrepTimeoutError";
      }
    };
    EZ_ = $6(
      async (H, _, q = []) => {
        if (WOH.resolve(H) === WOH.resolve(Uaq.homedir())) return;
        try {
          let $ = ["--files", "--hidden"];
          q.forEach((z) => {
            $.push("--glob", `!${z}`);
          });
          let K = await RI4($, H, _);
          if (K === 0) return 0;
          let O = Math.floor(Math.log10(K)),
            T = Math.pow(10, O);
          return Math.round(K / T) * T;
        } catch ($) {
          if ($?.name !== "AbortError") AH($);
        }
      },
      (H, _, q = []) => `${H}|${q.join(",")}`,
    );
    ZI4 = $6(async () => {
      if (VZ_ !== null) return;
      let H = SZ_();
      try {
        let _;
        if (H.argv0) {
          let $ = Bun.spawn([H.command, "--version"], { argv0: H.argv0, stderr: "ignore", stdout: "pipe" }),
            [K, O] = await Promise.all([$.stdout.text(), $.exited]);
          _ = { code: O, stdout: K };
        } else _ = await t_(H.command, [...H.args, "--version"], { timeout: 5000 });
        let q = _.code === 0 && !!_.stdout && _.stdout.startsWith("ripgrep ");
        (VZ_ = { working: q, lastTested: Date.now(), config: H }),
          N(`Ripgrep first use test: ${q ? "PASSED" : "FAILED"} (mode=${H.mode}, path=${H.command})`),
          Q("tengu_ripgrep_availability", { working: q ? 1 : 0, using_system: H.mode === "system" ? 1 : 0 });
      } catch (_) {
        (VZ_ = { working: !1, lastTested: Date.now(), config: H }), AH(_);
      }
    });
