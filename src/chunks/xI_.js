  var xI_ = d((TBO, Kp7) => {
    Kp7.exports = n3;
    var xC = Vc(),
      cU6,
      uI_ = xC.LongBits,
      _p7 = xC.base64,
      qp7 = xC.utf8;
    function QaH(H, _, q) {
      (this.fn = H), (this.len = _), (this.next = void 0), (this.val = q);
    }
    function UU6() {}
    function UG1(H) {
      (this.head = H.head), (this.tail = H.tail), (this.len = H.len), (this.next = H.states);
    }
    function n3() {
      (this.len = 0), (this.head = new QaH(UU6, 0, 0)), (this.tail = this.head), (this.states = null);
    }
    var $p7 = function () {
      return xC.Buffer
        ? function () {
            return (n3.create = function () {
              return new cU6();
            })();
          }
        : function () {
            return new n3();
          };
    };
    n3.create = $p7();
    n3.alloc = function (_) {
      return new xC.Array(_);
    };
    if (xC.Array !== Array) n3.alloc = xC.pool(n3.alloc, xC.Array.prototype.subarray);
    n3.prototype._push = function (_, q, $) {
      return (this.tail = this.tail.next = new QaH(_, q, $)), (this.len += q), this;
    };
    function QU6(H, _, q) {
      _[q] = H & 255;
    }
    function QG1(H, _, q) {
      while (H > 127) (_[q++] = (H & 127) | 128), (H >>>= 7);
      _[q] = H;
    }
    function lU6(H, _) {
      (this.len = H), (this.next = void 0), (this.val = _);
    }
    lU6.prototype = Object.create(QaH.prototype);
    lU6.prototype.fn = QG1;
    n3.prototype.uint32 = function (_) {
      return (
        (this.len += (this.tail = this.tail.next =
          new lU6((_ = _ >>> 0) < 128 ? 1 : _ < 16384 ? 2 : _ < 2097152 ? 3 : _ < 268435456 ? 4 : 5, _)).len),
        this
      );
    };
    n3.prototype.int32 = function (_) {
      return _ < 0 ? this._push(iU6, 10, uI_.fromNumber(_)) : this.uint32(_);
    };
    n3.prototype.sint32 = function (_) {
      return this.uint32(((_ << 1) ^ (_ >> 31)) >>> 0);
    };
    function iU6(H, _, q) {
      while (H.hi) (_[q++] = (H.lo & 127) | 128), (H.lo = ((H.lo >>> 7) | (H.hi << 25)) >>> 0), (H.hi >>>= 7);
      while (H.lo > 127) (_[q++] = (H.lo & 127) | 128), (H.lo = H.lo >>> 7);
      _[q++] = H.lo;
    }
    n3.prototype.uint64 = function (_) {
      var q = uI_.from(_);
      return this._push(iU6, q.length(), q);
    };
    n3.prototype.int64 = n3.prototype.uint64;
    n3.prototype.sint64 = function (_) {
      var q = uI_.from(_).zzEncode();
      return this._push(iU6, q.length(), q);
    };
    n3.prototype.bool = function (_) {
      return this._push(QU6, 1, _ ? 1 : 0);
    };
    function FU6(H, _, q) {
      (_[q] = H & 255), (_[q + 1] = (H >>> 8) & 255), (_[q + 2] = (H >>> 16) & 255), (_[q + 3] = H >>> 24);
    }
    n3.prototype.fixed32 = function (_) {
      return this._push(FU6, 4, _ >>> 0);
    };
    n3.prototype.sfixed32 = n3.prototype.fixed32;
    n3.prototype.fixed64 = function (_) {
      var q = uI_.from(_);
      return this._push(FU6, 4, q.lo)._push(FU6, 4, q.hi);
    };
    n3.prototype.sfixed64 = n3.prototype.fixed64;
    n3.prototype.float = function (_) {
      return this._push(xC.float.writeFloatLE, 4, _);
    };
    n3.prototype.double = function (_) {
      return this._push(xC.float.writeDoubleLE, 8, _);
    };
    var lG1 = xC.Array.prototype.set
      ? function (_, q, $) {
          q.set(_, $);
        }
      : function (_, q, $) {
          for (var K = 0; K < _.length; ++K) q[$ + K] = _[K];
        };
    n3.prototype.bytes = function (_) {
      var q = _.length >>> 0;
      if (!q) return this._push(QU6, 1, 0);
      if (xC.isString(_)) {
        var $ = n3.alloc((q = _p7.length(_)));
        _p7.decode(_, $, 0), (_ = $);
      }
      return this.uint32(q)._push(lG1, q, _);
    };
    n3.prototype.string = function (_) {
      var q = qp7.length(_);
      return q ? this.uint32(q)._push(qp7.write, q, _) : this._push(QU6, 1, 0);
    };
    n3.prototype.fork = function () {
      return (this.states = new UG1(this)), (this.head = this.tail = new QaH(UU6, 0, 0)), (this.len = 0), this;
    };
    n3.prototype.reset = function () {
      if (this.states)
        (this.head = this.states.head),
          (this.tail = this.states.tail),
          (this.len = this.states.len),
          (this.states = this.states.next);
      else (this.head = this.tail = new QaH(UU6, 0, 0)), (this.len = 0);
      return this;
    };
    n3.prototype.ldelim = function () {
      var _ = this.head,
        q = this.tail,
        $ = this.len;
      if ((this.reset().uint32($), $)) (this.tail.next = _.next), (this.tail = q), (this.len += $);
      return this;
    };
    n3.prototype.finish = function () {
      var _ = this.head.next,
        q = this.constructor.alloc(this.len),
        $ = 0;
      while (_) _.fn(_.val, q, $), ($ += _.len), (_ = _.next);
      return q;
    };
    n3._configure = function (H) {
      (cU6 = H), (n3.create = $p7()), cU6._configure();
    };
  });
