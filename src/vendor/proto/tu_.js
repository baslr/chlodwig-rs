  var tu_ = d((xgO, Zd7) => {
    Zd7.exports = Qy;
    var Qr = GNH();
    ((Qy.prototype = Object.create(Qr.prototype)).constructor = Qy).className = "Service";
    var rQ6 = su_(),
      YsH = RP(),
      _N1 = aU6();
    function Qy(H, _) {
      Qr.call(this, H, _), (this.methods = {}), (this._methodsArray = null);
    }
    Qy.fromJSON = function (_, q) {
      var $ = new Qy(_, q.options);
      if (q.methods)
        for (var K = Object.keys(q.methods), O = 0; O < K.length; ++O) $.add(rQ6.fromJSON(K[O], q.methods[K[O]]));
      if (q.nested) $.addJSON(q.nested);
      if (q.edition) $._edition = q.edition;
      return ($.comment = q.comment), ($._defaultEdition = "proto3"), $;
    };
    Qy.prototype.toJSON = function (_) {
      var q = Qr.prototype.toJSON.call(this, _),
        $ = _ ? Boolean(_.keepComments) : !1;
      return YsH.toObject([
        "edition",
        this._editionToJSON(),
        "options",
        (q && q.options) || void 0,
        "methods",
        Qr.arrayToJSON(this.methodsArray, _) || {},
        "nested",
        (q && q.nested) || void 0,
        "comment",
        $ ? this.comment : void 0,
      ]);
    };
    Object.defineProperty(Qy.prototype, "methodsArray", {
      get: function () {
        return this._methodsArray || (this._methodsArray = YsH.toArray(this.methods));
      },
    });
    function Rd7(H) {
      return (H._methodsArray = null), H;
    }
    Qy.prototype.get = function (_) {
      return this.methods[_] || Qr.prototype.get.call(this, _);
    };
    Qy.prototype.resolveAll = function () {
      if (!this._needsRecursiveResolve) return this;
      Qr.prototype.resolve.call(this);
      var _ = this.methodsArray;
      for (var q = 0; q < _.length; ++q) _[q].resolve();
      return this;
    };
    Qy.prototype._resolveFeaturesRecursive = function (_) {
      if (!this._needsRecursiveFeatureResolution) return this;
      return (
        (_ = this._edition || _),
        Qr.prototype._resolveFeaturesRecursive.call(this, _),
        this.methodsArray.forEach((q) => {
          q._resolveFeaturesRecursive(_);
        }),
        this
      );
    };
    Qy.prototype.add = function (_) {
      if (this.get(_.name)) throw Error("duplicate name '" + _.name + "' in " + this);
      if (_ instanceof rQ6) return (this.methods[_.name] = _), (_.parent = this), Rd7(this);
      return Qr.prototype.add.call(this, _);
    };
    Qy.prototype.remove = function (_) {
      if (_ instanceof rQ6) {
        if (this.methods[_.name] !== _) throw Error(_ + " is not a member of " + this);
        return delete this.methods[_.name], (_.parent = null), Rd7(this);
      }
      return Qr.prototype.remove.call(this, _);
    };
    Qy.prototype.create = function (_, q, $) {
      var K = new _N1.Service(_, q, $);
      for (var O = 0, T; O < this.methodsArray.length; ++O) {
        var z = YsH.lcFirst((T = this._methodsArray[O]).resolve().name).replace(/[^$\w_]/g, "");
        K[z] = YsH.codegen(["r", "c"], YsH.isReserved(z) ? z + "_" : z)("return this.rpcCall(m,q,s,r,c)")({
          m: T,
          q: T.resolvedRequestType.ctor,
          s: T.resolvedResponseType.ctor,
        });
      }
      return K;
    };
  });
