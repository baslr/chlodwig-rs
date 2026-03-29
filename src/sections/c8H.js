    YC();
    iH();
    Ek();
    o0H();
    n07();
    HV_();
    (_p6 = u(aH(), 1)),
      (Uf = u(PH(), 1)),
      (d8H = u(PH(), 1)),
      (tZ = d8H.memo(function (_) {
        let q = _p6.c(21),
          { code: $, filePath: K, width: O, dim: T } = _,
          z = T === void 0 ? !1 : T,
          A = d8H.useRef(null),
          [f, w] = d8H.useState(O || lO1),
          [Y] = Aq(),
          j = mw().syntaxHighlightingDisabled ?? !1,
          M;
        H: {
          if (j) {
            M = null;
            break H;
          }
          let y;
          if (q[0] === Symbol.for("react.memo_cache_sentinel")) (y = MG7()), (q[0] = y);
          else y = q[0];
          let E = y;
          if (!E) {
            M = null;
            break H;
          }
          let S;
          if (q[1] !== $ || q[2] !== K) (S = new E($, K)), (q[1] = $), (q[2] = K), (q[3] = S);
          else S = q[3];
          M = S;
        }
        let J = M,
          P,
          X;
        if (q[4] !== O)
          (P = () => {
            if (!O && A.current) {
              let { width: y } = OGH(A.current);
              if (y > 0) w(y - 2);
            }
          }),
            (X = [O]),
            (q[4] = O),
            (q[5] = P),
            (q[6] = X);
        else (P = q[5]), (X = q[6]);
        d8H.useEffect(P, X);
        let R;
        H: {
          if (J === null) {
            R = null;
            break H;
          }
          let y;
          if (q[7] !== J || q[8] !== z || q[9] !== f || q[10] !== Y)
            (y = J.render(Y, f, z)), (q[7] = J), (q[8] = z), (q[9] = f), (q[10] = Y), (q[11] = y);
          else y = q[11];
          R = y;
        }
        let W = R,
          Z;
        H: {
          Z = 0;
          break H;
        }
        let k = Z,
          v;
        if (q[14] !== $ || q[15] !== z || q[16] !== K || q[17] !== k || q[18] !== W || q[19] !== j)
          (v = Uf.createElement(
            m,
            { ref: A },
            W
              ? Uf.createElement(
                  m,
                  { flexDirection: "column" },
                  W.map((y, E) =>
                    k > 0
                      ? Uf.createElement(iO1, { key: E, line: y, gutterWidth: k })
                      : Uf.createElement(L, { key: E }, Uf.createElement(V$, null, y)),
                  ),
                )
              : Uf.createElement(i07, { code: $, filePath: K, dim: z, skipColoring: j }),
          )),
            (q[14] = $),
            (q[15] = z),
            (q[16] = K),
            (q[17] = k),
            (q[18] = W),
            (q[19] = j),
            (q[20] = v);
        else v = q[20];
        return v;
      }));
