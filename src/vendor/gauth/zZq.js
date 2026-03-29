  var zZq = d((QXH) => {
    Object.defineProperty(QXH, "__esModule", { value: !0 });
    QXH.ExternalAccountAuthorizedUserClient = QXH.EXTERNAL_ACCOUNT_AUTHORIZED_USER_TYPE = void 0;
    var CO4 = iB(),
      OZq = uX6(),
      bO4 = _u(),
      IO4 = require("stream"),
      uO4 = FHH();
    QXH.EXTERNAL_ACCOUNT_AUTHORIZED_USER_TYPE = "external_account_authorized_user";
    var xO4 = "https://sts.{universeDomain}/v1/oauthtoken";
    class wW6 extends OZq.OAuthClientAuthHandler {
      constructor(H, _, q) {
        super(q);
        (this.url = H), (this.transporter = _);
      }
      async refreshToken(H, _) {
        let q = new URLSearchParams({ grant_type: "refresh_token", refresh_token: H }),
          $ = { "Content-Type": "application/x-www-form-urlencoded", ..._ },
          K = {
            ...wW6.RETRY_CONFIG,
            url: this.url,
            method: "POST",
            headers: $,
            data: q.toString(),
            responseType: "json",
          };
        this.applyClientAuthenticationOptions(K);
        try {
          let O = await this.transporter.request(K),
            T = O.data;
          return (T.res = O), T;
        } catch (O) {
          if (O instanceof bO4.GaxiosError && O.response)
            throw (0, OZq.getErrorFromOAuthErrorResponse)(O.response.data, O);
          throw O;
        }
      }
    }
    class TZq extends CO4.AuthClient {
      constructor(H, _) {
        var q;
        super({ ...H, ..._ });
        if (H.universe_domain) this.universeDomain = H.universe_domain;
        this.refreshToken = H.refresh_token;
        let $ = { confidentialClientType: "basic", clientId: H.client_id, clientSecret: H.client_secret };
        if (
          ((this.externalAccountAuthorizedUserHandler = new wW6(
            (q = H.token_url) !== null && q !== void 0 ? q : xO4.replace("{universeDomain}", this.universeDomain),
            this.transporter,
            $,
          )),
          (this.cachedAccessToken = null),
          (this.quotaProjectId = H.quota_project_id),
          typeof (_ === null || _ === void 0 ? void 0 : _.eagerRefreshThresholdMillis) !== "number")
        )
          this.eagerRefreshThresholdMillis = uO4.EXPIRATION_TIME_OFFSET;
        else this.eagerRefreshThresholdMillis = _.eagerRefreshThresholdMillis;
        this.forceRefreshOnFailure = !!(_ === null || _ === void 0 ? void 0 : _.forceRefreshOnFailure);
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
              T = K.config.data instanceof IO4.Readable;
            if (!_ && (O === 401 || O === 403) && !T && this.forceRefreshOnFailure)
              return await this.refreshAccessTokenAsync(), await this.requestAsync(H, !0);
          }
          throw $;
        }
        return q;
      }
      async refreshAccessTokenAsync() {
        let H = await this.externalAccountAuthorizedUserHandler.refreshToken(this.refreshToken);
        if (
          ((this.cachedAccessToken = {
            access_token: H.access_token,
            expiry_date: new Date().getTime() + H.expires_in * 1000,
            res: H.res,
          }),
          H.refresh_token !== void 0)
        )
          this.refreshToken = H.refresh_token;
        return this.cachedAccessToken;
      }
      isExpired(H) {
        let _ = new Date().getTime();
        return H.expiry_date ? _ >= H.expiry_date - this.eagerRefreshThresholdMillis : !1;
      }
    }
    QXH.ExternalAccountAuthorizedUserClient = TZq;
  });
