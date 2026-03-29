    ZG6();
    kG6();
    vG6 = {
      fromJSON(H) {
        return {
          event_id: tS(H.event_id) ? globalThis.String(H.event_id) : "",
          timestamp: tS(H.timestamp) ? BY4(H.timestamp) : void 0,
          experiment_id: tS(H.experiment_id) ? globalThis.String(H.experiment_id) : "",
          variation_id: tS(H.variation_id) ? globalThis.Number(H.variation_id) : 0,
          environment: tS(H.environment) ? globalThis.String(H.environment) : "",
          user_attributes: tS(H.user_attributes) ? globalThis.String(H.user_attributes) : "",
          experiment_metadata: tS(H.experiment_metadata) ? globalThis.String(H.experiment_metadata) : "",
          device_id: tS(H.device_id) ? globalThis.String(H.device_id) : "",
          auth: tS(H.auth) ? Hi.fromJSON(H.auth) : void 0,
          session_id: tS(H.session_id) ? globalThis.String(H.session_id) : "",
          anonymous_id: tS(H.anonymous_id) ? globalThis.String(H.anonymous_id) : "",
          event_metadata_vars: tS(H.event_metadata_vars) ? globalThis.String(H.event_metadata_vars) : "",
        };
      },
      toJSON(H) {
        let _ = {};
        if (H.event_id !== void 0) _.event_id = H.event_id;
        if (H.timestamp !== void 0) _.timestamp = H.timestamp.toISOString();
        if (H.experiment_id !== void 0) _.experiment_id = H.experiment_id;
        if (H.variation_id !== void 0) _.variation_id = Math.round(H.variation_id);
        if (H.environment !== void 0) _.environment = H.environment;
        if (H.user_attributes !== void 0) _.user_attributes = H.user_attributes;
        if (H.experiment_metadata !== void 0) _.experiment_metadata = H.experiment_metadata;
        if (H.device_id !== void 0) _.device_id = H.device_id;
        if (H.auth !== void 0) _.auth = Hi.toJSON(H.auth);
        if (H.session_id !== void 0) _.session_id = H.session_id;
        if (H.anonymous_id !== void 0) _.anonymous_id = H.anonymous_id;
        if (H.event_metadata_vars !== void 0) _.event_metadata_vars = H.event_metadata_vars;
        return _;
      },
      create(H) {
        return vG6.fromPartial(H ?? {});
      },
      fromPartial(H) {
        let _ = mY4();
        return (
          (_.event_id = H.event_id ?? ""),
          (_.timestamp = H.timestamp ?? void 0),
          (_.experiment_id = H.experiment_id ?? ""),
          (_.variation_id = H.variation_id ?? 0),
          (_.environment = H.environment ?? ""),
          (_.user_attributes = H.user_attributes ?? ""),
          (_.experiment_metadata = H.experiment_metadata ?? ""),
          (_.device_id = H.device_id ?? ""),
          (_.auth = H.auth !== void 0 && H.auth !== null ? Hi.fromPartial(H.auth) : void 0),
          (_.session_id = H.session_id ?? ""),
          (_.anonymous_id = H.anonymous_id ?? ""),
          (_.event_metadata_vars = H.event_metadata_vars ?? ""),
          _
        );
      },
    };
