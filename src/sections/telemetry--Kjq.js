    fgH();
    wXH();
    tKH();
    gA();
    AXH();
    m2_();
    jgH();
    ZHH();
    Jj();
    LHH();
    Oj_();
    vHH();
    KXH();
    iBH();
    RHH();
    iI();
    Sl();
    Tj_();
    a2_();
    j2();
    vl(); /*! @azure/msal-common v15.13.1 2025-10-29 */
    zj_ = class zj_ extends F0 {
      constructor(H, _) {
        super(H, _);
        (this.includeRedirectUri = !0),
          (this.oidcDefaultScopes = this.config.authOptions.authority.options.OIDCOptions?.defaultScopes);
      }
      async acquireToken(H, _) {
        if ((this.performanceClient?.addQueueMeasurement(N6.AuthClientAcquireToken, H.correlationId), !H.code))
          throw T8(xKH);
        let q = Ih(),
          $ = await V5(
            this.executeTokenRequest.bind(this),
            N6.AuthClientExecuteTokenRequest,
            this.logger,
            this.performanceClient,
            H.correlationId,
          )(this.authority, H),
          K = $.headers?.[BA.X_MS_REQUEST_ID],
          O = new GD(
            this.config.authOptions.clientId,
            this.cacheManager,
            this.cryptoUtils,
            this.logger,
            this.config.serializableCache,
            this.config.persistencePlugin,
            this.performanceClient,
          );
        return (
          O.validateTokenResponse($.body),
          V5(
            O.handleServerTokenResponse.bind(O),
            N6.HandleServerTokenResponse,
            this.logger,
            this.performanceClient,
            H.correlationId,
          )($.body, this.authority, q, H, _, void 0, void 0, void 0, K)
        );
      }
      getLogoutUri(H) {
        if (!H) throw Tz(rKH);
        let _ = this.createLogoutUrlQueryString(H);
        return R1.appendQueryString(this.authority.endSessionEndpoint, _);
      }
      async executeTokenRequest(H, _) {
        this.performanceClient?.addQueueMeasurement(N6.AuthClientExecuteTokenRequest, _.correlationId);
        let q = this.createTokenQueryParameters(_),
          $ = R1.appendQueryString(H.tokenEndpoint, q),
          K = await V5(
            this.createTokenRequestBody.bind(this),
            N6.AuthClientCreateTokenRequestBody,
            this.logger,
            this.performanceClient,
            _.correlationId,
          )(_),
          O = void 0;
        if (_.clientInfo)
          try {
            let A = $XH(_.clientInfo, this.cryptoUtils.base64Decode);
            O = { credential: `${A.uid}${Xl.CLIENT_INFO_SEPARATOR}${A.utid}`, type: TZ.HOME_ACCOUNT_ID };
          } catch (A) {
            this.logger.verbose("Could not parse client info for CCS Header: " + A);
          }
        let T = this.createTokenRequestHeaders(O || _.ccsCredential),
          z = MXH(this.config.authOptions.clientId, _);
        return V5(
          this.executePostToTokenEndpoint.bind(this),
          N6.AuthorizationCodeClientExecutePostToTokenEndpoint,
          this.logger,
          this.performanceClient,
          _.correlationId,
        )($, K, T, z, _.correlationId, N6.AuthorizationCodeClientExecutePostToTokenEndpoint);
      }
      async createTokenRequestBody(H) {
        this.performanceClient?.addQueueMeasurement(N6.AuthClientCreateTokenRequestBody, H.correlationId);
        let _ = new Map();
        if (
          ($5H(_, H.embeddedClientId || H.tokenBodyParameters?.[BB] || this.config.authOptions.clientId),
          !this.includeRedirectUri)
        ) {
          if (!H.redirectUri) throw Tz(UKH);
        } else K5H(_, H.redirectUri);
        if (
          (q5H(_, H.scopes, !0, this.oidcDefaultScopes),
          PM6(_, H.code),
          rBH(_, this.config.libraryInfo),
          oBH(_, this.config.telemetry.application),
          OgH(_),
          this.serverTelemetryManager && !x2_(this.config))
        )
          KgH(_, this.serverTelemetryManager);
        if (H.codeVerifier) WM6(_, H.codeVerifier);
        if (this.config.clientCredentials.clientSecret) sBH(_, this.config.clientCredentials.clientSecret);
        if (this.config.clientCredentials.clientAssertion) {
          let $ = this.config.clientCredentials.clientAssertion;
          tBH(_, await fZ($.assertion, this.config.authOptions.clientId, H.resourceRequestUri)),
            eBH(_, $.assertionType);
        }
        if ((HgH(_, jk.AUTHORIZATION_CODE_GRANT), z5H(_), H.authenticationScheme === H5.POP)) {
          let $ = new A5H(this.cryptoUtils, this.performanceClient),
            K;
          if (!H.popKid)
            K = (
              await V5(
                $.generateCnf.bind($),
                N6.PopTokenGenerateCnf,
                this.logger,
                this.performanceClient,
                H.correlationId,
              )(H, this.logger)
            ).reqCnfString;
          else K = this.cryptoUtils.encodeKid(H.popKid);
          qgH(_, K);
        } else if (H.authenticationScheme === H5.SSH)
          if (H.sshJwk) $gH(_, H.sshJwk);
          else throw Tz(kl);
        if (
          !_A.isEmptyObj(H.claims) ||
          (this.config.authOptions.clientCapabilities && this.config.authOptions.clientCapabilities.length > 0)
        )
          O5H(_, H.claims, this.config.authOptions.clientCapabilities);
        let q = void 0;
        if (H.clientInfo)
          try {
            let $ = $XH(H.clientInfo, this.cryptoUtils.base64Decode);
            q = { credential: `${$.uid}${Xl.CLIENT_INFO_SEPARATOR}${$.utid}`, type: TZ.HOME_ACCOUNT_ID };
          } catch ($) {
            this.logger.verbose("Could not parse client info for CCS Header: " + $);
          }
        else q = H.ccsCredential;
        if (this.config.systemOptions.preventCorsPreflight && q)
          switch (q.type) {
            case TZ.HOME_ACCOUNT_ID:
              try {
                let $ = mB(q.credential);
                hl(_, $);
              } catch ($) {
                this.logger.verbose("Could not parse home account ID for CCS Header: " + $);
              }
              break;
            case TZ.UPN:
              kHH(_, q.credential);
              break;
          }
        if (H.embeddedClientId) Vl(_, this.config.authOptions.clientId, this.config.authOptions.redirectUri);
        if (H.tokenBodyParameters) yl(_, H.tokenBodyParameters);
        if (H.enableSpaAuthorizationCode && (!H.tokenBodyParameters || !H.tokenBodyParameters[d2_]))
          yl(_, { [d2_]: "1" });
        return _5H(_, H.correlationId, this.performanceClient), pB(_);
      }
      createLogoutUrlQueryString(H) {
        let _ = new Map();
        if (H.postLogoutRedirectUri) YM6(_, H.postLogoutRedirectUri);
        if (H.correlationId) T5H(_, H.correlationId);
        if (H.idTokenHint) DM6(_, H.idTokenHint);
        if (H.state) aBH(_, H.state);
        if (H.logoutHint) GM6(_, H.logoutHint);
        if (H.extraQueryParameters) yl(_, H.extraQueryParameters);
        if (this.config.authOptions.instanceAware) _gH(_);
        return pB(_, this.config.authOptions.encodeExtraQueryParams, H.extraQueryParameters);
      }
    };
