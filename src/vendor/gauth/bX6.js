  var bX6 = d((BXH) => {
    Object.defineProperty(BXH, "__esModule", { value: !0 });
    BXH.UserRefreshClient = BXH.USER_REFRESH_ACCOUNT_TYPE = void 0;
    var c34 = u5H(),
      F34 = require("querystring");
    BXH.USER_REFRESH_ACCOUNT_TYPE = "authorized_user";
    class JJ_ extends c34.OAuth2Client {
      constructor(H, _, q, $, K) {
        let O =
          H && typeof H === "object"
            ? H
            : {
                clientId: H,
                clientSecret: _,
                refreshToken: q,
                eagerRefreshThresholdMillis: $,
                forceRefreshOnFailure: K,
              };
        super(O);
        (this._refreshToken = O.refreshToken), (this.credentials.refresh_token = O.refreshToken);
      }
      async refreshTokenNoCache(H) {
        return super.refreshTokenNoCache(this._refreshToken);
      }
      async fetchIdToken(H) {
        return (
          await this.transporter.request({
            ...JJ_.RETRY_CONFIG,
            url: this.endpoints.oauth2TokenUrl,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            method: "POST",
            data: (0, F34.stringify)({
              client_id: this._clientId,
              client_secret: this._clientSecret,
              grant_type: "refresh_token",
              refresh_token: this._refreshToken,
              target_audience: H,
            }),
          })
        ).data.id_token;
      }
      fromJSON(H) {
        if (!H) throw Error("Must pass in a JSON object containing the user refresh token");
        if (H.type !== "authorized_user")
          throw Error('The incoming JSON object does not have the "authorized_user" type');
        if (!H.client_id) throw Error("The incoming JSON object does not contain a client_id field");
        if (!H.client_secret) throw Error("The incoming JSON object does not contain a client_secret field");
        if (!H.refresh_token) throw Error("The incoming JSON object does not contain a refresh_token field");
        (this._clientId = H.client_id),
          (this._clientSecret = H.client_secret),
          (this._refreshToken = H.refresh_token),
          (this.credentials.refresh_token = H.refresh_token),
          (this.quotaProjectId = H.quota_project_id),
          (this.universeDomain = H.universe_domain || this.universeDomain);
      }
      fromStream(H, _) {
        if (_) this.fromStreamAsync(H).then(() => _(), _);
        else return this.fromStreamAsync(H);
      }
      async fromStreamAsync(H) {
        return new Promise((_, q) => {
          if (!H) return q(Error("Must pass in a stream containing the user refresh token."));
          let $ = "";
          H.setEncoding("utf8")
            .on("error", q)
            .on("data", (K) => ($ += K))
            .on("end", () => {
              try {
                let K = JSON.parse($);
                return this.fromJSON(K), _();
              } catch (K) {
                return q(K);
              }
            });
        });
      }
      static fromJSON(H) {
        let _ = new JJ_();
        return _.fromJSON(H), _;
      }
    }
    BXH.UserRefreshClient = JJ_;
  });
