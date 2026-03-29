    x8();
    m8H();
    (yV_ = pH(() =>
      h.strictObject({
        file_path: h.string().describe("The absolute path to the file to modify"),
        old_string: h.string().describe("The text to replace"),
        new_string: h.string().describe("The text to replace it with (must be different from old_string)"),
        replace_all: xj(h.boolean().default(!1).optional()).describe(
          "Replace all occurrences of old_string (default false)",
        ),
      }),
    )),
      (kp6 = pH(() =>
        h.object({
          oldStart: h.number(),
          oldLines: h.number(),
          newStart: h.number(),
          newLines: h.number(),
          lines: h.array(h.string()),
        }),
      )),
      (vp6 = pH(() =>
        h.object({
          filename: h.string(),
          status: h.enum(["modified", "added"]),
          additions: h.number(),
          deletions: h.number(),
          changes: h.number(),
          patch: h.string(),
          repository: h.string().nullable().optional().describe("GitHub owner/repo when available"),
        }),
      )),
      (WR7 = pH(() =>
        h.object({
          filePath: h.string().describe("The file path that was edited"),
          oldString: h.string().describe("The original string that was replaced"),
          newString: h.string().describe("The new string that replaced it"),
          originalFile: h.string().describe("The original file contents before editing"),
          structuredPatch: h.array(kp6()).describe("Diff patch showing the changes"),
          userModified: h.boolean().describe("Whether the user modified the proposed changes"),
          replaceAll: h.boolean().describe("Whether all occurrences were replaced"),
          gitDiff: vp6().optional(),
        }),
      ));
