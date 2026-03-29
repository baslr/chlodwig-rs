  var HE8 = d((kI) => {
    var mK6 = jO_(),
      nt = m$(),
      QS8 = j3(),
      g0$ = zj(),
      lS8 = xK6(),
      iS8 = (H) => (mK6.HttpResponse.isInstance(H) ? (H.headers?.date ?? H.headers?.Date) : void 0),
      pK6 = (H) => new Date(Date.now() + H),
      d0$ = (H, _) => Math.abs(pK6(_).getTime() - H) >= 300000,
      nS8 = (H, _) => {
        let q = Date.parse(H);
        if (d0$(q, _)) return q - Date.now();
        return _;
      },
      lxH = (H, _) => {
        if (!_) throw Error(`Property \`${H}\` is not resolved for AWS SDK SigV4Auth`);
        return _;
      },
      BK6 = async (H) => {
        let _ = lxH("context", H.context),
          q = lxH("config", H.config),
          $ = _.endpointV2?.properties?.authSchemes?.[0],
          O = await lxH("signer", q.signer)($),
          T = H?.signingRegion,
          z = H?.signingRegionSet,
          A = H?.signingName;
        return { config: q, signer: O, signingRegion: T, signingRegionSet: z, signingName: A };
      };
    class LO_ {
      async sign(H, _, q) {
        if (!mK6.HttpRequest.isInstance(H))
          throw Error("The request is not an instance of `HttpRequest` and cannot be signed");
        let $ = await BK6(q),
          { config: K, signer: O } = $,
          { signingRegion: T, signingName: z } = $,
          A = q.context;
        if (A?.authSchemes?.length ?? !1) {
          let [w, Y] = A.authSchemes;
          if (w?.name === "sigv4a" && Y?.name === "sigv4") (T = Y?.signingRegion ?? T), (z = Y?.signingName ?? z);
        }
        return await O.sign(H, { signingDate: pK6(K.systemClockOffset), signingRegion: T, signingService: z });
      }
      errorHandler(H) {
        return (_) => {
          let q = _.ServerTime ?? iS8(_.$response);
          if (q) {
            let $ = lxH("config", H.config),
              K = $.systemClockOffset;
            if ((($.systemClockOffset = nS8(q, $.systemClockOffset)), $.systemClockOffset !== K && _.$metadata))
              _.$metadata.clockSkewCorrected = !0;
          }
          throw _;
        };
      }
      successHandler(H, _) {
        let q = iS8(H);
        if (q) {
          let $ = lxH("config", _.config);
          $.systemClockOffset = nS8(q, $.systemClockOffset);
        }
      }
    }
    var c0$ = LO_;
    class sS8 extends LO_ {
      async sign(H, _, q) {
        if (!mK6.HttpRequest.isInstance(H))
          throw Error("The request is not an instance of `HttpRequest` and cannot be signed");
        let { config: $, signer: K, signingRegion: O, signingRegionSet: T, signingName: z } = await BK6(q),
          f = ((await $.sigv4aSigningRegionSet?.()) ?? T ?? [O]).join(",");
        return await K.sign(H, { signingDate: pK6($.systemClockOffset), signingRegion: f, signingService: z });
      }
    }
    var rS8 = (H) => (typeof H === "string" && H.length > 0 ? H.split(",").map((_) => _.trim()) : []),
      tS8 = (H) => `AWS_BEARER_TOKEN_${H.replace(/[\s-]/g, "_").toUpperCase()}`,
      oS8 = "AWS_AUTH_SCHEME_PREFERENCE",
      aS8 = "auth_scheme_preference",
      F0$ = {
        environmentVariableSelector: (H, _) => {
          if (_?.signingName) {
            if (tS8(_.signingName) in H) return ["httpBearerAuth"];
          }
          if (!(oS8 in H)) return;
          return rS8(H[oS8]);
        },
        configFileSelector: (H) => {
          if (!(aS8 in H)) return;
          return rS8(H[aS8]);
        },
        default: [],
      },
      U0$ = (H) => {
        return (H.sigv4aSigningRegionSet = nt.normalizeProvider(H.sigv4aSigningRegionSet)), H;
      },
      Q0$ = {
        environmentVariableSelector(H) {
          if (H.AWS_SIGV4A_SIGNING_REGION_SET) return H.AWS_SIGV4A_SIGNING_REGION_SET.split(",").map((_) => _.trim());
          throw new QS8.ProviderError("AWS_SIGV4A_SIGNING_REGION_SET not set in env.", { tryNextLink: !0 });
        },
        configFileSelector(H) {
          if (H.sigv4a_signing_region_set) return (H.sigv4a_signing_region_set ?? "").split(",").map((_) => _.trim());
          throw new QS8.ProviderError("sigv4a_signing_region_set not set in profile.", { tryNextLink: !0 });
        },
        default: void 0,
      },
      eS8 = (H) => {
        let _ = H.credentials,
          q = !!H.credentials,
          $ = void 0;
        Object.defineProperty(H, "credentials", {
          set(f) {
            if (f && f !== _ && f !== $) q = !0;
            _ = f;
            let w = i0$(H, { credentials: _, credentialDefaultProvider: H.credentialDefaultProvider }),
              Y = n0$(H, w);
            if (q && !Y.attributed)
              ($ = async (D) => Y(D).then((j) => g0$.setCredentialFeature(j, "CREDENTIALS_CODE", "e"))),
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
        if (H.signer) z = nt.normalizeProvider(H.signer);
        else if (H.regionInfoProvider)
          z = () =>
            nt
              .normalizeProvider(H.region)()
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
                return new (H.signerConstructor || lS8.SignatureV4)(j);
              });
        else
          z = async (f) => {
            f = Object.assign(
              {},
              {
                name: "sigv4",
                signingName: H.signingName || H.defaultSigningName,
                signingRegion: await nt.normalizeProvider(H.region)(),
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
            return new (H.signerConstructor || lS8.SignatureV4)(D);
          };
        return Object.assign(H, { systemClockOffset: O, signingEscapePath: K, signer: z });
      },
      l0$ = eS8;
    function i0$(H, { credentials: _, credentialDefaultProvider: q }) {
      let $;
      if (_)
        if (!_?.memoized) $ = nt.memoizeIdentityProvider(_, nt.isIdentityExpired, nt.doesIdentityRequireRefresh);
        else $ = _;
      else if (q) $ = nt.normalizeProvider(q(Object.assign({}, H, { parentClientConfig: H })));
      else
        $ = async () => {
          throw Error(
            "@aws-sdk/core::resolveAwsSdkSigV4Config - `credentials` not provided and no credentialDefaultProvider was configured.",
          );
        };
      return ($.memoized = !0), $;
    }
    function n0$(H, _) {
      if (_.configBound) return _;
      let q = async ($) => _({ ...$, callerClientConfig: H });
      return (q.memoized = _.memoized), (q.configBound = !0), q;
    }
    kI.AWSSDKSigV4Signer = c0$;
    kI.AwsSdkSigV4ASigner = sS8;
    kI.AwsSdkSigV4Signer = LO_;
    kI.NODE_AUTH_SCHEME_PREFERENCE_OPTIONS = F0$;
    kI.NODE_SIGV4A_CONFIG_OPTIONS = Q0$;
    kI.getBearerTokenEnvKey = tS8;
    kI.resolveAWSSDKSigV4Config = l0$;
    kI.resolveAwsSdkSigV4AConfig = U0$;
    kI.resolveAwsSdkSigV4Config = eS8;
    kI.validateSigningProperties = BK6;
  });
