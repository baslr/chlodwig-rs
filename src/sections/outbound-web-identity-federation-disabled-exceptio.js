    lw_();
    TpH = class TpH extends VM {
      name = "ExpiredTokenException";
      $fault = "client";
      constructor(H) {
        super({ name: "ExpiredTokenException", $fault: "client", ...H });
        Object.setPrototypeOf(this, TpH.prototype);
      }
    };
    zpH = class zpH extends VM {
      name = "MalformedPolicyDocumentException";
      $fault = "client";
      constructor(H) {
        super({ name: "MalformedPolicyDocumentException", $fault: "client", ...H });
        Object.setPrototypeOf(this, zpH.prototype);
      }
    };
    ApH = class ApH extends VM {
      name = "PackedPolicyTooLargeException";
      $fault = "client";
      constructor(H) {
        super({ name: "PackedPolicyTooLargeException", $fault: "client", ...H });
        Object.setPrototypeOf(this, ApH.prototype);
      }
    };
    fpH = class fpH extends VM {
      name = "RegionDisabledException";
      $fault = "client";
      constructor(H) {
        super({ name: "RegionDisabledException", $fault: "client", ...H });
        Object.setPrototypeOf(this, fpH.prototype);
      }
    };
    wpH = class wpH extends VM {
      name = "IDPRejectedClaimException";
      $fault = "client";
      constructor(H) {
        super({ name: "IDPRejectedClaimException", $fault: "client", ...H });
        Object.setPrototypeOf(this, wpH.prototype);
      }
    };
    YpH = class YpH extends VM {
      name = "InvalidIdentityTokenException";
      $fault = "client";
      constructor(H) {
        super({ name: "InvalidIdentityTokenException", $fault: "client", ...H });
        Object.setPrototypeOf(this, YpH.prototype);
      }
    };
    DpH = class DpH extends VM {
      name = "IDPCommunicationErrorException";
      $fault = "client";
      constructor(H) {
        super({ name: "IDPCommunicationErrorException", $fault: "client", ...H });
        Object.setPrototypeOf(this, DpH.prototype);
      }
    };
    jpH = class jpH extends VM {
      name = "InvalidAuthorizationMessageException";
      $fault = "client";
      constructor(H) {
        super({ name: "InvalidAuthorizationMessageException", $fault: "client", ...H });
        Object.setPrototypeOf(this, jpH.prototype);
      }
    };
    MpH = class MpH extends VM {
      name = "ExpiredTradeInTokenException";
      $fault = "client";
      constructor(H) {
        super({ name: "ExpiredTradeInTokenException", $fault: "client", ...H });
        Object.setPrototypeOf(this, MpH.prototype);
      }
    };
    JpH = class JpH extends VM {
      name = "JWTPayloadSizeExceededException";
      $fault = "client";
      constructor(H) {
        super({ name: "JWTPayloadSizeExceededException", $fault: "client", ...H });
        Object.setPrototypeOf(this, JpH.prototype);
      }
    };
    PpH = class PpH extends VM {
      name = "OutboundWebIdentityFederationDisabledException";
      $fault = "client";
      constructor(H) {
        super({ name: "OutboundWebIdentityFederationDisabledException", $fault: "client", ...H });
        Object.setPrototypeOf(this, PpH.prototype);
      }
    };
    XpH = class XpH extends VM {
      name = "SessionDurationEscalationException";
      $fault = "client";
      constructor(H) {
        super({ name: "SessionDurationEscalationException", $fault: "client", ...H });
        Object.setPrototypeOf(this, XpH.prototype);
      }
    };
