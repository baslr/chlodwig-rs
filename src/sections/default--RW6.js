    HQ();
    ibH();
    WW6();
    NZq();
    HQ();
    (hZq = u(CJ_(), 1)), (WT4 = new Set(["/v1/messages", "/v1/messages?beta=true"]));
    GW6 = class GW6 extends AO {
      constructor({
        baseURL: H = bJ_("ANTHROPIC_VERTEX_BASE_URL"),
        region: _ = bJ_("CLOUD_ML_REGION") ?? null,
        projectId: q = bJ_("ANTHROPIC_VERTEX_PROJECT_ID") ?? null,
        ...$
      } = {}) {
        if (!_)
          throw Error(
            "No region was given. The client should be instantiated with the `region` option or the `CLOUD_ML_REGION` environment variable should be set.",
          );
        super({
          baseURL:
            H ||
            (_ === "global" ? "https://aiplatform.googleapis.com/v1" : `https://${_}-aiplatform.googleapis.com/v1`),
          ...$,
        });
        if (
          ((this.messages = GT4(this)),
          (this.beta = RT4(this)),
          (this.region = _),
          (this.projectId = q),
          (this.accessToken = $.accessToken ?? null),
          $.authClient && $.googleAuth)
        )
          throw Error("You cannot provide both `authClient` and `googleAuth`. Please provide only one of them.");
        else if ($.authClient) this._authClientPromise = Promise.resolve($.authClient);
        else
          (this._auth =
            $.googleAuth ?? new hZq.GoogleAuth({ scopes: "https://www.googleapis.com/auth/cloud-platform" })),
            (this._authClientPromise = this._auth.getClient());
      }
      validateHeaders() {}
      async prepareOptions(H) {
        let _ = await this._authClientPromise,
          q = await _.getRequestHeaders(),
          $ = _.projectId ?? q["x-goog-user-project"];
        if (!this.projectId && $) this.projectId = $;
        H.headers = vZq([q, H.headers]);
      }
      async buildRequest(H) {
        if (IJ_(H.body)) H.body = { ...H.body };
        if (IJ_(H.body)) {
          if (!H.body.anthropic_version) H.body.anthropic_version = XT4;
        }
        if (WT4.has(H.path) && H.method === "post") {
          if (!this.projectId)
            throw Error(
              "No projectId was given and it could not be resolved from credentials. The client should be instantiated with the `projectId` option or the `ANTHROPIC_VERTEX_PROJECT_ID` environment variable should be set.",
            );
          if (!IJ_(H.body)) throw Error("Expected request body to be an object for post /v1/messages");
          let _ = H.body.model;
          H.body.model = void 0;
          let $ = (H.body.stream ?? !1) ? "streamRawPredict" : "rawPredict";
          H.path = `/projects/${this.projectId}/locations/${this.region}/publishers/anthropic/models/${_}:${$}`;
        }
        if (
          H.path === "/v1/messages/count_tokens" ||
          (H.path == "/v1/messages/count_tokens?beta=true" && H.method === "post")
        ) {
          if (!this.projectId)
            throw Error(
              "No projectId was given and it could not be resolved from credentials. The client should be instantiated with the `projectId` option or the `ANTHROPIC_VERTEX_PROJECT_ID` environment variable should be set.",
            );
          H.path = `/projects/${this.projectId}/locations/${this.region}/publishers/anthropic/models/count-tokens:rawPredict`;
        }
        return super.buildRequest(H);
      }
    };
