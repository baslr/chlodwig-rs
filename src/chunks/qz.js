  var qz = d((Xf) => {
    var sP$ = IxH(),
      th8 = E0(),
      Q3_ = (H) => {
        if (typeof H === "function") return H();
        return H;
      },
      d16 = (H, _, q, $, K) => ({ name: _, namespace: H, traits: q, input: $, output: K }),
      tP$ = (H) => (_, q) => async ($) => {
        let { response: K } = await _($),
          { operationSchema: O } = th8.getSmithyContext(q),
          [, T, z, A, f, w] = O ?? [];
        try {
          let Y = await H.protocol.deserializeResponse(d16(T, z, A, f, w), { ...H, ...q }, K);
          return { response: K, output: Y };
        } catch (Y) {
          if (
            (Object.defineProperty(Y, "$response", { value: K, enumerable: !1, writable: !1, configurable: !1 }),
            !("$metadata" in Y))
          ) {
            try {
              Y.message += `
  Deserialization error: to see the raw response, inspect the hidden field {error}.$response on this object.`;
            } catch (j) {
              if (!q.logger || q.logger?.constructor?.name === "NoOpLogger")
                console.warn(
                  "Deserialization error: to see the raw response, inspect the hidden field {error}.$response on this object.",
                );
              else
                q.logger?.warn?.(
                  "Deserialization error: to see the raw response, inspect the hidden field {error}.$response on this object.",
                );
            }
            if (typeof Y.$responseBodyText < "u") {
              if (Y.$response) Y.$response.body = Y.$responseBodyText;
            }
            try {
              if (sP$.HttpResponse.isInstance(K)) {
                let { headers: j = {} } = K,
                  M = Object.entries(j);
                Y.$metadata = {
                  httpStatusCode: K.statusCode,
                  requestId: B16(/^x-[\w-]+-request-?id$/, M),
                  extendedRequestId: B16(/^x-[\w-]+-id-2$/, M),
                  cfId: B16(/^x-[\w-]+-cf-id$/, M),
                };
              }
            } catch (j) {}
          }
          throw Y;
        }
      },
      B16 = (H, _) => {
        return (_.find(([q]) => {
          return q.match(H);
        }) || [void 0, void 0])[1];
      },
      eP$ = (H) => (_, q) => async ($) => {
        let { operationSchema: K } = th8.getSmithyContext(q),
          [, O, T, z, A, f] = K ?? [],
          w = q.endpointV2?.url && H.urlParser ? async () => H.urlParser(q.endpointV2.url) : H.endpoint,
          Y = await H.protocol.serializeRequest(d16(O, T, z, A, f), $.input, { ...H, ...q, endpoint: w });
        return _({ ...$, request: Y });
      },
      eh8 = { name: "deserializerMiddleware", step: "deserialize", tags: ["DESERIALIZER"], override: !0 },
      Hy8 = { name: "serializerMiddleware", step: "serialize", tags: ["SERIALIZER"], override: !0 };
    function HX$(H) {
      return {
        applyToStack: (_) => {
          _.add(eP$(H), Hy8), _.add(tP$(H), eh8), H.protocol.setSerdeContext(H);
        },
      };
    }
    class Hk {
      name;
      namespace;
      traits;
      static assign(H, _) {
        return Object.assign(H, _);
      }
      static [Symbol.hasInstance](H) {
        let _ = this.prototype.isPrototypeOf(H);
        if (!_ && typeof H === "object" && H !== null) return H.symbol === this.symbol;
        return _;
      }
      getName() {
        return this.namespace + "#" + this.name;
      }
    }
    class l3_ extends Hk {
      static symbol = Symbol.for("@smithy/lis");
      name;
      traits;
      valueSchema;
      symbol = l3_.symbol;
    }
    var _X$ = (H, _, q, $) => Hk.assign(new l3_(), { name: _, namespace: H, traits: q, valueSchema: $ });
    class i3_ extends Hk {
      static symbol = Symbol.for("@smithy/map");
      name;
      traits;
      keySchema;
      valueSchema;
      symbol = i3_.symbol;
    }
    var qX$ = (H, _, q, $, K) =>
      Hk.assign(new i3_(), { name: _, namespace: H, traits: q, keySchema: $, valueSchema: K });
    class n3_ extends Hk {
      static symbol = Symbol.for("@smithy/ope");
      name;
      traits;
      input;
      output;
      symbol = n3_.symbol;
    }
    var $X$ = (H, _, q, $, K) => Hk.assign(new n3_(), { name: _, namespace: H, traits: q, input: $, output: K });
    class mxH extends Hk {
      static symbol = Symbol.for("@smithy/str");
      name;
      traits;
      memberNames;
      memberList;
      symbol = mxH.symbol;
    }
    var KX$ = (H, _, q, $, K) =>
      Hk.assign(new mxH(), { name: _, namespace: H, traits: q, memberNames: $, memberList: K });
    class r3_ extends mxH {
      static symbol = Symbol.for("@smithy/err");
      ctor;
      symbol = r3_.symbol;
    }
    var OX$ = (H, _, q, $, K, O) =>
      Hk.assign(new r3_(), { name: _, namespace: H, traits: q, memberNames: $, memberList: K, ctor: null });
    function xxH(H) {
      if (typeof H === "object") return H;
      H = H | 0;
      let _ = {},
        q = 0;
      for (let $ of [
        "httpLabel",
        "idempotent",
        "idempotencyToken",
        "sensitive",
        "httpPayload",
        "httpResponseCode",
        "httpQueryParams",
      ])
        if (((H >> q++) & 1) === 1) _[$] = 1;
      return _;
    }
    class IQ {
      ref;
      memberName;
      static symbol = Symbol.for("@smithy/nor");
      symbol = IQ.symbol;
      name;
      schema;
      _isMemberSchema;
      traits;
      memberTraits;
      normalizedTraits;
      constructor(H, _) {
        (this.ref = H), (this.memberName = _);
        let q = [],
          $ = H,
          K = H;
        this._isMemberSchema = !1;
        while (g16($)) q.push($[1]), ($ = $[0]), (K = Q3_($)), (this._isMemberSchema = !0);
        if (q.length > 0) {
          this.memberTraits = {};
          for (let O = q.length - 1; O >= 0; --O) {
            let T = q[O];
            Object.assign(this.memberTraits, xxH(T));
          }
        } else this.memberTraits = 0;
        if (K instanceof IQ) {
          let O = this.memberTraits;
          Object.assign(this, K),
            (this.memberTraits = Object.assign({}, O, K.getMemberTraits(), this.getMemberTraits())),
            (this.normalizedTraits = void 0),
            (this.memberName = _ ?? K.memberName);
          return;
        }
        if (((this.schema = Q3_(K)), _y8(this.schema)))
          (this.name = `${this.schema[1]}#${this.schema[2]}`), (this.traits = this.schema[3]);
        else (this.name = this.memberName ?? String(K)), (this.traits = 0);
        if (this._isMemberSchema && !_)
          throw Error(`@smithy/core/schema - NormalizedSchema member init ${this.getName(!0)} missing member name.`);
      }
      static [Symbol.hasInstance](H) {
        let _ = this.prototype.isPrototypeOf(H);
        if (!_ && typeof H === "object" && H !== null) return H.symbol === this.symbol;
        return _;
      }
      static of(H) {
        let _ = Q3_(H);
        if (_ instanceof IQ) return _;
        if (g16(_)) {
          let [q, $] = _;
          if (q instanceof IQ) return Object.assign(q.getMergedTraits(), xxH($)), q;
          throw Error(`@smithy/core/schema - may not init unwrapped member schema=${JSON.stringify(H, null, 2)}.`);
        }
        return new IQ(_);
      }
      getSchema() {
        let H = this.schema;
        if (H[0] === 0) return H[4];
        return H;
      }
      getName(H = !1) {
        let { name: _ } = this;
        return !H && _ && _.includes("#") ? _.split("#")[1] : _ || void 0;
      }
      getMemberName() {
        return this.memberName;
      }
      isMemberSchema() {
        return this._isMemberSchema;
      }
      isListSchema() {
        let H = this.getSchema();
        return typeof H === "number" ? H >= 64 && H < 128 : H[0] === 1;
      }
      isMapSchema() {
        let H = this.getSchema();
        return typeof H === "number" ? H >= 128 && H <= 255 : H[0] === 2;
      }
      isStructSchema() {
        let H = this.getSchema();
        return H[0] === 3 || H[0] === -3;
      }
      isBlobSchema() {
        let H = this.getSchema();
        return H === 21 || H === 42;
      }
      isTimestampSchema() {
        let H = this.getSchema();
        return typeof H === "number" && H >= 4 && H <= 7;
      }
      isUnitSchema() {
        return this.getSchema() === "unit";
      }
      isDocumentSchema() {
        return this.getSchema() === 15;
      }
      isStringSchema() {
        return this.getSchema() === 0;
      }
      isBooleanSchema() {
        return this.getSchema() === 2;
      }
      isNumericSchema() {
        return this.getSchema() === 1;
      }
      isBigIntegerSchema() {
        return this.getSchema() === 17;
      }
      isBigDecimalSchema() {
        return this.getSchema() === 19;
      }
      isStreaming() {
        let { streaming: H } = this.getMergedTraits();
        return !!H || this.getSchema() === 42;
      }
      isIdempotencyToken() {
        let H = (K) => (K & 4) === 4 || !!K?.idempotencyToken,
          { normalizedTraits: _, traits: q, memberTraits: $ } = this;
        return H(_) || H(q) || H($);
      }
      getMergedTraits() {
        return this.normalizedTraits ?? (this.normalizedTraits = { ...this.getOwnTraits(), ...this.getMemberTraits() });
      }
      getMemberTraits() {
        return xxH(this.memberTraits);
      }
      getOwnTraits() {
        return xxH(this.traits);
      }
      getKeySchema() {
        let [H, _] = [this.isDocumentSchema(), this.isMapSchema()];
        if (!H && !_) throw Error(`@smithy/core/schema - cannot get key for non-map: ${this.getName(!0)}`);
        let q = this.getSchema(),
          $ = H ? 15 : (q[4] ?? 0);
        return uxH([$, 0], "key");
      }
      getValueSchema() {
        let H = this.getSchema(),
          [_, q, $] = [this.isDocumentSchema(), this.isMapSchema(), this.isListSchema()],
          K = typeof H === "number" ? 63 & H : H && typeof H === "object" && (q || $) ? H[3 + H[0]] : _ ? 15 : void 0;
        if (K != null) return uxH([K, 0], q ? "value" : "member");
        throw Error(`@smithy/core/schema - ${this.getName(!0)} has no value member.`);
      }
      getMemberSchema(H) {
        let _ = this.getSchema();
        if (this.isStructSchema() && _[4].includes(H)) {
          let q = _[4].indexOf(H),
            $ = _[5][q];
          return uxH(g16($) ? $ : [$, 0], H);
        }
        if (this.isDocumentSchema()) return uxH([15, 0], H);
        throw Error(`@smithy/core/schema - ${this.getName(!0)} has no no member=${H}.`);
      }
      getMemberSchemas() {
        let H = {};
        try {
          for (let [_, q] of this.structIterator()) H[_] = q;
        } catch (_) {}
        return H;
      }
      getEventStreamMember() {
        if (this.isStructSchema()) {
          for (let [H, _] of this.structIterator()) if (_.isStreaming() && _.isStructSchema()) return H;
        }
        return "";
      }
      *structIterator() {
        if (this.isUnitSchema()) return;
        if (!this.isStructSchema()) throw Error("@smithy/core/schema - cannot iterate non-struct schema.");
        let H = this.getSchema();
        for (let _ = 0; _ < H[4].length; ++_) yield [H[4][_], uxH([H[5][_], 0], H[4][_])];
      }
    }
    function uxH(H, _) {
      if (H instanceof IQ) return Object.assign(H, { memberName: _, _isMemberSchema: !0 });
      return new IQ(H, _);
    }
    var g16 = (H) => Array.isArray(H) && H.length === 2,
      _y8 = (H) => Array.isArray(H) && H.length >= 5;
    class pxH extends Hk {
      static symbol = Symbol.for("@smithy/sim");
      name;
      schemaRef;
      traits;
      symbol = pxH.symbol;
    }
    var TX$ = (H, _, q, $) => Hk.assign(new pxH(), { name: _, namespace: H, traits: $, schemaRef: q }),
      zX$ = (H, _, q, $) => Hk.assign(new pxH(), { name: _, namespace: H, traits: q, schemaRef: $ }),
      AX$ = {
        BLOB: 21,
        STREAMING_BLOB: 42,
        BOOLEAN: 2,
        STRING: 0,
        NUMERIC: 1,
        BIG_INTEGER: 17,
        BIG_DECIMAL: 19,
        DOCUMENT: 15,
        TIMESTAMP_DEFAULT: 4,
        TIMESTAMP_DATE_TIME: 5,
        TIMESTAMP_HTTP_DATE: 6,
        TIMESTAMP_EPOCH_SECONDS: 7,
        LIST_MODIFIER: 64,
        MAP_MODIFIER: 128,
      };
    class bQ {
      namespace;
      schemas;
      exceptions;
      static registries = new Map();
      constructor(H, _ = new Map(), q = new Map()) {
        (this.namespace = H), (this.schemas = _), (this.exceptions = q);
      }
      static for(H) {
        if (!bQ.registries.has(H)) bQ.registries.set(H, new bQ(H));
        return bQ.registries.get(H);
      }
      register(H, _) {
        let q = this.normalizeShapeId(H);
        bQ.for(q.split("#")[0]).schemas.set(q, _);
      }
      getSchema(H) {
        let _ = this.normalizeShapeId(H);
        if (!this.schemas.has(_)) throw Error(`@smithy/core/schema - schema not found for ${_}`);
        return this.schemas.get(_);
      }
      registerError(H, _) {
        let q = H,
          $ = bQ.for(q[1]);
        $.schemas.set(q[1] + "#" + q[2], q), $.exceptions.set(q, _);
      }
      getErrorCtor(H) {
        let _ = H;
        return bQ.for(_[1]).exceptions.get(_);
      }
      getBaseException() {
        for (let H of this.exceptions.keys())
          if (Array.isArray(H)) {
            let [, _, q] = H,
              $ = _ + "#" + q;
            if ($.startsWith("smithy.ts.sdk.synthetic.") && $.endsWith("ServiceException")) return H;
          }
        return;
      }
      find(H) {
        return [...this.schemas.values()].find(H);
      }
      clear() {
        this.schemas.clear(), this.exceptions.clear();
      }
      normalizeShapeId(H) {
        if (H.includes("#")) return H;
        return this.namespace + "#" + H;
      }
    }
    Xf.ErrorSchema = r3_;
    Xf.ListSchema = l3_;
    Xf.MapSchema = i3_;
    Xf.NormalizedSchema = IQ;
    Xf.OperationSchema = n3_;
    Xf.SCHEMA = AX$;
    Xf.Schema = Hk;
    Xf.SimpleSchema = pxH;
    Xf.StructureSchema = mxH;
    Xf.TypeRegistry = bQ;
    Xf.deref = Q3_;
    Xf.deserializerMiddlewareOption = eh8;
    Xf.error = OX$;
    Xf.getSchemaSerdePlugin = HX$;
    Xf.isStaticSchema = _y8;
    Xf.list = _X$;
    Xf.map = qX$;
    Xf.op = $X$;
    Xf.operation = d16;
    Xf.serializerMiddlewareOption = Hy8;
    Xf.sim = TX$;
    Xf.simAdapter = zX$;
    Xf.struct = KX$;
    Xf.translateTraits = xxH;
  });
