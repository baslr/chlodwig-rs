  var mA = d((JK) => {
    var N56 = jO_(),
      He = m$(),
      CC8 = j3(),
      GZ$ = zj(),
      bC8 = xK6(),
      IC8 = A56(),
      pT = qz(),
      FQ = J56(),
      YX = xA(),
      uJ = _k(),
      qmH = G56(),
      dC8 = cz(),
      MS = k56(),
      v56 = { warningEmitted: !1 },
      RZ$ = (H) => {
        if (H && !v56.warningEmitted && parseInt(H.substring(1, H.indexOf("."))) < 18)
          (v56.warningEmitted = !0),
            process.emitWarning(`NodeDeprecationWarning: The AWS SDK for JavaScript (v3) will
no longer support Node.js 16.x on January 6, 2025.

To continue receiving updates to AWS services, bug fixes, and security
updates please upgrade to a supported Node.js LTS version.

More information can be found at: https://a.co/74kJMmI`);
      };
    function ZZ$(H, _, q) {
      if (!H.$source) H.$source = {};
      return (H.$source[_] = q), H;
    }
    function LZ$(H, _, q) {
      if (!H.__aws_sdk_context) H.__aws_sdk_context = { features: {} };
      else if (!H.__aws_sdk_context.features) H.__aws_sdk_context.features = {};
      H.__aws_sdk_context.features[_] = q;
    }
    function kZ$(H, _, q) {
      if (!H.$source) H.$source = {};
      return (H.$source[_] = q), H;
    }
    var uC8 = (H) => (N56.HttpResponse.isInstance(H) ? (H.headers?.date ?? H.headers?.Date) : void 0),
      h56 = (H) => new Date(Date.now() + H),
      vZ$ = (H, _) => Math.abs(h56(_).getTime() - H) >= 300000,
      xC8 = (H, _) => {
        let q = Date.parse(H);
        if (vZ$(q, _)) return q - Date.now();
        return _;
      },
      _mH = (H, _) => {
        if (!_) throw Error(`Property \`${H}\` is not resolved for AWS SDK SigV4Auth`);
        return _;
      },
      y56 = async (H) => {
        let _ = _mH("context", H.context),
          q = _mH("config", H.config),
          $ = _.endpointV2?.properties?.authSchemes?.[0],
          O = await _mH("signer", q.signer)($),
          T = H?.signingRegion,
          z = H?.signingRegionSet,
          A = H?.signingName;
        return { config: q, signer: O, signingRegion: T, signingRegionSet: z, signingName: A };
      };
    class cO_ {
      async sign(H, _, q) {
        if (!N56.HttpRequest.isInstance(H))
          throw Error("The request is not an instance of `HttpRequest` and cannot be signed");
        let $ = await y56(q),
          { config: K, signer: O } = $,
          { signingRegion: T, signingName: z } = $,
          A = q.context;
        if (A?.authSchemes?.length ?? !1) {
          let [w, Y] = A.authSchemes;
          if (w?.name === "sigv4a" && Y?.name === "sigv4") (T = Y?.signingRegion ?? T), (z = Y?.signingName ?? z);
        }
        return await O.sign(H, { signingDate: h56(K.systemClockOffset), signingRegion: T, signingService: z });
      }
      errorHandler(H) {
        return (_) => {
          let q = _.ServerTime ?? uC8(_.$response);
          if (q) {
            let $ = _mH("config", H.config),
              K = $.systemClockOffset;
            if ((($.systemClockOffset = xC8(q, $.systemClockOffset)), $.systemClockOffset !== K && _.$metadata))
              _.$metadata.clockSkewCorrected = !0;
          }
          throw _;
        };
      }
      successHandler(H, _) {
        let q = uC8(H);
        if (q) {
          let $ = _mH("config", _.config);
          $.systemClockOffset = xC8(q, $.systemClockOffset);
        }
      }
    }
    var NZ$ = cO_;
    class cC8 extends cO_ {
      async sign(H, _, q) {
        if (!N56.HttpRequest.isInstance(H))
          throw Error("The request is not an instance of `HttpRequest` and cannot be signed");
        let { config: $, signer: K, signingRegion: O, signingRegionSet: T, signingName: z } = await y56(q),
          f = ((await $.sigv4aSigningRegionSet?.()) ?? T ?? [O]).join(",");
        return await K.sign(H, { signingDate: h56($.systemClockOffset), signingRegion: f, signingService: z });
      }
    }
    var mC8 = (H) => (typeof H === "string" && H.length > 0 ? H.split(",").map((_) => _.trim()) : []),
      FC8 = (H) => `AWS_BEARER_TOKEN_${H.replace(/[\s-]/g, "_").toUpperCase()}`,
      pC8 = "AWS_AUTH_SCHEME_PREFERENCE",
      BC8 = "auth_scheme_preference",
      hZ$ = {
        environmentVariableSelector: (H, _) => {
          if (_?.signingName) {
            if (FC8(_.signingName) in H) return ["httpBearerAuth"];
          }
          if (!(pC8 in H)) return;
          return mC8(H[pC8]);
        },
        configFileSelector: (H) => {
          if (!(BC8 in H)) return;
          return mC8(H[BC8]);
        },
        default: [],
      },
      yZ$ = (H) => {
        return (H.sigv4aSigningRegionSet = He.normalizeProvider(H.sigv4aSigningRegionSet)), H;
      },
      VZ$ = {
        environmentVariableSelector(H) {
          if (H.AWS_SIGV4A_SIGNING_REGION_SET) return H.AWS_SIGV4A_SIGNING_REGION_SET.split(",").map((_) => _.trim());
          throw new CC8.ProviderError("AWS_SIGV4A_SIGNING_REGION_SET not set in env.", { tryNextLink: !0 });
        },
        configFileSelector(H) {
          if (H.sigv4a_signing_region_set) return (H.sigv4a_signing_region_set ?? "").split(",").map((_) => _.trim());
          throw new CC8.ProviderError("sigv4a_signing_region_set not set in profile.", { tryNextLink: !0 });
        },
        default: void 0,
      },
      UC8 = (H) => {
        let _ = H.credentials,
          q = !!H.credentials,
          $ = void 0;
        Object.defineProperty(H, "credentials", {
          set(f) {
            if (f && f !== _ && f !== $) q = !0;
            _ = f;
            let w = EZ$(H, { credentials: _, credentialDefaultProvider: H.credentialDefaultProvider }),
              Y = CZ$(H, w);
            if (q && !Y.attributed)
              ($ = async (D) => Y(D).then((j) => GZ$.setCredentialFeature(j, "CREDENTIALS_CODE", "e"))),
                ($.memoized = Y.memoized),
                ($.configBound = Y.configBound),
                ($.attributed = !0);
            else $ = Y;
          },
          get() {
            return $;
          },
          enumerable: !0,
          configurable: !0,
        }),
          (H.credentials = _);
        let { signingEscapePath: K = !0, systemClockOffset: O = H.systemClockOffset || 0, sha256: T } = H,
          z;
        if (H.signer) z = He.normalizeProvider(H.signer);
        else if (H.regionInfoProvider)
          z = () =>
            He.normalizeProvider(H.region)()
              .then(async (f) => [
                (await H.regionInfoProvider(f, {
                  useFipsEndpoint: await H.useFipsEndpoint(),
                  useDualstackEndpoint: await H.useDualstackEndpoint(),
                })) || {},
                f,
              ])
              .then(([f, w]) => {
                let { signingRegion: Y, signingService: D } = f;
                (H.signingRegion = H.signingRegion || Y || w), (H.signingName = H.signingName || D || H.serviceId);
                let j = {
                  ...H,
                  credentials: H.credentials,
                  region: H.signingRegion,
                  service: H.signingName,
                  sha256: T,
                  uriEscapePath: K,
                };
                return new (H.signerConstructor || bC8.SignatureV4)(j);
              });
        else
          z = async (f) => {
            f = Object.assign(
              {},
              {
                name: "sigv4",
                signingName: H.signingName || H.defaultSigningName,
                signingRegion: await He.normalizeProvider(H.region)(),
                properties: {},
              },
              f,
            );
            let { signingRegion: w, signingName: Y } = f;
            (H.signingRegion = H.signingRegion || w), (H.signingName = H.signingName || Y || H.serviceId);
            let D = {
              ...H,
              credentials: H.credentials,
              region: H.signingRegion,
              service: H.signingName,
              sha256: T,
              uriEscapePath: K,
            };
            return new (H.signerConstructor || bC8.SignatureV4)(D);
          };
        return Object.assign(H, { systemClockOffset: O, signingEscapePath: K, signer: z });
      },
      SZ$ = UC8;
    function EZ$(H, { credentials: _, credentialDefaultProvider: q }) {
      let $;
      if (_)
        if (!_?.memoized) $ = He.memoizeIdentityProvider(_, He.isIdentityExpired, He.doesIdentityRequireRefresh);
        else $ = _;
      else if (q) $ = He.normalizeProvider(q(Object.assign({}, H, { parentClientConfig: H })));
      else
        $ = async () => {
          throw Error(
            "@aws-sdk/core::resolveAwsSdkSigV4Config - `credentials` not provided and no credentialDefaultProvider was configured.",
          );
        };
      return ($.memoized = !0), $;
    }
    function CZ$(H, _) {
      if (_.configBound) return _;
      let q = async ($) => _({ ...$, callerClientConfig: H });
      return (q.memoized = _.memoized), (q.configBound = !0), q;
    }
    class tMH {
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
          f = pT.TypeRegistry.for(T);
        try {
          return { errorSchema: O?.(f, z) ?? f.getSchema(H), errorMetadata: A };
        } catch (w) {
          $.message = $.message ?? $.Message ?? "UnknownError";
          let Y = pT.TypeRegistry.for("smithy.ts.sdk.synthetic." + T),
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
            $ = FQ.decorateServiceException(H, _);
          if (q) ($.Message = q), ($.message = q);
          return $;
        }
        return FQ.decorateServiceException(H, _);
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
    class QC8 extends IC8.SmithyRpcV2CborProtocol {
      awsQueryCompatible;
      mixin;
      constructor({ defaultNamespace: H, awsQueryCompatible: _ }) {
        super({ defaultNamespace: H });
        (this.awsQueryCompatible = !!_), (this.mixin = new tMH(this.awsQueryCompatible));
      }
      async serializeRequest(H, _, q) {
        let $ = await super.serializeRequest(H, _, q);
        if (this.awsQueryCompatible) $.headers["x-amzn-query-mode"] = "true";
        return $;
      }
      async handleError(H, _, q, $, K) {
        if (this.awsQueryCompatible) this.mixin.setQueryCompatError($, q);
        let O = IC8.loadSmithyRpcV2CborErrorCode(q, $) ?? "Unknown",
          { errorSchema: T, errorMetadata: z } = await this.mixin.getErrorSchemaOrThrowBaseException(
            O,
            this.options.defaultNamespace,
            q,
            $,
            K,
          ),
          A = pT.NormalizedSchema.of(T),
          f = $.message ?? $.Message ?? "Unknown",
          Y = new (pT.TypeRegistry.for(T[1]).getErrorCtor(T) ?? Error)(f),
          D = {};
        for (let [j, M] of A.structIterator()) D[j] = this.deserializer.readValue(M, $[j]);
        if (this.awsQueryCompatible) this.mixin.queryCompatOutput($, D);
        throw this.mixin.decorateServiceException(
          Object.assign(Y, z, { $fault: A.getMergedTraits().error, message: f }, D),
          $,
        );
      }
    }
    var bZ$ = (H) => {
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
      IZ$ = (H) => {
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
      uZ$ = (H) => {
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
    class _e {
      serdeContext;
      setSerdeContext(H) {
        this.serdeContext = H;
      }
    }
    function xZ$(H, _, q) {
      if (q?.source) {
        let $ = q.source;
        if (typeof _ === "number") {
          if (_ > Number.MAX_SAFE_INTEGER || _ < Number.MIN_SAFE_INTEGER || $ !== String(_))
            if ($.includes(".")) return new uJ.NumericValue($, "bigDecimal");
            else return BigInt($);
        }
      }
      return _;
    }
    var lC8 = (H, _) => FQ.collectBody(H, _).then((q) => (_?.utf8Encoder ?? dC8.toUtf8)(q)),
      V56 = (H, _) =>
        lC8(H, _).then((q) => {
          if (q.length)
            try {
              return JSON.parse(q);
            } catch ($) {
              if ($?.name === "SyntaxError") Object.defineProperty($, "$responseBodyText", { value: q });
              throw $;
            }
          return {};
        }),
      mZ$ = async (H, _) => {
        let q = await V56(H, _);
        return (q.message = q.message ?? q.Message), q;
      },
      S56 = (H, _) => {
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
    class E56 extends _e {
      settings;
      constructor(H) {
        super();
        this.settings = H;
      }
      async read(H, _) {
        return this._read(H, typeof _ === "string" ? JSON.parse(_, xZ$) : await V56(_, this.serdeContext));
      }
      readObject(H, _) {
        return this._read(H, _);
      }
      _read(H, _) {
        let q = _ !== null && typeof _ === "object",
          $ = pT.NormalizedSchema.of(H);
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
        if ($.isBlobSchema() && typeof _ === "string") return qmH.fromBase64(_);
        let K = $.getMergedTraits().mediaType;
        if ($.isStringSchema() && typeof _ === "string" && K) {
          if (K === "application/json" || K.endsWith("+json")) return uJ.LazyJsonString.from(_);
        }
        if ($.isTimestampSchema() && _ != null)
          switch (YX.determineTimestampFormat($, this.settings)) {
            case 5:
              return uJ.parseRfc3339DateTimeWithOffset(_);
            case 6:
              return uJ.parseRfc7231DateTime(_);
            case 7:
              return uJ.parseEpochTimestamp(_);
            default:
              return console.warn("Missing timestamp format, parsing value with Date constructor:", _), new Date(_);
          }
        if ($.isBigIntegerSchema() && (typeof _ === "number" || typeof _ === "string")) return BigInt(_);
        if ($.isBigDecimalSchema() && _ != null) {
          if (_ instanceof uJ.NumericValue) return _;
          let O = _;
          if (O.type === "bigDecimal" && "string" in O) return new uJ.NumericValue(O.string, O.type);
          return new uJ.NumericValue(String(_), "bigDecimal");
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
              if (z instanceof uJ.NumericValue) O[T] = z;
              else O[T] = this._read($, z);
            return O;
          } else return structuredClone(_);
        return _;
      }
    }
    var gC8 = String.fromCharCode(925);
    class iC8 {
      values = new Map();
      counter = 0;
      stage = 0;
      createReplacer() {
        if (this.stage === 1) throw Error("@aws-sdk/core/protocols - JsonReplacer already created.");
        if (this.stage === 2) throw Error("@aws-sdk/core/protocols - JsonReplacer exhausted.");
        return (
          (this.stage = 1),
          (H, _) => {
            if (_ instanceof uJ.NumericValue) {
              let q = `${gC8 + "nv" + this.counter++}_` + _.string;
              return this.values.set(`"${q}"`, _.string), q;
            }
            if (typeof _ === "bigint") {
              let q = _.toString(),
                $ = `${gC8 + "b" + this.counter++}_` + q;
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
    class C56 extends _e {
      settings;
      buffer;
      rootSchema;
      constructor(H) {
        super();
        this.settings = H;
      }
      write(H, _) {
        (this.rootSchema = pT.NormalizedSchema.of(H)), (this.buffer = this._write(this.rootSchema, _));
      }
      writeDiscriminatedDocument(H, _) {
        if ((this.write(H, _), typeof this.buffer === "object"))
          this.buffer.__type = pT.NormalizedSchema.of(H).getName(!0);
      }
      flush() {
        let { rootSchema: H } = this;
        if (((this.rootSchema = void 0), H?.isStructSchema() || H?.isDocumentSchema())) {
          let _ = new iC8();
          return _.replaceInJson(JSON.stringify(this.buffer, _.createReplacer(), 0));
        }
        return this.buffer;
      }
      _write(H, _, q) {
        let $ = _ !== null && typeof _ === "object",
          K = pT.NormalizedSchema.of(H);
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
          return (this.serdeContext?.base64Encoder ?? qmH.toBase64)(_);
        }
        if ((K.isTimestampSchema() || K.isDocumentSchema()) && _ instanceof Date)
          switch (YX.determineTimestampFormat(K, this.settings)) {
            case 5:
              return _.toISOString().replace(".000Z", "Z");
            case 6:
              return uJ.dateToUtcString(_);
            case 7:
              return _.getTime() / 1000;
            default:
              return console.warn("Missing timestamp format, using epoch seconds", _), _.getTime() / 1000;
          }
        if (K.isNumericSchema() && typeof _ === "number") {
          if (Math.abs(_) === 1 / 0 || isNaN(_)) return String(_);
        }
        if (K.isStringSchema()) {
          if (typeof _ > "u" && K.isIdempotencyToken()) return uJ.generateIdempotencyToken();
          let O = K.getMergedTraits().mediaType;
          if (_ != null && O) {
            if (O === "application/json" || O.endsWith("+json")) return uJ.LazyJsonString.from(_);
          }
        }
        if (K.isDocumentSchema())
          if ($) {
            let O = Array.isArray(_) ? [] : {};
            for (let [T, z] of Object.entries(_))
              if (z instanceof uJ.NumericValue) O[T] = z;
              else O[T] = this._write(K, z);
            return O;
          } else return structuredClone(_);
        return _;
      }
    }
    class FO_ extends _e {
      settings;
      constructor(H) {
        super();
        this.settings = H;
      }
      createSerializer() {
        let H = new C56(this.settings);
        return H.setSerdeContext(this.serdeContext), H;
      }
      createDeserializer() {
        let H = new E56(this.settings);
        return H.setSerdeContext(this.serdeContext), H;
      }
    }
    class UO_ extends YX.RpcProtocol {
      serializer;
      deserializer;
      serviceTarget;
      codec;
      mixin;
      awsQueryCompatible;
      constructor({ defaultNamespace: H, serviceTarget: _, awsQueryCompatible: q }) {
        super({ defaultNamespace: H });
        (this.serviceTarget = _),
          (this.codec = new FO_({ timestampFormat: { useTrait: !0, default: 7 }, jsonName: !1 })),
          (this.serializer = this.codec.createSerializer()),
          (this.deserializer = this.codec.createDeserializer()),
          (this.awsQueryCompatible = !!q),
          (this.mixin = new tMH(this.awsQueryCompatible));
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
        if (pT.deref(H.input) === "unit" || !$.body) $.body = "{}";
        return $;
      }
      getPayloadCodec() {
        return this.codec;
      }
      async handleError(H, _, q, $, K) {
        if (this.awsQueryCompatible) this.mixin.setQueryCompatError($, q);
        let O = S56(q, $) ?? "Unknown",
          { errorSchema: T, errorMetadata: z } = await this.mixin.getErrorSchemaOrThrowBaseException(
            O,
            this.options.defaultNamespace,
            q,
            $,
            K,
          ),
          A = pT.NormalizedSchema.of(T),
          f = $.message ?? $.Message ?? "Unknown",
          Y = new (pT.TypeRegistry.for(T[1]).getErrorCtor(T) ?? Error)(f),
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
    class nC8 extends UO_ {
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
    class rC8 extends UO_ {
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
    class oC8 extends YX.HttpBindingProtocol {
      serializer;
      deserializer;
      codec;
      mixin = new tMH();
      constructor({ defaultNamespace: H }) {
        super({ defaultNamespace: H });
        let _ = { timestampFormat: { useTrait: !0, default: 7 }, httpBindings: !0, jsonName: !0 };
        (this.codec = new FO_(_)),
          (this.serializer = new YX.HttpInterceptingShapeSerializer(this.codec.createSerializer(), _)),
          (this.deserializer = new YX.HttpInterceptingShapeDeserializer(this.codec.createDeserializer(), _));
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
          K = pT.NormalizedSchema.of(H.input);
        if (!$.headers["content-type"]) {
          let O = this.mixin.resolveRestContentType(this.getDefaultContentType(), K);
          if (O) $.headers["content-type"] = O;
        }
        if ($.body == null && $.headers["content-type"] === this.getDefaultContentType()) $.body = "{}";
        return $;
      }
      async deserializeResponse(H, _, q) {
        let $ = await super.deserializeResponse(H, _, q),
          K = pT.NormalizedSchema.of(H.output);
        for (let [O, T] of K.structIterator()) if (T.getMemberTraits().httpPayload && !(O in $)) $[O] = null;
        return $;
      }
      async handleError(H, _, q, $, K) {
        let O = S56(q, $) ?? "Unknown",
          { errorSchema: T, errorMetadata: z } = await this.mixin.getErrorSchemaOrThrowBaseException(
            O,
            this.options.defaultNamespace,
            q,
            $,
            K,
          ),
          A = pT.NormalizedSchema.of(T),
          f = $.message ?? $.Message ?? "Unknown",
          Y = new (pT.TypeRegistry.for(T[1]).getErrorCtor(T) ?? Error)(f);
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
    var pZ$ = (H) => {
      if (H == null) return;
      if (typeof H === "object" && "__type" in H) delete H.__type;
      return FQ.expectUnion(H);
    };
    class QO_ extends _e {
      settings;
      stringDeserializer;
      constructor(H) {
        super();
        (this.settings = H), (this.stringDeserializer = new YX.FromStringShapeDeserializer(H));
      }
      setSerdeContext(H) {
        (this.serdeContext = H), this.stringDeserializer.setSerdeContext(H);
      }
      read(H, _, q) {
        let $ = pT.NormalizedSchema.of(H),
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
        let T = (this.serdeContext?.utf8Encoder ?? dC8.toUtf8)(_),
          z = this.parseXml(T);
        return this.readSchema(H, q ? z[q] : z);
      }
      readSchema(H, _) {
        let q = pT.NormalizedSchema.of(H);
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
            _ = MS.parseXML(H);
          } catch (O) {
            if (O && typeof O === "object") Object.defineProperty(O, "$responseBodyText", { value: H });
            throw O;
          }
          let q = "#text",
            $ = Object.keys(_)[0],
            K = _[$];
          if (K[q]) (K[$] = K[q]), delete K[q];
          return FQ.getValueFromTextNode(K);
        }
        return {};
      }
    }
    class aC8 extends _e {
      settings;
      buffer;
      constructor(H) {
        super();
        this.settings = H;
      }
      write(H, _, q = "") {
        if (this.buffer === void 0) this.buffer = "";
        let $ = pT.NormalizedSchema.of(H);
        if (q && !q.endsWith(".")) q += ".";
        if ($.isBlobSchema()) {
          if (typeof _ === "string" || _ instanceof Uint8Array)
            this.writeKey(q), this.writeValue((this.serdeContext?.base64Encoder ?? qmH.toBase64)(_));
        } else if ($.isBooleanSchema() || $.isNumericSchema() || $.isStringSchema()) {
          if (_ != null) this.writeKey(q), this.writeValue(String(_));
          else if ($.isIdempotencyToken()) this.writeKey(q), this.writeValue(uJ.generateIdempotencyToken());
        } else if ($.isBigIntegerSchema()) {
          if (_ != null) this.writeKey(q), this.writeValue(String(_));
        } else if ($.isBigDecimalSchema()) {
          if (_ != null) this.writeKey(q), this.writeValue(_ instanceof uJ.NumericValue ? _.string : String(_));
        } else if ($.isTimestampSchema()) {
          if (_ instanceof Date)
            switch ((this.writeKey(q), YX.determineTimestampFormat($, this.settings))) {
              case 5:
                this.writeValue(_.toISOString().replace(".000Z", "Z"));
                break;
              case 6:
                this.writeValue(FQ.dateToUtcString(_));
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
        this.buffer += `&${YX.extendedEncodeURIComponent(H)}=`;
      }
      writeValue(H) {
        this.buffer += YX.extendedEncodeURIComponent(H);
      }
    }
    class b56 extends YX.RpcProtocol {
      options;
      serializer;
      deserializer;
      mixin = new tMH();
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
        (this.serializer = new aC8(_)), (this.deserializer = new QO_(_));
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
          pT.deref(H.input) === "unit" || !$.body)
        )
          $.body = "";
        let K = H.name.split("#")[1] ?? H.name;
        if ((($.body = `Action=${K}&Version=${this.options.version}` + $.body), $.body.endsWith("&")))
          $.body = $.body.slice(-1);
        return $;
      }
      async deserializeResponse(H, _, q) {
        let $ = this.deserializer,
          K = pT.NormalizedSchema.of(H.output),
          O = {};
        if (q.statusCode >= 300) {
          let w = await YX.collectBody(q.body, _);
          if (w.byteLength > 0) Object.assign(O, await $.read(15, w));
          await this.handleError(H, _, q, O, this.deserializeMetadata(q));
        }
        for (let w in q.headers) {
          let Y = q.headers[w];
          delete q.headers[w], (q.headers[w.toLowerCase()] = Y);
        }
        let T = H.name.split("#")[1] ?? H.name,
          z = K.isStructSchema() && this.useNestedResult() ? T + "Result" : void 0,
          A = await YX.collectBody(q.body, _);
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
                return M.find((X) => pT.NormalizedSchema.of(X).getMergedTraits().awsQueryError?.[0] === J);
              }
            },
          ),
          w = pT.NormalizedSchema.of(A),
          D = new (pT.TypeRegistry.for(A[1]).getErrorCtor(A) ?? Error)(z),
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
    class sC8 extends b56 {
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
    var tC8 = (H, _) =>
        lC8(H, _).then((q) => {
          if (q.length) {
            let $;
            try {
              $ = MS.parseXML(q);
            } catch (z) {
              if (z && typeof z === "object") Object.defineProperty(z, "$responseBodyText", { value: q });
              throw z;
            }
            let K = "#text",
              O = Object.keys($)[0],
              T = $[O];
            if (T[K]) (T[O] = T[K]), delete T[K];
            return FQ.getValueFromTextNode(T);
          }
          return {};
        }),
      BZ$ = async (H, _) => {
        let q = await tC8(H, _);
        if (q.Error) q.Error.message = q.Error.message ?? q.Error.Message;
        return q;
      },
      eC8 = (H, _) => {
        if (_?.Error?.Code !== void 0) return _.Error.Code;
        if (_?.Code !== void 0) return _.Code;
        if (H.statusCode == 404) return "NotFound";
      };
    class I56 extends _e {
      settings;
      stringBuffer;
      byteBuffer;
      buffer;
      constructor(H) {
        super();
        this.settings = H;
      }
      write(H, _) {
        let q = pT.NormalizedSchema.of(H);
        if (q.isStringSchema() && typeof _ === "string") this.stringBuffer = _;
        else if (q.isBlobSchema())
          this.byteBuffer = "byteLength" in _ ? _ : (this.serdeContext?.base64Decoder ?? qmH.fromBase64)(_);
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
        let O = MS.XmlNode.of(K),
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
              let Y = MS.XmlNode.of(f.getMergedTraits().xmlName ?? f.getMemberName());
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
              let M = MS.XmlNode.of(A ? (K.xmlName ?? H.getMemberName()) : (T.xmlName ?? "member"));
              this.writeSimpleInto(O, j, M, w), D.addChildNode(M);
            }
          };
        if (A) {
          for (let D of _) if (z || D != null) Y(q, D);
        } else {
          let D = MS.XmlNode.of(K.xmlName ?? H.getMemberName());
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
            let Z = MS.XmlNode.of(A, R),
              [k, v] = this.getXmlnsAttribute(T, J);
            if (v) Z.addAttribute(k, v);
            X.addChildNode(Z);
            let y = MS.XmlNode.of(Y);
            if (f.isListSchema()) this.writeList(f, W, y, J);
            else if (f.isMapSchema()) this.writeMap(f, W, y, J, !0);
            else if (f.isStructSchema()) y = this.writeStruct(f, W, J);
            else this.writeSimpleInto(f, W, y, J);
            X.addChildNode(y);
          };
        if (j) {
          for (let [X, R] of Object.entries(_))
            if (D || R != null) {
              let W = MS.XmlNode.of(O.xmlName ?? H.getMemberName());
              P(W, X, R), q.addChildNode(W);
            }
        } else {
          let X;
          if (!K) {
            if (((X = MS.XmlNode.of(O.xmlName ?? H.getMemberName())), J)) X.addAttribute(M, J);
            q.addChildNode(X);
          }
          for (let [R, W] of Object.entries(_))
            if (D || W != null) {
              let Z = MS.XmlNode.of("entry");
              P(Z, R, W), (K ? q : X).addChildNode(Z);
            }
        }
      }
      writeSimple(H, _) {
        if (_ === null) throw Error("@aws-sdk/core/protocols - (XML serializer) cannot write null value.");
        let q = pT.NormalizedSchema.of(H),
          $ = null;
        if (_ && typeof _ === "object")
          if (q.isBlobSchema()) $ = (this.serdeContext?.base64Encoder ?? qmH.toBase64)(_);
          else if (q.isTimestampSchema() && _ instanceof Date)
            switch (YX.determineTimestampFormat(q, this.settings)) {
              case 5:
                $ = _.toISOString().replace(".000Z", "Z");
                break;
              case 6:
                $ = FQ.dateToUtcString(_);
                break;
              case 7:
                $ = String(_.getTime() / 1000);
                break;
              default:
                console.warn("Missing timestamp format, using http date", _), ($ = FQ.dateToUtcString(_));
                break;
            }
          else if (q.isBigDecimalSchema() && _) {
            if (_ instanceof uJ.NumericValue) return _.string;
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
          if (_ === void 0 && q.isIdempotencyToken()) $ = uJ.generateIdempotencyToken();
          else $ = String(_);
        if ($ === null) throw Error(`Unhandled schema-value pair ${q.getName(!0)}=${_}`);
        return $;
      }
      writeSimpleInto(H, _, q, $) {
        let K = this.writeSimple(H, _),
          O = pT.NormalizedSchema.of(H),
          T = new MS.XmlText(K),
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
    class u56 extends _e {
      settings;
      constructor(H) {
        super();
        this.settings = H;
      }
      createSerializer() {
        let H = new I56(this.settings);
        return H.setSerdeContext(this.serdeContext), H;
      }
      createDeserializer() {
        let H = new QO_(this.settings);
        return H.setSerdeContext(this.serdeContext), H;
      }
    }
    class Hb8 extends YX.HttpBindingProtocol {
      codec;
      serializer;
      deserializer;
      mixin = new tMH();
      constructor(H) {
        super(H);
        let _ = {
          timestampFormat: { useTrait: !0, default: 5 },
          httpBindings: !0,
          xmlNamespace: H.xmlNamespace,
          serviceNamespace: H.defaultNamespace,
        };
        (this.codec = new u56(_)),
          (this.serializer = new YX.HttpInterceptingShapeSerializer(this.codec.createSerializer(), _)),
          (this.deserializer = new YX.HttpInterceptingShapeDeserializer(this.codec.createDeserializer(), _));
      }
      getPayloadCodec() {
        return this.codec;
      }
      getShapeId() {
        return "aws.protocols#restXml";
      }
      async serializeRequest(H, _, q) {
        let $ = await super.serializeRequest(H, _, q),
          K = pT.NormalizedSchema.of(H.input);
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
        let O = eC8(q, $) ?? "Unknown",
          { errorSchema: T, errorMetadata: z } = await this.mixin.getErrorSchemaOrThrowBaseException(
            O,
            this.options.defaultNamespace,
            q,
            $,
            K,
          ),
          A = pT.NormalizedSchema.of(T),
          f = $.Error?.message ?? $.Error?.Message ?? $.message ?? $.Message ?? "Unknown",
          Y = new (pT.TypeRegistry.for(T[1]).getErrorCtor(T) ?? Error)(f);
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
    JK.AWSSDKSigV4Signer = NZ$;
    JK.AwsEc2QueryProtocol = sC8;
    JK.AwsJson1_0Protocol = nC8;
    JK.AwsJson1_1Protocol = rC8;
    JK.AwsJsonRpcProtocol = UO_;
    JK.AwsQueryProtocol = b56;
    JK.AwsRestJsonProtocol = oC8;
    JK.AwsRestXmlProtocol = Hb8;
    JK.AwsSdkSigV4ASigner = cC8;
    JK.AwsSdkSigV4Signer = cO_;
    JK.AwsSmithyRpcV2CborProtocol = QC8;
    JK.JsonCodec = FO_;
    JK.JsonShapeDeserializer = E56;
    JK.JsonShapeSerializer = C56;
    JK.NODE_AUTH_SCHEME_PREFERENCE_OPTIONS = hZ$;
    JK.NODE_SIGV4A_CONFIG_OPTIONS = VZ$;
    JK.XmlCodec = u56;
    JK.XmlShapeDeserializer = QO_;
    JK.XmlShapeSerializer = I56;
    JK._toBool = IZ$;
    JK._toNum = uZ$;
    JK._toStr = bZ$;
    JK.awsExpectUnion = pZ$;
    JK.emitWarningIfUnsupportedVersion = RZ$;
    JK.getBearerTokenEnvKey = FC8;
    JK.loadRestJsonErrorCode = S56;
    JK.loadRestXmlErrorCode = eC8;
    JK.parseJsonBody = V56;
    JK.parseJsonErrorBody = mZ$;
    JK.parseXmlBody = tC8;
    JK.parseXmlErrorBody = BZ$;
    JK.resolveAWSSDKSigV4Config = SZ$;
    JK.resolveAwsSdkSigV4AConfig = yZ$;
    JK.resolveAwsSdkSigV4Config = UC8;
    JK.setCredentialFeature = ZZ$;
    JK.setFeature = LZ$;
    JK.setTokenFeature = kZ$;
    JK.state = v56;
    JK.validateSigningProperties = y56;
  });
