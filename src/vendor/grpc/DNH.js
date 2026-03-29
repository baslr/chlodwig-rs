  var DNH = d((uu_) => {
    Object.defineProperty(uu_, "__esModule", { value: !0 });
    uu_.BackoffTimeout = void 0;
    var wk1 = mK(),
      Yk1 = DA(),
      Dk1 = "backoff",
      jk1 = 1000,
      Mk1 = 1.6,
      Jk1 = 120000,
      Pk1 = 0.2;
    function Xk1(H, _) {
      return Math.random() * (_ - H) + H;
    }
    class Iu_ {
      constructor(H, _) {
        if (
          ((this.callback = H),
          (this.initialDelay = jk1),
          (this.multiplier = Mk1),
          (this.maxDelay = Jk1),
          (this.jitter = Pk1),
          (this.running = !1),
          (this.hasRef = !0),
          (this.startTime = new Date()),
          (this.endTime = new Date()),
          (this.id = Iu_.getNextId()),
          _)
        ) {
          if (_.initialDelay) this.initialDelay = _.initialDelay;
          if (_.multiplier) this.multiplier = _.multiplier;
          if (_.jitter) this.jitter = _.jitter;
          if (_.maxDelay) this.maxDelay = _.maxDelay;
        }
        this.trace(
          "constructed initialDelay=" +
            this.initialDelay +
            " multiplier=" +
            this.multiplier +
            " jitter=" +
            this.jitter +
            " maxDelay=" +
            this.maxDelay,
        ),
          (this.nextDelay = this.initialDelay),
          (this.timerId = setTimeout(() => {}, 0)),
          clearTimeout(this.timerId);
      }
      static getNextId() {
        return this.nextId++;
      }
      trace(H) {
        Yk1.trace(wk1.LogVerbosity.DEBUG, Dk1, "{" + this.id + "} " + H);
      }
      runTimer(H) {
        var _, q;
        if (
          (this.trace("runTimer(delay=" + H + ")"),
          (this.endTime = this.startTime),
          this.endTime.setMilliseconds(this.endTime.getMilliseconds() + H),
          clearTimeout(this.timerId),
          (this.timerId = setTimeout(() => {
            this.trace("timer fired"), (this.running = !1), this.callback();
          }, H)),
          !this.hasRef)
        )
          (q = (_ = this.timerId).unref) === null || q === void 0 || q.call(_);
      }
      runOnce() {
        this.trace("runOnce()"), (this.running = !0), (this.startTime = new Date()), this.runTimer(this.nextDelay);
        let H = Math.min(this.nextDelay * this.multiplier, this.maxDelay),
          _ = H * this.jitter;
        this.nextDelay = H + Xk1(-_, _);
      }
      stop() {
        this.trace("stop()"), clearTimeout(this.timerId), (this.running = !1);
      }
      reset() {
        if ((this.trace("reset() running=" + this.running), (this.nextDelay = this.initialDelay), this.running)) {
          let H = new Date(),
            _ = this.startTime;
          if ((_.setMilliseconds(_.getMilliseconds() + this.nextDelay), clearTimeout(this.timerId), H < _))
            this.runTimer(_.getTime() - H.getTime());
          else this.running = !1;
        }
      }
      isRunning() {
        return this.running;
      }
      ref() {
        var H, _;
        (this.hasRef = !0), (_ = (H = this.timerId).ref) === null || _ === void 0 || _.call(H);
      }
      unref() {
        var H, _;
        (this.hasRef = !1), (_ = (H = this.timerId).unref) === null || _ === void 0 || _.call(H);
      }
      getEndTime() {
        return this.endTime;
      }
    }
    uu_.BackoffTimeout = Iu_;
    Iu_.nextId = 0;
  });
