    iH();
    zq();
    L_();
    q8();
    (OO1 = u(aH(), 1)),
      (Nx = u(PH(), 1)),
      (TO1 = ["user", "assistant", "grouped_tool_use", "collapsed_read_search", "system", "attachment"]),
      (Qy_ = {
        Read: { label: "path", extract: vx("file_path") },
        Edit: { label: "path", extract: vx("file_path") },
        Write: { label: "path", extract: vx("file_path") },
        NotebookEdit: { label: "path", extract: vx("notebook_path") },
        Bash: { label: "command", extract: vx("command") },
        Grep: { label: "pattern", extract: vx("pattern") },
        Glob: { label: "pattern", extract: vx("pattern") },
        WebFetch: { label: "url", extract: vx("url") },
        WebSearch: { label: "query", extract: vx("query") },
        Task: { label: "prompt", extract: vx("prompt") },
        Agent: { label: "prompt", extract: vx("prompt") },
        Tmux: { label: "command", extract: (H) => (Array.isArray(H.args) ? `tmux ${H.args.join(" ")}` : void 0) },
      });
    y07 = [
      Uy_({
        key: "enter",
        label: (H) => (H.expanded ? "collapse" : "expand"),
        types: ["grouped_tool_use", "collapsed_read_search", "attachment", "system"],
        stays: !0,
        run: () => {},
      }),
      Uy_({ key: "enter", label: "edit", types: ["user"], run: (H, _) => void _.edit(H) }),
      Uy_({ key: "c", label: "copy", types: TO1, run: (H, _) => _.copy(fO1(H)) }),
      Uy_({
        key: "p",
        label: (H) => `copy ${Qy_[H.toolName].label}`,
        types: ["grouped_tool_use", "assistant"],
        applies: (H) => H.toolName != null && H.toolName in Qy_,
        run: (H, _) => {
          let q = V07(H);
          if (!q) return;
          let $ = Qy_[q.name]?.extract(q.input);
          if ($) _.copy($);
        },
      }),
    ];
    (fzH = Nx.default.createContext(!1)), (XLH = Nx.default.createContext(!1));
