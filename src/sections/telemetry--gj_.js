    wT();
    fj_();
    R2_();
    Bj_();
    DMq(); /*! @azure/msal-node v3.8.1 2025-10-29 */
    j5H = class j5H extends eKH {
      constructor(H, _, q, $) {
        super(_, q, H, new TXH(), $);
        (this.cache = {}), (this.changeEmitters = []), (this.logger = H);
      }
      registerChangeEmitter(H) {
        this.changeEmitters.push(H);
      }
      emitChange() {
        this.changeEmitters.forEach((H) => H.call(null));
      }
      cacheToInMemoryCache(H) {
        let _ = { accounts: {}, idTokens: {}, accessTokens: {}, refreshTokens: {}, appMetadata: {} };
        for (let q in H) {
          let $ = H[q];
          if (typeof $ !== "object") continue;
          if ($ instanceof Pj) _.accounts[q] = $;
          else if (zZ.isIdTokenEntity($)) _.idTokens[q] = $;
          else if (zZ.isAccessTokenEntity($)) _.accessTokens[q] = $;
          else if (zZ.isRefreshTokenEntity($)) _.refreshTokens[q] = $;
          else if (zZ.isAppMetadataEntity(q, $)) _.appMetadata[q] = $;
          else continue;
        }
        return _;
      }
      inMemoryCacheToCache(H) {
        let _ = this.getCache();
        return (_ = { ..._, ...H.accounts, ...H.idTokens, ...H.accessTokens, ...H.refreshTokens, ...H.appMetadata }), _;
      }
      getInMemoryCache() {
        return this.logger.trace("Getting in-memory cache"), this.cacheToInMemoryCache(this.getCache());
      }
      setInMemoryCache(H) {
        this.logger.trace("Setting in-memory cache");
        let _ = this.inMemoryCacheToCache(H);
        this.setCache(_), this.emitChange();
      }
      getCache() {
        return this.logger.trace("Getting cache key-value store"), this.cache;
      }
      setCache(H) {
        this.logger.trace("Setting cache key value store"), (this.cache = H), this.emitChange();
      }
      getItem(H) {
        return this.logger.tracePii(`Item key: ${H}`), this.getCache()[H];
      }
      setItem(H, _) {
        this.logger.tracePii(`Item key: ${H}`);
        let q = this.getCache();
        (q[H] = _), this.setCache(q);
      }
      generateCredentialKey(H) {
        return wMq(H);
      }
      generateAccountKey(H) {
        return YMq(H);
      }
      getAccountKeys() {
        let H = this.getInMemoryCache();
        return Object.keys(H.accounts);
      }
      getTokenKeys() {
        let H = this.getInMemoryCache();
        return {
          idToken: Object.keys(H.idTokens),
          accessToken: Object.keys(H.accessTokens),
          refreshToken: Object.keys(H.refreshTokens),
        };
      }
      getAccount(H) {
        return this.getItem(H) ? Object.assign(new Pj(), this.getItem(H)) : null;
      }
      async setAccount(H) {
        let _ = this.generateAccountKey(Pj.getAccountInfo(H));
        this.setItem(_, H);
      }
      getIdTokenCredential(H) {
        let _ = this.getItem(H);
        if (zZ.isIdTokenEntity(_)) return _;
        return null;
      }
      async setIdTokenCredential(H) {
        let _ = this.generateCredentialKey(H);
        this.setItem(_, H);
      }
      getAccessTokenCredential(H) {
        let _ = this.getItem(H);
        if (zZ.isAccessTokenEntity(_)) return _;
        return null;
      }
      async setAccessTokenCredential(H) {
        let _ = this.generateCredentialKey(H);
        this.setItem(_, H);
      }
      getRefreshTokenCredential(H) {
        let _ = this.getItem(H);
        if (zZ.isRefreshTokenEntity(_)) return _;
        return null;
      }
      async setRefreshTokenCredential(H) {
        let _ = this.generateCredentialKey(H);
        this.setItem(_, H);
      }
      getAppMetadata(H) {
        let _ = this.getItem(H);
        if (zZ.isAppMetadataEntity(H, _)) return _;
        return null;
      }
      setAppMetadata(H) {
        let _ = zZ.generateAppMetadataKey(H);
        this.setItem(_, H);
      }
      getServerTelemetry(H) {
        let _ = this.getItem(H);
        if (_ && zZ.isServerTelemetryEntity(H, _)) return _;
        return null;
      }
      setServerTelemetry(H, _) {
        this.setItem(H, _);
      }
      getAuthorityMetadata(H) {
        let _ = this.getItem(H);
        if (_ && zZ.isAuthorityMetadataEntity(H, _)) return _;
        return null;
      }
      getAuthorityMetadataKeys() {
        return this.getKeys().filter((H) => {
          return this.isAuthorityMetadata(H);
        });
      }
      setAuthorityMetadata(H, _) {
        this.setItem(H, _);
      }
      getThrottlingCache(H) {
        let _ = this.getItem(H);
        if (_ && zZ.isThrottlingEntity(H, _)) return _;
        return null;
      }
      setThrottlingCache(H, _) {
        this.setItem(H, _);
      }
      removeItem(H) {
        this.logger.tracePii(`Item key: ${H}`);
        let _ = !1,
          q = this.getCache();
        if (q[H]) delete q[H], (_ = !0);
        if (_) this.setCache(q), this.emitChange();
        return _;
      }
      removeOutdatedAccount(H) {
        this.removeItem(H);
      }
      containsKey(H) {
        return this.getKeys().includes(H);
      }
      getKeys() {
        this.logger.trace("Retrieving all cache keys");
        let H = this.getCache();
        return [...Object.keys(H)];
      }
      clear() {
        this.logger.trace("Clearing cache entries created by MSAL"),
          this.getKeys().forEach((_) => {
            this.removeItem(_);
          }),
          this.emitChange();
      }
      static generateInMemoryCache(H) {
        return VHH.deserializeAllCache(VHH.deserializeJSONBlob(H));
      }
      static generateJsonCache(H) {
        return LKH.serializeAllCache(H);
      }
      updateCredentialCacheKey(H, _) {
        let q = this.generateCredentialKey(_);
        if (H !== q) {
          let $ = this.getItem(H);
          if ($)
            return (
              this.removeItem(H),
              this.setItem(q, $),
              this.logger.verbose(`Updated an outdated ${_.credentialType} cache key`),
              q
            );
          else
            this.logger.error(
              `Attempted to update an outdated ${_.credentialType} cache key but no item matching the outdated key was found in storage`,
            );
        }
        return H;
      }
    };
