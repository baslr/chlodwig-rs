  var VRq = d((cHH) => {
    var Tu =
        (cHH && cHH.__classPrivateFieldGet) ||
        function (H, _, q, $) {
          if (q === "a" && !$) throw TypeError("Private accessor was defined without a getter");
          if (typeof _ === "function" ? H !== _ || !$ : !_.has(H))
            throw TypeError("Cannot read private member from an object whose class did not declare it");
          return q === "m" ? $ : q === "a" ? $.call(H) : $ ? $.value : _.get(H);
        },
      RRq =
        (cHH && cHH.__classPrivateFieldSet) ||
        function (H, _, q, $, K) {
          if ($ === "m") throw TypeError("Private method is not writable");
          if ($ === "a" && !K) throw TypeError("Private accessor was defined without a setter");
          if (typeof _ === "function" ? H !== _ || !K : !_.has(H))
            throw TypeError("Cannot write private member to an object whose class did not declare it");
          return $ === "a" ? K.call(H, q) : K ? (K.value = q) : _.set(H, q), q;
        },
      zu,
      mXH,
      NX6,
      ZRq,
      LRq,
      hX6,
      yX6,
      kRq;
    Object.defineProperty(cHH, "__esModule", { value: !0 });
    cHH.GoogleToken = void 0;
    var vRq = require("fs"),
      b34 = _u(),
      I34 = ZXH(),
      u34 = require("path"),
      x34 = require("util"),
      NRq = vRq.readFile
        ? (0, x34.promisify)(vRq.readFile)
        : async () => {
            throw new pXH("use key rather than keyFile.", "MISSING_CREDENTIALS");
          },
      hRq = "https://www.googleapis.com/oauth2/v4/token",
      m34 = "https://accounts.google.com/o/oauth2/revoke?token=";
    class pXH extends Error {
      constructor(H, _) {
        super(H);
        this.code = _;
      }
    }
    class yRq {
      get accessToken() {
        return this.rawToken ? this.rawToken.access_token : void 0;
      }
      get idToken() {
        return this.rawToken ? this.rawToken.id_token : void 0;
      }
      get tokenType() {
        return this.rawToken ? this.rawToken.token_type : void 0;
      }
      get refreshToken() {
        return this.rawToken ? this.rawToken.refresh_token : void 0;
      }
      constructor(H) {
        zu.add(this),
          (this.transporter = { request: (_) => (0, b34.request)(_) }),
          mXH.set(this, void 0),
          Tu(this, zu, "m", yX6).call(this, H);
      }
      hasExpired() {
        let H = new Date().getTime();
        if (this.rawToken && this.expiresAt) return H >= this.expiresAt;
        else return !0;
      }
      isTokenExpiring() {
        var H;
        let _ = new Date().getTime(),
          q = (H = this.eagerRefreshThresholdMillis) !== null && H !== void 0 ? H : 0;
        if (this.rawToken && this.expiresAt) return this.expiresAt <= _ + q;
        else return !0;
      }
      getToken(H, _ = {}) {
        if (typeof H === "object") (_ = H), (H = void 0);
        if (((_ = Object.assign({ forceRefresh: !1 }, _)), H)) {
          let q = H;
          Tu(this, zu, "m", NX6)
            .call(this, _)
            .then(($) => q(null, $), H);
          return;
        }
        return Tu(this, zu, "m", NX6).call(this, _);
      }
      async getCredentials(H) {
        switch (u34.extname(H)) {
          case ".json": {
            let q = await NRq(H, "utf8"),
              $ = JSON.parse(q),
              K = $.private_key,
              O = $.client_email;
            if (!K || !O) throw new pXH("private_key and client_email are required.", "MISSING_CREDENTIALS");
            return { privateKey: K, clientEmail: O };
          }
          case ".der":
          case ".crt":
          case ".pem":
            return { privateKey: await NRq(H, "utf8") };
          case ".p12":
          case ".pfx":
            throw new pXH(
              "*.p12 certificates are not supported after v6.1.2. Consider utilizing *.json format or converting *.p12 to *.pem using the OpenSSL CLI.",
              "UNKNOWN_CERTIFICATE_TYPE",
            );
          default:
            throw new pXH(
              "Unknown certificate type. Type is determined based on file extension. Current supported extensions are *.json, and *.pem.",
              "UNKNOWN_CERTIFICATE_TYPE",
            );
        }
      }
      revokeToken(H) {
        if (H) {
          Tu(this, zu, "m", hX6)
            .call(this)
            .then(() => H(), H);
          return;
        }
        return Tu(this, zu, "m", hX6).call(this);
      }
    }
    cHH.GoogleToken = yRq;
    (mXH = new WeakMap()),
      (zu = new WeakSet()),
      (NX6 = async function (_) {
        if (Tu(this, mXH, "f") && !_.forceRefresh) return Tu(this, mXH, "f");
        try {
          return await RRq(this, mXH, Tu(this, zu, "m", ZRq).call(this, _), "f");
        } finally {
          RRq(this, mXH, void 0, "f");
        }
      }),
      (ZRq = async function (_) {
        if (this.isTokenExpiring() === !1 && _.forceRefresh === !1) return Promise.resolve(this.rawToken);
        if (!this.key && !this.keyFile) throw Error("No key or keyFile set.");
        if (!this.key && this.keyFile) {
          let q = await this.getCredentials(this.keyFile);
          if (((this.key = q.privateKey), (this.iss = q.clientEmail || this.iss), !q.clientEmail))
            Tu(this, zu, "m", LRq).call(this);
        }
        return Tu(this, zu, "m", kRq).call(this);
      }),
      (LRq = function () {
        if (!this.iss) throw new pXH("email is required.", "MISSING_CREDENTIALS");
      }),
      (hX6 = async function () {
        if (!this.accessToken) throw Error("No token to revoke.");
        let _ = m34 + this.accessToken;
        await this.transporter.request({ url: _, retry: !0 }),
          Tu(this, zu, "m", yX6).call(this, {
            email: this.iss,
            sub: this.sub,
            key: this.key,
            keyFile: this.keyFile,
            scope: this.scope,
            additionalClaims: this.additionalClaims,
          });
      }),
      (yX6 = function (_ = {}) {
        if (
          ((this.keyFile = _.keyFile),
          (this.key = _.key),
          (this.rawToken = void 0),
          (this.iss = _.email || _.iss),
          (this.sub = _.sub),
          (this.additionalClaims = _.additionalClaims),
          typeof _.scope === "object")
        )
          this.scope = _.scope.join(" ");
        else this.scope = _.scope;
        if (((this.eagerRefreshThresholdMillis = _.eagerRefreshThresholdMillis), _.transporter))
          this.transporter = _.transporter;
      }),
      (kRq = async function () {
        var _, q;
        let $ = Math.floor(new Date().getTime() / 1000),
          K = this.additionalClaims || {},
          O = Object.assign({ iss: this.iss, scope: this.scope, aud: hRq, exp: $ + 3600, iat: $, sub: this.sub }, K),
          T = I34.sign({ header: { alg: "RS256" }, payload: O, secret: this.key });
        try {
          let z = await this.transporter.request({
            method: "POST",
            url: hRq,
            data: { grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: T },
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            responseType: "json",
            retryConfig: { httpMethodsToRetry: ["POST"] },
          });
          return (
            (this.rawToken = z.data),
            (this.expiresAt =
              z.data.expires_in === null || z.data.expires_in === void 0 ? void 0 : ($ + z.data.expires_in) * 1000),
            this.rawToken
          );
        } catch (z) {
          (this.rawToken = void 0), (this.tokenExpires = void 0);
          let A =
            z.response && ((_ = z.response) === null || _ === void 0 ? void 0 : _.data)
              ? (q = z.response) === null || q === void 0
                ? void 0
                : q.data
              : {};
          if (A.error) {
            let f = A.error_description ? `: ${A.error_description}` : "";
            z.message = `${A.error}${f}`;
          }
          throw z;
        }
      });
  });
