  var KL8 = d((O_5, wxH) => {
    var R2$ = require("path"),
      y46 = TT(),
      Z2$ = oZ8(),
      L2$ = sZ8(),
      HL8 = eZ8(),
      yQ = {};
    function fxH(H, _) {
      return _.lockfilePath || `${H}.lock`;
    }
    function V46(H, _, q) {
      if (!_.realpath) return q(null, R2$.resolve(H));
      _.fs.realpath(H, q);
    }
    function h46(H, _, q) {
      let $ = fxH(H, _);
      _.fs.mkdir($, (K) => {
        if (!K)
          return HL8.probe($, _.fs, (O, T, z) => {
            if (O) return _.fs.rmdir($, () => {}), q(O);
            q(null, T, z);
          });
        if (K.code !== "EEXIST") return q(K);
        if (_.stale <= 0)
          return q(Object.assign(Error("Lock file is already being held"), { code: "ELOCKED", file: H }));
        _.fs.stat($, (O, T) => {
          if (O) {
            if (O.code === "ENOENT") return h46(H, { ..._, stale: 0 }, q);
            return q(O);
          }
          if (!_L8(T, _))
            return q(Object.assign(Error("Lock file is already being held"), { code: "ELOCKED", file: H }));
          qL8(H, _, (z) => {
            if (z) return q(z);
            h46(H, { ..._, stale: 0 }, q);
          });
        });
      });
    }
    function _L8(H, _) {
      return H.mtime.getTime() < Date.now() - _.stale;
    }
    function qL8(H, _, q) {
      _.fs.rmdir(fxH(H, _), ($) => {
        if ($ && $.code !== "ENOENT") return q($);
        q();
      });
    }
    function F5_(H, _) {
      let q = yQ[H];
      if (q.updateTimeout) return;
      if (
        ((q.updateDelay = q.updateDelay || _.update),
        (q.updateTimeout = setTimeout(() => {
          (q.updateTimeout = null),
            _.fs.stat(q.lockfilePath, ($, K) => {
              let O = q.lastUpdate + _.stale < Date.now();
              if ($) {
                if ($.code === "ENOENT" || O) return N46(H, q, Object.assign($, { code: "ECOMPROMISED" }));
                return (q.updateDelay = 1000), F5_(H, _);
              }
              if (q.mtime.getTime() !== K.mtime.getTime())
                return N46(
                  H,
                  q,
                  Object.assign(Error("Unable to update lock within the stale threshold"), { code: "ECOMPROMISED" }),
                );
              let z = HL8.getMtime(q.mtimePrecision);
              _.fs.utimes(q.lockfilePath, z, z, (A) => {
                let f = q.lastUpdate + _.stale < Date.now();
                if (q.released) return;
                if (A) {
                  if (A.code === "ENOENT" || f) return N46(H, q, Object.assign(A, { code: "ECOMPROMISED" }));
                  return (q.updateDelay = 1000), F5_(H, _);
                }
                (q.mtime = z), (q.lastUpdate = Date.now()), (q.updateDelay = null), F5_(H, _);
              });
            });
        }, q.updateDelay)),
        q.updateTimeout.unref)
      )
        q.updateTimeout.unref();
    }
    function N46(H, _, q) {
      if (((_.released = !0), _.updateTimeout)) clearTimeout(_.updateTimeout);
      if (yQ[H] === _) delete yQ[H];
      _.options.onCompromised(q);
    }
    function k2$(H, _, q) {
      (_ = {
        stale: 1e4,
        update: null,
        realpath: !0,
        retries: 0,
        fs: y46,
        onCompromised: ($) => {
          throw $;
        },
        ..._,
      }),
        (_.retries = _.retries || 0),
        (_.retries = typeof _.retries === "number" ? { retries: _.retries } : _.retries),
        (_.stale = Math.max(_.stale || 0, 2000)),
        (_.update = _.update == null ? _.stale / 2 : _.update || 0),
        (_.update = Math.max(Math.min(_.update, _.stale / 2), 1000)),
        V46(H, _, ($, K) => {
          if ($) return q($);
          let O = Z2$.operation(_.retries);
          O.attempt(() => {
            h46(K, _, (T, z, A) => {
              if (O.retry(T)) return;
              if (T) return q(O.mainError());
              let f = (yQ[K] = {
                lockfilePath: fxH(K, _),
                mtime: z,
                mtimePrecision: A,
                options: _,
                lastUpdate: Date.now(),
              });
              F5_(K, _),
                q(null, (w) => {
                  if (f.released)
                    return w && w(Object.assign(Error("Lock is already released"), { code: "ERELEASED" }));
                  $L8(K, { ..._, realpath: !1 }, w);
                });
            });
          });
        });
    }
    function $L8(H, _, q) {
      (_ = { fs: y46, realpath: !0, ..._ }),
        V46(H, _, ($, K) => {
          if ($) return q($);
          let O = yQ[K];
          if (!O) return q(Object.assign(Error("Lock is not acquired/owned by you"), { code: "ENOTACQUIRED" }));
          O.updateTimeout && clearTimeout(O.updateTimeout), (O.released = !0), delete yQ[K], qL8(K, _, q);
        });
    }
    function v2$(H, _, q) {
      (_ = { stale: 1e4, realpath: !0, fs: y46, ..._ }),
        (_.stale = Math.max(_.stale || 0, 2000)),
        V46(H, _, ($, K) => {
          if ($) return q($);
          _.fs.stat(fxH(K, _), (O, T) => {
            if (O) return O.code === "ENOENT" ? q(null, !1) : q(O);
            return q(null, !_L8(T, _));
          });
        });
    }
    function N2$() {
      return yQ;
    }
    L2$(() => {
      for (let H in yQ) {
        let _ = yQ[H].options;
        try {
          _.fs.rmdirSync(fxH(H, _));
        } catch (q) {}
      }
    });
    wxH.exports.lock = k2$;
    wxH.exports.unlock = $L8;
    wxH.exports.check = v2$;
    wxH.exports.getLocks = N2$;
  });
