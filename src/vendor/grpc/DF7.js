  var DF7 = d((Ex_) => {
    Object.defineProperty(Ex_, "__esModule", { value: !0 });
    Ex_.Http2SubchannelCall = void 0;
    var or = require("http2"),
      ny1 = require("os"),
      Zz = mK(),
      ar = GP(),
      ry1 = rl6(),
      oy1 = DA(),
      ay1 = mK(),
      sy1 = "subchannel_call";
    function ty1(H) {
      for (let [_, q] of Object.entries(ny1.constants.errno)) if (q === H) return _;
      return "Unknown system error " + H;
    }
    function ol6(H) {
      let _ = `Received HTTP status code ${H}`,
        q;
      switch (H) {
        case 400:
          q = Zz.Status.INTERNAL;
          break;
        case 401:
          q = Zz.Status.UNAUTHENTICATED;
          break;
        case 403:
          q = Zz.Status.PERMISSION_DENIED;
          break;
        case 404:
          q = Zz.Status.UNIMPLEMENTED;
          break;
        case 429:
        case 502:
        case 503:
        case 504:
          q = Zz.Status.UNAVAILABLE;
          break;
        default:
          q = Zz.Status.UNKNOWN;
      }
      return { code: q, details: _, metadata: new ar.Metadata() };
    }
    class YF7 {
      constructor(H, _, q, $, K) {
        var O;
        (this.http2Stream = H),
          (this.callEventTracker = _),
          (this.listener = q),
          (this.transport = $),
          (this.callId = K),
          (this.isReadFilterPending = !1),
          (this.isPushPending = !1),
          (this.canPush = !1),
          (this.readsClosed = !1),
          (this.statusOutput = !1),
          (this.unpushedReadMessages = []),
          (this.finalStatus = null),
          (this.internalError = null),
          (this.serverEndedCall = !1),
          (this.connectionDropped = !1);
        let T =
          (O = $.getOptions()["grpc.max_receive_message_length"]) !== null && O !== void 0
            ? O
            : Zz.DEFAULT_MAX_RECEIVE_MESSAGE_LENGTH;
        (this.decoder = new ry1.StreamDecoder(T)),
          H.on("response", (z, A) => {
            let f = "";
            for (let w of Object.keys(z))
              f +=
                "\t\t" +
                w +
                ": " +
                z[w] +
                `
`;
            if (
              (this.trace(
                `Received server headers:
` + f,
              ),
              (this.httpStatusCode = z[":status"]),
              A & or.constants.NGHTTP2_FLAG_END_STREAM)
            )
              this.handleTrailers(z);
            else {
              let w;
              try {
                w = ar.Metadata.fromHttp2Headers(z);
              } catch (Y) {
                this.endCall({ code: Zz.Status.UNKNOWN, details: Y.message, metadata: new ar.Metadata() });
                return;
              }
              this.listener.onReceiveMetadata(w);
            }
          }),
          H.on("trailers", (z) => {
            this.handleTrailers(z);
          }),
          H.on("data", (z) => {
            if (this.statusOutput) return;
            this.trace("receive HTTP/2 data frame of length " + z.length);
            let A;
            try {
              A = this.decoder.write(z);
            } catch (f) {
              if (this.httpStatusCode !== void 0 && this.httpStatusCode !== 200) {
                let w = ol6(this.httpStatusCode);
                this.cancelWithStatus(w.code, w.details);
              } else this.cancelWithStatus(Zz.Status.RESOURCE_EXHAUSTED, f.message);
              return;
            }
            for (let f of A)
              this.trace("parsed message of length " + f.length),
                this.callEventTracker.addMessageReceived(),
                this.tryPush(f);
          }),
          H.on("end", () => {
            (this.readsClosed = !0), this.maybeOutputStatus();
          }),
          H.on("close", () => {
            (this.serverEndedCall = !0),
              process.nextTick(() => {
                var z;
                if (
                  (this.trace("HTTP/2 stream closed with code " + H.rstCode),
                  ((z = this.finalStatus) === null || z === void 0 ? void 0 : z.code) === Zz.Status.OK)
                )
                  return;
                let A,
                  f = "";
                switch (H.rstCode) {
                  case or.constants.NGHTTP2_NO_ERROR:
                    if (this.finalStatus !== null) return;
                    if (this.httpStatusCode && this.httpStatusCode !== 200) {
                      let w = ol6(this.httpStatusCode);
                      (A = w.code), (f = w.details);
                    } else
                      (A = Zz.Status.INTERNAL),
                        (f = `Received RST_STREAM with code ${H.rstCode} (Call ended without gRPC status)`);
                    break;
                  case or.constants.NGHTTP2_REFUSED_STREAM:
                    (A = Zz.Status.UNAVAILABLE), (f = "Stream refused by server");
                    break;
                  case or.constants.NGHTTP2_CANCEL:
                    if (this.connectionDropped) (A = Zz.Status.UNAVAILABLE), (f = "Connection dropped");
                    else (A = Zz.Status.CANCELLED), (f = "Call cancelled");
                    break;
                  case or.constants.NGHTTP2_ENHANCE_YOUR_CALM:
                    (A = Zz.Status.RESOURCE_EXHAUSTED), (f = "Bandwidth exhausted or memory limit exceeded");
                    break;
                  case or.constants.NGHTTP2_INADEQUATE_SECURITY:
                    (A = Zz.Status.PERMISSION_DENIED), (f = "Protocol not secure enough");
                    break;
                  case or.constants.NGHTTP2_INTERNAL_ERROR:
                    if (((A = Zz.Status.INTERNAL), this.internalError === null))
                      f = `Received RST_STREAM with code ${H.rstCode} (Internal server error)`;
                    else if (this.internalError.code === "ECONNRESET" || this.internalError.code === "ETIMEDOUT")
                      (A = Zz.Status.UNAVAILABLE), (f = this.internalError.message);
                    else
                      f = `Received RST_STREAM with code ${H.rstCode} triggered by internal client error: ${this.internalError.message}`;
                    break;
                  default:
                    (A = Zz.Status.INTERNAL), (f = `Received RST_STREAM with code ${H.rstCode}`);
                }
                this.endCall({ code: A, details: f, metadata: new ar.Metadata(), rstCode: H.rstCode });
              });
          }),
          H.on("error", (z) => {
            if (z.code !== "ERR_HTTP2_STREAM_ERROR")
              this.trace(
                "Node error event: message=" +
                  z.message +
                  " code=" +
                  z.code +
                  " errno=" +
                  ty1(z.errno) +
                  " syscall=" +
                  z.syscall,
              ),
                (this.internalError = z);
            this.callEventTracker.onStreamEnd(!1);
          });
      }
      getDeadlineInfo() {
        return [`remote_addr=${this.getPeer()}`];
      }
      onDisconnect() {
        (this.connectionDropped = !0),
          setImmediate(() => {
            this.endCall({ code: Zz.Status.UNAVAILABLE, details: "Connection dropped", metadata: new ar.Metadata() });
          });
      }
      outputStatus() {
        if (!this.statusOutput)
          (this.statusOutput = !0),
            this.trace(
              "ended with status: code=" + this.finalStatus.code + ' details="' + this.finalStatus.details + '"',
            ),
            this.callEventTracker.onCallEnd(this.finalStatus),
            process.nextTick(() => {
              this.listener.onReceiveStatus(this.finalStatus);
            }),
            this.http2Stream.resume();
      }
      trace(H) {
        oy1.trace(ay1.LogVerbosity.DEBUG, sy1, "[" + this.callId + "] " + H);
      }
      endCall(H) {
        if (this.finalStatus === null || this.finalStatus.code === Zz.Status.OK)
          (this.finalStatus = H), this.maybeOutputStatus();
        this.destroyHttp2Stream();
      }
      maybeOutputStatus() {
        if (this.finalStatus !== null) {
          if (
            this.finalStatus.code !== Zz.Status.OK ||
            (this.readsClosed &&
              this.unpushedReadMessages.length === 0 &&
              !this.isReadFilterPending &&
              !this.isPushPending)
          )
            this.outputStatus();
        }
      }
      push(H) {
        this.trace("pushing to reader message of length " + (H instanceof Buffer ? H.length : null)),
          (this.canPush = !1),
          (this.isPushPending = !0),
          process.nextTick(() => {
            if (((this.isPushPending = !1), this.statusOutput)) return;
            this.listener.onReceiveMessage(H), this.maybeOutputStatus();
          });
      }
      tryPush(H) {
        if (this.canPush) this.http2Stream.pause(), this.push(H);
        else this.trace("unpushedReadMessages.push message of length " + H.length), this.unpushedReadMessages.push(H);
      }
      handleTrailers(H) {
        (this.serverEndedCall = !0), this.callEventTracker.onStreamEnd(!0);
        let _ = "";
        for (let O of Object.keys(H))
          _ +=
            "\t\t" +
            O +
            ": " +
            H[O] +
            `
`;
        this.trace(
          `Received server trailers:
` + _,
        );
        let q;
        try {
          q = ar.Metadata.fromHttp2Headers(H);
        } catch (O) {
          q = new ar.Metadata();
        }
        let $ = q.getMap(),
          K;
        if (typeof $["grpc-status"] === "string") {
          let O = Number($["grpc-status"]);
          this.trace("received status code " + O + " from server"), q.remove("grpc-status");
          let T = "";
          if (typeof $["grpc-message"] === "string") {
            try {
              T = decodeURI($["grpc-message"]);
            } catch (z) {
              T = $["grpc-message"];
            }
            q.remove("grpc-message"), this.trace('received status details string "' + T + '" from server');
          }
          K = { code: O, details: T, metadata: q };
        } else if (this.httpStatusCode) (K = ol6(this.httpStatusCode)), (K.metadata = q);
        else K = { code: Zz.Status.UNKNOWN, details: "No status information received", metadata: q };
        this.endCall(K);
      }
      destroyHttp2Stream() {
        var H;
        if (this.http2Stream.destroyed) return;
        if (this.serverEndedCall) this.http2Stream.end();
        else {
          let _;
          if (((H = this.finalStatus) === null || H === void 0 ? void 0 : H.code) === Zz.Status.OK)
            _ = or.constants.NGHTTP2_NO_ERROR;
          else _ = or.constants.NGHTTP2_CANCEL;
          this.trace("close http2 stream with code " + _), this.http2Stream.close(_);
        }
      }
      cancelWithStatus(H, _) {
        this.trace("cancelWithStatus code: " + H + ' details: "' + _ + '"'),
          this.endCall({ code: H, details: _, metadata: new ar.Metadata() });
      }
      getStatus() {
        return this.finalStatus;
      }
      getPeer() {
        return this.transport.getPeerName();
      }
      getCallNumber() {
        return this.callId;
      }
      getAuthContext() {
        return this.transport.getAuthContext();
      }
      startRead() {
        if (this.finalStatus !== null && this.finalStatus.code !== Zz.Status.OK) {
          (this.readsClosed = !0), this.maybeOutputStatus();
          return;
        }
        if (((this.canPush = !0), this.unpushedReadMessages.length > 0)) {
          let H = this.unpushedReadMessages.shift();
          this.push(H);
          return;
        }
        this.http2Stream.resume();
      }
      sendMessageWithContext(H, _) {
        this.trace("write() called with message of length " + _.length);
        let q = ($) => {
          process.nextTick(() => {
            var K;
            let O = Zz.Status.UNAVAILABLE;
            if (($ === null || $ === void 0 ? void 0 : $.code) === "ERR_STREAM_WRITE_AFTER_END") O = Zz.Status.INTERNAL;
            if ($) this.cancelWithStatus(O, `Write error: ${$.message}`);
            (K = H.callback) === null || K === void 0 || K.call(H);
          });
        };
        this.trace("sending data chunk of length " + _.length), this.callEventTracker.addMessageSent();
        try {
          this.http2Stream.write(_, q);
        } catch ($) {
          this.endCall({
            code: Zz.Status.UNAVAILABLE,
            details: `Write failed with error ${$.message}`,
            metadata: new ar.Metadata(),
          });
        }
      }
      halfClose() {
        this.trace("end() called"), this.trace("calling end() on HTTP/2 stream"), this.http2Stream.end();
      }
    }
    Ex_.Http2SubchannelCall = YF7;
  });
