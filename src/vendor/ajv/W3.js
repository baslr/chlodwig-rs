  var W3 = d((iK) => {
    Object.defineProperty(iK, "__esModule", { value: !0 });
    iK.checkStrictMode =
      iK.getErrorPath =
      iK.Type =
      iK.useFunc =
      iK.setEvaluated =
      iK.evaluatedPropsToName =
      iK.mergeEvaluated =
      iK.eachItem =
      iK.unescapeJsonPointer =
      iK.escapeJsonPointer =
      iK.escapeFragment =
      iK.unescapeFragment =
      iK.schemaRefOrVal =
      iK.schemaHasRulesButRef =
      iK.schemaHasRules =
      iK.checkUnknownRules =
      iK.alwaysValidSchema =
      iK.toHash =
        void 0;
    var $A = PK(),
      hM4 = $FH();
    function yM4(H) {
      let _ = {};
      for (let q of H) _[q] = !0;
      return _;
    }
    iK.toHash = yM4;
    function VM4(H, _) {
      if (typeof _ == "boolean") return _;
      if (Object.keys(_).length === 0) return !0;
      return vxq(H, _), !Nxq(_, H.self.RULES.all);
    }
    iK.alwaysValidSchema = VM4;
    function vxq(H, _ = H.schema) {
      let { opts: q, self: $ } = H;
      if (!q.strictSchema) return;
      if (typeof _ === "boolean") return;
      let K = $.RULES.keywords;
      for (let O in _) if (!K[O]) Vxq(H, `unknown keyword: "${O}"`);
    }
    iK.checkUnknownRules = vxq;
    function Nxq(H, _) {
      if (typeof H == "boolean") return !H;
      for (let q in H) if (_[q]) return !0;
      return !1;
    }
    iK.schemaHasRules = Nxq;
    function SM4(H, _) {
      if (typeof H == "boolean") return !H;
      for (let q in H) if (q !== "$ref" && _.all[q]) return !0;
      return !1;
    }
    iK.schemaHasRulesButRef = SM4;
    function EM4({ topSchemaRef: H, schemaPath: _ }, q, $, K) {
      if (!K) {
        if (typeof q == "number" || typeof q == "boolean") return q;
        if (typeof q == "string") return $A._`${q}`;
      }
      return $A._`${H}${_}${(0, $A.getProperty)($)}`;
    }
    iK.schemaRefOrVal = EM4;
    function CM4(H) {
      return hxq(decodeURIComponent(H));
    }
    iK.unescapeFragment = CM4;
    function bM4(H) {
      return encodeURIComponent(zZ6(H));
    }
    iK.escapeFragment = bM4;
    function zZ6(H) {
      if (typeof H == "number") return `${H}`;
      return H.replace(/~/g, "~0").replace(/\//g, "~1");
    }
    iK.escapeJsonPointer = zZ6;
    function hxq(H) {
      return H.replace(/~1/g, "/").replace(/~0/g, "~");
    }
    iK.unescapeJsonPointer = hxq;
    function IM4(H, _) {
      if (Array.isArray(H)) for (let q of H) _(q);
      else _(H);
    }
    iK.eachItem = IM4;
    function Lxq({ mergeNames: H, mergeToName: _, mergeValues: q, resultToName: $ }) {
      return (K, O, T, z) => {
        let A =
          T === void 0
            ? O
            : T instanceof $A.Name
              ? (O instanceof $A.Name ? H(K, O, T) : _(K, O, T), T)
              : O instanceof $A.Name
                ? (_(K, T, O), O)
                : q(O, T);
        return z === $A.Name && !(A instanceof $A.Name) ? $(K, A) : A;
      };
    }
    iK.mergeEvaluated = {
      props: Lxq({
        mergeNames: (H, _, q) =>
          H.if($A._`${q} !== true && ${_} !== undefined`, () => {
            H.if(
              $A._`${_} === true`,
              () => H.assign(q, !0),
              () => H.assign(q, $A._`${q} || {}`).code($A._`Object.assign(${q}, ${_})`),
            );
          }),
        mergeToName: (H, _, q) =>
          H.if($A._`${q} !== true`, () => {
            if (_ === !0) H.assign(q, !0);
            else H.assign(q, $A._`${q} || {}`), AZ6(H, q, _);
          }),
        mergeValues: (H, _) => (H === !0 ? !0 : { ...H, ..._ }),
        resultToName: yxq,
      }),
      items: Lxq({
        mergeNames: (H, _, q) =>
          H.if($A._`${q} !== true && ${_} !== undefined`, () =>
            H.assign(q, $A._`${_} === true ? true : ${q} > ${_} ? ${q} : ${_}`),
          ),
        mergeToName: (H, _, q) =>
          H.if($A._`${q} !== true`, () => H.assign(q, _ === !0 ? !0 : $A._`${q} > ${_} ? ${q} : ${_}`)),
        mergeValues: (H, _) => (H === !0 ? !0 : Math.max(H, _)),
        resultToName: (H, _) => H.var("items", _),
      }),
    };
    function yxq(H, _) {
      if (_ === !0) return H.var("props", !0);
      let q = H.var("props", $A._`{}`);
      if (_ !== void 0) AZ6(H, q, _);
      return q;
    }
    iK.evaluatedPropsToName = yxq;
    function AZ6(H, _, q) {
      Object.keys(q).forEach(($) => H.assign($A._`${_}${(0, $A.getProperty)($)}`, !0));
    }
    iK.setEvaluated = AZ6;
    var kxq = {};
    function uM4(H, _) {
      return H.scopeValue("func", { ref: _, code: kxq[_.code] || (kxq[_.code] = new hM4._Code(_.code)) });
    }
    iK.useFunc = uM4;
    var TZ6;
    (function (H) {
      (H[(H.Num = 0)] = "Num"), (H[(H.Str = 1)] = "Str");
    })(TZ6 || (iK.Type = TZ6 = {}));
    function xM4(H, _, q) {
      if (H instanceof $A.Name) {
        let $ = _ === TZ6.Num;
        return q
          ? $
            ? $A._`"[" + ${H} + "]"`
            : $A._`"['" + ${H} + "']"`
          : $
            ? $A._`"/" + ${H}`
            : $A._`"/" + ${H}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
      }
      return q ? (0, $A.getProperty)(H).toString() : "/" + zZ6(H);
    }
    iK.getErrorPath = xM4;
    function Vxq(H, _, q = H.opts.strictSchema) {
      if (!q) return;
      if (((_ = `strict mode: ${_}`), q === !0)) throw Error(_);
      H.self.logger.warn(_);
    }
    iK.checkStrictMode = Vxq;
  });
