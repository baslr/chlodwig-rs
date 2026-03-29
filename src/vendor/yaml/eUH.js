  var eUH = d((jrq) => {
    var nu = vj(),
      _6H = Drq(),
      cR_ = (H, _) => ({
        indentAtStart: _ ? H.indent.length : H.indentAtStart,
        lineWidth: H.options.lineWidth,
        minContentWidth: H.options.minContentWidth,
      }),
      FR_ = (H) => /^(%|---|\.\.\.)/m.test(H);
    function LS4(H, _, q) {
      if (!_ || _ < 0) return !1;
      let $ = _ - q,
        K = H.length;
      if (K <= $) return !1;
      for (let O = 0, T = 0; O < K; ++O)
        if (
          H[O] ===
          `
`
        ) {
          if (O - T > $) return !0;
          if (((T = O + 1), K - T <= $)) return !1;
        }
      return !0;
    }
    function tUH(H, _) {
      let q = JSON.stringify(H);
      if (_.options.doubleQuotedAsJSON) return q;
      let { implicitKey: $ } = _,
        K = _.options.doubleQuotedMinMultiLineLength,
        O = _.indent || (FR_(H) ? "  " : ""),
        T = "",
        z = 0;
      for (let A = 0, f = q[A]; f; f = q[++A]) {
        if (f === " " && q[A + 1] === "\\" && q[A + 2] === "n")
          (T += q.slice(z, A) + "\\ "), (A += 1), (z = A), (f = "\\");
        if (f === "\\")
          switch (q[A + 1]) {
            case "u":
              {
                T += q.slice(z, A);
                let w = q.substr(A + 2, 4);
                switch (w) {
                  case "0000":
                    T += "\\0";
                    break;
                  case "0007":
                    T += "\\a";
                    break;
                  case "000b":
                    T += "\\v";
                    break;
                  case "001b":
                    T += "\\e";
                    break;
                  case "0085":
                    T += "\\N";
                    break;
                  case "00a0":
                    T += "\\_";
                    break;
                  case "2028":
                    T += "\\L";
                    break;
                  case "2029":
                    T += "\\P";
                    break;
                  default:
                    if (w.substr(0, 2) === "00") T += "\\x" + w.substr(2);
                    else T += q.substr(A, 6);
                }
                (A += 5), (z = A + 1);
              }
              break;
            case "n":
              if ($ || q[A + 2] === '"' || q.length < K) A += 1;
              else {
                T +=
                  q.slice(z, A) +
                  `

`;
                while (q[A + 2] === "\\" && q[A + 3] === "n" && q[A + 4] !== '"')
                  (T += `
`),
                    (A += 2);
                if (((T += O), q[A + 2] === " ")) T += "\\";
                (A += 1), (z = A + 1);
              }
              break;
            default:
              A += 1;
          }
      }
      return (T = z ? T + q.slice(z) : q), $ ? T : _6H.foldFlowLines(T, O, _6H.FOLD_QUOTED, cR_(_, !1));
    }
    function nh6(H, _) {
      if (
        _.options.singleQuote === !1 ||
        (_.implicitKey &&
          H.includes(`
`)) ||
        /[ \t]\n|\n[ \t]/.test(H)
      )
        return tUH(H, _);
      let q = _.indent || (FR_(H) ? "  " : ""),
        $ =
          "'" +
          H.replace(/'/g, "''").replace(
            /\n+/g,
            `$&
${q}`,
          ) +
          "'";
      return _.implicitKey ? $ : _6H.foldFlowLines($, q, _6H.FOLD_FLOW, cR_(_, !1));
    }
    function GGH(H, _) {
      let { singleQuote: q } = _.options,
        $;
      if (q === !1) $ = tUH;
      else {
        let K = H.includes('"'),
          O = H.includes("'");
        if (K && !O) $ = nh6;
        else if (O && !K) $ = tUH;
        else $ = q ? nh6 : tUH;
      }
      return $(H, _);
    }
    var rh6;
    try {
      rh6 = new RegExp(
        `(^|(?<!
))
+(?!
|$)`,
        "g",
      );
    } catch {
      rh6 = /\n+(?!\n|$)/g;
    }
    function dR_({ comment: H, type: _, value: q }, $, K, O) {
      let { blockQuote: T, commentString: z, lineWidth: A } = $.options;
      if (!T || /\n[\t ]+$/.test(q)) return GGH(q, $);
      let f = $.indent || ($.forceBlockIndent || FR_(q) ? "  " : ""),
        w =
          T === "literal"
            ? !0
            : T === "folded" || _ === nu.Scalar.BLOCK_FOLDED
              ? !1
              : _ === nu.Scalar.BLOCK_LITERAL
                ? !0
                : !LS4(q, A, f.length);
      if (!q)
        return w
          ? `|
`
          : `>
`;
      let Y, D;
      for (D = q.length; D > 0; --D) {
        let k = q[D - 1];
        if (
          k !==
            `
` &&
          k !== "\t" &&
          k !== " "
        )
          break;
      }
      let j = q.substring(D),
        M = j.indexOf(`
`);
      if (M === -1) Y = "-";
      else if (q === j || M !== j.length - 1) {
        if (((Y = "+"), O)) O();
      } else Y = "";
      if (j) {
        if (
          ((q = q.slice(0, -j.length)),
          j[j.length - 1] ===
            `
`)
        )
          j = j.slice(0, -1);
        j = j.replace(rh6, `$&${f}`);
      }
      let J = !1,
        P,
        X = -1;
      for (P = 0; P < q.length; ++P) {
        let k = q[P];
        if (k === " ") J = !0;
        else if (
          k ===
          `
`
        )
          X = P;
        else break;
      }
      let R = q.substring(0, X < P ? X + 1 : P);
      if (R) (q = q.substring(R.length)), (R = R.replace(/\n+/g, `$&${f}`));
      let Z = (J ? (f ? "2" : "1") : "") + Y;
      if (H) {
        if (((Z += " " + z(H.replace(/ ?[\r\n]+/g, " "))), K)) K();
      }
      if (!w) {
        let k = q
            .replace(
              /\n+/g,
              `
$&`,
            )
            .replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2")
            .replace(/\n+/g, `$&${f}`),
          v = !1,
          y = cR_($, !0);
        if (T !== "folded" && _ !== nu.Scalar.BLOCK_FOLDED)
          y.onOverflow = () => {
            v = !0;
          };
        let E = _6H.foldFlowLines(`${R}${k}${j}`, f, _6H.FOLD_BLOCK, y);
        if (!v)
          return `>${Z}
${f}${E}`;
      }
      return (
        (q = q.replace(/\n+/g, `$&${f}`)),
        `|${Z}
${f}${R}${q}${j}`
      );
    }
    function kS4(H, _, q, $) {
      let { type: K, value: O } = H,
        { actualString: T, implicitKey: z, indent: A, indentStep: f, inFlow: w } = _;
      if (
        (z &&
          O.includes(`
`)) ||
        (w && /[[\]{},]/.test(O))
      )
        return GGH(O, _);
      if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(O))
        return z ||
          w ||
          !O.includes(`
`)
          ? GGH(O, _)
          : dR_(H, _, q, $);
      if (
        !z &&
        !w &&
        K !== nu.Scalar.PLAIN &&
        O.includes(`
`)
      )
        return dR_(H, _, q, $);
      if (FR_(O)) {
        if (A === "") return (_.forceBlockIndent = !0), dR_(H, _, q, $);
        else if (z && A === f) return GGH(O, _);
      }
      let Y = O.replace(
        /\n+/g,
        `$&
${A}`,
      );
      if (T) {
        let D = (J) => J.default && J.tag !== "tag:yaml.org,2002:str" && J.test?.test(Y),
          { compat: j, tags: M } = _.doc.schema;
        if (M.some(D) || j?.some(D)) return GGH(O, _);
      }
      return z ? Y : _6H.foldFlowLines(Y, A, _6H.FOLD_FLOW, cR_(_, !1));
    }
    function vS4(H, _, q, $) {
      let { implicitKey: K, inFlow: O } = _,
        T = typeof H.value === "string" ? H : Object.assign({}, H, { value: String(H.value) }),
        { type: z } = H;
      if (z !== nu.Scalar.QUOTE_DOUBLE) {
        if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(T.value)) z = nu.Scalar.QUOTE_DOUBLE;
      }
      let A = (w) => {
          switch (w) {
            case nu.Scalar.BLOCK_FOLDED:
            case nu.Scalar.BLOCK_LITERAL:
              return K || O ? GGH(T.value, _) : dR_(T, _, q, $);
            case nu.Scalar.QUOTE_DOUBLE:
              return tUH(T.value, _);
            case nu.Scalar.QUOTE_SINGLE:
              return nh6(T.value, _);
            case nu.Scalar.PLAIN:
              return kS4(T, _, q, $);
            default:
              return null;
          }
        },
        f = A(z);
      if (f === null) {
        let { defaultKeyType: w, defaultStringType: Y } = _.options,
          D = (K && w) || Y;
        if (((f = A(D)), f === null)) throw Error(`Unsupported default string type ${D}`);
      }
      return f;
    }
    jrq.stringifyString = vS4;
  });
