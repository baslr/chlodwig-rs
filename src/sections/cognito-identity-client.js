    IO();
    _w6();
    Rf();
    K4q();
    J4q();
    (WY_ = u(xQ(), 1)),
      (P4q = u(mQ(), 1)),
      (X4q = u(pQ(), 1)),
      (GY_ = u(fB(), 1)),
      (W4q = u(Y2(), 1)),
      (WPH = u(m$(), 1)),
      (G4q = u(qz(), 1)),
      (R4q = u(UQ(), 1)),
      (Z4q = u(I6(), 1)),
      (RY_ = u(jX(), 1));
    DKH = class DKH extends TY_ {
      config;
      constructor(...[H]) {
        let _ = $4q(H || {});
        super(_);
        this.initConfig = _;
        let q = G$q(_),
          $ = GY_.resolveUserAgentConfig(q),
          K = RY_.resolveRetryConfig($),
          O = W4q.resolveRegionConfig(K),
          T = WY_.resolveHostHeaderConfig(O),
          z = Z4q.resolveEndpointConfig(T),
          A = W$q(z),
          f = M4q(A, H?.extensions || []);
        (this.config = f),
          this.middlewareStack.use(G4q.getSchemaSerdePlugin(this.config)),
          this.middlewareStack.use(GY_.getUserAgentPlugin(this.config)),
          this.middlewareStack.use(RY_.getRetryPlugin(this.config)),
          this.middlewareStack.use(R4q.getContentLengthPlugin(this.config)),
          this.middlewareStack.use(WY_.getHostHeaderPlugin(this.config)),
          this.middlewareStack.use(P4q.getLoggerPlugin(this.config)),
          this.middlewareStack.use(X4q.getRecursionDetectionPlugin(this.config)),
          this.middlewareStack.use(
            WPH.getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
              httpAuthSchemeParametersProvider: P$q,
              identityProviderConfigProvider: async (w) =>
                new WPH.DefaultIdentityProviderConfig({ "aws.auth#sigv4": w.credentials }),
            }),
          ),
          this.middlewareStack.use(WPH.getHttpSigningPlugin(this.config));
      }
      destroy() {
        super.destroy();
      }
    };
