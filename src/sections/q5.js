    u7();
    ww();
    wx();
    k_();
    t6();
    MO();
    I8();
    g_();
    n8();
    h5();
    BD();
    M9();
    e7();
    _z();
    Q6();
    BGH();
    VG();
    Up();
    uY();
    dw();
    (Ah9 = require("crypto")),
      (fh9 = u(C3H(), 1)),
      (V8_ = require("os")),
      (z4 = require("path")),
      (owK = [
        ".gitconfig",
        ".gitmodules",
        ".bashrc",
        ".bash_profile",
        ".zshrc",
        ".zprofile",
        ".profile",
        ".ripgreprc",
        ".mcp.json",
        ".claude.json",
      ]),
      (awK = [".git", ".vscode", ".idea", ".claude"]);
    $U = z4.posix.sep;
    (hE = $6(function () {
      let _ = process.env.CLAUDE_CODE_TMPDIR || (R6() === "windows" ? V8_.tmpdir() : "/tmp"),
        q = f_(),
        $ = _;
      try {
        $ = q.realpathSync(_);
      } catch {}
      return z4.join($, xm6()) + z4.sep;
    })),
      (H$8 = $6(function () {
        let _ = Ah9.randomBytes(16).toString("hex");
        return z4.join(
          hE(),
          "bundled-skills",
          {
            ISSUES_EXPLAINER: "report the issue at https://github.com/anthropics/claude-code/issues",
            PACKAGE_URL: "@anthropic-ai/claude-code",
            README_URL: "https://code.claude.com/docs/en/overview",
            VERSION: "2.1.87",
            FEEDBACK_CHANNEL: "https://github.com/anthropics/claude-code/issues",
            BUILD_TIME: "2026-03-29T01:39:46Z",
          }.VERSION,
          _,
        );
      }));
    $YK = $6(TI);
