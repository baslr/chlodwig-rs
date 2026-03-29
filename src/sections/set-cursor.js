    G4();
    k_();
    U5();
    q9();
    o_H();
    iH();
    mj();
    JzH();
    uJ9();
    ln();
    y6();
    g_();
    Ek();
    gJ9();
    q8();
    QJ9();
    PC();
    IP9();
    Cv();
    UP9();
    Ey();
    ho6();
    iP9();
    XqH();
    eP9();
    (qX9 = u(aH(), 1)),
      (T4 = u(PH(), 1)),
      (rT = u(PH(), 1)),
      (f1K = T4.memo(function (_) {
        let q = qX9.c(3),
          { agentDefinitions: $ } = _,
          K;
        if (q[0] === Symbol.for("react.memo_cache_sentinel")) (K = T4.createElement(bP9, null)), (q[0] = K);
        else K = q[0];
        let O;
        if (q[1] !== $)
          (O = T4.createElement(
            GW,
            null,
            T4.createElement(
              m,
              { flexDirection: "column", gap: 1 },
              K,
              T4.createElement(T4.Suspense, { fallback: null }, T4.createElement(tP9, { agentDefinitions: $ })),
            ),
          )),
            (q[1] = $),
            (q[2] = O);
        else O = q[2];
        return O;
      })),
      (HX9 = (MI(), Rq(RQ)).BRIEF_TOOL_NAME);
    qYH = T4.memo(W1K, (H, _) => {
      let q = Object.keys(H);
      for (let $ of q) {
        if (
          $ === "onOpenRateLimitOptions" ||
          $ === "scrollRef" ||
          $ === "onStickyPromptChange" ||
          $ === "setCursor" ||
          $ === "cursorNavRef" ||
          $ === "jumpRef" ||
          $ === "onSearchMatchesChange" ||
          $ === "scanElement" ||
          $ === "setPositions"
        )
          continue;
        if (H[$] !== _[$]) {
          if ($ === "streamingToolUses") {
            let K = H.streamingToolUses,
              O = _.streamingToolUses;
            if (K.length === O.length && K.every((T, z) => T.contentBlock === O[z]?.contentBlock)) continue;
          }
          if ($ === "inProgressToolUseIDs") {
            if (G1K(H.inProgressToolUseIDs, _.inProgressToolUseIDs)) continue;
          }
          if ($ === "unseenDivider") {
            let K = H.unseenDivider,
              O = _.unseenDivider;
            if (K?.firstUnseenUuid === O?.firstUnseenUuid && K?.count === O?.count) continue;
          }
          if ($ === "tools") {
            let K = H.tools,
              O = _.tools;
            if (K.length === O.length && K.every((T, z) => T.name === O[z]?.name)) continue;
          }
          return !1;
        }
      }
      return !0;
    });
