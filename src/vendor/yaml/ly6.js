  var ly6 = d((aoq) => {
    var Qy6 = vj(),
      _b4 = NGH();
    function qb4(H, _, q) {
      let { offset: $, type: K, source: O, end: T } = H,
        z,
        A,
        f = (D, j, M) => q($ + D, j, M);
      switch (K) {
        case "scalar":
          (z = Qy6.Scalar.PLAIN), (A = $b4(O, f));
          break;
        case "single-quoted-scalar":
          (z = Qy6.Scalar.QUOTE_SINGLE), (A = Kb4(O, f));
          break;
        case "double-quoted-scalar":
          (z = Qy6.Scalar.QUOTE_DOUBLE), (A = Ob4(O, f));
          break;
        default:
          return (
            q(H, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${K}`),
            { value: "", type: null, comment: "", range: [$, $ + O.length, $ + O.length] }
          );
      }
      let w = $ + O.length,
        Y = _b4.resolveEnd(T, w, _, q);
      return { value: A, type: z, comment: Y.comment, range: [$, w, Y.offset] };
    }
    function $b4(H, _) {
      let q = "";
      switch (H[0]) {
        case "\t":
          q = "a tab character";
          break;
        case ",":
          q = "flow indicator character ,";
          break;
        case "%":
          q = "directive indicator character %";
          break;
        case "|":
        case ">": {
          q = `block scalar indicator ${H[0]}`;
          break;
        }
        case "@":
        case "`": {
          q = `reserved character ${H[0]}`;
          break;
        }
      }
      if (q) _(0, "BAD_SCALAR_START", `Plain value cannot start with ${q}`);
      return ooq(H);
    }
    function Kb4(H, _) {
      if (H[H.length - 1] !== "'" || H.length === 1) _(H.length, "MISSING_CHAR", "Missing closing 'quote");
      return ooq(H.slice(1, -1)).replace(/''/g, "'");
    }
    function ooq(H) {
      let _, q;
      try {
        (_ = new RegExp(
          `(.*?)(?<![ 	])[ 	]*\r?
`,
          "sy",
        )),
          (q = new RegExp(
            `[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?
`,
            "sy",
          ));
      } catch {
        (_ = /(.*?)[ \t]*\r?\n/sy), (q = /[ \t]*(.*?)[ \t]*\r?\n/sy);
      }
      let $ = _.exec(H);
      if (!$) return H;
      let K = $[1],
        O = " ",
        T = _.lastIndex;
      q.lastIndex = T;
      while (($ = q.exec(H))) {
        if ($[1] === "")
          if (
            O ===
            `
`
          )
            K += O;
          else
            O = `
`;
        else (K += O + $[1]), (O = " ");
        T = q.lastIndex;
      }
      let z = /[ \t]*(.*)/sy;
      return (z.lastIndex = T), ($ = z.exec(H)), K + O + ($?.[1] ?? "");
    }
    function Ob4(H, _) {
      let q = "";
      for (let $ = 1; $ < H.length - 1; ++$) {
        let K = H[$];
        if (
          K === "\r" &&
          H[$ + 1] ===
            `
`
        )
          continue;
        if (
          K ===
          `
`
        ) {
          let { fold: O, offset: T } = Tb4(H, $);
          (q += O), ($ = T);
        } else if (K === "\\") {
          let O = H[++$],
            T = zb4[O];
          if (T) q += T;
          else if (
            O ===
            `
`
          ) {
            O = H[$ + 1];
            while (O === " " || O === "\t") O = H[++$ + 1];
          } else if (
            O === "\r" &&
            H[$ + 1] ===
              `
`
          ) {
            O = H[++$ + 1];
            while (O === " " || O === "\t") O = H[++$ + 1];
          } else if (O === "x" || O === "u" || O === "U") {
            let z = { x: 2, u: 4, U: 8 }[O];
            (q += Ab4(H, $ + 1, z, _)), ($ += z);
          } else {
            let z = H.substr($ - 1, 2);
            _($ - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${z}`), (q += z);
          }
        } else if (K === " " || K === "\t") {
          let O = $,
            T = H[$ + 1];
          while (T === " " || T === "\t") T = H[++$ + 1];
          if (
            T !==
              `
` &&
            !(
              T === "\r" &&
              H[$ + 2] ===
                `
`
            )
          )
            q += $ > O ? H.slice(O, $ + 1) : K;
        } else q += K;
      }
      if (H[H.length - 1] !== '"' || H.length === 1) _(H.length, "MISSING_CHAR", 'Missing closing "quote');
      return q;
    }
    function Tb4(H, _) {
      let q = "",
        $ = H[_ + 1];
      while (
        $ === " " ||
        $ === "\t" ||
        $ ===
          `
` ||
        $ === "\r"
      ) {
        if (
          $ === "\r" &&
          H[_ + 2] !==
            `
`
        )
          break;
        if (
          $ ===
          `
`
        )
          q += `
`;
        (_ += 1), ($ = H[_ + 1]);
      }
      if (!q) q = " ";
      return { fold: q, offset: _ };
    }
    var zb4 = {
      0: "\x00",
      a: "\x07",
      b: "\b",
      e: "\x1B",
      f: "\f",
      n: `
`,
      r: "\r",
      t: "\t",
      v: "\v",
      N: "\x85",
      _: "\xA0",
      L: "\u2028",
      P: "\u2029",
      " ": " ",
      '"': '"',
      "/": "/",
      "\\": "\\",
      "\t": "\t",
    };
    function Ab4(H, _, q, $) {
      let K = H.substr(_, q),
        T = K.length === q && /^[0-9a-fA-F]+$/.test(K) ? parseInt(K, 16) : NaN;
      if (isNaN(T)) {
        let z = H.substr(_ - 2, q + 2);
        return $(_ - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${z}`), z;
      }
      return String.fromCodePoint(T);
    }
    aoq.resolveFlowScalar = qb4;
  });
