  var yk_ = d((Ql3, e77) => {
    var xZ = XK();
    LRH();
    ig();
    F3();
    var bd4 = (xZ.pkcs5 = xZ.pkcs5 || {}),
      wn;
    if (xZ.util.isNodejs && !xZ.options.usePureJavaScript) wn = require("crypto");
    e77.exports =
      xZ.pbkdf2 =
      bd4.pbkdf2 =
        function (H, _, q, $, K, O) {
          if (typeof K === "function") (O = K), (K = null);
          if (
            xZ.util.isNodejs &&
            !xZ.options.usePureJavaScript &&
            wn.pbkdf2 &&
            (K === null || typeof K !== "object") &&
            (wn.pbkdf2Sync.length > 4 || !K || K === "sha1")
          ) {
            if (typeof K !== "string") K = "sha1";
            if (((H = Buffer.from(H, "binary")), (_ = Buffer.from(_, "binary")), !O)) {
              if (wn.pbkdf2Sync.length === 4) return wn.pbkdf2Sync(H, _, q, $).toString("binary");
              return wn.pbkdf2Sync(H, _, q, $, K).toString("binary");
            }
            if (wn.pbkdf2Sync.length === 4)
              return wn.pbkdf2(H, _, q, $, function (W, Z) {
                if (W) return O(W);
                O(null, Z.toString("binary"));
              });
            return wn.pbkdf2(H, _, q, $, K, function (W, Z) {
              if (W) return O(W);
              O(null, Z.toString("binary"));
            });
          }
          if (typeof K > "u" || K === null) K = "sha1";
          if (typeof K === "string") {
            if (!(K in xZ.md.algorithms)) throw Error("Unknown hash algorithm: " + K);
            K = xZ.md[K].create();
          }
          var T = K.digestLength;
          if ($ > 4294967295 * T) {
            var z = Error("Derived key is too long.");
            if (O) return O(z);
            throw z;
          }
          var A = Math.ceil($ / T),
            f = $ - (A - 1) * T,
            w = xZ.hmac.create();
          w.start(K, H);
          var Y = "",
            D,
            j,
            M;
          if (!O) {
            for (var J = 1; J <= A; ++J) {
              w.start(null, null), w.update(_), w.update(xZ.util.int32ToBytes(J)), (D = M = w.digest().getBytes());
              for (var P = 2; P <= q; ++P)
                w.start(null, null), w.update(M), (j = w.digest().getBytes()), (D = xZ.util.xorBytes(D, j, T)), (M = j);
              Y += J < A ? D : D.substr(0, f);
            }
            return Y;
          }
          var J = 1,
            P;
          function X() {
            if (J > A) return O(null, Y);
            w.start(null, null),
              w.update(_),
              w.update(xZ.util.int32ToBytes(J)),
              (D = M = w.digest().getBytes()),
              (P = 2),
              R();
          }
          function R() {
            if (P <= q)
              return (
                w.start(null, null),
                w.update(M),
                (j = w.digest().getBytes()),
                (D = xZ.util.xorBytes(D, j, T)),
                (M = j),
                ++P,
                xZ.util.setImmediate(R)
              );
            (Y += J < A ? D : D.substr(0, f)), ++J, X();
          }
          X();
        };
  });
