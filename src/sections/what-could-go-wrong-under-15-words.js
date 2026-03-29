    x8();
    L_();
    GY();
    y6();
    H_();
    h_();
    N_();
    H7();
    mqH();
    F_();
    (fJK = { LOW: 1, MEDIUM: 2, HIGH: 3 }),
      (MJK = {
        name: "explain_command",
        description: "Provide an explanation of a shell command",
        input_schema: {
          type: "object",
          properties: {
            explanation: { type: "string", description: "What this command does (1-2 sentences)" },
            reasoning: {
              type: "string",
              description:
                'Why YOU are running this command. Start with "I" - e.g. "I need to check the file contents"',
            },
            risk: { type: "string", description: "What could go wrong, under 15 words" },
            riskLevel: {
              type: "string",
              enum: ["LOW", "MEDIUM", "HIGH"],
              description: "LOW (safe dev workflows), MEDIUM (recoverable changes), HIGH (dangerous/irreversible)",
            },
          },
          required: ["explanation", "reasoning", "risk", "riskLevel"],
        },
      }),
      (JJK = pH(() =>
        h.object({
          riskLevel: h.enum(["LOW", "MEDIUM", "HIGH"]),
          explanation: h.string(),
          reasoning: h.string(),
          risk: h.string(),
        }),
      ));
