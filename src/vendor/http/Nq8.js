  var Nq8 = d((W7z, lj9) => {
    var P9K = require("util"),
      Qj9 = require("stream"),
      sm = (lj9.exports = function () {
        Qj9.call(this),
          (this._buffers = []),
          (this._buffered = 0),
          (this._reads = []),
          (this._paused = !1),
          (this._encoding = "utf8"),
          (this.writable = !0);
      });
    P9K.inherits(sm, Qj9);
    sm.prototype.read = function (H, _) {
      this._reads.push({ length: Math.abs(H), allowLess: H < 0, func: _ }),
        process.nextTick(
          function () {
            if ((this._process(), this._paused && this._reads && this._reads.length > 0))
              (this._paused = !1), this.emit("drain");
          }.bind(this),
        );
    };
    sm.prototype.write = function (H, _) {
      if (!this.writable) return this.emit("error", Error("Stream not writable")), !1;
      let q;
      if (Buffer.isBuffer(H)) q = H;
      else q = Buffer.from(H, _ || this._encoding);
      if (
        (this._buffers.push(q), (this._buffered += q.length), this._process(), this._reads && this._reads.length === 0)
      )
        this._paused = !0;
      return this.writable && !this._paused;
    };
    sm.prototype.end = function (H, _) {
      if (H) this.write(H, _);
      if (((this.writable = !1), !this._buffers)) return;
      if (this._buffers.length === 0) this._end();
      else this._buffers.push(null), this._process();
    };
    sm.prototype.destroySoon = sm.prototype.end;
    sm.prototype._end = function () {
      if (this._reads.length > 0) this.emit("error", Error("Unexpected end of input"));
      this.destroy();
    };
    sm.prototype.destroy = function () {
      if (!this._buffers) return;
      (this.writable = !1), (this._reads = null), (this._buffers = null), this.emit("close");
    };
    sm.prototype._processReadAllowingLess = function (H) {
      this._reads.shift();
      let _ = this._buffers[0];
      if (_.length > H.length)
        (this._buffered -= H.length), (this._buffers[0] = _.slice(H.length)), H.func.call(this, _.slice(0, H.length));
      else (this._buffered -= _.length), this._buffers.shift(), H.func.call(this, _);
    };
    sm.prototype._processRead = function (H) {
      this._reads.shift();
      let _ = 0,
        q = 0,
        $ = Buffer.alloc(H.length);
      while (_ < H.length) {
        let K = this._buffers[q++],
          O = Math.min(K.length, H.length - _);
        if ((K.copy($, _, 0, O), (_ += O), O !== K.length)) this._buffers[--q] = K.slice(O);
      }
      if (q > 0) this._buffers.splice(0, q);
      (this._buffered -= H.length), H.func.call(this, $);
    };
    sm.prototype._process = function () {
      try {
        while (this._buffered > 0 && this._reads && this._reads.length > 0) {
          let H = this._reads[0];
          if (H.allowLess) this._processReadAllowingLess(H);
          else if (this._buffered >= H.length) this._processRead(H);
          else break;
        }
        if (this._buffers && !this.writable) this._end();
      } catch (H) {
        this.emit("error", H);
      }
    };
  });
