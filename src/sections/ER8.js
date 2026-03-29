    uA();
    (VR8 = u(require("stream"))), (t$6 = Symbol("internals"));
    SR8 = class SR8 extends VR8.default.Transform {
      constructor(H) {
        H = Q_.toFlatObject(
          H,
          { maxRate: 0, chunkSize: 65536, minChunkSize: 100, timeWindow: 500, ticksRate: 2, samplesCount: 15 },
          null,
          (q, $) => {
            return !Q_.isUndefined($[q]);
          },
        );
        super({ readableHighWaterMark: H.chunkSize });
        let _ = (this[t$6] = {
          timeWindow: H.timeWindow,
          chunkSize: H.chunkSize,
          maxRate: H.maxRate,
          minChunkSize: H.minChunkSize,
          bytesSeen: 0,
          isCaptured: !1,
          notifiedBytesLoaded: 0,
          ts: Date.now(),
          bytes: 0,
          onReadCallback: null,
        });
        this.on("newListener", (q) => {
          if (q === "progress") {
            if (!_.isCaptured) _.isCaptured = !0;
          }
        });
      }
      _read(H) {
        let _ = this[t$6];
        if (_.onReadCallback) _.onReadCallback();
        return super._read(H);
      }
      _transform(H, _, q) {
        let $ = this[t$6],
          K = $.maxRate,
          O = this.readableHighWaterMark,
          T = $.timeWindow,
          z = 1000 / T,
          A = K / z,
          f = $.minChunkSize !== !1 ? Math.max($.minChunkSize, A * 0.01) : 0,
          w = (D, j) => {
            let M = Buffer.byteLength(D);
            if ((($.bytesSeen += M), ($.bytes += M), $.isCaptured && this.emit("progress", $.bytesSeen), this.push(D)))
              process.nextTick(j);
            else
              $.onReadCallback = () => {
                ($.onReadCallback = null), process.nextTick(j);
              };
          },
          Y = (D, j) => {
            let M = Buffer.byteLength(D),
              J = null,
              P = O,
              X,
              R = 0;
            if (K) {
              let W = Date.now();
              if (!$.ts || (R = W - $.ts) >= T) ($.ts = W), (X = A - $.bytes), ($.bytes = X < 0 ? -X : 0), (R = 0);
              X = A - $.bytes;
            }
            if (K) {
              if (X <= 0)
                return setTimeout(() => {
                  j(null, D);
                }, T - R);
              if (X < P) P = X;
            }
            if (P && M > P && M - P > f) (J = D.subarray(P)), (D = D.subarray(0, P));
            w(
              D,
              J
                ? () => {
                    process.nextTick(j, null, J);
                  }
                : j,
            );
          };
        Y(H, function D(j, M) {
          if (j) return q(j);
          if (M) Y(M, D);
          else q(null);
        });
      }
    };
    e$6 = SR8;
