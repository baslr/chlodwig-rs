    N_();
    x8();
    lf();
    (gq_ = u(PH(), 1)),
      (XRK = pH(() =>
        h.object({
          method: h.literal("selection_changed"),
          params: h.object({
            selection: h
              .object({
                start: h.object({ line: h.number(), character: h.number() }),
                end: h.object({ line: h.number(), character: h.number() }),
              })
              .nullable()
              .optional(),
            text: h.string().optional(),
            filePath: h.string().optional(),
          }),
        }),
      ));
