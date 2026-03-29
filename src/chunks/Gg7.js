  var Gg7 = d((VQ6) => {
    Object.defineProperty(VQ6, "t", { value: !0 });
    class yQ6 {
      constructor(H, _, q = 1) {
        (this.i = void 0), (this.h = void 0), (this.o = void 0), (this.u = H), (this.l = _), (this.p = q);
      }
      I() {
        let H = this,
          _ = H.o.o === H;
        if (_ && H.p === 1) H = H.h;
        else if (H.i) {
          H = H.i;
          while (H.h) H = H.h;
        } else {
          if (_) return H.o;
          let q = H.o;
          while (q.i === H) (H = q), (q = H.o);
          H = q;
        }
        return H;
      }
      B() {
        let H = this;
        if (H.h) {
          H = H.h;
          while (H.i) H = H.i;
          return H;
        } else {
          let _ = H.o;
          while (_.h === H) (H = _), (_ = H.o);
          if (H.h !== _) return _;
          else return H;
        }
      }
      _() {
        let H = this.o,
          _ = this.h,
          q = _.i;
        if (H.o === this) H.o = _;
        else if (H.i === this) H.i = _;
        else H.h = _;
        if (((_.o = H), (_.i = this), (this.o = _), (this.h = q), q)) q.o = this;
        return _;
      }
      g() {
        let H = this.o,
          _ = this.i,
          q = _.h;
        if (H.o === this) H.o = _;
        else if (H.i === this) H.i = _;
        else H.h = _;
        if (((_.o = H), (_.h = this), (this.o = _), (this.i = q), q)) q.o = this;
        return _;
      }
    }
    class Dg7 extends yQ6 {
      constructor() {
        super(...arguments);
        this.M = 1;
      }
      _() {
        let H = super._();
        return this.O(), H.O(), H;
      }
      g() {
        let H = super.g();
        return this.O(), H.O(), H;
      }
      O() {
        if (((this.M = 1), this.i)) this.M += this.i.M;
        if (this.h) this.M += this.h.M;
      }
    }
    class jg7 {
      constructor(H = 0) {
        this.iteratorType = H;
      }
      equals(H) {
        return this.T === H.T;
      }
    }
    class Mg7 {
      constructor() {
        this.m = 0;
      }
      get length() {
        return this.m;
      }
      size() {
        return this.m;
      }
      empty() {
        return this.m === 0;
      }
    }
    class Jg7 extends Mg7 {}
    function bAH() {
      throw RangeError("Iterator access denied!");
    }
    class Pg7 extends Jg7 {
      constructor(
        H = function (q, $) {
          if (q < $) return -1;
          if (q > $) return 1;
          return 0;
        },
        _ = !1,
      ) {
        super();
        (this.v = void 0), (this.A = H), (this.enableIndex = _), (this.N = _ ? Dg7 : yQ6), (this.C = new this.N());
      }
      R(H, _) {
        let q = this.C;
        while (H) {
          let $ = this.A(H.u, _);
          if ($ < 0) H = H.h;
          else if ($ > 0) (q = H), (H = H.i);
          else return H;
        }
        return q;
      }
      K(H, _) {
        let q = this.C;
        while (H)
          if (this.A(H.u, _) <= 0) H = H.h;
          else (q = H), (H = H.i);
        return q;
      }
      L(H, _) {
        let q = this.C;
        while (H) {
          let $ = this.A(H.u, _);
          if ($ < 0) (q = H), (H = H.h);
          else if ($ > 0) H = H.i;
          else return H;
        }
        return q;
      }
      k(H, _) {
        let q = this.C;
        while (H)
          if (this.A(H.u, _) < 0) (q = H), (H = H.h);
          else H = H.i;
        return q;
      }
      P(H) {
        while (!0) {
          let _ = H.o;
          if (_ === this.C) return;
          if (H.p === 1) {
            H.p = 0;
            return;
          }
          if (H === _.i) {
            let q = _.h;
            if (q.p === 1)
              if (((q.p = 0), (_.p = 1), _ === this.v)) this.v = _._();
              else _._();
            else if (q.h && q.h.p === 1) {
              if (((q.p = _.p), (_.p = 0), (q.h.p = 0), _ === this.v)) this.v = _._();
              else _._();
              return;
            } else if (q.i && q.i.p === 1) (q.p = 1), (q.i.p = 0), q.g();
            else (q.p = 1), (H = _);
          } else {
            let q = _.i;
            if (q.p === 1)
              if (((q.p = 0), (_.p = 1), _ === this.v)) this.v = _.g();
              else _.g();
            else if (q.i && q.i.p === 1) {
              if (((q.p = _.p), (_.p = 0), (q.i.p = 0), _ === this.v)) this.v = _.g();
              else _.g();
              return;
            } else if (q.h && q.h.p === 1) (q.p = 1), (q.h.p = 0), q._();
            else (q.p = 1), (H = _);
          }
        }
      }
      S(H) {
        if (this.m === 1) {
          this.clear();
          return;
        }
        let _ = H;
        while (_.i || _.h) {
          if (_.h) {
            _ = _.h;
            while (_.i) _ = _.i;
          } else _ = _.i;
          let $ = H.u;
          (H.u = _.u), (_.u = $);
          let K = H.l;
          (H.l = _.l), (_.l = K), (H = _);
        }
        if (this.C.i === _) this.C.i = _.o;
        else if (this.C.h === _) this.C.h = _.o;
        this.P(_);
        let q = _.o;
        if (_ === q.i) q.i = void 0;
        else q.h = void 0;
        if (((this.m -= 1), (this.v.p = 0), this.enableIndex)) while (q !== this.C) (q.M -= 1), (q = q.o);
      }
      U(H) {
        let _ = typeof H === "number" ? H : void 0,
          q = typeof H === "function" ? H : void 0,
          $ = typeof H > "u" ? [] : void 0,
          K = 0,
          O = this.v,
          T = [];
        while (T.length || O)
          if (O) T.push(O), (O = O.i);
          else {
            if (((O = T.pop()), K === _)) return O;
            $ && $.push(O), q && q(O, K, this), (K += 1), (O = O.h);
          }
        return $;
      }
      j(H) {
        while (!0) {
          let _ = H.o;
          if (_.p === 0) return;
          let q = _.o;
          if (_ === q.i) {
            let $ = q.h;
            if ($ && $.p === 1) {
              if ((($.p = _.p = 0), q === this.v)) return;
              (q.p = 1), (H = q);
              continue;
            } else if (H === _.h) {
              if (((H.p = 0), H.i)) H.i.o = _;
              if (H.h) H.h.o = q;
              if (((_.h = H.i), (q.i = H.h), (H.i = _), (H.h = q), q === this.v)) (this.v = H), (this.C.o = H);
              else {
                let K = q.o;
                if (K.i === q) K.i = H;
                else K.h = H;
              }
              (H.o = q.o), (_.o = H), (q.o = H), (q.p = 1);
            } else {
              if (((_.p = 0), q === this.v)) this.v = q.g();
              else q.g();
              q.p = 1;
              return;
            }
          } else {
            let $ = q.i;
            if ($ && $.p === 1) {
              if ((($.p = _.p = 0), q === this.v)) return;
              (q.p = 1), (H = q);
              continue;
            } else if (H === _.i) {
              if (((H.p = 0), H.i)) H.i.o = q;
              if (H.h) H.h.o = _;
              if (((q.h = H.i), (_.i = H.h), (H.i = q), (H.h = _), q === this.v)) (this.v = H), (this.C.o = H);
              else {
                let K = q.o;
                if (K.i === q) K.i = H;
                else K.h = H;
              }
              (H.o = q.o), (_.o = H), (q.o = H), (q.p = 1);
            } else {
              if (((_.p = 0), q === this.v)) this.v = q._();
              else q._();
              q.p = 1;
              return;
            }
          }
          if (this.enableIndex) _.O(), q.O(), H.O();
          return;
        }
      }
      q(H, _, q) {
        if (this.v === void 0)
          return (
            (this.m += 1),
            (this.v = new this.N(H, _, 0)),
            (this.v.o = this.C),
            (this.C.o = this.C.i = this.C.h = this.v),
            this.m
          );
        let $,
          K = this.C.i,
          O = this.A(K.u, H);
        if (O === 0) return (K.l = _), this.m;
        else if (O > 0) (K.i = new this.N(H, _)), (K.i.o = K), ($ = K.i), (this.C.i = $);
        else {
          let T = this.C.h,
            z = this.A(T.u, H);
          if (z === 0) return (T.l = _), this.m;
          else if (z < 0) (T.h = new this.N(H, _)), (T.h.o = T), ($ = T.h), (this.C.h = $);
          else {
            if (q !== void 0) {
              let A = q.T;
              if (A !== this.C) {
                let f = this.A(A.u, H);
                if (f === 0) return (A.l = _), this.m;
                else if (f > 0) {
                  let w = A.I(),
                    Y = this.A(w.u, H);
                  if (Y === 0) return (w.l = _), this.m;
                  else if (Y < 0)
                    if ((($ = new this.N(H, _)), w.h === void 0)) (w.h = $), ($.o = w);
                    else (A.i = $), ($.o = A);
                }
              }
            }
            if ($ === void 0) {
              $ = this.v;
              while (!0) {
                let A = this.A($.u, H);
                if (A > 0) {
                  if ($.i === void 0) {
                    ($.i = new this.N(H, _)), ($.i.o = $), ($ = $.i);
                    break;
                  }
                  $ = $.i;
                } else if (A < 0) {
                  if ($.h === void 0) {
                    ($.h = new this.N(H, _)), ($.h.o = $), ($ = $.h);
                    break;
                  }
                  $ = $.h;
                } else return ($.l = _), this.m;
              }
            }
          }
        }
        if (this.enableIndex) {
          let T = $.o;
          while (T !== this.C) (T.M += 1), (T = T.o);
        }
        return this.j($), (this.m += 1), this.m;
      }
      H(H, _) {
        while (H) {
          let q = this.A(H.u, _);
          if (q < 0) H = H.h;
          else if (q > 0) H = H.i;
          else return H;
        }
        return H || this.C;
      }
      clear() {
        (this.m = 0), (this.v = void 0), (this.C.o = void 0), (this.C.i = this.C.h = void 0);
      }
      updateKeyByIterator(H, _) {
        let q = H.T;
        if (q === this.C) bAH();
        if (this.m === 1) return (q.u = _), !0;
        let $ = q.B().u;
        if (q === this.C.i) {
          if (this.A($, _) > 0) return (q.u = _), !0;
          return !1;
        }
        let K = q.I().u;
        if (q === this.C.h) {
          if (this.A(K, _) < 0) return (q.u = _), !0;
          return !1;
        }
        if (this.A(K, _) >= 0 || this.A($, _) <= 0) return !1;
        return (q.u = _), !0;
      }
      eraseElementByPos(H) {
        if (H < 0 || H > this.m - 1) throw RangeError();
        let _ = this.U(H);
        return this.S(_), this.m;
      }
      eraseElementByKey(H) {
        if (this.m === 0) return !1;
        let _ = this.H(this.v, H);
        if (_ === this.C) return !1;
        return this.S(_), !0;
      }
      eraseElementByIterator(H) {
        let _ = H.T;
        if (_ === this.C) bAH();
        let q = _.h === void 0;
        if (H.iteratorType === 0) {
          if (q) H.next();
        } else if (!q || _.i === void 0) H.next();
        return this.S(_), H;
      }
      getHeight() {
        if (this.m === 0) return 0;
        function H(_) {
          if (!_) return 0;
          return Math.max(H(_.i), H(_.h)) + 1;
        }
        return H(this.v);
      }
    }
    class Xg7 extends jg7 {
      constructor(H, _, q) {
        super(q);
        if (((this.T = H), (this.C = _), this.iteratorType === 0))
          (this.pre = function () {
            if (this.T === this.C.i) bAH();
            return (this.T = this.T.I()), this;
          }),
            (this.next = function () {
              if (this.T === this.C) bAH();
              return (this.T = this.T.B()), this;
            });
        else
          (this.pre = function () {
            if (this.T === this.C.h) bAH();
            return (this.T = this.T.B()), this;
          }),
            (this.next = function () {
              if (this.T === this.C) bAH();
              return (this.T = this.T.I()), this;
            });
      }
      get index() {
        let H = this.T,
          _ = this.C.o;
        if (H === this.C) {
          if (_) return _.M - 1;
          return 0;
        }
        let q = 0;
        if (H.i) q += H.i.M;
        while (H !== _) {
          let $ = H.o;
          if (H === $.h) {
            if (((q += 1), $.i)) q += $.i.M;
          }
          H = $;
        }
        return q;
      }
      isAccessible() {
        return this.T !== this.C;
      }
    }
    class Km extends Xg7 {
      constructor(H, _, q, $) {
        super(H, _, $);
        this.container = q;
      }
      get pointer() {
        if (this.T === this.C) bAH();
        let H = this;
        return new Proxy([], {
          get(_, q) {
            if (q === "0") return H.T.u;
            else if (q === "1") return H.T.l;
            return (_[0] = H.T.u), (_[1] = H.T.l), _[q];
          },
          set(_, q, $) {
            if (q !== "1") throw TypeError("prop must be 1");
            return (H.T.l = $), !0;
          },
        });
      }
      copy() {
        return new Km(this.T, this.C, this.container, this.iteratorType);
      }
    }
    class Wg7 extends Pg7 {
      constructor(H = [], _, q) {
        super(_, q);
        let $ = this;
        H.forEach(function (K) {
          $.setElement(K[0], K[1]);
        });
      }
      begin() {
        return new Km(this.C.i || this.C, this.C, this);
      }
      end() {
        return new Km(this.C, this.C, this);
      }
      rBegin() {
        return new Km(this.C.h || this.C, this.C, this, 1);
      }
      rEnd() {
        return new Km(this.C, this.C, this, 1);
      }
      front() {
        if (this.m === 0) return;
        let H = this.C.i;
        return [H.u, H.l];
      }
      back() {
        if (this.m === 0) return;
        let H = this.C.h;
        return [H.u, H.l];
      }
      lowerBound(H) {
        let _ = this.R(this.v, H);
        return new Km(_, this.C, this);
      }
      upperBound(H) {
        let _ = this.K(this.v, H);
        return new Km(_, this.C, this);
      }
      reverseLowerBound(H) {
        let _ = this.L(this.v, H);
        return new Km(_, this.C, this);
      }
      reverseUpperBound(H) {
        let _ = this.k(this.v, H);
        return new Km(_, this.C, this);
      }
      forEach(H) {
        this.U(function (_, q, $) {
          H([_.u, _.l], q, $);
        });
      }
      setElement(H, _, q) {
        return this.q(H, _, q);
      }
      getElementByPos(H) {
        if (H < 0 || H > this.m - 1) throw RangeError();
        let _ = this.U(H);
        return [_.u, _.l];
      }
      find(H) {
        let _ = this.H(this.v, H);
        return new Km(_, this.C, this);
      }
      getElementByKey(H) {
        return this.H(this.v, H).l;
      }
      union(H) {
        let _ = this;
        return (
          H.forEach(function (q) {
            _.setElement(q[0], q[1]);
          }),
          this.m
        );
      }
      *[Symbol.iterator]() {
        let H = this.m,
          _ = this.U();
        for (let q = 0; q < H; ++q) {
          let $ = _[q];
          yield [$.u, $.l];
        }
      }
    }
    VQ6.OrderedMap = Wg7;
  });
