  var O6H = d(($y6) => {
    var iS4 = qy6(),
      nS4 = Hy6(),
      rS4 = BR_(),
      K6H = R3(),
      sR_ = $6H(),
      oS4 = vj();
    function $QH(H, _) {
      let q = K6H.isScalar(_) ? _.value : _;
      for (let $ of H)
        if (K6H.isPair($)) {
          if ($.key === _ || $.key === q) return $;
          if (K6H.isScalar($.key) && $.key.value === q) return $;
        }
      return;
    }
    class yrq extends rS4.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:map";
      }
      constructor(H) {
        super(K6H.MAP, H);
        this.items = [];
      }
      static from(H, _, q) {
        let { keepUndefined: $, replacer: K } = q,
          O = new this(H),
          T = (z, A) => {
            if (typeof K === "function") A = K.call(_, z, A);
            else if (Array.isArray(K) && !K.includes(z)) return;
            if (A !== void 0 || $) O.items.push(sR_.createPair(z, A, q));
          };
        if (_ instanceof Map) for (let [z, A] of _) T(z, A);
        else if (_ && typeof _ === "object") for (let z of Object.keys(_)) T(z, _[z]);
        if (typeof H.sortMapEntries === "function") O.items.sort(H.sortMapEntries);
        return O;
      }
      add(H, _) {
        let q;
        if (K6H.isPair(H)) q = H;
        else if (!H || typeof H !== "object" || !("key" in H)) q = new sR_.Pair(H, H?.value);
        else q = new sR_.Pair(H.key, H.value);
        let $ = $QH(this.items, q.key),
          K = this.schema?.sortMapEntries;
        if ($) {
          if (!_) throw Error(`Key ${q.key} already set`);
          if (K6H.isScalar($.value) && oS4.isScalarValue(q.value)) $.value.value = q.value;
          else $.value = q.value;
        } else if (K) {
          let O = this.items.findIndex((T) => K(q, T) < 0);
          if (O === -1) this.items.push(q);
          else this.items.splice(O, 0, q);
        } else this.items.push(q);
      }
      delete(H) {
        let _ = $QH(this.items, H);
        if (!_) return !1;
        return this.items.splice(this.items.indexOf(_), 1).length > 0;
      }
      get(H, _) {
        let $ = $QH(this.items, H)?.value;
        return (!_ && K6H.isScalar($) ? $.value : $) ?? void 0;
      }
      has(H) {
        return !!$QH(this.items, H);
      }
      set(H, _) {
        this.add(new sR_.Pair(H, _), !0);
      }
      toJSON(H, _, q) {
        let $ = q ? new q() : _?.mapAsMap ? new Map() : {};
        if (_?.onCreate) _.onCreate($);
        for (let K of this.items) nS4.addPairToJSMap(_, $, K);
        return $;
      }
      toString(H, _, q) {
        if (!H) return JSON.stringify(this);
        for (let $ of this.items)
          if (!K6H.isPair($)) throw Error(`Map items must all be pairs; found ${JSON.stringify($)} instead`);
        if (!H.allNullValues && this.hasAllNullValues(!1)) H = Object.assign({}, H, { allNullValues: !0 });
        return iS4.stringifyCollection(this, H, {
          blockItemPrefix: "",
          flowChars: { start: "{", end: "}" },
          itemIndent: H.indent || "",
          onChompKeep: q,
          onComment: _,
        });
      }
    }
    $y6.YAMLMap = yrq;
    $y6.findPair = $QH;
  });
