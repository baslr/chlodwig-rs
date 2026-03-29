  var XZq = d((rB) => {
    Object.defineProperty(rB, "__esModule", { value: !0 });
    rB.DownscopedClient = rB.EXPIRATION_TIME_OFFSET = rB.MAX_ACCESS_BOUNDARY_RULES_COUNT = void 0;
    var QO4 = require("stream"),
      lO4 = iB(),
      iO4 = mX6(),
      nO4 = "urn:ietf:params:oauth:grant-type:token-exchange",
      rO4 = "urn:ietf:params:oauth:token-type:access_token",
      oO4 = "urn:ietf:params:oauth:token-type:access_token";
    rB.MAX_ACCESS_BOUNDARY_RULES_COUNT = 10;
    rB.EXPIRATION_TIME_OFFSET = 300000;
    class PZq extends lO4.AuthClient {
      constructor(H, _, q, $) {
        super({ ...q, quotaProjectId: $ });
        if (
          ((this.authClient = H),
          (this.credentialAccessBoundary = _),
          _.accessBoundary.accessBoundaryRules.length === 0)
        )
          throw Error("At least one access boundary rule needs to be defined.");
        else if (_.accessBoundary.accessBoundaryRules.length > rB.MAX_ACCESS_BOUNDARY_RULES_COUNT)
          throw Error(
            `The provided access boundary has more than ${rB.MAX_ACCESS_BOUNDARY_RULES_COUNT} access boundary rules.`,
          );
        for (let K of _.accessBoundary.accessBoundaryRules)
          if (K.availablePermissions.length === 0)
            throw Error("At least one permission should be defined in access boundary rules.");
        (this.stsCredential = new iO4.StsCredentials(`https://sts.${this.universeDomain}/v1/token`)),
          (this.cachedDownscopedAccessToken = null);
      }
      setCredentials(H) {
        if (!H.expiry_date) throw Error("The access token expiry_date field is missing in the provided credentials.");
        super.setCredentials(H), (this.cachedDownscopedAccessToken = H);
      }
      async getAccessToken() {
        if (!this.cachedDownscopedAccessToken || this.isExpired(this.cachedDownscopedAccessToken))
          await this.refreshAccessTokenAsync();
        return {
          token: this.cachedDownscopedAccessToken.access_token,
          expirationTime: this.cachedDownscopedAccessToken.expiry_date,
          res: this.cachedDownscopedAccessToken.res,
        };
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
              T = K.config.data instanceof QO4.Readable;
            if (!_ && (O === 401 || O === 403) && !T && this.forceRefreshOnFailure)
              return await this.refreshAccessTokenAsync(), await this.requestAsync(H, !0);
          }
          throw $;
        }
        return q;
      }
      async refreshAccessTokenAsync() {
        var H;
        let _ = (await this.authClient.getAccessToken()).token,
          q = { grantType: nO4, requestedTokenType: rO4, subjectToken: _, subjectTokenType: oO4 },
          $ = await this.stsCredential.exchangeToken(q, void 0, this.credentialAccessBoundary),
          K = ((H = this.authClient.credentials) === null || H === void 0 ? void 0 : H.expiry_date) || null,
          O = $.expires_in ? new Date().getTime() + $.expires_in * 1000 : K;
        return (
          (this.cachedDownscopedAccessToken = { access_token: $.access_token, expiry_date: O, res: $.res }),
          (this.credentials = {}),
          Object.assign(this.credentials, this.cachedDownscopedAccessToken),
          delete this.credentials.res,
          this.emit("tokens", {
            refresh_token: null,
            expiry_date: this.cachedDownscopedAccessToken.expiry_date,
            access_token: this.cachedDownscopedAccessToken.access_token,
            token_type: "Bearer",
            id_token: null,
          }),
          this.cachedDownscopedAccessToken
        );
      }
      isExpired(H) {
        let _ = new Date().getTime();
        return H.expiry_date ? _ >= H.expiry_date - this.eagerRefreshThresholdMillis : !1;
      }
    }
    rB.DownscopedClient = PZq;
  });
