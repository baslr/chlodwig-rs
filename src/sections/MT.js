    bT9();
    uT9();
    mT9();
    cT9();
    UT9();
    lT9();
    eT9();
    Zz9();
    vz9();
    yz9();
    Bz9();
    tz9();
    qA9();
    zA9();
    UA9();
    Df9();
    Jf9();
    If9();
    xf9();
    Tw9();
    Zw9();
    uw9();
    Qw9();
    iw9();
    rw9();
    HY9();
    qY9();
    KY9();
    sY9();
    qD9();
    KD9();
    qj9();
    wJ9();
    DJ9();
    MJ9();
    kJ9();
    SJ9();
    EX9();
    x78();
    aX9();
    tX9();
    OW9();
    fW9();
    H09();
    q09();
    K09();
    T09();
    A09();
    Y09();
    J09();
    W09();
    k09();
    y09();
    n09();
    s09();
    KG9();
    wG9();
    PG9();
    gG9();
    UG9();
    oG9();
    LZ9();
    hZ9();
    bZ9();
    xZ9();
    FZ9();
    QZ9();
    rZ9();
    aZ9();
    sZ9();
    _L9();
    $L9();
    OL9();
    RL9();
    IL9();
    mL9();
    BL9();
    N_();
    h_();
    H_();
    Lr();
    MR();
    hQH();
    q__();
    u7();
    W8();
    lK();
    UL9();
    K$8();
    fk9();
    Mk9();
    Gk9();
    Lk9();
    Ek9();
    D$8();
    WeH();
    mk9();
    pk9();
    Qk9();
    yv9();
    Sv9();
    Cv9();
    Iv9();
    _z();
    (hN9 = (mv9(), Rq(xv9)).default),
      (VN9 = (lv9(), Rq(Qv9)).default),
      (EN9 = (fN9(), Rq(AN9)).default),
      (IN9 = (XN9(), Rq(PN9)).default),
      (zwK = {
        type: "prompt",
        name: "insights",
        description: "Generate a report analyzing your Claude Code sessions",
        contentLength: 0,
        progressMessage: "analyzing your sessions",
        source: "builtin",
        async getPromptForCommand(H, _) {
          let q = (await Promise.resolve().then(() => (vN9(), kN9))).default;
          if (q.type !== "prompt") throw Error("unreachable");
          return q.getPromptForCommand(H, _);
        },
      }),
      (Ahz = [
        xT9,
        $D9,
        O09,
        hz9,
        _A9,
        uf9,
        FT9,
        QT9,
        nw9,
        ...(CN9 ? [CN9] : []),
        UZ9,
        nZ9,
        oZ9,
        ...(xN9 ? [xN9] : []),
        ...(uN9 ? [uN9] : []),
        eZ9,
        HL9,
        YJ9,
        sX9,
        i98,
        _09,
        qL9,
        KL9,
        FL9,
        Vv9,
        Ev9,
        bv9,
        OwK,
        IT9,
      ].filter(Boolean)),
      (d$8 = $6(() => [
        CT9,
        pL9,
        ZZ9,
        rG9,
        z68,
        bL9,
        AU_,
        C68,
        B68,
        FA9,
        u68,
        sz9,
        wf9,
        Yf9,
        CU_,
        bf9,
        Ow9,
        Uk9,
        A8_,
        $G9,
        k98,
        cZ9,
        L88,
        Uw9,
        lw9,
        N88,
        aY9,
        _D9,
        _j9,
        Rw9,
        oq8,
        jk9,
        Zk9,
        Sk9,
        NZ9,
        jJ9,
        H78,
        CZ9,
        VJ9,
        SX9,
        m78,
        KW9,
        hv9,
        AW9,
        j$8,
        e98,
        Wk9,
        O98,
        D68,
        fl_,
        lX9,
        uZ9,
        $09,
        z09,
        el_,
        g7H,
        Ls7,
        xk9,
        K98,
        zwK,
        T98,
        ...(IN9 ? [IN9] : []),
        ...(pN9 ? [pN9] : []),
        ...(NN9 ? [NN9] : []),
        ...(hN9 ? [hN9] : []),
        ...(yN9 ? [yN9] : []),
        ...(VN9 ? [VN9] : []),
        ...(SN9 ? [SN9] : []),
        ...(EN9 ? [EN9] : []),
        L09,
        h09,
        i09,
        M98,
        JG9,
        BG9,
        Ak9,
        GL9,
        ...(!rHH() ? [$Y9, _Y9()] : []),
        fG9,
        ...(mN9 ? [mN9] : []),
        eW9,
        ...(bN9 ? [bN9] : []),
        ...[],
      ])),
      (wF = $6(() => new Set(d$8().flatMap((H) => [H.name, ...(H.aliases ?? [])]))));
    dN9 = $6(async (H) => {
      let [{ skillDirCommands: _, pluginSkills: q, bundledSkills: $, builtinPluginSkills: K }, O, T] =
        await Promise.all([AwK(H), RwH(), BN9 ? BN9(H) : Promise.resolve([])]);
      return [...$, ...K, ..._, ...T, ...O, ...q, ...d$8()];
    });
    (iE = $6(async (H) => {
      return (await xW(H)).filter(
        (q) =>
          q.type === "prompt" &&
          !q.disableModelInvocation &&
          q.source !== "builtin" &&
          (q.loadedFrom === "bundled" ||
            q.loadedFrom === "skills" ||
            q.loadedFrom === "commands_DEPRECATED" ||
            q.hasUserSpecifiedDescription ||
            q.whenToUse),
      );
    })),
      (MTH = $6(async (H) => {
        try {
          return (await xW(H)).filter(
            (q) =>
              q.type === "prompt" &&
              q.source !== "builtin" &&
              (q.hasUserSpecifiedDescription || q.whenToUse) &&
              (q.loadedFrom === "skills" ||
                q.loadedFrom === "plugin" ||
                q.loadedFrom === "bundled" ||
                q.disableModelInvocation),
          );
        } catch (_) {
          return AH(p6(_)), N("Returning empty skills array due to load failure"), [];
        }
      })),
      (c$8 = new Set([m78, A8_, AU_, L88, O98, C68, T98, CU_, K98, u68, z68, D68, M98, N88, j$8, e98, oq8])),
      (fwK = new Set([B68, AU_, CU_, i98, H78, k98].filter((H) => H !== null)));
