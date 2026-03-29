  var sI7 = d((gvH) => {
    Object.defineProperty(gvH, "__esModule", { value: !0 });
    gvH.ExponentialHistogramAggregator = gvH.ExponentialHistogramAccumulation = void 0;
    var XW1 = IvH(),
      vaH = nqH(),
      WW1 = l9(),
      rI7 = mI7(),
      oI7 = nI7(),
      GW1 = Ib_();
    class BvH {
      low;
      high;
      static combine(H, _) {
        return new BvH(Math.min(H.low, _.low), Math.max(H.high, _.high));
      }
      constructor(H, _) {
        (this.low = H), (this.high = _);
      }
    }
    var RW1 = 20,
      ZW1 = 160,
      rF6 = 2;
    class gb_ {
      startTime;
      _maxSize;
      _recordMinMax;
      _sum;
      _count;
      _zeroCount;
      _min;
      _max;
      _positive;
      _negative;
      _mapping;
      constructor(
        H,
        _ = ZW1,
        q = !0,
        $ = 0,
        K = 0,
        O = 0,
        T = Number.POSITIVE_INFINITY,
        z = Number.NEGATIVE_INFINITY,
        A = new rI7.Buckets(),
        f = new rI7.Buckets(),
        w = (0, oI7.getMapping)(RW1),
      ) {
        if (
          ((this.startTime = H),
          (this._maxSize = _),
          (this._recordMinMax = q),
          (this._sum = $),
          (this._count = K),
          (this._zeroCount = O),
          (this._min = T),
          (this._max = z),
          (this._positive = A),
          (this._negative = f),
          (this._mapping = w),
          this._maxSize < rF6)
        )
          WW1.diag.warn(
            `Exponential Histogram Max Size set to ${this._maxSize},                 changing to the minimum size of: ${rF6}`,
          ),
            (this._maxSize = rF6);
      }
      record(H) {
        this.updateByIncrement(H, 1);
      }
      setStartTime(H) {
        this.startTime = H;
      }
      toPointValue() {
        return {
          hasMinMax: this._recordMinMax,
          min: this.min,
          max: this.max,
          sum: this.sum,
          positive: { offset: this.positive.offset, bucketCounts: this.positive.counts() },
          negative: { offset: this.negative.offset, bucketCounts: this.negative.counts() },
          count: this.count,
          scale: this.scale,
          zeroCount: this.zeroCount,
        };
      }
      get sum() {
        return this._sum;
      }
      get min() {
        return this._min;
      }
      get max() {
        return this._max;
      }
      get count() {
        return this._count;
      }
      get zeroCount() {
        return this._zeroCount;
      }
      get scale() {
        if (this._count === this._zeroCount) return 0;
        return this._mapping.scale;
      }
      get positive() {
        return this._positive;
      }
      get negative() {
        return this._negative;
      }
      updateByIncrement(H, _) {
        if (Number.isNaN(H)) return;
        if (H > this._max) this._max = H;
        if (H < this._min) this._min = H;
        if (((this._count += _), H === 0)) {
          this._zeroCount += _;
          return;
        }
        if (((this._sum += H * _), H > 0)) this._updateBuckets(this._positive, H, _);
        else this._updateBuckets(this._negative, -H, _);
      }
      merge(H) {
        if (this._count === 0) (this._min = H.min), (this._max = H.max);
        else if (H.count !== 0) {
          if (H.min < this.min) this._min = H.min;
          if (H.max > this.max) this._max = H.max;
        }
        (this.startTime = H.startTime),
          (this._sum += H.sum),
          (this._count += H.count),
          (this._zeroCount += H.zeroCount);
        let _ = this._minScale(H);
        this._downscale(this.scale - _),
          this._mergeBuckets(this.positive, H, H.positive, _),
          this._mergeBuckets(this.negative, H, H.negative, _);
      }
      diff(H) {
        (this._min = 1 / 0),
          (this._max = -1 / 0),
          (this._sum -= H.sum),
          (this._count -= H.count),
          (this._zeroCount -= H.zeroCount);
        let _ = this._minScale(H);
        this._downscale(this.scale - _),
          this._diffBuckets(this.positive, H, H.positive, _),
          this._diffBuckets(this.negative, H, H.negative, _);
      }
      clone() {
        return new gb_(
          this.startTime,
          this._maxSize,
          this._recordMinMax,
          this._sum,
          this._count,
          this._zeroCount,
          this._min,
          this._max,
          this.positive.clone(),
          this.negative.clone(),
          this._mapping,
        );
      }
      _updateBuckets(H, _, q) {
        let $ = this._mapping.mapToIndex(_),
          K = !1,
          O = 0,
          T = 0;
        if (H.length === 0) (H.indexStart = $), (H.indexEnd = H.indexStart), (H.indexBase = H.indexStart);
        else if ($ < H.indexStart && H.indexEnd - $ >= this._maxSize) (K = !0), (T = $), (O = H.indexEnd);
        else if ($ > H.indexEnd && $ - H.indexStart >= this._maxSize) (K = !0), (T = H.indexStart), (O = $);
        if (K) {
          let z = this._changeScale(O, T);
          this._downscale(z), ($ = this._mapping.mapToIndex(_));
        }
        this._incrementIndexBy(H, $, q);
      }
      _incrementIndexBy(H, _, q) {
        if (q === 0) return;
        if (H.length === 0) H.indexStart = H.indexEnd = H.indexBase = _;
        if (_ < H.indexStart) {
          let K = H.indexEnd - _;
          if (K >= H.backing.length) this._grow(H, K + 1);
          H.indexStart = _;
        } else if (_ > H.indexEnd) {
          let K = _ - H.indexStart;
          if (K >= H.backing.length) this._grow(H, K + 1);
          H.indexEnd = _;
        }
        let $ = _ - H.indexBase;
        if ($ < 0) $ += H.backing.length;
        H.incrementBucket($, q);
      }
      _grow(H, _) {
        let q = H.backing.length,
          $ = H.indexBase - H.indexStart,
          K = q - $,
          O = (0, GW1.nextGreaterSquare)(_);
        if (O > this._maxSize) O = this._maxSize;
        let T = O - $;
        H.backing.growTo(O, K, T);
      }
      _changeScale(H, _) {
        let q = 0;
        while (H - _ >= this._maxSize) (H >>= 1), (_ >>= 1), q++;
        return q;
      }
      _downscale(H) {
        if (H === 0) return;
        if (H < 0) throw Error(`impossible change of scale: ${this.scale}`);
        let _ = this._mapping.scale - H;
        this._positive.downscale(H), this._negative.downscale(H), (this._mapping = (0, oI7.getMapping)(_));
      }
      _minScale(H) {
        let _ = Math.min(this.scale, H.scale),
          q = BvH.combine(
            this._highLowAtScale(this.positive, this.scale, _),
            this._highLowAtScale(H.positive, H.scale, _),
          ),
          $ = BvH.combine(
            this._highLowAtScale(this.negative, this.scale, _),
            this._highLowAtScale(H.negative, H.scale, _),
          );
        return Math.min(_ - this._changeScale(q.high, q.low), _ - this._changeScale($.high, $.low));
      }
      _highLowAtScale(H, _, q) {
        if (H.length === 0) return new BvH(0, -1);
        let $ = _ - q;
        return new BvH(H.indexStart >> $, H.indexEnd >> $);
      }
      _mergeBuckets(H, _, q, $) {
        let K = q.offset,
          O = _.scale - $;
        for (let T = 0; T < q.length; T++) this._incrementIndexBy(H, (K + T) >> O, q.at(T));
      }
      _diffBuckets(H, _, q, $) {
        let K = q.offset,
          O = _.scale - $;
        for (let T = 0; T < q.length; T++) {
          let A = ((K + T) >> O) - H.indexBase;
          if (A < 0) A += H.backing.length;
          H.decrementBucket(A, q.at(T));
        }
        H.trim();
      }
    }
    gvH.ExponentialHistogramAccumulation = gb_;
    class aI7 {
      _maxSize;
      _recordMinMax;
      kind = XW1.AggregatorKind.EXPONENTIAL_HISTOGRAM;
      constructor(H, _) {
        (this._maxSize = H), (this._recordMinMax = _);
      }
      createAccumulation(H) {
        return new gb_(H, this._maxSize, this._recordMinMax);
      }
      merge(H, _) {
        let q = _.clone();
        return q.merge(H), q;
      }
      diff(H, _) {
        let q = _.clone();
        return q.diff(H), q;
      }
      toMetricData(H, _, q, $) {
        return {
          descriptor: H,
          aggregationTemporality: _,
          dataPointType: vaH.DataPointType.EXPONENTIAL_HISTOGRAM,
          dataPoints: q.map(([K, O]) => {
            let T = O.toPointValue(),
              z =
                H.type === vaH.InstrumentType.GAUGE ||
                H.type === vaH.InstrumentType.UP_DOWN_COUNTER ||
                H.type === vaH.InstrumentType.OBSERVABLE_GAUGE ||
                H.type === vaH.InstrumentType.OBSERVABLE_UP_DOWN_COUNTER;
            return {
              attributes: K,
              startTime: O.startTime,
              endTime: $,
              value: {
                min: T.hasMinMax ? T.min : void 0,
                max: T.hasMinMax ? T.max : void 0,
                sum: !z ? T.sum : void 0,
                positive: { offset: T.positive.offset, bucketCounts: T.positive.bucketCounts },
                negative: { offset: T.negative.offset, bucketCounts: T.negative.bucketCounts },
                count: T.count,
                scale: T.scale,
                zeroCount: T.zeroCount,
              },
            };
          }),
        };
      }
    }
    gvH.ExponentialHistogramAggregator = aI7;
  });
