    rU();
    Ye_();
    is();
    I$_();
    we_();
    CbH = class CbH {
      constructor(H, _) {
        iV.add(this),
          (this.messages = []),
          (this.receivedMessages = []),
          ns.set(this, void 0),
          I2H.set(this, null),
          (this.controller = new AbortController()),
          NbH.set(this, void 0),
          u$_.set(this, () => {}),
          hbH.set(this, () => {}),
          ybH.set(this, void 0),
          x$_.set(this, () => {}),
          VbH.set(this, () => {}),
          sU.set(this, {}),
          SbH.set(this, !1),
          m$_.set(this, !1),
          p$_.set(this, !1),
          L4H.set(this, !1),
          B$_.set(this, void 0),
          g$_.set(this, void 0),
          EbH.set(this, void 0),
          d$_.set(this, (q) => {
            if ((_7(this, m$_, !0, "f"), oU(q))) q = new FK();
            if (q instanceof FK) return _7(this, p$_, !0, "f"), this._emit("abort", q);
            if (q instanceof q7) return this._emit("error", q);
            if (q instanceof Error) {
              let $ = new q7(q.message);
              return ($.cause = q), this._emit("error", $);
            }
            return this._emit("error", new q7(String(q)));
          }),
          _7(
            this,
            NbH,
            new Promise((q, $) => {
              _7(this, u$_, q, "f"), _7(this, hbH, $, "f");
            }),
            "f",
          ),
          _7(
            this,
            ybH,
            new Promise((q, $) => {
              _7(this, x$_, q, "f"), _7(this, VbH, $, "f");
            }),
            "f",
          ),
          V6(this, NbH, "f").catch(() => {}),
          V6(this, ybH, "f").catch(() => {}),
          _7(this, I2H, H, "f"),
          _7(this, EbH, _?.logger ?? console, "f");
      }
      get response() {
        return V6(this, B$_, "f");
      }
      get request_id() {
        return V6(this, g$_, "f");
      }
      async withResponse() {
        _7(this, L4H, !0, "f");
        let H = await V6(this, NbH, "f");
        if (!H) throw Error("Could not resolve a `Response` object");
        return { data: this, response: H, request_id: H.headers.get("request-id") };
      }
      static fromReadableStream(H) {
        let _ = new CbH(null);
        return _._run(() => _._fromReadableStream(H)), _;
      }
      static createMessage(H, _, q, { logger: $ } = {}) {
        let K = new CbH(_, { logger: $ });
        for (let O of _.messages) K._addMessageParam(O);
        return (
          _7(K, I2H, { ..._, stream: !0 }, "f"),
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
          V6(this, d$_, "f"),
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
          V6(this, iV, "m", je_).call(this);
          let { response: O, data: T } = await H.create(
            { ..._, stream: !0 },
            { ...q, signal: this.controller.signal },
          ).withResponse();
          this._connected(O);
          for await (let z of T) V6(this, iV, "m", Me_).call(this, z);
          if (T.controller.signal?.aborted) throw new FK();
          V6(this, iV, "m", Je_).call(this);
        } finally {
          if ($ && K) $.removeEventListener("abort", K);
        }
      }
      _connected(H) {
        if (this.ended) return;
        _7(this, B$_, H, "f"),
          _7(this, g$_, H?.headers.get("request-id"), "f"),
          V6(this, u$_, "f").call(this, H),
          this._emit("connect");
      }
      get ended() {
        return V6(this, SbH, "f");
      }
      get errored() {
        return V6(this, m$_, "f");
      }
      get aborted() {
        return V6(this, p$_, "f");
      }
      abort() {
        this.controller.abort();
      }
      on(H, _) {
        return (V6(this, sU, "f")[H] || (V6(this, sU, "f")[H] = [])).push({ listener: _ }), this;
      }
      off(H, _) {
        let q = V6(this, sU, "f")[H];
        if (!q) return this;
        let $ = q.findIndex((K) => K.listener === _);
        if ($ >= 0) q.splice($, 1);
        return this;
      }
      once(H, _) {
        return (V6(this, sU, "f")[H] || (V6(this, sU, "f")[H] = [])).push({ listener: _, once: !0 }), this;
      }
      emitted(H) {
        return new Promise((_, q) => {
          if ((_7(this, L4H, !0, "f"), H !== "error")) this.once("error", q);
          this.once(H, _);
        });
      }
      async done() {
        _7(this, L4H, !0, "f"), await V6(this, ybH, "f");
      }
      get currentMessage() {
        return V6(this, ns, "f");
      }
      async finalMessage() {
        return await this.done(), V6(this, iV, "m", De_).call(this);
      }
      async finalText() {
        return await this.done(), V6(this, iV, "m", Cf8).call(this);
      }
      _emit(H, ..._) {
        if (V6(this, SbH, "f")) return;
        if (H === "end") _7(this, SbH, !0, "f"), V6(this, x$_, "f").call(this);
        let q = V6(this, sU, "f")[H];
        if (q) (V6(this, sU, "f")[H] = q.filter(($) => !$.once)), q.forEach(({ listener: $ }) => $(..._));
        if (H === "abort") {
          let $ = _[0];
          if (!V6(this, L4H, "f") && !q?.length) Promise.reject($);
          V6(this, hbH, "f").call(this, $), V6(this, VbH, "f").call(this, $), this._emit("end");
          return;
        }
        if (H === "error") {
          let $ = _[0];
          if (!V6(this, L4H, "f") && !q?.length) Promise.reject($);
          V6(this, hbH, "f").call(this, $), V6(this, VbH, "f").call(this, $), this._emit("end");
        }
      }
      _emitFinal() {
        if (this.receivedMessages.at(-1)) this._emit("finalMessage", V6(this, iV, "m", De_).call(this));
      }
      async _fromReadableStream(H, _) {
        let q = _?.signal,
          $;
        if (q) {
          if (q.aborted) this.controller.abort();
          ($ = this.controller.abort.bind(this.controller)), q.addEventListener("abort", $);
        }
        try {
          V6(this, iV, "m", je_).call(this), this._connected(null);
          let K = SR.fromReadableStream(H, this.controller);
          for await (let O of K) V6(this, iV, "m", Me_).call(this, O);
          if (K.controller.signal?.aborted) throw new FK();
          V6(this, iV, "m", Je_).call(this);
        } finally {
          if (q && $) q.removeEventListener("abort", $);
        }
      }
      [((ns = new WeakMap()),
      (I2H = new WeakMap()),
      (NbH = new WeakMap()),
      (u$_ = new WeakMap()),
      (hbH = new WeakMap()),
      (ybH = new WeakMap()),
      (x$_ = new WeakMap()),
      (VbH = new WeakMap()),
      (sU = new WeakMap()),
      (SbH = new WeakMap()),
      (m$_ = new WeakMap()),
      (p$_ = new WeakMap()),
      (L4H = new WeakMap()),
      (B$_ = new WeakMap()),
      (g$_ = new WeakMap()),
      (EbH = new WeakMap()),
      (d$_ = new WeakMap()),
      (iV = new WeakSet()),
      (De_ = function () {
        if (this.receivedMessages.length === 0)
          throw new q7("stream ended without producing a Message with role=assistant");
        return this.receivedMessages.at(-1);
      }),
      (Cf8 = function () {
        if (this.receivedMessages.length === 0)
          throw new q7("stream ended without producing a Message with role=assistant");
        let _ = this.receivedMessages
          .at(-1)
          .content.filter((q) => q.type === "text")
          .map((q) => q.text);
        if (_.length === 0) throw new q7("stream ended without producing a content block with type=text");
        return _.join(" ");
      }),
      (je_ = function () {
        if (this.ended) return;
        _7(this, ns, void 0, "f");
      }),
      (Me_ = function (_) {
        if (this.ended) return;
        let q = V6(this, iV, "m", bf8).call(this, _);
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
                if (uf8($) && $.input) this._emit("inputJson", _.delta.partial_json, $.input);
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
              case "compaction_delta": {
                if ($.type === "compaction" && $.content) this._emit("compaction", $.content);
                break;
              }
              default:
                xf8(_.delta);
            }
            break;
          }
          case "message_stop": {
            this._addMessageParam(q), this._addMessage(Ae_(q, V6(this, I2H, "f"), { logger: V6(this, EbH, "f") }), !0);
            break;
          }
          case "content_block_stop": {
            this._emit("contentBlock", q.content.at(-1));
            break;
          }
          case "message_start": {
            _7(this, ns, q, "f");
            break;
          }
          case "content_block_start":
          case "message_delta":
            break;
        }
      }),
      (Je_ = function () {
        if (this.ended) throw new q7("stream has ended, this shouldn't happen");
        let _ = V6(this, ns, "f");
        if (!_) throw new q7("request ended without sending any chunks");
        return _7(this, ns, void 0, "f"), Ae_(_, V6(this, I2H, "f"), { logger: V6(this, EbH, "f") });
      }),
      (bf8 = function (_) {
        let q = V6(this, ns, "f");
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
              ((q.container = _.delta.container),
              (q.stop_reason = _.delta.stop_reason),
              (q.stop_sequence = _.delta.stop_sequence),
              (q.usage.output_tokens = _.usage.output_tokens),
              (q.context_management = _.context_management),
              _.usage.input_tokens != null)
            )
              q.usage.input_tokens = _.usage.input_tokens;
            if (_.usage.cache_creation_input_tokens != null)
              q.usage.cache_creation_input_tokens = _.usage.cache_creation_input_tokens;
            if (_.usage.cache_read_input_tokens != null)
              q.usage.cache_read_input_tokens = _.usage.cache_read_input_tokens;
            if (_.usage.server_tool_use != null) q.usage.server_tool_use = _.usage.server_tool_use;
            if (_.usage.iterations != null) q.usage.iterations = _.usage.iterations;
            return q;
          case "content_block_start":
            return q.content.push(_.content_block), q;
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
                if ($ && uf8($)) {
                  let K = $[If8] || "";
                  K += _.delta.partial_json;
                  let O = { ...$ };
                  if ((Object.defineProperty(O, If8, { value: K, enumerable: !1, writable: !0 }), K))
                    try {
                      O.input = b$_(K);
                    } catch (T) {
                      let z = new q7(
                        `Unable to parse tool parameter JSON from model. Please retry your request or adjust your prompt. Error: ${T}. JSON: ${K}`,
                      );
                      V6(this, d$_, "f").call(this, z);
                    }
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
              case "compaction_delta": {
                if ($?.type === "compaction")
                  q.content[_.index] = { ...$, content: ($.content || "") + _.delta.content };
                break;
              }
              default:
                xf8(_.delta);
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
