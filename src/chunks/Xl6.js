  var Xl6 = d((sgO, sd7) => {
    sd7.exports = ad7;
    var Pl6 = /[\s{}=;:[\],'"()<>]/g,
      xN1 = /(?:"([^"\\]*(?:\\.[^"\\]*)*)")/g,
      mN1 = /(?:'([^'\\]*(?:\\.[^'\\]*)*)')/g,
      pN1 = /^ *[*/]+ */,
      BN1 = /^\s*\*?\/*/,
      gN1 = /\n/g,
      dN1 = /\s/,
      cN1 = /\\(.?)/g,
      FN1 = {
        0: "\x00",
        r: "\r",
        n: `
`,
        t: "\t",
      };
    function od7(H) {
      return H.replace(cN1, function (_, q) {
        switch (q) {
          case "\\":
          case "":
            return q;
          default:
            return FN1[q] || "";
        }
      });
    }
    ad7.unescape = od7;
    function ad7(H, _) {
      H = H.toString();
      var q = 0,
        $ = H.length,
        K = 1,
        O = 0,
        T = {},
        z = [],
        A = null;
      function f(Z) {
        return Error("illegal " + Z + " (line " + K + ")");
      }
      function w() {
        var Z = A === "'" ? mN1 : xN1;
        Z.lastIndex = q - 1;
        var k = Z.exec(H);
        if (!k) throw f("string");
        return (q = Z.lastIndex), P(A), (A = null), od7(k[1]);
      }
      function Y(Z) {
        return H.charAt(Z);
      }
      function D(Z, k, v) {
        var y = { type: H.charAt(Z++), lineEmpty: !1, leading: v },
          E;
        if (_) E = 2;
        else E = 3;
        var S = Z - E,
          x;
        do
          if (
            --S < 0 ||
            (x = H.charAt(S)) ===
              `
`
          ) {
            y.lineEmpty = !0;
            break;
          }
        while (x === " " || x === "\t");
        var I = H.substring(Z, k).split(gN1);
        for (var B = 0; B < I.length; ++B) I[B] = I[B].replace(_ ? BN1 : pN1, "").trim();
        (y.text = I.join(`
`).trim()),
          (T[K] = y),
          (O = K);
      }
      function j(Z) {
        var k = M(Z),
          v = H.substring(Z, k),
          y = /^\s*\/\//.test(v);
        return y;
      }
      function M(Z) {
        var k = Z;
        while (
          k < $ &&
          Y(k) !==
            `
`
        )
          k++;
        return k;
      }
      function J() {
        if (z.length > 0) return z.shift();
        if (A) return w();
        var Z,
          k,
          v,
          y,
          E,
          S = q === 0;
        do {
          if (q === $) return null;
          Z = !1;
          while (dN1.test((v = Y(q)))) {
            if (
              v ===
              `
`
            )
              (S = !0), ++K;
            if (++q === $) return null;
          }
          if (Y(q) === "/") {
            if (++q === $) throw f("comment");
            if (Y(q) === "/")
              if (!_) {
                E = Y((y = q + 1)) === "/";
                while (
                  Y(++q) !==
                  `
`
                )
                  if (q === $) return null;
                if ((++q, E)) D(y, q - 1, S), (S = !0);
                ++K, (Z = !0);
              } else {
                if (((y = q), (E = !1), j(q - 1))) {
                  E = !0;
                  do {
                    if (((q = M(q)), q === $)) break;
                    if ((q++, !S)) break;
                  } while (j(q));
                } else q = Math.min($, M(q) + 1);
                if (E) D(y, q, S), (S = !0);
                K++, (Z = !0);
              }
            else if ((v = Y(q)) === "*") {
              (y = q + 1), (E = _ || Y(y) === "*");
              do {
                if (
                  v ===
                  `
`
                )
                  ++K;
                if (++q === $) throw f("comment");
                (k = v), (v = Y(q));
              } while (k !== "*" || v !== "/");
              if ((++q, E)) D(y, q - 2, S), (S = !0);
              Z = !0;
            } else return "/";
          }
        } while (Z);
        var x = q;
        Pl6.lastIndex = 0;
        var I = Pl6.test(Y(x++));
        if (!I) while (x < $ && !Pl6.test(Y(x))) ++x;
        var B = H.substring(q, (q = x));
        if (B === '"' || B === "'") A = B;
        return B;
      }
      function P(Z) {
        z.push(Z);
      }
      function X() {
        if (!z.length) {
          var Z = J();
          if (Z === null) return null;
          P(Z);
        }
        return z[0];
      }
      function R(Z, k) {
        var v = X(),
          y = v === Z;
        if (y) return J(), !0;
        if (!k) throw f("token '" + v + "', '" + Z + "' expected");
        return !1;
      }
      function W(Z) {
        var k = null,
          v;
        if (Z === void 0) {
          if (((v = T[K - 1]), delete T[K - 1], v && (_ || v.type === "*" || v.lineEmpty)))
            k = v.leading ? v.text : null;
        } else {
          if (O < Z) X();
          if (((v = T[Z]), delete T[Z], v && !v.lineEmpty && (_ || v.type === "/"))) k = v.leading ? null : v.text;
        }
        return k;
      }
      return Object.defineProperty({ next: J, peek: X, push: P, skip: R, cmnt: W }, "line", {
        get: function () {
          return K;
        },
      });
    }
  });
