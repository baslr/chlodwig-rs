  var iv_ = d((ae3, I57) => {
    var W57 = require("child_process"),
      { isLinux: YZH, getReport: G57 } = D57(),
      { LDD_PATH: lv_, SELF_PATH: R57, readFile: wI6, readFileSync: YI6 } = M57(),
      { interpreterPath: Z57 } = P57(),
      Xd,
      Wd,
      Gd,
      q8H = "",
      L57 = () => {
        if (!q8H)
          return new Promise((H) => {
            W57.exec("getconf GNU_LIBC_VERSION 2>&1 || true; ldd --version 2>&1 || true", (_, q) => {
              (q8H = _ ? " " : q), H(q8H);
            });
          });
        return q8H;
      },
      k57 = () => {
        if (!q8H)
          try {
            q8H = W57.execSync("getconf GNU_LIBC_VERSION 2>&1 || true; ldd --version 2>&1 || true", {
              encoding: "utf8",
            });
          } catch (H) {
            q8H = " ";
          }
        return q8H;
      },
      Zn = "glibc",
      v57 = /LIBC[a-z0-9 \-).]*?(\d+\.\d+)/i,
      ZTH = "musl",
      kn4 = (H) => H.includes("libc.musl-") || H.includes("ld-musl-"),
      N57 = () => {
        let H = G57();
        if (H.header && H.header.glibcVersionRuntime) return Zn;
        if (Array.isArray(H.sharedObjects)) {
          if (H.sharedObjects.some(kn4)) return ZTH;
        }
        return null;
      },
      h57 = (H) => {
        let [_, q] = H.split(/[\r\n]+/);
        if (_ && _.includes(Zn)) return Zn;
        if (q && q.includes(ZTH)) return ZTH;
        return null;
      },
      y57 = (H) => {
        if (H) {
          if (H.includes("/ld-musl-")) return ZTH;
          else if (H.includes("/ld-linux-")) return Zn;
        }
        return null;
      },
      V57 = (H) => {
        if (((H = H.toString()), H.includes("musl"))) return ZTH;
        if (H.includes("GNU C Library")) return Zn;
        return null;
      },
      vn4 = async () => {
        if (Wd !== void 0) return Wd;
        Wd = null;
        try {
          let H = await wI6(lv_);
          Wd = V57(H);
        } catch (H) {}
        return Wd;
      },
      Nn4 = () => {
        if (Wd !== void 0) return Wd;
        Wd = null;
        try {
          let H = YI6(lv_);
          Wd = V57(H);
        } catch (H) {}
        return Wd;
      },
      hn4 = async () => {
        if (Xd !== void 0) return Xd;
        Xd = null;
        try {
          let H = await wI6(R57),
            _ = Z57(H);
          Xd = y57(_);
        } catch (H) {}
        return Xd;
      },
      yn4 = () => {
        if (Xd !== void 0) return Xd;
        Xd = null;
        try {
          let H = YI6(R57),
            _ = Z57(H);
          Xd = y57(_);
        } catch (H) {}
        return Xd;
      },
      S57 = async () => {
        let H = null;
        if (YZH()) {
          if (((H = await hn4()), !H)) {
            if (((H = await vn4()), !H)) H = N57();
            if (!H) {
              let _ = await L57();
              H = h57(_);
            }
          }
        }
        return H;
      },
      E57 = () => {
        let H = null;
        if (YZH()) {
          if (((H = yn4()), !H)) {
            if (((H = Nn4()), !H)) H = N57();
            if (!H) {
              let _ = k57();
              H = h57(_);
            }
          }
        }
        return H;
      },
      Vn4 = async () => YZH() && (await S57()) !== Zn,
      Sn4 = () => YZH() && E57() !== Zn,
      En4 = async () => {
        if (Gd !== void 0) return Gd;
        Gd = null;
        try {
          let _ = (await wI6(lv_)).match(v57);
          if (_) Gd = _[1];
        } catch (H) {}
        return Gd;
      },
      Cn4 = () => {
        if (Gd !== void 0) return Gd;
        Gd = null;
        try {
          let _ = YI6(lv_).match(v57);
          if (_) Gd = _[1];
        } catch (H) {}
        return Gd;
      },
      C57 = () => {
        let H = G57();
        if (H.header && H.header.glibcVersionRuntime) return H.header.glibcVersionRuntime;
        return null;
      },
      X57 = (H) => H.trim().split(/\s+/)[1],
      b57 = (H) => {
        let [_, q, $] = H.split(/[\r\n]+/);
        if (_ && _.includes(Zn)) return X57(_);
        if (q && $ && q.includes(ZTH)) return X57($);
        return null;
      },
      bn4 = async () => {
        let H = null;
        if (YZH()) {
          if (((H = await En4()), !H)) H = C57();
          if (!H) {
            let _ = await L57();
            H = b57(_);
          }
        }
        return H;
      },
      In4 = () => {
        let H = null;
        if (YZH()) {
          if (((H = Cn4()), !H)) H = C57();
          if (!H) {
            let _ = k57();
            H = b57(_);
          }
        }
        return H;
      };
    I57.exports = {
      GLIBC: Zn,
      MUSL: ZTH,
      family: S57,
      familySync: E57,
      isNonGlibcLinux: Vn4,
      isNonGlibcLinuxSync: Sn4,
      version: bn4,
      versionSync: In4,
    };
  });
