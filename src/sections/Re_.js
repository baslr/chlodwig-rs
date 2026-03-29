    is();
    ze_();
    Kh();
    LbH();
    we_();
    mf8();
    Xe_();
    c$_();
    Ge_();
    Ge_();
    Xe_();
    c$_();
    (cf8 = {
      "claude-1.3": "November 6th, 2024",
      "claude-1.3-100k": "November 6th, 2024",
      "claude-instant-1.1": "November 6th, 2024",
      "claude-instant-1.1-100k": "November 6th, 2024",
      "claude-instant-1.2": "November 6th, 2024",
      "claude-3-sonnet-20240229": "July 21st, 2025",
      "claude-3-opus-20240229": "January 5th, 2026",
      "claude-2.1": "July 21st, 2025",
      "claude-2.0": "July 21st, 2025",
      "claude-3-7-sonnet-latest": "February 19th, 2026",
      "claude-3-7-sonnet-20250219": "February 19th, 2026",
    }),
      (bH$ = ["claude-opus-4-6"]);
    os = class os extends OY {
      constructor() {
        super(...arguments);
        this.batches = new mbH(this._client);
      }
      create(H, _) {
        let q = Ff8(H),
          { betas: $, ...K } = q;
        if (K.model in cf8)
          console.warn(`The model '${K.model}' is deprecated and will reach end-of-life on ${cf8[K.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`);
        if (K.model in bH$ && K.thinking && K.thinking.type === "enabled")
          console.warn(
            `Using Claude with ${K.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`,
          );
        let O = this._client._options.timeout;
        if (!K.stream && O == null) {
          let z = C$_[K.model] ?? void 0;
          O = this._client.calculateNonstreamingTimeout(K.max_tokens, z);
        }
        let T = E$_(K.tools, K.messages);
        return this._client.post("/v1/messages?beta=true", {
          body: K,
          timeout: O ?? 600000,
          ..._,
          headers: W4([{ ...($?.toString() != null ? { "anthropic-beta": $?.toString() } : void 0) }, T, _?.headers]),
          stream: q.stream ?? !1,
        });
      }
      parse(H, _) {
        return (
          (_ = {
            ..._,
            headers: W4([
              { "anthropic-beta": [...(H.betas ?? []), "structured-outputs-2025-12-15"].toString() },
              _?.headers,
            ]),
          }),
          this.create(H, _).then((q) => fe_(q, H, { logger: this._client.logger ?? console }))
        );
      }
      stream(H, _) {
        return CbH.createMessage(this, H, _);
      }
      countTokens(H, _) {
        let q = Ff8(H),
          { betas: $, ...K } = q;
        return this._client.post("/v1/messages/count_tokens?beta=true", {
          body: K,
          ..._,
          headers: W4([{ "anthropic-beta": [...($ ?? []), "token-counting-2024-11-01"].toString() }, _?.headers]),
        });
      }
      toolRunner(H, _) {
        return new xbH(this._client, H, _);
      }
    };
    os.Batches = mbH;
    os.BetaToolRunner = xbH;
    os.ToolError = u2H;
