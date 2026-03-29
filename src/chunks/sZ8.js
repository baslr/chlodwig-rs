  var sZ8 = d(($_5, NMH) => {
    var Dw = global.process,
      Z1H = function (H) {
        return (
          H &&
          typeof H === "object" &&
          typeof H.removeListener === "function" &&
          typeof H.emit === "function" &&
          typeof H.reallyExit === "function" &&
          typeof H.listeners === "function" &&
          typeof H.kill === "function" &&
          typeof H.pid === "number" &&
          typeof H.on === "function"
        );
      };
    if (!Z1H(Dw))
      NMH.exports = function () {
        return function () {};
      };
    else {
      if (
        ((R46 = require("assert")),
        (L1H = aZ8()),
        (Z46 = /^win/i.test(Dw.platform)),
        (vMH = require("events")),
        typeof vMH !== "function")
      )
        vMH = vMH.EventEmitter;
      if (Dw.__signal_exit_emitter__) LM = Dw.__signal_exit_emitter__;
      else (LM = Dw.__signal_exit_emitter__ = new vMH()), (LM.count = 0), (LM.emitted = {});
      if (!LM.infinite) LM.setMaxListeners(1 / 0), (LM.infinite = !0);
      (NMH.exports = function (H, _) {
        if (!Z1H(global.process)) return function () {};
        if ((R46.equal(typeof H, "function", "a callback must be provided for exit handler"), k1H === !1)) d5_();
        var q = "exit";
        if (_ && _.alwaysLast) q = "afterexit";
        var $ = function () {
          if ((LM.removeListener(q, H), LM.listeners("exit").length === 0 && LM.listeners("afterexit").length === 0))
            TxH();
        };
        return LM.on(q, H), $;
      }),
        (TxH = function () {
          if (!k1H || !Z1H(global.process)) return;
          (k1H = !1),
            L1H.forEach(function (_) {
              try {
                Dw.removeListener(_, zxH[_]);
              } catch (q) {}
            }),
            (Dw.emit = AxH),
            (Dw.reallyExit = c5_),
            (LM.count -= 1);
        }),
        (NMH.exports.unload = TxH),
        (Ct = function (_, q, $) {
          if (LM.emitted[_]) return;
          (LM.emitted[_] = !0), LM.emit(_, q, $);
        }),
        (zxH = {}),
        L1H.forEach(function (H) {
          zxH[H] = function () {
            if (!Z1H(global.process)) return;
            var q = Dw.listeners(H);
            if (q.length === LM.count) {
              if ((TxH(), Ct("exit", null, H), Ct("afterexit", null, H), Z46 && H === "SIGHUP")) H = "SIGINT";
              Dw.kill(Dw.pid, H);
            }
          };
        }),
        (NMH.exports.signals = function () {
          return L1H;
        }),
        (k1H = !1),
        (d5_ = function () {
          if (k1H || !Z1H(global.process)) return;
          (k1H = !0),
            (LM.count += 1),
            (L1H = L1H.filter(function (_) {
              try {
                return Dw.on(_, zxH[_]), !0;
              } catch (q) {
                return !1;
              }
            })),
            (Dw.emit = k46),
            (Dw.reallyExit = L46);
        }),
        (NMH.exports.load = d5_),
        (c5_ = Dw.reallyExit),
        (L46 = function (_) {
          if (!Z1H(global.process)) return;
          (Dw.exitCode = _ || 0),
            Ct("exit", Dw.exitCode, null),
            Ct("afterexit", Dw.exitCode, null),
            c5_.call(Dw, Dw.exitCode);
        }),
        (AxH = Dw.emit),
        (k46 = function (_, q) {
          if (_ === "exit" && Z1H(global.process)) {
            if (q !== void 0) Dw.exitCode = q;
            var $ = AxH.apply(this, arguments);
            return Ct("exit", Dw.exitCode, null), Ct("afterexit", Dw.exitCode, null), $;
          } else return AxH.apply(this, arguments);
        });
    }
    var R46, L1H, Z46, vMH, LM, TxH, Ct, zxH, k1H, d5_, c5_, L46, AxH, k46;
  });
