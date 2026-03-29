    vf();
    wT();
    PM_();
    WgH();
    nXq();
    QJ6();
    vXH(); /*! @azure/msal-node v3.8.1 2025-10-29 */
    dgH = class dgH extends P5H {
      constructor(H) {
        super(H);
        if (this.config.broker.nativeBrokerPlugin)
          if (this.config.broker.nativeBrokerPlugin.isBrokerAvailable)
            (this.nativeBrokerPlugin = this.config.broker.nativeBrokerPlugin),
              this.nativeBrokerPlugin.setLogger(this.config.system.loggerOptions);
          else this.logger.warning("NativeBroker implementation was provided but the broker is unavailable.");
        this.skus = yHH.makeExtraSkuString({ libraryName: wZ.MSAL_SKU, libraryVersion: sI });
      }
      async acquireTokenByDeviceCode(H) {
        this.logger.info("acquireTokenByDeviceCode called", H.correlationId);
        let _ = Object.assign(H, await this.initializeBaseRequest(H)),
          q = this.initializeServerTelemetryManager(Cl.acquireTokenByDeviceCode, _.correlationId);
        try {
          let $ = await this.createAuthority(_.authority, _.correlationId, void 0, H.azureCloudOptions),
            K = await this.buildOauthClientConfiguration($, _.correlationId, "", q),
            O = new ggH(K);
          return this.logger.verbose("Device code client created", _.correlationId), await O.acquireToken(_);
        } catch ($) {
          if ($ instanceof l4) $.setCorrelationId(_.correlationId);
          throw (q.cacheFailedRequest($), $);
        }
      }
      async acquireTokenInteractive(H) {
        let _ = H.correlationId || this.cryptoProvider.createNewGuid();
        this.logger.trace("acquireTokenInteractive called", _);
        let { openBrowser: q, successTemplate: $, errorTemplate: K, windowHandle: O, loopbackClient: T, ...z } = H;
        if (this.nativeBrokerPlugin) {
          let j = {
            ...z,
            clientId: this.config.auth.clientId,
            scopes: H.scopes || d0,
            redirectUri: H.redirectUri || "",
            authority: H.authority || this.config.auth.authority,
            correlationId: _,
            extraParameters: {
              ...z.extraQueryParameters,
              ...z.tokenQueryParameters,
              [H5H.X_CLIENT_EXTRA_SKU]: this.skus,
            },
            accountId: z.account?.nativeAccountId,
          };
          return this.nativeBrokerPlugin.acquireTokenInteractive(j, O);
        }
        if (H.redirectUri) {
          if (!this.config.broker.nativeBrokerPlugin) throw Gw.createRedirectUriNotSupportedError();
          H.redirectUri = "";
        }
        let { verifier: A, challenge: f } = await this.cryptoProvider.generatePkceCodes(),
          w = T || new UJ6(),
          Y = {},
          D = null;
        try {
          let j = w
              .listenForAuthCode($, K)
              .then((W) => {
                Y = W;
              })
              .catch((W) => {
                D = W;
              }),
            M = await this.waitForRedirectUri(w),
            J = {
              ...z,
              correlationId: _,
              scopes: H.scopes || d0,
              redirectUri: M,
              responseMode: IB.QUERY,
              codeChallenge: f,
              codeChallengeMethod: Z2_.S256,
            },
            P = await this.getAuthCodeUrl(J);
          if ((await q(P), await j, D)) throw D;
          if (Y.error) throw new AZ(Y.error, Y.error_description, Y.suberror);
          else if (!Y.code) throw Gw.createNoAuthCodeInResponseError();
          let X = Y.client_info,
            R = { code: Y.code, codeVerifier: A, clientInfo: X || d6.EMPTY_STRING, ...J };
          return await this.acquireTokenByCode(R);
        } finally {
          w.closeServer();
        }
      }
      async acquireTokenSilent(H) {
        let _ = H.correlationId || this.cryptoProvider.createNewGuid();
        if ((this.logger.trace("acquireTokenSilent called", _), this.nativeBrokerPlugin)) {
          let q = {
            ...H,
            clientId: this.config.auth.clientId,
            scopes: H.scopes || d0,
            redirectUri: H.redirectUri || "",
            authority: H.authority || this.config.auth.authority,
            correlationId: _,
            extraParameters: { ...H.tokenQueryParameters, [H5H.X_CLIENT_EXTRA_SKU]: this.skus },
            accountId: H.account.nativeAccountId,
            forceRefresh: H.forceRefresh || !1,
          };
          return this.nativeBrokerPlugin.acquireTokenSilent(q);
        }
        if (H.redirectUri) {
          if (!this.config.broker.nativeBrokerPlugin) throw Gw.createRedirectUriNotSupportedError();
          H.redirectUri = "";
        }
        return super.acquireTokenSilent(H);
      }
      async signOut(H) {
        if (this.nativeBrokerPlugin && H.account.nativeAccountId) {
          let _ = {
            clientId: this.config.auth.clientId,
            accountId: H.account.nativeAccountId,
            correlationId: H.correlationId || this.cryptoProvider.createNewGuid(),
          };
          await this.nativeBrokerPlugin.signOut(_);
        }
        await this.getTokenCache().removeAccount(H.account, H.correlationId);
      }
      async getAllAccounts() {
        if (this.nativeBrokerPlugin) {
          let H = this.cryptoProvider.createNewGuid();
          return this.nativeBrokerPlugin.getAllAccounts(this.config.auth.clientId, H);
        }
        return this.getTokenCache().getAllAccounts();
      }
      async waitForRedirectUri(H) {
        return new Promise((_, q) => {
          let $ = 0,
            K = setInterval(() => {
              if (Dj_.TIMEOUT_MS / Dj_.INTERVAL_MS < $) {
                clearInterval(K), q(Gw.createLoopbackServerTimeoutError());
                return;
              }
              try {
                let O = H.getRedirectUri();
                clearInterval(K), _(O);
                return;
              } catch (O) {
                if (O instanceof l4 && O.errorCode === Wj.noLoopbackServerExists.code) {
                  $++;
                  return;
                }
                clearInterval(K), q(O);
                return;
              }
            }, Dj_.INTERVAL_MS);
        });
      }
    };
