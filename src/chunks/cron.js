  var Edq = d((kw) => {
    function xk6(H, _) {
      var q = H.length;
      H.push(_);
      H: for (; 0 < q; ) {
        var $ = (q - 1) >>> 1,
          K = H[$];
        if (0 < l0_(K, _)) (H[$] = _), (H[q] = K), (q = $);
        else break H;
      }
    }
    function Ng(H) {
      return H.length === 0 ? null : H[0];
    }
    function o0_(H) {
      if (H.length === 0) return null;
      var _ = H[0],
        q = H.pop();
      if (q !== _) {
        H[0] = q;
        H: for (var $ = 0, K = H.length, O = K >>> 1; $ < O; ) {
          var T = 2 * ($ + 1) - 1,
            z = H[T],
            A = T + 1,
            f = H[A];
          if (0 > l0_(z, q))
            A < K && 0 > l0_(f, z) ? ((H[$] = f), (H[A] = q), ($ = A)) : ((H[$] = z), (H[T] = q), ($ = T));
          else if (A < K && 0 > l0_(f, q)) (H[$] = f), (H[A] = q), ($ = A);
          else break H;
        }
      }
      return _;
    }
    function l0_(H, _) {
      var q = H.sortIndex - _.sortIndex;
      return q !== 0 ? q : H.id - _.id;
    }
    kw.unstable_now = void 0;
    if (typeof performance === "object" && typeof performance.now === "function")
      (mk6 = performance),
        (kw.unstable_now = function () {
          return mk6.now();
        });
    else
      (i0_ = Date),
        (pk6 = i0_.now()),
        (kw.unstable_now = function () {
          return i0_.now() - pk6;
        });
    var mk6,
      i0_,
      pk6,
      Ii = [],
      p_H = [],
      RZ4 = 1,
      jE = null,
      TG = 3,
      Bk6 = !1,
      QFH = !1,
      lFH = !1,
      dk6 = !1,
      Ndq = typeof setTimeout === "function" ? setTimeout : null,
      hdq = typeof clearTimeout === "function" ? clearTimeout : null,
      vdq = typeof setImmediate < "u" ? setImmediate : null;
    function n0_(H) {
      for (var _ = Ng(p_H); _ !== null; ) {
        if (_.callback === null) o0_(p_H);
        else if (_.startTime <= H) o0_(p_H), (_.sortIndex = _.expirationTime), xk6(Ii, _);
        else break;
        _ = Ng(p_H);
      }
    }
    function ck6(H) {
      if (((lFH = !1), n0_(H), !QFH))
        if (Ng(Ii) !== null) (QFH = !0), S0H || ((S0H = !0), V0H());
        else {
          var _ = Ng(p_H);
          _ !== null && Fk6(ck6, _.startTime - H);
        }
    }
    var S0H = !1,
      iFH = -1,
      ydq = 5,
      Vdq = -1;
    function Sdq() {
      return dk6 ? !0 : kw.unstable_now() - Vdq < ydq ? !1 : !0;
    }
    function uk6() {
      if (((dk6 = !1), S0H)) {
        var H = kw.unstable_now();
        Vdq = H;
        var _ = !0;
        try {
          H: {
            (QFH = !1), lFH && ((lFH = !1), hdq(iFH), (iFH = -1)), (Bk6 = !0);
            var q = TG;
            try {
              _: {
                n0_(H);
                for (jE = Ng(Ii); jE !== null && !(jE.expirationTime > H && Sdq()); ) {
                  var $ = jE.callback;
                  if (typeof $ === "function") {
                    (jE.callback = null), (TG = jE.priorityLevel);
                    var K = $(jE.expirationTime <= H);
                    if (((H = kw.unstable_now()), typeof K === "function")) {
                      (jE.callback = K), n0_(H), (_ = !0);
                      break _;
                    }
                    jE === Ng(Ii) && o0_(Ii), n0_(H);
                  } else o0_(Ii);
                  jE = Ng(Ii);
                }
                if (jE !== null) _ = !0;
                else {
                  var O = Ng(p_H);
                  O !== null && Fk6(ck6, O.startTime - H), (_ = !1);
                }
              }
              break H;
            } finally {
              (jE = null), (TG = q), (Bk6 = !1);
            }
            _ = void 0;
          }
        } finally {
          _ ? V0H() : (S0H = !1);
        }
      }
    }
    var V0H;
    if (typeof vdq === "function")
      V0H = function () {
        vdq(uk6);
      };
    else if (typeof MessageChannel < "u")
      (r0_ = new MessageChannel()),
        (gk6 = r0_.port2),
        (r0_.port1.onmessage = uk6),
        (V0H = function () {
          gk6.postMessage(null);
        });
    else
      V0H = function () {
        Ndq(uk6, 0);
      };
    var r0_, gk6;
    function Fk6(H, _) {
      iFH = Ndq(function () {
        H(kw.unstable_now());
      }, _);
    }
    kw.unstable_IdlePriority = 5;
    kw.unstable_ImmediatePriority = 1;
    kw.unstable_LowPriority = 4;
    kw.unstable_NormalPriority = 3;
    kw.unstable_Profiling = null;
    kw.unstable_UserBlockingPriority = 2;
    kw.unstable_cancelCallback = function (H) {
      H.callback = null;
    };
    kw.unstable_forceFrameRate = function (H) {
      0 > H || 125 < H
        ? console.error(
            "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported",
          )
        : (ydq = 0 < H ? Math.floor(1000 / H) : 5);
    };
    kw.unstable_getCurrentPriorityLevel = function () {
      return TG;
    };
    kw.unstable_next = function (H) {
      switch (TG) {
        case 1:
        case 2:
        case 3:
          var _ = 3;
          break;
        default:
          _ = TG;
      }
      var q = TG;
      TG = _;
      try {
        return H();
      } finally {
        TG = q;
      }
    };
    kw.unstable_requestPaint = function () {
      dk6 = !0;
    };
    kw.unstable_runWithPriority = function (H, _) {
      switch (H) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          H = 3;
      }
      var q = TG;
      TG = H;
      try {
        return _();
      } finally {
        TG = q;
      }
    };
    kw.unstable_scheduleCallback = function (H, _, q) {
      var $ = kw.unstable_now();
      switch (
        (typeof q === "object" && q !== null
          ? ((q = q.delay), (q = typeof q === "number" && 0 < q ? $ + q : $))
          : (q = $),
        H)
      ) {
        case 1:
          var K = -1;
          break;
        case 2:
          K = 250;
          break;
        case 5:
          K = 1073741823;
          break;
        case 4:
          K = 1e4;
          break;
        default:
          K = 5000;
      }
      return (
        (K = q + K),
        (H = { id: RZ4++, callback: _, priorityLevel: H, startTime: q, expirationTime: K, sortIndex: -1 }),
        q > $
          ? ((H.sortIndex = q),
            xk6(p_H, H),
            Ng(Ii) === null && H === Ng(p_H) && (lFH ? (hdq(iFH), (iFH = -1)) : (lFH = !0), Fk6(ck6, q - $)))
          : ((H.sortIndex = K), xk6(Ii, H), QFH || Bk6 || ((QFH = !0), S0H || ((S0H = !0), V0H()))),
        H
      );
    };
    kw.unstable_shouldYield = Sdq;
    kw.unstable_wrapCallback = function (H) {
      var _ = TG;
      return function () {
        var q = TG;
        TG = _;
        try {
          return H.apply(this, arguments);
        } finally {
          TG = q;
        }
      };
    };
  });
