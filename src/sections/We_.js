    W0();
    nt_();
    m2H = class m2H {
      constructor(H, _) {
        (this.iterator = H), (this.controller = _);
      }
      async *decoder() {
        let H = new Qs();
        for await (let _ of this.iterator) for (let q of H.decode(_)) yield JSON.parse(q);
        for (let _ of H.flush()) yield JSON.parse(_);
      }
      [Symbol.asyncIterator]() {
        return this.decoder();
      }
      static fromResponse(H, _) {
        if (!H.body) {
          if ((_.abort(), typeof globalThis.navigator < "u" && globalThis.navigator.product === "ReactNative"))
            throw new q7(
              "The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api",
            );
          throw new q7("Attempted to iterate over a response with no body");
        }
        return new m2H(MbH(H.body), _);
      }
    };
