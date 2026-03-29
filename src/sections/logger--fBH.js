    X2q();
    AHH();
    EB();
    SM();
    hB();
    vX();
    Kz();
    bB = class bB extends G2_ {
      constructor(H) {
        var _, q;
        let $ = `azsdk-js-identity/${gD_}`,
          K = (
            (_ = H === null || H === void 0 ? void 0 : H.userAgentOptions) === null || _ === void 0
              ? void 0
              : _.userAgentPrefix
          )
            ? `${H.userAgentOptions.userAgentPrefix} ${$}`
            : `${$}`,
          O = Ce$(H);
        if (!O.startsWith("https:")) throw Error("The authorityHost address must use the 'https' protocol.");
        super(
          Object.assign(
            Object.assign(
              { requestContentType: "application/json; charset=utf-8", retryOptions: { maxRetries: 3 } },
              H,
            ),
            { userAgentOptions: { userAgentPrefix: K }, baseUri: O },
          ),
        );
        if (
          ((this.allowInsecureConnection = !1),
          (this.authorityHost = O),
          (this.abortControllers = new Map()),
          (this.allowLoggingAccountIdentifiers =
            (q = H === null || H === void 0 ? void 0 : H.loggingOptions) === null || q === void 0
              ? void 0
              : q.allowLoggingAccountIdentifiers),
          (this.tokenCredentialOptions = Object.assign({}, H)),
          H === null || H === void 0 ? void 0 : H.allowInsecureConnection)
        )
          this.allowInsecureConnection = H.allowInsecureConnection;
      }
      async sendTokenRequest(H) {
        wk.info(`IdentityClient: sending token request to [${H.url}]`);
        let _ = await this.sendRequest(H);
        if (_.bodyAsText && (_.status === 200 || _.status === 201)) {
          let q = JSON.parse(_.bodyAsText);
          if (!q.access_token) return null;
          this.logIdentifiers(_);
          let $ = {
            accessToken: {
              token: q.access_token,
              expiresOnTimestamp: R2q(q),
              refreshAfterTimestamp: Z2q(q),
              tokenType: "Bearer",
            },
            refreshToken: q.refresh_token,
          };
          return (
            wk.info(`IdentityClient: [${H.url}] token acquired, expires on ${$.accessToken.expiresOnTimestamp}`), $
          );
        } else {
          let q = new cI(_.status, _.bodyAsText);
          throw (
            (wk.warning(
              `IdentityClient: authentication error. HTTP status: ${_.status}, ${q.errorResponse.errorDescription}`,
            ),
            q)
          );
        }
      }
      async refreshAccessToken(H, _, q, $, K, O = {}) {
        if ($ === void 0) return null;
        wk.info(`IdentityClient: refreshing access token with client ID: ${_}, scopes: ${q} started`);
        let T = { grant_type: "refresh_token", client_id: _, refresh_token: $, scope: q };
        if (K !== void 0) T.client_secret = K;
        let z = new URLSearchParams(T);
        return J3.withSpan("IdentityClient.refreshAccessToken", O, async (A) => {
          try {
            let f = W2q(H),
              w = bh({
                url: `${this.authorityHost}/${H}/${f}`,
                method: "POST",
                body: z.toString(),
                abortSignal: O.abortSignal,
                headers: Ml({ Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" }),
                tracingOptions: A.tracingOptions,
              }),
              Y = await this.sendTokenRequest(w);
            return wk.info(`IdentityClient: refreshed token for client ID: ${_}`), Y;
          } catch (f) {
            if (f.name === UpH && f.errorResponse.error === "interaction_required")
              return wk.info(`IdentityClient: interaction required for client ID: ${_}`), null;
            else throw (wk.warning(`IdentityClient: failed refreshing token for client ID: ${_}: ${f}`), f);
          }
        });
      }
      generateAbortSignal(H) {
        let _ = new AbortController(),
          q = this.abortControllers.get(H) || [];
        q.push(_), this.abortControllers.set(H, q);
        let $ = _.signal.onabort;
        return (
          (_.signal.onabort = (...K) => {
            if ((this.abortControllers.set(H, void 0), $)) $.apply(_.signal, K);
          }),
          _.signal
        );
      }
      abortRequests(H) {
        let _ = H || ABH,
          q = [...(this.abortControllers.get(_) || []), ...(this.abortControllers.get(ABH) || [])];
        if (!q.length) return;
        for (let $ of q) $.abort();
        this.abortControllers.set(_, void 0);
      }
      getCorrelationId(H) {
        var _;
        let q =
          (_ = H === null || H === void 0 ? void 0 : H.body) === null || _ === void 0
            ? void 0
            : _.split("&")
                .map(($) => $.split("="))
                .find(([$]) => $ === "client-request-id");
        return q && q.length ? q[1] || ABH : ABH;
      }
      async sendGetRequestAsync(H, _) {
        let q = bh({
            url: H,
            method: "GET",
            body: _ === null || _ === void 0 ? void 0 : _.body,
            allowInsecureConnection: this.allowInsecureConnection,
            headers: Ml(_ === null || _ === void 0 ? void 0 : _.headers),
            abortSignal: this.generateAbortSignal(ABH),
          }),
          $ = await this.sendRequest(q);
        return (
          this.logIdentifiers($),
          { body: $.bodyAsText ? JSON.parse($.bodyAsText) : void 0, headers: $.headers.toJSON(), status: $.status }
        );
      }
      async sendPostRequestAsync(H, _) {
        let q = bh({
            url: H,
            method: "POST",
            body: _ === null || _ === void 0 ? void 0 : _.body,
            headers: Ml(_ === null || _ === void 0 ? void 0 : _.headers),
            allowInsecureConnection: this.allowInsecureConnection,
            abortSignal: this.generateAbortSignal(this.getCorrelationId(_)),
          }),
          $ = await this.sendRequest(q);
        return (
          this.logIdentifiers($),
          { body: $.bodyAsText ? JSON.parse($.bodyAsText) : void 0, headers: $.headers.toJSON(), status: $.status }
        );
      }
      getTokenCredentialOptions() {
        return this.tokenCredentialOptions;
      }
      logIdentifiers(H) {
        if (!this.allowLoggingAccountIdentifiers || !H.bodyAsText) return;
        let _ = "No User Principal Name available";
        try {
          let $ = (H.parsedBody || JSON.parse(H.bodyAsText)).access_token;
          if (!$) return;
          let K = $.split(".")[1],
            { appid: O, upn: T, tid: z, oid: A } = JSON.parse(Buffer.from(K, "base64").toString("utf8"));
          wk.info(
            `[Authenticated account] Client ID: ${O}. Tenant ID: ${z}. User Principal Name: ${T || _}. Object ID (user): ${A}`,
          );
        } catch (q) {
          wk.warning(
            "allowLoggingAccountIdentifiers was set, but we couldn't log the account information. Error:",
            q.message,
          );
        }
      }
    };
