  var TM9 = d((V7z, OM9) => {
    var C9K = require("util"),
      mq8 = require("zlib"),
      KM9 = Nq8(),
      b9K = sj9(),
      I9K = Iq8(),
      u9K = uq8(),
      x9K = xq8(),
      iF = (OM9.exports = function (H) {
        KM9.call(this),
          (this._parser = new I9K(H, {
            read: this.read.bind(this),
            error: this._handleError.bind(this),
            metadata: this._handleMetaData.bind(this),
            gamma: this.emit.bind(this, "gamma"),
            palette: this._handlePalette.bind(this),
            transColor: this._handleTransColor.bind(this),
            finished: this._finished.bind(this),
            inflateData: this._inflateData.bind(this),
            simpleTransparency: this._simpleTransparency.bind(this),
            headersFinished: this._headersFinished.bind(this),
          })),
          (this._options = H),
          (this.writable = !0),
          this._parser.start();
      });
    C9K.inherits(iF, KM9);
    iF.prototype._handleError = function (H) {
      if ((this.emit("error", H), (this.writable = !1), this.destroy(), this._inflate && this._inflate.destroy))
        this._inflate.destroy();
      if (this._filter) this._filter.destroy(), this._filter.on("error", function () {});
      this.errord = !0;
    };
    iF.prototype._inflateData = function (H) {
      if (!this._inflate)
        if (this._bitmapInfo.interlace)
          (this._inflate = mq8.createInflate()),
            this._inflate.on("error", this.emit.bind(this, "error")),
            this._filter.on("complete", this._complete.bind(this)),
            this._inflate.pipe(this._filter);
        else {
          let q =
              (((this._bitmapInfo.width * this._bitmapInfo.bpp * this._bitmapInfo.depth + 7) >> 3) + 1) *
              this._bitmapInfo.height,
            $ = Math.max(q, mq8.Z_MIN_CHUNK);
          this._inflate = mq8.createInflate({ chunkSize: $ });
          let K = q,
            O = this.emit.bind(this, "error");
          this._inflate.on("error", function (z) {
            if (!K) return;
            O(z);
          }),
            this._filter.on("complete", this._complete.bind(this));
          let T = this._filter.write.bind(this._filter);
          this._inflate.on("data", function (z) {
            if (!K) return;
            if (z.length > K) z = z.slice(0, K);
            (K -= z.length), T(z);
          }),
            this._inflate.on("end", this._filter.end.bind(this._filter));
        }
      this._inflate.write(H);
    };
    iF.prototype._handleMetaData = function (H) {
      (this._metaData = H), (this._bitmapInfo = Object.create(H)), (this._filter = new b9K(this._bitmapInfo));
    };
    iF.prototype._handleTransColor = function (H) {
      this._bitmapInfo.transColor = H;
    };
    iF.prototype._handlePalette = function (H) {
      this._bitmapInfo.palette = H;
    };
    iF.prototype._simpleTransparency = function () {
      this._metaData.alpha = !0;
    };
    iF.prototype._headersFinished = function () {
      this.emit("metadata", this._metaData);
    };
    iF.prototype._finished = function () {
      if (this.errord) return;
      if (!this._inflate) this.emit("error", "No Inflate block");
      else this._inflate.end();
    };
    iF.prototype._complete = function (H) {
      if (this.errord) return;
      let _;
      try {
        let q = u9K.dataToBitMap(H, this._bitmapInfo);
        (_ = x9K(q, this._bitmapInfo)), (q = null);
      } catch (q) {
        this._handleError(q);
        return;
      }
      this.emit("parsed", _);
    };
  });
