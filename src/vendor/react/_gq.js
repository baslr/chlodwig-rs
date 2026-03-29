  var _gq = d((L1) => {
    var aL6 = Symbol.for("react.transitional.element"),
      lG4 = Symbol.for("react.portal"),
      iG4 = Symbol.for("react.fragment"),
      nG4 = Symbol.for("react.strict_mode"),
      rG4 = Symbol.for("react.profiler"),
      oG4 = Symbol.for("react.consumer"),
      aG4 = Symbol.for("react.context"),
      sG4 = Symbol.for("react.forward_ref"),
      tG4 = Symbol.for("react.suspense"),
      eG4 = Symbol.for("react.memo"),
      oBq = Symbol.for("react.lazy"),
      HR4 = Symbol.for("react.activity"),
      lBq = Symbol.iterator;
    function _R4(H) {
      if (H === null || typeof H !== "object") return null;
      return (H = (lBq && H[lBq]) || H["@@iterator"]), typeof H === "function" ? H : null;
    }
    var aBq = {
        isMounted: function () {
          return !1;
        },
        enqueueForceUpdate: function () {},
        enqueueReplaceState: function () {},
        enqueueSetState: function () {},
      },
      sBq = Object.assign,
      tBq = {};
    function W0H(H, _, q) {
      (this.props = H), (this.context = _), (this.refs = tBq), (this.updater = q || aBq);
    }
    W0H.prototype.isReactComponent = {};
    W0H.prototype.setState = function (H, _) {
      if (typeof H !== "object" && typeof H !== "function" && H != null)
        throw Error(
          "takes an object of state variables to update or a function which returns an object of state variables.",
        );
      this.updater.enqueueSetState(this, H, _, "setState");
    };
    W0H.prototype.forceUpdate = function (H) {
      this.updater.enqueueForceUpdate(this, H, "forceUpdate");
    };
    function eBq() {}
    eBq.prototype = W0H.prototype;
    function sL6(H, _, q) {
      (this.props = H), (this.context = _), (this.refs = tBq), (this.updater = q || aBq);
    }
    var tL6 = (sL6.prototype = new eBq());
    tL6.constructor = sL6;
    sBq(tL6, W0H.prototype);
    tL6.isPureReactComponent = !0;
    var iBq = Array.isArray;
    function oL6() {}
    var Vf = { H: null, A: null, T: null, S: null },
      Hgq = Object.prototype.hasOwnProperty;
    function eL6(H, _, q) {
      var $ = q.ref;
      return { $$typeof: aL6, type: H, key: _, ref: $ !== void 0 ? $ : null, props: q };
    }
    function qR4(H, _) {
      return eL6(H.type, _, H.props);
    }
    function Hk6(H) {
      return typeof H === "object" && H !== null && H.$$typeof === aL6;
    }
    function $R4(H) {
      var _ = { "=": "=0", ":": "=2" };
      return (
        "$" +
        H.replace(/[=:]/g, function (q) {
          return _[q];
        })
      );
    }
    var nBq = /\/+/g;
    function rL6(H, _) {
      return typeof H === "object" && H !== null && H.key != null ? $R4("" + H.key) : _.toString(36);
    }
    function KR4(H) {
      switch (H.status) {
        case "fulfilled":
          return H.value;
        case "rejected":
          throw H.reason;
        default:
          switch (
            (typeof H.status === "string"
              ? H.then(oL6, oL6)
              : ((H.status = "pending"),
                H.then(
                  function (_) {
                    H.status === "pending" && ((H.status = "fulfilled"), (H.value = _));
                  },
                  function (_) {
                    H.status === "pending" && ((H.status = "rejected"), (H.reason = _));
                  },
                )),
            H.status)
          ) {
            case "fulfilled":
              return H.value;
            case "rejected":
              throw H.reason;
          }
      }
      throw H;
    }
    function X0H(H, _, q, $, K) {
      var O = typeof H;
      if (O === "undefined" || O === "boolean") H = null;
      var T = !1;
      if (H === null) T = !0;
      else
        switch (O) {
          case "bigint":
          case "string":
          case "number":
            T = !0;
            break;
          case "object":
            switch (H.$$typeof) {
              case aL6:
              case lG4:
                T = !0;
                break;
              case oBq:
                return (T = H._init), X0H(T(H._payload), _, q, $, K);
            }
        }
      if (T)
        return (
          (K = K(H)),
          (T = $ === "" ? "." + rL6(H, 0) : $),
          iBq(K)
            ? ((q = ""),
              T != null && (q = T.replace(nBq, "$&/") + "/"),
              X0H(K, _, q, "", function (f) {
                return f;
              }))
            : K != null &&
              (Hk6(K) &&
                (K = qR4(
                  K,
                  q + (K.key == null || (H && H.key === K.key) ? "" : ("" + K.key).replace(nBq, "$&/") + "/") + T,
                )),
              _.push(K)),
          1
        );
      T = 0;
      var z = $ === "" ? "." : $ + ":";
      if (iBq(H)) for (var A = 0; A < H.length; A++) ($ = H[A]), (O = z + rL6($, A)), (T += X0H($, _, q, O, K));
      else if (((A = _R4(H)), typeof A === "function"))
        for (H = A.call(H), A = 0; !($ = H.next()).done; )
          ($ = $.value), (O = z + rL6($, A++)), (T += X0H($, _, q, O, K));
      else if (O === "object") {
        if (typeof H.then === "function") return X0H(KR4(H), _, q, $, K);
        throw (
          ((_ = String(H)),
          Error(
            "Objects are not valid as a React child (found: " +
              (_ === "[object Object]" ? "object with keys {" + Object.keys(H).join(", ") + "}" : _) +
              "). If you meant to render a collection of children, use an array instead.",
          ))
        );
      }
      return T;
    }
    function h0_(H, _, q) {
      if (H == null) return H;
      var $ = [],
        K = 0;
      return (
        X0H(H, $, "", "", function (O) {
          return _.call(q, O, K++);
        }),
        $
      );
    }
    function OR4(H) {
      if (H._status === -1) {
        var _ = H._result;
        (_ = _()),
          _.then(
            function (q) {
              if (H._status === 0 || H._status === -1) (H._status = 1), (H._result = q);
            },
            function (q) {
              if (H._status === 0 || H._status === -1) (H._status = 2), (H._result = q);
            },
          ),
          H._status === -1 && ((H._status = 0), (H._result = _));
      }
      if (H._status === 1) return H._result.default;
      throw H._result;
    }
    var rBq =
        typeof reportError === "function"
          ? reportError
          : function (H) {
              if (typeof window === "object" && typeof window.ErrorEvent === "function") {
                var _ = new window.ErrorEvent("error", {
                  bubbles: !0,
                  cancelable: !0,
                  message:
                    typeof H === "object" && H !== null && typeof H.message === "string"
                      ? String(H.message)
                      : String(H),
                  error: H,
                });
                if (!window.dispatchEvent(_)) return;
              } else if (typeof process === "object" && typeof process.emit === "function") {
                process.emit("uncaughtException", H);
                return;
              }
              console.error(H);
            },
      TR4 = {
        map: h0_,
        forEach: function (H, _, q) {
          h0_(
            H,
            function () {
              _.apply(this, arguments);
            },
            q,
          );
        },
        count: function (H) {
          var _ = 0;
          return (
            h0_(H, function () {
              _++;
            }),
            _
          );
        },
        toArray: function (H) {
          return (
            h0_(H, function (_) {
              return _;
            }) || []
          );
        },
        only: function (H) {
          if (!Hk6(H)) throw Error("React.Children.only expected to receive a single React element child.");
          return H;
        },
      };
    L1.Activity = HR4;
    L1.Children = TR4;
    L1.Component = W0H;
    L1.Fragment = iG4;
    L1.Profiler = rG4;
    L1.PureComponent = sL6;
    L1.StrictMode = nG4;
    L1.Suspense = tG4;
    L1.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Vf;
    L1.__COMPILER_RUNTIME = {
      __proto__: null,
      c: function (H) {
        return Vf.H.useMemoCache(H);
      },
    };
    L1.cache = function (H) {
      return function () {
        return H.apply(null, arguments);
      };
    };
    L1.cacheSignal = function () {
      return null;
    };
    L1.cloneElement = function (H, _, q) {
      if (H === null || H === void 0) throw Error("The argument must be a React element, but you passed " + H + ".");
      var $ = sBq({}, H.props),
        K = H.key;
      if (_ != null)
        for (O in (_.key !== void 0 && (K = "" + _.key), _))
          !Hgq.call(_, O) ||
            O === "key" ||
            O === "__self" ||
            O === "__source" ||
            (O === "ref" && _.ref === void 0) ||
            ($[O] = _[O]);
      var O = arguments.length - 2;
      if (O === 1) $.children = q;
      else if (1 < O) {
        for (var T = Array(O), z = 0; z < O; z++) T[z] = arguments[z + 2];
        $.children = T;
      }
      return eL6(H.type, K, $);
    };
    L1.createContext = function (H) {
      return (
        (H = { $$typeof: aG4, _currentValue: H, _currentValue2: H, _threadCount: 0, Provider: null, Consumer: null }),
        (H.Provider = H),
        (H.Consumer = { $$typeof: oG4, _context: H }),
        H
      );
    };
    L1.createElement = function (H, _, q) {
      var $,
        K = {},
        O = null;
      if (_ != null)
        for ($ in (_.key !== void 0 && (O = "" + _.key), _))
          Hgq.call(_, $) && $ !== "key" && $ !== "__self" && $ !== "__source" && (K[$] = _[$]);
      var T = arguments.length - 2;
      if (T === 1) K.children = q;
      else if (1 < T) {
        for (var z = Array(T), A = 0; A < T; A++) z[A] = arguments[A + 2];
        K.children = z;
      }
      if (H && H.defaultProps) for ($ in ((T = H.defaultProps), T)) K[$] === void 0 && (K[$] = T[$]);
      return eL6(H, O, K);
    };
    L1.createRef = function () {
      return { current: null };
    };
    L1.forwardRef = function (H) {
      return { $$typeof: sG4, render: H };
    };
    L1.isValidElement = Hk6;
    L1.lazy = function (H) {
      return { $$typeof: oBq, _payload: { _status: -1, _result: H }, _init: OR4 };
    };
    L1.memo = function (H, _) {
      return { $$typeof: eG4, type: H, compare: _ === void 0 ? null : _ };
    };
    L1.startTransition = function (H) {
      var _ = Vf.T,
        q = {};
      Vf.T = q;
      try {
        var $ = H(),
          K = Vf.S;
        K !== null && K(q, $), typeof $ === "object" && $ !== null && typeof $.then === "function" && $.then(oL6, rBq);
      } catch (O) {
        rBq(O);
      } finally {
        _ !== null && q.types !== null && (_.types = q.types), (Vf.T = _);
      }
    };
    L1.unstable_useCacheRefresh = function () {
      return Vf.H.useCacheRefresh();
    };
    L1.use = function (H) {
      return Vf.H.use(H);
    };
    L1.useActionState = function (H, _, q) {
      return Vf.H.useActionState(H, _, q);
    };
    L1.useCallback = function (H, _) {
      return Vf.H.useCallback(H, _);
    };
    L1.useContext = function (H) {
      return Vf.H.useContext(H);
    };
    L1.useDebugValue = function () {};
    L1.useDeferredValue = function (H, _) {
      return Vf.H.useDeferredValue(H, _);
    };
    L1.useEffect = function (H, _) {
      return Vf.H.useEffect(H, _);
    };
    L1.useEffectEvent = function (H) {
      return Vf.H.useEffectEvent(H);
    };
    L1.useId = function () {
      return Vf.H.useId();
    };
    L1.useImperativeHandle = function (H, _, q) {
      return Vf.H.useImperativeHandle(H, _, q);
    };
    L1.useInsertionEffect = function (H, _) {
      return Vf.H.useInsertionEffect(H, _);
    };
    L1.useLayoutEffect = function (H, _) {
      return Vf.H.useLayoutEffect(H, _);
    };
    L1.useMemo = function (H, _) {
      return Vf.H.useMemo(H, _);
    };
    L1.useOptimistic = function (H, _) {
      return Vf.H.useOptimistic(H, _);
    };
    L1.useReducer = function (H, _, q) {
      return Vf.H.useReducer(H, _, q);
    };
    L1.useRef = function (H) {
      return Vf.H.useRef(H);
    };
    L1.useState = function (H) {
      return Vf.H.useState(H);
    };
    L1.useSyncExternalStore = function (H, _, q) {
      return Vf.H.useSyncExternalStore(H, _, q);
    };
    L1.useTransition = function () {
      return Vf.H.useTransition();
    };
    L1.version = "19.2.0";
  });
