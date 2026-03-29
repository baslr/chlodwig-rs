    Tt();
    u7();
    x8();
    s$();
    aXH();
    W8();
    H_();
    g_();
    Hz();
    F_();
    lK();
    (EZq = require("fs")),
      (xJ_ = require("fs/promises")),
      (LW6 = require("path")),
      (CZq = pH(() =>
        h
          .object({ id: h.string(), max_input_tokens: h.number().optional(), max_tokens: h.number().optional() })
          .strip(),
      )),
      (vT4 = pH(() => h.object({ models: h.array(CZq()), timestamp: h.number() })));
    ZW6 = $6(
      (H) => {
        try {
          let _ = EZq.readFileSync(H, "utf-8"),
            q = vT4().safeParse(y$(_, !1));
          return q.success ? q.data.models : null;
        } catch {
          return null;
        }
      },
      (H) => H,
    );
