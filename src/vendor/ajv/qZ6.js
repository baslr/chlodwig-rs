  var qZ6 = d((yk) => {
    Object.defineProperty(yk, "__esModule", { value: !0 });
    yk.ValueScope = yk.ValueScopeName = yk.Scope = yk.varKinds = yk.UsedValueState = void 0;
    var hk = $FH();
    class zxq extends Error {
      constructor(H) {
        super(`CodeGen: "code" for ${H} not defined`);
        this.value = H.value;
      }
    }
    var EW_;
    (function (H) {
      (H[(H.Started = 0)] = "Started"), (H[(H.Completed = 1)] = "Completed");
    })(EW_ || (yk.UsedValueState = EW_ = {}));
    yk.varKinds = { const: new hk.Name("const"), let: new hk.Name("let"), var: new hk.Name("var") };
    class HZ6 {
      constructor({ prefixes: H, parent: _ } = {}) {
        (this._names = {}), (this._prefixes = H), (this._parent = _);
      }
      toName(H) {
        return H instanceof hk.Name ? H : this.name(H);
      }
      name(H) {
        return new hk.Name(this._newName(H));
      }
      _newName(H) {
        let _ = this._names[H] || this._nameGroup(H);
        return `${H}${_.index++}`;
      }
      _nameGroup(H) {
        var _, q;
        if (
          ((q = (_ = this._parent) === null || _ === void 0 ? void 0 : _._prefixes) === null || q === void 0
            ? void 0
            : q.has(H)) ||
          (this._prefixes && !this._prefixes.has(H))
        )
          throw Error(`CodeGen: prefix "${H}" is not allowed in this scope`);
        return (this._names[H] = { prefix: H, index: 0 });
      }
    }
    yk.Scope = HZ6;
    class _Z6 extends hk.Name {
      constructor(H, _) {
        super(_);
        this.prefix = H;
      }
      setValue(H, { property: _, itemIndex: q }) {
        (this.value = H), (this.scopePath = hk._`.${new hk.Name(_)}[${q}]`);
      }
    }
    yk.ValueScopeName = _Z6;
    var RM4 = hk._`\n`;
    class Axq extends HZ6 {
      constructor(H) {
        super(H);
        (this._values = {}), (this._scope = H.scope), (this.opts = { ...H, _n: H.lines ? RM4 : hk.nil });
      }
      get() {
        return this._scope;
      }
      name(H) {
        return new _Z6(H, this._newName(H));
      }
      value(H, _) {
        var q;
        if (_.ref === void 0) throw Error("CodeGen: ref must be passed in value");
        let $ = this.toName(H),
          { prefix: K } = $,
          O = (q = _.key) !== null && q !== void 0 ? q : _.ref,
          T = this._values[K];
        if (T) {
          let f = T.get(O);
          if (f) return f;
        } else T = this._values[K] = new Map();
        T.set(O, $);
        let z = this._scope[K] || (this._scope[K] = []),
          A = z.length;
        return (z[A] = _.ref), $.setValue(_, { property: K, itemIndex: A }), $;
      }
      getValue(H, _) {
        let q = this._values[H];
        if (!q) return;
        return q.get(_);
      }
      scopeRefs(H, _ = this._values) {
        return this._reduceValues(_, (q) => {
          if (q.scopePath === void 0) throw Error(`CodeGen: name "${q}" has no value`);
          return hk._`${H}${q.scopePath}`;
        });
      }
      scopeCode(H = this._values, _, q) {
        return this._reduceValues(
          H,
          ($) => {
            if ($.value === void 0) throw Error(`CodeGen: name "${$}" has no value`);
            return $.value.code;
          },
          _,
          q,
        );
      }
      _reduceValues(H, _, q = {}, $) {
        let K = hk.nil;
        for (let O in H) {
          let T = H[O];
          if (!T) continue;
          let z = (q[O] = q[O] || new Map());
          T.forEach((A) => {
            if (z.has(A)) return;
            z.set(A, EW_.Started);
            let f = _(A);
            if (f) {
              let w = this.opts.es5 ? yk.varKinds.var : yk.varKinds.const;
              K = hk._`${K}${w} ${A} = ${f};${this.opts._n}`;
            } else if ((f = $ === null || $ === void 0 ? void 0 : $(A))) K = hk._`${K}${f}${this.opts._n}`;
            else throw new zxq(A);
            z.set(A, EW_.Completed);
          });
        }
        return K;
      }
    }
    yk.ValueScope = Axq;
  });
