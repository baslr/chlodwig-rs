    wT(); /*! @azure/msal-node v3.8.1 2025-10-29 */
    X5H = class X5H extends F0 {
      constructor(H, _) {
        super(H);
        this.appTokenProvider = _;
      }
      async acquireToken(H) {
        if (H.skipCache || H.claims) return this.executeTokenRequest(H, this.authority);
        let [_, q] = await this.getCachedAuthenticationResult(
          H,
          this.config,
          this.cryptoUtils,
          this.authority,
          this.cacheManager,
          this.serverTelemetryManager,
        );
        if (_) {
          if (q === HA.PROACTIVELY_REFRESHED) {
            this.logger.info(
              "ClientCredentialClient:getCachedAuthenticationResult - Cached access token's refreshOn property has been exceeded'. It's not expired, but must be refreshed.",
            );
            let $ = !0;
            await this.executeTokenRequest(H, this.authority, $);
          }
          return _;
        } else return this.executeTokenRequest(H, this.authority);
      }
      async getCachedAuthenticationResult(H, _, q, $, K, O) {
        let T = _,
          z = _,
          A = HA.NOT_APPLICABLE,
          f;
        if (T.serializableCache && T.persistencePlugin)
          (f = new gS(T.serializableCache, !1)), await T.persistencePlugin.beforeCacheAccess(f);
        let w = this.readAccessTokenFromCache(
          $,
          z.managedIdentityId?.id || T.authOptions.clientId,
          new WD(H.scopes || []),
          K,
          H.correlationId,
        );
        if (T.serializableCache && T.persistencePlugin && f) await T.persistencePlugin.afterCacheAccess(f);
        if (!w) return O?.setCacheOutcome(HA.NO_CACHED_ACCESS_TOKEN), [null, HA.NO_CACHED_ACCESS_TOKEN];
        if (Lf.isTokenExpired(w.expiresOn, T.systemOptions?.tokenRenewalOffsetSeconds || sPH))
          return O?.setCacheOutcome(HA.CACHED_ACCESS_TOKEN_EXPIRED), [null, HA.CACHED_ACCESS_TOKEN_EXPIRED];
        if (w.refreshOn && Lf.isTokenExpired(w.refreshOn.toString(), 0))
          (A = HA.PROACTIVELY_REFRESHED), O?.setCacheOutcome(HA.PROACTIVELY_REFRESHED);
        return [
          await GD.generateAuthenticationResult(
            q,
            $,
            { account: null, idToken: null, accessToken: w, refreshToken: null, appMetadata: null },
            !0,
            H,
          ),
          A,
        ];
      }
      readAccessTokenFromCache(H, _, q, $, K) {
        let O = {
            homeAccountId: d6.EMPTY_STRING,
            environment: H.canonicalAuthorityUrlComponents.HostNameAndPort,
            credentialType: fT.ACCESS_TOKEN,
            clientId: _,
            realm: H.tenant,
            target: WD.createSearchScopes(q.asArray()),
          },
          T = $.getAccessTokensByFilter(O, K);
        if (T.length < 1) return null;
        else if (T.length > 1) throw T8(Oz.multipleMatchingTokens);
        return T[0];
      }
      async executeTokenRequest(H, _, q) {
        let $, K;
        if (this.appTokenProvider) {
          this.logger.info("Using appTokenProvider extensibility.");
          let z = {
            correlationId: H.correlationId,
            tenantId: this.config.authOptions.authority.tenant,
            scopes: H.scopes,
            claims: H.claims,
          };
          K = Lf.nowSeconds();
          let A = await this.appTokenProvider(z);
          $ = {
            access_token: A.accessToken,
            expires_in: A.expiresInSeconds,
            refresh_in: A.refreshInSeconds,
            token_type: H5.BEARER,
          };
        } else {
          let z = this.createTokenQueryParameters(H),
            A = R1.appendQueryString(_.tokenEndpoint, z),
            f = await this.createTokenRequestBody(H),
            w = this.createTokenRequestHeaders(),
            Y = {
              clientId: this.config.authOptions.clientId,
              authority: H.authority,
              scopes: H.scopes,
              claims: H.claims,
              authenticationScheme: H.authenticationScheme,
              resourceRequestMethod: H.resourceRequestMethod,
              resourceRequestUri: H.resourceRequestUri,
              shrClaims: H.shrClaims,
              sshKid: H.sshKid,
            };
          this.logger.info("Sending token request to endpoint: " + _.tokenEndpoint), (K = Lf.nowSeconds());
          let D = await this.executePostToTokenEndpoint(A, f, w, Y, H.correlationId);
          ($ = D.body), ($.status = D.status);
        }
        let O = new GD(
          this.config.authOptions.clientId,
          this.cacheManager,
          this.cryptoUtils,
          this.logger,
          this.config.serializableCache,
          this.config.persistencePlugin,
        );
        return O.validateTokenResponse($, q), await O.handleServerTokenResponse($, this.authority, K, H);
      }
      async createTokenRequestBody(H) {
        let _ = new Map();
        if (
          (D7.addClientId(_, this.config.authOptions.clientId),
          D7.addScopes(_, H.scopes, !1),
          D7.addGrantType(_, jk.CLIENT_CREDENTIALS_GRANT),
          D7.addLibraryInfo(_, this.config.libraryInfo),
          D7.addApplicationTelemetry(_, this.config.telemetry.application),
          D7.addThrottling(_),
          this.serverTelemetryManager)
        )
          D7.addServerTelemetry(_, this.serverTelemetryManager);
        let q = H.correlationId || this.config.cryptoInterface.createNewGuid();
        if ((D7.addCorrelationId(_, q), this.config.clientCredentials.clientSecret))
          D7.addClientSecret(_, this.config.clientCredentials.clientSecret);
        let $ = H.clientAssertion || this.config.clientCredentials.clientAssertion;
        if ($)
          D7.addClientAssertion(_, await fZ($.assertion, this.config.authOptions.clientId, H.resourceRequestUri)),
            D7.addClientAssertionType(_, $.assertionType);
        if (
          !_A.isEmptyObj(H.claims) ||
          (this.config.authOptions.clientCapabilities && this.config.authOptions.clientCapabilities.length > 0)
        )
          D7.addClaims(_, H.claims, this.config.authOptions.clientCapabilities);
        return hX.mapToQueryString(_);
      }
    };
