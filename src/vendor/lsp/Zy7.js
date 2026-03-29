  var Zy7 = d((JqH) => {
    Object.defineProperty(JqH, "__esModule", { value: !0 });
    JqH.WriteableStreamMessageWriter = JqH.AbstractMessageWriter = JqH.MessageWriter = void 0;
    var Py7 = jqH(),
      voH = ZkH(),
      UD1 = Od6(),
      Xy7 = kkH(),
      QD1 = "Content-Length: ",
      Wy7 = `\r
`,
      Gy7;
    (function (H) {
      function _(q) {
        let $ = q;
        return $ && voH.func($.dispose) && voH.func($.onClose) && voH.func($.onError) && voH.func($.write);
      }
      H.is = _;
    })(Gy7 || (JqH.MessageWriter = Gy7 = {}));
    class Yd6 {
      constructor() {
        (this.errorEmitter = new Xy7.Emitter()), (this.closeEmitter = new Xy7.Emitter());
      }
      dispose() {
        this.errorEmitter.dispose(), this.closeEmitter.dispose();
      }
      get onError() {
        return this.errorEmitter.event;
      }
      fireError(H, _, q) {
        this.errorEmitter.fire([this.asError(H), _, q]);
      }
      get onClose() {
        return this.closeEmitter.event;
      }
      fireClose() {
        this.closeEmitter.fire(void 0);
      }
      asError(H) {
        if (H instanceof Error) return H;
        else return Error(`Writer received error. Reason: ${voH.string(H.message) ? H.message : "unknown"}`);
      }
    }
    JqH.AbstractMessageWriter = Yd6;
    var wd6;
    (function (H) {
      function _(q) {
        if (q === void 0 || typeof q === "string")
          return { charset: q ?? "utf-8", contentTypeEncoder: (0, Py7.default)().applicationJson.encoder };
        else
          return {
            charset: q.charset ?? "utf-8",
            contentEncoder: q.contentEncoder,
            contentTypeEncoder: q.contentTypeEncoder ?? (0, Py7.default)().applicationJson.encoder,
          };
      }
      H.fromOptions = _;
    })(wd6 || (wd6 = {}));
    class Ry7 extends Yd6 {
      constructor(H, _) {
        super();
        (this.writable = H),
          (this.options = wd6.fromOptions(_)),
          (this.errorCount = 0),
          (this.writeSemaphore = new UD1.Semaphore(1)),
          this.writable.onError((q) => this.fireError(q)),
          this.writable.onClose(() => this.fireClose());
      }
      async write(H) {
        return this.writeSemaphore.lock(async () => {
          return this.options.contentTypeEncoder
            .encode(H, this.options)
            .then((q) => {
              if (this.options.contentEncoder !== void 0) return this.options.contentEncoder.encode(q);
              else return q;
            })
            .then(
              (q) => {
                let $ = [];
                return $.push(QD1, q.byteLength.toString(), Wy7), $.push(Wy7), this.doWrite(H, $, q);
              },
              (q) => {
                throw (this.fireError(q), q);
              },
            );
        });
      }
      async doWrite(H, _, q) {
        try {
          return await this.writable.write(_.join(""), "ascii"), this.writable.write(q);
        } catch ($) {
          return this.handleError($, H), Promise.reject($);
        }
      }
      handleError(H, _) {
        this.errorCount++, this.fireError(H, _, this.errorCount);
      }
      end() {
        this.writable.end();
      }
    }
    JqH.WriteableStreamMessageWriter = Ry7;
  });
