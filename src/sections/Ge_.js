    xp();
    Kh();
    We_();
    is();
    ls();
    mbH = class mbH extends OY {
      create(H, _) {
        let { betas: q, ...$ } = H;
        return this._client.post("/v1/messages/batches?beta=true", {
          body: $,
          ..._,
          headers: W4([{ "anthropic-beta": [...(q ?? []), "message-batches-2024-09-24"].toString() }, _?.headers]),
        });
      }
      retrieve(H, _ = {}, q) {
        let { betas: $ } = _ ?? {};
        return this._client.get(Kw`/v1/messages/batches/${H}?beta=true`, {
          ...q,
          headers: W4([{ "anthropic-beta": [...($ ?? []), "message-batches-2024-09-24"].toString() }, q?.headers]),
        });
      }
      list(H = {}, _) {
        let { betas: q, ...$ } = H ?? {};
        return this._client.getAPIList("/v1/messages/batches?beta=true", KI, {
          query: $,
          ..._,
          headers: W4([{ "anthropic-beta": [...(q ?? []), "message-batches-2024-09-24"].toString() }, _?.headers]),
        });
      }
      delete(H, _ = {}, q) {
        let { betas: $ } = _ ?? {};
        return this._client.delete(Kw`/v1/messages/batches/${H}?beta=true`, {
          ...q,
          headers: W4([{ "anthropic-beta": [...($ ?? []), "message-batches-2024-09-24"].toString() }, q?.headers]),
        });
      }
      cancel(H, _ = {}, q) {
        let { betas: $ } = _ ?? {};
        return this._client.post(Kw`/v1/messages/batches/${H}/cancel?beta=true`, {
          ...q,
          headers: W4([{ "anthropic-beta": [...($ ?? []), "message-batches-2024-09-24"].toString() }, q?.headers]),
        });
      }
      async results(H, _ = {}, q) {
        let $ = await this.retrieve(H);
        if (!$.results_url)
          throw new q7(`No batch \`results_url\`; Has it finished processing? ${$.processing_status} - ${$.id}`);
        let { betas: K } = _ ?? {};
        return this._client
          .get($.results_url, {
            ...q,
            headers: W4([
              {
                "anthropic-beta": [...(K ?? []), "message-batches-2024-09-24"].toString(),
                Accept: "application/binary",
              },
              q?.headers,
            ]),
            stream: !0,
            __binaryResponse: !0,
          })
          ._thenUnwrap((O, T) => m2H.fromResponse(T.response, T.controller));
      }
    };
