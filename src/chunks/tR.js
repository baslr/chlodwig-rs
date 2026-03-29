  var tR = d((gT) => {
    var NI8 = S0(),
      K36 = xA(),
      _36 = e56(),
      _v$ = qz(),
      kI8 = _k();
    class hI8 {
      config;
      middlewareStack = NI8.constructStack();
      initConfig;
      handlers;
      constructor(H) {
        this.config = H;
      }
      send(H, _, q) {
        let $ = typeof _ !== "function" ? _ : void 0,
          K = typeof _ === "function" ? _ : q,
          O = $ === void 0 && this.config.cacheMiddleware === !0,
          T;
        if (O) {
          if (!this.handlers) this.handlers = new WeakMap();
          let z = this.handlers;
          if (z.has(H.constructor)) T = z.get(H.constructor);
          else (T = H.resolveMiddleware(this.middlewareStack, this.config, $)), z.set(H.constructor, T);
        } else delete this.handlers, (T = H.resolveMiddleware(this.middlewareStack, this.config, $));
        if (K)
          T(H)
            .then(
              (z) => K(null, z.output),
              (z) => K(z),
            )
            .catch(() => {});
        else return T(H).then((z) => z.output);
      }
      destroy() {
        this.config?.requestHandler?.destroy?.(), delete this.handlers;
      }
    }
    var H36 = "***SensitiveInformation***";
    function q36(H, _) {
      if (_ == null) return _;
      let q = _v$.NormalizedSchema.of(H);
      if (q.getMergedTraits().sensitive) return H36;
      if (q.isListSchema()) {
        if (!!q.getValueSchema().getMergedTraits().sensitive) return H36;
      } else if (q.isMapSchema()) {
        if (!!q.getKeySchema().getMergedTraits().sensitive || !!q.getValueSchema().getMergedTraits().sensitive)
          return H36;
      } else if (q.isStructSchema() && typeof _ === "object") {
        let $ = _,
          K = {};
        for (let [O, T] of q.structIterator()) if ($[O] != null) K[O] = q36(T, $[O]);
        return K;
      }
      return _;
    }
    class O36 {
      middlewareStack = NI8.constructStack();
      schema;
      static classBuilder() {
        return new yI8();
      }
      resolveMiddlewareWithContext(
        H,
        _,
        q,
        {
          middlewareFn: $,
          clientName: K,
          commandName: O,
          inputFilterSensitiveLog: T,
          outputFilterSensitiveLog: z,
          smithyContext: A,
          additionalContext: f,
          CommandCtor: w,
        },
      ) {
        for (let J of $.bind(this)(w, H, _, q)) this.middlewareStack.use(J);
        let Y = H.concat(this.middlewareStack),
          { logger: D } = _,
          j = {
            logger: D,
            clientName: K,
            commandName: O,
            inputFilterSensitiveLog: T,
            outputFilterSensitiveLog: z,
            [_36.SMITHY_CONTEXT_KEY]: { commandInstance: this, ...A },
            ...f,
          },
          { requestHandler: M } = _;
        return Y.resolve((J) => M.handle(J.request, q || {}), j);
      }
    }
    class yI8 {
      _init = () => {};
      _ep = {};
      _middlewareFn = () => [];
      _commandName = "";
      _clientName = "";
      _additionalContext = {};
      _smithyContext = {};
      _inputFilterSensitiveLog = void 0;
      _outputFilterSensitiveLog = void 0;
      _serializer = null;
      _deserializer = null;
      _operationSchema;
      init(H) {
        this._init = H;
      }
      ep(H) {
        return (this._ep = H), this;
      }
      m(H) {
        return (this._middlewareFn = H), this;
      }
      s(H, _, q = {}) {
        return (this._smithyContext = { service: H, operation: _, ...q }), this;
      }
      c(H = {}) {
        return (this._additionalContext = H), this;
      }
      n(H, _) {
        return (this._clientName = H), (this._commandName = _), this;
      }
      f(H = (q) => q, _ = (q) => q) {
        return (this._inputFilterSensitiveLog = H), (this._outputFilterSensitiveLog = _), this;
      }
      ser(H) {
        return (this._serializer = H), this;
      }
      de(H) {
        return (this._deserializer = H), this;
      }
      sc(H) {
        return (this._operationSchema = H), (this._smithyContext.operationSchema = H), this;
      }
      build() {
        let H = this,
          _;
        return (_ = class extends O36 {
          input;
          static getEndpointParameterInstructions() {
            return H._ep;
          }
          constructor(...[q]) {
            super();
            (this.input = q ?? {}), H._init(this), (this.schema = H._operationSchema);
          }
          resolveMiddleware(q, $, K) {
            let O = H._operationSchema,
              T = O?.[4] ?? O?.input,
              z = O?.[5] ?? O?.output;
            return this.resolveMiddlewareWithContext(q, $, K, {
              CommandCtor: _,
              middlewareFn: H._middlewareFn,
              clientName: H._clientName,
              commandName: H._commandName,
              inputFilterSensitiveLog: H._inputFilterSensitiveLog ?? (O ? q36.bind(null, T) : (A) => A),
              outputFilterSensitiveLog: H._outputFilterSensitiveLog ?? (O ? q36.bind(null, z) : (A) => A),
              smithyContext: H._smithyContext,
              additionalContext: H._additionalContext,
            });
          }
          serialize = H._serializer;
          deserialize = H._deserializer;
        });
      }
    }
    var qv$ = "***SensitiveInformation***",
      $v$ = (H, _) => {
        for (let q of Object.keys(H)) {
          let $ = H[q],
            K = async function (T, z, A) {
              let f = new $(T);
              if (typeof z === "function") this.send(f, z);
              else if (typeof A === "function") {
                if (typeof z !== "object") throw Error(`Expected http options but got ${typeof z}`);
                this.send(f, z || {}, A);
              } else return this.send(f, z);
            },
            O = (q[0].toLowerCase() + q.slice(1)).replace(/Command$/, "");
          _.prototype[O] = K;
        }
      };
    class $JH extends Error {
      $fault;
      $response;
      $retryable;
      $metadata;
      constructor(H) {
        super(H.message);
        Object.setPrototypeOf(this, Object.getPrototypeOf(this).constructor.prototype),
          (this.name = H.name),
          (this.$fault = H.$fault),
          (this.$metadata = H.$metadata);
      }
      static isInstance(H) {
        if (!H) return !1;
        let _ = H;
        return (
          $JH.prototype.isPrototypeOf(_) ||
          (Boolean(_.$fault) && Boolean(_.$metadata) && (_.$fault === "client" || _.$fault === "server"))
        );
      }
      static [Symbol.hasInstance](H) {
        if (!H) return !1;
        let _ = H;
        if (this === $JH) return $JH.isInstance(H);
        if ($JH.isInstance(H)) {
          if (_.name && this.name) return this.prototype.isPrototypeOf(H) || _.name === this.name;
          return this.prototype.isPrototypeOf(H);
        }
        return !1;
      }
    }
    var VI8 = (H, _ = {}) => {
        Object.entries(_)
          .filter(([, $]) => $ !== void 0)
          .forEach(([$, K]) => {
            if (H[$] == null || H[$] === "") H[$] = K;
          });
        let q = H.message || H.Message || "UnknownError";
        return (H.message = q), delete H.Message, H;
      },
      SI8 = ({ output: H, parsedBody: _, exceptionCtor: q, errorCode: $ }) => {
        let K = Ov$(H),
          O = K.httpStatusCode ? K.httpStatusCode + "" : void 0,
          T = new q({ name: _?.code || _?.Code || $ || O || "UnknownError", $fault: "client", $metadata: K });
        throw VI8(T, _);
      },
      Kv$ = (H) => {
        return ({ output: _, parsedBody: q, errorCode: $ }) => {
          SI8({ output: _, parsedBody: q, exceptionCtor: H, errorCode: $ });
        };
      },
      Ov$ = (H) => ({
        httpStatusCode: H.statusCode,
        requestId: H.headers["x-amzn-requestid"] ?? H.headers["x-amzn-request-id"] ?? H.headers["x-amz-request-id"],
        extendedRequestId: H.headers["x-amz-id-2"],
        cfId: H.headers["x-amz-cf-id"],
      }),
      Tv$ = (H) => {
        switch (H) {
          case "standard":
            return { retryMode: "standard", connectionTimeout: 3100 };
          case "in-region":
            return { retryMode: "standard", connectionTimeout: 1100 };
          case "cross-region":
            return { retryMode: "standard", connectionTimeout: 3100 };
          case "mobile":
            return { retryMode: "standard", connectionTimeout: 30000 };
          default:
            return {};
        }
      },
      vI8 = !1,
      zv$ = (H) => {
        if (H && !vI8 && parseInt(H.substring(1, H.indexOf("."))) < 16) vI8 = !0;
      },
      Av$ = (H) => {
        let _ = [];
        for (let q in _36.AlgorithmId) {
          let $ = _36.AlgorithmId[q];
          if (H[$] === void 0) continue;
          _.push({ algorithmId: () => $, checksumConstructor: () => H[$] });
        }
        return {
          addChecksumAlgorithm(q) {
            _.push(q);
          },
          checksumAlgorithms() {
            return _;
          },
        };
      },
      fv$ = (H) => {
        let _ = {};
        return (
          H.checksumAlgorithms().forEach((q) => {
            _[q.algorithmId()] = q.checksumConstructor();
          }),
          _
        );
      },
      wv$ = (H) => {
        return {
          setRetryStrategy(_) {
            H.retryStrategy = _;
          },
          retryStrategy() {
            return H.retryStrategy;
          },
        };
      },
      Yv$ = (H) => {
        let _ = {};
        return (_.retryStrategy = H.retryStrategy()), _;
      },
      EI8 = (H) => {
        return Object.assign(Av$(H), wv$(H));
      },
      Dv$ = EI8,
      jv$ = (H) => {
        return Object.assign(fv$(H), Yv$(H));
      },
      Mv$ = (H) => (Array.isArray(H) ? H : [H]),
      CI8 = (H) => {
        for (let q in H)
          if (H.hasOwnProperty(q) && H[q]["#text"] !== void 0) H[q] = H[q]["#text"];
          else if (typeof H[q] === "object" && H[q] !== null) H[q] = CI8(H[q]);
        return H;
      },
      Jv$ = (H) => {
        return H != null;
      };
    class bI8 {
      trace() {}
      debug() {}
      info() {}
      warn() {}
      error() {}
    }
    function II8(H, _, q) {
      let $, K, O;
      if (typeof _ > "u" && typeof q > "u") ($ = {}), (O = H);
      else if ((($ = H), typeof _ === "function")) return (K = _), (O = q), Wv$($, K, O);
      else O = _;
      for (let T of Object.keys(O)) {
        if (!Array.isArray(O[T])) {
          $[T] = O[T];
          continue;
        }
        uI8($, null, O, T);
      }
      return $;
    }
    var Pv$ = (H) => {
        let _ = {};
        for (let [q, $] of Object.entries(H || {})) _[q] = [, $];
        return _;
      },
      Xv$ = (H, _) => {
        let q = {};
        for (let $ in _) uI8(q, H, _, $);
        return q;
      },
      Wv$ = (H, _, q) => {
        return II8(
          H,
          Object.entries(q).reduce(($, [K, O]) => {
            if (Array.isArray(O)) $[K] = O;
            else if (typeof O === "function") $[K] = [_, O()];
            else $[K] = [_, O];
            return $;
          }, {}),
        );
      },
      uI8 = (H, _, q, $) => {
        if (_ !== null) {
          let T = q[$];
          if (typeof T === "function") T = [, T];
          let [z = Gv$, A = Rv$, f = $] = T;
          if ((typeof z === "function" && z(_[f])) || (typeof z !== "function" && !!z)) H[$] = A(_[f]);
          return;
        }
        let [K, O] = q[$];
        if (typeof O === "function") {
          let T,
            z = K === void 0 && (T = O()) != null,
            A = (typeof K === "function" && !!K(void 0)) || (typeof K !== "function" && !!K);
          if (z) H[$] = T;
          else if (A) H[$] = O();
        } else {
          let T = K === void 0 && O != null,
            z = (typeof K === "function" && !!K(O)) || (typeof K !== "function" && !!K);
          if (T || z) H[$] = O;
        }
      },
      Gv$ = (H) => H != null,
      Rv$ = (H) => H,
      Zv$ = (H) => {
        if (H !== H) return "NaN";
        switch (H) {
          case 1 / 0:
            return "Infinity";
          case -1 / 0:
            return "-Infinity";
          default:
            return H;
        }
      },
      Lv$ = (H) => H.toISOString().replace(".000Z", "Z"),
      $36 = (H) => {
        if (H == null) return {};
        if (Array.isArray(H)) return H.filter((_) => _ != null).map($36);
        if (typeof H === "object") {
          let _ = {};
          for (let q of Object.keys(H)) {
            if (H[q] == null) continue;
            _[q] = $36(H[q]);
          }
          return _;
        }
        return H;
      };
    Object.defineProperty(gT, "collectBody", {
      enumerable: !0,
      get: function () {
        return K36.collectBody;
      },
    });
    Object.defineProperty(gT, "extendedEncodeURIComponent", {
      enumerable: !0,
      get: function () {
        return K36.extendedEncodeURIComponent;
      },
    });
    Object.defineProperty(gT, "resolvedPath", {
      enumerable: !0,
      get: function () {
        return K36.resolvedPath;
      },
    });
    gT.Client = hI8;
    gT.Command = O36;
    gT.NoOpLogger = bI8;
    gT.SENSITIVE_STRING = qv$;
    gT.ServiceException = $JH;
    gT._json = $36;
    gT.convertMap = Pv$;
    gT.createAggregatedClient = $v$;
    gT.decorateServiceException = VI8;
    gT.emitWarningIfUnsupportedVersion = zv$;
    gT.getArrayIfSingleItem = Mv$;
    gT.getDefaultClientConfiguration = Dv$;
    gT.getDefaultExtensionConfiguration = EI8;
    gT.getValueFromTextNode = CI8;
    gT.isSerializableHeaderValue = Jv$;
    gT.loadConfigsForDefaultMode = Tv$;
    gT.map = II8;
    gT.resolveDefaultRuntimeConfig = jv$;
    gT.serializeDateTime = Lv$;
    gT.serializeFloat = Zv$;
    gT.take = Xv$;
    gT.throwDefaultError = SI8;
    gT.withBaseException = Kv$;
    Object.keys(kI8).forEach(function (H) {
      if (H !== "default" && !Object.prototype.hasOwnProperty.call(gT, H))
        Object.defineProperty(gT, H, {
          enumerable: !0,
          get: function () {
            return kI8[H];
          },
        });
    });
  });
