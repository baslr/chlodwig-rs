  var c0H = d((Vg, PFq) => {
    var { MAX_SAFE_COMPONENT_LENGTH: mv6, MAX_SAFE_BUILD_LENGTH: UL4, MAX_LENGTH: QL4 } = XUH(),
      lL4 = WUH();
    Vg = PFq.exports = {};
    var iL4 = (Vg.re = []),
      nL4 = (Vg.safeRe = []),
      B7 = (Vg.src = []),
      rL4 = (Vg.safeSrc = []),
      g7 = (Vg.t = {}),
      oL4 = 0,
      pv6 = "[a-zA-Z0-9-]",
      aL4 = [
        ["\\s", 1],
        ["\\d", QL4],
        [pv6, UL4],
      ],
      sL4 = (H) => {
        for (let [_, q] of aL4) H = H.split(`${_}*`).join(`${_}{0,${q}}`).split(`${_}+`).join(`${_}{1,${q}}`);
        return H;
      },
      k1 = (H, _, q) => {
        let $ = sL4(_),
          K = oL4++;
        lL4(H, K, _),
          (g7[H] = K),
          (B7[K] = _),
          (rL4[K] = $),
          (iL4[K] = new RegExp(_, q ? "g" : void 0)),
          (nL4[K] = new RegExp($, q ? "g" : void 0));
      };
    k1("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    k1("NUMERICIDENTIFIERLOOSE", "\\d+");
    k1("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${pv6}*`);
    k1("MAINVERSION", `(${B7[g7.NUMERICIDENTIFIER]})\\.(${B7[g7.NUMERICIDENTIFIER]})\\.(${B7[g7.NUMERICIDENTIFIER]})`);
    k1(
      "MAINVERSIONLOOSE",
      `(${B7[g7.NUMERICIDENTIFIERLOOSE]})\\.(${B7[g7.NUMERICIDENTIFIERLOOSE]})\\.(${B7[g7.NUMERICIDENTIFIERLOOSE]})`,
    );
    k1("PRERELEASEIDENTIFIER", `(?:${B7[g7.NONNUMERICIDENTIFIER]}|${B7[g7.NUMERICIDENTIFIER]})`);
    k1("PRERELEASEIDENTIFIERLOOSE", `(?:${B7[g7.NONNUMERICIDENTIFIER]}|${B7[g7.NUMERICIDENTIFIERLOOSE]})`);
    k1("PRERELEASE", `(?:-(${B7[g7.PRERELEASEIDENTIFIER]}(?:\\.${B7[g7.PRERELEASEIDENTIFIER]})*))`);
    k1("PRERELEASELOOSE", `(?:-?(${B7[g7.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${B7[g7.PRERELEASEIDENTIFIERLOOSE]})*))`);
    k1("BUILDIDENTIFIER", `${pv6}+`);
    k1("BUILD", `(?:\\+(${B7[g7.BUILDIDENTIFIER]}(?:\\.${B7[g7.BUILDIDENTIFIER]})*))`);
    k1("FULLPLAIN", `v?${B7[g7.MAINVERSION]}${B7[g7.PRERELEASE]}?${B7[g7.BUILD]}?`);
    k1("FULL", `^${B7[g7.FULLPLAIN]}$`);
    k1("LOOSEPLAIN", `[v=\\s]*${B7[g7.MAINVERSIONLOOSE]}${B7[g7.PRERELEASELOOSE]}?${B7[g7.BUILD]}?`);
    k1("LOOSE", `^${B7[g7.LOOSEPLAIN]}$`);
    k1("GTLT", "((?:<|>)?=?)");
    k1("XRANGEIDENTIFIERLOOSE", `${B7[g7.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    k1("XRANGEIDENTIFIER", `${B7[g7.NUMERICIDENTIFIER]}|x|X|\\*`);
    k1(
      "XRANGEPLAIN",
      `[v=\\s]*(${B7[g7.XRANGEIDENTIFIER]})(?:\\.(${B7[g7.XRANGEIDENTIFIER]})(?:\\.(${B7[g7.XRANGEIDENTIFIER]})(?:${B7[g7.PRERELEASE]})?${B7[g7.BUILD]}?)?)?`,
    );
    k1(
      "XRANGEPLAINLOOSE",
      `[v=\\s]*(${B7[g7.XRANGEIDENTIFIERLOOSE]})(?:\\.(${B7[g7.XRANGEIDENTIFIERLOOSE]})(?:\\.(${B7[g7.XRANGEIDENTIFIERLOOSE]})(?:${B7[g7.PRERELEASELOOSE]})?${B7[g7.BUILD]}?)?)?`,
    );
    k1("XRANGE", `^${B7[g7.GTLT]}\\s*${B7[g7.XRANGEPLAIN]}$`);
    k1("XRANGELOOSE", `^${B7[g7.GTLT]}\\s*${B7[g7.XRANGEPLAINLOOSE]}$`);
    k1("COERCEPLAIN", `(^|[^\\d])(\\d{1,${mv6}})(?:\\.(\\d{1,${mv6}}))?(?:\\.(\\d{1,${mv6}}))?`);
    k1("COERCE", `${B7[g7.COERCEPLAIN]}(?:$|[^\\d])`);
    k1("COERCEFULL", B7[g7.COERCEPLAIN] + `(?:${B7[g7.PRERELEASE]})?(?:${B7[g7.BUILD]})?(?:$|[^\\d])`);
    k1("COERCERTL", B7[g7.COERCE], !0);
    k1("COERCERTLFULL", B7[g7.COERCEFULL], !0);
    k1("LONETILDE", "(?:~>?)");
    k1("TILDETRIM", `(\\s*)${B7[g7.LONETILDE]}\\s+`, !0);
    Vg.tildeTrimReplace = "$1~";
    k1("TILDE", `^${B7[g7.LONETILDE]}${B7[g7.XRANGEPLAIN]}$`);
    k1("TILDELOOSE", `^${B7[g7.LONETILDE]}${B7[g7.XRANGEPLAINLOOSE]}$`);
    k1("LONECARET", "(?:\\^)");
    k1("CARETTRIM", `(\\s*)${B7[g7.LONECARET]}\\s+`, !0);
    Vg.caretTrimReplace = "$1^";
    k1("CARET", `^${B7[g7.LONECARET]}${B7[g7.XRANGEPLAIN]}$`);
    k1("CARETLOOSE", `^${B7[g7.LONECARET]}${B7[g7.XRANGEPLAINLOOSE]}$`);
    k1("COMPARATORLOOSE", `^${B7[g7.GTLT]}\\s*(${B7[g7.LOOSEPLAIN]})$|^$`);
    k1("COMPARATOR", `^${B7[g7.GTLT]}\\s*(${B7[g7.FULLPLAIN]})$|^$`);
    k1("COMPARATORTRIM", `(\\s*)${B7[g7.GTLT]}\\s*(${B7[g7.LOOSEPLAIN]}|${B7[g7.XRANGEPLAIN]})`, !0);
    Vg.comparatorTrimReplace = "$1$2$3";
    k1("HYPHENRANGE", `^\\s*(${B7[g7.XRANGEPLAIN]})\\s+-\\s+(${B7[g7.XRANGEPLAIN]})\\s*$`);
    k1("HYPHENRANGELOOSE", `^\\s*(${B7[g7.XRANGEPLAINLOOSE]})\\s+-\\s+(${B7[g7.XRANGEPLAINLOOSE]})\\s*$`);
    k1("STAR", "(<|>)?=?\\s*\\*");
    k1("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    k1("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  });
