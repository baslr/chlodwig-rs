  var zu7 = d((XO) => {
    Object.defineProperty(XO, "__esModule", { value: !0 });
    XO.DEFAULT_AGGREGATION =
      XO.EXPONENTIAL_HISTOGRAM_AGGREGATION =
      XO.HISTOGRAM_AGGREGATION =
      XO.LAST_VALUE_AGGREGATION =
      XO.SUM_AGGREGATION =
      XO.DROP_AGGREGATION =
      XO.DefaultAggregation =
      XO.ExponentialHistogramAggregation =
      XO.ExplicitBucketHistogramAggregation =
      XO.HistogramAggregation =
      XO.LastValueAggregation =
      XO.SumAggregation =
      XO.DropAggregation =
        void 0;
    var yW1 = l9(),
      JAH = Tu7(),
      Rc = nqH();
    class db_ {
      static DEFAULT_INSTANCE = new JAH.DropAggregator();
      createAggregator(H) {
        return db_.DEFAULT_INSTANCE;
      }
    }
    XO.DropAggregation = db_;
    class yaH {
      static MONOTONIC_INSTANCE = new JAH.SumAggregator(!0);
      static NON_MONOTONIC_INSTANCE = new JAH.SumAggregator(!1);
      createAggregator(H) {
        switch (H.type) {
          case Rc.InstrumentType.COUNTER:
          case Rc.InstrumentType.OBSERVABLE_COUNTER:
          case Rc.InstrumentType.HISTOGRAM:
            return yaH.MONOTONIC_INSTANCE;
          default:
            return yaH.NON_MONOTONIC_INSTANCE;
        }
      }
    }
    XO.SumAggregation = yaH;
    class cb_ {
      static DEFAULT_INSTANCE = new JAH.LastValueAggregator();
      createAggregator(H) {
        return cb_.DEFAULT_INSTANCE;
      }
    }
    XO.LastValueAggregation = cb_;
    class Fb_ {
      static DEFAULT_INSTANCE = new JAH.HistogramAggregator(
        [0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000, 7500, 1e4],
        !0,
      );
      createAggregator(H) {
        return Fb_.DEFAULT_INSTANCE;
      }
    }
    XO.HistogramAggregation = Fb_;
    class oF6 {
      _recordMinMax;
      _boundaries;
      constructor(H, _ = !0) {
        if (((this._recordMinMax = _), H == null))
          throw Error(
            "ExplicitBucketHistogramAggregation should be created with explicit boundaries, if a single bucket histogram is required, please pass an empty array",
          );
        (H = H.concat()), (H = H.sort((K, O) => K - O));
        let q = H.lastIndexOf(-1 / 0),
          $ = H.indexOf(1 / 0);
        if ($ === -1) $ = void 0;
        this._boundaries = H.slice(q + 1, $);
      }
      createAggregator(H) {
        return new JAH.HistogramAggregator(this._boundaries, this._recordMinMax);
      }
    }
    XO.ExplicitBucketHistogramAggregation = oF6;
    class aF6 {
      _maxSize;
      _recordMinMax;
      constructor(H = 160, _ = !0) {
        (this._maxSize = H), (this._recordMinMax = _);
      }
      createAggregator(H) {
        return new JAH.ExponentialHistogramAggregator(this._maxSize, this._recordMinMax);
      }
    }
    XO.ExponentialHistogramAggregation = aF6;
    class sF6 {
      _resolve(H) {
        switch (H.type) {
          case Rc.InstrumentType.COUNTER:
          case Rc.InstrumentType.UP_DOWN_COUNTER:
          case Rc.InstrumentType.OBSERVABLE_COUNTER:
          case Rc.InstrumentType.OBSERVABLE_UP_DOWN_COUNTER:
            return XO.SUM_AGGREGATION;
          case Rc.InstrumentType.GAUGE:
          case Rc.InstrumentType.OBSERVABLE_GAUGE:
            return XO.LAST_VALUE_AGGREGATION;
          case Rc.InstrumentType.HISTOGRAM: {
            if (H.advice.explicitBucketBoundaries) return new oF6(H.advice.explicitBucketBoundaries);
            return XO.HISTOGRAM_AGGREGATION;
          }
        }
        return yW1.diag.warn(`Unable to recognize instrument type: ${H.type}`), XO.DROP_AGGREGATION;
      }
      createAggregator(H) {
        return this._resolve(H).createAggregator(H);
      }
    }
    XO.DefaultAggregation = sF6;
    XO.DROP_AGGREGATION = new db_();
    XO.SUM_AGGREGATION = new yaH();
    XO.LAST_VALUE_AGGREGATION = new cb_();
    XO.HISTOGRAM_AGGREGATION = new Fb_();
    XO.EXPONENTIAL_HISTOGRAM_AGGREGATION = new aF6();
    XO.DEFAULT_AGGREGATION = new sF6();
  });
