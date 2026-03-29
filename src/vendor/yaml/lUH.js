  var lUH = d((ch6) => {
    var gM = R3(),
      mk = Symbol("break visit"),
      Qnq = Symbol("skip children"),
      mg = Symbol("remove node");
    function bR_(H, _) {
      let q = lnq(_);
      if (gM.isDocument(H)) {
        if (PGH(null, H.contents, q, Object.freeze([H])) === mg) H.contents = null;
      } else PGH(null, H, q, Object.freeze([]));
    }
    bR_.BREAK = mk;
    bR_.SKIP = Qnq;
    bR_.REMOVE = mg;
    function PGH(H, _, q, $) {
      let K = inq(H, _, q, $);
      if (gM.isNode(K) || gM.isPair(K)) return nnq(H, $, K), PGH(H, K, q, $);
      if (typeof K !== "symbol") {
        if (gM.isCollection(_)) {
          $ = Object.freeze($.concat(_));
          for (let O = 0; O < _.items.length; ++O) {
            let T = PGH(O, _.items[O], q, $);
            if (typeof T === "number") O = T - 1;
            else if (T === mk) return mk;
            else if (T === mg) _.items.splice(O, 1), (O -= 1);
          }
        } else if (gM.isPair(_)) {
          $ = Object.freeze($.concat(_));
          let O = PGH("key", _.key, q, $);
          if (O === mk) return mk;
          else if (O === mg) _.key = null;
          let T = PGH("value", _.value, q, $);
          if (T === mk) return mk;
          else if (T === mg) _.value = null;
        }
      }
      return K;
    }
    async function IR_(H, _) {
      let q = lnq(_);
      if (gM.isDocument(H)) {
        if ((await XGH(null, H.contents, q, Object.freeze([H]))) === mg) H.contents = null;
      } else await XGH(null, H, q, Object.freeze([]));
    }
    IR_.BREAK = mk;
    IR_.SKIP = Qnq;
    IR_.REMOVE = mg;
    async function XGH(H, _, q, $) {
      let K = await inq(H, _, q, $);
      if (gM.isNode(K) || gM.isPair(K)) return nnq(H, $, K), XGH(H, K, q, $);
      if (typeof K !== "symbol") {
        if (gM.isCollection(_)) {
          $ = Object.freeze($.concat(_));
          for (let O = 0; O < _.items.length; ++O) {
            let T = await XGH(O, _.items[O], q, $);
            if (typeof T === "number") O = T - 1;
            else if (T === mk) return mk;
            else if (T === mg) _.items.splice(O, 1), (O -= 1);
          }
        } else if (gM.isPair(_)) {
          $ = Object.freeze($.concat(_));
          let O = await XGH("key", _.key, q, $);
          if (O === mk) return mk;
          else if (O === mg) _.key = null;
          let T = await XGH("value", _.value, q, $);
          if (T === mk) return mk;
          else if (T === mg) _.value = null;
        }
      }
      return K;
    }
    function lnq(H) {
      if (typeof H === "object" && (H.Collection || H.Node || H.Value))
        return Object.assign(
          { Alias: H.Node, Map: H.Node, Scalar: H.Node, Seq: H.Node },
          H.Value && { Map: H.Value, Scalar: H.Value, Seq: H.Value },
          H.Collection && { Map: H.Collection, Seq: H.Collection },
          H,
        );
      return H;
    }
    function inq(H, _, q, $) {
      if (typeof q === "function") return q(H, _, $);
      if (gM.isMap(_)) return q.Map?.(H, _, $);
      if (gM.isSeq(_)) return q.Seq?.(H, _, $);
      if (gM.isPair(_)) return q.Pair?.(H, _, $);
      if (gM.isScalar(_)) return q.Scalar?.(H, _, $);
      if (gM.isAlias(_)) return q.Alias?.(H, _, $);
      return;
    }
    function nnq(H, _, q) {
      let $ = _[_.length - 1];
      if (gM.isCollection($)) $.items[H] = q;
      else if (gM.isPair($))
        if (H === "key") $.key = q;
        else $.value = q;
      else if (gM.isDocument($)) $.contents = q;
      else {
        let K = gM.isAlias($) ? "alias" : "scalar";
        throw Error(`Cannot replace node with ${K} parent`);
      }
    }
    ch6.visit = bR_;
    ch6.visitAsync = IR_;
  });
