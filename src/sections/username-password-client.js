    wT(); /*! @azure/msal-node v3.8.1 2025-10-29 */
    BgH = class BgH extends F0 {
      constructor(H) {
        super(H);
      }
      async acquireToken(H) {
        this.logger.info("in acquireToken call in username-password client");
        let _ = Lf.nowSeconds(),
          q = await this.executeTokenRequest(this.authority, H),
          $ = new GD(
            this.config.authOptions.clientId,
            this.cacheManager,
            this.cryptoUtils,
            this.logger,
            this.config.serializableCache,
            this.config.persistencePlugin,
          );
        return $.validateTokenResponse(q.body), $.handleServerTokenResponse(q.body, this.authority, _, H);
      }
      async executeTokenRequest(H, _) {
        let q = this.createTokenQueryParameters(_),
          $ = R1.appendQueryString(H.tokenEndpoint, q),
          K = await this.createTokenRequestBody(_),
          O = this.createTokenRequestHeaders({ credential: _.username, type: TZ.UPN }),
          T = {
            clientId: this.config.authOptions.clientId,
            authority: H.canonicalAuthority,
            scopes: _.scopes,
            claims: _.claims,
            authenticationScheme: _.authenticationScheme,
            resourceRequestMethod: _.resourceRequestMethod,
            resourceRequestUri: _.resourceRequestUri,
            shrClaims: _.shrClaims,
            sshKid: _.sshKid,
          };
        return this.executePostToTokenEndpoint($, K, O, T, _.correlationId);
      }
      async createTokenRequestBody(H) {
        let _ = new Map();
        if (
          (D7.addClientId(_, this.config.authOptions.clientId),
          D7.addUsername(_, H.username),
          D7.addPassword(_, H.password),
          D7.addScopes(_, H.scopes),
          D7.addResponseType(_, oPH.IDTOKEN_TOKEN),
          D7.addGrantType(_, jk.RESOURCE_OWNER_PASSWORD_GRANT),
          D7.addClientInfo(_),
          D7.addLibraryInfo(_, this.config.libraryInfo),
          D7.addApplicationTelemetry(_, this.config.telemetry.application),
          D7.addThrottling(_),
          this.serverTelemetryManager)
        )
          D7.addServerTelemetry(_, this.serverTelemetryManager);
        let q = H.correlationId || this.config.cryptoInterface.createNewGuid();
        if ((D7.addCorrelationId(_, q), this.config.clientCredentials.clientSecret))
          D7.addClientSecret(_, this.config.clientCredentials.clientSecret);
        let $ = this.config.clientCredentials.clientAssertion;
        if ($)
          D7.addClientAssertion(_, await fZ($.assertion, this.config.authOptions.clientId, H.resourceRequestUri)),
            D7.addClientAssertionType(_, $.assertionType);
        if (
          !_A.isEmptyObj(H.claims) ||
          (this.config.authOptions.clientCapabilities && this.config.authOptions.clientCapabilities.length > 0)
        )
          D7.addClaims(_, H.claims, this.config.authOptions.clientCapabilities);
        if (this.config.systemOptions.preventCorsPreflight && H.username) D7.addCcsUpn(_, H.username);
        return hX.mapToQueryString(_);
      }
    };
