    u7();
    ww();
    wx();
    MO();
    Vw();
    H_();
    lX();
    Bk();
    n8();
    ti();
    Ew();
    fx();
    Ov_();
    (j47 = require("path")), (Y47 = ["user", "project", "local"]);
    ilH = $6(async () => {
      let { enabled: H, errors: _ } = await CD();
      if (_.length > 0) N(`Plugin loading errors: ${_.map((K) => dM(K)).join(", ")}`);
      let $ = (
        await Promise.all(
          H.map(async (K) => {
            let O = new Set(),
              T = [];
            if (K.agentsPath)
              try {
                let z = await D47(K.agentsPath, K.name, K.source, K.path, K.manifest, O);
                if ((T.push(...z), z.length > 0))
                  N(`Loaded ${z.length} agents from plugin ${K.name} default directory`);
              } catch (z) {
                N(`Failed to load agents from plugin ${K.name} default directory: ${z}`, { level: "error" });
              }
            if (K.agentsPaths) {
              let z = await Promise.all(
                K.agentsPaths.map(async (A) => {
                  try {
                    let w = await f_().stat(A);
                    if (w.isDirectory()) {
                      let Y = await D47(A, K.name, K.source, K.path, K.manifest, O);
                      if (Y.length > 0) N(`Loaded ${Y.length} agents from plugin ${K.name} custom path: ${A}`);
                      return Y;
                    } else if (w.isFile() && A.endsWith(".md")) {
                      let Y = await M47(A, K.name, [], K.source, K.path, K.manifest, O);
                      if (Y) return N(`Loaded agent from plugin ${K.name} custom file: ${A}`), [Y];
                    }
                    return [];
                  } catch (f) {
                    return (
                      N(`Failed to load agents from plugin ${K.name} custom path ${A}: ${f}`, { level: "error" }), []
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
      return N(`Total plugin agents loaded: ${$.length}`), $;
    });
