    Kh();
    LbH();
    of8();
    ye_();
    Ie_();
    Ie_();
    ze_();
    Th = class Th extends OY {
      constructor() {
        super(...arguments);
        this.batches = new lbH(this._client);
      }
      create(H, _) {
        if (H.model in af8)
          console.warn(`The model '${H.model}' is deprecated and will reach end-of-life on ${af8[H.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`);
        if (H.model in BH$ && H.thinking && H.thinking.type === "enabled")
          console.warn(
            `Using Claude with ${H.model} and 'thinking.type=enabled' is deprecated. Use 'thinking.type=adaptive' instead which results in better model performance in our testing: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking`,
          );
        let q = this._client._options.timeout;
        if (!H.stream && q == null) {
          let K = C$_[H.model] ?? void 0;
          q = this._client.calculateNonstreamingTimeout(H.max_tokens, K);
        }
        let $ = E$_(H.tools, H.messages);
        return this._client.post("/v1/messages", {
          body: H,
          timeout: q ?? 600000,
          ..._,
          headers: W4([$, _?.headers]),
          stream: H.stream ?? !1,
        });
      }
      parse(H, _) {
        return this.create(H, _).then((q) => he_(q, H, { logger: this._client.logger ?? console }));
      }
      stream(H, _) {
        return QbH.createMessage(this, H, _, { logger: this._client.logger ?? console });
      }
      countTokens(H, _) {
        return this._client.post("/v1/messages/count_tokens", { body: H, ..._ });
      }
    };
    (af8 = {
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
      "claude-3-5-haiku-latest": "February 19th, 2026",
      "claude-3-5-haiku-20241022": "February 19th, 2026",
    }),
      (BH$ = ["claude-opus-4-6"]);
    Th.Batches = lbH;
