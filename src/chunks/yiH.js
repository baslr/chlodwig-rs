  var yiH = d((Rd, m57) => {
    var { MAX_SAFE_COMPONENT_LENGTH: DI6, MAX_SAFE_BUILD_LENGTH: pn4, MAX_LENGTH: Bn4 } = nv_(),
      gn4 = hiH();
    Rd = m57.exports = {};
    var dn4 = (Rd.re = []),
      cn4 = (Rd.safeRe = []),
      d7 = (Rd.src = []),
      Fn4 = (Rd.safeSrc = []),
      c7 = (Rd.t = {}),
      Un4 = 0,
      jI6 = "[a-zA-Z0-9-]",
      Qn4 = [
        ["\\s", 1],
        ["\\d", Bn4],
        [jI6, pn4],
      ],
      ln4 = (H) => {
        for (let [_, q] of Qn4) H = H.split(`${_}*`).join(`${_}{0,${q}}`).split(`${_}+`).join(`${_}{1,${q}}`);
        return H;
      },
      N1 = (H, _, q) => {
        let $ = ln4(_),
          K = Un4++;
        gn4(H, K, _),
          (c7[H] = K),
          (d7[K] = _),
          (Fn4[K] = $),
          (dn4[K] = new RegExp(_, q ? "g" : void 0)),
          (cn4[K] = new RegExp($, q ? "g" : void 0));
      };
    N1("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    N1("NUMERICIDENTIFIERLOOSE", "\\d+");
    N1("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${jI6}*`);
    N1("MAINVERSION", `(${d7[c7.NUMERICIDENTIFIER]})\\.(${d7[c7.NUMERICIDENTIFIER]})\\.(${d7[c7.NUMERICIDENTIFIER]})`);
    N1(
      "MAINVERSIONLOOSE",
      `(${d7[c7.NUMERICIDENTIFIERLOOSE]})\\.(${d7[c7.NUMERICIDENTIFIERLOOSE]})\\.(${d7[c7.NUMERICIDENTIFIERLOOSE]})`,
    );
    N1("PRERELEASEIDENTIFIER", `(?:${d7[c7.NONNUMERICIDENTIFIER]}|${d7[c7.NUMERICIDENTIFIER]})`);
    N1("PRERELEASEIDENTIFIERLOOSE", `(?:${d7[c7.NONNUMERICIDENTIFIER]}|${d7[c7.NUMERICIDENTIFIERLOOSE]})`);
    N1("PRERELEASE", `(?:-(${d7[c7.PRERELEASEIDENTIFIER]}(?:\\.${d7[c7.PRERELEASEIDENTIFIER]})*))`);
    N1("PRERELEASELOOSE", `(?:-?(${d7[c7.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${d7[c7.PRERELEASEIDENTIFIERLOOSE]})*))`);
    N1("BUILDIDENTIFIER", `${jI6}+`);
    N1("BUILD", `(?:\\+(${d7[c7.BUILDIDENTIFIER]}(?:\\.${d7[c7.BUILDIDENTIFIER]})*))`);
    N1("FULLPLAIN", `v?${d7[c7.MAINVERSION]}${d7[c7.PRERELEASE]}?${d7[c7.BUILD]}?`);
    N1("FULL", `^${d7[c7.FULLPLAIN]}$`);
    N1("LOOSEPLAIN", `[v=\\s]*${d7[c7.MAINVERSIONLOOSE]}${d7[c7.PRERELEASELOOSE]}?${d7[c7.BUILD]}?`);
    N1("LOOSE", `^${d7[c7.LOOSEPLAIN]}$`);
    N1("GTLT", "((?:<|>)?=?)");
    N1("XRANGEIDENTIFIERLOOSE", `${d7[c7.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    N1("XRANGEIDENTIFIER", `${d7[c7.NUMERICIDENTIFIER]}|x|X|\\*`);
    N1(
      "XRANGEPLAIN",
      `[v=\\s]*(${d7[c7.XRANGEIDENTIFIER]})(?:\\.(${d7[c7.XRANGEIDENTIFIER]})(?:\\.(${d7[c7.XRANGEIDENTIFIER]})(?:${d7[c7.PRERELEASE]})?${d7[c7.BUILD]}?)?)?`,
    );
    N1(
      "XRANGEPLAINLOOSE",
      `[v=\\s]*(${d7[c7.XRANGEIDENTIFIERLOOSE]})(?:\\.(${d7[c7.XRANGEIDENTIFIERLOOSE]})(?:\\.(${d7[c7.XRANGEIDENTIFIERLOOSE]})(?:${d7[c7.PRERELEASELOOSE]})?${d7[c7.BUILD]}?)?)?`,
    );
    N1("XRANGE", `^${d7[c7.GTLT]}\\s*${d7[c7.XRANGEPLAIN]}$`);
    N1("XRANGELOOSE", `^${d7[c7.GTLT]}\\s*${d7[c7.XRANGEPLAINLOOSE]}$`);
    N1("COERCEPLAIN", `(^|[^\\d])(\\d{1,${DI6}})(?:\\.(\\d{1,${DI6}}))?(?:\\.(\\d{1,${DI6}}))?`);
    N1("COERCE", `${d7[c7.COERCEPLAIN]}(?:$|[^\\d])`);
    N1("COERCEFULL", d7[c7.COERCEPLAIN] + `(?:${d7[c7.PRERELEASE]})?(?:${d7[c7.BUILD]})?(?:$|[^\\d])`);
    N1("COERCERTL", d7[c7.COERCE], !0);
    N1("COERCERTLFULL", d7[c7.COERCEFULL], !0);
    N1("LONETILDE", "(?:~>?)");
    N1("TILDETRIM", `(\\s*)${d7[c7.LONETILDE]}\\s+`, !0);
    Rd.tildeTrimReplace = "$1~";
    N1("TILDE", `^${d7[c7.LONETILDE]}${d7[c7.XRANGEPLAIN]}$`);
    N1("TILDELOOSE", `^${d7[c7.LONETILDE]}${d7[c7.XRANGEPLAINLOOSE]}$`);
    N1("LONECARET", "(?:\\^)");
    N1("CARETTRIM", `(\\s*)${d7[c7.LONECARET]}\\s+`, !0);
    Rd.caretTrimReplace = "$1^";
    N1("CARET", `^${d7[c7.LONECARET]}${d7[c7.XRANGEPLAIN]}$`);
    N1("CARETLOOSE", `^${d7[c7.LONECARET]}${d7[c7.XRANGEPLAINLOOSE]}$`);
    N1("COMPARATORLOOSE", `^${d7[c7.GTLT]}\\s*(${d7[c7.LOOSEPLAIN]})$|^$`);
    N1("COMPARATOR", `^${d7[c7.GTLT]}\\s*(${d7[c7.FULLPLAIN]})$|^$`);
    N1("COMPARATORTRIM", `(\\s*)${d7[c7.GTLT]}\\s*(${d7[c7.LOOSEPLAIN]}|${d7[c7.XRANGEPLAIN]})`, !0);
    Rd.comparatorTrimReplace = "$1$2$3";
    N1("HYPHENRANGE", `^\\s*(${d7[c7.XRANGEPLAIN]})\\s+-\\s+(${d7[c7.XRANGEPLAIN]})\\s*$`);
    N1("HYPHENRANGELOOSE", `^\\s*(${d7[c7.XRANGEPLAINLOOSE]})\\s+-\\s+(${d7[c7.XRANGEPLAINLOOSE]})\\s*$`);
    N1("STAR", "(<|>)?=?\\s*\\*");
    N1("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    N1("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  });
