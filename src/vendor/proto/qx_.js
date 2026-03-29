  var qx_ = d((cgO, Ed7) => {
    Ed7.exports = jA;
    var dC = GNH();
    ((jA.prototype = Object.create(dC.prototype)).constructor = jA).className = "Type";
    var YN1 = Am(),
      Ol6 = pAH(),
      Hx_ = K7H(),
      DN1 = au_(),
      jN1 = tu_(),
      $l6 = eu_(),
      Kl6 = pI_(),
      MN1 = xI_(),
      QG = RP(),
      JN1 = Tl6(),
      PN1 = oQ6(),
      XN1 = tQ6(),
      Sd7 = _l6(),
      WN1 = ql6();
    function jA(H, _) {
      dC.call(this, H, _),
        (this.fields = {}),
        (this.oneofs = void 0),
        (this.extensions = void 0),
        (this.reserved = void 0),
        (this.group = void 0),
        (this._fieldsById = null),
        (this._fieldsArray = null),
        (this._oneofsArray = null),
        (this._ctor = null);
    }
    Object.defineProperties(jA.prototype, {
      fieldsById: {
        get: function () {
          if (this._fieldsById) return this._fieldsById;
          this._fieldsById = {};
          for (var H = Object.keys(this.fields), _ = 0; _ < H.length; ++_) {
            var q = this.fields[H[_]],
              $ = q.id;
            if (this._fieldsById[$]) throw Error("duplicate id " + $ + " in " + this);
            this._fieldsById[$] = q;
          }
          return this._fieldsById;
        },
      },
      fieldsArray: {
        get: function () {
          return this._fieldsArray || (this._fieldsArray = QG.toArray(this.fields));
        },
      },
      oneofsArray: {
        get: function () {
          return this._oneofsArray || (this._oneofsArray = QG.toArray(this.oneofs));
        },
      },
      ctor: {
        get: function () {
          return this._ctor || (this.ctor = jA.generateConstructor(this)());
        },
        set: function (H) {
          var _ = H.prototype;
          if (!(_ instanceof $l6)) ((H.prototype = new $l6()).constructor = H), QG.merge(H.prototype, _);
          (H.$type = H.prototype.$type = this), QG.merge(H, $l6, !0), (this._ctor = H);
          var q = 0;
          for (; q < this.fieldsArray.length; ++q) this._fieldsArray[q].resolve();
          var $ = {};
          for (q = 0; q < this.oneofsArray.length; ++q)
            $[this._oneofsArray[q].resolve().name] = {
              get: QG.oneOfGetter(this._oneofsArray[q].oneof),
              set: QG.oneOfSetter(this._oneofsArray[q].oneof),
            };
          if (q) Object.defineProperties(H.prototype, $);
        },
      },
    });
    jA.generateConstructor = function (_) {
      var q = QG.codegen(["p"], _.name);
      for (var $ = 0, K; $ < _.fieldsArray.length; ++$)
        if ((K = _._fieldsArray[$]).map) q("this%s={}", QG.safeProp(K.name));
        else if (K.repeated) q("this%s=[]", QG.safeProp(K.name));
      return q("if(p)for(var ks=Object.keys(p),i=0;i<ks.length;++i)if(p[ks[i]]!=null)")("this[ks[i]]=p[ks[i]]");
    };
    function _x_(H) {
      return (
        (H._fieldsById = H._fieldsArray = H._oneofsArray = null), delete H.encode, delete H.decode, delete H.verify, H
      );
    }
    jA.fromJSON = function (_, q) {
      var $ = new jA(_, q.options);
      ($.extensions = q.extensions), ($.reserved = q.reserved);
      var K = Object.keys(q.fields),
        O = 0;
      for (; O < K.length; ++O)
        $.add((typeof q.fields[K[O]].keyType < "u" ? DN1.fromJSON : Hx_.fromJSON)(K[O], q.fields[K[O]]));
      if (q.oneofs) for (K = Object.keys(q.oneofs), O = 0; O < K.length; ++O) $.add(Ol6.fromJSON(K[O], q.oneofs[K[O]]));
      if (q.nested)
        for (K = Object.keys(q.nested), O = 0; O < K.length; ++O) {
          var T = q.nested[K[O]];
          $.add(
            (T.id !== void 0
              ? Hx_.fromJSON
              : T.fields !== void 0
                ? jA.fromJSON
                : T.values !== void 0
                  ? YN1.fromJSON
                  : T.methods !== void 0
                    ? jN1.fromJSON
                    : dC.fromJSON)(K[O], T),
          );
        }
      if (q.extensions && q.extensions.length) $.extensions = q.extensions;
      if (q.reserved && q.reserved.length) $.reserved = q.reserved;
      if (q.group) $.group = !0;
      if (q.comment) $.comment = q.comment;
      if (q.edition) $._edition = q.edition;
      return ($._defaultEdition = "proto3"), $;
    };
    jA.prototype.toJSON = function (_) {
      var q = dC.prototype.toJSON.call(this, _),
        $ = _ ? Boolean(_.keepComments) : !1;
      return QG.toObject([
        "edition",
        this._editionToJSON(),
        "options",
        (q && q.options) || void 0,
        "oneofs",
        dC.arrayToJSON(this.oneofsArray, _),
        "fields",
        dC.arrayToJSON(
          this.fieldsArray.filter(function (K) {
            return !K.declaringField;
          }),
          _,
        ) || {},
        "extensions",
        this.extensions && this.extensions.length ? this.extensions : void 0,
        "reserved",
        this.reserved && this.reserved.length ? this.reserved : void 0,
        "group",
        this.group || void 0,
        "nested",
        (q && q.nested) || void 0,
        "comment",
        $ ? this.comment : void 0,
      ]);
    };
    jA.prototype.resolveAll = function () {
      if (!this._needsRecursiveResolve) return this;
      dC.prototype.resolveAll.call(this);
      var _ = this.oneofsArray;
      $ = 0;
      while ($ < _.length) _[$++].resolve();
      var q = this.fieldsArray,
        $ = 0;
      while ($ < q.length) q[$++].resolve();
      return this;
    };
    jA.prototype._resolveFeaturesRecursive = function (_) {
      if (!this._needsRecursiveFeatureResolution) return this;
      return (
        (_ = this._edition || _),
        dC.prototype._resolveFeaturesRecursive.call(this, _),
        this.oneofsArray.forEach((q) => {
          q._resolveFeatures(_);
        }),
        this.fieldsArray.forEach((q) => {
          q._resolveFeatures(_);
        }),
        this
      );
    };
    jA.prototype.get = function (_) {
      return this.fields[_] || (this.oneofs && this.oneofs[_]) || (this.nested && this.nested[_]) || null;
    };
    jA.prototype.add = function (_) {
      if (this.get(_.name)) throw Error("duplicate name '" + _.name + "' in " + this);
      if (_ instanceof Hx_ && _.extend === void 0) {
        if (this._fieldsById ? this._fieldsById[_.id] : this.fieldsById[_.id])
          throw Error("duplicate id " + _.id + " in " + this);
        if (this.isReservedId(_.id)) throw Error("id " + _.id + " is reserved in " + this);
        if (this.isReservedName(_.name)) throw Error("name '" + _.name + "' is reserved in " + this);
        if (_.parent) _.parent.remove(_);
        return (this.fields[_.name] = _), (_.message = this), _.onAdd(this), _x_(this);
      }
      if (_ instanceof Ol6) {
        if (!this.oneofs) this.oneofs = {};
        return (this.oneofs[_.name] = _), _.onAdd(this), _x_(this);
      }
      return dC.prototype.add.call(this, _);
    };
    jA.prototype.remove = function (_) {
      if (_ instanceof Hx_ && _.extend === void 0) {
        if (!this.fields || this.fields[_.name] !== _) throw Error(_ + " is not a member of " + this);
        return delete this.fields[_.name], (_.parent = null), _.onRemove(this), _x_(this);
      }
      if (_ instanceof Ol6) {
        if (!this.oneofs || this.oneofs[_.name] !== _) throw Error(_ + " is not a member of " + this);
        return delete this.oneofs[_.name], (_.parent = null), _.onRemove(this), _x_(this);
      }
      return dC.prototype.remove.call(this, _);
    };
    jA.prototype.isReservedId = function (_) {
      return dC.isReservedId(this.reserved, _);
    };
    jA.prototype.isReservedName = function (_) {
      return dC.isReservedName(this.reserved, _);
    };
    jA.prototype.create = function (_) {
      return new this.ctor(_);
    };
    jA.prototype.setup = function () {
      var _ = this.fullName,
        q = [];
      for (var $ = 0; $ < this.fieldsArray.length; ++$) q.push(this._fieldsArray[$].resolve().resolvedType);
      (this.encode = JN1(this)({ Writer: MN1, types: q, util: QG })),
        (this.decode = PN1(this)({ Reader: Kl6, types: q, util: QG })),
        (this.verify = XN1(this)({ types: q, util: QG })),
        (this.fromObject = Sd7.fromObject(this)({ types: q, util: QG })),
        (this.toObject = Sd7.toObject(this)({ types: q, util: QG }));
      var K = WN1[_];
      if (K) {
        var O = Object.create(this);
        (O.fromObject = this.fromObject),
          (this.fromObject = K.fromObject.bind(O)),
          (O.toObject = this.toObject),
          (this.toObject = K.toObject.bind(O));
      }
      return this;
    };
    jA.prototype.encode = function (_, q) {
      return this.setup().encode(_, q);
    };
    jA.prototype.encodeDelimited = function (_, q) {
      return this.encode(_, q && q.len ? q.fork() : q).ldelim();
    };
    jA.prototype.decode = function (_, q) {
      return this.setup().decode(_, q);
    };
    jA.prototype.decodeDelimited = function (_) {
      if (!(_ instanceof Kl6)) _ = Kl6.create(_);
      return this.decode(_, _.uint32());
    };
    jA.prototype.verify = function (_) {
      return this.setup().verify(_);
    };
    jA.prototype.fromObject = function (_) {
      return this.setup().fromObject(_);
    };
    jA.prototype.toObject = function (_, q) {
      return this.setup().toObject(_, q);
    };
    jA.d = function (_) {
      return function ($) {
        QG.decorateType($, _);
      };
    };
  });
