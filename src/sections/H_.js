    u7();
    k_();
    s1();
    eA8();
    g_();
    n8();
    F_();
    ($t = require("fs/promises")),
      (Q2H = require("path")),
      (oe_ = { verbose: 0, debug: 1, info: 2, warn: 3, error: 4 }),
      (N6$ = $6(() => {
        let H = process.env.CLAUDE_CODE_DEBUG_LOG_LEVEL?.toLowerCase().trim();
        if (H && Object.hasOwn(oe_, H)) return H;
        return "debug";
      })),
      (bR = $6(() => {
        return (
          ew8 ||
          lH(process.env.DEBUG) ||
          lH(process.env.DEBUG_SDK) ||
          process.argv.includes("--debug") ||
          process.argv.includes("-d") ||
          Bp() ||
          process.argv.some((H) => H.startsWith("--debug=")) ||
          _Y8() !== null
        );
      }));
    (h6$ = $6(() => {
      let H = process.argv.find((q) => q.startsWith("--debug="));
      if (!H) return null;
      let _ = H.substring(8);
      return sA8(_);
    })),
      (Bp = $6(() => {
        return process.argv.includes("--debug-to-stderr") || process.argv.includes("-d2e");
      })),
      (_Y8 = $6(() => {
        for (let H = 0; H < process.argv.length; H++) {
          let _ = process.argv[H];
          if (_.startsWith("--debug-file=")) return _.substring(13);
          if (_ === "--debug-file" && H + 1 < process.argv.length) return process.argv[H + 1];
        }
        return null;
      }));
    re_ = Promise.resolve();
    KY8 = $6(async () => {
      try {
        let H = y4H(),
          _ = Q2H.dirname(H),
          q = Q2H.join(_, "latest");
        await $t.unlink(q).catch(() => {}), await $t.symlink(H, q);
      } catch {}
    });
