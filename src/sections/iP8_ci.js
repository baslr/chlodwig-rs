    (Mh = Array(20)
      .fill(0)
      .map((H, _) => {
        return " ".repeat(_);
      })),
      (f96 = {
        " ": {
          "\n": Array(200)
            .fill(0)
            .map((H, _) => {
              return (
                `
` + " ".repeat(_)
              );
            }),
          "\r": Array(200)
            .fill(0)
            .map((H, _) => {
              return "\r" + " ".repeat(_);
            }),
          "\r\n": Array(200)
            .fill(0)
            .map((H, _) => {
              return (
                `\r
` + " ".repeat(_)
              );
            }),
        },
        "\t": {
          "\n": Array(200)
            .fill(0)
            .map((H, _) => {
              return (
                `
` + "\t".repeat(_)
              );
            }),
          "\r": Array(200)
            .fill(0)
            .map((H, _) => {
              return "\r" + "\t".repeat(_);
            }),
          "\r\n": Array(200)
            .fill(0)
            .map((H, _) => {
              return (
                `\r
` + "\t".repeat(_)
              );
            }),
        },
      }),
      (lP8 = [
        `
`,
        "\r",
        `\r
`,
      ]);
