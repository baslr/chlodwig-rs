    YC();
    iH();
    Ek();
    o0H();
    HV_();
    WG7();
    (RG7 = u(aH(), 1)), (AW = u(PH(), 1)), (ZG7 = u(PH(), 1)), (GG7 = new WeakMap());
    Fd = ZG7.memo(function (_) {
      let q = RG7.c(26),
        { patch: $, dim: K, filePath: O, firstLine: T, fileContent: z, width: A, skipHighlighting: f } = _,
        w = f === void 0 ? !1 : f,
        [Y] = Aq(),
        j = mw().syntaxHighlightingDisabled ?? !1,
        M = Math.max(1, Math.floor(A)),
        J = !1,
        P;
      if (
        q[0] !== K ||
        q[1] !== z ||
        q[2] !== O ||
        q[3] !== T ||
        q[4] !== $ ||
        q[5] !== M ||
        q[6] !== w ||
        q[7] !== j ||
        q[8] !== Y
      )
        (P = w || j ? null : qT1($, T, O, z ?? null, Y, M, K, !1)),
          (q[0] = K),
          (q[1] = z),
          (q[2] = O),
          (q[3] = T),
          (q[4] = $),
          (q[5] = M),
          (q[6] = w),
          (q[7] = j),
          (q[8] = Y),
          (q[9] = P);
      else P = q[9];
      let X = P;
      if (!X) {
        let y;
        if (q[10] !== K || q[11] !== $ || q[12] !== A)
          (y = AW.createElement(m, null, AW.createElement(XG7, { patch: $, dim: K, width: A }))),
            (q[10] = K),
            (q[11] = $),
            (q[12] = A),
            (q[13] = y);
        else y = q[13];
        return y;
      }
      let { lines: R, gutterWidth: W, gutters: Z, contents: k } = X;
      if (W > 0 && Z && k) {
        let y;
        if (q[14] !== W || q[15] !== Z)
          (y = AW.createElement(pM, { fromLeftEdge: !0 }, AW.createElement(qGH, { lines: Z, width: W }))),
            (q[14] = W),
            (q[15] = Z),
            (q[16] = y);
        else y = q[16];
        let E = M - W,
          S;
        if (q[17] !== k || q[18] !== E)
          (S = AW.createElement(qGH, { lines: k, width: E })), (q[17] = k), (q[18] = E), (q[19] = S);
        else S = q[19];
        let x;
        if (q[20] !== y || q[21] !== S)
          (x = AW.createElement(m, { flexDirection: "row" }, y, S)), (q[20] = y), (q[21] = S), (q[22] = x);
        else x = q[22];
        return x;
      }
      let v;
      if (q[23] !== R || q[24] !== M)
        (v = AW.createElement(m, null, AW.createElement(qGH, { lines: R, width: M }))),
          (q[23] = R),
          (q[24] = M),
          (q[25] = v);
      else v = q[25];
      return v;
    });
