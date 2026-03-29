    u7();
    I8();
    H_();
    T1_();
    dp();
    M9();
    (XjH = u(require("path"))), (KM8 = u(require("path/win32")));
    (J_6 = $6(() => {
      if (process.env.CLAUDE_CODE_GIT_BASH_PATH) {
        if (M_6(process.env.CLAUDE_CODE_GIT_BASH_PATH)) return process.env.CLAUDE_CODE_GIT_BASH_PATH;
        console.error(
          `Claude Code was unable to find CLAUDE_CODE_GIT_BASH_PATH path "${process.env.CLAUDE_CODE_GIT_BASH_PATH}"`,
        ),
          process.exit(1);
      }
      let H = F5$("git");
      if (H) {
        let _ = KM8.join(H, "..", "..", "bin", "bash.exe");
        if (M_6(_)) return _;
      }
      console.error(
        "Claude Code on Windows requires git-bash (https://git-scm.com/downloads/win). If installed but not in PATH, set environment variable pointing to your bash.exe, similar to: CLAUDE_CODE_GIT_BASH_PATH=C:\\Program Files\\Git\\bin\\bash.exe",
      ),
        process.exit(1);
    })),
      (zX = XM(
        (H) => {
          if (H.startsWith("\\\\")) return H.replace(/\\/g, "/");
          let _ = H.match(/^([A-Za-z]):[/\\]/);
          if (_) return "/" + _[1].toLowerCase() + H.slice(2).replace(/\\/g, "/");
          return H.replace(/\\/g, "/");
        },
        (H) => H,
        500,
      )),
      (F4H = XM(
        (H) => {
          if (H.startsWith("//")) return H.replace(/\//g, "\\");
          let _ = H.match(/^\/cygdrive\/([A-Za-z])(\/|$)/);
          if (_) {
            let $ = _[1].toUpperCase(),
              K = H.slice(("/cygdrive/" + _[1]).length);
            return $ + ":" + (K || "\\").replace(/\//g, "\\");
          }
          let q = H.match(/^\/([A-Za-z])(\/|$)/);
          if (q) {
            let $ = q[1].toUpperCase(),
              K = H.slice(2);
            return $ + ":" + (K || "\\").replace(/\//g, "\\");
          }
          return H.replace(/\//g, "\\");
        },
        (H) => H,
        500,
      ));
