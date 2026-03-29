    x8();
    k_();
    H_();
    g_();
    h_();
    N_();
    F_();
    l5();
    a0();
    (RW = require("fs/promises")), (AvH = require("path")), (yE7 = RX());
    EE7 = yE7.subscribe;
    (qAH = pH(() => h.enum(["pending", "in_progress", "completed"]))),
      (CJ1 = pH(() =>
        h.object({
          id: h.string(),
          subject: h.string(),
          description: h.string(),
          activeForm: h.string().optional(),
          owner: h.string().optional(),
          status: qAH(),
          blocks: h.array(h.string()),
          blockedBy: h.array(h.string()),
          metadata: h.record(h.string(), h.unknown()).optional(),
        }),
      )),
      (SC_ = { retries: { retries: 30, minTimeout: 5, maxTimeout: 100 } });
