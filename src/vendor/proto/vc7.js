  var vc7 = d((ZsH, Zl6) => {
    (function (H, _) {
      function q($) {
        return "default" in $ ? $.default : $;
      }
      if (typeof define === "function" && define.amd)
        define([], function () {
          var $ = {};
          return _($), q($);
        });
      else if (typeof ZsH === "object") {
        if ((_(ZsH), typeof Zl6 === "object")) Zl6.exports = q(ZsH);
      } else
        (function () {
          var $ = {};
          _($), (H.Long = q($));
        })();
    })(typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : ZsH, function (H) {
      Object.defineProperty(H, "__esModule", { value: !0 }), (H.default = void 0);
      var _ = null;
      try {
        _ = new WebAssembly.Instance(
          new WebAssembly.Module(
            new Uint8Array([
              0, 97, 115, 109, 1, 0, 0, 0, 1, 13, 2, 96, 0, 1, 127, 96, 4, 127, 127, 127, 127, 1, 127, 3, 7, 6, 0, 1, 1,
              1, 1, 1, 6, 6, 1, 127, 1, 65, 0, 11, 7, 50, 6, 3, 109, 117, 108, 0, 1, 5, 100, 105, 118, 95, 115, 0, 2, 5,
              100, 105, 118, 95, 117, 0, 3, 5, 114, 101, 109, 95, 115, 0, 4, 5, 114, 101, 109, 95, 117, 0, 5, 8, 103,
              101, 116, 95, 104, 105, 103, 104, 0, 0, 10, 191, 1, 6, 4, 0, 35, 0, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1,
              173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 126, 34, 4, 66, 32, 135, 167, 36, 0, 32,
              4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134,
              132, 127, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32,
              134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 128, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11,
              36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 129,
              34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132,
              32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 130, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11,
            ]),
          ),
          {},
        ).exports;
      } catch {}
      function q(p, C, g) {
        (this.low = p | 0), (this.high = C | 0), (this.unsigned = !!g);
      }
      q.prototype.__isLong__, Object.defineProperty(q.prototype, "__isLong__", { value: !0 });
      function $(p) {
        return (p && p.__isLong__) === !0;
      }
      function K(p) {
        var C = Math.clz32(p & -p);
        return p ? 31 - C : C;
      }
      q.isLong = $;
      var O = {},
        T = {};
      function z(p, C) {
        var g, c, U;
        if (C) {
          if (((p >>>= 0), (U = 0 <= p && p < 256))) {
            if (((c = T[p]), c)) return c;
          }
          if (((g = f(p, 0, !0)), U)) T[p] = g;
          return g;
        } else {
          if (((p |= 0), (U = -128 <= p && p < 128))) {
            if (((c = O[p]), c)) return c;
          }
          if (((g = f(p, p < 0 ? -1 : 0, !1)), U)) O[p] = g;
          return g;
        }
      }
      q.fromInt = z;
      function A(p, C) {
        if (isNaN(p)) return C ? Z : W;
        if (C) {
          if (p < 0) return Z;
          if (p >= P) return S;
        } else {
          if (p <= -X) return x;
          if (p + 1 >= X) return E;
        }
        if (p < 0) return A(-p, C).neg();
        return f((p % J) | 0, (p / J) | 0, C);
      }
      q.fromNumber = A;
      function f(p, C, g) {
        return new q(p, C, g);
      }
      q.fromBits = f;
      var w = Math.pow;
      function Y(p, C, g) {
        if (p.length === 0) throw Error("empty string");
        if (typeof C === "number") (g = C), (C = !1);
        else C = !!C;
        if (p === "NaN" || p === "Infinity" || p === "+Infinity" || p === "-Infinity") return C ? Z : W;
        if (((g = g || 10), g < 2 || 36 < g)) throw RangeError("radix");
        var c;
        if ((c = p.indexOf("-")) > 0) throw Error("interior hyphen");
        else if (c === 0) return Y(p.substring(1), C, g).neg();
        var U = A(w(g, 8)),
          i = W;
        for (var _H = 0; _H < p.length; _H += 8) {
          var HH = Math.min(8, p.length - _H),
            e = parseInt(p.substring(_H, _H + HH), g);
          if (HH < 8) {
            var qH = A(w(g, HH));
            i = i.mul(qH).add(A(e));
          } else (i = i.mul(U)), (i = i.add(A(e)));
        }
        return (i.unsigned = C), i;
      }
      q.fromString = Y;
      function D(p, C) {
        if (typeof p === "number") return A(p, C);
        if (typeof p === "string") return Y(p, C);
        return f(p.low, p.high, typeof C === "boolean" ? C : p.unsigned);
      }
      q.fromValue = D;
      var j = 65536,
        M = 16777216,
        J = j * j,
        P = J * J,
        X = P / 2,
        R = z(M),
        W = z(0);
      q.ZERO = W;
      var Z = z(0, !0);
      q.UZERO = Z;
      var k = z(1);
      q.ONE = k;
      var v = z(1, !0);
      q.UONE = v;
      var y = z(-1);
      q.NEG_ONE = y;
      var E = f(-1, 2147483647, !1);
      q.MAX_VALUE = E;
      var S = f(-1, -1, !0);
      q.MAX_UNSIGNED_VALUE = S;
      var x = f(0, -2147483648, !1);
      q.MIN_VALUE = x;
      var I = q.prototype;
      if (
        ((I.toInt = function () {
          return this.unsigned ? this.low >>> 0 : this.low;
        }),
        (I.toNumber = function () {
          if (this.unsigned) return (this.high >>> 0) * J + (this.low >>> 0);
          return this.high * J + (this.low >>> 0);
        }),
        (I.toString = function (C) {
          if (((C = C || 10), C < 2 || 36 < C)) throw RangeError("radix");
          if (this.isZero()) return "0";
          if (this.isNegative())
            if (this.eq(x)) {
              var g = A(C),
                c = this.div(g),
                U = c.mul(g).sub(this);
              return c.toString(C) + U.toInt().toString(C);
            } else return "-" + this.neg().toString(C);
          var i = A(w(C, 6), this.unsigned),
            _H = this,
            HH = "";
          while (!0) {
            var e = _H.div(i),
              qH = _H.sub(e.mul(i)).toInt() >>> 0,
              r = qH.toString(C);
            if (((_H = e), _H.isZero())) return r + HH;
            else {
              while (r.length < 6) r = "0" + r;
              HH = "" + r + HH;
            }
          }
        }),
        (I.getHighBits = function () {
          return this.high;
        }),
        (I.getHighBitsUnsigned = function () {
          return this.high >>> 0;
        }),
        (I.getLowBits = function () {
          return this.low;
        }),
        (I.getLowBitsUnsigned = function () {
          return this.low >>> 0;
        }),
        (I.getNumBitsAbs = function () {
          if (this.isNegative()) return this.eq(x) ? 64 : this.neg().getNumBitsAbs();
          var C = this.high != 0 ? this.high : this.low;
          for (var g = 31; g > 0; g--) if ((C & (1 << g)) != 0) break;
          return this.high != 0 ? g + 33 : g + 1;
        }),
        (I.isSafeInteger = function () {
          var C = this.high >> 21;
          if (!C) return !0;
          if (this.unsigned) return !1;
          return C === -1 && !(this.low === 0 && this.high === -2097152);
        }),
        (I.isZero = function () {
          return this.high === 0 && this.low === 0;
        }),
        (I.eqz = I.isZero),
        (I.isNegative = function () {
          return !this.unsigned && this.high < 0;
        }),
        (I.isPositive = function () {
          return this.unsigned || this.high >= 0;
        }),
        (I.isOdd = function () {
          return (this.low & 1) === 1;
        }),
        (I.isEven = function () {
          return (this.low & 1) === 0;
        }),
        (I.equals = function (C) {
          if (!$(C)) C = D(C);
          if (this.unsigned !== C.unsigned && this.high >>> 31 === 1 && C.high >>> 31 === 1) return !1;
          return this.high === C.high && this.low === C.low;
        }),
        (I.eq = I.equals),
        (I.notEquals = function (C) {
          return !this.eq(C);
        }),
        (I.neq = I.notEquals),
        (I.ne = I.notEquals),
        (I.lessThan = function (C) {
          return this.comp(C) < 0;
        }),
        (I.lt = I.lessThan),
        (I.lessThanOrEqual = function (C) {
          return this.comp(C) <= 0;
        }),
        (I.lte = I.lessThanOrEqual),
        (I.le = I.lessThanOrEqual),
        (I.greaterThan = function (C) {
          return this.comp(C) > 0;
        }),
        (I.gt = I.greaterThan),
        (I.greaterThanOrEqual = function (C) {
          return this.comp(C) >= 0;
        }),
        (I.gte = I.greaterThanOrEqual),
        (I.ge = I.greaterThanOrEqual),
        (I.compare = function (C) {
          if (!$(C)) C = D(C);
          if (this.eq(C)) return 0;
          var g = this.isNegative(),
            c = C.isNegative();
          if (g && !c) return -1;
          if (!g && c) return 1;
          if (!this.unsigned) return this.sub(C).isNegative() ? -1 : 1;
          return C.high >>> 0 > this.high >>> 0 || (C.high === this.high && C.low >>> 0 > this.low >>> 0) ? -1 : 1;
        }),
        (I.comp = I.compare),
        (I.negate = function () {
          if (!this.unsigned && this.eq(x)) return x;
          return this.not().add(k);
        }),
        (I.neg = I.negate),
        (I.add = function (C) {
          if (!$(C)) C = D(C);
          var g = this.high >>> 16,
            c = this.high & 65535,
            U = this.low >>> 16,
            i = this.low & 65535,
            _H = C.high >>> 16,
            HH = C.high & 65535,
            e = C.low >>> 16,
            qH = C.low & 65535,
            r = 0,
            $H = 0,
            DH = 0,
            fH = 0;
          return (
            (fH += i + qH),
            (DH += fH >>> 16),
            (fH &= 65535),
            (DH += U + e),
            ($H += DH >>> 16),
            (DH &= 65535),
            ($H += c + HH),
            (r += $H >>> 16),
            ($H &= 65535),
            (r += g + _H),
            (r &= 65535),
            f((DH << 16) | fH, (r << 16) | $H, this.unsigned)
          );
        }),
        (I.subtract = function (C) {
          if (!$(C)) C = D(C);
          return this.add(C.neg());
        }),
        (I.sub = I.subtract),
        (I.multiply = function (C) {
          if (this.isZero()) return this;
          if (!$(C)) C = D(C);
          if (_) {
            var g = _.mul(this.low, this.high, C.low, C.high);
            return f(g, _.get_high(), this.unsigned);
          }
          if (C.isZero()) return this.unsigned ? Z : W;
          if (this.eq(x)) return C.isOdd() ? x : W;
          if (C.eq(x)) return this.isOdd() ? x : W;
          if (this.isNegative())
            if (C.isNegative()) return this.neg().mul(C.neg());
            else return this.neg().mul(C).neg();
          else if (C.isNegative()) return this.mul(C.neg()).neg();
          if (this.lt(R) && C.lt(R)) return A(this.toNumber() * C.toNumber(), this.unsigned);
          var c = this.high >>> 16,
            U = this.high & 65535,
            i = this.low >>> 16,
            _H = this.low & 65535,
            HH = C.high >>> 16,
            e = C.high & 65535,
            qH = C.low >>> 16,
            r = C.low & 65535,
            $H = 0,
            DH = 0,
            fH = 0,
            vH = 0;
          return (
            (vH += _H * r),
            (fH += vH >>> 16),
            (vH &= 65535),
            (fH += i * r),
            (DH += fH >>> 16),
            (fH &= 65535),
            (fH += _H * qH),
            (DH += fH >>> 16),
            (fH &= 65535),
            (DH += U * r),
            ($H += DH >>> 16),
            (DH &= 65535),
            (DH += i * qH),
            ($H += DH >>> 16),
            (DH &= 65535),
            (DH += _H * e),
            ($H += DH >>> 16),
            (DH &= 65535),
            ($H += c * r + U * qH + i * e + _H * HH),
            ($H &= 65535),
            f((fH << 16) | vH, ($H << 16) | DH, this.unsigned)
          );
        }),
        (I.mul = I.multiply),
        (I.divide = function (C) {
          if (!$(C)) C = D(C);
          if (C.isZero()) throw Error("division by zero");
          if (_) {
            if (!this.unsigned && this.high === -2147483648 && C.low === -1 && C.high === -1) return this;
            var g = (this.unsigned ? _.div_u : _.div_s)(this.low, this.high, C.low, C.high);
            return f(g, _.get_high(), this.unsigned);
          }
          if (this.isZero()) return this.unsigned ? Z : W;
          var c, U, i;
          if (!this.unsigned) {
            if (this.eq(x))
              if (C.eq(k) || C.eq(y)) return x;
              else if (C.eq(x)) return k;
              else {
                var _H = this.shr(1);
                if (((c = _H.div(C).shl(1)), c.eq(W))) return C.isNegative() ? k : y;
                else return (U = this.sub(C.mul(c))), (i = c.add(U.div(C))), i;
              }
            else if (C.eq(x)) return this.unsigned ? Z : W;
            if (this.isNegative()) {
              if (C.isNegative()) return this.neg().div(C.neg());
              return this.neg().div(C).neg();
            } else if (C.isNegative()) return this.div(C.neg()).neg();
            i = W;
          } else {
            if (!C.unsigned) C = C.toUnsigned();
            if (C.gt(this)) return Z;
            if (C.gt(this.shru(1))) return v;
            i = Z;
          }
          U = this;
          while (U.gte(C)) {
            c = Math.max(1, Math.floor(U.toNumber() / C.toNumber()));
            var HH = Math.ceil(Math.log(c) / Math.LN2),
              e = HH <= 48 ? 1 : w(2, HH - 48),
              qH = A(c),
              r = qH.mul(C);
            while (r.isNegative() || r.gt(U)) (c -= e), (qH = A(c, this.unsigned)), (r = qH.mul(C));
            if (qH.isZero()) qH = k;
            (i = i.add(qH)), (U = U.sub(r));
          }
          return i;
        }),
        (I.div = I.divide),
        (I.modulo = function (C) {
          if (!$(C)) C = D(C);
          if (_) {
            var g = (this.unsigned ? _.rem_u : _.rem_s)(this.low, this.high, C.low, C.high);
            return f(g, _.get_high(), this.unsigned);
          }
          return this.sub(this.div(C).mul(C));
        }),
        (I.mod = I.modulo),
        (I.rem = I.modulo),
        (I.not = function () {
          return f(~this.low, ~this.high, this.unsigned);
        }),
        (I.countLeadingZeros = function () {
          return this.high ? Math.clz32(this.high) : Math.clz32(this.low) + 32;
        }),
        (I.clz = I.countLeadingZeros),
        (I.countTrailingZeros = function () {
          return this.low ? K(this.low) : K(this.high) + 32;
        }),
        (I.ctz = I.countTrailingZeros),
        (I.and = function (C) {
          if (!$(C)) C = D(C);
          return f(this.low & C.low, this.high & C.high, this.unsigned);
        }),
        (I.or = function (C) {
          if (!$(C)) C = D(C);
          return f(this.low | C.low, this.high | C.high, this.unsigned);
        }),
        (I.xor = function (C) {
          if (!$(C)) C = D(C);
          return f(this.low ^ C.low, this.high ^ C.high, this.unsigned);
        }),
        (I.shiftLeft = function (C) {
          if ($(C)) C = C.toInt();
          if ((C &= 63) === 0) return this;
          else if (C < 32) return f(this.low << C, (this.high << C) | (this.low >>> (32 - C)), this.unsigned);
          else return f(0, this.low << (C - 32), this.unsigned);
        }),
        (I.shl = I.shiftLeft),
        (I.shiftRight = function (C) {
          if ($(C)) C = C.toInt();
          if ((C &= 63) === 0) return this;
          else if (C < 32) return f((this.low >>> C) | (this.high << (32 - C)), this.high >> C, this.unsigned);
          else return f(this.high >> (C - 32), this.high >= 0 ? 0 : -1, this.unsigned);
        }),
        (I.shr = I.shiftRight),
        (I.shiftRightUnsigned = function (C) {
          if ($(C)) C = C.toInt();
          if ((C &= 63) === 0) return this;
          if (C < 32) return f((this.low >>> C) | (this.high << (32 - C)), this.high >>> C, this.unsigned);
          if (C === 32) return f(this.high, 0, this.unsigned);
          return f(this.high >>> (C - 32), 0, this.unsigned);
        }),
        (I.shru = I.shiftRightUnsigned),
        (I.shr_u = I.shiftRightUnsigned),
        (I.rotateLeft = function (C) {
          var g;
          if ($(C)) C = C.toInt();
          if ((C &= 63) === 0) return this;
          if (C === 32) return f(this.high, this.low, this.unsigned);
          if (C < 32)
            return (
              (g = 32 - C), f((this.low << C) | (this.high >>> g), (this.high << C) | (this.low >>> g), this.unsigned)
            );
          return (
            (C -= 32),
            (g = 32 - C),
            f((this.high << C) | (this.low >>> g), (this.low << C) | (this.high >>> g), this.unsigned)
          );
        }),
        (I.rotl = I.rotateLeft),
        (I.rotateRight = function (C) {
          var g;
          if ($(C)) C = C.toInt();
          if ((C &= 63) === 0) return this;
          if (C === 32) return f(this.high, this.low, this.unsigned);
          if (C < 32)
            return (
              (g = 32 - C), f((this.high << g) | (this.low >>> C), (this.low << g) | (this.high >>> C), this.unsigned)
            );
          return (
            (C -= 32),
            (g = 32 - C),
            f((this.low << g) | (this.high >>> C), (this.high << g) | (this.low >>> C), this.unsigned)
          );
        }),
        (I.rotr = I.rotateRight),
        (I.toSigned = function () {
          if (!this.unsigned) return this;
          return f(this.low, this.high, !1);
        }),
        (I.toUnsigned = function () {
          if (this.unsigned) return this;
          return f(this.low, this.high, !0);
        }),
        (I.toBytes = function (C) {
          return C ? this.toBytesLE() : this.toBytesBE();
        }),
        (I.toBytesLE = function () {
          var C = this.high,
            g = this.low;
          return [
            g & 255,
            (g >>> 8) & 255,
            (g >>> 16) & 255,
            g >>> 24,
            C & 255,
            (C >>> 8) & 255,
            (C >>> 16) & 255,
            C >>> 24,
          ];
        }),
        (I.toBytesBE = function () {
          var C = this.high,
            g = this.low;
          return [
            C >>> 24,
            (C >>> 16) & 255,
            (C >>> 8) & 255,
            C & 255,
            g >>> 24,
            (g >>> 16) & 255,
            (g >>> 8) & 255,
            g & 255,
          ];
        }),
        (q.fromBytes = function (C, g, c) {
          return c ? q.fromBytesLE(C, g) : q.fromBytesBE(C, g);
        }),
        (q.fromBytesLE = function (C, g) {
          return new q(
            C[0] | (C[1] << 8) | (C[2] << 16) | (C[3] << 24),
            C[4] | (C[5] << 8) | (C[6] << 16) | (C[7] << 24),
            g,
          );
        }),
        (q.fromBytesBE = function (C, g) {
          return new q(
            (C[4] << 24) | (C[5] << 16) | (C[6] << 8) | C[7],
            (C[0] << 24) | (C[1] << 16) | (C[2] << 8) | C[3],
            g,
          );
        }),
        typeof BigInt === "function")
      )
        (q.fromBigInt = function (C, g) {
          var c = Number(BigInt.asIntN(32, C)),
            U = Number(BigInt.asIntN(32, C >> BigInt(32)));
          return f(c, U, g);
        }),
          (q.fromValue = function (C, g) {
            if (typeof C === "bigint") return fromBigInt(C, g);
            return D(C, g);
          }),
          (I.toBigInt = function () {
            var C = BigInt(this.low >>> 0),
              g = BigInt(this.unsigned ? this.high >>> 0 : this.high);
            return (g << BigInt(32)) | C;
          });
      var B = (H.default = q);
    });
  });
