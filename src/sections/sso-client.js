    GS();
    F36();
    DJH();
    zB8();
    WB8();
    (CT_ = u(xQ(), 1)),
      (GB8 = u(mQ(), 1)),
      (RB8 = u(pQ(), 1)),
      (bT_ = u(fB(), 1)),
      (ZB8 = u(Y2(), 1)),
      (MJH = u(m$(), 1)),
      (LB8 = u(qz(), 1)),
      (kB8 = u(UQ(), 1)),
      (vB8 = u(I6(), 1)),
      (IT_ = u(jX(), 1));
    tQ = class tQ extends GT_ {
      config;
      constructor(...[H]) {
        let _ = TB8(H || {});
        super(_);
        this.initConfig = _;
        let q = Lp8(_),
          $ = bT_.resolveUserAgentConfig(q),
          K = IT_.resolveRetryConfig($),
          O = ZB8.resolveRegionConfig(K),
          T = CT_.resolveHostHeaderConfig(O),
          z = vB8.resolveEndpointConfig(T),
          A = Zp8(z),
          f = XB8(A, H?.extensions || []);
        (this.config = f),
          this.middlewareStack.use(LB8.getSchemaSerdePlugin(this.config)),
          this.middlewareStack.use(bT_.getUserAgentPlugin(this.config)),
          this.middlewareStack.use(IT_.getRetryPlugin(this.config)),
          this.middlewareStack.use(kB8.getContentLengthPlugin(this.config)),
          this.middlewareStack.use(CT_.getHostHeaderPlugin(this.config)),
          this.middlewareStack.use(GB8.getLoggerPlugin(this.config)),
          this.middlewareStack.use(RB8.getRecursionDetectionPlugin(this.config)),
          this.middlewareStack.use(
            MJH.getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
              httpAuthSchemeParametersProvider: Gp8,
              identityProviderConfigProvider: async (w) =>
                new MJH.DefaultIdentityProviderConfig({ "aws.auth#sigv4": w.credentials }),
            }),
          ),
          this.middlewareStack.use(MJH.getHttpSigningPlugin(this.config));
      }
      destroy() {
        super.destroy();
      }
    };
