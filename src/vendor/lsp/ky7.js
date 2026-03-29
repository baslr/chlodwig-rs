  var ky7 = d((yE_) => {
    Object.defineProperty(yE_, "__esModule", { value: !0 });
    yE_.AbstractMessageBuffer = void 0;
    var lD1 = 13,
      iD1 = 10,
      nD1 = `\r
`;
    class Ly7 {
      constructor(H = "utf-8") {
        (this._encoding = H), (this._chunks = []), (this._totalLength = 0);
      }
      get encoding() {
        return this._encoding;
      }
      append(H) {
        let _ = typeof H === "string" ? this.fromString(H, this._encoding) : H;
        this._chunks.push(_), (this._totalLength += _.byteLength);
      }
      tryReadHeaders(H = !1) {
        if (this._chunks.length === 0) return;
        let _ = 0,
          q = 0,
          $ = 0,
          K = 0;
        H: while (q < this._chunks.length) {
          let A = this._chunks[q];
          $ = 0;
          _: while ($ < A.length) {
            switch (A[$]) {
              case lD1:
                switch (_) {
                  case 0:
                    _ = 1;
                    break;
                  case 2:
                    _ = 3;
                    break;
                  default:
                    _ = 0;
                }
                break;
              case iD1:
                switch (_) {
                  case 1:
                    _ = 2;
                    break;
                  case 3:
                    (_ = 4), $++;
                    break H;
                  default:
                    _ = 0;
                }
                break;
              default:
                _ = 0;
            }
            $++;
          }
          (K += A.byteLength), q++;
        }
        if (_ !== 4) return;
        let O = this._read(K + $),
          T = new Map(),
          z = this.toString(O, "ascii").split(nD1);
        if (z.length < 2) return T;
        for (let A = 0; A < z.length - 2; A++) {
          let f = z[A],
            w = f.indexOf(":");
          if (w === -1)
            throw Error(`Message header must separate key and value using ':'
${f}`);
          let Y = f.substr(0, w),
            D = f.substr(w + 1).trim();
          T.set(H ? Y.toLowerCase() : Y, D);
        }
        return T;
      }
      tryReadBody(H) {
        if (this._totalLength < H) return;
        return this._read(H);
      }
      get numberOfBytes() {
        return this._totalLength;
      }
      _read(H) {
        if (H === 0) return this.emptyBuffer();
        if (H > this._totalLength) throw Error("Cannot read so many bytes!");
        if (this._chunks[0].byteLength === H) {
          let K = this._chunks[0];
          return this._chunks.shift(), (this._totalLength -= H), this.asNative(K);
        }
        if (this._chunks[0].byteLength > H) {
          let K = this._chunks[0],
            O = this.asNative(K, H);
          return (this._chunks[0] = K.slice(H)), (this._totalLength -= H), O;
        }
        let _ = this.allocNative(H),
          q = 0,
          $ = 0;
        while (H > 0) {
          let K = this._chunks[$];
          if (K.byteLength > H) {
            let O = K.slice(0, H);
            _.set(O, q), (q += H), (this._chunks[$] = K.slice(H)), (this._totalLength -= H), (H -= H);
          } else
            _.set(K, q),
              (q += K.byteLength),
              this._chunks.shift(),
              (this._totalLength -= K.byteLength),
              (H -= K.byteLength);
        }
        return _;
      }
    }
    yE_.AbstractMessageBuffer = Ly7;
  });
