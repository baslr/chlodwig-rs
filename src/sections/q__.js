    u7();
    k_();
    EoH();
    H_();
    lX();
    g_();
    h_();
    Bk();
    n8();
    ti();
    H7();
    nkH();
    Ew();
    fx();
    Ov_();
    sD = require("path");
    RwH = $6(async () => {
      if (K1() && bp().length === 0) return [];
      let { enabled: H, errors: _ } = await CD();
      if (_.length > 0) N(`Plugin loading errors: ${_.map((K) => dM(K)).join(", ")}`);
      let $ = (
        await Promise.all(
          H.map(async (K) => {
            let O = new Set(),
              T = [];
            if (K.commandsPath)
              try {
                let z = await f59(K.commandsPath, K.name, K.source, K.manifest, K.path, { isSkillMode: !1 }, O);
                if ((T.push(...z), z.length > 0))
                  N(`Loaded ${z.length} commands from plugin ${K.name} default directory`);
              } catch (z) {
                N(`Failed to load commands from plugin ${K.name} default directory: ${z}`, { level: "error" });
              }
            if (K.commandsPaths) {
              N(`Plugin ${K.name} has commandsPaths: ${K.commandsPaths.join(", ")}`);
              let z = await Promise.all(
                K.commandsPaths.map(async (A) => {
                  try {
                    let f = f_(),
                      w = await f.stat(A);
                    if (
                      (N(`Checking commandPath ${A} - isDirectory: ${w.isDirectory()}, isFile: ${w.isFile()}`),
                      w.isDirectory())
                    ) {
                      let Y = await f59(A, K.name, K.source, K.manifest, K.path, { isSkillMode: !1 }, O);
                      if (Y.length > 0) N(`Loaded ${Y.length} commands from plugin ${K.name} custom path: ${A}`);
                      else
                        N(
                          `Warning: No commands found in plugin ${K.name} custom directory: ${A}. Expected .md files or SKILL.md in subdirectories.`,
                          { level: "warn" },
                        );
                      return Y;
                    } else if (w.isFile() && A.endsWith(".md")) {
                      if ($Q(f, A, O)) return [];
                      let Y = await f.readFile(A, { encoding: "utf-8" }),
                        { frontmatter: D, content: j } = yY(Y, A),
                        M,
                        J;
                      if (K.commandsMetadata) {
                        for (let [W, Z] of Object.entries(K.commandsMetadata))
                          if (Z.source) {
                            let k = sD.join(K.path, Z.source);
                            if (A === k) {
                              (M = `${K.name}:${W}`), (J = Z);
                              break;
                            }
                          }
                      }
                      if (!M) M = `${K.name}:${sD.basename(A).replace(/\.md$/, "")}`;
                      let P = J
                          ? {
                              ...D,
                              ...(J.description && { description: J.description }),
                              ...(J.argumentHint && { "argument-hint": J.argumentHint }),
                              ...(J.model && { model: J.model }),
                              ...(J.allowedTools && { "allowed-tools": J.allowedTools.join(",") }),
                            }
                          : D,
                        X = { filePath: A, baseDir: sD.dirname(A), frontmatter: P, content: j },
                        R = ___(M, X, K.source, K.manifest, K.path, !1);
                      if (R)
                        return (
                          N(
                            `Loaded command from plugin ${K.name} custom file: ${A}${J ? " (with metadata override)" : ""}`,
                          ),
                          [R]
                        );
                    }
                    return [];
                  } catch (f) {
                    return (
                      N(`Failed to load commands from plugin ${K.name} custom path ${A}: ${f}`, { level: "error" }), []
                    );
                  }
                }),
              );
              for (let A of z) T.push(...A);
            }
            if (K.commandsMetadata) {
              for (let [z, A] of Object.entries(K.commandsMetadata))
                if (A.content && !A.source)
                  try {
                    let { frontmatter: f, content: w } = yY(A.content, `<inline:${K.name}:${z}>`),
                      Y = {
                        ...f,
                        ...(A.description && { description: A.description }),
                        ...(A.argumentHint && { "argument-hint": A.argumentHint }),
                        ...(A.model && { model: A.model }),
                        ...(A.allowedTools && { "allowed-tools": A.allowedTools.join(",") }),
                      },
                      D = `${K.name}:${z}`,
                      j = { filePath: `<inline:${D}>`, baseDir: K.path, frontmatter: Y, content: w },
                      M = ___(D, j, K.source, K.manifest, K.path, !1);
                    if (M) T.push(M), N(`Loaded inline content command from plugin ${K.name}: ${D}`);
                  } catch (f) {
                    N(`Failed to load inline content command ${z} from plugin ${K.name}: ${f}`, { level: "error" });
                  }
            }
            return T;
          }),
        )
      ).flat();
      return N(`Total plugin commands loaded: ${$.length}`), $;
    });
    EH8 = $6(async () => {
      if (K1() && bp().length === 0) return [];
      let { enabled: H, errors: _ } = await CD();
      if (_.length > 0) N(`Plugin loading errors: ${_.map((K) => dM(K)).join(", ")}`);
      N(`getPluginSkills: Processing ${H.length} enabled plugins`);
      let $ = (
        await Promise.all(
          H.map(async (K) => {
            let O = new Set(),
              T = [];
            if (
              (N(
                `Checking plugin ${K.name}: skillsPath=${K.skillsPath ? "exists" : "none"}, skillsPaths=${K.skillsPaths ? K.skillsPaths.length : 0} paths`,
              ),
              K.skillsPath)
            ) {
              N(`Attempting to load skills from plugin ${K.name} default skillsPath: ${K.skillsPath}`);
              try {
                let z = await w59(K.skillsPath, K.name, K.source, K.manifest, K.path, O);
                T.push(...z), N(`Loaded ${z.length} skills from plugin ${K.name} default directory`);
              } catch (z) {
                N(`Failed to load skills from plugin ${K.name} default directory: ${z}`, { level: "error" });
              }
            }
            if (K.skillsPaths) {
              N(`Attempting to load skills from plugin ${K.name} skillsPaths: ${K.skillsPaths.join(", ")}`);
              let z = await Promise.all(
                K.skillsPaths.map(async (A) => {
                  try {
                    N(`Loading from skillPath: ${A} for plugin ${K.name}`);
                    let f = await w59(A, K.name, K.source, K.manifest, K.path, O);
                    return N(`Loaded ${f.length} skills from plugin ${K.name} custom path: ${A}`), f;
                  } catch (f) {
                    return (
                      N(`Failed to load skills from plugin ${K.name} custom path ${A}: ${f}`, { level: "error" }), []
                    );
                  }
                }),
              );
              for (let A of z) T.push(...A);
            }
            return T;
          }),
        )
      ).flat();
      return N(`Total plugin skills loaded: ${$.length}`), $;
    });
