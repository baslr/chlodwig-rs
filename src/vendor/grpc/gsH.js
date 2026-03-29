  var gsH = d((rc) => {
    Object.defineProperty(rc, "__esModule", { value: !0 });
    rc.LeafLoadBalancer = rc.PickFirstLoadBalancer = rc.PickFirstLoadBalancingConfig = void 0;
    rc.shuffled = kU7;
    rc.setup = rS1;
    var Ri6 = _7H(),
      b2 = TL(),
      P7H = cr(),
      GU7 = Uv(),
      cS1 = DA(),
      FS1 = mK(),
      RU7 = Uv(),
      ZU7 = require("net"),
      US1 = uAH(),
      QS1 = "pick_first";
    function psH(H) {
      cS1.trace(FS1.LogVerbosity.DEBUG, QS1, H);
    }
    var BsH = "pick_first",
      lS1 = 250;
    class gNH {
      constructor(H) {
        this.shuffleAddressList = H;
      }
      getLoadBalancerName() {
        return BsH;
      }
      toJsonObject() {
        return { [BsH]: { shuffleAddressList: this.shuffleAddressList } };
      }
      getShuffleAddressList() {
        return this.shuffleAddressList;
      }
      static createFromJson(H) {
        if ("shuffleAddressList" in H && typeof H.shuffleAddressList !== "boolean")
          throw Error("pick_first config field shuffleAddressList must be a boolean if provided");
        return new gNH(H.shuffleAddressList === !0);
      }
    }
    rc.PickFirstLoadBalancingConfig = gNH;
    class LU7 {
      constructor(H) {
        this.subchannel = H;
      }
      pick(H) {
        return {
          pickResultType: P7H.PickResultType.COMPLETE,
          subchannel: this.subchannel,
          status: null,
          onCallStarted: null,
          onCallEnded: null,
        };
      }
    }
    function kU7(H) {
      let _ = H.slice();
      for (let q = _.length - 1; q > 1; q--) {
        let $ = Math.floor(Math.random() * (q + 1)),
          K = _[q];
        (_[q] = _[$]), (_[$] = K);
      }
      return _;
    }
    function iS1(H) {
      if (H.length === 0) return [];
      let _ = [],
        q = [],
        $ = [],
        K = (0, RU7.isTcpSubchannelAddress)(H[0]) && (0, ZU7.isIPv6)(H[0].host);
      for (let z of H)
        if ((0, RU7.isTcpSubchannelAddress)(z) && (0, ZU7.isIPv6)(z.host)) q.push(z);
        else $.push(z);
      let O = K ? q : $,
        T = K ? $ : q;
      for (let z = 0; z < Math.max(O.length, T.length); z++) {
        if (z < O.length) _.push(O[z]);
        if (z < T.length) _.push(T[z]);
      }
      return _;
    }
    var vU7 = "grpc-node.internal.pick-first.report_health_status";
    class tx_ {
      constructor(H) {
        (this.channelControlHelper = H),
          (this.children = []),
          (this.currentState = b2.ConnectivityState.IDLE),
          (this.currentSubchannelIndex = 0),
          (this.currentPick = null),
          (this.subchannelStateListener = (_, q, $, K, O) => {
            this.onSubchannelStateUpdate(_, q, $, O);
          }),
          (this.pickedSubchannelHealthListener = () => this.calculateAndReportNewState()),
          (this.stickyTransientFailureMode = !1),
          (this.reportHealthStatus = !1),
          (this.lastError = null),
          (this.latestAddressList = null),
          (this.latestOptions = {}),
          (this.latestResolutionNote = ""),
          (this.connectionDelayTimeout = setTimeout(() => {}, 0)),
          clearTimeout(this.connectionDelayTimeout);
      }
      allChildrenHaveReportedTF() {
        return this.children.every((H) => H.hasReportedTransientFailure);
      }
      resetChildrenReportedTF() {
        this.children.every((H) => (H.hasReportedTransientFailure = !1));
      }
      calculateAndReportNewState() {
        var H;
        if (this.currentPick)
          if (this.reportHealthStatus && !this.currentPick.isHealthy()) {
            let _ = `Picked subchannel ${this.currentPick.getAddress()} is unhealthy`;
            this.updateState(b2.ConnectivityState.TRANSIENT_FAILURE, new P7H.UnavailablePicker({ details: _ }), _);
          } else this.updateState(b2.ConnectivityState.READY, new LU7(this.currentPick), null);
        else if (((H = this.latestAddressList) === null || H === void 0 ? void 0 : H.length) === 0) {
          let _ = `No connection established. Last error: ${this.lastError}. Resolution note: ${this.latestResolutionNote}`;
          this.updateState(b2.ConnectivityState.TRANSIENT_FAILURE, new P7H.UnavailablePicker({ details: _ }), _);
        } else if (this.children.length === 0)
          this.updateState(b2.ConnectivityState.IDLE, new P7H.QueuePicker(this), null);
        else if (this.stickyTransientFailureMode) {
          let _ = `No connection established. Last error: ${this.lastError}. Resolution note: ${this.latestResolutionNote}`;
          this.updateState(b2.ConnectivityState.TRANSIENT_FAILURE, new P7H.UnavailablePicker({ details: _ }), _);
        } else this.updateState(b2.ConnectivityState.CONNECTING, new P7H.QueuePicker(this), null);
      }
      requestReresolution() {
        this.channelControlHelper.requestReresolution();
      }
      maybeEnterStickyTransientFailureMode() {
        if (!this.allChildrenHaveReportedTF()) return;
        if ((this.requestReresolution(), this.resetChildrenReportedTF(), this.stickyTransientFailureMode)) {
          this.calculateAndReportNewState();
          return;
        }
        this.stickyTransientFailureMode = !0;
        for (let { subchannel: H } of this.children) H.startConnecting();
        this.calculateAndReportNewState();
      }
      removeCurrentPick() {
        if (this.currentPick !== null)
          this.currentPick.removeConnectivityStateListener(this.subchannelStateListener),
            this.channelControlHelper.removeChannelzChild(this.currentPick.getChannelzRef()),
            this.currentPick.removeHealthStateWatcher(this.pickedSubchannelHealthListener),
            this.currentPick.unref(),
            (this.currentPick = null);
      }
      onSubchannelStateUpdate(H, _, q, $) {
        var K;
        if ((K = this.currentPick) === null || K === void 0 ? void 0 : K.realSubchannelEquals(H)) {
          if (q !== b2.ConnectivityState.READY) this.removeCurrentPick(), this.calculateAndReportNewState();
          return;
        }
        for (let [O, T] of this.children.entries())
          if (H.realSubchannelEquals(T.subchannel)) {
            if (q === b2.ConnectivityState.READY) this.pickSubchannel(T.subchannel);
            if (q === b2.ConnectivityState.TRANSIENT_FAILURE) {
              if (((T.hasReportedTransientFailure = !0), $)) this.lastError = $;
              if ((this.maybeEnterStickyTransientFailureMode(), O === this.currentSubchannelIndex))
                this.startNextSubchannelConnecting(O + 1);
            }
            T.subchannel.startConnecting();
            return;
          }
      }
      startNextSubchannelConnecting(H) {
        clearTimeout(this.connectionDelayTimeout);
        for (let [_, q] of this.children.entries())
          if (_ >= H) {
            let $ = q.subchannel.getConnectivityState();
            if ($ === b2.ConnectivityState.IDLE || $ === b2.ConnectivityState.CONNECTING) {
              this.startConnecting(_);
              return;
            }
          }
        this.maybeEnterStickyTransientFailureMode();
      }
      startConnecting(H) {
        var _, q;
        if (
          (clearTimeout(this.connectionDelayTimeout),
          (this.currentSubchannelIndex = H),
          this.children[H].subchannel.getConnectivityState() === b2.ConnectivityState.IDLE)
        )
          psH("Start connecting to subchannel with address " + this.children[H].subchannel.getAddress()),
            process.nextTick(() => {
              var $;
              ($ = this.children[H]) === null || $ === void 0 || $.subchannel.startConnecting();
            });
        (this.connectionDelayTimeout = setTimeout(() => {
          this.startNextSubchannelConnecting(H + 1);
        }, lS1)),
          (q = (_ = this.connectionDelayTimeout).unref) === null || q === void 0 || q.call(_);
      }
      pickSubchannel(H) {
        psH("Pick subchannel with address " + H.getAddress()),
          (this.stickyTransientFailureMode = !1),
          H.ref(),
          this.channelControlHelper.addChannelzChild(H.getChannelzRef()),
          this.removeCurrentPick(),
          this.resetSubchannelList(),
          H.addConnectivityStateListener(this.subchannelStateListener),
          H.addHealthStateWatcher(this.pickedSubchannelHealthListener),
          (this.currentPick = H),
          clearTimeout(this.connectionDelayTimeout),
          this.calculateAndReportNewState();
      }
      updateState(H, _, q) {
        psH(b2.ConnectivityState[this.currentState] + " -> " + b2.ConnectivityState[H]),
          (this.currentState = H),
          this.channelControlHelper.updateState(H, _, q);
      }
      resetSubchannelList() {
        for (let H of this.children)
          H.subchannel.removeConnectivityStateListener(this.subchannelStateListener),
            H.subchannel.unref(),
            this.channelControlHelper.removeChannelzChild(H.subchannel.getChannelzRef());
        (this.currentSubchannelIndex = 0), (this.children = []);
      }
      connectToAddressList(H, _) {
        psH("connectToAddressList([" + H.map(($) => (0, GU7.subchannelAddressToString)($)) + "])");
        let q = H.map(($) => ({
          subchannel: this.channelControlHelper.createSubchannel($, _),
          hasReportedTransientFailure: !1,
        }));
        for (let { subchannel: $ } of q)
          if ($.getConnectivityState() === b2.ConnectivityState.READY) {
            this.pickSubchannel($);
            return;
          }
        for (let { subchannel: $ } of q) $.ref(), this.channelControlHelper.addChannelzChild($.getChannelzRef());
        this.resetSubchannelList(), (this.children = q);
        for (let { subchannel: $ } of this.children) $.addConnectivityStateListener(this.subchannelStateListener);
        for (let $ of this.children)
          if ($.subchannel.getConnectivityState() === b2.ConnectivityState.TRANSIENT_FAILURE)
            $.hasReportedTransientFailure = !0;
        this.startNextSubchannelConnecting(0), this.calculateAndReportNewState();
      }
      updateAddressList(H, _, q, $) {
        if (!(_ instanceof gNH)) return !1;
        if (!H.ok) {
          if (this.children.length === 0 && this.currentPick === null)
            this.channelControlHelper.updateState(
              b2.ConnectivityState.TRANSIENT_FAILURE,
              new P7H.UnavailablePicker(H.error),
              H.error.details,
            );
          return !0;
        }
        let K = H.value;
        if (((this.reportHealthStatus = q[vU7]), _.getShuffleAddressList())) K = kU7(K);
        let O = [].concat(...K.map((z) => z.addresses));
        psH("updateAddressList([" + O.map((z) => (0, GU7.subchannelAddressToString)(z)) + "])");
        let T = iS1(O);
        if (
          ((this.latestAddressList = T),
          (this.latestOptions = q),
          this.connectToAddressList(T, q),
          (this.latestResolutionNote = $),
          O.length > 0)
        )
          return !0;
        else return (this.lastError = "No addresses resolved"), !1;
      }
      exitIdle() {
        if (this.currentState === b2.ConnectivityState.IDLE && this.latestAddressList)
          this.connectToAddressList(this.latestAddressList, this.latestOptions);
      }
      resetBackoff() {}
      destroy() {
        this.resetSubchannelList(), this.removeCurrentPick();
      }
      getTypeName() {
        return BsH;
      }
    }
    rc.PickFirstLoadBalancer = tx_;
    var nS1 = new gNH(!1);
    class NU7 {
      constructor(H, _, q, $) {
        (this.endpoint = H),
          (this.options = q),
          (this.resolutionNote = $),
          (this.latestState = b2.ConnectivityState.IDLE);
        let K = (0, Ri6.createChildChannelControlHelper)(_, {
          updateState: (O, T, z) => {
            (this.latestState = O), (this.latestPicker = T), _.updateState(O, T, z);
          },
        });
        (this.pickFirstBalancer = new tx_(K)), (this.latestPicker = new P7H.QueuePicker(this.pickFirstBalancer));
      }
      startConnecting() {
        this.pickFirstBalancer.updateAddressList(
          (0, US1.statusOrFromValue)([this.endpoint]),
          nS1,
          Object.assign(Object.assign({}, this.options), { [vU7]: !0 }),
          this.resolutionNote,
        );
      }
      updateEndpoint(H, _) {
        if (((this.options = _), (this.endpoint = H), this.latestState !== b2.ConnectivityState.IDLE))
          this.startConnecting();
      }
      getConnectivityState() {
        return this.latestState;
      }
      getPicker() {
        return this.latestPicker;
      }
      getEndpoint() {
        return this.endpoint;
      }
      exitIdle() {
        this.pickFirstBalancer.exitIdle();
      }
      destroy() {
        this.pickFirstBalancer.destroy();
      }
    }
    rc.LeafLoadBalancer = NU7;
    function rS1() {
      (0, Ri6.registerLoadBalancerType)(BsH, tx_, gNH), (0, Ri6.registerDefaultLoadBalancerType)(BsH);
    }
  });
