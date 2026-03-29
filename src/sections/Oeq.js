    NL_();
    (SE = u(vL_(), 1)),
      (Keq = {
        prefix: { idle: SE.default.blue("?"), done: SE.default.green(nGH.tick) },
        spinner: {
          interval: 80,
          frames: [
            "\u280B",
            "\u2819",
            "\u2839",
            "\u2838",
            "\u283C",
            "\u2834",
            "\u2826",
            "\u2827",
            "\u2807",
            "\u280F",
          ].map((H) => SE.default.yellow(H)),
        },
        style: {
          answer: SE.default.cyan,
          message: SE.default.bold,
          error: (H) => SE.default.red(`> ${H}`),
          defaultAnswer: (H) => SE.default.dim(`(${H})`),
          help: SE.default.dim,
          highlight: SE.default.cyan,
          key: (H) => SE.default.cyan(SE.default.bold(`<${H}>`)),
        },
      });
