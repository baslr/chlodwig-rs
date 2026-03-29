    xp();
    Kh();
    ls();
    g2H = class g2H extends OY {
      retrieve(H, _ = {}, q) {
        let { betas: $ } = _ ?? {};
        return this._client.get(Kw`/v1/models/${H}`, {
          ...q,
          headers: W4([{ ...($?.toString() != null ? { "anthropic-beta": $?.toString() } : void 0) }, q?.headers]),
        });
      }
      list(H = {}, _) {
        let { betas: q, ...$ } = H ?? {};
        return this._client.getAPIList("/v1/models", KI, {
          query: $,
          ..._,
          headers: W4([{ ...(q?.toString() != null ? { "anthropic-beta": q?.toString() } : void 0) }, _?.headers]),
        });
      }
    };
