  var Am = d((rgO, Qd7) => {
    Qd7.exports = fm;
    var jl6 = O7H();
    ((fm.prototype = Object.create(jl6.prototype)).constructor = fm).className = "Enum";
    var Ud7 = GNH(),
      wx_ = RP();
    function fm(H, _, q, $, K, O) {
      if ((jl6.call(this, H, q), _ && typeof _ !== "object")) throw TypeError("values must be an object");
      if (
        ((this.valuesById = {}),
        (this.values = Object.create(this.valuesById)),
        (this.comment = $),
        (this.comments = K || {}),
        (this.valuesOptions = O),
        (this._valuesFeatures = {}),
        (this.reserved = void 0),
        _)
      ) {
        for (var T = Object.keys(_), z = 0; z < T.length; ++z)
          if (typeof _[T[z]] === "number") this.valuesById[(this.values[T[z]] = _[T[z]])] = T[z];
      }
    }
    fm.prototype._resolveFeatures = function (_) {
      return (
        (_ = this._edition || _),
        jl6.prototype._resolveFeatures.call(this, _),
        Object.keys(this.values).forEach((q) => {
          var $ = Object.assign({}, this._features);
          this._valuesFeatures[q] = Object.assign(
            $,
            this.valuesOptions && this.valuesOptions[q] && this.valuesOptions[q].features,
          );
        }),
        this
      );
    };
    fm.fromJSON = function (_, q) {
      var $ = new fm(_, q.values, q.options, q.comment, q.comments);
      if ((($.reserved = q.reserved), q.edition)) $._edition = q.edition;
      return ($._defaultEdition = "proto3"), $;
    };
    fm.prototype.toJSON = function (_) {
      var q = _ ? Boolean(_.keepComments) : !1;
      return wx_.toObject([
        "edition",
        this._editionToJSON(),
        "options",
        this.options,
        "valuesOptions",
        this.valuesOptions,
        "values",
        this.values,
        "reserved",
        this.reserved && this.reserved.length ? this.reserved : void 0,
        "comment",
        q ? this.comment : void 0,
        "comments",
        q ? this.comments : void 0,
      ]);
    };
    fm.prototype.add = function (_, q, $, K) {
      if (!wx_.isString(_)) throw TypeError("name must be a string");
      if (!wx_.isInteger(q)) throw TypeError("id must be an integer");
      if (this.values[_] !== void 0) throw Error("duplicate name '" + _ + "' in " + this);
      if (this.isReservedId(q)) throw Error("id " + q + " is reserved in " + this);
      if (this.isReservedName(_)) throw Error("name '" + _ + "' is reserved in " + this);
      if (this.valuesById[q] !== void 0) {
        if (!(this.options && this.options.allow_alias)) throw Error("duplicate id " + q + " in " + this);
        this.values[_] = q;
      } else this.valuesById[(this.values[_] = q)] = _;
      if (K) {
        if (this.valuesOptions === void 0) this.valuesOptions = {};
        this.valuesOptions[_] = K || null;
      }
      return (this.comments[_] = $ || null), this;
    };
    fm.prototype.remove = function (_) {
      if (!wx_.isString(_)) throw TypeError("name must be a string");
      var q = this.values[_];
      if (q == null) throw Error("name '" + _ + "' does not exist in " + this);
      if ((delete this.valuesById[q], delete this.values[_], delete this.comments[_], this.valuesOptions))
        delete this.valuesOptions[_];
      return this;
    };
    fm.prototype.isReservedId = function (_) {
      return Ud7.isReservedId(this.reserved, _);
    };
    fm.prototype.isReservedName = function (_) {
      return Ud7.isReservedName(this.reserved, _);
    };
  });
