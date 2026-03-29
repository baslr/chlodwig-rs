    x8();
    A3();
    Rr6();
    H_();
    g_();
    h_();
    N_();
    F_();
    cw();
    l5();
    (lC = require("fs/promises")),
      (np_ = require("path")),
      (rp_ = { retries: { retries: 10, minTimeout: 5, maxTimeout: 100 } });
    (do7 = pH(() =>
      h.object({
        type: h.literal("plan_approval_request"),
        from: h.string(),
        timestamp: h.string(),
        planFilePath: h.string(),
        planContent: h.string(),
        requestId: h.string(),
      }),
    )),
      (co7 = pH(() =>
        h.object({
          type: h.literal("plan_approval_response"),
          requestId: h.string(),
          approved: h.boolean(),
          feedback: h.string().optional(),
          timestamp: h.string(),
          permissionMode: I7H().optional(),
        }),
      )),
      (Fo7 = pH(() =>
        h.object({
          type: h.literal("shutdown_request"),
          requestId: h.string(),
          from: h.string(),
          reason: h.string().optional(),
          timestamp: h.string(),
        }),
      )),
      (Uo7 = pH(() =>
        h.object({
          type: h.literal("shutdown_approved"),
          requestId: h.string(),
          from: h.string(),
          timestamp: h.string(),
          paneId: h.string().optional(),
          backendType: h.string().optional(),
        }),
      )),
      (Qo7 = pH(() =>
        h.object({
          type: h.literal("shutdown_rejected"),
          requestId: h.string(),
          from: h.string(),
          reason: h.string(),
          timestamp: h.string(),
        }),
      ));
    lo7 = pH(() => h.object({ type: h.literal("mode_set_request"), mode: I7H(), from: h.string() }));
