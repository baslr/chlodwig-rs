  var $q7 = d((Tl3, qq7) => {
    var s87 = TT(),
      e87 = require("path"),
      SD = require("assert");
    function Hq7(H) {
      ["unlink", "chmod", "stat", "lstat", "rmdir", "readdir"].forEach((q) => {
        (H[q] = H[q] || s87[q]), (q = q + "Sync"), (H[q] = H[q] || s87[q]);
      }),
        (H.maxBusyTries = H.maxBusyTries || 3);
    }
    function bE6(H, _, q) {
      let $ = 0;
      if (typeof _ === "function") (q = _), (_ = {});
      SD(H, "rimraf: missing path"),
        SD.strictEqual(typeof H, "string", "rimraf: path should be a string"),
        SD.strictEqual(typeof q, "function", "rimraf: callback function required"),
        SD(_, "rimraf: invalid options argument provided"),
        SD.strictEqual(typeof _, "object", "rimraf: options should be object"),
        Hq7(_),
        t87(H, _, function K(O) {
          if (O) {
            if ((O.code === "EBUSY" || O.code === "ENOTEMPTY" || O.code === "EPERM") && $ < _.maxBusyTries) {
              $++;
              let T = $ * 100;
              return setTimeout(() => t87(H, _, K), T);
            }
            if (O.code === "ENOENT") O = null;
          }
          q(O);
        });
    }
    function t87(H, _, q) {
      SD(H),
        SD(_),
        SD(typeof q === "function"),
        _.lstat(H, ($, K) => {
          if ($ && $.code === "ENOENT") return q(null);
          if (($ && $.code, K && K.isDirectory())) return EE6(H, _, $, q);
          _.unlink(H, (O) => {
            if (O) {
              if (O.code === "ENOENT") return q(null);
              if (O.code === "EPERM") return EE6(H, _, O, q);
              if (O.code === "EISDIR") return EE6(H, _, O, q);
            }
            return q(O);
          });
        });
    }
    function EE6(H, _, q, $) {
      SD(H),
        SD(_),
        SD(typeof $ === "function"),
        _.rmdir(H, (K) => {
          if (K && (K.code === "ENOTEMPTY" || K.code === "EEXIST" || K.code === "EPERM")) $g4(H, _, $);
          else if (K && K.code === "ENOTDIR") $(q);
          else $(K);
        });
    }
    function $g4(H, _, q) {
      SD(H),
        SD(_),
        SD(typeof q === "function"),
        _.readdir(H, ($, K) => {
          if ($) return q($);
          let O = K.length,
            T;
          if (O === 0) return _.rmdir(H, q);
          K.forEach((z) => {
            bE6(e87.join(H, z), _, (A) => {
              if (T) return;
              if (A) return q((T = A));
              if (--O === 0) _.rmdir(H, q);
            });
          });
        });
    }
    function _q7(H, _) {
      let q;
      (_ = _ || {}),
        Hq7(_),
        SD(H, "rimraf: missing path"),
        SD.strictEqual(typeof H, "string", "rimraf: path should be a string"),
        SD(_, "rimraf: missing options"),
        SD.strictEqual(typeof _, "object", "rimraf: options should be object");
      try {
        q = _.lstatSync(H);
      } catch ($) {
        if ($.code === "ENOENT") return;
        $.code;
      }
      try {
        if (q && q.isDirectory()) CE6(H, _, null);
        else _.unlinkSync(H);
      } catch ($) {
        if ($.code === "ENOENT") return;
        else if ($.code === "EPERM") return CE6(H, _, $);
        else if ($.code !== "EISDIR") throw $;
        CE6(H, _, $);
      }
    }
    function CE6(H, _, q) {
      SD(H), SD(_);
      try {
        _.rmdirSync(H);
      } catch ($) {
        if ($.code === "ENOTDIR") throw q;
        else if ($.code === "ENOTEMPTY" || $.code === "EEXIST" || $.code === "EPERM") Kg4(H, _);
        else if ($.code !== "ENOENT") throw $;
      }
    }
    function Kg4(H, _) {
      return SD(H), SD(_), _.readdirSync(H).forEach((q) => _q7(e87.join(H, q), _)), _.rmdirSync(H, _);
    }
    qq7.exports = bE6;
    bE6.sync = _q7;
  });
