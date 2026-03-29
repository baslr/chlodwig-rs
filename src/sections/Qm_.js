    u7();
    H_();
    j9();
    M9();
    (il7 = require("fs/promises")),
      (cm_ = $6(async () => {
        try {
          let H = await il7.readFile("/etc/os-release", "utf8"),
            _ = H.match(/^ID=["']?(\S+?)["']?\s*$/m),
            q = H.match(/^ID_LIKE=["']?(.+?)["']?\s*$/m);
          return { id: _?.[1] ?? "", idLike: q?.[1]?.split(" ") ?? [] };
        } catch {
          return null;
        }
      }));
    (Xn6 = $6(async () => {
      if (R6() !== "linux") return !1;
      let _ = await cm_();
      if (_ && !Fm_(_, ["arch"])) return !1;
      let q = process.execPath || process.argv[0] || "",
        $ = await t_("pacman", ["-Qo", q], { timeout: 5000, useCwd: !1 });
      if ($.code === 0 && $.stdout) return N(`Detected pacman installation: ${$.stdout.trim()}`), !0;
      return !1;
    })),
      (Wn6 = $6(async () => {
        if (R6() !== "linux") return !1;
        let _ = await cm_();
        if (_ && !Fm_(_, ["debian"])) return !1;
        let q = process.execPath || process.argv[0] || "",
          $ = await t_("dpkg", ["-S", q], { timeout: 5000, useCwd: !1 });
        if ($.code === 0 && $.stdout) return N(`Detected deb installation: ${$.stdout.trim()}`), !0;
        return !1;
      })),
      (Gn6 = $6(async () => {
        if (R6() !== "linux") return !1;
        let _ = await cm_();
        if (_ && !Fm_(_, ["fedora", "rhel", "suse"])) return !1;
        let q = process.execPath || process.argv[0] || "",
          $ = await t_("rpm", ["-qf", q], { timeout: 5000, useCwd: !1 });
        if ($.code === 0 && $.stdout) return N(`Detected rpm installation: ${$.stdout.trim()}`), !0;
        return !1;
      })),
      (Rn6 = $6(async () => {
        if (R6() !== "linux") return !1;
        let _ = await cm_();
        if (_ && !Fm_(_, ["alpine"])) return !1;
        let q = process.execPath || process.argv[0] || "",
          $ = await t_("apk", ["info", "--who-owns", q], { timeout: 5000, useCwd: !1 });
        if ($.code === 0 && $.stdout) return N(`Detected apk installation: ${$.stdout.trim()}`), !0;
        return !1;
      })),
      (sNH = $6(async () => {
        if (Um_()) return "homebrew";
        if (Pn6()) return "winget";
        if (Mn6()) return "mise";
        if (Jn6()) return "asdf";
        if (await Xn6()) return "pacman";
        if (await Rn6()) return "apk";
        if (await Wn6()) return "deb";
        if (await Gn6()) return "rpm";
        return "unknown";
      }));
