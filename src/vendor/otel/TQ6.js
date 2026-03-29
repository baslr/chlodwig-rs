  var TQ6 = d((Cc) => {
    Object.defineProperty(Cc, "__esModule", { value: !0 });
    Cc.createExportTraceServiceRequest = Cc.toOtlpSpanEvent = Cc.toOtlpLink = Cc.sdkSpanToOtlpSpan = void 0;
    var raH = cI_(),
      kR1 = dI_(),
      vR1 = 256,
      NR1 = 512;
    function rp7(H, _) {
      let q = (H & 255) | vR1;
      if (_) q |= NR1;
      return q;
    }
    function op7(H, _) {
      let q = H.spanContext(),
        $ = H.status,
        K = H.parentSpanContext?.spanId ? _.encodeSpanContext(H.parentSpanContext?.spanId) : void 0;
      return {
        traceId: _.encodeSpanContext(q.traceId),
        spanId: _.encodeSpanContext(q.spanId),
        parentSpanId: K,
        traceState: q.traceState?.serialize(),
        name: H.name,
        kind: H.kind == null ? 0 : H.kind + 1,
        startTimeUnixNano: _.encodeHrTime(H.startTime),
        endTimeUnixNano: _.encodeHrTime(H.endTime),
        attributes: (0, raH.toAttributes)(H.attributes),
        droppedAttributesCount: H.droppedAttributesCount,
        events: H.events.map((O) => sp7(O, _)),
        droppedEventsCount: H.droppedEventsCount,
        status: { code: $.code, message: $.message },
        links: H.links.map((O) => ap7(O, _)),
        droppedLinksCount: H.droppedLinksCount,
        flags: rp7(q.traceFlags, H.parentSpanContext?.isRemote),
      };
    }
    Cc.sdkSpanToOtlpSpan = op7;
    function ap7(H, _) {
      return {
        attributes: H.attributes ? (0, raH.toAttributes)(H.attributes) : [],
        spanId: _.encodeSpanContext(H.context.spanId),
        traceId: _.encodeSpanContext(H.context.traceId),
        traceState: H.context.traceState?.serialize(),
        droppedAttributesCount: H.droppedAttributesCount || 0,
        flags: rp7(H.context.traceFlags, H.context.isRemote),
      };
    }
    Cc.toOtlpLink = ap7;
    function sp7(H, _) {
      return {
        attributes: H.attributes ? (0, raH.toAttributes)(H.attributes) : [],
        name: H.name,
        timeUnixNano: _.encodeHrTime(H.time),
        droppedAttributesCount: H.droppedAttributesCount || 0,
      };
    }
    Cc.toOtlpSpanEvent = sp7;
    function hR1(H, _) {
      let q = (0, kR1.getOtlpEncoder)(_);
      return { resourceSpans: VR1(H, q) };
    }
    Cc.createExportTraceServiceRequest = hR1;
    function yR1(H) {
      let _ = new Map();
      for (let q of H) {
        let $ = _.get(q.resource);
        if (!$) ($ = new Map()), _.set(q.resource, $);
        let K = `${q.instrumentationScope.name}@${q.instrumentationScope.version || ""}:${q.instrumentationScope.schemaUrl || ""}`,
          O = $.get(K);
        if (!O) (O = []), $.set(K, O);
        O.push(q);
      }
      return _;
    }
    function VR1(H, _) {
      let q = yR1(H),
        $ = [],
        K = q.entries(),
        O = K.next();
      while (!O.done) {
        let [T, z] = O.value,
          A = [],
          f = z.values(),
          w = f.next();
        while (!w.done) {
          let j = w.value;
          if (j.length > 0) {
            let M = j.map((J) => op7(J, _));
            A.push({
              scope: (0, raH.createInstrumentationScope)(j[0].instrumentationScope),
              spans: M,
              schemaUrl: j[0].instrumentationScope.schemaUrl,
            });
          }
          w = f.next();
        }
        let Y = (0, raH.createResource)(T),
          D = { resource: Y, scopeSpans: A, schemaUrl: Y.schemaUrl };
        $.push(D), (O = K.next());
      }
      return $;
    }
  });
