  var FHH = d((FJ) => {
    var pX6 =
        (FJ && FJ.__classPrivateFieldGet) ||
        function (H, _, q, $) {
          if (q === "a" && !$) throw TypeError("Private accessor was defined without a getter");
          if (typeof _ === "function" ? H !== _ || !$ : !_.has(H))
            throw TypeError("Cannot read private member from an object whose class did not declare it");
          return q === "m" ? $ : q === "a" ? $.call(H) : $ ? $.value : _.get(H);
        },
      xRq =
        (FJ && FJ.__classPrivateFieldSet) ||
        function (H, _, q, $, K) {
          if ($ === "m") throw TypeError("Private method is not writable");
          if ($ === "a" && !K) throw TypeError("Private accessor was defined without a setter");
          if (typeof _ === "function" ? H !== _ || !K : !_.has(H))
            throw TypeError("Cannot write private member to an object whose class did not declare it");
          return $ === "a" ? K.call(H, q) : K ? (K.value = q) : _.set(H, q), q;
        },
      BX6,
      dXH,
      pRq;
    Object.defineProperty(FJ, "__esModule", { value: !0 });
    FJ.BaseExternalAccountClient =
      FJ.DEFAULT_UNIVERSE =
      FJ.CLOUD_RESOURCE_MANAGER =
      FJ.EXTERNAL_ACCOUNT_TYPE =
      FJ.EXPIRATION_TIME_OFFSET =
        void 0;
    var s34 = require("stream"),
      t34 = iB(),
      e34 = mX6(),
      mRq = dHH(),
      HO4 = "urn:ietf:params:oauth:grant-type:token-exchange",
      _O4 = "urn:ietf:params:oauth:token-type:access_token",
      gX6 = "https://www.googleapis.com/auth/cloud-platform",
      qO4 = 3600;
    FJ.EXPIRATION_TIME_OFFSET = 300000;
    FJ.EXTERNAL_ACCOUNT_TYPE = "external_account";
    FJ.CLOUD_RESOURCE_MANAGER = "https://cloudresourcemanager.googleapis.com/v1/projects/";
    var $O4 = "//iam\\.googleapis\\.com/locations/[^/]+/workforcePools/[^/]+/providers/.+",
      KO4 = "https://sts.{universeDomain}/v1/token",
      OO4 = PX6(),
      TO4 = iB();
    Object.defineProperty(FJ, "DEFAULT_UNIVERSE", {
      enumerable: !0,
      get: function () {
        return TO4.DEFAULT_UNIVERSE;
      },
    });
    class XJ_ extends t34.AuthClient {
      constructor(H, _) {
        var q;
        super({ ...H, ..._ });
        BX6.add(this), dXH.set(this, null);
        let $ = (0, mRq.originalOrCamelOptions)(H),
          K = $.get("type");
        if (K && K !== FJ.EXTERNAL_ACCOUNT_TYPE)
          throw Error(`Expected "${FJ.EXTERNAL_ACCOUNT_TYPE}" type but received "${H.type}"`);
        let O = $.get("client_id"),
          T = $.get("client_secret"),
          z =
            (q = $.get("token_url")) !== null && q !== void 0
              ? q
              : KO4.replace("{universeDomain}", this.universeDomain),
          A = $.get("subject_token_type"),
          f = $.get("workforce_pool_user_project"),
          w = $.get("service_account_impersonation_url"),
          Y = $.get("service_account_impersonation"),
          D = (0, mRq.originalOrCamelOptions)(Y).get("token_lifetime_seconds");
        if (
          ((this.cloudResourceManagerURL = new URL(
            $.get("cloud_resource_manager_url") || `https://cloudresourcemanager.${this.universeDomain}/v1/projects/`,
          )),
          O)
        )
          this.clientAuth = { confidentialClientType: "basic", clientId: O, clientSecret: T };
        (this.stsCredential = new e34.StsCredentials(z, this.clientAuth)),
          (this.scopes = $.get("scopes") || [gX6]),
          (this.cachedAccessToken = null),
          (this.audience = $.get("audience")),
          (this.subjectTokenType = A),
          (this.workforcePoolUserProject = f);
        let j = new RegExp($O4);
        if (this.workforcePoolUserProject && !this.audience.match(j))
          throw Error("workforcePoolUserProject should not be set for non-workforce pool credentials.");
        if (
          ((this.serviceAccountImpersonationUrl = w),
          (this.serviceAccountImpersonationLifetime = D),
          this.serviceAccountImpersonationLifetime)
        )
          this.configLifetimeRequested = !0;
        else (this.configLifetimeRequested = !1), (this.serviceAccountImpersonationLifetime = qO4);
        (this.projectNumber = this.getProjectNumber(this.audience)),
          (this.supplierContext = {
            audience: this.audience,
            subjectTokenType: this.subjectTokenType,
            transporter: this.transporter,
          });
      }
      getServiceAccountEmail() {
        var H;
        if (this.serviceAccountImpersonationUrl) {
          if (this.serviceAccountImpersonationUrl.length > 256)
            throw RangeError(`URL is too long: ${this.serviceAccountImpersonationUrl}`);
          let q = /serviceAccounts\/(?<email>[^:]+):generateAccessToken$/.exec(this.serviceAccountImpersonationUrl);
          return (
            ((H = q === null || q === void 0 ? void 0 : q.groups) === null || H === void 0 ? void 0 : H.email) || null
          );
        }
        return null;
      }
      setCredentials(H) {
        super.setCredentials(H), (this.cachedAccessToken = H);
      }
      async getAccessToken() {
        if (!this.cachedAccessToken || this.isExpired(this.cachedAccessToken)) await this.refreshAccessTokenAsync();
        return { token: this.cachedAccessToken.access_token, res: this.cachedAccessToken.res };
      }
      async getRequestHeaders() {
        let _ = { Authorization: `Bearer ${(await this.getAccessToken()).token}` };
        return this.addSharedMetadataHeaders(_);
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
      async getProjectId() {
        let H = this.projectNumber || this.workforcePoolUserProject;
        if (this.projectId) return this.projectId;
        else if (H) {
          let _ = await this.getRequestHeaders(),
            q = await this.transporter.request({
              ...XJ_.RETRY_CONFIG,
              headers: _,
              url: `${this.cloudResourceManagerURL.toString()}${H}`,
              responseType: "json",
            });
          return (this.projectId = q.data.projectId), this.projectId;
        }
        return null;
      }
      async requestAsync(H, _ = !1) {
        let q;
        try {
          let $ = await this.getRequestHeaders();
          if (((H.headers = H.headers || {}), $ && $["x-goog-user-project"]))
            H.headers["x-goog-user-project"] = $["x-goog-user-project"];
          if ($ && $.Authorization) H.headers.Authorization = $.Authorization;
          q = await this.transporter.request(H);
        } catch ($) {
          let K = $.response;
          if (K) {
            let O = K.status,
              T = K.config.data instanceof s34.Readable;
            if (!_ && (O === 401 || O === 403) && !T && this.forceRefreshOnFailure)
              return await this.refreshAccessTokenAsync(), await this.requestAsync(H, !0);
          }
          throw $;
        }
        return q;
      }
      async refreshAccessTokenAsync() {
        xRq(this, dXH, pX6(this, dXH, "f") || pX6(this, BX6, "m", pRq).call(this), "f");
        try {
          return await pX6(this, dXH, "f");
        } finally {
          xRq(this, dXH, null, "f");
        }
      }
      getProjectNumber(H) {
        let _ = H.match(/\/projects\/([^/]+)/);
        if (!_) return null;
        return _[1];
      }
      async getImpersonatedAccessToken(H) {
        let _ = {
            ...XJ_.RETRY_CONFIG,
            url: this.serviceAccountImpersonationUrl,
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${H}` },
            data: { scope: this.getScopesArray(), lifetime: this.serviceAccountImpersonationLifetime + "s" },
            responseType: "json",
          },
          q = await this.transporter.request(_),
          $ = q.data;
        return { access_token: $.accessToken, expiry_date: new Date($.expireTime).getTime(), res: q };
      }
      isExpired(H) {
        let _ = new Date().getTime();
        return H.expiry_date ? _ >= H.expiry_date - this.eagerRefreshThresholdMillis : !1;
      }
      getScopesArray() {
        if (typeof this.scopes === "string") return [this.scopes];
        return this.scopes || [gX6];
      }
      getMetricsHeaderValue() {
        let H = process.version.replace(/^v/, ""),
          _ = this.serviceAccountImpersonationUrl !== void 0,
          q = this.credentialSourceType ? this.credentialSourceType : "unknown";
        return `gl-node/${H} auth/${OO4.version} google-byoid-sdk source/${q} sa-impersonation/${_} config-lifetime/${this.configLifetimeRequested}`;
      }
    }
    FJ.BaseExternalAccountClient = XJ_;
    (dXH = new WeakMap()),
      (BX6 = new WeakSet()),
      (pRq = async function () {
        let _ = await this.retrieveSubjectToken(),
          q = {
            grantType: HO4,
            audience: this.audience,
            requestedTokenType: _O4,
            subjectToken: _,
            subjectTokenType: this.subjectTokenType,
            scope: this.serviceAccountImpersonationUrl ? [gX6] : this.getScopesArray(),
          },
          $ =
            !this.clientAuth && this.workforcePoolUserProject ? { userProject: this.workforcePoolUserProject } : void 0,
          K = { "x-goog-api-client": this.getMetricsHeaderValue() },
          O = await this.stsCredential.exchangeToken(q, K, $);
        if (this.serviceAccountImpersonationUrl)
          this.cachedAccessToken = await this.getImpersonatedAccessToken(O.access_token);
        else if (O.expires_in)
          this.cachedAccessToken = {
            access_token: O.access_token,
            expiry_date: new Date().getTime() + O.expires_in * 1000,
            res: O.res,
          };
        else this.cachedAccessToken = { access_token: O.access_token, res: O.res };
        return (
          (this.credentials = {}),
          Object.assign(this.credentials, this.cachedAccessToken),
          delete this.credentials.res,
          this.emit("tokens", {
            refresh_token: null,
            expiry_date: this.cachedAccessToken.expiry_date,
            access_token: this.cachedAccessToken.access_token,
            token_type: "Bearer",
            id_token: null,
          }),
          this.cachedAccessToken
        );
      });
  });
