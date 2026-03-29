  var Uy6 = d((roq) => {
    var Fy6 = vj();
    function tC4(H, _, q) {
      let $ = _.offset,
        K = eC4(_, H.options.strict, q);
      if (!K) return { value: "", type: null, comment: "", range: [$, $, $] };
      let O = K.mode === ">" ? Fy6.Scalar.BLOCK_FOLDED : Fy6.Scalar.BLOCK_LITERAL,
        T = _.source ? Hb4(_.source) : [],
        z = T.length;
      for (let J = T.length - 1; J >= 0; --J) {
        let P = T[J][1];
        if (P === "" || P === "\r") z = J;
        else break;
      }
      if (z === 0) {
        let J =
            K.chomp === "+" && T.length > 0
              ? `
`.repeat(Math.max(1, T.length - 1))
              : "",
          P = $ + K.length;
        if (_.source) P += _.source.length;
        return { value: J, type: O, comment: K.comment, range: [$, P, P] };
      }
      let A = _.indent + K.indent,
        f = _.offset + K.length,
        w = 0;
      for (let J = 0; J < z; ++J) {
        let [P, X] = T[J];
        if (X === "" || X === "\r") {
          if (K.indent === 0 && P.length > A) A = P.length;
        } else {
          if (P.length < A)
            q(
              f + P.length,
              "MISSING_CHAR",
              "Block scalars with more-indented leading empty lines must use an explicit indentation indicator",
            );
          if (K.indent === 0) A = P.length;
          if (((w = J), A === 0 && !H.atRoot))
            q(f, "BAD_INDENT", "Block scalar values in collections must be indented");
          break;
        }
        f += P.length + X.length + 1;
      }
      for (let J = T.length - 1; J >= z; --J) if (T[J][0].length > A) z = J + 1;
      let Y = "",
        D = "",
        j = !1;
      for (let J = 0; J < w; ++J)
        Y +=
          T[J][0].slice(A) +
          `
`;
      for (let J = w; J < z; ++J) {
        let [P, X] = T[J];
        f += P.length + X.length + 1;
        let R = X[X.length - 1] === "\r";
        if (R) X = X.slice(0, -1);
        if (X && P.length < A) {
          let Z = `Block scalar lines must not be less indented than their ${K.indent ? "explicit indentation indicator" : "first line"}`;
          q(f - X.length - (R ? 2 : 1), "BAD_INDENT", Z), (P = "");
        }
        if (O === Fy6.Scalar.BLOCK_LITERAL)
          (Y += D + P.slice(A) + X),
            (D = `
`);
        else if (P.length > A || X[0] === "\t") {
          if (D === " ")
            D = `
`;
          else if (
            !j &&
            D ===
              `
`
          )
            D = `

`;
          (Y += D + P.slice(A) + X),
            (D = `
`),
            (j = !0);
        } else if (X === "")
          if (
            D ===
            `
`
          )
            Y += `
`;
          else
            D = `
`;
        else (Y += D + X), (D = " "), (j = !1);
      }
      switch (K.chomp) {
        case "-":
          break;
        case "+":
          for (let J = z; J < T.length; ++J)
            Y +=
              `
` + T[J][0].slice(A);
          if (
            Y[Y.length - 1] !==
            `
`
          )
            Y += `
`;
          break;
        default:
          Y += `
`;
      }
      let M = $ + K.length + _.source.length;
      return { value: Y, type: O, comment: K.comment, range: [$, M, M] };
    }
    function eC4({ offset: H, props: _ }, q, $) {
      if (_[0].type !== "block-scalar-header") return $(_[0], "IMPOSSIBLE", "Block scalar header not found"), null;
      let { source: K } = _[0],
        O = K[0],
        T = 0,
        z = "",
        A = -1;
      for (let D = 1; D < K.length; ++D) {
        let j = K[D];
        if (!z && (j === "-" || j === "+")) z = j;
        else {
          let M = Number(j);
          if (!T && M) T = M;
          else if (A === -1) A = H + D;
        }
      }
      if (A !== -1) $(A, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${K}`);
      let f = !1,
        w = "",
        Y = K.length;
      for (let D = 1; D < _.length; ++D) {
        let j = _[D];
        switch (j.type) {
          case "space":
            f = !0;
          case "newline":
            Y += j.source.length;
            break;
          case "comment":
            if (q && !f) $(j, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            (Y += j.source.length), (w = j.source.substring(1));
            break;
          case "error":
            $(j, "UNEXPECTED_TOKEN", j.message), (Y += j.source.length);
            break;
          default: {
            let M = `Unexpected token in block scalar header: ${j.type}`;
            $(j, "UNEXPECTED_TOKEN", M);
            let J = j.source;
            if (J && typeof J === "string") Y += J.length;
          }
        }
      }
      return { mode: O, indent: T, chomp: z, comment: w, length: Y };
    }
    function Hb4(H) {
      let _ = H.split(/\n( *)/),
        q = _[0],
        $ = q.match(/^( *)/),
        O = [$?.[1] ? [$[1], q.slice($[1].length)] : ["", q]];
      for (let T = 1; T < _.length; T += 2) O.push([_[T], _[T + 1]]);
      return O;
    }
    roq.resolveBlockScalar = tC4;
  });
