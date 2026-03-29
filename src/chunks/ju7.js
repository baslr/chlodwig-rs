  var ju7 = d((ib_) => {
    Object.defineProperty(ib_, "__esModule", { value: !0 });
    ib_.PeriodicExportingMetricReader = void 0;
    var HU6 = l9(),
      lb_ = P3(),
      IW1 = eF6(),
      Yu7 = tx();
    class Du7 extends IW1.MetricReader {
      _interval;
      _exporter;
      _exportInterval;
      _exportTimeout;
      constructor(H) {
        super({
          aggregationSelector: H.exporter.selectAggregation?.bind(H.exporter),
          aggregationTemporalitySelector: H.exporter.selectAggregationTemporality?.bind(H.exporter),
          metricProducers: H.metricProducers,
        });
        if (H.exportIntervalMillis !== void 0 && H.exportIntervalMillis <= 0)
          throw Error("exportIntervalMillis must be greater than 0");
        if (H.exportTimeoutMillis !== void 0 && H.exportTimeoutMillis <= 0)
          throw Error("exportTimeoutMillis must be greater than 0");
        if (
          H.exportTimeoutMillis !== void 0 &&
          H.exportIntervalMillis !== void 0 &&
          H.exportIntervalMillis < H.exportTimeoutMillis
        )
          throw Error("exportIntervalMillis must be greater than or equal to exportTimeoutMillis");
        (this._exportInterval = H.exportIntervalMillis ?? 60000),
          (this._exportTimeout = H.exportTimeoutMillis ?? 30000),
          (this._exporter = H.exporter);
      }
      async _runOnce() {
        try {
          await (0, Yu7.callWithTimeout)(this._doRun(), this._exportTimeout);
        } catch (H) {
          if (H instanceof Yu7.TimeoutError) {
            HU6.diag.error("Export took longer than %s milliseconds and timed out.", this._exportTimeout);
            return;
          }
          (0, lb_.globalErrorHandler)(H);
        }
      }
      async _doRun() {
        let { resourceMetrics: H, errors: _ } = await this.collect({ timeoutMillis: this._exportTimeout });
        if (_.length > 0) HU6.diag.error("PeriodicExportingMetricReader: metrics collection errors", ..._);
        if (H.resource.asyncAttributesPending)
          try {
            await H.resource.waitForAsyncAttributes?.();
          } catch ($) {
            HU6.diag.debug("Error while resolving async portion of resource: ", $), (0, lb_.globalErrorHandler)($);
          }
        if (H.scopeMetrics.length === 0) return;
        let q = await lb_.internal._export(this._exporter, H);
        if (q.code !== lb_.ExportResultCode.SUCCESS)
          throw Error(`PeriodicExportingMetricReader: metrics export failed (error ${q.error})`);
      }
      onInitialized() {
        if (
          ((this._interval = setInterval(() => {
            this._runOnce();
          }, this._exportInterval)),
          typeof this._interval !== "number")
        )
          this._interval.unref();
      }
      async onForceFlush() {
        await this._runOnce(), await this._exporter.forceFlush();
      }
      async onShutdown() {
        if (this._interval) clearInterval(this._interval);
        await this.onForceFlush(), await this._exporter.shutdown();
      }
    }
    ib_.PeriodicExportingMetricReader = Du7;
  });
