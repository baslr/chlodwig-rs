  var lk9 = d((Hi_) => {
    (function (H) {
      (H.black = "\x1B[30m"),
        (H.red = "\x1B[31m"),
        (H.green = "\x1B[32m"),
        (H.yellow = "\x1B[33m"),
        (H.blue = "\x1B[34m"),
        (H.magenta = "\x1B[35m"),
        (H.cyan = "\x1B[36m"),
        (H.lightgray = "\x1B[37m"),
        (H.default = "\x1B[39m"),
        (H.darkgray = "\x1B[90m"),
        (H.lightred = "\x1B[91m"),
        (H.lightgreen = "\x1B[92m"),
        (H.lightyellow = "\x1B[93m"),
        (H.lightblue = "\x1B[94m"),
        (H.lightmagenta = "\x1B[95m"),
        (H.lightcyan = "\x1B[96m"),
        (H.white = "\x1B[97m"),
        (H.reset = "\x1B[0m");
      function _(q, $) {
        return $ === void 0 ? q : $ + q + H.reset;
      }
      (H.colored = _),
        (H.plot = function (q, $ = void 0) {
          if (typeof q[0] == "number") q = [q];
          $ = typeof $ < "u" ? $ : {};
          let K = typeof $.min < "u" ? $.min : q[0][0],
            O = typeof $.max < "u" ? $.max : q[0][0];
          for (let Z = 0; Z < q.length; Z++)
            for (let k = 0; k < q[Z].length; k++) (K = Math.min(K, q[Z][k])), (O = Math.max(O, q[Z][k]));
          let T = ["\u253C", "\u2524", "\u2576", "\u2574", "\u2500", "\u2570", "\u256D", "\u256E", "\u256F", "\u2502"],
            z = Math.abs(O - K),
            A = typeof $.offset < "u" ? $.offset : 3,
            f = typeof $.padding < "u" ? $.padding : "           ",
            w = typeof $.height < "u" ? $.height : z,
            Y = typeof $.colors < "u" ? $.colors : [],
            D = z !== 0 ? w / z : 1,
            j = Math.round(K * D),
            M = Math.round(O * D),
            J = Math.abs(M - j),
            P = 0;
          for (let Z = 0; Z < q.length; Z++) P = Math.max(P, q[Z].length);
          P = P + A;
          let X = typeof $.symbols < "u" ? $.symbols : T,
            R =
              typeof $.format < "u"
                ? $.format
                : function (Z) {
                    return (f + Z.toFixed(2)).slice(-f.length);
                  },
            W = Array(J + 1);
          for (let Z = 0; Z <= J; Z++) {
            W[Z] = Array(P);
            for (let k = 0; k < P; k++) W[Z][k] = " ";
          }
          for (let Z = j; Z <= M; ++Z) {
            let k = R(J > 0 ? O - ((Z - j) * z) / J : Z, Z - j);
            (W[Z - j][Math.max(A - k.length, 0)] = k), (W[Z - j][A - 1] = Z == 0 ? X[0] : X[1]);
          }
          for (let Z = 0; Z < q.length; Z++) {
            let k = Y[Z % Y.length],
              v = Math.round(q[Z][0] * D) - j;
            W[J - v][A - 1] = _(X[0], k);
            for (let y = 0; y < q[Z].length - 1; y++) {
              let E = Math.round(q[Z][y + 0] * D) - j,
                S = Math.round(q[Z][y + 1] * D) - j;
              if (E == S) W[J - E][y + A] = _(X[4], k);
              else {
                (W[J - S][y + A] = _(E > S ? X[5] : X[6], k)), (W[J - E][y + A] = _(E > S ? X[7] : X[8], k));
                let x = Math.min(E, S),
                  I = Math.max(E, S);
                for (let B = x + 1; B < I; B++) W[J - B][y + A] = _(X[9], k);
              }
            }
          }
          return W.map(function (Z) {
            return Z.join("");
          }).join(`
`);
        });
    })(typeof Hi_ > "u" ? (Hi_.asciichart = {}) : Hi_);
  });
