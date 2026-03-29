  var eg6 = d((DqH) => {
    var Hy7;
    Object.defineProperty(DqH, "__esModule", { value: !0 });
    DqH.LRUCache = DqH.LinkedMap = DqH.Touch = void 0;
    var xG;
    (function (H) {
      (H.None = 0), (H.First = 1), (H.AsOld = H.First), (H.Last = 2), (H.AsNew = H.Last);
    })(xG || (DqH.Touch = xG = {}));
    class tg6 {
      constructor() {
        (this[Hy7] = "LinkedMap"),
          (this._map = new Map()),
          (this._head = void 0),
          (this._tail = void 0),
          (this._size = 0),
          (this._state = 0);
      }
      clear() {
        this._map.clear(), (this._head = void 0), (this._tail = void 0), (this._size = 0), this._state++;
      }
      isEmpty() {
        return !this._head && !this._tail;
      }
      get size() {
        return this._size;
      }
      get first() {
        return this._head?.value;
      }
      get last() {
        return this._tail?.value;
      }
      has(H) {
        return this._map.has(H);
      }
      get(H, _ = xG.None) {
        let q = this._map.get(H);
        if (!q) return;
        if (_ !== xG.None) this.touch(q, _);
        return q.value;
      }
      set(H, _, q = xG.None) {
        let $ = this._map.get(H);
        if ($) {
          if ((($.value = _), q !== xG.None)) this.touch($, q);
        } else {
          switch ((($ = { key: H, value: _, next: void 0, previous: void 0 }), q)) {
            case xG.None:
              this.addItemLast($);
              break;
            case xG.First:
              this.addItemFirst($);
              break;
            case xG.Last:
              this.addItemLast($);
              break;
            default:
              this.addItemLast($);
              break;
          }
          this._map.set(H, $), this._size++;
        }
        return this;
      }
      delete(H) {
        return !!this.remove(H);
      }
      remove(H) {
        let _ = this._map.get(H);
        if (!_) return;
        return this._map.delete(H), this.removeItem(_), this._size--, _.value;
      }
      shift() {
        if (!this._head && !this._tail) return;
        if (!this._head || !this._tail) throw Error("Invalid list");
        let H = this._head;
        return this._map.delete(H.key), this.removeItem(H), this._size--, H.value;
      }
      forEach(H, _) {
        let q = this._state,
          $ = this._head;
        while ($) {
          if (_) H.bind(_)($.value, $.key, this);
          else H($.value, $.key, this);
          if (this._state !== q) throw Error("LinkedMap got modified during iteration.");
          $ = $.next;
        }
      }
      keys() {
        let H = this._state,
          _ = this._head,
          q = {
            [Symbol.iterator]: () => {
              return q;
            },
            next: () => {
              if (this._state !== H) throw Error("LinkedMap got modified during iteration.");
              if (_) {
                let $ = { value: _.key, done: !1 };
                return (_ = _.next), $;
              } else return { value: void 0, done: !0 };
            },
          };
        return q;
      }
      values() {
        let H = this._state,
          _ = this._head,
          q = {
            [Symbol.iterator]: () => {
              return q;
            },
            next: () => {
              if (this._state !== H) throw Error("LinkedMap got modified during iteration.");
              if (_) {
                let $ = { value: _.value, done: !1 };
                return (_ = _.next), $;
              } else return { value: void 0, done: !0 };
            },
          };
        return q;
      }
      entries() {
        let H = this._state,
          _ = this._head,
          q = {
            [Symbol.iterator]: () => {
              return q;
            },
            next: () => {
              if (this._state !== H) throw Error("LinkedMap got modified during iteration.");
              if (_) {
                let $ = { value: [_.key, _.value], done: !1 };
                return (_ = _.next), $;
              } else return { value: void 0, done: !0 };
            },
          };
        return q;
      }
      [((Hy7 = Symbol.toStringTag), Symbol.iterator)]() {
        return this.entries();
      }
      trimOld(H) {
        if (H >= this.size) return;
        if (H === 0) {
          this.clear();
          return;
        }
        let _ = this._head,
          q = this.size;
        while (_ && q > H) this._map.delete(_.key), (_ = _.next), q--;
        if (((this._head = _), (this._size = q), _)) _.previous = void 0;
        this._state++;
      }
      addItemFirst(H) {
        if (!this._head && !this._tail) this._tail = H;
        else if (!this._head) throw Error("Invalid list");
        else (H.next = this._head), (this._head.previous = H);
        (this._head = H), this._state++;
      }
      addItemLast(H) {
        if (!this._head && !this._tail) this._head = H;
        else if (!this._tail) throw Error("Invalid list");
        else (H.previous = this._tail), (this._tail.next = H);
        (this._tail = H), this._state++;
      }
      removeItem(H) {
        if (H === this._head && H === this._tail) (this._head = void 0), (this._tail = void 0);
        else if (H === this._head) {
          if (!H.next) throw Error("Invalid list");
          (H.next.previous = void 0), (this._head = H.next);
        } else if (H === this._tail) {
          if (!H.previous) throw Error("Invalid list");
          (H.previous.next = void 0), (this._tail = H.previous);
        } else {
          let { next: _, previous: q } = H;
          if (!_ || !q) throw Error("Invalid list");
          (_.previous = q), (q.next = _);
        }
        (H.next = void 0), (H.previous = void 0), this._state++;
      }
      touch(H, _) {
        if (!this._head || !this._tail) throw Error("Invalid list");
        if (_ !== xG.First && _ !== xG.Last) return;
        if (_ === xG.First) {
          if (H === this._head) return;
          let { next: q, previous: $ } = H;
          if (H === this._tail) ($.next = void 0), (this._tail = $);
          else (q.previous = $), ($.next = q);
          (H.previous = void 0), (H.next = this._head), (this._head.previous = H), (this._head = H), this._state++;
        } else if (_ === xG.Last) {
          if (H === this._tail) return;
          let { next: q, previous: $ } = H;
          if (H === this._head) (q.previous = void 0), (this._head = q);
          else (q.previous = $), ($.next = q);
          (H.next = void 0), (H.previous = this._tail), (this._tail.next = H), (this._tail = H), this._state++;
        }
      }
      toJSON() {
        let H = [];
        return (
          this.forEach((_, q) => {
            H.push([q, _]);
          }),
          H
        );
      }
      fromJSON(H) {
        this.clear();
        for (let [_, q] of H) this.set(_, q);
      }
    }
    DqH.LinkedMap = tg6;
    class _y7 extends tg6 {
      constructor(H, _ = 1) {
        super();
        (this._limit = H), (this._ratio = Math.min(Math.max(0, _), 1));
      }
      get limit() {
        return this._limit;
      }
      set limit(H) {
        (this._limit = H), this.checkTrim();
      }
      get ratio() {
        return this._ratio;
      }
      set ratio(H) {
        (this._ratio = Math.min(Math.max(0, H), 1)), this.checkTrim();
      }
      get(H, _ = xG.AsNew) {
        return super.get(H, _);
      }
      peek(H) {
        return super.get(H, xG.None);
      }
      set(H, _) {
        return super.set(H, _, xG.Last), this.checkTrim(), this;
      }
      checkTrim() {
        if (this.size > this._limit) this.trimOld(Math.round(this._limit * this._ratio));
      }
    }
    DqH.LRUCache = _y7;
  });
