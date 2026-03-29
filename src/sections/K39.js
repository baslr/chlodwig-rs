    u7();
    H_();
    Bk();
    N_();
    ti();
    OF_();
    (q39 = require("path")),
      ($39 = $6(async (H) => {
        try {
          return (await si("output-styles", H))
            .map(({ filePath: $, frontmatter: K, content: O, source: T }) => {
              try {
                let A = q39.basename($).replace(/\.md$/, ""),
                  f = K.name || A,
                  w = ou(K.description, A) ?? f6H(O, `Custom ${A} output style`),
                  Y = K["keep-coding-instructions"],
                  D = Y === !0 || Y === "true" ? !0 : Y === !1 || Y === "false" ? !1 : void 0;
                if (K["force-for-plugin"] !== void 0)
                  N(
                    `Output style "${f}" has force-for-plugin set, but this option only applies to plugin output styles. Ignoring.`,
                    { level: "warn" },
                  );
                return { name: f, description: w, prompt: O.trim(), source: T, keepCodingInstructions: D };
              } catch (z) {
                return AH(z), null;
              }
            })
            .filter(($) => $ !== null);
        } catch (_) {
          return AH(_), [];
        }
      }));
