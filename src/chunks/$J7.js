  var $J7 = d((C7O, qJ7) => {
    var $nH = gM7(),
      { stdout: Uu6, stderr: Qu6 } = FM7(),
      { stringReplaceAll: M$1, stringEncaseCRLFWithFirstIndex: J$1 } = QM7(),
      { isArray: UN_ } = Array,
      sM7 = ["ansi", "ansi", "ansi256", "ansi16m"],
      gZH = Object.create(null),
      P$1 = (H, _ = {}) => {
        if (_.level && !(Number.isInteger(_.level) && _.level >= 0 && _.level <= 3))
          throw Error("The `level` option should be an integer from 0 to 3");
        let q = Uu6 ? Uu6.level : 0;
        H.level = _.level === void 0 ? q : _.level;
      };
    class tM7 {
      constructor(H) {
        return eM7(H);
      }
    }
    var eM7 = (H) => {
      let _ = {};
      return (
        P$1(_, H),
        (_.template = (...q) => _J7(_.template, ...q)),
        Object.setPrototypeOf(_, QN_.prototype),
        Object.setPrototypeOf(_.template, _),
        (_.template.constructor = () => {
          throw Error("`chalk.constructor()` is deprecated. Use `new chalk.Instance()` instead.");
        }),
        (_.template.Instance = tM7),
        _.template
      );
    };
    function QN_(H) {
      return eM7(H);
    }
    for (let [H, _] of Object.entries($nH))
      gZH[H] = {
        get() {
          let q = lN_(this, lu6(_.open, _.close, this._styler), this._isEmpty);
          return Object.defineProperty(this, H, { value: q }), q;
        },
      };
    gZH.visible = {
      get() {
        let H = lN_(this, this._styler, !0);
        return Object.defineProperty(this, "visible", { value: H }), H;
      },
    };
    var HJ7 = ["rgb", "hex", "keyword", "hsl", "hsv", "hwb", "ansi", "ansi256"];
    for (let H of HJ7)
      gZH[H] = {
        get() {
          let { level: _ } = this;
          return function (...q) {
            let $ = lu6($nH.color[sM7[_]][H](...q), $nH.color.close, this._styler);
            return lN_(this, $, this._isEmpty);
          };
        },
      };
    for (let H of HJ7) {
      let _ = "bg" + H[0].toUpperCase() + H.slice(1);
      gZH[_] = {
        get() {
          let { level: q } = this;
          return function (...$) {
            let K = lu6($nH.bgColor[sM7[q]][H](...$), $nH.bgColor.close, this._styler);
            return lN_(this, K, this._isEmpty);
          };
        },
      };
    }
    var X$1 = Object.defineProperties(() => {}, {
        ...gZH,
        level: {
          enumerable: !0,
          get() {
            return this._generator.level;
          },
          set(H) {
            this._generator.level = H;
          },
        },
      }),
      lu6 = (H, _, q) => {
        let $, K;
        if (q === void 0) ($ = H), (K = _);
        else ($ = q.openAll + H), (K = _ + q.closeAll);
        return { open: H, close: _, openAll: $, closeAll: K, parent: q };
      },
      lN_ = (H, _, q) => {
        let $ = (...K) => {
          if (UN_(K[0]) && UN_(K[0].raw)) return aM7($, _J7($, ...K));
          return aM7($, K.length === 1 ? "" + K[0] : K.join(" "));
        };
        return Object.setPrototypeOf($, X$1), ($._generator = H), ($._styler = _), ($._isEmpty = q), $;
      },
      aM7 = (H, _) => {
        if (H.level <= 0 || !_) return H._isEmpty ? "" : _;
        let q = H._styler;
        if (q === void 0) return _;
        let { openAll: $, closeAll: K } = q;
        if (_.indexOf("\x1B") !== -1) while (q !== void 0) (_ = M$1(_, q.close, q.open)), (q = q.parent);
        let O = _.indexOf(`
`);
        if (O !== -1) _ = J$1(_, K, $, O);
        return $ + _ + K;
      },
      Fu6,
      _J7 = (H, ..._) => {
        let [q] = _;
        if (!UN_(q) || !UN_(q.raw)) return _.join(" ");
        let $ = _.slice(1),
          K = [q.raw[0]];
        for (let O = 1; O < q.length; O++) K.push(String($[O - 1]).replace(/[{}\\]/g, "\\$&"), String(q.raw[O]));
        if (Fu6 === void 0) Fu6 = oM7();
        return Fu6(H, K.join(""));
      };
    Object.defineProperties(QN_.prototype, gZH);
    var iN_ = QN_();
    iN_.supportsColor = Uu6;
    iN_.stderr = QN_({ level: Qu6 ? Qu6.level : 0 });
    iN_.stderr.supportsColor = Qu6;
    qJ7.exports = iN_;
  });
