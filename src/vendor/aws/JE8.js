  var JE8 = d((rxH) => {
    var nxH = {
        REQUEST_ID: Symbol.for("_AWS_LAMBDA_REQUEST_ID"),
        X_RAY_TRACE_ID: Symbol.for("_AWS_LAMBDA_X_RAY_TRACE_ID"),
        TENANT_ID: Symbol.for("_AWS_LAMBDA_TENANT_ID"),
      },
      dK6 = ["true", "1"].includes(process.env?.AWS_LAMBDA_NODEJS_NO_GLOBAL_AWSLAMBDA ?? "");
    if (!dK6) globalThis.awslambda = globalThis.awslambda || {};
    class hO_ {
      static PROTECTED_KEYS = nxH;
      isProtectedKey(H) {
        return Object.values(nxH).includes(H);
      }
      getRequestId() {
        return this.get(nxH.REQUEST_ID) ?? "-";
      }
      getXRayTraceId() {
        return this.get(nxH.X_RAY_TRACE_ID);
      }
      getTenantId() {
        return this.get(nxH.TENANT_ID);
      }
    }
    class ME8 extends hO_ {
      currentContext;
      getContext() {
        return this.currentContext;
      }
      hasContext() {
        return this.currentContext !== void 0;
      }
      get(H) {
        return this.currentContext?.[H];
      }
      set(H, _) {
        if (this.isProtectedKey(H)) throw Error(`Cannot modify protected Lambda context field: ${String(H)}`);
        (this.currentContext = this.currentContext || {}), (this.currentContext[H] = _);
      }
      run(H, _) {
        this.currentContext = H;
        try {
          return _();
        } finally {
          this.currentContext = void 0;
        }
      }
    }
    class cK6 extends hO_ {
      als;
      static async create() {
        let H = new cK6(),
          _ = await import("async_hooks");
        return (H.als = new _.AsyncLocalStorage()), H;
      }
      getContext() {
        return this.als.getStore();
      }
      hasContext() {
        return this.als.getStore() !== void 0;
      }
      get(H) {
        return this.als.getStore()?.[H];
      }
      set(H, _) {
        if (this.isProtectedKey(H)) throw Error(`Cannot modify protected Lambda context field: ${String(H)}`);
        let q = this.als.getStore();
        if (!q) throw Error("No context available");
        q[H] = _;
      }
      run(H, _) {
        return this.als.run(H, _);
      }
    }
    rxH.InvokeStore = void 0;
    (function (H) {
      let _ = null;
      async function q() {
        if (!_)
          _ = (async () => {
            let K = "AWS_LAMBDA_MAX_CONCURRENCY" in process.env ? await cK6.create() : new ME8();
            if (!dK6 && globalThis.awslambda?.InvokeStore) return globalThis.awslambda.InvokeStore;
            else if (!dK6 && globalThis.awslambda) return (globalThis.awslambda.InvokeStore = K), K;
            else return K;
          })();
        return _;
      }
      (H.getInstanceAsync = q),
        (H._testing =
          process.env.AWS_LAMBDA_BENCHMARK_MODE === "1"
            ? {
                reset: () => {
                  if (((_ = null), globalThis.awslambda?.InvokeStore)) delete globalThis.awslambda.InvokeStore;
                  globalThis.awslambda = {};
                },
              }
            : void 0);
    })(rxH.InvokeStore || (rxH.InvokeStore = {}));
    rxH.InvokeStoreBase = hO_;
  });
