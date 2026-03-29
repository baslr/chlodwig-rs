  var dF7 = d((Ym) => {
    Object.defineProperty(Ym, "__esModule", { value: !0 });
    Ym.ServerDuplexStreamImpl =
      Ym.ServerWritableStreamImpl =
      Ym.ServerReadableStreamImpl =
      Ym.ServerUnaryCallImpl =
        void 0;
    Ym.serverErrorToStatus = Ti6;
    var _S1 = require("events"),
      Ki6 = require("stream"),
      Oi6 = mK(),
      xF7 = GP();
    function Ti6(H, _) {
      var q;
      let $ = {
        code: Oi6.Status.UNKNOWN,
        details: "message" in H ? H.message : "Unknown Error",
        metadata: (q = _ !== null && _ !== void 0 ? _ : H.metadata) !== null && q !== void 0 ? q : null,
      };
      if ("code" in H && typeof H.code === "number" && Number.isInteger(H.code)) {
        if ((($.code = H.code), "details" in H && typeof H.details === "string")) $.details = H.details;
      }
      return $;
    }
    class mF7 extends _S1.EventEmitter {
      constructor(H, _, q, $) {
        super();
        (this.path = H), (this.call = _), (this.metadata = q), (this.request = $), (this.cancelled = !1);
      }
      getPeer() {
        return this.call.getPeer();
      }
      sendMetadata(H) {
        this.call.sendMetadata(H);
      }
      getDeadline() {
        return this.call.getDeadline();
      }
      getPath() {
        return this.path;
      }
      getHost() {
        return this.call.getHost();
      }
      getAuthContext() {
        return this.call.getAuthContext();
      }
      getMetricsRecorder() {
        return this.call.getMetricsRecorder();
      }
    }
    Ym.ServerUnaryCallImpl = mF7;
    class pF7 extends Ki6.Readable {
      constructor(H, _, q) {
        super({ objectMode: !0 });
        (this.path = H), (this.call = _), (this.metadata = q), (this.cancelled = !1);
      }
      _read(H) {
        this.call.startRead();
      }
      getPeer() {
        return this.call.getPeer();
      }
      sendMetadata(H) {
        this.call.sendMetadata(H);
      }
      getDeadline() {
        return this.call.getDeadline();
      }
      getPath() {
        return this.path;
      }
      getHost() {
        return this.call.getHost();
      }
      getAuthContext() {
        return this.call.getAuthContext();
      }
      getMetricsRecorder() {
        return this.call.getMetricsRecorder();
      }
    }
    Ym.ServerReadableStreamImpl = pF7;
    class BF7 extends Ki6.Writable {
      constructor(H, _, q, $) {
        super({ objectMode: !0 });
        (this.path = H),
          (this.call = _),
          (this.metadata = q),
          (this.request = $),
          (this.pendingStatus = { code: Oi6.Status.OK, details: "OK" }),
          (this.cancelled = !1),
          (this.trailingMetadata = new xF7.Metadata()),
          this.on("error", (K) => {
            (this.pendingStatus = Ti6(K)), this.end();
          });
      }
      getPeer() {
        return this.call.getPeer();
      }
      sendMetadata(H) {
        this.call.sendMetadata(H);
      }
      getDeadline() {
        return this.call.getDeadline();
      }
      getPath() {
        return this.path;
      }
      getHost() {
        return this.call.getHost();
      }
      getAuthContext() {
        return this.call.getAuthContext();
      }
      getMetricsRecorder() {
        return this.call.getMetricsRecorder();
      }
      _write(H, _, q) {
        this.call.sendMessage(H, q);
      }
      _final(H) {
        var _;
        H(null),
          this.call.sendStatus(
            Object.assign(Object.assign({}, this.pendingStatus), {
              metadata: (_ = this.pendingStatus.metadata) !== null && _ !== void 0 ? _ : this.trailingMetadata,
            }),
          );
      }
      end(H) {
        if (H) this.trailingMetadata = H;
        return super.end();
      }
    }
    Ym.ServerWritableStreamImpl = BF7;
    class gF7 extends Ki6.Duplex {
      constructor(H, _, q) {
        super({ objectMode: !0 });
        (this.path = H),
          (this.call = _),
          (this.metadata = q),
          (this.pendingStatus = { code: Oi6.Status.OK, details: "OK" }),
          (this.cancelled = !1),
          (this.trailingMetadata = new xF7.Metadata()),
          this.on("error", ($) => {
            (this.pendingStatus = Ti6($)), this.end();
          });
      }
      getPeer() {
        return this.call.getPeer();
      }
      sendMetadata(H) {
        this.call.sendMetadata(H);
      }
      getDeadline() {
        return this.call.getDeadline();
      }
      getPath() {
        return this.path;
      }
      getHost() {
        return this.call.getHost();
      }
      getAuthContext() {
        return this.call.getAuthContext();
      }
      getMetricsRecorder() {
        return this.call.getMetricsRecorder();
      }
      _read(H) {
        this.call.startRead();
      }
      _write(H, _, q) {
        this.call.sendMessage(H, q);
      }
      _final(H) {
        var _;
        H(null),
          this.call.sendStatus(
            Object.assign(Object.assign({}, this.pendingStatus), {
              metadata: (_ = this.pendingStatus.metadata) !== null && _ !== void 0 ? _ : this.trailingMetadata,
            }),
          );
      }
      end(H) {
        if (H) this.trailingMetadata = H;
        return super.end();
      }
    }
    Ym.ServerDuplexStreamImpl = gF7;
  });
