  var i17 = d((xs3, l17) => {
    var Nv_ = DiH(),
      Yd = jiH(),
      {
        MAX_LENGTH: hv_,
        POSIX_REGEX_SOURCE: rl4,
        REGEX_NON_SPECIAL_CHARS: ol4,
        REGEX_SPECIAL_CHARS_BACKREF: al4,
        REPLACEMENTS: Q17,
      } = Nv_,
      sl4 = (H, _) => {
        if (typeof _.expandRange === "function") return _.expandRange(...H, _);
        H.sort();
        let q = `[${H.join("-")}]`;
        try {
          new RegExp(q);
        } catch ($) {
          return H.map((K) => Yd.escapeRegex(K)).join("..");
        }
        return q;
      },
      tRH = (H, _) => {
        return `Missing ${H}: "${_}" - use "\\\\${_}" to match literal characters`;
      },
      db6 = (H, _) => {
        if (typeof H !== "string") throw TypeError("Expected a string");
        H = Q17[H] || H;
        let q = { ..._ },
          $ = typeof q.maxLength === "number" ? Math.min(hv_, q.maxLength) : hv_,
          K = H.length;
        if (K > $) throw SyntaxError(`Input length: ${K}, exceeds maximum allowed length: ${$}`);
        let O = { type: "bos", value: "", output: q.prepend || "" },
          T = [O],
          z = q.capture ? "" : "?:",
          A = Nv_.globChars(q.windows),
          f = Nv_.extglobChars(A),
          {
            DOT_LITERAL: w,
            PLUS_LITERAL: Y,
            SLASH_LITERAL: D,
            ONE_CHAR: j,
            DOTS_SLASH: M,
            NO_DOT: J,
            NO_DOT_SLASH: P,
            NO_DOTS_SLASH: X,
            QMARK: R,
            QMARK_NO_DOT: W,
            STAR: Z,
            START_ANCHOR: k,
          } = A,
          v = (KH) => {
            return `(${z}(?:(?!${k}${KH.dot ? M : w}).)*?)`;
          },
          y = q.dot ? "" : J,
          E = q.dot ? R : W,
          S = q.bash === !0 ? v(q) : Z;
        if (q.capture) S = `(${S})`;
        if (typeof q.noext === "boolean") q.noextglob = q.noext;
        let x = {
          input: H,
          index: -1,
          start: 0,
          dot: q.dot === !0,
          consumed: "",
          output: "",
          prefix: "",
          backtrack: !1,
          negated: !1,
          brackets: 0,
          braces: 0,
          parens: 0,
          quotes: 0,
          globstar: !1,
          tokens: T,
        };
        (H = Yd.removePrefix(H, x)), (K = H.length);
        let I = [],
          B = [],
          p = [],
          C = O,
          g,
          c = () => x.index === K - 1,
          U = (x.peek = (KH = 1) => H[x.index + KH]),
          i = (x.advance = () => H[++x.index] || ""),
          _H = () => H.slice(x.index + 1),
          HH = (KH = "", n = 0) => {
            (x.consumed += KH), (x.index += n);
          },
          e = (KH) => {
            (x.output += KH.output != null ? KH.output : KH.value), HH(KH.value);
          },
          qH = () => {
            let KH = 1;
            while (U() === "!" && (U(2) !== "(" || U(3) === "?")) i(), x.start++, KH++;
            if (KH % 2 === 0) return !1;
            return (x.negated = !0), x.start++, !0;
          },
          r = (KH) => {
            x[KH]++, p.push(KH);
          },
          $H = (KH) => {
            x[KH]--, p.pop();
          },
          DH = (KH) => {
            if (C.type === "globstar") {
              let n = x.braces > 0 && (KH.type === "comma" || KH.type === "brace"),
                l = KH.extglob === !0 || (I.length && (KH.type === "pipe" || KH.type === "paren"));
              if (KH.type !== "slash" && KH.type !== "paren" && !n && !l)
                (x.output = x.output.slice(0, -C.output.length)),
                  (C.type = "star"),
                  (C.value = "*"),
                  (C.output = S),
                  (x.output += C.output);
            }
            if (I.length && KH.type !== "paren") I[I.length - 1].inner += KH.value;
            if (KH.value || KH.output) e(KH);
            if (C && C.type === "text" && KH.type === "text") {
              (C.output = (C.output || C.value) + KH.value), (C.value += KH.value);
              return;
            }
            (KH.prev = C), T.push(KH), (C = KH);
          },
          fH = (KH, n) => {
            let l = { ...f[n], conditions: 1, inner: "" };
            (l.prev = C), (l.parens = x.parens), (l.output = x.output);
            let a = (q.capture ? "(" : "") + l.open;
            r("parens"),
              DH({ type: KH, value: n, output: x.output ? "" : j }),
              DH({ type: "paren", extglob: !0, value: i(), output: a }),
              I.push(l);
          },
          vH = (KH) => {
            let n = KH.close + (q.capture ? ")" : ""),
              l;
            if (KH.type === "negate") {
              let a = S;
              if (KH.inner && KH.inner.length > 1 && KH.inner.includes("/")) a = v(q);
              if (a !== S || c() || /^\)+$/.test(_H())) n = KH.close = `)$))${a}`;
              if (KH.inner.includes("*") && (l = _H()) && /^\.[^\\/.]+$/.test(l)) {
                let t = db6(l, { ..._, fastpaths: !1 }).output;
                n = KH.close = `)${t})${a})`;
              }
              if (KH.prev.type === "bos") x.negatedExtglob = !0;
            }
            DH({ type: "paren", extglob: !0, value: g, output: n }), $H("parens");
          };
        if (q.fastpaths !== !1 && !/(^[*!]|[/()[\]{}"])/.test(H)) {
          let KH = !1,
            n = H.replace(al4, (l, a, t, s, OH, XH) => {
              if (s === "\\") return (KH = !0), l;
              if (s === "?") {
                if (a) return a + s + (OH ? R.repeat(OH.length) : "");
                if (XH === 0) return E + (OH ? R.repeat(OH.length) : "");
                return R.repeat(t.length);
              }
              if (s === ".") return w.repeat(t.length);
              if (s === "*") {
                if (a) return a + s + (OH ? S : "");
                return S;
              }
              return a ? l : `\\${l}`;
            });
          if (KH === !0)
            if (q.unescape === !0) n = n.replace(/\\/g, "");
            else
              n = n.replace(/\\+/g, (l) => {
                return l.length % 2 === 0 ? "\\\\" : l ? "\\" : "";
              });
          if (n === H && q.contains === !0) return (x.output = H), x;
          return (x.output = Yd.wrapOutput(n, x, _)), x;
        }
        while (!c()) {
          if (((g = i()), g === "\x00")) continue;
          if (g === "\\") {
            let l = U();
            if (l === "/" && q.bash !== !0) continue;
            if (l === "." || l === ";") continue;
            if (!l) {
              (g += "\\"), DH({ type: "text", value: g });
              continue;
            }
            let a = /^\\+/.exec(_H()),
              t = 0;
            if (a && a[0].length > 2) {
              if (((t = a[0].length), (x.index += t), t % 2 !== 0)) g += "\\";
            }
            if (q.unescape === !0) g = i();
            else g += i();
            if (x.brackets === 0) {
              DH({ type: "text", value: g });
              continue;
            }
          }
          if (x.brackets > 0 && (g !== "]" || C.value === "[" || C.value === "[^")) {
            if (q.posix !== !1 && g === ":") {
              let l = C.value.slice(1);
              if (l.includes("[")) {
                if (((C.posix = !0), l.includes(":"))) {
                  let a = C.value.lastIndexOf("["),
                    t = C.value.slice(0, a),
                    s = C.value.slice(a + 2),
                    OH = rl4[s];
                  if (OH) {
                    if (((C.value = t + OH), (x.backtrack = !0), i(), !O.output && T.indexOf(C) === 1)) O.output = j;
                    continue;
                  }
                }
              }
            }
            if ((g === "[" && U() !== ":") || (g === "-" && U() === "]")) g = `\\${g}`;
            if (g === "]" && (C.value === "[" || C.value === "[^")) g = `\\${g}`;
            if (q.posix === !0 && g === "!" && C.value === "[") g = "^";
            (C.value += g), e({ value: g });
            continue;
          }
          if (x.quotes === 1 && g !== '"') {
            (g = Yd.escapeRegex(g)), (C.value += g), e({ value: g });
            continue;
          }
          if (g === '"') {
            if (((x.quotes = x.quotes === 1 ? 0 : 1), q.keepQuotes === !0)) DH({ type: "text", value: g });
            continue;
          }
          if (g === "(") {
            r("parens"), DH({ type: "paren", value: g });
            continue;
          }
          if (g === ")") {
            if (x.parens === 0 && q.strictBrackets === !0) throw SyntaxError(tRH("opening", "("));
            let l = I[I.length - 1];
            if (l && x.parens === l.parens + 1) {
              vH(I.pop());
              continue;
            }
            DH({ type: "paren", value: g, output: x.parens ? ")" : "\\)" }), $H("parens");
            continue;
          }
          if (g === "[") {
            if (q.nobracket === !0 || !_H().includes("]")) {
              if (q.nobracket !== !0 && q.strictBrackets === !0) throw SyntaxError(tRH("closing", "]"));
              g = `\\${g}`;
            } else r("brackets");
            DH({ type: "bracket", value: g });
            continue;
          }
          if (g === "]") {
            if (q.nobracket === !0 || (C && C.type === "bracket" && C.value.length === 1)) {
              DH({ type: "text", value: g, output: `\\${g}` });
              continue;
            }
            if (x.brackets === 0) {
              if (q.strictBrackets === !0) throw SyntaxError(tRH("opening", "["));
              DH({ type: "text", value: g, output: `\\${g}` });
              continue;
            }
            $H("brackets");
            let l = C.value.slice(1);
            if (C.posix !== !0 && l[0] === "^" && !l.includes("/")) g = `/${g}`;
            if (((C.value += g), e({ value: g }), q.literalBrackets === !1 || Yd.hasRegexChars(l))) continue;
            let a = Yd.escapeRegex(C.value);
            if (((x.output = x.output.slice(0, -C.value.length)), q.literalBrackets === !0)) {
              (x.output += a), (C.value = a);
              continue;
            }
            (C.value = `(${z}${a}|${C.value})`), (x.output += C.value);
            continue;
          }
          if (g === "{" && q.nobrace !== !0) {
            r("braces");
            let l = {
              type: "brace",
              value: g,
              output: "(",
              outputIndex: x.output.length,
              tokensIndex: x.tokens.length,
            };
            B.push(l), DH(l);
            continue;
          }
          if (g === "}") {
            let l = B[B.length - 1];
            if (q.nobrace === !0 || !l) {
              DH({ type: "text", value: g, output: g });
              continue;
            }
            let a = ")";
            if (l.dots === !0) {
              let t = T.slice(),
                s = [];
              for (let OH = t.length - 1; OH >= 0; OH--) {
                if ((T.pop(), t[OH].type === "brace")) break;
                if (t[OH].type !== "dots") s.unshift(t[OH].value);
              }
              (a = sl4(s, q)), (x.backtrack = !0);
            }
            if (l.comma !== !0 && l.dots !== !0) {
              let t = x.output.slice(0, l.outputIndex),
                s = x.tokens.slice(l.tokensIndex);
              (l.value = l.output = "\\{"), (g = a = "\\}"), (x.output = t);
              for (let OH of s) x.output += OH.output || OH.value;
            }
            DH({ type: "brace", value: g, output: a }), $H("braces"), B.pop();
            continue;
          }
          if (g === "|") {
            if (I.length > 0) I[I.length - 1].conditions++;
            DH({ type: "text", value: g });
            continue;
          }
          if (g === ",") {
            let l = g,
              a = B[B.length - 1];
            if (a && p[p.length - 1] === "braces") (a.comma = !0), (l = "|");
            DH({ type: "comma", value: g, output: l });
            continue;
          }
          if (g === "/") {
            if (C.type === "dot" && x.index === x.start + 1) {
              (x.start = x.index + 1), (x.consumed = ""), (x.output = ""), T.pop(), (C = O);
              continue;
            }
            DH({ type: "slash", value: g, output: D });
            continue;
          }
          if (g === ".") {
            if (x.braces > 0 && C.type === "dot") {
              if (C.value === ".") C.output = w;
              let l = B[B.length - 1];
              (C.type = "dots"), (C.output += g), (C.value += g), (l.dots = !0);
              continue;
            }
            if (x.braces + x.parens === 0 && C.type !== "bos" && C.type !== "slash") {
              DH({ type: "text", value: g, output: w });
              continue;
            }
            DH({ type: "dot", value: g, output: w });
            continue;
          }
          if (g === "?") {
            if (!(C && C.value === "(") && q.noextglob !== !0 && U() === "(" && U(2) !== "?") {
              fH("qmark", g);
              continue;
            }
            if (C && C.type === "paren") {
              let a = U(),
                t = g;
              if ((C.value === "(" && !/[!=<:]/.test(a)) || (a === "<" && !/<([!=]|\w+>)/.test(_H()))) t = `\\${g}`;
              DH({ type: "text", value: g, output: t });
              continue;
            }
            if (q.dot !== !0 && (C.type === "slash" || C.type === "bos")) {
              DH({ type: "qmark", value: g, output: W });
              continue;
            }
            DH({ type: "qmark", value: g, output: R });
            continue;
          }
          if (g === "!") {
            if (q.noextglob !== !0 && U() === "(") {
              if (U(2) !== "?" || !/[!=<:]/.test(U(3))) {
                fH("negate", g);
                continue;
              }
            }
            if (q.nonegate !== !0 && x.index === 0) {
              qH();
              continue;
            }
          }
          if (g === "+") {
            if (q.noextglob !== !0 && U() === "(" && U(2) !== "?") {
              fH("plus", g);
              continue;
            }
            if ((C && C.value === "(") || q.regex === !1) {
              DH({ type: "plus", value: g, output: Y });
              continue;
            }
            if ((C && (C.type === "bracket" || C.type === "paren" || C.type === "brace")) || x.parens > 0) {
              DH({ type: "plus", value: g });
              continue;
            }
            DH({ type: "plus", value: Y });
            continue;
          }
          if (g === "@") {
            if (q.noextglob !== !0 && U() === "(" && U(2) !== "?") {
              DH({ type: "at", extglob: !0, value: g, output: "" });
              continue;
            }
            DH({ type: "text", value: g });
            continue;
          }
          if (g !== "*") {
            if (g === "$" || g === "^") g = `\\${g}`;
            let l = ol4.exec(_H());
            if (l) (g += l[0]), (x.index += l[0].length);
            DH({ type: "text", value: g });
            continue;
          }
          if (C && (C.type === "globstar" || C.star === !0)) {
            (C.type = "star"),
              (C.star = !0),
              (C.value += g),
              (C.output = S),
              (x.backtrack = !0),
              (x.globstar = !0),
              HH(g);
            continue;
          }
          let KH = _H();
          if (q.noextglob !== !0 && /^\([^?]/.test(KH)) {
            fH("star", g);
            continue;
          }
          if (C.type === "star") {
            if (q.noglobstar === !0) {
              HH(g);
              continue;
            }
            let l = C.prev,
              a = l.prev,
              t = l.type === "slash" || l.type === "bos",
              s = a && (a.type === "star" || a.type === "globstar");
            if (q.bash === !0 && (!t || (KH[0] && KH[0] !== "/"))) {
              DH({ type: "star", value: g, output: "" });
              continue;
            }
            let OH = x.braces > 0 && (l.type === "comma" || l.type === "brace"),
              XH = I.length && (l.type === "pipe" || l.type === "paren");
            if (!t && l.type !== "paren" && !OH && !XH) {
              DH({ type: "star", value: g, output: "" });
              continue;
            }
            while (KH.slice(0, 3) === "/**") {
              let jH = H[x.index + 4];
              if (jH && jH !== "/") break;
              (KH = KH.slice(3)), HH("/**", 3);
            }
            if (l.type === "bos" && c()) {
              (C.type = "globstar"), (C.value += g), (C.output = v(q)), (x.output = C.output), (x.globstar = !0), HH(g);
              continue;
            }
            if (l.type === "slash" && l.prev.type !== "bos" && !s && c()) {
              (x.output = x.output.slice(0, -(l.output + C.output).length)),
                (l.output = `(?:${l.output}`),
                (C.type = "globstar"),
                (C.output = v(q) + (q.strictSlashes ? ")" : "|$)")),
                (C.value += g),
                (x.globstar = !0),
                (x.output += l.output + C.output),
                HH(g);
              continue;
            }
            if (l.type === "slash" && l.prev.type !== "bos" && KH[0] === "/") {
              let jH = KH[1] !== void 0 ? "|$" : "";
              (x.output = x.output.slice(0, -(l.output + C.output).length)),
                (l.output = `(?:${l.output}`),
                (C.type = "globstar"),
                (C.output = `${v(q)}${D}|${D}${jH})`),
                (C.value += g),
                (x.output += l.output + C.output),
                (x.globstar = !0),
                HH(g + i()),
                DH({ type: "slash", value: "/", output: "" });
              continue;
            }
            if (l.type === "bos" && KH[0] === "/") {
              (C.type = "globstar"),
                (C.value += g),
                (C.output = `(?:^|${D}|${v(q)}${D})`),
                (x.output = C.output),
                (x.globstar = !0),
                HH(g + i()),
                DH({ type: "slash", value: "/", output: "" });
              continue;
            }
            (x.output = x.output.slice(0, -C.output.length)),
              (C.type = "globstar"),
              (C.output = v(q)),
              (C.value += g),
              (x.output += C.output),
              (x.globstar = !0),
              HH(g);
            continue;
          }
          let n = { type: "star", value: g, output: S };
          if (q.bash === !0) {
            if (((n.output = ".*?"), C.type === "bos" || C.type === "slash")) n.output = y + n.output;
            DH(n);
            continue;
          }
          if (C && (C.type === "bracket" || C.type === "paren") && q.regex === !0) {
            (n.output = g), DH(n);
            continue;
          }
          if (x.index === x.start || C.type === "slash" || C.type === "dot") {
            if (C.type === "dot") (x.output += P), (C.output += P);
            else if (q.dot === !0) (x.output += X), (C.output += X);
            else (x.output += y), (C.output += y);
            if (U() !== "*") (x.output += j), (C.output += j);
          }
          DH(n);
        }
        while (x.brackets > 0) {
          if (q.strictBrackets === !0) throw SyntaxError(tRH("closing", "]"));
          (x.output = Yd.escapeLast(x.output, "[")), $H("brackets");
        }
        while (x.parens > 0) {
          if (q.strictBrackets === !0) throw SyntaxError(tRH("closing", ")"));
          (x.output = Yd.escapeLast(x.output, "(")), $H("parens");
        }
        while (x.braces > 0) {
          if (q.strictBrackets === !0) throw SyntaxError(tRH("closing", "}"));
          (x.output = Yd.escapeLast(x.output, "{")), $H("braces");
        }
        if (q.strictSlashes !== !0 && (C.type === "star" || C.type === "bracket"))
          DH({ type: "maybe_slash", value: "", output: `${D}?` });
        if (x.backtrack === !0) {
          x.output = "";
          for (let KH of x.tokens)
            if (((x.output += KH.output != null ? KH.output : KH.value), KH.suffix)) x.output += KH.suffix;
        }
        return x;
      };
    db6.fastpaths = (H, _) => {
      let q = { ..._ },
        $ = typeof q.maxLength === "number" ? Math.min(hv_, q.maxLength) : hv_,
        K = H.length;
      if (K > $) throw SyntaxError(`Input length: ${K}, exceeds maximum allowed length: ${$}`);
      H = Q17[H] || H;
      let {
          DOT_LITERAL: O,
          SLASH_LITERAL: T,
          ONE_CHAR: z,
          DOTS_SLASH: A,
          NO_DOT: f,
          NO_DOTS: w,
          NO_DOTS_SLASH: Y,
          STAR: D,
          START_ANCHOR: j,
        } = Nv_.globChars(q.windows),
        M = q.dot ? w : f,
        J = q.dot ? Y : f,
        P = q.capture ? "" : "?:",
        X = { negated: !1, prefix: "" },
        R = q.bash === !0 ? ".*?" : D;
      if (q.capture) R = `(${R})`;
      let W = (y) => {
          if (y.noglobstar === !0) return R;
          return `(${P}(?:(?!${j}${y.dot ? A : O}).)*?)`;
        },
        Z = (y) => {
          switch (y) {
            case "*":
              return `${M}${z}${R}`;
            case ".*":
              return `${O}${z}${R}`;
            case "*.*":
              return `${M}${R}${O}${z}${R}`;
            case "*/*":
              return `${M}${R}${T}${z}${J}${R}`;
            case "**":
              return M + W(q);
            case "**/*":
              return `(?:${M}${W(q)}${T})?${J}${z}${R}`;
            case "**/*.*":
              return `(?:${M}${W(q)}${T})?${J}${R}${O}${z}${R}`;
            case "**/.*":
              return `(?:${M}${W(q)}${T})?${O}${z}${R}`;
            default: {
              let E = /^(.*?)\.(\w+)$/.exec(y);
              if (!E) return;
              let S = Z(E[1]);
              if (!S) return;
              return S + O + E[2];
            }
          }
        },
        k = Yd.removePrefix(H, X),
        v = Z(k);
      if (v && q.strictSlashes !== !0) v += `${T}?`;
      return v;
    };
    l17.exports = db6;
  });
