  var IX6 = d((gXH) => {
    Object.defineProperty(gXH, "__esModule", { value: !0 });
    gXH.Impersonated = gXH.IMPERSONATED_ACCOUNT_TYPE = void 0;
    var CRq = u5H(),
      U34 = _u(),
      Q34 = dHH();
    gXH.IMPERSONATED_ACCOUNT_TYPE = "impersonated_service_account";
    class XdH extends CRq.OAuth2Client {
      constructor(H = {}) {
        var _, q, $, K, O, T;
        super(H);
        if (
          ((this.credentials = { expiry_date: 1, refresh_token: "impersonated-placeholder" }),
          (this.sourceClient = (_ = H.sourceClient) !== null && _ !== void 0 ? _ : new CRq.OAuth2Client()),
          (this.targetPrincipal = (q = H.targetPrincipal) !== null && q !== void 0 ? q : ""),
          (this.delegates = ($ = H.delegates) !== null && $ !== void 0 ? $ : []),
          (this.targetScopes = (K = H.targetScopes) !== null && K !== void 0 ? K : []),
          (this.lifetime = (O = H.lifetime) !== null && O !== void 0 ? O : 3600),
          !(0, Q34.originalOrCamelOptions)(H).get("universe_domain"))
        )
          this.universeDomain = this.sourceClient.universeDomain;
        else if (this.sourceClient.universeDomain !== this.universeDomain)
          throw RangeError(
            `Universe domain ${this.sourceClient.universeDomain} in source credentials does not match ${this.universeDomain} universe domain set for impersonated credentials.`,
          );
        this.endpoint = (T = H.endpoint) !== null && T !== void 0 ? T : `https://iamcredentials.${this.universeDomain}`;
      }
      async sign(H) {
        await this.sourceClient.getAccessToken();
        let _ = `projects/-/serviceAccounts/${this.targetPrincipal}`,
          q = `${this.endpoint}/v1/${_}:signBlob`,
          $ = { delegates: this.delegates, payload: Buffer.from(H).toString("base64") };
        return (await this.sourceClient.request({ ...XdH.RETRY_CONFIG, url: q, data: $, method: "POST" })).data;
      }
      getTargetPrincipal() {
        return this.targetPrincipal;
      }
      async refreshToken() {
        var H, _, q, $, K, O;
        try {
          await this.sourceClient.getAccessToken();
          let T = "projects/-/serviceAccounts/" + this.targetPrincipal,
            z = `${this.endpoint}/v1/${T}:generateAccessToken`,
            A = { delegates: this.delegates, scope: this.targetScopes, lifetime: this.lifetime + "s" },
            f = await this.sourceClient.request({ ...XdH.RETRY_CONFIG, url: z, data: A, method: "POST" }),
            w = f.data;
          return (
            (this.credentials.access_token = w.accessToken),
            (this.credentials.expiry_date = Date.parse(w.expireTime)),
            { tokens: this.credentials, res: f }
          );
        } catch (T) {
          if (!(T instanceof Error)) throw T;
          let z = 0,
            A = "";
          if (T instanceof U34.GaxiosError)
            (z =
              (q =
                (_ =
                  (H = T === null || T === void 0 ? void 0 : T.response) === null || H === void 0 ? void 0 : H.data) ===
                  null || _ === void 0
                  ? void 0
                  : _.error) === null || q === void 0
                ? void 0
                : q.status),
              (A =
                (O =
                  (K =
                    ($ = T === null || T === void 0 ? void 0 : T.response) === null || $ === void 0
                      ? void 0
                      : $.data) === null || K === void 0
                    ? void 0
                    : K.error) === null || O === void 0
                  ? void 0
                  : O.message);
          if (z && A) throw ((T.message = `${z}: unable to impersonate: ${A}`), T);
          else throw ((T.message = `unable to impersonate: ${T}`), T);
        }
      }
      async fetchIdToken(H, _) {
        var q, $;
        await this.sourceClient.getAccessToken();
        let K = `projects/-/serviceAccounts/${this.targetPrincipal}`,
          O = `${this.endpoint}/v1/${K}:generateIdToken`,
          T = {
            delegates: this.delegates,
            audience: H,
            includeEmail: (q = _ === null || _ === void 0 ? void 0 : _.includeEmail) !== null && q !== void 0 ? q : !0,
            useEmailAzp: ($ = _ === null || _ === void 0 ? void 0 : _.includeEmail) !== null && $ !== void 0 ? $ : !0,
          };
        return (await this.sourceClient.request({ ...XdH.RETRY_CONFIG, url: O, data: T, method: "POST" })).data.token;
      }
    }
    gXH.Impersonated = XdH;
  });
