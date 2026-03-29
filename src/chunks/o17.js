  var o17 = d((ms3, r17) => {
    var tl4 = U17(),
      cb6 = i17(),
      n17 = jiH(),
      el4 = DiH(),
      Hi4 = (H) => H && typeof H === "object" && !Array.isArray(H),
      G2 = (H, _, q = !1) => {
        if (Array.isArray(H)) {
          let w = H.map((D) => G2(D, _, q));
          return (D) => {
            for (let j of w) {
              let M = j(D);
              if (M) return M;
            }
            return !1;
          };
        }
        let $ = Hi4(H) && H.tokens && H.input;
        if (H === "" || (typeof H !== "string" && !$)) throw TypeError("Expected pattern to be a non-empty string");
        let K = _ || {},
          O = K.windows,
          T = $ ? G2.compileRe(H, _) : G2.makeRe(H, _, !1, !0),
          z = T.state;
        delete T.state;
        let A = () => !1;
        if (K.ignore) {
          let w = { ..._, ignore: null, onMatch: null, onResult: null };
          A = G2(K.ignore, w, q);
        }
        let f = (w, Y = !1) => {
          let { isMatch: D, match: j, output: M } = G2.test(w, T, _, { glob: H, posix: O }),
            J = { glob: H, state: z, regex: T, posix: O, input: w, output: M, match: j, isMatch: D };
          if (typeof K.onResult === "function") K.onResult(J);
          if (D === !1) return (J.isMatch = !1), Y ? J : !1;
          if (A(w)) {
            if (typeof K.onIgnore === "function") K.onIgnore(J);
            return (J.isMatch = !1), Y ? J : !1;
          }
          if (typeof K.onMatch === "function") K.onMatch(J);
          return Y ? J : !0;
        };
        if (q) f.state = z;
        return f;
      };
    G2.test = (H, _, q, { glob: $, posix: K } = {}) => {
      if (typeof H !== "string") throw TypeError("Expected input to be a string");
      if (H === "") return { isMatch: !1, output: "" };
      let O = q || {},
        T = O.format || (K ? n17.toPosixSlashes : null),
        z = H === $,
        A = z && T ? T(H) : H;
      if (z === !1) (A = T ? T(H) : H), (z = A === $);
      if (z === !1 || O.capture === !0)
        if (O.matchBase === !0 || O.basename === !0) z = G2.matchBase(H, _, q, K);
        else z = _.exec(A);
      return { isMatch: Boolean(z), match: z, output: A };
    };
    G2.matchBase = (H, _, q) => {
      return (_ instanceof RegExp ? _ : G2.makeRe(_, q)).test(n17.basename(H));
    };
    G2.isMatch = (H, _, q) => G2(_, q)(H);
    G2.parse = (H, _) => {
      if (Array.isArray(H)) return H.map((q) => G2.parse(q, _));
      return cb6(H, { ..._, fastpaths: !1 });
    };
    G2.scan = (H, _) => tl4(H, _);
    G2.compileRe = (H, _, q = !1, $ = !1) => {
      if (q === !0) return H.output;
      let K = _ || {},
        O = K.contains ? "" : "^",
        T = K.contains ? "" : "$",
        z = `${O}(?:${H.output})${T}`;
      if (H && H.negated === !0) z = `^(?!${z}).*$`;
      let A = G2.toRegex(z, _);
      if ($ === !0) A.state = H;
      return A;
    };
    G2.makeRe = (H, _ = {}, q = !1, $ = !1) => {
      if (!H || typeof H !== "string") throw TypeError("Expected a non-empty string");
      let K = { negated: !1, fastpaths: !0 };
      if (_.fastpaths !== !1 && (H[0] === "." || H[0] === "*")) K.output = cb6.fastpaths(H, _);
      if (!K.output) K = cb6(H, _);
      return G2.compileRe(K, _, q, $);
    };
    G2.toRegex = (H, _) => {
      try {
        let q = _ || {};
        return new RegExp(H, q.flags || (q.nocase ? "i" : ""));
      } catch (q) {
        if (_ && _.debug === !0) throw q;
        return /$^/;
      }
    };
    G2.constants = el4;
    r17.exports = G2;
  });
