    u7();
    t6();
    L_();
    Ad();
    rH_();
    JZ();
    cJ();
    H_();
    g_();
    lK();
    F_();
    Ec_();
    un1 = $6(
      async (H, _, q, $) => {
        let K = H.filter((O) => sX(O));
        if (K.length === 0) return 0;
        try {
          let O = await Y9H(K, _, { activeAgents: q, allAgents: q }, $);
          if (O === 0) return null;
          return Math.max(0, O - yc_);
        } catch {
          return null;
        }
      },
      (H) =>
        H.filter((_) => sX(_))
          .map((_) => _.name)
          .join(","),
    );
    xn1 = ["haiku"];
