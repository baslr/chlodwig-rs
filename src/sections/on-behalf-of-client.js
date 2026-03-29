    wT();
    LgH(); /*! @azure/msal-node v3.8.1 2025-10-29 */
    cgH = class cgH extends F0 {
      constructor(H) {
        super(H);
      }
      async acquireToken(H) {
        if (
          ((this.scopeSet = new WD(H.scopes || [])),
          (this.userAssertionHash = await this.cryptoUtils.hashString(H.oboAssertion)),
          H.skipCache || H.claims)
        )
          return this.executeTokenRequest(H, this.authority, this.userAssertionHash);
        try {
          return await this.getCachedAuthenticationResult(H);
        } catch (_) {
          return await this.executeTokenRequest(H, this.authority, this.userAssertionHash);
        }
      }
      async getCachedAuthenticationResult(H) {
        let _ = this.readAccessTokenFromCacheForOBO(this.config.authOptions.clientId, H);
        if (!_)
          throw (
            (this.serverTelemetryManager?.setCacheOutcome(HA.NO_CACHED_ACCESS_TOKEN),
            this.logger.info(
              "SilentFlowClient:acquireCachedToken - No access token found in cache for the given properties.",
            ),
            T8(Oz.tokenRefreshRequired))
          );
        else if (Lf.isTokenExpired(_.expiresOn, this.config.systemOptions.tokenRenewalOffsetSeconds))
          throw (
            (this.serverTelemetryManager?.setCacheOutcome(HA.CACHED_ACCESS_TOKEN_EXPIRED),
            this.logger.info(
              `OnbehalfofFlow:getCachedAuthenticationResult - Cached access token is expired or will expire within ${this.config.systemOptions.tokenRenewalOffsetSeconds} seconds.`,
            ),
            T8(Oz.tokenRefreshRequired))
          );
        let q = this.readIdTokenFromCacheForOBO(_.homeAccountId, H.correlationId),
          $,
          K = null;
        if (q) {
          $ = b2_.extractTokenClaims(q.secret, Pk.base64Decode);
          let O = $.oid || $.sub,
            T = {
              homeAccountId: q.homeAccountId,
              environment: q.environment,
              tenantId: q.realm,
              username: d6.EMPTY_STRING,
              localAccountId: O || d6.EMPTY_STRING,
            };
          K = this.cacheManager.getAccount(this.cacheManager.generateAccountKey(T), H.correlationId);
        }
        if (this.config.serverTelemetryManager) this.config.serverTelemetryManager.incrementCacheHits();
        return GD.generateAuthenticationResult(
          this.cryptoUtils,
          this.authority,
          { account: K, accessToken: _, idToken: q, refreshToken: null, appMetadata: null },
          !0,
          H,
          $,
        );
      }
      readIdTokenFromCacheForOBO(H, _) {
        let q = {
            homeAccountId: H,
            environment: this.authority.canonicalAuthorityUrlComponents.HostNameAndPort,
            credentialType: fT.ID_TOKEN,
            clientId: this.config.authOptions.clientId,
            realm: this.authority.tenant,
          },
          $ = this.cacheManager.getIdTokensByFilter(q, _);
        if (Object.values($).length < 1) return null;
        return Object.values($)[0];
      }
      readAccessTokenFromCacheForOBO(H, _) {
        let q = _.authenticationScheme || H5.BEARER,
          K = {
            credentialType:
              q && q.toLowerCase() !== H5.BEARER.toLowerCase() ? fT.ACCESS_TOKEN_WITH_AUTH_SCHEME : fT.ACCESS_TOKEN,
            clientId: H,
            target: WD.createSearchScopes(this.scopeSet.asArray()),
            tokenType: q,
            keyId: _.sshKid,
            requestedClaimsHash: _.requestedClaimsHash,
            userAssertionHash: this.userAssertionHash,
          },
          O = this.cacheManager.getAccessTokensByFilter(K, _.correlationId),
          T = O.length;
        if (T < 1) return null;
        else if (T > 1) throw T8(Oz.multipleMatchingTokens);
        return O[0];
      }
      async executeTokenRequest(H, _, q) {
        let $ = this.createTokenQueryParameters(H),
          K = R1.appendQueryString(_.tokenEndpoint, $),
          O = await this.createTokenRequestBody(H),
          T = this.createTokenRequestHeaders(),
          z = {
            clientId: this.config.authOptions.clientId,
            authority: H.authority,
            scopes: H.scopes,
            claims: H.claims,
            authenticationScheme: H.authenticationScheme,
            resourceRequestMethod: H.resourceRequestMethod,
            resourceRequestUri: H.resourceRequestUri,
            shrClaims: H.shrClaims,
            sshKid: H.sshKid,
          },
          A = Lf.nowSeconds(),
          f = await this.executePostToTokenEndpoint(K, O, T, z, H.correlationId),
          w = new GD(
            this.config.authOptions.clientId,
            this.cacheManager,
            this.cryptoUtils,
            this.logger,
            this.config.serializableCache,
            this.config.persistencePlugin,
          );
        return (
          w.validateTokenResponse(f.body), await w.handleServerTokenResponse(f.body, this.authority, A, H, void 0, q)
        );
      }
      async createTokenRequestBody(H) {
        let _ = new Map();
        if (
          (D7.addClientId(_, this.config.authOptions.clientId),
          D7.addScopes(_, H.scopes),
          D7.addGrantType(_, jk.JWT_BEARER),
          D7.addClientInfo(_),
          D7.addLibraryInfo(_, this.config.libraryInfo),
          D7.addApplicationTelemetry(_, this.config.telemetry.application),
          D7.addThrottling(_),
          this.serverTelemetryManager)
        )
          D7.addServerTelemetry(_, this.serverTelemetryManager);
        let q = H.correlationId || this.config.cryptoInterface.createNewGuid();
        if (
          (D7.addCorrelationId(_, q),
          D7.addRequestTokenUse(_, H5H.ON_BEHALF_OF),
          D7.addOboAssertion(_, H.oboAssertion),
          this.config.clientCredentials.clientSecret)
        )
          D7.addClientSecret(_, this.config.clientCredentials.clientSecret);
        let $ = this.config.clientCredentials.clientAssertion;
        if ($)
          D7.addClientAssertion(_, await fZ($.assertion, this.config.authOptions.clientId, H.resourceRequestUri)),
            D7.addClientAssertionType(_, $.assertionType);
        if (
          H.claims ||
          (this.config.authOptions.clientCapabilities && this.config.authOptions.clientCapabilities.length > 0)
        )
          D7.addClaims(_, H.claims, this.config.authOptions.clientCapabilities);
        return hX.mapToQueryString(_);
      }
    };
