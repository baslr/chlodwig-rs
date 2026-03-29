  var I6 = d((QQ) => {
    var Cb8 = Sb8(),
      Eb8 = YS(),
      bL$ = m$(),
      sO_ = E0(),
      IL$ = GK6(),
      uL$ = async (H) => {
        let _ = H?.Bucket || "";
        if (typeof H.Bucket === "string")
          H.Bucket = _.replace(/#/g, encodeURIComponent("#")).replace(/\?/g, encodeURIComponent("?"));
        if (gL$(_)) {
          if (H.ForcePathStyle === !0) throw Error("Path-style addressing cannot be used with ARN buckets");
        } else if (
          !BL$(_) ||
          (_.indexOf(".") !== -1 && !String(H.Endpoint).startsWith("http:")) ||
          _.toLowerCase() !== _ ||
          _.length < 3
        )
          H.ForcePathStyle = !0;
        if (H.DisableMultiRegionAccessPoints) (H.disableMultiRegionAccessPoints = !0), (H.DisableMRAP = !0);
        return H;
      },
      xL$ = /^[a-z0-9][a-z0-9\.\-]{1,61}[a-z0-9]$/,
      mL$ = /(\d+\.){3}\d+/,
      pL$ = /\.\./,
      BL$ = (H) => xL$.test(H) && !mL$.test(H) && !pL$.test(H),
      gL$ = (H) => {
        let [_, q, $, , , K] = H.split(":"),
          O = _ === "arn" && H.split(":").length >= 6,
          T = Boolean(O && q && $ && K);
        if (O && !T) throw Error(`Invalid ARN: ${H} was an invalid ARN.`);
        return T;
      },
      dL$ = (H, _, q) => {
        let $ = async () => {
          let K = q[H] ?? q[_];
          if (typeof K === "function") return K();
          return K;
        };
        if (H === "credentialScope" || _ === "CredentialScope")
          return async () => {
            let K = typeof q.credentials === "function" ? await q.credentials() : q.credentials;
            return K?.credentialScope ?? K?.CredentialScope;
          };
        if (H === "accountId" || _ === "AccountId")
          return async () => {
            let K = typeof q.credentials === "function" ? await q.credentials() : q.credentials;
            return K?.accountId ?? K?.AccountId;
          };
        if (H === "endpoint" || _ === "endpoint")
          return async () => {
            if (q.isCustomEndpoint === !1) return;
            let K = await $();
            if (K && typeof K === "object") {
              if ("url" in K) return K.url.href;
              if ("hostname" in K) {
                let { protocol: O, hostname: T, port: z, path: A } = K;
                return `${O}//${T}${z ? ":" + z : ""}${A}`;
              }
            }
            return K;
          };
        return $;
      },
      p56 = (H) => {
        if (typeof H === "object") {
          if ("url" in H) return Eb8.parseUrl(H.url);
          return H;
        }
        return Eb8.parseUrl(H);
      },
      bb8 = async (H, _, q, $) => {
        if (!q.isCustomEndpoint) {
          let T;
          if (q.serviceConfiguredEndpoint) T = await q.serviceConfiguredEndpoint();
          else T = await Cb8.getEndpointFromConfig(q.serviceId);
          if (T) (q.endpoint = () => Promise.resolve(p56(T))), (q.isCustomEndpoint = !0);
        }
        let K = await Ib8(H, _, q);
        if (typeof q.endpointProvider !== "function") throw Error("config.endpointProvider is not set.");
        return q.endpointProvider(K, $);
      },
      Ib8 = async (H, _, q) => {
        let $ = {},
          K = _?.getEndpointParameterInstructions?.() || {};
        for (let [O, T] of Object.entries(K))
          switch (T.type) {
            case "staticContextParams":
              $[O] = T.value;
              break;
            case "contextParams":
              $[O] = H[T.name];
              break;
            case "clientContextParams":
            case "builtInParams":
              $[O] = await dL$(T.name, O, q)();
              break;
            case "operationContextParams":
              $[O] = T.get(H);
              break;
            default:
              throw Error("Unrecognized endpoint parameter instruction: " + JSON.stringify(T));
          }
        if (Object.keys(K).length === 0) Object.assign($, q);
        if (String(q.serviceId).toLowerCase() === "s3") await uL$($);
        return $;
      },
      ub8 = ({ config: H, instructions: _ }) => {
        return (q, $) => async (K) => {
          if (H.isCustomEndpoint) bL$.setFeature($, "ENDPOINT_OVERRIDE", "N");
          let O = await bb8(
            K.input,
            {
              getEndpointParameterInstructions() {
                return _;
              },
            },
            { ...H },
            $,
          );
          ($.endpointV2 = O), ($.authSchemes = O.properties?.authSchemes);
          let T = $.authSchemes?.[0];
          if (T) {
            ($.signing_region = T.signingRegion), ($.signing_service = T.signingName);
            let A = sO_.getSmithyContext($)?.selectedHttpAuthScheme?.httpAuthOption;
            if (A)
              A.signingProperties = Object.assign(
                A.signingProperties || {},
                {
                  signing_region: T.signingRegion,
                  signingRegion: T.signingRegion,
                  signing_service: T.signingName,
                  signingName: T.signingName,
                  signingRegionSet: T.signingRegionSet,
                },
                T.properties,
              );
          }
          return q({ ...K });
        };
      },
      xb8 = {
        step: "serialize",
        tags: ["ENDPOINT_PARAMETERS", "ENDPOINT_V2", "ENDPOINT"],
        name: "endpointV2Middleware",
        override: !0,
        relation: "before",
        toMiddleware: IL$.serializerMiddlewareOption.name,
      },
      cL$ = (H, _) => ({
        applyToStack: (q) => {
          q.addRelativeTo(ub8({ config: H, instructions: _ }), xb8);
        },
      }),
      FL$ = (H) => {
        let _ = H.tls ?? !0,
          { endpoint: q, useDualstackEndpoint: $, useFipsEndpoint: K } = H,
          O = q != null ? async () => p56(await sO_.normalizeProvider(q)()) : void 0,
          z = Object.assign(H, {
            endpoint: O,
            tls: _,
            isCustomEndpoint: !!q,
            useDualstackEndpoint: sO_.normalizeProvider($ ?? !1),
            useFipsEndpoint: sO_.normalizeProvider(K ?? !1),
          }),
          A = void 0;
        return (
          (z.serviceConfiguredEndpoint = async () => {
            if (H.serviceId && !A) A = Cb8.getEndpointFromConfig(H.serviceId);
            return A;
          }),
          z
        );
      },
      UL$ = (H) => {
        let { endpoint: _ } = H;
        if (_ === void 0)
          H.endpoint = async () => {
            throw Error(
              "@smithy/middleware-endpoint: (default endpointRuleSet) endpoint is not set - you must configure an endpoint.",
            );
          };
        return H;
      };
    QQ.endpointMiddleware = ub8;
    QQ.endpointMiddlewareOptions = xb8;
    QQ.getEndpointFromInstructions = bb8;
    QQ.getEndpointPlugin = cL$;
    QQ.resolveEndpointConfig = FL$;
    QQ.resolveEndpointRequiredConfig = UL$;
    QQ.resolveParams = Ib8;
    QQ.toEndpointV1 = p56;
  });
