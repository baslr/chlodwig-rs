  var O7H = d((ngO, Fd7) => {
    Fd7.exports = NW;
    NW.className = "ReflectionObject";
    var yN1 = pAH(),
      WsH = RP(),
      fx_,
      VN1 = {
        enum_type: "OPEN",
        field_presence: "EXPLICIT",
        json_format: "ALLOW",
        message_encoding: "LENGTH_PREFIXED",
        repeated_field_encoding: "PACKED",
        utf8_validation: "VERIFY",
      },
      SN1 = {
        enum_type: "CLOSED",
        field_presence: "EXPLICIT",
        json_format: "LEGACY_BEST_EFFORT",
        message_encoding: "LENGTH_PREFIXED",
        repeated_field_encoding: "EXPANDED",
        utf8_validation: "NONE",
      },
      EN1 = {
        enum_type: "OPEN",
        field_presence: "IMPLICIT",
        json_format: "ALLOW",
        message_encoding: "LENGTH_PREFIXED",
        repeated_field_encoding: "PACKED",
        utf8_validation: "VERIFY",
      };
    function NW(H, _) {
      if (!WsH.isString(H)) throw TypeError("name must be a string");
      if (_ && !WsH.isObject(_)) throw TypeError("options must be an object");
      (this.options = _),
        (this.parsedOptions = null),
        (this.name = H),
        (this._edition = null),
        (this._defaultEdition = "proto2"),
        (this._features = {}),
        (this._featuresResolved = !1),
        (this.parent = null),
        (this.resolved = !1),
        (this.comment = null),
        (this.filename = null);
    }
    Object.defineProperties(NW.prototype, {
      root: {
        get: function () {
          var H = this;
          while (H.parent !== null) H = H.parent;
          return H;
        },
      },
      fullName: {
        get: function () {
          var H = [this.name],
            _ = this.parent;
          while (_) H.unshift(_.name), (_ = _.parent);
          return H.join(".");
        },
      },
    });
    NW.prototype.toJSON = function () {
      throw Error();
    };
    NW.prototype.onAdd = function (_) {
      if (this.parent && this.parent !== _) this.parent.remove(this);
      (this.parent = _), (this.resolved = !1);
      var q = _.root;
      if (q instanceof fx_) q._handleAdd(this);
    };
    NW.prototype.onRemove = function (_) {
      var q = _.root;
      if (q instanceof fx_) q._handleRemove(this);
      (this.parent = null), (this.resolved = !1);
    };
    NW.prototype.resolve = function () {
      if (this.resolved) return this;
      if (this.root instanceof fx_) this.resolved = !0;
      return this;
    };
    NW.prototype._resolveFeaturesRecursive = function (_) {
      return this._resolveFeatures(this._edition || _);
    };
    NW.prototype._resolveFeatures = function (_) {
      if (this._featuresResolved) return;
      var q = {};
      if (!_) throw Error("Unknown edition for " + this.fullName);
      var $ = Object.assign(
        this.options ? Object.assign({}, this.options.features) : {},
        this._inferLegacyProtoFeatures(_),
      );
      if (this._edition) {
        if (_ === "proto2") q = Object.assign({}, SN1);
        else if (_ === "proto3") q = Object.assign({}, EN1);
        else if (_ === "2023") q = Object.assign({}, VN1);
        else throw Error("Unknown edition: " + _);
        (this._features = Object.assign(q, $ || {})), (this._featuresResolved = !0);
        return;
      }
      if (this.partOf instanceof yN1) {
        var K = Object.assign({}, this.partOf._features);
        this._features = Object.assign(K, $ || {});
      } else if (this.declaringField);
      else if (this.parent) {
        var O = Object.assign({}, this.parent._features);
        this._features = Object.assign(O, $ || {});
      } else throw Error("Unable to find a parent for " + this.fullName);
      if (this.extensionField) this.extensionField._features = this._features;
      this._featuresResolved = !0;
    };
    NW.prototype._inferLegacyProtoFeatures = function () {
      return {};
    };
    NW.prototype.getOption = function (_) {
      if (this.options) return this.options[_];
      return;
    };
    NW.prototype.setOption = function (_, q, $) {
      if (!this.options) this.options = {};
      if (/^features\./.test(_)) WsH.setProperty(this.options, _, q, $);
      else if (!$ || this.options[_] === void 0) {
        if (this.getOption(_) !== q) this.resolved = !1;
        this.options[_] = q;
      }
      return this;
    };
    NW.prototype.setParsedOption = function (_, q, $) {
      if (!this.parsedOptions) this.parsedOptions = [];
      var K = this.parsedOptions;
      if ($) {
        var O = K.find(function (A) {
          return Object.prototype.hasOwnProperty.call(A, _);
        });
        if (O) {
          var T = O[_];
          WsH.setProperty(T, $, q);
        } else (O = {}), (O[_] = WsH.setProperty({}, $, q)), K.push(O);
      } else {
        var z = {};
        (z[_] = q), K.push(z);
      }
      return this;
    };
    NW.prototype.setOptions = function (_, q) {
      if (_) for (var $ = Object.keys(_), K = 0; K < $.length; ++K) this.setOption($[K], _[$[K]], q);
      return this;
    };
    NW.prototype.toString = function () {
      var _ = this.constructor.className,
        q = this.fullName;
      if (q.length) return _ + " " + q;
      return _;
    };
    NW.prototype._editionToJSON = function () {
      if (!this._edition || this._edition === "proto3") return;
      return this._edition;
    };
    NW._configure = function (H) {
      fx_ = H;
    };
  });
