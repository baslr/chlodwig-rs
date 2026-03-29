  var q18 = d((_18) => {
    var { InvalidArgumentError: N2K } = i8_();
    class $V9 {
      constructor(H, _) {
        (this.flags = H),
          (this.description = _ || ""),
          (this.required = H.includes("<")),
          (this.optional = H.includes("[")),
          (this.variadic = /\w\.\.\.[>\]]$/.test(H)),
          (this.mandatory = !1);
        let q = y2K(H);
        if (((this.short = q.shortFlag), (this.long = q.longFlag), (this.negate = !1), this.long))
          this.negate = this.long.startsWith("--no-");
        (this.defaultValue = void 0),
          (this.defaultValueDescription = void 0),
          (this.presetArg = void 0),
          (this.envVar = void 0),
          (this.parseArg = void 0),
          (this.hidden = !1),
          (this.argChoices = void 0),
          (this.conflictsWith = []),
          (this.implied = void 0);
      }
      default(H, _) {
        return (this.defaultValue = H), (this.defaultValueDescription = _), this;
      }
      preset(H) {
        return (this.presetArg = H), this;
      }
      conflicts(H) {
        return (this.conflictsWith = this.conflictsWith.concat(H)), this;
      }
      implies(H) {
        let _ = H;
        if (typeof H === "string") _ = { [H]: !0 };
        return (this.implied = Object.assign(this.implied || {}, _)), this;
      }
      env(H) {
        return (this.envVar = H), this;
      }
      argParser(H) {
        return (this.parseArg = H), this;
      }
      makeOptionMandatory(H = !0) {
        return (this.mandatory = !!H), this;
      }
      hideHelp(H = !0) {
        return (this.hidden = !!H), this;
      }
      _concatValue(H, _) {
        if (_ === this.defaultValue || !Array.isArray(_)) return [H];
        return _.concat(H);
      }
      choices(H) {
        return (
          (this.argChoices = H.slice()),
          (this.parseArg = (_, q) => {
            if (!this.argChoices.includes(_)) throw new N2K(`Allowed choices are ${this.argChoices.join(", ")}.`);
            if (this.variadic) return this._concatValue(_, q);
            return _;
          }),
          this
        );
      }
      name() {
        if (this.long) return this.long.replace(/^--/, "");
        return this.short.replace(/^-/, "");
      }
      attributeName() {
        return h2K(this.name().replace(/^no-/, ""));
      }
      is(H) {
        return this.short === H || this.long === H;
      }
      isBoolean() {
        return !this.required && !this.optional && !this.negate;
      }
    }
    class KV9 {
      constructor(H) {
        (this.positiveOptions = new Map()),
          (this.negativeOptions = new Map()),
          (this.dualOptions = new Set()),
          H.forEach((_) => {
            if (_.negate) this.negativeOptions.set(_.attributeName(), _);
            else this.positiveOptions.set(_.attributeName(), _);
          }),
          this.negativeOptions.forEach((_, q) => {
            if (this.positiveOptions.has(q)) this.dualOptions.add(q);
          });
      }
      valueFromOption(H, _) {
        let q = _.attributeName();
        if (!this.dualOptions.has(q)) return !0;
        let $ = this.negativeOptions.get(q).presetArg,
          K = $ !== void 0 ? $ : !1;
        return _.negate === (K === H);
      }
    }
    function h2K(H) {
      return H.split("-").reduce((_, q) => {
        return _ + q[0].toUpperCase() + q.slice(1);
      });
    }
    function y2K(H) {
      let _,
        q,
        $ = H.split(/[ |,]+/);
      if ($.length > 1 && !/^[[<]/.test($[1])) _ = $.shift();
      if (((q = $.shift()), !_ && /^-[^-]$/.test(q))) (_ = q), (q = void 0);
      return { shortFlag: _, longFlag: q };
    }
    _18.Option = $V9;
    _18.DualOptions = KV9;
  });
