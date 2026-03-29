    x8();
    t6();
    g48();
    (By9 = { message: "must be 0 (disabled) or \u2265100ms" }),
      (cDK = pH(() =>
        h
          .object({
            poll_interval_ms_not_at_capacity: h.number().int().min(100),
            poll_interval_ms_at_capacity: h
              .number()
              .int()
              .refine((H) => H === 0 || H >= 100, By9),
            non_exclusive_heartbeat_interval_ms: h.number().int().min(0).default(0),
            multisession_poll_interval_ms_not_at_capacity: h
              .number()
              .int()
              .min(100)
              .default(ua.multisession_poll_interval_ms_not_at_capacity),
            multisession_poll_interval_ms_partial_capacity: h
              .number()
              .int()
              .min(100)
              .default(ua.multisession_poll_interval_ms_partial_capacity),
            multisession_poll_interval_ms_at_capacity: h
              .number()
              .int()
              .refine((H) => H === 0 || H >= 100, By9)
              .default(ua.multisession_poll_interval_ms_at_capacity),
            reclaim_older_than_ms: h.number().int().min(1).default(5000),
            session_keepalive_interval_v2_ms: h.number().int().min(0).default(120000),
          })
          .refine((H) => H.non_exclusive_heartbeat_interval_ms > 0 || H.poll_interval_ms_at_capacity > 0, {
            message:
              "at-capacity liveness requires non_exclusive_heartbeat_interval_ms > 0 or poll_interval_ms_at_capacity > 0",
          })
          .refine((H) => H.non_exclusive_heartbeat_interval_ms > 0 || H.multisession_poll_interval_ms_at_capacity > 0, {
            message:
              "at-capacity liveness requires non_exclusive_heartbeat_interval_ms > 0 or multisession_poll_interval_ms_at_capacity > 0",
          }),
      ));
