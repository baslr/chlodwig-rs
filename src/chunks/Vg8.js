  var Vg8 = d((nT_) => {
    Object.defineProperty(nT_, "__esModule", { value: !0 });
    nT_.getRuntimeConfig = void 0;
    var JV$ = gMH(),
      PV$ = JV$.__importDefault(qT_()),
      wO6 = mA(),
      Ng8 = lQ(),
      iT_ = Y2(),
      XV$ = m$(),
      WV$ = iQ(),
      hg8 = jX(),
      F1H = oR(),
      yg8 = eL(),
      GV$ = nQ(),
      RV$ = wB(),
      ZV$ = vg8(),
      LV$ = tR(),
      kV$ = sQ(),
      vV$ = tR(),
      NV$ = (H) => {
        (0, vV$.emitWarningIfUnsupportedVersion)(process.version);
        let _ = (0, kV$.resolveDefaultsModeConfig)(H),
          q = () => _().then(LV$.loadConfigsForDefaultMode),
          $ = (0, ZV$.getRuntimeConfig)(H);
        (0, wO6.emitWarningIfUnsupportedVersion)(process.version);
        let K = { profile: H?.profile, logger: $.logger };
        return {
          ...$,
          ...H,
          runtime: "node",
          defaultsMode: _,
          authSchemePreference:
            H?.authSchemePreference ?? (0, F1H.loadConfig)(wO6.NODE_AUTH_SCHEME_PREFERENCE_OPTIONS, K),
          bodyLengthChecker: H?.bodyLengthChecker ?? GV$.calculateBodyLength,
          defaultUserAgentProvider:
            H?.defaultUserAgentProvider ??
            (0, Ng8.createDefaultUserAgentProvider)({ serviceId: $.serviceId, clientVersion: PV$.default.version }),
          httpAuthSchemes: H?.httpAuthSchemes ?? [
            {
              schemeId: "aws.auth#sigv4",
              identityProvider: (O) =>
                O.getIdentityProvider("aws.auth#sigv4") ||
                (async (T) => await H.credentialDefaultProvider(T?.__config || {})()),
              signer: new wO6.AwsSdkSigV4Signer(),
            },
            {
              schemeId: "smithy.api#noAuth",
              identityProvider: (O) => O.getIdentityProvider("smithy.api#noAuth") || (async () => ({})),
              signer: new XV$.NoAuthSigner(),
            },
          ],
          maxAttempts: H?.maxAttempts ?? (0, F1H.loadConfig)(hg8.NODE_MAX_ATTEMPT_CONFIG_OPTIONS, H),
          region:
            H?.region ??
            (0, F1H.loadConfig)(iT_.NODE_REGION_CONFIG_OPTIONS, { ...iT_.NODE_REGION_CONFIG_FILE_OPTIONS, ...K }),
          requestHandler: yg8.NodeHttpHandler.create(H?.requestHandler ?? q),
          retryMode:
            H?.retryMode ??
            (0, F1H.loadConfig)(
              {
                ...hg8.NODE_RETRY_MODE_CONFIG_OPTIONS,
                default: async () => (await q()).retryMode || RV$.DEFAULT_RETRY_MODE,
              },
              H,
            ),
          sha256: H?.sha256 ?? WV$.Hash.bind(null, "sha256"),
          streamCollector: H?.streamCollector ?? yg8.streamCollector,
          useDualstackEndpoint:
            H?.useDualstackEndpoint ?? (0, F1H.loadConfig)(iT_.NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, K),
          useFipsEndpoint: H?.useFipsEndpoint ?? (0, F1H.loadConfig)(iT_.NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, K),
          userAgentAppId: H?.userAgentAppId ?? (0, F1H.loadConfig)(Ng8.NODE_APP_ID_CONFIG_OPTIONS, K),
        };
      };
    nT_.getRuntimeConfig = NV$;
  });
