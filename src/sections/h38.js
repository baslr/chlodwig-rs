    x8();
    t6();
    bqH();
    KkK = pH(() =>
      h
        .object({
          recurringFrac: h.number().min(0).max(1),
          recurringCapMs: h.number().int().min(0).max(v38),
          oneShotMaxMs: h.number().int().min(0).max(v38),
          oneShotFloorMs: h.number().int().min(0).max(v38),
          oneShotMinuteMod: h.number().int().min(1).max(60),
          recurringMaxAgeMs: h.number().int().min(0).max($kK).default(Dc.recurringMaxAgeMs),
        })
        .refine((H) => H.oneShotFloorMs <= H.oneShotMaxMs),
    );
