    gA();
    zj6(); /*! @azure/msal-common v15.13.1 2025-10-29 */
    (k2_ = {
      [jBH]: "Unexpected error in authentication.",
      [MBH]:
        "Post request failed from the network, could be a 4xx/5xx or a network unavailability. Please check the exact error code for details.",
    }),
      (Aj6 = { unexpectedError: { code: jBH, desc: k2_[jBH] }, postRequestFailed: { code: MBH, desc: k2_[MBH] } });
    l4 = class l4 extends Error {
      constructor(H, _, q) {
        let $ = _ ? `${H}: ${_}` : H;
        super($);
        Object.setPrototypeOf(this, l4.prototype),
          (this.errorCode = H || d6.EMPTY_STRING),
          (this.errorMessage = _ || d6.EMPTY_STRING),
          (this.subError = q || d6.EMPTY_STRING),
          (this.name = "AuthError");
      }
      setCorrelationId(H) {
        this.correlationId = H;
      }
    };
