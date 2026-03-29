    uA();
    OR8();
    TR8 = Symbol("internals");
    nuH = class nuH {
      constructor(H) {
        H && this.set(H);
      }
      set(H, _, q) {
        let $ = this;
        function K(T, z, A) {
          let f = iuH(z);
          if (!f) throw Error("header name must be a non-empty string");
          let w = Q_.findKey($, f);
          if (!w || $[w] === void 0 || A === !0 || (A === void 0 && $[w] !== !1)) $[w || z] = W5_(T);
        }
        let O = (T, z) => Q_.forEach(T, (A, f) => K(A, f, z));
        if (Q_.isPlainObject(H) || H instanceof this.constructor) O(H, _);
        else if (Q_.isString(H) && (H = H.trim()) && !GY$(H)) O(KR8(H), _);
        else if (Q_.isObject(H) && Q_.isIterable(H)) {
          let T = {},
            z,
            A;
          for (let f of H) {
            if (!Q_.isArray(f)) throw TypeError("Object iterator must return a key-value pair");
            T[(A = f[0])] = (z = T[A]) ? (Q_.isArray(z) ? [...z, f[1]] : [z, f[1]]) : f[1];
          }
          O(T, _);
        } else H != null && K(_, H, q);
        return this;
      }
      get(H, _) {
        if (((H = iuH(H)), H)) {
          let q = Q_.findKey(this, H);
          if (q) {
            let $ = this[q];
            if (!_) return $;
            if (_ === !0) return WY$($);
            if (Q_.isFunction(_)) return _.call(this, $, q);
            if (Q_.isRegExp(_)) return _.exec($);
            throw TypeError("parser must be boolean|regexp|function");
          }
        }
      }
      has(H, _) {
        if (((H = iuH(H)), H)) {
          let q = Q_.findKey(this, H);
          return !!(q && this[q] !== void 0 && (!_ || b$6(this, this[q], q, _)));
        }
        return !1;
      }
      delete(H, _) {
        let q = this,
          $ = !1;
        function K(O) {
          if (((O = iuH(O)), O)) {
            let T = Q_.findKey(q, O);
            if (T && (!_ || b$6(q, q[T], T, _))) delete q[T], ($ = !0);
          }
        }
        if (Q_.isArray(H)) H.forEach(K);
        else K(H);
        return $;
      }
      clear(H) {
        let _ = Object.keys(this),
          q = _.length,
          $ = !1;
        while (q--) {
          let K = _[q];
          if (!H || b$6(this, this[K], K, H, !0)) delete this[K], ($ = !0);
        }
        return $;
      }
      normalize(H) {
        let _ = this,
          q = {};
        return (
          Q_.forEach(this, ($, K) => {
            let O = Q_.findKey(q, K);
            if (O) {
              (_[O] = W5_($)), delete _[K];
              return;
            }
            let T = H ? RY$(K) : String(K).trim();
            if (T !== K) delete _[K];
            (_[T] = W5_($)), (q[T] = !0);
          }),
          this
        );
      }
      concat(...H) {
        return this.constructor.concat(this, ...H);
      }
      toJSON(H) {
        let _ = Object.create(null);
        return (
          Q_.forEach(this, (q, $) => {
            q != null && q !== !1 && (_[$] = H && Q_.isArray(q) ? q.join(", ") : q);
          }),
          _
        );
      }
      [Symbol.iterator]() {
        return Object.entries(this.toJSON())[Symbol.iterator]();
      }
      toString() {
        return Object.entries(this.toJSON())
          .map(([H, _]) => H + ": " + _)
          .join(`
`);
      }
      getSetCookie() {
        return this.get("set-cookie") || [];
      }
      get [Symbol.toStringTag]() {
        return "AxiosHeaders";
      }
      static from(H) {
        return H instanceof this ? H : new this(H);
      }
      static concat(H, ..._) {
        let q = new this(H);
        return _.forEach(($) => q.set($)), q;
      }
      static accessor(H) {
        let q = (this[TR8] = this[TR8] = { accessors: {} }).accessors,
          $ = this.prototype;
        function K(O) {
          let T = iuH(O);
          if (!q[T]) ZY$($, O), (q[T] = !0);
        }
        return Q_.isArray(H) ? H.forEach(K) : K(H), this;
      }
    };
    nuH.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
    Q_.reduceDescriptors(nuH.prototype, ({ value: H }, _) => {
      let q = _[0].toUpperCase() + _.slice(1);
      return {
        get: () => H,
        set($) {
          this[q] = $;
        },
      };
    });
    Q_.freezeMethods(nuH);
    zY = nuH;
