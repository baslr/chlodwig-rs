  var pl6 = d((hNH) => {
    Object.defineProperty(hNH, "__esModule", { value: !0 });
    hNH.CompressionFilterFactory = hNH.CompressionFilter = void 0;
    var Lx_ = require("zlib"),
      lc7 = ul6(),
      vNH = mK(),
      $y1 = xl6(),
      Ky1 = DA(),
      Oy1 = (H) => {
        return typeof H === "number" && typeof lc7.CompressionAlgorithms[H] === "string";
      };
    class vsH {
      async writeMessage(H, _) {
        let q = H;
        if (_) q = await this.compressMessage(q);
        let $ = Buffer.allocUnsafe(q.length + 5);
        return $.writeUInt8(_ ? 1 : 0, 0), $.writeUInt32BE(q.length, 1), q.copy($, 5), $;
      }
      async readMessage(H) {
        let _ = H.readUInt8(0) === 1,
          q = H.slice(5);
        if (_) q = await this.decompressMessage(q);
        return q;
      }
    }
    class NNH extends vsH {
      async compressMessage(H) {
        return H;
      }
      async writeMessage(H, _) {
        let q = Buffer.allocUnsafe(H.length + 5);
        return q.writeUInt8(0, 0), q.writeUInt32BE(H.length, 1), H.copy(q, 5), q;
      }
      decompressMessage(H) {
        return Promise.reject(Error('Received compressed message but "grpc-encoding" header was identity'));
      }
    }
    class ic7 extends vsH {
      constructor(H) {
        super();
        this.maxRecvMessageLength = H;
      }
      compressMessage(H) {
        return new Promise((_, q) => {
          Lx_.deflate(H, ($, K) => {
            if ($) q($);
            else _(K);
          });
        });
      }
      decompressMessage(H) {
        return new Promise((_, q) => {
          let $ = 0,
            K = [],
            O = Lx_.createInflate();
          O.on("data", (T) => {
            if ((K.push(T), ($ += T.byteLength), this.maxRecvMessageLength !== -1 && $ > this.maxRecvMessageLength))
              O.destroy(),
                q({
                  code: vNH.Status.RESOURCE_EXHAUSTED,
                  details: `Received message that decompresses to a size larger than ${this.maxRecvMessageLength}`,
                });
          }),
            O.on("end", () => {
              _(Buffer.concat(K));
            }),
            O.write(H),
            O.end();
        });
      }
    }
    class nc7 extends vsH {
      constructor(H) {
        super();
        this.maxRecvMessageLength = H;
      }
      compressMessage(H) {
        return new Promise((_, q) => {
          Lx_.gzip(H, ($, K) => {
            if ($) q($);
            else _(K);
          });
        });
      }
      decompressMessage(H) {
        return new Promise((_, q) => {
          let $ = 0,
            K = [],
            O = Lx_.createGunzip();
          O.on("data", (T) => {
            if ((K.push(T), ($ += T.byteLength), this.maxRecvMessageLength !== -1 && $ > this.maxRecvMessageLength))
              O.destroy(),
                q({
                  code: vNH.Status.RESOURCE_EXHAUSTED,
                  details: `Received message that decompresses to a size larger than ${this.maxRecvMessageLength}`,
                });
          }),
            O.on("end", () => {
              _(Buffer.concat(K));
            }),
            O.write(H),
            O.end();
        });
      }
    }
    class rc7 extends vsH {
      constructor(H) {
        super();
        this.compressionName = H;
      }
      compressMessage(H) {
        return Promise.reject(
          Error(`Received message compressed with unsupported compression method ${this.compressionName}`),
        );
      }
      decompressMessage(H) {
        return Promise.reject(Error(`Compression method not supported: ${this.compressionName}`));
      }
    }
    function Qc7(H, _) {
      switch (H) {
        case "identity":
          return new NNH();
        case "deflate":
          return new ic7(_);
        case "gzip":
          return new nc7(_);
        default:
          return new rc7(H);
      }
    }
    class ml6 extends $y1.BaseFilter {
      constructor(H, _) {
        var q, $, K;
        super();
        (this.sharedFilterConfig = _),
          (this.sendCompression = new NNH()),
          (this.receiveCompression = new NNH()),
          (this.currentCompressionAlgorithm = "identity");
        let O = H["grpc.default_compression_algorithm"];
        if (
          ((this.maxReceiveMessageLength =
            (q = H["grpc.max_receive_message_length"]) !== null && q !== void 0
              ? q
              : vNH.DEFAULT_MAX_RECEIVE_MESSAGE_LENGTH),
          (this.maxSendMessageLength =
            ($ = H["grpc.max_send_message_length"]) !== null && $ !== void 0 ? $ : vNH.DEFAULT_MAX_SEND_MESSAGE_LENGTH),
          O !== void 0)
        )
          if (Oy1(O)) {
            let T = lc7.CompressionAlgorithms[O],
              z = (K = _.serverSupportedEncodingHeader) === null || K === void 0 ? void 0 : K.split(",");
            if (!z || z.includes(T))
              (this.currentCompressionAlgorithm = T),
                (this.sendCompression = Qc7(this.currentCompressionAlgorithm, -1));
          } else
            Ky1.log(
              vNH.LogVerbosity.ERROR,
              `Invalid value provided for grpc.default_compression_algorithm option: ${O}`,
            );
      }
      async sendMetadata(H) {
        let _ = await H;
        if (
          (_.set("grpc-accept-encoding", "identity,deflate,gzip"),
          _.set("accept-encoding", "identity"),
          this.currentCompressionAlgorithm === "identity")
        )
          _.remove("grpc-encoding");
        else _.set("grpc-encoding", this.currentCompressionAlgorithm);
        return _;
      }
      receiveMetadata(H) {
        let _ = H.get("grpc-encoding");
        if (_.length > 0) {
          let $ = _[0];
          if (typeof $ === "string") this.receiveCompression = Qc7($, this.maxReceiveMessageLength);
        }
        H.remove("grpc-encoding");
        let q = H.get("grpc-accept-encoding")[0];
        if (q) {
          if (
            ((this.sharedFilterConfig.serverSupportedEncodingHeader = q),
            !q.split(",").includes(this.currentCompressionAlgorithm))
          )
            (this.sendCompression = new NNH()), (this.currentCompressionAlgorithm = "identity");
        }
        return H.remove("grpc-accept-encoding"), H;
      }
      async sendMessage(H) {
        var _;
        let q = await H;
        if (this.maxSendMessageLength !== -1 && q.message.length > this.maxSendMessageLength)
          throw {
            code: vNH.Status.RESOURCE_EXHAUSTED,
            details: `Attempted to send message with a size larger than ${this.maxSendMessageLength}`,
          };
        let $;
        if (this.sendCompression instanceof NNH) $ = !1;
        else $ = (((_ = q.flags) !== null && _ !== void 0 ? _ : 0) & 2) === 0;
        return { message: await this.sendCompression.writeMessage(q.message, $), flags: q.flags };
      }
      async receiveMessage(H) {
        return this.receiveCompression.readMessage(await H);
      }
    }
    hNH.CompressionFilter = ml6;
    class oc7 {
      constructor(H, _) {
        (this.options = _), (this.sharedFilterConfig = {});
      }
      createFilter() {
        return new ml6(this.options, this.sharedFilterConfig);
      }
    }
    hNH.CompressionFilterFactory = oc7;
  });
