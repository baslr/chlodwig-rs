    (YjH =
      typeof performance === "object" && performance && typeof performance.now === "function" ? performance : Date),
      (gj8 = new Set()),
      (T_6 = typeof process === "object" && !!process ? process : {}),
      (O1_ = globalThis.AbortController),
      (Bj8 = globalThis.AbortSignal);
    if (typeof O1_ > "u") {
      (Bj8 = class {
        onabort;
        _onabort = [];
        reason;
        aborted = !1;
        addEventListener($, K) {
          this._onabort.push(K);
        }
      }),
        (O1_ = class {
          constructor() {
            _();
          }
          signal = new Bj8();
          abort($) {
            if (this.signal.aborted) return;
            (this.signal.reason = $), (this.signal.aborted = !0);
            for (let K of this.signal._onabort) K($);
            this.signal.onabort?.($);
          }
        });
      let H = T_6.env?.LRU_CACHE_IGNORE_AC_WARNING !== "1",
        _ = () => {
          if (!H) return;
          (H = !1),
            dj8(
              "AbortController is not defined. If using lru-cache in node 14, load an AbortController polyfill from the `node-abort-controller` package. A minimal polyfill is provided for use by LRUCache.fetch(), but it should not be relied upon in other contexts (eg, passing it to other APIs that use AbortController/AbortSignal might have undesirable effects). You may disable this with LRU_CACHE_IGNORE_AC_WARNING=1 in the env.",
              "NO_ABORT_CONTROLLER",
              "ENOTSUP",
              _,
            );
        };
    }
    LFK = Symbol("type");
    XIH = class XIH extends Array {
      constructor(H) {
        super(H);
        this.fill(0);
      }
    };
    UL = class UL {
      #$;
      #q;
      #H;
      #f;
      #T;
      #z;
      ttl;
      ttlResolution;
      ttlAutopurge;
      updateAgeOnGet;
      updateAgeOnHas;
      allowStale;
      noDisposeOnSet;
      noUpdateTTL;
      maxEntrySize;
      sizeCalculation;
      noDeleteOnFetchRejection;
      noDeleteOnStaleGet;
      allowStaleOnFetchAbort;
      allowStaleOnFetchRejection;
      ignoreFetchAbort;
      #K;
      #w;
      #A;
      #O;
      #_;
      #D;
      #P;
      #M;
      #Y;
      #X;
      #J;
      #G;
      #L;
      #R;
      #Z;
      #v;
      #W;
      static unsafeExposeInternals(H) {
        return {
          starts: H.#L,
          ttls: H.#R,
          sizes: H.#G,
          keyMap: H.#A,
          keyList: H.#O,
          valList: H.#_,
          next: H.#D,
          prev: H.#P,
          get head() {
            return H.#M;
          },
          get tail() {
            return H.#Y;
          },
          free: H.#X,
          isBackgroundFetch: (_) => H.#j(_),
          backgroundFetch: (_, q, $, K) => H.#m(_, q, $, K),
          moveToTail: (_) => H.#I(_),
          indexes: (_) => H.#h(_),
          rindexes: (_) => H.#y(_),
          isStale: (_) => H.#k(_),
        };
      }
      get max() {
        return this.#$;
      }
      get maxSize() {
        return this.#q;
      }
      get calculatedSize() {
        return this.#w;
      }
      get size() {
        return this.#K;
      }
      get fetchMethod() {
        return this.#T;
      }
      get memoMethod() {
        return this.#z;
      }
      get dispose() {
        return this.#H;
      }
      get disposeAfter() {
        return this.#f;
      }
      constructor(H) {
        let {
          max: _ = 0,
          ttl: q,
          ttlResolution: $ = 1,
          ttlAutopurge: K,
          updateAgeOnGet: O,
          updateAgeOnHas: T,
          allowStale: z,
          dispose: A,
          disposeAfter: f,
          noDisposeOnSet: w,
          noUpdateTTL: Y,
          maxSize: D = 0,
          maxEntrySize: j = 0,
          sizeCalculation: M,
          fetchMethod: J,
          memoMethod: P,
          noDeleteOnFetchRejection: X,
          noDeleteOnStaleGet: R,
          allowStaleOnFetchRejection: W,
          allowStaleOnFetchAbort: Z,
          ignoreFetchAbort: k,
        } = H;
        if (_ !== 0 && !Dt(_)) throw TypeError("max option must be a nonnegative integer");
        let v = _ ? cj8(_) : Array;
        if (!v) throw Error("invalid max value: " + _);
        if (
          ((this.#$ = _),
          (this.#q = D),
          (this.maxEntrySize = j || this.#q),
          (this.sizeCalculation = M),
          this.sizeCalculation)
        ) {
          if (!this.#q && !this.maxEntrySize)
            throw TypeError("cannot set sizeCalculation without setting maxSize or maxEntrySize");
          if (typeof this.sizeCalculation !== "function") throw TypeError("sizeCalculation set to non-function");
        }
        if (P !== void 0 && typeof P !== "function") throw TypeError("memoMethod must be a function if defined");
        if (((this.#z = P), J !== void 0 && typeof J !== "function"))
          throw TypeError("fetchMethod must be a function if specified");
        if (
          ((this.#T = J),
          (this.#v = !!J),
          (this.#A = new Map()),
          (this.#O = Array(_).fill(void 0)),
          (this.#_ = Array(_).fill(void 0)),
          (this.#D = new v(_)),
          (this.#P = new v(_)),
          (this.#M = 0),
          (this.#Y = 0),
          (this.#X = DjH.create(_)),
          (this.#K = 0),
          (this.#w = 0),
          typeof A === "function")
        )
          this.#H = A;
        if (typeof f === "function") (this.#f = f), (this.#J = []);
        else (this.#f = void 0), (this.#J = void 0);
        if (
          ((this.#Z = !!this.#H),
          (this.#W = !!this.#f),
          (this.noDisposeOnSet = !!w),
          (this.noUpdateTTL = !!Y),
          (this.noDeleteOnFetchRejection = !!X),
          (this.allowStaleOnFetchRejection = !!W),
          (this.allowStaleOnFetchAbort = !!Z),
          (this.ignoreFetchAbort = !!k),
          this.maxEntrySize !== 0)
        ) {
          if (this.#q !== 0) {
            if (!Dt(this.#q)) throw TypeError("maxSize must be a positive integer if specified");
          }
          if (!Dt(this.maxEntrySize)) throw TypeError("maxEntrySize must be a positive integer if specified");
          this.#c();
        }
        if (
          ((this.allowStale = !!z),
          (this.noDeleteOnStaleGet = !!R),
          (this.updateAgeOnGet = !!O),
          (this.updateAgeOnHas = !!T),
          (this.ttlResolution = Dt($) || $ === 0 ? $ : 1),
          (this.ttlAutopurge = !!K),
          (this.ttl = q || 0),
          this.ttl)
        ) {
          if (!Dt(this.ttl)) throw TypeError("ttl must be a positive integer if specified");
          this.#C();
        }
        if (this.#$ === 0 && this.ttl === 0 && this.#q === 0)
          throw TypeError("At least one of max, maxSize, or ttl is required");
        if (!this.ttlAutopurge && !this.#$ && !this.#q) {
          if (S5$("LRU_CACHE_UNBOUNDED"))
            gj8.add("LRU_CACHE_UNBOUNDED"),
              dj8(
                "TTL caching without ttlAutopurge, max, or maxSize can result in unbounded memory consumption.",
                "UnboundedCacheWarning",
                "LRU_CACHE_UNBOUNDED",
                UL,
              );
        }
      }
      getRemainingTTL(H) {
        return this.#A.has(H) ? 1 / 0 : 0;
      }
      #C() {
        let H = new XIH(this.#$),
          _ = new XIH(this.#$);
        (this.#R = H),
          (this.#L = _),
          (this.#E = (K, O, T = YjH.now()) => {
            if (((_[K] = O !== 0 ? T : 0), (H[K] = O), O !== 0 && this.ttlAutopurge)) {
              let z = setTimeout(() => {
                if (this.#k(K)) this.#V(this.#O[K], "expire");
              }, O + 1);
              if (z.unref) z.unref();
            }
          }),
          (this.#S = (K) => {
            _[K] = H[K] !== 0 ? YjH.now() : 0;
          }),
          (this.#N = (K, O) => {
            if (H[O]) {
              let T = H[O],
                z = _[O];
              if (!T || !z) return;
              (K.ttl = T), (K.start = z), (K.now = q || $());
              let A = K.now - z;
              K.remainingTTL = T - A;
            }
          });
        let q = 0,
          $ = () => {
            let K = YjH.now();
            if (this.ttlResolution > 0) {
              q = K;
              let O = setTimeout(() => (q = 0), this.ttlResolution);
              if (O.unref) O.unref();
            }
            return K;
          };
        (this.getRemainingTTL = (K) => {
          let O = this.#A.get(K);
          if (O === void 0) return 0;
          let T = H[O],
            z = _[O];
          if (!T || !z) return 1 / 0;
          let A = (q || $()) - z;
          return T - A;
        }),
          (this.#k = (K) => {
            let O = _[K],
              T = H[K];
            return !!T && !!O && (q || $()) - O > T;
          });
      }
      #S = () => {};
      #N = () => {};
      #E = () => {};
      #k = () => !1;
      #c() {
        let H = new XIH(this.#$);
        (this.#w = 0),
          (this.#G = H),
          (this.#b = (_) => {
            (this.#w -= H[_]), (H[_] = 0);
          }),
          (this.#p = (_, q, $, K) => {
            if (this.#j(q)) return 0;
            if (!Dt($))
              if (K) {
                if (typeof K !== "function") throw TypeError("sizeCalculation must be a function");
                if ((($ = K(q, _)), !Dt($)))
                  throw TypeError("sizeCalculation return invalid (expect positive integer)");
              } else
                throw TypeError(
                  "invalid size value (must be positive integer). When maxSize or maxEntrySize is used, sizeCalculation or size must be set.",
                );
            return $;
          }),
          (this.#u = (_, q, $) => {
            if (((H[_] = q), this.#q)) {
              let K = this.#q - H[_];
              while (this.#w > K) this.#x(!0);
            }
            if (((this.#w += H[_]), $)) ($.entrySize = q), ($.totalCalculatedSize = this.#w);
          });
      }
      #b = (H) => {};
      #u = (H, _, q) => {};
      #p = (H, _, q, $) => {
        if (q || $) throw TypeError("cannot set size without setting maxSize or maxEntrySize on cache");
        return 0;
      };
      *#h({ allowStale: H = this.allowStale } = {}) {
        if (this.#K)
          for (let _ = this.#Y; ; ) {
            if (!this.#B(_)) break;
            if (H || !this.#k(_)) yield _;
            if (_ === this.#M) break;
            else _ = this.#P[_];
          }
      }
      *#y({ allowStale: H = this.allowStale } = {}) {
        if (this.#K)
          for (let _ = this.#M; ; ) {
            if (!this.#B(_)) break;
            if (H || !this.#k(_)) yield _;
            if (_ === this.#Y) break;
            else _ = this.#D[_];
          }
      }
      #B(H) {
        return H !== void 0 && this.#A.get(this.#O[H]) === H;
      }
      *entries() {
        for (let H of this.#h())
          if (this.#_[H] !== void 0 && this.#O[H] !== void 0 && !this.#j(this.#_[H])) yield [this.#O[H], this.#_[H]];
      }
      *rentries() {
        for (let H of this.#y())
          if (this.#_[H] !== void 0 && this.#O[H] !== void 0 && !this.#j(this.#_[H])) yield [this.#O[H], this.#_[H]];
      }
      *keys() {
        for (let H of this.#h()) {
          let _ = this.#O[H];
          if (_ !== void 0 && !this.#j(this.#_[H])) yield _;
        }
      }
      *rkeys() {
        for (let H of this.#y()) {
          let _ = this.#O[H];
          if (_ !== void 0 && !this.#j(this.#_[H])) yield _;
        }
      }
      *values() {
        for (let H of this.#h()) if (this.#_[H] !== void 0 && !this.#j(this.#_[H])) yield this.#_[H];
      }
      *rvalues() {
        for (let H of this.#y()) if (this.#_[H] !== void 0 && !this.#j(this.#_[H])) yield this.#_[H];
      }
      [Symbol.iterator]() {
        return this.entries();
      }
      [Symbol.toStringTag] = "LRUCache";
      find(H, _ = {}) {
        for (let q of this.#h()) {
          let $ = this.#_[q],
            K = this.#j($) ? $.__staleWhileFetching : $;
          if (K === void 0) continue;
          if (H(K, this.#O[q], this)) return this.get(this.#O[q], _);
        }
      }
      forEach(H, _ = this) {
        for (let q of this.#h()) {
          let $ = this.#_[q],
            K = this.#j($) ? $.__staleWhileFetching : $;
          if (K === void 0) continue;
          H.call(_, K, this.#O[q], this);
        }
      }
      rforEach(H, _ = this) {
        for (let q of this.#y()) {
          let $ = this.#_[q],
            K = this.#j($) ? $.__staleWhileFetching : $;
          if (K === void 0) continue;
          H.call(_, K, this.#O[q], this);
        }
      }
      purgeStale() {
        let H = !1;
        for (let _ of this.#y({ allowStale: !0 })) if (this.#k(_)) this.#V(this.#O[_], "expire"), (H = !0);
        return H;
      }
      info(H) {
        let _ = this.#A.get(H);
        if (_ === void 0) return;
        let q = this.#_[_],
          $ = this.#j(q) ? q.__staleWhileFetching : q;
        if ($ === void 0) return;
        let K = { value: $ };
        if (this.#R && this.#L) {
          let O = this.#R[_],
            T = this.#L[_];
          if (O && T) {
            let z = O - (YjH.now() - T);
            (K.ttl = z), (K.start = Date.now());
          }
        }
        if (this.#G) K.size = this.#G[_];
        return K;
      }
      dump() {
        let H = [];
        for (let _ of this.#h({ allowStale: !0 })) {
          let q = this.#O[_],
            $ = this.#_[_],
            K = this.#j($) ? $.__staleWhileFetching : $;
          if (K === void 0 || q === void 0) continue;
          let O = { value: K };
          if (this.#R && this.#L) {
            O.ttl = this.#R[_];
            let T = YjH.now() - this.#L[_];
            O.start = Math.floor(Date.now() - T);
          }
          if (this.#G) O.size = this.#G[_];
          H.unshift([q, O]);
        }
        return H;
      }
      load(H) {
        this.clear();
        for (let [_, q] of H) {
          if (q.start) {
            let $ = Date.now() - q.start;
            q.start = YjH.now() - $;
          }
          this.set(_, q.value, q);
        }
      }
      set(H, _, q = {}) {
        if (_ === void 0) return this.delete(H), this;
        let {
            ttl: $ = this.ttl,
            start: K,
            noDisposeOnSet: O = this.noDisposeOnSet,
            sizeCalculation: T = this.sizeCalculation,
            status: z,
          } = q,
          { noUpdateTTL: A = this.noUpdateTTL } = q,
          f = this.#p(H, _, q.size || 0, T);
        if (this.maxEntrySize && f > this.maxEntrySize) {
          if (z) (z.set = "miss"), (z.maxEntrySizeExceeded = !0);
          return this.#V(H, "set"), this;
        }
        let w = this.#K === 0 ? void 0 : this.#A.get(H);
        if (w === void 0) {
          if (
            ((w =
              this.#K === 0
                ? this.#Y
                : this.#X.length !== 0
                  ? this.#X.pop()
                  : this.#K === this.#$
                    ? this.#x(!1)
                    : this.#K),
            (this.#O[w] = H),
            (this.#_[w] = _),
            this.#A.set(H, w),
            (this.#D[this.#Y] = w),
            (this.#P[w] = this.#Y),
            (this.#Y = w),
            this.#K++,
            this.#u(w, f, z),
            z)
          )
            z.set = "add";
          A = !1;
        } else {
          this.#I(w);
          let Y = this.#_[w];
          if (_ !== Y) {
            if (this.#v && this.#j(Y)) {
              Y.__abortController.abort(Error("replaced"));
              let { __staleWhileFetching: D } = Y;
              if (D !== void 0 && !O) {
                if (this.#Z) this.#H?.(D, H, "set");
                if (this.#W) this.#J?.push([D, H, "set"]);
              }
            } else if (!O) {
              if (this.#Z) this.#H?.(Y, H, "set");
              if (this.#W) this.#J?.push([Y, H, "set"]);
            }
            if ((this.#b(w), this.#u(w, f, z), (this.#_[w] = _), z)) {
              z.set = "replace";
              let D = Y && this.#j(Y) ? Y.__staleWhileFetching : Y;
              if (D !== void 0) z.oldValue = D;
            }
          } else if (z) z.set = "update";
        }
        if ($ !== 0 && !this.#R) this.#C();
        if (this.#R) {
          if (!A) this.#E(w, $, K);
          if (z) this.#N(z, w);
        }
        if (!O && this.#W && this.#J) {
          let Y = this.#J,
            D;
          while ((D = Y?.shift())) this.#f?.(...D);
        }
        return this;
      }
      pop() {
        try {
          while (this.#K) {
            let H = this.#_[this.#M];
            if ((this.#x(!0), this.#j(H))) {
              if (H.__staleWhileFetching) return H.__staleWhileFetching;
            } else if (H !== void 0) return H;
          }
        } finally {
          if (this.#W && this.#J) {
            let H = this.#J,
              _;
            while ((_ = H?.shift())) this.#f?.(..._);
          }
        }
      }
      #x(H) {
        let _ = this.#M,
          q = this.#O[_],
          $ = this.#_[_];
        if (this.#v && this.#j($)) $.__abortController.abort(Error("evicted"));
        else if (this.#Z || this.#W) {
          if (this.#Z) this.#H?.($, q, "evict");
          if (this.#W) this.#J?.push([$, q, "evict"]);
        }
        if ((this.#b(_), H)) (this.#O[_] = void 0), (this.#_[_] = void 0), this.#X.push(_);
        if (this.#K === 1) (this.#M = this.#Y = 0), (this.#X.length = 0);
        else this.#M = this.#D[_];
        return this.#A.delete(q), this.#K--, _;
      }
      has(H, _ = {}) {
        let { updateAgeOnHas: q = this.updateAgeOnHas, status: $ } = _,
          K = this.#A.get(H);
        if (K !== void 0) {
          let O = this.#_[K];
          if (this.#j(O) && O.__staleWhileFetching === void 0) return !1;
          if (!this.#k(K)) {
            if (q) this.#S(K);
            if ($) ($.has = "hit"), this.#N($, K);
            return !0;
          } else if ($) ($.has = "stale"), this.#N($, K);
        } else if ($) $.has = "miss";
        return !1;
      }
      peek(H, _ = {}) {
        let { allowStale: q = this.allowStale } = _,
          $ = this.#A.get(H);
        if ($ === void 0 || (!q && this.#k($))) return;
        let K = this.#_[$];
        return this.#j(K) ? K.__staleWhileFetching : K;
      }
      #m(H, _, q, $) {
        let K = _ === void 0 ? void 0 : this.#_[_];
        if (this.#j(K)) return K;
        let O = new O1_(),
          { signal: T } = q;
        T?.addEventListener("abort", () => O.abort(T.reason), { signal: O.signal });
        let z = { signal: O.signal, options: q, context: $ },
          A = (M, J = !1) => {
            let { aborted: P } = O.signal,
              X = q.ignoreFetchAbort && M !== void 0;
            if (q.status)
              if (P && !J) {
                if (((q.status.fetchAborted = !0), (q.status.fetchError = O.signal.reason), X))
                  q.status.fetchAbortIgnored = !0;
              } else q.status.fetchResolved = !0;
            if (P && !X && !J) return w(O.signal.reason);
            let R = D;
            if (this.#_[_] === D)
              if (M === void 0)
                if (R.__staleWhileFetching) this.#_[_] = R.__staleWhileFetching;
                else this.#V(H, "fetch");
              else {
                if (q.status) q.status.fetchUpdated = !0;
                this.set(H, M, z.options);
              }
            return M;
          },
          f = (M) => {
            if (q.status) (q.status.fetchRejected = !0), (q.status.fetchError = M);
            return w(M);
          },
          w = (M) => {
            let { aborted: J } = O.signal,
              P = J && q.allowStaleOnFetchAbort,
              X = P || q.allowStaleOnFetchRejection,
              R = X || q.noDeleteOnFetchRejection,
              W = D;
            if (this.#_[_] === D) {
              if (!R || W.__staleWhileFetching === void 0) this.#V(H, "fetch");
              else if (!P) this.#_[_] = W.__staleWhileFetching;
            }
            if (X) {
              if (q.status && W.__staleWhileFetching !== void 0) q.status.returnedStale = !0;
              return W.__staleWhileFetching;
            } else if (W.__returned === W) throw M;
          },
          Y = (M, J) => {
            let P = this.#T?.(H, K, z);
            if (P && P instanceof Promise) P.then((X) => M(X === void 0 ? void 0 : X), J);
            O.signal.addEventListener("abort", () => {
              if (!q.ignoreFetchAbort || q.allowStaleOnFetchAbort) {
                if ((M(void 0), q.allowStaleOnFetchAbort)) M = (X) => A(X, !0);
              }
            });
          };
        if (q.status) q.status.fetchDispatched = !0;
        let D = new Promise(Y).then(A, f),
          j = Object.assign(D, { __abortController: O, __staleWhileFetching: K, __returned: void 0 });
        if (_ === void 0) this.set(H, j, { ...z.options, status: void 0 }), (_ = this.#A.get(H));
        else this.#_[_] = j;
        return j;
      }
      #j(H) {
        if (!this.#v) return !1;
        let _ = H;
        return (
          !!_ && _ instanceof Promise && _.hasOwnProperty("__staleWhileFetching") && _.__abortController instanceof O1_
        );
      }
      async fetch(H, _ = {}) {
        let {
          allowStale: q = this.allowStale,
          updateAgeOnGet: $ = this.updateAgeOnGet,
          noDeleteOnStaleGet: K = this.noDeleteOnStaleGet,
          ttl: O = this.ttl,
          noDisposeOnSet: T = this.noDisposeOnSet,
          size: z = 0,
          sizeCalculation: A = this.sizeCalculation,
          noUpdateTTL: f = this.noUpdateTTL,
          noDeleteOnFetchRejection: w = this.noDeleteOnFetchRejection,
          allowStaleOnFetchRejection: Y = this.allowStaleOnFetchRejection,
          ignoreFetchAbort: D = this.ignoreFetchAbort,
          allowStaleOnFetchAbort: j = this.allowStaleOnFetchAbort,
          context: M,
          forceRefresh: J = !1,
          status: P,
          signal: X,
        } = _;
        if (!this.#v) {
          if (P) P.fetch = "get";
          return this.get(H, { allowStale: q, updateAgeOnGet: $, noDeleteOnStaleGet: K, status: P });
        }
        let R = {
            allowStale: q,
            updateAgeOnGet: $,
            noDeleteOnStaleGet: K,
            ttl: O,
            noDisposeOnSet: T,
            size: z,
            sizeCalculation: A,
            noUpdateTTL: f,
            noDeleteOnFetchRejection: w,
            allowStaleOnFetchRejection: Y,
            allowStaleOnFetchAbort: j,
            ignoreFetchAbort: D,
            status: P,
            signal: X,
          },
          W = this.#A.get(H);
        if (W === void 0) {
          if (P) P.fetch = "miss";
          let Z = this.#m(H, W, R, M);
          return (Z.__returned = Z);
        } else {
          let Z = this.#_[W];
          if (this.#j(Z)) {
            let S = q && Z.__staleWhileFetching !== void 0;
            if (P) {
              if (((P.fetch = "inflight"), S)) P.returnedStale = !0;
            }
            return S ? Z.__staleWhileFetching : (Z.__returned = Z);
          }
          let k = this.#k(W);
          if (!J && !k) {
            if (P) P.fetch = "hit";
            if ((this.#I(W), $)) this.#S(W);
            if (P) this.#N(P, W);
            return Z;
          }
          let v = this.#m(H, W, R, M),
            E = v.__staleWhileFetching !== void 0 && q;
          if (P) {
            if (((P.fetch = k ? "stale" : "refresh"), E && k)) P.returnedStale = !0;
          }
          return E ? v.__staleWhileFetching : (v.__returned = v);
        }
      }
      async forceFetch(H, _ = {}) {
        let q = await this.fetch(H, _);
        if (q === void 0) throw Error("fetch() returned undefined");
        return q;
      }
      memo(H, _ = {}) {
        let q = this.#z;
        if (!q) throw Error("no memoMethod provided to constructor");
        let { context: $, forceRefresh: K, ...O } = _,
          T = this.get(H, O);
        if (!K && T !== void 0) return T;
        let z = q(H, T, { options: O, context: $ });
        return this.set(H, z, O), z;
      }
      get(H, _ = {}) {
        let {
            allowStale: q = this.allowStale,
            updateAgeOnGet: $ = this.updateAgeOnGet,
            noDeleteOnStaleGet: K = this.noDeleteOnStaleGet,
            status: O,
          } = _,
          T = this.#A.get(H);
        if (T !== void 0) {
          let z = this.#_[T],
            A = this.#j(z);
          if (O) this.#N(O, T);
          if (this.#k(T)) {
            if (O) O.get = "stale";
            if (!A) {
              if (!K) this.#V(H, "expire");
              if (O && q) O.returnedStale = !0;
              return q ? z : void 0;
            } else {
              if (O && q && z.__staleWhileFetching !== void 0) O.returnedStale = !0;
              return q ? z.__staleWhileFetching : void 0;
            }
          } else {
            if (O) O.get = "hit";
            if (A) return z.__staleWhileFetching;
            if ((this.#I(T), $)) this.#S(T);
            return z;
          }
        } else if (O) O.get = "miss";
      }
      #g(H, _) {
        (this.#P[_] = H), (this.#D[H] = _);
      }
      #I(H) {
        if (H !== this.#Y) {
          if (H === this.#M) this.#M = this.#D[H];
          else this.#g(this.#P[H], this.#D[H]);
          this.#g(this.#Y, H), (this.#Y = H);
        }
      }
      delete(H) {
        return this.#V(H, "delete");
      }
      #V(H, _) {
        let q = !1;
        if (this.#K !== 0) {
          let $ = this.#A.get(H);
          if ($ !== void 0)
            if (((q = !0), this.#K === 1)) this.#d(_);
            else {
              this.#b($);
              let K = this.#_[$];
              if (this.#j(K)) K.__abortController.abort(Error("deleted"));
              else if (this.#Z || this.#W) {
                if (this.#Z) this.#H?.(K, H, _);
                if (this.#W) this.#J?.push([K, H, _]);
              }
              if ((this.#A.delete(H), (this.#O[$] = void 0), (this.#_[$] = void 0), $ === this.#Y))
                this.#Y = this.#P[$];
              else if ($ === this.#M) this.#M = this.#D[$];
              else {
                let O = this.#P[$];
                this.#D[O] = this.#D[$];
                let T = this.#D[$];
                this.#P[T] = this.#P[$];
              }
              this.#K--, this.#X.push($);
            }
        }
        if (this.#W && this.#J?.length) {
          let $ = this.#J,
            K;
          while ((K = $?.shift())) this.#f?.(...K);
        }
        return q;
      }
      clear() {
        return this.#d("delete");
      }
      #d(H) {
        for (let _ of this.#y({ allowStale: !0 })) {
          let q = this.#_[_];
          if (this.#j(q)) q.__abortController.abort(Error("deleted"));
          else {
            let $ = this.#O[_];
            if (this.#Z) this.#H?.(q, $, H);
            if (this.#W) this.#J?.push([q, $, H]);
          }
        }
        if ((this.#A.clear(), this.#_.fill(void 0), this.#O.fill(void 0), this.#R && this.#L))
          this.#R.fill(0), this.#L.fill(0);
        if (this.#G) this.#G.fill(0);
        if (((this.#M = 0), (this.#Y = 0), (this.#X.length = 0), (this.#w = 0), (this.#K = 0), this.#W && this.#J)) {
          let _ = this.#J,
            q;
          while ((q = _?.shift())) this.#f?.(...q);
        }
      }
    };
