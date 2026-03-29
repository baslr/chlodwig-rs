  var TQ7 = d((isH) => {
    Object.defineProperty(isH, "__esModule", { value: !0 });
    isH.WeightedRoundRobinLoadBalancingConfig = void 0;
    isH.setup = lE1;
    var kP = TL(),
      xE1 = mK(),
      oy = msH(),
      qQ7 = _7H(),
      mE1 = gsH(),
      pE1 = DA(),
      $Q7 = nx_(),
      FNH = cr(),
      BE1 = eU7(),
      HQ7 = Uv(),
      gE1 = "weighted_round_robin";
    function gi6(H) {
      pE1.trace(xE1.LogVerbosity.DEBUG, gE1, H);
    }
    var di6 = "weighted_round_robin",
      dE1 = 1e4,
      cE1 = 1e4,
      FE1 = 180000,
      UE1 = 1000,
      QE1 = 1;
    function _Q7(H, _, q) {
      if (_ in H && H[_] !== void 0 && typeof H[_] !== q)
        throw Error(`weighted round robin config ${_} parse error: expected ${q}, got ${typeof H[_]}`);
    }
    function Am_(H, _) {
      if (_ in H && H[_] !== void 0 && H[_] !== null) {
        let q;
        if ((0, oy.isDuration)(H[_])) q = H[_];
        else if ((0, oy.isDurationMessage)(H[_])) q = (0, oy.durationMessageToDuration)(H[_]);
        else if (typeof H[_] === "string") {
          let $ = (0, oy.parseDuration)(H[_]);
          if (!$) throw Error(`weighted round robin config ${_}: failed to parse duration string ${H[_]}`);
          q = $;
        } else throw Error(`weighted round robin config ${_}: expected duration, got ${typeof H[_]}`);
        return (0, oy.durationToMs)(q);
      }
      return null;
    }
    class lsH {
      constructor(H, _, q, $, K, O) {
        (this.enableOobLoadReport = H !== null && H !== void 0 ? H : !1),
          (this.oobLoadReportingPeriodMs = _ !== null && _ !== void 0 ? _ : dE1),
          (this.blackoutPeriodMs = q !== null && q !== void 0 ? q : cE1),
          (this.weightExpirationPeriodMs = $ !== null && $ !== void 0 ? $ : FE1),
          (this.weightUpdatePeriodMs = Math.max(K !== null && K !== void 0 ? K : UE1, 100)),
          (this.errorUtilizationPenalty = O !== null && O !== void 0 ? O : QE1);
      }
      getLoadBalancerName() {
        return di6;
      }
      toJsonObject() {
        return {
          enable_oob_load_report: this.enableOobLoadReport,
          oob_load_reporting_period: (0, oy.durationToString)((0, oy.msToDuration)(this.oobLoadReportingPeriodMs)),
          blackout_period: (0, oy.durationToString)((0, oy.msToDuration)(this.blackoutPeriodMs)),
          weight_expiration_period: (0, oy.durationToString)((0, oy.msToDuration)(this.weightExpirationPeriodMs)),
          weight_update_period: (0, oy.durationToString)((0, oy.msToDuration)(this.weightUpdatePeriodMs)),
          error_utilization_penalty: this.errorUtilizationPenalty,
        };
      }
      static createFromJson(H) {
        if (
          (_Q7(H, "enable_oob_load_report", "boolean"),
          _Q7(H, "error_utilization_penalty", "number"),
          H.error_utilization_penalty < 0)
        )
          throw Error("weighted round robin config error_utilization_penalty < 0");
        return new lsH(
          H.enable_oob_load_report,
          Am_(H, "oob_load_reporting_period"),
          Am_(H, "blackout_period"),
          Am_(H, "weight_expiration_period"),
          Am_(H, "weight_update_period"),
          H.error_utilization_penalty,
        );
      }
      getEnableOobLoadReport() {
        return this.enableOobLoadReport;
      }
      getOobLoadReportingPeriodMs() {
        return this.oobLoadReportingPeriodMs;
      }
      getBlackoutPeriodMs() {
        return this.blackoutPeriodMs;
      }
      getWeightExpirationPeriodMs() {
        return this.weightExpirationPeriodMs;
      }
      getWeightUpdatePeriodMs() {
        return this.weightUpdatePeriodMs;
      }
      getErrorUtilizationPenalty() {
        return this.errorUtilizationPenalty;
      }
    }
    isH.WeightedRoundRobinLoadBalancingConfig = lsH;
    class KQ7 {
      constructor(H, _) {
        (this.metricsHandler = _), (this.queue = new BE1.PriorityQueue((K, O) => K.deadline < O.deadline));
        let q = H.filter((K) => K.weight > 0),
          $;
        if (q.length < 2) $ = 1;
        else {
          let K = 0;
          for (let { weight: O } of q) K += O;
          $ = K / q.length;
        }
        for (let K of H) {
          let O = K.weight > 0 ? 1 / K.weight : $;
          this.queue.push({ endpointName: K.endpointName, picker: K.picker, period: O, deadline: Math.random() * O });
        }
      }
      pick(H) {
        let _ = this.queue.pop();
        this.queue.push(Object.assign(Object.assign({}, _), { deadline: _.deadline + _.period }));
        let q = _.picker.pick(H);
        if (q.pickResultType === FNH.PickResultType.COMPLETE)
          if (this.metricsHandler)
            return Object.assign(Object.assign({}, q), {
              onCallEnded: (0, $Q7.createMetricsReader)(($) => this.metricsHandler($, _.endpointName), q.onCallEnded),
            });
          else {
            let $ = q.subchannel;
            return Object.assign(Object.assign({}, q), { subchannel: $.getWrappedSubchannel() });
          }
        else return q;
      }
    }
    class OQ7 {
      constructor(H) {
        (this.channelControlHelper = H),
          (this.latestConfig = null),
          (this.children = new Map()),
          (this.currentState = kP.ConnectivityState.IDLE),
          (this.updatesPaused = !1),
          (this.lastError = null),
          (this.weightUpdateTimer = null);
      }
      countChildrenWithState(H) {
        let _ = 0;
        for (let q of this.children.values()) if (q.child.getConnectivityState() === H) _ += 1;
        return _;
      }
      updateWeight(H, _) {
        var q, $;
        let { rps_fractional: K, application_utilization: O } = _;
        if (O > 0 && K > 0)
          O +=
            (_.eps / K) *
            (($ = (q = this.latestConfig) === null || q === void 0 ? void 0 : q.getErrorUtilizationPenalty()) !==
              null && $ !== void 0
              ? $
              : 0);
        let T = O === 0 ? 0 : K / O;
        if (T === 0) return;
        let z = new Date();
        if (H.nonEmptySince === null) H.nonEmptySince = z;
        (H.lastUpdated = z), (H.weight = T);
      }
      getWeight(H) {
        if (!this.latestConfig) return 0;
        let _ = new Date().getTime();
        if (_ - H.lastUpdated.getTime() >= this.latestConfig.getWeightExpirationPeriodMs())
          return (H.nonEmptySince = null), 0;
        let q = this.latestConfig.getBlackoutPeriodMs();
        if (q > 0 && (H.nonEmptySince === null || _ - H.nonEmptySince.getTime() < q)) return 0;
        return H.weight;
      }
      calculateAndUpdateState() {
        if (this.updatesPaused || !this.latestConfig) return;
        if (this.countChildrenWithState(kP.ConnectivityState.READY) > 0) {
          let H = [];
          for (let [q, $] of this.children) {
            if ($.child.getConnectivityState() !== kP.ConnectivityState.READY) continue;
            H.push({ endpointName: q, picker: $.child.getPicker(), weight: this.getWeight($) });
          }
          gi6("Created picker with weights: " + H.map((q) => q.endpointName + ":" + q.weight).join(","));
          let _;
          if (!this.latestConfig.getEnableOobLoadReport())
            _ = (q, $) => {
              let K = this.children.get($);
              if (K) this.updateWeight(K, q);
            };
          else _ = null;
          this.updateState(kP.ConnectivityState.READY, new KQ7(H, _), null);
        } else if (this.countChildrenWithState(kP.ConnectivityState.CONNECTING) > 0)
          this.updateState(kP.ConnectivityState.CONNECTING, new FNH.QueuePicker(this), null);
        else if (this.countChildrenWithState(kP.ConnectivityState.TRANSIENT_FAILURE) > 0) {
          let H = `weighted_round_robin: No connection established. Last error: ${this.lastError}`;
          this.updateState(kP.ConnectivityState.TRANSIENT_FAILURE, new FNH.UnavailablePicker({ details: H }), H);
        } else this.updateState(kP.ConnectivityState.IDLE, new FNH.QueuePicker(this), null);
        for (let { child: H } of this.children.values())
          if (H.getConnectivityState() === kP.ConnectivityState.IDLE) H.exitIdle();
      }
      updateState(H, _, q) {
        gi6(kP.ConnectivityState[this.currentState] + " -> " + kP.ConnectivityState[H]),
          (this.currentState = H),
          this.channelControlHelper.updateState(H, _, q);
      }
      updateAddressList(H, _, q, $) {
        var K, O;
        if (!(_ instanceof lsH)) return !1;
        if (!H.ok) {
          if (this.children.size === 0)
            this.updateState(
              kP.ConnectivityState.TRANSIENT_FAILURE,
              new FNH.UnavailablePicker(H.error),
              H.error.details,
            );
          return !0;
        }
        if (H.value.length === 0) {
          let A = `No addresses resolved. Resolution note: ${$}`;
          return (
            this.updateState(kP.ConnectivityState.TRANSIENT_FAILURE, new FNH.UnavailablePicker({ details: A }), A), !1
          );
        }
        gi6("Connect to endpoint list " + H.value.map(HQ7.endpointToString));
        let T = new Date(),
          z = new Set();
        (this.updatesPaused = !0), (this.latestConfig = _);
        for (let A of H.value) {
          let f = (0, HQ7.endpointToString)(A);
          z.add(f);
          let w = this.children.get(f);
          if (!w)
            (w = {
              child: new mE1.LeafLoadBalancer(
                A,
                (0, qQ7.createChildChannelControlHelper)(this.channelControlHelper, {
                  updateState: (Y, D, j) => {
                    if (this.currentState === kP.ConnectivityState.READY && Y !== kP.ConnectivityState.READY)
                      this.channelControlHelper.requestReresolution();
                    if (Y === kP.ConnectivityState.READY) w.nonEmptySince = null;
                    if (j) this.lastError = j;
                    this.calculateAndUpdateState();
                  },
                  createSubchannel: (Y, D) => {
                    let j = this.channelControlHelper.createSubchannel(Y, D);
                    if (w === null || w === void 0 ? void 0 : w.oobMetricsListener)
                      return new $Q7.OrcaOobMetricsSubchannelWrapper(
                        j,
                        w.oobMetricsListener,
                        this.latestConfig.getOobLoadReportingPeriodMs(),
                      );
                    else return j;
                  },
                }),
                q,
                $,
              ),
              lastUpdated: T,
              nonEmptySince: null,
              weight: 0,
              oobMetricsListener: null,
            }),
              this.children.set(f, w);
          if (_.getEnableOobLoadReport())
            w.oobMetricsListener = (Y) => {
              this.updateWeight(w, Y);
            };
          else w.oobMetricsListener = null;
        }
        for (let [A, f] of this.children)
          if (z.has(A)) f.child.startConnecting();
          else f.child.destroy(), this.children.delete(A);
        if (((this.updatesPaused = !1), this.calculateAndUpdateState(), this.weightUpdateTimer))
          clearInterval(this.weightUpdateTimer);
        return (
          (this.weightUpdateTimer =
            (O = (K = setInterval(() => {
              if (this.currentState === kP.ConnectivityState.READY) this.calculateAndUpdateState();
            }, _.getWeightUpdatePeriodMs())).unref) === null || O === void 0
              ? void 0
              : O.call(K)),
          !0
        );
      }
      exitIdle() {}
      resetBackoff() {}
      destroy() {
        for (let H of this.children.values()) H.child.destroy();
        if ((this.children.clear(), this.weightUpdateTimer)) clearInterval(this.weightUpdateTimer);
      }
      getTypeName() {
        return di6;
      }
    }
    function lE1() {
      (0, qQ7.registerLoadBalancerType)(di6, OQ7, lsH);
    }
  });
