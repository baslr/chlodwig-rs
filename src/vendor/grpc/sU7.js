  var sU7 = d((oAH) => {
    var bi6;
    Object.defineProperty(oAH, "__esModule", { value: !0 });
    oAH.OutlierDetectionLoadBalancer = oAH.OutlierDetectionLoadBalancingConfig = void 0;
    oAH.setup = uE1;
    var vE1 = TL(),
      iU7 = mK(),
      rAH = msH(),
      nU7 = vi6(),
      NE1 = _7H(),
      hE1 = mu_(),
      yE1 = cr(),
      Ii6 = Uv(),
      VE1 = usH(),
      SE1 = DA(),
      EE1 = "outlier_detection";
    function LP(H) {
      SE1.trace(iU7.LogVerbosity.DEBUG, EE1, H);
    }
    var mi6 = "outlier_detection",
      CE1 =
        ((bi6 = process.env.GRPC_EXPERIMENTAL_ENABLE_OUTLIER_DETECTION) !== null && bi6 !== void 0 ? bi6 : "true") ===
        "true",
      bE1 = { stdev_factor: 1900, enforcement_percentage: 100, minimum_hosts: 5, request_volume: 100 },
      IE1 = { threshold: 85, enforcement_percentage: 100, minimum_hosts: 5, request_volume: 50 };
    function dNH(H, _, q, $) {
      if (_ in H && H[_] !== void 0 && typeof H[_] !== q) {
        let K = $ ? `${$}.${_}` : _;
        throw Error(`outlier detection config ${K} parse error: expected ${q}, got ${typeof H[_]}`);
      }
    }
    function ui6(H, _, q) {
      let $ = q ? `${q}.${_}` : _;
      if (_ in H && H[_] !== void 0) {
        if (!(0, rAH.isDuration)(H[_]))
          throw Error(`outlier detection config ${$} parse error: expected Duration, got ${typeof H[_]}`);
        if (!(H[_].seconds >= 0 && H[_].seconds <= 315576000000 && H[_].nanos >= 0 && H[_].nanos <= 999999999))
          throw Error(`outlier detection config ${$} parse error: values out of range for non-negative Duaration`);
      }
    }
    function Om_(H, _, q) {
      let $ = q ? `${q}.${_}` : _;
      if ((dNH(H, _, "number", q), _ in H && H[_] !== void 0 && !(H[_] >= 0 && H[_] <= 100)))
        throw Error(`outlier detection config ${$} parse error: value out of range for percentage (0-100)`);
    }
    class UsH {
      constructor(H, _, q, $, K, O, T) {
        if (((this.childPolicy = T), T.getLoadBalancerName() === "pick_first"))
          throw Error("outlier_detection LB policy cannot have a pick_first child policy");
        (this.intervalMs = H !== null && H !== void 0 ? H : 1e4),
          (this.baseEjectionTimeMs = _ !== null && _ !== void 0 ? _ : 30000),
          (this.maxEjectionTimeMs = q !== null && q !== void 0 ? q : 300000),
          (this.maxEjectionPercent = $ !== null && $ !== void 0 ? $ : 10),
          (this.successRateEjection = K ? Object.assign(Object.assign({}, bE1), K) : null),
          (this.failurePercentageEjection = O ? Object.assign(Object.assign({}, IE1), O) : null);
      }
      getLoadBalancerName() {
        return mi6;
      }
      toJsonObject() {
        var H, _;
        return {
          outlier_detection: {
            interval: (0, rAH.msToDuration)(this.intervalMs),
            base_ejection_time: (0, rAH.msToDuration)(this.baseEjectionTimeMs),
            max_ejection_time: (0, rAH.msToDuration)(this.maxEjectionTimeMs),
            max_ejection_percent: this.maxEjectionPercent,
            success_rate_ejection: (H = this.successRateEjection) !== null && H !== void 0 ? H : void 0,
            failure_percentage_ejection: (_ = this.failurePercentageEjection) !== null && _ !== void 0 ? _ : void 0,
            child_policy: [this.childPolicy.toJsonObject()],
          },
        };
      }
      getIntervalMs() {
        return this.intervalMs;
      }
      getBaseEjectionTimeMs() {
        return this.baseEjectionTimeMs;
      }
      getMaxEjectionTimeMs() {
        return this.maxEjectionTimeMs;
      }
      getMaxEjectionPercent() {
        return this.maxEjectionPercent;
      }
      getSuccessRateEjectionConfig() {
        return this.successRateEjection;
      }
      getFailurePercentageEjectionConfig() {
        return this.failurePercentageEjection;
      }
      getChildPolicy() {
        return this.childPolicy;
      }
      static createFromJson(H) {
        var _;
        if (
          (ui6(H, "interval"),
          ui6(H, "base_ejection_time"),
          ui6(H, "max_ejection_time"),
          Om_(H, "max_ejection_percent"),
          "success_rate_ejection" in H && H.success_rate_ejection !== void 0)
        ) {
          if (typeof H.success_rate_ejection !== "object")
            throw Error("outlier detection config success_rate_ejection must be an object");
          dNH(H.success_rate_ejection, "stdev_factor", "number", "success_rate_ejection"),
            Om_(H.success_rate_ejection, "enforcement_percentage", "success_rate_ejection"),
            dNH(H.success_rate_ejection, "minimum_hosts", "number", "success_rate_ejection"),
            dNH(H.success_rate_ejection, "request_volume", "number", "success_rate_ejection");
        }
        if ("failure_percentage_ejection" in H && H.failure_percentage_ejection !== void 0) {
          if (typeof H.failure_percentage_ejection !== "object")
            throw Error("outlier detection config failure_percentage_ejection must be an object");
          Om_(H.failure_percentage_ejection, "threshold", "failure_percentage_ejection"),
            Om_(H.failure_percentage_ejection, "enforcement_percentage", "failure_percentage_ejection"),
            dNH(H.failure_percentage_ejection, "minimum_hosts", "number", "failure_percentage_ejection"),
            dNH(H.failure_percentage_ejection, "request_volume", "number", "failure_percentage_ejection");
        }
        if (!("child_policy" in H) || !Array.isArray(H.child_policy))
          throw Error("outlier detection config child_policy must be an array");
        let q = (0, NE1.selectLbConfigFromList)(H.child_policy);
        if (!q) throw Error("outlier detection config child_policy: no valid recognized policy found");
        return new UsH(
          H.interval ? (0, rAH.durationToMs)(H.interval) : null,
          H.base_ejection_time ? (0, rAH.durationToMs)(H.base_ejection_time) : null,
          H.max_ejection_time ? (0, rAH.durationToMs)(H.max_ejection_time) : null,
          (_ = H.max_ejection_percent) !== null && _ !== void 0 ? _ : null,
          H.success_rate_ejection,
          H.failure_percentage_ejection,
          q,
        );
      }
    }
    oAH.OutlierDetectionLoadBalancingConfig = UsH;
    class rU7 extends VE1.BaseSubchannelWrapper {
      constructor(H, _) {
        super(H);
        (this.mapEntry = _), (this.refCount = 0);
      }
      ref() {
        this.child.ref(), (this.refCount += 1);
      }
      unref() {
        if ((this.child.unref(), (this.refCount -= 1), this.refCount <= 0)) {
          if (this.mapEntry) {
            let H = this.mapEntry.subchannelWrappers.indexOf(this);
            if (H >= 0) this.mapEntry.subchannelWrappers.splice(H, 1);
          }
        }
      }
      eject() {
        this.setHealthy(!1);
      }
      uneject() {
        this.setHealthy(!0);
      }
      getMapEntry() {
        return this.mapEntry;
      }
      getWrappedSubchannel() {
        return this.child;
      }
    }
    function xi6() {
      return { success: 0, failure: 0 };
    }
    class oU7 {
      constructor() {
        (this.activeBucket = xi6()), (this.inactiveBucket = xi6());
      }
      addSuccess() {
        this.activeBucket.success += 1;
      }
      addFailure() {
        this.activeBucket.failure += 1;
      }
      switchBuckets() {
        (this.inactiveBucket = this.activeBucket), (this.activeBucket = xi6());
      }
      getLastSuccesses() {
        return this.inactiveBucket.success;
      }
      getLastFailures() {
        return this.inactiveBucket.failure;
      }
    }
    class aU7 {
      constructor(H, _) {
        (this.wrappedPicker = H), (this.countCalls = _);
      }
      pick(H) {
        let _ = this.wrappedPicker.pick(H);
        if (_.pickResultType === yE1.PickResultType.COMPLETE) {
          let q = _.subchannel,
            $ = q.getMapEntry();
          if ($) {
            let K = _.onCallEnded;
            if (this.countCalls)
              K = (O, T, z) => {
                var A;
                if (O === iU7.Status.OK) $.counter.addSuccess();
                else $.counter.addFailure();
                (A = _.onCallEnded) === null || A === void 0 || A.call(_, O, T, z);
              };
            return Object.assign(Object.assign({}, _), { subchannel: q.getWrappedSubchannel(), onCallEnded: K });
          } else return Object.assign(Object.assign({}, _), { subchannel: q.getWrappedSubchannel() });
        } else return _;
      }
    }
    class pi6 {
      constructor(H) {
        (this.entryMap = new Ii6.EndpointMap()),
          (this.latestConfig = null),
          (this.timerStartTime = null),
          (this.childBalancer = new hE1.ChildLoadBalancerHandler(
            (0, nU7.createChildChannelControlHelper)(H, {
              createSubchannel: (_, q) => {
                let $ = H.createSubchannel(_, q),
                  K = this.entryMap.getForSubchannelAddress(_),
                  O = new rU7($, K);
                if ((K === null || K === void 0 ? void 0 : K.currentEjectionTimestamp) !== null) O.eject();
                return K === null || K === void 0 || K.subchannelWrappers.push(O), O;
              },
              updateState: (_, q, $) => {
                if (_ === vE1.ConnectivityState.READY) H.updateState(_, new aU7(q, this.isCountingEnabled()), $);
                else H.updateState(_, q, $);
              },
            }),
          )),
          (this.ejectionTimer = setInterval(() => {}, 0)),
          clearInterval(this.ejectionTimer);
      }
      isCountingEnabled() {
        return (
          this.latestConfig !== null &&
          (this.latestConfig.getSuccessRateEjectionConfig() !== null ||
            this.latestConfig.getFailurePercentageEjectionConfig() !== null)
        );
      }
      getCurrentEjectionPercent() {
        let H = 0;
        for (let _ of this.entryMap.values()) if (_.currentEjectionTimestamp !== null) H += 1;
        return (H * 100) / this.entryMap.size;
      }
      runSuccessRateCheck(H) {
        if (!this.latestConfig) return;
        let _ = this.latestConfig.getSuccessRateEjectionConfig();
        if (!_) return;
        LP("Running success rate check");
        let q = _.request_volume,
          $ = 0,
          K = [];
        for (let [w, Y] of this.entryMap.entries()) {
          let D = Y.counter.getLastSuccesses(),
            j = Y.counter.getLastFailures();
          if (
            (LP(
              "Stats for " +
                (0, Ii6.endpointToString)(w) +
                ": successes=" +
                D +
                " failures=" +
                j +
                " targetRequestVolume=" +
                q,
            ),
            D + j >= q)
          )
            ($ += 1), K.push(D / (D + j));
        }
        if (
          (LP(
            "Found " +
              $ +
              " success rate candidates; currentEjectionPercent=" +
              this.getCurrentEjectionPercent() +
              " successRates=[" +
              K +
              "]",
          ),
          $ < _.minimum_hosts)
        )
          return;
        let O = K.reduce((w, Y) => w + Y) / K.length,
          T = 0;
        for (let w of K) {
          let Y = w - O;
          T += Y * Y;
        }
        let z = T / K.length,
          A = Math.sqrt(z),
          f = O - A * (_.stdev_factor / 1000);
        LP("stdev=" + A + " ejectionThreshold=" + f);
        for (let [w, Y] of this.entryMap.entries()) {
          if (this.getCurrentEjectionPercent() >= this.latestConfig.getMaxEjectionPercent()) break;
          let D = Y.counter.getLastSuccesses(),
            j = Y.counter.getLastFailures();
          if (D + j < q) continue;
          let M = D / (D + j);
          if ((LP("Checking candidate " + w + " successRate=" + M), M < f)) {
            let J = Math.random() * 100;
            if (
              (LP("Candidate " + w + " randomNumber=" + J + " enforcement_percentage=" + _.enforcement_percentage),
              J < _.enforcement_percentage)
            )
              LP("Ejecting candidate " + w), this.eject(Y, H);
          }
        }
      }
      runFailurePercentageCheck(H) {
        if (!this.latestConfig) return;
        let _ = this.latestConfig.getFailurePercentageEjectionConfig();
        if (!_) return;
        LP(
          "Running failure percentage check. threshold=" +
            _.threshold +
            " request volume threshold=" +
            _.request_volume,
        );
        let q = 0;
        for (let $ of this.entryMap.values()) {
          let K = $.counter.getLastSuccesses(),
            O = $.counter.getLastFailures();
          if (K + O >= _.request_volume) q += 1;
        }
        if (q < _.minimum_hosts) return;
        for (let [$, K] of this.entryMap.entries()) {
          if (this.getCurrentEjectionPercent() >= this.latestConfig.getMaxEjectionPercent()) break;
          let O = K.counter.getLastSuccesses(),
            T = K.counter.getLastFailures();
          if ((LP("Candidate successes=" + O + " failures=" + T), O + T < _.request_volume)) continue;
          if ((T * 100) / (T + O) > _.threshold) {
            let A = Math.random() * 100;
            if (
              (LP("Candidate " + $ + " randomNumber=" + A + " enforcement_percentage=" + _.enforcement_percentage),
              A < _.enforcement_percentage)
            )
              LP("Ejecting candidate " + $), this.eject(K, H);
          }
        }
      }
      eject(H, _) {
        (H.currentEjectionTimestamp = new Date()), (H.ejectionTimeMultiplier += 1);
        for (let q of H.subchannelWrappers) q.eject();
      }
      uneject(H) {
        H.currentEjectionTimestamp = null;
        for (let _ of H.subchannelWrappers) _.uneject();
      }
      switchAllBuckets() {
        for (let H of this.entryMap.values()) H.counter.switchBuckets();
      }
      startTimer(H) {
        var _, q;
        (this.ejectionTimer = setTimeout(() => this.runChecks(), H)),
          (q = (_ = this.ejectionTimer).unref) === null || q === void 0 || q.call(_);
      }
      runChecks() {
        let H = new Date();
        if ((LP("Ejection timer running"), this.switchAllBuckets(), !this.latestConfig)) return;
        (this.timerStartTime = H),
          this.startTimer(this.latestConfig.getIntervalMs()),
          this.runSuccessRateCheck(H),
          this.runFailurePercentageCheck(H);
        for (let [_, q] of this.entryMap.entries())
          if (q.currentEjectionTimestamp === null) {
            if (q.ejectionTimeMultiplier > 0) q.ejectionTimeMultiplier -= 1;
          } else {
            let $ = this.latestConfig.getBaseEjectionTimeMs(),
              K = this.latestConfig.getMaxEjectionTimeMs(),
              O = new Date(q.currentEjectionTimestamp.getTime());
            if (
              (O.setMilliseconds(O.getMilliseconds() + Math.min($ * q.ejectionTimeMultiplier, Math.max($, K))),
              O < new Date())
            )
              LP("Unejecting " + _), this.uneject(q);
          }
      }
      updateAddressList(H, _, q, $) {
        if (!(_ instanceof UsH)) return !1;
        if ((LP("Received update with config: " + JSON.stringify(_.toJsonObject(), void 0, 2)), H.ok)) {
          for (let O of H.value)
            if (!this.entryMap.has(O))
              LP("Adding map entry for " + (0, Ii6.endpointToString)(O)),
                this.entryMap.set(O, {
                  counter: new oU7(),
                  currentEjectionTimestamp: null,
                  ejectionTimeMultiplier: 0,
                  subchannelWrappers: [],
                });
          this.entryMap.deleteMissing(H.value);
        }
        let K = _.getChildPolicy();
        if (
          (this.childBalancer.updateAddressList(H, K, q, $),
          _.getSuccessRateEjectionConfig() || _.getFailurePercentageEjectionConfig())
        )
          if (this.timerStartTime) {
            LP("Previous timer existed. Replacing timer"), clearTimeout(this.ejectionTimer);
            let O = _.getIntervalMs() - (new Date().getTime() - this.timerStartTime.getTime());
            this.startTimer(O);
          } else
            LP("Starting new timer"),
              (this.timerStartTime = new Date()),
              this.startTimer(_.getIntervalMs()),
              this.switchAllBuckets();
        else {
          LP("Counting disabled. Cancelling timer."), (this.timerStartTime = null), clearTimeout(this.ejectionTimer);
          for (let O of this.entryMap.values()) this.uneject(O), (O.ejectionTimeMultiplier = 0);
        }
        return (this.latestConfig = _), !0;
      }
      exitIdle() {
        this.childBalancer.exitIdle();
      }
      resetBackoff() {
        this.childBalancer.resetBackoff();
      }
      destroy() {
        clearTimeout(this.ejectionTimer), this.childBalancer.destroy();
      }
      getTypeName() {
        return mi6;
      }
    }
    oAH.OutlierDetectionLoadBalancer = pi6;
    function uE1() {
      if (CE1) (0, nU7.registerLoadBalancerType)(mi6, pi6, UsH);
    }
  });
