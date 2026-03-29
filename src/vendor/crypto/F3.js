  var F3 = d((Il3, I77) => {
    var E77 = XK(),
      C77 = S77(),
      e_ = (I77.exports = E77.util = E77.util || {});
    (function () {
      if (typeof process < "u" && process.nextTick) {
        if (((e_.nextTick = process.nextTick), typeof setImmediate === "function")) e_.setImmediate = setImmediate;
        else e_.setImmediate = e_.nextTick;
        return;
      }
      if (typeof setImmediate === "function") {
        (e_.setImmediate = function () {
          return setImmediate.apply(void 0, arguments);
        }),
          (e_.nextTick = function (z) {
            return setImmediate(z);
          });
        return;
      }
      if (
        ((e_.setImmediate = function (z) {
          setTimeout(z, 0);
        }),
        typeof window < "u" && typeof window.postMessage === "function")
      ) {
        let z = function (A) {
          if (A.source === window && A.data === H) {
            A.stopPropagation();
            var f = _.slice();
            (_.length = 0),
              f.forEach(function (w) {
                w();
              });
          }
        };
        var T = z,
          H = "forge.setImmediate",
          _ = [];
        (e_.setImmediate = function (A) {
          if ((_.push(A), _.length === 1)) window.postMessage(H, "*");
        }),
          window.addEventListener("message", z, !0);
      }
      if (typeof MutationObserver < "u") {
        var q = Date.now(),
          $ = !0,
          K = document.createElement("div"),
          _ = [];
        new MutationObserver(function () {
          var A = _.slice();
          (_.length = 0),
            A.forEach(function (f) {
              f();
            });
        }).observe(K, { attributes: !0 });
        var O = e_.setImmediate;
        e_.setImmediate = function (A) {
          if (Date.now() - q > 15) (q = Date.now()), O(A);
          else if ((_.push(A), _.length === 1)) K.setAttribute("a", ($ = !$));
        };
      }
      e_.nextTick = e_.setImmediate;
    })();
    e_.isNodejs = typeof process < "u" && process.versions && process.versions.node;
    e_.globalScope = (function () {
      if (e_.isNodejs) return global;
      return typeof self > "u" ? window : self;
    })();
    e_.isArray =
      Array.isArray ||
      function (H) {
        return Object.prototype.toString.call(H) === "[object Array]";
      };
    e_.isArrayBuffer = function (H) {
      return typeof ArrayBuffer < "u" && H instanceof ArrayBuffer;
    };
    e_.isArrayBufferView = function (H) {
      return H && e_.isArrayBuffer(H.buffer) && H.byteLength !== void 0;
    };
    function ylH(H) {
      if (!(H === 8 || H === 16 || H === 24 || H === 32)) throw Error("Only 8, 16, 24, or 32 bits supported: " + H);
    }
    e_.ByteBuffer = FE6;
    function FE6(H) {
      if (((this.data = ""), (this.read = 0), typeof H === "string")) this.data = H;
      else if (e_.isArrayBuffer(H) || e_.isArrayBufferView(H))
        if (typeof Buffer < "u" && H instanceof Buffer) this.data = H.toString("binary");
        else {
          var _ = new Uint8Array(H);
          try {
            this.data = String.fromCharCode.apply(null, _);
          } catch ($) {
            for (var q = 0; q < _.length; ++q) this.putByte(_[q]);
          }
        }
      else if (H instanceof FE6 || (typeof H === "object" && typeof H.data === "string" && typeof H.read === "number"))
        (this.data = H.data), (this.read = H.read);
      this._constructedStringLength = 0;
    }
    e_.ByteStringBuffer = FE6;
    var jd4 = 4096;
    e_.ByteStringBuffer.prototype._optimizeConstructedString = function (H) {
      if (((this._constructedStringLength += H), this._constructedStringLength > jd4))
        this.data.substr(0, 1), (this._constructedStringLength = 0);
    };
    e_.ByteStringBuffer.prototype.length = function () {
      return this.data.length - this.read;
    };
    e_.ByteStringBuffer.prototype.isEmpty = function () {
      return this.length() <= 0;
    };
    e_.ByteStringBuffer.prototype.putByte = function (H) {
      return this.putBytes(String.fromCharCode(H));
    };
    e_.ByteStringBuffer.prototype.fillWithByte = function (H, _) {
      H = String.fromCharCode(H);
      var q = this.data;
      while (_ > 0) {
        if (_ & 1) q += H;
        if (((_ >>>= 1), _ > 0)) H += H;
      }
      return (this.data = q), this._optimizeConstructedString(_), this;
    };
    e_.ByteStringBuffer.prototype.putBytes = function (H) {
      return (this.data += H), this._optimizeConstructedString(H.length), this;
    };
    e_.ByteStringBuffer.prototype.putString = function (H) {
      return this.putBytes(e_.encodeUtf8(H));
    };
    e_.ByteStringBuffer.prototype.putInt16 = function (H) {
      return this.putBytes(String.fromCharCode((H >> 8) & 255) + String.fromCharCode(H & 255));
    };
    e_.ByteStringBuffer.prototype.putInt24 = function (H) {
      return this.putBytes(
        String.fromCharCode((H >> 16) & 255) + String.fromCharCode((H >> 8) & 255) + String.fromCharCode(H & 255),
      );
    };
    e_.ByteStringBuffer.prototype.putInt32 = function (H) {
      return this.putBytes(
        String.fromCharCode((H >> 24) & 255) +
          String.fromCharCode((H >> 16) & 255) +
          String.fromCharCode((H >> 8) & 255) +
          String.fromCharCode(H & 255),
      );
    };
    e_.ByteStringBuffer.prototype.putInt16Le = function (H) {
      return this.putBytes(String.fromCharCode(H & 255) + String.fromCharCode((H >> 8) & 255));
    };
    e_.ByteStringBuffer.prototype.putInt24Le = function (H) {
      return this.putBytes(
        String.fromCharCode(H & 255) + String.fromCharCode((H >> 8) & 255) + String.fromCharCode((H >> 16) & 255),
      );
    };
    e_.ByteStringBuffer.prototype.putInt32Le = function (H) {
      return this.putBytes(
        String.fromCharCode(H & 255) +
          String.fromCharCode((H >> 8) & 255) +
          String.fromCharCode((H >> 16) & 255) +
          String.fromCharCode((H >> 24) & 255),
      );
    };
    e_.ByteStringBuffer.prototype.putInt = function (H, _) {
      ylH(_);
      var q = "";
      do (_ -= 8), (q += String.fromCharCode((H >> _) & 255));
      while (_ > 0);
      return this.putBytes(q);
    };
    e_.ByteStringBuffer.prototype.putSignedInt = function (H, _) {
      if (H < 0) H += 2 << (_ - 1);
      return this.putInt(H, _);
    };
    e_.ByteStringBuffer.prototype.putBuffer = function (H) {
      return this.putBytes(H.getBytes());
    };
    e_.ByteStringBuffer.prototype.getByte = function () {
      return this.data.charCodeAt(this.read++);
    };
    e_.ByteStringBuffer.prototype.getInt16 = function () {
      var H = (this.data.charCodeAt(this.read) << 8) ^ this.data.charCodeAt(this.read + 1);
      return (this.read += 2), H;
    };
    e_.ByteStringBuffer.prototype.getInt24 = function () {
      var H =
        (this.data.charCodeAt(this.read) << 16) ^
        (this.data.charCodeAt(this.read + 1) << 8) ^
        this.data.charCodeAt(this.read + 2);
      return (this.read += 3), H;
    };
    e_.ByteStringBuffer.prototype.getInt32 = function () {
      var H =
        (this.data.charCodeAt(this.read) << 24) ^
        (this.data.charCodeAt(this.read + 1) << 16) ^
        (this.data.charCodeAt(this.read + 2) << 8) ^
        this.data.charCodeAt(this.read + 3);
      return (this.read += 4), H;
    };
    e_.ByteStringBuffer.prototype.getInt16Le = function () {
      var H = this.data.charCodeAt(this.read) ^ (this.data.charCodeAt(this.read + 1) << 8);
      return (this.read += 2), H;
    };
    e_.ByteStringBuffer.prototype.getInt24Le = function () {
      var H =
        this.data.charCodeAt(this.read) ^
        (this.data.charCodeAt(this.read + 1) << 8) ^
        (this.data.charCodeAt(this.read + 2) << 16);
      return (this.read += 3), H;
    };
    e_.ByteStringBuffer.prototype.getInt32Le = function () {
      var H =
        this.data.charCodeAt(this.read) ^
        (this.data.charCodeAt(this.read + 1) << 8) ^
        (this.data.charCodeAt(this.read + 2) << 16) ^
        (this.data.charCodeAt(this.read + 3) << 24);
      return (this.read += 4), H;
    };
    e_.ByteStringBuffer.prototype.getInt = function (H) {
      ylH(H);
      var _ = 0;
      do (_ = (_ << 8) + this.data.charCodeAt(this.read++)), (H -= 8);
      while (H > 0);
      return _;
    };
    e_.ByteStringBuffer.prototype.getSignedInt = function (H) {
      var _ = this.getInt(H),
        q = 2 << (H - 2);
      if (_ >= q) _ -= q << 1;
      return _;
    };
    e_.ByteStringBuffer.prototype.getBytes = function (H) {
      var _;
      if (H) (H = Math.min(this.length(), H)), (_ = this.data.slice(this.read, this.read + H)), (this.read += H);
      else if (H === 0) _ = "";
      else (_ = this.read === 0 ? this.data : this.data.slice(this.read)), this.clear();
      return _;
    };
    e_.ByteStringBuffer.prototype.bytes = function (H) {
      return typeof H > "u" ? this.data.slice(this.read) : this.data.slice(this.read, this.read + H);
    };
    e_.ByteStringBuffer.prototype.at = function (H) {
      return this.data.charCodeAt(this.read + H);
    };
    e_.ByteStringBuffer.prototype.setAt = function (H, _) {
      return (
        (this.data = this.data.substr(0, this.read + H) + String.fromCharCode(_) + this.data.substr(this.read + H + 1)),
        this
      );
    };
    e_.ByteStringBuffer.prototype.last = function () {
      return this.data.charCodeAt(this.data.length - 1);
    };
    e_.ByteStringBuffer.prototype.copy = function () {
      var H = e_.createBuffer(this.data);
      return (H.read = this.read), H;
    };
    e_.ByteStringBuffer.prototype.compact = function () {
      if (this.read > 0) (this.data = this.data.slice(this.read)), (this.read = 0);
      return this;
    };
    e_.ByteStringBuffer.prototype.clear = function () {
      return (this.data = ""), (this.read = 0), this;
    };
    e_.ByteStringBuffer.prototype.truncate = function (H) {
      var _ = Math.max(0, this.length() - H);
      return (this.data = this.data.substr(this.read, _)), (this.read = 0), this;
    };
    e_.ByteStringBuffer.prototype.toHex = function () {
      var H = "";
      for (var _ = this.read; _ < this.data.length; ++_) {
        var q = this.data.charCodeAt(_);
        if (q < 16) H += "0";
        H += q.toString(16);
      }
      return H;
    };
    e_.ByteStringBuffer.prototype.toString = function () {
      return e_.decodeUtf8(this.bytes());
    };
    function Md4(H, _) {
      (_ = _ || {}), (this.read = _.readOffset || 0), (this.growSize = _.growSize || 1024);
      var q = e_.isArrayBuffer(H),
        $ = e_.isArrayBufferView(H);
      if (q || $) {
        if (q) this.data = new DataView(H);
        else this.data = new DataView(H.buffer, H.byteOffset, H.byteLength);
        this.write = "writeOffset" in _ ? _.writeOffset : this.data.byteLength;
        return;
      }
      if (((this.data = new DataView(new ArrayBuffer(0))), (this.write = 0), H !== null && H !== void 0))
        this.putBytes(H);
      if ("writeOffset" in _) this.write = _.writeOffset;
    }
    e_.DataBuffer = Md4;
    e_.DataBuffer.prototype.length = function () {
      return this.write - this.read;
    };
    e_.DataBuffer.prototype.isEmpty = function () {
      return this.length() <= 0;
    };
    e_.DataBuffer.prototype.accommodate = function (H, _) {
      if (this.length() >= H) return this;
      _ = Math.max(_ || this.growSize, H);
      var q = new Uint8Array(this.data.buffer, this.data.byteOffset, this.data.byteLength),
        $ = new Uint8Array(this.length() + _);
      return $.set(q), (this.data = new DataView($.buffer)), this;
    };
    e_.DataBuffer.prototype.putByte = function (H) {
      return this.accommodate(1), this.data.setUint8(this.write++, H), this;
    };
    e_.DataBuffer.prototype.fillWithByte = function (H, _) {
      this.accommodate(_);
      for (var q = 0; q < _; ++q) this.data.setUint8(H);
      return this;
    };
    e_.DataBuffer.prototype.putBytes = function (H, _) {
      if (e_.isArrayBufferView(H)) {
        var q = new Uint8Array(H.buffer, H.byteOffset, H.byteLength),
          $ = q.byteLength - q.byteOffset;
        this.accommodate($);
        var K = new Uint8Array(this.data.buffer, this.write);
        return K.set(q), (this.write += $), this;
      }
      if (e_.isArrayBuffer(H)) {
        var q = new Uint8Array(H);
        this.accommodate(q.byteLength);
        var K = new Uint8Array(this.data.buffer);
        return K.set(q, this.write), (this.write += q.byteLength), this;
      }
      if (
        H instanceof e_.DataBuffer ||
        (typeof H === "object" &&
          typeof H.read === "number" &&
          typeof H.write === "number" &&
          e_.isArrayBufferView(H.data))
      ) {
        var q = new Uint8Array(H.data.byteLength, H.read, H.length());
        this.accommodate(q.byteLength);
        var K = new Uint8Array(H.data.byteLength, this.write);
        return K.set(q), (this.write += q.byteLength), this;
      }
      if (H instanceof e_.ByteStringBuffer) (H = H.data), (_ = "binary");
      if (((_ = _ || "binary"), typeof H === "string")) {
        var O;
        if (_ === "hex")
          return (
            this.accommodate(Math.ceil(H.length / 2)),
            (O = new Uint8Array(this.data.buffer, this.write)),
            (this.write += e_.binary.hex.decode(H, O, this.write)),
            this
          );
        if (_ === "base64")
          return (
            this.accommodate(Math.ceil(H.length / 4) * 3),
            (O = new Uint8Array(this.data.buffer, this.write)),
            (this.write += e_.binary.base64.decode(H, O, this.write)),
            this
          );
        if (_ === "utf8") (H = e_.encodeUtf8(H)), (_ = "binary");
        if (_ === "binary" || _ === "raw")
          return (
            this.accommodate(H.length),
            (O = new Uint8Array(this.data.buffer, this.write)),
            (this.write += e_.binary.raw.decode(O)),
            this
          );
        if (_ === "utf16")
          return (
            this.accommodate(H.length * 2),
            (O = new Uint16Array(this.data.buffer, this.write)),
            (this.write += e_.text.utf16.encode(O)),
            this
          );
        throw Error("Invalid encoding: " + _);
      }
      throw Error("Invalid parameter: " + H);
    };
    e_.DataBuffer.prototype.putBuffer = function (H) {
      return this.putBytes(H), H.clear(), this;
    };
    e_.DataBuffer.prototype.putString = function (H) {
      return this.putBytes(H, "utf16");
    };
    e_.DataBuffer.prototype.putInt16 = function (H) {
      return this.accommodate(2), this.data.setInt16(this.write, H), (this.write += 2), this;
    };
    e_.DataBuffer.prototype.putInt24 = function (H) {
      return (
        this.accommodate(3),
        this.data.setInt16(this.write, (H >> 8) & 65535),
        this.data.setInt8(this.write, (H >> 16) & 255),
        (this.write += 3),
        this
      );
    };
    e_.DataBuffer.prototype.putInt32 = function (H) {
      return this.accommodate(4), this.data.setInt32(this.write, H), (this.write += 4), this;
    };
    e_.DataBuffer.prototype.putInt16Le = function (H) {
      return this.accommodate(2), this.data.setInt16(this.write, H, !0), (this.write += 2), this;
    };
    e_.DataBuffer.prototype.putInt24Le = function (H) {
      return (
        this.accommodate(3),
        this.data.setInt8(this.write, (H >> 16) & 255),
        this.data.setInt16(this.write, (H >> 8) & 65535, !0),
        (this.write += 3),
        this
      );
    };
    e_.DataBuffer.prototype.putInt32Le = function (H) {
      return this.accommodate(4), this.data.setInt32(this.write, H, !0), (this.write += 4), this;
    };
    e_.DataBuffer.prototype.putInt = function (H, _) {
      ylH(_), this.accommodate(_ / 8);
      do (_ -= 8), this.data.setInt8(this.write++, (H >> _) & 255);
      while (_ > 0);
      return this;
    };
    e_.DataBuffer.prototype.putSignedInt = function (H, _) {
      if ((ylH(_), this.accommodate(_ / 8), H < 0)) H += 2 << (_ - 1);
      return this.putInt(H, _);
    };
    e_.DataBuffer.prototype.getByte = function () {
      return this.data.getInt8(this.read++);
    };
    e_.DataBuffer.prototype.getInt16 = function () {
      var H = this.data.getInt16(this.read);
      return (this.read += 2), H;
    };
    e_.DataBuffer.prototype.getInt24 = function () {
      var H = (this.data.getInt16(this.read) << 8) ^ this.data.getInt8(this.read + 2);
      return (this.read += 3), H;
    };
    e_.DataBuffer.prototype.getInt32 = function () {
      var H = this.data.getInt32(this.read);
      return (this.read += 4), H;
    };
    e_.DataBuffer.prototype.getInt16Le = function () {
      var H = this.data.getInt16(this.read, !0);
      return (this.read += 2), H;
    };
    e_.DataBuffer.prototype.getInt24Le = function () {
      var H = this.data.getInt8(this.read) ^ (this.data.getInt16(this.read + 1, !0) << 8);
      return (this.read += 3), H;
    };
    e_.DataBuffer.prototype.getInt32Le = function () {
      var H = this.data.getInt32(this.read, !0);
      return (this.read += 4), H;
    };
    e_.DataBuffer.prototype.getInt = function (H) {
      ylH(H);
      var _ = 0;
      do (_ = (_ << 8) + this.data.getInt8(this.read++)), (H -= 8);
      while (H > 0);
      return _;
    };
    e_.DataBuffer.prototype.getSignedInt = function (H) {
      var _ = this.getInt(H),
        q = 2 << (H - 2);
      if (_ >= q) _ -= q << 1;
      return _;
    };
    e_.DataBuffer.prototype.getBytes = function (H) {
      var _;
      if (H) (H = Math.min(this.length(), H)), (_ = this.data.slice(this.read, this.read + H)), (this.read += H);
      else if (H === 0) _ = "";
      else (_ = this.read === 0 ? this.data : this.data.slice(this.read)), this.clear();
      return _;
    };
    e_.DataBuffer.prototype.bytes = function (H) {
      return typeof H > "u" ? this.data.slice(this.read) : this.data.slice(this.read, this.read + H);
    };
    e_.DataBuffer.prototype.at = function (H) {
      return this.data.getUint8(this.read + H);
    };
    e_.DataBuffer.prototype.setAt = function (H, _) {
      return this.data.setUint8(H, _), this;
    };
    e_.DataBuffer.prototype.last = function () {
      return this.data.getUint8(this.write - 1);
    };
    e_.DataBuffer.prototype.copy = function () {
      return new e_.DataBuffer(this);
    };
    e_.DataBuffer.prototype.compact = function () {
      if (this.read > 0) {
        var H = new Uint8Array(this.data.buffer, this.read),
          _ = new Uint8Array(H.byteLength);
        _.set(H), (this.data = new DataView(_)), (this.write -= this.read), (this.read = 0);
      }
      return this;
    };
    e_.DataBuffer.prototype.clear = function () {
      return (this.data = new DataView(new ArrayBuffer(0))), (this.read = this.write = 0), this;
    };
    e_.DataBuffer.prototype.truncate = function (H) {
      return (this.write = Math.max(0, this.length() - H)), (this.read = Math.min(this.read, this.write)), this;
    };
    e_.DataBuffer.prototype.toHex = function () {
      var H = "";
      for (var _ = this.read; _ < this.data.byteLength; ++_) {
        var q = this.data.getUint8(_);
        if (q < 16) H += "0";
        H += q.toString(16);
      }
      return H;
    };
    e_.DataBuffer.prototype.toString = function (H) {
      var _ = new Uint8Array(this.data, this.read, this.length());
      if (((H = H || "utf8"), H === "binary" || H === "raw")) return e_.binary.raw.encode(_);
      if (H === "hex") return e_.binary.hex.encode(_);
      if (H === "base64") return e_.binary.base64.encode(_);
      if (H === "utf8") return e_.text.utf8.decode(_);
      if (H === "utf16") return e_.text.utf16.decode(_);
      throw Error("Invalid encoding: " + H);
    };
    e_.createBuffer = function (H, _) {
      if (((_ = _ || "raw"), H !== void 0 && _ === "utf8")) H = e_.encodeUtf8(H);
      return new e_.ByteBuffer(H);
    };
    e_.fillString = function (H, _) {
      var q = "";
      while (_ > 0) {
        if (_ & 1) q += H;
        if (((_ >>>= 1), _ > 0)) H += H;
      }
      return q;
    };
    e_.xorBytes = function (H, _, q) {
      var $ = "",
        K = "",
        O = "",
        T = 0,
        z = 0;
      for (; q > 0; --q, ++T) {
        if (((K = H.charCodeAt(T) ^ _.charCodeAt(T)), z >= 10)) ($ += O), (O = ""), (z = 0);
        (O += String.fromCharCode(K)), ++z;
      }
      return ($ += O), $;
    };
    e_.hexToBytes = function (H) {
      var _ = "",
        q = 0;
      if (H.length & !0) (q = 1), (_ += String.fromCharCode(parseInt(H[0], 16)));
      for (; q < H.length; q += 2) _ += String.fromCharCode(parseInt(H.substr(q, 2), 16));
      return _;
    };
    e_.bytesToHex = function (H) {
      return e_.createBuffer(H).toHex();
    };
    e_.int32ToBytes = function (H) {
      return (
        String.fromCharCode((H >> 24) & 255) +
        String.fromCharCode((H >> 16) & 255) +
        String.fromCharCode((H >> 8) & 255) +
        String.fromCharCode(H & 255)
      );
    };
    var x6H = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
      m6H = [
        62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, 64, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7,
        8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29,
        30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
      ],
      b77 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    e_.encode64 = function (H, _) {
      var q = "",
        $ = "",
        K,
        O,
        T,
        z = 0;
      while (z < H.length) {
        if (
          ((K = H.charCodeAt(z++)),
          (O = H.charCodeAt(z++)),
          (T = H.charCodeAt(z++)),
          (q += x6H.charAt(K >> 2)),
          (q += x6H.charAt(((K & 3) << 4) | (O >> 4))),
          isNaN(O))
        )
          q += "==";
        else (q += x6H.charAt(((O & 15) << 2) | (T >> 6))), (q += isNaN(T) ? "=" : x6H.charAt(T & 63));
        if (_ && q.length > _)
          ($ +=
            q.substr(0, _) +
            `\r
`),
            (q = q.substr(_));
      }
      return ($ += q), $;
    };
    e_.decode64 = function (H) {
      H = H.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      var _ = "",
        q,
        $,
        K,
        O,
        T = 0;
      while (T < H.length)
        if (
          ((q = m6H[H.charCodeAt(T++) - 43]),
          ($ = m6H[H.charCodeAt(T++) - 43]),
          (K = m6H[H.charCodeAt(T++) - 43]),
          (O = m6H[H.charCodeAt(T++) - 43]),
          (_ += String.fromCharCode((q << 2) | ($ >> 4))),
          K !== 64)
        ) {
          if (((_ += String.fromCharCode((($ & 15) << 4) | (K >> 2))), O !== 64))
            _ += String.fromCharCode(((K & 3) << 6) | O);
        }
      return _;
    };
    e_.encodeUtf8 = function (H) {
      return unescape(encodeURIComponent(H));
    };
    e_.decodeUtf8 = function (H) {
      return decodeURIComponent(escape(H));
    };
    e_.binary = { raw: {}, hex: {}, base64: {}, base58: {}, baseN: { encode: C77.encode, decode: C77.decode } };
    e_.binary.raw.encode = function (H) {
      return String.fromCharCode.apply(null, H);
    };
    e_.binary.raw.decode = function (H, _, q) {
      var $ = _;
      if (!$) $ = new Uint8Array(H.length);
      q = q || 0;
      var K = q;
      for (var O = 0; O < H.length; ++O) $[K++] = H.charCodeAt(O);
      return _ ? K - q : $;
    };
    e_.binary.hex.encode = e_.bytesToHex;
    e_.binary.hex.decode = function (H, _, q) {
      var $ = _;
      if (!$) $ = new Uint8Array(Math.ceil(H.length / 2));
      q = q || 0;
      var K = 0,
        O = q;
      if (H.length & 1) (K = 1), ($[O++] = parseInt(H[0], 16));
      for (; K < H.length; K += 2) $[O++] = parseInt(H.substr(K, 2), 16);
      return _ ? O - q : $;
    };
    e_.binary.base64.encode = function (H, _) {
      var q = "",
        $ = "",
        K,
        O,
        T,
        z = 0;
      while (z < H.byteLength) {
        if (
          ((K = H[z++]),
          (O = H[z++]),
          (T = H[z++]),
          (q += x6H.charAt(K >> 2)),
          (q += x6H.charAt(((K & 3) << 4) | (O >> 4))),
          isNaN(O))
        )
          q += "==";
        else (q += x6H.charAt(((O & 15) << 2) | (T >> 6))), (q += isNaN(T) ? "=" : x6H.charAt(T & 63));
        if (_ && q.length > _)
          ($ +=
            q.substr(0, _) +
            `\r
`),
            (q = q.substr(_));
      }
      return ($ += q), $;
    };
    e_.binary.base64.decode = function (H, _, q) {
      var $ = _;
      if (!$) $ = new Uint8Array(Math.ceil(H.length / 4) * 3);
      (H = H.replace(/[^A-Za-z0-9\+\/\=]/g, "")), (q = q || 0);
      var K,
        O,
        T,
        z,
        A = 0,
        f = q;
      while (A < H.length)
        if (
          ((K = m6H[H.charCodeAt(A++) - 43]),
          (O = m6H[H.charCodeAt(A++) - 43]),
          (T = m6H[H.charCodeAt(A++) - 43]),
          (z = m6H[H.charCodeAt(A++) - 43]),
          ($[f++] = (K << 2) | (O >> 4)),
          T !== 64)
        ) {
          if ((($[f++] = ((O & 15) << 4) | (T >> 2)), z !== 64)) $[f++] = ((T & 3) << 6) | z;
        }
      return _ ? f - q : $.subarray(0, f);
    };
    e_.binary.base58.encode = function (H, _) {
      return e_.binary.baseN.encode(H, b77, _);
    };
    e_.binary.base58.decode = function (H, _) {
      return e_.binary.baseN.decode(H, b77, _);
    };
    e_.text = { utf8: {}, utf16: {} };
    e_.text.utf8.encode = function (H, _, q) {
      H = e_.encodeUtf8(H);
      var $ = _;
      if (!$) $ = new Uint8Array(H.length);
      q = q || 0;
      var K = q;
      for (var O = 0; O < H.length; ++O) $[K++] = H.charCodeAt(O);
      return _ ? K - q : $;
    };
    e_.text.utf8.decode = function (H) {
      return e_.decodeUtf8(String.fromCharCode.apply(null, H));
    };
    e_.text.utf16.encode = function (H, _, q) {
      var $ = _;
      if (!$) $ = new Uint8Array(H.length * 2);
      var K = new Uint16Array($.buffer);
      q = q || 0;
      var O = q,
        T = q;
      for (var z = 0; z < H.length; ++z) (K[T++] = H.charCodeAt(z)), (O += 2);
      return _ ? O - q : $;
    };
    e_.text.utf16.decode = function (H) {
      return String.fromCharCode.apply(null, new Uint16Array(H.buffer));
    };
    e_.deflate = function (H, _, q) {
      if (((_ = e_.decode64(H.deflate(e_.encode64(_)).rval)), q)) {
        var $ = 2,
          K = _.charCodeAt(1);
        if (K & 32) $ = 6;
        _ = _.substring($, _.length - 4);
      }
      return _;
    };
    e_.inflate = function (H, _, q) {
      var $ = H.inflate(e_.encode64(_)).rval;
      return $ === null ? null : e_.decode64($);
    };
    var UE6 = function (H, _, q) {
        if (!H) throw Error("WebStorage not available.");
        var $;
        if (q === null) $ = H.removeItem(_);
        else (q = e_.encode64(JSON.stringify(q))), ($ = H.setItem(_, q));
        if (typeof $ < "u" && $.rval !== !0) {
          var K = Error($.error.message);
          throw ((K.id = $.error.id), (K.name = $.error.name), K);
        }
      },
      QE6 = function (H, _) {
        if (!H) throw Error("WebStorage not available.");
        var q = H.getItem(_);
        if (H.init)
          if (q.rval === null) {
            if (q.error) {
              var $ = Error(q.error.message);
              throw (($.id = q.error.id), ($.name = q.error.name), $);
            }
            q = null;
          } else q = q.rval;
        if (q !== null) q = JSON.parse(e_.decode64(q));
        return q;
      },
      Jd4 = function (H, _, q, $) {
        var K = QE6(H, _);
        if (K === null) K = {};
        (K[q] = $), UE6(H, _, K);
      },
      Pd4 = function (H, _, q) {
        var $ = QE6(H, _);
        if ($ !== null) $ = q in $ ? $[q] : null;
        return $;
      },
      Xd4 = function (H, _, q) {
        var $ = QE6(H, _);
        if ($ !== null && q in $) {
          delete $[q];
          var K = !0;
          for (var O in $) {
            K = !1;
            break;
          }
          if (K) $ = null;
          UE6(H, _, $);
        }
      },
      Wd4 = function (H, _) {
        UE6(H, _, null);
      },
      Jk_ = function (H, _, q) {
        var $ = null;
        if (typeof q > "u") q = ["web", "flash"];
        var K,
          O = !1,
          T = null;
        for (var z in q) {
          K = q[z];
          try {
            if (K === "flash" || K === "both") {
              if (_[0] === null) throw Error("Flash local storage not available.");
              ($ = H.apply(this, _)), (O = K === "flash");
            }
            if (K === "web" || K === "both") (_[0] = localStorage), ($ = H.apply(this, _)), (O = !0);
          } catch (A) {
            T = A;
          }
          if (O) break;
        }
        if (!O) throw T;
        return $;
      };
    e_.setItem = function (H, _, q, $, K) {
      Jk_(Jd4, arguments, K);
    };
    e_.getItem = function (H, _, q, $) {
      return Jk_(Pd4, arguments, $);
    };
    e_.removeItem = function (H, _, q, $) {
      Jk_(Xd4, arguments, $);
    };
    e_.clearItems = function (H, _, q) {
      Jk_(Wd4, arguments, q);
    };
    e_.isEmpty = function (H) {
      for (var _ in H) if (H.hasOwnProperty(_)) return !1;
      return !0;
    };
    e_.format = function (H) {
      var _ = /%./g,
        q,
        $,
        K = 0,
        O = [],
        T = 0;
      while ((q = _.exec(H))) {
        if ((($ = H.substring(T, _.lastIndex - 2)), $.length > 0)) O.push($);
        T = _.lastIndex;
        var z = q[0][1];
        switch (z) {
          case "s":
          case "o":
            if (K < arguments.length) O.push(arguments[K++ + 1]);
            else O.push("<?>");
            break;
          case "%":
            O.push("%");
            break;
          default:
            O.push("<%" + z + "?>");
        }
      }
      return O.push(H.substring(T)), O.join("");
    };
    e_.formatNumber = function (H, _, q, $) {
      var K = H,
        O = isNaN((_ = Math.abs(_))) ? 2 : _,
        T = q === void 0 ? "," : q,
        z = $ === void 0 ? "." : $,
        A = K < 0 ? "-" : "",
        f = parseInt((K = Math.abs(+K || 0).toFixed(O)), 10) + "",
        w = f.length > 3 ? f.length % 3 : 0;
      return (
        A +
        (w ? f.substr(0, w) + z : "") +
        f.substr(w).replace(/(\d{3})(?=\d)/g, "$1" + z) +
        (O
          ? T +
            Math.abs(K - f)
              .toFixed(O)
              .slice(2)
          : "")
      );
    };
    e_.formatSize = function (H) {
      if (H >= 1073741824) H = e_.formatNumber(H / 1073741824, 2, ".", "") + " GiB";
      else if (H >= 1048576) H = e_.formatNumber(H / 1048576, 2, ".", "") + " MiB";
      else if (H >= 1024) H = e_.formatNumber(H / 1024, 0) + " KiB";
      else H = e_.formatNumber(H, 0) + " bytes";
      return H;
    };
    e_.bytesFromIP = function (H) {
      if (H.indexOf(".") !== -1) return e_.bytesFromIPv4(H);
      if (H.indexOf(":") !== -1) return e_.bytesFromIPv6(H);
      return null;
    };
    e_.bytesFromIPv4 = function (H) {
      if (((H = H.split(".")), H.length !== 4)) return null;
      var _ = e_.createBuffer();
      for (var q = 0; q < H.length; ++q) {
        var $ = parseInt(H[q], 10);
        if (isNaN($)) return null;
        _.putByte($);
      }
      return _.getBytes();
    };
    e_.bytesFromIPv6 = function (H) {
      var _ = 0;
      H = H.split(":").filter(function (T) {
        if (T.length === 0) ++_;
        return !0;
      });
      var q = (8 - H.length + _) * 2,
        $ = e_.createBuffer();
      for (var K = 0; K < 8; ++K) {
        if (!H[K] || H[K].length === 0) {
          $.fillWithByte(0, q), (q = 0);
          continue;
        }
        var O = e_.hexToBytes(H[K]);
        if (O.length < 2) $.putByte(0);
        $.putBytes(O);
      }
      return $.getBytes();
    };
    e_.bytesToIP = function (H) {
      if (H.length === 4) return e_.bytesToIPv4(H);
      if (H.length === 16) return e_.bytesToIPv6(H);
      return null;
    };
    e_.bytesToIPv4 = function (H) {
      if (H.length !== 4) return null;
      var _ = [];
      for (var q = 0; q < H.length; ++q) _.push(H.charCodeAt(q));
      return _.join(".");
    };
    e_.bytesToIPv6 = function (H) {
      if (H.length !== 16) return null;
      var _ = [],
        q = [],
        $ = 0;
      for (var K = 0; K < H.length; K += 2) {
        var O = e_.bytesToHex(H[K] + H[K + 1]);
        while (O[0] === "0" && O !== "0") O = O.substr(1);
        if (O === "0") {
          var T = q[q.length - 1],
            z = _.length;
          if (!T || z !== T.end + 1) q.push({ start: z, end: z });
          else if (((T.end = z), T.end - T.start > q[$].end - q[$].start)) $ = q.length - 1;
        }
        _.push(O);
      }
      if (q.length > 0) {
        var A = q[$];
        if (A.end - A.start > 0) {
          if ((_.splice(A.start, A.end - A.start + 1, ""), A.start === 0)) _.unshift("");
          if (A.end === 7) _.push("");
        }
      }
      return _.join(":");
    };
    e_.estimateCores = function (H, _) {
      if (typeof H === "function") (_ = H), (H = {});
      if (((H = H || {}), "cores" in e_ && !H.update)) return _(null, e_.cores);
      if (typeof navigator < "u" && "hardwareConcurrency" in navigator && navigator.hardwareConcurrency > 0)
        return (e_.cores = navigator.hardwareConcurrency), _(null, e_.cores);
      if (typeof Worker > "u") return (e_.cores = 1), _(null, e_.cores);
      if (typeof Blob > "u") return (e_.cores = 2), _(null, e_.cores);
      var q = URL.createObjectURL(
        new Blob(
          [
            "(",
            function () {
              self.addEventListener("message", function (T) {
                var z = Date.now(),
                  A = z + 4;
                while (Date.now() < A);
                self.postMessage({ st: z, et: A });
              });
            }.toString(),
            ")()",
          ],
          { type: "application/javascript" },
        ),
      );
      $([], 5, 16);
      function $(T, z, A) {
        if (z === 0) {
          var f = Math.floor(
            T.reduce(function (w, Y) {
              return w + Y;
            }, 0) / T.length,
          );
          return (e_.cores = Math.max(1, f)), URL.revokeObjectURL(q), _(null, e_.cores);
        }
        K(A, function (w, Y) {
          T.push(O(A, Y)), $(T, z - 1, A);
        });
      }
      function K(T, z) {
        var A = [],
          f = [];
        for (var w = 0; w < T; ++w) {
          var Y = new Worker(q);
          Y.addEventListener("message", function (D) {
            if ((f.push(D.data), f.length === T)) {
              for (var j = 0; j < T; ++j) A[j].terminate();
              z(null, f);
            }
          }),
            A.push(Y);
        }
        for (var w = 0; w < T; ++w) A[w].postMessage(w);
      }
      function O(T, z) {
        var A = [];
        for (var f = 0; f < T; ++f) {
          var w = z[f],
            Y = (A[f] = []);
          for (var D = 0; D < T; ++D) {
            if (f === D) continue;
            var j = z[D];
            if ((w.st > j.st && w.st < j.et) || (j.st > w.st && j.st < w.et)) Y.push(D);
          }
        }
        return A.reduce(function (M, J) {
          return Math.max(M, J.length);
        }, 0);
      }
    };
  });
