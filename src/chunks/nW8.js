  var nW8 = d((YaK, iW8) => {
    var Sf$ = require("util"),
      lW8 = require("stream").Stream,
      QW8 = UW8();
    iW8.exports = wD;
    function wD() {
      (this.writable = !1),
        (this.readable = !0),
        (this.dataSize = 0),
        (this.maxDataSize = 2097152),
        (this.pauseStreams = !0),
        (this._released = !1),
        (this._streams = []),
        (this._currentStream = null),
        (this._insideLoop = !1),
        (this._pendingNext = !1);
    }
    Sf$.inherits(wD, lW8);
    wD.create = function (H) {
      var _ = new this();
      H = H || {};
      for (var q in H) _[q] = H[q];
      return _;
    };
    wD.isStreamLike = function (H) {
      return (
        typeof H !== "function" &&
        typeof H !== "string" &&
        typeof H !== "boolean" &&
        typeof H !== "number" &&
        !Buffer.isBuffer(H)
      );
    };
    wD.prototype.append = function (H) {
      var _ = wD.isStreamLike(H);
      if (_) {
        if (!(H instanceof QW8)) {
          var q = QW8.create(H, { maxDataSize: 1 / 0, pauseStream: this.pauseStreams });
          H.on("data", this._checkDataSize.bind(this)), (H = q);
        }
        if ((this._handleErrors(H), this.pauseStreams)) H.pause();
      }
      return this._streams.push(H), this;
    };
    wD.prototype.pipe = function (H, _) {
      return lW8.prototype.pipe.call(this, H, _), this.resume(), H;
    };
    wD.prototype._getNext = function () {
      if (((this._currentStream = null), this._insideLoop)) {
        this._pendingNext = !0;
        return;
      }
      this._insideLoop = !0;
      try {
        do (this._pendingNext = !1), this._realGetNext();
        while (this._pendingNext);
      } finally {
        this._insideLoop = !1;
      }
    };
    wD.prototype._realGetNext = function () {
      var H = this._streams.shift();
      if (typeof H > "u") {
        this.end();
        return;
      }
      if (typeof H !== "function") {
        this._pipeNext(H);
        return;
      }
      var _ = H;
      _(
        function (q) {
          var $ = wD.isStreamLike(q);
          if ($) q.on("data", this._checkDataSize.bind(this)), this._handleErrors(q);
          this._pipeNext(q);
        }.bind(this),
      );
    };
    wD.prototype._pipeNext = function (H) {
      this._currentStream = H;
      var _ = wD.isStreamLike(H);
      if (_) {
        H.on("end", this._getNext.bind(this)), H.pipe(this, { end: !1 });
        return;
      }
      var q = H;
      this.write(q), this._getNext();
    };
    wD.prototype._handleErrors = function (H) {
      var _ = this;
      H.on("error", function (q) {
        _._emitError(q);
      });
    };
    wD.prototype.write = function (H) {
      this.emit("data", H);
    };
    wD.prototype.pause = function () {
      if (!this.pauseStreams) return;
      if (this.pauseStreams && this._currentStream && typeof this._currentStream.pause == "function")
        this._currentStream.pause();
      this.emit("pause");
    };
    wD.prototype.resume = function () {
      if (!this._released) (this._released = !0), (this.writable = !0), this._getNext();
      if (this.pauseStreams && this._currentStream && typeof this._currentStream.resume == "function")
        this._currentStream.resume();
      this.emit("resume");
    };
    wD.prototype.end = function () {
      this._reset(), this.emit("end");
    };
    wD.prototype.destroy = function () {
      this._reset(), this.emit("close");
    };
    wD.prototype._reset = function () {
      (this.writable = !1), (this._streams = []), (this._currentStream = null);
    };
    wD.prototype._checkDataSize = function () {
      if ((this._updateDataSize(), this.dataSize <= this.maxDataSize)) return;
      var H = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
      this._emitError(Error(H));
    };
    wD.prototype._updateDataSize = function () {
      this.dataSize = 0;
      var H = this;
      if (
        (this._streams.forEach(function (_) {
          if (!_.dataSize) return;
          H.dataSize += _.dataSize;
        }),
        this._currentStream && this._currentStream.dataSize)
      )
        this.dataSize += this._currentStream.dataSize;
    };
    wD.prototype._emitError = function (H) {
      this._reset(), this.emit("error", H);
    };
  });
