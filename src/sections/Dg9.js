    x8();
    DW();
    WC();
    (wg9 = u(aH(), 1)),
      (oq_ = u(PH(), 1)),
      (MwA = pH(() =>
        h.object({
          method: h.literal("notifications/message"),
          params: h.object({
            prompt: h.string(),
            image: h
              .object({
                type: h.literal("base64"),
                media_type: h.enum(["image/jpeg", "image/png", "image/gif", "image/webp"]),
                data: h.string(),
              })
              .optional(),
            tabId: h.number().optional(),
          }),
        }),
      ));
