    xp();
    Kh();
    ls();
    vbH = class vbH extends OY {
      retrieve(H, _ = {}, q) {
        let { betas: $ } = _ ?? {};
        return this._client.get(Kw`/v1/models/${H}?beta=true`, {
          ...q,
          headers: W4([{ ...($?.toString() != null ? { "anthropic-beta": $?.toString() } : void 0) }, q?.headers]),
        });
      }
      list(H = {}, _) {
        let { betas: q, ...$ } = H ?? {};
        return this._client.getAPIList("/v1/models?beta=true", KI, {
          query: $,
          ..._,
          headers: W4([{ ...(q?.toString() != null ? { "anthropic-beta": q?.toString() } : void 0) }, _?.headers]),
        });
      }
    };
