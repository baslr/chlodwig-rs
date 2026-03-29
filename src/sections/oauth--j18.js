    JI();
    k_();
    y6();
    u7();
    k_();
    k_();
    $c();
    gJ();
    LW();
    bvH();
    kV9();
    NV9();
    s1();
    y6();
    H_();
    k0();
    SO();
    H_H();
    g_();
    h_();
    XT();
    n8_();
    LI();
    q5();
    HZ();
    paH();
    aN_();
    Up();
    FV9 = $6(async () => {
      let H = Date.now();
      n_("info", "init_started"), x7("init_function_start");
      try {
        let _ = Date.now();
        N1H(), n_("info", "init_configs_enabled", { duration_ms: Date.now() - _ }), x7("init_configs_enabled");
        let q = Date.now();
        if (
          (hV9(),
          vV9(),
          n_("info", "init_safe_env_vars_applied", { duration_ms: Date.now() - q }),
          x7("init_safe_env_vars_applied"),
          ob7(),
          x7("init_after_graceful_shutdown"),
          Promise.all([Promise.resolve().then(() => ($i(), gIq)), Promise.resolve().then(() => (t6(), rIq))]).then(
            ([O, T]) => {
              O.initialize1PEventLogging(),
                T.onGrowthBookRefresh(() => {
                  O.reinitialize1PEventLoggingIfConfigChanged();
                });
            },
          ),
          x7("init_after_1p_event_logging"),
          Jf6(),
          x7("init_after_oauth_populate"),
          NG6(),
          x7("init_after_jetbrains_detection"),
          jt(),
          cF6())
        )
          SI7();
        if (rx()) bF6();
        x7("init_after_remote_settings_check"), d46();
        let $ = Date.now();
        N("[init] configureGlobalMTLS starting"),
          Hk8(),
          n_("info", "init_mtls_configured", { duration_ms: Date.now() - $ }),
          N("[init] configureGlobalMTLS complete");
        let K = Date.now();
        if (
          (N("[init] configureGlobalAgents starting"),
          Gz_(),
          n_("info", "init_proxy_configured", { duration_ms: Date.now() - K }),
          N("[init] configureGlobalAgents complete"),
          x7("init_network_configured"),
          LV9(),
          lH(process.env.CLAUDE_CODE_REMOTE))
        )
          try {
            let { initUpstreamProxy: O, getUpstreamProxyEnv: T } = await Promise.resolve().then(() => (pV9(), mV9)),
              { registerUpstreamProxyEnvFn: z } = await Promise.resolve().then(() => ($zH(), mW7));
            z(T), await O();
          } catch (O) {
            N(
              `[init] upstreamproxy init failed: ${O instanceof Error ? O.message : String(O)}; continuing without proxy`,
              { level: "warn" },
            );
          }
        if (
          (OM8(),
          pq(zV7),
          pq(async () => {
            let { cleanupSessionTeams: O } = await Promise.resolve().then(() => (NP(), Ua7));
            await O();
          }),
          KU())
        ) {
          let O = Date.now();
          await Yh9(), n_("info", "init_scratchpad_created", { duration_ms: Date.now() - O });
        }
        n_("info", "init_completed", { duration_ms: Date.now() - H }), x7("init_function_end");
      } catch (_) {
        if (_ instanceof CR) {
          if (o8()) {
            process.stderr.write(`Configuration error in ${_.filePath}: ${_.message}
`),
              n9(1);
            return;
          }
          return Promise.resolve()
            .then(() => (dV9(), gV9))
            .then((q) => q.showInvalidConfigDialog({ error: _ }));
        } else throw _;
      }
    });
