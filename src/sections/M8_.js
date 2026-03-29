    x8();
    t6();
    pF();
    (k$8 = {
      init_retry_max_attempts: 3,
      init_retry_base_delay_ms: 500,
      init_retry_jitter_fraction: 0.25,
      init_retry_max_delay_ms: 4000,
      http_timeout_ms: 1e4,
      uuid_dedup_buffer_size: 2000,
      heartbeat_interval_ms: 20000,
      heartbeat_jitter_fraction: 0.1,
      token_refresh_buffer_ms: 300000,
      teardown_archive_timeout_ms: 1500,
      connect_timeout_ms: 15000,
      min_version: "0.0.0",
      should_show_app_upgrade_message: !1,
    }),
      (RAK = pH(() =>
        h.object({
          init_retry_max_attempts: h.number().int().min(1).max(10).default(3),
          init_retry_base_delay_ms: h.number().int().min(100).default(500),
          init_retry_jitter_fraction: h.number().min(0).max(1).default(0.25),
          init_retry_max_delay_ms: h.number().int().min(500).default(4000),
          http_timeout_ms: h.number().int().min(2000).default(1e4),
          uuid_dedup_buffer_size: h.number().int().min(100).max(50000).default(2000),
          heartbeat_interval_ms: h.number().int().min(5000).max(30000).default(20000),
          heartbeat_jitter_fraction: h.number().min(0).max(0.5).default(0.1),
          token_refresh_buffer_ms: h.number().int().min(30000).max(1800000).default(300000),
          teardown_archive_timeout_ms: h.number().int().min(500).max(2000).default(1500),
          connect_timeout_ms: h.number().int().min(5000).max(60000).default(15000),
          min_version: h
            .string()
            .refine((H) => {
              try {
                return gi(H, "0.0.0"), !0;
              } catch {
                return !1;
              }
            })
            .default("0.0.0"),
          should_show_app_upgrade_message: h.boolean().default(!1),
        }),
      ));
