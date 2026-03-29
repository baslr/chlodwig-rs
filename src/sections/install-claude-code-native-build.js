    L_();
    q88();
    iH();
    H_();
    jK();
    h_();
    ac();
    Q6();
    (bn9 = u(aH(), 1)), (In9 = require("os")), (un9 = require("path")), (I1 = u(PH(), 1));
    zyK = {
      type: "local-jsx",
      name: "install",
      description: "Install Claude Code native build",
      argumentHint: "[options]",
      async call(H, _, q) {
        let $ = q.includes("--force"),
          O = q.filter((z) => !z.startsWith("--"))[0],
          { unmount: T } = await Fu(
            I1.default.createElement(TyK, {
              onDone: (z, A) => {
                T(), H(z, A);
              },
              force: $,
              target: O,
            }),
          );
      },
    };
