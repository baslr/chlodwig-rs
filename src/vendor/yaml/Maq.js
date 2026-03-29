  var Maq = d((GZ_) => {
    var Cb4 = Uy6(),
      bb4 = ly6(),
      Ib4 = jQH(),
      Daq = eUH();
    function ub4(H, _ = !0, q) {
      if (H) {
        let $ = (K, O, T) => {
          let z = typeof K === "number" ? K : Array.isArray(K) ? K[0] : K.offset;
          if (q) q(z, O, T);
          else throw new Ib4.YAMLParseError([z, z + 1], O, T);
        };
        switch (H.type) {
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return bb4.resolveFlowScalar(H, _, $);
          case "block-scalar":
            return Cb4.resolveBlockScalar({ options: { strict: _ } }, H, $);
        }
      }
      return null;
    }
    function xb4(H, _) {
      let { implicitKey: q = !1, indent: $, inFlow: K = !1, offset: O = -1, type: T = "PLAIN" } = _,
        z = Daq.stringifyString(
          { type: T, value: H },
          { implicitKey: q, indent: $ > 0 ? " ".repeat($) : "", inFlow: K, options: { blockQuote: !0, lineWidth: -1 } },
        ),
        A = _.end ?? [
          {
            type: "newline",
            offset: -1,
            indent: $,
            source: `
`,
          },
        ];
      switch (z[0]) {
        case "|":
        case ">": {
          let f = z.indexOf(`
`),
            w = z.substring(0, f),
            Y =
              z.substring(f + 1) +
              `
`,
            D = [{ type: "block-scalar-header", offset: O, indent: $, source: w }];
          if (!jaq(D, A))
            D.push({
              type: "newline",
              offset: -1,
              indent: $,
              source: `
`,
            });
          return { type: "block-scalar", offset: O, indent: $, props: D, source: Y };
        }
        case '"':
          return { type: "double-quoted-scalar", offset: O, indent: $, source: z, end: A };
        case "'":
          return { type: "single-quoted-scalar", offset: O, indent: $, source: z, end: A };
        default:
          return { type: "scalar", offset: O, indent: $, source: z, end: A };
      }
    }
    function mb4(H, _, q = {}) {
      let { afterKey: $ = !1, implicitKey: K = !1, inFlow: O = !1, type: T } = q,
        z = "indent" in H ? H.indent : null;
      if ($ && typeof z === "number") z += 2;
      if (!T)
        switch (H.type) {
          case "single-quoted-scalar":
            T = "QUOTE_SINGLE";
            break;
          case "double-quoted-scalar":
            T = "QUOTE_DOUBLE";
            break;
          case "block-scalar": {
            let f = H.props[0];
            if (f.type !== "block-scalar-header") throw Error("Invalid block scalar header");
            T = f.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
            break;
          }
          default:
            T = "PLAIN";
        }
      let A = Daq.stringifyString(
        { type: T, value: _ },
        {
          implicitKey: K || z === null,
          indent: z !== null && z > 0 ? " ".repeat(z) : "",
          inFlow: O,
          options: { blockQuote: !0, lineWidth: -1 },
        },
      );
      switch (A[0]) {
        case "|":
        case ">":
          pb4(H, A);
          break;
        case '"':
          oy6(H, A, "double-quoted-scalar");
          break;
        case "'":
          oy6(H, A, "single-quoted-scalar");
          break;
        default:
          oy6(H, A, "scalar");
      }
    }
    function pb4(H, _) {
      let q = _.indexOf(`
`),
        $ = _.substring(0, q),
        K =
          _.substring(q + 1) +
          `
`;
      if (H.type === "block-scalar") {
        let O = H.props[0];
        if (O.type !== "block-scalar-header") throw Error("Invalid block scalar header");
        (O.source = $), (H.source = K);
      } else {
        let { offset: O } = H,
          T = "indent" in H ? H.indent : -1,
          z = [{ type: "block-scalar-header", offset: O, indent: T, source: $ }];
        if (!jaq(z, "end" in H ? H.end : void 0))
          z.push({
            type: "newline",
            offset: -1,
            indent: T,
            source: `
`,
          });
        for (let A of Object.keys(H)) if (A !== "type" && A !== "offset") delete H[A];
        Object.assign(H, { type: "block-scalar", indent: T, props: z, source: K });
      }
    }
    function jaq(H, _) {
      if (_)
        for (let q of _)
          switch (q.type) {
            case "space":
            case "comment":
              H.push(q);
              break;
            case "newline":
              return H.push(q), !0;
          }
      return !1;
    }
    function oy6(H, _, q) {
      switch (H.type) {
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          (H.type = q), (H.source = _);
          break;
        case "block-scalar": {
          let $ = H.props.slice(1),
            K = _.length;
          if (H.props[0].type === "block-scalar-header") K -= H.props[0].source.length;
          for (let O of $) O.offset += K;
          delete H.props, Object.assign(H, { type: q, source: _, end: $ });
          break;
        }
        case "block-map":
        case "block-seq": {
          let K = {
            type: "newline",
            offset: H.offset + _.length,
            indent: H.indent,
            source: `
`,
          };
          delete H.items, Object.assign(H, { type: q, source: _, end: [K] });
          break;
        }
        default: {
          let $ = "indent" in H ? H.indent : -1,
            K =
              "end" in H && Array.isArray(H.end)
                ? H.end.filter((O) => O.type === "space" || O.type === "comment" || O.type === "newline")
                : [];
          for (let O of Object.keys(H)) if (O !== "type" && O !== "offset") delete H[O];
          Object.assign(H, { type: q, indent: $, source: _, end: K });
        }
      }
    }
    GZ_.createScalarToken = xb4;
    GZ_.resolveAsScalar = ub4;
    GZ_.setScalarValue = mb4;
  });
