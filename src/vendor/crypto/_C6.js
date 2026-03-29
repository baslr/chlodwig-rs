  var _C6 = d((il3, O97) => {
    var ag = XK();
    F3();
    var Vk_ = null;
    if (ag.util.isNodejs && !ag.options.usePureJavaScript && !process.versions["node-webkit"]) Vk_ = require("crypto");
    var ud4 = (O97.exports = ag.prng = ag.prng || {});
    ud4.create = function (H) {
      var _ = { plugin: H, key: null, seed: null, time: null, reseeds: 0, generated: 0, keyBytes: "" },
        q = H.md,
        $ = Array(32);
      for (var K = 0; K < 32; ++K) $[K] = q.create();
      (_.pools = $),
        (_.pool = 0),
        (_.generate = function (f, w) {
          if (!w) return _.generateSync(f);
          var Y = _.plugin.cipher,
            D = _.plugin.increment,
            j = _.plugin.formatKey,
            M = _.plugin.formatSeed,
            J = ag.util.createBuffer();
          (_.key = null), P();
          function P(X) {
            if (X) return w(X);
            if (J.length() >= f) return w(null, J.getBytes(f));
            if (_.generated > 1048575) _.key = null;
            if (_.key === null)
              return ag.util.nextTick(function () {
                O(P);
              });
            var R = Y(_.key, _.seed);
            (_.generated += R.length),
              J.putBytes(R),
              (_.key = j(Y(_.key, D(_.seed)))),
              (_.seed = M(Y(_.key, _.seed))),
              ag.util.setImmediate(P);
          }
        }),
        (_.generateSync = function (f) {
          var w = _.plugin.cipher,
            Y = _.plugin.increment,
            D = _.plugin.formatKey,
            j = _.plugin.formatSeed;
          _.key = null;
          var M = ag.util.createBuffer();
          while (M.length() < f) {
            if (_.generated > 1048575) _.key = null;
            if (_.key === null) T();
            var J = w(_.key, _.seed);
            (_.generated += J.length), M.putBytes(J), (_.key = D(w(_.key, Y(_.seed)))), (_.seed = j(w(_.key, _.seed)));
          }
          return M.getBytes(f);
        });
      function O(f) {
        if (_.pools[0].messageLength >= 32) return z(), f();
        var w = (32 - _.pools[0].messageLength) << 5;
        _.seedFile(w, function (Y, D) {
          if (Y) return f(Y);
          _.collect(D), z(), f();
        });
      }
      function T() {
        if (_.pools[0].messageLength >= 32) return z();
        var f = (32 - _.pools[0].messageLength) << 5;
        _.collect(_.seedFileSync(f)), z();
      }
      function z() {
        _.reseeds = _.reseeds === 4294967295 ? 0 : _.reseeds + 1;
        var f = _.plugin.md.create();
        f.update(_.keyBytes);
        var w = 1;
        for (var Y = 0; Y < 32; ++Y) {
          if (_.reseeds % w === 0) f.update(_.pools[Y].digest().getBytes()), _.pools[Y].start();
          w = w << 1;
        }
        (_.keyBytes = f.digest().getBytes()), f.start(), f.update(_.keyBytes);
        var D = f.digest().getBytes();
        (_.key = _.plugin.formatKey(_.keyBytes)), (_.seed = _.plugin.formatSeed(D)), (_.generated = 0);
      }
      function A(f) {
        var w = null,
          Y = ag.util.globalScope,
          D = Y.crypto || Y.msCrypto;
        if (D && D.getRandomValues)
          w = function (k) {
            return D.getRandomValues(k);
          };
        var j = ag.util.createBuffer();
        if (w)
          while (j.length() < f) {
            var M = Math.max(1, Math.min(f - j.length(), 65536) / 4),
              J = new Uint32Array(Math.floor(M));
            try {
              w(J);
              for (var P = 0; P < J.length; ++P) j.putInt32(J[P]);
            } catch (k) {
              if (!(typeof QuotaExceededError < "u" && k instanceof QuotaExceededError)) throw k;
            }
          }
        if (j.length() < f) {
          var X,
            R,
            W,
            Z = Math.floor(Math.random() * 65536);
          while (j.length() < f) {
            (R = 16807 * (Z & 65535)),
              (X = 16807 * (Z >> 16)),
              (R += (X & 32767) << 16),
              (R += X >> 15),
              (R = (R & 2147483647) + (R >> 31)),
              (Z = R & 4294967295);
            for (var P = 0; P < 3; ++P)
              (W = Z >>> (P << 3)), (W ^= Math.floor(Math.random() * 256)), j.putByte(W & 255);
          }
        }
        return j.getBytes(f);
      }
      if (Vk_)
        (_.seedFile = function (f, w) {
          Vk_.randomBytes(f, function (Y, D) {
            if (Y) return w(Y);
            w(null, D.toString());
          });
        }),
          (_.seedFileSync = function (f) {
            return Vk_.randomBytes(f).toString();
          });
      else
        (_.seedFile = function (f, w) {
          try {
            w(null, A(f));
          } catch (Y) {
            w(Y);
          }
        }),
          (_.seedFileSync = A);
      return (
        (_.collect = function (f) {
          var w = f.length;
          for (var Y = 0; Y < w; ++Y) _.pools[_.pool].update(f.substr(Y, 1)), (_.pool = _.pool === 31 ? 0 : _.pool + 1);
        }),
        (_.collectInt = function (f, w) {
          var Y = "";
          for (var D = 0; D < w; D += 8) Y += String.fromCharCode((f >> D) & 255);
          _.collect(Y);
        }),
        (_.registerWorker = function (f) {
          if (f === self)
            _.seedFile = function (Y, D) {
              function j(M) {
                var J = M.data;
                if (J.forge && J.forge.prng)
                  self.removeEventListener("message", j), D(J.forge.prng.err, J.forge.prng.bytes);
              }
              self.addEventListener("message", j), self.postMessage({ forge: { prng: { needed: Y } } });
            };
          else {
            var w = function (Y) {
              var D = Y.data;
              if (D.forge && D.forge.prng)
                _.seedFile(D.forge.prng.needed, function (j, M) {
                  f.postMessage({ forge: { prng: { err: j, bytes: M } } });
                });
            };
            f.addEventListener("message", w);
          }
        }),
        _
      );
    };
  });
