  var meq = d((PU3, xeq) => {
    var Ceq =
        (H, _) =>
        (...q) => {
          return `\x1B[${H(...q) + _}m`;
        },
      beq =
        (H, _) =>
        (...q) => {
          let $ = H(...q);
          return `\x1B[${38 + _};5;${$}m`;
        },
      Ieq =
        (H, _) =>
        (...q) => {
          let $ = H(...q);
          return `\x1B[${38 + _};2;${$[0]};${$[1]};${$[2]}m`;
        },
      VL_ = (H) => H,
      ueq = (H, _, q) => [H, _, q],
      oGH = (H, _, q) => {
        Object.defineProperty(H, _, {
          get: () => {
            let $ = q();
            return Object.defineProperty(H, _, { value: $, enumerable: !0, configurable: !0 }), $;
          },
          enumerable: !0,
          configurable: !0,
        });
      },
      XS6,
      aGH = (H, _, q, $) => {
        if (XS6 === void 0) XS6 = PS6();
        let K = $ ? 10 : 0,
          O = {};
        for (let [T, z] of Object.entries(XS6)) {
          let A = T === "ansi16" ? "ansi" : T;
          if (T === _) O[A] = H(q, K);
          else if (typeof z === "object") O[A] = H(z[_], K);
        }
        return O;
      };
    function vx4() {
      let H = new Map(),
        _ = {
          modifier: {
            reset: [0, 0],
            bold: [1, 22],
            dim: [2, 22],
            italic: [3, 23],
            underline: [4, 24],
            inverse: [7, 27],
            hidden: [8, 28],
            strikethrough: [9, 29],
          },
          color: {
            black: [30, 39],
            red: [31, 39],
            green: [32, 39],
            yellow: [33, 39],
            blue: [34, 39],
            magenta: [35, 39],
            cyan: [36, 39],
            white: [37, 39],
            blackBright: [90, 39],
            redBright: [91, 39],
            greenBright: [92, 39],
            yellowBright: [93, 39],
            blueBright: [94, 39],
            magentaBright: [95, 39],
            cyanBright: [96, 39],
            whiteBright: [97, 39],
          },
          bgColor: {
            bgBlack: [40, 49],
            bgRed: [41, 49],
            bgGreen: [42, 49],
            bgYellow: [43, 49],
            bgBlue: [44, 49],
            bgMagenta: [45, 49],
            bgCyan: [46, 49],
            bgWhite: [47, 49],
            bgBlackBright: [100, 49],
            bgRedBright: [101, 49],
            bgGreenBright: [102, 49],
            bgYellowBright: [103, 49],
            bgBlueBright: [104, 49],
            bgMagentaBright: [105, 49],
            bgCyanBright: [106, 49],
            bgWhiteBright: [107, 49],
          },
        };
      (_.color.gray = _.color.blackBright),
        (_.bgColor.bgGray = _.bgColor.bgBlackBright),
        (_.color.grey = _.color.blackBright),
        (_.bgColor.bgGrey = _.bgColor.bgBlackBright);
      for (let [q, $] of Object.entries(_)) {
        for (let [K, O] of Object.entries($))
          (_[K] = { open: `\x1B[${O[0]}m`, close: `\x1B[${O[1]}m` }), ($[K] = _[K]), H.set(O[0], O[1]);
        Object.defineProperty(_, q, { value: $, enumerable: !1 });
      }
      return (
        Object.defineProperty(_, "codes", { value: H, enumerable: !1 }),
        (_.color.close = "\x1B[39m"),
        (_.bgColor.close = "\x1B[49m"),
        oGH(_.color, "ansi", () => aGH(Ceq, "ansi16", VL_, !1)),
        oGH(_.color, "ansi256", () => aGH(beq, "ansi256", VL_, !1)),
        oGH(_.color, "ansi16m", () => aGH(Ieq, "rgb", ueq, !1)),
        oGH(_.bgColor, "ansi", () => aGH(Ceq, "ansi16", VL_, !0)),
        oGH(_.bgColor, "ansi256", () => aGH(beq, "ansi256", VL_, !0)),
        oGH(_.bgColor, "ansi16m", () => aGH(Ieq, "rgb", ueq, !0)),
        _
      );
    }
    Object.defineProperty(xeq, "exports", { enumerable: !0, get: vx4 });
  });
