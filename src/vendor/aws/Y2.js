  var Y2 = d((DX) => {
    var qe = zb8(),
      iO_ = E0(),
      eZ$ = vI(),
      wb8 = "AWS_USE_DUALSTACK_ENDPOINT",
      Yb8 = "use_dualstack_endpoint",
      HL$ = !1,
      _L$ = {
        environmentVariableSelector: (H) => qe.booleanSelector(H, wb8, qe.SelectorType.ENV),
        configFileSelector: (H) => qe.booleanSelector(H, Yb8, qe.SelectorType.CONFIG),
        default: !1,
      },
      Db8 = "AWS_USE_FIPS_ENDPOINT",
      jb8 = "use_fips_endpoint",
      qL$ = !1,
      $L$ = {
        environmentVariableSelector: (H) => qe.booleanSelector(H, Db8, qe.SelectorType.ENV),
        configFileSelector: (H) => qe.booleanSelector(H, jb8, qe.SelectorType.CONFIG),
        default: !1,
      },
      KL$ = (H) => {
        let { tls: _, endpoint: q, urlParser: $, useDualstackEndpoint: K } = H;
        return Object.assign(H, {
          tls: _ ?? !0,
          endpoint: iO_.normalizeProvider(typeof q === "string" ? $(q) : q),
          isCustomEndpoint: !0,
          useDualstackEndpoint: iO_.normalizeProvider(K ?? !1),
        });
      },
      OL$ = async (H) => {
        let { tls: _ = !0 } = H,
          q = await H.region();
        if (!new RegExp(/^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])$/).test(q))
          throw Error("Invalid region in client config");
        let K = await H.useDualstackEndpoint(),
          O = await H.useFipsEndpoint(),
          { hostname: T } = (await H.regionInfoProvider(q, { useDualstackEndpoint: K, useFipsEndpoint: O })) ?? {};
        if (!T) throw Error("Cannot resolve hostname from client config");
        return H.urlParser(`${_ ? "https:" : "http:"}//${T}`);
      },
      TL$ = (H) => {
        let _ = iO_.normalizeProvider(H.useDualstackEndpoint ?? !1),
          { endpoint: q, useFipsEndpoint: $, urlParser: K, tls: O } = H;
        return Object.assign(H, {
          tls: O ?? !0,
          endpoint: q
            ? iO_.normalizeProvider(typeof q === "string" ? K(q) : q)
            : () => OL$({ ...H, useDualstackEndpoint: _, useFipsEndpoint: $ }),
          isCustomEndpoint: !!q,
          useDualstackEndpoint: _,
        });
      },
      Mb8 = "AWS_REGION",
      Jb8 = "region",
      zL$ = {
        environmentVariableSelector: (H) => H[Mb8],
        configFileSelector: (H) => H[Jb8],
        default: () => {
          throw Error("Region is missing");
        },
      },
      AL$ = { preferredFile: "credentials" },
      Ab8 = new Set(),
      fL$ = (H, _ = eZ$.isValidHostLabel) => {
        if (!Ab8.has(H) && !_(H))
          if (H === "*")
            console.warn(
              '@smithy/config-resolver WARN - Please use the caller region instead of "*". See "sigv4a" in https://github.com/aws/aws-sdk-js-v3/blob/main/supplemental-docs/CLIENTS.md.',
            );
          else throw Error(`Region not accepted: region="${H}" is not a valid hostname component.`);
        else Ab8.add(H);
      },
      Pb8 = (H) => typeof H === "string" && (H.startsWith("fips-") || H.endsWith("-fips")),
      wL$ = (H) =>
        Pb8(H)
          ? ["fips-aws-global", "aws-fips"].includes(H)
            ? "us-east-1"
            : H.replace(/fips-(dkr-|prod-)?|-fips/, "")
          : H,
      YL$ = (H) => {
        let { region: _, useFipsEndpoint: q } = H;
        if (!_) throw Error("Region is missing");
        return Object.assign(H, {
          region: async () => {
            let $ = typeof _ === "function" ? await _() : _,
              K = wL$($);
            return fL$(K), K;
          },
          useFipsEndpoint: async () => {
            let $ = typeof _ === "string" ? _ : await _();
            if (Pb8($)) return !0;
            return typeof q !== "function" ? Promise.resolve(!!q) : q();
          },
        });
      },
      fb8 = (H = [], { useFipsEndpoint: _, useDualstackEndpoint: q }) =>
        H.find(({ tags: $ }) => _ === $.includes("fips") && q === $.includes("dualstack"))?.hostname,
      DL$ = (H, { regionHostname: _, partitionHostname: q }) => (_ ? _ : q ? q.replace("{region}", H) : void 0),
      jL$ = (H, { partitionHash: _ }) => Object.keys(_ || {}).find((q) => _[q].regions.includes(H)) ?? "aws",
      ML$ = (H, { signingRegion: _, regionRegex: q, useFipsEndpoint: $ }) => {
        if (_) return _;
        else if ($) {
          let K = q.replace("\\\\", "\\").replace(/^\^/g, "\\.").replace(/\$$/g, "\\."),
            O = H.match(K);
          if (O) return O[0].slice(1, -1);
        }
      },
      JL$ = (
        H,
        { useFipsEndpoint: _ = !1, useDualstackEndpoint: q = !1, signingService: $, regionHash: K, partitionHash: O },
      ) => {
        let T = jL$(H, { partitionHash: O }),
          z = H in K ? H : (O[T]?.endpoint ?? H),
          A = { useFipsEndpoint: _, useDualstackEndpoint: q },
          f = fb8(K[z]?.variants, A),
          w = fb8(O[T]?.variants, A),
          Y = DL$(z, { regionHostname: f, partitionHostname: w });
        if (Y === void 0)
          throw Error(
            `Endpoint resolution failed for: ${{ resolvedRegion: z, useFipsEndpoint: _, useDualstackEndpoint: q }}`,
          );
        let D = ML$(Y, { signingRegion: K[z]?.signingRegion, regionRegex: O[T].regionRegex, useFipsEndpoint: _ });
        return {
          partition: T,
          signingService: $,
          hostname: Y,
          ...(D && { signingRegion: D }),
          ...(K[z]?.signingService && { signingService: K[z].signingService }),
        };
      };
    DX.CONFIG_USE_DUALSTACK_ENDPOINT = Yb8;
    DX.CONFIG_USE_FIPS_ENDPOINT = jb8;
    DX.DEFAULT_USE_DUALSTACK_ENDPOINT = HL$;
    DX.DEFAULT_USE_FIPS_ENDPOINT = qL$;
    DX.ENV_USE_DUALSTACK_ENDPOINT = wb8;
    DX.ENV_USE_FIPS_ENDPOINT = Db8;
    DX.NODE_REGION_CONFIG_FILE_OPTIONS = AL$;
    DX.NODE_REGION_CONFIG_OPTIONS = zL$;
    DX.NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS = _L$;
    DX.NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS = $L$;
    DX.REGION_ENV_NAME = Mb8;
    DX.REGION_INI_NAME = Jb8;
    DX.getRegionInfo = JL$;
    DX.resolveCustomEndpointsConfig = KL$;
    DX.resolveEndpointsConfig = TL$;
    DX.resolveRegionConfig = YL$;
  });
