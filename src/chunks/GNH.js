  var GNH = d((bgO, Xd7) => {
    Xd7.exports = V3;
    var ru_ = O7H();
    ((V3.prototype = Object.create(ru_.prototype)).constructor = V3).className = "Namespace";
    var lQ6 = K7H(),
      ou_ = RP(),
      ev1 = pAH(),
      xAH,
      WNH,
      mAH;
    V3.fromJSON = function (_, q) {
      return new V3(_, q.options).addJSON(q.nested);
    };
    function Jd7(H, _) {
      if (!(H && H.length)) return;
      var q = {};
      for (var $ = 0; $ < H.length; ++$) q[H[$].name] = H[$].toJSON(_);
      return q;
    }
    V3.arrayToJSON = Jd7;
    V3.isReservedId = function (_, q) {
      if (_) {
        for (var $ = 0; $ < _.length; ++$) if (typeof _[$] !== "string" && _[$][0] <= q && _[$][1] > q) return !0;
      }
      return !1;
    };
    V3.isReservedName = function (_, q) {
      if (_) {
        for (var $ = 0; $ < _.length; ++$) if (_[$] === q) return !0;
      }
      return !1;
    };
    function V3(H, _) {
      ru_.call(this, H, _),
        (this.nested = void 0),
        (this._nestedArray = null),
        (this._lookupCache = {}),
        (this._needsRecursiveFeatureResolution = !0),
        (this._needsRecursiveResolve = !0);
    }
    function Pd7(H) {
      (H._nestedArray = null), (H._lookupCache = {});
      var _ = H;
      while ((_ = _.parent)) _._lookupCache = {};
      return H;
    }
    Object.defineProperty(V3.prototype, "nestedArray", {
      get: function () {
        return this._nestedArray || (this._nestedArray = ou_.toArray(this.nested));
      },
    });
    V3.prototype.toJSON = function (_) {
      return ou_.toObject(["options", this.options, "nested", Jd7(this.nestedArray, _)]);
    };
    V3.prototype.addJSON = function (_) {
      var q = this;
      if (_)
        for (var $ = Object.keys(_), K = 0, O; K < $.length; ++K)
          (O = _[$[K]]),
            q.add(
              (O.fields !== void 0
                ? xAH.fromJSON
                : O.values !== void 0
                  ? mAH.fromJSON
                  : O.methods !== void 0
                    ? WNH.fromJSON
                    : O.id !== void 0
                      ? lQ6.fromJSON
                      : V3.fromJSON)($[K], O),
            );
      return this;
    };
    V3.prototype.get = function (_) {
      return (this.nested && this.nested[_]) || null;
    };
    V3.prototype.getEnum = function (_) {
      if (this.nested && this.nested[_] instanceof mAH) return this.nested[_].values;
      throw Error("no such enum: " + _);
    };
    V3.prototype.add = function (_) {
      if (
        !(
          (_ instanceof lQ6 && _.extend !== void 0) ||
          _ instanceof xAH ||
          _ instanceof ev1 ||
          _ instanceof mAH ||
          _ instanceof WNH ||
          _ instanceof V3
        )
      )
        throw TypeError("object must be a valid nested object");
      if (!this.nested) this.nested = {};
      else {
        var q = this.get(_.name);
        if (q)
          if (q instanceof V3 && _ instanceof V3 && !(q instanceof xAH || q instanceof WNH)) {
            var $ = q.nestedArray;
            for (var K = 0; K < $.length; ++K) _.add($[K]);
            if ((this.remove(q), !this.nested)) this.nested = {};
            _.setOptions(q.options, !0);
          } else throw Error("duplicate name '" + _.name + "' in " + this);
      }
      if (
        ((this.nested[_.name] = _),
        !(this instanceof xAH || this instanceof WNH || this instanceof mAH || this instanceof lQ6))
      ) {
        if (!_._edition) _._edition = _._defaultEdition;
      }
      (this._needsRecursiveFeatureResolution = !0), (this._needsRecursiveResolve = !0);
      var O = this;
      while ((O = O.parent)) (O._needsRecursiveFeatureResolution = !0), (O._needsRecursiveResolve = !0);
      return _.onAdd(this), Pd7(this);
    };
    V3.prototype.remove = function (_) {
      if (!(_ instanceof ru_)) throw TypeError("object must be a ReflectionObject");
      if (_.parent !== this) throw Error(_ + " is not a member of " + this);
      if ((delete this.nested[_.name], !Object.keys(this.nested).length)) this.nested = void 0;
      return _.onRemove(this), Pd7(this);
    };
    V3.prototype.define = function (_, q) {
      if (ou_.isString(_)) _ = _.split(".");
      else if (!Array.isArray(_)) throw TypeError("illegal path");
      if (_ && _.length && _[0] === "") throw Error("path must be relative");
      var $ = this;
      while (_.length > 0) {
        var K = _.shift();
        if ($.nested && $.nested[K]) {
          if ((($ = $.nested[K]), !($ instanceof V3))) throw Error("path conflicts with non-namespace objects");
        } else $.add(($ = new V3(K)));
      }
      if (q) $.addJSON(q);
      return $;
    };
    V3.prototype.resolveAll = function () {
      if (!this._needsRecursiveResolve) return this;
      this._resolveFeaturesRecursive(this._edition);
      var _ = this.nestedArray,
        q = 0;
      this.resolve();
      while (q < _.length)
        if (_[q] instanceof V3) _[q++].resolveAll();
        else _[q++].resolve();
      return (this._needsRecursiveResolve = !1), this;
    };
    V3.prototype._resolveFeaturesRecursive = function (_) {
      if (!this._needsRecursiveFeatureResolution) return this;
      return (
        (this._needsRecursiveFeatureResolution = !1),
        (_ = this._edition || _),
        ru_.prototype._resolveFeaturesRecursive.call(this, _),
        this.nestedArray.forEach((q) => {
          q._resolveFeaturesRecursive(_);
        }),
        this
      );
    };
    V3.prototype.lookup = function (_, q, $) {
      if (typeof q === "boolean") ($ = q), (q = void 0);
      else if (q && !Array.isArray(q)) q = [q];
      if (ou_.isString(_) && _.length) {
        if (_ === ".") return this.root;
        _ = _.split(".");
      } else if (!_.length) return this;
      var K = _.join(".");
      if (_[0] === "") return this.root.lookup(_.slice(1), q);
      var O = this.root._fullyQualifiedObjects && this.root._fullyQualifiedObjects["." + K];
      if (O && (!q || q.indexOf(O.constructor) > -1)) return O;
      if (((O = this._lookupImpl(_, K)), O && (!q || q.indexOf(O.constructor) > -1))) return O;
      if ($) return null;
      var T = this;
      while (T.parent) {
        if (((O = T.parent._lookupImpl(_, K)), O && (!q || q.indexOf(O.constructor) > -1))) return O;
        T = T.parent;
      }
      return null;
    };
    V3.prototype._lookupImpl = function (_, q) {
      if (Object.prototype.hasOwnProperty.call(this._lookupCache, q)) return this._lookupCache[q];
      var $ = this.get(_[0]),
        K = null;
      if ($) {
        if (_.length === 1) K = $;
        else if ($ instanceof V3) (_ = _.slice(1)), (K = $._lookupImpl(_, _.join(".")));
      } else
        for (var O = 0; O < this.nestedArray.length; ++O)
          if (this._nestedArray[O] instanceof V3 && ($ = this._nestedArray[O]._lookupImpl(_, q))) K = $;
      return (this._lookupCache[q] = K), K;
    };
    V3.prototype.lookupType = function (_) {
      var q = this.lookup(_, [xAH]);
      if (!q) throw Error("no such type: " + _);
      return q;
    };
    V3.prototype.lookupEnum = function (_) {
      var q = this.lookup(_, [mAH]);
      if (!q) throw Error("no such Enum '" + _ + "' in " + this);
      return q;
    };
    V3.prototype.lookupTypeOrEnum = function (_) {
      var q = this.lookup(_, [xAH, mAH]);
      if (!q) throw Error("no such Type or Enum '" + _ + "' in " + this);
      return q;
    };
    V3.prototype.lookupService = function (_) {
      var q = this.lookup(_, [WNH]);
      if (!q) throw Error("no such Service '" + _ + "' in " + this);
      return q;
    };
    V3._configure = function (H, _, q) {
      (xAH = H), (WNH = _), (mAH = q);
    };
  });
