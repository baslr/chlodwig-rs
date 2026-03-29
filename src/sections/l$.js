    u7();
    MH6();
    I8();
    H_();
    SO();
    j9();
    TQ();
    N_();
    dp();
    QL();
    (oj8 = require("crypto")),
      (Fp = require("fs")),
      (zQ = require("fs/promises")),
      (zD = require("path")),
      (aj8 = Symbol("git-root-not-found")),
      (Qj8 = XM(
        (H) => {
          let _ = Date.now();
          n_("info", "find_git_root_started");
          let q = zD.resolve(H),
            $ = q.substring(0, q.indexOf(zD.sep) + 1) || zD.sep,
            K = 0;
          while (q !== $) {
            try {
              let T = zD.join(q, ".git");
              K++;
              let z = Fp.statSync(T);
              if (z.isDirectory() || z.isFile())
                return (
                  n_("info", "find_git_root_completed", { duration_ms: Date.now() - _, stat_count: K, found: !0 }),
                  q.normalize("NFC")
                );
            } catch {}
            let O = zD.dirname(q);
            if (O === q) break;
            q = O;
          }
          try {
            let O = zD.join($, ".git");
            K++;
            let T = Fp.statSync(O);
            if (T.isDirectory() || T.isFile())
              return (
                n_("info", "find_git_root_completed", { duration_ms: Date.now() - _, stat_count: K, found: !0 }),
                $.normalize("NFC")
              );
          } catch {}
          return n_("info", "find_git_root_completed", { duration_ms: Date.now() - _, stat_count: K, found: !1 }), aj8;
        },
        (H) => H,
        50,
      )),
      (w3 = b5$());
    (lj8 = XM(
      (H) => {
        try {
          let _ = Fp.readFileSync(zD.join(H, ".git"), "utf-8").trim();
          if (!_.startsWith("gitdir:")) return H;
          let q = zD.resolve(H, _.slice(7).trim()),
            $ = zD.resolve(q, Fp.readFileSync(zD.join(q, "commondir"), "utf-8").trim());
          if (zD.resolve(zD.dirname(q)) !== zD.join($, "worktrees")) return H;
          if (
            Fp.realpathSync(Fp.readFileSync(zD.join(q, "gitdir"), "utf-8").trim()) !==
            zD.join(Fp.realpathSync(H), ".git")
          )
            return H;
          if (zD.basename($) !== ".git") return $.normalize("NFC");
          return zD.dirname($).normalize("NFC");
        } catch {
          return H;
        }
      },
      (H) => H,
      50,
    )),
      (_j = I5$());
    (C8 = $6(() => {
      return MjH("git") || "git";
    })),
      (AD = $6(async () => {
        let H = Date.now();
        n_("info", "is_git_check_started");
        let _ = w3(X_()) !== null;
        return n_("info", "is_git_check_completed", { duration_ms: Date.now() - H, is_git: _ }), _;
      }));
