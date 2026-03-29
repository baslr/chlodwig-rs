    rz6();
    JA6();
    ws8();
    pJ();
    NA6();
    NS();
    $Hq();
    MHq();
    (rf_ = u(xQ(), 1)),
      (JHq = u(mQ(), 1)),
      (PHq = u(pQ(), 1)),
      (of_ = u(fB(), 1)),
      (XHq = u(Y2(), 1)),
      (qPH = u(m$(), 1)),
      (WHq = u(qz(), 1)),
      (GHq = u(UQ(), 1)),
      (RHq = u(I6(), 1)),
      (af_ = u(jX(), 1));
    $PH = class $PH extends gmH {
      config;
      constructor(...[H]) {
        let _ = qHq(H || {});
        super(_);
        this.initConfig = _;
        let q = $e8(_),
          $ = of_.resolveUserAgentConfig(q),
          K = af_.resolveRetryConfig($),
          O = XHq.resolveRegionConfig(K),
          T = rf_.resolveHostHeaderConfig(O),
          z = RHq.resolveEndpointConfig(T),
          A = fs8(z),
          f = qe8(A),
          w = fa8(f),
          Y = Ts8(w),
          D = jHq(Y, H?.extensions || []);
        (this.config = D),
          this.middlewareStack.use(WHq.getSchemaSerdePlugin(this.config)),
          this.middlewareStack.use(of_.getUserAgentPlugin(this.config)),
          this.middlewareStack.use(af_.getRetryPlugin(this.config)),
          this.middlewareStack.use(GHq.getContentLengthPlugin(this.config)),
          this.middlewareStack.use(rf_.getHostHeaderPlugin(this.config)),
          this.middlewareStack.use(JHq.getLoggerPlugin(this.config)),
          this.middlewareStack.use(PHq.getRecursionDetectionPlugin(this.config)),
          this.middlewareStack.use(
            qPH.getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
              httpAuthSchemeParametersProvider: He8,
              identityProviderConfigProvider: async (j) =>
                new qPH.DefaultIdentityProviderConfig({
                  "aws.auth#sigv4": j.credentials,
                  "smithy.api#httpBearerAuth": j.token,
                }),
            }),
          ),
          this.middlewareStack.use(qPH.getHttpSigningPlugin(this.config));
      }
      destroy() {
        super.destroy();
      }
    };
