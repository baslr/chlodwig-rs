  var TT = d((tH5, W46) => {
    var AY = require("fs"),
      j2$ = pZ8(),
      M2$ = dZ8(),
      J2$ = FZ8(),
      p5_ = require("util"),
      wX,
      g5_;
    if (typeof Symbol === "function" && typeof Symbol.for === "function")
      (wX = Symbol.for("graceful-fs.queue")), (g5_ = Symbol.for("graceful-fs.previous"));
    else (wX = "___graceful-fs.queue"), (g5_ = "___graceful-fs.previous");
    function P2$() {}
    function QZ8(H, _) {
      Object.defineProperty(H, wX, {
        get: function () {
          return _;
        },
      });
    }
    var G1H = P2$;
    if (p5_.debuglog) G1H = p5_.debuglog("gfs4");
    else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ""))
      G1H = function () {
        var H = p5_.format.apply(p5_, arguments);
        (H =
          "GFS4: " +
          H.split(/\n/).join(`
GFS4: `)),
          console.error(H);
      };
    if (!AY[wX]) {
      if (
        ((J46 = global[wX] || []),
        QZ8(AY, J46),
        (AY.close = (function (H) {
          function _(q, $) {
            return H.call(AY, q, function (K) {
              if (!K) UZ8();
              if (typeof $ === "function") $.apply(this, arguments);
            });
          }
          return Object.defineProperty(_, g5_, { value: H }), _;
        })(AY.close)),
        (AY.closeSync = (function (H) {
          function _(q) {
            H.apply(AY, arguments), UZ8();
          }
          return Object.defineProperty(_, g5_, { value: H }), _;
        })(AY.closeSync)),
        /\bgfs4\b/i.test(process.env.NODE_DEBUG || ""))
      )
        process.on("exit", function () {
          G1H(AY[wX]), require("assert").equal(AY[wX].length, 0);
        });
    }
    var J46;
    if (!global[wX]) QZ8(global, AY[wX]);
    W46.exports = P46(J2$(AY));
    if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !AY.__patched) (W46.exports = P46(AY)), (AY.__patched = !0);
    function P46(H) {
      j2$(H), (H.gracefulify = P46), (H.createReadStream = k), (H.createWriteStream = v);
      var _ = H.readFile;
      H.readFile = q;
      function q(S, x, I) {
        if (typeof x === "function") (I = x), (x = null);
        return B(S, x, I);
        function B(p, C, g, c) {
          return _(p, C, function (U) {
            if (U && (U.code === "EMFILE" || U.code === "ENFILE")) kMH([B, [p, C, g], U, c || Date.now(), Date.now()]);
            else if (typeof g === "function") g.apply(this, arguments);
          });
        }
      }
      var $ = H.writeFile;
      H.writeFile = K;
      function K(S, x, I, B) {
        if (typeof I === "function") (B = I), (I = null);
        return p(S, x, I, B);
        function p(C, g, c, U, i) {
          return $(C, g, c, function (_H) {
            if (_H && (_H.code === "EMFILE" || _H.code === "ENFILE"))
              kMH([p, [C, g, c, U], _H, i || Date.now(), Date.now()]);
            else if (typeof U === "function") U.apply(this, arguments);
          });
        }
      }
      var O = H.appendFile;
      if (O) H.appendFile = T;
      function T(S, x, I, B) {
        if (typeof I === "function") (B = I), (I = null);
        return p(S, x, I, B);
        function p(C, g, c, U, i) {
          return O(C, g, c, function (_H) {
            if (_H && (_H.code === "EMFILE" || _H.code === "ENFILE"))
              kMH([p, [C, g, c, U], _H, i || Date.now(), Date.now()]);
            else if (typeof U === "function") U.apply(this, arguments);
          });
        }
      }
      var z = H.copyFile;
      if (z) H.copyFile = A;
      function A(S, x, I, B) {
        if (typeof I === "function") (B = I), (I = 0);
        return p(S, x, I, B);
        function p(C, g, c, U, i) {
          return z(C, g, c, function (_H) {
            if (_H && (_H.code === "EMFILE" || _H.code === "ENFILE"))
              kMH([p, [C, g, c, U], _H, i || Date.now(), Date.now()]);
            else if (typeof U === "function") U.apply(this, arguments);
          });
        }
      }
      var f = H.readdir;
      H.readdir = Y;
      var w = /^v[0-5]\./;
      function Y(S, x, I) {
        if (typeof x === "function") (I = x), (x = null);
        var B = w.test(process.version)
          ? function (g, c, U, i) {
              return f(g, p(g, c, U, i));
            }
          : function (g, c, U, i) {
              return f(g, c, p(g, c, U, i));
            };
        return B(S, x, I);
        function p(C, g, c, U) {
          return function (i, _H) {
            if (i && (i.code === "EMFILE" || i.code === "ENFILE")) kMH([B, [C, g, c], i, U || Date.now(), Date.now()]);
            else {
              if (_H && _H.sort) _H.sort();
              if (typeof c === "function") c.call(this, i, _H);
            }
          };
        }
      }
      if (process.version.substr(0, 4) === "v0.8") {
        var D = M2$(H);
        (X = D.ReadStream), (W = D.WriteStream);
      }
      var j = H.ReadStream;
      if (j) (X.prototype = Object.create(j.prototype)), (X.prototype.open = R);
      var M = H.WriteStream;
      if (M) (W.prototype = Object.create(M.prototype)), (W.prototype.open = Z);
      Object.defineProperty(H, "ReadStream", {
        get: function () {
          return X;
        },
        set: function (S) {
          X = S;
        },
        enumerable: !0,
        configurable: !0,
      }),
        Object.defineProperty(H, "WriteStream", {
          get: function () {
            return W;
          },
          set: function (S) {
            W = S;
          },
          enumerable: !0,
          configurable: !0,
        });
      var J = X;
      Object.defineProperty(H, "FileReadStream", {
        get: function () {
          return J;
        },
        set: function (S) {
          J = S;
        },
        enumerable: !0,
        configurable: !0,
      });
      var P = W;
      Object.defineProperty(H, "FileWriteStream", {
        get: function () {
          return P;
        },
        set: function (S) {
          P = S;
        },
        enumerable: !0,
        configurable: !0,
      });
      function X(S, x) {
        if (this instanceof X) return j.apply(this, arguments), this;
        else return X.apply(Object.create(X.prototype), arguments);
      }
      function R() {
        var S = this;
        E(S.path, S.flags, S.mode, function (x, I) {
          if (x) {
            if (S.autoClose) S.destroy();
            S.emit("error", x);
          } else (S.fd = I), S.emit("open", I), S.read();
        });
      }
      function W(S, x) {
        if (this instanceof W) return M.apply(this, arguments), this;
        else return W.apply(Object.create(W.prototype), arguments);
      }
      function Z() {
        var S = this;
        E(S.path, S.flags, S.mode, function (x, I) {
          if (x) S.destroy(), S.emit("error", x);
          else (S.fd = I), S.emit("open", I);
        });
      }
      function k(S, x) {
        return new H.ReadStream(S, x);
      }
      function v(S, x) {
        return new H.WriteStream(S, x);
      }
      var y = H.open;
      H.open = E;
      function E(S, x, I, B) {
        if (typeof I === "function") (B = I), (I = null);
        return p(S, x, I, B);
        function p(C, g, c, U, i) {
          return y(C, g, c, function (_H, HH) {
            if (_H && (_H.code === "EMFILE" || _H.code === "ENFILE"))
              kMH([p, [C, g, c, U], _H, i || Date.now(), Date.now()]);
            else if (typeof U === "function") U.apply(this, arguments);
          });
        }
      }
      return H;
    }
    function kMH(H) {
      G1H("ENQUEUE", H[0].name, H[1]), AY[wX].push(H), X46();
    }
    var B5_;
    function UZ8() {
      var H = Date.now();
      for (var _ = 0; _ < AY[wX].length; ++_) if (AY[wX][_].length > 2) (AY[wX][_][3] = H), (AY[wX][_][4] = H);
      X46();
    }
    function X46() {
      if ((clearTimeout(B5_), (B5_ = void 0), AY[wX].length === 0)) return;
      var H = AY[wX].shift(),
        _ = H[0],
        q = H[1],
        $ = H[2],
        K = H[3],
        O = H[4];
      if (K === void 0) G1H("RETRY", _.name, q), _.apply(null, q);
      else if (Date.now() - K >= 60000) {
        G1H("TIMEOUT", _.name, q);
        var T = q.pop();
        if (typeof T === "function") T.call(null, $);
      } else {
        var z = Date.now() - O,
          A = Math.max(O - K, 1),
          f = Math.min(A * 1.2, 100);
        if (z >= f) G1H("RETRY", _.name, q), _.apply(null, q.concat([K]));
        else AY[wX].push(H);
      }
      if (B5_ === void 0) B5_ = setTimeout(X46, 0);
    }
  });
