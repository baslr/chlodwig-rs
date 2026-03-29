    rU();
    is();
    I$_();
    Ye_();
    ye_();
    QbH = class QbH {
      constructor(H, _) {
        nV.add(this),
          (this.messages = []),
          (this.receivedMessages = []),
          ss.set(this, void 0),
          B2H.set(this, null),
          (this.controller = new AbortController()),
          BbH.set(this, void 0),
          F$_.set(this, () => {}),
          gbH.set(this, () => {}),
          dbH.set(this, void 0),
          U$_.set(this, () => {}),
          cbH.set(this, () => {}),
          eU.set(this, {}),
          FbH.set(this, !1),
          Q$_.set(this, !1),
          l$_.set(this, !1),
          v4H.set(this, !1),
          i$_.set(this, void 0),
          n$_.set(this, void 0),
          UbH.set(this, void 0),
          Se_.set(this, (q) => {
            if ((_7(this, Q$_, !0, "f"), oU(q))) q = new FK();
            if (q instanceof FK) return _7(this, l$_, !0, "f"), this._emit("abort", q);
            if (q instanceof q7) return this._emit("error", q);
            if (q instanceof Error) {
              let $ = new q7(q.message);
              return ($.cause = q), this._emit("error", $);
            }
            return this._emit("error", new q7(String(q)));
          }),
          _7(
            this,
            BbH,
            new Promise((q, $) => {
              _7(this, F$_, q, "f"), _7(this, gbH, $, "f");
            }),
            "f",
          ),
          _7(
            this,
            dbH,
            new Promise((q, $) => {
              _7(this, U$_, q, "f"), _7(this, cbH, $, "f");
            }),
            "f",
          ),
          V6(this, BbH, "f").catch(() => {}),
          V6(this, dbH, "f").catch(() => {}),
          _7(this, B2H, H, "f"),
          _7(this, UbH, _?.logger ?? console, "f");
      }
      get response() {
        return V6(this, i$_, "f");
      }
      get request_id() {
        return V6(this, n$_, "f");
      }
      async withResponse() {
        _7(this, v4H, !0, "f");
        let H = await V6(this, BbH, "f");
        if (!H) throw Error("Could not resolve a `Response` object");
        return { data: this, response: H, request_id: H.headers.get("request-id") };
      }
      static fromReadableStream(H) {
        let _ = new QbH(null);
        return _._run(() => _._fromReadableStream(H)), _;
      }
      static createMessage(H, _, q, { logger: $ } = {}) {
        let K = new QbH(_, { logger: $ });
        for (let O of _.messages) K._addMessageParam(O);
        return (
          _7(K, B2H, { ..._, stream: !0 }, "f"),
          K._run(() =>
            K._createMessage(
              H,
              { ..._, stream: !0 },
              { ...q, headers: { ...q?.headers, "X-Stainless-Helper-Method": "stream" } },
            ),
          ),
          K
        );
      }
      _run(H) {
        H().then(
          () => {
            this._emitFinal(), this._emit("end");
          },
          V6(this, Se_, "f"),
        );
      }
      _addMessageParam(H) {
        this.messages.push(H);
      }
      _addMessage(H, _ = !0) {
        if ((this.receivedMessages.push(H), _)) this._emit("message", H);
      }
      async _createMessage(H, _, q) {
        let $ = q?.signal,
          K;
        if ($) {
          if ($.aborted) this.controller.abort();
          (K = this.controller.abort.bind(this.controller)), $.addEventListener("abort", K);
        }
        try {
          V6(this, nV, "m", Ee_).call(this);
          let { response: O, data: T } = await H.create(
            { ..._, stream: !0 },
            { ...q, signal: this.controller.signal },
          ).withResponse();
          this._connected(O);
          for await (let z of T) V6(this, nV, "m", Ce_).call(this, z);
          if (T.controller.signal?.aborted) throw new FK();
          V6(this, nV, "m", be_).call(this);
        } finally {
          if ($ && K) $.removeEventListener("abort", K);
        }
      }
      _connected(H) {
        if (this.ended) return;
        _7(this, i$_, H, "f"),
          _7(this, n$_, H?.headers.get("request-id"), "f"),
          V6(this, F$_, "f").call(this, H),
          this._emit("connect");
      }
      get ended() {
        return V6(this, FbH, "f");
      }
      get errored() {
        return V6(this, Q$_, "f");
      }
      get aborted() {
        return V6(this, l$_, "f");
      }
      abort() {
        this.controller.abort();
      }
      on(H, _) {
        return (V6(this, eU, "f")[H] || (V6(this, eU, "f")[H] = [])).push({ listener: _ }), this;
      }
      off(H, _) {
        let q = V6(this, eU, "f")[H];
        if (!q) return this;
        let $ = q.findIndex((K) => K.listener === _);
        if ($ >= 0) q.splice($, 1);
        return this;
      }
      once(H, _) {
        return (V6(this, eU, "f")[H] || (V6(this, eU, "f")[H] = [])).push({ listener: _, once: !0 }), this;
      }
      emitted(H) {
        return new Promise((_, q) => {
          if ((_7(this, v4H, !0, "f"), H !== "error")) this.once("error", q);
          this.once(H, _);
        });
      }
      async done() {
        _7(this, v4H, !0, "f"), await V6(this, dbH, "f");
      }
      get currentMessage() {
        return V6(this, ss, "f");
      }
      async finalMessage() {
        return await this.done(), V6(this, nV, "m", Ve_).call(this);
      }
      async finalText() {
        return await this.done(), V6(this, nV, "m", Qf8).call(this);
      }
      _emit(H, ..._) {
        if (V6(this, FbH, "f")) return;
        if (H === "end") _7(this, FbH, !0, "f"), V6(this, U$_, "f").call(this);
        let q = V6(this, eU, "f")[H];
        if (q) (V6(this, eU, "f")[H] = q.filter(($) => !$.once)), q.forEach(({ listener: $ }) => $(..._));
        if (H === "abort") {
          let $ = _[0];
          if (!V6(this, v4H, "f") && !q?.length) Promise.reject($);
          V6(this, gbH, "f").call(this, $), V6(this, cbH, "f").call(this, $), this._emit("end");
          return;
        }
        if (H === "error") {
          let $ = _[0];
          if (!V6(this, v4H, "f") && !q?.length) Promise.reject($);
          V6(this, gbH, "f").call(this, $), V6(this, cbH, "f").call(this, $), this._emit("end");
        }
      }
      _emitFinal() {
        if (this.receivedMessages.at(-1)) this._emit("finalMessage", V6(this, nV, "m", Ve_).call(this));
      }
      async _fromReadableStream(H, _) {
        let q = _?.signal,
          $;
        if (q) {
          if (q.aborted) this.controller.abort();
          ($ = this.controller.abort.bind(this.controller)), q.addEventListener("abort", $);
        }
        try {
          V6(this, nV, "m", Ee_).call(this), this._connected(null);
          let K = SR.fromReadableStream(H, this.controller);
          for await (let O of K) V6(this, nV, "m", Ce_).call(this, O);
          if (K.controller.signal?.aborted) throw new FK();
          V6(this, nV, "m", be_).call(this);
        } finally {
          if (q && $) q.removeEventListener("abort", $);
        }
      }
      [((ss = new WeakMap()),
      (B2H = new WeakMap()),
      (BbH = new WeakMap()),
      (F$_ = new WeakMap()),
      (gbH = new WeakMap()),
      (dbH = new WeakMap()),
      (U$_ = new WeakMap()),
      (cbH = new WeakMap()),
      (eU = new WeakMap()),
      (FbH = new WeakMap()),
      (Q$_ = new WeakMap()),
      (l$_ = new WeakMap()),
      (v4H = new WeakMap()),
      (i$_ = new WeakMap()),
      (n$_ = new WeakMap()),
      (UbH = new WeakMap()),
      (Se_ = new WeakMap()),
      (nV = new WeakSet()),
      (Ve_ = function () {
        if (this.receivedMessages.length === 0)
          throw new q7("stream ended without producing a Message with role=assistant");
        return this.receivedMessages.at(-1);
      }),
      (Qf8 = function () {
        if (this.receivedMessages.length === 0)
          throw new q7("stream ended without producing a Message with role=assistant");
        let _ = this.receivedMessages
          .at(-1)
          .content.filter((q) => q.type === "text")
          .map((q) => q.text);
        if (_.length === 0) throw new q7("stream ended without producing a content block with type=text");
        return _.join(" ");
      }),
      (Ee_ = function () {
        if (this.ended) return;
        _7(this, ss, void 0, "f");
      }),
      (Ce_ = function (_) {
        if (this.ended) return;
        let q = V6(this, nV, "m", lf8).call(this, _);
        switch ((this._emit("streamEvent", _, q), _.type)) {
          case "content_block_delta": {
            let $ = q.content.at(-1);
            switch (_.delta.type) {
              case "text_delta": {
                if ($.type === "text") this._emit("text", _.delta.text, $.text || "");
                break;
              }
              case "citations_delta": {
                if ($.type === "text") this._emit("citation", _.delta.citation, $.citations ?? []);
                break;
              }
              case "input_json_delta": {
                if (nf8($) && $.input) this._emit("inputJson", _.delta.partial_json, $.input);
                break;
              }
              case "thinking_delta": {
                if ($.type === "thinking") this._emit("thinking", _.delta.thinking, $.thinking);
                break;
              }
              case "signature_delta": {
                if ($.type === "thinking") this._emit("signature", $.signature);
                break;
              }
              default:
                rf8(_.delta);
            }
            break;
          }
          case "message_stop": {
            this._addMessageParam(q), this._addMessage(Ne_(q, V6(this, B2H, "f"), { logger: V6(this, UbH, "f") }), !0);
            break;
          }
          case "content_block_stop": {
            this._emit("contentBlock", q.content.at(-1));
            break;
          }
          case "message_start": {
            _7(this, ss, q, "f");
            break;
          }
          case "content_block_start":
          case "message_delta":
            break;
        }
      }),
      (be_ = function () {
        if (this.ended) throw new q7("stream has ended, this shouldn't happen");
        let _ = V6(this, ss, "f");
        if (!_) throw new q7("request ended without sending any chunks");
        return _7(this, ss, void 0, "f"), Ne_(_, V6(this, B2H, "f"), { logger: V6(this, UbH, "f") });
      }),
      (lf8 = function (_) {
        let q = V6(this, ss, "f");
        if (_.type === "message_start") {
          if (q) throw new q7(`Unexpected event order, got ${_.type} before receiving "message_stop"`);
          return _.message;
        }
        if (!q) throw new q7(`Unexpected event order, got ${_.type} before "message_start"`);
        switch (_.type) {
          case "message_stop":
            return q;
          case "message_delta":
            if (
              ((q.stop_reason = _.delta.stop_reason),
              (q.stop_sequence = _.delta.stop_sequence),
              (q.usage.output_tokens = _.usage.output_tokens),
              _.usage.input_tokens != null)
            )
              q.usage.input_tokens = _.usage.input_tokens;
            if (_.usage.cache_creation_input_tokens != null)
              q.usage.cache_creation_input_tokens = _.usage.cache_creation_input_tokens;
            if (_.usage.cache_read_input_tokens != null)
              q.usage.cache_read_input_tokens = _.usage.cache_read_input_tokens;
            if (_.usage.server_tool_use != null) q.usage.server_tool_use = _.usage.server_tool_use;
            return q;
          case "content_block_start":
            return q.content.push({ ..._.content_block }), q;
          case "content_block_delta": {
            let $ = q.content.at(_.index);
            switch (_.delta.type) {
              case "text_delta": {
                if ($?.type === "text") q.content[_.index] = { ...$, text: ($.text || "") + _.delta.text };
                break;
              }
              case "citations_delta": {
                if ($?.type === "text")
                  q.content[_.index] = { ...$, citations: [...($.citations ?? []), _.delta.citation] };
                break;
              }
              case "input_json_delta": {
                if ($ && nf8($)) {
                  let K = $[if8] || "";
                  K += _.delta.partial_json;
                  let O = { ...$ };
                  if ((Object.defineProperty(O, if8, { value: K, enumerable: !1, writable: !0 }), K)) O.input = b$_(K);
                  q.content[_.index] = O;
                }
                break;
              }
              case "thinking_delta": {
                if ($?.type === "thinking") q.content[_.index] = { ...$, thinking: $.thinking + _.delta.thinking };
                break;
              }
              case "signature_delta": {
                if ($?.type === "thinking") q.content[_.index] = { ...$, signature: _.delta.signature };
                break;
              }
              default:
                rf8(_.delta);
            }
            return q;
          }
          case "content_block_stop":
            return q;
        }
      }),
      Symbol.asyncIterator)]() {
        let H = [],
          _ = [],
          q = !1;
        return (
          this.on("streamEvent", ($) => {
            let K = _.shift();
            if (K) K.resolve($);
            else H.push($);
          }),
          this.on("end", () => {
            q = !0;
            for (let $ of _) $.resolve(void 0);
            _.length = 0;
          }),
          this.on("abort", ($) => {
            q = !0;
            for (let K of _) K.reject($);
            _.length = 0;
          }),
          this.on("error", ($) => {
            q = !0;
            for (let K of _) K.reject($);
            _.length = 0;
          }),
          {
            next: async () => {
              if (!H.length) {
                if (q) return { value: void 0, done: !0 };
                return new Promise((K, O) => _.push({ resolve: K, reject: O })).then((K) =>
                  K ? { value: K, done: !1 } : { value: void 0, done: !0 },
                );
              }
              return { value: H.shift(), done: !1 };
            },
            return: async () => {
              return this.abort(), { value: void 0, done: !0 };
            },
          }
        );
      }
      toReadableStream() {
        return new SR(this[Symbol.asyncIterator].bind(this), this.controller).toReadableStream();
      }
    };
