  var iZ8 = d((eH5, lZ8) => {
    function KS(H, _) {
      if (typeof _ === "boolean") _ = { forever: _ };
      if (
        ((this._originalTimeouts = JSON.parse(JSON.stringify(H))),
        (this._timeouts = H),
        (this._options = _ || {}),
        (this._maxRetryTime = (_ && _.maxRetryTime) || 1 / 0),
        (this._fn = null),
        (this._errors = []),
        (this._attempts = 1),
        (this._operationTimeout = null),
        (this._operationTimeoutCb = null),
        (this._timeout = null),
        (this._operationStart = null),
        this._options.forever)
      )
        this._cachedTimeouts = this._timeouts.slice(0);
    }
    lZ8.exports = KS;
    KS.prototype.reset = function () {
      (this._attempts = 1), (this._timeouts = this._originalTimeouts);
    };
    KS.prototype.stop = function () {
      if (this._timeout) clearTimeout(this._timeout);
      (this._timeouts = []), (this._cachedTimeouts = null);
    };
    KS.prototype.retry = function (H) {
      if (this._timeout) clearTimeout(this._timeout);
      if (!H) return !1;
      var _ = new Date().getTime();
      if (H && _ - this._operationStart >= this._maxRetryTime)
        return this._errors.unshift(Error("RetryOperation timeout occurred")), !1;
      this._errors.push(H);
      var q = this._timeouts.shift();
      if (q === void 0)
        if (this._cachedTimeouts)
          this._errors.splice(this._errors.length - 1, this._errors.length),
            (this._timeouts = this._cachedTimeouts.slice(0)),
            (q = this._timeouts.shift());
        else return !1;
      var $ = this,
        K = setTimeout(function () {
          if (($._attempts++, $._operationTimeoutCb)) {
            if (
              (($._timeout = setTimeout(function () {
                $._operationTimeoutCb($._attempts);
              }, $._operationTimeout)),
              $._options.unref)
            )
              $._timeout.unref();
          }
          $._fn($._attempts);
        }, q);
      if (this._options.unref) K.unref();
      return !0;
    };
    KS.prototype.attempt = function (H, _) {
      if (((this._fn = H), _)) {
        if (_.timeout) this._operationTimeout = _.timeout;
        if (_.cb) this._operationTimeoutCb = _.cb;
      }
      var q = this;
      if (this._operationTimeoutCb)
        this._timeout = setTimeout(function () {
          q._operationTimeoutCb();
        }, q._operationTimeout);
      (this._operationStart = new Date().getTime()), this._fn(this._attempts);
    };
    KS.prototype.try = function (H) {
      console.log("Using RetryOperation.try() is deprecated"), this.attempt(H);
    };
    KS.prototype.start = function (H) {
      console.log("Using RetryOperation.start() is deprecated"), this.attempt(H);
    };
    KS.prototype.start = KS.prototype.try;
    KS.prototype.errors = function () {
      return this._errors;
    };
    KS.prototype.attempts = function () {
      return this._attempts;
    };
    KS.prototype.mainError = function () {
      if (this._errors.length === 0) return null;
      var H = {},
        _ = null,
        q = 0;
      for (var $ = 0; $ < this._errors.length; $++) {
        var K = this._errors[$],
          O = K.message,
          T = (H[O] || 0) + 1;
        if (((H[O] = T), T >= q)) (_ = K), (q = T);
      }
      return _;
    };
  });
