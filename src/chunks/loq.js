  var loq = d((Qoq) => {
    var pC4 = R3(),
      BC4 = $6H(),
      Foq = O6H(),
      gC4 = T6H(),
      dC4 = NGH(),
      Uoq = MQH(),
      cC4 = WZ_(),
      FC4 = By6(),
      gy6 = "Block collections are not allowed within flow collections",
      dy6 = (H) => H && (H.type === "block-map" || H.type === "block-seq");
    function UC4({ composeNode: H, composeEmptyNode: _ }, q, $, K, O) {
      let T = $.start.source === "{",
        z = T ? "flow map" : "flow sequence",
        f = new (O?.nodeClass ?? (T ? Foq.YAMLMap : gC4.YAMLSeq))(q.schema);
      f.flow = !0;
      let w = q.atRoot;
      if (w) q.atRoot = !1;
      if (q.atKey) q.atKey = !1;
      let Y = $.offset + $.start.source.length;
      for (let P = 0; P < $.items.length; ++P) {
        let X = $.items[P],
          { start: R, key: W, sep: Z, value: k } = X,
          v = Uoq.resolveProps(R, {
            flow: z,
            indicator: "explicit-key-ind",
            next: W ?? Z?.[0],
            offset: Y,
            onError: K,
            parentIndent: $.indent,
            startOnNewline: !1,
          });
        if (!v.found) {
          if (!v.anchor && !v.tag && !Z && !k) {
            if (P === 0 && v.comma) K(v.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${z}`);
            else if (P < $.items.length - 1) K(v.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${z}`);
            if (v.comment)
              if (f.comment)
                f.comment +=
                  `
` + v.comment;
              else f.comment = v.comment;
            Y = v.end;
            continue;
          }
          if (!T && q.options.strict && cC4.containsNewline(W))
            K(W, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
        }
        if (P === 0) {
          if (v.comma) K(v.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${z}`);
        } else {
          if (!v.comma) K(v.start, "MISSING_CHAR", `Missing , between ${z} items`);
          if (v.comment) {
            let y = "";
            H: for (let E of R)
              switch (E.type) {
                case "comma":
                case "space":
                  break;
                case "comment":
                  y = E.source.substring(1);
                  break H;
                default:
                  break H;
              }
            if (y) {
              let E = f.items[f.items.length - 1];
              if (pC4.isPair(E)) E = E.value ?? E.key;
              if (E.comment)
                E.comment +=
                  `
` + y;
              else E.comment = y;
              v.comment = v.comment.substring(y.length + 1);
            }
          }
        }
        if (!T && !Z && !v.found) {
          let y = k ? H(q, k, v, K) : _(q, v.end, Z, null, v, K);
          if ((f.items.push(y), (Y = y.range[2]), dy6(k))) K(y.range, "BLOCK_IN_FLOW", gy6);
        } else {
          q.atKey = !0;
          let y = v.end,
            E = W ? H(q, W, v, K) : _(q, y, R, null, v, K);
          if (dy6(W)) K(E.range, "BLOCK_IN_FLOW", gy6);
          q.atKey = !1;
          let S = Uoq.resolveProps(Z ?? [], {
            flow: z,
            indicator: "map-value-ind",
            next: k,
            offset: E.range[2],
            onError: K,
            parentIndent: $.indent,
            startOnNewline: !1,
          });
          if (S.found) {
            if (!T && !v.found && q.options.strict) {
              if (Z)
                for (let B of Z) {
                  if (B === S.found) break;
                  if (B.type === "newline") {
                    K(B, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                    break;
                  }
                }
              if (v.start < S.found.offset - 1024)
                K(
                  S.found,
                  "KEY_OVER_1024_CHARS",
                  "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key",
                );
            }
          } else if (k)
            if ("source" in k && k.source && k.source[0] === ":") K(k, "MISSING_CHAR", `Missing space after : in ${z}`);
            else K(S.start, "MISSING_CHAR", `Missing , or : between ${z} items`);
          let x = k ? H(q, k, S, K) : S.found ? _(q, S.end, Z, null, S, K) : null;
          if (x) {
            if (dy6(k)) K(x.range, "BLOCK_IN_FLOW", gy6);
          } else if (S.comment)
            if (E.comment)
              E.comment +=
                `
` + S.comment;
            else E.comment = S.comment;
          let I = new BC4.Pair(E, x);
          if (q.options.keepSourceTokens) I.srcToken = X;
          if (T) {
            let B = f;
            if (FC4.mapIncludes(q, B.items, E)) K(y, "DUPLICATE_KEY", "Map keys must be unique");
            B.items.push(I);
          } else {
            let B = new Foq.YAMLMap(q.schema);
            (B.flow = !0), B.items.push(I);
            let p = (x ?? E).range;
            (B.range = [E.range[0], p[1], p[2]]), f.items.push(B);
          }
          Y = x ? x.range[2] : S.end;
        }
      }
      let D = T ? "}" : "]",
        [j, ...M] = $.end,
        J = Y;
      if (j && j.source === D) J = j.offset + j.source.length;
      else {
        let P = z[0].toUpperCase() + z.substring(1),
          X = w
            ? `${P} must end with a ${D}`
            : `${P} in block collection must be sufficiently indented and end with a ${D}`;
        if ((K(Y, w ? "MISSING_CHAR" : "BAD_INDENT", X), j && j.source.length !== 1)) M.unshift(j);
      }
      if (M.length > 0) {
        let P = dC4.resolveEnd(M, J, q.options.strict, K);
        if (P.comment)
          if (f.comment)
            f.comment +=
              `
` + P.comment;
          else f.comment = P.comment;
        f.range = [$.offset, J, P.offset];
      } else f.range = [$.offset, J, J];
      return f;
    }
    Qoq.resolveFlowCollection = UC4;
  });
