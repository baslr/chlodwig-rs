    vwq = class vwq {
      constructor(H) {
        if (((this._headersMap = new Map()), H)) for (let _ of Object.keys(H)) this.set(_, H[_]);
      }
      set(H, _) {
        this._headersMap.set(nD_(H), { name: H, value: String(_).trim() });
      }
      get(H) {
        var _;
        return (_ = this._headersMap.get(nD_(H))) === null || _ === void 0 ? void 0 : _.value;
      }
      has(H) {
        return this._headersMap.has(nD_(H));
      }
      delete(H) {
        this._headersMap.delete(nD_(H));
      }
      toJSON(H = {}) {
        let _ = {};
        if (H.preserveCase) for (let q of this._headersMap.values()) _[q.name] = q.value;
        else for (let [q, $] of this._headersMap) _[q] = $.value;
        return _;
      }
      toString() {
        return JSON.stringify(this.toJSON({ preserveCase: !0 }));
      }
      [Symbol.iterator]() {
        return bs$(this._headersMap);
      }
    };
