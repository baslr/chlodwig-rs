    yL8();
    CL8();
    ({ stdout: uL8, stderr: xL8 } = EL8),
      (F46 = Symbol("GENERATOR")),
      (VMH = Symbol("STYLER")),
      (XxH = Symbol("IS_EMPTY")),
      (mL8 = ["ansi", "ansi", "ansi256", "ansi16m"]),
      (SMH = Object.create(null));
    Object.setPrototypeOf(WxH.prototype, Function.prototype);
    for (let [H, _] of Object.entries(RI))
      SMH[H] = {
        get() {
          let q = $3_(this, Q46(_.open, _.close, this[VMH]), this[XxH]);
          return Object.defineProperty(this, H, { value: q }), q;
        },
      };
    SMH.visible = {
      get() {
        let H = $3_(this, this[VMH], !0);
        return Object.defineProperty(this, "visible", { value: H }), H;
      },
    };
    Aj$ = ["rgb", "hex", "ansi256"];
    for (let H of Aj$) {
      SMH[H] = {
        get() {
          let { level: q } = this;
          return function (...$) {
            let K = Q46(U46(H, mL8[q], "color", ...$), RI.color.close, this[VMH]);
            return $3_(this, K, this[XxH]);
          };
        },
      };
      let _ = "bg" + H[0].toUpperCase() + H.slice(1);
      SMH[_] = {
        get() {
          let { level: q } = this;
          return function (...$) {
            let K = Q46(U46(H, mL8[q], "bgColor", ...$), RI.bgColor.close, this[VMH]);
            return $3_(this, K, this[XxH]);
          };
        },
      };
    }
    fj$ = Object.defineProperties(() => {}, {
      ...SMH,
      level: {
        enumerable: !0,
        get() {
          return this[F46].level;
        },
        set(H) {
          this[F46].level = H;
        },
      },
    });
    Object.defineProperties(WxH.prototype, SMH);
    (Yj$ = WxH()), (l_5 = WxH({ level: xL8 ? xL8.level : 0 })), ($_ = Yj$);
