    x8();
    H_();
    h_();
    N_();
    F_();
    l5();
    lD();
    NP();
    XrO = pH(() =>
      h.object({
        id: h.string(),
        workerId: h.string(),
        workerName: h.string(),
        workerColor: h.string().optional(),
        teamName: h.string(),
        toolName: h.string(),
        toolUseId: h.string(),
        description: h.string(),
        input: h.record(h.string(), h.unknown()),
        permissionSuggestions: h.array(h.unknown()),
        status: h.enum(["pending", "approved", "rejected"]),
        resolvedBy: h.enum(["worker", "leader"]).optional(),
        resolvedAt: h.number().optional(),
        feedback: h.string().optional(),
        updatedInput: h.record(h.string(), h.unknown()).optional(),
        permissionUpdates: h.array(h.unknown()).optional(),
        createdAt: h.number(),
      }),
    );
