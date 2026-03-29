  var smq = d((N3H) => {
    Object.defineProperty(N3H, "__esModule", { value: !0 });
    N3H.callRef = N3H.getValidate = void 0;
    var LX4 = YFH(),
      rmq = TE(),
      Sk = PK(),
      z0H = Wi(),
      omq = QW_(),
      aW_ = W3(),
      kX4 = {
        keyword: "$ref",
        schemaType: "string",
        code(H) {
          let { gen: _, schema: q, it: $ } = H,
            { baseId: K, schemaEnv: O, validateName: T, opts: z, self: A } = $,
            { root: f } = O;
          if ((q === "#" || q === "#/") && K === f.baseId) return Y();
          let w = omq.resolveRef.call(A, f, K, q);
          if (w === void 0) throw new LX4.default($.opts.uriResolver, K, q);
          if (w instanceof omq.SchemaEnv) return D(w);
          return j(w);
          function Y() {
            if (O === f) return sW_(H, T, O, O.$async);
            let M = _.scopeValue("root", { ref: f });
            return sW_(H, Sk._`${M}.validate`, f, f.$async);
          }
          function D(M) {
            let J = amq(H, M);
            sW_(H, J, M, M.$async);
          }
          function j(M) {
            let J = _.scopeValue("schema", z.code.source === !0 ? { ref: M, code: (0, Sk.stringify)(M) } : { ref: M }),
              P = _.name("valid"),
              X = H.subschema({ schema: M, dataTypes: [], schemaPath: Sk.nil, topSchemaRef: J, errSchemaPath: q }, P);
            H.mergeEvaluated(X), H.ok(P);
          }
        },
      };
    function amq(H, _) {
      let { gen: q } = H;
      return _.validate
        ? q.scopeValue("validate", { ref: _.validate })
        : Sk._`${q.scopeValue("wrapper", { ref: _ })}.validate`;
    }
    N3H.getValidate = amq;
    function sW_(H, _, q, $) {
      let { gen: K, it: O } = H,
        { allErrors: T, schemaEnv: z, opts: A } = O,
        f = A.passContext ? z0H.default.this : Sk.nil;
      if ($) w();
      else Y();
      function w() {
        if (!z.$async) throw Error("async schema referenced by sync schema");
        let M = K.let("valid");
        K.try(
          () => {
            if ((K.code(Sk._`await ${(0, rmq.callValidateCode)(H, _, f)}`), j(_), !T)) K.assign(M, !0);
          },
          (J) => {
            if ((K.if(Sk._`!(${J} instanceof ${O.ValidationError})`, () => K.throw(J)), D(J), !T)) K.assign(M, !1);
          },
        ),
          H.ok(M);
      }
      function Y() {
        H.result(
          (0, rmq.callValidateCode)(H, _, f),
          () => j(_),
          () => D(_),
        );
      }
      function D(M) {
        let J = Sk._`${M}.errors`;
        K.assign(
          z0H.default.vErrors,
          Sk._`${z0H.default.vErrors} === null ? ${J} : ${z0H.default.vErrors}.concat(${J})`,
        ),
          K.assign(z0H.default.errors, Sk._`${z0H.default.vErrors}.length`);
      }
      function j(M) {
        var J;
        if (!O.opts.unevaluated) return;
        let P = (J = q === null || q === void 0 ? void 0 : q.validate) === null || J === void 0 ? void 0 : J.evaluated;
        if (O.props !== !0)
          if (P && !P.dynamicProps) {
            if (P.props !== void 0) O.props = aW_.mergeEvaluated.props(K, P.props, O.props);
          } else {
            let X = K.var("props", Sk._`${M}.evaluated.props`);
            O.props = aW_.mergeEvaluated.props(K, X, O.props, Sk.Name);
          }
        if (O.items !== !0)
          if (P && !P.dynamicItems) {
            if (P.items !== void 0) O.items = aW_.mergeEvaluated.items(K, P.items, O.items);
          } else {
            let X = K.var("items", Sk._`${M}.evaluated.items`);
            O.items = aW_.mergeEvaluated.items(K, X, O.items, Sk.Name);
          }
      }
    }
    N3H.callRef = sW_;
    N3H.default = kX4;
  });
