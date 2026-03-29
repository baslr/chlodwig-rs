    u7();
    W8();
    g_();
    N_();
    HZ();
    J_q = $6(async function () {
      let [H, { ListInferenceProfilesCommand: _ }] = await Promise.all([
          X_q(),
          Promise.resolve().then(() => (xf_(), uf_)),
        ]),
        q = [],
        $;
      try {
        do {
          let K = new _({ ...($ && { nextToken: $ }), typeEquals: "SYSTEM_DEFINED" }),
            O = await H.send(K);
          if (O.inferenceProfileSummaries) q.push(...O.inferenceProfileSummaries);
          $ = O.nextToken;
        } while ($);
        return q
          .filter((K) => K.inferenceProfileId?.includes("anthropic"))
          .map((K) => K.inferenceProfileId)
          .filter(Boolean);
      } catch (K) {
        throw (AH(K), K);
      }
    });
    Rw_ = $6(async function (H) {
      try {
        let [_, { GetInferenceProfileCommand: q }] = await Promise.all([
            X_q(),
            Promise.resolve().then(() => (xf_(), uf_)),
          ]),
          $ = new q({ inferenceProfileIdentifier: H }),
          K = await _.send($);
        if (!K.models || K.models.length === 0) return null;
        let O = K.models[0];
        if (!O?.modelArn) return null;
        let T = O.modelArn.lastIndexOf("/");
        return T >= 0 ? O.modelArn.substring(T + 1) : O.modelArn;
      } catch (_) {
        return AH(_), null;
      }
    });
    Ai$ = ["us", "eu", "apac", "global"];
