  var J56 = d((mT) => {
    var DC8 = S0(),
      j56 = xA(),
      w56 = XK6(),
      mR$ = qz(),
      wC8 = _k();
    class jC8 {
      config;
      middlewareStack = DC8.constructStack();
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
    var f56 = "***SensitiveInformation***";
    function Y56(H, _) {
      if (_ == null) return _;
      let q = mR$.NormalizedSchema.of(H);
      if (q.getMergedTraits().sensitive) return f56;
      if (q.isListSchema()) {
        if (!!q.getValueSchema().getMergedTraits().sensitive) return f56;
      } else if (q.isMapSchema()) {
        if (!!q.getKeySchema().getMergedTraits().sensitive || !!q.getValueSchema().getMergedTraits().sensitive)
          return f56;
      } else if (q.isStructSchema() && typeof _ === "object") {
        let $ = _,
          K = {};
        for (let [O, T] of q.structIterator()) if ($[O] != null) K[O] = Y56(T, $[O]);
        return K;
      }
      return _;
    }
    class M56 {
      middlewareStack = DC8.constructStack();
      schema;
      static classBuilder() {
        return new MC8();
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
            [w56.SMITHY_CONTEXT_KEY]: { commandInstance: this, ...A },
            ...f,
          },
          { requestHandler: M } = _;
        return Y.resolve((J) => M.handle(J.request, q || {}), j);
      }
    }
    class MC8 {
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
        return (_ = class extends M56 {
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
              inputFilterSensitiveLog: H._inputFilterSensitiveLog ?? (O ? Y56.bind(null, T) : (A) => A),
              outputFilterSensitiveLog: H._outputFilterSensitiveLog ?? (O ? Y56.bind(null, z) : (A) => A),
              smithyContext: H._smithyContext,
              additionalContext: H._additionalContext,
            });
          }
          serialize = H._serializer;
          deserialize = H._deserializer;
        });
      }
    }
    var pR$ = "***SensitiveInformation***",
      BR$ = (H, _) => {
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
    class sMH extends Error {
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
          sMH.prototype.isPrototypeOf(_) ||
          (Boolean(_.$fault) && Boolean(_.$metadata) && (_.$fault === "client" || _.$fault === "server"))
        );
      }
      static [Symbol.hasInstance](H) {
        if (!H) return !1;
        let _ = H;
        if (this === sMH) return sMH.isInstance(H);
        if (sMH.isInstance(H)) {
          if (_.name && this.name) return this.prototype.isPrototypeOf(H) || _.name === this.name;
          return this.prototype.isPrototypeOf(H);
        }
        return !1;
      }
    }
    var JC8 = (H, _ = {}) => {
        Object.entries(_)
          .filter(([, $]) => $ !== void 0)
          .forEach(([$, K]) => {
            if (H[$] == null || H[$] === "") H[$] = K;
          });
        let q = H.message || H.Message || "UnknownError";
        return (H.message = q), delete H.Message, H;
      },
      PC8 = ({ output: H, parsedBody: _, exceptionCtor: q, errorCode: $ }) => {
        let K = dR$(H),
          O = K.httpStatusCode ? K.httpStatusCode + "" : void 0,
          T = new q({ name: _?.code || _?.Code || $ || O || "UnknownError", $fault: "client", $metadata: K });
        throw JC8(T, _);
      },
      gR$ = (H) => {
        return ({ output: _, parsedBody: q, errorCode: $ }) => {
          PC8({ output: _, parsedBody: q, exceptionCtor: H, errorCode: $ });
        };
      },
      dR$ = (H) => ({
        httpStatusCode: H.statusCode,
        requestId: H.headers["x-amzn-requestid"] ?? H.headers["x-amzn-request-id"] ?? H.headers["x-amz-request-id"],
        extendedRequestId: H.headers["x-amz-id-2"],
        cfId: H.headers["x-amz-cf-id"],
      }),
      cR$ = (H) => {
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
      YC8 = !1,
      FR$ = (H) => {
        if (H && !YC8 && parseInt(H.substring(1, H.indexOf("."))) < 16) YC8 = !0;
      },
      UR$ = (H) => {
        let _ = [];
        for (let q in w56.AlgorithmId) {
          let $ = w56.AlgorithmId[q];
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
      QR$ = (H) => {
        let _ = {};
        return (
          H.checksumAlgorithms().forEach((q) => {
            _[q.algorithmId()] = q.checksumConstructor();
          }),
          _
        );
      },
      lR$ = (H) => {
        return {
          setRetryStrategy(_) {
            H.retryStrategy = _;
          },
          retryStrategy() {
            return H.retryStrategy;
          },
        };
      },
      iR$ = (H) => {
        let _ = {};
        return (_.retryStrategy = H.retryStrategy()), _;
      },
      XC8 = (H) => {
        return Object.assign(UR$(H), lR$(H));
      },
      nR$ = XC8,
      rR$ = (H) => {
        return Object.assign(QR$(H), iR$(H));
      },
      oR$ = (H) => (Array.isArray(H) ? H : [H]),
      WC8 = (H) => {
        for (let q in H)
          if (H.hasOwnProperty(q) && H[q]["#text"] !== void 0) H[q] = H[q]["#text"];
          else if (typeof H[q] === "object" && H[q] !== null) H[q] = WC8(H[q]);
        return H;
      },
      aR$ = (H) => {
        return H != null;
      };
    class GC8 {
      trace() {}
      debug() {}
      info() {}
      warn() {}
      error() {}
    }
    function RC8(H, _, q) {
      let $, K, O;
      if (typeof _ > "u" && typeof q > "u") ($ = {}), (O = H);
      else if ((($ = H), typeof _ === "function")) return (K = _), (O = q), eR$($, K, O);
      else O = _;
      for (let T of Object.keys(O)) {
        if (!Array.isArray(O[T])) {
          $[T] = O[T];
          continue;
        }
        ZC8($, null, O, T);
      }
      return $;
    }
    var sR$ = (H) => {
        let _ = {};
        for (let [q, $] of Object.entries(H || {})) _[q] = [, $];
        return _;
      },
      tR$ = (H, _) => {
        let q = {};
        for (let $ in _) ZC8(q, H, _, $);
        return q;
      },
      eR$ = (H, _, q) => {
        return RC8(
          H,
          Object.entries(q).reduce(($, [K, O]) => {
            if (Array.isArray(O)) $[K] = O;
            else if (typeof O === "function") $[K] = [_, O()];
            else $[K] = [_, O];
            return $;
          }, {}),
        );
      },
      ZC8 = (H, _, q, $) => {
        if (_ !== null) {
          let T = q[$];
          if (typeof T === "function") T = [, T];
          let [z = HZ$, A = _Z$, f = $] = T;
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
      HZ$ = (H) => H != null,
      _Z$ = (H) => H,
      qZ$ = (H) => {
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
      $Z$ = (H) => H.toISOString().replace(".000Z", "Z"),
      D56 = (H) => {
        if (H == null) return {};
        if (Array.isArray(H)) return H.filter((_) => _ != null).map(D56);
        if (typeof H === "object") {
          let _ = {};
          for (let q of Object.keys(H)) {
            if (H[q] == null) continue;
            _[q] = D56(H[q]);
          }
          return _;
        }
        return H;
      };
    Object.defineProperty(mT, "collectBody", {
      enumerable: !0,
      get: function () {
        return j56.collectBody;
      },
    });
    Object.defineProperty(mT, "extendedEncodeURIComponent", {
      enumerable: !0,
      get: function () {
        return j56.extendedEncodeURIComponent;
      },
    });
    Object.defineProperty(mT, "resolvedPath", {
      enumerable: !0,
      get: function () {
        return j56.resolvedPath;
      },
    });
    mT.Client = jC8;
    mT.Command = M56;
    mT.NoOpLogger = GC8;
    mT.SENSITIVE_STRING = pR$;
    mT.ServiceException = sMH;
    mT._json = D56;
    mT.convertMap = sR$;
    mT.createAggregatedClient = BR$;
    mT.decorateServiceException = JC8;
    mT.emitWarningIfUnsupportedVersion = FR$;
    mT.getArrayIfSingleItem = oR$;
    mT.getDefaultClientConfiguration = nR$;
    mT.getDefaultExtensionConfiguration = XC8;
    mT.getValueFromTextNode = WC8;
    mT.isSerializableHeaderValue = aR$;
    mT.loadConfigsForDefaultMode = cR$;
    mT.map = RC8;
    mT.resolveDefaultRuntimeConfig = rR$;
    mT.serializeDateTime = $Z$;
    mT.serializeFloat = qZ$;
    mT.take = tR$;
    mT.throwDefaultError = PC8;
    mT.withBaseException = gR$;
    Object.keys(wC8).forEach(function (H) {
      if (H !== "default" && !Object.prototype.hasOwnProperty.call(mT, H))
        Object.defineProperty(mT, H, {
          enumerable: !0,
          get: function () {
            return wC8[H];
          },
        });
    });
  });
