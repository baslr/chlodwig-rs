  var u5H = d((nB) => {
    Object.defineProperty(nB, "__esModule", { value: !0 });
    nB.OAuth2Client = nB.ClientAuthentication = nB.CertificateFormat = nB.CodeChallengeMethod = void 0;
    var P34 = _u(),
      RX6 = require("querystring"),
      X34 = require("stream"),
      W34 = zJ6(),
      ZX6 = bXH(),
      G34 = iB(),
      R34 = GX6(),
      JRq;
    (function (H) {
      (H.Plain = "plain"), (H.S256 = "S256");
    })(JRq || (nB.CodeChallengeMethod = JRq = {}));
    var Ul;
    (function (H) {
      (H.PEM = "PEM"), (H.JWK = "JWK");
    })(Ul || (nB.CertificateFormat = Ul = {}));
    var JdH;
    (function (H) {
      (H.ClientSecretPost = "ClientSecretPost"), (H.ClientSecretBasic = "ClientSecretBasic"), (H.None = "None");
    })(JdH || (nB.ClientAuthentication = JdH = {}));
    class MZ extends G34.AuthClient {
      constructor(H, _, q) {
        let $ = H && typeof H === "object" ? H : { clientId: H, clientSecret: _, redirectUri: q };
        super($);
        (this.certificateCache = {}),
          (this.certificateExpiry = null),
          (this.certificateCacheFormat = Ul.PEM),
          (this.refreshTokenPromises = new Map()),
          (this._clientId = $.clientId),
          (this._clientSecret = $.clientSecret),
          (this.redirectUri = $.redirectUri),
          (this.endpoints = {
            tokenInfoUrl: "https://oauth2.googleapis.com/tokeninfo",
            oauth2AuthBaseUrl: "https://accounts.google.com/o/oauth2/v2/auth",
            oauth2TokenUrl: "https://oauth2.googleapis.com/token",
            oauth2RevokeUrl: "https://oauth2.googleapis.com/revoke",
            oauth2FederatedSignonPemCertsUrl: "https://www.googleapis.com/oauth2/v1/certs",
            oauth2FederatedSignonJwkCertsUrl: "https://www.googleapis.com/oauth2/v3/certs",
            oauth2IapPublicKeyUrl: "https://www.gstatic.com/iap/verify/public_key",
            ...$.endpoints,
          }),
          (this.clientAuthentication = $.clientAuthentication || JdH.ClientSecretPost),
          (this.issuers = $.issuers || ["accounts.google.com", "https://accounts.google.com", this.universeDomain]);
      }
      generateAuthUrl(H = {}) {
        if (H.code_challenge_method && !H.code_challenge)
          throw Error("If a code_challenge_method is provided, code_challenge must be included.");
        if (
          ((H.response_type = H.response_type || "code"),
          (H.client_id = H.client_id || this._clientId),
          (H.redirect_uri = H.redirect_uri || this.redirectUri),
          Array.isArray(H.scope))
        )
          H.scope = H.scope.join(" ");
        return this.endpoints.oauth2AuthBaseUrl.toString() + "?" + RX6.stringify(H);
      }
      generateCodeVerifier() {
        throw Error("generateCodeVerifier is removed, please use generateCodeVerifierAsync instead.");
      }
      async generateCodeVerifierAsync() {
        let H = (0, ZX6.createCrypto)(),
          q = H.randomBytesBase64(96).replace(/\+/g, "~").replace(/=/g, "_").replace(/\//g, "-"),
          K = (await H.sha256DigestBase64(q)).split("=")[0].replace(/\+/g, "-").replace(/\//g, "_");
        return { codeVerifier: q, codeChallenge: K };
      }
      getToken(H, _) {
        let q = typeof H === "string" ? { code: H } : H;
        if (_)
          this.getTokenAsync(q).then(
            ($) => _(null, $.tokens, $.res),
            ($) => _($, null, $.response),
          );
        else return this.getTokenAsync(q);
      }
      async getTokenAsync(H) {
        let _ = this.endpoints.oauth2TokenUrl.toString(),
          q = { "Content-Type": "application/x-www-form-urlencoded" },
          $ = {
            client_id: H.client_id || this._clientId,
            code_verifier: H.codeVerifier,
            code: H.code,
            grant_type: "authorization_code",
            redirect_uri: H.redirect_uri || this.redirectUri,
          };
        if (this.clientAuthentication === JdH.ClientSecretBasic) {
          let T = Buffer.from(`${this._clientId}:${this._clientSecret}`);
          q.Authorization = `Basic ${T.toString("base64")}`;
        }
        if (this.clientAuthentication === JdH.ClientSecretPost) $.client_secret = this._clientSecret;
        let K = await this.transporter.request({
            ...MZ.RETRY_CONFIG,
            method: "POST",
            url: _,
            data: RX6.stringify($),
            headers: q,
          }),
          O = K.data;
        if (K.data && K.data.expires_in)
          (O.expiry_date = new Date().getTime() + K.data.expires_in * 1000), delete O.expires_in;
        return this.emit("tokens", O), { tokens: O, res: K };
      }
      async refreshToken(H) {
        if (!H) return this.refreshTokenNoCache(H);
        if (this.refreshTokenPromises.has(H)) return this.refreshTokenPromises.get(H);
        let _ = this.refreshTokenNoCache(H).then(
          (q) => {
            return this.refreshTokenPromises.delete(H), q;
          },
          (q) => {
            throw (this.refreshTokenPromises.delete(H), q);
          },
        );
        return this.refreshTokenPromises.set(H, _), _;
      }
      async refreshTokenNoCache(H) {
        var _;
        if (!H) throw Error("No refresh token is set.");
        let q = this.endpoints.oauth2TokenUrl.toString(),
          $ = {
            refresh_token: H,
            client_id: this._clientId,
            client_secret: this._clientSecret,
            grant_type: "refresh_token",
          },
          K;
        try {
          K = await this.transporter.request({
            ...MZ.RETRY_CONFIG,
            method: "POST",
            url: q,
            data: RX6.stringify($),
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          });
        } catch (T) {
          if (
            T instanceof P34.GaxiosError &&
            T.message === "invalid_grant" &&
            ((_ = T.response) === null || _ === void 0 ? void 0 : _.data) &&
            /ReAuth/i.test(T.response.data.error_description)
          )
            T.message = JSON.stringify(T.response.data);
          throw T;
        }
        let O = K.data;
        if (K.data && K.data.expires_in)
          (O.expiry_date = new Date().getTime() + K.data.expires_in * 1000), delete O.expires_in;
        return this.emit("tokens", O), { tokens: O, res: K };
      }
      refreshAccessToken(H) {
        if (H) this.refreshAccessTokenAsync().then((_) => H(null, _.credentials, _.res), H);
        else return this.refreshAccessTokenAsync();
      }
      async refreshAccessTokenAsync() {
        let H = await this.refreshToken(this.credentials.refresh_token),
          _ = H.tokens;
        return (
          (_.refresh_token = this.credentials.refresh_token),
          (this.credentials = _),
          { credentials: this.credentials, res: H.res }
        );
      }
      getAccessToken(H) {
        if (H) this.getAccessTokenAsync().then((_) => H(null, _.token, _.res), H);
        else return this.getAccessTokenAsync();
      }
      async getAccessTokenAsync() {
        if (!this.credentials.access_token || this.isTokenExpiring()) {
          if (!this.credentials.refresh_token)
            if (this.refreshHandler) {
              let q = await this.processAndValidateRefreshHandler();
              if (q === null || q === void 0 ? void 0 : q.access_token)
                return this.setCredentials(q), { token: this.credentials.access_token };
            } else throw Error("No refresh token or refresh handler callback is set.");
          let _ = await this.refreshAccessTokenAsync();
          if (!_.credentials || (_.credentials && !_.credentials.access_token))
            throw Error("Could not refresh access token.");
          return { token: _.credentials.access_token, res: _.res };
        } else return { token: this.credentials.access_token };
      }
      async getRequestHeaders(H) {
        return (await this.getRequestMetadataAsync(H)).headers;
      }
      async getRequestMetadataAsync(H) {
        let _ = this.credentials;
        if (!_.access_token && !_.refresh_token && !this.apiKey && !this.refreshHandler)
          throw Error("No access, refresh token, API key or refresh handler callback is set.");
        if (_.access_token && !this.isTokenExpiring()) {
          _.token_type = _.token_type || "Bearer";
          let T = { Authorization: _.token_type + " " + _.access_token };
          return { headers: this.addSharedMetadataHeaders(T) };
        }
        if (this.refreshHandler) {
          let T = await this.processAndValidateRefreshHandler();
          if (T === null || T === void 0 ? void 0 : T.access_token) {
            this.setCredentials(T);
            let z = { Authorization: "Bearer " + this.credentials.access_token };
            return { headers: this.addSharedMetadataHeaders(z) };
          }
        }
        if (this.apiKey) return { headers: { "X-Goog-Api-Key": this.apiKey } };
        let q = null,
          $ = null;
        try {
          (q = await this.refreshToken(_.refresh_token)), ($ = q.tokens);
        } catch (T) {
          let z = T;
          if (z.response && (z.response.status === 403 || z.response.status === 404))
            z.message = `Could not refresh access token: ${z.message}`;
          throw z;
        }
        let K = this.credentials;
        (K.token_type = K.token_type || "Bearer"), ($.refresh_token = K.refresh_token), (this.credentials = $);
        let O = { Authorization: K.token_type + " " + $.access_token };
        return { headers: this.addSharedMetadataHeaders(O), res: q.res };
      }
      static getRevokeTokenUrl(H) {
        return new MZ().getRevokeTokenURL(H).toString();
      }
      getRevokeTokenURL(H) {
        let _ = new URL(this.endpoints.oauth2RevokeUrl);
        return _.searchParams.append("token", H), _;
      }
      revokeToken(H, _) {
        let q = { ...MZ.RETRY_CONFIG, url: this.getRevokeTokenURL(H).toString(), method: "POST" };
        if (_) this.transporter.request(q).then(($) => _(null, $), _);
        else return this.transporter.request(q);
      }
      revokeCredentials(H) {
        if (H) this.revokeCredentialsAsync().then((_) => H(null, _), H);
        else return this.revokeCredentialsAsync();
      }
      async revokeCredentialsAsync() {
        let H = this.credentials.access_token;
        if (((this.credentials = {}), H)) return this.revokeToken(H);
        else throw Error("No access token to revoke.");
      }
      request(H, _) {
        if (_)
          this.requestAsync(H).then(
            (q) => _(null, q),
            (q) => {
              return _(q, q.response);
            },
          );
        else return this.requestAsync(H);
      }
      async requestAsync(H, _ = !1) {
        let q;
        try {
          let $ = await this.getRequestMetadataAsync(H.url);
          if (((H.headers = H.headers || {}), $.headers && $.headers["x-goog-user-project"]))
            H.headers["x-goog-user-project"] = $.headers["x-goog-user-project"];
          if ($.headers && $.headers.Authorization) H.headers.Authorization = $.headers.Authorization;
          if (this.apiKey) H.headers["X-Goog-Api-Key"] = this.apiKey;
          q = await this.transporter.request(H);
        } catch ($) {
          let K = $.response;
          if (K) {
            let O = K.status,
              T =
                this.credentials &&
                this.credentials.access_token &&
                this.credentials.refresh_token &&
                (!this.credentials.expiry_date || this.forceRefreshOnFailure),
              z =
                this.credentials &&
                this.credentials.access_token &&
                !this.credentials.refresh_token &&
                (!this.credentials.expiry_date || this.forceRefreshOnFailure) &&
                this.refreshHandler,
              A = K.config.data instanceof X34.Readable,
              f = O === 401 || O === 403;
            if (!_ && f && !A && T) return await this.refreshAccessTokenAsync(), this.requestAsync(H, !0);
            else if (!_ && f && !A && z) {
              let w = await this.processAndValidateRefreshHandler();
              if (w === null || w === void 0 ? void 0 : w.access_token) this.setCredentials(w);
              return this.requestAsync(H, !0);
            }
          }
          throw $;
        }
        return q;
      }
      verifyIdToken(H, _) {
        if (_ && typeof _ !== "function")
          throw Error(
            "This method accepts an options object as the first parameter, which includes the idToken, audience, and maxExpiry.",
          );
        if (_) this.verifyIdTokenAsync(H).then((q) => _(null, q), _);
        else return this.verifyIdTokenAsync(H);
      }
      async verifyIdTokenAsync(H) {
        if (!H.idToken) throw Error("The verifyIdToken method requires an ID Token");
        let _ = await this.getFederatedSignonCertsAsync();
        return await this.verifySignedJwtWithCertsAsync(H.idToken, _.certs, H.audience, this.issuers, H.maxExpiry);
      }
      async getTokenInfo(H) {
        let { data: _ } = await this.transporter.request({
            ...MZ.RETRY_CONFIG,
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Bearer ${H}` },
            url: this.endpoints.tokenInfoUrl.toString(),
          }),
          q = Object.assign({ expiry_date: new Date().getTime() + _.expires_in * 1000, scopes: _.scope.split(" ") }, _);
        return delete q.expires_in, delete q.scope, q;
      }
      getFederatedSignonCerts(H) {
        if (H) this.getFederatedSignonCertsAsync().then((_) => H(null, _.certs, _.res), H);
        else return this.getFederatedSignonCertsAsync();
      }
      async getFederatedSignonCertsAsync() {
        let H = new Date().getTime(),
          _ = (0, ZX6.hasBrowserCrypto)() ? Ul.JWK : Ul.PEM;
        if (this.certificateExpiry && H < this.certificateExpiry.getTime() && this.certificateCacheFormat === _)
          return { certs: this.certificateCache, format: _ };
        let q, $;
        switch (_) {
          case Ul.PEM:
            $ = this.endpoints.oauth2FederatedSignonPemCertsUrl.toString();
            break;
          case Ul.JWK:
            $ = this.endpoints.oauth2FederatedSignonJwkCertsUrl.toString();
            break;
          default:
            throw Error(`Unsupported certificate format ${_}`);
        }
        try {
          q = await this.transporter.request({ ...MZ.RETRY_CONFIG, url: $ });
        } catch (A) {
          if (A instanceof Error) A.message = `Failed to retrieve verification certificates: ${A.message}`;
          throw A;
        }
        let K = q ? q.headers["cache-control"] : void 0,
          O = -1;
        if (K) {
          let f = new RegExp("max-age=([0-9]*)").exec(K);
          if (f && f.length === 2) O = Number(f[1]) * 1000;
        }
        let T = {};
        switch (_) {
          case Ul.PEM:
            T = q.data;
            break;
          case Ul.JWK:
            for (let A of q.data.keys) T[A.kid] = A;
            break;
          default:
            throw Error(`Unsupported certificate format ${_}`);
        }
        let z = new Date();
        return (
          (this.certificateExpiry = O === -1 ? null : new Date(z.getTime() + O)),
          (this.certificateCache = T),
          (this.certificateCacheFormat = _),
          { certs: T, format: _, res: q }
        );
      }
      getIapPublicKeys(H) {
        if (H) this.getIapPublicKeysAsync().then((_) => H(null, _.pubkeys, _.res), H);
        else return this.getIapPublicKeysAsync();
      }
      async getIapPublicKeysAsync() {
        let H,
          _ = this.endpoints.oauth2IapPublicKeyUrl.toString();
        try {
          H = await this.transporter.request({ ...MZ.RETRY_CONFIG, url: _ });
        } catch (q) {
          if (q instanceof Error) q.message = `Failed to retrieve verification certificates: ${q.message}`;
          throw q;
        }
        return { pubkeys: H.data, res: H };
      }
      verifySignedJwtWithCerts() {
        throw Error("verifySignedJwtWithCerts is removed, please use verifySignedJwtWithCertsAsync instead.");
      }
      async verifySignedJwtWithCertsAsync(H, _, q, $, K) {
        let O = (0, ZX6.createCrypto)();
        if (!K) K = MZ.DEFAULT_MAX_TOKEN_LIFETIME_SECS_;
        let T = H.split(".");
        if (T.length !== 3) throw Error("Wrong number of segments in token: " + H);
        let z = T[0] + "." + T[1],
          A = T[2],
          f,
          w;
        try {
          f = JSON.parse(O.decodeBase64StringUtf8(T[0]));
        } catch (R) {
          if (R instanceof Error) R.message = `Can't parse token envelope: ${T[0]}': ${R.message}`;
          throw R;
        }
        if (!f) throw Error("Can't parse token envelope: " + T[0]);
        try {
          w = JSON.parse(O.decodeBase64StringUtf8(T[1]));
        } catch (R) {
          if (R instanceof Error) R.message = `Can't parse token payload '${T[0]}`;
          throw R;
        }
        if (!w) throw Error("Can't parse token payload: " + T[1]);
        if (!Object.prototype.hasOwnProperty.call(_, f.kid))
          throw Error("No pem found for envelope: " + JSON.stringify(f));
        let Y = _[f.kid];
        if (f.alg === "ES256") A = W34.joseToDer(A, "ES256").toString("base64");
        if (!(await O.verify(Y, z, A))) throw Error("Invalid token signature: " + H);
        if (!w.iat) throw Error("No issue time in token: " + JSON.stringify(w));
        if (!w.exp) throw Error("No expiration time in token: " + JSON.stringify(w));
        let j = Number(w.iat);
        if (isNaN(j)) throw Error("iat field using invalid format");
        let M = Number(w.exp);
        if (isNaN(M)) throw Error("exp field using invalid format");
        let J = new Date().getTime() / 1000;
        if (M >= J + K) throw Error("Expiration time too far in future: " + JSON.stringify(w));
        let P = j - MZ.CLOCK_SKEW_SECS_,
          X = M + MZ.CLOCK_SKEW_SECS_;
        if (J < P) throw Error("Token used too early, " + J + " < " + P + ": " + JSON.stringify(w));
        if (J > X) throw Error("Token used too late, " + J + " > " + X + ": " + JSON.stringify(w));
        if ($ && $.indexOf(w.iss) < 0) throw Error("Invalid issuer, expected one of [" + $ + "], but got " + w.iss);
        if (typeof q < "u" && q !== null) {
          let R = w.aud,
            W = !1;
          if (q.constructor === Array) W = q.indexOf(R) > -1;
          else W = R === q;
          if (!W) throw Error("Wrong recipient, payload audience != requiredAudience");
        }
        return new R34.LoginTicket(f, w);
      }
      async processAndValidateRefreshHandler() {
        if (this.refreshHandler) {
          let H = await this.refreshHandler();
          if (!H.access_token) throw Error("No access token is returned by the refreshHandler callback.");
          return H;
        }
        return;
      }
      isTokenExpiring() {
        let H = this.credentials.expiry_date;
        return H ? H <= new Date().getTime() + this.eagerRefreshThresholdMillis : !1;
      }
    }
    nB.OAuth2Client = MZ;
    MZ.GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo";
    MZ.CLOCK_SKEW_SECS_ = 300;
    MZ.DEFAULT_MAX_TOKEN_LIFETIME_SECS_ = 86400;
  });
