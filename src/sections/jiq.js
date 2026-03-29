    OOH();
    _OH();
    wiq();
    (UN6 = u(aH(), 1)),
      (NZ = u(PH(), 1)),
      (V$ = NZ.default.memo(function (_) {
        let q = UN6.c(12),
          { children: $, dimColor: K } = _;
        if (typeof $ !== "string") {
          let f;
          if (q[0] !== $ || q[1] !== K)
            (f = K
              ? NZ.default.createElement(d3, { dim: !0 }, String($))
              : NZ.default.createElement(d3, null, String($))),
              (q[0] = $),
              (q[1] = K),
              (q[2] = f);
          else f = q[2];
          return f;
        }
        if ($ === "") return null;
        let O, T;
        if (q[3] !== $ || q[4] !== K) {
          T = Symbol.for("react.early_return_sentinel");
          H: {
            let f = Dy4($);
            if (f.length === 0) {
              T = null;
              break H;
            }
            if (f.length === 1 && !Py4(f[0].props)) {
              T = K
                ? NZ.default.createElement(d3, { dim: !0 }, f[0].text)
                : NZ.default.createElement(d3, null, f[0].text);
              break H;
            }
            let w;
            if (q[7] !== K)
              (w = (Y, D) => {
                let j = Y.props.hyperlink;
                if (K) Y.props.dim = !0;
                let M = Xy4(Y.props);
                if (j)
                  return M
                    ? NZ.default.createElement(
                        vq,
                        { key: D, url: j },
                        NZ.default.createElement(
                          Diq,
                          {
                            color: Y.props.color,
                            backgroundColor: Y.props.backgroundColor,
                            dim: Y.props.dim,
                            bold: Y.props.bold,
                            italic: Y.props.italic,
                            underline: Y.props.underline,
                            strikethrough: Y.props.strikethrough,
                            inverse: Y.props.inverse,
                          },
                          Y.text,
                        ),
                      )
                    : NZ.default.createElement(vq, { key: D, url: j }, Y.text);
                return M
                  ? NZ.default.createElement(
                      Diq,
                      {
                        key: D,
                        color: Y.props.color,
                        backgroundColor: Y.props.backgroundColor,
                        dim: Y.props.dim,
                        bold: Y.props.bold,
                        italic: Y.props.italic,
                        underline: Y.props.underline,
                        strikethrough: Y.props.strikethrough,
                        inverse: Y.props.inverse,
                      },
                      Y.text,
                    )
                  : Y.text;
              }),
                (q[7] = K),
                (q[8] = w);
            else w = q[8];
            O = f.map(w);
          }
          (q[3] = $), (q[4] = K), (q[5] = O), (q[6] = T);
        } else (O = q[5]), (T = q[6]);
        if (T !== Symbol.for("react.early_return_sentinel")) return T;
        let z = O,
          A;
        if (q[9] !== z || q[10] !== K)
          (A = K ? NZ.default.createElement(d3, { dim: !0 }, z) : NZ.default.createElement(d3, null, z)),
            (q[9] = z),
            (q[10] = K),
            (q[11] = A);
        else A = q[11];
        return A;
      }));
    My4 = {
      black: "ansi:black",
      red: "ansi:red",
      green: "ansi:green",
      yellow: "ansi:yellow",
      blue: "ansi:blue",
      magenta: "ansi:magenta",
      cyan: "ansi:cyan",
      white: "ansi:white",
      brightBlack: "ansi:blackBright",
      brightRed: "ansi:redBright",
      brightGreen: "ansi:greenBright",
      brightYellow: "ansi:yellowBright",
      brightBlue: "ansi:blueBright",
      brightMagenta: "ansi:magentaBright",
      brightCyan: "ansi:cyanBright",
      brightWhite: "ansi:whiteBright",
    };
