  var OFH = d((qG) => {
    Object.defineProperty(qG, "__esModule", { value: !0 });
    qG.extendErrors =
      qG.resetErrorsCount =
      qG.reportExtraError =
      qG.reportError =
      qG.keyword$DataError =
      qG.keywordError =
        void 0;
    var G3 = PK(),
      BW_ = W3(),
      WZ = Wi();
    qG.keywordError = { message: ({ keyword: H }) => G3.str`must pass "${H}" keyword validation` };
    qG.keyword$DataError = {
      message: ({ keyword: H, schemaType: _ }) =>
        _ ? G3.str`"${H}" keyword must be ${_} ($data)` : G3.str`"${H}" keyword is invalid ($data)`,
    };
    function pM4(H, _ = qG.keywordError, q, $) {
      let { it: K } = H,
        { gen: O, compositeRule: T, allErrors: z } = K,
        A = Cxq(H, _, q);
      if ($ !== null && $ !== void 0 ? $ : T || z) Sxq(O, A);
      else Exq(K, G3._`[${A}]`);
    }
    qG.reportError = pM4;
    function BM4(H, _ = qG.keywordError, q) {
      let { it: $ } = H,
        { gen: K, compositeRule: O, allErrors: T } = $,
        z = Cxq(H, _, q);
      if ((Sxq(K, z), !(O || T))) Exq($, WZ.default.vErrors);
    }
    qG.reportExtraError = BM4;
    function gM4(H, _) {
      H.assign(WZ.default.errors, _),
        H.if(G3._`${WZ.default.vErrors} !== null`, () =>
          H.if(
            _,
            () => H.assign(G3._`${WZ.default.vErrors}.length`, _),
            () => H.assign(WZ.default.vErrors, null),
          ),
        );
    }
    qG.resetErrorsCount = gM4;
    function dM4({ gen: H, keyword: _, schemaValue: q, data: $, errsCount: K, it: O }) {
      if (K === void 0) throw Error("ajv implementation error");
      let T = H.name("err");
      H.forRange("i", K, WZ.default.errors, (z) => {
        if (
          (H.const(T, G3._`${WZ.default.vErrors}[${z}]`),
          H.if(G3._`${T}.instancePath === undefined`, () =>
            H.assign(G3._`${T}.instancePath`, (0, G3.strConcat)(WZ.default.instancePath, O.errorPath)),
          ),
          H.assign(G3._`${T}.schemaPath`, G3.str`${O.errSchemaPath}/${_}`),
          O.opts.verbose)
        )
          H.assign(G3._`${T}.schema`, q), H.assign(G3._`${T}.data`, $);
      });
    }
    qG.extendErrors = dM4;
    function Sxq(H, _) {
      let q = H.const("err", _);
      H.if(
        G3._`${WZ.default.vErrors} === null`,
        () => H.assign(WZ.default.vErrors, G3._`[${q}]`),
        G3._`${WZ.default.vErrors}.push(${q})`,
      ),
        H.code(G3._`${WZ.default.errors}++`);
    }
    function Exq(H, _) {
      let { gen: q, validateName: $, schemaEnv: K } = H;
      if (K.$async) q.throw(G3._`new ${H.ValidationError}(${_})`);
      else q.assign(G3._`${$}.errors`, _), q.return(!1);
    }
    var L3H = {
      keyword: new G3.Name("keyword"),
      schemaPath: new G3.Name("schemaPath"),
      params: new G3.Name("params"),
      propertyName: new G3.Name("propertyName"),
      message: new G3.Name("message"),
      schema: new G3.Name("schema"),
      parentSchema: new G3.Name("parentSchema"),
    };
    function Cxq(H, _, q) {
      let { createErrors: $ } = H.it;
      if ($ === !1) return G3._`{}`;
      return cM4(H, _, q);
    }
    function cM4(H, _, q = {}) {
      let { gen: $, it: K } = H,
        O = [FM4(K, q), UM4(H, q)];
      return QM4(H, _, O), $.object(...O);
    }
    function FM4({ errorPath: H }, { instancePath: _ }) {
      let q = _ ? G3.str`${H}${(0, BW_.getErrorPath)(_, BW_.Type.Str)}` : H;
      return [WZ.default.instancePath, (0, G3.strConcat)(WZ.default.instancePath, q)];
    }
    function UM4({ keyword: H, it: { errSchemaPath: _ } }, { schemaPath: q, parentSchema: $ }) {
      let K = $ ? _ : G3.str`${_}/${H}`;
      if (q) K = G3.str`${K}${(0, BW_.getErrorPath)(q, BW_.Type.Str)}`;
      return [L3H.schemaPath, K];
    }
    function QM4(H, { params: _, message: q }, $) {
      let { keyword: K, data: O, schemaValue: T, it: z } = H,
        { opts: A, propertyName: f, topSchemaRef: w, schemaPath: Y } = z;
      if (($.push([L3H.keyword, K], [L3H.params, typeof _ == "function" ? _(H) : _ || G3._`{}`]), A.messages))
        $.push([L3H.message, typeof q == "function" ? q(H) : q]);
      if (A.verbose) $.push([L3H.schema, T], [L3H.parentSchema, G3._`${w}${Y}`], [WZ.default.data, O]);
      if (f) $.push([L3H.propertyName, f]);
    }
  });
