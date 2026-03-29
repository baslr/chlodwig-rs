    fgH();
    vHH();
    Jj();
    jgH();
    gA();
    ZHH();
    OXH();
    iI();
    Sl();
    r2_();
    j2(); /*! @azure/msal-common v15.13.1 2025-10-29 */
    Aj_ = class Aj_ extends F0 {
      constructor(H, _) {
        super(H, _);
      }
      async acquireCachedToken(H) {
        this.performanceClient?.addQueueMeasurement(N6.SilentFlowClientAcquireCachedToken, H.correlationId);
        let _ = HA.NOT_APPLICABLE;
        if (H.forceRefresh || (!this.config.cacheOptions.claimsBasedCachingEnabled && !_A.isEmptyObj(H.claims)))
          throw (this.setCacheOutcome(HA.FORCE_REFRESH_OR_CLAIMS, H.correlationId), T8(Zl));
        if (!H.account) throw T8(Gl);
        let q = H.account.tenantId || t2q(H.authority),
          $ = this.cacheManager.getTokenKeys(),
          K = this.cacheManager.getAccessToken(H.account, H, $, q);
        if (!K) throw (this.setCacheOutcome(HA.NO_CACHED_ACCESS_TOKEN, H.correlationId), T8(Zl));
        else if (RM6(K.cachedAt) || YXH(K.expiresOn, this.config.systemOptions.tokenRenewalOffsetSeconds))
          throw (this.setCacheOutcome(HA.CACHED_ACCESS_TOKEN_EXPIRED, H.correlationId), T8(Zl));
        else if (K.refreshOn && YXH(K.refreshOn, 0)) _ = HA.PROACTIVELY_REFRESHED;
        let O = H.authority || this.authority.getPreferredCache(),
          T = {
            account: this.cacheManager.getAccount(this.cacheManager.generateAccountKey(H.account), H.correlationId),
            accessToken: K,
            idToken: this.cacheManager.getIdToken(H.account, H.correlationId, $, q, this.performanceClient),
            refreshToken: null,
            appMetadata: this.cacheManager.readAppMetadataFromCache(O),
          };
        if ((this.setCacheOutcome(_, H.correlationId), this.config.serverTelemetryManager))
          this.config.serverTelemetryManager.incrementCacheHits();
        return [
          await V5(
            this.generateResultFromCacheRecord.bind(this),
            N6.SilentFlowClientGenerateResultFromCacheRecord,
            this.logger,
            this.performanceClient,
            H.correlationId,
          )(T, H),
          _,
        ];
      }
      setCacheOutcome(H, _) {
        if (
          (this.serverTelemetryManager?.setCacheOutcome(H),
          this.performanceClient?.addFields({ cacheOutcome: H }, _),
          H !== HA.NOT_APPLICABLE)
        )
          this.logger.info(`Token refresh is required due to cache outcome: ${H}`);
      }
      async generateResultFromCacheRecord(H, _) {
        this.performanceClient?.addQueueMeasurement(N6.SilentFlowClientGenerateResultFromCacheRecord, _.correlationId);
        let q;
        if (H.idToken) q = Nl(H.idToken.secret, this.config.cryptoInterface.base64Decode);
        if (_.maxAge || _.maxAge === 0) {
          let $ = q?.auth_time;
          if (!$) throw T8(Wl);
          UBH($, _.maxAge);
        }
        return GD.generateAuthenticationResult(this.cryptoUtils, this.authority, H, !0, _, q);
      }
    };
