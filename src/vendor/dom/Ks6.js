  var Ks6 = d(($s6) => {
    var v69 = rD();
    $s6.property = function (H) {
      if (Array.isArray(H.type)) {
        var _ = Object.create(null);
        H.type.forEach(function (K) {
          _[K.value || K] = K.alias || K;
        });
        var q = H.missing;
        if (q === void 0) q = null;
        var $ = H.invalid;
        if ($ === void 0) $ = q;
        return {
          get: function () {
            var K = this._getattr(H.name);
            if (K === null) return q;
            if (((K = _[K.toLowerCase()]), K !== void 0)) return K;
            if ($ !== null) return $;
            return K;
          },
          set: function (K) {
            this._setattr(H.name, K);
          },
        };
      } else if (H.type === Boolean)
        return {
          get: function () {
            return this.hasAttribute(H.name);
          },
          set: function (K) {
            if (K) this._setattr(H.name, "");
            else this.removeAttribute(H.name);
          },
        };
      else if (
        H.type === Number ||
        H.type === "long" ||
        H.type === "unsigned long" ||
        H.type === "limited unsigned long with fallback"
      )
        return wc1(H);
      else if (!H.type || H.type === String)
        return {
          get: function () {
            return this._getattr(H.name) || "";
          },
          set: function (K) {
            if (H.treatNullAsEmptyString && K === null) K = "";
            this._setattr(H.name, K);
          },
        };
      else if (typeof H.type === "function") return H.type(H.name, H);
      throw Error("Invalid attribute definition");
    };
    function wc1(H) {
      var _;
      if (typeof H.default === "function") _ = H.default;
      else if (typeof H.default === "number")
        _ = function () {
          return H.default;
        };
      else
        _ = function () {
          v69.assert(!1, typeof H.default);
        };
      var q = H.type === "unsigned long",
        $ = H.type === "long",
        K = H.type === "limited unsigned long with fallback",
        O = H.min,
        T = H.max,
        z = H.setmin;
      if (O === void 0) {
        if (q) O = 0;
        if ($) O = -2147483648;
        if (K) O = 1;
      }
      if (T === void 0) {
        if (q || $ || K) T = 2147483647;
      }
      return {
        get: function () {
          var A = this._getattr(H.name),
            f = H.float ? parseFloat(A) : parseInt(A, 10);
          if (A === null || !isFinite(f) || (O !== void 0 && f < O) || (T !== void 0 && f > T)) return _.call(this);
          if (q || $ || K) {
            if (!/^[ \t\n\f\r]*[-+]?[0-9]/.test(A)) return _.call(this);
            f = f | 0;
          }
          return f;
        },
        set: function (A) {
          if (!H.float) A = Math.floor(A);
          if (z !== void 0 && A < z) v69.IndexSizeError(H.name + " set to " + A);
          if (q) A = A < 0 || A > 2147483647 ? _.call(this) : A | 0;
          else if (K) A = A < 1 || A > 2147483647 ? _.call(this) : A | 0;
          else if ($) A = A < -2147483648 || A > 2147483647 ? _.call(this) : A | 0;
          this._setattr(H.name, String(A));
        },
      };
    }
    $s6.registerChangeHandler = function (H, _, q) {
      var $ = H.prototype;
      if (!Object.prototype.hasOwnProperty.call($, "_attributeChangeHandlers"))
        $._attributeChangeHandlers = Object.create($._attributeChangeHandlers || null);
      $._attributeChangeHandlers[_] = q;
    };
  });
