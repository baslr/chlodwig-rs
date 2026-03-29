  var uU6 = d((vW) => {
    Object.defineProperty(vW, "__esModule", { value: !0 });
    vW.OTLPMetricExporterBase =
      vW.LowMemoryTemporalitySelector =
      vW.DeltaTemporalitySelector =
      vW.CumulativeTemporalitySelector =
        void 0;
    var SG1 = P3(),
      lj = LAH(),
      Sm7 = CU6(),
      EG1 = yc(),
      CG1 = l9(),
      bG1 = () => lj.AggregationTemporality.CUMULATIVE;
    vW.CumulativeTemporalitySelector = bG1;
    var IG1 = (H) => {
      switch (H) {
        case lj.InstrumentType.COUNTER:
        case lj.InstrumentType.OBSERVABLE_COUNTER:
        case lj.InstrumentType.GAUGE:
        case lj.InstrumentType.HISTOGRAM:
        case lj.InstrumentType.OBSERVABLE_GAUGE:
          return lj.AggregationTemporality.DELTA;
        case lj.InstrumentType.UP_DOWN_COUNTER:
        case lj.InstrumentType.OBSERVABLE_UP_DOWN_COUNTER:
          return lj.AggregationTemporality.CUMULATIVE;
      }
    };
    vW.DeltaTemporalitySelector = IG1;
    var uG1 = (H) => {
      switch (H) {
        case lj.InstrumentType.COUNTER:
        case lj.InstrumentType.HISTOGRAM:
          return lj.AggregationTemporality.DELTA;
        case lj.InstrumentType.GAUGE:
        case lj.InstrumentType.UP_DOWN_COUNTER:
        case lj.InstrumentType.OBSERVABLE_UP_DOWN_COUNTER:
        case lj.InstrumentType.OBSERVABLE_COUNTER:
        case lj.InstrumentType.OBSERVABLE_GAUGE:
          return lj.AggregationTemporality.CUMULATIVE;
      }
    };
    vW.LowMemoryTemporalitySelector = uG1;
    function xG1() {
      let H = (
        (0, SG1.getStringFromEnv)("OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE") ?? "cumulative"
      ).toLowerCase();
      if (H === "cumulative") return vW.CumulativeTemporalitySelector;
      if (H === "delta") return vW.DeltaTemporalitySelector;
      if (H === "lowmemory") return vW.LowMemoryTemporalitySelector;
      return (
        CG1.diag.warn(
          `OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE is set to '${H}', but only 'cumulative' and 'delta' are allowed. Using default ('cumulative') instead.`,
        ),
        vW.CumulativeTemporalitySelector
      );
    }
    function mG1(H) {
      if (H != null) {
        if (H === Sm7.AggregationTemporalityPreference.DELTA) return vW.DeltaTemporalitySelector;
        else if (H === Sm7.AggregationTemporalityPreference.LOWMEMORY) return vW.LowMemoryTemporalitySelector;
        return vW.CumulativeTemporalitySelector;
      }
      return xG1();
    }
    var pG1 = Object.freeze({ type: lj.AggregationType.DEFAULT });
    function BG1(H) {
      return H?.aggregationPreference ?? (() => pG1);
    }
    class Em7 extends EG1.OTLPExporterBase {
      _aggregationTemporalitySelector;
      _aggregationSelector;
      constructor(H, _) {
        super(H);
        (this._aggregationSelector = BG1(_)), (this._aggregationTemporalitySelector = mG1(_?.temporalityPreference));
      }
      selectAggregation(H) {
        return this._aggregationSelector(H);
      }
      selectAggregationTemporality(H) {
        return this._aggregationTemporalitySelector(H);
      }
    }
    vW.OTLPMetricExporterBase = Em7;
  });
