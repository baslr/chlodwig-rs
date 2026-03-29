    xp();
    Kh();
    LbH();
    C2H();
    ls();
    kbH = class kbH extends OY {
      list(H = {}, _) {
        let { betas: q, ...$ } = H ?? {};
        return this._client.getAPIList("/v1/files", KI, {
          query: $,
          ..._,
          headers: W4([{ "anthropic-beta": [...(q ?? []), "files-api-2025-04-14"].toString() }, _?.headers]),
        });
      }
      delete(H, _ = {}, q) {
        let { betas: $ } = _ ?? {};
        return this._client.delete(Kw`/v1/files/${H}`, {
          ...q,
          headers: W4([{ "anthropic-beta": [...($ ?? []), "files-api-2025-04-14"].toString() }, q?.headers]),
        });
      }
      download(H, _ = {}, q) {
        let { betas: $ } = _ ?? {};
        return this._client.get(Kw`/v1/files/${H}/content`, {
          ...q,
          headers: W4([
            { "anthropic-beta": [...($ ?? []), "files-api-2025-04-14"].toString(), Accept: "application/binary" },
            q?.headers,
          ]),
          __binaryResponse: !0,
        });
      }
      retrieveMetadata(H, _ = {}, q) {
        let { betas: $ } = _ ?? {};
        return this._client.get(Kw`/v1/files/${H}`, {
          ...q,
          headers: W4([{ "anthropic-beta": [...($ ?? []), "files-api-2025-04-14"].toString() }, q?.headers]),
        });
      }
      upload(H, _) {
        let { betas: q, ...$ } = H;
        return this._client.post(
          "/v1/files",
          E2H(
            {
              body: $,
              ..._,
              headers: W4([
                { "anthropic-beta": [...(q ?? []), "files-api-2025-04-14"].toString() },
                yf8($.file),
                _?.headers,
              ]),
            },
            this._client,
          ),
        );
      }
    };
