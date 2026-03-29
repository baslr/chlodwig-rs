    rU();
    c$_();
    W0();
    Kh();
    LbH();
    xbH = class xbH {
      constructor(H, _, q) {
        bbH.add(this),
          (this.client = H),
          x2H.set(this, !1),
          k4H.set(this, !1),
          jM.set(this, void 0),
          IbH.set(this, void 0),
          Oh.set(this, void 0),
          tU.set(this, void 0),
          rs.set(this, void 0),
          ubH.set(this, 0),
          _7(this, jM, { params: { ..._, messages: structuredClone(_.messages) } }, "f");
        let K = ["BetaToolRunner", ...Ke_(_.tools, _.messages)].join(", ");
        _7(this, IbH, { ...q, headers: W4([{ "x-stainless-helper": K }, q?.headers]) }, "f"), _7(this, rs, df8(), "f");
      }
      async *[((x2H = new WeakMap()),
      (k4H = new WeakMap()),
      (jM = new WeakMap()),
      (IbH = new WeakMap()),
      (Oh = new WeakMap()),
      (tU = new WeakMap()),
      (rs = new WeakMap()),
      (ubH = new WeakMap()),
      (bbH = new WeakSet()),
      (gf8 = async function () {
        let _ = V6(this, jM, "f").params.compactionControl;
        if (!_ || !_.enabled) return !1;
        let q = 0;
        if (V6(this, Oh, "f") !== void 0)
          try {
            let A = await V6(this, Oh, "f");
            q =
              A.usage.input_tokens +
              (A.usage.cache_creation_input_tokens ?? 0) +
              (A.usage.cache_read_input_tokens ?? 0) +
              A.usage.output_tokens;
          } catch {
            return !1;
          }
        let $ = _.contextTokenThreshold ?? pf8;
        if (q < $) return !1;
        let K = _.model ?? V6(this, jM, "f").params.model,
          O = _.summaryPrompt ?? Bf8,
          T = V6(this, jM, "f").params.messages;
        if (T[T.length - 1].role === "assistant") {
          let A = T[T.length - 1];
          if (Array.isArray(A.content)) {
            let f = A.content.filter((w) => w.type !== "tool_use");
            if (f.length === 0) T.pop();
            else A.content = f;
          }
        }
        let z = await this.client.beta.messages.create(
          {
            model: K,
            messages: [...T, { role: "user", content: [{ type: "text", text: O }] }],
            max_tokens: V6(this, jM, "f").params.max_tokens,
          },
          { headers: { "x-stainless-helper": "compaction" } },
        );
        if (z.content[0]?.type !== "text") throw new q7("Expected text response for compaction");
        return (V6(this, jM, "f").params.messages = [{ role: "user", content: z.content }]), !0;
      }),
      Symbol.asyncIterator)]() {
        var H;
        if (V6(this, x2H, "f")) throw new q7("Cannot iterate over a consumed stream");
        _7(this, x2H, !0, "f"), _7(this, k4H, !0, "f"), _7(this, tU, void 0, "f");
        try {
          while (!0) {
            let _;
            try {
              if (
                V6(this, jM, "f").params.max_iterations &&
                V6(this, ubH, "f") >= V6(this, jM, "f").params.max_iterations
              )
                break;
              _7(this, k4H, !1, "f"),
                _7(this, tU, void 0, "f"),
                _7(this, ubH, ((H = V6(this, ubH, "f")), H++, H), "f"),
                _7(this, Oh, void 0, "f");
              let { max_iterations: q, compactionControl: $, ...K } = V6(this, jM, "f").params;
              if (K.stream)
                (_ = this.client.beta.messages.stream({ ...K }, V6(this, IbH, "f"))),
                  _7(this, Oh, _.finalMessage(), "f"),
                  V6(this, Oh, "f").catch(() => {}),
                  yield _;
              else
                _7(this, Oh, this.client.beta.messages.create({ ...K, stream: !1 }, V6(this, IbH, "f")), "f"),
                  yield V6(this, Oh, "f");
              if (!(await V6(this, bbH, "m", gf8).call(this))) {
                if (!V6(this, k4H, "f")) {
                  let { role: z, content: A } = await V6(this, Oh, "f");
                  V6(this, jM, "f").params.messages.push({ role: z, content: A });
                }
                let T = await V6(this, bbH, "m", Pe_).call(this, V6(this, jM, "f").params.messages.at(-1));
                if (T) V6(this, jM, "f").params.messages.push(T);
                else if (!V6(this, k4H, "f")) break;
              }
            } finally {
              if (_) _.abort();
            }
          }
          if (!V6(this, Oh, "f")) throw new q7("ToolRunner concluded without a message from the server");
          V6(this, rs, "f").resolve(await V6(this, Oh, "f"));
        } catch (_) {
          throw (
            (_7(this, x2H, !1, "f"),
            V6(this, rs, "f").promise.catch(() => {}),
            V6(this, rs, "f").reject(_),
            _7(this, rs, df8(), "f"),
            _)
          );
        }
      }
      setMessagesParams(H) {
        if (typeof H === "function") V6(this, jM, "f").params = H(V6(this, jM, "f").params);
        else V6(this, jM, "f").params = H;
        _7(this, k4H, !0, "f"), _7(this, tU, void 0, "f");
      }
      async generateToolResponse() {
        let H = (await V6(this, Oh, "f")) ?? this.params.messages.at(-1);
        if (!H) return null;
        return V6(this, bbH, "m", Pe_).call(this, H);
      }
      done() {
        return V6(this, rs, "f").promise;
      }
      async runUntilDone() {
        if (!V6(this, x2H, "f")) for await (let H of this);
        return this.done();
      }
      get params() {
        return V6(this, jM, "f").params;
      }
      pushMessages(...H) {
        this.setMessagesParams((_) => ({ ..._, messages: [..._.messages, ...H] }));
      }
      then(H, _) {
        return this.runUntilDone().then(H, _);
      }
    };
    Pe_ = async function (_) {
      if (V6(this, tU, "f") !== void 0) return V6(this, tU, "f");
      return _7(this, tU, EH$(V6(this, jM, "f").params, _), "f"), V6(this, tU, "f");
    };
