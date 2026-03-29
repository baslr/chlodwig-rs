    L_();
    T7();
    fZH = class fZH extends Error {
      constructor(H, _) {
        let q,
          $ = H[0];
        if (H.length === 1 && $)
          q = `Image base64 size (${t7($.size)}) exceeds API limit (${t7(_)}). Please resize the image before sending.`;
        else
          q =
            `${H.length} images exceed the API limit (${t7(_)}): ` +
            H.map((K) => `Image ${K.index}: ${t7(K.size)}`).join(", ") +
            ". Please resize these images before sending.";
        super(q);
        this.name = "ImageSizeError";
      }
    };
