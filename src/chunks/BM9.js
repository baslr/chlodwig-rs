  var BM9 = d((pM9) => {
    var P$K = require("util"),
      mM9 = require("stream"),
      X$K = TM9(),
      W$K = PM9(),
      G$K = xM9(),
      GL = (pM9.PNG = function (H) {
        if (
          (mM9.call(this),
          (H = H || {}),
          (this.width = H.width | 0),
          (this.height = H.height | 0),
          (this.data = this.width > 0 && this.height > 0 ? Buffer.alloc(4 * this.width * this.height) : null),
          H.fill && this.data)
        )
          this.data.fill(0);
        (this.gamma = 0),
          (this.readable = this.writable = !0),
          (this._parser = new X$K(H)),
          this._parser.on("error", this.emit.bind(this, "error")),
          this._parser.on("close", this._handleClose.bind(this)),
          this._parser.on("metadata", this._metadata.bind(this)),
          this._parser.on("gamma", this._gamma.bind(this)),
          this._parser.on(
            "parsed",
            function (_) {
              (this.data = _), this.emit("parsed", _);
            }.bind(this),
          ),
          (this._packer = new W$K(H)),
          this._packer.on("data", this.emit.bind(this, "data")),
          this._packer.on("end", this.emit.bind(this, "end")),
          this._parser.on("close", this._handleClose.bind(this)),
          this._packer.on("error", this.emit.bind(this, "error"));
      });
    P$K.inherits(GL, mM9);
    GL.sync = G$K;
    GL.prototype.pack = function () {
      if (!this.data || !this.data.length) return this.emit("error", "No data provided"), this;
      return (
        process.nextTick(
          function () {
            this._packer.pack(this.data, this.width, this.height, this.gamma);
          }.bind(this),
        ),
        this
      );
    };
    GL.prototype.parse = function (H, _) {
      if (_) {
        let q, $;
        (q = function (K) {
          this.removeListener("error", $), (this.data = K), _(null, this);
        }.bind(this)),
          ($ = function (K) {
            this.removeListener("parsed", q), _(K, null);
          }.bind(this)),
          this.once("parsed", q),
          this.once("error", $);
      }
      return this.end(H), this;
    };
    GL.prototype.write = function (H) {
      return this._parser.write(H), !0;
    };
    GL.prototype.end = function (H) {
      this._parser.end(H);
    };
    GL.prototype._metadata = function (H) {
      (this.width = H.width), (this.height = H.height), this.emit("metadata", H);
    };
    GL.prototype._gamma = function (H) {
      this.gamma = H;
    };
    GL.prototype._handleClose = function () {
      if (!this._parser.writable && !this._packer.readable) this.emit("close");
    };
    GL.bitblt = function (H, _, q, $, K, O, T, z) {
      if (
        ((q |= 0),
        ($ |= 0),
        (K |= 0),
        (O |= 0),
        (T |= 0),
        (z |= 0),
        q > H.width || $ > H.height || q + K > H.width || $ + O > H.height)
      )
        throw Error("bitblt reading outside image");
      if (T > _.width || z > _.height || T + K > _.width || z + O > _.height)
        throw Error("bitblt writing outside image");
      for (let A = 0; A < O; A++)
        H.data.copy(
          _.data,
          ((z + A) * _.width + T) << 2,
          (($ + A) * H.width + q) << 2,
          (($ + A) * H.width + q + K) << 2,
        );
    };
    GL.prototype.bitblt = function (H, _, q, $, K, O, T) {
      return GL.bitblt(this, H, _, q, $, K, O, T), this;
    };
    GL.adjustGamma = function (H) {
      if (H.gamma) {
        for (let _ = 0; _ < H.height; _++)
          for (let q = 0; q < H.width; q++) {
            let $ = (H.width * _ + q) << 2;
            for (let K = 0; K < 3; K++) {
              let O = H.data[$ + K] / 255;
              (O = Math.pow(O, 0.45454545454545453 / H.gamma)), (H.data[$ + K] = Math.round(O * 255));
            }
          }
        H.gamma = 0;
      }
    };
    GL.prototype.adjustGamma = function () {
      GL.adjustGamma(this);
    };
  });
