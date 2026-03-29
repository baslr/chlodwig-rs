  var V$7 = d((Mi3, y$7) => {
    var E5 = XK();
    F3();
    y$7.exports = E5.log = E5.log || {};
    E5.log.levels = ["none", "error", "warning", "info", "debug", "verbose", "max"];
    var lk_ = {},
      cC6 = [],
      dlH = null;
    E5.log.LEVEL_LOCKED = 2;
    E5.log.NO_LEVEL_CHECK = 4;
    E5.log.INTERPOLATE = 8;
    for (UE = 0; UE < E5.log.levels.length; ++UE)
      (Uk_ = E5.log.levels[UE]), (lk_[Uk_] = { index: UE, name: Uk_.toUpperCase() });
    var Uk_, UE;
    E5.log.logMessage = function (H) {
      var _ = lk_[H.level].index;
      for (var q = 0; q < cC6.length; ++q) {
        var $ = cC6[q];
        if ($.flags & E5.log.NO_LEVEL_CHECK) $.f(H);
        else {
          var K = lk_[$.level].index;
          if (_ <= K) $.f($, H);
        }
      }
    };
    E5.log.prepareStandard = function (H) {
      if (!("standard" in H)) H.standard = lk_[H.level].name + " [" + H.category + "] " + H.message;
    };
    E5.log.prepareFull = function (H) {
      if (!("full" in H)) {
        var _ = [H.message];
        (_ = _.concat([])), (H.full = E5.util.format.apply(this, _));
      }
    };
    E5.log.prepareStandardFull = function (H) {
      if (!("standardFull" in H)) E5.log.prepareStandard(H), (H.standardFull = H.standard);
    };
    Qk_ = ["error", "warning", "info", "debug", "verbose"];
    for (UE = 0; UE < Qk_.length; ++UE)
      (function (_) {
        E5.log[_] = function (q, $) {
          var K = Array.prototype.slice.call(arguments).slice(2),
            O = { timestamp: new Date(), level: _, category: q, message: $, arguments: K };
          E5.log.logMessage(O);
        };
      })(Qk_[UE]);
    var Qk_, UE;
    E5.log.makeLogger = function (H) {
      var _ = { flags: 0, f: H };
      return E5.log.setLevel(_, "none"), _;
    };
    E5.log.setLevel = function (H, _) {
      var q = !1;
      if (H && !(H.flags & E5.log.LEVEL_LOCKED))
        for (var $ = 0; $ < E5.log.levels.length; ++$) {
          var K = E5.log.levels[$];
          if (_ == K) {
            (H.level = _), (q = !0);
            break;
          }
        }
      return q;
    };
    E5.log.lock = function (H, _) {
      if (typeof _ > "u" || _) H.flags |= E5.log.LEVEL_LOCKED;
      else H.flags &= ~E5.log.LEVEL_LOCKED;
    };
    E5.log.addLogger = function (H) {
      cC6.push(H);
    };
    if (typeof console < "u" && "log" in console) {
      if (console.error && console.warn && console.info && console.debug)
        (FC6 = {
          error: console.error,
          warning: console.warn,
          info: console.info,
          debug: console.debug,
          verbose: console.debug,
        }),
          (uRH = function (H, _) {
            E5.log.prepareStandard(_);
            var q = FC6[_.level],
              $ = [_.standard];
            ($ = $.concat(_.arguments.slice())), q.apply(console, $);
          }),
          (OTH = E5.log.makeLogger(uRH));
      else
        (uRH = function (_, q) {
          E5.log.prepareStandardFull(q), console.log(q.standardFull);
        }),
          (OTH = E5.log.makeLogger(uRH));
      E5.log.setLevel(OTH, "debug"), E5.log.addLogger(OTH), (dlH = OTH);
    } else console = { log: function () {} };
    var OTH, FC6, uRH;
    if (dlH !== null && typeof window < "u" && window.location) {
      if (((IRH = new URL(window.location.href).searchParams), IRH.has("console.level")))
        E5.log.setLevel(dlH, IRH.get("console.level").slice(-1)[0]);
      if (IRH.has("console.lock")) {
        if (((UC6 = IRH.get("console.lock").slice(-1)[0]), UC6 == "true")) E5.log.lock(dlH);
      }
    }
    var IRH, UC6;
    E5.log.consoleLogger = dlH;
  });
