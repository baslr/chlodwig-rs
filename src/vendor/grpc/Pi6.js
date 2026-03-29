  var Pi6 = d((FC) => {
    Object.defineProperty(FC, "__esModule", { value: !0 });
    FC.BaseServerInterceptingCall = FC.ServerInterceptingCall = FC.ResponderBuilder = FC.ServerListenerBuilder = void 0;
    FC.isInterceptingServerListener = LS1;
    FC.getServerInterceptingCall = yS1;
    var ax_ = GP(),
      Qv = mK(),
      xNH = require("http2"),
      sF7 = Gu_(),
      tF7 = require("zlib"),
      RS1 = rl6(),
      $U7 = DA(),
      ZS1 = require("tls"),
      eF7 = nx_(),
      KU7 = "server_call";
    function nAH(H) {
      $U7.trace(Qv.LogVerbosity.DEBUG, KU7, H);
    }
    class OU7 {
      constructor() {
        (this.metadata = void 0), (this.message = void 0), (this.halfClose = void 0), (this.cancel = void 0);
      }
      withOnReceiveMetadata(H) {
        return (this.metadata = H), this;
      }
      withOnReceiveMessage(H) {
        return (this.message = H), this;
      }
      withOnReceiveHalfClose(H) {
        return (this.halfClose = H), this;
      }
      withOnCancel(H) {
        return (this.cancel = H), this;
      }
      build() {
        return {
          onReceiveMetadata: this.metadata,
          onReceiveMessage: this.message,
          onReceiveHalfClose: this.halfClose,
          onCancel: this.cancel,
        };
      }
    }
    FC.ServerListenerBuilder = OU7;
    function LS1(H) {
      return H.onReceiveMetadata !== void 0 && H.onReceiveMetadata.length === 1;
    }
    class TU7 {
      constructor(H, _) {
        (this.listener = H),
          (this.nextListener = _),
          (this.cancelled = !1),
          (this.processingMetadata = !1),
          (this.hasPendingMessage = !1),
          (this.pendingMessage = null),
          (this.processingMessage = !1),
          (this.hasPendingHalfClose = !1);
      }
      processPendingMessage() {
        if (this.hasPendingMessage)
          this.nextListener.onReceiveMessage(this.pendingMessage),
            (this.pendingMessage = null),
            (this.hasPendingMessage = !1);
      }
      processPendingHalfClose() {
        if (this.hasPendingHalfClose) this.nextListener.onReceiveHalfClose(), (this.hasPendingHalfClose = !1);
      }
      onReceiveMetadata(H) {
        if (this.cancelled) return;
        (this.processingMetadata = !0),
          this.listener.onReceiveMetadata(H, (_) => {
            if (((this.processingMetadata = !1), this.cancelled)) return;
            this.nextListener.onReceiveMetadata(_), this.processPendingMessage(), this.processPendingHalfClose();
          });
      }
      onReceiveMessage(H) {
        if (this.cancelled) return;
        (this.processingMessage = !0),
          this.listener.onReceiveMessage(H, (_) => {
            if (((this.processingMessage = !1), this.cancelled)) return;
            if (this.processingMetadata) (this.pendingMessage = _), (this.hasPendingMessage = !0);
            else this.nextListener.onReceiveMessage(_), this.processPendingHalfClose();
          });
      }
      onReceiveHalfClose() {
        if (this.cancelled) return;
        this.listener.onReceiveHalfClose(() => {
          if (this.cancelled) return;
          if (this.processingMetadata || this.processingMessage) this.hasPendingHalfClose = !0;
          else this.nextListener.onReceiveHalfClose();
        });
      }
      onCancel() {
        (this.cancelled = !0), this.listener.onCancel(), this.nextListener.onCancel();
      }
    }
    class zU7 {
      constructor() {
        (this.start = void 0), (this.metadata = void 0), (this.message = void 0), (this.status = void 0);
      }
      withStart(H) {
        return (this.start = H), this;
      }
      withSendMetadata(H) {
        return (this.metadata = H), this;
      }
      withSendMessage(H) {
        return (this.message = H), this;
      }
      withSendStatus(H) {
        return (this.status = H), this;
      }
      build() {
        return { start: this.start, sendMetadata: this.metadata, sendMessage: this.message, sendStatus: this.status };
      }
    }
    FC.ResponderBuilder = zU7;
    var rx_ = {
        onReceiveMetadata: (H, _) => {
          _(H);
        },
        onReceiveMessage: (H, _) => {
          _(H);
        },
        onReceiveHalfClose: (H) => {
          H();
        },
        onCancel: () => {},
      },
      ox_ = {
        start: (H) => {
          H();
        },
        sendMetadata: (H, _) => {
          _(H);
        },
        sendMessage: (H, _) => {
          _(H);
        },
        sendStatus: (H, _) => {
          _(H);
        },
      };
    class AU7 {
      constructor(H, _) {
        var q, $, K, O;
        (this.nextCall = H),
          (this.processingMetadata = !1),
          (this.sentMetadata = !1),
          (this.processingMessage = !1),
          (this.pendingMessage = null),
          (this.pendingMessageCallback = null),
          (this.pendingStatus = null),
          (this.responder = {
            start: (q = _ === null || _ === void 0 ? void 0 : _.start) !== null && q !== void 0 ? q : ox_.start,
            sendMetadata:
              ($ = _ === null || _ === void 0 ? void 0 : _.sendMetadata) !== null && $ !== void 0
                ? $
                : ox_.sendMetadata,
            sendMessage:
              (K = _ === null || _ === void 0 ? void 0 : _.sendMessage) !== null && K !== void 0 ? K : ox_.sendMessage,
            sendStatus:
              (O = _ === null || _ === void 0 ? void 0 : _.sendStatus) !== null && O !== void 0 ? O : ox_.sendStatus,
          });
      }
      processPendingMessage() {
        if (this.pendingMessageCallback)
          this.nextCall.sendMessage(this.pendingMessage, this.pendingMessageCallback),
            (this.pendingMessage = null),
            (this.pendingMessageCallback = null);
      }
      processPendingStatus() {
        if (this.pendingStatus) this.nextCall.sendStatus(this.pendingStatus), (this.pendingStatus = null);
      }
      start(H) {
        this.responder.start((_) => {
          var q, $, K, O;
          let T = {
              onReceiveMetadata:
                (q = _ === null || _ === void 0 ? void 0 : _.onReceiveMetadata) !== null && q !== void 0
                  ? q
                  : rx_.onReceiveMetadata,
              onReceiveMessage:
                ($ = _ === null || _ === void 0 ? void 0 : _.onReceiveMessage) !== null && $ !== void 0
                  ? $
                  : rx_.onReceiveMessage,
              onReceiveHalfClose:
                (K = _ === null || _ === void 0 ? void 0 : _.onReceiveHalfClose) !== null && K !== void 0
                  ? K
                  : rx_.onReceiveHalfClose,
              onCancel:
                (O = _ === null || _ === void 0 ? void 0 : _.onCancel) !== null && O !== void 0 ? O : rx_.onCancel,
            },
            z = new TU7(T, H);
          this.nextCall.start(z);
        });
      }
      sendMetadata(H) {
        (this.processingMetadata = !0),
          (this.sentMetadata = !0),
          this.responder.sendMetadata(H, (_) => {
            (this.processingMetadata = !1),
              this.nextCall.sendMetadata(_),
              this.processPendingMessage(),
              this.processPendingStatus();
          });
      }
      sendMessage(H, _) {
        if (((this.processingMessage = !0), !this.sentMetadata)) this.sendMetadata(new ax_.Metadata());
        this.responder.sendMessage(H, (q) => {
          if (((this.processingMessage = !1), this.processingMetadata))
            (this.pendingMessage = q), (this.pendingMessageCallback = _);
          else this.nextCall.sendMessage(q, _);
        });
      }
      sendStatus(H) {
        this.responder.sendStatus(H, (_) => {
          if (this.processingMetadata || this.processingMessage) this.pendingStatus = _;
          else this.nextCall.sendStatus(_);
        });
      }
      startRead() {
        this.nextCall.startRead();
      }
      getPeer() {
        return this.nextCall.getPeer();
      }
      getDeadline() {
        return this.nextCall.getDeadline();
      }
      getHost() {
        return this.nextCall.getHost();
      }
      getAuthContext() {
        return this.nextCall.getAuthContext();
      }
      getConnectionInfo() {
        return this.nextCall.getConnectionInfo();
      }
      getMetricsRecorder() {
        return this.nextCall.getMetricsRecorder();
      }
    }
    FC.ServerInterceptingCall = AU7;
    var fU7 = "grpc-accept-encoding",
      Mi6 = "grpc-encoding",
      HU7 = "grpc-message",
      _U7 = "grpc-status",
      ji6 = "grpc-timeout",
      kS1 = /(\d{1,8})\s*([HMSmun])/,
      vS1 = { H: 3600000, M: 60000, S: 1000, m: 1, u: 0.001, n: 0.000001 },
      NS1 = { [fU7]: "identity,deflate,gzip", [Mi6]: "identity" },
      qU7 = {
        [xNH.constants.HTTP2_HEADER_STATUS]: xNH.constants.HTTP_STATUS_OK,
        [xNH.constants.HTTP2_HEADER_CONTENT_TYPE]: "application/grpc+proto",
      },
      hS1 = { waitForTrailers: !0 };
    class Ji6 {
      constructor(H, _, q, $, K) {
        var O, T;
        if (
          ((this.stream = H),
          (this.callEventTracker = q),
          (this.handler = $),
          (this.listener = null),
          (this.deadlineTimer = null),
          (this.deadline = 1 / 0),
          (this.maxSendMessageSize = Qv.DEFAULT_MAX_SEND_MESSAGE_LENGTH),
          (this.maxReceiveMessageSize = Qv.DEFAULT_MAX_RECEIVE_MESSAGE_LENGTH),
          (this.cancelled = !1),
          (this.metadataSent = !1),
          (this.wantTrailers = !1),
          (this.cancelNotified = !1),
          (this.incomingEncoding = "identity"),
          (this.readQueue = []),
          (this.isReadPending = !1),
          (this.receivedHalfClose = !1),
          (this.streamEnded = !1),
          (this.metricsRecorder = new eF7.PerRequestMetricRecorder()),
          this.stream.once("error", (Y) => {}),
          this.stream.once("close", () => {
            var Y;
            if (
              (nAH(
                "Request to method " +
                  ((Y = this.handler) === null || Y === void 0 ? void 0 : Y.path) +
                  " stream closed with rstCode " +
                  this.stream.rstCode,
              ),
              this.callEventTracker && !this.streamEnded)
            )
              (this.streamEnded = !0),
                this.callEventTracker.onStreamEnd(!1),
                this.callEventTracker.onCallEnd({
                  code: Qv.Status.CANCELLED,
                  details: "Stream closed before sending status",
                  metadata: null,
                });
            this.notifyOnCancel();
          }),
          this.stream.on("data", (Y) => {
            this.handleDataFrame(Y);
          }),
          this.stream.pause(),
          this.stream.on("end", () => {
            this.handleEndEvent();
          }),
          "grpc.max_send_message_length" in K)
        )
          this.maxSendMessageSize = K["grpc.max_send_message_length"];
        if ("grpc.max_receive_message_length" in K) this.maxReceiveMessageSize = K["grpc.max_receive_message_length"];
        (this.host = (O = _[":authority"]) !== null && O !== void 0 ? O : _.host),
          (this.decoder = new RS1.StreamDecoder(this.maxReceiveMessageSize));
        let z = ax_.Metadata.fromHttp2Headers(_);
        if ($U7.isTracerEnabled(KU7))
          nAH("Request to " + this.handler.path + " received headers " + JSON.stringify(z.toJSON()));
        let A = z.get(ji6);
        if (A.length > 0) this.handleTimeoutHeader(A[0]);
        let f = z.get(Mi6);
        if (f.length > 0) this.incomingEncoding = f[0];
        z.remove(ji6),
          z.remove(Mi6),
          z.remove(fU7),
          z.remove(xNH.constants.HTTP2_HEADER_ACCEPT_ENCODING),
          z.remove(xNH.constants.HTTP2_HEADER_TE),
          z.remove(xNH.constants.HTTP2_HEADER_CONTENT_TYPE),
          (this.metadata = z);
        let w = (T = H.session) === null || T === void 0 ? void 0 : T.socket;
        (this.connectionInfo = {
          localAddress: w === null || w === void 0 ? void 0 : w.localAddress,
          localPort: w === null || w === void 0 ? void 0 : w.localPort,
          remoteAddress: w === null || w === void 0 ? void 0 : w.remoteAddress,
          remotePort: w === null || w === void 0 ? void 0 : w.remotePort,
        }),
          (this.shouldSendMetrics = !!K["grpc.server_call_metric_recording"]);
      }
      handleTimeoutHeader(H) {
        let _ = H.toString().match(kS1);
        if (_ === null) {
          let K = { code: Qv.Status.INTERNAL, details: `Invalid ${ji6} value "${H}"`, metadata: null };
          process.nextTick(() => {
            this.sendStatus(K);
          });
          return;
        }
        let q = (+_[1] * vS1[_[2]]) | 0,
          $ = new Date();
        (this.deadline = $.setMilliseconds($.getMilliseconds() + q)),
          (this.deadlineTimer = setTimeout(() => {
            let K = { code: Qv.Status.DEADLINE_EXCEEDED, details: "Deadline exceeded", metadata: null };
            this.sendStatus(K);
          }, q));
      }
      checkCancelled() {
        if (!this.cancelled && (this.stream.destroyed || this.stream.closed))
          this.notifyOnCancel(), (this.cancelled = !0);
        return this.cancelled;
      }
      notifyOnCancel() {
        if (this.cancelNotified) return;
        if (
          ((this.cancelNotified = !0),
          (this.cancelled = !0),
          process.nextTick(() => {
            var H;
            (H = this.listener) === null || H === void 0 || H.onCancel();
          }),
          this.deadlineTimer)
        )
          clearTimeout(this.deadlineTimer);
        this.stream.resume();
      }
      maybeSendMetadata() {
        if (!this.metadataSent) this.sendMetadata(new ax_.Metadata());
      }
      serializeMessage(H) {
        let _ = this.handler.serialize(H),
          q = _.byteLength,
          $ = Buffer.allocUnsafe(q + 5);
        return $.writeUInt8(0, 0), $.writeUInt32BE(q, 1), _.copy($, 5), $;
      }
      decompressMessage(H, _) {
        let q = H.subarray(5);
        if (_ === "identity") return q;
        else if (_ === "deflate" || _ === "gzip") {
          let $;
          if (_ === "deflate") $ = tF7.createInflate();
          else $ = tF7.createGunzip();
          return new Promise((K, O) => {
            let T = 0,
              z = [];
            $.on("data", (A) => {
              if ((z.push(A), (T += A.byteLength), this.maxReceiveMessageSize !== -1 && T > this.maxReceiveMessageSize))
                $.destroy(),
                  O({
                    code: Qv.Status.RESOURCE_EXHAUSTED,
                    details: `Received message that decompresses to a size larger than ${this.maxReceiveMessageSize}`,
                  });
            }),
              $.on("end", () => {
                K(Buffer.concat(z));
              }),
              $.write(q),
              $.end();
          });
        } else
          return Promise.reject({
            code: Qv.Status.UNIMPLEMENTED,
            details: `Received message compressed with unsupported encoding "${_}"`,
          });
      }
      async decompressAndMaybePush(H) {
        if (H.type !== "COMPRESSED") throw Error(`Invalid queue entry type: ${H.type}`);
        let q = H.compressedMessage.readUInt8(0) === 1 ? this.incomingEncoding : "identity",
          $;
        try {
          $ = await this.decompressMessage(H.compressedMessage, q);
        } catch (K) {
          this.sendStatus(K);
          return;
        }
        try {
          H.parsedMessage = this.handler.deserialize($);
        } catch (K) {
          this.sendStatus({ code: Qv.Status.INTERNAL, details: `Error deserializing request: ${K.message}` });
          return;
        }
        (H.type = "READABLE"), this.maybePushNextMessage();
      }
      maybePushNextMessage() {
        if (
          this.listener &&
          this.isReadPending &&
          this.readQueue.length > 0 &&
          this.readQueue[0].type !== "COMPRESSED"
        ) {
          this.isReadPending = !1;
          let H = this.readQueue.shift();
          if (H.type === "READABLE") this.listener.onReceiveMessage(H.parsedMessage);
          else this.listener.onReceiveHalfClose();
        }
      }
      handleDataFrame(H) {
        var _;
        if (this.checkCancelled()) return;
        nAH("Request to " + this.handler.path + " received data frame of size " + H.length);
        let q;
        try {
          q = this.decoder.write(H);
        } catch ($) {
          this.sendStatus({ code: Qv.Status.RESOURCE_EXHAUSTED, details: $.message });
          return;
        }
        for (let $ of q) {
          this.stream.pause();
          let K = { type: "COMPRESSED", compressedMessage: $, parsedMessage: null };
          this.readQueue.push(K),
            this.decompressAndMaybePush(K),
            (_ = this.callEventTracker) === null || _ === void 0 || _.addMessageReceived();
        }
      }
      handleEndEvent() {
        this.readQueue.push({ type: "HALF_CLOSE", compressedMessage: null, parsedMessage: null }),
          (this.receivedHalfClose = !0),
          this.maybePushNextMessage();
      }
      start(H) {
        if ((nAH("Request to " + this.handler.path + " start called"), this.checkCancelled())) return;
        (this.listener = H), H.onReceiveMetadata(this.metadata);
      }
      sendMetadata(H) {
        if (this.checkCancelled()) return;
        if (this.metadataSent) return;
        this.metadataSent = !0;
        let _ = H ? H.toHttp2Headers() : null,
          q = Object.assign(Object.assign(Object.assign({}, qU7), NS1), _);
        this.stream.respond(q, hS1);
      }
      sendMessage(H, _) {
        if (this.checkCancelled()) return;
        let q;
        try {
          q = this.serializeMessage(H);
        } catch ($) {
          this.sendStatus({
            code: Qv.Status.INTERNAL,
            details: `Error serializing response: ${(0, sF7.getErrorMessage)($)}`,
            metadata: null,
          });
          return;
        }
        if (this.maxSendMessageSize !== -1 && q.length - 5 > this.maxSendMessageSize) {
          this.sendStatus({
            code: Qv.Status.RESOURCE_EXHAUSTED,
            details: `Sent message larger than max (${q.length} vs. ${this.maxSendMessageSize})`,
            metadata: null,
          });
          return;
        }
        this.maybeSendMetadata(),
          nAH("Request to " + this.handler.path + " sent data frame of size " + q.length),
          this.stream.write(q, ($) => {
            var K;
            if ($) {
              this.sendStatus({
                code: Qv.Status.INTERNAL,
                details: `Error writing message: ${(0, sF7.getErrorMessage)($)}`,
                metadata: null,
              });
              return;
            }
            (K = this.callEventTracker) === null || K === void 0 || K.addMessageSent(), _();
          });
      }
      sendStatus(H) {
        var _, q, $;
        if (this.checkCancelled()) return;
        nAH(
          "Request to method " +
            ((_ = this.handler) === null || _ === void 0 ? void 0 : _.path) +
            " ended with status code: " +
            Qv.Status[H.code] +
            " details: " +
            H.details,
        );
        let K =
          ($ = (q = H.metadata) === null || q === void 0 ? void 0 : q.clone()) !== null && $ !== void 0
            ? $
            : new ax_.Metadata();
        if (this.shouldSendMetrics) K.set(eF7.GRPC_METRICS_HEADER, this.metricsRecorder.serialize());
        if (this.metadataSent)
          if (!this.wantTrailers)
            (this.wantTrailers = !0),
              this.stream.once("wantTrailers", () => {
                if (this.callEventTracker && !this.streamEnded)
                  (this.streamEnded = !0), this.callEventTracker.onStreamEnd(!0), this.callEventTracker.onCallEnd(H);
                let O = Object.assign({ [_U7]: H.code, [HU7]: encodeURI(H.details) }, K.toHttp2Headers());
                this.stream.sendTrailers(O), this.notifyOnCancel();
              }),
              this.stream.end();
          else this.notifyOnCancel();
        else {
          if (this.callEventTracker && !this.streamEnded)
            (this.streamEnded = !0), this.callEventTracker.onStreamEnd(!0), this.callEventTracker.onCallEnd(H);
          let O = Object.assign(Object.assign({ [_U7]: H.code, [HU7]: encodeURI(H.details) }, qU7), K.toHttp2Headers());
          this.stream.respond(O, { endStream: !0 }), this.notifyOnCancel();
        }
      }
      startRead() {
        if ((nAH("Request to " + this.handler.path + " startRead called"), this.checkCancelled())) return;
        if (((this.isReadPending = !0), this.readQueue.length === 0)) {
          if (!this.receivedHalfClose) this.stream.resume();
        } else this.maybePushNextMessage();
      }
      getPeer() {
        var H;
        let _ = (H = this.stream.session) === null || H === void 0 ? void 0 : H.socket;
        if (_ === null || _ === void 0 ? void 0 : _.remoteAddress)
          if (_.remotePort) return `${_.remoteAddress}:${_.remotePort}`;
          else return _.remoteAddress;
        else return "unknown";
      }
      getDeadline() {
        return this.deadline;
      }
      getHost() {
        return this.host;
      }
      getAuthContext() {
        var H;
        if (((H = this.stream.session) === null || H === void 0 ? void 0 : H.socket) instanceof ZS1.TLSSocket) {
          let _ = this.stream.session.socket.getPeerCertificate();
          return { transportSecurityType: "ssl", sslPeerCertificate: _.raw ? _ : void 0 };
        } else return {};
      }
      getConnectionInfo() {
        return this.connectionInfo;
      }
      getMetricsRecorder() {
        return this.metricsRecorder;
      }
    }
    FC.BaseServerInterceptingCall = Ji6;
    function yS1(H, _, q, $, K, O) {
      let T = {
          path: K.path,
          requestStream: K.type === "clientStream" || K.type === "bidi",
          responseStream: K.type === "serverStream" || K.type === "bidi",
          requestDeserialize: K.deserialize,
          responseSerialize: K.serialize,
        },
        z = new Ji6(_, q, $, K, O);
      return H.reduce((A, f) => {
        return f(T, A);
      }, z);
    }
  });
