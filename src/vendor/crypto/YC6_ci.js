  var YC6 = d((tl3, wC6) => {
    var d6H = XK();
    F3();
    IlH();
    pE();
    (function () {
      if (d6H.prime) {
        wC6.exports = d6H.prime;
        return;
      }
      var H = (wC6.exports = d6H.prime = d6H.prime || {}),
        _ = d6H.jsbn.BigInteger,
        q = [6, 4, 2, 4, 2, 4, 6, 2],
        $ = new _(null);
      $.fromInt(30);
      var K = function (Y, D) {
        return Y | D;
      };
      H.generateProbablePrime = function (Y, D, j) {
        if (typeof D === "function") (j = D), (D = {});
        D = D || {};
        var M = D.algorithm || "PRIMEINC";
        if (typeof M === "string") M = { name: M };
        M.options = M.options || {};
        var J = D.prng || d6H.random,
          P = {
            nextBytes: function (X) {
              var R = J.getBytesSync(X.length);
              for (var W = 0; W < X.length; ++W) X[W] = R.charCodeAt(W);
            },
          };
        if (M.name === "PRIMEINC") return O(Y, P, M.options, j);
        throw Error("Invalid prime generation algorithm: " + M.name);
      };
      function O(Y, D, j, M) {
        if ("workers" in j) return A(Y, D, j, M);
        return T(Y, D, j, M);
      }
      function T(Y, D, j, M) {
        var J = f(Y, D),
          P = 0,
          X = w(J.bitLength());
        if ("millerRabinTests" in j) X = j.millerRabinTests;
        var R = 10;
        if ("maxBlockTime" in j) R = j.maxBlockTime;
        z(J, Y, D, P, X, R, M);
      }
      function z(Y, D, j, M, J, P, X) {
        var R = +new Date();
        do {
          if (Y.bitLength() > D) Y = f(D, j);
          if (Y.isProbablePrime(J)) return X(null, Y);
          Y.dAddOffset(q[M++ % 8], 0);
        } while (P < 0 || +new Date() - R < P);
        d6H.util.setImmediate(function () {
          z(Y, D, j, M, J, P, X);
        });
      }
      function A(Y, D, j, M) {
        if (typeof Worker > "u") return T(Y, D, j, M);
        var J = f(Y, D),
          P = j.workers,
          X = j.workLoad || 100,
          R = (X * 30) / 8,
          W = j.workerScript || "forge/prime.worker.js";
        if (P === -1)
          return d6H.util.estimateCores(function (k, v) {
            if (k) v = 2;
            (P = v - 1), Z();
          });
        Z();
        function Z() {
          P = Math.max(1, P);
          var k = [];
          for (var v = 0; v < P; ++v) k[v] = new Worker(W);
          var y = P;
          for (var v = 0; v < P; ++v) k[v].addEventListener("message", S);
          var E = !1;
          function S(x) {
            if (E) return;
            --y;
            var I = x.data;
            if (I.found) {
              for (var B = 0; B < k.length; ++B) k[B].terminate();
              return (E = !0), M(null, new _(I.prime, 16));
            }
            if (J.bitLength() > Y) J = f(Y, D);
            var p = J.toString(16);
            x.target.postMessage({ hex: p, workLoad: X }), J.dAddOffset(R, 0);
          }
        }
      }
      function f(Y, D) {
        var j = new _(Y, D),
          M = Y - 1;
        if (!j.testBit(M)) j.bitwiseTo(_.ONE.shiftLeft(M), K, j);
        return j.dAddOffset(31 - j.mod($).byteValue(), 0), j;
      }
      function w(Y) {
        if (Y <= 100) return 27;
        if (Y <= 150) return 18;
        if (Y <= 200) return 15;
        if (Y <= 250) return 12;
        if (Y <= 300) return 9;
        if (Y <= 350) return 8;
        if (Y <= 400) return 7;
        if (Y <= 500) return 6;
        if (Y <= 600) return 5;
        if (Y <= 800) return 4;
        if (Y <= 1250) return 3;
        return 2;
      }
    })();
  });
