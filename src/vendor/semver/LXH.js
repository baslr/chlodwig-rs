  var LXH = d((cB, AJq) => {
    var { MAX_SAFE_COMPONENT_LENGTH: GJ6, MAX_SAFE_BUILD_LENGTH: h84, MAX_LENGTH: y84 } = EgH(),
      V84 = CgH();
    cB = AJq.exports = {};
    var S84 = (cB.re = []),
      E84 = (cB.safeRe = []),
      m7 = (cB.src = []),
      C84 = (cB.safeSrc = []),
      p7 = (cB.t = {}),
      b84 = 0,
      RJ6 = "[a-zA-Z0-9-]",
      I84 = [
        ["\\s", 1],
        ["\\d", y84],
        [RJ6, h84],
      ],
      u84 = (H) => {
        for (let [_, q] of I84) H = H.split(`${_}*`).join(`${_}{0,${q}}`).split(`${_}+`).join(`${_}{1,${q}}`);
        return H;
      },
      Z1 = (H, _, q) => {
        let $ = u84(_),
          K = b84++;
        V84(H, K, _),
          (p7[H] = K),
          (m7[K] = _),
          (C84[K] = $),
          (S84[K] = new RegExp(_, q ? "g" : void 0)),
          (E84[K] = new RegExp($, q ? "g" : void 0));
      };
    Z1("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    Z1("NUMERICIDENTIFIERLOOSE", "\\d+");
    Z1("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${RJ6}*`);
    Z1("MAINVERSION", `(${m7[p7.NUMERICIDENTIFIER]})\\.(${m7[p7.NUMERICIDENTIFIER]})\\.(${m7[p7.NUMERICIDENTIFIER]})`);
    Z1(
      "MAINVERSIONLOOSE",
      `(${m7[p7.NUMERICIDENTIFIERLOOSE]})\\.(${m7[p7.NUMERICIDENTIFIERLOOSE]})\\.(${m7[p7.NUMERICIDENTIFIERLOOSE]})`,
    );
    Z1("PRERELEASEIDENTIFIER", `(?:${m7[p7.NUMERICIDENTIFIER]}|${m7[p7.NONNUMERICIDENTIFIER]})`);
    Z1("PRERELEASEIDENTIFIERLOOSE", `(?:${m7[p7.NUMERICIDENTIFIERLOOSE]}|${m7[p7.NONNUMERICIDENTIFIER]})`);
    Z1("PRERELEASE", `(?:-(${m7[p7.PRERELEASEIDENTIFIER]}(?:\\.${m7[p7.PRERELEASEIDENTIFIER]})*))`);
    Z1("PRERELEASELOOSE", `(?:-?(${m7[p7.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${m7[p7.PRERELEASEIDENTIFIERLOOSE]})*))`);
    Z1("BUILDIDENTIFIER", `${RJ6}+`);
    Z1("BUILD", `(?:\\+(${m7[p7.BUILDIDENTIFIER]}(?:\\.${m7[p7.BUILDIDENTIFIER]})*))`);
    Z1("FULLPLAIN", `v?${m7[p7.MAINVERSION]}${m7[p7.PRERELEASE]}?${m7[p7.BUILD]}?`);
    Z1("FULL", `^${m7[p7.FULLPLAIN]}$`);
    Z1("LOOSEPLAIN", `[v=\\s]*${m7[p7.MAINVERSIONLOOSE]}${m7[p7.PRERELEASELOOSE]}?${m7[p7.BUILD]}?`);
    Z1("LOOSE", `^${m7[p7.LOOSEPLAIN]}$`);
    Z1("GTLT", "((?:<|>)?=?)");
    Z1("XRANGEIDENTIFIERLOOSE", `${m7[p7.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    Z1("XRANGEIDENTIFIER", `${m7[p7.NUMERICIDENTIFIER]}|x|X|\\*`);
    Z1(
      "XRANGEPLAIN",
      `[v=\\s]*(${m7[p7.XRANGEIDENTIFIER]})(?:\\.(${m7[p7.XRANGEIDENTIFIER]})(?:\\.(${m7[p7.XRANGEIDENTIFIER]})(?:${m7[p7.PRERELEASE]})?${m7[p7.BUILD]}?)?)?`,
    );
    Z1(
      "XRANGEPLAINLOOSE",
      `[v=\\s]*(${m7[p7.XRANGEIDENTIFIERLOOSE]})(?:\\.(${m7[p7.XRANGEIDENTIFIERLOOSE]})(?:\\.(${m7[p7.XRANGEIDENTIFIERLOOSE]})(?:${m7[p7.PRERELEASELOOSE]})?${m7[p7.BUILD]}?)?)?`,
    );
    Z1("XRANGE", `^${m7[p7.GTLT]}\\s*${m7[p7.XRANGEPLAIN]}$`);
    Z1("XRANGELOOSE", `^${m7[p7.GTLT]}\\s*${m7[p7.XRANGEPLAINLOOSE]}$`);
    Z1("COERCEPLAIN", `(^|[^\\d])(\\d{1,${GJ6}})(?:\\.(\\d{1,${GJ6}}))?(?:\\.(\\d{1,${GJ6}}))?`);
    Z1("COERCE", `${m7[p7.COERCEPLAIN]}(?:$|[^\\d])`);
    Z1("COERCEFULL", m7[p7.COERCEPLAIN] + `(?:${m7[p7.PRERELEASE]})?(?:${m7[p7.BUILD]})?(?:$|[^\\d])`);
    Z1("COERCERTL", m7[p7.COERCE], !0);
    Z1("COERCERTLFULL", m7[p7.COERCEFULL], !0);
    Z1("LONETILDE", "(?:~>?)");
    Z1("TILDETRIM", `(\\s*)${m7[p7.LONETILDE]}\\s+`, !0);
    cB.tildeTrimReplace = "$1~";
    Z1("TILDE", `^${m7[p7.LONETILDE]}${m7[p7.XRANGEPLAIN]}$`);
    Z1("TILDELOOSE", `^${m7[p7.LONETILDE]}${m7[p7.XRANGEPLAINLOOSE]}$`);
    Z1("LONECARET", "(?:\\^)");
    Z1("CARETTRIM", `(\\s*)${m7[p7.LONECARET]}\\s+`, !0);
    cB.caretTrimReplace = "$1^";
    Z1("CARET", `^${m7[p7.LONECARET]}${m7[p7.XRANGEPLAIN]}$`);
    Z1("CARETLOOSE", `^${m7[p7.LONECARET]}${m7[p7.XRANGEPLAINLOOSE]}$`);
    Z1("COMPARATORLOOSE", `^${m7[p7.GTLT]}\\s*(${m7[p7.LOOSEPLAIN]})$|^$`);
    Z1("COMPARATOR", `^${m7[p7.GTLT]}\\s*(${m7[p7.FULLPLAIN]})$|^$`);
    Z1("COMPARATORTRIM", `(\\s*)${m7[p7.GTLT]}\\s*(${m7[p7.LOOSEPLAIN]}|${m7[p7.XRANGEPLAIN]})`, !0);
    cB.comparatorTrimReplace = "$1$2$3";
    Z1("HYPHENRANGE", `^\\s*(${m7[p7.XRANGEPLAIN]})\\s+-\\s+(${m7[p7.XRANGEPLAIN]})\\s*$`);
    Z1("HYPHENRANGELOOSE", `^\\s*(${m7[p7.XRANGEPLAINLOOSE]})\\s+-\\s+(${m7[p7.XRANGEPLAINLOOSE]})\\s*$`);
    Z1("STAR", "(<|>)?=?\\s*\\*");
    Z1("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    Z1("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  });
