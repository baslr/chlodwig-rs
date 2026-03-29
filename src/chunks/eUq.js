  var eUq = d((QC3, tUq) => {
    var rUq = XE(),
      nv6 = ZUH(),
      { ANY: iv6 } = nv6,
      vUH = kUH(),
      rv6 = PE(),
      lv4 = (H, _, q = {}) => {
        if (H === _) return !0;
        (H = new rUq(H, q)), (_ = new rUq(_, q));
        let $ = !1;
        H: for (let K of H.set) {
          for (let O of _.set) {
            let T = nv4(K, O, q);
            if ((($ = $ || T !== null), T)) continue H;
          }
          if ($) return !1;
        }
        return !0;
      },
      iv4 = [new nv6(">=0.0.0-0")],
      oUq = [new nv6(">=0.0.0")],
      nv4 = (H, _, q) => {
        if (H === _) return !0;
        if (H.length === 1 && H[0].semver === iv6)
          if (_.length === 1 && _[0].semver === iv6) return !0;
          else if (q.includePrerelease) H = iv4;
          else H = oUq;
        if (_.length === 1 && _[0].semver === iv6)
          if (q.includePrerelease) return !0;
          else _ = oUq;
        let $ = new Set(),
          K,
          O;
        for (let j of H)
          if (j.operator === ">" || j.operator === ">=") K = aUq(K, j, q);
          else if (j.operator === "<" || j.operator === "<=") O = sUq(O, j, q);
          else $.add(j.semver);
        if ($.size > 1) return null;
        let T;
        if (K && O) {
          if (((T = rv6(K.semver, O.semver, q)), T > 0)) return null;
          else if (T === 0 && (K.operator !== ">=" || O.operator !== "<=")) return null;
        }
        for (let j of $) {
          if (K && !vUH(j, String(K), q)) return null;
          if (O && !vUH(j, String(O), q)) return null;
          for (let M of _) if (!vUH(j, String(M), q)) return !1;
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
              if (((z = aUq(K, j, q)), z === j && z !== K)) return !1;
            } else if (K.operator === ">=" && !vUH(K.semver, String(j), q)) return !1;
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
              if (((A = sUq(O, j, q)), A === j && A !== O)) return !1;
            } else if (O.operator === "<=" && !vUH(O.semver, String(j), q)) return !1;
          }
          if (!j.operator && (O || K) && T !== 0) return !1;
        }
        if (K && f && !O && T !== 0) return !1;
        if (O && w && !K && T !== 0) return !1;
        if (D || Y) return !1;
        return !0;
      },
      aUq = (H, _, q) => {
        if (!H) return _;
        let $ = rv6(H.semver, _.semver, q);
        return $ > 0 ? H : $ < 0 ? _ : _.operator === ">" && H.operator === ">=" ? _ : H;
      },
      sUq = (H, _, q) => {
        if (!H) return _;
        let $ = rv6(H.semver, _.semver, q);
        return $ < 0 ? H : $ > 0 ? _ : _.operator === "<" && H.operator === "<=" ? _ : H;
      };
    tUq.exports = lv4;
  });
