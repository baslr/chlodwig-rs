  var Iq8 = d((N7z, HM9) => {
    var DJ = KSH(),
      L9K = bq8(),
      FP = (HM9.exports = function (H, _) {
        (this._options = H),
          (H.checkCRC = H.checkCRC !== !1),
          (this._hasIHDR = !1),
          (this._hasIEND = !1),
          (this._emittedHeadersFinished = !1),
          (this._palette = []),
          (this._colorType = 0),
          (this._chunks = {}),
          (this._chunks[DJ.TYPE_IHDR] = this._handleIHDR.bind(this)),
          (this._chunks[DJ.TYPE_IEND] = this._handleIEND.bind(this)),
          (this._chunks[DJ.TYPE_IDAT] = this._handleIDAT.bind(this)),
          (this._chunks[DJ.TYPE_PLTE] = this._handlePLTE.bind(this)),
          (this._chunks[DJ.TYPE_tRNS] = this._handleTRNS.bind(this)),
          (this._chunks[DJ.TYPE_gAMA] = this._handleGAMA.bind(this)),
          (this.read = _.read),
          (this.error = _.error),
          (this.metadata = _.metadata),
          (this.gamma = _.gamma),
          (this.transColor = _.transColor),
          (this.palette = _.palette),
          (this.parsed = _.parsed),
          (this.inflateData = _.inflateData),
          (this.finished = _.finished),
          (this.simpleTransparency = _.simpleTransparency),
          (this.headersFinished = _.headersFinished || function () {});
      });
    FP.prototype.start = function () {
      this.read(DJ.PNG_SIGNATURE.length, this._parseSignature.bind(this));
    };
    FP.prototype._parseSignature = function (H) {
      let _ = DJ.PNG_SIGNATURE;
      for (let q = 0; q < _.length; q++)
        if (H[q] !== _[q]) {
          this.error(Error("Invalid file signature"));
          return;
        }
      this.read(8, this._parseChunkBegin.bind(this));
    };
    FP.prototype._parseChunkBegin = function (H) {
      let _ = H.readUInt32BE(0),
        q = H.readUInt32BE(4),
        $ = "";
      for (let O = 4; O < 8; O++) $ += String.fromCharCode(H[O]);
      let K = Boolean(H[4] & 32);
      if (!this._hasIHDR && q !== DJ.TYPE_IHDR) {
        this.error(Error("Expected IHDR on beggining"));
        return;
      }
      if (((this._crc = new L9K()), this._crc.write(Buffer.from($)), this._chunks[q])) return this._chunks[q](_);
      if (!K) {
        this.error(Error("Unsupported critical chunk type " + $));
        return;
      }
      this.read(_ + 4, this._skipChunk.bind(this));
    };
    FP.prototype._skipChunk = function () {
      this.read(8, this._parseChunkBegin.bind(this));
    };
    FP.prototype._handleChunkEnd = function () {
      this.read(4, this._parseChunkEnd.bind(this));
    };
    FP.prototype._parseChunkEnd = function (H) {
      let _ = H.readInt32BE(0),
        q = this._crc.crc32();
      if (this._options.checkCRC && q !== _) {
        this.error(Error("Crc error - " + _ + " - " + q));
        return;
      }
      if (!this._hasIEND) this.read(8, this._parseChunkBegin.bind(this));
    };
    FP.prototype._handleIHDR = function (H) {
      this.read(H, this._parseIHDR.bind(this));
    };
    FP.prototype._parseIHDR = function (H) {
      this._crc.write(H);
      let _ = H.readUInt32BE(0),
        q = H.readUInt32BE(4),
        $ = H[8],
        K = H[9],
        O = H[10],
        T = H[11],
        z = H[12];
      if ($ !== 8 && $ !== 4 && $ !== 2 && $ !== 1 && $ !== 16) {
        this.error(Error("Unsupported bit depth " + $));
        return;
      }
      if (!(K in DJ.COLORTYPE_TO_BPP_MAP)) {
        this.error(Error("Unsupported color type"));
        return;
      }
      if (O !== 0) {
        this.error(Error("Unsupported compression method"));
        return;
      }
      if (T !== 0) {
        this.error(Error("Unsupported filter method"));
        return;
      }
      if (z !== 0 && z !== 1) {
        this.error(Error("Unsupported interlace method"));
        return;
      }
      this._colorType = K;
      let A = DJ.COLORTYPE_TO_BPP_MAP[this._colorType];
      (this._hasIHDR = !0),
        this.metadata({
          width: _,
          height: q,
          depth: $,
          interlace: Boolean(z),
          palette: Boolean(K & DJ.COLORTYPE_PALETTE),
          color: Boolean(K & DJ.COLORTYPE_COLOR),
          alpha: Boolean(K & DJ.COLORTYPE_ALPHA),
          bpp: A,
          colorType: K,
        }),
        this._handleChunkEnd();
    };
    FP.prototype._handlePLTE = function (H) {
      this.read(H, this._parsePLTE.bind(this));
    };
    FP.prototype._parsePLTE = function (H) {
      this._crc.write(H);
      let _ = Math.floor(H.length / 3);
      for (let q = 0; q < _; q++) this._palette.push([H[q * 3], H[q * 3 + 1], H[q * 3 + 2], 255]);
      this.palette(this._palette), this._handleChunkEnd();
    };
    FP.prototype._handleTRNS = function (H) {
      this.simpleTransparency(), this.read(H, this._parseTRNS.bind(this));
    };
    FP.prototype._parseTRNS = function (H) {
      if ((this._crc.write(H), this._colorType === DJ.COLORTYPE_PALETTE_COLOR)) {
        if (this._palette.length === 0) {
          this.error(Error("Transparency chunk must be after palette"));
          return;
        }
        if (H.length > this._palette.length) {
          this.error(Error("More transparent colors than palette size"));
          return;
        }
        for (let _ = 0; _ < H.length; _++) this._palette[_][3] = H[_];
        this.palette(this._palette);
      }
      if (this._colorType === DJ.COLORTYPE_GRAYSCALE) this.transColor([H.readUInt16BE(0)]);
      if (this._colorType === DJ.COLORTYPE_COLOR)
        this.transColor([H.readUInt16BE(0), H.readUInt16BE(2), H.readUInt16BE(4)]);
      this._handleChunkEnd();
    };
    FP.prototype._handleGAMA = function (H) {
      this.read(H, this._parseGAMA.bind(this));
    };
    FP.prototype._parseGAMA = function (H) {
      this._crc.write(H), this.gamma(H.readUInt32BE(0) / DJ.GAMMA_DIVISION), this._handleChunkEnd();
    };
    FP.prototype._handleIDAT = function (H) {
      if (!this._emittedHeadersFinished) (this._emittedHeadersFinished = !0), this.headersFinished();
      this.read(-H, this._parseIDAT.bind(this, H));
    };
    FP.prototype._parseIDAT = function (H, _) {
      if ((this._crc.write(_), this._colorType === DJ.COLORTYPE_PALETTE_COLOR && this._palette.length === 0))
        throw Error("Expected palette not found");
      this.inflateData(_);
      let q = H - _.length;
      if (q > 0) this._handleIDAT(q);
      else this._handleChunkEnd();
    };
    FP.prototype._handleIEND = function (H) {
      this.read(H, this._parseIEND.bind(this));
    };
    FP.prototype._parseIEND = function (H) {
      if ((this._crc.write(H), (this._hasIEND = !0), this._handleChunkEnd(), this.finished)) this.finished();
    };
  });
