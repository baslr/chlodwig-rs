  var QW_ = d((zE) => {
    Object.defineProperty(zE, "__esModule", { value: !0 });
    zE.resolveSchema = zE.getCompilingSchema = zE.resolveRef = zE.compileSchema = zE.SchemaEnv = void 0;
    var Nu = PK(),
      PP4 = FW_(),
      v3H = Wi(),
      hu = zFH(),
      Pmq = W3(),
      XP4 = wFH();
    class DFH {
      constructor(H) {
        var _;
        (this.refs = {}), (this.dynamicAnchors = {});
        let q;
        if (typeof H.schema == "object") q = H.schema;
        (this.schema = H.schema),
          (this.schemaId = H.schemaId),
          (this.root = H.root || this),
          (this.baseId =
            (_ = H.baseId) !== null && _ !== void 0
              ? _
              : (0, hu.normalizeId)(q === null || q === void 0 ? void 0 : q[H.schemaId || "$id"])),
          (this.schemaPath = H.schemaPath),
          (this.localRefs = H.localRefs),
          (this.meta = H.meta),
          (this.$async = q === null || q === void 0 ? void 0 : q.$async),
          (this.refs = {});
      }
    }
    zE.SchemaEnv = DFH;
    function VZ6(H) {
      let _ = Xmq.call(this, H);
      if (_) return _;
      let q = (0, hu.getFullPath)(this.opts.uriResolver, H.root.baseId),
        { es5: $, lines: K } = this.opts.code,
        { ownProperties: O } = this.opts,
        T = new Nu.CodeGen(this.scope, { es5: $, lines: K, ownProperties: O }),
        z;
      if (H.$async)
        z = T.scopeValue("Error", {
          ref: PP4.default,
          code: Nu._`require("ajv/dist/runtime/validation_error").default`,
        });
      let A = T.scopeName("validate");
      H.validateName = A;
      let f = {
          gen: T,
          allErrors: this.opts.allErrors,
          data: v3H.default.data,
          parentData: v3H.default.parentData,
          parentDataProperty: v3H.default.parentDataProperty,
          dataNames: [v3H.default.data],
          dataPathArr: [Nu.nil],
          dataLevel: 0,
          dataTypes: [],
          definedProperties: new Set(),
          topSchemaRef: T.scopeValue(
            "schema",
            this.opts.code.source === !0 ? { ref: H.schema, code: (0, Nu.stringify)(H.schema) } : { ref: H.schema },
          ),
          validateName: A,
          ValidationError: z,
          schema: H.schema,
          schemaEnv: H,
          rootId: q,
          baseId: H.baseId || q,
          schemaPath: Nu.nil,
          errSchemaPath: H.schemaPath || (this.opts.jtd ? "" : "#"),
          errorPath: Nu._`""`,
          opts: this.opts,
          self: this,
        },
        w;
      try {
        this._compilations.add(H), (0, XP4.validateFunctionCode)(f), T.optimize(this.opts.code.optimize);
        let Y = T.toString();
        if (((w = `${T.scopeRefs(v3H.default.scope)}return ${Y}`), this.opts.code.process))
          w = this.opts.code.process(w, H);
        let j = Function(`${v3H.default.self}`, `${v3H.default.scope}`, w)(this, this.scope.get());
        if ((this.scope.value(A, { ref: j }), (j.errors = null), (j.schema = H.schema), (j.schemaEnv = H), H.$async))
          j.$async = !0;
        if (this.opts.code.source === !0) j.source = { validateName: A, validateCode: Y, scopeValues: T._values };
        if (this.opts.unevaluated) {
          let { props: M, items: J } = f;
          if (
            ((j.evaluated = {
              props: M instanceof Nu.Name ? void 0 : M,
              items: J instanceof Nu.Name ? void 0 : J,
              dynamicProps: M instanceof Nu.Name,
              dynamicItems: J instanceof Nu.Name,
            }),
            j.source)
          )
            j.source.evaluated = (0, Nu.stringify)(j.evaluated);
        }
        return (H.validate = j), H;
      } catch (Y) {
        if ((delete H.validate, delete H.validateName, w))
          this.logger.error("Error compiling schema, function code:", w);
        throw Y;
      } finally {
        this._compilations.delete(H);
      }
    }
    zE.compileSchema = VZ6;
    function WP4(H, _, q) {
      var $;
      q = (0, hu.resolveUrl)(this.opts.uriResolver, _, q);
      let K = H.refs[q];
      if (K) return K;
      let O = ZP4.call(this, H, q);
      if (O === void 0) {
        let T = ($ = H.localRefs) === null || $ === void 0 ? void 0 : $[q],
          { schemaId: z } = this.opts;
        if (T) O = new DFH({ schema: T, schemaId: z, root: H, baseId: _ });
      }
      if (O === void 0) return;
      return (H.refs[q] = GP4.call(this, O));
    }
    zE.resolveRef = WP4;
    function GP4(H) {
      if ((0, hu.inlineRef)(H.schema, this.opts.inlineRefs)) return H.schema;
      return H.validate ? H : VZ6.call(this, H);
    }
    function Xmq(H) {
      for (let _ of this._compilations) if (RP4(_, H)) return _;
    }
    zE.getCompilingSchema = Xmq;
    function RP4(H, _) {
      return H.schema === _.schema && H.root === _.root && H.baseId === _.baseId;
    }
    function ZP4(H, _) {
      let q;
      while (typeof (q = this.refs[_]) == "string") _ = q;
      return q || this.schemas[_] || UW_.call(this, H, _);
    }
    function UW_(H, _) {
      let q = this.opts.uriResolver.parse(_),
        $ = (0, hu._getFullPath)(this.opts.uriResolver, q),
        K = (0, hu.getFullPath)(this.opts.uriResolver, H.baseId, void 0);
      if (Object.keys(H.schema).length > 0 && $ === K) return yZ6.call(this, q, H);
      let O = (0, hu.normalizeId)($),
        T = this.refs[O] || this.schemas[O];
      if (typeof T == "string") {
        let z = UW_.call(this, H, T);
        if (typeof (z === null || z === void 0 ? void 0 : z.schema) !== "object") return;
        return yZ6.call(this, q, z);
      }
      if (typeof (T === null || T === void 0 ? void 0 : T.schema) !== "object") return;
      if (!T.validate) VZ6.call(this, T);
      if (O === (0, hu.normalizeId)(_)) {
        let { schema: z } = T,
          { schemaId: A } = this.opts,
          f = z[A];
        if (f) K = (0, hu.resolveUrl)(this.opts.uriResolver, K, f);
        return new DFH({ schema: z, schemaId: A, root: H, baseId: K });
      }
      return yZ6.call(this, q, T);
    }
    zE.resolveSchema = UW_;
    var LP4 = new Set(["properties", "patternProperties", "enum", "dependencies", "definitions"]);
    function yZ6(H, { baseId: _, schema: q, root: $ }) {
      var K;
      if (((K = H.fragment) === null || K === void 0 ? void 0 : K[0]) !== "/") return;
      for (let z of H.fragment.slice(1).split("/")) {
        if (typeof q === "boolean") return;
        let A = q[(0, Pmq.unescapeFragment)(z)];
        if (A === void 0) return;
        q = A;
        let f = typeof q === "object" && q[this.opts.schemaId];
        if (!LP4.has(z) && f) _ = (0, hu.resolveUrl)(this.opts.uriResolver, _, f);
      }
      let O;
      if (typeof q != "boolean" && q.$ref && !(0, Pmq.schemaHasRulesButRef)(q, this.RULES)) {
        let z = (0, hu.resolveUrl)(this.opts.uriResolver, _, q.$ref);
        O = UW_.call(this, $, z);
      }
      let { schemaId: T } = this.opts;
      if (((O = O || new DFH({ schema: q, schemaId: T, root: $, baseId: _ })), O.schema !== O.root.schema)) return O;
      return;
    }
  });
