    m2_();
    fgH();
    wXH();
    tKH();
    gA();
    AXH();
    jgH();
    Oj_();
    ZHH();
    RHH();
    Jj();
    jXH();
    vHH();
    LHH();
    iBH();
    KXH();
    DgH();
    iI();
    Sl();
    Tj_();
    a2_();
    Hj_();
    vl();
    j2(); /*! @azure/msal-common v15.13.1 2025-10-29 */
    JXH = class JXH extends F0 {
      constructor(H, _) {
        super(H, _);
      }
      async acquireToken(H) {
        this.performanceClient?.addQueueMeasurement(N6.RefreshTokenClientAcquireToken, H.correlationId);
        let _ = Ih(),
          q = await V5(
            this.executeTokenRequest.bind(this),
            N6.RefreshTokenClientExecuteTokenRequest,
            this.logger,
            this.performanceClient,
            H.correlationId,
          )(H, this.authority),
          $ = q.headers?.[BA.X_MS_REQUEST_ID],
          K = new GD(
            this.config.authOptions.clientId,
            this.cacheManager,
            this.cryptoUtils,
            this.logger,
            this.config.serializableCache,
            this.config.persistencePlugin,
          );
        return (
          K.validateTokenResponse(q.body),
          V5(
            K.handleServerTokenResponse.bind(K),
            N6.HandleServerTokenResponse,
            this.logger,
            this.performanceClient,
            H.correlationId,
          )(q.body, this.authority, _, H, void 0, void 0, !0, H.forceCache, $)
        );
      }
      async acquireTokenByRefreshToken(H) {
        if (!H) throw Tz(nKH);
        if (
          (this.performanceClient?.addQueueMeasurement(
            N6.RefreshTokenClientAcquireTokenByRefreshToken,
            H.correlationId,
          ),
          !H.account)
        )
          throw T8(Gl);
        if (this.cacheManager.isAppMetadataFOCI(H.account.environment))
          try {
            return await V5(
              this.acquireTokenWithCachedRefreshToken.bind(this),
              N6.RefreshTokenClientAcquireTokenWithCachedRefreshToken,
              this.logger,
              this.performanceClient,
              H.correlationId,
            )(H, !0);
          } catch (q) {
            let $ = q instanceof uh && q.errorCode === NHH,
              K =
                q instanceof AZ && q.errorCode === YBH.INVALID_GRANT_ERROR && q.subError === YBH.CLIENT_MISMATCH_ERROR;
            if ($ || K)
              return V5(
                this.acquireTokenWithCachedRefreshToken.bind(this),
                N6.RefreshTokenClientAcquireTokenWithCachedRefreshToken,
                this.logger,
                this.performanceClient,
                H.correlationId,
              )(H, !1);
            else throw q;
          }
        return V5(
          this.acquireTokenWithCachedRefreshToken.bind(this),
          N6.RefreshTokenClientAcquireTokenWithCachedRefreshToken,
          this.logger,
          this.performanceClient,
          H.correlationId,
        )(H, !1);
      }
      async acquireTokenWithCachedRefreshToken(H, _) {
        this.performanceClient?.addQueueMeasurement(
          N6.RefreshTokenClientAcquireTokenWithCachedRefreshToken,
          H.correlationId,
        );
        let q = a2q(
          this.cacheManager.getRefreshToken.bind(this.cacheManager),
          N6.CacheManagerGetRefreshToken,
          this.logger,
          this.performanceClient,
          H.correlationId,
        )(H.account, _, H.correlationId, void 0, this.performanceClient);
        if (!q) throw $j_(NHH);
        if (q.expiresOn && YXH(q.expiresOn, H.refreshTokenExpirationOffsetSeconds || SH4))
          throw (this.performanceClient?.addFields({ rtExpiresOnMs: Number(q.expiresOn) }, H.correlationId), $j_(YgH));
        let $ = {
          ...H,
          refreshToken: q.secret,
          authenticationScheme: H.authenticationScheme || H5.BEARER,
          ccsCredential: { credential: H.account.homeAccountId, type: TZ.HOME_ACCOUNT_ID },
        };
        try {
          return await V5(
            this.acquireToken.bind(this),
            N6.RefreshTokenClientAcquireToken,
            this.logger,
            this.performanceClient,
            H.correlationId,
          )($);
        } catch (K) {
          if (K instanceof uh) {
            if (
              (this.performanceClient?.addFields({ rtExpiresOnMs: Number(q.expiresOn) }, H.correlationId),
              K.subError === hHH)
            ) {
              this.logger.verbose("acquireTokenWithRefreshToken: bad refresh token, removing from cache");
              let O = this.cacheManager.generateCredentialKey(q);
              this.cacheManager.removeRefreshToken(O, H.correlationId);
            }
          }
          throw K;
        }
      }
      async executeTokenRequest(H, _) {
        this.performanceClient?.addQueueMeasurement(N6.RefreshTokenClientExecuteTokenRequest, H.correlationId);
        let q = this.createTokenQueryParameters(H),
          $ = R1.appendQueryString(_.tokenEndpoint, q),
          K = await V5(
            this.createTokenRequestBody.bind(this),
            N6.RefreshTokenClientCreateTokenRequestBody,
            this.logger,
            this.performanceClient,
            H.correlationId,
          )(H),
          O = this.createTokenRequestHeaders(H.ccsCredential),
          T = MXH(this.config.authOptions.clientId, H);
        return V5(
          this.executePostToTokenEndpoint.bind(this),
          N6.RefreshTokenClientExecutePostToTokenEndpoint,
          this.logger,
          this.performanceClient,
          H.correlationId,
        )($, K, O, T, H.correlationId, N6.RefreshTokenClientExecutePostToTokenEndpoint);
      }
      async createTokenRequestBody(H) {
        this.performanceClient?.addQueueMeasurement(N6.RefreshTokenClientCreateTokenRequestBody, H.correlationId);
        let _ = new Map();
        if (
          ($5H(_, H.embeddedClientId || H.tokenBodyParameters?.[BB] || this.config.authOptions.clientId), H.redirectUri)
        )
          K5H(_, H.redirectUri);
        if (
          (q5H(_, H.scopes, !0, this.config.authOptions.authority.options.OIDCOptions?.defaultScopes),
          HgH(_, jk.REFRESH_TOKEN_GRANT),
          z5H(_),
          rBH(_, this.config.libraryInfo),
          oBH(_, this.config.telemetry.application),
          OgH(_),
          this.serverTelemetryManager && !x2_(this.config))
        )
          KgH(_, this.serverTelemetryManager);
        if ((XM6(_, H.refreshToken), this.config.clientCredentials.clientSecret))
          sBH(_, this.config.clientCredentials.clientSecret);
        if (this.config.clientCredentials.clientAssertion) {
          let q = this.config.clientCredentials.clientAssertion;
          tBH(_, await fZ(q.assertion, this.config.authOptions.clientId, H.resourceRequestUri)),
            eBH(_, q.assertionType);
        }
        if (H.authenticationScheme === H5.POP) {
          let q = new A5H(this.cryptoUtils, this.performanceClient),
            $;
          if (!H.popKid)
            $ = (
              await V5(
                q.generateCnf.bind(q),
                N6.PopTokenGenerateCnf,
                this.logger,
                this.performanceClient,
                H.correlationId,
              )(H, this.logger)
            ).reqCnfString;
          else $ = this.cryptoUtils.encodeKid(H.popKid);
          qgH(_, $);
        } else if (H.authenticationScheme === H5.SSH)
          if (H.sshJwk) $gH(_, H.sshJwk);
          else throw Tz(kl);
        if (
          !_A.isEmptyObj(H.claims) ||
          (this.config.authOptions.clientCapabilities && this.config.authOptions.clientCapabilities.length > 0)
        )
          O5H(_, H.claims, this.config.authOptions.clientCapabilities);
        if (this.config.systemOptions.preventCorsPreflight && H.ccsCredential)
          switch (H.ccsCredential.type) {
            case TZ.HOME_ACCOUNT_ID:
              try {
                let q = mB(H.ccsCredential.credential);
                hl(_, q);
              } catch (q) {
                this.logger.verbose("Could not parse home account ID for CCS Header: " + q);
              }
              break;
            case TZ.UPN:
              kHH(_, H.ccsCredential.credential);
              break;
          }
        if (H.embeddedClientId) Vl(_, this.config.authOptions.clientId, this.config.authOptions.redirectUri);
        if (H.tokenBodyParameters) yl(_, H.tokenBodyParameters);
        return _5H(_, H.correlationId, this.performanceClient), pB(_);
      }
    };
