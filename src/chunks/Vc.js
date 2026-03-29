  var Vc = d((dU6) => {
    var F9 = dU6;
    F9.asPromise = xU6();
    F9.base64 = xm7();
    F9.EventEmitter = pm7();
    F9.float = Qm7();
    F9.inquire = BU6();
    F9.utf8 = rm7();
    F9.pool = am7();
    F9.LongBits = tm7();
    F9.isNode = Boolean(
      typeof global < "u" && global && global.process && global.process.versions && global.process.versions.node,
    );
    F9.global = (F9.isNode && global) || (typeof window < "u" && window) || (typeof self < "u" && self) || dU6;
    F9.emptyArray = Object.freeze ? Object.freeze([]) : [];
    F9.emptyObject = Object.freeze ? Object.freeze({}) : {};
    F9.isInteger =
      Number.isInteger ||
      function (_) {
        return typeof _ === "number" && isFinite(_) && Math.floor(_) === _;
      };
    F9.isString = function (_) {
      return typeof _ === "string" || _ instanceof String;
    };
    F9.isObject = function (_) {
      return _ && typeof _ === "object";
    };
    F9.isset = F9.isSet = function (_, q) {
      var $ = _[q];
      if ($ != null && _.hasOwnProperty(q))
        return typeof $ !== "object" || (Array.isArray($) ? $.length : Object.keys($).length) > 0;
      return !1;
    };
    F9.Buffer = (function () {
      try {
        var H = F9.inquire("buffer").Buffer;
        return H.prototype.utf8Write ? H : null;
      } catch (_) {
        return null;
      }
    })();
    F9._Buffer_from = null;
    F9._Buffer_allocUnsafe = null;
    F9.newBuffer = function (_) {
      return typeof _ === "number"
        ? F9.Buffer
          ? F9._Buffer_allocUnsafe(_)
          : new F9.Array(_)
        : F9.Buffer
          ? F9._Buffer_from(_)
          : typeof Uint8Array > "u"
            ? _
            : new Uint8Array(_);
    };
    F9.Array = typeof Uint8Array < "u" ? Uint8Array : Array;
    F9.Long = (F9.global.dcodeIO && F9.global.dcodeIO.Long) || F9.global.Long || F9.inquire("long");
    F9.key2Re = /^true|false|0|1$/;
    F9.key32Re = /^-?(?:0|[1-9][0-9]*)$/;
    F9.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;
    F9.longToHash = function (_) {
      return _ ? F9.LongBits.from(_).toHash() : F9.LongBits.zeroHash;
    };
    F9.longFromHash = function (_, q) {
      var $ = F9.LongBits.fromHash(_);
      if (F9.Long) return F9.Long.fromBits($.lo, $.hi, q);
      return $.toNumber(Boolean(q));
    };
    function em7(H, _, q) {
      for (var $ = Object.keys(_), K = 0; K < $.length; ++K) if (H[$[K]] === void 0 || !q) H[$[K]] = _[$[K]];
      return H;
    }
    F9.merge = em7;
    F9.lcFirst = function (_) {
      return _.charAt(0).toLowerCase() + _.substring(1);
    };
    function Hp7(H) {
      function _(q, $) {
        if (!(this instanceof _)) return new _(q, $);
        if (
          (Object.defineProperty(this, "message", {
            get: function () {
              return q;
            },
          }),
          Error.captureStackTrace)
        )
          Error.captureStackTrace(this, _);
        else Object.defineProperty(this, "stack", { value: Error().stack || "" });
        if ($) em7(this, $);
      }
      return (
        (_.prototype = Object.create(Error.prototype, {
          constructor: { value: _, writable: !0, enumerable: !1, configurable: !0 },
          name: {
            get: function () {
              return H;
            },
            set: void 0,
            enumerable: !1,
            configurable: !0,
          },
          toString: {
            value: function () {
              return this.name + ": " + this.message;
            },
            writable: !0,
            enumerable: !1,
            configurable: !0,
          },
        })),
        _
      );
    }
    F9.newError = Hp7;
    F9.ProtocolError = Hp7("ProtocolError");
    F9.oneOfGetter = function (_) {
      var q = {};
      for (var $ = 0; $ < _.length; ++$) q[_[$]] = 1;
      return function () {
        for (var K = Object.keys(this), O = K.length - 1; O > -1; --O)
          if (q[K[O]] === 1 && this[K[O]] !== void 0 && this[K[O]] !== null) return K[O];
      };
    };
    F9.oneOfSetter = function (_) {
      return function (q) {
        for (var $ = 0; $ < _.length; ++$) if (_[$] !== q) delete this[_[$]];
      };
    };
    F9.toJSONOptions = { longs: String, enums: String, bytes: String, json: !0 };
    F9._configure = function () {
      var H = F9.Buffer;
      if (!H) {
        F9._Buffer_from = F9._Buffer_allocUnsafe = null;
        return;
      }
      (F9._Buffer_from =
        (H.from !== Uint8Array.from && H.from) ||
        function (q, $) {
          return new H(q, $);
        }),
        (F9._Buffer_allocUnsafe =
          H.allocUnsafe ||
          function (q) {
            return new H(q);
          });
    };
  });
