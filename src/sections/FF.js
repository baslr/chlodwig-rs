    u7();
    cu();
    H_();
    QL();
    (QU_ = require("child_process")), (X88 = require("path"));
    (m6K = ["code", "cursor", "windsurf", "codium", "subl", "atom", "gedit", "notepad++", "notepad"]),
      (p6K = /\b(vi|vim|nvim|nano|emacs|pico|micro|helix|hx)\b/),
      (B6K = new Set(["code", "cursor", "windsurf", "codium"]));
    YV = $6(() => {
      if (process.env.VISUAL?.trim()) return process.env.VISUAL.trim();
      if (process.env.EDITOR?.trim()) return process.env.EDITOR.trim();
      return ["code", "vi", "nano"].find((_) => x6K(_));
    });
