  var z67 = d((SQ3, T67) => {
    var _67 = TT(),
      $67 = require("path"),
      VD = require("assert");
    function K67(H) {
      ["unlink", "chmod", "stat", "lstat", "rmdir", "readdir"].forEach((q) => {
        (H[q] = H[q] || _67[q]), (q = q + "Sync"), (H[q] = H[q] || _67[q]);
      }),
        (H.maxBusyTries = H.maxBusyTries || 3);
    }
    function WE6(H, _, q) {
      let $ = 0;
      if (typeof _ === "function") (q = _), (_ = {});
      VD(H, "rimraf: missing path"),
        VD.strictEqual(typeof H, "string", "rimraf: path should be a string"),
        VD.strictEqual(typeof q, "function", "rimraf: callback function required"),
        VD(_, "rimraf: invalid options argument provided"),
        VD.strictEqual(typeof _, "object", "rimraf: options should be object"),
        K67(_),
        q67(H, _, function K(O) {
          if (O) {
            if ((O.code === "EBUSY" || O.code === "ENOTEMPTY" || O.code === "EPERM") && $ < _.maxBusyTries) {
              $++;
              let T = $ * 100;
              return setTimeout(() => q67(H, _, K), T);
            }
            if (O.code === "ENOENT") O = null;
          }
          q(O);
        });
    }
    function q67(H, _, q) {
      VD(H),
        VD(_),
        VD(typeof q === "function"),
        _.lstat(H, ($, K) => {
          if ($ && $.code === "ENOENT") return q(null);
          if (($ && $.code, K && K.isDirectory())) return PE6(H, _, $, q);
          _.unlink(H, (O) => {
            if (O) {
              if (O.code === "ENOENT") return q(null);
              if (O.code === "EPERM") return PE6(H, _, O, q);
              if (O.code === "EISDIR") return PE6(H, _, O, q);
            }
            return q(O);
          });
        });
    }
    function PE6(H, _, q, $) {
      VD(H),
        VD(_),
        VD(typeof $ === "function"),
        _.rmdir(H, (K) => {
          if (K && (K.code === "ENOTEMPTY" || K.code === "EEXIST" || K.code === "EPERM")) Kp4(H, _, $);
          else if (K && K.code === "ENOTDIR") $(q);
          else $(K);
        });
    }
    function Kp4(H, _, q) {
      VD(H),
        VD(_),
        VD(typeof q === "function"),
        _.readdir(H, ($, K) => {
          if ($) return q($);
          let O = K.length,
            T;
          if (O === 0) return _.rmdir(H, q);
          K.forEach((z) => {
            WE6($67.join(H, z), _, (A) => {
              if (T) return;
              if (A) return q((T = A));
              if (--O === 0) _.rmdir(H, q);
            });
          });
        });
    }
    function O67(H, _) {
      let q;
      (_ = _ || {}),
        K67(_),
        VD(H, "rimraf: missing path"),
        VD.strictEqual(typeof H, "string", "rimraf: path should be a string"),
        VD(_, "rimraf: missing options"),
        VD.strictEqual(typeof _, "object", "rimraf: options should be object");
      try {
        q = _.lstatSync(H);
      } catch ($) {
        if ($.code === "ENOENT") return;
        $.code;
      }
      try {
        if (q && q.isDirectory()) XE6(H, _, null);
        else _.unlinkSync(H);
      } catch ($) {
        if ($.code === "ENOENT") return;
        else if ($.code === "EPERM") return XE6(H, _, $);
        else if ($.code !== "EISDIR") throw $;
        XE6(H, _, $);
      }
    }
    function XE6(H, _, q) {
      VD(H), VD(_);
      try {
        _.rmdirSync(H);
      } catch ($) {
        if ($.code === "ENOTDIR") throw q;
        else if ($.code === "ENOTEMPTY" || $.code === "EEXIST" || $.code === "EPERM") Op4(H, _);
        else if ($.code !== "ENOENT") throw $;
      }
    }
    function Op4(H, _) {
      return VD(H), VD(_), _.readdirSync(H).forEach((q) => O67($67.join(H, q), _)), _.rmdirSync(H, _);
    }
    T67.exports = WE6;
    WE6.sync = O67;
  });
