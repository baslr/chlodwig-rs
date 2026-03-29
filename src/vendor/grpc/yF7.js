  var yF7 = d((D7H) => {
    Object.defineProperty(D7H, "__esModule", { value: !0 });
    D7H.RetryingCall = D7H.MessageBufferTracker = D7H.RetryThrottler = void 0;
    var gx_ = mK(),
      CV1 = yNH(),
      bV1 = GP(),
      IV1 = DA(),
      uV1 = "retrying_call";
    class vF7 {
      constructor(H, _, q) {
        if (((this.maxTokens = H), (this.tokenRatio = _), q)) this.tokens = q.tokens * (H / q.maxTokens);
        else this.tokens = H;
      }
      addCallSucceeded() {
        this.tokens = Math.min(this.tokens + this.tokenRatio, this.maxTokens);
      }
      addCallFailed() {
        this.tokens = Math.max(this.tokens - 1, 0);
      }
      canRetryCall() {
        return this.tokens > this.maxTokens / 2;
      }
    }
    D7H.RetryThrottler = vF7;
    class NF7 {
      constructor(H, _) {
        (this.totalLimit = H), (this.limitPerCall = _), (this.totalAllocated = 0), (this.allocatedPerCall = new Map());
      }
      allocate(H, _) {
        var q;
        let $ = (q = this.allocatedPerCall.get(_)) !== null && q !== void 0 ? q : 0;
        if (this.limitPerCall - $ < H || this.totalLimit - this.totalAllocated < H) return !1;
        return this.allocatedPerCall.set(_, $ + H), (this.totalAllocated += H), !0;
      }
      free(H, _) {
        var q;
        if (this.totalAllocated < H)
          throw Error(`Invalid buffer allocation state: call ${_} freed ${H} > total allocated ${this.totalAllocated}`);
        this.totalAllocated -= H;
        let $ = (q = this.allocatedPerCall.get(_)) !== null && q !== void 0 ? q : 0;
        if ($ < H) throw Error(`Invalid buffer allocation state: call ${_} freed ${H} > allocated for call ${$}`);
        this.allocatedPerCall.set(_, $ - H);
      }
      freeAll(H) {
        var _;
        let q = (_ = this.allocatedPerCall.get(H)) !== null && _ !== void 0 ? _ : 0;
        if (this.totalAllocated < q)
          throw Error(
            `Invalid buffer allocation state: call ${H} allocated ${q} > total allocated ${this.totalAllocated}`,
          );
        (this.totalAllocated -= q), this.allocatedPerCall.delete(H);
      }
    }
    D7H.MessageBufferTracker = NF7;
    var el6 = "grpc-previous-rpc-attempts",
      xV1 = 5;
    class hF7 {
      constructor(H, _, q, $, K, O, T, z, A) {
        var f;
        (this.channel = H),
          (this.callConfig = _),
          (this.methodName = q),
          (this.host = $),
          (this.credentials = K),
          (this.deadline = O),
          (this.callNumber = T),
          (this.bufferTracker = z),
          (this.retryThrottler = A),
          (this.listener = null),
          (this.initialMetadata = null),
          (this.underlyingCalls = []),
          (this.writeBuffer = []),
          (this.writeBufferOffset = 0),
          (this.readStarted = !1),
          (this.transparentRetryUsed = !1),
          (this.attempts = 0),
          (this.hedgingTimer = null),
          (this.committedCallIndex = null),
          (this.initialRetryBackoffSec = 0),
          (this.nextRetryBackoffSec = 0);
        let w = (f = H.getOptions()["grpc-node.retry_max_attempts_limit"]) !== null && f !== void 0 ? f : xV1;
        if (H.getOptions()["grpc.enable_retries"] === 0) (this.state = "NO_RETRY"), (this.maxAttempts = 1);
        else if (_.methodConfig.retryPolicy) {
          this.state = "RETRY";
          let Y = _.methodConfig.retryPolicy;
          (this.nextRetryBackoffSec = this.initialRetryBackoffSec =
            Number(Y.initialBackoff.substring(0, Y.initialBackoff.length - 1))),
            (this.maxAttempts = Math.min(Y.maxAttempts, w));
        } else if (_.methodConfig.hedgingPolicy)
          (this.state = "HEDGING"), (this.maxAttempts = Math.min(_.methodConfig.hedgingPolicy.maxAttempts, w));
        else (this.state = "TRANSPARENT_ONLY"), (this.maxAttempts = 1);
        this.startTime = new Date();
      }
      getDeadlineInfo() {
        if (this.underlyingCalls.length === 0) return [];
        let H = [],
          _ = this.underlyingCalls[this.underlyingCalls.length - 1];
        if (this.underlyingCalls.length > 1) H.push(`previous attempts: ${this.underlyingCalls.length - 1}`);
        if (_.startTime > this.startTime)
          H.push(`time to current attempt start: ${(0, CV1.formatDateDifference)(this.startTime, _.startTime)}`);
        return H.push(..._.call.getDeadlineInfo()), H;
      }
      getCallNumber() {
        return this.callNumber;
      }
      trace(H) {
        IV1.trace(gx_.LogVerbosity.DEBUG, uV1, "[" + this.callNumber + "] " + H);
      }
      reportStatus(H) {
        this.trace(
          "ended with status: code=" +
            H.code +
            ' details="' +
            H.details +
            '" start time=' +
            this.startTime.toISOString(),
        ),
          this.bufferTracker.freeAll(this.callNumber),
          (this.writeBufferOffset = this.writeBufferOffset + this.writeBuffer.length),
          (this.writeBuffer = []),
          process.nextTick(() => {
            var _;
            (_ = this.listener) === null ||
              _ === void 0 ||
              _.onReceiveStatus({ code: H.code, details: H.details, metadata: H.metadata });
          });
      }
      cancelWithStatus(H, _) {
        this.trace("cancelWithStatus code: " + H + ' details: "' + _ + '"'),
          this.reportStatus({ code: H, details: _, metadata: new bV1.Metadata() });
        for (let { call: q } of this.underlyingCalls) q.cancelWithStatus(H, _);
      }
      getPeer() {
        if (this.committedCallIndex !== null) return this.underlyingCalls[this.committedCallIndex].call.getPeer();
        else return "unknown";
      }
      getBufferEntry(H) {
        var _;
        return (_ = this.writeBuffer[H - this.writeBufferOffset]) !== null && _ !== void 0
          ? _
          : { entryType: "FREED", allocated: !1 };
      }
      getNextBufferIndex() {
        return this.writeBufferOffset + this.writeBuffer.length;
      }
      clearSentMessages() {
        if (this.state !== "COMMITTED") return;
        let H;
        if (this.underlyingCalls[this.committedCallIndex].state === "COMPLETED") H = this.getNextBufferIndex();
        else H = this.underlyingCalls[this.committedCallIndex].nextMessageToSend;
        for (let _ = this.writeBufferOffset; _ < H; _++) {
          let q = this.getBufferEntry(_);
          if (q.allocated) this.bufferTracker.free(q.message.message.length, this.callNumber);
        }
        (this.writeBuffer = this.writeBuffer.slice(H - this.writeBufferOffset)), (this.writeBufferOffset = H);
      }
      commitCall(H) {
        var _, q;
        if (this.state === "COMMITTED") return;
        this.trace("Committing call [" + this.underlyingCalls[H].call.getCallNumber() + "] at index " + H),
          (this.state = "COMMITTED"),
          (q = (_ = this.callConfig).onCommitted) === null || q === void 0 || q.call(_),
          (this.committedCallIndex = H);
        for (let $ = 0; $ < this.underlyingCalls.length; $++) {
          if ($ === H) continue;
          if (this.underlyingCalls[$].state === "COMPLETED") continue;
          (this.underlyingCalls[$].state = "COMPLETED"),
            this.underlyingCalls[$].call.cancelWithStatus(
              gx_.Status.CANCELLED,
              "Discarded in favor of other hedged attempt",
            );
        }
        this.clearSentMessages();
      }
      commitCallWithMostMessages() {
        if (this.state === "COMMITTED") return;
        let H = -1,
          _ = -1;
        for (let [q, $] of this.underlyingCalls.entries())
          if ($.state === "ACTIVE" && $.nextMessageToSend > H) (H = $.nextMessageToSend), (_ = q);
        if (_ === -1) this.state = "TRANSPARENT_ONLY";
        else this.commitCall(_);
      }
      isStatusCodeInList(H, _) {
        return H.some((q) => {
          var $;
          return (
            q === _ ||
            q.toString().toLowerCase() === (($ = gx_.Status[_]) === null || $ === void 0 ? void 0 : $.toLowerCase())
          );
        });
      }
      getNextRetryJitter() {
        return Math.random() * 0.3999999999999999 + 0.8;
      }
      getNextRetryBackoffMs() {
        var H;
        let _ = (H = this.callConfig) === null || H === void 0 ? void 0 : H.methodConfig.retryPolicy;
        if (!_) return 0;
        let $ = this.getNextRetryJitter() * this.nextRetryBackoffSec * 1000,
          K = Number(_.maxBackoff.substring(0, _.maxBackoff.length - 1));
        return (this.nextRetryBackoffSec = Math.min(this.nextRetryBackoffSec * _.backoffMultiplier, K)), $;
      }
      maybeRetryCall(H, _) {
        if (this.state !== "RETRY") {
          _(!1);
          return;
        }
        if (this.attempts >= this.maxAttempts) {
          _(!1);
          return;
        }
        let q;
        if (H === null) q = this.getNextRetryBackoffMs();
        else if (H < 0) {
          (this.state = "TRANSPARENT_ONLY"), _(!1);
          return;
        } else (q = H), (this.nextRetryBackoffSec = this.initialRetryBackoffSec);
        setTimeout(() => {
          var $, K;
          if (this.state !== "RETRY") {
            _(!1);
            return;
          }
          if (
            (K = ($ = this.retryThrottler) === null || $ === void 0 ? void 0 : $.canRetryCall()) !== null &&
            K !== void 0
              ? K
              : !0
          )
            _(!0), (this.attempts += 1), this.startNewAttempt();
          else this.trace("Retry attempt denied by throttling policy"), _(!1);
        }, q);
      }
      countActiveCalls() {
        let H = 0;
        for (let _ of this.underlyingCalls) if ((_ === null || _ === void 0 ? void 0 : _.state) === "ACTIVE") H += 1;
        return H;
      }
      handleProcessedStatus(H, _, q) {
        var $, K, O;
        switch (this.state) {
          case "COMMITTED":
          case "NO_RETRY":
          case "TRANSPARENT_ONLY":
            this.commitCall(_), this.reportStatus(H);
            break;
          case "HEDGING":
            if (
              this.isStatusCodeInList(
                ($ = this.callConfig.methodConfig.hedgingPolicy.nonFatalStatusCodes) !== null && $ !== void 0 ? $ : [],
                H.code,
              )
            ) {
              (K = this.retryThrottler) === null || K === void 0 || K.addCallFailed();
              let T;
              if (q === null) T = 0;
              else if (q < 0) {
                (this.state = "TRANSPARENT_ONLY"), this.commitCall(_), this.reportStatus(H);
                return;
              } else T = q;
              setTimeout(() => {
                if ((this.maybeStartHedgingAttempt(), this.countActiveCalls() === 0))
                  this.commitCall(_), this.reportStatus(H);
              }, T);
            } else this.commitCall(_), this.reportStatus(H);
            break;
          case "RETRY":
            if (this.isStatusCodeInList(this.callConfig.methodConfig.retryPolicy.retryableStatusCodes, H.code))
              (O = this.retryThrottler) === null || O === void 0 || O.addCallFailed(),
                this.maybeRetryCall(q, (T) => {
                  if (!T) this.commitCall(_), this.reportStatus(H);
                });
            else this.commitCall(_), this.reportStatus(H);
            break;
        }
      }
      getPushback(H) {
        let _ = H.get("grpc-retry-pushback-ms");
        if (_.length === 0) return null;
        try {
          return parseInt(_[0]);
        } catch (q) {
          return -1;
        }
      }
      handleChildStatus(H, _) {
        var q;
        if (this.underlyingCalls[_].state === "COMPLETED") return;
        if (
          (this.trace(
            "state=" +
              this.state +
              " handling status with progress " +
              H.progress +
              " from child [" +
              this.underlyingCalls[_].call.getCallNumber() +
              "] in state " +
              this.underlyingCalls[_].state,
          ),
          (this.underlyingCalls[_].state = "COMPLETED"),
          H.code === gx_.Status.OK)
        ) {
          (q = this.retryThrottler) === null || q === void 0 || q.addCallSucceeded(),
            this.commitCall(_),
            this.reportStatus(H);
          return;
        }
        if (this.state === "NO_RETRY") {
          this.commitCall(_), this.reportStatus(H);
          return;
        }
        if (this.state === "COMMITTED") {
          this.reportStatus(H);
          return;
        }
        let $ = this.getPushback(H.metadata);
        switch (H.progress) {
          case "NOT_STARTED":
            this.startNewAttempt();
            break;
          case "REFUSED":
            if (this.transparentRetryUsed) this.handleProcessedStatus(H, _, $);
            else (this.transparentRetryUsed = !0), this.startNewAttempt();
            break;
          case "DROP":
            this.commitCall(_), this.reportStatus(H);
            break;
          case "PROCESSED":
            this.handleProcessedStatus(H, _, $);
            break;
        }
      }
      maybeStartHedgingAttempt() {
        if (this.state !== "HEDGING") return;
        if (!this.callConfig.methodConfig.hedgingPolicy) return;
        if (this.attempts >= this.maxAttempts) return;
        (this.attempts += 1), this.startNewAttempt(), this.maybeStartHedgingTimer();
      }
      maybeStartHedgingTimer() {
        var H, _, q;
        if (this.hedgingTimer) clearTimeout(this.hedgingTimer);
        if (this.state !== "HEDGING") return;
        if (!this.callConfig.methodConfig.hedgingPolicy) return;
        let $ = this.callConfig.methodConfig.hedgingPolicy;
        if (this.attempts >= this.maxAttempts) return;
        let K = (H = $.hedgingDelay) !== null && H !== void 0 ? H : "0s",
          O = Number(K.substring(0, K.length - 1));
        (this.hedgingTimer = setTimeout(() => {
          this.maybeStartHedgingAttempt();
        }, O * 1000)),
          (q = (_ = this.hedgingTimer).unref) === null || q === void 0 || q.call(_);
      }
      startNewAttempt() {
        let H = this.channel.createLoadBalancingCall(
          this.callConfig,
          this.methodName,
          this.host,
          this.credentials,
          this.deadline,
        );
        this.trace("Created child call [" + H.getCallNumber() + "] for attempt " + this.attempts);
        let _ = this.underlyingCalls.length;
        this.underlyingCalls.push({ state: "ACTIVE", call: H, nextMessageToSend: 0, startTime: new Date() });
        let q = this.attempts - 1,
          $ = this.initialMetadata.clone();
        if (q > 0) $.set(el6, `${q}`);
        let K = !1;
        if (
          (H.start($, {
            onReceiveMetadata: (O) => {
              if (
                (this.trace("Received metadata from child [" + H.getCallNumber() + "]"),
                this.commitCall(_),
                (K = !0),
                q > 0)
              )
                O.set(el6, `${q}`);
              if (this.underlyingCalls[_].state === "ACTIVE") this.listener.onReceiveMetadata(O);
            },
            onReceiveMessage: (O) => {
              if (
                (this.trace("Received message from child [" + H.getCallNumber() + "]"),
                this.commitCall(_),
                this.underlyingCalls[_].state === "ACTIVE")
              )
                this.listener.onReceiveMessage(O);
            },
            onReceiveStatus: (O) => {
              if ((this.trace("Received status from child [" + H.getCallNumber() + "]"), !K && q > 0))
                O.metadata.set(el6, `${q}`);
              this.handleChildStatus(O, _);
            },
          }),
          this.sendNextChildMessage(_),
          this.readStarted)
        )
          H.startRead();
      }
      start(H, _) {
        this.trace("start called"),
          (this.listener = _),
          (this.initialMetadata = H),
          (this.attempts += 1),
          this.startNewAttempt(),
          this.maybeStartHedgingTimer();
      }
      handleChildWriteCompleted(H) {
        var _, q;
        let $ = this.underlyingCalls[H],
          K = $.nextMessageToSend;
        (q = (_ = this.getBufferEntry(K)).callback) === null || q === void 0 || q.call(_),
          this.clearSentMessages(),
          ($.nextMessageToSend += 1),
          this.sendNextChildMessage(H);
      }
      sendNextChildMessage(H) {
        let _ = this.underlyingCalls[H];
        if (_.state === "COMPLETED") return;
        if (this.getBufferEntry(_.nextMessageToSend)) {
          let q = this.getBufferEntry(_.nextMessageToSend);
          switch (q.entryType) {
            case "MESSAGE":
              _.call.sendMessageWithContext(
                {
                  callback: ($) => {
                    this.handleChildWriteCompleted(H);
                  },
                },
                q.message.message,
              );
              break;
            case "HALF_CLOSE":
              (_.nextMessageToSend += 1), _.call.halfClose();
              break;
            case "FREED":
              break;
          }
        }
      }
      sendMessageWithContext(H, _) {
        var q;
        this.trace("write() called with message of length " + _.length);
        let $ = { message: _, flags: H.flags },
          K = this.getNextBufferIndex(),
          O = { entryType: "MESSAGE", message: $, allocated: this.bufferTracker.allocate(_.length, this.callNumber) };
        if ((this.writeBuffer.push(O), O.allocated)) {
          (q = H.callback) === null || q === void 0 || q.call(H);
          for (let [T, z] of this.underlyingCalls.entries())
            if (z.state === "ACTIVE" && z.nextMessageToSend === K)
              z.call.sendMessageWithContext(
                {
                  callback: (A) => {
                    this.handleChildWriteCompleted(T);
                  },
                },
                _,
              );
        } else {
          if ((this.commitCallWithMostMessages(), this.committedCallIndex === null)) return;
          let T = this.underlyingCalls[this.committedCallIndex];
          if (((O.callback = H.callback), T.state === "ACTIVE" && T.nextMessageToSend === K))
            T.call.sendMessageWithContext(
              {
                callback: (z) => {
                  this.handleChildWriteCompleted(this.committedCallIndex);
                },
              },
              _,
            );
        }
      }
      startRead() {
        this.trace("startRead called"), (this.readStarted = !0);
        for (let H of this.underlyingCalls)
          if ((H === null || H === void 0 ? void 0 : H.state) === "ACTIVE") H.call.startRead();
      }
      halfClose() {
        this.trace("halfClose called");
        let H = this.getNextBufferIndex();
        this.writeBuffer.push({ entryType: "HALF_CLOSE", allocated: !1 });
        for (let _ of this.underlyingCalls)
          if ((_ === null || _ === void 0 ? void 0 : _.state) === "ACTIVE" && _.nextMessageToSend === H)
            (_.nextMessageToSend += 1), _.call.halfClose();
      }
      setCredentials(H) {
        throw Error("Method not implemented.");
      }
      getMethod() {
        return this.methodName;
      }
      getHost() {
        return this.host;
      }
      getAuthContext() {
        if (this.committedCallIndex !== null)
          return this.underlyingCalls[this.committedCallIndex].call.getAuthContext();
        else return null;
      }
    }
    D7H.RetryingCall = hF7;
  });
