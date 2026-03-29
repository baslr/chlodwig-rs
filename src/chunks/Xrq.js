  var Xrq = d((Prq) => {
    var ai = R3(),
      Mrq = vj(),
      Jrq = HQH(),
      _QH = aUH();
    function bS4({ key: H, value: _ }, q, $, K) {
      let {
          allNullValues: O,
          doc: T,
          indent: z,
          indentStep: A,
          options: { commentString: f, indentSeq: w, simpleKeys: Y },
        } = q,
        D = (ai.isNode(H) && H.comment) || null;
      if (Y) {
        if (D) throw Error("With simple keys, key nodes cannot have comments");
        if (ai.isCollection(H) || (!ai.isNode(H) && typeof H === "object"))
          throw Error("With simple keys, collection cannot be used as a key value");
      }
      let j =
        !Y &&
        (!H ||
          (D && _ == null && !q.inFlow) ||
          ai.isCollection(H) ||
          (ai.isScalar(H)
            ? H.type === Mrq.Scalar.BLOCK_FOLDED || H.type === Mrq.Scalar.BLOCK_LITERAL
            : typeof H === "object"));
      q = Object.assign({}, q, { allNullValues: !1, implicitKey: !j && (Y || !O), indent: z + A });
      let M = !1,
        J = !1,
        P = Jrq.stringify(
          H,
          q,
          () => (M = !0),
          () => (J = !0),
        );
      if (!j && !q.inFlow && P.length > 1024) {
        if (Y) throw Error("With simple keys, single line scalar must not span more than 1024 characters");
        j = !0;
      }
      if (q.inFlow) {
        if (O || _ == null) {
          if (M && $) $();
          return P === "" ? "?" : j ? `? ${P}` : P;
        }
      } else if ((O && !Y) || (_ == null && j)) {
        if (((P = `? ${P}`), D && !M)) P += _QH.lineComment(P, q.indent, f(D));
        else if (J && K) K();
        return P;
      }
      if (M) D = null;
      if (j) {
        if (D) P += _QH.lineComment(P, q.indent, f(D));
        P = `? ${P}
${z}:`;
      } else if (((P = `${P}:`), D)) P += _QH.lineComment(P, q.indent, f(D));
      let X, R, W;
      if (ai.isNode(_)) (X = !!_.spaceBefore), (R = _.commentBefore), (W = _.comment);
      else if (((X = !1), (R = null), (W = null), _ && typeof _ === "object")) _ = T.createNode(_);
      if (((q.implicitKey = !1), !j && !D && ai.isScalar(_))) q.indentAtStart = P.length + 1;
      if (((J = !1), !w && A.length >= 2 && !q.inFlow && !j && ai.isSeq(_) && !_.flow && !_.tag && !_.anchor))
        q.indent = q.indent.substring(2);
      let Z = !1,
        k = Jrq.stringify(
          _,
          q,
          () => (Z = !0),
          () => (J = !0),
        ),
        v = " ";
      if (D || X || R) {
        if (
          ((v = X
            ? `
`
            : ""),
          R)
        ) {
          let y = f(R);
          v += `
${_QH.indentComment(y, q.indent)}`;
        }
        if (k === "" && !q.inFlow) {
          if (
            v ===
            `
`
          )
            v = `

`;
        } else
          v += `
${q.indent}`;
      } else if (!j && ai.isCollection(_)) {
        let y = k[0],
          E = k.indexOf(`
`),
          S = E !== -1,
          x = q.inFlow ?? _.flow ?? _.items.length === 0;
        if (S || !x) {
          let I = !1;
          if (S && (y === "&" || y === "!")) {
            let B = k.indexOf(" ");
            if (y === "&" && B !== -1 && B < E && k[B + 1] === "!") B = k.indexOf(" ", B + 1);
            if (B === -1 || E < B) I = !0;
          }
          if (!I)
            v = `
${q.indent}`;
        }
      } else if (
        k === "" ||
        k[0] ===
          `
`
      )
        v = "";
      if (((P += v + k), q.inFlow)) {
        if (Z && $) $();
      } else if (W && !Z) P += _QH.lineComment(P, q.indent, f(W));
      else if (J && K) K();
      return P;
    }
    Prq.stringifyPair = bS4;
  });
