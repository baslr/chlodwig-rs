  var Csq = d((cd3, Esq) => {
    var Ssq =
        "(?:" +
        ["\\|\\|", "\\&\\&", ";;", "\\|\\&", "\\<\\(", "\\<\\<\\<", ">>", ">\\&", "<\\&", "[&;()|<>]"].join("|") +
        ")",
      Nsq = new RegExp("^" + Ssq + "$"),
      hsq = "|&;()<> \\t",
      xI4 = '"((\\\\"|[^"])*?)"',
      mI4 = "'((\\\\'|[^'])*?)'",
      pI4 = /^#$/,
      ysq = "'",
      Vsq = '"',
      ZV6 = "$",
      kOH = "",
      BI4 = 4294967296;
    for (mZ_ = 0; mZ_ < 4; mZ_++) kOH += (BI4 * Math.random()).toString(16);
    var mZ_,
      gI4 = new RegExp("^" + kOH);
    function dI4(H, _) {
      var q = _.lastIndex,
        $ = [],
        K;
      while ((K = _.exec(H))) if (($.push(K), _.lastIndex === K.index)) _.lastIndex += 1;
      return (_.lastIndex = q), $;
    }
    function cI4(H, _, q) {
      var $ = typeof H === "function" ? H(q) : H[q];
      if (typeof $ > "u" && q != "") $ = "";
      else if (typeof $ > "u") $ = "$";
      if (typeof $ === "object") return _ + kOH + JSON.stringify($) + kOH;
      return _ + $;
    }
    function FI4(H, _, q) {
      if (!q) q = {};
      var $ = q.escape || "\\",
        K = "(\\" + $ + `['"` + hsq + `]|[^\\s'"` + hsq + "])+",
        O = new RegExp(["(" + Ssq + ")", "(" + K + "|" + xI4 + "|" + mI4 + ")+"].join("|"), "g"),
        T = dI4(H, O);
      if (T.length === 0) return [];
      if (!_) _ = {};
      var z = !1;
      return T.map(function (A) {
        var f = A[0];
        if (!f || z) return;
        if (Nsq.test(f)) return { op: f };
        var w = !1,
          Y = !1,
          D = "",
          j = !1,
          M;
        function J() {
          M += 1;
          var R,
            W,
            Z = f.charAt(M);
          if (Z === "{") {
            if (((M += 1), f.charAt(M) === "}")) throw Error("Bad substitution: " + f.slice(M - 2, M + 1));
            if (((R = f.indexOf("}", M)), R < 0)) throw Error("Bad substitution: " + f.slice(M));
            (W = f.slice(M, R)), (M = R);
          } else if (/[*@#?$!_-]/.test(Z)) (W = Z), (M += 1);
          else {
            var k = f.slice(M);
            if (((R = k.match(/[^\w\d_]/)), !R)) (W = k), (M = f.length);
            else (W = k.slice(0, R.index)), (M += R.index - 1);
          }
          return cI4(_, "", W);
        }
        for (M = 0; M < f.length; M++) {
          var P = f.charAt(M);
          if (((j = j || (!w && (P === "*" || P === "?"))), Y)) (D += P), (Y = !1);
          else if (w)
            if (P === w) w = !1;
            else if (w == ysq) D += P;
            else if (P === $)
              if (((M += 1), (P = f.charAt(M)), P === Vsq || P === $ || P === ZV6)) D += P;
              else D += $ + P;
            else if (P === ZV6) D += J();
            else D += P;
          else if (P === Vsq || P === ysq) w = P;
          else if (Nsq.test(P)) return { op: f };
          else if (pI4.test(P)) {
            z = !0;
            var X = { comment: H.slice(A.index + M + 1) };
            if (D.length) return [D, X];
            return [X];
          } else if (P === $) Y = !0;
          else if (P === ZV6) D += J();
          else D += P;
        }
        if (j) return { op: "glob", pattern: D };
        return D;
      }).reduce(function (A, f) {
        return typeof f > "u" ? A : A.concat(f);
      }, []);
    }
    Esq.exports = function (_, q, $) {
      var K = FI4(_, q, $);
      if (typeof q !== "function") return K;
      return K.reduce(function (O, T) {
        if (typeof T === "object") return O.concat(T);
        var z = T.split(RegExp("(" + kOH + ".*?" + kOH + ")", "g"));
        if (z.length === 1) return O.concat(z[0]);
        return O.concat(
          z.filter(Boolean).map(function (A) {
            if (gI4.test(A)) return JSON.parse(A.split(kOH)[1]);
            return A;
          }),
        );
      }, []);
    };
  });
