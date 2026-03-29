    u7();
    L_();
    k_();
    H_();
    g_();
    h_();
    T7();
    Bk();
    l$();
    Nj();
    kE();
    _z();
    fI();
    ROH();
    (raq = require("fs")),
      (au = require("fs/promises")),
      (oaq = require("os")),
      (gk = require("path")),
      (aaq = ["commands", "agents", "output-styles", "skills", "workflows", ...[]]);
    si = $6(
      async function (H, _) {
        let q = Date.now(),
          $ = gk.join(i6(), H),
          K = gk.join(RM(), ".claude", H),
          O = fV6(H, _),
          T = w3(_),
          z = _j(_);
        if (T && z && z !== T) {
          let X = kD(gk.join(T, ".claude", H));
          if (!O.some((W) => kD(W) === X)) {
            let W = gk.join(z, ".claude", H);
            if (!O.includes(W)) O.push(W);
          }
        }
        let [A, f, w] = await Promise.all([
            AV6(K).then((X) => X.map((R) => ({ ...R, baseDir: K, source: "policySettings" }))),
            fD("userSettings") && !(H === "agents" && wG("agents"))
              ? AV6($).then((X) => X.map((R) => ({ ...R, baseDir: $, source: "userSettings" })))
              : Promise.resolve([]),
            fD("projectSettings") && !(H === "agents" && wG("agents"))
              ? Promise.all(
                  O.map((X) => AV6(X).then((R) => R.map((W) => ({ ...W, baseDir: X, source: "projectSettings" })))),
                )
              : Promise.resolve([]),
          ]),
          Y = w.flat(),
          D = [...A, ...f, ...Y],
          j = await Promise.all(D.map((X) => kI4(X.filePath))),
          M = new Map(),
          J = [];
        for (let [X, R] of D.entries()) {
          let W = j[X] ?? null;
          if (W === null) {
            J.push(R);
            continue;
          }
          let Z = M.get(W);
          if (Z !== void 0) {
            N(`Skipping duplicate file '${R.filePath}' from ${R.source} (same inode already loaded from ${Z})`);
            continue;
          }
          M.set(W, R.source), J.push(R);
        }
        let P = D.length - J.length;
        if (P > 0) N(`Deduplicated ${P} files in ${H} (same inode via symlinks or hard links)`);
        return (
          Q("tengu_dir_search", {
            durationMs: Date.now() - q,
            managedFilesFound: A.length,
            userFilesFound: f.length,
            projectFilesFound: Y.length,
            projectDirsSearched: O.length,
            subdir: H,
          }),
          J
        );
      },
      (H, _) => `${H}:${_}`,
    );
