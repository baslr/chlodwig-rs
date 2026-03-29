  var E36 = d((Aj) => {
    var ru8 = xQ(),
      oN$ = mQ(),
      aN$ = pQ(),
      ou8 = fB(),
      sN$ = Y2(),
      h36 = m$(),
      kh = qz(),
      tN$ = UQ(),
      Hx8 = I6(),
      au8 = jX(),
      we = tR(),
      su8 = z36(),
      eN$ = cu8(),
      tu8 = hI(),
      eu8 = JT_(),
      Hh$ = (H) => {
        return Object.assign(H, {
          useDualstackEndpoint: H.useDualstackEndpoint ?? !1,
          useFipsEndpoint: H.useFipsEndpoint ?? !1,
          defaultSigningName: "sso-oauth",
        });
      },
      _h$ = {
        UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
        Endpoint: { type: "builtInParams", name: "endpoint" },
        Region: { type: "builtInParams", name: "region" },
        UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" },
      },
      qh$ = (H) => {
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
      $h$ = (H) => {
        return {
          httpAuthSchemes: H.httpAuthSchemes(),
          httpAuthSchemeProvider: H.httpAuthSchemeProvider(),
          credentials: H.credentials(),
        };
      },
      Kh$ = (H, _) => {
        let q = Object.assign(
          tu8.getAwsRegionExtensionConfiguration(H),
          we.getDefaultExtensionConfiguration(H),
          eu8.getHttpHandlerExtensionConfiguration(H),
          qh$(H),
        );
        return (
          _.forEach(($) => $.configure(q)),
          Object.assign(
            H,
            tu8.resolveAwsRegionExtensionConfiguration(q),
            we.resolveDefaultRuntimeConfig(q),
            eu8.resolveHttpHandlerRuntimeConfig(q),
            $h$(q),
          )
        );
      };
    class y36 extends we.Client {
      config;
      constructor(...[H]) {
        let _ = eN$.getRuntimeConfig(H || {});
        super(_);
        this.initConfig = _;
        let q = Hh$(_),
          $ = ou8.resolveUserAgentConfig(q),
          K = au8.resolveRetryConfig($),
          O = sN$.resolveRegionConfig(K),
          T = ru8.resolveHostHeaderConfig(O),
          z = Hx8.resolveEndpointConfig(T),
          A = su8.resolveHttpAuthSchemeConfig(z),
          f = Kh$(A, H?.extensions || []);
        (this.config = f),
          this.middlewareStack.use(kh.getSchemaSerdePlugin(this.config)),
          this.middlewareStack.use(ou8.getUserAgentPlugin(this.config)),
          this.middlewareStack.use(au8.getRetryPlugin(this.config)),
          this.middlewareStack.use(tN$.getContentLengthPlugin(this.config)),
          this.middlewareStack.use(ru8.getHostHeaderPlugin(this.config)),
          this.middlewareStack.use(oN$.getLoggerPlugin(this.config)),
          this.middlewareStack.use(aN$.getRecursionDetectionPlugin(this.config)),
          this.middlewareStack.use(
            h36.getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
              httpAuthSchemeParametersProvider: su8.defaultSSOOIDCHttpAuthSchemeParametersProvider,
              identityProviderConfigProvider: async (w) =>
                new h36.DefaultIdentityProviderConfig({ "aws.auth#sigv4": w.credentials }),
            }),
          ),
          this.middlewareStack.use(h36.getHttpSigningPlugin(this.config));
      }
      destroy() {
        super.destroy();
      }
    }
    var vh = class H extends we.ServiceException {
        constructor(_) {
          super(_);
          Object.setPrototypeOf(this, H.prototype);
        }
      },
      _x8 = class H extends vh {
        name = "AccessDeniedException";
        $fault = "client";
        error;
        reason;
        error_description;
        constructor(_) {
          super({ name: "AccessDeniedException", $fault: "client", ..._ });
          Object.setPrototypeOf(this, H.prototype),
            (this.error = _.error),
            (this.reason = _.reason),
            (this.error_description = _.error_description);
        }
      },
      qx8 = class H extends vh {
        name = "AuthorizationPendingException";
        $fault = "client";
        error;
        error_description;
        constructor(_) {
          super({ name: "AuthorizationPendingException", $fault: "client", ..._ });
          Object.setPrototypeOf(this, H.prototype),
            (this.error = _.error),
            (this.error_description = _.error_description);
        }
      },
      $x8 = class H extends vh {
        name = "ExpiredTokenException";
        $fault = "client";
        error;
        error_description;
        constructor(_) {
          super({ name: "ExpiredTokenException", $fault: "client", ..._ });
          Object.setPrototypeOf(this, H.prototype),
            (this.error = _.error),
            (this.error_description = _.error_description);
        }
      },
      Kx8 = class H extends vh {
        name = "InternalServerException";
        $fault = "server";
        error;
        error_description;
        constructor(_) {
          super({ name: "InternalServerException", $fault: "server", ..._ });
          Object.setPrototypeOf(this, H.prototype),
            (this.error = _.error),
            (this.error_description = _.error_description);
        }
      },
      Ox8 = class H extends vh {
        name = "InvalidClientException";
        $fault = "client";
        error;
        error_description;
        constructor(_) {
          super({ name: "InvalidClientException", $fault: "client", ..._ });
          Object.setPrototypeOf(this, H.prototype),
            (this.error = _.error),
            (this.error_description = _.error_description);
        }
      },
      Tx8 = class H extends vh {
        name = "InvalidGrantException";
        $fault = "client";
        error;
        error_description;
        constructor(_) {
          super({ name: "InvalidGrantException", $fault: "client", ..._ });
          Object.setPrototypeOf(this, H.prototype),
            (this.error = _.error),
            (this.error_description = _.error_description);
        }
      },
      zx8 = class H extends vh {
        name = "InvalidRequestException";
        $fault = "client";
        error;
        reason;
        error_description;
        constructor(_) {
          super({ name: "InvalidRequestException", $fault: "client", ..._ });
          Object.setPrototypeOf(this, H.prototype),
            (this.error = _.error),
            (this.reason = _.reason),
            (this.error_description = _.error_description);
        }
      },
      Ax8 = class H extends vh {
        name = "InvalidScopeException";
        $fault = "client";
        error;
        error_description;
        constructor(_) {
          super({ name: "InvalidScopeException", $fault: "client", ..._ });
          Object.setPrototypeOf(this, H.prototype),
            (this.error = _.error),
            (this.error_description = _.error_description);
        }
      },
      fx8 = class H extends vh {
        name = "SlowDownException";
        $fault = "client";
        error;
        error_description;
        constructor(_) {
          super({ name: "SlowDownException", $fault: "client", ..._ });
          Object.setPrototypeOf(this, H.prototype),
            (this.error = _.error),
            (this.error_description = _.error_description);
        }
      },
      wx8 = class H extends vh {
        name = "UnauthorizedClientException";
        $fault = "client";
        error;
        error_description;
        constructor(_) {
          super({ name: "UnauthorizedClientException", $fault: "client", ..._ });
          Object.setPrototypeOf(this, H.prototype),
            (this.error = _.error),
            (this.error_description = _.error_description);
        }
      },
      Yx8 = class H extends vh {
        name = "UnsupportedGrantTypeException";
        $fault = "client";
        error;
        error_description;
        constructor(_) {
          super({ name: "UnsupportedGrantTypeException", $fault: "client", ..._ });
          Object.setPrototypeOf(this, H.prototype),
            (this.error = _.error),
            (this.error_description = _.error_description);
        }
      },
      Oh$ = "AccessDeniedException",
      Th$ = "AuthorizationPendingException",
      zh$ = "AccessToken",
      Ah$ = "ClientSecret",
      fh$ = "CreateToken",
      wh$ = "CreateTokenRequest",
      Yh$ = "CreateTokenResponse",
      Dh$ = "CodeVerifier",
      jh$ = "ExpiredTokenException",
      Mh$ = "InvalidClientException",
      Jh$ = "InvalidGrantException",
      Ph$ = "InvalidRequestException",
      Xh$ = "InternalServerException",
      Wh$ = "InvalidScopeException",
      Gh$ = "IdToken",
      Rh$ = "RefreshToken",
      Zh$ = "SlowDownException",
      Lh$ = "UnauthorizedClientException",
      kh$ = "UnsupportedGrantTypeException",
      vh$ = "accessToken",
      DB = "client",
      Nh$ = "clientId",
      hh$ = "clientSecret",
      yh$ = "codeVerifier",
      Vh$ = "code",
      Sh$ = "deviceCode",
      jD = "error",
      Eh$ = "expiresIn",
      yI = "error_description",
      Ch$ = "grantType",
      bh$ = "http",
      VI = "httpError",
      Ih$ = "idToken",
      Dx8 = "reason",
      jx8 = "refreshToken",
      uh$ = "redirectUri",
      xh$ = "scope",
      mh$ = "server",
      Mx8 = "smithy.ts.sdk.synthetic.com.amazonaws.ssooidc",
      ph$ = "tokenType",
      zT = "com.amazonaws.ssooidc",
      Bh$ = [0, zT, zh$, 8, 0],
      gh$ = [0, zT, Ah$, 8, 0],
      dh$ = [0, zT, Dh$, 8, 0],
      ch$ = [0, zT, Gh$, 8, 0],
      Jx8 = [0, zT, Rh$, 8, 0],
      Fh$ = [-3, zT, Oh$, { [jD]: DB, [VI]: 400 }, [jD, Dx8, yI], [0, 0, 0]];
    kh.TypeRegistry.for(zT).registerError(Fh$, _x8);
    var Uh$ = [-3, zT, Th$, { [jD]: DB, [VI]: 400 }, [jD, yI], [0, 0]];
    kh.TypeRegistry.for(zT).registerError(Uh$, qx8);
    var Qh$ = [
        3,
        zT,
        wh$,
        0,
        [Nh$, hh$, Ch$, Sh$, Vh$, jx8, xh$, uh$, yh$],
        [0, [() => gh$, 0], 0, 0, 0, [() => Jx8, 0], 64, 0, [() => dh$, 0]],
      ],
      lh$ = [3, zT, Yh$, 0, [vh$, ph$, Eh$, jx8, Ih$], [[() => Bh$, 0], 0, 1, [() => Jx8, 0], [() => ch$, 0]]],
      ih$ = [-3, zT, jh$, { [jD]: DB, [VI]: 400 }, [jD, yI], [0, 0]];
    kh.TypeRegistry.for(zT).registerError(ih$, $x8);
    var nh$ = [-3, zT, Xh$, { [jD]: mh$, [VI]: 500 }, [jD, yI], [0, 0]];
    kh.TypeRegistry.for(zT).registerError(nh$, Kx8);
    var rh$ = [-3, zT, Mh$, { [jD]: DB, [VI]: 401 }, [jD, yI], [0, 0]];
    kh.TypeRegistry.for(zT).registerError(rh$, Ox8);
    var oh$ = [-3, zT, Jh$, { [jD]: DB, [VI]: 400 }, [jD, yI], [0, 0]];
    kh.TypeRegistry.for(zT).registerError(oh$, Tx8);
    var ah$ = [-3, zT, Ph$, { [jD]: DB, [VI]: 400 }, [jD, Dx8, yI], [0, 0, 0]];
    kh.TypeRegistry.for(zT).registerError(ah$, zx8);
    var sh$ = [-3, zT, Wh$, { [jD]: DB, [VI]: 400 }, [jD, yI], [0, 0]];
    kh.TypeRegistry.for(zT).registerError(sh$, Ax8);
    var th$ = [-3, zT, Zh$, { [jD]: DB, [VI]: 400 }, [jD, yI], [0, 0]];
    kh.TypeRegistry.for(zT).registerError(th$, fx8);
    var eh$ = [-3, zT, Lh$, { [jD]: DB, [VI]: 400 }, [jD, yI], [0, 0]];
    kh.TypeRegistry.for(zT).registerError(eh$, wx8);
    var Hy$ = [-3, zT, kh$, { [jD]: DB, [VI]: 400 }, [jD, yI], [0, 0]];
    kh.TypeRegistry.for(zT).registerError(Hy$, Yx8);
    var _y$ = [-3, Mx8, "SSOOIDCServiceException", 0, [], []];
    kh.TypeRegistry.for(Mx8).registerError(_y$, vh);
    var qy$ = [9, zT, fh$, { [bh$]: ["POST", "/token", 200] }, () => Qh$, () => lh$];
    class V36 extends we.Command.classBuilder()
      .ep(_h$)
      .m(function (H, _, q, $) {
        return [Hx8.getEndpointPlugin(q, H.getEndpointParameterInstructions())];
      })
      .s("AWSSSOOIDCService", "CreateToken", {})
      .n("SSOOIDCClient", "CreateTokenCommand")
      .sc(qy$)
      .build() {}
    var $y$ = { CreateTokenCommand: V36 };
    class S36 extends y36 {}
    we.createAggregatedClient($y$, S36);
    var Ky$ = { KMS_ACCESS_DENIED: "KMS_AccessDeniedException" },
      Oy$ = {
        KMS_DISABLED_KEY: "KMS_DisabledException",
        KMS_INVALID_KEY_USAGE: "KMS_InvalidKeyUsageException",
        KMS_INVALID_STATE: "KMS_InvalidStateException",
        KMS_KEY_NOT_FOUND: "KMS_NotFoundException",
      };
    Object.defineProperty(Aj, "$Command", {
      enumerable: !0,
      get: function () {
        return we.Command;
      },
    });
    Object.defineProperty(Aj, "__Client", {
      enumerable: !0,
      get: function () {
        return we.Client;
      },
    });
    Aj.AccessDeniedException = _x8;
    Aj.AccessDeniedExceptionReason = Ky$;
    Aj.AuthorizationPendingException = qx8;
    Aj.CreateTokenCommand = V36;
    Aj.ExpiredTokenException = $x8;
    Aj.InternalServerException = Kx8;
    Aj.InvalidClientException = Ox8;
    Aj.InvalidGrantException = Tx8;
    Aj.InvalidRequestException = zx8;
    Aj.InvalidRequestExceptionReason = Oy$;
    Aj.InvalidScopeException = Ax8;
    Aj.SSOOIDC = S36;
    Aj.SSOOIDCClient = y36;
    Aj.SSOOIDCServiceException = vh;
    Aj.SlowDownException = fx8;
    Aj.UnauthorizedClientException = wx8;
    Aj.UnsupportedGrantTypeException = Yx8;
  });
