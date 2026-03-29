    x8();
    (W96 = pH(() => h.enum(["local", "user", "project", "dynamic", "enterprise", "claudeai", "managed"]))),
      (KrK = pH(() => h.enum(["stdio", "sse", "sse-ide", "http", "ws", "sdk"]))),
      (G96 = pH(() =>
        h.object({
          type: h.literal("stdio").optional(),
          command: h.string().min(1, "Command cannot be empty"),
          args: h.array(h.string()).default([]),
          env: h.record(h.string(), h.string()).optional(),
        }),
      )),
      (uz$ = pH(() => h.boolean())),
      (NX8 = pH(() =>
        h.object({
          clientId: h.string().optional(),
          callbackPort: h.number().int().positive().optional(),
          authServerMetadataUrl: h
            .string()
            .url()
            .startsWith("https://", { message: "authServerMetadataUrl must use https://" })
            .optional(),
          xaa: uz$().optional(),
        }),
      )),
      (xz$ = pH(() =>
        h.object({
          type: h.literal("sse"),
          url: h.string(),
          headers: h.record(h.string(), h.string()).optional(),
          headersHelper: h.string().optional(),
          oauth: NX8().optional(),
        }),
      )),
      (mz$ = pH(() =>
        h.object({
          type: h.literal("sse-ide"),
          url: h.string(),
          ideName: h.string(),
          ideRunningInWindows: h.boolean().optional(),
        }),
      )),
      (pz$ = pH(() =>
        h.object({
          type: h.literal("ws-ide"),
          url: h.string(),
          ideName: h.string(),
          authToken: h.string().optional(),
          ideRunningInWindows: h.boolean().optional(),
        }),
      )),
      (Bz$ = pH(() =>
        h.object({
          type: h.literal("http"),
          url: h.string(),
          headers: h.record(h.string(), h.string()).optional(),
          headersHelper: h.string().optional(),
          oauth: NX8().optional(),
        }),
      )),
      (gz$ = pH(() =>
        h.object({
          type: h.literal("ws"),
          url: h.string(),
          headers: h.record(h.string(), h.string()).optional(),
          headersHelper: h.string().optional(),
        }),
      )),
      (dz$ = pH(() => h.object({ type: h.literal("sdk"), name: h.string() }))),
      (cz$ = pH(() => h.object({ type: h.literal("claudeai-proxy"), url: h.string(), id: h.string() }))),
      (tp = pH(() => h.union([G96(), xz$(), mz$(), pz$(), Bz$(), gz$(), dz$(), cz$()]))),
      (hX8 = pH(() => h.object({ mcpServers: h.record(h.string(), tp()) })));
