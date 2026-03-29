  var pZ8 = d((oH5, mZ8) => {
    var Et = require("constants"),
      z2$ = process.cwd,
      x5_ = null,
      A2$ = process.env.GRACEFUL_FS_PLATFORM || "darwin";
    process.cwd = function () {
      if (!x5_) x5_ = z2$.call(process);
      return x5_;
    };
    try {
      process.cwd();
    } catch (H) {}
    if (typeof process.chdir === "function") {
      if (
        ((m5_ = process.chdir),
        (process.chdir = function (H) {
          (x5_ = null), m5_.call(process, H);
        }),
        Object.setPrototypeOf)
      )
        Object.setPrototypeOf(process.chdir, m5_);
    }
    var m5_;
    mZ8.exports = f2$;
    function f2$(H) {
      if (Et.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) _(H);
      if (!H.lutimes) q(H);
      if (
        ((H.chown = O(H.chown)),
        (H.fchown = O(H.fchown)),
        (H.lchown = O(H.lchown)),
        (H.chmod = $(H.chmod)),
        (H.fchmod = $(H.fchmod)),
        (H.lchmod = $(H.lchmod)),
        (H.chownSync = T(H.chownSync)),
        (H.fchownSync = T(H.fchownSync)),
        (H.lchownSync = T(H.lchownSync)),
        (H.chmodSync = K(H.chmodSync)),
        (H.fchmodSync = K(H.fchmodSync)),
        (H.lchmodSync = K(H.lchmodSync)),
        (H.stat = z(H.stat)),
        (H.fstat = z(H.fstat)),
        (H.lstat = z(H.lstat)),
        (H.statSync = A(H.statSync)),
        (H.fstatSync = A(H.fstatSync)),
        (H.lstatSync = A(H.lstatSync)),
        H.chmod && !H.lchmod)
      )
        (H.lchmod = function (w, Y, D) {
          if (D) process.nextTick(D);
        }),
          (H.lchmodSync = function () {});
      if (H.chown && !H.lchown)
        (H.lchown = function (w, Y, D, j) {
          if (j) process.nextTick(j);
        }),
          (H.lchownSync = function () {});
      if (A2$ === "win32")
        H.rename =
          typeof H.rename !== "function"
            ? H.rename
            : (function (w) {
                function Y(D, j, M) {
                  var J = Date.now(),
                    P = 0;
                  w(D, j, function X(R) {
                    if (
                      R &&
                      (R.code === "EACCES" || R.code === "EPERM" || R.code === "EBUSY") &&
                      Date.now() - J < 60000
                    ) {
                      if (
                        (setTimeout(function () {
                          H.stat(j, function (W, Z) {
                            if (W && W.code === "ENOENT") w(D, j, X);
                            else M(R);
                          });
                        }, P),
                        P < 100)
                      )
                        P += 10;
                      return;
                    }
                    if (M) M(R);
                  });
                }
                if (Object.setPrototypeOf) Object.setPrototypeOf(Y, w);
                return Y;
              })(H.rename);
      (H.read =
        typeof H.read !== "function"
          ? H.read
          : (function (w) {
              function Y(D, j, M, J, P, X) {
                var R;
                if (X && typeof X === "function") {
                  var W = 0;
                  R = function (Z, k, v) {
                    if (Z && Z.code === "EAGAIN" && W < 10) return W++, w.call(H, D, j, M, J, P, R);
                    X.apply(this, arguments);
                  };
                }
                return w.call(H, D, j, M, J, P, R);
              }
              if (Object.setPrototypeOf) Object.setPrototypeOf(Y, w);
              return Y;
            })(H.read)),
        (H.readSync =
          typeof H.readSync !== "function"
            ? H.readSync
            : (function (w) {
                return function (Y, D, j, M, J) {
                  var P = 0;
                  while (!0)
                    try {
                      return w.call(H, Y, D, j, M, J);
                    } catch (X) {
                      if (X.code === "EAGAIN" && P < 10) {
                        P++;
                        continue;
                      }
                      throw X;
                    }
                };
              })(H.readSync));
      function _(w) {
        (w.lchmod = function (Y, D, j) {
          w.open(Y, Et.O_WRONLY | Et.O_SYMLINK, D, function (M, J) {
            if (M) {
              if (j) j(M);
              return;
            }
            w.fchmod(J, D, function (P) {
              w.close(J, function (X) {
                if (j) j(P || X);
              });
            });
          });
        }),
          (w.lchmodSync = function (Y, D) {
            var j = w.openSync(Y, Et.O_WRONLY | Et.O_SYMLINK, D),
              M = !0,
              J;
            try {
              (J = w.fchmodSync(j, D)), (M = !1);
            } finally {
              if (M)
                try {
                  w.closeSync(j);
                } catch (P) {}
              else w.closeSync(j);
            }
            return J;
          });
      }
      function q(w) {
        if (Et.hasOwnProperty("O_SYMLINK") && w.futimes)
          (w.lutimes = function (Y, D, j, M) {
            w.open(Y, Et.O_SYMLINK, function (J, P) {
              if (J) {
                if (M) M(J);
                return;
              }
              w.futimes(P, D, j, function (X) {
                w.close(P, function (R) {
                  if (M) M(X || R);
                });
              });
            });
          }),
            (w.lutimesSync = function (Y, D, j) {
              var M = w.openSync(Y, Et.O_SYMLINK),
                J,
                P = !0;
              try {
                (J = w.futimesSync(M, D, j)), (P = !1);
              } finally {
                if (P)
                  try {
                    w.closeSync(M);
                  } catch (X) {}
                else w.closeSync(M);
              }
              return J;
            });
        else if (w.futimes)
          (w.lutimes = function (Y, D, j, M) {
            if (M) process.nextTick(M);
          }),
            (w.lutimesSync = function () {});
      }
      function $(w) {
        if (!w) return w;
        return function (Y, D, j) {
          return w.call(H, Y, D, function (M) {
            if (f(M)) M = null;
            if (j) j.apply(this, arguments);
          });
        };
      }
      function K(w) {
        if (!w) return w;
        return function (Y, D) {
          try {
            return w.call(H, Y, D);
          } catch (j) {
            if (!f(j)) throw j;
          }
        };
      }
      function O(w) {
        if (!w) return w;
        return function (Y, D, j, M) {
          return w.call(H, Y, D, j, function (J) {
            if (f(J)) J = null;
            if (M) M.apply(this, arguments);
          });
        };
      }
      function T(w) {
        if (!w) return w;
        return function (Y, D, j) {
          try {
            return w.call(H, Y, D, j);
          } catch (M) {
            if (!f(M)) throw M;
          }
        };
      }
      function z(w) {
        if (!w) return w;
        return function (Y, D, j) {
          if (typeof D === "function") (j = D), (D = null);
          function M(J, P) {
            if (P) {
              if (P.uid < 0) P.uid += 4294967296;
              if (P.gid < 0) P.gid += 4294967296;
            }
            if (j) j.apply(this, arguments);
          }
          return D ? w.call(H, Y, D, M) : w.call(H, Y, M);
        };
      }
      function A(w) {
        if (!w) return w;
        return function (Y, D) {
          var j = D ? w.call(H, Y, D) : w.call(H, Y);
          if (j) {
            if (j.uid < 0) j.uid += 4294967296;
            if (j.gid < 0) j.gid += 4294967296;
          }
          return j;
        };
      }
      function f(w) {
        if (!w) return !0;
        if (w.code === "ENOSYS") return !0;
        var Y = !process.getuid || process.getuid() !== 0;
        if (Y) {
          if (w.code === "EINVAL" || w.code === "EPERM") return !0;
        }
        return !1;
      }
    }
  });
