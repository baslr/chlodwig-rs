  var rKq = d((eY_) => {
    Object.defineProperty(eY_, "__esModule", { value: !0 });
    eY_.RawSha256 = void 0;
    var xS = NY6(),
      mo$ = (function () {
        function H() {
          (this.state = Int32Array.from(xS.INIT)),
            (this.temp = new Int32Array(64)),
            (this.buffer = new Uint8Array(64)),
            (this.bufferLength = 0),
            (this.bytesHashed = 0),
            (this.finished = !1);
        }
        return (
          (H.prototype.update = function (_) {
            if (this.finished) throw Error("Attempted to update an already finished hash.");
            var q = 0,
              $ = _.byteLength;
            if (((this.bytesHashed += $), this.bytesHashed * 8 > xS.MAX_HASHABLE_LENGTH))
              throw Error("Cannot hash more than 2^53 - 1 bits");
            while ($ > 0)
              if (((this.buffer[this.bufferLength++] = _[q++]), $--, this.bufferLength === xS.BLOCK_SIZE))
                this.hashBuffer(), (this.bufferLength = 0);
          }),
          (H.prototype.digest = function () {
            if (!this.finished) {
              var _ = this.bytesHashed * 8,
                q = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength),
                $ = this.bufferLength;
              if ((q.setUint8(this.bufferLength++, 128), $ % xS.BLOCK_SIZE >= xS.BLOCK_SIZE - 8)) {
                for (var K = this.bufferLength; K < xS.BLOCK_SIZE; K++) q.setUint8(K, 0);
                this.hashBuffer(), (this.bufferLength = 0);
              }
              for (var K = this.bufferLength; K < xS.BLOCK_SIZE - 8; K++) q.setUint8(K, 0);
              q.setUint32(xS.BLOCK_SIZE - 8, Math.floor(_ / 4294967296), !0),
                q.setUint32(xS.BLOCK_SIZE - 4, _),
                this.hashBuffer(),
                (this.finished = !0);
            }
            var O = new Uint8Array(xS.DIGEST_LENGTH);
            for (var K = 0; K < 8; K++)
              (O[K * 4] = (this.state[K] >>> 24) & 255),
                (O[K * 4 + 1] = (this.state[K] >>> 16) & 255),
                (O[K * 4 + 2] = (this.state[K] >>> 8) & 255),
                (O[K * 4 + 3] = (this.state[K] >>> 0) & 255);
            return O;
          }),
          (H.prototype.hashBuffer = function () {
            var _ = this,
              q = _.buffer,
              $ = _.state,
              K = $[0],
              O = $[1],
              T = $[2],
              z = $[3],
              A = $[4],
              f = $[5],
              w = $[6],
              Y = $[7];
            for (var D = 0; D < xS.BLOCK_SIZE; D++) {
              if (D < 16)
                this.temp[D] =
                  ((q[D * 4] & 255) << 24) |
                  ((q[D * 4 + 1] & 255) << 16) |
                  ((q[D * 4 + 2] & 255) << 8) |
                  (q[D * 4 + 3] & 255);
              else {
                var j = this.temp[D - 2],
                  M = ((j >>> 17) | (j << 15)) ^ ((j >>> 19) | (j << 13)) ^ (j >>> 10);
                j = this.temp[D - 15];
                var J = ((j >>> 7) | (j << 25)) ^ ((j >>> 18) | (j << 14)) ^ (j >>> 3);
                this.temp[D] = ((M + this.temp[D - 7]) | 0) + ((J + this.temp[D - 16]) | 0);
              }
              var P =
                  ((((((A >>> 6) | (A << 26)) ^ ((A >>> 11) | (A << 21)) ^ ((A >>> 25) | (A << 7))) +
                    ((A & f) ^ (~A & w))) |
                    0) +
                    ((Y + ((xS.KEY[D] + this.temp[D]) | 0)) | 0)) |
                  0,
                X =
                  ((((K >>> 2) | (K << 30)) ^ ((K >>> 13) | (K << 19)) ^ ((K >>> 22) | (K << 10))) +
                    ((K & O) ^ (K & T) ^ (O & T))) |
                  0;
              (Y = w), (w = f), (f = A), (A = (z + P) | 0), (z = T), (T = O), (O = K), (K = (P + X) | 0);
            }
            ($[0] += K), ($[1] += O), ($[2] += T), ($[3] += z), ($[4] += A), ($[5] += f), ($[6] += w), ($[7] += Y);
          }),
          H
        );
      })();
    eY_.RawSha256 = mo$;
  });
