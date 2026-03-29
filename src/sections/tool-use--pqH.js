    x8();
    k_();
    HaH();
    MF6();
    L_();
    hn();
    nM();
    KW();
    uO();
    H_();
    g_();
    h_();
    q8();
    fX();
    $aH();
    wP();
    _m6();
    a0();
    tX();
    CO();
    Rb7 = pH(() =>
      h.object({
        agentId: h.string(),
        agentType: h.string().optional(),
        content: h.array(h.object({ type: h.literal("text"), text: h.string() })),
        totalToolUseCount: h.number(),
        totalDurationMs: h.number(),
        totalTokens: h.number(),
        usage: h.object({
          input_tokens: h.number(),
          output_tokens: h.number(),
          cache_creation_input_tokens: h.number().nullable(),
          cache_read_input_tokens: h.number().nullable(),
          server_tool_use: h.object({ web_search_requests: h.number(), web_fetch_requests: h.number() }).nullable(),
          service_tier: h.enum(["standard", "priority", "batch"]).nullable(),
          cache_creation: h
            .object({ ephemeral_1h_input_tokens: h.number(), ephemeral_5m_input_tokens: h.number() })
            .nullable(),
        }),
      }),
    );
