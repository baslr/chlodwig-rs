  var nE6 = d((xl3, x77) => {
    var $P = XK();
    F3();
    $P.cipher = $P.cipher || {};
    var O5 = (x77.exports = $P.cipher.modes = $P.cipher.modes || {});
    O5.ecb = function (H) {
      (H = H || {}),
        (this.name = "ECB"),
        (this.cipher = H.cipher),
        (this.blockSize = H.blockSize || 16),
        (this._ints = this.blockSize / 4),
        (this._inBlock = Array(this._ints)),
        (this._outBlock = Array(this._ints));
    };
    O5.ecb.prototype.start = function (H) {};
    O5.ecb.prototype.encrypt = function (H, _, q) {
      if (H.length() < this.blockSize && !(q && H.length() > 0)) return !0;
      for (var $ = 0; $ < this._ints; ++$) this._inBlock[$] = H.getInt32();
      this.cipher.encrypt(this._inBlock, this._outBlock);
      for (var $ = 0; $ < this._ints; ++$) _.putInt32(this._outBlock[$]);
    };
    O5.ecb.prototype.decrypt = function (H, _, q) {
      if (H.length() < this.blockSize && !(q && H.length() > 0)) return !0;
      for (var $ = 0; $ < this._ints; ++$) this._inBlock[$] = H.getInt32();
      this.cipher.decrypt(this._inBlock, this._outBlock);
      for (var $ = 0; $ < this._ints; ++$) _.putInt32(this._outBlock[$]);
    };
    O5.ecb.prototype.pad = function (H, _) {
      var q = H.length() === this.blockSize ? this.blockSize : this.blockSize - H.length();
      return H.fillWithByte(q, q), !0;
    };
    O5.ecb.prototype.unpad = function (H, _) {
      if (_.overflow > 0) return !1;
      var q = H.length(),
        $ = H.at(q - 1);
      if ($ > this.blockSize << 2) return !1;
      return H.truncate($), !0;
    };
    O5.cbc = function (H) {
      (H = H || {}),
        (this.name = "CBC"),
        (this.cipher = H.cipher),
        (this.blockSize = H.blockSize || 16),
        (this._ints = this.blockSize / 4),
        (this._inBlock = Array(this._ints)),
        (this._outBlock = Array(this._ints));
    };
    O5.cbc.prototype.start = function (H) {
      if (H.iv === null) {
        if (!this._prev) throw Error("Invalid IV parameter.");
        this._iv = this._prev.slice(0);
      } else if (!("iv" in H)) throw Error("Invalid IV parameter.");
      else (this._iv = Xk_(H.iv, this.blockSize)), (this._prev = this._iv.slice(0));
    };
    O5.cbc.prototype.encrypt = function (H, _, q) {
      if (H.length() < this.blockSize && !(q && H.length() > 0)) return !0;
      for (var $ = 0; $ < this._ints; ++$) this._inBlock[$] = this._prev[$] ^ H.getInt32();
      this.cipher.encrypt(this._inBlock, this._outBlock);
      for (var $ = 0; $ < this._ints; ++$) _.putInt32(this._outBlock[$]);
      this._prev = this._outBlock;
    };
    O5.cbc.prototype.decrypt = function (H, _, q) {
      if (H.length() < this.blockSize && !(q && H.length() > 0)) return !0;
      for (var $ = 0; $ < this._ints; ++$) this._inBlock[$] = H.getInt32();
      this.cipher.decrypt(this._inBlock, this._outBlock);
      for (var $ = 0; $ < this._ints; ++$) _.putInt32(this._prev[$] ^ this._outBlock[$]);
      this._prev = this._inBlock.slice(0);
    };
    O5.cbc.prototype.pad = function (H, _) {
      var q = H.length() === this.blockSize ? this.blockSize : this.blockSize - H.length();
      return H.fillWithByte(q, q), !0;
    };
    O5.cbc.prototype.unpad = function (H, _) {
      if (_.overflow > 0) return !1;
      var q = H.length(),
        $ = H.at(q - 1);
      if ($ > this.blockSize << 2) return !1;
      return H.truncate($), !0;
    };
    O5.cfb = function (H) {
      (H = H || {}),
        (this.name = "CFB"),
        (this.cipher = H.cipher),
        (this.blockSize = H.blockSize || 16),
        (this._ints = this.blockSize / 4),
        (this._inBlock = null),
        (this._outBlock = Array(this._ints)),
        (this._partialBlock = Array(this._ints)),
        (this._partialOutput = $P.util.createBuffer()),
        (this._partialBytes = 0);
    };
    O5.cfb.prototype.start = function (H) {
      if (!("iv" in H)) throw Error("Invalid IV parameter.");
      (this._iv = Xk_(H.iv, this.blockSize)), (this._inBlock = this._iv.slice(0)), (this._partialBytes = 0);
    };
    O5.cfb.prototype.encrypt = function (H, _, q) {
      var $ = H.length();
      if ($ === 0) return !0;
      if ((this.cipher.encrypt(this._inBlock, this._outBlock), this._partialBytes === 0 && $ >= this.blockSize)) {
        for (var K = 0; K < this._ints; ++K)
          (this._inBlock[K] = H.getInt32() ^ this._outBlock[K]), _.putInt32(this._inBlock[K]);
        return;
      }
      var O = (this.blockSize - $) % this.blockSize;
      if (O > 0) O = this.blockSize - O;
      this._partialOutput.clear();
      for (var K = 0; K < this._ints; ++K)
        (this._partialBlock[K] = H.getInt32() ^ this._outBlock[K]), this._partialOutput.putInt32(this._partialBlock[K]);
      if (O > 0) H.read -= this.blockSize;
      else for (var K = 0; K < this._ints; ++K) this._inBlock[K] = this._partialBlock[K];
      if (this._partialBytes > 0) this._partialOutput.getBytes(this._partialBytes);
      if (O > 0 && !q)
        return _.putBytes(this._partialOutput.getBytes(O - this._partialBytes)), (this._partialBytes = O), !0;
      _.putBytes(this._partialOutput.getBytes($ - this._partialBytes)), (this._partialBytes = 0);
    };
    O5.cfb.prototype.decrypt = function (H, _, q) {
      var $ = H.length();
      if ($ === 0) return !0;
      if ((this.cipher.encrypt(this._inBlock, this._outBlock), this._partialBytes === 0 && $ >= this.blockSize)) {
        for (var K = 0; K < this._ints; ++K)
          (this._inBlock[K] = H.getInt32()), _.putInt32(this._inBlock[K] ^ this._outBlock[K]);
        return;
      }
      var O = (this.blockSize - $) % this.blockSize;
      if (O > 0) O = this.blockSize - O;
      this._partialOutput.clear();
      for (var K = 0; K < this._ints; ++K)
        (this._partialBlock[K] = H.getInt32()), this._partialOutput.putInt32(this._partialBlock[K] ^ this._outBlock[K]);
      if (O > 0) H.read -= this.blockSize;
      else for (var K = 0; K < this._ints; ++K) this._inBlock[K] = this._partialBlock[K];
      if (this._partialBytes > 0) this._partialOutput.getBytes(this._partialBytes);
      if (O > 0 && !q)
        return _.putBytes(this._partialOutput.getBytes(O - this._partialBytes)), (this._partialBytes = O), !0;
      _.putBytes(this._partialOutput.getBytes($ - this._partialBytes)), (this._partialBytes = 0);
    };
    O5.ofb = function (H) {
      (H = H || {}),
        (this.name = "OFB"),
        (this.cipher = H.cipher),
        (this.blockSize = H.blockSize || 16),
        (this._ints = this.blockSize / 4),
        (this._inBlock = null),
        (this._outBlock = Array(this._ints)),
        (this._partialOutput = $P.util.createBuffer()),
        (this._partialBytes = 0);
    };
    O5.ofb.prototype.start = function (H) {
      if (!("iv" in H)) throw Error("Invalid IV parameter.");
      (this._iv = Xk_(H.iv, this.blockSize)), (this._inBlock = this._iv.slice(0)), (this._partialBytes = 0);
    };
    O5.ofb.prototype.encrypt = function (H, _, q) {
      var $ = H.length();
      if (H.length() === 0) return !0;
      if ((this.cipher.encrypt(this._inBlock, this._outBlock), this._partialBytes === 0 && $ >= this.blockSize)) {
        for (var K = 0; K < this._ints; ++K)
          _.putInt32(H.getInt32() ^ this._outBlock[K]), (this._inBlock[K] = this._outBlock[K]);
        return;
      }
      var O = (this.blockSize - $) % this.blockSize;
      if (O > 0) O = this.blockSize - O;
      this._partialOutput.clear();
      for (var K = 0; K < this._ints; ++K) this._partialOutput.putInt32(H.getInt32() ^ this._outBlock[K]);
      if (O > 0) H.read -= this.blockSize;
      else for (var K = 0; K < this._ints; ++K) this._inBlock[K] = this._outBlock[K];
      if (this._partialBytes > 0) this._partialOutput.getBytes(this._partialBytes);
      if (O > 0 && !q)
        return _.putBytes(this._partialOutput.getBytes(O - this._partialBytes)), (this._partialBytes = O), !0;
      _.putBytes(this._partialOutput.getBytes($ - this._partialBytes)), (this._partialBytes = 0);
    };
    O5.ofb.prototype.decrypt = O5.ofb.prototype.encrypt;
    O5.ctr = function (H) {
      (H = H || {}),
        (this.name = "CTR"),
        (this.cipher = H.cipher),
        (this.blockSize = H.blockSize || 16),
        (this._ints = this.blockSize / 4),
        (this._inBlock = null),
        (this._outBlock = Array(this._ints)),
        (this._partialOutput = $P.util.createBuffer()),
        (this._partialBytes = 0);
    };
    O5.ctr.prototype.start = function (H) {
      if (!("iv" in H)) throw Error("Invalid IV parameter.");
      (this._iv = Xk_(H.iv, this.blockSize)), (this._inBlock = this._iv.slice(0)), (this._partialBytes = 0);
    };
    O5.ctr.prototype.encrypt = function (H, _, q) {
      var $ = H.length();
      if ($ === 0) return !0;
      if ((this.cipher.encrypt(this._inBlock, this._outBlock), this._partialBytes === 0 && $ >= this.blockSize))
        for (var K = 0; K < this._ints; ++K) _.putInt32(H.getInt32() ^ this._outBlock[K]);
      else {
        var O = (this.blockSize - $) % this.blockSize;
        if (O > 0) O = this.blockSize - O;
        this._partialOutput.clear();
        for (var K = 0; K < this._ints; ++K) this._partialOutput.putInt32(H.getInt32() ^ this._outBlock[K]);
        if (O > 0) H.read -= this.blockSize;
        if (this._partialBytes > 0) this._partialOutput.getBytes(this._partialBytes);
        if (O > 0 && !q)
          return _.putBytes(this._partialOutput.getBytes(O - this._partialBytes)), (this._partialBytes = O), !0;
        _.putBytes(this._partialOutput.getBytes($ - this._partialBytes)), (this._partialBytes = 0);
      }
      Wk_(this._inBlock);
    };
    O5.ctr.prototype.decrypt = O5.ctr.prototype.encrypt;
    O5.gcm = function (H) {
      (H = H || {}),
        (this.name = "GCM"),
        (this.cipher = H.cipher),
        (this.blockSize = H.blockSize || 16),
        (this._ints = this.blockSize / 4),
        (this._inBlock = Array(this._ints)),
        (this._outBlock = Array(this._ints)),
        (this._partialOutput = $P.util.createBuffer()),
        (this._partialBytes = 0),
        (this._R = 3774873600);
    };
    O5.gcm.prototype.start = function (H) {
      if (!("iv" in H)) throw Error("Invalid IV parameter.");
      var _ = $P.util.createBuffer(H.iv);
      this._cipherLength = 0;
      var q;
      if ("additionalData" in H) q = $P.util.createBuffer(H.additionalData);
      else q = $P.util.createBuffer();
      if ("tagLength" in H) this._tagLength = H.tagLength;
      else this._tagLength = 128;
      if (((this._tag = null), H.decrypt)) {
        if (((this._tag = $P.util.createBuffer(H.tag).getBytes()), this._tag.length !== this._tagLength / 8))
          throw Error("Authentication tag does not match tag length.");
      }
      (this._hashBlock = Array(this._ints)),
        (this.tag = null),
        (this._hashSubkey = Array(this._ints)),
        this.cipher.encrypt([0, 0, 0, 0], this._hashSubkey),
        (this.componentBits = 4),
        (this._m = this.generateHashTable(this._hashSubkey, this.componentBits));
      var $ = _.length();
      if ($ === 12) this._j0 = [_.getInt32(), _.getInt32(), _.getInt32(), 1];
      else {
        this._j0 = [0, 0, 0, 0];
        while (_.length() > 0)
          this._j0 = this.ghash(this._hashSubkey, this._j0, [_.getInt32(), _.getInt32(), _.getInt32(), _.getInt32()]);
        this._j0 = this.ghash(this._hashSubkey, this._j0, [0, 0].concat(iE6($ * 8)));
      }
      (this._inBlock = this._j0.slice(0)),
        Wk_(this._inBlock),
        (this._partialBytes = 0),
        (q = $P.util.createBuffer(q)),
        (this._aDataLength = iE6(q.length() * 8));
      var K = q.length() % this.blockSize;
      if (K) q.fillWithByte(0, this.blockSize - K);
      this._s = [0, 0, 0, 0];
      while (q.length() > 0)
        this._s = this.ghash(this._hashSubkey, this._s, [q.getInt32(), q.getInt32(), q.getInt32(), q.getInt32()]);
    };
    O5.gcm.prototype.encrypt = function (H, _, q) {
      var $ = H.length();
      if ($ === 0) return !0;
      if ((this.cipher.encrypt(this._inBlock, this._outBlock), this._partialBytes === 0 && $ >= this.blockSize)) {
        for (var K = 0; K < this._ints; ++K) _.putInt32((this._outBlock[K] ^= H.getInt32()));
        this._cipherLength += this.blockSize;
      } else {
        var O = (this.blockSize - $) % this.blockSize;
        if (O > 0) O = this.blockSize - O;
        this._partialOutput.clear();
        for (var K = 0; K < this._ints; ++K) this._partialOutput.putInt32(H.getInt32() ^ this._outBlock[K]);
        if (O <= 0 || q) {
          if (q) {
            var T = $ % this.blockSize;
            (this._cipherLength += T), this._partialOutput.truncate(this.blockSize - T);
          } else this._cipherLength += this.blockSize;
          for (var K = 0; K < this._ints; ++K) this._outBlock[K] = this._partialOutput.getInt32();
          this._partialOutput.read -= this.blockSize;
        }
        if (this._partialBytes > 0) this._partialOutput.getBytes(this._partialBytes);
        if (O > 0 && !q)
          return (
            (H.read -= this.blockSize),
            _.putBytes(this._partialOutput.getBytes(O - this._partialBytes)),
            (this._partialBytes = O),
            !0
          );
        _.putBytes(this._partialOutput.getBytes($ - this._partialBytes)), (this._partialBytes = 0);
      }
      (this._s = this.ghash(this._hashSubkey, this._s, this._outBlock)), Wk_(this._inBlock);
    };
    O5.gcm.prototype.decrypt = function (H, _, q) {
      var $ = H.length();
      if ($ < this.blockSize && !(q && $ > 0)) return !0;
      this.cipher.encrypt(this._inBlock, this._outBlock),
        Wk_(this._inBlock),
        (this._hashBlock[0] = H.getInt32()),
        (this._hashBlock[1] = H.getInt32()),
        (this._hashBlock[2] = H.getInt32()),
        (this._hashBlock[3] = H.getInt32()),
        (this._s = this.ghash(this._hashSubkey, this._s, this._hashBlock));
      for (var K = 0; K < this._ints; ++K) _.putInt32(this._outBlock[K] ^ this._hashBlock[K]);
      if ($ < this.blockSize) this._cipherLength += $ % this.blockSize;
      else this._cipherLength += this.blockSize;
    };
    O5.gcm.prototype.afterFinish = function (H, _) {
      var q = !0;
      if (_.decrypt && _.overflow) H.truncate(this.blockSize - _.overflow);
      this.tag = $P.util.createBuffer();
      var $ = this._aDataLength.concat(iE6(this._cipherLength * 8));
      this._s = this.ghash(this._hashSubkey, this._s, $);
      var K = [];
      this.cipher.encrypt(this._j0, K);
      for (var O = 0; O < this._ints; ++O) this.tag.putInt32(this._s[O] ^ K[O]);
      if ((this.tag.truncate(this.tag.length() % (this._tagLength / 8)), _.decrypt && this.tag.bytes() !== this._tag))
        q = !1;
      return q;
    };
    O5.gcm.prototype.multiply = function (H, _) {
      var q = [0, 0, 0, 0],
        $ = _.slice(0);
      for (var K = 0; K < 128; ++K) {
        var O = H[(K / 32) | 0] & (1 << (31 - (K % 32)));
        if (O) (q[0] ^= $[0]), (q[1] ^= $[1]), (q[2] ^= $[2]), (q[3] ^= $[3]);
        this.pow($, $);
      }
      return q;
    };
    O5.gcm.prototype.pow = function (H, _) {
      var q = H[3] & 1;
      for (var $ = 3; $ > 0; --$) _[$] = (H[$] >>> 1) | ((H[$ - 1] & 1) << 31);
      if (((_[0] = H[0] >>> 1), q)) _[0] ^= this._R;
    };
    O5.gcm.prototype.tableMultiply = function (H) {
      var _ = [0, 0, 0, 0];
      for (var q = 0; q < 32; ++q) {
        var $ = (q / 8) | 0,
          K = (H[$] >>> ((7 - (q % 8)) * 4)) & 15,
          O = this._m[q][K];
        (_[0] ^= O[0]), (_[1] ^= O[1]), (_[2] ^= O[2]), (_[3] ^= O[3]);
      }
      return _;
    };
    O5.gcm.prototype.ghash = function (H, _, q) {
      return (_[0] ^= q[0]), (_[1] ^= q[1]), (_[2] ^= q[2]), (_[3] ^= q[3]), this.tableMultiply(_);
    };
    O5.gcm.prototype.generateHashTable = function (H, _) {
      var q = 8 / _,
        $ = 4 * q,
        K = 16 * q,
        O = Array(K);
      for (var T = 0; T < K; ++T) {
        var z = [0, 0, 0, 0],
          A = (T / $) | 0,
          f = ($ - 1 - (T % $)) * _;
        (z[A] = (1 << (_ - 1)) << f), (O[T] = this.generateSubHashTable(this.multiply(z, H), _));
      }
      return O;
    };
    O5.gcm.prototype.generateSubHashTable = function (H, _) {
      var q = 1 << _,
        $ = q >>> 1,
        K = Array(q);
      K[$] = H.slice(0);
      var O = $ >>> 1;
      while (O > 0) this.pow(K[2 * O], (K[O] = [])), (O >>= 1);
      O = 2;
      while (O < $) {
        for (var T = 1; T < O; ++T) {
          var z = K[O],
            A = K[T];
          K[O + T] = [z[0] ^ A[0], z[1] ^ A[1], z[2] ^ A[2], z[3] ^ A[3]];
        }
        O *= 2;
      }
      K[0] = [0, 0, 0, 0];
      for (O = $ + 1; O < q; ++O) {
        var f = K[O ^ $];
        K[O] = [H[0] ^ f[0], H[1] ^ f[1], H[2] ^ f[2], H[3] ^ f[3]];
      }
      return K;
    };
    function Xk_(H, _) {
      if (typeof H === "string") H = $P.util.createBuffer(H);
      if ($P.util.isArray(H) && H.length > 4) {
        var q = H;
        H = $P.util.createBuffer();
        for (var $ = 0; $ < q.length; ++$) H.putByte(q[$]);
      }
      if (H.length() < _) throw Error("Invalid IV length; got " + H.length() + " bytes and expected " + _ + " bytes.");
      if (!$P.util.isArray(H)) {
        var K = [],
          O = _ / 4;
        for (var $ = 0; $ < O; ++$) K.push(H.getInt32());
        H = K;
      }
      return H;
    }
    function Wk_(H) {
      H[H.length - 1] = (H[H.length - 1] + 1) & 4294967295;
    }
    function iE6(H) {
      return [(H / 4294967296) | 0, H & 4294967295];
    }
  });
