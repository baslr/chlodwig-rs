  var bQ6 = d((Tm) => {
    Object.defineProperty(Tm, "__esModule", { value: !0 });
    Tm.InterceptingCall = Tm.RequesterBuilder = Tm.ListenerBuilder = Tm.InterceptorConfigurationError = void 0;
    Tm.getInterceptingCall = ak1;
    var nk1 = GP(),
      yg7 = uAH(),
      Vg7 = mK(),
      Sg7 = Gu_();
    class zsH extends Error {
      constructor(H) {
        super(H);
        (this.name = "InterceptorConfigurationError"), Error.captureStackTrace(this, zsH);
      }
    }
    Tm.InterceptorConfigurationError = zsH;
    class Eg7 {
      constructor() {
        (this.metadata = void 0), (this.message = void 0), (this.status = void 0);
      }
      withOnReceiveMetadata(H) {
        return (this.metadata = H), this;
      }
      withOnReceiveMessage(H) {
        return (this.message = H), this;
      }
      withOnReceiveStatus(H) {
        return (this.status = H), this;
      }
      build() {
        return { onReceiveMetadata: this.metadata, onReceiveMessage: this.message, onReceiveStatus: this.status };
      }
    }
    Tm.ListenerBuilder = Eg7;
    class Cg7 {
      constructor() {
        (this.start = void 0), (this.message = void 0), (this.halfClose = void 0), (this.cancel = void 0);
      }
      withStart(H) {
        return (this.start = H), this;
      }
      withSendMessage(H) {
        return (this.message = H), this;
      }
      withHalfClose(H) {
        return (this.halfClose = H), this;
      }
      withCancel(H) {
        return (this.cancel = H), this;
      }
      build() {
        return { start: this.start, sendMessage: this.message, halfClose: this.halfClose, cancel: this.cancel };
      }
    }
    Tm.RequesterBuilder = Cg7;
    var EQ6 = {
        onReceiveMetadata: (H, _) => {
          _(H);
        },
        onReceiveMessage: (H, _) => {
          _(H);
        },
        onReceiveStatus: (H, _) => {
          _(H);
        },
      },
      TsH = {
        start: (H, _, q) => {
          q(H, _);
        },
        sendMessage: (H, _) => {
          _(H);
        },
        halfClose: (H) => {
          H();
        },
        cancel: (H) => {
          H();
        },
      };
    class bg7 {
      constructor(H, _) {
        var q, $, K, O;
        if (
          ((this.nextCall = H),
          (this.processingMetadata = !1),
          (this.pendingMessageContext = null),
          (this.processingMessage = !1),
          (this.pendingHalfClose = !1),
          _)
        )
          this.requester = {
            start: (q = _.start) !== null && q !== void 0 ? q : TsH.start,
            sendMessage: ($ = _.sendMessage) !== null && $ !== void 0 ? $ : TsH.sendMessage,
            halfClose: (K = _.halfClose) !== null && K !== void 0 ? K : TsH.halfClose,
            cancel: (O = _.cancel) !== null && O !== void 0 ? O : TsH.cancel,
          };
        else this.requester = TsH;
      }
      cancelWithStatus(H, _) {
        this.requester.cancel(() => {
          this.nextCall.cancelWithStatus(H, _);
        });
      }
      getPeer() {
        return this.nextCall.getPeer();
      }
      processPendingMessage() {
        if (this.pendingMessageContext)
          this.nextCall.sendMessageWithContext(this.pendingMessageContext, this.pendingMessage),
            (this.pendingMessageContext = null),
            (this.pendingMessage = null);
      }
      processPendingHalfClose() {
        if (this.pendingHalfClose) this.nextCall.halfClose();
      }
      start(H, _) {
        var q, $, K, O, T, z;
        let A = {
          onReceiveMetadata:
            ($ =
              (q = _ === null || _ === void 0 ? void 0 : _.onReceiveMetadata) === null || q === void 0
                ? void 0
                : q.bind(_)) !== null && $ !== void 0
              ? $
              : (f) => {},
          onReceiveMessage:
            (O =
              (K = _ === null || _ === void 0 ? void 0 : _.onReceiveMessage) === null || K === void 0
                ? void 0
                : K.bind(_)) !== null && O !== void 0
              ? O
              : (f) => {},
          onReceiveStatus:
            (z =
              (T = _ === null || _ === void 0 ? void 0 : _.onReceiveStatus) === null || T === void 0
                ? void 0
                : T.bind(_)) !== null && z !== void 0
              ? z
              : (f) => {},
        };
        (this.processingMetadata = !0),
          this.requester.start(H, A, (f, w) => {
            var Y, D, j;
            this.processingMetadata = !1;
            let M;
            if ((0, yg7.isInterceptingListener)(w)) M = w;
            else {
              let J = {
                onReceiveMetadata: (Y = w.onReceiveMetadata) !== null && Y !== void 0 ? Y : EQ6.onReceiveMetadata,
                onReceiveMessage: (D = w.onReceiveMessage) !== null && D !== void 0 ? D : EQ6.onReceiveMessage,
                onReceiveStatus: (j = w.onReceiveStatus) !== null && j !== void 0 ? j : EQ6.onReceiveStatus,
              };
              M = new yg7.InterceptingListenerImpl(J, A);
            }
            this.nextCall.start(f, M), this.processPendingMessage(), this.processPendingHalfClose();
          });
      }
      sendMessageWithContext(H, _) {
        (this.processingMessage = !0),
          this.requester.sendMessage(_, (q) => {
            if (((this.processingMessage = !1), this.processingMetadata))
              (this.pendingMessageContext = H), (this.pendingMessage = _);
            else this.nextCall.sendMessageWithContext(H, q), this.processPendingHalfClose();
          });
      }
      sendMessage(H) {
        this.sendMessageWithContext({}, H);
      }
      startRead() {
        this.nextCall.startRead();
      }
      halfClose() {
        this.requester.halfClose(() => {
          if (this.processingMetadata || this.processingMessage) this.pendingHalfClose = !0;
          else this.nextCall.halfClose();
        });
      }
      getAuthContext() {
        return this.nextCall.getAuthContext();
      }
    }
    Tm.InterceptingCall = bg7;
    function rk1(H, _, q) {
      var $, K;
      let O = ($ = q.deadline) !== null && $ !== void 0 ? $ : 1 / 0,
        T = q.host,
        z = (K = q.parent) !== null && K !== void 0 ? K : null,
        A = q.propagate_flags,
        f = q.credentials,
        w = H.createCall(_, O, T, z, A);
      if (f) w.setCredentials(f);
      return w;
    }
    class CQ6 {
      constructor(H, _) {
        (this.call = H), (this.methodDefinition = _);
      }
      cancelWithStatus(H, _) {
        this.call.cancelWithStatus(H, _);
      }
      getPeer() {
        return this.call.getPeer();
      }
      sendMessageWithContext(H, _) {
        let q;
        try {
          q = this.methodDefinition.requestSerialize(_);
        } catch ($) {
          this.call.cancelWithStatus(
            Vg7.Status.INTERNAL,
            `Request message serialization failure: ${(0, Sg7.getErrorMessage)($)}`,
          );
          return;
        }
        this.call.sendMessageWithContext(H, q);
      }
      sendMessage(H) {
        this.sendMessageWithContext({}, H);
      }
      start(H, _) {
        let q = null;
        this.call.start(H, {
          onReceiveMetadata: ($) => {
            var K;
            (K = _ === null || _ === void 0 ? void 0 : _.onReceiveMetadata) === null || K === void 0 || K.call(_, $);
          },
          onReceiveMessage: ($) => {
            var K;
            let O;
            try {
              O = this.methodDefinition.responseDeserialize($);
            } catch (T) {
              (q = {
                code: Vg7.Status.INTERNAL,
                details: `Response message parsing error: ${(0, Sg7.getErrorMessage)(T)}`,
                metadata: new nk1.Metadata(),
              }),
                this.call.cancelWithStatus(q.code, q.details);
              return;
            }
            (K = _ === null || _ === void 0 ? void 0 : _.onReceiveMessage) === null || K === void 0 || K.call(_, O);
          },
          onReceiveStatus: ($) => {
            var K, O;
            if (q)
              (K = _ === null || _ === void 0 ? void 0 : _.onReceiveStatus) === null || K === void 0 || K.call(_, q);
            else (O = _ === null || _ === void 0 ? void 0 : _.onReceiveStatus) === null || O === void 0 || O.call(_, $);
          },
        });
      }
      startRead() {
        this.call.startRead();
      }
      halfClose() {
        this.call.halfClose();
      }
      getAuthContext() {
        return this.call.getAuthContext();
      }
    }
    class Ig7 extends CQ6 {
      constructor(H, _) {
        super(H, _);
      }
      start(H, _) {
        var q, $;
        let K = !1,
          O = {
            onReceiveMetadata:
              ($ =
                (q = _ === null || _ === void 0 ? void 0 : _.onReceiveMetadata) === null || q === void 0
                  ? void 0
                  : q.bind(_)) !== null && $ !== void 0
                ? $
                : (T) => {},
            onReceiveMessage: (T) => {
              var z;
              (K = !0),
                (z = _ === null || _ === void 0 ? void 0 : _.onReceiveMessage) === null || z === void 0 || z.call(_, T);
            },
            onReceiveStatus: (T) => {
              var z, A;
              if (!K)
                (z = _ === null || _ === void 0 ? void 0 : _.onReceiveMessage) === null ||
                  z === void 0 ||
                  z.call(_, null);
              (A = _ === null || _ === void 0 ? void 0 : _.onReceiveStatus) === null || A === void 0 || A.call(_, T);
            },
          };
        super.start(H, O), this.call.startRead();
      }
    }
    class ug7 extends CQ6 {}
    function ok1(H, _, q) {
      let $ = rk1(H, q.path, _);
      if (q.responseStream) return new ug7($, q);
      else return new Ig7($, q);
    }
    function ak1(H, _, q, $) {
      if (H.clientInterceptors.length > 0 && H.clientInterceptorProviders.length > 0)
        throw new zsH(
          "Both interceptors and interceptor_providers were passed as options to the client constructor. Only one of these is allowed.",
        );
      if (H.callInterceptors.length > 0 && H.callInterceptorProviders.length > 0)
        throw new zsH(
          "Both interceptors and interceptor_providers were passed as call options. Only one of these is allowed.",
        );
      let K = [];
      if (H.callInterceptors.length > 0 || H.callInterceptorProviders.length > 0)
        K = []
          .concat(
            H.callInterceptors,
            H.callInterceptorProviders.map((z) => z(_)),
          )
          .filter((z) => z);
      else
        K = []
          .concat(
            H.clientInterceptors,
            H.clientInterceptorProviders.map((z) => z(_)),
          )
          .filter((z) => z);
      let O = Object.assign({}, q, { method_definition: _ });
      return K.reduceRight(
        (z, A) => {
          return (f) => A(f, z);
        },
        (z) => ok1($, z, _),
      )(O);
    }
  });
