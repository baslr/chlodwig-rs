  var Jy7 = d((MqH) => {
    Object.defineProperty(MqH, "__esModule", { value: !0 });
    MqH.ReadableStreamMessageReader = MqH.AbstractMessageReader = MqH.MessageReader = void 0;
    var zd6 = jqH(),
      hkH = ZkH(),
      Td6 = kkH(),
      FD1 = Od6(),
      jy7;
    (function (H) {
      function _(q) {
        let $ = q;
        return (
          $ &&
          hkH.func($.listen) &&
          hkH.func($.dispose) &&
          hkH.func($.onError) &&
          hkH.func($.onClose) &&
          hkH.func($.onPartialMessage)
        );
      }
      H.is = _;
    })(jy7 || (MqH.MessageReader = jy7 = {}));
    class fd6 {
      constructor() {
        (this.errorEmitter = new Td6.Emitter()),
          (this.closeEmitter = new Td6.Emitter()),
          (this.partialMessageEmitter = new Td6.Emitter());
      }
      dispose() {
        this.errorEmitter.dispose(), this.closeEmitter.dispose();
      }
      get onError() {
        return this.errorEmitter.event;
      }
      fireError(H) {
        this.errorEmitter.fire(this.asError(H));
      }
      get onClose() {
        return this.closeEmitter.event;
      }
      fireClose() {
        this.closeEmitter.fire(void 0);
      }
      get onPartialMessage() {
        return this.partialMessageEmitter.event;
      }
      firePartialMessage(H) {
        this.partialMessageEmitter.fire(H);
      }
      asError(H) {
        if (H instanceof Error) return H;
        else return Error(`Reader received error. Reason: ${hkH.string(H.message) ? H.message : "unknown"}`);
      }
    }
    MqH.AbstractMessageReader = fd6;
    var Ad6;
    (function (H) {
      function _(q) {
        let $,
          K,
          O,
          T = new Map(),
          z,
          A = new Map();
        if (q === void 0 || typeof q === "string") $ = q ?? "utf-8";
        else {
          if ((($ = q.charset ?? "utf-8"), q.contentDecoder !== void 0)) (O = q.contentDecoder), T.set(O.name, O);
          if (q.contentDecoders !== void 0) for (let f of q.contentDecoders) T.set(f.name, f);
          if (q.contentTypeDecoder !== void 0) (z = q.contentTypeDecoder), A.set(z.name, z);
          if (q.contentTypeDecoders !== void 0) for (let f of q.contentTypeDecoders) A.set(f.name, f);
        }
        if (z === void 0) (z = (0, zd6.default)().applicationJson.decoder), A.set(z.name, z);
        return { charset: $, contentDecoder: O, contentDecoders: T, contentTypeDecoder: z, contentTypeDecoders: A };
      }
      H.fromOptions = _;
    })(Ad6 || (Ad6 = {}));
    class My7 extends fd6 {
      constructor(H, _) {
        super();
        (this.readable = H),
          (this.options = Ad6.fromOptions(_)),
          (this.buffer = (0, zd6.default)().messageBuffer.create(this.options.charset)),
          (this._partialMessageTimeout = 1e4),
          (this.nextMessageLength = -1),
          (this.messageToken = 0),
          (this.readSemaphore = new FD1.Semaphore(1));
      }
      set partialMessageTimeout(H) {
        this._partialMessageTimeout = H;
      }
      get partialMessageTimeout() {
        return this._partialMessageTimeout;
      }
      listen(H) {
        (this.nextMessageLength = -1),
          (this.messageToken = 0),
          (this.partialMessageTimer = void 0),
          (this.callback = H);
        let _ = this.readable.onData((q) => {
          this.onData(q);
        });
        return this.readable.onError((q) => this.fireError(q)), this.readable.onClose(() => this.fireClose()), _;
      }
      onData(H) {
        try {
          this.buffer.append(H);
          while (!0) {
            if (this.nextMessageLength === -1) {
              let q = this.buffer.tryReadHeaders(!0);
              if (!q) return;
              let $ = q.get("content-length");
              if (!$) {
                this.fireError(
                  Error(`Header must provide a Content-Length property.
${JSON.stringify(Object.fromEntries(q))}`),
                );
                return;
              }
              let K = parseInt($);
              if (isNaN(K)) {
                this.fireError(Error(`Content-Length value must be a number. Got ${$}`));
                return;
              }
              this.nextMessageLength = K;
            }
            let _ = this.buffer.tryReadBody(this.nextMessageLength);
            if (_ === void 0) {
              this.setPartialMessageTimer();
              return;
            }
            this.clearPartialMessageTimer(),
              (this.nextMessageLength = -1),
              this.readSemaphore
                .lock(async () => {
                  let q = this.options.contentDecoder !== void 0 ? await this.options.contentDecoder.decode(_) : _,
                    $ = await this.options.contentTypeDecoder.decode(q, this.options);
                  this.callback($);
                })
                .catch((q) => {
                  this.fireError(q);
                });
          }
        } catch (_) {
          this.fireError(_);
        }
      }
      clearPartialMessageTimer() {
        if (this.partialMessageTimer) this.partialMessageTimer.dispose(), (this.partialMessageTimer = void 0);
      }
      setPartialMessageTimer() {
        if ((this.clearPartialMessageTimer(), this._partialMessageTimeout <= 0)) return;
        this.partialMessageTimer = (0, zd6.default)().timer.setTimeout(
          (H, _) => {
            if (((this.partialMessageTimer = void 0), H === this.messageToken))
              this.firePartialMessage({ messageToken: H, waitingTime: _ }), this.setPartialMessageTimer();
          },
          this._partialMessageTimeout,
          this.messageToken,
          this._partialMessageTimeout,
        );
      }
    }
    MqH.ReadableStreamMessageReader = My7;
  });
