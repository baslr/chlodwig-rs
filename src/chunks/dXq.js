  var dXq = d((sT3, gXq) => {
    var bXq = WJ6(),
      Z44 = uJ6(),
      L44 = IJ6(),
      IXq = ZXH(),
      k44 = YXq(),
      jM_ = jXq(),
      uXq = WXq(),
      cJ6 = RXq(),
      mXq = vXq(),
      CHH = hXq(),
      v44 = CXq(),
      { KeyObject: N44, createSecretKey: h44, createPrivateKey: y44 } = require("crypto"),
      pXq = ["RS256", "RS384", "RS512", "ES256", "ES384", "ES512", "HS256", "HS384", "HS512", "none"];
    if (Z44) pXq.splice(3, 0, "PS256", "PS384", "PS512");
    var V44 = {
        expiresIn: {
          isValid: function (H) {
            return uXq(H) || (CHH(H) && H);
          },
          message: '"expiresIn" should be a number of seconds or string representing a timespan',
        },
        notBefore: {
          isValid: function (H) {
            return uXq(H) || (CHH(H) && H);
          },
          message: '"notBefore" should be a number of seconds or string representing a timespan',
        },
        audience: {
          isValid: function (H) {
            return CHH(H) || Array.isArray(H);
          },
          message: '"audience" must be a string or array',
        },
        algorithm: { isValid: k44.bind(null, pXq), message: '"algorithm" must be a valid string enum value' },
        header: { isValid: mXq, message: '"header" must be an object' },
        encoding: { isValid: CHH, message: '"encoding" must be a string' },
        issuer: { isValid: CHH, message: '"issuer" must be a string' },
        subject: { isValid: CHH, message: '"subject" must be a string' },
        jwtid: { isValid: CHH, message: '"jwtid" must be a string' },
        noTimestamp: { isValid: jM_, message: '"noTimestamp" must be a boolean' },
        keyid: { isValid: CHH, message: '"keyid" must be a string' },
        mutatePayload: { isValid: jM_, message: '"mutatePayload" must be a boolean' },
        allowInsecureKeySizes: { isValid: jM_, message: '"allowInsecureKeySizes" must be a boolean' },
        allowInvalidAsymmetricKeyTypes: { isValid: jM_, message: '"allowInvalidAsymmetricKeyTypes" must be a boolean' },
      },
      S44 = {
        iat: { isValid: cJ6, message: '"iat" should be a number of seconds' },
        exp: { isValid: cJ6, message: '"exp" should be a number of seconds' },
        nbf: { isValid: cJ6, message: '"nbf" should be a number of seconds' },
      };
    function BXq(H, _, q, $) {
      if (!mXq(q)) throw Error('Expected "' + $ + '" to be a plain object.');
      Object.keys(q).forEach(function (K) {
        let O = H[K];
        if (!O) {
          if (!_) throw Error('"' + K + '" is not allowed in "' + $ + '"');
          return;
        }
        if (!O.isValid(q[K])) throw Error(O.message);
      });
    }
    function E44(H) {
      return BXq(V44, !1, H, "options");
    }
    function C44(H) {
      return BXq(S44, !0, H, "payload");
    }
    var xXq = { audience: "aud", issuer: "iss", subject: "sub", jwtid: "jti" },
      b44 = ["expiresIn", "notBefore", "noTimestamp", "audience", "issuer", "subject", "jwtid"];
    gXq.exports = function (H, _, q, $) {
      if (typeof q === "function") ($ = q), (q = {});
      else q = q || {};
      let K = typeof H === "object" && !Buffer.isBuffer(H),
        O = Object.assign({ alg: q.algorithm || "HS256", typ: K ? "JWT" : void 0, kid: q.keyid }, q.header);
      function T(f) {
        if ($) return $(f);
        throw f;
      }
      if (!_ && q.algorithm !== "none") return T(Error("secretOrPrivateKey must have a value"));
      if (_ != null && !(_ instanceof N44))
        try {
          _ = y44(_);
        } catch (f) {
          try {
            _ = h44(typeof _ === "string" ? Buffer.from(_) : _);
          } catch (w) {
            return T(Error("secretOrPrivateKey is not valid key material"));
          }
        }
      if (O.alg.startsWith("HS") && _.type !== "secret")
        return T(Error(`secretOrPrivateKey must be a symmetric key when using ${O.alg}`));
      else if (/^(?:RS|PS|ES)/.test(O.alg)) {
        if (_.type !== "private") return T(Error(`secretOrPrivateKey must be an asymmetric key when using ${O.alg}`));
        if (
          !q.allowInsecureKeySizes &&
          !O.alg.startsWith("ES") &&
          _.asymmetricKeyDetails !== void 0 &&
          _.asymmetricKeyDetails.modulusLength < 2048
        )
          return T(Error(`secretOrPrivateKey has a minimum key size of 2048 bits for ${O.alg}`));
      }
      if (typeof H > "u") return T(Error("payload is required"));
      else if (K) {
        try {
          C44(H);
        } catch (f) {
          return T(f);
        }
        if (!q.mutatePayload) H = Object.assign({}, H);
      } else {
        let f = b44.filter(function (w) {
          return typeof q[w] < "u";
        });
        if (f.length > 0) return T(Error("invalid " + f.join(",") + " option for " + typeof H + " payload"));
      }
      if (typeof H.exp < "u" && typeof q.expiresIn < "u")
        return T(Error('Bad "options.expiresIn" option the payload already has an "exp" property.'));
      if (typeof H.nbf < "u" && typeof q.notBefore < "u")
        return T(Error('Bad "options.notBefore" option the payload already has an "nbf" property.'));
      try {
        E44(q);
      } catch (f) {
        return T(f);
      }
      if (!q.allowInvalidAsymmetricKeyTypes)
        try {
          L44(O.alg, _);
        } catch (f) {
          return T(f);
        }
      let z = H.iat || Math.floor(Date.now() / 1000);
      if (q.noTimestamp) delete H.iat;
      else if (K) H.iat = z;
      if (typeof q.notBefore < "u") {
        try {
          H.nbf = bXq(q.notBefore, z);
        } catch (f) {
          return T(f);
        }
        if (typeof H.nbf > "u")
          return T(
            Error('"notBefore" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'),
          );
      }
      if (typeof q.expiresIn < "u" && typeof H === "object") {
        try {
          H.exp = bXq(q.expiresIn, z);
        } catch (f) {
          return T(f);
        }
        if (typeof H.exp > "u")
          return T(
            Error('"expiresIn" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'),
          );
      }
      Object.keys(xXq).forEach(function (f) {
        let w = xXq[f];
        if (typeof q[f] < "u") {
          if (typeof H[w] < "u")
            return T(Error('Bad "options.' + f + '" option. The payload already has an "' + w + '" property.'));
          H[w] = q[f];
        }
      });
      let A = q.encoding || "utf8";
      if (typeof $ === "function")
        ($ = $ && v44($)),
          IXq.createSign({ header: O, privateKey: _, payload: H, encoding: A })
            .once("error", $)
            .once("done", function (f) {
              if (!q.allowInsecureKeySizes && /^(?:RS|PS)/.test(O.alg) && f.length < 256)
                return $(Error(`secretOrPrivateKey has a minimum key size of 2048 bits for ${O.alg}`));
              $(null, f);
            });
      else {
        let f = IXq.sign({ header: O, payload: H, secret: _, encoding: A });
        if (!q.allowInsecureKeySizes && /^(?:RS|PS)/.test(O.alg) && f.length < 256)
          throw Error(`secretOrPrivateKey has a minimum key size of 2048 bits for ${O.alg}`);
        return f;
      }
    };
  });
