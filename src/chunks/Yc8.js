  var Yc8 = d((ZS) => {
    var cd8 = xQ(),
      CE$ = mQ(),
      bE$ = pQ(),
      Fd8 = fB(),
      IE$ = Y2(),
      hO6 = m$(),
      vJH = qz(),
      uE$ = UQ(),
      Kc8 = I6(),
      Ud8 = jX(),
      Le = tR(),
      Qd8 = RO6(),
      xE$ = dd8(),
      ld8 = hI(),
      id8 = JT_(),
      mE$ = (H) => {
        return Object.assign(H, {
          useDualstackEndpoint: H.useDualstackEndpoint ?? !1,
          useFipsEndpoint: H.useFipsEndpoint ?? !1,
          defaultSigningName: "signin",
        });
      },
      pE$ = {
        UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
        Endpoint: { type: "builtInParams", name: "endpoint" },
        Region: { type: "builtInParams", name: "region" },
        UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" },
      },
      BE$ = (H) => {
        let { httpAuthSchemes: _, httpAuthSchemeProvider: q, credentials: $ } = H;
        return {
          setHttpAuthScheme(K) {
            let O = _.findIndex((T) => T.schemeId === K.schemeId);
            if (O === -1) _.push(K);
            else _.splice(O, 1, K);
          },
          httpAuthSchemes() {
            return _;
          },
          setHttpAuthSchemeProvider(K) {
            q = K;
          },
          httpAuthSchemeProvider() {
            return q;
          },
          setCredentials(K) {
            $ = K;
          },
          credentials() {
            return $;
          },
        };
      },
      gE$ = (H) => {
        return {
          httpAuthSchemes: H.httpAuthSchemes(),
          httpAuthSchemeProvider: H.httpAuthSchemeProvider(),
          credentials: H.credentials(),
        };
      },
      dE$ = (H, _) => {
        let q = Object.assign(
          ld8.getAwsRegionExtensionConfiguration(H),
          Le.getDefaultExtensionConfiguration(H),
          id8.getHttpHandlerExtensionConfiguration(H),
          BE$(H),
        );
        return (
          _.forEach(($) => $.configure(q)),
          Object.assign(
            H,
            ld8.resolveAwsRegionExtensionConfiguration(q),
            Le.resolveDefaultRuntimeConfig(q),
            id8.resolveHttpHandlerRuntimeConfig(q),
            gE$(q),
          )
        );
      };
    class yO6 extends Le.Client {
      config;
      constructor(...[H]) {
        let _ = xE$.getRuntimeConfig(H || {});
        super(_);
        this.initConfig = _;
        let q = mE$(_),
          $ = Fd8.resolveUserAgentConfig(q),
          K = Ud8.resolveRetryConfig($),
          O = IE$.resolveRegionConfig(K),
          T = cd8.resolveHostHeaderConfig(O),
          z = Kc8.resolveEndpointConfig(T),
          A = Qd8.resolveHttpAuthSchemeConfig(z),
          f = dE$(A, H?.extensions || []);
        (this.config = f),
          this.middlewareStack.use(vJH.getSchemaSerdePlugin(this.config)),
          this.middlewareStack.use(Fd8.getUserAgentPlugin(this.config)),
          this.middlewareStack.use(Ud8.getRetryPlugin(this.config)),
          this.middlewareStack.use(uE$.getContentLengthPlugin(this.config)),
          this.middlewareStack.use(cd8.getHostHeaderPlugin(this.config)),
          this.middlewareStack.use(CE$.getLoggerPlugin(this.config)),
          this.middlewareStack.use(bE$.getRecursionDetectionPlugin(this.config)),
          this.middlewareStack.use(
            hO6.getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
              httpAuthSchemeParametersProvider: Qd8.defaultSigninHttpAuthSchemeParametersProvider,
              identityProviderConfigProvider: async (w) =>
                new hO6.DefaultIdentityProviderConfig({ "aws.auth#sigv4": w.credentials }),
            }),
          ),
          this.middlewareStack.use(hO6.getHttpSigningPlugin(this.config));
      }
      destroy() {
        super.destroy();
      }
    }
    var NJH = class H extends Le.ServiceException {
        constructor(_) {
          super(_);
          Object.setPrototypeOf(this, H.prototype);
        }
      },
      Oc8 = class H extends NJH {
        name = "AccessDeniedException";
        $fault = "client";
        error;
        constructor(_) {
          super({ name: "AccessDeniedException", $fault: "client", ..._ });
          Object.setPrototypeOf(this, H.prototype), (this.error = _.error);
        }
      },
      Tc8 = class H extends NJH {
        name = "InternalServerException";
        $fault = "server";
        error;
        constructor(_) {
          super({ name: "InternalServerException", $fault: "server", ..._ });
          Object.setPrototypeOf(this, H.prototype), (this.error = _.error);
        }
      },
      zc8 = class H extends NJH {
        name = "TooManyRequestsError";
        $fault = "client";
        error;
        constructor(_) {
          super({ name: "TooManyRequestsError", $fault: "client", ..._ });
          Object.setPrototypeOf(this, H.prototype), (this.error = _.error);
        }
      },
      Ac8 = class H extends NJH {
        name = "ValidationException";
        $fault = "client";
        error;
        constructor(_) {
          super({ name: "ValidationException", $fault: "client", ..._ });
          Object.setPrototypeOf(this, H.prototype), (this.error = _.error);
        }
      },
      cE$ = "AccessDeniedException",
      FE$ = "AccessToken",
      UE$ = "CreateOAuth2Token",
      QE$ = "CreateOAuth2TokenRequest",
      lE$ = "CreateOAuth2TokenRequestBody",
      iE$ = "CreateOAuth2TokenResponseBody",
      nE$ = "CreateOAuth2TokenResponse",
      rE$ = "InternalServerException",
      oE$ = "RefreshToken",
      aE$ = "TooManyRequestsError",
      sE$ = "ValidationException",
      nd8 = "accessKeyId",
      rd8 = "accessToken",
      VO6 = "client",
      od8 = "clientId",
      ad8 = "codeVerifier",
      tE$ = "code",
      ke = "error",
      sd8 = "expiresIn",
      td8 = "grantType",
      eE$ = "http",
      SO6 = "httpError",
      ed8 = "idToken",
      hh = "jsonName",
      zz_ = "message",
      Tz_ = "refreshToken",
      Hc8 = "redirectUri",
      HC$ = "server",
      _c8 = "secretAccessKey",
      qc8 = "sessionToken",
      fc8 = "smithy.ts.sdk.synthetic.com.amazonaws.signin",
      _C$ = "tokenInput",
      qC$ = "tokenOutput",
      $c8 = "tokenType",
      eR = "com.amazonaws.signin",
      wc8 = [0, eR, oE$, 8, 0],
      $C$ = [-3, eR, cE$, { [ke]: VO6 }, [ke, zz_], [0, 0]];
    vJH.TypeRegistry.for(eR).registerError($C$, Oc8);
    var KC$ = [
        3,
        eR,
        FE$,
        8,
        [nd8, _c8, qc8],
        [
          [0, { [hh]: nd8 }],
          [0, { [hh]: _c8 }],
          [0, { [hh]: qc8 }],
        ],
      ],
      OC$ = [3, eR, QE$, 0, [_C$], [[() => TC$, 16]]],
      TC$ = [
        3,
        eR,
        lE$,
        0,
        [od8, td8, tE$, Hc8, ad8, Tz_],
        [[0, { [hh]: od8 }], [0, { [hh]: td8 }], 0, [0, { [hh]: Hc8 }], [0, { [hh]: ad8 }], [() => wc8, { [hh]: Tz_ }]],
      ],
      zC$ = [3, eR, nE$, 0, [qC$], [[() => AC$, 16]]],
      AC$ = [
        3,
        eR,
        iE$,
        0,
        [rd8, $c8, sd8, Tz_, ed8],
        [
          [() => KC$, { [hh]: rd8 }],
          [0, { [hh]: $c8 }],
          [1, { [hh]: sd8 }],
          [() => wc8, { [hh]: Tz_ }],
          [0, { [hh]: ed8 }],
        ],
      ],
      fC$ = [-3, eR, rE$, { [ke]: HC$, [SO6]: 500 }, [ke, zz_], [0, 0]];
    vJH.TypeRegistry.for(eR).registerError(fC$, Tc8);
    var wC$ = [-3, eR, aE$, { [ke]: VO6, [SO6]: 429 }, [ke, zz_], [0, 0]];
    vJH.TypeRegistry.for(eR).registerError(wC$, zc8);
    var YC$ = [-3, eR, sE$, { [ke]: VO6, [SO6]: 400 }, [ke, zz_], [0, 0]];
    vJH.TypeRegistry.for(eR).registerError(YC$, Ac8);
    var DC$ = [-3, fc8, "SigninServiceException", 0, [], []];
    vJH.TypeRegistry.for(fc8).registerError(DC$, NJH);
    var jC$ = [9, eR, UE$, { [eE$]: ["POST", "/v1/token", 200] }, () => OC$, () => zC$];
    class EO6 extends Le.Command.classBuilder()
      .ep(pE$)
      .m(function (H, _, q, $) {
        return [Kc8.getEndpointPlugin(q, H.getEndpointParameterInstructions())];
      })
      .s("Signin", "CreateOAuth2Token", {})
      .n("SigninClient", "CreateOAuth2TokenCommand")
      .sc(jC$)
      .build() {}
    var MC$ = { CreateOAuth2TokenCommand: EO6 };
    class CO6 extends yO6 {}
    Le.createAggregatedClient(MC$, CO6);
    var JC$ = {
      AUTHCODE_EXPIRED: "AUTHCODE_EXPIRED",
      INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
      INVALID_REQUEST: "INVALID_REQUEST",
      SERVER_ERROR: "server_error",
      TOKEN_EXPIRED: "TOKEN_EXPIRED",
      USER_CREDENTIALS_CHANGED: "USER_CREDENTIALS_CHANGED",
    };
    Object.defineProperty(ZS, "$Command", {
      enumerable: !0,
      get: function () {
        return Le.Command;
      },
    });
    Object.defineProperty(ZS, "__Client", {
      enumerable: !0,
      get: function () {
        return Le.Client;
      },
    });
    ZS.AccessDeniedException = Oc8;
    ZS.CreateOAuth2TokenCommand = EO6;
    ZS.InternalServerException = Tc8;
    ZS.OAuth2ErrorCode = JC$;
    ZS.Signin = CO6;
    ZS.SigninClient = yO6;
    ZS.SigninServiceException = NJH;
    ZS.TooManyRequestsError = zc8;
    ZS.ValidationException = Ac8;
  });
