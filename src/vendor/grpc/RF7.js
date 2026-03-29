  var RF7 = d((px_) => {
    Object.defineProperty(px_, "__esModule", { value: !0 });
    px_.LoadBalancingCall = void 0;
    var XF7 = TL(),
      xx_ = mK(),
      WF7 = yNH(),
      mx_ = GP(),
      IsH = cr(),
      kV1 = OL(),
      vV1 = DA(),
      tl6 = NsH(),
      NV1 = require("http2"),
      hV1 = "load_balancing_call";
    class GF7 {
      constructor(H, _, q, $, K, O, T) {
        var z, A;
        (this.channel = H),
          (this.callConfig = _),
          (this.methodName = q),
          (this.host = $),
          (this.credentials = K),
          (this.deadline = O),
          (this.callNumber = T),
          (this.child = null),
          (this.readPending = !1),
          (this.pendingMessage = null),
          (this.pendingHalfClose = !1),
          (this.ended = !1),
          (this.metadata = null),
          (this.listener = null),
          (this.onCallEnded = null),
          (this.childStartTime = null);
        let f = this.methodName.split("/"),
          w = "";
        if (f.length >= 2) w = f[1];
        let Y =
          (A = (z = (0, kV1.splitHostPort)(this.host)) === null || z === void 0 ? void 0 : z.host) !== null &&
          A !== void 0
            ? A
            : "localhost";
        (this.serviceUrl = `https://${Y}/${w}`), (this.startTime = new Date());
      }
      getDeadlineInfo() {
        var H, _;
        let q = [];
        if (this.childStartTime) {
          if (this.childStartTime > this.startTime) {
            if ((H = this.metadata) === null || H === void 0 ? void 0 : H.getOptions().waitForReady)
              q.push("wait_for_ready");
            q.push(`LB pick: ${(0, WF7.formatDateDifference)(this.startTime, this.childStartTime)}`);
          }
          return q.push(...this.child.getDeadlineInfo()), q;
        } else {
          if ((_ = this.metadata) === null || _ === void 0 ? void 0 : _.getOptions().waitForReady)
            q.push("wait_for_ready");
          q.push("Waiting for LB pick");
        }
        return q;
      }
      trace(H) {
        vV1.trace(xx_.LogVerbosity.DEBUG, hV1, "[" + this.callNumber + "] " + H);
      }
      outputStatus(H, _) {
        var q, $;
        if (!this.ended) {
          (this.ended = !0),
            this.trace(
              "ended with status: code=" +
                H.code +
                ' details="' +
                H.details +
                '" start time=' +
                this.startTime.toISOString(),
            );
          let K = Object.assign(Object.assign({}, H), { progress: _ });
          (q = this.listener) === null || q === void 0 || q.onReceiveStatus(K),
            ($ = this.onCallEnded) === null || $ === void 0 || $.call(this, K.code, K.details, K.metadata);
        }
      }
      doPick() {
        var H, _;
        if (this.ended) return;
        if (!this.metadata) throw Error("doPick called before start");
        this.trace("Pick called");
        let q = this.metadata.clone(),
          $ = this.channel.doPick(q, this.callConfig.pickInformation),
          K = $.subchannel
            ? "(" + $.subchannel.getChannelzRef().id + ") " + $.subchannel.getAddress()
            : "" + $.subchannel;
        switch (
          (this.trace(
            "Pick result: " +
              IsH.PickResultType[$.pickResultType] +
              " subchannel: " +
              K +
              " status: " +
              ((H = $.status) === null || H === void 0 ? void 0 : H.code) +
              " " +
              ((_ = $.status) === null || _ === void 0 ? void 0 : _.details),
          ),
          $.pickResultType)
        ) {
          case IsH.PickResultType.COMPLETE:
            this.credentials
              .compose($.subchannel.getCallCredentials())
              .generateMetadata({ method_name: this.methodName, service_url: this.serviceUrl })
              .then(
                (A) => {
                  var f;
                  if (this.ended) {
                    this.trace("Credentials metadata generation finished after call ended");
                    return;
                  }
                  if ((q.merge(A), q.get("authorization").length > 1))
                    this.outputStatus(
                      {
                        code: xx_.Status.INTERNAL,
                        details: '"authorization" metadata cannot have multiple values',
                        metadata: new mx_.Metadata(),
                      },
                      "PROCESSED",
                    );
                  if ($.subchannel.getConnectivityState() !== XF7.ConnectivityState.READY) {
                    this.trace(
                      "Picked subchannel " +
                        K +
                        " has state " +
                        XF7.ConnectivityState[$.subchannel.getConnectivityState()] +
                        " after getting credentials metadata. Retrying pick",
                    ),
                      this.doPick();
                    return;
                  }
                  if (this.deadline !== 1 / 0) q.set("grpc-timeout", (0, WF7.getDeadlineTimeoutString)(this.deadline));
                  try {
                    (this.child = $.subchannel.getRealSubchannel().createCall(q, this.host, this.methodName, {
                      onReceiveMetadata: (w) => {
                        this.trace("Received metadata"), this.listener.onReceiveMetadata(w);
                      },
                      onReceiveMessage: (w) => {
                        this.trace("Received message"), this.listener.onReceiveMessage(w);
                      },
                      onReceiveStatus: (w) => {
                        if ((this.trace("Received status"), w.rstCode === NV1.constants.NGHTTP2_REFUSED_STREAM))
                          this.outputStatus(w, "REFUSED");
                        else this.outputStatus(w, "PROCESSED");
                      },
                    })),
                      (this.childStartTime = new Date());
                  } catch (w) {
                    this.trace("Failed to start call on picked subchannel " + K + " with error " + w.message),
                      this.outputStatus(
                        {
                          code: xx_.Status.INTERNAL,
                          details: "Failed to start HTTP/2 stream with error " + w.message,
                          metadata: new mx_.Metadata(),
                        },
                        "NOT_STARTED",
                      );
                    return;
                  }
                  if (
                    ((f = $.onCallStarted) === null || f === void 0 || f.call($),
                    (this.onCallEnded = $.onCallEnded),
                    this.trace("Created child call [" + this.child.getCallNumber() + "]"),
                    this.readPending)
                  )
                    this.child.startRead();
                  if (this.pendingMessage)
                    this.child.sendMessageWithContext(this.pendingMessage.context, this.pendingMessage.message);
                  if (this.pendingHalfClose) this.child.halfClose();
                },
                (A) => {
                  let { code: f, details: w } = (0, tl6.restrictControlPlaneStatusCode)(
                    typeof A.code === "number" ? A.code : xx_.Status.UNKNOWN,
                    `Getting metadata from plugin failed with error: ${A.message}`,
                  );
                  this.outputStatus({ code: f, details: w, metadata: new mx_.Metadata() }, "PROCESSED");
                },
              );
            break;
          case IsH.PickResultType.DROP:
            let { code: T, details: z } = (0, tl6.restrictControlPlaneStatusCode)($.status.code, $.status.details);
            setImmediate(() => {
              this.outputStatus({ code: T, details: z, metadata: $.status.metadata }, "DROP");
            });
            break;
          case IsH.PickResultType.TRANSIENT_FAILURE:
            if (this.metadata.getOptions().waitForReady) this.channel.queueCallForPick(this);
            else {
              let { code: A, details: f } = (0, tl6.restrictControlPlaneStatusCode)($.status.code, $.status.details);
              setImmediate(() => {
                this.outputStatus({ code: A, details: f, metadata: $.status.metadata }, "PROCESSED");
              });
            }
            break;
          case IsH.PickResultType.QUEUE:
            this.channel.queueCallForPick(this);
        }
      }
      cancelWithStatus(H, _) {
        var q;
        this.trace("cancelWithStatus code: " + H + ' details: "' + _ + '"'),
          (q = this.child) === null || q === void 0 || q.cancelWithStatus(H, _),
          this.outputStatus({ code: H, details: _, metadata: new mx_.Metadata() }, "PROCESSED");
      }
      getPeer() {
        var H, _;
        return (_ = (H = this.child) === null || H === void 0 ? void 0 : H.getPeer()) !== null && _ !== void 0
          ? _
          : this.channel.getTarget();
      }
      start(H, _) {
        this.trace("start called"), (this.listener = _), (this.metadata = H), this.doPick();
      }
      sendMessageWithContext(H, _) {
        if ((this.trace("write() called with message of length " + _.length), this.child))
          this.child.sendMessageWithContext(H, _);
        else this.pendingMessage = { context: H, message: _ };
      }
      startRead() {
        if ((this.trace("startRead called"), this.child)) this.child.startRead();
        else this.readPending = !0;
      }
      halfClose() {
        if ((this.trace("halfClose called"), this.child)) this.child.halfClose();
        else this.pendingHalfClose = !0;
      }
      setCredentials(H) {
        throw Error("Method not implemented.");
      }
      getCallNumber() {
        return this.callNumber;
      }
      getAuthContext() {
        if (this.child) return this.child.getAuthContext();
        else return null;
      }
    }
    px_.LoadBalancingCall = GF7;
  });
