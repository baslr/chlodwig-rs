  var xA = d((aR) => {
    var KO_ = x16(),
      jS = qz(),
      DS = _k(),
      UxH = IxH(),
      OO_ = $K6(),
      KK6 = cz(),
      u1H = async (H = new Uint8Array(), _) => {
        if (H instanceof Uint8Array) return KO_.Uint8ArrayBlobAdapter.mutate(H);
        if (!H) return KO_.Uint8ArrayBlobAdapter.mutate(new Uint8Array());
        let q = _.streamCollector(H);
        return KO_.Uint8ArrayBlobAdapter.mutate(await q);
      };
    function QxH(H) {
      return encodeURIComponent(H).replace(/[!'()*]/g, function (_) {
        return "%" + _.charCodeAt(0).toString(16).toUpperCase();
      });
    }
    class UMH {
      serdeContext;
      setSerdeContext(H) {
        this.serdeContext = H;
      }
    }
    class TO_ extends UMH {
      options;
      constructor(H) {
        super();
        this.options = H;
      }
      getRequestType() {
        return UxH.HttpRequest;
      }
      getResponseType() {
        return UxH.HttpResponse;
      }
      setSerdeContext(H) {
        if (
          ((this.serdeContext = H),
          this.serializer.setSerdeContext(H),
          this.deserializer.setSerdeContext(H),
          this.getPayloadCodec())
        )
          this.getPayloadCodec().setSerdeContext(H);
      }
      updateServiceEndpoint(H, _) {
        if ("url" in _) {
          if (
            ((H.protocol = _.url.protocol),
            (H.hostname = _.url.hostname),
            (H.port = _.url.port ? Number(_.url.port) : void 0),
            (H.path = _.url.pathname),
            (H.fragment = _.url.hash || void 0),
            (H.username = _.url.username || void 0),
            (H.password = _.url.password || void 0),
            !H.query)
          )
            H.query = {};
          for (let [q, $] of _.url.searchParams.entries()) H.query[q] = $;
          return H;
        } else
          return (
            (H.protocol = _.protocol),
            (H.hostname = _.hostname),
            (H.port = _.port ? Number(_.port) : void 0),
            (H.path = _.path),
            (H.query = { ..._.query }),
            H
          );
      }
      setHostPrefix(H, _, q) {
        let $ = jS.NormalizedSchema.of(_.input),
          K = jS.translateTraits(_.traits ?? {});
        if (K.endpoint) {
          let O = K.endpoint?.[0];
          if (typeof O === "string") {
            let T = [...$.structIterator()].filter(([, z]) => z.getMergedTraits().hostLabel);
            for (let [z] of T) {
              let A = q[z];
              if (typeof A !== "string")
                throw Error(`@smithy/core/schema - ${z} in input must be a string as hostLabel.`);
              O = O.replace(`{${z}}`, A);
            }
            H.hostname = O + H.hostname;
          }
        }
      }
      deserializeMetadata(H) {
        return {
          httpStatusCode: H.statusCode,
          requestId: H.headers["x-amzn-requestid"] ?? H.headers["x-amzn-request-id"] ?? H.headers["x-amz-request-id"],
          extendedRequestId: H.headers["x-amz-id-2"],
          cfId: H.headers["x-amz-cf-id"],
        };
      }
      async serializeEventStream({ eventStream: H, requestSchema: _, initialRequest: q }) {
        return (await this.loadEventStreamCapability()).serializeEventStream({
          eventStream: H,
          requestSchema: _,
          initialRequest: q,
        });
      }
      async deserializeEventStream({ response: H, responseSchema: _, initialResponseContainer: q }) {
        return (await this.loadEventStreamCapability()).deserializeEventStream({
          response: H,
          responseSchema: _,
          initialResponseContainer: q,
        });
      }
      async loadEventStreamCapability() {
        let { EventStreamSerde: H } = await Promise.resolve().then(() => u(sy8()));
        return new H({
          marshaller: this.getEventStreamMarshaller(),
          serializer: this.serializer,
          deserializer: this.deserializer,
          serdeContext: this.serdeContext,
          defaultContentType: this.getDefaultContentType(),
        });
      }
      getDefaultContentType() {
        throw Error(
          `@smithy/core/protocols - ${this.constructor.name} getDefaultContentType() implementation missing.`,
        );
      }
      async deserializeHttpMessage(H, _, q, $, K) {
        return [];
      }
      getEventStreamMarshaller() {
        let H = this.serdeContext;
        if (!H.eventStreamMarshaller)
          throw Error("@smithy/core - HttpProtocol: eventStreamMarshaller missing in serdeContext.");
        return H.eventStreamMarshaller;
      }
    }
    class ty8 extends TO_ {
      async serializeRequest(H, _, q) {
        let $ = { ...(_ ?? {}) },
          K = this.serializer,
          O = {},
          T = {},
          z = await q.endpoint(),
          A = jS.NormalizedSchema.of(H?.input),
          f = A.getSchema(),
          w = !1,
          Y,
          D = new UxH.HttpRequest({
            protocol: "",
            hostname: "",
            port: void 0,
            path: "",
            fragment: void 0,
            query: O,
            headers: T,
            body: void 0,
          });
        if (z) {
          this.updateServiceEndpoint(D, z), this.setHostPrefix(D, H, $);
          let j = jS.translateTraits(H.traits);
          if (j.http) {
            D.method = j.http[0];
            let [M, J] = j.http[1].split("?");
            if (D.path == "/") D.path = M;
            else D.path += M;
            let P = new URLSearchParams(J ?? "");
            Object.assign(O, Object.fromEntries(P));
          }
        }
        for (let [j, M] of A.structIterator()) {
          let J = M.getMergedTraits() ?? {},
            P = $[j];
          if (P == null && !M.isIdempotencyToken()) continue;
          if (J.httpPayload) {
            if (M.isStreaming())
              if (M.isStructSchema()) {
                if ($[j]) Y = await this.serializeEventStream({ eventStream: $[j], requestSchema: A });
              } else Y = P;
            else K.write(M, P), (Y = K.flush());
            delete $[j];
          } else if (J.httpLabel) {
            K.write(M, P);
            let X = K.flush();
            if (D.path.includes(`{${j}+}`)) D.path = D.path.replace(`{${j}+}`, X.split("/").map(QxH).join("/"));
            else if (D.path.includes(`{${j}}`)) D.path = D.path.replace(`{${j}}`, QxH(X));
            delete $[j];
          } else if (J.httpHeader) K.write(M, P), (T[J.httpHeader.toLowerCase()] = String(K.flush())), delete $[j];
          else if (typeof J.httpPrefixHeaders === "string") {
            for (let [X, R] of Object.entries(P)) {
              let W = J.httpPrefixHeaders + X;
              K.write([M.getValueSchema(), { httpHeader: W }], R), (T[W.toLowerCase()] = K.flush());
            }
            delete $[j];
          } else if (J.httpQuery || J.httpQueryParams) this.serializeQuery(M, P, O), delete $[j];
          else w = !0;
        }
        if (w && $) K.write(f, $), (Y = K.flush());
        return (D.headers = T), (D.query = O), (D.body = Y), D;
      }
      serializeQuery(H, _, q) {
        let $ = this.serializer,
          K = H.getMergedTraits();
        if (K.httpQueryParams) {
          for (let [O, T] of Object.entries(_))
            if (!(O in q)) {
              let z = H.getValueSchema();
              Object.assign(z.getMergedTraits(), { ...K, httpQuery: O, httpQueryParams: void 0 }),
                this.serializeQuery(z, T, q);
            }
          return;
        }
        if (H.isListSchema()) {
          let O = !!H.getMergedTraits().sparse,
            T = [];
          for (let z of _) {
            $.write([H.getValueSchema(), K], z);
            let A = $.flush();
            if (O || A !== void 0) T.push(A);
          }
          q[K.httpQuery] = T;
        } else $.write([H, K], _), (q[K.httpQuery] = $.flush());
      }
      async deserializeResponse(H, _, q) {
        let $ = this.deserializer,
          K = jS.NormalizedSchema.of(H.output),
          O = {};
        if (q.statusCode >= 300) {
          let z = await u1H(q.body, _);
          if (z.byteLength > 0) Object.assign(O, await $.read(15, z));
          throw (
            (await this.handleError(H, _, q, O, this.deserializeMetadata(q)),
            Error("@smithy/core/protocols - HTTP Protocol error handler failed to throw."))
          );
        }
        for (let z in q.headers) {
          let A = q.headers[z];
          delete q.headers[z], (q.headers[z.toLowerCase()] = A);
        }
        let T = await this.deserializeHttpMessage(K, _, q, O);
        if (T.length) {
          let z = await u1H(q.body, _);
          if (z.byteLength > 0) {
            let A = await $.read(K, z);
            for (let f of T) O[f] = A[f];
          }
        } else if (T.discardResponseBody) await u1H(q.body, _);
        return (O.$metadata = this.deserializeMetadata(q)), O;
      }
      async deserializeHttpMessage(H, _, q, $, K) {
        let O;
        if ($ instanceof Set) O = K;
        else O = $;
        let T = !0,
          z = this.deserializer,
          A = jS.NormalizedSchema.of(H),
          f = [];
        for (let [w, Y] of A.structIterator()) {
          let D = Y.getMemberTraits();
          if (D.httpPayload) {
            if (((T = !1), Y.isStreaming()))
              if (Y.isStructSchema()) O[w] = await this.deserializeEventStream({ response: q, responseSchema: A });
              else O[w] = KO_.sdkStreamMixin(q.body);
            else if (q.body) {
              let M = await u1H(q.body, _);
              if (M.byteLength > 0) O[w] = await z.read(Y, M);
            }
          } else if (D.httpHeader) {
            let j = String(D.httpHeader).toLowerCase(),
              M = q.headers[j];
            if (M != null)
              if (Y.isListSchema()) {
                let J = Y.getValueSchema();
                J.getMergedTraits().httpHeader = j;
                let P;
                if (J.isTimestampSchema() && J.getSchema() === 4) P = DS.splitEvery(M, ",", 2);
                else P = DS.splitHeader(M);
                let X = [];
                for (let R of P) X.push(await z.read(J, R.trim()));
                O[w] = X;
              } else O[w] = await z.read(Y, M);
          } else if (D.httpPrefixHeaders !== void 0) {
            O[w] = {};
            for (let [j, M] of Object.entries(q.headers))
              if (j.startsWith(D.httpPrefixHeaders)) {
                let J = Y.getValueSchema();
                (J.getMergedTraits().httpHeader = j), (O[w][j.slice(D.httpPrefixHeaders.length)] = await z.read(J, M));
              }
          } else if (D.httpResponseCode) O[w] = q.statusCode;
          else f.push(w);
        }
        return (f.discardResponseBody = T), f;
      }
    }
    class ey8 extends TO_ {
      async serializeRequest(H, _, q) {
        let $ = this.serializer,
          K = {},
          O = {},
          T = await q.endpoint(),
          z = jS.NormalizedSchema.of(H?.input),
          A = z.getSchema(),
          f,
          w = new UxH.HttpRequest({
            protocol: "",
            hostname: "",
            port: void 0,
            path: "/",
            fragment: void 0,
            query: K,
            headers: O,
            body: void 0,
          });
        if (T) this.updateServiceEndpoint(w, T), this.setHostPrefix(w, H, _);
        let Y = { ..._ };
        if (_) {
          let D = z.getEventStreamMember();
          if (D) {
            if (Y[D]) {
              let j = {};
              for (let [M, J] of z.structIterator()) if (M !== D && Y[M]) $.write(J, Y[M]), (j[M] = $.flush());
              f = await this.serializeEventStream({ eventStream: Y[D], requestSchema: z, initialRequest: j });
            }
          } else $.write(A, Y), (f = $.flush());
        }
        return (w.headers = O), (w.query = K), (w.body = f), (w.method = "POST"), w;
      }
      async deserializeResponse(H, _, q) {
        let $ = this.deserializer,
          K = jS.NormalizedSchema.of(H.output),
          O = {};
        if (q.statusCode >= 300) {
          let z = await u1H(q.body, _);
          if (z.byteLength > 0) Object.assign(O, await $.read(15, z));
          throw (
            (await this.handleError(H, _, q, O, this.deserializeMetadata(q)),
            Error("@smithy/core/protocols - RPC Protocol error handler failed to throw."))
          );
        }
        for (let z in q.headers) {
          let A = q.headers[z];
          delete q.headers[z], (q.headers[z.toLowerCase()] = A);
        }
        let T = K.getEventStreamMember();
        if (T)
          O[T] = await this.deserializeEventStream({ response: q, responseSchema: K, initialResponseContainer: O });
        else {
          let z = await u1H(q.body, _);
          if (z.byteLength > 0) Object.assign(O, await $.read(K, z));
        }
        return (O.$metadata = this.deserializeMetadata(q)), O;
      }
    }
    var HV8 = (H, _, q, $, K, O) => {
      if (_ != null && _[q] !== void 0) {
        let T = $();
        if (T.length <= 0) throw Error("Empty value provided for input HTTP label: " + q + ".");
        H = H.replace(
          K,
          O
            ? T.split("/")
                .map((z) => QxH(z))
                .join("/")
            : QxH(T),
        );
      } else throw Error("No value provided for input HTTP label: " + q + ".");
      return H;
    };
    function JW$(H, _) {
      return new OK6(H, _);
    }
    class OK6 {
      input;
      context;
      query = {};
      method = "";
      headers = {};
      path = "";
      body = null;
      hostname = "";
      resolvePathStack = [];
      constructor(H, _) {
        (this.input = H), (this.context = _);
      }
      async build() {
        let { hostname: H, protocol: _ = "https", port: q, path: $ } = await this.context.endpoint();
        this.path = $;
        for (let K of this.resolvePathStack) K(this.path);
        return new UxH.HttpRequest({
          protocol: _,
          hostname: this.hostname || H,
          port: q,
          method: this.method,
          path: this.path,
          query: this.query,
          body: this.body,
          headers: this.headers,
        });
      }
      hn(H) {
        return (this.hostname = H), this;
      }
      bp(H) {
        return (
          this.resolvePathStack.push((_) => {
            this.path = `${_?.endsWith("/") ? _.slice(0, -1) : _ || ""}` + H;
          }),
          this
        );
      }
      p(H, _, q, $) {
        return (
          this.resolvePathStack.push((K) => {
            this.path = HV8(K, this.input, H, _, q, $);
          }),
          this
        );
      }
      h(H) {
        return (this.headers = H), this;
      }
      q(H) {
        return (this.query = H), this;
      }
      b(H) {
        return (this.body = H), this;
      }
      m(H) {
        return (this.method = H), this;
      }
    }
    function TK6(H, _) {
      if (_.timestampFormat.useTrait) {
        if (H.isTimestampSchema() && (H.getSchema() === 5 || H.getSchema() === 6 || H.getSchema() === 7))
          return H.getSchema();
      }
      let { httpLabel: q, httpPrefixHeaders: $, httpHeader: K, httpQuery: O } = H.getMergedTraits();
      return (
        (_.httpBindings ? (typeof $ === "string" || Boolean(K) ? 6 : Boolean(O) || Boolean(q) ? 5 : void 0) : void 0) ??
        _.timestampFormat.default
      );
    }
    class zK6 extends UMH {
      settings;
      constructor(H) {
        super();
        this.settings = H;
      }
      read(H, _) {
        let q = jS.NormalizedSchema.of(H);
        if (q.isListSchema()) return DS.splitHeader(_).map(($) => this.read(q.getValueSchema(), $));
        if (q.isBlobSchema()) return (this.serdeContext?.base64Decoder ?? OO_.fromBase64)(_);
        if (q.isTimestampSchema())
          switch (TK6(q, this.settings)) {
            case 5:
              return DS._parseRfc3339DateTimeWithOffset(_);
            case 6:
              return DS._parseRfc7231DateTime(_);
            case 7:
              return DS._parseEpochTimestamp(_);
            default:
              return console.warn("Missing timestamp format, parsing value with Date constructor:", _), new Date(_);
          }
        if (q.isStringSchema()) {
          let $ = q.getMergedTraits().mediaType,
            K = _;
          if ($) {
            if (q.getMergedTraits().httpHeader) K = this.base64ToUtf8(K);
            if ($ === "application/json" || $.endsWith("+json")) K = DS.LazyJsonString.from(K);
            return K;
          }
        }
        if (q.isNumericSchema()) return Number(_);
        if (q.isBigIntegerSchema()) return BigInt(_);
        if (q.isBigDecimalSchema()) return new DS.NumericValue(_, "bigDecimal");
        if (q.isBooleanSchema()) return String(_).toLowerCase() === "true";
        return _;
      }
      base64ToUtf8(H) {
        return (this.serdeContext?.utf8Encoder ?? KK6.toUtf8)((this.serdeContext?.base64Decoder ?? OO_.fromBase64)(H));
      }
    }
    class _V8 extends UMH {
      codecDeserializer;
      stringDeserializer;
      constructor(H, _) {
        super();
        (this.codecDeserializer = H), (this.stringDeserializer = new zK6(_));
      }
      setSerdeContext(H) {
        this.stringDeserializer.setSerdeContext(H), this.codecDeserializer.setSerdeContext(H), (this.serdeContext = H);
      }
      read(H, _) {
        let q = jS.NormalizedSchema.of(H),
          $ = q.getMergedTraits(),
          K = this.serdeContext?.utf8Encoder ?? KK6.toUtf8;
        if ($.httpHeader || $.httpResponseCode) return this.stringDeserializer.read(q, K(_));
        if ($.httpPayload) {
          if (q.isBlobSchema()) {
            let O = this.serdeContext?.utf8Decoder ?? KK6.fromUtf8;
            if (typeof _ === "string") return O(_);
            return _;
          } else if (q.isStringSchema()) {
            if ("byteLength" in _) return K(_);
            return _;
          }
        }
        return this.codecDeserializer.read(q, _);
      }
    }
    class AK6 extends UMH {
      settings;
      stringBuffer = "";
      constructor(H) {
        super();
        this.settings = H;
      }
      write(H, _) {
        let q = jS.NormalizedSchema.of(H);
        switch (typeof _) {
          case "object":
            if (_ === null) {
              this.stringBuffer = "null";
              return;
            }
            if (q.isTimestampSchema()) {
              if (!(_ instanceof Date))
                throw Error(
                  `@smithy/core/protocols - received non-Date value ${_} when schema expected Date in ${q.getName(!0)}`,
                );
              switch (TK6(q, this.settings)) {
                case 5:
                  this.stringBuffer = _.toISOString().replace(".000Z", "Z");
                  break;
                case 6:
                  this.stringBuffer = DS.dateToUtcString(_);
                  break;
                case 7:
                  this.stringBuffer = String(_.getTime() / 1000);
                  break;
                default:
                  console.warn("Missing timestamp format, using epoch seconds", _),
                    (this.stringBuffer = String(_.getTime() / 1000));
              }
              return;
            }
            if (q.isBlobSchema() && "byteLength" in _) {
              this.stringBuffer = (this.serdeContext?.base64Encoder ?? OO_.toBase64)(_);
              return;
            }
            if (q.isListSchema() && Array.isArray(_)) {
              let O = "";
              for (let T of _) {
                this.write([q.getValueSchema(), q.getMergedTraits()], T);
                let z = this.flush(),
                  A = q.getValueSchema().isTimestampSchema() ? z : DS.quoteHeader(z);
                if (O !== "") O += ", ";
                O += A;
              }
              this.stringBuffer = O;
              return;
            }
            this.stringBuffer = JSON.stringify(_, null, 2);
            break;
          case "string":
            let $ = q.getMergedTraits().mediaType,
              K = _;
            if ($) {
              if ($ === "application/json" || $.endsWith("+json")) K = DS.LazyJsonString.from(K);
              if (q.getMergedTraits().httpHeader) {
                this.stringBuffer = (this.serdeContext?.base64Encoder ?? OO_.toBase64)(K.toString());
                return;
              }
            }
            this.stringBuffer = _;
            break;
          default:
            if (q.isIdempotencyToken()) this.stringBuffer = DS.generateIdempotencyToken();
            else this.stringBuffer = String(_);
        }
      }
      flush() {
        let H = this.stringBuffer;
        return (this.stringBuffer = ""), H;
      }
    }
    class qV8 {
      codecSerializer;
      stringSerializer;
      buffer;
      constructor(H, _, q = new AK6(_)) {
        (this.codecSerializer = H), (this.stringSerializer = q);
      }
      setSerdeContext(H) {
        this.codecSerializer.setSerdeContext(H), this.stringSerializer.setSerdeContext(H);
      }
      write(H, _) {
        let q = jS.NormalizedSchema.of(H),
          $ = q.getMergedTraits();
        if ($.httpHeader || $.httpLabel || $.httpQuery) {
          this.stringSerializer.write(q, _), (this.buffer = this.stringSerializer.flush());
          return;
        }
        return this.codecSerializer.write(q, _);
      }
      flush() {
        if (this.buffer !== void 0) {
          let H = this.buffer;
          return (this.buffer = void 0), H;
        }
        return this.codecSerializer.flush();
      }
    }
    aR.FromStringShapeDeserializer = zK6;
    aR.HttpBindingProtocol = ty8;
    aR.HttpInterceptingShapeDeserializer = _V8;
    aR.HttpInterceptingShapeSerializer = qV8;
    aR.HttpProtocol = TO_;
    aR.RequestBuilder = OK6;
    aR.RpcProtocol = ey8;
    aR.SerdeContext = UMH;
    aR.ToStringShapeSerializer = AK6;
    aR.collectBody = u1H;
    aR.determineTimestampFormat = TK6;
    aR.extendedEncodeURIComponent = QxH;
    aR.requestBuilder = JW$;
    aR.resolvedPath = HV8;
  });
