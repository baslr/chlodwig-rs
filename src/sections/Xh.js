    uA();
    lR = class lR extends Error {
      static from(H, _, q, $, K, O) {
        let T = new lR(H.message, _ || H.code, q, $, K);
        if (((T.cause = H), (T.name = H.name), H.status != null && T.status == null)) T.status = H.status;
        return O && Object.assign(T, O), T;
      }
      constructor(H, _, q, $, K) {
        super(H);
        if (
          (Object.defineProperty(this, "message", { value: H, enumerable: !0, writable: !0, configurable: !0 }),
          (this.name = "AxiosError"),
          (this.isAxiosError = !0),
          _ && (this.code = _),
          q && (this.config = q),
          $ && (this.request = $),
          K)
        )
          (this.response = K), (this.status = K.status);
      }
      toJSON() {
        return {
          message: this.message,
          name: this.name,
          description: this.description,
          number: this.number,
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          config: Q_.toJSONObject(this.config),
          code: this.code,
          status: this.status,
        };
      }
    };
    lR.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
    lR.ERR_BAD_OPTION = "ERR_BAD_OPTION";
    lR.ECONNABORTED = "ECONNABORTED";
    lR.ETIMEDOUT = "ETIMEDOUT";
    lR.ERR_NETWORK = "ERR_NETWORK";
    lR.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
    lR.ERR_DEPRECATED = "ERR_DEPRECATED";
    lR.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
    lR.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
    lR.ERR_CANCELED = "ERR_CANCELED";
    lR.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
    lR.ERR_INVALID_URL = "ERR_INVALID_URL";
    eq = lR;
