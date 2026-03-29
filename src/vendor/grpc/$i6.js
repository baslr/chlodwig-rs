  var $i6 = d((iAH) => {
    Object.defineProperty(iAH, "__esModule", { value: !0 });
    iAH.InternalChannel = iAH.SUBCHANNEL_ARGS_EXCLUDE_KEY_PREFIX = void 0;
    var mV1 = YNH(),
      pV1 = Tg7(),
      BV1 = PF7(),
      qi6 = cr(),
      gV1 = GP(),
      j7H = mK(),
      dV1 = kx_(),
      cV1 = pl6(),
      SF7 = qm(),
      cx_ = DA(),
      FV1 = nl6(),
      Fx_ = OL(),
      cC = TL(),
      xsH = w7H(),
      UV1 = RF7(),
      QV1 = yNH(),
      lV1 = kF7(),
      Hi6 = Gx_(),
      iV1 = NsH(),
      _i6 = yF7(),
      nV1 = usH(),
      rV1 = 2147483647,
      oV1 = 1000,
      aV1 = 1800000,
      Ux_ = new Map(),
      sV1 = 16777216,
      tV1 = 1048576;
    class EF7 extends nV1.BaseSubchannelWrapper {
      constructor(H, _) {
        super(H);
        (this.channel = _),
          (this.refCount = 0),
          (this.subchannelStateListener = (q, $, K, O) => {
            _.throttleKeepalive(O);
          });
      }
      ref() {
        if (this.refCount === 0)
          this.child.addConnectivityStateListener(this.subchannelStateListener),
            this.channel.addWrappedSubchannel(this);
        this.child.ref(), (this.refCount += 1);
      }
      unref() {
        if ((this.child.unref(), (this.refCount -= 1), this.refCount <= 0))
          this.child.removeConnectivityStateListener(this.subchannelStateListener),
            this.channel.removeWrappedSubchannel(this);
      }
    }
    class CF7 {
      pick(H) {
        return {
          pickResultType: qi6.PickResultType.DROP,
          status: {
            code: j7H.Status.UNAVAILABLE,
            details: "Channel closed before call started",
            metadata: new gV1.Metadata(),
          },
          subchannel: null,
          onCallStarted: null,
          onCallEnded: null,
        };
      }
    }
    iAH.SUBCHANNEL_ARGS_EXCLUDE_KEY_PREFIX = "grpc.internal.no_subchannel";
    class bF7 {
      constructor(H) {
        (this.target = H),
          (this.trace = new xsH.ChannelzTrace()),
          (this.callTracker = new xsH.ChannelzCallTracker()),
          (this.childrenTracker = new xsH.ChannelzChildrenTracker()),
          (this.state = cC.ConnectivityState.IDLE);
      }
      getChannelzInfoCallback() {
        return () => {
          return {
            target: this.target,
            state: this.state,
            trace: this.trace,
            callTracker: this.callTracker,
            children: this.childrenTracker.getChildLists(),
          };
        };
      }
    }
    class IF7 {
      constructor(H, _, q) {
        var $, K, O, T, z, A;
        if (
          ((this.credentials = _),
          (this.options = q),
          (this.connectivityState = cC.ConnectivityState.IDLE),
          (this.currentPicker = new qi6.UnavailablePicker()),
          (this.configSelectionQueue = []),
          (this.pickQueue = []),
          (this.connectivityStateWatchers = []),
          (this.callRefTimer = null),
          (this.configSelector = null),
          (this.currentResolutionError = null),
          (this.wrappedSubchannels = new Set()),
          (this.callCount = 0),
          (this.idleTimer = null),
          (this.channelzEnabled = !0),
          (this.randomChannelId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)),
          typeof H !== "string")
        )
          throw TypeError("Channel target must be a string");
        if (!(_ instanceof mV1.ChannelCredentials))
          throw TypeError("Channel credentials must be a ChannelCredentials object");
        if (q) {
          if (typeof q !== "object") throw TypeError("Channel options must be an object");
        }
        this.channelzInfoTracker = new bF7(H);
        let f = (0, Fx_.parseUri)(H);
        if (f === null) throw Error(`Could not parse target name "${H}"`);
        let w = (0, SF7.mapUriDefaultScheme)(f);
        if (w === null) throw Error(`Could not find a default scheme for target name "${H}"`);
        if (this.options["grpc.enable_channelz"] === 0) this.channelzEnabled = !1;
        if (
          ((this.channelzRef = (0, xsH.registerChannelzChannel)(
            H,
            this.channelzInfoTracker.getChannelzInfoCallback(),
            this.channelzEnabled,
          )),
          this.channelzEnabled)
        )
          this.channelzInfoTracker.trace.addTrace("CT_INFO", "Channel created");
        if (this.options["grpc.default_authority"]) this.defaultAuthority = this.options["grpc.default_authority"];
        else this.defaultAuthority = (0, SF7.getDefaultAuthority)(w);
        let Y = (0, FV1.mapProxyName)(w, q);
        (this.target = Y.target),
          (this.options = Object.assign({}, this.options, Y.extraOptions)),
          (this.subchannelPool = (0, BV1.getSubchannelPool)(
            (($ = this.options["grpc.use_local_subchannel_pool"]) !== null && $ !== void 0 ? $ : 0) === 0,
          )),
          (this.retryBufferTracker = new _i6.MessageBufferTracker(
            (K = this.options["grpc.retry_buffer_size"]) !== null && K !== void 0 ? K : sV1,
            (O = this.options["grpc.per_rpc_retry_buffer_size"]) !== null && O !== void 0 ? O : tV1,
          )),
          (this.keepaliveTime = (T = this.options["grpc.keepalive_time_ms"]) !== null && T !== void 0 ? T : -1),
          (this.idleTimeoutMs = Math.max(
            (z = this.options["grpc.client_idle_timeout_ms"]) !== null && z !== void 0 ? z : aV1,
            oV1,
          ));
        let D = {
          createSubchannel: (M, J) => {
            let P = {};
            for (let [W, Z] of Object.entries(J)) if (!W.startsWith(iAH.SUBCHANNEL_ARGS_EXCLUDE_KEY_PREFIX)) P[W] = Z;
            let X = this.subchannelPool.getOrCreateSubchannel(this.target, M, P, this.credentials);
            if ((X.throttleKeepalive(this.keepaliveTime), this.channelzEnabled))
              this.channelzInfoTracker.trace.addTrace(
                "CT_INFO",
                "Created subchannel or used existing subchannel",
                X.getChannelzRef(),
              );
            return new EF7(X, this);
          },
          updateState: (M, J) => {
            this.currentPicker = J;
            let P = this.pickQueue.slice();
            if (((this.pickQueue = []), P.length > 0)) this.callRefTimerUnref();
            for (let X of P) X.doPick();
            this.updateState(M);
          },
          requestReresolution: () => {
            throw Error("Resolving load balancer should never call requestReresolution");
          },
          addChannelzChild: (M) => {
            if (this.channelzEnabled) this.channelzInfoTracker.childrenTracker.refChild(M);
          },
          removeChannelzChild: (M) => {
            if (this.channelzEnabled) this.channelzInfoTracker.childrenTracker.unrefChild(M);
          },
        };
        (this.resolvingLoadBalancer = new pV1.ResolvingLoadBalancer(
          this.target,
          D,
          this.options,
          (M, J) => {
            var P;
            if (M.retryThrottling)
              Ux_.set(
                this.getTarget(),
                new _i6.RetryThrottler(
                  M.retryThrottling.maxTokens,
                  M.retryThrottling.tokenRatio,
                  Ux_.get(this.getTarget()),
                ),
              );
            else Ux_.delete(this.getTarget());
            if (this.channelzEnabled)
              this.channelzInfoTracker.trace.addTrace("CT_INFO", "Address resolution succeeded");
            (P = this.configSelector) === null || P === void 0 || P.unref(),
              (this.configSelector = J),
              (this.currentResolutionError = null),
              process.nextTick(() => {
                let X = this.configSelectionQueue;
                if (((this.configSelectionQueue = []), X.length > 0)) this.callRefTimerUnref();
                for (let R of X) R.getConfig();
              });
          },
          (M) => {
            if (this.channelzEnabled)
              this.channelzInfoTracker.trace.addTrace(
                "CT_WARNING",
                "Address resolution failed with code " + M.code + ' and details "' + M.details + '"',
              );
            if (this.configSelectionQueue.length > 0)
              this.trace("Name resolution failed with calls queued for config selection");
            if (this.configSelector === null)
              this.currentResolutionError = Object.assign(
                Object.assign({}, (0, iV1.restrictControlPlaneStatusCode)(M.code, M.details)),
                { metadata: M.metadata },
              );
            let J = this.configSelectionQueue;
            if (((this.configSelectionQueue = []), J.length > 0)) this.callRefTimerUnref();
            for (let P of J) P.reportResolverError(M);
          },
        )),
          (this.filterStackFactory = new dV1.FilterStackFactory([
            new cV1.CompressionFilterFactory(this, this.options),
          ])),
          this.trace("Channel constructed with options " + JSON.stringify(q, void 0, 2));
        let j = Error();
        if ((0, cx_.isTracerEnabled)("channel_stacktrace"))
          (0, cx_.trace)(
            j7H.LogVerbosity.DEBUG,
            "channel_stacktrace",
            "(" +
              this.channelzRef.id +
              `) Channel constructed 
` +
              ((A = j.stack) === null || A === void 0
                ? void 0
                : A.substring(
                    j.stack.indexOf(`
`) + 1,
                  )),
          );
        this.lastActivityTimestamp = new Date();
      }
      trace(H, _) {
        (0, cx_.trace)(
          _ !== null && _ !== void 0 ? _ : j7H.LogVerbosity.DEBUG,
          "channel",
          "(" + this.channelzRef.id + ") " + (0, Fx_.uriToString)(this.target) + " " + H,
        );
      }
      callRefTimerRef() {
        var H, _, q, $;
        if (!this.callRefTimer) this.callRefTimer = setInterval(() => {}, rV1);
        if (!((_ = (H = this.callRefTimer).hasRef) === null || _ === void 0 ? void 0 : _.call(H)))
          this.trace(
            "callRefTimer.ref | configSelectionQueue.length=" +
              this.configSelectionQueue.length +
              " pickQueue.length=" +
              this.pickQueue.length,
          ),
            ($ = (q = this.callRefTimer).ref) === null || $ === void 0 || $.call(q);
      }
      callRefTimerUnref() {
        var H, _, q;
        if (!((H = this.callRefTimer) === null || H === void 0 ? void 0 : H.hasRef) || this.callRefTimer.hasRef())
          this.trace(
            "callRefTimer.unref | configSelectionQueue.length=" +
              this.configSelectionQueue.length +
              " pickQueue.length=" +
              this.pickQueue.length,
          ),
            (q = (_ = this.callRefTimer) === null || _ === void 0 ? void 0 : _.unref) === null ||
              q === void 0 ||
              q.call(_);
      }
      removeConnectivityStateWatcher(H) {
        let _ = this.connectivityStateWatchers.findIndex((q) => q === H);
        if (_ >= 0) this.connectivityStateWatchers.splice(_, 1);
      }
      updateState(H) {
        if (
          ((0, cx_.trace)(
            j7H.LogVerbosity.DEBUG,
            "connectivity_state",
            "(" +
              this.channelzRef.id +
              ") " +
              (0, Fx_.uriToString)(this.target) +
              " " +
              cC.ConnectivityState[this.connectivityState] +
              " -> " +
              cC.ConnectivityState[H],
          ),
          this.channelzEnabled)
        )
          this.channelzInfoTracker.trace.addTrace("CT_INFO", "Connectivity state change to " + cC.ConnectivityState[H]);
        (this.connectivityState = H), (this.channelzInfoTracker.state = H);
        let _ = this.connectivityStateWatchers.slice();
        for (let q of _)
          if (H !== q.currentState) {
            if (q.timer) clearTimeout(q.timer);
            this.removeConnectivityStateWatcher(q), q.callback();
          }
        if (H !== cC.ConnectivityState.TRANSIENT_FAILURE) this.currentResolutionError = null;
      }
      throttleKeepalive(H) {
        if (H > this.keepaliveTime) {
          this.keepaliveTime = H;
          for (let _ of this.wrappedSubchannels) _.throttleKeepalive(H);
        }
      }
      addWrappedSubchannel(H) {
        this.wrappedSubchannels.add(H);
      }
      removeWrappedSubchannel(H) {
        this.wrappedSubchannels.delete(H);
      }
      doPick(H, _) {
        return this.currentPicker.pick({ metadata: H, extraPickInfo: _ });
      }
      queueCallForPick(H) {
        this.pickQueue.push(H), this.callRefTimerRef();
      }
      getConfig(H, _) {
        if (this.connectivityState !== cC.ConnectivityState.SHUTDOWN) this.resolvingLoadBalancer.exitIdle();
        if (this.configSelector)
          return { type: "SUCCESS", config: this.configSelector.invoke(H, _, this.randomChannelId) };
        else if (this.currentResolutionError) return { type: "ERROR", error: this.currentResolutionError };
        else return { type: "NONE" };
      }
      queueCallForConfig(H) {
        this.configSelectionQueue.push(H), this.callRefTimerRef();
      }
      enterIdle() {
        if (
          (this.resolvingLoadBalancer.destroy(),
          this.updateState(cC.ConnectivityState.IDLE),
          (this.currentPicker = new qi6.QueuePicker(this.resolvingLoadBalancer)),
          this.idleTimer)
        )
          clearTimeout(this.idleTimer), (this.idleTimer = null);
        if (this.callRefTimer) clearInterval(this.callRefTimer), (this.callRefTimer = null);
      }
      startIdleTimeout(H) {
        var _, q;
        (this.idleTimer = setTimeout(() => {
          if (this.callCount > 0) {
            this.startIdleTimeout(this.idleTimeoutMs);
            return;
          }
          let K = new Date().valueOf() - this.lastActivityTimestamp.valueOf();
          if (K >= this.idleTimeoutMs)
            this.trace("Idle timer triggered after " + this.idleTimeoutMs + "ms of inactivity"), this.enterIdle();
          else this.startIdleTimeout(this.idleTimeoutMs - K);
        }, H)),
          (q = (_ = this.idleTimer).unref) === null || q === void 0 || q.call(_);
      }
      maybeStartIdleTimer() {
        if (this.connectivityState !== cC.ConnectivityState.SHUTDOWN && !this.idleTimer)
          this.startIdleTimeout(this.idleTimeoutMs);
      }
      onCallStart() {
        if (this.channelzEnabled) this.channelzInfoTracker.callTracker.addCallStarted();
        this.callCount += 1;
      }
      onCallEnd(H) {
        if (this.channelzEnabled)
          if (H.code === j7H.Status.OK) this.channelzInfoTracker.callTracker.addCallSucceeded();
          else this.channelzInfoTracker.callTracker.addCallFailed();
        (this.callCount -= 1), (this.lastActivityTimestamp = new Date()), this.maybeStartIdleTimer();
      }
      createLoadBalancingCall(H, _, q, $, K) {
        let O = (0, Hi6.getNextCallNumber)();
        return (
          this.trace("createLoadBalancingCall [" + O + '] method="' + _ + '"'),
          new UV1.LoadBalancingCall(this, H, _, q, $, K, O)
        );
      }
      createRetryingCall(H, _, q, $, K) {
        let O = (0, Hi6.getNextCallNumber)();
        return (
          this.trace("createRetryingCall [" + O + '] method="' + _ + '"'),
          new _i6.RetryingCall(this, H, _, q, $, K, O, this.retryBufferTracker, Ux_.get(this.getTarget()))
        );
      }
      createResolvingCall(H, _, q, $, K) {
        let O = (0, Hi6.getNextCallNumber)();
        this.trace("createResolvingCall [" + O + '] method="' + H + '", deadline=' + (0, QV1.deadlineToString)(_));
        let T = {
            deadline: _,
            flags: K !== null && K !== void 0 ? K : j7H.Propagate.DEFAULTS,
            host: q !== null && q !== void 0 ? q : this.defaultAuthority,
            parentCall: $,
          },
          z = new lV1.ResolvingCall(this, H, T, this.filterStackFactory.clone(), O);
        return (
          this.onCallStart(),
          z.addStatusWatcher((A) => {
            this.onCallEnd(A);
          }),
          z
        );
      }
      close() {
        var H;
        this.resolvingLoadBalancer.destroy(),
          this.updateState(cC.ConnectivityState.SHUTDOWN),
          (this.currentPicker = new CF7());
        for (let _ of this.configSelectionQueue)
          _.cancelWithStatus(j7H.Status.UNAVAILABLE, "Channel closed before call started");
        this.configSelectionQueue = [];
        for (let _ of this.pickQueue) _.cancelWithStatus(j7H.Status.UNAVAILABLE, "Channel closed before call started");
        if (((this.pickQueue = []), this.callRefTimer)) clearInterval(this.callRefTimer);
        if (this.idleTimer) clearTimeout(this.idleTimer);
        if (this.channelzEnabled) (0, xsH.unregisterChannelzRef)(this.channelzRef);
        this.subchannelPool.unrefUnusedSubchannels(),
          (H = this.configSelector) === null || H === void 0 || H.unref(),
          (this.configSelector = null);
      }
      getTarget() {
        return (0, Fx_.uriToString)(this.target);
      }
      getConnectivityState(H) {
        let _ = this.connectivityState;
        if (H)
          this.resolvingLoadBalancer.exitIdle(), (this.lastActivityTimestamp = new Date()), this.maybeStartIdleTimer();
        return _;
      }
      watchConnectivityState(H, _, q) {
        if (this.connectivityState === cC.ConnectivityState.SHUTDOWN) throw Error("Channel has been shut down");
        let $ = null;
        if (_ !== 1 / 0) {
          let O = _ instanceof Date ? _ : new Date(_),
            T = new Date();
          if (_ === -1 / 0 || O <= T) {
            process.nextTick(q, Error("Deadline passed without connectivity state change"));
            return;
          }
          $ = setTimeout(() => {
            this.removeConnectivityStateWatcher(K), q(Error("Deadline passed without connectivity state change"));
          }, O.getTime() - T.getTime());
        }
        let K = { currentState: H, callback: q, timer: $ };
        this.connectivityStateWatchers.push(K);
      }
      getChannelzRef() {
        return this.channelzRef;
      }
      createCall(H, _, q, $, K) {
        if (typeof H !== "string") throw TypeError("Channel#createCall: method must be a string");
        if (!(typeof _ === "number" || _ instanceof Date))
          throw TypeError("Channel#createCall: deadline must be a number or Date");
        if (this.connectivityState === cC.ConnectivityState.SHUTDOWN) throw Error("Channel has been shut down");
        return this.createResolvingCall(H, _, q, $, K);
      }
      getOptions() {
        return this.options;
      }
    }
    iAH.InternalChannel = IF7;
  });
