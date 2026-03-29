    Z9();
    H_();
    SO();
    XC();
    h18();
    y18();
    e8_ = class e8_ extends t8_ {
      postUrl;
      uploader;
      streamEventBuffer = [];
      streamEventTimer = null;
      constructor(H, _ = {}, q, $, K) {
        super(H, _, q, $, K);
        let { maxConsecutiveFailures: O, onBatchDropped: T } = K ?? {};
        (this.postUrl = yjK(H)),
          (this.uploader = new yYH({
            maxBatchSize: 500,
            maxQueueSize: 1e5,
            baseDelayMs: 500,
            maxDelayMs: 8000,
            jitterMs: 1000,
            maxConsecutiveFailures: O,
            onBatchDropped: (z, A) => {
              n_("error", "cli_hybrid_batch_dropped_max_failures", { batchSize: z, failures: A }), T?.(z, A);
            },
            send: (z) => this.postOnce(z),
          })),
          N(`HybridTransport: POST URL = ${this.postUrl}`),
          n_("info", "cli_hybrid_transport_initialized");
      }
      async write(H) {
        if (H.type === "stream_event") {
          if ((this.streamEventBuffer.push(H), !this.streamEventTimer))
            this.streamEventTimer = setTimeout(() => this.flushStreamEvents(), vjK);
          return;
        }
        return await this.uploader.enqueue([...this.takeStreamEvents(), H]), this.uploader.flush();
      }
      async writeBatch(H) {
        return await this.uploader.enqueue([...this.takeStreamEvents(), ...H]), this.uploader.flush();
      }
      get droppedBatchCount() {
        return this.uploader.droppedBatchCount;
      }
      flush() {
        return this.uploader.enqueue(this.takeStreamEvents()), this.uploader.flush();
      }
      takeStreamEvents() {
        if (this.streamEventTimer) clearTimeout(this.streamEventTimer), (this.streamEventTimer = null);
        let H = this.streamEventBuffer;
        return (this.streamEventBuffer = []), H;
      }
      flushStreamEvents() {
        (this.streamEventTimer = null), this.uploader.enqueue(this.takeStreamEvents());
      }
      close() {
        if (this.streamEventTimer) clearTimeout(this.streamEventTimer), (this.streamEventTimer = null);
        this.streamEventBuffer = [];
        let H = this.uploader,
          _;
        Promise.race([
          H.flush(),
          new Promise((q) => {
            _ = setTimeout(q, hjK);
          }),
        ]).finally(() => {
          clearTimeout(_), H.close();
        }),
          super.close();
      }
      async postOnce(H) {
        let _ = DP();
        if (!_) {
          N("HybridTransport: No session token available for POST"), n_("warn", "cli_hybrid_post_no_token");
          return;
        }
        let q = { Authorization: `Bearer ${_}`, "Content-Type": "application/json" },
          $;
        try {
          $ = await T6.post(this.postUrl, { events: H }, { headers: q, validateStatus: () => !0, timeout: NjK });
        } catch (K) {
          throw (N(`HybridTransport: POST error: ${K.message}`), n_("warn", "cli_hybrid_post_network_error"), K);
        }
        if ($.status >= 200 && $.status < 300) {
          N(`HybridTransport: POST success count=${H.length}`);
          return;
        }
        if ($.status >= 400 && $.status < 500 && $.status !== 429) {
          N(`HybridTransport: POST returned ${$.status} (permanent), dropping`),
            n_("warn", "cli_hybrid_post_client_error", { status: $.status });
          return;
        }
        throw (
          (N(`HybridTransport: POST returned ${$.status} (retryable)`),
          n_("warn", "cli_hybrid_post_retryable_error", { status: $.status }),
          Error(`POST failed with ${$.status}`))
        );
      }
    };
