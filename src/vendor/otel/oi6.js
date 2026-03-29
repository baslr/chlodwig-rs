  var oi6 = d((Lm_) => {
    Object.defineProperty(Lm_, "__esModule", { value: !0 });
    Lm_.PrometheusSerializer = void 0;
    var Hb1 = l9(),
      aAH = LAH(),
      mQ7 = P3();
    function Zm_(H) {
      return H.replace(/\\/g, "\\\\").replace(/\n/g, "\\n");
    }
    function pQ7(H = "") {
      if (typeof H !== "string") H = JSON.stringify(H);
      return Zm_(H).replace(/"/g, '\\"');
    }
    var _b1 = /[^a-z0-9_]/gi,
      qb1 = /_{2,}/g;
    function ri6(H) {
      return H.replace(_b1, "_").replace(qb1, "_");
    }
    function ni6(H, _) {
      if (!H.endsWith("_total") && _.dataPointType === aAH.DataPointType.SUM && _.isMonotonic) H = H + "_total";
      return H;
    }
    function $b1(H) {
      if (H === 1 / 0) return "+Inf";
      else if (H === -1 / 0) return "-Inf";
      else return `${H}`;
    }
    function Kb1(H) {
      switch (H.dataPointType) {
        case aAH.DataPointType.SUM:
          if (H.isMonotonic) return "counter";
          return "gauge";
        case aAH.DataPointType.GAUGE:
          return "gauge";
        case aAH.DataPointType.HISTOGRAM:
          return "histogram";
        default:
          return "untyped";
      }
    }
    function Rm_(H, _, q, $, K) {
      let O = !1,
        T = "";
      for (let [z, A] of Object.entries(_)) {
        let f = ri6(z);
        (O = !0), (T += `${T.length > 0 ? "," : ""}${f}="${pQ7(A)}"`);
      }
      if (K)
        for (let [z, A] of Object.entries(K)) {
          let f = ri6(z);
          (O = !0), (T += `${T.length > 0 ? "," : ""}${f}="${pQ7(A)}"`);
        }
      if (O) H += `{${T}}`;
      return `${H} ${$b1(q)}${$ !== void 0 ? " " + String($) : ""}
`;
    }
    var Ob1 = "# no registered metrics";
    class BQ7 {
      _prefix;
      _appendTimestamp;
      _additionalAttributes;
      _withResourceConstantLabels;
      _withoutTargetInfo;
      constructor(H, _ = !1, q, $) {
        if (H) this._prefix = H + "_";
        (this._appendTimestamp = _), (this._withResourceConstantLabels = q), (this._withoutTargetInfo = !!$);
      }
      serialize(H) {
        let _ = "";
        this._additionalAttributes = this._filterResourceConstantLabels(
          H.resource.attributes,
          this._withResourceConstantLabels,
        );
        for (let q of H.scopeMetrics) _ += this._serializeScopeMetrics(q);
        if (_ === "") _ += Ob1;
        return this._serializeResource(H.resource) + _;
      }
      _filterResourceConstantLabels(H, _) {
        if (_) {
          let q = {};
          for (let [$, K] of Object.entries(H)) if ($.match(_)) q[$] = K;
          return q;
        }
        return;
      }
      _serializeScopeMetrics(H) {
        let _ = "";
        for (let q of H.metrics)
          _ +=
            this._serializeMetricData(q) +
            `
`;
        return _;
      }
      _serializeMetricData(H) {
        let _ = ri6(Zm_(H.descriptor.name));
        if (this._prefix) _ = `${this._prefix}${_}`;
        let q = H.dataPointType;
        _ = ni6(_, H);
        let $ = `# HELP ${_} ${Zm_(H.descriptor.description || "description missing")}`,
          K = H.descriptor.unit
            ? `
# UNIT ${_} ${Zm_(H.descriptor.unit)}`
            : "",
          O = `# TYPE ${_} ${Kb1(H)}`,
          T = "";
        switch (q) {
          case aAH.DataPointType.SUM:
          case aAH.DataPointType.GAUGE: {
            T = H.dataPoints.map((z) => this._serializeSingularDataPoint(_, H, z)).join("");
            break;
          }
          case aAH.DataPointType.HISTOGRAM: {
            T = H.dataPoints.map((z) => this._serializeHistogramDataPoint(_, H, z)).join("");
            break;
          }
          default:
            Hb1.diag.error(`Unrecognizable DataPointType: ${q} for metric "${_}"`);
        }
        return `${$}${K}
${O}
${T}`.trim();
      }
      _serializeSingularDataPoint(H, _, q) {
        let $ = "";
        H = ni6(H, _);
        let { value: K, attributes: O } = q,
          T = (0, mQ7.hrTimeToMilliseconds)(q.endTime);
        return ($ += Rm_(H, O, K, this._appendTimestamp ? T : void 0, this._additionalAttributes)), $;
      }
      _serializeHistogramDataPoint(H, _, q) {
        let $ = "";
        H = ni6(H, _);
        let { attributes: K, value: O } = q,
          T = (0, mQ7.hrTimeToMilliseconds)(q.endTime);
        for (let w of ["count", "sum"]) {
          let Y = O[w];
          if (Y != null) $ += Rm_(H + "_" + w, K, Y, this._appendTimestamp ? T : void 0, this._additionalAttributes);
        }
        let z = 0,
          A = O.buckets.counts.entries(),
          f = !1;
        for (let [w, Y] of A) {
          z += Y;
          let D = O.buckets.boundaries[w];
          if (D === void 0 && f) break;
          if (D === 1 / 0) f = !0;
          $ += Rm_(
            H + "_bucket",
            K,
            z,
            this._appendTimestamp ? T : void 0,
            Object.assign({}, this._additionalAttributes ?? {}, {
              le: D === void 0 || D === 1 / 0 ? "+Inf" : String(D),
            }),
          );
        }
        return $;
      }
      _serializeResource(H) {
        if (this._withoutTargetInfo === !0) return "";
        let _ = "target_info",
          q = `# HELP ${_} Target metadata`,
          $ = `# TYPE ${_} gauge`,
          K = Rm_(_, H.attributes, 1).trim();
        return `${q}
${$}
${K}
`;
      }
    }
    Lm_.PrometheusSerializer = BQ7;
  });
