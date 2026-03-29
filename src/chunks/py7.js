  var py7 = d((Ld6) => {
    Object.defineProperty(Ld6, "__esModule", { value: !0 });
    var Iy7 = require("util"),
      Pr = uE_();
    class xE_ extends Pr.AbstractMessageBuffer {
      constructor(H = "utf-8") {
        super(H);
      }
      emptyBuffer() {
        return xE_.emptyBuffer;
      }
      fromString(H, _) {
        return Buffer.from(H, _);
      }
      toString(H, _) {
        if (H instanceof Buffer) return H.toString(_);
        else return new Iy7.TextDecoder(_).decode(H);
      }
      asNative(H, _) {
        if (_ === void 0) return H instanceof Buffer ? H : Buffer.from(H);
        else return H instanceof Buffer ? H.slice(0, _) : Buffer.from(H, 0, _);
      }
      allocNative(H) {
        return Buffer.allocUnsafe(H);
      }
    }
    xE_.emptyBuffer = Buffer.allocUnsafe(0);
    class uy7 {
      constructor(H) {
        this.stream = H;
      }
      onClose(H) {
        return this.stream.on("close", H), Pr.Disposable.create(() => this.stream.off("close", H));
      }
      onError(H) {
        return this.stream.on("error", H), Pr.Disposable.create(() => this.stream.off("error", H));
      }
      onEnd(H) {
        return this.stream.on("end", H), Pr.Disposable.create(() => this.stream.off("end", H));
      }
      onData(H) {
        return this.stream.on("data", H), Pr.Disposable.create(() => this.stream.off("data", H));
      }
    }
    class xy7 {
      constructor(H) {
        this.stream = H;
      }
      onClose(H) {
        return this.stream.on("close", H), Pr.Disposable.create(() => this.stream.off("close", H));
      }
      onError(H) {
        return this.stream.on("error", H), Pr.Disposable.create(() => this.stream.off("error", H));
      }
      onEnd(H) {
        return this.stream.on("end", H), Pr.Disposable.create(() => this.stream.off("end", H));
      }
      write(H, _) {
        return new Promise((q, $) => {
          let K = (O) => {
            if (O === void 0 || O === null) q();
            else $(O);
          };
          if (typeof H === "string") this.stream.write(H, _, K);
          else this.stream.write(H, K);
        });
      }
      end() {
        this.stream.end();
      }
    }
    var my7 = Object.freeze({
      messageBuffer: Object.freeze({ create: (H) => new xE_(H) }),
      applicationJson: Object.freeze({
        encoder: Object.freeze({
          name: "application/json",
          encode: (H, _) => {
            try {
              return Promise.resolve(Buffer.from(JSON.stringify(H, void 0, 0), _.charset));
            } catch (q) {
              return Promise.reject(q);
            }
          },
        }),
        decoder: Object.freeze({
          name: "application/json",
          decode: (H, _) => {
            try {
              if (H instanceof Buffer) return Promise.resolve(JSON.parse(H.toString(_.charset)));
              else return Promise.resolve(JSON.parse(new Iy7.TextDecoder(_.charset).decode(H)));
            } catch (q) {
              return Promise.reject(q);
            }
          },
        }),
      }),
      stream: Object.freeze({ asReadableStream: (H) => new uy7(H), asWritableStream: (H) => new xy7(H) }),
      console,
      timer: Object.freeze({
        setTimeout(H, _, ...q) {
          let $ = setTimeout(H, _, ...q);
          return { dispose: () => clearTimeout($) };
        },
        setImmediate(H, ..._) {
          let q = setImmediate(H, ..._);
          return { dispose: () => clearImmediate(q) };
        },
        setInterval(H, _, ...q) {
          let $ = setInterval(H, _, ...q);
          return { dispose: () => clearInterval($) };
        },
      }),
    });
    function Zd6() {
      return my7;
    }
    (function (H) {
      function _() {
        Pr.RAL.install(my7);
      }
      H.install = _;
    })(Zd6 || (Zd6 = {}));
    Ld6.default = Zd6;
  });
