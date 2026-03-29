  var Boq = d((poq) => {
    var Ioq = $6H(),
      VC4 = O6H(),
      uoq = MQH(),
      SC4 = WZ_(),
      xoq = py6(),
      EC4 = By6(),
      moq = "All mapping items must start at the same column";
    function CC4({ composeNode: H, composeEmptyNode: _ }, q, $, K, O) {
      let z = new (O?.nodeClass ?? VC4.YAMLMap)(q.schema);
      if (q.atRoot) q.atRoot = !1;
      let A = $.offset,
        f = null;
      for (let w of $.items) {
        let { start: Y, key: D, sep: j, value: M } = w,
          J = uoq.resolveProps(Y, {
            indicator: "explicit-key-ind",
            next: D ?? j?.[0],
            offset: A,
            onError: K,
            parentIndent: $.indent,
            startOnNewline: !0,
          }),
          P = !J.found;
        if (P) {
          if (D) {
            if (D.type === "block-seq")
              K(A, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
            else if ("indent" in D && D.indent !== $.indent) K(A, "BAD_INDENT", moq);
          }
          if (!J.anchor && !J.tag && !j) {
            if (((f = J.end), J.comment))
              if (z.comment)
                z.comment +=
                  `
` + J.comment;
              else z.comment = J.comment;
            continue;
          }
          if (J.newlineAfterProp || SC4.containsNewline(D))
            K(D ?? Y[Y.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
        } else if (J.found?.indent !== $.indent) K(A, "BAD_INDENT", moq);
        q.atKey = !0;
        let X = J.end,
          R = D ? H(q, D, J, K) : _(q, X, Y, null, J, K);
        if (q.schema.compat) xoq.flowIndentCheck($.indent, D, K);
        if (((q.atKey = !1), EC4.mapIncludes(q, z.items, R))) K(X, "DUPLICATE_KEY", "Map keys must be unique");
        let W = uoq.resolveProps(j ?? [], {
          indicator: "map-value-ind",
          next: M,
          offset: R.range[2],
          onError: K,
          parentIndent: $.indent,
          startOnNewline: !D || D.type === "block-scalar",
        });
        if (((A = W.end), W.found)) {
          if (P) {
            if (M?.type === "block-map" && !W.hasNewline)
              K(A, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
            if (q.options.strict && J.start < W.found.offset - 1024)
              K(
                R.range,
                "KEY_OVER_1024_CHARS",
                "The : indicator must be at most 1024 chars after the start of an implicit block mapping key",
              );
          }
          let Z = M ? H(q, M, W, K) : _(q, A, j, null, W, K);
          if (q.schema.compat) xoq.flowIndentCheck($.indent, M, K);
          A = Z.range[2];
          let k = new Ioq.Pair(R, Z);
          if (q.options.keepSourceTokens) k.srcToken = w;
          z.items.push(k);
        } else {
          if (P) K(R.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
          if (W.comment)
            if (R.comment)
              R.comment +=
                `
` + W.comment;
            else R.comment = W.comment;
          let Z = new Ioq.Pair(R);
          if (q.options.keepSourceTokens) Z.srcToken = w;
          z.items.push(Z);
        }
      }
      if (f && f < A) K(f, "IMPOSSIBLE", "Map comment with trailing content");
      return (z.range = [$.offset, A, f ?? A]), z;
    }
    poq.resolveBlockMap = CC4;
  });
