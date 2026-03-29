  var CX6 = d((MJ_) => {
    Object.defineProperty(MJ_, "__esModule", { value: !0 });
    MJ_.JWT = void 0;
    var ERq = VRq(),
      g34 = SX6(),
      d34 = u5H(),
      jJ_ = iB();
    class EX6 extends d34.OAuth2Client {
      constructor(H, _, q, $, K, O) {
        let T = H && typeof H === "object" ? H : { email: H, keyFile: _, key: q, keyId: O, scopes: $, subject: K };
        super(T);
        (this.email = T.email),
          (this.keyFile = T.keyFile),
          (this.key = T.key),
          (this.keyId = T.keyId),
          (this.scopes = T.scopes),
          (this.subject = T.subject),
          (this.additionalClaims = T.additionalClaims),
          (this.credentials = { refresh_token: "jwt-placeholder", expiry_date: 1 });
      }
      createScoped(H) {
        let _ = new EX6(this);
        return (_.scopes = H), _;
      }
      async getRequestMetadataAsync(H) {
        H = this.defaultServicePath ? `https://${this.defaultServicePath}/` : H;
        let _ =
          (!this.hasUserScopes() && H) ||
          (this.useJWTAccessWithScope && this.hasAnyScopes()) ||
          this.universeDomain !== jJ_.DEFAULT_UNIVERSE;
        if (this.subject && this.universeDomain !== jJ_.DEFAULT_UNIVERSE)
          throw RangeError(
            `Service Account user is configured for the credential. Domain-wide delegation is not supported in universes other than ${jJ_.DEFAULT_UNIVERSE}`,
          );
        if (!this.apiKey && _)
          if (this.additionalClaims && this.additionalClaims.target_audience) {
            let { tokens: q } = await this.refreshToken();
            return { headers: this.addSharedMetadataHeaders({ Authorization: `Bearer ${q.id_token}` }) };
          } else {
            if (!this.access)
              this.access = new g34.JWTAccess(this.email, this.key, this.keyId, this.eagerRefreshThresholdMillis);
            let q;
            if (this.hasUserScopes()) q = this.scopes;
            else if (!H) q = this.defaultScopes;
            let $ = this.useJWTAccessWithScope || this.universeDomain !== jJ_.DEFAULT_UNIVERSE,
              K = await this.access.getRequestHeaders(
                H !== null && H !== void 0 ? H : void 0,
                this.additionalClaims,
                $ ? q : void 0,
              );
            return { headers: this.addSharedMetadataHeaders(K) };
          }
        else if (this.hasAnyScopes() || this.apiKey) return super.getRequestMetadataAsync(H);
        else return { headers: {} };
      }
      async fetchIdToken(H) {
        let _ = new ERq.GoogleToken({
          iss: this.email,
          sub: this.subject,
          scope: this.scopes || this.defaultScopes,
          keyFile: this.keyFile,
          key: this.key,
          additionalClaims: { target_audience: H },
          transporter: this.transporter,
        });
        if ((await _.getToken({ forceRefresh: !0 }), !_.idToken))
          throw Error("Unknown error: Failed to fetch ID token");
        return _.idToken;
      }
      hasUserScopes() {
        if (!this.scopes) return !1;
        return this.scopes.length > 0;
      }
      hasAnyScopes() {
        if (this.scopes && this.scopes.length > 0) return !0;
        if (this.defaultScopes && this.defaultScopes.length > 0) return !0;
        return !1;
      }
      authorize(H) {
        if (H) this.authorizeAsync().then((_) => H(null, _), H);
        else return this.authorizeAsync();
      }
      async authorizeAsync() {
        let H = await this.refreshToken();
        if (!H) throw Error("No result returned");
        return (
          (this.credentials = H.tokens),
          (this.credentials.refresh_token = "jwt-placeholder"),
          (this.key = this.gtoken.key),
          (this.email = this.gtoken.iss),
          H.tokens
        );
      }
      async refreshTokenNoCache(H) {
        let _ = this.createGToken(),
          $ = {
            access_token: (await _.getToken({ forceRefresh: this.isTokenExpiring() })).access_token,
            token_type: "Bearer",
            expiry_date: _.expiresAt,
            id_token: _.idToken,
          };
        return this.emit("tokens", $), { res: null, tokens: $ };
      }
      createGToken() {
        if (!this.gtoken)
          this.gtoken = new ERq.GoogleToken({
            iss: this.email,
            sub: this.subject,
            scope: this.scopes || this.defaultScopes,
            keyFile: this.keyFile,
            key: this.key,
            additionalClaims: this.additionalClaims,
            transporter: this.transporter,
          });
        return this.gtoken;
      }
      fromJSON(H) {
        if (!H) throw Error("Must pass in a JSON object containing the service account auth settings.");
        if (!H.client_email) throw Error("The incoming JSON object does not contain a client_email field");
        if (!H.private_key) throw Error("The incoming JSON object does not contain a private_key field");
        (this.email = H.client_email),
          (this.key = H.private_key),
          (this.keyId = H.private_key_id),
          (this.projectId = H.project_id),
          (this.quotaProjectId = H.quota_project_id),
          (this.universeDomain = H.universe_domain || this.universeDomain);
      }
      fromStream(H, _) {
        if (_) this.fromStreamAsync(H).then(() => _(), _);
        else return this.fromStreamAsync(H);
      }
      fromStreamAsync(H) {
        return new Promise((_, q) => {
          if (!H) throw Error("Must pass in a stream containing the service account auth settings.");
          let $ = "";
          H.setEncoding("utf8")
            .on("error", q)
            .on("data", (K) => ($ += K))
            .on("end", () => {
              try {
                let K = JSON.parse($);
                this.fromJSON(K), _();
              } catch (K) {
                q(K);
              }
            });
        });
      }
      fromAPIKey(H) {
        if (typeof H !== "string") throw Error("Must provide an API Key string.");
        this.apiKey = H;
      }
      async getCredentials() {
        if (this.key) return { private_key: this.key, client_email: this.email };
        else if (this.keyFile) {
          let _ = await this.createGToken().getCredentials(this.keyFile);
          return { private_key: _.privateKey, client_email: _.clientEmail };
        }
        throw Error("A key or a keyFile must be provided to getCredentials.");
      }
    }
    MJ_.JWT = EX6;
  });
