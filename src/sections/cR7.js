    Vp6();
    tp6 = class tp6 extends TransformStream {
      constructor({ onError: H, onRetry: _, onComment: q } = {}) {
        let $;
        super({
          start(K) {
            $ = CV_({
              onEvent: (O) => {
                K.enqueue(O);
              },
              onError(O) {
                H === "terminate" ? K.error(O) : typeof H == "function" && H(O);
              },
              onRetry: _,
              onComment: q,
            });
          },
          transform(K) {
            $.feed(K);
          },
        });
      }
    };
