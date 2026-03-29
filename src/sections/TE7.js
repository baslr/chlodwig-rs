    x8();
    (zJ1 = pH(() =>
      h.object({
        entries: h.record(h.string(), h.string()),
        entryChecksums: h.record(h.string(), h.string()).optional(),
      }),
    )),
      (KE7 = pH(() =>
        h.object({
          organizationId: h.string(),
          repo: h.string(),
          version: h.number(),
          lastModified: h.string(),
          checksum: h.string(),
          content: zJ1(),
        }),
      )),
      (OE7 = pH(() =>
        h.object({
          error: h.object({
            details: h.object({
              error_code: h.literal("team_memory_too_many_entries"),
              max_entries: h.number().int().positive(),
              received_entries: h.number().int().positive(),
            }),
          }),
        }),
      ));
