    F8();
    HT6();
    _q();
    FQ8();
    eQ8();
    (Sz_ = u(xQ(), 1)),
      (Hl8 = u(mQ(), 1)),
      (_l8 = u(pQ(), 1)),
      (Ez_ = u(fB(), 1)),
      (ql8 = u(Y2(), 1)),
      (EJH = u(m$(), 1)),
      ($l8 = u(qz(), 1)),
      (Kl8 = u(UQ(), 1)),
      (Ol8 = u(I6(), 1)),
      (Cz_ = u(jX(), 1));
    QK = class QK extends ZmH {
      config;
      constructor(...[H]) {
        let _ = cQ8(H || {});
        super(_);
        this.initConfig = _;
        let q = $Q8(_),
          $ = Ez_.resolveUserAgentConfig(q),
          K = Cz_.resolveRetryConfig($),
          O = ql8.resolveRegionConfig(K),
          T = Sz_.resolveHostHeaderConfig(O),
          z = Ol8.resolveEndpointConfig(T),
          A = qQ8(z),
          f = tQ8(A, H?.extensions || []);
        (this.config = f),
          this.middlewareStack.use($l8.getSchemaSerdePlugin(this.config)),
          this.middlewareStack.use(Ez_.getUserAgentPlugin(this.config)),
          this.middlewareStack.use(Cz_.getRetryPlugin(this.config)),
          this.middlewareStack.use(Kl8.getContentLengthPlugin(this.config)),
          this.middlewareStack.use(Sz_.getHostHeaderPlugin(this.config)),
          this.middlewareStack.use(Hl8.getLoggerPlugin(this.config)),
          this.middlewareStack.use(_l8.getRecursionDetectionPlugin(this.config)),
          this.middlewareStack.use(
            EJH.getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
              httpAuthSchemeParametersProvider: HQ8,
              identityProviderConfigProvider: async (w) =>
                new EJH.DefaultIdentityProviderConfig({
                  "aws.auth#sigv4": w.credentials,
                  "smithy.api#httpBearerAuth": w.token,
                }),
            }),
          ),
          this.middlewareStack.use(EJH.getHttpSigningPlugin(this.config));
      }
      destroy() {
        super.destroy();
      }
    };
