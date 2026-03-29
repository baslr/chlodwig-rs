  var m$ = d((fY) => {
    var JO_ = m16(),
      _S8 = E0(),
      z0$ = GK6(),
      RK6 = IxH(),
      A0$ = xA(),
      f0$ = (H) => H[JO_.SMITHY_CONTEXT_KEY] || (H[JO_.SMITHY_CONTEXT_KEY] = {}),
      w0$ = (H, _) => {
        if (!_ || _.length === 0) return H;
        let q = [];
        for (let $ of _) for (let K of H) if (K.schemeId.split("#")[1] === $) q.push(K);
        for (let $ of H) if (!q.find(({ schemeId: K }) => K === $.schemeId)) q.push($);
        return q;
      };
    function Y0$(H) {
      let _ = new Map();
      for (let q of H) _.set(q.schemeId, q);
      return _;
    }
    var ZK6 = (H, _) => (q, $) => async (K) => {
        let O = H.httpAuthSchemeProvider(await _.httpAuthSchemeParametersProvider(H, $, K.input)),
          T = H.authSchemePreference ? await H.authSchemePreference() : [],
          z = w0$(O, T),
          A = Y0$(H.httpAuthSchemes),
          f = _S8.getSmithyContext($),
          w = [];
        for (let Y of z) {
          let D = A.get(Y.schemeId);
          if (!D) {
            w.push(`HttpAuthScheme \`${Y.schemeId}\` was not enabled for this service.`);
            continue;
          }
          let j = D.identityProvider(await _.identityProviderConfigProvider(H));
          if (!j) {
            w.push(`HttpAuthScheme \`${Y.schemeId}\` did not have an IdentityProvider configured.`);
            continue;
          }
          let { identityProperties: M = {}, signingProperties: J = {} } = Y.propertiesExtractor?.(H, $) || {};
          (Y.identityProperties = Object.assign(Y.identityProperties || {}, M)),
            (Y.signingProperties = Object.assign(Y.signingProperties || {}, J)),
            (f.selectedHttpAuthScheme = {
              httpAuthOption: Y,
              identity: await j(Y.identityProperties),
              signer: D.signer,
            });
          break;
        }
        if (!f.selectedHttpAuthScheme)
          throw Error(
            w.join(`
`),
          );
        return q(K);
      },
      qS8 = {
        step: "serialize",
        tags: ["HTTP_AUTH_SCHEME"],
        name: "httpAuthSchemeMiddleware",
        override: !0,
        relation: "before",
        toMiddleware: "endpointV2Middleware",
      },
      D0$ = (H, { httpAuthSchemeParametersProvider: _, identityProviderConfigProvider: q }) => ({
        applyToStack: ($) => {
          $.addRelativeTo(ZK6(H, { httpAuthSchemeParametersProvider: _, identityProviderConfigProvider: q }), qS8);
        },
      }),
      $S8 = {
        step: "serialize",
        tags: ["HTTP_AUTH_SCHEME"],
        name: "httpAuthSchemeMiddleware",
        override: !0,
        relation: "before",
        toMiddleware: z0$.serializerMiddlewareOption.name,
      },
      j0$ = (H, { httpAuthSchemeParametersProvider: _, identityProviderConfigProvider: q }) => ({
        applyToStack: ($) => {
          $.addRelativeTo(ZK6(H, { httpAuthSchemeParametersProvider: _, identityProviderConfigProvider: q }), $S8);
        },
      }),
      M0$ = (H) => (_) => {
        throw _;
      },
      J0$ = (H, _) => {},
      KS8 = (H) => (_, q) => async ($) => {
        if (!RK6.HttpRequest.isInstance($.request)) return _($);
        let O = _S8.getSmithyContext(q).selectedHttpAuthScheme;
        if (!O) throw Error("No HttpAuthScheme was selected: unable to sign request");
        let {
            httpAuthOption: { signingProperties: T = {} },
            identity: z,
            signer: A,
          } = O,
          f = await _({ ...$, request: await A.sign($.request, z, T) }).catch((A.errorHandler || M0$)(T));
        return (A.successHandler || J0$)(f.response, T), f;
      },
      OS8 = {
        step: "finalizeRequest",
        tags: ["HTTP_SIGNING"],
        name: "httpSigningMiddleware",
        aliases: ["apiKeyMiddleware", "tokenMiddleware", "awsAuthMiddleware"],
        override: !0,
        relation: "after",
        toMiddleware: "retryMiddleware",
      },
      P0$ = (H) => ({
        applyToStack: (_) => {
          _.addRelativeTo(KS8(), OS8);
        },
      }),
      X0$ = (H) => {
        if (typeof H === "function") return H;
        let _ = Promise.resolve(H);
        return () => _;
      },
      W0$ = async (H, _, q, $ = (O) => O, ...K) => {
        let O = new H(q);
        return (O = $(O) ?? O), await _.send(O, ...K);
      };
    function G0$(H, _, q, $, K) {
      return async function* (T, z, ...A) {
        let f = z,
          w = T.startingToken ?? f[q],
          Y = !0,
          D;
        while (Y) {
          if (((f[q] = w), K)) f[K] = f[K] ?? T.pageSize;
          if (T.client instanceof H) D = await W0$(_, T.client, z, T.withCommand, ...A);
          else throw Error(`Invalid client, expected instance of ${H.name}`);
          yield D;
          let j = w;
          (w = R0$(D, $)), (Y = !!(w && (!T.stopOnSameToken || w !== j)));
        }
        return;
      };
    }
    var R0$ = (H, _) => {
      let q = H,
        $ = _.split(".");
      for (let K of $) {
        if (!q || typeof q !== "object") return;
        q = q[K];
      }
      return q;
    };
    function Z0$(H, _, q) {
      if (!H.__smithy_context) H.__smithy_context = { features: {} };
      else if (!H.__smithy_context.features) H.__smithy_context.features = {};
      H.__smithy_context.features[_] = q;
    }
    class TS8 {
      authSchemes = new Map();
      constructor(H) {
        for (let [_, q] of Object.entries(H)) if (q !== void 0) this.authSchemes.set(_, q);
      }
      getIdentityProvider(H) {
        return this.authSchemes.get(H);
      }
    }
    class zS8 {
      async sign(H, _, q) {
        if (!q)
          throw Error(
            "request could not be signed with `apiKey` since the `name` and `in` signer properties are missing",
          );
        if (!q.name)
          throw Error("request could not be signed with `apiKey` since the `name` signer property is missing");
        if (!q.in) throw Error("request could not be signed with `apiKey` since the `in` signer property is missing");
        if (!_.apiKey) throw Error("request could not be signed with `apiKey` since the `apiKey` is not defined");
        let $ = RK6.HttpRequest.clone(H);
        if (q.in === JO_.HttpApiKeyAuthLocation.QUERY) $.query[q.name] = _.apiKey;
        else if (q.in === JO_.HttpApiKeyAuthLocation.HEADER)
          $.headers[q.name] = q.scheme ? `${q.scheme} ${_.apiKey}` : _.apiKey;
        else
          throw Error(
            "request can only be signed with `apiKey` locations `query` or `header`, but found: `" + q.in + "`",
          );
        return $;
      }
    }
    class AS8 {
      async sign(H, _, q) {
        let $ = RK6.HttpRequest.clone(H);
        if (!_.token) throw Error("request could not be signed with `token` since the `token` is not defined");
        return ($.headers.Authorization = `Bearer ${_.token}`), $;
      }
    }
    class fS8 {
      async sign(H, _, q) {
        return H;
      }
    }
    var wS8 = (H) =>
        function (q) {
          return DS8(q) && q.expiration.getTime() - Date.now() < H;
        },
      YS8 = 300000,
      L0$ = wS8(YS8),
      DS8 = (H) => H.expiration !== void 0,
      k0$ = (H, _, q) => {
        if (H === void 0) return;
        let $ = typeof H !== "function" ? async () => Promise.resolve(H) : H,
          K,
          O,
          T,
          z = !1,
          A = async (f) => {
            if (!O) O = $(f);
            try {
              (K = await O), (T = !0), (z = !1);
            } finally {
              O = void 0;
            }
            return K;
          };
        if (_ === void 0)
          return async (f) => {
            if (!T || f?.forceRefresh) K = await A(f);
            return K;
          };
        return async (f) => {
          if (!T || f?.forceRefresh) K = await A(f);
          if (z) return K;
          if (!q(K)) return (z = !0), K;
          if (_(K)) return await A(f), K;
          return K;
        };
      };
    Object.defineProperty(fY, "requestBuilder", {
      enumerable: !0,
      get: function () {
        return A0$.requestBuilder;
      },
    });
    fY.DefaultIdentityProviderConfig = TS8;
    fY.EXPIRATION_MS = YS8;
    fY.HttpApiKeyAuthSigner = zS8;
    fY.HttpBearerAuthSigner = AS8;
    fY.NoAuthSigner = fS8;
    fY.createIsIdentityExpiredFunction = wS8;
    fY.createPaginator = G0$;
    fY.doesIdentityRequireRefresh = DS8;
    fY.getHttpAuthSchemeEndpointRuleSetPlugin = D0$;
    fY.getHttpAuthSchemePlugin = j0$;
    fY.getHttpSigningPlugin = P0$;
    fY.getSmithyContext = f0$;
    fY.httpAuthSchemeEndpointRuleSetMiddlewareOptions = qS8;
    fY.httpAuthSchemeMiddleware = ZK6;
    fY.httpAuthSchemeMiddlewareOptions = $S8;
    fY.httpSigningMiddleware = KS8;
    fY.httpSigningMiddlewareOptions = OS8;
    fY.isIdentityExpired = L0$;
    fY.memoizeIdentityProvider = k0$;
    fY.normalizeProvider = X0$;
    fY.setFeature = Z0$;
  });
