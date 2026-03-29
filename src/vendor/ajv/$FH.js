  var $FH = d((B3) => {
    Object.defineProperty(B3, "__esModule", { value: !0 });
    B3.regexpCode =
      B3.getEsmExportName =
      B3.getProperty =
      B3.safeStringify =
      B3.stringify =
      B3.strConcat =
      B3.addCodeArg =
      B3.str =
      B3._ =
      B3.nil =
      B3._Code =
      B3.Name =
      B3.IDENTIFIER =
      B3._CodeOrName =
        void 0;
    class SW_ {}
    B3._CodeOrName = SW_;
    B3.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class tWH extends SW_ {
      constructor(H) {
        super();
        if (!B3.IDENTIFIER.test(H)) throw Error("CodeGen: name must be a valid identifier");
        this.str = H;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return !1;
      }
      get names() {
        return { [this.str]: 1 };
      }
    }
    B3.Name = tWH;
    class ku extends SW_ {
      constructor(H) {
        super();
        this._items = typeof H === "string" ? [H] : H;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1) return !1;
        let H = this._items[0];
        return H === "" || H === '""';
      }
      get str() {
        var H;
        return (H = this._str) !== null && H !== void 0
          ? H
          : (this._str = this._items.reduce((_, q) => `${_}${q}`, ""));
      }
      get names() {
        var H;
        return (H = this._names) !== null && H !== void 0
          ? H
          : (this._names = this._items.reduce((_, q) => {
              if (q instanceof tWH) _[q.str] = (_[q.str] || 0) + 1;
              return _;
            }, {}));
      }
    }
    B3._Code = ku;
    B3.nil = new ku("");
    function Oxq(H, ..._) {
      let q = [H[0]],
        $ = 0;
      while ($ < _.length) eR6(q, _[$]), q.push(H[++$]);
      return new ku(q);
    }
    B3._ = Oxq;
    var tR6 = new ku("+");
    function Txq(H, ..._) {
      let q = [qFH(H[0])],
        $ = 0;
      while ($ < _.length) q.push(tR6), eR6(q, _[$]), q.push(tR6, qFH(H[++$]));
      return DM4(q), new ku(q);
    }
    B3.str = Txq;
    function eR6(H, _) {
      if (_ instanceof ku) H.push(..._._items);
      else if (_ instanceof tWH) H.push(_);
      else H.push(JM4(_));
    }
    B3.addCodeArg = eR6;
    function DM4(H) {
      let _ = 1;
      while (_ < H.length - 1) {
        if (H[_] === tR6) {
          let q = jM4(H[_ - 1], H[_ + 1]);
          if (q !== void 0) {
            H.splice(_ - 1, 3, q);
            continue;
          }
          H[_++] = "+";
        }
        _++;
      }
    }
    function jM4(H, _) {
      if (_ === '""') return H;
      if (H === '""') return _;
      if (typeof H == "string") {
        if (_ instanceof tWH || H[H.length - 1] !== '"') return;
        if (typeof _ != "string") return `${H.slice(0, -1)}${_}"`;
        if (_[0] === '"') return H.slice(0, -1) + _.slice(1);
        return;
      }
      if (typeof _ == "string" && _[0] === '"' && !(H instanceof tWH)) return `"${H}${_.slice(1)}`;
      return;
    }
    function MM4(H, _) {
      return _.emptyStr() ? H : H.emptyStr() ? _ : Txq`${H}${_}`;
    }
    B3.strConcat = MM4;
    function JM4(H) {
      return typeof H == "number" || typeof H == "boolean" || H === null ? H : qFH(Array.isArray(H) ? H.join(",") : H);
    }
    function PM4(H) {
      return new ku(qFH(H));
    }
    B3.stringify = PM4;
    function qFH(H) {
      return JSON.stringify(H)
        .replace(/\u2028/g, "\\u2028")
        .replace(/\u2029/g, "\\u2029");
    }
    B3.safeStringify = qFH;
    function XM4(H) {
      return typeof H == "string" && B3.IDENTIFIER.test(H) ? new ku(`.${H}`) : Oxq`[${H}]`;
    }
    B3.getProperty = XM4;
    function WM4(H) {
      if (typeof H == "string" && B3.IDENTIFIER.test(H)) return new ku(`${H}`);
      throw Error(`CodeGen: invalid export name: ${H}, use explicit $id name mapping`);
    }
    B3.getEsmExportName = WM4;
    function GM4(H) {
      return new ku(H.toString());
    }
    B3.regexpCode = GM4;
  });
