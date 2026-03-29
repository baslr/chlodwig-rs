    PM_();
    MM_();
    vf();
    wT();
    XM_();
    lJ6(); /*! @azure/msal-node v3.8.1 2025-10-29 */
    FgH = class FgH extends P5H {
      constructor(H) {
        super(H);
        let _ = !!this.config.auth.clientSecret,
          q = !!this.config.auth.clientAssertion,
          $ =
            (!!this.config.auth.clientCertificate?.thumbprint ||
              !!this.config.auth.clientCertificate?.thumbprintSha256) &&
            !!this.config.auth.clientCertificate?.privateKey;
        if (this.appTokenProvider) return;
        if ((_ && q) || (q && $) || (_ && $)) throw T8(Oz.invalidClientCredential);
        if (this.config.auth.clientSecret) {
          this.clientSecret = this.config.auth.clientSecret;
          return;
        }
        if (this.config.auth.clientAssertion) {
          this.developerProvidedClientAssertion = this.config.auth.clientAssertion;
          return;
        }
        if (!$) throw T8(Oz.invalidClientCredential);
        else
          this.clientAssertion = this.config.auth.clientCertificate.thumbprintSha256
            ? aI.fromCertificateWithSha256Thumbprint(
                this.config.auth.clientCertificate.thumbprintSha256,
                this.config.auth.clientCertificate.privateKey,
                this.config.auth.clientCertificate.x5c,
              )
            : aI.fromCertificate(
                this.config.auth.clientCertificate.thumbprint,
                this.config.auth.clientCertificate.privateKey,
                this.config.auth.clientCertificate.x5c,
              );
        this.appTokenProvider = void 0;
      }
      SetAppTokenProvider(H) {
        this.appTokenProvider = H;
      }
      async acquireTokenByClientCredential(H) {
        this.logger.info("acquireTokenByClientCredential called", H.correlationId);
        let _;
        if (H.clientAssertion)
          _ = {
            assertion: await fZ(H.clientAssertion, this.config.auth.clientId),
            assertionType: wZ.JWT_BEARER_ASSERTION_TYPE,
          };
        let q = await this.initializeBaseRequest(H),
          $ = { ...q, scopes: q.scopes.filter((Y) => !d0.includes(Y)) },
          K = { ...H, ...$, clientAssertion: _ },
          T = new R1(K.authority).getUrlComponents().PathSegments[0];
        if (Object.values(Dk).includes(T)) throw T8(Oz.missingTenantIdError);
        let z = process.env[Gjq],
          A;
        if (K.azureRegion !== "DisableMsalForceRegion")
          if (!K.azureRegion && z) A = z;
          else A = K.azureRegion;
        let f = { azureRegion: A, environmentRegion: process.env[Wjq] },
          w = this.initializeServerTelemetryManager(Cl.acquireTokenByClientCredential, K.correlationId, K.skipCache);
        try {
          let Y = await this.createAuthority(K.authority, K.correlationId, f, H.azureCloudOptions),
            D = await this.buildOauthClientConfiguration(Y, K.correlationId, "", w),
            j = new X5H(D, this.appTokenProvider);
          return this.logger.verbose("Client credential client created", K.correlationId), await j.acquireToken(K);
        } catch (Y) {
          if (Y instanceof l4) Y.setCorrelationId(K.correlationId);
          throw (w.cacheFailedRequest(Y), Y);
        }
      }
      async acquireTokenOnBehalfOf(H) {
        this.logger.info("acquireTokenOnBehalfOf called", H.correlationId);
        let _ = { ...H, ...(await this.initializeBaseRequest(H)) };
        try {
          let q = await this.createAuthority(_.authority, _.correlationId, void 0, H.azureCloudOptions),
            $ = await this.buildOauthClientConfiguration(q, _.correlationId, "", void 0),
            K = new cgH($);
          return this.logger.verbose("On behalf of client created", _.correlationId), await K.acquireToken(_);
        } catch (q) {
          if (q instanceof l4) q.setCorrelationId(_.correlationId);
          throw q;
        }
      }
    };
