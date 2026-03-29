    Ze_();
    Ze_();
    xp();
    Kh();
    C2H();
    ls();
    p2H = class p2H extends OY {
      constructor() {
        super(...arguments);
        this.versions = new pbH(this._client);
      }
      create(H = {}, _) {
        let { betas: q, ...$ } = H ?? {};
        return this._client.post(
          "/v1/skills?beta=true",
          E2H(
            {
              body: $,
              ..._,
              headers: W4([{ "anthropic-beta": [...(q ?? []), "skills-2025-10-02"].toString() }, _?.headers]),
            },
            this._client,
            !1,
          ),
        );
      }
      retrieve(H, _ = {}, q) {
        let { betas: $ } = _ ?? {};
        return this._client.get(Kw`/v1/skills/${H}?beta=true`, {
          ...q,
          headers: W4([{ "anthropic-beta": [...($ ?? []), "skills-2025-10-02"].toString() }, q?.headers]),
        });
      }
      list(H = {}, _) {
        let { betas: q, ...$ } = H ?? {};
        return this._client.getAPIList("/v1/skills?beta=true", GbH, {
          query: $,
          ..._,
          headers: W4([{ "anthropic-beta": [...(q ?? []), "skills-2025-10-02"].toString() }, _?.headers]),
        });
      }
      delete(H, _ = {}, q) {
        let { betas: $ } = _ ?? {};
        return this._client.delete(Kw`/v1/skills/${H}?beta=true`, {
          ...q,
          headers: W4([{ "anthropic-beta": [...($ ?? []), "skills-2025-10-02"].toString() }, q?.headers]),
        });
      }
    };
    p2H.Versions = pbH;
