  var OXq = d((UT3, KXq) => {
    var dA = SgH(),
      L94 = PJ6(),
      $Xq = XJ6(),
      k94 = JJ6(),
      v94 = WJ6(),
      N94 = IJ6(),
      h94 = uJ6(),
      y94 = ZXH(),
      { KeyObject: V94, createSecretKey: S94, createPublicKey: E94 } = require("crypto"),
      xJ6 = ["RS256", "RS384", "RS512"],
      C94 = ["ES256", "ES384", "ES512"],
      mJ6 = ["RS256", "RS384", "RS512"],
      b94 = ["HS256", "HS384", "HS512"];
    if (h94) xJ6.splice(xJ6.length, 0, "PS256", "PS384", "PS512"), mJ6.splice(mJ6.length, 0, "PS256", "PS384", "PS512");
    KXq.exports = function (H, _, q, $) {
      if (typeof q === "function" && !$) ($ = q), (q = {});
      if (!q) q = {};
      q = Object.assign({}, q);
      let K;
      if ($) K = $;
      else
        K = function (w, Y) {
          if (w) throw w;
          return Y;
        };
      if (q.clockTimestamp && typeof q.clockTimestamp !== "number") return K(new dA("clockTimestamp must be a number"));
      if (q.nonce !== void 0 && (typeof q.nonce !== "string" || q.nonce.trim() === ""))
        return K(new dA("nonce must be a non-empty string"));
      if (q.allowInvalidAsymmetricKeyTypes !== void 0 && typeof q.allowInvalidAsymmetricKeyTypes !== "boolean")
        return K(new dA("allowInvalidAsymmetricKeyTypes must be a boolean"));
      let O = q.clockTimestamp || Math.floor(Date.now() / 1000);
      if (!H) return K(new dA("jwt must be provided"));
      if (typeof H !== "string") return K(new dA("jwt must be a string"));
      let T = H.split(".");
      if (T.length !== 3) return K(new dA("jwt malformed"));
      let z;
      try {
        z = k94(H, { complete: !0 });
      } catch (w) {
        return K(w);
      }
      if (!z) return K(new dA("invalid token"));
      let A = z.header,
        f;
      if (typeof _ === "function") {
        if (!$)
          return K(new dA("verify must be called asynchronous if secret or public key is provided as a callback"));
        f = _;
      } else
        f = function (w, Y) {
          return Y(null, _);
        };
      return f(A, function (w, Y) {
        if (w) return K(new dA("error in secret or public key callback: " + w.message));
        let D = T[2].trim() !== "";
        if (!D && Y) return K(new dA("jwt signature is required"));
        if (D && !Y) return K(new dA("secret or public key must be provided"));
        if (!D && !q.algorithms) return K(new dA('please specify "none" in "algorithms" to verify unsigned tokens'));
        if (Y != null && !(Y instanceof V94))
          try {
            Y = E94(Y);
          } catch (J) {
            try {
              Y = S94(typeof Y === "string" ? Buffer.from(Y) : Y);
            } catch (P) {
              return K(new dA("secretOrPublicKey is not valid key material"));
            }
          }
        if (!q.algorithms)
          if (Y.type === "secret") q.algorithms = b94;
          else if (["rsa", "rsa-pss"].includes(Y.asymmetricKeyType)) q.algorithms = mJ6;
          else if (Y.asymmetricKeyType === "ec") q.algorithms = C94;
          else q.algorithms = xJ6;
        if (q.algorithms.indexOf(z.header.alg) === -1) return K(new dA("invalid algorithm"));
        if (A.alg.startsWith("HS") && Y.type !== "secret")
          return K(new dA(`secretOrPublicKey must be a symmetric key when using ${A.alg}`));
        else if (/^(?:RS|PS|ES)/.test(A.alg) && Y.type !== "public")
          return K(new dA(`secretOrPublicKey must be an asymmetric key when using ${A.alg}`));
        if (!q.allowInvalidAsymmetricKeyTypes)
          try {
            N94(A.alg, Y);
          } catch (J) {
            return K(J);
          }
        let j;
        try {
          j = y94.verify(H, z.header.alg, Y);
        } catch (J) {
          return K(J);
        }
        if (!j) return K(new dA("invalid signature"));
        let M = z.payload;
        if (typeof M.nbf < "u" && !q.ignoreNotBefore) {
          if (typeof M.nbf !== "number") return K(new dA("invalid nbf value"));
          if (M.nbf > O + (q.clockTolerance || 0)) return K(new L94("jwt not active", new Date(M.nbf * 1000)));
        }
        if (typeof M.exp < "u" && !q.ignoreExpiration) {
          if (typeof M.exp !== "number") return K(new dA("invalid exp value"));
          if (O >= M.exp + (q.clockTolerance || 0)) return K(new $Xq("jwt expired", new Date(M.exp * 1000)));
        }
        if (q.audience) {
          let J = Array.isArray(q.audience) ? q.audience : [q.audience];
          if (
            !(Array.isArray(M.aud) ? M.aud : [M.aud]).some(function (R) {
              return J.some(function (W) {
                return W instanceof RegExp ? W.test(R) : W === R;
              });
            })
          )
            return K(new dA("jwt audience invalid. expected: " + J.join(" or ")));
        }
        if (q.issuer) {
          if (
            (typeof q.issuer === "string" && M.iss !== q.issuer) ||
            (Array.isArray(q.issuer) && q.issuer.indexOf(M.iss) === -1)
          )
            return K(new dA("jwt issuer invalid. expected: " + q.issuer));
        }
        if (q.subject) {
          if (M.sub !== q.subject) return K(new dA("jwt subject invalid. expected: " + q.subject));
        }
        if (q.jwtid) {
          if (M.jti !== q.jwtid) return K(new dA("jwt jwtid invalid. expected: " + q.jwtid));
        }
        if (q.nonce) {
          if (M.nonce !== q.nonce) return K(new dA("jwt nonce invalid. expected: " + q.nonce));
        }
        if (q.maxAge) {
          if (typeof M.iat !== "number") return K(new dA("iat required when maxAge is specified"));
          let J = v94(q.maxAge, M.iat);
          if (typeof J > "u")
            return K(
              new dA('"maxAge" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'),
            );
          if (O >= J + (q.clockTolerance || 0)) return K(new $Xq("maxAge exceeded", new Date(J * 1000)));
        }
        if (q.complete === !0) {
          let J = z.signature;
          return K(null, { header: A, payload: M, signature: J });
        }
        return K(null, M);
      });
    };
  });
