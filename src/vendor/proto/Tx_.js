  var Tx_ = d((FgO, Id7) => {
    Id7.exports = ly;
    var Ox_ = GNH();
    ((ly.prototype = Object.create(Ox_.prototype)).constructor = ly).className = "Root";
    var $x_ = K7H(),
      zl6 = Am(),
      GN1 = pAH(),
      T7H = RP(),
      Al6,
      fl6,
      jsH;
    function ly(H) {
      Ox_.call(this, "", H),
        (this.deferred = []),
        (this.files = []),
        (this._edition = "proto2"),
        (this._fullyQualifiedObjects = {});
    }
    ly.fromJSON = function (_, q) {
      if (!q) q = new ly();
      if (_.options) q.setOptions(_.options);
      return q.addJSON(_.nested).resolveAll();
    };
    ly.prototype.resolvePath = T7H.path.resolve;
    ly.prototype.fetch = T7H.fetch;
    function bd7() {}
    ly.prototype.load = function H(_, q, $) {
      if (typeof q === "function") ($ = q), (q = void 0);
      var K = this;
      if (!$) return T7H.asPromise(H, K, _, q);
      var O = $ === bd7;
      function T(j, M) {
        if (!$) return;
        if (O) throw j;
        if (M) M.resolveAll();
        var J = $;
        ($ = null), J(j, M);
      }
      function z(j) {
        var M = j.lastIndexOf("google/protobuf/");
        if (M > -1) {
          var J = j.substring(M);
          if (J in jsH) return J;
        }
        return null;
      }
      function A(j, M) {
        try {
          if (T7H.isString(M) && M.charAt(0) === "{") M = JSON.parse(M);
          if (!T7H.isString(M)) K.setOptions(M.options).addJSON(M.nested);
          else {
            fl6.filename = j;
            var J = fl6(M, K, q),
              P,
              X = 0;
            if (J.imports) {
              for (; X < J.imports.length; ++X) if ((P = z(J.imports[X]) || K.resolvePath(j, J.imports[X]))) f(P);
            }
            if (J.weakImports) {
              for (X = 0; X < J.weakImports.length; ++X)
                if ((P = z(J.weakImports[X]) || K.resolvePath(j, J.weakImports[X]))) f(P, !0);
            }
          }
        } catch (R) {
          T(R);
        }
        if (!O && !w) T(null, K);
      }
      function f(j, M) {
        if (((j = z(j) || j), K.files.indexOf(j) > -1)) return;
        if ((K.files.push(j), j in jsH)) {
          if (O) A(j, jsH[j]);
          else
            ++w,
              setTimeout(function () {
                --w, A(j, jsH[j]);
              });
          return;
        }
        if (O) {
          var J;
          try {
            J = T7H.fs.readFileSync(j).toString("utf8");
          } catch (P) {
            if (!M) T(P);
            return;
          }
          A(j, J);
        } else
          ++w,
            K.fetch(j, function (P, X) {
              if ((--w, !$)) return;
              if (P) {
                if (!M) T(P);
                else if (!w) T(null, K);
                return;
              }
              A(j, X);
            });
      }
      var w = 0;
      if (T7H.isString(_)) _ = [_];
      for (var Y = 0, D; Y < _.length; ++Y) if ((D = K.resolvePath("", _[Y]))) f(D);
      if (O) return K.resolveAll(), K;
      if (!w) T(null, K);
      return K;
    };
    ly.prototype.loadSync = function (_, q) {
      if (!T7H.isNode) throw Error("not supported");
      return this.load(_, q, bd7);
    };
    ly.prototype.resolveAll = function () {
      if (!this._needsRecursiveResolve) return this;
      if (this.deferred.length)
        throw Error(
          "unresolvable extensions: " +
            this.deferred
              .map(function (_) {
                return "'extend " + _.extend + "' in " + _.parent.fullName;
              })
              .join(", "),
        );
      return Ox_.prototype.resolveAll.call(this);
    };
    var Kx_ = /^[A-Z]/;
    function Cd7(H, _) {
      var q = _.parent.lookup(_.extend);
      if (q) {
        var $ = new $x_(_.fullName, _.id, _.type, _.rule, void 0, _.options);
        if (q.get($.name)) return !0;
        return ($.declaringField = _), (_.extensionField = $), q.add($), !0;
      }
      return !1;
    }
    ly.prototype._handleAdd = function (_) {
      if (_ instanceof $x_) {
        if (_.extend !== void 0 && !_.extensionField) {
          if (!Cd7(this, _)) this.deferred.push(_);
        }
      } else if (_ instanceof zl6) {
        if (Kx_.test(_.name)) _.parent[_.name] = _.values;
      } else if (!(_ instanceof GN1)) {
        if (_ instanceof Al6)
          for (var q = 0; q < this.deferred.length; )
            if (Cd7(this, this.deferred[q])) this.deferred.splice(q, 1);
            else ++q;
        for (var $ = 0; $ < _.nestedArray.length; ++$) this._handleAdd(_._nestedArray[$]);
        if (Kx_.test(_.name)) _.parent[_.name] = _;
      }
      if (_ instanceof Al6 || _ instanceof zl6 || _ instanceof $x_) this._fullyQualifiedObjects[_.fullName] = _;
    };
    ly.prototype._handleRemove = function (_) {
      if (_ instanceof $x_) {
        if (_.extend !== void 0)
          if (_.extensionField) _.extensionField.parent.remove(_.extensionField), (_.extensionField = null);
          else {
            var q = this.deferred.indexOf(_);
            if (q > -1) this.deferred.splice(q, 1);
          }
      } else if (_ instanceof zl6) {
        if (Kx_.test(_.name)) delete _.parent[_.name];
      } else if (_ instanceof Ox_) {
        for (var $ = 0; $ < _.nestedArray.length; ++$) this._handleRemove(_._nestedArray[$]);
        if (Kx_.test(_.name)) delete _.parent[_.name];
      }
      delete this._fullyQualifiedObjects[_.fullName];
    };
    ly._configure = function (H, _, q) {
      (Al6 = H), (fl6 = _), (jsH = q);
    };
  });
