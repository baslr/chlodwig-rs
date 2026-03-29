  var qy6 = d((hrq) => {
    var jOH = R3(),
      Nrq = HQH(),
      oR_ = aUH();
    function US4(H, _, q) {
      return ((_.inFlow ?? H.flow) ? lS4 : QS4)(H, _, q);
    }
    function QS4(
      { comment: H, items: _ },
      q,
      { blockItemPrefix: $, flowChars: K, itemIndent: O, onChompKeep: T, onComment: z },
    ) {
      let {
          indent: A,
          options: { commentString: f },
        } = q,
        w = Object.assign({}, q, { indent: O, type: null }),
        Y = !1,
        D = [];
      for (let M = 0; M < _.length; ++M) {
        let J = _[M],
          P = null;
        if (jOH.isNode(J)) {
          if (!Y && J.spaceBefore) D.push("");
          if ((aR_(q, D, J.commentBefore, Y), J.comment)) P = J.comment;
        } else if (jOH.isPair(J)) {
          let R = jOH.isNode(J.key) ? J.key : null;
          if (R) {
            if (!Y && R.spaceBefore) D.push("");
            aR_(q, D, R.commentBefore, Y);
          }
        }
        Y = !1;
        let X = Nrq.stringify(
          J,
          w,
          () => (P = null),
          () => (Y = !0),
        );
        if (P) X += oR_.lineComment(X, O, f(P));
        if (Y && P) Y = !1;
        D.push($ + X);
      }
      let j;
      if (D.length === 0) j = K.start + K.end;
      else {
        j = D[0];
        for (let M = 1; M < D.length; ++M) {
          let J = D[M];
          j += J
            ? `
${A}${J}`
            : `
`;
        }
      }
      if (H) {
        if (
          ((j +=
            `
` + oR_.indentComment(f(H), A)),
          z)
        )
          z();
      } else if (Y && T) T();
      return j;
    }
    function lS4({ items: H }, _, { flowChars: q, itemIndent: $ }) {
      let {
        indent: K,
        indentStep: O,
        flowCollectionPadding: T,
        options: { commentString: z },
      } = _;
      $ += O;
      let A = Object.assign({}, _, { indent: $, inFlow: !0, type: null }),
        f = !1,
        w = 0,
        Y = [];
      for (let M = 0; M < H.length; ++M) {
        let J = H[M],
          P = null;
        if (jOH.isNode(J)) {
          if (J.spaceBefore) Y.push("");
          if ((aR_(_, Y, J.commentBefore, !1), J.comment)) P = J.comment;
        } else if (jOH.isPair(J)) {
          let R = jOH.isNode(J.key) ? J.key : null;
          if (R) {
            if (R.spaceBefore) Y.push("");
            if ((aR_(_, Y, R.commentBefore, !1), R.comment)) f = !0;
          }
          let W = jOH.isNode(J.value) ? J.value : null;
          if (W) {
            if (W.comment) P = W.comment;
            if (W.commentBefore) f = !0;
          } else if (J.value == null && R?.comment) P = R.comment;
        }
        if (P) f = !0;
        let X = Nrq.stringify(J, A, () => (P = null));
        if (M < H.length - 1) X += ",";
        if (P) X += oR_.lineComment(X, $, z(P));
        if (
          !f &&
          (Y.length > w ||
            X.includes(`
`))
        )
          f = !0;
        Y.push(X), (w = Y.length);
      }
      let { start: D, end: j } = q;
      if (Y.length === 0) return D + j;
      else {
        if (!f) {
          let M = Y.reduce((J, P) => J + P.length + 2, 2);
          f = _.options.lineWidth > 0 && M > _.options.lineWidth;
        }
        if (f) {
          let M = D;
          for (let J of Y)
            M += J
              ? `
${O}${K}${J}`
              : `
`;
          return `${M}
${K}${j}`;
        } else return `${D}${T}${Y.join(" ")}${T}${j}`;
      }
    }
    function aR_({ indent: H, options: { commentString: _ } }, q, $, K) {
      if ($ && K) $ = $.replace(/^\n+/, "");
      if ($) {
        let O = oR_.indentComment(_($), H);
        q.push(O.trimStart());
      }
    }
    hrq.stringifyCollection = US4;
  });
