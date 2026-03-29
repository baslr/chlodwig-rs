  var lU7 = d((FsH) => {
    Object.defineProperty(FsH, "__esModule", { value: !0 });
    FsH.RoundRobinLoadBalancer = void 0;
    FsH.setup = kE1;
    var UU7 = _7H(),
      hW = TL(),
      csH = cr(),
      WE1 = DA(),
      GE1 = mK(),
      cU7 = Uv(),
      RE1 = gsH(),
      ZE1 = "round_robin";
    function FU7(H) {
      WE1.trace(GE1.LogVerbosity.DEBUG, ZE1, H);
    }
    var $m_ = "round_robin";
    class Km_ {
      getLoadBalancerName() {
        return $m_;
      }
      constructor() {}
      toJsonObject() {
        return { [$m_]: {} };
      }
      static createFromJson(H) {
        return new Km_();
      }
    }
    class QU7 {
      constructor(H, _ = 0) {
        (this.children = H), (this.nextIndex = _);
      }
      pick(H) {
        let _ = this.children[this.nextIndex].picker;
        return (this.nextIndex = (this.nextIndex + 1) % this.children.length), _.pick(H);
      }
      peekNextEndpoint() {
        return this.children[this.nextIndex].endpoint;
      }
    }
    function LE1(H, _) {
      return [...H.slice(_), ...H.slice(0, _)];
    }
    class Ci6 {
      constructor(H) {
        (this.channelControlHelper = H),
          (this.children = []),
          (this.currentState = hW.ConnectivityState.IDLE),
          (this.currentReadyPicker = null),
          (this.updatesPaused = !1),
          (this.lastError = null),
          (this.childChannelControlHelper = (0, UU7.createChildChannelControlHelper)(H, {
            updateState: (_, q, $) => {
              if (this.currentState === hW.ConnectivityState.READY && _ !== hW.ConnectivityState.READY)
                this.channelControlHelper.requestReresolution();
              if ($) this.lastError = $;
              this.calculateAndUpdateState();
            },
          }));
      }
      countChildrenWithState(H) {
        return this.children.filter((_) => _.getConnectivityState() === H).length;
      }
      calculateAndUpdateState() {
        if (this.updatesPaused) return;
        if (this.countChildrenWithState(hW.ConnectivityState.READY) > 0) {
          let H = this.children.filter((q) => q.getConnectivityState() === hW.ConnectivityState.READY),
            _ = 0;
          if (this.currentReadyPicker !== null) {
            let q = this.currentReadyPicker.peekNextEndpoint();
            if (((_ = H.findIndex(($) => (0, cU7.endpointEqual)($.getEndpoint(), q))), _ < 0)) _ = 0;
          }
          this.updateState(
            hW.ConnectivityState.READY,
            new QU7(
              H.map((q) => ({ endpoint: q.getEndpoint(), picker: q.getPicker() })),
              _,
            ),
            null,
          );
        } else if (this.countChildrenWithState(hW.ConnectivityState.CONNECTING) > 0)
          this.updateState(hW.ConnectivityState.CONNECTING, new csH.QueuePicker(this), null);
        else if (this.countChildrenWithState(hW.ConnectivityState.TRANSIENT_FAILURE) > 0) {
          let H = `round_robin: No connection established. Last error: ${this.lastError}`;
          this.updateState(hW.ConnectivityState.TRANSIENT_FAILURE, new csH.UnavailablePicker({ details: H }), H);
        } else this.updateState(hW.ConnectivityState.IDLE, new csH.QueuePicker(this), null);
        for (let H of this.children) if (H.getConnectivityState() === hW.ConnectivityState.IDLE) H.exitIdle();
      }
      updateState(H, _, q) {
        if (
          (FU7(hW.ConnectivityState[this.currentState] + " -> " + hW.ConnectivityState[H]),
          H === hW.ConnectivityState.READY)
        )
          this.currentReadyPicker = _;
        else this.currentReadyPicker = null;
        (this.currentState = H), this.channelControlHelper.updateState(H, _, q);
      }
      resetSubchannelList() {
        for (let H of this.children) H.destroy();
        this.children = [];
      }
      updateAddressList(H, _, q, $) {
        if (!(_ instanceof Km_)) return !1;
        if (!H.ok) {
          if (this.children.length === 0)
            this.updateState(
              hW.ConnectivityState.TRANSIENT_FAILURE,
              new csH.UnavailablePicker(H.error),
              H.error.details,
            );
          return !0;
        }
        let K = (Math.random() * H.value.length) | 0,
          O = LE1(H.value, K);
        if ((this.resetSubchannelList(), O.length === 0)) {
          let T = `No addresses resolved. Resolution note: ${$}`;
          this.updateState(hW.ConnectivityState.TRANSIENT_FAILURE, new csH.UnavailablePicker({ details: T }), T);
        }
        FU7("Connect to endpoint list " + O.map(cU7.endpointToString)),
          (this.updatesPaused = !0),
          (this.children = O.map((T) => new RE1.LeafLoadBalancer(T, this.childChannelControlHelper, q, $)));
        for (let T of this.children) T.startConnecting();
        return (this.updatesPaused = !1), this.calculateAndUpdateState(), !0;
      }
      exitIdle() {}
      resetBackoff() {}
      destroy() {
        this.resetSubchannelList();
      }
      getTypeName() {
        return $m_;
      }
    }
    FsH.RoundRobinLoadBalancer = Ci6;
    function kE1() {
      (0, UU7.registerLoadBalancerType)($m_, Ci6, Km_);
    }
  });
