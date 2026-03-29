  var oQ = d((Gf) => {
    var rI8 = A56(),
      dT = qz(),
      rQ = J56(),
      MX = xA(),
      xJ = _k(),
      KmH = G56(),
      aI8 = cz(),
      JS = k56();
    class KJH {
      queryCompat;
      constructor(H = !1) {
        this.queryCompat = H;
      }
      resolveRestContentType(H, _) {
        let q = _.getMemberSchemas(),
          $ = Object.values(q).find((K) => {
            return !!K.getMergedTraits().httpPayload;
          });
        if ($) {
          let K = $.getMergedTraits().mediaType;
          if (K) return K;
          else if ($.isStringSchema()) return "text/plain";
          else if ($.isBlobSchema()) return "application/octet-stream";
          else return H;
        } else if (!_.isUnitSchema()) {
          if (
            Object.values(q).find((O) => {
              let {
                httpQuery: T,
                httpQueryParams: z,
                httpHeader: A,
                httpLabel: f,
                httpPrefixHeaders: w,
              } = O.getMergedTraits();
              return !T && !z && !A && !f && w === void 0;
            })
          )
            return H;
        }
      }
      async getErrorSchemaOrThrowBaseException(H, _, q, $, K, O) {
        let T = _,
          z = H;
        if (H.includes("#")) [T, z] = H.split("#");
        let A = { $metadata: K, $fault: q.statusCode < 500 ? "client" : "server" },
          f = dT.TypeRegistry.for(T);
        try {
          return { errorSchema: O?.(f, z) ?? f.getSchema(H), errorMetadata: A };
        } catch (w) {
          $.message = $.message ?? $.Message ?? "UnknownError";
          let Y = dT.TypeRegistry.for("smithy.ts.sdk.synthetic." + T),
            D = Y.getBaseException();
          if (D) {
            let j = Y.getErrorCtor(D) ?? Error;
            throw this.decorateServiceException(Object.assign(new j({ name: z }), A), $);
          }
          throw this.decorateServiceException(Object.assign(Error(z), A), $);
        }
      }
      decorateServiceException(H, _ = {}) {
        if (this.queryCompat) {
          let q = H.Message ?? _.Message,
            $ = rQ.decorateServiceException(H, _);
          if (q) ($.Message = q), ($.message = q);
          return $;
        }
        return rQ.decorateServiceException(H, _);
      }
      setQueryCompatError(H, _) {
        let q = _.headers?.["x-amzn-query-error"];
        if (H !== void 0 && q != null) {
          let [$, K] = q.split(";"),
            O = Object.entries(H),
            T = { Code: $, Type: K };
          Object.assign(H, T);
          for (let [z, A] of O) T[z] = A;
          delete T.__type, (H.Error = T);
        }
      }
      queryCompatOutput(H, _) {
        if (H.Error) _.Error = H.Error;
        if (H.Type) _.Type = H.Type;
        if (H.Code) _.Code = H.Code;
      }
    }
    class sI8 extends rI8.SmithyRpcV2CborProtocol {
      awsQueryCompatible;
      mixin;
      constructor({ defaultNamespace: H, awsQueryCompatible: _ }) {
        super({ defaultNamespace: H });
        (this.awsQueryCompatible = !!_), (this.mixin = new KJH(this.awsQueryCompatible));
      }
      async serializeRequest(H, _, q) {
        let $ = await super.serializeRequest(H, _, q);
        if (this.awsQueryCompatible) $.headers["x-amzn-query-mode"] = "true";
        return $;
      }
      async handleError(H, _, q, $, K) {
        if (this.awsQueryCompatible) this.mixin.setQueryCompatError($, q);
        let O = rI8.loadSmithyRpcV2CborErrorCode(q, $) ?? "Unknown",
          { errorSchema: T, errorMetadata: z } = await this.mixin.getErrorSchemaOrThrowBaseException(
            O,
            this.options.defaultNamespace,
            q,
            $,
            K,
          ),
          A = dT.NormalizedSchema.of(T),
          f = $.message ?? $.Message ?? "Unknown",
          Y = new (dT.TypeRegistry.for(T[1]).getErrorCtor(T) ?? Error)(f),
          D = {};
        for (let [j, M] of A.structIterator()) D[j] = this.deserializer.readValue(M, $[j]);
        if (this.awsQueryCompatible) this.mixin.queryCompatOutput($, D);
        throw this.mixin.decorateServiceException(
          Object.assign(Y, z, { $fault: A.getMergedTraits().error, message: f }, D),
          $,
        );
      }
    }
    var Fv$ = (H) => {
        if (H == null) return H;
        if (typeof H === "number" || typeof H === "bigint") {
          let _ = Error(`Received number ${H} where a string was expected.`);
          return (_.name = "Warning"), console.warn(_), String(H);
        }
        if (typeof H === "boolean") {
          let _ = Error(`Received boolean ${H} where a string was expected.`);
          return (_.name = "Warning"), console.warn(_), String(H);
        }
        return H;
      },
      Uv$ = (H) => {
        if (H == null) return H;
        if (typeof H === "string") {
          let _ = H.toLowerCase();
          if (H !== "" && _ !== "false" && _ !== "true") {
            let q = Error(`Received string "${H}" where a boolean was expected.`);
            (q.name = "Warning"), console.warn(q);
          }
          return H !== "" && _ !== "false";
        }
        return H;
      },
      Qv$ = (H) => {
        if (H == null) return H;
        if (typeof H === "string") {
          let _ = Number(H);
          if (_.toString() !== H) {
            let q = Error(`Received string "${H}" where a number was expected.`);
            return (q.name = "Warning"), console.warn(q), H;
          }
          return _;
        }
        return H;
      };
    class Ae {
      serdeContext;
      setSerdeContext(H) {
        this.serdeContext = H;
      }
    }
    function lv$(H, _, q) {
      if (q?.source) {
        let $ = q.source;
        if (typeof _ === "number") {
          if (_ > Number.MAX_SAFE_INTEGER || _ < Number.MIN_SAFE_INTEGER || $ !== String(_))
            if ($.includes(".")) return new xJ.NumericValue($, "bigDecimal");
            else return BigInt($);
        }
      }
      return _;
    }
    var tI8 = (H, _) => rQ.collectBody(H, _).then((q) => (_?.utf8Encoder ?? aI8.toUtf8)(q)),
      j36 = (H, _) =>
        tI8(H, _).then((q) => {
          if (q.length)
            try {
              return JSON.parse(q);
            } catch ($) {
              if ($?.name === "SyntaxError") Object.defineProperty($, "$responseBodyText", { value: q });
              throw $;
            }
          return {};
        }),
      iv$ = async (H, _) => {
        let q = await j36(H, _);
        return (q.message = q.message ?? q.Message), q;
      },
      M36 = (H, _) => {
        let q = (O, T) => Object.keys(O).find((z) => z.toLowerCase() === T.toLowerCase()),
          $ = (O) => {
            let T = O;
            if (typeof T === "number") T = T.toString();
            if (T.indexOf(",") >= 0) T = T.split(",")[0];
            if (T.indexOf(":") >= 0) T = T.split(":")[0];
            if (T.indexOf("#") >= 0) T = T.split("#")[1];
            return T;
          },
          K = q(H.headers, "x-amzn-errortype");
        if (K !== void 0) return $(H.headers[K]);
        if (_ && typeof _ === "object") {
          let O = q(_, "code");
          if (O && _[O] !== void 0) return $(_[O]);
          if (_.__type !== void 0) return $(_.__type);
        }
      };
    class J36 extends Ae {
      settings;
      constructor(H) {
        super();
        this.settings = H;
      }
      async read(H, _) {
        return this._read(H, typeof _ === "string" ? JSON.parse(_, lv$) : await j36(_, this.serdeContext));
      }
      readObject(H, _) {
        return this._read(H, _);
      }
      _read(H, _) {
        let q = _ !== null && typeof _ === "object",
          $ = dT.NormalizedSchema.of(H);
        if ($.isListSchema() && Array.isArray(_)) {
          let O = $.getValueSchema(),
            T = [],
            z = !!$.getMergedTraits().sparse;
          for (let A of _) if (z || A != null) T.push(this._read(O, A));
          return T;
        } else if ($.isMapSchema() && q) {
          let O = $.getValueSchema(),
            T = {},
            z = !!$.getMergedTraits().sparse;
          for (let [A, f] of Object.entries(_)) if (z || f != null) T[A] = this._read(O, f);
          return T;
        } else if ($.isStructSchema() && q) {
          let O = {};
          for (let [T, z] of $.structIterator()) {
            let A = this.settings.jsonName ? (z.getMergedTraits().jsonName ?? T) : T,
              f = this._read(z, _[A]);
            if (f != null) O[T] = f;
          }
          return O;
        }
        if ($.isBlobSchema() && typeof _ === "string") return KmH.fromBase64(_);
        let K = $.getMergedTraits().mediaType;
        if ($.isStringSchema() && typeof _ === "string" && K) {
          if (K === "application/json" || K.endsWith("+json")) return xJ.LazyJsonString.from(_);
        }
        if ($.isTimestampSchema() && _ != null)
          switch (MX.determineTimestampFormat($, this.settings)) {
            case 5:
              return xJ.parseRfc3339DateTimeWithOffset(_);
            case 6:
              return xJ.parseRfc7231DateTime(_);
            case 7:
              return xJ.parseEpochTimestamp(_);
            default:
              return console.warn("Missing timestamp format, parsing value with Date constructor:", _), new Date(_);
          }
        if ($.isBigIntegerSchema() && (typeof _ === "number" || typeof _ === "string")) return BigInt(_);
        if ($.isBigDecimalSchema() && _ != null) {
          if (_ instanceof xJ.NumericValue) return _;
          let O = _;
          if (O.type === "bigDecimal" && "string" in O) return new xJ.NumericValue(O.string, O.type);
          return new xJ.NumericValue(String(_), "bigDecimal");
        }
        if ($.isNumericSchema() && typeof _ === "string")
          switch (_) {
            case "Infinity":
              return 1 / 0;
            case "-Infinity":
              return -1 / 0;
            case "NaN":
              return NaN;
          }
        if ($.isDocumentSchema())
          if (q) {
            let O = Array.isArray(_) ? [] : {};
            for (let [T, z] of Object.entries(_))
              if (z instanceof xJ.NumericValue) O[T] = z;
              else O[T] = this._read($, z);
            return O;
          } else return structuredClone(_);
        return _;
      }
    }
    var oI8 = String.fromCharCode(925);
    class eI8 {
      values = new Map();
      counter = 0;
      stage = 0;
      createReplacer() {
        if (this.stage === 1) throw Error("@aws-sdk/core/protocols - JsonReplacer already created.");
        if (this.stage === 2) throw Error("@aws-sdk/core/protocols - JsonReplacer exhausted.");
        return (
          (this.stage = 1),
          (H, _) => {
            if (_ instanceof xJ.NumericValue) {
              let q = `${oI8 + "nv" + this.counter++}_` + _.string;
              return this.values.set(`"${q}"`, _.string), q;
            }
            if (typeof _ === "bigint") {
              let q = _.toString(),
                $ = `${oI8 + "b" + this.counter++}_` + q;
              return this.values.set(`"${$}"`, q), $;
            }
            return _;
          }
        );
      }
      replaceInJson(H) {
        if (this.stage === 0) throw Error("@aws-sdk/core/protocols - JsonReplacer not created yet.");
        if (this.stage === 2) throw Error("@aws-sdk/core/protocols - JsonReplacer exhausted.");
        if (((this.stage = 2), this.counter === 0)) return H;
        for (let [_, q] of this.values) H = H.replace(_, q);
        return H;
      }
    }
    class P36 extends Ae {
      settings;
      buffer;
      rootSchema;
      constructor(H) {
        super();
        this.settings = H;
      }
      write(H, _) {
        (this.rootSchema = dT.NormalizedSchema.of(H)), (this.buffer = this._write(this.rootSchema, _));
      }
      writeDiscriminatedDocument(H, _) {
        if ((this.write(H, _), typeof this.buffer === "object"))
          this.buffer.__type = dT.NormalizedSchema.of(H).getName(!0);
      }
      flush() {
        let { rootSchema: H } = this;
        if (((this.rootSchema = void 0), H?.isStructSchema() || H?.isDocumentSchema())) {
          let _ = new eI8();
          return _.replaceInJson(JSON.stringify(this.buffer, _.createReplacer(), 0));
        }
        return this.buffer;
      }
      _write(H, _, q) {
        let $ = _ !== null && typeof _ === "object",
          K = dT.NormalizedSchema.of(H);
        if (K.isListSchema() && Array.isArray(_)) {
          let O = K.getValueSchema(),
            T = [],
            z = !!K.getMergedTraits().sparse;
          for (let A of _) if (z || A != null) T.push(this._write(O, A));
          return T;
        } else if (K.isMapSchema() && $) {
          let O = K.getValueSchema(),
            T = {},
            z = !!K.getMergedTraits().sparse;
          for (let [A, f] of Object.entries(_)) if (z || f != null) T[A] = this._write(O, f);
          return T;
        } else if (K.isStructSchema() && $) {
          let O = {};
          for (let [T, z] of K.structIterator()) {
            let A = this.settings.jsonName ? (z.getMergedTraits().jsonName ?? T) : T,
              f = this._write(z, _[T], K);
            if (f !== void 0) O[A] = f;
          }
          return O;
        }
        if (_ === null && q?.isStructSchema()) return;
        if (
          (K.isBlobSchema() && (_ instanceof Uint8Array || typeof _ === "string")) ||
          (K.isDocumentSchema() && _ instanceof Uint8Array)
        ) {
          if (K === this.rootSchema) return _;
          return (this.serdeContext?.base64Encoder ?? KmH.toBase64)(_);
        }
        if ((K.isTimestampSchema() || K.isDocumentSchema()) && _ instanceof Date)
          switch (MX.determineTimestampFormat(K, this.settings)) {
            case 5:
              return _.toISOString().replace(".000Z", "Z");
            case 6:
              return xJ.dateToUtcString(_);
            case 7:
              return _.getTime() / 1000;
            default:
              return console.warn("Missing timestamp format, using epoch seconds", _), _.getTime() / 1000;
          }
        if (K.isNumericSchema() && typeof _ === "number") {
          if (Math.abs(_) === 1 / 0 || isNaN(_)) return String(_);
        }
        if (K.isStringSchema()) {
          if (typeof _ > "u" && K.isIdempotencyToken()) return xJ.generateIdempotencyToken();
          let O = K.getMergedTraits().mediaType;
          if (_ != null && O) {
            if (O === "application/json" || O.endsWith("+json")) return xJ.LazyJsonString.from(_);
          }
        }
        if (K.isDocumentSchema())
          if ($) {
            let O = Array.isArray(_) ? [] : {};
            for (let [T, z] of Object.entries(_))
              if (z instanceof xJ.NumericValue) O[T] = z;
              else O[T] = this._write(K, z);
            return O;
          } else return structuredClone(_);
        return _;
      }
    }
    class $T_ extends Ae {
      settings;
      constructor(H) {
        super();
        this.settings = H;
      }
      createSerializer() {
        let H = new P36(this.settings);
        return H.setSerdeContext(this.serdeContext), H;
      }
      createDeserializer() {
        let H = new J36(this.settings);
        return H.setSerdeContext(this.serdeContext), H;
      }
    }
    class KT_ extends MX.RpcProtocol {
      serializer;
      deserializer;
      serviceTarget;
      codec;
      mixin;
      awsQueryCompatible;
      constructor({ defaultNamespace: H, serviceTarget: _, awsQueryCompatible: q }) {
        super({ defaultNamespace: H });
        (this.serviceTarget = _),
          (this.codec = new $T_({ timestampFormat: { useTrait: !0, default: 7 }, jsonName: !1 })),
          (this.serializer = this.codec.createSerializer()),
          (this.deserializer = this.codec.createDeserializer()),
          (this.awsQueryCompatible = !!q),
          (this.mixin = new KJH(this.awsQueryCompatible));
      }
      async serializeRequest(H, _, q) {
        let $ = await super.serializeRequest(H, _, q);
        if (!$.path.endsWith("/")) $.path += "/";
        if (
          (Object.assign($.headers, {
            "content-type": `application/x-amz-json-${this.getJsonRpcVersion()}`,
            "x-amz-target": `${this.serviceTarget}.${H.name}`,
          }),
          this.awsQueryCompatible)
        )
          $.headers["x-amzn-query-mode"] = "true";
        if (dT.deref(H.input) === "unit" || !$.body) $.body = "{}";
        return $;
      }
      getPayloadCodec() {
        return this.codec;
      }
      async handleError(H, _, q, $, K) {
        if (this.awsQueryCompatible) this.mixin.setQueryCompatError($, q);
        let O = M36(q, $) ?? "Unknown",
          { errorSchema: T, errorMetadata: z } = await this.mixin.getErrorSchemaOrThrowBaseException(
            O,
            this.options.defaultNamespace,
            q,
            $,
            K,
          ),
          A = dT.NormalizedSchema.of(T),
          f = $.message ?? $.Message ?? "Unknown",
          Y = new (dT.TypeRegistry.for(T[1]).getErrorCtor(T) ?? Error)(f),
          D = {};
        for (let [j, M] of A.structIterator()) {
          let J = M.getMergedTraits().jsonName ?? j;
          D[j] = this.codec.createDeserializer().readObject(M, $[J]);
        }
        if (this.awsQueryCompatible) this.mixin.queryCompatOutput($, D);
        throw this.mixin.decorateServiceException(
          Object.assign(Y, z, { $fault: A.getMergedTraits().error, message: f }, D),
          $,
        );
      }
    }
    class Hu8 extends KT_ {
      constructor({ defaultNamespace: H, serviceTarget: _, awsQueryCompatible: q }) {
        super({ defaultNamespace: H, serviceTarget: _, awsQueryCompatible: q });
      }
      getShapeId() {
        return "aws.protocols#awsJson1_0";
      }
      getJsonRpcVersion() {
        return "1.0";
      }
      getDefaultContentType() {
        return "application/x-amz-json-1.0";
      }
    }
    class _u8 extends KT_ {
      constructor({ defaultNamespace: H, serviceTarget: _, awsQueryCompatible: q }) {
        super({ defaultNamespace: H, serviceTarget: _, awsQueryCompatible: q });
      }
      getShapeId() {
        return "aws.protocols#awsJson1_1";
      }
      getJsonRpcVersion() {
        return "1.1";
      }
      getDefaultContentType() {
        return "application/x-amz-json-1.1";
      }
    }
    class qu8 extends MX.HttpBindingProtocol {
      serializer;
      deserializer;
      codec;
      mixin = new KJH();
      constructor({ defaultNamespace: H }) {
        super({ defaultNamespace: H });
        let _ = { timestampFormat: { useTrait: !0, default: 7 }, httpBindings: !0, jsonName: !0 };
        (this.codec = new $T_(_)),
          (this.serializer = new MX.HttpInterceptingShapeSerializer(this.codec.createSerializer(), _)),
          (this.deserializer = new MX.HttpInterceptingShapeDeserializer(this.codec.createDeserializer(), _));
      }
      getShapeId() {
        return "aws.protocols#restJson1";
      }
      getPayloadCodec() {
        return this.codec;
      }
      setSerdeContext(H) {
        this.codec.setSerdeContext(H), super.setSerdeContext(H);
      }
      async serializeRequest(H, _, q) {
        let $ = await super.serializeRequest(H, _, q),
          K = dT.NormalizedSchema.of(H.input);
        if (!$.headers["content-type"]) {
          let O = this.mixin.resolveRestContentType(this.getDefaultContentType(), K);
          if (O) $.headers["content-type"] = O;
        }
        if ($.body == null && $.headers["content-type"] === this.getDefaultContentType()) $.body = "{}";
        return $;
      }
      async deserializeResponse(H, _, q) {
        let $ = await super.deserializeResponse(H, _, q),
          K = dT.NormalizedSchema.of(H.output);
        for (let [O, T] of K.structIterator()) if (T.getMemberTraits().httpPayload && !(O in $)) $[O] = null;
        return $;
      }
      async handleError(H, _, q, $, K) {
        let O = M36(q, $) ?? "Unknown",
          { errorSchema: T, errorMetadata: z } = await this.mixin.getErrorSchemaOrThrowBaseException(
            O,
            this.options.defaultNamespace,
            q,
            $,
            K,
          ),
          A = dT.NormalizedSchema.of(T),
          f = $.message ?? $.Message ?? "Unknown",
          Y = new (dT.TypeRegistry.for(T[1]).getErrorCtor(T) ?? Error)(f);
        await this.deserializeHttpMessage(T, _, q, $);
        let D = {};
        for (let [j, M] of A.structIterator()) {
          let J = M.getMergedTraits().jsonName ?? j;
          D[j] = this.codec.createDeserializer().readObject(M, $[J]);
        }
        throw this.mixin.decorateServiceException(
          Object.assign(Y, z, { $fault: A.getMergedTraits().error, message: f }, D),
          $,
        );
      }
      getDefaultContentType() {
        return "application/json";
      }
    }
    var nv$ = (H) => {
      if (H == null) return;
      if (typeof H === "object" && "__type" in H) delete H.__type;
      return rQ.expectUnion(H);
    };
    class OT_ extends Ae {
      settings;
      stringDeserializer;
      constructor(H) {
        super();
        (this.settings = H), (this.stringDeserializer = new MX.FromStringShapeDeserializer(H));
      }
      setSerdeContext(H) {
        (this.serdeContext = H), this.stringDeserializer.setSerdeContext(H);
      }
      read(H, _, q) {
        let $ = dT.NormalizedSchema.of(H),
          K = $.getMemberSchemas();
        if (
          $.isStructSchema() &&
          $.isMemberSchema() &&
          !!Object.values(K).find((A) => {
            return !!A.getMemberTraits().eventPayload;
          })
        ) {
          let A = {},
            f = Object.keys(K)[0];
          if (K[f].isBlobSchema()) A[f] = _;
          else A[f] = this.read(K[f], _);
          return A;
        }
        let T = (this.serdeContext?.utf8Encoder ?? aI8.toUtf8)(_),
          z = this.parseXml(T);
        return this.readSchema(H, q ? z[q] : z);
      }
      readSchema(H, _) {
        let q = dT.NormalizedSchema.of(H);
        if (q.isUnitSchema()) return;
        let $ = q.getMergedTraits();
        if (q.isListSchema() && !Array.isArray(_)) return this.readSchema(q, [_]);
        if (_ == null) return _;
        if (typeof _ === "object") {
          let K = !!$.sparse,
            O = !!$.xmlFlattened;
          if (q.isListSchema()) {
            let z = q.getValueSchema(),
              A = [],
              f = z.getMergedTraits().xmlName ?? "member",
              w = O ? _ : (_[0] ?? _)[f],
              Y = Array.isArray(w) ? w : [w];
            for (let D of Y) if (D != null || K) A.push(this.readSchema(z, D));
            return A;
          }
          let T = {};
          if (q.isMapSchema()) {
            let z = q.getKeySchema(),
              A = q.getValueSchema(),
              f;
            if (O) f = Array.isArray(_) ? _ : [_];
            else f = Array.isArray(_.entry) ? _.entry : [_.entry];
            let w = z.getMergedTraits().xmlName ?? "key",
              Y = A.getMergedTraits().xmlName ?? "value";
            for (let D of f) {
              let j = D[w],
                M = D[Y];
              if (M != null || K) T[j] = this.readSchema(A, M);
            }
            return T;
          }
          if (q.isStructSchema()) {
            for (let [z, A] of q.structIterator()) {
              let f = A.getMergedTraits(),
                w = !f.httpPayload ? (A.getMemberTraits().xmlName ?? z) : (f.xmlName ?? A.getName());
              if (_[w] != null) T[z] = this.readSchema(A, _[w]);
            }
            return T;
          }
          if (q.isDocumentSchema()) return _;
          throw Error(`@aws-sdk/core/protocols - xml deserializer unhandled schema type for ${q.getName(!0)}`);
        }
        if (q.isListSchema()) return [];
        if (q.isMapSchema() || q.isStructSchema()) return {};
        return this.stringDeserializer.read(q, _);
      }
      parseXml(H) {
        if (H.length) {
          let _;
          try {
            _ = JS.parseXML(H);
          } catch (O) {
            if (O && typeof O === "object") Object.defineProperty(O, "$responseBodyText", { value: H });
            throw O;
          }
          let q = "#text",
            $ = Object.keys(_)[0],
            K = _[$];
          if (K[q]) (K[$] = K[q]), delete K[q];
          return rQ.getValueFromTextNode(K);
        }
        return {};
      }
    }
    class $u8 extends Ae {
      settings;
      buffer;
      constructor(H) {
        super();
        this.settings = H;
      }
      write(H, _, q = "") {
        if (this.buffer === void 0) this.buffer = "";
        let $ = dT.NormalizedSchema.of(H);
        if (q && !q.endsWith(".")) q += ".";
        if ($.isBlobSchema()) {
          if (typeof _ === "string" || _ instanceof Uint8Array)
            this.writeKey(q), this.writeValue((this.serdeContext?.base64Encoder ?? KmH.toBase64)(_));
        } else if ($.isBooleanSchema() || $.isNumericSchema() || $.isStringSchema()) {
          if (_ != null) this.writeKey(q), this.writeValue(String(_));
          else if ($.isIdempotencyToken()) this.writeKey(q), this.writeValue(xJ.generateIdempotencyToken());
        } else if ($.isBigIntegerSchema()) {
          if (_ != null) this.writeKey(q), this.writeValue(String(_));
        } else if ($.isBigDecimalSchema()) {
          if (_ != null) this.writeKey(q), this.writeValue(_ instanceof xJ.NumericValue ? _.string : String(_));
        } else if ($.isTimestampSchema()) {
          if (_ instanceof Date)
            switch ((this.writeKey(q), MX.determineTimestampFormat($, this.settings))) {
              case 5:
                this.writeValue(_.toISOString().replace(".000Z", "Z"));
                break;
              case 6:
                this.writeValue(rQ.dateToUtcString(_));
                break;
              case 7:
                this.writeValue(String(_.getTime() / 1000));
                break;
            }
        } else if ($.isDocumentSchema())
          throw Error(`@aws-sdk/core/protocols - QuerySerializer unsupported document type ${$.getName(!0)}`);
        else if ($.isListSchema()) {
          if (Array.isArray(_))
            if (_.length === 0) {
              if (this.settings.serializeEmptyLists) this.writeKey(q), this.writeValue("");
            } else {
              let K = $.getValueSchema(),
                O = this.settings.flattenLists || $.getMergedTraits().xmlFlattened,
                T = 1;
              for (let z of _) {
                if (z == null) continue;
                let A = this.getKey("member", K.getMergedTraits().xmlName),
                  f = O ? `${q}${T}` : `${q}${A}.${T}`;
                this.write(K, z, f), ++T;
              }
            }
        } else if ($.isMapSchema()) {
          if (_ && typeof _ === "object") {
            let K = $.getKeySchema(),
              O = $.getValueSchema(),
              T = $.getMergedTraits().xmlFlattened,
              z = 1;
            for (let [A, f] of Object.entries(_)) {
              if (f == null) continue;
              let w = this.getKey("key", K.getMergedTraits().xmlName),
                Y = T ? `${q}${z}.${w}` : `${q}entry.${z}.${w}`,
                D = this.getKey("value", O.getMergedTraits().xmlName),
                j = T ? `${q}${z}.${D}` : `${q}entry.${z}.${D}`;
              this.write(K, A, Y), this.write(O, f, j), ++z;
            }
          }
        } else if ($.isStructSchema()) {
          if (_ && typeof _ === "object")
            for (let [K, O] of $.structIterator()) {
              if (_[K] == null && !O.isIdempotencyToken()) continue;
              let T = this.getKey(K, O.getMergedTraits().xmlName),
                z = `${q}${T}`;
              this.write(O, _[K], z);
            }
        } else if ($.isUnitSchema());
        else throw Error(`@aws-sdk/core/protocols - QuerySerializer unrecognized schema type ${$.getName(!0)}`);
      }
      flush() {
        if (this.buffer === void 0)
          throw Error("@aws-sdk/core/protocols - QuerySerializer cannot flush with nothing written to buffer.");
        let H = this.buffer;
        return delete this.buffer, H;
      }
      getKey(H, _) {
        let q = _ ?? H;
        if (this.settings.capitalizeKeys) return q[0].toUpperCase() + q.slice(1);
        return q;
      }
      writeKey(H) {
        if (H.endsWith(".")) H = H.slice(0, H.length - 1);
        this.buffer += `&${MX.extendedEncodeURIComponent(H)}=`;
      }
      writeValue(H) {
        this.buffer += MX.extendedEncodeURIComponent(H);
      }
    }
    class X36 extends MX.RpcProtocol {
      options;
      serializer;
      deserializer;
      mixin = new KJH();
      constructor(H) {
        super({ defaultNamespace: H.defaultNamespace });
        this.options = H;
        let _ = {
          timestampFormat: { useTrait: !0, default: 5 },
          httpBindings: !1,
          xmlNamespace: H.xmlNamespace,
          serviceNamespace: H.defaultNamespace,
          serializeEmptyLists: !0,
        };
        (this.serializer = new $u8(_)), (this.deserializer = new OT_(_));
      }
      getShapeId() {
        return "aws.protocols#awsQuery";
      }
      setSerdeContext(H) {
        this.serializer.setSerdeContext(H), this.deserializer.setSerdeContext(H);
      }
      getPayloadCodec() {
        throw Error("AWSQuery protocol has no payload codec.");
      }
      async serializeRequest(H, _, q) {
        let $ = await super.serializeRequest(H, _, q);
        if (!$.path.endsWith("/")) $.path += "/";
        if (
          (Object.assign($.headers, { "content-type": "application/x-www-form-urlencoded" }),
          dT.deref(H.input) === "unit" || !$.body)
        )
          $.body = "";
        let K = H.name.split("#")[1] ?? H.name;
        if ((($.body = `Action=${K}&Version=${this.options.version}` + $.body), $.body.endsWith("&")))
          $.body = $.body.slice(-1);
        return $;
      }
      async deserializeResponse(H, _, q) {
        let $ = this.deserializer,
          K = dT.NormalizedSchema.of(H.output),
          O = {};
        if (q.statusCode >= 300) {
          let w = await MX.collectBody(q.body, _);
          if (w.byteLength > 0) Object.assign(O, await $.read(15, w));
          await this.handleError(H, _, q, O, this.deserializeMetadata(q));
        }
        for (let w in q.headers) {
          let Y = q.headers[w];
          delete q.headers[w], (q.headers[w.toLowerCase()] = Y);
        }
        let T = H.name.split("#")[1] ?? H.name,
          z = K.isStructSchema() && this.useNestedResult() ? T + "Result" : void 0,
          A = await MX.collectBody(q.body, _);
        if (A.byteLength > 0) Object.assign(O, await $.read(K, A, z));
        return { $metadata: this.deserializeMetadata(q), ...O };
      }
      useNestedResult() {
        return !0;
      }
      async handleError(H, _, q, $, K) {
        let O = this.loadQueryErrorCode(q, $) ?? "Unknown",
          T = this.loadQueryError($),
          z = this.loadQueryErrorMessage($);
        (T.message = z), (T.Error = { Type: T.Type, Code: T.Code, Message: z });
        let { errorSchema: A, errorMetadata: f } = await this.mixin.getErrorSchemaOrThrowBaseException(
            O,
            this.options.defaultNamespace,
            q,
            T,
            K,
            (M, J) => {
              try {
                return M.getSchema(J);
              } catch (P) {
                return M.find((X) => dT.NormalizedSchema.of(X).getMergedTraits().awsQueryError?.[0] === J);
              }
            },
          ),
          w = dT.NormalizedSchema.of(A),
          D = new (dT.TypeRegistry.for(A[1]).getErrorCtor(A) ?? Error)(z),
          j = { Error: T.Error };
        for (let [M, J] of w.structIterator()) {
          let P = J.getMergedTraits().xmlName ?? M,
            X = T[P] ?? $[P];
          j[M] = this.deserializer.readSchema(J, X);
        }
        throw this.mixin.decorateServiceException(
          Object.assign(D, f, { $fault: w.getMergedTraits().error, message: z }, j),
          $,
        );
      }
      loadQueryErrorCode(H, _) {
        let q = (_.Errors?.[0]?.Error ?? _.Errors?.Error ?? _.Error)?.Code;
        if (q !== void 0) return q;
        if (H.statusCode == 404) return "NotFound";
      }
      loadQueryError(H) {
        return H.Errors?.[0]?.Error ?? H.Errors?.Error ?? H.Error;
      }
      loadQueryErrorMessage(H) {
        let _ = this.loadQueryError(H);
        return _?.message ?? _?.Message ?? H.message ?? H.Message ?? "Unknown";
      }
      getDefaultContentType() {
        return "application/x-www-form-urlencoded";
      }
    }
    class Ku8 extends X36 {
      options;
      constructor(H) {
        super(H);
        this.options = H;
        let _ = { capitalizeKeys: !0, flattenLists: !0, serializeEmptyLists: !1 };
        Object.assign(this.serializer.settings, _);
      }
      useNestedResult() {
        return !1;
      }
    }
    var Ou8 = (H, _) =>
        tI8(H, _).then((q) => {
          if (q.length) {
            let $;
            try {
              $ = JS.parseXML(q);
            } catch (z) {
              if (z && typeof z === "object") Object.defineProperty(z, "$responseBodyText", { value: q });
              throw z;
            }
            let K = "#text",
              O = Object.keys($)[0],
              T = $[O];
            if (T[K]) (T[O] = T[K]), delete T[K];
            return rQ.getValueFromTextNode(T);
          }
          return {};
        }),
      rv$ = async (H, _) => {
        let q = await Ou8(H, _);
        if (q.Error) q.Error.message = q.Error.message ?? q.Error.Message;
        return q;
      },
      Tu8 = (H, _) => {
        if (_?.Error?.Code !== void 0) return _.Error.Code;
        if (_?.Code !== void 0) return _.Code;
        if (H.statusCode == 404) return "NotFound";
      };
    class W36 extends Ae {
      settings;
      stringBuffer;
      byteBuffer;
      buffer;
      constructor(H) {
        super();
        this.settings = H;
      }
      write(H, _) {
        let q = dT.NormalizedSchema.of(H);
        if (q.isStringSchema() && typeof _ === "string") this.stringBuffer = _;
        else if (q.isBlobSchema())
          this.byteBuffer = "byteLength" in _ ? _ : (this.serdeContext?.base64Decoder ?? KmH.fromBase64)(_);
        else {
          this.buffer = this.writeStruct(q, _, void 0);
          let $ = q.getMergedTraits();
          if ($.httpPayload && !$.xmlName) this.buffer.withName(q.getName());
        }
      }
      flush() {
        if (this.byteBuffer !== void 0) {
          let _ = this.byteBuffer;
          return delete this.byteBuffer, _;
        }
        if (this.stringBuffer !== void 0) {
          let _ = this.stringBuffer;
          return delete this.stringBuffer, _;
        }
        let H = this.buffer;
        if (this.settings.xmlNamespace) {
          if (!H?.attributes?.xmlns) H.addAttribute("xmlns", this.settings.xmlNamespace);
        }
        return delete this.buffer, H.toString();
      }
      writeStruct(H, _, q) {
        let $ = H.getMergedTraits(),
          K =
            H.isMemberSchema() && !$.httpPayload
              ? (H.getMemberTraits().xmlName ?? H.getMemberName())
              : ($.xmlName ?? H.getName());
        if (!K || !H.isStructSchema())
          throw Error(
            `@aws-sdk/core/protocols - xml serializer, cannot write struct with empty name or non-struct, schema=${H.getName(!0)}.`,
          );
        let O = JS.XmlNode.of(K),
          [T, z] = this.getXmlnsAttribute(H, q);
        for (let [A, f] of H.structIterator()) {
          let w = _[A];
          if (w != null || f.isIdempotencyToken()) {
            if (f.getMergedTraits().xmlAttribute) {
              O.addAttribute(f.getMergedTraits().xmlName ?? A, this.writeSimple(f, w));
              continue;
            }
            if (f.isListSchema()) this.writeList(f, w, O, z);
            else if (f.isMapSchema()) this.writeMap(f, w, O, z);
            else if (f.isStructSchema()) O.addChildNode(this.writeStruct(f, w, z));
            else {
              let Y = JS.XmlNode.of(f.getMergedTraits().xmlName ?? f.getMemberName());
              this.writeSimpleInto(f, w, Y, z), O.addChildNode(Y);
            }
          }
        }
        if (z) O.addAttribute(T, z);
        return O;
      }
      writeList(H, _, q, $) {
        if (!H.isMemberSchema())
          throw Error(`@aws-sdk/core/protocols - xml serializer, cannot write non-member list: ${H.getName(!0)}`);
        let K = H.getMergedTraits(),
          O = H.getValueSchema(),
          T = O.getMergedTraits(),
          z = !!T.sparse,
          A = !!K.xmlFlattened,
          [f, w] = this.getXmlnsAttribute(H, $),
          Y = (D, j) => {
            if (O.isListSchema()) this.writeList(O, Array.isArray(j) ? j : [j], D, w);
            else if (O.isMapSchema()) this.writeMap(O, j, D, w);
            else if (O.isStructSchema()) {
              let M = this.writeStruct(O, j, w);
              D.addChildNode(M.withName(A ? (K.xmlName ?? H.getMemberName()) : (T.xmlName ?? "member")));
            } else {
              let M = JS.XmlNode.of(A ? (K.xmlName ?? H.getMemberName()) : (T.xmlName ?? "member"));
              this.writeSimpleInto(O, j, M, w), D.addChildNode(M);
            }
          };
        if (A) {
          for (let D of _) if (z || D != null) Y(q, D);
        } else {
          let D = JS.XmlNode.of(K.xmlName ?? H.getMemberName());
          if (w) D.addAttribute(f, w);
          for (let j of _) if (z || j != null) Y(D, j);
          q.addChildNode(D);
        }
      }
      writeMap(H, _, q, $, K = !1) {
        if (!H.isMemberSchema())
          throw Error(`@aws-sdk/core/protocols - xml serializer, cannot write non-member map: ${H.getName(!0)}`);
        let O = H.getMergedTraits(),
          T = H.getKeySchema(),
          A = T.getMergedTraits().xmlName ?? "key",
          f = H.getValueSchema(),
          w = f.getMergedTraits(),
          Y = w.xmlName ?? "value",
          D = !!w.sparse,
          j = !!O.xmlFlattened,
          [M, J] = this.getXmlnsAttribute(H, $),
          P = (X, R, W) => {
            let Z = JS.XmlNode.of(A, R),
              [k, v] = this.getXmlnsAttribute(T, J);
            if (v) Z.addAttribute(k, v);
            X.addChildNode(Z);
            let y = JS.XmlNode.of(Y);
            if (f.isListSchema()) this.writeList(f, W, y, J);
            else if (f.isMapSchema()) this.writeMap(f, W, y, J, !0);
            else if (f.isStructSchema()) y = this.writeStruct(f, W, J);
            else this.writeSimpleInto(f, W, y, J);
            X.addChildNode(y);
          };
        if (j) {
          for (let [X, R] of Object.entries(_))
            if (D || R != null) {
              let W = JS.XmlNode.of(O.xmlName ?? H.getMemberName());
              P(W, X, R), q.addChildNode(W);
            }
        } else {
          let X;
          if (!K) {
            if (((X = JS.XmlNode.of(O.xmlName ?? H.getMemberName())), J)) X.addAttribute(M, J);
            q.addChildNode(X);
          }
          for (let [R, W] of Object.entries(_))
            if (D || W != null) {
              let Z = JS.XmlNode.of("entry");
              P(Z, R, W), (K ? q : X).addChildNode(Z);
            }
        }
      }
      writeSimple(H, _) {
        if (_ === null) throw Error("@aws-sdk/core/protocols - (XML serializer) cannot write null value.");
        let q = dT.NormalizedSchema.of(H),
          $ = null;
        if (_ && typeof _ === "object")
          if (q.isBlobSchema()) $ = (this.serdeContext?.base64Encoder ?? KmH.toBase64)(_);
          else if (q.isTimestampSchema() && _ instanceof Date)
            switch (MX.determineTimestampFormat(q, this.settings)) {
              case 5:
                $ = _.toISOString().replace(".000Z", "Z");
                break;
              case 6:
                $ = rQ.dateToUtcString(_);
                break;
              case 7:
                $ = String(_.getTime() / 1000);
                break;
              default:
                console.warn("Missing timestamp format, using http date", _), ($ = rQ.dateToUtcString(_));
                break;
            }
          else if (q.isBigDecimalSchema() && _) {
            if (_ instanceof xJ.NumericValue) return _.string;
            return String(_);
          } else if (q.isMapSchema() || q.isListSchema())
            throw Error(
              "@aws-sdk/core/protocols - xml serializer, cannot call _write() on List/Map schema, call writeList or writeMap() instead.",
            );
          else
            throw Error(
              `@aws-sdk/core/protocols - xml serializer, unhandled schema type for object value and schema: ${q.getName(!0)}`,
            );
        if (q.isBooleanSchema() || q.isNumericSchema() || q.isBigIntegerSchema() || q.isBigDecimalSchema())
          $ = String(_);
        if (q.isStringSchema())
          if (_ === void 0 && q.isIdempotencyToken()) $ = xJ.generateIdempotencyToken();
          else $ = String(_);
        if ($ === null) throw Error(`Unhandled schema-value pair ${q.getName(!0)}=${_}`);
        return $;
      }
      writeSimpleInto(H, _, q, $) {
        let K = this.writeSimple(H, _),
          O = dT.NormalizedSchema.of(H),
          T = new JS.XmlText(K),
          [z, A] = this.getXmlnsAttribute(O, $);
        if (A) q.addAttribute(z, A);
        q.addChildNode(T);
      }
      getXmlnsAttribute(H, _) {
        let q = H.getMergedTraits(),
          [$, K] = q.xmlNamespace ?? [];
        if (K && K !== _) return [$ ? `xmlns:${$}` : "xmlns", K];
        return [void 0, void 0];
      }
    }
    class G36 extends Ae {
      settings;
      constructor(H) {
        super();
        this.settings = H;
      }
      createSerializer() {
        let H = new W36(this.settings);
        return H.setSerdeContext(this.serdeContext), H;
      }
      createDeserializer() {
        let H = new OT_(this.settings);
        return H.setSerdeContext(this.serdeContext), H;
      }
    }
    class zu8 extends MX.HttpBindingProtocol {
      codec;
      serializer;
      deserializer;
      mixin = new KJH();
      constructor(H) {
        super(H);
        let _ = {
          timestampFormat: { useTrait: !0, default: 5 },
          httpBindings: !0,
          xmlNamespace: H.xmlNamespace,
          serviceNamespace: H.defaultNamespace,
        };
        (this.codec = new G36(_)),
          (this.serializer = new MX.HttpInterceptingShapeSerializer(this.codec.createSerializer(), _)),
          (this.deserializer = new MX.HttpInterceptingShapeDeserializer(this.codec.createDeserializer(), _));
      }
      getPayloadCodec() {
        return this.codec;
      }
      getShapeId() {
        return "aws.protocols#restXml";
      }
      async serializeRequest(H, _, q) {
        let $ = await super.serializeRequest(H, _, q),
          K = dT.NormalizedSchema.of(H.input);
        if (!$.headers["content-type"]) {
          let O = this.mixin.resolveRestContentType(this.getDefaultContentType(), K);
          if (O) $.headers["content-type"] = O;
        }
        if ($.headers["content-type"] === this.getDefaultContentType()) {
          if (typeof $.body === "string") $.body = '<?xml version="1.0" encoding="UTF-8"?>' + $.body;
        }
        return $;
      }
      async deserializeResponse(H, _, q) {
        return super.deserializeResponse(H, _, q);
      }
      async handleError(H, _, q, $, K) {
        let O = Tu8(q, $) ?? "Unknown",
          { errorSchema: T, errorMetadata: z } = await this.mixin.getErrorSchemaOrThrowBaseException(
            O,
            this.options.defaultNamespace,
            q,
            $,
            K,
          ),
          A = dT.NormalizedSchema.of(T),
          f = $.Error?.message ?? $.Error?.Message ?? $.message ?? $.Message ?? "Unknown",
          Y = new (dT.TypeRegistry.for(T[1]).getErrorCtor(T) ?? Error)(f);
        await this.deserializeHttpMessage(T, _, q, $);
        let D = {};
        for (let [j, M] of A.structIterator()) {
          let J = M.getMergedTraits().xmlName ?? j,
            P = $.Error?.[J] ?? $[J];
          D[j] = this.codec.createDeserializer().readSchema(M, P);
        }
        throw this.mixin.decorateServiceException(
          Object.assign(Y, z, { $fault: A.getMergedTraits().error, message: f }, D),
          $,
        );
      }
      getDefaultContentType() {
        return "application/xml";
      }
    }
    Gf.AwsEc2QueryProtocol = Ku8;
    Gf.AwsJson1_0Protocol = Hu8;
    Gf.AwsJson1_1Protocol = _u8;
    Gf.AwsJsonRpcProtocol = KT_;
    Gf.AwsQueryProtocol = X36;
    Gf.AwsRestJsonProtocol = qu8;
    Gf.AwsRestXmlProtocol = zu8;
    Gf.AwsSmithyRpcV2CborProtocol = sI8;
    Gf.JsonCodec = $T_;
    Gf.JsonShapeDeserializer = J36;
    Gf.JsonShapeSerializer = P36;
    Gf.XmlCodec = G36;
    Gf.XmlShapeDeserializer = OT_;
    Gf.XmlShapeSerializer = W36;
    Gf._toBool = Uv$;
    Gf._toNum = Qv$;
    Gf._toStr = Fv$;
    Gf.awsExpectUnion = nv$;
    Gf.loadRestJsonErrorCode = M36;
    Gf.loadRestXmlErrorCode = Tu8;
    Gf.parseJsonBody = j36;
    Gf.parseJsonErrorBody = iv$;
    Gf.parseXmlBody = Ou8;
    Gf.parseXmlErrorBody = rv$;
  });
