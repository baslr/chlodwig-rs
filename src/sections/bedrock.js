    u7();
    t6();
    k_();
    ae();
    s$();
    W8();
    cJ();
    g_();
    H7();
    pJ_();
    lK();
    Q6();
    gZq = [re];
    (yW6 = $6((H) => {
      let _ = [],
        q = M3(H).includes("haiku"),
        $ = N8(),
        K = fu();
      if (!q) _.push(dY_);
      if (U8()) _.push(Oj);
      if (Ch(H)) _.push(re);
      if (!lH(process.env.DISABLE_INTERLEAVED_THINKING) && BZq(H)) _.push(qKq);
      if (K && BZq(H) && !o8() && v8().showThinkingSummaries !== !0 && B_("tengu_quiet_hollow", !1)) _.push(FY_);
      OKq;
      let O = lH(process.env.USE_API_CONTEXT_MANAGEMENT) && !1,
        T = bT4(H);
      if (fu() && (O || T)) _.push(cY_);
      let z = p3("tengu_tool_pear");
      if (K && m5H(H) && z) _.push(oe);
      if ($ === "vertex" && CT4(H)) _.push(TY6);
      if ($ === "foundry") _.push(TY6);
      if (K) _.push(vpH);
      if (process.env.ANTHROPIC_BETAS)
        _.push(
          ...process.env.ANTHROPIC_BETAS.split(",")
            .map((A) => A.trim())
            .filter(Boolean),
        );
      return _;
    })),
      (ch = $6((H) => {
        let _ = yW6(H);
        if (N8() === "bedrock") return _.filter((q) => !wY6.has(q));
        return _;
      })),
      (VW6 = $6((H) => {
        return yW6(H).filter((q) => wY6.has(q));
      }));
