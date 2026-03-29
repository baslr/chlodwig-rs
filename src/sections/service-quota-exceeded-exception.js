    tf_();
    cmH = class cmH extends vM {
      name = "AccessDeniedException";
      $fault = "client";
      constructor(H) {
        super({ name: "AccessDeniedException", $fault: "client", ...H });
        Object.setPrototypeOf(this, cmH.prototype);
      }
    };
    OKH = class OKH extends vM {
      name = "InternalServerException";
      $fault = "server";
      constructor(H) {
        super({ name: "InternalServerException", $fault: "server", ...H });
        Object.setPrototypeOf(this, OKH.prototype);
      }
    };
    TKH = class TKH extends vM {
      name = "ThrottlingException";
      $fault = "client";
      constructor(H) {
        super({ name: "ThrottlingException", $fault: "client", ...H });
        Object.setPrototypeOf(this, TKH.prototype);
      }
    };
    zKH = class zKH extends vM {
      name = "ValidationException";
      $fault = "client";
      constructor(H) {
        super({ name: "ValidationException", $fault: "client", ...H });
        Object.setPrototypeOf(this, zKH.prototype);
      }
    };
    FmH = class FmH extends vM {
      name = "ConflictException";
      $fault = "client";
      constructor(H) {
        super({ name: "ConflictException", $fault: "client", ...H });
        Object.setPrototypeOf(this, FmH.prototype);
      }
    };
    UmH = class UmH extends vM {
      name = "ResourceNotFoundException";
      $fault = "client";
      constructor(H) {
        super({ name: "ResourceNotFoundException", $fault: "client", ...H });
        Object.setPrototypeOf(this, UmH.prototype);
      }
    };
    QmH = class QmH extends vM {
      name = "ServiceQuotaExceededException";
      $fault = "client";
      constructor(H) {
        super({ name: "ServiceQuotaExceededException", $fault: "client", ...H });
        Object.setPrototypeOf(this, QmH.prototype);
      }
    };
    lmH = class lmH extends vM {
      name = "ServiceUnavailableException";
      $fault = "server";
      constructor(H) {
        super({ name: "ServiceUnavailableException", $fault: "server", ...H });
        Object.setPrototypeOf(this, lmH.prototype);
      }
    };
    imH = class imH extends vM {
      name = "ModelErrorException";
      $fault = "client";
      originalStatusCode;
      resourceName;
      constructor(H) {
        super({ name: "ModelErrorException", $fault: "client", ...H });
        Object.setPrototypeOf(this, imH.prototype),
          (this.originalStatusCode = H.originalStatusCode),
          (this.resourceName = H.resourceName);
      }
    };
    nmH = class nmH extends vM {
      name = "ModelNotReadyException";
      $fault = "client";
      $retryable = {};
      constructor(H) {
        super({ name: "ModelNotReadyException", $fault: "client", ...H });
        Object.setPrototypeOf(this, nmH.prototype);
      }
    };
    rmH = class rmH extends vM {
      name = "ModelTimeoutException";
      $fault = "client";
      constructor(H) {
        super({ name: "ModelTimeoutException", $fault: "client", ...H });
        Object.setPrototypeOf(this, rmH.prototype);
      }
    };
    AKH = class AKH extends vM {
      name = "ModelStreamErrorException";
      $fault = "client";
      originalStatusCode;
      originalMessage;
      constructor(H) {
        super({ name: "ModelStreamErrorException", $fault: "client", ...H });
        Object.setPrototypeOf(this, AKH.prototype),
          (this.originalStatusCode = H.originalStatusCode),
          (this.originalMessage = H.originalMessage);
      }
    };
