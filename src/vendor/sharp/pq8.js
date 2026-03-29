  var pq8 = d((C7z, DM9) => {
    var AR = KSH(),
      r9K = bq8(),
      o9K = AM9(),
      a9K = YM9(),
      s9K = require("zlib"),
      U9H = (DM9.exports = function (H) {
        if (
          ((this._options = H),
          (H.deflateChunkSize = H.deflateChunkSize || 32768),
          (H.deflateLevel = H.deflateLevel != null ? H.deflateLevel : 9),
          (H.deflateStrategy = H.deflateStrategy != null ? H.deflateStrategy : 3),
          (H.inputHasAlpha = H.inputHasAlpha != null ? H.inputHasAlpha : !0),
          (H.deflateFactory = H.deflateFactory || s9K.createDeflate),
          (H.bitDepth = H.bitDepth || 8),
          (H.colorType = typeof H.colorType === "number" ? H.colorType : AR.COLORTYPE_COLOR_ALPHA),
          (H.inputColorType = typeof H.inputColorType === "number" ? H.inputColorType : AR.COLORTYPE_COLOR_ALPHA),
          [AR.COLORTYPE_GRAYSCALE, AR.COLORTYPE_COLOR, AR.COLORTYPE_COLOR_ALPHA, AR.COLORTYPE_ALPHA].indexOf(
            H.colorType,
          ) === -1)
        )
          throw Error("option color type:" + H.colorType + " is not supported at present");
        if (
          [AR.COLORTYPE_GRAYSCALE, AR.COLORTYPE_COLOR, AR.COLORTYPE_COLOR_ALPHA, AR.COLORTYPE_ALPHA].indexOf(
            H.inputColorType,
          ) === -1
        )
          throw Error("option input color type:" + H.inputColorType + " is not supported at present");
        if (H.bitDepth !== 8 && H.bitDepth !== 16)
          throw Error("option bit depth:" + H.bitDepth + " is not supported at present");
      });
    U9H.prototype.getDeflateOptions = function () {
      return {
        chunkSize: this._options.deflateChunkSize,
        level: this._options.deflateLevel,
        strategy: this._options.deflateStrategy,
      };
    };
    U9H.prototype.createDeflate = function () {
      return this._options.deflateFactory(this.getDeflateOptions());
    };
    U9H.prototype.filterData = function (H, _, q) {
      let $ = o9K(H, _, q, this._options),
        K = AR.COLORTYPE_TO_BPP_MAP[this._options.colorType];
      return a9K($, _, q, this._options, K);
    };
    U9H.prototype._packChunk = function (H, _) {
      let q = _ ? _.length : 0,
        $ = Buffer.alloc(q + 12);
      if (($.writeUInt32BE(q, 0), $.writeUInt32BE(H, 4), _)) _.copy($, 8);
      return $.writeInt32BE(r9K.crc32($.slice(4, $.length - 4)), $.length - 4), $;
    };
    U9H.prototype.packGAMA = function (H) {
      let _ = Buffer.alloc(4);
      return _.writeUInt32BE(Math.floor(H * AR.GAMMA_DIVISION), 0), this._packChunk(AR.TYPE_gAMA, _);
    };
    U9H.prototype.packIHDR = function (H, _) {
      let q = Buffer.alloc(13);
      return (
        q.writeUInt32BE(H, 0),
        q.writeUInt32BE(_, 4),
        (q[8] = this._options.bitDepth),
        (q[9] = this._options.colorType),
        (q[10] = 0),
        (q[11] = 0),
        (q[12] = 0),
        this._packChunk(AR.TYPE_IHDR, q)
      );
    };
    U9H.prototype.packIDAT = function (H) {
      return this._packChunk(AR.TYPE_IDAT, H);
    };
    U9H.prototype.packIEND = function () {
      return this._packChunk(AR.TYPE_IEND, null);
    };
  });
