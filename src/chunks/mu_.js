  var mu_ = d((xu_) => {
    Object.defineProperty(xu_, "__esModule", { value: !0 });
    xu_.ChildLoadBalancerHandler = void 0;
    var Wk1 = _7H(),
      Gk1 = TL(),
      Rk1 = "child_load_balancer_helper";
    class qg7 {
      constructor(H) {
        (this.channelControlHelper = H),
          (this.currentChild = null),
          (this.pendingChild = null),
          (this.latestConfig = null),
          (this.ChildPolicyHelper = class {
            constructor(_) {
              (this.parent = _), (this.child = null);
            }
            createSubchannel(_, q) {
              return this.parent.channelControlHelper.createSubchannel(_, q);
            }
            updateState(_, q, $) {
              var K;
              if (this.calledByPendingChild()) {
                if (_ === Gk1.ConnectivityState.CONNECTING) return;
                (K = this.parent.currentChild) === null || K === void 0 || K.destroy(),
                  (this.parent.currentChild = this.parent.pendingChild),
                  (this.parent.pendingChild = null);
              } else if (!this.calledByCurrentChild()) return;
              this.parent.channelControlHelper.updateState(_, q, $);
            }
            requestReresolution() {
              var _;
              let q = (_ = this.parent.pendingChild) !== null && _ !== void 0 ? _ : this.parent.currentChild;
              if (this.child === q) this.parent.channelControlHelper.requestReresolution();
            }
            setChild(_) {
              this.child = _;
            }
            addChannelzChild(_) {
              this.parent.channelControlHelper.addChannelzChild(_);
            }
            removeChannelzChild(_) {
              this.parent.channelControlHelper.removeChannelzChild(_);
            }
            calledByPendingChild() {
              return this.child === this.parent.pendingChild;
            }
            calledByCurrentChild() {
              return this.child === this.parent.currentChild;
            }
          });
      }
      configUpdateRequiresNewPolicyInstance(H, _) {
        return H.getLoadBalancerName() !== _.getLoadBalancerName();
      }
      updateAddressList(H, _, q, $) {
        let K;
        if (
          this.currentChild === null ||
          this.latestConfig === null ||
          this.configUpdateRequiresNewPolicyInstance(this.latestConfig, _)
        ) {
          let O = new this.ChildPolicyHelper(this),
            T = (0, Wk1.createLoadBalancer)(_, O);
          if ((O.setChild(T), this.currentChild === null)) (this.currentChild = T), (K = this.currentChild);
          else {
            if (this.pendingChild) this.pendingChild.destroy();
            (this.pendingChild = T), (K = this.pendingChild);
          }
        } else if (this.pendingChild === null) K = this.currentChild;
        else K = this.pendingChild;
        return (this.latestConfig = _), K.updateAddressList(H, _, q, $);
      }
      exitIdle() {
        if (this.currentChild) {
          if ((this.currentChild.exitIdle(), this.pendingChild)) this.pendingChild.exitIdle();
        }
      }
      resetBackoff() {
        if (this.currentChild) {
          if ((this.currentChild.resetBackoff(), this.pendingChild)) this.pendingChild.resetBackoff();
        }
      }
      destroy() {
        if (this.currentChild) this.currentChild.destroy(), (this.currentChild = null);
        if (this.pendingChild) this.pendingChild.destroy(), (this.pendingChild = null);
      }
      getTypeName() {
        return Rk1;
      }
    }
    xu_.ChildLoadBalancerHandler = qg7;
  });
