    x8();
    L_();
    y6();
    h_();
    N_();
    Q6();
    F_();
    W$9();
    nt6();
    G$9();
    (NjT = pH(() =>
      h.strictObject({
        setting: h.string().describe('The setting key (e.g., "theme", "model", "permissions.defaultMode")'),
        value: h
          .union([h.string(), h.boolean(), h.number()])
          .optional()
          .describe("The new value. Omit to get current value."),
      }),
    )),
      (hjT = pH(() =>
        h.object({
          success: h.boolean(),
          operation: h.enum(["get", "set"]).optional(),
          setting: h.string().optional(),
          value: h.unknown().optional(),
          previousValue: h.unknown().optional(),
          newValue: h.unknown().optional(),
          error: h.string().optional(),
        }),
      ));
