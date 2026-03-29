  var nPq = d((pT3, iPq) => {
    var FPq = US(),
      EJ6 = ugH(),
      { ANY: SJ6 } = EJ6,
      pgH = mgH(),
      CJ6 = FS(),
      V74 = (H, _, q = {}) => {
        if (H === _) return !0;
        (H = new FPq(H, q)), (_ = new FPq(_, q));
        let $ = !1;
        H: for (let K of H.set) {
          for (let O of _.set) {
            let T = E74(K, O, q);
            if ((($ = $ || T !== null), T)) continue H;
          }
          if ($) return !1;
        }
        return !0;
      },
      S74 = [new EJ6(">=0.0.0-0")],
      UPq = [new EJ6(">=0.0.0")],
      E74 = (H, _, q) => {
        if (H === _) return !0;
        if (H.length === 1 && H[0].semver === SJ6)
          if (_.length === 1 && _[0].semver === SJ6) return !0;
          else if (q.includePrerelease) H = S74;
          else H = UPq;
        if (_.length === 1 && _[0].semver === SJ6)
          if (q.includePrerelease) return !0;
          else _ = UPq;
        let $ = new Set(),
          K,
          O;
        for (let j of H)
          if (j.operator === ">" || j.operator === ">=") K = QPq(K, j, q);
          else if (j.operator === "<" || j.operator === "<=") O = lPq(O, j, q);
          else $.add(j.semver);
        if ($.size > 1) return null;
        let T;
        if (K && O) {
          if (((T = CJ6(K.semver, O.semver, q)), T > 0)) return null;
          else if (T === 0 && (K.operator !== ">=" || O.operator !== "<=")) return null;
        }
        for (let j of $) {
          if (K && !pgH(j, String(K), q)) return null;
          if (O && !pgH(j, String(O), q)) return null;
          for (let M of _) if (!pgH(j, String(M), q)) return !1;
          return !0;
        }
        let z,
          A,
          f,
          w,
          Y = O && !q.includePrerelease && O.semver.prerelease.length ? O.semver : !1,
          D = K && !q.includePrerelease && K.semver.prerelease.length ? K.semver : !1;
        if (Y && Y.prerelease.length === 1 && O.operator === "<" && Y.prerelease[0] === 0) Y = !1;
        for (let j of _) {
          if (
            ((w = w || j.operator === ">" || j.operator === ">="),
            (f = f || j.operator === "<" || j.operator === "<="),
            K)
          ) {
            if (D) {
              if (
                j.semver.prerelease &&
                j.semver.prerelease.length &&
                j.semver.major === D.major &&
                j.semver.minor === D.minor &&
                j.semver.patch === D.patch
              )
                D = !1;
            }
            if (j.operator === ">" || j.operator === ">=") {
              if (((z = QPq(K, j, q)), z === j && z !== K)) return !1;
            } else if (K.operator === ">=" && !pgH(K.semver, String(j), q)) return !1;
          }
          if (O) {
            if (Y) {
              if (
                j.semver.prerelease &&
                j.semver.prerelease.length &&
                j.semver.major === Y.major &&
                j.semver.minor === Y.minor &&
                j.semver.patch === Y.patch
              )
                Y = !1;
            }
            if (j.operator === "<" || j.operator === "<=") {
              if (((A = lPq(O, j, q)), A === j && A !== O)) return !1;
            } else if (O.operator === "<=" && !pgH(O.semver, String(j), q)) return !1;
          }
          if (!j.operator && (O || K) && T !== 0) return !1;
        }
        if (K && f && !O && T !== 0) return !1;
        if (O && w && !K && T !== 0) return !1;
        if (D || Y) return !1;
        return !0;
      },
      QPq = (H, _, q) => {
        if (!H) return _;
        let $ = CJ6(H.semver, _.semver, q);
        return $ > 0 ? H : $ < 0 ? _ : _.operator === ">" && H.operator === ">=" ? _ : H;
      },
      lPq = (H, _, q) => {
        if (!H) return _;
        let $ = CJ6(H.semver, _.semver, q);
        return $ < 0 ? H : $ > 0 ? _ : _.operator === "<" && H.operator === "<=" ? _ : H;
      };
    iPq.exports = V74;
  });
