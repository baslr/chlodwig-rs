  var OQ6 = d((Ec) => {
    Object.defineProperty(Ec, "__esModule", { value: !0 });
    Ec.createExportMetricsServiceRequest = Ec.toMetric = Ec.toScopeMetrics = Ec.toResourceMetrics = void 0;
    var gp7 = l9(),
      qNH = LAH(),
      dp7 = Bp7(),
      jR1 = dI_(),
      naH = cI_();
    function Fp7(H, _) {
      let q = (0, jR1.getOtlpEncoder)(_),
        $ = (0, naH.createResource)(H.resource);
      return { resource: $, schemaUrl: $.schemaUrl, scopeMetrics: Up7(H.scopeMetrics, q) };
    }
    Ec.toResourceMetrics = Fp7;
    function Up7(H, _) {
      return Array.from(
        H.map((q) => ({
          scope: (0, naH.createInstrumentationScope)(q.scope),
          metrics: q.metrics.map(($) => Qp7($, _)),
          schemaUrl: q.scope.schemaUrl,
        })),
      );
    }
    Ec.toScopeMetrics = Up7;
    function Qp7(H, _) {
      let q = { name: H.descriptor.name, description: H.descriptor.description, unit: H.descriptor.unit },
        $ = XR1(H.aggregationTemporality);
      switch (H.dataPointType) {
        case qNH.DataPointType.SUM:
          q.sum = { aggregationTemporality: $, isMonotonic: H.isMonotonic, dataPoints: cp7(H, _) };
          break;
        case qNH.DataPointType.GAUGE:
          q.gauge = { dataPoints: cp7(H, _) };
          break;
        case qNH.DataPointType.HISTOGRAM:
          q.histogram = { aggregationTemporality: $, dataPoints: JR1(H, _) };
          break;
        case qNH.DataPointType.EXPONENTIAL_HISTOGRAM:
          q.exponentialHistogram = { aggregationTemporality: $, dataPoints: PR1(H, _) };
          break;
      }
      return q;
    }
    Ec.toMetric = Qp7;
    function MR1(H, _, q) {
      let $ = {
        attributes: (0, naH.toAttributes)(H.attributes),
        startTimeUnixNano: q.encodeHrTime(H.startTime),
        timeUnixNano: q.encodeHrTime(H.endTime),
      };
      switch (_) {
        case gp7.ValueType.INT:
          $.asInt = H.value;
          break;
        case gp7.ValueType.DOUBLE:
          $.asDouble = H.value;
          break;
      }
      return $;
    }
    function cp7(H, _) {
      return H.dataPoints.map((q) => {
        return MR1(q, H.descriptor.valueType, _);
      });
    }
    function JR1(H, _) {
      return H.dataPoints.map((q) => {
        let $ = q.value;
        return {
          attributes: (0, naH.toAttributes)(q.attributes),
          bucketCounts: $.buckets.counts,
          explicitBounds: $.buckets.boundaries,
          count: $.count,
          sum: $.sum,
          min: $.min,
          max: $.max,
          startTimeUnixNano: _.encodeHrTime(q.startTime),
          timeUnixNano: _.encodeHrTime(q.endTime),
        };
      });
    }
    function PR1(H, _) {
      return H.dataPoints.map((q) => {
        let $ = q.value;
        return {
          attributes: (0, naH.toAttributes)(q.attributes),
          count: $.count,
          min: $.min,
          max: $.max,
          sum: $.sum,
          positive: { offset: $.positive.offset, bucketCounts: $.positive.bucketCounts },
          negative: { offset: $.negative.offset, bucketCounts: $.negative.bucketCounts },
          scale: $.scale,
          zeroCount: $.zeroCount,
          startTimeUnixNano: _.encodeHrTime(q.startTime),
          timeUnixNano: _.encodeHrTime(q.endTime),
        };
      });
    }
    function XR1(H) {
      switch (H) {
        case qNH.AggregationTemporality.DELTA:
          return dp7.EAggregationTemporality.AGGREGATION_TEMPORALITY_DELTA;
        case qNH.AggregationTemporality.CUMULATIVE:
          return dp7.EAggregationTemporality.AGGREGATION_TEMPORALITY_CUMULATIVE;
      }
    }
    function WR1(H, _) {
      return { resourceMetrics: H.map((q) => Fp7(q, _)) };
    }
    Ec.createExportMetricsServiceRequest = WR1;
  });
