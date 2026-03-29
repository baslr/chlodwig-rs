    HQ();
    ibH();
    czq();
    mfq();
    dpH();
    Bfq();
    cfq();
    HQ();
    Gs$ = new Set(["/v1/complete", "/v1/messages", "/v1/messages?beta=true"]);
    UD6 = class UD6 extends AO {
      constructor({
        awsRegion: H = dD6("AWS_REGION") ?? "us-east-1",
        baseURL: _ = dD6("ANTHROPIC_BEDROCK_BASE_URL") ?? `https://bedrock-runtime.${H}.amazonaws.com`,
        awsSecretKey: q = null,
        awsAccessKey: $ = null,
        awsSessionToken: K = null,
        providerChainResolver: O = null,
        ...T
      } = {}) {
        super({ baseURL: _, ...T });
        (this.skipAuth = !1),
          (this.messages = Rs$(this)),
          (this.completions = new as(this)),
          (this.beta = Zs$(this)),
          (this.awsSecretKey = q),
          (this.awsAccessKey = $),
          (this.awsRegion = H),
          (this.awsSessionToken = K),
          (this.skipAuth = T.skipAuth ?? !1),
          (this.providerChainResolver = O);
      }
      validateHeaders() {}
      async prepareRequest(H, { url: _, options: q }) {
        if (this.skipAuth) return;
        let $ = this.awsRegion;
        if (!$)
          throw Error(
            "Expected `awsRegion` option to be passed to the client or the `AWS_REGION` environment variable to be present",
          );
        let K = await dzq(H, {
          url: _,
          regionName: $,
          awsAccessKey: this.awsAccessKey,
          awsSecretKey: this.awsSecretKey,
          awsSessionToken: this.awsSessionToken,
          fetchOptions: this.fetchOptions,
          providerChainResolver: this.providerChainResolver,
        });
        H.headers = cD6([K, H.headers]).values;
      }
      async buildRequest(H) {
        if (((H.__streamClass = xD_), ID_(H.body))) H.body = { ...H.body };
        if (ID_(H.body)) {
          if (!H.body.anthropic_version) H.body.anthropic_version = Ws$;
          if (H.headers && !H.body.anthropic_beta) {
            let _ = cD6([H.headers]).values.get("anthropic-beta");
            if (_ != null) H.body.anthropic_beta = _.split(",");
          }
        }
        if (Gs$.has(H.path) && H.method === "post") {
          if (!ID_(H.body)) throw Error("Expected request body to be an object for post /v1/messages");
          let _ = H.body.model;
          H.body.model = void 0;
          let q = H.body.stream;
          if (((H.body.stream = void 0), q)) H.path = FD6`/model/${_}/invoke-with-response-stream`;
          else H.path = FD6`/model/${_}/invoke`;
        }
        return super.buildRequest(H);
      }
    };
