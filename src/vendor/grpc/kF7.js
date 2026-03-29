  var kF7 = d((Bx_) => {
    Object.defineProperty(Bx_, "__esModule", { value: !0 });
    Bx_.ResolvingCall = void 0;
    var yV1 = Nu_(),
      QAH = mK(),
      lAH = yNH(),
      ZF7 = GP(),
      VV1 = DA(),
      SV1 = NsH(),
      EV1 = "resolving_call";
    class LF7 {
      constructor(H, _, q, $, K) {
        if (
          ((this.channel = H),
          (this.method = _),
          (this.filterStackFactory = $),
          (this.callNumber = K),
          (this.child = null),
          (this.readPending = !1),
          (this.pendingMessage = null),
          (this.pendingHalfClose = !1),
          (this.ended = !1),
          (this.readFilterPending = !1),
          (this.writeFilterPending = !1),
          (this.pendingChildStatus = null),
          (this.metadata = null),
          (this.listener = null),
          (this.statusWatchers = []),
          (this.deadlineTimer = setTimeout(() => {}, 0)),
          (this.filterStack = null),
          (this.deadlineStartTime = null),
          (this.configReceivedTime = null),
          (this.childStartTime = null),
          (this.credentials = yV1.CallCredentials.createEmpty()),
          (this.deadline = q.deadline),
          (this.host = q.host),
          q.parentCall)
        ) {
          if (q.flags & QAH.Propagate.CANCELLATION)
            q.parentCall.on("cancelled", () => {
              this.cancelWithStatus(QAH.Status.CANCELLED, "Cancelled by parent call");
            });
          if (q.flags & QAH.Propagate.DEADLINE)
            this.trace("Propagating deadline from parent: " + q.parentCall.getDeadline()),
              (this.deadline = (0, lAH.minDeadline)(this.deadline, q.parentCall.getDeadline()));
        }
        this.trace("Created"), this.runDeadlineTimer();
      }
      trace(H) {
        VV1.trace(QAH.LogVerbosity.DEBUG, EV1, "[" + this.callNumber + "] " + H);
      }
      runDeadlineTimer() {
        clearTimeout(this.deadlineTimer),
          (this.deadlineStartTime = new Date()),
          this.trace("Deadline: " + (0, lAH.deadlineToString)(this.deadline));
        let H = (0, lAH.getRelativeTimeout)(this.deadline);
        if (H !== 1 / 0) {
          this.trace("Deadline will be reached in " + H + "ms");
          let _ = () => {
            if (!this.deadlineStartTime) {
              this.cancelWithStatus(QAH.Status.DEADLINE_EXCEEDED, "Deadline exceeded");
              return;
            }
            let q = [],
              $ = new Date();
            if (
              (q.push(`Deadline exceeded after ${(0, lAH.formatDateDifference)(this.deadlineStartTime, $)}`),
              this.configReceivedTime)
            ) {
              if (this.configReceivedTime > this.deadlineStartTime)
                q.push(
                  `name resolution: ${(0, lAH.formatDateDifference)(this.deadlineStartTime, this.configReceivedTime)}`,
                );
              if (this.childStartTime) {
                if (this.childStartTime > this.configReceivedTime)
                  q.push(
                    `metadata filters: ${(0, lAH.formatDateDifference)(this.configReceivedTime, this.childStartTime)}`,
                  );
              } else q.push("waiting for metadata filters");
            } else q.push("waiting for name resolution");
            if (this.child) q.push(...this.child.getDeadlineInfo());
            this.cancelWithStatus(QAH.Status.DEADLINE_EXCEEDED, q.join(","));
          };
          if (H <= 0) process.nextTick(_);
          else this.deadlineTimer = setTimeout(_, H);
        }
      }
      outputStatus(H) {
        if (!this.ended) {
          if (((this.ended = !0), !this.filterStack)) this.filterStack = this.filterStackFactory.createFilter();
          clearTimeout(this.deadlineTimer);
          let _ = this.filterStack.receiveTrailers(H);
          this.trace("ended with status: code=" + _.code + ' details="' + _.details + '"'),
            this.statusWatchers.forEach((q) => q(_)),
            process.nextTick(() => {
              var q;
              (q = this.listener) === null || q === void 0 || q.onReceiveStatus(_);
            });
        }
      }
      sendMessageOnChild(H, _) {
        if (!this.child) throw Error("sendMessageonChild called with child not populated");
        let q = this.child;
        (this.writeFilterPending = !0),
          this.filterStack.sendMessage(Promise.resolve({ message: _, flags: H.flags })).then(
            ($) => {
              if (((this.writeFilterPending = !1), q.sendMessageWithContext(H, $.message), this.pendingHalfClose))
                q.halfClose();
            },
            ($) => {
              this.cancelWithStatus($.code, $.details);
            },
          );
      }
      getConfig() {
        if (this.ended) return;
        if (!this.metadata || !this.listener) throw Error("getConfig called before start");
        let H = this.channel.getConfig(this.method, this.metadata);
        if (H.type === "NONE") {
          this.channel.queueCallForConfig(this);
          return;
        } else if (H.type === "ERROR") {
          if (this.metadata.getOptions().waitForReady) this.channel.queueCallForConfig(this);
          else this.outputStatus(H.error);
          return;
        }
        this.configReceivedTime = new Date();
        let _ = H.config;
        if (_.status !== QAH.Status.OK) {
          let { code: q, details: $ } = (0, SV1.restrictControlPlaneStatusCode)(
            _.status,
            "Failed to route call to method " + this.method,
          );
          this.outputStatus({ code: q, details: $, metadata: new ZF7.Metadata() });
          return;
        }
        if (_.methodConfig.timeout) {
          let q = new Date();
          q.setSeconds(q.getSeconds() + _.methodConfig.timeout.seconds),
            q.setMilliseconds(q.getMilliseconds() + _.methodConfig.timeout.nanos / 1e6),
            (this.deadline = (0, lAH.minDeadline)(this.deadline, q)),
            this.runDeadlineTimer();
        }
        this.filterStackFactory.push(_.dynamicFilterFactories),
          (this.filterStack = this.filterStackFactory.createFilter()),
          this.filterStack.sendMetadata(Promise.resolve(this.metadata)).then(
            (q) => {
              if (
                ((this.child = this.channel.createRetryingCall(
                  _,
                  this.method,
                  this.host,
                  this.credentials,
                  this.deadline,
                )),
                this.trace("Created child [" + this.child.getCallNumber() + "]"),
                (this.childStartTime = new Date()),
                this.child.start(q, {
                  onReceiveMetadata: ($) => {
                    this.trace("Received metadata"),
                      this.listener.onReceiveMetadata(this.filterStack.receiveMetadata($));
                  },
                  onReceiveMessage: ($) => {
                    this.trace("Received message"),
                      (this.readFilterPending = !0),
                      this.filterStack.receiveMessage($).then(
                        (K) => {
                          if (
                            (this.trace("Finished filtering received message"),
                            (this.readFilterPending = !1),
                            this.listener.onReceiveMessage(K),
                            this.pendingChildStatus)
                          )
                            this.outputStatus(this.pendingChildStatus);
                        },
                        (K) => {
                          this.cancelWithStatus(K.code, K.details);
                        },
                      );
                  },
                  onReceiveStatus: ($) => {
                    if ((this.trace("Received status"), this.readFilterPending)) this.pendingChildStatus = $;
                    else this.outputStatus($);
                  },
                }),
                this.readPending)
              )
                this.child.startRead();
              if (this.pendingMessage)
                this.sendMessageOnChild(this.pendingMessage.context, this.pendingMessage.message);
              else if (this.pendingHalfClose) this.child.halfClose();
            },
            (q) => {
              this.outputStatus(q);
            },
          );
      }
      reportResolverError(H) {
        var _;
        if ((_ = this.metadata) === null || _ === void 0 ? void 0 : _.getOptions().waitForReady)
          this.channel.queueCallForConfig(this);
        else this.outputStatus(H);
      }
      cancelWithStatus(H, _) {
        var q;
        this.trace("cancelWithStatus code: " + H + ' details: "' + _ + '"'),
          (q = this.child) === null || q === void 0 || q.cancelWithStatus(H, _),
          this.outputStatus({ code: H, details: _, metadata: new ZF7.Metadata() });
      }
      getPeer() {
        var H, _;
        return (_ = (H = this.child) === null || H === void 0 ? void 0 : H.getPeer()) !== null && _ !== void 0
          ? _
          : this.channel.getTarget();
      }
      start(H, _) {
        this.trace("start called"), (this.metadata = H.clone()), (this.listener = _), this.getConfig();
      }
      sendMessageWithContext(H, _) {
        if ((this.trace("write() called with message of length " + _.length), this.child))
          this.sendMessageOnChild(H, _);
        else this.pendingMessage = { context: H, message: _ };
      }
      startRead() {
        if ((this.trace("startRead called"), this.child)) this.child.startRead();
        else this.readPending = !0;
      }
      halfClose() {
        if ((this.trace("halfClose called"), this.child && !this.writeFilterPending)) this.child.halfClose();
        else this.pendingHalfClose = !0;
      }
      setCredentials(H) {
        this.credentials = H;
      }
      addStatusWatcher(H) {
        this.statusWatchers.push(H);
      }
      getCallNumber() {
        return this.callNumber;
      }
      getAuthContext() {
        if (this.child) return this.child.getAuthContext();
        else return null;
      }
    }
    Bx_.ResolvingCall = LF7;
  });
