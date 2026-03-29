  var Tg7 = d((pu_) => {
    Object.defineProperty(pu_, "__esModule", { value: !0 });
    pu_.ResolvingLoadBalancer = void 0;
    var Zk1 = _7H(),
      Lk1 = NQ6(),
      Fv = TL(),
      $g7 = qm(),
      _sH = cr(),
      kk1 = DNH(),
      hQ6 = mK(),
      vk1 = GP(),
      Nk1 = DA(),
      hk1 = mK(),
      yk1 = OL(),
      Vk1 = mu_(),
      Sk1 = "resolving_load_balancer";
    function Kg7(H) {
      Nk1.trace(hk1.LogVerbosity.DEBUG, Sk1, H);
    }
    var Ek1 = ["SERVICE_AND_METHOD", "SERVICE", "EMPTY"];
    function Ck1(H, _, q, $) {
      for (let K of q.name)
        switch ($) {
          case "EMPTY":
            if (!K.service && !K.method) return !0;
            break;
          case "SERVICE":
            if (K.service === H && !K.method) return !0;
            break;
          case "SERVICE_AND_METHOD":
            if (K.service === H && K.method === _) return !0;
        }
      return !1;
    }
    function bk1(H, _, q, $) {
      for (let K of q) if (Ck1(H, _, K, $)) return K;
      return null;
    }
    function Ik1(H) {
      return {
        invoke(_, q) {
          var $, K;
          let O = _.split("/").filter((A) => A.length > 0),
            T = ($ = O[0]) !== null && $ !== void 0 ? $ : "",
            z = (K = O[1]) !== null && K !== void 0 ? K : "";
          if (H && H.methodConfig)
            for (let A of Ek1) {
              let f = bk1(T, z, H.methodConfig, A);
              if (f) return { methodConfig: f, pickInformation: {}, status: hQ6.Status.OK, dynamicFilterFactories: [] };
            }
          return { methodConfig: { name: [] }, pickInformation: {}, status: hQ6.Status.OK, dynamicFilterFactories: [] };
        },
        unref() {},
      };
    }
    class Og7 {
      constructor(H, _, q, $, K) {
        if (
          ((this.target = H),
          (this.channelControlHelper = _),
          (this.channelOptions = q),
          (this.onSuccessfulResolution = $),
          (this.onFailedResolution = K),
          (this.latestChildState = Fv.ConnectivityState.IDLE),
          (this.latestChildPicker = new _sH.QueuePicker(this)),
          (this.latestChildErrorMessage = null),
          (this.currentState = Fv.ConnectivityState.IDLE),
          (this.previousServiceConfig = null),
          (this.continueResolving = !1),
          q["grpc.service_config"])
        )
          this.defaultServiceConfig = (0, Lk1.validateServiceConfig)(JSON.parse(q["grpc.service_config"]));
        else this.defaultServiceConfig = { loadBalancingConfig: [], methodConfig: [] };
        this.updateState(Fv.ConnectivityState.IDLE, new _sH.QueuePicker(this), null),
          (this.childLoadBalancer = new Vk1.ChildLoadBalancerHandler({
            createSubchannel: _.createSubchannel.bind(_),
            requestReresolution: () => {
              if (this.backoffTimeout.isRunning())
                Kg7(
                  "requestReresolution delayed by backoff timer until " +
                    this.backoffTimeout.getEndTime().toISOString(),
                ),
                  (this.continueResolving = !0);
              else this.updateResolution();
            },
            updateState: (T, z, A) => {
              (this.latestChildState = T),
                (this.latestChildPicker = z),
                (this.latestChildErrorMessage = A),
                this.updateState(T, z, A);
            },
            addChannelzChild: _.addChannelzChild.bind(_),
            removeChannelzChild: _.removeChannelzChild.bind(_),
          })),
          (this.innerResolver = (0, $g7.createResolver)(H, this.handleResolverResult.bind(this), q));
        let O = { initialDelay: q["grpc.initial_reconnect_backoff_ms"], maxDelay: q["grpc.max_reconnect_backoff_ms"] };
        (this.backoffTimeout = new kk1.BackoffTimeout(() => {
          if (this.continueResolving) this.updateResolution(), (this.continueResolving = !1);
          else this.updateState(this.latestChildState, this.latestChildPicker, this.latestChildErrorMessage);
        }, O)),
          this.backoffTimeout.unref();
      }
      handleResolverResult(H, _, q, $) {
        var K, O;
        this.backoffTimeout.stop(), this.backoffTimeout.reset();
        let T = !0,
          z = null;
        if (q === null) z = this.defaultServiceConfig;
        else if (q.ok) z = q.value;
        else if (this.previousServiceConfig !== null) z = this.previousServiceConfig;
        else (T = !1), this.handleResolutionFailure(q.error);
        if (z !== null) {
          let A = (K = z === null || z === void 0 ? void 0 : z.loadBalancingConfig) !== null && K !== void 0 ? K : [],
            f = (0, Zk1.selectLbConfigFromList)(A, !0);
          if (f === null)
            (T = !1),
              this.handleResolutionFailure({
                code: hQ6.Status.UNAVAILABLE,
                details: "All load balancer options in service config are not compatible",
                metadata: new vk1.Metadata(),
              });
          else
            T = this.childLoadBalancer.updateAddressList(
              H,
              f,
              Object.assign(Object.assign({}, this.channelOptions), _),
              $,
            );
        }
        if (T)
          this.onSuccessfulResolution(
            z,
            (O = _[$g7.CHANNEL_ARGS_CONFIG_SELECTOR_KEY]) !== null && O !== void 0 ? O : Ik1(z),
          );
        return T;
      }
      updateResolution() {
        if ((this.innerResolver.updateResolution(), this.currentState === Fv.ConnectivityState.IDLE))
          this.updateState(Fv.ConnectivityState.CONNECTING, this.latestChildPicker, this.latestChildErrorMessage);
        this.backoffTimeout.runOnce();
      }
      updateState(H, _, q) {
        if (
          (Kg7(
            (0, yk1.uriToString)(this.target) +
              " " +
              Fv.ConnectivityState[this.currentState] +
              " -> " +
              Fv.ConnectivityState[H],
          ),
          H === Fv.ConnectivityState.IDLE)
        )
          _ = new _sH.QueuePicker(this, _);
        (this.currentState = H), this.channelControlHelper.updateState(H, _, q);
      }
      handleResolutionFailure(H) {
        if (this.latestChildState === Fv.ConnectivityState.IDLE)
          this.updateState(Fv.ConnectivityState.TRANSIENT_FAILURE, new _sH.UnavailablePicker(H), H.details),
            this.onFailedResolution(H);
      }
      exitIdle() {
        if (
          this.currentState === Fv.ConnectivityState.IDLE ||
          this.currentState === Fv.ConnectivityState.TRANSIENT_FAILURE
        )
          if (this.backoffTimeout.isRunning()) this.continueResolving = !0;
          else this.updateResolution();
        this.childLoadBalancer.exitIdle();
      }
      updateAddressList(H, _) {
        throw Error("updateAddressList not supported on ResolvingLoadBalancer");
      }
      resetBackoff() {
        this.backoffTimeout.reset(), this.childLoadBalancer.resetBackoff();
      }
      destroy() {
        this.childLoadBalancer.destroy(),
          this.innerResolver.destroy(),
          this.backoffTimeout.reset(),
          this.backoffTimeout.stop(),
          (this.latestChildState = Fv.ConnectivityState.IDLE),
          (this.latestChildPicker = new _sH.QueuePicker(this)),
          (this.currentState = Fv.ConnectivityState.IDLE),
          (this.previousServiceConfig = null),
          (this.continueResolving = !1);
      }
      getTypeName() {
        return "resolving_load_balancer";
      }
    }
    pu_.ResolvingLoadBalancer = Og7;
  });
