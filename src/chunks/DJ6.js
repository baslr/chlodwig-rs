  var DJ6 = d((gO3, uMq) => {
    var GXH = XXH().Buffer,
      cS = require("crypto"),
      yMq = zJ6(),
      hMq = require("util"),
      o64 = `"%s" is not a valid algorithm.
  Supported algorithms are:
  "HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "PS256", "PS384", "PS512", "ES256", "ES384", "ES512" and "none".`,
      ygH = "secret must be a string or buffer",
      WXH = "key must be a string or a buffer",
      a64 = "key must be a string, a buffer or an object",
      wJ6 = typeof cS.createPublicKey === "function";
    if (wJ6) (WXH += " or a KeyObject"), (ygH += "or a KeyObject");
    function VMq(H) {
      if (GXH.isBuffer(H)) return;
      if (typeof H === "string") return;
      if (!wJ6) throw rI(WXH);
      if (typeof H !== "object") throw rI(WXH);
      if (typeof H.type !== "string") throw rI(WXH);
      if (typeof H.asymmetricKeyType !== "string") throw rI(WXH);
      if (typeof H.export !== "function") throw rI(WXH);
    }
    function SMq(H) {
      if (GXH.isBuffer(H)) return;
      if (typeof H === "string") return;
      if (typeof H === "object") return;
      throw rI(a64);
    }
    function s64(H) {
      if (GXH.isBuffer(H)) return;
      if (typeof H === "string") return H;
      if (!wJ6) throw rI(ygH);
      if (typeof H !== "object") throw rI(ygH);
      if (H.type !== "secret") throw rI(ygH);
      if (typeof H.export !== "function") throw rI(ygH);
    }
    function YJ6(H) {
      return H.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    function EMq(H) {
      H = H.toString();
      var _ = 4 - (H.length % 4);
      if (_ !== 4) for (var q = 0; q < _; ++q) H += "=";
      return H.replace(/\-/g, "+").replace(/_/g, "/");
    }
    function rI(H) {
      var _ = [].slice.call(arguments, 1),
        q = hMq.format.bind(hMq, H).apply(null, _);
      return TypeError(q);
    }
    function t64(H) {
      return GXH.isBuffer(H) || typeof H === "string";
    }
    function VgH(H) {
      if (!t64(H)) H = JSON.stringify(H);
      return H;
    }
    function CMq(H) {
      return function (q, $) {
        s64($), (q = VgH(q));
        var K = cS.createHmac("sha" + H, $),
          O = (K.update(q), K.digest("base64"));
        return YJ6(O);
      };
    }
    var fJ6,
      e64 =
        "timingSafeEqual" in cS
          ? function (_, q) {
              if (_.byteLength !== q.byteLength) return !1;
              return cS.timingSafeEqual(_, q);
            }
          : function (_, q) {
              if (!fJ6) fJ6 = NMq();
              return fJ6(_, q);
            };
    function H84(H) {
      return function (q, $, K) {
        var O = CMq(H)(q, K);
        return e64(GXH.from($), GXH.from(O));
      };
    }
    function bMq(H) {
      return function (q, $) {
        SMq($), (q = VgH(q));
        var K = cS.createSign("RSA-SHA" + H),
          O = (K.update(q), K.sign($, "base64"));
        return YJ6(O);
      };
    }
    function IMq(H) {
      return function (q, $, K) {
        VMq(K), (q = VgH(q)), ($ = EMq($));
        var O = cS.createVerify("RSA-SHA" + H);
        return O.update(q), O.verify(K, $, "base64");
      };
    }
    function _84(H) {
      return function (q, $) {
        SMq($), (q = VgH(q));
        var K = cS.createSign("RSA-SHA" + H),
          O =
            (K.update(q),
            K.sign(
              { key: $, padding: cS.constants.RSA_PKCS1_PSS_PADDING, saltLength: cS.constants.RSA_PSS_SALTLEN_DIGEST },
              "base64",
            ));
        return YJ6(O);
      };
    }
    function q84(H) {
      return function (q, $, K) {
        VMq(K), (q = VgH(q)), ($ = EMq($));
        var O = cS.createVerify("RSA-SHA" + H);
        return (
          O.update(q),
          O.verify(
            { key: K, padding: cS.constants.RSA_PKCS1_PSS_PADDING, saltLength: cS.constants.RSA_PSS_SALTLEN_DIGEST },
            $,
            "base64",
          )
        );
      };
    }
    function $84(H) {
      var _ = bMq(H);
      return function () {
        var $ = _.apply(null, arguments);
        return ($ = yMq.derToJose($, "ES" + H)), $;
      };
    }
    function K84(H) {
      var _ = IMq(H);
      return function ($, K, O) {
        K = yMq.joseToDer(K, "ES" + H).toString("base64");
        var T = _($, K, O);
        return T;
      };
    }
    function O84() {
      return function () {
        return "";
      };
    }
    function T84() {
      return function (_, q) {
        return q === "";
      };
    }
    uMq.exports = function (_) {
      var q = { hs: CMq, rs: bMq, ps: _84, es: $84, none: O84 },
        $ = { hs: H84, rs: IMq, ps: q84, es: K84, none: T84 },
        K = _.match(/^(RS|PS|ES|HS)(256|384|512)$|^(none)$/);
      if (!K) throw rI(o64, _);
      var O = (K[1] || K[3]).toLowerCase(),
        T = K[2];
      return { sign: q[O](T), verify: $[O](T) };
    };
  });
