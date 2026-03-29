  var wFH = d((v_H) => {
    Object.defineProperty(v_H, "__esModule", { value: !0 });
    v_H.getData = v_H.KeywordCxt = v_H.validateFunctionCode = void 0;
    var Kmq = Ixq(),
      Hmq = TFH(),
      ZZ6 = YZ6(),
      cW_ = TFH(),
      nJ4 = dxq(),
      fFH = lxq(),
      RZ6 = nxq(),
      u9 = PK(),
      b4 = Wi(),
      rJ4 = zFH(),
      Gi = W3(),
      AFH = OFH();
    function oJ4(H) {
      if (zmq(H)) {
        if ((Amq(H), Tmq(H))) {
          tJ4(H);
          return;
        }
      }
      Omq(H, () => (0, Kmq.topBoolOrEmptySchema)(H));
    }
    v_H.validateFunctionCode = oJ4;
    function Omq({ gen: H, validateName: _, schema: q, schemaEnv: $, opts: K }, O) {
      if (K.code.es5)
        H.func(_, u9._`${b4.default.data}, ${b4.default.valCxt}`, $.$async, () => {
          H.code(u9._`"use strict"; ${_mq(q, K)}`), sJ4(H, K), H.code(O);
        });
      else H.func(_, u9._`${b4.default.data}, ${aJ4(K)}`, $.$async, () => H.code(_mq(q, K)).code(O));
    }
    function aJ4(H) {
      return u9._`{${b4.default.instancePath}="", ${b4.default.parentData}, ${b4.default.parentDataProperty}, ${b4.default.rootData}=${b4.default.data}${H.dynamicRef ? u9._`, ${b4.default.dynamicAnchors}={}` : u9.nil}}={}`;
    }
    function sJ4(H, _) {
      H.if(
        b4.default.valCxt,
        () => {
          if (
            (H.var(b4.default.instancePath, u9._`${b4.default.valCxt}.${b4.default.instancePath}`),
            H.var(b4.default.parentData, u9._`${b4.default.valCxt}.${b4.default.parentData}`),
            H.var(b4.default.parentDataProperty, u9._`${b4.default.valCxt}.${b4.default.parentDataProperty}`),
            H.var(b4.default.rootData, u9._`${b4.default.valCxt}.${b4.default.rootData}`),
            _.dynamicRef)
          )
            H.var(b4.default.dynamicAnchors, u9._`${b4.default.valCxt}.${b4.default.dynamicAnchors}`);
        },
        () => {
          if (
            (H.var(b4.default.instancePath, u9._`""`),
            H.var(b4.default.parentData, u9._`undefined`),
            H.var(b4.default.parentDataProperty, u9._`undefined`),
            H.var(b4.default.rootData, b4.default.data),
            _.dynamicRef)
          )
            H.var(b4.default.dynamicAnchors, u9._`{}`);
        },
      );
    }
    function tJ4(H) {
      let { schema: _, opts: q, gen: $ } = H;
      Omq(H, () => {
        if (q.$comment && _.$comment) wmq(H);
        if (($P4(H), $.let(b4.default.vErrors, null), $.let(b4.default.errors, 0), q.unevaluated)) eJ4(H);
        fmq(H), TP4(H);
      });
      return;
    }
    function eJ4(H) {
      let { gen: _, validateName: q } = H;
      (H.evaluated = _.const("evaluated", u9._`${q}.evaluated`)),
        _.if(u9._`${H.evaluated}.dynamicProps`, () => _.assign(u9._`${H.evaluated}.props`, u9._`undefined`)),
        _.if(u9._`${H.evaluated}.dynamicItems`, () => _.assign(u9._`${H.evaluated}.items`, u9._`undefined`));
    }
    function _mq(H, _) {
      let q = typeof H == "object" && H[_.schemaId];
      return q && (_.code.source || _.code.process) ? u9._`/*# sourceURL=${q} */` : u9.nil;
    }
    function HP4(H, _) {
      if (zmq(H)) {
        if ((Amq(H), Tmq(H))) {
          _P4(H, _);
          return;
        }
      }
      (0, Kmq.boolOrEmptySchema)(H, _);
    }
    function Tmq({ schema: H, self: _ }) {
      if (typeof H == "boolean") return !H;
      for (let q in H) if (_.RULES.all[q]) return !0;
      return !1;
    }
    function zmq(H) {
      return typeof H.schema != "boolean";
    }
    function _P4(H, _) {
      let { schema: q, gen: $, opts: K } = H;
      if (K.$comment && q.$comment) wmq(H);
      KP4(H), OP4(H);
      let O = $.const("_errs", b4.default.errors);
      fmq(H, O), $.var(_, u9._`${O} === ${b4.default.errors}`);
    }
    function Amq(H) {
      (0, Gi.checkUnknownRules)(H), qP4(H);
    }
    function fmq(H, _) {
      if (H.opts.jtd) return qmq(H, [], !1, _);
      let q = (0, Hmq.getSchemaTypes)(H.schema),
        $ = (0, Hmq.coerceAndCheckDataType)(H, q);
      qmq(H, q, !$, _);
    }
    function qP4(H) {
      let { schema: _, errSchemaPath: q, opts: $, self: K } = H;
      if (_.$ref && $.ignoreKeywordsWithRef && (0, Gi.schemaHasRulesButRef)(_, K.RULES))
        K.logger.warn(`$ref: keywords ignored in schema at path "${q}"`);
    }
    function $P4(H) {
      let { schema: _, opts: q } = H;
      if (_.default !== void 0 && q.useDefaults && q.strictSchema)
        (0, Gi.checkStrictMode)(H, "default is ignored in the schema root");
    }
    function KP4(H) {
      let _ = H.schema[H.opts.schemaId];
      if (_) H.baseId = (0, rJ4.resolveUrl)(H.opts.uriResolver, H.baseId, _);
    }
    function OP4(H) {
      if (H.schema.$async && !H.schemaEnv.$async) throw Error("async schema in sync schema");
    }
    function wmq({ gen: H, schemaEnv: _, schema: q, errSchemaPath: $, opts: K }) {
      let O = q.$comment;
      if (K.$comment === !0) H.code(u9._`${b4.default.self}.logger.log(${O})`);
      else if (typeof K.$comment == "function") {
        let T = u9.str`${$}/$comment`,
          z = H.scopeValue("root", { ref: _.root });
        H.code(u9._`${b4.default.self}.opts.$comment(${O}, ${T}, ${z}.schema)`);
      }
    }
    function TP4(H) {
      let { gen: _, schemaEnv: q, validateName: $, ValidationError: K, opts: O } = H;
      if (q.$async)
        _.if(
          u9._`${b4.default.errors} === 0`,
          () => _.return(b4.default.data),
          () => _.throw(u9._`new ${K}(${b4.default.vErrors})`),
        );
      else {
        if ((_.assign(u9._`${$}.errors`, b4.default.vErrors), O.unevaluated)) zP4(H);
        _.return(u9._`${b4.default.errors} === 0`);
      }
    }
    function zP4({ gen: H, evaluated: _, props: q, items: $ }) {
      if (q instanceof u9.Name) H.assign(u9._`${_}.props`, q);
      if ($ instanceof u9.Name) H.assign(u9._`${_}.items`, $);
    }
    function qmq(H, _, q, $) {
      let { gen: K, schema: O, data: T, allErrors: z, opts: A, self: f } = H,
        { RULES: w } = f;
      if (O.$ref && (A.ignoreKeywordsWithRef || !(0, Gi.schemaHasRulesButRef)(O, w))) {
        K.block(() => Dmq(H, "$ref", w.all.$ref.definition));
        return;
      }
      if (!A.jtd) AP4(H, _);
      K.block(() => {
        for (let D of w.rules) Y(D);
        Y(w.post);
      });
      function Y(D) {
        if (!(0, ZZ6.shouldUseGroup)(O, D)) return;
        if (D.type) {
          if (
            (K.if((0, cW_.checkDataType)(D.type, T, A.strictNumbers)),
            $mq(H, D),
            _.length === 1 && _[0] === D.type && q)
          )
            K.else(), (0, cW_.reportTypeError)(H);
          K.endIf();
        } else $mq(H, D);
        if (!z) K.if(u9._`${b4.default.errors} === ${$ || 0}`);
      }
    }
    function $mq(H, _) {
      let {
        gen: q,
        schema: $,
        opts: { useDefaults: K },
      } = H;
      if (K) (0, nJ4.assignDefaults)(H, _.type);
      q.block(() => {
        for (let O of _.rules) if ((0, ZZ6.shouldUseRule)($, O)) Dmq(H, O.keyword, O.definition, _.type);
      });
    }
    function AP4(H, _) {
      if (H.schemaEnv.meta || !H.opts.strictTypes) return;
      if ((fP4(H, _), !H.opts.allowUnionTypes)) wP4(H, _);
      YP4(H, H.dataTypes);
    }
    function fP4(H, _) {
      if (!_.length) return;
      if (!H.dataTypes.length) {
        H.dataTypes = _;
        return;
      }
      _.forEach((q) => {
        if (!Ymq(H.dataTypes, q)) LZ6(H, `type "${q}" not allowed by context "${H.dataTypes.join(",")}"`);
      }),
        jP4(H, _);
    }
    function wP4(H, _) {
      if (_.length > 1 && !(_.length === 2 && _.includes("null")))
        LZ6(H, "use allowUnionTypes to allow union type keyword");
    }
    function YP4(H, _) {
      let q = H.self.RULES.all;
      for (let $ in q) {
        let K = q[$];
        if (typeof K == "object" && (0, ZZ6.shouldUseRule)(H.schema, K)) {
          let { type: O } = K.definition;
          if (O.length && !O.some((T) => DP4(_, T))) LZ6(H, `missing type "${O.join(",")}" for keyword "${$}"`);
        }
      }
    }
    function DP4(H, _) {
      return H.includes(_) || (_ === "number" && H.includes("integer"));
    }
    function Ymq(H, _) {
      return H.includes(_) || (_ === "integer" && H.includes("number"));
    }
    function jP4(H, _) {
      let q = [];
      for (let $ of H.dataTypes)
        if (Ymq(_, $)) q.push($);
        else if (_.includes("integer") && $ === "number") q.push("integer");
      H.dataTypes = q;
    }
    function LZ6(H, _) {
      let q = H.schemaEnv.baseId + H.errSchemaPath;
      (_ += ` at "${q}" (strictTypes)`), (0, Gi.checkStrictMode)(H, _, H.opts.strictTypes);
    }
    class kZ6 {
      constructor(H, _, q) {
        if (
          ((0, fFH.validateKeywordUsage)(H, _, q),
          (this.gen = H.gen),
          (this.allErrors = H.allErrors),
          (this.keyword = q),
          (this.data = H.data),
          (this.schema = H.schema[q]),
          (this.$data = _.$data && H.opts.$data && this.schema && this.schema.$data),
          (this.schemaValue = (0, Gi.schemaRefOrVal)(H, this.schema, q, this.$data)),
          (this.schemaType = _.schemaType),
          (this.parentSchema = H.schema),
          (this.params = {}),
          (this.it = H),
          (this.def = _),
          this.$data)
        )
          this.schemaCode = H.gen.const("vSchema", jmq(this.$data, H));
        else if (
          ((this.schemaCode = this.schemaValue), !(0, fFH.validSchemaType)(this.schema, _.schemaType, _.allowUndefined))
        )
          throw Error(`${q} value must be ${JSON.stringify(_.schemaType)}`);
        if ("code" in _ ? _.trackErrors : _.errors !== !1) this.errsCount = H.gen.const("_errs", b4.default.errors);
      }
      result(H, _, q) {
        this.failResult((0, u9.not)(H), _, q);
      }
      failResult(H, _, q) {
        if ((this.gen.if(H), q)) q();
        else this.error();
        if (_) {
          if ((this.gen.else(), _(), this.allErrors)) this.gen.endIf();
        } else if (this.allErrors) this.gen.endIf();
        else this.gen.else();
      }
      pass(H, _) {
        this.failResult((0, u9.not)(H), void 0, _);
      }
      fail(H) {
        if (H === void 0) {
          if ((this.error(), !this.allErrors)) this.gen.if(!1);
          return;
        }
        if ((this.gen.if(H), this.error(), this.allErrors)) this.gen.endIf();
        else this.gen.else();
      }
      fail$data(H) {
        if (!this.$data) return this.fail(H);
        let { schemaCode: _ } = this;
        this.fail(u9._`${_} !== undefined && (${(0, u9.or)(this.invalid$data(), H)})`);
      }
      error(H, _, q) {
        if (_) {
          this.setParams(_), this._error(H, q), this.setParams({});
          return;
        }
        this._error(H, q);
      }
      _error(H, _) {
        (H ? AFH.reportExtraError : AFH.reportError)(this, this.def.error, _);
      }
      $dataError() {
        (0, AFH.reportError)(this, this.def.$dataError || AFH.keyword$DataError);
      }
      reset() {
        if (this.errsCount === void 0) throw Error('add "trackErrors" to keyword definition');
        (0, AFH.resetErrorsCount)(this.gen, this.errsCount);
      }
      ok(H) {
        if (!this.allErrors) this.gen.if(H);
      }
      setParams(H, _) {
        if (_) Object.assign(this.params, H);
        else this.params = H;
      }
      block$data(H, _, q = u9.nil) {
        this.gen.block(() => {
          this.check$data(H, q), _();
        });
      }
      check$data(H = u9.nil, _ = u9.nil) {
        if (!this.$data) return;
        let { gen: q, schemaCode: $, schemaType: K, def: O } = this;
        if ((q.if((0, u9.or)(u9._`${$} === undefined`, _)), H !== u9.nil)) q.assign(H, !0);
        if (K.length || O.validateSchema) {
          if ((q.elseIf(this.invalid$data()), this.$dataError(), H !== u9.nil)) q.assign(H, !1);
        }
        q.else();
      }
      invalid$data() {
        let { gen: H, schemaCode: _, schemaType: q, def: $, it: K } = this;
        return (0, u9.or)(O(), T());
        function O() {
          if (q.length) {
            if (!(_ instanceof u9.Name)) throw Error("ajv implementation error");
            let z = Array.isArray(q) ? q : [q];
            return u9._`${(0, cW_.checkDataTypes)(z, _, K.opts.strictNumbers, cW_.DataType.Wrong)}`;
          }
          return u9.nil;
        }
        function T() {
          if ($.validateSchema) {
            let z = H.scopeValue("validate$data", { ref: $.validateSchema });
            return u9._`!${z}(${_})`;
          }
          return u9.nil;
        }
      }
      subschema(H, _) {
        let q = (0, RZ6.getSubschema)(this.it, H);
        (0, RZ6.extendSubschemaData)(q, this.it, H), (0, RZ6.extendSubschemaMode)(q, H);
        let $ = { ...this.it, ...q, items: void 0, props: void 0 };
        return HP4($, _), $;
      }
      mergeEvaluated(H, _) {
        let { it: q, gen: $ } = this;
        if (!q.opts.unevaluated) return;
        if (q.props !== !0 && H.props !== void 0) q.props = Gi.mergeEvaluated.props($, H.props, q.props, _);
        if (q.items !== !0 && H.items !== void 0) q.items = Gi.mergeEvaluated.items($, H.items, q.items, _);
      }
      mergeValidEvaluated(H, _) {
        let { it: q, gen: $ } = this;
        if (q.opts.unevaluated && (q.props !== !0 || q.items !== !0))
          return $.if(_, () => this.mergeEvaluated(H, u9.Name)), !0;
      }
    }
    v_H.KeywordCxt = kZ6;
    function Dmq(H, _, q, $) {
      let K = new kZ6(H, q, _);
      if ("code" in q) q.code(K, $);
      else if (K.$data && q.validate) (0, fFH.funcKeywordCode)(K, q);
      else if ("macro" in q) (0, fFH.macroKeywordCode)(K, q);
      else if (q.compile || q.validate) (0, fFH.funcKeywordCode)(K, q);
    }
    var MP4 = /^\/(?:[^~]|~0|~1)*$/,
      JP4 = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
    function jmq(H, { dataLevel: _, dataNames: q, dataPathArr: $ }) {
      let K, O;
      if (H === "") return b4.default.rootData;
      if (H[0] === "/") {
        if (!MP4.test(H)) throw Error(`Invalid JSON-pointer: ${H}`);
        (K = H), (O = b4.default.rootData);
      } else {
        let f = JP4.exec(H);
        if (!f) throw Error(`Invalid JSON-pointer: ${H}`);
        let w = +f[1];
        if (((K = f[2]), K === "#")) {
          if (w >= _) throw Error(A("property/index", w));
          return $[_ - w];
        }
        if (w > _) throw Error(A("data", w));
        if (((O = q[_ - w]), !K)) return O;
      }
      let T = O,
        z = K.split("/");
      for (let f of z)
        if (f) (O = u9._`${O}${(0, u9.getProperty)((0, Gi.unescapeJsonPointer)(f))}`), (T = u9._`${T} && ${O}`);
      return T;
      function A(f, w) {
        return `Cannot access ${f} ${w} levels up, current level is ${_}`;
      }
    }
    v_H.getData = jmq;
  });
