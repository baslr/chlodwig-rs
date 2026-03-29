    $IH();
    (R0 = {
      staleTTL: 60000,
      maxAge: 14400000,
      cacheKey: "gbFeaturesCache",
      backgroundSync: !0,
      maxEntries: 10,
      disableIdleStreams: !1,
      idleStreamInterval: 20000,
      disableCache: !1,
    }),
      (gp = XY8()),
      (l2H = {
        fetchFeaturesCall: (H) => {
          let { host: _, clientKey: q, headers: $ } = H;
          return gp.fetch(`${_}/api/features/${q}`, { headers: $ });
        },
        fetchRemoteEvalCall: (H) => {
          let { host: _, clientKey: q, payload: $, headers: K } = H,
            O = { method: "POST", headers: { "Content-Type": "application/json", ...K }, body: JSON.stringify($) };
          return gp.fetch(`${_}/api/eval/${q}`, O);
        },
        eventSourceCall: (H) => {
          let { host: _, clientKey: q, headers: $ } = H;
          if ($) return new gp.EventSource(`${_}/sub/${q}`, { headers: $ });
          return new gp.EventSource(`${_}/sub/${q}`);
        },
        startIdleListener: () => {
          let H;
          if (!(typeof window < "u" && typeof document < "u")) return;
          let q = () => {
            if (document.visibilityState === "visible") window.clearTimeout(H), z8$();
            else if (document.visibilityState === "hidden") H = window.setTimeout(T8$, R0.idleStreamInterval);
          };
          return (
            document.addEventListener("visibilitychange", q), () => document.removeEventListener("visibilitychange", q)
          );
        },
        stopIdleListener: () => {},
      });
    try {
      if (globalThis.localStorage) gp.localStorage = globalThis.localStorage;
    } catch (H) {}
    (i2H = new Map()), (KQ = new Map()), (R4_ = new Map()), (n2H = new Map()), (r2H = new Set());
