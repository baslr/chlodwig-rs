  var xI7 = d((uvH) => {
    Object.defineProperty(uvH, "__esModule", { value: !0 });
    uvH.HistogramAggregator = uvH.HistogramAccumulation = void 0;
    var qW1 = IvH(),
      LaH = nqH(),
      $W1 = tx();
    function KW1(H) {
      let _ = H.map(() => 0);
      return (
        _.push(0), { buckets: { boundaries: H, counts: _ }, sum: 0, count: 0, hasMinMax: !1, min: 1 / 0, max: -1 / 0 }
      );
    }
    class kaH {
      startTime;
      _boundaries;
      _recordMinMax;
      _current;
      constructor(H, _, q = !0, $ = KW1(_)) {
        (this.startTime = H), (this._boundaries = _), (this._recordMinMax = q), (this._current = $);
      }
      record(H) {
        if (Number.isNaN(H)) return;
        if (((this._current.count += 1), (this._current.sum += H), this._recordMinMax))
          (this._current.min = Math.min(H, this._current.min)),
            (this._current.max = Math.max(H, this._current.max)),
            (this._current.hasMinMax = !0);
        let _ = (0, $W1.binarySearchUB)(this._boundaries, H);
        this._current.buckets.counts[_] += 1;
      }
      setStartTime(H) {
        this.startTime = H;
      }
      toPointValue() {
        return this._current;
      }
    }
    uvH.HistogramAccumulation = kaH;
    class uI7 {
      _boundaries;
      _recordMinMax;
      kind = qW1.AggregatorKind.HISTOGRAM;
      constructor(H, _) {
        (this._boundaries = H), (this._recordMinMax = _);
      }
      createAccumulation(H) {
        return new kaH(H, this._boundaries, this._recordMinMax);
      }
      merge(H, _) {
        let q = H.toPointValue(),
          $ = _.toPointValue(),
          K = q.buckets.counts,
          O = $.buckets.counts,
          T = Array(K.length);
        for (let f = 0; f < K.length; f++) T[f] = K[f] + O[f];
        let z = 1 / 0,
          A = -1 / 0;
        if (this._recordMinMax) {
          if (q.hasMinMax && $.hasMinMax) (z = Math.min(q.min, $.min)), (A = Math.max(q.max, $.max));
          else if (q.hasMinMax) (z = q.min), (A = q.max);
          else if ($.hasMinMax) (z = $.min), (A = $.max);
        }
        return new kaH(H.startTime, q.buckets.boundaries, this._recordMinMax, {
          buckets: { boundaries: q.buckets.boundaries, counts: T },
          count: q.count + $.count,
          sum: q.sum + $.sum,
          hasMinMax: this._recordMinMax && (q.hasMinMax || $.hasMinMax),
          min: z,
          max: A,
        });
      }
      diff(H, _) {
        let q = H.toPointValue(),
          $ = _.toPointValue(),
          K = q.buckets.counts,
          O = $.buckets.counts,
          T = Array(K.length);
        for (let z = 0; z < K.length; z++) T[z] = O[z] - K[z];
        return new kaH(_.startTime, q.buckets.boundaries, this._recordMinMax, {
          buckets: { boundaries: q.buckets.boundaries, counts: T },
          count: $.count - q.count,
          sum: $.sum - q.sum,
          hasMinMax: !1,
          min: 1 / 0,
          max: -1 / 0,
        });
      }
      toMetricData(H, _, q, $) {
        return {
          descriptor: H,
          aggregationTemporality: _,
          dataPointType: LaH.DataPointType.HISTOGRAM,
          dataPoints: q.map(([K, O]) => {
            let T = O.toPointValue(),
              z =
                H.type === LaH.InstrumentType.GAUGE ||
                H.type === LaH.InstrumentType.UP_DOWN_COUNTER ||
                H.type === LaH.InstrumentType.OBSERVABLE_GAUGE ||
                H.type === LaH.InstrumentType.OBSERVABLE_UP_DOWN_COUNTER;
            return {
              attributes: K,
              startTime: O.startTime,
              endTime: $,
              value: {
                min: T.hasMinMax ? T.min : void 0,
                max: T.hasMinMax ? T.max : void 0,
                sum: !z ? T.sum : void 0,
                buckets: T.buckets,
                count: T.count,
              },
            };
          }),
        };
      }
    }
    uvH.HistogramAggregator = uI7;
  });
