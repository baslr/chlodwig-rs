  var RP = d((UgO, xd7) => {
    var E2 = (xd7.exports = Vc()),
      ud7 = sU6(),
      wl6,
      Yl6;
    E2.codegen = fd7();
    E2.fetch = Yd7();
    E2.path = Md7();
    E2.fs = E2.inquire("fs");
    E2.toArray = function (_) {
      if (_) {
        var q = Object.keys(_),
          $ = Array(q.length),
          K = 0;
        while (K < q.length) $[K] = _[q[K++]];
        return $;
      }
      return [];
    };
    E2.toObject = function (_) {
      var q = {},
        $ = 0;
      while ($ < _.length) {
        var K = _[$++],
          O = _[$++];
        if (O !== void 0) q[K] = O;
      }
      return q;
    };
    var RN1 = /\\/g,
      ZN1 = /"/g;
    E2.isReserved = function (_) {
      return /^(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$/.test(
        _,
      );
    };
    E2.safeProp = function (_) {
      if (!/^[$\w_]+$/.test(_) || E2.isReserved(_)) return '["' + _.replace(RN1, "\\\\").replace(ZN1, '\\"') + '"]';
      return "." + _;
    };
    E2.ucFirst = function (_) {
      return _.charAt(0).toUpperCase() + _.substring(1);
    };
    var LN1 = /_([a-z])/g;
    E2.camelCase = function (_) {
      return (
        _.substring(0, 1) +
        _.substring(1).replace(LN1, function (q, $) {
          return $.toUpperCase();
        })
      );
    };
    E2.compareFieldsById = function (_, q) {
      return _.id - q.id;
    };
    E2.decorateType = function (_, q) {
      if (_.$type) {
        if (q && _.$type.name !== q) E2.decorateRoot.remove(_.$type), (_.$type.name = q), E2.decorateRoot.add(_.$type);
        return _.$type;
      }
      if (!wl6) wl6 = qx_();
      var $ = new wl6(q || _.name);
      return (
        E2.decorateRoot.add($),
        ($.ctor = _),
        Object.defineProperty(_, "$type", { value: $, enumerable: !1 }),
        Object.defineProperty(_.prototype, "$type", { value: $, enumerable: !1 }),
        $
      );
    };
    var kN1 = 0;
    E2.decorateEnum = function (_) {
      if (_.$type) return _.$type;
      if (!Yl6) Yl6 = Am();
      var q = new Yl6("Enum" + kN1++, _);
      return E2.decorateRoot.add(q), Object.defineProperty(_, "$type", { value: q, enumerable: !1 }), q;
    };
    E2.setProperty = function (_, q, $, K) {
      function O(T, z, A) {
        var f = z.shift();
        if (f === "__proto__" || f === "prototype") return T;
        if (z.length > 0) T[f] = O(T[f] || {}, z, A);
        else {
          var w = T[f];
          if (w && K) return T;
          if (w) A = [].concat(w).concat(A);
          T[f] = A;
        }
        return T;
      }
      if (typeof _ !== "object") throw TypeError("dst must be an object");
      if (!q) throw TypeError("path must be specified");
      return (q = q.split(".")), O(_, q, $);
    };
    Object.defineProperty(E2, "decorateRoot", {
      get: function () {
        return ud7.decorated || (ud7.decorated = new (Tx_())());
      },
    });
  });
