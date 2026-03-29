    x8();
    H_();
    uY();
    KB_();
    (kYA = pH(() =>
      a7.object({
        tool_name: a7.string().describe("The name of the tool requesting permission"),
        input: a7.record(a7.string(), a7.unknown()).describe("The input for the tool"),
        tool_use_id: a7.string().optional().describe("The unique tool use request ID"),
      }),
    )),
      (Ng9 = pH(() =>
        a7
          .enum(["user_temporary", "user_permanent", "user_reject"])
          .optional()
          .catch(void 0),
      )),
      (gZK = pH(() =>
        a7.object({
          behavior: a7.literal("allow"),
          updatedInput: a7.record(a7.string(), a7.unknown()),
          updatedPermissions: a7
            .array(LhH())
            .optional()
            .catch((H) => {
              N(`Malformed updatedPermissions from SDK host ignored: ${H.error.issues[0]?.message ?? "unknown"}`, {
                level: "warn",
              });
              return;
            }),
          toolUseID: a7.string().optional(),
          decisionClassification: Ng9(),
        }),
      )),
      (dZK = pH(() =>
        a7.object({
          behavior: a7.literal("deny"),
          message: a7.string(),
          interrupt: a7.boolean().optional(),
          toolUseID: a7.string().optional(),
          decisionClassification: Ng9(),
        }),
      )),
      (aq_ = pH(() => a7.union([gZK(), dZK()])));
