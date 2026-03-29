    NJ();
    IrH();
    u7();
    L_();
    k_();
    DW();
    y6();
    jK();
    g_();
    j9();
    n8();
    O3H();
    YB6();
    N_();
    M9();
    bY();
    H_();
    H_H();
    h_();
    jB6();
    F_();
    (fL7 = require("net")), (eZ = require("path"));
    nLH = {
      cursor: {
        ideKind: "vscode",
        displayName: "Cursor",
        processKeywordsMac: ["Cursor Helper", "Cursor.app"],
        processKeywordsWindows: ["cursor.exe"],
        processKeywordsLinux: ["cursor"],
      },
      windsurf: {
        ideKind: "vscode",
        displayName: "Windsurf",
        processKeywordsMac: ["Windsurf Helper", "Windsurf.app"],
        processKeywordsWindows: ["windsurf.exe"],
        processKeywordsLinux: ["windsurf"],
      },
      vscode: {
        ideKind: "vscode",
        displayName: "VS Code",
        processKeywordsMac: ["Visual Studio Code", "Code Helper"],
        processKeywordsWindows: ["code.exe"],
        processKeywordsLinux: ["code"],
      },
      intellij: {
        ideKind: "jetbrains",
        displayName: "IntelliJ IDEA",
        processKeywordsMac: ["IntelliJ IDEA"],
        processKeywordsWindows: ["idea64.exe"],
        processKeywordsLinux: ["idea", "intellij"],
      },
      pycharm: {
        ideKind: "jetbrains",
        displayName: "PyCharm",
        processKeywordsMac: ["PyCharm"],
        processKeywordsWindows: ["pycharm64.exe"],
        processKeywordsLinux: ["pycharm"],
      },
      webstorm: {
        ideKind: "jetbrains",
        displayName: "WebStorm",
        processKeywordsMac: ["WebStorm"],
        processKeywordsWindows: ["webstorm64.exe"],
        processKeywordsLinux: ["webstorm"],
      },
      phpstorm: {
        ideKind: "jetbrains",
        displayName: "PhpStorm",
        processKeywordsMac: ["PhpStorm"],
        processKeywordsWindows: ["phpstorm64.exe"],
        processKeywordsLinux: ["phpstorm"],
      },
      rubymine: {
        ideKind: "jetbrains",
        displayName: "RubyMine",
        processKeywordsMac: ["RubyMine"],
        processKeywordsWindows: ["rubymine64.exe"],
        processKeywordsLinux: ["rubymine"],
      },
      clion: {
        ideKind: "jetbrains",
        displayName: "CLion",
        processKeywordsMac: ["CLion"],
        processKeywordsWindows: ["clion64.exe"],
        processKeywordsLinux: ["clion"],
      },
      goland: {
        ideKind: "jetbrains",
        displayName: "GoLand",
        processKeywordsMac: ["GoLand"],
        processKeywordsWindows: ["goland64.exe"],
        processKeywordsLinux: ["goland"],
      },
      rider: {
        ideKind: "jetbrains",
        displayName: "Rider",
        processKeywordsMac: ["Rider"],
        processKeywordsWindows: ["rider64.exe"],
        processKeywordsLinux: ["rider"],
      },
      datagrip: {
        ideKind: "jetbrains",
        displayName: "DataGrip",
        processKeywordsMac: ["DataGrip"],
        processKeywordsWindows: ["datagrip64.exe"],
        processKeywordsLinux: ["datagrip"],
      },
      appcode: {
        ideKind: "jetbrains",
        displayName: "AppCode",
        processKeywordsMac: ["AppCode"],
        processKeywordsWindows: ["appcode.exe"],
        processKeywordsLinux: ["appcode"],
      },
      dataspell: {
        ideKind: "jetbrains",
        displayName: "DataSpell",
        processKeywordsMac: ["DataSpell"],
        processKeywordsWindows: ["dataspell64.exe"],
        processKeywordsLinux: ["dataspell"],
      },
      aqua: {
        ideKind: "jetbrains",
        displayName: "Aqua",
        processKeywordsMac: [],
        processKeywordsWindows: ["aqua64.exe"],
        processKeywordsLinux: [],
      },
      gateway: {
        ideKind: "jetbrains",
        displayName: "Gateway",
        processKeywordsMac: [],
        processKeywordsWindows: ["gateway64.exe"],
        processKeywordsLinux: [],
      },
      fleet: {
        ideKind: "jetbrains",
        displayName: "Fleet",
        processKeywordsMac: [],
        processKeywordsWindows: ["fleet.exe"],
        processKeywordsLinux: [],
      },
      androidstudio: {
        ideKind: "jetbrains",
        displayName: "Android Studio",
        processKeywordsMac: ["Android Studio"],
        processKeywordsWindows: ["studio64.exe"],
        processKeywordsLinux: ["android-studio"],
      },
    };
    (BrH = $6(() => {
      return KS_(a6.terminal);
    })),
      (rLH = $6(() => {
        return Vx(Lk.terminal);
      })),
      (sM = $6(() => {
        return BrH() || rLH() || Boolean(process.env.FORCE_CODE_TERMINAL);
      }));
    MA1 = $6(async () => {
      if (process.env.USERPROFILE) return process.env.USERPROFILE;
      let { stdout: H, code: _ } = await t_("powershell.exe", [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "$env:USERPROFILE",
      ]);
      if (_ === 0 && H.trim()) return H.trim();
      N("Unable to get Windows USERPROFILE via PowerShell - IDE detection may be incomplete");
      return;
    });
    AL7 = {
      code: "VS Code",
      cursor: "Cursor",
      windsurf: "Windsurf",
      antigravity: "Antigravity",
      vi: "Vim",
      vim: "Vim",
      nano: "nano",
      notepad: "Notepad",
      "start /wait notepad": "Notepad",
      emacs: "Emacs",
      subl: "Sublime Text",
      atom: "Atom",
    };
    RL7 = $6(
      async (H, _) => {
        if (process.env.CLAUDE_CODE_IDE_HOST_OVERRIDE) return process.env.CLAUDE_CODE_IDE_HOST_OVERRIDE;
        if (R6() !== "wsl" || !H) return "127.0.0.1";
        try {
          let q = await p1("ip route show | grep -i default", { shell: !0, reject: !1 });
          if (q.exitCode === 0 && q.stdout) {
            let $ = q.stdout.match(/default via (\d+\.\d+\.\d+\.\d+)/);
            if ($) {
              let K = $[1];
              if (await WB6(K, _)) return K;
            }
          }
        } catch (q) {}
        return "127.0.0.1";
      },
      (H, _) => `${H}:${_}`,
    );
