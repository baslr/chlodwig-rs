  var PK = d((EK) => {
    Object.defineProperty(EK, "__esModule", { value: !0 });
    EK.or =
      EK.and =
      EK.not =
      EK.CodeGen =
      EK.operators =
      EK.varKinds =
      EK.ValueScopeName =
      EK.ValueScope =
      EK.Scope =
      EK.Name =
      EK.regexpCode =
      EK.stringify =
      EK.getProperty =
      EK.nil =
      EK.strConcat =
      EK.str =
      EK._ =
        void 0;
    var i5 = $FH(),
      vu = qZ6(),
      X_H = $FH();
    Object.defineProperty(EK, "_", {
      enumerable: !0,
      get: function () {
        return X_H._;
      },
    });
    Object.defineProperty(EK, "str", {
      enumerable: !0,
      get: function () {
        return X_H.str;
      },
    });
    Object.defineProperty(EK, "strConcat", {
      enumerable: !0,
      get: function () {
        return X_H.strConcat;
      },
    });
    Object.defineProperty(EK, "nil", {
      enumerable: !0,
      get: function () {
        return X_H.nil;
      },
    });
    Object.defineProperty(EK, "getProperty", {
      enumerable: !0,
      get: function () {
        return X_H.getProperty;
      },
    });
    Object.defineProperty(EK, "stringify", {
      enumerable: !0,
      get: function () {
        return X_H.stringify;
      },
    });
    Object.defineProperty(EK, "regexpCode", {
      enumerable: !0,
      get: function () {
        return X_H.regexpCode;
      },
    });
    Object.defineProperty(EK, "Name", {
      enumerable: !0,
      get: function () {
        return X_H.Name;
      },
    });
    var mW_ = qZ6();
    Object.defineProperty(EK, "Scope", {
      enumerable: !0,
      get: function () {
        return mW_.Scope;
      },
    });
    Object.defineProperty(EK, "ValueScope", {
      enumerable: !0,
      get: function () {
        return mW_.ValueScope;
      },
    });
    Object.defineProperty(EK, "ValueScopeName", {
      enumerable: !0,
      get: function () {
        return mW_.ValueScopeName;
      },
    });
    Object.defineProperty(EK, "varKinds", {
      enumerable: !0,
      get: function () {
        return mW_.varKinds;
      },
    });
    EK.operators = {
      GT: new i5._Code(">"),
      GTE: new i5._Code(">="),
      LT: new i5._Code("<"),
      LTE: new i5._Code("<="),
      EQ: new i5._Code("==="),
      NEQ: new i5._Code("!=="),
      NOT: new i5._Code("!"),
      OR: new i5._Code("||"),
      AND: new i5._Code("&&"),
      ADD: new i5._Code("+"),
    };
    class W_H {
      optimizeNodes() {
        return this;
      }
      optimizeNames(H, _) {
        return this;
      }
    }
    class fxq extends W_H {
      constructor(H, _, q) {
        super();
        (this.varKind = H), (this.name = _), (this.rhs = q);
      }
      render({ es5: H, _n: _ }) {
        let q = H ? vu.varKinds.var : this.varKind,
          $ = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${q} ${this.name}${$};` + _;
      }
      optimizeNames(H, _) {
        if (!H[this.name.str]) return;
        if (this.rhs) this.rhs = H0H(this.rhs, H, _);
        return this;
      }
      get names() {
        return this.rhs instanceof i5._CodeOrName ? this.rhs.names : {};
      }
    }
    class OZ6 extends W_H {
      constructor(H, _, q) {
        super();
        (this.lhs = H), (this.rhs = _), (this.sideEffects = q);
      }
      render({ _n: H }) {
        return `${this.lhs} = ${this.rhs};` + H;
      }
      optimizeNames(H, _) {
        if (this.lhs instanceof i5.Name && !H[this.lhs.str] && !this.sideEffects) return;
        return (this.rhs = H0H(this.rhs, H, _)), this;
      }
      get names() {
        let H = this.lhs instanceof i5.Name ? {} : { ...this.lhs.names };
        return xW_(H, this.rhs);
      }
    }
    class wxq extends OZ6 {
      constructor(H, _, q, $) {
        super(H, q, $);
        this.op = _;
      }
      render({ _n: H }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + H;
      }
    }
    class Yxq extends W_H {
      constructor(H) {
        super();
        (this.label = H), (this.names = {});
      }
      render({ _n: H }) {
        return `${this.label}:` + H;
      }
    }
    class Dxq extends W_H {
      constructor(H) {
        super();
        (this.label = H), (this.names = {});
      }
      render({ _n: H }) {
        return `break${this.label ? ` ${this.label}` : ""};` + H;
      }
    }
    class jxq extends W_H {
      constructor(H) {
        super();
        this.error = H;
      }
      render({ _n: H }) {
        return `throw ${this.error};` + H;
      }
      get names() {
        return this.error.names;
      }
    }
    class Mxq extends W_H {
      constructor(H) {
        super();
        this.code = H;
      }
      render({ _n: H }) {
        return `${this.code};` + H;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(H, _) {
        return (this.code = H0H(this.code, H, _)), this;
      }
      get names() {
        return this.code instanceof i5._CodeOrName ? this.code.names : {};
      }
    }
    class pW_ extends W_H {
      constructor(H = []) {
        super();
        this.nodes = H;
      }
      render(H) {
        return this.nodes.reduce((_, q) => _ + q.render(H), "");
      }
      optimizeNodes() {
        let { nodes: H } = this,
          _ = H.length;
        while (_--) {
          let q = H[_].optimizeNodes();
          if (Array.isArray(q)) H.splice(_, 1, ...q);
          else if (q) H[_] = q;
          else H.splice(_, 1);
        }
        return H.length > 0 ? this : void 0;
      }
      optimizeNames(H, _) {
        let { nodes: q } = this,
          $ = q.length;
        while ($--) {
          let K = q[$];
          if (K.optimizeNames(H, _)) continue;
          ZM4(H, K.names), q.splice($, 1);
        }
        return q.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((H, _) => Z3H(H, _.names), {});
      }
    }
    class G_H extends pW_ {
      render(H) {
        return "{" + H._n + super.render(H) + "}" + H._n;
      }
    }
    class Jxq extends pW_ {}
    class KFH extends G_H {}
    KFH.kind = "else";
    class Xi extends G_H {
      constructor(H, _) {
        super(_);
        this.condition = H;
      }
      render(H) {
        let _ = `if(${this.condition})` + super.render(H);
        if (this.else) _ += "else " + this.else.render(H);
        return _;
      }
      optimizeNodes() {
        super.optimizeNodes();
        let H = this.condition;
        if (H === !0) return this.nodes;
        let _ = this.else;
        if (_) {
          let q = _.optimizeNodes();
          _ = this.else = Array.isArray(q) ? new KFH(q) : q;
        }
        if (_) {
          if (H === !1) return _ instanceof Xi ? _ : _.nodes;
          if (this.nodes.length) return this;
          return new Xi(Rxq(H), _ instanceof Xi ? [_] : _.nodes);
        }
        if (H === !1 || !this.nodes.length) return;
        return this;
      }
      optimizeNames(H, _) {
        var q;
        if (
          ((this.else = (q = this.else) === null || q === void 0 ? void 0 : q.optimizeNames(H, _)),
          !(super.optimizeNames(H, _) || this.else))
        )
          return;
        return (this.condition = H0H(this.condition, H, _)), this;
      }
      get names() {
        let H = super.names;
        if ((xW_(H, this.condition), this.else)) Z3H(H, this.else.names);
        return H;
      }
    }
    Xi.kind = "if";
    class eWH extends G_H {}
    eWH.kind = "for";
    class Pxq extends eWH {
      constructor(H) {
        super();
        this.iteration = H;
      }
      render(H) {
        return `for(${this.iteration})` + super.render(H);
      }
      optimizeNames(H, _) {
        if (!super.optimizeNames(H, _)) return;
        return (this.iteration = H0H(this.iteration, H, _)), this;
      }
      get names() {
        return Z3H(super.names, this.iteration.names);
      }
    }
    class Xxq extends eWH {
      constructor(H, _, q, $) {
        super();
        (this.varKind = H), (this.name = _), (this.from = q), (this.to = $);
      }
      render(H) {
        let _ = H.es5 ? vu.varKinds.var : this.varKind,
          { name: q, from: $, to: K } = this;
        return `for(${_} ${q}=${$}; ${q}<${K}; ${q}++)` + super.render(H);
      }
      get names() {
        let H = xW_(super.names, this.from);
        return xW_(H, this.to);
      }
    }
    class $Z6 extends eWH {
      constructor(H, _, q, $) {
        super();
        (this.loop = H), (this.varKind = _), (this.name = q), (this.iterable = $);
      }
      render(H) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(H);
      }
      optimizeNames(H, _) {
        if (!super.optimizeNames(H, _)) return;
        return (this.iterable = H0H(this.iterable, H, _)), this;
      }
      get names() {
        return Z3H(super.names, this.iterable.names);
      }
    }
    class CW_ extends G_H {
      constructor(H, _, q) {
        super();
        (this.name = H), (this.args = _), (this.async = q);
      }
      render(H) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(H);
      }
    }
    CW_.kind = "func";
    class bW_ extends pW_ {
      render(H) {
        return "return " + super.render(H);
      }
    }
    bW_.kind = "return";
    class Wxq extends G_H {
      render(H) {
        let _ = "try" + super.render(H);
        if (this.catch) _ += this.catch.render(H);
        if (this.finally) _ += this.finally.render(H);
        return _;
      }
      optimizeNodes() {
        var H, _;
        return (
          super.optimizeNodes(),
          (H = this.catch) === null || H === void 0 || H.optimizeNodes(),
          (_ = this.finally) === null || _ === void 0 || _.optimizeNodes(),
          this
        );
      }
      optimizeNames(H, _) {
        var q, $;
        return (
          super.optimizeNames(H, _),
          (q = this.catch) === null || q === void 0 || q.optimizeNames(H, _),
          ($ = this.finally) === null || $ === void 0 || $.optimizeNames(H, _),
          this
        );
      }
      get names() {
        let H = super.names;
        if (this.catch) Z3H(H, this.catch.names);
        if (this.finally) Z3H(H, this.finally.names);
        return H;
      }
    }
    class IW_ extends G_H {
      constructor(H) {
        super();
        this.error = H;
      }
      render(H) {
        return `catch(${this.error})` + super.render(H);
      }
    }
    IW_.kind = "catch";
    class uW_ extends G_H {
      render(H) {
        return "finally" + super.render(H);
      }
    }
    uW_.kind = "finally";
    class Gxq {
      constructor(H, _ = {}) {
        (this._values = {}),
          (this._blockStarts = []),
          (this._constants = {}),
          (this.opts = {
            ..._,
            _n: _.lines
              ? `
`
              : "",
          }),
          (this._extScope = H),
          (this._scope = new vu.Scope({ parent: H })),
          (this._nodes = [new Jxq()]);
      }
      toString() {
        return this._root.render(this.opts);
      }
      name(H) {
        return this._scope.name(H);
      }
      scopeName(H) {
        return this._extScope.name(H);
      }
      scopeValue(H, _) {
        let q = this._extScope.value(H, _);
        return (this._values[q.prefix] || (this._values[q.prefix] = new Set())).add(q), q;
      }
      getScopeValue(H, _) {
        return this._extScope.getValue(H, _);
      }
      scopeRefs(H) {
        return this._extScope.scopeRefs(H, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(H, _, q, $) {
        let K = this._scope.toName(_);
        if (q !== void 0 && $) this._constants[K.str] = q;
        return this._leafNode(new fxq(H, K, q)), K;
      }
      const(H, _, q) {
        return this._def(vu.varKinds.const, H, _, q);
      }
      let(H, _, q) {
        return this._def(vu.varKinds.let, H, _, q);
      }
      var(H, _, q) {
        return this._def(vu.varKinds.var, H, _, q);
      }
      assign(H, _, q) {
        return this._leafNode(new OZ6(H, _, q));
      }
      add(H, _) {
        return this._leafNode(new wxq(H, EK.operators.ADD, _));
      }
      code(H) {
        if (typeof H == "function") H();
        else if (H !== i5.nil) this._leafNode(new Mxq(H));
        return this;
      }
      object(...H) {
        let _ = ["{"];
        for (let [q, $] of H) {
          if (_.length > 1) _.push(",");
          if ((_.push(q), q !== $ || this.opts.es5)) _.push(":"), (0, i5.addCodeArg)(_, $);
        }
        return _.push("}"), new i5._Code(_);
      }
      if(H, _, q) {
        if ((this._blockNode(new Xi(H)), _ && q)) this.code(_).else().code(q).endIf();
        else if (_) this.code(_).endIf();
        else if (q) throw Error('CodeGen: "else" body without "then" body');
        return this;
      }
      elseIf(H) {
        return this._elseNode(new Xi(H));
      }
      else() {
        return this._elseNode(new KFH());
      }
      endIf() {
        return this._endBlockNode(Xi, KFH);
      }
      _for(H, _) {
        if ((this._blockNode(H), _)) this.code(_).endFor();
        return this;
      }
      for(H, _) {
        return this._for(new Pxq(H), _);
      }
      forRange(H, _, q, $, K = this.opts.es5 ? vu.varKinds.var : vu.varKinds.let) {
        let O = this._scope.toName(H);
        return this._for(new Xxq(K, O, _, q), () => $(O));
      }
      forOf(H, _, q, $ = vu.varKinds.const) {
        let K = this._scope.toName(H);
        if (this.opts.es5) {
          let O = _ instanceof i5.Name ? _ : this.var("_arr", _);
          return this.forRange("_i", 0, i5._`${O}.length`, (T) => {
            this.var(K, i5._`${O}[${T}]`), q(K);
          });
        }
        return this._for(new $Z6("of", $, K, _), () => q(K));
      }
      forIn(H, _, q, $ = this.opts.es5 ? vu.varKinds.var : vu.varKinds.const) {
        if (this.opts.ownProperties) return this.forOf(H, i5._`Object.keys(${_})`, q);
        let K = this._scope.toName(H);
        return this._for(new $Z6("in", $, K, _), () => q(K));
      }
      endFor() {
        return this._endBlockNode(eWH);
      }
      label(H) {
        return this._leafNode(new Yxq(H));
      }
      break(H) {
        return this._leafNode(new Dxq(H));
      }
      return(H) {
        let _ = new bW_();
        if ((this._blockNode(_), this.code(H), _.nodes.length !== 1))
          throw Error('CodeGen: "return" should have one node');
        return this._endBlockNode(bW_);
      }
      try(H, _, q) {
        if (!_ && !q) throw Error('CodeGen: "try" without "catch" and "finally"');
        let $ = new Wxq();
        if ((this._blockNode($), this.code(H), _)) {
          let K = this.name("e");
          (this._currNode = $.catch = new IW_(K)), _(K);
        }
        if (q) (this._currNode = $.finally = new uW_()), this.code(q);
        return this._endBlockNode(IW_, uW_);
      }
      throw(H) {
        return this._leafNode(new jxq(H));
      }
      block(H, _) {
        if ((this._blockStarts.push(this._nodes.length), H)) this.code(H).endBlock(_);
        return this;
      }
      endBlock(H) {
        let _ = this._blockStarts.pop();
        if (_ === void 0) throw Error("CodeGen: not in self-balancing block");
        let q = this._nodes.length - _;
        if (q < 0 || (H !== void 0 && q !== H)) throw Error(`CodeGen: wrong number of nodes: ${q} vs ${H} expected`);
        return (this._nodes.length = _), this;
      }
      func(H, _ = i5.nil, q, $) {
        if ((this._blockNode(new CW_(H, _, q)), $)) this.code($).endFunc();
        return this;
      }
      endFunc() {
        return this._endBlockNode(CW_);
      }
      optimize(H = 1) {
        while (H-- > 0) this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode(H) {
        return this._currNode.nodes.push(H), this;
      }
      _blockNode(H) {
        this._currNode.nodes.push(H), this._nodes.push(H);
      }
      _endBlockNode(H, _) {
        let q = this._currNode;
        if (q instanceof H || (_ && q instanceof _)) return this._nodes.pop(), this;
        throw Error(`CodeGen: not in block "${_ ? `${H.kind}/${_.kind}` : H.kind}"`);
      }
      _elseNode(H) {
        let _ = this._currNode;
        if (!(_ instanceof Xi)) throw Error('CodeGen: "else" without "if"');
        return (this._currNode = _.else = H), this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        let H = this._nodes;
        return H[H.length - 1];
      }
      set _currNode(H) {
        let _ = this._nodes;
        _[_.length - 1] = H;
      }
    }
    EK.CodeGen = Gxq;
    function Z3H(H, _) {
      for (let q in _) H[q] = (H[q] || 0) + (_[q] || 0);
      return H;
    }
    function xW_(H, _) {
      return _ instanceof i5._CodeOrName ? Z3H(H, _.names) : H;
    }
    function H0H(H, _, q) {
      if (H instanceof i5.Name) return $(H);
      if (!K(H)) return H;
      return new i5._Code(
        H._items.reduce((O, T) => {
          if (T instanceof i5.Name) T = $(T);
          if (T instanceof i5._Code) O.push(...T._items);
          else O.push(T);
          return O;
        }, []),
      );
      function $(O) {
        let T = q[O.str];
        if (T === void 0 || _[O.str] !== 1) return O;
        return delete _[O.str], T;
      }
      function K(O) {
        return (
          O instanceof i5._Code && O._items.some((T) => T instanceof i5.Name && _[T.str] === 1 && q[T.str] !== void 0)
        );
      }
    }
    function ZM4(H, _) {
      for (let q in _) H[q] = (H[q] || 0) - (_[q] || 0);
    }
    function Rxq(H) {
      return typeof H == "boolean" || typeof H == "number" || H === null ? !H : i5._`!${KZ6(H)}`;
    }
    EK.not = Rxq;
    var LM4 = Zxq(EK.operators.AND);
    function kM4(...H) {
      return H.reduce(LM4);
    }
    EK.and = kM4;
    var vM4 = Zxq(EK.operators.OR);
    function NM4(...H) {
      return H.reduce(vM4);
    }
    EK.or = NM4;
    function Zxq(H) {
      return (_, q) => (_ === i5.nil ? q : q === i5.nil ? _ : i5._`${KZ6(_)} ${H} ${KZ6(q)}`);
    }
    function KZ6(H) {
      return H instanceof i5.Name ? H : i5._`(${H})`;
    }
  });
