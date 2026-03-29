    Bj = class Bj extends Error {
      constructor(H, _) {
        super(H);
        (this.errorUri = _), (this.name = this.constructor.name);
      }
      toResponseObject() {
        let H = { error: this.errorCode, error_description: this.message };
        if (this.errorUri) H.error_uri = this.errorUri;
        return H;
      }
      get errorCode() {
        return this.constructor.errorCode;
      }
    };
    mV_ = class mV_ extends Bj {};
    mV_.errorCode = "invalid_request";
    mLH = class mLH extends Bj {};
    mLH.errorCode = "invalid_client";
    o8H = class o8H extends Bj {};
    o8H.errorCode = "invalid_grant";
    pLH = class pLH extends Bj {};
    pLH.errorCode = "unauthorized_client";
    pV_ = class pV_ extends Bj {};
    pV_.errorCode = "unsupported_grant_type";
    BV_ = class BV_ extends Bj {};
    BV_.errorCode = "invalid_scope";
    gV_ = class gV_ extends Bj {};
    gV_.errorCode = "access_denied";
    id = class id extends Bj {};
    id.errorCode = "server_error";
    BLH = class BLH extends Bj {};
    BLH.errorCode = "temporarily_unavailable";
    dV_ = class dV_ extends Bj {};
    dV_.errorCode = "unsupported_response_type";
    cV_ = class cV_ extends Bj {};
    cV_.errorCode = "unsupported_token_type";
    FV_ = class FV_ extends Bj {};
    FV_.errorCode = "invalid_token";
    UV_ = class UV_ extends Bj {};
    UV_.errorCode = "method_not_allowed";
    gLH = class gLH extends Bj {};
    gLH.errorCode = "too_many_requests";
    dLH = class dLH extends Bj {};
    dLH.errorCode = "invalid_client_metadata";
    QV_ = class QV_ extends Bj {};
    QV_.errorCode = "insufficient_scope";
    lV_ = class lV_ extends Bj {};
    lV_.errorCode = "invalid_target";
    CR7 = {
      [mV_.errorCode]: mV_,
      [mLH.errorCode]: mLH,
      [o8H.errorCode]: o8H,
      [pLH.errorCode]: pLH,
      [pV_.errorCode]: pV_,
      [BV_.errorCode]: BV_,
      [gV_.errorCode]: gV_,
      [id.errorCode]: id,
      [BLH.errorCode]: BLH,
      [dV_.errorCode]: dV_,
      [cV_.errorCode]: cV_,
      [FV_.errorCode]: FV_,
      [UV_.errorCode]: UV_,
      [gLH.errorCode]: gLH,
      [dLH.errorCode]: dLH,
      [QV_.errorCode]: QV_,
      [lV_.errorCode]: lV_,
    };
