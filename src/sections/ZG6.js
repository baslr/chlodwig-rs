    AcH = {
      fromJSON(H) {
        return {
          seconds: fIq(H.seconds) ? globalThis.Number(H.seconds) : 0,
          nanos: fIq(H.nanos) ? globalThis.Number(H.nanos) : 0,
        };
      },
      toJSON(H) {
        let _ = {};
        if (H.seconds !== void 0) _.seconds = Math.round(H.seconds);
        if (H.nanos !== void 0) _.nanos = Math.round(H.nanos);
        return _;
      },
      create(H) {
        return AcH.fromPartial(H ?? {});
      },
      fromPartial(H) {
        let _ = SY4();
        return (_.seconds = H.seconds ?? 0), (_.nanos = H.nanos ?? 0), _;
      },
    };
