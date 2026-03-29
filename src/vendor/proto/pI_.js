  var pI_ = d((ABO, Dp7) => {
    Dp7.exports = S2;
    var Hm = Vc(),
      rU6,
      wp7 = Hm.LongBits,
      nG1 = Hm.utf8;
    function _m(H, _) {
      return RangeError("index out of range: " + H.pos + " + " + (_ || 1) + " > " + H.len);
    }
    function S2(H) {
      (this.buf = H), (this.pos = 0), (this.len = H.length);
    }
    var Ap7 =
        typeof Uint8Array < "u"
          ? function (_) {
              if (_ instanceof Uint8Array || Array.isArray(_)) return new S2(_);
              throw Error("illegal buffer");
            }
          : function (_) {
              if (Array.isArray(_)) return new S2(_);
              throw Error("illegal buffer");
            },
      Yp7 = function () {
        return Hm.Buffer
          ? function (q) {
              return (S2.create = function (K) {
                return Hm.Buffer.isBuffer(K) ? new rU6(K) : Ap7(K);
              })(q);
            }
          : Ap7;
      };
    S2.create = Yp7();
    S2.prototype._slice = Hm.Array.prototype.subarray || Hm.Array.prototype.slice;
    S2.prototype.uint32 = (function () {
      var _ = 4294967295;
      return function () {
        if (((_ = (this.buf[this.pos] & 127) >>> 0), this.buf[this.pos++] < 128)) return _;
        if (((_ = (_ | ((this.buf[this.pos] & 127) << 7)) >>> 0), this.buf[this.pos++] < 128)) return _;
        if (((_ = (_ | ((this.buf[this.pos] & 127) << 14)) >>> 0), this.buf[this.pos++] < 128)) return _;
        if (((_ = (_ | ((this.buf[this.pos] & 127) << 21)) >>> 0), this.buf[this.pos++] < 128)) return _;
        if (((_ = (_ | ((this.buf[this.pos] & 15) << 28)) >>> 0), this.buf[this.pos++] < 128)) return _;
        if ((this.pos += 5) > this.len) throw ((this.pos = this.len), _m(this, 10));
        return _;
      };
    })();
    S2.prototype.int32 = function () {
      return this.uint32() | 0;
    };
    S2.prototype.sint32 = function () {
      var _ = this.uint32();
      return ((_ >>> 1) ^ -(_ & 1)) | 0;
    };
    function nU6() {
      var H = new wp7(0, 0),
        _ = 0;
      if (this.len - this.pos > 4) {
        for (; _ < 4; ++_)
          if (((H.lo = (H.lo | ((this.buf[this.pos] & 127) << (_ * 7))) >>> 0), this.buf[this.pos++] < 128)) return H;
        if (
          ((H.lo = (H.lo | ((this.buf[this.pos] & 127) << 28)) >>> 0),
          (H.hi = (H.hi | ((this.buf[this.pos] & 127) >> 4)) >>> 0),
          this.buf[this.pos++] < 128)
        )
          return H;
        _ = 0;
      } else {
        for (; _ < 3; ++_) {
          if (this.pos >= this.len) throw _m(this);
          if (((H.lo = (H.lo | ((this.buf[this.pos] & 127) << (_ * 7))) >>> 0), this.buf[this.pos++] < 128)) return H;
        }
        return (H.lo = (H.lo | ((this.buf[this.pos++] & 127) << (_ * 7))) >>> 0), H;
      }
      if (this.len - this.pos > 4) {
        for (; _ < 5; ++_)
          if (((H.hi = (H.hi | ((this.buf[this.pos] & 127) << (_ * 7 + 3))) >>> 0), this.buf[this.pos++] < 128))
            return H;
      } else
        for (; _ < 5; ++_) {
          if (this.pos >= this.len) throw _m(this);
          if (((H.hi = (H.hi | ((this.buf[this.pos] & 127) << (_ * 7 + 3))) >>> 0), this.buf[this.pos++] < 128))
            return H;
        }
      throw Error("invalid varint encoding");
    }
    S2.prototype.bool = function () {
      return this.uint32() !== 0;
    };
    function mI_(H, _) {
      return (H[_ - 4] | (H[_ - 3] << 8) | (H[_ - 2] << 16) | (H[_ - 1] << 24)) >>> 0;
    }
    S2.prototype.fixed32 = function () {
      if (this.pos + 4 > this.len) throw _m(this, 4);
      return mI_(this.buf, (this.pos += 4));
    };
    S2.prototype.sfixed32 = function () {
      if (this.pos + 4 > this.len) throw _m(this, 4);
      return mI_(this.buf, (this.pos += 4)) | 0;
    };
    function fp7() {
      if (this.pos + 8 > this.len) throw _m(this, 8);
      return new wp7(mI_(this.buf, (this.pos += 4)), mI_(this.buf, (this.pos += 4)));
    }
    S2.prototype.float = function () {
      if (this.pos + 4 > this.len) throw _m(this, 4);
      var _ = Hm.float.readFloatLE(this.buf, this.pos);
      return (this.pos += 4), _;
    };
    S2.prototype.double = function () {
      if (this.pos + 8 > this.len) throw _m(this, 4);
      var _ = Hm.float.readDoubleLE(this.buf, this.pos);
      return (this.pos += 8), _;
    };
    S2.prototype.bytes = function () {
      var _ = this.uint32(),
        q = this.pos,
        $ = this.pos + _;
      if ($ > this.len) throw _m(this, _);
      if (((this.pos += _), Array.isArray(this.buf))) return this.buf.slice(q, $);
      if (q === $) {
        var K = Hm.Buffer;
        return K ? K.alloc(0) : new this.buf.constructor(0);
      }
      return this._slice.call(this.buf, q, $);
    };
    S2.prototype.string = function () {
      var _ = this.bytes();
      return nG1.read(_, 0, _.length);
    };
    S2.prototype.skip = function (_) {
      if (typeof _ === "number") {
        if (this.pos + _ > this.len) throw _m(this, _);
        this.pos += _;
      } else
        do if (this.pos >= this.len) throw _m(this);
        while (this.buf[this.pos++] & 128);
      return this;
    };
    S2.prototype.skipType = function (H) {
      switch (H) {
        case 0:
          this.skip();
          break;
        case 1:
          this.skip(8);
          break;
        case 2:
          this.skip(this.uint32());
          break;
        case 3:
          while ((H = this.uint32() & 7) !== 4) this.skipType(H);
          break;
        case 5:
          this.skip(4);
          break;
        default:
          throw Error("invalid wire type " + H + " at offset " + this.pos);
      }
      return this;
    };
    S2._configure = function (H) {
      (rU6 = H), (S2.create = Yp7()), rU6._configure();
      var _ = Hm.Long ? "toLong" : "toNumber";
      Hm.merge(S2.prototype, {
        int64: function () {
          return nU6.call(this)[_](!1);
        },
        uint64: function () {
          return nU6.call(this)[_](!0);
        },
        sint64: function () {
          return nU6.call(this).zzDecode()[_](!1);
        },
        fixed64: function () {
          return fp7.call(this)[_](!0);
        },
        sfixed64: function () {
          return fp7.call(this)[_](!1);
        },
      });
    };
  });
