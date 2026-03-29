    q9();
    J4();
    iH();
    K7();
    ($68 = u(aH(), 1)), (JL = u(PH(), 1)), (K68 = u(PH(), 1));
    wt1 = K68.memo(function (_) {
      let q = $68.c(36),
        { item: $, maxColumnWidth: K, isSelected: O } = _,
        T = K8().columns;
      if (ft1($.id)) {
        let S;
        if (q[0] !== $.id) (S = At1($.id)), (q[0] = $.id), (q[1] = S);
        else S = q[1];
        let x = S,
          I = O ? "suggestion" : void 0,
          B = !O,
          p = $.id.startsWith("file-"),
          C = $.id.startsWith("mcp-resource-"),
          g = $.description ? 3 : 0,
          c;
        if (p) {
          let HH;
          if (q[2] !== $.description)
            (HH = $.description ? Math.min(20, J6($.description)) : 0), (q[2] = $.description), (q[3] = HH);
          else HH = q[3];
          let e = HH,
            qH = T - 2 - 4 - g - e,
            r;
          if (q[4] !== $.displayText || q[5] !== qH)
            (r = Xh_($.displayText, qH)), (q[4] = $.displayText), (q[5] = qH), (q[6] = r);
          else r = q[6];
          c = r;
        } else if (C) {
          let HH;
          if (q[7] !== $.displayText) (HH = F7($.displayText, 30)), (q[7] = $.displayText), (q[8] = HH);
          else HH = q[8];
          c = HH;
        } else c = $.displayText;
        let U = T - 2 - J6(c) - g - 4,
          i;
        if ($.description) {
          let HH = Math.max(0, U),
            e;
          if (q[9] !== $.description || q[10] !== HH)
            (e = F7($.description, HH)), (q[9] = $.description), (q[10] = HH), (q[11] = e);
          else e = q[11];
          i = `${x} ${c} \u2013 ${e}`;
        } else i = `${x} ${c}`;
        let _H;
        if (q[12] !== B || q[13] !== i || q[14] !== I)
          (_H = JL.createElement(L, { color: I, dimColor: B, wrap: "truncate" }, i)),
            (q[12] = B),
            (q[13] = i),
            (q[14] = I),
            (q[15] = _H);
        else _H = q[15];
        return _H;
      }
      let A = Math.floor(T * 0.4),
        f = Math.min(K ?? J6($.displayText) + 5, A),
        w = $.color || (O ? "suggestion" : void 0),
        Y = !O,
        D = $.displayText;
      if (J6(D) > f - 2) {
        let S = f - 2,
          x;
        if (q[16] !== D || q[17] !== S) (x = F7(D, S)), (q[16] = D), (q[17] = S), (q[18] = x);
        else x = q[18];
        D = x;
      }
      let j = D + " ".repeat(Math.max(0, f - J6(D))),
        M = $.tag ? `[${$.tag}] ` : "",
        J = J6(M),
        P = Math.max(0, T - f - J - 4),
        X;
      if (q[19] !== P || q[20] !== $.description)
        (X = $.description ? F7($.description, P) : ""), (q[19] = P), (q[20] = $.description), (q[21] = X);
      else X = q[21];
      let R = X,
        W;
      if (q[22] !== j || q[23] !== Y || q[24] !== w)
        (W = JL.createElement(L, { color: w, dimColor: Y }, j)), (q[22] = j), (q[23] = Y), (q[24] = w), (q[25] = W);
      else W = q[25];
      let Z;
      if (q[26] !== M) (Z = M ? JL.createElement(L, { dimColor: !0 }, M) : null), (q[26] = M), (q[27] = Z);
      else Z = q[27];
      let k = O ? "suggestion" : void 0,
        v = !O,
        y;
      if (q[28] !== k || q[29] !== v || q[30] !== R)
        (y = JL.createElement(L, { color: k, dimColor: v }, R)), (q[28] = k), (q[29] = v), (q[30] = R), (q[31] = y);
      else y = q[31];
      let E;
      if (q[32] !== W || q[33] !== Z || q[34] !== y)
        (E = JL.createElement(L, { wrap: "truncate" }, W, Z, y)), (q[32] = W), (q[33] = Z), (q[34] = y), (q[35] = E);
      else E = q[35];
      return E;
    });
    bxT = K68.memo(I__);
