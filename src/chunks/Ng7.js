  var Ng7 = d((Om) => {
    Object.defineProperty(Om, "__esModule", { value: !0 });
    Om.ClientDuplexStreamImpl =
      Om.ClientWritableStreamImpl =
      Om.ClientReadableStreamImpl =
      Om.ClientUnaryCallImpl =
        void 0;
    Om.callErrorFromStatus = Fk1;
    var ck1 = require("events"),
      SQ6 = require("stream"),
      OsH = mK();
    function Fk1(H, _) {
      let q = `${H.code} ${OsH.Status[H.code]}: ${H.details}`,
        K = `${Error(q).stack}
for call at
${_}`;
      return Object.assign(Error(q), H, { stack: K });
    }
    class Zg7 extends ck1.EventEmitter {
      constructor() {
        super();
      }
      cancel() {
        var H;
        (H = this.call) === null || H === void 0 || H.cancelWithStatus(OsH.Status.CANCELLED, "Cancelled on client");
      }
      getPeer() {
        var H, _;
        return (_ = (H = this.call) === null || H === void 0 ? void 0 : H.getPeer()) !== null && _ !== void 0
          ? _
          : "unknown";
      }
      getAuthContext() {
        var H, _;
        return (_ = (H = this.call) === null || H === void 0 ? void 0 : H.getAuthContext()) !== null && _ !== void 0
          ? _
          : null;
      }
    }
    Om.ClientUnaryCallImpl = Zg7;
    class Lg7 extends SQ6.Readable {
      constructor(H) {
        super({ objectMode: !0 });
        this.deserialize = H;
      }
      cancel() {
        var H;
        (H = this.call) === null || H === void 0 || H.cancelWithStatus(OsH.Status.CANCELLED, "Cancelled on client");
      }
      getPeer() {
        var H, _;
        return (_ = (H = this.call) === null || H === void 0 ? void 0 : H.getPeer()) !== null && _ !== void 0
          ? _
          : "unknown";
      }
      getAuthContext() {
        var H, _;
        return (_ = (H = this.call) === null || H === void 0 ? void 0 : H.getAuthContext()) !== null && _ !== void 0
          ? _
          : null;
      }
      _read(H) {
        var _;
        (_ = this.call) === null || _ === void 0 || _.startRead();
      }
    }
    Om.ClientReadableStreamImpl = Lg7;
    class kg7 extends SQ6.Writable {
      constructor(H) {
        super({ objectMode: !0 });
        this.serialize = H;
      }
      cancel() {
        var H;
        (H = this.call) === null || H === void 0 || H.cancelWithStatus(OsH.Status.CANCELLED, "Cancelled on client");
      }
      getPeer() {
        var H, _;
        return (_ = (H = this.call) === null || H === void 0 ? void 0 : H.getPeer()) !== null && _ !== void 0
          ? _
          : "unknown";
      }
      getAuthContext() {
        var H, _;
        return (_ = (H = this.call) === null || H === void 0 ? void 0 : H.getAuthContext()) !== null && _ !== void 0
          ? _
          : null;
      }
      _write(H, _, q) {
        var $;
        let K = { callback: q },
          O = Number(_);
        if (!Number.isNaN(O)) K.flags = O;
        ($ = this.call) === null || $ === void 0 || $.sendMessageWithContext(K, H);
      }
      _final(H) {
        var _;
        (_ = this.call) === null || _ === void 0 || _.halfClose(), H();
      }
    }
    Om.ClientWritableStreamImpl = kg7;
    class vg7 extends SQ6.Duplex {
      constructor(H, _) {
        super({ objectMode: !0 });
        (this.serialize = H), (this.deserialize = _);
      }
      cancel() {
        var H;
        (H = this.call) === null || H === void 0 || H.cancelWithStatus(OsH.Status.CANCELLED, "Cancelled on client");
      }
      getPeer() {
        var H, _;
        return (_ = (H = this.call) === null || H === void 0 ? void 0 : H.getPeer()) !== null && _ !== void 0
          ? _
          : "unknown";
      }
      getAuthContext() {
        var H, _;
        return (_ = (H = this.call) === null || H === void 0 ? void 0 : H.getAuthContext()) !== null && _ !== void 0
          ? _
          : null;
      }
      _read(H) {
        var _;
        (_ = this.call) === null || _ === void 0 || _.startRead();
      }
      _write(H, _, q) {
        var $;
        let K = { callback: q },
          O = Number(_);
        if (!Number.isNaN(O)) K.flags = O;
        ($ = this.call) === null || $ === void 0 || $.sendMessageWithContext(K, H);
      }
      _final(H) {
        var _;
        (_ = this.call) === null || _ === void 0 || _.halfClose(), H();
      }
    }
    Om.ClientDuplexStreamImpl = vg7;
  });
