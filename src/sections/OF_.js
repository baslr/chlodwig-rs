    u7();
    H_();
    Bk();
    n8();
    ti();
    Ew();
    Ov_();
    H39 = require("path");
    H_8 = $6(async () => {
      let { enabled: H, errors: _ } = await CD(),
        q = [];
      if (_.length > 0) N(`Plugin loading errors: ${_.map(($) => dM($)).join(", ")}`);
      for (let $ of H) {
        let K = new Set();
        if ($.outputStylesPath)
          try {
            let O = await e59($.outputStylesPath, $.name, K);
            if ((q.push(...O), O.length > 0))
              N(`Loaded ${O.length} output styles from plugin ${$.name} default directory`);
          } catch (O) {
            N(`Failed to load output styles from plugin ${$.name} default directory: ${O}`, { level: "error" });
          }
        if ($.outputStylesPaths)
          for (let O of $.outputStylesPaths)
            try {
              let z = await f_().stat(O);
              if (z.isDirectory()) {
                let A = await e59(O, $.name, K);
                if ((q.push(...A), A.length > 0))
                  N(`Loaded ${A.length} output styles from plugin ${$.name} custom path: ${O}`);
              } else if (z.isFile() && O.endsWith(".md")) {
                let A = await _39(O, $.name, K);
                if (A) q.push(A), N(`Loaded output style from plugin ${$.name} custom file: ${O}`);
              }
            } catch (T) {
              N(`Failed to load output styles from plugin ${$.name} custom path ${O}: ${T}`, { level: "error" });
            }
      }
      return N(`Total plugin output styles loaded: ${q.length}`), q;
    });
