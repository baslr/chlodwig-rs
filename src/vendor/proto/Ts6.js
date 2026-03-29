  var Ts6 = d((vzT, E69) => {
    var Os6 = rD();
    E69.exports = S69;
    function S69(H, _) {
      (this._getString = H), (this._setString = _), (this._length = 0), (this._lastStringValue = ""), this._update();
    }
    Object.defineProperties(S69.prototype, {
      length: {
        get: function () {
          return this._length;
        },
      },
      item: {
        value: function (H) {
          var _ = zyH(this);
          if (H < 0 || H >= _.length) return null;
          return _[H];
        },
      },
      contains: {
        value: function (H) {
          H = String(H);
          var _ = zyH(this);
          return _.indexOf(H) > -1;
        },
      },
      add: {
        value: function () {
          var H = zyH(this);
          for (var _ = 0, q = arguments.length; _ < q; _++) {
            var $ = _H_(arguments[_]);
            if (H.indexOf($) < 0) H.push($);
          }
          this._update(H);
        },
      },
      remove: {
        value: function () {
          var H = zyH(this);
          for (var _ = 0, q = arguments.length; _ < q; _++) {
            var $ = _H_(arguments[_]),
              K = H.indexOf($);
            if (K > -1) H.splice(K, 1);
          }
          this._update(H);
        },
      },
      toggle: {
        value: function (_, q) {
          if (((_ = _H_(_)), this.contains(_))) {
            if (q === void 0 || q === !1) return this.remove(_), !1;
            return !0;
          } else {
            if (q === void 0 || q === !0) return this.add(_), !0;
            return !1;
          }
        },
      },
      replace: {
        value: function (_, q) {
          if (String(q) === "") Os6.SyntaxError();
          (_ = _H_(_)), (q = _H_(q));
          var $ = zyH(this),
            K = $.indexOf(_);
          if (K < 0) return !1;
          var O = $.indexOf(q);
          if (O < 0) $[K] = q;
          else if (K < O) ($[K] = q), $.splice(O, 1);
          else $.splice(K, 1);
          return this._update($), !0;
        },
      },
      toString: {
        value: function () {
          return this._getString();
        },
      },
      value: {
        get: function () {
          return this._getString();
        },
        set: function (H) {
          this._setString(H), this._update();
        },
      },
      _update: {
        value: function (H) {
          if (H) V69(this, H), this._setString(H.join(" ").trim());
          else V69(this, zyH(this));
          this._lastStringValue = this._getString();
        },
      },
    });
    function V69(H, _) {
      var q = H._length,
        $;
      H._length = _.length;
      for ($ = 0; $ < _.length; $++) H[$] = _[$];
      for (; $ < q; $++) H[$] = void 0;
    }
    function _H_(H) {
      if (((H = String(H)), H === "")) Os6.SyntaxError();
      if (/[ \t\r\n\f]/.test(H)) Os6.InvalidCharacterError();
      return H;
    }
    function Dc1(H) {
      var _ = H._length,
        q = Array(_);
      for (var $ = 0; $ < _; $++) q[$] = H[$];
      return q;
    }
    function zyH(H) {
      var _ = H._getString();
      if (_ === H._lastStringValue) return Dc1(H);
      var q = _.replace(/(^[ \t\r\n\f]+)|([ \t\r\n\f]+$)/g, "");
      if (q === "") return [];
      else {
        var $ = Object.create(null);
        return q.split(/[ \t\r\n\f]+/g).filter(function (K) {
          var O = "$" + K;
          if ($[O]) return !1;
          return ($[O] = !0), !0;
        });
      }
    }
  });
