  var TE = d((Az) => {
    Object.defineProperty(Az, "__esModule", { value: !0 });
    Az.validateUnion =
      Az.validateArray =
      Az.usePattern =
      Az.callValidateCode =
      Az.schemaProperties =
      Az.allSchemaProperties =
      Az.noPropertyInData =
      Az.propertyInData =
      Az.isOwnProperty =
      Az.hasPropFunc =
      Az.reportMissingProp =
      Az.checkMissingProp =
      Az.checkReportMissingProp =
        void 0;
    var hf = PK(),
      JZ6 = W3(),
      Z_H = Wi(),
      MJ4 = W3();
    function JJ4(H, _) {
      let { gen: q, data: $, it: K } = H;
      q.if(XZ6(q, $, _, K.opts.ownProperties), () => {
        H.setParams({ missingProperty: hf._`${_}` }, !0), H.error();
      });
    }
    Az.checkReportMissingProp = JJ4;
    function PJ4({ gen: H, data: _, it: { opts: q } }, $, K) {
      return (0, hf.or)(...$.map((O) => (0, hf.and)(XZ6(H, _, O, q.ownProperties), hf._`${K} = ${O}`)));
    }
    Az.checkMissingProp = PJ4;
    function XJ4(H, _) {
      H.setParams({ missingProperty: _ }, !0), H.error();
    }
    Az.reportMissingProp = XJ4;
    function cxq(H) {
      return H.scopeValue("func", {
        ref: Object.prototype.hasOwnProperty,
        code: hf._`Object.prototype.hasOwnProperty`,
      });
    }
    Az.hasPropFunc = cxq;
    function PZ6(H, _, q) {
      return hf._`${cxq(H)}.call(${_}, ${q})`;
    }
    Az.isOwnProperty = PZ6;
    function WJ4(H, _, q, $) {
      let K = hf._`${_}${(0, hf.getProperty)(q)} !== undefined`;
      return $ ? hf._`${K} && ${PZ6(H, _, q)}` : K;
    }
    Az.propertyInData = WJ4;
    function XZ6(H, _, q, $) {
      let K = hf._`${_}${(0, hf.getProperty)(q)} === undefined`;
      return $ ? (0, hf.or)(K, (0, hf.not)(PZ6(H, _, q))) : K;
    }
    Az.noPropertyInData = XZ6;
    function Fxq(H) {
      return H ? Object.keys(H).filter((_) => _ !== "__proto__") : [];
    }
    Az.allSchemaProperties = Fxq;
    function GJ4(H, _) {
      return Fxq(_).filter((q) => !(0, JZ6.alwaysValidSchema)(H, _[q]));
    }
    Az.schemaProperties = GJ4;
    function RJ4(
      { schemaCode: H, data: _, it: { gen: q, topSchemaRef: $, schemaPath: K, errorPath: O }, it: T },
      z,
      A,
      f,
    ) {
      let w = f ? hf._`${H}, ${_}, ${$}${K}` : _,
        Y = [
          [Z_H.default.instancePath, (0, hf.strConcat)(Z_H.default.instancePath, O)],
          [Z_H.default.parentData, T.parentData],
          [Z_H.default.parentDataProperty, T.parentDataProperty],
          [Z_H.default.rootData, Z_H.default.rootData],
        ];
      if (T.opts.dynamicRef) Y.push([Z_H.default.dynamicAnchors, Z_H.default.dynamicAnchors]);
      let D = hf._`${w}, ${q.object(...Y)}`;
      return A !== hf.nil ? hf._`${z}.call(${A}, ${D})` : hf._`${z}(${D})`;
    }
    Az.callValidateCode = RJ4;
    var ZJ4 = hf._`new RegExp`;
    function LJ4({ gen: H, it: { opts: _ } }, q) {
      let $ = _.unicodeRegExp ? "u" : "",
        { regExp: K } = _.code,
        O = K(q, $);
      return H.scopeValue("pattern", {
        key: O.toString(),
        ref: O,
        code: hf._`${K.code === "new RegExp" ? ZJ4 : ((0, MJ4.useFunc))(H, K)}(${q}, ${$})`,
      });
    }
    Az.usePattern = LJ4;
    function kJ4(H) {
      let { gen: _, data: q, keyword: $, it: K } = H,
        O = _.name("valid");
      if (K.allErrors) {
        let z = _.let("valid", !0);
        return T(() => _.assign(z, !1)), z;
      }
      return _.var(O, !0), T(() => _.break()), O;
      function T(z) {
        let A = _.const("len", hf._`${q}.length`);
        _.forRange("i", 0, A, (f) => {
          H.subschema({ keyword: $, dataProp: f, dataPropType: JZ6.Type.Num }, O), _.if((0, hf.not)(O), z);
        });
      }
    }
    Az.validateArray = kJ4;
    function vJ4(H) {
      let { gen: _, schema: q, keyword: $, it: K } = H;
      if (!Array.isArray(q)) throw Error("ajv implementation error");
      if (q.some((A) => (0, JZ6.alwaysValidSchema)(K, A)) && !K.opts.unevaluated) return;
      let T = _.let("valid", !1),
        z = _.name("_valid");
      _.block(() =>
        q.forEach((A, f) => {
          let w = H.subschema({ keyword: $, schemaProp: f, compositeRule: !0 }, z);
          if ((_.assign(T, hf._`${T} || ${z}`), !H.mergeValidEvaluated(w, z))) _.if((0, hf.not)(T));
        }),
      ),
        H.result(
          T,
          () => H.reset(),
          () => H.error(!0),
        );
    }
    Az.validateUnion = vJ4;
  });
