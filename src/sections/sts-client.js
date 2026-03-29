    yM();
    Ef6();
    Vh();
    Gqq();
    Eqq();
    (Fw_ = u(xQ(), 1)),
      (Cqq = u(mQ(), 1)),
      (bqq = u(pQ(), 1)),
      (Uw_ = u(fB(), 1)),
      (Iqq = u(Y2(), 1)),
      (jPH = u(m$(), 1)),
      (uqq = u(qz(), 1)),
      (xqq = u(UQ(), 1)),
      (mqq = u(I6(), 1)),
      (Qw_ = u(jX(), 1));
    Ol = class Ol extends $pH {
      config;
      constructor(...[H]) {
        let _ = Wqq(H || {});
        super(_);
        this.initConfig = _;
        let q = S8q(_),
          $ = Uw_.resolveUserAgentConfig(q),
          K = Qw_.resolveRetryConfig($),
          O = Iqq.resolveRegionConfig(K),
          T = Fw_.resolveHostHeaderConfig(O),
          z = mqq.resolveEndpointConfig(T),
          A = V8q(z),
          f = Sqq(A, H?.extensions || []);
        (this.config = f),
          this.middlewareStack.use(uqq.getSchemaSerdePlugin(this.config)),
          this.middlewareStack.use(Uw_.getUserAgentPlugin(this.config)),
          this.middlewareStack.use(Qw_.getRetryPlugin(this.config)),
          this.middlewareStack.use(xqq.getContentLengthPlugin(this.config)),
          this.middlewareStack.use(Fw_.getHostHeaderPlugin(this.config)),
          this.middlewareStack.use(Cqq.getLoggerPlugin(this.config)),
          this.middlewareStack.use(bqq.getRecursionDetectionPlugin(this.config)),
          this.middlewareStack.use(
            jPH.getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
              httpAuthSchemeParametersProvider: h8q,
              identityProviderConfigProvider: async (w) =>
                new jPH.DefaultIdentityProviderConfig({ "aws.auth#sigv4": w.credentials }),
            }),
          ),
          this.middlewareStack.use(jPH.getHttpSigningPlugin(this.config));
      }
      destroy() {
        super.destroy();
      }
    };
