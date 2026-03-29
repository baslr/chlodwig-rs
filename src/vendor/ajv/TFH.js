  var TFH = d(($G) => {
    Object.defineProperty($G, "__esModule", { value: !0 });
    $G.reportTypeError =
      $G.checkDataTypes =
      $G.checkDataType =
      $G.coerceAndCheckDataType =
      $G.getJSONTypes =
      $G.getSchemaTypes =
      $G.DataType =
        void 0;
    var qJ4 = wZ6(),
      $J4 = YZ6(),
      KJ4 = OFH(),
      qK = PK(),
      mxq = W3(),
      $0H;
    (function (H) {
      (H[(H.Correct = 0)] = "Correct"), (H[(H.Wrong = 1)] = "Wrong");
    })($0H || ($G.DataType = $0H = {}));
    function OJ4(H) {
      let _ = pxq(H.type);
      if (_.includes("null")) {
        if (H.nullable === !1) throw Error("type: null contradicts nullable: false");
      } else {
        if (!_.length && H.nullable !== void 0) throw Error('"nullable" cannot be used without "type"');
        if (H.nullable === !0) _.push("null");
      }
      return _;
    }
    $G.getSchemaTypes = OJ4;
    function pxq(H) {
      let _ = Array.isArray(H) ? H : H ? [H] : [];
      if (_.every(qJ4.isJSONType)) return _;
      throw Error("type must be JSONType or JSONType[]: " + _.join(","));
    }
    $G.getJSONTypes = pxq;
    function TJ4(H, _) {
      let { gen: q, data: $, opts: K } = H,
        O = zJ4(_, K.coerceTypes),
        T = _.length > 0 && !(O.length === 0 && _.length === 1 && (0, $J4.schemaHasRulesForType)(H, _[0]));
      if (T) {
        let z = jZ6(_, $, K.strictNumbers, $0H.Wrong);
        q.if(z, () => {
          if (O.length) AJ4(H, _, O);
          else MZ6(H);
        });
      }
      return T;
    }
    $G.coerceAndCheckDataType = TJ4;
    var Bxq = new Set(["string", "number", "integer", "boolean", "null"]);
    function zJ4(H, _) {
      return _ ? H.filter((q) => Bxq.has(q) || (_ === "array" && q === "array")) : [];
    }
    function AJ4(H, _, q) {
      let { gen: $, data: K, opts: O } = H,
        T = $.let("dataType", qK._`typeof ${K}`),
        z = $.let("coerced", qK._`undefined`);
      if (O.coerceTypes === "array")
        $.if(qK._`${T} == 'object' && Array.isArray(${K}) && ${K}.length == 1`, () =>
          $.assign(K, qK._`${K}[0]`)
            .assign(T, qK._`typeof ${K}`)
            .if(jZ6(_, K, O.strictNumbers), () => $.assign(z, K)),
        );
      $.if(qK._`${z} !== undefined`);
      for (let f of q) if (Bxq.has(f) || (f === "array" && O.coerceTypes === "array")) A(f);
      $.else(),
        MZ6(H),
        $.endIf(),
        $.if(qK._`${z} !== undefined`, () => {
          $.assign(K, z), fJ4(H, z);
        });
      function A(f) {
        switch (f) {
          case "string":
            $.elseIf(qK._`${T} == "number" || ${T} == "boolean"`)
              .assign(z, qK._`"" + ${K}`)
              .elseIf(qK._`${K} === null`)
              .assign(z, qK._`""`);
            return;
          case "number":
            $.elseIf(qK._`${T} == "boolean" || ${K} === null
              || (${T} == "string" && ${K} && ${K} == +${K})`).assign(z, qK._`+${K}`);
            return;
          case "integer":
            $.elseIf(qK._`${T} === "boolean" || ${K} === null
              || (${T} === "string" && ${K} && ${K} == +${K} && !(${K} % 1))`).assign(z, qK._`+${K}`);
            return;
          case "boolean":
            $.elseIf(qK._`${K} === "false" || ${K} === 0 || ${K} === null`)
              .assign(z, !1)
              .elseIf(qK._`${K} === "true" || ${K} === 1`)
              .assign(z, !0);
            return;
          case "null":
            $.elseIf(qK._`${K} === "" || ${K} === 0 || ${K} === false`), $.assign(z, null);
            return;
          case "array":
            $.elseIf(qK._`${T} === "string" || ${T} === "number"
              || ${T} === "boolean" || ${K} === null`).assign(z, qK._`[${K}]`);
        }
      }
    }
    function fJ4({ gen: H, parentData: _, parentDataProperty: q }, $) {
      H.if(qK._`${_} !== undefined`, () => H.assign(qK._`${_}[${q}]`, $));
    }
    function DZ6(H, _, q, $ = $0H.Correct) {
      let K = $ === $0H.Correct ? qK.operators.EQ : qK.operators.NEQ,
        O;
      switch (H) {
        case "null":
          return qK._`${_} ${K} null`;
        case "array":
          O = qK._`Array.isArray(${_})`;
          break;
        case "object":
          O = qK._`${_} && typeof ${_} == "object" && !Array.isArray(${_})`;
          break;
        case "integer":
          O = T(qK._`!(${_} % 1) && !isNaN(${_})`);
          break;
        case "number":
          O = T();
          break;
        default:
          return qK._`typeof ${_} ${K} ${H}`;
      }
      return $ === $0H.Correct ? O : (0, qK.not)(O);
      function T(z = qK.nil) {
        return (0, qK.and)(qK._`typeof ${_} == "number"`, z, q ? qK._`isFinite(${_})` : qK.nil);
      }
    }
    $G.checkDataType = DZ6;
    function jZ6(H, _, q, $) {
      if (H.length === 1) return DZ6(H[0], _, q, $);
      let K,
        O = (0, mxq.toHash)(H);
      if (O.array && O.object) {
        let T = qK._`typeof ${_} != "object"`;
        (K = O.null ? T : qK._`!${_} || ${T}`), delete O.null, delete O.array, delete O.object;
      } else K = qK.nil;
      if (O.number) delete O.integer;
      for (let T in O) K = (0, qK.and)(K, DZ6(T, _, q, $));
      return K;
    }
    $G.checkDataTypes = jZ6;
    var wJ4 = {
      message: ({ schema: H }) => `must be ${H}`,
      params: ({ schema: H, schemaValue: _ }) => (typeof H == "string" ? qK._`{type: ${H}}` : qK._`{type: ${_}}`),
    };
    function MZ6(H) {
      let _ = YJ4(H);
      (0, KJ4.reportError)(_, wJ4);
    }
    $G.reportTypeError = MZ6;
    function YJ4(H) {
      let { gen: _, data: q, schema: $ } = H,
        K = (0, mxq.schemaRefOrVal)(H, $, "type");
      return {
        gen: _,
        keyword: "type",
        data: q,
        schema: $.type,
        schemaCode: K,
        schemaValue: K,
        parentSchema: $,
        params: {},
        it: H,
      };
    }
  });
