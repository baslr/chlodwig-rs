  var HF7 = d((yx_) => {
    Object.defineProperty(yx_, "__esModule", { value: !0 });
    yx_.Subchannel = void 0;
    var Rz = TL(),
      Ly1 = DNH(),
      Fl6 = DA(),
      hx_ = mK(),
      ky1 = OL(),
      vy1 = Uv(),
      lc = w7H(),
      Ny1 = tc7(),
      hy1 = "subchannel",
      yy1 = 2147483647;
    class ec7 {
      constructor(H, _, q, $, K) {
        var O;
        (this.channelTarget = H),
          (this.subchannelAddress = _),
          (this.options = q),
          (this.connector = K),
          (this.connectivityState = Rz.ConnectivityState.IDLE),
          (this.transport = null),
          (this.continueConnecting = !1),
          (this.stateListeners = new Set()),
          (this.refcount = 0),
          (this.channelzEnabled = !0),
          (this.dataProducers = new Map()),
          (this.subchannelChannel = null);
        let T = { initialDelay: q["grpc.initial_reconnect_backoff_ms"], maxDelay: q["grpc.max_reconnect_backoff_ms"] };
        if (
          ((this.backoffTimeout = new Ly1.BackoffTimeout(() => {
            this.handleBackoffTimer();
          }, T)),
          this.backoffTimeout.unref(),
          (this.subchannelAddressString = (0, vy1.subchannelAddressToString)(_)),
          (this.keepaliveTime = (O = q["grpc.keepalive_time_ms"]) !== null && O !== void 0 ? O : -1),
          q["grpc.enable_channelz"] === 0)
        )
          (this.channelzEnabled = !1),
            (this.channelzTrace = new lc.ChannelzTraceStub()),
            (this.callTracker = new lc.ChannelzCallTrackerStub()),
            (this.childrenTracker = new lc.ChannelzChildrenTrackerStub()),
            (this.streamTracker = new lc.ChannelzCallTrackerStub());
        else
          (this.channelzTrace = new lc.ChannelzTrace()),
            (this.callTracker = new lc.ChannelzCallTracker()),
            (this.childrenTracker = new lc.ChannelzChildrenTracker()),
            (this.streamTracker = new lc.ChannelzCallTracker());
        (this.channelzRef = (0, lc.registerChannelzSubchannel)(
          this.subchannelAddressString,
          () => this.getChannelzInfo(),
          this.channelzEnabled,
        )),
          this.channelzTrace.addTrace("CT_INFO", "Subchannel created"),
          this.trace("Subchannel constructed with options " + JSON.stringify(q, void 0, 2)),
          (this.secureConnector = $._createSecureConnector(H, q));
      }
      getChannelzInfo() {
        return {
          state: this.connectivityState,
          trace: this.channelzTrace,
          callTracker: this.callTracker,
          children: this.childrenTracker.getChildLists(),
          target: this.subchannelAddressString,
        };
      }
      trace(H) {
        Fl6.trace(
          hx_.LogVerbosity.DEBUG,
          hy1,
          "(" + this.channelzRef.id + ") " + this.subchannelAddressString + " " + H,
        );
      }
      refTrace(H) {
        Fl6.trace(
          hx_.LogVerbosity.DEBUG,
          "subchannel_refcount",
          "(" + this.channelzRef.id + ") " + this.subchannelAddressString + " " + H,
        );
      }
      handleBackoffTimer() {
        if (this.continueConnecting)
          this.transitionToState([Rz.ConnectivityState.TRANSIENT_FAILURE], Rz.ConnectivityState.CONNECTING);
        else this.transitionToState([Rz.ConnectivityState.TRANSIENT_FAILURE], Rz.ConnectivityState.IDLE);
      }
      startBackoff() {
        this.backoffTimeout.runOnce();
      }
      stopBackoff() {
        this.backoffTimeout.stop(), this.backoffTimeout.reset();
      }
      startConnectingInternal() {
        let H = this.options;
        if (H["grpc.keepalive_time_ms"]) {
          let _ = Math.min(this.keepaliveTime, yy1);
          H = Object.assign(Object.assign({}, H), { "grpc.keepalive_time_ms": _ });
        }
        this.connector.connect(this.subchannelAddress, this.secureConnector, H).then(
          (_) => {
            if (this.transitionToState([Rz.ConnectivityState.CONNECTING], Rz.ConnectivityState.READY)) {
              if (((this.transport = _), this.channelzEnabled)) this.childrenTracker.refChild(_.getChannelzRef());
              _.addDisconnectListener((q) => {
                if (
                  (this.transitionToState([Rz.ConnectivityState.READY], Rz.ConnectivityState.IDLE),
                  q && this.keepaliveTime > 0)
                )
                  (this.keepaliveTime *= 2),
                    Fl6.log(
                      hx_.LogVerbosity.ERROR,
                      `Connection to ${(0, ky1.uriToString)(this.channelTarget)} at ${this.subchannelAddressString} rejected by server because of excess pings. Increasing ping interval to ${this.keepaliveTime} ms`,
                    );
              });
            } else _.shutdown();
          },
          (_) => {
            this.transitionToState([Rz.ConnectivityState.CONNECTING], Rz.ConnectivityState.TRANSIENT_FAILURE, `${_}`);
          },
        );
      }
      transitionToState(H, _, q) {
        var $, K;
        if (H.indexOf(this.connectivityState) === -1) return !1;
        if (q)
          this.trace(
            Rz.ConnectivityState[this.connectivityState] + " -> " + Rz.ConnectivityState[_] + ' with error "' + q + '"',
          );
        else this.trace(Rz.ConnectivityState[this.connectivityState] + " -> " + Rz.ConnectivityState[_]);
        if (this.channelzEnabled)
          this.channelzTrace.addTrace("CT_INFO", "Connectivity state change to " + Rz.ConnectivityState[_]);
        let O = this.connectivityState;
        switch (((this.connectivityState = _), _)) {
          case Rz.ConnectivityState.READY:
            this.stopBackoff();
            break;
          case Rz.ConnectivityState.CONNECTING:
            this.startBackoff(), this.startConnectingInternal(), (this.continueConnecting = !1);
            break;
          case Rz.ConnectivityState.TRANSIENT_FAILURE:
            if (this.channelzEnabled && this.transport)
              this.childrenTracker.unrefChild(this.transport.getChannelzRef());
            if (
              (($ = this.transport) === null || $ === void 0 || $.shutdown(),
              (this.transport = null),
              !this.backoffTimeout.isRunning())
            )
              process.nextTick(() => {
                this.handleBackoffTimer();
              });
            break;
          case Rz.ConnectivityState.IDLE:
            if (this.channelzEnabled && this.transport)
              this.childrenTracker.unrefChild(this.transport.getChannelzRef());
            (K = this.transport) === null || K === void 0 || K.shutdown(), (this.transport = null);
            break;
          default:
            throw Error(`Invalid state: unknown ConnectivityState ${_}`);
        }
        for (let T of this.stateListeners) T(this, O, _, this.keepaliveTime, q);
        return !0;
      }
      ref() {
        this.refTrace("refcount " + this.refcount + " -> " + (this.refcount + 1)), (this.refcount += 1);
      }
      unref() {
        if (
          (this.refTrace("refcount " + this.refcount + " -> " + (this.refcount - 1)),
          (this.refcount -= 1),
          this.refcount === 0)
        )
          this.channelzTrace.addTrace("CT_INFO", "Shutting down"),
            (0, lc.unregisterChannelzRef)(this.channelzRef),
            this.secureConnector.destroy(),
            process.nextTick(() => {
              this.transitionToState(
                [Rz.ConnectivityState.CONNECTING, Rz.ConnectivityState.READY],
                Rz.ConnectivityState.IDLE,
              );
            });
      }
      unrefIfOneRef() {
        if (this.refcount === 1) return this.unref(), !0;
        return !1;
      }
      createCall(H, _, q, $) {
        if (!this.transport) throw Error("Cannot create call, subchannel not READY");
        let K;
        if (this.channelzEnabled)
          this.callTracker.addCallStarted(),
            this.streamTracker.addCallStarted(),
            (K = {
              onCallEnd: (O) => {
                if (O.code === hx_.Status.OK) this.callTracker.addCallSucceeded();
                else this.callTracker.addCallFailed();
              },
            });
        else K = {};
        return this.transport.createCall(H, _, q, $, K);
      }
      startConnecting() {
        process.nextTick(() => {
          if (!this.transitionToState([Rz.ConnectivityState.IDLE], Rz.ConnectivityState.CONNECTING)) {
            if (this.connectivityState === Rz.ConnectivityState.TRANSIENT_FAILURE) this.continueConnecting = !0;
          }
        });
      }
      getConnectivityState() {
        return this.connectivityState;
      }
      addConnectivityStateListener(H) {
        this.stateListeners.add(H);
      }
      removeConnectivityStateListener(H) {
        this.stateListeners.delete(H);
      }
      resetBackoff() {
        process.nextTick(() => {
          this.backoffTimeout.reset(),
            this.transitionToState([Rz.ConnectivityState.TRANSIENT_FAILURE], Rz.ConnectivityState.CONNECTING);
        });
      }
      getAddress() {
        return this.subchannelAddressString;
      }
      getChannelzRef() {
        return this.channelzRef;
      }
      isHealthy() {
        return !0;
      }
      addHealthStateWatcher(H) {}
      removeHealthStateWatcher(H) {}
      getRealSubchannel() {
        return this;
      }
      realSubchannelEquals(H) {
        return H.getRealSubchannel() === this;
      }
      throttleKeepalive(H) {
        if (H > this.keepaliveTime) this.keepaliveTime = H;
      }
      getCallCredentials() {
        return this.secureConnector.getCallCredentials();
      }
      getChannel() {
        if (!this.subchannelChannel)
          this.subchannelChannel = new Ny1.SingleSubchannelChannel(this, this.channelTarget, this.options);
        return this.subchannelChannel;
      }
      addDataWatcher(H) {
        throw Error("Not implemented");
      }
      getOrCreateDataProducer(H, _) {
        let q = this.dataProducers.get(H);
        if (q) return q;
        let $ = _(this);
        return this.dataProducers.set(H, $), $;
      }
      removeDataProducer(H) {
        this.dataProducers.delete(H);
      }
    }
    yx_.Subchannel = ec7;
  });
