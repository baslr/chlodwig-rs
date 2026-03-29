    bz_();
    kmH = class kmH extends XX {
      name = "AccessDeniedException";
      $fault = "client";
      constructor(H) {
        super({ name: "AccessDeniedException", $fault: "client", ...H });
        Object.setPrototypeOf(this, kmH.prototype);
      }
    };
    vmH = class vmH extends XX {
      name = "InternalServerException";
      $fault = "server";
      constructor(H) {
        super({ name: "InternalServerException", $fault: "server", ...H });
        Object.setPrototypeOf(this, vmH.prototype);
      }
    };
    NmH = class NmH extends XX {
      name = "ResourceNotFoundException";
      $fault = "client";
      constructor(H) {
        super({ name: "ResourceNotFoundException", $fault: "client", ...H });
        Object.setPrototypeOf(this, NmH.prototype);
      }
    };
    hmH = class hmH extends XX {
      name = "ThrottlingException";
      $fault = "client";
      constructor(H) {
        super({ name: "ThrottlingException", $fault: "client", ...H });
        Object.setPrototypeOf(this, hmH.prototype);
      }
    };
    ymH = class ymH extends XX {
      name = "ValidationException";
      $fault = "client";
      constructor(H) {
        super({ name: "ValidationException", $fault: "client", ...H });
        Object.setPrototypeOf(this, ymH.prototype);
      }
    };
    VmH = class VmH extends XX {
      name = "ConflictException";
      $fault = "client";
      constructor(H) {
        super({ name: "ConflictException", $fault: "client", ...H });
        Object.setPrototypeOf(this, VmH.prototype);
      }
    };
    SmH = class SmH extends XX {
      name = "ServiceQuotaExceededException";
      $fault = "client";
      constructor(H) {
        super({ name: "ServiceQuotaExceededException", $fault: "client", ...H });
        Object.setPrototypeOf(this, SmH.prototype);
      }
    };
    EmH = class EmH extends XX {
      name = "TooManyTagsException";
      $fault = "client";
      resourceName;
      constructor(H) {
        super({ name: "TooManyTagsException", $fault: "client", ...H });
        Object.setPrototypeOf(this, EmH.prototype), (this.resourceName = H.resourceName);
      }
    };
    CmH = class CmH extends XX {
      name = "ResourceInUseException";
      $fault = "client";
      constructor(H) {
        super({ name: "ResourceInUseException", $fault: "client", ...H });
        Object.setPrototypeOf(this, CmH.prototype);
      }
    };
    bmH = class bmH extends XX {
      name = "ServiceUnavailableException";
      $fault = "server";
      constructor(H) {
        super({ name: "ServiceUnavailableException", $fault: "server", ...H });
        Object.setPrototypeOf(this, bmH.prototype);
      }
    };
