  var gQ7 = d((km_) => {
    Object.defineProperty(km_, "__esModule", { value: !0 });
    km_.PrometheusExporter = void 0;
    var tsH = l9(),
      Tb1 = P3(),
      ai6 = LAH(),
      zb1 = require("http"),
      Ab1 = oi6(),
      fb1 = require("url");
    class tr extends ai6.MetricReader {
      static DEFAULT_OPTIONS = {
        host: void 0,
        port: 9464,
        endpoint: "/metrics",
        prefix: "",
        appendTimestamp: !1,
        withResourceConstantLabels: void 0,
        withoutTargetInfo: !1,
      };
      _host;
      _port;
      _baseUrl;
      _endpoint;
      _server;
      _prefix;
      _appendTimestamp;
      _serializer;
      _startServerPromise;
      constructor(H = {}, _ = () => {}) {
        super({
          aggregationSelector: (K) => {
            return { type: ai6.AggregationType.DEFAULT };
          },
          aggregationTemporalitySelector: (K) => ai6.AggregationTemporality.CUMULATIVE,
          metricProducers: H.metricProducers,
        });
        (this._host = H.host || process.env.OTEL_EXPORTER_PROMETHEUS_HOST || tr.DEFAULT_OPTIONS.host),
          (this._port = H.port || Number(process.env.OTEL_EXPORTER_PROMETHEUS_PORT) || tr.DEFAULT_OPTIONS.port),
          (this._prefix = H.prefix || tr.DEFAULT_OPTIONS.prefix),
          (this._appendTimestamp =
            typeof H.appendTimestamp === "boolean" ? H.appendTimestamp : tr.DEFAULT_OPTIONS.appendTimestamp);
        let q = H.withResourceConstantLabels || tr.DEFAULT_OPTIONS.withResourceConstantLabels,
          $ = H.withoutTargetInfo || tr.DEFAULT_OPTIONS.withoutTargetInfo;
        if (
          ((this._server = (0, zb1.createServer)(this._requestHandler).unref()),
          (this._serializer = new Ab1.PrometheusSerializer(this._prefix, this._appendTimestamp, q, $)),
          (this._baseUrl = `http://${this._host}:${this._port}/`),
          (this._endpoint = (H.endpoint || tr.DEFAULT_OPTIONS.endpoint).replace(/^([^/])/, "/$1")),
          H.preventServerStart !== !0)
        )
          this.startServer().then(_, (K) => {
            tsH.diag.error(K), _(K);
          });
        else if (_) queueMicrotask(_);
      }
      async onForceFlush() {}
      onShutdown() {
        return this.stopServer();
      }
      stopServer() {
        if (!this._server)
          return tsH.diag.debug("Prometheus stopServer() was called but server was never started."), Promise.resolve();
        else
          return new Promise((H) => {
            this._server.close((_) => {
              if (!_) tsH.diag.debug("Prometheus exporter was stopped");
              else if (_.code !== "ERR_SERVER_NOT_RUNNING") (0, Tb1.globalErrorHandler)(_);
              H();
            });
          });
      }
      startServer() {
        return (
          (this._startServerPromise ??= new Promise((H, _) => {
            this._server.once("error", _),
              this._server.listen({ port: this._port, host: this._host }, () => {
                tsH.diag.debug(`Prometheus exporter server started: ${this._host}:${this._port}/${this._endpoint}`),
                  H();
              });
          })),
          this._startServerPromise
        );
      }
      getMetricsRequestHandler(H, _) {
        this._exportMetrics(_);
      }
      _requestHandler = (H, _) => {
        if (H.url != null && new fb1.URL(H.url, this._baseUrl).pathname === this._endpoint) this._exportMetrics(_);
        else this._notFound(_);
      };
      _exportMetrics = (H) => {
        (H.statusCode = 200),
          H.setHeader("content-type", "text/plain"),
          this.collect().then(
            (_) => {
              let { resourceMetrics: q, errors: $ } = _;
              if ($.length) tsH.diag.error("PrometheusExporter: metrics collection errors", ...$);
              H.end(this._serializer.serialize(q));
            },
            (_) => {
              H.end(`# failed to export metrics: ${_}`);
            },
          );
      };
      _notFound = (H) => {
        (H.statusCode = 404), H.end();
      };
    }
    km_.PrometheusExporter = tr;
  });
