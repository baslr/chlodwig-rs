  var nx_ = d((ry) => {
    var __dirname = "/home/runner/work/claude-cli-internal/claude-cli-internal/node_modules/@grpc/grpc-js/build/src";
    Object.defineProperty(ry, "__esModule", { value: !0 });
    ry.OrcaOobMetricsSubchannelWrapper =
      ry.GRPC_METRICS_HEADER =
      ry.ServerMetricRecorder =
      ry.PerRequestMetricRecorder =
        void 0;
    ry.createOrcaClient = iF7;
    ry.createMetricsReader = WS1;
    var DS1 = Qu_(),
      Di6 = msH(),
      jS1 = YNH(),
      MS1 = usH(),
      cF7 = mK(),
      JS1 = DNH(),
      PS1 = TL(),
      FF7 = null;
    function ix_() {
      if (FF7) return FF7;
      let H = yl6().loadSync,
        _ = H("xds/service/orca/v3/orca.proto", {
          keepCase: !0,
          longs: String,
          enums: String,
          defaults: !0,
          oneofs: !0,
          includeDirs: [`${__dirname}/../../proto/xds`, `${__dirname}/../../proto/protoc-gen-validate`],
        });
      return (0, DS1.loadPackageDefinition)(_);
    }
    class QF7 {
      constructor() {
        this.message = {};
      }
      recordRequestCostMetric(H, _) {
        if (!this.message.request_cost) this.message.request_cost = {};
        this.message.request_cost[H] = _;
      }
      recordUtilizationMetric(H, _) {
        if (!this.message.utilization) this.message.utilization = {};
        this.message.utilization[H] = _;
      }
      recordNamedMetric(H, _) {
        if (!this.message.named_metrics) this.message.named_metrics = {};
        this.message.named_metrics[H] = _;
      }
      recordCPUUtilizationMetric(H) {
        this.message.cpu_utilization = H;
      }
      recordMemoryUtilizationMetric(H) {
        this.message.mem_utilization = H;
      }
      recordApplicationUtilizationMetric(H) {
        this.message.application_utilization = H;
      }
      recordQpsMetric(H) {
        this.message.rps_fractional = H;
      }
      recordEpsMetric(H) {
        this.message.eps = H;
      }
      serialize() {
        return ix_().xds.data.orca.v3.OrcaLoadReport.serialize(this.message);
      }
    }
    ry.PerRequestMetricRecorder = QF7;
    var XS1 = 30000;
    class lF7 {
      constructor() {
        (this.message = {}),
          (this.serviceImplementation = {
            StreamCoreMetrics: (H) => {
              let _ = H.request.report_interval
                  ? (0, Di6.durationToMs)((0, Di6.durationMessageToDuration)(H.request.report_interval))
                  : XS1,
                q = setInterval(() => {
                  H.write(this.message);
                }, _);
              H.on("cancelled", () => {
                clearInterval(q);
              });
            },
          });
      }
      putUtilizationMetric(H, _) {
        if (!this.message.utilization) this.message.utilization = {};
        this.message.utilization[H] = _;
      }
      setAllUtilizationMetrics(H) {
        this.message.utilization = Object.assign({}, H);
      }
      deleteUtilizationMetric(H) {
        var _;
        (_ = this.message.utilization) === null || _ === void 0 || delete _[H];
      }
      setCpuUtilizationMetric(H) {
        this.message.cpu_utilization = H;
      }
      deleteCpuUtilizationMetric() {
        delete this.message.cpu_utilization;
      }
      setApplicationUtilizationMetric(H) {
        this.message.application_utilization = H;
      }
      deleteApplicationUtilizationMetric() {
        delete this.message.application_utilization;
      }
      setQpsMetric(H) {
        this.message.rps_fractional = H;
      }
      deleteQpsMetric() {
        delete this.message.rps_fractional;
      }
      setEpsMetric(H) {
        this.message.eps = H;
      }
      deleteEpsMetric() {
        delete this.message.eps;
      }
      addToServer(H) {
        let _ = ix_().xds.service.orca.v3.OpenRcaService.service;
        H.addService(_, this.serviceImplementation);
      }
    }
    ry.ServerMetricRecorder = lF7;
    function iF7(H) {
      return new (ix_().xds.service.orca.v3.OpenRcaService)("unused", jS1.ChannelCredentials.createInsecure(), {
        channelOverride: H,
      });
    }
    ry.GRPC_METRICS_HEADER = "endpoint-load-metrics-bin";
    var UF7 = "grpc_orca_load_report";
    function WS1(H, _) {
      return (q, $, K) => {
        let O = K.getOpaque(UF7);
        if (O) H(O);
        else {
          let T = K.get(ry.GRPC_METRICS_HEADER);
          if (T.length > 0) (O = ix_().xds.data.orca.v3.OrcaLoadReport.deserialize(T[0])), H(O), K.setOpaque(UF7, O);
        }
        if (_) _(q, $, K);
      };
    }
    var nF7 = "orca_oob_metrics";
    class rF7 {
      constructor(H, _) {
        (this.metricsListener = H), (this.intervalMs = _), (this.dataProducer = null);
      }
      setSubchannel(H) {
        let _ = H.getOrCreateDataProducer(nF7, GS1);
        (this.dataProducer = _), _.addDataWatcher(this);
      }
      destroy() {
        var H;
        (H = this.dataProducer) === null || H === void 0 || H.removeDataWatcher(this);
      }
      getInterval() {
        return this.intervalMs;
      }
      onMetricsUpdate(H) {
        this.metricsListener(H);
      }
    }
    class oF7 {
      constructor(H) {
        (this.subchannel = H),
          (this.dataWatchers = new Set()),
          (this.orcaSupported = !0),
          (this.metricsCall = null),
          (this.currentInterval = 1 / 0),
          (this.backoffTimer = new JS1.BackoffTimeout(() => this.updateMetricsSubscription())),
          (this.subchannelStateListener = () => this.updateMetricsSubscription());
        let _ = H.getChannel();
        (this.client = iF7(_)), H.addConnectivityStateListener(this.subchannelStateListener);
      }
      addDataWatcher(H) {
        this.dataWatchers.add(H), this.updateMetricsSubscription();
      }
      removeDataWatcher(H) {
        var _;
        if ((this.dataWatchers.delete(H), this.dataWatchers.size === 0))
          this.subchannel.removeDataProducer(nF7),
            (_ = this.metricsCall) === null || _ === void 0 || _.cancel(),
            (this.metricsCall = null),
            this.client.close(),
            this.subchannel.removeConnectivityStateListener(this.subchannelStateListener);
        else this.updateMetricsSubscription();
      }
      updateMetricsSubscription() {
        var H;
        if (
          this.dataWatchers.size === 0 ||
          !this.orcaSupported ||
          this.subchannel.getConnectivityState() !== PS1.ConnectivityState.READY
        )
          return;
        let _ = Math.min(...Array.from(this.dataWatchers).map((q) => q.getInterval()));
        if (!this.metricsCall || _ !== this.currentInterval) {
          (H = this.metricsCall) === null || H === void 0 || H.cancel(), (this.currentInterval = _);
          let q = this.client.streamCoreMetrics({ report_interval: (0, Di6.msToDuration)(_) });
          (this.metricsCall = q),
            q.on("data", ($) => {
              this.dataWatchers.forEach((K) => {
                K.onMetricsUpdate($);
              });
            }),
            q.on("error", ($) => {
              if (((this.metricsCall = null), $.code === cF7.Status.UNIMPLEMENTED)) {
                this.orcaSupported = !1;
                return;
              }
              if ($.code === cF7.Status.CANCELLED) return;
              this.backoffTimer.runOnce();
            });
        }
      }
    }
    class aF7 extends MS1.BaseSubchannelWrapper {
      constructor(H, _, q) {
        super(H);
        this.addDataWatcher(new rF7(_, q));
      }
      getWrappedSubchannel() {
        return this.child;
      }
    }
    ry.OrcaOobMetricsSubchannelWrapper = aF7;
    function GS1(H) {
      return new oF7(H);
    }
  });
