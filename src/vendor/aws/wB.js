  var wB = d((DD) => {
    var eL$ = g56();
    DD.RETRY_MODES = void 0;
    (function (H) {
      (H.STANDARD = "standard"), (H.ADAPTIVE = "adaptive");
    })(DD.RETRY_MODES || (DD.RETRY_MODES = {}));
    var d56 = 3,
      Hk$ = DD.RETRY_MODES.STANDARD;
    class tO_ {
      static setTimeoutFn = setTimeout;
      beta;
      minCapacity;
      minFillRate;
      scaleConstant;
      smooth;
      currentCapacity = 0;
      enabled = !1;
      lastMaxRate = 0;
      measuredTxRate = 0;
      requestCount = 0;
      fillRate;
      lastThrottleTime;
      lastTimestamp = 0;
      lastTxRateBucket;
      maxCapacity;
      timeWindow = 0;
      constructor(H) {
        (this.beta = H?.beta ?? 0.7),
          (this.minCapacity = H?.minCapacity ?? 1),
          (this.minFillRate = H?.minFillRate ?? 0.5),
          (this.scaleConstant = H?.scaleConstant ?? 0.4),
          (this.smooth = H?.smooth ?? 0.8);
        let _ = this.getCurrentTimeInSeconds();
        (this.lastThrottleTime = _),
          (this.lastTxRateBucket = Math.floor(this.getCurrentTimeInSeconds())),
          (this.fillRate = this.minFillRate),
          (this.maxCapacity = this.minCapacity);
      }
      getCurrentTimeInSeconds() {
        return Date.now() / 1000;
      }
      async getSendToken() {
        return this.acquireTokenBucket(1);
      }
      async acquireTokenBucket(H) {
        if (!this.enabled) return;
        if ((this.refillTokenBucket(), H > this.currentCapacity)) {
          let _ = ((H - this.currentCapacity) / this.fillRate) * 1000;
          await new Promise((q) => tO_.setTimeoutFn(q, _));
        }
        this.currentCapacity = this.currentCapacity - H;
      }
      refillTokenBucket() {
        let H = this.getCurrentTimeInSeconds();
        if (!this.lastTimestamp) {
          this.lastTimestamp = H;
          return;
        }
        let _ = (H - this.lastTimestamp) * this.fillRate;
        (this.currentCapacity = Math.min(this.maxCapacity, this.currentCapacity + _)), (this.lastTimestamp = H);
      }
      updateClientSendingRate(H) {
        let _;
        if ((this.updateMeasuredRate(), eL$.isThrottlingError(H))) {
          let $ = !this.enabled ? this.measuredTxRate : Math.min(this.measuredTxRate, this.fillRate);
          (this.lastMaxRate = $),
            this.calculateTimeWindow(),
            (this.lastThrottleTime = this.getCurrentTimeInSeconds()),
            (_ = this.cubicThrottle($)),
            this.enableTokenBucket();
        } else this.calculateTimeWindow(), (_ = this.cubicSuccess(this.getCurrentTimeInSeconds()));
        let q = Math.min(_, 2 * this.measuredTxRate);
        this.updateTokenBucketRate(q);
      }
      calculateTimeWindow() {
        this.timeWindow = this.getPrecise(
          Math.pow((this.lastMaxRate * (1 - this.beta)) / this.scaleConstant, 0.3333333333333333),
        );
      }
      cubicThrottle(H) {
        return this.getPrecise(H * this.beta);
      }
      cubicSuccess(H) {
        return this.getPrecise(
          this.scaleConstant * Math.pow(H - this.lastThrottleTime - this.timeWindow, 3) + this.lastMaxRate,
        );
      }
      enableTokenBucket() {
        this.enabled = !0;
      }
      updateTokenBucketRate(H) {
        this.refillTokenBucket(),
          (this.fillRate = Math.max(H, this.minFillRate)),
          (this.maxCapacity = Math.max(H, this.minCapacity)),
          (this.currentCapacity = Math.min(this.currentCapacity, this.maxCapacity));
      }
      updateMeasuredRate() {
        let H = this.getCurrentTimeInSeconds(),
          _ = Math.floor(H * 2) / 2;
        if ((this.requestCount++, _ > this.lastTxRateBucket)) {
          let q = this.requestCount / (_ - this.lastTxRateBucket);
          (this.measuredTxRate = this.getPrecise(q * this.smooth + this.measuredTxRate * (1 - this.smooth))),
            (this.requestCount = 0),
            (this.lastTxRateBucket = _);
        }
      }
      getPrecise(H) {
        return parseFloat(H.toFixed(8));
      }
    }
    var $mH = 100,
      F56 = 20000,
      db8 = 500,
      c56 = 500,
      cb8 = 5,
      Fb8 = 10,
      Ub8 = 1,
      _k$ = "amz-sdk-invocation-id",
      qk$ = "amz-sdk-request",
      $k$ = () => {
        let H = $mH;
        return {
          computeNextBackoffDelay: ($) => {
            return Math.floor(Math.min(F56, Math.random() * 2 ** $ * H));
          },
          setDelayBase: ($) => {
            H = $;
          },
        };
      },
      gb8 = ({ retryDelay: H, retryCount: _, retryCost: q }) => {
        return { getRetryCount: () => _, getRetryDelay: () => Math.min(F56, H), getRetryCost: () => q };
      };
    class eO_ {
      maxAttempts;
      mode = DD.RETRY_MODES.STANDARD;
      capacity = c56;
      retryBackoffStrategy = $k$();
      maxAttemptsProvider;
      constructor(H) {
        (this.maxAttempts = H), (this.maxAttemptsProvider = typeof H === "function" ? H : async () => H);
      }
      async acquireInitialRetryToken(H) {
        return gb8({ retryDelay: $mH, retryCount: 0 });
      }
      async refreshRetryTokenForRetry(H, _) {
        let q = await this.getMaxAttempts();
        if (this.shouldRetry(H, _, q)) {
          let $ = _.errorType;
          this.retryBackoffStrategy.setDelayBase($ === "THROTTLING" ? db8 : $mH);
          let K = this.retryBackoffStrategy.computeNextBackoffDelay(H.getRetryCount()),
            O = _.retryAfterHint ? Math.max(_.retryAfterHint.getTime() - Date.now() || 0, K) : K,
            T = this.getCapacityCost($);
          return (this.capacity -= T), gb8({ retryDelay: O, retryCount: H.getRetryCount() + 1, retryCost: T });
        }
        throw Error("No retry token available");
      }
      recordSuccess(H) {
        this.capacity = Math.max(c56, this.capacity + (H.getRetryCost() ?? Ub8));
      }
      getCapacity() {
        return this.capacity;
      }
      async getMaxAttempts() {
        try {
          return await this.maxAttemptsProvider();
        } catch (H) {
          return console.warn(`Max attempts provider could not resolve. Using default of ${d56}`), d56;
        }
      }
      shouldRetry(H, _, q) {
        return (
          H.getRetryCount() + 1 < q &&
          this.capacity >= this.getCapacityCost(_.errorType) &&
          this.isRetryableError(_.errorType)
        );
      }
      getCapacityCost(H) {
        return H === "TRANSIENT" ? Fb8 : cb8;
      }
      isRetryableError(H) {
        return H === "THROTTLING" || H === "TRANSIENT";
      }
    }
    class Qb8 {
      maxAttemptsProvider;
      rateLimiter;
      standardRetryStrategy;
      mode = DD.RETRY_MODES.ADAPTIVE;
      constructor(H, _) {
        this.maxAttemptsProvider = H;
        let { rateLimiter: q } = _ ?? {};
        (this.rateLimiter = q ?? new tO_()), (this.standardRetryStrategy = new eO_(H));
      }
      async acquireInitialRetryToken(H) {
        return await this.rateLimiter.getSendToken(), this.standardRetryStrategy.acquireInitialRetryToken(H);
      }
      async refreshRetryTokenForRetry(H, _) {
        return this.rateLimiter.updateClientSendingRate(_), this.standardRetryStrategy.refreshRetryTokenForRetry(H, _);
      }
      recordSuccess(H) {
        this.rateLimiter.updateClientSendingRate({}), this.standardRetryStrategy.recordSuccess(H);
      }
    }
    class lb8 extends eO_ {
      computeNextBackoffDelay;
      constructor(H, _ = $mH) {
        super(typeof H === "function" ? H : async () => H);
        if (typeof _ === "number") this.computeNextBackoffDelay = () => _;
        else this.computeNextBackoffDelay = _;
      }
      async refreshRetryTokenForRetry(H, _) {
        let q = await super.refreshRetryTokenForRetry(H, _);
        return (q.getRetryDelay = () => this.computeNextBackoffDelay(q.getRetryCount())), q;
      }
    }
    DD.AdaptiveRetryStrategy = Qb8;
    DD.ConfiguredRetryStrategy = lb8;
    DD.DEFAULT_MAX_ATTEMPTS = d56;
    DD.DEFAULT_RETRY_DELAY_BASE = $mH;
    DD.DEFAULT_RETRY_MODE = Hk$;
    DD.DefaultRateLimiter = tO_;
    DD.INITIAL_RETRY_TOKENS = c56;
    DD.INVOCATION_ID_HEADER = _k$;
    DD.MAXIMUM_RETRY_DELAY = F56;
    DD.NO_RETRY_INCREMENT = Ub8;
    DD.REQUEST_HEADER = qk$;
    DD.RETRY_COST = cb8;
    DD.StandardRetryStrategy = eO_;
    DD.THROTTLING_RETRY_DELAY_BASE = db8;
    DD.TIMEOUT_RETRY_COST = Fb8;
  });
