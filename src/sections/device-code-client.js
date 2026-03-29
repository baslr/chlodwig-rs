    wT(); /*! @azure/msal-node v3.8.1 2025-10-29 */
    ggH = class ggH extends F0 {
      constructor(H) {
        super(H);
      }
      async acquireToken(H) {
        let _ = await this.getDeviceCode(H);
        H.deviceCodeCallback(_);
        let q = Lf.nowSeconds(),
          $ = await this.acquireTokenWithDeviceCode(H, _),
          K = new GD(
            this.config.authOptions.clientId,
            this.cacheManager,
            this.cryptoUtils,
            this.logger,
            this.config.serializableCache,
            this.config.persistencePlugin,
          );
        return K.validateTokenResponse($), K.handleServerTokenResponse($, this.authority, q, H);
      }
      async getDeviceCode(H) {
        let _ = this.createExtraQueryParameters(H),
          q = R1.appendQueryString(this.authority.deviceCodeEndpoint, _),
          $ = this.createQueryString(H),
          K = this.createTokenRequestHeaders(),
          O = {
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
        return this.executePostRequestToDeviceCodeEndpoint(q, $, K, O, H.correlationId);
      }
      createExtraQueryParameters(H) {
        let _ = new Map();
        if (H.extraQueryParameters) D7.addExtraQueryParameters(_, H.extraQueryParameters);
        return hX.mapToQueryString(_);
      }
      async executePostRequestToDeviceCodeEndpoint(H, _, q, $, K) {
        let {
          body: { user_code: O, device_code: T, verification_uri: z, expires_in: A, interval: f, message: w },
        } = await this.sendPostRequest($, H, { body: _, headers: q }, K);
        return { userCode: O, deviceCode: T, verificationUri: z, expiresIn: A, interval: f, message: w };
      }
      createQueryString(H) {
        let _ = new Map();
        if ((D7.addScopes(_, H.scopes), D7.addClientId(_, this.config.authOptions.clientId), H.extraQueryParameters))
          D7.addExtraQueryParameters(_, H.extraQueryParameters);
        if (
          H.claims ||
          (this.config.authOptions.clientCapabilities && this.config.authOptions.clientCapabilities.length > 0)
        )
          D7.addClaims(_, H.claims, this.config.authOptions.clientCapabilities);
        return hX.mapToQueryString(_);
      }
      continuePolling(H, _, q) {
        if (q)
          throw (
            (this.logger.error("Token request cancelled by setting DeviceCodeRequest.cancel = true"),
            T8(Oz.deviceCodePollingCancelled))
          );
        else if (_ && _ < H && Lf.nowSeconds() > _)
          throw (
            (this.logger.error(`User defined timeout for device code polling reached. The timeout was set for ${_}`),
            T8(Oz.userTimeoutReached))
          );
        else if (Lf.nowSeconds() > H) {
          if (_)
            this.logger.verbose(
              `User specified timeout ignored as the device code has expired before the timeout elapsed. The user specified timeout was set for ${_}`,
            );
          throw (
            (this.logger.error(`Device code expired. Expiration time of device code was ${H}`),
            T8(Oz.deviceCodeExpired))
          );
        }
        return !0;
      }
      async acquireTokenWithDeviceCode(H, _) {
        let q = this.createTokenQueryParameters(H),
          $ = R1.appendQueryString(this.authority.tokenEndpoint, q),
          K = this.createTokenRequestBody(H, _),
          O = this.createTokenRequestHeaders(),
          T = H.timeout ? Lf.nowSeconds() + H.timeout : void 0,
          z = Lf.nowSeconds() + _.expiresIn,
          A = _.interval * 1000;
        while (this.continuePolling(z, T, H.cancel)) {
          let f = {
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
            w = await this.executePostToTokenEndpoint($, K, O, f, H.correlationId);
          if (w.body && w.body.error)
            if (w.body.error === d6.AUTHORIZATION_PENDING)
              this.logger.info("Authorization pending. Continue polling."), await Lf.delay(A);
            else
              throw (
                (this.logger.info("Unexpected error in polling from the server"),
                fj6(tPH.postRequestFailed, w.body.error))
              );
          else return this.logger.verbose("Authorization completed successfully. Polling stopped."), w.body;
        }
        throw (this.logger.error("Polling stopped for unknown reasons."), T8(Oz.deviceCodeUnknownError));
      }
      createTokenRequestBody(H, _) {
        let q = new Map();
        D7.addScopes(q, H.scopes),
          D7.addClientId(q, this.config.authOptions.clientId),
          D7.addGrantType(q, jk.DEVICE_CODE_GRANT),
          D7.addDeviceCode(q, _.deviceCode);
        let $ = H.correlationId || this.config.cryptoInterface.createNewGuid();
        if (
          (D7.addCorrelationId(q, $),
          D7.addClientInfo(q),
          D7.addLibraryInfo(q, this.config.libraryInfo),
          D7.addApplicationTelemetry(q, this.config.telemetry.application),
          D7.addThrottling(q),
          this.serverTelemetryManager)
        )
          D7.addServerTelemetry(q, this.serverTelemetryManager);
        if (
          !_A.isEmptyObj(H.claims) ||
          (this.config.authOptions.clientCapabilities && this.config.authOptions.clientCapabilities.length > 0)
        )
          D7.addClaims(q, H.claims, this.config.authOptions.clientCapabilities);
        return hX.mapToQueryString(q);
      }
    };
