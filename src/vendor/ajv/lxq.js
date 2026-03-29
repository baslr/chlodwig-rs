  var lxq = d((Mg) => {
    Object.defineProperty(Mg, "__esModule", { value: !0 });
    Mg.validateKeywordUsage = Mg.validSchemaType = Mg.funcKeywordCode = Mg.macroKeywordCode = void 0;
    var GZ = PK(),
      k3H = Wi(),
      NJ4 = TE(),
      hJ4 = OFH();
    function yJ4(H, _) {
      let { gen: q, keyword: $, schema: K, parentSchema: O, it: T } = H,
        z = _.macro.call(T.self, K, O, T),
        A = Qxq(q, $, z);
      if (T.opts.validateSchema !== !1) T.self.validateSchema(z, !0);
      let f = q.name("valid");
      H.subschema(
        { schema: z, schemaPath: GZ.nil, errSchemaPath: `${T.errSchemaPath}/${$}`, topSchemaRef: A, compositeRule: !0 },
        f,
      ),
        H.pass(f, () => H.error(!0));
    }
    Mg.macroKeywordCode = yJ4;
    function VJ4(H, _) {
      var q;
      let { gen: $, keyword: K, schema: O, parentSchema: T, $data: z, it: A } = H;
      EJ4(A, _);
      let f = !z && _.compile ? _.compile.call(A.self, O, T, A) : _.validate,
        w = Qxq($, K, f),
        Y = $.let("valid");
      H.block$data(Y, D), H.ok((q = _.valid) !== null && q !== void 0 ? q : Y);
      function D() {
        if (_.errors === !1) {
          if ((J(), _.modifying)) Uxq(H);
          P(() => H.error());
        } else {
          let X = _.async ? j() : M();
          if (_.modifying) Uxq(H);
          P(() => SJ4(H, X));
        }
      }
      function j() {
        let X = $.let("ruleErrs", null);
        return (
          $.try(
            () => J(GZ._`await `),
            (R) =>
              $.assign(Y, !1).if(
                GZ._`${R} instanceof ${A.ValidationError}`,
                () => $.assign(X, GZ._`${R}.errors`),
                () => $.throw(R),
              ),
          ),
          X
        );
      }
      function M() {
        let X = GZ._`${w}.errors`;
        return $.assign(X, null), J(GZ.nil), X;
      }
      function J(X = _.async ? GZ._`await ` : GZ.nil) {
        let R = A.opts.passContext ? k3H.default.this : k3H.default.self,
          W = !(("compile" in _ && !z) || _.schema === !1);
        $.assign(Y, GZ._`${X}${(0, NJ4.callValidateCode)(H, w, R, W)}`, _.modifying);
      }
      function P(X) {
        var R;
        $.if((0, GZ.not)((R = _.valid) !== null && R !== void 0 ? R : Y), X);
      }
    }
    Mg.funcKeywordCode = VJ4;
    function Uxq(H) {
      let { gen: _, data: q, it: $ } = H;
      _.if($.parentData, () => _.assign(q, GZ._`${$.parentData}[${$.parentDataProperty}]`));
    }
    function SJ4(H, _) {
      let { gen: q } = H;
      q.if(
        GZ._`Array.isArray(${_})`,
        () => {
          q
            .assign(
              k3H.default.vErrors,
              GZ._`${k3H.default.vErrors} === null ? ${_} : ${k3H.default.vErrors}.concat(${_})`,
            )
            .assign(k3H.default.errors, GZ._`${k3H.default.vErrors}.length`),
            (0, hJ4.extendErrors)(H);
        },
        () => H.error(),
      );
    }
    function EJ4({ schemaEnv: H }, _) {
      if (_.async && !H.$async) throw Error("async keyword in sync schema");
    }
    function Qxq(H, _, q) {
      if (q === void 0) throw Error(`keyword "${_}" failed to compile`);
      return H.scopeValue("keyword", typeof q == "function" ? { ref: q } : { ref: q, code: (0, GZ.stringify)(q) });
    }
    function CJ4(H, _, q = !1) {
      return (
        !_.length ||
        _.some(($) =>
          $ === "array"
            ? Array.isArray(H)
            : $ === "object"
              ? H && typeof H == "object" && !Array.isArray(H)
              : typeof H == $ || (q && typeof H > "u"),
        )
      );
    }
    Mg.validSchemaType = CJ4;
    function bJ4({ schema: H, opts: _, self: q, errSchemaPath: $ }, K, O) {
      if (Array.isArray(K.keyword) ? !K.keyword.includes(O) : K.keyword !== O) throw Error("ajv implementation error");
      let T = K.dependencies;
      if (T === null || T === void 0 ? void 0 : T.some((z) => !Object.prototype.hasOwnProperty.call(H, z)))
        throw Error(`parent schema must have dependencies of ${O}: ${T.join(",")}`);
      if (K.validateSchema) {
        if (!K.validateSchema(H[O])) {
          let A = `keyword "${O}" value is invalid at path "${$}": ` + q.errorsText(K.validateSchema.errors);
          if (_.validateSchema === "log") q.logger.error(A);
          else throw Error(A);
        }
      }
    }
    Mg.validateKeywordUsage = bJ4;
  });
