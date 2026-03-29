  var K7H = d((lgO, Bd7) => {
    Bd7.exports = ZP;
    var XsH = O7H();
    ((ZP.prototype = Object.create(XsH.prototype)).constructor = ZP).className = "Field";
    var pd7 = Am(),
      Dl6 = BAH(),
      ij = RP(),
      PsH,
      hN1 = /^required|optional|repeated$/;
    ZP.fromJSON = function (_, q) {
      var $ = new ZP(_, q.id, q.type, q.rule, q.extend, q.options, q.comment);
      if (q.edition) $._edition = q.edition;
      return ($._defaultEdition = "proto3"), $;
    };
    function ZP(H, _, q, $, K, O, T) {
      if (ij.isObject($)) (T = K), (O = $), ($ = K = void 0);
      else if (ij.isObject(K)) (T = O), (O = K), (K = void 0);
      if ((XsH.call(this, H, O), !ij.isInteger(_) || _ < 0)) throw TypeError("id must be a non-negative integer");
      if (!ij.isString(q)) throw TypeError("type must be a string");
      if ($ !== void 0 && !hN1.test(($ = $.toString().toLowerCase()))) throw TypeError("rule must be a string rule");
      if (K !== void 0 && !ij.isString(K)) throw TypeError("extend must be a string");
      if ($ === "proto3_optional") $ = "optional";
      (this.rule = $ && $ !== "optional" ? $ : void 0),
        (this.type = q),
        (this.id = _),
        (this.extend = K || void 0),
        (this.repeated = $ === "repeated"),
        (this.map = !1),
        (this.message = null),
        (this.partOf = null),
        (this.typeDefault = null),
        (this.defaultValue = null),
        (this.long = ij.Long ? Dl6.long[q] !== void 0 : !1),
        (this.bytes = q === "bytes"),
        (this.resolvedType = null),
        (this.extensionField = null),
        (this.declaringField = null),
        (this.comment = T);
    }
    Object.defineProperty(ZP.prototype, "required", {
      get: function () {
        return this._features.field_presence === "LEGACY_REQUIRED";
      },
    });
    Object.defineProperty(ZP.prototype, "optional", {
      get: function () {
        return !this.required;
      },
    });
    Object.defineProperty(ZP.prototype, "delimited", {
      get: function () {
        return this.resolvedType instanceof PsH && this._features.message_encoding === "DELIMITED";
      },
    });
    Object.defineProperty(ZP.prototype, "packed", {
      get: function () {
        return this._features.repeated_field_encoding === "PACKED";
      },
    });
    Object.defineProperty(ZP.prototype, "hasPresence", {
      get: function () {
        if (this.repeated || this.map) return !1;
        return (
          this.partOf || this.declaringField || this.extensionField || this._features.field_presence !== "IMPLICIT"
        );
      },
    });
    ZP.prototype.setOption = function (_, q, $) {
      return XsH.prototype.setOption.call(this, _, q, $);
    };
    ZP.prototype.toJSON = function (_) {
      var q = _ ? Boolean(_.keepComments) : !1;
      return ij.toObject([
        "edition",
        this._editionToJSON(),
        "rule",
        (this.rule !== "optional" && this.rule) || void 0,
        "type",
        this.type,
        "id",
        this.id,
        "extend",
        this.extend,
        "options",
        this.options,
        "comment",
        q ? this.comment : void 0,
      ]);
    };
    ZP.prototype.resolve = function () {
      if (this.resolved) return this;
      if ((this.typeDefault = Dl6.defaults[this.type]) === void 0)
        if (
          ((this.resolvedType = (this.declaringField ? this.declaringField.parent : this.parent).lookupTypeOrEnum(
            this.type,
          )),
          this.resolvedType instanceof PsH)
        )
          this.typeDefault = null;
        else this.typeDefault = this.resolvedType.values[Object.keys(this.resolvedType.values)[0]];
      else if (this.options && this.options.proto3_optional) this.typeDefault = null;
      if (this.options && this.options.default != null) {
        if (
          ((this.typeDefault = this.options.default),
          this.resolvedType instanceof pd7 && typeof this.typeDefault === "string")
        )
          this.typeDefault = this.resolvedType.values[this.typeDefault];
      }
      if (this.options) {
        if (this.options.packed !== void 0 && this.resolvedType && !(this.resolvedType instanceof pd7))
          delete this.options.packed;
        if (!Object.keys(this.options).length) this.options = void 0;
      }
      if (this.long) {
        if (((this.typeDefault = ij.Long.fromNumber(this.typeDefault, this.type.charAt(0) === "u")), Object.freeze))
          Object.freeze(this.typeDefault);
      } else if (this.bytes && typeof this.typeDefault === "string") {
        var _;
        if (ij.base64.test(this.typeDefault))
          ij.base64.decode(this.typeDefault, (_ = ij.newBuffer(ij.base64.length(this.typeDefault))), 0);
        else ij.utf8.write(this.typeDefault, (_ = ij.newBuffer(ij.utf8.length(this.typeDefault))), 0);
        this.typeDefault = _;
      }
      if (this.map) this.defaultValue = ij.emptyObject;
      else if (this.repeated) this.defaultValue = ij.emptyArray;
      else this.defaultValue = this.typeDefault;
      if (this.parent instanceof PsH) this.parent.ctor.prototype[this.name] = this.defaultValue;
      return XsH.prototype.resolve.call(this);
    };
    ZP.prototype._inferLegacyProtoFeatures = function (_) {
      if (_ !== "proto2" && _ !== "proto3") return {};
      var q = {};
      if (this.rule === "required") q.field_presence = "LEGACY_REQUIRED";
      if (this.parent && Dl6.defaults[this.type] === void 0) {
        var $ = this.parent.get(this.type.split(".").pop());
        if ($ && $ instanceof PsH && $.group) q.message_encoding = "DELIMITED";
      }
      if (this.getOption("packed") === !0) q.repeated_field_encoding = "PACKED";
      else if (this.getOption("packed") === !1) q.repeated_field_encoding = "EXPANDED";
      return q;
    };
    ZP.prototype._resolveFeatures = function (_) {
      return XsH.prototype._resolveFeatures.call(this, this._edition || _);
    };
    ZP.d = function (_, q, $, K) {
      if (typeof q === "function") q = ij.decorateType(q).name;
      else if (q && typeof q === "object") q = ij.decorateEnum(q).name;
      return function (T, z) {
        ij.decorateType(T.constructor).add(new ZP(z, _, q, $, { default: K }));
      };
    };
    ZP._configure = function (_) {
      PsH = _;
    };
  });
