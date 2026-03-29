  var C3H = d((wy3, N0_) => {
    function EBq(H) {
      return Array.isArray(H) ? H : [H];
    }
    var kG4 = void 0,
      QL6 = "",
      VBq = " ",
      UL6 = "\\",
      vG4 = /^\s+$/,
      NG4 = /(?:[^\\]|^)\\$/,
      hG4 = /^\\!/,
      yG4 = /^\\#/,
      VG4 = /\r?\n/g,
      SG4 = /^\.{0,2}\/|^\.{1,2}$/,
      EG4 = /\/$/,
      J0H = "/",
      CBq = "node-ignore";
    if (typeof Symbol < "u") CBq = Symbol.for("node-ignore");
    var bBq = CBq,
      P0H = (H, _, q) => {
        return Object.defineProperty(H, _, { value: q }), q;
      },
      CG4 = /([0-z])-([0-z])/g,
      IBq = () => !1,
      bG4 = (H) => H.replace(CG4, (_, q, $) => (q.charCodeAt(0) <= $.charCodeAt(0) ? _ : QL6)),
      IG4 = (H) => {
        let { length: _ } = H;
        return H.slice(0, _ - (_ % 2));
      },
      uG4 = [
        [/^\uFEFF/, () => QL6],
        [/((?:\\\\)*?)(\\?\s+)$/, (H, _, q) => _ + (q.indexOf("\\") === 0 ? VBq : QL6)],
        [
          /(\\+?)\s/g,
          (H, _) => {
            let { length: q } = _;
            return _.slice(0, q - (q % 2)) + VBq;
          },
        ],
        [/[\\$.|*+(){^]/g, (H) => `\\${H}`],
        [/(?!\\)\?/g, () => "[^/]"],
        [/^\//, () => "^"],
        [/\//g, () => "\\/"],
        [/^\^*\\\*\\\*\\\//, () => "^(?:.*\\/)?"],
        [
          /^(?=[^^])/,
          function () {
            return !/\/(?!$)/.test(this) ? "(?:^|\\/)" : "^";
          },
        ],
        [/\\\/\\\*\\\*(?=\\\/|$)/g, (H, _, q) => (_ + 6 < q.length ? "(?:\\/[^\\/]+)*" : "\\/.+")],
        [
          /(^|[^\\]+)(\\\*)+(?=.+)/g,
          (H, _, q) => {
            let $ = q.replace(/\\\*/g, "[^\\/]*");
            return _ + $;
          },
        ],
        [/\\\\\\(?=[$.|*+(){^])/g, () => UL6],
        [/\\\\/g, () => UL6],
        [
          /(\\)?\[([^\]/]*?)(\\*)($|\])/g,
          (H, _, q, $, K) =>
            _ === UL6 ? `\\[${q}${IG4($)}${K}` : K === "]" ? ($.length % 2 === 0 ? `[${bG4(q)}${$}]` : "[]") : "[]",
        ],
        [/(?:[^*])$/, (H) => (/\/$/.test(H) ? `${H}$` : `${H}(?=$|\\/$)`)],
      ],
      xG4 = /(^|\\\/)?\\\*$/,
      CFH = "regex",
      k0_ = "checkRegex",
      SBq = "_",
      mG4 = {
        [CFH](H, _) {
          return `${_ ? `${_}[^/]+` : "[^/]*"}(?=$|\\/$)`;
        },
        [k0_](H, _) {
          return `${_ ? `${_}[^/]*` : "[^/]*"}(?=$|\\/$)`;
        },
      },
      pG4 = (H) => uG4.reduce((_, [q, $]) => _.replace(q, $.bind(H)), H),
      v0_ = (H) => typeof H === "string",
      BG4 = (H) => H && v0_(H) && !vG4.test(H) && !NG4.test(H) && H.indexOf("#") !== 0,
      gG4 = (H) => H.split(VG4).filter(Boolean);
    class uBq {
      constructor(H, _, q, $, K, O) {
        (this.pattern = H),
          (this.mark = _),
          (this.negative = K),
          P0H(this, "body", q),
          P0H(this, "ignoreCase", $),
          P0H(this, "regexPrefix", O);
      }
      get regex() {
        let H = SBq + CFH;
        if (this[H]) return this[H];
        return this._make(CFH, H);
      }
      get checkRegex() {
        let H = SBq + k0_;
        if (this[H]) return this[H];
        return this._make(k0_, H);
      }
      _make(H, _) {
        let q = this.regexPrefix.replace(xG4, mG4[H]),
          $ = this.ignoreCase ? new RegExp(q, "i") : new RegExp(q);
        return P0H(this, _, $);
      }
    }
    var dG4 = ({ pattern: H, mark: _ }, q) => {
      let $ = !1,
        K = H;
      if (K.indexOf("!") === 0) ($ = !0), (K = K.substr(1));
      K = K.replace(hG4, "!").replace(yG4, "#");
      let O = pG4(K);
      return new uBq(H, _, K, q, $, O);
    };
    class xBq {
      constructor(H) {
        (this._ignoreCase = H), (this._rules = []);
      }
      _add(H) {
        if (H && H[bBq]) {
          (this._rules = this._rules.concat(H._rules._rules)), (this._added = !0);
          return;
        }
        if (v0_(H)) H = { pattern: H };
        if (BG4(H.pattern)) {
          let _ = dG4(H, this._ignoreCase);
          (this._added = !0), this._rules.push(_);
        }
      }
      add(H) {
        return (this._added = !1), EBq(v0_(H) ? gG4(H) : H).forEach(this._add, this), this._added;
      }
      test(H, _, q) {
        let $ = !1,
          K = !1,
          O;
        this._rules.forEach((z) => {
          let { negative: A } = z;
          if ((K === A && $ !== K) || (A && !$ && !K && !_)) return;
          if (!z[q].test(H)) return;
          ($ = !A), (K = A), (O = A ? kG4 : z);
        });
        let T = { ignored: $, unignored: K };
        if (O) T.rule = O;
        return T;
      }
    }
    var cG4 = (H, _) => {
        throw new _(H);
      },
      ki = (H, _, q) => {
        if (!v0_(H)) return q(`path must be a string, but got \`${_}\``, TypeError);
        if (!H) return q("path must not be empty", TypeError);
        if (ki.isNotRelative(H)) return q(`path should be a \`path.relative()\`d string, but got "${_}"`, RangeError);
        return !0;
      },
      mBq = (H) => SG4.test(H);
    ki.isNotRelative = mBq;
    ki.convert = (H) => H;
    class pBq {
      constructor({ ignorecase: H = !0, ignoreCase: _ = H, allowRelativePaths: q = !1 } = {}) {
        P0H(this, bBq, !0), (this._rules = new xBq(_)), (this._strictPathCheck = !q), this._initCache();
      }
      _initCache() {
        (this._ignoreCache = Object.create(null)), (this._testCache = Object.create(null));
      }
      add(H) {
        if (this._rules.add(H)) this._initCache();
        return this;
      }
      addPattern(H) {
        return this.add(H);
      }
      _test(H, _, q, $) {
        let K = H && ki.convert(H);
        return ki(K, H, this._strictPathCheck ? cG4 : IBq), this._t(K, _, q, $);
      }
      checkIgnore(H) {
        if (!EG4.test(H)) return this.test(H);
        let _ = H.split(J0H).filter(Boolean);
        if ((_.pop(), _.length)) {
          let q = this._t(_.join(J0H) + J0H, this._testCache, !0, _);
          if (q.ignored) return q;
        }
        return this._rules.test(H, !1, k0_);
      }
      _t(H, _, q, $) {
        if (H in _) return _[H];
        if (!$) $ = H.split(J0H).filter(Boolean);
        if (($.pop(), !$.length)) return (_[H] = this._rules.test(H, q, CFH));
        let K = this._t($.join(J0H) + J0H, _, q, $);
        return (_[H] = K.ignored ? K : this._rules.test(H, q, CFH));
      }
      ignores(H) {
        return this._test(H, this._ignoreCache, !1).ignored;
      }
      createFilter() {
        return (H) => !this.ignores(H);
      }
      filter(H) {
        return EBq(H).filter(this.createFilter());
      }
      test(H) {
        return this._test(H, this._testCache, !0);
      }
    }
    var lL6 = (H) => new pBq(H),
      FG4 = (H) => ki(H && ki.convert(H), H, IBq),
      UG4 = () => {
        let H = (q) => (/^\\\\\?\\/.test(q) || /["<>|\u0000-\u001F]+/u.test(q) ? q : q.replace(/\\/g, "/"));
        ki.convert = H;
        let _ = /^[a-z]:\//i;
        ki.isNotRelative = (q) => _.test(q) || mBq(q);
      };
    N0_.exports = lL6;
    lL6.default = lL6;
    N0_.exports.isPathValid = FG4;
    P0H(N0_.exports, Symbol.for("setupWindows"), UG4);
  });
