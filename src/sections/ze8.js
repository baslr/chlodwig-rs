    Te8 = require("stream");
    hA6 = class hA6 extends Te8.Transform {
      priorSignature;
      messageSigner;
      eventStreamCodec;
      systemClockOffsetProvider;
      constructor(H) {
        super({ autoDestroy: !0, readableObjectMode: !0, writableObjectMode: !0, ...H });
        (this.priorSignature = H.priorSignature),
          (this.eventStreamCodec = H.eventStreamCodec),
          (this.messageSigner = H.messageSigner),
          (this.systemClockOffsetProvider = H.systemClockOffsetProvider);
      }
      async _transform(H, _, q) {
        try {
          let $ = new Date(Date.now() + (await this.systemClockOffsetProvider())),
            K = { ":date": { type: "timestamp", value: $ } },
            O = await this.messageSigner.sign(
              { message: { body: H, headers: K }, priorSignature: this.priorSignature },
              { signingDate: $ },
            );
          this.priorSignature = O.signature;
          let T = this.eventStreamCodec.encode({
            headers: { ...K, ":chunk-signature": { type: "binary", value: NF$(O.signature) } },
            body: H,
          });
          return this.push(T), q();
        } catch ($) {
          q($);
        }
      }
    };
