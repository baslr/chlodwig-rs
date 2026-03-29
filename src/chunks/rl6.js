  var rl6 = d((Sx_) => {
    Object.defineProperty(Sx_, "__esModule", { value: !0 });
    Sx_.StreamDecoder = void 0;
    var nc;
    (function (H) {
      (H[(H.NO_DATA = 0)] = "NO_DATA"),
        (H[(H.READING_SIZE = 1)] = "READING_SIZE"),
        (H[(H.READING_MESSAGE = 2)] = "READING_MESSAGE");
    })(nc || (nc = {}));
    class wF7 {
      constructor(H) {
        (this.maxReadMessageLength = H),
          (this.readState = nc.NO_DATA),
          (this.readCompressFlag = Buffer.alloc(1)),
          (this.readPartialSize = Buffer.alloc(4)),
          (this.readSizeRemaining = 4),
          (this.readMessageSize = 0),
          (this.readPartialMessage = []),
          (this.readMessageRemaining = 0);
      }
      write(H) {
        let _ = 0,
          q,
          $ = [];
        while (_ < H.length)
          switch (this.readState) {
            case nc.NO_DATA:
              (this.readCompressFlag = H.slice(_, _ + 1)),
                (_ += 1),
                (this.readState = nc.READING_SIZE),
                this.readPartialSize.fill(0),
                (this.readSizeRemaining = 4),
                (this.readMessageSize = 0),
                (this.readMessageRemaining = 0),
                (this.readPartialMessage = []);
              break;
            case nc.READING_SIZE:
              if (
                ((q = Math.min(H.length - _, this.readSizeRemaining)),
                H.copy(this.readPartialSize, 4 - this.readSizeRemaining, _, _ + q),
                (this.readSizeRemaining -= q),
                (_ += q),
                this.readSizeRemaining === 0)
              ) {
                if (
                  ((this.readMessageSize = this.readPartialSize.readUInt32BE(0)),
                  this.maxReadMessageLength !== -1 && this.readMessageSize > this.maxReadMessageLength)
                )
                  throw Error(
                    `Received message larger than max (${this.readMessageSize} vs ${this.maxReadMessageLength})`,
                  );
                if (((this.readMessageRemaining = this.readMessageSize), this.readMessageRemaining > 0))
                  this.readState = nc.READING_MESSAGE;
                else {
                  let K = Buffer.concat([this.readCompressFlag, this.readPartialSize], 5);
                  (this.readState = nc.NO_DATA), $.push(K);
                }
              }
              break;
            case nc.READING_MESSAGE:
              if (
                ((q = Math.min(H.length - _, this.readMessageRemaining)),
                this.readPartialMessage.push(H.slice(_, _ + q)),
                (this.readMessageRemaining -= q),
                (_ += q),
                this.readMessageRemaining === 0)
              ) {
                let K = [this.readCompressFlag, this.readPartialSize].concat(this.readPartialMessage),
                  O = Buffer.concat(K, this.readMessageSize + 5);
                (this.readState = nc.NO_DATA), $.push(O);
              }
              break;
            default:
              throw Error("Unexpected read state");
          }
        return $;
      }
    }
    Sx_.StreamDecoder = wF7;
  });
