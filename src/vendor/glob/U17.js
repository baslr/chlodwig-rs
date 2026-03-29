  var U17 = d((us3, F17) => {
    var m17 = jiH(),
      {
        CHAR_ASTERISK: xb6,
        CHAR_AT: cl4,
        CHAR_BACKWARD_SLASH: MiH,
        CHAR_COMMA: Fl4,
        CHAR_DOT: mb6,
        CHAR_EXCLAMATION_MARK: pb6,
        CHAR_FORWARD_SLASH: c17,
        CHAR_LEFT_CURLY_BRACE: Bb6,
        CHAR_LEFT_PARENTHESES: gb6,
        CHAR_LEFT_SQUARE_BRACKET: Ul4,
        CHAR_PLUS: Ql4,
        CHAR_QUESTION_MARK: p17,
        CHAR_RIGHT_CURLY_BRACE: ll4,
        CHAR_RIGHT_PARENTHESES: B17,
        CHAR_RIGHT_SQUARE_BRACKET: il4,
      } = DiH(),
      g17 = (H) => {
        return H === c17 || H === MiH;
      },
      d17 = (H) => {
        if (H.isPrefix !== !0) H.depth = H.isGlobstar ? 1 / 0 : 1;
      },
      nl4 = (H, _) => {
        let q = _ || {},
          $ = H.length - 1,
          K = q.parts === !0 || q.scanToEnd === !0,
          O = [],
          T = [],
          z = [],
          A = H,
          f = -1,
          w = 0,
          Y = 0,
          D = !1,
          j = !1,
          M = !1,
          J = !1,
          P = !1,
          X = !1,
          R = !1,
          W = !1,
          Z = !1,
          k = !1,
          v = 0,
          y,
          E,
          S = { value: "", depth: 0, isGlob: !1 },
          x = () => f >= $,
          I = () => A.charCodeAt(f + 1),
          B = () => {
            return (y = E), A.charCodeAt(++f);
          };
        while (f < $) {
          E = B();
          let U;
          if (E === MiH) {
            if (((R = S.backslashes = !0), (E = B()), E === Bb6)) X = !0;
            continue;
          }
          if (X === !0 || E === Bb6) {
            v++;
            while (x() !== !0 && (E = B())) {
              if (E === MiH) {
                (R = S.backslashes = !0), B();
                continue;
              }
              if (E === Bb6) {
                v++;
                continue;
              }
              if (X !== !0 && E === mb6 && (E = B()) === mb6) {
                if (((D = S.isBrace = !0), (M = S.isGlob = !0), (k = !0), K === !0)) continue;
                break;
              }
              if (X !== !0 && E === Fl4) {
                if (((D = S.isBrace = !0), (M = S.isGlob = !0), (k = !0), K === !0)) continue;
                break;
              }
              if (E === ll4) {
                if ((v--, v === 0)) {
                  (X = !1), (D = S.isBrace = !0), (k = !0);
                  break;
                }
              }
            }
            if (K === !0) continue;
            break;
          }
          if (E === c17) {
            if ((O.push(f), T.push(S), (S = { value: "", depth: 0, isGlob: !1 }), k === !0)) continue;
            if (y === mb6 && f === w + 1) {
              w += 2;
              continue;
            }
            Y = f + 1;
            continue;
          }
          if (q.noext !== !0) {
            if ((E === Ql4 || E === cl4 || E === xb6 || E === p17 || E === pb6) === !0 && I() === gb6) {
              if (((M = S.isGlob = !0), (J = S.isExtglob = !0), (k = !0), E === pb6 && f === w)) Z = !0;
              if (K === !0) {
                while (x() !== !0 && (E = B())) {
                  if (E === MiH) {
                    (R = S.backslashes = !0), (E = B());
                    continue;
                  }
                  if (E === B17) {
                    (M = S.isGlob = !0), (k = !0);
                    break;
                  }
                }
                continue;
              }
              break;
            }
          }
          if (E === xb6) {
            if (y === xb6) P = S.isGlobstar = !0;
            if (((M = S.isGlob = !0), (k = !0), K === !0)) continue;
            break;
          }
          if (E === p17) {
            if (((M = S.isGlob = !0), (k = !0), K === !0)) continue;
            break;
          }
          if (E === Ul4) {
            while (x() !== !0 && (U = B())) {
              if (U === MiH) {
                (R = S.backslashes = !0), B();
                continue;
              }
              if (U === il4) {
                (j = S.isBracket = !0), (M = S.isGlob = !0), (k = !0);
                break;
              }
            }
            if (K === !0) continue;
            break;
          }
          if (q.nonegate !== !0 && E === pb6 && f === w) {
            (W = S.negated = !0), w++;
            continue;
          }
          if (q.noparen !== !0 && E === gb6) {
            if (((M = S.isGlob = !0), K === !0)) {
              while (x() !== !0 && (E = B())) {
                if (E === gb6) {
                  (R = S.backslashes = !0), (E = B());
                  continue;
                }
                if (E === B17) {
                  k = !0;
                  break;
                }
              }
              continue;
            }
            break;
          }
          if (M === !0) {
            if (((k = !0), K === !0)) continue;
            break;
          }
        }
        if (q.noext === !0) (J = !1), (M = !1);
        let p = A,
          C = "",
          g = "";
        if (w > 0) (C = A.slice(0, w)), (A = A.slice(w)), (Y -= w);
        if (p && M === !0 && Y > 0) (p = A.slice(0, Y)), (g = A.slice(Y));
        else if (M === !0) (p = ""), (g = A);
        else p = A;
        if (p && p !== "" && p !== "/" && p !== A) {
          if (g17(p.charCodeAt(p.length - 1))) p = p.slice(0, -1);
        }
        if (q.unescape === !0) {
          if (g) g = m17.removeBackslashes(g);
          if (p && R === !0) p = m17.removeBackslashes(p);
        }
        let c = {
          prefix: C,
          input: H,
          start: w,
          base: p,
          glob: g,
          isBrace: D,
          isBracket: j,
          isGlob: M,
          isExtglob: J,
          isGlobstar: P,
          negated: W,
          negatedExtglob: Z,
        };
        if (q.tokens === !0) {
          if (((c.maxDepth = 0), !g17(E))) T.push(S);
          c.tokens = T;
        }
        if (q.parts === !0 || q.tokens === !0) {
          let U;
          for (let i = 0; i < O.length; i++) {
            let _H = U ? U + 1 : w,
              HH = O[i],
              e = H.slice(_H, HH);
            if (q.tokens) {
              if (i === 0 && w !== 0) (T[i].isPrefix = !0), (T[i].value = C);
              else T[i].value = e;
              d17(T[i]), (c.maxDepth += T[i].depth);
            }
            if (i !== 0 || e !== "") z.push(e);
            U = HH;
          }
          if (U && U + 1 < H.length) {
            let i = H.slice(U + 1);
            if ((z.push(i), q.tokens))
              (T[T.length - 1].value = i), d17(T[T.length - 1]), (c.maxDepth += T[T.length - 1].depth);
          }
          (c.slashes = O), (c.parts = z);
        }
        return c;
      };
    F17.exports = nl4;
  });
