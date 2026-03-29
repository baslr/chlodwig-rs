    nY8();
    e2H();
    k_();
    oY8();
    y6();
    H_();
    h_();
    Rj();
    N_();
    F_();
    d5H();
    $i();
    (w3H = new Map()), (HE = new Map()), (CWH = new Set()), (FG6 = new Set()), (lX_ = new Set());
    (QG6 = $6(() => {
      if (!Oi()) return null;
      let H = QIq(),
        _ = "https://api.anthropic.com/",
        $ = bO() || k2H() || o8() ? ZD() : { headers: {}, error: "trust not established" },
        K = !$.error;
      lG6 = K;
      let O = new h4_({
        apiHost: _,
        clientKey: rY8,
        attributes: H,
        remoteEval: !0,
        cacheKeyAttributes: ["id", "organizationUUID"],
        ...($.error ? {} : { apiHostRequestHeaders: $.headers }),
        ...{},
      });
      if (((Ki = O), !K)) return { client: O, initialized: Promise.resolve() };
      let T = O.init({ timeout: 5000 })
        .then(async (z) => {
          if (Ki !== O) return;
          let A = await cIq(O);
          if (Ki !== O) return;
          if (A) {
            for (let f of CWH) GcH(f);
            CWH.clear(), FIq(), WcH();
          }
        })
        .catch((z) => {});
      return (
        (McH = () => Ki?.destroy()),
        (JcH = () => Ki?.destroy()),
        process.on("beforeExit", McH),
        process.on("exit", JcH),
        { client: O, initialized: T }
      );
    })),
      (Ti = $6(async () => {
        let H = QG6();
        if (!H) return null;
        if (!lG6) {
          if (bO() || k2H() || o8()) {
            if (!ZD().error) {
              if ((RcH(), (H = QG6()), !H)) return null;
            }
          }
        }
        return await H.initialized, nIq(), H.client;
      }));
