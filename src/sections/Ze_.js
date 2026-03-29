    xp();
    Kh();
    C2H();
    ls();
    pbH = class pbH extends OY {
      create(H, _ = {}, q) {
        let { betas: $, ...K } = _ ?? {};
        return this._client.post(
          Kw`/v1/skills/${H}/versions?beta=true`,
          E2H(
            {
              body: K,
              ...q,
              headers: W4([{ "anthropic-beta": [...($ ?? []), "skills-2025-10-02"].toString() }, q?.headers]),
            },
            this._client,
          ),
        );
      }
      retrieve(H, _, q) {
        let { skill_id: $, betas: K } = _;
        return this._client.get(Kw`/v1/skills/${$}/versions/${H}?beta=true`, {
          ...q,
          headers: W4([{ "anthropic-beta": [...(K ?? []), "skills-2025-10-02"].toString() }, q?.headers]),
        });
      }
      list(H, _ = {}, q) {
        let { betas: $, ...K } = _ ?? {};
        return this._client.getAPIList(Kw`/v1/skills/${H}/versions?beta=true`, GbH, {
          query: K,
          ...q,
          headers: W4([{ "anthropic-beta": [...($ ?? []), "skills-2025-10-02"].toString() }, q?.headers]),
        });
      }
      delete(H, _, q) {
        let { skill_id: $, betas: K } = _;
        return this._client.delete(Kw`/v1/skills/${$}/versions/${H}?beta=true`, {
          ...q,
          headers: W4([{ "anthropic-beta": [...(K ?? []), "skills-2025-10-02"].toString() }, q?.headers]),
        });
      }
    };
