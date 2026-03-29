    lfq();
    mD_();
    rfq();
    HQ();
    HQ();
    ibH();
    rD6 = class rD6 extends OI {
      constructor({
        baseURL: H = BD_("ANTHROPIC_FOUNDRY_BASE_URL"),
        apiKey: _ = BD_("ANTHROPIC_FOUNDRY_API_KEY"),
        resource: q = BD_("ANTHROPIC_FOUNDRY_RESOURCE"),
        azureADTokenProvider: $,
        dangerouslyAllowBrowser: K,
        ...O
      } = {}) {
        if (typeof $ === "function") K = !0;
        if (!$ && !_)
          throw new q7(
            "Missing credentials. Please pass one of `apiKey` and `azureTokenProvider`, or set the `ANTHROPIC_FOUNDRY_API_KEY` environment variable.",
          );
        if ($ && _)
          throw new q7(
            "The `apiKey` and `azureADTokenProvider` arguments are mutually exclusive; only one can be passed at a time.",
          );
        if (!H) {
          if (!q)
            throw new q7(
              "Must provide one of the `baseURL` or `resource` arguments, or the `ANTHROPIC_FOUNDRY_RESOURCE` environment variable",
            );
          H = `https://${q}.services.ai.azure.com/anthropic/`;
        } else if (q) throw new q7("baseURL and resource are mutually exclusive");
        super({ apiKey: $ ?? _, baseURL: H, ...O, ...(K !== void 0 ? { dangerouslyAllowBrowser: K } : {}) });
        (this.resource = null), (this.messages = vs$(this)), (this.beta = Ns$(this)), (this.models = void 0);
      }
      async authHeaders() {
        if (typeof this._options.apiKey === "function") {
          let H;
          try {
            H = await this._options.apiKey();
          } catch (_) {
            if (_ instanceof q7) throw _;
            throw new q7(`Failed to get token from azureADTokenProvider: ${_.message}`, { cause: _ });
          }
          if (typeof H !== "string" || !H)
            throw new q7(`Expected azureADTokenProvider function argument to return a string but it returned ${H}`);
          return nD6([{ Authorization: `Bearer ${H}` }]);
        }
        if (typeof this._options.apiKey === "string") return nD6([{ "x-api-key": this.apiKey }]);
        return;
      }
      validateHeaders() {
        return;
      }
    };
