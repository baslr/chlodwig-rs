    xp();
    Kh();
    We_();
    is();
    ls();
    lbH = class lbH extends OY {
      create(H, _) {
        return this._client.post("/v1/messages/batches", { body: H, ..._ });
      }
      retrieve(H, _) {
        return this._client.get(Kw`/v1/messages/batches/${H}`, _);
      }
      list(H = {}, _) {
        return this._client.getAPIList("/v1/messages/batches", KI, { query: H, ..._ });
      }
      delete(H, _) {
        return this._client.delete(Kw`/v1/messages/batches/${H}`, _);
      }
      cancel(H, _) {
        return this._client.post(Kw`/v1/messages/batches/${H}/cancel`, _);
      }
      async results(H, _) {
        let q = await this.retrieve(H);
        if (!q.results_url)
          throw new q7(`No batch \`results_url\`; Has it finished processing? ${q.processing_status} - ${q.id}`);
        return this._client
          .get(q.results_url, {
            ..._,
            headers: W4([{ Accept: "application/binary" }, _?.headers]),
            stream: !0,
            __binaryResponse: !0,
          })
          ._thenUnwrap(($, K) => m2H.fromResponse(K.response, K.controller));
      }
    };
