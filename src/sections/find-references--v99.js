    x8();
    k99 = pH(() => {
      let H = h.strictObject({
          operation: h.literal("goToDefinition"),
          filePath: h.string().describe("The absolute or relative path to the file"),
          line: h.number().int().positive().describe("The line number (1-based, as shown in editors)"),
          character: h.number().int().positive().describe("The character offset (1-based, as shown in editors)"),
        }),
        _ = h.strictObject({
          operation: h.literal("findReferences"),
          filePath: h.string().describe("The absolute or relative path to the file"),
          line: h.number().int().positive().describe("The line number (1-based, as shown in editors)"),
          character: h.number().int().positive().describe("The character offset (1-based, as shown in editors)"),
        }),
        q = h.strictObject({
          operation: h.literal("hover"),
          filePath: h.string().describe("The absolute or relative path to the file"),
          line: h.number().int().positive().describe("The line number (1-based, as shown in editors)"),
          character: h.number().int().positive().describe("The character offset (1-based, as shown in editors)"),
        }),
        $ = h.strictObject({
          operation: h.literal("documentSymbol"),
          filePath: h.string().describe("The absolute or relative path to the file"),
          line: h.number().int().positive().describe("The line number (1-based, as shown in editors)"),
          character: h.number().int().positive().describe("The character offset (1-based, as shown in editors)"),
        }),
        K = h.strictObject({
          operation: h.literal("workspaceSymbol"),
          filePath: h.string().describe("The absolute or relative path to the file"),
          line: h.number().int().positive().describe("The line number (1-based, as shown in editors)"),
          character: h.number().int().positive().describe("The character offset (1-based, as shown in editors)"),
        }),
        O = h.strictObject({
          operation: h.literal("goToImplementation"),
          filePath: h.string().describe("The absolute or relative path to the file"),
          line: h.number().int().positive().describe("The line number (1-based, as shown in editors)"),
          character: h.number().int().positive().describe("The character offset (1-based, as shown in editors)"),
        }),
        T = h.strictObject({
          operation: h.literal("prepareCallHierarchy"),
          filePath: h.string().describe("The absolute or relative path to the file"),
          line: h.number().int().positive().describe("The line number (1-based, as shown in editors)"),
          character: h.number().int().positive().describe("The character offset (1-based, as shown in editors)"),
        }),
        z = h.strictObject({
          operation: h.literal("incomingCalls"),
          filePath: h.string().describe("The absolute or relative path to the file"),
          line: h.number().int().positive().describe("The line number (1-based, as shown in editors)"),
          character: h.number().int().positive().describe("The character offset (1-based, as shown in editors)"),
        }),
        A = h.strictObject({
          operation: h.literal("outgoingCalls"),
          filePath: h.string().describe("The absolute or relative path to the file"),
          line: h.number().int().positive().describe("The line number (1-based, as shown in editors)"),
          character: h.number().int().positive().describe("The character offset (1-based, as shown in editors)"),
        });
      return h.discriminatedUnion("operation", [H, _, q, $, K, O, T, z, A]);
    });
