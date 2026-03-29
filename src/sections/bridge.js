    k_();
    ni_();
    s1();
    H_();
    SO();
    g_();
    h_();
    XT();
    N_();
    XC();
    a8_();
    e7();
    M38();
    fo_();
    C18();
    Jn_();
    Vi9();
    (Si9 = require("stream")), (Ei9 = require("url"));
    io_ = class io_ extends sq_ {
      url;
      transport;
      inputStream;
      isBridge = !1;
      isDebug = !1;
      ccrClient = null;
      keepAliveTimer = null;
      constructor(H, _, q) {
        let $ = new Si9.PassThrough({ encoding: "utf8" });
        super($, q);
        (this.inputStream = $), (this.url = new Ei9.URL(H));
        let K = {},
          O = DP();
        if (O) K.Authorization = `Bearer ${O}`;
        else N("[remote-io] No session ingress token available", { level: "error" });
        let T = process.env.CLAUDE_CODE_ENVIRONMENT_RUNNER_VERSION;
        if (T) K["x-environment-runner-version"] = T;
        let z = () => {
          let f = {},
            w = DP();
          if (w) f.Authorization = `Bearer ${w}`;
          let Y = process.env.CLAUDE_CODE_ENVIRONMENT_RUNNER_VERSION;
          if (Y) f["x-environment-runner-version"] = Y;
          return f;
        };
        if (
          ((this.transport = yi9(this.url, K, v_(), z)),
          (this.isBridge = process.env.CLAUDE_CODE_ENVIRONMENT_KIND === "bridge"),
          (this.isDebug = bR()),
          this.transport.setOnData((f) => {
            if ((this.inputStream.write(f), this.isBridge && this.isDebug))
              S7(
                f.endsWith(`
`)
                  ? f
                  : f +
                      `
`,
              );
          }),
          this.transport.setOnClose(() => {
            this.inputStream.end();
          }),
          lH(process.env.CLAUDE_CODE_USE_CCR_V2))
        ) {
          if (!(this.transport instanceof VYH)) throw Error("CCR v2 requires SSETransport; check getTransportForUrl");
          this.ccrClient = new Hq_(this.transport, this.url);
          let f = this.ccrClient.initialize();
          (this.restoredWorkerState = f.catch(() => null)),
            f.catch((Y) => {
              n_("error", "cli_worker_lifecycle_init_failed", { reason: Y instanceof KEH ? Y.reason : "unknown" }),
                AH(Error(`CCRClient initialization failed: ${QH(Y)}`)),
                k9(1, "other");
            }),
            pq(async () => this.ccrClient?.close()),
            i$8((Y, D, j) => this.ccrClient.writeInternalEvent(Y, D, j)),
            n$8(
              () => this.ccrClient.readInternalEvents(),
              () => this.ccrClient.readSubagentInternalEvents(),
            );
          let w = { started: "processing", completed: "processed" };
          nO7((Y, D) => {
            this.ccrClient?.reportDelivery(Y, w[D]);
          }),
            tV9((Y, D) => {
              this.ccrClient?.reportState(Y, D);
            }),
            eV9((Y) => {
              this.ccrClient?.reportMetadata(Y);
            });
        }
        this.transport.connect();
        let A = TU().session_keepalive_interval_v2_ms;
        if (this.isBridge && A > 0)
          (this.keepAliveTimer = setInterval(() => {
            N("[remote-io] keep_alive sent"),
              this.write({ type: "keep_alive" }).catch((f) => {
                N(`[remote-io] keep_alive write failed: ${QH(f)}`);
              });
          }, A)),
            this.keepAliveTimer.unref?.();
        if ((pq(async () => this.close()), _)) {
          let f = this.inputStream;
          (async () => {
            for await (let w of _)
              f.write(
                String(w).replace(/\n$/, "") +
                  `
`,
              );
          })();
        }
      }
      flushInternalEvents() {
        return this.ccrClient?.flushInternalEvents() ?? Promise.resolve();
      }
      get internalEventsPending() {
        return this.ccrClient?.internalEventsPending ?? 0;
      }
      async write(H) {
        if (this.ccrClient) await this.ccrClient.writeEvent(H);
        else await this.transport.write(H);
        if (this.isBridge) {
          if (H.type === "control_request" || this.isDebug)
            S7(
              zo_(H) +
                `
`,
            );
        }
      }
      close() {
        if (this.keepAliveTimer) clearInterval(this.keepAliveTimer), (this.keepAliveTimer = null);
        this.transport.close(), this.inputStream.end();
      }
    };
